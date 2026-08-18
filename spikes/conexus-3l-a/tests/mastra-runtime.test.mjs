import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Agent } from '@mastra/core/agent';
import { AgentController } from '@mastra/core/agent-controller';
import { LocalFilesystem, Workspace } from '@mastra/core/workspace';
import { PostgresStore } from '@mastra/pg';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');

function schemaName(label) {
  return `mastra_builder_${label}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

async function createStore(schema, id) {
  const store = new PostgresStore({ id, connectionString, schemaName: schema });
  await store.init();
  return store;
}

function createFixtureWorkspace() {
  const basePath = fs.mkdtempSync(path.join(os.tmpdir(), 'conexus-3l-a1-'));
  return new Workspace({
    id: `a1-fixture-${crypto.randomUUID()}`,
    filesystem: new LocalFilesystem({ basePath }),
  });
}

async function createController(storage, { controllerId = 'builder-controller', defaultModelId = 'probe/current' } = {}) {
  const agent = new Agent({
    id: 'builder-probe-agent',
    name: 'Builder probe agent',
    instructions: 'Qualification probe only. No provider call is expected.',
    model: { provider: 'openai', name: 'gpt-4o', toolChoice: 'auto' },
  });

  const controller = new AgentController({
    id: controllerId,
    agent,
    storage,
    // A1 requires a valid AgentController Session workspace, but does not qualify
    // Builder workspace semantics. E2B remains exclusively in the A2 live track.
    workspace: createFixtureWorkspace(),
    defaultModeId: 'build',
    modes: [
      { id: 'build', name: 'Build', defaultModelId, metadata: { default: true } },
      { id: 'stale', name: 'Stale', defaultModelId: 'probe/stale-default' },
    ],
  });
  await controller.init();
  return controller;
}

function persistedMessage({ threadId, resourceId }) {
  return {
    id: 'message-1',
    threadId,
    resourceId,
    role: 'user',
    type: 'v2',
    createdAt: new Date('2026-08-18T12:00:00.000Z'),
    content: { format: 2, parts: [{ type: 'text', text: 'persistent-cognition-marker' }] },
  };
}

test('P1/P4: exact thread and stored messages survive clean controller + store recreation', async () => {
  const schema = schemaName('p1');
  const sessionArgs = {
    id: 'runtime-session-1',
    ownerId: 'builder-owner',
    resourceId: 'coding-session-1',
    threadId: 'coding-thread-1',
  };

  const firstStore = await createStore(schema, 'builder-store-first');
  const firstController = await createController(firstStore);
  const firstSession = await firstController.createSession(sessionArgs);
  assert.equal(firstSession.thread.getId(), sessionArgs.threadId);

  const memory = await firstStore.getStore('memory');
  assert.ok(memory, 'Mastra memory store must be available');
  await memory.saveMessages({ messages: [persistedMessage(sessionArgs)] });
  await firstStore.close();

  const secondStore = await createStore(schema, 'builder-store-second');
  const secondController = await createController(secondStore);
  const rebound = await secondController.createSession(sessionArgs);

  assert.equal(rebound.thread.getId(), sessionArgs.threadId);
  const messages = await rebound.thread.listActiveMessages();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].content.parts[0].text, 'persistent-cognition-marker');
  await secondStore.close();
});

test('P3: persisted stale mode/model survives restart but current dispatch can override it mechanically', async () => {
  const schema = schemaName('p3');
  const sessionArgs = {
    id: 'runtime-session-2',
    ownerId: 'builder-owner',
    resourceId: 'coding-session-2',
    threadId: 'coding-thread-2',
  };

  const firstStore = await createStore(schema, 'builder-store-poison');
  const firstController = await createController(firstStore);
  const firstSession = await firstController.createSession(sessionArgs);
  await firstSession.mode.switch({ modeId: 'stale' });
  await firstSession.model.switch({ modelId: 'probe/stale-model' });
  assert.equal(firstSession.mode.get(), 'stale');
  assert.equal(firstSession.model.get(), 'probe/stale-model');
  await firstStore.close();

  const secondStore = await createStore(schema, 'builder-store-current');
  const secondController = await createController(secondStore, { defaultModelId: 'probe/current-default' });
  const rebound = await secondController.createSession(sessionArgs);

  // This is the threat fixture: thread metadata restores stale runtime residue.
  assert.equal(rebound.mode.get(), 'stale');
  assert.equal(rebound.model.get(), 'probe/stale-model');

  // Current Conexus dispatch config is applied unconditionally through runtime APIs.
  await rebound.mode.switch({ modeId: 'build' });
  rebound.model.set({ modelId: 'probe/current-model' });
  assert.equal(rebound.mode.get(), 'build');
  assert.equal(rebound.model.get(), 'probe/current-model');

  await secondStore.close();
});
