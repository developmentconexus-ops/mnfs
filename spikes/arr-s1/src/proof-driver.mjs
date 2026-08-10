function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function messageFromObservation(observation) {
  if (!observation || typeof observation !== 'object') return null;
  if (observation.type === 'message_end') return observation.message;
  if (observation.type === 'agent_message') return observation.message;
  return null;
}

function authMethodId(method) {
  return typeof method?.id === 'string' && method.id.trim() !== ''
    ? method.id.trim()
    : typeof method?.methodId === 'string' && method.methodId.trim() !== ''
      ? method.methodId.trim()
      : null;
}

function containsAuthRequired(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  if (value.authRequired === true || value.status === 'authRequired' || value.errorCode === 'AUTH_REQUIRED') return true;
  return Object.values(value).some((child) => containsAuthRequired(child, seen));
}

function hasAcpAgentOutput(observation) {
  if (!observation || typeof observation !== 'object') return false;
  if (observation.type === 'assistant_output') return true;
  const update = observation.notification?.update ?? observation.update ?? observation.params?.update;
  return update?.sessionUpdate === 'agent_message_chunk'
    && update.content?.type === 'text'
    && typeof update.content.text === 'string'
    && update.content.text.length > 0;
}

function deriveAcpAuthProof({ handshake, authentication, session, settled, rawObservations }) {
  const methods = Array.isArray(handshake?.authMethods) ? handshake.authMethods : [];
  const methodId = authentication?.methodId ?? authentication?.id;
  const advertised = methods.find((method) => authMethodId(method) === methodId);
  const output = (rawObservations ?? []).some(hasAcpAgentOutput);
  const stopReason = nonEmptyString(settled?.stopReason);
  const successfulPrompt = settled?.outcome === 'COMPLETED' && stopReason !== 'error' && stopReason !== 'auth_required';
  const sessionReady = typeof session?.sessionId === 'string' && session.sessionId.length > 0 && session.authRequired !== true;
  if (advertised && authentication?.succeeded === true && sessionReady && successfulPrompt && output
    && !containsAuthRequired({ handshake, authentication, session, settled, rawObservations })) {
    return {
      outcome: 'AUTHORIZED_OPERATION',
      operation: 'ACP_AUTHENTICATED_SESSION_PROMPT_COMPLETED',
      methodId,
      authMethodClass: methodId,
      sessionId: session.sessionId,
      source: 'MNFS_TRUSTED_ACP_PROCESS_OBSERVATION',
    };
  }
  return {
    outcome: 'NOT_PROVEN',
    operation: null,
    methodId: null,
    authMethodClass: null,
    source: 'MNFS_TRUSTED_ACP_PROCESS_OBSERVATION',
  };
}

/**
 * C05 is derived only from a trusted process observation of a completed
 * provider/model response. Preflight readiness is deliberately not an input
 * to the proof decision.
 */
export function deriveTrustedAuthProof({ candidateShape, handshake, authentication, session, settled, rawObservations = [] } = {}) {
  if (candidateShape === 'PI-ACP' || candidateShape === 'OPENCODE-ACP' || candidateShape === 'SECOND-ACP'
    || handshake !== undefined || authentication !== undefined || session !== undefined) {
    return deriveAcpAuthProof({ handshake, authentication, session, settled, rawObservations });
  }
  for (const observation of rawObservations) {
    const message = messageFromObservation(observation);
    const provider = nonEmptyString(message?.provider);
    const model = nonEmptyString(message?.model);
    const stopReason = nonEmptyString(message?.stopReason);
    if (message?.role !== 'assistant' || !provider || !model || !stopReason || ['error', 'auth_required'].includes(stopReason.toLowerCase())) continue;
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
