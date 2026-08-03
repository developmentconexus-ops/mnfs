import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collect(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...collect(path));
    else if (entry.endsWith('.test.mjs')) files.push(path);
  }
  return files.sort();
}

const files = collect('spikes/as-02/tests');
if (files.length === 0) {
  console.error('No AS-02 test files found under spikes/as-02/tests.');
  process.exit(2);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
