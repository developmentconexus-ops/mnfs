import { spawn } from 'node:child_process';

import { assertTc01, tc01Error } from './errors.mjs';

const DEFAULT_OUTPUT_LIMIT = 65_536;
const KILL_GRACE_MS = 2_000;

export async function runProcess(spec) {
  validateSpec(spec);

  const stdoutLimitBytes = spec.stdoutLimitBytes ?? DEFAULT_OUTPUT_LIMIT;
  const stderrLimitBytes = spec.stderrLimitBytes ?? DEFAULT_OUTPUT_LIMIT;
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const useProcessGroup = process.platform !== 'win32';

  return new Promise((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    let terminalError = null;
    let stdoutBytes = 0;
    let stderrBytes = 0;
    const stdoutChunks = [];
    const stderrChunks = [];
    let timeoutHandle;
    let killHandle;

    const child = spawn(spec.file, spec.args, {
      cwd: spec.cwd,
      env: spec.env,
      shell: false,
      detached: useProcessGroup,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const cleanupTimers = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (killHandle) clearTimeout(killHandle);
    };

    const boundedBuffers = () => ({
      stdout: Buffer.concat(stdoutChunks, stdoutBytes),
      stderr: Buffer.concat(stderrChunks, stderrBytes),
    });

    const signalProcessTree = (signal) => {
      if (!child.pid) return;
      try {
        if (useProcessGroup) process.kill(-child.pid, signal);
        else child.kill(signal);
      } catch (error) {
        if (error?.code !== 'ESRCH') throw error;
      }
    };

    const requestTermination = () => {
      if (child.exitCode !== null || child.signalCode !== null) return;
      signalProcessTree('SIGTERM');
      killHandle = setTimeout(() => {
        try {
          signalProcessTree('SIGKILL');
        } catch {
          // Close handling below remains authoritative; a missing group is already terminated.
        }
      }, KILL_GRACE_MS);
      killHandle.unref?.();
    };

    const registerLimitFailure = (stream, limitBytes, observedBytes) => {
      if (terminalError) return;
      terminalError = tc01Error('TC01_OUTPUT_LIMIT', `${stream} exceeded the TC-01 byte limit.`, {
        stream,
        limitBytes,
        observedBytes,
      });
      requestTermination();
    };

    child.stdout.on('data', (chunk) => {
      const bytes = Buffer.from(chunk);
      const remaining = Math.max(0, stdoutLimitBytes - stdoutBytes);
      if (remaining > 0) {
        const accepted = bytes.subarray(0, remaining);
        stdoutChunks.push(accepted);
        stdoutBytes += accepted.length;
      }
      if (bytes.length > remaining) {
        registerLimitFailure('stdout', stdoutLimitBytes, stdoutBytes + (bytes.length - remaining));
      }
    });

    child.stderr.on('data', (chunk) => {
      const bytes = Buffer.from(chunk);
      const remaining = Math.max(0, stderrLimitBytes - stderrBytes);
      if (remaining > 0) {
        const accepted = bytes.subarray(0, remaining);
        stderrChunks.push(accepted);
        stderrBytes += accepted.length;
      }
      if (bytes.length > remaining) {
        registerLimitFailure('stderr', stderrLimitBytes, stderrBytes + (bytes.length - remaining));
      }
    });

    child.once('error', (cause) => {
      if (settled) return;
      settled = true;
      cleanupTimers();
      reject(tc01Error('TC01_PROCESS_SPAWN_FAILED', `Failed to spawn ${spec.file}.`, {
        file: spec.file,
        args: [...spec.args],
        causeCode: cause?.code ?? null,
        causeMessage: cause?.message ?? String(cause),
      }));
    });

    child.once('close', (exitCode, signal) => {
      if (settled) return;
      settled = true;
      cleanupTimers();
      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - startedMs;
      const output = boundedBuffers();

      if (terminalError) {
        const error = tc01Error(terminalError.code, terminalError.message, {
          ...terminalError.details,
          exitCode,
          signal,
          timedOut,
          stdout: output.stdout,
          stderr: output.stderr,
        });
        reject(error);
        return;
      }

      if (timedOut) {
        reject(tc01Error('TC01_PROCESS_TIMEOUT', `Process exceeded ${spec.timeoutMs} ms.`, {
          file: spec.file,
          args: [...spec.args],
          timeoutMs: spec.timeoutMs,
          exitCode,
          signal,
          stdout: output.stdout,
          stderr: output.stderr,
        }));
        return;
      }

      resolve({
        startedAt,
        finishedAt,
        durationMs,
        exitCode,
        signal,
        stdout: output.stdout,
        stderr: output.stderr,
        timedOut: false,
      });
    });

    timeoutHandle = setTimeout(() => {
      if (
        settled
        || terminalError
        || child.exitCode !== null
        || child.signalCode !== null
      ) return;
      timedOut = true;
      requestTermination();
    }, spec.timeoutMs);
    timeoutHandle.unref?.();
  });
}

function validateSpec(spec) {
  assertTc01(spec && typeof spec === 'object' && !Array.isArray(spec), 'TC01_INVALID_INPUT', 'Process spec must be an object.');
  assertTc01(typeof spec.file === 'string' && spec.file.length > 0, 'TC01_INVALID_INPUT', 'Process file must be a non-empty string.');
  assertTc01(Array.isArray(spec.args) && spec.args.every((item) => typeof item === 'string'), 'TC01_INVALID_INPUT', 'Process args must be an array of strings.');
  assertTc01(typeof spec.cwd === 'string' && spec.cwd.length > 0, 'TC01_INVALID_INPUT', 'Process cwd must be a non-empty string.');
  assertTc01(spec.env && typeof spec.env === 'object' && !Array.isArray(spec.env), 'TC01_INVALID_INPUT', 'Process env must be an object.');
  assertPositiveInteger(spec.timeoutMs, 'timeoutMs');
  if (spec.stdoutLimitBytes !== undefined) assertPositiveInteger(spec.stdoutLimitBytes, 'stdoutLimitBytes');
  if (spec.stderrLimitBytes !== undefined) assertPositiveInteger(spec.stderrLimitBytes, 'stderrLimitBytes');
}

function assertPositiveInteger(value, label) {
  assertTc01(Number.isSafeInteger(value) && value > 0, 'TC01_INVALID_INPUT', `${label} must be a positive safe integer.`, { label, value });
}
