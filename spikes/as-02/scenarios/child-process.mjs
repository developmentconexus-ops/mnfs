const CHILD_PROBE_CODE = `
const { spawnSync } = require('node:child_process');
const childCode = "const fs=require('node:fs'); try { process.stdout.write(fs.readFileSync(process.argv[1])); process.exit(0); } catch { process.exit(23); }";
const result = spawnSync(process.execPath, ['-e', childCode, '--', process.argv[1]], { encoding: 'utf8' });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status === 0 ? 0 : 23);
`;

export function childProcessScenarios(context) {
  return [
    {
      scenarioId: 'S11',
      name: 'Child-process restriction propagation',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', CHILD_PROBE_CODE, '--', context.fixture.protectedResources.ssh],
      timeoutMs: 15_000,
      targetPaths: [context.fixture.protectedResources.ssh],
      observedResources: ['ssh'],
      failureCode: 'CHILD_PROCESS_ESCAPE',
    },
  ];
}
