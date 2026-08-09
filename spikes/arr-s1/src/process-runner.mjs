import { spawn } from 'node:child_process';
import path from 'node:path';

const OUTCOMES = new Set(['NORMAL_EXIT', 'NON_ZERO_EXIT', 'SIGNAL_DEATH', 'TIMEOUT', 'CANCELLED', 'SPAWN_ERROR']);

function validateSpec(spec) {
  if (!spec || !Array.isArray(spec.argv) || spec.argv.length === 0 || spec.argv.some((value) => typeof value !== 'string' || value.length === 0)) {
    throw new TypeError('S1 process argv must be a non-empty array of non-empty strings');
  }
  if (!path.isAbsolute(spec.argv[0])) throw new TypeError('S1 process executable must be absolute');
  if (typeof spec.cwd !== 'string' || !path.isAbsolute(spec.cwd)) throw new TypeError('S1 process cwd must be absolute');
  if (!spec.env || typeof spec.env !== 'object' || Array.isArray(spec.env)) throw new TypeError('S1 process env must be explicit');
  if (Object.getPrototypeOf(spec.env) !== Object.prototype && Object.getPrototypeOf(spec.env) !== null) throw new TypeError('S1 process env must be a plain object');
  for (const [key, value] of Object.entries(spec.env)) {
    if (key.length === 0 || typeof value !== 'string') throw new TypeError('S1 process env keys and values must be strings');
  }
  if (!Number.isSafeInteger(spec.timeoutMs) || spec.timeoutMs <= 0) throw new TypeError('S1 process timeoutMs must be positive');
  if (!Number.isSafeInteger(spec.terminationGraceMs) || spec.terminationGraceMs <= 0) throw new TypeError('S1 process terminationGraceMs must be positive');
  for (const key of ['stdoutLimitBytes', 'stderrLimitBytes']) {
    if (!Number.isSafeInteger(spec[key]) || spec[key] < 0) throw new TypeError(`S1 process ${key} must be non-negative`);
  }
  if (spec.shell !== undefined) throw new TypeError('S1 process shell control is not configurable');
  const stdinMode = spec.stdinMode ?? 'closed';
  if (!['closed', 'protocol'].includes(stdinMode)) throw new TypeError('S1 process stdinMode is invalid');
  if (stdinMode === 'protocol' && (typeof spec.protocolOwner !== 'string' || spec.protocolOwner.length === 0)) {
    throw new TypeError('S1 protocol stdin requires an explicit owner');
  }
  return stdinMode;
}

function terminateProcessGroup(child, signal) {
  if (!child?.pid) return;
  if (process.platform !== 'win32') {
    try { process.kill(-child.pid, signal); return; } catch (error) {
      if (error?.code === 'ESRCH') return;
    }
  }
  try { child.kill(signal); } catch {}
}

function outputAccumulator(limitBytes) {
  const chunks = [];
  let bytesSeen = 0;
  let bytesCaptured = 0;
  return {
    add(chunk) {
      const bytes = Buffer.from(chunk);
      bytesSeen += bytes.length;
      if (bytesCaptured < limitBytes) {
        const remaining = limitBytes - bytesCaptured;
        const kept = bytes.subarray(0, remaining);
        if (kept.length > 0) chunks.push(kept);
        bytesCaptured += kept.length;
      }
    },
    value() { return Buffer.concat(chunks); },
    metadata() {
      return {
        bytesCaptured,
        bytesSeen,
        truncated: bytesSeen > limitBytes,
        limitBytes,
      };
    },
  };
}

function spawnErrorResult(spec, stdinMode, startedAtMs, error, stdout, stderr) {
  return {
    argv: [...spec.argv],
    cwd: spec.cwd,
    envKeys: Object.keys(spec.env).sort(),
    shell: false,
    stdinMode,
    status: 'SPAWN_ERROR',
    outcome: 'SPAWN_ERROR',
    exitCode: null,
    signal: null,
    processDeath: false,
    normalCompletion: false,
    timedOut: false,
    cancelled: false,
    error: { code: error?.code ?? null, message: error?.message ?? String(error) },
    termination: { requested: false, kind: null, reason: null, settled: true },
    stdout: stdout.value(),
    stderr: stderr.value(),
    output: { stdout: stdout.metadata(), stderr: stderr.metadata() },
    durationMs: Date.now() - startedAtMs,
  };
}

export function startProcess(spec, { signal } = {}) {
  const stdinMode = validateSpec(spec);
  const startedAtMs = Date.now();
  const stdout = outputAccumulator(spec.stdoutLimitBytes);
  const stderr = outputAccumulator(spec.stderrLimitBytes);
  const stdio = [stdinMode === 'protocol' ? 'pipe' : 'ignore', 'pipe', 'pipe'];
  const child = spawn(spec.argv[0], spec.argv.slice(1), {
    cwd: spec.cwd,
    env: Object.fromEntries(Object.entries(spec.env)),
    shell: false,
    detached: process.platform !== 'win32',
    stdio,
    windowsHide: true,
  });

  let settled = false;
  let termination = null;
  let forceTimer = null;
  let timeoutTimer = null;
  let removeAbortListener = () => {};
  let resolveResult;

  const result = new Promise((resolve) => { resolveResult = resolve; });

  const finish = ({ exitCode = null, signal: receivedSignal = null, error = null } = {}) => {
    if (settled) return;
    settled = true;
    if (forceTimer) clearTimeout(forceTimer);
    if (timeoutTimer) clearTimeout(timeoutTimer);
    removeAbortListener();

    let status;
    let outcome;
    if (error) {
      status = 'SPAWN_ERROR';
      outcome = 'SPAWN_ERROR';
    } else if (termination?.kind === 'TIMED_OUT') {
      status = 'TIMED_OUT';
      outcome = 'TIMEOUT';
    } else if (termination?.kind === 'CANCELLED') {
      status = 'CANCELLED';
      outcome = 'CANCELLED';
    } else if (receivedSignal) {
      status = 'SIGNALED';
      outcome = 'SIGNAL_DEATH';
    } else {
      status = 'EXITED';
      outcome = exitCode === 0 ? 'NORMAL_EXIT' : 'NON_ZERO_EXIT';
    }
    if (!OUTCOMES.has(outcome)) throw new Error(`unknown S1 process outcome ${outcome}`);

    resolveResult({
      argv: [...spec.argv],
      cwd: spec.cwd,
      envKeys: Object.keys(spec.env).sort(),
      shell: false,
      stdinMode,
      status,
      outcome,
      exitCode,
      signal: receivedSignal,
      processDeath: status === 'SIGNALED',
      normalCompletion: status === 'EXITED' && exitCode === 0,
      timedOut: status === 'TIMED_OUT',
      cancelled: status === 'CANCELLED',
      ...(error ? { error: { code: error?.code ?? null, message: error?.message ?? String(error) } } : {}),
      termination: termination
        ? { requested: true, kind: termination.kind, reason: termination.reason, settled: true }
        : { requested: false, kind: null, reason: null, settled: true },
      stdout: stdout.value(),
      stderr: stderr.value(),
      output: { stdout: stdout.metadata(), stderr: stderr.metadata() },
      durationMs: Date.now() - startedAtMs,
    });
  };

  const requestTermination = (kind, reason) => {
    if (settled || termination) return false;
    termination = { kind, reason };
    terminateProcessGroup(child, 'SIGTERM');
    forceTimer = setTimeout(() => terminateProcessGroup(child, 'SIGKILL'), spec.terminationGraceMs);
    return true;
  };

  child.stdout?.on('data', (chunk) => stdout.add(chunk));
  child.stderr?.on('data', (chunk) => stderr.add(chunk));
  child.once('error', (error) => finish({ error }));
  child.once('close', (exitCode, receivedSignal) => finish({ exitCode, signal: receivedSignal }));

  timeoutTimer = setTimeout(() => requestTermination('TIMED_OUT', `timeout after ${spec.timeoutMs}ms`), spec.timeoutMs);
  if (signal) {
    const onAbort = () => requestTermination('CANCELLED', signal.reason?.message ?? 'aborted');
    if (signal.aborted) onAbort();
    else {
      signal.addEventListener('abort', onAbort, { once: true });
      removeAbortListener = () => signal.removeEventListener('abort', onAbort);
    }
  }

  return {
    pid: child.pid,
    stdin: stdinMode === 'protocol' ? child.stdin : null,
    result,
    cancel(reason = 'explicit cancellation') { return requestTermination('CANCELLED', reason); },
  };
}

export async function runProcess(spec, options = {}) {
  return startProcess(spec, options).result;
}
