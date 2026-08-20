# 3M — Independent Fable Review Channel

> **TEMPORARY / NON-AUTHORITATIVE / REVIEW EVIDENCE ONLY**
>
> This file is the only permitted delta on `review/3m-fable` relative to the frozen 3M candidate. It must never enter the merge candidate or `main`.

## Lead handoff — Round 1

```text
Repository:       developmentconexus-ops/conexus-os
Candidate branch: phase/3m-failure-recovery
Candidate HEAD:   c5b2a4c2456f8436d5f349ad8d7b2fce33112a47
Review branch:    review/3m-fable
Draft PR:         #43
Candidate:        docs/work/current/proposal.md
Phase:            3M — Failure & Recovery Architecture
Current roadmap:  3M NEXT / NOT STARTED
C-018:            NOT RATIFIED
Implementation:   BLOCKED
```

### Review protocol

1. Reconstruct current repository authority first from `AGENTS.md → docs/index.md → docs/roadmap.md → task-specific owners`; do not treat this handoff or the proposal as authority.
2. Apply DevelopmentConexus Engineering Method v1.0.0 and the current Repository Standard v1.0.0.
3. Load the repository Mastra skill for Mastra-sensitive claims. Current/latest framework docs/Context7 are supporting Evidence only; exact pinned source/accepted 3L Evidence decides version-specific qualification claims.
4. Review the 3M candidate as **one coherent package**. Do not split it into artificial micro-reviews.
5. Attack the proposal adversarially: root cause, authority, partial failure, concurrency, restart/restore, YAGNI, overengineering, underengineering, foreseeable retrofit, framework overfit and credible alternatives. Search for a better Global Maximum.
6. Reviewer findings are Evidence, never requirement authority. A proposal for a new Product requirement/owner/trust boundary must be identified as such and returned to the Decision Loop, not smuggled in as a correction.
7. **Do not edit any file except this `docs/work/current/ai-dialog.md` on `review/3m-fable`.** Do not update the candidate branch, PR metadata, roadmap, durable authority, dependencies, qualification Evidence or implementation.
8. Append the independent review below under `## Fable — Round 1`. Commit and push only this file to `review/3m-fable` so the Lead can adjudicate through Git.
9. Round 2 is justified only if a real material contradiction survives Lead adjudication/correction. If needed, a new isolated review branch will be created from the corrected candidate HEAD.

### Mandatory attack questions

At minimum, try to falsify:

```text
A. Is owner-local recovery actually the Global Maximum, or is a smaller/better structure available?
B. Does any use of "reconcile" hide missing durable truth or impossible knowledge?
C. Can disaster recovery itself crash safely without adding a semantic Recovery owner?
D. Does RPO <= 6h resurrect stale grants, sessions, triggers, approvals, credentials or other unsafe authority?
E. Is the proposed conservative re-establishment/recertification of material authority sufficient and proportional?
F. Are post-cutoff canonical Project/Brain Git facts preserved with the correct authoring-vs-operational ownership?
G. Is the lost-RPO external-effect treatment honest, implementable and sufficient under the accepted first-installation RPO?
H. Can the same governed business effect be retried at more than one semantic layer despite the proposal?
I. Does the candidate underuse an already-qualified native Mastra primitive or overfit to newer/unqualified Mastra behavior?
J. Does any proposed law secretly require a new durable class, schema, database, cross-owner transaction or service?
K. What can be deleted from the candidate without losing a real invariant? Identify YAGNI/ceremony explicitly.
L. Is any HA/PITR/DurableAgent/Temporal-like capability being pulled forward unnecessarily—or rejected even though a current F1 consumer actually requires it?
M. Are proof obligations routed to the earliest stage that can genuinely falsify them instead of proving mocks?
N. Can RPO <= 6h / RTO <= 8h remain operationally achievable under the proposed recovery/re-certification posture?
O. Do timeout/cancel/quiescence/settlement semantics preserve Builder, PAR, MAR, Gateway and Release owner asymmetry rather than forcing a hidden generic lifecycle?
P. Does recovery activation or its sticky latch create an undeclared second authority over current Product state?
```

### Expected Fable output

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
Mastra/framework-native conclusion
Recovery/RPO-RTO conclusion
```

For each material finding, state:

```text
Finding ID
challenged claim
current authority/evidence that decides it
failure class / concrete counterexample
why material
smallest correction or STOP/SPLIT prerequisite
whether it changes Product authority or only realization/projection
reopen trigger if accepted
```

Do not approve by agreement. If the candidate is sound, explain what strongest counterexamples were attempted and why they failed.

---

## Fable — Round 1

### 0. Authority reconstruction actually performed

Authority was rebuilt from the repository before reading the candidate, in this order, and the handoff block above was treated as routing only:

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ docs/decisions/index.md
→ docs/architecture/index.md
→ docs/product/contract.md
→ docs/reference/release-deployment-and-operations.md   (S12–S17, S30, S35, S36)
→ docs/reference/security-and-authority.md              (S31–S34)
→ docs/reference/data-and-persistence.md                (S5, S6, S11, S14)
→ docs/reference/integrations-and-gateway.md            (S18, S19, S37)
→ docs/reference/runtime-and-agents.md                  (S24–S26, S29, S45)
→ docs/reference/builder-and-harness.md                 (S7–S10)
→ docs/reference/managed-execution.md                   (S27, S28)
→ docs/reference/managed-execution-qualification.md     (3L-R2 Package D/E)
→ docs/reference/mastra/ (mapping, framework findings, requalification triggers)
→ docs/phases/3l-technology-qualification.md
→ .agents/skills/mastra/SKILL.md
→ scripts/check-*.mjs (the operating envelope actually enforced)
```

Independently verified Git facts, not inherited from the handoff:

```text
origin/phase/3m-failure-recovery = c5b2a4c2456f8436d5f349ad8d7b2fce33112a47
origin/review/3m-fable           = 8ca5e9f2467100ec0db7370d5d5e4fa9628fcb6f
diff candidate...review          = docs/work/current/ai-dialog.md only
roadmap 3M                       = NEXT / NOT STARTED
C-018                            = NOT RATIFIED
Product implementation           = BLOCKED
```

Deciding-authority note used throughout: current framework documentation is supporting mechanics only; version-specific claims are decided by the pinned 3L identities (`@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, `pg-boss 12.26.3`, PostgreSQL 17.10) plus accepted 3L Evidence. No framework package is installed in this repository, so embedded-doc verification of newer framework behavior was not possible here; that limitation is recorded as N-01 rather than hidden.

### 1. Required output

```text
Overall verdict                        = STRUCTURE CONFIRMED / CLOSURE BLOCKED
                                         8 material corrections; no architecture reopen
Material Findings count                = 8
Non-material Findings count            = 8
Architecture/Product reopen required?  = NO for owners, modules, durable classes, schemas and the
                                         dependency graph.
                                         YES for exactly one accepted clause: the required recovery
                                         set and first-installation operations contract in
                                         docs/reference/release-deployment-and-operations.md S36
                                         (credential key-generation recoverability, M-05), together
                                         with identification of the candidate's own new operational
                                         obligations (M-07). Smallest scope = that one section plus
                                         the 3M exit statement. Nothing else reopens.
3L requalification required?           = NO.
                                         Conditional trigger only: if the M-02 correction is
                                         realized by changing the composition of the Package-D
                                         tested admission transaction (owner record plus queue
                                         projection in one transaction) instead of as a
                                         Gateway-side pre-admission fence, the existing
                                         "altering owner admission" trigger fires. Realized
                                         Gateway-side, no qualified mechanic changes.
New Product requirement proposed?      = 0 proposed by this review.
                                         2 items identified for return to the Decision Loop:
                                         (a) the candidate's undeclared first-installation
                                             operational obligations (M-07);
                                         (b) the S36 recovery-set amendment for credential key
                                             generations (M-05).
Global Maximum conclusion              = Alternative D (owner-local recovery plus narrow
                                         operational coordination) is confirmed as the Global
                                         Maximum. A, B and C were each steel-manned and each fails.
                                         No smaller STRUCTURE exists. A materially smaller TEXT
                                         does exist (M-08, N-02).
YAGNI/deletion conclusion              = No dormant machinery is introduced; the S10 deletion list
                                         is correct and survived attack. Deletable without losing a
                                         real invariant: the S8.2 unpinned framework paragraph, the
                                         duplicated Release/migration prose in S5.5, and the pure
                                         restatements R-02/R-03 (project by reference, not by copy).
Mastra/framework-native conclusion     = No underuse of an already-qualified primitive and no
                                         overfit to newer unqualified behavior. The DurableAgent
                                         rejection is not merely preserved, it is strengthened by
                                         M-02: snapshot re-drive would re-cross the Gateway boundary
                                         with attempt-derived effect identity, which is precisely
                                         the unclosed failure class.
Recovery/RPO-RTO conclusion            = RPO <= 6h stands and is honestly bounded.
                                         RTO <= 8h is achievable for the platform and for the
                                         current read-only first vertical. It is NOT bounded for
                                         effect-capable surfaces while M-03 and M-05 remain open:
                                         M-03 makes the fenced set uncomputable and M-05 admits a
                                         permanently undecryptable credential state.
```

### 2. Why this is not an approval by agreement

The candidate is structurally right, and Section 7 below records the strongest counterexamples that failed against it. The eight material findings are not disagreements with its structure. Each one is a concrete path by which the candidate's own stated invariant is violated while every R-0x law is formally satisfied. Six of the eight close with one clause each and change no Product authority.

### 3. Material findings

#### M-01 — the recovery fence is a positive marker of abnormality, so it fails open

```text
challenged claim
  R-17 and S7.4: a disaster restore "must establish a recovery posture that survives another
  Hub/process crash"; closure test 7: "recovery itself can crash without silently activating
  restored PROD".

current authority that decides it
  R-03 plus the accepted structural law "unknown/missing/partial != zero/success"
  (docs/architecture/index.md S2; docs/product/contract.md invariant 27).
  S36 keeps "manual restore acceptable initially", which makes fence establishment a human
  procedure step.

failure class / concrete counterexample
  Fail-open default under a missing precondition.
  T0 = protected cutoff. Disaster. The operator restores the off-host cluster generation and starts
  the Hub service. The fence-planting step is skipped, mistyped, or written where the service does
  not read it. Nothing crashes, so R-17 never engages. The Hub boots as ordinary PROD: ingress
  opens, restored-generation sessions are honoured, MAR reconciliation finds the sync stale and
  admits a catch-up JobRun, PAR triggers re-arm. Every S7.5 protection is skipped because the only
  thing that would have engaged them is a marker that was never planted.
  The candidate defends the fence against being lost. It does not defend against the fence never
  existing.

why material
  This single path bypasses the whole S7 posture, including R-15, R-18 and effectful quiescence,
  and it does so on exactly the restore posture the accepted operations contract admits (manual).
  It converts the candidate's strongest safety property into a procedure-dependent one.

smallest correction
  Invert the default in R-17. Normal PROD activation requires POSITIVE evidence of unbroken
  generation continuity; a missing, unreadable or unknown recovery marker is UNKNOWN and therefore
  fenced, never proof of a normal restart. No new durable class is needed: positive continuity
  evidence can come from existing owner facts or from substrate/host state compared across the
  boundary, and the mechanism stays Realization Planning. Add the negative case to S9.4 —
  "restore and start the service WITHOUT planting the marker; the installation must refuse normal
  PROD".

authority impact
  Realization/projection only. It strengthens an invariant the candidate already owns and creates
  no owner, class, schema or service.

reopen trigger if accepted
  If no continuity-evidence source can be established without a new durable record class or a new
  owner, return to the smallest Decision Loop instead of weakening the default.
```

#### M-02 — the entire retry/replay chain rests on an undefined "same semantic effect identity"

```text
challenged claim
  R-05 "Safe re-drive is admitted only through the same semantic effect identity";
  R-06 "one semantic retry layer for governed effects";
  closure test 5 "runtime retry cannot bypass Gateway effect authority".

current authority that decides it
  docs/reference/integrations-and-gateway.md S19.1 (Gateway owns effect identity, idempotency and
  replay safety) and S19.4; docs/architecture/index.md S2 ("OUTCOME_UNKNOWN never grants blind
  automatic replay"; "same bytes/digest != same semantic identity/authorization");
  docs/product/contract.md invariant 17 (approval binds one exact sealed subject);
  docs/reference/data-and-persistence.md S5.3 (gw holds effect, current counters and receipts).
  Nothing in current authority constrains HOW that identity is derived. The candidate makes the
  derivation load-bearing without freezing it.

failure class / concrete counterexample
  Two opposite derivations are both currently admissible and both break the candidate.

  (a) attempt/run-derived identity -> duplicate effect through FRESH ADMISSION, not replay.
      A PAR AgentRun crosses the Gateway boundary for sealed subject S; the response is lost, so
      Gateway holds OUTCOME_UNKNOWN for S. Per S5.2 a fresh attempt "normally requires a new
      current AgentRun admission", which the candidate permits. The new run proposes S again, the
      approver approves S (nothing shows them an unresolved attempt), Gateway derives a NEW effect
      identity because this is a new run/attempt, and executes. The provider applies S twice.
      R-05 is not violated: nothing was replayed. R-04 is not violated: no runtime retried.
      The duplicate arrives through the admission door, which no invariant fences.

  (b) allocated/sequence-derived identity -> post-restore reissue collision that FABRICATES success.
      At T1 (post-cutoff) Gateway issues idempotency key K for "pay invoice A"; the provider applies
      it and stores the response under K. Restore to T0 rolls the gw counters back. A later,
      unrelated effect "pay invoice B" is allocated the same K. Gateway sends B under K, the
      provider returns the STORED response for A, Gateway records success for B. Invoice B is
      unpaid and recorded as paid. This runs on the path R-05 itself calls safe
      ("provider-supported idempotency preserving the same semantic effect identity").

why material
  (a) defeats closure tests 3 and 5 and mandatory question H. (b) defeats closure test 8 and
  produces the exact outcome the target invariant forbids by name: fabricated success. Both are
  reachable in F1 as designed and both are invisible to every R-0x law as written.

smallest correction
  3M states the derivation law, not the mechanism:
    1. semantic effect identity derives from the sealed effect SUBJECT plus owner-stable facts; it
       is attempt-independent, run-independent and restore-stable, and is never allocated from a
       counter/sequence space that a recovery generation can roll back;
    2. unresolved Gateway effect truth for a subject fences NEW ADMISSION for that same subject,
       not only replay of the old attempt.
  Both belong inside Gateway, which already owns effect identity and admission. Keeping the fence
  Gateway-side is what makes this correction free: it requires no PAR->Gateway call, so the acyclic
  module graph and the single declared dependency inversion (docs/architecture/index.md S4.1) stay
  untouched. For MAR the direction is already admitted through the MANAGED_JOB caller surface.

authority impact
  Realization/projection, provided the fence stays Gateway-side. It becomes a structural question
  only if implemented as a new caller-side cross-owner check.

reopen trigger if accepted
  A real provider whose idempotency contract cannot accept a subject-derived, restore-stable key
  returns to the Gateway Decision Loop; the candidate's existing trigger "real provider cannot fit
  Gateway idempotency/reconciliation model" already covers it.
```

#### M-03 — "the affected capability remains fail-closed" is uncomputable under the candidate's own premise

```text
challenged claim
  S5.4: "recovered Conexus may have no local record from which to discover it ... The affected
  capability remains fail-closed"; S7.6: "A lost-window effect with insufficient provider
  reconciliation keeps only the affected capability fail-closed"; closure test 8.

current authority that decides it
  R-03 and R-15 (the candidate's own laws); docs/architecture/index.md S2; S36 accepted RPO <= 6h.

failure class / concrete counterexample
  Self-contradiction producing a silent fail-open.
  T0 cutoff. At T1 a governed write executes through capability CAP-Q; its EffectAttempt exists
  only inside the lost interval. Restore. The Hub enumerates unresolved effects and finds NONE for
  CAP-Q, because the record it would need is exactly what was lost. "The affected capability"
  evaluates to the empty set, CAP-Q re-enables as normal, and the next run repeats the effect.
  The premise of the paragraph (undiscoverable) refutes the remedy of the same paragraph
  (fence the affected one).

why material
  The candidate claims closure test 8 while its remedy is inoperative for the exact class it was
  written for. Under R-03 an unknown affected-set must be treated as the whole class, never as
  empty.

smallest correction
  One sentence: after a disaster restore every effect-capable capability that could have been
  exercised in the lost interval is UNKNOWN and stays fail-closed until either provider-side
  reconciliation covers the interval or the operator explicitly accepts the residual under recovery
  authority. Proportionality holds because the current first vertical is read-only, so the F1 set is
  small; add a named trigger for the first write-capable consumer.

authority impact
  Realization/projection. It narrows behavior, grants nothing and creates nothing.

reopen trigger if accepted
  First admitted write-capable Gateway consumer, or any provider without interval-level
  reconciliation, returns to the Gateway/operations Decision Loop.
```
#### M-04 — recovery activation is authority-bearing but has no named owner and was never tested against the closed L7 set

```text
challenged claim
  S0 "New semantic owner = 0 / New Hub domain module = 0"; R-16 "restored generation is not active
  PROD ... until recovery provenance, required closure, security/currentness re-establishment,
  owner reconciliation, environment conformance and required serving verification have passed";
  S7.4 "until explicit successful activation clears it".

current authority that decides it
  docs/architecture/index.md S4.1: the F1 L7 control-plane orchestration set is CLOSED at exactly
  seven flows, and the later MANAGED_JOB addition was explicitly classified as a Gateway
  caller-surface amendment "not an eighth L7 orchestration flow".
  docs/architecture/index.md S2: "one semantic authority per meaning"; "mechanism != authority";
  "current mutable authorization is server-derived and rechecked at protected control points".
  docs/reference/data-and-persistence.md S6.5: hub_control is closed at 13 owner schemas and 46
  durable record classes.

failure class / concrete counterexample
  Undeclared authority. The fence has two faces and the candidate only analyses one.
  Denying face: while the fence is set, ingress and autonomy are refused. That is a pure narrowing
  and is structurally identical to the already-accepted whole-Hub emergency stop, so it needs no
  owner.
  Granting face: clearing the fence RE-ENABLES normal PROD across I&A, Connections/Gateway, PAR,
  MAR and Release simultaneously, conditioned on a composite multi-owner checklist. That composite
  decision is authority over current Product state. As written, its only home is a host-level
  artifact, which is mechanism, so the platform ends with a second authority that no owner declares
  and no module rechecks -- the precise shape mandatory question P asks about.
  If instead the composite is implemented Hub-side, it is an eighth L7 orchestration flow over a
  closed set, which is a structural boundary change the candidate declares as zero.

why material
  Either horn contradicts an accepted structural law while the candidate reports zero owners and
  zero modules. This is not solvable by wording later: it decides whether 3M closure is
  boundary-preserving.

smallest correction
  State the resolution explicitly in 3M, in three clauses:
    1. the fence is DENY-ONLY; it can never grant, widen or prove authority, and no owner may read
       it as evidence that something is permitted;
    2. clearing the fence is an operator-driven infrastructure procedure, and every re-enablement
       step is an ordinary operation of an EXISTING owner (session invalidation and grants = I&A;
       revision/credential re-qualification = Connections plus Gateway; trigger re-enable = PAR;
       occurrence admission = MAR; conformance, pointer and serving verification = Release), so no
       composite Hub flow exists;
    3. if realization later needs one composite Hub-side activation flow, that is an L7 amendment
       and returns to the Decision Loop before implementation.

authority impact
  Product/structural if left unresolved; realization/projection once clause 1 and 2 are stated.

reopen trigger if accepted
  Any realization that needs a Hub-side composite activation flow, a durable activation record, or
  an owner that reads the fence as permission.
```

#### M-05 — cross-store closure omits the credential key axis, and the accepted recovery set does not carry it

```text
challenged claim
  S7.2 lists "required CredentialBackend ciphertext generation" as a cross-store closure item and
  S7.6 requires recovered ciphertext to be "resolvable and qualified sufficiently for current use";
  closure test 9 and the RTO <= 8h posture depend on this closing.

current authority that decides it
  docs/reference/release-deployment-and-operations.md S36 required recovery set: it names
  "CredentialBackend ciphertext backing" and does NOT name key or recovery-key material.
  docs/reference/data-and-persistence.md S5.8: outside the trusted Hub boundary "no single
  compromise path/location/credential may yield both the Connection ciphertext backup set and
  root/recovery-key material".
  docs/reference/release-deployment-and-operations.md S15.2: secret material is an INDEPENDENT axis
  outside Release identity, and compatible rotation may change value/cryptoKeyVersion at any time.

failure class / concrete counterexample
  Unclosable closure, plus a security law in tension with the remedy.
  Ciphertext in the restored generation G is encrypted under cryptoKeyVersion v3. After the cutoff a
  compatible rotation moved live use to v4 in the separately custodied key store, which is not part
  of the restored generation and not part of the accepted recovery set. After restore, no governed
  effect can be executed: the ciphertext resolves as a reference and fails at the last mile.
  S7.2 declares closure satisfied because the ciphertext generation is present, so the installation
  believes it is activatable and discovers the failure only at first real use, capability by
  capability, past RTO.
  The naive fix -- put key material in the same recovery custody as the ciphertext -- is forbidden
  by S5.8. The candidate never states which side it takes.

why material
  It is the only cross-store closure item whose missing half is invisible to the closure check
  itself, it makes effect-capable RTO unbounded rather than merely long, and its remedy touches an
  accepted security law. It also silently amends an accepted operations contract if resolved
  informally.

smallest correction
  1. add to S7.2 that closure includes the KEY GENERATION required to decrypt each recoverable
     ciphertext generation, verified as decryptable rather than merely present;
  2. return to the Decision Loop the smallest amendment to the S36 required recovery set: key
     generations referenced by any recoverable ciphertext generation must themselves be recoverable
     under separate custody, satisfying S5.8 (separate custody, not a single location);
  3. add key-generation decryptability to the S9.4 first-production restore proof.

authority impact
  Changes accepted operations authority. This is the one item in this review that must return to the
  Decision Loop rather than be projected as a correction.

reopen trigger if accepted
  Any key-management realization in which retaining decryptability for a recoverable ciphertext
  generation cannot satisfy S5.8 separate custody.
```

#### M-06 — R-09 settlement assumes an owner-to-Gateway effect-discovery seam that no current authority declares

```text
challenged claim
  R-09 "settlement precedes retry decision"; S5.3 "MAR reconciles durable cursor/freshness,
  Project DB progress, Gateway effects and exact pins"; S0 "New durable record class = 0".

current authority that decides it
  docs/reference/integrations-and-gateway.md S19.3 (3A-R9): for MANAGED_JOB the Hub derives exact
  JobRun, Project/environment, Release, artifact revision and occurrence identity server-side.
  docs/reference/managed-execution-qualification.md S5.2: no module reads another owner's tables.
  docs/reference/data-and-persistence.md S6.5: a mutable current-state mirror of another owner is
  forbidden; Tier-3 semantic references are the default for non-structural cross-owner references.

failure class / concrete counterexample
  A named reconciliation step with no admissible read path.
  A JobRun is RUNNING-orphaned after worker loss. MAR is required to settle "Gateway effects"
  before deciding continuation. Occurrence identity was available to Gateway at call time, but
  nothing in current authority requires Gateway to record it DURABLY on effect truth or to expose a
  query by it. Without both, MAR either cannot settle at all -- so R-09 blocks forever and the
  first vertical's sync never recovers -- or someone realizes the shortcut of reading gw state
  directly, which violates the owner-isolation matrix.
  Note the correct shape: the discovery seam is a narrow MAR->Gateway call in a direction the
  MANAGED_JOB caller surface already admits, so this needs no new module and no new class -- but it
  does need to be named, because "reconcile" currently stands in for a capability nobody owns yet.

why material
  R-09 is one of the load-bearing invariants and its MAR realization is unimplementable as written.
  Left unnamed, it becomes an owner-isolation violation at first build, which is the class the
  architecture spends S6.2 and S6.3 preventing.

smallest correction
  Name two obligations, both realization-level: Gateway effect truth durably carries the admitted
  caller-occurrence identity, and Gateway exposes a narrow "unresolved effects for occurrence X /
  subject S" query to admitted caller surfaces. Route both to FIRST-BUILD and add the property to
  the 3N V-family list.

authority impact
  Realization/projection. No new durable class if the correlation is carried as a Tier-3 semantic
  reference on existing effect truth.

reopen trigger if accepted
  If the correlation cannot be expressed without a new durable record class or a Tier-2 FK, the 3E
  inventory Decision Loop opens.
```

#### M-07 — "New Product requirement = 0" understates what the candidate actually obliges the first installation to do

```text
challenged claim
  S0 "New Product requirement = 0"; S13 preamble that reviewer findings must return proposed
  requirements to the Decision Loop.

current authority that decides it
  Review protocol item 6 in this file (a new Product requirement/owner/trust boundary must be
  IDENTIFIED, not smuggled).
  docs/reference/release-deployment-and-operations.md S36, which is the accepted first-installation
  operations contract and currently obliges: single failure domain, manual restore, RPO/RTO,
  off-host recoverable set, complete restore proof, whole-Hub emergency-stop drill, no HA claim.
  docs/product/contract.md F1 scope line "first-installation backup/restore/emergency-stop
  correctness".

failure class / concrete counterexample
  Under-declared scope. The candidate adds at least four operator-facing obligations that S36 does
  not currently carry:
    1. a recovery-activation fence must exist and must survive process restart (R-16, R-17);
    2. security/currentness re-establishment must occur before ingress and autonomy return (S7.5);
    3. the mutable PostgreSQL recovery set must restore from ONE internally consistent generation
       (S7.1) -- a real strengthening of "off-host recoverable set required";
    4. an explicit activation gate with serving verification must be passed (S7.7, S9.4).
  These are good obligations. They are also new duties on the installation and on the first-
  production proof, and reporting them as zero means the operator ratifies them without seeing them.

why material
  Governance, not physics: an unidentified requirement cannot be adjudicated, and closure test 13
  (global coherence) cannot be honestly claimed while the declaration line contradicts S7.

smallest correction
  Replace the single zero line with an honest split:
  "new Product capability/owner/class = 0; new first-installation operational obligations = 4,
  identified for ratification as a refinement of the accepted operations contract", and project the
  surviving four into S36 rather than leaving them only in a temporary file.

authority impact
  Product/operations authority, by identification. The obligations themselves are within the 3M
  charter; only their declaration is wrong.

reopen trigger if accepted
  Operator declines any of the four obligations; that obligation returns to the operations Decision
  Loop and its dependent invariant is re-derived.
```

#### M-08 — the projection step has no destination map, so accepted semantics would acquire a second home

```text
challenged claim
  Candidate preamble: "its surviving semantics must be projected into durable current authority and
  this temporary file must be deleted before merge"; closure test 13 (global coherence).

current authority that decides it
  docs/architecture/index.md S2 "one semantic authority per meaning";
  docs/index.md authority hierarchy and "Mechanism is not authority";
  docs/phases/3a-authority-baseline.md supersession law: "Current canonical documents own present
  truth. Detailed references own only their named technical surface."

failure class / concrete counterexample
  Duplicate authority homes created by a correct-looking closure.
  A large part of Section 4 restates law that already has an owner: R-02 restates
  "mechanism != authority"; R-03 restates "unknown/missing/partial != zero/success"; R-04 and much
  of R-05 restate integrations S19.4; R-10 restates runtime S29.2 plus builder S9.4.2; R-12
  generalizes builder S9.4.1; S5.5 restates release S12 and S16 almost verbatim.
  If projection copies them, the platform ends with two texts stating one law, and the next
  refinement updates one of them. If projection skips them silently, genuinely NEW content
  (R-11, R-14 through R-19, S6.2 quiescence definitions, S7) risks landing nowhere before the
  temporary file is deleted at merge, which the repository hygiene check enforces.

why material
  3M closure is exactly the projection act. Without a per-invariant destination the closure either
  duplicates authority or loses the new content, and both defeat closure test 13.

smallest correction
  Add one projection table to the candidate before closure: for every R-0x and every Section 5 to 7
  clause, name the destination file/section and mark it PROJECT-NEW, PROJECT-BY-REFERENCE (the law
  already exists; 3M only cites it) or DELETE. My reading of the split is roughly: new = R-06,
  R-11, R-12 (as generalization), R-14 through R-19, S6.2, S7.1 through S7.8; by reference =
  R-01 through R-05, R-07 through R-10, R-13, most of S5.5.

authority impact
  Realization/projection only, but it is the mechanism by which 3M becomes durable.

reopen trigger if accepted
  Any invariant with no admissible destination is a symptom of a missing owner and returns to the
  smallest owning Decision Loop rather than getting a new home invented for it.
```
### 4. Non-material findings

```text
N-01  S3.B and S8.2 assert what "current Mastra documentation" says about DurableAgent crash
      recovery re-driving orphaned runs and re-executing tool calls. That claim carries no version,
      date or source anchor, no framework package is installed in this repository, and the pinned
      deciding identity is @mastra/core 1.56.0. The decision does not need the claim: "no current
      F1 consumer" plus "not in the qualified baseline" already decide it. Delete the paragraph or
      anchor it with exact version/date provenance as Evidence.

N-02  S5.5 restates release S12.4, S12.5, S12.7, S16.1 and S16.2 almost verbatim. Keep only the
      recovery delta (what changes because the process died or the generation is older) and cite
      the owner for the rest. Same treatment for the Builder text that repeats S9.4.1 and S9.4.2.

N-03  R-19 states preservation and non-promotion of post-cutoff canonical Git, and S9.4 orders Git
      reconciliation before activation, but no law states that Git-write-capable surfaces stay
      fenced until that reconciliation completes. The ordering is currently an artifact of a
      checklist rather than an invariant. One clause fixes it.

N-04  S7.8 measures RTO <= 8h against "useful safe service" without defining the minimum safe
      service set. Either name it (control plane read, Release serving, non-effectful surfaces) or
      state explicitly that it is Realization Planning; otherwise the objective is unfalsifiable.

N-05  R-18 and S7.5 speak of "material privileged/autonomous/effect authority classes" without
      enumerating them, although hub_control is closed at 13 owner schemas and 46 durable classes,
      which makes a closed enumeration feasible. Route the enumeration explicitly to Realization
      Planning with a named first-production check, so recovery is neither arbitrary nor
      over-broad.

N-06  S5.3 admits continuation when "continuation/reexecution is proven idempotent and compatible",
      but job/v1 currently carries no durable idempotency declaration. Name it as a first-build
      obligation on the job contract rather than leaving it as an operator judgement at recovery
      time.

N-07  S6.1 to S6.3 apply one vocabulary (stop intent -> quiescence -> settlement -> decision) across
      five owners. The candidate correctly refuses to freeze the classes in S10, but on projection
      this shape can still become a de facto generic lifecycle. State the projection rule: the
      vocabulary lands as owner-local semantics in each owning reference, never as one shared
      lifecycle section.

N-08  S9.3 kill-point families should gain the two falsifiers this review needs:
      restore-and-start with no recovery marker planted (M-01), and idempotency-key reuse across a
      restore boundary (M-02b).
```

### 5. Mandatory attack questions

```text
A  Owner-local recovery IS the Global Maximum. No smaller structure survives: the candidate already
   pushes meaning to owners that exist and adds no lifecycle. A smaller TEXT exists (M-08, N-02).

B  Yes, twice. "MAR reconciles Gateway effects" (S5.3) needs a seam nobody declares (M-06), and
   "the affected capability" (S5.4, S7.6) needs knowledge the same paragraph proves impossible
   (M-03). Every other use of reconcile is backed by a durable fact I could locate: migration
   ledger and checksums, EnvironmentConformance, MAR freshness position, owner terminal facts.

C  Crash-during-recovery is handled. Never-established-recovery is not (M-01), and the authority to
   CLEAR the posture is unowned (M-04). No semantic Recovery owner is needed to fix either.

D  Partially. Sessions, ingress, autonomy and pending approvals are fenced in class terms. Three
   resurrections remain open: idempotency identity reissue (M-02b), undiscoverable lost-window
   effects (M-03), credential key generations (M-05). The class list itself is unenumerated (N-05).

E  Direction is right and is not over-broad, because S7.5 returns unresolved faults to owner/surface
   scope after activation. It is under-specified rather than disproportionate: see N-04 and N-05.

F  Correct. Newer canonical Git stays authoring/provenance truth, is neither deleted nor promoted
   into lost Hub operational/Release authority, and S9.4 reconciles before activation. Only the
   write-side fence is unstated (N-03). No material finding here; I tried to break it and could not.

G  Honest in framing, inoperative in remedy (M-03), and silently unbounded for credentials (M-05).
   The candidate deserves credit for refusing to invent a replicated effect ledger; the correction
   is a wider default, not new machinery.

H  Yes. Not through replay -- through FRESH ADMISSION for the same sealed subject after an
   unresolved attempt (M-02a). R-04 to R-06 close the retry door and leave the admission door open.

I  No underuse and no overfit. Native requireApproval/persisted suspension, Memory scoping, role
   instances and scheduler ingress are all kept native; S5.2 resume conditions match runtime S24.5
   and S24.6 exactly, including exact old pins and current owner recheck. DurableAgent stays off and
   its requalification trigger is preserved. Only N-01 applies.

J  Two candidates, both closable without new durable state: the recovery fence (M-01, M-04) if it is
   deny-only and host/substrate-held, and the effect-discovery seam (M-06) if the correlation rides
   an existing effect record as a Tier-3 semantic reference. Nothing else in the candidate needs a
   new class, schema, database, cross-owner transaction or service. The S0 zero-line is accurate on
   this axis and inaccurate on the operational-obligation axis (M-07).

K  Deletable now: the S8.2 unpinned framework paragraph, the duplicated release prose in S5.5, and
   the pure restatements R-02/R-03 (as copies; keep them as citations). Nothing dormant is
   introduced anywhere, and the S10 refusal list is correct.

L  No pull-forward and no wrongful rejection. HA, PITR, multi-region, DurableAgent, Temporal-like
   engines, EVENT triggers and saga engines each lack a current F1 consumer, and the read-only first
   vertical confirms it. The candidate also gets a subtle one right: PostgreSQL base-backup/WAL
   mechanics are used as recovery MECHANISM while PITR is refused as a Product REQUIREMENT.

M  Mostly. Routing to 3N, first-build kill points, first-production restore proof and 3O matches the
   earliest falsifying stage in each case I checked, and no obligation is parked at a stage that can
   only prove a mock. Two gaps: M-02 has no route at all, and M-01's negative drill is missing from
   S9.4. I agree that no new pre-C-018 runtime probe is justified; see Section 7 for the probe
   counterexample I attempted and why it failed.

N  RPO <= 6h remains achievable and honestly bounded. RTO <= 8h remains achievable for the platform
   and for the current read-only vertical. It is not bounded for effect-capable surfaces while M-03
   and M-05 stay open, and the candidate's own escape ("specific unsafe capabilities may remain
   fail-closed beyond broad platform recovery") is the right posture once the fenced set is
   computable.

O  Preserved. I checked each surface against its owner: Builder against S9.4.1/S9.4.2 lineage
   admission and late-output quarantine; PAR against S24.5 to S24.7 including consumed-slot
   semantics and contract invariant 36; MAR against S27.2 and the 3L-R2 freshness law; Release
   against S12.5 to S12.7 and S16.2. No generic lifecycle is forced. Residual projection risk only
   (N-07).

P  Yes, as written (M-04). The fence's denying face is a legitimate narrowing of the same class as
   the accepted whole-Hub emergency stop; its clearing face is a composite multi-owner grant with no
   declared owner and no place in the closed seven-flow L7 set.
```

### 6. Candidate closure test (S12) adjudicated

```text
 1 every named F1 failure class has an owner        = FAILS narrowly (M-03 discovery, M-04 activation)
 2 no generic recovery/retry authority needed       = PASSES / confirmed under attack
 3 Builder/PAR/MAR/Gateway/Release coherence        = FAILS via successor admission (M-02a)
 4 timeout/cancel/quiescence/settlement explicit    = PASSES (settlement depth depends on M-06)
 5 runtime retry cannot bypass Gateway authority    = FAILS (M-02a)
 6 restart and disaster restore are distinct        = PASSES / one of the strongest parts
 7 recovery can crash without activating PROD       = PARTIAL (survives crash, fails open if never
                                                     established, M-01)
 8 lost-RPO authority treated as unknown            = FAILS (M-02b, M-03, M-05)
 9 post-cutoff Git preserved without auto-promotion = PASSES (N-03 clarification only)
10 no further pre-C-018 probe required              = PASSES / independently re-derived
11 proof obligations routed to 3N/build/prod/3O     = PARTIAL (M-02 unrouted, M-01 drill missing)
12 no HA/PITR/DurableAgent/workflow pull-forward    = PASSES
13 global coherence with Product/owners/3L          = FAILS (M-07 declaration, M-08 projection)
```

### 7. Strongest counterexamples attempted that failed

The candidate earns these; each was a genuine attempt to break it, not a formality.

```text
1  Steel-manned Alternative C (Temporal-like durable workflow) specifically as the fix for
   unresolved external effects, since a workflow engine offers a natural home for pending external
   activities. It fails: unresolved effect truth must live with the effect AUTHORITY (Gateway)
   regardless of engine, so the engine removes no obligation, adds a second lifecycle over five
   owners, and has no current consumer. Rejection stands.

2  Steel-manned Alternative A (generic Recovery owner) as the fix for M-04's composite activation.
   It fails harder: a cross-owner recovery owner needs a mutable current-state view of other owners,
   which data S6.5 forbids by name, and a deny-only fence plus per-owner re-enablement is strictly
   smaller. The candidate's rejection is right and my correction stays inside it.

3  Steel-manned enabling DurableAgent to solve active-run crash recovery. It fails and backfires:
   snapshot re-drive re-executes tool calls with attempt-derived identity, which is exactly the
   M-02a failure class, and it is outside the pinned baseline and fires an existing requalification
   trigger. The candidate's "keep off" is correct for a stronger reason than it states.

4  Tried to prove another pre-C-018 runtime probe is required, targeting pg-boss orphan/redelivery
   behavior after process loss. It fails: 3L-R2 S10 already source-resolved retryLimit, job.signal
   and cancel semantics, and the remaining question is owner-semantic (does MAR settle correctly),
   which needs Product records that do not exist. A probe here would test the fixture.

5  Tried to break the single-cluster recovery-consistency claim in S7.1. It holds: the accepted
   first-production topology places hub_control, mastra_builder, mastra_par and production Project
   DBs in one cluster, so a cluster-consistent generation really is the smallest current shape, and
   S11 already carries the reopen trigger if a store leaves the cluster.

6  Tried to force R-17 to require a new durable record class inside the closed 46-class inventory.
   It fails: continuity/posture evidence is expressible in host/service-manager state or in existing
   owner facts, so the invariant survives without touching the inventory. This is also why M-01's
   correction is cheap.

7  Tried to break the exclusion of mastra_builder from the required recovery set. It holds:
   in-flight Builder physical continuity is explicitly not assumed, successors take FRESH_BASE, and
   CodingSession-to-substrate references are mechanism rather than authoritative closure items.

8  Tried to make the one-catch-up law produce a backlog after a long restore window. It holds by
   construction: recurrence derives from the current durable freshness position rather than nominal
   slots, so a six-hour or six-day gap both yield at most one catch-up, and the read-only/replay-safe
   gate before effect-capable catch-up is correct.
```

### 8. Smallest closure route

```text
Lead-adjudicable corrections inside the candidate (no Decision Loop needed):
  M-01  invert R-17 to a positive-continuity default + add the negative drill to S9.4
  M-02  freeze the semantic-effect-identity derivation law + fence NEW ADMISSION Gateway-side
  M-03  widen lost-window fail-closed to the class + name the write-capable-consumer trigger
  M-04  state fence = deny-only, activation = operator procedure over existing owners,
        composite Hub flow = L7 amendment if ever needed
  M-06  name the caller-occurrence correlation + narrow Gateway discovery query as first-build
  M-08  add the per-invariant projection destination table

Requires return to the Decision Loop before 3M closure:
  M-05  S36 required recovery set amendment (key generations recoverable under separate custody)
  M-07  identification and ratification of the four new first-installation operational obligations

Round 2 position:
  Not required if the Lead adjudicates the eight findings as stated. A second isolated review branch
  is justified only if adjudication of M-04 or M-05 changes structure (a Hub-side activation flow, a
  new durable class, or a custody model that touches data S5.8), because those would make the
  corrected candidate a materially different package rather than a corrected one.

Status carried forward unchanged by this review:
  3M                     = NEXT / NOT STARTED
  C-018                  = NOT RATIFIED
  Product implementation = BLOCKED
  3L                     = CLOSED / no requalification triggered by this review
  This review is Evidence. It closes nothing and authorizes nothing.
```
