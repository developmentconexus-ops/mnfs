---
id: PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
title: Architecture Reconciliation and ARR Spike Program Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - TRACKING-DECISIONS
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DOC-PRODUCT-BLUEPRINT
  - DOC-CAPABILITY-ROADMAP
  - CAP-EXECUTION
tracking_issue: 23
last_reviewed: 2026-08-07
---

# Architecture Reconciliation and ARR Spike Program Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile D-011 through D-016 into coherent canonical authority, execute the minimum deciding Architecture Spikes needed to select the Agent Runtime and local Execution Environment, and return Product M2 to an evidence-backed Replan path without implementing superseded `MIS-002/M02` revision 5.

**Architecture:** Preserve the accepted MNFS Thin Sovereign Semantic Kernel and historical M0/M1/M01 Evidence. Reconcile provider-neutral semantics before candidate execution, then use candidate-independent spike contracts and identical fixtures to select concrete runtime/environment realizations. Freeze each spike only after its prerequisites are known; keep S1/S2 implementations concrete rather than creating speculative provider frameworks.

**Tech Stack:** Node.js 24.18.0+, TypeScript 5.9 strict mode for MNFS product code, Node ESM for isolated spike harnesses where appropriate, `node:test`, Git CLI, SQLite, Ubuntu WSL2, canonical JSON/SHA-256, current documentation generator/validator, candidate-specific public APIs only after exact provenance is frozen by the relevant spike plan.

## Global Constraints

- Govern this program by D-010 through D-016 and `DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` version `1.0.0`.
- Preserve M0, M1 and accepted `MIS-002/M01`; never rewrite their accepted Evidence to pretend it proved a different realization.
- Preserve `MIS-002` revision 5 and `CAP-EXECUTION` 0.1.0 as immutable historical/current authority until explicitly superseded through the post-Spike Replan; do not implement revision-5 M02.
- Preserve canonical Ubuntu WSL2 as the local host unless a later Operator Decision explicitly changes D-002/D-015.
- Do not select an Agent Runtime, process sandbox, microVM, workspace substrate or remote provider before the deciding Spike for that concern.
- Every comparative Spike defines the candidate-independent Validation Baseline, fixture, Evidence schema, failure conditions and stopping rule before any candidate run.
- If a common Spike contract changes materially after one candidate runs, invalidate affected comparison Evidence and rerun all affected candidates under the same contract revision.
- Semantics remain provider-neutral; implementations stay concrete. Do not build `*ProviderFactory`, plugin registries or generalized runtime/environment frameworks without a second real production consumer.
- Candidate dependencies require exact version/commit provenance, public/supported boundary review, license/sovereignty record and Removal Conditions before a selecting Decision.
- Worker/model self-assessment never counts as deciding Evidence.
- Fresh Actor/Lead recovery must not depend on runtime transcript/session resume.
- No Spike may silently gain network, credential or external-effect authority beyond its approved contract.
- All real host/candidate operations remain prohibited until the exact Operator gate for that Spike is issued.
- Plan approval alone authorizes no candidate execution, no production Worker dispatch, no M02 implementation and no automatic merge/delivery.

---

## Program dependency graph

```text
Accepted D-016
   ↓
A. Semantic/authority reconciliation
   ↓
B. Common Spike governance + Evidence contracts
   ↓
C. ARR-S0 Host Capability Probe
   ↓
   ├─────────────┐
   ▼             ▼
D. ARR-S1        E. ARR-S2
Agent Runtime    Execution Envelope
   │             │
   └──────┬──────┘
          ▼
F. ARR-S2W Workspace — only if S2 Decision says required
          ↓
G. ARR-S3 Vertical Composition
          ↓
H. Substrate Selection Decision
          ↓
I. Blueprint/ADR/CAP-EXECUTION/MIS-002 final reconciliation
          ↓
J. new M2/M02 R5 Execution Design + implementation plan
```

`ARR-S1` and `ARR-S2` may be planned/executed independently after S0, but neither may feed S3 until both selecting Decisions are accepted and any required S2W is resolved.

---

## Phase A — Pre-Spike semantic and authority reconciliation

### Task A1: Reconcile MCRM with accepted execution-planning semantics

**Files:**
- Modify: `docs/product/CAPABILITY-REALIZATION-METHOD.md`
- Test/validate: `scripts/validate-docs.mjs`
- Test/validate: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Consumes: D-011, D-014, D-016; current R0-R8 MCRM.
- Produces: one canonical MCRM flow where R3 contains sourcing, R4A defines Validation Baseline before R4B decomposition, R5 is Execution Design & Readiness, and R6 is the bounded Agent Execution Loop.

**Coverage:** D-011, D-014, D-016.

- [ ] **Step 1: Add a documentation regression test that fails against the old MCRM wording**

Extend `scripts/test-documentation-tooling.mjs` with assertions that the canonical MCRM source contains all of these exact conceptual markers:

```text
R4A — Validation Baseline
R4B — Decomposition and Allocation
Fresh Actor
HANDOFF_REQUIRED
OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT
```

and preserves the existing R0-R8 top-level lifecycle rather than creating a competing method.

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

Expected: failure because the current MCRM has not yet incorporated the accepted D-016 semantics.

- [ ] **Step 3: Update the canonical MCRM source**

Modify the existing R3-R6 sections rather than appending a second lifecycle. Add:

```text
R3  Capability + Architecture + Sourcing Design
R4A Validation Baseline
R4B Decomposition + Allocation
R5  Execution Design & Readiness
R6  Agent Execution Loop with Continuous Coverage
```

Preserve R0/R1/R2/R7/R8 semantics unless the accepted planning design explicitly strengthens them.

- [ ] **Step 4: Add the Execution Planning Completeness projection definition**

Document that it is derived from MCRM applicability + Validation + sourcing + Repository Profile + R5 + Environment + Verification Plans and is never a second manual checklist source.

- [ ] **Step 5: Run GREEN and full docs validation**

```bash
npm run docs:test
npm run docs:check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/product/CAPABILITY-REALIZATION-METHOD.md scripts/test-documentation-tooling.mjs
git commit -m "docs: align MCRM with agent execution planning"
```

**Termination:**
- `SUCCESS`: canonical MCRM and docs tests express D-011/D-014/D-016 without a second lifecycle.
- `REPLAN_REQUIRED`: required semantics cannot be represented without changing an accepted higher-level Decision.

---

### Task A2: Create replacement ADRs for already-decided provider-neutral architecture

**Files:**
- Create: `docs/adr/0013-wsl2-host-and-replaceable-agent-runtime.md`
- Create: `docs/adr/0014-isolated-mutable-workspace-per-write-track.md`
- Create: `docs/adr/0015-property-based-execution-environments.md`
- Modify: `docs/adr/0001-pi-first-wsl2.md`
- Modify: `docs/adr/0003-worktree-write-tracks.md`
- Modify: `docs/adr/0006-security-planes-and-local-execution-isolation.md`
- Modify: `docs/adr/0008-reproducible-and-remote-execution-environments.md`
- Modify: `docs/adr/README.md`

**Interfaces:**
- Consumes: D-012, D-013, D-015.
- Produces: accepted provider-neutral architecture decisions without selecting a concrete S1/S2 winner.

**Coverage:** D-012, D-013, D-015.

- [ ] **Step 1: Add ADR-index regression assertions**

Extend documentation tooling so ADR IDs `ADR-0013`, `ADR-0014`, `ADR-0015` must be indexed when present and every superseded ADR must point to its successor.

- [ ] **Step 2: Write ADR-0013**

Decision:

```text
Ubuntu WSL2 remains the canonical local host.
MNFS Agent Runtime semantics are replaceable.
Runtime Session is observational.
Concrete runtime selection requires ARR-S1 Evidence.
```

`ADR-0013` supersedes `ADR-0001`. Preserve the WSL2 decision while replacing Pi-first product architecture.

- [ ] **Step 3: Write ADR-0014**

Decision:

```text
A WriteTrack owns an independently mutable/integrable workspace semantically.
The physical realization may be worktree/COW/private rootfs/remote volume.
Git result identity remains provider-neutral.
```

`ADR-0014` supersedes `ADR-0003`.

- [ ] **Step 4: Write ADR-0015**

Decision:

```text
Execution Environment = independent properties
(agent placement, location, isolation, workspace, persistence,
network, credential delivery, recovery, result boundary).
Security planes remain separate.
Concrete local envelope selection requires ARR-S0/S2 Evidence.
```

`ADR-0015` supersedes both `ADR-0006` and `ADR-0008`.

- [ ] **Step 5: Mark predecessor ADRs superseded without deleting historical decision text**

Set their metadata/status and reciprocal `superseded_by` fields. Do not rewrite the old Decision body to match the new architecture.

- [ ] **Step 6: Validate**

```bash
npm run docs:check
```

- [ ] **Step 7: Commit**

```bash
git add docs/adr
 git commit -m "docs: supersede tool-specific runtime and environment ADRs"
```

**Termination:**
- `SUCCESS`: old decisions remain readable as history and new ADRs state only already-approved provider-neutral semantics.
- `BLOCKED`: documentation schema cannot express reciprocal supersession without validator change; classify before editing validator behavior.

---

### Task A3: Reconcile Product Blueprint sections that are independent of substrate selection

**Files:**
- Modify: `docs/product/blueprint/01-product-vision.md`
- Modify: `docs/product/blueprint/02-domain-model.md`
- Modify: `docs/product/blueprint/03-lifecycle-flows.md`
- Modify: `docs/product/blueprint/04-engineering-system.md`
- Modify: `docs/product/blueprint/05-system-architecture.md`
- Modify: `docs/product/blueprint/06-roles-authority.md`
- Modify: `docs/product/blueprint/07-quality-evidence.md`
- Modify: `docs/product/blueprint/08-state-recovery.md`
- Modify: `docs/product/blueprint/09-context-memory.md`
- Modify: `docs/product/blueprint/10-security-isolation.md`
- Modify: `docs/product/blueprint/12-capability-roadmap.md`
- Modify: `docs/product/blueprint/13-documentation-governance.md`
- Regenerate: `docs/product/PRODUCT-BLUEPRINT.md`

**Interfaces:**
- Consumes: D-011 through D-016 and ADR-0013..0015.
- Produces: constitutional architecture that no longer names Pi/Treehouse/E0-E4 as the product semantics while intentionally leaving concrete S1/S2 winners open.

**Write boundary:** Blueprint/doc sources only. Do not change `CAP-EXECUTION` 0.1.0 or `.mnfs/missions/MIS-002/plan.json`.

- [ ] **Step 1: Add source-scan regression tests for stale constitutional assumptions**

Extend documentation tooling with narrowly scoped assertions that accepted Blueprint text no longer states as current constitutional truth:

```text
Pi is the canonical/primary execution runtime
one WriteTrack is inherently one worktree
E0 → E4 is the semantic environment ladder
Daytona is the preferred/canonical future remote environment
```

Historical research/ADR text may still contain those strings.

- [ ] **Step 2: Update planning lifecycle**

`03-lifecycle-flows.md` must show:

```text
Intent → Investigation → Validation Baseline → adversarial review
→ decomposition → Execution Design → bounded Actor work → Evidence/Gates
```

- [ ] **Step 3: Update domain and role semantics**

`02-domain-model.md` and `06-roles-authority.md` must distinguish ActorRun from runtime Session, describe `CONTRIBUTES_TO`, role-specific packs, Validator no-write-by-default and Environment/workspace bindings without creating speculative provider entities.

- [ ] **Step 4: Update Engineering System/sourcing**

`04-engineering-system.md` must include capability-first sourcing and dependency admission/removal rules from D-014.

- [ ] **Step 5: Update system architecture/security**

`05-system-architecture.md` and `10-security-isolation.md` must show Thin Sovereign Kernel + replaceable Runtime/Environment substrates and the D-013 property model. Preserve separate Authority/Tool/Environment/Credential/Network/Effect/Evidence planes.

- [ ] **Step 6: Update quality/recovery/context**

`07`, `08`, `09` must preserve Claim/Receipt/Finding/Verdict, fresh recovery without transcript, eager authority + lazy optional context, `HANDOFF_REQUIRED`, and hierarchical validation.

- [ ] **Step 7: Update roadmap/documentation governance text without selecting candidates**

Record ARR-S0..S3 as the active M2 Opportunity-Replan path. Candidate names may appear only as current Spike candidates/reference, not constitutional winners.

- [ ] **Step 8: Regenerate and verify exact generated Blueprint**

```bash
npm run docs:generate
npm run docs:check
```

- [ ] **Step 9: Commit**

```bash
git add docs/product/blueprint docs/product/PRODUCT-BLUEPRINT.md scripts/test-documentation-tooling.mjs
git commit -m "docs: reconcile product blueprint with D-011 through D-016"
```

---

### Task A4: Reconcile roadmap, documentation map, AGENTS and tooling projection

**Files:**
- Modify: `docs/roadmap.md` source if generated from another source as indicated by existing tooling; otherwise modify its canonical source only.
- Modify: `docs/DOCUMENTATION-MAP.md`
- Modify: `AGENTS.md`
- Modify only if needed for consistency: `docs/tooling-adoption.md`
- Update generated projections through existing generators.

**Interfaces:**
- Produces: a fresh-session read path that leads to D-016 and this plan rather than Issue #21/M02 rev5.

- [ ] **Step 1: Update read order/current gate**

A fresh Actor must encounter:

```text
Development Governance
→ MCRM
→ accepted Layered Execution Planning Design
→ current Architecture Realization Review
→ current Program Plan
```

before any superseded M02 implementation plan.

- [ ] **Step 2: Update Product Roadmap active M2 path**

Represent:

```text
reconciliation → S0 → S1/S2 → conditional S2W → S3
→ substrate decision → CAP-EXECUTION/MIS-002 Replan → new M02 R5
```

- [ ] **Step 3: Confirm tooling registry remains projection-only**

Pi/Treehouse/Sandbox Runtime remain incumbents/Evidence where applicable, not selected current architecture.

- [ ] **Step 4: Verify**

```bash
npm run docs:generate
npm run docs:check
```

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md docs/DOCUMENTATION-MAP.md docs/roadmap.md docs/tooling-adoption.md docs/product
 git commit -m "docs: make ARR planning the canonical M2 path"
```

---

## Phase B — Common Spike governance

### Task B1: Define a shared Architecture Spike evidence contract before candidate-specific harnesses

**Files:**
- Create: `schemas/architecture-spike-evidence.schema.json`
- Create: `docs/spikes/ARR-SPIKE-GOVERNANCE.md`
- Modify: `scripts/validate-docs.mjs`
- Modify: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Produces a schema and governance format consumed by ARR-S0, S1, S2, S2W and S3.

**Required evidence identity:**

```text
spikeId
contractVersion
runId
startedAt/finishedAt
canonicalHost identity
source Git commit/tree
candidate identity/provenance (when applicable)
criterion results
raw artifact refs + hashes
limitations
measurements
verdict/disposition input
```

- [ ] **Step 1: Write failing schema/validator tests**

Required tests reject:

- missing contract version;
- candidate runs without provenance;
- artifact refs without SHA-256;
- duplicate criterion IDs;
- PASS with a required criterion `FAIL/BLOCKED/UNKNOWN`;
- report whose declared hashes do not match promoted raw artifacts.

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

- [ ] **Step 3: Implement the schema and validator hook**

Do not encode S1/S2-specific criterion names in the shared schema; keep criterion identity/value generic while binding each run to its immutable Spike contract revision.

- [ ] **Step 4: Write governance rules**

`ARR-SPIKE-GOVERNANCE.md` must define:

```text
candidate-independent contract first
same fixture and deciding criteria
exact provenance
no hidden candidate setup
no test weakening after failure
independent raw Evidence
mechanical verdict derivation
rerun rules after contract revision
```

- [ ] **Step 5: Run GREEN**

```bash
npm run docs:test
npm run docs:check
```

- [ ] **Step 6: Commit**

```bash
git add schemas/architecture-spike-evidence.schema.json docs/spikes scripts
 git commit -m "feat: define architecture spike evidence contract"
```

---

## Phase C — ARR-S0

### Task C1: Execute only after separate S0 plan approval and exact Operator authorization

**Plan:** `docs/superpowers/plans/2026-08-07-arr-s0-host-capability-probe.md`

**Preconditions:**

- Tasks A1-A4 and B1 accepted/merged or explicitly included in the exact S0 base SHA;
- canonical WSL2 checkout clean;
- S0 plan exact version/hash approved;
- Operator authorization names base SHA, plan version and S0 contract version.

**Output:** accepted or rejected S0 Evidence plus a Host Capability Decision that classifies candidate eligibility without selecting a runtime/environment winner.

**No later phase may infer eligibility from prior conversation; consume the promoted S0 Evidence.**

---

## Phase D — ARR-S1 Agent Runtime

### Task D1: Freeze the S1 Validation Contract after S0, then write a dedicated S1 implementation plan

**Files to create after S0:**
- `docs/spikes/ARR-S1-AGENT-RUNTIME-CONTRACT.md`
- `docs/superpowers/plans/<date>-arr-s1-agent-runtime-conformance.md`
- later spike harness under `spikes/arr-s1/`

**Inputs:** D-012, D-014, D-016, accepted S0 Evidence, current runtime source/provenance research.

**Candidate-independent criteria that MUST remain in S1:**

```text
exact cwd and environment control
explicit/deterministic tool-resource inventory
unexpected discovery disabled or deterministically bounded
subscription/provider auth compatibility for the chosen control-side shape
abort/cancellation
bounded streaming/events/output
unambiguous settled/final semantics
process death classification
fresh MNFS recovery without transcript/session resume
structured result/event surface
public/supported boundary
exact provenance/license
MNFS machinery and maintenance eliminated vs added
```

**Required comparison shapes:**

1. Pi incumbent through a supported public SDK/RPC/process boundary, without inheriting uncontrolled host environment.
2. ACP path with OpenCode native ACP.
3. At least one second real ACP implementation before ACP interoperability can PASS; Pi-ACP or Goose is eligible only if current provenance/support satisfies D-014 at plan-freeze time.

**Planning rule:** the dedicated S1 plan must pin exact candidate versions/commits and public API docs immediately before execution. It must not copy versions from this master plan if upstream has changed.

**Decision output:**

```text
SELECT concrete Pi path
or
SELECT ACP boundary + concrete initial runtime
or
BLOCK / REPLAN runtime assumption
```

No generic `AgentRuntimeProvider` framework is authorized by S1 selection alone.

---

## Phase E — ARR-S2 Local Execution Envelope

### Task E1: Freeze the S2 Validation Contract after S0, then write a dedicated S2 implementation plan

**Files to create after S0:**
- `docs/spikes/ARR-S2-EXECUTION-ENVELOPE-CONTRACT.md`
- `docs/superpowers/plans/<date>-arr-s2-execution-envelope-conformance.md`
- later harness under `spikes/arr-s2/`

**Candidate-independent criteria:**

```text
protected host reads denied
protected host writes denied
raw credentials unavailable to untrusted execution
network posture meets contract
child-process containment
fail-closed initialization
exact mutable workspace semantics
Git fidelity
real dependency/typecheck/test workload
crash/restart/reconcile behavior
result-tree extraction
safe cleanup
canonical WSL2 support
startup, disk, repeat-run and maintenance cost
```

**Candidate classes:**

- process incumbent: accepted Anthropic Sandbox Runtime realization;
- process challenger: `nono` if S0 supports its prerequisites;
- Sandlock only if S0 proves its host prerequisites and it can materially alter the process-class decision;
- microVM challenger: BoxLite if S0 proves KVM/platform prerequisites;
- microVM challenger: `smol-machines/smolvm` if S0 proves prerequisites.

Do not execute a candidate that S0 classifies `BLOCKED_BY_HOST` unless a separate Decision authorizes host modification and all comparison fairness rules are updated.

**Decision output:** select one concrete local envelope class/realization or block for new evidence. Whole-agent vs control-side placement is selected only if the S1/S2 combined evidence proves the required capability/credential boundary.

---

## Phase F — ARR-S2W Workspace, conditional

### Task F1: Decide applicability before creating any VFS/AgentFS implementation work

**Input:** accepted S2 Decision.

Create S2W only when the selected envelope lacks an economically sufficient private mutable workspace/result-extraction mechanism.

If NOT_APPLICABLE, record exact rationale:

```text
selected envelope already supplies required isolation/persistence/COW semantics
Git result extraction is sufficient
additional workspace manager would duplicate lifecycle/maintenance
```

If APPLICABLE, dedicated plan compares only candidates that can still alter the decision, normally:

- current Treehouse/native Git worktree mechanics as incumbent/control;
- VFS/AgentFS-style COW only if it eliminates meaningful remaining machinery.

Do not stack Treehouse + VFS by default.

---

## Phase G — ARR-S3 Vertical Composition

### Task G1: Freeze S3 only after S1, S2 and any S2W Decision are accepted

**Files to create later:**
- `docs/spikes/ARR-S3-VERTICAL-COMPOSITION-CONTRACT.md`
- `docs/superpowers/plans/<date>-arr-s3-vertical-composition.md`
- harness under `spikes/arr-s3/` or production-adjacent test location selected by the S3 design.

**Required flow:**

```text
accepted fixed Spike contract
→ provider-neutral M01 semantic core
→ selected Agent Runtime
→ selected Execution Environment/workspace
→ fixed deterministic repository change
→ Claim(baseCommitSha,resultTreeSha)
→ terminate Lead
→ fresh Lead Recovery
→ deterministic Receipt
→ MNFS Gate
→ accepted Git result
→ idempotent safe resource disposition
```

**Hard constraints:**

- S3 is not production M02.
- Runtime Session/transcript cannot be required for Recovery.
- Worker completion cannot grant acceptance.
- S3 must use real selected runtime/environment bytes, not fakes, for deciding integration Evidence.
- deterministic/fake tests may support but cannot replace the real vertical proof.

**Decision output:** architecture realization is ready for authority Replan, or return to the failed selecting Spike/Decision.

---

## Phase H — Post-S3 authority reconciliation

### Task H1: Select substrates and supersede realization-specific authority

**Files:**
- Decision register and new selecting ADR(s) if the selected substrate is architectural enough to warrant an ADR.
- `docs/tooling-adoption.md` projection.
- exact source manifests/provenance Evidence.

Record:

```text
selected runtime boundary and concrete initial runtime
selected local environment realization
selected workspace realization or NOT_APPLICABLE independent workspace
license/sovereignty
public boundary
removal conditions
upgrade policy
known limitations
```

No candidate becomes foundational merely because it won one benchmark dimension; all deciding criteria and total maintenance/leverage must be satisfied.

---

### Task H2: Create superseding CAP-EXECUTION revision

**Files:**
- Modify/supersede according to documentation lifecycle: `docs/capabilities/CAP-EXECUTION/SPEC.md`
- Modify: `TRACEABILITY.json`, `APPLICABILITY.md`, generated `COVERAGE.md`
- Add acceptance/review artifacts required by MCRM.

Preserve provider-neutral requirements from 0.1.0 where still valid; replace Pi/Treehouse/fixed-E1 wording with selected realization bindings only where a concrete binding is required.

Do not relabel historical 0.1.0 Evidence as proof of the superseding realization.

---

### Task H3: Create `MIS-002` superseding revision and new M02 R5 design

**Files:**
- Use existing immutable Mission Replan mechanism; never edit revision 5 in place.
- Create superseding approved revision through exact-hash review.
- Create new M02 R5 Execution Design only after R0-R4 recompute PASS under the new authority.

New contract preserves Product M2 outcome but binds the selected runtime/environment/workspace realization and D-016 planning semantics.

Only after the new contract, R0-R5 approval and a separate implementation-plan gate may production M02 implementation begin.

---

## Program review gates

```text
GATE-P0  This master plan + ARR-S0 plan approved
          → authorizes no execution by itself

GATE-R   Pre-Spike semantic reconciliation accepted
          → still no host/candidate execution

GATE-S0  exact Operator authorization for ARR-S0 only

GATE-S1  S0 Evidence + S1 contract/plan approved
GATE-S2  S0 Evidence + S2 contract/plan approved

GATE-S2W only if applicability = APPLICABLE

GATE-S3  S1/S2/(S2W) selecting Decisions + S3 contract/plan approved

GATE-RP  S3 PASS → substrate Decision + CAP/Mission Replan authority

GATE-M02 new R0-R5 PASS + exact implementation plan approval
```

No lower gate implies a higher one.

---

## Plan self-review checklist

Before this plan may be approved:

- [ ] Every D-011..D-016 Decision has at least one explicit task/constraint consumer.
- [ ] Historical M0/M1/M01/MIS-002 rev5/CAP-EXECUTION 0.1.0 preservation is explicit.
- [ ] No concrete S1/S2 winner is selected in advance.
- [ ] S0 is the only fully executable Spike plan frozen before host evidence.
- [ ] S1/S2 candidate-independent deciding criteria are explicit.
- [ ] S2W is conditional rather than automatic.
- [ ] S3 requires real selected substrates and fresh recovery.
- [ ] No placeholder such as TBD/TODO determines implementation behavior.
- [ ] Every future unresolved detail is represented as a preceding Evidence/Decision dependency, not vague prose.
- [ ] Plan approval cannot be misread as Spike execution authority.

## Execution handoff

After this master plan and the dedicated ARR-S0 plan are approved, the next action is **not** “start all Spikes”. The next action is to issue the exact `GATE-S0` Operator authorization bound to the approved plan versions and canonical base SHA, then execute ARR-S0 only.
