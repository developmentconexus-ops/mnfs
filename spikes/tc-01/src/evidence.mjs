import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parseJsonBytesStrict } from './canonical-json.mjs';
import {
  createEvidenceStore as createEvidenceStoreCore,
  validateScenarioEvidence,
} from './evidence-core.mjs';
import { syncDurableFile } from './durable-write.mjs';

export { validateScenarioEvidence };

async function validateExistingScenarios(fixture) {
  const scenariosPath = join(fixture.artifactsRoot, 'scenarios.json');
  if (!existsSync(scenariosPath)) return;
  const parsed = parseJsonBytesStrict(
    await readFile(scenariosPath),
    'TC-01 scenarios aggregate',
    'TC01_EVIDENCE_INVALID',
  );
  if (!Array.isArray(parsed)) {
    const error = new Error('TC-01 scenarios aggregate must be an array.');
    Object.defineProperty(error, 'code', { value: 'TC01_EVIDENCE_INVALID', enumerable: true });
    throw error;
  }
}

async function syncReference(fixture, reference) {
  if (typeof reference !== 'string' || reference.length === 0) return;
  await syncDurableFile(join(fixture.artifactsRoot, reference));
}

export async function createEvidenceStore(fixture) {
  const core = await createEvidenceStoreCore(fixture);
  return {
    async writeCommand(input) {
      const result = await core.writeCommand(input);
      await Promise.all([
        syncReference(fixture, result.stdoutRef),
        syncReference(fixture, result.stderrRef),
        syncReference(fixture, result.metadataRef),
      ]);
      return result;
    },

    async writeScenario(record) {
      await validateExistingScenarios(fixture);
      const result = await core.writeScenario(record);
      await syncDurableFile(join(fixture.artifactsRoot, 'scenarios.json'));
      return result;
    },

    async writeEnvironment(environment) {
      const result = await core.writeEnvironment(environment);
      await syncReference(fixture, result.ref);
      return result;
    },

    async readScenarios() {
      await validateExistingScenarios(fixture);
      return core.readScenarios();
    },

    async finalize(options) {
      await validateExistingScenarios(fixture);
      const result = await core.finalize(options);
      await Promise.all([
        syncDurableFile(join(fixture.artifactsRoot, 'environment.json')),
        syncDurableFile(join(fixture.artifactsRoot, 'scenarios.json')),
        syncReference(fixture, result.ref),
      ]);
      return result;
    },
  };
}
