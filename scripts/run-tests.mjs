import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collect(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...collect(path));
    else if (entry.endsWith('.test.js')) files.push(path);
  }
  return files.sort();
}

const files = collect('dist/tests');
if (files.length === 0) {
  console.error('No compiled test files found under dist/tests.');
  process.exit(2);
}
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(result.status ?? 1);
