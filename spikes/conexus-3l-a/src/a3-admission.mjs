export const A3_LOCK_SHA256 = '7f61c6c74ad92b23abd0fb44353bc63f444ab01dd3b62d23cec7d7de4b1051d5';
export const QUALIFIED_E2B_TEMPLATE_ID = '7ezun152y8jtqxf7llpl';

export const CODEX_AUTH_PROVIDER = 'openai-codex';
export const ACTOR_MODEL = 'openai/gpt-5.6-sol';
export const ACTOR_MODEL_SLUG = 'gpt-5.6-sol';
export const OM_MODEL = 'openai/gpt-5.6-luna';
export const OM_MODEL_SLUG = 'gpt-5.6-luna';
export const A3_THINKING_LEVEL = 'medium';

export const A3_OM_CONFIG = Object.freeze({
  scope: 'thread',
  activateAfterIdle: 'auto',
  activateOnProviderChange: true,
  observation: Object.freeze({
    messageTokens: 8000,
    bufferTokens: 0.2,
    bufferActivation: 0.8,
    previousObserverTokens: 1000,
    blockAfter: 2,
    threadTitle: true,
  }),
  reflection: Object.freeze({
    observationTokens: 2000,
    bufferActivation: 0.5,
    blockAfter: 1.1,
  }),
});

export const A3_RUN_MATRIX = Object.freeze([
  Object.freeze({ id: 'A0', fixture: 'authority-currentness', om: false }),
  Object.freeze({ id: 'A1', fixture: 'authority-currentness', om: true }),
  Object.freeze({ id: 'B0', fixture: 'coding-effectiveness', om: false }),
  Object.freeze({ id: 'B1', fixture: 'coding-effectiveness', om: true }),
]);

export function codexModelSlug(modelId) {
  if (!modelId?.startsWith('openai/')) throw new Error(`A3 Codex model must use openai/<id>: ${modelId}`);
  return modelId.slice('openai/'.length);
}
