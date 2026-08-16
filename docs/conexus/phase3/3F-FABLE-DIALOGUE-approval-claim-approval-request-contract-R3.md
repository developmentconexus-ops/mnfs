# 3F — ChatGPT ↔ Fable Dialogue — Approval Claim & ApprovalRequest Contract — Round 3

**Status:** WORKING DIALOGUE CONTINUATION / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-03 — Approval Claim & ApprovalRequest Contract`  
**Parent dialogue:** `3F-FABLE-DIALOGUE-approval-claim-approval-request-contract.md`  
**Round 2 continuation:** `3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R2.md`  
**Important:** review/co-design provenance only. This file is not authority, does not approve 3F-03, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

The authority chain, Global Maximum/YAGNI method, evidence-vs-authority discipline and Mastra guardrail remain unchanged.

---

# Round 3 — ChatGPT

## C3.1 Verdict

Fable Round 2 closes the original disagreements on monotonic stale, durable attempt preallocation, scope, batch cardinality, retention and the commitment nonce. I accept the core of F2.2–F2.10.

Before operator arbitration, however, two load-bearing replay details and two smaller ownership/evidence details need one final closure pass. These are not architecture reopenings; they are exact-contract corrections needed so the converged rules do not conflict with one another during crash recovery.

No Material Finding against C-010, 3D, 3E, 3F-01 or 3F-02 is established by this round.

---

## C3.2 First claim and same-attempt recovery are semantically different operations inside one narrow capability

Fable correctly freezes both:

```text
A. first successfully committed claim/admission
   → binds ApprovalRequest permanently to effectAttemptId A

B. same request + same effectAttemptId
   → replay-safe recovery of the same exact subject
```

But F2.11 currently applies `currentValidityPins` comparison as if every invocation were a first claim.

That creates a contradiction after the first successful admission.

### Concrete failure class

```text
ApprovalRequest R approved under composition/policy P1

BEGIN
  CLAIM(R, attempt A, currentPins=P1)
  Gateway admission succeeds
  effect_attempt A = NOT_SENT
COMMIT

process crashes before physical send

while process is down:
  governing policy/deployment changes P1 → P2

recovery invokes:
  CLAIM(R, attempt A, currentPins=P2)
```

If PAR now applies the **first-claim stale rule**:

```text
stored P1 != current P2
→ terminalize ApprovalRequest as STALE
→ refuse subject
```

then recovery cannot even obtain the exact subject of an already-admitted attempt.

That conflicts with:

- the approved same-attempt replay/recovery rule;
- 3F-01's durable exact-subject horizon;
- the routing of **post-admission** policy narrowing/cancellation to 3G/3I (`F3D02-R1` family);
- C2/F2 rule that the subject itself is immutable after admission and only pre-send cancellation may later be introduced.

### Smallest correction

The narrow capability may expose one semantic method/signature, but its behavior must distinguish the durable binding already owned by PAR:

```text
claimApprovedSubject(requestId, effectAttemptId, currentValidityPins, TxScope)
```

#### Case 1 — request not yet bound to any committed attempt

```text
first-claim path
→ validate decision/expiry
→ require exact currentValidityPins key-set
→ byte-compare B2 values
→ mismatch commits terminal STALE
→ match may bind this request to candidate attemptId in the atomic admission transaction
```

#### Case 2 — request already durably bound to THIS SAME effectAttemptId

```text
recovery-replay path
→ return/recover the exact previously claimed subject + commitment + stored pins
→ do NOT re-terminalize the ApprovalRequest from a later current-pin mismatch
→ do NOT transfer approval to another attempt
```

Gateway then applies whatever **current post-admission authority/cancellation rule** exists for that already-admitted attempt. Today that exact rule remains routed to 3G/3I; 3F-03 must not silently decide it by making the subject unrecoverable.

#### Case 3 — request already bound to a DIFFERENT effectAttemptId

```text
fail closed
```

This does not create another method or framework. It is the minimum semantics required for the already-approved `same request + same attempt = recovery` law to actually work.

### Question for Fable

Can you find a smaller rule that both:

```text
prevents pre-admission approval resurrection
AND
allows exact-subject recovery of an already-admitted same attempt after governing pins change
```

without moving post-admission authority into PAR?

If not, accept the first-claim vs recovery-replay distinction explicitly.

---

## C3.3 `currentValidityPins` must have exact key-set equality, not subset semantics

F2.2 P-2 is right in intent:

```text
missing / unknown key
→ contract error
→ no terminalization
```

But F2.11 describes the input as:

```text
keys ⊆ request stored B2 keys
```

Those statements are inconsistent.

If subset is admissible:

```text
stored B2 = { policyDigest, compositionDigest }
caller supplies only { policyDigest }
```

and `compositionDigest` changed, PAR has no value to compare and may let a stale request survive.

Gateway is trusted platform code, not an adversarial client, but the purpose of this contract is to make a dropped comparison mechanically visible instead of silently safe-looking.

### Final rule

On the **first-claim path**:

```text
supplied currentValidityPins.keys
==
stored B2 validity-pin keys
```

exact set equality is required.

Then:

```text
missing key
extra/unknown key
→ typed contract error, no terminalization

same exact key-set + any byte-value mismatch
→ terminal STALE committed as refusal outcome

same exact key-set + all values equal
→ claim may proceed
```

This is stronger and simpler than subset language.

For the **same-attempt recovery-replay path**, C3.2 should determine whether the current pin map is required at all. My current preference is: the call may retain one signature, but PAR ignores current-pin comparison once the request is already bound to that exact attempt; Gateway remains responsible for post-admission checks.

Fable should attack whether requiring a meaningless map on recovery is needless ceremony and whether a discriminated internal request would be smaller than optional parameters. Do not create two public concepts merely for aesthetic purity.

---

## C3.4 Commitment nonce ownership — move generation from PREPARE to PAR sealing unless a failure class requires Gateway ownership

F2.4 proves a dedicated hidden high-entropy nonce is the smallest protection against plaintext-digest confirmation.

I accept the nonce and the commitment model:

```text
approvalCommitmentDigest
= digest(canonical(domainTag + commitmentNonce + effectSubject))
```

But the earlier wording says the nonce is generated at PREPARE.

That appears to put non-semantic custody material into Gateway's effect-resolution result for no gain.

### Ownership test

`commitmentNonce`:

```text
- does not alter physical effect meaning
- is not shown to the human
- is not used by Gateway admission policy
- exists only to protect/verifiably seal PAR-owned encrypted approval custody
```

Therefore the smaller ownership is:

```text
Gateway PREPARE
→ returns exact canonicalizable effectSubject + governing/origin metadata

PAR REQUEST/seal
→ generates commitmentNonce
→ canonicalizes the declared approval commitment domain
→ computes approvalCommitmentDigest
→ encrypts nonce + exact effectSubject as the sealed payload
```

PAR does not reinterpret the subject; it performs deterministic serialization/commitment/custody under the pinned 3F-01 digest profile.

At CLAIM, Gateway receives the exact verified effectSubject and digest from PAR.

### Question for Fable

Is there any current failure class requiring Gateway to generate the nonce during PREPARE? If not, move nonce generation to PAR sealing and keep PREPARE strictly about executable meaning.

This does **not** change who resolves defaults, target, revision, Connection or effect semantics: Gateway remains the only PREPARE authority.

---

## C3.5 Projector evidence — accept separate projector identity, but bind it server-side to the actual decision display contract

I accept Fable's core argument in F2.5.

A one-to-one subject-schema → projector rule is too rigid because a display correction can occur without changing effect-subject semantics. We need evidence of which semantic projector the approver used.

So the decision should record an immutable **projector identity/version/digest**.

However, 3F-03 must prevent this from becoming a client assertion:

```text
client says "I displayed projector X"
→ server records X
```

would not prove what controlled projection was actually served.

### Smallest normative rule

At decision time, the platform records server-derived immutable evidence identifying the **controlled mechanical projector contract/version** used for the ApprovalRequest display.

```text
projector identity
→ not supplied as authority by the client
→ resolvable/reproducible under platform evidence retention
→ bound to the decision record
```

The exact physical source may later be:

```text
projector digest
platform-contract revision
frontend/control-plane deployment pin
or another exact code/content identity
```

but 3F-03 need not choose that technology.

If locale/timezone/formatting context can materially alter the business meaning shown to the approver, the per-family display contract later 3F/3K must either normalize it out or persist the material display context as evidence. 3F-03 should not invent a global `DisplayContext` bag now.

### Important boundary

The approval authority is still the sealed subject. Projector evidence proves what semantic projection was shown; it never becomes executable authority.

---

## C3.6 Batch and all-units-or-nothing — accepted

Fable's closing rule is correct for one exact multi-unit ApprovalSubject:

```text
approved exact unit set
→ budget/idempotency admission is all-units-or-nothing
→ no planned subset admission
```

This closes silent narrowing through budget availability.

Physical execution after admission may still produce honest:

```text
PARTIAL
OUTCOME_UNKNOWN
```

per C-013.

The product decides at REQUEST creation whether one ApprovalRequest represents one unit or one exact multi-unit human decision. 3F-03 does not create `BatchApproval` or a universal batch cardinality rule.

Deterministic preview rule is also accepted:

```text
stable mechanical ordering
exact total
bounded deterministic preview
full exact set available before decision
never model-selected sampling
```

---

## C3.7 Retention horizon — accepted with OUTCOME_UNKNOWN settlement

Final horizon candidate:

PAR retains the sealed ApprovalRequest payload while:

```text
request is non-terminal
OR
any bound attempt is non-terminal
OR
any bound attempt is OUTCOME_UNKNOWN and reconciliation/settlement is not concluded
```

This is the minimum needed because reconciliation may need the intended exact subject after the attempt machine has already reached an `OUTCOME_UNKNOWN` terminal state.

After settlement, normal evidence-retention/minimization policy may apply while digest/receipt/audit evidence remains as separately required.

No Gateway subject duplication in F1.

---

## C3.8 Revised transaction semantics

The contract sequence should now be described as two possible committed outcomes of the claim/admission transaction.

### Outcome A — terminal stale refusal on first claim

```text
candidate attemptId exists only in memory
Gateway resolves exact current B2 pins

BEGIN
  PAR first-claim validation
  exact key-set check
  exact byte comparison
  mismatch → PAR writes terminal STALE + required event
COMMIT

result
→ no approval claim bound
→ no Gateway budget/idempotency/effect_attempt admitted
→ request can never resurrect
```

The caller returns the normal STALE lifecycle/domain outcome after the committed refusal.

### Outcome B — admitted effect attempt

```text
candidate attemptId in memory
Gateway resolves current B2 pins

BEGIN
  PAR first-claim validates + exact pins match + conditionally binds request → attemptId
  PAR returns exact verified effectSubject
  Gateway last-mile checks current caller/Connection/other revocable admission
  Gateway derives exact units from subject
  budget reservation = all approved units or none
  per-unit idempotency claims persisted
  gw.effect_attempt = NOT_SENT + approval refs + exact pins
COMMIT
```

If any Gateway check/write fails:

```text
ROLLBACK
→ PAR binding rolls back
→ request remains claimable unless a separately committed terminal fact already exists
→ no effect attempt admitted
```

### Outcome C — recovery replay of already admitted same attempt

This is not a new approval/admission:

```text
request already bound to attempt A
Gateway needs exact subject after process restart
PAR returns/verifies same sealed subject for A
Gateway resumes from durable attempt/idempotency state
```

Current post-admission policy/cancellation checks belong to Gateway + later 3G/3I rules; PAR does not rewrite approval history based on later pin changes.

Fable should verify whether this recovery replay requires the same `TxScope`/transaction at all, or whether the narrow capability may support a read-equivalent replay over an already-bound attempt without weakening ownership. Do not add a second repository/read interface unless there is a real need.

---

## C3.9 Final non-goals carried forward

Do not introduce:

```text
ApprovalService
ApprovalRepository shared across modules
ApprovalOriginator framework
GenericApprovalCard
DisplayContext bag
UniversalAuthoritySnapshot
Gateway copy of sealed subject
Gateway reads of par.*
second reverse markStale() API
eager push-invalidation as primary correctness mechanism
keyed-hash subsystem
persistent attempt preallocation state
BatchApproval framework
transaction across external I/O
```

---

## C3.10 Closure questions for Fable Round 3

This should be a **short closure pass**, not a redesign.

1. **First claim vs same-attempt replay:** attack C3.2. Is it correct that governing-pin mismatch can terminalize an unbound approval but must not make an already-admitted attempt's exact subject unrecoverable? If not, show the safer smaller rule.
2. **Exact pin key-set:** confirm or falsify exact set equality on the first-claim path. Is any subset semantics legitimate?
3. **Recovery call shape:** does same-attempt recovery need `currentValidityPins`/`TxScope`, or can one narrow capability expose a replay result without a new conceptual API? Prefer minimal semantics over signature aesthetics.
4. **Nonce ownership:** attack PAR-generated commitmentNonce at REQUEST/seal time. Find a real need for Gateway generation or accept the ownership move.
5. **Projector evidence:** verify server-derived projector identity is enough; identify any indispensable material display-context evidence without inventing a generic bag.
6. **Commit-on-stale:** verify terminal STALE can be committed without any Gateway admission writes and without contradicting 3E atomicity/ownership.
7. **All-units-or-nothing:** recheck against budgets/idempotency and effect execution partiality.
8. **Retention:** recheck the OUTCOME_UNKNOWN-until-settlement horizon.
9. **Buildability + Global Maximum:** deltas only. Reopen prior authority only for a concrete Material Finding.
10. If the deltas survive, finalize with:

```text
READY FOR OPERATOR APPROVAL
```

and list only indispensable wording corrections. Do not rewrite the whole architecture without a new failure class.

Do not modify authority or `LEDGER.md`.

---

# Round 3 — Fable

**Status of this round:** closure pass / NON-AUTHORITATIVE. No claim depends on current Mastra behavior.

## F3.1 First claim vs same-attempt replay — C3.2 is a genuine catch; accepted; no smaller rule exists

ChatGPT found a real defect in my F2.11: applying pin comparison unconditionally makes an already-admitted attempt's subject unrecoverable after a pin change — and worse, it would *terminalize the request retroactively*, rewriting approval history for an effect that was already lawfully admitted. That contradicts the recovery law, the 3F-01 durable-subject horizon, and the F3D02-R1 routing all at once.

I searched for a smaller rule than the three-case discrimination and there is none, for a structural reason: **PAR is the only owner of the binding fact**, so PAR is the only place that can mechanically distinguish "unbound request" (pin mismatch may terminalize) from "bound to this attempt" (subject must be recoverable) from "bound to another attempt" (fail closed). Any design that hides the case split either duplicates the binding fact outside PAR (mirror, prohibited) or re-derives it from mutable state (the class this whole contract kills). Accepted, with two sharpenings:

1. **Recovery skips expiry too, not just pins.** Expiry governs claim eligibility *before* admission. If recovery refused on `expiresAt`, a crash near the expiry boundary would strand a lawfully admitted attempt — the identical failure class as pins, through the clock. Case 2 verifies exactly: binding matches this attempt + decision facts + commitment digest integrity. Nothing else.
2. **Case 2 never writes.** Recovery replay of a bound attempt is a read of immutable sealed bytes plus verification — no binding change, no budget, no lifecycle mutation. This feeds F3.3.

## F3.2 Exact key-set equality — accepted; my subset wording was the inconsistency

C3.3 is right and the error was mine: "keys ⊆ stored" contradicts P-2's purpose. Under subset semantics, a dropped comparison is *silently safe-looking* — the precise thing the parameter exists to make mechanically visible. No legitimate subset case exists: Gateway compiled the stored key set itself at PREPARE and can always resupply it completely. Final rule accepted verbatim: exact set equality on the first-claim path; missing/extra key = typed contract error without terminalization; exact set + any byte mismatch = terminal STALE committed; exact set + all equal = proceed.

## F3.3 Recovery call shape — discriminated intent, not a dead parameter; no TxScope on recovery

Requiring a meaningless pin map on recovery is not just ceremony — it is a **hazard**: a future maintainer who "helpfully" compares it reintroduces the C3.2 failure class with a one-line change. The cheapest enforcement is to make the wrong behavior unrepresentable:

```text
one narrow capability, one inversion, discriminated intent:

FIRST_CLAIM   { requestId, candidate effectAttemptId,
                currentValidityPins (exact complete key set), TxScope }
RECOVER_BOUND { requestId, bound effectAttemptId }   # no pins, no TxScope
```

This is not a second public concept or a repository interface — it is one capability whose input type states which of the two already-distinct semantics is being invoked. `RECOVER_BOUND` is read-equivalent (F3.1 point 2): it participates in no transaction, reserves nothing, mutates nothing, and returns the same verified sealed subject + commitment + stored pins. Gateway applies whatever post-admission rule 3G/3I later defines; PAR stays custodian.

## F3.4 Nonce ownership — move to PAR sealing; no failure class needs Gateway generation

Tested for any current need for the nonce to exist at PREPARE: Gateway never uses the nonce for admission; verification at claim recomputes the commitment from the *returned* payload (nonce travels inside it); the human never sees it; and the only integrity window the move opens — subject altered between PREPARE and sealing — is closed end-to-end by the existing design, because the card projects from the *sealed* subject and execution uses the *claimed sealed* subject: whatever was sealed is what the human saw and what runs. PAR sealing (generate nonce → canonicalize under the pinned 3F-01 profile → digest → encrypt) keeps custody material entirely inside the custodian, and PREPARE stays purely executable meaning. Accepted. PAR serializes deterministically under the pinned shared profile; serialization is not interpretation — no authority duplication.

## F3.5 Projector evidence server-derived — accepted

Server-derived projector identity was my F2.5 intent ("the platform records"); C3.5 closes the client-assertion hole correctly and keeps the boundary right: projector evidence proves what was shown, the sealed subject remains the only executable authority. The locale/timezone obligation on later per-family display contracts (normalize material context out, or persist it as evidence) is the right minimum; no DisplayContext bag now.

## F3.6 Commit-on-STALE without Gateway writes — verified against 3E

The stale-refusal commit contains: the PAR-owned terminal fact plus the audit record — which is exactly 3E's approved **transversal audit-required-mutation + OBS atomic class**, not the material-effect-admission class (nothing was admitted). A transaction touching only `par.*` + the OBS sink violates no ownership rule; Gateway orchestrating a transaction in which it writes nothing is legal — TxScope is opaque and ownership is defined by who writes, not who opens. No contradiction with 3E atomicity or membership. Verified.

## F3.7 All-units-or-nothing — rechecked, holds

Budget reservation atomic over the complete approved set regardless of mixed per-unit budget classes; all per-unit idempotency claims persist in the same transaction; recovery never re-reserves (resumes from durable reservation state); post-dispatch physical partiality remains receipt truth (PARTIAL/OUTCOME_UNKNOWN, C-013). No leak found between budget windows and recovery.

## F3.8 Retention horizon — rechecked, holds

The three-clause horizon is the correct **minimum floor**; settlement is terminal under C-013's settlement-by-terminal rule, and post-settlement disputes are served by digest + receipts (bytes-verifiability outliving semantic custody, per 3F-01). Evidence-retention policy may hold the payload longer than the floor; the floor only prohibits GC while the subject is still operationally load-bearing. Accepted as written in C3.7.

## F3.9 Buildability + Global Maximum — deltas only

```text
case-discriminated claim intent      CONVENTIONAL — dispatch on PAR's own stored
                                     binding fact; typed union input
exact key-set equality               CONVENTIONAL — set compare
PAR-side sealing (nonce+digest+enc)  CONVENTIONAL — same pinned profile, same
                                     crypto machinery (C-007), relocated only
server-derived projector identity    CONVENTIONAL — one evidence field
commit-on-stale via 3E transversal   uses an already-approved atomic class
```

Nothing `UNSUPPORTED`; zero new probes. Global Maximum: C3.2's case rule *preserves* C-010 (invalidation governs pre-admission authorization; post-admission narrowing stays routed to 3G/3I exactly as 3D-R1/F3D02-R1 already route it); the discriminated intent keeps the 3D inversion at one capability; 3E membership/ownership verified in F3.6. **No Material Finding. Nothing reopens.**

## F3.10 Closure verdict

```text
READY FOR OPERATOR APPROVAL
```

The converged contract is the F2.11 draft with C3.2–C3.8 applied, plus exactly five indispensable wording corrections:

```text
FW-1  Claim capability input becomes discriminated intent:
      FIRST_CLAIM { exact complete pin map, TxScope } |
      RECOVER_BOUND { no pins, no TxScope, read-equivalent, never writes }.
      Recovery verifies only binding + decision facts + commitment integrity —
      it skips pin comparison AND expiry.

FW-2  §8 of the draft replaces "keys ⊆ stored B2 keys" with exact key-set
      equality (C3.3 final rule: missing/extra key = contract error, never
      terminalization; exact set + byte mismatch = terminal STALE).

FW-3  commitmentNonce generation moves from PREPARE to PAR sealing; PREPARE
      returns executable meaning + governing/origin metadata only.

FW-4  Projector identity recorded at decision time is server-derived platform
      evidence, never client-asserted.

FW-5  Outcome A (terminal stale) names its committed writes explicitly: PAR
      terminal fact + audit-required OBS record (3E transversal class), zero
      gw.* writes.
```

Nothing else. I decline to restyle any converged part.

No LEDGER or authority file was modified in this round.
