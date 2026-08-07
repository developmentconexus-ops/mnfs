import { pathToFileURL } from 'node:url';

import { canonicalJson } from './canonical-json.mjs';
import { assertTc01 } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath, validateRunId } from './paths.mjs';
import { cleanupTc01, reportTc01, runTc01 } from './orchestrator.mjs';

const USAGE = `Usage:
  npm run tc01 -- run [--run-id <id>] [--state-root <absolute-linux-path>] [--json]
  npm run tc01 -- report --run-root <absolute-linux-path> [--json]
  npm run tc01 -- cleanup --run-root <absolute-linux-path> [--json]
`;

function requireArgv(argv) {
  assertTc01(Array.isArray(argv) && argv.every((value) => typeof value === 'string'), 'TC01_INVALID_INPUT', 'TC-01 argv must be a string array.');
  assertTc01(argv.length > 0, 'TC01_INVALID_INPUT', 'A TC-01 command is required.');
  return argv;
}

function parseFlags(argv, allowed) {
  const values = {};
  const seen = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    assertTc01(token.startsWith('--'), 'TC01_INVALID_INPUT', 'Unexpected positional TC-01 argument.', { token });
    assertTc01(Object.hasOwn(allowed, token), 'TC01_INVALID_INPUT', 'Unknown TC-01 flag.', { token });
    assertTc01(!seen.has(token), 'TC01_INVALID_INPUT', 'Duplicate TC-01 flag.', { token });
    seen.add(token);
    if (allowed[token] === 'boolean') {
      values[token] = true;
      continue;
    }
    const value = argv[index + 1];
    assertTc01(typeof value === 'string' && value.length > 0 && !value.startsWith('--'), 'TC01_INVALID_INPUT', 'TC-01 flag value is missing.', { token });
    values[token] = value;
    index += 1;
  }
  return values;
}

export function parseTc01Args(rawArgv) {
  const argv = requireArgv(rawArgv);
  const [command, ...rest] = argv;
  assertTc01(['run', 'report', 'cleanup'].includes(command), 'TC01_INVALID_INPUT', 'Unknown TC-01 command.', { command });

  if (command === 'run') {
    const flags = parseFlags(rest, {
      '--run-id': 'value',
      '--state-root': 'value',
      '--json': 'boolean',
    });
    return {
      command,
      json: flags['--json'] === true,
      runId: flags['--run-id'] === undefined ? null : validateRunId(flags['--run-id']),
      stateRoot: flags['--state-root'] === undefined
        ? null
        : assertLinuxOwnedAbsolutePath(flags['--state-root'], 'TC-01 state root'),
    };
  }

  const flags = parseFlags(rest, {
    '--run-root': 'value',
    '--json': 'boolean',
  });
  assertTc01(typeof flags['--run-root'] === 'string', 'TC01_INVALID_INPUT', `${command} requires --run-root.`);
  return {
    command,
    json: flags['--json'] === true,
    runRoot: assertLinuxOwnedAbsolutePath(flags['--run-root'], 'TC-01 run root'),
  };
}

function humanSummary(summary) {
  const lines = [
    `TC-01 ${summary.command} completed.`,
  ];
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
  return {
    ok: false,
    error: {
      code: typeof error?.code === 'string' ? error.code : 'TC01_COMMAND_FAILED',
      message: error instanceof Error ? error.message : String(error),
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
