# 3I-04 — DEDICATED Trusted Exchange

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3I — Security / Authority Architecture  
**Authority:** quarta decisão aprovada de 3I  
**Importante:** esta decisão não constitui C-018, não encerra 3I nem a Fase 3, não autoriza product code, merge ou PR readiness e segue 3A-R6.

## Decisão em uma frase

No Conexus F1, um runtime `DEDICATED` autentica server-to-platform como `DedicatedApplicationPrincipal` por **um credential assimétrico corrente owned pelo Project**, usando `private_key_jwt`; a mesma client assertion assinada **binda a exact `ReleaseRef`** apresentada no exchange; o Hub valida principal, credential generation, Project/Release e current narrowing antes de emitir um **short-lived signed bearer access token** que sela `DedicatedApplicationPrincipal + exact ReleaseRef + credentialGeneration`; cada Platform-Service admission revalida generation, Release/project containment, Release-pinned composition e current owner/security gates; `SERVICE_SCOPED` é o único modo F1; não existem refresh token, durable token/session/introspection/blacklist state, DPoP, mTLS PKI, fleet/install identity, per-Release credential, binary attestation ou USER_DELEGATED sem novo consumer/failure class material.

---

## 1. Authority, método e provenance

Esta decisão aplica a DevelopmentConexus Engineering Method v1.0.0 e materializa sem reabrir:

- 3A-R6 — DEDICATED Trusted Exchange é `MUST DECIDE`; deployment físico DEDICATED permanece deferred até primeiro consumer real;
- 3C-12 — DEDICATED é runtime de aplicação independente que consome Platform Services somente por bindings/contratos explícitos;
- 3F-06 — asserted identities = `DedicatedApplicationPrincipal + exact ReleaseRef`; Project/Workspace/audience/bindings/service-contract identities são derivados server-side;
- 3G-07 — ARCHIVED congela future intent, não é security stop/unpublish;
- 3G-08 — older exact DEDICATED Releases não morrem apenas porque uma nova Release existe;
- 3I-01 — authentication != complete authorization; current mutable authority é reaplicada nos protected owner control points; security-sensitive mutations usam pre-state authority;
- 3I-02 — operational credentials preservam owner/custody e não ampliam `CredentialBackend` por uniformidade;
- 3E-01/3E-02 — durable record classes fechadas; novo record requer lifecycle/failure class real.

Review/provenance não-autoritativa:

- `3I-FABLE-DIALOGUE-dedicated-trusted-exchange.md`.

A revisão independente convergiu em:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
mechanism family                             = private_key_jwt
access token                                 = short-lived signed bearer
current recheck                              = required
DPoP                                         = DELETED from F1 baseline
mTLS                                         = DEFER challenger
new durable record class                     = 0
new token/session/introspection state        = 0
outcome                                      = CURRENT STRUCTURE CONFIRMED
```

A consolidação final mantém a `ReleaseRef` **dentro da client assertion assinada**. Isso preserva o binding das duas asserted identities sem durable assertion-replay ledger: replay de uma assertion dentro de sua janela não pode substituir `ReleaseRef` sem invalidar a assinatura.

---

## 2. Escopo exato

3I-04 fecha:

```text
A. DEDICATED non-human principal authentication family
B. owner dos verification/revocation facts
C. binding de DedicatedApplicationPrincipal + exact ReleaseRef
D. token issuance semantics
E. per-request current credential-generation/narrowing recheck
F. SERVICE_SCOPED-only F1 law
G. credential rotation/revocation/disable semantics
H. anti-oracle pre-contract authentication behavior
I. bearer replay residual + DPoP deferral
J. Hub token-signing credential ownership class
K. explicit YAGNI exclusions/reopen triggers
```

Não fecha:

```text
exact JWT/OAuth library / algorithms / key encoding / TTL values → 3L + Realization Planning
exact HTTP token endpoint/wire spelling                         → Realization Planning
private-key provisioning/storage on DEDICATED host              → 3J at first DEDICATED deployment
Hub token-signing-key deployment/rotation runbook                → 3J
DEDICATED physical ingress/TLS/network topology                  → DEFER SAFELY to 3J on first real DEDICATED deployment
USER_DELEGATED / federation                                      → Decision Loop on named consumer
fleet/install identity                                           → Decision Loop on install-base consumer
binary/runtime attestation                                       → Decision Loop on real threat/requirement
```

---

## 3. Root cause

O failure class é:

> **Um servidor DEDICATED controlado fora do Hub precisa provar qual aplicação Conexus ele representa e qual exact Release está declarando, sem receber Platform secrets amplos, sem fabricar Project/Workspace/audience/user authority, com revogação corrente efetiva e sem criar uma segunda authorization/session system.**

Falhas a impedir:

```text
caller envia ProjectId/WorkspaceId/audience e o Hub confia
credential de Project A usa Release de Project B
secret simétrico copiado para Hub + app vira impersonation credential em dois lugares
own-auth userId vira Conexus principal
old token continua admitindo após credential revoke
ReleaseRef muda fora da assinatura de uma client assertion replayada
valid token vira authorization snapshot
new Release invalida old supported Release por conveniência
```

---

## 4. Target invariants

### D1 — Exact trusted exchange identity

```text
authenticated DedicatedApplicationPrincipal
+ signed exact ReleaseRef
→ one trusted exchange context
```

Payload arbitrário não pode ampliar/substituir essas identities.

### D2 — Same-Project containment

```text
DedicatedApplicationPrincipal(Project A)
+ ReleaseRef(Project B)
→ fail closed
```

### D3 — Server-derived authority

Nunca authority fields livres do caller:

```text
Project
Workspace
audience/service authority
bindings
service-contract identities
current permissions/policies
```

### D4 — Current revocation

```text
token.credentialGeneration != Project.currentCredentialGeneration
→ deny before Platform-Service execution
```

### D5 — Token is not authorization snapshot

```text
valid access token
→ may enter current authorization evaluation
-X-> unconditional execution
```

### D6 — Secret containment

O Hub não precisa possuir a DEDICATED private key; o DEDICATED runtime não recebe Connection credentials, Hub DB credentials, vault/master material, Git write credentials, Brain internals ou provider/provisioning keys.

### D7 — No fabricated user delegation

Own-auth app user identity permanece correlation/audit provenance only; nunca vira `Account` ou `DelegatedConexusPrincipal` por payload.

### D8 — No new auth lifecycle state

F1 realiza o exchange com existing Project durable facts + short-lived self-contained token. Não exige `DedicatedSession`, token blacklist/introspection ou auth grant record.

---

## 5. Credential model — owner = Project

`DedicatedApplicationPrincipal` continua uma principal identity semântica derivada do Project.

F1 possui **um current Project-scoped asymmetric credential**.

Project owns current security facts semanticamente equivalentes a:

```text
current DEDICATED public verification material
currentCredentialGeneration
current exchange enabled/disabled condition
```

Exact columns/types pertencem ao post-C-018 Realization Planning.

Não nasce:

```text
DedicatedApplication table
DedicatedCredential table
DedicatedAccessGrant
ServiceCredential record
DedicatedSession
```

A chave pública não é secret material.

### 5.1 DEDICATED private key

A private key correspondente é custody do DEDICATED server/runtime deployment.

Nunca:

```text
browser
frontend bundle
Git
ReleaseManifest
Hub plaintext DB field
Connection CredentialBackend
logs/traces
```

Provisioning e armazenamento físico pertencem ao primeiro deployment DEDICATED / 3J.

---

## 6. Client authentication — `private_key_jwt`

F1 escolhe a mechanism family:

```text
client_credentials
+ private_key_jwt client authentication
```

A signed client assertion carrega, semanticamente:

```text
iss = DedicatedApplicationPrincipal client identity
sub = same client identity
aud = exact Conexus authorization-server identity
exp = bounded short assertion lifetime
iat = issue time
jti = unique assertion id
conexus_release_ref = exact ReleaseRef
```

Exact claim namespace/spelling é Realization Planning.

O Hub valida a assertion com o **current Project verification key**.

### 6.1 Por que `ReleaseRef` está assinada

`DedicatedApplicationPrincipal` e `ReleaseRef` são as duas asserted identities já congeladas por 3F-06.

Mantê-las na mesma assinatura impede:

```text
captured still-live client assertion
+ substitute external ReleaseRef parameter
→ different same-Project Release token
```

sem criar durable used-`jti` ledger.

A decisão não promete one-time assertion semantics crash-surviving. Assertion replay continua limitada por short `exp` + exact authorization-server audience; replay state durável retorna apenas se um current threat/guarantee exigir.

---

## 7. Token issuance guard

Antes de emitir access token, o Hub deve estabelecer:

```text
client assertion signature/issuer/audience/time valid
client identity resolves exact DedicatedApplicationPrincipal / Project
current Project verification material accepts assertion
current credential generation/exchange state admits issuance
signed exact ReleaseRef resolves
Release.runtimeProfile = DEDICATED
Release belongs to same Project
Release remains inside applicable PRESERVE/support/admissibility law
no current owner/security narrowing refuses exchange
```

Caller-supplied Project/Workspace/role/user/audience nunca amplia authority.

Authentication failure permanece PRE-CONTRACT.

---

## 8. Short-lived signed bearer access token

Após successful issuance, o Hub emite um **short-lived signed bearer access token** com claims semanticamente equivalentes a:

```text
typ = at+jwt
iss = exact Conexus issuer
sub = DedicatedApplicationPrincipal
client_id = same DAP identity
aud = narrow Conexus Platform-Service resource boundary
exp / iat / jti
conexus_release_ref = exact admitted ReleaseRef
conexus_credential_generation = current Project generation
```

Não persistir no token como lasting authority:

```text
roles
mutable grants
Workspace authority supplied by caller
current binding values
Connection credentials
other raw secrets
```

O client deve tratar o token como opaque mesmo quando a realização usar JWT.

### 8.1 No refresh token

```text
access token expires
→ client re-authenticates with current private key
→ new short-lived token
```

F1 não adiciona refresh-token secret/lifecycle.

---

## 9. Platform-Service admission

Cada protected Platform-Service request reexecuta no mínimo:

```text
validate access-token signature/type/issuer/audience/expiry
→ derive DAP + exact ReleaseRef + credentialGeneration from authenticated token
→ resolve current Project from DAP
→ verify token generation == current Project generation
→ verify Release belongs to Project
→ verify Release remains interpretable/admissible under current security law
→ derive service/audience from route/operation
→ verify exact Release-pinned composition admits that service/contract
→ apply current owner/I&A/Gateway/approval/budget/precondition gates as applicable
→ execute or fail closed
```

O access token prova **recent authentication + immutable Release assertion**. Ele não congela mutable authorization.

---

## 10. Rotation, revoke and disable

Credential mutation é security-sensitive Project mutation sob 3I-01 pre-state/current-authority law.

### 10.1 Replace / rotate

F1 atomic semantic result:

```text
register replacement public verification material
+ advance currentCredentialGeneration
→ old private key cannot mint new tokens
→ outstanding tokens with old generation fail next Platform-Service admission
```

F1 suporta uma current credential. Planned zero-downtime multi-key overlap retorna somente se uma real deployment need justificar lifecycle adicional.

### 10.2 Explicit exchange disable

DEDICATED exchange pode ser narrowed explicitamente no Project sem criar `EmergencyStop`/`ProjectKillSwitch` entity:

```text
remove/disable current verification material
+ advance generation or equivalent current fact
→ no new token issuance
→ old-generation tokens fail at next admission
```

Isso afeta apenas a DEDICATED exchange surface do Project; não reescreve Release history nem outros Projects.

### 10.3 Project ARCHIVED

```text
Project ARCHIVED
-X-> automatically disable DEDICATED exchange
```

Archive continua future-intent freeze. Security disable é explicit owner-local mutation.

---

## 11. Same-Project Release-selection residual

F1 não afirma cryptographic binary/runtime attestation.

Logo:

```text
valid Project DAP private key
+ any currently admissible ReleaseRef of SAME Project
→ may authenticate an exchange for that exact Release
```

Residual aceito:

> Compromise da Project DAP private key dá ao atacante o application principal daquele Project e a escolha entre Releases atualmente admissíveis daquele mesmo Project. Cada Release ainda restringe composition/service contracts e todas as current owner/security/effect gates continuam valendo.

Não resolve isso com per-Release credential F1 porque uma chave por Release não prova quais bytes estão realmente em execução; apenas cria key lifecycle adicional.

Reavaliar com real install-base/selective-revocation/binary-attestation requirement.

---

## 12. SERVICE_SCOPED only

F1 realiza somente:

```text
DedicatedApplicationPrincipal
+ exact ReleaseRef
→ SERVICE_SCOPED
```

`USER_DELEGATED` não possui named F1 consumer.

Own-auth DEDICATED user ref:

```text
opaque app-user ref
→ optional correlation/audit provenance attributed to app
-X-> Conexus Account
-X-> authorization principal
```

Platform Service que exige Conexus-user authority falha fechado.

---

## 13. Bearer replay residual / DPoP deferral

F1 conscientemente usa bearer token curto em vez de DPoP.

Compensating controls:

```text
TLS
short bounded token lifetime
narrow audience
no raw token logging
exact Release pin
per-request current credential-generation recheck
current owner/security checks
Gateway approval/effect/idempotency laws for external effects
```

Dois limits permanecem distintos:

```text
credentialGeneration
→ current revocation bound

access-token TTL
→ stolen-bearer replay exposure bound
```

Exact TTL é 3L/Realization Planning, mas **short/bounded** é load-bearing architecture property.

DPoP/sender-constraining retorna se houver bearer-replay incident, compliance/customer requirement, untrusted deployment fleet ou evidence de custo marginal suficientemente baixo que justifique Decision Loop.

O token shape pode preservar additive `cnf` seam futura sem alterar domain contracts.

---

## 14. Anti-oracle authentication behavior

Antes de successful authentication/admission, outcomes como:

```text
unknown client
wrong key
expired/invalid assertion
wrong assertion audience
revoked/disabled exchange
cross-Project Release mismatch
unsupported/non-admissible Release
```

pertencem externamente a uma generic authentication-failure family que não revela qual privileged fact existe.

Internal audit/diagnostic pode guardar safe metadata reason.

Após authentication/admission, 3F-05 public service-boundary semantics continuam aplicáveis.

Exact status/body/challenge/timing mechanics pertencem a Realization Planning/3L quando load-bearing.

---

## 15. Hub access-token signing key

Hub access-token signing private material é **platform operational credential**.

Não é:

```text
Connection credential
CredentialBackend consumer
Conexus authorization principal
new durable domain entity
```

3I-02 owner-specific custody principles aplicam-se:

```text
server-side only
not Git/browser/guest/app
fail closed if unavailable/invalid
secret-safe logging
audit metadata only
```

Exact deployment/rotation/JWKS realization pertence a 3J/3L/Realization Planning.

---

## 16. Credible alternatives

### A — `private_key_jwt` + short-lived bearer + current recheck

**ADOPT / GLOBAL MAXIMUM.**

Preserva strong asymmetric client authentication, exact Release binding e immediate prospective generation revoke sem PKI, session store ou sender-proof machinery.

### B — mTLS + certificate-bound token

**DEFER SAFELY.**

Strong mechanism, mas adiciona certificate issuance/PKI/TLS termination/proxy-forwarding coupling sem first-launch DEDICATED consumer.

### C — DPoP-bound access token

**DEFER SAFELY.**

Protege contra stolen access token alone, mas adiciona proof validation/replay semantics em toda request sem current failure class suficiente.

### D — shared secret / long-lived API key

**REJECT baseline.**

Cria impersonation-capable symmetric secret nos dois lados e maior leakage/replay blast radius quando asymmetric server client é viável.

### E — custom per-request signing protocol

**REJECT F1.**

Reimplementaria protocol surface já coberta por standard client authentication/token mechanism.

---

## 17. Proof strategy

Future qualification/realization deve falsificar pelo menos:

1. unknown/invalid DAP não obtém token;
2. caller-controlled Project/Workspace/role/user/audience não amplia authority;
3. Project A DAP + Project B ReleaseRef falha fechado;
4. alterar ReleaseRef após signing invalida a client assertion;
5. same signed assertion não pode ser usada para mudar ReleaseRef sem nova assinatura;
6. valid DAP + admissible same-Project Release segue explicit residual, não comportamento acidental;
7. old private key falha token issuance após replacement;
8. token generation N falha depois de current Project generation N+1;
9. access token sela exact admitted ReleaseRef e caller não pode reescrevê-la;
10. service ausente da exact Release composition não é acessível por token válido;
11. current owner/security narrowing ainda pode bloquear operação após token issuance;
12. Project ARCHIVED sozinho não desabilita exchange implicitamente;
13. explicit exchange disable bloqueia issuance e old-generation admission;
14. own-auth app user ref não vira Conexus principal;
15. DEDICATED private key não aparece em Hub DB/Git/browser/Release/log/telemetry;
16. no refresh token/session/introspection/blacklist durable state é necessário;
17. authentication errors não criam privileged existence oracle;
18. Hub signing key não expande CredentialBackend;
19. no new durable auth/grant record é necessário para one-current-credential baseline;
20. bearer TTL e credential generation são provados como bounds distintos;
21. exact pinned stack consegue realizar private_key_jwt/JWT validation sem mudar domain contracts.

---

## 18. YAGNI / explicit non-construction

Não construir no F1:

```text
DedicatedApplication table
DedicatedCredential / DedicatedAccessGrant record
DedicatedSession
ServiceCredential domain record
OAuth dynamic client registration
authorization-code/browser flow para Platform Services
refresh token / refresh-token rotation FSM
token introspection DB
access-token blacklist
durable client-assertion jti ledger
DPoP proof/jti/nonce machinery
mTLS private CA / PKI
SPIFFE/SPIRE / service mesh
client-certificate forwarding architecture
multiple active install credentials
fleet/device identity registry
per-Release credential
binary/TPM/TEE attestation
USER_DELEGATED federation
browser-direct Platform-Service authority
generic machine-identity framework
wildcard caller-controlled audience
DEDICATED physical deployment topology before first real consumer
```

Expansion somente via Decision Loop com current consumer/failure class.

---

## 19. Routing

```text
exact Project credential columns/types                  → post-C-018 Realization Planning
exact private_key_jwt/JWT library + algorithms          → 3L + Realization Planning
assertion/token TTL + clock-skew values                  → 3L / Realization Planning
exact token endpoint/wire/error spelling                 → Realization Planning
Hub signing-key deployment/rotation                      → 3J
DEDICATED private-key provisioning                       → first DEDICATED deployment / 3J
DEDICATED physical ingress/TLS/network topology          → DEFER SAFELY until first real DEDICATED deployment / 3J
DPoP/mTLS sender constraint                              → Decision Loop on trigger
USER_DELEGATED/federation                                → Decision Loop on named consumer
multi-install/fleet credentials                          → Decision Loop on install-base consumer
binary/runtime attestation                               → Decision Loop on real requirement
Trust Zones / Hub egress / telemetry crossings           → next bounded 3I closure package
hub_control Least Privilege                              → next bounded 3I closure package
```

---

## 20. Reopen triggers

Reabrir somente com evidence material, incluindo:

1. multiple DEDICATED installations precisam de independent revoke/lifecycle;
2. zero-downtime rotation exige concurrent current keys;
3. same-Project Release-selection residual é inaceitável para real consumer;
4. selective installation/Release revoke vira requisito;
5. binary/runtime authenticity vira security requirement;
6. bearer replay incident ou compliance/customer mandate exige sender constraint;
7. named Platform Service exige delegated Conexus-user authority;
8. browser-direct Platform-Service access vira requisito;
9. existing Project durable facts não conseguem representar one-current-credential lifecycle;
10. selected OAuth/JWT stack falha property load-bearing;
11. Hub/resource-server topology fica independentemente deployada a ponto de self-contained token + current recheck deixar de ser suficiente;
12. real install base exige explicit Release retirement/fleet lifecycle.

---

## 21. Formal disposition

A aprovação do operador em 2026-08-17 ratifica:

```text
3I-01 = APPROVED
3I-02 = APPROVED
3I-03 = APPROVED
3I-04 = APPROVED
3I     = IN PROGRESS

Material Finding against prior authority = NONE
reopen required                            = NONE
owner of DAP verification facts            = Project
client authentication                      = private_key_jwt
ReleaseRef binding                         = signed inside client assertion
access token                               = short-lived signed bearer
current generation recheck                 = REQUIRED
SERVICE_SCOPED                             = F1
USER_DELEGATED                             = DEFER
DPoP                                       = DEFER SAFELY
mTLS                                       = DEFER SAFELY
refresh token                              = REJECT F1
new durable record                         = 0
new Hub module                             = 0
```

Próxima ação material sob 3A-R6:

> **bounded 3I security-closure package: Trust Zones & Crossings + `hub_control` Least Privilege.**

Esta decisão não fecha 3I e não autoriza product implementation.