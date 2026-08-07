import { spawnSync } from 'node:child_process';

export const DOCUMENTATION_TEST_FILES = Object.freeze([
  'scripts/test-documentation-tooling.mjs',
  'scripts/test-mis-002-replan-builder.mjs',
  'scripts/test-approved-mis-002-allocations.mjs',
  'scripts/test-arr-p1-blueprint-reconciliation.mjs',
  'scripts/test-arr-spike-contract-binding.mjs',
  'scripts/test-arr-s0-contract-consistency.mjs',
]);

for (const file of DOCUMENTATION_TEST_FILES) {
  const result = spawnSync(process.execPath, [file], {
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) {
    console.error(`Documentation regression runner failed to start ${file}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
