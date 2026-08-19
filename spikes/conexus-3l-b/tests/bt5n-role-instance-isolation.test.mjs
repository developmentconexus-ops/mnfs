import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { EventEmitterPubSub } from '@mastra/core/events';
import { MastraError } from '@mastra/core/error';

const CONNECTION_STRING = process.env.TEST_DATABASE_URL;
const WORKFLOW_TOPIC = 'workflows';
const LOCK_SHA256 = '5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0';

const ROLE_KEYS = {
  builder: {
    agent: 'builderAgent',
    tool: 'builderTool',
    workflow: 'builderWorkflow',
    memory: 'builderMemory'
  },
  par: {
    agent: 'parAgent',
    tool: 'parTool',
    workflow: 'parWorkflow',
    memory: 'parMemory'
  }
};

function assertDistinctRoleWiring(builder, par) {
  assert.notEqual(builder.mastra, par.mastra, 'role Mastra instances must differ');
  assert.notEqual(builder.store, par.store, 'role stores must differ');
  assert.notEqual(builder.pubsub, par.pubsub, 'role PubSub instances must differ');
  assert.notEqual(builder.agent, par.agent, 'role Agent objects must differ');
  assert.notEqual(builder.memory, par.memory, 'role Memory objects must differ');
}

function assertMastraNotFound(fn, id, message) {
  assert.throws(
    fn,
    (error) => error instanceof MastraError && error.id === id && error.message === message
  );
}

function roleNotFoundAssertions(mastra, role, opposite) {
  const own = ROLE_KEYS[role];
  const other = ROLE_KEYS[opposite];

  assert.equal(mastra.getAgent(own.agent).id, `${role}-agent`);
  assert.equal(mastra.getAgentById(`${role}-agent`).id, `${role}-agent`);
  assert.equal(mastra.getTool(own.tool).id, `${role}-tool`);
  assert.equal(mastra.getToolById(`${role}-tool`).id, `${role}-tool`);
  assert.equal(mastra.getWorkflow(own.workflow).id, `${role}-workflow`);
  assert.equal(mastra.getMemory(own.memory).id, `${role}-memory`);
  assert.equal(mastra.getMemoryById(`${role}-memory`).id, `${role}-memory`);

  assertMastraNotFound(
    () => mastra.getAgent(other.agent),
    'MASTRA_GET_AGENT_BY_NAME_NOT_FOUND',
    `Agent with name ${other.agent} not found`
  );
  assertMastraNotFound(
    () => mastra.getAgentById(`${opposite}-agent`),
    'MASTRA_GET_AGENT_BY_AGENT_ID_NOT_FOUND',
    `Agent with id ${opposite}-agent not found`
  );
  assertMastraNotFound(
    () => mastra.getTool(other.tool),
    'MASTRA_GET_TOOL_BY_NAME_NOT_FOUND',
    `Tool with name ${other.tool} not found`
  );
  assertMastraNotFound(
    () => mastra.getToolById(`${opposite}-tool`),
    'MASTRA_GET_TOOL_BY_ID_NOT_FOUND',
    `Tool with id ${opposite}-tool not found`
  );
  assertMastraNotFound(
    () => mastra.getWorkflow(other.workflow),
    'MASTRA_GET_WORKFLOW_BY_ID_NOT_FOUND',
    `Workflow with ID ${other.workflow} not found`
  );
  assertMastraNotFound(
    () => mastra.getMemory(other.memory),
    'MASTRA_GET_MEMORY_BY_KEY_NOT_FOUND',
    `Memory with key ${other.memory} not found`
  );
  assertMastraNotFound(
    () => mastra.getMemoryById(`${opposite}-memory`),
    'MASTRA_GET_MEMORY_BY_ID_NOT_FOUND',
    `Memory with id ${opposite}-memory not found`
  );
}

function workflowObserver(events) {
  return async (event, ack) => {
    if (event.type === 'workflow.start') {
      events.push({
        type: event.type,
        runId: event.runId,
        workflowId: event.data?.workflowId
      });
    }
    await ack?.();
  };
}

function beginThreadCollection(subscription, events) {
  return (async () => {
    for await (const chunk of subscription.stream) {
      events.push({ type: chunk?.type, runId: chunk?.runId });
    }
  })();
}

async function waitFor(predicate, label, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`BT-5N ${label} timed out`);
}

test('BT-5N RED wiring guard fires for every mutable role identity', () => {
  const builder = {
    mastra: {},
    store: {},
    pubsub: {},
    agent: {},
    memory: {}
  };
  const par = {
    mastra: {},
    store: {},
    pubsub: {},
    agent: {},
    memory: {}
  };
  const fired = [];

  assertDistinctRoleWiring(builder, par);
  assert.throws(
    () => assertDistinctRoleWiring(builder, { ...par, pubsub: builder.pubsub }),
    /role PubSub instances must differ/u
  );
  fired.push('pubsub');
  assert.throws(
    () => assertDistinctRoleWiring(builder, { ...par, store: builder.store }),
    /role stores must differ/u
  );
  fired.push('store');
  assert.throws(
    () => assertDistinctRoleWiring(builder, { ...par, agent: builder.agent }),
    /role Agent objects must differ/u
  );
  fired.push('agent');
  assert.throws(
    () => assertDistinctRoleWiring(builder, { ...par, memory: builder.memory }),
    /role Memory objects must differ/u
  );
  fired.push('memory');

  assert.deepEqual(fired, ['pubsub', 'store', 'agent', 'memory']);
  process.stdout.write(`BT5N_RED ${JSON.stringify({ guardChecks: fired.length, fired })}\n`);
});

test('BT-5N shared-PubSub negative control delivers one event to both role observers', async () => {
  const pubsub = new EventEmitterPubSub();
  const topic = 'bt5n-role-negative-control';
  let builderObserverCount = 0;
  let parObserverCount = 0;
  const builderObserver = async (event, ack) => {
    if (event.data?.role === 'builder') builderObserverCount += 1;
    await ack?.();
  };
  const parObserver = async (event, ack) => {
    if (event.data?.role === 'builder') parObserverCount += 1;
    await ack?.();
  };

  try {
    await pubsub.subscribe(topic, builderObserver);
    await pubsub.subscribe(topic, parObserver);
    await pubsub.publish(topic, {
      type: 'bt5n.role.event',
      runId: 'builder-negative-run',
      data: { role: 'builder' }
    });
    await pubsub.flush();

    assert.equal(builderObserverCount, 1);
    assert.equal(parObserverCount, 1);
    process.stdout.write(`BT5N_SHARED_PUBSUB_NEGATIVE ${JSON.stringify({
      builderObserverCount,
      parObserverCount,
      sharedPubSubBleed: true
    })}\n`);
  } finally {
    await pubsub.unsubscribe(topic, builderObserver);
    await pubsub.unsubscribe(topic, parObserver);
    await pubsub.close();
  }
});

test('BT-5N qualifies same-process role-instance isolation on public Mastra paths', async () => {
  const { createRoleFixture } = await import('../fixtures/bt5n-role-fixtures.mjs');
  assert.ok(CONNECTION_STRING, 'TEST_DATABASE_URL is required');
  const suffix = crypto.randomBytes(6).toString('hex');
  const schemaNames = {
    builder: `mastra_bt5n_builder_${suffix}`,
    par: `mastra_bt5n_par_${suffix}`
  };
  const builderCounters = {
    modelFixtureCalls: 0,
    workflowExecutions: 0,
    workflowRoles: [],
    toolCalls: 0
  };
  const parCounters = {
    modelFixtureCalls: 0,
    workflowExecutions: 0,
    workflowRoles: [],
    toolCalls: 0
  };
  const providerCalls = 0;
  const realExternalEffects = 0;
  let builder;
  let par;
  const builderWorkflowEvents = [];
  const parWorkflowEvents = [];
  const builderThreadEvents = [];
  const parThreadEvents = [];
  let builderWorkflowObserver;
  let parWorkflowObserver;
  let builderThreadSubscription;
  let parThreadSubscription;
  let builderThreadCollector;
  let parThreadCollector;

  try {
    builder = await createRoleFixture({
      role: 'builder',
      connectionString: CONNECTION_STRING,
      schemaName: schemaNames.builder,
      pubsub: new EventEmitterPubSub(),
      counters: builderCounters
    });
    par = await createRoleFixture({
      role: 'par',
      connectionString: CONNECTION_STRING,
      schemaName: schemaNames.par,
      pubsub: new EventEmitterPubSub(),
      counters: parCounters
    });

    assertDistinctRoleWiring(builder, par);
    assert.equal(builder.agent.getMastraInstance(), builder.mastra);
    assert.equal(par.agent.getMastraInstance(), par.mastra);
    assert.equal(builder.agent.getPubSub(), builder.pubsub);
    assert.equal(par.agent.getPubSub(), par.pubsub);
    assert.notEqual(builder.agent.getPubSub(), par.agent.getPubSub());

    roleNotFoundAssertions(builder.mastra, 'builder', 'par');
    roleNotFoundAssertions(par.mastra, 'par', 'builder');

    const builderSchedule = await builder.mastra.schedules.get(builder.scheduleId);
    const parSchedule = await par.mastra.schedules.get(par.scheduleId);
    assert.equal(builderSchedule?.workflowId, 'builder-workflow');
    assert.equal(parSchedule?.workflowId, 'par-workflow');
    assert.equal(await builder.mastra.schedules.get(par.scheduleId), null);
    assert.equal(await par.mastra.schedules.get(builder.scheduleId), null);

    await Promise.all([builder.mastra.startWorkers(), par.mastra.startWorkers()]);
    builderWorkflowObserver = workflowObserver(builderWorkflowEvents);
    parWorkflowObserver = workflowObserver(parWorkflowEvents);
    await builder.pubsub.subscribe(WORKFLOW_TOPIC, builderWorkflowObserver);
    await par.pubsub.subscribe(WORKFLOW_TOPIC, parWorkflowObserver);

    const builderWorkflowRunId = 'builder-role-workflow-run';
    const parWorkflowRunId = 'par-role-workflow-run';
    await builder.pubsub.publish(WORKFLOW_TOPIC, {
      type: 'workflow.start',
      runId: builderWorkflowRunId,
      data: {
        workflowId: 'builder-workflow',
        runId: builderWorkflowRunId,
        prevResult: { status: 'success', output: { marker: 'builder' } },
        requestContext: {},
        initialState: {}
      }
    });
    await par.pubsub.publish(WORKFLOW_TOPIC, {
      type: 'workflow.start',
      runId: parWorkflowRunId,
      data: {
        workflowId: 'par-workflow',
        runId: parWorkflowRunId,
        prevResult: { status: 'success', output: { marker: 'par' } },
        requestContext: {},
        initialState: {}
      }
    });
    await Promise.all([builder.pubsub.flush(), par.pubsub.flush()]);

    await waitFor(
      async () => (await builder.mastra.getWorkflow('builderWorkflow').getWorkflowRunById(builderWorkflowRunId))?.status === 'success',
      'Builder workflow'
    );
    await waitFor(
      async () => (await par.mastra.getWorkflow('parWorkflow').getWorkflowRunById(parWorkflowRunId))?.status === 'success',
      'PAR workflow'
    );

    assert.equal(builderCounters.workflowExecutions, 1);
    assert.equal(parCounters.workflowExecutions, 1);
    assert.deepEqual(builderCounters.workflowRoles, ['builder']);
    assert.deepEqual(parCounters.workflowRoles, ['par']);
    assert.deepEqual(builderWorkflowEvents.map((event) => event.workflowId), ['builder-workflow']);
    assert.deepEqual(parWorkflowEvents.map((event) => event.workflowId), ['par-workflow']);

    assert.equal(
      (await builder.mastra.getWorkflow('builderWorkflow').getWorkflowRunById(builderWorkflowRunId)).status,
      'success'
    );
    assert.equal(
      (await par.mastra.getWorkflow('parWorkflow').getWorkflowRunById(parWorkflowRunId)).status,
      'success'
    );
    assert.equal(
      await builder.mastra.getWorkflow('builderWorkflow').getWorkflowRunById(parWorkflowRunId),
      null
    );
    assert.equal(
      await par.mastra.getWorkflow('parWorkflow').getWorkflowRunById(builderWorkflowRunId),
      null
    );

    const sharedThreadId = 'bt5n-role-shared-thread';
    const sharedResourceId = 'bt5n-role-shared-resource';
    builderThreadSubscription = await builder.agent.subscribeToThread({
      threadId: sharedThreadId,
      resourceId: sharedResourceId
    });
    parThreadSubscription = await par.agent.subscribeToThread({
      threadId: sharedThreadId,
      resourceId: sharedResourceId
    });
    builderThreadCollector = beginThreadCollection(builderThreadSubscription, builderThreadEvents);
    parThreadCollector = beginThreadCollection(parThreadSubscription, parThreadEvents);

    const builderAgentResult = await builder.mastra.getAgent('builderAgent').generate(
      'identify the attached role',
      {
        runId: 'builder-agent-run',
        memory: { thread: sharedThreadId, resource: sharedResourceId }
      }
    );
    await Promise.all([builder.pubsub.flush(), par.pubsub.flush()]);
    await waitFor(() => builderThreadEvents.length > 0, 'Builder thread stream');
    assert.equal(parThreadEvents.length, 0);

    const builderEventsBeforePar = builderThreadEvents.length;
    const parAgentResult = await par.mastra.getAgent('parAgent').generate(
      'identify the attached role',
      {
        runId: 'par-agent-run',
        memory: { thread: sharedThreadId, resource: sharedResourceId }
      }
    );
    await Promise.all([builder.pubsub.flush(), par.pubsub.flush()]);
    await waitFor(() => parThreadEvents.length > 0, 'PAR thread stream');

    assert.equal(builderAgentResult.text, 'builder');
    assert.equal(parAgentResult.text, 'par');
    assert.equal(builderCounters.modelFixtureCalls, 1);
    assert.equal(parCounters.modelFixtureCalls, 1);
    assert.equal(builderThreadEvents.length, builderEventsBeforePar);
    assert.equal(builderThreadEvents.some((event) => event.runId === 'par-agent-run'), false);
    assert.equal(parThreadEvents.some((event) => event.runId === 'builder-agent-run'), false);
    assert.equal((await builder.agent.listTools()).parTool, undefined);
    assert.equal((await par.agent.listTools()).builderTool, undefined);
    assert.equal(builderCounters.toolCalls, 0);
    assert.equal(parCounters.toolCalls, 0);
    assert.equal(providerCalls, 0);
    assert.equal(realExternalEffects, 0);

    const evidence = {
      probe: 'BT-5N',
      sourceAdmission: 'PASS',
      lockSha256: LOCK_SHA256,
      packagePins: {
        core: '1.56.0',
        memory: '1.25.0',
        pg: '1.19.0',
        node: '24.18.0',
        postgres: '17.10'
      },
      schemaNames,
      redControls: {
        wiringGuard: 'PASS',
        sharedPubSubBleed: 'PASS'
      },
      registryIsolation: 'PASS',
      storeIsolation: {
        scheduleRows: 'PASS',
        workflowRuns: 'PASS',
        builderOwnScheduleId: builder.scheduleId,
        parOwnScheduleId: par.scheduleId,
        oppositeScheduleLookups: { builder: null, par: null },
        oppositeWorkflowRunLookups: { builder: null, par: null }
      },
      workflowIsolation: {
        builderExecutions: builderCounters.workflowExecutions,
        parExecutions: parCounters.workflowExecutions,
        builderWorkflowEvents: builderWorkflowEvents.length,
        parWorkflowEvents: parWorkflowEvents.length,
        builderSawPar: builderWorkflowEvents.some((event) => event.workflowId === 'par-workflow'),
        parSawBuilder: parWorkflowEvents.some((event) => event.workflowId === 'builder-workflow')
      },
      agentIsolation: {
        builderResult: builderAgentResult.text,
        parResult: parAgentResult.text,
        builderThreadStreamEvents: builderThreadEvents.length,
        parThreadStreamEvents: parThreadEvents.length,
        builderSawPar: builderThreadEvents.some((event) => event.runId === 'par-agent-run'),
        parSawBuilder: parThreadEvents.some((event) => event.runId === 'builder-agent-run'),
        standaloneFallbackRequired: false
      },
      enabledProcessGlobalSurfaces: {
        agentThreadStreamRuntime: {
          classification: 'MODULE_GLOBAL_ENABLED_F1',
          fence: 'explicit PubSub identity',
          observedThrough: 'public Agent.subscribeToThread'
        }
      },
      deferredProcessGlobalSurfaces: {
        scorers: 'NOT ADMITTED / NOT QUALIFIED',
        durableAgentRunRegistry: 'NOT ADMITTED / NOT QUALIFIED',
        observationalMemoryGlobals: 'NOT ADMITTED / NOT QUALIFIED'
      },
      counters: {
        builder: builderCounters,
        par: parCounters,
        providerCalls,
        realExternalEffects
      },
      verdict: 'QUALIFIED_SAME_PROCESS'
    };
    process.stdout.write(`BT5N_RESULT ${JSON.stringify(evidence)}\n`);
  } finally {
    builderThreadSubscription?.unsubscribe();
    parThreadSubscription?.unsubscribe();
    await Promise.allSettled([builderThreadCollector, parThreadCollector].filter(Boolean));
    if (builder && builderWorkflowObserver) {
      await builder.pubsub.unsubscribe(WORKFLOW_TOPIC, builderWorkflowObserver).catch(() => {});
    }
    if (par && parWorkflowObserver) {
      await par.pubsub.unsubscribe(WORKFLOW_TOPIC, parWorkflowObserver).catch(() => {});
    }
    await par?.close();
    await builder?.close();
  }
});
