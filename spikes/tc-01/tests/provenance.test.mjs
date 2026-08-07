import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  discoverTc01Environment,
  validateTreehouseCapabilities,
} from '../src/provenance.mjs';

async function provenanceFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-provenance-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const treehouseExecutable = join(root, 'treehouse');
  const gitExecutable = join(root, 'git');
  const unameExecutable = join(root, 'uname');
  const osReleasePath = join(root, 'os-release');
  const executableBytes = Buffer.from('#!/bin/sh\nexit 0\n');

  await Promise.all([
    writeFile(treehouseExecutable, executableBytes),
    writeFile(gitExecutable, '#!/bin/sh\nexit 0\n', 'utf8'),
    writeFile(unameExecutable, '#!/bin/sh\nexit 0\n', 'utf8'),
    writeFile(osReleasePath, 'ID=ubuntu\nVERSION_ID="24.04"\n', 'utf8'),
  ]);
  await Promise.all([
    chmod(treehouseExecutable, 0o755),
    chmod(gitExecutable, 0o755),
    chmod(unameExecutable, 0o755),
  ]);

  const outputs = new Map([
    [`${treehouseExecutable}\u0000--version`, '2.1.1\n'],
    [`${treehouseExecutable}\u0000get\u0000--help`, 'Usage: treehouse get [--lease] [--json] [--lease-holder string]\n'],
    [`${treehouseExecutable}\u0000status\u0000--help`, 'Usage: treehouse status [--json]\n'],
    [`${treehouseExecutable}\u0000return\u0000--help`, 'Usage: treehouse return [--if-lease-id string] [--if-lease-holder string]\n'],
    [`${gitExecutable}\u0000--version`, 'git version 2.54.0\n'],
    [`${unameExecutable}\u0000-r`, '5.15.167.4-microsoft-standard-WSL2\n'],
  ]);

  const runner = async ({ file, args }) => {
    const key = [file, ...args].join('\u0000');
    const stdout = outputs.get(key);
    if (stdout === undefined) throw new Error(`Unexpected command: ${key}`);
    return {
      startedAt: '2026-08-03T23:30:00.000Z',
      finishedAt: '2026-08-03T23:30:00.001Z',
      durationMs: 1,
      exitCode: 0,
      signal: null,
      stdout: Buffer.from(stdout),
      stderr: Buffer.alloc(0),
      timedOut: false,
    };
  };

  const resolveExecutable = async (name) => ({
    treehouse: treehouseExecutable,
    git: gitExecutable,
    uname: unameExecutable,
  })[name];

  return {
    root,
    treehouseExecutable,
    executableBytes,
    osReleasePath,
    runner,
    resolveExecutable,
    outputs,
  };
}

function discoveryInput(fixture, overrides = {}) {
  return {
    cwd: fixture.root,
    env: { PATH: fixture.root },
    expectedTreehouseVersion: '2.1.1',
    osReleasePath: fixture.osReleasePath,
    nodeVersion: 'v24.18.0',
    runProcess: fixture.runner,
    resolveExecutable: fixture.resolveExecutable,
    now: () => new Date('2026-08-03T23:30:00.000Z'),
    ...overrides,
  };
}

test('binds exact executable bytes, version and required capabilities', async (t) => {
  const fixture = await provenanceFixture(t);
  const provenance = await discoverTc01Environment(discoveryInput(fixture));

  assert.deepEqual(provenance, {
    schemaVersion: 1,
    environment: 'WSL2',
    ubuntuRelease: '24.04',
    kernelRelease: '5.15.167.4-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    gitVersion: '2.54.0',
    treehouseVersion: '2.1.1',
    treehouseExecutable: fixture.treehouseExecutable,
    treehouseExecutableHash: `sha256:${createHash('sha256').update(fixture.executableBytes).digest('hex')}`,
    capabilities: {
      leaseJson: true,
      statusJson: true,
      conditionalLeaseId: true,
      conditionalHolder: true,
    },
    capturedAt: '2026-08-03T23:30:00.000Z',
  });
  assert.equal(validateTreehouseCapabilities(provenance), provenance);
});

test('provenance commands use an exact Linux-only PATH and isolated Git configuration', async (t) => {
  const fixture = await provenanceFixture(t);
  const calls = [];
  await discoverTc01Environment(discoveryInput(fixture, {
    env: {
      PATH: `${fixture.root}:/mnt/c/Windows/System32:/untrusted/bin`,
      GIT_CONFIG_GLOBAL: '/tmp/user-gitconfig',
      SECRET_VALUE: 'must-not-propagate',
    },
    runProcess: async (spec) => {
      calls.push(spec);
      return fixture.runner(spec);
    },
  }));

  assert.equal(calls.length >= 6, true);
  for (const call of calls) {
    assert.equal(call.env.PATH.includes('/mnt/'), false);
    assert.equal(call.env.PATH.includes('/untrusted/'), false);
    assert.equal(call.env.GIT_CONFIG_GLOBAL, '/dev/null');
    assert.equal(call.env.GIT_CONFIG_NOSYSTEM, '1');
    assert.equal(call.env.SECRET_VALUE, undefined);
    assert.equal(call.env.HOME, undefined);
  }
});

test('requires one absolute Treehouse executable realpath', async (t) => {
  const fixture = await provenanceFixture(t);
  await assert.rejects(
    discoverTc01Environment(discoveryInput(fixture, {
      resolveExecutable: async (name) => name === 'treehouse' ? 'treehouse' : fixture.resolveExecutable(name),
      realpath: async (value) => value,
    })),
    (error) => error?.code === 'TC01_TOOL_MISSING',
  );
});

test('rejects a Treehouse version different from the accepted candidate', async (t) => {
  const fixture = await provenanceFixture(t);
  fixture.outputs.set(`${fixture.treehouseExecutable}\u0000--version`, '2.2.0\n');

  await assert.rejects(
    discoverTc01Environment(discoveryInput(fixture)),
    (error) => error?.code === 'TC01_VERSION_MISMATCH'
      && error.details.actual === '2.2.0'
      && error.details.expected === '2.1.1',
  );
});

test('rejects missing Treehouse capabilities instead of guessing compatibility', async (t) => {
  const fixture = await provenanceFixture(t);
  fixture.outputs.set(
    `${fixture.treehouseExecutable}\u0000return\u0000--help`,
    'Usage: treehouse return [--if-lease-id string]\n',
  );

  await assert.rejects(
    discoverTc01Environment(discoveryInput(fixture)),
    (error) => error?.code === 'TC01_VERSION_MISMATCH'
      && error.details.missingCapabilities.includes('conditionalHolder'),
  );
});

test('fails closed when the kernel is not canonical WSL2', async (t) => {
  const fixture = await provenanceFixture(t);
  fixture.outputs.set(`${join(fixture.root, 'uname')}\u0000-r`, '6.8.0-generic\n');

  await assert.rejects(
    discoverTc01Environment(discoveryInput(fixture)),
    (error) => error?.code === 'TC01_NOT_WSL2',
  );
});

test('fails closed when discovery is requested on a mounted filesystem', async (t) => {
  const fixture = await provenanceFixture(t);
  await assert.rejects(
    discoverTc01Environment(discoveryInput(fixture, { cwd: '/mnt/c/mnfs' })),
    (error) => error?.code === 'TC01_LINUX_FILESYSTEM_REQUIRED',
  );
});
