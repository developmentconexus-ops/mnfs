import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildA3ExecutionPlan,
  buildMastraHistoryMessages,
  calculateSpendDelta,
  extractLatestAssistantText,
  summarizeA3Events,
} from '../src/a3-runner.mjs';

test('A3 runner plan contains exactly the admitted four paired conditions and only coding conditions require E2B', () => {
  const plan = buildA3ExecutionPlan();
  assert.deepEqual(plan.map(item => item.id), ['A0', 'A1', 'B0', 'B1']);
  assert.deepEqual(plan.map(item => item.om), [false, true, false, true]);
  assert.deepEqual(plan.map(item => item.requiresE2B), [false, false, true, true]);
  assert.equal(plan.every(item => item.primaryActorRuns === 1), true);
});

test('A3 history conversion produces deterministic persistent Mastra messages', () => {
  const history = [
    { role: 'user', text: 'first' },
    { role: 'assistant', text: 'second' },
    { role: 'user', text: 'current authority' },
  ];
  const messages = buildMastraHistoryMessages(history, {
    conditionId: 'A0',
    threadId: 'thread-a0',
    resourceId: 'resource-a0',
    baseTime: '2026-08-18T12:00:00.000Z',
  });

  assert.equal(messages.length, 3);
  assert.deepEqual(messages.map(message => message.id), ['a3-A0-history-0001', 'a3-A0-history-0002', 'a3-A0-history-0003']);
  assert.deepEqual(messages.map(message => message.role), ['user', 'assistant', 'user']);
  assert.equal(messages[0].threadId, 'thread-a0');
  assert.equal(messages[0].resourceId, 'resource-a0');
  assert.equal(messages[0].content.format, 2);
  assert.deepEqual(messages[0].content.parts, [{ type: 'text', text: 'first' }]);
  assert.equal(messages[1].createdAt.toISOString(), '2026-08-18T12:00:01.000Z');
});

test('A3 result extraction returns the latest assistant text without treating data-only parts as answer text', () => {
  const messages = [
    {
      role: 'assistant',
      content: { parts: [{ type: 'text', text: 'old answer' }] },
    },
    {
      role: 'assistant',
      content: {
        parts: [
          { type: 'data-om-status', data: { ignored: true } },
          { type: 'text', text: 'line one' },
          { type: 'text', text: '\nline two' },
        ],
      },
    },
  ];
  assert.equal(extractLatestAssistantText(messages), 'line one\nline two');
});

test('A3 event summary counts only observable Builder/OM execution evidence', () => {
  const events = [
    { type: 'tool_start', toolCallId: '1', toolName: 'execute_command' },
    { type: 'tool_end', toolCallId: '1', isError: false },
    { type: 'tool_start', toolCallId: '2', toolName: 'execute_command' },
    { type: 'tool_end', toolCallId: '2', isError: true },
    { type: 'om_observation_start', cycleId: 'obs-1' },
    { type: 'om_observation_end', cycleId: 'obs-1', durationMs: 120, tokensObserved: 9000, observationTokens: 600 },
    { type: 'om_reflection_start', cycleId: 'ref-1' },
    { type: 'om_reflection_failed', cycleId: 'ref-1', error: 'failed', durationMs: 50 },
    { type: 'usage_update', usage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 } },
  ];

  assert.deepEqual(summarizeA3Events(events), {
    toolCalls: 2,
    toolErrors: 1,
    observationStarts: 1,
    observationEnds: 1,
    observationFailures: 0,
    reflectionStarts: 1,
    reflectionEnds: 0,
    reflectionFailures: 1,
    lastUsage: { promptTokens: 100, completionTokens: 20, totalTokens: 120 },
  });
});

test('A3 spend delta preserves missingness and never invents zero cost', () => {
  assert.equal(calculateSpendDelta({ limitRemaining: 10 }, { limitRemaining: 9.75 }), 0.25);
  assert.equal(calculateSpendDelta(null, { limitRemaining: 9.75 }), null);
  assert.equal(calculateSpendDelta({ limitRemaining: 10 }, null), null);
  assert.equal(calculateSpendDelta({ limitRemaining: 9.5 }, { limitRemaining: 9.75 }), null);
});
