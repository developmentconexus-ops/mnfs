import test from 'node:test';
import assert from 'node:assert/strict';
import * as live from '../src/a3-live.mjs';

const { buildConditionRuntimeConfig, buildMemoryOptions, scoreA3Condition } = live;

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
  assert.equal(new Set(configs.map(config => config.omModel)).size, 1);
  assert.equal(configs[0].actorModel, 'openai/gpt-5.6-sol');
  assert.equal(configs[0].omModel, 'openai/gpt-5.6-luna');
});

test('A3 memory keeps full persistent history in both arms and only toggles observational memory', () => {
  const off = buildMemoryOptions({ omEnabled: false, omModel: 'fake-luna-model' });
  const on = buildMemoryOptions({ omEnabled: true, omModel: 'fake-luna-model' });

  assert.equal(off.lastMessages, Number.MAX_SAFE_INTEGER);
  assert.equal(on.lastMessages, Number.MAX_SAFE_INTEGER);
  assert.equal(off.semanticRecall, false);
  assert.equal(on.semanticRecall, false);
  assert.equal('observationalMemory' in off, false);
  assert.equal(on.observationalMemory.enabled, true);
  assert.equal(on.observationalMemory.scope, 'thread');
  assert.equal(on.observationalMemory.observation.model, 'fake-luna-model');
  assert.equal(on.observationalMemory.reflection.model, 'fake-luna-model');
});

test('A3 scoring requires correctness and a successful Observer cycle only on OM-enabled arms', () => {
  const off = scoreA3Condition({
    condition: { id: 'A0', omEnabled: false },
    correctness: authorityPass,
    eventSummary: { observationEnds: 0, observationFailures: 0, bufferedObservationEnds: 0 },
  });
  assert.equal(off.admissible, true);

  const on = scoreA3Condition({
    condition: { id: 'A1', omEnabled: true },
    correctness: authorityPass,
    eventSummary: { observationEnds: 0, bufferedObservationEnds: 1, observationFailures: 0 },
  });
  assert.equal(on.admissible, true);

  const onWithoutObservation = scoreA3Condition({
    condition: { id: 'B1', omEnabled: true },
    correctness: codingPass,
    eventSummary: { observationEnds: 0, bufferedObservationEnds: 0, observationFailures: 0 },
  });
  assert.equal(onWithoutObservation.admissible, false);
  assert.equal(onWithoutObservation.reason, 'OM_DID_NOT_FIRE');
});

test('A3 Codex smoke consumes the model through streaming and never uses generate', async () => {
  assert.equal(
    typeof live.smokeCodexModel,
    'function',
    'smokeCodexModel must exist so the Codex smoke can enforce stream-only transport',
  );

  const marker = 'CODEX_SMOKE_OK';
  let streamCalls = 0;
  let generateCalls = 0;
  const agent = {
    async generate() {
      generateCalls += 1;
      throw new Error('generate must not be used for the Codex backend');
    },
    async stream(prompt) {
      streamCalls += 1;
      assert.equal(prompt, `Reply with exactly ${marker} and nothing else.`);
      return {
        textStream: (async function* () {
          yield 'CODEX_';
          yield 'SMOKE_OK';
        })(),
      };
    },
  };

  const text = await live.smokeCodexModel(agent, marker);
  assert.equal(text, marker);
  assert.equal(streamCalls, 1);
  assert.equal(generateCalls, 0);
});
