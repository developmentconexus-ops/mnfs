import { as02Error, assertAs02 } from './errors.mjs';

export const PERFORMANCE_PROFILE = Object.freeze({
  warmupRuns: 5,
  benchmarks: Object.freeze({
    spawn: Object.freeze({ measuredRuns: 20 }),
    node: Object.freeze({ measuredRuns: 20 }),
    filesystem: Object.freeze({ measuredRuns: 10 }),
    test: Object.freeze({ measuredRuns: 5 }),
  }),
});

function round(value) {
  return Number(value.toFixed(3));
}

function percentile(sorted, fraction) {
  const rank = Math.max(1, Math.ceil(sorted.length * fraction));
  return sorted[rank - 1];
}

export function summarizeSamples(samples) {
  if (
    !Array.isArray(samples) ||
    samples.length === 0 ||
    !samples.every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0)
  ) {
    throw as02Error('PERFORMANCE_INVALID', 'Performance samples must be a non-empty array of finite non-negative milliseconds.');
  }
  const sorted = [...samples].sort((left, right) => left - right);
  const mean = sorted.reduce((total, value) => total + value, 0) / sorted.length;
  return {
    count: sorted.length,
    minMs: round(sorted[0]),
    p50Ms: round(percentile(sorted, 0.5)),
    p95Ms: round(percentile(sorted, 0.95)),
    maxMs: round(sorted.at(-1)),
    meanMs: round(mean),
  };
}

function overhead(baseline, sandbox) {
  return {
    minMs: round(sandbox.minMs - baseline.minMs),
    p50Ms: round(sandbox.p50Ms - baseline.p50Ms),
    p95Ms: round(sandbox.p95Ms - baseline.p95Ms),
    maxMs: round(sandbox.maxMs - baseline.maxMs),
    meanMs: round(sandbox.meanMs - baseline.meanMs),
  };
}

async function measureMode({ measure, benchmark, mode, measuredRuns }) {
  for (let index = 0; index < PERFORMANCE_PROFILE.warmupRuns; index += 1) {
    const value = await measure({ benchmark, mode, warmup: true, index });
    assertAs02(typeof value === 'number' && Number.isFinite(value) && value >= 0, 'PERFORMANCE_INVALID', 'Warm-up measurement is invalid.', {
      benchmark,
      mode,
      index,
      value,
    });
  }
  const samples = [];
  for (let index = 0; index < measuredRuns; index += 1) {
    const value = await measure({ benchmark, mode, warmup: false, index });
    assertAs02(typeof value === 'number' && Number.isFinite(value) && value >= 0, 'PERFORMANCE_INVALID', 'Measured duration is invalid.', {
      benchmark,
      mode,
      index,
      value,
    });
    samples.push(value);
  }
  return summarizeSamples(samples);
}

export async function runPerformanceSuite({ measure }) {
  assertAs02(typeof measure === 'function', 'PERFORMANCE_INVALID', 'A performance measurement function is required.');
  const benchmarks = {};
  const limitations = [];

  for (const [benchmark, profile] of Object.entries(PERFORMANCE_PROFILE.benchmarks)) {
    const entry = { baseline: null, sandbox: null, overhead: null };
    for (const mode of ['baseline', 'sandbox']) {
      try {
        entry[mode] = await measureMode({
          measure,
          benchmark,
          mode,
          measuredRuns: profile.measuredRuns,
        });
      } catch (cause) {
        limitations.push(`${benchmark}/${mode}: ${cause instanceof Error ? cause.message : String(cause)}`);
      }
    }
    if (entry.baseline && entry.sandbox) entry.overhead = overhead(entry.baseline, entry.sandbox);
    benchmarks[benchmark] = entry;
  }

  return {
    measured: limitations.length === 0,
    profile: PERFORMANCE_PROFILE,
    benchmarks,
    limitations,
  };
}
