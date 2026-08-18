export const A3_LOCK_SHA256 = null; // populated after the Codex OAuth dependency closure is materialized
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
    modelSettings: Object.freeze({ maxOutputTokens: 2048 }),
  }),
  reflection: Object.freeze({
    observationTokens: 2000,
    bufferActivation: 0.5,
    blockAfter: 1.1,
    modelSettings: Object.freeze({ maxOutputTokens: 2048 }),
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
