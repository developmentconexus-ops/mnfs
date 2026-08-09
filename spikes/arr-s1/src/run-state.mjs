import { createHash } from 'node:crypto';
import { deriveCandidateVerdict } from './evaluate.mjs';

export const RUN_PHASES = Object.freeze(['CREATED', 'READY', 'RUNNING', 'OBSERVED', 'FINALIZED']);

const NEXT_PHASE = new Map([
  ['CREATED', 'READY'],
  ['READY', 'RUNNING'],
  ['RUNNING', 'OBSERVED'],
  ['OBSERVED', 'FINALIZED'],
]);
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function sha256Json(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')}`;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function clone(value) {
  return structuredClone(value);
}

function assertBinding(input) {
  if (!input || typeof input !== 'object') throw new TypeError('S1 run binding is required');
  if (typeof input.candidateShape !== 'string' || input.candidateShape.length === 0) {
    throw new TypeError('S1 candidate shape binding is required');
  }
  for (const key of ['contractHash', 'fixtureHash', 'sourceTreeHash']) {
    if (!HASH_PATTERN.test(input[key] ?? '')) throw new TypeError(`S1 ${key} is invalid`);
  }
}

export function validateRunState(state) {
  const errors = [];
  if (!state || typeof state !== 'object' || Array.isArray(state)) return ['state must be an object'];
  if (state.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (typeof state.runId !== 'string' || state.runId.length === 0) errors.push('runId is invalid');
  if (!RUN_PHASES.includes(state.phase)) errors.push('phase is invalid');
  let bindingValid = true;
  try { assertBinding(state.binding); } catch (error) { bindingValid = false; errors.push(error.message); }
  if (bindingValid && state.runKey !== sha256Json(state.binding)) errors.push('runKey is not bound to candidate shape and hashes');
  if (bindingValid && state.candidateShape !== state.binding.candidateShape) errors.push('candidateShape is not bound to run binding');
  if (!Array.isArray(state.observations)) errors.push('observations must be an array');
  if (state.verdict !== null && !['PASS', 'FAIL', 'BLOCKED', 'REJECT'].includes(state.verdict)) {
    errors.push('verdict is invalid');
  }
  if (!Number.isSafeInteger(state.resumeCount) || state.resumeCount < 0) errors.push('resumeCount is invalid');
  if (state.interrupted !== null && (typeof state.interrupted !== 'object' || state.interrupted.reopenable !== true)) {
    errors.push('interrupted state must be reopenable');
  }
  return errors;
}

export function createRunState({ runId, candidateShape, contractHash, fixtureHash, sourceTreeHash }) {
  const binding = { candidateShape, contractHash, fixtureHash, sourceTreeHash };
  assertBinding(binding);
  const state = {
    schemaVersion: 1,
    runId,
    phase: 'CREATED',
    candidateShape,
    binding,
    runKey: sha256Json(binding),
    observations: [],
    checkpoints: {
      cancellation: 'NOT_RUN',
      processDeath: 'NOT_RUN',
      freshRecovery: 'NOT_RUN',
    },
    interrupted: null,
    resumeCount: 0,
    verdict: null,
  };
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  return deepFreeze(state);
}

function nextState(state, patch = {}) {
  const candidate = { ...clone(state), ...clone(patch) };
  const errors = validateRunState(candidate);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  return deepFreeze(candidate);
}

export function transitionRunState(state, nextPhase) {
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  if (NEXT_PHASE.get(state.phase) !== nextPhase) {
    throw new TypeError(`invalid S1 phase transition: ${state.phase} -> ${nextPhase}`);
  }
  if (state.interrupted?.reopenable) throw new TypeError('reopen interrupted S1 run before advancing');
  return nextState(state, { phase: nextPhase });
}

export function recordRunObservations(state, { observations, checkpoints } = {}) {
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  if (state.phase !== 'RUNNING') throw new TypeError('S1 observations require RUNNING state');
  if (state.interrupted?.reopenable) throw new TypeError('reopen interrupted S1 run before recording observations');
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new TypeError('S1 observations must contain at least one observation');
  }
  return nextState(state, {
    observations: [...state.observations, ...clone(observations)],
    checkpoints: { ...state.checkpoints, ...(checkpoints ?? {}) },
  });
}

export function interruptRunState(state, { checkpoint, reason } = {}) {
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  if (state.phase === 'FINALIZED') throw new TypeError('finalized S1 run cannot be interrupted');
  if (typeof checkpoint !== 'string' || checkpoint.length === 0) throw new TypeError('interruption checkpoint is required');
  return nextState(state, {
    interrupted: { checkpoint, reason: reason ?? null, reopenable: true },
  });
}

export function reopenRunState(state) {
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  if (state.phase === 'FINALIZED') throw new TypeError('finalized S1 run cannot be reopened');
  if (!state.interrupted?.reopenable) throw new TypeError('S1 run has no reopenable interruption');
  return nextState(state, { interrupted: null, resumeCount: state.resumeCount + 1 });
}

export function finalizeRunState(state, { criterionResults, requiredCriteria } = {}) {
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  if (state.phase !== 'OBSERVED') throw new TypeError('S1 run must be OBSERVED before finalization');
  if (state.interrupted?.reopenable) throw new TypeError('reopen interrupted S1 run before finalization');
  if (!Array.isArray(state.observations) || state.observations.length === 0) {
    throw new TypeError('required observations are unavailable');
  }
  if (!Array.isArray(criterionResults) || criterionResults.length === 0) {
    throw new TypeError('required observations are unavailable: criterion results are required');
  }
  const derived = deriveCandidateVerdict({ criterionResults, requiredCriteria });
  return nextState(state, {
    phase: 'FINALIZED',
    verdict: derived.verdict,
    verdictReasons: derived.reasons,
    criterionResults,
    interrupted: null,
  });
}

export function createRunLedger() {
  const runs = new Map();
  return {
    get(candidateShape) { return runs.get(candidateShape) ?? null; },
    values() { return [...runs.values()]; },
    _runs: runs,
  };
}

export function registerRun(ledger, state) {
  if (!ledger?._runs || !state || typeof state.candidateShape !== 'string') {
    throw new TypeError('S1 run ledger and state are required');
  }
  const errors = validateRunState(state);
  if (errors.length > 0) throw new TypeError(`invalid S1 run state: ${errors.join('; ')}`);
  if (ledger._runs.has(state.candidateShape)) {
    throw new Error(`S1 run for candidate shape ${state.candidateShape} is already registered`);
  }
  ledger._runs.set(state.candidateShape, state);
  return state;
}
