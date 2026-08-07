import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const PROCESS_RUNNER_SPECIFIER = '../../src/runtime/' + 'process-runner.js';

interface ProcessSpec {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly stdoutLimitBytes: number;
  readonly stderrLimitBytes: number;
}

interface ProcessResult {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: Buffer;
  readonly stderr: Buffer;
  readonly timedOut: boolean;
}

interface ProcessRunnerModule {
  runProcess(spec: ProcessSpec): Promise<ProcessResult>;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadProcessRunner(): Promise<ProcessRunnerModule> {
  try {
    return await import(PROCESS_RUNNER_SPECIFIER) as ProcessRunnerModule;
  } catch (error) {
    assert.fail(`M01 process runner is not implemented: ${describeError(error)}`);
  }
}

async function withTemporaryDirectory<T>(operation: (directory: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mnfs-m01-process-runner-'));
  try {
    return await operation(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

async function waitForProcessExit(pid: number): Promise<void> {
  const deadline = Date.now() + 2_000;
  while (processExists(pid) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.equal(processExists(pid), false, `descendant process ${pid} survived timeout cleanup`);
}

test('preserves raw stdout and stderr bytes with closed stdin and explicit cwd/env', async () => {
  const runner = await loadProcessRunner();

  await withTemporaryDirectory(async (directory) => {
    const previousSecret = process.env.M01_PARENT_SECRET;
    process.env.M01_PARENT_SECRET = 'must-not-leak';
    try {
      const script = `
        const chunks = [];
        process.stdin.on('data', (chunk) => chunks.push(chunk));
        process.stdin.on('end', () => {
          const input = Buffer.concat(chunks);
          const valid = process.cwd() === process.argv[1]
            && process.env.M01_CHILD_TOKEN === 'child-only'
            && process.env.M01_PARENT_SECRET === undefined
            && input.length === 0;
          process.stdout.write(Buffer.from([0, 255, 10, 65]));
          process.stderr.write(Buffer.from([1, 2, 3, 254]));
          if (!valid) process.exitCode = 17;
        });
      `;

      const result = await runner.runProcess({
        executable: process.execPath,
        args: ['-e', script, directory],
        cwd: directory,
        env: { M01_CHILD_TOKEN: 'child-only' },
        timeoutMs: 2_000,
        stdoutLimitBytes: 64,
        stderrLimitBytes: 64,
      });

      assert.equal(result.exitCode, 0);
      assert.equal(result.signal, null);
      assert.equal(result.timedOut, false);
      assert.deepEqual(result.stdout, Buffer.from([0, 255, 10, 65]));
      assert.deepEqual(result.stderr, Buffer.from([1, 2, 3, 254]));
    } finally {
      if (previousSecret === undefined) delete process.env.M01_PARENT_SECRET;
      else process.env.M01_PARENT_SECRET = previousSecret;
    }
  });
});

test('fails closed when stdout exceeds the exact byte limit', async () => {
  const runner = await loadProcessRunner();

  await withTemporaryDirectory(async (directory) => {
    await assert.rejects(runner.runProcess({
      executable: process.execPath,
      args: ['-e', 'process.stdout.write(Buffer.alloc(9, 65))'],
      cwd: directory,
      env: {},
      timeoutMs: 2_000,
      stdoutLimitBytes: 8,
      stderrLimitBytes: 8,
    }));
  });
});

test('reports spawn failure without shell or fallback execution', async () => {
  const runner = await loadProcessRunner();

  await withTemporaryDirectory(async (directory) => {
    await assert.rejects(runner.runProcess({
      executable: '/definitely/missing/mnfs-task2-red',
      args: ['echo', 'must-not-run'],
      cwd: directory,
      env: {},
      timeoutMs: 200,
      stdoutLimitBytes: 64,
      stderrLimitBytes: 64,
    }));
  });
});

test('terminates the complete Linux descendant process group on timeout', async () => {
  const runner = await loadProcessRunner();

  await withTemporaryDirectory(async (directory) => {
    const pidPath = path.join(directory, 'grandchild.pid');
    const script = `
      const { spawn } = require('node:child_process');
      const { writeFileSync } = require('node:fs');
      const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        stdio: 'ignore',
      });
      writeFileSync(${JSON.stringify(pidPath)}, String(child.pid));
      setInterval(() => {}, 1000);
    `;

    const result = await runner.runProcess({
      executable: process.execPath,
      args: ['-e', script],
      cwd: directory,
      env: {},
      timeoutMs: 150,
      stdoutLimitBytes: 64,
      stderrLimitBytes: 64,
    });

    assert.equal(result.timedOut, true);
    const descendantPid = Number((await readFile(pidPath, 'utf8')).trim());
    assert.equal(Number.isSafeInteger(descendantPid) && descendantPid > 0, true);
    await waitForProcessExit(descendantPid);
  });
});

test('keeps the termination grace period alive until a fresh process receives its result', () => {
  const moduleUrl = pathToFileURL(
    path.resolve('dist/src/runtime/process-runner.js'),
  ).href;
  const script = `
    import { runProcess } from ${JSON.stringify(moduleUrl)};
    const result = await runProcess({
      executable: process.execPath,
      args: ['-e', 'setInterval(() => {}, 1000)'],
      cwd: process.cwd(),
      env: {},
      timeoutMs: 50,
      stdoutLimitBytes: 64,
      stderrLimitBytes: 64,
    });
    process.stdout.write(result.timedOut ? 'settled' : 'not-timed-out');
  `;

  const fresh = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: process.cwd(),
      env: {},
      encoding: 'utf8',
      timeout: 5_000,
    },
  );

  assert.equal(fresh.status, 0, fresh.stderr);
  assert.equal(fresh.stdout, 'settled');
});
