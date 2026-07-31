import { spawn } from 'node:child_process';

import { MnfsError } from '../domain/errors.js';

export interface LavishCommandInvocation {
  readonly executable: string;
  readonly args: readonly string[];
  readonly shell: false;
  readonly signal?: AbortSignal;
}

export interface LavishCommandResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
}

export type LavishCommandRunner = (
  invocation: LavishCommandInvocation,
) => Promise<LavishCommandResult>;

export interface LavishCommandOptions {
  readonly executable?: string;
  readonly runner?: LavishCommandRunner;
  readonly signal?: AbortSignal;
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

export const spawnLavishCommand: LavishCommandRunner = (invocation) => new Promise((resolve, reject) => {
  const child = spawn(invocation.executable, invocation.args, {
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...(invocation.signal === undefined ? {} : { signal: invocation.signal }),
  });
  let stdout = '';
  let stderr = '';
  let settled = false;

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  child.once('error', (error) => {
    if (settled) return;
    settled = true;
    reject(error);
  });
  child.once('close', (exitCode, signal) => {
    if (settled) return;
    settled = true;
    resolve({ stdout, stderr, exitCode, signal });
  });
});

async function runLavish(
  operation: 'open' | 'poll' | 'end',
  htmlPath: string,
  options: LavishCommandOptions,
): Promise<string> {
  const executable = options.executable ?? 'lavish-axi';
  const args = operation === 'open' ? [htmlPath] : [operation, htmlPath];
  const invocation: LavishCommandInvocation = {
    executable,
    args,
    shell: false,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  };

  let result: LavishCommandResult;
  try {
    result = await (options.runner ?? spawnLavishCommand)(invocation);
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      throw new MnfsError(
        'LAVISH_NOT_FOUND',
        `Lavish executable '${executable}' was not found.`,
        { remediation: 'Install it with: npm install -g lavish-axi' },
      );
    }

    const interrupted = options.signal?.aborted === true || errorCode(error) === 'ABORT_ERR';
    throw new MnfsError(
      'LAVISH_COMMAND_FAILED',
      interrupted
        ? `Lavish ${operation} was interrupted.`
        : `Could not start Lavish ${operation}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (result.exitCode !== 0 || result.signal !== null) {
    const evidence = result.stderr.trim()
      || (result.signal === null ? `exit code ${String(result.exitCode)}` : `signal ${result.signal}`);
    throw new MnfsError(
      'LAVISH_COMMAND_FAILED',
      `Lavish ${operation} failed: ${evidence}`,
    );
  }

  return result.stdout;
}

export function openLavishPlan(
  htmlPath: string,
  options: LavishCommandOptions = {},
): Promise<string> {
  return runLavish('open', htmlPath, options);
}

export function pollLavishPlan(
  htmlPath: string,
  options: LavishCommandOptions = {},
): Promise<string> {
  return runLavish('poll', htmlPath, options);
}

export function endLavishPlan(
  htmlPath: string,
  options: LavishCommandOptions = {},
): Promise<string> {
  return runLavish('end', htmlPath, options);
}
