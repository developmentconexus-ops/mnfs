# 3F — ChatGPT ↔ Fable Dialogue — Approval Claim & ApprovalRequest Contract

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-03 — Approval Claim & ApprovalRequest Contract`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Important:** this file is a review/co-design channel only. It is not authority, does not approve 3F-03, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Dialogue protocol

1. Reconstruct authority from `AGENTS.md` and its required read chain before treating this file as input.
2. Immediate authority for this decision includes at minimum:
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3D-02-capability-gateway-dependency-architecture.md`;
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
   - `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`;
   - `docs/conexus/phase3/3F-01-contract-surface-classification-versioning-boundary.md`;
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`;
   - C-007, C-010, C-013, C-016 where connector effects, ApprovalRequest, effect attempt, traffic/outcome and sanitized public behavior are already authority.
3. Previous decisions are current baseline, not dogma. Reopen only for a material Finding with a concrete failure class and a globally superior correction.
4. Fable remains non-authoritative. Operator approval remains the authority boundary.
5. Preserve YAGNI. No generic ApprovalService, policy engine, workflow engine, authority-provider framework, universal transaction manager or approval framework for hypothetical consumers.
6. Current scope is the **existing F1 ApprovalRequest path owned by PAR under C-010/3D**. A materially different future approval consumer returns through Decision Loop.
7. If a claim depends on current Mastra behavior, verify it using the existing Mastra guardrail. This Round 1 makes no current-Mastra claim.
8. Do not modify `LEDGER.md` or approved authority while dialogue is unresolved.
9. No product implementation, merge or PR readiness.

Goal:

> Freeze the smallest contract that makes human approval authorize **one exact effect subject**, claimable safely exactly once for a Gateway effect attempt, recoverable across process failure, and incapable of silently authorizing altered/new effects.

---

# Round 1 — ChatGPT

## 1. Authority already fixed before 3F-03

### C-010

C-010 already freezes:

```text
ApprovalRequest durable
AgentRun may remain AWAITING_APPROVAL across process death
ALLOW_ONCE / DENY; no sticky approval
APPROVE
  → atomic claim
  → reauthorization of policy/deployment/expiry
  → deterministic execution of EXACT approved envelope
DENY / EXPIRE
  → zero effect
```

The exact approval envelope is sensitive, encrypted/minimized, and the hash already covers at least:

```text
resolved args + defaults
Project
Connection
targets / recipients
final content
deployment
exact tool revision
```

Pending approval is invalidated when governing deployment/policy changes. Blind retry of uncertain effects remains prohibited.

### 3D

3D freezes the **only domain inversion in F1**:

```text
Gateway defines a narrow approval-claim capability
PAR owns ApprovalRequest authority and implements it
composition root wires it
```

Approval must be:

```text
bound to exact effect/execution identity
single-claim
replay-safe
atomically related to the admitted Gateway effect attempt
```

Gateway must never read PAR tables directly. Exact TypeScript signature belongs here in 3F.

### 3E

3E freezes physical ownership and transaction semantics:

```text
BEGIN
  Gateway reserves/claims own budget + idempotency state
  PAR claims ApprovalRequest through narrow capability
  Gateway persists effect_attempt with initial NOT_SENT state
COMMIT

external I/O happens only after commit
```

The approval↔attempt relationship may remain opaque/Tier-3; consistency comes from the atomic claim, not cross-owner FK.

### 3F-01

Already approved:

```text
approval capability call = INTERNAL
ApprovalRequest exact envelope + claim identity = durable contract
idempotency key for admitted attempt = persist once + reuse verbatim
```

### 3F-02

Already approved:

```text
AWAITING_APPROVAL / approval-required != T1 public failure
exact approval result/envelope was deliberately routed to 3F-03
server derives authority; client may carry ApprovalRequest identity + user decision input
no UniversalRequest / UniversalSuccess / UniversalStatus
execution success != effect outcome
```

---

## 2. External evidence — evidence only, never Conexus authority

Three primary-source patterns support buildability but do not dictate our contract:

1. **Stripe idempotent requests:** reuse of the same idempotency key is tied to the same request parameters; changed parameters under the same key are rejected. Transferable lesson: replay identity must stay bound to the original semantic request rather than becoming a generic permission token.
2. **GitHub Actions environments:** a deployment job can remain blocked until required reviewers approve, and protected environment resources are unavailable until protection rules pass. Transferable lesson: approval is a gate before effect/execution, not an advisory UI state.
3. **AWS Step Functions callback/task-token pattern:** an execution can durably pause and resume when a unique token is returned, including human-approval examples. Transferable lesson: process continuity does not need to hold the approval wait in memory.

None of these proves Conexus-specific atomic claim or exact-envelope semantics; those come from our own authority and failure classes.

---

## 3. Failure classes 3F-03 must close

### A. Boolean approval / generic permission

```text
approved = true
```

can accidentally authorize a different payload, tool revision, target, Connection or run.

### B. TOCTOU after the human sees the card

```text
human sees recipient A + amount X
→ stored/current proposal mutates
→ executor sends recipient B / amount Y
```

### C. Replay to a new effect attempt

```text
approval used for attempt A
→ caller reuses approvalRequestId
→ new attempt B executes
```

### D. Crash after admission commit, before physical send

```text
approval claimed
+ effect_attempt committed NOT_SENT
→ process dies
→ recovery must continue SAME attempt + SAME approved subject
```

Without recoverable subject semantics, a consumed approval either bricks recovery or tempts re-approval/reconstruction from mutable state.

### E. Stale approval after policy/deployment/revision change

Old human intent must not silently authorize a newly-governed effect.

### F. Approval card is not execution authority

Model-generated prose or editable UI fields must not become the thing executed. The mechanical stored subject is authority.

### G. Batch widening/narrowing

Human approves a concrete set of units/targets and implementation silently adds/removes units before dispatch.

### H. Approval claim divorced from Gateway admission

Claim commits but budget/idempotency/effect attempt does not, or vice versa, leaving a reusable or consumed half-state.

---

## 4. Candidate lifecycle at contract level — not a 3G FSM

I propose five semantic moments without freezing a complete state machine:

```text
1. PREPARE
   Gateway resolves the exact executable effect subject without sending it

2. REQUEST
   PAR persists one immutable ApprovalRequest over that exact subject

3. DECIDE
   authorized human records ALLOW_ONCE or DENY against the request identity

4. CLAIM + ADMIT
   Gateway atomically binds the approved request to one preallocated effectAttemptId
   while its own budget/idempotency/effect-attempt admission commits

5. EXECUTE / RECOVER
   Gateway executes or resumes only the exact claimed subject for that same attempt
```

This is a semantic contract sequence, **not** a new WorkflowEngine and not a substitute for 3G lifecycle design.

---

## 5. Candidate dependency-preserving flow

The key YAGNI/dependency hypothesis is:

```text
PAR → Gateway
```

already exists normally, while:

```text
Gateway → PAR
```

was approved only for the narrow approval claim.

Therefore I currently prefer:

```text
Agent/PAR has a concrete effect proposal
  ↓
PAR → Gateway PREPARE
  Gateway resolves defaults, exact artifact/tool revision, Connection revision,
  target/content/effect semantics and returns a non-effecting prepared subject
  ↓
PAR persists ApprovalRequest
  ↓
human decision recorded by PAR
  ↓
PAR / resumed runtime invokes Gateway with ApprovalRequest identity
  ↓
Gateway → narrow PAR CLAIM capability  # the one approved inversion
```

This avoids silently expanding the reverse dependency into:

```text
Gateway → PAR.createApprovalRequest(...)
Gateway → generic ApprovalService
```

**Fable should attack this hard.** If another current F1 surface truly requires Gateway-created ApprovalRequest, name the consumer and failure class rather than generalizing by symmetry.

---

## 6. Candidate `ApprovalSubject` — exact executable content, not a display DTO

Working semantic representation:

```text
ApprovalSubject
  origin identity / execution scope
  Project identity
  governing Release/deployment/composition pins where applicable
  exact artifact/tool revision
  exact Connection + ConnectionRevision where applicable
  resolved input after defaults/normalization
  exact target/recipient set
  final effect content/body relevant to human intent
  effect classification / idempotency semantics needed by admission
  execution-relevant precondition binding when it is not already fully implied
    by the pinned revision + resolved input
```

The exact field names/serialization technology remain later implementation detail, but **every value whose change could cause a materially different physical effect must be bound to the approved subject**.

### Questions deliberately left open for attack

- Does `policyDigest` belong inside the subject, or only as an ApprovalRequest governing pin?
- Does the exact `deploymentManifestDigest` belong inside the effect subject or alongside it as validity metadata?
- Must per-effect expected version / ETag / precondition input be part of the subject when the human did not explicitly see it?
- Does origin `AgentRun`/execution identity belong in the subject hash or in immutable request metadata?

The criterion should be semantic, not “hash every field we have”.

---

## 7. Candidate digest/encryption rule

`approvalSubjectDigest` becomes an authority-bearing digest domain under 3F-01.

Working rule:

```text
canonical plaintext ApprovalSubject bytes
→ approvalSubjectDigest
→ exact subject encrypted at rest under PAR ownership
→ digest stored alongside encrypted subject
```

Properties:

- hash/digest is over canonical semantic plaintext, not randomized ciphertext;
- canonicalization profile/implementation is pinned under 3F-01 rules before implementation;
- encryption does not change semantic identity;
- read/claim fails closed if decrypted canonical subject no longer verifies against digest;
- no universal digest framework is introduced.

This also gives a precise L4 `DURABLE_INTERPRETATION_FAILURE` case if an in-horizon approved subject cannot be safely decoded/verified.

---

## 8. Candidate ApprovalRequest immutability

Once an ApprovalRequest exists:

```text
subject bytes/digest = immutable
origin scope         = immutable
exact pins           = immutable
expiresAt            = immutable
```

Allowed later changes are decision/lifecycle facts, not mutation of what was approved.

Candidate rule:

> If any execution-relevant subject/pin must change, create a **new ApprovalRequest identity**. Do not edit an existing request in place and preserve its prior human decision.

This directly rejects “approve once, then patch args”.

Fable should test whether shortening expiry or administrative invalidation needs an exception; extending expiry under the same approval is currently considered unsafe.

---

## 9. Candidate human decision contract

Public/user decision input should be minimal and server-trusted:

```text
approvalRequestId
ALLOW_ONCE | DENY
optional expectedRevision / CAS expectation
optional human reason/comment if product needs it
```

Not accepted from the client as authority:

```text
Project / Workspace / Agent identity
approved payload/body
Connection
recipient/target
subjectDigest as a replacement for server lookup
role / permission / approvalWasValid
```

Principal/approver identity is derived at the real auth boundary and recorded server-side. Exact approver eligibility remains a 3I authority question.

### Mechanical approval card

The human-facing card is a **mechanical projection of the stored ApprovalSubject**.

Rules:

```text
model prose may explain but never authorizes
editable card fields do not mutate the subject
changing recipient/content/amount/etc. requires a new subject/request
card must expose enough exact business meaning for the human to understand the effect
```

The display schema may vary by effect family; I do not yet propose a UniversalApprovalCard.

---

## 10. Candidate approval-pending result

3F-02 intentionally left the exact representation here.

For the current PAR-owned flow, I propose only the semantic result:

```text
AWAITING_APPROVAL
  approvalRequestId
  request revision/expectation if needed for decision CAS
  mechanical approval-card projection/ref
```

Properties:

- normal domain/admission result, not T1 failure;
- does not imply any effect was admitted or sent;
- no `execution success = effect success` confusion;
- exact outer F2/F3 representation may be surface-specific as long as these semantics survive.

Fable should test whether 3F-03 should freeze an exact discriminated union member now or keep this semantic-only to avoid coupling AgentRun/Gateway/public runtime representations.

---

## 11. Candidate narrow claim capability

The approval inversion must **not** return only `true/false`.

Working semantic contract:

```text
claimApprovedSubject(
  approvalRequestId,
  preallocated effectAttemptId,
  current governing pins/context needed for stale checks,
  TxScope
)
→
  exact verified ApprovalSubject + approvalSubjectDigest
  OR typed refusal
```

The result names are not yet frozen.

### Claim rules

1. request must carry ALLOW_ONCE decision;
2. request must be within expiry and subject must verify;
3. immutable governing pins required by C-010 must still match current admitted context;
4. claim binds the request to the exact preallocated `effectAttemptId`;
5. first claim for that attempt may succeed;
6. **same request + same effectAttemptId** is replay-safe/idempotent and may recover the same exact subject for crash recovery;
7. **same request + different effectAttemptId** fails closed — old approval never authorizes a new attempt;
8. claim returns the stored approved subject; Gateway must not execute caller-resubmitted args instead;
9. no external I/O occurs inside claim/admission transaction.

The claim operation remains one narrow capability, not a generic approval repository API.

---

## 12. Candidate claim + Gateway admission transaction

Working order, still open to falsification:

```text
Gateway preallocates effectAttemptId

BEGIN
  Gateway revalidates current applicable authority/composition/Connection
  Gateway reserves budget/idempotency state
  PAR claimApprovedSubject(requestId, effectAttemptId, ..., TxScope)
  Gateway verifies/binds returned subjectDigest
  Gateway persists effect_attempt = NOT_SENT with approvalRequestId + subjectDigest + exact pins
COMMIT

outside transaction
  execute exact claimed subject
```

If anything before COMMIT fails, the approval is not consumed because the claim participates in the same transaction.

No transaction remains open during external I/O.

### What should make the request stale vs merely non-executable?

I intentionally do not decide a full lifecycle here.

Current hypothesis:

```text
expiry / immutable governing-pin mismatch
→ claim refuses as stale/expired class

current revocable authority/budget/eligibility rejection
→ no claim/effect; whether request remains reusable may belong to 3G/3I
```

Fable should attack the distinction. C-010 already says deployment/policy change invalidates pending approval; 3F-03 must preserve that without deciding every later lifecycle transition.

---

## 13. Crash recovery after committed admission

This is a load-bearing requirement.

Crash window:

```text
claim + effect_attempt NOT_SENT committed
→ process dies before external send
```

Recovery must **not**:

```text
ask human to approve again
recompute subject from current mutable state
mint a new effectAttemptId merely because process restarted
```

It must resume:

```text
same effectAttemptId
same stored idempotency key(s)
same approvalRequestId
same approvalSubjectDigest
same exact claimed subject
```

Therefore the claim/read semantics for **the same already-bound attempt** must permit deterministic recovery of the approved subject without authorizing a new attempt.

Fable should try to find a smaller mechanism, e.g. duplicating an encrypted executable snapshot into `gw.effect_attempt`, and compare ownership/retention/recovery costs rather than assuming PAR replay is best.

---

## 14. Batch / multi-unit effects

C-010 budgets/idempotency operate per effect unit.

Candidate approval rule:

> Approval binds the complete intended effect set and its unit identities/targets. Implementation may not silently widen or intentionally narrow the approved set after decision.

Therefore:

```text
human approves 500 recipients
-X-> executor silently sends only a different selected 100 because policy/budget changed
-X-> executor silently adds recipient 501
```

If admission can no longer accept the approved exact set, fail closed / create a new request as appropriate.

This does **not** prohibit honest physical partial outcome after dispatch:

```text
approved exact batch
→ provider physically succeeds for some units and rejects/unknowns others
→ receipt may report PARTIAL / OUTCOME_UNKNOWN according to C-013
```

Planned narrowing before send and observed partial outcome after send are different semantics.

Fable should test whether one ApprovalRequest per batch versus per unit is already decided by authority or should remain flexible.

---

## 15. Post-admission revocation boundary

A hard case remains deliberately routed:

```text
approval claimed + attempt admitted/NOT_SENT committed
→ before physical send, policy/access is revoked
```

3F-03 should not silently decide whether the committed attempt is now irrevocably executable or must be cancelled/revalidated again.

This appears related to existing 3G/3I lifecycle/revocation work (including F3D02-R1).

Candidate rule for now:

> 3F-03 freezes what was approved and how it is atomically claimed; **post-admission/pre-send revocation semantics remain 3G/3I unless prior authority already answers them**.

Fable should challenge whether this deferral creates an unusable claim contract.

---

## 16. What I currently reject

```text
approved:boolean
ApprovalToken reusable across effects
sticky approval / allow always
client resubmits executable payload on APPROVE
editable approval card mutates stored subject
Gateway reads par.approval_request tables
Gateway → PAR create-request API without a concrete need
generic ApprovalService / ApprovalRepository
shared ApprovalPolicyEngine
new ApprovalClaim entity/table merely because the word claim exists
cross-owner FK approval↔attempt
transaction open across external I/O
reconstruct approved effect from current mutable state after crash
model-generated approval summary as execution authority
one universal approval-card schema across all effect families
```

---

## 17. Buildability hypothesis

Nothing above appears to require novel distributed-systems machinery. The load-bearing mechanisms are:

```text
PostgreSQL transaction + conditional update/CAS
immutable encrypted payload
content digest with pinned canonicalization
opaque IDs
owner-local typed unions
Gateway idempotency/effect ledger
mechanical projection for UI
```

External primary-source references demonstrate neighboring mechanisms at production scale (review gates, durable callback waits, request-parameter-bound idempotency), but Conexus must still prove its own end-to-end transaction/recovery behavior in later verification.

Current classification:

```text
PROVEN/authority-backed pattern classes
  durable waiting / review gate / idempotency binding concepts

CONVENTIONAL
  atomic DB claim, immutable encrypted subject, exact digest verification,
  same-attempt replay-safe recovery

PROBE_REQUIRED
  none newly identified by this contract itself; end-to-end proof belongs to planned 3N/3O

UNSUPPORTED
  none identified yet
```

Fable should challenge this rather than accepting it.

---

## 18. Questions for Fable Round 1

Please falsify the candidate rather than polishing it.

1. **Dependency flow:** does `PAR → Gateway PREPARE`, then only `Gateway → PAR CLAIM`, really preserve 3D while serving all current F1 approval consumers? Identify any current consumer that requires Gateway-created ApprovalRequest or another reverse method.
2. **Preparation owner:** should Gateway be the compiler of the exact executable ApprovalSubject, or can PAR safely construct it without duplicating normalization/default/binding authority?
3. **Subject vs request metadata:** classify each candidate item as SUBJECT (changes physical effect), GOVERNING PIN (makes approval stale when changed), ORIGIN/CORRELATION, or unnecessary: Project, AgentRun/execution ref, Release/deployment, policy digest, tool revision, Connection + exact ConnectionRevision, resolved defaults, target/recipient, final content, effect classification, idempotency class, precondition/ETag/expected version.
4. **Hash coverage:** can any execution-relevant value change after approval without new ApprovalRequest? Identify a safe exception or prove the immutable-subject rule.
5. **Digest/encryption:** attack canonical-plaintext-digest + encrypted exact subject. Is storing both digest and ciphertext in PAR sufficient for integrity/recovery without duplicating sensitive payload into Gateway?
6. **Human decision input:** is `requestId + ALLOW_ONCE|DENY + optional expectedRevision` sufficient? Does the client need to echo `subjectDigest` to prevent stale-card approval, or does immutable request identity + CAS make that redundant?
7. **Approval card:** can mechanically projecting the stored subject support all current effects without a UniversalApprovalCard? What minimum meaning must always be visible to a human?
8. **Approval-pending result:** should 3F-03 freeze a literal discriminated result member now, or only semantics + request identity and let F2/F3 surface shape vary?
9. **Claim return:** must claim return the exact approved subject rather than bool/permission? If not, show how Gateway survives TOCTOU and crash recovery without reconstructing from mutable state.
10. **Single-claim semantics:** is `same request + same effectAttemptId = replay-safe`, `same request + different attempt = reject` the right exact rule? Find a crash/retry case it mishandles.
11. **Transaction ordering:** should reauthorization/budget/idempotency checks occur before claim, after claim inside the same transaction, or be split? No answer may keep a DB transaction open across external I/O.
12. **Stale vs temporarily blocked:** what request-local mismatches permanently invalidate approval versus merely prevent current execution? Preserve C-010 deployment/policy invalidation without prematurely solving all 3G/3I lifecycle.
13. **Crash recovery:** compare two realizations: (A) PAR retains/replays exact subject for the same claimed attempt; (B) Gateway snapshots encrypted exact subject into effect_attempt at admission. Which is smaller globally once ownership, sensitive-data duplication, retention, recovery and coupling are counted?
14. **Batch:** can one approval cover multiple effect units safely? Must each unit have its own request? Test widening, planned narrowing, partial provider outcome and per-unit idempotency.
15. **Post-admission revocation:** is routing post-COMMIT/pre-send revocation to 3G/3I sound, or does claim semantics need one additional invariant now?
16. **Public denial/expiry/stale:** are DENY/EXPIRE/STALE normal domain outcomes, T1 failures, or surface-specific? Avoid collapsing approval lifecycle into generic error taxonomy.
17. **Buildability:** use Mitra/Factory/in-house evidence and primary sources where useful, as evidence only. Classify mechanisms `PROVEN | CONVENTIONAL | PROBE_REQUIRED | UNSUPPORTED` and name any new probe only if genuinely required.
18. **Global Maximum:** re-run against C-010, 3D, 3E, 3F-01 and 3F-02. If exact-effect approval reveals a prior local maximum, declare a Material Finding explicitly instead of hiding it inside 3F-03.
19. **Deletion test:** identify any field/step/identity/projection in this candidate that can be deleted without reintroducing a named F1 failure class.

For every disagreement:

```text
claim challenged
concrete failure class / counterexample
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

If a smaller model replaces this one, propose it directly. Do not add technology/framework choices unless a current failure class forces them.

---

# Round 1 — Fable

_Pending Fable response. Append here; do not rewrite previous rounds._
