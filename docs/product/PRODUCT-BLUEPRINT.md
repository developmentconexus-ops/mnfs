---
id: DOC-PRODUCT-BLUEPRINT
title: MNFS Product Blueprint
document_type: product_blueprint
form: explanation
authority: generated_projection
status: generated
version: 1.0.0
owners:
  - developmentconexus-ops
generated_from:
  - docs/product/blueprint/01-product-vision.md
  - docs/product/blueprint/02-domain-model.md
  - docs/product/blueprint/03-lifecycle-flows.md
  - docs/product/blueprint/04-engineering-system.md
  - docs/product/blueprint/05-system-architecture.md
  - docs/product/blueprint/06-roles-authority.md
  - docs/product/blueprint/07-quality-evidence.md
  - docs/product/blueprint/08-state-recovery.md
  - docs/product/blueprint/09-context-memory.md
  - docs/product/blueprint/10-security-isolation.md
  - docs/product/blueprint/11-operator-observability.md
  - docs/product/blueprint/12-capability-roadmap.md
  - docs/product/blueprint/13-documentation-governance.md
related:
  - DOC-PRODUCT-INDEX
  - DOC-DOCUMENTATION-MAP
tracking_issue: 6
---

<!-- GENERATED — DO NOT EDIT
Source: docs/product/blueprint/*.md
Generator: scripts/generate-product-blueprint.mjs
Generator version: 2
Source manifest hash: sha256:ae325478931877568c3024434a58c6837dbc0e3d3e0e6313c6ebb404e3aa803f
-->

# MNFS Product Blueprint

**Status:** Accepted architecture baseline  
**Version:** 1.0.0  
**Authority:** Constitutional  
**Tracking:** GitHub Issue #6

> The editable sources are the 13 files under `docs/product/blueprint/`.
> This aggregate exists for complete reading and publication.

---

## ARR-RECONCILIATION-2026-08-07 — Current constitutional direction

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

The current product architecture is:

```text
Thin Sovereign Semantic Kernel
+ Validation-first Planning
+ Replaceable Open Agent Runtime
+ Property-based Execution Environment
+ Provider-neutral Git Result Boundary
+ Independent Evidence / Gates
+ Capability-first Sourcing
```

Pi, Treehouse and the historical fixed E1 realization remain useful implementation Evidence and candidates where applicable; they are not constitutional requirements after D-012 through D-015. Product M2 keeps its secure one-Worker outcome but its realization is an Opportunity Replan and revision-5 M02 must not be implemented.

---

# 1. Visão do Produto

## 1.1 Definição

MNFS é uma **development harness planning-first e evidence-driven** que governa Agent Runtimes substituíveis e transforma um objetivo do operador em uma entrega de software planejada, executada, verificada, integrada e comprovada.

O operador conversa com um único agente principal, o **MNFS Lead**. Esse lead conduz o planejamento, coordena agentes especializados, apresenta decisões, acompanha a execução e devolve resultados consolidados.

Os agentes trabalhadores são executores probabilísticos. O MNFS é o control plane determinístico que governa:

- contratos;
- estado;
- identidade;
- transições;
- isolamento;
- padrões de engenharia;
- Golden Paths;
- guardrails e fitness functions;
- evidências;
- gates;
- recuperação;
- integração;
- encerramento.

A experiência pretendida é:

```text
operador descreve um objetivo
        ↓
MNFS investiga e esclarece o necessário
        ↓
MNFS produz um plano estruturado
        ↓
operador revisa visualmente no Lavish
        ↓
operador aprova um contrato por hash
        ↓
MNFS divide o trabalho em trilhas seguras
        ↓
Actors delimitados executam por um Agent Runtime dentro de isolated mutable workspaces e Execution Environments governados
        ↓
workers emitem CLAIMS e evidências
        ↓
MNFS verifica, revisa e corrige conforme o risco
        ↓
mudanças são compostas em ambiente limpo
        ↓
QA valida o sistema como usuário
        ↓
MNFS entrega e encerra a missão com evidência
```

M0 e M1 já provaram partes essenciais dessa visão: identidade durável de repositório, SQLite fora dos worktrees, recuperação em processo novo, planejamento estruturado, revisão visual por Lavish e aprovação vinculada ao hash exato do contrato.

---

## 1.2 O problema que o MNFS resolve

Agentes de código modernos conseguem produzir muito código rapidamente, mas não são, por conta própria, sistemas confiáveis de desenvolvimento de software.

Uma sessão isolada tende a otimizar a tarefa imediatamente visível. O produto, porém, depende de relações que atravessam:

- backend;
- frontend;
- banco;
- contratos;
- autorização;
- infraestrutura;
- testes;
- operação;
- experiência do usuário.

Sem uma Harness, aparecem padrões recorrentes:

### Perda de intenção

O agente esquece decisões, restrições ou critérios quando a sessão cresce ou é reiniciada.

### Conclusão falsa

O agente afirma que uma feature está pronta porque:

- o código compila;
- testes locais passam;
- um mock responde;
- o arquivo foi criado;
- a própria implementação parece correta.

Nada disso prova, sozinho, que o comportamento necessário existe no sistema real.

### Features localmente corretas e sistemicamente incompletas

Cada parte parece funcionar, mas:

- o adapter não foi conectado;
- o endpoint não foi registrado;
- o frontend não consome o contrato real;
- a migration não participa do fluxo;
- o erro não chega ao usuário;
- uma dependência continua stubada.

### Autoavaliação permissiva

O mesmo contexto que planejou e implementou tende a defender as próprias decisões e aceitar evidências fracas.

### Loops de reparo sem aprendizado

O agente repete tentativas semelhantes, muda pequenas linhas e continua atacando a mesma falha sem formular uma nova hipótese.

### Excesso de prosa sem enforcement

Regras importantes ficam em documentos, prompts e skills, mas não são transformadas em:

- schemas;
- testes;
- estados;
- políticas;
- comandos;
- gates.

### Coordenação cara

Agentes e reviewers recebem contexto demais, repetem análises, disputam ownership e consomem mais tokens coordenando o trabalho do que resolvendo o problema.

O MNFS existe para converter essas lições em mecanismos executáveis, sem preservar a complexidade específica do Claude Code.

---

## 1.3 Promessa central

> **O MNFS transforma intenção em entrega comprovada, sem depender da memória, da autodeclaração ou da boa vontade de uma sessão de IA.**

Essa promessa possui quatro dimensões.

### 1.3.1 Controle

O sistema deve saber, de maneira estruturada:

- qual missão está ativa;
- qual contrato foi aprovado;
- quais unidades de trabalho existem;
- quais dependências bloqueiam cada unidade;
- qual worker possui qual trilha;
- qual estado cada execução ocupa;
- qual evidência foi produzida;
- qual decisão falta;
- o que pode avançar.

### 1.3.2 Qualidade

Nenhum trabalho é aceito apenas porque o implementador declarou conclusão.

O MNFS deve distinguir:

```text
CLAIM
→ o worker afirma que cumpriu

RECEIPT
→ uma verificação controlada produziu evidência

VERDICT
→ uma autoridade permitida decidiu
```

A qualidade final deve combinar, conforme o risco:

- verificações determinísticas;
- análise arquitetural;
- review independente;
- integração;
- QA como usuário;
- evidência ligada aos critérios.

### 1.3.3 Continuidade

Uma sessão é substituível.

O operador deve poder:

- fechar o lead;
- reiniciar o terminal;
- trocar o modelo;
- perder uma mensagem;
- interromper um worker;

sem perder a missão, o estado ou as evidências já aceitas.

### 1.3.4 Eficiência

O MNFS deve aplicar rigor proporcional ao risco.

Não haverá uma cerimônia completa para toda alteração:

```text
mudança simples
→ execução direta + checks determinísticos

mudança intermediária
→ contrato + worker + checks + review direcionado

mudança crítica
→ planejamento profundo + isolamento + gates ampliados + QA real
```

Eficiência significa reduzir:

- contexto carregado;
- rounds de review;
- retries cegos;
- handoffs;
- reconstrução de informação;
- workers desnecessários;
- ferramentas sem ganho comprovado.

---

## 1.4 Experiência final do operador

O operador não deve administrar uma frota de agentes manualmente.

Ele deve conversar com um único ponto de contato:

```text
OPERADOR
    ↓
MNFS LEAD
```

O lead é responsável por traduzir a intenção do operador para o sistema e os resultados do sistema para o operador.

### O operador faz

- descreve objetivos;
- responde perguntas de produto;
- revisa o plano visualmente;
- aprova o contrato;
- decide trade-offs que alteram escopo, arquitetura, risco ou orçamento;
- autoriza ações irreversíveis;
- acompanha o status;
- aceita ou rejeita recomendações do lead.

### O operador não precisa fazer

- materializar isolated mutable workspaces manualmente;
- escolher qual worker recebe cada arquivo;
- enviar prompt individual para cada agente;
- interpretar logs brutos;
- acompanhar processos;
- lembrar comandos internos;
- decidir se um teste técnico é suficiente;
- copiar informações entre sessões;
- reconstruir o estado após um restart;
- avaliar sozinho se uma feature está realmente completa.

### Os workers não conversam diretamente com o operador

Workers reportam ao MNFS Lead por meio de:

- estado estruturado;
- artefatos;
- claims;
- findings;
- pedidos de decisão.

Isso evita que múltiplos agentes:

- façam perguntas duplicadas;
- apresentem versões conflitantes da realidade;
- pressionem por decisões locais;
- exponham detalhes técnicos desnecessários.

O padrão de um único liaison é uma das inspirações operacionais herdadas do FirstMate, enquanto o MNFS adiciona contratos, gates, evidência e QA como partes centrais do produto.

---

## 1.5 O MNFS como sistema code-first

O antigo `mnfs-harness` dependia fortemente de:

- documentos extensos;
- prompts;
- skills;
- hooks que interpretavam texto;
- convenções registradas em prosa;
- comportamento lembrado pela sessão.

Essa abordagem foi útil para descobrir o método, mas não é a arquitetura final.

No MNFS code-first, a regra é:

> **Tudo que pode ser decidido deterministicamente deve sair da prosa e entrar no código.**

### Pertence ao código

- persistência;
- IDs;
- hashes;
- FSMs;
- transições;
- leases;
- uniqueness;
- idempotência;
- retries permitidos;
- limites;
- resolução de paths;
- materialização e lifecycle de isolated mutable workspaces;
- dispatch;
- reconciliação;
- recovery;
- validação de schema;
- acceptance gates determinísticos;
- CLI;
- adapters;
- política de risco mensurável.

### Pertence a artefatos estruturados

- missão;
- milestones;
- features;
- critérios;
- contratos;
- decisões;
- riscos;
- write tracks;
- attempts;
- claims;
- receipts;
- findings;
- verdicts;
- evidência;
- closeout.

### Pertence a skills, templates e prosa

- instruções de raciocínio;
- entrevista de planejamento;
- rubricas de julgamento;
- orientação de investigação;
- briefing de função;
- explicações para o operador;
- padrões de escrita;
- exemplos;
- templates iniciais;
- perguntas que exigem decisão humana.

### Skills são portas de entrada, não o control plane

Uma skill pode orientar um Actor a:

```text
analisar objetivo
→ chamar comandos MNFS
→ produzir plano estruturado
→ abrir Lavish
→ interpretar feedback
```

Mas não deve poder:

- aprovar um plano diretamente;
- alterar SQLite;
- conceder um lease;
- marcar um claim como aceito;
- fechar uma feature;
- inventar uma transição;
- ignorar um gate.

---

## 1.6 O que o MNFS é

O MNFS é:

- uma Harness de desenvolvimento;
- um control plane para agentes de software;
- uma máquina de planejamento e execução;
- uma camada de contratos;
- um sistema de evidência;
- um sistema de recuperação;
- um coordenador de trabalho isolado;
- um gate de qualidade;
- uma interface entre operador e múltiplos agentes;
- uma base local que poderá evoluir para plataforma;
- um sistema de produção de software que torna o caminho correto mais fácil, verificável e repetível.

---

## 1.7 O que o MNFS não é

O MNFS não é:

- um modelo de linguagem;
- um substituto de um Agent Runtime;
- um fork completo do FirstMate;
- apenas uma coleção de prompts;
- apenas uma biblioteca de skills;
- um gerador automático de código;
- um IDE;
- um terminal multiplexer;
- um gerenciador de Git genérico;
- um framework universal de workflows;
- um swarm irrestrito de agentes;
- um sistema que maximiza o número de workers;
- uma plataforma cloud no primeiro momento.

FirstMate permanece uma referência operacional e uma fonte seletiva de padrões. Agent Runtime, workspace, Execution Environment e presentation realizations entram por fronteiras estreitas e são selecionadas por Evidence e Decision; Pi, Treehouse e Lavish permanecem incumbents/references onde já produziram Evidence. Nenhum adapter se torna autoridade do domínio.

---

## 1.8 Princípios constitucionais

<a id="pb-p1"></a>

### P1 — Controle determinístico, execução probabilística

LLMs raciocinam e produzem trabalho. O MNFS controla estado, contratos e avanço.

<a id="pb-p2"></a>

### P2 — Uma sessão é descartável

Nenhuma missão depende da continuidade de um transcript.

<a id="pb-p3"></a>

### P3 — Mensagem é notificação, não memória

Informação durável vive em SQLite ou em artefato content-addressed.

<a id="pb-p4"></a>

### P4 — CLAIM não é veredito

O implementador nunca é a autoridade final sobre o próprio trabalho.

<a id="pb-p5"></a>

### P5 — Evidência não escrita não aconteceu

Uma afirmação sem artefato ou verificação não pode fechar critério.

<a id="pb-p6"></a>

### P6 — Trabalho isolado precisa ser composto

Um isolated mutable workspace verde não prova que o sistema integrado está verde.

<a id="pb-p7"></a>

### P7 — Implementer e reviewer são papéis distintos quando o risco exige julgamento

Self-review não é suficiente como gate independente.

<a id="pb-p8"></a>

### P8 — QA deve observar o produto como usuário quando o critério é comportamental

Código, mocks e endpoints isolados não substituem a jornada real.

<a id="pb-p9"></a>

### P9 — Rigor proporcional ao risco

Mais agentes e mais gates somente quando aumentam a confiança necessária.

<a id="pb-p10"></a>

### P10 — Sem retry cego

Nova tentativa exige nova hipótese, nova evidência ou mudança de plano.

<a id="pb-p11"></a>

### P11 — YAGNI é vinculante

Nova abstração, adapter ou serviço precisa de uma necessidade presente e uma prova nomeada.

<a id="pb-p12"></a>

### P12 — Nenhuma ferramenta externa é autoridade de domínio

- Agent Runtime executa Actors;
- presentation adapters apresentam;
- workspace realizations materializam isolated mutable workspaces;
- Git guarda código e result identity;
- SQLite guarda estado operacional;
- MNFS decide o estado da missão.

<a id="pb-p13"></a>

### P13 — O caminho correto deve ser o caminho mais fácil

Boas práticas recorrentes devem ser transformadas em Golden Paths, templates, comandos, checks e feedback acionável. O MNFS não depende de o worker lembrar uma convenção quando ela pode ser fornecida ou verificada mecanicamente.

<a id="pb-p14"></a>

### P14 — Authority e isolation são complementares

Permissão em prompt, worktree ou container não constitui uma boundary de segurança completa. Ações são governadas por Authority e Effect Policy, enquanto filesystem, network, credentials e processos são limitados por enforcement técnico proporcional ao risco.

<a id="pb-p15"></a>

### P15 — Medição existe para informar decisões

O MNFS não coleta métricas para fabricar atividade, ranquear agentes ou produzir um score universal de produtividade. Cada sinal precisa declarar qual decisão informa, sua cobertura, limitações e condição de ação.

<a id="pb-p16"></a>

### P16 — Provar antes de generalizar

O MNFS evolui por walking skeletons e vertical slices. Cada nova abstração, adapter, Golden Path ou plataforma precisa nascer de um Product Milestone com consumidor, Golden Proof, Entry Gate e Removal Conditions.

<a id="pb-p17"></a>

### P17 — Um conceito possui uma fonte canônica

Documentos podem explicar, resumir e aplicar um conceito, mas somente uma fonte o governa. Conversas, issues, tracking, research e projections não podem redefinir silenciosamente decisões, contratos ou state.

---

## 1.9 Definição de sucesso do produto

O MNFS estará cumprindo sua visão quando o operador puder fornecer um objetivo relevante e o sistema conseguir:

1. produzir um plano completo e revisável;
2. registrar um contrato aprovado;
3. decompor o trabalho sem colisões evitáveis;
4. iniciar executores isolados;
5. acompanhar o estado sem ler transcripts;
6. sobreviver a restarts;
7. impedir falso progresso;
8. detectar trabalho incompleto;
9. corrigir sem loops cegos;
10. integrar as partes;
11. validar o comportamento real;
12. entregar evidência compreensível;
13. encerrar a missão com rastreabilidade;
14. realizar tudo isso com menos intervenção e desperdício do que uma sessão de coding agent sem Harness.

O sucesso não será medido pela quantidade de agentes, ferramentas, documentos ou estados.

Será medido por:

- qualidade do software aceito;
- redução de regressões;
- redução de false completion;
- continuidade;
- clareza de decisões;
- eficiência de tokens e tempo;
- menor intervenção operacional;
- capacidade de reproduzir por que algo foi aceito.

---

## 1.10 Visão de evolução

### Hoje — local-first

```text
Windows
→ navegador e apresentação

WSL2
→ MNFS, Git, SQLite, Agent Runtime selecionado, isolated mutable workspaces e testes
```

### Próxima evolução

```text
MNFS Lead
→ bounded Actors through the selected Agent Runtime
→ isolated mutable workspaces + governed Execution Environments
→ integração
→ gates
→ QA
```

### Futuro

```text
MNFS Web / Cloud
        ↓
control plane remoto
        ↓
selected Agent Runtime boundary / open protocol or concrete adapter
        ↓
workers em ambientes isolados
```

O core de domínio não deve ser reescrito para essa evolução.

A persistência, o transporte e o executor poderão mudar por adapter, enquanto permanecem estáveis:

- contratos;
- entidades;
- transições;
- políticas;
- evidências;
- gates;
- experiência do operador.

---

---

## ARR-RECONCILIATION-2026-08-07 — Current domain semantics

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

**Runtime Session is observational**. Role, ActorRun, Attempt, Authority, Claim, Evidence and Verdict remain MNFS domain truth; losing or replacing a runtime Session cannot lose or redefine them.

A WriteTrack semantically owns an isolated mutable workspace, not an inherent Git worktree. Its physical realization may be a worktree, COW state, private rootfs/disk or another selected substrate. Accepted result identity remains provider-neutral Git base/result identity.

Child criteria and bounded work declare upward `CONTRIBUTES_TO` lineage to parent outcomes. Execution Environment identity/bindings describe independent properties and selected concrete realization; this reconciliation does not create speculative generic provider entities.

---

# 2. Modelo de Domínio Canônico

## 2.1 Propósito

O modelo de domínio define as entidades, relações, identidades, estados e autoridades que formam o MNFS.

Ele existe para garantir que:

- planejamento e execução usem o mesmo vocabulário;
- agentes diferentes não atribuam significados diferentes aos mesmos termos;
- cada estado tenha uma autoridade clara;
- nenhuma ferramenta externa se torne acidentalmente fonte de verdade;
- milestones futuros ampliem o produto sem reescrever conceitos anteriores;
- o sistema consiga ser recuperado sem depender da memória de uma sessão;
- uma declaração de conclusão não seja confundida com aceitação;
- paralelismo, correção, integração e QA permaneçam rastreáveis.

Este modelo representa o **produto-alvo**, não uma afirmação de que todas as entidades já estão implementadas.

---

## 2.2 Princípios de modelagem

### 2.2.1 Identidade não é estado

Toda entidade persistente possui uma identidade estável.

Mudanças de sessão, processo, modelo, worktree, retry, branch ou terminal não alteram automaticamente a identidade da missão, milestone, feature ou write track.

### 2.2.2 Estado operacional não deve ser inferido

O MNFS não deriva estado autoritativo de terminal, transcript, ausência de atividade, exit code isolado ou narrativa.

### 2.2.3 Pais agregam; filhos provam

Mission, Milestone e Feature são aceitos somente quando seus próprios critérios e as provas requeridas nos níveis filhos e de composição foram satisfeitos.

### 2.2.4 Uma entidade deve representar uma responsabilidade

Não usar um único objeto genérico chamado `Task` para representar todos os conceitos.

### 2.2.5 Eventos registram fatos; não substituem o estado atual

MNFS mantém estado atual em tabelas e eventos append-only para auditoria.

---

## 2.3 Visão geral das entidades

```text
Repository
│
├── Engineering System
│   ├── Engineering Standards
│   ├── Golden Paths
│   ├── Policy Rules
│   ├── Fitness Functions
│   ├── Safety Nets
│   ├── Waivers
│   └── Quality Posture
│
├── Repository Profile
│
├── Mission
│   │
│   ├── Plan Revisions
│   ├── Decisions
│   ├── Acceptance Criteria
│   ├── Milestones
│   │   │
│   │   ├── Acceptance Criteria
│   │   └── Features
│   │       │
│   │       ├── Acceptance Criteria
│   │       ├── Write Tracks
│   │       │   ├── Lease
│   │       │   ├── Execution Environment
│   │       │   ├── Environment Lease
│   │       │   ├── Credential Grants
│   │       │   ├── Effect Requests / Receipts
│   │       │   ├── Attempts
│   │       │   │   └── Worker Runs
│   │       │   ├── Claims
│   │       │   ├── Corrections
│   │       │   └── Security Violations
│   │       ├── Findings
│   │       └── Verdicts
│   ├── Integration Runs
│   ├── QA Journeys
│   ├── Evidence Bundles
│   ├── Evaluation Results
│   ├── Experiment Runs
│   ├── Calibration Decisions
│   └── Attention Items
└── Defect Classes / Learnings
```

---

## 2.4 Repository

Repository representa um repositório de produto controlado pelo MNFS.

Possui identidade estável em `.mnfs/repo.json`. Git é autoridade sobre código e commits; SQLite é autoridade sobre estado operacional.

---

## 2.5 Repository Profile

Repository Profile contém os bindings específicos do repositório necessários para executar o método MNFS:

- build;
- testes;
- lint;
- bootstrap;
- composition roots;
- integrações;
- regras locais;
- ambientes;
- jornadas.

Estados de conhecimento:

```text
RATIFIED
ASSUMED
OPEN
DEPRECATED
```

Uma lane não pode depender silenciosamente de uma seção `OPEN`.

### 2.5.1 Engineering Standard

Regra normativa sobre como software deve ser projetado, implementado, verificado ou operado.

Exemplos:

- dependências permitidas entre camadas;
- contratos de API;
- regras de migration;
- boundary validation;
- observabilidade obrigatória;
- métodos mínimos de prova.

### 2.5.2 Golden Path

Caminho preferencial e executável para uma classe recorrente de mudança.

Um Golden Path pode fornecer:

- perguntas de planejamento;
- templates;
- scaffolding;
- sequência de passos;
- critérios;
- checks;
- exemplos;
- rollback ou recovery.

### 2.5.3 Policy Rule e Fitness Function

Policy Rule é a representação executável de uma regra.

Fitness Function é o check contínuo que mede ou bloqueia desvio arquitetural, de contrato ou de qualidade.

### 2.5.4 Waiver

Exceção explícita, limitada e auditável a uma regra.

Possui:

- regra afetada;
- escopo;
- justificativa;
- autoridade;
- controles compensatórios;
- expiração ou condição de remoção.

### 2.5.5 Quality Posture

Visão baseada em evidência sobre quais capacidades do repositório estão:

```text
VERIFIED
PARTIAL
MISSING
NOT_APPLICABLE
UNKNOWN
```

Não é uma nota estética. É um mapa de cobertura e dívida do sistema de engenharia.

---

## 2.6 Mission

Mission é a unidade principal de intenção e resultado do MNFS.

Identidade:

```text
MIS-001
MIS-002
```

Uma Mission contém:

- objetivo;
- critérios de aceitação obrigatórios;
- escopo;
- assumptions;
- riscos;
- milestones;
- decisões;
- contrato aprovado;
- evidência final;
- closeout.

Dimensões de estado:

```text
lifecycle = OPEN | CLOSED | CANCELLED
phase = INTAKE | PLANNING | APPROVED | EXECUTING | VERIFYING | CLOSING
attention = NORMAL | BLOCKED | NEEDS_OPERATOR | DEGRADED
```

Toda Mission deve possuir critérios de aceitação próprios antes da aprovação do contrato. Esses critérios provam o resultado global da missão e não podem ser substituídos apenas pela soma dos critérios das milestones.

---

## 2.7 Mission Plan Revision

Mission Plan Revision é uma proposta estruturada e imutável de contrato.

Estados:

```text
DRAFT
SUPERSEDED
APPROVED
```

Revisões são append-only, content-addressed e aprovadas por hash exato.

---

## 2.8 Approved Mission Contract

Approved Mission Contract é a revisão oficialmente aprovada para execução.

Materialização:

```text
.mnfs/missions/<mission-id>/plan.json
```

Workers, dispatches, claims e gates são vinculados ao hash desse contrato.

---

## 2.9 Milestone

Milestone é um checkpoint de capacidade dentro de uma Mission.

Identidade plenamente qualificada:

```text
MIS-002/M01
MIS-002/M02
```

O ID `M01` é local à Mission.

Uma Milestone contém obrigatoriamente:

- outcome;
- dependências;
- features;
- critérios de aceitação próprios;
- requisitos de integração;
- QA exigido;
- evidência de fechamento.

Os critérios da Milestone provam a capacidade composta entregue naquele nível. Eles não podem ser substituídos pela simples soma dos critérios das Features.

---

## 2.10 Feature

Feature é a menor unidade planejada de comportamento com outcome e critérios de aceitação próprios.

### Identidade

Feature pertence obrigatoriamente a uma Milestone.

A identidade plenamente qualificada é:

```text
MIS-002/M01/F01
MIS-002/M01/F02
MIS-002/M02/F01
```

O identificador local `F01` precisa ser único apenas dentro da Milestone proprietária.

Duas Milestones diferentes podem conter uma Feature local `F01` sem colisão:

```text
MIS-002/M01/F01
MIS-002/M02/F01
```

Toda referência persistida, mensagem, claim, finding, receipt ou verdict deve usar a identidade plenamente qualificada, ou carregar separadamente:

```text
mission_id
milestone_id
feature_id
```

Nunca usar apenas `F01` fora do contexto inequívoco da Milestone.

### Dependências

Dependências dentro da mesma Milestone podem usar o identificador local quando o schema e o contexto forem inequívocos.

Dependências entre Milestones devem usar a identidade plenamente qualificada:

```text
MIS-002/M02/F01 depends on MIS-002/M01/F02
```

### Conteúdo obrigatório

- título;
- outcome;
- critérios de aceitação;
- dependências;
- invariantes;
- negativos;
- contratos referenciados;
- ownership;
- write-set esperado;
- verification map;
- riscos específicos.

### Relação com Write Track

Uma Feature não é automaticamente um Write Track:

```text
1 Feature → 1 Write Track
1 Feature → N Write Tracks
N Features → 1 Write Track
```

---

## 2.11 Acceptance Criterion

Acceptance Criterion é uma afirmação verificável obrigatória para aceitar uma entidade.

### Existência obrigatória

Acceptance Criteria **devem existir em todos os três níveis**:

- Mission;
- Milestone;
- Feature.

Não existe Mission, Milestone ou Feature executável sem ao menos um critério de aceitação válido.

Antes de aprovação ou dispatch, o MNFS deve rejeitar:

- Mission sem critérios;
- Milestone sem critérios;
- Feature sem critérios;
- critério vazio;
- critério sem método de prova;
- critério puramente narrativo ou não observável.

### Identidade hierárquica

Exemplos:

```text
MIS-002/AC-01
MIS-002/M01/AC-01
MIS-002/M01/F01/AC-01
```

O ID local do critério é único dentro da entidade proprietária.

### Responsabilidade por nível

#### Critério de Mission

Prova que o objetivo global foi alcançado.

Exemplo:

```text
MIS-002/AC-01
Um novo processo lead recupera integralmente a missão e seu estado operacional.
```

#### Critério de Milestone

Prova que o conjunto de Features compõe uma capacidade coerente.

Exemplo:

```text
MIS-002/M01/AC-01
Lease e Claim persistem e permanecem consistentes após reinício.
```

#### Critério de Feature

Prova o comportamento delimitado da Feature.

Exemplo:

```text
MIS-002/M01/F01/AC-01
Uma segunda concessão de lease para a mesma write track falha com erro tipado.
```

### Critérios de níveis diferentes não são redundantes

Critérios de Feature provam unidades locais.

Critérios de Milestone provam composição, integração e outcome intermediário.

Critérios de Mission provam o resultado global e a experiência final.

Pais não são automaticamente aceitos apenas porque todos os filhos passaram.

### Tipos conceituais

```text
STATIC
EXECUTABLE
LIVE
JUDGMENT
```

Todo critério deve declarar ou permitir resolver:

- tipo;
- método de prova;
- ambiente;
- autoridade;
- deciding ou advisory;
- evidência esperada.

### Invariantes

- toda Mission possui critérios;
- toda Milestone possui critérios;
- toda Feature possui critérios;
- nenhum trabalho é despachado sem critérios;
- todo critério possui método de prova;
- critério não pode ser encerrado por narrativa;
- critérios live não viram mocks silenciosamente;
- critérios judgment exigem autoridade apropriada;
- critérios de pai e filho são avaliados separadamente.

---

## 2.12 Write Track

Write Track é a unidade independente de mutação concorrente e integração.

Identidade:

```text
WT-001
```

Está vinculada a uma ou mais Features plenamente qualificadas.

Lifecycle conceitual:

```text
PLANNED
ALLOCATED
ACTIVE
CLAIMED
NEEDS_CORRECTION
ACCEPTED
INTEGRATED
ABANDONED
RELEASED
```

Trust:

```text
VALID
STALE_BASE
OUT_OF_SCOPE
CONTAMINATED
DIVERGED
UNKNOWN
```

Novo Attempt não implica novo isolated mutable workspace.

---

## 2.13 Lease

Lease é autorização temporária e exclusiva para uso de um workspace físico.

Lifecycle:

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

A workspace realization selecionada administra o lifecycle físico; MNFS administra a semântica e a autoridade do binding.

### 2.13.1 Execution Environment

Execution Environment é o runtime no qual tools, código e serviços de um Actor executam.

Pode ser:

```text
HOST_INSPECTION
LOCAL_SANDBOX
DEV_CONTAINER
REMOTE_CONTAINER
REMOTE_VM
MICROVM
```

A Environment possui identity, policy hash, resource limits, network policy e adapter.

### 2.13.2 Environment Lease

Environment Lease autoriza temporariamente uma Write Track ou Actor a usar uma Execution Environment Instance.

É diferente do workspace binding/lease concreto. O Treehouse Lease provado em M01 é uma realização histórica, não a semântica universal:

```text
Workspace Binding / Lease
→ isolated mutable workspace concreto

Environment Lease
→ runtime e recursos de execução
```

### 2.13.3 Credential Grant

Credential Grant disponibiliza uma identidade limitada a um Actor, target, action scope e período.

SQLite guarda metadata e reference, nunca o secret em plaintext.

### 2.13.4 Effect Request e Effect Receipt

Effect Request governa uma mutation externa antes de executá-la.

Effect Receipt registra o resultado observado e permite Reconcile.

### 2.13.5 Security Violation

Security Violation registra uma tentativa bloqueada ou desvio de policy.

Ela não presume malícia e pode revelar policy incompleta, dependency behavior ou prompt injection.

---

## 2.14 Attempt

Attempt é uma tentativa lógica de produzir ou corrigir o resultado de uma Write Track.

Identidade:

```text
WT-001/A01
WT-001/A02
```

Attempts podem reutilizar a mesma Runtime Session e o mesmo isolated mutable workspace quando contrato, write-set e trust permanecem válidos.

---

## 2.15 Worker Run

Worker Run representa uma execução concreta de um Agent Runtime para um ActorRun/Attempt.

Lifecycle:

```text
STARTING
RUNNING
IDLE
EXITED
LOST
CANCELLED
```

Exit code ou fim do processo não significa aceitação.

---

## 2.16 Claim

Claim é a declaração estruturada de que um worker acredita ter produzido um resultado verificável.

Lifecycle:

```text
OPEN
COMPLETED_BY_WORKER
UNDER_VERIFICATION
ACCEPTED
REJECTED
SUPERSEDED
ABANDONED
```

Claim referencia obrigatoriamente:

- Mission;
- Milestone;
- Feature plenamente qualificada;
- contract hash;
- Write Track;
- Attempt;
- lease;
- base SHA;
- result tree/commit;
- critérios reivindicados;
- evidências.

---

## 2.17 Receipt

Receipt é um registro imutável de verificação executada por autoridade controlada pelo MNFS.

É ligado ao critério, Claim, tree hash, ambiente e comando executado.

M2 implementa apenas um Minimal Deterministic Receipt delimitado para o Golden Proof fixo: uma execução fria, runner-owned e vinculada ao contrato e result tree. Runners generalizados, Integration Receipts, QA adaptativa e Evidence Bundles permanecem capabilities de M5 e milestones posteriores.

---

## 2.18 Verdict

Verdict é a decisão registrada por autoridade habilitada após considerar Claims, Receipts, Findings e políticas.

Resultados:

```text
ACCEPT
REJECT
BLOCK
ERROR
```

---

## 2.19 Finding

Finding é um problema, risco ou questão identificado durante verificação, review, integração ou QA.

Severidades:

```text
BLOCKING
IMPORTANT
SUGGESTION
NIT
QUESTION
```

Finding bloqueante precisa de evidência verificável.

---

## 2.20 Decision

Decision registra uma escolha necessária para que a Mission prossiga.

Mudança de escopo, contrato, arquitetura, orçamento, risco aceito ou operação irreversível exige decisão do operador.

---

## 2.21 Correction

Correction é trabalho delimitado destinado a resolver Findings sem reabrir desnecessariamente toda a Feature.

Por padrão reutiliza Write Track e isolated mutable workspace quando a trust boundary continua válida.

---

## 2.22 Integration Run

Integration Run representa a composição controlada de Write Tracks aceitas.

Ocorre em workspace limpo e prova que partes isoladamente verdes formam um sistema verde.

---

## 2.23 QA Journey

QA Journey é validação comportamental pela perspectiva do usuário ou consumidor.

É vinculada ao SHA integrado e não pode ser substituída por mocks quando o critério é real ou user-facing.

---

## 2.24 Evidence Item

Evidence Item é unidade imutável de prova ligada a critério, target e SHA.

---

## 2.25 Evidence Bundle

Evidence Bundle consolida provas necessárias para justificar aceite ou fechamento.

---

## 2.26 Defect Class

Defect Class representa padrão recorrente de falha que merece prevenção reutilizável.

---

## 2.27 Event

Event é fato imutável registrado sobre ação ou transição significativa.

Estado atual permanece em tabelas; eventos preservam auditoria.

---

## 2.27.1 Evaluation Result

Evaluation Result registra um julgamento de qualidade sobre um Trace, Span, Worker Run, Claim, Mission ou Experiment Run.

Pode ser produzido por:

- código determinístico;
- humano;
- LLM Judge;
- user feedback.

Não é Domain Verdict por si só.

## 2.27.2 Evaluation Dataset

Evaluation Dataset contém cenários versionados usados em experiments e regressions.

Golden Missions são o dataset canônico do MNFS.

## 2.27.3 Experiment Run

Experiment Run executa uma policy, model, prompt, Golden Path ou configuração candidata contra um dataset fixo e registra quality, cost, latency, failures e coverage.

## 2.27.4 Calibration Decision

Calibration Decision autoriza, rejeita ou reverte uma mudança em model routing, Context, memory, gates, Golden Paths, timeouts, parallelism ou Environment.

## 2.27.5 Attention Item

Attention Item é uma projeção acionável para Operator ou Lead.

Tipos incluem:

```text
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

Attention não é lifecycle.

## 2.27.6 Product Roadmap Milestone

Product Roadmap Milestone entrega uma capability reutilizável do MNFS e possui Entry Gate, Golden Proof, Exit Criteria e Non-goals.

Não deve ser confundido com um Milestone interno de Mission.

## 2.27.7 Architecture Spike

Architecture Spike é uma investigação delimitada para resolver incerteza material antes de um Product Milestone.

Produz Evidence e Decision.

Não é delivery.

## 2.28 Actors e papéis

- Operator;
- MNFS Lead;
- Planner;
- Investigator;
- Writer Worker;
- Reviewer;
- Verification Runner;
- QA Actor;
- Integrator.

Papéis não são acoplados a providers específicos.

---

## 2.29 Autoridades por entidade

| Entidade | Pode propor | Pode persistir | Pode aceitar/encerrar |
|---|---|---|---|
| Mission | Operator/Lead | MNFS | Operator/MNFS closeout |
| Plan Revision | Planner/Lead Actor | MNFS | — |
| Approved Contract | Operator requests | MNFS | Operator-authorized gate |
| Milestone | Planner | MNFS | MNFS gate |
| Feature | Planner | MNFS | MNFS gate |
| Write Track | Lead/orchestrator | MNFS | MNFS/integrator |
| Workspace/Environment binding or lease | Lead requests | MNFS + selected realization adapter | MNFS |
| Attempt | Lead/policy | MNFS | MNFS |
| Worker Run | Agent Runtime adapter | MNFS observes | MNFS records exit/cancel |
| Claim | Worker | MNFS validates/persists | MNFS gate |
| Receipt | Runner | MNFS | — |
| Verdict | Gate authority | MNFS | Authority defined by risk |
| Finding | Reviewer/QA/runner | MNFS | Reviewer/gate/hub policy |
| Decision | Lead/Operator | MNFS | Required authority |
| Integration Run | Integrator | MNFS | Integration gate |
| QA Journey | QA policy | MNFS | QA gate |
| Evidence Bundle | MNFS | MNFS/Git | Closing authority |

---

## 2.30 Estado autoritativo e armazenamento

### Git

Código, commits, branches, contratos aprovados, evidência aceita, ADRs e documentação.

### SQLite

Estado operacional atual, missões, revisões, leases, tracks, attempts, runs, claims, findings, decisões e eventos.

### Runtime artifacts

Logs, prompts, HTML, screenshots, traces e outputs temporários.

### Agent Runtime

Contexto e execução probabilística, nunca domínio autoritativo. Runtime Session state é observacional.

### Mutable Workspace realization

Estado físico do isolated mutable workspace e seus bindings. Treehouse/worktree é uma realização histórica/incumbent já provada em M01, não o owner semântico universal.

### Lavish

Feedback visual temporário.

### Herdr

Apresentação operacional de terminais.

---

## 2.31 Regras de agregação

Mission, Milestone e Feature agregam filhos, mas possuem critérios próprios obrigatórios.

Nenhum pai é aceito apenas pela soma automática dos filhos.

Status deve apresentar:

- lifecycle;
- phase;
- attention;
- contagens;
- blocker;
- next action.

---

## 2.32 Status de implementação do modelo

| Entidade | Milestone de implementação |
|---|---|
| Repository Identity | M0 — implementado |
| Mission | M0 — implementado parcialmente |
| Event | M0 — implementado parcialmente |
| Plan Revision | M1 — implementado |
| Approved Mission Contract | M1 — implementado |
| Mission/Milestone/Feature Criteria | M1 — conteúdo inicial; enforcement será ampliado |
| Repository Profile | futuro |
| Milestone runtime | futuro |
| Feature runtime | futuro |
| Write Track | M2 |
| Lease | M2 |
| Attempt | M2 |
| Worker Run | M2 |
| Claim | M2 |
| Recovery View | M2 |
| Finding | M3 |
| Correction | M3 |
| Reviewer Verdict | M3 |
| Integration Run | M4 |
| Receipt | M2 — bounded Minimal Deterministic Receipt; M5+ — generalized Receipt/Evidence capability |
| QA Journey | M5 |
| Evidence Bundle | M5/M6 |
| Defect Class | M5/M6 |

---

## 2.33 Exemplo hierárquico completo

```text
MIS-020
├── AC-01
├── M01
│   ├── AC-01
│   ├── F01
│   │   ├── AC-01
│   │   └── WT-001
│   └── F02
│       ├── AC-01
│       └── WT-002
└── M02
    ├── AC-01
    └── F01
        ├── AC-01
        └── WT-003
```

Identidades:

```text
MIS-020
MIS-020/M01
MIS-020/M01/F01
MIS-020/M01/F01/AC-01
MIS-020/M02/F01
MIS-020/M02/F01/AC-01
```

---

## 2.34 Anti-modelos proibidos

- Feature identificada somente como `F01` fora do contexto da Milestone;
- Feature tratada como filha direta da Mission;
- Acceptance Criteria opcionais em Mission, Milestone ou Feature;
- `Task` universal;
- sessão como identidade do trabalho;
- exit code como conclusão;
- novo physical workspace para todo retry sem necessidade de isolamento adicional;
- Claim como aceite;
- teste isolado como fechamento de Feature;
- Milestone marcada manualmente como concluída;
- transcript como memória;
- ferramenta externa como autoridade de domínio.

---

# Decisões resumidas

> **Features pertencem obrigatoriamente a Milestones. Sua identidade canônica é hierárquica: `Mission/Milestone/Feature`, por exemplo `MIS-002/M01/F01`.**

> **Acceptance Criteria são obrigatórios em Mission, Milestone e Feature. Cada nível prova seu próprio outcome; critérios de filhos não substituem os critérios de composição e resultado dos pais.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current planning and execution lifecycle

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

The current lifecycle is validation-first:

```text
Operator Intent
→ Investigation / Localization
→ Validation Baseline
→ adversarial correctness review
→ Milestone / Feature decomposition + CONTRIBUTES_TO coverage
→ Execution Design & Readiness
→ Fresh bounded Actor work
→ Claim
→ deterministic Receipts
→ independent Review / Validation
→ Finding routing
→ composition validation
→ Mission outcome validation
→ Closeout / Learning
```

Correctness and approved realization are frozen for bounded execution; tactical Actor planning may adapt to observations inside those bounds. Findings route to Correction/new Attempt, a new bounded Feature when scope already permits it, or Decision/Replan when correctness, architecture, security or outcome is wrong.

---

# 3. Lifecycle e Fluxos Ponta a Ponta

## 3.1 Propósito

Esta seção define como uma intenção atravessa o MNFS desde a primeira mensagem do operador até o encerramento comprovado de uma Mission.

O lifecycle existe para garantir que:

- nenhum trabalho comece sem outcome e critérios de aceitação;
- planejamento e execução permaneçam vinculados ao mesmo contrato;
- workers recebam contexto suficiente, mas não carreguem toda a missão;
- estado operacional sobreviva à perda de sessões e processos;
- Claims sejam verificados antes de qualquer aceite;
- Features isoladas sejam compostas antes do fechamento de Milestones;
- Milestones possuam critérios próprios de composição;
- a Mission possua critérios globais próprios;
- correções resolvam findings sem gerar loops de patch;
- decisões humanas ocorram somente nos pontos em que a autoridade do operador é necessária;
- o sistema mantenha uma trilha compreensível de por que cada avanço foi permitido.

Este é o lifecycle do produto-alvo. M0 implementou identidade, persistência básica e recovery de Mission. M1 implementou planejamento estruturado, revisão visual, revisões content-addressed e aprovação por hash. M2 e milestones posteriores implementarão progressivamente execução, gates, integração, QA e delivery.

---

## 3.2 Regra fundamental: toda execução possui contrato hierárquico

O MNFS nunca executa trabalho sem a hierarquia mínima:

```text
Mission
└── Milestone
    └── Feature
        └── Acceptance Criteria
```

Mesmo uma alteração pequena precisa de:

- outcome;
- escopo;
- critério de aceitação;
- método de prova.

A diferença entre uma alteração pequena e uma Mission complexa não é a existência de contrato. É a profundidade e a cerimônia do contrato.

### Lane mínima

Para uma alteração trivial e de baixo risco, o MNFS pode gerar automaticamente:

```text
MIS-003
└── M01
    └── F01
        └── AC-01
```

O operador não precisa passar por uma revisão visual extensa quando a política permitir uma lane mínima.

Ainda assim:

- a identidade existe;
- os critérios existem;
- o resultado é verificável;
- o Claim não é aceito por autodeclaração;
- o estado continua recuperável.

### Lane de Mission

Para mudanças relevantes, transversais ou arriscadas:

- planning completo;
- milestones;
- múltiplas Features;
- DAG;
- ownership;
- riscos;
- questões;
- revisão visual;
- aprovação por hash;
- gates proporcionais ao risco.

A lane barata reduz cerimônia, não reduz integridade.

---

## 3.3 Visão geral do lifecycle

```text
OBJETIVO DO OPERADOR
        ↓
INTAKE E CLASSIFICAÇÃO
        ↓
INVESTIGAÇÃO, QUANDO NECESSÁRIA
        ↓
PLANEJAMENTO E DECOMPOSIÇÃO
        ↓
REVISÃO VISUAL NO LAVISH
        ↓
APROVAÇÃO DO CONTRATO POR HASH
        ↓
PREPARAÇÃO DA EXECUÇÃO
        ↓
WRITE TRACKS + WORKSPACE / ENVIRONMENT BINDINGS
        ↓
DISPATCH DE BOUNDED ACTORS
        ↓
EXECUÇÃO ISOLADA
        ↓
CLAIM
        ↓
VERIFICAÇÃO E RECEIPTS
        ↓
REVIEW, CONFORME RISCO
        ↓
CORREÇÃO, QUANDO NECESSÁRIA
        ↓
ACEITE DA WRITE TRACK
        ↓
INTEGRATION RUN
        ↓
CRITÉRIOS DE MILESTONE
        ↓
QA JOURNEYS
        ↓
FECHAMENTO DA MILESTONE
        ↓
CRITÉRIOS GLOBAIS DA MISSION
        ↓
DELIVERY E CLOSEOUT
```

Fluxos laterais existem para:

```text
DECISION
BLOCKED
RECOVERY
REPLAN
CANCEL
ABANDON
DIVERGENCE
```

Esses fluxos não podem ser tratados como exceções improvisadas. Eles fazem parte do produto.

---

## 3.4 Fases canônicas

| Fase | Autoridade principal | Entrada | Saída | Gate de avanço |
|---|---|---|---|---|
| Intake | MNFS Lead + operador | objetivo | Mission inicial | objetivo e autoridade compreendidos |
| Investigação | Investigator | perguntas factuais | evidência e opções | facts suficientes ou decisão de continuar com assumption |
| Planejamento | Planner + MNFS | objetivo e evidência | Plan Revision | schema, DAG e critérios válidos |
| Revisão visual | operador + Lavish | Plan Revision | feedback ou aprovação solicitada | operador aprovou hash corrente |
| Aprovação | MNFS | hash aprovado | Approved Mission Contract | sem questões bloqueantes |
| Preparação | MNFS Lead | contrato aprovado | tracks, packs e políticas | execução satisfatível |
| Alocação | MNFS + selected workspace/environment realization | Write Track | bindings/leases válidos | workspace, environment e base válidos |
| Dispatch | MNFS + Agent Runtime adapter | Actor Pack + current bindings | Worker Run | boot confirmado |
| Execução | Writer Worker | pack | mudança + Claim | Claim completo e válido |
| Verificação | MNFS runners | Claim | Receipts | critérios determinísticos decididos |
| Review | Reviewer | diff, contrato e receipts | Findings + Verdict | findings decisivos resolvidos |
| Correção | Writer Worker | findings | novo Claim | delta verificado |
| Integração | Integrator | tracks aceitas | Integration Run | composição verde |
| QA | QA Actor | SHA integrado | QA Journey | critérios live decididos |
| Fechamento de Feature | MNFS gate | evidence bundle | Feature accepted | todos os critérios da Feature aceitos |
| Fechamento de Milestone | MNFS gate | Features + integração + QA | Milestone closed | critérios próprios da Milestone aceitos |
| Fechamento de Mission | operador/MNFS | milestones + critérios globais | closeout | critérios próprios da Mission aceitos |

---

# 3.5 Fluxo A — Intake e classificação

## 3.5.1 Objetivo

Transformar a mensagem inicial do operador em uma Mission compreensível, sem iniciar implementação prematuramente.

## 3.5.2 Entrada

- pedido em linguagem natural;
- referências fornecidas;
- repositório atual;
- contexto conhecido;
- restrições explícitas;
- urgência;
- efeito esperado.

## 3.5.3 Responsabilidades do MNFS Lead

O Lead precisa determinar:

- qual problema está sendo resolvido;
- qual resultado o operador espera observar;
- qual repositório ou produto é afetado;
- se o pedido é mudança, investigação, correção ou decisão;
- quais fatos estão faltando;
- quem possui autoridade sobre esses fatos;
- qual profundidade de planejamento é proporcional ao risco.

## 3.5.4 Saída

Uma Mission em fase `INTAKE`, contendo no mínimo:

```text
mission_id
goal
operator
repository_id
initial_scope
known_constraints
open_questions
provisional_risk
```

Além de um evento:

```text
MISSION_OPENED
```

## 3.5.5 Critérios obrigatórios antes de sair do Intake

A Mission precisa possuir uma primeira versão de critérios de aceitação globais.

Eles podem ser refinados durante planejamento, mas não podem estar ausentes.

O Lead deve conseguir responder:

> Como o operador saberá que o objetivo global foi alcançado?

## 3.5.6 Classificação de lane

A política escolhe entre:

### Minimal Lane

Adequada quando:

- mudança pequena;
- risco baixo;
- impacto localizado;
- ausência de contrato público;
- ausência de efeitos irreversíveis;
- prova determinística simples;
- nenhuma ambiguidade de produto.

### Mission Lane

Obrigatória quando:

- múltiplas superfícies;
- mudança arquitetural;
- contrato público;
- banco ou migration;
- auth ou autorização;
- integração externa;
- comportamento user-facing relevante;
- paralelismo;
- risco de perda;
- escopo ainda ambíguo.

### Unknown

Se a política não consegue classificar com segurança:

```text
UNKNOWN
→ não significa low risk
```

O Lead pode:

- pedir esclarecimento;
- realizar investigação;
- classificar conservadoramente;
- registrar assumption explícita.

## 3.5.7 Proibições

Durante Intake:

- nenhum worker escritor;
- nenhum isolated mutable workspace de implementação;
- nenhuma mudança de código;
- nenhuma approval implícita;
- nenhuma questão de produto resolvida silenciosamente pelo modelo.

---

# 3.6 Fluxo B — Investigação e descoberta

## 3.6.1 Quando usar

Investigation Track é usada quando o planejamento depende de fatos ainda não confirmados.

Exemplos:

- localizar composition roots;
- confirmar API disponível;
- verificar comportamento de uma ferramenta;
- mapear módulos e dependências;
- reproduzir defeito;
- entender um fluxo existente;
- comparar opções;
- medir custo ou performance;
- descobrir o contrato real de uma integração.

## 3.6.2 Actor

```text
Investigator
```

Pode ser:

- Agent Runtime em modo read-only, quando necessário;
- processo especializado;
- ferramenta determinística;
- pesquisa externa;
- combinação dos anteriores.

## 3.6.3 Saída

Investigation Report estruturado:

```text
question
scope
sources
observations
verified_facts
unknowns
contradictions
options
recommendation
evidence_refs
```

## 3.6.4 Regras

- Investigator não implementa por padrão.
- Investigator não altera contrato.
- Facts e inferences precisam ser distinguidos.
- Unknown permanece unknown.
- Resultado relevante vira referência de planejamento.
- Descoberta que altera escopo exige Decision.
- Pesquisa sem impacto em decisão não deve continuar indefinidamente.

## 3.6.5 Gate de saída

Investigation termina quando:

- a pergunta foi respondida com evidência;
- uma impossibilidade foi demonstrada;
- as opções estão claras para decisão;
- o operador aceita uma assumption;
- o custo de continuar é maior que o risco restante.

---

# 3.7 Fluxo C — Planejamento e decomposição

## 3.7.1 Objetivo

Transformar a intenção em um contrato executável e verificável.

## 3.7.2 Planejamento é produção de estrutura

O Planner Actor pode raciocinar e propor conteúdo.

MNFS controla:

- schema;
- IDs;
- dependências;
- critérios obrigatórios;
- ciclos;
- hashes;
- revisões;
- approval.

## 3.7.3 Estrutura obrigatória

```text
Mission
├── Mission Acceptance Criteria
├── Milestones
│   ├── Milestone Acceptance Criteria
│   └── Features
│       ├── Feature Acceptance Criteria
│       ├── Dependencies
│       └── Risks
├── Scope
├── Assumptions
├── Questions
└── Risks
```

## 3.7.4 Decomposição parallel-first

O Planner deve procurar paralelismo somente depois de identificar:

- dependências;
- contratos;
- seams;
- ownership;
- write surfaces;
- recursos externos;
- ordem de composição.

O objetivo não é maximizar workers.

O objetivo é encontrar trilhas que sejam:

- realmente independentes;
- verificáveis;
- integráveis;
- úteis.

## 3.7.5 Checks de prontidão do planejamento

Antes da aprovação, o MNFS deve verificar:

### Contract satisfiability

Cada comportamento prometido pode ser implementado sob as decisões atuais?

### Prerequisite existence

Cada símbolo, módulo, serviço, contrato ou ambiente assumido existe?

Se não existe:

- uma Feature precisa criá-lo;
- uma Decision precisa autorizá-lo;
- ou o plano precisa mudar.

### Dependency validity

- referências existem;
- DAG não possui ciclos;
- Feature não depende de si;
- dependência entre Milestones usa identidade qualificada.

### Acceptance coverage

Toda Mission, Milestone e Feature possui critérios.

### Proof coverage

Cada critério possui método de prova planejado.

### Scope coverage

Todo outcome está coberto por Features ou decisões.

### Seam ownership

Toda escrita compartilhada possui owner ou ordem serial.

### Integration closure

O plano nomeia como as partes serão compostas e provadas.

### Engineering standards applicability

O plano resolve quais Engineering Standards se aplicam a cada Milestone, Feature, seam e recurso alterado.

### Golden Path selection

Mudanças recorrentes devem usar um Golden Path existente ou registrar por que ele não se aplica.

### Policy satisfiability

Nenhum plano pode exigir uma implementação que viole uma regra `MUST` ativa sem Waiver aprovada.

## 3.7.6 Saída

Uma `Mission Plan Revision` válida e content-addressed.

---

# 3.8 Fluxo D — Revisão visual e aprovação

## 3.8.1 Projeção

MNFS renderiza a revisão estruturada em HTML determinístico.

```text
Plan Revision
→ review.html
→ Lavish
```

HTML é uma projeção.

Não é fonte de verdade.

## 3.8.2 O operador pode

- comentar;
- pedir mudanças;
- responder questões;
- rejeitar assumptions;
- alterar prioridade;
- questionar arquitetura;
- aprovar o hash atual.

## 3.8.3 Feedback

Feedback retorna ao Planner Actor.

O Planner Actor propõe uma nova revisão completa.

MNFS:

- valida;
- compara hash anterior esperado;
- persiste;
- renderiza;
- mantém histórico.

## 3.8.4 Gate de aprovação

Aprovação exige:

- hash corrente exato;
- nenhuma questão bloqueante aberta;
- critérios em todos os níveis;
- dependências válidas;
- contrato satisfatível;
- escopo explícito;
- decisão do operador.

## 3.8.5 Saída

```text
Approved Mission Contract
```

Materializado em:

```text
.mnfs/missions/<mission-id>/plan.json
```

## 3.8.6 Regra

Depois da aprovação:

- o contrato é imutável;
- execução se vincula ao hash;
- mudança material exige Replan;
- worker não pode reinterpretar escopo.

---

# 3.9 Fluxo E — Preparação da execução

## 3.9.1 Objetivo

Converter o contrato aprovado em unidades executáveis, sem depender de prompt improvisado.

## 3.9.2 Passos

MNFS:

1. resolve Repository Profile;
2. valida ambientes e ferramentas;
3. calcula Features acionáveis;
4. resolve dependencies;
5. define Write Tracks;
6. define write-sets;
7. resolve risco;
8. resolve gates;
9. resolve Engineering Standards e Golden Paths aplicáveis;
10. compila Policy Rules e Fitness Functions exigidas;
11. gera Context Packs;
12. registra Dispatch Intents.

## 3.9.3 Write Track planning

Uma Write Track precisa nomear:

```text
write_track_id
mission_id
milestone_id
feature_refs
contract_hash
expected_base_sha
write_set
read_context
verification_plan
risk
```

## 3.9.4 Context Pack

O pack deve conter apenas o necessário para o worker:

- objetivo;
- critérios da Feature;
- critérios de Milestone relevantes;
- contratos;
- invariantes;
- negativos;
- arquivos e símbolos relevantes;
- exemplos;
- write-set;
- comandos permitidos;
- como emitir Claim;
- decisões já tomadas;
- Engineering Standards aplicáveis;
- Golden Path selecionado;
- guardrails que serão executados;
- Waivers vigentes;
- exemplos canônicos do repositório.

Não deve carregar automaticamente:

- transcript do planning;
- toda a Mission;
- todas as tentativas;
- toda a documentação;
- reasoning de outros agentes.

## 3.9.5 Gate de preparação

A Write Track só pode ser alocada quando:

- contrato está aprovado;
- Feature é acionável;
- dependências estão aceitas no nível exigido;
- write-set está resolvido;
- base SHA está conhecida;
- ferramentas obrigatórias estão disponíveis;
- critérios possuem caminho de prova;
- padrões aplicáveis foram resolvidos;
- Golden Path foi selecionado ou recusado com razão;
- nenhuma regra `MUST` está violada sem Waiver;
- nenhuma Decision bloqueante está aberta.

---

# 3.10 Fluxo F — Alocação do isolated mutable workspace e Execution Environment

## 3.10.1 Solicitação

MNFS registra a intenção de materializar ou vincular o isolated mutable workspace exigido pela Write Track e, quando aplicável, uma Execution Environment Instance. A escolha física pertence à realization selecionada; o lifecycle de domínio pertence ao MNFS.

## 3.10.2 Ordem recomendada

A alocação deve tolerar crash entre o mundo externo e SQLite.

Fluxo conceitual:

```text
registrar intenção de workspace/environment binding
        ↓
invocar a realization selecionada
        ↓
observar e validar o workspace/environment real
        ↓
persistir binding/lease e policy identities
        ↓
emitir Domain Event correspondente
```

A realization concreta pode ser isolated mutable workspace, COW filesystem, rootfs/disk privado, microVM workspace ou outra opção selecionada por Decision. Nenhuma delas é semântica obrigatória do WriteTrack.

## 3.10.3 Validações

- workspace pertence ao binding atual da Write Track;
- base Git corresponde ao expected base ou existe Replan/rebase autorizado;
- workspace não é compartilhado com outro writer quando exclusividade é exigida;
- Execution Environment e effective policy correspondem às identities aprovadas;
- write/resource sets não colidem com outro Actor ativo sem serialização explícita;
- network, credential e effect posture satisfazem o contrato.

## 3.10.4 Saída

```text
Workspace Binding READY
Environment Lease/Binding READY when applicable
Write Track ALLOCATED
```

## 3.10.5 Falhas

### Realization indisponível

```text
ALLOCATION_BLOCKED
```

Track permanece sem dispatch. Não existe fallback silencioso para host irrestrito.

### Recurso físico criado, persistência falhou

Recovery observa o recurso e o classifica como adotável, divergente ou cleanup-pending conforme identity/fence.

### Binding existe, recurso físico desapareceu

```text
DIVERGED
```

Nenhum reparo silencioso.

---

# 3.11 Fluxo G — Dispatch e boot do Actor

## 3.11.1 Brief antes do processo/runtime

O Actor não nasce de uma mensagem longa improvisada. O Context Compiler materializa um Role/Execution Pack com authority, target, boundaries, proof e termination contract.

## 3.11.2 Dispatch Packet

Exemplo conceitual:

```json
{
  "missionId": "MIS-002",
  "milestoneId": "M02",
  "featureId": "F01",
  "writeTrackId": "WT-001",
  "attemptId": "WT-001/A01",
  "contractHash": "sha256:...",
  "expectedBaseSha": "...",
  "workspaceBindingRef": "...",
  "environmentBindingRef": "...",
  "executionPolicyHash": "sha256:...",
  "contextPackRef": "...",
  "claimCommand": "..."
}
```

Campos não aplicáveis são omitidos; o packet nunca inventa uma provider identity.

## 3.11.3 Agent Runtime

O Agent Runtime adapter inicia ou conecta o Actor com:

- cwd/boundary exato do isolated mutable workspace quando o runtime executa localmente;
- environment mínimo e policy compilada;
- prompt/context por artifact ou protocolo controlado;
- provider/modelo resolvido por policy separada da autoridade de domínio;
- outputs/events limitados e observáveis;
- cancellation explícita;
- Session ref apenas como observação opcional.

## 3.11.4 Boot checks

Antes de escrever, MNFS confirma:

- contract/authority hashes;
- target qualificado e Attempt atual;
- workspace/environment bindings atuais;
- base Git;
- write/resource boundaries;
- effective execution/security policy.

## 3.11.5 Estado

```text
Worker Run STARTING
→ RUNNING
Write Track ACTIVE
Attempt RUNNING
```

## 3.11.6 Falhas

### Runtime não inicia

Attempt permanece incompleto e a falha é observada; não existe success por process text.

### Base ou binding mismatch

Actor não escreve. A Track fica stale/diverged conforme o finding.

### Lead morre após dispatch

O Actor/recurso pode continuar conforme o contrato. Um Fresh Lead recupera por SQLite, Git e observação das realizations, sem depender de transcript.

### Mensagem não chega

Estado durável e artefatos permanecem.

---

# 3.12 Fluxo H — Execução da Write Track

## 3.12.1 Responsabilidade do worker

O Writer Worker:

- lê o pack;
- verifica precondições;
- implementa dentro do write-set;
- executa checks locais;
- registra decisões permitidas;
- produz commits ou tree identificável;
- emite Claim.

## 3.12.2 TDD e verificação local

Quando houver comportamento de código:

```text
teste falha
→ implementar
→ teste passa
→ refatorar
```

Nem todo trabalho exige teste unitário, mas todo critério exige método de prova.

## 3.12.3 Escrita fora do write-set

Se necessária:

- worker não amplia silenciosamente;
- registra Request;
- Lead avalia colisão;
- pode conceder expansão;
- pode serializar;
- pode replan.

## 3.12.4 Decisões

### Nível local

Worker pode decidir detalhes não contratuais autorizados.

### Trade-off

Escala ao Lead.

### Produto/contrato

Escala ao operador.

## 3.12.5 Worker completion

Quando acredita que concluiu:

```text
COMPLETED_BY_WORKER
```

Isso é uma declaração de runtime.

Não é aceite.

---

# 3.13 Fluxo I — Criação do Claim

## 3.13.1 Abertura

Claim é criado e persistido pelo MNFS, vinculado a:

- contrato;
- Feature qualificada;
- Track;
- Attempt;
- Lease;
- worker result;
- critérios reivindicados.

## 3.13.2 Conteúdo

```text
claim_id
target
contract_hash
base_sha
result_sha/tree_hash
criteria_claimed
files_touched
commands_reported
evidence_refs
worker_run
written_at
```

## 3.13.3 Transação

Criação de Claim e evento correspondente ocorrem na mesma transação.

## 3.13.4 Worker marking

Worker pode solicitar:

```text
CLAIM_COMPLETED_BY_WORKER
```

MNFS valida schema e vínculos.

## 3.13.5 Proibições

Worker não pode:

- escrever direto em SQLite;
- definir `ACCEPTED`;
- fechar Feature;
- liberar Lease antes da política;
- alterar contrato para acomodar resultado.

---

# 3.14 Fluxo J — Verificação determinística

## 3.14.1 Entrada

- Claim;
- tree hash;
- critérios;
- Repository Profile;
- verification plan.

## 3.14.2 Runner MNFS

Executa checks determinísticos em ambiente controlado:

- schema validation;
- typecheck;
- lint;
- unit tests;
- integration tests;
- build;
- migrations;
- policy checks;
- architecture fitness functions;
- API/schema compatibility;
- migration rules;
- Golden Path conformance;
- changed-path reconciliation.

## 3.14.3 Receipt

Cada execução decisiva gera Receipt.

Receipt registra:

- critério;
- comando;
- ambiente;
- SHA;
- exit code;
- output ref;
- duração;
- resultado.

## 3.14.4 Staleness

Se o tree hash mudar:

- Receipt antigo fica `STALE`;
- critérios afetados são reexecutados;
- resultado anterior não é reutilizado silenciosamente.

## 3.14.5 Saídas

### Deterministic pass

Claim pode avançar para review, integration ou acceptance, conforme risco.

### Deterministic fail

Finding é criado.

Claim vai para `REJECTED` ou `NEEDS_CORRECTION`.

### Environment unavailable

```text
BLOCK
```

Não virar pass.

---

# 3.15 Fluxo K — Roteamento de qualidade por risco

## 3.15.1 Objetivo

Aplicar o nível mínimo de rigor capaz de produzir confiança suficiente.

## 3.15.2 Lane baixa

- checks determinísticos;
- sem reviewer LLM obrigatório;
- sem dual gate;
- integração simples quando necessária.

## 3.15.3 Lane média

- checks determinísticos;
- um reviewer independente;
- findings ancorados;
- QA live quando critério for user-facing.

## 3.15.4 Lane alta

- plan readiness ampliada;
- reviewer independente;
- segundo gate ou refutador quando justificado;
- integration environment;
- QA real;
- decisão humana para risco ou irreversibilidade.

## 3.15.5 Sinais de risco

- auth;
- autorização;
- tenancy;
- pagamentos;
- dados sensíveis;
- migrations;
- contrato público;
- integração externa;
- concorrência;
- efeito destrutivo;
- múltiplos módulos;
- ambiente não reproduzível;
- pouca cobertura;
- grande diff;
- unknown relevante.

## 3.15.6 Regra

Risco desconhecido não é risco baixo.

Mas risco alto também não deve ser imposto permanentemente sem evidência.

Telemetria futura deve calibrar a política.

---

# 3.16 Fluxo L — Review independente

## 3.16.1 Entrada limitada

Reviewer recebe:

- diff;
- Feature contract;
- critérios;
- Claim;
- deterministic report;
- decisions relevantes;
- findings anteriores;
- learnings aplicáveis.

Não recebe todo o transcript de implementação.

## 3.16.2 Ordem de review

1. arquitetura e fit sistêmico;
2. correção;
3. simplicidade;
4. testes;
5. contracts;
6. legibilidade;
7. estilo somente se máquina não puder decidir.

## 3.16.3 Saída

- Verdict;
- Findings;
- receipts de investigação;
- expansão de contexto reportada.

## 3.16.4 Finding decisivo

Precisa de:

- locus;
- evidência;
- impacto;
- reprodução ou raciocínio verificável;
- correção esperada.

Finding especulativo não bloqueia.

## 3.16.5 Resultados

### APPROVE

Claim pode avançar.

### REJECT

Correction é aberta.

### BLOCK

Decision ou informação é necessária.

### ERROR

Review falhou operacionalmente.

Não virar approve.

---

# 3.17 Fluxo M — Correção

## 3.17.1 Default

Finding local:

```text
mesma Write Track
mesmo isolated mutable workspace
novo Attempt
mesma sessão, se saudável
```

## 3.17.2 Correction Contract

Define:

- findings alvo;
- escopo;
- arquivos;
- critérios de resolução;
- regressions;
- re-review necessário.

## 3.17.3 Delta verification

Correção local revalida:

- delta;
- findings;
- critérios afetados;
- regressions necessárias.

Não relê e reexecuta tudo por hábito.

## 3.17.4 Quando criar nova Track

- replan material;
- arquitetura rejeitada;
- write-set mudou;
- workspace contaminado;
- base inválida;
- hipótese independente;
- solução anterior abandonada.

## 3.17.5 Anti-loop

Cada retry registra:

```text
failure_fingerprint
hypothesis
action
expected_observation
actual_observation
conclusion
```

Se a mesma falha retorna sem nova evidência:

- retry é bloqueado;
- triage ou replan é exigido.

---

# 3.18 Fluxo N — Aceite da Write Track

Uma Write Track pode ficar `ACCEPTED` quando:

- Claim válido;
- critérios da Feature atribuídos à Track estão decididos;
- receipts não estão stale;
- findings decisivos resolvidos;
- review exigido passou;
- tree hash está fixo;
- nenhum scope violation aberto;
- Lease e workspace estão consistentes.

`ACCEPTED` significa:

> elegível para integração.

Não significa:

- Feature fechada;
- Milestone fechada;
- Mission concluída;
- branch integrada.

---

# 3.19 Fluxo O — Integration Run

## 3.19.1 Preparação

MNFS cria workspace de integração limpo.

## 3.19.2 Fila

Integração serial é default inicial.

Paralelismo de integração só entra quando necessário e provado.

## 3.19.3 Composição

Integrator:

- parte de base autorizada;
- aplica tracks na ordem;
- resolve conflitos;
- registra merge order;
- produz candidate SHA.

## 3.19.4 Verificação composta

Executa:

- build;
- testes integrados;
- migrations;
- wiring checks;
- contract checks;
- stack bootstrap;
- smoke tests;
- critérios de Milestone relevantes.

## 3.19.5 Resultados

### ACCEPTED

Candidate SHA pode seguir para QA ou fechamento.

### REJECTED

Findings de composição retornam às tracks responsáveis.

### FAILED

Ambiente ou operação falhou.

### BLOCKED

Decision externa necessária.

## 3.19.6 Regra

Isolated mutable workspaces de origem não são destruídos até:

- integração aceita;
- ou abandono explícito.

---

# 3.20 Fluxo P — QA Journey

## 3.20.1 Quando obrigatório

- critério user-facing;
- UI;
- fluxo multi-componente;
- provider real;
- comportamento operacional;
- erro visível;
- jornada end-to-end.

## 3.20.2 Fresh persona

QA não começa absorvendo a justificativa do implementador.

Recebe:

- persona;
- journey;
- ambiente;
- preconditions;
- expected observations;
- candidate SHA.

## 3.20.3 Evidência

- screenshots;
- traces;
- network;
- console;
- outputs;
- timestamps;
- result.

## 3.20.4 Falha

QA cria Finding.

Correção retorna à Track responsável.

Depois:

- integração é refeita;
- journey afetada é redriven.

## 3.20.5 Ambiente indisponível

Resultado:

```text
BLOCKED
```

Não:

```text
PASSED_BY_ASSUMPTION
```

---

# 3.21 Fluxo Q — Fechamento da Feature

Feature é aceita somente quando:

- todas as Write Tracks necessárias estão aceitas;
- critérios próprios da Feature foram decididos;
- integração necessária passou;
- QA específico passou;
- findings decisivos estão resolvidos;
- accepted risk foi registrado;
- Evidence Bundle existe.

A Feature pode possuir:

```text
lifecycle = CLOSED
```

somente após gate MNFS.

Worker, reviewer e integrator não fecham Feature diretamente.

---

# 3.22 Fluxo R — Fechamento da Milestone

Milestone não fecha automaticamente porque as Features fecharam.

Também precisa provar seus próprios critérios.

## 3.22.1 Entrada

- Features fechadas;
- candidate SHA integrado;
- critérios da Milestone;
- Integration Run;
- QA Journeys;
- decisions;
- Evidence Bundles.

## 3.22.2 Critérios típicos de Milestone

- composição;
- interoperabilidade;
- outcome intermediário;
- recovery;
- performance;
- segurança;
- fluxo completo daquela capacidade.

## 3.22.3 Gate

Milestone gate produz Verdict.

### ACCEPT

Milestone pode fechar.

### REJECT

Correção é aberta.

### BLOCK

Decision ou ambiente.

### ERROR

Gate não concluiu.

## 3.22.4 Saída

- Milestone Evidence Bundle;
- close event;
- next Milestones desbloqueadas.

---

# 3.23 Fluxo S — Fechamento da Mission

Mission não fecha automaticamente porque todas as Milestones fecharam.

Ela precisa provar seus critérios globais.

## 3.23.1 Critérios globais

Podem incluir:

- outcome do operador;
- jornada final;
- comportamento integrado;
- recovery global;
- delivery;
- documentação operacional;
- ausência de riscos bloqueantes.

## 3.23.2 Closeout

MNFS produz:

```text
mission summary
approved contract hash
delivered SHA
milestones
criteria coverage
evidence bundles
decisions
accepted risks
known limitations
engineering standards coverage
waivers and expirations
quality posture changes
gardening follow-ups
delivery references
```

## 3.23.3 Autoridade

Operador pode ser exigido para:

- aceitar risco;
- confirmar outcome;
- autorizar delivery;
- encerrar missão incompleta;
- cancelar escopo restante.

## 3.23.4 Saída

```text
MISSION_CLOSED
```

com referência ao Evidence Bundle final.

---

# 3.24 Fluxo T — Replan

## 3.24.1 Gatilhos

- contrato impossível;
- assumption refutada;
- arquitetura rejeitada;
- dependência inexistente;
- provider mudou;
- risk aumentou;
- objetivo mudou;
- mesma falha recorrente;
- integração revelou seam ausente;
- operador alterou prioridade.

## 3.24.2 Processo

1. identificar motivo;
2. pausar entidades afetadas;
3. preservar evidência;
4. abrir Decision quando necessário;
5. criar nova Plan Revision;
6. revisar no Lavish quando material;
7. aprovar novo hash;
8. invalidar packs e dispatches stale;
9. reconciliar trabalho já produzido;
10. retomar.

## 3.24.3 Trabalho existente

Pode ser:

- reutilizado;
- revalidado;
- parcialmente aplicado;
- abandonado;
- preservado como evidência.

Nunca é silenciosamente reinterpretado sob novo contrato.

---

# 3.25 Fluxo U — Recovery e reconcile

## 3.25.1 Quando ocorre

- Lead inicia;
- comando de status;
- antes de dispatch;
- antes de integration;
- após crash;
- quando divergência é suspeita.

## 3.25.2 Fontes observadas

- SQLite;
- Git;
- selected workspace realization;
- filesystem;
- process state;
- Runtime Session state;
- artifacts.

## 3.25.3 Não usa como fonte autoritativa

- transcript;
- último texto do worker;
- pane do Herdr;
- ausência de logs.

## 3.25.4 Reconcile table

| SQLite | Mundo externo | Resultado |
|---|---|---|
| current workspace/environment binding | physical mutable workspace exists | healthy |
| current workspace/environment binding | physical mutable workspace missing | divergence |
| no current workspace binding | MNFS-like mutable workspace orphan | divergence |
| Worker RUNNING | processo existe | healthy |
| Worker RUNNING | processo ausente | LOST |
| Claim OPEN | worker morto | recoverable |
| Claim COMPLETED | gate ausente | awaiting verification |
| Track ACCEPTED | integração ausente | awaiting integration |
| Track RELEASED | bound mutable workspace still exists | cleanup divergence |

## 3.25.5 Reparos

Reparos precisam ser:

- explícitos;
- idempotentes;
- auditados;
- reversíveis quando possível.

Unknown não é convertido em success.

## 3.25.6 Resultado

Novo Lead reconstrói:

- Mission;
- active entities;
- blockers;
- next action;
- divergences;
- workers observáveis;
- claims aguardando gate.

---

# 3.26 Fluxo V — Pause, cancel e abandon

## Pause

Suspende nova execução sem destruir estado.

## Cancel Mission

Interrompe objetivo global.

Exige:

- autoridade do operador;
- workers cancelados;
- tracks preservadas;
- leases reconciliados;
- closeout de cancelamento.

## Abandon Write Track

Declara que aquele trabalho não será integrado.

Antes de cleanup:

- diff preservado;
- motivo registrado;
- evidence references preservadas;
- branch identificável;
- lease liberado.

## Regra

Cleanup nunca é equivalente a esquecimento.

---

# 3.27 Comunicação entre atores

## Mensagens

Mensagens são pequenas:

```text
type
entity_id
attempt_id
artifact_ref
correlation_id
```

## Conteúdo grande

Fica em:

- SQLite;
- JSON;
- Markdown;
- logs;
- prompt files;
- evidence artifacts.

## Exemplo

```json
{
  "type": "CLAIM_READY",
  "claimId": "CLM-001",
  "writeTrackId": "WT-001",
  "attemptId": "WT-001/A01",
  "artifactRef": "claim://CLM-001"
}
```

Mensagem desperta.

Artefato informa.

MNFS autoriza.

---

# 3.28 Fronteira code-first por fase

| Fase | Prosa/skill | Artefato estruturado | Código MNFS |
|---|---|---|---|
| Intake | entrevista | Mission draft | IDs, persistência, policy |
| Investigação | pergunta e rubric | report | refs, status |
| Planning | Planner Actor reasoning | plan JSON | schema, DAG, hash |
| Lavish | explicação visual | feedback | revision control |
| Approval | confirmação humana | approved contract | exact-hash gate |
| Dispatch | worker role | context/dispatch pack | leases, attempts, spawn |
| Execution | implementation guidance | commits + Claim | state, write-set |
| Verification | rubric mínima | Receipts | runners |
| Review | judgment rubric | Findings/Verdict | routing, persistence |
| Correction | correction brief | new Claim | attempts, anti-loop |
| Integration | merge instructions | Integration Run | queue, checks |
| QA | persona/journey | QA evidence | gate |
| Closeout | summary | Evidence Bundle | acceptance rules |

---

# 3.29 Status de implementação por fluxo

| Fluxo | Estado atual |
|---|---|
| Intake básico | M0 parcial |
| Mission persistence | M0 implementado |
| Planning estruturado | M1 implementado |
| Lavish review | M1 implementado |
| Exact-hash approval | M1 implementado |
| Contract materialization | M1 implementado |
| Preparation/context packs | futuro |
| Workspace / Environment binding | M2 |
| Agent Runtime dispatch | M2 |
| Claim lifecycle | M2 |
| Recovery de worker | M2 |
| Review independente | M3 |
| Correction reuse | M3 |
| Parallel tracks | M4 |
| Integration Run | M4 |
| Receipts completos | M5 |
| QA Journeys | M5 |
| Mission closeout completo | M5/M6 |
| Delivery | M6 |

---

# 3.30 Invariantes do lifecycle

1. Nenhum dispatch sem contrato aprovado.
2. Nenhuma Mission, Milestone ou Feature sem critérios de aceitação.
3. Nenhum worker recebe apenas uma instrução efêmera.
4. Nenhum worker aceita o próprio Claim.
5. Nenhum exit code fecha Feature.
6. Nenhum Receipt stale decide critério.
7. Nenhum Finding especulativo bloqueia.
8. Nenhum retry idêntico continua indefinidamente.
9. Nenhuma Track aceita fecha automaticamente a Feature.
10. Nenhuma soma de Features substitui critérios da Milestone.
11. Nenhuma soma de Milestones substitui critérios da Mission.
12. Nenhum isolated mutable workspace é liberado antes de integração, abandono ou disposition explícita.
13. Nenhuma integração é provada apenas em isolated mutable workspaces.
14. Nenhum critério live é aprovado por mock.
15. Nenhuma mensagem é a única memória.
16. Nenhum restart exige reconstruir estado por transcript.
17. Nenhuma mudança material de contrato ocorre sem Replan.
18. Nenhuma ferramenta externa decide estado de domínio.
19. Nenhum unknown vira success.
20. Nenhum gate é adicionado sem um risco ou falha que ele previne.

---

# Decisão resumida da Seção 3

> **O lifecycle do MNFS transforma um objetivo em contrato aprovado, o contrato em Write Tracks isoladas, o trabalho em Claims, os Claims em evidência e Verdicts, e as Tracks aceitas em um sistema integrado e validado como usuário. Cada pai possui critérios próprios; cada avanço possui autoridade; cada falha possui um fluxo explícito; e toda recuperação parte do estado estruturado, nunca da memória de uma sessão.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Capability-first sourcing

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Material realization uses the canonical vocabulary:

`OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT`.

MNFS owns differentiated semantics and authority. Commodity machinery is adopted/adapted when a replaceable substrate eliminates meaningful machinery without becoming a second source of truth. Prefer the lowest sufficient upstream layer, one primary production substrate per concern and a concrete implementation until a second real consumer earns a generic abstraction.

Engineering Standards, applicability, Waivers, Golden Paths and proof ownership remain MNFS semantics; repository-native linters, scanners, typecheckers and other mature tools remain replaceable machinery behind those semantics.

---

# 4. Engineering System e Evolução para Software Factory

## 4.1 Por que esta camada é necessária

Até esta seção, o MNFS define com profundidade:

- como o operador expressa intenção;
- como uma Mission é planejada;
- como o contrato é aprovado;
- como workers são isolados;
- como Claims, Receipts e Verdicts governam qualidade;
- como trabalho é integrado;
- como QA e recovery fecham ciclos.

Isso resolve a governança do **trabalho**.

Ainda falta governar a forma como o **software produzido** deve ser estruturado e operar.

Sem essa camada, dois workers podem cumprir os critérios locais de suas Features e ainda produzir:

- APIs incompatíveis;
- contratos duplicados;
- fronteiras arquiteturais quebradas;
- migrations inseguras;
- frontend acoplado a detalhes internos do backend;
- observabilidade inconsistente;
- tratamento de erros divergente;
- testes que provam mocks, não comportamento;
- novas abstrações sem necessidade;
- implementações diferentes para o mesmo problema recorrente.

Uma Harness confiável precisa responder a duas perguntas distintas:

```text
1. O que deve ser construído e como o trabalho avança?
2. Quais propriedades o software construído precisa preservar?
```

O Product Lifecycle responde à primeira.

O Engineering System responde à segunda.

---

## 4.2 De Harness para Software Factory

O termo **software factory** não significa uma máquina que gera qualquer aplicação automaticamente.

No MNFS, Software Factory significa:

> Um sistema de produção de software que transforma conhecimento de engenharia em caminhos repetíveis, controles executáveis, feedback rápido e melhoria contínua.

A evolução conceitual é:

```text
Coding Agent
→ produz código

Harness
→ coordena planejamento, execução e verificação

Engineering System
→ define como software válido deve ser construído

Software Factory
→ combina Harness + Engineering System + Golden Paths + feedback + melhoria contínua
```

A fábrica não substitui julgamento.

Ela remove decisões repetitivas, torna invariantes mecânicos e reserva atenção humana ou de modelos fortes para o que realmente exige análise.

A experiência desejada é:

```text
Feature classificada
        ↓
Golden Path aplicável é selecionado
        ↓
contratos e templates corretos são fornecidos
        ↓
worker implementa dentro de fronteiras conhecidas
        ↓
fitness functions e guardrails executam
        ↓
review julga somente o que a máquina não decidiu
        ↓
evidência atualiza a Quality Posture do repositório
```

---

## 4.3 Dois eixos do MNFS

O MNFS possui dois eixos complementares.

## 4.3.1 Work Governance

Governa:

- Mission;
- Milestone;
- Feature;
- Write Track;
- Attempt;
- Worker Run;
- Claim;
- Receipt;
- Verdict;
- Integration Run;
- QA Journey;
- closeout.

Pergunta central:

> O trabalho está corretamente definido, executado e comprovado?

## 4.3.2 Engineering Governance

Governa:

- arquitetura;
- contracts;
- APIs;
- dados;
- migrations;
- integrações;
- segurança;
- observabilidade;
- resiliência;
- testes;
- delivery;
- operabilidade;
- manutenibilidade;
- experiência do usuário.

Pergunta central:

> O software produzido preserva as propriedades exigidas por este sistema?

## 4.3.3 Interseção

Toda Feature é governada pelos dois eixos:

```text
Feature Contract
+
Applicable Engineering Standards
+
Selected Golden Path
+
Verification Plan
```

Critérios de aceitação dizem **o que precisa ser verdadeiro**.

Engineering Standards dizem **quais propriedades não podem ser perdidas durante a implementação**.

Golden Paths dizem **qual é a maneira preferencial de chegar ao resultado**.

Guardrails dizem **o que não pode passar**.

Safety Nets dizem **como recuperar quando algo falha**.

---

# 4.4 Taxonomia de controles

O MNFS adota quatro formas principais de controle.

## 4.4.1 Golden Path — orientar

Golden Path torna a opção recomendada:

- fácil de descobrir;
- fácil de iniciar;
- completa;
- segura por padrão;
- integrada aos checks;
- adaptável quando necessário.

Ele não existe para bloquear alternativas.

Existe para evitar que cada worker reinvente:

- estrutura;
- contratos;
- error handling;
- testes;
- observabilidade;
- delivery.

Exemplo:

```text
Golden Path: adicionar endpoint HTTP

1. declarar ou atualizar contrato;
2. validar compatibilidade;
3. implementar provider;
4. atualizar consumer tipado;
5. adicionar auth e error contract;
6. executar contract tests;
7. executar integração;
8. atualizar documentação;
9. validar jornada aplicável.
```

## 4.4.2 Guardrail — impedir

Guardrail bloqueia uma condição considerada inaceitável.

Exemplos:

- dependência de camada proibida;
- migration destrutiva sem aprovação;
- endpoint público sem contrato;
- segredo versionado;
- fallback stubado num fluxo live;
- acesso cross-tenant sem boundary;
- Claim aceito com Receipt stale.

Guardrails devem ser poucos, claros e ligados a riscos reais.

## 4.4.3 Safety Net — recuperar

Safety Net reduz o impacto de uma falha.

Exemplos:

- rollback;
- backup;
- feature flag;
- retry idempotente;
- reconcile;
- migration expand/contract;
- release gradual;
- isolated mutable workspace preservado após integração falha.

Safety Net não justifica ignorar qualidade.

Ela reconhece que falhas ainda ocorrerão.

## 4.4.4 Manual Checkpoint — julgar

Checkpoint humano ou de autoridade especializada é usado quando:

- a decisão é irreversível;
- há risco de produto;
- escopo muda;
- contrato público quebra;
- segurança ou privacidade exigem aceitação;
- duas alternativas válidas possuem trade-offs;
- automação não possui evidência suficiente.

O MNFS não deve transformar preferência subjetiva em guardrail mecânico.

---

# 4.5 Hierarquia do Engineering System

O sistema possui quatro níveis.

```text
MNFS Engineering Constitution
        ↓
Capability Standards
        ↓
Repository Profile
        ↓
Mission Applicability
```

## 4.5.1 MNFS Engineering Constitution

Conjunto pequeno de princípios universais para software produzido pelo MNFS.

Exemplos:

- mudanças possuem critérios de aceitação;
- boundaries validam dados externos;
- integração real não é provada por fallback escondido;
- erros não são convertidos silenciosamente em sucesso;
- decisões irreversíveis exigem autoridade adequada;
- observabilidade não pode depender apenas de texto humano;
- teste precisa provar comportamento relevante;
- trabalho novo não pode reduzir silenciosamente a saúde global do código.

A Constitution deve permanecer pequena.

Ela não define:

- framework web;
- banco;
- estilo de pasta;
- biblioteca de validação;
- formato de API;
- estratégia de deploy universal.

## 4.5.2 Capability Standards

Padrões reutilizáveis por domínio de engenharia.

Exemplos:

```text
API-001 — API contract ownership
DATA-001 — migration safety
ARCH-001 — dependency direction
TEST-001 — regression proof
SEC-001 — authorization boundary
OBS-001 — structured operational signals
UI-001 — loading/error/empty states
```

Um padrão pode ser aplicável a muitos repositórios, mas não é automaticamente ativado em todos.

## 4.5.3 Repository Profile

O Repository Profile escolhe e concretiza os padrões para um produto.

Ele define:

- quais capabilities existem;
- quais standards se aplicam;
- quais ferramentas implementam cada check;
- quais Golden Paths estão disponíveis;
- quais comandos executam cada lane;
- quais exceções estão vigentes;
- quais ambientes provam critérios live;
- quais padrões são `RATIFIED`, `ASSUMED`, `OPEN` ou `DEPRECATED`.

Exemplo:

```text
API-001
status: RATIFIED
contract source: api/openapi.yaml
compatibility check: npm run api:breaking
client generation: npm run api:client
provider verification: npm run test:contract
```

## 4.5.4 Mission Applicability

A Mission não redefine padrões.

Ela declara:

- quais standards são acionados;
- quais Golden Paths são usados;
- quais regras não se aplicam;
- quais Waivers foram aprovadas;
- quais critérios provam conformidade.

---

# 4.6 Engineering Standard

## 4.6.1 Definição

Engineering Standard é uma regra normativa sobre uma propriedade do software ou do processo de engenharia.

## 4.6.2 Estrutura conceitual

```ts
interface EngineeringStandard {
  id: string;
  version: number;
  domain: EngineeringDomain;
  title: string;
  statement: string;
  level: 'MUST' | 'SHOULD' | 'MAY';
  status: 'CANDIDATE' | 'RATIFIED' | 'ENFORCED' | 'DEPRECATED';
  applicability: ApplicabilityRule;
  rationaleRef: string;
  enforcement: EnforcementBinding[];
  requiredEvidence: EvidenceRequirement[];
  exceptionPolicy: ExceptionPolicy;
}
```

## 4.6.3 Níveis normativos

### MUST

Invariante bloqueante quando aplicável.

Violação exige:

- correção;
- Waiver;
- ou mudança do Standard.

### SHOULD

Caminho recomendado.

Desvio exige razão registrada quando material, mas não bloqueia automaticamente.

### MAY

Opção suportada.

Não cria obrigação.

## 4.6.4 Status do Standard

### CANDIDATE

Hipótese ainda não comprovada.

Pode gerar observação, não gate.

### RATIFIED

Foi aceita como regra válida.

Ainda pode não possuir enforcement completo.

### ENFORCED

Possui check confiável e pode bloquear conforme o nível.

### DEPRECATED

Foi substituída ou deixou de ser aplicável.

## 4.6.5 Regra de promoção

Um Standard não deve nascer como gate forte apenas porque parece uma boa prática.

Fluxo:

```text
finding ou necessidade recorrente
→ candidate
→ piloto
→ falsos positivos avaliados
→ ratificação
→ enforcement
```

---

# 4.7 Modos de enforcement

Uma regra pode ser implementada por um ou mais modos.

| Modo | Função | Exemplo |
|---|---|---|
| `DOCUMENT` | explicar | rationale e exemplos |
| `PROMPT` | orientar julgamento | rubrica de review |
| `SCAFFOLD` | gerar caminho correto | template de endpoint |
| `LINT` | detectar padrão estático | import proibido |
| `TEST` | provar comportamento | contract test |
| `GATE` | bloquear avanço | breaking API change |
| `OBSERVE` | medir sem bloquear | tamanho de arquivo |
| `REPAIR` | corrigir com segurança | formatter |
| `CHECKPOINT` | pedir decisão | migration destrutiva |

A regra code-first não significa que todo Standard precisa de lint.

Significa que, quando uma propriedade pode ser decidida mecanicamente com confiança, ela não deve depender somente de uma frase numa skill.

---

# 4.8 Catálogo de domínios de engenharia

O catálogo inicial precisa cobrir as superfícies abaixo.

Ele não precisa implementar todos os Standards imediatamente.

## 4.8.1 Architecture

- module boundaries;
- layer direction;
- cycles;
- composition roots;
- dependency ownership;
- cross-domain access;
- public versus internal interfaces;
- generated versus authored code.

## 4.8.2 API e Contracts

- fonte de verdade;
- schemas;
- versionamento;
- compatibilidade;
- error envelope;
- auth;
- pagination;
- idempotency;
- generated clients;
- consumer/provider verification.

## 4.8.3 Data e Migrations

- schema ownership;
- migration ordering;
- forward/backward compatibility;
- backfill;
- destructive operations;
- rollback ou compensação;
- data validation;
- transactional boundaries;
- indexes e constraints.

## 4.8.4 Frontend e Backend Integration

- typed boundary;
- loading/error/empty states;
- stale data;
- retries;
- authorization visibility;
- feature flags;
- schema drift;
- user-level proof.

## 4.8.5 Testing e Verification

- regression proof;
- unit boundaries;
- integration tests;
- contract tests;
- migration tests;
- live QA;
- deterministic fixtures;
- test isolation;
- anti-test-theater.

## 4.8.6 Security e Privacy

- authentication;
- authorization;
- tenancy;
- secrets;
- sensitive logging;
- input validation;
- dependency provenance;
- destructive actions;
- auditability.

## 4.8.7 Reliability e Resilience

- timeout;
- retry;
- idempotency;
- circuit breaking quando necessário;
- graceful degradation;
- recovery;
- concurrency;
- cancellation;
- resource cleanup.

## 4.8.8 Observability

- structured logs;
- metrics;
- traces;
- correlation IDs;
- health checks;
- actionable errors;
- operational dashboards;
- audit events.

## 4.8.9 Configuration

- environment separation;
- secrets;
- defaults;
- validation;
- startup failure;
- feature flags;
- configuration ownership.

## 4.8.10 Delivery e Operations

- CI;
- build reproducibility;
- artifact identity;
- deployment;
- rollback;
- database rollout;
- release evidence;
- production verification.

## 4.8.11 Documentation e Operability

- architecture map;
- setup;
- commands;
- runbooks;
- API docs;
- migration notes;
- decision history;
- ownership;
- deprecation.

## 4.8.12 Code Health

- simplicity;
- duplication;
- naming;
- file/module size;
- dead code;
- dependency hygiene;
- generated artifacts;
- technical debt;
- garbage collection.

## 4.8.13 UX e Accessibility

Quando aplicável:

- keyboard use;
- accessibility;
- responsive behavior;
- error clarity;
- latency feedback;
- empty states;
- destructive confirmation;
- browser compatibility.

---

# 4.9 API Contract System

## 4.9.1 Objetivo

Impedir que backend, frontend e integrações desenvolvam interpretações divergentes da mesma API.

## 4.9.2 Fonte de verdade

O Repository Profile precisa declarar qual artefato governa o contrato.

Exemplos possíveis:

- OpenAPI;
- GraphQL schema;
- protobuf;
- AsyncAPI;
- typed in-process interface;
- provider SDK oficial.

O MNFS não impõe OpenAPI universalmente.

Quando uma API HTTP pública usa OpenAPI, a especificação fornece uma descrição independente de linguagem capaz de ser consumida por humanos e ferramentas para documentação, geração e testes.

## 4.9.3 Golden Path — adicionar ou alterar API

```text
1. identificar consumers;
2. alterar contrato primeiro ou junto da Feature;
3. validar schema;
4. avaliar breaking change;
5. gerar ou atualizar tipos/client;
6. implementar provider;
7. verificar auth e errors;
8. executar provider tests;
9. executar consumer contract tests;
10. integrar frontend/backend;
11. atualizar documentação;
12. executar QA aplicável.
```

## 4.9.4 Guardrails possíveis

- endpoint sem contrato;
- breaking change não aprovado;
- response fora do schema;
- consumer ad hoc ignorando client oficial;
- erro não documentado;
- campo sensível exposto;
- rota sem política de autorização;
- contrato alterado sem consumers identificados.

## 4.9.5 Contract tests

Consumer-driven contracts podem registrar as expectativas reais do consumer e verificar o provider contra essas interações.

Ferramentas como Pact são candidatas quando:

- múltiplos serviços ou equipes;
- deploys independentes;
- incompatibilidade é risco real;
- o custo da infraestrutura é justificado.

Não são dependência universal do MNFS.

## 4.9.6 Critérios de aceitação de API

Exemplos:

```text
Feature criterion
→ endpoint responde segundo o contrato

Milestone criterion
→ frontend e provider interoperam no fluxo completo

Mission criterion
→ consumidor final completa a jornada sem incompatibilidade
```

---

# 4.10 Data e Migration System

## 4.10.1 Objetivo

Garantir que mudanças de dados sejam:

- compatíveis;
- recuperáveis;
- observáveis;
- testáveis;
- coordenadas com código.

## 4.10.2 Golden Path — mudança de schema

```text
1. declarar objetivo e impacto;
2. mapear readers e writers;
3. classificar mudança aditiva ou destrutiva;
4. escolher estratégia de rollout;
5. criar migration;
6. criar ou ajustar constraints;
7. testar upgrade;
8. testar aplicação em estado anterior e novo quando necessário;
9. separar backfill quando o volume justificar;
10. validar rollback ou compensação;
11. integrar deploy order;
12. verificar dados após rollout.
```

## 4.10.3 Estratégias possíveis

O Profile pode adotar:

- expand/migrate/contract;
- dual read/write;
- shadow column;
- online migration;
- feature flag;
- maintenance window;
- backup + restore.

Nenhuma estratégia é universal.

## 4.10.4 Guardrails possíveis

- alteração destrutiva sem checkpoint;
- migration sem owner;
- schema alterado sem model/contract update;
- backfill pesado dentro de transaction de deploy;
- índice ausente em acesso crítico;
- migration não testada;
- código novo dependente de schema ainda não implantado.

## 4.10.5 Safety Nets

- backup;
- transaction;
- rollback;
- compensating migration;
- feature flag;
- deploy sequencing;
- reconciliation query.

---

# 4.11 Frontend–Backend Integration System

## 4.11.1 Objetivo

Evitar que frontend e backend fiquem individualmente verdes, mas não componham um produto funcional.

## 4.11.2 Propriedades esperadas

Quando aplicável:

- contrato compartilhado;
- client tipado;
- loading;
- empty;
- error;
- unauthorized;
- stale state;
- retry;
- cancellation;
- observability;
- user journey.

## 4.11.3 Golden Path — nova capability user-facing

```text
1. congelar contrato da interação;
2. definir estados da experiência;
3. implementar provider;
4. implementar client/adapter;
5. implementar UI;
6. testar consumer e provider;
7. executar integração real;
8. executar browser QA;
9. registrar evidência visual e operacional.
```

## 4.11.4 Integration honesty

Um seam live não pode ser considerado provado quando:

- composition root ainda usa stub;
- frontend usa fixture permanente;
- backend real não foi iniciado;
- auth foi bypassada;
- network failure nunca foi exercitada;
- contrato foi simulado, mas provider real não foi verificado.

Mocks permanecem úteis em testes localizados.

Eles não substituem a prova do seam real.

---

# 4.12 Testing e Verification System

## 4.12.1 Testes derivam de risco e critério

MNFS não deve impor uma pirâmide fixa para todo software.

O Verification Plan deriva de:

- Acceptance Criterion;
- failure mode;
- arquitetura;
- custo;
- risco;
- ambiente.

## 4.12.2 Portfólio de prova

| Tipo | Prova principal |
|---|---|
| Unit | regra local |
| Component | módulo com dependências controladas |
| Integration | interação real entre componentes |
| Contract | compatibilidade entre consumer e provider |
| Migration | evolução do estado de dados |
| End-to-end | jornada técnica completa |
| Live QA | experiência real de usuário ou operação |
| Static | propriedade estrutural |
| Review | julgamento arquitetural |

## 4.12.3 Anti-test-theater

Um teste é inadequado quando:

- apenas repete a implementação;
- valida o mock;
- não falha com o defeito que afirma prevenir;
- ignora erro relevante;
- não exercita o seam nomeado;
- possui assertion vaga;
- depende de timing frágil sem necessidade;
- passa sem a capability real estar conectada.

## 4.12.4 Regression proof

Bug fix precisa, quando possível, de:

```text
reprodução vermelha
→ correção
→ prova verde
```

Quando automação não é adequada, a Mission precisa de evidência alternativa explícita.

---

# 4.13 Architecture Fitness Functions

## 4.13.1 Definição

Fitness Function é um check contínuo sobre uma propriedade arquitetural.

Exemplos:

- direção de dependências;
- ausência de ciclos;
- tamanho máximo de módulo;
- boundary parsing;
- uso de logger estruturado;
- nenhum acesso direto cross-domain;
- adapters somente no composition root;
- APIs públicas documentadas;
- package privado não importado externamente.

## 4.13.2 Função no MNFS

```text
Architecture Standard
→ Fitness Function
→ Receipt
→ Gate ou Quality Posture
```

## 4.13.3 Implementações possíveis

- TypeScript AST;
- ESLint custom;
- dependency-cruiser;
- tests estruturais;
- ArchUnit em Java;
- Semgrep;
- custom scripts;
- database checks;
- schema diff.

ArchUnit, por exemplo, permite testar dependências entre packages, layers, slices e ciclos como testes normais em projetos Java.

A ferramenta é um detalhe do Profile.

## 4.13.4 Regras de qualidade

Fitness Function precisa:

- ser determinística;
- ter erro acionável;
- apontar regra e locus;
- evitar falsos positivos;
- possuir teste próprio;
- declarar custo;
- poder rodar na lane correta.

---

# 4.14 Golden Paths

## 4.14.1 Definição

Golden Path é uma composição versionada de:

- perguntas;
- decisões;
- templates;
- código inicial;
- contracts;
- checks;
- exemplos;
- gates;
- evidence expectations.

Ele é mais do que um template de arquivos.

É uma rota completa de produção.

## 4.14.2 Tipos iniciais candidatos

```text
GP-BUGFIX
GP-API-ENDPOINT
GP-UI-FEATURE
GP-DATABASE-MIGRATION
GP-EXTERNAL-INTEGRATION
GP-BACKGROUND-JOB
GP-REFACTOR
GP-NEW-SERVICE
GP-LIBRARY-UPGRADE
```

Não precisamos implementar todos agora.

## 4.14.3 Seleção

Planejamento classifica a Feature.

O MNFS sugere o Golden Path.

O operador ou Lead pode:

- aceitar;
- escolher alternativa;
- declarar `NOT_APPLICABLE`;
- pedir novo path.

## 4.14.4 Flexibilidade

Golden Path é recomendado, não prisão.

Uma alternativa é permitida quando:

- necessidade não é coberta;
- custo seria desproporcional;
- arquitetura exige outra rota;
- experimento foi autorizado.

Mas o desvio precisa preservar Standards `MUST`.

## 4.14.5 Evolução

Golden Paths nascem de:

- tarefas recorrentes;
- bugs repetidos;
- práticas já comprovadas;
- padrões manuais com alto custo;
- scaffolds do Repository Profile.

---

# 4.15 Guardrails

## 4.15.1 Critério de admissão

Um guardrail bloqueante precisa responder:

1. Qual falha concreta previne?
2. A regra é decidível mecanicamente?
3. Qual é o custo de falso positivo?
4. Existe mensagem de correção?
5. Em qual lane deve rodar?
6. Há política de exceção?

## 4.15.2 Onde rodar

### Pre-dispatch

- contrato ausente;
- Profile incompleto;
- Golden Path obrigatório não resolvido;
- base inválida.

### During implementation

- write-set;
- segredo;
- import proibido;
- schema inválido.

### Claim gate

- missing tests;
- stale hash;
- contract divergence.

### Integration gate

- composição;
- migration;
- API compatibility;
- runtime wiring.

### Delivery gate

- CI;
- release;
- production policy.

---

# 4.16 Safety Nets

Safety Nets pertencem ao desenho da capability.

Uma Feature que adiciona risco operacional pode precisar também adicionar:

- rollback;
- cleanup;
- replay;
- idempotency;
- backup;
- reconciliation;
- alerting;
- feature flag;
- kill switch.

O MNFS deve perguntar:

> Se esta mudança falhar depois do merge, como o sistema retorna a uma condição segura?

Nem toda Feature precisa de rollback complexo.

Toda Feature precisa ao menos classificar o impacto de falha.

---

# 4.17 Waivers e exceções

## 4.17.1 Por que existem

Regras absolutas sem exceção tendem a:

- bloquear trabalho legítimo;
- gerar hacks;
- incentivar bypass oculto;
- tornar a plataforma irrelevante.

## 4.17.2 Estrutura

```ts
interface Waiver {
  id: string;
  standardId: string;
  scope: EntityReference[];
  reason: string;
  approvedBy: string;
  compensatingControls: string[];
  createdAt: string;
  expiresAt?: string;
  removalCondition?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'CLOSED';
}
```

## 4.17.3 Regras

- Waiver nunca é implícita.
- `MUST` só é ignorado com autoridade adequada.
- Waiver precisa aparecer no Context Pack.
- Gate precisa reconhecer apenas Waiver válida.
- Closeout lista Waivers ativas.
- Expiração cria trabalho visível.
- Exceção recorrente indica Standard ruim ou Golden Path incompleto.

---

# 4.18 Quality Posture

## 4.18.1 Objetivo

Mostrar onde o repositório é confiável, incompleto ou desconhecido.

Não é uma pontuação para marketing.

## 4.18.2 Unidade

Pode ser calculada por:

- domínio;
- package;
- capability;
- Engineering Standard;
- Golden Path;
- ambiente.

## 4.18.3 Estados

```text
VERIFIED
PARTIAL
MISSING
NOT_APPLICABLE
UNKNOWN
```

## 4.18.4 Exemplos

```text
API contracts          VERIFIED
Migration rollback     PARTIAL
Browser QA             MISSING
Tenant isolation       VERIFIED
Observability          UNKNOWN
```

## 4.18.5 Atualização

Evidence Bundles e Findings alteram a postura.

Uma Mission pode:

- melhorar;
- manter;
- ou degradar conscientemente a postura.

Degradação exige Decision ou Waiver quando material.

---

# 4.19 Repository Bootstrap

Antes de execução generalizada, MNFS precisa entender o repositório.

## 4.19.1 Processo

```text
read-only scouts
→ detectar stack e arquitetura
→ executar comandos existentes
→ mapear contracts e seams
→ propor Repository Profile
→ entrevista curta com operador
→ ratificar mínimo necessário
```

## 4.19.2 Saída mínima

- commands;
- modules;
- architecture boundaries;
- environments;
- API contract sources;
- migration system;
- test lanes;
- live QA capability;
- external systems;
- Golden Paths disponíveis;
- Standards aplicáveis;
- sections `OPEN`.

## 4.19.3 Regra

Profile nasce magro.

Ele cresce por evidência de campo.

Não tentar documentar todo o repositório antes da primeira Mission.

---

# 4.20 Integração com Planning

Toda Feature planejada precisa declarar:

```text
engineering_domains
applicable_standards
selected_golden_path
verification_bindings
required_safety_nets
waivers
```

O Planner não precisa escolher ferramentas arbitrariamente.

Ele usa o Repository Profile.

## Checks adicionais de readiness

- standard applicability;
- Golden Path fit;
- policy satisfiability;
- exception validity;
- quality posture impact;
- safety-net coverage.

---

# 4.21 Integração com Context Packs

O worker recebe somente as regras aplicáveis.

Exemplo:

```text
Feature MIS-010/M02/F03
Golden Path: GP-API-ENDPOINT
Standards:
  API-001 MUST
  SEC-003 MUST
  TEST-002 MUST
  OBS-001 SHOULD
Fitness Functions:
  npm run api:check
  npm run boundaries
Waivers:
  none
```

Isso substitui:

- manual gigante;
- AGENTS.md monolítico;
- toda a documentação injetada em toda sessão.

O entry point permanece curto e progressivo.

---

# 4.22 Integração com Verification e Review

## Máquina primeiro

Fitness Functions e deterministic checks executam antes do review.

Reviewer não gasta contexto procurando:

- formatação;
- import proibido;
- schema inválido;
- naming mecânico;
- arquivo grande;
- comando ausente.

## Julgamento depois

Reviewer avalia:

- arquitetura;
- trade-offs;
- correção;
- simplicidade;
- adequação da exceção;
- risco residual;
- impacto futuro nomeado.

## Feedback executável

Quando reviewers repetem o mesmo Finding mecânico:

```text
finding recorrente
→ candidate standard
→ fitness function
→ reviewer deixa de gastar tokens nisso
```

---

# 4.23 Integração com Closeout e Gardening

Mission closeout deve registrar:

- standards aplicados;
- regras violadas e corrigidas;
- Waivers;
- posture anterior e posterior;
- novas Defect Classes;
- Golden Path gaps;
- checks candidatos.

## Garbage collection

Agentes reproduzem padrões existentes, inclusive ruins.

O MNFS precisa de manutenção contínua:

- dead code;
- docs stale;
- abstrações duplicadas;
- policy drift;
- Waivers vencidas;
- Golden Paths quebrados;
- quality gaps.

A limpeza deve ocorrer em pequenos trabalhos direcionados, não em grandes “semanas de refactor”.

---

# 4.24 Metodologia de evolução do Engineering System

## Etapa 1 — Observar

Uma falha ou tarefa recorrente é registrada.

## Etapa 2 — Classificar

Ela pede:

- Golden Path?
- Guardrail?
- Safety Net?
- Manual Checkpoint?
- Apenas documentação?
- Nenhuma ação?

## Etapa 3 — Especificar

Criar Standard candidato com:

- escopo;
- risco;
- rationale;
- exemplo;
- método de prova;
- custo esperado.

## Etapa 4 — Implementar o menor controle

Preferência:

```text
template simples
→ check simples
→ gate somente quando confiável
```

## Etapa 5 — Pilotar

Medir:

- falhas evitadas;
- falsos positivos;
- tempo;
- tokens;
- bypasses;
- manutenção.

## Etapa 6 — Ratificar

Promover para `RATIFIED` ou `ENFORCED`.

## Etapa 7 — Revisar

Modelo e arquitetura mudam.

Regras que não agregam mais valor são removidas.

---

# 4.25 Ferramentas e política de adoção

MNFS não deve construir ou adotar uma ferramenta apenas porque ela é conhecida.

## Candidatos

- OpenAPI para HTTP contracts;
- Pact para consumer-driven contracts;
- dependency-cruiser para boundaries TypeScript;
- ArchUnit para arquitetura Java;
- Semgrep para padrões;
- OPA para policy-as-code cross-stack;
- Backstage templates como referência de scaffolding;
- linters customizados;
- scripts TypeScript;
- testes estruturais.

## Regra YAGNI

Começar com:

- TypeScript;
- JSON estruturado;
- comandos existentes do repositório;
- checks pequenos;
- adapters estreitos.

Adotar ferramenta externa quando:

1. resolve uma necessidade atual;
2. reduz complexidade total;
3. tem output determinístico;
4. possui manutenção aceitável;
5. pode ser substituída;
6. tem prova de valor.

OPA, por exemplo, separa decisão de política do ponto de enforcement e aceita dados estruturados; isso pode ser útil no futuro para políticas cross-stack. Não é necessário para o primeiro catálogo local.

---

# 4.26 Impacto no roadmap

Esta descoberta altera o roadmap conceitual.

## M2

Pode continuar como vertical slice fixa de um worker:

- uma tarefa demo;
- um Golden Path mínimo embutido;
- Profile mínimo do próprio MNFS;
- sem engine genérica de Standards.

M2 prova execução e recovery, não a fábrica completa.

## Antes da execução generalizada

Antes de workers implementarem Features arbitrárias em repositórios diferentes, precisamos entregar:

- Repository Profile v1;
- Standards Registry v1;
- seleção de Golden Path;
- Context Pack com regras aplicáveis;
- fitness function runner básico.

## M3 e posteriores

O roadmap detalhado deverá decidir se isso vira:

- um Milestone próprio entre M2 e review generalizado;
- ou uma capability obrigatória dentro do novo M3.

Não devemos manter a ordem antiga automaticamente.

## M4–M6

- paralelo usa ownership e architecture rules;
- integração usa contract e migration standards;
- QA usa journey standards;
- delivery usa operational standards;
- calibration usa Quality Posture e telemetria.

---

# 4.27 Alterações canônicas nas Seções 1–3

## Seção 1

MNFS passa a ser definido também como:

> Sistema de produção de software que torna o caminho correto fácil, verificável e repetível.

Novo princípio:

> O caminho correto deve ser o caminho mais fácil.

## Seção 2

O modelo passa a incluir:

- Engineering Standard;
- Golden Path;
- Policy Rule;
- Fitness Function;
- Safety Net;
- Waiver;
- Quality Posture.

Repository Profile deixa de ser apenas comandos e passa a concretizar o Engineering System no repositório.

## Seção 3

Planning, Context Pack, Verification e Closeout passam a resolver:

- Standards aplicáveis;
- Golden Path;
- guardrails;
- Waivers;
- posture impact;
- gardening follow-ups.

---

# 4.28 O que não definir agora

Não devemos, neste momento:

- escrever centenas de regras universais;
- criar um DSL próprio;
- adotar OPA sem consumidor real;
- construir portal de desenvolvedor;
- copiar Backstage;
- impor Pact a todo repositório;
- impor OpenAPI a toda integração;
- criar score arbitrário de qualidade;
- bloquear código com Standards ainda não pilotados;
- transformar gosto pessoal em política;
- criar Golden Path para tarefa que ocorreu uma vez;
- gerar abstração multi-repo antes de M2.

Devemos definir:

- o modelo;
- a hierarquia;
- a metodologia;
- os primeiros domínios;
- a integração com a Harness;
- o ponto correto no roadmap.

---

# 4.29 Primeiros Standards candidatos

Esses Standards são candidatos para pesquisa e piloto, não gates automaticamente ativos.

```text
CORE-001  Toda mudança possui critérios e método de prova.
ARCH-001  Dependências respeitam boundaries declarados.
API-001   API possui fonte de contrato declarada.
DATA-001  Migration possui estratégia de compatibilidade.
TEST-001  Bug fix possui prova de regressão quando automatizável.
INT-001   Seam real não é validado apenas por mock.
SEC-001   Autorização é verificada no boundary correto.
OBS-001   Falhas operacionais produzem sinal estruturado.
OPS-001   Mudança de risco declara recovery ou compensação.
DOC-001   Mudança de comportamento atualiza fonte documental aplicável.
```

Cada um precisará passar pela metodologia de candidate → pilot → ratification.

---

# 4.30 Invariantes do Engineering System

1. Toda regra possui ID e owner conceitual.
2. Toda regra possui applicability explícita.
3. `MUST` violado exige correção ou Waiver.
4. `SHOULD` não vira bloqueio silencioso.
5. Golden Path orienta; guardrail bloqueia.
6. Ferramenta não define política; implementa policy binding.
7. Regra mecânica não permanece apenas em prompt.
8. Regra subjetiva não vira lint arbitrário.
9. Context Pack recebe somente Standards aplicáveis.
10. Mission não redefine Repository Standards.
11. Profile não guarda conteúdo transitório de Mission.
12. Exceção é explícita, limitada e auditável.
13. Unknown permanece unknown.
14. Falso positivo recorrente enfraquece ou remove gate.
15. Finding recorrente pode virar Standard.
16. Standard obsoleto é removido.
17. Quality Posture é baseada em evidência.
18. Golden Path possui prova e condição de manutenção.
19. A fábrica não bloqueia inovação legítima.
20. A fábrica reduz carga cognitiva sem esconder a realidade do sistema.

---

# Decisão resumida da Seção 4

> **O MNFS não será apenas uma Harness que coordena agentes. Ele incorporará um Engineering System que codifica como o software deve ser produzido por meio de Engineering Standards, Repository Profiles, Golden Paths, guardrails, fitness functions, safety nets e Waivers. Essa camada transforma conhecimento de engenharia em comportamento executável e prepara a evolução para uma Software Factory. O framework é definido agora; as regras e ferramentas entram incrementalmente, baseadas em falhas reais, tarefas recorrentes e provas de valor.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current system architecture

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

The architecture is a Thin Sovereign Semantic Kernel with a **Replaceable Agent Runtime** and a property-based Execution Environment outside the semantic core.

```text
Operator / MNFS domain authority
        ↓
Planning + Context compilation
        ↓
Role / ActorRun boundary
        ↓
replaceable Agent Runtime
        ↓ controlled capability boundary
Execution Environment
  + isolated mutable workspace
  + compute/isolation properties
  + network/credential/resource policy
        ↓
provider-neutral Git result identity
        ↓
Verification / independent Validation / MNFS Gate
```

SQLite remains operational-state authority and Git remains code/result identity. Initial adapters stay concrete; this architecture does not authorize a generic runtime/environment/workspace provider framework without a second production consumer.

---

# 5. Arquitetura do Sistema e Fronteiras dos Componentes

## 5.1 Propósito

Esta seção define como o MNFS será organizado internamente e como seus componentes se relacionam.

O objetivo não é congelar prematuramente uma estrutura de pastas definitiva. É estabelecer fronteiras suficientes para que:

- o domínio não dependa do Pi, Lavish, Treehouse, Herdr ou de um provider específico;
- a CLI, a skill e uma futura interface web usem o mesmo comportamento;
- estado autoritativo não seja duplicado;
- adapters externos possam falhar ou ser substituídos sem alterar a semântica da Mission;
- o sistema permaneça simples no ambiente local;
- a evolução para múltiplos workers, ambientes remotos e cloud não exija reescrever contratos, entidades e gates;
- skills e prompts não se tornem novamente o lugar onde regras operacionais vivem;
- cada componente possua autoridade, input, output e failure behavior explícitos.

A arquitetura inicial é um **modular monolith TypeScript**, executado localmente no WSL2.

Não serão criados microserviços, daemon obrigatório, broker, workflow engine ou API web antes de existir uma necessidade operacional comprovada.

---

# 5.2 Visão arquitetural

```text
WINDOWS — apresentação
┌──────────────────────────────────────────────────────────────┐
│ Browser / review surfaces                                   │
│ Windows Terminal / editor conectado ao WSL                  │
└──────────────────────────────┬───────────────────────────────┘
                               │ localhost / terminal
WSL2 — canonical local host    │
┌──────────────────────────────▼───────────────────────────────┐
│ Operator Surface / MNFS Lead                                │
│        ↓                                                     │
│ MNFS Modular Monolith                                       │
│   ├── Sovereign Domain / Authority Kernel                    │
│   ├── Planning + Context Compiler                            │
│   ├── Application Services / Gates                           │
│   ├── SQLite + Artifact Management                           │
│   └── Concrete External Adapters                             │
│        ↓                                                     │
│ Actor Control Plane                                          │
│   └── selected replaceable Agent Runtime                     │
│        ↓                                                     │
│ Execution Environment                                        │
│   ├── isolated mutable workspace                             │
│   ├── compute/isolation boundary                             │
│   ├── network/credential/resource policy                     │
│   └── result extraction                                      │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
                         Git repository
              baseCommitSha · resultTreeSha · optional commit
```

The constitutional diagram names semantic boundaries, not a selected runtime/workspace/environment provider.

---

# 5.3 Princípios arquiteturais

## 5.3.1 Modular monolith first

O MNFS começa como:

```text
um processo ou CLI
+
um package TypeScript
+
um banco SQLite
+
Actors executados pelo Agent Runtime selecionado quando processo/runtime separado for necessário
```

Módulos internos possuem fronteiras claras, mas continuam no mesmo repositório, package e release.

Isso evita:

- contratos de rede prematuros;
- deploy distribuído;
- observabilidade de serviços;
- consistência entre bancos;
- versionamento de APIs internas;
- filas e retries infraestruturais;
- custo de operação sem benefício atual.

Separação física futura só ocorre quando uma fronteira possuir:

- carga independente;
- lifecycle independente;
- isolamento necessário;
- segundo consumidor remoto;
- necessidade de escala;
- razão de segurança;
- evidência de que a modularização lógica já não é suficiente.

## 5.3.2 Domínio inward, adapters outward

Dependências apontam para dentro:

```text
interfaces / adapters
        ↓
application services
        ↓
domain core
```

O Domain Core não importa:

- Pi SDK;
- comandos Treehouse;
- Lavish;
- Herdr;
- SQLite;
- Git CLI;
- process APIs específicas;
- browser automation;
- provider SDKs.

Essas ferramentas implementam portas definidas pelo MNFS.

## 5.3.3 Uma autoridade por conceito

Exemplos:

```text
Mission state          → SQLite / MNFS Core
Code / result identity → Git
Approved contract      → SQLite + materialização versionada
Mutable workspace      → selected workspace realization, observed by MNFS
Agent execution        → selected Agent Runtime, observed by MNFS
Visual/terminal output → presentation adapters
```

Dois componentes podem observar o mesmo fenômeno.

Somente um é autoridade de domínio.

## 5.3.4 CLI e interfaces são finas

CLI, skills, Agent Runtime adapters e futura UI:

- coletam input;
- chamam application services;
- exibem output;
- não reimplementam regras;
- não escrevem SQLite diretamente;
- não decidem transições;
- não interpretam internals de adapters.

## 5.3.5 Processos são recursos, não domínio

Uma execução do Agent Runtime pode:

- iniciar;
- produzir output;
- ficar idle;
- morrer;
- ser retomado.

Esses fatos são convertidos em observações de `Worker Run`.

O processo não decide:

- Claim accepted;
- Feature closed;
- Milestone passed;
- Mission complete.

## 5.3.6 Artefatos grandes não trafegam em mensagens

Prompts, logs, diffs, plans, traces e evidence bundles vivem em arquivos ou registros referenciáveis.

Interfaces trocam:

```text
identity
status
hash
artifact reference
next action
```

## 5.3.7 Local-first sem local-only

O produto é desenhado para funcionar bem numa máquina e um operador.

As fronteiras preservam a possibilidade de substituir:

```text
SQLite       → PostgreSQL
child process→ remote worker runtime
filesystem   → object storage
CLI/TUI      → web API/client
local events → queue/event stream
```

Mas essas substituições não são implementadas antes da necessidade.

---

# 5.4 Camadas lógicas

## 5.4.1 Interface Layer

Entradas e apresentações para humanos e agentes.

Componentes:

- CLI;
- human-readable output;
- `--json` output;
- project/runtime skills;
- future Agent Runtime extension or protocol adapter when selected;
- Lavish HTML;
- futura web UI;
- optional Herdr projection.

Responsabilidades:

- validar sintaxe de input;
- converter input externo para commands;
- chamar use cases;
- renderizar responses;
- apresentar next action;
- nunca conter regra de domínio.

## 5.4.2 Application Layer

Coordena casos de uso.

Exemplos:

- initialize repository;
- open Mission;
- save Plan Revision;
- approve contract;
- prepare execution;
- grant Lease;
- dispatch worker;
- open Claim;
- run verification;
- accept Claim;
- reconcile runtime;
- integrate Tracks;
- close Milestone;
- close Mission.

Responsabilidades:

- carregar entidades;
- verificar preconditions;
- chamar Domain Policy;
- coordenar stores e adapters;
- definir transaction boundaries;
- emitir events;
- retornar resultados tipados.

## 5.4.3 Domain Layer

Contém semântica independente de infraestrutura.

Módulos conceituais:

- identity;
- mission;
- planning;
- criteria;
- execution;
- evidence;
- decisions;
- integration;
- QA;
- engineering standards;
- policy;
- transitions.

Responsabilidades:

- invariantes;
- state machines;
- value objects;
- applicability;
- acceptance rules;
- typed errors;
- policy decisions puras.

## 5.4.4 Engineering System Layer

Pode ser implementada inicialmente como módulos de domínio e aplicação, não como serviço separado.

Subcomponentes:

- Standards Registry;
- Golden Path Catalog;
- Repository Profile Resolver;
- Applicability Resolver;
- Policy Compiler;
- Fitness Function Registry;
- Waiver Service;
- Quality Posture Service.

## 5.4.5 Infrastructure Layer

Implementa portas externas.

- SQLite store;
- Git adapter;
- filesystem artifact store;
- process runner;
- Agent Runtime adapter;
- process sandbox adapter;
- execution environment adapter;
- credential provider adapter;
- network/egress adapter;
- external-effect adapter;
- OpenTelemetry adapter;
- observability backend adapter;
- evaluation backend adapter;
- notification adapter;
- Mutable Workspace adapter;
- Lavish adapter;
- Herdr adapter;
- browser/QA adapter;
- future no-mistakes adapter.

---

# 5.5 Componentes do MNFS Core

## 5.5.1 Identity Module

Responsável por:

- `repo_id`;
- IDs hierárquicos;
- IDs operacionais;
- parsing;
- normalização;
- uniqueness;
- correlation IDs.

Tipos:

```text
RepositoryId
MissionId
MilestoneId
FeatureId
QualifiedFeatureId
AcceptanceCriterionId
WriteTrackId
AttemptId
WorkerRunId
ClaimId
ReceiptId
VerdictId
FindingId
DecisionId
IntegrationRunId
QaJourneyId
```

Identidades são value objects, não strings espalhadas.

## 5.5.2 Mission Module

Responsável por:

- Mission lifecycle;
- phases;
- attention;
- Mission Acceptance Criteria;
- close conditions;
- cancellation;
- replan binding.

## 5.5.3 Planning Module

Responsável por:

- Mission Plan Content;
- validation;
- dependencies;
- revisions;
- canonical hash;
- questions;
- approval;
- materialization contract.

M1 já implementa uma primeira versão.

## 5.5.4 Criteria Module

Responsável por:

- Criterion ownership;
- hierarchical identity;
- proof type;
- deciding/advisory;
- method of proof;
- applicability;
- evidence coverage;
- state.

## 5.5.5 Execution Module

Responsável por:

- Write Track;
- Lease semantic state;
- Attempt;
- Worker Run;
- dispatch binding;
- execution trust;
- claim lifecycle;
- correction reuse.

## 5.5.6 Evidence Module

Responsável por:

- Evidence Item;
- Receipt;
- Evidence Bundle;
- staleness;
- content hashes;
- provenance;
- coverage.

## 5.5.7 Review and Findings Module

Responsável por:

- Finding;
- severity;
- status;
- correction binding;
- reviewer authority;
- Verdict;
- adjudication.

## 5.5.8 Integration Module

Responsável por:

- Integration Run;
- accepted Tracks;
- candidate SHA;
- merge order;
- composition status;
- integration gate.

## 5.5.9 QA Module

Responsável por:

- QA Journey;
- persona;
- steps;
- observations;
- evidence;
- pass/fail/block;
- SHA binding.

## 5.5.10 Decision Module

Responsável por:

- Decision level;
- required authority;
- options;
- blockers;
- result;
- supersession.

## 5.5.11 Policy Module

Responsável por decisões puras como:

- qual lane;
- qual risco;
- quais gates;
- se transição é legal;
- se Waiver é válida;
- se Receipt está stale;
- se Feature pode fechar;
- se Track pode ser reutilizada;
- se replan é obrigatório.

Policy recebe fatos estruturados.

Não chama ferramentas externas.

---

# 5.6 Engineering System Components

## 5.6.1 Standards Registry

Fonte de Standards conhecidos pelo MNFS.

Responsabilidades:

- registrar versões;
- resolver status;
- validar IDs;
- localizar rationale;
- listar enforcement bindings;
- detectar Standard deprecated;
- expor applicability.

Primeira implementação pode ser:

```text
JSON ou TypeScript data
+
validator
```

Não requer banco ou DSL específico.

## 5.6.2 Golden Path Catalog

Catálogo versionado de rotas preferenciais.

Um Golden Path possui:

```text
id
version
applicability
planning questions
required standards
templates
scaffold actions
verification bindings
evidence requirements
safety-net questions
```

Pode ser armazenado inicialmente em arquivos versionados.

## 5.6.3 Repository Profile Resolver

Combina:

```text
MNFS Constitution
+
Capability Standards
+
Repository bindings
```

Produz uma visão efetiva do repositório.

Responsabilidades:

- carregar Profile;
- validar seções;
- resolver status;
- detectar bindings ausentes;
- impedir dependência silenciosa em `OPEN`;
- disponibilizar comandos e examples.

## 5.6.4 Applicability Resolver

Recebe:

- Feature;
- paths;
- domains;
- effects;
- contracts;
- resources;
- risk signals.

Produz:

- Standards aplicáveis;
- Golden Paths candidatos;
- checks;
- required evidence;
- safety-net requirements;
- review signals.

Versão inicial pode ser declarativa e conservadora.

## 5.6.5 Policy Compiler

Converte decisões de engenharia em um Execution Policy específico da Feature.

Exemplo:

```json
{
  "feature": "MIS-010/M02/F03",
  "goldenPath": "GP-API-ENDPOINT@1",
  "standards": [
    {"id": "API-001", "level": "MUST"},
    {"id": "SEC-003", "level": "MUST"},
    {"id": "OBS-001", "level": "SHOULD"}
  ],
  "checks": [
    "api-schema",
    "breaking-change",
    "boundaries",
    "provider-contract"
  ],
  "review": "MEDIUM",
  "liveQa": true
}
```

## 5.6.6 Fitness Function Runner

Executa checks registrados.

Responsabilidades:

- resolver comando;
- definir cwd;
- definir timeout;
- capturar output;
- produzir Receipt;
- mapear falha para Standard;
- emitir mensagem acionável;
- nunca reinterpretar exit code sem binding.

## 5.6.7 Waiver Service

Responsável por:

- criar;
- aprovar;
- validar;
- expirar;
- revogar;
- listar Waivers;
- verificar controles compensatórios;
- bloquear uso fora de escopo.

## 5.6.8 Quality Posture Service

Agrega Evidence e Findings por Standard e superfície.

Não usa confiança textual do modelo.

Produz:

- estado;
- evidence refs;
- unknowns;
- gaps;
- regressions;
- gardening candidates.

## 5.6.9 Current Authority Snapshot Service

Produz, a partir de SQLite, Git e do Approved Contract, uma visão curta e autoritativa do estado atual que precede qualquer memória observacional.

Inclui:

```text
target
current lifecycle
current Attempt
contract hash
blockers
active Decisions
permitted next actions
```

## 5.6.10 Session Memory Adapter

Porta opcional para memória auxiliar de uma Runtime Session.

Pode fornecer Observations, Reflections, source-backed recall, custo e falhas.

Nunca pode alterar estado MNFS, aceitar Claims, fechar Features, modificar contratos ou promover memória automaticamente.

## 5.6.11 Memory Candidate Promotion Service

Recebe uma Observation, Reflection ou fonte exata e propõe sua promoção para um target canônico, como Decision, Repository Profile, Standard candidate, Golden Path improvement, Defect Class, Evidence ou gardening task.

Promoção exige validação e Authority apropriadas.

## 5.6.12 Documentation Manifest and Validator

Mantém o grafo documental do Repository:

- IDs;
- Authority classes;
- status;
- owners;
- relations;
- supersession;
- generated sources;
- review triggers.

Valida metadata, relations, aggregate freshness e Documentation Impact.

## 5.6.13 Product Blueprint Generator

Compõe as 13 Sections canônicas no aggregate `PRODUCT-BLUEPRINT.md`.

O aggregate é projection.

As Sections modulares são a fonte editável.

---

# 5.7 Application Services

## 5.7.1 Project Service

- initialize repository;
- validate identity;
- locate runtime;
- load Profile;
- doctor;
- bootstrap status.

## 5.7.2 Mission Service

- open;
- status;
- pause;
- cancel;
- close;
- aggregate progress.

## 5.7.3 Planning Service

- save revision;
- render;
- review;
- approve;
- materialize;
- initiate Replan.

## 5.7.4 Execution Preparation Service

- resolve actionable Feature;
- resolve standards;
- select Golden Path;
- create Write Tracks;
- create Context Pack;
- create Attempt;
- prepare dispatch.

## 5.7.5 Lease Service

- request;
- activate;
- inspect;
- release;
- reconcile;
- mark divergence.

## 5.7.6 Worker Service

- launch;
- observe;
- cancel;
- continue;
- mark lost;
- reconcile Worker Run.

## 5.7.7 Claim Service

- open;
- complete by worker;
- validate;
- begin verification;
- accept;
- reject;
- supersede.

## 5.7.8 Verification Service

- resolve criteria;
- run Fitness Functions;
- produce Receipts;
- determine deterministic result;
- route review.

## 5.7.9 Review Service

- prepare bounded packet;
- dispatch reviewer;
- persist Findings;
- reconcile Verdict;
- open Correction.

## 5.7.10 Integration Service

- queue Tracks;
- prepare clean workspace;
- compose;
- run checks;
- preserve sources;
- accept candidate.

## 5.7.11 QA Service

- resolve Journeys;
- prepare environment;
- execute;
- persist evidence;
- produce result.

## 5.7.12 Recovery Service

- inspect all authorities;
- compare expected and observed state;
- classify divergence;
- propose repair;
- apply approved repair.

## 5.7.13 Closeout Service

- verify hierarchical criteria;
- generate Evidence Bundle;
- update Quality Posture;
- record Waivers;
- produce Mission summary;
- close.

## 5.7.14 Operator Query Service

- Mission Control projections;
- attention inbox;
- next actions;
- hierarchical status;
- evidence summaries;
- Recovery and Security views.

## 5.7.15 Telemetry Service

- create operation traces;
- record metrics and logs;
- attach correlation IDs;
- enforce telemetry privacy;
- export through optional adapters.

## 5.7.16 Evaluation Service

- persist Evaluation Results;
- run deterministic, human or model-based evaluators;
- validate rubrics;
- track coverage.

## 5.7.17 Experiment Service

- run Golden Missions;
- compare candidates;
- record versions;
- segment results;
- produce Experiment Runs.

## 5.7.18 Calibration Service

- open Calibration Candidate;
- assemble Evidence;
- run shadow/canary;
- record Calibration Decision;
- rollback policy.

## 5.7.19 Notification Service

- create human Attention notifications;
- deduplicate by root cause;
- route to CLI, Lead or future channels;
- never act as inter-process coordination.

---

# 5.8 Persistência e armazenamento

## 5.8.1 Três classes de dados

```text
Repository-owned durable artifacts
Operational state
Generated/runtime artifacts
```

## 5.8.2 Repository-owned durable artifacts

Vivem no Git:

```text
.mnfs/
├── repo.json
├── missions/
│   └── MIS-002/
│       └── plan.json
├── accepted-evidence/
├── decisions/              # quando decisão precisa acompanhar o produto
└── closeouts/
```

Também vivem no Git:

```text
docs/
├── product/
├── adr/
├── design/
├── research/
├── tracking/
├── standards/
├── golden-paths/
└── repository-profile/
```

## 5.8.3 Operational state

Vive fora dos isolated mutable workspaces:

```text
~/.local/state/mnfs/repos/<repo-id>/
├── mnfs.db
├── artifacts/
├── logs/
├── prompts/
├── qa/
└── integration/
```

Pode ser sobrescrito por `MNFS_HOME`.

## 5.8.4 Generated artifacts

Exemplos:

- `review.html`;
- immutable plan snapshots;
- worker prompt files;
- stdout/stderr;
- command outputs;
- screenshots;
- browser traces;
- temporary evidence bundles;
- integration reports.

Nem todo artefato gerado é versionado.

## 5.8.5 Promotion

Um artefato operacional pode ser promovido para Git quando:

- é necessário para auditoria;
- prova aceite;
- explica decisão;
- precisa acompanhar a entrega;
- possui tamanho e formato adequados.

Promotion gera:

- content hash;
- provenance;
- target;
- stable path.

---

# 5.9 SQLite Architecture

## 5.9.1 Função

SQLite é o system of record operacional local.

Não é usado para armazenar todo o conteúdo binário.

## 5.9.2 Princípios

- migrations versionadas;
- foreign keys;
- transactions;
- uniqueness;
- idempotency;
- WAL quando adequado;
- typed repository methods;
- nenhum SQL em CLI ou skill;
- events e state na mesma transaction quando fazem parte do mesmo fato;
- adapters externos nunca escrevem diretamente.

## 5.9.3 Tabelas conceituais futuras

```text
repositories
missions
mission_plan_revisions
milestones
features
acceptance_criteria
write_tracks
leases
attempts
worker_runs
claims
receipts
verdicts
findings
decisions
corrections
integration_runs
qa_journeys
evidence_items
waivers
events
```

Isso é um mapa conceitual.

Não é autorização para criar todas as tabelas antecipadamente.

Cada migration entra com o Milestone que usa a entidade.

## 5.9.4 Transaction boundaries

Exemplos:

```text
Claim row
+
CLAIM_OPENED event
→ mesma transaction
```

```text
Verdict
+
Claim state update
+
VERDICT_RECORDED event
→ mesma transaction
```

Operações externas não participam da transaction SQLite.

Elas exigem intent, compensation e reconcile.

---

# 5.10 Event Architecture

## 5.10.1 Função

Events fornecem:

- auditoria;
- correlação;
- debugging;
- telemetria futura;
- explicação de transições;
- integração futura com UI.

## 5.10.2 Events não são command bus

O core não deve usar eventos internos para evitar chamadas normais entre módulos.

Application Service chama Domain e Store diretamente.

Event é registrado quando um fato relevante ocorreu.

## 5.10.3 Estrutura mínima

```text
event_id
type
entity_type
entity_id
actor
correlation_id
idempotency_key
payload
created_at
```

## 5.10.4 Event payload

Pequeno e estruturado.

Conteúdo grande é referenciado.

## 5.10.5 Futuro

Uma versão cloud pode publicar events depois do commit por outbox.

Não implementar broker local agora.

---

# 5.11 Artifact Architecture

## 5.11.1 Artifact Reference

O domínio referencia artefatos por identidade lógica:

```text
artifact_id
kind
content_hash
storage_ref
```

Evitar paths absolutos em contratos versionados.

## 5.11.2 Artifact Store Port

Conceitualmente:

```ts
interface ArtifactStore {
  put(input: PutArtifactInput): Promise<ArtifactRef>;
  get(ref: ArtifactRef): Promise<ArtifactContent>;
  exists(ref: ArtifactRef): Promise<boolean>;
  promote(ref: ArtifactRef, destination: PromotionTarget): Promise<ArtifactRef>;
}
```

Não criar interface genérica até existir o segundo backend.

No início, um módulo de filesystem com contratos claros é suficiente.

## 5.11.3 Imutabilidade

Artefato identificado por hash não pode mudar sob o mesmo ID.

`review.html` é exceção de projeção estável, não evidence immutable.

Snapshots `rev-N.html` continuam imutáveis.

---

# 5.12 CLI Architecture

## 5.12.1 Papel

A CLI é a API local principal do MNFS.

Usada por:

- operador;
- project/runtime skills;
- workers;
- scripts;
- testes;
- futura extensão;
- futura UI local.

## 5.12.2 Princípios AXI

Cada comando deve possuir:

- output humano compacto;
- `--json`;
- erro tipado;
- next action;
- empty state explícito;
- truncamento explícito;
- sem prompt interativo quando chamado por agente;
- argumentos longos via arquivo;
- exit codes estáveis.

## 5.12.3 Command families

Visão de produto:

```text
mnfs doctor
mnfs init
mnfs status

mnfs mission ...
mnfs plan ...
mnfs decide ...

mnfs profile ...
mnfs standards ...
mnfs golden-path ...

mnfs track ...
mnfs lease ...
mnfs worker ...
mnfs claim ...

mnfs verify ...
mnfs review ...
mnfs correct ...
mnfs integrate ...
mnfs qa ...
mnfs closeout ...
mnfs recover ...
```

Não implementar todos antecipadamente.

## 5.12.4 CLI command flow

```text
parse args
→ construct command
→ call application service
→ map result
→ render human or JSON
```

A CLI não:

- monta SQL;
- chama a workspace realization diretamente;
- altera FSM;
- infere risk;
- lê transcript.

---

# 5.13 Historical / Incumbent Evidence — Pi Integration Architecture

The following records the Pi integration surface studied/proved before D-012. It is incumbent Evidence for ARR-S1 and does not select the future Agent Runtime. Pi offered four relevant integration forms:

- skills e prompt templates;
- TypeScript extensions;
- RPC mode;
- SDK.

A integração deve evoluir por necessidade, não por entusiasmo técnico. Pi permite que extensões TypeScript registrem tools e commands, observem lifecycle events e interajam com a UI; o SDK oferece sessões programáticas e o modo RPC oferece integração via processo e protocolo JSON. citeturn428383search0turn428383search1turn428383search4

## 5.13.1 Stage 1 — Project skills

Já usado em M1.

Skill orienta Pi a:

- chamar CLI;
- produzir Plan JSON;
- abrir Lavish;
- interpretar feedback.

Adequado quando:

- fluxo é conversacional;
- número de tools custom é pequeno;
- CLI já fornece o controle;
- nenhuma TUI própria é necessária.

## 5.13.2 Stage 2 — Pi worker process adapter

M2.

MNFS inicia Pi como processo separado dentro do worktree.

Adequado para:

- isolamento de contexto;
- lifecycle de worker;
- crash independente;
- logs;
- retries;
- múltiplos processos futuros.

## 5.13.3 Stage 3 — Project-local Pi extension

Entra quando pelo menos duas capabilities precisam de integração programática recorrente.

Pode registrar:

```text
/mnfs
/mnfs-status
/mnfs-resume
```

E tools como:

```text
mnfs_get_context
mnfs_open_claim
mnfs_request_decision
mnfs_report_completion
```

A extensão deve chamar a mesma Application Layer ou CLI.

Não deve criar um segundo state store.

Pi auto-descobre extensões project-local em `.pi/extensions/`, e elas podem registrar tools, commands e lifecycle handlers. citeturn428383search1

## 5.13.4 Stage 4 — SDK host

Entra quando houver um segundo cliente real:

- web app;
- desktop app;
- cloud control plane;
- remote worker host;
- automated pipeline.

SDK permite controlar sessões programaticamente e usar resource loaders, auth, model registry e session management. citeturn428383search0turn428383search7

## 5.13.5 Stage 5 — RPC

Adequado quando:

- host é outra linguagem;
- isolamento por processo é desejado;
- um cliente externo controla Pi;
- web/cloud não deve incorporar diretamente o package Node.

RPC possui protocolo de commands/events e suporte a requests de UI de extensions. citeturn428383search4

## 5.13.6 Regra

O MNFS Core não importa Pi.

O adapter Pi importa o Core ou chama a CLI.

---

# 5.14 Historical / Incumbent Evidence — Pi Worker Process Adapter

## 5.14.1 Porta conceitual

```ts
interface AgentRuntime {
  start(input: StartWorkerInput): Promise<WorkerProcessRef>;
  inspect(ref: WorkerProcessRef): Promise<WorkerObservation>;
  send(ref: WorkerProcessRef, message: WorkerMessage): Promise<void>;
  cancel(ref: WorkerProcessRef): Promise<void>;
}
```

A interface real deve nascer somente no microdesign de M2 e refletir o comportamento comprovado.

## 5.14.2 Spawn

Princípios:

- executable e args separados;
- `shell: false`;
- `cwd` igual ao worktree;
- prompt via arquivo ou stdin controlado;
- environment allowlist;
- logs em arquivo;
- timeout de boot;
- cancellation explícita;
- nenhuma interpolação de shell.

## 5.14.3 Worker contract

Worker recebe:

- identity;
- contract hash;
- worktree;
- expected base;
- write-set;
- Context Pack;
- command para Claim;
- escalation path.

## 5.14.4 Observações

Adapter pode registrar:

- process started;
- process exited;
- stdout/stderr refs;
- Pi events disponíveis;
- session ref;
- last observation.

Não interpreta texto livre como state transition.

## 5.14.5 Completion

Worker precisa chamar uma operação MNFS explícita.

Process exit sem Claim:

```text
Worker Run EXITED
Claim absent
→ Attempt incomplete
```

---

# 5.15 Historical / Incumbent Evidence — Treehouse Adapter

This subsection is historical/incumbent M01 workspace Evidence, not the current WriteTrack definition. Treehouse administra um pool de worktrees reutilizáveis, possui leases duráveis que sobrevivem sem processos e oferece JSON para aquisição e status. Também oferece retorno condicionado por `lease_id`, útil para evitar liberar uma aquisição posterior do mesmo path. citeturn221202view0

## 5.15.1 Responsabilidade

- allocate;
- inspect;
- return;
- report external state.

## 5.15.2 Não responsabilidade

Treehouse não decide:

- Write Track identity;
- Feature ownership;
- acceptance;
- integration;
- cleanup policy de domínio;
- se trabalho pode ser abandonado.

## 5.15.3 Adapter output

```text
path
external_lease_id
lease_holder
leased_at
observed_status
processes
```

## 5.15.4 Fencing

Release automatizado deve usar:

- expected lease ID;
- expected holder;
- exact path.

Path sozinho não é identidade suficiente.

## 5.15.5 Hooks

Treehouse hooks podem preparar dependências.

MNFS não depende inicialmente deles para comportamento crítico, pois a ferramenta documenta que falhas de hooks não falham necessariamente a operação principal. citeturn221202view0

Bootstrap crítico precisa ser verificado pelo MNFS depois da aquisição.

---

# 5.16 Lavish Adapter

## 5.16.1 Papel

Lavish é a superfície visual de feedback.

MNFS continua responsável por:

- structured source;
- validation;
- revision;
- hash;
- approval;
- materialization.

## 5.16.2 Fluxo

```text
structured artifact
→ deterministic HTML
→ Lavish open
→ feedback
→ Planner/Actor reasoning
→ new structured artifact
```

## 5.16.3 Adapter

Operações estreitas:

```text
open
poll
end
```

## 5.16.4 Regras

- loopback only;
- HTML escaped;
- nenhuma mutação direta da source;
- feedback é input, não command autorizado;
- aprovação é revalidada no Core;
- stable review path pode coexistir com snapshots imutáveis.

## 5.16.5 Futuro

Uma UI própria pode substituir Lavish sem mudar o Planning Domain.

---

# 5.17 Herdr Adapter

Herdr fornece workspaces, tabs, panes, persistência de terminal e estado visual de agentes; também expõe CLI e socket API para controle. A versão estudada historicamente possuía integração direta com Pi; isso é reference compatibility e não seleciona Pi como Agent Runtime atual. citeturn823284search1turn823284search2turn823284search5

## 5.17.1 Papel

- apresentar workers;
- permitir observação;
- facilitar attach;
- mostrar status operacional;
- organizar terminais.

## 5.17.2 Não autoridade

```text
Herdr working
≠ Write Track ACTIVE autoritativa

Herdr done
≠ Claim ACCEPTED

pane missing
≠ Worker definitivamente LOST
```

Herdr é projection.

## 5.17.3 Optionality

O MNFS precisa funcionar sem Herdr.

Se ausente:

- workers continuam;
- logs continuam;
- status CLI continua;
- recovery continua;
- Claims continuam.

## 5.17.4 Integração

Pode entrar depois do worker funcional.

Adapter pode:

- create workspace;
- create pane;
- run command;
- label worker;
- inspect pane;
- attach;
- close presentation.

Não deve ser o processo supervisor autoritativo.

---

# 5.18 Git Adapter

## 5.18.1 Responsabilidade

- resolve repository;
- inspect HEAD;
- branch;
- status;
- diff;
- commit/tree hash;
- merge/rebase;
- changed files;
- ancestry;
- integration candidate;
- promotion of artifacts.

## 5.18.2 Git é autoridade sobre

- code;
- commits;
- tree identity;
- branch history;
- merge result.

## 5.18.3 Git não é autoridade sobre

- Mission state;
- Claim state;
- Verdict;
- process state;
- operator decision.

## 5.18.4 Safety

- comandos por args;
- fixed cwd;
- expected SHA;
- no force by default;
- destructive operations require authority;
- preserve unlanded work;
- integration uses clean workspace.

---

# 5.19 Verification Adapter Architecture

## 5.19.1 Command Runner

Executa comandos do Repository Profile.

Inputs:

```text
command_id
cwd
env
timeout
tree_hash
criterion_refs
```

Outputs:

```text
exit_code
stdout_ref
stderr_ref
duration
result
```

## 5.19.2 Structured Check Adapter

Para checks que produzem JSON ou formato conhecido.

## 5.19.3 Browser QA Adapter

Futuro.

Responsável por:

- start/attach environment;
- execute journey;
- capture screenshot/trace/network;
- return observations.

Não decide Mission.

## 5.19.4 External Provider Adapter

Quando live criteria exigirem API externa.

Precisa definir:

- sandbox;
- credentials;
- idempotency;
- allowed operations;
- cleanup;
- human checkpoint.

---

# 5.20 Repository Profile Architecture

## 5.20.1 Formato

Inicialmente pode ser Markdown com frontmatter ou JSON/YAML estruturado acompanhado de documentação humana.

Critérios de escolha:

- leitura humana;
- validação;
- diff;
- referências;
- estabilidade;
- facilidade de edição por humanos e Actors.

## 5.20.2 Separação recomendada

```text
docs/repository-profile/
├── PROFILE.md
├── commands.json
├── architecture.json
├── environments.json
├── standards.json
└── golden-path-bindings.json
```

Essa estrutura é conceitual.

O formato final será definido no Milestone correspondente.

## 5.20.3 Profile Resolver output

```text
effective commands
effective standards
effective golden paths
open sections
ratified assumptions
environment capabilities
human gates
```

## 5.20.4 Não duplicação

O Profile referencia Standards e Golden Paths.

Não copia seu texto inteiro.

---

# 5.21 Context Pack Architecture

## 5.21.1 Fonte

Context Pack é compilado de:

- Approved Contract;
- Feature;
- Criteria;
- Repository Profile;
- Standards;
- Golden Path;
- code map;
- decisions;
- active Waivers;
- base SHA.

## 5.21.2 Partes

```text
identity
objective
acceptance criteria
contracts
invariants
negative paths
write-set
read context
examples
engineering rules
verification plan
claim protocol
escalation protocol
hashes
```

## 5.21.3 Determinismo

Partes derivadas mecanicamente precisam ser hasháveis.

Partes produzidas por LLM precisam ser armazenadas como artifact versionado ou content-addressed.

## 5.21.4 Freshness

Pack é stale quando muda:

- contract hash;
- base SHA material;
- Profile binding;
- Standard version;
- Golden Path version;
- Decision relevante;
- write-set.

TTL pode ser advisory.

Conteúdo é autoridade de freshness.

---

# 5.22 Security e Trust Boundaries

## 5.22.1 Modelo local inicial

- um operador;
- uma máquina;
- WSL2;
- repositórios confiáveis;
- packages confiáveis;
- workers considerados falíveis, não maliciosos.

## 5.22.2 Agent Runtime extensions and packages

Agent Runtime extensions/packages execute inside the authority of their hosting process and may expose executable tools; only reviewed, pinned sources may enter the trusted computing base. The prior Pi extension analysis remains incumbent Evidence in Sections 5.13–5.14.

## 5.22.3 WSL2

WSL2 não é sandbox de segurança do MNFS.

Workers podem ter acesso às permissões do usuário.

## 5.22.4 Proteções iniciais

- isolated mutable workspace boundaries;
- allowed cwd;
- protected paths;
- tool allowlists quando aplicável;
- no secrets in packs;
- environment allowlist;
- human checkpoint para destrutivo;
- no production write by default;
- safe process arguments;
- audit events.

## 5.22.5 Futuro

Multiuser/cloud exigirá:

- authentication;
- authorization;
- tenancy;
- secret isolation;
- network policy;
- container ou VM sandbox;
- resource limits;
- per-run credentials;
- artifact access control.

Não entra no local MVP.

---

# 5.23 Observabilidade

## 5.23.1 Operador

Precisa ver:

- Mission;
- phase;
- progress;
- active Tracks;
- Worker Runs;
- Claims;
- blockers;
- Decisions;
- divergences;
- next action.

## 5.23.2 Debug

Precisa correlacionar:

```text
Mission
→ Feature
→ Write Track
→ Attempt
→ Worker Run
→ Claim
→ Receipt
→ Verdict
```

## 5.23.3 Signals

- events;
- state tables;
- process observations;
- command durations;
- tokens quando disponíveis;
- adapter errors;
- artifact refs.

## 5.23.4 Logs

Logs não são apresentados integralmente por default.

Status mostra:

- resumo;
- tail relevante;
- artifact link;
- error code.

## 5.23.5 Telemetria futura

- tokens;
- latency;
- retries;
- false completion;
- finding precision;
- review rounds;
- worker utilization;
- Golden Path performance;
- gate false positives;
- Quality Posture change.

---

# 5.24 Failure Isolation

Cada adapter possui failure behavior nomeado.

## Agent Runtime failure

- Worker Run LOST/EXITED;
- Claim permanece;
- workspace/environment bindings remain until explicit disposition;
- recovery decide.

## Workspace realization failure

- workspace/environment binding BLOCKED/DIVERGED;
- nenhum novo worker;
- state preservado.

## Lavish failure

- plan revision permanece;
- feedback loop bloqueado;
- CLI pode continuar;
- nenhuma aprovação perdida.

## Herdr failure

- presentation unavailable;
- workers continuam.

## SQLite failure

- operação falha;
- nenhuma transição parcial;
- external side effect pode exigir reconcile.

## Git failure

- integration não avança;
- Tracks preservadas.

## Verification failure

- ERROR/BLOCK;
- não ACCEPT.

---

# 5.25 Local Process Topology

## 5.25.1 Lead

The MNFS Lead is a Role/ActorRun owned by MNFS semantics. Its concrete reasoning/runtime surface is selected separately and may be an interactive Agent Runtime session, a programmatic runtime boundary or a later UI-hosted Actor. Runtime Session identity is observational.

## 5.25.2 MNFS commands

Podem rodar como subprocessos curtos. SQLite coordena estado.

## 5.25.3 Workers

Bounded Writer/Reviewer/QA Actors execute through the selected Agent Runtime boundary. A concrete runtime process/session may exist per ActorRun, but MNFS does not require one provider or one process topology constitutionally.

## 5.25.4 Integration

Comando/processo MNFS separado ou executado pelo Lead por application service.

## 5.25.5 QA

Processo/runtime separado quando browser ou ambiente live exigir.

## 5.25.6 Sem daemon obrigatório

Reconcile ocorre em startup, status, before dispatch/integration and explicit actions. Continuous watchers enter only when a named notification/coordination consumer proves the need.

---

# 5.26 Historical / Incumbent Evidence — Roadmap de Integração Pi

| Estágio | Capability | Razão |
|---|---|---|
| M1 | project skill | planning conversacional |
| M2 | worker subprocess | execução isolada |
| pós-M2 | project extension | tools/status quando houver repetição |
| futura UI | SDK host | controle programático no mesmo runtime |
| cloud/other language | RPC | process/language boundary |

Pi deliberadamente fornece modos interactive, print/JSON, RPC e SDK, permitindo essa evolução incremental. citeturn428383search3turn428383search0

---

# 5.27 Caminho para Cloud

## 5.27.1 O que permanece

- Domain Model;
- contracts;
- criteria;
- policies;
- Standards;
- Golden Paths;
- Claims;
- Receipts;
- Verdicts;
- Evidence Bundles;
- API semantics.

## 5.27.2 O que muda

| Local | Cloud |
|---|---|
| SQLite | PostgreSQL |
| local filesystem | object storage |
| local Agent Runtime execution | remote Agent Runtime execution |
| local workspace realization | remote workspace provisioner |
| local credentials | scoped secret service |
| CLI | API + web client |
| local event table | outbox + queue/stream |
| one operator | users/teams/tenants |
| WSL2 | sandboxed compute |

## 5.27.3 Evolução segura

Cloud só começa depois de:

- local product flow comprovado;
- multiple Tracks;
- recovery;
- quality gates;
- clear authority boundaries;
- measured need.

---

# 5.28 Estrutura de código inicial recomendada

```text
src/
├── domain/
│   ├── identity/
│   ├── mission/
│   ├── planning/
│   ├── criteria/
│   ├── execution/
│   ├── evidence/
│   ├── review/
│   ├── integration/
│   ├── qa/
│   ├── decisions/
│   └── engineering/
│
├── application/
│   ├── project/
│   ├── mission/
│   ├── planning/
│   ├── execution/
│   ├── verification/
│   ├── integration/
│   ├── recovery/
│   └── closeout/
│
├── infrastructure/
│   ├── sqlite/
│   ├── filesystem/
│   ├── git/
│   ├── process/
│   ├── agent-runtime/
│   ├── sandbox/
│   ├── environments/
│   ├── credentials/
│   ├── effects/
│   ├── telemetry/
│   ├── evaluation/
│   ├── notifications/
│   ├── workspace/
│   ├── lavish/
│   ├── herdr/
│   └── browser/
│
├── interfaces/
│   ├── cli/
│   └── runtime-extension/
│
└── index.ts
```

## Regra YAGNI

Não criar todos esses diretórios vazios agora.

A estrutura representa boundaries.

Diretórios surgem quando o código correspondente existe.

---

# 5.29 Dependency Rules

```text
domain
→ não depende de application, infrastructure ou interfaces

application
→ depende de domain e ports

infrastructure
→ implementa ports; depende de domain types quando necessário

interfaces
→ dependem de application

adapters externos
→ nunca são importados pelo domain
```

Essas regras devem virar Fitness Functions quando a estrutura justificar.

---

# 5.30 Release e Versionamento

## MNFS Core

Semver.

## Engineering Standards

Versionados individualmente.

## Golden Paths

Versionados individualmente.

## Repository Profile

Versionado no Git.

## Mission Contract

Hash de conteúdo.

## Context Pack

Hash de inputs e output.

## Adapter compatibility

Versões e capabilities detectadas por `doctor`.

## Regra

Update do MNFS não pode reinterpretar silenciosamente:

- contrato aprovado;
- Claim existente;
- Verdict anterior;
- Standard version usada.

---

# 5.31 Non-goals arquiteturais

Não construir agora:

- microservices;
- daemon central;
- Redis;
- message broker;
- workflow engine;
- plugin marketplace próprio;
- cloud control plane;
- remote execution;
- generic adapter framework;
- dependency injection container;
- DSL de Standards;
- Graph database;
- universal knowledge base;
- custom terminal multiplexer;
- custom mutable-workspace manager;
- custom browser review server;
- abstraction para todo provider existente.

---

# 5.32 Invariantes arquiteturais

1. Domain Core não importa adapters externos.
2. CLI não contém regra de negócio.
3. Skills não alteram state diretamente.
4. Agent Runtime and Runtime Session state are not source of truth.
5. SQLite não armazena código.
6. Git não armazena state operacional transitório.
7. Herdr não decide lifecycle MNFS.
8. Workspace realizations do not decide domain ownership.
9. Lavish não aprova por conta própria.
10. Process exit não fecha trabalho.
11. Adapter failure não corrompe Domain State.
12. Operação externa e DB são reconciliáveis.
13. Cada efeito externo possui identity e idempotency quando necessário.
14. Artefato decisivo possui hash.
15. Worker executa em cwd explicitamente validado.
16. Prompt grande via artifact, não inline shell.
17. Secrets não entram em Context Pack.
18. Interface humana e JSON usam o mesmo use case.
19. Local architecture permanece substituível sem abstração prematura.
20. Cloud não dita complexidade antes do local proof.

---

# Decisão resumida da Seção 5

> **O MNFS começa como um modular monolith TypeScript no WSL2. O Thin Sovereign Semantic Kernel, Application Services e Engineering System definem a semântica; SQLite guarda estado operacional; Git guarda código e result identity; Agent Runtime, isolated mutable workspace, Execution Environment e presentation surfaces são realizations substituíveis selecionadas por Evidence. Adapters e UIs permanecem clientes finos do mesmo core. Nenhuma infraestrutura distribuída ou provider framework é construída antes de um consumidor/proof concreto exigir.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current Role and Authority rules

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Role authority belongs to MNFS identities, not runtime Sessions. Planner, Investigator, Writer, Reviewer/Validator, Integrator and QA receive role-specific compiled packs with current Authority, target, proof and effect boundaries.

**Validator does not receive write authority by default**. The Writer implements and produces a Claim; independent verification/validation produces Receipts and Findings; only the governed MNFS Gate or explicitly authorized Operator transition may accept where policy assigns that authority.

Fresh Actor orientation and structured handoff must be sufficient without the previous conversation. Session continuity is an optimization only.

---

# 6. Papéis, Autoridades, Decisões Humanas e Modelo de Autonomia

## 6.1 Propósito

Esta seção define quem pode:

- propor;
- decidir;
- executar;
- verificar;
- aceitar;
- escalar;
- cancelar;
- corrigir;
- integrar;
- encerrar.

O objetivo é impedir que:

- um worker altere escopo;
- um reviewer crie trabalho novo;
- um Lead implemente e aprove o próprio diff;
- um processo externo se torne autoridade;
- uma sessão longa acumule poderes demais;
- decisões humanas sejam escondidas em prosa;
- agentes façam perguntas duplicadas ao operador;
- uma ferramenta mecânica tome decisões de produto;
- um modelo “mais forte” seja tratado como autoridade apenas por ser mais capaz.

No MNFS:

> **Capacidade de raciocínio não concede autoridade.**

Autoridade é definida pelo papel, pelo contrato e pela política vigente.

---

# 6.2 Distinções fundamentais

## 6.2.1 Actor

Actor é quem realiza uma ação.

Exemplos:

```text
operator:leandro
lead:WR-001
worker:WR-004
reviewer:WR-007
runner:mnfs
integrator:INT-003
```

## 6.2.2 Role

Role define responsabilidades e limites.

Exemplos:

- Operator;
- MNFS Lead;
- Planner;
- Investigator;
- Writer Worker;
- Reviewer;
- Verification Runner;
- Integrator;
- QA Actor.

## 6.2.3 Session

Session é um contexto conversacional ou de execução.

Uma Role pode sobreviver à perda de uma Session.

Exemplo:

```text
MNFS Lead role
├── Runtime Session S-001
└── Runtime Session S-002 após restart
```

## 6.2.4 Process

Process é uma instância operacional do sistema.

Pode hospedar:

- uma Session;
- um worker;
- um runner;
- uma integração;
- um QA actor.

Process não é Role.

## 6.2.5 Authority

Authority define qual decisão um Actor pode registrar validamente.

## 6.2.6 Permission

Permission define quais operações técnicas o Actor pode executar.

Authority e Permission não são equivalentes.

Exemplo:

```text
Worker possui permissão de escrever apenas no isolated mutable workspace autorizado.
Worker não possui autoridade para aceitar o próprio Claim.
```

---

# 6.3 Princípio do único liaison

O operador conversa diretamente apenas com o **MNFS Lead**.

```text
Operator
   ↓
MNFS Lead
   ├── Planner
   ├── Investigator
   ├── Writer Worker
   ├── Reviewer
   ├── Verification Runner
   ├── Integrator
   └── QA Actor
```

## 6.3.1 Razões

Um único liaison:

- reduz interrupções;
- evita perguntas duplicadas;
- preserva coerência;
- traduz detalhes técnicos;
- filtra ruído;
- consolida alternativas;
- mantém autoridade clara;
- reduz contexto exigido do operador;
- evita competição entre agentes por atenção.

## 6.3.2 Exceções

Outro Actor só pode interagir diretamente com o operador quando:

- o Lead delega explicitamente uma entrevista especializada;
- uma interface visual conduz uma decisão estruturada;
- o operador solicita contato direto;
- uma emergência exige confirmação imediata.

Mesmo nesses casos:

- o resultado vira Decision ou Artifact;
- o Lead recebe a referência;
- o estado não depende da conversa paralela.

## 6.3.3 Regra

Workers nunca bloqueiam o sistema esperando resposta direta do operador.

Eles escalam ao Lead.

---

# 6.4 Operator

## 6.4.1 Definição

Operator é a autoridade humana final sobre produto, risco, escopo e irreversibilidade.

## 6.4.2 Pode decidir

- objetivo da Mission;
- outcome esperado;
- escopo incluído;
- escopo excluído;
- aprovação do contrato;
- mudança material do contrato;
- prioridade;
- orçamento;
- risco aceito;
- breaking change;
- operação destrutiva;
- uso de ambiente real sensível;
- produção;
- cancelamento da Mission;
- Waiver de alto impacto;
- encerramento incompleto;
- trade-off de produto.

## 6.4.3 Pode autorizar

- push;
- merge final;
- deploy;
- migration destrutiva;
- escrita em produção;
- envio de dados;
- rotação de secrets;
- nova dependência material;
- ação irreversível.

A necessidade de autorização é definida pelo Repository Profile e pela política da Mission.

## 6.4.4 Não precisa fazer

- escolher worker;
- escrever prompts;
- abrir isolated mutable workspaces;
- executar testes;
- reconciliar estado;
- interpretar logs;
- revisar todos os diffs;
- administrar terminais;
- lembrar comandos internos;
- decidir detalhes locais de implementação.

## 6.4.5 Obrigações do MNFS com o Operator

Toda solicitação de decisão deve apresentar:

```text
question
why now
options
recommendation
impact
risk
blocked entities
default if no decision
```

Nunca apresentar apenas:

> “O que você quer fazer?”

## 6.4.6 Direito de interrupção

Operator pode:

- pausar;
- cancelar;
- pedir status;
- pedir evidência;
- exigir review adicional;
- trocar prioridade;
- rejeitar recomendação;
- solicitar Replan.

Essas ações precisam virar estado estruturado.

---

# 6.5 MNFS Lead

## 6.5.1 Definição

MNFS Lead é o liaison e coordenador principal da Mission.

É um papel de governança, não um super-worker.

## 6.5.2 Responsabilidades

- entender intenção;
- conduzir Intake;
- coordenar Planning;
- consolidar investigações;
- apresentar decisões;
- manter o Operator informado;
- resolver dependências;
- preparar execução;
- selecionar lanes;
- despachar Actors;
- acompanhar estado;
- detectar blockers;
- iniciar Recovery;
- adjudicar conflitos permitidos;
- coordenar Integration;
- conduzir Closeout.

## 6.5.3 Pode decidir

Dentro do contrato:

- ordem de execução;
- alocação de workers;
- seleção entre Golden Paths equivalentes;
- retry permitido;
- reuso de isolated mutable workspace;
- escalada de risco;
- pedido de review;
- investigação adicional;
- pausa técnica;
- resolução de conflito operacional;
- prioridade entre Tracks não conflitantes.

## 6.5.4 Não pode decidir sozinho

- alterar objetivo;
- alterar escopo material;
- remover Acceptance Criterion;
- reduzir um `MUST`;
- aceitar risco de produto;
- aprovar breaking change;
- ignorar gate decisivo;
- realizar operação irreversível sem autoridade;
- encerrar Mission incompleta;
- aprovar o próprio grande diff.

## 6.5.5 Não deve fazer

- implementar grandes Features;
- editar múltiplas superfícies por conveniência;
- revisar trabalho que ele próprio implementou;
- absorver debugging detalhado;
- ler logs completos quando um Actor pode resumir;
- carregar todo o contexto de todos os workers;
- esconder unknowns;
- transformar recomendação em Decision sem autoridade.

## 6.5.6 Trabalho direto permitido

O Lead pode realizar ações pequenas e mecânicas quando delegar seria mais caro e não criaria conflito de autoridade.

Exemplos:

- registrar uma Decision já formulada;
- atualizar tracking;
- corrigir typo;
- executar status;
- chamar Application Service;
- criar referência;
- consolidar output estruturado.

Se a ação produzir um diff significativo, ela deve virar Write Track.

---

# 6.6 Planner

## 6.6.1 Definição

Planner transforma intenção e evidência em proposta estruturada.

## 6.6.2 Responsabilidades

- decompor Mission;
- identificar Milestones;
- definir Features;
- formular Acceptance Criteria;
- mapear dependencies;
- propor ownership;
- identificar riscos;
- levantar assumptions;
- identificar questions;
- sugerir Golden Paths;
- mapear Engineering Standards;
- construir Verification Plan.

## 6.6.3 Pode propor

- arquitetura;
- contratos;
- decomposição;
- alternativas;
- ordem;
- risco;
- critérios;
- Safety Nets;
- Waivers candidatas.

## 6.6.4 Não pode

- aprovar o próprio plano;
- responder silenciosamente questão de produto;
- tornar assumption fato;
- iniciar workers;
- alterar código;
- registrar contrato aprovado;
- eliminar risco apenas por opinião.

## 6.6.5 Independência

Planner pode ser:

- o próprio Lead;
- Actor especializado via Agent Runtime;
- outro modelo;
- combinação de investigadores;
- co-planner independente.

Independência adicional é usada quando:

- arquitetura é material;
- escopo é grande;
- risco é alto;
- incerteza é relevante.

---

# 6.7 Investigator

## 6.7.1 Definição

Investigator produz conhecimento verificável.

## 6.7.2 Modos

```text
REPOSITORY_SCOUT
TECHNOLOGY_RESEARCH
BUG_REPRODUCTION
ARCHITECTURE_DISCOVERY
DEPENDENCY_ANALYSIS
OPERABILITY_INSPECTION
```

## 6.7.3 Responsabilidades

- responder pergunta delimitada;
- buscar fontes;
- distinguir fato de inferência;
- registrar evidence refs;
- reportar unknowns;
- evitar solução prematura.

## 6.7.4 Pode

- ler código;
- executar comandos read-only;
- rodar reproduções autorizadas;
- consultar documentação;
- produzir mapas;
- sugerir opções.

## 6.7.5 Não pode

- implementar por padrão;
- alterar contrato;
- aceitar risco;
- modificar state;
- extrapolar sem marcar inference;
- esconder falta de evidência.

## 6.7.6 Termination condition

Toda Investigation Track precisa de:

- pergunta;
- budget;
- exit criteria.

Investigação não pode se tornar exploração indefinida.

---

# 6.8 Writer Worker

## 6.8.1 Definição

Writer Worker produz uma mudança dentro de uma Write Track.

## 6.8.2 Responsabilidades

- validar dispatch packet;
- validar contract hash;
- trabalhar no cwd correto;
- respeitar write-set;
- seguir Golden Path;
- cumprir Engineering Standards;
- executar verificações locais;
- preservar evidência;
- escalar bloqueios;
- emitir Claim.

## 6.8.3 Pode decidir

Somente decisões locais compatíveis com o contrato.

Exemplos:

- nome de função;
- organização interna;
- helper local;
- ordem de pequenos passos;
- refactor necessário dentro do escopo.

## 6.8.4 Precisa escalar

- escrita fora do write-set;
- nova dependência;
- mudança de contrato;
- mudança de schema não planejada;
- scope expansion;
- risco não previsto;
- impossibilidade técnica;
- conflito de ownership;
- ambiente incorreto;
- regra `MUST` incompatível;
- necessidade de Waiver.

## 6.8.5 Nunca pode

- aceitar o próprio Claim;
- fechar Feature;
- fechar Milestone;
- alterar Approved Contract;
- editar SQLite;
- liberar Lease por conta própria;
- fazer push;
- fazer deploy;
- ocultar teste não executado;
- reportar assumption como pass;
- substituir integração real por mock escondido.

## 6.8.6 Completion protocol

Worker termina sua responsabilidade quando:

- código está identificável;
- evidence refs existem;
- Claim foi registrado;
- status `COMPLETED_BY_WORKER` foi aceito pelo MNFS.

Ele pode permanecer `IDLE` e addressable para Correction.

---

# 6.9 Reviewer

## 6.9.1 Definição

Reviewer realiza julgamento independente sobre trabalho produzido.

## 6.9.2 Independência

Reviewer não pode ser:

- o mesmo Worker Run;
- a mesma Session que implementou;
- o Lead quando o Lead implementou o diff;
- um contexto contaminado por defesa da solução.

## 6.9.3 Responsabilidades

- verificar arquitetura;
- verificar correção;
- verificar simplicidade;
- verificar testes;
- verificar contracts;
- confirmar findings;
- registrar receipts de investigação;
- emitir Verdict dentro do escopo.

## 6.9.4 Pode

- expandir reads para confirmar;
- abrir Finding;
- aprovar;
- rejeitar;
- bloquear;
- marcar speculative;
- pedir evidência adicional.

## 6.9.5 Não pode

- implementar correção;
- gerar novo escopo;
- mudar Acceptance Criterion;
- escolher preferência pessoal como regra;
- bloquear por estilo mecânico;
- aceitar operação de produto;
- resolver finding sem nova evidência.

## 6.9.6 Review authority

Reviewer decide somente o target atribuído:

```text
Claim
Feature
Milestone
Integration Run
```

O Verdict não ultrapassa esse target.

---

# 6.10 Verification Runner

## 6.10.1 Definição

Verification Runner executa checks determinísticos.

## 6.10.2 Natureza

É uma autoridade mecânica, não uma persona.

## 6.10.3 Responsabilidades

- executar comando exato;
- usar cwd correto;
- fixar environment;
- capturar output;
- produzir Receipt;
- reportar timeout;
- preservar SHA;
- mapear resultado.

## 6.10.4 Não pode

- interpretar arquitetura;
- aceitar risco;
- ignorar failure;
- mudar comando;
- corrigir código;
- inventar fallback;
- converter unknown em pass.

## 6.10.5 Deterministic authority

Quando um Standard possui check confiável:

```text
runner result
→ autoridade sobre aquela propriedade específica
```

Reviewer não pode invalidar arbitrariamente um pass mecânico.

Pode contestar:

- applicability;
- qualidade do check;
- cobertura;
- staleness;
- binding incorreto.

---

# 6.11 Integrator

## 6.11.1 Definição

Integrator compõe Write Tracks aceitas.

## 6.11.2 Responsabilidades

- preparar workspace limpo;
- verificar base;
- aplicar Tracks;
- registrar ordem;
- resolver conflitos autorizados;
- executar checks compostos;
- produzir candidate SHA;
- preservar sources.

## 6.11.3 Pode

- escolher ordem dentro da política;
- resolver conflito mecânico;
- rejeitar Track incompatível;
- abrir Finding de composição;
- exigir Rebase.

## 6.11.4 Não pode

- redefinir comportamento;
- modificar contrato;
- mascarar conflito;
- realizar refactor amplo;
- corrigir Feature sem Correction;
- destruir isolated mutable workspace de origem;
- integrar Track não aceita.

## 6.11.5 Conflict classes

### Mechanical conflict

Pode ser resolvido pelo Integrator quando:

- intenção é inequívoca;
- não altera comportamento;
- policy permite;
- diff é pequeno;
- verificação cobre.

### Semantic conflict

Precisa retornar para:

- Lead;
- Worker;
- Planner;
- Operator.

---

# 6.12 QA Actor

## 6.12.1 Definição

QA Actor valida comportamento como usuário, operador ou consumidor.

## 6.12.2 Responsabilidades

- seguir Journey;
- observar comportamento;
- registrar evidência;
- não presumir implementação;
- capturar falhas;
- emitir resultado.

## 6.12.3 Pode

- usar browser;
- usar API;
- operar ambiente;
- observar logs relevantes;
- registrar screenshots e traces;
- abrir Finding.

## 6.12.4 Não pode

- corrigir durante a mesma passagem;
- ler primeiro a justificativa do implementador;
- aprovar por aparência do código;
- substituir Journey real por mock;
- alterar critérios;
- aceitar risk.

## 6.12.5 Freshness

QA Journey sempre se vincula ao candidate SHA e ao ambiente.

Novo SHA material invalida o resultado afetado.

---

# 6.13 Engineering System Maintainer

## 6.13.1 Definição

Papel responsável por evoluir Standards, Golden Paths e Fitness Functions.

Inicialmente pode ser exercido pelo Lead com aprovação do Operator.

## 6.13.2 Responsabilidades

- analisar Findings recorrentes;
- propor Standards;
- pilotar checks;
- medir falsos positivos;
- evoluir Golden Paths;
- deprecar regras;
- acompanhar Waivers;
- atualizar Quality Posture.

## 6.13.3 Não pode

- transformar preferência em `MUST`;
- criar gate sem failure mode;
- aplicar regra retroativamente sem migração;
- esconder custo;
- ignorar bypasses;
- manter Standard sem owner ou rationale.

---

# 6.14 Model e Provider Resolver

## 6.14.1 Definição

Componente de policy que escolhe runtime, provider, modelo e effort adequados.

Não é uma autoridade de produto.

## 6.14.2 Inputs

- Role;
- risk;
- complexity;
- context size;
- tool requirements;
- budget;
- provider availability;
- prior performance.

## 6.14.3 Output

```text
runtime
provider
model
effort
limits
fallbacks
```

## 6.14.4 Regras

- nenhuma matriz fixa de modelos na Constitution;
- effort explícito quando suportado;
- fallback preserva Role e gate;
- modelo indisponível não reduz qualidade silenciosamente;
- trocar provider não altera autoridade.

---

# 6.15 Modelo de autonomia

Autonomia não é binária.

Cada ação possui um nível.

## 6.15.1 Nível A0 — Observe

Actor pode:

- ler;
- inspecionar;
- medir;
- reportar.

Não pode escrever.

Exemplos:

- Investigator;
- Reviewer read-only;
- status;
- architecture scan.

## 6.15.2 Nível A1 — Propose

Actor pode produzir:

- plano;
- opção;
- diff sugerido;
- Decision recommendation;
- Standard candidate.

Não pode aplicar.

## 6.15.3 Nível A2 — Execute Reversible

Actor pode executar ação reversível e isolada.

Exemplos:

- editar isolated mutable workspace;
- criar branch;
- rodar testes;
- gerar artefato;
- iniciar worker;
- abrir Claim.

## 6.15.4 Nível A3 — Advance Governed State

Actor pode alterar estado MNFS quando preconditions mecânicas são satisfeitas.

Exemplos:

- salvar Plan Revision;
- ativar Lease;
- marcar Claim under verification;
- registrar Receipt;
- aceitar deterministic criterion.

Essa autoridade normalmente pertence a Application Services.

## 6.15.5 Nível A4 — Approve Material Change

Exige autoridade de Lead, Gate ou Operator.

Exemplos:

- aceitar Claim;
- aprovar Plan;
- aceitar Waiver;
- fechar Feature;
- aceitar Integration Run.

## 6.15.6 Nível A5 — Irreversible / External Impact

Exige checkpoint explícito adequado.

Exemplos:

- push;
- deploy;
- produção;
- exclusão;
- migration destrutiva;
- envio externo;
- gasto relevante;
- mudança de contrato público.

## 6.15.7 Regra

O Role define o teto.

A Mission e o Repository Profile podem reduzir esse teto.

Nunca aumentar silenciosamente.

---

# 6.16 Autonomia por risco

## Baixo risco

MNFS pode:

- planejar lane mínima;
- executar worker;
- rodar checks;
- aceitar deterministic criteria;
- fechar Feature local;
- preparar integração.

Operator é chamado somente para:

- produto;
- irreversibilidade;
- exceção.

## Médio risco

Exige:

- review independente;
- Acceptance Criteria claros;
- evidência;
- Lead acompanha;
- Operator em trade-offs materiais.

## Alto risco

Exige:

- Planning aprofundado;
- decisões explícitas;
- gate independente;
- QA;
- safety nets;
- checkpoints humanos;
- delivery controlado.

## Unknown

Default conservador temporário.

A investigação deve reduzir unknown.

---

# 6.17 Modelo de decisões

## 6.17.1 D0 — Mechanical

Decisão totalmente determinística.

Exemplo:

```text
schema inválido
→ rejeitar
```

Authority:

```text
MNFS Core / Runner
```

## 6.17.2 D1 — Local Implementation

Não altera contrato.

Exemplos:

- nome interno;
- helper;
- pequena estrutura;
- algoritmo equivalente.

Authority:

```text
Writer Worker
```

## 6.17.3 D2 — Execution Coordination

Altera ordem ou estratégia operacional sem alterar outcome.

Exemplos:

- reusar isolated mutable workspace;
- trocar Worker Run;
- serializar Track;
- executar investigation;
- elevar review.

Authority:

```text
MNFS Lead
```

## 6.17.4 D3 — Engineering Trade-off

Escolha arquitetural dentro do escopo aprovado.

Exemplos:

- usar alternativa técnica;
- criar adapter;
- alterar internal contract;
- aceitar complexidade adicional.

Authority:

```text
Lead
+
Operator quando material
+
ADR quando durável
```

## 6.17.5 D4 — Product / Contract

Altera:

- behavior;
- escopo;
- Acceptance Criterion;
- contrato público;
- user journey;
- risco aceito.

Authority:

```text
Operator
```

## 6.17.6 D5 — Irreversible / External

Produz impacto externo difícil de reverter.

Authority:

```text
Operator ou autoridade configurada
```

---

# 6.18 Decision Request Contract

Toda Decision Request possui:

```ts
interface DecisionRequest {
  id: DecisionId;
  level: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
  question: string;
  contextRefs: ArtifactRef[];
  options: DecisionOption[];
  recommendation?: string;
  impact: string[];
  risk: string[];
  blocks: EntityReference[];
  requiredAuthority: ActorRole;
  defaultAction: 'PAUSE' | 'BLOCK' | 'USE_SAFE_DEFAULT' | 'CANCEL';
}
```

## 6.18.1 Boa solicitação

```text
Precisamos escolher como versionar o endpoint público.

A. Criar /v2 agora
   Impacto: novo client e documentação.
   Risco: baixo para consumers atuais.

B. Alterar /v1
   Impacto: quebra clients existentes.
   Risco: alto.

Recomendação: A.
Bloqueia: MIS-010/M02/F03.
```

## 6.18.2 Solicitação inválida

```text
Qual abordagem você prefere?
```

Sem:

- contexto;
- opções;
- impacto;
- recomendação;
- blocker.

---

# 6.19 Escalation Flow

```text
Actor encontra bloqueio
        ↓
classifica Decision Level
        ↓
persiste Decision Request
        ↓
entidades afetadas ficam BLOCKED
        ↓
Lead recebe notificação
        ↓
Lead resolve D1/D2
ou
Operator resolve D3/D4/D5 conforme policy
        ↓
Decision registrada
        ↓
Context Packs afetados ficam stale
        ↓
retomada ou Replan
```

## 6.19.1 Regra de bloqueio

Somente entidades afetadas são bloqueadas.

Tracks independentes continuam.

## 6.19.2 Timeout

Decision humana não expira automaticamente.

Status mostra:

- idade;
- impacto;
- blocked entities;
- next action.

---

# 6.20 Authority Matrix

| Ação | Worker | Reviewer | Runner | Integrator | Lead | Operator |
|---|---:|---:|---:|---:|---:|---:|
| Ler contrato | Sim | Sim | Sim | Sim | Sim | Sim |
| Alterar isolated mutable workspace | Sim | Não | Não | Só integração | Limitado | Não |
| Criar Claim | Solicita | Não | Não | Não | Pode coordenar | Não |
| Produzir Receipt | Não autoritativo | Não | Sim | Sim para integração | Não | Não |
| Abrir Finding | Pode reportar | Sim | Sim mecânico | Sim | Sim | Sim |
| Aceitar Claim | Não | Pode recomendar | Só critério mecânico | Não | Conforme gate | Não diretamente |
| Alterar contrato | Não | Não | Não | Não | Propõe | Aprova |
| Criar Waiver | Propõe | Propõe | Não | Propõe | Propõe | Aprova quando exigido |
| Fazer merge | Não | Não | Não | Prepara | Autoriza/executa conforme profile | Pode exigir checkpoint |
| Fazer deploy | Não | Não | Não | Não | Solicita | Autoriza |
| Fechar Feature | Não | Não | Não | Não | Via MNFS gate | Pode intervir |
| Fechar Mission | Não | Não | Não | Não | Prepara | Autoriza quando exigido |
| Cancelar Mission | Não | Não | Não | Não | Recomenda | Sim |

---

# 6.21 Separation of Duties

## 6.21.1 Implementer ≠ Reviewer

Obrigatório quando julgamento independente é parte do gate.

## 6.21.2 Planner ≠ Approver

Planner propõe.

Operator aprova o contrato.

## 6.21.3 Worker ≠ Gate

Worker Claims.

MNFS verifica.

## 6.21.4 Integrator ≠ Feature Implementer

Integrator não corrige semanticamente.

## 6.21.5 QA ≠ Corrector

QA observa.

Correction é outro ciclo.

## 6.21.6 Runner ≠ Policy Author

Runner executa bindings.

Standards e applicability vêm do Engineering System.

---

# 6.22 Bounded Delegation

Toda delegação possui:

```text
role
target
allowed actions
forbidden actions
inputs
outputs
budget
termination condition
escalation path
```

Exemplo:

```text
Role: Writer Worker
Target: MIS-010/M02/F03 / WT-004
Allowed: editar src/api/** e tests/api/**
Forbidden: migrations/**, push, contract changes
Output: Claim + commit
Budget: 45 min / configured token budget
Escalation: MNFS Lead
```

## 6.22.1 Regra

Prompt genérico como:

> “Implemente esta Feature e faça o que for necessário”

é inválido para dispatch.

---

# 6.23 Capability Tokens conceituais

MNFS pode representar autorização como capabilities estruturadas.

Exemplos:

```text
READ_REPOSITORY
WRITE_TRACK
RUN_TESTS
OPEN_CLAIM
REQUEST_DECISION
APPLY_INTEGRATION
USE_BROWSER
USE_NETWORK_READ
USE_PROVIDER_SANDBOX
REQUEST_CREDENTIAL
REQUEST_EXTERNAL_EFFECT
EXECUTE_APPROVED_EFFECT
```

No MVP local, isso pode ser policy, não sandbox real.

No cloud, capabilities poderão se tornar enforcement técnico.

---

# 6.24 Human Checkpoints

## Obrigatórios quando aplicável

- contrato aprovado;
- scope change;
- breaking API;
- migration destrutiva;
- production access;
- gasto relevante;
- data export;
- security waiver;
- accepted risk;
- Mission cancellation;
- incomplete closeout.

## Não obrigatórios por default

- retry local;
- escolha de worker;
- execução de testes;
- criação de isolated mutable workspace;
- correção pequena;
- review adicional;
- integração local reversível.

O objetivo é preservar soberania humana sem transformar o Operator em scheduler.

---

# 6.25 Model Independence

Role não é modelo.

```text
Writer Worker
≠ GPT específico

Reviewer
≠ Claude específico

Planner
≠ modelo frontier específico
```

## Regras

- modelo é binding;
- provider é binding;
- effort é binding;
- authority vem do Role;
- fallback preserva o mesmo contrato;
- troca de modelo é registrada quando relevante;
- políticas podem evoluir com telemetria.

---

# 6.26 Política de memória por Role

| Role | Session Observational Memory | Política inicial |
|---|---|---|
| MNFS Lead | Candidata | habilitar somente após Architecture Spike |
| Planner | Opcional | apenas dentro da mesma fase de Planning |
| Investigator | Desligada por default | produzir Artifact e encerrar |
| Writer Worker | Desligada por default | Context Pack bounded é a fonte |
| Long-running Writer | Condicional | somente para Track longa e isolada |
| Reviewer — primeiro pass | Desligada | preservar independência |
| Reviewer — remedy pass | Reuso da mesma Session | somente mesmo Finding e delta limitado |
| Integrator | Desligada | execução curta e determinística |
| QA Actor | Desligada/fresh | evitar implementation bias |
| Closeout Actor | Opcional | agregação estruturada domina |

Nunca compartilhar a mesma memória observacional entre Lead e Writer, Workers paralelos, Writer e Reviewer, Reviewer e QA ou Missions diferentes.

Memória observacional é contexto `SUPPORTING`.

Não concede Authority nem Permission.

# 6.28 Session Lifecycle

## Lead Session

Pode ser longa, mas é descartável.

Rotação permitida por:

- Milestone;
- contexto;
- falha;
- atualização;
- solicitação do Operator.

## Worker Session

Pode permanecer após Claim para Correction.

Estado:

```text
ACTIVE
IDLE_ADDRESSABLE
RELEASED
LOST
```

## Reviewer Session

Round inicial deve ser independente.

Remedy re-review pode reutilizar contexto quando:

- é o mesmo Finding;
- é o mesmo target;
- o delta é limitado;
- policy permite.

## QA Session

Fresh por Journey decisiva, salvo continuação operacional controlada.

---

# 6.28 Failure of Authority

## Unauthorized action

Se Actor tenta ação fora da autoridade:

```text
AUTHORITY_DENIED
```

Sem mudança de estado.

## Permission exists, authority absent

Exemplo:

Worker consegue executar `git push`, mas não está autorizado.

A Harness deve:

- evitar fornecer a capability;
- detectar quando possível;
- registrar violation;
- bloquear aceite.

## Authority exists, environment unavailable

Exemplo:

Operator aprovou deploy, mas credentials ausentes.

Resultado:

```text
BLOCKED
```

Não:

```text
APPROVED_AND_DONE
```

---

# 6.29 Emergency Override

## 6.28.1 Propósito

Permitir intervenção quando a Harness bloqueia incorretamente ou uma emergência exige avanço.

## 6.28.2 Authority

Operator.

## 6.28.3 Conteúdo

```text
target
blocked rule
reason
scope
temporary controls
expected repair
expires
```

## 6.28.4 Regra

Override:

- não apaga evidência;
- não finge que gate passou;
- não é permanente;
- aparece no closeout;
- pode gerar Standard correction.

---

# 6.30 Autonomy Budget

Além de tokens e tempo, uma execução possui orçamento de autonomia.

Pode limitar:

- número de Attempts;
- número de arquivos;
- duração;
- tool calls;
- external writes;
- review rounds;
- retries;
- decisões locais;
- scope expansion.

Exemplo:

```json
{
  "maxAttempts": 2,
  "maxFiles": 8,
  "externalWrites": false,
  "allowDependencyChange": false,
  "allowSchemaChange": false,
  "operatorCheckpointOn": [
    "breaking-contract",
    "destructive-migration"
  ]
}
```

Budget excedido não implica failure técnico.

Implica:

```text
BLOCKED
→ Lead ou Operator decide
```

---

# 6.31 Operator Experience

O Operator deve receber:

## Status

```text
MIS-010 executing
3/7 Features closed
2 Tracks active
1 Claim awaiting review
1 Decision blocking M03
next: approve DEC-004
```

## Decision

Curta, estruturada e recomendada.

## Completion

```text
Outcome
What changed
What was verified
What remains
Risks
Evidence
Delivery
```

## Nunca receber por default

- transcript integral;
- logs completos;
- raciocínio interno;
- mensagens de cada worker;
- detalhes mecânicos irrelevantes;
- decisões já cobertas por policy.

---

# 6.32 Role Contracts como código e artefato

Cada Role deve possuir:

- schema de input;
- schema de output;
- allowed actions;
- forbidden actions;
- error model;
- escalation path;
- evidence requirements.

Parte será código.

Parte será skill ou template.

Exemplo:

```text
Writer Worker Contract
├── dispatch schema
├── Context Pack
├── Claim schema
├── authority policy
├── runtime skill/template
└── process adapter
```

A skill explica.

A policy limita.

O schema valida.

O Application Service autoriza.

---

# 6.33 Non-goals do modelo de autonomia

Não construir agora:

- RBAC multiuser completo;
- OAuth próprio;
- sandbox de capability;
- permission broker;
- policy engine externo;
- aprovação por múltiplas pessoas;
- organization hierarchy;
- compliance workflow;
- autonomous product decisions;
- swarm democrático;
- votação entre modelos;
- authority baseada em confidence score;
- agentes negociando diretamente com o Operator.

---

# 6.34 Invariantes de autoridade

1. Capacidade de raciocínio não concede autoridade.
2. Operator é autoridade final de produto e risco.
3. Lead é liaison único.
4. Workers não falam diretamente com o Operator por default.
5. Worker não aceita o próprio Claim.
6. Planner não aprova o próprio contrato.
7. Reviewer não corrige no mesmo ciclo.
8. QA não corrige durante a Journey.
9. Runner não faz julgamento.
10. Integrator não redefine comportamento.
11. Role é independente de modelo.
12. Session é descartável.
13. Permission técnica não implica Authority.
14. Ação fora de autoridade falha sem mudança de estado.
15. Decision material é persistida.
16. Pergunta ao Operator contém opções e recomendação.
17. Apenas entidades afetadas bloqueiam.
18. Override é auditável e temporário.
19. Autonomy Budget é explícito.
20. Nenhum Actor pode ampliar o próprio poder.

---

# Decisão resumida da Seção 6

> **O MNFS separa rigorosamente Actor, Role, Session, Process, Permission e Authority. O Operator mantém soberania sobre produto, contrato, risco e ações irreversíveis; o MNFS Lead é o único liaison e coordena a Mission; Planners propõem; Investigators produzem fatos; Writer Workers implementam e emitem Claims; Runners produzem Receipts; Reviewers julgam; Integrators compõem; QA Actors validam como usuário. Autonomia é concedida por nível, escopo e budget, nunca inferida da capacidade do modelo.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current Evidence and acceptance rules

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

**Implementer completion never grants acceptance**. Claim, deterministic Receipt, independent Finding/Review and Verdict remain distinct evidence stages.

Proof-first is universal; TDD is required where executable TEST is the correct deciding proof and a meaningful RED state can be established before implementation. Parent Milestone/Mission outcomes still require composition and outcome validation even when every child unit is green.

Evidence bound to the wrong/stale contract, Attempt, policy, environment or Git result identity cannot decide the current target.

---

# 7. Qualidade, Evidência, Gates e Prevenção de False Completion

## 7.1 Propósito

Esta seção define como o MNFS decide se algo está:

- apenas declarado;
- parcialmente provado;
- tecnicamente verificado;
- revisado;
- integrado;
- validado como usuário;
- aceito;
- fechado.

O objetivo é impedir que:

- texto de um agente seja tratado como prova;
- um teste isolado seja tratado como Feature concluída;
- um mock seja tratado como integração real;
- um Receipt antigo continue válido após mudança no código;
- o implementador aprove o próprio trabalho;
- uma Feature verde feche automaticamente a Milestone;
- todas as Milestones verdes fechem automaticamente a Mission;
- indisponibilidade de ambiente seja registrada como sucesso;
- review sem localização produza Findings bloqueantes;
- gates sejam empilhados sem justificativa;
- trabalho incompleto seja promovido porque “parece pronto”.

No MNFS:

> **Qualidade não é uma opinião global, uma nota ou uma sensação de confiança. Qualidade é cobertura de critérios por evidências frescas, produzidas por autoridades apropriadas, no nível correto da hierarquia.**

---

# 7.2 Tese de qualidade

O MNFS não utiliza uma única definição de “pronto”.

Existem estados diferentes:

```text
CODE PRODUCED
→ mudança existe

CLAIMED
→ worker declara que cumpriu

DETERMINISTICALLY VERIFIED
→ checks mecânicos produziram Receipts válidos

REVIEWED
→ julgamento independente avaliou os aspectos necessários

INTEGRATED
→ partes foram compostas em estado identificável

LIVE VALIDATED
→ comportamento foi observado no ambiente e perspectiva exigidos

ACCEPTED
→ autoridade competente emitiu Verdict

CLOSED
→ critérios do nível hierárquico foram satisfeitos e o Evidence Bundle foi consolidado
```

Esses estados não podem ser colapsados.

Exemplo:

```text
Feature code exists
+
unit tests pass
+
worker says done
```

não implica:

```text
Feature accepted
```

Da mesma forma:

```text
all Features accepted
```

não implica:

```text
Milestone closed
```

A Milestone possui critérios próprios de:

- composição;
- interoperabilidade;
- recovery;
- comportamento integrado;
- QA;
- outcome intermediário.

A Mission também possui critérios próprios de resultado global.

---

# 7.3 False Completion

## 7.3.1 Definição

False Completion ocorre quando uma entidade aparenta estar concluída, mas a evidência necessária para seu nível de aceitação não existe, está stale, foi produzida pela autoridade errada ou prova apenas uma parte do resultado.

## 7.3.2 Classes principais

### FC-01 — Narrative Completion

O agente afirma:

> “Concluído.”

Sem Claim estruturado e sem evidência.

### FC-02 — Local Green

Testes locais passam no isolated mutable workspace, mas:

- integração não ocorreu;
- wiring não existe;
- outra Track conflita;
- environment real difere.

### FC-03 — Mock Completion

A implementação passa contra:

- stub;
- fake;
- fixture;
- client simulado;

enquanto o seam real não foi exercitado.

### FC-04 — Stale Evidence

O check foi executado em:

- SHA anterior;
- contrato anterior;
- Profile anterior;
- Standard anterior;
- ambiente diferente.

### FC-05 — Partial Criteria

Alguns Acceptance Criteria passaram, mas o target é tratado como aceito integralmente.

### FC-06 — Child Aggregation Completion

Filhos fecham e o pai é fechado automaticamente sem provar os critérios próprios do pai.

### FC-07 — Self-Graded Completion

Implementer e autoridade de aceite são o mesmo Actor ou contexto contaminado.

### FC-08 — Environment Substitution

Um critério `LIVE` é substituído por teste hermético sem Decision ou Replan.

### FC-09 — Process Completion

Exit code zero, pane `done` ou fim de sessão é tratado como conclusão do domínio.

### FC-10 — Review Theater

Reviewer:

- não leu os inputs corretos;
- não verificou Findings;
- não ancorou loci;
- aprovou por resumo;
- revisou SHA diferente.

### FC-11 — Integration Omission

Backend, frontend, migration ou adapter existem, mas não foram compostos e exercitados.

### FC-12 — Unverified Exception

Uma Waiver ou accepted risk é presumida, mas não existe registro válido.

## 7.3.3 Resposta do MNFS

False Completion deve ser prevenida por:

```text
structured criteria
+
Claim separation
+
runner-owned Receipts
+
authority-bound Verdicts
+
freshness
+
hierarchical closure
+
integration
+
live QA
+
Evidence Bundles
```

---

# 7.4 Acceptance Criterion como contrato executável

## 7.4.1 Obrigatoriedade

Toda:

- Mission;
- Milestone;
- Feature;

possui Acceptance Criteria próprios antes de aprovação e execução.

Um Acceptance Criterion não é apenas uma frase.

Ele é uma unidade de contrato que precisa poder ser:

- identificada;
- interpretada;
- reivindicada;
- verificada;
- aceita;
- rastreada;
- invalidada quando stale.

## 7.4.2 Estrutura conceitual

```ts
interface AcceptanceCriterion {
  id: AcceptanceCriterionId;
  owner:
    | MissionId
    | QualifiedMilestoneId
    | QualifiedFeatureId;

  statement: string;
  rationale?: string;

  proofType:
    | 'STATIC'
    | 'EXECUTABLE'
    | 'LIVE'
    | 'JUDGMENT';

  deciding: boolean;

  proofPlan: {
    method: string;
    environment?: string;
    runner?: string;
    commands?: string[];
    journeyRef?: string;
    reviewerRole?: string;
    expectedEvidence: string[];
  };

  applicability?: {
    condition?: string;
    resolved: boolean;
    result?: boolean;
  };

  state:
    | 'PENDING'
    | 'CLAIMED'
    | 'UNDER_VERIFICATION'
    | 'SATISFIED'
    | 'FAILED'
    | 'BLOCKED'
    | 'SUPERSEDED';

  contractHash: string;
}
```

## 7.4.3 Estados

### PENDING

Critério existe, mas nenhum Claim válido o reivindicou.

### CLAIMED

Um Claim afirma que o critério foi satisfeito.

### UNDER_VERIFICATION

Gates estão avaliando a afirmação.

### SATISFIED

Autoridade apropriada aceitou o critério com evidência válida.

### FAILED

Evidência decisiva demonstra que o critério não foi satisfeito.

### BLOCKED

O critério não pôde ser decidido por:

- ambiente;
- Decision;
- ferramenta;
- dado;
- dependência.

### SUPERSEDED

Uma nova revisão de contrato substituiu o critério.

## 7.4.4 Critério não é dispensado por Waiver

Waiver pode autorizar exceção a um Engineering Standard.

Waiver não apaga Acceptance Criterion.

Se o outcome deixou de ser necessário:

```text
Replan
→ nova Plan Revision
→ nova aprovação
→ critério superseded
```

Não:

```text
waive criterion
→ fingir que Mission cumpriu
```

## 7.4.5 Critérios condicionais

Quando um critério depende de condição:

```text
Se migration destrutiva for necessária,
deve existir backup e restore testado.
```

A condição precisa ser resolvida estruturalmente.

Resultado:

- condição falsa → critério não acionado, com evidência da resolução;
- condição verdadeira → critério obrigatório;
- condição unknown → `BLOCKED`.

Não usar `NOT_APPLICABLE` manual sem rationale.

---

# 7.5 Hierarquia de critérios

## 7.5.1 Feature Criteria

Provam o comportamento delimitado da Feature.

Exemplos:

- erro tipado;
- endpoint;
- validação;
- comportamento local;
- regra de autorização;
- persistência;
- output.

## 7.5.2 Milestone Criteria

Provam que as Features formam uma capacidade coerente.

Exemplos:

- frontend e backend interoperam;
- Lease e Claim sobrevivem a restart;
- migration e aplicação coexistem;
- workflow intermediário funciona;
- duas Tracks integram sem regressão.

## 7.5.3 Mission Criteria

Provam o resultado global do operador.

Exemplos:

- usuário completa a jornada;
- sistema entrega outcome econômico;
- recovery global funciona;
- delivery ocorreu;
- risco bloqueante foi eliminado;
- produto está operável.

## 7.5.4 Regra de não substituição

```text
Feature Criteria
≠ Milestone Criteria

Milestone Criteria
≠ Mission Criteria
```

O MNFS pode derivar status agregado.

Não pode derivar aceitação do pai apenas por contagem de filhos.

---

# 7.6 Verification Plan

## 7.6.1 Definição

Verification Plan liga critérios a métodos de prova.

É compilado durante Planning e refinado na preparação da execução.

## 7.6.2 Conteúdo

```text
criterion
proof type
method
runner
environment
inputs
commands
expected evidence
freshness dimensions
authority
fallback behavior
cost class
```

## 7.6.3 Regras

- nenhum critério sem método de prova;
- nenhum método sem ambiente quando ambiente importa;
- nenhum critério `LIVE` substituído silenciosamente;
- nenhum critério `JUDGMENT` delegado apenas a linter;
- nenhum critério mecânico enviado primeiro a LLM;
- fallback precisa preservar o significado da prova;
- indisponibilidade gera `BLOCKED` ou `ERROR`.

## 7.6.4 Compilação

```text
Approved Contract
+
Repository Profile
+
Engineering Standards
+
Golden Path
+
risk policy
→ Verification Plan
```

---

# 7.7 Evidence Item

## 7.7.1 Definição

Evidence Item é uma unidade imutável de informação usada para decidir um critério ou explicar uma transição.

## 7.7.2 Tipos

```text
COMMAND_OUTPUT
TEST_REPORT
STATIC_ANALYSIS
DIFF
COMMIT
TREE
SCHEMA
SCREENSHOT
TRACE
NETWORK_CAPTURE
LOG_EXCERPT
REVIEW_REPORT
DECISION
ENVIRONMENT_REPORT
PROVIDER_RESPONSE
MIGRATION_REPORT
PERFORMANCE_RESULT
```

## 7.7.3 Provenance obrigatória

Toda Evidence decisiva registra:

```text
producer
produced_at
target
criterion_refs
contract_hash
code_sha_or_tree
environment
tool
tool_version
content_hash
storage_ref
```

Campos não aplicáveis são explícitos.

## 7.7.4 Trust classification

```text
AUTHORITATIVE
SUPPORTING
SELF_REPORTED
EXTERNAL_UNVERIFIED
UNKNOWN
```

### AUTHORITATIVE

Produzida por mecanismo ou Actor autorizado para aquela propriedade.

### SUPPORTING

Ajuda a interpretar, mas não decide sozinha.

### SELF_REPORTED

Produzida pelo implementador.

Pode sustentar Claim, mas não gate independente.

### EXTERNAL_UNVERIFIED

Origem externa ainda não confirmada.

### UNKNOWN

Proveniência ou integridade não pôde ser estabelecida.

## 7.7.5 Memória observacional

Observation ou Reflection produzida por um Session Memory Adapter é classificada, no máximo, como:

```text
SUPPORTING
```

Ela nunca é `AUTHORITATIVE` por si só.

Quando uma memória influencia uma Decision material, o Actor precisa recuperar a origem exata quando disponível, comparar com o Current Authority Snapshot e validar contra o Approved Contract e o estado atual.

Uma memória que afirma “trabalho concluído” não prova Claim aceito, Feature fechada, Milestone concluída ou Mission entregue.

## 7.7.6 Imutabilidade

Evidence identificada por hash não muda.

Se o arquivo muda:

- novo hash;
- novo Evidence Item;
- referências antigas permanecem históricas.

---

# 7.8 Claim

## 7.8.1 Definição

Claim é a declaração estruturada do Writer Worker sobre o resultado de um Attempt.

## 7.8.2 Conteúdo mínimo

```ts
interface Claim {
  id: ClaimId;
  missionId: MissionId;
  milestoneId: MilestoneId;
  featureId: FeatureId;
  writeTrackId: WriteTrackId;
  attemptId: AttemptId;
  workerRunId: WorkerRunId;
  leaseId: LeaseId;

  contractHash: string;
  expectedBaseSha: string;
  resultTreeHash: string;
  resultCommit?: string;

  criteria: Array<{
    criterionId: AcceptanceCriterionId;
    claimedStatus: 'SATISFIED' | 'NOT_SATISFIED' | 'UNKNOWN';
    evidenceRefs: ArtifactRef[];
    commandsReported: string[];
  }>;

  filesTouched: string[];
  decisionsMade: DecisionRef[];
  limitations: string[];
  unknowns: string[];
  writtenAt: string;
}
```

## 7.8.3 Honest Claim

Claim pode declarar:

```text
AC-01 claimed SATISFIED
AC-02 claimed UNKNOWN
AC-03 claimed NOT_SATISFIED
```

Isso é melhor que forçar uma narrativa verde.

## 7.8.4 Regras

- Claim não contém Verdict final;
- Claim referencia critérios exatos;
- Claim referencia result tree;
- Claim lista unknowns;
- Claim lista teste não executado;
- Claim com work fora do write-set é marcado;
- Claim não altera contrato;
- Claim stale não pode ser aceito.

---

# 7.9 Receipt

## 7.9.1 Definição

Receipt é a prova estruturada de que uma verificação específica foi executada contra um target específico.

## 7.9.2 Estrutura conceitual

```ts
interface Receipt {
  id: ReceiptId;
  claimId?: ClaimId;
  criterionIds: AcceptanceCriterionId[];

  runner: string;
  runnerVersion: string;

  contractHash: string;
  treeHash: string;
  environmentRef: string;

  command?: {
    id: string;
    argv: string[];
    cwd: string;
  };

  startedAt: string;
  finishedAt: string;
  durationMs: number;

  exitCode?: number;
  result: 'PASS' | 'FAIL' | 'BLOCKED' | 'ERROR';
  outputRef: ArtifactRef;
  outputHash: string;

  freshness: 'FRESH' | 'STALE' | 'UNKNOWN';
}
```

## 7.9.3 Runner-owned

Receipt autoritativo é produzido por:

- MNFS Verification Runner;
- Integration Runner;
- QA Adapter;
- approved external verifier.

Não pelo Worker apenas afirmando que executou.

## 7.9.4 Worker-reported command

Pode ser preservado como Evidence `SELF_REPORTED`.

O gate pode decidir reexecutar.

## 7.9.5 Cold verification

Quando a independência é relevante, o check ocorre:

- fora do processo do worker;
- contra tree hash fixo;
- em cwd controlado;
- com environment conhecido.

---

# 7.10 Freshness e staleness

## 7.10.1 Regra

Uma evidência só decide enquanto seus bindings permanecem válidos.

## 7.10.2 Dimensões

Evidence pode ficar stale por mudança em:

- contract hash;
- code tree;
- integration candidate SHA;
- Repository Profile;
- Engineering Standard version;
- Golden Path version;
- environment;
- dependency lock;
- migration state;
- external provider version;
- Decision relevante;
- fixture decisiva.

## 7.10.3 Freshness key

Conceitualmente:

```text
hash(
  criterion
  + contract
  + code tree
  + policy inputs
  + environment identity
  + verifier binding
)
```

Não precisa existir uma única hash universal no MVP.

Cada check declara suas dimensões.

## 7.10.4 Exemplos

### Typecheck

Pode depender de:

- code tree;
- lockfile;
- tsconfig;
- Node version.

### Browser QA

Pode depender de:

- integrated SHA;
- frontend build;
- backend build;
- database state;
- browser;
- environment config.

### Architecture review

Pode depender de:

- diff;
- Feature contract;
- ADRs;
- Repository Profile;
- Standards.

## 7.10.5 Resultado

Evidence stale:

- continua histórica;
- não é apagada;
- não decide;
- pode reduzir o escopo da reexecução;
- precisa ser substituída ou explicitamente revalidada.

---

# 7.11 Coverage

## 7.11.1 Criterion Coverage

Para cada target:

```text
total deciding criteria
satisfied
failed
blocked
pending
stale
```

## 7.11.2 Evidence Coverage

```text
COMPLETE
PARTIAL
UNKNOWN
```

### COMPLETE

Todos os critérios decisivos possuem evidência fresca e Verdict válido.

### PARTIAL

Alguma prova existe, mas há lacuna nomeada.

### UNKNOWN

Não foi possível calcular cobertura com segurança.

## 7.11.3 Regra

```text
PARTIAL
≠ ACCEPT
```

A menos que o contrato permita explicitamente um caminho condicional e a autoridade adequada o decida.

## 7.11.4 Advisory Criteria

Critério `deciding = false` pode permanecer insatisfeito sem bloquear.

Ainda deve aparecer no Evidence Bundle.

---

# 7.12 Evaluation Result versus Verdict

Evaluation Result pode avaliar:

- Trace;
- Span;
- Worker Run;
- Claim;
- Mission;
- Experiment.

Ele pode ser produzido por código, humano, LLM Judge ou user feedback.

Evaluation Result informa Calibration e investigação.

Não aceita ou fecha uma entidade automaticamente.

```text
Evaluation Result
≠ Verdict
```

Verdict continua exigindo o Gate, Evidence e Authority definidos pelo domínio.

# 7.14 Gate

## 7.13.1 Definição

Gate é um ponto de decisão governado que autoriza ou impede uma transição.

Gate não é sinônimo de teste.

Um Gate pode consumir:

- Receipts;
- Findings;
- Decisions;
- Waivers;
- Evidence;
- policy;
- target state.

## 7.12.2 Estrutura conceitual

```ts
interface GateDecision {
  gateId: string;
  target: EntityReference;
  targetVersion: string;

  criteria: AcceptanceCriterionId[];
  inputs: EvidenceRef[];
  authority: ActorRef;

  result:
    | 'ACCEPT'
    | 'REJECT'
    | 'BLOCK'
    | 'ERROR';

  decidingReasons: string[];
  findings: FindingRef[];
  conditions?: string[];
  decidedAt: string;
}
```

## 7.12.3 Resultados

### ACCEPT

A transição autorizada pode ocorrer.

### REJECT

O target não satisfaz critérios.

Gera Correction, Replan ou abandono.

### BLOCK

Não há evidência ou autoridade suficiente para decidir.

### ERROR

O mecanismo de decisão falhou.

`ERROR` nunca vira `ACCEPT`.

---

# 7.14 Tipos de Gate

## 7.13.1 Planning Readiness Gate

Antes de aprovação:

- critérios existem;
- dependencies são válidas;
- contrato é satisfatível;
- prerequisites existem;
- Standards são resolvidos;
- Golden Path foi selecionado;
- proof coverage existe.

## 7.13.2 Dispatch Gate

Antes de iniciar Worker:

- contrato aprovado;
- Feature acionável;
- Lease válido;
- base correta;
- pack fresh;
- write-set válido;
- blockers ausentes.

## 7.13.3 Claim Admission Gate

Antes de aceitar Claim para verificação:

- schema;
- identity;
- contract hash;
- Attempt;
- Lease;
- result tree;
- files touched;
- criteria refs.

## 7.13.4 Deterministic Gate

Decide propriedades mecânicas:

- build;
- tests;
- schema;
- policy;
- boundaries;
- compatibility.

## 7.13.5 Review Gate

Decide julgamento:

- arquitetura;
- correção não mecânica;
- simplicidade;
- adequação;
- risco residual.

## 7.13.6 Write Track Acceptance Gate

Autoriza Track para integração.

## 7.13.7 Integration Gate

Decide candidate SHA composto.

## 7.13.8 QA Gate

Decide critérios live e Journey.

## 7.13.9 Feature Gate

Decide critérios próprios da Feature.

## 7.13.10 Milestone Gate

Decide critérios próprios da Milestone.

## 7.13.11 Mission Gate

Decide critérios globais e closeout.

## 7.13.12 Delivery Gate

Decide:

- PR;
- CI;
- release;
- deploy;
- post-deploy verification.

---

# 7.15 Gate DAG

Gates formam uma dependência, não uma lista fixa universal.

Exemplo:

```text
Claim Admission
        ↓
Deterministic Checks
        ↓
Risk Policy
   ┌────┴──────────┐
   │               │
low risk        medium/high
   │               ↓
   │          Independent Review
   │               │
   └──────┬────────┘
          ↓
Write Track Acceptance
          ↓
Integration
          ↓
Live QA, quando aplicável
          ↓
Feature Gate
          ↓
Milestone Gate
          ↓
Mission Gate
```

A DAG é compilada por:

- criterion types;
- risk;
- Repository Profile;
- Standards;
- Golden Path;
- scope;
- environment capabilities.

---

# 7.16 Rigor adaptativo ao risco

## 7.15.1 Princípio

Risco define profundidade de prova, não quantidade automática de agentes.

## 7.15.2 Low Risk

Pode usar:

- Claim Admission;
- deterministic checks;
- Feature Gate mecânico;
- integração quando necessária.

Sem reviewer LLM quando não há julgamento relevante.

## 7.15.3 Medium Risk

Pode exigir:

- deterministic checks;
- um Reviewer independente;
- integration;
- QA se user-facing;
- Lead adjudication.

## 7.15.4 High Risk

Pode exigir:

- readiness review;
- multiple proof types;
- reviewer independente forte;
- refutador ou segundo gate direcionado;
- integration environment;
- live QA;
- Safety Nets;
- Operator checkpoints.

## 7.15.5 Unknown Risk

Classificação temporária conservadora.

O sistema deve investigar e reduzir unknown.

## 7.15.6 Proibição de gate stacking

Não adicionar:

```text
review 1
+
review 2
+
crew
+
dual gate
+
outro gate externo
```

apenas por insegurança.

Cada gate precisa possuir:

- failure mode;
- authority distinta;
- informação adicional;
- condição de remoção;
- custo conhecido.

---

# 7.17 Verificação determinística

## 7.16.1 Máquina primeiro

Tudo que pode ser decidido com alta confiança por máquina roda antes de judgment review.

Isso:

- reduz tokens;
- reduz Findings mecânicos;
- reduz falso positivo;
- fornece contexto melhor;
- evita review de estado obviamente quebrado.

## 7.16.2 Categorias

- compile;
- typecheck;
- lint;
- tests;
- schema validation;
- dependency boundaries;
- generated client drift;
- API compatibility;
- migration verification;
- dead code;
- security rules;
- artifact integrity;
- changed-path policy.

## 7.16.3 Binding

Cada command possui:

```text
command_id
purpose
criterion mapping
cwd
environment
timeout
expected outputs
result mapping
```

Exit code não é interpretado genericamente.

## 7.16.4 Failure behavior

- command fail → `FAIL`;
- timeout → `ERROR` ou `BLOCKED`, conforme binding;
- command absent → `BLOCKED`;
- output inválido → `ERROR`;
- environment mismatch → `BLOCKED`;
- result stale → reexecute.

---

# 7.18 Review independente

## 7.17.1 Objetivo

Avaliar propriedades que não podem ser decididas completamente por checks mecânicos.

## 7.17.2 Entrada limitada

Reviewer recebe:

- target identity;
- fixed SHA/tree;
- Feature contract;
- applicable Standards;
- Golden Path;
- diff;
- deterministic report;
- Claims;
- prior Findings;
- Decisions;
- Waivers;
- review learnings.

## 7.17.3 Ordem

1. arquitetura;
2. contrato e comportamento;
3. correção;
4. complexidade e simplicidade;
5. testes e proof quality;
6. operabilidade;
7. legibilidade;
8. estilo somente se não mecanizável.

## 7.17.4 Global maximum

Reviewer precisa verificar:

- solução faz sentido no sistema;
- alternativa material foi considerada;
- mudança cria dívida que bloqueia Feature futura nomeada;
- abstração possui consumidor real;
- seam foi fechado;
- wiring existe.

## 7.17.5 Anchor-or-abstain

Finding decisivo precisa de:

- locus;
- evidência;
- impacto;
- confirmação.

Sem confirmação:

```text
speculative
→ no máximo advisory
```

## 7.17.6 Findings

```text
BLOCKING
IMPORTANT
SUGGESTION
NIT
QUESTION
```

Somente:

- `BLOCKING`;
- `IMPORTANT` não resolvido;

rejeitam por default.

## 7.17.7 Review não gera escopo

Melhoria desejável fora do contrato:

- suggestion;
- backlog;
- gardening candidate;
- future Mission.

Não bloquear Feature atual sem vínculo ao contrato, Standard ou risco real.

---

# 7.19 Segundo reviewer e refutação

## 7.18.1 Quando usar

Segundo reviewer é justificado quando:

- risco alto;
- contrato crítico;
- primeiro review fino em diff grande;
- segurança;
- mudança irreversível;
- modelos possuem strengths complementares;
- histórico demonstra classe de falha não capturada.

## 7.18.2 Não repetir review geral

O segundo pass deve ter objetivo adicional.

Exemplos:

- refutar cláusulas do contrato;
- verificar tenant boundary;
- procurar ownership violations;
- examinar failure paths;
- revisar migration safety;
- revisar attack surface.

## 7.18.3 Reconciliação

Findings:

```text
CONFIRMED
REFUTED
CONTESTED
```

`CONTESTED` material vai para Lead ou autoridade apropriada.

## 7.18.4 Regra

Votação de modelos não é autoridade.

Evidência e política decidem.

---

# 7.20 QA e validação live

## 7.19.1 Objetivo

Provar comportamento no ambiente e perspectiva exigidos.

## 7.19.2 QA Journey

Define:

- persona;
- preconditions;
- data;
- steps;
- expected observations;
- failure observations;
- environment;
- capture requirements.

## 7.19.3 Fresh persona

QA não começa lendo:

- implementação;
- defesa do worker;
- review elogioso.

Começa pelo contrato e Journey.

## 7.19.4 Evidência

- screenshots;
- video quando necessário;
- browser trace;
- console;
- network;
- API response;
- logs correlacionados;
- database verification;
- timestamps.

## 7.19.5 Real environment

Critério live precisa do seam real exigido.

Se indisponível:

```text
BLOCKED
```

Não:

```text
PASS_WITH_ASSUMPTION
```

## 7.19.6 QA não corrige

Ao encontrar defeito:

```text
Finding
→ Correction
→ Integration
→ redrive Journey
```

---

# 7.21 Integration honesty

## 7.20.1 Regra

Uma integração só está provada quando os componentes reais declarados pelo contrato foram conectados e exercitados.

## 7.20.2 Mocks permitidos

Mocks são permitidos para:

- unit tests;
- deterministic failure injection;
- isolamento de lógica;
- testes de consumer locais;
- simulação claramente declarada.

## 7.20.3 Mocks proibidos como prova final

Não podem ser a única prova de:

- provider real;
- frontend–backend;
- database;
- migration;
- auth;
- external API;
- queue;
- storage;
- browser behavior.

## 7.20.4 Composition root

Integration Gate verifica:

- provider registrado;
- adapter selecionado;
- config válida;
- route exposta;
- migration aplicada;
- client usado;
- feature flag coerente;
- fallback não escondido.

## 7.20.5 Integration oracle

Quando duas Features se encontram pela primeira vez, a Milestone deve possuir critério de composição independente dos critérios individuais.

---

# 7.22 Test quality

## 7.21.1 Regression test

Para bug fix:

```text
reproduzir falha
→ observar red
→ corrigir
→ observar green
```

Quando automatização não for viável, registrar prova alternativa.

## 7.21.2 Behavior over implementation

Testar:

- input;
- output;
- state transition;
- side effect;
- contract;
- negative path.

Evitar testar:

- detalhe privado sem necessidade;
- chamada de mock como objetivo;
- estrutura interna acidental.

## 7.21.3 Negative paths

Critérios e Verification Plans devem incluir quando aplicável:

- invalid input;
- unauthorized;
- duplicate;
- timeout;
- cancellation;
- partial failure;
- stale state;
- retry;
- concurrency;
- recovery.

## 7.21.4 Test isolation

Testes precisam declarar recursos:

- database;
- ports;
- filesystem;
- environment;
- clock;
- network.

Isolated mutable workspace não resolve esses recursos automaticamente.

## 7.21.5 Flake

Teste flakey:

- não fornece pass confiável;
- vira Finding operacional;
- pode ser repetido somente conforme policy;
- não deve ser ignorado silenciosamente.

---

# 7.23 Findings, Correction e re-verificação

## 7.22.1 Finding confirmado

Gera Correction quando:

- é deciding;
- pertence ao escopo;
- possui evidência;
- é resolvível localmente.

## 7.22.2 Correction

Define:

- Findings alvo;
- delta esperado;
- critérios afetados;
- checks;
- re-review;
- Journey a redrivar.

## 7.22.3 Delta verification

Reexecutar:

- checks afetados;
- regressions;
- Findings;
- criteria freshness.

Não repetir toda a pirâmide por hábito.

## 7.22.4 Full re-verification

Obrigatória quando:

- contract surface mudou;
- write-set expandiu;
- arquitetura mudou;
- base foi invalidada;
- fix afetou múltiplos critérios;
- segunda falha equivalente ocorreu.

## 7.22.5 Never downgrade

Finding confirmado não desaparece por novo resumo.

Precisa de:

```text
RESOLVED
DISMISSED_WITH_EVIDENCE
ACCEPTED_RISK
SUPERSEDED_BY_REPLAN
```

---

# 7.24 Anti-loop

## 7.23.1 Failure Fingerprint

Falha recorrente recebe fingerprint baseada em:

- criterion;
- command;
- error class;
- locus;
- environment;
- hypothesis.

## 7.23.2 Retry válido

Novo Attempt precisa mudar pelo menos uma dimensão:

- hipótese;
- informação;
- estratégia;
- environment;
- contract;
- worker;
- dependency;
- instrumentation.

## 7.23.3 Segunda falha equivalente

Exige:

- triage;
- redesign;
- Replan;
- Decision;
- outro Actor especializado.

## 7.23.4 Terceira tentativa cega

Bloqueada.

## 7.23.5 Resultado

Anti-loop não impede perseverança.

Impede repetição sem aprendizado.

---

# 7.25 Accepted Risk

## 7.24.1 Definição

Accepted Risk é uma Decision explícita de prosseguir apesar de risco conhecido.

Não é Acceptance Criterion satisfeito.

## 7.24.2 Conteúdo

```text
risk
impact
likelihood
affected criteria
evidence
mitigation
owner
review date
authority
```

## 7.24.3 Limites

Accepted Risk:

- não falsifica test result;
- não transforma `FAIL` em `PASS`;
- pode permitir closeout com condição;
- aparece no Evidence Bundle;
- pode criar follow-up obrigatório.

---

# 7.26 Evidence Bundle

## 7.25.1 Definição

Evidence Bundle é a justificativa consolidada para um Verdict de nível superior.

## 7.25.2 Feature Bundle

Inclui:

- contract hash;
- Feature identity;
- result SHA;
- Claims;
- criterion matrix;
- Receipts;
- review Verdict;
- Findings;
- Corrections;
- Waivers;
- accepted risks;
- QA evidence quando aplicável.

## 7.25.3 Milestone Bundle

Inclui:

- Feature Bundles;
- Integration Run;
- Milestone Criteria;
- composition Receipts;
- QA Journeys;
- unresolved advisories;
- candidate SHA.

## 7.25.4 Mission Bundle

Inclui:

- Approved Mission Contract;
- Milestone Bundles;
- Mission Criteria;
- final Journeys;
- delivered SHA;
- delivery evidence;
- Quality Posture delta;
- Waivers;
- accepted risks;
- known limitations;
- closeout.

## 7.25.5 Regras

- bundle é produzido pelo MNFS;
- não pelo worker;
- referências precisam resolver;
- unknowns permanecem visíveis;
- Evidence decisiva precisa estar fresh;
- summary não substitui origem.

---

# 7.27 Hierarchical closure

## 7.26.1 Feature

Pode fechar quando:

```text
all deciding Feature Criteria SATISFIED
+
required Write Tracks ACCEPTED
+
required integration evidence fresh
+
required QA passed
+
no blocking Findings
+
Feature Evidence Bundle complete
```

## 7.26.2 Milestone

Pode fechar quando:

```text
required Features CLOSED
+
Milestone Criteria SATISFIED
+
Integration Run ACCEPTED
+
required QA Journeys PASSED
+
no blocking Decisions
+
Milestone Evidence Bundle complete
```

## 7.26.3 Mission

Pode fechar quando:

```text
required Milestones CLOSED
+
Mission Criteria SATISFIED
+
final outcome proven
+
delivery state decided
+
accepted risks recorded
+
Mission Evidence Bundle complete
+
required Operator authority recorded
```

## 7.26.4 Cancelled versus Closed

`CANCELLED` não é `CLOSED`.

Cancelamento possui:

- motivo;
- estado preservado;
- work cleanup;
- delivered partials;
- risks;
- evidence.

---

# 7.28 Gate failure behavior

| Falha | Resultado |
|---|---|
| check falhou | `REJECT` |
| check não executou | `ERROR` ou `BLOCK` |
| environment ausente | `BLOCK` |
| Receipt stale | reexecutar ou `BLOCK` |
| reviewer indisponível | `BLOCK` ou fallback equivalente |
| review incompleto | `ERROR` |
| QA environment indisponível | `BLOCK` |
| Finding contestado | Lead adjudica ou `BLOCK` |
| Waiver expirada | `REJECT` ou `BLOCK` |
| evidence missing | `BLOCK` |
| wrong SHA | `REJECT` |
| tool output inválido | `ERROR` |
| unknown | nunca `ACCEPT` |

---

# 7.29 Gate outputs e UX

## 7.28.1 Human output

```text
Feature MIS-010/M02/F03 — REJECTED

Deciding failures:
- AC-02: provider contract failed
- AC-04: browser Journey blocked by unauthorized response

Fresh evidence:
- 6/8 criteria
- 2 failed
- 0 stale

Next:
mnfs correct open --findings FND-014,FND-015
```

## 7.28.2 JSON output

```json
{
  "target": "MIS-010/M02/F03",
  "result": "REJECT",
  "criteria": {
    "total": 8,
    "satisfied": 6,
    "failed": 2,
    "blocked": 0,
    "stale": 0
  },
  "findings": ["FND-014", "FND-015"],
  "nextAction": {
    "command": "mnfs correct open",
    "args": ["--findings", "FND-014,FND-015"]
  }
}
```

## 7.28.3 Regra

Gate output precisa responder:

- o que decidiu;
- por quê;
- qual evidência;
- o que está faltando;
- próximo passo.

---

# 7.30 Quality Posture integration

Cada Mission pode alterar a postura do repositório.

Exemplos:

```text
API compatibility
PARTIAL → VERIFIED

browser QA
MISSING → PARTIAL

migration recovery
UNKNOWN → VERIFIED
```

## 7.29.1 Findings recorrentes

Podem gerar:

- Engineering Standard;
- Fitness Function;
- Golden Path improvement;
- Repository Profile amendment;
- Defect Class;
- gardening task.

## 7.29.2 Gate false positives

Também geram aprendizado.

Regra que bloqueia incorretamente precisa ser:

- corrigida;
- reduzida a observation;
- ou removida.

---

# 7.31 Review stacking control

## 7.30.1 Uma autoridade por estágio

```text
Feature mechanical proof
→ Verification Runner

Feature judgment
→ Reviewer quando necessário

Composition
→ Integration Gate

User behavior
→ QA Gate

Delivery
→ Delivery Gate
```

## 7.30.2 Ferramenta externa

no-mistakes ou CI podem executar delivery.

Não devem repetir autoridade já exercida sem novo propósito.

## 7.30.3 Métrica futura

Medir:

- defects found;
- false positives;
- correction rounds;
- cost;
- latency;
- overlap;
- unique information added.

Gate sem informação nova é candidato a remoção.

---

# 7.32 Security e high-stakes quality

Para superfícies críticas, a política pode exigir:

- threat-oriented review;
- authorization matrix;
- tenancy negative tests;
- secret scanning;
- dependency provenance;
- audit evidence;
- rollback;
- Operator checkpoint.

O MNFS não substitui especialista de segurança quando o risco exige.

Ele garante que:

- a necessidade seja detectada;
- o papel seja despachado;
- a evidência seja registrada;
- o gate não seja pulado.

---

# 7.33 Performance e non-functional criteria

Performance, reliability e operability precisam ser Acceptance Criteria quando fazem parte do outcome.

Exemplos:

```text
p95 latency < 300 ms under workload X
recovery completes without duplicate processing
migration finishes within maintenance window
worker restart preserves Claim and Lease
```

Critério não funcional precisa de:

- workload;
- environment;
- measurement method;
- threshold;
- variance policy;
- evidence.

“Rápido” não é critério verificável.

---

# 7.34 Status de implementação

| Capability | Milestone |
|---|---|
| Plan criteria content | M1 parcial |
| Claim separation | M2 |
| Claim admission | M2 |
| Worker completion ≠ acceptance | M2 |
| Minimal acceptance gate | M2 |
| Findings | M3 |
| Independent review | M3 |
| Correction delta | M3 |
| Integration Gate | M4 |
| Receipt model completo | M5 |
| Risk-adaptive gate compiler | M5 |
| QA Journeys | M5 |
| Evidence Bundles | M5/M6 |
| Mission closeout | M5/M6 |
| Delivery Gate | M6 |
| Quality Posture calibration | M6 |

---

# 7.35 M2 quality slice

M2 não precisa implementar o Quality System completo.

Precisa provar a lei central:

```text
Writer Worker completes
≠ Claim accepted
```

M2 deve possuir:

- Feature Criteria;
- fixed demo task;
- Claim;
- worker completion;
- deterministic gate;
- explicit Claim acceptance;
- Lead restart recovery;
- fresh process proof.

M2 não precisa possuir ainda:

- reviewer LLM;
- advanced risk routing;
- live QA;
- multiple Tracks;
- Evidence Bundle completo;
- Gate compiler genérico.

---

# 7.36 Non-goals

Não construir agora:

- confidence score universal;
- code quality grade;
- coverage percentage como autoridade única;
- quantidade fixa de reviewers;
- dual gate universal;
- aprovação por maioria de modelos;
- blockchain de Evidence;
- cryptographic attestation multi-machine;
- full event sourcing;
- compliance suite genérica;
- browser QA para todo critério;
- benchmark para toda Feature;
- reexecução total após toda linha alterada;
- sistema que bloqueia por gosto estilístico;
- Waiver automática;
- `PASS_WITH_ASSUMPTION`.

---

# 7.37 Invariantes de qualidade

1. Toda Mission possui critérios próprios.
2. Toda Milestone possui critérios próprios.
3. Toda Feature possui critérios próprios.
4. Todo critério possui método de prova.
5. Claim não é Verdict.
6. Worker completion não é acceptance.
7. Receipt decisivo é runner-owned.
8. Evidence decisiva possui provenance.
9. Evidence stale não decide.
10. Unknown não é pass.
11. Environment unavailable é block.
12. Child closure não substitui parent criteria.
13. Implementer não é Reviewer quando independência é exigida.
14. Finding bloqueante precisa de confirmação.
15. Review não cria escopo.
16. Critério live não é provado apenas por mock.
17. Isolated mutable workspace green não prova integration.
18. Integration green não prova user outcome quando QA é exigido.
19. Accepted Risk não falsifica critério.
20. Waiver não apaga Acceptance Criterion.
21. Correction revalida delta e impacto.
22. Retry precisa de nova hipótese ou evidência.
23. Gate error não vira accept.
24. Evidence Bundle aponta para origem.
25. Gates existem por failure mode, não por cerimônia.
26. Quality Posture deriva de evidência.
27. False positive recorrente corrige o gate.
28. Finding recorrente pode virar guardrail.
29. O custo de qualidade é medido.
30. Nenhuma entidade fecha apenas porque um agente disse “pronto”.

---

# Decisão resumida da Seção 7

> **O MNFS trata qualidade como uma cadeia hierárquica de critérios, provas e decisões. Workers emitem Claims; runners produzem Receipts; reviewers e gates emitem Verdicts; Integration Runs provam composição; QA Journeys provam comportamento real; Evidence Bundles justificam fechamento. Evidência só decide quando possui provenance, target e freshness válidos. Features, Milestones e Missions possuem critérios próprios e fecham separadamente. Nenhum texto, exit code, mock, teste local ou soma de filhos é suficiente para produzir false completion.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current Recovery semantics

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

**Fresh Recovery does not depend on runtime transcript**. Recovery loads authoritative MNFS state, observes Git plus selected Environment/workspace/runtime resources, classifies divergence and chooses the safe governed next action.

Runtime Sessions, worktree paths, COW deltas, snapshots, VM disks and remote volumes are observations/execution artifacts, not domain authority. Late or superseded Attempts cannot mutate the current target. A HANDOFF_REQUIRED or interrupted Actor is never reclassified as successful merely because partial work exists.

---

# 8. Estado, Recovery, Reconcile, Concorrência e Tolerância a Falhas

## 8.1 Propósito

Esta seção define como o MNFS permanece correto quando:

- o Lead é encerrado;
- um Worker morre;
- o terminal fecha;
- uma mensagem não chega;
- o processo termina sem Claim;
- SQLite confirma uma operação, mas a ferramenta externa falha;
- a ferramenta externa conclui, mas SQLite não registra;
- um bound isolated mutable workspace desaparece;
- uma branch diverge;
- um Receipt fica stale;
- duas ações concorrentes disputam o mesmo recurso;
- uma integração perde a corrida;
- um Attempt antigo entrega resultado atrasado;
- o computador reinicia;
- um adapter retorna estado inconsistente;
- um comando é repetido;
- o runtime encontra estado que não consegue interpretar.

A meta não é eliminar falhas.

A meta é garantir que toda falha resulte em uma condição:

- detectável;
- classificável;
- recuperável ou explicitamente não recuperável;
- auditável;
- sem progresso falso;
- sem destruição silenciosa de trabalho.

No MNFS:

> **Recovery não significa reconstruir uma conversa. Significa reconciliar o estado autoritativo com o mundo observado e escolher uma próxima ação segura.**

---

# 8.2 Modelo de estado

## 8.2.1 Estado autoritativo

O estado operacional autoritativo vive em SQLite.

Ele inclui, progressivamente:

- Mission;
- Milestone;
- Feature;
- Acceptance Criterion;
- Write Track;
- Lease;
- Attempt;
- Worker Run;
- Claim;
- Receipt;
- Finding;
- Verdict;
- Decision;
- Integration Run;
- QA Journey;
- Waiver;
- Event.

## 8.2.2 Estado externo observado

O MNFS também observa:

- filesystem;
- Git;
- selected workspace/environment realization;
- processos;
- Runtime Sessions;
- Lavish;
- Herdr;
- browser;
- bancos e serviços de teste;
- providers externos.

Esses sistemas possuem sua própria realidade física.

Exemplo:

```text
SQLite:
Lease ACTIVE

Workspace realization:
mutable workspace not found
```

Isso não significa automaticamente que SQLite está errado ou que o Lease deve ser apagado.

Significa:

```text
DIVERGENCE
```

## 8.2.3 Estado derivado

Status agregado pode ser derivado de entidades autoritativas.

Exemplos:

- Mission progress;
- Milestone attention;
- quantidade de Tracks ativas;
- Claims aguardando gate;
- Decisions bloqueantes.

Estado derivado pode ser recalculado.

Não deve ser editado manualmente para esconder inconsistência.

## 8.2.4 Estado efêmero

Inclui:

- spinner;
- pane focada;
- última linha de log;
- progresso textual;
- terminal aberto;
- output parcial;
- typing indicator.

Estado efêmero melhora a experiência.

Não participa diretamente de gates.

---

# 8.3 Source-of-truth matrix

| Conceito | Autoridade | Observadores secundários |
|---|---|---|
| Mission lifecycle | MNFS/SQLite | CLI, Agent Runtime, futura UI |
| Approved Contract | SQLite + artefato versionado | Git, presentation/runtime adapters |
| Code/result tree | Git | MNFS, Worker |
| Mutable Workspace binding | MNFS + selected workspace/environment observation | filesystem/Git |
| Workspace/Environment Lease semântico | MNFS/SQLite | selected realization adapter |
| Process/runtime existence | execution substrate | Agent Runtime adapter |
| Worker Run state | MNFS/SQLite | Agent Runtime events/process observations |
| Claim state | MNFS/SQLite | Worker, CLI |
| Receipt | MNFS/SQLite + artifact | runner |
| Terminal presentation | Herdr | Operator |
| Visual feedback | presentation surface until consumed | Agent Runtime/presentation adapters, MNFS |
| Decision | MNFS/SQLite + artefato quando necessário | Operator, Lead |
| Integration candidate | Git + MNFS Integration Run | CI, QA |
| Evidence artifact | artifact store + hash | Git quando promovido |
| Quality Posture | MNFS aggregation | docs/dashboard |

## 8.3.1 Runtime Session history e memória observacional

Quando o Agent Runtime oferece um ledger/session history exato, ele é Evidence histórica daquela execução e nunca current Mission authority. O Pi JSONL provado anteriormente é um exemplo incumbent dessa categoria.

Uma memória observacional é uma projeção comprimida e probabilística sobre esse histórico.

```text
Exact Runtime Session source entries
→ histórico exato da Session

Observations / Reflections
→ projeção auxiliar e source-backed quando suportado

SQLite / Approved Contract
→ estado autoritativo atual
```

Uma Session completamente nova recupera a Mission por SQLite, Approved Contract, Current Authority Snapshot e Handoff Pack. Ela não depende de Observational Memory existir.

## 8.3.2 Transporte não é durabilidade

Process stdin, runtime queue/protocol, WebSocket ou terminal messaging podem entregar ou despertar Actors.

Commands, Decisions, Claims e resultados continuam persistidos no MNFS.

## 8.3.3 Telemetria não é durabilidade

Trace, metric, log ou backend de observabilidade pode ficar indisponível.

Domain Events, Claims, Decisions e Evidence permanecem no MNFS.

Perda de exportação pode degradar observabilidade, mas não reverte nem inventa estado.

## Regra

Quando autoridades diferentes parecem discordar, o MNFS não escolhe silenciosamente uma delas.

Ele:

1. registra observações;
2. classifica a divergence;
3. calcula ações seguras;
4. repara somente quando a regra estiver definida;
5. escala quando a autoridade necessária for humana.

---

# 8.4 Princípios de durabilidade

## 8.4.1 Mensagem é notificação

Mensagens podem:

- acordar;
- indicar mudança;
- apontar artifact;
- sugerir ação.

Mensagens não podem ser a única evidência de:

- Claim;
- Decision;
- approval;
- Lease;
- acceptance;
- completion.

## 8.4.2 Session é descartável

Nenhuma entidade de domínio depende de uma Session existir.

Session pode acelerar continuação.

Não é necessária para recovery.

## 8.4.3 Processo é substituível

Um Attempt pode continuar com outro Worker Run.

```text
WT-001/A01
├── WR-001 LOST
└── WR-002 RUNNING
```

## 8.4.4 Isolated mutable workspace é preservável

O isolated mutable workspace representa trabalho físico em progresso.

Ele não é removido enquanto:

- Track não foi integrada;
- Track não foi abandonada;
- evidence necessária não foi promovida;
- release não foi autorizada.

## 8.4.5 Eventos são auditáveis

Toda transição relevante possui Event.

Event não substitui current state.

## 8.4.6 Idempotência é obrigatória nas bordas críticas

Repetir uma operação após timeout não pode produzir:

- dois Leases;
- dois Claims equivalentes;
- dois Attempts atuais;
- dois merges;
- dois deploys;
- duas Decisions iguais;
- release do Lease errado.

---

# 8.5 Unidade de consistência

## 8.5.1 SQLite transaction

Mudanças puramente locais e relacionadas devem ocorrer na mesma transaction.

Exemplo:

```text
insert Claim
+
update Attempt
+
insert CLAIM_OPENED Event
→ uma transaction
```

## 8.5.2 Operações externas

SQLite não pode formar transaction ACID com:

- selected workspace/environment realization;
- Git;
- Agent Runtime/process execution;
- Lavish;
- browser;
- provider;
- deployment system.

Essas operações usam:

```text
intent
→ external action
→ observation
→ commit semantic state
→ reconcile
```

## 8.5.3 Regra

Não fingir atomicidade distribuída.

Projetar explicitamente:

- janela de falha;
- orphan state;
- retry;
- fencing;
- compensation;
- reconcile.

---

# 8.6 Intent–Action–Observation pattern

## 8.6.1 Definição

Para efeito externo relevante:

```text
1. Persist Intent
2. Execute External Action
3. Observe Result
4. Commit Domain Outcome
5. Emit Event
```

## 8.6.2 Exemplo — Lease

```text
LEASE_REQUESTED persistido
        ↓
selected workspace-realization acquire/materialize
        ↓
path e lease_id observados
        ↓
validar workspace binding
        ↓
LEASE_ACTIVE persistido
        ↓
LEASE_GRANTED Event
```

## 8.6.3 Crash windows

### Crash após Intent, antes da ação

Recovery vê `REQUESTED` sem recurso externo.

Pode:

- retry idempotente;
- cancelar request;
- marcar failure.

### Crash após ação externa, antes do commit

Recovery encontra recurso órfão.

Pode:

- adotar o recurso se identity e preconditions correspondem;
- liberar;
- bloquear para Operator.

### Crash após commit, antes da resposta ao caller

Caller pode repetir.

Idempotency key retorna o resultado já concluído.

## 8.6.4 Regra

Toda operação externa crítica precisa definir essas três janelas antes da implementação.

---

# 8.7 Idempotency model

## 8.7.1 Idempotency key

Ações repetíveis recebem key estável.

Exemplos:

```text
lease:grant:WT-001
claim:open:WT-001:A01
worker:start:WT-001:A01
integration:start:MIS-010:M02:rev3
decision:record:DEC-004
```

## 8.7.2 Resultado repetido

Mesma key e mesmo input:

```text
return previous result
```

Mesma key e input diferente:

```text
IDEMPOTENCY_CONFLICT
```

## 8.7.3 Scope

Idempotência precisa considerar:

- entity;
- Attempt;
- contract hash;
- expected version;
- caller intent.

## 8.7.4 Não usar timestamp como identity

Timestamp pode participar de auditoria.

Não deve ser a única forma de deduplicação.

---

# 8.8 Optimistic concurrency

## 8.8.1 Objetivo

Impedir que um processo sobrescreva estado mais novo sem perceber.

## 8.8.2 Version field

Entidades mutáveis podem possuir:

```text
version
```

Update:

```sql
UPDATE entity
SET ..., version = version + 1
WHERE id = ? AND version = ?
```

Nenhuma linha alterada:

```text
CONCURRENCY_CONFLICT
```

## 8.8.3 Aplicação

Especialmente útil para:

- Plan Revision approval;
- Claim transition;
- Decision;
- Lease;
- Attempt current pointer;
- Integration Run;
- Waiver.

## 8.8.4 Reação

Caller:

- recarrega;
- compara;
- decide retry;
- não sobrescreve silenciosamente.

---

# 8.9 Fencing

## 8.9.1 Definição

Fencing impede um Actor antigo de agir sobre um recurso que já foi reassumido.

## 8.9.2 Lease fencing

Release exige:

```text
internal Lease ID
external lease_id
holder
generation
path
```

Um processo antigo com Lease anterior não libera aquisição nova.

## 8.9.3 Attempt fencing

Claim e completion precisam referenciar o Attempt atual.

Resultado tardio de Attempt superseded:

```text
record late observation
do not mutate current state
```

## 8.9.4 Integration fencing

Integration commit precisa validar:

- expected base SHA;
- Integration Run ID;
- candidate SHA;
- queue ownership.

Se base avançou:

```text
REBASE_REQUIRED
```

## 8.9.5 Process fencing

Worker Run antigo não pode completar Attempt depois de outro Run ter assumido exclusividade, salvo policy explícita.

---

# 8.10 Concurrency model

## 8.10.1 Concorrência permitida

Tracks podem executar em paralelo quando:

- dependencies permitem;
- write-sets são compatíveis;
- seams não colidem;
- recursos externos estão isolados;
- policy permite;
- Operator attention não é o limitante.

## 8.10.2 Escrita concorrente no mesmo recurso

Default:

```text
não permitido
```

Recursos incluem:

- arquivo;
- migration block;
- API contract section;
- generated client;
- database schema;
- port;
- shared test environment;
- external sandbox account.

## 8.10.3 One writer per seam

Cada seam mutável possui:

- owner;
- ordem;
- ou estratégia aditiva.

## 8.10.4 Paralelismo não é apenas Git

Isolated mutable workspaces separam mutation surfaces.

Não isolam:

- process;
- database;
- port;
- queue;
- browser profile;
- provider account;
- cloud resource;
- cache;
- environment variable.

Repository Profile precisa declarar recursos compartilhados.

## 8.10.5 Resource reservation

Modelo futuro:

```text
resource_id
mode: SHARED_READ | EXCLUSIVE_WRITE
holder
scope
expires_at
```

Não implementar registry genérico antes de dois recursos reais precisarem.

---

# 8.11 SQLite concurrency

## 8.11.1 Workload esperado

- vários comandos curtos;
- Lead;
- workers chamando CLI;
- runners;
- recovery;
- integration.

## 8.11.2 Estratégia inicial

- WAL quando suportado;
- foreign keys;
- busy timeout;
- transactions curtas;
- nenhum model call dentro de transaction;
- nenhuma operação externa dentro de transaction;
- `BEGIN IMMEDIATE` quando update coordenado exigir lock de escrita.

## 8.11.3 Write contention

Quando SQLite estiver ocupado:

- retry curto e limitado;
- jitter pequeno;
- erro tipado quando exceder;
- nunca loop infinito.

## 8.11.4 Long reads

Status e dashboards precisam usar queries eficientes.

Não manter transaction aberta enquanto:

- renderiza HTML;
- chama Git;
- espera/observa o Agent Runtime;
- executa teste;
- chama browser.

---

# 8.12 Worker lifecycle e liveness

## 8.12.1 Worker states

```text
STARTING
RUNNING
IDLE_ADDRESSABLE
EXITED
LOST
CANCELLED
```

## 8.12.2 Liveness observations

Podem vir de:

- process PID;
- Agent Runtime lifecycle event;
- session metadata;
- Herdr;
- stdout activity;
- heartbeat futuro.

Nenhuma observação isolada é suficiente em todos os casos.

## 8.12.3 Semantic state

```text
process alive
≠ useful progress

process exited
≠ work completed

no output
≠ idle

Herdr done
≠ Claim accepted
```

## 8.12.4 Unknown

Quando liveness não pode ser confirmada:

```text
UNKNOWN
```

Depois de policy e prazo:

```text
LOST
```

## 8.12.5 Lead restart

Novo Lead:

1. abre SQLite;
2. lista Worker Runs não terminais;
3. inspeciona processos;
4. inspeciona Claims;
5. inspeciona Leases;
6. classifica observações;
7. apresenta recovery actions.

---

# 8.13 Deadlines e timeouts

## 8.13.1 Objetivo

Detectar trabalho sem progresso suficiente e impedir limbo.

## 8.13.2 Tipos

- boot timeout;
- command timeout;
- worker observation deadline;
- review deadline;
- integration deadline;
- QA deadline;
- operator Decision age.

## 8.13.3 Deadline não é cancelamento automático universal

Ao vencer:

```text
reconcile
→ observe
→ classify
→ cancel, extend, mark LOST, or escalate
```

## 8.13.4 Persistência

Deadlines relevantes vivem no estado.

Não apenas em timer de processo.

## 8.13.5 Operator Decisions

Não expiram automaticamente.

Status mostra idade e impacto.

## 8.13.6 Long-running worker

Pode continuar quando:

- process está vivo;
- evidence de progresso existe;
- policy permite extensão;
- Lead registra decisão.

---

# 8.14 Late arrival

## 8.14.1 Definição

Artifact ou resultado chega depois de:

- timeout;
- Worker Run LOST;
- Attempt superseded;
- Replan;
- Claim rejeitado;
- Track abandonada.

## 8.14.2 Regra

Late arrival é registrado.

Não é automaticamente aplicado.

## 8.14.3 Attempt atual

Se pertence ao Attempt atual e ainda é válido:

- pode reabrir avaliação;
- precisa de freshness;
- policy decide.

## 8.14.4 Attempt superseded

Resultado:

```text
LATE_SUPERSEDED
```

Pode ser:

- preservado;
- comparado;
- usado como investigação;
- abandonado.

Não altera current Claim.

## 8.14.5 Contract antigo

Artifact contra contract hash anterior:

```text
STALE_CONTRACT
```

Reuso exige reconciliação explícita.

---

# 8.15 Recovery Service

## 8.15.1 Responsabilidade

Recovery Service:

- descobre divergências;
- classifica;
- sugere ações;
- aplica reparos permitidos;
- registra resultado.

## 8.15.2 Inputs

- Repository ID;
- SQLite state;
- Git state;
- workspace/environment realization state;
- process observations;
- artifacts;
- adapter capabilities;
- policy;
- Operator Decisions.

## 8.15.3 Output

```ts
interface RecoveryReport {
  repositoryId: RepositoryId;
  observedAt: string;

  healthy: RecoveryObservation[];
  divergences: Divergence[];
  blocked: RecoveryBlocker[];
  suggestedActions: RecoveryAction[];

  summary: {
    activeMissions: number;
    activeTracks: number;
    liveWorkers: number;
    lostWorkers: number;
    orphanedWorktrees: number;
    staleClaims: number;
  };
}
```

## 8.15.4 Read-only default

```text
mnfs recover
```

ou:

```text
mnfs recover --json
```

deve inspecionar e reportar.

Reparo exige:

- comando explícito;
- ou policy segura e idempotente já aprovada.

---

# 8.16 Reconcile

## 8.16.1 Definição

Reconcile compara:

```text
expected state
versus
observed world
```

e produz uma classificação.

## 8.16.2 Quando executar

- Lead startup;
- `mnfs status`;
- antes de dispatch;
- antes de release;
- antes de integration;
- depois de crash;
- depois de adapter error;
- ação explícita.

## 8.16.3 Reconcile-on-touch

No local MVP, sem daemon obrigatório:

```text
qualquer operação protegida
→ reconcile do escopo relevante
→ ação
```

Não precisa reconciliar todo o repositório antes de todo comando.

## 8.16.4 Escopos

```text
repository
mission
milestone
write track
lease
worker run
claim
integration run
```

## 8.16.5 Reconcile não inventa estado

Se observação não é suficiente:

```text
UNKNOWN
```

Não inferir sucesso.

---

# 8.17 Divergence taxonomy

## 8.17.1 Lease divergence

### LD-01

SQLite binding/lease ativo, mutable workspace ausente.

### LD-02

Mutable workspace MNFS-like existe, binding/lease ausente.

### LD-03

External lease_id não corresponde.

### LD-04

Holder incorreto.

### LD-05

Path/resource não corresponde ao workspace binding esperado.

## 8.17.2 Git divergence

### GD-01

HEAD diferente do expected base.

### GD-02

Branch ausente.

### GD-03

Mutable workspace dirty inesperadamente.

### GD-04

Commit de Claim não existe.

### GD-05

Integrated SHA não corresponde ao recorded candidate.

## 8.17.3 Worker divergence

### WD-01

Worker RUNNING, processo ausente.

### WD-02

Processo existe, Worker Run ausente.

### WD-03

Worker exited sem Claim.

### WD-04

Claim existe, Worker Run desconhecido.

### WD-05

Duas execuções acreditam possuir exclusividade.

## 8.17.4 Evidence divergence

### ED-01

Artifact ausente.

### ED-02

Hash não corresponde.

### ED-03

Receipt target incorreto.

### ED-04

Evidence stale.

### ED-05

Environment identity não resolve.

## 8.17.5 Contract divergence

### CD-01

Context Pack usa hash antigo.

### CD-02

Feature identity não existe no Approved Contract.

### CD-03

Claim referencia critério superseded.

### CD-04

Profile ou Standard mudou.

## 8.17.6 Integration divergence

### ID-01

Base avançou.

### ID-02

Track mudou após aceite.

### ID-03

Integration workspace contém alteração não atribuída.

### ID-04

Merge order diferente.

### ID-05

Candidate SHA não é reproduzível.

---

# 8.18 Recovery actions

## 8.18.1 ADOPT

Adotar recurso externo órfão quando:

- identity corresponde;
- mutable workspace identity/binding é válido;
- base é válida;
- nenhuma outra entidade possui o recurso;
- policy permite.

## 8.18.2 RELEASE

Liberar recurso externo quando:

- trabalho foi preservado;
- Lease não é atual;
- fencing corresponde;
- cleanup é seguro.

## 8.18.3 RECREATE

Recriar recurso ausente quando:

- fonte autoritativa existe;
- operação é idempotente;
- nenhum trabalho se perde.

## 8.18.4 MARK_LOST

Marcar Worker Run perdido.

Não fecha Attempt automaticamente.

## 8.18.5 REATTACH

Reconectar apresentação ou Session quando suportado.

Não necessária para continuidade do domínio.

## 8.18.6 RESUME_WITH_NEW_RUN

Criar Worker Run novo para o mesmo Attempt.

## 8.18.7 SUPERSEDE

Criar novo Attempt e congelar o anterior.

## 8.18.8 ABANDON

Abandonar Track com preservação de evidence.

## 8.18.9 REPLAN

Nova revisão de contrato.

## 8.18.10 OPERATOR_DECISION

Usado quando reparo pode:

- destruir trabalho;
- adotar estado ambíguo;
- alterar contrato;
- aceitar risco.

---

# 8.19 Recovery matrix

| Estado autoritativo | Observação | Classificação | Ação segura inicial |
|---|---|---|---|
| workspace binding REQUESTED | sem physical mutable workspace | request incompleto | retry ou cancel |
| workspace binding REQUESTED | matching physical mutable workspace | órfão adotável | validate + adopt |
| Lease ACTIVE | mutable workspace existe | healthy | nenhuma |
| Lease ACTIVE | mutable workspace ausente | divergence | block dispatch |
| sem Lease | mutable workspace MNFS-like existe | orphan | inspect/preserve |
| Worker STARTING | processo existe | observe boot | aguardar/inspect |
| Worker STARTING | processo ausente | start failed | retry/new Run |
| Worker RUNNING | processo existe | healthy | nenhuma |
| Worker RUNNING | processo ausente | LOST candidate | reconcile |
| Worker EXITED | Claim ausente | incomplete | resume/correct |
| Claim COMPLETED | Receipts ausentes | awaiting verification | run gates |
| Claim ACCEPTED | tree mudou | stale acceptance | revoke/block |
| Track ACCEPTED | não integrada | awaiting integration | queue |
| Track INTEGRATED | mutable workspace existe | cleanup pending | preserve/release |
| Track RELEASED | mutable workspace existe | cleanup divergence | fenced cleanup |
| Integration RUNNING | process absent | interrupted | inspect candidate |
| Mission CLOSED | active Track existe | invalid close | block/report |

---

# 8.20 Crash consistency

## 8.20.1 SQLite commit before artifact write

Exemplo:

```text
Plan approval committed
→ materialization failed
```

Recovery:

```text
rematerialize from SQLite
```

## 8.20.2 Artifact written before SQLite commit

Artifact é órfão.

Recovery:

- verifica hash;
- adota se intent válido;
- ou remove/preserva conforme policy.

## 8.20.3 Worker writes code before Claim

Código permanece no isolated mutable workspace.

Recovery:

- Mutable workspace diff/result tree;
- Attempt;
- Worker Run;
- no Claim.

Ação:

- resume;
- open Claim via novo Run;
- abandon.

## 8.20.4 Claim accepted before external merge

Track está `ACCEPTED`, não `INTEGRATED`.

Recovery enfileira Integration.

## 8.20.5 Merge completed before SQLite update

Git possui candidate/merge.

Recovery verifica:

- expected refs;
- candidate SHA;
- Integration Run intent.

Pode adotar merge ou bloquear.

---

# 8.21 Git concurrency e integração

## 8.21.1 Integration queue

Inicialmente serial por repository.

Razões:

- reduz conflitos;
- simplifica base;
- facilita proof;
- preserva ordem;
- um Operator.

## 8.21.2 Queue item

```text
integration_run_id
base_sha
ordered_tracks
expected_track_heads
contract_hash
policy_version
```

## 8.21.3 Before compose

Validar:

- Track `ACCEPTED`;
- Claim fresh;
- head esperado;
- base;
- Lease;
- workspace trust.

## 8.21.4 CAS semantics

Atualização de ref precisa validar expected old SHA.

Se falhar:

```text
INTEGRATION_RACE
→ REBASE_REQUIRED
```

## 8.21.5 Track changed after acceptance

Acceptance fica stale.

Não integrar.

## 8.21.6 Rebase

Rebase pode invalidar:

- tree hash;
- Receipts;
- review;
- QA;
- contract assumptions.

Policy calcula re-verificação mínima segura.

---

# 8.22 External resources

## 8.22.1 Problema

Dois isolated mutable workspaces podem usar o mesmo:

- database;
- schema;
- port;
- bucket;
- account;
- browser profile;
- queue;
- provider sandbox.

## 8.22.2 Resource declaration

Repository Profile e Golden Path devem declarar recursos.

Exemplo:

```json
{
  "resources": [
    {
      "id": "postgres:test",
      "mode": "EXCLUSIVE_WRITE",
      "isolation": "schema-per-track"
    },
    {
      "id": "port:http",
      "mode": "EXCLUSIVE_WRITE",
      "allocation": "dynamic"
    }
  ]
}
```

## 8.22.3 Estratégias

- namespace por Track;
- database/schema por Track;
- port allocation;
- container por Track;
- serialização;
- sandbox account por Track;
- read-only sharing.

## 8.22.4 Regra

Se recurso não pode ser isolado:

```text
serializar
```

Não assumir que paralelismo Git garante segurança.

---

# 8.23 Cancellation

## 8.23.1 Soft cancel

Solicita parada cooperativa.

## 8.23.2 Hard cancel

Encerra processo depois de grace period.

## 8.23.3 Domain result

Cancelamento do processo não implica automaticamente:

- Attempt CANCELLED;
- Track ABANDONED;
- Lease RELEASED.

Application Service registra a decisão adequada.

## 8.23.4 Preservation

Antes de cleanup:

- logs;
- diff;
- commits;
- Claims;
- artifacts;
- reason.

## 8.23.5 Cancel race

Worker pode terminar enquanto cancel é enviado.

Fencing e state version decidem qual transição é válida.

---

# 8.24 Pause e resume

## Pause Mission

- bloqueia novos dispatches;
- não mata automaticamente workers;
- policy define active Runs.

## Pause Track

- impede novo Attempt;
- pode manter o isolated mutable workspace;
- Worker pode ser cancelado ou idle.

## Resume

Antes:

```text
reconcile
→ validate contract
→ validate base
→ validate Profile
→ validate Lease
```

Resume nunca usa apenas “continue de onde parou” sem state check.

---

# 8.25 Replan consistency

## 8.25.1 New contract hash

Ao aprovar nova revisão:

- old packs stale;
- pending dispatches invalidated;
- active Attempts classificados;
- Claims antigos stale;
- integration queue reavaliada.

## 8.25.2 Active work

Para cada Track:

```text
REUSE
REVALIDATE
REBASE
SUPERSEDE
ABANDON
```

## 8.25.3 Operator visibility

Replan mostra:

- trabalho preservado;
- trabalho invalidado;
- custo;
- risks;
- next actions.

---

# 8.26 Database backup e corruption

## 8.26.1 Local state importance

SQLite contém estado operacional recuperável, mas importante.

## 8.26.2 Backups

Candidatos:

- backup antes de migration;
- backup antes de upgrade major;
- backup antes de repair destrutivo;
- periodic snapshot futuro.

## 8.26.3 Corruption behavior

Se SQLite não abre ou integrity check falha:

```text
RUNTIME_CORRUPT
```

Bloquear mutações.

## 8.26.4 Recovery sources

- backup;
- Git artifacts;
- isolated mutable workspaces;
- Events;
- logs;
- external state.

## 8.26.5 Limite

Sem event sourcing completo, nem todo estado pode ser reconstruído perfeitamente do Git.

Isso é aceitável no local MVP.

A prioridade é:

- transações;
- backup;
- migrations testadas;
- corruption detection.

Não construir ledger paralelo sem evidência de necessidade.

---

# 8.27 Schema migrations

## 8.27.1 Regras

- versionadas;
- ordenadas;
- transacionais quando possível;
- testadas em banco vazio;
- testadas em versão anterior;
- backup antes de mudança destrutiva;
- rollback ou forward-repair documentado.

## 8.27.2 Startup

MNFS verifica schema version.

Estados:

```text
CURRENT
MIGRATION_REQUIRED
UNSUPPORTED_NEWER
CORRUPT
```

## 8.27.3 Unsupported newer

Runtime antigo não abre banco novo em modo write.

Pode oferecer read-only quando seguro.

## 8.27.4 Migration failure

Nenhuma execução da Mission inicia.

---

# 8.28 Runtime upgrades

## 8.28.1 Version bindings

Estado relevante guarda:

- MNFS version;
- schema version;
- Standard versions;
- Golden Path version;
- adapter capability version.

## 8.28.2 Upgrade invariant

Update não pode reinterpretar silenciosamente transições anteriores.

## 8.28.3 Compatibility

Cada release declara:

- compatible schema range;
- migrations;
- breaking contract changes;
- adapter requirements.

## 8.28.4 In-flight Missions

Mudança material entra:

- na fronteira de Milestone;
- depois de pause;
- ou após explicit migration plan.

---

# 8.29 Garbage collection

## 8.29.1 Objetivo

Remover recursos que não são mais necessários sem perder trabalho ou auditoria.

## 8.29.2 Candidatos

- released isolated mutable workspaces;
- obsolete branches;
- old generated HTML;
- temp logs;
- superseded packs;
- cancelled process metadata;
- stale caches;
- old integration workspaces.

## 8.29.3 Nunca remover automaticamente

- unintegrated diff;
- active Lease;
- active Claim evidence;
- accepted Evidence;
- Decision;
- closeout;
- branch sem classificação.

## 8.29.4 Dry run

```text
mnfs gc
→ report only
```

Mutação:

```text
mnfs gc --apply
```

quando o comando existir.

## 8.29.5 Retention

Repository Profile pode definir:

- logs;
- traces;
- snapshots;
- artifacts;
- temp workspaces.

---

# 8.30 Status e recovery UX

## 8.30.1 Status normal

```text
MIS-002 EXECUTING

M01 CLOSED
M02 ACTIVE

WT-003 ACTIVE
  Worker WR-009 RUNNING
  Attempt A01
  Lease healthy

WT-004 CLAIMED
  Claim CLM-007 awaiting verification

Next:
mnfs verify claim CLM-007
```

## 8.30.2 Divergence

```text
RECOVERY REQUIRED

LD-01 Lease LEASE-004 is ACTIVE,
but its bound isolated mutable workspace is missing.

Affected:
MIS-002/M02/F01
WT-004

Safe actions:
1. mark current workspace binding DIVERGED and re-materialize/rebind the mutable workspace
2. inspect the selected workspace realization

Recommended:
1
```

## 8.30.3 JSON

Inclui:

- expected;
- observed;
- classification;
- severity;
- safe actions;
- recommended action;
- required authority.

---

# 8.31 Failure drills

## 8.31.1 Propósito

Recovery não pode existir apenas em documento.

Precisa de drills automatizados e reais.

## 8.31.2 Drills mínimos

### DR-01 — Lead crash

- worker continua;
- novo Lead recupera Track, Lease e Claim.

### DR-02 — Worker crash sem Claim

- isolated mutable workspace preservado;
- Attempt permanece recuperável.

### DR-03 — Duplicate lease grant

- apenas um Lease ativo.

### DR-04 — Orphan mutable workspace

- detectado;
- não destruído silenciosamente.

### DR-05 — Binding/Lease without mutable workspace

- dispatch bloqueado.

### DR-06 — Late Claim from superseded Attempt

- registrado;
- current state inalterado.

### DR-07 — Integration race

- expected SHA falha;
- loser recebe Rebase Required.

### DR-08 — Receipt stale after commit

- gate não aceita.

### DR-09 — SQLite commit succeeds, artifact write fails

- rematerialization repara.

### DR-10 — Artifact exists, DB commit failed

- orphan detectado.

### DR-11 — Process exit zero without Claim

- Feature não fecha.

### DR-12 — Replan invalidates active pack

- dispatch bloqueado ou Track reconciliada.

### DR-13 — Cancel and completion race

- apenas uma transição válida.

### DR-14 — Database migration failure

- runtime não inicia mutações.

### DR-15 — Herdr unavailable

- workers e status continuam.

## 8.31.3 Real acceptance

Ao menos os drills críticos de M2 precisam rodar no WSL2 real com:

- Agent Runtime;
- selected workspace/environment realization;
- processos;
- filesystem;
- fresh Lead process.

---

# 8.32 M2 recovery slice

M2 deve provar:

```text
one Lead
→ Lease
→ Writer Actor through Agent Runtime
→ Claim
→ Lead killed
→ new Lead
→ recover
→ same Lease and Claim
→ no duplication
→ gate accepts explicitly
```

## M2 inclui

- Lease intent;
- selected workspace adapter;
- Claim transaction;
- Worker Run;
- process observation;
- Recovery Report;
- duplicate prevention;
- orphan detection;
- explicit acceptance;
- idempotent release.

## M2 não inclui

- multiple concurrent Tracks;
- generic resource reservation;
- advanced Integration queue;
- browser QA;
- full Event outbox;
- daemon;
- remote workers;
- cloud recovery;
- cross-machine fencing.

---

# 8.33 Non-goals

Não construir agora:

- distributed consensus;
- Raft;
- leader election;
- Redis locks;
- message broker;
- exactly-once delivery universal;
- multi-machine leases;
- heartbeat daemon obrigatório;
- process supervisor próprio;
- terminal parsing;
- full event-sourced reconstruction;
- cryptographic ledger;
- global transaction coordinator;
- custom workspace pool;
- automatic destructive repair;
- invisible background cleanup;
- retry infinito;
- “self-healing” que oculta divergence.

---

# 8.34 Invariantes de estado e recovery

1. SQLite é autoridade operacional local.
2. Git é autoridade sobre code tree.
3. A selected workspace realization é autoridade somente sobre seu estado físico observado; MNFS conserva a autoridade semântica.
4. Divergence é estado explícito.
5. Unknown não vira healthy.
6. Mensagem não é memória.
7. Session não é identidade.
8. Process exit não fecha trabalho.
9. Operação externa não é tratada como transaction SQLite.
10. Todo efeito externo crítico possui intent e reconcile.
11. Idempotency key evita duplicação.
12. Input diferente com mesma key é conflito.
13. Attempt antigo não sobrescreve Attempt atual.
14. Lease antigo não libera Lease novo.
15. Base SHA é validada antes de integration.
16. Track alterada após aceite fica stale.
17. Isolated mutable workspace não é liberado com trabalho não classificado.
18. Recovery é read-only por default.
19. Reparo destrutivo exige autoridade.
20. Reconcile ocorre antes de ações protegidas.
21. Deadline dispara observação, não sucesso ou falha cega.
22. Late arrival é registrado e classificado.
23. Crash não apaga artifact já produzido.
24. Artifact órfão não é adotado sem validação.
25. Evidence stale permanece histórica, mas não decide.
26. SQLite migration falha fecha o runtime para mutações.
27. Upgrade não reinterpreta estado silenciosamente.
28. GC nunca destrói trabalho não integrado.
29. Drills provam recovery.
30. O sistema prefere bloquear de forma explicável a avançar com realidade ambígua.

---

# Decisão resumida da Seção 8

> **O MNFS mantém estado operacional autoritativo em SQLite e reconcilia esse estado com Git, Mutable Workspace bindings, Execution Environments, Agent Runtime/process observations, artifacts e sistemas externos. Operações locais usam transactions; efeitos externos usam Intent–Action–Observation, idempotência, optimistic concurrency, fencing e reconcile. Runtime Sessions e processos são substituíveis; workspaces/evidências são preservados conforme policy; resultados atrasados não sobrescrevem Attempts atuais; divergências permanecem explícitas. Recovery é um produto verificável por drills, não reconstrução de transcript.**

---

---


## Historical / Incumbent Evidence — M01 Pi/Treehouse Recovery

M01 provou crash windows, fencing, adoption/release e fresh-process recovery usando a realização concreta Pi + Treehouse. Esses resultados continuam Evidence para as invariantes provider-neutral; detalhes de commands, lease IDs e worktree behavior permanecem nos artifacts/closeout de M01 e não selecionam a futura workspace/runtime realization.

---

## ARR-RECONCILIATION-2026-08-07 — Current Context and handoff model

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Authority-critical context is eager: current Authority Snapshot, target, relevant Validation criteria, Execution Unit/Role Contract, architecture/interface constraints, write/resource boundaries, Environment/tool/security policy, proof contract and termination conditions.

Large optional Blueprint history, unrelated Standards, research, vendor docs and tool schemas use progressive disclosure. Runtime Session memory remains observational and may disappear without losing truth.

`HANDOFF_REQUIRED` means bounded context/runtime budget ended with coherent state available for a Fresh Actor; it is neither success nor failure. Handoff communicates structured current truth and the next permitted action, not conversational history.

---

# 9. Contexto, Memória, Comunicação e Eficiência de Tokens

## 9.1 Propósito

Esta seção define como o MNFS preserva continuidade sem transformar uma Session, um transcript, um plugin de memória ou uma compactação probabilística em fonte de verdade.

O problema possui quatro dimensões distintas:

1. **Durabilidade:** o que precisa sobreviver a qualquer Session;
2. **Continuidade:** o que ajuda um Actor a permanecer orientado durante trabalho longo;
3. **Precisão:** como recuperar a origem exata quando um resumo é insuficiente;
4. **Eficiência:** como reduzir contexto, latência e custo sem degradar o resultado.

Uma solução inadequada trataria tudo como “memória”.

O MNFS adota uma arquitetura estratificada:

```text
L0 — Authoritative Product and Domain Memory
L1 — Current Authority Snapshot and Compiled Context
L2 — Session Observational Memory
L3 — Exact Runtime Session History
L4 — Ephemeral Transport
```

No MNFS:

> **Memória observacional ajuda o agente a lembrar. Estado autoritativo determina o que é verdade agora.**

---

# 9.2 Base de pesquisa

Esta decisão foi baseada em:

- documentação oficial de Sessions, Compaction, Extensions, SDK e RPC do Pi;
- `pi-observational-memory` V3;
- `pi-observational-memory-extension`;
- Mastra Observational Memory;
- `pi-memory`;
- `@josephakern/pi-memory`;
- `pi-memctx`;
- `pi-agenticoding`;
- `pi-link`.

A análise completa está registrada em:

```text
MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1.md
```

## 9.2.1 Limite das evidências

Benchmarks de memória conversacional medem recordação em diálogos extensos.

Eles não comprovam diretamente:

- preservação de estado Git;
- correção de Claims;
- independência de Review;
- ausência de false completion;
- recovery de Workers;
- coordenação de Write Tracks;
- qualidade de software produzido.

Por isso, uma ferramenta promissora continua sendo candidata até passar por um spike específico do MNFS.

---

# 9.3 Historical / Incumbent Runtime Reference — Pi session capabilities

## 9.3.1 Session ledger JSONL

Pi persiste Sessions em JSONL.

Cada entry possui `id` e `parentId`, formando uma árvore que preserva branches dentro do mesmo arquivo.

O ledger pode conter:

- user messages;
- assistant messages;
- tool calls;
- tool results;
- compaction entries;
- branch summaries;
- custom messages;
- extension state;
- labels.

Isso fornece o histórico exato da Session.

## 9.3.2 Resume, tree, fork e clone

Pi permite:

- continuar a Session mais recente;
- selecionar uma Session;
- navegar pela árvore;
- criar branch;
- fork;
- clone.

Esses mecanismos preservam continuidade conversacional.

Não substituem o Domain Model do MNFS.

## 9.3.3 Compaction nativa

Pi compacta contexto quando:

- o limite se aproxima;
- ocorre overflow;
- o operador executa `/compact`.

O processo:

1. seleciona um boundary;
2. mantém uma janela recente;
3. resume mensagens anteriores;
4. registra uma Compaction Entry;
5. reconstrói o contexto ativo.

A compactação é lossy.

O histórico original continua no JSONL, mas deixa de estar integralmente no contexto ativo.

## 9.3.4 Extensibilidade

Pi extensions podem:

- interceptar `session_before_compact`;
- substituir o resultado da compactação;
- adicionar entries persistentes;
- registrar tools;
- registrar commands;
- observar lifecycle;
- injetar contexto;
- inspecionar context usage.

Portanto, o MNFS pode experimentar estratégias de memória sem fazer fork do Pi.

## 9.3.5 SDK e RPC

Pi também expõe:

- SDK Node/TypeScript;
- RPC JSONL sobre stdin/stdout;
- streamed events;
- steering;
- follow-ups;
- compaction control;
- session management.

Esses mecanismos serão considerados para controle programático futuro.

M2 continuará com a integração mais estreita capaz de provar o comportamento necessário.

---

# 9.4 Estratos de memória

## 9.4.1 L0 — Authoritative Product and Domain Memory

É a memória canônica.

Fontes:

```text
SQLite
Git
Approved Mission Contracts
ADRs
Product Blueprint
Repository Profile
Engineering Standards
Golden Paths
Decisions
Evidence Bundles
Closeouts
```

Propriedades:

- estruturada;
- validada;
- versionada;
- citável;
- governada por Authority;
- independente de Session;
- capaz de bloquear ou autorizar ações.

Somente L0 pode determinar:

- estado atual;
- contrato vigente;
- Attempt atual;
- Claim aceito;
- Feature fechada;
- Decision válida;
- Waiver ativa.

## 9.4.2 L1 — Current Authority Snapshot e Context Pack

É a projeção autoritativa preparada para um Actor.

Inclui:

```text
target
current lifecycle
current contract hash
current Attempt
current blockers
active Decisions
permitted next actions
Role Contract
Acceptance Criteria
```

É produzido por código a partir de L0.

O Current Authority Snapshot precisa preceder qualquer memória observacional relevante.

## 9.4.3 L2 — Session Observational Memory

É a continuidade probabilística de uma Runtime Session, quando a realization selecionada oferece ou integra esse recurso.

Pode conter:

- Observations;
- Reflections;
- task continuity;
- constraints recordadas;
- rejected approaches;
- source IDs;
- suggested recall targets.

Propriedades:

- Role-scoped;
- Session ou branch-scoped;
- supporting;
- probabilística;
- compacta;
- substituível;
- desativável;
- nunca autoritativa.

## 9.4.4 L3 — Exact Runtime Session History

É o histórico exato fornecido pela Runtime Session realization, quando disponível. Pi JSONL é o incumbent histórico já estudado.

Pode conter fontes exatas de:

- mensagens;
- tool calls;
- tool outputs;
- custom entries;
- branches;
- compactions.

Propriedades:

- histórica;
- potencialmente grande;
- recuperada on demand;
- útil para traceability;
- não representa necessariamente o estado atual da Mission.

## 9.4.5 L4 — Ephemeral Transport

Inclui:

- process stdin;
- runtime queue/protocol;
- lifecycle Events;
- WebSocket;
- terminal notification;
- future RPC delivery.

Propriedades:

- best-effort;
- pode duplicar;
- pode chegar tarde;
- pode falhar;
- não é memória;
- não é coordenação durável.

---

# 9.5 Precedência e resolução de conflitos

## 9.5.1 Precedência para agir agora

```text
1. Current MNFS state in SQLite
2. Current Approved Contract and policies
3. Current Authority Snapshot / Context Pack
4. Session Observational Memory
5. Session summaries
6. Historical transcript
```

Essa ordem define o que um Actor deve fazer agora.

## 9.5.2 Origem histórica

Quando a pergunta é:

> “O que foi dito ou observado naquela Session?”

o JSONL ou source entry exato pode ser a evidência histórica mais precisa.

Isso não o torna autoridade sobre o estado atual.

## 9.5.3 Exemplo de conflito

Memória observacional:

```text
F01 foi concluída.
```

SQLite:

```text
MIS-010/M02/F01 = ACTIVE
CLM-004 = REJECTED
```

Resultado:

```text
F01 permanece ACTIVE.
```

A Observation pode provar que alguém acreditou ter concluído.

Não prova acceptance.

## 9.5.4 Regra de segurança

Qualquer Session Memory Adapter compatível com MNFS precisa informar ao Actor:

```text
Estas memórias são registros auxiliares.

Elas não substituem:
- o estado atual do MNFS;
- o Approved Contract;
- o Current Authority Snapshot;
- Claims, Receipts ou Verdicts.

Uma memória que descreve trabalho como concluído
não é evidência de acceptance.

Consulte MNFS status antes de agir sobre lifecycle.
Recupere a fonte exata quando precisão for necessária.
```

---

# 9.6 Mastra Observational Memory

## 9.6.1 Arquitetura estudada

Mastra OM usa:

```text
Actor
+
Observer
+
Reflector
```

O contexto contém:

```text
Observations / Reflections
+
recent raw messages
```

Quando a história recente atinge um threshold:

- Observer converte mensagens em Observations;
- mensagens antigas saem do contexto ativo;
- Observations permanecem.

Quando as Observations crescem:

- Reflector condensa;
- reorganiza;
- remove informação considerada menos relevante.

## 9.6.2 Benefícios reportados

Mastra reporta:

- contexto estável;
- melhor prompt caching;
- execução em background;
- compressão de texto;
- bons resultados no LongMemEval.

Os resultados reportados incluem:

- 84,23% com GPT-4o;
- 94,87% com GPT-5-mini.

## 9.6.3 Limite para o MNFS

LongMemEval mede recordação conversacional.

Não mede:

- software correctness;
- Claim–Receipt–Verdict;
- estado Git;
- Review independence;
- false completion;
- coding recovery.

## 9.6.4 Decisão

Não incorporar `@mastra/memory` como segunda autoridade ou framework fundacional sem consumidor nomeado e conformance proof.

Isso adicionaria:

- outro agent framework;
- outro lifecycle;
- outro storage;
- outro sistema de memória;
- outra fonte potencial de autoridade.

O MNFS adota apenas as ideias arquiteturais; qualquer implementação futura deve encaixar na boundary de Runtime Session sem inverter autoridade.

---

# 9.7 Historical / Incumbent Candidate Study — `pi-observational-memory` V3

## 9.7.1 Estado pesquisado

Versão analisada:

```text
3.0.3
```

Características publicadas:

- Pi extension;
- MIT;
- zero runtime dependencies;
- Observation;
- Reflection;
- Dropper;
- source-backed recall;
- background memory work;
- custom compaction;
- branch ledger;
- visible/full views.

## 9.7.2 Lifecycle

```text
turn_end
→ Observer when due
→ Reflector when due
→ Dropper after Reflection

agent_end
→ proactive compaction trigger when due

session_before_compact
→ deterministic rendering
```

A compactação não precisa esperar um model call naquele momento.

## 9.7.3 Ledger

V3 registra entries como:

```text
om.observations.recorded
om.reflections.recorded
om.observations.dropped
```

Observations possuem source IDs.

Reflections referenciam supporting Observations.

Dropped Observations deixam a memória ativa, mas permanecem no histórico do ledger.

## 9.7.4 Recall

A tool `recall` recupera fontes para um Observation ou Reflection ID.

Isso melhora:

- traceability;
- source verification;
- debugging;
- precisão antes de Decision material.

Recall não é semantic search geral.

## 9.7.5 Pontos fortes

- integração nativa ao Pi;
- sem banco externo;
- histórico exato preservado;
- source-backed memory;
- compactação preparada em background;
- inspecionável;
- substituível;
- pode ser desligada;
- encaixa no lifecycle de Session.

## 9.7.6 Riscos

### Probabilistic compression

Observer, Reflector e Dropper são agentes.

Podem:

- omitir;
- distorcer;
- generalizar;
- preservar algo obsoleto;
- classificar relevance incorretamente.

### Completion authority conflict

A renderização padrão publicada orienta que trabalho descrito como concluído não seja refeito, salvo pedido do usuário.

No MNFS:

```text
memory says completed
≠ Claim accepted
```

A configuração padrão não deve ser adotada como autoridade.

### Session scope

A memória vive na Session ou branch.

Não é Repository Memory canônica.

### Upgrade compatibility

V3 não lê o formato V2.

Rollback também não preserva continuidade entre os formatos.

### Cost

Observer, Reflector e Dropper usam model calls.

Sem model override, podem usar o modelo da Session.

### Benchmark gap

Não há evidência publicada suficiente para afirmar benefício líquido no fluxo MNFS.

## 9.7.7 Classificação

```text
CANDIDATE
→ HISTORICAL CANDIDATE / future spike required before adoption
```

Uso inicial proposto:

```text
MNFS Lead only
```

Não habilitar globalmente para todas as Roles.

## 9.7.8 Binding

O MNFS precisa possuir um `SessionMemoryAdapter`.

O Domain Core não importa o package.

A extensão pode ser:

- instalada;
- desativada;
- substituída;
- atualizada;
- removida;

sem migration do Domain State.

---

# 9.8 Historical / Incumbent Candidate Study — `pi-observational-memory-extension`

## 9.8.1 Capacidades

A alternativa pesquisada oferece:

- Mastra-style OM;
- session ou project scope;
- local retrieval;
- optional embedding retrieval;
- background buffering;
- secret redaction;
- TUI inspection.

## 9.8.2 Vantagens

- mais recursos de retrieval;
- cross-session/project scope;
- richer memory management.

## 9.8.3 Riscos

- implementação mais jovem;
- project memory concorre com o MNFS;
- retrieval adiciona policy;
- maior superfície;
- risco de cross-Role contamination;
- overlap com Repository Profile e Context Packs.

## 9.8.4 Decisão

```text
DEFER
```

Usar como referência.

Não adotar project-scoped OM agora.

---

# 9.9 Historical repository-memory candidate survey

## 9.9.1 `pi-memory`

Fornece semantic search sobre:

- long-term memory;
- daily logs;
- scratchpad.

É útil para memória pessoal e uso geral do Pi.

Não deve ser o core do MNFS.

## 9.9.2 `@josephakern/pi-memory`

Fornece:

- `MEMORY.md` capped;
- páginas por tópico;
- global/project scope;
- strict writeback;
- archive;
- introspection.

Padrões úteis:

- index curto;
- detalhes on demand;
- writeback explícito;
- archive em vez de apagamento silencioso;
- limite de injeção.

Conflito:

- duplicaria Repository Profile;
- Decisions;
- Standards;
- Product Memory.

## 9.9.3 `pi-memctx`

Fornece:

- Markdown memory packs;
- qmd ou grep;
- retrieval;
- auto-learning;
- review queue;
- runbooks;
- Decisions;
- Observations;
- fallback para inspeção real.

É um sistema de memória de workspace sofisticado.

Também sobrepõe diretamente:

- Repository Profile;
- Context Pack Compiler;
- Decisions;
- Code Map;
- Golden Paths;
- Memory Promotion.

## 9.9.4 Decisão

Não adotar outro project-memory system como fonte concorrente.

Reutilizar padrões:

- capped index;
- source-visible Markdown;
- review queue;
- strict writeback;
- secret redaction;
- fallback para inspeção real;
- archive;
- on-demand detail.

---

# 9.10 Historical handoff reference — `pi-agenticoding`

## 9.10.1 Capacidades

Fornece:

- spawn;
- task-scoped notebook;
- handoff;
- topic;
- readonly;
- context-pressure visibility.

A ideia central:

```text
same task
→ isolate noise or use notebook

new task
→ deliberate handoff
```

## 9.10.2 Padrões úteis

- memória limitada à tarefa;
- handoff escrito pelo Actor;
- restart deliberado;
- readonly investigation;
- context-pressure visibility;
- não manter forever memory sem necessidade.

## 9.10.3 Conflito

Sobrepõe:

- Worker spawning;
- Context Packs;
- Handoff Artifacts;
- Investigator Role;
- readonly policy;
- Session rotation.

## 9.10.4 Decisão

```text
ADOPT PRINCIPLES
DO NOT MAKE CORE DEPENDENCY
```

Pode ser usado pessoalmente durante desenvolvimento.

O produto final mantém sua própria semântica.

---

# 9.11 Context Pack

## 9.11.1 Definição

Context Pack é o Artifact compilado pelo MNFS para:

- uma Role;
- um target;
- um Attempt;
- um estado autoritativo.

Observational Memory não substitui o Pack.

## 9.11.2 Estrutura conceitual

```ts
interface ContextPack {
  id: ContextPackId;
  role: ActorRole;
  target: EntityReference;

  contractHash: string;
  expectedBaseSha?: string;

  authoritySnapshotRef: ArtifactRef;

  objective: string;
  acceptanceCriteria: AcceptanceCriterionRef[];

  scope: {
    included: string[];
    excluded: string[];
  };

  writeSet?: string[];
  readContext?: ContextReference[];

  contracts: ArtifactRef[];
  decisions: DecisionRef[];
  standards: StandardBinding[];
  goldenPath?: GoldenPathBinding;
  waivers: WaiverRef[];

  invariants: string[];
  negativePaths: string[];
  examples: ExampleReference[];

  commands: CommandBinding[];
  verificationPlan: VerificationBinding[];

  allowedActions: string[];
  forbiddenActions: string[];
  autonomyBudget: AutonomyBudget;

  outputContract: ArtifactRef;
  escalationProtocol: ArtifactRef;

  generatedAt: string;
  contentHash: string;
}
```

## 9.11.3 Tipos

```text
PLANNING_PACK
INVESTIGATION_PACK
WRITER_PACK
REVIEW_PACK
CORRECTION_PACK
INTEGRATION_PACK
QA_PACK
CLOSEOUT_PACK
HANDOFF_PACK
```

## 9.11.4 Compilação

```text
Approved Contract
+
Current MNFS State
+
Documentation Map
+
Repository Profile
+
Feature / Milestone
+
Decisions
+
Standards
+
Golden Path
+
Git base
+
Code Map
+
Findings
+
Role Contract
→ Context Pack
```

## 9.11.5 Código antes de LLM

Campos mecânicos são compilados por código:

- identities;
- state;
- criteria;
- hashes;
- commands;
- dependencies;
- policy;
- versions.

Campos LLM-produced são marcados.

---

# 9.12 Current Authority Snapshot

## 9.12.1 Objetivo

Neutralizar:

- memória stale;
- transcript antigo;
- Session resumida;
- late Observation;
- Decision superseded;
- false completion.

## 9.12.2 Conteúdo mínimo

```text
repository
mission
target
current contract hash
current phase
current attention
current Attempt
active Claim
current blockers
active Decisions
valid Waivers
next permitted actions
generated_at
source versions
```

## 9.12.3 Injeção

O Snapshot deve ser entregue:

- no início do dispatch;
- no resume;
- depois de Replan;
- depois de Recovery;
- depois de Decision material;
- antes de uma ação de lifecycle.

## 9.12.4 Precedência

Quando Snapshot e Session Memory discordarem:

```text
Snapshot wins
```

Quando o Snapshot parece incorreto:

```text
reconcile
```

Não obedecer à memória.

---

# 9.13 Progressive Disclosure

## 9.13.1 Camadas

```text
Layer 0 — Current Authority Snapshot
Layer 1 — Contract and Criteria
Layer 2 — Local Code and Interfaces
Layer 3 — Standards, Profile and Examples
Layer 4 — Cross-system Context
Layer 5 — Historical Evidence and Recall
```

## 9.13.2 Writer

Recebe:

- Snapshot;
- Writer Pack;
- relevant code;
- Standards;
- Golden Path;
- verification;
- Claim protocol.

Não recebe todo o histórico da Mission.

## 9.13.3 Reviewer

Recebe:

- cold Snapshot;
- fixed SHA;
- Review Pack;
- diff;
- Claim;
- Receipts;
- Findings.

Não recebe Lead OM nem Writer OM.

## 9.13.4 QA

Recebe:

- candidate SHA;
- Journey;
- environment;
- expected observations.

Não recebe a narrativa da implementação.

---

# 9.14 Política de memória por Role

| Role | OM | Razão |
|---|---|---|
| MNFS Lead | Candidata após spike | Session longa e coordenação |
| Planner | Opcional | múltiplas revisões do mesmo plano |
| Investigator | Off | trabalho curto e Artifact-first |
| Writer | Off por default | Pack bounded |
| Writer longo | Condicional | Track multi-dia |
| Reviewer inicial | Off | independência |
| Reviewer remedy | mesma Session | continuidade no mesmo Finding |
| Integrator | Off | processo curto |
| QA | Off/fresh | evitar bias |
| Closeout | Opcional | agregação estruturada domina |

## 9.14.1 Isolation

Nunca compartilhar OM entre:

- duas Write Tracks;
- Lead e Writer;
- Writer e Reviewer;
- Reviewer e QA;
- Missions diferentes.

## 9.14.2 Project-scoped OM

Não é adotada.

Repository truths pertencem ao MNFS.

---

# 9.15 Exact recall

## 9.15.1 Quando usar

Recall é exigido quando uma Observation:

- influencia Decision D3–D5;
- afirma mudança de contrato;
- afirma completion;
- contradiz estado atual;
- preserva detalhe crítico;
- está comprimida demais;
- precisa de traceability.

## 9.15.2 Recall não é broad search

O Actor não deve carregar transcript inteiro.

Recupera somente:

- Observation ID;
- Reflection ID;
- source entries relevantes.

## 9.15.3 Resultado

A fonte recuperada continua histórica.

Para virar estado canônico:

```text
promote through MNFS
```

---

# 9.16 Memory Candidate Promotion Gateway

## 9.16.1 Problema

Uma descoberta útil pode nascer em:

- Session;
- Observation;
- Reflection;
- Investigation;
- Review;
- Finding;
- QA.

Ela não deve ficar perdida.

Também não deve virar verdade canônica automaticamente.

## 9.16.2 Fluxo

```text
Observation / Reflection / Source
        ↓
Memory Candidate
        ↓
source verification
        ↓
classification
        ↓
Authority check
        ↓
canonical target
        ↓
persist
```

## 9.16.3 Targets

- Decision;
- Repository Profile amendment;
- Standard candidate;
- Golden Path improvement;
- Defect Class;
- Review Learning;
- Evidence;
- gardening task.

## 9.16.4 Conceito de comando futuro

```text
mnfs memory propose
```

Inputs:

- source ID;
- exact source;
- proposed target;
- scope;
- rationale.

## 9.16.5 Regra

Session Memory Adapter não escreve diretamente em L0.

---

# 9.17 Session handoff

## 9.17.1 Handoff Pack

Contém:

```text
target
current state
contract
active Decisions
active Tracks
Claims
Findings
Evidence
divergences
next action
risks
```

## 9.17.2 Lead resume

### Mesma Session

Pode usar:

- runtime-native resume when the selected Agent Runtime supports it;
- optional Session Memory Adapter when separately applicable;
- Current Authority Snapshot.

Runtime-native resume is a convenience only; it never replaces Fresh Recovery or current Authority.

### Nova Session

Usa:

- Handoff Pack;
- Current Authority Snapshot;
- Approved Contract.

Não depende de OM.

## 9.17.3 Worker continuation

Novo Worker Run recebe:

- same Attempt ou new Attempt;
- current diff;
- current Pack;
- previous Claim;
- Correction;
- explicit next goal.

## 9.17.4 Deliberate rotation

Boas fronteiras:

- Planning complete;
- execution start;
- Milestone;
- independent Review;
- QA;
- Closeout.

---

# 9.18 Comunicação e mensagens

## 9.18.1 Mensagem não é memória

Mensagens entregam:

- wake-up;
- pointer;
- steering;
- notification.

Estado durável vive em L0.

## 9.18.2 Envelope

```ts
interface MnfsMessage {
  messageId: string;
  type: string;

  sender: ActorRef;
  recipient: ActorRef | RoleRef;
  target: EntityReference;

  attemptId?: AttemptId;
  artifactRefs: ArtifactRef[];
  correlationId: string;

  sentAt: string;
}
```

## 9.18.3 Semântica

```text
at-least-once notification
+
idempotent domain operation
+
durable Artifact
```

Mensagem pode:

- duplicar;
- falhar;
- chegar tarde.

## 9.18.4 Payload

Não trafegar:

- diff completo;
- transcript;
- plano inteiro;
- logs longos;
- Evidence Bundle.

Enviar Artifact refs.

---

# 9.19 Historical transport reference — `pi-link`

## 9.19.1 Capacidades

`pi-link` fornece:

- WebSocket local;
- terminais nomeados;
- direct chat;
- remote prompts;
- status;
- session-resume helpers.

## 9.19.2 Uso potencial

- despertar Reviewer;
- steering humano;
- enviar pointer para novo Claim;
- visualizar Actors em múltiplos terminais.

## 9.19.3 Limites arquiteturais

Não é source of truth.

Não substitui:

- SQLite;
- outbox;
- command state;
- Claim;
- Decision;
- process supervision.

## 9.19.4 Decisão

```text
DEFER
```

Pode entrar depois como:

```text
NotificationTransportAdapter
```

Fluxo futuro:

```text
durable command in MNFS
→ pi-link frame
→ Actor wakes
→ Actor reads command from MNFS
→ result persists in MNFS
```

## 9.19.5 M2

M2 não depende de `pi-link`.

---

# 9.20 M2 communication model

```text
Lead
→ MNFS dispatches a bounded Actor through the selected Agent Runtime using the compiled Actor Pack

Writer Actor
→ MNFS CLI/API opens/completes Claim

Lead dies
→ Actor and bound workspace/environment may continue according to contract

Fresh Lead
→ SQLite + Git + runtime/workspace/environment observations reconcile
```

No message bus, transcript replay, shared OM, project-memory plugin or SDK-host assumption is required by the M2 outcome.

---

# 9.21 Uma memória por concern

Do not activate multiple overlapping Runtime Session memory/compaction plugins for the same Role without an explicit comparison/Decision. The current policy is:

```text
at most one optional Session Memory Adapter per Role
+
one canonical MNFS memory/authority system
+
exact source-backed recall when material
```

This avoids competing context injection, precedence conflicts, token bloat, hidden writes, hook collisions, duplicated background work and stale-memory duplication. Vendor-specific plugins studied earlier remain research/incumbent Evidence until the selected Agent Runtime creates a named consumer.

---

# 9.22 Skills, prompts e templates

## 9.22.1 Skills

Skills orientam:

- Role;
- fluxo;
- primeira ação;
- comandos;
- output;
- judgment rubric;
- escalation.

Não armazenam:

- current state;
- current IDs;
- current hash;
- active Findings;
- Lease;
- Claim.

## 9.22.2 Prompt fino

Prompt de dispatch contém:

```text
Role
Target
Current Authority Snapshot ref
Context Pack ref
Output Contract
Budget
Termination condition
Escalation
```

## 9.22.3 Templates

Templates ajudam consistência.

Schemas validam.

Templates não são autoridade.

---

# 9.23 Context Budget

## 9.23.1 Limites

Cada Role possui budget para:

- tokens;
- files;
- symbols;
- Artifacts;
- log size;
- examples;
- history depth;
- tool output.

## 9.23.2 Overflow

Quando exceder:

- dividir;
- indexar;
- carregar on demand;
- criar Investigation;
- produzir summary com source refs;
- gerar outro Pack.

Não truncar conteúdo decisivo silenciosamente.

## 9.23.3 Truncation marker

```text
truncated: true
omitted: ...
full_ref: ...
```

---

# 9.24 Token accounting

## 9.24.1 Unidade

Medir por:

- Mission;
- Milestone;
- Feature;
- Write Track;
- Attempt;
- Worker Run;
- Role;
- provider/model;
- phase.

## 9.24.2 Contadores

```text
actor input tokens
actor output tokens
observer tokens
reflector tokens
dropper tokens
cache reads/writes
estimated cost
duration
turns
tool calls
pack size
compaction count
telemetry coverage
evaluation cost
```

## 9.24.3 Coverage

```text
COMPLETE
PARTIAL
UNKNOWN
```

Somente cobertura completa calibra policy automaticamente.

## 9.24.4 Regra

Economia do Actor não é economia total quando Observer e Reflector consomem mais.

Medir o sistema completo.

---

# 9.25 Eficiência

## 9.25.1 Métricas úteis

- accepted work per total token;
- context loaded versus used;
- compactions per Mission;
- facts lost after compaction;
- exact recalls;
- false-memory rate;
- stale-memory conflicts;
- Correction rounds;
- repeated repository reads;
- time to resume;
- total cost of memory workers;
- latency saved at compaction.

## 9.25.2 Métricas perigosas

Não otimizar isoladamente:

- menor token count;
- maior compression ratio;
- maior Session lifetime;
- menos recalls;
- menos Context;
- menor cost por turn.

Isso pode causar perda de qualidade.

## 9.25.3 Objetivo

> Confiança suficiente com menor custo total de contexto, coordenação e retrabalho.

---

# 9.26 Historical / Deferred Candidate Study — AS-01 Session Memory

## 9.26.1 Objetivo

Comparar:

```text
A. Pi native compaction
B. pi-observational-memory V3
```

Não comparar vários plugins inicialmente.

## 9.26.2 Ambiente

- WSL2;
- Pi version pinned;
- `pi-observational-memory@3.0.3`;
- test repository;
- known memory model;
- cost tracking;
- debug logs during spike;
- package source reviewed.

## 9.26.3 Cenários

### S1 — Long Lead Session

Forçar múltiplas compactações e verificar:

- objetivo;
- rejected alternatives;
- Operator Decisions;
- blockers;
- next action.

### S2 — Source-backed recall

Recuperar fontes exatas de Observations e Reflections.

### S3 — Knowledge update

Decisão antiga é substituída.

Verificar latest state e history.

### S4 — False completion conflict

OM afirma complete.

SQLite afirma rejected.

SQLite precisa vencer.

### S5 — Contract change

Approved Contract muda.

Novo Snapshot precisa vencer memória antiga.

### S6 — Observer failure

Falhar credentials ou model.

The studied Pi runtime and MNFS remain usable in this historical scenario.

### S7 — Resume same Session

Fechar e retomar a mesma Session.

### S8 — Brand-new Lead Session

Recuperar somente com Handoff Pack e Snapshot.

### S9 — Role isolation

Writer e Reviewer não recebem Lead OM.

### S10 — Multiple compactions

Executar ao menos três ciclos.

### S11 — Upgrade/rollback

Documentar reset e incompatibilidade V2/V3.

### S12 — Cost and latency

Medir custo completo.

## 9.26.4 Acceptance Criteria

Aceitar somente quando:

1. nenhum critical false memory aparece no corpus;
2. Current Authority sempre vence;
3. source recall funciona;
4. três compactações preservam deciding facts;
5. falha da OM não altera Domain State;
6. nova Session recupera sem OM;
7. Reviewer e QA continuam isolados;
8. custo e latência são medidos;
9. benefício sobre native compaction é material;
10. instalação, upgrade, disable e rollback são documentados.

## 9.26.5 Removal Conditions

Desativar quando:

- false memory material;
- false completion;
- custo maior que benefício;
- falha bloqueia Actor;
- upgrade quebra frequentemente;
- source recall é inconsistente;
- manutenção é desproporcional.

---

# 9.27 Current memory realization matrix

| Mechanism / class | Current disposition | Role in MNFS |
|---|---|---|
| Exact Runtime Session history | `ADAPT` when available | observational exact history, never authority |
| Runtime-native compaction | `REFERENCE / ADAPT` after runtime selection | optional runtime fallback |
| Session Memory Adapter | `DEFER / SPIKE` until named consumer | optional Lead continuity |
| Repository Profile / Context Index / Code Map | `OWN` semantics | canonical repository/context knowledge |
| MNFS SQLite | `ADOPT` | durable operational coordination |
| Git artifacts | `ADOPT` | canonical versioned code/result/doc identity |
| Prior Pi JSONL / OM / pi-link / pi-memctx studies | `HISTORICAL / REFERENCE` | incumbent evidence and design patterns only |

No memory plugin or runtime-specific transport is selected constitutionally by this matrix.

---

# 9.28 Impacto no roadmap

## M2

Não depende de:

- Observational Memory;
- runtime-specific notification transport;
- generic Context Compiler;
- shared project memory;
- SDK host.

M2 usa:

- fixed Writer Pack;
- Dispatch Packet;
- selected Agent Runtime execution;
- CLI;
- SQLite;
- Claim;
- Recovery.

## Pós-M2

Qualquer futuro default de long-running Session Memory exige um novo bounded spike/Decision sobre a Runtime selecionada.

## Antes de múltiplos Actors live

Definir durable command/outbox semantics.

Depois avaliar transport adapter.

## Antes de project-wide retrieval

Repository Profile, Context Index e Code Map precisam existir.

Só então comparar a abordagem própria com suitable runtime/repository retrieval candidates; the prior `pi-memctx` study remains historical reference.

---

# 9.29 ADRs decorrentes

Após aprovação desta seção, criar:

## ADR-0004 — Memory strata and session observational memory

Decide:

- memória canônica em SQLite/Git;
- OM como supporting Session Memory;
- Snapshot possui precedência;
- Role isolation;
- plugin somente após spike.

## ADR-0005 — Durable coordination versus ephemeral transport

Decide:

- estado e comandos duráveis no MNFS;
- transporte apenas entrega ou desperta;
- M2 uses durable MNFS state plus the selected concrete Agent Runtime boundary;
- runtime-specific notification transport remains deferred; the prior `pi-link` study is historical reference.

---

# 9.30 Non-goals

Não construir agora:

- memória universal;
- shared OM entre Roles;
- project-scoped OM;
- vector database;
- RAG obrigatório;
- transcript como state;
- automatic memory promotion;
- Mastra runtime dentro do MNFS;
- múltiplos memory plugins;
- message bus no M2;
- background memory agent por Worker;
- OM como Evidence;
- OM como gate;
- OM como completion authority;
- semantic search antes de Context Index;
- forever memory para trabalho transitório;
- reconstrução integral de transcript a cada restart.

---

# 9.31 Invariantes de contexto e memória

1. L0 é a memória canônica.
2. SQLite e Approved Contract vencem qualquer memória de Session.
3. Current Authority Snapshot precede OM.
4. OM é `SUPPORTING`, nunca `AUTHORITATIVE`.
5. Exact Runtime Session history, when available, is observational history rather than current domain state.
6. História exata não é necessariamente estado atual.
7. Session nova recupera sem OM.
8. Role memory é isolada.
9. Lead OM não chega ao Reviewer.
10. Writer OM não chega ao QA.
11. Project-scoped OM não é adotada.
12. Memory Adapter não escreve Domain State.
13. Memory Candidate não é promovida automaticamente.
14. Completion recordada não é acceptance.
15. Recall é usado quando precisão material é necessária.
16. Mensagem não é memória.
17. Transporte pode falhar sem perder estado.
18. Context Pack continua obrigatório.
19. Pack stale não pode iniciar dispatch.
20. Skills não armazenam current state.
21. Prompt não é contrato.
22. Uma Role possui no máximo um Session Memory Adapter ativo.
23. Runtime-native compaction may be a fallback only after a concrete runtime is selected and proven.
24. Plugin third-party é pinned e revisado.
25. Upgrade de memory format exige drill.
26. Observer cost entra no custo total.
27. Compression ratio não substitui correctness.
28. Reviewer inicial permanece cold.
29. M2 não depende de OM ou runtime-specific notification transport.
30. Tooling é adotado somente depois de spike com critérios e Removal Conditions.

---

# Decisão resumida da Seção 9

> **O MNFS separa memória canônica, contexto compilado, memória observacional, Exact Runtime Session History e transporte efêmero. SQLite, Git e o Approved Contract permanecem soberanos. Runtime Session history e memory são observacionais, opcionais e substituíveis; nenhuma implementação recebe autoridade sobre completion. Pi JSONL e pi-observational-memory permanecem incumbent/research Evidence, não seleção constitucional. Plugins de memória não viram fontes concorrentes; novos consumidores exigem spike/Decision próprio. M2 permanece independente de OM e de transcript.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current security and Execution Environment semantics

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

The separate planes remain: Domain Authority, Tool Capability, process/compute isolation, Execution Environment lifecycle, Credential brokerage, Network/Egress policy, External Effect Gate and Evidence/Audit/Reconcile.

**E0 → E4 ordinal ladder is superseded** as the semantic model. Environment requirements are independent properties such as agent placement, compute location, isolation boundary, workspace model, persistence, network posture, credential delivery, resource limits, recovery capability and Git result boundary.

`CONTROL_SIDE` placement is preferred when strict MNFS-brokered capabilities are provable so provider credentials stay outside untrusted execution. `IN_ENVIRONMENT` is used when whole-agent containment is required, with brokered credential/inference delivery preferred over raw secrets. Protected execution fails closed. No concrete sandbox/microVM/workspace substrate is selected until the approved ARR-S0/S2/S2W evidence gates.

---

# 10. Segurança, Isolamento, Ambientes, Credenciais e Efeitos Externos

## 10.1 Propósito

Esta seção define como o MNFS limita tecnicamente e governa semanticamente o que um Actor pode:

- ler;
- escrever;
- executar;
- conectar;
- autenticar;
- alterar;
- publicar;
- destruir;
- enviar;
- consumir;
- operar fora do repositório.

O objetivo é impedir que:

- um Worker execute com todo o poder do usuário WSL;
- um worktree seja confundido com sandbox;
- um container seja confundido com autorização;
- uma permissão concedida em prompt seja confundida com enforcement;
- secrets sejam copiados para Context Packs, logs ou memória observacional;
- acesso de rede amplo permita exfiltração;
- uma ferramenta permitida realize um efeito não autorizado;
- um Worker altere a própria política de segurança;
- um dependency script comprometa o host;
- dois Tracks contaminem o mesmo banco ou provider;
- um agent opere produção apenas porque possui credentials;
- uma third-party Agent Runtime extension não revisada entre no trusted computing base;
- uma sandbox failure degrade silenciosamente para execução irrestrita.

No MNFS:

> **Authority define o que uma ação significa e quem pode autorizá-la. Isolation define o que o processo consegue fazer tecnicamente. As duas são necessárias.**

---

# 10.2 Base de pesquisa

Esta seção foi construída com base em documentação e implementações de mercado, incluindo:

- Pi Extensions, Packages e sandbox example;
- Anthropic Sandbox Runtime;
- permission model do Claude Code;
- OpenAI guidance para autonomy e approval boundaries;
- Development Container Specification;
- Daytona Sandboxes e sua Pi extension;
- E2B Sandboxes;
- Ona Environments e Agents;
- Firecracker microVMs;
- GitHub Actions OIDC;
- AWS temporary credentials e least privilege;
- 1Password CLI;
- SOPS;
- NIST SSDF;
- OpenSSF Scorecard.

A análise completa está registrada em:

```text
MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.md
```

## 10.2.1 Limite das referências

Ferramentas de mercado não definem automaticamente o modelo correto do MNFS.

Cada uma resolve partes diferentes:

- Pi oferece extensão e tool interception;
- Sandbox Runtime oferece enforcement local;
- Dev Containers oferecem reproducibilidade;
- Daytona, E2B e Ona oferecem ambientes remotos;
- Firecracker oferece uma referência de isolamento por microVM;
- OIDC, STS, 1Password e SOPS resolvem classes diferentes de credential delivery;
- SSDF e Scorecard ajudam a organizar supply-chain security.

O MNFS precisa compor essas ideias sem duplicar suas autoridades.

---

# 10.3 Distinções fundamentais

## 10.3.1 Authority

Define quem pode decidir que uma ação é permitida.

Exemplo:

```text
Operator pode autorizar deploy.
```

## 10.3.2 Permission

Define se uma operação é permitida pela policy atual.

Exemplo:

```text
Writer pode executar testes.
Writer não pode executar git push.
```

## 10.3.3 Capability

É uma operação técnica disponibilizada ao Actor.

Exemplo:

```text
RUN_TESTS
WRITE_TRACK
READ_PROVIDER_SANDBOX
CREATE_PULL_REQUEST
```

## 10.3.4 Tool permission

Controla se uma tool call pode ser iniciada.

Pode ser aplicada por:

- Agent Runtime extension;
- allowlist;
- denylist;
- permission prompt;
- MNFS tool wrapper.

Não é necessariamente uma barreira de sistema operacional.

## 10.3.5 OS sandbox

Limita tecnicamente o processo e seus filhos.

Pode controlar:

- filesystem;
- network;
- Unix sockets;
- process namespaces;
- syscalls;
- resource use.

## 10.3.6 Worktree isolation

Separa árvores de código concorrentes.

Não separa:

- credentials;
- home directory;
- network;
- database;
- port;
- provider account;
- Docker daemon;
- Windows filesystem;
- processos.

## 10.3.7 Environment reproducibility

Define:

- runtimes;
- packages;
- services;
- users;
- startup;
- configuration.

Dev Containers resolvem principalmente essa dimensão.

## 10.3.8 Environment isolation

Separa recursos de uma execução dos recursos de outra.

Pode usar:

- process sandbox;
- container;
- VM;
- microVM;
- remote sandbox.

## 10.3.9 Credential Grant

Disponibiliza uma identidade limitada a um target, escopo e tempo.

## 10.3.10 External Effect

É uma mudança observável fora do workspace isolado.

Exemplos:

- push;
- PR;
- issue comment;
- provider mutation;
- deployment;
- production write;
- purchase;
- email;
- migration;
- deletion.

---

# 10.4 Princípio de defesa em profundidade

O modelo MNFS possui oito planos complementares:

```text
Plane 1 — Domain Authority
Plane 2 — Tool Capability
Plane 3 — Process Sandbox
Plane 4 — Execution Environment
Plane 5 — Credential Broker
Plane 6 — Network and Egress Policy
Plane 7 — External Effect Gate
Plane 8 — Evidence, Audit and Reconcile
```

## 10.4.1 Plane 1 — Domain Authority

Responde:

> Quem pode autorizar esta ação?

## 10.4.2 Plane 2 — Tool Capability

Responde:

> A operação técnica necessária foi disponibilizada a este Role?

## 10.4.3 Plane 3 — Process Sandbox

Responde:

> Mesmo que o processo tente ultrapassar a policy, o sistema operacional o impede?

## 10.4.4 Plane 4 — Execution Environment

Responde:

> Onde o código, dependências e serviços estão executando e quais recursos são compartilhados?

## 10.4.5 Plane 5 — Credential Broker

Responde:

> Qual identidade temporária e limitada está disponível?

## 10.4.6 Plane 6 — Network Policy

Responde:

> Para onde o processo pode enviar dados?

## 10.4.7 Plane 7 — External Effect Gate

Responde:

> O efeito específico foi aprovado e ainda está dentro do contrato?

## 10.4.8 Plane 8 — Evidence e Reconcile

Responde:

> O que realmente aconteceu e o estado externo corresponde ao registrado?

## 10.4.9 Regra

Nenhuma camada substitui outra.

```text
approval without sandbox
→ não limita tecnicamente o processo

sandbox without Authority
→ não define se a ação é apropriada

container without credential policy
→ pode continuar excessivamente privilegiado

network allowlist without effect policy
→ pode permitir exfiltração em domínio autorizado
```

---

# 10.5 Threat model

## 10.5.1 Modelo local inicial

Confiáveis:

- Operator;
- MNFS Core version revisada;
- first-party adapters;
- host owner;
- Approved Contract;
- effective security policy compilada.

Falíveis ou potencialmente não confiáveis:

- saída do LLM;
- código do repositório;
- scripts de instalação;
- dependencies;
- issue e PR text;
- web content;
- logs;
- generated files;
- third-party Agent Runtime packages/extensions;
- provider responses;
- downloaded binaries.

Workers são tratados inicialmente como:

```text
honest but fallible
```

Porém, prompt injection ou conteúdo comprometido pode fazê-los agir como código hostil.

## 10.5.2 Threat classes

### T01 — Host write

Worker altera arquivo fora do bound isolated mutable workspace.

### T02 — Secret read

Worker lê:

- SSH;
- cloud credentials;
- Kubernetes config;
- `.env`;
- password manager socket;
- browser profile;
- Windows user files.

### T03 — Egress

Worker envia código ou secret pela rede.

### T04 — Git destruction

Worker executa:

- force push;
- branch deletion;
- history rewrite;
- hook/config tampering.

### T05 — Shared-resource contamination

Dois Tracks usam o mesmo:

- database;
- schema;
- port;
- provider;
- queue;
- browser profile.

### T06 — Production effect

Worker altera sistema real.

### T07 — Malicious install script

Dependency executa código inesperado durante setup.

### T08 — Compromised extension

Third-party Agent Runtime extension may execute with the privileges of its hosting process.

### T09 — Policy tampering

Worker altera:

- sandbox config;
- Agent Runtime settings;
- MNFS policy;
- CI workflow;
- credentials binding.

### T10 — Command injection

Input não confiável é interpolado numa shell.

### T11 — Privileged socket

Acesso ao Docker socket ou outro daemon permite escapar da boundary.

### T12 — Prompt injection

Repository ou web content tenta redefinir Authority.

### T13 — Credential persistence

Secret é salvo em:

- log;
- prompt;
- transcript;
- memory;
- Artifact;
- commit.

### T14 — Over-broad identity

Credential permite mais ações ou recursos que o necessário.

### T15 — Sandbox fail-open

Falha do enforcement executa comando sem proteção.

### T16 — Supply-chain compromise

Dependency, binary, action ou package está comprometido.

### T17 — Windows interoperability escape

Processo WSL acessa host mounts ou executáveis Windows indevidamente.

### T18 — Policy drift

Security policy usada pelo Worker não corresponde à versão aprovada.

### T19 — Untrusted repository execution

Clone ou PR executa scripts maliciosos.

### T20 — False isolation assumption

Sistema acredita estar protegido apenas por mutable-workspace isolation, WSL ou container.

---

# 10.6 Trust boundaries

```text
Operator
   │
   ▼
MNFS Core / Policy
   │
   ├── trusted adapters
   │
   ▼
Execution Boundary
   │
   ├── Actor through selected Agent Runtime
   ├── repository code
   ├── dependencies
   └── tool processes
   │
   ▼
External Systems
```

## 10.6.1 Trusted computing base local

Inclui:

- MNFS binary/code;
- effective policy;
- SQLite;
- selected Agent Runtime boundary and loaded runtime extensions;
- selected Execution Environment / isolation realization;
- selected Mutable Workspace realization;
- process/runtime adapters;
- operating-system enforcement used by the selected realization.

Cada third-party runtime/extension/package introduzido na execution path pode ampliar a TCB.

## 10.6.2 Untrusted content boundary

Tratados como dados:

- source files;
- docs encontradas no repositório;
- issues;
- PR descriptions;
- web pages;
- provider responses;
- generated logs;
- package documentation.

Esses conteúdos não podem:

- conceder capability;
- alterar Authority;
- modificar policy;
- injetar secret;
- autorizar effect.

---

# 10.7 Entidades de segurança

## 10.7.1 Execution Environment Spec

Define o ambiente necessário.

```ts
interface ExecutionEnvironmentSpec {
  id: string;
  kind:
    | 'HOST_INSPECTION'
    | 'LOCAL_SANDBOX'
    | 'DEV_CONTAINER'
    | 'REMOTE_CONTAINER'
    | 'REMOTE_VM'
    | 'MICROVM';

  baseRef?: string;
  repositoryRef: string;
  contractHash: string;

  filesystemPolicy: FilesystemPolicy;
  networkPolicy: NetworkPolicy;
  resourcePolicy: ResourcePolicy;
  credentialRequirements: CredentialRequirement[];
  serviceRequirements: ServiceRequirement[];

  setupPhase?: PhasePolicy;
  executionPhase: PhasePolicy;
  verificationPhase?: PhasePolicy;
  deliveryPhase?: PhasePolicy;

  contentHash: string;
}
```

## 10.7.2 Execution Environment Instance

É uma instância concreta de um Spec.

```text
ENV-001
```

Contém:

- adapter;
- external ID;
- state;
- owner;
- Work Track;
- created at;
- observed capabilities;
- policy hash;
- filesystem identity;
- network identity;
- cleanup state.

## 10.7.3 Environment Lease

Autoriza temporariamente o uso de uma Environment Instance.

É diferente do binding/lease do isolated mutable workspace. The concrete resource identity is realization-specific:

```text
Workspace Binding / Lease
→ physical isolated mutable workspace

Environment Lease
→ runtime / compute / isolation resources
```

The M01 Treehouse Lease is historical incumbent Evidence for the workspace side. M2 may bind workspace and Environment resources to the same Track without requiring a generic provider framework.

## 10.7.4 Credential Grant

Concede credencial temporária a um Actor ou Effect Executor.

## 10.7.5 Effect Request

Solicita uma ação externa.

## 10.7.6 Effect Receipt

Registra o efeito observado.

## 10.7.7 Security Violation

Registra uma tentativa bloqueada ou desvio detectado.

Não presume malícia.

---

# 10.8 Execution Environment property model

The E0–E4 ordinal ladder is historical vocabulary and is not the current semantic model. An Execution Environment is described by independent properties so capability, locality and security are not conflated.

## 10.8.1 Required properties

```text
agentPlacement       CONTROL_SIDE | IN_ENVIRONMENT
computeLocation      LOCAL_WSL2 | LOCAL_VM | REMOTE | ...
isolationBoundary   PROCESS | CONTAINER | MICROVM | VM | REMOTE_SANDBOX | ...
workspaceModel       WORKTREE | COW_FS | PRIVATE_ROOTFS | VOLUME | ...
persistence          EPHEMERAL | ATTEMPT | TRACK | REUSABLE
networkPosture       DENY_ALL | ALLOWLIST | BROKERED
credentialDelivery   NONE | BROKERED | TEMPORARY_GRANT
resourceLimits       explicit CPU/memory/process/time limits when required
resultBoundary       baseCommitSha + resultTreeSha (+ optional resultCommitSha)
recoveryCapability   observable/reconcilable external identity and disposition
```

These properties are domain-visible requirements. They do not imply a provider factory or one adapter per property.

## 10.8.2 Agent placement

CONTROL_SIDE is preferred when MNFS can expose a strict brokered capability surface while provider auth remains outside untrusted execution. IN_ENVIRONMENT is used when the whole agent must be contained; brokered inference/credentials are preferred over raw secrets.

## 10.8.3 Bounded local Writer baseline

For the M2 outcome, the selected local realization must prove at minimum:

- exact isolated mutable workspace;
- protected host reads/writes denied;
- no raw production credentials;
- contract-required network posture, default deny for the current M2 proof;
- child-process containment appropriate to the selected boundary;
- fail-closed initialization;
- deterministic Git result extraction;
- fresh Recovery/Reconcile;
- safe resource disposition.

The concrete runtime, process sandbox, microVM or workspace substrate is selected only after ARR Evidence.

---

# 10.9 WSL2 security position

## 10.9.1 Papel

WSL2 é:

- canonical local runtime;
- Linux environment;
- boundary operacional do Windows.

Não é:

- per-Worker sandbox;
- credential isolation;
- network isolation;
- multi-tenant environment.

## 10.9.2 Riscos relevantes

WSL pode expor:

- `/mnt/c`;
- home do usuário;
- Windows executables;
- host-local services;
- credential stores;
- Docker sockets;
- shared network.

## 10.9.3 Política

Para o protected local Writer profile:

- Repository deve estar no filesystem Linux;
- host mounts são negados por default;
- Windows executable interop não é capability default;
- sensitive home paths são denied;
- Unix sockets são denied por default;
- WSL é o host do sandbox, não sua prova de isolamento.

---

# 10.10 Historical / Incumbent Runtime Security Reference — Pi

## 10.10.1 Pi extensions e packages

Pi extensions podem:

- registrar tools;
- interceptar calls;
- substituir built-ins;
- persistir state;
- executar arbitrary code.

Por isso:

```text
Pi extension
→ trusted executable dependency
```

Não é apenas prompt content.

## 10.10.2 Package admission

Third-party package precisa de:

- source review;
- exact version pin;
- license review;
- dependency review;
- checksum/lock preservation;
- capability inventory;
- upgrade drill;
- removal path.

## 10.10.3 No mutable project trust

Project-local `.pi` content pode estar dentro do Repository.

Um Worker não pode escrever na configuração que define sua active security boundary.

Estratégia:

```text
versioned policy source
→ resolve before dispatch
→ validate
→ freeze outside Worker write-set
→ execute by hash
```

## 10.10.4 Tool interception

Security Adapter precisa controlar o caminho real de execução.

Não é suficiente adicionar uma skill dizendo:

> Não leia secrets.

---

# 10.11 Historical / Incumbent Evidence — local process sandbox candidate study

## 10.11.1 Composição

```text
Pi sandbox extension pattern
+
@anthropic-ai/sandbox-runtime
```

## 10.11.2 Capabilities pesquisadas

Em Linux:

- bubblewrap;
- filesystem restrictions;
- network namespace;
- proxy-mediated allowlist;
- seccomp;
- Unix-socket restrictions;
- process-tree enforcement;
- protected paths.

## 10.11.3 Policy inicial

```text
filesystem:
  denyRead:
    - ~/.ssh
    - ~/.aws
    - ~/.config/gcloud
    - ~/.kube
    - Windows host mounts
  allowRead:
    - bound isolated mutable workspace
    - required system/tool paths
  allowWrite:
    - bound isolated mutable workspace
    - attempt temp
    - approved cache
  denyWrite:
    - .git/config
    - .git/hooks
    - .mnfs
    - .pi
    - .env
    - security policy

network:
  allowedDomains: []
  allowLocalBinding: false

unixSockets:
  deny by default
```

A configuração final precisa refletir limites reais do Linux implementation.

## 10.11.4 Fail closed

Se o sandbox não inicia:

```text
SANDBOX_UNAVAILABLE
→ Worker does not start
```

Nunca executar sem sandbox como fallback silencioso.

## 10.11.5 Limitações

- beta research preview;
- diferenças de plataforma;
- domain allowlist não garante request safety;
- Linux path rules possuem limitações;
- broad exception pode enfraquecer a boundary;
- Docker socket equivale a poder host;
- depende de bubblewrap e componentes locais.

## 10.11.6 Classificação

```text
CANDIDATE
→ HISTORICAL CANDIDATE; current selection requires ARR-S2 Evidence
```

---

# 10.12 Dev Containers

## 10.12.1 Função

Dev Container é um contrato de ambiente reproduzível.

Pode definir:

- image;
- Dockerfile;
- Compose;
- tools;
- users;
- services;
- lifecycle;
- mounts;
- ports;
- environment metadata.

## 10.12.2 Repository Profile binding

Exemplo conceitual:

```json
{
  "environment": {
    "kind": "DEV_CONTAINER",
    "config": ".devcontainer/devcontainer.json",
    "createCommand": "devcontainer up",
    "execCommand": "devcontainer exec"
  }
}
```

## 10.12.3 Checks

MNFS deve inspecionar:

- `privileged`;
- `capAdd`;
- `securityOpt`;
- mounts;
- Docker socket;
- host paths;
- root user;
- environment variables;
- lifecycle scripts;
- forwarded ports;
- side services.

## 10.12.4 Não é sandbox suficiente

Container com:

- privileged mode;
- broad bind mount;
- host socket;
- host credentials;
- unrestricted network;

pode ser reproduzível e inseguro.

## 10.12.5 Decisão

```text
SUPPORT
NOT UNIVERSALLY REQUIRED
```

---

# 10.13 Historical market/reference scan — remote execution

## 10.13.1 Daytona

Pontos fortes:

- Pi extension existente;
- one sandbox per Session;
- tools redirected to sandbox;
- persistence e resume;
- container e VM classes;
- filesystem/process APIs;
- snapshots;
- network restrictions;
- reconciliation;
- Git branch integration.

Riscos de adoção direta:

- external platform dependency;
- API credentials;
- branch/push behavior próprio;
- lifecycle diferente do Treehouse;
- cost;
- network;
- vendor semantics.

Classificação:

```text
PRIMARY FUTURE CANDIDATE
for RemoteExecutionEnvironmentAdapter
```

## 10.13.2 E2B

Pontos fortes:

- simple sandbox API;
- filesystem;
- command execution;
- isolated code;
- CI use cases.

Classificação:

```text
FUTURE ALTERNATIVE
for narrow remote execution
```

## 10.13.3 Ona

Pontos fortes:

- isolated environments;
- Dev Containers;
- agents;
- policies;
- task-based environments;
- cloud/VPC;
- automation;
- persistent workspace.

Risco:

- sobrepõe grande parte da Software Factory MNFS.

Classificação:

```text
REFERENCE PLATFORM
NOT CORE DEPENDENCY
```

## 10.13.4 Firecracker

Pontos fortes:

- KVM isolation;
- minimal VMM;
- seccomp;
- cgroups;
- namespaces;
- jailer;
- microVM density.

Risco:

- operar Firecracker corretamente é infraestrutura especializada;
- host security permanece necessária;
- egress precisa ser filtrado externamente;
- patching é responsabilidade operacional.

Classificação:

```text
HISTORICAL MICROVM ARCHITECTURE REFERENCE
```

---

# 10.14 Environment selection policy

## 10.14.1 Inputs

- Role and Actor placement;
- repository/code trust;
- required mutation and proof;
- isolation and workspace requirements;
- network/credential/effect posture;
- services and resource limits;
- concurrency/duration/cost;
- host sensitivity and recovery needs.

## 10.14.2 Selection

Selection compiles required properties first, then chooses the lowest sufficient proven realization. Examples:

```text
read-only trusted investigation
→ CONTROL_SIDE + no mutation + bounded read surface

local bounded Writer
→ isolated mutable workspace + proven local isolation + contract network/credential posture

complex reproducible stack
→ environment-as-code may be added; it is not automatically a security boundary

untrusted/high-assurance workload
→ stronger proven isolation boundary, potentially microVM/VM/remote
```

## 10.14.3 Escalation and failure

Risk may require stronger properties. If the required realization is unavailable or cannot prove the contract:

```text
BLOCK / REPLAN
```

Never silently downgrade isolation, credentials, network posture or effect authority.

---

# 10.15 Filesystem policy

## 10.15.1 Read model

Read pode ser:

```text
BOUND_WORKSPACE_ONLY
REPOSITORY
DECLARED_DEPENDENCY_PATHS
SYSTEM_TOOLCHAIN
HOST_BROAD
```

Default Writer:

```text
BOUND_MUTABLE_WORKSPACE + required toolchain
```

## 10.15.2 Write model

Write é allow-only:

- bound isolated mutable workspace;
- Attempt temp;
- approved cache;
- generated artifacts path.

## 10.15.3 Protected paths

Default:

- `.git/config`;
- `.git/hooks`;
- global Git config;
- `.mnfs/repo.json`;
- Approved Contracts;
- runtime SQLite;
- active policy;
- selected Agent Runtime security/extensions/config;
- secret files;
- shell profiles;
- system executables;
- Windows host mounts.

## 10.15.4 Generated code

Generated output precisa estar no write-set ou em explicit generated paths.

## 10.15.5 Violation

Blocked filesystem access produz:

```text
SECURITY_VIOLATION
```

com:

- Actor;
- command/tool;
- path;
- operation;
- policy;
- timestamp;
- result.

---

# 10.16 Network policy

## 10.16.1 Default

```text
DENY_ALL
```

## 10.16.2 Modes

```text
OFF
REGISTRY_ONLY
DOCUMENTATION_READ
PROVIDER_SANDBOX
DECLARED_ALLOWLIST
DELIVERY
```

## 10.16.3 Setup versus execution

Setup pode precisar:

- package registry;
- OS packages;
- image registry;
- source fetch.

Execution normalmente não precisa de internet ampla.

## 10.16.4 Domain allowlist limitation

Permitir domínio não limita:

- HTTP method;
- path;
- target account;
- upload;
- arbitrary repository;
- payload content.

Exemplo:

```text
allow github.com
```

pode permitir:

- documentação read;
- clone;
- push;
- gist;
- issue mutation;
- data exfiltration.

## 10.16.5 High-risk egress

Pode exigir:

- request proxy;
- method restrictions;
- API path restrictions;
- token scope;
- audit log;
- Effect Request;
- separate executor.

## 10.16.6 Local binding

Port binding é denied por default.

Golden Path pode pedir allocation explícita.

---

# 10.17 Permission and capability policy

## 10.17.1 Capability-based

Não conceder uma shell irrestrita conceitualmente quando uma capability menor resolve.

Preferir:

```text
RUN_TEST_COMMAND
READ_GIT_STATUS
OPEN_CLAIM
READ_PROVIDER_SANDBOX
```

a:

```text
FULL_BASH
FULL_GITHUB
FULL_CLOUD
```

## 10.17.2 Shell

Shell é necessária para software development.

Sua segurança depende de:

- OS sandbox;
- cwd;
- environment;
- network;
- credentials;
- command evidence;
- external-effect separation.

## 10.17.3 Permission prompt

Prompt humano é usado quando:

- policy não decide;
- effect é material;
- scope aumenta;
- capability é nova;
- operation é irreversível.

## 10.17.4 Bypass mode

Qualquer modo sem prompts requer:

- Environment compatível;
- precompiled policy;
- no sensitive credentials;
- effect denial;
- audit.

---

# 10.18 Credential architecture

## 10.18.1 Princípio

Worker não recebe o environment completo do usuário.

Recebe apenas um `Credential Grant`.

## 10.18.2 Classes

```text
NONE
BUILD_READ
PACKAGE_REGISTRY_READ
TEST_SANDBOX
PROVIDER_SANDBOX
SHARED_NONPROD_READ
SHARED_NONPROD_WRITE
PRODUCTION_READ
PRODUCTION_WRITE
DELIVERY
```

## 10.18.3 Estrutura conceitual

```ts
interface CredentialGrant {
  id: CredentialGrantId;
  target: EntityReference;
  actor: ActorRef;

  class: CredentialClass;
  provider: string;
  resourceScope: string[];
  actionScope: string[];

  issuedAt: string;
  expiresAt?: string;

  delivery:
    | 'PROCESS_ENV'
    | 'TEMP_FILE'
    | 'SOCKET'
    | 'WORKLOAD_IDENTITY'
    | 'REMOTE_PROVIDER';

  secretRef?: string;
  policyHash: string;

  state:
    | 'REQUESTED'
    | 'ACTIVE'
    | 'EXPIRED'
    | 'REVOKED'
    | 'RELEASED'
    | 'DIVERGED';
}
```

## 10.18.4 Secret storage

SQLite guarda:

- metadata;
- reference;
- scope;
- expiry;
- state.

Não guarda plaintext secret.

## 10.18.5 Delivery

Secret é entregue:

- ao processo específico;
- no momento necessário;
- sem aparecer no prompt;
- sem entrar no Context Pack;
- sem ser escrito no bound isolated mutable workspace.

## 10.18.6 Redaction

Logs, Events e Artifacts devem possuir:

- known-secret redaction;
- token-pattern detection;
- output size limits;
- restricted storage;
- incident handling.

Redaction é Safety Net.

Não substitui evitar exposição.

## 10.18.7 Telemetry policy

Security Policy também governa telemetria.

Por default, não exportar:

- raw prompts;
- raw model outputs;
- source code;
- diffs;
- credentials;
- customer data.

Exportar IDs, hashes, classifications e Artifact refs quando suficientes.

---

# 10.19 Credential priority

Ordem preferencial:

```text
1. Workload identity / OIDC
2. Temporary role or session credential
3. Narrow service-account credential
4. Process-injected secret from secure vault
5. Encrypted repository secret with external key
6. Long-lived static secret only when unavoidable
```

## 10.19.1 Temporary credentials

Benefícios:

- expiration;
- reduced reuse;
- no embedding;
- narrow session;
- auditable issuance;
- easier rotation.

## 10.19.2 Long-lived credentials

Quando inevitáveis:

- narrow scope;
- separate account;
- storage external to Repository;
- regular rotation;
- access audit;
- no general Writer access.

---

# 10.20 Local secret bindings

## 10.20.1 1Password CLI

Candidate binding para:

- process-scoped environment injection;
- references instead of plaintext;
- service accounts;
- vault-scoped access;
- local interactive workflows.

Não é obrigatório.

## 10.20.2 SOPS

Candidate binding para:

- encrypted YAML/JSON/ENV/INI in Git;
- meaningful diffs;
- age/KMS recipients;
- key rotation;
- `exec-env`;
- `exec-file`.

A private key ou KMS identity permanece fora do Repository.

## 10.20.3 Environment variables

Environment variable pode ser delivery mechanism.

Não deve ser long-term storage ou source of truth.

## 10.20.4 Secret files

Quando ferramenta exige file:

- create in protected temp;
- strict permissions;
- exclude from bound mutable workspace;
- delete after use;
- record cleanup;
- never commit.

---

# 10.21 CI and cloud identity

## 10.21.1 GitHub Actions OIDC

Preferred when supported:

```text
workflow identity
→ OIDC token
→ cloud trust policy
→ short-lived access token
```

Evita duplicar long-lived cloud secret em GitHub.

## 10.21.2 Cloud temporary credentials

Exemplo de binding:

```text
AWS STS AssumeRole
```

Principles:

- short duration;
- least privilege;
- resource conditions;
- session tags;
- no root/static key;
- explicit job identity.

## 10.21.3 MNFS future cloud

Remote Worker deverá receber:

- workload identity;
- per-run grant;
- no inherited operator credential;
- expiry shorter than run where possible;
- effect-bound action scope.

---

# 10.22 Execution phases

## 10.22.1 SETUP

Objetivo:

- install dependencies;
- build environment;
- prefetch artifacts;
- configure services.

Pode permitir network limitada.

Não recebe production credentials.

## 10.22.2 AGENT_EXECUTION

Objetivo:

- inspect;
- edit;
- test;
- produce Claim.

Default:

- network off;
- no external write;
- no production credentials.

## 10.22.3 VERIFICATION

Objetivo:

- run deterministic checks;
- integration;
- live sandbox tests.

Pode receber:

- read-only or test credentials;
- fixed environment;
- no implementation authority.

## 10.22.4 DELIVERY

Objetivo:

- PR;
- release;
- deploy;
- post-deploy verification.

Separada por:

- Role;
- Environment;
- credentials;
- Authority;
- Effect Gate.

---

# 10.23 External Effect classification

## X0 — PURE

Sem mutation persistente externa.

Exemplos:

- parse;
- calculate;
- read local immutable Artifact.

## X1 — LOCAL_REVERSIBLE

Mutation no workspace isolado.

Exemplos:

- edit bound mutable workspace;
- temp files;
- local build;
- local database disposable.

## X2 — ISOLATED_SANDBOX

Mutation em recurso descartável dedicado.

Exemplos:

- provider sandbox por Track;
- disposable test database;
- ephemeral preview.

## X3 — SHARED_NONPROD

Mutation em recurso compartilhado de teste ou staging.

Exemplos:

- shared staging DB;
- shared test account;
- team environment.

## X4 — EXTERNAL_REVERSIBLE

External mutation normalmente reversível.

Exemplos:

- branch push;
- pull request;
- issue comment;
- preview deploy.

## X5 — PRODUCTION_OR_COSTLY

Pode afetar usuário, dinheiro ou operação real.

Exemplos:

- production deploy;
- customer message;
- purchase;
- paid cloud resource;
- production data write.

## X6 — DESTRUCTIVE_OR_IRREVERSIBLE

Exemplos:

- data deletion;
- destructive migration;
- credential rotation;
- release revocation;
- irreversible external submission.

---

# 10.24 Effect Request

## 10.24.1 Estrutura

```ts
interface EffectRequest {
  id: EffectRequestId;
  target: EntityReference;
  actor: ActorRef;

  effectClass: 'X0' | 'X1' | 'X2' | 'X3' | 'X4' | 'X5' | 'X6';

  operation: string;
  destination: string;
  resourceRefs: string[];
  inputArtifactRefs: ArtifactRef[];

  expectedOutcome: string;
  rollback?: string;
  idempotencyKey?: string;

  requiredCredentialClass: CredentialClass;
  requiredAuthority: ActorRole;

  policyHash: string;
  contractHash: string;

  state:
    | 'REQUESTED'
    | 'APPROVED'
    | 'DENIED'
    | 'EXECUTING'
    | 'COMPLETED'
    | 'FAILED'
    | 'UNKNOWN'
    | 'RECONCILING';
}
```

## 10.24.2 Effect is not tool name

```text
git status
→ X0

git commit
→ X1

git push feature branch
→ X4

git push --force protected branch
→ X6
```

## 10.24.3 Approval

Authority depende do:

- effect class;
- Repository Profile;
- environment;
- resource;
- contract;
- reversibility.

---

# 10.25 Effect Executor

## 10.25.1 Papel

Executa external mutation após aprovação.

É separado do ordinary Writer quando effect é X4–X6.

## 10.25.2 Inputs

- approved Effect Request;
- Credential Grant;
- input Artifacts;
- expected state;
- idempotency key;
- rollback plan.

## 10.25.3 Output

Effect Receipt.

## 10.25.4 No free-form mutation

Effect Executor usa:

- typed command;
- provider adapter;
- fixed arguments;
- constrained credential;
- known target.

Não recebe uma solicitação vaga:

> Publique isso.

---

# 10.26 Effect Receipt

```ts
interface EffectReceipt {
  id: EffectReceiptId;
  requestId: EffectRequestId;

  executor: ActorRef;
  credentialGrantId?: CredentialGrantId;

  startedAt: string;
  finishedAt: string;

  observedDestination: string;
  providerOperationId?: string;

  result:
    | 'SUCCEEDED'
    | 'FAILED'
    | 'UNKNOWN';

  beforeRef?: ArtifactRef;
  afterRef?: ArtifactRef;
  outputRef: ArtifactRef;

  reconciliationRequired: boolean;
}
```

## 10.26.1 Unknown

Timeout após external request pode significar:

- effect não ocorreu;
- effect ocorreu;
- effect ocorreu parcialmente.

Resultado:

```text
UNKNOWN
→ RECONCILE
```

Nunca retry cego em effect não idempotente.

---

# 10.27 Production policy

## 10.27.1 Default

Writer Worker:

```text
no production credentials
no production network path
no production mutation tools
```

## 10.27.2 Production read

Ainda exige:

- purpose;
- data classification;
- least privilege;
- audit;
- redaction;
- Operator or configured authority when sensitive.

## 10.27.3 Production write

Exige:

- Mission/Feature criterion;
- explicit Effect Request;
- D5 Authority;
- Credential Grant;
- rollback/Safety Net;
- environment verification;
- post-effect Receipt;
- Reconcile.

## 10.27.4 Break-glass

Emergency Override não entrega credential universal ao Worker.

Cria Effect Request excepcional com:

- reason;
- scope;
- expiry;
- Operator;
- audit;
- remediation.

---

# 10.28 Prompt injection and instruction hierarchy

## 10.28.1 Untrusted instructions

Texto em:

- source;
- README;
- issue;
- PR;
- web;
- log;
- provider response;

não altera Role Contract.

## 10.28.2 Authority hierarchy

```text
MNFS Domain and Policy
→ Current Authority Snapshot
→ Context Pack / Role Contract
→ Operator Decision
→ task content
→ repository/web content as data
```

Operator Decision entra por state estruturado, não por texto ambíguo dentro do Repository.

## 10.28.3 Exfiltration defense

- no secrets for ordinary readers;
- network off;
- Effect Request for external mutation;
- source-backed decisions;
- bounded tools;
- suspicious content Finding;
- no automatic execution of instructions found in data.

---

# 10.29 Supply-chain security

## 10.29.1 Reference framework

MNFS usa NIST SSDF 1.1 como linguagem de referência para:

- prepare organization;
- protect software;
- produce well-secured software;
- respond to vulnerabilities.

Não como programa de compliance completo no MVP.

## 10.29.2 Agent Runtime extension/package supply chain

Regras:

- pin version or commit;
- review source;
- inspect package manifest;
- inspect install scripts;
- record license;
- inventory capabilities;
- test in isolated environment;
- no auto-update during active Mission;
- explicit upgrade.

## 10.29.3 Dependency install

Setup policy pode:

- use lockfile;
- disable arbitrary scripts when possible;
- run install in isolated Environment;
- use registry allowlist;
- verify integrity;
- cache approved artifacts.

## 10.29.4 OpenSSF Scorecard

Pode fornecer supporting evidence sobre:

- branch protection;
- pinned dependencies;
- token permissions;
- security policy;
- vulnerabilities;
- CI tests;
- review;
- release practices.

Não é Verdict final sobre dependency safety.

## 10.29.5 SBOM and provenance

Entram quando:

- release requirements;
- customer requirement;
- supply-chain risk;
- package distribution;
- incident response.

Não são obrigatórios para toda local Feature.

---

# 10.30 Security Standards candidates

```text
SEC-ENV-001
Every executable Role has an Environment Profile.

SEC-FS-001
Writer writes only to declared paths.

SEC-FS-002
Active security policy is outside Worker write authority.

SEC-NET-001
Network is denied by default.

SEC-NET-002
Broad egress requires Effect Policy, not only domain allowlist.

SEC-CRED-001
Secrets never enter Context Packs, prompts or observational memory.

SEC-CRED-002
Temporary credentials are preferred.

SEC-CRED-003
Credential Grant is scoped to Role, target, actions and time.

SEC-EFFECT-001
External mutation requires Effect Request.

SEC-EFFECT-002
Production effects use a separate executor and receipt.

SEC-EXT-001
Agent Runtime extensions and packages are pinned and reviewed.

SEC-SUPPLY-001
Dependency installation follows a declared setup policy.

SEC-LOG-001
Sensitive outputs are redacted and access-controlled.

SEC-REC-001
Unknown external effects require reconcile before retry.
```

Todos começam como:

```text
CANDIDATE
```

até piloto e enforcement confiável.

---

# 10.31 Security Context Pack

O ordinary Writer Pack inclui referências, não secrets.

```text
Environment:
  agentPlacement: <approved CONTROL_SIDE or IN_ENVIRONMENT>
  isolationBoundary: <approved realization/property>
  workspaceBinding: <current binding ref>
Execution policy hash:
  sha256:...
Network:
  <contract posture; DENY_ALL for current M2 proof>
Credentials:
  NONE for ordinary M2 Writer
Allowed effects:
  X0, X1
Protected paths:
  policy://SEC-POL-004
Escalation:
  Effect Request required for X2+
```

## 10.31.1 Secrets

Pack pode declarar:

```text
requires Credential Class PROVIDER_SANDBOX
```

Não inclui valor.

## 10.31.2 Policy freshness

Mudança em:

- Environment Spec;
- sandbox policy;
- Credential policy;
- network policy;
- effect policy;

torna dispatch ou Pack stale.

---

# 10.32 Security violations

## 10.32.1 Estrutura

```ts
interface SecurityViolation {
  id: string;
  actor: ActorRef;
  target: EntityReference;

  category:
    | 'FILESYSTEM'
    | 'NETWORK'
    | 'CREDENTIAL'
    | 'CAPABILITY'
    | 'POLICY_TAMPER'
    | 'EXTERNAL_EFFECT'
    | 'SUPPLY_CHAIN';

  attemptedOperation: string;
  resource: string;
  policyHash: string;

  blocked: boolean;
  evidenceRef: ArtifactRef;
  observedAt: string;
}
```

## 10.32.2 Interpretação

Uma violation pode ser:

- erro de configuração;
- dependency behavior;
- command legítimo fora da allowlist;
- prompt injection;
- comportamento suspeito.

Não concluir malícia sem evidência.

## 10.32.3 Resposta

- block;
- create Finding;
- request capability;
- amend Profile;
- rotate credentials;
- terminate Run;
- incident response;
- Replan.

---

# 10.33 Incident response

## 10.33.1 Gatilhos

- secret exposed;
- unauthorized external effect;
- sandbox bypass;
- compromised dependency;
- policy tampering;
- suspicious egress;
- production mutation unknown.

## 10.33.2 Fluxo

```text
detect
→ contain
→ preserve evidence
→ revoke credentials
→ classify impact
→ reconcile external state
→ recover
→ root cause
→ update Standards/Golden Path
```

## 10.33.3 Preserve

Não apagar imediatamente:

- logs;
- process data;
- diff;
- Effect Receipt;
- network evidence;
- credential metadata.

Secrets leaked in evidence require restricted storage and redaction, not casual copying.

## 10.33.4 Domain state

Incident pode colocar:

- Track;
- Environment;
- Mission;
- Credential Grant;

em:

```text
SECURITY_BLOCKED
```

---

# 10.34 Historical / Incumbent Evidence — AS-02 Local Pi Sandbox on WSL2

## 10.34.1 Objetivo

Validar:

```text
Historical revision-5 realization:
Pi sandbox extension pattern
+ Anthropic Sandbox Runtime
+ Treehouse worktree
```

## 10.34.2 Ambiente

- canonical WSL2;
- Repository no Linux filesystem;
- pinned Pi version;
- pinned Sandbox Runtime version;
- bubblewrap;
- socat;
- ripgrep;
- controlled sentinel secrets;
- disposable test repo.

## 10.34.3 Cenários

### S1 — Worktree write

Escrita permitida funciona.

### S2 — Host write escape

Escrita fora do worktree falha.

### S3 — Credential read

Tentativas contra:

- `~/.ssh`;
- `~/.aws`;
- `~/.config/gcloud`;
- `~/.kube`;
- sentinel `.env`;

falham.

### S4 — Windows host mounts

Read/write em `/mnt/c` falha por default.

### S5 — Network default

Egress falha.

### S6 — Narrow allowlist

Package/documentation access funciona somente quando configurado.

### S7 — Broad provider risk

GitHub broad access é testado e classificado como insuficiente para write safety.

### S8 — Unix sockets

Docker socket e outros privileged sockets são inacessíveis.

### S9 — Policy tamper

Worker não altera:

- active sandbox policy;
- `.pi` security config;
- `.mnfs`;
- Git hooks/config.

### S10 — Toolchain compatibility

Funcionam:

- Git read/status;
- Node;
- npm;
- TypeScript;
- tests;
- file tools;
- Treehouse path.

### S11 — Child processes

Restrictions propagam.

### S12 — Violation observability

Violation produz evidence ou diagnóstico suficiente.

### S13 — Fail closed

Sandbox unavailable não executa comando diretamente.

### S14 — Performance

Medir:

- spawn latency;
- command latency;
- test latency;
- memory;
- repeated execution.

### S15 — Restart

WSL/process restart não altera policy sem detecção.

## 10.34.4 Acceptance Criteria

1. nenhum protected sentinel é legível;
2. nenhuma escrita escapa das roots autorizadas;
3. network off funciona;
4. allowed domains funcionam sem ampliar write authority;
5. Docker socket permanece bloqueado;
6. active policy é imutável ao Worker;
7. common MNFS toolchain funciona;
8. child process permanece limitado;
9. sandbox failure fecha a execução;
10. overhead é medido;
11. configuration e violations são observáveis;
12. disable/upgrade/removal são documentados.

## 10.34.5 Removal Conditions

Substituir ou remover quando:

- bypass material;
- WSL2 support instável;
- common toolchains exigem exceptions excessivas;
- security diagnostics são insuficientes;
- Pi upgrades quebram repetidamente;
- melhor adapter prova menor risco e complexidade.

---

# 10.35 M2 security slice

M2 does not implement the complete future Security System. It proves one bounded Writer under the selected, evidence-backed local realization.

```text
one bounded Writer Actor
does not mean
full host-user authority
```

## Inclui

- exact workspace/environment binding;
- explicit cwd/capability boundary where applicable;
- shell/process invocation controlled by the selected realization;
- environment allowlist;
- no raw production credentials;
- contract-bound network posture, deny-by-default for the current local proof;
- protected host/policy paths;
- external effects denied beyond the contract;
- frozen effective execution/security policy hash;
- fail-closed initialization;
- security failure reflected in durable state/Evidence;
- provider-neutral Git result identity;
- Fresh Recovery without Session/transcript authority.

## Não inclui

- generic Credential Broker without a named consumer;
- full Effect Executor;
- remote/cloud control plane;
- production access;
- multi-tenant security;
- security dashboard.

## Contract reconciliation

Production M02 only resumes after ARR-S0/S1/S2/(S2W)/S3, substrate-selection Decision and superseding CAP-EXECUTION/MIS-002 authority. Historical AS-02 Evidence may inform the incumbent comparison but is not a current prerequisite or selecting gate.

The architecture never permits Writer dispatch to degrade silently to unrestricted host execution.

---

# 10.36 Adoption matrix

| Tool ou conceito | Decisão | Papel |
|---|---|---|
| Pi tool interception | Historical/incumbent Evidence | prior capability-enforcement realization |
| Pi sandbox example | Historical/reference | local integration Evidence |
| Anthropic Sandbox Runtime | Incumbent candidate for ARR-S2 | process-envelope Evidence |
| Dev Container Spec | Suportar | environment-as-code |
| Dev Container CLI | Candidato | local/CI environment adapter |
| Daytona | Historical remote reference | reassess only with fresh provenance |
| E2B | remote reference/candidate | fresh provenance required |
| Ona | Reference platform | Software Factory/environment model |
| Firecracker | low-level isolation reference | not a selected MNFS realization |
| 1Password CLI | Optional binding | local process secret injection |
| SOPS | Optional binding | encrypted config in Git |
| GitHub OIDC | Preferred CI pattern | short-lived cloud identity |
| AWS STS/equivalent | Preferred cloud pattern | temporary credentials |
| NIST SSDF 1.1 | Reference taxonomy | Security Standards |
| OpenSSF Scorecard | Optional supporting evidence | supply-chain risk |

---

# 10.37 Impacto no roadmap

## Antes do M2 unrestricted worker

Historical AS-02 has already produced incumbent Evidence; current selection proceeds through ARR-S0/S2.

## M2

Adicionar Minimal Local Security Profile.

## Depois do M2

Entregar:

- Environment Profile v1;
- policy compilation;
- Security Violation model;
- Dev Container discovery;
- Credential Requirement declarations.

## Antes de external integrations generalizadas

Entregar:

- Credential Grant;
- Effect Request;
- Effect Receipt;
- Reconcile;
- provider sandbox policy.

## Antes de remote parallel workers

Avaliar:

- Daytona;
- remote sandbox candidate/reference;
- customer/VPC requirements;
- environment costs;
- persistence;
- security boundaries.

## Antes de cloud multi-tenant

Definir:

- required isolation boundary;
- workload identity;
- per-tenant isolation;
- secrets broker;
- audit;
- host hardening;
- incident response.

---

# 10.38 ADRs decorrentes

Após aprovação:

## ADR-0006 — Security planes and local execution isolation

Decide:

- Authority, permission, sandbox e Environment são separados;
- WSL2/worktree não são sandbox;
- o local Writer requer property-based isolation proven by ARR Evidence;
- process sandbox realizations are selected by ARR-S2 Evidence;
- fail-open é proibido.

## ADR-0007 — Credential grants and external effects

Decide:

- credentials são scoped e temporárias;
- secrets não entram em prompts, Packs ou OM;
- production effects usam separate gate/executor;
- Effect Request/Receipt são duráveis.

## ADR-0008 — Reproducible and remote execution environments

Decide:

- Dev Containers são optional Environment Contract;
- Daytona é future primary remote candidate;
- remote sandbox candidates remain deferred until a named consumer;
- Ona e Firecracker são referências;
- Environment adapters não viram Domain Authority.

---

# 10.39 Non-goals

Não construir agora:

- custom container runtime;
- custom sandbox kernel;
- Firecracker platform;
- Kubernetes;
- service mesh;
- zero-trust platform completa;
- enterprise IAM;
- multiuser RBAC;
- secret manager próprio;
- universal HTTP proxy;
- packet inspection system;
- DLP completa;
- remote execution no M2;
- production automation;
- security compliance certification;
- SBOM obrigatório para toda Feature;
- Scorecard gate universal;
- policy DSL própria;
- automatic secret rotation;
- sandbox bypass detection universal;
- agent com acesso irrestrito “porque o Repository é privado”.

---

# 10.40 Invariantes de segurança

1. Authority e technical isolation são separadas.
2. Worktree não é sandbox.
3. WSL2 não é per-Worker sandbox.
4. Container não é automaticamente secure.
5. Dev Container resolve reproducibility, não toda segurança.
6. Writer possui Environment Profile.
7. Network é denied por default.
8. Filesystem write é allow-only.
9. Sensitive reads são denied.
10. Active security policy é imutável ao Worker.
11. Sandbox failure não executa sem proteção.
12. Agent Runtime extensions/packages admitted to the execution path are trusted code and therefore pinned/reviewed.
13. Third-party extensions são pinned e revisadas.
14. Worker não recebe user environment inteiro.
15. Secrets não entram em Context Pack.
16. Secrets não entram em observational memory.
17. SQLite não guarda plaintext secrets.
18. Temporary credentials são preferidas.
19. Credential Grant possui scope e expiry.
20. Production credentials não pertencem ao ordinary Writer.
21. Tool permission não substitui Effect Gate.
22. Effect class depende do impacto, não do command name.
23. X4–X6 usam Effect Request.
24. Production write exige D5 Authority.
25. Unknown external effect exige Reconcile.
26. Domain allowlist não é proteção suficiente contra exfiltration.
27. Docker socket é denied por default.
28. `/mnt/c` is denied by default for the current protected local Writer profile.
29. Untrusted content não concede Authority.
30. Dependency setup ocorre sob policy.
31. Supply-chain score é supporting evidence.
32. Security Violation não presume malícia.
33. Incident preserva evidence e revoga credentials.
34. Remote Environment é adapter substituível.
35. M2 não executa qualquer Agent Runtime irrestrito como definição de sucesso.
36. Security tooling entra por spike, Acceptance Criteria e Removal Conditions.

---

# Decisão resumida da Seção 10

> **O MNFS adota defesa em profundidade e separa Domain Authority, Tool Capability, isolation boundary, Execution Environment, Credential Grant, Network/Egress Policy e External Effect Gate. Environments are defined by independent properties rather than E0–E4 levels. The M2 local Writer must use an isolated mutable workspace, fail-closed proven isolation, no raw production credentials, contract-bounded network posture and provider-neutral Git result identity. Concrete process-sandbox/microVM/workspace/runtime realizations are selected only by ARR Evidence and Decision. Credentials are temporary/brokered where possible; external mutations use Effect Request/Executor/Receipt.**

---

---

# 11. Experiência do Operador, Interfaces, Observabilidade e Calibração

## 11.1 Propósito

Esta seção define como o MNFS será compreendido, operado, observado e melhorado ao longo do tempo.

Ela responde a quatro perguntas diferentes:

1. **Como o Operator entende e controla uma Mission?**
2. **Como um engenheiro investiga o que ocorreu durante uma execução?**
3. **Como o sistema mede qualidade, custo, fluxo e confiabilidade?**
4. **Como evidências reais alteram modelos, prompts, gates, Golden Paths e policies?**

Essas perguntas não devem ser respondidas pelo mesmo mecanismo.

O MNFS separa quatro planos:

```text
Operator Control Plane
Operational Projection
Observability Plane
Evaluation and Calibration Plane
```

O objetivo é impedir que:

- terminal seja confundido com Mission Control;
- trace seja confundido com Domain State;
- dashboard seja confundido com Evidence;
- log seja confundido com Verdict;
- token count seja confundido com produtividade;
- status de Session seja confundido com Feature status;
- um único score tente representar qualidade, velocidade, custo e confiança;
- uma policy mude automaticamente por dados incompletos;
- o Operator precise acompanhar cada Worker;
- observabilidade capture secrets, código e prompts sem necessidade;
- uma futura UI crie uma segunda implementação das regras do domínio.

No MNFS:

> **A interface apresenta e solicita ações. O Core decide as transições. A telemetria explica o que aconteceu. A calibração decide o que deve mudar no sistema.**

---

# 11.2 Base de pesquisa

Esta seção foi construída a partir de conceitos e implementações de mercado, incluindo:

- Backstage Software Catalog, Software Templates, TechDocs, Notifications e Permissions;
- painel e logs de Sessions do GitHub Copilot coding agent;
- Herdr;
- FirstMate;
- OpenTelemetry e suas Semantic Conventions;
- OpenTelemetry GenAI conventions;
- Langfuse;
- Arize Phoenix e OpenInference;
- DORA 2025;
- DORA Core Model e delivery metrics;
- SPACE Framework.

O relatório detalhado está registrado em:

```text
MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.md
```

## 11.2.1 Limite das referências

Essas ferramentas resolvem classes diferentes de problema.

- Backstage é developer portal;
- GitHub mostra agent Sessions;
- Herdr mostra processos e terminais;
- OpenTelemetry transporta telemetria;
- Phoenix e Langfuse armazenam traces, evaluations e experiments;
- DORA mede resultados de delivery e capacidades organizacionais;
- SPACE orienta produtividade multidimensional.

O MNFS não copiará uma ferramenta inteira para resolver todas as superfícies.

---

# 11.3 Os quatro planos

## 11.3.1 Operator Control Plane

É a superfície autoritativa para o Operator.

Fonte:

```text
MNFS Core
+
SQLite
+
Approved Artifacts
```

Mostra:

- Mission;
- Milestones;
- Features;
- Acceptance Criteria;
- Claims;
- Decisions;
- gates;
- Evidence;
- external effects;
- Recovery;
- next actions.

Executa:

- approval;
- Decision;
- pause;
- cancel;
- repair;
- Replan;
- Effect authorization;
- Closeout.

## 11.3.2 Operational Projection

Mostra o mundo operacional observado:

- processos;
- Sessions;
- terminals;
- logs;
- foreground commands;
- Treehouse worktrees;
- environments;
- liveness;
- resource use.

Fontes:

- process adapter;
- Pi lifecycle;
- Herdr;
- Treehouse;
- filesystem;
- sandbox.

É uma projeção.

Não decide lifecycle.

## 11.3.3 Observability Plane

Registra sinais técnicos:

- traces;
- spans;
- metrics;
- logs;
- errors;
- tokens;
- cost;
- latency;
- cache;
- tool use;
- memory events;
- sandbox denials.

Pode usar:

- OpenTelemetry;
- OTLP;
- Phoenix;
- Langfuse;
- outro backend futuro.

Não substitui Domain Events.

## 11.3.4 Evaluation and Calibration Plane

Compara qualidade e comportamento ao longo do tempo.

Inclui:

- datasets;
- Golden Missions;
- experiments;
- Evaluation Results;
- human annotations;
- user feedback;
- score distributions;
- Calibration Candidates;
- Calibration Decisions;
- rollout;
- rollback.

---

# 11.4 Princípios da experiência do Operator

## 11.4.1 One liaison

O Operator interage principalmente com o MNFS Lead.

A UI não cria um chat separado com cada Worker por default.

## 11.4.2 Mission-first

A navegação principal é:

```text
Mission
→ Milestone
→ Feature
→ Write Track
→ Attempt
→ Worker Run
```

Não:

```text
terminal
→ process
→ model call
```

Terminal e trace são detalhes sob demanda.

## 11.4.3 Attention-first

A primeira pergunta respondida pela interface é:

> O que precisa da minha atenção agora?

Não:

> Quantos processos estão executando?

## 11.4.4 Evidence-first

Uma conclusão mostra primeiro:

- outcome;
- criteria;
- Evidence;
- Verdict;
- risks;
- limitations.

Logs e transcript ficam abaixo.

## 11.4.5 Progressive disclosure

Default:

- resumo;
- progress;
- blocker;
- next action.

Detalhes:

- contract;
- diff;
- Receipt;
- trace;
- terminal;
- Artifact;
- exact source.

## 11.4.6 Next-action clarity

Toda tela acionável apresenta:

```text
recommended action
why
required authority
impact
alternatives
command or UI action
```

## 11.4.7 No false certainty

A interface diferencia:

```text
UNKNOWN
BLOCKED
FAILED
STALE
DIVERGED
DEGRADED
```

Não reduz tudo a “erro”.

## 11.4.8 Calm automation

O MNFS não interrompe o Operator para progresso normal.

Ele interrompe para:

- Decision;
- material risk;
- Recovery;
- Security;
- approval;
- external effect;
- budget exception;
- completion relevante.

---

# 11.5 Modelo de status

Um único campo `status` é insuficiente.

Cada aggregate relevante expõe:

```ts
interface AggregateStatus {
  lifecycle: string;
  phase: string;
  attention: AttentionState;
  health: HealthState;
  progress: ProgressSummary;
  blockers: BlockerRef[];
  nextAction?: NextAction;
}
```

## 11.5.1 Lifecycle

Exemplos:

```text
OPEN
CLOSED
CANCELLED
ABANDONED
```

## 11.5.2 Phase

Exemplos:

```text
INTAKE
PLANNING
APPROVED
EXECUTING
VERIFYING
CLOSING
```

## 11.5.3 Attention

```text
NONE
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

## 11.5.4 Health

```text
HEALTHY
DEGRADED
UNKNOWN
DIVERGED
```

## 11.5.5 Progress

É derivado de:

- critérios;
- Work Tracks;
- Claims;
- gates;
- Integration;
- QA.

Nunca de percentual informado pelo modelo.

---

# 11.6 Operator Home — Mission Control

## 11.6.1 Objetivo

Fornecer visão rápida de todas as Missions relevantes sem exigir inspeção de Sessions.

## 11.6.2 Conteúdo

```text
Active Missions
Attention Inbox
Pending Decisions
Recovery Required
Security Required
Recently Closed Milestones
Active External Effects
Cost and Budget Snapshot
Next Recommended Actions
```

## 11.6.3 Mission card

Cada Mission mostra:

- ID e título;
- phase;
- attention;
- health;
- criteria progress;
- active Tracks;
- blocked entities;
- Decision count;
- cost range;
- last meaningful change;
- next action.

## 11.6.4 Ordenação

Prioridade:

1. Security Required;
2. Recovery Required;
3. Decision Required;
4. Blocked;
5. Review;
6. ordinary progress.

Não ordenar apenas por data de criação.

## 11.6.5 Quiet state

Quando nada exige ação:

```text
No operator action required.
3 Missions progressing autonomously.
```

---

# 11.7 Mission Workspace

## 11.7.1 Header

- Mission ID;
- goal;
- Approved Contract hash;
- lifecycle;
- phase;
- attention;
- health;
- Operator;
- created/updated;
- policy version.

## 11.7.2 Hierarchy

```text
Mission Acceptance Criteria
Milestones
Milestone Criteria
Features
Feature Criteria
Write Tracks
```

## 11.7.3 Views

### Outcome

O que a Mission precisa entregar.

### Plan

Decomposição e DAG.

### Execution

Tracks, Attempts e Workers.

### Quality

Criteria, Claims, Receipts e Verdicts.

### Decisions

Decisions e accepted risks.

### Evidence

Bundles e Artifacts.

### Timeline

Domain Events.

### Observability

Traces e metrics.

### Closeout

Delivered behavior, risks e limitations.

## 11.7.4 Dependency graph

Mostra:

- Milestone dependencies;
- Feature dependencies;
- blockers;
- critical path;
- parallelizable Tracks.

Graph é projeção do contract.

Não pode alterar dependencies diretamente.

---

# 11.8 Plan Review Surface

## 11.8.1 Atual

```text
Plan JSON
→ deterministic HTML
→ Lavish
```

## 11.8.2 Necessidades

- Mission/Milestone/Feature hierarchy;
- criteria at every level;
- dependency graph;
- scope;
- assumptions;
- risks;
- questions;
- Standards;
- Golden Paths;
- Security Environment;
- proof plan;
- version diff;
- exact hash;
- approval action.

## 11.8.3 Feedback

Feedback é convertido em:

- Plan Revision;
- Decision;
- Question answer;
- Replan request.

Não muta o Approved Contract diretamente.

## 11.8.4 Futuro

O Web Console pode incorporar a experiência.

Lavish permanece substituível.

---

# 11.9 Decision Inbox

## 11.9.1 Objetivo

Concentrar somente decisões que exigem Authority humana ou do Lead.

## 11.9.2 Agrupamento

Por:

- Mission;
- Decision level;
- risk;
- age;
- blocked entities;
- deadline;
- required authority.

## 11.9.3 Decision card

Apresenta:

```text
question
why now
options
recommendation
impact
risk
blocked scope
default action
evidence
```

## 11.9.4 Batch decision

Permitida somente quando:

- mesma policy;
- mesmas consequências;
- targets independentes;
- Authority adequada.

Não agrupar decisões materialmente diferentes apenas para reduzir cliques.

## 11.9.5 Decision history

Mostra:

- prior options;
- final choice;
- rationale;
- supersession;
- affected packs;
- rollout result.

---

# 11.10 Execution View

## 11.10.1 Objetivo

Mostrar execução sem obrigar o Operator a administrar processos.

## 11.10.2 Write Track row

- Track ID;
- Feature refs;
- lifecycle;
- trust;
- Lease;
- Environment;
- current Attempt;
- Worker;
- Claim;
- duration;
- context pressure;
- token/cost;
- blocker;
- next action.

## 11.10.3 Worker detail

- Role;
- provider/model;
- Session ref;
- process observation;
- Context Pack;
- contract hash;
- policy hash;
- logs;
- tool calls;
- Security Violations;
- Attempts;
- Claims.

## 11.10.4 Herdr

Quando instalado:

```text
Attach terminal
```

é uma ação opcional.

A interface precisa declarar:

```text
Herdr status is operational projection.
MNFS state remains authoritative.
```

## 11.10.5 Raw terminal

Usado para:

- debugging;
- manual intervention;
- visual inspection;
- command-level details.

Não é a UX primária de Mission Control.

---

# 11.11 Quality and Evidence View

## 11.11.1 Criterion matrix

| Criterion | Level | Proof Type | State | Freshness | Evidence | Authority |
|---|---|---|---|---|---|---|

## 11.11.2 Claim chain

```text
Attempt
→ Claim
→ Receipts
→ Findings
→ Correction
→ Verdict
```

## 11.11.3 Staleness

Evidence stale permanece visível, com:

- invalidating change;
- old target;
- required re-verification.

## 11.11.4 Evidence detail

Mostra:

- provenance;
- content hash;
- producer;
- environment;
- target SHA;
- criterion;
- trust classification;
- Artifact ref.

## 11.11.5 Parent closure

UI explica por que o pai ainda não fechou.

Exemplo:

```text
All 4 Features are closed.
Milestone remains OPEN because:
- M01/AC-02 integration recovery is pending.
```

---

# 11.12 Recovery Center

## 11.12.1 Objetivo

Transformar divergência em ação compreensível.

## 11.12.2 Divergence card

- code;
- expected;
- observed;
- affected entities;
- severity;
- data loss risk;
- safe actions;
- recommended action;
- required Authority.

## 11.12.3 Repair

Default:

```text
dry run
```

Depois:

```text
apply
```

## 11.12.4 Historical repairs

Mostra:

- prior divergence;
- action;
- result;
- actor;
- Evidence;
- recurrence.

## 11.12.5 Recovery health

Não usar “self-healed” como garantia genérica.

Mostrar:

```text
reconciled
partially reconciled
blocked
unknown
```

---

# 11.13 Security and External Effects View

## 11.13.1 Security

Mostra:

- Environment;
- policy hash;
- violations;
- blocked access;
- Credential Grants;
- expiry;
- sensitive Artifact alerts.

## 11.13.2 External Effects

Mostra:

- Effect Request;
- class;
- destination;
- required Authority;
- Credential Grant;
- execution;
- Receipt;
- Reconcile.

## 11.13.3 Production

Production actions recebem visual e wording distintos.

Nunca aparecem como ordinary tool call.

---

# 11.14 Engineering System View

## 11.14.1 Repository Profile

- capabilities;
- commands;
- Environments;
- external systems;
- open sections;
- assumptions;
- ownership.

## 11.14.2 Standards

- ID;
- level;
- status;
- applicability;
- enforcement;
- Evidence;
- false positives;
- version.

## 11.14.3 Golden Paths

- applicability;
- steps;
- templates;
- checks;
- adoption;
- success/failure;
- gaps.

## 11.14.4 Quality Posture

```text
VERIFIED
PARTIAL
MISSING
NOT_APPLICABLE
UNKNOWN
```

Por:

- domain;
- module;
- Standard;
- Repository;
- time.

## 11.14.5 Waivers

- active;
- expired;
- scope;
- compensating controls;
- removal condition.

---

# 11.15 Interface strategy

## 11.15.1 CLI

A CLI permanece:

- canonical local control surface;
- agent-facing API;
- scriptable contract;
- Recovery interface;
- JSON interface.

Toda futura UI usa os mesmos Application Services.

## 11.15.2 Human output

Compacto, legível e orientado a ação.

## 11.15.3 JSON output

Estável, tipado e versionável.

## 11.15.4 Lavish

Usado para structured review.

Não é Domain Store.

## 11.15.5 Herdr

Usado para operational projection.

Não é process/domain authority.

## 11.15.6 Future Web Console

Só entra quando:

- Domain contracts estabilizaram;
- CLI JSON estabilizou;
- multiple surfaces justificam;
- local end-to-end flow foi provado.

Arquitetura:

```text
Application Services
→ local API
→ web client
```

Não duplicar rules no frontend.

---

# 11.16 Future developer portal

Quando o MNFS operar múltiplos repositories e teams, será necessário descobrir:

- ownership;
- components;
- APIs;
- documentation;
- Golden Paths;
- Quality Posture;
- active Missions;
- support channels.

Backstage é uma opção futura porque combina:

- catalog;
- templates;
- docs;
- plugins;
- notifications;
- permissions.

Possibilidades:

```text
MNFS as Backstage plugin
MNFS links from Catalog entities
MNFS Golden Paths as template source
MNFS Quality Posture cards
MNFS docs through TechDocs
```

Não adotar antes de multi-repository need.

---

# 11.17 Notifications

## 11.17.1 Notification versus message

Notification é humana.

Message é Actor transport.

Nenhum dos dois é Domain State.

## 11.17.2 Triggers

- Decision required;
- Approval required;
- Mission blocked;
- Recovery required;
- Security Required;
- external effect unknown;
- budget exceeded;
- Milestone closed;
- Mission closed;
- delivery result.

## 11.17.3 Deduplication

Chave:

```text
target
attention class
root cause
```

## 11.17.4 Noise control

- agrupar sintomas;
- notificar somente ação material;
- não enviar ordinary progress;
- preservar audit;
- mostrar next action.

## 11.17.5 Channels

Inicial:

- CLI;
- Pi Lead;
- terminal notification.

Futuro:

- web inbox;
- Herdr notification;
- Backstage notification;
- email;
- Slack.

---

# 11.18 Domain Events e telemetria

## 11.18.1 Domain Event

Representa fato durável.

```text
PLAN_APPROVED
CLAIM_ACCEPTED
MISSION_CLOSED
```

Propriedades:

- persistido;
- authority-bearing;
- auditable;
- stable schema.

## 11.18.2 Telemetry signal

Representa observação técnica.

```text
model latency
command duration
tool error
token usage
sandbox denial
```

Propriedades:

- high volume;
- retention-controlled;
- exportable;
- optional backend.

## 11.18.3 Regra

Perda do exporter não remove o Domain Event.

Telemetry não altera state.

## 11.18.4 Projection

Um Domain Event pode gerar:

- OTel event;
- span attribute;
- metric increment.

Essa projeção é eventual e idempotente quando possível.

---

# 11.19 OpenTelemetry architecture

## 11.19.1 Decisão

Adotar OpenTelemetry como:

- instrumentation API;
- trace/metric/log model;
- OTLP export protocol;
- backend-neutral integration.

## 11.19.2 Não adotar como domínio

OTel não define:

- Mission lifecycle;
- Claim acceptance;
- criteria;
- Authority;
- gates.

## 11.19.3 SDK e exporter

Primeira arquitetura:

```text
MNFS instrumentation
→ OTel SDK
→ optional OTLP exporter
→ Phoenix / Langfuse / Collector
```

Sem exporter:

- local execution funciona;
- counters essenciais podem continuar no MNFS.

## 11.19.4 Sampling

Domain Events:

```text
never sampled away
```

Telemetry:

- errors and security may be always-on;
- successful high-volume spans may be sampled later;
- local MVP records bounded execution spans.

## 11.19.5 Resource attributes

```text
service.name = mnfs
service.version
deployment.environment
host/runtime identity
repository ID when policy permits
```

---

# 11.20 Trace model

## 11.20.1 Não usar uma Mission inteira como um span

Mission pode durar horas ou dias.

Um span não deve ficar aberto por todo o lifecycle.

## 11.20.2 Operation trace

Criar um trace por operação bounded:

- Plan Revision generation;
- worker execution;
- verification;
- review;
- integration;
- QA Journey;
- Recovery repair;
- external effect.

## 11.20.3 Correlation

Todos carregam MNFS IDs.

```text
mnfs.repository.id
mnfs.mission.id
mnfs.milestone.id
mnfs.feature.id
mnfs.write_track.id
mnfs.attempt.id
mnfs.worker_run.id
mnfs.claim.id
mnfs.role
mnfs.contract.hash
mnfs.policy.hash
mnfs.context_pack.hash
```

## 11.20.4 Exemplo de trace

```text
mnfs.worker.run
├── mnfs.authority_snapshot.load
├── mnfs.context_pack.load
├── gen_ai.invoke_agent
│   ├── gen_ai.chat
│   ├── gen_ai.execute_tool
│   └── gen_ai.execute_tool
├── mnfs.claim.open
└── mnfs.worker.complete
```

## 11.20.5 Span links

Usar links para relacionar:

- Review com Worker Run;
- Correction com Finding;
- Integration com várias Tracks;
- new Worker Run com Attempt anterior;
- Closeout com Milestone bundles.

## 11.20.6 Trace ID não é Domain ID

Trace ID é técnico e temporário.

Mission ID é estável.

---

# 11.21 Semantic conventions

## 11.21.1 Namespace MNFS

MNFS mantém um namespace interno estável:

```text
mnfs.*
```

## 11.21.2 Standards externos

Mapear quando aplicável:

- standard errors;
- HTTP;
- database;
- messaging;
- CI/CD;
- GenAI;
- service/resource.

## 11.21.3 GenAI conventions

Campos úteis:

- agent;
- workflow;
- conversation;
- provider;
- model;
- operation;
- tool;
- tokens;
- cache.

As convenções ainda evoluem.

## 11.21.4 Mapping version

Registrar:

```text
mnfs.telemetry.mapping.version
```

Mudança de convenção externa não causa migration de Domain State.

## 11.21.5 OpenInference

Pode ser usado por Phoenix.

É mapping de backend, não modelo canônico.

---

# 11.22 Telemetria de LLMs e agentes

## 11.22.1 Identity

- Role;
- model;
- provider;
- effort;
- Worker Run;
- Session ref;
- prompt/Role Contract version;
- Context Pack hash.

## 11.22.2 Tokens

- input;
- output;
- reasoning;
- cache read;
- cache creation;
- Observer;
- Reflector;
- Dropper.

## 11.22.3 Timing

- queue;
- first token;
- total generation;
- tool wait;
- total Worker Run;
- compaction;
- memory work.

## 11.22.4 Tool calls

- tool ID;
- arguments classification;
- duration;
- result class;
- error;
- Effect class;
- sandbox result.

## 11.22.5 Context

- Pack size;
- file count;
- Artifact count;
- truncation;
- stale event;
- exact recalls;
- Session compactions.

## 11.22.6 Output content

Não capturar raw content por default.

Capturar:

- hash;
- size;
- type;
- Artifact ref;
- result classification.

---

# 11.23 Privacy e security da telemetria

## 11.23.1 Default capture

- IDs;
- hashes;
- timestamps;
- durations;
- state/result classes;
- model/provider;
- token counters;
- tool IDs;
- error types;
- versions;
- Artifact refs.

## 11.23.2 Default exclusion

- raw prompts;
- system instructions;
- model outputs;
- code;
- diff;
- credentials;
- customer data;
- secret-bearing logs.

## 11.23.3 Scoped content mode

Pode ser ativado para:

- test fixture;
- Architecture Spike;
- isolated debugging;
- curated evaluation.

Exige:

- policy;
- redaction;
- retention;
- access;
- consent/awareness.

## 11.23.4 Backend boundary

OTLP exporter recebe somente conteúdo permitido.

Não enviar tudo e confiar apenas no backend para redaction.

## 11.23.5 Retention

Definir por signal:

- Domain Events;
- traces;
- logs;
- evaluation data;
- raw debugging content;
- security evidence.

---

# 11.24 Backends candidatos

## 11.24.1 Phoenix

Pontos fortes:

- open-source;
- local/self-hosted;
- OTLP collector;
- trace UI;
- OpenInference;
- datasets;
- experiments;
- human/code/LLM evaluation;
- agent trajectory support.

Classificação:

```text
PRIMARY LOCAL CANDIDATE
```

## 11.24.2 Langfuse

Pontos fortes:

- traces;
- Sessions;
- observations;
- scores;
- score configs;
- annotation queues;
- code evaluators;
- LLM judges;
- datasets;
- experiments;
- dashboards;
- APIs;
- OTLP;
- self-host/cloud.

Classificação:

```text
PRIMARY FULL-LIFECYCLE CANDIDATE
```

## 11.24.3 Decisão

Não escolher somente por feature checklist.

Executar AS-03.

## 11.24.4 Abstraction

Adotar OTLP antes de um backend-specific SDK para core telemetry.

Backend SDK específico pode ser usado apenas para capability não disponível por OTLP, atrás de adapter.

---

# 11.25 Evaluation Result

## 11.25.1 Definição

Registra uma avaliação de qualidade ou comportamento.

```ts
interface EvaluationResult {
  id: EvaluationResultId;

  target:
    | TraceRef
    | SpanRef
    | WorkerRunId
    | ClaimId
    | MissionId
    | ExperimentRunId;

  evaluator:
    | 'DETERMINISTIC'
    | 'HUMAN'
    | 'LLM_JUDGE'
    | 'USER_FEEDBACK';

  rubricId: string;
  rubricVersion: number;

  value:
    | number
    | boolean
    | string;

  valueType:
    | 'NUMERIC'
    | 'BOOLEAN'
    | 'CATEGORICAL'
    | 'TEXT';

  evidenceRefs: ArtifactRef[];
  modelBinding?: string;

  coverage:
    | 'COMPLETE'
    | 'PARTIAL'
    | 'UNKNOWN';

  createdAt: string;
}
```

## 11.25.2 Não é Verdict

Evaluation Result pode informar:

- experiment;
- Calibration;
- Quality Posture;
- investigation.

Não fecha Domain Entity automaticamente.

## 11.25.3 Score schema

Rubrics e categories são versionadas.

Evitar score sem significado operacional.

---

# 11.26 Evaluation methods

## 11.26.1 Deterministic

Usar para:

- exact match;
- schema;
- JSON;
- state;
- timeout;
- counts;
- rule conformance.

## 11.26.2 Human

Usar para:

- Operator trust;
- UX;
- architecture;
- usefulness;
- nuanced correctness;
- ground truth.

## 11.26.3 LLM Judge

Usar para:

- scalable rubric;
- semantic classification;
- qualitative dimensions.

Precisa de:

- judge model/version;
- rubric;
- sample calibration;
- human agreement checks;
- cost;
- bias monitoring.

Não é autoridade única para high-risk gates.

## 11.26.4 User feedback

Usar como signal.

Não confundir satisfação momentânea com correctness.

## 11.26.5 Multiple evaluators

Compare agreement quando uma policy depende da avaliação.

---

# 11.27 Golden Missions Dataset

## 11.27.1 Definição

Coleção canônica de cenários para avaliar o MNFS.

## 11.27.2 Categorias

```text
PLANNING
IMPLEMENTATION
REVIEW
INTEGRATION
RECOVERY
MEMORY
SECURITY
QA
EXTERNAL_EFFECT
CLOSEOUT
```

## 11.27.3 Dataset Item

```ts
interface GoldenMissionCase {
  id: string;
  category: string;
  repositoryFixtureRef: string;
  input: ArtifactRef;
  expectedDomainOutcomes: string[];
  prohibitedOutcomes: string[];
  requiredEvidence: string[];
  risk: string;
  sensitivity: string;
  source: string;
  version: number;
}
```

## 11.27.4 Fontes

- accepted Missions;
- escaped defects;
- false completion;
- Findings;
- Recovery drills;
- Security drills;
- Operator feedback;
- adapter failures;
- Replans.

## 11.27.5 Curadoria

Real trace vira candidate.

Antes de entrar:

- redact;
- normalize;
- classify;
- define expected;
- human review;
- version.

---

# 11.28 Experiments

## 11.28.1 Objetivo

Comparar mudanças usando os mesmos cenários.

## 11.28.2 Variables

- model;
- provider;
- effort;
- Role Contract;
- prompt;
- memory adapter;
- Context strategy;
- Golden Path;
- gate policy;
- Review policy;
- sandbox;
- timeout;
- parallelism.

## 11.28.3 Fixed inputs

Mesmo:

- dataset;
- fixture;
- expected outcome;
- policy scope;
- evaluation rubric.

## 11.28.4 Outputs

- deterministic outcomes;
- Evaluation Results;
- false completion;
- defects;
- cost;
- latency;
- retry;
- context size;
- human rating;
- Coverage.

## 11.28.5 Reproducibility

Registrar:

- MNFS version;
- policy version;
- model/provider;
- package versions;
- fixture SHA;
- Environment;
- dataset version;
- evaluator versions.

## 11.28.6 Segmentation

Comparar por:

- Role;
- risk;
- task class;
- Repository;
- language;
- context size;
- environment.

Média global pode esconder regressão crítica.

---

# 11.29 Online e offline evaluation loop

```text
live Mission
→ trace / Evidence / feedback
→ Dataset Candidate
→ curated Dataset Item
→ offline Experiment
→ Calibration Candidate
→ shadow
→ canary
→ Calibration Decision
→ rollout or rollback
```

## 11.29.1 Offline

Antes de:

- model change;
- prompt change;
- policy change;
- memory change;
- Golden Path change;
- gate change.

## 11.29.2 Online

Monitora:

- regressions;
- drift;
- cost;
- unexpected classes;
- real usage.

## 11.29.3 Shadow

Candidate policy produz decisão hipotética.

Não controla execução.

## 11.29.4 Canary

Controla subset low-risk.

## 11.29.5 Full

Somente após acceptance criteria.

---

# 11.30 Calibration

## 11.30.1 Definition

Calibration altera bindings e policies usando Evidence.

Targets:

- model routing;
- effort;
- Context budget;
- memory;
- gates;
- Review;
- Golden Path;
- timeout;
- retry;
- parallelism;
- Environment.

## 11.30.2 Calibration Candidate

Origem:

- experiment;
- repeated Finding;
- cost anomaly;
- failure;
- Operator feedback;
- posture gap;
- security signal.

## 11.30.3 Calibration Decision

```ts
interface CalibrationDecision {
  id: CalibrationDecisionId;

  targetPolicy: string;
  currentVersion: string;
  candidateVersion: string;

  evidenceRefs: ArtifactRef[];
  datasetRefs: string[];
  experimentRefs: string[];

  expectedBenefit: string;
  risks: string[];
  segments: string[];

  rollout:
    | 'SHADOW'
    | 'CANARY'
    | 'FULL';

  rollbackConditions: string[];
  requiredAuthority: ActorRole;

  result:
    | 'PROPOSED'
    | 'APPROVED'
    | 'REJECTED'
    | 'ROLLED_BACK';
}
```

## 11.30.4 No self-tuning initially

Policy não é reescrita automaticamente a partir de dashboards.

Mudança exige:

- Evidence;
- coverage;
- segmentation;
- Decision;
- version;
- rollback.

## 11.30.5 Future bounded automation

Somente para low-risk parameter e com:

- complete coverage;
- fixed bounds;
- canary;
- automatic rollback;
- audit.

---

# 11.31 Measurement strategy

## 11.31.1 Why before metric

Toda métrica declara:

```text
decision it informs
owner
collection method
coverage
failure modes
action thresholds
```

Sem decisão associada, não coletar por default.

## 11.31.2 Não criar score universal

Qualidade, custo, velocidade e experiência possuem trade-offs.

Um número único esconderia esses trade-offs.

---

# 11.32 Dimensões de métricas

## 11.32.1 Outcome and Quality

- criteria satisfaction;
- false completion rate;
- escaped defects;
- reopened Features;
- accepted risks;
- user outcome;
- integration failures;
- QA failure.

## 11.32.2 Flow and Reliability

- Mission lead time;
- active time;
- waiting time;
- Decision wait;
- queue time;
- Recovery time;
- divergence rate;
- Effect unknown rate;
- delivery recovery.

## 11.32.3 Efficiency and Cost

- total tokens;
- provider cost;
- memory-worker cost;
- command runtime;
- human intervention;
- rework;
- unused context;
- repeated reads;
- idle time.

## 11.32.4 Operator and Developer Experience

- interruption count;
- Decision clarity;
- manual interventions;
- time to understand status;
- perceived trust;
- satisfaction;
- cognitive load;
- collaboration impact.

## 11.32.5 Engineering Health

- Standard coverage;
- Quality Posture;
- Waiver age;
- Golden Path adoption;
- gardening debt;
- documentation health;
- security posture.

---

# 11.33 DORA e SPACE

## 11.33.1 DORA

Usar quando houver delivery real:

- change lead time;
- deployment frequency;
- change fail percentage;
- failed deployment recovery time;
- reliability/SLO context.

Não usar para classificar Worker individual.

## 11.33.2 DORA 2025 insight

AI amplifica strengths e weaknesses do sistema.

Portanto:

```text
more AI activity
≠ better delivery
```

Underlying engineering system é decisivo.

## 11.33.3 SPACE

Usar como lente para:

- Satisfaction and well-being;
- Performance;
- Activity;
- Communication and collaboration;
- Efficiency and flow.

## 11.33.4 Regra

Métrica de activity nunca representa produtividade sozinha.

---

# 11.34 Vanity and dangerous metrics

Não otimizar diretamente:

- lines of code;
- commits;
- tool calls;
- Workers spawned;
- parallel Tracks;
- Session length;
- minimum tokens;
- Findings count;
- gate count;
- activity time;
- model confidence.

Podem ser diagnostic signals.

Não success criteria globais.

---

# 11.35 Attention e alerting

## 11.35.1 Attention classes

```text
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

## 11.35.2 Alert metrics

- actionability;
- false positive;
- duplicate rate;
- ignored rate;
- acknowledge time;
- resolve time.

## 11.35.3 Root-cause grouping

Um blocker pode gerar muitos sintomas.

Mostrar o root cause uma vez.

## 11.35.4 Alert storm

Quando múltiplos Actors falham pela mesma dependência:

```text
one grouped incident
+
affected entities
```

---

# 11.36 Observability failure

## 11.36.1 Export failure

- Domain State continua;
- telemetry marked degraded;
- bounded buffer;
- no secret-heavy fallback log;
- optional retry.

## 11.36.2 Backend unavailable

Local CLI/status continua.

## 11.36.3 Partial coverage

Dashboard declara:

```text
PARTIAL
```

Não exibe falso total.

## 11.36.4 Clock inconsistency

Usar timestamps e correlation IDs.

Não inferir order somente por wall-clock quando Events oferecem sequence.

---

# 11.37 AS-03 — Observability and Calibration Backend Spike

## 11.37.1 Objetivo

Comparar:

```text
A. Local SQLite/CLI baseline
B. OTel → Phoenix
C. OTel → Langfuse
```

## 11.37.2 Demo flow

```text
Mission
→ Plan
→ Worker Run
→ model/tool calls
→ Claim
→ Verification
→ Recovery drill
→ Closeout
```

## 11.37.3 Acceptance Criteria

1. traces correlacionam com MNFS IDs;
2. Domain Events continuam corretos sem backend;
3. nenhum raw secret, prompt ou code é exportado por default;
4. token, latency, error e tool data são visíveis;
5. continuidade cross-trace é consultável;
6. Evaluation Results podem ser anexados;
7. datasets e experiments comparam candidates;
8. self-host local é documentado;
9. export failure não corrompe execução;
10. overhead é medido;
11. retention/deletion são possíveis;
12. disable/replace são claros.

## 11.37.4 Comparison

- setup;
- TS integration;
- OTLP;
- trace UX;
- sessions;
- tokens/cost;
- annotations;
- evaluators;
- datasets;
- experiments;
- API;
- self-host;
- privacy;
- maintenance;
- upgrades.

## 11.37.5 Resultado

Pode decidir:

- Phoenix default opcional;
- Langfuse default opcional;
- ambos suportados por OTLP;
- local-only até nova necessidade.

---

# 11.38 M2 observability slice

M2 inclui:

- Domain Events;
- CLI status;
- JSON output;
- Worker Run timestamps;
- process result;
- log Artifact refs;
- Claim transition Events;
- token counters quando disponíveis;
- duration;
- adapter errors;
- Recovery Report.

M2 não inclui:

- Web Console;
- OTel Collector;
- Phoenix;
- Langfuse;
- dashboards;
- datasets;
- experiments;
- Calibration engine;
- DORA reporting.

---

# 11.39 Matriz de adoção

| Tool/concept | Decisão | Papel no MNFS |
|---|---|---|
| CLI | Adotar | canonical control surface |
| Lavish | Adotar | structured visual review |
| Herdr | Opcional | operational terminal projection |
| FirstMate | Referência | one liaison and crew visibility |
| GitHub agent dashboard | Referência | Session-monitoring UX |
| Backstage | Adiar/referência | future multi-repo portal |
| OpenTelemetry | Adotar | telemetry interchange |
| OTel Collector | Futuro opcional | routing/export |
| Phoenix | Candidato | local trace/evaluation backend |
| Langfuse | Candidato | full trace/evaluation backend |
| DORA | Adotar seletivamente | delivery outcomes |
| SPACE | Adotar como lente | multidimensional productivity |
| MNFS Web Console | Futuro | integrated operator UI |

---

# 11.40 Impacto nas seções anteriores

## Seção 1

Adicionar princípio:

> Measurement exists to inform a decision, not to manufacture activity.

## Seção 2

Adicionar entidades:

- Evaluation Result;
- Evaluation Dataset;
- Experiment Run;
- Calibration Decision;
- Attention Item.

## Seção 5

Adicionar:

- Operator Query Service;
- Telemetry Service;
- OTel Export Adapter;
- Evaluation Service;
- Experiment Service;
- Calibration Service;
- Notification Adapter.

## Seção 7

Clarificar:

```text
Evaluation Result
≠ Domain Verdict
```

## Seção 8

Telemetry loss não altera Domain State.

## Seção 9

Token/cost data inclui memory workers e coverage.

## Seção 10

Telemetry respeita security/redaction policy.

---

# 11.41 ADRs decorrentes

Após aprovação:

## ADR-0009 — Operator control plane and presentation surfaces

Decide:

- Mission-first;
- CLI canonical;
- Lavish structured review;
- Herdr optional;
- Web Console futuro;
- Session view não define Domain State.

## ADR-0010 — Telemetry model and OpenTelemetry export

Decide:

- Domain Events separados;
- OpenTelemetry adotado;
- `mnfs.*` namespace;
- raw content off por default;
- exporters opcionais.

## ADR-0011 — Evaluation and calibration framework

Decide:

- datasets e experiments;
- Evaluation Result separado de Verdict;
- nenhuma productivity score universal;
- Calibration Decision;
- shadow/canary/rollback.

---

# 11.42 Non-goals

Não construir agora:

- Web Console antes do Core;
- Backstage instance;
- custom observability database;
- custom trace protocol;
- custom dashboard engine;
- universal productivity score;
- automatic self-tuning;
- model leaderboard global;
- raw prompt logging por default;
- user surveillance;
- individual Worker ranking;
- token minimization como objective;
- one giant Mission trace;
- alert para todo Event;
- terminal como source of truth;
- telemetry backend obrigatório no M2;
- Langfuse/Phoenix-specific Domain Model;
- DORA metrics antes de delivery real.

---

# 11.43 Invariantes

1. Operator Control Plane é Mission-first.
2. CLI permanece canonical local command surface.
3. UI não contém Domain Rules.
4. Lavish é structured review, não store.
5. Herdr é projection, não authority.
6. Session status não é Feature status.
7. Domain Events e telemetry são diferentes.
8. Domain Events não são sampled away.
9. Telemetry loss não altera Domain State.
10. OpenTelemetry é interchange, não Domain Model.
11. `mnfs.*` é namespace interno estável.
12. GenAI convention change não migra Domain State.
13. Mission inteira não é um span longo.
14. Operation traces usam correlation IDs.
15. Trace ID não substitui Mission ID.
16. Raw prompt, output e code são off por default.
17. Secrets nunca são enviados à telemetry.
18. Backend failure não causa secret-heavy fallback.
19. Observation não é Evaluation.
20. Evaluation Result não é Verdict.
21. LLM Judge não é authority única para high-risk gate.
22. Dataset item é versionado e curated.
23. Production traces não entram cegamente em dataset.
24. Experiment registra versions e fixture.
25. Calibration exige Evidence.
26. Policy não self-tunes no MVP.
27. Shadow precede material rollout quando aplicável.
28. Canary possui rollback.
29. Métrica declara qual Decision informa.
30. Não existe productivity score universal.
31. Activity não representa productivity sozinha.
32. DORA não ranqueia Worker.
33. Alert é agrupado por root cause.
34. Quiet automation é default.
35. Operator vê next action.
36. Unknown permanece explícito.
37. Phoenix e Langfuse são adapters opcionais.
38. AS-03 decide backend com critérios.
39. M2 funciona sem observability backend.
40. Observabilidade serve entendimento; Calibration serve mudança controlada.

---

# Decisão resumida da Seção 11

> **O MNFS separa Operator Control Plane, Operational Projection, Observability Plane e Evaluation/Calibration Plane. O Operator navega por Missions, critérios, Decisions, Evidence e next actions; Sessions, terminais e traces permanecem detalhes. CLI é a interface canônica local, Lavish é a superfície de revisão estruturada, Herdr é projeção opcional e uma Web Console só entra após os contratos do Core estabilizarem. OpenTelemetry é adotado como padrão de instrumentação e exportação, com namespace `mnfs.*` estável e raw content desativado por default. Phoenix e Langfuse são backends candidatos avaliados pelo AS-03. A calibração usa Golden Missions, datasets, experiments e Calibration Decisions com shadow, canary e rollback. Métricas são multidimensionais e orientadas a decisões; o MNFS não cria um score universal de produtividade nem otimiza atividade em vez de outcome.**

---

---

## ARR-RECONCILIATION-2026-08-07 — Current M2 Opportunity-Replan path

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Product M2 preserves the secure one-Worker vertical-slice outcome while its realization follows the accepted Architecture Realization Review path:

```text
ARR-S0  Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ ARR-S2W Workspace comparison only if S2 requires it
→ ARR-S3 Vertical Composition Proof
→ substrate selection Decision
→ superseding CAP-EXECUTION / MIS-002 Replan
→ new M02 R5 Execution Design + implementation plan
```

Revision-5 M02 is a superseded execution path and must not be implemented. Named runtimes/environments remain candidates or historical Evidence until their deciding spike/Decision.

---

# 12. Roadmap de Capacidades e Ordem de Implementação

## 12.1 Propósito

Esta seção transforma o Product Blueprint em uma sequência de implementação capaz de:

- entregar valor progressivamente;
- provar as decisões arquiteturais;
- impedir abstrações prematuras;
- evitar que a plataforma cresça antes do fluxo principal funcionar;
- preservar o que já foi implementado;
- reconciliar contratos anteriores com a arquitetura atual;
- distinguir compromisso de direção estratégica;
- manter cada avanço verificável;
- permitir mudança de ordem baseada em Evidence;
- impedir que datas ou listas de componentes substituam resultados.

O roadmap não é uma lista fixa de features.

Ele é:

> **Uma sequência de capacidades cumulativas, cada uma encerrada por uma prova ponta a ponta que reduz um risco específico do produto.**

A unidade principal é o **Product Roadmap Milestone**.

Ele é diferente de um Milestone interno de Mission.

```text
Product Roadmap:
M2 — Secure One-Worker Vertical Slice

Mission:
MIS-002/M01
MIS-002/M02
```

Essa distinção é obrigatória em toda documentação.

---

# 12.2 Base de pesquisa

A estrutura do roadmap foi construída a partir de:

- walking skeleton;
- vertical slicing;
- evolutionary architecture;
- architecture fitness functions;
- minimum viable platform;
- platform-as-a-product;
- Golden Paths;
- paved roads;
- safety nets;
- guardrails;
- manual checkpoints;
- DORA platform-engineering capabilities;
- Backstage Software Templates;
- roadmaps orientados a outcomes e proofs.

A análise completa está registrada em:

```text
MNFS-RESEARCH-CAPABILITY-ROADMAP-v1.md
```

## 12.2.1 Princípios extraídos

### Walking skeleton

Primeiro provar o fluxo completo com profundidade mínima.

### Vertical slice

Cada Product Milestone atravessa as camadas necessárias para demonstrar uma capacidade observável.

### Evolutionary architecture

Arquitetura evolui com feedback, fitness functions e decisões explícitas.

### Minimum viable platform

Começar pelo workflow mais importante e construir apenas o suficiente para torná-lo demonstravelmente melhor.

### Platform as product

O valor é medido por task success, confiabilidade, segurança, carga cognitiva e experiência do usuário da plataforma.

### Golden Path growth

```text
fixed path
→ one real Golden Path
→ small proven catalog
→ multi-repository platform
```

Não começar pelo catálogo.

---

# 12.3 Limitações do roadmap anterior

O roadmap inicial M0–M6 foi uma boa espinha dorsal para iniciar o projeto.

Ele estabeleceu:

```text
M0 Foundation
M1 Visual Planning
M2 One Worker
M3 Review
M4 Parallelism
M5 Adaptive Quality
M6 Delivery and Calibration
```

Entretanto, foi criado antes das decisões atuais sobre:

- Domain Model canônico;
- critérios obrigatórios em Mission, Milestone e Feature;
- Engineering System;
- Repository Profile;
- Golden Paths;
- Context Packs;
- memória observacional;
- Security Environments;
- Credential Grants;
- External Effects;
- Evidence Bundles;
- Operator Control Plane;
- OpenTelemetry;
- Evaluation e Calibration;
- multi-repository Software Factory;
- remote/cloud execution.

Ele não deve ser descartado.

Deve ser **evoluído preservando sua intenção**.

---

# 12.4 Avaliação do estado atual

## 12.4.1 M0 — Foundation Walking Skeleton

Estado:

```text
ACCEPTED
```

Capacidades comprovadas:

- canonical WSL2 environment;
- doctor;
- Repository Identity;
- runtime fora dos worktrees;
- SQLite;
- Mission persistence;
- fresh-process recovery;
- CLI;
- tests.

Golden proof já executado:

```text
initialize repository
→ open Mission
→ terminate process
→ new process reads same Mission
```

## 12.4.2 M1 — Visual Mission Planning

Estado:

```text
ACCEPTED
```

Capacidades comprovadas:

- structured Mission Plan;
- revisions;
- canonical content hash;
- deterministic HTML;
- Lavish review;
- feedback loop;
- exact-hash approval;
- Approved Contract materialization.

## 12.4.3 MIS-002 revision 3

Estado histórico:

```text
APPROVED UNDER THE PRE-BLUEPRINT ARCHITECTURE
```

O contrato continua válido como registro histórico.

Ele não deve ser editado silenciosamente.

Entretanto, ficou **arquiteturalmente stale** porque não inclui integralmente:

- Milestone Acceptance Criteria;
- Feature identity plenamente qualificada;
- Attempt identity;
- Worker Run identity;
- Environment Profile;
- local sandbox boundary;
- policy hash;
- Current Authority Snapshot;
- Intent–Action–Observation completo;
- fencing;
- expanded Recovery taxonomy;
- fail-closed security;
- Effect default;
- Security drill.

Também exclui explicitamente isolamento além de worktree, o que conflita com o princípio atual:

```text
one bounded Writer
≠ unrestricted user process
```

Conclusão:

```text
MIS-002 revision 3
→ preserve
→ supersede through Replan
→ never mutate in place
```

---

# 12.5 Unidade do roadmap

## 12.5.1 Product Roadmap Milestone

Entrega uma capacidade reutilizável do MNFS.

Cada Product Milestone contém:

```text
Outcome
Operator-visible value
Entry Criteria
Capabilities
Golden Proof
Exit Criteria
Non-goals
Dependencies
Architecture Spikes
Telemetry Baseline
Replan Triggers
```

## 12.5.2 Architecture Spike

Investiga uma incerteza material.

Produz:

- Research Report;
- tested candidate;
- evidence;
- recommendation;
- ADR;
- Removal Conditions.

Não é delivery.

## 12.5.3 Enabler

Capacidade interna pequena necessária por um slice.

Precisa possuir consumidor nomeado.

## 12.5.4 Golden Proof

É o cenário real que demonstra a capacidade do Product Milestone.

Não é somente uma test suite.

Pode combinar:

- automated tests;
- canonical environment;
- real adapter;
- failure drill;
- fresh process;
- Evidence Bundle;
- Operator observation.

---

# 12.6 Estados de confiança

## ACCEPTED

Implementado, verificado e encerrado.

## COMMITTED

É o próximo Product Milestone e possui contrato próximo ou aprovado.

## PLANNED

Sequência e outcome são conhecidos.

O Mission Contract detalhado será criado próximo da execução.

## TARGET

Direção desejada com dependências identificadas.

Pode ser dividida ou reordenada.

## OPTION

Possibilidade estratégica.

Não é compromisso.

## DEFERRED

Explicitamente fora dos horizontes atuais.

## REMOVED

Retirado do roadmap com rationale.

---

# 12.7 Horizontes atuais

## H0 — Proven Foundation

```text
M0 Foundation Walking Skeleton      ACCEPTED
M1 Visual Mission Planning          ACCEPTED
```

## H1 — Trusted Local Harness

```text
ARR P1 constitutional reconciliation
→ ARR-S0 Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ conditional ARR-S2W Workspace Conformance
→ ARR-S3 Vertical Composition Proof
→ substrate-selection Decision
→ CAP-EXECUTION / MIS-002 Opportunity Replan
→ new M02 R5 Execution Design + implementation
→ M2 Golden Proof
```

## H2 — Complete Local Software Factory

After M2, capabilities expand only from proven consumers: Repository Profile/Engineering System, independent Review/Integration, parallel tracks, adaptive Quality/QA, governed Effects/Delivery, Observability/Evaluation/Calibration.

## H3 — Platform Expansion

Web/operator surfaces, multi-repository operation and remote/cloud execution remain options/targets whose contracts are created only when earlier local capabilities prove the need.

Horizonte representa confiança e dependency order, não data.

---

# 12.8 Visão resumida

| Item | Nome | Estado atual |
|---|---|---|
| M0 | Foundation Walking Skeleton | `ACCEPTED` |
| M1 | Visual Mission Planning | `ACCEPTED` |
| ARR-P1 | Architecture / constitutional reconciliation | `CURRENT REVIEW / CORRECTION` |
| ARR-S0 | Host Capability Probe | `NEXT POSSIBLE GATED SPIKE` |
| ARR-S1 | Agent Runtime Conformance | `PLANNED AFTER S0` |
| ARR-S2 | Local Execution Envelope Conformance | `PLANNED AFTER S0` |
| ARR-S2W | Workspace Conformance | `CONDITIONAL` |
| ARR-S3 | Vertical Composition Proof | `PLANNED AFTER S1/S2(/S2W)` |
| M2 | Secure One-Worker Vertical Slice | `OPPORTUNITY_REPLAN` |
| M3 | Repository Profile and Engineering System | `PLANNED AFTER M2` |
| M4 | Independent Review and Integration | `PLANNED` |
| M5 | Parallel Write Tracks | `PLANNED` |
| M6 | Adaptive Quality and Live QA | `PLANNED` |
| M7–M9 | Effects, Delivery, Observability/Evaluation | `TARGET` |
| M10–M12 | Web, multi-repository, remote/cloud | `OPTION / TARGET` |

The exact current execution gate lives in `docs/tracking/STATUS.md`; this roadmap never hard-codes a transient Operator authorization.

---

# 12.9 Current ARR decision program

## ARR-S0 — Host Capability Probe

Produces immutable host facts and coarse capability classes for the canonical WSL2 host. It does not install candidates and does not select a runtime/environment winner.

## ARR-S1 — Agent Runtime Conformance

Freezes a candidate-independent contract after S0, refreshes primary-source provenance, and compares only runtime shapes that can alter the decision. Recovery cannot depend on Session/transcript.

## ARR-S2 — Local Execution Envelope Conformance

Uses the same fixture/criteria across eligible process-envelope and microVM-class candidates. It proves host-read/write denial, network/credential posture, containment, fail-closed behavior, workspace semantics, Git fidelity, recovery and cleanup.

## ARR-S2W — Workspace Conformance, conditional

Exists only if the selected envelope still needs a separate workspace substrate. Do not stack an extra workspace manager when the environment already supplies sufficient private mutable workspace semantics.

## ARR-S3 — Vertical Composition Proof

```text
accepted fixed Spike contract
→ provider-neutral M01 semantic core
→ selected Agent Runtime
→ selected Execution Environment/workspace
→ fixed repository change
→ Claim(baseCommitSha,resultTreeSha)
→ terminate Lead
→ Fresh Lead Recovery
→ deterministic Receipt
→ MNFS Gate
→ accepted Git result
→ idempotent resource disposition
```

S3 is architecture Evidence, not production M02.

---

# 12.10 M2 — Secure One-Worker Vertical Slice

## Estado

```text
OPPORTUNITY_REPLAN
```

## Outcome preservado

A single bounded Writer:

```text
receives a fresh Authority Snapshot and fixed contract
→ executes through the selected Agent Runtime
→ mutates only its isolated mutable workspace inside the approved Execution Environment
→ produces a durable Claim bound to baseCommitSha/resultTreeSha
→ survives Lead death through Fresh Recovery
→ is independently verified by runner-owned Receipt(s)
→ is accepted only by an MNFS Gate
→ yields an accepted provider-neutral Git result
→ resources are safely and idempotently dispositioned
```

## Realization rules

- Worker completion is never acceptance.
- Runtime Session/transcript is never recovery authority.
- Agent Runtime, workspace substrate and Execution Environment are selected by post-Spike Decision, not by this Product outcome.
- Protected execution fails closed.
- Raw production credentials are denied for the M2 proof.
- Current network posture is contract-bound and deny-by-default for the local proof.
- Result identity remains Git-provider-neutral.
- M01 durable WriteTrack/Attempt/WorkerRun/Claim/fencing semantics are reused where provider-neutral; prior Pi/Treehouse specifics remain historical Evidence.

## Entry before production implementation

- ARR P1 accepted/integrated or exact base includes its accepted tree;
- ARR-S0/S1/S2 and any applicable S2W accepted;
- ARR-S3 accepted;
- substrate selection Decision published;
- superseding CAP-EXECUTION and MIS-002 revision approved;
- new M02 R5 Execution Design and implementation plan approved.

## Golden Proof

The production M2 proof must reproduce the semantic flow established by ARR-S3 using the selected concrete realizations and current authority, including failure/recovery drills and independent Gate acceptance.

## Non-goals

- generic provider/plugin framework without a second consumer;
- arbitrary production Effects;
- multiple parallel Writers;
- Web Console;
- remote/cloud control plane unless separately selected later.

---

# 12.11 Later Product Milestones

The original M3–M12 outcomes remain directional, but their detailed contracts are intentionally deferred until M2 Evidence exists. Their ordering principle remains:

```text
Repository-aware engineering governance
→ independent Review / Integration
→ safe parallelism
→ adaptive Quality / live QA
→ governed external Effects and Delivery
→ Observability / Evaluation / Calibration
→ richer Operator surfaces
→ multi-repository / remote expansion
```

No later milestone may retroactively turn a candidate substrate into constitutional semantics.

---

# 12.12 Historical roadmap realizations

The prior roadmap named AB1, AS-02 Local Pi Sandbox, Pi Session AS-01, Treehouse worktrees and fixed E1 as current steps. Those exact choices are preserved in Git history, accepted M01/AS-02 Evidence and superseded ADRs. They are not duplicated here as current roadmap authority because D-012 through D-015 superseded that realization path.

Historical Evidence remains usable for migration cost, incumbent comparison and regression constraints. It does not select a winner for ARR-S1/S2/S2W.

---

# 12.13 Roadmap invariants

1. Product outcomes are more stable than substrate choices.
2. Correctness is frozen before decomposition; realization is frozen before bounded execution.
3. Every Architecture Spike has a candidate-independent contract and deciding Evidence.
4. Same fixture/criteria apply to compared candidates; changing the contract invalidates prior comparison runs.
5. Product M2 cannot resume through revision-5 M02.
6. No Agent Runtime, workspace or Environment winner exists before selecting Decision.
7. S0 host facts are immutable Evidence; candidate eligibility is recomputed from fresh provenance.
8. S2W is conditional, not automatic.
9. S3 must use real selected realizations for deciding Evidence.
10. CAP-EXECUTION/MIS-002 Replan occurs after deciding Spikes, never by mutating accepted historical versions in place.
11. Later milestones receive detailed contracts only near execution.
12. Exact transient execution authority lives in STATUS/Operator gates, not in this generated roadmap.

---

# Decisão resumida da Seção 12

> **M0 e M1 permanecem aceitos. M2 preserva o outcome de um Writer local seguro, recuperável e aceito por Evidence, mas sua realização está em Opportunity Replan. O caminho corrente é ARR P1 → S0 → S1/S2 → S2W somente se necessário → S3 → substrate-selection Decision → CAP-EXECUTION/MIS-002 Replan → novo M02 R5 → M2. Pi, Treehouse, fixed E1 e os antigos AB1/AS-02/AS-01 permanecem historical/incumbent Evidence, não current roadmap authority.**

---

## ARR-RECONCILIATION-2026-08-07 — Current development/documentation governance

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

The Development Governance Method and accepted **Layered Agent Execution Planning** design govern how architecture inquiry, Decisions and bounded execution relate. MCRM remains the single Capability Realization lifecycle; execution-planning completeness is a derived projection rather than a second manual checklist.

The tooling registry is a projection of capability-realization Decisions, never architecture authority. Accepted Decisions/ADRs/specifications/contracts remain canonical sources; generated Blueprint/Roadmap/Coverage artifacts must be regenerated and checked from their editable sources.

Plan approval may be bound to exact reviewed hashes/blobs. Superseded historical documents are preserved as history instead of silently rewritten into a different decision.

---

# 13. Governança Documental, Fontes de Verdade e Protocolo de Evolução

## 13.1 Propósito

Esta seção define como o conhecimento do MNFS é:

- criado;
- classificado;
- revisado;
- aprovado;
- versionado;
- localizado;
- consumido;
- atualizado;
- superseded;
- arquivado;
- validado;
- promovido;
- mantido coerente com código e runtime.

O objetivo é impedir que:

- múltiplos documentos governem o mesmo conceito;
- uma conversa se torne arquitetura implícita;
- uma issue seja tratada como especificação;
- um tracking file seja tratado como doutrina;
- um Research Report seja tratado como decisão;
- uma decisão aceita seja silenciosamente reescrita;
- um Mission Contract aprovado seja editado manualmente;
- agentes precisem ler todos os documentos;
- AGENTS.md volte a carregar a doutrina inteira;
- o Product Blueprint se torne um Markdown monolítico impossível de manter;
- HTML gerado seja confundido com fonte;
- documentação fique verde na CI enquanto contradiz o produto;
- conhecimento rejeitado desapareça e seja redescoberto;
- documentação sem owner permaneça indefinidamente;
- código altere comportamento sem declarar impacto documental.

No MNFS:

> **Documentação canônica é parte do control plane do produto. Ela precisa de identidade, Authority, lifecycle, ownership, versionamento e checks, assim como o código.**

---

# 13.2 Base de pesquisa

Esta seção foi construída a partir de padrões e implementações de mercado, incluindo:

- Diátaxis;
- Architecture Decision Records;
- MADR;
- Kubernetes Enhancement Proposals;
- Python PEP lifecycle;
- RFC processes;
- Backstage TechDocs;
- docs-as-code;
- GitHub CODEOWNERS;
- repositories com proposal history preservada;
- presubmit checks para metadata e Markdown.

O relatório completo está registrado em:

```text
MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1.md
```

## 13.2.1 Conclusões principais

### Diátaxis

Tutorial, how-to, reference e explanation atendem necessidades diferentes.

Essa classificação governa a **forma de leitura**.

### ADR

Uma decisão arquitetural é registrada com:

- contexto;
- alternativas;
- escolha;
- consequências;
- rationale;
- supersession.

Essa classificação governa a **história decisória**.

### KEP/RFC

Uma capability não trivial exige:

- proposta comum;
- goals;
- non-goals;
- design;
- test plan;
- rollout;
- graduation;
- history;
- owners.

Essa classificação governa a **evolução do produto**.

### Docs as Code

A fonte vive com o produto, passa por Git review e gera projections.

### CODEOWNERS

Ownership documental pode participar do merge gate.

### PEP lifecycle

Rejected, superseded e withdrawn permanecem descobríveis.

O MNFS adota esses princípios sem importar toda a burocracia de grandes comunidades.

---

# 13.3 Documentação como sistema de governança

A documentação MNFS possui cinco propriedades obrigatórias.

## 13.3.1 Identity

Todo documento canônico possui ID estável.

## 13.3.2 Authority

O documento declara o que pode governar.

## 13.3.3 Lifecycle

O documento declara seu estado.

## 13.3.4 Ownership

Existe responsável por aceitar mudanças.

## 13.3.5 Validation

Estrutura, links, relações e projections são verificáveis.

## 13.3.6 Não basta existir

Um documento sem:

- owner;
- source-of-truth scope;
- update trigger;
- consumer;
- status;

é candidato a documentação morta.

---

# 13.4 Dois eixos de classificação

Documentos são classificados por dois eixos independentes.

## 13.4.1 Authority class

Define o que o documento governa.

## 13.4.2 Reader form

Define qual necessidade de leitura atende.

```text
Authority
×
Diátaxis form
```

Exemplos:

| Documento | Authority | Form |
|---|---|---|
| Product Blueprint | Constitutional | Explanation |
| CLI command reference | Reference | Reference |
| Run M2 locally | Guidance | How-to |
| Learn the Mission lifecycle | Guidance | Tutorial |
| ADR-0006 | Decision | Explanation |
| Security Standard | Standard | Reference + Explanation |
| Mission plan | Contract | Reference |
| Research report | Research | Explanation |

A forma não eleva Authority.

Um how-to nunca supera um ADR.

---

# 13.5 Classes de Authority

## A0 — Constitutional

Exemplos:

- Product Blueprint;
- Documentation Governance;
- constitutional invariants.

Pode governar:

- produto;
- domínio;
- authority hierarchy;
- source-of-truth model;
- non-goals;
- evolução geral.

## A1 — Decision

Exemplos:

- ADR;
- Calibration Decision;
- material Roadmap Decision.

Pode governar:

- uma escolha específica;
- suas alternativas;
- consequências;
- supersession.

## A2 — Specification

Exemplos:

- Capability Spec;
- Architecture Spike spec;
- schema specification;
- protocol specification.

Pode governar:

- design completo de uma capability;
- test plan;
- rollout;
- graduation.

## A3 — Contract

Exemplos:

- Approved Mission Contract;
- API contract;
- accepted Environment Spec;
- Closeout contract.

Pode governar:

- commitment scoped;
- critérios;
- exact version/hash;
- execução daquela unidade.

## A4 — Standard / Policy

Exemplos:

- Engineering Standard;
- Golden Path;
- Security Policy;
- Repository Profile binding.

Pode governar:

- regra aplicável;
- preferred path;
- enforcement;
- exception.

## A5 — Reference

Exemplos:

- CLI reference;
- schema reference;
- state-machine reference;
- compatibility matrix.

Pode governar:

- descrição exata da machinery atual.

Não define por que a machinery existe quando isso pertence a ADR ou Blueprint.

## A6 — Guidance

Exemplos:

- tutorial;
- how-to;
- runbook;
- contributor guide.

Pode governar:

- sequência recomendada de uso.

Não altera contrato nem arquitetura.

## A7 — Evidence

Exemplos:

- drill report;
- test report;
- accepted Evidence Bundle;
- benchmark result;
- closeout.

Pode governar:

- o que foi observado;
- sob quais condições;
- por quem;
- contra qual target.

## A8 — Tracking

Exemplos:

- GitHub issue;
- STATUS.md;
- implementation checklist;
- project board.

Pode governar:

- coordenação atual.

Nunca governa arquitetura isoladamente.

## A9 — Research / Historical

Exemplos:

- market research;
- legacy map;
- rejected proposal;
- superseded plan;
- historical field evidence.

Pode governar:

- histórico;
- análise;
- fontes;
- limitações.

Não se torna normative por existir.

## A10 — Generated Projection

Exemplos:

- aggregate Blueprint;
- review HTML;
- rendered site;
- generated API reference;
- diagram projection.

Não possui Authority independente.

Sua Authority deriva da fonte.

---

# 13.6 Hierarquia de Authority

Quando existe conflito:

```text
1. Accepted ADR específico para a decisão
2. Current Product Blueprint constitutional rule
3. Current accepted Capability Spec
4. Current Approved Contract para o scope
5. Current Standard / Policy / Repository Profile
6. Current implementation-derived Reference
7. Guidance
8. Tracking
9. Research / Historical
10. Generated Projection follows its source
```

Essa hierarquia não autoriza contradição silenciosa.

Conflito material produz:

```text
DOCUMENTATION_DIVERGENCE
```

Ações possíveis:

- corrigir doc stale;
- criar ADR;
- Replan;
- atualizar Capability Spec;
- bloquear dispatch;
- abrir Finding;
- aceitar risco documental temporário.

---

# 13.7 Regra “um conceito, um owner”

Cada conceito durável possui um documento proprietário.

| Conceito | Fonte proprietária |
|---|---|
| Product promise | Product Blueprint |
| Constitutional principles | Product Blueprint |
| Domain hierarchy | Product Blueprint / Domain Model section |
| Specific architecture decision | ADR |
| Complete reusable capability | Capability Spec |
| Product sequence | Roadmap |
| Scoped implementation commitment | Approved Mission Contract |
| Current runtime state | SQLite |
| Repository commands/bindings | Repository Profile |
| Engineering rule | Engineering Standard |
| Preferred path | Golden Path |
| CLI syntax | CLI reference/help |
| Current project coordination | Tracking |
| Observed proof | Evidence Artifact |
| Market/legacy analysis | Research Report |
| Implementation detail | Code + Reference |

Outros documentos:

- linkam;
- resumem;
- explicam;
- aplicam.

Não redefinem.

---

# 13.8 Fonte de verdade por storage

## 13.8.1 Git

Fonte canônica para:

- Product Blueprint;
- ADRs;
- Capability Specs;
- Roadmap;
- Standards;
- Golden Paths;
- Repository Profile source;
- Reference;
- Guidance;
- Research;
- accepted repository-owned Evidence;
- generated-source manifests.

## 13.8.2 `.mnfs/`

Fonte canônica para artifacts machine-readable que precisam acompanhar o Repository:

- Repository Identity;
- Approved Mission Contracts;
- promoted accepted Evidence;
- Closeouts;
- future machine manifests.

`.mnfs/` não é o lugar principal de prosa de produto.

## 13.8.3 SQLite

Fonte canônica operacional para:

- current lifecycle;
- active revisions;
- Attempts;
- Worker Runs;
- Claims;
- Receipts;
- Findings;
- Decisions;
- Events;
- Leases;
- runtime Artifact refs.

SQLite não define doutrina.

## 13.8.4 Runtime Artifact Store

Contém:

- logs;
- prompts;
- generated HTML;
- traces;
- screenshots;
- command outputs;
- temporary Evidence.

Promovido quando necessário.

## 13.8.5 GitHub issue e PR

Issue:

- problem/work container;
- discussion;
- tracking;
- links.

PR:

- proposed change;
- review vehicle;
- CI.

O resultado canônico está no documento merged, não no comentário.

## 13.8.6 Session e Observational Memory

Session:

- reasoning continuity;
- exact conversational history.

Observational Memory:

- supporting compressed context.

Nenhuma governa produto até promoção.

---

# 13.9 Layout documental proposto

```text
README.md
AGENTS.md
CONTRIBUTING.md
CHANGELOG.md

.github/
├── CODEOWNERS
├── pull_request_template.md
└── workflows/
    └── docs.yml

docs/
├── DOCUMENTATION-MAP.md
├── roadmap.md
│
├── product/
│   ├── README.md
│   ├── blueprint/
│   │   ├── 01-product-vision.md
│   │   ├── 02-domain-model.md
│   │   ├── 03-lifecycle-flows.md
│   │   ├── 04-engineering-system.md
│   │   ├── 05-system-architecture.md
│   │   ├── 06-roles-authority.md
│   │   ├── 07-quality-evidence.md
│   │   ├── 08-state-recovery.md
│   │   ├── 09-context-memory.md
│   │   ├── 10-security-isolation.md
│   │   ├── 11-operator-observability.md
│   │   ├── 12-capability-roadmap.md
│   │   └── 13-documentation-governance.md
│   └── PRODUCT-BLUEPRINT.md
│
├── adr/
│   ├── README.md
│   ├── template.md
│   └── 0001-*.md
│
├── capabilities/
│   ├── README.md
│   ├── template.md
│   └── CAP-*/
│       ├── SPEC.md
│       ├── TEST-PLAN.md
│       └── IMPLEMENTATION-HISTORY.md
│
├── standards/
├── golden-paths/
├── repository-profile/
├── reference/
├── how-to/
├── tutorials/
├── explanation/
├── research/
├── design/
├── tracking/
│   └── archive/
└── history/

.mnfs/
├── repo.json
├── missions/
│   └── MIS-*/
│       ├── plan.json
│       ├── accepted-evidence/
│       └── closeout.json
└── accepted-evidence/
```

## 13.9.1 YAGNI

Não criar diretórios vazios apenas para satisfazer o diagrama.

Criar cada diretório quando existir seu primeiro documento canônico.

---

# 13.10 Product Blueprint modular

O Blueprint completo cresceu para centenas de milhares de caracteres.

Um único arquivo como fonte editável causaria:

- conflitos;
- revisão ampla;
- difícil ownership;
- contexto excessivo;
- navegação ruim;
- maior risco de edição acidental.

Decisão:

```text
canonical editable source
→ 13 modular section files

generated publication
→ PRODUCT-BLUEPRINT.md
```

## 13.10.1 Source files

Cada Section:

- possui ID;
- metadata;
- own status;
- stable heading;
- relations;
- review triggers.

## 13.10.2 Aggregate

`PRODUCT-BLUEPRINT.md`:

- é generated;
- inclui warning;
- inclui version;
- inclui source hashes;
- não é editado diretamente;
- é verificado pela CI;
- é a versão conveniente para leitura e export.

## 13.10.3 Publication

Uma futura static site ou TechDocs consome as mesmas fontes.

O site nunca substitui Git.

---

# 13.11 Metadata schema

Documentos canônicos Markdown usam frontmatter estruturado quando aplicável.

```yaml
---
id: DOC-PRODUCT-BLUEPRINT-01
title: Product Vision
document_type: product_blueprint_section
form: explanation
authority: constitutional
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - product promise
  - constitutional principles
supersedes: []
superseded_by: null
related:
  - ADR-0001
review_triggers:
  - product promise changes
  - authority model changes
last_reviewed: 2026-08-02
tracking_issue: 6
---
```

## 13.11.1 Required fields

Por classe:

```text
id
title
document_type
authority
status
owners
version or revision
source_of_truth_for
related
```

## 13.11.2 Optional

```text
form
approvers
implementation_status
supersedes
superseded_by
review_triggers
last_reviewed
generated_from
tracking_issue
canonical_environment
```

## 13.11.3 Rules

- IDs únicos;
- owners existentes;
- relations resolvíveis;
- allowed status por class;
- generated docs declaram source;
- accepted normative docs não ficam sem owner;
- Research declara non-normative;
- Tracking declara no architecture authority.

---

# 13.12 Lifecycle por classe

## 13.12.1 ADR

```text
PROPOSED
ACCEPTED
REJECTED
SUPERSEDED
DEPRECATED
```

## 13.12.2 Capability Spec

```text
DRAFT
PROPOSED
ACCEPTED
IMPLEMENTING
IMPLEMENTED
DEFERRED
SUPERSEDED
WITHDRAWN
```

## 13.12.3 Product Blueprint

```text
DRAFT
PROPOSED
ACCEPTED
SUPERSEDED
```

A versão atual aceita permanece ACTIVE implicitamente.

## 13.12.4 Standard

```text
CANDIDATE
PILOT
RATIFIED
ENFORCED
DEPRECATED
SUPERSEDED
```

## 13.12.5 Golden Path

```text
DRAFT
PILOT
ACTIVE
DEPRECATED
RETIRED
```

## 13.12.6 Research

```text
DRAFT
PUBLISHED
SUPERSEDED
HISTORICAL
```

## 13.12.7 Tracking

```text
CURRENT
COMPLETED
ARCHIVED
```

## 13.12.8 Generated

```text
GENERATED
```

## 13.12.9 Implementation status

Quando necessário, separado:

```text
PLANNED
PARTIAL
IMPLEMENTED
VERIFIED
```

Uma Spec pode estar `ACCEPTED` e `implementation_status: PLANNED`.

---

# 13.13 ADR process

## 13.13.1 Quando criar

ADR é obrigatório quando a mudança:

- altera boundary arquitetural;
- escolhe ou remove tool material;
- altera source-of-truth;
- altera persistence;
- altera security model;
- altera execution topology;
- altera contract strategy;
- possui trade-off durável;
- precisa sobreviver à Mission atual.

## 13.13.2 Quando não criar

Não usar ADR para:

- naming local;
- refactor rotineiro;
- implementation detail já coberto;
- progresso;
- Research sem decisão;
- escolha facilmente reversível sem impacto.

## 13.13.3 Template MNFS

```text
Title
Status
Date
Context and Problem Statement
Decision Drivers
Considered Options
Decision Outcome
Positive Consequences
Negative Consequences
Risks
Validation
Migration / Rollback
Supersedes / Superseded By
Related Documents
```

## 13.13.4 Imutabilidade semântica

Após `ACCEPTED`, permitido:

- typo;
- link repair;
- metadata;
- successor link;
- non-semantic clarification.

Proibido:

- trocar escolha;
- remover downside;
- reescrever rationale;
- apagar alternativa;
- adaptar à implementação acidental.

Mudança semântica:

```text
new ADR
→ supersedes old ADR
```

---

# 13.14 Product Blueprint evolution

O Blueprint é living constitutional documentation.

Não é immutable como ADR.

É versionado e governado.

## 13.14.1 B0 — Editorial

- spelling;
- formatting;
- link;
- sem mudança de meaning.

Review:

- docs owner.

Version:

- optional patch.

## 13.14.2 B1 — Clarification

Explica melhor regra existente sem alterar:

- behavior;
- Authority;
- scope;
- source-of-truth.

Review:

- owner;
- ADR consistency.

Version:

- patch.

## 13.14.3 B2 — Material extension

Adiciona:

- capability;
- rule;
- subsystem;
- compatible extension.

Exige:

- architecture issue;
- related ADR quando há choice;
- affected-document analysis;
- Operator approval.

Version:

- minor.

## 13.14.4 B3 — Constitutional change

Altera:

- product promise;
- Authority hierarchy;
- source-of-truth;
- constitutional invariant;
- primary Domain Model;
- fundamental local/cloud boundary.

Exige:

- explicit architecture proposal;
- alternatives;
- adversarial review;
- migration/reconciliation;
- Operator approval.

Version:

- major.

## 13.14.5 Changelog

B1–B3 registra:

- version;
- date;
- changed Sections;
- reason;
- ADRs;
- affected Specs;
- affected Missions;
- migration.

## 13.14.6 Accepted baselines

Major accepted baseline recebe:

- Git tag or release marker;
- generated aggregate;
- changelog;
- source hashes.

Git history preserva versões anteriores.

---

# 13.15 Capability Specification process

Capability Spec é o equivalente MNFS de uma KEP/RFC.

## 13.15.1 Required sections

```text
Metadata
Summary
Motivation
Goals
Non-goals
Operator Stories
Domain Changes
Architecture
State and Recovery
Security and Privacy
Interfaces
Engineering Standards
Observability
Test Plan
Golden Proof
Graduation Criteria
Upgrade/Downgrade
Rollout/Rollback
Dependencies
Risks
Alternatives
Implementation History
Open Questions
```

## 13.15.2 Lifecycle

```text
DRAFT
→ PROPOSED
→ ACCEPTED
→ IMPLEMENTING
→ IMPLEMENTED
```

Alternativas:

```text
DEFERRED
WITHDRAWN
SUPERSEDED
```

## 13.15.3 Issue relation

Issue:

- tracking;
- discussion;
- implementation links.

Spec:

- canonical proposal.

## 13.15.4 Mission relation

Spec:

- reusable capability.

Mission Contract:

- implementation commitment scoped.

Mission referencia:

- Spec ID;
- version/hash;
- partial/full scope.

---

# 13.16 Mission Contract governance

Approved revisions são immutable.

## 13.16.1 Draft

Vive em:

- SQLite;
- generated artifacts;
- Lavish projection.

## 13.16.2 Approval

- exact hash;
- Operator authority;
- materialization under `.mnfs/missions`.

## 13.16.3 Change

Material change:

```text
new revision
→ review
→ approval
→ active-work reconciliation
```

## 13.16.4 Proibições

- editar `plan.json` manualmente;
- alterar criteria after dispatch;
- apagar old revision;
- reinterpretar Claim under new contract;
- usar Git commit alone como approval.

## 13.16.5 MIS-002

Revision 3:

- historical accepted artifact;
- not deleted;
- superseded after Replan;
- retained for architecture history.

---

# 13.17 Engineering Standards

Cada Standard possui:

- ID;
- version;
- domain;
- statement;
- level;
- status;
- applicability;
- rationale;
- enforcement;
- Evidence;
- exception policy;
- owner.

## 13.17.1 Rule

Standard não é copiado integralmente para:

- Golden Path;
- Profile;
- Mission.

Eles referenciam versão.

## 13.17.2 Change

Material change increments version.

Active Missions remain bound to effective version unless Replan/policy decides otherwise.

---

# 13.18 Golden Paths

Cada Golden Path possui:

- ID;
- version;
- applicability;
- planning questions;
- required Standards;
- templates;
- actions;
- checks;
- Evidence;
- Safety Nets;
- deviations;
- owner;
- metrics.

Golden Path não redefine Standard.

Ele compõe Standards num path.

---

# 13.19 Repository Profile

Owns Repository-specific bindings:

- commands;
- architecture modules;
- environments;
- contracts;
- resources;
- external systems;
- ratified assumptions;
- Profile-specific bindings.

Não owns:

- universal constitution;
- Mission state;
- global tool doctrine;
- temporary logs.

Profile semantic change invalidates affected Context Packs.

---

# 13.20 Research governance

Research Report deve conter:

```text
Question
Date
Scope
Sources
Method
Findings
Evidence
Uncertainties
Recommendation
Limitations
Adoption status
```

## 13.20.1 Authority

Research:

```text
PUBLISHED
≠ ADOPTED
```

Adoption exige:

- ADR;
- Blueprint;
- Spec;
- Standard;
- Roadmap Decision.

## 13.20.2 Updates

Não reescrever old research para parecer correto.

Criar:

- new version;
- addendum;
- superseding report.

---

# 13.21 Tracking e GitHub

## 13.21.1 Tracking role

Tracking mostra:

- current progress;
- open work;
- checklist;
- assigned owner;
- blockers;
- next action.

## 13.21.2 Issue

Issue é work container.

Não é source-of-truth final.

## 13.21.3 PR

PR é:

- proposed diff;
- review;
- CI;
- merge vehicle.

Merged file é canonical.

## 13.21.4 Comment

Um comentário pode registrar uma decisão provisória.

Para governar:

```text
promote to canonical source
```

## 13.21.5 Architecture Issue #6

Issue #6:

- initiated the historical architecture-baseline cycle now superseded by ARR;
- defines deliverables;
- tracks approval.

Após canonical publication:

- link final documents;
- update checklist;
- remain open until MIS-002 reconciliation and explicit M2 unblock.

---

# 13.22 Generated documentation

Generated files possuem header:

```text
GENERATED — DO NOT EDIT

Source:
Generator:
Generator version:
Source hash:
Generated at:
```

## 13.22.1 Examples

- PRODUCT-BLUEPRINT.md;
- review.html;
- CLI reference;
- schema reference;
- static site;
- Mermaid generated diagram.

## 13.22.2 CI

Verifica:

- source exists;
- source hash;
- generated content fresh;
- no manual-only delta.

## 13.22.3 Authority

Generated projection inherits source Authority.

---

# 13.23 Entrypoints

## 13.23.1 README.md

Audience:

```text
human newcomer
```

Contém:

- what MNFS is;
- current maturity;
- canonical environment;
- quick start;
- core docs links;
- current Product Milestone;
- limitations.

Não contém toda arquitetura.

## 13.23.2 AGENTS.md

Audience:

```text
all coding agents
```

Contém somente:

- first commands;
- hard rules;
- safety;
- source links;
- verification;
- docs-impact rule;
- prohibited shortcuts.

AGENTS.md:

```text
index
≠ doctrine
```

## 13.23.3 DOCUMENTATION-MAP.md

Audience:

- humans;
- Leads;
- Planners;
- Context Pack Compiler.

Contém:

- Authority model;
- source catalog;
- read order;
- owners;
- versions;
- status;
- supersession;
- generated docs;
- update protocol.

---

# 13.24 Read order

## 13.24.1 New human

```text
README
→ Documentation Map
→ Product Blueprint overview
→ Roadmap
→ relevant Capability Spec
→ related ADRs
```

## 13.24.2 Architecture contributor

```text
Documentation Map
→ complete Product Blueprint
→ ADR log
→ Capability Specs
→ Research
→ active architecture issue
```

## 13.24.3 MNFS Lead

```text
AGENTS.md
→ mnfs status / Current Authority Snapshot
→ Approved Mission Contract
→ Handoff/Context Pack
→ relevant Capability Spec
→ related ADRs
```

## 13.24.4 Writer

```text
Current Authority Snapshot
→ Writer Pack
→ exact code/contracts
```

No full Blueprint by default.

## 13.24.5 Reviewer

```text
Review Pack
→ fixed target
→ criteria
→ Standards
→ relevant Spec/ADR
```

No Writer transcript/OM.

## 13.24.6 QA

```text
QA Pack
→ Journey
→ Environment
→ expected observations
```

---

# 13.25 Documentation Impact declaration

Todo PR e Claim de mudança declara:

```yaml
documentation_impact:
  status: NONE | UPDATED | FOLLOW_UP_REQUIRED
  affected:
    - DOC-...
  rationale: ...
  follow_up: ...
```

## 13.25.1 NONE

Precisa de rationale específico.

## 13.25.2 UPDATED

Lista fontes canônicas atualizadas.

## 13.25.3 FOLLOW_UP_REQUIRED

Permitido quando:

- não é seguro concluir docs no mesmo change;
- issue existe;
- owner existe;
- contradiction material não é introduzida;
- trigger é definido.

## 13.25.4 Invalid

```text
No docs needed.
```

sem rationale não é declaração válida para change material.

---

# 13.26 Impact matrix

| Mudança | Docs a avaliar |
|---|---|
| Domain Entity/FSM | Blueprint, Spec, ADR, Reference |
| CLI | Reference, how-to, AGENTS bootstrap |
| SQLite schema | Spec, migration reference, Recovery |
| Agent Runtime adapter / selected realization | Spec, sourcing Decision, provenance, compatibility |
| Security policy | ADR, Section 10, Profile, runbook |
| Standard | Standard, Paths, Profile bindings |
| Golden Path | Path, templates, examples |
| API/schema | contract, reference, consumers, migration |
| Environment | Profile, setup, Security |
| External tool version | Research/adoption, notices, doctor |
| Mission scope | Plan Revision |
| Roadmap order/outcome | Roadmap Decision |
| Operator UI | Spec, reference, accessibility |
| Telemetry | ADR, mapping reference, privacy |
| Memory adapter | ADR, spike report, Role policy |

Inicialmente, review guidance.

Checks determinísticos entram progressivamente.

---

# 13.27 Documentation CI

## 13.27.1 Initial

```text
markdownlint
link validation
frontmatter schema
unique IDs
relation target validation
allowed statuses
owner required
ADR numbering/index
supersession consistency
Blueprint aggregate freshness
Documentation Map coverage
Mission contract schema
hierarchical ID validation
generated header validation
docs-impact declaration
no unresolved placeholder in accepted normative docs
```

## 13.27.2 Future

- generated CLI reference;
- schema docs;
- Profile binding validation;
- Standard/Golden Path refs;
- code-change impact rules;
- Artifact refs;
- diagram generation;
- spell/style.

## 13.27.3 Limite

CI prova estrutura.

Não prova toda semântica.

Owner review continua obrigatório.

---

# 13.28 Ownership

## 13.28.1 CODEOWNERS initial

Proteger:

```text
/docs/product/
/docs/adr/
/docs/capabilities/
/docs/standards/
/docs/golden-paths/
/docs/repository-profile/
/.mnfs/
/.github/CODEOWNERS
AGENTS.md
```

## 13.28.2 Single-owner stage

Current owner:

```text
developmentconexus-ops
```

Operator approval remains separate from Git permission.

## 13.28.3 Future

Ownership pode evoluir para:

- platform;
- security;
- capability owners;
- repository owners;
- documentation maintainers.

---

# 13.29 Review levels

## D0 — Editorial

- typo;
- formatting;
- link.

## D1 — Guidance/reference update

- current command;
- how-to;
- example.

Requires owner review.

## D2 — Specification/Standard update

Requires:

- owner;
- affected reviewers;
- impact analysis.

## D3 — Architectural Decision

Requires:

- ADR process;
- alternatives;
- validation;
- approver.

## D4 — Constitutional change

Requires:

- Blueprint B3;
- architecture issue;
- adversarial review;
- Operator approval;
- reconciliation.

## D5 — Contract approval

Requires exact-hash Operator approval through MNFS.

---

# 13.30 Freshness

## 13.30.1 Change-triggered default

Review on:

- API change;
- adapter change;
- Product Milestone close;
- incident;
- Security change;
- Standard change;
- Mission reveals contradiction;
- dependency/provider update.

## 13.30.2 Time-triggered

Use where external reality changes without code:

- tool compatibility;
- provider docs;
- security assumptions;
- runbooks;
- external links;
- support matrix.

## 13.30.3 Research

Create new report.

Do not continuously mutate historical conclusions.

## 13.30.4 States

```text
CURRENT
REVIEW_REQUIRED
STALE
SUPERSEDED
UNKNOWN
```

Stale normative source may block dependent work.

Stale guidance usually creates debt.

---

# 13.31 Documentation debt

Debt sources:

- docs-impact follow-up;
- broken link;
- stale reference;
- missing owner;
- contradiction;
- missing how-to;
- outdated screenshot;
- missing implementation history;
- ungenerated projection.

Represent as:

- Finding;
- GitHub issue;
- gardening task;
- Standard candidate.

Do not leave durable debt only as hidden TODO.

---

# 13.32 Supersession, archive e deletion

## 13.32.1 Supersession

Keep original path when possible.

Add:

- status;
- banner;
- successor link;
- reason.

## 13.32.2 Archive

Tracking may move to:

```text
docs/tracking/archive/
```

## 13.32.3 Delete

Allowed when:

- generated;
- accidental duplicate;
- no historical value;
- secret removal;
- legal/security necessity.

Rejected or superseded architecture normally remains.

---

# 13.33 Versioning

## Product Blueprint

```text
MAJOR
→ constitutional change

MINOR
→ material compatible extension

PATCH
→ clarification/editorial
```

## ADR

ID + immutable history.

## Capability Spec

Version/revision + accepted hash when implementation binds.

## Standards/Golden Paths

Individual version.

## Repository Profile

Git version + schema version.

## Mission Contract

Revision + content hash.

## Generated reference

Implementation SHA + generator version.

---

# 13.34 Change protocol

```text
detect change need
→ identify canonical owner
→ classify D/B level
→ open issue/proposal if material
→ edit source
→ update relations/dependents
→ run docs checks
→ owner review
→ Operator approval if required
→ merge
→ regenerate projections
→ invalidate Context Packs
→ reconcile active Missions
```

Se docs e implementation divergem:

```text
investigate authority
```

Não alterar docs automaticamente para legitimar código acidental.

---

# 13.35 Context Pack integration

Context Pack Compiler usa:

- Documentation Map;
- Authority;
- status;
- relationship;
- target;
- Role;
- version.

Exclui por default:

- superseded;
- rejected;
- historical;
- tracking;
- unrelated research.

Pode incluí-los em:

- Investigation;
- architecture review;
- history analysis.

Não faz crawl indiscriminado de Markdown.

---

# 13.36 Security

- secrets forbidden;
- sensitive incidents in restricted Artifacts;
- external docs are untrusted data;
- documentation build dependencies pinned;
- generated HTML sanitized;
- diagram/plugin code reviewed;
- Security/CODEOWNERS protected;
- Workers cannot alter active policy through docs;
- telemetry content rules also apply.

---

# 13.37 Tooling inicial

Usar:

- Markdown;
- YAML frontmatter;
- TypeScript validator;
- markdownlint;
- link checker;
- aggregate generator;
- GitHub Actions;
- CODEOWNERS.

Não usar agora:

- CMS;
- docs database;
- graph database;
- Backstage;
- Docusaurus;
- MkDocs site;
- search cluster;
- custom RFC portal.

Um site entra quando GitHub discovery deixar de ser suficiente.

---

# 13.38 Documentation Map deliverable

`docs/DOCUMENTATION-MAP.md` será um documento canônico separado contendo:

1. Authority hierarchy;
2. storage boundaries;
3. canonical catalog;
4. current versions/status;
5. owners;
6. read paths;
7. superseded docs;
8. generated projections;
9. change impact;
10. checks;
11. current architecture phase;
12. immediate next action.

O Map é reference/navigation.

Não redefine os documentos que indexa.

---

# 13.39 Architecture Baseline publication sequence

Após aprovação desta Section:

```text
1. Create architecture branch
2. Split Blueprint into 13 modular sources
3. Generate aggregate
4. Create Documentation Map
5. Publish Research Reports
6. Create ADR template/log
7. Create ADR-0004–0012
8. Replace roadmap
9. Create Capability Spec template
10. Create metadata schema/validator
11. Add CODEOWNERS
12. Add docs-impact PR template
13. Add docs CI
14. Update README
15. Update AGENTS
16. Update STATUS
17. Open architecture PR
18. Review/adversarial pass
19. Merge
20. Replan MIS-002
```

Nenhum architecture/reconciliation gate fecha apenas porque o Blueprint foi escrito.

Fecha quando o sistema documental canônico estiver versionado e reconciliado.

---

# 13.40 ADR decorrente

## ADR-0012 — Documentation authority, lifecycle and generated Product Blueprint

Decide:

- Authority classes;
- Git/`.mnfs`/SQLite boundaries;
- modular Blueprint;
- generated aggregate;
- ADR immutability;
- Capability Spec process;
- Documentation Map;
- docs-impact;
- ownership;
- CI;
- change protocol.

---

# 13.41 Non-goals

Não construir agora:

- enterprise knowledge platform;
- central documentation service;
- docs database;
- semantic search;
- RAG over all docs;
- Backstage instance;
- public documentation site;
- custom RFC application;
- automated semantic truth checker;
- universal ontology;
- calendar review for every file;
- policy that blocks all changes with documentation warning;
- duplicate content for every audience;
- AGENTS.md monolith;
- deletion of rejected history;
- editing generated aggregate manually.

---

# 13.42 Invariantes documentais

1. Git owns canonical product documentation.
2. SQLite owns operational state.
3. `.mnfs` owns repository machine artifacts.
4. Issue is tracking, not final authority.
5. PR is change vehicle, not authority.
6. Conversation is not canonical.
7. Research is not decision.
8. Tracking is not doctrine.
9. Generated projection owns nothing independently.
10. One concept has one canonical owner.
11. Other docs link instead of redefining.
12. Authority and Diátaxis form are separate.
13. Accepted ADR semantic outcome is immutable.
14. ADR changes through supersession.
15. Approved Mission revision is immutable.
16. Mission changes through Replan.
17. Rejected/superseded history remains discoverable.
18. Blueprint is modular at source.
19. Aggregate Blueprint is generated.
20. README remains concise.
21. AGENTS.md remains concise.
22. Documentation Map is the discovery index.
23. Canonical docs have metadata.
24. Accepted normative docs have owner.
25. Relations resolve.
26. Status is class-constrained.
27. Capability Specs use goals/non-goals/proof.
28. Standards and Golden Paths are independently versioned.
29. Research promotion is explicit.
30. Every material change declares docs impact.
31. Follow-up debt is tracked.
32. CI validates structure and projections.
33. Owner review validates meaning.
34. Stale normative docs may block work.
35. Context Packs exclude superseded content by default.
36. Workers do not read the full Blueprint by default.
37. Security policy cannot be mutated through docs by active Worker.
38. Major Blueprint change requires Operator approval.
39. Documentation change can invalidate Context Packs.
40. Documentation is maintained as part of product delivery.

---

# Decisão resumida da Seção 13

> **O MNFS trata documentação como parte do control plane. Git guarda doutrina, Decisions, Specifications, Standards e Guidance; `.mnfs` guarda identity e machine-readable contracts/evidence; SQLite guarda estado operacional. Cada conceito possui owner, Authority e lifecycle. Accepted ADRs/Mission Contracts mudam por supersession/Replan, não por reinterpretação silenciosa. O Product Blueprint possui 13 fontes modulares e aggregate gerado; Research permanece Evidence não normativa; Issues/PRs são veículos de trabalho. A current ARR/P1 reconciliation só pode fechar quando uma Fresh Actor lê as fontes correntes sem encontrar duas arquiteturas concorrentes, todas as projections estão regeneradas e os gates apontam para uma única next action.**
