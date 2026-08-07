import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { MnfsError } from '../domain/errors.js';
import type { ProcessIdentity } from '../execution/model.js';

export interface LinuxProcessIdentityOptions {
  readonly procRoot?: string;
  readonly bootIdPath?: string;
}

function processIdentityError(message: string, cause?: unknown): MnfsError {
  const suffix = cause instanceof Error ? ` ${cause.message}` : '';
  return new MnfsError('INTERNAL_ERROR', `${message}${suffix}`);
}

function isErrorCode(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

function requirePid(pid: number): number {
  if (!Number.isSafeInteger(pid) || pid <= 0) {
    throw processIdentityError(`Process id must be a positive safe integer; received ${pid}.`);
  }
  return pid;
}

export function parseProcStatStartTicks(statLine: string): string {
  const openParenthesis = statLine.indexOf('(');
  const closeParenthesis = statLine.lastIndexOf(')');
  if (openParenthesis <= 0 || closeParenthesis <= openParenthesis) {
    throw processIdentityError('Malformed /proc stat record: process name boundary is missing.');
  }

  const pidText = statLine.slice(0, openParenthesis).trim();
  if (!/^\d+$/.test(pidText)) {
    throw processIdentityError('Malformed /proc stat record: pid is invalid.');
  }

  const fieldsFromState = statLine.slice(closeParenthesis + 1).trim().split(/\s+/);
  const startTicks = fieldsFromState[19];
  if (startTicks === undefined || !/^\d+$/.test(startTicks)) {
    throw processIdentityError('Malformed /proc stat record: field 22 start ticks are invalid.');
  }
  return startTicks;
}

export function sameProcessIdentity(
  left: ProcessIdentity,
  right: ProcessIdentity,
): boolean {
  return left.bootId === right.bootId
    && left.pid === right.pid
    && left.startTicks === right.startTicks;
}

export class LinuxProcessIdentityInspector {
  readonly procRoot: string;
  readonly bootIdPath: string;

  constructor(options: LinuxProcessIdentityOptions = {}) {
    this.procRoot = options.procRoot ?? '/proc';
    this.bootIdPath = options.bootIdPath ?? '/proc/sys/kernel/random/boot_id';
  }

  async observe(pid: number): Promise<ProcessIdentity | undefined> {
    const validPid = requirePid(pid);
    const statPath = path.join(this.procRoot, String(validPid), 'stat');

    let statLine: string;
    try {
      statLine = await readFile(statPath, 'utf8');
    } catch (error) {
      if (isErrorCode(error, 'ENOENT')) {
        return undefined;
      }
      throw processIdentityError(`Failed to read process stat for pid ${validPid}.`, error);
    }

    let bootId: string;
    try {
      bootId = (await readFile(this.bootIdPath, 'utf8')).trim();
    } catch (error) {
      throw processIdentityError('Failed to read the Linux boot identity.', error);
    }
    if (bootId.length === 0 || /[\r\n]/.test(bootId)) {
      throw processIdentityError('Linux boot identity is empty or malformed.');
    }

    return {
      bootId,
      pid: validPid,
      startTicks: parseProcStatStartTicks(statLine),
    };
  }
}
