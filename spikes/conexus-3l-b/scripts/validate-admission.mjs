import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const TRACK_COUNTS = Object.freeze({ B1: 10, B2: 12, B3: 12, B4: 18 });
const PROOF_CLASSES = new Set([
  'SOURCE',
  'DETERMINISTIC',
  'LOCAL_RUNTIME',
  'PROCESS_RESTART',
  'POSTGRES',
  'NATIVE_LIVE'
]);
const ROUTED_FAMILIES = Object.freeze([
  'forged owner IDs / producer provenance',
  'OTel baggage policy',
  'shared-global-OTel role attribution',
  'telemetry exporter degradation',
  'required verification evidence missing/sampled',
  'GUEST_OBSERVED forged authority fields',
  'E2B provider-pull / OTLP-push deciding evidence',
  'high-cardinality metric dimensions',
  'MastraStorageExporter / OBS cross-schema boundary'
]);
const SUPERSEDED_MECHANISMS = Object.freeze([
  /latest/iu,
  /Stored Agent latest/iu,
  /Vercel AI SDK Product Agent/iu,
  /UniversalEnvelope/iu,
  /Pi as primary Builder/iu,
  /generic Workflow\/Scheduler\/Automation/iu
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function expectedCriterionIds() {
  return Object.entries(TRACK_COUNTS).flatMap(([track, count]) =>
    Array.from({ length: count }, (_, index) => `${track}-${String(index + 1).padStart(2, '0')}`)
  );
}

export function validateAdmission(record) {
  invariant(record?.schemaVersion === 1, 'schemaVersion must be 1');
  invariant(record?.package === '3L-B', 'package must be 3L-B');
  invariant(record?.b5?.admitted === false, 'B5 must remain not admitted');
  invariant(Array.isArray(record.criteria), 'criteria must be an array');
  invariant(Array.isArray(record.routedToPackageE), 'routedToPackageE must be an array');
  invariant(Array.isArray(record.reopenTriggers), 'reopenTriggers must be an array');

  const ids = record.criteria.map(({ id }) => id);
  invariant(new Set(ids).size === ids.length, 'criterion IDs must be unique');

  for (const expectedId of expectedCriterionIds()) {
    const criterion = record.criteria.find(({ id }) => id === expectedId);
    invariant(criterion, `missing/drifted criterion ${expectedId}`);
    invariant(criterion.state === 'ADMITTED', `${expectedId} must be ADMITTED`);
    invariant(criterion.track === expectedId.slice(0, 2), `${expectedId} track drift`);
  }
  invariant(ids.length === expectedCriterionIds().length, 'unexpected Package-B criterion');

  for (const criterion of record.criteria) {
    const serialized = JSON.stringify(criterion);
    invariant(
      !SUPERSEDED_MECHANISMS.some((pattern) => pattern.test(serialized)),
      `superseded mechanism in ${criterion.id}`
    );
    if (criterion.state === 'ADMITTED') {
      for (const field of [
        'protectedInvariant',
        'currentMechanism',
        'proofClass',
        'negativeFixture',
        'requiredEvidence'
      ]) {
        invariant(typeof criterion[field] === 'string' && criterion[field].trim(), `${criterion.id} empty ${field}`);
      }
      invariant(Array.isArray(criterion.authority) && criterion.authority.length > 0, `${criterion.id} empty authority`);
      invariant(PROOF_CLASSES.has(criterion.proofClass), `${criterion.id} invalid proofClass`);
    }
  }

  for (const family of ROUTED_FAMILIES) {
    const route = record.routedToPackageE.find((entry) => entry.family === family);
    invariant(route?.state === 'ROUTED_TO_E', `missing Package-E routed family: ${family}`);
  }
  invariant(record.routedToPackageE.length === ROUTED_FAMILIES.length, 'unexpected Package-E routed family');

  const p30 = record.reopenTriggers.find((entry) => entry.historicalId === 'P30');
  invariant(p30?.state === 'REOPEN_TRIGGER', 'historical P30 must be a REOPEN_TRIGGER');
  invariant(
    p30?.trigger === 'enable previously-deferred process-global Mastra capability → re-run cross-role isolation qualification before same-process admission',
    'historical P30 trigger drift'
  );
  invariant(record.reopenTriggers.length === 1, 'unexpected reopen trigger');

  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const record = JSON.parse(
    fs.readFileSync(new URL('../admission/criteria.json', import.meta.url), 'utf8')
  );
  validateAdmission(record);
  console.log('Package B admission compilation passed.');
}
