# Phase 3O — Vertical Architecture Proof Contract

Current phase/status and the exact next action remain owned only by [../roadmap.md](../roadmap.md). This document owns the bounded 3O proof contract and, once the phase closes, its durable result summary. It does not create Product or architecture authority and does not authorize Product implementation.

## Authority boundary

3O derives only from the current accepted projection needed for this task:

- the Product Contract first vertical: **Analisador Inteligente de Orçamentos — Sankhya**, deliberately read-only analytics;
- Architecture §§42 and 46, especially the first-vertical live-source/read-model proof family and `3N-V28`;
- the closed [3N architecture-verification contract](3n-architecture-verification.md) and all obligations it routes forward;
- the current data/persistence owner, especially Project read-model truth boundaries and CR-1 where the first real build actually instantiates that property.

3O may define what Evidence the first real vertical build must produce and how that Evidence can fail. It may not silently redesign accepted architecture to make the proof convenient.

3O does **not**:

- ratify C-018;
- authorize or implement Product code;
- execute live Sankhya, a Product runtime, a sync, a migration, or a production effect;
- invent KPI/business semantics, source mappings, formulas, tolerances, table/column spellings, or a new semantic owner;
- add a Product Agent, external write, managed job, automation or other capability merely to exercise infrastructure;
- use a mock, fixture-only source, cached expected output, or the read model under test to claim live-source correctness;
- narrow or delete a 3N forward-routed obligation because the Budget Analyzer does not instantiate it.

Mechanism remains subordinate to current semantic authority. Proof artifacts are Evidence, not Product records or business authority.

## Verification question

> Can the first authorized real Budget Analyzer build produce independently reconcilable read-only analytical truth from governed Sankhya data, under current accepted semantics, while refusing unsupported semantics and preserving unknown/partial truth — and can the proof demonstrably fail when the real source and Product result diverge?

A valid answer requires an **independent live-source oracle + common comparison boundary + real Product-side result + deterministic falsifier**. 3O defines that contract only. The first authorized build executes it.

## Accepted vertical boundary

The first vertical remains the Sankhya Budget Analyzer and remains read-only analytics. The proof therefore exercises only capabilities the vertical genuinely needs.

The accepted data boundary is load-bearing:

```text
Sankhya live source truth
!=
Project analytical/read-model state
!=
Budget Analyzer Product result
```

A Project DB read model may be useful derived state. Its existence, freshness marker, row count or internally consistent result is never proof that the external source was synchronized or interpreted correctly.

## Proof law

```text
current accepted semantic authority
+ exact governed live-source scope
+ independently derived source oracle
+ one common business comparison boundary
                         │
                         ├─────────────── compare ───────────────┐
                         │                                       │
                         ▼                                       ▼
              governed live Sankhya                    real Budget Analyzer path
                                                        → read model where used
                                                        → Product-owned result

result = MATCH | MISMATCH | UNSUPPORTED | INDETERMINATE
```

`MATCH` is the only positive reconciliation result. `UNSUPPORTED` and `INDETERMINATE` are truthful fail-closed outcomes, not failures to be converted into plausible numbers. `MISMATCH` is a material falsifier until explained by current authority and Evidence.

## Proof-case admission

A first-build reconciliation case is admissible only when it resolves all of the following from current authority or exact execution Evidence:

1. an exact semantic subject/reference already authorized outside the proof itself;
2. exact Project/source binding identity sufficient to know which governed Sankhya source is being tested;
3. grain, dimensions, filters, unit/null semantics and business-time meaning needed for the comparison;
4. a comparison cutoff/window that both source truth and candidate result can honestly cover;
5. an independently derived live-source oracle specification;
6. the real Product-side result path being tested;
7. exact Evidence provenance sufficient to identify semantic revision, source/binding scope, candidate Release/build identity and comparison boundary.

If one of these cannot be established, the case is `INDETERMINATE`; the proof may not fill the gap with an inferred default.

The proof contract does not require an exhaustive golden case per KPI by default. Every Product-visible analytical output must resolve to current semantic authority, while live reconciliation requires the **smallest representative set that covers each materially distinct source-to-Product transformation rule actually used by the first vertical**. A new materially distinct grain, relationship path, temporal rule, aggregation/formula class, or null/unknown rule expands that set; labels or duplicated presentation alone do not.

## Core first-build proof contract

| ID | First-build falsifier | Pass condition |
| --- | --- | --- |
| `3O-P1` semantic admission | a Product-visible KPI/result has no resolvable current semantic authority, or the proof itself invents its meaning | every exposed analytical result resolves to current accepted semantics; unresolved meaning is `UNSUPPORTED`, never fabricated |
| `3O-P2` oracle independence | expected truth is obtained from the Project read model, Product output, the same result-producing transformation, or a fixture copied from the candidate | the oracle reaches governed live Sankhya and is independently derived from the candidate transformation while sharing only accepted semantics and commodity transport where appropriate |
| `3O-P3` comparison closure | source and candidate are compared across different business cutoffs/coverage and the proof still claims success | both sides share a declared comparison boundary; inability to establish equivalent coverage yields `INDETERMINATE` |
| `3O-P4` real-path reconciliation | a supported representative case differs between independent source truth and the real Budget Analyzer result without detection | every admitted representative case is `MATCH`, or the proof fails closed with explicit mismatch Evidence |
| `3O-P5` unsupported/unknown preservation | unsupported semantics, missing data, partial coverage or unavailable source truth becomes `0`, success, nearest-name inference or another plausible numeric substitute | unsupported meaning is `UNSUPPORTED`; missing/partial/unverifiable truth is `INDETERMINATE`; neither can masquerade as a supported result |
| `3O-P6` falsifier firing | deliberate divergence on one comparison side still produces a green proof | a deterministic negative control changes one side outside the live-source oracle and the reconciliation must fail; production/source mutation is not required for the control |
| `3O-P7` provenance closure | a mismatch/pass cannot be tied to the exact semantic/source/candidate/comparison identities that produced it | Evidence pins enough exact identity to reproduce or adjudicate the claim without treating telemetry as owner truth |

A tolerance may exist only when current semantic authority or the exact business calculation requires it. The proof may not invent a tolerance after observing a mismatch.

## Oracle independence

The live-source oracle and Product candidate may share the same accepted semantic definition and governed connection/transport mechanics. They may **not** share the result-producing transformation whose correctness is being tested.

The oracle must not:

- read the Project DB/read model as its source of expected truth;
- call the Budget Analyzer result under test and treat the response as expected truth;
- reuse the candidate materialization/aggregation function merely through another entrypoint;
- obtain the expected value from a golden fixture copied from candidate output.

The candidate side must be captured from the furthest stable Product-owned result boundary that actually serves the analytical result. Reading the Project DB directly is insufficient when additional Product logic transforms that state before the user-visible result.

Shared commodity mechanics do not destroy independence. Shared business-result derivation does.

## Temporal and data closure

Live enterprise data moves. A reconciliation that ignores that fact can manufacture both false passes and false failures.

The first-build proof must therefore establish one business comparison boundary that both paths cover honestly, for example through an exact source/read-model cutoff, watermark/generation relationship or another later-derived mechanism consistent with current authority.

The mechanism is deliberately **not** selected in 3O. The invariant is:

```text
source truth interval/cutoff
== candidate covered interval/cutoff
OR
proof = INDETERMINATE
```

A freshness timestamp by itself is not proof of equivalent coverage. Unknown or partial coverage never becomes zero/success.

## Unsupported semantic protection

`3N-V28` explicitly forbids an unsupported KPI from becoming fabricated truth. 3O binds that falsifier as follows:

```text
Product-visible analytical result
→ exact current semantic reference resolves
   → eligible for representative reconciliation

semantic reference missing / ambiguous / unsupported
→ UNSUPPORTED
-X-> model guess
-X-> nearest-name substitution
-X-> inferred formula becoming authority
-X-> plausible numeric result
```

The Builder, a model, a reviewer, a source query, or the proof harness cannot create KPI authority by producing a result.

## 3N forward-routing preservation

3O imports the closed 3N routing **by reference** rather than copying its 28 falsifier texts into a second semantic oracle.

The first authorized build must produce a bounded verification manifest covering the following without omission:

| Forward source | 3O disposition | Earliest real execution |
| --- | --- | --- |
| `3N-V01..3N-V24` | preserve every ID; mark `EXECUTED` when the first build instantiates the protected owner/boundary, otherwise `NOT_INSTANTIATED` with concrete scope Evidence | FIRST_BUILD |
| `3N-V25..3N-V27` | preserve unchanged; 3O and the first non-production build do not imitate these properties | FIRST_PRODUCTION |
| `3N-V28` | **CONTRACTED_HERE** through `3O-P1..3O-P7` | FIRST_BUILD |
| Architecture §42 proof families | preserve every family; execute at its first applicable real slice; the first-vertical live-source/read-model family is mandatory for this vertical | FIRST_BUILD / FIRST_PRODUCTION by current route |
| data CR-1 | prove current-authority serialization × owner isolation together if the first build instantiates a qualifying security-sensitive mutation; otherwise record `NOT_INSTANTIATED` rather than manufacturing one | FIRST_BUILD where applicable |
| managed-execution duplicate-authority / deciding-evidence obligations routed by 3N | preserve in the first-build applicability manifest; no new generic authority may be introduced to satisfy them | FIRST_BUILD where applicable |

`NOT_INSTANTIATED` is not a waiver. It means the actual first slice lacks the owner/boundary/consumer required to make that property reachable. The proof must name why. A later first instantiation inherits the original route.

Conversely, the Budget Analyzer may not manufacture Product Agent, effect-capable job, external write, attachment, recovery or other unused capability merely to turn an obligation into an executable test.

## First-build execution boundary

The future execution of this contract requires the first **authorized real** Product build. That future proof must use real Product code and real governed Sankhya for the live-source claim.

Fixtures/synthetic data may support deterministic negative controls or local contract tests, but they may not substitute for:

- live-source truth;
- real source/read-model reconciliation;
- real authorization/isolation behavior;
- runtime/restart/effect/production properties routed by 3N.

3O itself performs none of those executions. Product implementation remains subject to C-018, Realization Planning and explicit execution authority.

## Global Maximum / YAGNI deletion challenge

The smallest sustainable contract intentionally rejects:

- an exhaustive KPI matrix before the actual first-vertical semantic inventory exists;
- a generic Proof Engine, Evidence domain owner or new durable proof record class;
- Product Agent/write/automation/job machinery solely for coverage;
- browser automation as a universal requirement when a narrower real Product-owned result boundary can falsify the same claim;
- a second copy of the 3N falsifier catalog;
- a selected sync/watermark/query/test framework before Realization Planning;
- a mock Sankhya/read-model pair that can only prove its fixture.

The contract expands only when a real first-build transformation, owner/boundary or material falsifier requires more.

## Material 3O stop conditions

3O stops and returns to the smallest owning accepted decision/phase only if Evidence shows one of the following materially true:

- no independent live-source oracle can be constructed without making the candidate read model/Product path its own authority;
- no honest common comparison boundary can be expressed within accepted data/source boundaries;
- the first read-only vertical requires a new Product capability, semantic owner or trust boundary to produce correct truth;
- a 3N forward obligation applicable to the first vertical cannot be genuinely falsified within its accepted owner/boundary;
- CR-1 or another accepted first-build invariant proves structurally impossible once the real applicable surface is specified;
- a real source/semantic requirement contradicts accepted Product or architecture authority.

A material failure does not authorize redesign inside the proof. It identifies the smallest authority that must re-enter the Decision Loop.

## Closure gate

3O may close only when all of the following are true on the exact candidate head:

1. this contract preserves the accepted read-only first-vertical boundary and creates no new Product/KPI authority;
2. `3O-P1..3O-P7` define a genuinely falsifiable first-build contract with an independent live-source oracle, honest temporal/data closure and a demonstrable negative control;
3. all 3N explicit-minimum IDs, Architecture §42 proof families and current-owner forward obligations remain routed without fake execution or silent deletion;
4. no Product code, live Sankhya execution, Product runtime probe, production effect or C-018 ratification enters the 3O candidate;
5. `npm ci && npm run verify` passes;
6. an independent Fable review is run from a newly isolated review branch over the exact consolidated candidate under the current Repository Standard, and every material finding is adjudicated against current authority;
7. the merge candidate contains no `docs/work/**` review material and no unresolved material contradiction;
8. after **explicit operator closure authority**, the same closure head updates the roadmap to `3O = CLOSED` while `C-018 = NOT RATIFIED` and `Product implementation = BLOCKED`, then `npm ci && npm run verify` passes again before merge.

Until that explicit closure authority is given, 3O remains open, C-018 remains not ratified and Product implementation remains blocked.

If the later real first-build proof falsifies an accepted property, it reopens only the smallest accepted owner/decision that the Evidence actually invalidates.
