import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const ENTRY_PATH = resolve('src/cli/entry.ts');

function entrySource(): string {
  return readFileSync(ENTRY_PATH, 'utf8');
}

test('production composition launches the fixed LeaseActionRunner child entry instead of running it in-process', () => {
  const source = entrySource();
  for (const flag of [
    '--action-root',
    '--operation',
    '--action-token',
    '--operation-sha256',
  ]) {
    assert.match(source, new RegExp(flag, 'u'));
  }
  assert.match(source, /await runProcess\([\s\S]*?process\.execPath/u);
  assert.doesNotMatch(source, /new LeaseActionRunner\(/u);
  assert.doesNotMatch(source, /\.run\(\{[\s\S]*?expectedOperationSha256/u);
});

test('release observation and launch never create missing Treehouse control state', () => {
  const source = entrySource();
  assert.match(
    source,
    /observe:\s*async\s*\(\{\s*kind,\s*writeTrack,\s*attempt,\s*lease\s*\}\)[\s\S]*?attemptPhysicalRuntime\([\s\S]*?kind\s*===\s*'GRANT'/u,
  );
  assert.match(
    source,
    /attemptPhysicalRuntime\(\s*context,\s*track,\s*attempt,\s*input\.kind\s*===\s*'GRANT'/u,
  );
});

test('runtime directory creation walks one component at a time without recursive symlink traversal', () => {
  const source = entrySource();
  assert.match(source, /async function ensureContainedDirectoryTree/u);
  assert.match(source, /lstat\(current\)/u);
  assert.match(source, /mkdir\(current,\s*\{\s*mode:\s*0o700\s*\}\)/u);
  assert.doesNotMatch(source, /recursive:\s*true/u);
});

test('Recovery proves the observation path is non-mutating before invoking source or Treehouse adapters', () => {
  const source = entrySource();
  assert.match(source, /async function canObservePhysicalWithoutMutation/u);
  assert.match(
    source,
    /if\s*\(await canObservePhysicalWithoutMutation\(context,\s*track,\s*attempt\)\)[\s\S]*?attemptPhysicalRuntime\(context,\s*track,\s*attempt,\s*false\)/u,
  );
  assert.doesNotMatch(
    source,
    /async function recoveryObservation[\s\S]*?ensureTreehouseControl\(/u,
  );
});
