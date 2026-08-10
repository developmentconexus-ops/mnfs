import { spawn } from 'node:child_process';
import { requirePiCredentialRoute } from './credential-routes.mjs';

const REQUIRED_ARGS = Object.freeze(['--mode', 'rpc']);
const CONTROL_ARGS = Object.freeze([
  '--tools', 'read,edit',
  '--no-extensions',
  '--no-skills',
  '--no-prompt-templates',
  '--no-themes',
  '--no-context-files',
]);

const CONFLICTING_ARGS = new Set([
  '--extensions', '--skills', '--prompt-templates', '--themes', '--context-files',
]);

function absolute(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.includes('\0');
}

export function revalidatePiRpcArgs(suppliedArgs = []) {
  if (!Array.isArray(suppliedArgs) || REQUIRED_ARGS.some((arg, index) => suppliedArgs[index] !== arg)) {
    throw new Error('MNFS trusted Pi-ACP wrapper only accepts the Pi-ACP public RPC mode arguments');
  }
  const toolsIndex = suppliedArgs.indexOf('--tools');
  if (toolsIndex >= 0 && suppliedArgs[toolsIndex + 1] !== 'read,edit') {
    throw new Error('MNFS trusted Pi-ACP wrapper requires the read,edit tool allowlist');
  }
  if (suppliedArgs.some((arg) => CONFLICTING_ARGS.has(arg))) {
    throw new Error('MNFS trusted Pi-ACP wrapper rejects conflicting discovery controls');
  }
  const args = [...suppliedArgs];
  for (const arg of CONTROL_ARGS) if (!args.includes(arg)) args.push(arg);
  return args;
}

export function main({ env = process.env, argv = process.argv.slice(2), spawnImpl = spawn } = {}) {
  const executable = env.MNFS_PI_ACP_EXECUTABLE;
  const suppliedArgs = argv;
  if (!absolute(executable)) throw new Error('MNFS trusted Pi-ACP wrapper requires an absolute revalidated Pi executable');
  const piCredentialDir = requirePiCredentialRoute(env.PI_CODING_AGENT_DIR);
  const args = revalidatePiRpcArgs(suppliedArgs);
  const childEnvironment = Object.fromEntries(Object.entries(env).filter(([key]) => [
    'PATH', 'LANG', 'LC_ALL', 'MNFS_PI_ACP_EXECUTABLE', 'PI_ACP_PI_COMMAND', 'PI_CODING_AGENT_DIR',
  ].includes(key)));
  childEnvironment.PI_CODING_AGENT_DIR = piCredentialDir;
  const child = spawnImpl(executable, args, { cwd: process.cwd(), env: childEnvironment, shell: false, stdio: 'inherit' });
  return new Promise((resolve, reject) => {
    child.once('error', (error) => {
      process.stderr.write(`${String(error?.stack ?? error)}\n`);
      process.exitCode = 1;
      reject(error);
    });
    child.once('exit', (code, signal) => {
      if (signal) process.kill(process.pid, signal);
      else process.exitCode = code ?? 1;
      resolve({ code, signal });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) main();
