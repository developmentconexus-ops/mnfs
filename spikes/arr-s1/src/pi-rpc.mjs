import { createHash } from 'node:crypto';
import { startProcess } from './process-runner.mjs';
import { requirePiCredentialRoute, piCredentialRouteEvidence } from './credential-routes.mjs';

export const PI_RPC_CONTROL_ARGS = Object.freeze([
  '--tools', 'read,edit',
  '--no-extensions',
  '--no-skills',
  '--no-prompt-templates',
  '--no-themes',
  '--no-context-files',
]);

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function digestEnvironment(env) {
  return `sha256:${createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(env).sort()))).digest('hex')}`;
}

function parseJsonLines(onMessage) {
  let pending = '';
  return {
    push(chunk) {
      pending += Buffer.from(chunk).toString('utf8');
      let newline;
      while ((newline = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0, newline).replace(/\r$/u, '');
        pending = pending.slice(newline + 1);
        if (line.trim() === '') continue;
        try { onMessage(JSON.parse(line)); } catch { /* malformed candidate output remains non-authoritative */ }
      }
    },
    finish() {
      const line = pending.trim();
      if (line === '') return;
      try { onMessage(JSON.parse(line)); } catch { /* malformed candidate output remains non-authoritative */ }
    },
  };
}

function writeRpcCommand(execution, command) {
  if (!execution.stdin || execution.stdin.destroyed) return false;
  execution.stdin.write(`${JSON.stringify(command)}\n`);
  return true;
}

function eventInput(message) {
  return message?.args ?? message?.rawInput ?? message?.input ?? message?.arguments ?? {};
}

function eventOutput(message) {
  const result = message?.result ?? message?.rawOutput ?? message?.output ?? message?.content;
  if (typeof result === 'string') return result;
  if (Array.isArray(result?.content)) return result.content.find((item) => item?.type === 'text')?.text ?? null;
  if (Array.isArray(result)) return result.find((item) => item?.type === 'text')?.text ?? null;
  return result?.text ?? null;
}

function fixturePath(fixture, value, relativePath) {
  if (value === relativePath || value === `${fixture.workspacePath}/${relativePath}`) return relativePath;
  return null;
}

export function translatePiRpcFixtureCalls(messages, fixture) {
  const pending = new Map();
  const calls = [];
  for (const message of messages ?? []) {
    if (message?.type === 'tool_execution_start') {
      const input = eventInput(message);
      const name = message.toolName ?? message.name ?? message.tool?.name;
      const id = message.toolCallId ?? message.id ?? `${calls.length}`;
      pending.set(id, { name, input });
      continue;
    }
    if (message?.type !== 'tool_execution_end') continue;
    const id = message.toolCallId ?? message.id;
    const start = pending.get(id) ?? { name: message.toolName ?? message.name, input: eventInput(message) };
    pending.delete(id);
    const input = start.input ?? {};
    const name = start.name;
    if ((name === 'read' || name === 'read_nonce_file' || name === 'read_text_file')
      && fixturePath(fixture, input.path, fixture.nonceRelativePath)) {
      calls.push({
        id: 'read_nonce_file',
        path: fixture.nonceRelativePath,
        value: eventOutput(message),
      });
    }
    if ((name === 'edit' || name === 'edit_result_file' || name === 'write_text_file')
      && fixturePath(fixture, input.path, fixture.targetRelativePath)) {
      calls.push({
        id: 'edit_result_file',
        path: fixture.targetRelativePath,
        content: input.content ?? input.text ?? eventOutput(message),
      });
    }
  }
  return calls;
}

export function classifyPiRpcLifecycle(messages, { mode = 'NORMAL', control = {}, boundedSettlement = false } = {}) {
  const response = [...messages].reverse().find((message) => message?.type === 'response' && message?.command === 'prompt');
  const settledEvent = [...messages].reverse().find((message) => message?.type === 'agent_settled');
  const agentEnd = [...messages].reverse().find((message) => message?.type === 'agent_end');
  const completed = Boolean(settledEvent || (agentEnd && agentEnd.willRetry === false));
  const abortIndex = messages.findIndex((message) => message?.type === 'response' && message?.command === 'abort' && message.success === true);
  const abortSucceeded = abortIndex >= 0;
  const postControlSettlement = control.requested === true
    && abortSucceeded
    && messages.slice(abortIndex + 1).some((message) => message?.type === 'agent_end' || message?.type === 'agent_settled');
  const cancelled = mode === 'CANCEL'
    && control.requested === true
    && control.turnActive === true
    && abortSucceeded
    && postControlSettlement
    && boundedSettlement;
  const rawLifecycle = {
    outcome: completed ? 'COMPLETED' : 'FAILED',
    completed,
    settledEvent: settledEvent?.type ?? agentEnd?.type ?? null,
  };
  return {
    settled: completed || cancelled,
    outcome: cancelled ? 'CANCELLED' : completed ? 'COMPLETED' : 'FAILED',
    protocol: 'PI_RPC_JSONL',
    responseAccepted: response?.success === true,
    settledEvent: settledEvent?.type ?? agentEnd?.type ?? null,
    rawLifecycle,
    cancellation: {
      abortRequestedWhileActive: control.requested === true && control.turnActive === true,
      abortSucceeded,
      postControlSettlement,
      boundedPostControlSettlement: boundedSettlement && postControlSettlement,
    },
  };
}

function discovered(messages, names) {
  return messages
    .filter((message) => names.has(message?.type))
    .map((message) => message.name ?? message.id ?? message.path ?? message.type)
    .filter((value) => typeof value === 'string');
}

export function derivePiRpcObservations(messages, argv) {
  const flags = new Set(argv ?? []);
  const toolsIndex = (argv ?? []).indexOf('--tools');
  const toolAllowlist = toolsIndex >= 0 ? String(argv[toolsIndex + 1] ?? '').split(',').filter(Boolean).sort() : [];
  const controlledFlags = ['--no-extensions', '--no-skills', '--no-prompt-templates', '--no-themes', '--no-context-files'];
  return {
    controlled: toolAllowlist.join(',') === 'edit,read' && controlledFlags.every((arg) => flags.has(arg)),
    argv: [...(argv ?? [])],
    toolAllowlist,
    extensions: discovered(messages, new Set(['extension_loaded', 'extension_discovered'])),
    skills: discovered(messages, new Set(['skill_loaded', 'skill_discovered'])),
    prompts: discovered(messages, new Set(['prompt_template_loaded', 'prompt_template_discovered'])),
    themes: discovered(messages, new Set(['theme_loaded', 'theme_discovered'])),
    agentsFiles: discovered(messages, new Set(['context_file_loaded', 'agents_file_loaded'])),
  };
}

/**
 * Pi 0.84.1's supported RPC boundary is the staged executable's JSONL
 * subprocess mode. This function intentionally has no SDK/session fallback.
 */
export async function runPiRpcProcess({ executable, cwd, env, prompt, mode = 'NORMAL', beforeSpawn } = {}) {
  if (typeof executable !== 'string' || !executable.startsWith('/')) throw new TypeError('Pi RPC executable must be absolute');
  const credentialDir = requirePiCredentialRoute(env?.PI_CODING_AGENT_DIR);
  await beforeSpawn?.();
  const execution = startProcess({
    argv: [executable, '--mode', 'rpc', ...PI_RPC_CONTROL_ARGS],
    cwd,
    env: { ...env },
    timeoutMs: 5000,
    terminationGraceMs: 100,
    stdoutLimitBytes: 256 * 1024,
    stderrLimitBytes: 256 * 1024,
    stdinMode: 'protocol',
    protocolOwner: 'pi-rpc-client',
  });
  const messages = [];
  let settledAtMs = null;
  let turnActiveAtMs = null;
  const observeMessage = (message) => {
    if (turnActiveAtMs === null && ['agent_start', 'turn_start'].includes(message?.type)) turnActiveAtMs = Date.now();
    if (settledAtMs === null && (message?.type === 'agent_settled' || (message?.type === 'agent_end' && message.willRetry === false))) {
      settledAtMs = Date.now();
    }
    messages.push(clone(message));
  };
  const observedParser = parseJsonLines(observeMessage);
  execution.stdout.on('data', (chunk) => observedParser.push(chunk));
  writeRpcCommand(execution, { id: 'mnfs-s1-prompt', type: 'prompt', message: prompt });

  let controlTimer = null;
  let followupTimer = null;
  let control = { requested: false, kind: null, turnActive: false };
  if (mode === 'CANCEL') {
    controlTimer = setTimeout(() => {
      if (turnActiveAtMs === null || settledAtMs !== null) return;
      control = { requested: true, kind: 'CANCEL', turnActive: true, requestedAtMs: Date.now() };
      writeRpcCommand(execution, { type: 'abort' });
      followupTimer = setTimeout(() => execution.cancel('S1-C06 trusted Pi RPC bounded cancellation checkpoint'), 50);
    }, 25);
  } else if (mode === 'DEATH') controlTimer = setTimeout(() => {
    if (turnActiveAtMs === null || settledAtMs !== null) return;
    control = { requested: true, kind: 'FORCED_DEATH', turnActive: true, requestedAtMs: Date.now() };
    execution.forceKill('S1-C09 trusted Pi RPC forced process death checkpoint');
  }, 25);
  const settledWatcher = setInterval(() => {
    if (settledAtMs === null && messages.some((message) => message?.type === 'agent_settled' || (message?.type === 'agent_end' && message.willRetry === false))) settledAtMs = Date.now();
  }, 1);
  if (mode === 'NORMAL') {
    const stopWhenSettled = setInterval(() => {
      if (messages.some((message) => message?.type === 'agent_settled')) {
        clearInterval(stopWhenSettled);
        execution.cancel('Pi RPC turn settled');
      }
    }, 10);
    execution.result.finally(() => clearInterval(stopWhenSettled));
  }
  const processResult = await execution.result;
  if (controlTimer) clearTimeout(controlTimer);
  if (followupTimer) clearTimeout(followupTimer);
  clearInterval(settledWatcher);
  observedParser.finish();
  if (turnActiveAtMs === null) {
    const activeEvent = messages.find((message) => ['agent_start', 'turn_start'].includes(message?.type));
    if (activeEvent) turnActiveAtMs = Date.now();
  }
  if (settledAtMs === null && messages.some((message) => message?.type === 'agent_settled' || (message?.type === 'agent_end' && message.willRetry === false))) settledAtMs = Date.now();
  const temporal = {
    turnActive: { observed: turnActiveAtMs !== null, atMs: turnActiveAtMs },
    control,
    settlement: {
      observed: settledAtMs !== null || processResult.outcome !== 'NORMAL_EXIT',
      bounded: processResult.termination?.settled === true,
      atMs: settledAtMs ?? Date.now(),
      outcome: processResult.outcome,
    },
    sequence: ['turn-active', ...(control.requested ? ['control-requested'] : []), ...(processResult.termination?.settled === true ? ['bounded-settlement'] : [])],
  };
  const settled = classifyPiRpcLifecycle(messages, {
    mode,
    control,
    boundedSettlement: processResult.termination?.settled === true,
  });
  return {
    processResult,
    messages,
    settled,
    temporal,
    observations: derivePiRpcObservations(messages, processResult.argv),
    fixtureToolCalls: [],
    boundaryObservation: {
      cwd,
      envDigest: digestEnvironment(env),
      environmentMatchesRecord: true,
      source: 'MNFS_TRUSTED_PROCESS_RUNNER',
      argv: [executable, '--mode', 'rpc'],
      protocol: 'PI_RPC_JSONL',
      credentialRoute: piCredentialRouteEvidence(credentialDir),
    },
  };
}
