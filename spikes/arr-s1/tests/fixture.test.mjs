import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { createS1Fixture, verifyFixtureResult } from '../src/fixture.mjs';

const execFileAsync = promisify(execFile);

test('creates a disposable Git fixture with a hidden nonce, explicit inventory and checkpoints', async () => {
  const fixture = await createS1Fixture();
  try {
    const git = await execFileAsync('git', ['-C', fixture.workspacePath, 'rev-parse', '--is-inside-work-tree']);
    assert.equal(git.stdout.trim(), 'true');
    assert.equal(fixture.prompt.includes(fixture.nonce), false);
    assert.match(fixture.prompt, /read.*nonce|nonce.*read/iu);
    assert.equal(fixture.inventory.length, 2);
    assert.deepEqual(
      fixture.inventory.map(({ id, kind }) => ({ id, kind })),
      [
        { id: 'read_nonce_file', kind: 'resource' },
        { id: 'edit_result_file', kind: 'tool' },
      ],
    );
    assert.deepEqual(
      fixture.checkpoints.map(({ id }) => id),
      ['CANCELLATION_BEFORE_FINALIZED', 'PROCESS_DEATH_BEFORE_FINALIZED', 'FRESH_RECOVERY'],
    );
    assert.equal(fixture.expectedTree.changedPaths.length, 1);
    assert.equal(fixture.expectedTree.changedPaths[0], fixture.targetRelativePath);
  } finally {
    await fixture.dispose();
    await assert.rejects(() => readFile(fixture.nonceFilePath));
  }
});

test('requires a real nonce read and independently verifies exactly one deterministic Git edit', async () => {
  const fixture = await createS1Fixture();
  try {
    const nonceText = await readFile(fixture.nonceFilePath, 'utf8');
    const nonce = nonceText.trim().replace(/^NONCE=/u, '');
    assert.equal(nonce, fixture.nonce);

    const resultWithoutRead = await verifyFixtureResult(fixture, {
      toolCalls: [{ id: 'edit_result_file', path: fixture.targetRelativePath }],
    });
    assert.equal(resultWithoutRead.ok, false);
    assert.ok(resultWithoutRead.errors.some((error) => /real.*nonce|read_nonce_file/u.test(error)));

    await execFileAsync('node', ['-e',
      `const fs=require('node:fs');fs.writeFileSync(${JSON.stringify(fixture.targetFilePath)}, ${JSON.stringify(fixture.expectedTree.targetContent)})`,
    ]);
    const result = await verifyFixtureResult(fixture, {
      toolCalls: [{
        id: 'read_nonce_file',
        path: fixture.nonceRelativePath,
        value: nonce,
      }, {
        id: 'edit_result_file',
        path: fixture.targetRelativePath,
      }],
    });
    assert.equal(result.ok, true, result.errors.join('; '));
    assert.deepEqual(result.changedPaths, [fixture.targetRelativePath]);
    assert.equal(result.treeSha, fixture.expectedTree.treeSha);
  } finally {
    await fixture.dispose();
  }
});
