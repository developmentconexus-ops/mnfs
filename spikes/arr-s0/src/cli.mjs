import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { sha256Bytes } from './artifacts.mjs';
import { S0_PLAN_GIT_BLOB, S0_PLAN_VERSION } from './contract.mjs';
import {
  EXECUTION_AUTHORIZATION_ENV,
  parseExecutionAuthorizationToken,
} from './execution-authority.mjs';
import { requireRunId } from './paths.mjs';
import { observeRepositoryIdentity } from './probes/repository.mjs';
import { buildReportView } from './report.mjs';
import { generateRunId } from './run-id.mjs';
import { preflightS0, reportS0, runS0 } from './service.mjs';

function invalid(message) {
  throw new TypeError(`invalid ARR-S0 CLI: ${message}`);
}

export function parseCliArgs(argv) {
  if (!Array.isArray(argv) || argv.length === 0) invalid('missing command');
  const [command, ...tokens] = argv;
  if (!['preflight', 'run', 'report'].includes(command)) invalid(`unknown command ${command}`);

  let json = false;
  let runId;
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
    runId = requireRunId(value);
    index += 1;
  }

  if (!json) invalid('--json is required');
  if (command === 'report') {
    if (!runId) invalid('report requires --run-id');
    return { command, runId, json: true };
  }
  if (runId) invalid(`${command} does not accept --run-id`);
  return { command, json: true };
}

function parseFrontmatterScalar(text, key) {
  const frontmatter = String(text).match(/^---\n([\s\S]*?)\n---\n/u)?.[1];
  if (!frontmatter) return null;
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'mu'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/gu, '') ?? null;
}

function gitBlobSha1(bytes) {
  return createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
}

async function defaultSourceLoader(repoRoot) {
  return await observeRepositoryIdentity({ repoRoot });
}

export async function loadS0Identities(repoRoot = process.cwd(), options = {}) {
  const fileReader = options.readFile ?? readFile;
  const sourceLoader = options.sourceLoader ?? defaultSourceLoader;
  const planPath = path.join(repoRoot, 'docs/superpowers/plans/2026-08-07-arr-s0-host-capability-probe.md');
  const contractPath = path.join(repoRoot, 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md');
  const [planBytes, contractBytes] = await Promise.all([fileReader(planPath), fileReader(contractPath)]);
  if (gitBlobSha1(planBytes) !== S0_PLAN_GIT_BLOB) {
    throw new Error('ARR-S0 plan bytes do not match the GATE-P0 approved Git blob');
  }
  const planText = planBytes.toString('utf8');
  const contractText = contractBytes.toString('utf8');
  if (parseFrontmatterScalar(planText, 'version') !== S0_PLAN_VERSION) {
    throw new Error('ARR-S0 plan version does not match harness authority');
  }
  const contractStatus = parseFrontmatterScalar(contractText, 'status');
  const contractVersion = parseFrontmatterScalar(contractText, 'version');
  if (contractStatus !== 'accepted' || contractVersion !== '1.0.0') {
    throw new Error('ARR-S0 real run remains prohibited until contract 1.0.0 is explicitly accepted');
  }

  const repository = await sourceLoader(repoRoot);
  const source = repository?.source;
  if (!source?.commitSha) {
    throw new Error('ARR-S0 execution authorization cannot bind because current repository source commit is unavailable');
  }

  const env = options.env ?? process.env;
  const executionAuthorizationToken = Object.prototype.hasOwnProperty.call(options, 'executionAuthorizationToken')
    ? options.executionAuthorizationToken
    : env?.[EXECUTION_AUTHORIZATION_ENV];
  const contractHash = sha256Bytes(contractBytes);
  const executionAuthorization = parseExecutionAuthorizationToken(executionAuthorizationToken, {
    planGitBlob: S0_PLAN_GIT_BLOB,
    contractHash,
    baseCommitSha: source.commitSha,
  });

  return {
    plan: { version: S0_PLAN_VERSION, hash: sha256Bytes(planBytes) },
    contract: { version: contractVersion, hash: contractHash },
    executionAuthorization,
  };
}

function writeJson(stdout, value) {
  stdout.write(`${JSON.stringify(value)}\n`);
}

export async function executeCli(argv, options = {}) {
  const parsed = parseCliArgs(argv);
  const repoRoot = options.repoRoot ?? process.cwd();
  const stateRoot = options.stateRoot;
  const stdout = options.stdout ?? process.stdout;
  const preflight = options.preflight ?? preflightS0;
  const run = options.run ?? runS0;
  const report = options.report ?? reportS0;
  const identitiesLoader = options.identitiesLoader ?? loadS0Identities;
  const runIdGenerator = options.runIdGenerator ?? generateRunId;

  if (parsed.command === 'preflight') {
    const result = await preflight({ repoRoot, stateRoot });
    writeJson(stdout, result);
    return result.ok ? 0 : 2;
  }
  if (parsed.command === 'run') {
    const authorityOptions = { env: options.env };
    if (Object.prototype.hasOwnProperty.call(options, 'executionAuthorizationToken')) {
      authorityOptions.executionAuthorizationToken = options.executionAuthorizationToken;
    }
    const identities = await identitiesLoader(repoRoot, authorityOptions);
    const runId = runIdGenerator();
    const result = await run({ repoRoot, stateRoot, identities, runId });
    writeJson(stdout, buildReportView(result));
    return result.verdict.status === 'REJECT' ? 3 : result.verdict.status === 'BLOCKED' ? 2 : 0;
  }
  const result = await report({ runId: parsed.runId, stateRoot });
  writeJson(stdout, result.complete ? { ...buildReportView(result), integrity: result.integrity } : result);
  return result.complete && result.verdict?.status === 'REJECT' ? 3 : 0;
}
