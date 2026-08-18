# 3K-03 — First Vertical Composition & Data Path

**Status:** APPROVED pelo operador em 2026-08-18  
**Fase:** 3K — Frontend / Product Architecture  
**Authority:** terceira decisão aprovada de 3K  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra 3K nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 **não impõe `live`, `mirror` ou `hybrid` como estratégia universal de integração**: a plataforma fornece boundaries/paved roads, o Connector declara capacidades reais da fonte e a `Project Baseline` decide o data path necessário para o slice atual com base em evidência. Para o primeiro vertical — **Analisador Inteligente de Orçamentos** — o caminho aprovado é um aplicativo analítico read-only cujo runtime lê um **read model analítico derivado no Project Database**, alimentado por sync governado da fonte Sankhya, enquanto leituras live controladas pelo Capability Gateway permanecem o anchor para Discovery, qualification, reconciliation, verification e Evidence; o read model nunca prova a si mesmo nem se torna business/semantic authority.

---

## 1. Authority e composição

3K-03 aplica, sem reabrir estruturalmente:

- C-001 — primeiro caso = Analisador Inteligente de Orçamentos; benchmark permanente versus Mitra e versões futuras do Conexus;
- C-005 — Project artifacts git-first; queries/actions/jobs com runtime contracts e execução governada;
- C-006 — Project Database, roles, QA e padrão ETL incremental `cursor + overlap + staging + upsert` quando um consumidor real exige mirror/sync;
- C-007 — Connector kernel estreito, operations native-first, `Connection`, qualification e extensões discriminadas somente quando usadas;
- C-011 — Brain semantic model, Project binding e `AnalyticQuery` somente sobre datasets curados/pinados;
- C-012 — frontend/runtime SDK, honest data metadata, output contracts e scaffold;
- C-017 — discovery antes de fechar correctness quando dado real é load-bearing;
- 3A-R6 — 3K ancora no caso 1; `job/v1` é conditional MUST DECIDE se o first vertical realmente exigir mirror/sync;
- 3A-R8 — Project Baseline é spec-anchored, viva e incremental; decisões materiais pertencem ao slice atual e não podem ser delegadas silenciosamente ao coding actor;
- 3K-01 — Project shell, Build/Data/Capabilities/Integrations/Brain/Versions/Activity e inspectability;
- 3K-02 — context-local truth, provenance, coverage/freshness, Evidence e honest failure/partial/unknown presentation.

Mitra/Sankhya são evidence + first vertical, nunca product-wide authority.

---

## 2. Root cause e boundary da decisão

A falha a evitar é transformar o primeiro ERP real na arquitetura universal da plataforma:

```text
primeiro consumer usa Sankhya
→ Sankhya precisa de determinada composição
→ implementação generaliza por conveniência
→ todo futuro ERP/API recebe o mesmo data path
```

Isso violaria C-007 e 3A-R8.

A divisão normativa é:

```text
CONEXUS PLATFORM
→ fornece mechanisms/seams e invariantes

CONNECTOR
→ descreve como aquela fonte funciona e quais capacidades realmente existem

PROJECT BASELINE
→ escolhe a composição necessária para o produto/slice atual

BUILDER
→ investiga, compara alternativas e propõe; não transforma preferência local em law global
```

Portanto:

```text
Sankhya uses sync in case 1
-X-> ERP integrations use sync

first vertical uses a Project analytical read model
-X-> every Project has an analytical mirror
```

---

## 3. Lei de plataforma — data path é Project architecture, não default global

Para qualquer Project conectado a fonte externa, alternativas como:

```text
LIVE
DERIVED / MIRRORED
HYBRID
```

são **famílias de composição arquitetural**, não enum/record/FSM novo.

A escolha deve considerar, proporcionalmente ao slice:

```text
consumer interaction pattern
source capabilities
freshness requirement
latency
availability coupling
historical/aggregation needs
volume
rate/query limits
consistency requirements
cost
reconciliation/proof needs
security/effect surface
```

O Builder pode investigar e recomendar. A decisão material é incorporada à exact approved Project Baseline conforme 3A-R8.

Exemplos futuros continuam admissíveis sem emenda a 3K-03:

```text
simple inventory lookup
→ live read may be Global Maximum

heavy historical ERP dashboard
→ derived analytical projection may be Global Maximum

operational marketplace app
→ webhook/live + reconciliation + local state may be hybrid

Project-native CRM
→ Project DB may be primary store with no ERP source
```

3K-03 não cria `DataPathStrategy` como record, API ou policy engine.

---

## 4. Primeiro vertical — produto que deve ser provado

O caso 1 continua exatamente o de C-001:

> **Analisador Inteligente de Orçamentos (Sankhya)**.

Seu objetivo em 3K é provar composição de produto/arquitetura, não copiar internals da Mitra.

Características materiais já observadas no benchmark:

```text
read-only analytics
historical range
KPIs
multi-dimensional filters
cross-filter
seller/customer/time/age aggregations
drill-down
repeated interactive reads
business definitions discovered against real ERP data
known limitations that may cancel a feature rather than fabricate a number
```

O benchmark conhecido da Mitra usou importação local + queries analíticas e encontrou, entre outros, que `VLRCUS` não suportava uma margem confiável; 3K-03 preserva a obrigação de recusar semântica não sustentada pela fonte/Brain em vez de “ganhar” o benchmark com dado inventado.

---

## 5. Alternativas adjudicadas para o caso 1

### A — all-live runtime analytics against Sankhya

```text
Published App
→ Capability/Gateway
→ Sankhya
```

**REJECT para o caso 1 como primary runtime path.**

Não porque live seja ruim globalmente, mas porque para este consumidor:

- cada filtro/cross-filter poderia acoplar múltiplas agregações à latência/disponibilidade do ERP;
- analytics repetido passa a impor carga/interação externa desnecessária;
- o regime `AnalyticQuery` atual de C-011 é sobre dataset curado Project-side, não analytics arbitrário sobre Connector;
- evitar sync criaria pressão para inventar `AnalyticQuery-over-Connector` ou dezenas de operations externas sem consumer independente.

Live read permanece necessário como source anchor, não como work surface primária do dashboard.

### B — mirror local tratado como truth suficiente

```text
Sankhya
→ sync
→ Project DB
→ app
```

**REJECT como trust model.**

Um read model derivado pode estar stale, partial ou incorreto; ele nunca prova cobertura/correção pela própria existência. `187` no Project DB não implica `187` na fonte.

### C — source-anchored analytical projection

```text
                   External Source
                      Sankhya
                         │
                 Capability Gateway
                 ┌───────┴────────┐
                 │                │
        live source proof       sync
        / discovery               │
                 │                ▼
                 │          Project Database
                 │        derived analytical model
                 │                │
                 │                ▼
                 │        registered read queries
                 │                │
                 └────────→ Evidence ← app
```

**APPROVED / GLOBAL MAXIMUM para o caso 1.**

Compra responsividade/consistência analítica sem promover a cópia derivada a authority da fonte.

---

## 6. Meaning/authority por camada

Para este vertical:

```text
Sankhya / external source
→ source facts / external business records

Workspace Brain
→ business semantics, definitions, caveats, provenance/evidence specifications

Project Baseline
→ approved architecture for how THIS app consumes the source/Brain

Project Database
→ derived analytical read model for the current product

Query Capabilities
→ governed product/runtime access to the read model

UI
→ presentation only
```

Invariantes:

```text
Project DB != semantic Brain authority
Project DB != external-source authority
Project DB != proof of synchronization correctness
UI != provenance authority
```

Uma descoberta como `VLRCUS não é custo confiável` pertence ao Brain/knowledge path apropriado, não a uma regra escondida apenas na query/dashboard do primeiro Project.

---

## 7. Runtime, source proof e Evidence

### 7.1 Runtime normal

O aplicativo publicado usa registered, read-only Project query capabilities sobre o read model derivado.

Conceitualmente:

```text
Published App
→ runtime SDK execute(slug,input)
→ registered query capability
→ Project Database read role
```

A quantidade/slug exata de queries não é congelada por 3K. Cada capability precisa de consumidor real no produto.

### 7.2 Source-anchored live path

Leitura live governada via Connector/Connection/Gateway permanece aplicável a:

```text
Inception/Discovery
Connection qualification
source profiling needed for the Change/Baseline
reconciliation
verification oracle
Evidence against current external state
```

A UI não recebe credencial nem acesso livre ao ERP.

### 7.3 Honest data projection

3K-02/C-012 permanecem load-bearing. Onde material, o produto deve preservar facts como:

```text
source
sourceAsOf
retrievedAt
coverage
freshness/health summary
partial vs complete
```

`loading != empty != failed != partial` permanece invariante.

---

## 8. Scope mínimo do analytical projection

Sync não significa replicar o ERP.

A Project Baseline do caso 1 admite somente datasets/fields exigidos pelas jornadas e criteria atuais, por exemplo famílias equivalentes a:

```text
budgets
budget items
customers
salespeople
required operation/status dimensions
```

A lista física final é Realization/Project architecture derivada; a lei é:

> **mirror only the minimum source slice required by the current approved product.**

Fiscal, financeiro, compras, estoque completo, contabilidade ou outras áreas não entram por proximidade com Sankhya.

Novo consumer pode revisar a Baseline conforme 3A-R8.

---

## 9. Brain e semantic binding no first vertical

O caso 1 deve exercitar P1/C-011 de forma real:

```text
Workspace Brain
├── Budget / orçamento definition
├── Pending semantics
├── Conversion semantics
└── known caveats / rejected metric assumptions

Project
└── explicit ProjectBrainBinding / local analytical realization
```

O Project não duplica Brain authority. Ele pina a revisão e realiza bindings/datasets locais necessários.

Uma regra material que define número não pode existir somente como texto de prompt ou frontend calculation quando C-011 exige semantic/executable representation.

---

## 10. Query Capabilities vs AnalyticQuery

Para o dashboard conhecido do first vertical:

```text
registered read-only Query capabilities
= APPROVED baseline
```

O produto já conhece suas jornadas/KPIs; usar geração analítica dinâmica apenas para “exercitar” C-011 seria complexidade acidental.

`AnalyticQuery` continua disponível como regime aprovado quando surgir consumidor real, por exemplo:

```text
user/product agent asks open-ended question
→ semantic IDs from Brain
→ restricted semantic plan
→ approved analytical dataset
```

Não criar esse consumer dentro do benchmark apenas por completeness.

---

## 11. Product Agents, writes e automação

O first vertical é deliberadamente read-only.

```text
Product Agent required                    = NO
Sankhya/external WRITE                    = NO
external effects                          = NO
business WhatsApp/e-mail follow-up        = NO
automation/triggers de negócio            = NO
```

`Agents` continua uma Project surface válida de 3K-01 e pode apresentar empty state honesto.

```text
Conexus Builder assistance
!= Product Agent Runtime
```

Não adicionar Product Agent fictício para exercitar infraestrutura.

---

## 12. Golden benchmark e current operational truth são separados

### 12.1 Historical benchmark

C-001 C2 permanece uma suíte de regressão do Builder.

Um snapshot/dataset de referência preserva um estado comparável ao caso Mitra, permitindo medir:

```text
same product/business question
same benchmark source state
Mitra known output
vs Conexus version N output
```

Esse benchmark é histórico/reprodutível.

### 12.2 Current operational truth

Produção nunca usa números históricos fixos como oracle eterno.

```text
current external source oracle
↔ current derived analytical projection
```

Logo:

```text
historical benchmark truth
!= current production truth
```

O produto pode estar correto mesmo que o número atual não seja o valor do snapshot histórico.

---

## 13. 3K surfaces realmente exercitadas pelo first vertical

3K-03 prova consumidor concreto para:

```text
Build
→ agent-first construction + Preview / Code / Diff lenses

Data
→ derived datasets + source/coverage/freshness/inspection

Capabilities
→ registered read-only queries + use/provenance/verification

Integrations
→ Project use/binding of the Workspace-owned Connection + qualification/source state

Brain
→ current binding + business semantics/caveats used by this Project

Versions
→ candidate / verification / Publish / rollback eligibility

Activity
→ causal build/sync/verification/promotion timeline
```

`Agents` permanece parte do Project shell mas tem zero Product Agent no first vertical.

`Settings` aparece apenas para configuração real exigida; não recebe functionality fictícia para preencher a navegação.

---

## 14. Sync machinery e `job/v1` trigger

A escolha aprovada de derived analytical read model implica recurring synchronization para manter o consumidor útil.

Portanto o trigger já previsto por 3A-R6 dispara:

```text
first vertical requires mirror/sync
→ C-007 job/v1 / deterministic sync dispatch
→ CONDITIONAL MUST DECIDE becomes ACTIVE MUST DECIDE
```

Isso **não** autoriza implementation nem uma plataforma genérica de automação.

O próximo Decision Loop deve decidir somente a menor realização sustentável necessária para o consumidor atual, preservando C-006 ETL semantics e as boundaries já fechadas.

Não nascer automaticamente:

```text
Jobs sidebar
Workflow engine
Automation builder
Schedule DSL
Generic pipeline
Universal scheduler domain
new queue infrastructure if existing seam suffices
```

A necessidade do usuário é observar freshness/coverage/sync truth em `Data`/`Integrations`/`Activity`; queue/lease/scheduler mechanics permanecem drill-down/infra salvo consumer material posterior.

**3K internal closure fica BLOCKED apenas no sentido arquitetural bounded de que o first vertical agora expôs este MUST DECIDE já previsto; o follow-up deve ser resolvido antes do closure de 3K/Realization Planning aplicável.**

---

## 15. O que 3K-03 NÃO congela

Permanece para Realization/qualified later stage:

```text
physical Project tables/columns/indexes
exact source SQL/API calls
exact sync cadence
exact incremental cursor fields/watermarks
exact query slugs/count
exact frontend components/layout
exact source reconciliation query implementation
cache details
scheduler/queue library behavior not already frozen
job/v1 exact contract/dispatch semantics → next bounded Decision Loop
recovery after partial/failed sync → 3M + job decision as applicable
```

E permanecem explicitamente fora do caso 1:

```text
Product Agent execution
external writes/effects
business automation
EVENT/webhook ingress
multi-source fusion without current consumer
universal ERP model
```

---

## 16. Anti-overengineering guardrail

3K-03 rejeita:

```text
NO universal live/mirror/hybrid policy
NO DataPathStrategy domain engine
NO ERP-wide replication because first source is Sankhya
NO AnalyticQuery merely to exercise architecture
NO fake Product Agent
NO business write/effect in benchmark
NO Jobs/Automation product surface without consumer
NO second business source merely to prove abstraction
NO generic ETL/orchestration platform before the bounded sync consumer requires it
```

Expansion returns through 3A-R8/Decision Loop on a named Project/consumer.

---

## 17. Outcome

Ratificado:

```text
platform data-path default                          = NONE
Project Baseline owns current product composition   = YES
Connector/provider capability remains source-specific= YES

first vertical                                      = Budget Analyzer
first vertical product mode                         = read-only analytics
external source                                     = Sankhya (case-specific)
runtime analytical path                             = derived Project read model
live Gateway source path                            = Discovery / qualification /
                                                     reconciliation / verification / Evidence
registered read queries                             = YES
AnalyticQuery required by first vertical             = NO
Product Agent required                               = NO
external/business write/effect                       = 0
historical benchmark vs current truth separation     = REQUIRED
job/v1 conditional trigger                           = FIRED

new generic data-path engine                         = 0
new Product Agent                                    = 0
new business automation                              = 0
prior structural phase reopen                        = NONE
product implementation                               = BLOCKED
```

## Próxima ação

Abrir **um bounded C-007 Decision Loop para `job/v1` / deterministic sync dispatch**, somente porque 3K-03 comprovou um consumidor atual. Decidir a menor mecânica/contract necessários para manter o read model do first vertical, sem transformar o mecanismo em plataforma genérica de workflow/automation.

Depois desse bounded follow-up, retornar ao fechamento interno de 3K. O independent adversarial reviewer externo permanece reservado ao **fechamento global de 3K**, conforme decisão do operador.