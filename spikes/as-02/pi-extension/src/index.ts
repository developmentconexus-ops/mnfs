import { randomUUID } from 'node:crypto';
import {
  appendFile,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, relative } from 'node:path';

import { canonicalJson, sha256Text } from '../../src/canonical-json.mjs';
import { as02Error, assertAs02 } from '../../src/errors.mjs';
import { assertPolicyHash } from '../../src/policy.mjs';
import { runProcess } from '../../src/process-runner.mjs';
import {
  createSandboxSession,
  loadSandboxRuntime,
} from '../../src/sandbox-session.mjs';

const REQUIRED_ENV = Object.freeze([
  'MNFS_AS02_POLICY_PATH',
  'MNFS_AS02_POLICY_HASH',
  'MNFS_AS02_WORKTREE',
  'MNFS_AS02_BROKER',
  'MNFS_AS02_OPERATION_ROOT',
  'MNFS_AS02_ARTIFACT_ROOT',
]);
const TOOL_NAMES = Object.freeze(['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls']);
const WORKER_ENV_KEYS = new Set(['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'GIT_OPTIONAL_LOCKS']);
const MAX_MODEL_RESULT_BYTES = 65_536;
const SENTINEL_PATTERN = /MNFS_AS02_(?:SENTINEL|SECRET|TOKEN)/u;

function inside(root, candidate) {
  const relation = relative(root, candidate);
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation));
}

function schema(properties, required) {
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  };
}

const TOOL_SCHEMAS = Object.freeze({
  bash: schema({
    command: { type: 'string', minLength: 1 },
    timeoutMs: { type: 'integer', minimum: 1, maximum: 300_000 },
  }, ['command']),
  read: schema({
    path: { type: 'string', minLength: 1 },
    offset: { type: 'integer', minimum: 0 },
    limit: { type: 'integer', minimum: 1 },
  }, ['path']),
  write: schema({
    path: { type: 'string', minLength: 1 },
    content: { type: 'string' },
  }, ['path', 'content']),
  edit: schema({
    path: { type: 'string', minLength: 1 },
    oldText: { type: 'string', minLength: 1 },
    newText: { type: 'string' },
  }, ['path', 'oldText', 'newText']),
  grep: schema({
    path: { type: 'string', minLength: 1 },
    query: { type: 'string', minLength: 1 },
    maxResults: { type: 'integer', minimum: 1, maximum: 10_000 },
  }, ['path', 'query']),
  find: schema({
    path: { type: 'string', minLength: 1 },
    pattern: { type: 'string', minLength: 1 },
    maxResults: { type: 'integer', minimum: 1, maximum: 10_000 },
  }, ['path', 'pattern']),
  ls: schema({
    path: { type: 'string', minLength: 1 },
    maxEntries: { type: 'integer', minimum: 1, maximum: 10_000 },
  }, ['path']),
});

function requiredEnvironment(env) {
  const values = {};
  for (const key of REQUIRED_ENV) {
    const value = env[key];
    assertAs02(typeof value === 'string' && value.length > 0, 'EXTENSION_CONFIG_INVALID', `Missing ${key}.`);
    values[key] = value;
  }
  return values;
}

async function exactPath(value, label, realpathFn) {
  assertAs02(isAbsolute(value), 'EXTENSION_CONFIG_INVALID', `${label} must be absolute.`, { value });
  try {
    const exact = await realpathFn(value);
    assertAs02(exact !== '/mnt' && !exact.startsWith('/mnt/'), 'EXTENSION_TRUST_BOUNDARY_INVALID', `${label} must live on the Linux filesystem.`, { exact });
    return exact;
  } catch (cause) {
    if (cause?.code?.startsWith?.('EXTENSION_')) throw cause;
    throw as02Error('EXTENSION_CONFIG_INVALID', `${label} must exist.`, {
      value,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

async function futureOutputPath(value, label, realpathFn) {
  if (value === undefined) return null;
  assertAs02(typeof value === 'string' && isAbsolute(value) && !/[\r\n]/u.test(value), 'EXTENSION_CONFIG_INVALID', `${label} must be one absolute path.`);
  const parent = await exactPath(dirname(value), `${label} parent`, realpathFn);
  return join(parent, value.slice(dirname(value).length + 1));
}

function validateWorkerEnv(value) {
  assertAs02(value && typeof value === 'object' && !Array.isArray(value), 'EXTENSION_CONFIG_INVALID', 'workerEnv must be an object.');
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    assertAs02(WORKER_ENV_KEYS.has(key), 'EXTENSION_CONFIG_INVALID', `workerEnv key ${key} is not allowed.`, { key });
    assertAs02(typeof entry === 'string', 'EXTENSION_CONFIG_INVALID', `workerEnv value ${key} must be a string.`, { key });
    result[key] = entry;
  }
  for (const required of ['PATH', 'HOME', 'TMPDIR', 'GIT_OPTIONAL_LOCKS']) {
    assertAs02(typeof result[required] === 'string' && result[required].length > 0, 'EXTENSION_CONFIG_INVALID', `workerEnv.${required} is required.`);
  }
  assertAs02(result.GIT_OPTIONAL_LOCKS === '0', 'EXTENSION_CONFIG_INVALID', 'workerEnv.GIT_OPTIONAL_LOCKS must be 0.');
  return result;
}

function toolDefinition(name, execute) {
  return {
    name,
    label: `AS-02 ${name}`,
    description: `Execute the bounded ${name} operation through the frozen AS-02 sandbox policy.`,
    promptSnippet: `${name}: execute the reviewed ${name} operation inside the leased AS-02 worktree.`,
    promptGuidelines: [
      `Use ${name} only for paths and commands inside the leased AS-02 worktree.`,
      'Never claim an operation succeeded unless the tool returns a successful result.',
    ],
    parameters: TOOL_SCHEMAS[name],
    async execute(toolCallId, params, signal) {
      return execute(toolCallId, params, signal);
    },
  };
}

function parseBrokerResult(processResult, policyHash) {
  if (processResult.exitCode !== 0) {
    throw as02Error('EXTENSION_BROKER_FAILED', 'Sandboxed broker returned a non-zero exit.', {
      exitCode: processResult.exitCode,
      signal: processResult.signal,
      stderr: processResult.stderr.toString('utf8').slice(0, 4_096),
    });
  }
  if (processResult.stdout.length > MAX_MODEL_RESULT_BYTES || SENTINEL_PATTERN.test(processResult.stdout.toString('utf8'))) {
    throw as02Error('EXTENSION_OUTPUT_REJECTED', 'Broker output is oversized or contains a synthetic marker.');
  }

  let payload;
  try {
    payload = JSON.parse(processResult.stdout.toString('utf8'));
  } catch (cause) {
    throw as02Error('EXTENSION_BROKER_FAILED', 'Broker output is not valid JSON.', {
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  if (!payload || payload.ok !== true || !Object.hasOwn(payload, 'result')) {
    throw as02Error('EXTENSION_BROKER_FAILED', 'Broker did not return a successful result.');
  }
  const text = JSON.stringify(payload.result);
  if (Buffer.byteLength(text, 'utf8') > MAX_MODEL_RESULT_BYTES || SENTINEL_PATTERN.test(text)) {
    throw as02Error('EXTENSION_OUTPUT_REJECTED', 'Broker result is oversized or contains a synthetic marker.');
  }
  return {
    content: [{ type: 'text', text }],
    details: { policyHash },
  };
}

async function atomicJson(path, value, dependencies) {
  if (!path) return;
  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  await dependencies.writeFile(temp, `${canonicalJson(value)}\n`, { flag: 'wx', mode: 0o600 });
  await dependencies.rename(temp, path);
}

export function createAs02Extension(dependencies = {}) {
  const env = dependencies.env ?? process.env;
  const readFileFn = dependencies.readFile ?? readFile;
  const realpathFn = dependencies.realpath ?? realpath;
  const mkdirFn = dependencies.mkdir ?? mkdir;
  const writeFileFn = dependencies.writeFile ?? writeFile;
  const renameFn = dependencies.rename ?? rename;
  const appendFileFn = dependencies.appendFile ?? appendFile;
  const rmFn = dependencies.rm ?? rm;
  const randomId = dependencies.randomId ?? (() => randomUUID());
  const now = dependencies.now ?? (() => new Date().toISOString());
  const loadRuntime = dependencies.loadRuntime ?? loadSandboxRuntime;
  const createSession = dependencies.createSession ?? createSandboxSession;
  const processRunner = dependencies.processRunner ?? runProcess;
  const nodePath = dependencies.nodePath ?? process.execPath;

  return async function as02Extension(pi) {
    const config = requiredEnvironment(env);
    const policyPath = await exactPath(config.MNFS_AS02_POLICY_PATH, 'Policy path', realpathFn);
    const worktree = await exactPath(config.MNFS_AS02_WORKTREE, 'Worktree', realpathFn);
    const broker = await exactPath(config.MNFS_AS02_BROKER, 'Broker', realpathFn);
    const operationRoot = await exactPath(config.MNFS_AS02_OPERATION_ROOT, 'Operation root', realpathFn);
    const artifactRoot = await exactPath(config.MNFS_AS02_ARTIFACT_ROOT, 'Artifact root', realpathFn);
    const receiptPath = await futureOutputPath(env.MNFS_AS02_EXTENSION_RECEIPT, 'Extension receipt', realpathFn);
    const eventPath = await futureOutputPath(env.MNFS_AS02_EXTENSION_EVENTS, 'Extension events', realpathFn);

    for (const [label, trustedPath] of [
      ['Policy path', policyPath],
      ['Broker', broker],
      ['Operation root', operationRoot],
      ['Artifact root', artifactRoot],
      ['Extension receipt', receiptPath],
      ['Extension events', eventPath],
    ]) {
      if (!trustedPath) continue;
      assertAs02(!inside(worktree, trustedPath), 'EXTENSION_TRUST_BOUNDARY_INVALID', `${label} must be outside Worker write authority.`, {
        worktree,
        trustedPath,
      });
    }

    let policyDocument;
    try {
      policyDocument = JSON.parse(await readFileFn(policyPath, 'utf8'));
    } catch (cause) {
      throw as02Error('EXTENSION_CONFIG_INVALID', 'Active policy file is invalid JSON.', {
        cause: cause instanceof Error ? cause.message : String(cause),
      });
    }
    assertAs02(policyDocument && typeof policyDocument === 'object', 'EXTENSION_CONFIG_INVALID', 'Active policy must be an object.');
    assertAs02(policyDocument.config && typeof policyDocument.config === 'object', 'EXTENSION_CONFIG_INVALID', 'Active policy config is required.');
    const computedHash = sha256Text(canonicalJson(policyDocument.config));
    assertPolicyHash(policyDocument.hash, computedHash);
    assertPolicyHash(config.MNFS_AS02_POLICY_HASH, computedHash);
    const workerEnv = validateWorkerEnv(policyDocument.workerEnv);
    const brokerWorkerEnv = {
      ...workerEnv,
      MNFS_AS02_WORKTREE: worktree,
      MNFS_AS02_OPERATION_ROOT: operationRoot,
    };

    const manager = await loadRuntime();
    const session = createSession({
      manager,
      processRunner,
      policy: { config: policyDocument.config, hash: computedHash },
      expectedPolicyHash: computedHash,
      cwd: worktree,
      workerEnv: brokerWorkerEnv,
    });
    await session.initialize();

    let closed = false;
    pi.on('session_shutdown', async () => {
      if (closed) return;
      closed = true;
      await session.close();
    });

    await mkdirFn(operationRoot, { recursive: true, mode: 0o700 });
    await atomicJson(receiptPath, {
      schemaVersion: 1,
      type: 'startup',
      initializedAt: now(),
      policyHash: computedHash,
      worktree,
      broker,
      tools: [...TOOL_NAMES],
    }, { writeFile: writeFileFn, rename: renameFn });

    async function recordToolEvent(toolCallId, tool) {
      if (!eventPath) return;
      await appendFileFn(eventPath, `${canonicalJson({
        schemaVersion: 1,
        type: 'tool_call',
        toolCallId,
        tool,
        policyHash: computedHash,
        finishedAt: now(),
        result: 'SUCCEEDED',
      })}\n`, { mode: 0o600 });
    }

    async function executeTool(name, toolCallId, params, signal) {
      const id = randomId();
      assertAs02(/^[A-Za-z0-9._-]+$/u.test(id), 'EXTENSION_CONFIG_INVALID', 'Operation ID is invalid.', { id });
      const operationPath = join(operationRoot, `${id}.json`);
      const operation = { operation: name, ...params };
      await writeFileFn(operationPath, `${JSON.stringify(operation)}\n`, { flag: 'wx', mode: 0o600 });
      try {
        const observed = await session.run([nodePath, broker, operationPath], {
          signal,
          timeoutMs: typeof params.timeoutMs === 'number' ? params.timeoutMs : 30_000,
        });
        const result = parseBrokerResult(observed, computedHash);
        await recordToolEvent(toolCallId, name);
        return result;
      } finally {
        await rmFn(operationPath, { force: true });
      }
    }

    for (const name of TOOL_NAMES) {
      pi.registerTool(toolDefinition(name, (toolCallId, params, signal) => executeTool(name, toolCallId, params, signal)));
    }

    return { policyHash: computedHash, worktree, broker, operationRoot, artifactRoot, receiptPath, eventPath };
  };
}

export default createAs02Extension();
