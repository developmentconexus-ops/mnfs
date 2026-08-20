import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { RequestContext } from '@mastra/core/request-context';
import { createTool } from '@mastra/core/tools';
import { PostgresStore } from '@mastra/pg';

const [mode, schemaName] = process.argv.slice(2);
const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');
if (!mode || !schemaName) throw new Error('mode and schemaName are required');

const observations = [];

function result(value) {
  process.stdout.write(`BT3_RESULT ${JSON.stringify(value)}\n`);
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
    modelId: 'bt3-local-model',
    supportedUrls: {},
    async doGenerate(options) {
      if (hasToolResult(options.prompt)) {
        return {
          content: [{ type: 'text', text: 'resumed-complete' }],
          finishReason: 'stop',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          warnings: []
        };
      }
      return {
        content: [
          {
            type: 'tool-call',
            toolCallId: 'bt3-tool-call',
            toolName: 'bt3-wait',
            input: '{}'
          }
        ],
        finishReason: 'tool-calls',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        warnings: []
      };
    },
    async doStream() {
      throw new Error('BT-3 uses deterministic generate/resumeGenerate only');
    }
  };
}

const waitTool = createTool({
  id: 'bt3-wait',
  description: 'Suspend once, then report the fresh resume RequestContext.',
  execute: async (_input, context) => {
    observations.push({
      requestContext: context.requestContext.toJSON(),
      resumeData: context.agent?.resumeData ?? null
    });
    if (!context.agent?.resumeData) {
      return await context.agent.suspend({ reason: 'BT-3 deterministic wait' });
    }
    return {
      currentRole: context.requestContext.get('currentRole'),
      unknownStaleKey: context.requestContext.get('unknownStaleKey') ?? null,
      resumed: true
    };
  }
});

const store = new PostgresStore({
  id: `bt3-${mode}`,
  connectionString,
  schemaName
});
await store.init();
const agent = new Agent({
  id: 'bt3-direct-agent',
  name: 'BT-3 direct Agent',
  instructions: 'Call bt3-wait exactly once and report its result.',
  model: deterministicModel(),
  tools: { bt3Wait: waitTool },
  editor: false
});
const mastra = new Mastra({ storage: store, agents: { bt3DirectAgent: agent } });

try {
  if (mode === 'suspend') {
    const output = await agent.generate('begin deterministic wait', {
      runId: 'bt3-suspended-run',
      requestContext: new RequestContext([
        ['currentRole', 'OLD'],
        ['unknownStaleKey', 'MUST_DISAPPEAR']
      ])
    });
    const discovered = await agent.listSuspendedRuns();
    result({
      mode,
      pid: process.pid,
      finishReason: output.finishReason,
      runId: output.runId,
      observations,
      suspendedRuns: discovered.runs.map((run) => ({
        runId: run.runId,
        status: run.status,
        toolCalls: run.toolCalls
      }))
    });
  } else if (mode === 'resume') {
    const discovered = await agent.listSuspendedRuns();
    const run = discovered.runs.find((entry) => entry.runId === 'bt3-suspended-run');
    if (!run) throw new Error('BT-3 suspended run was not rediscovered');
    const output = await agent.resumeGenerate(
      { approved: true },
      {
        runId: run.runId,
        toolCallId: run.toolCalls[0]?.toolCallId,
        requestContext: new RequestContext([['currentRole', 'NEW']])
      }
    );
    result({
      mode,
      pid: process.pid,
      discoveredRunId: run.runId,
      text: output.text,
      finishReason: output.finishReason,
      observations,
      remainingSuspendedRuns: (await agent.listSuspendedRuns()).total
    });
  } else {
    throw new Error(`unknown BT-3 child mode: ${mode}`);
  }
} finally {
  await mastra.stopWorkers?.();
  await store.close();
}
