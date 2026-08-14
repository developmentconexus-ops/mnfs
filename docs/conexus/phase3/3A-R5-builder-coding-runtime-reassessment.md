# 3A-R5 — Builder / Coding Runtime Reassessment

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** Architecture Reconciliation contínua durante 3C  
**Importante:** esta decisão fecha o reassessment arquitetural do Builder/Coding Runtime, não encerra 3C, não constitui C-018 e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, o `Builder` usa **Mastra Code / AgentController como coding harness principal**, com **uma coding session persistente por `Change`**, executando código em **E2B** através das primitives de Workspace/sandbox do Mastra; `Work Unit` e `ActorRun` continuam sendo unidades bounded de trabalho e execução, mas **não implicam reset cognitivo**. O Hub permanece a única authority sobre `Change`, correctness, planning aprovado, Work Units, ActorRuns, Findings, Evidence, permissions, budgets, Git remoto, Connections, approvals e Release. Verification agentic material usa **sessão nova e independente**. No baseline F1, **persistent thread = ON** e **Observational Memory = OFF**, sendo OM uma otimização futura probe/eval-gated.

Pi deixa de ser o runtime planejado do F1. Ele permanece apenas como **fallback/challenger de requalificação** se o probe Mastra revelar falha estrutural nas invariantes abaixo; o Conexus não implementará dois coding runtimes em paralelo sem necessidade real.

---

## 1. Por que o checkpoint existiu

C-002 escolheu Hub soberano + workers Pi frescos por Work Unit e tratou Mastra principalmente como framework genérico que criaria segunda authority. Desde então surgiu evidência material nova:

- Mastra Code tornou-se um coding harness real e é usado pela própria Mastra;
- `AgentController` foi extraído do Mastra Code para construir harnesses stateful/headless;
- Mastra Workspaces oferece filesystem, shell, LSP, processos, sandboxes remotos e integração E2B;
- a própria topology da Mastra Factory separa continuidade de implementação de revisão independente;
- Production Agent Runtime 3C-10 já adota Mastra como substrate principal;
- a sonda Mitra demonstrou que continuidade de sessão compra entendimento cumulativo real, mas também que histórico do implementador não pode virar correctness authority;
- E2B atual permite pause/resume e recovery suficientes para que lifetime da máquina não precise definir lifetime cognitivo.

O finding material não é simplesmente `Mastra > Pi`. É que C-002 acoplou quatro lifetimes que devem permanecer conceitualmente distintos:

```text
Change lifetime
!= CodingSession lifetime mechanics
!= ActorRun lifetime
!= Sandbox lifetime
```

A topologia aprovada separa essas dimensões.

---

## 2. O que permanece soberano no Conexus

Esta decisão não entrega o domínio Builder ao coding harness.

```text
Conexus Hub / Builder authority
├── Project/Change identity
├── correctness contract COR-*
├── contract revision/digest
├── human checkpoints quando aplicáveis
├── approved planning
├── planning depth / rigor floors
├── Work Unit identity/decomposition semantics
├── ActorRun identity e facts
├── Findings e routing
├── Evidence admission
├── budgets
├── permissions/authority context
├── Git remote operations
├── Change closure
└── Release eligibility handoff
```

Mastra pode realizar mechanics e cognição de coding; não decide essas authorities.

Regra normativa:

```text
harness says done
!= Change accepted
```

E:

```text
harness plan / goal / todo
!= approved Conexus Plan
```

---

## 3. Unidade de autonomia — `Change` é o default cognitive scope

A coding session persistente é escopada por `Change` no F1.

Forma normal:

```text
Project
└── Change-184
    ├── CodingSession CS-184
    │   └── persistent thread
    ├── Work Unit WU-01
    │   └── ActorRun A1
    └── Work Unit WU-02
        └── ActorRun A2
```

`A1` e `A2` podem continuar na mesma `CodingSession` quando isso for a menor forma coerente.

A session preserva cognição como:

```text
regiões relevantes da codebase
hipóteses investigadas
alternativas já descartadas
contratos locais encontrados
testes relevantes
contexto de edição e navegação
```

Isso reduz rediscovery sem transformar histórico conversacional em fonte de verdade.

### 3.1 Não existe sessão global imortal por Project no F1

Novo `Change` recebe nova coding session por default.

```text
Change-184 → CS-184
Change-185 → CS-185
```

Isso limita stale assumptions e contaminação entre objetivos independentes.

Conhecimento que merece sobreviver ao Change deve ser promovido explicitamente ao owner durável adequado:

```text
Git / Project Baseline / docs / Brain / standards
```

Nunca por memória invisível de uma coding session antiga.

### 3.2 Freshness continua disponível sem virar framework

O baseline operacional é simples:

```text
same Change → continue session
```

Uma sessão nova é usada quando existe motivo material, como:

- novo Change;
- verifier independente;
- revisão semântica material do correctness contract;
- suspeita concreta de cognitive contamination;
- isolamento exigido por risco/contexto.

F1 não cria `SessionStrategyRegistry`, fork graph genérico ou policy DSL para isso.

---

## 4. `Work Unit` e `ActorRun` permanecem

A sessão persistente não elimina o work graph.

### Work Unit

Continua respondendo:

> qual trabalho bounded deve ser realizado para satisfazer parte coerente deste Change?

Default preservado de 3C-05:

```text
1 Change
→ 1 Work Unit
```

Work Units adicionais só surgem por necessidade concreta de contexto, risco, dependência, failure isolation, Finding ou proof.

### ActorRun

Continua sendo uma tentativa/episódio concreto e auditável de execução.

```text
ActorRun
!= CodingSession
!= E2B sandbox
```

Um `ActorRun` termina sem obrigar a coding session a perder o que aprendeu.

Isso preserva Evidence, budgets, retries, correlation e failure semantics sem pagar rediscovery cognitiva por obrigação arquitetural.

---

## 5. Coding harness principal — Mastra

F1 escolhe uma realização, em vez de permanecer indefinidamente em comparação de candidatos.

```text
Builder
→ CodingWorkerRuntime boundary
→ Mastra Code / AgentController
→ Mastra Workspace
→ E2B
```

A adoção importa mechanics maduras em vez de reconstruí-las no Hub:

- agent/model loop;
- persistent threads;
- filesystem/search/edit/shell mechanics;
- LSP/smart editing quando aplicável;
- structured events;
- interruption/cancel mechanics;
- modes/planning assistance;
- local task state;
- subagent capability futura;
- workspace/sandbox integration;
- browser/preview mechanics quando qualificadas.

### 5.1 Mastra Code mechanics não viram product authority

Auth própria, Goals, todo/task state, plan mode, permissions internas, hooks, skills, stored sessions ou outras features do harness permanecem **mechanics subordinadas**.

O Conexus pode desabilitar, restringir ou simplesmente não consumir features que dupliquem sua authority.

Em particular:

```text
Mastra Goal judge
→ nunca fecha COR-*

Mastra internal plan
→ nunca substitui approved Plan

Mastra permission
→ defense in depth, nunca authority empresarial
```

### 5.2 Pi

Pi não será implementado em paralelo no F1 apenas para preservar optionality.

Ele permanece referência/fallback conhecido caso `CX-BUILDER-MASTRA-01` encontre falha estrutural do substrate escolhido.

A replaceability vem da boundary estreita do runtime e da soberania do domínio, não de manter duas implementações de produção simultaneamente.

---

## 6. Memory strategy

Quatro coisas permanecem diferentes:

```text
Hub authority
Project durable knowledge
CodingSession cognition
runtime execution state
```

### 6.1 Baseline F1

```text
persistent Change thread = ON
Observational Memory      = OFF
Project hidden memory     = OFF
```

Persistent thread já entrega a principal propriedade desejada: continuidade da investigação dentro do Change.

### 6.2 Observational Memory

OM é uma capability interessante para Changes muito longos, mas não entra como dependência estrutural do Builder inicial.

Ela só é ativada quando medição mostrar problema real de context growth/quality e um eval provar ganho líquido.

Se ativada futuramente:

```text
scope = Change
role = cognitive cache
never = authority
```

O eval deve demonstrar redução de context loss/rework/tokens sem aumento material de:

```text
false-green
stale assumptions
unwanted diff
recovery errors
```

### 6.3 Conhecimento durável

Insight que deve sobreviver ao fechamento da session segue promoção explícita:

```text
session insight
→ proposal/review quando aplicável
→ Git / Baseline / Brain / standards
```

Não existe memory self-publish.

---

## 7. Planning authority

3C-05 permanece semanticamente intacta:

```text
DIRECT | LIGHT | FULL
```

O Hub/Builder decide se existe Plan explícito e qual revisão está aprovada.

Mastra pode usar plan mode, goals, todo e task scratch para organizar a execução local.

Regra:

```text
internal planning assistance
= tactic

approved Conexus Plan
= authority
```

Quando o harness descobrir que o plano aprovado precisa mudar materialmente:

```text
proposal/finding
→ Hub
→ semantic revision
→ checkpoint quando aplicável
```

O harness não atualiza authority silenciosamente.

---

## 8. Sandbox e E2B

E2B permanece o execution substrate baseline do Builder F1.

Forma inicial escolhida por YAGNI:

```text
Mastra Workspace
→ @mastra/e2b
→ E2B
```

O Conexus fornece/configura o envelope necessário de template, network policy, metadata, lifetime intent e execution context e verifica o comportamento no probe.

Não será criado um adapter E2B próprio adicional antes de existir failure class material que o exija.

### 8.1 Authority versus mechanics

O fato de `@mastra/e2b` possuir reconnect/pause/create/destroy mechanics não transforma filesystem/sandbox state em authority.

```text
Git / Hub
→ durable truth

E2B
→ execution state
```

Se a sandbox for recriada, o trabalho precisa poder ser reconstruído a partir de Git + Hub + session/runtime state admissível, sem inventar facts.

Se o adapter provar no probe que alguma lifecycle mechanic viola uma invariante de segurança, recovery ou custo, o Conexus envolve/substitui esse mecanismo localmente. Não se constrói essa camada antes da prova.

### 8.2 Segredos

Com model loop control-side, a credencial durável do provider/modelo não precisa entrar no guest E2B.

Permanecem normativas:

```text
durable ERP/Connection credentials → nunca guest
Git remote write credential        → nunca guest
provider provisioning/master key   → nunca guest
```

Capability inevitavelmente guest-readable, quando existir, deve ser efêmera, scoped, bounded e revogável.

### 8.3 Limite de ~45 minutos

O limite antigo da C-008 é reclassificado.

```text
~45 min
→ operational checkpoint / budget signal
```

Não:

```text
>45 min
→ decomposition architecturally wrong
```

Uma investigação longa pode permanecer um trabalho coerente mesmo atravessando pause/resume/recreate de sandbox.

Lifetime da sandbox não define lifetime da coding session.

---

## 9. Git / worktree lifecycle

F1 usa:

```text
1 Change
→ 1 Change branch/workspace lineage por default
```

A coding session pode usar Git local no environment autorizado.

Remote authority permanece no Hub:

```text
sandbox/coding harness
→ local Git only

Hub
→ remote fetch/push/PR/integration
```

Nenhum Git remote write credential entra no guest apenas porque o harness possui integração Git.

Commit/evidence mechanics continuam sujeitas às decisões de lifecycle/Release já aprovadas; esta decisão não cria nova Git authority.

---

## 10. Verification topology

Verification continua proporcional e independente.

Ordem preservada:

```text
mechanical checks
→ tests/oracles
→ RUN / OBSERVE / ASSERT quando aplicável
→ browser/served flow quando aplicável
→ fresh verifier quando material
→ human quando necessário
```

### 10.1 Deterministic first

Não spawnar LLM verifier quando compilador/teste/oracle decide completamente a assertion.

### 10.2 Fresh verifier

Quando agentic verification agrega valor:

```text
candidate commit
→ new Mastra verification session
→ fresh context
→ restricted/read-only tool surface
→ Finding/evidence candidate
→ Hub admission/decision
```

Freshness significa independência cognitiva do implementador; não exige outro provider nem automaticamente outra VM.

O verifier não recebe a conversation/history do implementador e não corrige o que está julgando.

```text
validator_report
!= hub_verified_evidence
```

Essa invariante permanece da C-017.

---

## 11. Subagents / parallelism

F1 não depende de multi-agent coding.

```text
one coding session first
serial by default
```

Subagents podem existir como capability do substrate, mas não entram no Golden Path até consumidor/failure class real justificar.

Effectful parallelism, generic agent fleet, Missions e universal DAG continuam DEFER.

Mastra Factory permanece referência de software-factory topology, não substrate do domínio Builder.

---

## 12. Comportamento ponta a ponta — Project com integração

Exemplo: usuário conecta `Sankhya Homologação` e `Sankhya Produção` no Workspace e cria Project `Análise Comercial`.

Project registra binding explícito:

```text
erp.primary
├── BUILD/PREVIEW → Sankhya Homologação
└── PROD          → Sankhya Produção
```

Usuário pede:

```text
Crie dashboard de faturamento,
ticket médio, top produtos
e filtro por vendedor.
```

Fluxo:

```text
User intent
→ Change
→ discovery proporcional
→ Builder coding session
```

Para descobrir fatos do ERP:

```text
Mastra coding session
→ typed Builder capability
→ Capability Gateway
→ resolves Project + binding + READ authority
→ server-side Connection credential
→ Sankhya
→ bounded result/evidence
→ coding session
```

O agente não recebe a credencial do Sankhya.

Após discovery e checkpoint proporcional:

```text
Change
→ WU-01
→ ActorRun A1
→ same Change coding session
→ code/build/test/browser in E2B
→ candidate
```

Se surge Finding e uma WU-02 é justificada:

```text
WU-02
→ ActorRun A2
→ continua mesma coding session por default
```

A cognição acumulada é reaproveitada, mas COR-*, Plan aprovado, Findings e status continuam vindo do Hub.

Depois:

```text
candidate
→ deterministic proof
→ fresh verifier somente se material
→ complete assertion matrix
→ Change accepted/blocked
→ Release permanece decisão separada
```

Se o usuário depois pede `criar pedido no Sankhya`, a authority muda READ → WRITE e isso normalmente nasce como novo Change/novo correctness contract/nova session, com os approvals e effect semantics aplicáveis.

---

## 13. Reconciliação com decisões anteriores

### C-002 — parcialmente superseded

SUPERSEDE:

- Pi como runtime principal congelado;
- `fresh worker per Work Unit` como lifetime cognitivo obrigatório;
- Mastra categoricamente fora do Builder.

PRESERVE:

- Hub soberano;
- Postgres/Hub como authority operacional;
- runtime atrás de boundary estreita;
- Actor Pack/contexto compilado e pinado;
- gates humanos mecânicos;
- model/provider identity registrada;
- multi-model capability sem router genérico obrigatório;
- anti-overengineering;
- worker nunca decide acceptance.

### C-008 — parcialmente reinterpretada

PRESERVE:

- E2B baseline;
- microVM/agency;
- durable secrets fora do guest;
- egress governado;
- BuildValidationDatabase distinto de DEV authority;
- RunPreview distinto de Published/Preview stable environment;
- Git remote credential Hub-side;
- lifecycle hygiene/reconciliation;
- provider qualification/conformance.

REINTERPRET:

- model/provider credential do Builder fica control-side quando a realização permitir;
- sessão de 1h/45min é sandbox budget/checkpoint, não cognitive/work decomposition law;
- Work Unit/ActorRun não exige nova sandbox nem nova session.

### 3C-05 — refinamento, não reabertura da module boundary

PRESERVE:

```text
Builder owns Change
correctness before decomposition
minimal sufficient execution
Plan/WU/ActorRun internals para outros domínios
Finding routing
independent validation
Change closure
```

REFINE:

```text
Pi is runtime, not authority
```

vira:

```text
Coding harness is runtime, not authority
```

E:

```text
1 Work Unit + 1 ActorRun baseline
```

não implica `1 fresh coding session`.

### C-017

Fresh validator continua normativo quando material; freshness é independência de contexto, não obrigação de provider ou VM diferente.

### 3C-10

Sem mudança. Production Agent Runtime permanece decisão separada e aprovada.

---

## 14. Activation probe — `CX-BUILDER-MASTRA-01`

A arquitetura escolhe Mastra agora. O probe posterior tenta invalidar a realização; ele não mantém competição infinita de runtime.

Antes do primeiro uso real do Builder, provar no mínimo:

1. uma coding session persistente atravessa pelo menos duas Work Units/ActorRuns do mesmo Change sem perder correlação;
2. `persistent thread` sobrevive restart compatível do Hub/runtime conforme storage qualificado;
3. perda da coding session degrada cognição, mas não perde/redefine Change/COR/Plan/Findings/authority;
4. Workspace E2B executa edit/search/shell/build/test/browser representativos com fidelity aceitável;
5. network/egress policy necessária chega ao E2B e caminho proibido realmente falha;
6. nenhuma credencial durável de ERP/Connection/Git remote/model provider aparece no guest quando a topologia não exige isso;
7. Git local → candidate/evidence → Hub remote flow é recuperável e verificável;
8. Hub gate/Capability Gateway continuam bloqueando operação proibida independentemente da policy interna do Mastra;
9. cancel/interrupt termina o trabalho bounded e subprocessos aplicáveis;
10. fresh verifier recebe candidate + correctness, mas não implementer history nem write authority;
11. runtime events/cost/tool activity podem ser correlacionados com `ActorRun`/Evidence sem transcript virar authority;
12. P50/P95 de tool calls, build/test/browser e wall time são aceitáveis para os Golden Scenarios representativos;
13. storage/configuração requerida falha explicitamente quando indisponível — sem silent success que criaria segunda authority;
14. pause/resume/recreate de sandbox não produz sucesso fictício, Git divergente ou state leakage entre Changes.

### OM não faz parte deste probe de ativação

Observational Memory possui probe/eval separado quando houver trigger real de context degradation.

---

## 15. Removal / reopen conditions

Runtime selection só reabre antes da implementação se o probe revelar falha **estrutural**, por exemplo:

- authority bypass que não pode ser fechado por configuração/wrapper local pequeno;
- durable secret necessário no guest contra as invariantes;
- E2B/Workspace sem fidelity suficiente para nosso coding loop;
- recovery que depende de transcript/session como source of truth;
- fresh verifier impossível de isolar cognitivamente;
- custo/latência materialmente inviável nos Golden Scenarios;
- churn/licença/supply-chain tornando o substrate operacionalmente inviável;
- segunda authority inevitável para Change/Plan/Git/approval/Release.

Falha localizada e corrigível dentro da boundary escolhida não reabre automaticamente a arquitetura.

Se uma removal condition for acionada, Pi é o primeiro fallback/challenger a requalificar; não existe adapter Pi preventivo no F1.

---

## 16. O que NÃO construir em F1

```text
second coding runtime implementation
runtime marketplace
strategy plugin registry
Mastra Factory como Builder domain
Mastra Workflow para Change/WU orchestration
Project-global hidden agent memory
Observational Memory obrigatória
multi-agent fleet
parallel effectful workers by default
generic session strategy DSL
custom E2B adapter sem failure class
separate coding-runtime microservice sem trigger
provider-diverse verifier obrigatório
fresh sandbox por toda Work Unit
45-minute decomposition law
```

---

## 17. Invariantes normativas aprovadas

1. `Change` permanece a boundary pública e durável da evolução de software.
2. Coding cognition é `Change`-scoped por default no F1.
3. `CodingSession`, `WorkUnit`, `ActorRun` e sandbox são conceitos/lifetimes distintos.
4. Work Unit/ActorRun não implica reset cognitivo.
5. Novo Change recebe nova coding session por default.
6. Persistent thread entra no baseline F1.
7. Observational Memory começa OFF e só entra após trigger + eval.
8. Mastra Code / AgentController é o coding harness principal escolhido para F1.
9. Pi não é implementado em paralelo; é fallback sob removal condition.
10. Hub continua única authority sobre correctness, approved planning, work graph, Findings, Evidence, budgets, permissions, Git remoto e closure.
11. Harness internal plan/goal/task state é tática, nunca authority concorrente.
12. E2B permanece execution substrate; seu state nunca é source of truth.
13. `@mastra/e2b` é usado inicialmente; wrapper próprio só nasce por failure class comprovada.
14. Durable ERP/Connection/Git remote credentials nunca entram no guest.
15. ~45 min é checkpoint/budget operacional, não limite arquitetural de Change/Work Unit/cognição.
16. Git remote operations permanecem Hub-side.
17. Verification determinística vem primeiro.
18. Agentic verifier é condicional e usa sessão nova, cognitivamente independente e sem corrigir o que julga.
19. Mesmo runtime/provider pode implementar e verificar; independência de contexto é a propriedade obrigatória.
20. Multi-agent/subagents/parallelism não são requisito do Golden Path F1.
21. Change accepted continua distinto de Release promoted.
22. Falha localizada do substrate não reabre decisão; apenas falha estrutural aciona removal condition.

---

## 18. Decisão final aprovada

> **O Builder F1 mantém `Change` como authority durável e adota Mastra Code / AgentController como coding harness principal. Cada Change possui por default uma coding session persistente que pode atravessar múltiplas Work Units e ActorRuns; Work Unit e ActorRun continuam bounded e auditáveis, mas deixam de significar worker cognitivamente fresco. A sessão mantém cognição/tática, nunca correctness authority. Persistent thread entra no baseline; Observational Memory começa desligada e só será qualificada se context degradation real justificar. E2B permanece execution substrate através das primitives Mastra iniciais, sem adapter próprio adicional enquanto não houver failure class material; lifetime da sandbox é independente da sessão e o antigo limite ~45 min vira checkpoint operacional. Git remoto, durable secrets, Connections, Capability Gateway, approvals, Findings, Evidence, Change closure e Release continuam sob authorities Conexus. Verification agentic material usa uma sessão nova e independente; deterministic proof vem primeiro. Pi não será implementado em paralelo e só retorna como fallback se `CX-BUILDER-MASTRA-01` revelar falha estrutural.**

## Estado após aprovação

```text
Production Agents / 3C-10
→ CLOSED / APPROVED

Builder/Coding Runtime / 3A-R5
→ CLOSED / APPROVED

3C
→ pode continuar para a próxima decisão dependente
```
