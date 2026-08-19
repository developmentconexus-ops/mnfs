import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { createTool } from '@mastra/core/tools';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';
import { z } from 'zod';

function deterministicLocalModel(role, counters) {
  return {
    specificationVersion: 'v2',
    provider: 'conexus-local-fixture',
    modelId: `${role}-local-model`,
    supportedUrls: {},
    async doGenerate() {
      counters.modelFixtureCalls += 1;
      return {
        content: [{ type: 'text', text: role }],
        finishReason: 'stop',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        warnings: []
      };
    },
    async doStream() {
      throw new Error('BT-5N deterministic fixture uses generate() only');
    }
  };
}

export async function createRoleFixture({
  role,
  connectionString,
  schemaName,
  pubsub,
  counters
}) {
  if (role !== 'builder' && role !== 'par') {
    throw new Error(`BT-5N unsupported role: ${role}`);
  }
  if (!connectionString) throw new Error('TEST_DATABASE_URL is required');
  if (!pubsub) throw new Error('BT-5N requires an explicit role PubSub');

  const agentKey = `${role}Agent`;
  const toolKey = `${role}Tool`;
  const workflowKey = `${role}Workflow`;
  const memoryKey = `${role}Memory`;
  const agentId = `${role}-agent`;
  const toolId = `${role}-tool`;
  const workflowId = `${role}-workflow`;
  const memoryId = `${role}-memory`;
  const requestedScheduleId = `${role}-schedule`;

  const store = new PostgresStore({
    id: `${role}-bt5n-store`,
    connectionString,
    schemaName
  });
  await store.init();

  let mastra;
  try {
    const memory = new Memory({
      id: memoryId,
      storage: store,
      vector: false,
      options: {
        lastMessages: 50,
        semanticRecall: false,
        workingMemory: { enabled: false },
        observationalMemory: false,
        generateTitle: false
      }
    });

    const tool = createTool({
      id: toolId,
      description: `Return the ${role} role identity.`,
      inputSchema: z.object({}),
      outputSchema: z.object({ role: z.string() }),
      execute: async () => {
        counters.toolCalls += 1;
        return { role };
      }
    });

    const workflowInputSchema = z.object({ marker: z.string() });
    const workflowOutputSchema = z.object({
      marker: z.string(),
      role: z.string()
    });
    const workflowStep = createStep({
      id: `${role}-workflow-step`,
      inputSchema: workflowInputSchema,
      outputSchema: workflowOutputSchema,
      execute: async ({ inputData }) => {
        counters.workflowExecutions += 1;
        counters.workflowRoles.push(role);
        return { marker: inputData.marker, role };
      }
    });
    const workflow = createWorkflow({
      id: workflowId,
      inputSchema: workflowInputSchema,
      outputSchema: workflowOutputSchema
    }).then(workflowStep).commit();

    const agent = new Agent({
      id: agentId,
      name: `${role} BT-5N Agent`,
      instructions: `Return only the attached ${role} fixture identity.`,
      model: deterministicLocalModel(role, counters),
      tools: { [toolKey]: tool },
      memory,
      editor: false
    });

    mastra = new Mastra({
      logger: false,
      storage: store,
      pubsub,
      workers: [],
      scheduler: { enabled: false },
      agents: { [agentKey]: agent },
      tools: { [toolKey]: tool },
      workflows: { [workflowKey]: workflow },
      memory: { [memoryKey]: memory }
    });

    const schedule = await mastra.schedules.create({
      id: requestedScheduleId,
      workflowId,
      cron: '0 0 1 1 *',
      timezone: 'UTC',
      inputData: { marker: role }
    });

    let closed = false;
    return {
      mastra,
      store,
      pubsub,
      agent,
      workflow,
      tool,
      memory,
      scheduleId: schedule.id,
      close: async () => {
        if (closed) return;
        closed = true;
        await mastra.stopWorkers();
        await pubsub.close();
        await store.close();
      }
    };
  } catch (error) {
    await mastra?.stopWorkers().catch(() => {});
    await pubsub.close().catch(() => {});
    await store.close().catch(() => {});
    throw error;
  }
}
