import test from 'node:test';
import assert from 'node:assert/strict';
import {
  A3_LOCK_SHA256,
  A3_OM_CONFIG,
  A3_RUN_MATRIX,
  A3_THINKING_LEVEL,
  ACTOR_MODEL,
  ACTOR_MODEL_SLUG,
  CODEX_AUTH_PROVIDER,
  OM_MODEL,
  OM_MODEL_SLUG,
  QUALIFIED_E2B_TEMPLATE_ID,
  codexModelSlug,
} from '../src/a3-admission.mjs';
import {
  AUTHORITY_FINAL_TASK,
  CODING_FINAL_TASK,
  CODING_FIXTURE_FILES,
  buildAuthorityHistory,
  scoreAuthorityAnswer,
  scoreCodingResult,
} from '../src/a3-fixtures.mjs';

test('A3 Codex admission pins Sol actor, Luna OM and exactly four paired primary runs', () => {
  assert.equal(A3_LOCK_SHA256, null, 'new Codex closure must be materialized before live execution');
  assert.equal(QUALIFIED_E2B_TEMPLATE_ID, '7ezun152y8jtqxf7llpl');
  assert.equal(CODEX_AUTH_PROVIDER, 'openai-codex');
  assert.equal(ACTOR_MODEL, 'openai/gpt-5.6-sol');
  assert.equal(ACTOR_MODEL_SLUG, 'gpt-5.6-sol');
  assert.equal(OM_MODEL, 'openai/gpt-5.6-luna');
  assert.equal(OM_MODEL_SLUG, 'gpt-5.6-luna');
  assert.equal(codexModelSlug(ACTOR_MODEL), ACTOR_MODEL_SLUG);
  assert.equal(codexModelSlug(OM_MODEL), OM_MODEL_SLUG);
  assert.equal(A3_THINKING_LEVEL, 'medium');
  assert.deepEqual(A3_RUN_MATRIX.map(run => run.id), ['A0', 'A1', 'B0', 'B1']);
  assert.deepEqual(A3_RUN_MATRIX.map(run => run.om), [false, true, false, true]);
});

test('A3 OM probe config is thread-scoped, bounded and excludes deferred memory expansions', () => {
  assert.equal(A3_OM_CONFIG.scope, 'thread');
  assert.equal(A3_OM_CONFIG.observation.messageTokens, 8000);
  assert.equal(A3_OM_CONFIG.observation.bufferTokens, 0.2);
  assert.equal(A3_OM_CONFIG.observation.previousObserverTokens, 1000);
  assert.equal(A3_OM_CONFIG.observation.modelSettings.maxOutputTokens, 2048);
  assert.equal(A3_OM_CONFIG.reflection.observationTokens, 2000);
  assert.equal(A3_OM_CONFIG.reflection.modelSettings.maxOutputTokens, 2048);
  assert.equal('extract' in A3_OM_CONFIG.observation, false);
  assert.equal('workingMemory' in A3_OM_CONFIG, false);
  assert.equal('vector' in A3_OM_CONFIG, false);
  assert.equal('providerOptions' in A3_OM_CONFIG.observation, false);
});

test('authority-currentness fixture is large, contains an explicit supersession and scores stale authority as failure', () => {
  const history = buildAuthorityHistory();
  const totalChars = history.reduce((sum, message) => sum + message.text.length, 0);
  assert.ok(totalChars > 40_000, `expected >40k characters, got ${totalChars}`);
  assert.match(history[0].text, /ALLOW_TRANSPARENT_RETRY/);
  assert.match(history.at(-1).text, /QUARANTINE_AND_REQUIRE_NEW_OWNER_ADMISSION/);
  assert.match(AUTHORITY_FINAL_TASK, /current authority/i);

  const correct = [
    'PHYSICAL_REINCARNATION=QUARANTINE_AND_REQUIRE_NEW_OWNER_ADMISSION',
    'UNKNOWN_FINANCIAL_VALUE=PRESERVE_NULL_NOT_ZERO',
    'EXTERNAL_CREDENTIAL_CUSTODY=CONTROL_SIDE_ONLY',
    'OUTPUT_CUSTODY=DURABLE_OUTSIDE_SANDBOX_BEFORE_PRESENTATION',
  ].join('\n');
  assert.equal(scoreAuthorityAnswer(correct).pass, true);
  assert.equal(
    scoreAuthorityAnswer(correct.replace('QUARANTINE_AND_REQUIRE_NEW_OWNER_ADMISSION', 'ALLOW_TRANSPARENT_RETRY')).pass,
    false,
  );
});

test('coding fixture has a real red baseline and scoring forbids verifier edits or stale null→zero behavior', async () => {
  assert.match(CODING_FINAL_TASK, /workspace tools/i);
  assert.ok(CODING_FIXTURE_FILES['src/budget.mjs'].includes('displayUnknownAs: 0'));
  assert.ok(CODING_FIXTURE_FILES['test/budget.test.mjs'].includes('displayUnknownAs: null'));

  assert.equal(
    scoreCodingResult({ changedPaths: ['src/budget.mjs'], testExitCode: 0, finalFile: 'return { displayUnknownAs: null };' }).pass,
    true,
  );
  assert.equal(
    scoreCodingResult({
      changedPaths: ['src/budget.mjs', 'test/budget.test.mjs'],
      testExitCode: 0,
      finalFile: 'return { displayUnknownAs: null };',
    }).pass,
    false,
  );
  assert.equal(
    scoreCodingResult({ changedPaths: ['src/budget.mjs'], testExitCode: 0, finalFile: 'return { displayUnknownAs: 0 };' }).pass,
    false,
  );
});
