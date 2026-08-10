import { writeSync } from 'node:fs';
import { verifyFixtureResult } from './fixture.mjs';
import { reopenCandidateRecoveryState } from './recovery.mjs';

try {
  const input = JSON.parse(process.argv[2] ?? '{}');
  const reopened = await reopenCandidateRecoveryState({
    runRoot: input.runRoot,
    binding: input.binding,
    candidateShape: input.candidateShape,
    records: input.recoveryRecords,
  });
  const fixtureBindingMatches = Boolean(input.fixture?.fixtureHash)
    && input.fixture.fixtureHash === input.binding?.fixtureHash;
  const fixture = input.fixture && input.toolCalls ? await verifyFixtureResult(input.fixture, { toolCalls: input.toolCalls }) : null;
  const verified = reopened.stateReopened === true
    && reopened.evidenceHashesValid === true
    && reopened.bindingMatches === true
    && fixtureBindingMatches;
  writeSync(1, `${JSON.stringify({
    kind: 'MNFS_TRUSTED_FRESH_RECOVERY',
    phase: 'FRESH_PROCESS',
    verified,
    stateReopened: reopened.stateReopened,
    evidenceHashesValid: reopened.evidenceHashesValid,
    bindingMatches: reopened.bindingMatches,
    fixtureBindingMatches,
    runtimeSessionRequired: false,
    transcriptRequired: false,
    fixtureVerified: fixture?.ok ?? null,
    changedPaths: fixture?.changedPaths ?? [],
    treeSha: fixture?.treeSha ?? null,
    errors: [...(reopened.errors ?? []), ...(fixture?.errors ?? [])],
  })}\n`);
  process.exitCode = verified ? 0 : 2;
} catch (error) {
  process.stderr.write(`${String(error?.stack ?? error)}\n`);
  process.exitCode = 1;
}
