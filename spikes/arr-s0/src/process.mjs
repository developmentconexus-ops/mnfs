import { spawn } from 'node:child_process';
import path from 'node:path';

export class ProbeCommandError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ProbeCommandError';
    this.code = code;
    this.details = details;
  }
}

function validateSpec(spec) {
  if (!spec || !Array.isArray(spec.argv) || spec.argv.length === 0) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe argv must be a non-empty array');
  }
  if (spec.argv.some((value) => typeof value !== 'string')) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe argv values must be strings');
  }
  if (!path.isAbsolute(spec.argv[0])) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe executable must be an absolute path');
  }
  if (typeof spec.cwd !== 'string' || !path.isAbsolute(spec.cwd)) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe cwd must be an absolute path');
  }
  if (!Number.isInteger(spec.timeoutMs) || spec.timeoutMs <= 0) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe timeoutMs must be a positive integer');
  }
  if (!Number.isInteger(spec.outputLimitBytes) || spec.outputLimitBytes <= 0) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe outputLimitBytes must be a positive integer');
  }
  if (!spec.env || typeof spec.env !== 'object' || Array.isArray(spec.env)) {
    throw new ProbeCommandError('INVALID_SPEC', 'probe env must be an explicit object');
  }
  for (const [key, value] of Object.entries(spec.env)) {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new ProbeCommandError('INVALID_SPEC', 'probe env values must be strings');
    }
  }
}

function terminateProcessGroup(child) {
  if (!child?.pid) return;
  if (process.platform !== 'win32') {
    try {
      process.kill(-child.pid, 'SIGKILL');
      return;
    } catch {}
  }
  try {
    child.kill('SIGKILL');
  } catch {}
}

export async function runProbeCommand(spec) {
  validateSpec(spec);
  const startedAtMs = Date.now();
  const [executable, ...args] = spec.argv;

  return await new Promise((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    let totalBytes = 0;
    const stdoutChunks = [];
    const stderrChunks = [];

    const child = spawn(executable, args, {
      cwd: spec.cwd,
      env: { ...spec.env },
      shell: false,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    };

    const account = (stream, chunk) => {
      if (settled) return;
      const bytes = Buffer.from(chunk);
      totalBytes += bytes.length;
      if (totalBytes > spec.outputLimitBytes) {
        terminateProcessGroup(child);
        finishReject(new ProbeCommandError(
          'OUTPUT_LIMIT',
          `probe output exceeded ${spec.outputLimitBytes} bytes`,
          { outputLimitBytes: spec.outputLimitBytes },
        ));
        return;
      }
      stream.push(bytes);
    };

    child.stdout?.on('data', (chunk) => account(stdoutChunks, chunk));
    child.stderr?.on('data', (chunk) => account(stderrChunks, chunk));

    child.once('error', (error) => {
      terminateProcessGroup(child);
      finishReject(new ProbeCommandError('SPAWN_FAILED', `probe spawn failed: ${error.message}`, {
        causeCode: error.code ?? null,
      }));
    });

    const timer = setTimeout(() => {
      if (settled) return;
      timedOut = true;
      terminateProcessGroup(child);
    }, spec.timeoutMs);

    child.once('close', (exitCode, signal) => {
      if (settled) return;
      clearTimeout(timer);
      if (timedOut) {
        finishReject(new ProbeCommandError('TIMEOUT', `probe timed out after ${spec.timeoutMs}ms`, {
          timeoutMs: spec.timeoutMs,
          signal: signal ?? null,
        }));
        return;
      }
      settled = true;
      resolve({
        argv: [...spec.argv],
        cwd: spec.cwd,
        exitCode,
        signal: signal ?? null,
        stdout: Buffer.concat(stdoutChunks),
        stderr: Buffer.concat(stderrChunks),
        durationMs: Date.now() - startedAtMs,
      });
    });
  });
}
