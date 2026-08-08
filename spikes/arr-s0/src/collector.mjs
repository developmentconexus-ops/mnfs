import { constants } from 'node:fs';
import {
  access as fsAccess,
  lstat as fsLstat,
  open as fsOpen,
  readFile as fsReadFile,
} from 'node:fs/promises';
import path from 'node:path';
import { writeCanonicalJsonArtifact, writeRawArtifact } from './artifacts.mjs';
import { runProbeCommand } from './process.mjs';
import { observeHostIdentity } from './probes/host-identity.mjs';
import { observeRepositoryIdentity } from './probes/repository.mjs';
import { classifyCpuVirtualization, observeKvmDevice } from './probes/kvm.mjs';
import {
  configBackedSecurityObservations,
  discoverKernelConfig,
  observeUserNamespace,
} from './probes/kernel-security.mjs';
import { observeFuse } from './probes/fuse.mjs';
import { observeCgroupV2 } from './probes/cgroup.mjs';
import { observeOptionalTools } from './probes/tools.mjs';

function slug(value) {
  const normalized = String(value)
    .replace(/^\/+|\/+$/gu, '')
    .replace(/[^A-Za-z0-9._-]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .toLowerCase();
  return normalized.slice(0, 80) || 'observation';
}

export function createEvidenceCapture(runRoot, lowLevel = {}) {
  const runCommand = lowLevel.runCommand ?? runProbeCommand;
  const readFile = lowLevel.readFile ?? fsReadFile;
  const lstat = lowLevel.lstat ?? fsLstat;
  const open = lowLevel.open ?? fsOpen;
  const access = lowLevel.access ?? fsAccess;
  const records = [];
  const ids = new Set();
  let sequence = 0;

  const next = (kind) => `${kind}-${String(++sequence).padStart(4, '0')}`;
  const add = (id, meta) => {
    if (ids.has(id)) throw new Error(`duplicate captured artifact id ${id}`);
    ids.add(id);
    const record = { id, ...meta };
    records.push(record);
    return record;
  };

  const api = {
    records,
    checkpoint: () => records.length,
    refsSince: (index) => records.slice(index).map((record) => record.id),
    async bytes(id, relativePath, bytes) {
      return add(id, await writeRawArtifact(runRoot, relativePath, bytes));
    },
    async json(id, relativePath, value) {
      return add(id, await writeCanonicalJsonArtifact(runRoot, relativePath, value));
    },
    async readFile(target) {
      const base = next('read');
      try {
        const bytes = Buffer.from(await readFile(target));
        await api.bytes(`${base}-bytes`, `raw/${base}-${slug(target)}.bin`, bytes);
        return bytes;
      } catch (error) {
        await api.json(`${base}-error`, `raw/${base}-${slug(target)}-error.json`, {
          operation: 'readFile',
          target,
          code: error?.code ?? null,
          message: String(error?.message ?? error),
        });
        throw error;
      }
    },
    async command(spec) {
      const base = next('command');
      try {
        const result = await runCommand(spec);
        await api.bytes(`${base}-stdout`, `raw/${base}-stdout.bin`, result.stdout ?? Buffer.alloc(0));
        await api.bytes(`${base}-stderr`, `raw/${base}-stderr.bin`, result.stderr ?? Buffer.alloc(0));
        await api.json(`${base}-meta`, `raw/${base}-meta.json`, {
          argv: spec.argv,
          cwd: spec.cwd,
          envKeys: Object.keys(spec.env ?? {}).sort(),
          timeoutMs: spec.timeoutMs,
          outputLimitBytes: spec.outputLimitBytes,
          exitCode: result.exitCode ?? null,
          signal: result.signal ?? null,
          durationMs: result.durationMs ?? null,
        });
        return result;
      } catch (error) {
        await api.json(`${base}-error`, `raw/${base}-error.json`, {
          argv: spec.argv,
          cwd: spec.cwd,
          envKeys: Object.keys(spec.env ?? {}).sort(),
          code: error?.code ?? null,
          message: String(error?.message ?? error),
        });
        throw error;
      }
    },
    async lstat(target) {
      const base = next('lstat');
      try {
        const stats = await lstat(target);
        await api.json(`${base}-meta`, `raw/${base}-${slug(target)}.json`, {
          operation: 'lstat',
          target,
          isFile: Boolean(stats.isFile?.()),
          isCharacterDevice: Boolean(stats.isCharacterDevice?.()),
          isDirectory: Boolean(stats.isDirectory?.()),
          isSymbolicLink: Boolean(stats.isSymbolicLink?.()),
          mode: Number.isInteger(stats.mode) ? stats.mode : null,
        });
        return stats;
      } catch (error) {
        await api.json(`${base}-error`, `raw/${base}-${slug(target)}-error.json`, {
          operation: 'lstat', target, code: error?.code ?? null, message: String(error?.message ?? error),
        });
        throw error;
      }
    },
    async open(target, flags) {
      const base = next('open');
      try {
        const handle = await open(target, flags);
        await api.json(`${base}-meta`, `raw/${base}-${slug(target)}.json`, {
          operation: 'open', target, flags, result: 'OPENED',
        });
        return handle;
      } catch (error) {
        await api.json(`${base}-error`, `raw/${base}-${slug(target)}-error.json`, {
          operation: 'open', target, flags, code: error?.code ?? null, message: String(error?.message ?? error),
        });
        throw error;
      }
    },
    async executableExists(target) {
      const base = next('access');
      try {
        await access(target, constants.X_OK);
        await api.json(`${base}-meta`, `raw/${base}-${slug(target)}.json`, {
          operation: 'access', target, mode: 'X_OK', result: 'PRESENT',
        });
        return true;
      } catch (error) {
        await api.json(`${base}-error`, `raw/${base}-${slug(target)}-error.json`, {
          operation: 'access', target, mode: 'X_OK', code: error?.code ?? null,
        });
        return false;
      }
    },
  };
  return api;
}

function attachRefs(record, refs) {
  return { ...record, artifactRefs: [...refs] };
}

function attachRefsToObject(value, refs) {
  return Object.fromEntries(Object.entries(value).map(([key, record]) => [key, attachRefs(record, refs)]));
}

export async function collectDefaultS0({ runRoot, repoRoot, capture = createEvidenceCapture(runRoot) } = {}) {
  const observations = [];

  let start = capture.checkpoint();
  const host = await observeHostIdentity({ repoRoot, runCommand: capture.command, readFile: capture.readFile });
  const hostRefs = capture.refsSince(start);
  observations.push(...host.observations.map((record) => attachRefs(record, hostRefs)));

  start = capture.checkpoint();
  const repository = await observeRepositoryIdentity({ repoRoot, runCommand: capture.command });
  observations.push(attachRefs(repository.observation, capture.refsSince(start)));

  start = capture.checkpoint();
  const cpuInfo = await capture.readFile('/proc/cpuinfo');
  observations.push(attachRefs(classifyCpuVirtualization(cpuInfo.toString('utf8'), { isWsl2: host.identity.isWsl2 }), capture.refsSince(start)));

  start = capture.checkpoint();
  const kvm = await observeKvmDevice({ lstat: capture.lstat, open: capture.open });
  const kvmRefs = capture.refsSince(start);
  observations.push(attachRefs(kvm.device, kvmRefs), attachRefs(kvm.rwOpen, kvmRefs));

  start = capture.checkpoint();
  const kernelConfig = await discoverKernelConfig({ kernelRelease: host.identity.kernelRelease, readFile: capture.readFile });
  const configRefs = capture.refsSince(start);
  const configObservations = configBackedSecurityObservations(kernelConfig.text);
  observations.push(attachRefs(configObservations.seccomp, configRefs), attachRefs(configObservations.landlock, configRefs));

  start = capture.checkpoint();
  const userns = await observeUserNamespace({
    configText: kernelConfig.text,
    executableExists: capture.executableExists,
    runCommand: capture.command,
  });
  observations.push(attachRefs(userns, capture.refsSince(start)));

  start = capture.checkpoint();
  const fuse = await observeFuse({ lstat: capture.lstat, open: capture.open, runCommand: capture.command });
  const fuseRefs = capture.refsSince(start);
  observations.push(attachRefs(fuse.device, fuseRefs), attachRefs(fuse.tools, fuseRefs));

  start = capture.checkpoint();
  const cgroup = await observeCgroupV2({ readFile: capture.readFile, runCommand: capture.command });
  observations.push(attachRefs(cgroup, capture.refsSince(start)));

  start = capture.checkpoint();
  const tools = await observeOptionalTools({ lstat: capture.lstat, runCommand: capture.command });
  const toolRefs = capture.refsSince(start);
  observations.push(...Object.values(attachRefsToObject(tools, toolRefs)));

  return {
    hostIdentity: host.identity,
    source: repository.source,
    checkoutClean: repository.clean,
    observations,
    limitations: observations
      .filter((record) => record.state === 'UNKNOWN')
      .map((record) => `${record.id}: ${record.rationale}`),
    rawArtifacts: capture.records,
  };
}
