import { constants } from 'node:fs';
import { lstat as fsLstat, open as fsOpen } from 'node:fs/promises';
import { runProbeCommand } from '../process.mjs';

const FIXED_ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });

async function resolveFusermount3(lstat) {
  for (const candidate of ['/usr/bin/fusermount3', '/bin/fusermount3']) {
    try {
      const stats = await lstat(candidate);
      if (stats.isFile?.()) return candidate;
    } catch (error) {
      if (!['ENOENT', 'EACCES', 'EPERM'].includes(error?.code)) throw error;
    }
  }
  return null;
}

export async function observeFuse({ lstat = fsLstat, open = fsOpen, runCommand = runProbeCommand } = {}) {
  let device;
  try {
    const stats = await lstat('/dev/fuse');
    if (!stats.isCharacterDevice()) {
      device = {
        id: 'HOST-FUSE-DEVICE',
        state: 'UNKNOWN',
        rationale: '/dev/fuse exists but is not a character device',
        artifactRefs: [],
      };
    } else {
      let handle;
      try {
        handle = await open('/dev/fuse', constants.O_RDWR);
        await handle.close();
        handle = null;
        device = {
          id: 'HOST-FUSE-DEVICE',
          state: 'SUPPORTED',
          rationale: '/dev/fuse is a character device and opened read/write without mounting',
          artifactRefs: [],
        };
      } catch (error) {
        if (handle) { try { await handle.close(); } catch {} }
        const code = error?.code ?? 'UNKNOWN';
        device = {
          id: 'HOST-FUSE-DEVICE',
          state: ['EACCES', 'EPERM'].includes(code) ? 'UNSUPPORTED' : 'UNKNOWN',
          rationale: `read/write open of /dev/fuse failed (${code})`,
          artifactRefs: [],
        };
      }
    }
  } catch (error) {
    device = {
      id: 'HOST-FUSE-DEVICE',
      state: error?.code === 'ENOENT' ? 'ABSENT' : 'UNKNOWN',
      rationale: error?.code === 'ENOENT' ? '/dev/fuse is absent' : `could not inspect /dev/fuse (${error?.code ?? 'unknown'})`,
      artifactRefs: [],
    };
  }

  const executable = await resolveFusermount3(lstat);
  let tools;
  if (!executable) {
    tools = {
      id: 'HOST-FUSE-TOOLS',
      state: 'ABSENT',
      rationale: 'fusermount3 was not found under /usr/bin or /bin',
      artifactRefs: [],
    };
  } else {
    const result = await runCommand({
      argv: [executable, '--version'],
      cwd: '/',
      env: { ...FIXED_ENV },
      timeoutMs: 5000,
      outputLimitBytes: 16 * 1024,
    });
    tools = {
      id: 'HOST-FUSE-TOOLS',
      state: result.exitCode === 0 ? 'PRESENT' : 'UNKNOWN',
      rationale: result.exitCode === 0
        ? `fusermount3 is present at ${executable}`
        : `fusermount3 exists but version observation failed (exit ${result.exitCode})`,
      artifactRefs: [],
    };
  }

  return { device, tools };
}
