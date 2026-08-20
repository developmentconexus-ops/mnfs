# 3D-03 — Application / Use-case Orchestration

**Status:** APROVADO pelo operador em 2026-08-15  
**Fase:** 3D — Dependency Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3D, não autoriza implementação, merge, PR readiness ou 3E.

## Decisão em uma frase

O Conexus F1 usa **Application / Use-case Orchestration somente para fluxos de Control Plane cuja coordenação cross-module é material**; runtime surfaces nunca sobem para essa camada, módulos nunca a invocam, invariantes de domínio permanecem nos owners, e a lista F1 fecha em **sete use cases nomeados**, enquanto chamadas que já cabem no DAG seguem direct-call-first.

---

## 1. Contexto e reconciliação

3D-01 aprovou:

```text
direct-call-first
+
application orchestration somente quando ciclo/ordem/atomicidade cross-owner justificar
```

3D-02 fechou o hot path do Capability Gateway e tornou explícitas as surfaces:

```text
PUBLISHED_APP
AGENT_RUN
BUILDER/CANDIDATE
CONNECTION_QUALIFICATION
ANALYTIC_QUERY
```

A revisão adversarial `3D-FABLE-R2-application-orchestration-review.md` removeu dois use cases superproduzidos por R0:

```text
BuilderDiscoveryUseCase
SubmitKnowledgeProposalUseCase
```

O adendo `3D-FABLE-R2-1-analytic-query-orchestration-correction.md` encontrou uma contradição restante: um `AnalyticQueryUseCase` L7 compartilhado seria inalcançável por `PAR` e `Managed Application Runtime` sem fazer módulos subirem para a application layer.

A correção aprovada é a menor forma estrutural:

```text
PAR → Brain + Gateway
MAR → Brain + Gateway
```

com uma nova aresta estreita:

```text
Managed Application Runtime → Brain
```

somente para a capability necessária de compilação de `AnalyticQuery` e leituras/projeções Brain explicitamente aprovadas depois.

Nenhuma nova DIP, mediator, loopback HTTP ou módulo de orchestration nasce.

---

## 2. Application Orchestration é Control Plane, não Runtime

A distinção normativa de 3D-03 é:

```text
CONTROL PLANE FLOW
→ nasce em HTTP/UI/command/operator job boundary acima dos módulos
→ PODE usar named use case quando a coordenação justificar

RUNTIME SURFACE FLOW
→ nasce dentro de MAR / PAR / Builder runtime / managed job execution
→ usa somente arestas diretas descendentes aprovadas
→ NUNCA sobe para Application / Use-case Orchestration
```

Consequências:

- módulo não importa nem invoca L7;
- callback `module → use case` é proibido;
- runtime não usa loopback HTTP para alcançar orchestration interna;
- runtime não usa service locator/registry para despachar use cases;
- uma função L7 não pode ser usada como atalho para ocultar uma aresta de runtime que deveria ser explícita no DAG.

Regra prática:

> **Se o stack frame que inicia a operação já está dentro de um módulo/runtime boundary, a solução default é uma dependência descendente direta — não um use case L7.**

---

## 3. Procedimento para admitir um novo use case

A regra A–D de 3D-01 permanece autoridade. 3D-03 a transforma em procedimento verificável.

### Passo 1 — teste da aresta

```text
A operação cabe apenas em arestas diretas já aprovadas?
SIM → direct module call. FIM.
```

O fato de uma operação mencionar dois módulos não cria orchestration por si só.

### Passo 2 — teste do fato

```text
O acoplamento restante pode ser resolvido por ref imutável,
contexto estreito ou public projection já aprovada?
SIM → direct call + ref/context/projection. FIM.
```

### Passo 3 — named use case

Só então o fluxo pode entrar na lista de orchestration, declarando:

```text
qual condição A|B|C|D justifica
quais owners participam
qual ordem/atomicidade cross-owner é necessária
onde cada invariante continua sendo enforçada
```

Nova entrada não nasce “por consistência arquitetural”.

---

## 4. Regra de verdade versus coordenação

A formulação final do deletion test é:

> **Apagar o use case pode perder o fluxo; nunca pode perder a verdade.**

### 4.1 Invariantes de domínio

Toda invariante de domínio permanece fail-closed no owner.

Exemplos:

```text
Brain
→ rejeita semântica/binding incompatível no gate apropriado

Connections
→ owns qualification/eligibility meaning

Gateway
→ rejeita execução física não-admissível

Release
→ FSM/gates recusam transição inválida

I&A
→ recusa authority/grant inválido
```

Um use case não é o único lugar onde “a regra correta” existe.

### 4.2 Correctness de coordenação

É legítimo o use case possuir correctness do **encadeamento cross-owner**, por exemplo:

```text
CreateProject
→ atomicidade entre criação do Project e grant inicial

PromoteRelease
→ ordem de gates/transições sobre FSM owned pelo Release
```

Isso não move as invariantes dos owners para L7.

---

## 5. Lista fechada F1 — sete use cases

Os nomes abaixo são semânticos. DTOs/signatures finais pertencem a 3F.

### 5.1 `CreateProject`

**Justificativa:** condição B — escrita multi-owner com atomicidade material.

Participação conceitual:

```text
Workspace
→ valida scope/lifecycle necessário via public API/projection

Project
→ cria Project-owned state

Identity & Access
→ cria grant/membership relationship inicial aplicável
```

A única transaction cross-owner conhecida no baseline F1 pode ocorrer aqui quando necessária para evitar:

```text
Project criado sem grant necessário
ou
grant apontando para Project não criado
```

Mesmo na mesma transaction:

```text
Project executa apenas suas operações
I&A executa apenas suas operações
```

O use case nunca escreve table interna de ambos diretamente.

---

### 5.2 `SetProjectBinding`

**Justificativa:** condição C/D — Project owns binding intent; Brain/Connections julgam semântica/eligibilidade conforme o tipo de binding.

Fluxo conceitual:

```text
specialized owner
→ valida/explica compatibilidade aplicável

Project
→ registra o consumer-specific binding intent
```

Precisão importante:

> **Validação no set-time é fail-early/UX; não é a única invariante que torna um binding correto para servir.**

Compile/conformance/Release gates continuam authority de correção antes de serving.

Uma mudança de intent no Project não altera uma Release já ativa.

---

### 5.3 `QualifyConnection`

**Justificativa:** condições A + C — `Connections → Gateway` seria reverse edge; o resultado físico precisa voltar ao owner sem transformar Connections em executor de I/O.

Fluxo:

```text
Connections
→ exact ConnectionRevision / ConnectorDefinition refs

Gateway
→ controlled non-mutating physical probe

Connections
→ interpreta/registra qualification state
```

Regra transacional:

```text
read owner state
COMMIT/CLOSE TX
→ external I/O
→ new TX para owner registrar resultado
```

Nenhuma transaction permanece aberta durante a probe externa.

---

### 5.4 `InceptionInvestigation`

**Justificativa:** condição A/D — Project owns Inception authority; Builder fornece engineering execution capability.

Fluxo:

```text
Project
→ confirma authority/fase/contexto da Inception

Application orchestration
→ solicita investigação bounded

Builder
→ executa tactics de engenharia/research/data discovery

Project
→ recebe material para Baseline candidate/review
```

Não nasce:

```text
InceptionModule
InceptionRun obrigatório
Mission/Milestone workflow
```

A forma operacional detalhada permanece para 3E/3G/3H.

---

### 5.5 `BrainHealthProbe`

**Justificativa:** condição A/C — Brain owns meaning da prova; Gateway owns physical controlled read.

Fluxo de Control Plane/job:

```text
Brain
→ assertion/probe specification + refs

Gateway
→ physical controlled execution

Brain
→ interpreta PASS/FAIL/CHECK_ERROR e atualiza health/conformance state
```

Runtime surfaces **não disparam esse use case** durante uma resposta comum.

Quando runtime precisar health atual:

```text
PAR/MAR → Brain health projection
```

Uma decisão futura em 3G pode exigir recheck em determinadas classes, mas continua proibido fazer runtime subir para L7.

---

### 5.6 `ComposeRelease`

**Justificativa:** condição A — elimina `Release → Builder` e o ciclo composto fechado por 3D-01.

Fluxo:

```text
L7 closure boundary ou L7 job
→ lê ChangeAcceptance/candidate/evidence refs do Builder
→ solicita Release.compose(... pinned refs ...)
```

Builder não conhece Release nem invoca application layer após fechar Change.

“Compose automaticamente após Change accepted” significa:

```text
boundary que dirigiu o closure
→ após retorno accepted, pode coordenar composition
```

ou:

```text
L7 job
→ encontra Changes aceitos ainda não compostos
→ coordena composition
```

Não significa callback ascendente do Builder.

---

### 5.7 `PromoteRelease`

**Justificativa:** condições B + C/D — coordena múltiplos owners/infra em uma operação material.

Pode ordenar semanticamente:

```text
Release promotion intent/state
→ Registry exact revisions
→ Connections eligibility
→ Brain/binding conformance
→ DB/migration infrastructure
→ serving verification infrastructure
→ Release pointer CAS / served verification transitions
```

Regras:

- a FSM durável de Promotion pertence ao Release;
- o use case dirige passos, não owns estado do workflow;
- crash/recovery lê estado do Release, não L7;
- cada passo pode ter sua própria transaction;
- nenhuma transaction global permanece aberta através de migration/network/serving I/O;
- CAS do active Release pointer permanece authority do Release.

---

## 6. Lista negativa — chamadas que NÃO viram use case

F1 mantém direct calls para, entre outros:

```text
MAR → Gateway para query/action/integration
PAR → Gateway para tool execution
Builder → Gateway para discovery/read
Builder/PAR → Brain para KnowledgeProposal
single-owner CRUD
Attachments upload/download
Agent Conversation operations
artifact resolve → Registry
Observability emit/query
MAR/PAR → Release projections já aprovadas
Brain/Builder publish/compile flows quando a direção já é descendente
```

### AnalyticQuery é explicitamente direct runtime sequencing

`AnalyticQueryUseCase` compartilhado está **REJEITADO**.

`AGENT_RUN`:

```text
PAR
→ Brain.compileAnalyticQuery(request, run-pinned binding/composition ref)
→ RestrictedSemanticPlan
→ Gateway.executeAnalyticRead(plan, AgentExecutionContext)
```

`PUBLISHED_APP`:

```text
MAR
→ Brain.compileAnalyticQuery(request, active-Release-pinned binding ref)
→ RestrictedSemanticPlan
→ Gateway.executeAnalyticRead(plan, ServingContext)
```

Regra de authority:

```text
Brain owns semantic compilation
Gateway owns physical read enforcement/execution
caller owns sequencing for its runtime surface
```

Gateway deve aceitar somente um plano semanticamente compilado/qualificado conforme contrato de 3F; browser/LLM nunca escolhe SQL físico ou transforma input cru em privileged plan.

---

## 7. Nova aresta estreita aprovada — `Managed Application Runtime → Brain`

3D-03 adiciona ao DAG:

```text
Managed Application Runtime → Brain
```

A intenção atual é estreita:

```text
compile AnalyticQuery against the binding/composition pin supplied by MAR
+
read Brain projections que futuras decisões explicitamente aprovarem para runtime
```

Não autoriza MAR a possuir ou manipular:

```text
BrainDefinition authoring
KnowledgeProposal lifecycle
publication
Brain health authority
binding intent
Brain compiler internals
```

A aresta permanece descendente `L6 → L2`, portanto não cria cycle.

---

## 8. Direção de invocação

Regra normativa:

```text
L7 boundary → named use case → modules
```

Nunca:

```text
module → application layer
runtime → application layer
```

Encadeamento pós-operação permanece na boundary que iniciou o fluxo ou em job L7 explicitamente autorizado.

Isso fecha o gap onde uma frase como:

```text
Change accepted → compose automatically
```

poderia ser implementada como callback ascendente proibido.

---

## 9. Use case não aninha use case por default

F1 não permite que named use cases formem um grafo interno de workflows.

Default:

```text
UseCase A -X-> UseCase B
```

Se a boundary precisa executar dois fluxos:

```text
boundary
→ use case A
→ observa resultado
→ use case B quando aplicável
```

Uma exceção futura exige uma failure class/consumer real e Decision explícita.

Não criar:

```text
UseCaseBase
UseCaseBus
UseCaseRegistry
workflow graph de use cases
command mediator
```

---

## 10. Transaction rule da orchestration

3D-01 já permite atomicidade cross-module no mesmo PostgreSQL. 3D-03 restringe o uso:

```text
shared transaction
→ somente quando uma invariante atômica cross-owner real exigir
→ hoje: CreateProject é o único caso F1 conhecido
```

Além disso:

> **Nenhuma transaction da application orchestration pode permanecer aberta atravessando I/O externo.**

Exemplos:

```text
Connection probe
provider/API call
serving verification GET
migration execution externa ao transaction scope aplicável
```

devem ocorrer fora de uma transaction longa cross-owner.

A realização de transaction context pertence a 3E.

---

## 11. Application Layer não vira artefato/framework obrigatório

3D-03 congela uma **regra de dependência e coordenação**, não um framework físico.

Uma realização suficiente pode ser simplesmente:

```text
named functions/services
em pasta application/
com dependencies explícitas
sem base class
sem registry
sem dynamic dispatch
```

Não é obrigatório existir pacote/deployable chamado `ApplicationLayer`.

Nenhum estado durável pertence a essa camada.

---

## 12. Consequências para o DAG

A macro topologia de 3D-01 permanece, com uma nova aresta explícita:

```text
MAR → Brain
```

E uma nova regra transversal:

```text
L7 → lower modules permitido para named control-plane orchestration
lower module/runtime → L7 proibido
```

R2/R2.1 não encontram motivo para reabrir 3C, 3D-01 ou 3D-02.

---

## 13. O que 3D-03 NÃO decide

```text
DTOs/signatures finais dos sete use cases               → 3F
physical transaction context/schema boundaries          → 3E
Inception/Promotion/health FSMs                         → 3G
runtime job/scheduler realization                       → 3H
security/authority refinements                          → 3I
UI/checkpoints                                          → 3K
recovery multi-step                                     → 3M
```

Também não cria novas entities apenas porque um use case existe.

---

## 14. Invariantes de fechamento de 3D-03

```text
Application orchestration = exception, not default
Application orchestration = control-plane-only
module/runtime never invokes L7
use case does not own domain truth
cross-owner ordering/atomicity may belong to use case
no nested use-case graph by default
no transaction across external I/O
seven named F1 use cases only
AnalyticQuery is direct runtime sequencing
MAR → Brain is the only new module edge approved by 3D-03
```

Qualquer nova orchestration entra pelo Decision Loop, não por convenção estética.
