# 3I Fable Dialogue — DEDICATED Trusted Exchange

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Candidate:** next material 3I decision; **no `3I-04` authority/ID is created by this file**  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** ChatGPT candidate for independent Fable challenge. This file does **not** update `LEDGER.md`, does not alter approved 3B..3I-03 authority, and does not authorize implementation, merge, or PR readiness.

---

## 1. Canonical starting point

Required authority path:

```text
DevelopmentConexus Engineering Method v1.0.0
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ exact accepted authority
→ current primary-source evidence only where mechanism behavior is load-bearing
```

Current canonical state:

```text
3B..3H = CLOSED / APPROVED
3I      = IN PROGRESS
3I-01   = APPROVED — Current Authorization, Approver Eligibility & Revocation
3I-02   = APPROVED — Credential & Capability Custody
3I-03   = APPROVED — Per-ActorRun / Per-AgentRun Model Spend Enforcement
```

Remaining 3I material families:

```text
DEDICATED Trusted Exchange                              ← THIS DIALOGUE
Trust Zones & Crossings / Hub egress / telemetry
hub_control Least-Privilege Realization
```

This dialogue realizes the already-approved semantics of `3F-06 — DEDICATED Platform Service Exchange`; it does not reopen that contract.

---

## 2. Authority already frozen

### 2.1 3C-12 — DEDICATED is real independent application runtime

A DEDICATED Project produces independently executable software and may consume Conexus Platform Services only through explicit bindings/contracts.

DEDICATED application code is not a privileged Hub process and does not receive by default:

```text
Hub DB credentials
Connection credentials
vault/master material
Git write credentials
Brain internals
provider/provisioning keys
```

Physical runtime/container/cloud/on-prem placement remains 3J.

### 2.2 3F-06 — exact exchange semantics are already authority

Every DEDICATED Platform-Service call has only these asserted semantic identities:

```text
DedicatedApplicationPrincipal
exact ReleaseRef
DelegatedConexusPrincipal?    # only if independently established later
```

Server-side derived/verified facts include:

```text
Project
Workspace
Platform-Service audience
exact Release-pinned composition
bindings
service-contract identities
```

The caller never manufactures those as authority fields.

The exact Release:

```text
→ belongs to the Project resolved for the application principal
→ pins compatibility/composition
→ does NOT become an auth secret
→ remains subject to current security/owner narrowing
```

`SERVICE_SCOPED` and `USER_DELEGATED` are the only semantic modes. A plain app `userId` never becomes a Conexus user principal.

### 2.3 3I-01 — principal set and current-authority law

Inbound Conexus authorization principals are closed F1 at:

```text
Account
DedicatedApplicationPrincipal
```

Runtime IDs, ReleaseRef, trace IDs and own-auth app-user refs are non-principals.

Authentication only enters current authorization evaluation; it is never unconditional execution.

DEDICATED preserved shape:

```text
authenticated DedicatedApplicationPrincipal
+ exact ReleaseRef
+ server-derived Project/audience/composition
+ current owner/security narrowing
→ possible Platform-Service admission
```

### 2.4 3I-02 — custody constraints

DEDICATED authentication/key issuance/revocation is intentionally left to this family.

Important inherited laws:

```text
platform operational credentials remain owner-specific
no generic SecretService/Credential domain
no new CredentialBackend consumer by uniformity
no secret in browser/Git/Release/log/telemetry
credential/capability blast radius must be bounded
```

### 2.5 3G-08 — old Releases remain valid by support, not latest

A DEDICATED runtime may present an older exact ReleaseRef.

```text
new Release exists
-X-> automatically invalidate older supported Release
```

Old Release may continue while:

```text
PRESERVE/support horizon valid
AND no independent current security/owner authority refuses it
```

No latest-only or fleet/lease policy exists F1.

### 2.6 C-014 config/secret separation remains relevant

Release identity contains semantic config contracts, while secret material can rotate outside Release when its semantics stay the same.

Therefore a DEDICATED authentication credential should **not** be forced into Release identity merely to avoid designing its current credential lifecycle.

---

## 3. Current standards evidence — mechanism input, not repo authority

Primary-source sweep on 2026-08-17:

### OAuth security BCP

RFC 9700 recommends asymmetric client authentication where feasible, explicitly naming:

```text
mTLS
private_key_jwt / signed JWT client authentication
```

Reason relevant here: the authorization server need not retain a sensitive shared symmetric client secret.

RFC 9700 also recommends sender-constrained and audience-restricted access tokens to reduce stolen-token replay; standardized sender-constraining options are mTLS and DPoP.

### private_key_jwt

RFC 7523 provides the existing JWT client-authentication profile. Relevant stable properties:

```text
client assertion is signed
iss identifies issuer
sub = client_id for client authentication
aud identifies authorization server
exp bounds assertion lifetime
jti can support replay detection
```

A March 2026 IETF work-in-progress update (`draft-ietf-oauth-rfc7523bis`) tightens audience handling toward the authorization-server issuer identifier and recommends explicit typing. It is **not** final authority; 3L must re-check the final/pinned standard state. The candidate below can already choose the stricter single-issuer audience without depending on draft publication.

### DPoP

RFC 9449 standardizes application-layer proof of possession for sender-constrained OAuth tokens. A DPoP proof binds to:

```text
public/private key
HTTP method (htm)
HTTP target URI (htu)
creation time
unique jti
access-token hash (ath) when using token
```

DPoP is not authentication by itself; it composes with client authentication. Same-endpoint proof replay still needs bounded lifetime and may use jti replay tracking/nonces.

### JWT access token

RFC 9068 standardizes signed JWT access-token shape and validation, including exact `iss`, `aud`, `exp`, `sub`, `client_id`, `iat`, `jti`, explicit `at+jwt` typing and asymmetric signing recommendation.

No OAuth 2.1 RFC is final as of this review; `draft-ietf-oauth-v2-1-15` remains work in progress. The candidate relies on published OAuth 2.0 + RFC 9700 BCP and published extensions, not on a draft.

---

## 4. Known / Inferred / Unknown / Deferred

### KNOWN

1. DEDICATED Platform-Service traffic is server-to-platform only in F1.
2. `DedicatedApplicationPrincipal` is Project-derived and is the only non-human inbound principal currently admitted.
3. `ReleaseRef` is exact compatibility/composition identity, not a credential.
4. Project/audience/bindings are server-derived, not caller authority.
5. `USER_DELEGATED` has no named F1 consumer and must not be built by symmetry.
6. DEDICATED raw Platform/Connection secrets are prohibited.
7. Current revocation must narrow new requests without rewriting Release history.
8. A new durable credential/grant record is not pre-admitted by 3E.
9. Multi-install/fleet lifecycle is deferred.
10. Same-project old/new DEDICATED Releases may legitimately coexist.

### INFERRED — challenge before ratification

1. A single current Project-scoped asymmetric application credential is sufficient F1 because fleet/multi-install independent credentials are deferred.
2. Public verification material + one monotonic credential generation can live as current security facts on the existing `prj.project` record without a new durable class.
3. `private_key_jwt` is the smallest strong server-to-server client-authentication family because it avoids Hub custody of the DEDICATED private key and avoids mTLS PKI/ingress coupling.
4. A short-lived JWT access token avoids a durable `DedicatedSession`/introspection store.
5. DPoP using the same application key is a plausible bounded increment that protects leaked access tokens without mTLS.
6. No refresh token is needed: the DEDICATED server can obtain a new access token using its long-lived asymmetric credential.
7. Exact ReleaseRef can be a signed claim in client authentication and then a Hub-issued access-token claim; this binds the two asserted identities for the exchange without making ReleaseRef a secret.
8. Credential-generation recheck on each Platform-Service request gives immediate prospective revocation of already-issued access tokens without blacklist state.
9. F1 need not prove that the physical binary actually equals the asserted Release; a Project-authenticated runtime may assert any currently admissible Release of that Project. Strong binary/instance attestation remains a separate future failure class.

### UNKNOWN — mechanism qualification, not authority guesswork

1. Exact Node/TS OAuth/JWT/DPoP libraries and APIs.
2. Exact algorithm set/curve/key representation.
3. Exact token/assertion/proof lifetimes and clock-skew allowance.
4. Whether current stack can implement DPoP cleanly without substantial custom machinery.
5. Exact same-proof replay-cache/nonce realization under single-process F1.
6. Exact Hub JWT-signing-key rotation/deployment mechanics.
7. Exact DEDICATED private-key provisioning path in Docker/on-prem/cloud.

### DEFERRED

```text
physical TLS/ingress/DNS/process topology                → 3J
private-key provisioning/runbook                         → 3J
Hub signing-key deployment/rotation runbook              → 3J
library/version/algorithm/DPoP conformance                → 3L
same-proof replay behavior under exact stack             → 3L
binary/runtime attestation                               → Decision Loop / 3N on real threat
multiple installation credentials per Project            → Decision Loop on install-base consumer
zero-downtime multi-key rotation overlap                  → Decision Loop / 3J on measured requirement
USER_DELEGATED / federation                              → Decision Loop on named consumer
browser-direct Platform-Service auth                      → Decision Loop
fleet credential registry / device identity               → Decision Loop
HSM/KMS-backed client keys                                → trigger/compliance/real threat
```

---

## 5. Root cause

The missing failure class is not “we need OAuth”. It is:

> **A customer-/product-controlled DEDICATED server must prove that it is the admitted application principal while declaring one exact supported Release, without receiving broad Platform secrets, without being able to substitute another Project/audience/user, with current revocation taking effect prospectively, and without turning authentication state into a second mutable authorization model.**

Unsafe examples:

```text
app sends ProjectId B in body
→ Hub trusts payload
→ cross-Project access

app API secret leaked from Hub DB
→ attacker impersonates DEDICATED app indefinitely

valid DAP credential + arbitrary own-auth userId
→ Conexus user authority fabricated

old access token after credential revoke
→ still accesses Platform Services until opaque server session expires

access token leaked in reverse-proxy log
→ replay from another machine

new Release exists
→ Hub incorrectly rejects old in-horizon DEDICATED runtime just because it is old

one Project credential asserted with Release from Project B
→ cross-Project composition substitution
```

---

## 6. Credible mechanism alternatives

### Alternative A — `private_key_jwt` + short-lived DPoP-bound JWT access token

**RECOMMEND / candidate GLOBAL MAXIMUM.**

Shape:

```text
DEDICATED server owns private key
Conexus stores current public verification key only
        ↓
OAuth client_credentials token request
+ private_key_jwt authentication
+ signed exact ReleaseRef
+ DPoP proof using same key
        ↓
Hub validates principal/current key/generation/Release
        ↓
short-lived Hub-signed JWT access token
bound to DPoP key
        ↓
Platform-Service request
+ DPoP proof
        ↓
current generation + Release + owner/security gates
```

Benefits:

```text
no symmetric DEDICATED secret in Hub
no refresh-token lifecycle
no durable token/session record
no client certificate PKI
access-token leakage alone is insufficient when DPoP holds
standard protocol families instead of custom request signing
```

Costs:

```text
client JWT signing
Hub token endpoint
Hub JWT signing key
DPoP proof per Platform request
3L conformance work
```

### Alternative B — mTLS client authentication + certificate-bound access token

**DEFER / challenger.**

Security is strong and RFC-standardized, but F1 would immediately require certificate issuance, CA/trust-chain decisions, TLS termination rules, proxy certificate forwarding, cert rotation/revocation and more 3J coupling.

Choose only if 3L proves DPoP/private-key JWT unavailable or a real deployment/compliance requirement favors mTLS.

### Alternative C — `private_key_jwt` + short-lived bearer JWT access token

**CREDIBLE smaller challenger.**

Deletes DPoP mechanics while preserving asymmetric client auth, current generation and short token lifetime.

Downside:

```text
stolen access token
→ usable by bearer until expiration/current generation revoke
```

RFC 9700 currently recommends sender-constrained tokens where feasible. Fable must decide whether DPoP's incremental complexity pays for this named leakage class in Conexus F1 or whether Alternative C is the true YAGNI maximum.

### Alternative D — long-lived API key/shared client secret

**REJECT as default.**

Simpler, but duplicates a high-value symmetric secret in DEDICATED runtime + verification boundary, increases replay/leak blast radius and ignores a practical asymmetric route already available for a server client.

Could return only if library/deployment evidence makes asymmetric authentication disproportionate.

### Alternative E — custom signed request protocol / HTTP signature scheme

**REJECT F1.**

A standards-based OAuth client-auth/token flow already covers the named consumer. Custom request-signing semantics would make Conexus own more cryptographic protocol surface than necessary.

---

## 7. Candidate F1 credential model — no new record class

### 7.1 Stable principal identity

`DedicatedApplicationPrincipal` remains a deterministic semantic identity derived from Project.

Conceptually:

```text
DedicatedApplicationPrincipalId
→ exact one Project
```

Exact wire `client_id` spelling is implementation.

No `dedicated_application` table.

### 7.2 Current Project-owned verification facts

F1 Project current security facts are equivalent to:

```text
dedicatedExchangeEnabled / key-present condition
currentCredentialGeneration
currentClientPublicKey / JWK / verification material
```

Exact columns/types are implementation.

Why Project:

```text
DAP derives from Project
one credential per Project F1
multi-install/fleet independent credential lifecycle = deferred
```

Public verification key is not secret material.

No new durable class is required unless independent N-key lifecycle becomes a current consumer.

### 7.3 Private key custody

The DEDICATED server owns the corresponding private key in its server-side deployment secret facility.

Never:

```text
browser
frontend bundle
Git
ReleaseManifest
Hub DB plaintext
Connection CredentialBackend
logs/traces
```

The Hub does not need the DEDICATED private key.

Provisioning/generation exact flow belongs to 3J. Static Control-Plane registration is sufficient F1; dynamic client registration is not built.

### 7.4 Rotation/revocation

Current credential replacement is a 3I-01 security-sensitive Project mutation:

```text
register replacement public key
+ advance currentCredentialGeneration
→ atomic current Project mutation
```

Consequences:

```text
old client assertion key → fails future token issuance
old access token carrying prior generation → fails next Platform-Service admission
```

No token blacklist or introspection state is necessary for this class.

F1 supports one current credential. Planned no-downtime old+new key overlap is not frozen; 3J may coordinate a bounded cutover, and a real multi-key overlap requirement returns through Decision Loop rather than creating a key registry preemptively.

Credential rotation does **not** create a new Release when application semantics/composition did not change.

---

## 8. Token request / client authentication candidate

Conceptual token endpoint:

```text
POST <Conexus authorization-server token endpoint>

grant_type = client_credentials
client authentication = private_key_jwt
```

### 8.1 Client assertion

The signed client-authentication JWT carries at least semantics equivalent to:

```text
iss = DedicatedApplicationPrincipal client_id
sub = same client_id
aud = exact Conexus authorization-server issuer identifier
exp = bounded short assertion lifetime
iat = issue time
jti = high-entropy unique assertion id
conexus_release_ref = exact ReleaseRef
```

Exact custom claim namespace/spelling is implementation.

Use a single exact issuer audience rather than ambiguous multi-audience acceptance.

The same Project current public key verifies the assertion.

### 8.2 Token-issuance guard

Before token issuance, Hub must establish:

```text
assertion cryptographically valid under current Project verification key
client_id resolves exactly one current DAP/Project
assertion generation/current credential facts admissible
exact ReleaseRef resolves
Release.runtimeProfile = DEDICATED
Release belongs to same Project
Release is within applicable support/PRESERVE horizon
no current security/owner narrowing refuses DEDICATED exchange
required service-contract compatibility remains interpretable
```

No caller-supplied Project/Workspace/role/user/audience is trusted.

### 8.3 Same-Project Release selection

The Project-authenticated DAP signs the exact ReleaseRef it wants to use.

F1 candidate deliberately does **not** claim cryptographic proof that the deployed binary bytes equal that Release.

Therefore:

```text
valid DAP credential
+ any currently admissible/in-horizon ReleaseRef of the SAME Project
→ may request an exchange for that exact Release
```

This is consistent with 3F-06's `ReleaseRef = asserted compatibility identity`, not a binary attestation.

Security consequence is explicit:

> Compromise of the Project DAP private key gives the attacker the Project application principal and lets it choose among currently admissible Releases of that Project; each chosen Release still bounds composition/audience and all current owner gates still apply.

If this blast radius is unacceptable for a real install base, the reopen trigger is **release-specific credential or binary/instance attestation**, not silent strengthening now.

Fable must attack this point aggressively.

---

## 9. Access-token candidate

After successful token admission, Hub issues a **short-lived signed access token** with claims semantically equivalent to:

```text
typ = at+jwt
iss = exact Conexus issuer
sub = DedicatedApplicationPrincipal
client_id = same DAP identity
aud = exact Conexus Platform-Service resource identifier
exp / iat / jti
conexus_release_ref = exact admitted ReleaseRef
conexus_credential_generation = current Project generation
cnf.jkt = DPoP public-key thumbprint        # Alternative A
```

No roles, Workspace, mutable grants, current binding values or raw secrets are snapshotted as lasting authority.

The client treats the token as opaque.

No refresh token F1:

```text
access token expires
→ authenticate again with current private key
→ receive new short-lived token
```

This avoids refresh-token state/rotation/reconciliation entirely.

### 9.1 Token audience

F1 uses one narrow Platform-Service resource audience for the current Hub resource-server boundary.

Individual service authorization remains:

```text
request route/operation
+ exact Release composition
+ current owner gates
```

If 3J later physically splits independent resource servers/origins, audience minting follows the exact resource boundary; it does not become caller-wildcard scope.

---

## 10. DPoP candidate — sender-constrain token without mTLS

Alternative A reuses the DEDICATED application key for DPoP.

Token request and resource requests prove possession of the private key; the access token is bound to its public-key thumbprint.

For a protected Platform-Service request, validate semantics including:

```text
access-token signature / typ / issuer / audience / exp
DPoP signature
DPoP key thumbprint == access-token cnf.jkt
htm == actual HTTP method
htu == actual target URI
ath == exact presented access-token hash
proof iat inside bounded acceptance window
jti structurally unique
```

### 10.1 Replay honesty

DPoP prevents a **stolen access token alone** from being used without the private key.

It does not make every captured DPoP proof magically unreplayable at the same endpoint.

F1 candidate law:

```text
DPoP proof lifetime is short/bounded
same live-process proof jti replay should be rejected where the pinned realization can do so cheaply
no durable DPoP-jti ledger / nonce FSM / replay database F1
```

A Hub restart may lose ephemeral proof-replay memory; this bounded same-endpoint replay residue is accepted unless Fable proves it defeats an existing load-bearing guarantee.

For physical external effects, Gateway idempotency/effect-attempt law remains authoritative and prevents DPoP from becoming effect-replay authority.

A requirement for crash-surviving one-time proof replay detection would be a concrete new durable-lifecycle finding and must not be smuggled into OBS.

---

## 11. Platform-Service admission after token authentication

Every request performs, at minimum:

```text
1. validate access token cryptographically
2. validate sender constraint when Alternative A
3. derive DAP / exact ReleaseRef from authenticated Hub-issued token
4. resolve current Project from DAP
5. verify Release belongs to Project
6. compare token credentialGeneration with current Project generation
7. verify Release remains support/admissible under current security law
8. derive requested Platform-Service owner/audience from route/operation
9. verify exact Release composition admits that service contract
10. apply current owner/I&A/Gateway/approval/budget/precondition gates as applicable
11. execute or fail closed
```

The short-lived access token is therefore:

```text
proof of recent authentication + exact immutable Release pin
-X-> snapshot of current mutable authorization
```

Generation and current owner checks preserve 3I-01.

---

## 12. SERVICE_SCOPED only in F1

The operational F1 path is:

```text
DedicatedApplicationPrincipal
+ exact ReleaseRef
→ SERVICE_SCOPED Platform-Service call
```

No `DelegatedConexusPrincipal` is created by this decision.

If the DEDICATED app authenticates its own users:

```text
appUserId
→ optional correlation/audit ref attributed to app
-X-> Conexus Account
-X-> authorization principal
```

If a Platform Service requires Conexus-user authority, SERVICE_SCOPED call fails closed.

USER_DELEGATED returns only on a named product consumer with an explicit federation/delegation decision.

---

## 13. Anti-oracle authentication behavior

Authentication is PRE-CONTRACT per 3F-06.

Externally, malformed/unknown/revoked/mismatched authentication failures must avoid revealing which privileged fact existed.

Conceptual uniform family:

```text
unknown client
wrong key
revoked generation
cross-Project Release mismatch
unsupported/non-admissible Release during token issuance
invalid assertion signature/audience/expiry
→ generic authentication failure
```

Detailed reason is internal metadata-only security audit/diagnostics, never response oracle.

After successful authentication/token admission, normal 3F-05 service-boundary failure semantics apply.

Exact HTTP status/error body/challenge belongs to implementation/3L, but anti-oracle indistinguishability is architecture.

---

## 14. Audit / observability

Audit metadata should cover security-sensitive events such as:

```text
DEDICATED verification-key register/replace/revoke
credential-generation advance
successful/failed token authentication at bounded metadata level
security-driven DEDICATED exchange disable/re-enable when represented by current credential state
```

Never audit/log:

```text
private key
raw client assertion
raw access token
raw DPoP proof by default
```

Operational request telemetry may record safe principal/release/correlation identities under existing producer-trust/redaction rules.

Observability never decides authentication or authorization.

---

## 15. Hub access-token signing key

Hub access-token signing material is a **platform operational credential**, not a Connection credential and not a new principal.

3I-02 owner-specific custody principles apply:

```text
private signing material server-side only
not Git/browser/E2B/app
safe key identifiers/public verification material may be exposed
rotation/audit without domain authorization leakage
```

Exact signing-key storage/injection/rotation/JWKS realization belongs to 3J/3L.

No new domain record is implied by using a runtime signing key.

---

## 16. Proof strategy

Future implementation/qualification should falsify at least:

1. unknown/invalid client cannot obtain a token;
2. caller-controlled Project/Workspace/role/user never alters resolved authority;
3. DAP of Project A + ReleaseRef of Project B fails before service admission;
4. valid DAP + supported Release of same Project follows the explicit F1 same-Project selection law, not accidental behavior;
5. unsupported/currently refused Release cannot mint/use a new exchange despite immutable history;
6. old token from credential generation N fails after Project generation advances to N+1;
7. old private key fails new token issuance after key replacement;
8. access token contains exact ReleaseRef admitted at token issuance and client cannot rewrite it;
9. a service absent from exact Release composition cannot be accessed merely because token is otherwise valid;
10. DEDICATED private key never appears in browser/Git/Release/Hub plaintext storage/log/telemetry;
11. bearer token stolen without DPoP private key cannot be used under Alternative A;
12. DPoP proof for different method/URI/token is rejected;
13. same-endpoint DPoP proof replay behavior is measured honestly; no false crash-surviving replay guarantee;
14. Gateway effect idempotency remains effect replay authority, not DPoP;
15. own-auth app `userId` cannot become DelegatedConexusPrincipal;
16. no refresh token/session/introspection/token-blacklist durable state is required;
17. credential replacement + generation update is one current-authority mutation and stale pre-state cannot win;
18. current owner/security narrowing is rechecked after token authentication and can block old Release operations;
19. authentication failures do not disclose whether client/key/Release exists or which check failed;
20. mTLS/PKI/service mesh/dynamic client-registration/fleet registry is unnecessary for F1;
21. no new durable credential/grant record is required for one current Project credential;
22. Hub signing key is an owner-specific operational credential, not Connection/CredentialBackend expansion;
23. 3L can prove exact pinned `private_key_jwt`/JWT/DPoP validation behavior without changing domain contracts.

---

## 17. YAGNI / explicit non-construction

Do not build F1:

```text
DedicatedApplication table
DedicatedAccessGrant
DedicatedSession
ServiceCredential domain record
OAuth dynamic client registration
OAuth authorization-code/browser flow for Platform Services
refresh tokens
refresh-token rotation FSM
introspection database
access-token blacklist
per-request durable jti ledger
DPoP nonce FSM
mTLS PKI / private CA
SPIFFE/SPIRE / service mesh
client-certificate forwarding architecture
multiple active installation credentials
fleet/device identity registry
per-Release client credential
binary/TPM/TEE attestation
USER_DELEGATED federation
browser-direct Platform-Service access
generic machine-identity framework
custom authorization scope DSL
wildcard service audience
```

Expansion returns only with a named consumer/failure class.

---

## 18. Routing

```text
exact Project security fields / atomic mutation spelling      → implementation
private-key generation/provision/deploy secret path           → 3J
Hub token-signing key deployment/rotation                     → 3J
TLS/ingress/resource-server physical topology                 → 3J
OAuth/JWT/DPoP library + algorithm + exact claim validation   → 3L
assertion/token/proof TTL + clock skew calibration            → 3L/implementation
same-proof replay cache/nonce behavior                        → 3L; Decision Loop if durable prevention required
Trust Zones / DEDICATED egress / telemetry crossing           → later 3I family
binary-to-Release attestation                                 → Decision Loop / 3N on proven threat
multiple installation credentials / key overlap              → Decision Loop on install-base/ops consumer
USER_DELEGATED federation                                    → Decision Loop on named product consumer
recovery after lost DEDICATED private key                     → 3J/3M only if policy beyond replace+generation is needed
```

---

## 19. Reopen triggers

Return through Decision Loop if any becomes real:

1. one Project must support independently revocable credentials for multiple DEDICATED installations;
2. zero-downtime credential rotation requires concurrent old/new verification keys and the one-key cutover is materially insufficient;
3. same-Project ability to assert any supported Release creates unacceptable privilege union and requires release-specific credential/binary attestation;
4. DPoP implementation cost or runtime support is disproportionate and short-lived bearer is proven sufficient under current threat model;
5. DPoP/bearer leakage incidents require crash-surviving replay state;
6. mTLS is mandated by a deployment/compliance/customer environment;
7. a real Platform Service requires end-user Conexus authority from a DEDICATED app;
8. browser-direct Platform-Service access becomes a named requirement;
9. current Project row cannot preserve credential generation/key facts without violating owner/data architecture;
10. OAuth/JWT library qualification fails a required security property;
11. Hub/resource-server topology becomes independently deployed enough to require a separate token introspection/revocation substrate;
12. a real fleet/install base requires explicit Release retirement/credential lifecycle.

---

## 20. Candidate disposition before independent review

```text
Material Finding against prior authority = NONE found
reopen required                          = NONE candidate
SERVICE_SCOPED                           = ADOPT F1
USER_DELEGATED                           = DEFER
one current Project credential           = ADOPT candidate
private_key_jwt                          = ADOPT candidate
short-lived signed access token           = ADOPT candidate
DPoP sender constraint                   = ADOPT candidate, Fable must attack YAGNI
mTLS                                     = DEFER challenger
shared API key                           = REJECT default
refresh token                            = REJECT F1
new durable record                       = 0 candidate
machine-identity framework               = 0
dynamic registration                     = 0
fleet registry                           = 0
```

The candidate deliberately chooses a **real implementable exchange** while leaving deployment/library details to 3J/3L. It does not try to solve arbitrary federation, fleets or hardware identity before a consumer exists.

---

## 21. Fable independent adversarial review

**Fable: reconstruct the applicable authority independently from `AGENTS.md`; do not trust this synthesis. Review exactly the current DEDICATED Trusted Exchange family.**

Attack especially:

```text
1. whether a single current Project-scoped asymmetric credential actually fits 3E/owner boundaries without a new durable record;
2. whether Project or I&A is the correct owner of current DAP verification facts;
3. whether credentialGeneration is a justified credential-revocation fact or accidentally recreates a generic per-Project stop rejected by 3I-01;
4. whether private_key_jwt is the smallest strong client-auth family versus mTLS or a simpler secret;
5. whether DPoP is essential in F1 under RFC 9700's current BCP, or whether short-lived bearer JWT is the true YAGNI maximum;
6. whether using one key for private_key_jwt + DPoP is safe/standard at the chosen abstraction level;
7. whether the signed ReleaseRef binding is sufficient or the credential must be Release-specific;
8. the explicit same-Project release-selection residual: compromised Project key can assert any currently admissible Release of that Project — is this acceptable under 3F-06/3G-08 or a Material Finding?;
9. whether a short-lived self-contained access token + current generation recheck really removes need for token blacklist/introspection/session state;
10. replay: distinguish access-token theft, client-assertion replay and same-endpoint DPoP-proof replay; do not invent durable replay machinery unless a current guarantee requires it;
11. whether no refresh token is correct for this confidential server client;
12. whether token audience and service authorization preserve 3F-06's rule that audience is server-derived and not caller-widenable;
13. current IETF state: RFC 9700, RFC 7523, RFC 9449, RFC 9068 and the 7523bis work-in-progress audience tightening; use primary sources and do not treat drafts as final authority;
14. anti-oracle authentication failure behavior;
15. USER_DELEGATED deletion test;
16. current owner/security narrowing after token issuance;
17. Hub access-token signing-key custody without expanding CredentialBackend;
18. any hidden 3J/3L/3M question masquerading as a 3I architecture decision;
19. whether this design is concretely buildable without turning OAuth into a separate product;
20. YAGNI: delete DPoP, OAuth pieces, state, records or lifecycle that do not pay for a named current failure class.
```

Return Material Findings, corrected candidate, credible alternatives, proof obligations and reopen triggers. **Do not alter LEDGER, approved authority or product code. Do not create `3I-04`. Append below this section, commit and push.**

---

## 22. Fable independent adversarial review

**Method:** DevelopmentConexus Engineering Method v1.0.0 applied. Authority reconstructed independently: 3C-12, 3F-06 (full read: asserted-identity set, derivation laws, PRE-CONTRACT auth, §10 preserved-for-3I list), 3G-07/3G-08, 3I-01 (principal closure + no-cache law + emergency-stop deletion test), 3I-02 (custody reuse rule for platform operational credentials), 3E-01/3E-02 (classes closed, columns open), C-014/C-016. Standards state verified against primary sources in this session's dated sweep (2026-08-17, URLs recorded in the 3I intake dialogue): RFC 9700 (published BCP; §2.5 RECOMMENDS asymmetric client authentication; §2.2.1/4.10 sender-constrained access tokens as SHOULD via mTLS or DPoP), RFC 7523 (published; signed client assertion with iss/sub/aud/exp/jti), RFC 9449 (published; DPoP positioned for contexts where transport-layer sender-constraining "is not available or desirable" — SPAs/native apps — an application-layer alternative, not a server-to-server mandate), RFC 9068 (published; `at+jwt` shape), `draft-ietf-oauth-rfc7523bis` (IESG/RFC-Editor pipeline, NOT final — its single-issuer-audience tightening is adoptable on its merits without draft dependence, exactly as the candidate does), OAuth 2.1 (draft-15, not authority). No draft is treated as authority anywhere below.

## F.1 Verdict

The exchange shape survives: `private_key_jwt` client authentication, one current Project-scoped asymmetric credential with a monotonic generation, a short-lived self-contained access token, per-request current-generation/narrowing recheck, no refresh token, no durable auth state, SERVICE_SCOPED only. **One structural correction: DPoP does not survive the YAGNI test — Alternative C (short-lived bearer + per-request current recheck) is the F1 global maximum, and the candidate's own §10.1 half-guarantees are the tell (F-4).** Deleting DPoP also deletes the proof-replay cache/nonce residue and dissolves the same-key question. The same-Project Release-selection residual is acceptable and is not a Material Finding (F-5); Project — not I&A — is the correct owner of the verification facts (F-1); `credentialGeneration` is legitimate owner-local credential revocation, not a disguised kill-switch (F-2). **Material Finding against approved authority = NONE; reopen of 3F-06/3C-12/3G-07/3G-08/3I-01/3I-02/3E = NOT JUSTIFIED.** Method outcome: **CURRENT STRUCTURE CONFIRMED** with the Alternative C substitution and bounded sharpenings.

## F.2 Findings

### F-1 — One Project-scoped credential fits existing records, and Project (not I&A) is the correct owner; name the archive composition

```text
claim challenged      §21-Q1/Q2 — record fit and owner
analysis              record fit: public verification material + generation +
                      enabled-condition are CURRENT security facts, columns on
                      the existing prj.project record — 3E closed classes, not
                      columns. The public key is not secret material, so no
                      custody conflict (3I-02's asymmetric consequence: the
                      platform stores only public keys for this exchange). No
                      new durable class while ONE current credential per
                      Project holds; N-key/fleet lifecycles are the named
                      Decision Loop trigger.
                      owner: I&A's frozen scope is HUMAN identity — Account,
                      credentials F1, sessions (3C-02); 3C-02's own trigger
                      list treats machine/service identities as a FUTURE
                      re-evaluation trigger, not current scope. 3F-06 §4.1
                      froze DAP as "principal semântico derivado da authority
                      existente de Project/Release". The credential is 1:1
                      with Project, its lifecycle is Project lifecycle, and
                      its mutation eligibility is already a 3I-01
                      security-sensitive Project mutation. Placing the facts
                      in I&A would drag machine identity into the human-auth
                      module against its own triggers, for uniformity only.
                      Project owns the FACTS; authorization composition
                      (whether the authenticated principal reaches a service
                      now) still runs through 3I-01/owner/Gateway laws — the
                      Project row does not become an authorization engine.
                      archive composition (unaddressed by the candidate):
                      3G-07 — ARCHIVED freezes future authoring intent and is
                      NOT unpublish/security stop. Therefore Project ARCHIVED
                      does not, by itself, disable the DEDICATED exchange for
                      in-horizon Releases; disabling the exchange is an
                      EXPLICIT owner-local security mutation (the same
                      allowed-narrowing shape as 3G-07's trigger DISABLE
                      while archived). State this in the decision text so
                      archive semantics are composed by citation, not
                      re-derived at implementation.
reopen prior authority?  NO
later owner           decision text (owner argument + archive line)
```

### F-2 — `credentialGeneration` is credential revocation plus an explicit narrowing control — distinguish the two uses, and neither is the rejected kill-switch

```text
claim challenged      §21-Q3
analysis              3I-01's emergency-stop deletion test rejected a NEW
                      durable global/project stop ENTITY while keeping
                      owner-local revoke/cancel/disable controls as the F1
                      incident set. Generation advance is exactly that class:
                      USE 1 — rotation: register replacement key + advance
                      generation atomically → old key and all outstanding
                      tokens die prospectively at the next admission. This is
                      credential revocation, the same owner-local class as
                      Connection credential revoke.
                      USE 2 — exchange disable: advancing generation (or the
                      enabled-condition) WITHOUT a replacement key is a
                      deliberate, explicit, Project-scoped security narrowing
                      of ONE exchange surface — analogous to trigger DISABLE,
                      not a cross-owner hold. It stops new token issuance and
                      new admissions; it does not touch Release history,
                      serving, or other Projects.
                      Both uses are 3I-01 security-sensitive mutations under
                      pre-state authority. Neither creates a durable stop
                      object; the facts already exist for USE 1. The decision
                      text should name both uses so USE 2 is a documented
                      control, not an accidental side effect.
reopen prior authority?  NO
later owner           decision text (name both uses)
```

### F-3 — `private_key_jwt` confirmed as the mechanism family; mTLS stays challenger; shared secret stays rejected

```text
claim challenged      §21-Q4
analysis              for a vendor issuing credentials to CUSTOMER-DEPLOYED
                      servers, published BCP (RFC 9700 §2.5) RECOMMENDS
                      asymmetric client authentication precisely because the
                      verifier retains no impersonation-capable secret — a
                      Hub DB leak yields public keys only, which kills the
                      candidate's own §5 "app API secret leaked from Hub DB"
                      schedule by construction. mTLS (RFC 8705) is equally
                      strong but imports PKI issuance, trust-chain, TLS
                      termination and proxy-forwarding coupling into 3J
                      before any consumer needs it — correctly DEFER with
                      trigger 6. Shared secret fails the custody blast-radius
                      law (3I-02) and is correctly rejected. The single-
                      issuer audience for client assertions is adopted on its
                      merits (kills cross-AS assertion replay); the 7523bis
                      draft is only corroboration, not authority.
reopen prior authority?  NO
```

### F-4 — DPoP fails the YAGNI test for F1: Alternative C is the global maximum; the candidate's own replay honesty is the tell

```text
claim challenged      §21-Q5/Q6/Q10/Q20 — is DPoP essential, and its residue
analysis              what DPoP buys here: a stolen SHORT-LIVED access token
                      alone becomes unusable without the private key. Examine
                      what is actually at risk when a bearer leaks in this
                      topology: a token whose lifetime is minutes, whose
                      audience is one platform resource boundary, whose every
                      request STILL passes per-request generation recheck,
                      current owner/security narrowing, Release-composition
                      admission, and — for anything effectful — the full
                      Gateway approval/budget/idempotency stack. The
                      unconstrained-bearer window is therefore minutes of
                      SERVICE_SCOPED, composition-bounded, effect-gated
                      access. Real, but narrow.
                      what DPoP costs here: a proof on EVERY Platform-Service
                      request generated by every customer integration
                      (permanent DX tax on the exact surface 3F-06 §9 wants
                      frictionless), Hub-side proof validation with
                      htm/htu/ath/iat-window/jti semantics, and — decisive —
                      the candidate's §10.1 already concedes the honest F1
                      shape: no durable jti ledger, no nonce FSM, ephemeral
                      replay memory lost on restart. That is DPoP with its
                      replay half open: same-endpoint proof replay within the
                      acceptance window remains possible anyway. F1 would
                      carry the full mechanism cost for a HALF guarantee on
                      top of an already minutes-bounded, recheck-bounded
                      exposure.
                      standards honesty: RFC 9700 sender-constraining is a
                      SHOULD with feasibility framing, and RFC 9449 itself
                      positions DPoP for contexts where transport-layer
                      constraining is unavailable/undesirable (SPAs, native
                      apps). A recorded, compensated deviation is
                      BCP-conformant engineering; FAPI-grade mandates govern
                      open-banking-class APIs, which this exchange is not.
                      I also attacked the even-smaller shape to be sure C is
                      the floor: per-request client assertions with NO access
                      token at all (delete the token endpoint + Hub signing
                      key). It fails: assertions without method/URI binding
                      are replayable across endpoints inside their lifetime,
                      and binding them re-invents DPoP as a custom protocol —
                      Alternative E, already rejected. So the token-based
                      shape stands and C is the smallest sound point.
smallest correction   adopt Alternative C as the F1 baseline LAW: short-lived
                      bearer `at+jwt` + per-request generation/narrowing
                      recheck + TLS + the no-log laws + anti-oracle behavior,
                      with the BCP deviation and its compensating controls
                      RECORDED in the decision text. Delete DPoP from the
                      baseline: §10 disappears entirely (proof validation,
                      iat windows, jti caches, nonce questions, restart
                      residue), and §21-Q6's same-key question dissolves —
                      defer key-reuse hygiene to the future DPoP decision if
                      its trigger ever fires. Keep the seam named: `cnf`-bound
                      tokens are an additive claim, so DPoP (or mTLS binding)
                      can be introduced later without changing domain
                      contracts. Reopen triggers: real install base whose
                      deployment hygiene cannot be assumed, a
                      compliance/customer mandate, an actual bearer-replay
                      incident, or 3L proving the marginal cost negligible
                      at the pinned stack — any of these re-admits
                      sender-constraining through Decision Loop.
reopen prior authority?  NO — mechanism-level substitution inside this family
later owner           decision text (C as baseline; deviation record; named
                      seam + triggers); 3L (bearer path conformance only)
```

### F-5 — The same-Project Release-selection residual is acceptable and already governed; not a Material Finding

```text
claim challenged      §21-Q7/Q8 — Project key can assert any currently
                      admissible Release of its Project
analysis              measured against frozen law: 3F-06 makes ReleaseRef a
                      compatibility/composition ATTESTATION, explicitly not
                      authentication proof, and F1 claims no binary
                      attestation for an externally operated runtime — a
                      per-Release credential would not fix that (the binary
                      still is not proven; the key just fragments). The
                      attacker's gain from Release choice is the UNION of
                      currently admissible compositions of ONE Project —
                      and that union is already operator-controllable:
                      3G-08 freezes that current security/owner policies may
                      refuse particular operations/Releases immediately, and
                      the support horizon bounds the set. So if one old
                      Release's composition is dangerous, narrowing IT is
                      existing law, not new machinery. Per-Release
                      credentials would import a per-Release key lifecycle
                      (issue/rotate/revoke × every Release) — the fleet-
                      registry shape §17 rejects — for marginal gain over
                      key compromise, which already yields the Project
                      principal. The candidate's explicit blast-radius
                      statement plus reopen trigger 3 is the honest form.
                      Verdict: acceptable residual, consistent with
                      3F-06 + 3G-08. NOT a Material Finding.
reopen prior authority?  NO
```

### F-6 — TTL and generation are two different knobs; say so, because deleting DPoP makes TTL load-bearing

```text
claim challenged      §21-Q9/Q16 — does self-contained + recheck really
                      eliminate blacklist/introspection/session?
analysis              yes, and the mechanism is worth stating precisely:
                      GENERATION bounds REVOCATION — compared against the
                      current Project row on every admission, revocation
                      latency for new requests is zero, which is why no
                      blacklist/introspection/durable session is needed.
                      This is also exactly 3I-01's no-cache law applied to
                      this surface: the token is proof of recent
                      authentication plus immutable pins; every mutable fact
                      is re-read per request.
                      TTL bounds BEARER REPLAY — under Alternative C the
                      token lifetime is the exposure window for a stolen
                      token, and nothing else caps it. Therefore TTL is not
                      a tuning nicety; it is the load-bearing replay bound
                      and its ceiling belongs in the decision text as a LAW
                      ("short-lived" as a named bounded property), with the
                      exact number calibrated by 3L/implementation.
                      Client-assertion replay is separately bounded by
                      assertion exp + single-issuer audience (F-3); the three
                      replay classes (assertion, bearer, proof) reduce to
                      two once DPoP is deleted, each with a named bound.
reopen prior authority?  NO
later owner           decision text (two-knob law); 3L (values)
```

### F-7 — Remaining confirmations: signing-key custody, anti-oracle, no refresh, USER_DELEGATED, routing

```text
signing key           §15 is correct and should cite 3I-02's reuse rule
                      explicitly: Hub token-signing material is a platform
                      OPERATIONAL credential — owner-specific custody, bound
                      by the custody PRINCIPLES (no-leakage, fail-closed on
                      missing, metadata-only audit) WITHOUT becoming a
                      CredentialBackend consumer. No expansion.
anti-oracle           §13 confirmed — uniform failure family pre-contract per
                      3F-06; wire spelling implementation/3L. Response-shape
                      indistinguishability is the architecture property;
                      timing uniformity is a 3L note, not an architecture
                      promise.
no refresh token      confirmed — a confidential client holding a long-lived
                      asymmetric credential re-authenticates; a refresh token
                      would ADD a durable bearer-class secret and its
                      rotation lifecycle for nothing. RFC-conformant and
                      smaller.
USER_DELEGATED        stays deleted; own-auth userId stays correlation-only
                      (3F-06 §4.2). No symmetry construction.
routing               clean after F-4: TTL/skew values → 3L; JWKS/signing-key
                      deployment/rotation → 3J; token-endpoint HTTP spelling
                      → implementation (PRE-CONTRACT per 3F-06); lost-key
                      recovery = replace + generation advance, runbook 3J;
                      the DPoP replay-cache 3L item is DELETED with DPoP.
buildability          with C, the full surface is: one token endpoint
                      (client_credentials + private_key_jwt verification),
                      RFC 9068-shaped token signing, and per-request
                      validation + generation/narrowing recheck — standard
                      library territory, no registration/consent/scopes/
                      introspection/revocation subsystems. OAuth stays a
                      mechanism inside the Hub, not a product.
```

## F.3 Answers to the twenty attack points

1. Fits — columns on `prj.project`, classes untouched; public key is not secret; one-credential baseline with named N-key trigger (F-1).
2. Project owns the verification facts; I&A's human scope and its own machine-identity trigger say so; authorization composition unchanged (F-1).
3. Legitimate — credential revocation (rotation) plus explicit Project-scoped exchange narrowing; both 3I-01-guarded mutations; no stop entity (F-2).
4. `private_key_jwt` — BCP-recommended asymmetric family without mTLS's 3J coupling or a symmetric secret's blast radius (F-3).
5. DPoP is NOT essential F1 — deleted from baseline; short-lived bearer + per-request recheck is the YAGNI maximum, with the BCP deviation recorded and the `cnf` seam + triggers named (F-4).
6. Dissolved with F-4; decided at the future DPoP decision if triggered.
7. Signed ReleaseRef binding is sufficient; a Release-specific credential adds a per-Release key lifecycle without proving the binary (F-5).
8. Acceptable residual, not a Material Finding — the union is Project-bounded, horizon-bounded, and already narrowable per-Release by frozen 3G-08 law; trigger 3 stays (F-5).
9. Yes — generation recheck gives zero-latency prospective revocation without any durable token state; the pattern IS 3I-01's no-cache law (F-6).
10. Three classes reduce to two: assertion replay (exp + single-issuer audience) and bearer replay (TTL law); proof replay deleted with DPoP. No durable replay machinery anywhere (F-4/F-6).
11. Correct — no refresh token; re-authentication with the long-lived asymmetric credential is strictly smaller (F-7).
12. Preserved — audience stays a narrow server-minted resource identifier; service authorization = route/operation × Release composition × current gates; nothing caller-widenable (§9.1 confirmed).
13. Verified against primary sources, dated: 9700/7523/9449/9068 published; 7523bis and OAuth 2.1 are drafts and are not load-bearing anywhere in the corrected candidate.
14. Confirmed — uniform pre-contract failure family; internal metadata-only diagnostics (F-7).
15. Stays deleted — no consumer, and the fabrication path is already frozen shut by 3F-06 (F-7).
16. Confirmed — per-request generation + current narrowing recheck means the token never snapshots authorization; old-Release operations remain blockable at admission (F-6, 3G-08 composition).
17. Owner-specific operational credential under 3I-02's reuse rule; CredentialBackend untouched (F-7).
18. After F-4 the routing is clean: values → 3L, deployment → 3J, wire → implementation; nothing 3M-shaped remains (lost key = replace + generation, runbook 3J).
19. Yes — token endpoint + token signing + per-request validation, standard libraries, no OAuth subsystems; and the smaller no-token shape was tested and fails on cross-endpoint assertion replay (F-4).
20. Deleted: DPoP baseline, proof-replay cache/nonce residue, same-key question, the 3L DPoP-conformance item. Everything else in §17's non-construction list stands, with "DPoP" added to it carrying its named re-entry triggers.

## F.4 Closing verdict

```text
Material Finding against approved authority   = NONE
reopen required                                = NONE
mechanism family                               = private_key_jwt client auth
                                                 + short-lived signed access token
                                                 + per-request generation/narrowing recheck
                                                 (Alternative C baseline)
DPoP                                           = DELETED from F1 baseline; named seam
                                                 (cnf) + Decision Loop triggers recorded
mTLS                                           = DEFER challenger (unchanged)
shared secret / refresh token                  = REJECT (unchanged)
corrections to consolidate                     = F-1 (owner argument + archive line)
                                                 F-2 (two named generation uses)
                                                 F-4 (C as baseline; deviation record;
                                                      seam + triggers; §10 deleted)
                                                 F-6 (TTL-vs-generation two-knob law;
                                                      TTL ceiling as named property)
                                                 F-7 (cite 3I-02 reuse rule in §15)
new durable record class                       = 0
durable token/session/introspection/blacklist  = 0
DPoP jti ledger / nonce FSM                    = 0 (deleted with DPoP)
PKI / registration / fleet / federation        = 0
technology product selected                    = 0 (family + token shape only;
                                                 libraries/algorithms/TTLs → 3L)

verdict = CURRENT STRUCTURE CONFIRMED with the Alternative C substitution —
          ready for consolidation and operator review; numbering as a 3I
          decision remains with the operator
```

