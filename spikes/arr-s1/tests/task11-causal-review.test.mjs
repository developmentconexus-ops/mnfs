import assert from 'node:assert/strict';
import test from 'node:test';

import { createAcpClient } from '../src/acp/client.mjs';
import { createAcpFixtureCapabilities } from '../src/acp/fixture-capabilities.mjs';
import { createOpenCodeAcpAdapter } from '../src/adapters/opencode-acp.mjs';
import { createPiAcpAdapter } from '../src/adapters/pi-acp.mjs';
import { deriveTrustedAuthProof } from '../src/proof-driver.mjs';
import { preflightS1 } from '../src/preflight.mjs';
import { runPiRpcProcess, translatePiRpcFixtureCalls } from '../src/pi-rpc.mjs';
import { parseExecutionAuthorizationToken } from '../src/execution-authority.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';

function fakeStream() {
  return {
    writable: new WritableStream({ write() {} }),
    readable: new ReadableStream({ start(controller) { controller.close(); } }),
  };
}

function immediateAcpSurface() {
  const active = {
    sessionId: 'fast-session',
    prompt() { return Promise.resolve({ stopReason: 'end_turn' }); },
    nextUpdate() { return new Promise(() => {}); },
    dispose() {},
  };
  const context = {
    async request(method) {
      if (method === 'initialize') return { protocolVersion: 1, authMethods: [{ id: 'fixture-login' }], agentCapabilities: {} };
      throw new Error(`unexpected request ${method}`);
    },
    buildSession() { return { async start() { return active; } }; },
    async notify() {},
  };
  return {
    client: { connectWith(_stream, operation) { return operation(context); } },
    processBoundary: { onProcess() { return () => {}; }, async close() {} },
  };
}

test('fast-settling ACP turn records no control request and cannot manufacture cancellation/death evidence', async () => {
  const surface = immediateAcpSurface();
  const client = createAcpClient({ client: surface.client, stream: fakeStream(), processBoundary: surface.processBoundary });
  await client.initialize();
  await client.startSession({ cwd: CWD });
  const turn = await client.prompt({ prompt: 'settle immediately' });
  const settled = await turn.settled;

  assert.equal(settled.outcome, 'COMPLETED');
  assert.deepEqual(turn.observeTemporal().control, { requested: false, kind: null, turnActive: false });
  assert.equal((await client.cancel()).temporal.control.requested, false);

  const { buildProofs } = await import('../src/executors.mjs');
  const temporal = turn.observeTemporal();
  const proofs = buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture: { inventory: [] },
    execution: {
      settled: { settled: true, outcome: 'COMPLETED' },
      events: [],
      trustedProofs: {
        inventory: [],
        fixtureVerified: true,
        discovery: { controlled: true, extensions: [], skills: [], prompts: [], themes: [], agentsFiles: [] },
        auth: { outcome: 'AUTHORIZED_OPERATION', operation: 'ACP_AUTHENTICATED_SESSION_PROMPT_COMPLETED', methodId: 'fixture-login', sessionId: 'fast-session' },
        cancellation: { outcome: 'CANCELLED', source: 'MNFS_TRUSTED_PROCESS_RUNNER', durationMs: 0, temporal },
        processDeath: { outcome: 'SIGNAL_DEATH', source: 'MNFS_TRUSTED_PROCESS_RUNNER', temporal },
        output: { bytes: 1, limitBytes: 4096 },
        recovery: { phase: 'FRESH_PROCESS', source: 'MNFS_TRUSTED_RECOVERY_PROCESS' },
        authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
        machinery: {},
        supportedBoundary: { source: 'MNFS_TRUSTED_ADAPTER', kind: 'ACP', observation: 'fixture' },
      },
    },
  });
  assert.notEqual(proofs['S1-C06'], true);
  assert.notEqual(proofs['S1-C09'], true);
});

test('ACP auth proof uses advertised method, successful session/prompt and agent output without Pi provider/model fields', () => {
  const proof = deriveTrustedAuthProof({
    candidateShape: 'OPENCODE-ACP',
    handshake: { authMethods: [{ id: 'opencode-login' }] },
    authentication: { methodId: 'opencode-login', succeeded: true },
    session: { sessionId: 'session-1', authRequired: false },
    settled: { outcome: 'COMPLETED', stopReason: 'end_turn' },
    rawObservations: [{
      kind: 'session_update',
      notification: { update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'done' } } },
    }],
  });

  assert.equal(proof.outcome, 'AUTHORIZED_OPERATION');
  assert.equal(proof.methodId, 'opencode-login');
  assert.equal('providerClass' in proof, false);
  assert.equal('modelClass' in proof, false);
});

test('ACP authRequired response cannot become an auth PASS', () => {
  const proof = deriveTrustedAuthProof({
    candidateShape: 'PI-ACP',
    handshake: { authMethods: [{ id: 'pi_terminal_login' }] },
    authentication: { methodId: 'pi_terminal_login', succeeded: true },
    session: { sessionId: null, authRequired: true },
    settled: { outcome: 'FAILED', stopReason: 'error' },
    rawObservations: [],
  });

  assert.equal(proof.outcome, 'NOT_PROVEN');
});

test('ACP permission handler allows only exact logical fixture paths and records all decisions', async () => {
  const fixture = {
    workspacePath: CWD,
    nonceRelativePath: 'fixture/nonce.txt',
    targetRelativePath: 'result.txt',
    nonce: 'nonce-value',
    expectedTree: {},
  };
  const capabilities = createAcpFixtureCapabilities(fixture, {
    readTextFile: async () => 'NONCE=nonce-value\n',
    writeTextFile: async () => undefined,
  });
  const allow = await capabilities.handlers['session/request_permission']({
    sessionId: 'session-1',
    toolCall: { title: 'read', rawInput: { path: `${CWD}/fixture/nonce.txt` } },
    options: [{ optionId: 'allow-once', kind: 'allow_once' }],
  });
  const deny = await capabilities.handlers['session/request_permission']({
    sessionId: 'session-1',
    toolCall: { title: 'read', rawInput: { path: '/etc/passwd' } },
    options: [{ optionId: 'allow-once', kind: 'allow_once' }],
  });

  assert.deepEqual(allow, { outcome: { outcome: 'selected', optionId: 'allow-once' } });
  assert.deepEqual(deny, { outcome: { outcome: 'cancelled' } });
  assert.equal(capabilities.permissionEvidence().length, 2);
  assert.equal(capabilities.permissionEvidence()[0].authority, 'MNFS_PERMISSION_UI_NON_AUTHORITY');
});

test('ACP logical fixture translation accepts local ToolCall/ToolCallUpdate evidence and Git verification remains independent', () => {
  const fixture = {
    workspacePath: CWD,
    nonceRelativePath: 'fixture/nonce.txt',
    targetRelativePath: 'result.txt',
    nonce: 'nonce-value',
    expectedTree: {},
  };
  const capabilities = createAcpFixtureCapabilities(fixture);
  const calls = capabilities.logicalToolCalls({
    rawEvents: [
      { kind: 'session_update', notification: { update: {
        sessionUpdate: 'tool_call', toolCallId: 'read-1', title: 'read', kind: 'read',
        locations: [{ path: `${CWD}/fixture/nonce.txt` }], rawInput: { path: `${CWD}/fixture/nonce.txt` },
      } } },
      { kind: 'session_update', notification: { update: {
        sessionUpdate: 'tool_call_update', toolCallId: 'read-1', status: 'completed',
        rawOutput: { content: [{ type: 'text', text: 'NONCE=nonce-value\n' }] },
      } } },
      { kind: 'session_update', notification: { update: {
        sessionUpdate: 'tool_call', toolCallId: 'edit-1', title: 'edit', kind: 'edit',
        locations: [{ path: `${CWD}/result.txt` }], rawInput: { path: `${CWD}/result.txt`, content: 'RESULT=nonce-value\n' },
      } } },
      { kind: 'session_update', notification: { update: {
        sessionUpdate: 'tool_call_update', toolCallId: 'edit-1', status: 'completed', rawOutput: { text: 'edited' },
      } } },
    ],
  });

  assert.deepEqual(calls, [
    { id: 'read_nonce_file', path: 'fixture/nonce.txt', value: 'nonce-value' },
    { id: 'edit_result_file', path: 'result.txt', content: 'RESULT=nonce-value\n' },
  ]);
});

test('Pi ACP exposes the trusted wrapper configuration while preserving Pi ACP supplied args', () => {
  const adapter = createPiAcpAdapter({
    executable: '/state/candidates/pi-acp/bin/pi-acp',
    cwd: CWD,
    env: { PATH: '/usr/bin:/bin', PI_ACP_PI_COMMAND: '/state/mnfs/pi-acp-wrapper.mjs', MNFS_PI_ACP_EXECUTABLE: '/state/candidates/pi/bin/pi' },
  });

  assert.deepEqual(adapter.observations.projectedInnerPi.argv, [
    '/state/mnfs/pi-acp-wrapper.mjs', '--mode', 'rpc', '--no-themes',
  ]);
  assert.equal(adapter.observations.innerPiControlSource, 'MNFS_TRUSTED_WRAPPER_REVALIDATES_PI');
});

test('trusted Pi-ACP wrapper rejects a conflicting tool allowlist', async () => {
  const { revalidatePiRpcArgs } = await import('../src/pi-acp-wrapper.mjs');
  assert.deepEqual(revalidatePiRpcArgs(['--mode', 'rpc', '--no-themes']).slice(0, 4), [
    '--mode', 'rpc', '--no-themes', '--tools',
  ]);
  assert.throws(() => revalidatePiRpcArgs(['--mode', 'rpc', '--tools', 'all']), /allowlist/u);
});

test('OpenCode ACP receives an explicit isolated profile and config surface', () => {
  const adapter = createOpenCodeAcpAdapter({
    executable: '/state/candidates/opencode/bin/opencode',
    cwd: CWD,
    env: { PATH: '/usr/bin:/bin' },
    profile: {
      configDir: '/state/runs/opencode-config',
      configPath: '/state/runs/opencode-config/config.json',
      configContent: '{"tools":{"read":true,"edit":true},"plugin":[]}',
    },
  });

  assert.equal(adapter.processSpec.env.OPENCODE_CONFIG_DIR, '/state/runs/opencode-config');
  assert.equal(adapter.processSpec.env.OPENCODE_CONFIG, '/state/runs/opencode-config/config.json');
  assert.equal(adapter.processSpec.env.OPENCODE_PURE, '1');
  assert.equal(adapter.observations.profile.source, 'MNFS_TRUSTED_ISOLATED_PROFILE');
  assert.equal(adapter.observations.discoveryControlled, false);
  assert.match(adapter.observations.discoveryReason, /global|project/u);
});

test('state-root preflight blocks an unreviewed filesystem even when the name is present', async () => {
  const result = await preflightS1({
    executionAuthorization: parseExecutionAuthorizationToken('MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=277dffc521754a4370bfd94132dc9467589fdcf0 contract_sha256=sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a base_sha=' + 'a'.repeat(40) + ' verify_run=987654321 scope=pi-first-runtime-conformance'),
    observers: {
      source: () => ({ clean: true, commitSha: 'a'.repeat(40), treeSha: 'a'.repeat(40) }),
      stateRoot: () => ({ path: '/state/mnfs', realPath: '/state/mnfs', platform: 'linux', isDirectory: true, writable: true, filesystem: 'ext4', filesystemSupported: false }),
      provenance: () => ({ trustedBoundary: 'TEST_FAITHFUL_STAGING', integrity: { manifestSha256: `sha256:${'a'.repeat(64)}` }, records: {} }),
    },
    credentials: { authorized: true, provider: 'fixture', authMethodClass: 'double' },
  });

  assert.equal(result.status, 'BLOCKED');
  assert.ok(result.blockers.some(({ id }) => id === 'linuxStateRoot'));
});

test('state-root preflight blocks a filesystem type outside the trusted reviewed allowlist', async () => {
  const result = await preflightS1({
    executionAuthorization: parseExecutionAuthorizationToken('MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=277dffc521754a4370bfd94132dc9467589fdcf0 contract_sha256=sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a base_sha=' + 'a'.repeat(40) + ' verify_run=987654321 scope=pi-first-runtime-conformance'),
    observers: {
      source: () => ({ clean: true, commitSha: 'a'.repeat(40), treeSha: 'a'.repeat(40) }),
      stateRoot: () => ({ path: '/state/mnfs', realPath: '/state/mnfs', platform: 'linux', isDirectory: true, writable: true, filesystem: 'ext4', filesystemSupported: true }),
      provenance: () => ({ trustedBoundary: 'TEST_FAITHFUL_STAGING', integrity: { manifestSha256: `sha256:${'a'.repeat(64)}` }, records: {} }),
    },
    credentials: { authorized: true, provider: 'fixture', authMethodClass: 'double' },
  });

  assert.equal(result.status, 'BLOCKED');
  assert.ok(result.blockers.some(({ id }) => id === 'linuxStateRoot'));
});

test('C15 does not pass from generic machinery reuse alone', async () => {
  const source = await import('../src/executors.mjs');
  assert.equal(source.deriveMachineryProof({ reused: ['fixture', 'artifacts', 'process-runner'] }).pass, false);
  assert.equal(source.deriveMachineryProof({
    namedMnfsMachineryEliminatedOrAvoided: ['ACP_WIRE_TRANSLATION_PARSER'],
    causalMechanism: 'common ACP public boundary replaces a vendor-specific transport driver',
    supportingEvidence: [{ source: 'trusted ACP lifecycle observation' }],
  }).pass, true);
});

test('Pi RPC controls and temporal evidence are derived from actual argv/events', async () => {
  const runtime = '/usr/bin/node';
  const attempt = await runPiRpcProcess({
    executable: runtime,
    cwd: '/tmp',
    env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' },
    prompt: 'fixture',
    mode: 'CANCEL',
  });

  assert.deepEqual(attempt.processResult.argv.slice(1), [
    '--mode', 'rpc', '--tools', 'read,edit', '--no-extensions', '--no-skills',
    '--no-prompt-templates', '--no-themes', '--no-context-files',
  ]);
  assert.equal(attempt.temporal.control.requested, false);
});

test('Pi RPC translates the real read/edit tools into the logical fixture', () => {
  const fixture = {
    workspacePath: CWD,
    nonceRelativePath: 'fixture/nonce.txt',
    targetRelativePath: 'result.txt',
  };
  assert.deepEqual(translatePiRpcFixtureCalls([
    { type: 'tool_execution_start', toolCallId: 'read-1', toolName: 'read', args: { path: `${CWD}/fixture/nonce.txt` } },
    { type: 'tool_execution_end', toolCallId: 'read-1', toolName: 'read', result: { content: [{ type: 'text', text: 'nonce-value' }] } },
    { type: 'tool_execution_start', toolCallId: 'edit-1', toolName: 'edit', args: { path: `${CWD}/result.txt`, content: 'RESULT=nonce-value\n' } },
    { type: 'tool_execution_end', toolCallId: 'edit-1', toolName: 'edit', result: { content: [{ type: 'text', text: 'edited' }] } },
  ], fixture), [
    { id: 'read_nonce_file', path: 'fixture/nonce.txt', value: 'nonce-value' },
    { id: 'edit_result_file', path: 'result.txt', content: 'RESULT=nonce-value\n' },
  ]);
});
