import { requireRunId } from './paths.mjs';

export const RUN_PHASES = Object.freeze(['CREATED', 'OBSERVING', 'OBSERVED', 'FINALIZED']);
const SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/u;
const NEXT_PHASE = new Map([
  ['CREATED', 'OBSERVING'],
  ['OBSERVING', 'OBSERVED'],
  ['OBSERVED', 'FINALIZED'],
]);

export function validateRunState(state) {
  const errors = [];
  if (!state || typeof state !== 'object' || Array.isArray(state)) return ['state must be an object'];
  try { requireRunId(state.runId); } catch { errors.push('runId is invalid'); }
  if (!RUN_PHASES.includes(state.phase)) errors.push('phase is invalid');
  if (state.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!state.source || !SHA_PATTERN.test(state.source.commitSha ?? '')) errors.push('source.commitSha is invalid');
  if (!state.source || !SHA_PATTERN.test(state.source.treeSha ?? '')) errors.push('source.treeSha is invalid');
  if (!state.plan || !VERSION_PATTERN.test(state.plan.version ?? '')) errors.push('plan.version is invalid');
  if (!state.plan || !DIGEST_PATTERN.test(state.plan.hash ?? '')) errors.push('plan.hash is invalid');
  if (!state.contract || !VERSION_PATTERN.test(state.contract.version ?? '')) errors.push('contract.version is invalid');
  if (!state.contract || !DIGEST_PATTERN.test(state.contract.hash ?? '')) errors.push('contract.hash is invalid');
  return errors;
}

export function createInitialRunState({ runId, source, plan, contract }) {
  const state = {
    schemaVersion: 1,
    runId,
    phase: 'CREATED',
    source: structuredClone(source),
    plan: structuredClone(plan),
    contract: structuredClone(contract),
  };
  const errors = validateRunState(state);
  if (errors.length) throw new TypeError(`invalid ARR-S0 initial run state: ${errors.join('; ')}`);
  return state;
}

export function transitionRunState(state, nextPhase) {
  const errors = validateRunState(state);
  if (errors.length) throw new TypeError(`invalid ARR-S0 run state: ${errors.join('; ')}`);
  if (NEXT_PHASE.get(state.phase) !== nextPhase) {
    throw new TypeError(`invalid ARR-S0 phase transition: ${state.phase} -> ${nextPhase}`);
  }
  return { ...structuredClone(state), phase: nextPhase };
}
