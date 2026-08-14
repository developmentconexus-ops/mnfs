# 3C-09 — Brain Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, `Brain` é o módulo Workspace-scoped que owns o significado organizacional reutilizável e sua governança semântica. Cada Workspace possui no máximo um Brain canônico, organizado por namespaces/domínios e pelas classes fechadas `SEMANTIC | KNOWLEDGE | EVIDENCE`.

Brain owns semanticamente:

- `BrainDefinition`;
- validação e compilação de `brain/v1`;
- dependency closure;
- `KnowledgeProposal` e publicação humana;
- health semântico do conhecimento;
- validação semântica de `ProjectBrainBinding`;
- binding conformance;
- derivação de `EffectiveBrainPlan`/`EffectiveBrainSlice`;
- compilação semântica de `AnalyticQuery`.

## Authority boundaries

```text
Git
→ source of truth do conteúdo publicado

Artifact Registry
→ ArtifactRevision(kind=brain), digest, immutable payload, AVAILABLE

Project
→ ProjectBrainBinding intent/authoring

Brain
→ semantic meaning, validation, compilation, publication semantics, health/conformance

Capability Gateway
→ physical data execution

Production Agent Runtime / Builder
→ final ContextPack/execution context

Observability
→ event/evidence recording
```

Invariantes:

```text
meaning != physical implementation
knowledge != execution authority
evidence specification != telemetry store
retrieval result != published truth
business knowledge != security policy
semantic planning != physical execution
```

## Por que Brain é módulo próprio

A necessidade não nasce de RAG. Nasce de significado reutilizável acima de um Project.

Exemplo:

```text
company:margin
├── significado canônico
├── grain esperado
├── unidade/moeda
├── regra de custo
├── caveat crítico
├── provenance
└── evidence requirements
```

Projects distintos podem materializar o mesmo logical ID de formas diferentes. Duplicar a definição em cada Project criaria drift semântico; tornar o Brain parte de um Project eliminaria reuse.

## Pesquisa comparativa — síntese transferida

- **Mitra:** observação real de `DynamicCubeQuery`, `dimension_store` e `data_dictionary` confirma a necessidade de semantic layer, mas não fornece nossa authority/versioning boundary.
- **dbt Semantic Layer:** valida métrica/entidade canônica consumida por várias ferramentas.
- **Cube:** valida semantic models e query por IDs; Conexus não copia a união semantic layer + warehouse execution.
- **Snowflake semantic views / Cortex Analyst:** valida semantic context governado e sugestões/verified queries sujeitas a revisão humana.
- **Factory:** reforça contexto durável/versionado e separação entre conteúdo canônico e estratégia de carregamento.

Transferência comum:

```text
canonical meaning
!=
consumer/runtime implementation
```

## Alternativas

### A — um Brain canônico estreito

**ADOTADA.** Semantic + knowledge + evidence compartilham IDs, provenance, dependencies e publication lifecycle sem criar infra futura antecipada.

### B — Semantic Layer e Knowledge Base como módulos separados

**REJECT F1.** Duplicaria publication, provenance, binding e context selection antes de lifecycle/owner independente real.

### C — Brain = arquivos Git injetados diretamente no prompt

**REJECT.** Não resolve semantic validation, binding conformance, health, dependency closure, proposal/publication governance nem AnalyticQuery.

### D — Universal Knowledge/RAG/Graph Platform

**REJECT F1.** Vector DB, ontology, graph, memory framework e rule engine não têm consumidor atual suficiente.

## Um Brain canônico por Workspace no F1

```text
Workspace
→ 0..1 Canonical Brain
```

`0` porque Workspace simples pode não precisar de Brain no início. `1` porque namespaces/domínios internos bastam hoje:

```text
company.*
commercial.*
purchasing.*
inventory.*
finance.*
tax.*
marketplace.*
```

Múltiplos Brains só entram quando lifecycle, trust boundary, stewardship ou escala independentes forem problemas reais.

## Classes de conteúdo fechadas

### SEMANTIC

```text
datasets
entities
dimensions
measures
metrics
grain
relationships
units/precision/aggregation semantics
```

### KNOWLEDGE

```text
glossary
business rules
caveats
processes
campaign/context knowledge
business policies
```

### EVIDENCE

```text
provenance specifications
assertions
verification requirements
golden cases
validity constraints
```

`EVIDENCE` significa o que deve ser provado e como interpretar prova; não é o event/log store.

## Refinamento 3C-09-A — BrainRevision × ArtifactRevision

C-011 usa `BrainRevision` como conceito de versão publicada. 3C-06 congelou que Artifact Registry owns revision identity/digest/payload/availability.

Não haverá duas authorities rivais.

> `BrainRevision` é a visão semântica, no domínio Brain, de uma `ArtifactRevision(kind=brain)` exata.

```text
Brain
→ what brain/v1 means
→ semantic validity
→ compiler semantics
→ publication meaning

Artifact Registry
→ exact revision identity
→ digest
→ immutable payload
→ AVAILABLE
```

`BrainPack` segue a mesma divisão: Brain owns formato/compiler semantics; Registry owns bytes/digest/availability.

## Publicação — machine proposes, human publishes

```text
Project / Builder / Agent / Human
          │
          ▼
KnowledgeProposal
          │
          ▼
Brain review
    ┌─────┴─────┐
 reject      approve/edit
                  │
                  ▼
               Git commit
                  │
                  ▼
          validate / compile
                  │
                  ▼
          Artifact Registry
             AVAILABLE
```

`AVAILABLE` não significa adotado por nenhum Project. Project continua pinado à revisão anterior até validar/promover nova composição.

`KnowledgeProposal` permanece Brain-owned porque o target é conhecimento Workspace-scoped, mesmo quando a origem é um Project/ActorRun/Conversation. Builder/Agent podem originar proposta/evidence; não publicam authority diretamente.

## Brain não é memória de agente

```text
Brain
!= Conversation memory
!= AgentRun history
!= Builder scratchpad
!= tasks.md
!= personal user memory
```

Framework futuro de memory pode gerar `KnowledgeProposal`; não escreve Brain automaticamente.

## Brain não é RAG

F1 usa seleção determinística + dependency closure:

```text
BrainPack
    ↓
deterministic selection
    ↓
dependency closure
    ↓
EffectiveBrainSlice
```

Uma métrica sem caveats/dependencies críticos é semanticamente incompleta.

Quando retrieval for necessário:

```text
canonical Brain
     │
     └── derived retrieval index
              ↓
        candidate logical IDs
              ↓
       dependency closure
              ↓
       EffectiveBrainSlice
```

Vector/search index nunca vira source of truth.

## Context delivery

Brain não owns o `ContextPack` completo.

```text
BrainPack
+
ProjectBrainBinding
+
health/conformance
+
consumer scope
        │
        ▼
EffectiveBrainPlan
        │
        ▼
EffectiveBrainSlice
```

Production Agent Runtime ou Builder compõem a slice com as demais camadas de contexto. Consumidores não dependem da estratégia de seleção.

## ProjectBrainBinding — choice versus semantic validation

3C-04 permanece intacta:

```text
Project owns binding intent
Brain owns semantic compatibility judgment
Release owns exact promoted composition
```

Brain pode validar logical ID, source admissível, grain, uniqueness/cardinality e dependency closure sem se tornar owner do binding.

## Refinamento 3C-09-B — Brain Health × Binding Conformance

São dimensões distintas.

### Brain Definition Health

Pergunta: o conhecimento empresarial publicado continua semanticamente válido?

### Project Binding Conformance

Pergunta: este Project continua materializando corretamente a semântica que pinou?

Estado legítimo:

```text
company:margin Definition Health = VALID
Project Comercial Binding = VALID
Project Marketplace Binding = INVALID
```

Uma regressão local não invalida automaticamente o conhecimento global.

BrainPack permanece imutável; health/conformance são overlays operacionais usados para derivar o plano/slice efetivos.

## Execução das provas

```text
Brain
→ requests assertion/probe

Capability Gateway
→ executes controlled read

Project DB / Connection
→ result

Brain
→ interprets semantic PASS/FAIL

Observability
→ records/correlates execution facts
```

Regra:

```text
Brain owns what the evidence means
Gateway owns physical execution
Observability owns event recording
```

## Business knowledge não vira security policy

Brain pode declarar business truth/policy, mas texto semântico não se transforma automaticamente em enforcement mecânico.

Se a regra precisa ser enforçada, ela deve ser realizada no owner técnico adequado.

```text
Brain describes governed business truth
!=
Brain is authorization/policy engine
```

## AnalyticQuery

```text
AnalyticQuery typed request
        │
        ▼
Brain
├── validates logical IDs
├── resolves EffectiveBrainPlan
├── validates metrics/dimensions/operators
├── resolves grain/dataset
└── compiles restricted semantic plan
        │
        ▼
Capability Gateway
├── physical read enforcement
├── project query role
├── bound parameters
├── timeout
└── row/byte ceilings
        │
        ▼
Project Database
```

Regra:

```text
Brain owns semantic query compilation
Gateway owns physical query execution
```

LLM envia IDs do Brain, não SQL físico no regime AnalyticQuery. F1 mantém um dataset analítico curado por query; combinação estrutural nova exige evolução aprovada do Project/dataset.

## Exemplo Sankhya — meaning versus reachability

```text
Brain
→ significado de TGFCAB/TGFITE/CODVEND/TOPs/caveats

Connection
→ onde/como alcançar o Sankhya real

ProjectBrainBinding
→ como o Project materializa logical IDs

Gateway
→ como o read físico executa
```

Nenhum desses conceitos absorve o outro.

## Evolution by Preserved Semantics

F1 não constrói machinery futura, mas preserva:

```text
stable logical IDs
typed content
explicit dependencies/relationships
provenance
compiler boundary
health/conformance signals
EffectiveBrainSlice as consumption boundary
measurable evals
```

Consumidores dependem da semântica/slice, não de grep, embedding model, vector DB ou graph engine específico.

### G1 — Retrieval

Entrar quando context/selectivity/evals provarem que seleção determinística é insuficiente. Candidatos serão avaliados na época: lexical/BM25, vector, hybrid, rerank.

Princípio:

```text
retrieval → candidate IDs → dependency closure → EffectiveBrainSlice
```

### G2 — Graph projection

Entrar quando traversal/impact/dependency reasoning não for bem atendido pelas typed relationships existentes. Graph será projeção derivada, não authority.

### G3 — Brain partitioning

Entrar quando um Brain canônico não representar corretamente lifecycle, authority/trust boundary, stewardship ou scale independentes. Nenhuma federation nasce no F1.

### G4 — Advanced knowledge governance

Entrar somente com consumidor real para ontology, DMN/BPMN, temporal reasoning ou formal rule engine.

Cada gatilho é independente; “Brain ficou grande” não dispara tudo.

## Future intelligence layers remain projections

> Camadas futuras de retrieval, embedding, ranking, graph ou reasoning podem ajudar a localizar/compor conhecimento, mas permanecem projeções/derivações sobre a semântica canônica publicada e não substituem a authority do Brain.

```text
retrieval says "relevant"
!=
Brain says "governed truth"
```

## O que Brain owns

```text
Canonical Brain identity within Workspace
BrainDefinition semantics
SEMANTIC | KNOWLEDGE | EVIDENCE model
brain/v1 validation rules
Brain Compiler semantics
BrainPack format semantics
dependency closure
KnowledgeProposal semantics/lifecycle
human publication semantics
Definition Health interpretation
ProjectBrainBinding semantic validation
Binding Conformance interpretation
EffectiveBrainPlan derivation
EffectiveBrainSlice generation
AnalyticQuery semantic compilation
```

## O que Brain não owns

```text
ArtifactRevision identity/digest/AVAILABLE → Artifact Registry
ProjectBrainBinding intent/authoring → Project
Project physical schema/data → Project data plane
physical SQL/API execution → Capability Gateway
Connection lifecycle → Connections
ContextPack whole composition → Production Agent Runtime / Builder
Conversation memory → Production Agent Runtime
Change / Plan / Work Unit / ActorRun → Builder
raw telemetry/event store → Observability
Release promotion/serving → Release / Deployment
security authorization → Identity & Access / domain owner
Git transport → Git Infrastructure
```

## Invariantes anti-overengineering

```text
One Canonical Brain per Workspace F1
No RAG Authority
Semantic Planning != Physical Execution
Business Knowledge != Security Policy
Evolution by Preserved Semantics
```

Não construir F1:

- múltiplos Brains independentes;
- Brain federation;
- cross-Workspace sharing;
- live inheritance;
- vector database obrigatório;
- generic RAG pipeline;
- knowledge graph database;
- ontology/rule engine;
- automatic self-learning/self-publish;
- memory framework dentro do Brain;
- semantic plugin registry;
- arbitrary runtime join planner.

## Defer para fases seguintes

- **3D:** dependency directions e anti-cycle rules;
- **3E:** physical representation de Brain/proposals/health/conformance;
- **3F:** `brain/v1`, `brain-binding/v1`, AnalyticQuery e slice contracts;
- **3G:** KnowledgeProposal e health/conformance state machines;
- **3H:** compiler/selector/renderer/semantic planner implementation;
- **3I:** authority para editar/publicar conhecimento e sensitive knowledge classes;
- **3J:** health jobs, future index rebuild/recovery e operational placement.

## Decisão final

> O Brain F1 é simples de propósito: uma authority semântica canônica por Workspace, com conteúdo tipado, publicação humana, bindings explícitos e slices determinísticas. A arquitetura preserva seams para crescer quando dados/evals provarem necessidade, mas retrieval, graph e outras inteligências futuras permanecem projeções substituíveis sobre a semântica publicada — nunca novas fontes de verdade.
