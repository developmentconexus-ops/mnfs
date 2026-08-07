import assert from 'node:assert/strict';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { ProbeCommandError, runProbeCommand } from '../src/process.mjs';

async function makeFixture() {
  const temp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-process-'));
  const fixture = path.join(temp, 'fixture.mjs');
  await writeFile(fixture, `
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
const [mode, ...rest] = process.argv.slice(2);
if (mode === 'inspect') {
  let stdinBytes = 0;
  try { stdinBytes = readFileSync(0).length; } catch {}
  process.stdout.write(JSON.stringify({
    argv: rest,
    cwd: process.cwd(),
    env: {
      TEST_VISIBLE: process.env.TEST_VISIBLE ?? null,
      HOME: process.env.HOME ?? null,
      HTTP_PROXY: process.env.HTTP_PROXY ?? null,
    },
    stdinBytes,
  }));
} else if (mode === 'output') {
  process.stdout.write('x'.repeat(Number(rest[0])));
} else if (mode === 'descendant') {
  const marker = rest[0];
  spawn(process.execPath, ['-e', \`const fs=require('node:fs'); setTimeout(()=>fs.writeFileSync(${JSON.stringify('${marker}')},'alive'), 500); setInterval(()=>{},1000);\`], { stdio: 'ignore' });
  setInterval(() => {}, 1000);
}
`, 'utf8');
  return { temp, fixture };
}

test('probe runner uses exact argv, closed stdin and only explicit environment', async () => {
  const { temp, fixture } = await makeFixture();
  try {
    const result = await runProbeCommand({
      argv: [process.execPath, fixture, 'inspect', 'a b', '$literal', '--flag=value'],
      cwd: temp,
      env: { TEST_VISIBLE: 'yes' },
      timeoutMs: 3000,
      outputLimitBytes: 4096,
    });
    assert.equal(result.exitCode, 0);
    const payload = JSON.parse(result.stdout.toString('utf8'));
    assert.deepEqual(payload.argv, ['a b', '$literal', '--flag=value']);
    assert.equal(payload.cwd, temp);
    assert.deepEqual(payload.env, { TEST_VISIBLE: 'yes', HOME: null, HTTP_PROXY: null });
    assert.equal(payload.stdinBytes, 0);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('probe runner rejects output above the exact byte limit', async () => {
  const { temp, fixture } = await makeFixture();
  try {
    await assert.rejects(
      () => runProbeCommand({
        argv: [process.execPath, fixture, 'output', '33'],
        cwd: temp,
        env: {},
        timeoutMs: 3000,
        outputLimitBytes: 32,
      }),
      (error) => error instanceof ProbeCommandError && error.code === 'OUTPUT_LIMIT',
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('probe runner terminates the complete descendant process group on timeout', async () => {
  const { temp, fixture } = await makeFixture();
  const marker = path.join(temp, 'descendant-marker');
  try {
    await assert.rejects(
      () => runProbeCommand({
        argv: [process.execPath, fixture, 'descendant', marker],
        cwd: temp,
        env: {},
        timeoutMs: 100,
        outputLimitBytes: 4096,
      }),
      (error) => error instanceof ProbeCommandError && error.code === 'TIMEOUT',
    );
    await new Promise((resolve) => setTimeout(resolve, 700));
    await assert.rejects(() => access(marker));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('spawn failure returns a typed probe error and never falls back to a shell', async () => {
  await assert.rejects(
    () => runProbeCommand({
      argv: ['/definitely/missing/mnfs-arr-s0-command'],
      cwd: '/',
      env: {},
      timeoutMs: 500,
      outputLimitBytes: 1024,
    }),
    (error) => error instanceof ProbeCommandError && error.code === 'SPAWN_FAILED',
  );
});
