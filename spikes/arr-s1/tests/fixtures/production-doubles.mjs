import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

function digest(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

function rawObservation(cwd) {
  return {
    cwd,
    inventory: ['read_nonce_file', 'edit_result_file'],
    discovery: { extensions: [], skills: [], prompts: [], themes: [], agentsFiles: [] },
    auth: { outcome: 'AUTHORIZED', methodClass: 'fixture-double' },
    cancellation: { checkpoint: 'CANCELLATION_BEFORE_FINALIZED', outcome: 'CANCELLED', durationMs: 1 },
    output: { bytes: 128, limitBytes: 4096 },
    processDeath: { checkpoint: 'PROCESS_DEATH_BEFORE_FINALIZED', outcome: 'SIGNAL_DEATH' },
    recovery: { phase: 'FRESH_PROCESS', verified: 'fixture-result' },
    authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
    machinery: { reused: ['fixture', 'artifacts', 'process-runner'] },
    supportedBoundary: { kind: 'PUBLIC_ADAPTER_SURFACE', observation: 'FIXTURE_DOUBLE' },
  };
}

async function executeFixture(fixture) {
  const nonce = (await readFile(fixture.nonceFilePath, 'utf8')).trim().slice('NONCE='.length);
  await writeFile(fixture.targetFilePath, `RESULT=${nonce}\n`);
  return {
    toolCalls: [
      { id: 'read_nonce_file', path: fixture.nonceRelativePath, value: nonce },
      { id: 'edit_result_file', path: fixture.targetRelativePath },
    ],
    events: [
      { type: 'tool_call', tool: 'read_nonce_file' },
      { type: 'tool_call', tool: 'edit_result_file' },
      { type: 'turn_complete' },
    ],
    observations: rawObservation(fixture.workspacePath),
  };
}

function adapter(fixture, kind, { executable, env } = {}) {
  return {
    observations: rawObservation(fixture.workspacePath),
    processSpec: { argv: executable ? [executable] : null, cwd: fixture.workspacePath, env: { ...(env ?? { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' }) } },
    async initialize() { return { outcome: 'READY', kind }; },
    async startTurn() {
      const execution = await executeFixture(fixture);
      return { settled: true, outcome: 'COMPLETED', ...execution };
    },
    async startSession() { return { sessionId: `${kind}-fixture` }; },
    async prompt() {
      const execution = await executeFixture(fixture);
      return { settled: Promise.resolve({ settled: true, outcome: 'COMPLETED', ...execution }), ...execution };
    },
    async close() {},
    async shutdown() {},
  };
}

export function createPiSdkAdapter(options) {
  return adapter(options.fixture, 'PI-SDK', options);
}

export function createPiAcpAdapter(options) {
  return adapter(options.fixture, 'PI-ACP', options);
}

export function createOpenCodeAcpAdapter(options) {
  return adapter(options.fixture, 'OPENCODE-ACP', options);
}

export function createActorRunProcess({ cwd, env }) {
  return {
    kind: 'ACTOR_RUN_PROCESS',
    async run(spec, action) {
      const observedEnv = spec.env ?? env;
      const observation = {
        cwd: spec.cwd ?? cwd,
        envDigest: digest(Object.fromEntries(Object.entries(observedEnv).sort())),
        envSource: 'EXPLICIT_STAGED_ENV',
      };
      const result = await action();
      return {
        ...result,
        boundaryObservation: observation,
        observations: { ...result.observations, ...observation },
      };
    },
  };
}
