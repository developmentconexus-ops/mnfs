import { isAbsolute, join } from 'node:path';
import { realpathSync } from 'node:fs';

import { canonicalJson, sha256Text } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';

const LINUX_GLOB_PATTERN = /[*?\[\]]/u;
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function exactPath(path, label) {
  assertAs02(typeof path === 'string' && path.length > 0, 'INVALID_POLICY_PATH', `${label} must be a non-empty path.`, { label });
  assertAs02(isAbsolute(path), 'INVALID_POLICY_PATH', `${label} must be absolute.`, { label, path });
  assertAs02(!LINUX_GLOB_PATTERN.test(path), 'INVALID_POLICY_PATH', `${label} must be a literal Linux path.`, { label, path });

  try {
    return realpathSync.native(path);
  } catch (cause) {
    throw as02Error('INVALID_POLICY_PATH', `${label} must exist before policy compilation.`, {
      label,
      path,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

function exactPaths(paths, label) {
  assertAs02(Array.isArray(paths), 'INVALID_POLICY_PATH', `${label} must be an array.`, { label });
  const seen = new Set();
  const result = [];
  for (const [index, path] of paths.entries()) {
    const resolved = exactPath(path, `${label}[${index}]`);
    if (!seen.has(resolved)) {
      seen.add(resolved);
      result.push(resolved);
    }
  }
  return result;
}

function domains(values, label) {
  assertAs02(Array.isArray(values), 'INVALID_POLICY_DOMAIN', `${label} must be an array.`, { label });
  const seen = new Set();
  const result = [];
  for (const [index, value] of values.entries()) {
    assertAs02(
      typeof value === 'string' && value.length > 0 && !/[\s/:]/u.test(value),
      'INVALID_POLICY_DOMAIN',
      `${label}[${index}] must be a bare domain pattern.`,
      { label, value },
    );
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

function unique(paths) {
  return [...new Set(paths)];
}

export function compilePolicy(input) {
  assertAs02(input && typeof input === 'object', 'INVALID_POLICY_PATH', 'Policy input must be an object.');

  const worktreePath = exactPath(input.worktreePath, 'worktreePath');
  const attemptTempPath = exactPath(input.attemptTempPath, 'attemptTempPath');
  const brokerPath = exactPath(input.brokerPath, 'brokerPath');
  const policyRoot = exactPath(input.policyRoot, 'policyRoot');
  const runtimeRoot = exactPath(input.runtimeRoot, 'runtimeRoot');
  const realHome = exactPath(input.realHome, 'realHome');
  const fakeHome = exactPath(input.fakeHome, 'fakeHome');
  const mountRoot = exactPath(input.mountRoot, 'mountRoot');
  const gitReadPaths = exactPaths(input.gitReadPaths ?? [], 'gitReadPaths');
  const gitDenyWritePaths = exactPaths(input.gitDenyWritePaths ?? [], 'gitDenyWritePaths');
  const trustedReadPaths = exactPaths(input.trustedReadPaths ?? [], 'trustedReadPaths');

  const protectedWorktreePaths = exactPaths(
    [
      join(worktreePath, '.mnfs'),
      join(worktreePath, '.pi'),
      join(worktreePath, '.env'),
      join(worktreePath, '.git'),
    ],
    'protectedWorktreePaths',
  );

  const config = {
    network: {
      allowedDomains: domains(input.network?.allowedDomains ?? [], 'network.allowedDomains'),
      deniedDomains: domains(input.network?.deniedDomains ?? [], 'network.deniedDomains'),
      strictAllowlist: true,
      allowUnixSockets: [],
      allowAllUnixSockets: false,
      allowLocalBinding: false,
    },
    filesystem: {
      denyRead: unique([realHome, fakeHome, mountRoot, policyRoot, runtimeRoot]),
      allowRead: unique([
        worktreePath,
        brokerPath,
        attemptTempPath,
        ...gitReadPaths,
        ...trustedReadPaths,
      ]),
      allowWrite: unique([worktreePath, attemptTempPath]),
      denyWrite: unique([
        ...protectedWorktreePaths,
        policyRoot,
        ...gitDenyWritePaths,
      ]),
    },
    mandatoryDenySearchDepth: 10,
    enableWeakerNestedSandbox: false,
    enableWeakerNetworkIsolation: false,
  };

  const canonical = canonicalJson(config);
  return { config, canonical, hash: sha256Text(canonical) };
}

export function buildWorkerEnv(hostEnv, paths) {
  assertAs02(hostEnv && typeof hostEnv === 'object', 'INVALID_POLICY_PATH', 'hostEnv must be an object.');
  const fakeHome = exactPath(paths.fakeHome, 'fakeHome');
  const attemptTemp = exactPath(paths.attemptTemp, 'attemptTemp');
  const executablePaths = exactPaths(paths.executablePaths ?? [], 'executablePaths');
  assertAs02(executablePaths.length > 0, 'INVALID_POLICY_PATH', 'At least one executable path is required.');

  const env = {
    PATH: executablePaths.join(':'),
    HOME: fakeHome,
    TMPDIR: attemptTemp,
  };
  if (typeof hostEnv.LANG === 'string' && hostEnv.LANG.length > 0) env.LANG = hostEnv.LANG;
  if (typeof hostEnv.LC_ALL === 'string' && hostEnv.LC_ALL.length > 0) env.LC_ALL = hostEnv.LC_ALL;
  env.GIT_OPTIONAL_LOCKS = '0';
  if (typeof paths.nodeOptions === 'string' && paths.nodeOptions.length > 0) {
    env.NODE_OPTIONS = paths.nodeOptions;
  }
  return env;
}

export function assertPolicyHash(expected, actual) {
  assertAs02(
    typeof expected === 'string' && HASH_PATTERN.test(expected),
    'POLICY_HASH_MISMATCH',
    'Expected policy hash is malformed.',
    { expected },
  );
  assertAs02(
    typeof actual === 'string' && HASH_PATTERN.test(actual),
    'POLICY_HASH_MISMATCH',
    'Actual policy hash is malformed.',
    { actual },
  );
  assertAs02(expected === actual, 'POLICY_HASH_MISMATCH', 'Effective policy hash does not match the approved hash.', {
    expected,
    actual,
  });
}
