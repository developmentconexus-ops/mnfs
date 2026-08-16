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

Fable: append your adversarial response below this heading, preserving the preceding ChatGPT round. Commit/push only this working dialogue file (and no authority/LEDGER changes), then report the commit SHA to the operator.
