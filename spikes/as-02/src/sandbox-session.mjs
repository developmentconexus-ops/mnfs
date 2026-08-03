import { realpathSync } from 'node:fs';

import { as02Error, assertAs02 } from './errors.mjs';
import { assertPolicyHash } from './policy.mjs';
import { commandFromArgv } from './posix-argv.mjs';

const MANAGER_METHODS = ['initialize', 'wrapWithSandboxArgv', 'reset'];

function unavailable(message, cause, details = {}) {
  return as02Error('SANDBOX_UNAVAILABLE', message, {
    ...details,
    cause: cause instanceof Error ? cause.message : cause === undefined ? undefined : String(cause),
  });
}

function validateManager(manager) {
  assertAs02(manager && typeof manager === 'object', 'SANDBOX_UNAVAILABLE', 'SandboxManager is unavailable.');
  for (const method of MANAGER_METHODS) {
    assertAs02(typeof manager[method] === 'function', 'SANDBOX_UNAVAILABLE', `SandboxManager.${method} is unavailable.`);
  }
  return manager;
}

function validateWorkerEnv(workerEnv) {
  assertAs02(workerEnv && typeof workerEnv === 'object' && !Array.isArray(workerEnv), 'SANDBOX_UNAVAILABLE', 'Worker environment must be an object.');
  const result = {};
  for (const [key, value] of Object.entries(workerEnv)) {
    assertAs02(/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key), 'SANDBOX_UNAVAILABLE', 'Worker environment key is invalid.', { key });
    assertAs02(typeof value === 'string', 'SANDBOX_UNAVAILABLE', 'Worker environment values must be strings.', { key });
    result[key] = value;
  }
  return Object.freeze(result);
}

function validateWrappedDescriptor(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    !Array.isArray(value.argv) ||
    value.argv.length === 0 ||
    !value.argv.every((entry) => typeof entry === 'string' && entry.length > 0) ||
    !value.env ||
    typeof value.env !== 'object'
  ) {
    throw as02Error('SANDBOX_DESCRIPTOR_INVALID', 'Sandbox Runtime returned an invalid spawn descriptor.');
  }
  return value;
}

export async function loadSandboxRuntime(importer = (specifier) => import(specifier)) {
  try {
    const module = await importer('@anthropic-ai/sandbox-runtime');
    return validateManager(module?.SandboxManager);
  } catch (cause) {
    if (cause?.code === 'SANDBOX_UNAVAILABLE') throw cause;
    throw unavailable('Unable to load @anthropic-ai/sandbox-runtime.', cause);
  }
}

export function createSandboxSession({
  manager,
  processRunner,
  policy,
  expectedPolicyHash,
  cwd,
  workerEnv,
}) {
  const sandboxManager = validateManager(manager);
  assertAs02(typeof processRunner === 'function', 'SANDBOX_UNAVAILABLE', 'Sandbox process runner is required.');
  assertAs02(policy && typeof policy === 'object' && policy.config && typeof policy.config === 'object', 'SANDBOX_UNAVAILABLE', 'Compiled sandbox policy is required.');
  let canonicalCwd;
  try {
    canonicalCwd = realpathSync.native(cwd);
  } catch (cause) {
    throw unavailable('Sandbox cwd must exist.', cause, { cwd });
  }
  const environment = validateWorkerEnv(workerEnv);

  let state = 'NEW';
  let managerTouched = false;
  let closePromise;
  let failure;

  function assertReady() {
    if (state !== 'READY') {
      throw unavailable('Sandbox session is not available for execution.', failure, { state });
    }
  }

  async function initialize() {
    if (state === 'READY') return;
    if (state === 'FAILED' || state === 'CLOSED') {
      throw unavailable('Sandbox session cannot be initialized in its current state.', failure, { state });
    }

    try {
      assertPolicyHash(expectedPolicyHash, policy.hash);
    } catch (cause) {
      state = 'FAILED';
      failure = cause;
      throw cause;
    }

    managerTouched = true;
    try {
      await sandboxManager.initialize(policy.config, undefined, true);
      state = 'READY';
    } catch (cause) {
      state = 'FAILED';
      failure = cause;
      throw unavailable('Sandbox Runtime initialization failed closed.', cause);
    }
  }

  async function run(argv, { signal, timeoutMs = 30_000 } = {}) {
    assertReady();
    const command = commandFromArgv(argv);
    let descriptor;
    try {
      descriptor = validateWrappedDescriptor(
        await sandboxManager.wrapWithSandboxArgv(
          command,
          '/bin/bash',
          undefined,
          signal,
          canonicalCwd,
        ),
      );
    } catch (cause) {
      failure = cause;
      state = 'FAILED';
      throw unavailable('Sandbox Runtime could not wrap the command; host fallback is forbidden.', cause);
    }

    return processRunner({
      file: descriptor.argv[0],
      args: descriptor.argv.slice(1),
      cwd: canonicalCwd,
      env: { ...environment },
      timeoutMs,
      signal,
    });
  }

  async function close() {
    if (closePromise) return closePromise;
    const previousState = state;
    state = 'CLOSED';
    closePromise = (async () => {
      if (!managerTouched && previousState === 'NEW') return;
      try {
        await sandboxManager.reset();
      } catch (cause) {
        throw as02Error('SANDBOX_CLEANUP_FAILED', 'Sandbox Runtime cleanup failed.', {
          cause: cause instanceof Error ? cause.message : String(cause),
        });
      }
    })();
    return closePromise;
  }

  return Object.freeze({
    initialize,
    run,
    close,
    get state() {
      return state;
    },
  });
}
