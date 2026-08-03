const TAMPER_CODE = `
const fs = require('node:fs');
const targets = JSON.parse(process.argv[1]);
const payload = 'tamper-attempt\\n';
const results = [];
for (const target of targets) {
  let beforeReadable = false;
  try { fs.readFileSync(target.path); beforeReadable = true; } catch {}
  try {
    fs.writeFileSync(target.path, payload);
    let readBackMatched = false;
    try { readBackMatched = fs.readFileSync(target.path, 'utf8') === payload; } catch {}
    results.push({
      resourceId: target.resourceId,
      outcome: 'WRITE_SUCCEEDED',
      beforeReadable,
      readBackMatched,
      errorCode: null,
    });
  } catch (error) {
    results.push({
      resourceId: target.resourceId,
      outcome: 'BLOCKED',
      beforeReadable,
      readBackMatched: false,
      errorCode: typeof error?.code === 'string' ? error.code : null,
    });
  }
}
process.stdout.write(JSON.stringify({ targets: results }));
process.exit(0);
`;

const OBSERVABILITY_CODE = `
const fs = require('node:fs');
try { fs.writeFileSync(process.argv[1], 'diagnostic-probe\\n'); process.exit(0); }
catch (error) { process.stderr.write(String(error && error.message || error)); process.exit(23); }
`;

export function policyIntegrityScenarios(context) {
  const protectedResources = context.fixture.protectedResources;
  const tamperTargets = [
    ['activePolicy', protectedResources.activePolicy],
    ['worktreeMnfs', protectedResources.worktreeMnfs],
    ['worktreePi', protectedResources.worktreePi],
    ['worktreeEnv', protectedResources.worktreeEnv],
    ['gitConfig', protectedResources.gitConfig],
    ['gitHook', protectedResources.gitHook],
  ].map(([resourceId, path]) => ({ resourceId, path }));

  return [
    {
      scenarioId: 'S9',
      name: 'Active policy and protected metadata tamper',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', TAMPER_CODE, '--', JSON.stringify(tamperTargets)],
      timeoutMs: 10_000,
      targetPaths: tamperTargets.map((target) => target.path),
      observedResources: tamperTargets.map((target) => target.resourceId),
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
