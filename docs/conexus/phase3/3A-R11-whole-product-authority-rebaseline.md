# 3A-R11 — Whole-Product Authority Rebaseline

**Status:** PROPOSED / OPERATOR-APPROVED IN CONCEPT / WRITTEN SPEC PENDING OPERATOR REVIEW  
**Fase:** 3A — Architecture Reconciliation contínua até C-018  
**Natureza:** whole-product authority compilation / reconciliation checkpoint  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este checkpoint não constitui C-018, não encerra a Fase 3, não autoriza implementação de produto, não autoriza merge do PR #40 e não reabre decisões ratificadas sem Finding material.

---

## 1. Motivo

O Conexus já possui um corpus extenso de decisões materiais entre C-000..C-017 e 3A..3L. Esse corpus foi produzido de forma incremental e corretamente preserva a história do raciocínio, mas várias decisões posteriores refinam, substituem ou restringem mecanismos anteriores.

Exemplos conhecidos incluem:

```text
C-002 Pi como Builder runtime primário
→ 3A-R5 + 3H-01 + 3L-A: Builder atual = Mastra AgentController / Workspace / E2B

C-008 guest-readable LLM capability
→ 3I-02: model-provider credential control-side; guest provider key removida

C-010 AI SDK/light loop para Product Agent
→ 3H-02: Product Agent atual = exact RuntimeAgentProjection → direct Mastra Agent

C-002 pg-boss como Hub queue selecionada
→ 3A-R9: scheduler/queue são mechanics; managed-job semantics permanecem owner-side e tecnologia só fecha em Package D
```

A existência simultânea de história válida e target atual distribuído cria uma failure class de **authority archaeology**:

```text
muitas decisões corretas em sua época
+
supersessões parciais e completas
+
Fresh Actor precisa reconstruir precedence manualmente
→ leitura localmente plausível de mecanismo histórico
→ implementação/review usa decisão antiga como target atual
OR
→ cada actor recompila a plataforma de forma diferente
→ decisões técnicas futuras partem de arquiteturas implicitamente diferentes
```

O checkpoint existe para remover essa classe de erro antes de avançar a parte restante da Technology Qualification e antes de qualquer future Realization Planning.

---

## 2. Decisão em uma frase

Antes de abrir Package B, o Conexus pausa a progressão de 3L e compila todo o corpus aprovado em uma **pequena árvore canônica current-state**, sem apagar a história: um current entrypoint, um Product Contract, uma Architecture Baseline e um Decision Reconciliation Registry passam a permitir que qualquer Fresh Actor descubra em minutos **o que o produto é, como a arquitetura está definida hoje, qual geração de cada decisão é current, o que foi superseded, o que permanece future/deferred, o que já foi tecnologicamente provado e o que continua assumption/qualification pending**; a compilação passa por whole-product coherence + review independente do Fable + adjudicação + ratificação final do operador antes de Package B ser rederivado.

---

## 3. Outcome pretendido

Ao fechar R11, deve ser verdadeiro:

```text
one current Conexus entrypoint                     = YES
one readable current Product Contract              = YES
one readable current Architecture Baseline         = YES
one decision-generation reconciliation registry    = YES
historical decision corpus preserved               = YES
old mechanism silently active by inheritance       = NO
CURRENT vs QUALIFIED vs SELECTED vs DEFERRED        = unambiguous
Package B derived from reconciled authority         = YES
product implementation                              = STILL BLOCKED
C-018                                               = NOT YET RATIFIED
```

R11 não transforma um documento resumido em nova arquitetura independente. Os artefatos current são **compilações/routing authorities** cujas afirmações devem ser deriváveis de authority já aceita ou de uma correção explicitamente adjudicada durante o próprio checkpoint.

---

## 4. Target invariant

> **Um Fresh Actor deve conseguir reconstruir a plataforma Conexus atual — produto, boundaries, authorities, principais invariantes, current realizations, qualification status, deferred seams e exact next action — a partir de uma árvore canônica curta, sem interpretar conversa, Git history, dialogue/review files ou mecanismos superseded como target authority.**

Corolários:

1. história permanece preservada;
2. história não permanece no active discovery path apenas por antiguidade;
3. resumo nunca pode enfraquecer semantic authority detalhada;
4. ausência de um item em um current projection nunca significa permissão para contradizer authority detalhada;
5. Unknown/Deferred continuam Unknown/Deferred;
6. CURRENT architectural selection não pode ser rotulada QUALIFIED sem deciding Evidence;
7. technological Evidence não pode virar business/product authority;
8. future capability preserva seam/trigger quando evidenciado, mas não ganha dormant machinery.

---

## 5. Escopo do census

R11 deve revisar deliberadamente, no mínimo:

```text
C-000..C-017
3A-R1..3A-R11 aplicáveis
3B accepted set
3C-01..3C-15 + 3C-R1
3D-01..3D-04 + 3D-R1
3E-01..3E-02 + 3E-R1
3F-01..3F-06 + 3F-R1
3G-01..3G-08 + 3G-R1
3H-01..3H-03 + 3H-R1
3I-01..3I-05 + 3I-R1
3J-01..3J-03 + 3J-R1
3K-01..3K-04 + 3K-R1
3L-Q0
3L Package A + deciding Evidence
current router/status docs
```

Dialogue, Fable review, research, spike source, CI and code são consultados como Evidence/provenance quando necessário, nunca elevados automaticamente a target authority.

---

## 6. Árvore canônica alvo

R11 produzirá quatro artefatos current-state sob:

```text
docs/conexus/current/
```

### 6.1 `README.md` — Current entrypoint / router

É o ponto de entrada humano e de Fresh Actor para o Conexus atual.

Deve responder rapidamente:

```text
what is Conexus?
what stage are we in?
what is current and accepted?
what is still qualification-pending?
what is blocked?
what should be read next?
what is the exact next action?
```

Ele não replica a arquitetura inteira.

### 6.2 `PRODUCT-CONTRACT.md` — current product authority projection

Consolida **o que a plataforma é e deve fazer**, sem narrar cronologia.

Deve conter proporcionalmente:

```text
North Star
product/system boundary
primary users/personas
product concepts / semantic objects
major capabilities
whole-product journeys
F1 / current launch scope
NEXT / admitted capabilities
FUTURE / deferred capabilities
explicit non-product / rejected generalizations
product invariants
whole-product scenario gate
success criterion
reopen triggers
```

Este documento deve ser suficientemente detalhado para impedir perda de product meaning, mas não deve escolher SQL, classes, package layout ou outra realization que pertence à Architecture Baseline/Realization Planning.

### 6.3 `ARCHITECTURE-BASELINE.md` — current architecture projection

Consolida a arquitetura atual sem recontar decisões antigas.

Para cada surface material deve registrar, quando aplicável:

```text
semantic authority / owner
responsibility
boundary / what it does not own
persistence authority
current realization
important invariants
security/trust boundary
enforcement/proof obligations
technology state
qualification state
reopen trigger
```

Inclui ao menos:

```text
Hub / modular monolith
Workspace / Project / Project Baseline
Builder / Change / CodingSession / ActorRun
Artifact Registry / Release
Connections / connector model
Capability Gateway
Brain
Product Agent Runtime / Conversation / AgentRun / ApprovalRequest / Trigger
Managed Application Runtime / job
runtime-role isolation
security / credentials / spend / trust zones
PostgreSQL/data boundaries
first production topology
frontend/product shell
observability/F5 distinction
backup/restore/availability boundaries
```

Technology status deve usar linguagem não ambígua, por exemplo:

```text
ARCHITECTURE CURRENT
SELECTED / NOT YET QUALIFIED
QUALIFIED
QUALIFIED WITH REQUIRED GUARD
EVALUATED / KEEP OFF
CANDIDATE
DEFERRED
REJECTED F1
```

### 6.4 `DECISION-RECONCILIATION.md` — decision-generation disposition authority

Responde:

> Qual geração desta decisão é current, onde mora a semântica detalhada, o que sobrevive, o que não pode ressuscitar e quando pode reabrir?

Cada decisão/família material deve receber uma disposition explícita.

Vocabulário baseline:

```text
CURRENT
  Current meaning já está diretamente ratificado e continua válido.

PRESERVE
  Decisão anterior permanece coerente e não foi materialmente alterada.

REFINED
  Invariante/meaning essencial sobrevive, mas mecanismo/wording anterior foi corrigido.

PARTIALLY_SUPERSEDED
  Parte identificada sobrevive e parte identificada não pode ser herdada.

SUPERSEDED
  Current authority contradiz/substitui a decisão anterior para target realization.

DEFERRED
  Capability/decision permanece futura com trigger/owner conhecido; não cria dormant F1 machinery.

REJECTED_F1
  Deliberadamente fora do F1 atual; existência histórica não é reopen trigger.

REOPEN
  Current evidence realmente falsificou ou tornou incompleta a decisão; volta ao menor Decision Loop implicado.
```

Não usar `REOPEN` simplesmente porque há uma ideia melhor, framework novo ou preferência do reviewer.

---

## 7. Product scope tiers

O Product Contract deve preservar futuro sem implementá-lo agora.

Categorias:

```text
F1 / CURRENT
  necessário para a primeira plataforma útil e explicitamente aceito.

NEXT / ADMITTED
  objetivo/consumer real conhecido, mas não bloqueia o primeiro uso ou pertence a gate posterior.

FUTURE / DEFERRED
  evolução evidenciada ou seam importante; nenhuma dormant implementation.

REJECTED / SUPERSEDED
  não deve voltar por inheritance; exige novo material reopen.
```

Regra:

> **Prepare the seam, not the entire future capability.**

Um Future item pode preservar semantic placeholder, boundary ou reopen trigger quando necessário. Não ganha tabela, service, module, generic interface, workflow, scheduler ou config apenas por provável utilidade futura.

---

## 8. Historical corpus policy

R11 **não apaga o passado**.

C-000..C-017, 3A..3K, reviews e Evidence continuam disponíveis para:

```text
rationale
provenance
reopen analysis
why a current invariant exists
adversarial review
implementation assumption investigation
```

Mas o active discovery path deixa de exigir leitura cronológica para descobrir o presente.

Após fechamento do R11:

```text
current/ tree
→ discover present target

detailed accepted authority
→ obtain exact semantic depth

historical/superseded authority
→ provenance/reopen evidence only for the superseded portion
```

Um documento antigo pode continuar parcialmente authoritative para invariantes não superseded; o Reconciliation Registry deve deixar essa divisão explícita.

---

## 9. Authority precedence após fechamento

Target read path pretendido:

```text
AGENTS.md
→ DevelopmentConexus Engineering Method
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/current/README.md
→ current Product Contract / Architecture Baseline / Decision Reconciliation conforme a questão
→ docs/conexus/phase3/LEDGER.md para phase/status detail quando ainda em Fase 3
→ exact detailed accepted semantic authority
→ deciding Evidence/current implementation somente quando material
```

`docs/conexus/DECISOES.md` permanece histórico/provenance index ou recebe papel explicitamente reduzido; não deve continuar obrigando Fresh Actor a recompilar target atual a partir de decisões superseded.

O exact rewiring de `AGENTS.md`, `DOCUMENTATION-MAP.md`, `DECISOES.md` e `LEDGER.md` ocorre somente depois que os current artifacts forem coerentes e aprovados.

---

## 10. Package B pause

R11 é inserido **antes** de Package B porque Package B materializa Product Agent + cross-runtime assumptions e seria particularmente sensível a leitura divergente de authority histórica.

Durante o checkpoint, a intenção de routing é:

```text
3L Package A = COMPLETE

3A-R11 — Whole-Product Authority Rebaseline
= ACTIVE após ratificação deste written spec

3L Package B
= PAUSED / NOT OPENED
```

Package B não é rejeitado nem replanejado por preference. Após fechamento de R11, ele deve ser **rederivado da current canonical baseline**, preservando os identifiers/obligations ainda válidos de 3A-R10.

Nenhum spike de Package B deve ser implementado enquanto R11 estiver ativo.

---

## 11. Execution strategy do R11

### R11-A — Authority census

Construir inventário rastreável de decisão/material meaning:

```text
source authority
material claim / invariant
current generation
candidate disposition
canonical semantic home
dependencies / affected surfaces
qualification state where relevant
```

A census é working material; não precisa virar nova permanent framework.

### R11-B — Decision reconciliation

Adjudicar cada supersession/refinement deliberadamente.

Regra:

```text
later exact approved decision intentionally supersedes mechanism
→ later decision wins for that mechanism

older invariant not superseded
→ preserve

implementation/review merely differs
→ evidence, not automatic supersession

material contradiction between accepted authorities
→ STOP and reopen smallest implicated Decision Loop
```

### R11-C — Product Contract

Derivar o produto atual sem mechanism archaeology.

### R11-D — Architecture Baseline

Derivar target architecture + realization/qualification states atuais.

### R11-E — Whole-product scenario/coherence pass

Confrontar Product Contract, Architecture Baseline e Registry contra whole-product journeys e key cross-cutting invariants.

Pesquisar especificamente:

```text
duplicate authority
missing authority
circular ownership
current doc contradicted by reconciliation
superseded mechanism still appearing as current
future capability accidentally implemented in architecture
current capability accidentally deleted as YAGNI
technology marked stronger than its evidence
wrong owner for retry/schedule/memory/telemetry semantics
cross-phase assumption mismatch
```

### R11-F — Fresh self-review

Revisão independente de contexto anterior dentro do possível, usando os artifacts como um Fresh Actor faria.

Success test:

> A leitura do current tree leva à mesma plataforma sem recorrer à conversa ou à memória do autor.

### R11-G — Independent Fable whole-product review

Após self-review, gerar um review request bounded ao R11 para o Fable.

O Fable deve atacar, no mínimo:

```text
material omissions
false supersession
accidental preservation of stale mechanics
duplicate/missing authority
product-contract vs architecture mismatch
future seam accidentally removed
YAGNI violation / dormant future machinery
qualification status overstated
Package B prerequisites incorrectly compiled
```

Fable finding é Evidence, não requirement authority.

Cada finding deve ser adjudicado:

```text
defect against current accepted authority
→ correct

material evidence falsifies current authority
→ reopen smallest implicated Decision Loop

new preference/new requirement
→ do not smuggle into baseline; Decision Loop/operator if pursued

non-material editorial issue
→ bounded correction
```

### R11-H — Operator ratification

Após Fable + adjudicação, operador recebe:

```text
current tree
material disposition changes
any reopened decision
remaining Unknown/Deferred
qualification-state matrix
whole-product coherence verdict
exact next action
```

Só aprovação explícita fecha R11.

---

## 12. Proof strategy

R11 não é provado porque quatro arquivos existem.

Provas mínimas:

### Completeness

Todo accepted material source no census possui:

```text
current home
or explicit historical-only/superseded/deferred disposition
```

Não pode existir accepted material decision “solta” sem routing.

### Non-contradiction

Counterexample search deve tentar encontrar:

```text
current docs dizem A
accepted detailed semantic authority exige !A
```

Qualquer caso material bloqueia fechamento.

### Supersession safety

Para cada known major supersession, Fresh Actor deve chegar ao mecanismo atual e ser explicitamente avisado do mecanismo antigo que não pode ressuscitar.

### Qualification honesty

Cada technology statement deve ter provenance para:

```text
selected
qualified
qualified-with-guard
not-proven
deferred/rejected
```

MISSING Evidence nunca vira PASS.

### Scenario coherence

Whole-product journeys não podem exigir dois owners para o mesmo meaning nem depender de capability que o próprio scope marcou Future/Deferred.

### Fresh-actor test

Um reviewer deve conseguir responder apenas com current tree + linked detailed authority:

```text
what is Conexus?
what is F1?
what is future?
who owns each major meaning?
how Builder works today?
how Product Agent is intended to work today?
what technology is already qualified?
what is still pending?
why is Package B next after R11?
what is forbidden before C-018?
```

---

## 13. No-build / YAGNI

R11 não cria:

```text
product module
runtime service
database/table
workflow engine
new scheduler
new generic registry framework
new capability merely for documentation
compatibility layer
migration engine
Product implementation
```

Também não exige mover todos os docs antigos para `archive/`; routing/disposition suficiente é preferido a file churn sem ganho de autoridade.

---

## 14. Material Finding policy

R11 é reconciliation, não uma licença para redesign total.

Resultados possíveis por finding:

```text
NO CHANGE REQUIRED
CURRENT STRUCTURE CONFIRMED
BOUNDED CURRENT-DOC CORRECTION
DEFER SAFELY
REOPEN SMALLEST DECISION
STOP / SPLIT PREREQUISITE
```

Reabrir somente com evidence material:

```text
accepted authorities realmente contraditórias
current target depende de assumption já falsificada
named product requirement perdido
ownership duplicada ou ausente
security/recovery invariant sem owner
technology qualification invalidou structural assumption
```

Não reabrir por:

```text
naming preference
framework novelty
reviewer taste
future hypothetical optionality
current code shape alone
```

---

## 15. Exit criteria

R11 só pode fechar quando:

```text
[ ] full authority census completed
[ ] Product Contract written
[ ] Architecture Baseline written
[ ] Decision Reconciliation written
[ ] current README/router written
[ ] every material accepted decision routed/dispositioned
[ ] major known supersessions explicitly protected against resurrection
[ ] Unknown/Deferred preserved honestly
[ ] qualification-state matrix reconciled with deciding Evidence
[ ] whole-product scenario/coherence pass complete
[ ] fresh self-review complete
[ ] independent Fable review complete
[ ] every Fable material finding adjudicated
[ ] no unresolved material contradiction remains
[ ] AGENTS/DOCUMENTATION-MAP/DECISOES/LEDGER rewired coherently
[ ] implementation remains blocked
[ ] operator explicitly ratifies final current baseline
```

Após fechamento:

```text
R11 CLOSED / ACCEPTED
→ Package B becomes NEXT again
→ Package B admission is rederived from current tree
```

---

## 16. Reopen triggers após fechamento

R11/current baseline deve ser atualizado ou reaberto proporcionalmente quando:

```text
new accepted material decision supersedes current meaning
new phase closure changes current realization
Technology Qualification changes selected/qualified status materially
material product requirement is added/removed
authority/ownership changes
C-018 ratification changes routing
post-C-018 Realization Planning binds exact current realization details worth surfacing
fresh review demonstrates current tree cannot reconstruct target correctly
```

Ordinary implementation commits, CI noise, refactors e non-material wording não exigem whole-product rebaseline novo.

---

## 17. Current gate

Este written spec implementa apenas o design do checkpoint aprovado em conceito pelo operador.

Antes de iniciar o census ou rewire dos current authority paths:

> **o operador revisa e aprova explicitamente este arquivo escrito.**

Até lá:

```text
Package A = COMPLETE
Package B = repository-router NEXT, operationally held for R11 spec review
R11 = written candidate, not yet active router authority
product implementation = BLOCKED
```
