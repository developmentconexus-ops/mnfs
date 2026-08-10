import { createHash } from 'node:crypto';
import { startProcess } from './process-runner.mjs';

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
    if ((name === 'read_nonce_file' || name === 'read_text_file')
      && fixturePath(fixture, input.path, fixture.nonceRelativePath)) {
      calls.push({
        id: 'read_nonce_file',
        path: fixture.nonceRelativePath,
        value: eventOutput(message),
      });
    }
    if ((name === 'edit_result_file' || name === 'write_text_file')
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

function settledObservation(messages, mode) {
  const response = [...messages].reverse().find((message) => message?.type === 'response' && message?.command === 'prompt');
  const settledEvent = [...messages].reverse().find((message) => message?.type === 'agent_settled');
  const agentEnd = [...messages].reverse().find((message) => message?.type === 'agent_end');
  const completed = Boolean(settledEvent || (agentEnd && agentEnd.willRetry === false));
  const cancelled = mode === 'CANCEL' && messages.some((message) => message?.type === 'response' && message?.command === 'abort' && message.success === true);
  return {
    settled: completed || cancelled,
    outcome: completed ? 'COMPLETED' : cancelled ? 'CANCELLED' : 'FAILED',
    protocol: 'PI_RPC_JSONL',
    responseAccepted: response?.success === true,
    settledEvent: settledEvent?.type ?? agentEnd?.type ?? null,
  };
}

/**
 * Pi 0.84.1's supported RPC boundary is the staged executable's JSONL
 * subprocess mode. This function intentionally has no SDK/session fallback.
 */
export async function runPiRpcProcess({ executable, cwd, env, prompt, mode = 'NORMAL', beforeSpawn } = {}) {
  if (typeof executable !== 'string' || !executable.startsWith('/')) throw new TypeError('Pi RPC executable must be absolute');
  await beforeSpawn?.();
  const execution = startProcess({
    argv: [executable, '--mode', 'rpc'],
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
  const parser = parseJsonLines((message) => messages.push(clone(message)));
  execution.stdout.on('data', (chunk) => parser.push(chunk));
  writeRpcCommand(execution, { id: 'mnfs-s1-prompt', type: 'prompt', message: prompt });

  let controlTimer = null;
  if (mode === 'CANCEL') {
    controlTimer = setTimeout(() => {
      writeRpcCommand(execution, { type: 'abort' });
      setTimeout(() => execution.cancel('S1-C06 trusted Pi RPC cancellation checkpoint'), 50);
    }, 25);
  }
  if (mode === 'DEATH') controlTimer = setTimeout(() => execution.forceKill('S1-C09 trusted Pi RPC forced process death checkpoint'), 25);
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
  parser.finish();
  return {
    processResult,
    messages,
    settled: settledObservation(messages, mode),
    fixtureToolCalls: [],
    boundaryObservation: {
      cwd,
      envDigest: digestEnvironment(env),
      environmentMatchesRecord: true,
      source: 'MNFS_TRUSTED_PROCESS_RUNNER',
      argv: [executable, '--mode', 'rpc'],
      protocol: 'PI_RPC_JSONL',
    },
  };
}
