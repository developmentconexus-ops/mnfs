import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PERFORMANCE_PROFILE,
  runPerformanceSuite,
  summarizeSamples,
} from '../src/performance.mjs';

test('summarizes samples with deterministic nearest-rank percentiles', () => {
  assert.deepEqual(summarizeSamples([40, 10, 30, 20]), {
    count: 4,
    minMs: 10,
    p50Ms: 20,
    p95Ms: 40,
    maxMs: 40,
    meanMs: 25,
  });
  assert.throws(
    () => summarizeSamples([]),
    (error) => error?.code === 'PERFORMANCE_INVALID',
  );
  assert.throws(
    () => summarizeSamples([1, -1]),
    (error) => error?.code === 'PERFORMANCE_INVALID',
  );
});

test('uses the approved warm-up and measured sample counts without a pass threshold', () => {
  assert.deepEqual(PERFORMANCE_PROFILE, {
    warmupRuns: 5,
    benchmarks: {
      spawn: { measuredRuns: 20 },
      node: { measuredRuns: 20 },
      filesystem: { measuredRuns: 10 },
      test: { measuredRuns: 5 },
    },
  });
  assert.equal(Object.hasOwn(PERFORMANCE_PROFILE, 'maxAllowedOverhead'), false);
  assert.equal(Object.hasOwn(PERFORMANCE_PROFILE, 'passThreshold'), false);
});

test('excludes warm-ups and reports baseline, sandbox and overhead independently', async () => {
  const calls = [];
  const values = {
    spawn: { baseline: 10, sandbox: 15 },
    node: { baseline: 20, sandbox: 30 },
    filesystem: { baseline: 40, sandbox: 60 },
    test: { baseline: 100, sandbox: 125 },
  };
  const result = await runPerformanceSuite({
    measure: async ({ benchmark, mode, warmup, index }) => {
      calls.push({ benchmark, mode, warmup, index });
      return warmup ? 10_000 : values[benchmark][mode] + index;
    },
  });

  assert.equal(calls.filter((call) => call.warmup).length, 40);
  assert.equal(calls.filter((call) => !call.warmup).length, 110);
  assert.equal(result.measured, true);
  assert.deepEqual(Object.keys(result.benchmarks), ['spawn', 'node', 'filesystem', 'test']);
  assert.equal(result.benchmarks.spawn.baseline.count, 20);
  assert.equal(result.benchmarks.spawn.sandbox.count, 20);
  assert.equal(result.benchmarks.filesystem.baseline.count, 10);
  assert.equal(result.benchmarks.test.sandbox.count, 5);
  assert.equal(result.benchmarks.spawn.baseline.maxMs < 10_000, true);
  assert.equal(result.benchmarks.spawn.overhead.p50Ms, 5);
  assert.equal(result.benchmarks.test.overhead.p95Ms, 25);
  assert.deepEqual(result.limitations, []);
  assert.equal(Object.hasOwn(result, 'passed'), false);
});

test('records measurement failures as limitations instead of inventing success', async () => {
  const result = await runPerformanceSuite({
    measure: async ({ benchmark, mode, warmup }) => {
      if (!warmup && benchmark === 'test' && mode === 'sandbox') throw new Error('measurement unavailable');
      return 10;
    },
  });

  assert.equal(result.measured, false);
  assert.equal(result.limitations.some((entry) => entry.includes('test/sandbox')), true);
  assert.equal(result.benchmarks.test.sandbox, null);
});
