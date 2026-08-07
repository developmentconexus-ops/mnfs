import { canonicalJson } from './canonical-json.mjs';
import { assertTc01 } from './errors.mjs';

export {
  assertNoFetchInvocation,
  readGitInvocationLog,
  snapshotPathTree,
  snapshotRepository,
} from './git-observer-core.mjs';

const SNAPSHOT_SCHEMA_VERSION = 1;
const SNAPSHOT_FIELDS = ['root', 'head', 'porcelainStatus', 'localConfig', 'refs', 'trackedTree', 'workingTree'];

export function compareRepositorySnapshots(before, after) {
  assertTc01(before?.schemaVersion === SNAPSHOT_SCHEMA_VERSION, 'TC01_EVIDENCE_INVALID', 'Before snapshot is invalid.');
  assertTc01(after?.schemaVersion === SNAPSHOT_SCHEMA_VERSION, 'TC01_EVIDENCE_INVALID', 'After snapshot is invalid.');
  const changedFields = [];
  const changes = {};

  for (const field of SNAPSHOT_FIELDS) {
    if (canonicalJson(before[field]) === canonicalJson(after[field])) continue;
    changedFields.push(field);
    changes[field] = { before: before[field], after: after[field] };
  }

  return {
    equal: changedFields.length === 0,
    changedFields,
    changes,
  };
}
