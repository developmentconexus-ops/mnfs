import { verifyFixtureResult } from './fixture.mjs';

try {
  const input = JSON.parse(process.argv[2] ?? '{}');
  const result = await verifyFixtureResult(input.fixture, { toolCalls: input.toolCalls ?? [] });
  process.stdout.write(`${JSON.stringify({
    kind: 'MNFS_TRUSTED_FRESH_RECOVERY',
    phase: 'FRESH_PROCESS',
    verified: result.ok,
    changedPaths: result.changedPaths,
    treeSha: result.treeSha,
    errors: result.errors,
  })}\n`);
  process.exitCode = result.ok ? 0 : 2;
} catch (error) {
  process.stderr.write(`${String(error?.stack ?? error)}\n`);
  process.exitCode = 1;
}
