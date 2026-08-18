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
});

export function validateOpenRouterKeyMetadata(payload) {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== 'object') throw new Error('OpenRouter key metadata is missing');
  if (typeof data.limit !== 'number' || data.limit <= 0 || data.limit > A3_KEY_POLICY.hardLimitUsd) {
    throw new Error(`A3 OpenRouter key must have a finite limit at or below USD ${A3_KEY_POLICY.hardLimitUsd.toFixed(2)}`);
  }
  if (typeof data.limit_remaining !== 'number' || data.limit_remaining <= 0 || data.limit_remaining > data.limit) {
    throw new Error('A3 OpenRouter key remaining limit must be within (0, limit]');
  }
  return Object.freeze({
    limit: data.limit,
    limitRemaining: data.limit_remaining,
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