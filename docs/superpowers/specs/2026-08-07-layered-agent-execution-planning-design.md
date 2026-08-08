---
id: DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
title: Layered Agent Execution Planning Design
document_type: execution_planning_design
form: explanation
authority: specification
status: accepted
version: 1.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - TRACKING-DECISIONS
  - DOC-PRODUCT-BLUEPRINT-03
  - DOC-PRODUCT-BLUEPRINT-04
  - DOC-PRODUCT-BLUEPRINT-06
  - DOC-PRODUCT-BLUEPRINT-07
  - DOC-PRODUCT-BLUEPRINT-08
  - DOC-PRODUCT-BLUEPRINT-09
  - DOC-PRODUCT-BLUEPRINT-10
tracking_issue: 23
last_reviewed: 2026-08-08
---

# Layered Agent Execution Planning Design

## 1. Purpose

This design defines how MNFS turns an approved product outcome and architecture into work that AI Actors can execute reliably across bounded context windows without losing authority, omitting requirements, drifting scope, retrying blindly or declaring false completion.

It is the execution-planning consequence of the approved Architecture Realization Review decisions D-011 through D-015.

The central design is:

```text
frozen correctness and authority
        +
versioned execution decomposition
        +
compiled role-specific context
        +
adaptive bounded tactics
        +
independent evidence and gates
```

The design does **not** create a new planning authority beside the MNFS Capability Realization Method (MCRM). It evolves the meaning of MCRM R3 through R6 so that the same requirements, criteria and architecture can be compiled into agent-executable work.

The governing rule is:

> **Freeze what an Actor is not allowed to reinterpret; keep tactical choices adaptive where execution evidence must inform the next action.**

---

## 2. Problem statement

Long-running agentic software work fails in recurring ways:

- an Actor attempts too much work in one context and leaves an incoherent partial state;
- a fresh Actor sees substantial progress and incorrectly infers that the target is complete;
- implementation decomposition influences the definition of correctness;
- a Worker silently expands scope when the repository differs from its initial assumptions;
- repository localization is guessed instead of investigated;
- large context packs dilute the exact authority and constraints that matter;
- a Worker retries a failed idea without a materially new hypothesis;
- process/session completion is treated as domain completion;
- the same context implements and grades its own work;
- individually green units are never validated as a composed system;
- an implementation plan becomes stale but is followed mechanically anyway;
- a highly detailed plan turns into pseudo-code that prevents legitimate adaptation;
- a high-level plan leaves too many architecture and safety decisions to the Worker.

MNFS already contains strong primitives that address much of this problem: hierarchical criteria, MCRM traceability, immutable approved contracts, WriteTrack/Attempt/ActorRun identity, Current Authority Snapshot, Claim/Receipt/Verdict separation, independent Recovery, Engineering Standards, Golden Paths, Environment policy and explicit Replan.

The missing layer is a precise contract between those product semantics and the bounded work handed to an AI Actor.

---

## 3. Evidence basis and interpretation

This design uses external evidence as input, not as product authority.

### 3.1 Long-running agent work benefits from incremental bounded progress

Anthropic's long-running agent harness experiments report two recurring failures: agents attempting too much work in one context and later sessions prematurely concluding the larger task is complete. Their successful harness shape uses incremental feature work, externalized progress and clean handoffs between contexts.

Reference: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

MNFS interpretation:

```text
one bounded execution outcome
→ one evidence-producing work cycle
→ externalized authoritative state
→ next Actor does not infer completion from appearance
```

MNFS does not adopt free-form progress notes as authority because SQLite, Git, Approved Contracts, Claims, Findings and Evidence already provide stronger structured state.

### 3.2 Context is finite and must be curated

Anthropic's context-engineering guidance treats context as a limited resource and recommends selective retrieval / progressive disclosure rather than loading every potentially useful artifact eagerly.

Reference: [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

MNFS interpretation:

```text
mandatory authority and target context
→ eager

large optional repository/tool/history context
→ discoverable and lazy
```

Authority may never be hidden behind lazy retrieval.

### 3.3 Correctness before decomposition and independent validation

Factory Missions defines mission-level correctness before Features and uses fresh Workers and Validators with externalized shared state. Validators report gaps rather than silently repairing the implementation they judge.

Reference: [How Missions Work](https://factory.ai/news/missions-architecture)

MNFS interpretation:

- Mission Criteria + Verification Plans remain the Validation Contract role approved by D-011;
- decomposition follows correctness;
- Workers claim; independent Actors and deterministic runners verify;
- Findings route through MNFS semantics rather than giving Validator context hidden implementation authority.

### 3.4 Agent runs need explicit exit/failure boundaries

OpenAI's practical agent guidance treats a run as a loop with exit conditions and recommends escalation after failure thresholds or before high-risk operations.

Reference: [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

MNFS interpretation:

Every execution unit declares explicit `SUCCESS`, `BLOCKED`, `ESCALATE` and `REPLAN_REQUIRED` termination conditions. Resource or retry budget exhaustion can never imply success.

### 3.5 Interface design and localization affect coding-agent performance

SWE-agent demonstrates that the agent-computer interface materially affects software-engineering performance. More recent repository-level research separates localization from resolution and uses selective repository traversal plus adaptive implementation planning.

References:

- [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793)
- [SWE-Adept: Deep Codebase Analysis and Structured Issue Resolution](https://arxiv.org/abs/2603.01327)

MNFS interpretation:

- repository localization is a planning input when loci are uncertain;
- an implementation Worker should not receive guessed file paths as frozen truth;
- tool/capability surfaces are part of execution design;
- tactical planning may adapt to observations while authority remains frozen.

### 3.6 Harness assumptions must remain falsifiable

Anthropic's later long-running harness work emphasizes that harness components encode assumptions about what the model cannot do and those assumptions can become stale as models improve.

Reference: [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)

MNFS interpretation:

The execution-planning method defines invariants and evidence boundaries, not unnecessary permanent ceremony. Planning depth is risk-proportional, and model/runtime capabilities may simplify mechanics without weakening authority, correctness or proof.

---

## 4. Design principles

The following principles are normative for this design.

1. **Correctness before decomposition.**
2. **Frozen authority, adaptive tactics.**
3. **One bounded outcome per execution unit.**
4. **Every execution unit traces upward to approved correctness.**
5. **No unresolved architecture decision is delegated to a Writer task.**
6. **Proof-first always; test-first where the proof method is executable testing.**
7. **Fresh Actor orientation must be sufficient without prior conversation.**
8. **Implementer completion never grants acceptance.**
9. **Small eager context plus progressive disclosure for optional context.**
10. **Repository localization precedes implementation when loci are materially uncertain.**
11. **Environment, tools, write boundaries and resource authority are explicit before dispatch.**
12. **Workers cannot silently expand network, credential, effect, write or architecture authority.**
13. **Retries require bounded policy; repeated hypotheses require new evidence.**
14. **Every unit has explicit success, block, escalation and Replan termination.**
15. **Parallelism follows proven independence, not agent availability.**
16. **Handoffs communicate current structured truth, not conversational history.**
17. **Planning completeness is mechanically derived from existing applicability and coverage sources.**
18. **Milestone composition receives its own validation.**
19. **Mission closure validates the original Operator outcome, not only child completion.**
20. **Execution learnings feed governed Calibration; they do not mutate policy automatically.**
21. **Planning completeness means no material hidden decision is left accidentally to the Actor; it does not mean maximum detail, mechanism, ceremony or hypothetical future hardening.**

---

## 5. Four planning layers

The execution-planning architecture separates four layers by stability and authority.

```text
L0 — Validation Baseline          frozen correctness
L1 — Realization Baseline         frozen approved architecture for the run
L2 — Execution Graph              versioned bounded decomposition
L3 — Tactical Agent Plan          adaptive, ephemeral reasoning
```

### 5.1 L0 — Validation Baseline

L0 answers:

> What must be true for this Mission or bounded target to be correct?

It is compiled from approved product/mission semantics and contains, as applicable:

- Operator outcome;
- Mission Acceptance Criteria;
- applicable Milestone Criteria;
- negative assertions and invariants;
- Verification Plans;
- Golden Proof / validation scenario;
- deciding failure/security/recovery drills;
- non-goals;
- risk and Authority boundaries.

L0 is not a duplicate authoritative `ValidationContract` entity. It is a compiled role of existing criteria, verification plans and approved constraints, consistent with D-011.

A Worker cannot amend L0. Evidence that L0 is wrong or incomplete routes to Decision/Replan.

### 5.2 L1 — Realization Baseline

L1 answers:

> Which approved architecture and capability realizations are allowed to satisfy L0 for this execution?

It contains, as applicable:

- accepted Architecture Decisions;
- selected sourcing decisions (`OWN / ADOPT / ADAPT / ...`);
- domain boundaries and public interfaces;
- selected concrete Agent Runtime boundary;
- selected Execution Environment properties and concrete realization;
- persistence and Git/result model;
- security/credential/network/effect constraints;
- compatibility/migration constraints;
- rollout/recovery constraints;
- exact pinned dependency provenance required by the approved realization.

L1 may be superseded only by governed Decision/Replan. A Worker may not replace a selected dependency, architecture boundary or security property because another implementation appears easier.

### 5.3 L2 — Execution Graph

L2 answers:

> What bounded work units, dependencies and proofs will realize the approved criteria under L1?

Conceptually:

```text
Mission
  → Milestones
    → Features
      → bounded execution units where needed
```

A new permanent `ExecutionUnit` domain entity is **not** required by this design. Usually a Feature is the execution unit. A large Feature may be decomposed into implementation tasks in the approved R5 design when those tasks each deserve an independent implementation/proof/review cycle.

L2 is versioned execution planning. Material changes to dependency order, scope allocation, interface contracts, write/resource sets or proof responsibility must be recorded through the appropriate design/Replan mechanism rather than existing only in a Worker transcript.

### 5.4 L3 — Tactical Agent Plan

L3 answers:

> Given current observations, what should this Actor do next within its frozen bounds?

Examples:

```text
inspect module A
reproduce failure B
form hypothesis C
run targeted probe D
edit implementation E
re-run deciding proof
```

L3 is deliberately ephemeral and adaptive.

An Actor may change L3 without Replan when new observations invalidate a local hypothesis, provided the new approach remains inside L0/L1/L2 authority and scope.

A runtime Session may lose L3 entirely without losing domain truth.

### 5.5 Stability rule

```text
L0 correctness       MUST NOT drift during execution
L1 realization       MUST NOT drift silently
L2 execution graph   changes only through versioned planning authority
L3 tactical plan     MAY adapt freely inside L0-L2 bounds
```

---

## 6. MCRM integration

This design evolves MCRM rather than creating another method.

### 6.1 R0 — Baseline

Preserve current purpose.

R0 additionally confirms that D-011 through D-015 and any later reconciliation Decisions relevant to the Capability are included in the baseline.

### 6.2 R1 — Applicability

Preserve current applicability domains.

R1 remains the primary defense against forgotten concerns. Every domain is dispositioned as:

```text
APPLICABLE
NOT_APPLICABLE + rationale
DEFERRED + destination/rationale
```

Nothing material remains implicitly unassessed.

### 6.3 R2 — Requirements

Preserve current requirement quality and traceability rules.

Requirements should remain free of hidden implementation choices unless the implementation itself is an approved constraint.

### 6.4 R3 — Capability, Architecture and Sourcing Design

R3 expands the existing Capability Design obligation.

Every material realization decision must additionally record:

- sourcing disposition;
- named consumer;
- machinery eliminated;
- authority boundary;
- candidate/baseline comparison;
- license/sovereignty impact;
- proof required before adoption;
- removal/replacement conditions.

This integrates D-014 directly into MCRM.

### 6.5 R4A — Validation Baseline

R4 is logically split without requiring a new top-level MCRM numbering scheme in storage immediately.

R4A defines correctness before decomposition.

Required outputs:

- Mission-level correctness statements;
- Verification Plans;
- negative/invariant coverage;
- parent outcome validation scenarios;
- Golden Proof;
- deciding drills;
- explicit non-goals.

Gate:

> Correctness must be reviewable without relying on a planned implementation structure.

A criterion that merely restates a chosen implementation is challenged unless that implementation is itself a product/architecture constraint.

### 6.6 R4B — Decomposition and Allocation

Only after R4A is coherent does planning create Milestones, Features and their child criteria.

Required properties:

- every applicable MUST is allocated or explicitly dispositioned;
- every Feature has a parent outcome/criterion/requirement;
- child work declares upward contribution lineage (`CONTRIBUTES_TO` or equivalent);
- parent criteria retain composition/outcome semantics not reducible to child aggregation;
- dependency graph is satisfiable;
- no implementation unit exists only because it is technically interesting.

### 6.7 R5 — Execution Design & Readiness

R5 evolves from Milestone Microdesign into the complete design needed for bounded Actor execution.

R5 includes current microdesign content plus:

- repository localization evidence;
- exact or bounded implementation loci;
- selected sourcing realization and provenance;
- Execution Graph;
- unit sizing rationale;
- interfaces consumed/produced;
- write-set and shared-resource boundaries;
- environment and tool/capability contract;
- context compilation plan;
- proof-first implementation sequence;
- finite retry/hypothesis policy;
- success/block/escalation/Replan termination;
- handoff/recovery expectations;
- parallelism classification;
- exact verification commands or bounded verification procedure;
- documentation and traceability impact.

#### R5 fresh-Actor readiness test

R5 is not ready unless this statement is true:

> **A technically capable Actor with a completely fresh context can receive the compiled pack, orient itself, prove the starting baseline, execute the bounded unit, know when it must stop, and produce a valid Claim without requiring the previous conversation.**

If that statement is false, the design/context contract is incomplete.

### 6.8 R6 — Agent Execution Loop

R6 becomes the bounded execution loop:

```text
fresh Actor orientation
→ baseline proof
→ tactical observe/hypothesize/probe
→ proof-first implementation
→ local deciding proof
→ regression proof
→ Claim
→ deterministic Receipts
→ independent validation when required
→ Finding routing
→ Correction / new Feature / Replan
```

Continuous coverage remains mandatory.

### 6.9 R7 — Verification and Validation

Preserve the existing verification and validation matrices.

R7 additionally checks that:

- Worker self-assessment was never used as acceptance Evidence;
- required fresh/independent review actually used independent context;
- parent composition was exercised at the required level;
- no budget exhaustion or blocked state was converted into PASS;
- every deciding unit/criterion has current Evidence bound to the correct Git/result/contract identities.

### 6.10 R8 — Closeout and Learning

Preserve current closeout semantics.

Execution-planning learnings may propose:

- changed default unit sizing;
- Context Compiler changes;
- tool-surface changes;
- retry budget changes;
- Standard or Golden Path updates;
- new Evaluation cases.

No learning mutates an accepted policy automatically; Calibration remains governed.

---

## 7. Execution Planning Completeness Gate

The project must not create a second manually maintained checklist beside MCRM.

Instead, an Execution Planning Completeness projection is compiled from existing sources:

```text
MCRM Applicability
+ Validation coverage
+ Capability/Architecture sourcing
+ Repository Profile
+ R5 design
+ Execution Environment policy
+ Verification Plans
```

The projection assesses at least these concerns:

| Concern | Required planning question |
|---|---|
| Product/outcome | Is the intended observable outcome explicit? |
| Validation | Is correctness defined before implementation decomposition? |
| Domain | Are affected entities/invariants/lifecycles known? |
| State/persistence | Are transactions, migrations and durability implications resolved? |
| API/contracts | Are consumed/produced interfaces explicit? |
| Architecture | Are all architecture decisions resolved or separately blocked? |
| Sourcing | Is each material implementation shape classified and justified? |
| Repository localization | Are loci known, or is investigation explicitly allocated? |
| Security | Are trust boundaries and prohibited operations explicit? |
| Execution Environment | Are required environment properties and selected realization known? |
| Credentials/network/effects | Are grants/postures/effect levels explicit? |
| Recovery/idempotency | Are crash windows, retries, fencing and reconcile behavior known? |
| Concurrency/resources | Are shared resources and ownership/serialization known? |
| Write boundary | Is allowed mutation scope explicit enough to detect expansion? |
| Context | Is eager authority context complete and lazy context discoverable? |
| Tools/capabilities | Is the Actor tool surface deterministic/approved enough for the risk? |
| Verification | Does each deciding criterion have a proof owner/method? |
| Independent review | Is required Reviewer/Validator independence specified? |
| Integration | Is composition proof specified where children interact? |
| Live QA | Is user-facing/system validation allocated when applicable? |
| Observability | Are required events/logs/metrics/Evidence references known? |
| Compatibility/migrations | Are old state/version/upgrade/downgrade concerns dispositioned? |
| Rollout/rollback | Is safe introduction/removal/recovery described when applicable? |
| Documentation | Are affected normative and operator documents dispositioned? |
| Budgets/termination | Are finite failure/retry boundaries and stop states explicit? |
| Handoff | Can a fresh Actor reconstruct current truth without transcript dependency? |
| Replan triggers | Are material discoveries that require new authority named? |

Every applicable concern must be represented through an existing authoritative source or a deliberate `NOT_APPLICABLE` / `DEFERRED` disposition with rationale.

The gate is a projection, not another source of truth.

---

## 8. Execution Unit Contract role

Each bounded implementation unit receives an **Execution Unit Contract role**, normally compiled into the existing Writer Pack. This design does not require a new durable domain entity unless later implementation evidence demonstrates an independent identity/lifecycle need.

The contract contains the following categories.

### 8.1 Identity and authority

- Mission identity;
- Milestone identity;
- Feature/target identity;
- WriteTrack identity;
- current Attempt identity;
- ActorRun identity when known at dispatch;
- exact approved contract hash;
- relevant policy/realization hashes;
- exact Git base identity.

### 8.2 Purpose

One bounded statement answering:

> What must this unit make true?

### 8.3 Upward lineage

The unit must trace to its approved reason for existence:

```text
unit / Feature Criterion
  CONTRIBUTES_TO
Milestone Criterion / requirement
  CONTRIBUTES_TO
Mission Criterion / outcome
```

No upward consumer means the unit is an orphan and cannot be dispatched without disposition.

### 8.4 Preconditions

Examples:

- prerequisite Features accepted;
- required schema/contract available;
- required base tree current;
- selected dependency/environment available;
- required Operator Decision resolved;
- previous migration/integration state present.

### 8.5 Repository/localization evidence

The pack includes known relevant loci and why they are relevant.

If important loci remain uncertain, the plan allocates an Investigation/Localization activity rather than freezing guessed paths as implementation truth.

### 8.6 Write and resource boundary

The pack declares:

- allowed/expected mutation scope;
- forbidden/protected paths;
- shared resource ownership;
- serialization requirements;
- ports/databases/processes/services that may be touched;
- environment-owned temp/cache locations.

The boundary may be expressed as exact paths where knowledge is strong or bounded areas where implementation discovery legitimately decides exact files.

Any materially larger scope requires escalation before mutation.

### 8.7 Interface constraints

The pack declares relevant consumed/produced contracts, for example:

- public function signatures;
- HTTP/API schemas;
- events;
- persistence schema constraints;
- DTO/types;
- file/artifact formats;
- composition roots;
- compatibility promises.

A Worker may choose private implementation details but cannot silently redefine the interfaces it was tasked to satisfy.

### 8.8 Engineering constraints

Compiled from applicable:

```text
Repository Profile
+ Engineering Standards
+ Golden Path
+ approved Waivers
```

Only relevant controls are eager. The full Engineering System remains discoverable.

### 8.9 Environment and tool contract

The pack binds the execution properties selected under D-013, including as applicable:

- agent placement;
- compute/environment identity;
- mutable workspace binding;
- allowed tools/capabilities;
- network posture;
- credential posture;
- external-effect authority;
- process/resource limits;
- policy hash/provenance.

The Worker cannot enable Internet, add credentials, bypass the broker or escalate effect authority because the implementation would be easier.

### 8.10 Sourcing constraints

Relevant D-014 realization constraints are explicit.

Examples:

- use selected Git primitives instead of implementing a custom merge engine;
- do not introduce another Agent Runtime during an approved runtime-specific slice;
- do not replace a selected dependency without Decision/Replan;
- do not build generic provider abstractions without the required second consumer.

### 8.11 Verification contract

Before implementation starts, the unit states:

- which proof is expected to fail at baseline when applicable;
- what constitutes GREEN/pass;
- which regression set must remain green;
- which integration seam must be exercised;
- which Evidence/Receipt must be produced;
- who owns each proof;
- which proof is advisory vs deciding.

Rule:

> **Proof-first is universal; TDD is required when TEST is the correct deciding proof method and a meaningful failing test can be established before implementation.**

`INSPECTION`, `ANALYSIS`, `DEMONSTRATION`, `LIVE_QA`, `FAILURE_DRILL` and `SECURITY_DRILL` remain valid proof methods where tests are not the right semantics.

### 8.12 Termination contract

Every unit explicitly defines:

```text
SUCCESS WHEN ...
BLOCKED WHEN ...
ESCALATE WHEN ...
HANDOFF_REQUIRED WHEN ...
REPLAN_REQUIRED WHEN ...
```

Typical `SUCCESS` requires all deciding local proofs, a valid Git result identity and a structurally complete Claim. It never means “the model believes the task is done.”

`BLOCKED` covers unavailable prerequisites or environment/tool failures that cannot be solved inside current authority.

`ESCALATE` covers finite-budget exhaustion, ambiguous observations or a required decision that does not necessarily change the contract.

`HANDOFF_REQUIRED` covers a healthy but unfinished bounded unit when remaining context/runtime budget is too low to continue safely; the Actor records current structured observations, work/result identity, proofs already run, unresolved hypothesis and the exact next permitted action, then stops without claiming completion.

`REPLAN_REQUIRED` covers material contract/architecture/security/scope changes.

### 8.13 Budget contract

Each unit has finite resource/failure budgets appropriate to risk, such as:

- context budget class;
- runtime/cost budget class;
- tool-action budget or guard threshold where useful;
- hypothesis/correction budget;
- external API/cost budget where relevant.

This design deliberately does not freeze universal numeric values. Exact defaults belong to future Role/Repository Profile/Execution Environment policy because different runtimes and task classes have materially different cost structures.

Budget exhaustion produces `BLOCKED`, `ESCALATE` or `HANDOFF_REQUIRED` according to condition, never success.

### 8.14 Output contract

A Writer must emit a structured Claim containing at least the fields already required by MNFS plus planning-specific declarations where applicable:

- requirements addressed;
- criteria claimed;
- Git base/result identity;
- files/areas changed;
- tests/proofs executed;
- Evidence references;
- documentation impact;
- design deviations;
- newly discovered derived requirements;
- unresolved unknowns;
- requested correction/Replan disposition when it could not finish cleanly.

---

## 9. Context Compiler design

### 9.1 Eager context

Every Actor receives enough high-signal context to understand current authority and target without searching for it:

- Role Contract;
- target identity and bounded purpose;
- Current Authority Snapshot;
- relevant Validation Baseline criteria;
- role-specific compiled contract / pack;
- relevant architecture/interface constraints;
- write/resource boundary when the Role may mutate;
- Environment/tool/security contract;
- verification and termination contract;
- current Git/base/result identities;
- current blockers/Findings that directly apply.

### 9.2 Role-specific compiled packs

The same L0/L1 authority is projected differently by Role so Actors receive only the information and capabilities needed for their responsibility.

#### Lead Pack

Contains:

- Mission/Milestone status and deciding criteria;
- current coverage gaps;
- Decisions/Attention items;
- active Attempts/ActorRuns/Findings;
- Recovery/reconcile observations;
- permitted next orchestration actions.

Lead does not receive implementation write authority merely because it orchestrates.

#### Investigator / Localization Pack

Contains:

- question/hypothesis being investigated;
- known repository/profile boundaries;
- read-only or specifically bounded probe capabilities;
- expected Evidence output;
- explicit prohibition on turning investigation into unapproved implementation.

#### Planner Pack

Contains:

- Validation Baseline;
- applicable requirements;
- architecture/sourcing constraints;
- localization Evidence;
- dependency/resource information;
- required proof/coverage outputs.

Planner may propose L2 but cannot alter L0/L1 without Decision/Replan.

#### Writer Pack

Contains the Execution Unit Contract defined in Section 8 and only the relevant context/capabilities needed to produce a Claim.

#### Reviewer / Validator Pack

Contains:

- criteria and proof obligations being judged;
- Claim/result identity;
- deterministic Receipts/Evidence;
- relevant Standards/interfaces;
- read-only or specifically approved diagnostic capabilities;
- no implementation rationale/context that is unnecessary for independent judgment;
- no write authority by default.

#### Integrator Pack

Contains:

- accepted child result identities;
- composition target/base;
- conflict/integration policy;
- parent Milestone Criteria;
- integration proof requirements;
- explicit prohibition on silently fixing rejected child behavior during integration.

#### QA Pack

Contains:

- persona/Journey;
- deployed/composed result identity;
- user-visible outcome criteria;
- environment/effect authority;
- required Evidence capture;
- no authority to redefine acceptance based on convenience.

### 9.3 Lazy / progressive-disclosure context

Large optional material remains discoverable but is not injected by default:

- full Product Blueprint;
- unrelated Standards/Golden Paths;
- whole-repository documentation;
- long research reports;
- full API/vendor documentation;
- unrelated Features/Findings;
- historical Sessions/transcripts;
- full skills/MCP/tool schemas that the Actor does not currently need.

A compact capability/repository index may be eager so the Actor knows what it can retrieve.

### 9.4 Authority is never lazy

No Actor may be expected to discover the current contract, current Attempt, allowed actions, security policy or deciding criteria by searching the repository heuristically.

### 9.5 Context freshness

Compiled packs bind to the exact current authority/hash/state needed by the run. Stale packs are rejected before protected work.

---

## 10. Fresh Actor orientation protocol

A fresh ActorRun follows a deterministic orientation sequence before implementation:

```text
1. validate current Authority Snapshot and approved hash
2. validate target / Attempt / ActorRun binding
3. validate Git base + mutable workspace + Environment identity
4. load the role-specific compiled contract/pack
5. load eager context and compact capability index
6. inspect the planned repository loci / perform bounded localization
7. execute the required baseline/smoke/failing proof
8. classify any divergence before mutation
9. begin tactical execution only when the baseline is coherent
```

If the required baseline unexpectedly passes for a change that should start RED, or fails for an unrelated reason, the Actor stops and classifies the discrepancy rather than forcing implementation forward.

This protocol makes a runtime Session replaceable. Resume may accelerate work but is never required for correctness.

---

## 11. Tactical execution model

Within L0-L2 bounds, the Worker uses an adaptive evidence-driven loop:

```text
OBSERVE
  ↓
HYPOTHESIZE
  ↓
PROBE / TEST
  ↓
CLASSIFY RESULT
  ↓
ACT
  ↓
RE-VERIFY
```

Tactical steps are not pre-authorized code edits simply because they appeared in a plan. Each action remains subject to the current capability/environment/write policy.

### 11.1 What the Worker may adapt without Replan

Normally permitted inside bounds:

- inspection order;
- local implementation strategy;
- private helper/module structure;
- exact test implementation;
- local tool sequence;
- which of several already-approved private approaches is attempted first.

### 11.2 What requires versioned execution-design change or escalation

Examples:

- materially different write/resource scope;
- new dependency between execution units;
- changed public/interface contract;
- new shared resource/serialization requirement;
- proof responsibility materially changes;
- original localization was wrong enough to invalidate the approved unit boundary.

### 11.3 What requires Mission/Architecture Replan

Examples:

- Acceptance Criterion changes;
- Mission/Milestone outcome changes;
- public contract changes outside approved change scope;
- new Architecture Decision;
- new foundational/material dependency;
- changed Execution Environment security property;
- credential/network/effect authority escalation;
- changed risk class;
- non-goal becomes required scope;
- approved realization cannot satisfy correctness.

---

## 12. Retry, hypothesis and correction policy

### 12.1 Mechanical retry

Allowed only when:

- failure is classified as transient/mechanical;
- action is safe to retry or idempotently fenced;
- policy permits retry;
- finite retry budget remains.

Examples include bounded lock contention or explicitly retryable provider transport failures.

### 12.2 Implementation hypothesis retry

When an implementation hypothesis fails, the next hypothesis must be materially different and justified by new observation/evidence.

The following is not legitimate progress:

```text
same hypothesis
+ cosmetic edit
+ same failure
+ repeat
```

Planning defines a finite hypothesis/correction budget appropriate to the unit. A conservative profile may force fresh diagnostic perspective after a small number of materially distinct failed hypotheses; exact numbers are realization/profile decisions, not universal semantics.

### 12.3 Correction round

A rejected Claim normally creates a governed correction path:

```text
Finding
→ Correction Contract
→ new/current permitted Attempt according to lifecycle policy
→ fresh or reoriented Writer
→ new Claim
```

The Validator does not silently patch the code it judged.

### 12.4 Escalation

Repeated failure, contradictory observations, budget exhaustion or a requirement that exceeds current authority produces structured attention to the Lead/Operator rather than indefinite autonomous looping.

### 12.5 Safe context-boundary handoff

An Actor approaching its usable context/runtime budget while the unit remains healthy but unfinished must prefer `HANDOFF_REQUIRED` over rushing a Claim.

Required handoff facts are structured and source-backed:

- current authoritative target/Attempt/ActorRun;
- current Git/workspace/result observation;
- work completed but not accepted;
- proofs run and exact outcomes;
- current unresolved hypothesis/observation;
- remaining known steps or next diagnostic action;
- blockers/risks;
- whether another Actor may continue under the same Attempt according to lifecycle policy.

The next Actor re-runs Fresh Actor orientation and does not inherit confidence or completion claims from the prior Session.

---

## 13. Validation and Reviewer independence

### 13.1 Writer

Produces implementation and Claim.

### 13.2 Deterministic Runner

Produces mechanical Receipts under MNFS-owned proof bindings.

### 13.3 Reviewer / Validator

Uses an independent Role/ActorRun and, where material, a fresh context compiled for judgment rather than implementation defense.

Produces Findings and/or advisory judgment. It does not gain write authority by default.

### 13.4 MNFS Gate

Consumes authoritative criteria, Evidence, freshness, Findings and Authority. It alone performs the machine-governed acceptance transition where policy assigns that authority.

### 13.5 Parent-level validation

Feature success does not close a Milestone automatically.

After child work:

```text
accepted child results
→ clean composition/integration
→ Milestone Criteria
→ integration/failure/live validation as applicable
→ Milestone Verdict/closure
```

Mission closure likewise returns to Mission-level Validation Baseline and the original Operator outcome.

---

## 14. Handoff and recovery

### 14.1 Handoff principle

A new Actor needs current truth, not conversational history.

A compiled handoff contains, as applicable:

- current authority hash;
- target and current lifecycle state;
- accepted prior work/result tree;
- active Attempt/ActorRun status;
- open Findings/blockers;
- Evidence references;
- next permitted action;
- environment/workspace observation;
- specific unresolved hypothesis only when it is relevant and explicitly observational.

### 14.2 Session memory

Runtime Session transcript, compaction and observational memory may improve continuity but never determine:

- which contract is current;
- which Attempt is current;
- whether a Claim is accepted;
- whether a Feature/Milestone/Mission is closed;
- which action is authorized.

### 14.3 Recovery

Fresh-process Recovery remains:

```text
load authoritative state
+ observe Git/environment/runtime resources
+ classify divergence
+ choose safe next action
```

The execution-planning system must therefore make every durable planning fact required after restart available outside the runtime transcript.

---

## 15. Parallelism policy

Parallel execution is not the default optimization.

Each edge/unit is classified based on real dependencies and resources, conceptually:

```text
SERIAL
SAFE_PARALLEL
RESOURCE_SERIALIZED
```

`SAFE_PARALLEL` requires evidence/design showing:

- no dependency edge;
- compatible/independent write sets;
- shared mutable resources are absent or isolated;
- environment capacity is available;
- integration semantics are understood;
- failure of one unit does not invalidate another unit's authority silently.

More available agents is not evidence that parallel execution is beneficial.

---

## 16. Agent-facing plan quality rules

A plan intended for an AI Worker must be actionable without becoming brittle pseudo-code.

### 16.1 Required specificity

For each bounded unit, planning should provide:

- exact target and outcome;
- exact authority/criteria references;
- known files/loci or an explicit localization step;
- interfaces consumed/produced;
- write/resource boundary;
- required tests/proofs and commands where stable;
- expected pass/fail semantics;
- environment/tool constraints;
- documentation/traceability impact;
- termination and escalation conditions.

### 16.2 Canonical implementation-task shape

A detailed execution plan expresses each independently reviewable implementation task using this logical structure:

```text
Task identity + bounded outcome
Files / localization evidence
Interfaces consumed
Interfaces produced
Coverage / criteria / requirement refs
Dependencies and preconditions
Write/resource/environment boundaries
RED or baseline proof
Minimal implementation / bounded action
GREEN deciding proof
Regression / integration proof
Documentation + traceability update
Checkpoint / commit
Claim + independent review expectations
Termination / handoff / escalation conditions
```

Where `TEST` is the deciding proof, RED and GREEN are literal executable test states. Where another proof method applies, the plan states the equivalent pre-action baseline and post-action deciding observation instead of manufacturing a fake test.

A later task must not depend on a symbol, schema, file format or artifact that no earlier task explicitly produces.

### 16.3 Avoid false precision

Do not invent exact line numbers, private helper names or file paths before repository evidence supports them.

When implementation detail is genuinely open, specify the invariant/interface and boundary rather than fabricating a pseudo-code sequence that later becomes stale.

### 16.4 No placeholders at readiness

A Ready execution plan contains no unresolved implementation-critical placeholders such as `TBD`, “add appropriate validation”, “handle edge cases” or “write tests”.

An unresolved material question is represented as a blocker/Decision/Investigation, not vague prose.

### 16.5 Task size

A task is appropriately bounded when:

- it has one coherent outcome;
- a fresh Actor can understand it;
- its write/resource boundary is reviewable;
- prerequisites are known;
- it can produce independent proof;
- a Reviewer could reject it without necessarily rejecting neighboring units;
- it contains no hidden Architecture Decision;
- it is expected to fit one bounded Actor work cycle or has an explicit checkpoint/handoff design;
- it leaves a clean, comprehensible state.

Lines-of-code, file-count or clock-time limits may be useful telemetry but are not the semantic definition of task size.

---

## 17. Architecture Spike planning

Architecture Spikes use the same planning discipline as production work but their output is Evidence/Decision input rather than product delivery.

### 17.1 Define the deciding contract before candidates run

Every comparative Spike defines before candidate execution:

- question being decided;
- candidate-independent requirements;
- common fixture;
- common base/environment assumptions;
- deciding criteria;
- failure conditions;
- measurements;
- Evidence schema;
- candidate provenance/version;
- fairness rules;
- stopping rule;
- what Decision each possible result permits.

Tests/fixtures must not be weakened or reshaped after seeing a preferred candidate fail unless the contract itself is formally corrected and all candidates are rerun under the same revision.

### 17.2 Candidate run isolation

Each candidate run receives:

- same Validation Baseline;
- same applicable requirements;
- candidate-specific realization configuration only;
- isolated artifacts/workspace;
- independent Evidence identity.

### 17.3 Spike completion

A Spike cannot conclude with “candidate X felt simpler”. It must record which requirements passed/failed, operational complexity observed, limitations, sovereignty/provenance facts and exact disposition.

---

## 18. Application to current Architecture Realization Review

D-015 defines the next bounded Spikes.

### 18.1 ARR-S0 — Host Capability Probe

Purpose:

Determine which local isolation/runtime hypotheses are physically supportable on the canonical Ubuntu WSL2 host before investing in adapters.

Planning must cover at least:

- kernel/WSL identity;
- `/dev/kvm` / virtualization support;
- namespace/seccomp/Landlock support relevant to candidates;
- FUSE support if still relevant;
- filesystem ownership/mount boundaries;
- Docker/container prerequisites if a candidate actually requires them;
- baseline Git/toolchain performance needed for later comparison.

S0 is observation only unless its separately approved contract explicitly authorizes bounded probe setup.

### 18.2 ARR-S1 — Agent Runtime Conformance

Compare integration shapes, not brand popularity.

Incumbent path includes Pi using a supported SDK/RPC/process boundary as selected by the Spike design.

Open-protocol path includes an MNFS ACP client against OpenCode and at least one second real ACP implementation (for example Pi-ACP or Goose) before ACP interoperability can be claimed.

Common deciding requirements include:

- exact cwd/environment control;
- deterministic resource/tool inventory;
- no unexpected discovery path that violates policy;
- auth/provider/subscription compatibility;
- cancellation/abort;
- bounded event/output handling;
- final/settled semantics;
- process death;
- fresh MNFS recovery without transcript;
- structured result/event capability;
- supported public boundary;
- version/provenance;
- total MNFS machinery/maintenance required.

### 18.3 ARR-S2 — Local Execution Envelope Conformance

Compare the process-envelope incumbent against a leading process challenger and compare leading microVM hypotheses only when S0 supports them.

Current candidates under D-013:

- Anthropic Sandbox Runtime incumbent;
- `nono` process challenger;
- Sandlock only if host prerequisites make it material;
- BoxLite microVM challenger;
- `smol-machines/smolvm` microVM challenger.

Common contract includes:

- protected host read/write denial;
- credential denial/broker posture;
- network deny posture;
- child-process containment;
- fail-closed initialization;
- exact mutable workspace behavior;
- Git fidelity;
- real dependency/typecheck/test workload;
- crash/restart behavior;
- result extraction;
- cleanup;
- WSL2 compatibility;
- startup/disk/repeat-run/maintenance cost.

### 18.4 ARR-S2W — Workspace comparison, conditional

Run only if the selected Execution Envelope does not already provide the required isolated mutable-state semantics economically.

Potential comparison:

- current Treehouse/native Git mechanics;
- VFS/AgentFS-style COW if it still eliminates meaningful machinery.

If the selected envelope already provides sufficient private persistent/COW workspace and Git-result extraction, S2W may be `NOT_APPLICABLE` with rationale.

### 18.5 ARR-S3 — Vertical Composition Proof

S3 composes the selected S1 and S2/S2W realizations with the accepted provider-neutral M01 semantic core.

Required flow:

```text
approved fixed Spike contract
→ current durable semantic core
→ selected Agent Runtime
→ selected Execution Environment/workspace
→ fixed repository change
→ Claim bound to resultTreeSha
→ terminate Lead
→ fresh Lead Recovery
→ deterministic Receipt
→ MNFS Gate
→ accepted Git result
→ idempotent safe resource disposition
```

S3 is not production M02 dispatch. It is the deciding proof that allows the project to create the superseding CAP-EXECUTION/MIS-002 realization.

---

## 19. Coverage of approved Architecture Review decisions

| Approved Decision | Execution-planning realization in this design |
|---|---|
| D-011 correctness before decomposition | L0 Validation Baseline; R4A before R4B; upward `CONTRIBUTES_TO`; independent Validator routing |
| D-012 replaceable Agent Runtime / Session non-authority | L1 runtime realization; Session-independent packs/handoffs; S1 comparative conformance; runtime transcript never authority |
| D-013 property-based Execution Environment | Environment/tool contract in every unit; explicit agent placement/workspace/network/credential posture; S0/S2/S2W planning |
| D-014 Thin Sovereign Kernel + selective substrates | R3 sourcing gate; sourcing constraints in unit packs; lowest sufficient layer; no hidden dependency replacement by Workers |
| D-015 Opportunity Replan + bounded Spikes | S0-S3 sequence; same candidate-independent Spike contract; no rev5 M02 production implementation |

No approved D1-D4 architectural direction is delegated to an unstructured Worker decision.

---

## 20. Anti-patterns explicitly rejected

### 20.1 Giant static implementation script

Rejected because repository evidence can invalidate tactical details and force Workers to choose between stale instructions and correctness.

### 20.2 High-level “figure it out” Feature prompt

Rejected because it delegates architecture, scope, safety and proof decisions to the Worker.

### 20.3 Full-repository context dump

Rejected because relevance dilution and stale/unnecessary context consume the Actor's finite attention budget.

### 20.4 Transcript as handoff authority

Rejected because recovery must work without runtime/session continuity.

### 20.5 Validator fixes its own Findings by default

Rejected because judging and implementing in the same context weakens independence and Finding semantics.

### 20.6 Retry-until-green

Rejected because it hides repeated hypotheses, can burn unbounded resources and can turn environment or contract problems into patch loops.

### 20.7 Parallel-by-default

Rejected because coordination, write-set and shared-resource conflicts can cost more than parallelism saves.

### 20.8 Tool-specific planning semantics

Rejected because Pi/OpenCode/ACP/nono/BoxLite/etc. are realizations, not the meaning of planning or completion.

### 20.9 New manual checklist beside MCRM

Rejected because duplicate governance sources inevitably drift. Completeness is compiled from existing applicability/design/coverage sources.

### 20.10 Premature generic provider framework

Rejected under D-014. Semantics may be provider-neutral while the initial implementation remains concrete.

---

## 21. Failure taxonomy for execution planning

Planning and execution must classify new discoveries instead of absorbing them informally.

At minimum:

```text
TACTICAL_DETAIL
→ adapt L3 inside current bounds

LOCALIZATION_CORRECTION
→ update bounded execution design if scope/interface remains materially the same

DERIVED_REQUIREMENT
→ record lineage and obtain required design/authority disposition

CORRECTION
→ Finding against existing scope; new correction cycle/Attempt

MISSING_IMPLEMENTATION_UNIT
→ create/approve new Feature or execution unit under current Mission when scope permits

ARCHITECTURE_CHANGE
→ Decision/Replan

SECURITY_OR_EFFECT_ESCALATION
→ Authority/Replan before action

CONTRACT_OR_OUTCOME_CHANGE
→ Mission Replan

ENVIRONMENT_DIVERGENCE
→ stop protected work; Recovery/Reconcile

CONTEXT_HANDOFF
→ healthy unfinished work reaches a safe context/runtime boundary; persist structured handoff and continue with a fresh Actor without claiming success

FUTURE_IMPROVEMENT
→ backlog/defer with rationale, never silently expand current scope
```

---

## 22. Readiness criteria for adopting this design

The written design is ready to become accepted authority when review confirms:

- it creates no second planning authority beside MCRM;
- L0-L3 stability/authority boundaries are unambiguous;
- R4A correctness precedes R4B decomposition;
- R5 fresh-Actor readiness is testable;
- role-specific packs preserve least-context/least-authority behavior;
- safe context-boundary handoff cannot be confused with success;
- agent-facing task shape covers interfaces, proof, regression, checkpoint and Claim expectations;
- the Execution Unit Contract can be compiled from existing/future authoritative artifacts without requiring another domain entity by default;
- Context Compiler eager/lazy rules preserve all required authority;
- Worker tactical freedom cannot alter security/scope/architecture silently;
- retry and termination semantics cannot convert exhaustion/blocking into success;
- independent validation and hierarchical closure remain intact;
- planning completeness is a derived projection, not another checklist source;
- D-011 through D-015 have explicit coverage;
- S0-S3 can be planned using one common proof discipline;
- no production runtime/environment is accidentally selected by this design;
- no M02 production dispatch is authorized by accepting this design.

---

## 23. Post-acceptance sequence

Acceptance of this design does not authorize Spike execution.

The next planning sequence is:

```text
accept this Execution Planning Design
        ↓
write Architecture Reconciliation + Spike Execution Plan
        ↓
self-review plan against D-011..D-015 and this design
        ↓
Operator reviews exact plan/gates
        ↓
issue exact ARR-S0 execution authority
        ↓
execute S0
        ↓
refine/authorize S1 and S2 under the approved common contracts
        ↓
conditional S2W
        ↓
S3 vertical proof
        ↓
substrate selection Decision
        ↓
Blueprint/ADR/CAP-EXECUTION/MIS-002 reconciliation
        ↓
new M2/M02 R5 design and implementation plan
```

The detailed execution plan must use small independently reviewable tasks, proof-first steps, exact files/interfaces where evidence supports exactness, explicit RED/GREEN cycles where TDD applies, frequent bounded commits and explicit gates between architecture-selection phases.

---

## 24. Summary

The MNFS execution-planning model is:

```text
Operator intent
→ MCRM baseline/applicability/requirements
→ capability architecture + sourcing
→ Validation Baseline
→ adversarial correctness review
→ decomposition + contribution coverage
→ Execution Design & Completeness Gate
→ fresh compiled Actor Pack
→ baseline proof
→ adaptive bounded execution
→ Claim
→ deterministic Evidence
→ independent validation
→ Finding routing / correction / Replan
→ composition validation
→ Mission outcome validation
→ closeout and Calibration
```

The design intentionally keeps **semantics strict and tactics adaptive**.

That combination is required for an AI development harness that is both reliable enough to govern real software delivery and flexible enough to exploit stronger future models without rewriting the product around yesterday's harness assumptions.
