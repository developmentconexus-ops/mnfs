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

function summarize(samples, { nonNegative }) {
  if (
    !Array.isArray(samples) ||
    samples.length === 0 ||
    !samples.every((value) => (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      (!nonNegative || value >= 0)
    ))
  ) {
    throw as02Error(
      'PERFORMANCE_INVALID',
      nonNegative
        ? 'Performance samples must be a non-empty array of finite non-negative milliseconds.'
        : 'Performance overhead samples must be a non-empty array of finite milliseconds.',
    );
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

export function summarizeSamples(samples) {
  return summarize(samples, { nonNegative: true });
}

function summarizeOverheadSamples(samples) {
  return summarize(samples, { nonNegative: false });
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
  return samples;
}

export async function runPerformanceSuite({ measure }) {
  assertAs02(typeof measure === 'function', 'PERFORMANCE_INVALID', 'A performance measurement function is required.');
  const benchmarks = {};
  const limitations = [];

  for (const [benchmark, profile] of Object.entries(PERFORMANCE_PROFILE.benchmarks)) {
    const entry = { baseline: null, sandbox: null, overhead: null };
    const samples = { baseline: null, sandbox: null };
    for (const mode of ['baseline', 'sandbox']) {
      try {
        samples[mode] = await measureMode({
          measure,
          benchmark,
          mode,
          measuredRuns: profile.measuredRuns,
        });
        entry[mode] = summarizeSamples(samples[mode]);
      } catch (cause) {
        limitations.push(`${benchmark}/${mode}: ${cause instanceof Error ? cause.message : String(cause)}`);
      }
    }
    if (samples.baseline && samples.sandbox) {
      assertAs02(
        samples.baseline.length === samples.sandbox.length,
        'PERFORMANCE_INVALID',
        'Baseline and sandbox performance sample counts must match.',
        {
          benchmark,
          baselineCount: samples.baseline.length,
          sandboxCount: samples.sandbox.length,
        },
      );
      const pairedOverhead = samples.sandbox.map(
        (sandboxValue, index) => sandboxValue - samples.baseline[index],
      );
      entry.overhead = summarizeOverheadSamples(pairedOverhead);
    }
    benchmarks[benchmark] = entry;
  }

  return {
    measured: limitations.length === 0,
    profile: PERFORMANCE_PROFILE,
    benchmarks,
    limitations,
  };
}
