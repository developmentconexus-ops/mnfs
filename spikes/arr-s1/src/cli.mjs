import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  EXECUTION_AUTHORIZATION_ENV,
  parseExecutionAuthorizationToken,
} from './execution-authority.mjs';
import { preflightS1 } from './preflight.mjs';
import { orchestrateS1 } from './run.mjs';

const RUN_ID_PATTERN = /^arr-s1-[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const MEMORY_RUNS = new Map();

function invalid(message) {
  throw new TypeError(`invalid ARR-S1 CLI: ${message}`);
}

export function requireRunId(value) {
  if (typeof value !== 'string' || !RUN_ID_PATTERN.test(value) || value.includes('..')) {
    throw new TypeError('invalid ARR-S1 run id');
  }
  return value;
}

export function parseCliArgs(argv) {
  if (!Array.isArray(argv) || argv.length === 0) invalid('missing command');
  const [command, ...tokens] = argv;
  if (!['preflight', 'run', 'report'].includes(command)) invalid(`unknown command ${command}`);

  let json = false;
  let runId = null;
  const seen = new Set();
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith('--')) invalid(`unexpected positional argument ${token}`);
    if (!['--json', '--run-id'].includes(token)) invalid(`unknown flag ${token}`);
    if (seen.has(token)) invalid(`duplicate flag ${token}`);
    seen.add(token);
    if (token === '--json') {
      json = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith('--')) invalid('missing value for --run-id');
    try {
      runId = requireRunId(value);
    } catch (error) {
      invalid(error.message);
    }
    index += 1;
  }

  if (!json) invalid('--json is required');
  if (command === 'report' && !runId) invalid('report requires --run-id');
  if (command !== 'report' && runId) invalid(`${command} does not accept --run-id`);
  return { command, ...(runId ? { runId } : {}), json: true };
}

function writeJson(stdout, value) {
  stdout.write(`${JSON.stringify(value)}\n`);
}

function stateReportPath(stateRoot, runId) {
  if (typeof stateRoot !== 'string' || !path.posix.isAbsolute(stateRoot)) return null;
  return path.join(stateRoot, 'spikes', 'arr-s1', runId, 'report.json');
}

async function saveRun(result, stateRoot) {
  const report = result?.report ?? result;
  if (result?.runId) MEMORY_RUNS.set(result.runId, structuredClone(report));
  const target = stateReportPath(stateRoot, result?.runId);
  if (target) {
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await writeFile(target, `${JSON.stringify(report)}\n`, { mode: 0o600, flag: 'wx' }).catch(async (error) => {
      if (error?.code !== 'EEXIST') throw error;
      const existing = await readFile(target, 'utf8');
      if (existing !== `${JSON.stringify(report)}\n`) throw new Error('ARR-S1 report publication is immutable');
    });
  }
  return report;
}

async function loadRun(runId, stateRoot) {
  if (MEMORY_RUNS.has(runId)) return structuredClone(MEMORY_RUNS.get(runId));
  const target = stateReportPath(stateRoot, runId);
  if (!target) throw new Error(`ARR-S1 run not found: ${runId}`);
  return JSON.parse(await readFile(target, 'utf8'));
}

function defaultPreflightInput(options) {
  const env = options.env ?? process.env;
  const token = env?.[EXECUTION_AUTHORIZATION_ENV];
  const input = options.preflightInput ? structuredClone(options.preflightInput) : {};
  if (!Object.hasOwn(input, 'executionAuthorization') && token !== undefined) {
    input.executionAuthorization = parseExecutionAuthorizationToken(token);
  }
  return input;
}

export async function executeCli(argv, options = {}) {
  const parsed = parseCliArgs(argv);
  const stdout = options.stdout ?? process.stdout;
  const stateRoot = options.stateRoot;
  const preflightInput = defaultPreflightInput(options);

  if (parsed.command === 'preflight') {
    const preflight = options.preflight ?? preflightS1;
    const result = await preflight(preflightInput);
    writeJson(stdout, result);
    return result?.status === 'READY' || result?.ok === true ? 0 : 2;
  }

  if (parsed.command === 'run') {
    const runId = options.runId ?? `arr-s1-${Date.now().toString(36)}`;
    requireRunId(runId);
    try {
      const run = options.run ?? orchestrateS1;
      const result = await run({
        ...(options.runInput ?? {}),
        runId,
        preflightInput,
      });
      const report = await saveRun(result, stateRoot);
      writeJson(stdout, report);
      return report?.status === 'REJECT' ? 3 : report?.status === 'SUCCESS' ? 0 : 2;
    } catch (error) {
      const failure = {
        status: 'BLOCKED',
        complete: false,
        runId,
        error: String(error?.message ?? error),
        nextAction: `report --run-id ${runId} --json`,
      };
      writeJson(stdout, failure);
      return 1;
    }
  }

  const result = options.report
    ? await options.report({ runId: parsed.runId, stateRoot })
    : await loadRun(parsed.runId, stateRoot);
  writeJson(stdout, result);
  return result?.status === 'REJECT' ? 3 : 0;
}

export const main = executeCli;
