import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { createFixture, cleanupFixture } from '../src/fixture.mjs';
import { runProcess } from '../src/process-runner.mjs';

test('disposable repository contains an offline Node and TypeScript toolchain proof', async () => {
  const baseRoot = await mkdtemp(join(tmpdir(), 'mnfs-as02-toolchain-fixture-'));
  const fixture = await createFixture({ baseRoot, runId: 'offline-toolchain', runner: runProcess });
  try {
    const packageJson = JSON.parse(await readFile(join(fixture.worktreePath, 'package.json'), 'utf8'));
    assert.deepEqual(packageJson.scripts, {
      test: 'node --test test/*.test.mjs',
    });
    assert.equal(packageJson.dependencies, undefined);
    assert.equal(packageJson.devDependencies, undefined);
    assert.match(await readFile(join(fixture.worktreePath, 'src', 'demo.ts'), 'utf8'), /const message: string/u);
    assert.match(await readFile(join(fixture.worktreePath, 'test', 'demo.test.mjs'), 'utf8'), /node:test/u);
    assert.deepEqual(JSON.parse(await readFile(join(fixture.worktreePath, 'tsconfig.json'), 'utf8')), {
      compilerOptions: {
        noEmit: true,
        strict: true,
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
      },
      include: ['src/**/*.ts'],
    });
  } finally {
    await cleanupFixture(fixture);
    await rm(baseRoot, { recursive: true, force: true });
  }
});
