import { spawn } from 'node:child_process';

import { MnfsError } from '../domain/errors.js';

export interface ProcessSpec {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly stdoutLimitBytes: number;
  readonly stderrLimitBytes: number;
}

export interface ProcessResult {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: Buffer;
  readonly stderr: Buffer;
  readonly timedOut: boolean;
}

const TERMINATION_GRACE_MS = 100;

function invalidProcessSpec(message: string): never {
  throw new MnfsError('INTERNAL_ERROR', message);
}

function requirePositiveInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    invalidProcessSpec(`${label} must be a positive safe integer; received ${value}.`);
  }
  return value;
}

function signalProcessGroup(pid: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-pid, signal);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
      throw error;
    }
  }
}

async function terminateProcessGroup(pid: number): Promise<void> {
  signalProcessGroup(pid, 'SIGTERM');
  await new Promise<void>((resolve) => {
    setTimeout(resolve, TERMINATION_GRACE_MS);
  });
  signalProcessGroup(pid, 'SIGKILL');
}

export async function runProcess(spec: ProcessSpec): Promise<ProcessResult> {
  if (process.platform !== 'linux') {
    invalidProcessSpec('The M01 process runner requires Linux process-group semantics.');
  }

  const timeoutMs = requirePositiveInteger(spec.timeoutMs, 'Process timeout');
  const stdoutLimitBytes = requirePositiveInteger(
    spec.stdoutLimitBytes,
    'stdout byte limit',
  );
  const stderrLimitBytes = requirePositiveInteger(
    spec.stderrLimitBytes,
    'stderr byte limit',
  );

  return await new Promise<ProcessResult>((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    let failure: Error | undefined;
    let closed:
      | { readonly exitCode: number | null; readonly signal: NodeJS.Signals | null }
      | undefined;
    let terminationFinished = true;
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;

    const finish = (): void => {
      if (settled || closed === undefined || !terminationFinished) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (failure !== undefined) {
        reject(failure);
        return;
      }
      resolve({
        exitCode: closed.exitCode,
        signal: closed.signal,
        stdout: Buffer.concat(stdoutChunks, stdoutBytes),
        stderr: Buffer.concat(stderrChunks, stderrBytes),
        timedOut,
      });
    };

    let child;
    try {
      child = spawn(spec.executable, [...spec.args], {
        cwd: spec.cwd,
        env: { ...spec.env },
        shell: false,
        detached: true,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      reject(new MnfsError(
        'INTERNAL_ERROR',
        `Failed to spawn ${spec.executable}: ${error instanceof Error ? error.message : String(error)}.`,
      ));
      return;
    }

    const terminate = (reason: Error | undefined, becauseTimeout: boolean): void => {
      if (!terminationFinished) {
        if (failure === undefined && reason !== undefined) {
          failure = reason;
        }
        timedOut ||= becauseTimeout;
        return;
      }
      const pid = child.pid;
      if (pid === undefined) {
        failure ??= reason ?? new MnfsError(
          'INTERNAL_ERROR',
          `Spawned process ${spec.executable} has no process id.`,
        );
        return;
      }
      failure ??= reason;
      timedOut ||= becauseTimeout;
      terminationFinished = false;
      void terminateProcessGroup(pid)
        .catch((error) => {
          failure ??= new MnfsError(
            'INTERNAL_ERROR',
            `Failed to terminate process group ${pid}: ${
              error instanceof Error ? error.message : String(error)
            }.`,
          );
        })
        .finally(() => {
          terminationFinished = true;
          finish();
        });
    };

    const collect = (
      chunk: Buffer,
      chunks: Buffer[],
      currentBytes: number,
      limitBytes: number,
      label: 'stdout' | 'stderr',
    ): number => {
      if (failure !== undefined) {
        return currentBytes;
      }
      const nextBytes = currentBytes + chunk.length;
      if (nextBytes > limitBytes) {
        terminate(
          new MnfsError(
            'INTERNAL_ERROR',
            `${label} exceeded its ${limitBytes}-byte limit for ${spec.executable}.`,
          ),
          false,
        );
        return currentBytes;
      }
      chunks.push(Buffer.from(chunk));
      return nextBytes;
    };

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutBytes = collect(
        chunk,
        stdoutChunks,
        stdoutBytes,
        stdoutLimitBytes,
        'stdout',
      );
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderrBytes = collect(
        chunk,
        stderrChunks,
        stderrBytes,
        stderrLimitBytes,
        'stderr',
      );
    });

    child.once('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(new MnfsError(
        'INTERNAL_ERROR',
        `Failed to spawn ${spec.executable}: ${error.message}.`,
      ));
    });

    child.once('close', (exitCode, signal) => {
      closed = { exitCode, signal };
      finish();
    });

    const timeout = setTimeout(() => {
      terminate(undefined, true);
    }, timeoutMs);
    timeout.unref();
  });
}
