import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  EXECUTION_AUTHORIZATION_ENV,
  parseExecutionAuthorizationToken,
} from './execution-authority.mjs';
import { preflightS1, resolveS1StateRootPath } from './preflight.mjs';
import { orchestrateS1 } from './run.mjs';
import { sha256Bytes, verifyArtifactRecords, writeJsonArtifact } from './artifacts.mjs';

const RUN_ID_PATTERN = /^arr-s1-[A-Za-z0-9][A-Za-z0-9._-]*$/u;
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

export function deriveS1RunRoot(stateRoot, runId) {
  if (typeof stateRoot !== 'string' || !path.posix.isAbsolute(stateRoot)) throw new TypeError('ARR-S1 state root must be an absolute path');
  const normalized = path.posix.normalize(stateRoot);
  if (normalized === '/' || normalized === '/mnt' || normalized.startsWith('/mnt/')) throw new TypeError('ARR-S1 state root must be Linux-owned and outside /mnt');
  const runRoot = path.posix.join(normalized, 'spikes', 'arr-s1', runId);
  if (!runRoot.startsWith(`${normalized}/`)) throw new TypeError('ARR-S1 run root escaped state root');
  return runRoot;
}

function runKey(runId, sourceTreeHash, fixtureHash) {
  return sha256Bytes(Buffer.from(JSON.stringify({ runId, sourceTreeHash, fixtureHash })));
}

function runBinding(result, runId) {
  const authorization = result?.preflight?.executionAuthorization;
  const sourceTreeHash = result?.preflight?.source?.treeSha;
  const fixtureHash = result?.fixture?.fixtureHash ?? result?.candidates?.find((candidate) => candidate?.fixtureHash)?.fixtureHash;
  if (!authorization || !/^sha256:[a-f0-9]{64}$/u.test(authorization.contractSha256 ?? '')
    || !/^[a-f0-9]{40}$/u.test(sourceTreeHash ?? '') || !/^sha256:[a-f0-9]{64}$/u.test(fixtureHash ?? '')) return null;
  return {
    runId,
    candidateShape: 'S1-RUN',
    runKey: runKey(runId, sourceTreeHash, fixtureHash),
    contractHash: authorization.contractSha256,
    fixtureHash,
  };
}

async function persistRun(result, stateRoot) {
  const report = result?.report ?? result;
  const runId = requireRunId(result?.runId);
  const root = deriveS1RunRoot(stateRoot ?? result?.preflight?.stateRoot?.path, runId);
  const binding = runBinding(result, runId);
  if (!binding) throw new Error('ARR-S1 durable report requires verified source, fixture and contract bindings');
  const reportMeta = await writeJsonArtifact(root, 'report.json', report, { binding, kind: 'report' });
  const candidateRecords = result?.candidates?.flatMap((candidate) => Array.isArray(candidate?.artifactRecords) ? candidate.artifactRecords : []) ?? [];
  const records = [...candidateRecords, reportMeta];
  const manifestValue = { schemaVersion: 1, runId, records };
  const manifestMeta = await writeJsonArtifact(root, 'manifest.json', manifestValue, { binding, kind: 'manifest' });
  const manifestIntegrity = await verifyArtifactRecords(root, [manifestMeta, ...records]);
  if (!manifestIntegrity.ok) throw new Error(`ARR-S1 durable artifact verification failed: ${manifestIntegrity.errors.join('; ')}`);
  const indexValue = { schemaVersion: 1, runId, report: reportMeta, manifest: manifestMeta };
  const indexMeta = await writeJsonArtifact(root, 'state/index.json', indexValue, { binding, kind: 'state' });
  await writeJsonArtifact(root, 'state/finalized.json', {
    schemaVersion: 1,
    runId,
    index: indexMeta,
    indexSha256: indexMeta.sha256,
    reportSha256: reportMeta.sha256,
    manifestSha256: manifestMeta.sha256,
  }, { binding, kind: 'state' });
  return report;
}

export async function loadRun(runId, stateRoot) {
  const root = deriveS1RunRoot(stateRoot, requireRunId(runId));
  const finalizedPath = path.join(root, 'state', 'finalized.json');
  const finalized = JSON.parse(await readFile(finalizedPath, 'utf8'));
  const indexRecord = finalized.index;
  if (finalized.runId !== runId
    || finalized.indexSha256 !== indexRecord?.sha256
    || indexRecord?.path !== 'state/index.json'
    || indexRecord?.binding?.runId !== runId) throw new Error('ARR-S1 finalized state binding is invalid');
  const indexIntegrity = await verifyArtifactRecords(root, [indexRecord], indexRecord.binding);
  if (!indexIntegrity.ok) throw new Error(`ARR-S1 index integrity failed: ${indexIntegrity.errors.join('; ')}`);
  const index = JSON.parse(await readFile(path.join(root, indexRecord.path), 'utf8'));
  const reportRecord = index.report;
  const manifestRecord = index.manifest;
  if (index.runId !== runId
    || reportRecord?.path !== 'report.json'
    || manifestRecord?.path !== 'manifest.json'
    || reportRecord?.binding?.runId !== runId
    || manifestRecord?.binding?.runId !== runId
    || reportRecord?.sha256 !== finalized.reportSha256
    || manifestRecord?.sha256 !== finalized.manifestSha256) throw new Error('ARR-S1 index hash binding is invalid');
  const reportIntegrity = await verifyArtifactRecords(root, [reportRecord], reportRecord.binding);
  if (!reportIntegrity.ok) throw new Error(`ARR-S1 report integrity failed: ${reportIntegrity.errors.join('; ')}`);
  const manifestIntegrity = await verifyArtifactRecords(root, [manifestRecord], manifestRecord.binding);
  if (!manifestIntegrity.ok) throw new Error(`ARR-S1 manifest integrity failed: ${manifestIntegrity.errors.join('; ')}`);
  const manifest = JSON.parse(await readFile(path.join(root, manifestRecord.path), 'utf8'));
  if (manifest.runId !== runId || !Array.isArray(manifest.records)) throw new Error('ARR-S1 manifest binding is invalid');
  if (manifest.records.some((record) => record?.binding?.runId !== runId)) throw new Error('ARR-S1 manifest contains an artifact from another run');
  const recordIntegrity = await verifyArtifactRecords(root, manifest.records);
  if (!recordIntegrity.ok) throw new Error(`ARR-S1 report Evidence integrity failed: ${recordIntegrity.errors.join('; ')}`);
  const manifestReport = manifest.records.find((record) => record.id === reportRecord.id);
  if (!manifestReport || manifestReport.path !== reportRecord.path || manifestReport.sha256 !== reportRecord.sha256) throw new Error('ARR-S1 report artifact is not bound by the manifest');
  const report = JSON.parse(await readFile(path.join(root, reportRecord.path), 'utf8'));
  return { ...report, integrity: { ok: true, errors: [] } };
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
  const stateRoot = options.stateRoot ?? resolveS1StateRootPath({ env: options.env ?? process.env });
  const preflightInput = {
    ...defaultPreflightInput(options),
    ...(options.repoRoot ? { repoRoot: options.repoRoot } : {}),
    ...(stateRoot ? { stateRootPath: stateRoot } : {}),
  };

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
      const report = await persistRun(result, stateRoot);
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
  return result?.status === 'REJECT' ? 3 : result?.status === 'SUCCESS' ? 0 : 2;
}

export const main = executeCli;

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    process.exitCode = await executeCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${String(error?.message ?? error)}\n`);
    process.exitCode = 1;
  }
}
