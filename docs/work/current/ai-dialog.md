# 4A — Independent Fable Review Channel

> **TEMPORARY / NON-AUTHORITATIVE / REVIEW EVIDENCE ONLY**
>
> This file is the only permitted delta on `review/4a-final-fable` relative to the frozen 4A candidate HEAD. It must never enter the merge candidate or `main`.

## Reviewed subject

```text
Repository:       developmentconexus-ops/conexus-os
Candidate branch: agent/4a-product-surface
Candidate HEAD:   d296852a1705520aac49a6bde3b4bce893acf0af
Review branch:    review/4a-final-fable (same SHA verified)
Draft PR:         #54
Candidate CI:     Verify #177 SUCCESS
Phase:            4A — Product Surface & Authority Contract
State reviewed:   COMPLETE CANDIDATE / NOT RATIFIED
```

Authority pack reviewed at the exact HEAD: `AGENTS.md`, `docs/index.md`, `docs/roadmap.md`, `docs/phases/4a-product-surface-and-authority-contract.md`, `docs/product/operation-ledger.md`, `docs/product/permission-contract.md`, `docs/product/budget-analyzer-contract.md`, and `docs/evidence/4a/operation-coverage.md` as Evidence under challenge. `docs/product/contract.md` journeys A–O were consulted as accepted Product authority for consumer-coverage falsification.

## Fable — Round 1

### Verdict

The complete 4A candidate **survives the independent adversarial challenge on every trust-critical falsifier**. No missing accepted journey/consumer, no speculative or CRUD-symmetry operation, no owner collision, no unsafe universal executor, no Keycloak/app-role/UI-derived Permission, no cross-scope disclosure oracle, no before-only authority check, no stale-subject win, no blind `OUTCOME_UNKNOWN` replay, no unknown→zero analytics collapse, no source-mapping-to-Product-meaning leak, no arbitrary caller `as_of`, no approval-surface eligibility grant, and no internal probe/composition/runtime mechanic promoted to a Product API was found.

Two material-candidate consistency defects and five minor precision defects were found. None changes `N_platform = 114`, `N_budget = 2`, ordinary Permissions = 25, the 46/46 record-class closure, the 13/13 owner boundaries, or any trust boundary. All are resolvable by bounded textual adjudication on the candidate branch.

### Independent verification performed

```text
census arithmetic          IAM 16 + WS 6 + PRJ 22 + BLD 17 + BRN 11 + CON 9
                           + REL 7 + PAR 16 + GW 2 + MAR 3 + OBS 5 = 114  CONFIRMED
subtractive equation       117 − S1 − S2 − S3 = 114                        CONFIRMED
authority matrix §8.3      every one of the 114 IDs appears exactly once;
                           no subtracted/internal ID (IAM-16, BRN-11, REL-03)
                           is counted                                      CONFIRMED
Permission census          25 names enumerated and cross-mapped            CONFIRMED
record classes             7+2+5+8+2+3+3+3+4+3+2+2+2 = 46                  CONFIRMED
owners                     13 enumerated, each with explicit inflation bar CONFIRMED
journeys                   contract.md journeys A–O (15) each map to the
                           Evidence §4 scenario table with an operation,
                           protocol, or honest non-Product/deferred home   CONFIRMED
branch integrity           the truncation/restore pair (3405318/d296852)
                           was diffed; HEAD content is byte-identical to
                           the pre-truncation tree; empty "noop" commits
                           carry no content                                CONFIRMED
```

`npm run verify` was independently reproduced **green on the exact candidate HEAD `d296852a`** in a WSL2 Ubuntu Linux-filesystem worktree per `AGENTS.md` (repository hygiene 167 tracked files, documentation index/reachability, canonical current state, qualification provenance all passed; 39/39 repository tests pass), independently confirming CI Verify #177. Note: verify correctly **fails** on this review branch tip itself — the hygiene guard rejects `docs/work/**` contamination, which is the intended proof that this review channel can never enter the merge candidate. A first attempt outside WSL2 failed on script path joining (`C:\C:\...`), consistent with the `AGENTS.md` WSL2 mandate being load-bearing.

### Findings

#### 4A-IR-01 — PAR-08 investigator route is internally contradictory (MATERIAL CANDIDATE)

`operation-ledger.md` §5.8 table row `PAR-08 ListApprovalRequests` names as consumer "current eligible approver UX **or separately authorized investigation**". Three other authority statements at the same HEAD contradict that:

- the canonical §8.3 matrix row for `PAR-08` admits only `agent.effect.approve` + exact current approver eligibility, with no investigator route;
- the §5.8 closing prose grants the separately authorized `audit.read` investigator route to **`PAR-09` only**;
- `permission-contract.md` §3.3 defines `audit.read` as covering the "investigator route of `PAR-09`" only, and §3.6 repeats it.

Because the ledger declares the §8.3 matrix canonical for cross-cutting authority fields, the `PAR-08` table-row consumer text is most plausibly a stale pre-F08 remnant. Left unadjudicated, 4B could legitimately wire an `audit.read` listing route onto `PAR-08`, widening disclosure of approval subjects to investigators beyond what the Permission contract admits — a disclosure-relevant divergence inside a candidate that claims complete closure.

Smallest correction: strike "or separately authorized investigation" from the `PAR-08` table row (investigators reach exact subjects via `OBS-04/05` audit records and `PAR-09` read-only), **or** explicitly extend the `audit.read` investigator route to `PAR-08` in the matrix, the §5.8 prose and `permission-contract.md` simultaneously. Either way one authority statement must win everywhere.

#### 4A-IR-02 — BUD-01/BUD-02 result-coordinate binding is asserted but not decided (MATERIAL CANDIDATE)

`budget-analyzer-contract.md` §6 states `ListPendingBudgets` runs "under the same accepted semantic filters, source scope **and result coordinate**" as the analytical snapshot, and §3.4 forbids caller-selected `as_of`. The contract never decides the mechanism-free semantic question: **may the caller reference the exact system-issued result coordinate it was shown, or is cross-call coherence simply not promised?**

Consequence if left open: summary (`BUD-01`) and drilldown (`BUD-02`) — or page N and page N+1 of one drilldown — can silently straddle a read-model refresh. Each response truthfully carries its own `as_of`, so no truth state is violated, but the contract's own "same result coordinate" sentence is then unsatisfiable as written. This is a 4A-level semantic decision, not 4B wire detail: either

- admit an **echoed system-issued coordinate reference** (not arbitrary history — only coordinates the system itself issued and still retains) with an explicit outcome (e.g. `SUPPORTED_STALE` or a coordinate-expired refusal) when it is no longer servable; or
- delete/weaken the "same result coordinate" sentence and state explicitly that cross-call snapshot coherence is disclosed via `as_of` but not guaranteed in F1.

Both resolutions keep `N_budget = 2`. Adjudication required before 4B fixes a wire shape on an undecided semantic.

#### 4A-IR-03 — grouped IC profiles leave per-operation disjunctions (MINOR)

Matrix rows `WS-03..06` ("writes `IC1/IC2`") and `REL-06` ("`IC2/IC3`") assign disjunctive profiles without binding which write gets which. The `PAR-11..16` row shows the candidate already knows the better form ("create `IC3`; revise/enable `IC2`; disable `IC1`"). The closure claim "IC profile 114/114" is technically met but the phase contract §12.10 intent — obligations *marked* before mechanism selection — is weakened where a disjunction survives. Bind each grouped write to one profile (for `REL-06`, state whether both IC2 and IC3 obligations apply conjunctively, which the row likely intends).

#### 4A-IR-04 — creation-idempotency asymmetry `IAM-03` vs `WS-01` (MINOR)

Both are trusted `platform_operator` creation commands, yet `ProvisionAccount` is `IC2` (expected-current-subject precondition — vacuous for a first create) while `CreateWorkspace` is `IC3` (repeatable intake). Either `IAM-03` also warrants `IC3` (stable semantic subject identity, e.g. the provisioned identity, so duplicate intake cannot double-provision) or the reason for the asymmetry should be stated. Related: `IAM-15`'s "expected current subject **when present**" makes its `IC2` conditional on the update path; acceptable, but worth one clause noting the create path relies on the uniqueness/conflict law instead.

#### 4A-IR-05 — `PAR-01` consumer wording vs PA-only matrix route (MINOR)

Ledger table `PAR-01 ListConversations` says "current **app/owner** disclosure", suggesting a Control-Plane owner route, but the §8.3 matrix admits only `PUBLISHED_APP_HUMAN / PA` for `PAR-01..04`. Journey J supports the PA-only reading (Control-Plane inspection flows through `PAR-06/07` runs and OBS). Align the table wording with the matrix or state the intended owner-disclosure route.

#### 4A-IR-06 — `permission-contract.md` consumer lists omit mapped operations (MINOR)

§3.2 `project.read` "material current consumers" omits the `PAR-06/07` Control-Plane route that the ledger matrix maps to `project.read`. Since these columns are being read as closure evidence, the omission invites doubt about which document is complete. Add the missing consumers or mark the column explicitly non-exhaustive.

#### 4A-IR-07 — negative budget age is unclassified (MINOR)

`budget_age_days = as_of − canonical business date` can be negative for a future-dated Budget document. The four accepted bands start at 0; the contract does not say whether a negative age is clamped into `AGE_0_3`, excluded, or surfaced as an indeterminate/provenance state. One sentence closes it; silence invites a 4D implementation choice to become de-facto Product meaning — exactly the failure class 4A exists to prevent.

### Falsifiers attacked with no finding

```text
missing accepted journey/consumer        HELD — journeys A–O all covered or honestly deferred
speculative / CRUD / mechanism operation HELD — 46/46 dispositions verified; rejects list sound
owner collision / hidden owner           HELD — cross-owner atomics (PRJ-03/11/14) are declared
                                         compositions with one primary owner
unsafe universal Project executor        HELD — grammar exact-Release pinned; forbidden-authority
                                         list explicit; BRN-12 remains bounded platform regime
Permission from Keycloak/app role/UI     HELD — explicit non-principals and anti-expansion rules
cross-scope disclosure oracle            HELD — 403/404 law fixed pre-wire (F09) and correct
before-only authority check              HELD — IC1/IC2 recheck-through-commit wording
stale subject/generation winning         HELD — IC2 + 412-class fixed
consequential intake duplication         HELD — IC3 routing present where intake repeats
OUTCOME_UNKNOWN blind replay             HELD — IC4 fence; Gateway rejects retry shortcuts
unknown/partial/stale → zero/current     HELD — ANALYTIC profile + OBS-03 missing != zero
Budget source mapping → Product meaning  HELD — mapping stays Evidence; reopen law correct
arbitrary caller-selected as_of          HELD — system-resolved coordinate (but see 4A-IR-02)
approval surface conferring eligibility  HELD — F08 adjudication correct across all three docs
                                         except the PAR-08 remnant (4A-IR-01)
internal mechanics promoted to API       HELD — BRN-11/REL-03 subtractions sound; Builder/MAR/
                                         Gateway mechanics stay internal; Blueprint/Forge rejected
```

### Scope discipline

This review did not reopen the completed SoftwareForge review, did not open 4B, did not edit any candidate authority document, and does not authorize merging PR #54 or Product implementation. Findings are Evidence against HEAD `d296852a` for Lead adjudication under the roadmap's post-review sequence.
