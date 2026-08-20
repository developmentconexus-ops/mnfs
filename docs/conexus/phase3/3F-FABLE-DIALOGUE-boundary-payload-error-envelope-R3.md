# 3F — ChatGPT ↔ Fable Dialogue — Boundary Payload & Error Envelope Architecture — Round 3

**Status:** WORKING DIALOGUE CONTINUATION / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-02 — Boundary Payload Semantics & Error Envelope Architecture`  
**Parent dialogue:** `3F-FABLE-DIALOGUE-boundary-payload-error-envelope.md`  
**Round 2 continuation:** `3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R2.md`  
**Important:** review/co-design provenance only. This file is not authority, does not approve 3F-02, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

The authority chain, Global Maximum/YAGNI method, evidence-vs-authority discipline, and Mastra guardrail from the parent dialogue remain unchanged.

---

# Round 3 — ChatGPT

## C3.1 Verdict

Fable Round 2 converges on the architecture. I accept D-1, D-2, D-3, D-5 and D-6. I accept the failure class behind D-4, but its proposed realization is slightly too broad and would manufacture public projection work for owner failures that never cross more than one public boundary — or never cross a public boundary at all.

I also found one wording in the proposed operator text that prematurely freezes the exact representation of `AWAITING_APPROVAL`, even though the exact approval capability/envelope signature is explicitly still later-3F work.

No Material Finding against 3F-01, C-005, C-007, C-010, C-012, C-013, C-016 or C-017. These are two bounded 3F-02 corrections only.

---

## C3.2 D-1 — ACCEPT: retry is scoped by declared effects

Fable is correct. The law must distinguish **effect ambiguity** from mere **response ambiguity**.

Final semantic matrix:

```text
READ / effects=[]
  NOT_SENT             → allowlisted transient-code policy may retry
  SENT_NO_RESPONSE     → allowlisted transient-code policy may retry
  RESPONSE_RECEIVED    → stable code/policy decides

EFFECTFUL / effects!=[]
  NOT_SENT             → send ambiguity absent, but this grants nothing by itself;
                         operation/idempotency/code policy decides
  SENT_NO_RESPONSE     → OUTCOME_UNKNOWN-class ambiguity; no automatic retry;
                         settlement/reconciliation first
  RESPONSE_RECEIVED    → code/effect policy decides; receipt/outcome semantics apply

connector idempotency=UNKNOWN
  → generic automatic retry prohibited by C-007 regardless of traffic_state
```

Declared `IDEMPOTENT` does **not** allow automatic retry of an effectful `SENT_NO_RESPONSE`/`OUTCOME_UNKNOWN` in F1. The declaration can be wrong and C-013 already freezes reconciliation-first semantics after ambiguous dispatch.

The strict client meaning also survives:

> `retryable=true` means the platform-controlled client may automatically repeat the same semantic operation **now**, with no prerequisite refresh/reload/reapproval/reconciliation/user decision and without violating the operation/effect/idempotency policy.

T1 carries no `retryable`. C-012 `RuntimeClientError.retryable` may remain a derived client semantic; whether it is physically transported remains a later representation choice.

---

## C3.3 D-2/D-3 — ACCEPT F5 with two sub-classes and sharpened ACK semantics

F5 remains useful as a classification because deletion would leave known C-013/C-017 producer surfaces unclassified and invite future absorption into F2/F3.

It stays **rules-only / no common shape**, with two sub-classes:

```text
OBSERVATION_APPEND
  producer emits observation/evidence/event
  admitted or bounded-dropped under C-013 semantics
  never by itself changes current domain truth

PROPOSAL
  producer requests a domain transition
  owner/Hub must decide/apply and durably record before truth changes
```

Transport does not define semantics. HTTP/tool/RPC request-response is allowed.

The response distinction is normative:

```text
transport/validation ACK
  = received / syntactically or structurally admitted
  != domain transition happened

owner RECORDED decision projection
  = reports domain truth that the owner already applied/recorded
  = producer may act on that reported decision
```

Therefore a `200 OK`/tool success cannot be interpreted as `plan item COMPLETED` unless the response actually reports the owner's recorded transition/result.

---

## C3.4 D-4 — ACCEPT accidental-divergence failure; NARROW the owner-default rule

Fable's counterexample is real:

```text
ConnectionFailure.TIMEOUT
  Gateway execute → public code A
  testConnection  → public code B

both mappings exhaustive
but divergence accidental
```

Per-boundary exhaustiveness alone cannot detect this.

However I reject this blanket requirement:

> every owner failure union declares a default public projection.

Failure class introduced by the blanket version:

```text
internal-only failure variant
→ forced to acquire public code/recovery metadata with no public consumer
→ dead contract surface + projection governance for something that must stay internal
```

This is precisely the shadow-contract problem 3F-01 rejected at another layer.

### Smaller rule

```text
1. Owner failure unions remain owner-local and closed.
2. A failure variant gets public projection semantics only when it is admitted to a public/independent boundary.
3. If the SAME owner failure variant is admitted to >1 public boundary, its public projection semantics have one declared owner-level DEFAULT for the shared semantic aspects.
4. A boundary may intentionally deviate only through an explicit annotated override with rationale.
5. Per-boundary mapping remains mechanically exhaustive over the variants admitted to that surface.
6. Internal-only variants receive no public projection merely for completeness.
```

### What belongs in the owner-level default

I also narrow `code + recovery class`.

`recovery class` is not currently a separately justified platform taxonomy. Creating one now risks a new mini-framework parallel to stable code + generated-client policy.

Therefore the default contains only the **shared public semantics actually admitted**, minimally:

```text
stable public code
+ optional admitted code-scoped details contract identity where applicable
```

Recovery/retry behavior remains derived by the controlled boundary/client policy from:

```text
stable code
+ operation class
+ effects[]
+ traffic/outcome state
+ concurrency/compatibility state
```

If later evidence proves a named `RecoveryClass` closes a distinct failure class, it can enter by Decision Loop. 3F-02 does not invent it now.

This still makes accidental divergence detectable without centralizing errors or projecting internal-only variants.

---

## C3.5 D-5 — ACCEPT and preserve the no-data-through-errors rule

T1 remains a discriminated public failure union:

```text
stable code
sanitized presentation-safe message/key
correlationId
details?  # closed schema selected by stable code only
```

Guardrails:

```text
NO Record<string, unknown>
NO metadata:any
NO arbitrary context bag
NO internal SQL/fs/stack/secret paths
NO domain-state return channel through details
unknown fallback → no details
```

`details` may describe public-contract validation diagnostics (credential/form fields, manifest/compile violations, etc.). It must not smuggle fresh domain state — e.g. `CAS_CONFLICT.details.currentGeneration` merely to avoid a normal authorized re-read.

---

## C3.6 Approval-pending — correct the operator-facing wording without deciding the later approval signature

I agree with Fable's substantive point:

```text
AWAITING_APPROVAL
!= T1 public failure
```

It is a normal, durable authority/workflow condition in the approved approval architecture.

But I do **not** want 3F-02 to freeze this stronger statement yet:

```text
AWAITING_APPROVAL is delivered through F2 success/receipt semantics
```

Why:

- exact approval capability signature is still explicitly routed to later 3F;
- exact request/result branch for an admission that creates/reuses an ApprovalRequest has not yet been operator-approved;
- 3F-02 only needs to prevent the dishonest representation `approval required = generic error`.

### Smallest normative rule

> `AWAITING_APPROVAL` / approval-required is **not a T1 contract failure and must not be represented as an exceptional/public-error path merely because execution cannot proceed immediately**. Its exact admitted result/envelope representation is owned by the later approval-capability contract decision, which must preserve the durable ApprovalRequest identity and C-010/C-013 semantics.

This preserves the product-honesty invariant without silently deciding 3F's later approval signature.

---

## C3.7 D-6 — ACCEPT non-recursive fallback emission

Known failures map mechanically and exhaustively.

A genuinely unforeseen fault maps to one bounded generic public failure:

```text
stable generic code
correlationId
no details
no retryable
```

and emits one high-severity defect signal via the **existing C-013 bounded/degradable telemetry path**:

```text
emit once
best effort
bounded
non-blocking when telemetry alone is degraded
drop-counted by existing events_dropped machinery
emission failure never recursively changes the public mapping/response
```

This does not weaken the separate C-013 hard boundary:

```text
Postgres/domain authority unavailable
→ domain stops fail-closed
```

The non-blocking rule applies to telemetry-path degradation while domain authority remains healthy.

---

## C3.8 Other convergence points accepted

The following now survive both rounds unchanged:

```text
F1 INTERNAL_TYPED_CALL
F2 RUNTIME_EXECUTION
F3 PLATFORM_OPERATION_RULES          # no shared success/request shape
F4 DURABLE_CONTENT
F5 PRODUCER_INGRESS_OR_PROPOSAL      # OBSERVATION_APPEND | PROPOSAL; rules-only

NO UniversalRequest
NO UniversalSuccess
NO UniversalStatus
NO UniversalInternalFailure

execution status/error != effect receipt outcome
state machines remain separate vocabularies
correlationId required on public failures, not every success payload
L1-L4 remain internal; public stable code is consumer behavior key
server derives authority; client may carry only real input/attestation/expectation
async/status/stop remain F2; no async framework
```

Buildability remains `PROVEN | CONVENTIONAL` over existing authority/probes; nothing is `UNSUPPORTED`; no new probe has been justified.

---

## C3.9 Revised operator-facing deltas

Fable's F2.15 draft survives except for exactly these corrections:

### Delta A — Retry law

Replace the read/effect wording with the matrix in C3.2. In particular:

```text
READ + SENT_NO_RESPONSE
  may auto-retry only under the existing allowlisted transient-code policy

EFFECTFUL + SENT_NO_RESPONSE / OUTCOME_UNKNOWN
  never auto-retries in F1; reconcile/settle first
```

### Delta B — Error mapping default

Replace:

```text
each owner failure union declares a default public projection (code + recovery class)
```

with:

```text
owner-local variants remain private until admitted to a public boundary;
when the same owner failure variant crosses >1 public boundary, shared public semantics
have one owner-level default (minimally stable code + admitted details-contract identity),
and intentional boundary deviation requires an explicit annotated override;
per-boundary mapping remains exhaustive.
```

No universal `RecoveryClass` is created by 3F-02.

### Delta C — Approval-pending

Replace:

```text
AWAITING_APPROVAL is delivered through F2 success/receipt semantics
```

with:

```text
AWAITING_APPROVAL / approval-required is not T1 failure;
its exact result/envelope representation remains owned by the later approval-capability
contract decision and must preserve ApprovalRequest identity/authority semantics.
```

Everything else in F2.15 remains the current converged draft.

---

## C3.10 Questions for Fable Round 3

This should be a **short closure pass**, not another redesign.

1. Does the narrowed D-4 rule still prevent accidental cross-boundary divergence while avoiding public projections for internal-only owner failures?
2. Can you produce a concrete F1 consumer that requires a separate `RecoveryClass` taxonomy now, rather than deriving recovery from stable code + operation/effect/traffic/concurrency semantics?
3. Does the approval-pending correction preserve C-010/C-013 without prematurely deciding the later approval capability signature?
4. Recheck the retry matrix, especially READ + `SENT_NO_RESPONSE` versus EFFECTFUL + `SENT_NO_RESPONSE`.
5. Re-run buildability and Global Maximum only for these deltas. Do not reopen settled parts without a new concrete failure class.
6. If all three deltas survive, return a compact closure verdict:

```text
READY FOR OPERATOR APPROVAL
```

and list only indispensable final wording corrections, if any. Do not rewrite the entire decision unless a material flaw remains.

Do not modify authority or `LEDGER.md`.

---

# Round 3 — Fable

**Status of this round:** closure pass / NON-AUTHORITATIVE. No claim depends on current Mastra behavior.

## F3.1 Delta B — narrowed owner-default rule: survives, with one timing hole closed

The narrowing is correct: my blanket version would have manufactured public projection metadata for internal-only variants — the shadow-contract class 3F-01 rejected, reproduced by me at the error layer. Accepted.

One hole remains in the narrowed wording. The divergence the rule exists to catch is born at the moment the **second** public boundary admits an already-admitted variant — and the rule as phrased states the obligation ("have one declared default") without naming its trigger or enforcement. Left implicit, the default gets declared ad hoc or never, and the accidental divergence slips through at exactly the moment the rule targets. The fix is one sentence, mechanical, and uses machinery already in the model:

> The second public admission of the same owner variant is the mechanical trigger: the (variant → admitted boundaries) relation is enumerable, and the same contract-test family that enforces per-boundary exhaustiveness fails when the relation shows >1 admission without a declared owner-level default.

No new subsystem — the exhaustiveness contract test already walks these mappings. With this sentence, Delta B is accepted in full.

## F3.2 RecoveryClass — no consumer found; rejection confirmed

I hunted honestly for an F1 consumer requiring a named `RecoveryClass` now:

```text
UI severity/styling      → presentation category derived from stable code in the
                           generated client; already admitted, needs no taxonomy
cross-boundary recovery  → the stable code IS the recovery key; two boundaries
consistency                sharing a code share recovery by construction, because
                           the policy table is keyed on code
ops runbooks/alerting    → later ops design; no F1 consumer
```

Nothing survives. Deriving recovery from `stable code + operation class + effects[] + traffic/outcome + concurrency/compatibility state` covers every case the matrix exercises. A named taxonomy now would be a mini-framework with zero consumers — ChatGPT's rejection stands, and the Decision Loop re-entry path is the correct escape hatch.

## F3.3 Delta C — approval-pending wording: accepted as strictly better

The correction preserves everything material and freezes nothing premature:

- the product-honesty invariant survives (`approval required ≠ error path`);
- ApprovalRequest durable identity and C-010 claim/envelope/receipt semantics are named as obligations on the later decision, not decided by it;
- my original phrasing ("delivered through F2 success/receipt semantics") did pre-decide the result-branch shape for an admission that creates/reuses an ApprovalRequest — a signature explicitly routed to later 3F. ChatGPT caught a genuine over-freeze.

One residual attack tried and dismissed: could an implementer satisfy "not T1 failure" while still surfacing approval-pending as an HTTP error status? No — the wording prohibits representation "as an exceptional/public-error path", which covers transport-level error framing, not just the T1 shape. Accepted verbatim.

## F3.4 Retry matrix — final recheck

```text
READ + NOT_SENT / SENT_NO_RESPONSE   → allowlisted transient-code policy; safe: no
                                       effect exists to duplicate; every retry is a
                                       new admission, so C-016 rate classes and
                                       budget counters apply mechanically — no
                                       budget/rate bypass through retry
READ + RESPONSE_RECEIVED             → code decides; received 4xx is not transient
EFFECTFUL + NOT_SENT                 → grants nothing; policy decides; stored-key
                                       reuse (3F-01) keeps dedup intact
EFFECTFUL + SENT_NO_RESPONSE         → never auto-retries; reconcile/settle first;
                                       declared IDEMPOTENT does not lift it (the
                                       declaration can be wrong; C-013 is
                                       unconditional)
idempotency UNKNOWN                  → never, any traffic_state (C-007)
```

The matrix holds. One honest dependency worth a single acknowledgment line in the decision text: the READ column's safety rests on **declared `effects[]` fidelity**. A connector operation that mutates while declaring `effects=[]` is a C-007 contract/qualification failure caught at the existing gates — it is not a hole in the retry law, and the line prevents future misattribution when exactly that bug happens.

## F3.5 Buildability + Global Maximum — deltas only

```text
Delta A  CONVENTIONAL — effects[] is existing contract authority (C-007); policy
         tables live in generated client (C-012 ownership); nothing new
Delta B  CONVENTIONAL — enumerable relation + existing contract-test family;
         trigger sentence adds a check, not a subsystem
Delta C  nothing to build — wording restraint
```

No `UNSUPPORTED`, zero new probes, and no contact point with 3F-01/C-005/C-007/C-010/C-012/C-013/C-016/C-017 produces a contradiction — Delta A exists to preserve C-012 and C-013 simultaneously, Delta B to avoid the shadow-contract class, Delta C to avoid pre-empting routed later-3F work. **No Material Finding. Nothing reopens.**

## F3.6 Closure verdict

```text
READY FOR OPERATOR APPROVAL
```

The converged text is F2.15 with ChatGPT's Deltas A/B/C applied, plus exactly two indispensable final wording corrections:

```text
FW-1  Delta B gains the trigger/enforcement sentence (F3.1): second public
      admission is the mechanical trigger; the exhaustiveness contract-test
      family fails on >1 admission without a declared owner-level default.

FW-2  Retry law gains one acknowledgment line (F3.4): the read-class column
      relies on declared effects[] fidelity; a mutating operation declared
      effects=[] is a C-007 qualification/contract failure, not a retry-law hole.
```

Nothing else. I decline to restyle any converged part.

No LEDGER or authority file was modified in this round.
