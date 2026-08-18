import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildConditionRuntimeConfig,
  buildMemoryOptions,
  extractProviderMetadata,
  scoreA3Condition,
} from '../src/a3-live.mjs';

const authorityPass = {
  pass: true,
  staleAuthorityViolation: false,
  exactLineHits: 4,
  exactFourLines: true,
};

const codingPass = {
  pass: true,
  staleAuthorityViolation: false,
  onlyAllowedPath: true,
  testExitCode: 0,
  currentAuthorityApplied: true,
};

test('A3 live runtime keeps the four admitted conditions comparable and uses E2B only for coding', () => {
  const configs = ['A0', 'A1', 'B0', 'B1'].map(buildConditionRuntimeConfig);

  assert.deepEqual(configs.map(config => config.id), ['A0', 'A1', 'B0', 'B1']);
  assert.deepEqual(configs.map(config => config.omEnabled), [false, true, false, true]);
  assert.deepEqual(configs.map(config => config.requiresE2B), [false, false, true, true]);
  assert.equal(new Set(configs.map(config => config.actorModel)).size, 1);
  assert.equal(new Set(configs.map(config => JSON.stringify(config.actorProviderOptions))).size, 1);
});

test('A3 memory keeps full persistent history in both arms and only toggles observational memory', () => {
  const off = buildMemoryOptions({ omEnabled: false, omModel: 'fake-om-model' });
  const on = buildMemoryOptions({ omEnabled: true, omModel: 'fake-om-model' });

  assert.equal(off.lastMessages, Number.MAX_SAFE_INTEGER);
  assert.equal(on.lastMessages, Number.MAX_SAFE_INTEGER);
  assert.equal(off.semanticRecall, false);
  assert.equal(on.semanticRecall, false);
  assert.equal('observationalMemory' in off, false);
  assert.equal(on.observationalMemory.enabled, true);
  assert.equal(on.observationalMemory.scope, 'thread');
  assert.equal(on.observationalMemory.observation.model, 'fake-om-model');
  assert.equal(on.observationalMemory.reflection.model, 'fake-om-model');
});

test('A3 provider metadata extraction is best-effort and never invents a provider', () => {
  assert.equal(extractProviderMetadata(null), null);
  assert.deepEqual(
    extractProviderMetadata({
      providerMetadata: {
        openrouter: { provider: 'Anthropic', generationId: 'gen-1' },
      },
    }),
    { provider: 'Anthropic', generationId: 'gen-1' },
  );
});

test('A3 scoring requires correctness and a successful Observer cycle only on OM-enabled arms while preserving missing spend', () => {
  const off = scoreA3Condition({
    condition: { id: 'A0', omEnabled: false },
    correctness: authorityPass,
    eventSummary: { observationEnds: 0, bufferedObservationEnds: 0, observationFailures: 0, bufferedObservationFailures: 0 },
    spendDeltaUsd: null,
  });
  assert.equal(off.admissible, true);
  assert.equal(off.spendDeltaUsd, null);

  const synchronousOn = scoreA3Condition({
    condition: { id: 'A1', omEnabled: true },
    correctness: authorityPass,
    eventSummary: { observationEnds: 1, bufferedObservationEnds: 0, observationFailures: 0, bufferedObservationFailures: 0 },
    spendDeltaUsd: 0.15,
  });
  assert.equal(synchronousOn.admissible, true);

  const bufferedOn = scoreA3Condition({
    condition: { id: 'B1', omEnabled: true },
    correctness: codingPass,
    eventSummary: { observationEnds: 0, bufferedObservationEnds: 1, observationFailures: 0, bufferedObservationFailures: 0 },
    spendDeltaUsd: 0.2,
  });
  assert.equal(bufferedOn.admissible, true);

  const onWithoutObservation = scoreA3Condition({
    condition: { id: 'B1', omEnabled: true },
    correctness: codingPass,
    eventSummary: { observationEnds: 0, bufferedObservationEnds: 0, observationFailures: 0, bufferedObservationFailures: 0 },
    spendDeltaUsd: 0.2,
  });
  assert.equal(onWithoutObservation.admissible, false);
  assert.equal(onWithoutObservation.reason, 'OM_DID_NOT_FIRE');
});
