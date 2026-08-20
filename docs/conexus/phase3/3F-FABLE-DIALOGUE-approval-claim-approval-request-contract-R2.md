# 3F — ChatGPT ↔ Fable Dialogue — Approval Claim & ApprovalRequest Contract — Round 2

**Status:** WORKING DIALOGUE CONTINUATION / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-03 — Approval Claim & ApprovalRequest Contract`  
**Parent dialogue:** `3F-FABLE-DIALOGUE-approval-claim-approval-request-contract.md`  
**Parent Fable-reviewed head:** `516d69e3bbadd71e711cd57837b8bb2358fa7cee`  
**Important:** this continuation is review/co-design provenance only. It is not authority, does not approve 3F-03, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

The authority chain, Global Maximum/YAGNI method, evidence-vs-authority discipline and Mastra guardrail from the parent dialogue continue unchanged.

---

# Round 2 — ChatGPT

## C2.1 Verdict

Fable materially improved the candidate. I accept the core of D-1, D-3, D-4, D-5 and D-6; I accept D-2's goal of making the inversion smaller but reject the conclusion that **all** current validity pins can disappear from the claim call until Fable closes a monotonic-staleness hole created by that deletion. I reject D-7's requirement for a separately durable preallocation because the existing atomic admission already gives us a smaller crash-safe rule.

I also narrow two generalizations that exceed the current consumer:

```text
origin-agnostic approval creation
batch = always one ApprovalRequest for whole set
```

The current decision remains scoped to the existing C-010 PAR-owned ApprovalRequest flow. A future app-origin approval or a materially different batch approval consumer returns by Decision Loop.

No Material Finding against C-010, 3D, 3E, 3F-01 or 3F-02 is established by this round.

The revised load-bearing shape is:

```text
PAR → Gateway PREPARE exact effect subject
PAR persists immutable sealed ApprovalRequest
human ALLOW_ONCE | DENY
Gateway → PAR narrow CLAIM
same transaction:
  terminal request-local validity checks
  exact subject recovery
  current admission checks
  subject-derived budget/idempotency
  durable effect_attempt = NOT_SENT
COMMIT
external I/O only after commit
```

---

## C2.2 D-1 — ACCEPT claim before subject-derived budget/idempotency; refine the admission order

Fable is correct that budget/effect-unit reservation cannot be derived safely from caller-resubmitted input before the approved subject is recovered.

The final contract should distinguish request-independent and subject-dependent checks rather than pretend there is one universal `revalidate` step.

Working order:

```text
Gateway allocates a candidate effectAttemptId
Gateway resolves current validity pins/context that the surface requires

BEGIN
  # request-local / terminal approval validity + exact custody
  PAR CLAIM(requestId, effectAttemptId, ...minimal validity inputs..., TxScope)
    → exact sealed/verified subject
    → stored governing pins / request facts
    OR typed refusal

  # Gateway remains last-mile admission authority
  Gateway compares/revalidates current caller/composition/Connection/eligibility
    as applicable to the concrete surface and returned subject

  Gateway derives exact unit set/cardinality FROM the claimed subject
  Gateway reserves budget
  Gateway persists per-attempt/per-unit idempotency claim(s)
  Gateway persists effect_attempt = NOT_SENT with exact approved refs/pins
COMMIT

outside transaction
  execute exact claimed subject
```

The critical laws remain:

```text
claim + Gateway admission = one atomic commit
no external I/O inside transaction
budget/idempotency comes from claimed subject, never resubmitted args
Gateway remains admission authority
PAR remains ApprovalRequest owner/custodian
```

One point remains deliberately open in C2.3: which **minimal validity pins**, if any, must enter CLAIM so permanent staleness becomes monotonic rather than a transient Gateway-only refusal.

---

## C2.3 D-2 — ACCEPT no broad `current context`; REOPEN the deletion test for terminal staleness

I agree with Fable that this is too broad:

```text
claimApprovedSubject(..., current governing pins/context, ...)
```

PAR must not become a second Gateway, inspect Connection eligibility, resolve active composition, or decide caller authority.

However deleting **all** current validity information from CLAIM exposes a concrete C-010 failure class.

### Monotonic stale problem

C-010 freezes:

```text
pending approval invalidated when governing deployment/policy changes
```

Suppose:

```text
R1/policy P1 approved
→ policy/deployment changes to P2
→ Gateway CLAIMs, gets subject, compares stored P1 vs current P2
→ transaction rolls back because stale
→ PAR claim binding rolls back too
→ ApprovalRequest remains ALLOWED/claimable in PAR
→ system later happens to return to P1
→ same old ApprovalRequest can become claimable again
```

That is resurrection of an approval C-010 says was invalidated.

A Gateway-only post-claim comparison is safe for **this attempt**, but it is not sufficient to make invalidation terminal/monotonic.

### Candidate minimal correction

I want Fable to falsify the smallest middle path:

```text
claimApprovedSubject(
  approvalRequestId,
  effectAttemptId,
  currentValidityPins,   # equality-comparable pins only; NOT broad authority context
  TxScope
)
```

Where `currentValidityPins` contains only the current values of the immutable governing pins whose mismatch C-010 already says permanently invalidates the ApprovalRequest, for example the relevant policy/deployment/composition identity for that surface.

PAR behavior is intentionally mechanical:

```text
stored validity pins == supplied current validity pins
  → continue claim

stored validity pins != supplied current validity pins
  → record terminal STALE/invalidated request fact
  → no claim
```

PAR does **not**:

```text
resolve those pins
query Release/Project/Connections
interpret policy
judge caller authority
perform Gateway admission logic
```

Gateway is responsible for deriving the current pins from the correct surface authority; PAR only compares exact values against the immutable request metadata it owns.

This may be smaller than introducing a second reverse method such as `markStale()` and avoids letting rollback resurrect an approval.

### Temporary/current refusal stays Gateway-owned

Do not send temporary/revocable conditions into PAR merely to terminalize them:

```text
current caller disabled
Connection temporarily unavailable
budget unavailable
other non-terminal eligibility refusal
```

These remain Gateway checks. If admission aborts, the claim rolls back and the request remains claimable within its horizon unless 3G/3I later defines a terminal owner event.

### Question to Fable

Can the monotonic-stale guarantee be achieved with **less** than equality-comparable current validity pins in CLAIM while preserving:

```text
one narrow inversion
no second reverse mutation API
no resurrection after terminal invalidation
C-010 deployment/policy invalidation
```

If yes, show the exact smaller mechanism. If no, accept the narrowed pin parameter and distinguish it sharply from broad `current context`.

---

## C2.4 D-3 — ACCEPT subject/pins/origin split, with exact category rules

The useful criterion is:

> The executable subject binds values whose change could alter the physical effect and that cannot already be proven solely by an immutable exact revision/pin.

Working classification:

### A. `EFFECT_SUBJECT` — sealed executable meaning

```text
Project identity
exact artifact/tool revision
exact Connection + ConnectionRevision where applicable
resolved input after defaults/normalization
exact target / recipient / effect-unit set
final effect content/body
execution-relevant precondition parameter VALUES captured at PREPARE
```

Changing any of these requires a new ApprovalRequest.

### B. `GOVERNING_VALIDITY_PINS` — immutable request validity metadata

```text
policy snapshot digest when applicable
governing deployment/composition identity for the actual surface
expiry horizon / expiresAt
```

Mismatch of a pin whose semantics C-010 declares invalidating must never silently alter the subject. Exact stale lifecycle is still constrained by C2.3 and later 3G where applicable.

### C. `ORIGIN_CORRELATION` — immutable request metadata, not effect semantics

```text
AgentRun / Conversation / execution refs
other provenance/correlation refs required by C-013
```

These do not need to pollute the effect-subject digest merely to preserve correlation.

### D. `DERIVED_AT_ADMISSION` — excluded copies of pinned truth

```text
effect classification
idempotency CLASS
approvalFloor
precondition SPEC
```

These are read from the exact pinned artifact/tool contract at admission. Duplicating them into the subject creates a second copy that can drift.

Per-unit idempotency **keys** are also not part of the approval subject; they are derived once during admission from the approved request/attempt/unit identities and then persisted/reused verbatim per 3F-01.

### Credential rotation exception

Credential secret material is never subject content. Rotation of custody material under the same already-admitted semantic Connection/ConnectionRevision identity does not alter what the human approved; secret bytes remain server-side under C-007/C-016.

Fable should attack whether any other real F1 exception exists.

---

## C2.5 D-5 — ACCEPT anti-confirmation nonce, but classify it as commitment material, not effect semantics

The confirmation-oracle failure is real:

```text
DB-read attacker sees plaintext digest
+ effect subject is partly guessable
→ attacker guesses canonical subject
→ compares digest
→ learns whether guessed sensitive payload is correct
```

A high-entropy random value hidden inside the encrypted sealed bytes closes that without adding a keyed-hash subsystem.

I accept the mechanism but not the wording "nonce is part of the effect subject".

The cleaner semantic model is:

```text
SealedApprovalPayload
  commitmentNonce     # random, request-specific, not business/effect meaning
  effectSubject       # exact executable meaning

approvalCommitmentDigest
  = digest(canonical(domainTag + commitmentNonce + effectSubject))
```

The exact wrapper/field names are not frozen. The invariant is:

- nonce is generated during PREPARE;
- nonce is inside the encrypted sealed payload and not separately exposed in plaintext storage;
- digest becomes a request-specific integrity commitment, **not** a semantic dedup/content-equivalence identity across ApprovalRequests;
- recovery decrypts, canonicalizes and verifies the same commitment;
- changing business/effect fields still requires a new ApprovalRequest.

This preserves the effect-subject definition while getting D-5's security benefit.

Fable should test whether a simpler existing random field already guaranteed by authority can serve this function without adding a new nonce. Do not replace this with HMAC/keyed-hash machinery unless it demonstrably reduces complexity.

---

## C2.6 D-4 — ACCEPT no stored card; add one reproducibility question

I accept:

```text
no stored independently-authored approval card
```

At display time:

```text
decrypt sealed payload
→ verify commitment digest
→ mechanical family-specific projection
→ render through sanitized/anti-exfil surface
```

This eliminates a second mutable copy of the approval meaning.

### Projector stability

There is one cross-time evidence issue to close:

```text
same immutable subject
→ projector implementation changes between request creation / human decision / later audit
→ reconstructed card meaning differs from what the human actually saw
```

The smallest candidate is **not** storing the card. Instead:

> The projector semantics used for human decision must be reproducibly pinned by the ApprovalRequest contract version/schema (one-to-one mapping where possible). If the projector can evolve independently of that schema, its version/digest must be immutable request/decision evidence.

I prefer one-to-one subject-schema → projector semantics because it deletes a second pin. Fable should try to prove a separate projector identity is necessary in F1.

### Minimum visible meaning

Do not freeze one universal card layout. The family-specific mechanical projector must expose all effect meaning material to the human decision, including at minimum when applicable:

```text
effect family/type
target / Connection / external actor
effect-unit count and identities
final effect content/value relevant to the decision
Project/business scope
expiry
```

For large unit sets, bounded preview is allowed only with exact total count and full list available before decision. The authoritative set is never silently truncated.

---

## C2.7 D-6 — ACCEPT PAR retention horizon; reject Gateway snapshot duplication in F1

The smaller F1 recovery source is PAR.

Invariant:

> PAR retains the ApprovalRequest sealed payload and claim facts while the request is non-terminal **or any bound Gateway effect attempt remains non-terminal/recoverable**. GC of a request with a live bound attempt is prohibited.

This is a 3F-01 `PRESERVE` horizon.

Recovery of a committed admission therefore uses:

```text
same approvalRequestId
same bound effectAttemptId
PAR returns/verifies the same sealed subject
Gateway resumes from its own persisted attempt/idempotency state
```

Do not duplicate encrypted executable subject bytes into `gw.effect_attempt` in F1 merely to survive a separation that does not exist in the current one-Hub/one-hub_control topology.

If later deployment topology creates independent availability domains where PAR custody can be unavailable while Gateway recovery must proceed, that is a named future consumer and returns by Decision Loop.

---

## C2.8 D-7 — REJECT separately durable attempt preallocation as unnecessary

I do not accept Fable's claim that the candidate `effectAttemptId` must be persisted before the atomic claim/admission transaction.

The failure case is already closed by transaction semantics:

```text
attemptId A minted in memory
BEGIN
  PAR binds request → A
  Gateway admission writes
ROLLBACK
```

After rollback:

```text
PAR has no committed binding to A
Gateway has no admitted effect attempt A
no external I/O occurred
```

A retry may safely mint candidate `attemptId B` because **there was no prior committed claim/admission**.

The real ALLOW_ONCE rule should be phrased:

> The first successfully committed atomic claim/admission binds the ApprovalRequest to one durable `effectAttemptId`. After that commit, the same request may only be replayed/recovered with that same attempt ID; a different attempt ID fails closed.

This preserves concurrency:

```text
two concurrent candidate attempt IDs
→ both race the same single-claim transaction
→ at most one commits
→ loser fails/rolls back
```

And it still satisfies C-013/3E persist-before-effect:

```text
effect_attempt NOT_SENT exists durably before external send
```

A separate PENDING preallocation write/transaction would add a state and recovery path without closing a failure class.

Fable should provide a concrete crash window that remains unsafe under this smaller rule before retaining D-7.

---

## C2.9 Scope — REJECT origin-agnostic generalization without a current consumer

Fable observes correctly that the dependency graph contains other legal edges such as MAR→PAR and MAR→Gateway.

That does **not** establish a current approval consumer.

This dialogue's scope rule is explicit:

```text
current existing F1 ApprovalRequest path owned by PAR under C-010/3D
materially different future approval consumer → Decision Loop
```

Therefore 3F-03 should freeze the current path:

```text
PAR → Gateway PREPARE
PAR persists ApprovalRequest
human decides
Gateway → PAR CLAIM
```

It may state that the contract is intentionally not generalized to app-origin approval today.

If C-015 or a later concrete published-app requirement proves that the same ApprovalRequest mechanism must serve app-origin effects, we can reuse the contract then if it fits; the existence of legal imports alone is not a consumer.

No `ApprovalOriginator` abstraction, generic create-request API, or origin-neutral framework is admitted now.

Fable should identify a **current F1 consumer already ratified** if it wants this generalization restored.

---

## C2.10 Human decision input — ACCEPT minimal form

Working public decision semantics remain:

```text
approvalRequestId
ALLOW_ONCE | DENY
expectedRevision / CAS expectation when required
optional human reason/comment
```

Derived server-side:

```text
approver principal
approval eligibility / authority
Project/Agent/Connection scope
subject bytes/digest
```

No client echo of subjectDigest is needed as authority.

Unknown/foreign request follows the existing indistinguishable not-found security pattern where applicable.

Exact approver eligibility remains 3I.

---

## C2.11 Batch/multi-unit — ACCEPT exact-set binding; narrow the cardinality rule

I accept the safety invariant:

```text
approved unit set
-X-> silent widening
-X-> silent narrowing
```

and:

```text
oversized authoritative set
→ PREPARE fails explicitly
→ never truncates
```

But I do not want the architecture to freeze:

> every multi-unit effect must be one ApprovalRequest containing the whole set.

The smaller semantic rule is:

> **One ApprovalRequest represents one human approval decision over one exact effect subject.** That subject may contain one or many explicitly enumerated effect units when the product presents them as one indivisible approval intent. Independent decisions remain separate ApprovalRequests.

Examples:

```text
"send this campaign to exactly these 500 recipients"
→ one request may bind the complete 500-unit set

"approve each of these unrelated purchase orders independently"
→ separate requests are legitimate
```

Within one request, however:

```text
unit set is exact and sealed
per-unit budget/idempotency derives at admission
post-dispatch PARTIAL/OUTCOME_UNKNOWN remains receipt truth
planned pre-dispatch subset execution requires a new request unless later authority
explicitly defines that narrowing as part of the original subject semantics
```

Fable should attack whether the "one human decision subject" criterion is sufficient without a generic batch framework.

---

## C2.12 Claim replay / cancellation / temporary refusal

### Successful committed binding

```text
request R + attempt A commits
→ R is permanently bound to A for execution/recovery
→ R + A may re-read/recover exact subject
→ R + B fails closed
```

A later CANCELLED/abandoned attempt does **not** transfer approval to a new attempt. New physical attempt requires a new request unless a later lifecycle decision proves a narrower safe recovery model.

### Temporary refusal

A temporary/current Gateway refusal before commit must be side-effect-free with respect to approval consumption:

```text
no committed claim
no effect attempt admitted
request remains claimable within validity horizon
```

### Permanent staleness

Deployment/policy governing-pin mismatch is terminal by C-010 and must not resurrect. The exact narrow mechanism is the unresolved C2.3 challenge.

### Post-admission changes

After successful commit:

```text
sealed subject never changes
```

A later 3G/3I decision may permit cancellation/fencing **before physical send**, but may never edit the approved subject or transfer the approval to a different attempt.

---

## C2.13 Claim result must return custody authority, not permission

I accept Fable's strongest result:

```text
claim → exact approved subject
```

not:

```text
claim → true
```

Gateway execution source after approval is the claimed/verifiably sealed subject. Caller-resubmitted args may be used only as non-authoritative correlation/input to locate the operation; they never replace the claimed bytes.

The claim result should minimally provide the information necessary for Gateway to execute and validate without rereading PAR internals:

```text
exact verified effectSubject
approval commitment digest / request identity
stored governing validity pins
request decision/expiry facts needed by the contract
```

Do not return UI card data, model prose, generic policy context, or duplicated derived artifact classification.

---

## C2.14 Buildability / external evidence recheck

The external patterns remain evidence only:

- Stripe demonstrates that idempotent replay can be bound to the original request parameters rather than treated as a generic permission. Its current docs also describe an idempotency error when a key is reused with unexpected/different parameters.
- GitHub Actions environments demonstrate a real protected operation waiting for reviewer approval before the protected job starts.
- AWS Step Functions documents durable callback/task-token patterns and human-approval examples where execution waits and later resumes from a unique token.

These sources support buildability of the mechanism class, not Conexus-specific ownership or transaction ordering.

The actual 3F-03 mechanics remain conventional PostgreSQL/CAS/encrypted-payload design using already-frozen Conexus primitives. No new technology commitment is introduced.

---

## C2.15 Revised minimal model

```text
PREPARE
  PAR → Gateway
  resolve exact non-effecting effectSubject + commitmentNonce
  no external effect

REQUEST
  PAR stores immutable encrypted sealed payload
  = commitmentNonce + effectSubject
  + immutable validity pins/origin metadata
  + approvalCommitmentDigest

DECIDE
  human ALLOW_ONCE | DENY
  mechanical card is projected from verified sealed subject
  card semantics reproducibly pinned by subject/approval schema

CLAIM + ADMIT
  Gateway candidate effectAttemptId
  BEGIN
    PAR narrow CLAIM
      → exact subject + stored pins
      → single-claim binding
      → terminal request-local validity
    Gateway last-mile current admission
    derive units from exact subject
    reserve budget + persist idempotency claims
    persist effect_attempt NOT_SENT
  COMMIT

EXECUTE / RECOVER
  external I/O only after commit
  execute exact claimed subject
  committed request bound permanently to same effectAttemptId
  recovery reuses same request/attempt/subject/idempotency state
```

Plus:

```text
no stored card
no Gateway subject snapshot duplication in F1
no caller-resubmitted executable args
no sticky approval
no approval transfer to new attempt
no silent unit-set widening/narrowing
no general ApprovalService/originator framework
PAR retention horizon covers any live bound attempt
```

One unresolved load-bearing item remains: **monotonic terminal staleness under deployment/policy pin mismatch without broadening the inversion**.

---

## C2.16 Questions for Fable Round 2

Please attack the corrected model rather than restating Round 1.

1. **Monotonic stale:** falsify C2.3. Can Gateway-only comparison after CLAIM satisfy C-010 invalidation without allowing an approval to resurrect if governing pins later return to their old values? If not, is passing equality-comparable `currentValidityPins` into CLAIM the smallest safe mechanism, or is there a smaller single-inversion alternative?
2. **Pin responsibility:** if `currentValidityPins` enters CLAIM, prove that PAR can remain a mechanical equality checker and does not become a second admission/policy authority. Define the maximum admitted content of that parameter; no broad context.
3. **Transaction order:** re-test C2.2 with the monotonic-stale mechanism included. Which checks may happen before CLAIM without deriving budget/unit truth from untrusted args? Which must happen after exact subject recovery?
4. **Attempt preallocation:** attack C2.8. Give a concrete crash/concurrency window that requires a separately durable preallocation before the atomic claim/admission transaction. If none, delete D-7.
5. **Nonce classification:** test C2.5. Is request-specific nonce inside the encrypted sealed payload sufficient to prevent plaintext-digest confirmation while correctly keeping it outside effect semantics? Can an already-required high-entropy field replace it without coupling unrelated identities?
6. **Projector reproducibility:** is one-to-one `approval subject schema/version → card projector semantics` sufficient, or is a separate immutable projector version/digest required to prove what the human saw? Name the failure class.
7. **Subject/pin/origin split:** try to find a current F1 execution-relevant field incorrectly excluded from `EFFECT_SUBJECT`, or a listed subject field that should instead be a pin/derived/origin fact.
8. **Derived fields:** confirm effect classification/idempotency class/approvalFloor/precondition spec can be safely re-derived from the exact artifact/tool revision at claim/admission without violating "execute exactly what human approved".
9. **Origin scope:** find a currently ratified F1 consumer that requires 3F-03 to generalize creation beyond the C-010 PAR path now. Legal import edges alone do not count.
10. **Batch:** attack the rule `one ApprovalRequest = one human decision over one exact subject, possibly 1..N units`. Does any current case require a stronger universal cardinality rule?
11. **Retention:** attack PAR-only recovery. Is the horizon `request non-terminal OR bound attempt non-terminal/recoverable` sufficient for OUTCOME_UNKNOWN/reconciliation and GC, without duplicating subject into Gateway?
12. **Temporary refusal:** confirm a temporary refusal before commit leaves no consumed claim and no terminal request mutation. Identify any current condition that must instead terminalize the request.
13. **Post-admission:** is `subject immutable forever; cancellation maybe before send; never transfer approval to another attempt` sufficient to route revocation to 3G/3I without leaving an authorization hole?
14. **Card/display:** test exact large-unit-set display. Can bounded preview + exact count + full-list-on-demand be considered adequate mechanical projection, or does any current effect require every unit visible inline before approval?
15. **Buildability:** reclassify the corrected model as `PROVEN | CONVENTIONAL | PROBE_REQUIRED | UNSUPPORTED`. Use Mitra/Factory/in-house/primary sources only as evidence. Add no probe unless a real empirical gap exists.
16. **Global Maximum:** re-run against C-010/3D/3E/3F-01/3F-02. If the monotonic-stale solution requires a real amendment/reopening, say so explicitly rather than hiding it.
17. If the model converges after these attacks, propose the smallest operator-facing `3F-03` text. Do not modify authority or `LEDGER.md`.

For every disagreement:

```text
claim challenged
concrete failure class
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

Do not introduce a workflow engine, approval framework, generic originator interface, cross-owner repository, duplicate Gateway custody, or new cryptographic subsystem unless a current failure class makes it unavoidable.

---

# Round 2 — Fable

**Status of this round:** adversarial counter-review / NON-AUTHORITATIVE.
**Method:** C2.x checked against C-007/C-010/C-013/C-014/C-015/C-016/C-017, 3D-02/3D-R1, 3E-01, 3F-01, 3F-02. No claim depends on current Mastra behavior.

## F2.1 Verdict

Convergence reached, with one honest concession on each side of the table. On the load-bearing item: **I could not find a mechanism smaller than equality-comparable `currentValidityPins` in CLAIM** — I attacked three alternatives and each fails with a concrete class (F2.2). The parameter is accepted with three precisions ChatGPT's text glosses, one of which (commit-on-refusal) is required for the mechanism to work at all. I **concede Q4**: D-7 is deleted — my Round 1 argument conflated two different C-013 persist-first obligations (F2.3). I **concede Q9**: scope stays on the C-010 PAR path. I hold one counter-position on Q6 (projector identity — ChatGPT's preferred 1:1 rule is the larger option once counted honestly). **No Material Finding against C-010/3D/3E/3F-01/3F-02.** Draft in F2.11.

## F2.2 Q1 + Q2 + Q3 — Monotonic stale: the pins parameter is the minimum; three alternatives falsified

Resurrection is not theoretical in F1: **C-014 rollback literally re-points to a previous Release**, so a deployment/composition pin can return to a prior exact value through an approved product operation; a reverted policy produces the same snapshot digest. The failure class is concrete.

Alternatives attacked:

```text
B1  Gateway records "request X is stale" in gw.* state
    → mutable mirror of PAR-owned current lifecycle state — expressly
      prohibited by 3E; also splits approval lifecycle truth across owners.
      DEAD.

B2  second reverse capability markStale(requestId)
    → widens the single inversion into two reverse mutation methods; adds a
      compare→mark race window unless folded into the same call anyway —
      at which point it IS the pins parameter with worse geometry. DEAD.

B4  eager push-invalidation: promote/policy-change flows call PAR to
    invalidate governed pending requests at change time
    → monotonic by construction, but correctness depends on ENUMERATING
      every pin-changing path (promote, rollback, policy revision, binding
      change …) and never missing one; a missed path silently reintroduces
      resurrection. Lazy comparison at claim is fail-closed by construction:
      no enumeration exists to get wrong. Eager push also couples Release/L7
      flows to PAR for no gain. DEAD as the primary mechanism.
```

So: lazy, at-claim, equality-only comparison, with the current values supplied by Gateway — **accepted as the global minimum**. Three precisions are required:

**P-1 — Commit-on-refusal.** ChatGPT's text says "record terminal STALE → no claim" but leaves transaction semantics implicit. If the enclosing transaction rolls back on refusal, the STALE record rolls back with it and nothing is monotonic. The contract must state: **on validity-pin mismatch, the transaction commits the terminal invalidation as its outcome** — a committed transaction that admitted no attempt, reserved no budget, and wrote only the PAR-owned terminal fact (plus the C-013 event). A crash before that commit is harmless: detection is deterministic and repeats at the next claim. Monotonicity exists at commit time, and after it, pins returning to old values meet a terminal request — no resurrection.

**P-2 — Contract error ≠ staleness.** The supplied pin map's key set is fixed by the keys stored on the request (chosen by Gateway at PREPARE). A missing or unknown key is a **caller contract error → typed refusal without terminalization** — never a mismatch. Otherwise a Gateway defect (dropped key) would destroy valid human approvals. Only an explicit value mismatch on a stored key terminalizes. Fail-closed in both directions: bugs cannot kill requests, and mismatches cannot pass.

**P-3 — Byte equality only.** PAR compares opaque values byte-for-byte. Nothing else.

**Q2 — boundary proof.** With P-2/P-3 the maximum admitted content of `currentValidityPins` is: *a map pinKey → opaque bytes, keys ⊆ the request's stored validity-pin keys*. PAR's total behavior: byte equality, single-claim binding, expiry check, terminal-fact write on its own entity. PAR cannot answer "which composition is active?", "is this caller eligible?", or "which pins govern this surface?" — it lacks the inputs and the vocabulary. Pin *semantics* live in Gateway twice: at PREPARE (choosing the stored set) and at CLAIM (resolving current values). Terminalizing its own request on observed mismatch is lifecycle bookkeeping of a PAR-owned entity — custody, not admission authority. PAR does not become a second Gateway.

**Q3 — order with the mechanism included.**

```text
before BEGIN (non-authoritative)
  candidate effectAttemptId minted in memory (per C2.8, accepted — F2.3)
  Gateway resolves current validity-pin values (read-only)
  optional advisory fail-fast prechecks — never authoritative

BEGIN
  PAR CLAIM(requestId, attemptId, currentValidityPins, TxScope)
    request-local: decision present, expiry, single-claim
    pin equality → mismatch = commit terminal STALE, no claim (P-1)
    → exact sealed subject + stored pins + decision facts
  Gateway last-mile revocable admission (caller/Connection/eligibility/health)
  derive exact unit set FROM the claimed subject
  reserve budget — all units or none (F2.7)
  persist per-unit idempotency claims (compute once, 3F-01)
  persist effect_attempt = NOT_SENT + approval refs + exact pins
COMMIT

after COMMIT
  external I/O; execute exact claimed subject
```

Everything authoritative sits inside the transaction after subject recovery; nothing derives unit/budget truth from resubmitted args; nothing stays open across I/O.

## F2.3 Q4 — Concession: D-7 deleted

C2.8 is right and my Round 1 argument was wrong in a specific, nameable way: I conflated **C-013's message-admission persist-first** (the durable intent that must exist before a model/dispatch call — in this flow, that durable intent is the ApprovalRequest itself) with **persist-before-effect** (the attempt row must exist before external send — satisfied inside the atomic transaction). Between minting a candidate attemptId and COMMIT, nothing external observes the id: no orphan, no carve-out, no recovery path. Rollback leaves no committed binding, so a retry minting a fresh candidate id is the *first* claim, and the ALLOW_ONCE law phrased as "first successfully **committed** claim binds permanently" covers every window. Concurrency: two candidates race one single-claim row; at most one commits. I searched for a remaining window — crash mid-transaction, crash between resolve-pins and BEGIN, double recovery workers — and every one resolves to either clean rollback or same-request+same-committed-attempt replay. **D-7 is deleted.**

## F2.4 Q5 — Nonce: no existing field can substitute

The substitution test has a hard criterion the candidates all fail: the anti-confirmation value must be **unreadable by the DB-read attacker**, i.e. it must live *only inside the ciphertext*. Every existing high-entropy field is plaintext-addressable in `hub_control` precisely because it is an identity or correlation value: `approvalRequestId` (plaintext row identity — the attacker holds it), run/conversation refs (plaintext correlation), attemptId (does not exist at PREPARE), revision digests (guessable/public within the platform). Reusing any of them as the commitment salt either leaks the salt (defeating the purpose) or couples unrelated identities into the commitment. A dedicated `commitmentNonce` inside the sealed payload is therefore the minimum, and C2.5's classification is right: commitment material, not effect semantics — `digest(canonical(domainTag + commitmentNonce + effectSubject))` with the 3F-01 domain tag. HMAC/keyed hash correctly rejected: it moves the secret into key custody and adds a verification dependency for zero additional protection over an encrypted nonce. Accepted as written.

## F2.5 Q6 — Projector reproducibility: record projector identity as decision evidence; the 1:1 rule is the larger option

```text
claim challenged      C2.6 preference: one-to-one subject-schema → projector
                      semantics, "deletes a second pin"
concrete failure class a display defect ships (timezone renders a payment date
                      wrong; label swaps unit columns). The subject schema did
                      not change, so under 1:1 the projector "identity" did not
                      change either — yet two humans deciding a week apart saw
                      different renderings of the same immutable subject, and
                      the audit question "what did THIS approver actually see?"
                      has no faithful answer. Approved-under-misrender becomes
                      undetectable exactly when it matters (money/ERP effects).
smallest correction   record the projector version/digest as one immutable field
                      on the DECISION record (evidence, per C-013 culture).
                      Reproduction = rerun that pinned projector (git-resolvable
                      code identity) over the immutable subject. No stored card
                      returns; content is still never duplicated.
why 1:1 is larger     enforcing 1:1 means every display fix must bump the
                      subject schema version — contract churn for presentation
                      changes — and STILL cannot answer the audit question when
                      old and new projector coexist across deployment lag.
                      One evidence field is strictly smaller than schema-version
                      coupling plus an unanswerable dispute.
reopen prior authority?  NO
later owner           per-family display schemas → later 3F/3K
```

## F2.6 Q7 + Q8 — Classification survives with one sub-split; derivation guard stated

**Q7.** One imprecision found, no misclassification: `expiresAt` sits in category B but is checked **request-locally by PAR**, while policy/deployment pins are compared **against Gateway-supplied currents**. Split B into:

```text
B1 request-local validity facts   expiry — PAR checks alone
B2 externally-compared pins       policy/deployment/composition — Gateway
                                  supplies current values, PAR compares
```

Without the split, an implementer will either send expiry to Gateway (needless) or invent a current-time pin (absurd). Hunted for missing subject fields: scheduling/mode/environment parameters all land in resolved input or Connection+revision; Project identity stays explicit as cheap cross-project defense (C-015 pattern) even though partially derivable. Nothing else moves.

**Q8.** Confirmed, with the one guard that makes it true: derivation of classification/idempotency class/approvalFloor/precondition SPEC must read the **exact pinned artifact revision named in the subject — never a current revision**. The pin is inside the approved subject, so deriving from it never departs from what the human approved; deriving from anything "current" would. One sentence in the decision text.

## F2.7 Q9 + Q10 + Q14 — Scope conceded; batch accepted with one closing rule; display adequate with one guard

**Q9 — conceded.** No ratified F1 consumer wires app-origin actions into `par.approval_request`: C-010 defined the agent HITL path; C-015 layered `approvalFloor` into admission authority but created no app-origin approval flow. Legal import edges are not consumers — C2.9's discipline is correct and matches how this dialogue has treated every other generalization. 3F-03 freezes the PAR path and states the non-generalization explicitly.

**Q10 — accepted, one loophole closed.** "One ApprovalRequest = one human decision over one exact subject, 1..N explicitly enumerated units" is sufficient; whether N units are one indivisible intent is a product decision made at REQUEST creation, not a runtime ambiguity, so no universal cardinality rule and no BatchApproval framework. The loophole to close sits in admission: with per-unit budgets, a 500-unit subject could pass budget for 400 units — admitting that subset is **planned narrowing through the budget door** (the exact sibling of the D-1 failure class). Rule: **admission is all-units-or-nothing** — if budget/idempotency cannot cover the complete approved set, the entire admission refuses (temporary refusal, side-effect-free). Post-dispatch physical partiality remains receipt truth (PARTIAL/OUTCOME_UNKNOWN, C-013).

**Q14 — adequate, one guard.** Bounded preview + exact count + full list available before decision is the right mechanical projection — forcing 500 inline rows degrades review quality (banner blindness) while adding nothing. The guard: **preview selection must be deterministic and mechanical** (e.g. first-K in a stable declared order + exact total), never a model-chosen "representative sample" — otherwise the preview channel becomes a cherry-picking vector inside the approval card. No current effect requires full inline display.

## F2.8 Q11 + Q12 + Q13 — Retention sharpened; refusal and post-admission confirmed

**Q11.** The horizon as phrased ("non-terminal/recoverable") hides the case that most needs the subject: `OUTCOME_UNKNOWN` is a **terminal state of the attempt machine** (C-013) whose reconciliation happens after termination — and reconciliation compares external reality against *intended effect*, whose only authoritative record is the sealed subject. Make it explicit:

> PAR retains the sealed payload while the request is non-terminal, **or** any bound attempt is non-terminal, **or** any bound attempt is `OUTCOME_UNKNOWN` with reconciliation/settlement not yet concluded.

After settlement, the sealed payload may fall to normal evidence-retention policy (digest + receipts remain; C-016 minimization applies). No Gateway duplication.

**Q12.** Confirmed: temporary refusal consumes nothing, mutates nothing, leaves the request claimable within its horizon. Hunted for a condition that must terminalize at claim beyond pin mismatch and expiry: found none — DENY is already terminal by decision; administrative revocation is a lifecycle decision-class event owned later (3G/3I), not a claim-path outcome.

**Q13.** Sufficient. The one case I probed — reconciliation of `OUTCOME_UNKNOWN` concluding "the effect did not land, re-send" — is covered without a hole: re-send beyond the committed attempt's dispatch is a **new physical attempt**, and the invariant "never transfer approval to another attempt" forces a new ApprovalRequest unless a later 3M/3G reconciliation decision defines something narrower. Fail-closed by construction; no authorization hole.

## F2.9 Q15 — Buildability of the corrected model

Deltas only (Round 1 table stands, including the in-house PROVEN precedent of the MNFS lease core for the atomic-claim class):

```text
equality-compared validity pins + terminal write   CONVENTIONAL (byte compare +
                                                   own-entity state write)
commit-on-refusal transaction outcome              CONVENTIONAL (committing a
                                                   refusal record is standard
                                                   ledger practice; C-013
                                                   admission ledger is the
                                                   in-house design precedent)
projector version as decision evidence             CONVENTIONAL (one field;
                                                   git-resolvable identity)
all-units-or-nothing admission                     CONVENTIONAL (single tx)
deterministic preview                              CONVENTIONAL
```

Nothing `UNSUPPORTED`; **zero new probes** — end-to-end claim/recovery proof stays in planned 3N/3O.

## F2.10 Q16 — Global Maximum

- **C-010:** lazy terminalization implements "invalidated when deployment/policy changes" at the only moment invalidation has authority consequences (authorization). Between the change and the first claim attempt the request is doomed-but-undetected; the UI may show a computed staleness *projection* (Gateway-side, non-authoritative) if product wants it — no authority impact. No reopen.
- **3D:** the inversion remains exactly one reverse capability; one added equality-only parameter does not create a second admission authority (F2.2/Q2 proof); 3D-R1 routed exact signatures to 3F. No reopen.
- **3E:** PAR writes only `par.*` (the terminal fact is its own entity); commit-on-refusal preserves membership/ownership/atomicity; the transaction that commits a refusal admits nothing. No reopen.
- **3F-01/3F-02:** commitment digest is a properly-declared digest domain; STALE/DENY/EXPIRE remain domain outcomes, not T1 failures. No reopen.

**No Material Finding.**

## F2.11 Proposed 3F-03 decision text (smallest operator-facing form)

---

> ### 3F-03 — Approval Claim & ApprovalRequest Contract (DRAFT)
>
> **Decision in one sentence:** the F1 approval contract makes one human decision authorize one exact sealed effect subject, claimable exactly once for one Gateway effect attempt inside one atomic admission transaction, recoverable across process failure from PAR custody alone, monotonically invalidated on governing-pin mismatch, and incapable of silently authorizing altered, widened, narrowed or transferred effects — scoped to the existing C-010 PAR-owned path, with no approval framework.
>
> **1. Scope.** This contract governs the C-010 PAR-owned ApprovalRequest path. It is intentionally not generalized to app-origin or other approval consumers; a materially different consumer returns by Decision Loop. No ApprovalService, originator framework, policy engine or workflow engine.
>
> **2. Flow.** `PAR → Gateway PREPARE` (Gateway compiles the exact executable subject; resolve-only, no ledger writes, no external I/O, persists nothing) → PAR persists one immutable ApprovalRequest → human decides → `Gateway → PAR CLAIM` (the single 3D inversion) inside the atomic admission transaction.
>
> **3. Sealed payload and commitment.** `SealedApprovalPayload = commitmentNonce + effectSubject`, encrypted at rest under PAR custody; `approvalCommitmentDigest = digest(canonical(domainTag + commitmentNonce + effectSubject))` — a request-specific integrity commitment under 3F-01 digest rules (pinned canonicalization), never a cross-request content identity. The nonce is generated at PREPARE, lives only inside the ciphertext, and closes the plaintext-digest confirmation oracle. Claim and display fail closed if the decrypted payload does not verify (L4-class alarm).
>
> **4. Content classification.**
> `EFFECT_SUBJECT` (sealed; any change = new request): Project identity; exact artifact/tool revision; exact Connection + ConnectionRevision where applicable; resolved input after defaults/normalization; the complete explicit target/unit set; final effect content; precondition parameter values captured at PREPARE.
> `GOVERNING_VALIDITY` — **B1 request-local** (expiresAt; checked by PAR; immutable; early termination is a lifecycle fact, extension prohibited) and **B2 externally-compared pins** (policy snapshot digest; governing deployment/composition identity — for AGENT_RUN origin the run-pinned composition per 3D-R1; Gateway supplies current values, PAR compares).
> `ORIGIN_CORRELATION` (immutable metadata, outside the digest): AgentRun/Conversation/execution refs and C-013 provenance.
> `DERIVED_AT_ADMISSION` (excluded copies): effect classification, idempotency class, approvalFloor, precondition spec — re-derived at admission **from the exact pinned revision named in the subject, never from a current revision**. Per-unit idempotency keys are computed once at admission from request/attempt/unit identities and reused verbatim (3F-01). Credential secret material is never subject content; rotation under the same ConnectionRevision does not alter what was approved.
>
> **5. Immutability.** Subject bytes, digest, validity pins, origin and expiry are immutable from creation. Any execution-relevant change requires a new ApprovalRequest. Later writes are decision/lifecycle facts only.
>
> **6. Decision contract.** Client sends `approvalRequestId + ALLOW_ONCE|DENY + expectedRevision (CAS) + optional reason`. Server derives approver principal and scope at the auth boundary (eligibility → 3I); no client echo of subject bytes/digest as authority; unknown/foreign requests are indistinguishable-not-found (C-015 pattern). The decision record stores the **projector version/digest used at display** as immutable evidence.
>
> **7. Approval card.** No stored card. At display: decrypt → verify commitment → project through a versioned, family-specific mechanical projector (no UniversalApprovalCard) → render through the C-010 sanitized/anti-exfil surface. Minimum visible meaning when applicable: effect family, target/Connection/external actor, exact unit count + identities, final content, Project scope, expiry. Large sets: deterministic mechanical preview (stable order + exact total) with the full list available before decision; the authoritative set is never truncated — an oversized set fails at PREPARE, never truncates.
>
> **8. Claim contract.** `claimApprovedSubject(approvalRequestId, effectAttemptId, currentValidityPins, TxScope) → { exact verified subject, commitment digest, stored validity pins, decision/expiry facts } | typed refusal`. `currentValidityPins` is a map pinKey → opaque bytes with keys ⊆ the request's stored B2 keys. PAR performs only: decision/expiry/single-claim checks, byte-equality pin comparison, terminal-fact writes on its own entity. Missing/unknown keys = typed contract error **without** terminalization; value mismatch = **terminal STALE committed as the transaction outcome** (commit-on-refusal: no attempt admitted, no budget reserved, terminal fact + C-013 event committed). After terminal invalidation, pins returning to prior values never resurrect the request. Claim never returns card data, prose, or derived classifications.
>
> **9. Admission transaction.** Candidate `effectAttemptId` minted in memory; Gateway resolves current pin values read-only; then one transaction: CLAIM → Gateway last-mile revocable admission → derive the exact unit set from the claimed subject → reserve budget **all-units-or-nothing** → persist per-unit idempotency claims → persist `effect_attempt = NOT_SENT` with approval refs + exact pins → COMMIT. External I/O only after commit; the executable source is the claimed sealed subject, never caller-resubmitted args. The first successfully **committed** claim binds the request permanently to that attempt: same request + same attempt = replay-safe recovery of the same subject; same request + different attempt = fail-closed; a cancelled/abandoned attempt consumes the approval — no transfer. Temporary/revocable refusals before commit are side-effect-free: nothing consumed, nothing mutated, request claimable within its horizon.
>
> **10. Recovery and retention.** Recovery resumes the same attempt, same stored idempotency keys, same request, same verified subject — from PAR custody; no subject duplication into `gw.effect_attempt` in F1 (one process, one `hub_control`; a future availability split is a named Decision Loop consumer). PAR retains the sealed payload while the request is non-terminal, or any bound attempt is non-terminal, or any bound attempt is `OUTCOME_UNKNOWN` with reconciliation unconcluded; GC of a request with a live bound attempt is prohibited (declared 3F-01 PRESERVE horizon). After settlement, evidence retention governs (digest + receipts persist; minimization applies).
>
> **11. Post-admission.** The sealed subject can never be altered after commit. The only intervention a later decision may add is cancellation of the attempt before physical send (3G/3I, F3D02-R1 family); reconciliation-driven re-send beyond the committed attempt is a new attempt and therefore a new ApprovalRequest unless later 3M/3G authority defines a narrower safe rule.
>
> **12. Outcomes.** DENY / EXPIRE / STALE / AWAITING_APPROVAL are normal domain outcomes consumed as receipts/lifecycle state (3F-02) — never T1 failures. T1 appears only for contract misuse (unknown request, malformed decision, CAS mismatch) via stable codes.
>
> **13. Not built.** `approved:boolean`; reusable/sticky approvals; approval transfer; client-resubmitted executable payloads; editable cards mutating subjects; stored cards; Gateway reads of `par.*` tables; Gateway-created ApprovalRequests; generic ApprovalService/Repository/PolicyEngine/BatchApproval; cross-owner approval↔attempt FK; transactions across external I/O; subject reconstruction from mutable state; keyed-hash commitment subsystem; eager push-invalidation as the staleness mechanism.
>
> **14. Routed onward.** Approval lifecycle FSM, admin revocation, cancellation semantics → 3G/3I; approver eligibility → 3I; reconciliation/re-send → 3M; end-to-end claim/recovery proof → 3N/3O; per-family card display schemas → later 3F/3K; literal type/field names → implementation under this contract.
>
> **15. Buildability disposition.** No mechanism UNSUPPORTED; zero new probes. In-house PROVEN precedent for the atomic-claim class (MNFS lease core: fencing, atomic claim, real crash-recovery); external primary sources (Stripe parameter-bound idempotency, GitHub Actions approval gates, Step Functions durable waits) remain evidence only.

---

**Convergence note to the operator:** with the C2 corrections, my concessions (D-7 deleted; scope narrowed to the PAR path) and the three monotonic-stale precisions plus the projector-evidence field, ChatGPT and Fable are aligned on every load-bearing element. Agreement is not approval (protocol rule 6). The single point where ChatGPT may still wish to push back is F2.5 (projector identity as decision evidence versus 1:1 schema coupling); one short closure round settles it if contested.

No LEDGER or authority file was modified in this round.
