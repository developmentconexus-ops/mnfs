import { A3_RUN_MATRIX } from './a3-admission.mjs';

export function buildA3ExecutionPlan() {
  return A3_RUN_MATRIX.map(condition => Object.freeze({
    ...condition,
    requiresE2B: condition.fixture === 'coding-effectiveness',
    primaryActorRuns: 1,
  }));
}

export function buildMastraHistoryMessages(
  history,
  { conditionId, threadId, resourceId, baseTime = '2026-08-18T12:00:00.000Z' },
) {
  const base = Date.parse(baseTime);
  if (!Number.isFinite(base)) throw new TypeError('baseTime must be a valid ISO timestamp');

  return history.map((entry, index) => ({
    id: `a3-${conditionId}-history-${String(index + 1).padStart(4, '0')}`,
    threadId,
    resourceId,
    role: entry.role,
    type: 'v2',
    createdAt: new Date(base + index * 1000),
    content: {
      format: 2,
      parts: [{ type: 'text', text: entry.text }],
    },
  }));
}

export function extractLatestAssistantText(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== 'assistant') continue;
    const parts = Array.isArray(message?.content?.parts) ? message.content.parts : [];
    return parts
      .filter(part => part?.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('');
  }
  return '';
}

export function summarizeA3Events(events) {
  const summary = {
    toolCalls: 0,
    toolErrors: 0,
    observationStarts: 0,
    observationEnds: 0,
    observationFailures: 0,
    reflectionStarts: 0,
    reflectionEnds: 0,
    reflectionFailures: 0,
    lastUsage: null,
  };

  for (const event of events) {
    switch (event?.type) {
      case 'tool_start':
        summary.toolCalls += 1;
        break;
      case 'tool_end':
        if (event.isError === true) summary.toolErrors += 1;
        break;
      case 'om_observation_start':
        summary.observationStarts += 1;
        break;
      case 'om_observation_end':
        summary.observationEnds += 1;
        break;
      case 'om_observation_failed':
        summary.observationFailures += 1;
        break;
      case 'om_reflection_start':
        summary.reflectionStarts += 1;
        break;
      case 'om_reflection_end':
        summary.reflectionEnds += 1;
        break;
      case 'om_reflection_failed':
        summary.reflectionFailures += 1;
        break;
      case 'usage_update':
        summary.lastUsage = event.usage ?? null;
        break;
      default:
        break;
    }
  }

  return summary;
}

export function calculateSpendDelta(before, after) {
  const start = before?.limitRemaining;
  const end = after?.limitRemaining;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (end > start) return null;
  return Math.round((start - end) * 1_000_000) / 1_000_000;
}
