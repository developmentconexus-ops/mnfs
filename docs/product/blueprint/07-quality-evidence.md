---
id: DOC-PRODUCT-BLUEPRINT-07
title: Qualidade, Evidência, Gates e Prevenção de False Completion
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
  - product blueprint section 7
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-02
tracking_issue: 6
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

Testes locais passam no worktree, mas:

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

Worktree isolation não resolve esses recursos automaticamente.

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
Pi worker completes
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
17. Worktree green não prova integration.
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
