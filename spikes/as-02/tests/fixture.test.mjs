import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { runProcess } from '../src/process-runner.mjs';
import {
  cleanupFixture,
  createFixture,
  digestResources,
  discoverGitMetadata,
} from '../src/fixture.mjs';

function sha256(buffer) {
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
}

test('process runner preserves stdout and stderr bytes without a shell', async () => {
  const result = await runProcess({
    file: process.execPath,
    args: ['-e', 'process.stdout.write("out"); process.stderr.write("err")'],
    cwd: process.cwd(),
    env: { PATH: process.env.PATH ?? '' },
    timeoutMs: 5_000,
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.signal, null);
  assert.equal(Buffer.isBuffer(result.stdout), true);
  assert.equal(Buffer.isBuffer(result.stderr), true);
  assert.equal(result.stdout.toString('utf8'), 'out');
  assert.equal(result.stderr.toString('utf8'), 'err');
  assert.match(result.startedAt, /^\d{4}-\d{2}-\d{2}T/u);
  assert.match(result.finishedAt, /^\d{4}-\d{2}-\d{2}T/u);
});

test('rejects unsafe run ids before creating any fixture path', async () => {
  const baseRoot = await mkdtemp(join(tmpdir(), 'mnfs-as02-fixture-base-'));
  try {
    for (const runId of ['', '../escape', 'UPPER', 'space value', 'a/b']) {
      await assert.rejects(
        () => createFixture({ baseRoot, runId, runner: runProcess }),
        (error) => error?.code === 'INVALID_RUN_ID',
      );
    }
  } finally {
    await rm(baseRoot, { recursive: true, force: true });
  }
});

test('creates synthetic sentinels before policy compilation and exposes digests only', async () => {
  const baseRoot = await mkdtemp(join(tmpdir(), 'mnfs-as02-fixture-base-'));
  const historicalPath = '.mnfs/missions/MIS-002/plan.json';
  const historicalBefore = sha256(await readFile(historicalPath));
  const fixture = await createFixture({ baseRoot, runId: 'fixture-safe', runner: runProcess });

  try {
    assert.equal(fixture.root.startsWith(`${baseRoot}/`), true);
    assert.equal(fixture.sourceRepo.startsWith(`${fixture.root}/`), true);
    assert.equal(fixture.worktreePath.startsWith(`${fixture.root}/`), true);
    assert.equal(fixture.marker.includes('fixture-safe'), true);

    for (const path of Object.values(fixture.protectedResources)) await access(path);

    const digests = await digestResources(fixture.protectedResources);
    assert.deepEqual(Object.keys(digests).sort(), Object.keys(fixture.protectedResources).sort());
    for (const digest of Object.values(digests)) assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
    assert.doesNotMatch(JSON.stringify(digests), new RegExp(fixture.marker, 'u'));

    const metadata = await discoverGitMetadata(fixture.worktreePath, runProcess);
    assert.equal(metadata.commonDir, join(fixture.sourceRepo, '.git'));
    assert.equal(metadata.gitDir.startsWith(`${metadata.commonDir}/worktrees/`), true);
    assert.equal(metadata.config, join(metadata.commonDir, 'config'));
    assert.equal(metadata.hooks, join(metadata.commonDir, 'hooks'));
    assert.equal(metadata.index, join(metadata.gitDir, 'index'));

    assert.equal(sha256(await readFile(historicalPath)), historicalBefore);
  } finally {
    await cleanupFixture(fixture);
    await rm(baseRoot, { recursive: true, force: true });
  }
});

test('cleanup removes only registered run paths and reports protected-resource tampering', async () => {
  const baseRoot = await mkdtemp(join(tmpdir(), 'mnfs-as02-fixture-base-'));
  const unrelated = join(baseRoot, 'unrelated.txt');
  await writeFile(unrelated, 'keep');
  const fixture = await createFixture({ baseRoot, runId: 'fixture-tamper', runner: runProcess });

  await writeFile(fixture.protectedResources.outsideWrite, 'tampered');

  await assert.rejects(
    () => cleanupFixture(fixture),
    (error) => error?.code === 'FIXTURE_INTEGRITY_VIOLATION',
  );

  assert.equal(existsSync(fixture.root), false);
  assert.equal(await readFile(unrelated, 'utf8'), 'keep');
  await rm(baseRoot, { recursive: true, force: true });
});
