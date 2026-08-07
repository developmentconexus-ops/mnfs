function row(left, right) {
  return `${String(left).padEnd(36, ' ')} ${right}`;
}

export function buildReportView(result) {
  return {
    runId: result.runId,
    source: structuredClone(result.source),
    hostIdentity: structuredClone(result.hostIdentity),
    capabilities: structuredClone(result.capabilities ?? []),
    capabilityClasses: structuredClone(result.capabilityClasses ?? []),
    verdict: structuredClone(result.verdict),
    limitations: structuredClone(result.limitations ?? []),
    artifactManifestHash: result.manifest?.sha256 ?? null,
    nextGovernedAction: result.verdict?.status === 'REJECT'
      ? 'Return to Decision/Replan; rejected Evidence must not feed downstream selection.'
      : 'After accepted ARR-S0 Evidence, S1/S2 planning may proceed only under their later exact gates; GATE-S0-EXECUTE governs the real probe run itself.',
  };
}

export function renderHumanReport(result) {
  const view = buildReportView(result);
  const lines = [
    '# ARR-S0 Host Capability Report',
    '',
    row('Run ID', view.runId),
    row('Source commit', view.source?.commitSha ?? 'UNKNOWN'),
    row('Source tree', view.source?.treeSha ?? 'UNKNOWN'),
    row('Host', view.hostIdentity ? `${view.hostIdentity.distroId} ${view.hostIdentity.distroVersion} / ${view.hostIdentity.kernelRelease}` : 'UNKNOWN'),
    row('Manifest SHA-256', view.artifactManifestHash ?? 'UNKNOWN'),
    '',
    '## Capabilities',
  ];

  for (const capability of view.capabilities) {
    lines.push(row(capability.id, capability.state));
  }

  lines.push('', '## Capability classes');
  for (const record of view.capabilityClasses) {
    lines.push(row(record.classId, record.eligibility));
  }

  lines.push('', `Verdict: ${view.verdict?.status ?? 'NONE'}`);
  for (const reason of view.verdict?.reasons ?? []) lines.push(`- ${reason}`);
  if (view.limitations.length) {
    lines.push('', '## Limitations');
    for (const limitation of view.limitations) lines.push(`- ${limitation}`);
  }
  lines.push('', `Next governed action: ${view.nextGovernedAction}`, '');
  return lines.join('\n');
}
