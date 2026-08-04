import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

test('root verification includes deterministic TC-01 tests and an explicit real command', async () => {
  assert.equal(packageJson.scripts['test:tc01'], 'node scripts/run-tc01-tests.mjs');
  assert.equal(packageJson.scripts.tc01, 'node spikes/tc-01/src/cli.mjs');
  assert.match(packageJson.scripts.verify, /npm run test:tc01/u);

  const readme = await readFile('spikes/tc-01/README.md', 'utf8');
  assert.match(readme, /deterministic tests do not invoke the real Treehouse binary/iu);
  assert.match(readme, /npm run tc01 -- run/iu);
  assert.match(readme, /never use.*--force/iu);
});
