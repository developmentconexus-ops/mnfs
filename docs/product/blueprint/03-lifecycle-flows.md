---
id: DOC-PRODUCT-BLUEPRINT-03
title: Lifecycle e Fluxos Ponta a Ponta
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
  - product blueprint section 3
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-07
tracking_issue: 6
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
- nenhum worktree de implementação;
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

A realization concreta pode ser worktree, COW filesystem, rootfs/disk privado, microVM workspace ou outra opção selecionada por Decision. Nenhuma delas é semântica obrigatória do WriteTrack.

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
mesmo worktree
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

Worktrees de origem não são destruídos até:

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
| Lease ACTIVE | worktree existe | healthy |
| Lease ACTIVE | worktree ausente | divergence |
| sem Lease | worktree MNFS órfão | divergence |
| Worker RUNNING | processo existe | healthy |
| Worker RUNNING | processo ausente | LOST |
| Claim OPEN | worker morto | recoverable |
| Claim COMPLETED | gate ausente | awaiting verification |
| Track ACCEPTED | integração ausente | awaiting integration |
| Track RELEASED | worktree existe | cleanup divergence |

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
