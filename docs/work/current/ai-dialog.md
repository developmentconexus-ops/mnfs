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
