import { S1_CRITERIA } from './contract.mjs';

const STATUS_VALUES = new Set(['PASS', 'FAIL', 'BLOCKED', 'UNKNOWN', 'REJECT']);

function normalizeResults(results) {
  if (Array.isArray(results)) return new Map(results.map((result) => [result?.id, result]));
  if (results && typeof results === 'object') {
    return new Map(Object.entries(results).map(([id, value]) => [id, {
      id,
      ...(typeof value === 'string' ? { status: value } : value),
    }]));
  }
  return new Map();
}

function resultStatus(result) {
  return STATUS_VALUES.has(result?.status) ? result.status : 'UNKNOWN';
}

export function deriveCandidateVerdict({ criterionResults, requiredCriteria = S1_CRITERIA } = {}) {
  const results = normalizeResults(criterionResults);
  const allResults = [...results.values()];
  const rejected = allResults.filter((result) => resultStatus(result) === 'REJECT');
  if (rejected.length > 0) {
    return {
      verdict: 'REJECT',
      reasons: rejected.map((result) => `${result.id ?? '<missing>'} is REJECT`),
    };
  }

  const required = [...new Set(requiredCriteria)];
  const failed = required
    .map((id) => ({ id, result: results.get(id) }))
    .filter(({ result }) => resultStatus(result) === 'FAIL');
  if (failed.length > 0) {
    return {
      verdict: 'FAIL',
      reasons: failed.map(({ id }) => `${id} is FAIL`),
    };
  }

  const unavailable = required
    .map((id) => ({ id, result: results.get(id) }))
    .filter(({ result }) => resultStatus(result) !== 'PASS');
  if (unavailable.length > 0) {
    return {
      verdict: 'BLOCKED',
      reasons: unavailable.map(({ id, result }) => `${id} proof unavailable (${resultStatus(result)})`),
    };
  }

  return { verdict: 'PASS', reasons: [] };
}
