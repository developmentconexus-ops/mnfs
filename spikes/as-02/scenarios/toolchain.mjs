export function toolchainScenarios(context) {
  const command = [
    'set -eu',
    'export GIT_OPTIONAL_LOCKS=0',
    'git --no-optional-locks status --short',
    'node --version',
    'npm --version',
    'npx --no-install tsc --version',
    'npm run test:as02 --silent',
  ].join(' && ');

  return [
    {
      scenarioId: 'S10',
      name: 'Common MNFS toolchain compatibility',
      expected: 'ALLOW',
      policyKey: 'networkOff',
      argv: ['/bin/bash', '-c', command],
      timeoutMs: 120_000,
      targetPaths: [context.fixture.worktreePath],
      observedResources: [],
      failureCode: 'TOOLCHAIN_INCOMPATIBLE',
    },
  ];
}
