import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

import { runProcess } from '../src/process-runner.mjs';

async function scriptFixture(t, source) {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-process-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = join(root, 'child.mjs');
  await writeFile(file, source, 'utf8');
  await chmod(file, 0o755);
  return { root, file };
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') return false;
    throw error;
  }
}

test('preserves stdout and stderr bytes with closed stdin', async (t) => {
  const fixture = await scriptFixture(t, `
    process.stdout.write(Buffer.from([0x41, 0x00, 0x42]));
    process.stderr.write('warning\\n');
  `);
  const result = await runProcess({
    file: process.execPath,
    args: [fixture.file],
    cwd: fixture.root,
    env: {},
    timeoutMs: 1_000,
  });
  assert.deepEqual(result.stdout, Buffer.from([0x41, 0x00, 0x42]));
  assert.deepEqual(result.stderr, Buffer.from('warning\n'));
  assert.equal(result.exitCode, 0);
  assert.equal(result.signal, null);
  assert.equal(result.timedOut, false);
});

test('terminates at timeout with TC01_PROCESS_TIMEOUT', async (t) => {
  const fixture = await scriptFixture(t, `setInterval(() => {}, 1_000);`);
  await assert.rejects(
    runProcess({ file: process.execPath, args: [fixture.file], cwd: fixture.root, env: {}, timeoutMs: 20 }),
    (error) => error?.code === 'TC01_PROCESS_TIMEOUT',
  );
});

test('terminates the complete descendant process group on timeout', async (t) => {
  const pidPath = join(tmpdir(), `mnfs-tc01-grandchild-${process.pid}-${Date.now()}.pid`);
  t.after(() => rm(pidPath, { force: true }));
  const fixture = await scriptFixture(t, `
    import { spawn } from 'node:child_process';
    import { writeFileSync } from 'node:fs';
    const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
    writeFileSync(${JSON.stringify(pidPath)}, String(grandchild.pid));
    setInterval(() => {}, 1000);
  `);

  await assert.rejects(
    runProcess({ file: process.execPath, args: [fixture.file], cwd: fixture.root, env: {}, timeoutMs: 250 }),
    (error) => error?.code === 'TC01_PROCESS_TIMEOUT',
  );

  const grandchildPid = Number(await readFile(pidPath, 'utf8'));
  assert.equal(Number.isSafeInteger(grandchildPid) && grandchildPid > 0, true);
  t.after(() => {
    if (processExists(grandchildPid)) process.kill(grandchildPid, 'SIGKILL');
  });
  await delay(100);
  assert.equal(processExists(grandchildPid), false, `grandchild ${grandchildPid} survived the TC-01 timeout`);
});

test('rejects output beyond the exact byte bound', async (t) => {
  const fixture = await scriptFixture(t, `process.stdout.write(Buffer.alloc(2_048, 0x61));`);
  await assert.rejects(
    runProcess({
      file: process.execPath,
      args: [fixture.file],
      cwd: fixture.root,
      env: {},
      timeoutMs: 1_000,
      stdoutLimitBytes: 1_024,
    }),
    (error) => error?.code === 'TC01_OUTPUT_LIMIT',
  );
});

test('reports spawn failure without fallback', async (t) => {
  const fixture = await scriptFixture(t, ``);
  await assert.rejects(
    runProcess({ file: join(fixture.root, 'missing'), args: [], cwd: fixture.root, env: {}, timeoutMs: 1_000 }),
    (error) => error?.code === 'TC01_PROCESS_SPAWN_FAILED',
  );
});
