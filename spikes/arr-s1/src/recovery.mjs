import { readFile } from 'node:fs/promises';

import { writeJsonArtifact, verifyArtifactRecords } from './artifacts.mjs';
import {
  createRunState,
  recordRunObservations,
  transitionRunState,
  validateRunState,
} from './run-state.mjs';

function clone(value) {
  return structuredClone(value);
}

function sharedBinding(binding, candidateShape) {
  return {
    candidateShape,
    contractHash: binding.contractHash,
    fixtureHash: binding.fixtureHash,
    sourceTreeHash: binding.sourceTreeHash,
  };
}

export async function persistCandidateRecoveryState({
  runRoot,
  binding,
  candidateShape,
  observations,
  checkpoints,
} = {}) {
  if (typeof runRoot !== 'string' || !binding || typeof binding.runId !== 'string' || typeof candidateShape !== 'string') return null;
  const bound = sharedBinding(binding, candidateShape);
  const anchorPayload = {
    schemaVersion: 1,
    kind: 'MNFS_TRUSTED_OBSERVATION_ANCHOR',
    candidateShape,
    binding: bound,
    observations: clone(observations ?? []),
  };
  const anchor = await writeJsonArtifact(
    runRoot,
    `state/candidates/${candidateShape}/observations.json`,
    anchorPayload,
    { binding, kind: 'state-anchor' },
  );
  let state = createRunState({
    runId: binding.runId,
    candidateShape,
    contractHash: binding.contractHash,
    fixtureHash: binding.fixtureHash,
    sourceTreeHash: binding.sourceTreeHash,
  });
  state = transitionRunState(state, 'READY');
  state = transitionRunState(state, 'RUNNING');
  state = recordRunObservations(state, {
    observations: [{
      type: 'TRUSTED_OBSERVATION_ANCHOR',
      artifact: { id: anchor.id, path: anchor.path, sha256: anchor.sha256 },
    }],
    checkpoints: { ...(checkpoints ?? {}) },
  });
  state = transitionRunState(state, 'OBSERVED');
  const stateRecord = await writeJsonArtifact(
    runRoot,
    `state/candidates/${candidateShape}/run-state.json`,
    state,
    { binding, kind: 'run-state' },
  );
  return Object.freeze({ state, records: Object.freeze([anchor, stateRecord]) });
}

export async function reopenCandidateRecoveryState({ runRoot, binding, candidateShape, records } = {}) {
  const integrity = await verifyArtifactRecords(runRoot, records, binding);
  if (!integrity.ok) return { stateReopened: false, evidenceHashesValid: false, bindingMatches: false, errors: integrity.errors };
  const stateRecord = records?.find((record) => record?.path === `state/candidates/${candidateShape}/run-state.json`);
  const anchorRecord = records?.find((record) => record?.path === `state/candidates/${candidateShape}/observations.json`);
  if (!stateRecord || !anchorRecord) return { stateReopened: false, evidenceHashesValid: false, bindingMatches: false, errors: ['recovery state records are incomplete'] };
  const state = JSON.parse(await readFile(`${runRoot}/${stateRecord.path}`, 'utf8'));
  const anchor = JSON.parse(await readFile(`${runRoot}/${anchorRecord.path}`, 'utf8'));
  const stateErrors = validateRunState(state);
  const expectedBinding = sharedBinding(binding, candidateShape);
  const bindingMatches = JSON.stringify(state.binding) === JSON.stringify(expectedBinding)
    && JSON.stringify(anchor.binding) === JSON.stringify(expectedBinding)
    && state.candidateShape === candidateShape
    && state.phase === 'OBSERVED'
    && state.observations.some((observation) => observation?.artifact?.id === anchorRecord.id
      && observation.artifact.sha256 === anchorRecord.sha256);
  return {
    stateReopened: stateErrors.length === 0 && bindingMatches,
    evidenceHashesValid: integrity.ok,
    bindingMatches,
    errors: [...integrity.errors, ...stateErrors],
    state,
    anchor,
  };
}
