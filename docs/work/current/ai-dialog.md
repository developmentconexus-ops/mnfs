# C-018 — Final Global Architecture Fable Review Channel

> **TEMPORARY / NON-AUTHORITATIVE / REVIEW EVIDENCE ONLY**
>
> This file is the only permitted delta on `review/c018-global-fable` relative to the frozen ratified `main`. It must never enter `main` or any Product/Realization candidate.

## Lead handoff — Round 1

```text
Repository:        developmentconexus-ops/conexus-os
Frozen candidate:  main
Candidate HEAD:    7fd1d95df88f1b31b012757c65f1e4a24939e27f
Candidate tree:    ae3a83c5b6a5a15a4cc77219ec1fb58f9adb1f27
Review branch:     review/c018-global-fable
Review scope:      final post-ratification Global Coherence / Global Maximum challenge
3A–3O:             CLOSED
C-018:             RATIFIED / OPERATOR RATIFIED
Implementation:    BLOCKED
Realization Plan:  NOT STARTED
```

## Review protocol

1. Reconstruct current repository authority first from `AGENTS.md → docs/index.md → docs/roadmap.md → only current task-specific owners`. This handoff is Evidence, never authority.
2. Apply **DevelopmentConexus Engineering Method v1.0.0** and **Repository Standard v1.0.0**, including Global Maximum, complexity law, authority/mechanism separation, proof-before-implementation, Global Coherence Review, YAGNI and independent challenge.
3. Treat the ratified architecture as challengeable authority: ratification freezes execution, not inquiry. Do **not** preserve a decision merely because it is already ratified if current material Evidence falsifies it.
4. Conversely, do not reopen 3A–3O/C-018 for preference, aesthetic simplification, a hypothetical future, framework fashion, or because another product/framework models the problem differently. A reopen requires a concrete material failure class or foreseeable structural dead end under current Product constraints.
5. Review the **current target architecture as one coherent system**, not the chronology of old phase discussions. Read research/history only when a current claim or credible alternative materially requires it.
6. Search deliberately in both directions:
   - **overengineering / accidental complexity:** redundant owners, taxonomies, abstractions caused by abstractions, speculative extensibility, framework duplication, premature hard-to-reverse decisions, proof ceremony;
   - **underengineering / dangerous simplicity:** missing owner/boundary, weakened isolation, unverifiable truth, hidden concurrency/recovery/temporal defect, missing seam that would force a destructive retrofit.
7. Seek a genuinely better **Global Maximum**, not a smaller answer by word count. For every proposed deletion/collapse, state the real invariant that still survives and how it remains enforceable/falsifiable. For every proposed addition, identify the concrete current consumer/risk/defect that requires it now and why it cannot be safely added later.
8. Apply the Structural Inversion Test where useful: if the realization/framework were materially different, which architecture conclusions remain true?
9. Compare current Conexus choices to the current **Mitra** and **Factory AI** research only as Evidence. `other product has X` is never enough to require X.
10. For Mastra-sensitive claims, use the repository Mastra skill/mapping and current official/Context7/source documentation where material. Framework primitives are mechanics, never Product authority. Attack both custom machinery Mastra now makes unnecessary and framework-native machinery that would wrongly absorb Conexus semantics.
11. Do not demand FIRST_BUILD/FIRST_PRODUCTION evidence before implementation. Instead challenge whether every deferred property is honestly falsifiable at its routed stage and whether Realization Planning can compile the architecture into incremental slices without manufacturing unused capability.
12. Do not create a new Product requirement, semantic owner, trust boundary, durable record, framework, service, queue, workflow engine, policy engine, proof engine or deployment topology as a disguised review correction. If a real finding requires one, mark the smallest owning Decision Loop that must reopen.
13. Do not edit `main`, candidate authority, roadmap, decisions, Product docs, architecture docs, tests, or implementation. **Edit only this `docs/work/current/ai-dialog.md` on `review/c018-global-fable`.** Append the review under `## Fable — Round 1`, commit and push only this file.
14. Round 2 is justified only if a real material contradiction survives Lead adjudication/correction.

## Mandatory attack questions

### A. Product traceability and architecture necessity

```text
A1. Can every load-bearing F1 owner/boundary be traced to a current Product capability, safety invariant or real first-installation constraint?
A2. Is any accepted Product capability missing an architecture owner or dependent on an implicit cross-owner behavior?
A3. Does the architecture preserve the Product promise “agent-first + simple by default + inspectable by design + authority-preserving”, or has internal factory machinery become the Product?
A4. Is F1 still one coherent internal/company-first platform, or did later architecture quietly make F1 equivalent to building the later SaaS platform now?
```

### B. Global Maximum, owner count and deletion challenge

```text
B1. Are the 13 semantic owners the smallest sustainable ownership decomposition, or can any pair collapse without duplicating meaning, weakening enforcement, or creating a God component?
B2. Does any owner exist mainly because another abstraction exists rather than because the Product has a distinct lifecycle/authority?
B3. Are exactly seven L7 orchestration flows and four infrastructure boundaries real closed necessities or overfit taxonomies that will cause ceremony/retrofit?
B4. What is the strongest architecture component you would delete today? Demonstrate why every protected invariant still survives after deletion.
B5. What is the strongest current abstraction you initially suspected was YAGNI but, after challenge, proved necessary? State the counterexample that preserves it.
```

### C. Underengineering / retrofit challenge

```text
C1. What is the hardest foreseeable first-build/first-production failure that the current architecture cannot express or falsify without redesign?
C2. Is any deferred mechanism actually a required seam that has been deferred too far, such that first implementation would have to break authority or persistent semantics to add it?
C3. Are concurrency, current-authority revocation, restart, lost responses, migration, restore and unknown/partial truth protected proportionally, or is any class protected only by prose that cannot be implemented without a new owner?
C4. Is the single-process modular-monolith baseline genuinely the simplest structure for F1, or does any accepted isolation property already require a process/service split?
```

### D. Builder / Harness versus current Mastra and reference products

```text
D1. Given current Mastra AgentController modes, sessions, subagents, tools, storage and workspace support, do Conexus `Plan`, `WorkUnit`, `ActorRun`, `CodingSession` and Hub checklist each retain a distinct Product/correctness authority, or is any one duplicating framework mechanics?
D2. Could Builder use more native AgentController/Workspace behavior while keeping Change/correctness/current authority in Conexus, reducing total machinery without losing proof?
D3. Conversely, would collapsing the Builder graph into Mastra session/thread/subagent state recreate the exact authority/recovery/evaluation failures Conexus is designed to prevent?
D4. Does `PlanningDepth = DIRECT|LIGHT|FULL` × `RigorProfile = FAST|BOUNDED|CONTROLLED` provide useful orthogonal proportionality, or is it a premature taxonomy that can be represented more simply without losing a current invariant?
D5. Did Conexus take the transferable Mitra/Factory lessons—long-lived sessions, proportional planning, real QA, fresh verification, safe capability boundaries—without copying Missions/workflow/fleet ceremony?
```

### E. Brain / analytics scope

```text
E1. Are one Workspace Brain, explicit ProjectBrainBinding and separation from runtime memory essential to the accepted Product, or is any layer redundant?
E2. Are Brain Discovery, AnalyticQuery and Brain health/conformance all justified F1 architecture now, or is some portion a future capability specified beyond the evidence of a current F1 consumer?
E3. Can the first Sankhya Budget Analyzer implement only the semantic subset it needs while preserving future Brain contracts, or does current architecture force a broad Brain platform before value is delivered?
E4. Does AnalyticQuery as a second read regime solve a real Product need distinct from registered Query without becoming a generic semantic query engine prematurely?
```

### F. Gateway, PAR, MAR and cross-cutting God-component risk

```text
F1. Is Capability Gateway one coherent last-mile authority for governed capabilities/effects/credentials, or has it accumulated unrelated responsibilities that should belong elsewhere?
F2. Is `gw.budget_counter` justified by a current F1 effect-budget invariant, or is it durable machinery for a capability with no sufficiently current consumer?
F3. Is PAR distinct from Gateway and Release for genuinely separate meanings, or can any boundary collapse safely?
F4. Is MAR necessary as a semantic owner for managed serving/job occurrence, or could ordinary Project/Release mechanics plus a private scheduler substrate cover the same F1 contract?
F5. Does keeping Product-Agent `SCHEDULE` in PAR and governed sync recurrence in MAR avoid a false generic scheduler domain, or create duplicate recurrence machinery without enough semantic difference?
```

### G. Data model closure and premature taxonomic commitment

```text
G1. Is closing F1 at 13 schemas / 46 durable record classes / 16 Tier-2 FKs a useful falsifiable semantic boundary, or premature database-schema design before the first real build?
G2. For every questionable durable record class, what concrete owner invariant makes it non-derivable and necessary? Identify any record that can be deleted/collapsed now.
G3. Can Realization Planning instantiate only the records required by the first slice while preserving the ratified F1 semantic inventory, or does “closed at 46” accidentally require all 46 tables/machinery in the first vertical?
G4. Does CR-1 (current-authority serialization × owner isolation) have a realizable minimal path, or does the combination force hidden cross-owner coupling or transactional infrastructure not represented in the architecture?
```

### H. DEDICATED seam and security proportionality

```text
H1. Is `ApplicationRuntimeProfile = MANAGED | DEDICATED` required in F1 Product authority despite the first vertical being MANAGED, or should DEDICATED be a future seam only?
H2. In particular, are `DedicatedApplicationPrincipal`, `private_key_jwt`, exact ReleaseRef assertion and SERVICE_SCOPED exchange current essential trust semantics, or premature realization choices before a real DEDICATED deployment?
H3. Could deferring more of DEDICATED avoid a hard-to-reverse security mechanism without leaving an undefined future trust crossing that would force architectural redesign?
H4. Are the six logical trust zones useful classifications rather than deployment abstractions, as claimed?
```

### I. Release, migration, topology and recovery proportionality

```text
I1. Is Release → Promotion → served verification separation essential, or over-modelled for an internal first installation?
I2. Are EnvironmentConformance, migration branches, CAS progression and forward-only recovery the minimum correctness needed, or is any machinery speculative before the first real deployment?
I3. Does the accepted first-production topology (one Linux guest / one PG cluster / private LAN+VPN / no HA) correctly spend complexity where evidence exists and defer HA/public ingress?
I4. Is the 3M recovery contract proportionate to a real single-failure-domain production system with RPO≤6h/RTO≤8h, or did it design disaster machinery beyond current risk?
I5. Is there any simplification that preserves restore truth, post-cutoff uncertainty, credential custody, effect reconciliation and serving verification without adding a generic Recovery owner?
```

### J. Framework qualification and current Mastra evolution

```text
J1. Do current Mastra APIs materially supersede any custom Conexus mechanism selected before C-018?
J2. Does current Mastra evolution invalidate any exact qualification assumption sufficiently to fire a 3L reopen trigger now, rather than merely requiring a repin during Realization Planning?
J3. Is BuilderMastra / ParMastra same-process separation still a sustainable baseline given current storage/PubSub/global facilities, or is process split already the safer/simpler Global Maximum?
J4. Are direct Agent for PAR, AgentController for Builder, native approval and narrow Scheduler ingress still the smallest mapping, versus wrapping everything in Workflow or building more custom runtime?
```

### K. Verification burden and methodology proportionality

```text
K1. Do the 28 explicit 3N falsifiers + 12 downstream families + 3O-P1..P7 preserve necessary correctness, or have they become a verification framework whose ceremony will dominate implementation?
K2. Can Realization Planning compile them into the first applicable slices rather than creating one test/proof subsystem per architecture statement?
K3. Is any proof obligation duplicated under different names/owners and safely deletable?
K4. Is any current claim protected only by presence/documentation rather than a credible future falsifier?
K5. Does the architecture leave enough room for implementation feedback to simplify mechanisms without treating every detail as immutable Product authority?
```

### L. Repository/documentation architecture and fresh-actor coherence

```text
L1. Does a fresh actor still reach current truth through the ≤5-file default route, or do the many reference/phase surfaces require conversation/Git archaeology in practice?
L2. Is `docs/roadmap.md` genuinely the sole mutable status authority? Search current durable references for stale program-status blocks (including C-018/implementation status) that could mislead a fresh actor even when they say roadmap is canonical.
L3. Are current architecture/reference documents duplicating the same normative rule enough times to create drift risk or token burden contrary to the LLM-first Method?
L4. Are 3L/3M/3N/3O/C-018 phase docs correctly durable closure/proof summaries, or has any become a second current architecture/decision authority?
L5. Is there documentation that can be deleted or narrowed before Realization Planning without losing current authority, proof routing or required provenance?
```

### M. Realization Planning readiness

```text
M1. Can a Realization Plan now derive the smallest first real slice without making new Product/owner/trust decisions that should have been architecture decisions?
M2. Can that first slice deliver the real Budget Analyzer while NOT implementing unused Product Agent/write/DEDICATED/advanced-memory/HA/SaaS capability merely for architecture completeness?
M3. Which ratified boundaries must be realized on day one because changing them later would be structurally expensive, and which may remain interfaces/contracts until first use?
M4. If you were the implementation lead, what is the smallest vertical slice you would build first while still honestly falsifying the architecture?
M5. Is the architecture READY for Realization Planning? If not, identify the exact smallest reopen/cleanup prerequisite.
```

## Expected output

Start with this exact summary shape:

```text
Overall verdict                         SURVIVES | SURVIVES WITH BOUNDED CORRECTIONS | REOPEN REQUIRED
Material Findings count                 N
Non-material Findings count             N
Smallest authority reopen required?     NO | YES — exact decision/owner/scope
C-018 reconsideration required?         NO | YES — exact reason
3L requalification required now?        NO | YES — exact named trigger
New Product requirement proposed?       0 unless a real current requirement is missing; identify explicitly
Semantic owner add/remove/collapse?     NO | exact change + falsifier
Global Maximum conclusion               ...
YAGNI/deletion conclusion               ...
Underengineering/retrofit conclusion    ...
Mastra simplification conclusion        ...
Data-model proportionality conclusion   ...
Recovery/security proportionality       ...
Repository/documentation conclusion     ...
Verification-burden conclusion          ...
Realization Planning readiness          READY | NOT READY — exact prerequisite
```

For every **material** finding, state:

```text
Finding ID
challenged current claim
current authority / Evidence that decides it
concrete counterexample or failure class
why it is material under METHOD.md
smallest sustainable correction
what can be deleted / what must remain
whether finding changes Product/architecture authority or only projection/docs/mechanism
exact smallest reopen scope, if any
proof/falsifier that would close the finding
```

For every **non-material** finding, state why it should not block Realization Planning and whether it is worth a bounded cleanup now or should be left alone under YAGNI.

Also include:

1. **Deletion ledger:** strongest 10 deletion/collapse candidates examined, verdict `DELETE | KEEP | DEFER DECISION`, and the deciding invariant/consumer.
2. **Missing-complexity ledger:** strongest 10 candidate gaps examined, verdict `ADD NOW | ALREADY COVERED | DEFER SAFELY`, and why.
3. **Framework overlap ledger:** current Conexus responsibility vs Mastra/native/reference alternative, with `OWN | USE NATIVE | KEEP SEAM | REQUALIFY` disposition.
4. **Strongest counterexamples attempted** against the final verdict, including at least one overengineering and one underengineering counterexample.
5. If the architecture survives, explain **why it is not merely “complex but defensible”**: show that the complexity is tied to current Product/risk/invariants and identify the deliberate simplifications/deferred machinery that keep it bounded.

Do not approve by agreement. A useful outcome may be “architecture survives” only after concrete deletion and missing-complexity attacks fail.

---

## Fable — Round 1

<!-- Fable appends the independent review here and commits only this file. -->
