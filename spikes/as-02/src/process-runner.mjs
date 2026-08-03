import { spawn } from 'node:child_process';

import { as02Error, assertAs02 } from './errors.mjs';

export function runProcess({ file, args = [], cwd, env = {}, timeoutMs = 30_000, signal }) {
  assertAs02(typeof file === 'string' && file.length > 0, 'PROCESS_FAILED', 'Process file is required.');
  assertAs02(Array.isArray(args) && args.every((value) => typeof value === 'string'), 'PROCESS_FAILED', 'Process args must be strings.');
  assertAs02(typeof cwd === 'string' && cwd.length > 0, 'PROCESS_FAILED', 'Process cwd is required.');
  assertAs02(Number.isInteger(timeoutMs) && timeoutMs > 0, 'PROCESS_FAILED', 'Process timeout must be a positive integer.');

  const startedAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    let timer;
    let child;
    const stdout = [];
    const stderr = [];

    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    };

    try {
      child = spawn(file, args, {
        cwd,
        env,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        signal,
        windowsHide: true,
      });
    } catch (cause) {
      reject(as02Error('PROCESS_FAILED', `Failed to spawn ${file}.`, {
        file,
        args,
        cause: cause instanceof Error ? cause.message : String(cause),
      }));
      return;
    }

    child.stdout.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));

    child.once('error', (cause) => {
      finishReject(as02Error(timedOut ? 'PROCESS_TIMEOUT' : 'PROCESS_FAILED', `Process ${file} failed.`, {
        file,
        args,
        cause: cause instanceof Error ? cause.message : String(cause),
      }));
    });

    child.once('close', (exitCode, closeSignal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (timedOut) {
        reject(as02Error('PROCESS_TIMEOUT', `Process ${file} exceeded ${timeoutMs} ms.`, {
          file,
          args,
          timeoutMs,
        }));
        return;
      }
      resolve({
        exitCode,
        signal: closeSignal,
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr),
        startedAt,
        finishedAt: new Date().toISOString(),
      });
    });

    timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    timer.unref?.();
  });
}
