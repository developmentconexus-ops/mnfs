# 3I-05 — Trust Zones, Crossings & `hub_control` Least Privilege

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3I — Security / Authority Architecture  
**Authority:** quinta decisão aprovada de 3I  
**Importante:** esta decisão não constitui C-018, não encerra 3I nem a Fase 3, não autoriza product code, merge ou PR readiness e segue 3A-R6.

## Decisão em uma frase

No Conexus F1, trust boundaries são protegidas em **dois enforcement planes de uma única authority**: crossings de browser/runtime/guest/DEDICATED/provider/telemetry possuem owner e capability explícitos, com business/application egress permanecendo Gateway-owned e platform-control egress limitado a adapters owner-specific cujos destinos derivam somente de configuração/authority pinada; e a persistência normal de `hub_control` usa **owner-scoped database capabilities** que não conseguem alcançar schemas de outros owners, enquanto os únicos acessos cross-owner são as capacidades estreitas necessárias às duas atomicidades já aprovadas e ao append audit-required. Browser auth/CSRF/CSP já congelados por C-015/C-016 são somente reconciliados por citação; nenhum service mesh, universal egress proxy, god DB role, RLS engine, new module, durable record ou process split nasce desta decisão.

---

## 1. Authority, método e provenance

Esta decisão aplica a DevelopmentConexus Engineering Method v1.0.0 e materializa, sem reabrir:

- 3A-R6 — Trust Zones/Crossings e `hub_control` least privilege são `MUST DECIDE` no nível de propriedade antes de C-018;
- C-008 — E2B como guest root-capable, durable secrets fora do guest, egress governado fora do guest e Git write mediado pelo Hub;
- C-015 — sessão server-side, cookie HttpOnly/SameSite, `Origin + Sec-Fetch-Site` em métodos mutantes, trust-zone/browser baseline;
- C-016 — application/business egress Gateway-only e browser self-only por CSP;
- 3C-13 — Audit Trail != Operational Telemetry; telemetry nunca vira domain/authorization authority;
- 3D-02/3D-04 — Gateway last-mile, três I&A entry boundaries, no cross-module table/internal access e modular-monolith DAG;
- 3E-01/3E-02 — `hub_control` com um schema por owner, closed cross-owner atomicity set, opaque `TxScope`, separate Mastra stores e closed durable-record/FK inventory;
- 3H-03 — runtime/provider/guest correlation != authority, owner IDs fora de OTel baggage por default, F5 control != telemetry;
- 3I-01 — current authority/revocation at protected control points;
- 3I-02 — narrow credential/capability custody and accepted full trusted-Hub-process compromise residual;
- 3I-03 — model provider I/O owner-local spend gate;
- 3I-04 — DEDICATED trusted exchange, external app remains outside Hub internals.

Review/provenance não-autoritativa:

- `3I-FABLE-DIALOGUE-trust-zones-crossings-hub-control-least-privilege.md`.

A revisão independente convergiu em:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
package shape                                 = ONE authority / TWO enforcement planes
DB broad umbrella login                       = REJECT
new module / record / database / process      = 0
service mesh / universal egress / RLS engine  = 0
outcome                                       = CURRENT STRUCTURE CONFIRMED
```

Correção de consolidação ChatGPT após o review:

- C-015 já congela request-authenticity concreta por `Origin + Sec-Fetch-Site` em métodos mutantes; 3I-05 não cria segunda law de CSRF;
- C-016/C-012 já congelam browser self-only/CSP; 3I-05 apenas reconcilia a crossing;
- separate per-owner PostgreSQL login capabilities são a **menor realização F1 conhecida** para SQL direto por owner sob PostgreSQL atual, não uma afirmação de impossibilidade universal de qualquer outra mechanism future; a authority congela a propriedade negativa.

---

## 2. Root cause

Uma boundary semanticamente correta pode continuar bypassável por um canal físico alternativo:

```text
browser contorna runtime SDK e chama target externo
sandbox recebe credential e chama ERP direto
model/artifact steering escolhe destination de um adapter privilegiado
app/guest envia telemetry alegando HUB_AUTHORITY
OTel baggage propaga owner/authority metadata a terceiro
module A não importa module B mas broad DB login lê/escreve b.*
normal runtime usa SET ROLE para adquirir outro owner
cross-owner transaction convenience vira god credential
```

Root cause:

> **Ownership/trust que existe apenas como convenção de código não é uma security boundary suficiente quando outro canal fisicamente admitido consegue alcançar a mesma authority.**

---

## 3. Target invariants

### T1 — Untrusted code cannot manufacture Hub authority

```text
browser / E2B guest / app-under-test / DEDICATED app / external provider input
→ request / data / observation / bounded principal quando explicitamente admitido
-X-> Hub authority por self-assertion
```

### T2 — Every material crossing is named

Toda crossing F1 com poder material possui boundary/owner e capability/credential class explícitos.

Não existe generic `networkAccess`, `databaseAccess` ou equivalente como substituto de owner.

### T3 — Application/business egress remains governed

```text
MANAGED app capability
Production Agent business/external capability
Builder governed business-data/enterprise capability
→ Capability Gateway
→ exact Connection / Project Data executor
```

Generated app/browser/guest não contornam Gateway para ERP/enterprise targets.

### T4 — Platform-control egress is distinct and owner-specific

Legitimate control-side calls podem não passar pelo Gateway somente quando pertencem a infrastructure boundaries já aprovadas:

```text
CodingRuntime → E2B
GitInfra → Git provider
Model adapter → model provider
Backup operation → backup target
admitted package/build mechanics → pinned registry/catalog target quando aplicável
```

Não nasce universal control-plane HTTP client como privileged capability.

### T5 — Egress destination is never unowned/model-selected

Para qualquer owner-specific egress adapter privilegiado:

```text
model output
caller payload
artifact/generated content
-X-> choose/widen destination authority
```

O destino efetivo deriva somente da configuração/authority pinada do owner, por exemplo:

```text
Gateway        → Connection host/target authority
GitInfra       → pinned/approved remote
CodingRuntime  → configured E2B endpoint/provider
Model adapter  → configured provider endpoint/profile
Backup         → configured backup target
Registry/build → admitted catalog/registry pins
```

Uma futura capability cujo **propósito explícito** seja browsing/model-selected navigation exige named consumer + own boundary/destination policy via Decision Loop; não é ownerless egress.

### T6 — Secret-bearing crossing is minimal

Credential cruza somente ao exact owner/last-mile que necessita dele; browser/guest/generated app nunca recebe secret por conveniência.

### T7 — Transport never upgrades producer trust

```text
authenticated transport / valid ingest capability
-X-> producer trust upgraded
```

### T8 — Telemetry context is non-authority/non-secret

Credentials, mutable authorization facts, security decisions e PII/secrets não entram em trace/baggage context. Conexus owner IDs permanecem fora de OTel baggage por default.

### T9 — Normal owner persistence cannot cross schemas

> **Arbitrary SQL reachable through uma normal owner persistence capability não pode ler, mutar nem adquirir por role switching authority sobre outro owner schema.**

Exceptions são somente capabilities explicitamente enumeradas para atomicity/audit já aprovadas.

### T10 — Runtime DB capabilities are not owners/admins

Normal runtime database capability:

```text
NO object ownership
NO SUPERUSER
NO CREATEROLE
NO CREATEDB
NO BYPASSRLS
NO broad cross-schema grants
NO SET ROLE path into unrelated owner capability
```

### T11 — Operational DB authority stays out of request runtime

Migration/backup/recovery/provisioning credentials mais amplas são operational capabilities separadas e nunca ordinary request-path credentials.

### T12 — Store/database isolation is physical

```text
hub_control owner runtime capability
-X-> mastra_builder / mastra_par / Project DB by default

mastra_builder credential
-X-> hub_control / mastra_par / Project DB

mastra_par credential
-X-> hub_control / mastra_builder / Project DB

Project query/action/migrator credential
-X-> hub_control / Mastra stores / another Project DB
```

---

## 4. Logical trust-zone model

Estas zonas são **security classifications**, não deployment units.

### Z1 — Browser / Client — untrusted caller

Inclui Control Plane, PREVIEW e PUBLISHED_APP browsers.

Mesmo com Account autenticada:

```text
browser-supplied Project/Release/role/permission/authority field
!= authority
```

Browser não possui acesso direto a `hub_control`, Project DB, Mastra stores, CredentialBackend, Connection credential, Git write authority ou Platform-Service DEDICATED authority.

Request-authenticity e self-only browser egress **não são redefinidos aqui**:

- C-015 continua authority para session/cookie + `Origin + Sec-Fetch-Site` em métodos mutantes;
- C-016/C-012 continuam authority para browser self-only/CSP e platform-owned policy.

Nova browser origin/cross-origin capability é Decision Loop/security contract change, não app-config exception.

### Z2 — Trusted Hub Control

Contém modular-monolith owners e trusted control-side runtimes quando co-located.

```text
module boundary
!= separate process/network trust zone
```

O Hub pode possuir as operational capabilities que seus owners legitimamente exigem.

Full arbitrary-code compromise do trusted Hub process continua residual F1 aceito por 3I-02; esta decisão contém **normal-path capability defects/SQL blast radius**, não promete intra-process RCE isolation.

### Z3 — Guest Execution — untrusted / root-capable

Current named guest: E2B Builder sandbox/app-under-test.

Pode receber:

```text
workspace/code/build inputs
synthetic BuildValidationDatabase
bounded runtime/control handles
narrow telemetry-ingest capability quando habilitada
```

Nunca recebe:

```text
Hub DB credential
Project authoritative DB credential
Connection/ERP credential
CredentialBackend/root material
Git write credential
model-provider/provisioning credential
backup credential
DEDICATED private key
```

Guest egress permanece deny-by-default fora do guest e é admitido somente para o bounded build/runtime surface. Exact E2B API/syntax fica 3L.

### Z4 — DEDICATED External Application — authenticated but untrusted to internals

Inbound Platform Service access somente por 3I-04.

DEDICATED pode possuir sua própria private key + short-lived Platform token, nunca Hub internals/DB/Connection/Git credentials.

Physical ingress/TLS/network topology continua deferred a 3J no first real DEDICATED deploy.

### Z5 — External Provider / Enterprise

Inclui providers como model, E2B, Git, package registry, ERP/marketplace e backup storage.

```text
TLS/authenticated external response
-X-> Hub authority
```

Business/enterprise Connection I/O é Gateway-only. Platform operational I/O usa seu existing owner-specific adapter.

### Z6 — Trusted Data / Storage Infrastructure

Inclui logicamente:

```text
hub_control
Project databases
mastra_builder
mastra_par
BlobStore/CAS backing
CredentialBackend backing
backup material
```

Não é um credential domain único. Cada store possui somente as capabilities justificadas por owner/lifecycle.

---

## 5. Crossing matrix — property level

| From | To | F1 | Capability/authority | Security law |
|---|---|---:|---|---|
| Browser | Hub/L7/MAR | yes | Account session + surface server checks | caller fields non-authority; C-015/C-016 preserved |
| Browser | privileged external target | no direct platform path | none | business egress via Hub/Gateway |
| Builder control | E2B control plane | yes | CodingRuntime credential | pinned owner destination |
| Hub model loop | model provider | yes | model credential + 3I-03 gate | no guest key; destination owner-derived |
| Git mechanics | Git provider | yes | GitInfra credential | guest never gets write credential |
| Gateway | ERP/enterprise | yes | exact Connection last-mile credential | Gateway admission required |
| Backup ops | backup store | yes | backup operational credential | not ordinary request authority |
| E2B guest | Hub runtime callbacks | narrow | admitted runtime channel | no general Hub API authority |
| E2B guest | telemetry ingest | optional narrow | Hub-minted guest capability | Operational Telemetry only |
| E2B guest | ERP/Hub DB/Git write/model provider | no privileged path | none | deny-by-default |
| DEDICATED | Platform Services | yes | 3I-04 DAP + exact Release token | server-to-platform only |
| External provider | Hub | response / separately admitted ingress | observed/provider data | never authority by transport |
| Hub owners | `hub_control` | yes | owner-scoped DB capabilities + named exceptions | no ordinary god login |
| Role runtime | Mastra store | yes | exact role/store credential | substrate only; no control authority |

Ports/hosts/proxies are 3J/Realization, not this authority.

---

## 6. Hub control-side egress law

C-016 Gateway-only remains exact for **application/business capabilities**.

Platform operational egress is not forced through Gateway for vocabulary uniformity.

Every platform adapter must have:

```text
named owner
owner-specific credential/capability
server-derived/pinned destination authority
no model/caller/artifact destination widening
no guest/generated-app access to privileged client
safe logging/redaction
fail closed when required credential/target absent
```

No `UniversalEgressService`, generic privileged `fetch(url, secret)`, sidecar mesh or all-traffic proxy F1.

---

## 7. Telemetry crossing law

### 7.1 Producer trust is boundary-derived

Producer trust class derives from the authenticated/admitted producer boundary, never producer payload.

Conceptual mapping remains:

```text
Hub owner/audit facts     → HUB_AUTHORITY
Gateway receipts/facts    → GATEWAY_AUTHORITY
provider/runtime evidence → PROVIDER_OBSERVED
app/guest telemetry       → GUEST_OBSERVED
```

Guest cannot request an upgraded trust class.

### 7.2 Guest telemetry cannot mint Audit authority

Guest telemetry capability may submit only the Operational Telemetry path.

It cannot create/fulfill fail-closed `obs.audit_record` required by material Hub authority mutations.

### 7.3 Baggage/context

Default:

```text
credentials
security decisions
mutable authority facts
PII/secrets
Conexus owner IDs
-X-> OTel baggage
```

Before external/untrusted egress, baggage must be absent/cleared unless a future explicitly admitted crossing says otherwise.

`traceparent`/trace context remains correlation only; forwarding to external providers is owner-policy/realization, never authority requirement.

Exact propagators/header stripping are 3L/Realization.

### 7.4 Missing telemetry

Preserve 3C-13/3H-03:

```text
ordinary telemetry unavailable
→ degraded/MISSING may continue where not required

verification-required evidence unavailable
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS by absence
```

---

## 8. `hub_control` least-privilege model

### 8.1 Object ownership

Cada owner schema possui non-login object owner role ou equivalent ownership identity.

Normal request/runtime login capabilities não são object owners.

### 8.2 Normal owner persistence capability

Cada persisted owner possui database capability efetivamente limitada ao seu próprio schema + exact DB mechanics necessárias.

A authority congela a **negative property**, não count/names de pools.

Current smallest known F1 realization for direct owner SQL under PostgreSQL:

```text
owner-scoped LOGIN/credential capability
→ only owner schema privileges
```

Realization Planning pode escolher one pool per owner, lazy pools ou equivalent connection management, desde que a negative matrix prove T9/T10.

### 8.3 Umbrella login rejected

Rejeitado para F1:

```text
one ordinary hub_runtime login
+ broad grants to all owner schemas
```

Também rejeitado como tentativa de isolamento:

```text
one login NOINHERIT
+ SET-able membership in all owner roles
```

porque documented PostgreSQL role semantics permitem `SET ROLE` quando membership concede SET authority; isso mantém outros owners reachable pela mesma authenticated session.

Equivalent future realization permanece admissível somente se seus negative tests provarem que arbitrary SQL de uma normal capability não consegue alcançar/adquirir outro owner.

### 8.4 Runtime capability floor

Normal runtime capability não possui:

```text
SUPERUSER
CREATEROLE
CREATEDB
BYPASSRLS
ownership
schema-create authority fora do necessário
unrelated owner memberships/grants
```

`search_path` nunca é security boundary; schema qualification/default privileges devem compor a realização segura.

### 8.5 Pool/connection budget is realization, not reason to collapse authority

~13 owner capabilities + narrow transaction profiles possuem custo de connection/pool management.

Realization Planning deve dimensionar/lazily instantiate/reuse safely conforme necessário, mas **não pode resolver max_connections/convenience colapsando owner capabilities em um broad runtime login**.

---

## 9. Cross-owner transactions — closed exception set

3E-01 already approved exactly two current cross-owner domain atomicity cases.

### X1 — CreateProject

```text
prj create
+ iam initial grant
```

### X2 — Material effect admission

```text
gw admission
+ par approval single claim
```

Cada caso pode usar uma named narrow transaction capability com somente as exact operations necessárias àquele use case.

Não são grants genéricos de DML sobre ambos os schemas.

```text
third cross-owner atomic domain use case
→ Decision Loop
```

Não existe `GlobalHubTransactionRole`.

`TxScope` continua opaque/query-incapable e não concede raw SQL cross-owner.

---

## 10. Audit-required transaction path

Preserve 3E-01/3C-13:

```text
audit-required material mutation
→ domain owner mutation
+ required obs.audit_record append
→ same local transaction when required for fail-closed
```

A DB capability usada nesse path pode apenas **append the required audit record**; não ganha OBS read/update/delete authority.

Architecture freezes the property, not exact realization.

Admissible current realization families include:

```text
A. narrow INSERT grant on obs.audit_record
B. obs-owned narrow SECURITY DEFINER append function + EXECUTE
```

Realization Planning escolhe pelo menor shape seguro para exact schema/constraints.

Owner-local audit staging + later projection é rejeitado quando quebraria a same-transaction fail-closed law.

---

## 11. Store/database capability isolation

Realization must prove negative CONNECT/usage matrix equivalent to:

```text
hub owner runtime → only hub_control + its owner schema
Builder Mastra    → mastra_builder only
PAR Mastra        → mastra_par only
Project query     → exact Project DB read surface only
Project action    → exact Project DB DML surface only
Project migrator  → exact Project DB migration surface only
backup/recovery   → explicit operational scope only
```

No ordinary capability gets cross-store authority by convenience.

Separate DB capabilities do **not** imply separate processes. Same Hub process may own multiple capability handles while full-process compromise remains accepted residual.

---

## 12. Browser rules — citation only

Esta decisão não duplica browser-security authority já existente.

Preserve by citation:

```text
C-015
→ server-side session
→ HttpOnly/SameSite cookie law
→ Origin + Sec-Fetch-Site on mutating methods
→ zero browser JWT/localStorage auth

C-016/C-012
→ browser self-only outbound-origin/CSP law
→ platform-owned immutable security header baseline
```

Any new browser-direct external origin, embed/public trust regime or altered session/auth mechanism returns through its existing Decision Loop trigger.

---

## 13. Explicit F1 non-construction

Do not create from this decision:

```text
service mesh
SPIFFE/SPIRE
UniversalEgressService
privileged generic fetch client
NetworkPolicy DSL
microservice-per-module
network segmentation between in-process modules
database-per-Hub-module
RLS/policy engine for module ownership
generic authorization engine
generic transaction/UnitOfWork engine
dynamic DB credential broker
per-request ephemeral database roles
telemetry PKI
per-span authorization
mandatory OTel Collector/backend
new durable record
new Hub module
process split solely for owner DB credentials
```

Re-entry only on named current consumer/failure class.

---

## 14. Proof strategy

This authority is falsified by a negative-capability matrix.

### 14.1 Crossings

At minimum prove later:

```text
browser cannot choose Project/Release/role authority by payload
browser generated code cannot widen external origin under current C-016 law
E2B guest cannot access Hub DB/Project authoritative DB/ERP/Git-write/model credential
platform-control adapter rejects destination derived from model/caller/artifact content
Gateway alone materializes Connection last-mile secret
DEDICATED has no Hub DB/Connection/Git authority
telemetry payload cannot choose producer_trust
Guest telemetry cannot create AuditRecord
external egress carries no forbidden baggage/secret metadata
```

### 14.2 `hub_control`

For every normal owner runtime capability:

```text
own expected SELECT/INSERT/UPDATE/DELETE surface → as needed ALLOW
other owner schema SELECT                       → DENY
other owner schema INSERT/UPDATE/DELETE         → DENY
CREATE/ALTER/DROP unrelated objects             → DENY
SET ROLE to another owner                       → DENY
BYPASSRLS/SUPERUSER/CREATEROLE/CREATEDB         → absent
```

Negative tests use fresh sessions where PostgreSQL privilege revocation timing could leave already-open sessions with previously acquired privileges.

### 14.3 Transaction/audit profiles

```text
X1 can do exact prj-create + iam-initial-grant only
X2 can do exact gw-admission + par-claim only
cross-owner capability cannot access third schema
Audit append path can append required record
Audit append path cannot SELECT/UPDATE/DELETE OBS
```

### 14.4 Store isolation

Wrong database/store connection attempt must fail for normal capabilities.

3N/3O must include the final privilege/crossing negative matrix; exact DDL/grants/pool/API probes are Realization/3L where external behavior is load-bearing.

---

## 15. Routing after this decision

### 3J

```text
physical Hub ingress/TLS/DNS/reverse proxy
process/container placement
physical firewall rules
backup credential injection/runbook
whole-Hub emergency-stop procedure
first-production topology
physical DEDICATED network only on first real DEDICATED consumer
```

### 3L

```text
E2B pinned-version deny-by-default behavior
OTel propagator/header stripping behavior needed by Verification Observability
runtime isolation existing probes
other already-ratified load-bearing technology probes
```

### Post-C-018 Realization Planning

```text
exact PostgreSQL role/login/grant names
pool/lazy connection topology
exact cross-owner transaction profiles
exact audit append mechanism
exact CSRF/CSP/header mechanics already derived from C-015/C-016
exact OTel/exporter/collector realization
exact owner adapter endpoint config
```

### 3M

Only concrete failure/recovery semantics already routed; this decision creates no new recovery record/lifecycle.

### Decision Loop / DEFER SAFELY

```text
Product Agent arbitrary browsing/network capability → named consumer
new browser-direct external origin                  → named product requirement
new cross-owner atomic use case                     → third case
external IdP / SSO / SCIM                           → directory/customer trigger
process split for credential isolation              → concrete isolation Finding
```

---

## 16. Reopen triggers

Reopen only the implicated plane when evidence shows:

### Crossing plane

1. first real arbitrary server-side generated-code/network surface;
2. named Product Agent browsing capability requiring model-directed destinations;
3. new browser-direct external origin / embed/public trust regime;
4. new external ingress/webhook consumer whose trust cannot fit current owner boundary;
5. DEDICATED deployment requires materially different trust crossing;
6. OTel/provider behavior makes required stripping/provenance property unrealizable;
7. E2B network isolation fails the required deny-by-default property.

### DB plane

8. owner-scoped capabilities cannot meet connection/performance needs without material operational harm;
9. PostgreSQL semantics/version change provides a demonstrably smaller equivalent isolation mechanism;
10. a third cross-owner atomic domain use case becomes real;
11. a real owner legitimately requires direct cross-schema SQL, contradicting 3D/3E;
12. process compromise containment becomes a requirement, exceeding current normal-path SQL isolation scope.

No trigger reopens unrelated 3I authority automatically.

---

## 17. Security scope honesty

This decision protects:

```text
wrong/bypassed crossing
credential overreach
model/caller destination injection into privileged adapters
telemetry trust forgery
normal-path SQL/persistence blast radius
cross-store accidental reach
```

It does **not** claim:

```text
full arbitrary Hub RCE containment
zero-trust microsegmentation inside one process
cryptographic attestation of every runtime
complete future SaaS enterprise IAM
all future ingress/egress classes
```

Those guarantees are neither required nor secretly implied by F1.

---

## 18. Outcome

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
method outcome                                = CURRENT STRUCTURE CONFIRMED
package                                       = ONE authority / TWO enforcement planes
logical trust zones                           = 6
new module                                    = 0
new durable record                            = 0
new database                                  = 0
new process                                   = 0
service mesh / universal egress               = 0
RLS/policy engine                             = 0
ordinary broad hub_control login              = REJECT
owner-scoped normal persistence capability    = REQUIRED PROPERTY
cross-owner domain transaction cases          = CLOSED SET = 2
browser auth/CSRF/CSP new authority            = 0; cite C-015/C-016
```

After this decision, current evidence shows **no remaining material 3I family**. 3I remains `IN PROGRESS` only until one bounded independent closure review verifies:

```text
missing trust boundary?
duplicate authorization authority?
secret path widened?
current revocation path missing?
new durable security record secretly required?
unrouted material security C-018 blocker?
```

If that review finds none, the correct next decision is `3I-R1` closure; no additional 3I topic is justified.