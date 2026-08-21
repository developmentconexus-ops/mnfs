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

### Review identity and method

```text
Reviewer:          independent Fable (fresh context, no Lead adjudication input)
Candidate:         main @ 7fd1d95df88f1b31b012757c65f1e4a24939e27f (verify = success on this head)
Review delta:      review/c018-global-fable − candidate = docs/work/current/ai-dialog.md only (verified by git diff --stat)
Authority route:   AGENTS.md → docs/index.md → docs/roadmap.md → product/contract.md → architecture/index.md
                   → decisions/index.md → all current reference owners → phases 3A/3L/3M/3N/3O/C-018
Method applied:    DevelopmentConexus Engineering Method v1.0.0 (canonical METHOD.md fetched from
                   conexus-methodology), Repository Standard v1.0.0
Mastra rule:       project skill .agents/skills/mastra/SKILL.md loaded; version-sensitive claims checked
                   against npm registry + upstream @mastra/core CHANGELOG on 2026-08-21, never memory
Research used:     Mitra + Factory AI influence maps read in full as Evidence only
```

### Summary

```text
Overall verdict                         SURVIVES
Material Findings count                 0
Non-material Findings count             5
Smallest authority reopen required?     NO
C-018 reconsideration required?         NO
3L requalification required now?        NO — pin drift is minor-version; the already-contracted
                                        repin + affected-criteria requalification at Realization
                                        Planning absorbs it (see NM-2 for the named security input)
New Product requirement proposed?       0
Semantic owner add/remove/collapse?     NO — every attempted pair-collapse and deletion failed
Global Maximum conclusion               Current structure is the Global Maximum for current
                                        constraints; every alternative structure examined (process
                                        split now, more-native Mastra absorption, owner merges,
                                        thinner data closure) is a local maximum that either loses
                                        an enforceable invariant or moves complexity without
                                        removing it
YAGNI/deletion conclusion               10 strongest deletion/collapse candidates attacked; 0
                                        deletions survive; the closest candidates (DEDICATED trust
                                        mechanics, gw.budget_counter, AnalyticQuery) are prose-level
                                        seams or closed inventory entries with zero dormant F1
                                        machinery, each already guarded by a named
                                        first-real-consumer trigger
Underengineering/retrofit conclusion    No missing owner/boundary/seam found that would force a
                                        destructive retrofit; every "add now" candidate resolved to
                                        ALREADY COVERED or DEFER SAFELY with a named trigger; the
                                        one implicit constraint worth making explicit at Realization
                                        is NM-5 (all Z3 guest interaction must stay Hub-outbound)
Mastra simplification conclusion        No current Mastra API supersedes a Conexus-owned mechanism;
                                        the architecture already sits at the use-native maximum
                                        (direct Agent, requireApproval, Scheduler ingress, Memory,
                                        AgentController) with Conexus keeping only meanings Mastra
                                        does not and cannot own; new 1.57–1.61 facilities
                                        (session.steer, caller-driven experiments, graceful
                                        shutdown) are seam-compatible mechanics, not authority
                                        replacements
Data-model proportionality conclusion   13 schemas / 46 record classes / 16 Tier-2 FKs is a
                                        falsifiable semantic closure, not premature DDL: names are
                                        record classes with owner invariants, table spellings are
                                        explicitly post-C-018, first slice instantiates only what
                                        it needs (3O NOT_INSTANTIATED discipline), and the checker
                                        makes the closure mechanically falsifiable
Recovery/security proportionality       Proportionate: owner-local recovery + deny-only posture
                                        matches a single-failure-domain RPO≤6h/RTO≤8h installation;
                                        no disaster machinery beyond current risk was found; the
                                        deliberate refusals (no generic Recovery owner, no HA, no
                                        composite activation flow) are the proportionality
Repository/documentation conclusion     Fresh-actor ≤5-file route works as claimed (exercised in
                                        this review); bootstrap = 10,786 bytes ≤ 20 KiB; one stale
                                        status line found (NM-1); minor normative duplication and
                                        snapshot placement noted (NM-3, NM-4), none creating a
                                        second authority
Verification-burden conclusion          28 + 12 + 3O-P1..P7 are routing obligations, not a proof
                                        framework: no duplicated oracle (3O imports 3N by
                                        reference; checker derives from architecture §46), no proof
                                        engine or new record class, NOT_INSTANTIATED is honest
                                        scope truth; the burden compiles into slices instead of a
                                        per-statement test subsystem
Realization Planning readiness          READY — with two named Realization inputs: (1) Mastra
                                        repin to a head that includes the upstream cleartext-token
                                        security fix, with affected-criteria requalification
                                        (NM-2); (2) fix/relabel the stale status snapshot (NM-1)
```

### Material findings

None survived. To keep this falsifiable rather than approval by agreement, the record of what was examined and what would have overturned the verdict:

- **Examined:** all 13 owners pairwise for collapse; all 46 record classes for deletability/derivability; the 7-flow L7 closure and 4 infrastructure boundaries; the single Gateway↔PAR inversion; CR-1 realizability; both recurrence regimes; the DEDICATED trust contract; the 6 trust zones; the 3M recovery contract against the real topology; the 28 + §42 + 3O routing for duplication, fake execution and unfalsifiable stages; the current Mastra pin against today's upstream head; the Mitra/Factory influence maps for un-absorbed warnings; the repository against Repository Standard v1.0.0 (route, bootstrap budget, status law, review isolation, naming).
- **What would have falsified SURVIVES:** a deletable owner/record whose invariant survives deletion enforceably; a required F1 property with no honest routed falsifier; a current Mastra capability that makes a Conexus authority mechanism structurally redundant; a first-slice derivation forced to make a new Product/owner/trust decision; a qualification assumption behaviorally broken by current framework Evidence; a second mutable status authority. None was found; the closest approaches are documented below as failed counterexamples.

### Non-material findings

**NM-1 — stale status snapshot in a current reference.** `docs/reference/runtime-and-agents.md` §25.4 "Status" ends with `C-018 = NOT RATIFIED` (line 216). C-018 is now `RATIFIED / OPERATOR RATIFIED`. The block does route to the roadmap, but unlike `framework-findings.md` and `managed-execution-qualification.md` it is not labeled a frozen snapshot, so under Repository Standard §7 it reads as current and can mislead a fresh actor. Repo-wide grep found no other unlabeled stale occurrence. Not blocking (roadmap remains the sole mutable authority and says so); worth a bounded cleanup now: delete the two trailing status lines or label the block a frozen 3L-closure snapshot. Docs/projection only.

**NM-2 — pinned Mastra head predates two upstream fixes; repin is a named Realization input, not a reopen.** Checked against npm + upstream `@mastra/core` CHANGELOG on 2026-08-21: pins are `@mastra/core 1.56.0` / `@mastra/memory 1.25.0` / `@mastra/pg 1.19.0`; current is `1.61.0` / `1.27.0` / `1.21.1` (minor drift only). Two 1.61.0 entries matter:
1. security fix — framework-managed `mastra__authToken` was persisted **in cleartext in workflow snapshots, score rows, and durable agent workflow inputs** (upstream issue #21975, PR #21996); the pinned head predates the fix;
2. correctness fix — concurrent `resume()` on the same suspended workflow run could execute downstream steps more than once; 1.61.0 adds an atomic claim (`WORKFLOW_RESUME_ALREADY_CLAIMED`, PR #21725, fixes #20443); the pinned head predates it.

Why this is not material against the ratified architecture: (a) no accepted claim asserts the pin is vulnerability-free — qualification is scoped to exact tested properties on exact pins, and `Version drift requires explicit repin and affected-criteria requalification` is already the accepted law; (b) the architecture never lets a Mastra snapshot carry authority, `mastra_par` is Z6 trusted storage, and no Mastra server-auth surface is part of F1; (c) for the resume bug, the accepted design already defends in depth — the tool boundary rechecks current owner truth and the Gateway semantic effect identity fences a duplicated admission (3N-V11/V16 route exactly this) — so the framework defect cannot reach a duplicate external effect without first falsifying properties that are independently routed. Note the upstream fix converges on the same guard shape Conexus specified, which is Evidence the owner-recheck boundary is load-bearing, not ceremony. Disposition: **no 3L reopen now**; Realization Planning must repin to a head including #21996 and run the affected-criteria requalification already contracted in `qualification-and-reopen-triggers.md`. This finding names the concrete security reason so the repin cannot be deferred as routine.

**NM-3 — normative duplication across current owners.** The DEDICATED trust block (`DedicatedApplicationPrincipal`/`private_key_jwt`/`SERVICE_SCOPED`) appears in `product/contract.md` §5.4, `builder-and-harness.md` §7.2 and `security-and-authority.md` §32.5; duplication semantics appear in contract Journey M and `release-deployment-and-operations.md` §17; `PlanningDepth × RigorProfile` appears in contract §5.7 and builder §8.5. All copies are currently consistent (compared line-by-line), but METHOD's LLM-first law says state each normative rule once, and three copies of a security contract are three drift surfaces. Not blocking; leave alone under YAGNI until any of these files is next touched, then consolidate to one owning statement plus references. Docs only.

**NM-4 — frozen decision snapshots living under `reference/`.** `framework-findings.md` (3L-R1) and `managed-execution-qualification.md` (3L-R2) are 550–730-line frozen decision snapshots under `docs/reference/`, whose Repository Standard responsibility is *detailed current technical reference*; decisions/phases own decision content. Both are correctly labeled frozen and their operative results are projected into `current-mapping.md`/`managed-execution.md`/phase 3L, so no second authority exists. Not blocking; leave alone — moving them now is churn without a consumer. Docs placement only.

**NM-5 — Z3 reachability constraint is implicit.** Z3 names "E2B Builder sandbox/app-under-test" as guest, `builder-and-harness.md` §9.6 describes guest-readable capabilities validated server-side "on every use", and first-production topology has **no public ingress**. These are consistent only while every guest interaction remains Hub-outbound (AgentController drives the sandbox via the E2B API; results are pulled into Hub custody; business egress is Hub-side Gateway) — which is what the current architecture describes, but nowhere states as a constraint. If Realization ever gave an in-sandbox app-under-test a path that requires calling back into the private Hub (e.g., exercising Gateway reads from inside E2B), it would need ingress the topology forbids. Not blocking (no accepted claim requires guest→Hub inbound; the guest-readable-capability class can be empty in F1); Realization Planning should state "all Z3 interaction is Hub-outbound" as an explicit conformance line so the constraint cannot be violated by convenience. Projection/mechanism only.

### Family verdicts (mandatory attack questions A–M)

```text
A1 traceability            PASS — spot-traced every owner to a C-decision/Product capability;
                           no orphan owner found (Registry→C-005, MAR→Journey L/N, PAR→§25 scope,
                           Attachments→§5.31, Gateway→C-007/C-016, Brain→C-011)
A2 missing owner           NONE — every accepted capability has a named owner; the ownership map
                           in contract §6 closes over §25 scope
A3 machinery-as-Product    PROTECTED — contract §23.7 progressive disclosure + §42 Builder-UX
                           falsifier make "factory console becomes the Product" a routed failure
A4 F1 vs SaaS-now          F1 ≠ SaaS build-out: no signup/billing/marketplace/multi-host; Workspace
                           sovereignty is an isolation invariant, not tenant-economics machinery
B1 13 owners minimal       YES — see deletion ledger rows 4–7; every pair-collapse creates a God
                           component or duplicates a meaning
B2 abstraction-begets      Closest is Attachments & Blob, which deliberately owns mechanics and no
                           semantic authority — the mechanism≠authority pattern, not a symptom
B3 7 flows / 4 boundaries  Real closed necessities: each flow is a required cross-owner
                           orchestration with a consumer; adding an 8th later costs one Decision
                           entry, so the closure is protection, not ceremony
B4 strongest deletion      DEDICATED trust mechanics — demonstrated to fail, see ledger row 1
B5 strongest survivor      PlanningDepth × RigorProfile — initially suspected taxonomy; survives
                           because a single effort scalar cannot represent DIRECT+CONTROLLED
                           (tiny change in a risky surface: no plan, maximum rigor), which is a
                           real first-vertical case (small Change touching Sankhya-bound code)
C1 hardest inexpressible   None found; hardest candidates (Sankhya outside Connector contract,
                           continuity marker needing new semantic state, CR-1 impossibility) all
                           have explicit stop conditions returning to the smallest Decision Loop
C2 seam deferred too far   None — every deferred mechanism has a trigger and a place to land
                           without breaking persisted semantics (checked EVENT, advanced memory,
                           HA, effect-capable MANAGED_JOB, DEDICATED physical, Vault/KMS)
C3 prose-only protection   None — each risk class names its owner and its routed falsifier; the
                           two realization-unknowns (continuity marker, CR-1 primitive) carry
                           explicit "if it needs new semantic state, stop" clauses
C4 monolith honest         YES — BT-5N same-process qualification has a fired negative control and
                           a defined split trigger; E2B carries the untrusted-code isolation; no
                           accepted property requires a service split today
D1 distinct authorities    YES — Plan/WorkUnit/ActorRun/CodingSession/checklist each carry
                           correctness/recovery meaning that must live in hub_control precisely
                           because mastra_builder is excluded from the required recovery set
D2 more native possible?   NO net reduction found — see framework ledger; the remaining Conexus
                           machinery is exactly the part Mastra does not persist durably or
                           cannot own (admission, custody, acceptance, effect identity)
D3 collapse into Mastra    Would recreate the named failures: plan truth in an unrecovered store,
                           session narration closing Changes, snapshot state resurrecting
                           authority — the exact classes 3N-V03/V04/V15/V16 exist to falsify
D4 depth × rigor           KEEP — orthogonality is load-bearing (B5); no matrix/engine admitted
D5 Mitra/Factory lessons   TAKEN WITHOUT CEREMONY — influence maps confirm: fresh verification,
                           proportional planning, correctness-before-decomposition, stuck≠complete,
                           Hub-mediated Git all absorbed; Missions/fleet/marketplace/persistent
                           agent computers explicitly rejected; the Factory doc itself forbids
                           "Factory has X → copy" and PRESERVE rows cite Conexus decisions
E1 Brain layering          ESSENTIAL — one Workspace Brain + explicit binding is what makes V06/V07
                           falsifiable; deleting either reintroduces Project-local capture of
                           company meaning or silent live inheritance
E2 Discovery/health now    JUSTIFIED — the first vertical consumes both (Sankhya TDD-first
                           Discovery builds the budget semantics; binding conformance + health
                           snapshot protect the KPIs the vertical exists to serve)
E3 subset implementable    YES — contract §25 says F1 scope ≠ first-build scope; Journey N needs
                           no Product Agent/write/automation; Brain platform breadth is not forced
E4 AnalyticQuery           KEEP AS CONTRACT — C-011 Product authority with a real future consumer
                           class; zero F1 machinery forced (first vertical uses registered Query);
                           the restricted-AST design is precisely the anti-"LLM writes SQL" seam
F1 Gateway coherence       ONE MEANING — governed capability/effect/credential last-mile; the
                           enumerated does-not-own list keeps it from God-component drift
F2 budget_counter          KEEP — re-attacked beyond 3N F-03: no first-slice consumer, but the
                           record is closed inventory, not built machinery; the moment any Release
                           declares an effect budget, restart-survivable consumption is an
                           invariant only a durable Gateway-owned counter can enforce
F3 PAR/Gateway/Release     DISTINCT — approval meaning / effect execution / composition serving;
                           any merge collapses two histories or two truth regimes into one owner
F4 MAR necessity           KEEP — occurrence lifecycle (single-flight, one-catch-up, orphan
                           settlement) has no other honest home: Gateway disclaims occurrence
                           meaning, Release disclaims mutable runtime, Project disclaims runtime
F5 dual recurrence         NOT DUPLICATE — SKIPPED-no-catch-up (PAR) vs freshness-driven
                           one-catch-up (MAR) are different laws for different consumers;
                           unifying them is the rejected generic scheduler domain
G1 closure useful          YES — falsifiable boundary with a mechanical checker, not DDL
G2 deletable record        NONE demonstrated — weakest candidates examined (brn.health,
                           brn.binding_validation, obs.operational_event, att.blob) each carry a
                           non-derivable owner invariant (snapshot pinning, conformance proof,
                           owner-scoped observation, byte/semantic split)
G3 first-slice subset      YES — NOT_INSTANTIATED discipline + §25 scope law prevent "closed at
                           46" from forcing 46 tables in the first vertical
G4 CR-1 realizable         PLAUSIBLE with honest failure route — the closed cross-owner atomicity
                           set (2 entries) plus narrow-capability pattern gives a realization
                           path; 3O stop condition covers structural impossibility
H1–H3 DEDICATED            SEAM, NOT MACHINERY — see deletion ledger row 1
H4 six zones               CLASSIFICATIONS — no zone implies a deployment unit; Z2's honest
                           residual (module ≠ RCE isolation) is stated rather than hidden
I1 Release separation      ESSENTIAL — collapse recreates mutable-latest/pointer-swap-as-verified,
                           the exact failure classes V22 exists for
I2 conformance/migration   MINIMUM — every gate maps to a real first-installation failure mode
                           (drift, half-applied migration, stale candidate); none is speculative
I3 topology honest         YES — complexity spent where evidence exists (off-host recovery,
                           deny-only posture), deferred where not (HA, public ingress)
I4 3M proportional         YES — no generic recovery owner, no HA machinery, RTO honesty
                           (unreconciled effect surfaces may stay fail-closed) is the opposite of
                           disaster over-engineering
I5 simpler recovery        NOT FOUND — every attempted simplification (drop generation continuity,
                           drop custody separation, drop effect deny-default) deletes a stated
                           invariant with a real failure class behind it
J1 native supersession     NO — see framework ledger rows 1–6
J2 reopen now              NO — minor-version drift; see NM-2 for the named repin input
J3 same-process max        YES — split-now adds ops complexity to a one-VM installation against
                           zero evidenced bleed; the split trigger is defined and falsifiable
J4 smallest mapping        CONFIRMED — direct Agent / AgentController / native approval / narrow
                           Scheduler ingress remain smaller than any Workflow-wrapper or custom
                           runtime alternative; upstream 1.61 changes strengthen, not weaken, this
K1 burden proportional     YES — routing obligations, not a verification framework
K2 compilable              YES — 3O's manifest model compiles obligations into the slice
K3 duplication             NONE — falsifier texts exist once (checker derives from §46; 3O imports
                           by reference; §42 families route without ID inflation)
K4 presence-only claims    NONE found — Repository Standard guard-quality rules and 3O-P6 negative
                           control requirements explicitly forbid the class
K5 feedback room           YES — table spellings, CR-1 primitive, watermark mechanism, continuity
                           marker, recertification set, enum-not-UI language all explicitly
                           delegated to Realization with stop conditions
L1 fresh-actor route       WORKS — this review reached current truth in the default pack before
                           opening any reference; no Git archaeology was required
L2 sole status authority   YES with one blemish — NM-1; grep found no other unlabeled stale block
L3 duplication drift       MINOR — NM-3; currently consistent
L4 phase docs              CORRECT ROLE — 3N/3O contracts are routed and labeled; the checker
                           derives from architecture, preventing a second oracle
L5 deletable docs          NM-4 candidates only; no deletion needed before Realization Planning
M1 no hidden decisions     CONFIRMED — every open item is realization mechanics with a stop
                           condition, not a Product/owner/trust decision
M2 no manufactured scope   CONFIRMED — Journey N + 3O explicitly forbid manufacturing capability
M3 day-one boundaries      Owner-scoped DB roles/schemas, Brain Git ≠ Project Git, Gateway as sole
                           business egress, hub_control ≠ mastra_* stores, immutable Release
                           identity — these are structurally expensive to retrofit and must be
                           real on day one; DEDICATED, attachments, PAR, budget_counter, MAR
                           beyond sync may stay contracts until first use
M4 smallest honest slice   Workspace + Project + Sankhya Connection + minimal Brain (budget
                           semantics) + governed sync + read model + registered Queries +
                           dashboard + Release/Promotion/SERVED_VERIFIED + the 3O-P1..P7 harness
                           with its negative control — this slice already falsifies V01, V04, V06,
                           V07, V10, V18, V22, V23, V28 and the first-vertical proof family
M5 readiness               READY — prerequisites are the two named Realization inputs (NM-1, NM-2),
                           neither of which reopens authority
```

### Deletion ledger — 10 strongest candidates attacked

| # | Candidate | Verdict | Deciding invariant/consumer |
| --- | --- | --- | --- |
| 1 | DEDICATED trust contract (`DedicatedApplicationPrincipal`, `private_key_jwt`, exact ReleaseRef, `SERVICE_SCOPED`) | KEEP | Strongest overengineering candidate; deletion fails: the Baseline union `MANAGED \| DEDICATED` is accepted Product authority, so deleting the trust contract leaves a closed union member with an **undefined trust crossing** — the single worst class to retrofit (security boundary under pressure of a waiting consumer). The contract is prose-only: no auth store, token machinery, or deployment exists. Mechanism namings are revalidated at the first real DEDICATED consumer (explicit reopen trigger), so the residual risk of premature naming is already fenced |
| 2 | `gw.budget_counter` | KEEP | No first-slice consumer, but it is closed inventory, not built machinery; once any Release/Agent declares an effect budget, restart/retry/fresh-run oversubscription is preventable only by a durable Gateway-owned counter (owner projection since 3N F-03 correctly separates it from deferred model-spend) |
| 3 | AnalyticQuery second read regime | KEEP | C-011 accepted Product capability; deleting is a Product reopen with no material Evidence; zero F1 machinery is forced (first vertical uses registered Query); the restricted-AST contract is the seam that prevents runtime LLM SQL from ever becoming necessary-by-retrofit |
| 4 | Collapse MAR into Release + Gateway | KEEP SEPARATE | Occurrence lifecycle (single-flight, coalesce, one-catch-up, orphan settlement) has no honest home in either: Release disclaims mutable runtime, Gateway disclaims occurrence/business meaning; the merge builds a God component out of two clean disclaimers |
| 5 | Unify PAR `SCHEDULE` and MAR recurrence | KEEP SEPARATE | The laws genuinely differ (SKIPPED-no-backlog vs freshness-driven one-catch-up); a shared abstraction needs per-consumer modes — i.e., the rejected generic scheduler domain re-entering through the back door |
| 6 | Merge Artifact Registry into Release | KEEP SEPARATE | `AVAILABLE != PROMOTED != SERVED_VERIFIED` and the three-histories law depend on availability and serving being different authorities; merging reopens mutable-latest risk (V22 class) |
| 7 | Merge Connections into Gateway | KEEP SEPARATE | Qualification/lifecycle truth vs execution/effect truth; one owner holding both is a single God authority over the entire external world, and the C-007 chain (`configured != qualified != bound != healthy != authorized`) loses its enforcement seams |
| 8 | Flatten PlanningDepth × RigorProfile to one scalar | KEEP AXES | `DIRECT + CONTROLLED` is unrepresentable in a scalar and is a real first-vertical case; the floor/maximum semantics (human fixes depth floor, risk fixes rigor maximum, unknown never lowers) are direction-specific and cannot share one dial |
| 9 | Delete `brn.health` / `brn.binding_validation` durable records | KEEP | AgentRun pins a health snapshot and approval binds `effectiveBrainSliceDigest` — both need durable referents; binding conformance proof must survive to Release/Promotion checks; neither is derivable from the immutable Brain revision |
| 10 | Reduce the 16-entry Tier-2 FK allowlist toward zero | KEEP | Each entry protects structural containment whose dangling state is invalid independent of authorization; deleting converts silent referential corruption from impossible to undetectable, while the allowlist's RESTRICT-only, no-authority rules already prevent FK-driven coupling |

### Missing-complexity ledger — 10 strongest gap candidates attacked

| # | Candidate gap | Verdict | Why |
| --- | --- | --- | --- |
| 1 | Explicit "all Z3 guest interaction is Hub-outbound" constraint | DEFER SAFELY | Consistent with everything accepted; make it an explicit Realization conformance line (NM-5); adding architecture now would only restate topology |
| 2 | Mastra repin/security-advisory intake before first build | ALREADY COVERED | Repin + affected-criteria requalification is accepted law; NM-2 supplies the named non-deferrable input |
| 3 | Read-model watermark/coverage mechanism | ALREADY COVERED | 3O temporal-closure invariant (`equal coverage or INDETERMINATE`) is current; the mechanism is deliberately a Realization choice with an honest fail-closed default |
| 4 | Positive generation-continuity marker realization | ALREADY COVERED | 3M/operations state the property and the stop condition if it needs new semantic state; inventing the marker now would be architecture doing Realization's job |
| 5 | Sankhya connector fit (auth shape, paging, quirks, rate limits) | ALREADY COVERED | C-007 reopen trigger "first real provider falls outside the closed contract" is the honest route; pre-specifying Sankhya quirks without probe Evidence would fabricate qualification |
| 6 | Timezone/DST/business-time slot semantics | DEFER SAFELY | 3O admission item 3 already requires business-time meaning to resolve from accepted authority per case; a global time doctrine has no current consumer |
| 7 | Published App rate limiting / anti-abuse | DEFER SAFELY | Private LAN + VPN, closed role set, no anonymous access F1; a real public/embed consumer is the named trigger |
| 8 | Monitoring/alerting/paging | DEFER SAFELY | Explicit seam ("external SLA monitoring/paging"); internal-first operations accept operator-driven observation; F5 truth laws are unaffected |
| 9 | Concurrent multi-operator Builder on one Change | ALREADY COVERED | Serial baseline is C-017 authority with a measured-concurrency defeat trigger; Hub-owned checklist CAS semantics already refuse stale transitions |
| 10 | Postgres operational envelope (pooling, vacuum, sizing, connection limits) | DEFER SAFELY | Pure realization/operations; no architecture invariant depends on it; EnvironmentConformance owns the checkable subset (roles, privileges, extensions, major) |

Result: **0 ADD NOW survived.** The strongest candidate (row 2) lands as a named obligation inside already-accepted law, not as new architecture. This is consistent with an architecture that has already absorbed three independent adversarial rounds (3N, 3O, C-018 R1–R7); the finding surface remaining before implementation Evidence exists is legitimately thin.

### Framework overlap ledger — Conexus vs current Mastra/native/reference

| Conexus responsibility | Native/reference alternative | Disposition |
| --- | --- | --- |
| Plan/checklist current state (`bld.plan_revision`, Hub transitions) | Mastra AgentController plan/`submit_plan` mechanics (1.61 preserves plan-revision feedback) | OWN authority / USE NATIVE as proposal transport — decisive fact: `mastra_builder` is excluded from the required recovery set, so plan truth persisted only in the framework would not survive disaster restore; the accepted worker-proposes→Hub-applies shape already uses the native mechanics in exactly the subordinate role |
| Approval meaning (`par.approval_request`, sealed subject, eligibility) | Native `requireApproval` + approve/decline; 1.61 adds atomic resume claim + 409 on conflict | USE NATIVE mechanics / OWN meaning — unchanged; upstream's new atomic-claim guard independently validates the accepted owner-recheck boundary |
| Scheduled execution admission (TriggerRevision, slot identity, single-flight) | Native Scheduler + workflow-target | USE NATIVE + narrow PAR ingress (BT-4N proven); scheduler state never becomes due-work authority |
| Conversation identity | Mastra Memory thread/resource | USE NATIVE with Conexus-derived IDs (BT-2 proven) |
| Builder session steering/interruption UX | 1.61 `session.steer` / `while-active` delivery marking | KEEP SEAM — pure runtime mechanics; adopt at Realization if useful; no authority contact |
| Worker Eval / Golden benchmark execution | 1.61 caller-driven experiments (`createExperiment`/`submitExperimentResult`, external orchestrator keeps the loop) | KEEP SEAM / REQUALIFY — promising substrate precisely because the caller-driven shape lets Conexus own the loop and verdicts while Mastra stores results; scorer/eval globals remain OFF and unqualified (BT-5N), and 3N F-02 already keeps metrics out of authority |
| Active-run crash recovery | `DurableAgent` | DEFER — unchanged; activation is a named requalification trigger |
| Builder workspace/sandbox mechanics | Mastra Workspace + `@mastra/e2b` | USE NATIVE + OWN the physical-incarnation guard (Package-A required guard stands) |
| Observability export | `@mastra/observability` / Trace Intelligence | KEEP SEAM / REQUALIFY — unpinned, not C-016-admitted; telemetry-never-authority makes any future adoption mechanically safe to bound |
| Agent definition authority | Mastra Stored Agents / Editor / Studio | REJECT as authority — unchanged; `agent/v1` in Git + exact Release remains the only authoring truth |

No row produced a `USE NATIVE` that deletes a Conexus owner, and no row produced an `OWN` that duplicates working framework machinery. The mapping already sits at the boundary METHOD demands: differentiated semantics sovereign, commodity mechanics native.

### Strongest counterexamples attempted against the verdict

**Overengineering counterexample (failed):** "Delete the DEDICATED trust contract; F1 is MANAGED-only, so the contract is speculative machinery." Failed twice over: first, there is no machinery — the contract is semantic prose defining who the principal is, what the assertion binds, and what is rechecked; second, deletion does not simplify but *destabilizes*: the accepted `MANAGED | DEDICATED` Baseline union would point at an undefined trust crossing, and the first real DEDICATED consumer would force a security-boundary design under delivery pressure — the exact "foreseeable structural dead end" METHOD's Global Maximum clause exists to prevent. The honest simplification was already taken: physical deployment, auth stores, token machinery, and fleet mechanics are all absent.

**Underengineering counterexample (failed):** "The pinned Mastra head can execute a concurrently-resumed suspended run's downstream steps twice (upstream #20443), so the exact-approval architecture is unsound on its qualified substrate." Failed as an architecture falsifier: the accepted design never trusts framework resume as authorization — the tool boundary rechecks current owner truth and Gateway's server-derived semantic effect identity fences a duplicate admission of the same intent, so the defect's reachable consequence is duplicated non-effect computation, not a duplicated governed effect. The attempt instead *confirmed* that the owner-recheck and effect-identity layers are load-bearing (and upstream's own fix converges on the same guard shape). It also produced this review's most useful output: the named repin obligation in NM-2.

**Second underengineering counterexample (failed):** "The first vertical's read model can self-certify — sync writes it, Queries read it, dashboard shows it, and nothing outside that loop ever checks Sankhya truth." This is exactly 3N-V28, and 3O closes it structurally: an independently derived live-source oracle, a shared comparison boundary with `INDETERMINATE` on unequal coverage, a result→rule-class→case mapping that forbids coverage by declaration, and a negative control that must fire. The contract is falsifiable at the first build, which is the earliest stage anything real can falsify it.

### Why the architecture is not merely "complex but defensible"

The complexity is enumerable and each unit is tied to a current invariant: 13 owners each trace to a ratified C-decision; 46 record classes each carry a stated non-derivability argument with a mechanical closure check; the truth laws (§2, contract §23) are one-line falsifiable statements, not prose atmosphere; and all 28 + §42 obligations name the earliest real stage that can falsify them instead of pretending to prove them now.

Equally important, the architecture's size is mostly *negative space* — deliberate refusals with named triggers, which is what keeps it bounded: one process, one PG cluster, no HA, serial Builder baseline, exactly two cross-owner transactions, exactly 16 structural FKs, one Workspace Brain, a two-role Published App set, no EVENT triggers, no advanced memory, no generic scheduler/workflow/recovery/budget/secret owners, Package C and E deferred, monetary enforcement deferred, DEDICATED physical deployment deferred. Every deferral carries the trigger that reopens it, so the simplifications are falsifiable commitments rather than omissions.

The system survives the Structural Inversion Test: if Mastra, E2B, pg-boss, or PostgreSQL were each replaced by a materially different substrate, the owner set, truth laws, effect identity, Release immutability, Brain separation, and recovery posture all remain true — which is the definition of mechanism-subordinated architecture. Under METHOD v1.0.0 the correct outcome is therefore **CURRENT STRUCTURE CONFIRMED**: the ratified architecture is the Global Maximum for the current constraints, and Realization Planning may proceed with the two named inputs from NM-1 and NM-2.

```text
Fable Round 1 = COMPLETE
Round 2 justified = NO (no material contradiction survives)
```
