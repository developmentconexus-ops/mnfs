# 3F — ChatGPT ↔ Fable Dialogue — Boundary Payload & Error Envelope Architecture

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-02 — Boundary Payload Semantics & Error Envelope Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Important:** this file is a review/co-design channel only. It is not authority, does not approve 3F-02, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Dialogue protocol

1. Reconstruct authority from `AGENTS.md` and the current authority chain before treating this file as input.
2. Immediate 3F intake:
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3F-01-contract-surface-classification-versioning-boundary.md`;
   - C-005 / C-012 / C-013 / C-016 where envelope, metadata, observability and sanitized-error semantics are already authority.
3. `3F-FABLE-*` files remain NON-AUTHORITATIVE review/provenance.
4. Previous decisions are current baseline, not dogma. Reopen only for a material Finding with a concrete failure class and a globally better correction.
5. Do not invent a universal envelope, API framework, mediator or route inventory without a named current consumer.
6. If a claim depends on current Mastra behavior, verify it under the existing Mastra guardrail. This Round 1 introduces no such claim.
7. Do not modify `LEDGER.md` or approved authority while this dialogue is unresolved.
8. No product implementation, merge or PR readiness.

Goal:

> Find the **smallest representation rules that keep boundary semantics honest and composable**, without wrapping every internal call or durable record in a generic response object.

---

# Round 1 — ChatGPT

## 1. Starting point from approved authority

3F-01 already separates:

```text
live surfaces
  INTERNAL | INDEPENDENT

durable representations
  admitted only by D1/D2/D3

version-gap modes
  PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD

failure loci
  DOMAIN_OR_AUTHORITY_REJECTION
  CONTRACT_INVALID
  STALE_EXPECTATION
  DURABLE_INTERPRETATION_FAILURE
```

It also explicitly rejects wire/version ceremony for internal module boundaries.

C-005 already has a concrete runtime execution family:

```text
{ executionId, status, error?, output }
```

with a discriminated result, global serialization for runtime values, stable typed errors and execution/revision provenance.

C-012 extends that **specific family** for frontend-visible artifacts:

```text
success
  + output validated against outputSchema
  + dataMeta when required

RuntimeClientError
  preserves code / phase / retryable / executionId
```

C-016 adds a security invariant for externally visible errors:

```text
internal stack / SQL / headers / paths / secrets do not cross the Gateway
external error = typed error + correlation ID
full detail remains server-side/redacted trace
```

and integration-effect errors additionally carry traffic semantics:

```text
NOT_SENT | SENT_NO_RESPONSE | RESPONSE_RECEIVED
```

C-013/C-016 already make `OUTCOME_UNKNOWN` an effect-ledger/outcome concept, not a generic contract error.

The design problem is therefore **not** “invent an envelope”. We already have several valid shapes. The problem is to decide what is genuinely shared and what must remain boundary-specific.

---

## 2. Three approaches to falsify

### Approach A — One universal envelope everywhere

```text
ApiResponse<T> {
  ok
  data
  error
  correlationId
  executionId
  version
  meta
}
```

Apply to internal module calls, browser APIs, Gateway execution, approvals, DEDICATED exchange and perhaps durable representations.

**I reject this as the starting point.** It conflates at least four unrelated questions:

```text
transport success/failure
execution lifecycle
observability correlation
business/data metadata
```

and would recreate ceremony 3F-01 explicitly rejected.

### Approach B — Completely bespoke representation for every boundary

Every boundary decides request/result/error independently with zero common semantic obligations.

This avoids abstraction, but creates the opposite failure class:

```text
same platform concept acquires incompatible meanings across surfaces
correlation becomes optional by accident
errors leak internals in one boundary but not another
OUTCOME_UNKNOWN may be represented as generic failure in one client
stale vs invalid vs authority rejection get conflated
```

I also reject this extreme.

### Approach C — Boundary families + narrowly admitted semantic traits

**Current recommendation.**

A boundary owns its actual payload. Shared semantics are attached only when a current failure class requires them.

```text
BOUNDARY-SPECIFIC CONTRACT
+
small semantic traits where applicable
```

This keeps existing C-005/C-012 shapes intact while preventing them from becoming a universal wrapper.

---

## 3. Candidate contract families

I currently see four F1 families. Fable should try to delete or split them.

### Family F1 — Internal typed call

Examples:

```text
L7 → Project
Release → Registry
Builder → Gateway
Gateway → approval capability
```

Properties:

- TypeScript/domain types only;
- no wire envelope;
- no correlation ID parameter merely for ceremony;
- no serialized error wrapper;
- owner-defined typed failures/results;
- mapping to an externally visible representation happens only at the real outer boundary.

This is the default for `INTERNAL` surfaces from 3F-01.

### Family F2 — Runtime execution contract

Existing authority from C-005/C-012.

Conceptually:

```text
execution request
→ admission/execution
→ discriminated runtime result
```

Carries only semantics the execution really has:

```text
execution identity
terminal/non-terminal execution status where applicable
output OR error branch
execution/revision provenance
conditional dataMeta
conditional ActionReceiptMeta / traffic semantics where applicable
```

This family covers registered query/action/job/integration execution and published-runtime usage where C-005/C-012 already require it.

It must **not** automatically wrap Control Plane CRUD or every L7 call.

### Family F3 — Platform request/response boundary

Candidate for Control Plane browser ↔ Hub and similar independent platform surfaces that are not artifact execution.

Minimal hypothesis:

```text
request-specific payload
→ success payload specific to operation
OR
sanitized typed failure projection
```

Do not assume `executionId`, `status`, `output` or `dataMeta` unless the operation actually has those semantics.

Question under test: does this family need any shared success envelope at all, or can success remain the operation payload while only failures share a projection?

### Family F4 — Durable content contract

Examples:

```text
agent/v1
connector/v1
brain/v1
ReleaseManifest
ApprovalRequest exact envelope
binding/config revisions
backup manifest
```

These are not request/response envelopes. They have their own typed/versioned shape and 3F-01 compatibility horizon/mode.

Do not wrap them in `ApiResponse`, `RuntimeResult` or transport metadata merely because they are contracts.

---

## 4. Candidate semantic traits — deliberately small

### T1 — PublicFailureProjection

Apply when a failure crosses an `INDEPENDENT` boundary to browser/app/external consumer.

Minimum candidate semantics:

```text
stable code
sanitized human-safe message OR presentation key/category
correlationId
```

Possible but **not yet accepted as universal fields**:

```text
phase
parameter/path
retryable
locus
executionId
```

Rationale:

- C-016 already requires typed error + correlation ID and forbids internal detail leakage;
- stable code is needed for deterministic client behavior;
- exact message localization/presentation is a later product concern;
- the 3F-01 failure locus may be an internal classification and does not automatically belong on the wire.

### T2 — ExecutionIdentity

Attach only when the operation has a durable/observable execution identity.

```text
executionId
```

Examples: registered artifact execution, async job/run where authority already defines an execution identity.

Not for ordinary `GET project`, `rename workspace`, `list releases`, etc. unless a real execution object exists.

### T3 — Correlation

Potentially overlaps T1 but is conceptually different:

```text
correlationId
```

It exists to connect a public failure/request to server-side evidence without leaking internals.

Question: should correlation be guaranteed only on external failures (C-016 minimum), or on every independent request/result? A global requirement on success may add noise without closing a failure class.

### T4 — CompatibilityAttestation

Attach only when 3F-01 found a real mixed-version expectation.

Examples:

```text
runtimeContractDigest
artifact kind/vN
pinned revision/digest
```

Never add `version` generically to every request.

### T5 — Provenance / Data Metadata

`dataMeta` remains conditional to the C-012 data-bearing success family.

```text
provenance
sourceAsOf
retrievedAt
rowCount
coverage
...
```

This is business/data honesty metadata, not generic transport metadata.

### T6 — EffectTrafficState

Only for external effects where send/outcome ambiguity matters:

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

and receipts may separately say:

```text
SUCCEEDED
FAILED
OUTCOME_UNKNOWN
```

Never collapse this into generic `error.retryable`.

---

## 5. Main suspicion: a generic `retryable: boolean` may be unsafe

C-012 already preserves `retryable` in `RuntimeClientError`, but authority also says:

```text
queries retry only for allowlisted transient codes
actions do not get generic retry
OUTCOME_UNKNOWN never auto-retries
traffic_state changes what is safe
```

Therefore I do **not** want 3F-02 to interpret `retryable=true` as a universal permission to retry.

Candidate correction:

> `retryable` may exist as a boundary-specific derived hint where authority already defines it, but **retry authority is always determined by operation class + stable code + effect/traffic semantics**, never by a global boolean alone.

Fable should try to prove this too weak or unnecessary.

---

## 6. Candidate error mapping rule

Errors originate with the semantic owner but are projected at the actual boundary.

```text
module/domain failure
→ typed internal failure
→ outer boundary maps it
→ public stable code + sanitized projection
→ correlationId links to internal evidence
```

Rules under test:

1. internal module failures do not carry browser/public DTOs inward;
2. internal stack/SQL/vendor headers never cross the Gateway/platform boundary;
3. public code is stable enough for client branching;
4. public error code does not need to reveal module name/implementation;
5. one internal cause may map to different public codes on different surfaces when consumer semantics genuinely differ — but accidental divergence is prohibited;
6. unknown/unclassified public failure fails closed into a bounded generic code, preserving correlation, rather than serializing arbitrary exception text.

I deliberately do not yet define the literal generic code or code naming scheme.

---

## 7. Candidate success-shape rule

Current recommendation:

> **There is no universal success envelope in F1.**

Success representation belongs to the boundary family:

```text
internal call
→ native typed result

runtime execution
→ C-005 discriminated execution result

Control Plane operation
→ operation-specific success payload

durable content
→ its declared content schema
```

We add wrapper fields only when the operation has a real execution/version/provenance concern.

Deletion test:

If we removed a platform-global `data`, `meta`, `status`, `success`, `timestamp` wrapper, I cannot identify an F1 failure class that appears. Therefore such a wrapper should not exist.

---

## 8. Candidate request-shape rule

Similarly:

> **No universal request envelope.**

Boundary-specific request owns its input. Cross-cutting authority must be derived from the trusted boundary rather than accepted as arbitrary payload fields.

Examples already consistent with prior authority:

```text
projectId/appId/deployment derived server-side where required
principal/session resolved at real auth boundary
runtimeContractDigest may be supplied as compatibility attestation where required
idempotency key semantics are Gateway-owned, not a random client field everywhere
```

This prevents the generic-envelope anti-pattern:

```text
{ userId, workspaceId, projectId, role, permissions, version, data }
```

where untrusted clients accidentally send authority claims.

---

## 9. Surfaces to classify concretely in 3F-02

Fable should test at least:

| Surface | Candidate representation family |
|---|---|
| internal module → module | F1 internal typed call |
| L7 orchestration → modules | F1 |
| Capability Gateway runtime execute | F2 runtime execution |
| published app → runtime execute | F2 + CompatibilityAttestation + conditional DataMeta |
| Control Plane browser → Hub administration/query | F3 platform boundary |
| approval capability internal call | F1, carrying a durable ApprovalRequest ref/envelope where needed |
| ApprovalRequest durable content | F4 |
| DEDICATED identity/authority exchange | likely independent family; **do not force into F2/F3 yet** — exact shape remains later 3F/3I |
| adapter → vendor SDK/API | vendor-owned independent boundary; adapter maps vendor failures into our owner/boundary semantics |
| artifact kind/vN / manifests / bindings | F4 |
| OBS/audit/telemetry events | own event/evidence contracts; not request-response envelopes |

---

## 10. Questions for Fable Round 1

Please falsify the model rather than polishing it.

1. **Delete-test the four families.** Can F2 and F3 be one family without creating a universal-envelope trap? Can F4 be removed because “schema is schema”, or is the temporal/durable distinction material?
2. **Attack `PublicFailureProjection`.** Is `stable code + sanitized message/category + correlationId` really the minimum? Is any field missing that closes a concrete F1 failure class?
3. **Correlation scope:** should correlation ID be guaranteed on external failures only, every independent response, or every independent request? Give the concrete operational failure class and cost.
4. **`retryable` challenge:** is my restriction correct, or should retryability be normalized more strongly? Test against query, action, integration timeout-after-send, CAS conflict, CLIENT_OUTDATED and OUTCOME_UNKNOWN.
5. **Failure locus on wire:** should 3F-01's four semantic loci appear explicitly in public envelopes, or remain internal classification mapped to stable codes? Which option creates less coupling without losing diagnosability?
6. **Execution identity:** find any F1 operation outside artifact/job execution that really needs `executionId`, or any runtime execution where executionId can be deleted.
7. **Success envelopes:** find a real F1 failure class that requires a platform-global success wrapper. If none, confirm `no universal success envelope`.
8. **Request envelopes:** test the rule against Control Plane, published runtime, approval, DEDICATED and vendor adapters. Identify any authority field that must travel vs must be derived server-side.
9. **Existing C-005 envelope:** does `{executionId,status,error?,output}` need structural correction now because C-012 added `dataMeta` and ActionReceiptMeta, or can 3F-02 treat it as a discriminated family with conditional branches without rewriting C-005?
10. **Error sanitization:** verify C-016 mapping through Gateway/platform boundaries does not accidentally erase necessary provider/effect evidence. How do `traffic_state`, raw provider status and correlation coexist without leaking internals or lying about who failed?
11. **Async/cancellation:** does `executeAsync/status/stop` force a separate command/status envelope family, or can it remain under F2 without a generic async framework?
12. **Unknown error fallback:** should an unrecognized internal failure map to one stable generic public code, or is that too lossy? Define the minimum safe behavior, not the literal code name.
13. **Buildability:** compare with Mitra/Factory/in-house evidence where relevant. Classify each proposed common trait as `PROVEN | CONVENTIONAL | PROBE_REQUIRED | UNSUPPORTED`. Do not turn reference into authority.
14. **Global Maximum:** if any evidence shows 3F-01's surface classification or C-005/C-012 envelope baseline is a local maximum, state the Material Finding explicitly rather than working around it.
15. **Missing boundary:** identify any current F1 boundary whose payload/error semantics materially change the model.

For every disagreement:

```text
claim challenged
concrete failure class / counterexample
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

If the model should be replaced, propose the smaller alternative. Do not add technology choices (OpenAPI, GraphQL, gRPC, concrete schema library) unless a current failure class makes the choice unavoidable.

---

## 11. Current position — not a decision

My current recommendation is:

```text
NO universal request envelope
NO universal success envelope
NO public DTOs on internal calls

YES boundary-specific contract families
YES one narrow sanitized public-failure projection for independent surfaces
YES conditional semantic traits (execution identity / correlation / compatibility / dataMeta / traffic state)
YES stable boundary error codes mapped from internal typed failures
NO generic retry permission from retryable:boolean alone
```

The strongest thing I want Fable to attack is whether even the shared `PublicFailureProjection` is too generic — or conversely too weak — before we ask the operator to approve anything.

---

# Round 1 — Fable

_Pending Fable response. Append here; do not rewrite previous rounds._
