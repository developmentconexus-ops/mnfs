import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { EventEmitterPubSub } from '@mastra/core/events';
import { Mastra } from '@mastra/core/mastra';
import { Scheduler, createStep, createWorkflow } from '@mastra/core/workflows';
import { PostgresStore } from '@mastra/pg';
import { z } from 'zod';
import { emitBt4nResult, receiveNativeScheduleOccurrence } from '../fixtures/bt4n-child.mjs';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');

const WORKFLOW_ID = 'bt4n-native-par-ingress';
const CREATE_SCHEDULE_ID = 'bt4n-native-slot';
const SCHEDULE_ID = 'schedule_bt4n-native-slot';
const SCHEDULED_FIRE_AT = Date.parse('2026-01-01T00:00:00.000Z');
const EXPECTED_RUN_ID = `sched_${SCHEDULE_ID}_${SCHEDULED_FIRE_AT}`;
const FORBIDDEN_COUNTERS = [
  'productAgentExecutions',
  'modelCalls',
  'businessToolCalls',
  'providerCalls',
  'e2bCalls',
  'realExternalEffects'
];

function zeroCounters() {
  return Object.fromEntries(FORBIDDEN_COUNTERS.map((key) => [key, 0]));
}

function assertNoForbiddenExecution(observation) {
  for (const key of FORBIDDEN_COUNTERS) {
    assert.equal(observation[key], 0, `BT-4N forbids ${key}`);
  }
}

function twoPartyBarrier() {
  let arrivals = 0;
  let release;
  const released = new Promise((resolve) => {
    release = resolve;
  });

  return async () => {
    arrivals += 1;
    if (arrivals === 2) release();
    await released;
  };
}

function synchronizeDueRead(store, waitForBoth) {
  return {
    async listDueSchedules(...args) {
      const due = await store.listDueSchedules(...args);
      await waitForBoth();
      return due;
    },
    updateScheduleNextFire: store.updateScheduleNextFire.bind(store),
    recordTrigger: store.recordTrigger.bind(store)
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function withTimeout(promise, label, timeoutMs = 20_000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const handle = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
      handle.unref?.();
    })
  ]);
}

async function waitForWorkflowSuccess(workflow, runId, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const run = await workflow.getWorkflowRunById(runId);
    if (run?.status === 'success') return run;
    if (run && ['failed', 'tripwire', 'canceled'].includes(run.status)) {
      throw new Error(`BT-4N workflow ended with ${run.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('BT-4N workflow terminal snapshot timed out');
}

test('BT-4N RED guard rejects any forbidden execution counter', () => {
  const scheduledObservation = zeroCounters();

  for (const key of FORBIDDEN_COUNTERS) {
    assert.throws(
      () => assertNoForbiddenExecution({ ...scheduledObservation, [key]: 1 }),
      new RegExp(`BT-4N forbids ${key}`, 'u')
    );
  }

  assertNoForbiddenExecution(scheduledObservation);
});

test('BT-4N native scheduler presents one stable slot to deterministic PAR ingress', async () => {
  const schemaName = `mastra_bt4n_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
  const observation = {
    syntheticParIngressCount: 0,
    presentations: [],
    ...zeroCounters()
  };
  const ingressCompleted = deferred();
  const redeliveryCompleted = deferred();
  const redeliveries = [];

  const ingressStep = createStep({
    id: 'bt4n-synthetic-par-ingress',
    inputSchema: z.object({ scheduleId: z.string() }),
    outputSchema: z.object({
      stableOccurrenceMaterial: z.object({
        scheduleId: z.string(),
        scheduledFireAt: z.number(),
        logicalOccurrenceId: z.string(),
        runId: z.string()
      }),
      syntheticParIngressCount: z.number()
    }),
    execute: async ({ inputData, runId }) => {
      try {
        const evidence = receiveNativeScheduleOccurrence({
          scheduleId: inputData.scheduleId,
          runId
        }, observation);
        ingressCompleted.resolve(evidence);
        return evidence;
      } catch (error) {
        ingressCompleted.reject(error);
        throw error;
      }
    }
  });

  const workflow = createWorkflow({
    id: WORKFLOW_ID,
    inputSchema: z.object({ scheduleId: z.string() }),
    outputSchema: ingressStep.outputSchema,
    schedule: {
      cron: '0 0 1 1 *',
      timezone: 'UTC',
      inputData: { scheduleId: SCHEDULE_ID }
    }
  }).then(ingressStep).commit();

  const pubsub = new EventEmitterPubSub();
  const store = new PostgresStore({
    id: 'bt4n-native-scheduler',
    connectionString,
    schemaName
  });
  const mastra = new Mastra({
    storage: store,
    pubsub,
    workers: [],
    scheduler: { enabled: false },
    workflows: { bt4nNativeParIngress: workflow }
  });

  const redeliveryObserver = async (event, ack, nack) => {
    if (event.type !== 'workflow.start' || event.runId !== EXPECTED_RUN_ID) {
      await ack?.();
      return;
    }

    redeliveries.push({
      eventId: event.id,
      runId: event.runId,
      dataRunId: event.data?.runId,
      deliveryAttempt: event.deliveryAttempt
    });

    if (redeliveries.length === 1) {
      await nack?.();
      return;
    }

    await ack?.();
    redeliveryCompleted.resolve();
  };

  let schedulerA;
  let schedulerB;
  try {
    await store.init();
    const version = await store.db.one('show server_version');
    assert.match(version.server_version, /^17\.10(?:\s|$)/u);

    const created = await mastra.schedules.create({
      id: CREATE_SCHEDULE_ID,
      workflowId: WORKFLOW_ID,
      cron: '0 * * * * *',
      timezone: 'UTC',
      inputData: { scheduleId: SCHEDULE_ID }
    });
    assert.equal(created.id, SCHEDULE_ID);

    const schedulesStore = await store.getStore('schedules');
    assert.ok(schedulesStore, 'PostgresStore must expose the native schedules domain');
    await schedulesStore.updateSchedule(SCHEDULE_ID, { nextFireAt: SCHEDULED_FIRE_AT });

    await pubsub.subscribe('workflows', redeliveryObserver, { group: 'bt4n-redelivery-probe' });
    await mastra.startWorkers();

    const waitForBoth = twoPartyBarrier();
    const ready = (target) => target.type === 'workflow' && target.workflowId === WORKFLOW_ID;
    schedulerA = new Scheduler({
      schedulesStore: synchronizeDueRead(schedulesStore, waitForBoth),
      pubsub,
      config: { batchSize: 1, isTargetReady: ready }
    });
    schedulerB = new Scheduler({
      schedulesStore: synchronizeDueRead(schedulesStore, waitForBoth),
      pubsub,
      config: { batchSize: 1, isTargetReady: ready }
    });

    await Promise.all([schedulerA.tick(), schedulerB.tick()]);
    const ingressEvidence = await withTimeout(ingressCompleted.promise, 'BT-4N ingress');
    await withTimeout(redeliveryCompleted.promise, 'BT-4N redelivery');
    await pubsub.flush();
    const workflowRun = await waitForWorkflowSuccess(workflow, EXPECTED_RUN_ID);

    const triggers = await schedulesStore.listTriggers(SCHEDULE_ID);
    const storedSchedule = await schedulesStore.getSchedule(SCHEDULE_ID);

    assert.equal(triggers.length, 1);
    assert.equal(triggers[0].scheduleId, SCHEDULE_ID);
    assert.equal(triggers[0].scheduledFireAt, SCHEDULED_FIRE_AT);
    assert.equal(triggers[0].runId, EXPECTED_RUN_ID);
    assert.equal(storedSchedule?.lastRunId, EXPECTED_RUN_ID);
    assert.equal(workflowRun.status, 'success');
    assert.equal(observation.syntheticParIngressCount, 1);
    assert.equal(observation.presentations.length, 1);
    assert.deepEqual(ingressEvidence.stableOccurrenceMaterial, {
      scheduleId: SCHEDULE_ID,
      scheduledFireAt: SCHEDULED_FIRE_AT,
      logicalOccurrenceId: `${SCHEDULE_ID}:${SCHEDULED_FIRE_AT}`,
      runId: EXPECTED_RUN_ID
    });

    assert.equal(redeliveries.length, 2);
    assert.deepEqual(redeliveries.map((entry) => entry.deliveryAttempt), [1, 2]);
    assert.equal(new Set(redeliveries.map((entry) => entry.runId)).size, 1);
    assert.equal(new Set(redeliveries.map((entry) => entry.dataRunId)).size, 1);
    assert.equal(redeliveries[0].runId, EXPECTED_RUN_ID);
    assertNoForbiddenExecution(observation);

    const result = {
      probe: 'BT-4N',
      postgresVersion: version.server_version,
      nativeScheduleClaim: 'PASS',
      stableOccurrenceMaterial: ingressEvidence.stableOccurrenceMaterial,
      concurrentTickResult: {
        contenders: 2,
        dueSlotSeenByBoth: true,
        nativeTriggerCount: triggers.length,
        syntheticIngressCount: observation.syntheticParIngressCount,
        claimedRunId: storedSchedule.lastRunId
      },
      duplicateRedeliveryResult: {
        presentations: redeliveries.length,
        deliveryAttempts: redeliveries.map((entry) => entry.deliveryAttempt),
        stableLogicalRunIds: new Set(redeliveries.map((entry) => entry.runId)).size,
        sameLogicalOccurrence: true
      },
      syntheticParIngressCount: observation.syntheticParIngressCount,
      ...Object.fromEntries(FORBIDDEN_COUNTERS.map((key) => [key, observation[key]])),
      verdict: 'PASS_NATIVE_SCHEDULE_INGRESS',
      limitations: [
        'The deterministic workflow ingress derives scheduleId and scheduledFireAt from the exact pinned public runId format; it does not create a durable Conexus ScheduleOccurrence record.'
      ]
    };

    emitBt4nResult(result);
  } finally {
    await schedulerA?.stop();
    await schedulerB?.stop();
    await pubsub.unsubscribe('workflows', redeliveryObserver);
    await mastra.stopWorkers();
    await pubsub.close();
    await store.close();
  }
});
