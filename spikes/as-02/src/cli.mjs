#!/usr/bin/env node

import { isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

import { as02Error } from './errors.mjs';

const RUN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const USAGE = `Usage:
  npm run as02 -- preflight
  npm run as02 -- run
  npm run as02 -- restart-prepare
  npm run as02 -- restart-resume --checkpoint <absolute-path>
  npm run as02 -- report --run <run-id>
  npm run as02 -- cleanup --run <run-id>`;

function usage(message) {
  throw as02Error('CLI_USAGE', `${message}\n\n${USAGE}`);
}

function exactFlag(argv, command, flag) {
  if (argv.length !== 3 || argv[0] !== command || argv[1] !== flag || typeof argv[2] !== 'string' || argv[2].length === 0) {
    usage(`${command} requires exactly ${flag} <value>.`);
  }
  return argv[2];
}

export function parseCli(argv) {
  if (!Array.isArray(argv) || argv.length === 0 || !argv.every((entry) => typeof entry === 'string')) {
    usage('An AS-02 command is required.');
  }
  const [command] = argv;
  if (command === 'preflight' || command === 'run' || command === 'restart-prepare') {
    if (argv.length !== 1) usage(`${command} accepts no flags.`);
    return { command };
  }
  if (command === 'restart-resume') {
    const checkpoint = exactFlag(argv, command, '--checkpoint');
    if (!isAbsolute(checkpoint) || /[\r\n]/u.test(checkpoint)) usage('restart-resume checkpoint must be one absolute path.');
    return { command, checkpoint };
  }
  if (command === 'report' || command === 'cleanup') {
    const runId = exactFlag(argv, command, '--run');
    if (!RUN_ID_PATTERN.test(runId)) usage(`${command} run ID must use lowercase letters, numbers and single hyphens.`);
    return { command, runId };
  }
  usage(`Unknown AS-02 command: ${command}.`);
}

function handlerName(command) {
  return {
    preflight: 'preflight',
    run: 'run',
    'restart-prepare': 'restartPrepare',
    'restart-resume': 'restartResume',
    report: 'report',
    cleanup: 'cleanup',
  }[command];
}

function handlerInput(parsed) {
  if (parsed.command === 'restart-resume') return { checkpoint: parsed.checkpoint };
  if (parsed.command === 'report' || parsed.command === 'cleanup') return { runId: parsed.runId };
  return {};
}

export async function runCli(argv, dependencies) {
  const writeStdout = dependencies?.writeStdout ?? ((value) => process.stdout.write(`${value}\n`));
  const writeStderr = dependencies?.writeStderr ?? ((value) => process.stderr.write(`${value}\n`));
  let parsed;
  try {
    parsed = parseCli(argv);
  } catch (error) {
    if (error?.code === 'CLI_USAGE') {
      writeStderr(error.message);
      return 2;
    }
    throw error;
  }

  try {
    const name = handlerName(parsed.command);
    const handler = dependencies?.handlers?.[name];
    if (typeof handler !== 'function') {
      throw as02Error('CLI_HANDLER_UNAVAILABLE', `AS-02 handler ${name} is unavailable.`);
    }
    const outcome = await handler(handlerInput(parsed));
    const exitCode = Number.isInteger(outcome?.exitCode) ? outcome.exitCode : 0;
    writeStdout(JSON.stringify(outcome?.value ?? null));
    return exitCode;
  } catch (error) {
    writeStderr(JSON.stringify({
      error: {
        code: typeof error?.code === 'string' ? error.code : 'AS02_COMMAND_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
    }));
    return 1;
  }
}

function oneLine(value, label) {
  if (typeof value !== 'string' || value.length === 0 || /[\r\n]/u.test(value)) {
    throw as02Error('RESTART_CHECKPOINT_INVALID', `${label} must be one non-empty line.`);
  }
  return value;
}

export function formatRestartInstructions({ distro, repositoryPath, checkpointPath }) {
  const safeDistro = oneLine(distro, 'WSL distro');
  const safeRepository = oneLine(repositoryPath, 'Repository path');
  const safeCheckpoint = oneLine(checkpointPath, 'Checkpoint path');
  if (!isAbsolute(safeRepository) || !isAbsolute(safeCheckpoint)) {
    throw as02Error('RESTART_CHECKPOINT_INVALID', 'Repository and checkpoint paths must be absolute.');
  }
  return [
    'From Windows PowerShell:',
    `wsl --terminate ${safeDistro}`,
    '',
    'Reopen Ubuntu and run:',
    `cd ${safeRepository}`,
    `npm run as02 -- restart-resume --checkpoint ${safeCheckpoint}`,
  ].join('\n');
}

async function main() {
  const { createProductionHandlers } = await import('./orchestrator.mjs');
  const exitCode = await runCli(process.argv.slice(2), {
    handlers: await createProductionHandlers(),
  });
  process.exitCode = exitCode;
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (entry === import.meta.url) main().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    error: {
      code: typeof error?.code === 'string' ? error.code : 'AS02_COMMAND_FAILED',
      message: error instanceof Error ? error.message : String(error),
    },
  })}\n`);
  process.exitCode = 1;
});
