import {
  A3_OM_CONFIG,
  A3_RUN_MATRIX,
  ACTOR_MODEL,
  ACTOR_PROVIDER_OPTIONS,
} from './a3-admission.mjs';

export function buildConditionRuntimeConfig(id) {
  const condition = A3_RUN_MATRIX.find(item => item.id === id);
  if (!condition) throw new Error(`unknown A3 condition: ${id}`);

  return Object.freeze({
    id: condition.id,
    fixture: condition.fixture,
    omEnabled: condition.om,
    requiresE2B: condition.fixture === 'coding-effectiveness',
    actorModel: ACTOR_MODEL,
    actorProviderOptions: ACTOR_PROVIDER_OPTIONS,
  });
}

export function buildMemoryOptions({ omEnabled, omModel }) {
  const base = {
    lastMessages: Number.MAX_SAFE_INTEGER,
    semanticRecall: false,
    workingMemory: { enabled: false },
  };

  if (!omEnabled) return base;

  return {
    ...base,
    observationalMemory: {
      enabled: true,
      scope: A3_OM_CONFIG.scope,
      activateAfterIdle: A3_OM_CONFIG.activateAfterIdle,
      activateOnProviderChange: A3_OM_CONFIG.activateOnProviderChange,
      observation: {
        ...A3_OM_CONFIG.observation,
        model: omModel,
      },
      reflection: {
        ...A3_OM_CONFIG.reflection,
        model: omModel,
      },
    },
  };
}

export function extractProviderMetadata(value) {
  const metadata = value?.providerMetadata?.openrouter ?? value?.providerMetadata;
  if (!metadata || typeof metadata !== 'object') return null;

  const provider = metadata.provider ?? metadata.provider_name;
  const generationId = metadata.generationId ?? metadata.generation_id;
  if (provider === undefined && generationId === undefined) return null;

  return {
    ...(provider !== undefined ? { provider } : {}),
    ...(generationId !== undefined ? { generationId } : {}),
  };
}

export function scoreA3Condition({ condition, correctness, eventSummary, spendDeltaUsd }) {
  if (!correctness?.pass) {
    return Object.freeze({ admissible: false, reason: 'CORRECTNESS_FAILED', spendDeltaUsd });
  }

  if (condition?.omEnabled && (eventSummary?.observationFailures ?? 0) > 0) {
    return Object.freeze({ admissible: false, reason: 'OM_OBSERVATION_FAILED', spendDeltaUsd });
  }

  if (condition?.omEnabled && (eventSummary?.observationEnds ?? 0) < 1) {
    return Object.freeze({ admissible: false, reason: 'OM_DID_NOT_FIRE', spendDeltaUsd });
  }

  return Object.freeze({ admissible: true, reason: 'PASS', spendDeltaUsd });
}
