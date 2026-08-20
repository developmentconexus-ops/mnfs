import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');

function schemaName(label) {
  return `mastra_bt2_${label}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

async function createMemory(label) {
  const store = new PostgresStore({
    id: `bt2-${label}`,
    connectionString,
    schemaName: schemaName(label)
  });
  await store.init();
  const memory = new Memory({
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
  return { store, memory };
}

function message({ id, threadId, resourceId, text, second = 0 }) {
  return {
    id,
    threadId,
    resourceId,
    role: 'user',
    type: 'v2',
    createdAt: new Date(`2026-08-19T12:00:0${second}.000Z`),
    content: { format: 2, parts: [{ type: 'text', text }] }
  };
}

function texts(messages) {
  return messages.map((entry) => entry.content.parts[0].text).sort();
}

test('BT-2 uses exact PostgreSQL 17.10 with advanced memory disabled', async () => {
  const { store } = await createMemory('version');
  try {
    const row = await store.db.one('show server_version');
    assert.match(row.server_version, /^17\.10(?:\s|$)/u);
  } finally {
    await store.close();
  }
});

test('BT-2 negative control exhibits leakage from an insufficient shared key', async () => {
  const { store, memory } = await createMemory('negative');
  try {
    const weakThreadId = 'project-agent-subject';
    const weakResourceId = 'subject';
    await memory.createThread({ threadId: weakThreadId, resourceId: weakResourceId });
    await memory.saveMessages({
      messages: [
        message({
          id: 'weak-a',
          threadId: weakThreadId,
          resourceId: weakResourceId,
          text: 'logical-conversation-a'
        }),
        message({
          id: 'weak-b',
          threadId: weakThreadId,
          resourceId: weakResourceId,
          text: 'logical-conversation-b',
          second: 1
        })
      ]
    });

    const logicalConversationB = await memory.recall({
      threadId: weakThreadId,
      resourceId: weakResourceId
    });
    assert.deepEqual(texts(logicalConversationB.messages), [
      'logical-conversation-a',
      'logical-conversation-b'
    ]);
  } finally {
    await store.close();
  }
});

test('BT-2 explicit thread/resource identities isolate history and reject mismatched ownership', async () => {
  const { store, memory } = await createMemory('isolation');
  try {
    await memory.createThread({ threadId: 'workspace-a-conversation', resourceId: 'workspace-a-subject' });
    await memory.createThread({ threadId: 'workspace-b-conversation', resourceId: 'workspace-b-subject' });
    await memory.saveMessages({
      messages: [
        message({
          id: 'isolated-a',
          threadId: 'workspace-a-conversation',
          resourceId: 'workspace-a-subject',
          text: 'workspace-a-only'
        }),
        message({
          id: 'isolated-b',
          threadId: 'workspace-b-conversation',
          resourceId: 'workspace-b-subject',
          text: 'workspace-b-only',
          second: 1
        })
      ]
    });

    const historyA = await memory.recall({
      threadId: 'workspace-a-conversation',
      resourceId: 'workspace-a-subject'
    });
    const historyB = await memory.recall({
      threadId: 'workspace-b-conversation',
      resourceId: 'workspace-b-subject'
    });
    assert.deepEqual(texts(historyA.messages), ['workspace-a-only']);
    assert.deepEqual(texts(historyB.messages), ['workspace-b-only']);
    await assert.rejects(
      memory.recall({
        threadId: 'workspace-b-conversation',
        resourceId: 'workspace-a-subject'
      }),
      /is for resource with id workspace-b-subject but resource workspace-a-subject was queried/u
    );
  } finally {
    await store.close();
  }
});

test('BT-2 distinguishes thread-scoped history from resource-scoped enumeration', async () => {
  const { store, memory } = await createMemory('scope');
  try {
    const resourceId = 'shared-resource';
    await memory.createThread({ threadId: 'thread-one', resourceId });
    await memory.createThread({ threadId: 'thread-two', resourceId });
    await memory.saveMessages({
      messages: [
        message({ id: 'scope-one', threadId: 'thread-one', resourceId, text: 'thread-one-only' }),
        message({
          id: 'scope-two',
          threadId: 'thread-two',
          resourceId,
          text: 'thread-two-only',
          second: 1
        })
      ]
    });

    const threadHistory = await memory.recall({ threadId: 'thread-one', resourceId });
    const resourceHistory = await memory.listMessagesByResourceId({ resourceId });
    assert.deepEqual(texts(threadHistory.messages), ['thread-one-only']);
    assert.deepEqual(texts(resourceHistory.messages), ['thread-one-only', 'thread-two-only']);
  } finally {
    await store.close();
  }
});
