import { lstat as fsLstat } from 'node:fs/promises';
import { runProbeCommand } from '../process.mjs';

const FIXED_ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
const FIXED_DIRS = Object.freeze(['/usr/bin', '/bin']);

async function resolveExecutable(name, lstat) {
  for (const dir of FIXED_DIRS) {
    const candidate = `${dir}/${name}`;
    try {
      const stats = await lstat(candidate);
      if (stats.isFile?.()) return candidate;
    } catch (error) {
      if (!['ENOENT', 'EACCES', 'EPERM'].includes(error?.code)) throw error;
    }
  }
  return null;
}

async function versionCommand(runCommand, argv) {
  return await runCommand({
    argv,
    cwd: '/',
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: 16 * 1024,
  });
}

export async function observeOptionalTools({ lstat = fsLstat, runCommand = runProbeCommand } = {}) {
  const docker = await resolveExecutable('docker', lstat);
  let dockerCli;
  let dockerDaemon;
  if (!docker) {
    dockerCli = {
      id: 'HOST-DOCKER-CLI',
      state: 'ABSENT',
      rationale: 'docker CLI was not found under /usr/bin or /bin',
      artifactRefs: [],
    };
    dockerDaemon = {
      id: 'HOST-DOCKER-DAEMON',
      state: 'UNKNOWN',
      rationale: 'docker CLI is absent, so an already-running daemon cannot be observed through the reviewed interface',
      artifactRefs: [],
    };
  } else {
    const cliResult = await versionCommand(runCommand, [docker, '--version']);
    dockerCli = {
      id: 'HOST-DOCKER-CLI',
      state: cliResult.exitCode === 0 ? 'PRESENT' : 'UNKNOWN',
      rationale: cliResult.exitCode === 0
        ? `docker CLI is present at ${docker}`
        : `docker CLI version observation failed (exit ${cliResult.exitCode})`,
      artifactRefs: [],
    };

    if (cliResult.exitCode !== 0) {
      dockerDaemon = {
        id: 'HOST-DOCKER-DAEMON',
        state: 'UNKNOWN',
        rationale: 'docker CLI itself could not be observed reliably',
        artifactRefs: [],
      };
    } else {
      const daemonResult = await versionCommand(runCommand, [docker, 'version', '--format', '{{json .Server.Version}}']);
      const stderr = daemonResult.stderr.toString('utf8');
      const unavailable = /cannot connect to the docker daemon|is the docker daemon running|error during connect/iu.test(stderr);
      dockerDaemon = {
        id: 'HOST-DOCKER-DAEMON',
        state: daemonResult.exitCode === 0 ? 'PRESENT' : unavailable ? 'ABSENT' : 'UNKNOWN',
        rationale: daemonResult.exitCode === 0
          ? 'an already-running Docker daemon answered the read-only version query'
          : unavailable
            ? 'Docker daemon is not reachable through the existing CLI context'
            : `Docker daemon version observation was inconclusive (exit ${daemonResult.exitCode})`,
        artifactRefs: [],
      };
    }
  }

  const bwrapPath = await resolveExecutable('bwrap', lstat);
  let bwrap;
  if (!bwrapPath) {
    bwrap = {
      id: 'HOST-BWRAP',
      state: 'ABSENT',
      rationale: 'bwrap was not found under /usr/bin or /bin',
      artifactRefs: [],
    };
  } else {
    const result = await versionCommand(runCommand, [bwrapPath, '--version']);
    bwrap = {
      id: 'HOST-BWRAP',
      state: result.exitCode === 0 ? 'PRESENT' : 'UNKNOWN',
      rationale: result.exitCode === 0
        ? `bwrap is present at ${bwrapPath}; no sandbox was launched`
        : `bwrap exists but version observation failed (exit ${result.exitCode})`,
      artifactRefs: [],
    };
  }

  return { dockerCli, dockerDaemon, bwrap };
}
