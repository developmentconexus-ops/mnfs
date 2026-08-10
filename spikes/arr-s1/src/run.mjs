import { evaluateApplicability } from './applicability.mjs';
import { sha256Bytes } from './artifacts.mjs';
import { S1_CANDIDATE_VERDICTS } from './contract.mjs';
import { preflightS1 } from './preflight.mjs';
import { buildS1Report } from './report.mjs';
import { createS1CandidateExecutors } from './executors.mjs';

const CONDITIONAL_SHAPES = Object.freeze({ piRpc: 'PI-RPC', secondAcp: 'SECOND-ACP' });
const FINAL_VERDICTS = new Set(['PASS', 'FAIL', 'BLOCKED', 'REJECT', 'SUCCESS']);

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function blockedRecord(candidateShape, reason) {
  return {
    candidateShape,
    finalized: false,
    verdict: null,
    criterionResults: [],
    evidenceIntegrity: { valid: false },
    blockers: [reason],
  };
}

function normalizeCandidateResult(candidateShape, raw) {
  if (!raw || typeof raw !== 'object') return blockedRecord(candidateShape, 'candidate executor did not return finalized Evidence');
  const result = clone(raw);
  if (result.candidateShape !== candidateShape) {
    return {
      ...blockedRecord(candidateShape, 'candidate executor returned Evidence for another shape'),
      finalized: true,
      verdict: 'REJECT',
    };
  }
  if (result.finalized !== true || !S1_CANDIDATE_VERDICTS.includes(result.verdict)) {
    return {
      ...result,
      candidateShape,
      finalized: result.finalized === true,
      verdict: result.finalized === true ? result.verdict ?? 'BLOCKED' : null,
      blockers: [...(result.blockers ?? []), 'candidate Evidence is not finalized with an accepted verdict'],
    };
  }
  return result;
}

async function executeShape({ candidateShape, executors, context, executedCandidateShapes }) {
  const executor = executors?.[candidateShape];
  if (typeof executor !== 'function') return blockedRecord(candidateShape, 'no injected executor is available in the deterministic harness');
  executedCandidateShapes.push(candidateShape);
  try {
    const artifactBinding = context.artifactBindingBase
      ? {
        ...context.artifactBindingBase,
        candidateShape,
        runKey: sha256Bytes(Buffer.from(JSON.stringify({
          baseRunKey: context.artifactBindingBase.runKey,
          candidateShape,
        }))),
      }
      : context.artifactBinding;
    return normalizeCandidateResult(
      candidateShape,
      await executor({ ...context, candidateShape, artifactBinding, deterministic: true }),
    );
  } catch (error) {
    return {
      ...blockedRecord(candidateShape, 'candidate executor failed before finalized Evidence'),
      error: String(error?.message ?? error),
    };
  }
}

function isPassing(record) {
  return record?.finalized === true && record.verdict === 'PASS';
}

function selectPassingPiShape({ passingShapes, chooser }) {
  if (passingShapes.length !== 1) return null;
  if (typeof chooser !== 'function') return passingShapes[0];
  const chosen = chooser({ passingShapes: [...passingShapes] });
  return chosen === passingShapes[0] ? chosen : null;
}

function failClosedReport(report) {
  if (report && FINAL_VERDICTS.has(report.status)) return report;
  return {
    ...(report && typeof report === 'object' ? report : {}),
    status: 'BLOCKED',
    termination: 'BLOCKED',
    blockers: [...(Array.isArray(report?.blockers) ? report.blockers : []), 'final report verdict is outside PASS|FAIL|BLOCKED|REJECT'],
  };
}

function byShape(records) {
  return Object.fromEntries(records.map((record) => [record.candidateShape, record]));
}

export async function orchestrateS1({
  runId,
  preflight = preflightS1,
  preflightInput = {},
  executors = null,
  fixture = null,
  fixtureFactory = null,
  executorOptions = {},
  choosePassingPiShape,
  applicabilityEvaluator = evaluateApplicability,
  reportBuilder = buildS1Report,
} = {}) {
  const preflightResult = await preflight(preflightInput);
  const executedCandidateShapes = [];
  const candidates = [];
  const phases = {
    preflight: preflightResult?.status ?? (preflightResult?.ok === true ? 'READY' : 'BLOCKED'),
    piQualification: 'NOT_RUN',
    piQualificationAnchor: null,
    externalComparison: 'NOT_RUN',
    conditionals: 'NOT_RUN',
  };

  if (preflightResult?.status !== 'READY' && preflightResult?.ok !== true) {
    const report = failClosedReport(reportBuilder({ runId, candidates, preflight: preflightResult, source: preflightResult?.source ?? null, applicability: null, externalComparison: null }));
    return {
      runId: runId ?? null,
      status: 'BLOCKED',
      termination: 'BLOCKED',
      phases,
      preflight: preflightResult,
      fixture,
      candidates,
      applicability: null,
      executedCandidateShapes,
      report,
    };
  }

  let activeFixture = fixture;
  if (!activeFixture && typeof fixtureFactory === 'function') {
    activeFixture = await fixtureFactory({ runId: runId ?? null, preflight: clone(preflightResult) });
  }
  const sourceTreeHash = /^[a-f0-9]{40}$/u.test(preflightResult?.source?.treeSha ?? '')
    ? sha256Bytes(Buffer.from(preflightResult.source.treeSha)) : null;
  const baseBinding = executorOptions.artifactBindingBase ?? (
    sourceTreeHash && /^sha256:[a-f0-9]{64}$/u.test(activeFixture?.fixtureHash ?? '')
      && /^sha256:[a-f0-9]{64}$/u.test(preflightResult?.executionAuthorization?.contractSha256 ?? '')
      ? {
        runId: runId ?? null,
        candidateShape: 'S1-RUN',
        runKey: sha256Bytes(Buffer.from(JSON.stringify({ runId: runId ?? null, sourceTreeHash, fixtureHash: activeFixture.fixtureHash }))),
        contractHash: preflightResult.executionAuthorization.contractSha256,
        fixtureHash: activeFixture.fixtureHash,
        sourceTreeHash,
      }
      : null
  );
  const activeExecutors = executors ?? (activeFixture ? createS1CandidateExecutors({ fixture: activeFixture, ...executorOptions }) : {});
  const context = {
    runId: runId ?? null,
    preflight: clone(preflightResult),
    priorCandidates: [],
    fixture: activeFixture,
    artifactBindingBase: baseBinding,
    ...executorOptions,
  };
  phases.piQualification = 'RUNNING';
  for (const candidateShape of ['PI-SDK', 'PI-ACP']) {
    const result = await executeShape({ candidateShape, executors: activeExecutors, context: { ...context, priorCandidates: clone(candidates) }, executedCandidateShapes });
    candidates.push(result);
  }
  phases.piQualification = 'FINALIZED';
  const piByShape = byShape(candidates);
  const passingPiShapes = ['PI-SDK', 'PI-ACP'].filter((shape) => isPassing(piByShape[shape]));
  phases.piQualificationAnchor = selectPassingPiShape({ passingShapes: passingPiShapes, chooser: choosePassingPiShape });

  phases.externalComparison = 'RUNNING';
  const openCode = await executeShape({
    candidateShape: 'OPENCODE-ACP',
    executors: activeExecutors,
    context: { ...context, priorCandidates: clone(candidates), piQualificationAnchor: phases.piQualificationAnchor },
    executedCandidateShapes,
  });
  candidates.push(openCode);
  phases.externalComparison = openCode.finalized === true && (openCode.verdict === 'PASS' || openCode.verdict === 'FAIL') ? 'FINALIZED' : 'BLOCKED';

  const evidence = byShape(candidates);
  const applicability = applicabilityEvaluator({
    piSdk: evidence['PI-SDK'],
    piAcp: evidence['PI-ACP'],
    openCode: evidence['OPENCODE-ACP'],
  });
  phases.conditionals = 'EVALUATED';
  for (const [key, candidateShape] of Object.entries(CONDITIONAL_SHAPES)) {
    if (applicability[key] === 'REQUIRED') {
      phases.conditionals = 'RUNNING';
      candidates.push(await executeShape({
        candidateShape,
        executors: activeExecutors,
        context: { ...context, priorCandidates: clone(candidates), applicability: clone(applicability) },
        executedCandidateShapes,
      }));
    }
  }
  if (phases.conditionals === 'RUNNING') phases.conditionals = 'FINALIZED';

  const report = failClosedReport(reportBuilder({
    runId,
    candidates,
    preflight: preflightResult,
    source: preflightResult.source,
    fixture: activeFixture,
    applicability,
    externalComparison: openCode,
  }));
  return {
    runId: runId ?? null,
    status: report.status,
    termination: report.status,
    phases,
    preflight: preflightResult,
    fixture: activeFixture,
    candidates,
    applicability,
    executedCandidateShapes,
    report,
  };
}

export const runS1 = orchestrateS1;
