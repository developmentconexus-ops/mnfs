function quote(value) {
  return `'${String(value).replaceAll("'", `'"'"'`)}'`;
}

export function toolchainScenarios(context) {
  const tscPath = context.toolchain?.tscPath ?? '/trusted/typescript/bin/tsc';
  const command = [
    'set -eu',
    'export GIT_OPTIONAL_LOCKS=0',
    'git --no-optional-locks status --short',
    'node --version',
    'npm --version',
    `node ${quote(tscPath)} --noEmit -p tsconfig.json`,
    'npm test --silent',
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
