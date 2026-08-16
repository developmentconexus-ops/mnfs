# 3G-02 — Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3G — Behavioral / State Architecture  
**Authority:** segunda decisão aprovada de 3G  
**Importante:** esta decisão não constitui C-018, não encerra 3G nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, `Change` não possui uma mega-FSM nem um `ChangeState` autoritativo exclusivo: Builder preserva fatos duráveis owner-local e decide checkpoint, dispatch e closure por predicados independentes; `Finding` é o gap durável decision-relevant com resolução mínima e rota autoritativa separada por autonomia decrescente; Evidence continua válida somente contra o exact pinned execution context que prova; terminal closure é write-once e serializada por Change; successful closure cria atomicamente um `change_acceptance` imutável e context-pinned; governance/context drift posterior nunca reabre nem reescreve o Change, apenas torna a proof inadmissível ao consumidor até uma revalidação on-demand por novo verification Change.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa, sem reabrir:

- C-017 — correctness antes da decomposição, checkpoint humano, discovery quando aplicável, Finding durável, routing, correction budgets, policy/standards snapshots, validation/evidence e honest terminal outcomes;
- 3A-R5 — Builder usa Mastra Code / AgentController + Mastra Workspace + E2B como realization; CodingSession/ActorRun/Sandbox lifetimes permanecem distintos e Mastra mechanics não são authority;
- 3C-05 — Builder owns `Change`, correctness contract, planning/decomposition semantics, Work Unit / ActorRun graph, Finding routing, validation orchestration e Change closure; Minimal Sufficient Execution permanece normativo;
- 3C-11 — Builder prova correctness; Release decide composition/eligibility/promotion; `Change ACCEPTED != Release ACTIVE`;
- 3D-R1 — direct-call-first, owner boundaries, sem generic orchestration bus e sem external I/O dentro de transaction local;
- 3E-01 — `hub_control`, owner-local schemas e Class-2 audit-required transversal behavior;
- 3E-02 — Builder já possui exatamente `change`, `contract_revision`, `plan_revision`, `work_unit`, `actor_run`, `coding_session`, `finding`, `change_acceptance`; nenhuma nova durable class é necessária;
- 3F-01 / 3F-02 / 3F-R1 — lifecycle/domain state, public failure e runtime/effect outcomes permanecem vocabulários distintos; state não é automaticamente wire/public authority;
- 3G-01 — facts-first, guarded mutation e proof-before-implementation são precedentes de disciplina, sem forçar a mesma topologia de projection em outro domínio.

Review/provenance não-autoritativa:

- `3G-FABLE-DIALOGUE-builder-change-finding-lifecycle.md`;
- `3G-FABLE-DIALOGUE-builder-change-finding-lifecycle-R2.md`.

O desenho passou por dois rounds adversariais ChatGPT ↔ Fable com ataques explícitos de late-Finding/closure race, stale proof, contract/governance drift, budget races, hidden classifiers, route downgrade, ghost work, post-closure mutation e Release-consumption staleness.

Resultado antes da ratificação:

```text
Material Finding contra prior authority = NONE
reopen 3C/3D/3E/3F/3G-01 = NONE
candidate 3G-02 = READY FOR OPERATOR DECISION
new durable records / FKs / subsystem / public codes = NONE
```

Mitra e Factory permanecem evidence/reference, nunca authority ou template de implementação.

---

## 2. Escopo fechado

3G-02 decide somente o menor behavioral/state model necessário para:

```text
Change contract revision + checkpoint relationship
checkpoint admissibility
dispatch admissibility at the Change boundary
Finding admission / resolution / authoritative routing
proof/evidence compatibility and derived staleness
per-Change authority serialization
terminal Change closure
change_acceptance creation / consumption semantics
governance/context drift after closure
```

3G-02 não decide:

```text
Work Unit complete lifecycle / retries / completion state       → later 3G
ActorRun complete lifecycle / crash / retry / cancel / drain    → later 3G + 3H/3M
PlanningDepth × RigorProfile calculation                         → later 3G / N3
exact correction-budget numeric limits                           → calibration / implementation
exact Finding resolution-reason enum                             → implementation unless consumer proves need
Mastra session/sandbox continuation implementation               → 3H under 3A-R5
parallel Work Unit scheduling                                    → Decision Loop on measured consumer
Release lifecycle / compose/promote placement of acceptance gate → later 3G Release lifecycle
UI labels / progress language                                    → 3K
exact SQL / indexes / ORM / lock syntax                          → implementation
```

Não nasce `ChangeStateMachine`, `FindingEngine`, `WorkflowEngine`, `RetryEngine`, `RoutePolicyEngine`, Mission, Milestone, event sourcing ou novo record de lifecycle.

---

## 3. Structural model — facts + independent predicates

### 3.1 Change não possui uma projeção operacional exclusiva

Diferente de `ApprovalRequest` em 3G-01, condições de um Change podem coexistir:

```text
checkpoint pendente
+ Finding humano aberto
+ required access indisponível
+ correction budget esgotado
```

Portanto é proibido transformar essas dimensões num enum exclusivo como:

```text
DRAFT | RUNNING | WAITING_APPROVAL | HUMAN | BLOCKED | VERIFYING | ...
```

3G-02 congela uma pequena família de **decision predicates independentes** sobre fatos duráveis e authority atual.

Semanticamente precisam existir decisões equivalentes a:

```text
checkpoint requirement/admissibility
dispatch admissibility
closure admissibility
```

Nomes, signatures e implementação concreta desses predicates não são API authority.

Labels históricas do diálogo como `SHAPING`, `EXECUTABLE`, `CHECKPOINT_REQUIRED`, `HUMAN_INPUT_REQUIRED` e `PREREQUISITE_BLOCKED` não são architecture vocabulary congelado; 3K pode usar presentation labels quando útil.

### 3.2 Persistir significado; derivar compatibilidade

Regra:

> Persistir o fato que seria perdido; derivar condições que já são demonstráveis pela comparação dos fatos pinados.

Logo, 3G-02 não autoriza mutable duplicated `status` para representar fatos já prováveis por refs/digests/resolution/closure.

---

## 4. Contract revision e checkpoint

### 4.1 Current vs approved contract authority

Builder preserva semanticamente:

```text
current contract revision
approved/checkpointed contract revision
```

Quando são semanticamente compatíveis/current:

```text
contract gate pode passar
```

Quando uma revisão material foi adotada mas ainda não foi aprovada:

```text
current != approved
→ checkpoint required
→ nenhum novo coding dispatch sob a revisão nova
```

O harness pode propor revisão; não pode aprová-la nem continuar como se authority tivesse mudado.

### 4.2 Plan pin pertence à identidade semântica aplicável

Quando o Change exige Plan explícito, a exact approved Plan revision faz parte da identidade semântica que o contract revision/checkpoint representa.

Trocar o Plan pin aplicável é uma semantic revision transition:

```text
new Plan revision
→ contract/checkpoint path
```

Não nasce um terceiro lifecycle independente `currentPlanStatus` apenas por simetria.

### 4.3 Discovery é precondition do checkpoint quando aplicável

Se C-017 classifica o Change como dependente de dados reais/integração para fechar suas assertions, checkpoint approval só é admissível quando:

```text
required discovery evidence foi admitida
```

ou:

```text
discovery = NOT_APPLICABLE
+ reason explícita
```

Não é permitido aprovar correctness contract construído sobre suposição onde C-017 exige descoberta autoritativa.

### 4.4 Policy / standards / gates snapshot

Dispatch e closure são julgados sob exact applicable governance snapshot pinado conforme C-017.

Semantic governance drift antes de um novo dispatch/closure:

```text
→ bloqueia admissibilidade
→ exige checkpoint/revalidation aplicável
```

Mudança comprovadamente não-semântica pode seguir a revalidation law já admitida por C-017; não nasce classifier LLM novo em 3G-02.

---

## 5. Dispatch admissibility

Um bounded-work dispatch só pode ser admitido quando todas as preconditions aplicáveis passam sob uma única autoridade consistente.

Inputs obrigatórios incluem, sem re-definir owners posteriores:

```text
Change sem terminal closure
contract / checkpoint current
required Plan pin current quando aplicável
applicable governance snapshot admissível
required discovery/checkpoint obligations satisfeitas
Actor Pack compilation success
required access presente
correction budget/reservation disponível quando aplicável
Finding routes não proíbem aquele trabalho
Rigor/authority floors aplicáveis não são rebaixados
```

`dispatchAdmissible` é uma decisão Builder-side de admission de trabalho; não concede automaticamente capability em I&A, Gateway, Connections, Release ou outro owner.

```text
Builder dispatch admissible
!=
platform-wide authorization granted
```

### 5.1 In-flight work após revision supersession

Se current authority muda enquanto um ActorRun já está em execução, 3G-02 não decide automaticamente cancel/interrupt/drain.

Congelado:

```text
run output/evidence permanece pinado ao context/revision em que executou
→ sua admissibilidade posterior é julgada pela compatibility law desta decisão
→ output sob superseded context não cria authority nova por si só
```

Cancel/interrupt/drain policy pertence ao ActorRun lifecycle posterior.

---

## 6. Evidence compatibility e staleness

### 6.1 Contract digest sozinho é insuficiente

Evidence só é admissível para closure/proof quando corresponde ao **complete applicable execution context** congelado por C-017, incluindo a canonical execution-context identity e demais pins exigidos pela decisão-fonte.

3G-02 não mantém uma lista paralela parcial que possa divergir de C-017.

Regra:

```text
Evidence exact pins/context compatible with context being proven
→ admissible candidate evidence

incompatible pins/context
→ stale / inadmissible for that proof
```

### 6.2 Staleness é derivado, não monotonic durable STALE

Não nasce um `Evidence.STALE` monotônico semelhante ao de `ApprovalRequest`.

Motivo:

```text
ApprovalRequest STALE
→ protege monotonic one-time authorization

Evidence staleness
→ prova compatibility entre exact contexts
```

Se o exact complete context genuinamente volta a ser o mesmo contexto provado, a Evidence pode voltar a ser compatível. Isso é epistemicamente correto, não resurrection de authority.

### 6.3 Revalidation é um proof act explícito

Evidence antiga não prova contexto novo por suposição.

Revalidation precisa ser uma admission explícita que:

```text
references prior Evidence
+ prova compatibility sob o novo contexto exigido
+ produz/admite proof identity apropriada
```

A representação física fica para implementation/verification.

---

## 7. Finding admission — decision relevance

Nem toda observação vira Finding.

Regra fechada:

> Uma observação DEVE ser admitida como `Finding` quando, se verdadeira, mudaria uma decisão de dispatch, closure, route ou checkpoint daquele Change. Uma observação que não poderia mudar nenhuma dessas decisões é telemetry/evidence/commentary, não Finding.

Isso evita os dois extremos:

```text
qualquer comentário → Finding → waiver ceremony
```

ou:

```text
material gap → chamado de commentary → false-green closure
```

Finding permanece o objeto durável para gaps que participam de engineering decision/routing/closure.

---

## 8. Finding resolution e lifecycle mínimo

Semanticamente:

```text
resolution absent  → OPEN
resolution present → RESOLVED
```

`OPEN | RESOLVED` é projection semantics, não obrigação de uma coluna `status` específica.

A resolução é write-once/guarded dentro da authority aplicável.

Exemplos possíveis de reason (`FIXED`, `NOT_APPLICABLE`, `WAIVED_BY_AUTHORITY`, etc.) são **não-frozen** até existir consumidor que exija enum estável.

### 8.1 Zero OPEN Findings para success closure

Successful closure exige:

```text
OPEN Findings = 0
```

Não existe classifier silencioso de "OPEN mas não bloqueante".

Se uma authority aplicável decide que o gap não bloqueia, registra resolução/waiver de forma auditável; o Finding deixa de estar OPEN.

### 8.2 Finding resolvido nunca reabre in-place

Se o mesmo problema reaparece:

```text
new Finding
+ correlation/parent reference quando aplicável
```

O Finding histórico permanece resolvido como verdade do momento em que foi julgado.

---

## 9. Finding route — eixo separado de lifecycle

Route não é status.

Família F1 permanece:

```text
LOCAL_FIX
FIX_WORK_UNIT
REPLAN
HUMAN
```

A leitura normativa é **autonomous authority restante**, não tamanho/severidade do problema:

```text
LOCAL_FIX
→ continuidade dentro da bounded-work authority já admitida

FIX_WORK_UNIT
→ novo bounded work precisa ser explicitamente admitido

REPLAN
→ Builder/agent pode propor; mudança de contract authority exige checkpoint

HUMAN
→ não existe substituto autônomo para a decisão faltante
```

Automatic/derived routing pode manter ou **reduzir autonomia**; nunca aumenta autonomia silenciosamente.

### 9.1 Composite interventions

Se fatos provados exigem múltiplos intervention kinds simultâneos, governa a rota de **menor autonomia** entre eles.

Exemplo:

```text
contract invalidation + unresolved business ambiguity
→ HUMAN
```

Depois da resolução humana, revisões/trabalho subsequentes são novos facts/admissions; não se rebaixa silenciosamente o route histórico.

### 9.2 Human resolution não é route downgrade

Uma decisão humana superior pode resolver/re-scope o Finding e autorizar trabalho menos restritivo depois.

Isso é:

```text
Finding resolution by authority
→ new admitted work/facts
```

não:

```text
HUMAN route → silent rewrite to LOCAL_FIX
```

---

## 10. LOCAL_FIX boundary

`LOCAL_FIX` é admissível apenas enquanto o bounded work que produziu/recebeu o Finding ainda está aberto dentro de sua delivery/acceptance boundary, com contract scope e authority compatíveis.

A vida da CodingSession não concede bounded-work authority.

```text
CodingSession ainda viva
-X-> autorização para trabalho fantasma
```

Depois que a bounded-work delivery authority fechou, nova correção material exige no mínimo `FIX_WORK_UNIT`.

O exato mecanismo físico de delivery (`SHARE`, bundle handoff, commit boundary etc.) não é congelado por 3G-02.

---

## 11. Loop prevention e correction budget

C-017 permanece authority:

```text
mesmo fingerprint sem hipótese/evidence materialmente nova
→ não repetir indefinidamente
→ intervenção precisa perder autonomia / elevar
```

O número exato de tentativas não é architecture law.

Aggregate correction budgets continuam como mechanical safety boundary contra sequência ilimitada de "novas hipóteses".

### 11.1 Exhaustion bloqueia; não auto-terminaliza

Budget/access/tooling exhaustion pode tornar dispatch inadmissível, mas não escreve automaticamente um terminal `BLOCKED`.

Auto-terminalização seria irreversibilidade acidental.

Terminal closure só ocorre por authoritative closure act. Se a decisão final diante de exhaustion for encerrar, `BLOCKED` ou `ESCALATED` registra o outcome honesto; nunca fake success.

---

## 12. Per-Change serialization root

### 12.1 Problema protegido

Sem uma serialization law, sob isolamento comum seria possível:

```text
closure lê "nenhum Finding"
→ Finding relevante comita concorrente
→ closure comita ACCEPTED
```

ou:

```text
closure comita
→ dispatch concorrente já lido como aberto comita depois
```

ou:

```text
2 fix dispatches leem budget restante = 1
→ ambos consomem
```

Esses schedules violam invariantes reais.

### 12.2 Lei normativa

Para um mesmo Change, toda **Builder-owned authority mutation/admission** cujo resultado pode mudar checkpoint, dispatch ou closure admissibility serializa através de uma única Change-owned root antes de commit.

Inclui pelo menos:

```text
contract/current revision adoption
checkpoint/approved-ref mutation
Finding creation/admission
Finding authoritative-route elevation
Finding resolution
bounded-work / Work Unit / ActorRun admission and dispatch admission
correction-budget reservation/consumption mutation
admission of assertion verdict / evidence ref into Builder closure authority
terminal closure
successful change_acceptance creation
```

A transaction perdedora por guarded conflict/closed Change falha/aborta; não comita estado contraditório.

A law congela **single serialization scope por Change**, não SQL/lock primitive específica.

### 12.3 O que NÃO serializa por essa root

Raw production fora da authority do Builder não entra nessa transaction apenas por existir:

```text
OBS append
CAS/blob persistence
external test output
validator raw report
Mastra runtime mechanics
```

O que serializa é a **Builder admission** desse material como authority de Change/Finding/closure.

Não nasce transação cross-owner nova.

### 12.4 External I/O permanece fora

Nenhum sandbox/model/test/ERP/network I/O fica aberto dentro da authority transaction.

A serialization root protege commits de authority curtos; não transforma execution em lock global nem scheduler.

---

## 13. Terminal Change closure

Terminal closure é exactly-once/write-once e imutável.

Outcomes fechados:

```text
ACCEPTED
NO_CHANGE_REQUIRED
REJECTED
BLOCKED
ESCALATED
```

O closure fact pertence ao `Change` e registra historical lifecycle truth.

Depois que terminal closure comita:

```text
no later Builder mutation changes that closed Change authority
```

Work descoberto depois pertence a novo Change correlacionável, não a reopen in-place.

### 13.1 Outcome meanings

`ACCEPTED`

```text
current approved correctness contract foi provado
+ required evidence/admissibility gates satisfeitos
```

`NO_CHANGE_REQUIRED`

```text
foi provado que o estado requerido já era verdadeiro
+ nenhuma mutação é necessária
```

`REJECTED`

```text
applicable authority terminou explicitamente o Change como "não prosseguir"
```

Checkpoint refusal com intenção de revisar não implica `REJECTED`; pode abrir nova revision enquanto o Change continua open.

`BLOCKED`

```text
objetivo continua semanticamente válido
+ não pode ser satisfeito/provado no horizonte/constraints aceitos
+ authority decide encerrar como impossibilitado nesse horizonte
```

`ESCALATED`

```text
resolução saiu da authority/escopo operacional deste Change/Builder
+ applicable authority decide encerrar e encaminhar para decisão/processo superior
```

### 13.2 Explicit authoritative closure act

Terminal closure não nasce automaticamente por timer, budget exhaustion, outage ou ausência temporária de access.

"Explicit" significa um commit autoritativo deliberado pela regra/actor habilitado; não significa obrigatoriamente clique humano para cada outcome.

---

## 14. Successful closure e `change_acceptance`

### 14.1 Success partition

```text
SUCCESS     = ACCEPTED | NO_CHANGE_REQUIRED
NON_SUCCESS = REJECTED | BLOCKED | ESCALATED
```

Only SUCCESS cria `bld.change_acceptance`.

`change_acceptance` é proof object imutável/stable input para consumers autorizados; não vira tombstone genérico de closure failure.

### 14.2 Owner-local atomicity

Successful terminal closure e sua `change_acceptance` comitam atomicamente dentro do Builder owner boundary.

Proibido estado estável:

```text
Change SUCCESS sem acceptance proof
```

ou:

```text
change_acceptance para Change não-success
```

Quando a mutation for audit-required, compõe com a Class-2 OBS audit transversal já aprovada; nenhuma nova cross-owner atomicity class nasce.

### 14.3 NO_CHANGE_REQUIRED não exige bytes novos

Um no-op successful Change pode produzir proof equivalente a:

```text
same result/source identity
+ no-mutation proof
+ complete required assertion/evidence matrix
```

Isso registra successful verification; não inventa deployable bytes nem força Release novo por si só.

### 14.4 Um acceptance por Change

Um successfully closed Change produz exatamente um immutable `change_acceptance`.

Proof multiplicity para o mesmo resultado/context ao longo do tempo ocorre via Changes sucessores distintos, nunca via mutable acceptance set dentro do mesmo Change.

---

## 15. Closure admissibility

Successful closure depende de todos os gates aplicáveis, incluindo:

```text
Change ainda open durante admission
current contract/checkpoint admissível
required Plan/governance/discovery obligations satisfeitas
zero OPEN Findings
complete MUST assertion × verdict coverage
Evidence admissível pelo full execution-context compatibility law
RigorProfile recalculated at Change closure; maior piso aplicável governa required proof
required manual/human verdicts presentes quando C-017 exige
```

`zero OPEN Findings` nunca substitui proof matrix:

```text
nenhum gap conhecido
!=
correctness provada
```

A exact RigorProfile calculation continua em decisão posterior; 3G-02 apenas a reconhece como input herdado de C-017.

---

## 16. Governance/context drift after successful closure

### 16.1 Guard-time closure semantics

Closure admissibility avalia external/current governance/context requirements uma vez na authority guard da closure attempt.

Se a closure era lawful naquele guard e governance externa muda antes/depois do commit, o historical closure não é reescrito.

Não há tentativa de manter transaction aberta atravessando outro owner ou external policy evolution.

### 16.2 Acceptance é context-pinned proof

`change_acceptance` nunca significa "esta prova será válida para sempre".

Ela registra:

```text
what/result identity was proven
+ exact contract identity
+ exact governance snapshot
+ exact applicable execution context / verification identity
```

Um consumer posterior, inclusive Release, precisa verificar se aquela proof continua admissível para o contexto/governance que ele exige.

Drift posterior pode produzir:

```text
closed Change continua historicamente verdadeiro
+ immutable acceptance continua intacto
+ acceptance fica inadmissível para aquele consumer atual
```

Isso não reabre Change nem muta acceptance.

### 16.3 Restoration por successor verification Change

Quando um consumer real precisa restaurar admissibilidade de um resultado já fechado sob governance/context novo, Builder usa um **novo verification Change**, normalmente sem mutação do resultado, aproveitando a semantics de `NO_CHANGE_REQUIRED` quando a prova confirma que nenhuma mudança é necessária.

```text
old Change/acceptance untouched
→ successor verification Change
→ proof under current governance/context
→ new immutable acceptance
```

Esse verification Change é **on-demand**:

```text
governance drift
-X-> eager fan-out de verification Changes para todo histórico
```

Ele só nasce quando existe consumidor real que precisa recuperar admissibilidade daquele resultado/proof.

3G-02 não cria `RevalidationJob`, scheduler ou background sweep.

A placement exata do acceptance-admissibility check dentro de Release compose/promote pertence ao futuro Release lifecycle decision.

---

## 17. Mastra/E2B realization boundary

3A-R5 permanece integralmente válida:

```text
Builder domain authority
→ Change / COR-* / revisions / Findings / budgets / closure / Evidence admission

Mastra Code / AgentController
→ coding cognition/session mechanics

Mastra Workspace + E2B
→ execution filesystem/process/sandbox mechanics
```

Mastra pode descobrir gap, sugerir route, implementar LOCAL_FIX ou produzir candidate evidence dentro da authority concedida.

Mastra não pode por self-report:

```text
aprovar contract revision
resolver Finding sem admission
rebaixar route
ampliar budget
admitir stale Evidence
fechar Change
criar Release authority
```

Persistent CodingSession é UX/performance mechanism; nunca substitui bounded-work admission.

---

## 18. Product-shape law

Rigor interno não deve vazar como bureaucracy para o usuário comum.

3G-02 permite experiência conceitual compacta como:

```text
ENTENDER
→ APROVAR
→ CONSTRUIR
→ VERIFICAR
→ PRONTO / PRECISA DE VOCÊ / BLOQUEADO
```

`Finding`, route, Work Unit, ActorRun, revision digests e proof internals ficam disponíveis para drill-down técnico/audit quando útil, não como ritual obrigatório de produto.

Isso preserva o aprendizado útil de Mitra — produto simples sobre harness controlada — e Factory — correctness explícita, verifier independente e correction work proporcional — sem copiar suas ontologias/proprietary orchestration.

---

## 19. Proof obligations

Antes de considerar implementação conforme esta authority, 3N/implementation verification deve provar pelo menos:

1. semantic contract revision sem checkpoint → dispatch recusado;
2. required explicit Plan revision changed sem checkpoint → dispatch recusado;
3. real-data Change sem required discovery/NOT_APPLICABLE → checkpoint recusado;
4. semantic governance drift antes do dispatch → dispatch recusado;
5. Actor Pack compile failure → dispatch recusado;
6. required access ausente → dispatch recusado;
7. Evidence com contract match mas full execution-context mismatch → closure recusada;
8. explicit mechanical revalidation → somente proof revalidada pode ser admitida;
9. decision-relevant gap tratado como commentary → Finding admission guard/test falha;
10. OPEN Finding no success closure → closure recusada;
11. cosmetic/non-blocking gap só deixa de bloquear após explicit resolution/waiver;
12. route elevation race → autonomia não aumenta silenciosamente;
13. composite REPLAN + HUMAN need → route de menor autonomia governa;
14. post-delivery `LOCAL_FIX` → recusado; mínimo `FIX_WORK_UNIT`;
15. budget exhaustion → automatic dispatch bloqueado; Change não auto-terminaliza;
16. late Finding admission racing `ACCEPTED`, ambos os orders → um commit autoritativo perde/falha; nunca accepted-with-open-gap;
17. bounded-work admission racing terminal closure, ambos os orders → nenhum run admitido depois de closure;
18. dois fix dispatches concorrentes com remaining budget = 1 → exatamente um admite;
19. success closure → terminal fact + `change_acceptance` atomicamente;
20. non-success closure → terminal fact sem `change_acceptance`;
21. closure commit → later Builder mutation no Change fechado falha;
22. governance drift depois do closure guard → closed Change permanece; acceptance posterior é inadmissível quando consumer exige snapshot novo;
23. successor verification Change on-demand → nova proof atual sem mutar old Change/acceptance;
24. governance drift sem consumidor real → nenhum eager verification fan-out;
25. in-flight run sob superseded context → output não ganha current authority sem compatibility/revalidation;
26. executor/harness self-report `done` → não fecha Change.

Os testes devem demonstrar o controle **firing**, não apenas happy path.

---

## 20. YAGNI / anti-overengineering closure

3G-02 adiciona:

```text
new durable record class  = 0
new Tier-2 FK             = 0
new module/subsystem      = 0
new atomicity class       = 0
new public failure code   = 0
new scheduler/queue       = 0
```

F1 não autoriza por esta decisão:

```text
ChangeState enum/FSM universal
GenericFSM / StateRegistry
FindingService/FindingEngine genérico
RoutePolicyEngine
RetryEngine
generic workflow/pipeline DSL
Mission / Milestone
parallel scheduler
status fan-out para WorkUnit/ActorRun/Evidence em revision change
durable monotonic Evidence.STALE flag por default
eager revalidation sweep após governance change
mutable/reopenable change_acceptance
multiple mutable acceptance proofs por Change
cross-owner transaction para raw Evidence/OBS/CAS production
lock durante Mastra/E2B/external I/O
fixed retry count como architecture law
AI semantic-freshness classifier
Finding para commentary sem decision relevance
UI expondo internal lifecycle machinery como ritual obrigatório
```

Qualquer expansão volta pelo Decision Loop com consumer/failure class real.

---

## 21. Later routing

Permanece posterior:

```text
Work Unit lifecycle / delivery semantics                → later 3G
ActorRun lifecycle / retry / cancel / drain             → later 3G + 3H/3M
PlanningDepth × RigorProfile exact calculation          → later 3G / N3
Finding numeric caps / budget calibration               → implementation/eval
parallelism                                              → Decision Loop on measured need
Mastra session/sandbox resume/freshness realization     → 3H
Release-side acceptance admissibility placement         → later 3G Release lifecycle
policy/authority eligibility                             → 3I where applicable
product labels / user interruption experience           → 3K
recovery drills / crash-specific repair                  → 3M
end-to-end behavioral verification                      → 3N/3O
```

---

## 22. Reopen triggers

Reabrir 3G-02 somente com evidence material, por exemplo:

1. a per-Change serialization root cria bottleneck real incompatível com um consumer de paralelismo já aprovado;
2. um gap decision-relevant não pode ser representado por Finding + current route/resolution sem criar ambiguity de authority;
3. a ordem por autonomia das quatro routes falha diante de um consumer real não representável pela least-autonomy composition law;
4. closure immutability impede uma operação necessária que não pode ser representada honestamente por successor Change;
5. `NO_CHANGE_REQUIRED` prova insuficiente para consumer real de no-op/revalidation e exige semântica distinta;
6. context-pinned acceptance + successor verification Change não consegue satisfazer Release/consumer real sem duplicar authority;
7. full execution-context compatibility não consegue representar um proof invalidation real sem durable monotonic invalidation;
8. Finding decision-relevance gera false-negative/false-positive sistemático que não pode ser corrigido por enforcement/teste simples;
9. implementation evidence mostra race ainda alcançável capaz de produzir false ACCEPTED, work under closed/stale authority, budget oversubscription ou silent route downgrade;
10. nova authority upstream muda semanticamente C-017/Builder/Release ownership.

Mudança de nome, preferência de framework, feature existente na Factory/Mitra/Mastra ou future optionality hipotética não reabre a decisão.

---

## 23. Decisão final ratificada

> **No Conexus F1, Builder governa `Change` e `Finding` por fatos duráveis e predicados independentes, não por mega-FSM. Contract/Plan/governance/discovery obligations determinam checkpoint e dispatch; Evidence só prova o exact applicable execution context e sua staleness é derivada; Finding existe apenas para gaps decision-relevant, resolve-se sem reopen in-place e roteia por autonomia decrescente `LOCAL_FIX → FIX_WORK_UNIT → REPLAN → HUMAN`, com least-autonomy composition e sem silent downgrade. Toda Builder authority mutation capaz de alterar checkpoint/dispatch/closure serializa por uma única root owner-local por Change, incluindo bounded-work e budget admissions, sem transação atravessando external I/O. Terminal closure é write-once em `ACCEPTED | NO_CHANGE_REQUIRED | REJECTED | BLOCKED | ESCALATED`; success cria atomicamente um immutable `change_acceptance`, enquanto non-success não cria acceptance. Acceptance é context-pinned proof, não promessa eterna: governance/context drift posterior não reabre nem reescreve o Change, e um consumer que precise restaurar admissibilidade usa on-demand um novo verification Change, sem eager fan-out, scheduler ou mutable acceptance. Mastra/E2B permanecem mechanics subordinadas; product UX pode continuar simples sobre essa harness rigorosa.**
