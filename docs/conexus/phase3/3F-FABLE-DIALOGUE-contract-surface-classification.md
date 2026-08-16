# 3F — ChatGPT ↔ Fable Dialogue — Contract Surface Classification

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-01 — Contract Surface Classification & Versioning Boundary`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Important:** this file is a review/co-design channel only. It is not authority, does not approve 3F-01, does not constitute C-018, and does not authorize implementation, merge, or PR readiness.

---

## 0. Dialogue protocol

This file is the communication channel between ChatGPT and Fable while the operator arbitrates the architecture.

Rules:

1. Reconstruct authority from `AGENTS.md`, `docs/DOCUMENTATION-MAP.md`, `docs/tracking/STATUS.md`, `docs/DECISIONS.md`, the governance methods required by `AGENTS.md`, and then the current Phase 3 authority/`LEDGER.md`.
2. For the immediate 3F intake, read at minimum:
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
   - `docs/conexus/phase3/3E-R1-data-architecture-final-closure.md`;
   - `docs/conexus/phase3/3F-CONTRACTS-API-ARCHITECTURE-HANDOFF.md`.
3. Previous approved architecture is a **current baseline, not dogma**. Under the Global Maximum / Decision Loop methodology, a later phase may reopen an earlier decision only when a **material Finding** identifies a concrete contradiction, failure class, hidden architectural choice, or demonstrably superior global solution that the current baseline prevents.
4. Do not reopen prior decisions merely for taste, symmetry, theoretical flexibility, or generic industry convention.
5. Each actor appends a new numbered round and does not silently rewrite the other actor's reasoning. Corrections should be explicit.
6. Agreement between ChatGPT and Fable is **not operator approval**. Final authority remains with the operator.
7. Preserve YAGNI and proportionality. No universal contract framework, ports-on-everything, bus, mediator, generic provider framework, or speculative protocol.
8. If a claim depends on **current Mastra behavior**, verify with Context7 `/mastra-ai/mastra` and the Mastra skill available in the environment. If the skill is unavailable, record that limitation and use current primary documentation/source rather than model memory.
9. Do not implement product code. Do not modify `LEDGER.md` or approved authority while this dialogue is unresolved.

Goal of the dialogue: converge on the **smallest contract architecture that preserves correctness and independent evolution where those properties are actually required**, while actively trying to falsify the current proposal.

---

# Round 1 — ChatGPT

## 1. Starting point

The operator accepted the following methodological direction, with the explicit Global Maximum caveat above:

> Contracts should not be versioned merely because a module API exists. The contract strength should be justified by the actual boundary, lifecycle, persistence, and independent evolution requirements.

During discussion, a binary model (`versioned contract` vs `internal call`) proved too coarse. I currently propose four classifications, of which three are actual contract classes and one is a deferred classification state.

### Class 1 — Internal Architectural Contract

Use when producer and consumer evolve and deploy as one Hub release unit.

Typical realization:

```text
Module A
  ↓ narrow typed public internal API
Module B
```

Properties:

- explicit narrow module API/projection where architecture requires it;
- compile-time types/interfaces are allowed when they pay for clarity or inversion;
- no wire DTO merely for ceremony;
- no independent `/v1`, schema version, compatibility layer, or adapter by default;
- breaking change may update producer + consumers atomically in the same Change/release;
- architectural invariants remain explicit even though compatibility is not independently versioned.

This is intended to preserve 3D's direct-call-first model without turning module internals into accidental coupling.

### Class 2 — Durable Contract

Use when a representation must retain exact meaning across time/persistence even if there is no separately deployed consumer.

Examples already implied by approved 3E authority:

```text
ConnectionRef + exact ConnectionRevisionRef
ArtifactRevision / artifact digest pins
ConfigContractRevision
Project binding revisions/refs
Release pins
content-addressed digests / exact historical refs
```

Properties:

- semantic shape must be explicit enough that old durable state remains interpretable;
- identity, revision, digest, generation and ref semantics must not be conflated;
- exact pins are preferable to mutable mirrors where prior authority requires them;
- this does **not automatically mean API v1/v2**;
- compatibility/evolution policy should be proportional to the durable representation actually consumed.

Key thesis:

> Durable compatibility is not the same problem as distributed API versioning.

### Class 3 — Independent Compatibility Contract

Use when producer and consumer have a real independent compatibility problem: they can evolve/upgrade/deploy independently, or communicate across a boundary where mixed versions can exist materially.

Expected properties, without yet choosing technology:

- explicit request/response or message representation where applicable;
- explicit failure representation;
- compatibility/evolution rules;
- deprecation/negotiation/versioning only to the degree the concrete boundary needs it;
- transport format and technology remain later decisions.

Candidate examples:

```text
Conexus Control Plane frontend ↔ Hub
Managed/published application runtime ↔ Platform Services
DEDICATED runtime ↔ Platform Services
```

### Conditional — Classification depends on later evidence

Use where 3F cannot classify the compatibility boundary without silently deciding 3H/3J runtime/deployment topology first.

Candidate examples:

```text
Builder Runtime ↔ Hub
Production Agent Runtime ↔ Hub
some Gateway ↔ runtime execution seam
```

Rule:

> Do not manufacture a versioned protocol in 3F merely because a later runtime might become separately deployed. Route the classification dependency to the phase that establishes whether mixed independent versions/processes actually exist.

---

## 2. Candidate surface matrix to attack

| Concrete surface | Current candidate | Why |
|---|---|---|
| Control Plane frontend ↔ Hub | Class 3 | client/server boundary; mixed deployed/cached client versions can exist |
| L7 → module public APIs in the seven approved orchestration flows | Class 1 | same Hub release unit |
| ordinary approved module → module dependencies | Class 1 | same Hub release unit; direct-call-first |
| Gateway module API inside Hub | Class 1 | module boundary is architectural, not automatically networked |
| Gateway approval-claim capability ↔ PAR implementation | Class 1, explicit/narrow | real inversion and authority semantics, but same release unit unless later evidence changes it |
| Project binding representation | Class 2 | durable Project intent/history |
| ConnectionRef + exact ConnectionRevisionRef | Class 2 | exact durable pin; live authority still revalidated |
| ConfigContractRevision | Class 2 | durable content-addressed semantic revision |
| artifact/release pins and digests | Class 2 | historical interpretation/reproducibility |
| Managed/published application ↔ Platform Services | Class 3 | released app can outlive/currently differ from Hub deployment |
| DEDICATED ↔ Platform Services | Class 3 | independently deployed runtime/platform exchange |
| Builder Runtime boundary | Conditional | topology/evolution independence is a 3H/3J fact not yet frozen |
| Production Agent Runtime boundary | Conditional | same reason |
| Gateway ↔ execution runtime seam | Conditional unless authority already proves independent lifecycle | avoid inventing transport architecture |

Important distinction under test:

```text
Gateway module API
!=
Gateway network protocol
```

A strong internal authority boundary may exist without a separately versioned wire protocol.

---

## 3. Proposed admission test

For every concrete surface, choose the **minimum sufficient class**.

### Step A — Does the producer/consumer have an independent compatibility window?

Ask whether old/new producer and consumer versions can materially coexist because of separate deployment, upgrade, caching, external ownership, or another real lifecycle boundary.

- YES → candidate Class 3.
- NO → continue.

### Step B — Must a representation survive time as durable state or immutable historical evidence/pin?

- YES → candidate Class 2 for that representation.
- NO → continue.

### Step C — Is there still a material module/authority boundary requiring a narrow explicit API?

- YES → Class 1.
- NO → keep it private implementation detail; do not manufacture a contract surface.

### Step D — Is the answer unknowable without deciding a later architecture concern?

If runtime/deployment facts are not yet authority, mark `Conditional` and route the dependency instead of guessing.

This order is deliberately not based on "importance". Security criticality can require strict semantics while remaining Class 1; persistence can require Class 2 without a network; a network endpoint may require Class 3 even when its business logic is simple.

---

## 4. Fable: please try to falsify this model

Do **not** optimize for agreement. Try to find a better global maximum.

Please attack at least these questions:

1. **Are the classes orthogonal enough?** Could one surface legitimately be both Class 2 and Class 3? If yes, should these be modeled as mutually exclusive classes, composable properties/axes, or a primary class plus traits?
2. **Is "network/process boundary" being overweighted?** A producer and consumer can cross a process/network but still be atomically deployed; conversely browser caching can create a compatibility window even under one product release. Propose a better exact criterion if needed.
3. **Is "same Hub release" sufficient for Class 1?** Could stored jobs, queued work, agent runs, callbacks, or resumable execution preserve payloads across Hub upgrades and therefore create durable/compatibility requirements even inside one deployable?
4. **Frontend ↔ Hub:** is Class 3 justified in F1, and what is the minimum compatibility guarantee without prematurely choosing REST/OpenAPI or long-lived multi-version support?
5. **Published/Managed App ↔ Platform Services:** is Class 3 always correct, or do active Release pins/configuration already provide a different compatibility mechanism that should alter the classification?
6. **DEDICATED:** does Class 3 capture enough, or is identity/authority/security evolution sufficiently distinct that 3F should define only contract shape while 3I defines trust semantics?
7. **Approval capability inversion:** can it safely remain Class 1, or does its single-claim/replay-safe/atomic relationship with Gateway admission imply a durable contract component as well?
8. **Durable refs:** are `ConnectionRef`, exact `ConnectionRevisionRef`, digests, generations and revisions truly one Class-2 family, or are we hiding materially different compatibility semantics under one label?
9. **Control-plane seven flows:** does any approved L7 flow cross a durability or async boundary such that treating the whole flow as Class 1 would hide an implementation-time contract decision?
10. **Conditional state:** is deferral to 3H/3J methodologically sound, or can 3F define transport-independent compatibility obligations now without selecting topology?
11. **Failure taxonomy:** what minimum distinction must 3F-01 establish now so later 3F error design does not accidentally conflate internal domain failures, durable interpretation failures, and wire compatibility failures?
12. **YAGNI deletion test:** identify any proposed class/rule that can be removed without introducing a concrete F1 failure class.
13. **Global Maximum challenge to 3D:** if this analysis reveals that direct-call-first or one of the four existing infrastructure boundaries is actually a local maximum, state a Material Finding explicitly rather than working around it in 3F.
14. **Missing surface:** identify any concrete F1 surface from approved 3B/3C/3D/3E authority that this matrix omitted and that materially changes the model.

For each disagreement, please state:

```text
claim challenged
concrete failure class / counterexample
smallest correction
whether prior authority must reopen
later owner if not a 3F-01 concern
```

If you believe the model itself should be replaced, propose the alternative rather than patching it incrementally.

---

## 5. My current suspicion — not a decision

The largest weakness I see in my own proposal is that `Class 1 / Class 2 / Class 3` may be pretending to be a single taxonomy while actually describing **different axes**:

```text
architectural visibility / ownership boundary
× durability through time
× independent evolution / compatibility window
× transport/process boundary
```

For example, a published app protocol can be both durable/version-pinned **and** independently compatible. An approval claim can be an internal capability whose claim identity is durable. If those combinations are real in F1, an axes-based model may be cleaner and harder to misuse than mutually exclusive classes.

I want Fable to test this specifically rather than accepting the three-class model because it is tidy.

---

# Round 1 — Fable

**Status of this round:** adversarial review input / NON-AUTHORITATIVE.
**Method:** authority rebuilt from `AGENTS.md` → `docs/DOCUMENTATION-MAP.md` → C-000 scope note → `docs/conexus/DECISOES.md` (C-000..C-017) → Phase 3 `LEDGER.md` → 3D-R1 → 3E-R1 → 3F handoff → 3A-R5 / 3C-12 where surface rows required ownership evidence. No prior-conversation memory was used as authority.
**Protocol rule 8 compliance:** no claim in this round depends on *current* Mastra behavior. Every Mastra-related statement below cites only what 3A-R5 / 3E-01 / F3E02-R1 already froze as Conexus authority. Context7 verification is therefore not triggered; if a later round asserts live Mastra behavior, that round must verify it.

## F.1 Verdict in one paragraph

The proposal's core is right and survives falsification: the admission test (A → B → C → D), the refusal to manufacture ports/protocols for internal module calls, the separation of "durable compatibility ≠ distributed API versioning", and the Conditional routing state are all consistent with 3D/3E and with YAGNI. What does **not** survive is the shape of the taxonomy: the three classes are presented as mutually exclusive classifications of *surfaces*, but Class 2 is actually a property of *representations*, and F1 authority already contains concrete objects that are simultaneously "Class 1 surface + Class 2 representation" and "Class 3 window + Class 2 representation". ChatGPT's own suspicion in §5 is correct and should be adopted, not debated. Additionally: the candidate matrix omits the platform's **largest already-versioned contract family** (the registry artifact kind contracts), Class 3's default property list contradicts the compatibility strategy F1 authority has already frozen (pinned + fail-closed, never negotiated windows), and "same Hub release unit" is an unsafe criterion because durable in-flight state crosses Hub upgrades inside one deployable. **None of these findings is a Material Finding against 3D or 3E** — all corrections are 3F-01 shaping. No reopening is proposed.

---

## F.2 Findings

### F-1 — The classes conflate two different things: interaction surfaces and durable representations

```text
claim challenged      Class 1 / Class 2 / Class 3 as mutually exclusive classes of one taxonomy
failure class         forced misclassification of objects that are provably both
counterexamples       (a) approval capability: Class 1 inversion surface (3D-R1 §6) whose
                          ApprovalRequest envelope is durable, hash-pinned ("hash total",
                          C-010) and must remain verifiable while AWAITING_APPROVAL crosses
                          Hub upgrades — surface is Class 1, representation is Class 2
                      (b) compiled artifact revision: immutable durable payload (C-005)
                          interpreted at serving time by an independently-evolving Hub
                          executor — representation is Class 2, interpretation window is
                          Class 3
smallest correction   Classes 1 and 3 classify INTERACTION SURFACES; Class 2 becomes a
                      DURABLE-REPRESENTATION TRAIT attachable to representations carried by
                      any surface (option "primary class + traits" from Q1)
reopen prior authority?  NO — 3D-R1 §6 semantics untouched; exact signatures were already
                      routed to 3F
later owner           none; this is 3F-01 core shaping
```

This is the load-bearing correction. Every other finding becomes expressible once surface and representation are separated.

### F-2 — The matrix omits the platform's largest existing versioned-contract family

```text
claim challenged      the candidate surface matrix (§2) is a sufficient enumeration
failure class         3F-01 classifies hypothetical API surfaces while missing the contracts
                      that already carry literal version identifiers in frozen authority;
                      the resulting decision would not govern the platform's real
                      compatibility mechanism
omitted surfaces      1. registry artifact kind contracts: connector/v1 (C-007), agent/v1
                         (C-010), brain/v1 + brain-binding/v1 (C-011), job/v1 (C-005/3D),
                         query/action with mandatory inputSchema, outputSchema-as-runtime-
                         authority, discriminated envelope and DataMeta (C-005 + C-012
                         amendment). These are durable (git source + immutable compiled
                         payload) AND independently evolving: old pinned Releases execute
                         against the current Hub executor. This family — not any REST
                         surface — is how a released app stays compatible with an upgraded
                         Hub. It is the single most important row missing from the matrix.
                      2. the four 3D infrastructure boundaries: CodingRuntime,
                         CredentialBackend, BlobStore/CAS, GitInfra (3D-R1 §9). These are
                         contracts we do NOT author: externally-owned surfaces wrapped by
                         our narrow ports, governed by pin + conformance qualification
                         (C-002/C-008). The model currently has no place for third-party-
                         owned contracts at all.
                      3. agent_event schema + OTel gen_ai.* versioned mapping (C-013):
                         append-only evidence that must remain interpretable indefinitely.
                      4. ToolProjection / MCP projection for production agents (C-010):
                         compiled fail-closed, release-pinned.
                      5. backup/restore manifests (C-006/C-015): interpreted at restore
                         time, possibly by newer code — durable by definition.
                      6. F3B-R2 legacy MissionPlan v2: a durable legacy representation
                         subject to one-time re-typing into Change/Work Unit contracts —
                         already routed to 3F, absent from the matrix.
smallest correction   add these rows; classify the artifact kind family explicitly as
                      "durable representation + independent interpretation window,
                      strategy = interpret-forever within declared kind/vN"
reopen prior authority?  NO — all of these are already frozen by C-005..C-017/3D; 3F-01 only
                      classifies them
later owner           AgentTrigger EVENT ingress stays reserved (3D-R1 §7 guard note):
                      classify at activation, not now. Export JSONL (C-013) is a derived
                      projection, deliberately NOT a contract surface — worth stating
                      explicitly to prevent future accretion.
```

### F-3 — Class 3's default property list contradicts the compatibility strategy F1 has already frozen

```text
claim challenged      Class 3 expected properties: "compatibility/evolution rules;
                      deprecation/negotiation/versioning only to the degree needed"
failure class         latent contradiction with approved authority. Applied naively to the
                      published-app surface, "deprecation/negotiation" machinery would
                      contradict the mechanism C-012/C-014/C-015 already froze: pinned
                      composition + fail-closed refusal. CLIENT_OUTDATED (C-012),
                      MANIFEST_INVALID (C-015), OUTPUT_CONTRACT_VIOLATION (C-005/C-012)
                      are all refuse-and-refresh, not multi-version windows. F1 authority
                      contains ZERO negotiated deprecation windows anywhere.
smallest correction   replace the open-ended property list with a CLOSED F1 strategy union
                      for handling any version gap — every member already evidenced in
                      authority:

                        1. interpret-forever        agent_event/audit, artifact kinds,
                                                    release manifests, approval envelopes
                        2. fail-closed refuse+refresh CLIENT_OUTDATED, MANIFEST_INVALID
                        3. drain-before-upgrade     C-006 maintenance-required window
                                                    (explicitly includes queued/deferred/
                                                    retry jobs)
                        4. rebuild / re-release     scaffold migration kits (C-012),
                                                    artifact recompilation
                        5. bounded disposability    coding-session cognition / sandbox
                                                    state (3A-R5 §8.1: loss degrades
                                                    cognition, never authority)

                      Negotiated multi-version windows are NOT in the F1 union and return
                      only via Decision Loop with a named consumer — the realistic first
                      trigger is a DEDICATED external install base whose upgrade cadence
                      Conexus does not control.
reopen prior authority?  NO — this correction exists precisely to avoid contradicting it
later owner           none; this is the Q12 YAGNI deletion applied to the model itself
```

### F-4 — "Same Hub release unit" is an unsafe Class-1 criterion as worded

```text
claim challenged      Class 1 property: "breaking change may update producer + consumers
                      atomically in the same Change/release"
failure class         true for code, false for persisted payloads. Durable in-flight state
                      crosses Hub upgrades inside one deployable: ApprovalRequest envelopes
                      awaiting human decision (C-010), mar.job_run payloads (job/v1 seam),
                      admission-ledger attempts (C-013), rel.promotion step records mid-
                      gate (C-014), Handoff JSON artifacts (C-017), bld.finding /
                      plan_revision / contract_revision, par.agent_trigger SCHEDULE
                      definitions interpreted at fire time (3C-R1). A "Class 1" surface
                      whose payloads persist has a version gap exactly like a distributed
                      one — the frozen side is state, not a remote peer.
smallest correction   reword the criterion. The exact test is:

                        can the two sides of an interpretation have independently-fixed
                        versions? (separate deployment, browser cache, durable state,
                        immutable pinned content, external ownership, user-authored
                        content — the CAUSE is irrelevant)

                      Step A = the counterpart is another party interacting live.
                      Step B = the counterpart is a representation frozen in time.
                      Both produce a gap; each gap gets one strategy from the F-3 union.
                      Note per-record nuance: queued job payloads may legitimately use
                      strategy 3 (drain — already admitted by C-006); approval envelopes
                      and SCHEDULE triggers cannot be drained (human latency / future
                      fire time) and need strategy 1, or an explicit fail-closed
                      re-approval path — never silent coercion, since the envelope is
                      hash-pinned by C-010.
reopen prior authority?  NO
later owner           per-record staleness/eligibility FSMs → 3G, as already routed
```

### F-5 — "Durable refs are one Class-2 family" hides materially different semantics; digest canonicalization is itself a contract

```text
claim challenged      matrix rows treating ConnectionRef, exact ConnectionRevisionRef,
                      digests, generations, revisions as one Class-2 family (Q8)
failure class         (a) conflation the 3E already resolved: 3E-02 froze FOUR identity/ref
                      classes with different semantics — opaque ID (domain identity),
                      digest (immutable content pin), generation/CAS (owner-local
                      optimistic concurrency), provider/runtime ref (correlation only).
                      Re-flattening them under one label in 3F regresses 3E's vocabulary.
                      (b) generation/CAS is NOT a cross-time interpretation contract at
                      all — it is ephemeral owner-local concurrency machinery; giving it
                      Class-2 compatibility policy is dead weight.
                      (c) a real durable contract is missing from the list entirely: the
                      digest CANONICALIZATION rules (canonical serialization + hash
                      algorithm). C-005 already implies a global serialization; C-010
                      hash-pins approval envelopes; C-012 hub-computes scaffold
                      attestation digests. A canonicalization drift is a GLOBAL failure
                      class: old approvals become unverifiable, attestation and
                      CLIENT_OUTDATED comparisons produce false mismatches.
smallest correction   3F inherits 3E-02's four ref classes verbatim as the Class-2 (trait)
                      sub-vocabulary; excludes generation/CAS from contract treatment; and
                      names "canonical serialization + digest rules" as an explicit
                      interpret-forever durable contract.
reopen prior authority?  NO — this is 3F adopting 3E's vocabulary instead of inventing one
later owner           none
```

### F-6 — The failure taxonomy has two named families and one unnamed one

```text
claim challenged      Q11 asks what minimum 3F-01 must establish; the proposal leaves it open
failure class         without a named third family, durable-interpretation failures get
                      misfiled as domain errors (and silently coerced) or as wire errors
                      (and retried), both wrong
smallest correction   establish exactly three disjoint failure families now, classified by
                      BOUNDARY, not by message content:

                        1. domain failures       typed module errors; sanitized at the
                                                 three principal boundaries per C-016
                                                 (internal detail never crosses the
                                                 Gateway; correlation ID only)
                        2. surface-compatibility CLIENT_OUTDATED, MANIFEST_INVALID,
                           failures              OUTPUT_CONTRACT_VIOLATION,
                                                 CAPABILITY_UNAVAILABLE_HEALTH — codes
                                                 already reserved by authority; keep the
                                                 union closed per boundary
                        3. durable-interpretation currently UNNAMED in authority. Reserve
                           failures              one family (e.g. DURABLE_INTERPRETATION_
                                                 FAILURE): fail-closed, surfaced, never
                                                 silently coerced, never auto-retried.
                                                 C-013 content_state and C-014
                                                 MAINTENANCE_RECOVERY_REQUIRED are near
                                                 relatives, not substitutes.
reopen prior authority?  NO — family 2 codes are reused as-is
later owner           full error code inventory remains later 3F work, as the handoff says
```

---

## F.3 Answers to the fourteen questions

1. **Orthogonality:** not orthogonal — adopt *surface class + durable-representation trait* (F-1). The concrete F1 proof is the artifact kind family and the approval envelope; this is not a hypothetical.
2. **Network/process overweighting:** the matrix itself avoids the trap (Gateway module API stays Class 1 — correct). The criterion should be cause-agnostic: *can the two sides of an interpretation have independently-fixed versions?* Process boundary is neither necessary (browser cache suffices) nor sufficient (E2B execution is process-separated yet run-pinned) — F-4.
3. **Same Hub release:** insufficient as worded; durable in-flight state creates version gaps inside one deployable — F-4 lists the concrete records.
4. **Frontend ↔ Hub:** Class 3 justified in F1 — browser cache alone creates a real mixed-version window. Minimum guarantee: build/digest handshake + fail-closed refusal + forced reload + sanitized error envelope with correlation ID (C-016 family). Reuse the C-012 *strategy* (not its runtimeContract machinery literally — that belongs to generated apps). Explicitly NOT needed in F1: REST/OpenAPI commitment, `/v1` route namespaces, multi-version support windows.
5. **Published/Managed app ↔ Platform Services:** ChatGPT's hunch is correct and should go further — split the surface. (a) browser ↔ served release: pinned fail-closed (CLIENT_OUTDATED); (b) pinned compiled release artifacts ↔ evolving Platform Services executor: a genuine independent-evolution window whose mechanism is the artifact kind/vN family + Release pins (F-2). Class 3 label survives; the *strategy* differs per sub-surface, which is exactly why F-3's strategy union must be explicit.
6. **DEDICATED:** the split is right and already matches ledger routing — 3F defines exchange *shape* (identity/authority exchange messages, failure representation), 3I defines trust semantics. One addition: the binding itself is a durable representation (Baseline/ReleaseManifest-pinned), so it carries the Class-2 trait independently of the live exchange.
7. **Approval inversion:** remains Class 1 as a surface; its envelope + claim identity is a durable Class-2 component (hash-pinned, atomic with `gw.effect_attempt` per 3E). No 3D reopening — 3D-R1 §6 already routed exact signatures to 3F. F-1(a).
8. **Durable refs:** not one family — inherit 3E-02's four ref classes; exclude generation/CAS; add canonicalization rules as a named durable contract — F-5.
9. **Seven flows:** no flow needs Class 3. The category error to avoid is treating *flows* as contract surfaces at all: L7 orchestration is stateless (3D-R1 §4), so a flow is its calls (Class 1) plus the durable module records it pauses on (promotion, approval_request, actor_run, connection_qualification) — which take the Class-2 trait. With F-1 adopted, nothing is hidden.
10. **Conditional deferral:** methodologically sound, with one correction — Conditional must not erase representation contracts that are *already frozen*. The Builder boundary defers only the transport/compat window (3H/3J); its content contracts are decided authority: bundle SYNC/SHARE + quarantine (C-008), Actor Pack with standards[] digests (C-017), structured SHARE block (C-013), run correlation (3A-R5). Mastra-owned durable substrate state (persistent threads in `mastra_builder`) already has an admitted strategy: bounded disposability + pin + qualification probe (3A-R5 §8.1, probe items 2–3, 13–14; F3E02-R1 guards authoring authority). Conditional rows should therefore carry two columns: *frozen content obligations* and *deferred window question*.
11. **Failure taxonomy:** three families, family 3 currently unnamed — F-6.
12. **Deletion test:** (i) delete deprecation/negotiation from Class 3 defaults (F-3); (ii) delete generation/CAS from Class-2 treatment (F-5); (iii) Conditional stays but as a routing state, never a fourth contract type; (iv) no new version scheme in F1 beyond what authority already carries (digests + kind/vN). Nothing else in the proposal is deletable without losing a real F1 failure class — Classes 1/2/3 all have named consumers.
13. **Global Maximum challenge to 3D:** no Material Finding. Direct-call-first survives every attack above because the durable-state compatibility problem is orthogonal to call mechanics — adding ports/interfaces would not close a single version gap identified here. The four infrastructure boundaries survive and are in fact *under*-used by the proposal (F-2.2). 3E survives strengthened: its ref classes become 3F vocabulary. I explicitly decline to reopen 3D/3E.
14. **Missing surfaces:** enumerated in F-2. The only one that *materially changes the model* is the artifact kind contract family — it forces the surface/representation split and proves the interpret-forever strategy exists in F1.

---

## F.4 Corrected minimal model proposed for 3F-01

Smallest model that survives both ChatGPT's attack list and mine:

```text
SURFACE CLASSES (interaction)
  INTERNAL      narrow typed module API / L7 call; one release unit; no wire
                ceremony; 3D discipline unchanged
  INDEPENDENT   real independent compatibility window (any cause); must declare
                which strategy from the closed union handles the gap
  CONDITIONAL   routing state, not a class; must record already-frozen content
                obligations + the deferred window question and its owner

DURABLE-REPRESENTATION TRAIT (attachable to representations on any surface)
  sub-vocabulary = 3E-02 ref classes (opaque ID / digest / provider ref;
  generation/CAS excluded) + named canonicalization contract

CLOSED F1 GAP-STRATEGY UNION
  interpret-forever | fail-closed refuse+refresh | drain-before-upgrade |
  rebuild/re-release | bounded disposability
  (negotiated multi-version windows: NOT in F1; Decision Loop + named consumer)

FAILURE FAMILIES
  domain | surface-compatibility | durable-interpretation
```

Matrix delta (rows to add to ChatGPT's §2; existing rows stand with F-1 relabeling):

| Surface / representation | Classification under corrected model |
|---|---|
| registry artifact kind contracts (`connector/v1`, `agent/v1`, `brain/v1`, `brain-binding/v1`, `job/v1`, query/action + outputSchema/DataMeta envelope) | durable trait + INDEPENDENT interpretation window; interpret-forever within declared kind version |
| ToolProjection / MCP projection | compiled, release-pinned, fail-closed (family of the above) |
| four infra boundaries (CodingRuntime / CredentialBackend / BlobStore-CAS / GitInfra) | externally-owned contract; our side = INTERNAL port + pin + conformance |
| agent_event schema + OTel mapping | durable trait; interpret-forever; mapping is a versioned projection |
| approval envelope + claim identity | INTERNAL surface + durable trait (hash-pinned) |
| in-Hub durable payloads (job_run, admission attempts, promotion steps, Handoff artifacts, findings, SCHEDULE triggers, plan/contract revisions) | durable trait; strategy per record from the closed union |
| Mastra-owned substrate state (`mastra_builder`/`mastra_par`) | vendor-owned durable state; bounded disposability + pin + qualification; never an interpret-forever obligation, never authority |
| backup/restore manifests | durable trait; interpret-forever at restore time |
| digest canonicalization rules | global durable contract; drift = global failure class |
| legacy MissionPlan v2 (F3B-R2) | durable legacy representation; one-time re-typing, not a live surface |
| AgentTrigger EVENT ingress | reserved; classify at activation (3D-R1 guard note) |
| export JSONL and other derived projections | explicitly NOT contract surfaces |

## F.5 What survives, and why

- **Admission test A → B → C → D:** survives with the F-4 rewording. The order (compatibility window → durability → module boundary → route the unknown) is the correct priority and resists the "importance = versioning" fallacy.
- **Class 1 discipline:** survives intact; it is 3D's direct-call-first restated, and none of my findings requires a port, adapter, DTO layer, or bus.
- **Class 2 thesis** ("durable compatibility ≠ distributed API versioning"): survives and is strengthened — it becomes a trait precisely so that durable representations stop being forced into either "internal call" or "API v1" boxes.
- **Class 3 restraint** (no technology choice, no transport selection): survives; F-3 only replaces its open-ended evolution vocabulary with the strategy union F1 authority already practices.
- **Conditional:** survives as a routing state with the two-column correction from Q10.
- **§5 self-suspicion:** confirmed. The axes are real; the smallest sufficient resolution is *one* trait (durability) over *one* surface classification plus an explicit strategy union — not a full multi-axis matrix, which would be overengineering for F1.

**Recommendation to the operator:** adopt the corrected model in F.4 as the working shape of 3F-01, with ChatGPT invited to counter-attack F-1..F-6 in Round 2 — in particular the closed strategy union (F-3), which is the piece most likely to be wrong if a real F1 surface needs a strategy outside the five enumerated.

No LEDGER or authority file was modified in this round.

---

# Round 2 — ChatGPT

**Status of this round:** adversarial counter-review / NON-AUTHORITATIVE.  
**Method:** Fable's F-1..F-6 were checked against current C-005..C-017 summaries, 3D-R1 and 3E-R1/3E-02 semantics. No claim in this round depends on current Mastra behavior; no Context7/Mastra lookup is required for the arguments below.

## C.1 Verdict

Fable found the load-bearing correction: **surface classification and durable-representation semantics must not be one mutually-exclusive taxonomy**. I accept F-1 and the core of F-2/F-4/F-5. I also agree that none of the evidence so far justifies reopening 3D or 3E: direct-call-first still survives because none of the compatibility gaps is repaired by adding ports/buses/transport ceremony.

I do **not** accept F.4 unchanged. Four corrections are required before I would recommend 3F-01 to the operator:

1. `persisted record` must not automatically become a durable contract;
2. `interpret-forever` is an unnecessarily absolute compatibility promise;
3. the five F-3 entries are useful examples but are at inconsistent abstraction levels and omit forward migration unless `rebuild/re-release` is stretched too far;
4. F-6's three failure families conflate invalid contract data, version incompatibility/staleness, and current capability/domain unavailability.

I also found one concrete omitted contract already named by authority: the **ETL/sync cursor contract** from C-006, combined with C-007 sync/pagination extensions.

---

## C.2 Response to F-1 — ACCEPT, with a tighter model boundary

I accept:

```text
interaction surface classification
!=
durable representation semantics
```

However I would not describe every frozen representation interpreted by newer code as an `INDEPENDENT surface`. That would recreate the same category error one level later.

A compiled `agent/v1` artifact pin is not a live interaction peer in the same sense as `browser ↔ Hub`. It is a **frozen representation facing a later interpreter**. Both create version gaps, but for different reasons.

Therefore the corrected vocabulary should be:

```text
LIVE INTERACTION SURFACE
  INTERNAL
  INDEPENDENT
  CONDITIONAL (routing state, not a third surface type)

DURABLE REPRESENTATION TRAIT
  attached only when the exact representation itself crosses a version/time boundary

COMPATIBILITY GAP
  may be caused by:
    a) independently-fixed live peers
    b) frozen durable representation + later interpreter
```

This preserves the insight without pretending that an artifact blob is a network/API surface.

No prior authority reopens.

---

## C.3 Response to F-2 — ACCEPT the missing inventory, REJECT two over-classifications

### C.3.1 Registry artifact kind family — accepted and important

Fable is right that the first matrix underweighted the platform's already-declared contract family:

```text
connector/v1
agent/v1
brain/v1
brain-binding/v1
job/v1
query/action inputSchema
outputSchema + DataMeta/discriminated envelope
ToolProjection / MCP projection where activated
```

These are not speculative REST contracts. They are real F1 content contracts already carried by C-005/C-007/C-010/C-011/C-012 and must be governed by 3F-01.

But I classify them as:

```text
DURABLE representation
+ frozen-representation compatibility gap
```

not automatically as an `INDEPENDENT live surface`.

The executor/Hub may evolve independently of the pinned artifact; that proves a compatibility obligation, not a live peer category.

### C.3.2 External infrastructure boundaries must be split at the adapter

Fable's row:

```text
CodingRuntime / CredentialBackend / BlobStore-CAS / GitInfra
= externally-owned contract; our side = INTERNAL port + pin + conformance
```

is directionally right but too compressed. There are **two boundaries**:

```text
Conexus module → our narrow port/adapter seam
  = INTERNAL architectural surface

our adapter → vendor/substrate API/SDK/protocol
  = externally-owned INDEPENDENT compatibility boundary
```

Pinning + conformance qualify the second boundary. Calling the whole thing merely `INTERNAL port` would hide the actual vendor compatibility failure class.

This does not require a generic provider framework. It simply recognizes the already-approved four concrete adapters.

### C.3.3 Persistence alone is NOT admission to the durable-contract trait

This is the main YAGNI correction to F-2/F-4.

Fable listed broadly:

```text
job_run
admission attempts
promotion steps
Handoff artifacts
findings
SCHEDULE triggers
plan/contract revisions
...
```

Some may indeed need durable contract semantics. But **3E durability is not sufficient proof**.

A Postgres row can survive an upgrade while still being an internal persistence representation if an ordered Hub migration transforms it before the new code interprets it. Treating every durable record as a compatibility contract would make 3F a shadow schema-governance layer over all 46 records.

Proposed durable-trait admission test: a representation gets the trait only if at least one is true:

```text
D1  writer and later reader/interpreter can have independently-fixed versions;
D2  exact bytes/semantic shape are hash/digest/signature/pin authority and therefore
    cannot be silently rewritten;
D3  the representation leaves its owner's migration boundary and an independent
    consumer depends on its declared shape.
```

Mere `stored in Postgres` is insufficient.

Examples:

```text
ApprovalRequest exact hash-pinned envelope     → YES (D1 + D2)
artifact kind/vN compiled payload              → YES (D1 + D2)
Handoff typed JSON consumed after handoff      → likely YES (D1/D3)
ordinary bld.finding relational row            → NOT automatically; prove D1-D3 first
ordinary promotion step storage                → NOT automatically; FSM durability != wire/schema contract
```

This is important because it preserves 3E ownership while preventing 3F from versioning internal persistence gratuitously.

### C.3.4 Additional omitted real contract: ETL/sync cursor

C-006 already says a **cursor contract is mandatory** for ETL, and C-007 reserves sync/pagination semantics in `connector/v1`.

That gives a concrete F1 representation that can survive across sync attempts and potentially connector/provider evolution:

```text
sync cursor / continuation state
```

It belongs in the inventory and is particularly useful because it tests both externally-owned semantics and durable continuation without inventing any new subsystem.

---

## C.4 Response to F-3 — REPLACE tactics with five gap-resolution modes

Fable correctly rejects open-ended `deprecation/negotiation/versioning` machinery in F1. I agree that negotiated multi-version windows are not justified today.

But this union is not quite right:

```text
interpret-forever
fail-closed refuse+refresh
drain-before-upgrade
rebuild/re-release
bounded disposability
```

Problems:

1. `interpret-forever` has an unbounded promise that authority does not require for every artifact, backup, approval or event;
2. `rebuild/re-release` is a tactic for some content, but F1 also has **forward migrations** of durable state;
3. the entries mix semantic policy (`interpret`) with operational technique (`drain`, `rebuild`).

I propose a closed F1 union at one abstraction level:

```text
PRESERVE
  keep backward interpretation/compatibility for the declared compatibility horizon

REJECT_STALE
  fail closed; require refresh / reapproval / re-auth / recompilation before continuing

QUIESCE
  eliminate the mixed-version window before upgrade by drain/stop/maintenance

TRANSFORM
  deterministically migrate / re-type / rebuild / re-release before the new interpreter proceeds

DISCARD
  state is explicitly non-authoritative/disposable and may be lost across the boundary
```

Concrete mappings already evidenced:

```text
artifact kind/vN                       → PRESERVE while still selectable/retained
browser runtime mismatch               → REJECT_STALE
maintenance-required migration         → QUIESCE
DB forward migration                   → TRANSFORM
scaffold migration kit / re-release    → TRANSFORM
F3B-R2 MissionPlan v2 re-typing        → TRANSFORM
coding cognition / sandbox substrate   → DISCARD where authority already says loss is tolerable
```

`negotiated multi-version support` would be only one possible **tactic under PRESERVE**. It remains NOT admitted in F1 without Decision Loop + named consumer.

### Compatibility horizon

Every `PRESERVE` durable contract must state a bounded semantic horizon such as:

```text
while referenced by an active/rollback-eligible Release
while an ApprovalRequest can still reach a terminal decision
for the supported backup/restore horizon
for the declared evidence retention horizon
```

That is stronger and safer than `interpret-forever` because the system cannot silently drop support while authority still depends on the representation, but we also do not promise eternal interpreters for dead/unreferenced history.

---

## C.5 Response to F-4 — ACCEPT the cause-agnostic version-gap test, but do not equate persistence with a gap

The useful question is indeed:

> Can the two sides of an interpretation have independently-fixed versions?

I retain it with one qualifier:

```text
persisted state does not automatically mean YES
```

If deployment performs a mandatory forward migration before the new code sees the state, the old representation and new interpreter never coexist semantically; the resolution mode is `TRANSFORM`, and the internal pre-migration schema does not need to become a public/versioned contract.

So the admission sequence becomes:

```text
1. identify the concrete interaction or representation;
2. ask whether independently-fixed versions can meet;
3. if yes, declare a gap-resolution mode;
4. if representation is durable, apply D1-D3 to decide whether its shape is a 3F durable contract;
5. only then decide internal vs independent live surface;
6. route unresolved topology as CONDITIONAL with frozen content obligations preserved.
```

No 3D reopening follows.

---

## C.6 Response to F-5 — ACCEPT the ref vocabulary; narrow the canonicalization claim

I agree completely that 3F must inherit, not flatten, the 3E distinction:

```text
opaque domain ID
content digest
owner-local generation/CAS
provider/runtime correlation ref
```

And generation/CAS must not be promoted into a cross-time compatibility contract merely because it is a token.

I also agree that digest canonicalization is a real contract problem. A change in canonical bytes can invalidate approval hashes, scaffold attestations, artifact pins and release comparisons.

Where I disagree is the word **global** if it means one universal serializer/hash profile for every digest domain.

C-005 has a global serialization rule for its envelope family, but Conexus has multiple semantic digest domains. 3F-01 should require that every authority-bearing digest contract defines enough to make recomputation deterministic:

```text
semantic domain / typed context
canonical bytes/encoding rules
hash algorithm/profile
version/evolution rule when the profile changes
```

Different domains MAY share one canonicalization profile. They must not be forced to share one universal profile merely for architectural symmetry.

Failure class prevented:

```text
same semantic object hashes differently after upgrade
OR
same bare digest is misinterpreted under the wrong semantic domain
```

This is a contract obligation, not a request to build a generic digest framework.

---

## C.7 Response to F-6 — REJECT the proposed three-way failure family as too coarse

The Fable family:

```text
domain
surface-compatibility
durable-interpretation
```

puts materially different failures together.

Examples from its own list:

```text
CLIENT_OUTDATED                = two otherwise-valid sides are stale/incompatible
MANIFEST_INVALID               = current representation violates its declared contract
OUTPUT_CONTRACT_VIOLATION      = produced value violates an output contract
CAPABILITY_UNAVAILABLE_HEALTH  = current capability/eligibility state is unavailable;
                                 not inherently a version compatibility problem
```

Those should not share one semantic family because recovery differs.

I propose that 3F-01 freeze only four **failure loci**, leaving concrete codes/envelopes to later 3F:

```text
1. DOMAIN_OR_AUTHORITY_REJECTION
   contract was understood; domain/authority/current eligibility says NO/unavailable

2. CONTRACT_INVALID
   representation fails the contract it claims to satisfy
   examples: MANIFEST_INVALID, OUTPUT_CONTRACT_VIOLATION

3. CONTRACT_STALE_OR_INCOMPATIBLE
   both sides may be individually valid, but their pinned/versioned expectations cannot meet
   example: CLIENT_OUTDATED

4. DURABLE_INTERPRETATION_FAILURE
   a retained representation that is required to remain interpretable/verifiable within
   its declared horizon cannot be read/verified safely
```

Properties of #4:

```text
fail closed
never silently coerce
never assume retry will repair it
route according to the declared gap-resolution mode
```

This is still small, but it keeps contract validation distinct from compatibility and from current domain availability.

I would **not** freeze a literal `DURABLE_INTERPRETATION_FAILURE` error code in 3F-01; only the semantic locus. Exact code inventory remains later 3F as the handoff requires.

---

## C.8 Revised minimal model I want Fable to attack

```text
A. LIVE INTERACTION SURFACE
   INTERNAL
     narrow typed same-system boundary; direct-call-first; no wire/version ceremony by default

   INDEPENDENT
     independently-fixed live peers can meet; explicit compatibility obligation

   CONDITIONAL
     routing state only; preserve already-frozen content obligations and name the later
     decision/owner that determines the live compatibility window

B. DURABLE-REPRESENTATION TRAIT
   admitted only by D1/D2/D3; persistence alone is insufficient
   inherits 3E identity/ref semantics without flattening them

C. VERSION-GAP RESOLUTION MODE — CLOSED F1 SET
   PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD
   negotiated multi-version support is not a sixth mode; it is a PRESERVE tactic and is
   not admitted in F1 without a named consumer + Decision Loop

D. COMPATIBILITY HORIZON
   required whenever PRESERVE is chosen; support lasts while the representation is still
   legitimately authoritative/consumable, not literally forever

E. FAILURE LOCUS
   DOMAIN_OR_AUTHORITY_REJECTION
   CONTRACT_INVALID
   CONTRACT_STALE_OR_INCOMPATIBLE
   DURABLE_INTERPRETATION_FAILURE
```

### Matrix corrections/additions

| Boundary / representation | Working classification |
|---|---|
| L7/module calls; ordinary module dependencies; Gateway internal API | INTERNAL; no durable trait unless a concrete carried representation passes D1-D3 |
| approval capability call | INTERNAL |
| ApprovalRequest exact envelope / claim identity | durable trait; gap mode must preserve exact hash semantics or fail closed into an explicit reapproval path; exact lifecycle policy → 3G |
| Control Plane browser ↔ Hub | INDEPENDENT; F1 likely REJECT_STALE, exact handshake remains later 3F |
| published app browser ↔ served release/platform | INDEPENDENT; use already-frozen pin/fail-closed mechanisms; do not add negotiated version windows |
| artifact kind/vN family + outputSchema/DataMeta + ToolProjection where active | durable trait; frozen-representation gap; typically PRESERVE for declared horizon |
| Project binding refs / exact ConnectionRevisionRef / release pins | durable trait where exact historical interpretation is required; preserve 3E semantics |
| CodingRuntime/CredentialBackend/BlobStore-CAS/GitInfra: module → our adapter | INTERNAL |
| our adapter → external substrate/vendor | INDEPENDENT, externally-owned contract; pin + conformance |
| Builder / Production Agent Runtime live transport | CONDITIONAL; retain already-approved bundle/ActorPack/content obligations |
| backup/restore manifest | durable trait; PRESERVE for supported restore horizon |
| agent_event / versioned OTel mapping | durable trait only to the extent historical interpretation is an explicit retained obligation; PRESERVE for evidence-retention horizon, not `forever` by slogan |
| ETL/sync cursor / continuation state | durable trait candidate; provider/connector compatibility obligation already evidenced by C-006/C-007 |
| F3B-R2 MissionPlan v2 | durable legacy representation; TRANSFORM one-time into current Change/Work Unit semantics |
| ordinary internal relational rows | NOT automatically contracts; migrations may TRANSFORM them inside owner boundary |
| export JSONL derived projection | no compatibility contract in F1 unless later explicitly promoted; users consuming an export does not silently create platform authority |

---

## C.9 Questions for Fable Round 2

Please falsify the revised model rather than merely reconcile wording.

1. Find a **current F1 version-gap case** that cannot be correctly handled by exactly one primary mode among `PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD`. If the set is incomplete, name the concrete consumer/failure class and propose the missing semantic mode.
2. Attack the `D1/D2/D3` admission rule. Does it wrongly exclude any representation that must be a 3F durable contract, or wrongly include internal persistence that should remain migration-private?
3. Test the distinction `persisted record != durable contract` against all F-4 examples, especially `promotion`, `finding`, `plan_revision`, `SCHEDULE`, `job_run`, approval and Handoff. Classify only what actually crosses an interpretation boundary.
4. Is `PRESERVE for declared compatibility horizon` sufficient for active Releases, audit/evidence and restore, or does any current authority truly require literal indefinite interpretation?
5. Attack the digest rule. Does authority require one **global** canonicalization profile, or only deterministic canonicalization per semantic digest domain? Identify a concrete cross-domain failure either way.
6. Attack the four failure loci. In particular, decide where `CAPABILITY_UNAVAILABLE_HEALTH`, `MANIFEST_INVALID`, `OUTPUT_CONTRACT_VIOLATION`, `CLIENT_OUTDATED`, `CAS_CONFLICT`, `OUTCOME_UNKNOWN` and an unreadable old artifact belong. If one locus conflates recovery semantics, say so.
7. Validate or reject the adapter split for the four infrastructure boundaries: `module→our port = INTERNAL`, `adapter→vendor = INDEPENDENT/external-owned`.
8. Evaluate the omitted `ETL/sync cursor` contract from C-006/C-007. Does it materially belong in 3F-01, and what gap mode is justified without inventing provider-specific machinery?
9. Re-run the Global Maximum challenge: does any correction above finally reveal a Material Finding against 3D/3E, or does direct-call-first still survive?
10. If the revised model is now sufficient, propose the **smallest operator-facing 3F-01 decision text**. Do not mutate authority or LEDGER; keep it in this dialogue for the operator to approve/reject.

---

# Round 2 — Fable

**Status of this round:** adversarial counter-review / NON-AUTHORITATIVE.
**Method:** every attack below was run against C-005..C-017, 3A-R5, 3C-12, 3D-R1, 3E-02/3E-R1. No claim depends on current Mastra behavior beyond frozen 3A-R5 authority; Context7 verification not triggered (protocol rule 8).

## R2.1 Verdict

I tried to break C.8 on all ten questions. It survives. I found **no missing gap-resolution mode**, **no wrongly-shaped admission rule**, and — answering Q9 first because it gates everything — **no Material Finding against 3D or 3E**. What I did find are five sharpenings, each with a concrete failure class that the current wording would let through:

```text
S-1  D1 must state its transform-exclusion explicitly, or it swallows all 46 records
S-2  D2 must cover derived-comparison values (idempotency keys, fingerprints), or a
     silent derivation change can duplicate an external ERP effect
S-3  PRESERVE must declare end-of-horizon behavior, or horizon expiry is undefined
S-4  locus 3 must be generalized to stale EXPECTATION (code, content, or state
     generation), or CAS_CONFLICT has no honest home
S-5  OUTCOME_UNKNOWN must be explicitly OUTSIDE the four loci, or someone will
     eventually classify it and inherit the wrong recovery semantics
```

With S-1..S-5 applied, I consider the model convergent and propose the operator-facing 3F-01 decision text in R2.11.

---

## R2.2 Q1 — attack on the five-mode union

I stress-tested the union against every version-gap case I could extract from authority:

```text
rollback to previous Release (C-014)        → REJECT_STALE
  ROLLBACK_UNAVAILABLE_SCHEMA_INCOMPATIBLE is exactly a fail-closed stale check
  applied to a composed release+schema expectation; forward-only production means
  TRANSFORM-backwards does not exist, and the model correctly refuses instead
backup restore (C-006/C-015)                → composes two gaps, one mode each:
  manifest read at restore time             → PRESERVE (restore horizon)
  restored DB state vs current code         → TRANSFORM (migration lineage replays)
Brain pack pinned vs newly published (C-011)→ PRESERVE (pin) + human-gated TRANSFORM
  (revalidation at promotion); UPDATE_AVAILABLE is informative, never silent
model alias drift (C-010)                   → REJECT_STALE (drift invalidates, re-eval)
connector vs live vendor API drift (C-007)  → REJECT_STALE (qualification fails closed;
  new ConnectionRevision is the TRANSFORM path, human-gated)
in-flight AgentRun across upgrade (F3D02-R1)→ QUIESCE or DISCARD-to-INTERRUPTED
  (C-013); the mode CHOICE is a 3G policy, but the union suffices
agent_event history vs new reducer (C-013)  → PRESERVE via versioned reducer
```

No sixth mode was needed anywhere. Two sharpenings fell out:

1. **Granularity rule:** a mode attaches to one *representation-gap*, not to a scenario. Restore is the proof: one scenario, two representations, two modes. Without this rule, someone will demand "the mode for restore" and the model will look broken when it is not.
2. **S-3 — end-of-horizon behavior:** PRESERVE with a horizon is incomplete until the classification names what happens when the horizon ends and something still references the representation. The honest default is: reference to an out-of-horizon representation resolves as locus 3 (stale expectation), never as locus 4. Undeclared, this becomes a silent-failure seam.

The union survives Q1.

## R2.3 Q2 — attack on D1/D2/D3

**Wrong inclusion risk (confirmed, fixable):** D1 as literally worded — "writer and later reader can have independently-fixed versions" — is true of *every* persisted row, because an old writer and new reader always exist across any upgrade. C.5 already contains the repair ("mandatory forward migration before the new code sees the state means the versions never semantically meet") but it lives in prose, not in the rule. **S-1:** fold it into D1's text: *"...can have independently-fixed versions **without a mandatory intervening transform**"*. Otherwise D1 alone re-creates the shadow schema-governance layer C.3.3 correctly rejects.

**Wrong exclusion risk (confirmed, material):** D2 as worded covers hash/digest/signature/pin authority over *stored bytes*. It misses **derived-comparison values** — values deterministically computed at time T1 and compared against freshly computed values at time T2:

```text
idempotency key derivation (C-010, gw.idempotency_claim)
  failure class: derivation function changes across an upgrade; a retried effect
  computes a different key; the claim lookup misses; the SAME external effect
  executes twice against the ERP. This is the single worst silent failure the
  contract layer could permit, and the current D2 wording does not catch it,
  because the key is neither a pin nor a signature — it is a comparison protocol.

Finding fingerprint (C-017)
  authority already versions it ("fingerprint canônico versionado") — which
  confirms the category exists and that C.3.3's example row was half right:
  the bld.finding ROW is migration-private, but its FINGERPRINT DERIVATION is
  a durable contract component. The trait attaches to components, not tables.

credential envelope crypto profile (C-007: AES-GCM pinned, key_version)
  same family: interpretation of old ciphertext requires the versioned profile.
```

**S-2:** extend D2 to *"hash/digest/signature/pin authority, or any value whose correctness depends on deterministic recomputation being comparable across versions"*. With S-1 + S-2, I could not construct a representation that D1–D3 wrongly excludes or includes.

## R2.4 Q3 — classification of the F-4 list under `persisted record != durable contract`

| Representation | Verdict | Reasoning |
|---|---|---|
| ApprovalRequest envelope + claim identity | **durable contract** (D1+D2) | hash-pinned; PRESERVE while a terminal decision is reachable; semantic policy change already forces re-checkpoint (C-017) = declared REJECT_STALE transition |
| idempotency claim / key derivation | **durable contract** (D2 per S-2) | see R2.3; mode PRESERVE — derivation is versioned and claims never silently orphaned |
| job_run queued payloads | migration-private | QUIESCE at upgrade is already authority (C-006 drain includes queued/deferred/retry); D1 fails under S-1 |
| promotion step records | migration-private | FSM durability ≠ shape contract; in-flight promotion across upgrade is a 3G policy (QUIESCE or idempotent restart per C-014) |
| finding row | migration-private | but fingerprint derivation = durable contract component (R2.3) |
| plan_revision / contract_revision | **durable contract** (D2) | digest-pinned by C-017 (contractRevisionDigest, visual plan pinned); PRESERVE for Change + evidence horizon |
| SCHEDULE trigger definitions | migration-private | owner (par) may TRANSFORM in migration; fires against release-pinned agent revisions, so no frozen-shape dependency survives outside the owner |
| Handoff JSON artifacts | migration-private by default; **durable contract where pinned into acceptance evidence digests** (C-017) | trait-per-component again |
| admission attempts / budget counters | migration-private | value durability (restart never resets effect limits, C-016) is an invariant, not a shape contract |

The distinction holds against all nine. It required the component-granularity rule to hold — which is now load-bearing and belongs in the decision text.

## R2.5 Q4 — does anything require literal `interpret-forever`?

No. I looked for the strongest candidates:

```text
fiscal: C-015 keeps Sankhya as the AUTHORITATIVE fiscal archive; Conexus is a
  NON_AUTHORITATIVE cache with a reserved retention class — a long, declared
  horizon, not an interpretation-forever promise
audit/evidence: C-013 excludes domain ledgers from GC and sets declared retention;
  horizon = declared evidence/audit retention, mechanically checkable where it
  gates GC
backups: horizon = supported restore window (daily dumps + monthly restore-test)
```

One real sharpening: split **bytes-verifiability** from **semantic interpretability**. Verifying an old content_digest requires only the retained bytes plus the algorithm/profile identifier — nearly free, and may extend far beyond the horizon in which the platform promises to *semantically execute* the representation (C-015 says it precisely: CAS proves byte integrity, not fiscal authenticity). PRESERVE horizons should be declared against semantic interpretation; digest verifiability may quietly outlive them at no cost. `PRESERVE for declared horizon` survives Q4 with that split.

## R2.6 Q5 — global vs per-domain canonicalization

The **global profile is falsified outright**, not merely inadvisable: release identity uses git SHAs (C-005 dual SHA + digest), and the git object-id format is owned by git, not by Conexus. Provider continuation tokens and runtime correlation refs are similarly external. A universal Conexus canonicalization profile is therefore *impossible*, and C.6's per-domain rule is the only workable shape.

The cross-domain confusion failure class (bare digest interpreted under the wrong domain) is real but already structurally mitigated: 3E stores digests only in typed columns/contexts, never as FKs. The remaining obligation for 3F is exactly C.6's four-line requirement (typed context, canonical bytes, algorithm, evolution rule) plus one addition: **externally-owned digest domains must be marked as such** — their profile is not ours to version, only to identify. No multihash envelope, no digest framework. C.6 stands corrected only by that addition.

## R2.7 Q6 — failure loci under fire

```text
CAPABILITY_UNAVAILABLE_HEALTH → locus 1. current-state eligibility, contract understood.
MANIFEST_INVALID              → locus 2.
OUTPUT_CONTRACT_VIOLATION     → locus 2.
CLIENT_OUTDATED               → locus 3.
CAS_CONFLICT                  → locus 3, but ONLY under S-4.
OUTCOME_UNKNOWN               → NONE. See below.
unreadable old artifact       → locus 4 if within its declared horizon (a platform
                                defect worth an alarm); locus 3 if the reference
                                itself is out-of-horizon (an expected refusal).
                                The in/out-horizon split is operationally load-
                                bearing: locus 4 pages someone; locus 3 does not.
```

**S-4:** as written, locus 3 ("pinned/versioned expectations cannot meet") covers code/content staleness but has no honest home for `CAS_CONFLICT` (expectedGeneration, C-014): a generation is owner-local concurrency state, which F-5/C.6 rightly keep out of contract treatment. Yet its *recovery shape* — refresh expectation, re-evaluate, re-attempt — is identical to CLIENT_OUTDATED. Generalize locus 3 to **STALE_EXPECTATION**: "a pinned or assumed expectation (code version, content pin, or state generation) no longer matches the current counterpart." Recovery is uniform; nothing else changes.

**S-5:** `OUTCOME_UNKNOWN` must be declared **outside** the loci, explicitly. It is not a rejection, not invalidity, not staleness, not an interpretation failure — it is an indeterminate external-effect outcome with its own frozen semantics (C-013: never auto-retry; settlement by reconciliation; C-016 traffic_state). If 3F stays silent, someone will eventually file it under locus 1 or 3 and inherit retry semantics that C-013 exists to prohibit. One sentence in 3F-01 prevents that.

With S-4/S-5 the four loci survive; I found no fifth locus with a real F1 consumer.

## R2.8 Q7 — adapter split

**Validated.** `module → our port = INTERNAL` and `our adapter → vendor = INDEPENDENT, externally-owned` is correct for all four boundaries, and 3A-R5/C-008 already practice it (pin + conformance + qualification probes). One annotation so the split cannot be over-read: the *modes* available on the vendor side are only `REJECT_STALE` (qualification/conformance fails closed) and `TRANSFORM` (pin bump through qualification, human-gated). `PRESERVE` is never ours to promise on an externally-owned surface — we hold no authority over the vendor's evolution, only over when we move our pin. That annotation kills any future temptation to build vendor-compatibility machinery.

## R2.9 Q8 — ETL/sync cursor

**Belongs, and it is a good test specimen — but as a component, not a new row family.** Decomposed:

```text
cursor SEMANTIC contract (which field, ordering guarantee, overlap window)
  → part of connector/v1 sync extensions (C-007) — already inside the artifact
    kind family row; durable trait via that family

our cursor/watermark record
  → owner-internal, migration-private (TRANSFORM)

provider-issued continuation token
  → 3E provider/runtime correlation ref class: opaque, validity owned by the
    provider; mode = DISCARD-tolerant by construction — C-006's overlap +
    staging + upsert design makes cursor loss survivable by resync, so token
    invalidation is REJECT_STALE followed by a designed recovery, not a
    durable-interpretation failure
```

No provider-specific machinery, no new subsystem. The cursor also independently confirms S-1: it is durable state that is *deliberately not* a durable contract, because the architecture already paid for its disposability.

## R2.10 Q9 — Global Maximum re-run, declared explicitly

**No Material Finding against 3D or 3E.** Checked candidate by candidate: the idempotency-key derivation contract adds an obligation on top of `gw.idempotency_claim` without touching its ownership or schema; fingerprint versioning is already C-017 authority; externally-owned digest domains fit 3E's ref classes unchanged; the adapter split is 3D's own four boundaries read at the correct resolution; `CAS_CONFLICT` reclassification is failure-locus vocabulary, not a data-architecture change. Direct-call-first survives its third adversarial pass for the same reason as before: **not one identified version gap would be closed by a port, bus, DTO layer, or transport contract.** The gaps are closed by pins, modes, horizons and derivation versioning — all orthogonal to call mechanics. I decline, for the second time and with a wider net, to reopen 3D/3E.

## R2.11 Q10 — proposed 3F-01 decision text (smallest operator-facing form)

Everything below is the draft the operator can approve, reject, or amend. It is intentionally self-contained.

---

> ### 3F-01 — Contract Surface Classification & Versioning Boundary (DRAFT)
>
> **Decision in one sentence:** Conexus F1 classifies every contract-bearing boundary as a live interaction surface (`INTERNAL | INDEPENDENT`, with `CONDITIONAL` as a routing state), attaches a durable-representation trait only by explicit admission, resolves every version gap by exactly one of five closed modes, requires per-domain deterministic digest canonicalization, and freezes four failure loci — creating no universal contract framework, no route/DTO inventory, and no versioning machinery beyond what C-005..C-017 already carry.
>
> **1. Live interaction surfaces.** `INTERNAL`: narrow typed same-system boundary; 3D direct-call-first intact; no wire DTO, `/v1`, or compatibility ceremony. `INDEPENDENT`: independently-fixed live peers can meet; explicit compatibility obligation; F1 default is fail-closed. `CONDITIONAL`: a routing state, never a third contract type; each CONDITIONAL row records its already-frozen content obligations and the later phase that owns the open window question.
>
> **2. Durable-representation trait.** Admitted only by: **D1** — writer and later reader can hold independently-fixed versions *without a mandatory intervening transform*; **D2** — exact bytes/shape are hash/digest/signature/pin authority, *or the value's correctness depends on deterministic recomputation comparable across versions* (digests, fingerprints, idempotency keys, crypto envelope profiles); **D3** — the representation leaves its owner's migration boundary and an independent consumer depends on its declared shape. Persistence alone is insufficient. The trait attaches to representations and components, never to whole tables by default. Ref vocabulary is inherited from 3E-02 unflattened; generation/CAS receives no contract treatment.
>
> **3. Version-gap resolution modes — closed F1 union.** `PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD`. One primary mode per representation-gap; a scenario may compose several gaps. `PRESERVE` requires a declared semantic horizon *and* declared end-of-horizon behavior (default: out-of-horizon references resolve as STALE_EXPECTATION). Bytes-verifiability (digest + algorithm id) may outlive the semantic horizon at no cost. Negotiated multi-version support is a PRESERVE tactic and is **not admitted in F1**; it returns only via Decision Loop with a named consumer. Externally-owned surfaces may only use `REJECT_STALE` and `TRANSFORM` (pin bump via qualification); `PRESERVE` is never promised on a surface Conexus does not own.
>
> **4. Digest/canonicalization contracts.** Every authority-bearing digest domain declares: typed context, canonical byte rules, algorithm/profile, and profile-evolution rule. Domains may share a profile; no universal profile exists or is possible (git object ids and provider tokens are externally owned and are only identified, never versioned by Conexus).
>
> **5. Failure loci** (semantic loci now; concrete codes/envelopes remain later 3F work): **L1** `DOMAIN_OR_AUTHORITY_REJECTION` (incl. CAPABILITY_UNAVAILABLE_HEALTH); **L2** `CONTRACT_INVALID` (incl. MANIFEST_INVALID, OUTPUT_CONTRACT_VIOLATION); **L3** `STALE_EXPECTATION` — a pinned or assumed expectation (code version, content pin, or state generation) no longer matches its current counterpart (incl. CLIENT_OUTDATED, CAS_CONFLICT, rollback ineligibility, out-of-horizon references); **L4** `DURABLE_INTERPRETATION_FAILURE` — an in-horizon retained representation cannot be read/verified safely; fail closed, never coerce, never auto-retry, alarm-worthy. `OUTCOME_UNKNOWN`/`traffic_state` are effect-ledger semantics under C-013/C-016 and are explicitly **outside** these loci.
>
> **6. Classified baseline matrix.** The Round 2 matrix (C.8 as corrected by Fable R2.2–R2.9) is the binding starting inventory: L7/module calls and Gateway internal API = INTERNAL; approval capability call = INTERNAL with the ApprovalRequest envelope + claim identity + idempotency-key derivation as durable contracts; Control Plane browser ↔ Hub and published app ↔ served release = INDEPENDENT with fail-closed staleness; artifact kind/vN family (incl. outputSchema/DataMeta, ToolProjection, connector sync/cursor semantics) = durable trait, PRESERVE for declared horizons; binding refs/exact revision pins/release pins/plan+contract revisions = durable trait per 3E semantics; four infra boundaries split at the adapter (port INTERNAL / vendor INDEPENDENT externally-owned); Builder and Production Agent Runtime live transport = CONDITIONAL with frozen content obligations preserved (bundle/quarantine, Actor Pack, structured SHARE, run correlation); agent_event + OTel mapping = durable trait for evidence-retention horizon; backup/restore manifests = durable trait for restore horizon; finding fingerprint derivation and credential crypto envelope profile = durable contract components; MissionPlan v2 = one-time TRANSFORM (closes F3B-R2 routing); job_run payloads, promotion steps, SCHEDULE triggers, admission attempts, ordinary rows = migration-private; export JSONL and derived projections = not contracts.
>
> **7. Non-goals F1.** No HTTP route inventory, field-level DTOs, OpenAPI/JSON-Schema/gRPC/GraphQL technology selection, SDK generation, negotiated version windows, digest framework, universal serializer, contract registry service, or shadow schema governance of the 46 durable record classes.
>
> **8. Routed onward.** Exact error codes/envelopes, approval capability signature, DEDICATED exchange shape → later 3F; FSM/staleness/eligibility lifecycles → 3G; runtime transport windows → 3H/3J; trust semantics → 3I; qualification → 3L.

---

**Convergence note to the operator:** ChatGPT and Fable now agree on the model's shape after two adversarial rounds each way; per protocol rule 6 this agreement is *not* approval. The five sharpenings S-1..S-5 are incorporated in the draft above. If ChatGPT accepts them in a short Round 3 confirmation, the draft is ready for operator arbitration as the first 3F decision.

No LEDGER or authority file was modified in this round.
