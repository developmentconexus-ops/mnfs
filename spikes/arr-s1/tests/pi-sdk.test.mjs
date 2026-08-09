import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPiSdkAdapter,
  normalizePiEvent,
} from '../src/adapters/pi-sdk.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';
const TOOLS = Object.freeze(['read', 'grep']);
const CUSTOM_TOOLS = Object.freeze([
  Object.freeze({ name: 'fixture_tool', label: 'Fixture tool' }),
]);

function fakeResourceLoader() {
  return {
    getExtensions() { return { extensions: [], errors: [], runtime: {} }; },
    getSkills() { return { skills: [], diagnostics: [] }; },
    getPrompts() { return { prompts: [], diagnostics: [] }; },
    getThemes() { return { themes: [], diagnostics: [] }; },
    getAgentsFiles() { return { agentsFiles: [] }; },
    getSystemPrompt() { return undefined; },
    getSystemPromptSource() { return undefined; },
    getAppendSystemPrompt() { return []; },
    getAppendSystemPromptSources() { return []; },
    extendResources() {},
    async reload() {},
  };
}

function fakePiSdk({ promptResult, promptError } = {}) {
  const calls = {
    create: [],
    prompts: [],
    aborts: [],
    disposes: 0,
  };
  const listeners = new Set();
  let resolvePrompt;

  const session = {
    sessionId: 'pi-session-observation-only',
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(event) {
      for (const listener of listeners) listener(event);
    },
    prompt(input) {
      calls.prompts.push(input);
      if (promptError) return Promise.reject(promptError);
      if (promptResult !== undefined) return Promise.resolve(promptResult);
      return new Promise((resolve) => {
        resolvePrompt = resolve;
      });
    },
    async abort() {
      calls.aborts.push([...arguments]);
      session.emit({ type: 'agent_end', messages: [], willRetry: false });
      resolvePrompt?.();
    },
    dispose() {
      calls.disposes += 1;
    },
  };

  return {
    calls,
    session,
    finishPrompt(value = undefined) {
      resolvePrompt?.(value);
    },
    sdk: {
      async createAgentSession(options) {
        calls.create.push(options);
        return {
          session,
          extensionsResult: { extensions: [], errors: [], runtime: {} },
        };
      },
    },
  };
}

function adapterOptions(fake) {
  const resourceLoader = fakeResourceLoader();
  const sessionManager = { getCwd: () => CWD };
  return {
    sdk: fake.sdk,
    cwd: CWD,
    tools: TOOLS,
    noTools: 'builtin',
    customTools: CUSTOM_TOOLS,
    resourceLoader,
    sessionManager,
  };
}

test('uses only the frozen Pi createAgentSession options and keeps session identity observational', async () => {
  const fake = fakePiSdk();
  const options = adapterOptions(fake);
  const adapter = createPiSdkAdapter(options);

  const initialized = await adapter.initialize();

  assert.deepEqual(fake.calls.create[0], {
    cwd: CWD,
    tools: [...TOOLS],
    noTools: 'builtin',
    customTools: CUSTOM_TOOLS,
    resourceLoader: options.resourceLoader,
    sessionManager: options.sessionManager,
  });
  assert.equal('env' in fake.calls.create[0], false);
  assert.equal('resources' in fake.calls.create[0], false);
  assert.equal('discovery' in fake.calls.create[0], false);
  assert.equal('allowAmbientDiscovery' in fake.calls.create[0], false);
  assert.equal('mcpServers' in fake.calls.create[0], false);
  assert.deepEqual(initialized, {
    status: 'READY',
    cwd: CWD,
    runtimeSession: {
      id: 'pi-session-observation-only',
      observational: true,
    },
  });
  assert.equal(initialized.authority, undefined);
  assert.equal(initialized.recoveryState, undefined);
});

test('rejects environment claims at the Pi SDK boundary', () => {
  const fake = fakePiSdk();

  assert.throws(
    () => createPiSdkAdapter({ ...adapterOptions(fake), env: { HOME: '/tmp/ambient' } }),
    /does not control environment/u,
  );
});

test('normalizes real Pi AgentSession events without accepting generic runtime events', async () => {
  const fake = fakePiSdk();
  const adapter = createPiSdkAdapter(adapterOptions(fake));
  await adapter.initialize();

  const turn = adapter.startTurn('run the controlled fixture task');
  fake.session.emit({ type: 'agent_start' });
  fake.session.emit({
    type: 'message_update',
    message: { role: 'assistant', content: [] },
    assistantMessageEvent: { type: 'text_delta', contentIndex: 0, delta: 'structured' },
  });
  fake.session.emit({
    type: 'tool_execution_start',
    toolCallId: 'call-1',
    toolName: 'fixture_tool',
    args: { path: 'fixture/nonce.txt' },
  });
  fake.session.emit({
    type: 'tool_execution_end',
    toolCallId: 'call-1',
    toolName: 'fixture_tool',
    result: { content: [{ type: 'text', text: 'ok' }] },
    isError: false,
  });
  fake.session.emit({ type: 'agent_end', messages: [], willRetry: false });

  const settled = await turn;

  assert.equal(fake.calls.prompts[0], 'run the controlled fixture task');
  assert.equal(settled.settled, true);
  assert.equal(settled.outcome, 'COMPLETED');
  assert.deepEqual(settled.events.map(({ type, data }) => ({ type, data })), [
    { type: 'lifecycle', data: { state: 'STARTED' } },
    { type: 'assistant_output', data: { channel: 'answer', text: 'structured' } },
    { type: 'tool_call', data: { toolCallId: 'call-1', toolName: 'fixture_tool', input: { path: 'fixture/nonce.txt' } } },
    { type: 'tool_result', data: { toolCallId: 'call-1', toolName: 'fixture_tool', result: { content: [{ type: 'text', text: 'ok' }] }, isError: false } },
    { type: 'lifecycle', data: { state: 'FINAL', willRetry: false } },
  ]);
  assert.equal(settled.runtimeSession.observational, true);
  assert.equal(settled.authority, undefined);
  assert.equal(settled.recoveryState, undefined);
  assert.throws(
    () => normalizePiEvent({ type: 'process', data: { outcome: 'SIGNAL_DEATH' } }, { sequence: 1 }),
    /unsupported Pi AgentSession event/u,
  );
  fake.finishPrompt();
});

test('cancels through session.abort without passing a non-upstream reason', async () => {
  const fake = fakePiSdk();
  const adapter = createPiSdkAdapter(adapterOptions(fake));
  await adapter.initialize();

  const turn = adapter.startTurn('wait for cancellation');
  const settled = await adapter.cancel('operator-request');

  assert.deepEqual(fake.calls.aborts, [[]]);
  assert.equal(settled.outcome, 'CANCELLED');
  assert.equal(settled.settled, true);
  assert.equal((await turn).outcome, 'CANCELLED');
});

test('disposes the injected Pi AgentSession idempotently', async () => {
  const fake = fakePiSdk({ promptResult: undefined });
  const adapter = createPiSdkAdapter(adapterOptions(fake));
  await adapter.initialize();

  await adapter.close();
  await adapter.close();

  assert.equal(fake.calls.disposes, 1);
});
