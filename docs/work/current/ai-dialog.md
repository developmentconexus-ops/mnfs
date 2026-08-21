# 3N — Independent Fable Review Channel R2

> **TEMPORARY / NON-AUTHORITATIVE / REVIEW EVIDENCE ONLY**
>
> This file is the only permitted delta on `review/3n-fable-r2` relative to the frozen corrected 3N candidate. It must never enter the merge candidate or `main`.

## Lead handoff — Round 1

```text
Repository:       developmentconexus-ops/conexus-os
Candidate branch: phase/3n-architecture-verification
Candidate HEAD:   34b0bdc9f71a1e9dcf39ecdc5190ee44d47d1ad6
Candidate PR:     #44
Review branch:    review/3n-fable-r2
Prior review PR:  #45 CLOSED / SUPERSEDED / NO FABLE REVIEW PERFORMED
Phase:            3N — Architecture Verification
3O:               NOT STARTED
C-018:            NOT RATIFIED
Implementation:   BLOCKED
```

### Review protocol

1. Reconstruct current repository authority first from `AGENTS.md → docs/index.md → docs/roadmap.md → task-specific current owners`; do not treat this handoff or reviewer history as authority.
2. Apply DevelopmentConexus Engineering Method v1.0.0 and Repository Standard v1.0.0.
3. Review **the accepted 3A–3M architecture as one coherent system through the 3N candidate**, not merely the checker implementation.
4. Research current external references when materially useful. In particular, use the repository Mitra and Factory AI research as comparative Evidence and current Mastra docs/Context7/source for framework-sensitive claims. External material never creates Product authority by popularity or analogy.
5. Search for a better **Global Maximum**: materially simpler, safer, more native, more implementable, or more future-proof without speculative machinery.
6. Apply an explicit deletion/YAGNI challenge. A semantic owner, durable class, boundary or contract survives only if removing/merging it breaks a current accepted requirement/failure class or creates a foreseeable forced retrofit that the current seam legitimately prevents.
7. Distinguish architecture defects from realization opportunities. If current Mastra or another substrate can replace custom mechanics without changing Product authority, classify it as realization simplification rather than architecture reopen.
8. Do not demand runtime/production proof from fixtures. Properties requiring Product code or real first-production topology must remain routed forward.
9. Reviewer findings are Evidence, never requirements. Any proposed new Product requirement/owner/trust boundary must be explicitly identified as NEW and cannot be smuggled into a correction.
10. Do not begin 3O, ratify C-018, implement Product code, re-run 3L by preference, or edit candidate authority.
11. **Do not edit any file except this `docs/work/current/ai-dialog.md` on `review/3n-fable-r2`.**
12. Append the independent review below under `## Fable — Round 1`, commit and push only this file.
13. Round 2 is justified only if a real material contradiction survives Lead adjudication/correction.

### Why this is a new review channel

The original pre-analysis review channel was invalidated before Fable ran. Lead analysis exposed that the first 3N candidate itself was too small and carried stale/routing defects.

The corrected candidate now includes:

```text
A. static closure
B. current-authority coherence
C. Global Maximum / comparative challenge
D. forward proof routing
```

Its CI on the exact frozen candidate reports:

```text
28 explicit minimum falsifiers
  24 FIRST_BUILD → FIRST_BUILD
   3 FIRST_PRODUCTION → FIRST_PRODUCTION
   1 3O_CONTRACT → FIRST_BUILD
12 downstream proof families
46 durable record classes
16 Tier-2 cross-module FKs
16 repository tests PASS / 0 FAIL
```

### Mandatory attack questions

At minimum, try to falsify the following.

#### A. Product / whole architecture

```text
A1. Does the current North Star actually require the current architecture, or did the system accrete platform machinery beyond the Product we intend to build?
A2. Can any of the 13 semantic owners be deleted or merged without losing a real current meaning/failure boundary?
A3. Are the seven L7 flows and one dependency inversion genuinely the minimum orchestration set, or is there hidden orchestration elsewhere / unnecessary centralization here?
A4. Does modular-monolith + PostgreSQL remain the Global Maximum for F1, or is there a concrete current requirement that makes it structurally wrong?
```

#### B. Mitra / Factory AI / product simplicity

```text
B1. Has Conexus preserved Mitra's key advantage — describe intent and inspect results — or does internal factory machinery leak into the required Product workflow?
B2. Is Change + proportional Plan + WorkUnit enough, or has Conexus underbuilt/overbuilt compared with Factory Missions/correctness/validation patterns?
B3. Does one persistent CodingSession per Change plus bounded ActorRuns and fresh material verification beat both forced fresh-per-unit and unbounded single-session approaches for our current consumer?
B4. Are we copying enterprise-grade software-factory ceremony into the Product where Mitra's simpler checklist/document approach would be enough?
B5. Conversely, are we relying too heavily on implementer self-validation where Factory evidence suggests independent validation is load-bearing?
```

#### C. Mastra / framework-native challenge

```text
C1. Can current Mastra-native coding/workspace/workflow/auth/redaction/eval capabilities delete custom Conexus mechanics while preserving owners?
C2. Does any Conexus owner exist only because an older Mastra version lacked a primitive?
C3. Are AgentController/createCodingAgent/Workspace/E2B boundaries being used according to current framework shape rather than forcing Mastra to imitate an invented harness?
C4. Are direct Agent for PAR and selective Workflow use still the right split?
C5. Does same-process BuilderMastra/PAR qualification remain bounded honestly to enabled surfaces?
```

#### D. Builder / correctness / evaluation

```text
D1. Can runtime/session/model narration manufacture Change/Plan/completion authority anywhere?
D2. Is correctness defined before decomposition strongly enough without introducing a generic Mission/Validation engine?
D3. Is Builder UX progressive disclosure a real downstream falsifier, or is it redundant with current Product truth laws?
D4. Does Worker Eval measure outcomes that can actually decide runtime/model quality — correctness, completion, rework, elapsed time, cost, human intervention — without becoming an analytics platform?
D5. Is independent material verification fresh enough in both cognition and candidate materialization?
```

#### E. Brain / data / enterprise meaning

```text
E1. Is one canonical Workspace Brain with explicit Project binding the minimum reusable enterprise-meaning authority, or could Project-local semantics suffice without future retrofit?
E2. Does Brain avoid becoming RAG/memory/policy/DB authority while still remaining usable?
E3. Is AnalyticQuery constrained enough to prevent runtime free-SQL/join invention without making analytics impractical?
E4. Does machine-propose/human-publish Discovery preserve truth without unnecessary ontology machinery?
E5. Does the first Budget Analyzer vertical remain intentionally read-only/minimal instead of being forced to exercise Product Agents/effects?
```

#### F. Data closure / 46 + 16

```text
F1. Recount the projected 46 durable record classes independently. Is every class justified by a current owner/consumer, or does any survive only by historical inertia?
F2. Challenge each family for duplicate authority / derivability / substrate duplication.
F3. Challenge the 16 Tier-2 FKs: is any unnecessary, and is any structurally required FK missing?
F4. Does projecting the exact 46/16 into the current data owner repair Fresh-Actor reachability without reintroducing historical-document bloat?
F5. Does any current claim still depend on removed historical authority that a Fresh Actor cannot reconstruct from current owners?
```

#### G. Connections / Gateway / Product Agents / managed execution

```text
G1. Is Connections + Gateway split necessary, or can it be smaller without losing credential/effect ownership?
G2. Does PAR + MAR + Gateway avoid a generic Digital Worker/Workflow domain while leaving a clean seam for future long-lived business processes?
G3. Can retry/recovery at Agent/job/runtime layers ever manufacture a second semantic effect?
G4. Is the semantic idempotency/reconciliation scope implementable without provider-specific abstraction explosion?
G5. Does managed sync remain the only real F1 MAR consumer rather than a hidden automation platform?
G6. Does Product Agent SCHEDULE stay distinct from MAR catch-up for a real reason?
```

#### H. Release / security / DEDICATED / recovery

```text
H1. Can Release/Promotion/active pointer/SERVED_VERIFIED be collapsed safely, or are the separate truths load-bearing?
H2. Is EnvironmentConformance proportionate or too broad before first build?
H3. Re-run the deletion challenge against DEDICATED `private_key_jwt` + exact ReleaseRef + short-lived bearer. Is this still the smallest honest server-to-platform trust seam while physical deployment remains deferred?
H4. Is the six-zone trust model classification-only as intended, or does it accidentally force deployment complexity?
H5. Does 3M owner-local recovery remain sufficient without a Recovery owner/FSM?
H6. Are first-production restore/authority/effect fences truly impossible to prove before real topology, and are they routed correctly?
```

#### I. 3N contract/checker integrity

```text
I1. Is architecture §46 correctly treated as an explicit minimum rather than an exhaustive universe?
I2. Are all §42 proof families carried, or did the candidate still drop a current obligation?
I3. Is the model-spend correction consistent with 3L-R1 — finite server-derived execution bounds + truthful cost/usage, without resurrecting hard monetary reservation?
I4. Is `3O_CONTRACT → FIRST_BUILD` the correct split for first-vertical proof, given that implementation is blocked until C-018?
I5. Does `scripts/check-architecture-verification.mjs` remain mechanism rather than a second authority? Identify every hard-coded semantic oracle that should instead be derived, or defend the remaining closed-set guards.
I6. Do the negative controls prove real guards rather than only fixture behavior?
I7. Is anything statically guardable missing that would materially improve falsifiability without building a formal architecture engine?
```

### Expected output

Please include:

```text
Overall verdict
Material Findings count
Non-material Findings count
Architecture/Product reopen required? YES/NO + exact smallest scope
3L requalification required? YES/NO + exact trigger if yes
New Product requirement proposed? count + explicit identification
Global Maximum conclusion
YAGNI/deletion conclusion
Mitra comparison conclusion
Factory AI comparison conclusion
Mastra/framework-native conclusion
3N proof-routing conclusion
46/16 data-closure conclusion
```

For each material finding state:

```text
Finding ID
challenged claim
current authority/evidence that decides it
concrete failure class / counterexample
why material
smallest correction or STOP/SPLIT prerequisite
whether it changes Product authority or only realization/projection
reopen trigger if accepted
```

Do not approve by agreement. If the architecture survives, identify the strongest alternatives/counterexamples attempted and why they lose.

---

## Fable — Round 1

<!-- Fable appends review here and edits no other file. -->

### Reconstruction and evidence base

Authority was reconstructed from `AGENTS.md` -> `docs/index.md` -> `docs/roadmap.md` -> task owners, not from this handoff. The handoff, the Lead global-coherence table and the prior review channel were treated as Evidence only.

Execution evidence produced for this review, on a Linux-filesystem worktree per `AGENTS.md`:

```text
frozen candidate 34b0bdc9f71a1e9dcf39ecdc5190ee44d47d1ad6, detached
npm ci && npm run verify   = PASS
3N architecture verification passed
  28 explicit minimum falsifiers: 24 FIRST_BUILD, 3 FIRST_PRODUCTION, 1 3O_CONTRACT->FIRST_BUILD
  12 downstream proof families; data 46 records / 16 Tier-2 FKs
tests 16 / pass 16 / fail 0
```

The handoff CI numbers reproduce exactly. Independent recount confirms architecture section 46 carried 28 falsifiers before and after the candidate, with exactly one semantic rewording (model spend), and that section 42 went from 11 to 12 proof families. Independent recount of `docs/reference/data-and-persistence.md:221` yields 46 record classes across the 13 declared schemas, and 16 Tier-2 FK rows, all resolving to existing schemas and record classes.

Falsification probes were run directly against `scripts/check-architecture-verification.mjs` using its own fixture mechanism. Results are cited inline below.

### Expected output

```text
Overall verdict                       = ARCHITECTURE SURVIVES / 3N CANDIDATE NOT READY TO CLOSE
Material Findings count               = 5
Non-material Findings count           = 10
Architecture/Product reopen required? = NO
                                        smallest scope touched by corrections:
                                        docs/phases/3n-architecture-verification.md,
                                        docs/architecture/index.md section 42,
                                        docs/reference/data-and-persistence.md section 6.5,
                                        docs/reference/builder-and-harness.md section 38,
                                        scripts/check-architecture-verification.mjs
3L requalification required?          = NO
New Product requirement proposed?     = 0 (one candidate considered and deliberately declined)
Global Maximum conclusion             = PRESERVED - modular monolith + PostgreSQL, 13 owners,
                                        7 L7 flows, 1 inversion, 4 infrastructure boundaries
YAGNI/deletion conclusion             = 1 surviving structural YAGNI candidate (gw.budget_counter);
                                        Lead reported 0
Mitra comparison conclusion           = PRESERVED; the candidate section 42 Builder UX addition is
                                        the correct carrier of the Mitra minimal-governance result
Factory AI comparison conclusion      = PRESERVED; correctness-before-decomposition and cold
                                        verification are both represented and correctly bounded
Mastra/framework-native conclusion    = no owner deletable by current Mastra; 2 realization-only
                                        simplification candidates, both out of 3N scope and both
                                        behind existing requalification triggers
3N proof-routing conclusion           = section 46/42 routing is correct, but 3N completeness is
                                        defined against too narrow an authority set (F-01)
46/16 data-closure conclusion         = countable, not yet verifiable (F-03, F-04)
```

---

### Material findings

#### F-01 - 3N completeness is defined only against architecture sections 42/46, while current authority routes named 3N obligations from at least three other current owners

```text
challenged claim
  3N-S5/3N-S6 establish that the candidate carries every current obligation, because the section 46
  explicit minimum and the section 42 proof families are both preserved.

current authority that decides it
  docs/phases/3m-failure-recovery-architecture.md:83 - the CLOSED phase that roadmap.md:11 says 3N
    "begins only from" - names eight 3N obligations: authority uniqueness, current/exact-pinned
    re-entry, unknown preservation, dependency/storage boundaries, generation-continuity/deny-only
    posture, Gateway new-admission fence, idempotency-scope validation, YAGNI deletion challenge.
  docs/reference/data-and-persistence.md:207 - CR-1: "3N/3O must prove both sides together."
  docs/reference/managed-execution-qualification.md:344 - architecture-wide duplicate-authority
    proof -> 3N/3O.
  docs/reference/managed-execution-qualification.md:577 - architecture-wide deciding-evidence
    completeness -> 3N/3O.
  docs/phases/3n-architecture-verification.md:7 cites only architecture sections 2, 4, 4.1, 42-47.
  None of the four sources above is cited, carried, re-routed with a reason, or adjudicated.

concrete failure class / counterexample
  CR-1 is the sharpest case. Current authority states that current-authority serialization and
  owner-scoped persistence must be proven together at 3N/3O, precisely because proving either alone
  permits a realization that satisfies one and violates the other. The candidate carries neither
  side and routes nothing in its place. 3N closes, 3O inherits a contract that never mentions CR-1,
  and the first build is free to satisfy serialization with a broad umbrella role. Recovering this
  later reopens 3E/3H rather than 3N.
  Of the eight 3M items, four are silently re-routed away from 3N (re-entry -> V14/V16 FIRST_BUILD;
  generation continuity -> V25/V26 FIRST_PRODUCTION; new-admission fence -> V12; idempotency scope
  -> V13) and at least three are not carried at all (authority uniqueness / duplicate-authority
  proof; unknown preservation; storage boundaries). Re-routing may well be correct - but it is a
  decision against closed 3M authority and it was made without being stated.

why material
  The 3N-S6 falsifier is "an implementation-dependent accepted family is dropped because it was not
  one of the explicit section 46 lines". That is exactly this failure, one level up: obligations
  were dropped because they were in neither section 46 nor section 42. The completeness claim is
  therefore unsound, and no guard can detect it, because the checker derives only from the two
  sections that already agree with it.

smallest correction
  Add one table to docs/phases/3n-architecture-verification.md enumerating every current durable
  document that names 3N as a proof stage, each row marked EXECUTED_IN_3N /
  RE_ROUTED_TO_<stage>_BECAUSE_<reason> / NOT_APPLICABLE_BECAUSE_<reason>. Then extend the checker
  with the same derivation it already performs for section 46: scan current durable docs for the 3N
  routing token and require each hit to be covered by a row. Mechanism over existing text, not a
  new authority.

authority impact
  Realization/projection of the 3N contract only. No Product or architecture authority changes.

reopen trigger if accepted
  Any obligation adjudicated as re-routed that a later stage proves incapable of falsifying reopens
  the smallest implicated owner, not 3N.
```

#### F-02 - 3N introduced a new Worker Eval measurement obligation into architecture authority with no owning reference

```text
challenged claim
  The candidate section 42 edits are repairs of an under-projected list, not new requirements.

current authority that decides it
  docs/architecture/index.md:274 (added by bebf988) states that Worker Eval outcome quality is
  judged on representative correctness/completion, rework/correction burden, elapsed time, cost and
  required human intervention where measurable, and that usage/token/parallel-agent counts are not
  evidence of engineering effectiveness.
  Its owning reference, docs/reference/builder-and-harness.md:359 section 38.2, states a different
  and narrower purpose - measure current primary runtime/model, compare a challenger on a material
  trigger, avoid selection by anecdote - and was not updated.
  git log -S on the phrase "rework/correction burden" across all refs returns exactly one commit:
  bebf988.
  The same wording appears at docs/phases/3n-architecture-verification.md:117 as the Lead
  pre-review challenge row, so review-channel framing became architecture authority.

concrete failure class / counterexample
  Two authorities now describe what Worker Eval must measure, and they do not agree.
  docs/architecture/index.md:3 and section 49 both state that detailed accepted homes are
  controlling for exact semantic depth. A Fresh Actor routed by docs/index.md to the Builder
  reference for Builder/Harness work never sees the metric contract; a Fresh Actor reading
  section 42 sees a normative measurement list with no owner. This is a direct instance of the
  section 2 law "one semantic authority per meaning" failing inside the phase whose job is to
  check it.

why material
  It is a new Product obligation created by the verification phase, unmarked as NEW, sourced from
  the review channel own framing. The sibling addition at docs/architecture/index.md:272 is by
  contrast a faithful projection of docs/reference/frontend-and-product-surfaces.md:103
  section 33.8 and is correct - so this is a specific defect, not an objection to the section 42
  repair as such.

smallest correction
  Either delete docs/architecture/index.md:274 and keep only the section 42 family name, or route
  the metric contract into section 38.2 through the ordinary Decision Loop and have section 42
  reference it. The family rename to "outcome quality" is fine either way.

authority impact
  Product/architecture authority. Must be marked NEW if retained.

reopen trigger if accepted
  None beyond the ordinary section 47 Builder family trigger.
```

#### F-03 - the newly frozen 46-class inventory contains one record class that cannot be justified from current authority

```text
challenged claim
  docs/reference/data-and-persistence.md:219 - the projection "preserves the accepted 3E closure
  directly so a Fresh Actor can verify this load-bearing boundary without Git archaeology".

current authority that decides it
  docs/reference/data-and-persistence.md:230 lists gw: effect_attempt / idempotency_claim /
  budget_counter. budget_counter occurs exactly once in the entire current documentation set.
  Its only support anywhere is one unelaborated line, docs/reference/integrations-and-gateway.md:70
  "external-effect unit/budget authority", plus the single word "budgets" in the Mastra mapping.
  There is no Product Contract section 5 entity, no state model, no section 46 falsifier, no
  section 42 proof family, no section 47 reopen trigger and no journey.
  Against the admission test the candidate itself printed at
  docs/reference/data-and-persistence.md:240 - one current owner, a real durable consumer/invariant,
  non-derivability from sufficient authority - the owner is present and the durable
  consumer/invariant is absent.
  docs/architecture/index.md:130 rejects a generic Budget owner and :348 rejects a generic
  BudgetService/quota engine; docs/reference/managed-execution.md:115 section 28.3 defers monetary
  enforcement entirely for F1.

concrete failure class / counterexample
  Every other one of the 46 classes resolves to an owning section within one hop. Every section 43
  future seam costs zero durable classes - that is the stated no-dormant-machinery law, and
  recovery in particular is fully expressed across sections 45, 19.4.3 and 34.4 with zero new
  classes. budget_counter is the single class in the inventory with a reserved shape and no
  consumer, which is exactly the form the section 43 law forbids.

why material
  3N routed obligations include the YAGNI deletion challenge
  (docs/phases/3m-failure-recovery-architecture.md:83), and the candidate froze the count at 46 and
  mechanised it without re-running the per-class admission test it published in the same edit. The
  Lead reports "surviving structural YAGNI = 0"; this is one.

smallest correction
  Either project the missing durable consumer/invariant for gw.budget_counter into
  docs/reference/integrations-and-gateway.md section 19, or delete the class, close the inventory
  at 45 and update docs/reference/data-and-persistence.md:217. Data-owner scope only.

authority impact
  Projection/data-closure authority. No Product Contract reopen; no owner added or removed.

honest limit
  I do not claim deletion is correct. I claim the class is unjustifiable from current authority,
  which is the standard this candidate set for itself.

reopen trigger if accepted
  A real F1 external-effect unit/quota consumer restores the class through the Decision Loop.
```

#### F-04 - the Tier-2 FK closure was made countable but not verifiable, and the checker never resolves what it counts

```text
challenged claim
  3N-S4 pass condition - "mismatch between the declared 16-FK Tier-2 allowlist and its current
  projected entries" is guarded.

current authority that decides it
  docs/reference/data-and-persistence.md:240 gives the record inventory an explicit admission test.
  The Tier-2 allowlist at :242 receives none. All 16 entries target only ws.workspace, ws.area and
  prj.project, so a stateable admission rule plainly exists - it is simply not projected.

concrete failure class / counterexample
  Probe P4: replacing entry 16 with xyz.invented_record.nope_id -> nowhere.missing(id) - a schema
  outside the 13 declared at :211 and a record outside the 46 at :230 - PASSES the checker, exit 0,
  and still prints "16 Tier-2 FKs".
  Probe P5: renaming budget_counter to generic_budget_service - a name section 44 explicitly
  rejects - PASSES the checker, exit 0, and still prints "46 records".
  Both tables are already parsed by the checker; neither is resolved against the other or against
  the 13 declared schemas.
  Because no admission rule is stated, the F3 question is unanswerable from current authority:
  par.conversation, par.agent_run, mar.job_run, gw.effect_attempt and brn.knowledge_proposal are
  all Project- or Workspace-scoped and none carries a Tier-2 FK, while mar.serving_route and
  att.attachment do. That asymmetry may be exactly right - the Tier-2/Tier-3 split is defensible -
  but a Fresh Actor cannot derive it, which is the failure the projection was written to fix.

why material
  The load-bearing 3E closure is currently guarded by two integers. The candidate achieved
  countability and reported it as verifiability.

smallest correction
  (a) one sentence stating the Tier-2 admission rule beside the 16;
  (b) checker: resolve every FK endpoint schema.record against the 13 declared schemas and the 46
      projected classes, and require every declared schema to hold at least one class. Roughly ten
      lines over data the checker already parses, plus two negative controls.

authority impact
  Projection + mechanism. No Product authority change; the 16 entries themselves survive.

reopen trigger if accepted
  A required FK that the stated rule cannot express reopens the smallest data-owner Decision Loop.
```

#### F-05 - the closure gate omits the roadmap transition, so the exact reviewed head cannot legally become main

```text
challenged claim
  docs/phases/3n-architecture-verification.md:151 - the seven-item closure gate is sufficient for
  3N to close "on the exact candidate head".

current authority that decides it
  docs/roadmap.md:11 carries 3N = NEXT / NOT STARTED and :26 states that 3N now owns the exact next
  action, namely to define the bounded architecture verification contract.
  scripts/check-architecture-verification.mjs:43 legally permits that status. The gate never
  requires flipping 3N to CLOSED and 3O to NEXT / NOT STARTED.

concrete failure class / counterexample
  The frozen head merges to main asserting that 3N has not started while the 3N contract, its
  checker and its tests are on main and run inside npm run verify. A Fresh Actor following
  AGENTS.md -> roadmap.md is instructed to define a contract that already exists and already
  executes. Performing the flip afterwards produces a head that no independent review examined,
  which defeats gate item 4.

why material
  It is the one closure step that makes main self-consistent, and it is the only gate item that the
  3N-S4 coherence check exists to protect.

smallest correction
  Add gate item 8: the closure commit updates the roadmap 3N/3O rows, the text block and the
  next-action sentence in the same head, and re-runs verify. Legality of the resulting pair is
  already enforced by check-current-state.mjs:28-36 and check-architecture-verification.mjs:41-49.

authority impact
  Process/projection only.

reopen trigger if accepted
  None.
```

---

### Non-material findings

```text
N-01 negative-control coverage is 8 of 26 error paths in the checker. Probes P2 and P3 confirm the
     owner-local recovery law guard (:80) and the single-inversion guard (:102) do fire, but neither
     has a control, nor do the infrastructure-boundary set, FK count, FK duplicates, duplicate
     falsifier, missing/duplicate routing id, invalid routing syntax or invalid proof routing. The
     contract requires a control where a static guard can honestly exist; all of these qualify. The
     one guard that had no control - the FK parser - is precisely the one that shipped broken in
     bebf988 and needed 34b0bdc.
N-02 scripts/check-architecture-verification.mjs:124-127 uses the literal heading
     "FK allowlist - 16" as the END marker of the record-inventory section. Probe P1: a legitimate
     amendment to 17 FKs makes the record guard report projected=0, declared=NaN and emit a boundary
     error naming the wrong artifact. It fails closed, but a lawful amendment misdiagnoses and
     silently disables the 46-class guard. Derive the marker from the heading prefix.
N-03 the root is taken from the environment (:5-7). Setting CONEXUS_ARCH_VERIFY_ROOT to any
     directory makes npm run repository:check print "3N architecture verification passed" while the
     repository is missing a section 46 falsifier (verified). Residual risk is bounded because the
     test suite re-anchors the root, so npm run verify still goes red. Take the root from
     process.argv[2] instead; the tests can pass it explicitly and the env var disappears.
N-04 :120-122 hard-codes the current section 46 falsifier text, duplicating content the checker
     already derives from section 46 four lines later. Redundant second oracle; delete it. The
     remaining closed-set guards (13 owners, 7 L7 flows, 4 boundaries, the superseded spend phrase)
     are defensible: they are drift detectors over sets the architecture itself declares closed, and
     deriving them from the document under test would make them vacuous.
N-05 an unreadable root produces an unhandled ENOENT stack trace rather than a diagnostic (probe P6).
N-06 docs/phases/3n-architecture-verification.md:7 cites sections 2, 4, 4.1 and 42-47 of
     docs/architecture/index.md. Section 45 is not in that file; it is section 45 Recovery
     architecture after 3M in docs/reference/runtime-and-agents.md:301. Section numbering is one
     global namespace across documents and is complete 1-50 with no gaps - a genuine strength - but
     the candidate authority-boundary citation is wrong about its own file, and section 45 is
     load-bearing for the 3N-S2 recovery pass condition.
N-07 the candidate removed the trailing newline from docs/architecture/index.md and
     docs/reference/data-and-persistence.md.
N-08 docs/architecture/index.md:120 and :122 place unescaped pipes inside code spans in table cells
     (ownerScope = WORKSPACE | PROJECT, SEMANTIC | KNOWLEDGE | EVIDENCE_SPEC). GitHub-flavored
     Markdown splits table cells on those pipes, so the Connections and Brain rows of the semantic
     owner table render with extra columns.
N-09 link text [ROADMAP.md], [INDEX.md], [PRODUCT.md] is used in several current owners while
     check-repository-hygiene.mjs:74-79 forbids exactly those paths as superseded. Targets are
     correct; only the visible names mislead.
N-10 docs/reference/managed-execution-qualification.md:146 still decides substrate compatibility
     against 3E-01/3E-02, documents a Fresh Actor cannot reach. This is the residue of the very
     class the candidate repaired for the 46/16, left in the same file family.
```

---

### Global Maximum and deletion challenge - what was attempted and why it lost

Approval by agreement was avoided. These are the strongest alternatives I could build, and the specific current authority that defeats each.

```text
A4  split the modular monolith
    loses to docs/reference/data-and-persistence.md:164 - the closed cross-owner atomicity set is
    exactly two paths (CreateProject -> prj + iam grant; effect admission -> gw + par approval
    claim). A service split converts both into distributed transactions with no current requirement
    forcing it. The monolith is load-bearing FOR the closed atomicity set, not merely compatible
    with it.

A2  merge Connections into Capability Gateway (the strongest merge available)
    loses to the data closure itself: con.* carries Tier-2 FKs 8 and 9 with ownerScope conditionals,
    gw.* deliberately carries none. Connections is a scoped, revisioned, bound resource; Gateway is
    a per-effect execution record intentionally not structurally bound to a Project. Merging makes
    credential lifecycle and effect replay one authority and reproduces section 46 V10 -
    caller/model selecting arbitrary Connection/effect destination.

A2  merge Attachments & Blob into Artifact Registry
    loses to section 46 V24 (storage object key bypassing owner authorization): Registry owns
    immutable compiled revisions, not bytes for owners it does not govern.

A2  merge Observability & Audit into each owner
    loses to docs/reference/data-and-persistence.md:170 - audit-required paths receive a narrow
    append capability into obs.audit_record from other owners transactions. A cross-owner append
    target must be a distinct owner or the negative property at :156 breaks.

A2  merge MAR into Release
    loses to section 6.3: pg-boss is MAR-private substrate inside the mar schema; hoisting it under
    Release breaks the physical-store capability matrix.

E1  Project-local Brain semantics instead of one canonical Workspace Brain
    genuinely tempting with a single F1 vertical, and loses only on the retrofit test the protocol
    asks for: section 46 V06 names "Brain canonical source accidentally residing in first Project
    repo" as a falsifier, FK 10 binds reg.artifact to the Workspace when kind=brain, and
    docs/reference/data-and-persistence.md:26 makes Workspace Brain Git a separate durable
    authority. The retrofit cost is relocating canonical enterprise knowledge out of a Project repo
    after real content exists. This is a legitimate seam, not speculation.

H1  collapse Release / Promotion / active pointer / SERVED_VERIFIED
    loses to section 46 V22 directly: docs/reference/release-deployment-and-operations.md:74
    defines SERVED_VERIFIED as an observed read of the real serving path matching the exact expected
    Release. Collapsing pointer swap into it IS the falsifier.

H3  delete the DEDICATED private_key_jwt + exact ReleaseRef + short-lived bearer seam
    loses on cost, measured concretely: the seam costs zero of the 46 durable classes and explicitly
    introduces no auth record store, refresh token, DPoP, mTLS or fleet machinery
    (docs/reference/security-and-authority.md:103-117). It is a five-line trust contract, F1 mode
    SERVICE_SCOPED only. Deleting it forces a server-to-platform trust crossing to be invented at
    the same moment physical deployment is invented. This passes the no-dormant-machinery test.

H5  add a Recovery owner or FSM
    loses to the same measurement: recovery is fully expressed across sections 45, 19.4.3 and 34.4
    with zero new durable classes and zero new L7 flows. That is the deletion challenge already
    passed.

A3  hidden orchestration outside the seven L7 flows
    checked and not found. MANAGED_JOB is explicitly a Gateway caller-surface amendment, not an
    eighth flow (docs/architecture/index.md:150), and a composite recovery-activation flow is
    pre-declared as requiring an explicit L7 amendment rather than implied plumbing.
```

Surviving structural YAGNI after this pass: one - gw.budget_counter (F-03).

---

### Comparative conclusions

```text
Mitra (B1, B4)
  Conexus preserves the key advantage. docs/research/mitra/influence-on-conexus.md:1037 section 17
  records the Operator own concern and classifies the answer: checklist-template with embedded
  validations = ADOPT; doc-as-contract with status gate = ADOPT; self-validation without a cold
  reviewer = ADAPT, keeping a cold reviewer for data/permissions/production; full harness-grade
  machinery = keep for building the platform, do NOT export to the Product. Current architecture
  carries all four: section 8.2 Hub-owned live checklist and 8.3 tasks.md; bld.contract_revision +
  bld.plan_revision + section 8.5 PlanningDepth x RigorProfile; section 38.3 "where material"; and
  section 33.8 progressive disclosure.
  The candidate section 42 addition at docs/architecture/index.md:272 is the correct and previously
  missing falsifiable carrier of that last conclusion, and is the strongest thing in this candidate.

Factory AI (B2, B5)
  Correctness before decomposition is represented (C-017, and validation ordering at
  docs/research/factory-ai/influence-on-conexus.md:361) without a Mission/Milestone/Validation
  engine - section 44 rejects the generic form, and bld.change_acceptance exists as a durable class
  separate from bld.actor_run, which is the structural expression of "the worker does not own
  acceptance". Independent validation is not under-weighted: section 38.3 exists and persistent
  CodingSession explicitly does not remove it. The Factory two-validator split is the DEFER side,
  correctly.
  The one candidate NEW requirement I considered - closing the set of changes for which independent
  verification is mandatory, since "where material" at docs/reference/builder-and-harness.md:384 is
  the softest qualifier in current Builder authority - I deliberately decline to propose. The Mitra
  ADAPT row already names the intended set (data, permissions, production), and fixing the boundary
  is Realization Planning in the same shape as the CR-1 clause "the exact primitive remains derived
  Realization Planning". Proposing it here would smuggle a requirement into a correction.

B3  one persistent CodingSession per Change + bounded ActorRuns + fresh material verification beats
    both alternatives: section 44 rejects forced per-WorkUnit cognitive reset, and section 38.3
    prevents the unbounded-single-session failure. Coherent.

Mastra (C1-C5), checked against current documentation, not memory
  C3 confirmed: AgentController + Workspace + E2BSandbox + createCodingAgent + sessions with
  resourceId are the current framework shapes, and docs/reference/mastra/current-mapping.md uses
  them as such rather than forcing Mastra to imitate an invented harness.
  C1/C2: no Conexus owner is deletable by current Mastra.
    - the createCodingAgent goal judge would place completion judgment in the runtime - section 46
      V03.
    - Mastra server auth providers guard the Mastra Hono routes; adopting them as Conexus
      authorization violates the section 44 rejection of browser/frontend authorization authority
      and C-015.
    - PIIDetector is model-based and probabilistic; as a redaction authority it violates
      "unknown/missing/partial != zero/success" and adds an unadmitted provider against
      section 28.1.
  Two realization-only simplification candidates, correctly classified under protocol rule 7 as NOT
  architecture reopens: framework task/signal tracking as the mechanism behind the Hub-owned
  checklist projection, and the deterministic RegexFilterProcessor as a subordinate mechanism inside
  an owner-defined redaction rule. Both are blocked from adoption inside 3N anyway by
  docs/reference/mastra/qualification-and-reopen-triggers.md - any pin change or newly enabled
  facility not exercised by BT-5N requires requalification. No owner exists only because an older
  Mastra lacked a primitive.
  C4 direct Agent for PAR + selective Workflow: still correct; universal wrapping is rejected and no
  current deterministic consumer exists.
  C5 same-process qualification remains honestly bounded to enabled surfaces, with
  scorer/evaluation, DurableAgent and Observational Memory off and named as requalification
  triggers.
```

---

### 3N contract and checker integrity

```text
I1 correct. Section 46 is treated as an explicit minimum and says so at
   docs/architecture/index.md:395.
I2 NOT fully. The twelve section 42 families are carried exactly; obligations named outside
   sections 42/46 are not - see F-01.
I3 correct and independently checked. The new section 46 line mirrors
   docs/reference/managed-execution.md:101 section 28.1 precisely (finite server-derived
   maxModelCalls/step limits, strict bounded retries, no automatic fallback cascade) and does not
   resurrect monetary reservation, which section 28.3 defers.
I4 correct. 3O owns the vertical proof contract while roadmap keeps implementation BLOCKED; the
   contract stage and the earliest real execution stage genuinely differ for V28 and only for V28.
I5 the checker remains mechanism. Hard-coded oracles: 13 owners, 7 L7 flows, 4 infrastructure
   boundaries, the superseded spend phrase, the owner-local recovery sentence - all defensible as
   drift detectors over sets the architecture declares closed; deriving them from the document under
   test would make them vacuous. Two are not defensible: the duplicated section 46 falsifier text
   (N-04) and the literal "- 16" used as a section boundary (N-02).
I6 partly. The eight negative controls that exist do prove real guards - each mutates a fixture and
   runs the real checker. But eighteen error paths have none, and the two silent-pass probes P4 and
   P5 show the data-closure guards prove counting, not identity.
I7 yes, and it is cheap: resolve FK endpoints and record identities against the 13 declared schemas
   and the 46 projected classes, both already parsed. That single addition closes P4 and P5, and it
   is the statically guardable half of the dependency/storage boundaries obligation 3M routed to 3N.
```

---

### What the candidate got right

Stated plainly, because a review that lists only defects misrepresents this candidate.

```text
- The section 46 routing rederivation is correct and the checker genuinely derives the 28 from
  architecture authority rather than hard-coding them; the count and every routing pair reproduce
  independently.
- Repairing the 46/16 into the current data owner is the right instinct and the right scope: it is
  the difference between a Fresh Actor being able to see the closure and having to excavate it.
- The model-spend correction is a real stale-projection fix, not a preference, and it is consistent
  with 3L-R1 in both directions.
- Adding the Builder UX progressive-disclosure proof family gives the Mitra minimal-governance
  conclusion its first falsifiable home. That was a real gap.
- The 3O_CONTRACT / FIRST_BUILD split is the honest answer to "who can actually falsify this", and
  the contract refuses to manufacture pre-implementation proof anywhere.
- The negative controls that exist run against the real checker, not a mock of it.
```

### Round 2

Round 2 is not justified by anything above. F-01 through F-05 are bounded corrections inside 3N over files the candidate already owns; none requires reopening 3A-3M, requalifying 3L, adding or removing a semantic owner, or changing the Product Contract. If Lead adjudication rejects F-01 or F-03 on current authority I do not intend to re-litigate them - they are Evidence, and the Lead decides.
