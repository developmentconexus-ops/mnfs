const FAIL_CLOSED_CODE = "const fs=require('node:fs'); fs.writeFileSync(process.argv[1], 'fail-open-side-effect\\n');";

export function failClosedScenarios(context) {
  const sentinel = `${context.fixture.worktreePath}/as02-fail-closed-sentinel.txt`;
  return [
    {
      scenarioId: 'S13',
      name: 'Sandbox startup failure closes execution',
      expected: 'FAIL_CLOSED',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', FAIL_CLOSED_CODE, '--', sentinel],
      timeoutMs: 10_000,
      targetPaths: [sentinel],
      observedResources: ['failClosedSentinel'],
      failureCode: 'FAIL_OPEN_DETECTED',
    },
  ];
}
