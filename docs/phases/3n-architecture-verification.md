# Phase 3N — Architecture Verification

Current phase/status and the exact next action remain owned only by [../roadmap.md](../roadmap.md). This document owns the bounded 3N verification contract and, once the phase closes, its durable result summary. It does not create Product or architecture authority.

## Authority boundary

3N derives from the closed 3A–3M current projection, principally [../architecture/index.md](../architecture/index.md) sections 2, 4, 4.1, and 42–47.

It may falsify accepted architecture. It may not silently redesign it to make a proof pass.

3N does **not**:

- reopen 3A–3M without a material falsifier;
- re-run closed 3L qualification by preference;
- begin 3O;
- ratify C-018;
- authorize or implement Product code;
- use a mock, fixture-only runtime, or presence-only probe to claim a real Product/runtime/integration property;
- convert reviewer output, framework behavior, or test machinery into Product authority.

## Verification question

> What is the smallest pre-implementation contract that can falsify a material contradiction in the accepted 3A–3M architecture while preserving every property that needs a real implementation for first-build, first-production, or 3O proof?

The answer is a **static architecture challenge plus explicit forward proof routing**. 3N proves only what exists to falsify now; it preserves implementation-dependent falsifiers instead of pretending to execute them.

## Contract

| Check | Current falsifier | Pass condition |
| --- | --- | --- |
| `3N-S1` progression boundary | 3O starts, C-018 is ratified, or Product implementation becomes unblocked before 3N closure | 3A–3M remain closed; 3N/3O progression is legal; C-018 stays not ratified; Product implementation stays blocked |
| `3N-S2` semantic-owner closure | an owner disappears, an extra semantic owner appears, or a generic cross-cutting owner replaces accepted ownership | the accepted F1 semantic-owner set is exact, including owner-local recovery with no generic Recovery owner |
| `3N-S3` dependency closure | L7 orchestration, the single domain inversion, or the four infrastructure boundaries drift | exactly seven accepted L7 flows, one accepted domain inversion, and four accepted infrastructure boundaries remain projected |
| `3N-S4` falsifier completeness/routing | a section-46 invariant disappears, changes silently, or is routed to a stage incapable of genuinely falsifying it | all 28 accepted falsifiers are preserved exactly once and routed to their earliest remaining real Product proof stage |

Every material guard must have a deterministic negative control. A green static check is **not** evidence that the later Product behavior works.

A material failure stops 3N and returns only to the smallest owning accepted decision/phase implicated by the contradiction. A test failure may not be repaired by adding a new Product requirement, semantic owner, trust boundary, runtime, database, service, or speculative abstraction.

## Remaining Product falsifier routing

The table below routes the **remaining Product-level falsification**. Accepted 3L Evidence remains carried and is not re-executed; where 3L proved only a bounded mechanism/property, first-build still owns the corresponding realization conformance.

| ID | Earliest remaining real proof | Accepted falsifier |
| --- | --- | --- |
| 3N-V01 | FIRST_BUILD | Workspace isolation bypass through Project/DB/runtime shortcuts |
| 3N-V02 | FIRST_BUILD | coding crossing a materially insufficient Project Baseline |
| 3N-V03 | FIRST_BUILD | runtime/session closing Change authority by itself |
| 3N-V04 | FIRST_BUILD | Plan/tasks/UI state disagreeing with Hub authority without detection |
| 3N-V05 | FIRST_BUILD | E2B cross-incarnation silent write replay |
| 3N-V06 | FIRST_BUILD | Brain canonical source accidentally residing in first Project repo |
| 3N-V07 | FIRST_BUILD | Brain binding silently following new Brain revision |
| 3N-V08 | FIRST_BUILD | Brain Discovery proposal becoming authority without human publish |
| 3N-V09 | FIRST_BUILD | AnalyticQuery escaping semantic/SELECT-only boundaries |
| 3N-V10 | FIRST_BUILD | caller/model selecting arbitrary Connection/effect destination |
| 3N-V11 | FIRST_BUILD | Gateway duplicate/lost-response replay manufacturing second effect |
| 3N-V12 | FIRST_BUILD | Gateway unresolved effect bypassed by fresh AgentRun/new admission |
| 3N-V13 | FIRST_BUILD | Gateway idempotency/reconciliation scope accepted when deliberately under-declared |
| 3N-V14 | FIRST_BUILD | Product Agent losing exact old Release pins across suspension/restart |
| 3N-V15 | FIRST_BUILD | Builder/PAR mutable-state leakage |
| 3N-V16 | FIRST_BUILD | stale RequestContext authority resurrection |
| 3N-V17 | FIRST_BUILD | provider call occurring without spend reservation |
| 3N-V18 | FIRST_BUILD | managed sync replaying all missed slots |
| 3N-V19 | FIRST_BUILD | managed sync recovery depending on effect-capable machinery with no current consumer |
| 3N-V20 | FIRST_BUILD | telemetry manufacturing F5/terminal truth |
| 3N-V21 | FIRST_BUILD | Published App authority collapsing into Control Plane |
| 3N-V22 | FIRST_BUILD | Release AVAILABLE/pointer swap masquerading as SERVED_VERIFIED |
| 3N-V23 | FIRST_BUILD | migration/EnvironmentConformance drift hidden as success |
| 3N-V24 | FIRST_BUILD | storage object key bypassing owner authorization |
| 3N-V25 | FIRST_PRODUCTION | restore without positive generation continuity opening normal PROD |
| 3N-V26 | FIRST_PRODUCTION | restored stale authority regaining privileged/autonomous/effectful use |
| 3N-V27 | FIRST_PRODUCTION | post-cutoff canonical Git silently discarded or promoted to current Hub authority |
| 3N-V28 | 3O | first vertical read model proving itself / unsupported KPI fabricated |

Why this is proportional:

- `FIRST_BUILD` means the first real Product slice that instantiates the owner/boundary can exercise the property; an architecture-only imitation would prove only the imitation.
- `FIRST_PRODUCTION` is reserved for restore/reactivation properties whose falsifier requires the real first-installation topology and operational generation boundaries.
- `3O` owns the contract-only end-to-end vertical proof and therefore owns the first vertical live-source/read-model falsifier.
- no new pre-C-018 provider/model/E2B/Sankhya/production-effect execution is introduced by 3N.

## Executable mechanism

`scripts/check-architecture-verification.mjs` is a mechanism, not authority. It derives its oracle from this contract plus current accepted architecture and must fail closed on:

- illegal phase/ratification/implementation progression;
- semantic-owner drift;
- L7/dependency-boundary drift;
- deletion or mutation of a section-46 falsifier;
- missing, duplicate, or invalid forward routing.

`tests/repository/architecture-verification.test.mjs` supplies deterministic negative controls against the real checker. The negative controls operate on isolated copies of current authority files so they cannot contaminate parallel repository checks or unowned working state.

## Closure gate

3N may close only when all of the following are true on the exact candidate head:

1. the focused 3N verifier passes;
2. its negative controls prove the material guards can fire;
3. `npm ci && npm run verify` passes;
4. independent Fable review is run from an isolated `review/3n-fable` branch under the current Repository Standard;
5. no admitted material contradiction remains unresolved;
6. the merge candidate contains no `docs/work/**` review material;
7. closure does not start 3O, ratify C-018, or authorize Product implementation by implication.

If a later real proof falsifies a routed property, it reopens only the smallest accepted owner/decision that the Evidence actually invalidates.
