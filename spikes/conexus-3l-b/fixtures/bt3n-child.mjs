import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { RequestContext } from '@mastra/core/request-context';
import { createTool } from '@mastra/core/tools';
import { PostgresStore } from '@mastra/pg';
import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';

const [mode, schemaName, authorityStatePath, effectStatePath, runId] = process.argv.slice(2);
const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');
if (!mode || !schemaName || !authorityStatePath || !effectStatePath || !runId) {
  throw new Error('mode, schemaName, authorityStatePath, effectStatePath, and runId are required');
}

let toolExecuteCount = 0;
let toolResult = null;

function result(value) {
  process.stdout.write(`BT3N_RESULT ${JSON.stringify(value)}\n`);
}

function hasToolResult(prompt) {
  return prompt.some((message) =>
    message.role === 'tool' || JSON.stringify(message.content).includes('tool-result')
  );
}

function deterministicModel() {
  return {
    specificationVersion: 'v2',
    provider: 'conexus-local-fixture',
    modelId: 'bt3n-local-model',
    supportedUrls: {},
    async doGenerate(options) {
      if (hasToolResult(options.prompt)) {
        return {
          content: [{ type: 'text', text: 'bt3n-complete' }],
          finishReason: 'stop',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          warnings: []
        };
      }
      return {
        content: [
          {
            type: 'tool-call',
            toolCallId: 'bt3n-tool-call',
            toolName: 'bt3n-governed-effect',
            input: JSON.stringify({ proposalId: 'proposal-42', amount: 7 })
          }
        ],
        finishReason: 'tool-calls',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        warnings: []
      };
    },
    async doStream() {
      throw new Error('BT-3N uses deterministic generate/approveToolCallGenerate only');
    }
  };
}

const governedTool = createTool({
  id: 'bt3n-governed-effect',
  description: 'A deterministic local effect guarded by current owner truth.',
  requireApproval: true,
  inputSchema: z.object({
    proposalId: z.string(),
    amount: z.number()
  }),
  execute: async (input, context) => {
    toolExecuteCount += 1;
    const authority = JSON.parse(await readFile(authorityStatePath, 'utf8'));
    const rawRequestContext = context.requestContext.toJSON();

    if (authority.decision !== 'ALLOW') {
      toolResult = {
        decision: 'DENIED_CURRENT_AUTHORITY',
        currentOwnerDecision: authority.decision,
        rawRequestContext,
        input
      };
      return toolResult;
    }

    const effect = JSON.parse(await readFile(effectStatePath, 'utf8'));
    effect.count += 1;
    await writeFile(effectStatePath, JSON.stringify(effect));

    toolResult = {
      decision: 'EFFECT_APPLIED',
      currentOwnerDecision: authority.decision,
      rawRequestContext,
      input
    };
    return toolResult;
  }
});

async function readEffectCount() {
  return JSON.parse(await readFile(effectStatePath, 'utf8')).count;
}

function compactSuspendedRuns(discovered) {
  return discovered.runs.map((run) => ({
    runId: run.runId,
    status: run.status,
    toolCalls: run.toolCalls
  }));
}

const store = new PostgresStore({
  id: `bt3n-${mode}`,
  connectionString,
  schemaName
});
await store.init();
const agent = new Agent({
  id: 'bt3n-direct-agent',
  name: 'BT-3N direct Agent',
  instructions: 'Call bt3n-governed-effect exactly once with the supplied deterministic proposal.',
  model: deterministicModel(),
  tools: { governedTool },
  editor: false
});
const mastra = new Mastra({ storage: store, agents: { bt3nDirectAgent: agent } });

try {
  if (mode === 'suspend') {
    const output = await agent.generate('apply the deterministic governed proposal', {
      runId,
      requestContext: new RequestContext([
        ['runtimeRole', 'PAR'],
        ['staleBusinessAuthority', 'ALLOW'],
        ['currentRole', 'OLD']
      ])
    });
    const discovered = await agent.listSuspendedRuns();
    const suspendedRun = discovered.runs.find((entry) => entry.runId === runId);
    result({
      mode,
      pid: process.pid,
      finishReason: output.finishReason,
      runId: output.runId,
      toolExecuteCount,
      originalArgs: suspendedRun?.toolCalls[0]?.args ?? null,
      suspendedRuns: compactSuspendedRuns(discovered),
      providerCalls: 0,
      e2bCalls: 0,
      realExternalEffects: 0
    });
  } else if (mode === 'approve' || mode === 'reject') {
    const discovered = await agent.listSuspendedRuns();
    const suspendedRun = discovered.runs.find((entry) => entry.runId === runId);
    if (!suspendedRun) throw new Error(`BT-3N suspended run ${runId} was not rediscovered`);
    const toolCall = suspendedRun.toolCalls[0];
    if (!toolCall?.toolCallId) throw new Error('BT-3N suspended tool call was not rediscovered');

    const approvalOptions = {
      runId: suspendedRun.runId,
      toolCallId: toolCall.toolCallId,
      requestContext: new RequestContext([
        ['runtimeRole', 'PAR'],
        ['currentRole', 'NEW']
      ])
    };
    const output = mode === 'approve'
      ? await agent.approveToolCallGenerate(approvalOptions)
      : await agent.declineToolCallGenerate(approvalOptions);

    result({
      mode,
      pid: process.pid,
      finishReason: output.finishReason,
      text: output.text,
      discoveredRunId: suspendedRun.runId,
      mechanicalApproval: mode === 'approve',
      approvedArgs: toolCall.args,
      toolExecuteCount,
      toolResult,
      currentOwnerDecision: toolResult?.currentOwnerDecision ?? null,
      rawRequestContext: toolResult?.rawRequestContext ?? null,
      effectCount: await readEffectCount(),
      remainingSuspendedRuns: (await agent.listSuspendedRuns()).total,
      providerCalls: 0,
      e2bCalls: 0,
      realExternalEffects: 0
    });
  } else {
    throw new Error(`unknown BT-3N child mode: ${mode}`);
  }
} finally {
  await mastra.stopWorkers?.();
  await store.close();
}
