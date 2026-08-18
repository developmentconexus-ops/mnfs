import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createCodingAgent } from '@mastra/core/coding-agent';
import { AgentController } from '@mastra/core/agent-controller';
import { WORKSPACE_TOOLS, Workspace } from '@mastra/core/workspace';
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';
import { createOpenRouter } from '@openrouter/ai-sdk-provider-v6';
import {
  A3_RUN_MATRIX,
  ACTOR_MODEL,
  ACTOR_PROVIDER_OPTIONS,
  OM_MODEL,
  OM_PROVIDER_OPTIONS,
  QUALIFIED_E2B_TEMPLATE_ID,
  validateOpenRouterKeyMetadata,
  validateReturnedRoute,
} from './a3-admission.mjs';
import {
  AUTHORITY_FINAL_TASK,
  CODING_FINAL_TASK,
  CODING_FIXTURE_FILES,
  CODING_HISTORY,
  buildAuthorityHistory,
  scoreAuthorityAnswer,
  scoreCodingResult,
} from './a3-fixtures.mjs';
import {
  buildMastraHistoryMessages,
  calculateSpendDelta,
  extractLatestAssistantText,
  summarizeA3Events,
} from './a3-runner.mjs';
import {
  buildConditionRuntimeConfig,
  buildMemoryOptions,
  extractProviderMetadata,
  scoreA3Condition,
} from './a3-live.mjs';
import { ConexusWriteE2BSandbox } from './physical-incarnation-guard.mjs';

const databaseUrl = process.env.TEST_DATABASE_URL;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const e2bApiKey = process.env.E2B_API_KEY;
const resultPath = process.env.A3_RESULT_PATH ?? path.resolve('a3-cognition-result.json');

if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required for A3 live execution');
if (!openRouterApiKey) throw new Error('OPENROUTER_API_KEY is required for A3 live execution');
if (!e2bApiKey) throw new Error('E2B_API_KEY is required for A3 coding conditions');

const ACTOR_SLUG = ACTOR_MODEL.replace(/^openrouter\//, '');
const OM_SLUG = OM_MODEL.replace(/^openrouter\//, '');
const CODING_ROOT = '/home/user/a3-fixture';
const RUN_TIMEOUT_MS = 4 * 60 * 1000;
const OM_SETTLE_MS = 30_000;

function schemaName(conditionId) {
  return `mastra_a3_${conditionId.toLowerCase()}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
}

async function fetchKeyEnvelope() {
  const response = await fetch('https://openrouter.ai/api/v1/key', {
    headers: { Authorization: `Bearer ${openRouterApiKey}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`OpenRouter key metadata request failed: HTTP ${response.status}`);
  }
  return validateOpenRouterKeyMetadata(await response.json());
}

function createModels() {
  const openrouter = createOpenRouter({
    apiKey: openRouterApiKey,
    compatibility: 'strict',
    appName: 'Conexus 3L A3',
  });

  return {
    actor: openrouter(ACTOR_SLUG, ACTOR_PROVIDER_OPTIONS.openrouter),
    om: openrouter(OM_SLUG, OM_PROVIDER_OPTIONS.openrouter),
  };
}

function createWorkspace(condition) {
  if (!condition.requiresE2B) return { workspace: undefined, sandbox: undefined };

  const sandbox = new ConexusWriteE2BSandbox({
    id: `conexus-a3-${condition.id.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`,
    template: QUALIFIED_E2B_TEMPLATE_ID,
    apiKey: e2bApiKey,
    timeout: RUN_TIMEOUT_MS,
    metadata: { 'conexus-probe': `3l-a3-${condition.id.toLowerCase()}` },
  });

  const workspace = new Workspace({
    id: `a3-workspace-${condition.id.toLowerCase()}`,
    sandbox,
    tools: {
      [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: {
        name: 'execute_command',
        requireApproval: false,
        maxOutputTokens: 4000,
      },
      [WORKSPACE_TOOLS.SANDBOX.GET_PROCESS_OUTPUT]: {
        name: 'get_process_output',
        requireApproval: false,
        maxOutputTokens: 2000,
      },
      [WORKSPACE_TOOLS.SANDBOX.KILL_PROCESS]: {
        name: 'kill_process',
        requireApproval: false,
      },
    },
  });

  return { workspace, sandbox };
}

async function seedCodingFixture(sandbox) {
  await sandbox.ensureRunning();
  await sandbox.e2b.commands.run(`rm -rf ${CODING_ROOT} && mkdir -p ${CODING_ROOT}/src ${CODING_ROOT}/test`);

  for (const [relativePath, content] of Object.entries(CODING_FIXTURE_FILES)) {
    await sandbox.e2b.files.write(`${CODING_ROOT}/${relativePath}`, content);
  }

  await sandbox.e2b.commands.run(
    `cd ${CODING_ROOT} && git init -q && git config user.email a3@conexus.local && git config user.name 'Conexus A3' && git add . && git commit -qm baseline`,
  );

  let baselineExit = 0;
  try {
    await sandbox.e2b.commands.run(`cd ${CODING_ROOT} && npm test`);
  } catch {
    baselineExit = 1;
  }
  if (baselineExit === 0) throw new Error('A3 coding fixture baseline unexpectedly passed');
}

async function verifyCodingFixture(sandbox) {
  let testExitCode = 0;
  try {
    await sandbox.e2b.commands.run(`cd ${CODING_ROOT} && npm test`);
  } catch {
    testExitCode = 1;
  }

  const changed = await sandbox.e2b.commands.run(`cd ${CODING_ROOT} && git diff --name-only`);
  const changedPaths = changed.stdout.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const finalFile = await sandbox.e2b.files.read(`${CODING_ROOT}/src/budget.mjs`);
  const diff = await sandbox.e2b.commands.run(`cd ${CODING_ROOT} && git diff -- src/budget.mjs`);

  return {
    score: scoreCodingResult({ changedPaths, testExitCode, finalFile }),
    changedPaths,
    testExitCode,
    finalFile,
    diff: diff.stdout,
  };
}

async function persistHistory(store, history, condition) {
  const memoryStore = await store.getStore('memory');
  if (!memoryStore) throw new Error('A3 Postgres store did not expose memory domain');
  const threadId = `a3-thread-${condition.id.toLowerCase()}`;
  const resourceId = `a3-resource-${condition.id.toLowerCase()}`;
  const messages = buildMastraHistoryMessages(history, {
    conditionId: condition.id,
    threadId,
    resourceId,
  });
  await memoryStore.saveMessages({ messages });
  return { threadId, resourceId };
}

function latestAssistantMetadata(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== 'assistant') continue;
    const metadata = message?.content?.metadata ?? null;
    const parts = Array.isArray(message?.content?.parts) ? message.content.parts : [];
    const step = [...parts].reverse().find(part => part?.type === 'step-start');
    return {
      returnedModel: step?.model ?? metadata?.modelId ?? null,
      providerMetadata: metadata?.providerMetadata ?? metadata?.provider ?? null,
    };
  }
  return { returnedModel: null, providerMetadata: null };
}

async function waitForOmSettled(events) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < OM_SETTLE_MS) {
    const summary = summarizeA3Events(events);
    const started = summary.observationStarts + summary.reflectionStarts;
    const settled =
      summary.observationEnds +
      summary.observationFailures +
      summary.reflectionEnds +
      summary.reflectionFailures;
    if (started > 0 && settled >= started) return summary;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  return summarizeA3Events(events);
}

async function runCondition(conditionSpec, models) {
  const condition = buildConditionRuntimeConfig(conditionSpec.id);
  const beforeSpend = await fetchKeyEnvelope();
  const store = new PostgresStore({
    id: `a3-store-${condition.id.toLowerCase()}`,
    connectionString: databaseUrl,
    schemaName: schemaName(condition.id),
  });
  await store.init();

  const { workspace, sandbox } = createWorkspace(condition);
  const memory = new Memory({
    storage: store,
    vector: false,
    options: buildMemoryOptions({ omEnabled: condition.omEnabled, omModel: models.om }),
  });

  const agent = createCodingAgent({
    id: `a3-actor-${condition.id.toLowerCase()}`,
    name: `A3 Actor ${condition.id}`,
    model: models.actor,
    maxRetries: 0,
    errorProcessors: [],
    workspace: undefined,
    instructions: [
      'You are the Conexus Builder qualification actor.',
      'Current explicit authority always overrides older conversation history.',
      'Do not invent requirements. Finish the requested task and nothing unrelated.',
      condition.requiresE2B
        ? `The coding repository is ${CODING_ROOT}. Use execute_command for repository reads, edits and npm test.`
        : 'This condition is answer-only; do not request tools.',
    ].join('\n'),
  });

  const controller = new AgentController({
    id: `a3-controller-${condition.id.toLowerCase()}`,
    storage: store,
    memory,
    workspace,
    agent,
    defaultModeId: 'build',
    disableBuiltinTools: ['ask_user', 'submit_plan', 'task_write', 'task_update', 'task_complete', 'task_check', 'subagent'],
    initialState: { yolo: true },
    modes: [
      {
        id: 'build',
        metadata: { default: true },
        defaultModelId: ACTOR_MODEL,
        availableTools: condition.requiresE2B ? ['execute_command'] : [],
      },
    ],
  });

  const events = [];
  const start = Date.now();
  let unsubscribe;

  try {
    await controller.init();
    if (sandbox) await seedCodingFixture(sandbox);

    const history = condition.fixture === 'authority-currentness' ? buildAuthorityHistory() : CODING_HISTORY;
    const ids = await persistHistory(store, history, condition);
    const session = await controller.createSession({
      id: `a3-session-${condition.id.toLowerCase()}`,
      ownerId: `a3-owner-${condition.id.toLowerCase()}`,
      resourceId: ids.resourceId,
      threadId: ids.threadId,
    });

    unsubscribe = session.subscribe(event => events.push(event));

    const finalTask =
      condition.fixture === 'authority-currentness'
        ? AUTHORITY_FINAL_TASK
        : `${CODING_FINAL_TASK}\nWorking directory: ${CODING_ROOT}`;

    await session.sendMessage({ content: finalTask });
    const eventSummary = condition.omEnabled ? await waitForOmSettled(events) : summarizeA3Events(events);
    const messages = await session.thread.listActiveMessages();
    const answer = extractLatestAssistantText(messages);
    const actorUsage = session.getTokenUsage();

    let correctness;
    let coding = null;
    if (condition.fixture === 'authority-currentness') {
      correctness = scoreAuthorityAnswer(answer);
    } else {
      coding = await verifyCodingFixture(sandbox);
      correctness = coding.score;
    }

    const returned = latestAssistantMetadata(messages);
    if (returned.returnedModel || returned.providerMetadata) {
      validateReturnedRoute({
        requestedModel: ACTOR_SLUG,
        returnedModel: returned.returnedModel,
        expectedProvider: 'anthropic',
        providerMetadata: returned.providerMetadata,
      });
    }

    const afterSpend = await fetchKeyEnvelope().catch(() => null);
    const spendDeltaUsd = calculateSpendDelta(beforeSpend, afterSpend);
    const scored = scoreA3Condition({ condition, correctness, eventSummary, spendDeltaUsd });

    return {
      condition,
      correctness,
      admissibility: scored,
      actorUsage,
      eventSummary,
      wallClockMs: Date.now() - start,
      spend: {
        beforeRemainingUsd: beforeSpend.limitRemaining,
        afterRemainingUsd: afterSpend?.limitRemaining ?? null,
        deltaUsd: spendDeltaUsd,
      },
      routeEvidence: {
        requestedModel: ACTOR_SLUG,
        returnedModel: returned.returnedModel,
        provider: extractProviderMetadata({ providerMetadata: returned.providerMetadata }),
      },
      answer: condition.fixture === 'authority-currentness' ? answer : undefined,
      coding,
      omUsage: null,
      omUsageNote: condition.omEnabled
        ? 'Exact Observer/Reflector billable usage is MISSING unless exposed natively; aggregate spend and OM cycle evidence are preserved.'
        : 'OM disabled for this condition.',
    };
  } finally {
    try {
      unsubscribe?.();
    } catch {
      // no-op
    }
    try {
      await workspace?.destroy();
    } catch {
      try {
        await sandbox?.destroy();
      } catch {
        // evidence runner cleanup is best-effort after primary result/error
      }
    }
    await store.close().catch(() => undefined);
  }
}

async function main() {
  const initialEnvelope = await fetchKeyEnvelope();
  console.log(`A3_OPENROUTER_LIMIT_USD=${initialEnvelope.limit}`);
  console.log(`A3_OPENROUTER_REMAINING_USD=${initialEnvelope.limitRemaining}`);

  const models = createModels();
  const results = [];

  for (const condition of A3_RUN_MATRIX) {
    console.log(`A3_CONDITION_START=${condition.id}`);
    try {
      const result = await Promise.race([
        runCondition(condition, models),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`A3 condition ${condition.id} exceeded ${RUN_TIMEOUT_MS}ms`)), RUN_TIMEOUT_MS),
        ),
      ]);
      results.push(result);
      console.log(
        `A3_CONDITION_RESULT=${JSON.stringify({
          id: result.condition.id,
          correctness: result.correctness.pass,
          admissible: result.admissibility.admissible,
          reason: result.admissibility.reason,
          wallClockMs: result.wallClockMs,
          spendDeltaUsd: result.spend.deltaUsd,
          actorUsage: result.actorUsage,
          omEvents: result.eventSummary,
          coding: result.coding
            ? {
                testExitCode: result.coding.testExitCode,
                changedPaths: result.coding.changedPaths,
                pass: result.coding.score.pass,
              }
            : null,
        })}`,
      );
    } catch (error) {
      results.push({
        condition: buildConditionRuntimeConfig(condition.id),
        executionError: error instanceof Error ? error.message : String(error),
        admissibility: { admissible: false, reason: 'EXECUTION_INTERRUPTED', spendDeltaUsd: null },
      });
      console.error(`A3_CONDITION_ERROR=${condition.id}:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const finalEnvelope = await fetchKeyEnvelope().catch(() => null);
  const record = {
    generatedAt: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    experiment: 'CX-BUILDER-COGNITION-01',
    initialEnvelope,
    finalEnvelope,
    totalObservedSpendUsd: calculateSpendDelta(initialEnvelope, finalEnvelope),
    results,
  };

  await fs.writeFile(resultPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  console.log(`A3_RESULT_PATH=${resultPath}`);
  console.log(`A3_PRIMARY_RUNS_COMPLETED=${results.filter(result => !result.executionError).length}`);

  if (results.some(result => result.executionError)) {
    process.exitCode = 1;
  }
}

await main();
