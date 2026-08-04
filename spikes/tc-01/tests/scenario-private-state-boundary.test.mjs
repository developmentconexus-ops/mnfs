import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('S13 private-state facade records an immediate baseline around status observation', async () => {
  const facade = await readFile('spikes/tc-01/src/scenario-runner.mjs', 'utf8');
  const core = await readFile('spikes/tc-01/src/scenario-runner-core.mjs', 'utf8');

  assert.match(facade, /scenario-runner-core\.mjs/u);
  assert.match(facade, /label: 'S13-private-before-status'/u);
  assert.match(facade, /'S13-private-after-status'/u);
  assert.match(facade, /replaceObject\(mutablePrivateBaseline, immediateBefore\)/u);

  const before = facade.indexOf("label: 'S13-private-before-status'");
  const status = facade.indexOf('return originalObserveStatus(...args)');
  assert.equal(before >= 0, true);
  assert.equal(status > before, true);

  assert.match(core, /'TC01-S13'/u);
  assert.match(core, /privateStateChanged/u);
  assert.match(core, /TREEHOUSE_PRIVATE_STATE_NORMALIZATION/u);
});
