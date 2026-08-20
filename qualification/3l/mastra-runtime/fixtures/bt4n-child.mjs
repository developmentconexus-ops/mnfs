export function receiveNativeScheduleOccurrence({ scheduleId, runId }, observation) {
  const prefix = `sched_${scheduleId}_`;
  if (!runId.startsWith(prefix)) {
    throw new Error(`BT-4N runId does not bind schedule ${scheduleId}`);
  }

  const scheduledFireAtText = runId.slice(prefix.length);
  if (!/^\d+$/u.test(scheduledFireAtText)) {
    throw new Error('BT-4N runId does not expose a scheduled slot');
  }

  const scheduledFireAt = Number(scheduledFireAtText);
  if (!Number.isSafeInteger(scheduledFireAt)) {
    throw new Error('BT-4N scheduled slot is not a safe epoch-millisecond value');
  }

  const stableOccurrenceMaterial = {
    scheduleId,
    scheduledFireAt,
    logicalOccurrenceId: `${scheduleId}:${scheduledFireAt}`,
    runId
  };

  observation.syntheticParIngressCount += 1;
  observation.presentations.push(stableOccurrenceMaterial);

  return {
    stableOccurrenceMaterial,
    syntheticParIngressCount: observation.syntheticParIngressCount
  };
}

export function emitBt4nResult(evidence) {
  process.stdout.write(`BT4N_RESULT ${JSON.stringify(evidence)}\n`);
}
