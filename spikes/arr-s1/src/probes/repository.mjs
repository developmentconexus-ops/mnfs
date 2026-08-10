import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const SHA_PATTERN = /^[a-f0-9]{40}$/u;

export const FIXED_GIT_ENV = Object.freeze({
  PATH: '/usr/bin:/bin',
  LANG: 'C',
  LC_ALL: 'C',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_CONFIG_COUNT: '2',
  GIT_CONFIG_KEY_0: 'core.fsmonitor',
  GIT_CONFIG_VALUE_0: 'false',
  GIT_CONFIG_KEY_1: 'core.hooksPath',
  GIT_CONFIG_VALUE_1: '/dev/null',
});

const OUTPUT_LIMIT = 64 * 1024;

async function runGit(runCommand, repoRoot, args) {
  return runCommand({
    argv: ['/usr/bin/git', ...args],
    cwd: repoRoot,
    env: { ...FIXED_GIT_ENV },
    timeoutMs: 5000,
    outputLimitBytes: OUTPUT_LIMIT,
  });
}

function text(result) {
  return Buffer.from(result?.stdout ?? '').toString('utf8').trim();
}

async function defaultRunCommand({ argv, cwd, env, timeoutMs, outputLimitBytes }) {
  try {
    const result = await execFileAsync(argv[0], argv.slice(1), {
      cwd,
      env,
      timeout: timeoutMs,
      maxBuffer: outputLimitBytes,
      shell: false,
    });
    return { exitCode: 0, stdout: Buffer.from(result.stdout), stderr: Buffer.from(result.stderr) };
  } catch (error) {
    return {
      exitCode: Number.isInteger(error?.code) ? error.code : 1,
      stdout: Buffer.from(error?.stdout ?? ''),
      stderr: Buffer.from(error?.stderr ?? ''),
    };
  }
}

export async function observeRepositoryIdentity({ repoRoot, runCommand = defaultRunCommand } = {}) {
  const head = await runGit(runCommand, repoRoot, ['rev-parse', 'HEAD']);
  const commitSha = text(head);
  if (head?.exitCode !== 0 || !SHA_PATTERN.test(commitSha)) {
    return { source: null, clean: false, statusText: '', observation: { state: 'UNKNOWN' } };
  }

  const tree = await runGit(runCommand, repoRoot, ['rev-parse', 'HEAD^{tree}']);
  const treeSha = text(tree);
  if (tree?.exitCode !== 0 || !SHA_PATTERN.test(treeSha)) {
    return { commitSha, source: { commitSha }, clean: false, statusText: '', observation: { state: 'UNKNOWN' } };
  }

  const status = await runGit(runCommand, repoRoot, ['status', '--porcelain=v1', '--untracked-files=normal']);
  if (status?.exitCode !== 0) {
    return { commitSha, treeSha, source: { commitSha, treeSha }, clean: false, statusText: '', observation: { state: 'UNKNOWN' } };
  }
  const statusText = Buffer.from(status.stdout ?? '').toString('utf8');
  return {
    commitSha,
    treeSha,
    source: { commitSha, treeSha },
    clean: statusText.length === 0,
    statusText,
    observation: {
      id: 'HOST-GIT-READONLY',
      state: statusText.length === 0 ? 'SUPPORTED' : 'DIRTY',
      config: 'FIXED_NO_SYSTEM_GLOBAL_CONFIG_NO_HOOKS_NO_FSMONITOR',
    },
  };
}
