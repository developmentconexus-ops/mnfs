function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function messageFromObservation(observation) {
  if (!observation || typeof observation !== 'object') return null;
  if (observation.type === 'message_end') return observation.message;
  if (observation.type === 'agent_message') return observation.message;
  return null;
}

/**
 * C05 is derived only from a trusted process observation of a completed
 * provider/model response. Preflight readiness is deliberately not an input
 * to the proof decision.
 */
export function deriveTrustedAuthProof({ rawObservations = [] } = {}) {
  for (const observation of rawObservations) {
    const message = messageFromObservation(observation);
    const provider = nonEmptyString(message?.provider);
    const model = nonEmptyString(message?.model);
    const stopReason = nonEmptyString(message?.stopReason);
    if (message?.role !== 'assistant' || !provider || !model || stopReason === 'error') continue;
    return {
      outcome: 'AUTHORIZED_OPERATION',
      operation: 'PROVIDER_MODEL_COMPLETED',
      providerClass: provider,
      modelClass: model,
      methodClass: nonEmptyString(message.authMethodClass),
      source: 'MNFS_TRUSTED_PROCESS_OBSERVATION',
    };
  }
  return {
    outcome: 'NOT_PROVEN',
    operation: null,
    providerClass: null,
    modelClass: null,
    methodClass: null,
    source: 'MNFS_TRUSTED_PROCESS_OBSERVATION',
  };
}
