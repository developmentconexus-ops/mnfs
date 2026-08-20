# 3I-R1 — Security / Authority Architecture Final Closure

**Status:** APPROVED / CLOSED pelo operador em 2026-08-17  
**Fase:** 3I — Security / Authority Architecture  
**Authority:** reconciliação final de 3I-01..3I-05 após bounded independent closure review  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este fechamento não constitui C-018, não encerra a Fase 3 completa, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

3I — Security / Authority Architecture está **CLOSED / APPROVED**: o Conexus F1 possui authority corrente/revogável, custody explícita de credenciais/capabilities, spend enforcement owner-local para model I/O, trusted exchange DEDICATED, trust-zone/crossing laws e least privilege fisicamente enforçável para `hub_control`; o closure encontrou zero nova família material de segurança e somente uma composição que passa a ser explícita — mutações sensíveis que consomem authority mutável de outro owner devem preservar simultaneamente a serialização contra revogação de 3I-01 e o isolamento de schema de 3I-05, sem broad cross-owner SQL, umbrella role ou nova authorization machinery.

---

## 1. Authority e provenance

Este fechamento reconcilia:

- C-000..C-017;
- 3A-R6 — Phase 3 Critical Path & Implementation Readiness;
- 3B..3H CLOSED / APPROVED;
- [3I-01 — Current Authorization, Approver Eligibility & Revocation](3I-01-current-authorization-approver-eligibility-revocation.md);
- [3I-02 — Credential & Capability Custody](3I-02-credential-capability-custody.md);
- [3I-03 — Per-ActorRun / Per-AgentRun Model Spend Enforcement](3I-03-per-run-model-spend-enforcement.md);
- [3I-04 — DEDICATED Trusted Exchange](3I-04-dedicated-trusted-exchange.md);
- [3I-05 — Trust Zones, Crossings & `hub_control` Least Privilege](3I-05-trust-zones-crossings-hub-control-least-privilege.md).

Review/provenance não-autoritativa:

- `3I-FABLE-DIALOGUE-final-security-authority-closure.md`;
- `3I-FABLE-DIALOGUE-trust-zones-crossings-hub-control-least-privilege.md`.

O closure review independente retornou:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
missing material 3I decision                 = 0
unrouted material security blocker           = 0
3I-06                                        = NOT JUSTIFIED
verdict                                      = CLOSE 3I
```

Ele executou o sweep global de principal/authz, superfícies, custody, business/platform-control egress, model spend, DEDICATED, guest/E2B, telemetry/audit, `hub_control` e routing. Nenhuma nova authority family foi necessária.

---

## 2. Teste de fechamento

Uma pendência bloquearia 3I somente se exigisse decidir agora pelo menos um destes fatos:

```text
principal / authentication authority
current authorization / revocation semantics
credential/capability ownership or plaintext boundary
model-provider spend authority
DEDICATED server-to-platform trust meaning
trust-zone / crossing admission
business vs platform-control egress authority
telemetry producer-trust / secret propagation
hub_control privilege/isolation property
new durable security owner/state
```

Se a propriedade já está congelada e resta apenas:

```text
physical topology / ingress / TLS / backup / stop         → 3J
framework/provider/network behavior proof                 → 3L
recovery/settlement after loss                            → 3M
user-visible product/security surface                     → 3K
architecture/vertical proof                               → 3N/3O
exact route/header/role/GRANT/pool/lock/library spelling  → post-C-018 Realization Planning / implementation
future consumer-gated capability                          → Decision Loop
```

então não existe nova decisão material de 3I.

Resultado:

```text
remaining material 3I decision = 0
3I-06 = NOT JUSTIFIED
prior phase reopen = NONE
```

---

## 3. Final security / authority composition

### 3.1 Principal e authorization

```text
Account
→ human/platform principal
→ server-side session + current I&A resolution

DedicatedApplicationPrincipal
→ DEDICATED machine/application principal
→ private_key_jwt exchange + exact signed ReleaseRef
```

Guest capabilities, runtime refs, trace IDs, providers, schedules, telemetry producers and external app-user refs do not silently become principals.

`I&A ALLOW` nunca significa execução incondicional: owner/Gateway current gates, approvals, budgets, release/environment state, effect policy e demais preconditions continuam aplicáveis.

Current mutable authority é reavaliada nos protected owner control points e nos durable re-entry points já aprovados. Historical Release/run/approval facts não viram current permission snapshots.

### 3.2 Credential / capability custody

```text
Connection secret plaintext
→ write-only administration ingress + Gateway last mile only

Git write credential
→ GitInfra only

E2B control credential
→ CodingRuntime control side only

model-provider credential
→ trusted model adapter/control side only

backup / DB / Hub signing / DEDICATED credentials
→ owner-specific operational capability
```

CredentialBackend continua restrito a Connections + Gateway como consumers de Connection plaintext. Outros operational credentials reutilizam custody principles sem criar `SecretService` ou generic Credential domain.

### 3.3 Model spend

Builder ActorRun e Production AgentRun mantêm spend authority owner-local. Nenhum provider I/O billable pode escapar do pre-I/O reservation gate; retry/fallback/substitution precisa reentrar no gate; missing/unknown usage nunca liquida como zero. Exact framework interception/usage/cost behavior permanece 3L qualification.

### 3.4 DEDICATED

DEDICATED permanece external application code, não privileged Hub process. F1 usa one-current Project-owned asymmetric credential, `private_key_jwt`, signed exact ReleaseRef, short-lived bearer token e current credential-generation/narrowing recheck em toda Platform-Service admission. SERVICE_SCOPED é o único semantic mode F1; DPoP/mTLS/fleet/per-install/per-Release credential/binary attestation permanecem triggered defers/rejects.

### 3.5 Trust zones / egress / telemetry

Seis logical security zones não implicam services/processes distintos.

```text
application/business external execution
→ Capability Gateway
→ exact Connection / Project Data authority

platform-control operational egress
→ existing named owner adapter only
→ destination from owner-pinned configuration/authority
→ never from model output / caller payload / artifact content
```

E2B permanece root-capable untrusted guest; durable/ERP/Hub-DB/Git-write/model-provider secrets não entram no guest.

Telemetry transport nunca eleva `producer_trust`. Guest/provider observation nunca vira `HUB_AUTHORITY`, `AuditRecord`, authorization ou terminal owner truth por payload/transport. Credentials, mutable authority, PII/secrets e Conexus owner IDs permanecem fora de OTel baggage por default.

### 3.6 `hub_control` least privilege

Normal persistence capability é owner-scoped e não pode:

```text
read/write another owner schema
SET ROLE into another owner
own objects as ordinary runtime
SUPERUSER
CREATEROLE
CREATEDB
BYPASSRLS
```

Ordinary broad `hub_control` runtime login permanece rejeitado.

Cross-owner domain atomicity continua closed F1 set:

```text
1. CreateProject     → prj + iam initial grant
2. effect admission → gw + par approval claim
```

Audit-required same-transaction path recebe somente append capability suficiente para `obs.audit_record`; OBS read/update/delete authority não acompanha esse caminho.

`hub_control`, `mastra_builder`, `mastra_par` e Project DB credentials permanecem capabilities fisicamente isoladas. Separate DB capabilities não obrigam process split; full trusted-Hub-process RCE containment não é uma claim desta arquitetura.

---

## 4. CR-1 — current-authority serialization × owner-scoped persistence

### 4.1 Ambiguidade encontrada

3I-01 exige:

> uma mutação security-sensitive não pode consumir authority mutável, perder essa authority concorrentemente e ainda assim commitar como se a pre-state continuasse válida.

3I-05 exige:

> uma normal owner persistence capability não pode obter broad/cross-owner SQL authority para ler ou bloquear `iam.*` por conveniência.

As duas laws são compatíveis, porém precisam ser compostas explicitamente porque mutações como binding, credential, trigger, cancel ou promote podem pertencer a owners diferentes de I&A enquanto consomem current Account authority.

### 4.2 Composição ratificada

Regra normativa:

> **Toda mutação security-sensitive que consome um fato de authority mutável owned por outro módulo deve participar de uma realização de conflito/serialização comum com a mutação concorrente desse fato até o commit protegido, sem adquirir broad cross-owner schema authority ou uma umbrella database role.**

Consequências:

```text
stale authority pre-read
+ concurrent revoke/narrow
-X-> protected mutation commits successfully

owner-scoped persistence
-X-> broad SELECT/LOCK on iam.* by convenience
-X-> general cross-owner query capability
-X-> umbrella role
```

Este fechamento **não** escolhe advisory lock, row lock, `SECURITY DEFINER`, function boundary, transaction isolation spelling ou outro primitive. A seleção pertence ao post-C-018 Realization Planning, desde que preserve simultaneamente os dois invariantes.

Nenhum novo durable record, authorization service, guard engine, role hierarchy ou cross-owner transaction framework nasce de CR-1.

### 4.3 Combined proof obrigatório

A mesma realização deve demonstrar simultaneamente:

```text
A. concurrent revocation/narrowing
   → stale-authority protected mutation cannot commit

B. owner isolation
   → normal consuming owner cannot directly read/write/lock unrelated iam schema state
   → cannot SET ROLE into IAM or other owner
```

Uma realização que passa A quebrando B falha.
Uma realização que passa B quebrando A falha.

Este combined proof segue para Realization Planning e para a negative/coherence matrix de 3N/3O.

### 4.4 Reopen trigger alinhado

Reabrir o DB/security plane somente se implementation/qualification provar que a serialização exigida por 3I-01 não pode ser realizada sem:

```text
broad cross-owner schema authority
new durable authority state
new authorization owner/service
forbidden umbrella role
material process/topology split not already routed
```

Performance/pool economics isoladamente não alteram a security law; são realization/3J concerns até evidenciarem contradição material.

---

## 5. Counterexample closure

O closure tentou falsificar, entre outros:

```text
revoked Account authorizing new protected operation
stale RequestContext restoring authority
browser asserting Project/role/Release
E2B guest reaching ERP or Hub DB
model/artifact selecting privileged platform-control destination
Connection plaintext escaping Gateway last mile
telemetry self-upgrading producer trust
guest telemetry satisfying fail-closed audit
cross-Project DEDICATED Release use
old DEDICATED token surviving generation change
owner DB capability reading another schema
SET ROLE escape
cross-owner transaction profile reaching third schema
ordinary runtime using migration/backup credential
Mastra credential reaching hub_control
retry/fallback escaping model-spend gate
authentication implying unconditional execution
open routed item requiring an unmade 3I decision
```

Nenhum caminho material permaneceu reachable sob a authority aprovada. Onde a verdade depende de substrate/framework, a prova está corretamente roteada para 3L em vez de ser inventada em 3I.

---

## 6. Routing após 3I

### 3J — Deployment / Operations

MUST decidir a primeira topologia real, incluindo:

```text
Hub placement
single-host/process baseline + split triggers
hub_control / Project DB / Mastra-store placement
E2B control connectivity
MANAGED serving
TLS / ingress
operational secret injection/custody
startup/shutdown/restart
material deploy/upgrade sequence
backup set + owner
restore-proof responsibility
whole-Hub emergency stop physical procedure
host-loss/restart honesty
minimum first-internal-production availability dependencies
```

DEDICATED physical topology fica deferred até primeiro real DEDICATED deployment. Old Product Agent runtime drain/cutover fica deferred até primeiro runtime-affecting upgrade pós-produção.

### 3L — Technology Qualification

Permanece responsável pelos load-bearing probes definidos em 3A-R6, incluindo E2B, Builder/PAR Mastra, runtime isolation, model-spend interception/usage/cost e Verification Observability.

### 3M — Failure & Recovery

Permanece responsável por estrutural recovery/settlement sob loss/restart/OUTCOME_UNKNOWN/partial publication/host stop, sem transformar operações em nova security authority.

### 3N / 3O

Devem provar global coherence, negative privilege/security assertions e o vertical architecture proof contract.

### Realization Planning

Após C-018, seleciona somente detalhes derivados como:

```text
exact DB role/login/GRANT/pool spelling
CR-1 conflict/serialization primitive
exact CSRF/header/TLS/JWT/library configuration
exact operational secret injection
exact egress adapter configuration
```

Qualquer necessidade de mudar owner, trust semantics, durable state ou broad privilege retorna ao Decision Loop.

---

## 7. YAGNI / explicit exclusions preservadas

3I fecha sem criar:

```text
Keycloak/Auth0/WorkOS/external IdP requirement F1
generic authorization/policy engine
OpenFGA/Cedar/OPA/Zanzibar machinery
SecurityCommandBus / RevocationEngine
SecretService / generic Credential domain
external Vault/KMS/HSM without trigger
DPoP/mTLS PKI without trigger
fleet/device/per-install identity
model proxy/token broker/quota service
service mesh / SPIFFE-SPIRE
UniversalEgressService
network microsegmentation between in-process modules
ordinary broad hub_control runtime login
RLS engine for module ownership
generic cross-owner UnitOfWork/transaction engine
dynamic DB credential broker
telemetry PKI / per-span authorization
mandatory OTel Collector/Sentry/Spotlight
process split merely for security aesthetics
new durable security record/schema/database
```

Expansion requer named current consumer/failure class e Decision Loop.

---

## 8. Reopen triggers

Reabrir apenas a menor authority realmente implicada se surgir:

- novo principal/caller class material;
- new trust boundary, public/embedded access ou additional tenant/audience com security semantics distintas;
- real SSO/SCIM/external-IdP consumer;
- machine/service identity lifecycle materially different from current DAP/guest capabilities;
- new secret plaintext consumer;
- real bearer replay/compliance requirement firing DPoP/mTLS;
- real DEDICATED install-base/fleet/attestation/selective-revocation requirement;
- new arbitrary server-side generated-code egress surface;
- third legitimate cross-owner domain atomicity case;
- PostgreSQL/realization evidence invalidating owner-isolation or CR-1 combined proof;
- framework/provider behavior invalidating a frozen enforcement assumption;
- incident proving current emergency/serving controls structurally insufficient.

Preference, generic security catalogs or hypothetical scale do not reopen 3I.

---

## 9. Final closure

```text
3I-01 = APPROVED
3I-02 = APPROVED
3I-03 = APPROVED
3I-04 = APPROVED
3I-05 = APPROVED
3I-R1 = APPROVED / CLOSED

Material Finding against prior authority = NONE
missing material 3I decision = 0
3I-06 = NOT JUSTIFIED
prior phase reopen = NONE

new Hub module = 0
new durable security record = 0
new security database/schema = 0
new security service/engine = 0
mandatory process split = 0

CR-1 = composition clarification only

3I = CLOSED / APPROVED
NEXT = 3J — Deployment / Operations Architecture
```

Fase 3 continua em andamento até C-018. Product implementation continua proibida até C-018 + F3B-R1 + accepted post-C-018 derived Realization Planning.