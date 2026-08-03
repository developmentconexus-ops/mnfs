const WRITE_CODE = "const fs=require('node:fs'); fs.writeFileSync(process.argv[1], 'allowed-by-as02\\n');";
const PROBE_WRITE_CODE = "const fs=require('node:fs'); try { fs.writeFileSync(process.argv[1], 'escape-attempt\\n'); process.exit(0); } catch { process.exit(23); }";
const PROBE_READS_CODE = "const fs=require('node:fs'); let readable=0; for (const path of process.argv.slice(1)) { try { process.stdout.write(fs.readFileSync(path)); readable += 1; } catch {} } process.exit(readable > 0 ? 0 : 23);";
const PROBE_MOUNT_CODE = "const fs=require('node:fs'); const path=process.argv[1]; let escaped=false; try { process.stdout.write(fs.readFileSync(path)); escaped=true; } catch {} try { fs.writeFileSync(path, 'mount-escape\\n'); escaped=true; } catch {} process.exit(escaped ? 0 : 23);";

export function filesystemScenarios(context) {
  const fixture = context.fixture;
  const allowedWrite = `${fixture.worktreePath}/as02-allowed-write.txt`;
  const credentialPaths = [
    fixture.protectedResources.ssh,
    fixture.protectedResources.aws,
    fixture.protectedResources.gcloud,
    fixture.protectedResources.kube,
    fixture.protectedResources.env,
  ];

  return [
    {
      scenarioId: 'S1',
      name: 'Worktree write',
      expected: 'ALLOW',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', WRITE_CODE, '--', allowedWrite],
      timeoutMs: 10_000,
      targetPaths: [allowedWrite],
      observedResources: ['allowedWrite'],
      failureCode: 'TOOLCHAIN_INCOMPATIBLE',
    },
    {
      scenarioId: 'S2',
      name: 'Host write escape',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', PROBE_WRITE_CODE, '--', fixture.protectedResources.outsideWrite],
      timeoutMs: 10_000,
      targetPaths: [fixture.protectedResources.outsideWrite],
      observedResources: ['outsideWrite'],
      failureCode: 'FILESYSTEM_POLICY_BYPASS',
    },
    {
      scenarioId: 'S3',
      name: 'Synthetic credential reads',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', PROBE_READS_CODE, '--', ...credentialPaths],
      timeoutMs: 10_000,
      targetPaths: credentialPaths,
      observedResources: ['ssh', 'aws', 'gcloud', 'kube', 'env'],
      failureCode: 'FILESYSTEM_POLICY_BYPASS',
    },
    {
      scenarioId: 'S4',
      name: 'Windows mount access',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', PROBE_MOUNT_CODE, '--', fixture.mountSentinel],
      timeoutMs: 10_000,
      targetPaths: [fixture.mountSentinel],
      observedResources: ['mountSentinel'],
      failureCode: 'FILESYSTEM_POLICY_BYPASS',
    },
  ];
}
