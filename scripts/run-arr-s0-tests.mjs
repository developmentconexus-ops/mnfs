import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collect(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    if (statSync(file).isDirectory()) files.push(...collect(file));
    else if (entry.endsWith('.test.mjs')) files.push(file);
  }
  return files.sort();
}

const files = collect('spikes/arr-s0/tests');
if (files.length === 0) {
  console.error('No ARR-S0 test files found under spikes/arr-s0/tests.');
  process.exit(2);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
