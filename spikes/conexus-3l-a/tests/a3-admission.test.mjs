import test from 'node:test';
import assert from 'node:assert/strict';
import {
  A3_KEY_POLICY,
  A3_LOCK_SHA256,
  A3_OM_CONFIG,
  A3_RUN_MATRIX,
  ACTOR_MODEL,
  ACTOR_PROVIDER_OPTIONS,
  OM_MODEL,
  OM_PROVIDER_OPTIONS,
  QUALIFIED_E2B_TEMPLATE_ID,
  validateOpenRouterKeyMetadata,
  validateReturnedRoute,
} from '../src/a3-admission.mjs';
import {
  AUTHORITY_FINAL_TASK,
  CODING_FINAL_TASK,
  CODING_FIXTURE_FILES,
  buildAuthorityHistory,
  scoreAuthorityAnswer,
  scoreCodingResult,
} from '../src/a3-fixtures.mjs';

test('A3 admission identity is exact and the matrix contains exactly four paired primary runs', () => {
  assert.equal(A3_LOCK_SHA256, '70975a4b3aadc453959bd36835c1c4ad3edc320c862a9ebfb6ace7feb4fd1864');
  assert.equal(QUALIFIED_E2B_TEMPLATE_ID, '7ezun152y8jtqxf7llpl');
  assert.equal(ACTOR_MODEL, 'openrouter/anthropic/claude-sonnet-5');
  assert.equal(OM_MODEL, 'openrouter/google/gemini-3.5-flash');
  assert.deepEqual(A3_RUN_MATRIX.map(run => run.id), ['A0', 'A1', 'B0', 'B1']);
  assert.deepEqual(A3_RUN_MATRIX.map(run => run.om), [false, true, false, true]);
});

test('A3 provider routing disables fallback and pins Actor/OM provider classes', () => {
  assert.deepEqual(ACTOR_PROVIDER_OPTIONS.openrouter.provider.only, ['anthropic']);
  assert.deepEqual(ACTOR_PROVIDER_OPTIONS.openrouter.provider.order, ['anthropic']);
  assert.equal(ACTOR_PROVIDER_OPTIONS.openrouter.provider.allow_fallbacks, false);
  assert.equal(ACTOR_PROVIDER_OPTIONS.openrouter.provider.require_parameters, true);
  assert.equal(ACTOR_PROVIDER_OPTIONS.openrouter.reasoning.effort, 'medium');

  assert.deepEqual(OM_PROVIDER_OPTIONS.openrouter.provider.only, ['google-ai-studio']);
  assert.deepEqual(OM_PROVIDER_OPTIONS.openrouter.provider.order, ['google-ai-studio']);
  assert.equal(OM_PROVIDER_OPTIONS.openrouter.provider.allow_fallbacks, false);
  assert.equal(OM_PROVIDER_OPTIONS.openrouter.provider.require_parameters, true);
  assert.equal(OM_PROVIDER_OPTIONS.openrouter.reasoning.effort, 'medium');
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
});

test('A3 key gate accepts only the dedicated exact hard-limit/no-reset/short-lived inference key', () => {
  const now = Date.parse('2026-08-18T16:00:00.000Z');
  const accepted = validateOpenRouterKeyMetadata(
    {
      data: {
        label: 'conexus-3l-a3',
        is_management_key: false,
        is_provisioning_key: false,
        include_byok_in_limit: true,
        limit: 10,
        limit_remaining: 10,
        limit_reset: null,
        expires_at: '2026-08-19T15:59:00.000Z',
      },
    },
    { now },
  );
  assert.equal(accepted.limit, A3_KEY_POLICY.hardLimitUsd);

  const invalid = [
    { label: 'wrong-key', is_management_key: false, is_provisioning_key: false, include_byok_in_limit: true, limit: 10, limit_remaining: 10, limit_reset: null, expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: true, is_provisioning_key: false, include_byok_in_limit: true, limit: 10, limit_remaining: 10, limit_reset: null, expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: false, is_provisioning_key: true, include_byok_in_limit: true, limit: 10, limit_remaining: 10, limit_reset: null, expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: false, is_provisioning_key: false, include_byok_in_limit: false, limit: 10, limit_remaining: 10, limit_reset: null, expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: false, is_provisioning_key: false, include_byok_in_limit: true, limit: null, limit_remaining: 10, limit_reset: null, expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: false, is_provisioning_key: false, include_byok_in_limit: true, limit: 11, limit_remaining: 11, limit_reset: null, expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: false, is_provisioning_key: false, include_byok_in_limit: true, limit: 10, limit_remaining: 10, limit_reset: 'daily', expires_at: '2026-08-19T15:00:00Z' },
    { label: 'conexus-3l-a3', is_management_key: false, is_provisioning_key: false, include_byok_in_limit: true, limit: 10, limit_remaining: 10, limit_reset: null, expires_at: '2026-08-20T16:00:01Z' },
  ];
  for (const metadata of invalid) {
    assert.throws(() => validateOpenRouterKeyMetadata({ data: metadata }, { now }));
  }
});

test('A3 returned-route guard rejects model/provider drift when metadata is available', () => {
  assert.equal(
    validateReturnedRoute({
      requestedModel: 'anthropic/claude-sonnet-5',
      returnedModel: 'anthropic/claude-sonnet-5',
      expectedProvider: 'anthropic',
      providerMetadata: { provider: 'Anthropic' },
    }),
    true,
  );
  assert.throws(() =>
    validateReturnedRoute({
      requestedModel: 'anthropic/claude-sonnet-5',
      returnedModel: 'anthropic/claude-sonnet-5',
      expectedProvider: 'anthropic',
      providerMetadata: { provider: 'Amazon Bedrock' },
    }),
  );
  assert.throws(() =>
    validateReturnedRoute({
      requestedModel: 'anthropic/claude-sonnet-5',
      returnedModel: 'anthropic/claude-sonnet-latest',
      expectedProvider: 'anthropic',
      providerMetadata: { provider: 'Anthropic' },
    }),
  );
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
    scoreCodingResult({
      changedPaths: ['src/budget.mjs'],
      testExitCode: 0,
      finalFile: 'return { displayUnknownAs: null };',
    }).pass,
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
    scoreCodingResult({
      changedPaths: ['src/budget.mjs'],
      testExitCode: 0,
      finalFile: 'return { displayUnknownAs: 0 };',
    }).pass,
    false,
  );
});
