# 3F-06 — DEDICATED Platform Service Exchange — Adversarial Dialogue

**Status:** DIALOGUE / NON-AUTHORITATIVE  
**Fase:** 3F — Contracts & API Architecture  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este arquivo é input de decisão. Não altera authority, `LEDGER.md`, 3F-01..05, C-000..C-017, nem autoriza implementação.

## 1. Pergunta central

`ApplicationRuntimeProfile=DEDICATED` já é authority: o Project produz aplicação independentemente executável e pode consumir serviços Conexus somente por bindings/contratos explícitos.

A pergunta que ainda falta fechar é:

> Qual é o menor contrato semântico para um runtime DEDICATED chamar serviços Conexus sem transformar request payload em authority, sem entregar segredos de Platform ao app e sem acoplar DEDICATED ao runtime MANAGED?

Não decidir nesta rodada:

```text
OAuth / mTLS / JWT / API key
cookie/session transport
domains/ingress/TLS
network topology / deployment provider
credential rotation implementation
HTTP route inventory
SDK/library choice
3G lifecycle/revocation FSMs
3I concrete trust/enforcement
3J hosting
```

## 2. Authority já congelada

### 3C-12

```text
same Factory / Project / Change / Builder / verification / Release
runtimeProfile = MANAGED | DEDICATED
DEDICATED = independently executable application runtime
DEDICATED may consume Conexus Platform Services only by explicit bindings/contracts
DEDICATED is not privileged Hub process
DEDICATED does not receive Hub DB credentials, vault master material,
Git write credentials, Brain internals or provisioning keys by default
Conexus I&A is optional for DEDICATED; own auth may exist
```

### 3C-02

Identity & Access owns Conexus principal/session/access context when consumed, but its `ALLOW` never bypasses domain policy, approval, effects, budgets, release state or other owner preconditions.

### 3F-01

DEDICATED is an `INDEPENDENT` boundary where mixed versions are materially possible. Compatibility must fail closed; no speculative negotiated multi-version machinery.

### 3F-02

```text
no UniversalRequest
server/trusted boundary derives authority/context when responsible
operation-specific input stays operation-specific
T4 compatibility attestation only where independent versions require it
request fields may express expectations/attestations but cannot grant mutation authority
```

### 3F-04

```text
ReleaseManifest freezes exact served composition
PUBLISHED_APP / AGENT_RUN never resolve mutable current Project bindings
Project Brain/Connection bindings are exact-pinned
new current Project binding != active Release changed
```

### 3F-05

Public failures use the nine-code baseline and behavior-oriented mapping; do not create DEDICATED-specific failure taxonomy without distinct client behavior.

## 3. Root cause

A DEDICATED runtime lives outside the Hub process. Unlike a MANAGED app, the Platform cannot safely infer Project/Release/authority from same-process state or implicitly trusted hosting.

Two wrong local fixes are obvious:

### Wrong A — caller asserts authority in the request

```text
POST /platform
{
  projectId,
  releaseId,
  workspaceId,
  roles,
  connectionId,
  ...
}
```

Failure:

```text
request data becomes authority
caller can substitute scope
current/mutable refs can leak into execution
```

### Wrong B — give DEDICATED a long-lived privileged Platform secret

Failure:

```text
app compromise -> broad Platform compromise
secret lifecycle becomes app responsibility
violates server-side custody
```

The contract must therefore separate:

```text
operation payload
!=
trusted caller/authority context
```

## 4. Target invariant

For every DEDICATED → Conexus Platform Service call:

> The Hub can determine and validate the exact application/Project/Release authority under which the call occurs without trusting caller-supplied scope fields as authority, and the DEDICATED runtime receives only the minimum bounded capability required for that exchange.

Additional invariants:

1. a DEDICATED runtime is application code, never a Control Plane principal by implication;
2. platform service calls consume Release-pinned composition/bindings, never mutable `current` Project intent;
3. operation-specific payloads remain operation-specific; no generic DEDICATED request/response envelope;
4. raw Connection credentials / Platform master secrets never cross into the DEDICATED runtime merely to enable a service call;
5. user identity, when relevant, is separate from application identity and cannot be fabricated by supplying a `userId` field;
6. trust mechanism is decided in 3I, but 3I must realize these semantic properties rather than redefine them.

## 5. Credible alternatives

### A — Reuse MANAGED published-app session/topology

DEDICATED behaves as if it were remote MANAGED runtime and reuses the same session assumptions.

**Problem:** destroys the portability boundary 3C-12 created and makes independent runtime topology an illusion.

### B — Universal DEDICATED request envelope

```text
DedicatedRequest<T> {
  workspaceId
  projectId
  releaseId
  principal
  operation
  payload
}
```

**Problem:** mixes authority with payload, duplicates 3F-02 F2/F3 semantics, creates generic framework before consumer need.

### C — Trusted exchange context + operation-specific service contracts

Candidate.

```text
DEDICATED server runtime
  ↓ security mechanism later chosen by 3I
trusted exchange context established/verified by Hub
  ↓
exact Project + exact Release + application principal + target service audience
  ↓
operation-specific call
  ↓
owner service applies its own domain/policy/effect/approval rules
```

Compatibility attestation is explicit for the independently-versioned contract, but exact wire placement is not decided here.

### D — Raw Platform credentials/config injected into DEDICATED

**Reject:** bypasses Platform Service boundary and collapses Connections/Gateway/I&A ownership.

## 6. Candidate 3F-06

### 6.1 F1 access surface is server-to-platform

For DEDICATED F1, explicit Conexus Platform Service bindings are consumed by the **DEDICATED server/runtime side**, not directly by arbitrary browser code.

```text
browser
→ Dedicated application boundary
→ Dedicated server/runtime
→ Conexus Platform Service
```

Reason:

- current DEDICATED consumers exist specifically to preserve an independent application runtime/backend;
- no current consumer requires browser-direct cross-origin access to enterprise Platform Services;
- browser-direct access would add a second auth/trust surface before a consumer exists.

Reopen only with a named product requiring direct browser → Conexus service access that cannot reasonably traverse its Dedicated application boundary.

This does not prohibit a DEDICATED product from choosing Conexus Identity for user login; it only says Platform Service capability calls do not expose service authority directly to arbitrary browser code in F1.

### 6.2 Trusted exchange context

The semantic context that the Hub must establish contains exactly the authority dimensions required to interpret the call:

```text
DedicatedApplicationPrincipal
ProjectRef
exact ReleaseRef / ReleaseManifest identity
PlatformServiceAudience
optional DelegatedConexusPrincipal   # only when independently established
```

These are semantic properties, not necessarily request-body fields.

The security mechanism chosen in 3I MUST cryptographically/server-side bind or derive them strongly enough that arbitrary caller payload cannot widen them.

Runtime instance IDs, trace IDs and provider refs may exist as correlation only; they are not authority.

### 6.3 Project/Release identity

A DEDICATED call executes under an exact Release composition.

```text
caller says "use project X current bindings"   -> prohibited authority model
trusted context resolves exact Release R       -> allowed
Release R contains exact composition/pins      -> execution input
```

Whether an old-but-valid Release remains callable after a newer Release becomes active is a 3G/3I lifecycle question. 3F-06 only requires the call to identify the exact Release under which it claims authority.

### 6.4 Platform service audience

Authority is audience-bounded.

A capability allowing access to one service family does not imply access to all Platform Services.

Examples of service owners remain explicit:

```text
Capability Gateway
Brain
Production Agent Runtime
Identity & Access when explicitly chosen
other future service only by explicit contract
```

Do NOT introduce `PlatformServiceRegistry`, generic service discovery or wildcard `aud=*` in F1.

### 6.5 Application identity vs end-user identity

Application identity is always present for a DEDICATED platform call.

End-user identity is conditional.

#### Service-scoped call

```text
Dedicated application acts as itself
→ no fabricated Conexus user
→ owner evaluates app/service authority + domain preconditions
```

#### User-delegated call

Allowed only when the user principal was independently established by a trust/I&A mechanism chosen later.

```text
request body userId="123"
-X-> Conexus user authority
```

If the DEDICATED product uses its own auth and no trusted federation/delegation exists, Conexus sees only the application principal. A service requiring Conexus-user authority must fail closed rather than trust the app's arbitrary user identity assertion.

Do not design identity federation in 3F.

### 6.6 Compatibility

Because DEDICATED client/runtime and Hub may upgrade independently, each service contract used by the app has an exact compatibility attestation under 3F-01/3F-02 T4.

Semantics:

```text
built client contract identity/digest
→ presented or cryptographically bound to exchange
→ Hub verifies supported exact contract
→ mismatch fails closed (`CLIENT_OUTDATED` behavior when applicable)
```

Do not invent version negotiation, aliases or multi-version registry. The exact attestation field/header/token claim belongs to implementation/3I.

### 6.7 Payload/result families remain existing families

DEDICATED does not create:

```text
DedicatedRequest
DedicatedResponse
DedicatedError
DedicatedContext DTO on every operation
```

The underlying service retains its existing 3F-02 family:

```text
Gateway runtime execute -> F2 semantics
platform operation -> F3 semantics when applicable
public failure -> T1 / 3F-05
```

Trusted exchange context is supplied by the admitted security boundary, not copied into every domain payload.

### 6.8 Release-pinned bindings

A DEDICATED runtime never chooses mutable Connection/Brain current refs during a call.

```text
exact Release
→ exact frozen bindings/composition
→ service resolves/validates against owner authority
```

If the product needs a new binding revision, that enters through Project authoring/adoption + new Release flow, not through a runtime parameter.

### 6.9 No new durable authority record

3F-06 does not invent:

```text
DedicatedAccessGrant
PlatformServiceBinding
DedicatedSession table
ServiceCredential record
```

3E has no evidence requiring such records. 3I may realize trust with existing authorities plus ephemeral credentials/capabilities. A new durable record requires a concrete lifecycle/failure class and Decision Loop.

## 7. Public failure mapping

Do not create DEDICATED-prefixed codes.

Candidate mapping reuses 3F-05:

```text
contract/compatibility stale        -> CLIENT_OUTDATED
scope/identity hidden as not-found  -> NOT_FOUND when security-safe semantics require
known policy/eligibility refusal    -> OPERATION_REJECTED
malformed public input              -> VALIDATION_FAILED
unexpected platform fault           -> INTERNAL_ERROR
```

Exact mapping remains per owner/boundary admission under 3F-05.

Authentication/authorization wire status, challenge semantics and anti-oracle behavior belong to 3I/implementation; 3F-06 does not invent HTTP 401/403 rules.

## 8. UX / developer experience

Architecture underneath may use release refs, contract digests and bounded capabilities; a developer building a DEDICATED app should normally see:

```text
"Use Conexus Brain"
"Use company ERP connection"
"Call Conexus agent"
```

and a generated/typed server-side client or equivalent narrow integration surface.

They should not manually manage Workspace IDs, binding revision IDs, vault credentials or broad Platform secrets just because those concepts exist internally.

Exact SDK design belongs to implementation/3K/3L.

## 9. YAGNI — explicitly not authorized

```text
Universal DedicatedRequest/Response
PlatformServiceRegistry
service mesh
SPIFFE/SPIRE
OAuth token exchange selection
mTLS PKI
long-lived API-key architecture
identity federation
SCIM/OIDC broker
wildcard service audience
direct browser Platform-Service authority
generic delegation framework
DedicatedAccessGrant table
PlatformServiceBinding entity
runtime plugin system
multi-version negotiation
fleet management
```

Any item returns only with named consumer/failure class or when 3I proves it is the smallest necessary realization.

## 10. Proof strategy at architecture stage

Try to falsify candidate C with these tests:

1. **Scope substitution:** can app change `projectId/releaseId` in payload and gain authority? Must be no.
2. **Release drift:** can runtime resolve newly-current Project bindings without new Release? Must be no.
3. **Service widening:** does permission to call one Platform Service imply another? Must be no.
4. **User fabrication:** can app-owned auth invent Conexus user authority by sending user ID? Must be no.
5. **Secret leakage:** does platform-service consumption require raw Connection/platform master credentials in app? Must be no.
6. **Managed lock-in:** does DEDICATED need to run under MANAGED same-origin/session topology? Must be no.
7. **Payload pollution:** do operation DTOs need universal workspace/project/release/role fields? Must be no.
8. **Refactor:** can security mechanism change in 3I without changing operation semantic contracts? Should be yes.
9. **Old release:** can system identify exact release even if later lifecycle refuses it? Must be yes.
10. **Browser deletion test:** removing direct browser→Platform Service authority must not break any named F1 consumer.

## 11. Questions for Fable

1. Is server-to-platform F1 genuinely the Global Maximum, or does it accidentally overconstrain a real DEDICATED consumer?
2. Is the trusted exchange context missing a load-bearing dimension?
3. Is `ProjectRef + exact ReleaseRef + audience + app principal` redundant or insufficient?
4. Should Workspace identity be explicit in trusted context, or is it safely derivable from Project/Release authority?
5. Does `ApplicationPrincipal` require a new domain/durable entity, or can it remain a semantic principal realized from existing Release/I&A authority?
6. Does exact Release binding conflict with rollout/drain where old and new releases coexist?
7. Is a separate compatibility attestation actually necessary if exact Release already identifies the contract set?
8. Can one service call legitimately require multiple audiences, making single audience too narrow?
9. Is service-scoped vs user-delegated the smallest split, or premature delegation framework?
10. Does own-auth DEDICATED need a way to pass app-user context for audit without granting Conexus authority? If yes, should that be correlation-only?
11. Does this accidentally turn 3I into mere token implementation instead of preserving authority decisions for 3I?
12. What should 3I still be free to decide after 3F-06?
13. Is direct browser Platform-Service access truly YAGNI for F1? Find a current named consumer if not.
14. Does the candidate preserve C-015/3C-12 Published App semantics without forcing MANAGED auth topology?
15. Are any proposed failure mappings semantically wrong under 3F-05?
16. Does the "no new durable record" rule block a clearly required revocation/lifecycle property?
17. Could exact service audience be derived entirely from operation/endpoint, making an explicit audience semantic dimension redundant?
18. Does release-pinned composition fully solve binding authority for DEDICATED calls, or is another project binding handle required?
19. What is the strongest concrete security/availability failure class against candidate C?
20. After corrections, can this be approved without choosing OAuth/mTLS/JWT/topology?

For every material disagreement use:

```text
claim challenged
concrete failure class
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

Run deletion test, structural inversion, YAGNI/overengineering, Future-Cost and buildability. Do not modify authority or `LEDGER.md` in this round.

---

# Round 1 — Fable

**Status of this round:** adversarial review / NON-AUTHORITATIVE.
**Method:** DevelopmentConexus Engineering Method v1.0.0 applied — evidence from 3C-02/3C-12, 3D-02/3D-R1, 3E-02, 3F-01..05, C-013/C-014/C-015/C-016; deletion test and structural inversion run on candidate C. No claim depends on current Mastra behavior; no mechanism (OAuth/mTLS/JWT/API key/topology/provider) is chosen anywhere in this round.

## F.1 Verdict

Candidate C survives; alternatives A/B/D are correctly rejected. The deletion test, however, cuts **deeper than the candidate went**: the trusted exchange context as drafted still contains two assertable dimensions that are derivable — and every assertable dimension is a substitution surface (the candidate's own proof test 1). Applied fully, the context collapses to **two asserted identities plus one optional one**, and the separate compatibility attestation **deletes entirely** — the exact ReleaseRef *is* the attestation. I also name the strongest concrete failure class against C (Q19), which the candidate leaves implicit, and close it with a law already frozen by 3F-01. Method outcome: **CURRENT STRUCTURE CONFIRMED** with bounded corrections. **No Material Finding against 3F-01..05, 3C-12 or C-014.** Draft in F.4.

## F.2 Findings

### F-1 — The trusted context asserts too much: only the principal and the Release are irreducible

```text
claim challenged      §6.2 context = {app principal, ProjectRef, exact ReleaseRef,
                      audience, optional delegated principal}
concrete failure class every dimension the caller may ASSERT is a substitution
                      surface the Hub must defend. ProjectRef is derivable:
                      rel.release → prj.project is a frozen Tier-2 relation
                      (3E-02 #13), and the application principal itself resolves
                      to its Project. Asserting Project alongside Release creates
                      the cross-check burden ("does R belong to P?") that pure
                      derivation makes unnecessary — and an inconsistent pair is
                      exactly the scope-substitution attempt proof test 1 exists
                      to kill. Audience, likewise, is not a free assertion: 3C-12
                      says DEDICATED consumes services only by explicit bindings,
                      and those bindings are frozen in the Release composition —
                      so the admissible audience SET derives from the Release.
smallest correction   the exchange asserts exactly:
                        DedicatedApplicationPrincipal
                        exact ReleaseRef
                        optional DelegatedConexusPrincipal (only when
                          independently established by the 3I mechanism)
                      Everything else is DERIVED AND VERIFIED server-side:
                        Project    ← from principal; Release must belong to it,
                                     else fail closed
                        Workspace  ← from Project (answers Q4: derivable, and an
                                     explicit copy would be a second source)
                        admissible audiences ← from the Release-pinned platform-
                                     service bindings; the called operation's
                                     owner must be within them, else fail closed
                      Audience remains a load-bearing SEMANTIC dimension — it
                      scopes the granted capability so one service binding never
                      implies another (Q8/Q17) — but it is never a caller-
                      asserted field. This is §6.2's own sentence ("semantic
                      properties, not necessarily request-body fields") applied
                      to its own list.
reopen prior authority?  NO
later owner           how the two asserted identities are cryptographically
                      bound → 3I
```

### F-2 — The separate compatibility attestation deletes: the ReleaseRef is the attestation

```text
claim challenged      §6.6 — per-contract compatibility attestation presented or
                      bound to the exchange
concrete failure class none prevented by keeping it; cost created by keeping it:
                      a second self-asserted compatibility channel that can
                      disagree with the Release. Analysis: the app's service-
                      client contracts are frozen at BUILD time, and the build is
                      frozen by the Release (C-014 completeness; 3C-12 Dedicated
                      Release includes runtime contracts). A per-call contract
                      digest is exactly as self-asserted as the ReleaseRef — for
                      an externally-operated binary, NEITHER proves what code is
                      actually running. So the separate attestation adds zero
                      security and zero honest-mismatch detection beyond what the
                      Hub can derive: look up the contract identities pinned by
                      Release R and fail closed (CLIENT_OUTDATED behavior) if any
                      is no longer supported. Two channels that can only agree or
                      reveal a bug is the drift-surface pattern this program has
                      deleted three times already (bindingSetDigest, embedded
                      Brain digest, duplicated pins).
smallest correction   delete the separate attestation. Normative consequence made
                      explicit: the DEDICATED ReleaseManifest MUST pin the exact
                      service-contract identities the build consumes — this is
                      C-014's completeness principle applied to a composition
                      element 3C-12 already names, not a C-014 reopen. T4 for
                      this surface is realized BY the ReleaseRef.
reopen prior authority?  NO
later owner           divergent-deployed-binary residual risk is bounded (the Hub
                      enforces per-Release authority regardless of what the
                      binary actually is; worst case the app breaks itself) and
                      its detection, if ever wanted, is a 3I/3N concern
```

### F-3 — The strongest failure class against C is availability, and 3F-01 already owns the answer

Q19 answered explicitly, because the candidate leaves it implicit:

```text
failure class         fail-closed compatibility without a support obligation is a
                      remote kill switch: the Hub upgrades, drops support for a
                      contract identity pinned by deployed DEDICATED releases,
                      and every customer instance fails closed simultaneously —
                      correct per-call behavior, unacceptable systemic behavior,
                      and invisible until it happens.
closing law           the service-contract identities pinned by any Release
                      within its 3F-01 PRESERVE horizon (active / rollback-
                      eligible / within declared support) MUST remain supported
                      by the Hub; dropping support for a still-in-horizon
                      contract identity is a contract-breaking change, not an
                      upgrade. This is the artifact kind/vN horizon discipline
                      applied to the service surface — no new machinery, one
                      sentence binding an existing law to this boundary.
```

Stolen-credential blast radius (the other Q19 candidate) is already bounded by design — audience scoping, owner-side policy/budget/approval checks, 3I revocation — and stays a named residual for 3I.

### F-4 — Authentication-layer failures are pre-contract; say so, or a code gets minted in implementation

```text
claim challenged      §7's mapping table, which is complete for admitted calls but
                      silent on credential/authentication failure
concrete failure class the first implementer needs a behavior for "invalid/expired
                      app credential", finds no baseline code that fits (it is not
                      OPERATION_REJECTED — nothing domain was evaluated; not
                      NOT_FOUND; not INTERNAL_ERROR), and mints AUTH_FAILED ad
                      hoc — un-governed, per-boundary, the 3F-05 failure class A.
smallest correction   one sentence: authentication/credential-layer outcomes are
                      PRE-CONTRACT and belong to the 3I mechanism (including
                      challenge and anti-oracle wire behavior); the T1/3F-05
                      baseline governs failures of AUTHENTICATED, admitted
                      exchanges only. If 3I's design later shows a distinct
                      post-auth client behavior needing a public code, it enters
                      by 3F-05 boundary admission — not by improvisation.
reopen prior authority?  NO
later owner           3I
```

### F-5 — App-user audit context: correlation-only, with vocabulary that already exists

Q10 answered: yes, an own-auth DEDICATED product legitimately wants "performed for app-user X" in the audit trail without any Conexus authority. The mechanism already exists — an opaque app-supplied correlation ref recorded under C-013's producer-trust vocabulary (GUEST_OBSERVED-class provenance: recorded, attributable to the app's assertion, never authoritative, never resolvable to a Conexus principal, never consulted by authorization). No delegation framework, no identity mapping table — one correlation field with an existing trust class.

## F.3 The twenty questions

1. **Server-to-platform GM:** confirmed. The named F1 DEDICATED consumers (MetalDocs, Marketplace Central — 3C-12's own consumer list) have their own backends; browser-direct would add a second auth/trust surface with zero current consumers. Structural inversion: if a future product were browser-only, it would be a MANAGED candidate anyway. Reopen trigger correctly named.
2/3. **Context dimensions:** F-1 — not missing a dimension, carrying two too many as *assertions*. After F-1: nothing missing (environment/staging collapses into "which exact Release the instance presents"; instance identity stays correlation-only).
4. **Workspace:** derivable, and must not be explicit — F-1.
5. **ApplicationPrincipal:** no new durable entity. It is a semantic principal — "the deployed application of Project P" — realized from existing Project/Release authority plus whatever credential custody 3I mints (CredentialBackend is already a frozen infra boundary; that is the prepared seam). A durable grant/identity record enters only if 3I demonstrates a lifecycle need — Decision Loop, exactly as §6.9 says.
6. **Rollout/drain:** no conflict — exact ReleaseRef is what makes coexistence *governable*: old and new instances each present their own Release; whether an old-but-in-horizon Release remains admissible is the 3G/3I window policy, which requires exactly the identification this contract provides. F-3's horizon law is the availability floor under that policy.
7. **Attestation:** deletes — F-2.
8. **Multiple audiences per call:** no. One exchange targets one service owner; cross-service composition is Hub-internal (3D import graph). A client needing two audiences in one call is doing platform-internal orchestration client-side — a smell, not a requirement.
9. **Service-scoped vs user-delegated:** smallest split, confirmed — without it either every call carries a fabricable user or none can carry a real one. Two modes and one fail-closed rule (service requiring Conexus-user authority refuses app-asserted identity) — no framework. Delegation realization stays 3I/deferred.
10. **Audit context:** F-5 — correlation-only, existing C-013 vocabulary.
11. **Does this reduce 3I to token plumbing:** no — 3F-06 fixes *what must be true* (semantic dimensions, binding, fail-closed laws); 3I decides *how it becomes true*, which includes real authority decisions: mechanism family, credential issuance/rotation/revocation lifecycle, bearer vs proof-of-possession, replay/anti-oracle wire behavior, instance identity handling, delegation realization, egress/network policy, break-glass. The division mirrors 3F-03 §scope, which worked.
12. **3I freedom list:** as Q11 — enumerated in the draft so the boundary is citable.
13. **Browser-direct YAGNI:** confirmed; deletion test passes — no named F1 consumer breaks (proof test 10 holds).
14. **C-015/3C-12 preservation:** confirmed — MANAGED topology untouched (C-015 stays MANAGED baseline per 3C-12 §9); DEDICATED own-auth remains legal; nothing forces Conexus sessions on a DEDICATED product.
15. **Failure mappings:** semantically correct for admitted calls; the gap is pre-auth — F-4. One refinement: `NOT_FOUND` on this surface inherits the 3F-05 indistinguishability law verbatim (foreign Project/Release identity must be indistinguishable from nonexistent — it is the same existence-oracle concern, server-to-server).
16. **No-new-durable-record vs revocation:** holds. Revocation is credential lifecycle (3I + CredentialBackend custody) plus fail-closed verification at every exchange; a durable grant ledger needs a demonstrated lifecycle/failure class first. Nothing currently blocked.
17. **Audience derivable from operation:** at *dispatch* yes — which is precisely why it must not be an asserted field (F-1); at *grant scope* no — the capability-bounding role is load-bearing. The candidate's semantic dimension survives; its field dies.
18. **Release-pinned bindings sufficient:** yes, complete — pinned composition + owner last-mile revalidation (3D-02: revocable/material authority revalidated at the enforcement boundary). No second binding handle; a new binding revision travels Project authoring → adoption → new Release (3F-04), never a runtime parameter.
19. **Strongest failure class:** F-3 (availability-by-fail-closed), closed by the horizon law. Credential theft is the bounded residual, named for 3I.
20. **Approvable without mechanism choice:** yes — nothing in the corrected candidate names or presupposes OAuth/mTLS/JWT/keys/topology/provider; every mechanism-shaped question is explicitly routed to 3I with its semantic obligations attached.

**Deletion test summary:** ProjectRef assertion — deleted (F-1); audience assertion — deleted, dimension kept (F-1); separate compatibility attestation — deleted (F-2); browser-direct authority — confirmed absent; new durable records — confirmed absent; universal envelopes — confirmed absent. Structural inversion (many DEDICATED products, external customers, independent upgrade cadences): the laws survive; what would return is windowed compatibility (already the named 3F-01 reopen trigger) and richer credential lifecycle (already 3I's). Not overfit.

## F.4 Proposed 3F-06 decision text (smallest operator-facing form)

---

> ### 3F-06 — DEDICATED Platform Service Exchange (DRAFT)
>
> **Decision in one sentence:** a DEDICATED runtime consumes Conexus Platform Services server-to-platform under a trusted exchange whose only asserted identities are the application principal and the exact Release (plus an optional independently-established delegated Conexus principal) — every other authority dimension is derived and verified server-side from Release-pinned composition — with compatibility attested by the Release itself under a mandatory support horizon, no new durable authority records, no universal envelopes, and all mechanism, credential-lifecycle and wire-trust decisions preserved for 3I.
>
> **1. Access surface.** F1 DEDICATED platform access is server-to-platform: browser → Dedicated application boundary → Dedicated server/runtime → Conexus Platform Service. No direct browser→Platform-Service authority (reopen: a named product whose need cannot traverse its own application boundary). This does not constrain a DEDICATED product's choice of Conexus Identity for its own user login.
>
> **2. Trusted exchange context.** Asserted: `DedicatedApplicationPrincipal`; `exact ReleaseRef`; optionally `DelegatedConexusPrincipal` when independently established by the 3I mechanism. Derived and verified server-side, never asserted: Project (from principal; the Release must belong to it — mismatch fails closed), Workspace (from Project), admissible service audiences (from the Release-pinned platform-service bindings; the called operation's owner must be within them — else fail closed), consumed service-contract identities (from the Release composition). Runtime instance/trace/provider refs are correlation only. The 3I mechanism must bind the asserted identities strongly enough that arbitrary payload cannot widen them; caller-supplied scope fields are never authority (3F-02).
>
> **3. Identity model.** Application identity is always present and is a semantic principal realized from existing Project/Release authority plus 3I credential custody (CredentialBackend seam) — no new durable identity/grant/session/credential domain records (Decision Loop otherwise). End-user identity is conditional: service-scoped calls act as the application; user-delegated calls exist only with an independently-established Conexus principal; a service requiring Conexus-user authority fails closed against app-asserted user identity. An own-auth product may supply an opaque app-user ref as **correlation only**, recorded under C-013 GUEST_OBSERVED-class provenance — never resolvable to authority.
>
> **4. Composition and compatibility.** Calls execute under the exact Release composition — never mutable current Project intent (3F-04); new binding revisions enter via authoring → adoption → new Release, never via runtime parameter. The DEDICATED ReleaseManifest pins the exact service-contract identities its build consumes (C-014 completeness applied); the ReleaseRef **is** the T4 compatibility attestation — the Hub derives the pinned contract identities and fails closed with `CLIENT_OUTDATED` behavior on unsupported ones; no separate per-call attestation channel exists. **Support horizon law:** contract identities pinned by any Release within its 3F-01 PRESERVE horizon must remain supported; dropping support for an in-horizon identity is a contract-breaking change. Old/new Releases may coexist during rollout, each identified exactly; admissibility windows for old Releases are 3G/3I policy.
>
> **5. Payloads and failures.** No `DedicatedRequest/Response/Error/Context` — services keep their 3F-02 families (F2 for Gateway execute, F3 for platform operations) and the 3F-05 nine-code baseline with owner/boundary admission; `NOT_FOUND` carries its indistinguishability law verbatim on this surface (foreign Project/Release = nonexistent). Authentication/credential-layer outcomes are **pre-contract** and belong to 3I (including challenge and anti-oracle wire behavior); the public baseline governs authenticated, admitted exchanges only; any future post-auth public code enters by 3F-05 admission.
>
> **6. Custody.** Raw Connection credentials, vault/master material, Hub DB credentials, Git write credentials, Brain internals and provisioning keys never cross into the DEDICATED runtime to enable a service call (3C-12). Blast radius of a compromised app credential is bounded by audience scope, owner-side policy/budget/approval checks and 3I revocation — named residual for 3I.
>
> **7. Developer experience.** Developers see product concepts ("Use Conexus Brain", "Use company ERP connection", "Call Conexus agent") through a narrow typed server-side integration surface; Workspace IDs, binding revisions, contract digests and credentials never become manual developer concerns. SDK realization → implementation/3K/3L.
>
> **8. Preserved for 3I** (explicitly): mechanism family (OAuth/mTLS/JWT/keys/other), credential issuance/rotation/revocation lifecycle, bearer vs proof-of-possession, replay protection, anti-oracle/challenge wire semantics, instance identity handling, delegation realization, network/egress policy, break-glass — each obligated to realize, not redefine, the semantics above.
>
> **9. Non-goals.** Everything in §9 of this dialogue, plus: asserted Project/Workspace/audience fields, per-call contract attestation, DEDICATED-prefixed failure codes, auth-failure code minting outside 3F-05 admission.
>
> **10. Proof strategy.** The ten falsification tests of §10, amended: test 1 now covers Project/audience substitution *by construction* (the fields do not exist to substitute); plus the horizon test — dropping support for an in-horizon pinned contract identity must be mechanically detectable as a breaking change; plus the derivation test — Release not belonging to the principal's Project must fail closed.
>
> **11. Reopen triggers.** Named browser-direct consumer; real federation/delegation consumer; demonstrated credential-lifecycle need for a durable record; windowed multi-version compatibility consumer (external install base); 3I evidence that the two-identity assertion set is insufficient for its mechanism.

---

## F.5 Closing verdict

All twenty questions converge. The corrections are deletions and one law-binding — nothing was added that a named consumer does not pay for; the mechanism space for 3I is intact and explicitly enumerated. No material question remains.

```text
READY FOR OPERATOR APPROVAL
```

No LEDGER or authority file was modified in this round.
