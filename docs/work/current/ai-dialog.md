# 3O — Independent Fable Review Channel

> **TEMPORARY / NON-AUTHORITATIVE / REVIEW EVIDENCE ONLY**
>
> This file is the only permitted delta on `review/3o-fable` relative to the frozen 3O candidate. It must never enter the merge candidate or `main`.

## Lead handoff — Round 1

```text
Repository:       developmentconexus-ops/conexus-os
Candidate branch: arch/3o-vertical-proof-contract
Candidate HEAD:   e4ca1d59b421849548c4fb57c85753d32bbf3348
Candidate PR:     #47
Review branch:    review/3o-fable
Phase:            3O — Vertical Architecture Proof Contract
3N:               CLOSED / OPERATOR RATIFIED
3O:               OPEN / ACTIVE
C-018:            NOT RATIFIED
Implementation:   BLOCKED
Candidate CI:     Verify #71 SUCCESS
```

## Review protocol

1. Reconstruct current authority first from `AGENTS.md → docs/index.md → docs/roadmap.md → only the task-specific current owners`; this handoff is Evidence, not authority.
2. Apply DevelopmentConexus Engineering Method v1.0.0 and Repository Standard v1.0.0.
3. Review the 3O candidate as the smallest contract that must let the first real Budget Analyzer build genuinely falsify the accepted architecture end-to-end.
4. Do not reopen 3A–3N, re-run 3L, or add Product requirements unless a material falsifier requires the smallest owning authority to reopen.
5. Search for a better Global Maximum and run an explicit deletion/YAGNI challenge. Prefer less contract surface if the same real falsification remains possible.
6. Distinguish proof-contract semantics from Product semantics. Flag any proof vocabulary that accidentally creates user-visible Product behavior, business KPI meaning, runtime/database mechanism, or a new authority.
7. Do not demand implementation/runtime/production proof from 3O. `3O_CONTRACT → FIRST_BUILD` remains the accepted split unless current authority materially contradicts it.
8. Challenge the independent-oracle requirement against the risk of shared business derivation, circular proof, source drift, and temporal mismatch without selecting realization mechanics prematurely.
9. Challenge forward routing for omission or waiver: every 3N explicit-minimum ID, Architecture §42 family, 3M routed intake, data CR-1, and managed-execution routed obligation must survive at the correct first applicable real stage.
10. `NOT_INSTANTIATED` may classify an actually unreachable property in the first slice; it must not become a discretionary waiver. Attack whether the contract is strong enough to prevent that abuse without inventing a generic proof engine.
11. Review the repository-status guard changes as mechanism only: they should admit one `OPEN / ACTIVE` phase without weakening phase order, C-018, Product-blocking, or closed 3N checks.
12. Research current external references only when materially useful; external material never creates Product authority.
13. Do not edit candidate authority, begin Product implementation, ratify C-018, or execute live Sankhya/production effects.
14. **Edit only this `docs/work/current/ai-dialog.md` on `review/3o-fable`.** Append the review under `## Fable — Round 1`, commit and push only this file.
15. Round 2 is justified only if a real material contradiction survives Lead adjudication/correction.

## Mandatory attack questions

### A. Contract sufficiency and minimality

```text
A1. Do 3O-P1..P7 form the smallest coherent contract that can genuinely falsify 3N-V28, or is any item redundant / missing?
A2. Does the representative-case rule cover every materially distinct source-to-Product transformation without turning into an exhaustive KPI matrix or allowing cherry-picked happy paths?
A3. Does the contract provide a real falsifier rather than a future implementation checklist that could pass by declaration?
A4. Is requiring the furthest stable Product-owned result boundary necessary and proportionate, or does it over-specify realization?
```

### B. Oracle and truth independence

```text
B1. Can the proposed oracle remain independent if it shares accepted semantic definitions and commodity connection mechanics with the candidate?
B2. Is the line between shared semantics and shared result-producing derivation precise enough to catch circular proof?
B3. Can a read model prove itself indirectly through copied SQL, shared transformation code, cached candidate values, or correlated fixtures despite the current wording?
B4. Does temporal/data closure avoid both false pass and false mismatch without prematurely selecting CDC/watermark/snapshot mechanics?
```

### C. Product-authority leakage

```text
C1. Are MATCH/MISMATCH/UNSUPPORTED/INDETERMINATE clearly proof outcomes, or did 3O accidentally create Product-visible response semantics?
C2. Does “every exposed analytical result resolves to current accepted semantics” preserve existing Product/Brain authority or strengthen it beyond accepted scope?
C3. Did 3O accidentally invent KPI mappings, tolerances, formulas, source-table assumptions, or required user behavior?
C4. Does the negative-control language accidentally authorize fake runtime Evidence beyond its narrow purpose of proving the comparison guard can fire?
```

### D. Forward-routing integrity

```text
D1. Is preserving 3N-V01..V24 with EXECUTED/NOT_INSTANTIATED enough to prevent silent obligation loss?
D2. What concrete abuse could mark an applicable property NOT_INSTANTIATED, and does current authority already supply the needed admission rule?
D3. Are 3M current/exact-pin, unknown-preservation, storage/dependency, generation-continuity, Gateway-fence and idempotency-scope obligations actually preserved by the 3O manifest route?
D4. Is CR-1 correctly conditional on the first build instantiating a qualifying security-sensitive mutation, given the vertical is intentionally read-only?
D5. Are §42 families preserved without forcing the Budget Analyzer to manufacture unused Product Agent/effect/job/production capabilities?
```

### E. Repository mechanism and closure

```text
E1. Do the `OPEN / ACTIVE` guard changes preserve exactly one current phase and legal sequencing, or did they widen repository status semantics unnecessarily?
E2. Does the closed 3N checker remain a valid closure guard after accepting 3O ACTIVE, with all substantive 3N checks unchanged?
E3. Is a dedicated pre-implementation 3O checker unnecessary because it would only prove documentation/fixtures, or is there a material static guard missing?
E4. Does the 3O closure gate stop before C-018 and Product implementation exactly as required?
```

## Expected output

Please include:

```text
Overall verdict
Material Findings count
Non-material Findings count
3A–3N reopen required? YES/NO + exact smallest scope
3L requalification required? YES/NO + exact trigger if yes
New Product requirement proposed? count + explicit identification
Global Maximum conclusion
YAGNI/deletion conclusion
3O falsifiability conclusion
Oracle-independence conclusion
Forward-routing conclusion
Repository-guard conclusion
```

For each material finding state:

```text
Finding ID
challenged claim
current authority/evidence that decides it
concrete failure class / counterexample
why material
smallest correction or STOP/SPLIT prerequisite
whether it changes Product authority or only proof/projection/mechanism
reopen trigger if accepted
```

Do not approve by agreement. If the candidate survives, identify the strongest counterexamples attempted and why they fail.

---

## Fable — Round 1

Reviewer: Claude Fable 5 (independent), review branch `review/3o-fable`, candidate HEAD `e4ca1d59b421849548c4fb57c85753d32bbf3348` (PR #47).

Authority was reconstructed from `AGENTS.md → docs/index.md → docs/roadmap.md`, then the task-specific owners: `docs/phases/3o-vertical-architecture-proof-contract.md` (candidate), `docs/phases/3n-architecture-verification.md`, `docs/architecture/index.md` §§42–44/46, `docs/reference/data-and-persistence.md` §§5.4/6.4/6.5, `docs/product/contract.md` §2.3 and Journey N, `docs/reference/managed-execution-qualification.md` routed 3N/3O obligations, plus the full candidate diff (6 files, 272 insertions) against merge base `a0740b2`. The handoff block was treated as Evidence only; every load-bearing claim below was checked against current repository authority directly.

### Summary block

```text
Overall verdict                     SURVIVES WITH BOUNDED MATERIAL CORRECTIONS — no accepted-architecture contradiction; 3 material findings, all correctable inside the 3O candidate
Material Findings count             3
Non-material Findings count         4
3A–3N reopen required?              NO
3L requalification required?        NO
New Product requirement proposed?   0
Global Maximum conclusion           No smaller contract found that preserves genuine falsification; no structural surplus found beyond the findings
YAGNI/deletion conclusion           Deletion challenge run against every 3O-P ID and the routing table; nothing deletable without losing a distinct falsifier class
3O falsifiability conclusion        Genuinely falsifiable in structure (P2/P4/P6 core is real), with two precision defects (F-3O-02, F-3O-03) that leave declaration-shaped escape hatches
Oracle-independence conclusion      Independence line (shared semantics + commodity transport allowed, shared result-producing derivation forbidden) is correct; one admission-source ambiguity can smuggle candidate semantics into the oracle (F-3O-03)
Forward-routing conclusion          No omission or silent waiver found: 3N-V01..V28, §42 families, 3M intake rows, data CR-1 and managed-execution obligations all survive at their correct first applicable real stage; NOT_INSTANTIATED is adequately fenced by the reachability definition plus named-reason Evidence
Repository-guard conclusion         OPEN / ACTIVE admission is correctly narrow (exactly one active phase, ACTIVE and NEXT mutually exclusive, order preserved, negative control added); but the 3N checker now makes the 3O closure transaction itself fail verify (F-3O-01)
```

### Material findings

#### F-3O-01 — 3O closure transaction cannot pass its own gate (CONFIRMED empirically)

```text
Challenged claim:      3O closure gate item 8 — "the same closure head updates the roadmap to 3O = CLOSED … then npm ci && npm run verify passes again before merge"
Deciding authority:    docs/phases/3o-vertical-architecture-proof-contract.md closure gate; scripts/check-architecture-verification.mjs (mechanism); package.json verify chain
Failure class:         self-contradictory closure transaction — the specified closure head is mechanically unverifiable
Why material:          identical defect class to 3N finding F-05 (closure transaction incoherence), which was adjudicated ACCEPTED in 3N; the contract's own exit condition is unsatisfiable as written
Smallest correction:   widen the 3N-CLOSED branch of check-architecture-verification.mjs to admit 3O = CLOSED (['NEXT / NOT STARTED', 'OPEN / ACTIVE', 'CLOSED']), with a negative control that an illegal 3O status still fires; alternatively the gate text must explicitly include the checker amendment in the closure head — the first option is smaller
Authority impact:      mechanism only; no Product/architecture authority change
Reopen trigger:        none — correctable inside the 3O candidate
```

Empirical demonstration on the candidate tree: with the roadmap mutated to `3O = CLOSED` (the exact state gate item 8 requires), `node scripts/check-architecture-verification.mjs` fails with `3O must be NEXT / NOT STARTED or OPEN / ACTIVE after 3N closure` (exit 1). That checker runs inside `npm run verify` via `repository:check`, so gate items 5 and 8 contradict each other on the closure head. The roadmap was restored after the probe; the review branch tree is clean.

#### F-3O-02 — representative-set coverage is claimable by declaration

```text
Challenged claim:      "live reconciliation requires the smallest representative set that covers each materially distinct source-to-Product transformation rule actually used by the first vertical" (Proof-case admission, closing paragraph)
Deciding authority:    3O contract Proof-case admission + 3O-P4/3O-P7; 3N-V28; Architecture §46 line 28
Failure class:         cherry-picked happy paths — the first build classifies its own transformations, exhibits no rule inventory, tests the easy classes, and P4 passes while a materially distinct untested rule diverges silently
Why material:          coverage completeness is the load-bearing quantifier of 3O-P4; P7 pins per-case identity but nothing requires Evidence from which omission of a whole rule class is even detectable, so the coverage claim passes by declaration — exactly the failure mode the contract's own admission section exists to prevent
Smallest correction:   one Evidence requirement in Proof-case admission: the first-build proof must exhibit (a) the enumerated inventory of Product-visible analytical results (which 3O-P1 already makes enumerable), (b) the declared transformation-rule classes over that inventory with the expansion triggers applied, and (c) the case→rule mapping — so that under-coverage is adjudicable from Evidence rather than trusted from declaration; no new engine, record class, or KPI matrix required
Authority impact:      proof contract only; no Product authority change
Reopen trigger:        none — correctable inside the 3O candidate
```

#### F-3O-03 — admission item 3 lets candidate execution Evidence supply comparison semantics

```text
Challenged claim:      "A first-build reconciliation case is admissible only when it resolves all of the following from current authority or exact execution Evidence: … 3. grain, dimensions, filters, unit/null semantics and business-time meaning needed for the comparison"
Deciding authority:    3O contract Proof-case admission item 3 vs 3O-P1 and the Oracle-independence section; 3N-V28 ("unsupported KPI fabricated"); Unsupported-semantic-protection diagram ("inferred formula becoming authority" is an -X-> edge)
Failure class:         circular semantics — the candidate implementation silently applies a filter/grain rule current authority never defined (e.g. "exclude cancelled budgets"); the case is admitted with item 3 resolved from the candidate's execution Evidence; the oracle applies the same derived spec for comparison closure; both sides MATCH; an implementation-invented meaning is confirmed by the proof. The four oracle prohibitions do not cover this: nothing was read from the read model, no candidate function was reused, no fixture was copied — the leak is in the comparison specification itself
Why material:          this is the B2/B3 circular-proof line the contract must hold precisely; as worded, admission item 3 contradicts both 3O-P1 (which would classify the invented meaning UNSUPPORTED) and the -X-> "inferred formula becoming authority" edge, and an implementer reading "or exact execution Evidence" as authorization has textual support
Smallest correction:   split the admission sources — semantic content (items 1 and 3) resolves only from current accepted authority, with unresolved meaning falling to UNSUPPORTED/INDETERMINATE per P1/P5; exact execution Evidence may resolve only identity/provenance/coordinate items (2, 4, 6, 7). One sentence; no mechanism selected
Authority impact:      proof contract only; no Product authority change
Reopen trigger:        none — correctable inside the 3O candidate
```

### Non-material findings

```text
N-01  scripts/check-current-state.mjs bootstrap restatement regex catches "OPEN / ACTIVE" and "3X = OPEN" but not e.g. "3O = ACTIVE"; heuristic guard, roadmap remains sole status authority — optional hardening only.
N-02  3O-P6 wording "changes one side outside the live-source oracle" is parseable two ways (perturb the non-oracle side vs. perform the control outside the oracle); the intent (never tamper with oracle-side truth, perturb the candidate/comparison input deterministically) deserves one clarifying clause.
N-03  Both state checkers crash on native Windows (`new URL('../', import.meta.url).pathname` yields /C:/… and resolve() produces C:\C:\…); AGENTS.md already mandates WSL2 with a Linux-filesystem worktree, so this is an owned environment constraint, not a candidate defect. Noted because check-architecture-verification.mjs silently masks it when an explicit root argument is passed.
N-04  CR-1 routing observation (protocol D4): the conditional disposition is correct, and the condition should be expected to fire — "the first build" (contract wording, correctly broader than "the vertical") almost certainly instantiates qualifying security-sensitive mutations through platform flows (Published App access grants, Change acceptance, connection revoke racing a governed sync) even though the analytics surface is read-only. No text change needed; the manifest reviewer should treat CR-1 = NOT_INSTANTIATED with suspicion.
```

### Mandatory attack questions — adjudicated answers

```text
A1  3O-P1..P7 are pairwise non-redundant against 3N-V28: P2/P4 carry read-model-proving-itself, P1/P5 carry unsupported-KPI fabrication, P3 carries live-data closure, P6 proves the guard can fire, P7 makes outcomes adjudicable. Deletion of any one loses a distinct falsifier class. Nothing missing at the ID level; the two gaps found are precision defects inside existing IDs (F-3O-02, F-3O-03).
A2  The expansion-trigger list (grain / relationship path / temporal rule / aggregation class / null rule) correctly blocks an exhaustive KPI matrix, but cherry-picking is not blocked without exhibited coverage Evidence — see F-3O-02.
A3  P6's deterministic negative control plus P7 provenance make the core contract non-declarative; F-3O-02 is the one place a declaration survives.
A4  "Furthest stable Product-owned result boundary" is necessary (Project-DB-only capture would exempt post-DB Product logic — the exact 3N-V28 surface) and proportionate (it is what allows rejecting universal browser automation in the YAGNI list). "Stable" is doing quiet work but is bounded by "that actually serves the analytical result".
B1  Yes — shared accepted semantic definitions and governed transport do not contaminate; the contract says this explicitly and correctly.
B2  Mostly precise; the one imprecision that catches real circularity is F-3O-03.
B3  Copied SQL/shared function/cached values/copied fixtures are each explicitly named and forbidden. The uncovered variant is shared comparison-spec derivation (F-3O-03).
B4  The coverage-equivalence invariant with INDETERMINATE fallback handles both false pass and false mismatch without selecting CDC/watermark/snapshot mechanics; "a freshness timestamp by itself is not proof" closes the obvious cheat.
C1  MATCH/MISMATCH/UNSUPPORTED/INDETERMINATE are proof outcomes only. Product-side honest omission/blocking of unsupported semantics already exists in the Product Contract (Journey N), so P1/P5 create no new user-visible response semantics.
C2  "Every exposed analytical result resolves to current accepted semantics" restates Journey N's existing honesty obligation and 3N-V28; no strengthening found.
C3  No invented KPI, tolerance, formula, source mapping or user behavior found; the tolerance rule (only when authority/business calculation requires it, never after observing a mismatch) is correctly fail-closed.
C4  The negative control is bounded to proving the comparison guard fires and explicitly does not require production/source mutation; combined with the First-build execution boundary's fixture limits, no fake-Evidence authorization leaks. Minor wording nit is N-02.
D1  Preserving V01..V24 by ID with EXECUTED/NOT_INSTANTIATED plus manifest-without-omission is sufficient against silent loss, given D2.
D2  The abuse ("declare an instantiated boundary unreachable") is fenced: NOT_INSTANTIATED is defined by reachability of owner/boundary/consumer, requires a named reason with concrete scope Evidence, inherits the original route on later instantiation, and §46 already supplies the admission rule ("first build that actually instantiates the relevant owner/boundary"). No generic proof engine needed.
D3  3M current/exact-pin, unknown-preservation, storage/dependency, generation-continuity, Gateway-fence and idempotency-scope rows are preserved by reference with their 3N dispositions and downstream routes intact; re-execution of 3N-executed rows is correctly not demanded.
D4  Correctly conditional — see N-04: the condition will likely fire via platform mutations, and the contract's "first build" wording already scopes it correctly.
D5  §42 families are preserved verbatim including the mandatory first-vertical live-source family, and the no-manufactured-capability clause matches Product Contract ("Product Agent required = NO") and §42's FIRST_BUILD definition exactly.
E1  Guard admits exactly one OPEN / ACTIVE, forbids ACTIVE+NEXT coexistence, preserves order and after-phase NOT STARTED, and ships a real negative control (dual-active test). No unnecessary widening found in the admission itself; the defect is at the far end of the transition (F-3O-01).
E2  All substantive 3N checks (owner set, dependency closure, model-spend wording, 46/16 data closure, §46 derivation, §42 families, bounded intake, budget_counter consumer) are byte-identical in the diff; only the progression branch changed.
E3  A dedicated pre-implementation 3O checker would only re-prove documentation against itself or hard-code a second falsifier catalog — both already rejected classes; the existing checker already guards §46/§42 preservation at the source. No material static guard is missing. Agreed.
E4  Closure gate items 4 and 8 stop exactly before C-018 and Product implementation; check-current-state keeps Product implementation BLOCKED unless C-018 is RATIFIED, and C-018 RATIFIED requires all phases closed. Coherent — once F-3O-01 is fixed.
```

### Strongest counterexamples attempted against the surviving core, and why they fail

```text
1. "Read-model freshness/row-count as sync proof"        — killed three times over: accepted data boundary, data owner §5.4, and P3's coverage-equivalence invariant.
2. "Manufacture a CR-1 mutation to score an EXECUTED"    — killed by the explicit no-manufactured-capability clause plus data-owner conditionality.
3. "Mark V01/V24 NOT_INSTANTIATED on a build that plainly instantiates workspace/storage boundaries" — killed by the reachability definition + named-reason Evidence + §46 admission rule.
4. "Oracle disqualified because it shares governed Connection transport" (over-independence attack) — correctly rejected by the contract; demanding a second transport stack would be structural YAGNI.
5. "UNSUPPORTED as new Product response vocabulary"       — fails; Journey N already owns honest omission/blocking, so no authority is created.
6. "Golden fixture blessed from first candidate run, reused as oracle truth forever" — killed explicitly by the fourth oracle prohibition.
```

### Verdict

The 3O candidate preserves the accepted read-only first-vertical boundary, creates no Product/KPI authority, imports 3N routing without omission, and its P2/P4/P6 core is a real falsifier rather than a checklist. No 3A–3N reopen, no 3L requalification, no new Product requirement. Three bounded material findings require correction inside the candidate before closure: F-3O-01 (confirmed closure-transition deadlock in the checker mechanism), F-3O-02 (coverage-by-declaration gap), F-3O-03 (admission-source circularity door). None changes Product authority; all are proof/mechanism corrections. Round 2 is warranted only if the Lead's corrections materially alter the contract surface beyond these three points.
