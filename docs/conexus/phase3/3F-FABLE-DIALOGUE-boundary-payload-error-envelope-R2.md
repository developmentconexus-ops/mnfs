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

**Status of this round:** adversarial counter-review / NON-AUTHORITATIVE.
**Method:** parent dialogue Round 1 + this file's C2.x checked against 3F-01, C-005/C-007/C-010/C-012/C-013/C-016/C-017. No claim depends on current Mastra behavior.

## F2.1 Verdict

The C2.12 model is one correction away from convergence. I accept C2.2, C2.4, C2.6, C2.7 (with one addition), C2.8, C2.9, C2.10, C2.11. I accept the **direction** of C2.5 but found that ChatGPT's traffic-state correction, as written, over-corrects: it now blanket-prohibits automatic retry on `SENT_NO_RESPONSE` for **read-class operations**, where no effect ambiguity exists and C-012 already authorizes allowlisted transient retry. Symmetric to the flaw ChatGPT found in my Round 1 rule — each of us over-generalized once. The fix is mechanical: scope the prohibition by declared `effects[]`. Five smaller sharpenings follow. **No Material Finding against 3F-01, C-005, C-012, C-013, C-016 or C-017.** Convergence text proposed in F2.15.

## F2.2 Disagreements

### D-1 — The `SENT_NO_RESPONSE` prohibition must be scoped by declared effects (attacks C2.5)

```text
claim challenged      "SENT_NO_RESPONSE / OUTCOME_UNKNOWN → automatic retry prohibited",
                      stated without operation-class scope
concrete failure class an integration READ (connector query, no effects[]) that times out
                      after send has NO outcome ambiguity that matters — nothing was
                      mutated anywhere. Blanket prohibition turns every transient read
                      timeout into a surfaced failure, degrading UX with zero safety
                      gain, and CONTRADICTS C-012's frozen allowance ("queries retry
                      only for allowlisted transient codes" — a timeout is the
                      canonical allowlisted transient)
smallest correction   key the prohibition on the operation's declared effects (C-007
                      effects[]): effectful operation + SENT_NO_RESPONSE/OUTCOME_UNKNOWN
                      → automatic retry prohibited, settlement/reconciliation first
                      (C-013). Read-class operation (empty effects[]) → retry governed
                      by the allowlisted-code policy regardless of traffic_state.
                      NOT_SENT stays exactly as ChatGPT corrected it: removes send
                      ambiguity, grants nothing, policy decides. Declared-idempotent
                      external effects do NOT escape the prohibition in F1 — the
                      declaration can be wrong, and C-013's no-auto-retry on
                      OUTCOME_UNKNOWN is unconditional; retry there is offered as a
                      human/reconciliation action, not automatic.
reopen prior authority?  NO — this correction exists precisely to avoid contradicting
                      C-012/C-013 simultaneously
later owner           none; the effects[] key is already authority (C-007)
```

Full case matrix under the corrected rule, answering C2.13-4:

```text
query / read, NOT_SENT              → retry per allowlisted code (safe, no send happened)
query / read, SENT_NO_RESPONSE      → retry per allowlisted code (safe, no effect exists)
query / read, RESPONSE_RECEIVED     → code decides (a received 4xx is not transient)
idempotent effect, NOT_SENT         → policy may admit automatic retry (no ambiguity)
idempotent effect, SENT_NO_RESPONSE → OUTCOME_UNKNOWN; automatic retry prohibited;
                                      reconciliation; retry reuses stored idempotency
                                      key (3F-01) if later admitted
non-idempotent effect, NOT_SENT     → policy decides; key reuse still applies
non-idempotent effect, SENT_NO_RESP → prohibited, reconciliation only
UNKNOWN-idempotency connector op    → generic automatic retry prohibited (C-007
                                      fail-closed), any traffic_state
```

The strict `retryable=true` definition in C2.5 remains coherent under this scoping — in every prohibited cell the strict definition already evaluates to false; the scoping only prevents the prose rule from prohibiting cells where the strict definition evaluates to true.

### D-2 — F5 stays, with two named sub-classes (answers C2.13-1)

Deletion fails: a lone negative rule ("F2/F3 never absorb C-013/C-017 surfaces") classifies nothing — every future producer surface would be argued from scratch, and the baseline matrix needs a family label for these rows. But ChatGPT's single bucket does combine two things authority treats differently:

```text
OBSERVATION_APPEND   events/telemetry/evidence: admitted or bounded-dropped;
                     never a domain transition; OBS is never current domain
                     truth (3E frozen)
PROPOSAL             complete_requested, SHARE/checklist block, KnowledgeProposal,
                     finding proposal: exists to REQUEST a transition; always
                     crosses an owner decision point (mechanical CAS check or
                     human gate) before domain truth changes; NO AUTO MERGE
                     (C-011), prose never interpreted (C-013)
```

Concrete failure each way: treating a proposal as an observation auto-applies it — the self-write/MINJA class C-011 rejects; treating an observation as a proposal demands decision lifecycle for telemetry — pure ceremony. Smallest correction: F5 keeps ChatGPT's seven rules and gains two sub-class labels with one distinguishing rule each. No new shapes, no reopen.

### D-3 — "Transport ACK ≠ authority" needs one sharpening (answers C2.13-2)

I accept request/response transport for F5 — the semantic-authority framing is right. But "ACK/result ≠ domain truth" conflates two responses:

```text
transport/validation acknowledgement ("received, well-formed")
  → NEVER evidence the transition happened
response reporting the owner's RECORDED decision ("applied as revision N /
  rejected: stale expectedRevision")
  → a report of domain truth that already exists; the producer may act on it
```

Concrete failure class if unsharpened: a worker treats HTTP 200 (received) as "checklist item applied" and proceeds — exactly the silent-consumption class C-013's CAS/expectedRevision machinery exists to prevent. One sentence fixes it: *an F5 response may carry the owner's recorded decision; only that recorded decision, never the acknowledgement itself, reports domain truth.* No F1 consumer is harmed by the transport permission once this line exists.

### D-4 — Per-boundary exhaustiveness misses accidental divergence; add owner-default projection (answers C2.13-6)

I accept rejecting a global internal failure union — I never wanted one; per-owner closed unions were my Round 1 intent. But ChatGPT asked for the accidental-divergence construction, and it exists:

```text
ConnectionFailure.TIMEOUT
  mapped by Gateway execute boundary   → code A, treated transient
  mapped by testConnection boundary    → code B, treated terminal
both mappings individually exhaustive → divergence invisible
```

That is the Marketplace #7 class (same concept, different boundary behavior by accident) reborn one level up. Smallest correction, deliberately not a framework: **each owner failure union declares a default public projection (code + recovery class); a boundary that deviates must do so explicitly (annotated override)**. Divergence then becomes greppable and reviewable instead of silent. Per-boundary exhaustiveness stays; no central error module; intentional divergence (rule 5 of the parent §6) remains possible — it just stops being free.

### D-5 — Two guardrails on T1 `details` (extends C2.4, answers C2.13-3)

I accept the code-discriminated closed-branch rule and the field-path sanitization guardrail. Two additions from hunting more consumers:

1. **`details` is never a data-return channel.** Tempting counterexample found and rejected: putting the current generation into a `CAS_CONFLICT` failure so the client can retry without re-reading. That would smuggle domain reads through the error path, bypassing the read authority path (C-005 queries / C-015 enforcement). The client re-reads through the normal path. The rule generalizes: details describe the failure, never deliver domain state.
2. **A second real consumer exists**, so the mechanism is not single-purpose: compile/promote validation diagnostics (MANIFEST_INVALID family) — the operator UI needs the list of violations, all expressible as public-contract identifiers. Field validation is therefore not the only consumer; the discriminated rule covers both without widening.

Related clarification worth one line in the decision text: **approval-pending is never a T1 failure.** An action that lands on `approvalFloor` produces `AWAITING_APPROVAL` — a durable domain outcome (C-010), delivered through the F2 success/receipt semantics, never through the failure projection. A client that error-toasts a normal HITL flow is a product-honesty bug.

### D-6 — Fallback defect emission must be declared non-blocking (answers C2.13-11)

C2.7's defect event is right but under-specified for the degraded-observability case. The recursion risk is real: failure → emit defect event → OBS degraded → emission error → failure… The complete answer already exists in frozen C-013 machinery — 3F-02 only needs to bind to it:

```text
fallback emission uses the C-013 bounded, non-blocking sink
  buffer full → drop + events_dropped coalescing (frozen mechanism)
  emission failure NEVER propagates into the mapping/response path
  no synchronous OBS dependency on the error path
  the sanitized public failure returns to the caller regardless
Postgres down is a different, already-decided case: domain STOPS fail-closed
  (C-013 hard boundary) — the fallback rule governs telemetry degradation
  with a healthy domain, exactly the boundary C-013 froze
```

Minimum non-recursive behavior: emit-once, best-effort, bounded, drop-counted. Nothing new to build.

## F2.3 Confirmations (compact answers to the remaining C2.13 questions)

- **Q5 — RuntimeClientError:** yes, `retryable` can remain a derived client property. C-012 preserves the *field on the client error type*; nothing in authority mandates a wire boolean. The generated client (GENERATED/PLATFORM-CONTRACT ownership) computes it from stable code + closed policy tables shipped with the client, which version with the release pin — consistency is automatic. Wire transport of the boolean stays a later representation choice. No reopen.
- **Q7 — two-level collapse:** no counterexample found. A purely local atomic action still returns a receipt whose outcome is trivially SUCCEEDED (and atomic ops never PARTIAL, C-013) — uniform shape, no collapse needed. Queries carry no receipt at all; dataMeta is their honesty channel. Separation is universal for effectful F2 branches only, as C2.6 states.
- **Q8 — machine merge candidates:** none survive. The closest pair — C-005 envelope terminal status × C-013 attempt terminal states — must stay separate: sharing the enum couples the wire discriminant to the admission ledger, so a ledger-state addition (PENDING_CAPACITY-class) would leak into every client type. Projection with a defined mapping, never a shared vocabulary.
- **Q9 — correlation on success:** re-hunted, still nothing. F5 acks correlate by the producer's own event identity (idempotency keys are the correlation); F3 mutations by domain id + audit record. Transport request ids stay non-contractual diagnostics.
- **Q10 — locus on wire:** final attempt failed. The only plausible client use — generic severity/styling — is served by a presentation category derivable from stable code in the generated client. Locus stays internal; code→locus 1:1 table remains the auditability mechanism.

## F2.4 Buildability reclassification (C2.13-12)

| Element | Class | Evidence |
|---|---|---|
| F1 / F3-rules / F4 | CONVENTIONAL / PROVEN as per 3F-01 round 3 | unchanged |
| F2 two-level semantics | PROVEN base + CONVENTIONAL amendments | Mitra registry execution in production; C-005/C-012/C-013 chain |
| F5 + sub-classes | CONVENTIONAL; machinery frozen by C-013/C-011/C-017 | CX-OBS-V0-01 items already probe conformance/dedup/anti-forge |
| T1 + discriminated details | CONVENTIONAL | TS discriminated unions; MNFS 52-code closed taxonomy (executed practice); Mitra response envelope + defensive normalizer |
| T2/T3/T4/T5/T6 | unchanged from parent R1F.4 | — |
| strict retryable + policy tables in generated client | CONVENTIONAL | enforcement point is GENERATED code we control (C-012 ownership classes) |
| owner default projection + explicit override | CONVENTIONAL | declarative table + lint/grep; failure class it closes is measured (Marketplace #7) |
| non-blocking fallback emission | PROVEN by design-reuse | C-013 bounded buffer/events_dropped is frozen design; CX-OBS-V0-01 item i probes the telemetry×Postgres boundary |

Nothing UNSUPPORTED. **Zero new probes.**

## F2.5 Global Maximum re-run (C2.13-13)

Checked every correction against 3F-01, C-005, C-012, C-013, C-016, C-017: D-1 exists to *preserve* C-012 and C-013 simultaneously; D-2/D-3 protect C-011/C-013 semantics; D-4 is a convention, no authority contact; D-5 restates C-010; D-6 binds to frozen C-013 machinery. No contradiction, no hidden choice, no superior global alternative found — a universal envelope, global status enum, or central error module would each recreate a failure class this model closes. **No Material Finding. No reopening proposed.**

## F2.15 Proposed 3F-02 decision text (smallest operator-facing form)

---

> ### 3F-02 — Boundary Payload Semantics & Error Envelope Architecture (DRAFT)
>
> **Decision in one sentence:** Conexus F1 represents boundary payloads through five closed families and six conditional traits — with no universal request, success, or status envelope, no universal internal failure union, sanitized code-keyed public failures, mechanically-scoped retry semantics, explicit separation of execution success from effect outcome, and no unification of the platform's frozen state machines.
>
> **1. Families.**
> `F1 INTERNAL_TYPED_CALL` — native owner/domain types; no wire wrapper (3F-01 INTERNAL restated).
> `F2 RUNTIME_EXECUTION` — the C-005/C-012/C-013 discriminated family preserved without structural rewrite; async `executeAsync/status/stop` stays inside it; `status()` projects authoritative states without reinterpretation.
> `F3 PLATFORM_OPERATION_RULES` — rules-only, defined negatively: operation-specific typed input; named exported operation-specific success payload; T1 on failure; authority derived server-side. No shared success field exists; proposing one re-enters the Decision Loop.
> `F4 DURABLE_CONTENT` — own versioned schema + 3F-01 horizon/mode; never wrapped in transport envelopes.
> `F5 PRODUCER_INGRESS_OR_PROPOSAL` — rules-only classification with two sub-classes: `OBSERVATION_APPEND` (evidence/events; admitted or bounded-dropped; never a domain transition; OBS never current domain truth) and `PROPOSAL` (requests a transition; always crosses the owner's decision point — mechanical CAS or human gate — before domain truth changes). Producer-supplied identity is never trusted from payload; Hub stamps authoritative context; C-013 producer_trust/idempotency/append semantics preserved. F5 may travel over request/response transport; an F5 response may carry the owner's recorded decision, and only that recorded decision — never the acknowledgement itself — reports domain truth.
>
> **2. Public failure projection (T1).** `stable code + sanitized presentation-safe message/key + correlationId`, plus an optional `details` branch **discriminated by stable code with a closed schema per code** — never `Record<string, unknown>`. Details describe the failure and are never a data-return channel (no domain state smuggled through errors); public field paths may reference only public-contract fields (C-016). No `locus` and no `retryable` on the projection. Unknown/fallback failures carry no details. `AWAITING_APPROVAL` is a domain outcome delivered through F2 success/receipt semantics — never a T1 failure.
>
> **3. Conditional traits.** T2 ExecutionIdentity only where an execution object exists (domain identity beats minted identity). T3 Correlation: required on every public failure; successes correlate through execution/domain identity; transport request ids remain non-contractual diagnostics. T4 CompatibilityAttestation only at admitted mixed-version boundaries. T5 DataMeta per C-012 data-bearing semantics. T6 EffectTrafficState only for external effects/ambiguity, layered per C-016: `traffic_state` always on integration-effect failures; sanitized provider status only under `RESPONSE_RECEIVED`; naming the external actor as the failing party requires `RESPONSE_RECEIVED` (mechanically enforced at the projection/generated-client layer).
>
> **4. Retry law.** `retryable = true` means: the platform-controlled client may automatically repeat the same semantic operation **now**, with no prerequisite refresh/reload/reapproval/reconciliation/user decision. Scope by declared `effects[]` (C-007): effectful + `SENT_NO_RESPONSE`/`OUTCOME_UNKNOWN` → automatic retry prohibited, settlement/reconciliation first (declared idempotency does not lift this in F1; retry there is a human/reconciliation action); `NOT_SENT` removes send ambiguity and grants nothing — closed policy decides; read-class operations retry per allowlisted transient codes regardless of traffic_state; `UNKNOWN`-idempotency connector operations never auto-retry. Retry of an admitted attempt reuses the stored idempotency key (3F-01). Retry policy lives in generated/platform client code and closed policy tables versioned with the release; `RuntimeClientError.retryable` (C-012) is a derived client semantic, not wire authority; refresh-then-retry cases (`CAS_CONFLICT`, `CLIENT_OUTDATED`) are expressed by their stable codes.
>
> **5. Error mapping law.** Each semantic owner keeps its own closed typed failure union — no `UniversalInternalFailure`. Each owner union declares a **default public projection** (code + recovery class); boundary deviations are explicit, annotated overrides — accidental cross-boundary divergence for the same internal cause is prohibited and detectable. Mapping over the known failure set admitted to a surface is mechanically exhaustive (unmapped variant = compile/contract-test failure). Genuinely unforeseen faults map to one bounded generic public code with correlationId, no details, no retryable, plus a high-severity defect event emitted through the C-013 bounded non-blocking sink — emission failure never propagates into the response path, telemetry degradation never blocks the sanitized failure, and Postgres-down remains the separate fail-closed domain stop C-013 froze. A generic-fallback hit is a platform defect signal, never normal behavior.
>
> **6. Two-level semantics and non-unification.** Envelope status/error = execution level; receipt outcome = effect level (`FAILED`/`PARTIAL`/`OUTCOME_UNKNOWN` legitimately appear inside the success branch; atomic operations never PARTIAL; queries carry dataMeta, not receipts). The error branch never encodes effect failure. C-005 envelope status, C-013 attempt state, C-012 `RequestState<T>`, receipt outcome, checklist state, promotion state and the SERVED_VERIFIED ladder remain distinct vocabularies projected without reinterpretation — F1 has no universal Status enum.
>
> **7. Request law.** No universal request envelope. Server derives: principal/session, workspace/project/app scope, roles/capabilities, deployment/release selection, Gateway idempotency identity. May travel: operation input, `runtimeContractDigest` attestation, `expectedGeneration`/`expectedRevision` expectations (expectations to test, never permission), ApprovalRequest identity + decision input.
>
> **8. Failure locus.** L1–L4 stay off the wire; later 3F maintains the mechanical `public code → exactly one locus` table.
>
> **9. Non-goals F1.** UniversalRequest/UniversalSuccess/UniversalStatus envelopes, universal internal failure union, error framework/registry service, locus on wire, generic retry boolean as authority, async/command framework, field-level DTO inventory, technology/schema-library selection, generic rate-limit detail object without its concrete code/consumer.
>
> **10. Routed onward.** Literal stable codes, per-code details schemas, code→locus table, exact wire shapes → later 3F; async status projection → 3G/3H; F5 wire realization → 3H; DEDICATED exchange shape → later 3F/3I; technology qualification → 3L.
>
> **11. Buildability disposition.** No mechanism UNSUPPORTED; zero new probes — F5 and fallback machinery bind to frozen C-013 design already covered by CX-OBS-V0-01.

---

**Convergence note to the operator:** with D-1..D-6 applied, ChatGPT's C2.12 model and this round agree. Agreement is not approval (protocol rule 6). The draft above is ready for arbitration; if ChatGPT contests D-1's effects[] scoping or D-4's default-projection rule, one short Round 3 should settle it before the text goes to the operator.

No LEDGER or authority file was modified in this round.
