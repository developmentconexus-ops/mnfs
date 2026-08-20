import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DENY = new Set([
  '@mastra/core@1.42.1',
  '@mastra/memory@1.20.4',
  '@mastra/e2b@0.3.4'
]);

const REQUIRED_DIRECT = {
  '@mastra/core': '1.56.0',
  '@mastra/memory': '1.25.0',
  '@mastra/pg': '1.19.0'
};

export function verifyLock(lock) {
  if (lock.lockfileVersion !== 3) {
    throw new Error(`Expected lockfileVersion 3, got ${lock.lockfileVersion}`);
  }

  const root = lock.packages?.['']?.dependencies ?? {};
  for (const [name, version] of Object.entries(REQUIRED_DIRECT)) {
    if (root[name] !== version) {
      throw new Error(`Direct pin drift: ${name} expected ${version}, got ${root[name]}`);
    }
  }

  for (const [pkgPath, meta] of Object.entries(lock.packages ?? {})) {
    if (!pkgPath.startsWith('node_modules/')) continue;
    const name = pkgPath.slice('node_modules/'.length);
    const version = meta?.version;
    if (!version) continue;

    if (DENY.has(`${name}@${version}`) || name.includes('easy-day-js')) {
      throw new Error(`Q0 deny-set dependency present: ${name}@${version}`);
    }

    if (name.startsWith('@mastra/') && /-(?:alpha|beta|rc|next|canary)[.-]?/iu.test(version)) {
      throw new Error(`Mastra prerelease is not admitted: ${name}@${version}`);
    }
  }

  for (const [name, version] of Object.entries(REQUIRED_DIRECT)) {
    const resolved = lock.packages?.[`node_modules/${name}`]?.version;
    if (resolved !== version) {
      throw new Error(`Resolved direct pin drift: ${name} expected ${version}, got ${resolved ?? 'MISSING'}`);
    }
  }

  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  verifyLock(lock);
  console.log('Package B lock admission passed.');
}
