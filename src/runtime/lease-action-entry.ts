import { LinuxProcessIdentityInspector } from '../adapters/process-identity.js';
import { MnfsError } from '../domain/errors.js';
import { LeaseActionRunner } from './lease-action-runner.js';
import { runProcess } from './process-runner.js';

interface LeaseActionArguments {
  readonly actionRoot: string;
  readonly operationPath: string;
  readonly actionToken: string;
  readonly operationSha256: string;
}

function argumentError(message: string): MnfsError {
  return new MnfsError('INVALID_ARGUMENTS', message, { exitCode: 2 });
}

function parseArguments(argv: readonly string[]): LeaseActionArguments {
  const accepted = new Set([
    '--action-root',
    '--operation',
    '--action-token',
    '--operation-sha256',
  ]);
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === undefined || !accepted.has(flag)) {
      throw argumentError(`Unknown Lease action argument: ${String(flag)}.`);
    }
    if (value === undefined || value.length === 0 || value.startsWith('--')) {
      throw argumentError(`Lease action argument ${flag} requires one value.`);
    }
    if (values.has(flag)) {
      throw argumentError(`Lease action argument ${flag} was provided more than once.`);
    }
    values.set(flag, value);
  }
  if (argv.length !== accepted.size * 2) {
    throw argumentError('Lease action helper requires exactly four named arguments.');
  }
  const actionRoot = values.get('--action-root');
  const operationPath = values.get('--operation');
  const actionToken = values.get('--action-token');
  const operationSha256 = values.get('--operation-sha256');
  if (
    actionRoot === undefined
    || operationPath === undefined
    || actionToken === undefined
    || operationSha256 === undefined
  ) {
    throw argumentError('Lease action helper arguments are incomplete.');
  }
  return { actionRoot, operationPath, actionToken, operationSha256 };
}

export async function runLeaseActionEntry(
  argv: readonly string[] = process.argv.slice(2),
): Promise<number> {
  const input = parseArguments(argv);
  const identity = new LinuxProcessIdentityInspector();
  const runner = new LeaseActionRunner({
    runProcess,
    observeProcessIdentity: async (pid) => await identity.observe(pid),
    now: () => new Date().toISOString(),
  });
  await runner.run({
    actionRoot: input.actionRoot,
    operationPath: input.operationPath,
    expectedActionToken: input.actionToken,
    expectedOperationSha256: input.operationSha256,
  });
  return 0;
}

async function main(): Promise<void> {
  try {
    process.exitCode = await runLeaseActionEntry();
  } catch (error) {
    if (error instanceof MnfsError) {
      process.stderr.write(`${error.code}: ${error.message}\n`);
      process.exitCode = error.exitCode;
      return;
    }
    process.stderr.write(`INTERNAL_ERROR: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

await main();
