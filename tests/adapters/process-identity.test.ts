import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const PROCESS_IDENTITY_SPECIFIER = '../../src/adapters/' + 'process-identity.js';

interface ProcessIdentity {
  readonly bootId: string;
  readonly pid: number;
  readonly startTicks: string;
}

interface LinuxProcessIdentityInspector {
  observe(pid: number): ProcessIdentity | undefined | Promise<ProcessIdentity | undefined>;
}

interface ProcessIdentityModule {
  LinuxProcessIdentityInspector: new (options?: {
    readonly procRoot?: string;
    readonly bootIdPath?: string;
  }) => LinuxProcessIdentityInspector;
  parseProcStatStartTicks(statLine: string): string;
  sameProcessIdentity(left: ProcessIdentity, right: ProcessIdentity): boolean;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadProcessIdentity(): Promise<ProcessIdentityModule> {
  try {
    return await import(PROCESS_IDENTITY_SPECIFIER) as ProcessIdentityModule;
  } catch (error) {
    assert.fail(`M01 Linux process identity adapter is not implemented: ${describeError(error)}`);
  }
}

async function withTemporaryDirectory<T>(operation: (directory: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mnfs-m01-process-identity-'));
  try {
    return await operation(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function procStat(pid: number, startTicks: string): string {
  return [
    `${pid} (worker name (nested))`,
    'S',
    '1',
    '2',
    '3',
    '0',
    '-1',
    '4194304',
    '0',
    '0',
    '0',
    '0',
    '1',
    '2',
    '0',
    '0',
    '20',
    '0',
    '1',
    '0',
    startTicks,
    '0',
    '0',
  ].join(' ');
}

test('parses Linux stat field 22 when the process name contains spaces and parentheses', async () => {
  const identities = await loadProcessIdentity();
  assert.equal(identities.parseProcStatStartTicks(procStat(4315, '987654321')), '987654321');
});

test('observes boot id, pid and start ticks from a controlled proc filesystem', async () => {
  const identities = await loadProcessIdentity();

  await withTemporaryDirectory(async (directory) => {
    const procRoot = path.join(directory, 'proc');
    const bootIdPath = path.join(directory, 'boot_id');
    const pid = 4315;
    await mkdir(path.join(procRoot, String(pid)), { recursive: true });
    await writeFile(bootIdPath, 'boot-identity-001\n');
    await writeFile(path.join(procRoot, String(pid), 'stat'), procStat(pid, '987654321'));

    const inspector = new identities.LinuxProcessIdentityInspector({ procRoot, bootIdPath });
    assert.deepEqual(await inspector.observe(pid), {
      bootId: 'boot-identity-001',
      pid,
      startTicks: '987654321',
    });
  });
});

test('returns undefined only for a genuinely absent process and rejects malformed proc state', async () => {
  const identities = await loadProcessIdentity();

  await withTemporaryDirectory(async (directory) => {
    const procRoot = path.join(directory, 'proc');
    const bootIdPath = path.join(directory, 'boot_id');
    await mkdir(procRoot, { recursive: true });
    await writeFile(bootIdPath, 'boot-identity-001\n');

    const inspector = new identities.LinuxProcessIdentityInspector({ procRoot, bootIdPath });
    assert.equal(await inspector.observe(9999), undefined);

    await mkdir(path.join(procRoot, '4315'), { recursive: true });
    await writeFile(path.join(procRoot, '4315', 'stat'), '4315 malformed');
    await assert.rejects(Promise.resolve(inspector.observe(4315)));
  });
});

test('requires boot id, pid and start ticks to identify the same process', async () => {
  const identities = await loadProcessIdentity();
  const reference = { bootId: 'boot-a', pid: 4315, startTicks: '987654321' };

  assert.equal(identities.sameProcessIdentity(reference, { ...reference }), true);
  assert.equal(
    identities.sameProcessIdentity(reference, { ...reference, bootId: 'boot-b' }),
    false,
  );
  assert.equal(
    identities.sameProcessIdentity(reference, { ...reference, pid: 4316 }),
    false,
  );
  assert.equal(
    identities.sameProcessIdentity(reference, { ...reference, startTicks: '987654322' }),
    false,
  );
});
