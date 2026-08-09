import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PI_ACP_PROVENANCE,
  createPiAcpAdapter,
} from '../src/adapters/pi-acp.mjs';

const ENTRYPOINT = '/state/candidates/pi-acp/bin/pi-acp';
const CWD = '/tmp/mnfs-arr-s1-fixture';
const ENV = Object.freeze({
  PATH: '/usr/bin:/bin',
  PI_ACP_PI_COMMAND: '/state/candidates/pi/bin/pi',
  MNFS_FIXTURE: 'task-6',
});

function fakeCommonClient(calls) {
  return {
    async initialize() {
      calls.initialize += 1;
      return { protocolVersion: 1, agentCapabilities: { prompt: true } };
    },
    handshake() {
      calls.handshake += 1;
      return { protocolVersion: 1, agentCapabilities: { prompt: true } };
    },
    async startSession(input) {
      calls.startSession.push(input);
      return { sessionId: 'observational-session', observational: true };
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

test('records Pi-ACP limitations without inventing filesystem or terminal delegation', () => {
  const adapter = createPiAcpAdapter({
    executable: ENTRYPOINT,
    cwd: CWD,
    env: ENV,
    createClient: () => fakeCommonClient({
      initialize: 0,
      handshake: 0,
      startSession: [],
      prompt: [],
      cancel: 0,
      shutdown: 0,
    }),
  });

  assert.deepEqual(adapter.observations.delegation, {
    filesystem: 'NOT_PROVIDED_BY_PI_ACP',
    terminal: 'NOT_PROVIDED_BY_PI_ACP',
  });
  assert.deepEqual(adapter.observations.resourceBehavior, {
    extensions: 'ENABLED',
    promptTemplates: 'ENABLED',
    themes: 'DISABLED_BY_PI_ACP_INTERNAL_ARG',
  });
  assert.equal(adapter.observations.wireCompatibility.status, 'PENDING_REAL_GATE_S1');
  assert.notEqual(adapter.observations.wireCompatibility.status, 'PASS');
});

test('projects an explicit stdio process boundary and preserves PI_ACP_PI_COMMAND', async () => {
  const calls = {
    initialize: 0,
    handshake: 0,
    startSession: [],
    prompt: [],
    cancel: 0,
    shutdown: 0,
  };
  const commonClient = fakeCommonClient(calls);
  const createCalls = [];
  const adapter = createPiAcpAdapter({
    executable: ENTRYPOINT,
    cwd: CWD,
    env: ENV,
    timeoutMs: 1200,
    terminationGraceMs: 150,
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 2048,
    createClient(options) {
      createCalls.push(options);
      return commonClient;
    },
  });

  await adapter.initialize();

  assert.deepEqual(createCalls, [{
    processSpec: {
      argv: [ENTRYPOINT],
      cwd: CWD,
      env: { ...ENV },
      timeoutMs: 1200,
      terminationGraceMs: 150,
      stdoutLimitBytes: 4096,
      stderrLimitBytes: 2048,
    },
    clientFactory: undefined,
    ndJsonStream: undefined,
  }]);
  assert.equal('PI_ACP_DISABLE_EXTENSIONS' in createCalls[0].processSpec.env, false);
  assert.equal('PI_ACP_DISABLE_PROMPT_TEMPLATES' in createCalls[0].processSpec.env, false);
  assert.equal('delegation' in createCalls[0].processSpec, false);
  assert.equal(calls.initialize, 1);
});

test('uses only the common ACP client lifecycle and keeps runtime session observational', async () => {
  const calls = {
    initialize: 0,
    handshake: 0,
    startSession: [],
    prompt: [],
    cancel: 0,
    shutdown: 0,
  };
  const adapter = createPiAcpAdapter({
    executable: ENTRYPOINT,
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
  assert.deepEqual(session, { sessionId: 'observational-session', observational: true });
  assert.equal(turn.settled instanceof Promise, true);
  assert.deepEqual(cancelled, { outcome: 'CANCELLED' });
  assert.deepEqual(calls.startSession, [{ cwd: CWD }]);
  assert.deepEqual(calls.prompt, [{ prompt: 'run the controlled fixture task' }]);
  assert.equal(calls.handshake, 0);
  assert.equal('authority' in session, false);
  assert.equal('recoveryState' in session, false);
  assert.equal(typeof adapter.startTask, 'undefined');
  assert.equal(typeof adapter.delegateFilesystem, 'undefined');
  assert.equal(typeof adapter.delegateTerminal, 'undefined');
});

test('freezes provenance facts for the frozen Pi-ACP source without claiming wire proof', () => {
  assert.equal(PI_ACP_PROVENANCE.version, '0.0.33');
  assert.equal(PI_ACP_PROVENANCE.sourceCommit, 'd1cffc047ab37a096ee70ca39cfc1de463db8d12');
  assert.deepEqual(PI_ACP_PROVENANCE.entrypoint, ['pi-acp']);
  assert.deepEqual(PI_ACP_PROVENANCE.innerPi, {
    argv: ['pi', '--mode', 'rpc', '--no-themes'],
    commandEnvironment: 'PI_ACP_PI_COMMAND',
    inheritsParentEnvironment: true,
  });
  assert.equal(PI_ACP_PROVENANCE.declaredAcpSdk, '^0.26.0');
  assert.equal(PI_ACP_PROVENANCE.mnfsAcpSdk, '1.3.0');
  assert.equal(PI_ACP_PROVENANCE.wireCompatibility, 'PENDING_REAL_GATE_S1');
});

test('rejects implicit ambient environment and non-absolute Pi-ACP entrypoints', () => {
  assert.throws(
    () => createPiAcpAdapter({ executable: 'pi-acp', cwd: CWD, env: ENV }),
    /absolute/u,
  );
  assert.throws(
    () => createPiAcpAdapter({ executable: ENTRYPOINT, cwd: CWD }),
    /explicit env/u,
  );
});
