# 3A-R6 — Phase 3 Critical Path & Implementation Readiness

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3A — Architecture Reconciliation contínua até C-018  
**Authority:** reconciliation/routing authority transversal para a profundidade restante de 3I–3O  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não altera a DevelopmentConexus Engineering Method e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

Do restante da Fase 3 até C-018, o Conexus aplica a DevelopmentConexus Engineering Method de forma proporcional: cada questão deve terminar como **MUST DECIDE BEFORE IMPLEMENTATION**, **DEFER SAFELY** ou **REJECT F1**; profundidade completa fica reservada ao que define authority, ownership, durable meaning, trust/public contract, first-production topology, first-product shape, recovery estrutural, tecnologia load-bearing ou prova end-to-end, enquanto detalhes reversíveis/consumer-gated ficam explicitamente deferred; **C-018 fecha Architecture & System Design, mas NÃO autoriza product code**, que só pode iniciar depois de um post-C-018 **Implementation Realization Planning Gate** derivado da architecture, sem segunda authority, que traduza as decisões aprovadas para schema/API/packages/frontend/runtime/tests/ordem executável.

---

## 1. Authority, método e provenance

Esta decisão aplica, sem alterar, a **DevelopmentConexus Engineering Method v1.0.0** e reconcilia o restante da Fase 3 com:

- C-001 — produto/visão e caso 1 já ratificado;
- C-006/C-007/C-008 — dados, integração, sandbox e triggers já existentes;
- C-012..C-017 — frontend/runtime/observability/release/identity/correctness e anti-overengineering anteriores;
- 3B..3H — fases arquiteturais já fechadas;
- 3I-01..3I-03 — security/authority já aprovadas;
- `LEDGER.md` — routing/status authority viva;
- 3A-R5 — precedent de Architecture Reconciliation material durante a Fase 3.

Review/provenance não-autoritativa:

- `3A-FABLE-DIALOGUE-phase3-critical-path-implementation-readiness.md`.

Independent review convergiu em:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
method amendment                             = NONE
owner                                        = 3A reconciliation
outcome                                      = CURRENT STRUCTURE CONFIRMED
new phase/process framework                  = 0
implementation before realization gate       = FORBIDDEN
```

### 1.1 Guardrail metodológico

> **Esta regra aloca profundidade; ela nunca reduz o mínimo não-degradável exigido pela DevelopmentConexus Engineering Method para qualquer item classificado MUST DECIDE.**

Logo todo MUST DECIDE material preserva, proporcionalmente:

```text
citeable decision/outcome + basis
applicable invariant
proof strategy
reopen triggers
```

Cerimônia pode diminuir. Correctness obligation não.

---

## 2. Por que este checkpoint é necessário

3B–3H já resolveram a maior parte das decisões caras de modificar após implementação:

```text
System Context & Boundaries       CLOSED
Domain / Module Architecture      CLOSED
Dependency Architecture           CLOSED
Data Architecture                 CLOSED
Contracts & API Architecture      CLOSED
Behavioral / State Architecture   CLOSED
Runtime & Agent Architecture      CLOSED
```

3I permanece em andamento e 3J–3O continuam obrigatórias.

O objetivo deste checkpoint não é pular fases. É impedir dois erros simétricos:

```text
A. começar código com decisões materiais escondidas
B. tratar toda dúvida reversível/futura com a mesma profundidade de uma boundary estrutural
```

A pergunta obrigatória passa a ser:

> **Se deixarmos esta questão aberta, um coding actor precisará decidir silenciosamente o que o Conexus é, ou a escolha errada causará retrofit material de authority/schema/contracts/security/topology?**

Se sim, decidir antes de implementation. Se não, aplicar DEFER SAFELY ou REJECT F1 conforme o método.

---

## 3. Execution boundary — permanece não negociável

Até C-018 + o Realization Planning Gate posterior:

```text
NO product implementation
NO product schema/DDL implementation
NO product HTTP/API implementation
NO product frontend implementation
NO product deployment rollout
NO coding actor filling architectural gaps by convenience
```

3L qualification probes são classe separada e bounded:

```text
architecture frozen for the probed property
→ probe falsifies one load-bearing technology assumption
→ evidence only
-X-> opportunistic product implementation
```

Claude Code/Codex/humans podem futuramente executar implementação, mas não recebem authority para redefinir architecture.

---

## 4. Três outcomes permitidos para o restante de 3I–3O

### 4.1 MUST DECIDE BEFORE IMPLEMENTATION

Classifique assim quando deixar aberto exigiria que a futura implementação escolhesse uma propriedade material, incluindo:

```text
owner / authority / module boundary
persistent data meaning / durable lifecycle
cross-module dependency direction
public/external contract meaning
security / trust boundary
first-production topology commitment
recovery semantics that may require new durable state
what the F1 product includes/excludes
technology assumption whose failure invalidates approved architecture
end-to-end proof/acceptance property
```

Se a architecture depende de um comportamento tecnológico ainda não provado, o item permanece blocker até a qualification aplicável.

### 4.2 DEFER SAFELY

Permitido somente quando:

```text
current owner/boundary/invariant remains unambiguous
no current named consumer requires the capability
later addition uses an existing seam without duplicate authority
no current durable data/contract needs to anticipate it
first useful F1 / first production does not depend on it
revisit trigger is explicit
later owner/stage is explicit where known
```

`DEFER SAFELY` é routing durável; não é esquecimento.

### 4.3 REJECT F1

Use para machinery/capability especulativa sem current consumer/failure class, especialmente quando mantê-la “em aberto” tentaria a implementation a construí-la por optionality.

Re-entry somente via Decision Loop sob evidence material.

---

## 5. Decision test obrigatório

Para cada questão restante, perguntar nesta ordem:

1. Coding actor teria de escolher owner/authority/durable meaning/trust/public contract? → **MUST DECIDE**.
2. Escolha errada força migration cross-module/schema/history/external-client ou security retrofit? → **MUST DECIDE**.
3. Primeiro produto F1 ou first-production topology depende disso? → **MUST DECIDE** na profundidade material necessária.
4. Architecture depende de comportamento tecnológico que pode falhar na versão pinada? → **MUST DECIDE + 3L proof**.
5. Pode ser resolvido depois atrás de seam existente sem mudar authority/durable contracts e sem consumer atual? → **DEFER SAFELY**.
6. É capability/machinery só para optionality futura? → **REJECT F1**.

Depth para quando a propriedade material, proof e reopen conditions ficam inequívocos.

---

## 6. Critical path ratificado — 3I Security / Authority

### 6.1 DEDICATED Trusted Exchange

**MUST DECIDE.**

Razões:

```text
external trust boundary
non-human principal authentication
credential/revocation meaning
exact Release binding
server-to-platform authority
```

A família já está substancialmente convergida em diálogo/review próprio. Deve ser fechada sem expandir fleet/federation/attestation machinery.

### 6.2 Trust Zones & Crossings / Hub egress / telemetry

**MUST DECIDE**, preferencialmente como um bounded security-closure package.

Precisa congelar somente propriedades materiais de crossings F1:

```text
browser ↔ Hub
Hub ↔ E2B
Hub ↔ model provider
Hub/Gateway ↔ enterprise/external systems
MANAGED runtime ↔ Hub/platform services
DEDICATED trust exchange ↔ Hub/platform services
telemetry producer ↔ telemetry ingest/observation
control-plane egress vs guest/app egress
secret-bearing vs non-secret crossings
```

Deve dizer quais crossings existem, quem autentica quem, que capability/credential pode cruzar, quais paths são proibidos/fail-closed e que telemetry nunca vira authority.

Exact firewall/proxy/exporter/baggage spelling é realization/3J/3L conforme aplicável.

### 6.3 `hub_control` least privilege

**MUST DECIDE no nível de role/isolation property.**

Antes de C-018 deve estar inequívoco:

```text
which runtime/process role may access which owner schemas
no direct cross-module table/internal access
migration/owner/runtime privilege separation
no normal runtime superuser/BYPASSRLS convenience
Builder/PAR substrate stores remain separate from hub_control authority
credential/backup roles do not become ordinary Hub runtime authority
```

Exact PostgreSQL role names/GRANT SQL/pool spelling pertencem ao Realization Planning/implementation, salvo comportamento de PostgreSQL que 3L precise provar.

### 6.4 3I closure

Depois dessas famílias, fazer um único bounded closure review:

```text
missing trust boundary?
duplicate authorization authority?
secret path widened?
current revocation path missing?
new durable security record secretly required?
```

Se não, fechar 3I. Threat catalogs genéricos não criam work por si só.

---

## 7. Critical path ratificado — 3J Deployment / Operations

3J continua obrigatória, porém deve decidir **a primeira topologia real**, não futuras topologias.

### MUST DECIDE

```text
first Hub deployment shape
single-host/process baseline + exact split triggers
Hub modular-monolith placement
PostgreSQL / hub_control / Project DB placement under existing laws
Builder/PAR Mastra substrate-store placement
E2B control connectivity
MANAGED serving path
TLS / ingress boundary
platform operational secret injection/custody
startup / shutdown / restart expectations
material upgrade/deploy sequence
backup ownership + required backup set
restore-proof responsibility
whole-Hub emergency-stop physical procedure required by 3I-01
host-loss/restart honesty
minimum availability set for first internal production use
```

### DEFER SAFELY

```text
DEDICATED physical deployment boundary
→ trigger: first real DEDICATED deployment
→ owner: 3J

old Production Agent runtime coexistence/drain/cutover
→ trigger: first runtime-affecting upgrade after production
→ owner: 3J
```

### REJECT F1 unless triggered

```text
Kubernetes
service mesh
multi-region / active-active
automatic failover framework
horizontal Hub scaling framework
fleet scheduler
blue/green/canary framework
multi-cloud abstraction
external Vault/KMS/HSM absent security/compliance trigger
advanced DEDICATED fleet topology
HA/PITR machinery beyond accepted first-launch RPO/RTO need
```

---

## 8. Critical path ratificado — 3K Frontend / Product Architecture

3K é obrigatória porque coding actors não podem inventar o produto a partir de engine/backend authority apenas.

### MUST DECIDE

No nível de product navigation, user-observable authority e main journey, definir pelo menos:

```text
Workspace / Project selection + creation
Project Inception / Baseline approval
Change creation / intent / correctness review
Builder progress / Work Units / ActorRuns at user-relevant abstraction
Finding / Evidence / verifier feedback
human approvals
Connections administration / qualification
Brain binding/use where required
Preview / review
Release composition / Promotion / rollback operator flow
Production Agent definition/use
MANAGED application access/serving
runtime/operational timeline sufficient for trust/diagnosis
permissions/access-management surfaces required by current role model
```

### First vertical anchor

3K inicia pela authority canônica **C-001 caso 1 — replicar o Analisador de Orçamentos (benchmark vs Mitra)**, salvo redirecionamento explícito posterior do operador.

Esse vertical será refinado em 3K e vira candidato-base do 3O Vertical Architecture Proof Contract.

### DEFER SAFELY

```text
pixel-perfect visual design
complete design system
future dashboards/analytics UX
future fleet/customer administration
UX depth of surfaces not entering the first vertical
```

C-012/scaffold authority continua aplicável; 3K não precisa redesenhar frontend infrastructure já congelada.

---

## 9. Conditional MUST DECIDE — `job/v1` / deterministic sync dispatch

C-007 mantém `dispatch defer total`; esta decisão não antecipa `job/v1`.

Mas o trigger fica agora formalmente classificado:

```text
3K/3O selected first vertical
+ requires Sankhya mirror/sync
→ C-007 trigger fires
→ job/v1 / deterministic sync dispatch enters Decision Loop
→ MUST DECIDE before Realization Planning of that vertical
```

Se o primeiro vertical não exigir mirror/sync, `job/v1` continua deferred.

Coding actor nunca escolhe o sync substrate por conveniência.

---

## 10. Critical path ratificado — 3L Technology Qualification

3L não é general framework exploration. Ela executa apenas probes capazes de falsificar assumptions arquiteturais load-bearing.

### MUST QUALIFY before C-018 where applicable

Seis famílias atuais:

```text
1. CX-SBX-E2B-01
2. CX-BUILDER-MASTRA-01
3. CX-AGENT-MASTRA-01
4. CX-RUNTIME-ISOLATION-01
5. 3I-03 model-spend subset:
   pre-provider interception
   retry/fallback neutralization
   usage/missingness preservation
   finite cost-envelope support
6. Verification Observability subset:
   Mastra + E2B + app/provider evidence can produce the deciding evidence required by current architecture
```

Se uma qualification falha materialmente, reabre primeiro a realization/substrate assumption que ela falsificou; domain semantics não reabrem automaticamente.

### Consumer-gated / DEFER SAFELY

```text
Semantic Recall
Observational Memory
Memory Extractors
Durable Agent
multi-agent/network
Skills / Goals / Background Tasks
Mastra Platform deployment features
DPoP/mTLS without their own trigger
other optional framework capability with no current consumer
```

Exact library/algorithm/version selection entra no probe/Realization Planning apenas quando load-bearing.

---

## 11. Critical path ratificado — 3M Failure & Recovery

3M deve perguntar:

> **Os durable facts já aprovados são suficientes para preservar verdade/authority e permitir recovery sem novo owner/state?**

Structural sweep mínimo:

```text
Builder active/orphan/lost execution
Production Agent admitted-but-undispatched / active-process loss
outstanding model-spend liability
OUTCOME_UNKNOWN external-effect boundary
Promotion partial failure / migration recovery
credential/custody partial publication/replacement
Hub restart / process loss
restore vs owner histories / Release truth
post-whole-Hub-stop settlement/handoff
output/storage custody repair when it affects owner truth
```

Outcomes:

```text
existing durable facts sufficient
→ close the failure class

new durable lifecycle/record/authority required
→ Material Finding / applicable Decision Loop
```

Runbook/GC/operational refinement que não muda state model pertence a 3J/implementation/operations e pode ser deferred safely.

---

## 12. Critical path ratificado — 3N Architecture Verification

3N permanece obrigatória como **uma independent global coherence review**, não um novo ciclo de microdecisões.

Deve atacar pelo menos:

```text
duplicate/missing authority
circular ownership/dependency
contradictory assumptions
runtime/OBS/provider becoming hidden authority
schema ownership contradiction
security crossing gap
recovery requiring missing durable state
F1 product path impossible from approved contracts
C-013 persist-first/reserve/dispatch coherence realized owner-locally
model-call reservation included without UniversalAttempt
Verification Observability sufficient for claimed evidence
```

Finding material reabre somente as decisões realmente implicadas.

---

## 13. Critical path ratificado — 3O Vertical Architecture Proof Contract

3O é **contract-only** e não implementa o produto.

Deve definir uma vertical pequena mas representativa que prove que a architecture pode ser realizada de ponta a ponta, iniciando do vertical escolhido por 3K e incluindo, conforme sua necessidade real:

```text
Project/Baseline
→ Change / correctness contract
→ Builder / ActorRun / E2B
→ real source result identity
→ verification / Evidence
→ Release
→ Promotion
→ MANAGED serving
→ real Account / product surface
→ Production Agent where part of the vertical
→ Brain/Connection/Gateway where part of the vertical
→ real enterprise data path where required
→ deciding evidence / timeline
```

O contrato precisa dizer:

```text
what must be true
what must be physically proven
what negative paths must fail
what evidence makes the proof sufficient
what remains explicitly outside the first vertical
```

3O não escolhe file layout/DDL/HTTP spelling se isso não for arquitetural.

---

## 14. F3B-R1 — canonical product repo / cutover

`F3B-R1` é promovido para **MUST DECIDE**, com timing preciso:

```text
C-018 may close architecture while the exact cutover decision is still an operator gate
BUT
Implementation Realization Planning cannot begin until the canonical product repository/cutover target is decided
```

Reason:

```text
repository/package/module layout
migration/cutover plan
implementation order
```

não podem ser derivados de forma executável sem esse fato.

Owner: **3A / operador**.

---

## 15. C-018 and Post-C-018 Implementation Realization Planning Gate

### 15.1 C-018

C-018 sintetiza/fecha Architecture & System Design da Fase 3.

Pode fechar sem congelar todos os detalhes físicos já deliberadamente roteados para implementation, por exemplo:

```text
exact SQL column/index spelling
exact HTTP route spelling
exact TypeScript file layout
exact frontend component tree
```

Isso é coerente com 3E/3F já fechadas por properties/classes/contracts sem converter implementation spelling em architecture.

### 15.2 C-018 NÃO autoriza product code

Progressão normativa:

```text
3I–3O complete
→ C-018 Architecture Synthesis / Phase 3 closure
→ F3B-R1 repo/cutover gate satisfied
→ Implementation Realization Planning Gate
→ accepted executable implementation plan(s)
→ product implementation by coding actors
→ implementation evidence / review / Findings
```

### 15.3 Purpose do Realization Planning Gate

Traduzir architecture aceita para forma executável, incluindo conforme necessário:

```text
repository/package/module layout
exact TypeScript/public internal interfaces
exact HTTP routes / wire contracts
exact DB columns/types/constraints/indexes/DDL
migration ordering
exact auth/session/request mechanics
exact config/env contracts
selected library/version bindings from 3L
exact frontend routes/components/data flows
runtime wiring
observability wiring
implementation dependency/order
positive/negative test matrix
vertical implementation sequence
acceptance/evidence requirements
```

### 15.4 Não é segunda architecture authority

Três propriedades são obrigatórias:

1. **Derived-only:** realization plans citam architecture e derivam sua forma; não restatam nem redefinem architecture normativamente.
2. **Finding escalation:** contradição material retorna ao applicable Decision Loop; o plano não resolve architecture localmente.
3. **No new process framework:** usar a DevelopmentConexus Engineering Method e os artifacts de planejamento mínimos necessários; não criar nova phase family, readiness framework, scorecard, methodology ou artifact taxonomy por esta decisão.

Os planos são bootstrap work do Conexus, executado por coding actors externos à futura plataforma até ela existir.

---

## 16. Coding-actor escalation law

Durante Realization Planning ou implementação posterior:

```text
implementation-only/reversible spelling
→ pode ser decidido no plano/código dentro da authority

owner/authority/boundary/durable meaning/public contract/trust/topology contradiction
→ STOP that expansion
→ Material Finding
→ applicable Decision Loop
```

Exemplos de implementation-only típicos, quando architecture não os torna load-bearing:

```text
exact helper/file names
local refactor shape
index spelling inside frozen semantic requirement
exact error text not public-contract authority
internal DTO naming
```

Exemplos que não podem ser decididos silenciosamente:

```text
new durable record because current lifecycle does not fit
new cross-module table read
new principal/credential authority
new external contract meaning
new trust crossing
new recovery state owner
new topology requirement invalidating 3J
```

---

## 17. Explicit defer/reject guardrail

Esta decisão não apaga work routed. Ela classifica quando ele volta.

Examples de DEFER SAFELY atuais:

```text
DEDICATED physical deployment until first real DEDICATED consumer
old PAR runtime drain until first post-production upgrade
advanced HA/PITR beyond first-launch need
orphan/GC/purge/retention refinements absent structural state need
UX depth outside first vertical
optional Mastra model/memory/multi-agent capabilities
EVENT ingress without consumer
fleet/multi-install lifecycle
per-install/per-Release credentials
binary/instance attestation
```

Examples REJECT F1 unless a real trigger re-enters:

```text
service mesh merely for optionality
multi-region/active-active frameworks
universal workflow/event/identity/quota engines
fleet scheduler before install base
Kubernetes merely because production exists
DPoP/mTLS without incident/compliance/real deployment trigger
```

---

## 18. Proof strategy for this routing authority

Before C-018 closure, 3N must be able to falsify this checkpoint by finding any of:

1. coding actor still needs to choose a material owner/authority/boundary/durable/public-contract/trust/topology property;
2. a DEFER SAFELY item actually shapes current durable schema/contract or first-launch correctness;
3. a REJECT F1 item is secretly required by an approved current consumer;
4. a 3L assumption remains load-bearing but unqualified;
5. 3M recovery requires durable state not designed;
6. first production topology is underspecified enough to force structural implementation choices;
7. 3K first-product shape is underspecified enough that coding actors invent user-visible product semantics;
8. Realization Planning tries to redefine architecture instead of deriving it;
9. F3B-R1 remains unresolved when realization planning is about to begin;
10. a selected first vertical requires Sankhya sync/mirror but the C-007 `job/v1` trigger was not run.

Any hit routes to the owning phase/Decision Loop; it does not justify reverting to exhaustive planning everywhere.

---

## 19. Reopen triggers

Reopen 3A-R6 only if evidence shows one of:

1. the three-outcome classification systematically hides material work;
2. realization planning repeatedly discovers owner/boundary/durable-contract choices that Phase 3 should have frozen;
3. a DEFER SAFELY category causes expensive retrofit in the first implementation;
4. a first-launch requirement changes materially enough to move a deferred family into the critical path;
5. the post-C-018 gate becomes a duplicate architecture authority/process framework;
6. implementation actors cannot derive executable plans without broad architecture reopening;
7. the DevelopmentConexus Engineering Method itself changes materially.

Local implementation discoveries reopen only the decisions they actually falsify.

---

## 20. Final ratified outcome

Operator approval on **2026-08-17** ratifies:

```text
3A-R6 = APPROVED
Material Finding against prior authority = NONE
reopen = NONE
method amendment = NONE
outcome = CURRENT STRUCTURE CONFIRMED

remaining Phase 3 phases = ALL PRESERVED
critical-path depth allocation = ADOPTED
MUST DECIDE minimum = NON-DEGRADABLE
F3B-R1 = MUST DECIDE before Realization Planning
job/v1 = CONDITIONAL MUST DECIDE if selected vertical needs sync/mirror
DEDICATED physical deployment = DEFER SAFELY until first real deployment
old Product Agent runtime drain = DEFER SAFELY until first post-production upgrade
3K first vertical starts from C-001 caso 1 unless operator redirects
3L = load-bearing qualification only
3M = structural recovery sufficiency sweep
3N = independent global coherence review
3O = contract-only vertical proof

C-018 = architecture/system-design closure
C-018 =/= permission to code
post-C-018 realization planning = REQUIRED before product implementation
realization plans = DERIVED ONLY / no second architecture authority

new product architecture = 0
new domain/module/record = 0
new methodology/process framework = 0
product implementation authorized = NO
```

A próxima decisão material de 3I continua sendo **DEDICATED Trusted Exchange**. 3A-R6 apenas governa a profundidade/routing do caminho restante até C-018 e o gate de tradução posterior para implementação.