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
