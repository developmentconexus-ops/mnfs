import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createPiSdkAdapter } from './adapters/pi-sdk.mjs';
import { createFixtureTools } from './fixture.mjs';
import { revalidateStagedCandidateProvenance } from './probes/candidate-provenance.mjs';

function digestEnvironment(env) {
  return `sha256:${createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(env).sort()))).digest('hex')}`;
}

function fixtureFromSpec(spec) {
  return Object.freeze({
    ...spec.fixture,
    inventory: Object.freeze(spec.fixture.inventory ?? []),
    expectedTree: Object.freeze(spec.fixture.expectedTree),
  });
}

async function main() {
  const input = JSON.parse(await readFile(0, 'utf8'));
  if (!input || typeof input.candidateModule !== 'string' || !input.candidateModule.startsWith('/')) {
    throw new TypeError('trusted ActorRun child requires an absolute candidate module');
  }
  const fixture = fixtureFromSpec(input);
  const tools = createFixtureTools(fixture);
  const trustedCwd = process.cwd();
  const trustedEnvDigest = digestEnvironment(process.env);
  const staged = await revalidateStagedCandidateProvenance({
    stateRoot: input.stateRoot,
    candidateShape: input.candidateShape,
    expectedManifestSha256: input.expectedManifestSha256,
  });
  if (staged.record.upstreamSurfaces?.runtimeModule?.path !== input.candidateModule) {
    throw new Error('trusted ActorRun candidate module is not the revalidated upstream surface');
  }
  const sdk = await import(input.candidateModule);
  const adapter = createPiSdkAdapter({
    sdk,
    cwd: fixture.workspacePath,
    piCodingAgentDir: process.env.PI_CODING_AGENT_DIR,
    tools: tools.customTools.map(({ name }) => name),
    noTools: 'all',
    customTools: tools.customTools,
  });
  const ready = await adapter.initialize();
  process.stdout.write(`${JSON.stringify({ kind: 'MNFS_TRUSTED_TURN_ACTIVE', candidateShape: input.candidateShape, atMs: Date.now() })}\n`);
  const settled = await adapter.startTurn(fixture.prompt);
  await adapter.close();
  process.stdout.write(`${JSON.stringify({ kind: 'MNFS_TRUSTED_TURN_SETTLED', candidateShape: input.candidateShape, atMs: Date.now(), outcome: settled?.outcome ?? null })}\n`);
  process.stdout.write(`${JSON.stringify({
    kind: 'MNFS_TRUSTED_ACTOR_RESULT',
    candidateShape: input.candidateShape,
    settled,
    discovery: ready?.discovery ?? adapter.observeDiscovery?.() ?? null,
    events: adapter.observe(),
    rawEvents: adapter.observeRaw?.() ?? [],
    fixtureToolCalls: tools.snapshot(),
    boundaryObservation: {
      cwd: trustedCwd,
      envDigest: trustedEnvDigest,
      envSource: 'MNFS_TRUSTED_ACTOR_CHILD',
      pid: process.pid,
    },
  })}\n`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${String(error?.stack ?? error)}\n`);
  process.exitCode = 1;
}
