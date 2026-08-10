import { createHash, randomBytes } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

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

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(canonicalize(value))).digest('hex')}`;
}

async function git(workspacePath, args, options = {}) {
  const { env: _ignoredEnv, ...safeOptions } = options;
  const result = await execFileAsync('/usr/bin/git', ['-C', workspacePath, ...args], {
    ...safeOptions,
    maxBuffer: 1024 * 1024,
    shell: false,
    env: { ...FIXED_GIT_ENV },
  });
  return result.stdout.trim();
}

async function expectedTreeFor(workspacePath, targetPath, targetContent, expectedPath) {
  await cp(workspacePath, expectedPath, { recursive: true });
  try {
    await writeFile(path.join(expectedPath, targetPath), targetContent, 'utf8');
    await git(expectedPath, ['add', '--', targetPath]);
    const baseTree = await git(expectedPath, ['rev-parse', 'HEAD^{tree}']);
    const targetBlob = await git(expectedPath, ['hash-object', '--', targetPath]);
    return {
      baseTree,
      targetBlob,
      treeSha: sha256({ baseTree, changedPaths: [targetPath], targetBlob }),
    };
  } finally {
    await rm(expectedPath, { recursive: true, force: true });
  }
}

export async function createS1Fixture({ parentDir = tmpdir() } = {}) {
  const root = await mkdtemp(path.join(parentDir, 'mnfs-arr-s1-fixture-'));
  const workspacePath = path.join(root, 'workspace');
  await mkdir(path.join(workspacePath, 'fixture'), { recursive: true });
  const nonce = randomBytes(16).toString('hex');
  const nonceRelativePath = 'fixture/nonce.txt';
  const targetRelativePath = 'result.txt';
  const nonceFilePath = path.join(workspacePath, nonceRelativePath);
  const targetFilePath = path.join(workspacePath, targetRelativePath);
  const targetContent = `RESULT=${nonce}\n`;

  try {
    await writeFile(nonceFilePath, `NONCE=${nonce}\n`, { mode: 0o600 });
    await writeFile(targetFilePath, 'RESULT=PENDING\n', { mode: 0o600 });
    await git(workspacePath, ['init', '-q']);
    await git(workspacePath, ['config', 'user.name', 'MNFS ARR-S1 Fixture']);
    await git(workspacePath, ['config', 'user.email', 'arr-s1-fixture@localhost']);
    await git(workspacePath, ['add', '--', nonceRelativePath, targetRelativePath]);
    await git(workspacePath, ['commit', '-qm', 'fixture baseline']);
    const expectedPath = path.join(root, 'expected');
    const tree = await expectedTreeFor(workspacePath, targetRelativePath, targetContent, expectedPath);
    const fixtureHash = sha256({ nonce, nonceRelativePath, targetRelativePath, targetContent, tree });
    const fixture = {
      fixtureId: `ARR-S1-FIXTURE-${nonce.slice(0, 12)}`,
      fixtureHash,
      gitEnvironment: { ...FIXED_GIT_ENV },
      rootPath: root,
      workspacePath,
      nonce,
      nonceRelativePath,
      nonceFilePath,
      targetRelativePath,
      targetFilePath,
      prompt: 'Use the read_nonce_file resource to read fixture/nonce.txt. Then use edit_result_file exactly once to replace the PENDING marker in result.txt with the nonce value. Do not infer the nonce from this prompt.',
      inventory: [
        { id: 'read_nonce_file', kind: 'resource', description: 'Read fixture/nonce.txt and return its nonce value.' },
        { id: 'edit_result_file', kind: 'tool', description: 'Replace the PENDING marker in result.txt with the observed nonce.' },
      ],
      checkpoints: [
        { id: 'CANCELLATION_BEFORE_FINALIZED', required: true },
        { id: 'PROCESS_DEATH_BEFORE_FINALIZED', required: true },
        { id: 'FRESH_RECOVERY', required: true },
      ],
      expectedTree: {
        changedPaths: [targetRelativePath],
        targetContent,
        ...tree,
      },
      async dispose() {
        await rm(root, { recursive: true, force: true });
      },
    };
    return freeze(fixture);
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}

export function createFixtureTools(fixture) {
  if (!fixture || typeof fixture !== 'object') throw new TypeError('fixture is required');
  const calls = [];
  const readNonce = async (input = {}) => {
    if (input.path !== undefined && input.path !== fixture.nonceRelativePath) throw new Error('fixture nonce resource path is invalid');
    const value = (await readFile(fixture.nonceFilePath, 'utf8')).trim().slice('NONCE='.length);
    calls.push({ id: 'read_nonce_file', path: fixture.nonceRelativePath, value });
    return { content: [{ type: 'text', text: value }] };
  };
  const editResult = async (input = {}) => {
    if (input.path !== undefined && input.path !== fixture.targetRelativePath) throw new Error('fixture result tool path is invalid');
    const nonce = input.nonce ?? calls.findLast((call) => call.id === 'read_nonce_file')?.value;
    if (nonce !== fixture.nonce) throw new Error('fixture result edit requires the observed nonce');
    await writeFile(fixture.targetFilePath, `RESULT=${nonce}\n`);
    calls.push({ id: 'edit_result_file', path: fixture.targetRelativePath });
    return { content: [{ type: 'text', text: 'edited' }] };
  };
  const customTools = Object.freeze([
    Object.freeze({
      name: 'read_nonce_file',
      label: 'Read fixture nonce',
      description: 'Read the nonce from the fixed fixture resource.',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: [] },
      execute: async (_toolCallId, input) => readNonce(input),
    }),
    Object.freeze({
      name: 'edit_result_file',
      label: 'Edit fixture result',
      description: 'Replace the pending fixture result with the observed nonce.',
      parameters: { type: 'object', properties: { path: { type: 'string' }, nonce: { type: 'string' } }, required: [] },
      execute: async (_toolCallId, input) => editResult(input),
    }),
  ]);
  return Object.freeze({
    calls,
    customTools,
    async read_nonce_file(input) { return readNonce(input); },
    async edit_result_file(input) { return editResult(input); },
    snapshot() { return calls.map((call) => ({ ...call })); },
  });
}

export async function verifyFixtureResult(fixture, { toolCalls = [], fixtureTools = null } = {}) {
  const observedCalls = fixtureTools?.snapshot?.() ?? toolCalls;
  const errors = [];
  const readCalls = observedCalls.filter((call) => call?.id === 'read_nonce_file' && call.path === fixture.nonceRelativePath);
  if (readCalls.length !== 1 || readCalls[0].value !== fixture.nonce) {
    errors.push('a real nonce read_nonce_file observation is required');
  }
  const editCalls = observedCalls.filter((call) => call?.id === 'edit_result_file' && call.path === fixture.targetRelativePath);
  if (editCalls.length !== 1) errors.push('exactly one deterministic edit_result_file operation is required');

  let changedPaths = [];
  let treeSha = null;
  try {
    const targetContent = await readFile(fixture.targetFilePath, 'utf8');
    if (targetContent !== fixture.expectedTree.targetContent) errors.push('target content does not match expected deterministic edit');
    const changed = await git(fixture.workspacePath, ['diff', '--name-only']);
    changedPaths = changed ? changed.split('\n').filter(Boolean) : [];
    if (JSON.stringify(changedPaths) !== JSON.stringify(fixture.expectedTree.changedPaths)) errors.push('Git changed paths do not match expected result tree');
    const untracked = await git(fixture.workspacePath, ['ls-files', '--others', '--exclude-standard']);
    if (untracked) errors.push('fixture contains unexpected untracked files');
    await git(fixture.workspacePath, ['diff', '--check']);
    const baseTree = await git(fixture.workspacePath, ['rev-parse', 'HEAD^{tree}']);
    const targetBlob = await git(fixture.workspacePath, ['hash-object', '--', fixture.targetRelativePath]);
    treeSha = sha256({ baseTree, changedPaths, targetBlob });
    if (treeSha !== fixture.expectedTree.treeSha) errors.push('Git result tree hash does not match expected result tree');
  } catch (error) {
    errors.push(`fixture result verification failed (${error?.message ?? error})`);
  }
  return { ok: errors.length === 0, errors, changedPaths, treeSha };
}
