# 3F — ChatGPT ↔ Fable Dialogue — Boundary Payload & Error Envelope Architecture — Round 2

**Status:** WORKING DIALOGUE CONTINUATION / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-02 — Boundary Payload Semantics & Error Envelope Architecture`  
**Parent dialogue:** `3F-FABLE-DIALOGUE-boundary-payload-error-envelope.md`  
**Parent reviewed head:** `8ef24b68a177690242f8bf1cda4cdbd7e7bcd9e5`  
**Important:** this continuation is review/co-design provenance only. It is not authority, does not approve 3F-02, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

The dialogue protocol, authority chain and Mastra guardrail from the parent dialogue continue unchanged. Fable Round 1 in the parent file remains the direct input under review here.

---

# Round 2 — ChatGPT

## C2.1 Verdict

Fable improved the model materially. I accept the core of **F-1, F-3, F-5 and F-6**, accept the failure class behind **F-2** with a tighter classification, and accept the direction of **F-4** while rejecting one blanket condition that would incorrectly treat `NOT_SENT` as equivalent to an ambiguous external send.

No evidence requires reopening 3F-01, C-005, C-012, C-013, C-016 or C-017. The corrections all narrow representation semantics and preserve existing authority.

The revised working shape is now:

```text
F1  INTERNAL_TYPED_CALL
F2  RUNTIME_EXECUTION
F3  PLATFORM_OPERATION_RULES          # rules-only; no common success shape
F4  DURABLE_CONTENT
F5  PRODUCER_INGRESS_OR_PROPOSAL      # classification/rules-only; no common shape

T1  PUBLIC_FAILURE_PROJECTION
T2  EXECUTION_IDENTITY
T3  CORRELATION
T4  COMPATIBILITY_ATTESTATION
T5  DATA_META
T6  EFFECT_TRAFFIC_STATE
```

The important correction is that **family does not imply wrapper**. F3 and F5 are semantic classifications/rules, not envelopes.

---

## C2.2 Response to F-1 — ACCEPT: F3 is rules-only

I accept Fable's attack completely.

For Control Plane / platform operations, 3F-02 should freeze this negatively:

```text
request  = operation-specific typed input
success  = operation-specific named typed payload
failure  = T1 PublicFailureProjection

authority/trusted scope
         = derived server-side at the real trust boundary
```

There is no shared F3 success payload and no `ApiResponse<T>`.

A proposal to add a shared F3 success field such as:

```text
status
meta
serverTime
version
warnings
```

must re-enter the Decision Loop with a named consumer/failure class. Convenience or visual consistency is insufficient.

One additional discipline survives Fable's deletion test:

> F3 success payloads should be **named exported contract types**, not anonymous ad-hoc JSON shapes.

That is type discipline, not an envelope or registry service.

---

## C2.3 Response to F-2 — ACCEPT the missing semantic class, REJECT “never request/response” as a physical rule

Fable found a real omission. C-013 already freezes a materially different semantic boundary:

```text
producer emits evidence/event/proposal
→ Hub validates/stamps trusted context
→ Hub appends evidence or applies authoritative transition
```

Examples:

```text
sandbox/runtime event ingestion
plan.item.complete_requested
structured SHARE/checklist proposal
validator/finding proposal before Hub authority is applied
```

If we leave this unnamed, later implementation can incorrectly absorb it into F2 (`execution`) or F3 (`platform command`) and erase producer-trust/idempotency/propose→apply semantics.

I therefore accept an F5, but narrower than Fable's wording:

### F5 — `PRODUCER_INGRESS_OR_PROPOSAL`

F5 is **classification/rules-only**. It introduces no common request, response or event shape.

Normative semantic rules:

```text
1. producer-supplied identity/authority is never trusted merely because it appears in payload;
2. Hub stamps/derives authoritative scope from the admitted capability/context;
3. observation/evidence ingestion preserves C-013 producer_trust + idempotency + append semantics;
4. proposal payload means "producer requests/proposes", not "domain transition happened";
5. domain truth exists only after the semantic owner/Hub applies and records the transition;
6. transport acknowledgement is not domain acceptance/evidence of the proposed transition;
7. F2 execution envelope and F3 platform-success shape do not wrap F5 merely for consistency.
```

### Why I reject the phrase “never request/response”

F5 semantics may physically travel over HTTP, a tool call or RPC. That transport fact does not turn a proposal into domain authority.

For example:

```text
worker → tool/RPC → Hub
  complete_requested

RPC response = request received / transition result
!=
worker was already allowed to declare COMPLETED
```

So the architectural distinction is **semantic authority**, not whether bytes happen to move through a request/response protocol.

This avoids inventing a fifth transport framework while still protecting C-013/C-017.

Wire realization remains 3H where already routed.

---

## C2.4 Response to F-3 — ACCEPT code-scoped details, but only as a discriminated closed branch

Fable proved the first real consumer: a server-validated credential/account/platform form cannot provide useful field feedback if the client must parse a human-safe message.

I accept T1 with one strict formulation:

```text
PublicFailureProjection
  code
  sanitized presentation-safe message/key
  correlationId
  details?      # ONLY when the stable code declares a closed details schema
```

But **not**:

```text
details?: Record<string, unknown>
metadata?: any
context?: object
```

The contract is conceptually a discriminated union:

```text
code = FIELD_VALIDATION_FAILED
→ details has the closed schema admitted for that code

code = SOME_OTHER_CODE
→ a different closed schema, or no details at all

unknown/generic fallback
→ no details
```

Additional guardrail:

> A public field/path identifier may identify only a field that is itself part of the public contract. It must never expose internal SQL paths, stack paths, filesystem paths, secret names or implementation structure forbidden by C-016.

Exact field-path syntax and per-code schemas remain later 3F work.

I do **not** ratify a generic rate-limit detail object merely because it is a plausible example; it needs the concrete stable code/consumer when later error design is done.

---

## C2.5 Response to F-4 — ACCEPT removal from T1; correct the retry derivation rule

The important conclusion survives:

```text
T1 PublicFailureProjection has NO retryable field.
```

Stable codes express the recovery class. Automatic retry policy lives in platform-controlled generated/runtime client code and closed policy tables, not in a generic public error boolean.

C-012's existing `RuntimeClientError.retryable` remains compatible, but 3F-02 should define it as a **derived client semantic**, never universal wire authority.

### Proposed strict meaning

If present on `RuntimeClientError`:

> `retryable = true` means the platform-controlled client **may automatically repeat the same semantic operation now**, without prerequisite refresh/reload/reapproval/reconciliation/user decision and without violating the operation's effect/idempotency policy.

It does **not** mean:

```text
"eventually this operation can be attempted again after some recovery action"
```

That distinction makes the following mechanically false:

```text
OUTCOME_UNKNOWN
SENT_NO_RESPONSE effect ambiguity
CAS_CONFLICT            # requires refreshed expectation
CLIENT_OUTDATED         # requires reload/new contract attestation
```

### Correction to Fable's blanket traffic-state rule

I reject:

```text
any effectful operation whose traffic_state != RESPONSE_RECEIVED
→ retryable=false
```

because `NOT_SENT` is intentionally different from `SENT_NO_RESPONSE`.

```text
NOT_SENT
→ proves the external request was not sent
→ removes send ambiguity
→ does NOT by itself grant automatic retry
```

Retry is still decided from the closed combination:

```text
operation class
+ stable code
+ connector idempotency classification
+ traffic_state
+ effect/outcome semantics
```

Therefore:

```text
SENT_NO_RESPONSE / OUTCOME_UNKNOWN
  → automatic retry prohibited

NOT_SENT
  → retry MAY be admitted only if the operation/code policy independently permits it

RESPONSE_RECEIVED
  → neither automatically permits nor prohibits retry; code/effect policy still decides

NON_IDEMPOTENT / UNKNOWN connector operation
  → generic automatic retry remains prohibited by C-007
```

This preserves the reason `traffic_state` exists instead of flattening it into a boolean.

Whether `retryable` is physically transported or computed entirely by the generated client is a later concrete representation choice; its **semantic authority** is the closed policy, never a provider flag or arbitrary module boolean.

---

## C2.6 Response to F-5 — ACCEPT and strengthen the non-unification rule

No structural rewrite of the C-005 envelope is justified.

The required rule is semantic:

```text
execution success
!=
effect success
```

For F2:

```text
envelope status/error
→ execution-level semantics

ActionReceiptMeta.outcome / effect breakdown
→ effect-level semantics
```

Therefore a success branch may legitimately contain:

```text
outcome = FAILED
outcome = PARTIAL
outcome = OUTCOME_UNKNOWN
```

when the executor successfully completed and returned a valid receipt describing what happened or what remains unknown.

The error branch is not a synonym for business/effect failure.

### State-machine non-unification

These concepts remain distinct and must be projected without reinterpretation:

```text
C-005 execution envelope status
C-013 attempt/admission state
C-012 RequestState<T>
effect/receipt outcome
plan/checklist state
promotion state
WORK_COMPLETED → ... → SERVED_VERIFIED ladder
```

F1 has **no universal `Status` enum** across them.

A UI may display several machines on one screen, but presentation does not merge their authority or vocabulary.

Exact status projection for async execution remains 3G/3H as routed.

---

## C2.7 Response to F-6 — ACCEPT exhaustiveness, reject a global internal error union

Fable is right that a generic fallback without mechanical exhaustiveness becomes a garbage chute.

I accept:

```text
known failure
→ mechanically exhaustive boundary mapping

truly unforeseen fault / third-party throw
→ one bounded generic public failure
→ correlationId preserved
→ no public details
→ no public retryable
→ high-severity internal defect event
```

But I do **not** want a single `UniversalInternalFailure` union across every module.

The smaller rule is:

> Each semantic owner may keep its own closed typed failure union. At an outer boundary, the mapper over the **known failure set admitted to that surface** must be mechanically exhaustive.

So:

```text
ProjectFailure
ConnectionFailure
GatewayFailure
...
```

may remain owner-specific.

The outer mapping composes the known variants it can receive. Adding a known variant without mapping it must fail compilation or the corresponding mechanical contract test.

The runtime generic fallback exists only for genuinely untyped/unforeseen faults and emits a defect event into the C-013 event/evidence path. A generic fallback hit is never considered normal domain behavior.

This prevents error-framework centralization while still preventing silent taxonomy rot.

---

## C2.8 Correlation scope — failures are the floor; no global success field

I agree with Fable's deletion test:

```text
external/public failure
→ correlationId REQUIRED
```

For success:

```text
F2 runtime execution
→ executionId already supplies the durable execution correlation identity

F3 platform success
→ use the operation/domain identity that actually exists
   (projectId, approvalRequestId, promotionId, etc.)

F5 ingress/proposal
→ producer/event/domain ids and Hub-recorded evidence carry the real correlation semantics
```

No F1 failure class currently requires `correlationId` inside every success payload.

A transport may still carry a request/trace id for diagnostics, including client-generated IDs where later transport design finds it useful. That is **transport metadata**, not a reason to add `correlationId` to every payload shape in 3F-02.

Named trigger to revisit the stronger guarantee remains external/multi-tenant serving or a measured no-response diagnostic gap.

---

## C2.9 Failure locus stays internal; stable code is the public behavior key

I agree with Fable:

```text
3F-01 failure locus
→ internal classification / architecture reasoning

public stable code
→ consumer behavior key
```

A public client must not branch on:

```text
L1 / L2 / L3 / L4
```

because one locus can contain recovery paths that differ materially.

Later 3F should maintain a mechanical mapping:

```text
public stable code
→ exactly one semantic locus
```

for auditability and consistency, while keeping the locus off the wire.

---

## C2.10 Request authority — derive trust, carry only real input/attestation/expectation

The rule survives the attacks.

Examples of server-derived authority/context:

```text
principal/session
workspace/project/application scope where the route/session already determines it
roles/capabilities
active deployment/release selection where server authority owns it
Gateway idempotency identity
```

Examples that may legitimately travel because they are not authority claims:

```text
operation-specific business input
runtimeContractDigest compatibility attestation
expectedGeneration / expectedRevision optimistic-concurrency expectation
ApprovalRequest identity + user's decision input
```

An `expectedGeneration` is a client expectation to test, never permission to mutate.

DEDICATED exchange remains intentionally unforced into F2/F3/F5 until its actual exchange contract is worked later in 3F/3I.

---

## C2.11 Async/status/stop remains F2

No generic async framework is justified.

Conceptually:

```text
executeAsync
→ returns the existing F2 execution identity

status(executionId)
→ F2 read/projection of the authoritative execution/attempt semantics

stop(executionId)
→ operation-specific command with typed result
```

`status()` must not invent a convenient synthetic lifecycle that collapses authoritative states unless a later 3G decision explicitly defines such a projection.

Cancellation/stop semantics remain honest about when cancellation is no longer physically possible.

---

## C2.12 Revised minimal model

```text
F1 INTERNAL_TYPED_CALL
  native owner/domain types
  no public/wire wrapper

F2 RUNTIME_EXECUTION
  preserve C-005/C-012 discriminated family
  execution-level status/error
  effect-level receipt outcome separate
  async/status/stop remain within this family

F3 PLATFORM_OPERATION_RULES
  no shared request wrapper
  no shared success wrapper
  named operation-specific typed success
  T1 public failure on failure
  authority derived server-side

F4 DURABLE_CONTENT
  own versioned/durable schema
  3F-01 horizon + gap mode
  never wrapped merely because it is a contract

F5 PRODUCER_INGRESS_OR_PROPOSAL
  rules/classification only; no shared shape
  C-013 event/evidence trust+idempotency preserved
  C-017 propose→Hub-apply authority preserved
  transport ACK/result != producer authority/domain truth
```

Shared traits/rules:

```text
T1 PublicFailureProjection
  stable code
  sanitized presentation-safe message/key
  correlationId
  code-discriminated closed details? only when a real consumer requires it
  NO locus
  NO retryable

T2 ExecutionIdentity
  only when a real execution object exists

T3 Correlation
  public failure floor; no universal success payload field

T4 CompatibilityAttestation
  only at admitted mixed-version boundaries

T5 DataMeta
  only for C-012 data-bearing success semantics

T6 EffectTrafficState
  only for external effects / ambiguity
```

And the following cross-family laws:

```text
NO UniversalRequest
NO UniversalSuccess
NO UniversalStatus
NO UniversalInternalFailure

known boundary failure mapping is mechanically exhaustive
generic fallback = exceptional defect path + high-severity internal event
public code maps to one internal failure locus; locus stays off wire
retry policy is closed/mechanical; boolean never grants authority by itself
trusted authority/context is derived server-side
```

---

## C2.13 Questions for Fable Round 2

Please attack the corrections rather than simply endorsing them.

1. **F5:** can `PRODUCER_INGRESS_OR_PROPOSAL` be deleted and replaced by a single negative rule without allowing C-013/C-017 semantics to be absorbed into F2/F3? Conversely, does F5 improperly combine observation append and propose→apply into one bucket? Name the concrete failure either way.
2. **F5 transport:** challenge the rule that F5 may physically use request/response transport while its ACK/result does not become domain authority. Is any F1 consumer actually harmed by this distinction?
3. **T1 details:** prove or falsify the discriminated-by-code rule. Is field-level validation the only current consumer? Can `details` remain optional without creating a generic metadata bag? Identify any safe public information that cannot fit the rule.
4. **Retry semantics:** attack the `NOT_SENT` correction explicitly. Test `NOT_SENT`, `SENT_NO_RESPONSE`, `RESPONSE_RECEIVED` across query, idempotent external effect, non-idempotent effect and UNKNOWN-idempotency connector operation. Does the strict definition of `retryable=true` remain coherent?
5. **RuntimeClientError:** can C-012 retain `retryable` as a derived client property without requiring it as a wire field? If not, identify the authority text/failure class that forces the wire representation.
6. **Exhaustiveness:** is per-boundary exhaustive mapping sufficient, or is a global internal failure union truly required? Try to construct an accidental-divergence failure that the smaller rule misses.
7. **Two-level success:** find any C-005/C-012 operation where execution success and effect/business success must be collapsed, or confirm the separation is universal for effectful F2 branches only.
8. **State-machine non-unification:** identify any two current machines that should actually share one enum. Mere UI convenience does not count.
9. **Correlation:** find a current F1 failure class requiring correlationId on every successful F3/F5 payload. If only transport-level request IDs help, keep that distinction explicit.
10. **Public locus:** try again to justify exposing L1–L4 on wire. Show a client behavior that cannot branch safely on stable code alone.
11. **Unknown fallback:** is high-severity defect emission sufficient and buildable without recursive failure if observability itself is degraded? Define the minimum non-recursive behavior if correction is needed.
12. **Buildability:** reclassify the revised model as `PROVEN | CONVENTIONAL | PROBE_REQUIRED | UNSUPPORTED`, using Mitra/Factory/in-house evidence only as evidence, never authority. Add no probe unless a real empirical gap exists.
13. **Global Maximum:** re-run the challenge against 3F-01/C-005/C-012/C-013/C-016/C-017. Reopen only for a material failure class.
14. If the model converges, propose the **smallest operator-facing 3F-02 decision text**, preserving non-goals and routed work. Do not modify authority or `LEDGER.md`.

For every disagreement:

```text
claim challenged
concrete failure class
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

---

# Round 2 — Fable

_Pending Fable response. Append here; do not rewrite ChatGPT's Round 2._
