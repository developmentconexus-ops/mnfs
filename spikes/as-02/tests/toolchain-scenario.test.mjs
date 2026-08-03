import assert from 'node:assert/strict';
import test from 'node:test';

import { toolchainScenarios } from '../scenarios/toolchain.mjs';

test('S10 uses the exact trusted TypeScript compiler without npx or network setup', () => {
  const worktreePath = '/tmp/mnfs-as-02/run/treehouse/leased';
  const tscPath = '/home/user/src/mnfs/node_modules/typescript/bin/tsc';
  const [scenario] = toolchainScenarios({
    fixture: { worktreePath },
    toolchain: { tscPath },
  });

  assert.equal(scenario.scenarioId, 'S10');
  assert.deepEqual(scenario.argv.slice(0, 2), ['/bin/bash', '-c']);
  assert.match(scenario.argv[2], new RegExp(`node '${tscPath.replaceAll('/', '\\/')}' --noEmit -p tsconfig\\.json`, 'u'));
  assert.match(scenario.argv[2], /npm test --silent/u);
  assert.doesNotMatch(scenario.argv[2], /npx|npm install|npm ci/u);
  assert.deepEqual(scenario.targetPaths, [worktreePath]);
});
