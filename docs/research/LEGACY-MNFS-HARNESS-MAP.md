---
id: DOC-RESEARCH-LEGACY-MNFS-HARNESS-MAP
title: Legacy MNFS Harness Knowledge Map
document_type: research_map
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - classification of legacy mnfs-harness knowledge
related:
  - DOC-PRODUCT-BLUEPRINT
  - ADR-0001
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# Legacy MNFS Harness Knowledge Map

## 1. Purpose

This map classifies the field evidence from `leandrotcawork/mnfs-harness` for the Pi-first MNFS rebuild.

The legacy repository is not the runtime base. It is a source of:

- field-tested failures;
- useful doctrine;
- workflows that must be adapted;
- Claude-specific mechanics that must not be copied automatically.

Classification:

```text
PRESERVE
ADAPT
HISTORICAL
SUPERSEDE
```

## 2. Governing rule

```text
field evidence
→ evaluate against current Product Blueprint
→ preserve invariant or adapt mechanism
→ never import legacy implementation authority
```

## 3. Executive classification

| Legacy concept | Classification | MNFS decision |
|---|---|---|
| Mission → Milestone → Feature | PRESERVE + ADAPT | Keep hierarchy; require criteria at all three levels and qualified IDs |
| P0–P8 lifecycle lessons | ADAPT | Preserve lifecycle concerns, replace phase numbering with explicit domain states/services |
| CORE + PROFILE + MISSION | PRESERVE + ADAPT | Engineering Constitution + Repository Profile + Approved Mission Contract |
| Write DAG | PRESERVE + ADAPT | Feature dependencies plus Write Track ownership and Integration queue |
| Seam ownership | PRESERVE | One writer per mutable seam unless explicit additive strategy |
| Contract satisfiability | PRESERVE | Planning Readiness and Capability Realization Gates |
| Prerequisite existence | PRESERVE | Entry Gate, dependency validation and environment readiness |
| Context Packs | PRESERVE + ADAPT | Compiled role-specific packs with Current Authority Snapshot and freshness |
| CLAIM / RECEIPT / VERDICT | PRESERVE | Canonical assurance model |
| Independent review | PRESERVE | Cold Reviewer for first pass when risk requires judgment |
| Dual-gate experience | HISTORICAL + ADAPT | Use only when a second pass adds unique information |
| Live user QA | PRESERVE | QA Journey against real seam/environment |
| Integration honesty | PRESERVE | Worktree green is not integrated or user-validated |
| Anti-loop / Replan | PRESERVE | Failure fingerprints, new hypothesis and bounded Attempts |
| Session handoff | PRESERVE + ADAPT | Artifact-first handoff; Sessions disposable |
| Durable state | PRESERVE | SQLite current state plus Events and artifact references |
| Token economy findings | PRESERVE AS EVIDENCE | Progressive disclosure, bounded packs and measured total cost |
| Review stacking findings | PRESERVE AS EVIDENCE | Gate must name failure mode and unique information |
| Claude-specific hooks/skills | SUPERSEDE | Pi extensions, CLI and Role Contracts |
| Transcript-driven recovery | SUPERSEDE | Reconcile SQLite, Git, Treehouse, process and filesystem |
| Worker “done” semantics | SUPERSEDE | Worker emits Claim; MNFS Gate accepts |
| Universal heavyweight workflow | SUPERSEDE | Risk-adaptive lanes and YAGNI |

## 4. Planning model

### Preserve

- Mission as operator outcome;
- Milestone as integrated intermediate outcome;
- Feature as bounded behavior;
- dependencies and execution order;
- explicit scope and non-goals;
- planning before implementation.

### Adapt

Legacy Feature IDs such as `F01` are only locally unique. Current identity is:

```text
MIS-002/M01/F01
```

Acceptance Criteria are mandatory at:

- Mission;
- Milestone;
- Feature.

Child completion never closes the parent automatically.

### Supersede

Do not retain a planning format that:

- hides Milestone criteria;
- uses prose as mutable state;
- allows execution without exact approval hash;
- lets implementation silently change scope.

## 5. P0–P8 lessons

The legacy phase model captured real concerns:

- discovery;
- planning;
- readiness;
- implementation;
- verification;
- review;
- integration;
- QA;
- closeout.

MNFS preserves the concerns but not a rigid universal phase script.

They are represented through:

- Mission phase;
- Product Milestone Gates;
- Application Services;
- risk-adaptive Gate DAG;
- Capability Realization Gates R0–R8.

## 6. CORE + PROFILE + MISSION

Legacy insight:

```text
generic doctrine alone is insufficient
repository context alone is insufficient
mission prompt alone is insufficient
```

Current mapping:

```text
MNFS Engineering Constitution
+
Repository Profile
+
Approved Mission Contract
+
applicable Standards / Golden Path
→ Context Pack and Verification Plan
```

This is preserved as a constitutional architecture.

## 7. Write DAG and seam ownership

Preserve:

- dependencies must be explicit;
- independent work may run concurrently;
- mutable seams need ownership;
- composition is a separate phase;
- work must be preserved until integrated or abandoned.

Adapt:

- one Treehouse worktree per concurrent Write Track;
- one Track may realize one or more Features;
- retry does not create a new worktree while trust remains valid;
- Integration queue begins serially;
- external resources are also owned or serialized.

## 8. Contract satisfiability and prerequisites

Preserve as hard gates:

- dependency exists;
- required environment exists;
- proof can be executed;
- open product decisions are resolved;
- scope can satisfy outcome;
- no applicable MUST remains unallocated.

Current implementation:

- Capability Realization R0–R4;
- Mission Planning Readiness;
- Environment readiness;
- exact-hash approval.

## 9. Context Packs

Preserve:

- brief on disk before spawn;
- bounded context;
- role-specific instructions;
- explicit output contract;
- durable source references.

Adapt:

- Current Authority Snapshot precedes session memory;
- packs carry contract/policy/base hashes;
- packs become stale through source changes;
- Documentation Map selects authoritative inputs;
- no transcript rehydration by default.

## 10. Assurance

The legacy `CLAIM / RECEIPT / VERDICT` model is retained and strengthened.

```text
Worker Claim
→ runner-owned Receipts
→ independent Review when applicable
→ Gate Verdict
```

Added:

- Evidence provenance;
- exact target tree;
- freshness/staleness;
- hierarchical criteria;
- Integration and QA evidence;
- Evidence Bundles.

## 11. Review lessons

### Preserve

- implementer and reviewer are distinct when judgment matters;
- review targets a fixed diff/tree;
- Findings require evidence;
- correction remains linked to the Finding.

### Adapt

A second Reviewer is not universal. It is used for:

- security;
- destructive changes;
- targeted refutation;
- classes missed by the first pass.

### Historical warning

Repeated general review passes can:

- consume tokens;
- create style noise;
- conflict without new evidence;
- delay delivery.

## 12. QA and integration

Preserve:

```text
isolated success
≠ composition success
≠ user outcome
```

MNFS formalizes:

- Integration Run;
- candidate SHA;
- Milestone composition criteria;
- QA Journey;
- real environment;
- no `PASS_WITH_ASSUMPTION`.

## 13. Anti-loop and Replan

Preserve:

- retry must produce learning;
- repeated equivalent failure triggers triage;
- contract changes through Replan;
- old attempts remain historical.

Current model:

- Failure Fingerprint;
- Attempt;
- Correction;
- supersession;
- Autonomy Budget;
- blind third retry blocked.

## 14. Sessions and durable state

Preserve:

- session can die;
- durable work must survive;
- handoff uses artifacts;
- state is not reconstructed from terminal output.

Adapt:

- Pi JSONL is exact session history;
- Observational Memory is supporting only;
- SQLite is operational authority;
- Git is code authority;
- Treehouse is physical worktree authority;
- Reconcile compares expected and observed reality.

## 15. Token economy

Field evidence retained:

- giant prompts drift;
- repeated full-repo scans waste context;
- reviewer overlap wastes cost;
- durable summaries need sources;
- fresh Sessions can be cheaper than preserving contaminated context.

Current controls:

- Context Budget;
- progressive disclosure;
- role-specific packs;
- token accounting;
- AS-01 memory comparison;
- total cost includes Observer/Reflector/Dropper.

## 16. Superseded legacy mechanics

The following do not enter the Pi-first runtime by default:

- Claude Code-specific hooks;
- Claude-specific command/session routing;
- transcript as recovery source;
- watcher matrices without a named consumer;
- multi-harness compatibility layer;
- universal dual gates;
- automatic closure from worker messages;
- framework abstractions without a second consumer.

## 17. Adoption summary

```text
PRESERVE
→ constitutional truths proven by field use

ADAPT
→ useful workflow expressed through current domain and Pi adapters

HISTORICAL
→ evidence that informs calibration but does not govern runtime

SUPERSEDE
→ mechanics incompatible with Pi-first, deterministic MNFS authority
```
