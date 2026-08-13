# 3C-05 — Builder Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, **Builder** é o módulo responsável pela evolução verificável de um `Project`. Ele owns a boundary durável `Change`, seu correctness contract, checkpoint humano, planning depth, decomposição quando necessária, `Work Unit`, `ActorRun`, orchestration de validação, `Finding` lifecycle/routing e Change closure. `Change` é a boundary pública e durável; `Plan`, `Work Unit`, `ActorRun` e a estratégia concreta de execução permanecem internals substituíveis do Builder. Pi/E2B são mecanismos de runtime consumidos por uma boundary estreita e não constituem authority do Builder.

A decisão adota explicitamente **Minimal Sufficient Execution**:

> O Builder deve usar o menor grafo de execução suficiente para satisfazer e provar o Change. A existência de uma capability de planejamento, decomposição, validator, validation database, sandbox adicional ou ActorRun adicional não a torna obrigatória.

Baseline operacional do F1:

```text
1 Change
→ 1 Work Unit
→ 1 ActorRun
→ 1 worker
→ deterministic checks / proof aplicável
```

Expansões só entram quando resolvem uma necessidade concreta.

---

## 1. Contexto e precedência

Esta decisão materializa, sem reabrir, as seguintes autoridades anteriores:

- 3B-02: `Project` é unidade independente de software/produto;
- 3B-03: `Change` é unidade verificável e aprovável de evolução;
- 3B-04: `Plan`, `Work Unit` e detalhes de decomposição são internos ao Builder e não autorizam workflow DSL genérica;
- 3B-05: Inception/Discovery do Project é anterior aos primeiros Changes;
- 3B-07: Planning Depth e Execution Rigor são eixos distintos;
- 3B-08: Project Baseline aprovada é authority pinada pelo Hub;
- 3B-16: Git, Hub/Postgres, Project Database e Registry/CAS possuem responsabilidades distintas;
- C-002/C-008: worker Pi roda atrás de boundary replaceable em sandbox E2B e não recebe durable secrets;
- C-005: artifact registry é serving/compiled authority, não authoring;
- C-013: Evidence é proof-first, observabilidade não decide autorização/aceite;
- C-014: Release/Deployment é authority de composition/promotion/serving;
- C-017: work graph do builder é `Group → Project → Change → Work Unit → ActorRun`, correctness vem antes da decomposição, Finding é durável e validation é proporcional;
- 3C-01: F1 é modular monolith no Hub;
- 3C-02: Identity & Access owns identidade/access relationships;
- 3C-03: scope lógico não implica module ownership;
- 3C-04: Project owns software identity + approved intent + explicit bindings; `Change` não é internal state do Project module.

Nada aqui escolhe:

- tabelas/FKs concretas — 3E;
- signatures TypeScript/DTOs/HTTP — 3F;
- FSM final e transições exatas — 3G;
- realização física de Pi/E2B/session freshness — 3H;
- security topology — 3I;
- deployment topology — 3J.

---

## 2. Problema que esta boundary resolve

Sem uma boundary própria de Builder, a evolução do software tenderia a ficar espalhada:

```text
Project
→ parte do Change

runtime
→ parte da execução

Observability
→ parte do Finding

Release
→ parte da validação

UI
→ parte da aprovação
```

Nesse desenho, nenhum owner responde de forma coerente:

> **“Qual mudança está sendo executada, o que precisa ser verdade, qual trabalho ainda falta e por que ela pode ou não ser encerrada?”**

Builder existe para responder essa pergunta sem se tornar um workflow engine universal.

---

## 3. Pesquisa comparativa usada para desafiar a boundary

A boundary foi confrontada com Factory, Mitra, GitHub e Harness. A comparação é usada para extrair forma e custos; não cria obrigação de copiar mecanismos.

### 3.1 Factory — runtime e orchestration são capacidades distintas

O mapa público já versionado no repositório mostra duas capacidades relacionadas, porém diferentes:

```text
Droid
→ runtime de coding agent

Missions
→ camada de planning/orchestration para trabalho grande
```

A transferência para o Conexus continua:

```text
Pi
→ runtime do worker

Builder / Hub
→ Change, correctness, planning, decomposition, validation e closure
```

Factory também distingue formas proporcionais de trabalho — execução mais direta para tarefas pequenas, Specification Mode quando planning explícito é necessário e Missions para trabalho longo/grande. Portanto, copiar a machinery de Missions para todo Change seria uso incorreto da referência.

Referências:

- `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`
- `https://docs.factory.ai/`

### 3.2 Mitra — um fluxo pode fazer muito sem multiplicar agentes

O build real observado durante a imersão Mitra mostrou um agente executando planejamento, backend, frontend, build, testes, correções e SHARE dentro de uma harness controlada. A qualidade não veio de transformar cada fase em outro agente; veio da combinação de:

- sandbox;
- instruções/constraints;
- acesso mediado por SDK/platform capabilities;
- Git;
- validação real;
- durable artifacts;
- mecanismos críticos fora da vontade do agente.

Isso apoia uma regra importante do Conexus:

```text
mais qualidade
!=
mais ActorRuns obrigatoriamente
```

Referências:

- `docs/research/MITRA-INSPIRATION-MAP.md`
- `docs/reference/mitra/07-padrao-de-projeto.md`

### 3.3 GitHub coding agent — task simples, runtime efêmero, review

Coding-agent workflows de GitHub validam a forma geral em que uma task/issue inicia trabalho em ambiente isolado e entrega um resultado versionado para revisão, sem exigir que o usuário modele DAG, stages ou uma árvore operacional inteira.

Transferência útil:

> O usuário deve pensar em intenção e resultado; a machinery interna deve permanecer invisível quando não agrega valor.

Referência:

- `https://docs.github.com/en/copilot/`

### 3.4 Harness — contraexemplo de workflow engine completo

Harness mostra o custo real de uma plataforma cujo domínio é workflow/pipeline genérico: pipeline, stage, step, step group, failure strategy, parallel branches, templates, barriers e child pipelines.

Esse é um produto válido, mas não é o consumidor atual do Conexus.

Logo:

```text
Builder
!=
GenericPipelineEngine
```

Referência:

- `https://developer.harness.io/docs/platform/pipelines/`

---

## 4. Alternativas avaliadas

### Alternativa A — Builder owns Change + execution orchestration mínima

```text
Builder
│
├── Change                    public durable boundary
│   ├── correctness contract
│   ├── checkpoint
│   ├── planning depth
│   ├── acceptance readiness
│   └── closure
│
└── execution strategy        internal
    ├── Plan quando necessário
    ├── Work Unit
    ├── ActorRun
    ├── validator dispatch
    └── fix/replan tactics
```

**Decisão:** ADOTADA para F1.

Benefícios:

- um owner coerente para a evolução verificável;
- `Change` permanece durável;
- estratégia de execução pode mudar sem quebrar outros módulos;
- evita `ChangeModule` sem consumer independente;
- evita colocar work graph dentro de Project;
- permite proporcionalidade real;
- preserva Pi como runtime substituível.

### Alternativa B — `Change` como módulo independente

```text
Change module
→ correctness/approval

Builder module
→ decomposition/execution
```

**Decisão:** DEFER.

É conceitualmente defensável, mas hoje cria uma boundary/API adicional sem eliminar machinery, sem lifecycle operacional independente e sem consumidor que precise de `Change` desacoplado do processo de construção.

Gatilho futuro possível:

- múltiplos engines de execução concorrentes consumindo o mesmo Change contract como produto independente;
- Change sendo usado por outros tipos de evolução que não passem pelo Builder;
- boundary operacional real que reduza acoplamento ou blast radius.

### Alternativa C — Builder apenas como dispatcher de Pi

```text
Project / outros módulos
→ Change semantics

Builder
→ spawn worker
```

**Decisão:** REJECT.

Isso reduz Builder a um adapter de runtime e espalha correctness, Finding, planning, approval e closure por owners diferentes.

### Alternativa D — workflow/pipeline engine genérico

**Decisão:** REJECT para F1.

Não haverá:

```text
Pipeline
Stage
GenericStep
WorkflowDSL
WorkflowPlugin
UniversalGraphEngine
StrategyRegistry
Mission/Milestone por default
```

A presença dessas abstrações em produtos de workflow não é consumer suficiente para o Conexus.

---

## 5. Responsabilidade do módulo

Builder responde à pergunta:

> **Como uma intenção aprovada de mudança de software é transformada em trabalho executável, Evidence e um resultado verificável sem permitir que o executor se torne authority sobre o próprio sucesso?**

Forma conceitual:

```text
Project approved intent
       │
       ▼
     Change
       │
       ├── correctness contract
       ├── human checkpoint
       └── planning depth
       │
       ▼
  minimal execution graph
       │
       ▼
  Work Unit / ActorRun
       │
       ▼
 validation / Findings
       │
       ▼
 ACCEPTED | BLOCKED | REJECTED | ESCALATED | NO_CHANGE_REQUIRED
```

A FSM final fica para 3G.

---

## 6. Builder owns — `Change`

`Change` é a public durable boundary do Builder.

Ele representa:

```text
intent
context
scope
constraints
expected effects
correctness assertions COR-*
contract revision/digest
approval relationship
planning depth
status/closure semantics
```

A frase central de 3B-03 permanece:

> Change descreve **o que precisa passar a ser verdade**, não os passos técnicos necessários para chegar lá.

### 6.1 Change é durável mesmo quando o runtime é descartável

```text
Change
→ durable Hub authority

ActorRun
→ durable operational fact

Pi process
→ replaceable runtime

E2B filesystem
→ ephemeral execution substrate
```

Encerrar um Pi ou destruir uma sandbox não elimina o Change.

### 6.2 Change não é Release

```text
Change ACCEPTED
!=
Release PROMOTED
```

Builder pode afirmar que o contrato de mudança foi satisfeito. Ele não pode publicar o resultado em produção por consequência implícita.

---

## 7. Builder owns — correctness contract

Correctness vem antes da decomposição.

Exemplo conceitual:

```text
CHANGE-184

COR-001
Sem vendedor selecionado, dashboard mantém total geral.

COR-002
Com sellerId=996, faturamento usa somente esse vendedor.

COR-003
Top produtos respeita o mesmo filtro.

COR-004
Nenhuma operação WRITE alcança o ERP.
```

O correctness contract pertence ao Change e é authority do Hub.

O worker recebe uma revisão pinada por digest; escrever um arquivo diferente dentro do sandbox não altera a authority ativa.

### 7.1 Revisão semântica

Quando uma descoberta prova que a definição de sucesso estava errada, o sistema não deve simplesmente permitir que o worker reescreva o contrato e continue.

Uma revisão material deve seguir a semântica de C-017:

```text
material contract change
→ previous evidence stale quando aplicável
→ novo checkpoint
→ novo dispatch sobre revision pinada
```

A transição concreta pertence a 3G.

---

## 8. Builder owns — planning depth

Builder aplica o eixo:

```text
DIRECT | LIGHT | FULL
```

Este eixo responde:

> **Quanto planejamento/discovery explícito é necessário para entender e decompor este Change?**

Ele não é equivalente a Execution Rigor.

Exemplos:

```text
DIRECT + FAST
→ label de UI simples

LIGHT + BOUNDED
→ filtro de vendedor usando query existente

FULL + CONTROLLED
→ migration + auth + novo efeito externo
```

A relação final entre planning floor e RigorProfile continua para 3G, preservando N3.

---

# 9. Invariante normativa — Minimal Sufficient Execution

Esta é a principal proteção anti-overengineering de 3C-05.

> **O Builder começa pelo menor grafo suficiente. Toda expansão deve justificar qual classe de falha, risco, contexto, dependência ou prova ela resolve.**

Baseline:

```text
Change
└── Work Unit 1
    └── ActorRun 1
```

O baseline NÃO é:

```text
Change
├── Discovery Agent
├── Planner Agent
├── Backend Worker
├── Frontend Worker
├── Test Worker
├── Validator
└── Release Agent
```

A segunda forma só é admissível quando cada separação possui justificativa concreta.

---

## 10. No Ceremonial Decomposition

Builder não deve criar Work Units apenas porque existe uma separação técnica visível.

Não é motivo suficiente:

```text
frontend é outra pasta
backend é outra pasta
SQL é outro arquivo
há três itens em um checklist
há três correctness assertions
```

Exemplo normalmente inválido:

```text
WU-01 backend
WU-02 frontend
WU-03 tests
```

apenas porque o código possui essas camadas.

A divisão deve ocorrer quando existe benefício operacional real.

### 10.1 Razões válidas para decompor

Exemplos de gatilhos:

1. **context containment** — o contexto conjunto é grande o suficiente para degradar qualidade;
2. **risk isolation** — uma parte exige authority/rigor diferente;
3. **failure isolation** — falha numa parte não deve obrigar repetição de trabalho independente;
4. **independent proof** — partes têm oracles/provas materialmente diferentes;
5. **dependency boundary** — uma etapa só pode iniciar após um resultado verificável anterior;
6. **specialized runtime/tooling** — partes exigem ambientes ou capabilities incompatíveis;
7. **parallelism medido** — existe benefício real e baixo custo de coordenação;
8. **Finding** — correção bounded merece Work Unit própria;
9. **human checkpoint adicional realmente exigido por risco** — não por ritual.

### 10.2 Default serial

Serialidade permanece default F1.

```text
serial
→ simples
→ fácil de auditar
→ menos conflito de source
→ menos merge/reconciliation
```

Paralelismo só entra por trigger medido, conforme C-017.

---

## 11. Builder owns — `Plan`, mas Plan é condicional

`Plan` é um internal do Builder.

Um Change DIRECT pode não precisar de documento/objeto de plano separado além da intenção operacional mínima necessária para dispatch.

Um Change LIGHT/FULL pode produzir uma representação explícita e pinada.

Regra:

```text
capability de planejar existe
!=
plano separado obrigatório
```

### 11.1 F3B-R2 — plan-schema v2 re-tipado

O legado pode doar mecanismos:

```text
revision
digest
validation
rendering
dependency representation
proof mapping
```

Mas não pode restaurar literalmente:

```text
Mission
Milestone
Feature
```

No F1:

```text
Change
→ Plan quando necessário
→ Work Unit
```

Os conceitos Mission/Milestone continuam ausentes conforme C-017.

---

## 12. Builder owns — `Work Unit`

`Work Unit` é a unidade bounded de trabalho interno do Builder.

Ela existe para responder:

> **Qual trabalho focado deve ser executado por um ActorRun dentro desta revisão de Change?**

Uma Work Unit deve estar ligada a correctness assertions relevantes e ao contract revision digest.

### 12.1 Work Unit não é feature de produto

`Work Unit` não implica:

```text
feature
user story
milestone
service
frontend module
backend module
```

Ela é uma unidade operacional de construção.

### 12.2 Uma Work Unit é suficiente na maioria dos Changes normais

Exemplo:

```text
Change: adicionar filtro por vendedor

WU-01:
implementar comportamento completo + testes aplicáveis
```

O mesmo worker pode alterar backend, frontend e testes se isso for a menor unidade coerente.

---

## 13. Builder owns — `ActorRun`

`ActorRun` é uma tentativa concreta e durável de executar uma Work Unit ou papel de Builder aplicável.

Ele registra facts operacionais como identidade do run, contract revision, runtime selecionado, resultado e referências de Evidence.

Mas:

```text
ActorRun
!=
Pi session
```

Pi session é uma realização concreta.

Da mesma forma:

```text
ActorRun
!=
E2B sandbox
```

A relação física final fica para 3H/3J.

### 13.1 Não congelar “uma nova microVM por ActorRun” em 3C

3C congela semântica, não custo/topologia física.

O sistema pode futuramente decidir, conforme segurança e performance:

```text
same sandbox + fresh process
snapshot/fork
new sandbox
resumed sandbox
```

quando isso mantiver as invariantes de authority e isolamento.

Em especial, **fresh validator context** não deve ser traduzido automaticamente para “nova VM obrigatória” sem necessidade.

---

## 14. Pi é runtime, não authority

Builder usa uma boundary estreita de runtime equivalente conceitualmente a `CodingWorkerRuntime`, já aprovada em C-002.

Fluxo:

```text
Builder
   │
   │ Actor Pack + scoped authority
   ▼
CodingWorkerRuntime
   │
   ▼
Pi em E2B
```

Pi pode:

- ler/investigar código;
- editar source dentro do escopo autorizado;
- executar build/testes;
- usar capabilities permitidas;
- produzir handoff e evidence candidates;
- escolher tática local.

Pi não pode, por declaração própria:

- alterar identity/access;
- alterar Change contract authoritative;
- rebaixar rigor;
- aumentar budget;
- acessar durable secret arbitrariamente;
- promover release;
- ativar artifact;
- declarar seu próprio resultado como accepted;
- converter telemetry em authority.

Regra:

```text
Hub controls authority/proof.
Pi controls local tactics.
```

---

## 15. Discovery é proporcional e não significa “spawn um agente”

C-017 exige discovery antes de fechar correctness quando o Change toca dados reais/integrações e a resposta depende de fatos que não podem ser supostos.

Mas esta regra NÃO implica:

```text
sempre criar Discovery ActorRun
```

Discovery pode ser satisfeito por:

- inspeção read-only do código;
- query read-only via Capability Gateway;
- leitura de schema/metadados;
- análise do repository context;
- um ActorRun dedicado quando a investigação for material.

Regra:

> **Discovery é uma obrigação epistemológica quando necessária, não uma etapa ceremonial fixa nem um agente obrigatório.**

---

## 16. Human checkpoint permanece, mas deve ser proporcional

C-017 exige checkpoint humano em todo Change no F1.

3C-05 não reabre essa decisão.

Para FAST/DIRECT, a UX esperada é compacta:

```text
Alterar label "Enviar" → "Salvar orçamento"
Effects: nenhum externo
Proof: build + test aplicável

[Executar]
```

O checkpoint não deve obrigar leitura de plano extenso quando não existe complexidade que o justifique.

Se uso real provar que o clique em FAST é friction sem benefício, isso poderá gerar Finding material e emenda futura a HAR-3/C-017. F1 não antecipa auto-approval agora.

---

## 17. Execution Rigor — Builder aplica, mas não cria autoridade paralela

Builder deve respeitar:

```text
FAST < BOUNDED < CONTROLLED
```

C-017 exige que o rigor seja calculado por sinais e possa ser elevado durante execution/closure/release.

3C-05 congela apenas:

> Builder nunca executa abaixo do piso de rigor aplicável ao Change/Work Unit.

Não congela ainda que a função normativa de cálculo pertença exclusivamente ao Builder, pois Release também é consumer do detector/piso. O posicionamento final dessa primitive compartilhada pertence a 3D/3G.

---

## 18. Validation orchestration

Builder owns **a orchestration da prova do Change**, não a implementação de todo oracle.

A ordem de C-017 permanece:

```text
mechanical checks
→ tests/oracles
→ runtime RUN/OBSERVE/ASSERT quando aplicável
→ served/user-flow proof quando aplicável
→ fresh validator quando material
→ human quando necessário
```

A palavra-chave é:

```text
quando aplicável
```

### 18.1 Deterministic evidence first

Se compilador/teste/oracle decide a assertion de forma confiável:

```text
não chamar validator LLM apenas para repetir a mesma decisão
```

### 18.2 Validator agentic não é default

Validator fresco entra quando elimina classe de falha real, por exemplo:

- regra de negócio sem oracle executável completo;
- UX/fluxo de usuário material;
- integração multi-superfície;
- segurança/authority;
- risco de má interpretação do prompt;
- necessidade de refutar alegação do builder.

Ele é desperdício quando:

- diff pequeno;
- critério totalmente executável;
- build/testes já decidem;
- não há comportamento de usuário ou ambiguidade material.

---

## 19. Builder owns — validator dispatch, mas validator não corrige

Quando necessário:

```text
Builder
→ dispatch fresh validator
→ validator produces Finding/evidence
→ Builder routes
```

O validator:

```text
finds / challenges / reports
```

não:

```text
finds + edits + declares fixed
```

Isso preserva independência.

O runtime físico do validator continua Pi/E2B ou outro `CodingWorkerRuntime` compatível, com tool surface sem write quando exigido por C-017.

---

## 20. Builder owns — `Finding` semantics e routing

Finding é um objeto durável de engenharia que sobrevive ao ActorRun e responde:

> **Qual gap foi provado, o que ele afeta e qual rota deve ocorrer agora?**

Builder owns semanticamente:

```text
Finding lifecycle
Finding status
contract impact
routing semantics
fix / replan / human escalation
```

Observability pode registrar os eventos e Evidence, mas não é authority sobre routing.

### 20.1 Rotas

```text
LOCAL FIX
→ hipótese nova, escopo/contrato intactos, antes de boundary de entrega aplicável

FIX WORK UNIT
→ trabalho separado bounded, arquitetura/contrato intactos

REPLAN
→ assertion/escopo/boundary mudou

HUMAN
→ ambiguidade de negócio, irreversível, autoridade insuficiente
```

A tabela determinística final pertence a 3G.

---

## 21. Change closure

Builder owns a decisão operacional sobre readiness/closure do Change dentro de sua authority.

A condição mínima não é:

```text
worker said done
```

nem:

```text
zero Findings
```

É cobertura suficiente do correctness contract com Evidence válida e nenhuma condição bloqueante aplicável.

Forma conceitual:

```text
COR-001 → PASS → evidence_ref
COR-002 → PASS → evidence_ref
COR-003 → PASS → evidence_ref
```

Assertion MUST sem verdict/evidence aplicável não vira sucesso por silêncio.

Estados finais exatos pertencem a 3G, preservando ao menos a distinção honesta entre sucesso e bloqueio/falha.

---

## 22. `NO_CHANGE_REQUIRED`

Builder deve preservar `NO_CHANGE_REQUIRED` como resultado legítimo.

Exemplo:

```text
pedido: "corrija filtro X"

investigação autoritativa:
comportamento já está correto

→ prova
→ checkpoint aplicável
→ NO_CHANGE_REQUIRED
```

O sistema não deve produzir diff apenas para demonstrar atividade.

---

## 23. Public internal API — sem congelar 3F

A public internal API do Builder deve permitir semanticamente operações equivalentes a:

```text
propose/admit Change
inspect Change
establish/revise correctness contract
approve Change checkpoint
resolve planning depth
plan/decompose quando necessário
dispatch work
record ActorRun result
request validation
record/route Finding
evaluate Change readiness
close/block/escalate Change
query accepted Change status
```

Os nomes acima são capacidades semânticas, não signatures TypeScript nem endpoints HTTP congelados.

---

## 24. Consumers

Consumers naturais da public internal API incluem:

### Project

Project fornece:

- identity;
- approved Baseline;
- canonical source repository ref;
- explicit resource bindings;
- Project Config Contract.

Builder evolui o software; não altera silenciosamente a authority do Project.

### Release / Deployment

Release pode perguntar:

```text
este Change está accepted?
qual source/output está elegível como input de candidate?
```

Release não navega Plan/Work Unit internals como authority de promotion.

### Control Plane UI

UI apresenta:

- Change contract;
- checkpoint;
- progresso;
- Findings;
- Evidence relevante;
- closure.

A UI é projection/presentation, não authority paralela.

### Observability

Recebe/correlaciona eventos e evidence references, sem decidir acceptance.

### Artifact Registry / outros módulos

Interações específicas serão fechadas em suas boundaries próprias e em 3D. Nenhum consumer ganha direito de importar Builder internals apenas porque compartilha `ChangeId`/`ProjectId`.

---

## 25. Allowed dependency intentions

O grafo exato pertence a 3D, mas 3C-05 permite semanticamente que Builder consuma public boundaries de:

```text
Project
Identity & Access
Capability Gateway
Brain quando contexto for aplicável
Connections via binding/authority apropriada
Observability para emissão/correlação
Artifact Registry quando build/compiled artifacts exigirem sua capability
runtime adapter para Pi/E2B
Git infrastructure através de boundary técnica apropriada
```

Regra:

> Builder pode orquestrar outros owners; não pode apropriar-se da authority deles.

---

## 26. Forbidden dependencies / access

Builder não pode usar diretamente como authority própria:

```text
Identity & Access tables/internals
Project business database bypassando Gateway
Connection credential material
Artifact Registry private internals
Release mutable internals
Observability logs como autorização
Production Agent Runtime private state
Storage bytes como prova de ownership
E2B filesystem como durable source of truth
Pi transcript como correctness authority
```

Consumers não podem depender estruturalmente de:

```text
Builder.Plan internals
Builder.WorkUnit internals
Builder.ActorRun topology
validator topology
retry graph
prompt internals
Pi session internals
```

---

## 27. Authority boundary

Builder é authority para:

```text
Change contract/lifecycle
planning/decomposition semantics
Work Unit / ActorRun work graph
validation orchestration
Finding routing
Change readiness/closure
```

Builder NÃO é authority para:

```text
identity/access
credential material
external effect permission
artifact activation
release promotion
production serving
business-data access bypass
Workspace/Project structural lifecycle
Brain publication
Connection qualification authority que pertence ao módulo correspondente
```

Consequência:

```text
Builder says "execute query"
→ Gateway ainda pode deny

Builder says "Change accepted"
→ Release ainda pode deny promotion

Builder says "use Connection X"
→ binding/qualification/policy ainda precisa ser válida
```

---

# 28. Happy paths proporcionais

## 28.1 DIRECT / FAST

Exemplo:

> “Troque o texto do botão Enviar para Salvar orçamento.”

Forma esperada:

```text
prompt
→ compact Change contract
→ human checkpoint compacto
→ 1 Work Unit
→ 1 ActorRun / Pi
→ build/test aplicável
→ accepted
```

Normalmente NÃO exige:

```text
separate Plan
dedicated discovery
fresh validator
validation database
multiple workers
multiple sandboxes
```

## 28.2 LIGHT / BOUNDED

Exemplo:

> “Adicione filtro por vendedor no dashboard e mantenha os cards/top produtos coerentes.”

Forma típica:

```text
prompt
→ short investigation/discovery se necessário
→ correctness contract
→ human checkpoint
→ 1 Work Unit por default
→ 1 Pi implementa backend + frontend + tests quando coerente
→ deterministic tests + preview quando aplicável
→ accepted
```

Segunda Work Unit só surge se existir motivo real.

## 28.3 FULL / CONTROLLED

Exemplo:

> “Troque autenticação, faça migration de usuários e conecte pagamentos externos.”

Forma justificadamente maior:

```text
discovery material
→ correctness contract forte
→ FULL plan
→ multiple Work Units quando isolates risk/context
→ human checkpoint
→ controlled execution
→ migration/effect/security proof
→ validator fresco quando material
→ preview/conformance
→ accepted ou blocked
```

A machinery pesada se paga aqui porque o custo de erro é material.

---

## 29. Exemplo ponta a ponta — filtro por vendedor

### Entrada

Usuário no Project “Análise de Vendas” pede:

```text
Adicione filtro por vendedor.
Quando selecionar um vendedor,
faturamento, ticket médio e top produtos devem recalcular.
Só leitura no Sankhya.
```

### Passo 1 — access + Project context

Identity & Access confirma que o operador pode criar/aprovar Change naquele Project.

Project fornece Baseline ativa, repo canônico e binding para a Connection Sankhya read-only.

### Passo 2 — Change shaping

Builder cria:

```text
CHANGE-184

intent:
filtro por vendedor no dashboard

constraints:
zero write no ERP
preservar comportamento sem filtro
```

### Passo 3 — discovery proporcional

Como toca dado real, Builder precisa saber como vendedor é representado.

Isso pode ser satisfeito por uma investigação read-only — sem obrigar “Discovery Agent” como etapa fixa.

Exemplo de fato descoberto:

```text
TGFCAB.CODVEND
→ relação existente usada pelo Project
```

### Passo 4 — correctness contract

```text
COR-001 sem filtro mantém totais gerais
COR-002 sellerId filtra faturamento/ticket
COR-003 top produtos usa mesmo filtro
COR-004 nenhum write alcança ERP
```

### Passo 5 — planning/rigor

Exemplo provável:

```text
PlanningDepth = LIGHT
RigorProfile floor = BOUNDED
```

### Passo 6 — checkpoint

Operador recebe uma síntese curta e aprova.

### Passo 7 — execução mínima

Builder começa por:

```text
WU-01
→ implementar comportamento completo
```

Cria:

```text
ActorRun A-9002
```

Runtime adapter provisiona/usa ambiente E2B adequado e executa Pi com Actor Pack pinado.

Pi pode alterar backend, frontend e testes dentro da mesma Work Unit.

### Passo 8 — proof

Pi terminar não é acceptance.

Hub/Builder compõe as verificações aplicáveis:

```text
build
unit/integration tests
read-only/effect check
preview se necessário
```

Se isso responder totalmente às assertions, não há motivo para spawn de validator.

Se COR-003 depender de comportamento de UI difícil de provar deterministicamente, Builder pode disparar validator fresco.

### Passo 9 — Finding quando necessário

Se validator provar que top produtos ignora sellerId:

```text
Finding F-77
→ affects COR-003
→ route FIX WORK UNIT
```

Só então aparece outra Work Unit.

### Passo 10 — closure

Quando as assertions possuem Evidence adequada e não há blocker:

```text
CHANGE-184 ACCEPTED
```

Builder termina sua authority.

### Passo 11 — Release separado

Release/Deployment decide se o resultado pode compor candidate e ser promovido.

```text
Change accepted
!=
auto deploy
```

---

# 30. Persistência versus efemeridade

## Hub/Postgres — facts duráveis/authority operacional

Conceitualmente:

```text
Change
contract revision/digest
checkpoint
Work Unit identity
ActorRun facts
Finding projection
acceptance/closure state
Evidence references
```

A forma física pertence a 3E.

## Git — source/versioned content

```text
source code
tests
Project Baseline content
authored artifacts
docs
```

## E2B — execution substrate

```text
worker filesystem
Pi process
build scratch
temporary test state
```

E2B não vira source of truth apenas porque contém um filesystem completo durante a execução.

## Secrets

Durable secret material permanece fora do guest conforme C-008/C-016.

---

# 31. Proteções anti-latência / anti-custo

Builder F1 deve preservar estas intenções:

1. **one worker first** — não spawnar vários agentes por hábito;
2. **one Work Unit first** — decompor apenas por motivo concreto;
3. **deterministic proof first** — não pagar validator LLM para repetir teste;
4. **no mandatory separate planning turn** para DIRECT;
5. **no mandatory separate discovery agent**;
6. **no mandatory new sandbox per phase** decidido em 3C;
7. **no permanent validation DB** — temporária e condicional quando realmente necessária;
8. **serial by default**;
9. **same Project context can be reused efficiently** desde que 3H/3I preservem isolation/authority;
10. **UI mostra cinco macro-etapas, não machinery interna**.

UX conceitual desejada:

```text
ENTENDER
→ APROVAR
→ CONSTRUIR
→ VERIFICAR
→ PRONTO / BLOQUEADO
```

Não mostrar como ritual obrigatório:

```text
ActorRun 1
ActorRun 2
Plan node 3
Graph edge 4
Validator queue 5
```

salvo quando operador técnico quiser drill-down.

---

## 32. O que não construir em F1

```text
GenericWorkflowEngine
WorkflowDSL
Pipeline/Stage/Step model genérico
Mission entity
Milestone entity
Feature entity paralela ao Change
strategy plugin registry
planner marketplace
validator marketplace
universal DAG scheduler
parallel-agent fabric por default
new E2B for every conceptual step
validator LLM universal
per-Change permanent database
generic retry engine sem failure class concreta
```

---

## 33. Triggers futuros legítimos

A decisão pode ser reaberta se aparecer consumidor/failure class real, por exemplo:

### Mission

Gatilho:

- necessidade de agrupar múltiplos Changes com budget/approval/validation próprios.

### Milestone

Gatilho:

- Change real exige estado intermediário durável com acceptance/gate próprios.

### Change module independente

Gatilho:

- mais de um execution engine real precisa consumir Change como produto independente.

### Parallel scheduler

Gatilho:

- medições mostram throughput insuficiente e work partitions com baixo custo de coordenação.

### Generic strategy plugin

Gatilho:

- segundo strategy provider de produção possui lifecycle/contract realmente incompatível com a implementação atual.

Até lá, DEFER.

---

# 34. Consequências arquiteturais

### Positivas

- `Change` ganha owner inequívoco;
- Builder permanece substituível internamente;
- Project não vira god-module;
- Pi/E2B não vazam como semântica de domínio;
- correctness não depende da autodeclaração do worker;
- execução simples continua simples;
- execução complexa ganha controles quando necessários;
- Release continua authority independente;
- Finding tem lifecycle coerente;
- F3B-R2 é parcialmente resolvido por re-tipagem do plan-schema legado.

### Custos aceitos

- Hub precisa persistir work graph mínimo;
- haverá lógica de admission/planning/routing;
- alguns Changes usarão múltiplos ActorRuns;
- checkpoints têm custo de UX;
- validation proporcional precisa de eval posterior.

Esses custos possuem consumidores/failure classes atuais e são menores que o custo de uma workflow engine genérica.

---

# 35. Invariantes normativas de 3C-05

1. **Builder owns `Change` como public durable boundary.**
2. **Project não owns o work graph.**
3. **`Plan`, `Work Unit` e `ActorRun` são internals do Builder para outros domínios.**
4. **Correctness contract vem antes de decomposição material.**
5. **Worker nunca é authority sobre o próprio acceptance.**
6. **Pi é runtime replaceable, não domínio.**
7. **E2B é execution substrate, não source of truth.**
8. **Change accepted não implica Release promoted.**
9. **Finding sobrevive ao ActorRun e routing pertence ao Builder.**
10. **Validator não corrige o que está julgando.**
11. **Validator agentic é condicional, nunca default universal.**
12. **Discovery é condicional pela necessidade de fatos, não uma etapa ceremonial.**
13. **Baseline operacional é uma Work Unit e um ActorRun.**
14. **Decomposição adicional exige justificativa concreta.**
15. **Não dividir por pasta/camada/checklist sem benefício operacional.**
16. **Serialidade é default F1.**
17. **Planning Depth e RigorProfile permanecem eixos distintos.**
18. **Builder respeita o piso de rigor; não o rebaixa.**
19. **Nenhum workflow DSL/pipeline engine genérico no F1.**
20. **Nenhum Mission/Milestone sem trigger real.**

---

# 36. Findings / encaminhamentos para fases posteriores

### F3C05-1 — detector compartilhado de RigorProfile

Owner: 3D/3G.

Builder é consumer do rigor, mas Release também recalcula/aplica piso. Definir local mínimo da primitive normativa sem criar policy framework genérico.

### F3C05-2 — physical sandbox/session reuse

Owner: 3H/3I/3J.

3C não exige sandbox nova por ActorRun. Qualificar quando reutilizar, pausar/resumir, snapshot/fork ou reprovisionar E2B sem enfraquecer isolation/freshness.

### F3C05-3 — Git transfer/integration mechanics

Owner: 3D/3H/3J.

Builder owns work semantics; Git infrastructure owns transport/mechanics. Fechar como candidate changes passam do guest para o canonical repo sem durable credential no guest.

### F3C05-4 — exact Change/Work Unit/ActorRun persistence

Owner: 3E.

Definir schema mínimo, constraints, CAS/revision semantics e projection de Finding sem criar generic workflow schema.

### F3C05-5 — API contracts

Owner: 3F.

Definir command/query contracts e effective error model sem expor Plan/WU internals desnecessariamente.

### F3C05-6 — behavioral lifecycle

Owner: 3G.

Definir FSM mínima de Change, Work Unit, ActorRun e Finding, incluindo stale evidence, BLOCKED, escalation e `NO_CHANGE_REQUIRED`.

---

# 37. Decisão final aprovada

> **No Conexus F1, `Builder` é o módulo de evolução verificável do Project. Ele owns a boundary durável `Change`, seu correctness contract, checkpoint humano, planning depth, decomposição em `Plan`/`Work Unit` quando necessária, `ActorRun`, orchestration de validação, `Finding` lifecycle/routing e Change closure. `Change` é sua public durable boundary; `Plan`, `Work Unit`, `ActorRun` e a estratégia concreta de execução permanecem internals substituíveis do Builder. Pi/E2B são consumidos por uma runtime boundary estreita e não possuem authority sobre o Change. Builder não owns identity/access, artifacts, releases, serving, production-agent runtime, telemetry authority, credentials ou business data. O F1 aplica `Minimal Sufficient Execution`: começa por uma única Work Unit e um único ActorRun, adicionando planejamento explícito, Work Units, ActorRuns, validators, validation databases ou isolamento adicional apenas quando uma necessidade concreta de risco, contexto, dependência ou prova justificar. Não haverá workflow DSL, Mission/Milestone, generic pipeline engine ou strategy plugin framework sem consumidor real.**

---

## Próxima decisão natural

Com `Identity & Access`, `Workspace`, `Project` e `Builder` delimitados, a próxima boundary candidata é **Artifact Registry**, inclusive para resolver materialmente F3B-R3: scope do Registry e mapa `kind → authoring root` sem transformar registry em authoring system ou generic resource registry.
