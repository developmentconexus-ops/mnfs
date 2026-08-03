import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

test('root verification includes the deterministic AS-02 harness', async () => {
  const root = await readJson('package.json');

  assert.equal(root.scripts['test:as02'], 'node scripts/run-as02-tests.mjs');
  assert.equal(root.scripts.as02, 'node spikes/as-02/src/cli.mjs');
  assert.match(root.scripts.verify, /npm run test:as02/);
});

test('the spike package is private, ESM, Node 24 and pins Sandbox Runtime', async () => {
  const spike = await readJson('spikes/as-02/package.json');

  assert.equal(spike.private, true);
  assert.equal(spike.type, 'module');
  assert.equal(spike.engines.node, '>=24.18.0');
  assert.equal(spike.dependencies['@anthropic-ai/sandbox-runtime'], '0.0.67');
});

test('the isolated lockfile fixes the reviewed Sandbox Runtime dependency graph', async () => {
  const lock = await readJson('spikes/as-02/package-lock.json');

  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.packages[''].dependencies['@anthropic-ai/sandbox-runtime'], '0.0.67');
  assert.equal(lock.packages['node_modules/@anthropic-ai/sandbox-runtime'].version, '0.0.67');
  assert.equal(
    lock.packages['node_modules/@anthropic-ai/sandbox-runtime'].integrity,
    'sha512-4doSyr6KNdc/4zARMXYEawhFu3z6bPQjgKRq3lKp6dbgEYVMv39oaLJ28QsDc7TmLvrLqzHW+VzD2LAXxvnw8A==',
  );
  assert.deepEqual(
    Object.fromEntries(
      [
        '@pondwader/socks5-server',
        'commander',
        'node-forge',
        'zod',
      ].map((name) => [name, lock.packages[`node_modules/${name}`].version]),
    ),
    {
      '@pondwader/socks5-server': '1.0.10',
      commander: '12.1.0',
      'node-forge': '1.4.0',
      zod: '3.25.76',
    },
  );
});
