# 3C-09 — Brain Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão normativa

No Conexus F1, `Brain` é o módulo Workspace-scoped que owns o significado organizacional reutilizável e sua governança semântica.

Cada Workspace possui no máximo um Brain canônico, organizado por namespaces/domínios e pelas classes fechadas:

```text
SEMANTIC
KNOWLEDGE
EVIDENCE
```

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

## Refinamento 3C-09-A — BrainRevision

`BrainRevision` de C-011 não vira segunda revision authority.

Ele é a visão semântica, no domínio Brain, de uma `ArtifactRevision(kind=brain)` exata.

```text
Brain
→ what brain/v1 means
→ semantic validity
→ compiler semantics

Artifact Registry
→ exact revision identity
→ digest
→ immutable payload
→ availability
```

## Refinamento 3C-09-B — health versus binding conformance

São dimensões distintas:

```text
Brain Definition Health
→ o conhecimento organizacional continua válido?

Project Binding Conformance
→ este Project continua materializando corretamente a semântica pinada?
```

Uma implementação local inválida não invalida automaticamente o conhecimento global.

## Publicação

Princípio:

```text
machine may propose
human publishes
```

Builder, Agent ou Project podem originar `KnowledgeProposal`; somente o fluxo governado do Brain transforma proposta aprovada em conteúdo publicado.

## Brain não é memória, RAG ou policy engine

```text
Brain != Conversation memory
Brain != Builder work state
Brain != Observability store
Brain != vector database
Brain != authorization engine
```

RAG/vector search, knowledge graph e outras camadas futuras podem surgir por necessidade medida, mas permanecem projeções derivadas da semântica publicada.

## AnalyticQuery

```text
AnalyticQuery
→ Brain validates semantic IDs and compiles restricted semantic plan
→ Capability Gateway performs physical read
```

Regra:

```text
Semantic Planning != Physical Execution
```

## Evolution by Preserved Semantics

F1 permanece simples, mas preserva:

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

Gatilhos futuros independentes:

- **G1 Retrieval:** seleção/context budget/evals provam insuficiência da seleção determinística;
- **G2 Graph projection:** dependency/impact traversals deixam de ser bem atendidos pelas relações tipadas;
- **G3 Brain partitioning:** lifecycle/authority/trust/stewardship/scale realmente exigem múltiplos Brains;
- **G4 Advanced governance:** consumidor real exige ontology, DMN/BPMN, temporal reasoning ou formal rule engine.

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

## Decisão final

> O Brain F1 é uma authority semântica canônica por Workspace, com conteúdo tipado, publicação humana, bindings explícitos e slices determinísticas. Camadas futuras de retrieval, graph, ranking ou reasoning podem evoluir sobre essa base quando houver evidência, mas não substituem a autoridade do Brain publicado.
