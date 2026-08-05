import path from 'node:path';

import { MnfsError } from '../domain/errors.js';
import type { ProcessIdentity } from '../execution/model.js';
import type { ProcessResult, ProcessSpec } from './process-runner.js';
import {
  leaseActionFileExists,
  publishLeaseActionFinished,
  publishLeaseActionOutput,
  publishLeaseActionStarted,
  readLeaseActionFinished,
  readLeaseActionOperation,
  readLeaseActionStarted,
  type PublishedLeaseActionFinished,
} from './lease-action-protocol.js';

export interface LeaseActionRunnerInput {
  readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly observeProcessIdentity: (pid: number) => Promise<ProcessIdentity | undefined>;
  readonly now: () => string;
}

export interface RunLeaseActionInput {
  readonly actionRoot: string;
  readonly operationPath: string;
  readonly expectedActionToken: string;
  readonly expectedOperationSha256: string;
}

function runnerError(message: string, cause?: unknown): MnfsError {
  const detail = cause instanceof Error ? ` ${cause.message}` : '';
  return new MnfsError('INTERNAL_ERROR', `${message}${detail}`);
}

function requireNow(now: () => string): string {
  const value = now();
  if (typeof value !== 'string' || !value.endsWith('Z') || !Number.isFinite(Date.parse(value))) {
    throw runnerError('Lease action clock returned an invalid UTC timestamp.');
  }
  return value;
}

export class LeaseActionRunner {
  readonly #runProcess: LeaseActionRunnerInput['runProcess'];
  readonly #observeProcessIdentity: LeaseActionRunnerInput['observeProcessIdentity'];
  readonly #now: LeaseActionRunnerInput['now'];

  constructor(input: LeaseActionRunnerInput) {
    this.#runProcess = input.runProcess;
    this.#observeProcessIdentity = input.observeProcessIdentity;
    this.#now = input.now;
  }

  async run(input: RunLeaseActionInput): Promise<PublishedLeaseActionFinished> {
    const publishedOperation = await readLeaseActionOperation({
      actionRoot: input.actionRoot,
      operationPath: input.operationPath,
      expectedActionToken: input.expectedActionToken,
      expectedOperationSha256: input.expectedOperationSha256,
    });
    const operation = publishedOperation.operation;

    const hasFinished = await leaseActionFileExists(input.actionRoot, operation.resultPath);
    if (hasFinished) {
      const started = await readLeaseActionStarted({
        actionRoot: input.actionRoot,
        startedPath: operation.startedPath,
        expectedActionToken: operation.actionToken,
        expectedOperationSha256: publishedOperation.operationSha256,
      });
      return await readLeaseActionFinished({
        actionRoot: input.actionRoot,
        resultPath: operation.resultPath,
        expectedActionToken: operation.actionToken,
        expectedOperationSha256: publishedOperation.operationSha256,
        expectedStartedSha256: started.startedSha256,
        stdoutLimitBytes: operation.stdoutLimitBytes,
        stderrLimitBytes: operation.stderrLimitBytes,
      });
    }

    if (await leaseActionFileExists(input.actionRoot, operation.startedPath)) {
      throw new MnfsError(
        'LEASE_ACTION_INCONCLUSIVE',
        'Lease action STARTED exists without a decisive FINISHED observation.',
      );
    }

    let runnerIdentity: ProcessIdentity | undefined;
    try {
      runnerIdentity = await this.#observeProcessIdentity(process.pid);
    } catch (error) {
      throw runnerError('Lease action runner process identity cannot be observed.', error);
    }
    if (runnerIdentity === undefined) {
      throw runnerError('Lease action runner process identity is absent.');
    }

    let started;
    try {
      started = await publishLeaseActionStarted({
        actionRoot: input.actionRoot,
        startedPath: operation.startedPath,
        started: {
          schemaVersion: 1,
          actionToken: operation.actionToken,
          operationSha256: publishedOperation.operationSha256,
          runner: runnerIdentity,
          startedAt: requireNow(this.#now),
        },
      });
    } catch (error) {
      if (await leaseActionFileExists(input.actionRoot, operation.startedPath).catch(() => false)) {
        throw new MnfsError(
          'LEASE_ACTION_INCONCLUSIVE',
          'Lease action STARTED was claimed by another helper.',
        );
      }
      throw error;
    }

    const processSpec: ProcessSpec = {
      executable: operation.executable,
      args: [...operation.argv],
      cwd: operation.cwd,
      env: operation.env,
      timeoutMs: operation.timeoutMs,
      stdoutLimitBytes: operation.stdoutLimitBytes,
      stderrLimitBytes: operation.stderrLimitBytes,
    };

    const result = await this.#runProcess(processSpec);
    const tokenRoot = path.dirname(operation.resultPath);
    const stdout = await publishLeaseActionOutput(
      input.actionRoot,
      path.join(tokenRoot, 'stdout.bin'),
      Buffer.from(result.stdout),
      operation.stdoutLimitBytes,
    );
    const stderr = await publishLeaseActionOutput(
      input.actionRoot,
      path.join(tokenRoot, 'stderr.bin'),
      Buffer.from(result.stderr),
      operation.stderrLimitBytes,
    );

    return await publishLeaseActionFinished({
      actionRoot: input.actionRoot,
      resultPath: operation.resultPath,
      finished: {
        schemaVersion: 1,
        actionToken: operation.actionToken,
        operationSha256: publishedOperation.operationSha256,
        startedSha256: started.startedSha256,
        runner: runnerIdentity,
        process: {
          exitCode: result.exitCode,
          signal: result.signal,
          timedOut: result.timedOut,
        },
        stdout,
        stderr,
        finishedAt: requireNow(this.#now),
      },
      stdoutLimitBytes: operation.stdoutLimitBytes,
      stderrLimitBytes: operation.stderrLimitBytes,
    });
  }
}
