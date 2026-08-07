import { pathToFileURL } from 'node:url';

import { canonicalJson } from './canonical-json.mjs';
import { parseTc01Args } from './cli-core.mjs';
import { cleanupTc01, reportTc01, runTc01 } from './orchestrator.mjs';

export { parseTc01Args } from './cli-core.mjs';

const USAGE = `Usage:
  npm run tc01 -- run [--run-id <id>] [--state-root <absolute-linux-path>] [--json]
  npm run tc01 -- report --run-root <absolute-linux-path> [--json]
  npm run tc01 -- cleanup --run-root <absolute-linux-path> [--json]
`;

const SAFE_DETAIL_FIELDS = Object.freeze([
  'actual',
  'blockers',
  'expected',
  'identityChangedFields',
  'missingCapabilities',
  'runRoot',
]);

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function safeErrorDetails(error) {
  if (!isPlainObject(error?.details)) return null;
  const details = {};
  for (const field of SAFE_DETAIL_FIELDS) {
    const value = error.details[field];
    if (typeof value === 'string') details[field] = value;
    else if (Array.isArray(value) && value.every((item) => typeof item === 'string')) details[field] = [...value];
  }
  return Object.keys(details).length === 0 ? null : details;
}

function humanSummary(summary) {
  const lines = [`TC-01 ${summary.command} completed.`];
  if (summary.verdict) lines.push(`Verdict: ${summary.verdict}`);
  if (summary.runId) lines.push(`Run ID: ${summary.runId}`);
  if (summary.runRoot) lines.push(`Run root: ${summary.runRoot}`);
  if (summary.reportPath) lines.push(`Report: ${summary.reportPath}`);
  if (summary.verdictPath) lines.push(`Machine Verdict: ${summary.verdictPath}`);
  if (summary.cleanup?.state) lines.push(`Cleanup: ${summary.cleanup.state}`);
  lines.push(`Next action: ${summary.nextAction}`);
  return `${lines.join('\n')}\n`;
}

function operationalError(error) {
  const details = safeErrorDetails(error);
  return {
    ok: false,
    error: {
      code: typeof error?.code === 'string' ? error.code : 'TC01_COMMAND_FAILED',
      message: error instanceof Error ? error.message : String(error),
      ...(details === null ? {} : { details }),
    },
  };
}

export async function runTc01Cli({
  argv = process.argv.slice(2),
  stdout = process.stdout,
  stderr = process.stderr,
  services = {
    run: runTc01,
    report: reportTc01,
    cleanup: cleanupTc01,
  },
} = {}) {
  let parsed;
  try {
    parsed = parseTc01Args(argv);
  } catch (error) {
    stderr.write(`TC-01 usage error: ${error instanceof Error ? error.message : String(error)}\n${USAGE}`);
    return 2;
  }

  try {
    const summary = parsed.command === 'run'
      ? await services.run({ runId: parsed.runId, stateRoot: parsed.stateRoot })
      : parsed.command === 'report'
        ? await services.report({ runRoot: parsed.runRoot })
        : await services.cleanup({ runRoot: parsed.runRoot });
    stdout.write(parsed.json ? `${canonicalJson(summary)}\n` : humanSummary(summary));
    return 0;
  } catch (error) {
    if (parsed.json) stdout.write(`${canonicalJson(operationalError(error))}\n`);
    else stderr.write(`TC-01 ${parsed.command} failed: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (executedDirectly) process.exitCode = await runTc01Cli();
