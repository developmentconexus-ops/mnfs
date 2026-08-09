import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  OPENCODE_PROVENANCE,
  createOpenCodeAcpAdapter,
} from '../src/adapters/opencode-acp.mjs';

const EXECUTABLE = '/state/candidates/opencode/bin/opencode';
const CWD = '/tmp/mnfs-arr-s1-fixture';
const ENV = Object.freeze({
  PATH: '/usr/bin:/bin',
  HOME: '/tmp/mnfs-arr-s1-home',
  MNFS_FIXTURE: 'task-7',
});

function fakeCommonClient(calls) {
  return {
    async initialize() {
      calls.initialize += 1;
      return { protocolVersion: 1, agentCapabilities: { prompt: true } };
    },
    handshake() {
      return { protocolVersion: 1, agentCapabilities: { prompt: true } };
    },
    async startSession(input) {
      calls.startSession.push(input);
      return { sessionId: 'opencode-observation', observational: true };
    },
    async prompt(input) {
      calls.prompt.push(input);
      return { settled: Promise.resolve({ outcome: 'COMPLETED' }) };
    },
    async cancel() {
      calls.cancel += 1;
      return { outcome: 'CANCELLED' };
    },
    async shutdown() {
      calls.shutdown += 1;
    },
  };
}

function freshCalls() {
  return { initialize: 0, startSession: [], prompt: [], cancel: 0, shutdown: 0 };
}

test('starts native OpenCode ACP with exact argv, cwd and explicit environment', async () => {
  const calls = freshCalls();
  const createCalls = [];
  const adapter = createOpenCodeAcpAdapter({
    executable: EXECUTABLE,
    cwd: CWD,
    env: ENV,
    timeoutMs: 1400,
    terminationGraceMs: 200,
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 2048,
    createClient(options) {
      createCalls.push(options);
      return fakeCommonClient(calls);
    },
  });

  await adapter.initialize();

  assert.deepEqual(createCalls, [{
    processSpec: {
      argv: [EXECUTABLE, 'acp', '--cwd', CWD],
      cwd: CWD,
      env: { ...ENV },
      timeoutMs: 1400,
      terminationGraceMs: 200,
      stdoutLimitBytes: 4096,
      stderrLimitBytes: 2048,
    },
    clientFactory: undefined,
    ndJsonStream: undefined,
  }]);
  assert.equal(calls.initialize, 1);
  assert.deepEqual(adapter.processSpec.argv, [EXECUTABLE, 'acp', '--cwd', CWD]);
});

test('records capabilities and permissions as Evidence-only observations', () => {
  const adapter = createOpenCodeAcpAdapter({ executable: EXECUTABLE, cwd: CWD, env: ENV });

  assert.deepEqual(adapter.observations.capabilities, { status: 'EVIDENCE_ONLY' });
  assert.deepEqual(adapter.observations.permissions, { status: 'EVIDENCE_ONLY' });
  assert.equal('authority' in adapter.observations, false);
  assert.equal('permissions' in adapter, false);
});

test('uses the common ACP lifecycle without TUI parsing or runtime authority', async () => {
  const calls = freshCalls();
  const adapter = createOpenCodeAcpAdapter({
    executable: EXECUTABLE,
    cwd: CWD,
    env: ENV,
    createClient: () => fakeCommonClient(calls),
  });

  const ready = await adapter.initialize();
  const session = await adapter.startSession({ cwd: CWD });
  const turn = await adapter.prompt({ prompt: 'run the controlled fixture task' });
  const cancelled = await adapter.cancel();
  await adapter.shutdown();

  assert.deepEqual(ready, { protocolVersion: 1, agentCapabilities: { prompt: true } });
  assert.deepEqual(session, { sessionId: 'opencode-observation', observational: true });
  assert.equal(turn.settled instanceof Promise, true);
  assert.deepEqual(cancelled, { outcome: 'CANCELLED' });
  assert.deepEqual(calls.startSession, [{ cwd: CWD }]);
  assert.deepEqual(calls.prompt, [{ prompt: 'run the controlled fixture task' }]);
  assert.equal(calls.cancel, 1);
  assert.equal(calls.shutdown, 1);
  assert.equal('authority' in session, false);
  assert.equal('recoveryState' in session, false);

  const source = readFileSync(new URL('../src/adapters/opencode-acp.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /(?:readline|ansi|keypress|tty|terminals+screen)/iu);
});

test('freezes OpenCode provenance and rejects ambient environment or relative executable', () => {
  assert.equal(OPENCODE_PROVENANCE.version, '1.18.15');
  assert.equal(OPENCODE_PROVENANCE.releaseCommit, '325529761beb79a004de6d86e48b8db69cf4eba3');
  assert.deepEqual(OPENCODE_PROVENANCE.entrypoint, ['opencode', 'acp']);
  assert.equal(OPENCODE_PROVENANCE.cwdFlag, '--cwd');

  assert.throws(
    () => createOpenCodeAcpAdapter({ executable: 'opencode', cwd: CWD, env: ENV }),
    /absolute/u,
  );
  assert.throws(
    () => createOpenCodeAcpAdapter({ executable: EXECUTABLE, cwd: CWD }),
    /explicit env/u,
  );
});
