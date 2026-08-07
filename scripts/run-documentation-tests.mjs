import { spawnSync } from 'node:child_process';

export const DOCUMENTATION_TEST_FILES = Object.freeze([
  'scripts/test-documentation-tooling.mjs',
  'scripts/test-mis-002-replan-builder.mjs',
  'scripts/test-approved-mis-002-allocations.mjs',
  'scripts/test-arr-p1-blueprint-reconciliation.mjs',
  'scripts/test-arr-spike-contract-binding.mjs',
  'scripts/test-arr-s0-contract-consistency.mjs',
]);

for (const [index, file] of DOCUMENTATION_TEST_FILES.entries()) {
  const result = spawnSync(process.execPath, [file], {
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) {
    console.error(`Documentation regression runner failed to start ${file}: ${result.error.message}`);
    process.exit(70 + index);
  }
  if (result.status !== 0) {
    console.error(`Documentation regression child failed: ${file} (child status ${result.status})`);
    process.exit(40 + index);
  }
}
