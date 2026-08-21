# Phase 3N — Architecture Verification

Current phase/status and the exact next action remain owned only by [../roadmap.md](../roadmap.md). This document owns the bounded 3N verification contract and, once the phase closes, its durable result summary. It does not create Product or architecture authority.

## Authority boundary

3N derives from the closed 3A–3M current projection, principally [../architecture/index.md](../architecture/index.md) sections 2, 4, 4.1, and 42–47, plus the current task owners routed from [../index.md](../index.md).

It may falsify accepted architecture. It may not silently redesign it to make a proof pass.

3N does **not**:

- reopen 3A–3M without a material falsifier;
- re-run closed 3L qualification by preference;
- begin 3O;
- ratify C-018;
- authorize or implement Product code;
- use a mock, fixture-only runtime, or presence-only probe to claim a real Product/runtime/integration property;
- convert reviewer output, research, framework behavior, or test machinery into Product authority.

## Verification question

> Is the accepted 3A–3M architecture still the smallest coherent Global Maximum for the Product we intend to build, and are all implementation-dependent claims routed to the first stage that can genuinely falsify them?

The answer is a **static closure check + current-authority coherence challenge + comparative Global-Maximum challenge + explicit forward proof routing**. 3N proves only what exists to falsify before Product implementation; it preserves real implementation obligations instead of imitating them.

## Contract

| Check | Current falsifier | Pass condition |
| --- | --- | --- |
| `3N-S1` progression boundary | 3O starts, C-018 is ratified, or Product implementation becomes unblocked before 3N closure | 3A–3M remain closed; 3N/3O progression is legal; C-018 stays not ratified; Product implementation stays blocked |
| `3N-S2` semantic-owner closure | an owner disappears, an extra semantic owner appears, or a generic cross-cutting owner replaces accepted ownership | the accepted F1 semantic-owner set remains exact, including owner-local recovery with no generic Recovery owner |
| `3N-S3` dependency closure | L7 orchestration, the single domain inversion, or the four infrastructure boundaries drift | exactly seven accepted L7 flows, one accepted domain inversion, and four accepted infrastructure boundaries remain projected |
| `3N-S4` current-authority coherence | a consolidated current owner points to unreachable load-bearing authority or carries superseded semantics | current projection is self-sufficient for load-bearing closed facts and later accepted amendments supersede stale wording |
| `3N-S5` explicit minimum falsifiers/routing | a section-46 minimum falsifier disappears or is routed to a contract/execution stage incapable of genuine falsification | every architecture §46 minimum falsifier is preserved exactly once and the 3N route is derived from current architecture authority rather than a second checker oracle |
| `3N-S6` downstream proof-family coverage | an implementation-dependent accepted family is dropped because it was not one of the explicit §46 lines | every current architecture §42 proof family remains routed forward without fake pre-implementation execution |

Every material guard must have a deterministic negative control where a static guard can honestly exist. A green static check is **not** evidence that later Product behavior works.

A material failure stops 3N and returns only to the smallest owning accepted decision/phase implicated by the contradiction. A test failure may not be repaired by adding a new Product requirement, semantic owner, trust boundary, runtime, database, service, or speculative abstraction.

## Explicit minimum falsifier routing

Architecture §46 is an **accepted explicit minimum**, not the complete universe of future Product falsification. Its routing is reproduced here for execution planning; architecture authority remains the deciding source.

`Contract/proof stage` says who owns the next contract. `Earliest real execution` says when software/production can actually falsify the claim. In particular, `3O_CONTRACT` defines the first-vertical proof contract but **does not execute Product code**.

| ID | Contract/proof stage | Earliest real execution | Accepted minimum falsifier |
| --- | --- | --- | --- |
| 3N-V01 | FIRST_BUILD | FIRST_BUILD | Workspace isolation bypass through Project/DB/runtime shortcuts |
| 3N-V02 | FIRST_BUILD | FIRST_BUILD | coding crossing a materially insufficient Project Baseline |
| 3N-V03 | FIRST_BUILD | FIRST_BUILD | runtime/session closing Change authority by itself |
| 3N-V04 | FIRST_BUILD | FIRST_BUILD | Plan/tasks/UI state disagreeing with Hub authority without detection |
| 3N-V05 | FIRST_BUILD | FIRST_BUILD | E2B cross-incarnation silent write replay |
| 3N-V06 | FIRST_BUILD | FIRST_BUILD | Brain canonical source accidentally residing in first Project repo |
| 3N-V07 | FIRST_BUILD | FIRST_BUILD | Brain binding silently following new Brain revision |
| 3N-V08 | FIRST_BUILD | FIRST_BUILD | Brain Discovery proposal becoming authority without human publish |
| 3N-V09 | FIRST_BUILD | FIRST_BUILD | AnalyticQuery escaping semantic/SELECT-only boundaries |
| 3N-V10 | FIRST_BUILD | FIRST_BUILD | caller/model selecting arbitrary Connection/effect destination |
| 3N-V11 | FIRST_BUILD | FIRST_BUILD | Gateway duplicate/lost-response replay manufacturing second effect |
| 3N-V12 | FIRST_BUILD | FIRST_BUILD | Gateway unresolved effect bypassed by fresh AgentRun/new admission |
| 3N-V13 | FIRST_BUILD | FIRST_BUILD | Gateway idempotency/reconciliation scope accepted when deliberately under-declared |
| 3N-V14 | FIRST_BUILD | FIRST_BUILD | Product Agent losing exact old Release pins across suspension/restart |
| 3N-V15 | FIRST_BUILD | FIRST_BUILD | Builder/PAR mutable-state leakage |
| 3N-V16 | FIRST_BUILD | FIRST_BUILD | stale RequestContext authority resurrection |
| 3N-V17 | FIRST_BUILD | FIRST_BUILD | provider/model execution escaping finite server-derived call/step/retry/fallback bounds |
| 3N-V18 | FIRST_BUILD | FIRST_BUILD | managed sync replaying all missed slots |
| 3N-V19 | FIRST_BUILD | FIRST_BUILD | managed sync recovery depending on effect-capable machinery with no current consumer |
| 3N-V20 | FIRST_BUILD | FIRST_BUILD | telemetry manufacturing F5/terminal truth |
| 3N-V21 | FIRST_BUILD | FIRST_BUILD | Published App authority collapsing into Control Plane |
| 3N-V22 | FIRST_BUILD | FIRST_BUILD | Release AVAILABLE/pointer swap masquerading as SERVED_VERIFIED |
| 3N-V23 | FIRST_BUILD | FIRST_BUILD | migration/EnvironmentConformance drift hidden as success |
| 3N-V24 | FIRST_BUILD | FIRST_BUILD | storage object key bypassing owner authorization |
| 3N-V25 | FIRST_PRODUCTION | FIRST_PRODUCTION | restore without positive generation continuity opening normal PROD |
| 3N-V26 | FIRST_PRODUCTION | FIRST_PRODUCTION | restored stale authority regaining privileged/autonomous/effectful use |
| 3N-V27 | FIRST_PRODUCTION | FIRST_PRODUCTION | post-cutoff canonical Git silently discarded or promoted to current Hub authority |
| 3N-V28 | 3O_CONTRACT | FIRST_BUILD | first vertical read model proving itself / unsupported KPI fabricated |

## Downstream proof-family coverage

Architecture §42 remains independently load-bearing. These families are not converted into dozens of artificial 3N IDs; they remain current routing obligations for the first applicable real slice.

| Proof family | Routing |
| --- | --- |
| Brain Discovery/feedback/conformance/health | FIRST_BUILD |
| scaffold/codegen/frontend contract/security invariants | FIRST_BUILD |
| Builder UX progressive disclosure / platform machinery not primary workflow | FIRST_BUILD |
| Observability/audit/redaction/GC Product paths | FIRST_BUILD |
| Release/Promotion/EnvironmentConformance/serving | FIRST_BUILD |
| Published App authorization/session/browser security | FIRST_BUILD |
| private attachment/blob authorization | FIRST_BUILD |
| supply-chain/dependency admission | FIRST_BUILD |
| Connection/Gateway effect/egress | FIRST_BUILD |
| first-production restore/emergency-stop/activation | FIRST_PRODUCTION |
| first vertical live-source/read-model reconciliation | 3O_CONTRACT → FIRST_BUILD |
| Golden benchmark / Worker Eval outcome quality | FIRST_BUILD |

`FIRST_BUILD` means the first real build that instantiates the applicable owner/boundary; it does not require the Budget Analyzer to manufacture an unused capability merely to exercise infrastructure.

## Lead global-coherence challenge

This is Evidence/adjudication input for 3N, not Product authority.

The Lead re-challenged current architecture against the repository Product Contract and current research/reference set, including the deep Mitra study, Factory AI study, current Mastra mapping/qualification, and current Mastra documentation where framework evolution could materially reduce realization machinery.

| Challenge | Lead result before independent review |
| --- | --- |
| Mitra simplicity vs Factory correctness/validation | current Conexus synthesis preserved: simple/agent-first Product surface + proportional Plan/WorkUnit/verification; no Mission engine or fleet required |
| Mastra/Factory capability vs Conexus ownership | use native/commodity mechanisms where they satisfy the contract; keep Project Baseline, Change, owner truth, Brain/Connection bindings, Release/Promotion and Evidence sovereign |
| `PAR` + `MAR` + Gateway split | preserved; reasoning/runtime occurrence and external-effect replay/credential authority remain distinct meanings |
| generic Workflow business owner | rejected F1; a future named deterministic consumer may use Mastra Workflow or another mechanism behind the smallest real owner without moving Gateway effect authority |
| DEDICATED trust seam | preserved after deletion challenge; physical deployment remains deferred, while the current server-to-platform trust contract prevents an undefined future authority crossing |
| 46 durable records / 16 Tier-2 FKs | semantic closure preserved; current consolidated data owner repaired so Fresh Actors can verify the exact inventory without Git archaeology |
| model-spend reservation wording | corrected as stale projection from pre-3L-R1 semantics; F1 keeps finite server-derived execution bounds and truthful usage/cost states, not hard monetary reservation machinery |
| 3O role | corrected: 3O defines the vertical proof contract; the first authorized real build executes and can falsify it |
| Product UX complexity | preserve progressive disclosure; internal factory machinery is inspectable when material but must not become the required primary user workflow |
| Worker/runtime evaluation | preserve Golden benchmark + Worker Eval; measure outcome/correctness/rework/elapsed time/cost/completion rather than agent-usage vanity metrics |

Provisional Lead verdict before Fable:

```text
core 3A–3M architecture reopen = NO
3L requalification             = NO
semantic owner add/remove       = NO
framework replacement           = NO
surviving structural YAGNI      = 0 identified by Lead challenge
bounded projection defects      = corrected in this 3N candidate
```

Independent Fable review must attack this conclusion rather than merely confirm it.

## Executable mechanism

`scripts/check-architecture-verification.mjs` is mechanism, not authority. It intentionally stays smaller than the architecture it checks.

It must fail closed on:

- illegal phase/ratification/implementation progression;
- semantic-owner or closed dependency drift;
- resurrection of the superseded model-spend reservation wording;
- mismatch between the declared 46-class inventory and the records actually projected by the current data owner;
- mismatch between the declared 16-FK Tier-2 allowlist and its current projected entries;
- loss/duplication of an architecture §46 explicit minimum falsifier;
- mismatch between §46 contract/execution routing and this phase route;
- loss of a current architecture §42 downstream proof family from this contract.

The checker does **not** hard-code the 28 falsifier texts as a second semantic authority; it derives them from current architecture §46. Comparative Global-Maximum judgment remains review/adjudication work, not something a regex can prove.

`tests/repository/architecture-verification.test.mjs` supplies deterministic negative controls against the real checker. Fixture copies are isolated mechanics only; they never claim implementation/runtime proof.

## Closure gate

3N may close only when all of the following are true on the exact candidate head:

1. the focused 3N verifier passes;
2. its negative controls prove the material static guards can fire;
3. `npm ci && npm run verify` passes;
4. independent Fable review is run from a newly isolated review branch over the exact corrected candidate HEAD under the current Repository Standard;
5. every material Fable finding is adjudicated against current authority and no admitted contradiction remains unresolved;
6. the merge candidate contains no `docs/work/**` review material;
7. closure does not start 3O, ratify C-018, or authorize Product implementation by implication.

If a later real proof falsifies a routed property, it reopens only the smallest accepted owner/decision that the Evidence actually invalidates.
