import { runProbeCommand } from '../process.mjs';

const FIXED_ENV = Object.freeze({
  PATH: '/usr/bin:/bin',
  LANG: 'C',
  LC_ALL: 'C',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_COUNT: '2',
  GIT_CONFIG_KEY_0: 'core.fsmonitor',
  GIT_CONFIG_VALUE_0: 'false',
  GIT_CONFIG_KEY_1: 'core.hooksPath',
  GIT_CONFIG_VALUE_1: '/dev/null',
});
const OUTPUT_LIMIT = 64 * 1024;
const SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;

async function runGit(runCommand, repoRoot, args) {
  return await runCommand({
    argv: ['/usr/bin/git', ...args],
    cwd: repoRoot,
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: OUTPUT_LIMIT,
  });
}

function text(result) {
  return result.stdout.toString('utf8').trim();
}

export async function observeRepositoryIdentity({ repoRoot, runCommand = runProbeCommand } = {}) {
  const head = await runGit(runCommand, repoRoot, ['rev-parse', 'HEAD']);
  if (head.exitCode !== 0 || !SHA_PATTERN.test(text(head))) {
    return {
      source: null,
      clean: false,
      statusText: '',
      observation: {
        id: 'HOST-GIT-READONLY',
        state: 'UNKNOWN',
        rationale: 'could not establish repository HEAD with read-only Git',
        artifactRefs: [],
      },
    };
  }

  const tree = await runGit(runCommand, repoRoot, ['rev-parse', 'HEAD^{tree}']);
  if (tree.exitCode !== 0 || !SHA_PATTERN.test(text(tree))) {
    return {
      source: null,
      clean: false,
      statusText: '',
      observation: {
        id: 'HOST-GIT-READONLY',
        state: 'UNKNOWN',
        rationale: 'could not establish repository tree with read-only Git',
        artifactRefs: [],
      },
    };
  }

  const status = await runGit(runCommand, repoRoot, ['status', '--porcelain=v1', '--untracked-files=normal']);
  if (status.exitCode !== 0) {
    return {
      source: { commitSha: text(head), treeSha: text(tree) },
      clean: false,
      statusText: '',
      observation: {
        id: 'HOST-GIT-READONLY',
        state: 'UNKNOWN',
        rationale: 'could not read repository status with read-only Git',
        artifactRefs: [],
      },
    };
  }

  const statusText = status.stdout.toString('utf8');
  const clean = statusText.length === 0;
  return {
    source: { commitSha: text(head), treeSha: text(tree) },
    clean,
    statusText,
    observation: {
      id: 'HOST-GIT-READONLY',
      state: 'SUPPORTED',
      rationale: clean
        ? 'read-only Git established exact commit/tree and a clean checkout'
        : 'read-only Git established exact commit/tree but checkout is dirty',
      artifactRefs: [],
    },
  };
}
