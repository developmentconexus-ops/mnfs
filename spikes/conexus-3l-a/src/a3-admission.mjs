export const A3_LOCK_SHA256 = '70975a4b3aadc453959bd36835c1c4ad3edc320c862a9ebfb6ace7feb4fd1864';
export const QUALIFIED_E2B_TEMPLATE_ID = '7ezun152y8jtqxf7llpl';

export const ACTOR_MODEL = 'openrouter/anthropic/claude-sonnet-5';
export const OM_MODEL = 'openrouter/google/gemini-3.5-flash';

export const ACTOR_PROVIDER_OPTIONS = Object.freeze({
  openrouter: Object.freeze({
    provider: Object.freeze({
      only: Object.freeze(['anthropic']),
      order: Object.freeze(['anthropic']),
      allow_fallbacks: false,
      require_parameters: true,
    }),
    reasoning: Object.freeze({ effort: 'medium' }),
  }),
});

export const OM_PROVIDER_OPTIONS = Object.freeze({
  openrouter: Object.freeze({
    provider: Object.freeze({
      only: Object.freeze(['google-ai-studio']),
      order: Object.freeze(['google-ai-studio']),
      allow_fallbacks: false,
      require_parameters: true,
    }),
    reasoning: Object.freeze({ effort: 'medium' }),
  }),
});

export const A3_OM_CONFIG = Object.freeze({
  scope: 'thread',
  activateAfterIdle: 'auto',
  activateOnProviderChange: true,
  observation: Object.freeze({
    model: OM_MODEL,
    messageTokens: 8000,
    bufferTokens: 0.2,
    bufferActivation: 0.8,
    previousObserverTokens: 1000,
    blockAfter: 2,
    threadTitle: true,
    providerOptions: OM_PROVIDER_OPTIONS,
    modelSettings: Object.freeze({ maxOutputTokens: 2048 }),
  }),
  reflection: Object.freeze({
    model: OM_MODEL,
    observationTokens: 2000,
    bufferActivation: 0.5,
    blockAfter: 1.1,
    providerOptions: OM_PROVIDER_OPTIONS,
    modelSettings: Object.freeze({ maxOutputTokens: 2048 }),
  }),
});

export const A3_RUN_MATRIX = Object.freeze([
  Object.freeze({ id: 'A0', fixture: 'authority-currentness', om: false }),
  Object.freeze({ id: 'A1', fixture: 'authority-currentness', om: true }),
  Object.freeze({ id: 'B0', fixture: 'coding-effectiveness', om: false }),
  Object.freeze({ id: 'B1', fixture: 'coding-effectiveness', om: true }),
]);

export const A3_KEY_POLICY = Object.freeze({
  hardLimitUsd: 10,
  maxLifetimeMsFromRunAdmission: 24 * 60 * 60 * 1000,
  limitReset: null,
});

export function validateOpenRouterKeyMetadata(payload, { now = Date.now() } = {}) {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== 'object') throw new Error('OpenRouter key metadata is missing');
  if (data.is_management_key === true) throw new Error('A3 must not use a management key');
  if (data.limit !== A3_KEY_POLICY.hardLimitUsd) {
    throw new Error(`A3 OpenRouter key must have exact USD ${A3_KEY_POLICY.hardLimitUsd.toFixed(2)} limit`);
  }
  if (data.limit_reset !== A3_KEY_POLICY.limitReset) {
    throw new Error('A3 OpenRouter key limit must not reset');
  }
  if (typeof data.limit_remaining !== 'number' || data.limit_remaining <= 0 || data.limit_remaining > A3_KEY_POLICY.hardLimitUsd) {
    throw new Error('A3 OpenRouter key remaining limit must be within (0, hardLimit]');
  }
  if (typeof data.expires_at !== 'string') throw new Error('A3 OpenRouter key must expire');
  const expiresAt = Date.parse(data.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) throw new Error('A3 OpenRouter key is expired or invalid');
  if (expiresAt - now > A3_KEY_POLICY.maxLifetimeMsFromRunAdmission) {
    throw new Error('A3 OpenRouter key expiry is more than 24h from run admission');
  }
  return Object.freeze({
    limit: data.limit,
    limitRemaining: data.limit_remaining,
    limitReset: data.limit_reset,
    expiresAt: new Date(expiresAt).toISOString(),
  });
}

export function validateReturnedRoute({ requestedModel, returnedModel, expectedProvider, providerMetadata }) {
  if (returnedModel && returnedModel !== requestedModel && !returnedModel.endsWith(requestedModel.split('/').at(-1))) {
    throw new Error(`model identity drift: requested ${requestedModel}, returned ${returnedModel}`);
  }
  const provider = providerMetadata?.openrouter?.provider ?? providerMetadata?.provider ?? providerMetadata?.provider_name;
  if (provider && !String(provider).toLowerCase().includes(expectedProvider.toLowerCase())) {
    throw new Error(`provider identity drift: expected ${expectedProvider}, returned ${provider}`);
  }
  return true;
}
