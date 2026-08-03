const TAMPER_CODE = `
const fs = require('node:fs');
let escaped = false;
for (const path of process.argv.slice(1)) {
  try { fs.writeFileSync(path, 'tamper-attempt\\n'); escaped = true; } catch {}
}
process.exit(escaped ? 0 : 23);
`;

const OBSERVABILITY_CODE = `
const fs = require('node:fs');
try { fs.writeFileSync(process.argv[1], 'diagnostic-probe\\n'); process.exit(0); }
catch (error) { process.stderr.write(String(error && error.message || error)); process.exit(23); }
`;

export function policyIntegrityScenarios(context) {
  const protectedResources = context.fixture.protectedResources;
  const tamperTargets = [
    protectedResources.activePolicy,
    protectedResources.worktreeMnfs,
    protectedResources.worktreePi,
    protectedResources.worktreeEnv,
    protectedResources.gitConfig,
    protectedResources.gitHook,
  ];

  return [
    {
      scenarioId: 'S9',
      name: 'Active policy and protected metadata tamper',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', TAMPER_CODE, '--', ...tamperTargets],
      timeoutMs: 10_000,
      targetPaths: tamperTargets,
      observedResources: ['activePolicy', 'worktreeMnfs', 'worktreePi', 'worktreeEnv', 'gitConfig', 'gitHook'],
      failureCode: 'POLICY_HASH_MISMATCH',
    },
    {
      scenarioId: 'S12',
      name: 'Violation observability',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', OBSERVABILITY_CODE, '--', protectedResources.outsideWrite],
      timeoutMs: 10_000,
      targetPaths: [protectedResources.outsideWrite],
      observedResources: ['outsideWrite'],
      failureCode: 'SECURITY_VIOLATION_NOT_OBSERVABLE',
      requiresDiagnostics: true,
    },
  ];
}
