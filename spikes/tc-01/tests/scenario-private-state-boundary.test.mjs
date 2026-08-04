import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('S13 snapshots real private state immediately before and after status observation', async () => {
  const source = await readFile('spikes/tc-01/src/scenario-runner.mjs', 'utf8');
  const start = source.indexOf("'TC01-S13'");
  const end = source.indexOf("'TC01-S14'", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const s13 = source.slice(start, end);

  assert.doesNotMatch(source, /context\.privateBefore/u);
  const before = s13.indexOf("label: 'S13-private-before-status'");
  const status = s13.indexOf("observeLease(lease, 'S13 status identity')");
  const after = s13.indexOf("label: 'S13-private-after-status'");
  assert.equal(before >= 0, true);
  assert.equal(status > before, true);
  assert.equal(after > status, true);
});
