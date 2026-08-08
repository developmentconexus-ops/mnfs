import { readFile as fsReadFile } from 'node:fs/promises';
import { runProbeCommand } from '../process.mjs';

const FIXED_ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
const LIMIT = 64 * 1024;

export async function observeCgroupV2({ readFile = fsReadFile, runCommand = runProbeCommand } = {}) {
  let controllers;
  try {
    controllers = Buffer.from(await readFile('/sys/fs/cgroup/cgroup.controllers'));
    if (controllers.length > LIMIT) {
      return {
        id: 'HOST-CGROUP-V2',
        state: 'UNKNOWN',
        rationale: `cgroup.controllers exceeds ${LIMIT} bytes`,
        artifactRefs: [],
      };
    }
  } catch (error) {
    return {
      id: 'HOST-CGROUP-V2',
      state: error?.code === 'ENOENT' ? 'ABSENT' : 'UNKNOWN',
      rationale: error?.code === 'ENOENT'
        ? '/sys/fs/cgroup/cgroup.controllers is absent'
        : `cgroup.controllers could not be read (${error?.code ?? 'unknown'})`,
      artifactRefs: [],
    };
  }

  const result = await runCommand({
    argv: ['/usr/bin/stat', '-f', '-c', '%T', '/sys/fs/cgroup'],
    cwd: '/',
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: 16 * 1024,
  });
  if (result.exitCode !== 0) {
    return {
      id: 'HOST-CGROUP-V2',
      state: 'UNKNOWN',
      rationale: `cgroup filesystem type observation failed (exit ${result.exitCode})`,
      artifactRefs: [],
    };
  }
  const fsType = result.stdout.toString('utf8').trim();
  return {
    id: 'HOST-CGROUP-V2',
    state: fsType === 'cgroup2fs' ? 'SUPPORTED' : 'UNSUPPORTED',
    rationale: fsType === 'cgroup2fs'
      ? 'cgroup.controllers is readable on cgroup2fs'
      : `cgroup.controllers is readable but filesystem type is ${fsType || 'unknown'}`,
    artifactRefs: [],
  };
}
