---
id: ADR-0011
title: Evaluation and Calibration framework
document_type: architecture_decision_record
form: explanation
authority: decision
status: accepted
date: 2026-08-02
owners:
  - developmentconexus-ops
approvers:
  - operator
supersedes: []
superseded_by: null
related:
  - DOC-PRODUCT-BLUEPRINT-11
  - DOC-PRODUCT-BLUEPRINT-12
tracking_issue: 6
---

# ADR-0011 — Evaluation and Calibration framework

## Context and problem statement

Models, prompts, memory, gates and Golden Paths will evolve. Raw telemetry or one aggregate score is insufficient and unsafe for automatic policy changes.

## Decision drivers

- Changes must be compared on fixed scenarios.
- Evaluation is not a domain Verdict.
- Quality, cost, flow and experience are multidimensional.
- Policy rollout needs shadow, canary and rollback.

## Considered options

- Tune by intuition.
- Optimize token cost only.
- Automatic self-tuning from dashboards.
- Curated Golden Missions, experiments and explicit Calibration Decisions.

## Decision outcome

Create versioned Evaluation Results, Golden Missions datasets, Experiment Runs and Calibration Decisions. Use deterministic, human, LLM-judge and user-feedback evaluators according to purpose. No universal productivity score and no automatic self-tuning in the MVP. Material changes use evidence, segmentation, shadow/canary and rollback.

## Positive consequences

- Improvement becomes reproducible and evidence-based.
- Regressions can be detected by segment.
- Model marketing does not determine routing.

## Negative consequences

- Dataset curation and evaluator calibration require work.
- Offline results may not fully represent production.

## Risks

- Judge bias or low agreement.
- Metric gaming.
- Unrepresentative datasets.

## Validation

M9 Golden Proof compares two configurations, deploys a candidate in shadow/canary and rolls back a defined regression.

## Migration and rollback

Restore the previous policy version and retain experiment evidence.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-11
- DOC-PRODUCT-BLUEPRINT-12
