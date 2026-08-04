import assert from 'node:assert/strict';
import test from 'node:test';

import { M01_FIXTURE } from '../support/m01-fixtures.js';

const IDS_MODULE_SPECIFIER = '../../src/execution/' + 'ids.js';

interface IdentityModule {
  formatWriteTrackId(value: number): string;
  formatAttemptId(writeTrackId: string, ordinal: number): string;
  formatWorkerRunId(attemptId: string, ordinal: number): string;
  formatClaimId(attemptId: string, ordinal: number): string;
  formatLeaseId(value: number): string;
  requireWorkerRunId(value: string, expectedAttemptId?: string): string;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadIdentityModule(): Promise<IdentityModule> {
  try {
    return await import(IDS_MODULE_SPECIFIER) as IdentityModule;
  } catch (error) {
    assert.fail(`M01 identity module is not implemented: ${describeError(error)}`);
  }
}

test('formats stable parent-relative M01 identities', async () => {
  const identities = await loadIdentityModule();

  assert.equal(identities.formatWriteTrackId(1), M01_FIXTURE.ids.writeTrack);
  assert.equal(
    identities.formatAttemptId(M01_FIXTURE.ids.writeTrack, 1),
    M01_FIXTURE.ids.attempt,
  );
  assert.equal(
    identities.formatWorkerRunId(M01_FIXTURE.ids.attempt, 1),
    M01_FIXTURE.ids.workerRun,
  );
  assert.equal(
    identities.formatClaimId(M01_FIXTURE.ids.attempt, 1),
    M01_FIXTURE.ids.claim,
  );
  assert.equal(identities.formatLeaseId(1), M01_FIXTURE.ids.lease);
});

test('rejects invalid ordinals and cross-parent Worker Run identities', async () => {
  const identities = await loadIdentityModule();

  assert.throws(() => identities.formatWriteTrackId(0));
  assert.throws(() => identities.formatAttemptId(M01_FIXTURE.ids.writeTrack, -1));
  assert.throws(() => identities.formatLeaseId(1.5));
  assert.throws(() => identities.requireWorkerRunId(
    'WT-002/A01/WR01',
    M01_FIXTURE.ids.attempt,
  ));
});
