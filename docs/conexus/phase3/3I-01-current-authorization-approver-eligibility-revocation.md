# 3I-01 — Current Authorization, Approver Eligibility & Revocation

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3I — Security / Authority Architecture  
**Authority:** primeira decisão aprovada de 3I  
**Importante:** esta decisão não constitui C-018, não encerra 3I nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, trabalho protegido usa **authority atual derivada server-side nos control points aplicáveis**, nunca autorização histórica/cache/runtime como poder durável; mutações security-sensitive usam authority de **pre-state** e precisam ser atomicamente serializadas contra revogação concorrente dos facts consumidos; `ALLOW_ONCE` só pode ser decidido por `Account` atualmente elegível segundo o permission model declarado da ação exata na surface owner-derived, com self-approval permitido por ser não-escalante; decisões/história permanecem imutáveis enquanto revogações estreitam authority prospectivamente nos owner control points; e F1 não cria auth snapshot/cache invalidation bus, policy/revocation engine, universal four-eyes nem security-stop entity, deixando whole-Hub stop como obrigação operacional de 3J e um eventual per-Project serving stop apenas para Decision Loop se um incidente real provar a necessidade.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa sem reabrir:

- 3C-02 — Identity & Access: current Account/session/access relationships, surface isolation e `I&A ALLOW != execution ALLOW`;
- C-015 — MANAGED server-side session/access baseline e role/permission manifest;
- 3F-03 — exact sealed `ApprovalRequest`, server-derived approver principal/eligibility e single claim;
- 3G-01 — write-once approval decision, expiry e permanent binding após committed admission;
- 3G-05 — pinned AgentRun, cancel semantics e current owner/security gates;
- 3G-06 — Gateway last-mile authority e `close-before-dispatch × dispatch` race;
- 3G-07 — archive é future-intent freeze, não security stop/unpublish;
- 3G-08 — immutable Release history + independent current narrowing;
- 3H-01..03 — current authority reapplied on runtime re-entry, RequestContext rebuild e runtime/telemetry non-authority;
- C-010/C-011/C-013/C-014/C-016/C-017 — agent authority/budgets, owner-committed health/conformance, provenance, conformance e anti-overengineering.

Review/provenance não-autoritativa:

- `3I-FABLE-DIALOGUE-security-authority-intake-decomposition.md`;
- `3I-FABLE-DIALOGUE-current-authorization-approver-revocation.md`.

A review independente convergiu em:

```text
Material Finding contra 3C..3H = NONE
reopen required                 = NONE
Alternative B                   = GLOBAL MAXIMUM
outcome                         = CURRENT STRUCTURE CONFIRMED
new module                      = 0
new durable record class        = 0
new policy/revocation engine    = 0
new auth snapshot/cache bus     = 0
new approver role/four-eyes     = 0
new stop/hold entity            = 0
```

NIST/OWASP e PostgreSQL oficial foram usados somente como evidence externa proporcional; nenhum framework/protocolo/locking mechanism é authority por esta decisão.

---

## 2. Escopo exato

3I-01 fecha:

```text
A. current authorization resolution / freshness
B. mutable-authorization cache baseline
C. security-sensitive mutation pre-state + concurrency law
D. ALLOW_ONCE approver eligibility + self-approval baseline
E. post-approval authority loss semantics
F. Account-origin durable-work re-entry law
G. owner-local revocation / cancellation / old-Release narrowing
H. emergency-stop deletion test + later seam
```

Não fecha:

```text
credential plaintext/master-key/backend custody              → later 3I
per-ActorRun/per-AgentRun model spend enforcement            → later 3I
DEDICATED authentication/credential/delegation mechanism      → later 3I
runtime/browser/network/telemetry trust-zone crossing law     → later 3I
hub_control/PostgreSQL role realization                       → later 3I
physical whole-Hub stop / ingress/process/network procedure   → 3J
exact row-lock/isolation/query implementation                 → implementation; 3L only if version behavior becomes load-bearing
post-stop/orphan/outcome settlement                           → 3M
approval/security UX                                          → 3K
```

---

## 3. F1 principal vocabulary carried by citation

O intake provou que uma decisão separada de principal taxonomy seria restatement. Este preâmbulo é ratificado **como vocabulary desta decisão**, não como segunda authority sobre 3C/3F/3H.

### Inbound Conexus authorization principals

Current F1 closed set:

```text
Account
→ human Conexus authorization principal

DedicatedApplicationPrincipal
→ non-human Conexus authorization principal for DEDICATED server-to-platform exchange
```

A concrete DEDICATED authentication mechanism continua aberta para decisão posterior de 3I.

Explicit non-principals:

```text
ActorRunId / AgentRunId / CodingSessionId / ConversationId
ApprovalRequestId / ReleaseRef
Mastra/E2B/runtime/provider/trace refs
Builder / PAR / Gateway runtime roles
Git author/committer identity
own-auth DEDICATED app-user refs
```

Eles podem identificar domain history, runtime, provenance ou correlation; nunca autenticam ou ampliam Conexus authorization.

### Outbound technical credentials are not principals

Credenciais que o Hub apresenta como client para Git, E2B, model providers, PostgreSQL, backup, registries ou outros owner-specific consumers são **capabilities/custody**, não Conexus principals. Elas nunca se transformam automaticamente em `Account`, role ou platform permission.

Nova principal class exige Decision Loop com named consumer/failure class.

---

## 4. Root cause e target invariants

O failure class restante é **stale ou self-manufactured authority**:

```text
old session/access result + current revoke → still allowed
proposed admin role authorizes its own grant
historical Release/run pin → treated as irrevocable permission
any authenticated human → approves effect they are not allowed to authorize
runtime/trace/telemetry identity → becomes pseudo-principal
post-approval security change → rewrites history or bypasses current effect gates
```

Target invariants:

### I1 — Current mutable authority

> **Cada protected admission/mutation resolve os mutable authority facts relevantes ao seu boundary a partir dos current owners. Uma decisão anterior não vira blanket authorization para operação posterior.**

### I2 — Authentication != complete authorization

```text
authenticated principal
→ may enter authorization evaluation
-X-> unconditional execution
```

### I3 — Surface isolation

```text
CONTROL_PLANE != PREVIEW != PUBLISHED_APP authority
```

### I4 — Mutation cannot authorize itself

> **Security-sensitive mutation usa somente pre-mutation current authority; qualquer authority criada pela proposta não participa de sua própria autorização.**

### I5 — Owner meaning remains owner-local

```text
operation owner declares permission/state preconditions
I&A resolves current Account access context
owner/Gateway applies remaining current gates
```

### I6 — History stays historical

Release/Run/Approval/Promotion/EffectAttempt history não é reescrita porque current authority mudou.

### I7 — Current narrowing is prospective at the next real control point

Revogação impede a próxima protected admission/transition que seu owner governa; não promete rollback impossível de um physical boundary já cruzado.

### I8 — No authority resurrection

Stale ViewerContext, RequestContext, runtime state, telemetry, Release history ou caller payload não podem transformar current deny em allow.

---

## 5. Current authorization resolution

### 5.1 Account-origin protected request

Server deriva:

```text
Account from current valid session
surface
Workspace / Project / resource identity
operation owner
exact immutable policy/action revision when applicable
```

E compõe:

```text
current I&A facts
├── Account auth-enabled/current session truth
├── current memberships/grants
├── current surface-specific relationship/role
└── effective permission required by operation owner
        ↓
owner/domain current state + preconditions
        ↓
ALLOW | DENY
```

Caller/browser/model não fornece authoritative `AccountId`, role, permission, surface, authorization result ou approval validity.

### 5.2 Runtime-origin protected work

Runtime identity não é principal. Runtime work usa:

```text
owner-admitted run/dispatch identity
+ exact immutable pins
+ current owner/security facts required at that control point
```

Mastra/E2B/trace/provider IDs são correlation/observation only.

### 5.3 DEDICATED

3I-01 não escolhe mechanism. Preserva somente:

```text
authenticated DedicatedApplicationPrincipal
+ exact ReleaseRef
+ server-derived Project/audience/composition
+ current owner-side narrowing
→ possible Platform-Service admission
```

A realização pertence à decisão posterior de DEDICATED Trusted Exchange.

---

## 6. Mutable authorization cache baseline

F1 não mantém cross-request cache de mutable I&A authority facts:

```text
Account enabled/disabled
session current validity
memberships
grants
Published App access relationship/current role
```

Protected boundaries resolvem current authority diretamente.

Permitido:

```text
same request / invocation / transaction
→ reuse one resolved context

immutable fact pinned by exact identity/digest
→ may be cached
→ still intersects current mutable authority
```

Não criar no F1 sem evidence de escala:

```text
AuthorizationEpoch
auth_version invalidation bus
Redis authorization cache
AuthoritySnapshot
policy snapshot table
```

Reopen somente por measured authorization-path pressure. Qualquer futuro cache precisa declarar maximum revocation staleness e provar negative revocation behavior.

---

## 7. Security-sensitive mutation law

### 7.1 Pre-state only

Security-sensitive mutation é autorizada inteiramente contra pre-mutation current authority.

```text
current caller authority
+ owner-specific current scope/lifecycle/preconditions
→ may mutate

proposed new role/grant/binding/state
-X-> help authorize the same mutation
```

Self-widening sem pre-state permission é `DENY`.

Narrowing também não bypassa caller authorization apenas por reduzir poder, salvo narrow path explicitamente criado pelo owner anterior — por exemplo trigger `DISABLE` while ARCHIVED — e ainda exige a permission daquele owner.

### 7.2 Atomicity against concurrent revocation

Para **security-sensitive Hub-control mutations**, a authorization read que decide `ALLOW` e o mutation commit formam um único guarded atomic decision:

> **Todos os mutable authority facts consumidos pela decisão devem ser serializados contra revogação concorrente até o commit da mutation.**

Portanto:

```text
read A authority = ALLOW
concurrent revoke/demote A commits
A mutation of B commits from stale pre-read
```

é proibido.

Mechanism exato não é frozen. Realizações válidas podem usar locking read, serializable transaction/retry, fresh conflicting guard ou equivalente que prove a propriedade.

Serialization/guard conflict:

```text
-X-> commit from stale authority
→ retry, if any, is a NEW authorization attempt from current facts
```

CAS apenas no target row não é prova quando authority depende de rows diferentes.

3E-01 TxScope pode suportar sanctioned cross-owner Hub-control transaction; esta law não autoriza transaction atravessando Git/network/external I/O.

### 7.3 Scope examples

A mesma law cobre semanticamente, com owner-specific permissions:

```text
membership / grant / role mutation
Project binding SET / UNBIND
credential create/replace/revoke eligibility
AgentTrigger CREATE/ENABLE/DISABLE/update
AgentRun/ActorRun cancel
Release promote/recovery operation
security-sensitive account/session administration
```

A lista é ilustrativa; não nasce generic mutation registry.

---

## 8. `ALLOW_ONCE` approver eligibility

### 8.1 Human decision authority

Somente human `Account` pode escrever:

```text
ALLOW_ONCE | DENY
```

Agent, DedicatedApplicationPrincipal, runtime/provider/guest identity não são human approvers.

### 8.2 Current eligibility at decision write

PAR deriva server-side:

```text
exact ApprovalRequest
Project
owner-derived governing surface
exact sealed effect subject
exact pinned action/tool/effect security metadata
current Account access context
```

Eligibility é medida contra o **declared permission model da ação exata na governing surface**, não contra UI reachability.

Quando action permission vem de pinned Release/manifest, o exact pinned permission layer governa; control-plane operations usam a permission declarada pelo owner correspondente.

Trigger-origin AgentRun sem requesting human session continua tendo governing surface/policy **owner-derived from exact composition**, nunca caller-chosen ou undefined.

Normative law:

> **O agent não pode usar human approval para obter platform authority que a Account aprovadora não possui atualmente sob o permission model declarado da ação exata.**

No new `ApproverRole`, approver ACL ou approval policy store.

### 8.3 Ineligible decision attempt

```text
current Account ineligible
→ no decision write
→ ApprovalRequest remains undecided/decidable by another eligible Account until existing lifecycle/expiry says otherwise
```

Não nasce `DENIED_BY_AUTHZ` state nem novo public oracle automaticamente.

### 8.4 Self-approval baseline

Self-approval é permitido no F1 quando a mesma Account é independentemente eligible sob §8.2.

A razão principal é **non-escalation**:

```text
human already holds the exact required platform permission
+ human sees exact sealed agent effect
+ ALLOW_ONCE
→ zero new platform privilege
```

Approval é checkpoint contra **agent autonomy**, não uma segunda human-control layer por default.

Universal `requester != approver` só adicionaria availability/product dependency sem remover privilege de um human já autorizado a causar aquela operation.

Se um named workflow exigir independência real:

```text
requester != approver
2-of-N humans
role A proposes / role B approves
financial/legal dual control
```

retorna ao Decision Loop; não vira generic IAM machinery antecipadamente.

---

## 9. Post-approval authority change

`ALLOW_ONCE | DENY` committed continua immutable human history.

Later approver demotion/disable:

```text
-X-> rewrite/delete decision
-X-> reopen decision slot
-X-> replace approver
-X-> add live-I&A eligibility recheck inside FIRST_CLAIM
```

Não rechecamos approver eligibility no effect claim/dispatch. Isso criaria um segundo authorization model e resurrection semantics sobre uma decisão write-once.

A composição segura já existe:

```text
existing ApprovalRequest expiry
→ bounds pending approval staleness

revoke/demote Account
→ blocks future decisions/admissions at their current gates

incident against pending effect
→ owner CANCEL when applicable
→ Gateway close-before-dispatch if NOT_SENT and close wins

current Connection/security/Gateway gates
→ still apply regardless of historical approval
```

A segurança ataca **future authority / pending effect**, não falsifica history.

---

## 10. Durable work and current-authority re-entry

ActorRun/AgentRun admission é historical owner fact; interactive session lifetime não é durable-run lifetime.

```text
logout / session expiry
-X-> rewrite or auto-cancel an already-admitted run
```

Também não existe eternal authority from run start.

Cada durable continuation reentra no current authority model apropriado ao path:

```text
Builder dispatch/rebind
→ current Conexus authority/config reapplied under 3H-01

new interactive protected admission
→ current Account/session/I&A facts

trigger firing
→ current Trigger/Release/PAR admission facts; no invented requesting Account

human approval decision
→ current approver Account eligibility under §8

Gateway admission/effect
→ current capability/Connection/security/budget/precondition gates

boot/recovery re-drive
→ current owner guards under 3H-02/3G laws
```

For Account-origin durable work, Account platform facts are re-resolved wherever that later path actually requires Account authority. Session metadata itself is admission-only and is not polled continuously mid-segment.

A currently executing bounded segment may reach its owner terminal under admitted pins; incident response uses owner cancel/close rather than continuous permission polling or history mutation.

---

## 11. Current narrowing and old Releases

An exact historical Release continua authority de **interpretation/composition**, não irrevocable permission.

Cada live protected operation intersecta current owner-committed facts que possuem independent security meaning.

Examples of current narrowing facts already owned elsewhere:

```text
current Account/access relation where Account authority applies
Connection credential/grant/current eligibility
AgentTrigger enabled/disabled at new trigger admission
AgentRun/ActorRun current terminal/cancel truth
Gateway current admission/close/security gates
Brain owner-committed health states where prior authority says they gate effects
EnvironmentConformance owner state
maintenance/serving blocks
Release support/compatibility/current rollout gates
```

Not security revocation by themselves:

```text
Project current binding ref changed
newer Release exists
Project ARCHIVED
raw telemetry/trace/provider/guest says unhealthy
runtime snapshot/process observation is missing
```

A distinção de health/conformance é pelo **owner-committed fact**, não pela palavra “health”. Raw observation nunca vira authorization authority.

Consequências:

```text
old Release + current Connection revoked
→ new Gateway use denied
→ Release history unchanged

new binding / newer Release / archive
-X-> silently rewrite old Release/run authority
```

No `CurrentSecurityPolicySnapshot`.

---

## 12. Cancellation and Gateway close-before-dispatch

Nenhum caller recebe generic permission para editar `gw.effect_attempt`.

Normal path:

```text
currently authorized cancel/narrow command
→ domain owner validates permission + commits owner truth
→ owner may request narrow Gateway close for related admitted NOT_SENT attempt
→ Gateway existing CLOSE × DISPATCH guard decides physical possibility
```

Examples:

```text
cancel wins before FIRST_CLAIM
→ claim refused

cancel after admitted NOT_SENT
→ close wins  → never sent
→ dispatch wins → cannot pretend no effect
```

I&A resolve current Account authority; cada domain owner define sua cancel/narrow permission e semantics. No `UniversalCancelPermission`, `SecurityCommandBus` ou public EffectAttempt admin API.

---

## 13. Emergency-stop deletion test

Deletion test passou para F1; **nenhuma stop/hold entity é criada por 3I-01**.

Current incident controls:

```text
compromised Account       → revoke access + authorized owner cancel of affected runs
compromised Connection    → credential/grant revoke
malicious trigger source  → AgentTrigger DISABLE
runaway agent             → cancel + later 3I model-spend caps
unsafe Release + safe predecessor → rollback Promotion under current conformance
admitted NOT_SENT effect  → Gateway close-before-dispatch when owner requests and close wins
```

Residual class identificada:

```text
actively malicious served app
+ no safe predecessor
→ owner-local controls can stop privileged effects but may not stop serving itself quickly
```

F1 **não** cria `SecurityHold` apenas por esse possível caso. O current single-Hub architecture usa whole-Hub operational stop como fallback de incidente, mas esse fallback ainda é uma obrigação a ser materializada e provada em 3J antes de production.

3J deve provar pelo menos:

```text
how ingress/process is stopped
fail-closed behavior for new work
what happens to in-flight work at the operational stop boundary
```

3M owns post-stop settlement/recovery.

Reopen / Decision Loop se incident/probe real provar que whole-Hub stop é operacionalmente inaceitável e um Project precisa parar serving sem afetar outros Projects. O seam provável é:

```text
per-Project SERVING stop
owner = serving-admission boundary (Release / MAR)
-X-> I&A
-X-> Project lifecycle
-X-> new generic kill-switch module by default
```

Nenhuma entity/mechanism é admitida agora.

---

## 14. Authority / boundary summary

```text
Identity & Access
→ Account/session current truth
→ memberships/grants/roles/app-access
→ current access-context resolution
→ I&A-owned security mutations

operation/domain owner
→ operation meaning + required permission
→ resource/lifecycle current preconditions
→ cancel/narrow semantics

PAR
→ AgentRun / ApprovalRequest / AgentTrigger current domain truth

Gateway
→ last-mile capability/effect admission
→ current Connection/security gates at execution
→ EffectAttempt physical truth + close-before-dispatch race

Release / MAR
→ Release composition/promotion/serving admission authority
→ future per-Project serving-stop seam only if Decision Loop proves it

Observability
→ evidence/audit
-X-> current authorization
```

Two authorities for the same permission/revocation meaning remain prohibited.

---

## 15. Enforcement

```text
E1 server-derived principal/resource/surface at protected boundaries
E2 current mutable I&A resolution; no cross-request mutable-auth cache F1
E3 owner-declared permission; no scattered parallel role policy
E4 sensitive mutation pre-state authority + atomic serialization against concurrent revoke of consumed authority facts
E5 PAR human decision write only after exact current eligibility
E6 durable re-entry uses current owner authority appropriate to the path
E7 Gateway re-applies current last-mile gates independent of historical approval/Release
E8 no fan-out rewrite of historical Runs/Releases/Approvals
E9 raw telemetry/runtime/provider state never manufactures current authority
E10 existing audit boundary records required security events but never authorizes them
```

Controls count only when negative/concurrency proof can show them firing.

---

## 16. Proof obligations

At minimum, prove/falsify:

1. stale browser/ViewerContext after membership/role revoke cannot perform next protected request;
2. CONTROL_PLANE access does not grant PUBLISHED_APP/PREVIEW authority implicitly;
3. restart does not resurrect mutable authorization from memory/cache;
4. self-grant payload cannot bootstrap its own permission;
5. concurrent demotion/revoke of caller conflicts with a sensitive mutation authorized from that fact; stale pre-read cannot commit;
6. retry after serialization conflict re-resolves current authority;
7. unauthorized Account cannot write `ALLOW_ONCE`; exact eligible Account can;
8. trigger-origin approval uses owner-derived governing surface/action permission, never caller-provided surface;
9. same eligible Account may initiate + approve under F1 without privilege escalation;
10. later approver demotion does not rewrite decision or add claim-time eligibility resurrection;
11. expiry + owner cancel/close + current Gateway gates prevent pending effect from becoming irrevocable merely due historical approval;
12. logout/session expiry does not auto-kill admitted durable run, while later protected re-entry cannot use stale Account authority;
13. trigger DISABLE / run CANCEL / Gateway CLOSE races preserve already-approved owner laws;
14. old Release + current Connection revoke denies new use without mutating Release history;
15. raw telemetry cannot gate authorization while owner-committed health/conformance states still apply where prior authority requires;
16. archive/new binding/new Release do not become hidden security revocation;
17. no generic policy/revocation/snapshot/stop entity is required for current F1 incident classes;
18. 3J proves whole-Hub operational stop before production; if it cannot, return to Decision Loop rather than assume the control.

---

## 17. YAGNI / rejected machinery

Não construir por 3I-01:

```text
AuthoritySnapshot
AuthorizationEpoch
auth invalidation/event bus
Redis authorization cache
GenericPrincipal / GenericResourceAuthorizationEngine
OPA / Cedar / OpenFGA / policy DSL
ApproverRole / universal approver ACL
universal requester!=approver / 2-of-N engine
Approval revocation state / STALE expansion for role loss
continuous mid-segment Account permission polling
RevocationEngine
SecurityCommandBus
UniversalCancelPermission
public generic EffectAttempt admin API
CurrentSecurityPolicySnapshot
EmergencyStop / SecurityHold / ProjectKillSwitch entity
cross-owner generic kill-switch engine
```

Prepare seams, not speculative machinery.

---

## 18. Later routing

```text
credential/capability custody                              → later 3I
per-run model spend authority/enforcement                  → later 3I
DEDICATED trusted exchange mechanism                       → later 3I
trust zones / Hub control-side egress / OTel baggage       → later 3I
hub_control least-privilege roles                          → later 3I
exact locking/isolation implementation                     → implementation verification; 3L if pinned-version semantics become material
whole-Hub operational emergency-stop procedure             → 3J, required before production
post-stop/outcome/orphan settlement                        → 3M
approval/security UX                                       → 3K
selective per-Project serving stop                         → Decision Loop on proven incident class; likely Release/MAR owner
new dual-control approval                                  → Decision Loop on named workflow
future mutable authorization cache                         → Decision Loop/reopen on measured scale with explicit max staleness
```

---

## 19. Reopen triggers

Reabrir 3I-01 somente com Material Finding, por exemplo:

1. measured authorization-path scale makes direct current resolution materially insufficient;
2. required cache cannot state/prove acceptable maximum revocation staleness;
3. implementation cannot mechanically serialize security-sensitive mutation against concurrent revocation of consumed authority facts without changing the owner boundary;
4. named workflow requires independent humans/dual control;
5. a current operation requires human approval although the human must not possess the operation's declared permission, proving a distinct approval-authority model is real;
6. durable runtime needs Account authority continuously mid-segment rather than at existing re-entry/control points;
7. real incident proves owner-local controls + whole-Hub stop insufficient/unacceptable and requires selective serving hold;
8. new principal/service-identity class or out-of-process trust boundary materially changes authorization semantics;
9. current owner-committed security fact cannot be composed at an existing protected boundary without a new shared authority.

---

## 20. Decisão ratificada

A aprovação do operador em **2026-08-17** congela:

> **Conexus F1 resolve mutable current authority nos protected control points; não promove session/runtime/history/cache a autorização durável. Sensitive mutations usam pre-state authority e são atomicamente serializadas contra revogação concorrente dos authority facts que consumiram. Human `ALLOW_ONCE` exige Account atualmente elegível sob o permission model declarado da ação exata e self-approval permanece permitido porque não amplia privilege. Aprovação/Release/Run history não é reescrita por revogação posterior; current owners estreitam future admissions/effects nos próprios boundaries. F1 não cria auth snapshot/cache bus, generic policy/revocation engine, universal four-eyes ou security-stop entity. Whole-Hub emergency stop é obrigação operacional de 3J antes de production; selective per-Project serving stop só volta por Decision Loop com failure class real.**
