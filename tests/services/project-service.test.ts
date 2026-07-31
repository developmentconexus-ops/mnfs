import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { initializeProject } from '../../src/services/project-service.js';

function makeGitRepository(): string {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-project-'));
  const result = spawnSync('git', ['init', '-b', 'main'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  mkdirSync(join(root, 'nested', 'path'), { recursive: true });
  return root;
}

test('initialization writes one stable repository identity and is idempotent', () => {
  const root = makeGitRepository();
  const input = {
    cwd: join(root, 'nested', 'path'),
    now: () => '2026-07-31T18:30:00.000Z',
    createId: () => '018f8472-a2fd-7ca7-a090-5f43f50f7142',
  };

  const first = initializeProject(input);
  const second = initializeProject({
    ...input,
    now: () => '2027-01-01T00:00:00.000Z',
    createId: () => 'different-id-must-not-be-used',
  });

  assert.deepEqual(first, {
    schemaVersion: 1,
    repoId: '018f8472-a2fd-7ca7-a090-5f43f50f7142',
    createdAt: '2026-07-31T18:30:00.000Z',
    projectRoot: root,
  });
  assert.deepEqual(second, first);

  const persisted = JSON.parse(readFileSync(join(root, '.mnfs', 'repo.json'), 'utf8'));
  assert.deepEqual(persisted, {
    schemaVersion: 1,
    repoId: first.repoId,
    createdAt: first.createdAt,
  });
});
