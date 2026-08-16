# 3G-03 — Builder Work Unit & ActorRun Execution Lifecycle Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3G — Behavioral / State Architecture  
**Authority:** terceira decisão aprovada de 3G  
**Importante:** esta decisão não constitui C-018, não encerra 3G nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, `Work Unit` é authority bounded e imutável de trabalho, sem FSM durável e com no máximo uma delivery aceita; `ActorRun` é uma tentativa concreta, auditável e write-once, com um único output exato opcional apresentado para julgamento e uma disposição terminal owner-local `DELIVERED | FAILED | CANCELLED`; retry é nova tentativa somente enquanto a mesma Work Unit continua current/admissible, enquanto mudança de scope/sets/pins/fulfills vira successor Work Unit; output produzido nunca é self-report de sucesso, delivery de Work Unit é admissão atômica pelo Builder, crash/recovery retoma o julgamento do mesmo output quando ele já foi duravelmente apresentado, external-effect replay permanece enforcement do Gateway, e Mastra/CodingSession/E2B permanecem mechanics subordinadas sem criar workflow engine, retry engine, queue, lease ou nova classe durável.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa, sem reabrir:

- C-017 — `Group → Project → Change → Work Unit → ActorRun`, correctness antes da decomposição, Minimal Sufficient Execution, sets declarativos, RigorProfile, Actor Pack, verifier independente, typed handoff, Evidence/Findings, budgets e honest outcomes;
- 3A-R5 — Mastra Code / AgentController + Mastra Workspace + E2B como realization do Builder; `Change != CodingSession != ActorRun != Sandbox`; persistent CodingSession por Change como default e fresh verifier session quando material;
- 3C-05 — `Work Unit` como unidade bounded de trabalho e `ActorRun` como tentativa durável, sem ceremonial decomposition;
- 3D-03 / 3D-R1 — direct-call-first, runtime nunca sobe para application layer, InceptionInvestigaton mantém sua forma operacional detalhada ainda não congelada;
- 3E-01 / 3E-02 — Builder já possui `work_unit`, `actor_run`, `coding_session`, `finding`, `change_acceptance`; nenhuma nova durable class/FK/atomicity class é necessária;
- 3F-02 — typed producer output/handoff é `F5 PRODUCER_INGRESS_OR_PROPOSAL`; producer propõe, owner julga/aplica, transport/runtime nunca redefine authority;
- 3G-02 — per-Change serialization root, current approved decomposition, Finding routes, context compatibility, bounded-work admission, immutable Change closure e no status fan-out.

Review/provenance não-autoritativa:

- `3G-FABLE-DIALOGUE-builder-work-unit-actor-run-lifecycle.md`;
- `3G-FABLE-DIALOGUE-builder-work-unit-actor-run-lifecycle-R2.md`.

O desenho passou por dois rounds adversariais ChatGPT ↔ Fable com ataques explícitos contra duplicate attempts, moving candidate, orphaned runs, crash/restart, stale decomposition, cancel/late output, verifier authority leakage, effect ambiguity e necessidade de WU FSM/quarto terminal/lease.

Convergência antes da ratificação:

```text
Material Finding contra prior authority = NONE
reopen 3C/3D/3E/3F/3G-01/3G-02 = NONE
Work Unit durable FSM = NOT JUSTIFIED
fourth ActorRun terminal = NOT JUSTIFIED
new durable record / FK / engine / scheduler / lease = NONE
Global Maximum = CURRENT STRUCTURE CONFIRMED
candidate 3G-03 = READY FOR OPERATOR DECISION
```

Mitra e Factory permanecem evidence/reference, nunca authority ou template de implementação.

---

## 2. Escopo fechado

3G-03 decide somente o menor behavioral/state model necessário para:

```text
Work Unit admitted bounded authority
Work Unit immutability / current decomposition membership
ActorRun generic attempt semantics
one active WU-execution attempt in F1
produced output presentation and crash recovery
ActorRun terminal disposition
same-WU retry/new-attempt admissibility
cancellation / late-output semantics
Work Unit delivery admission / delivery boundary
relationship to Finding routes, budgets, Change closure and Gateway effects
```

3G-03 não decide:

```text
PlanningDepth × RigorProfile exact calculation              → later 3G / N3
Mastra AgentController/session API mapping                  → 3H
runtime heartbeat/reconnect/liveness detection mechanics    → 3H/3M
sandbox pause/resume/recreate/freshness realization         → 3H/3M
numeric retry/correction/time/cost limits                   → calibration/eval
parallel same-WU best-of-N / winner arbitration             → Decision Loop on measured consumer
parallel Work Unit scheduler                                → Decision Loop on measured consumer
Gateway effect_attempt complete lifecycle                   → later 3G
OUTCOME_UNKNOWN settlement/reconciliation                   → 3M
exact typed handoff schemas                                 → implementation under 3F/C-017
exact SQL/columns/indexes/ORM/lock primitive                → implementation
exact UI labels / progress rendering                        → 3K
InceptionInvestigation pre-Change execution shape           → later Decision Loop / 3H if concrete need emerges
```

Não nasce `WorkUnitStateMachine`, `ActorRunStateRegistry`, `RetryEngine`, `CandidateService`, queue, scheduler, workflow engine, Mission/Milestone, lease subsystem ou generic output registry.

---

## 3. Minimal Sufficient Execution permanece baseline

Baseline F1:

```text
Change
└── Work Unit 1
    └── ActorRun 1
```

Additional Work Units/ActorRuns exigem failure class ou benefício concreto já admitido por C-017/3C-05.

Não decompor apenas porque existem:

```text
frontend + backend + tests
múltiplas pastas
múltiplas COR-*
checklist longo
feature aparentemente grande
```

Persistent CodingSession de 3A-R5 reforça, e não enfraquece, esse baseline: continuidade cognitiva reduz a necessidade de decompor só para evitar rediscovery.

---

## 4. Work Unit = immutable bounded work authority

Uma `Work Unit` responde:

> Qual trabalho bounded está admitido sob este exact current Change authority context?

Sua authority semântica inclui os facts/pins aplicáveis já exigidos por C-017, como:

```text
owning Change
contract/revision identity
fulfills / affected assertions
scope
readSet / writeSet / effectSet
applicable approved decomposition identity
applicable governance / Actor Pack / authority pins
```

Exact physical fields não são congelados aqui.

### 4.1 Authority facts são imutáveis após admission

Depois que uma Work Unit é admitida, seus fatos de bounded authority não mudam in-place.

Se mudar materialmente:

```text
scope
readSet / writeSet / effectSet
contract/pins
fulfills
bounded intent/decomposition meaning
```

então não é retry da mesma Work Unit:

```text
old Work Unit permanece historical truth
→ successor Work Unit é admitida sob current authority
```

Isso impede que historical ActorRuns/budgets/reconciliation passem a significar retroativamente outra coisa.

### 4.2 Current approved decomposition membership

Uma Work Unit só admite novo ActorRun enquanto ainda pertence à **current approved/admitted decomposition** do Change.

Compatibilidade de digests isoladamente não basta.

Exemplo:

```text
R1: WU-01
REPLAN
R2: WU-02 + WU-03

WU-01 assertions ainda parecem compatíveis
-X-> novo ActorRun de WU-01
```

Para `DIRECT` Change sem `plan_revision` explícita, current approved decomposition significa o current Builder-admitted bounded-work set sob o current approved Change/contract authority; nenhum Plan artificial é criado por simetria.

### 4.3 Work Unit não ganha FSM durável

A authority load-bearing de delivery é somente:

```text
acceptedDelivery = absent | one exact admitted delivery identity
```

Uma Work Unit pode ficar sem delivery porque falhou, foi abandonada, saiu da decomposição, teve budget esgotado ou o Change fechou. Esses estados operacionais são derivados dos facts atuais; F1 não persiste por default:

```text
PENDING | RUNNING | FAILED | BLOCKED | SUPERSEDED | CANCELLED | DONE
```

Query/UI podem projetar labels sem transformá-las em segunda authority.

---

## 5. ActorRun = one concrete admitted attempt

`ActorRun` é uma tentativa concreta, durável e auditável de um applicable Builder role.

```text
ActorRun
!= CodingSession
!= Mastra run/turn/session identity
!= E2B sandbox
```

Attempt-generic laws aplicam-se aos ActorRuns cobertos pelo work graph desta decisão:

```text
one immutable ActorRun identity
exact owning Change within this work graph
exact execution-context pins / runtime correlation
applicable budget participation
optional exact produced output identity
one write-once terminal disposition
cancellation + late-output law
orphan terminalization law
per-Change serialization for authority mutations
```

### 5.1 Inception não ganha Change sintético por esta decisão

C-017 define o work graph `Change → Work Unit → ActorRun`, e 3G-03 congela esse ownership para os ActorRuns do Builder work graph que governa.

Porém 3D-03 já aprovou `InceptionInvestigation` e deixou sua forma operacional detalhada para fases posteriores. Portanto 3G-03 **não** decreta que toda Inception agentic precise criar um `Change` artificial.

Se a realization futura provar necessidade de um ActorRun verdadeiramente pré-Change:

```text
concrete Inception consumer
→ Decision Loop
→ explicit exception/shape decision
```

Não expandir o significado de `Change` por simetria ou conveniência documental.

---

## 6. Execution identity é pinada; CodingSession é correlation/mechanism

ActorRun registra/pina a complete execution identity já exigida por C-017/C-002 conforme aplicável, incluindo as identities relevantes de:

```text
contract revision
policy/governance snapshot
Actor Pack / tool surface
runtime/runtime version
sandbox/runtime correlation refs
model/provider / reasoning config quando load-bearing
applicable binding/Connection/Brain/environment pins
```

3G-03 não cria uma definição concorrente de `executionContextDigest`.

`bld.coding_session` guarda continuidade/correlation facts necessários para a realization de 3A-R5; sua liveness/transcript/runtime mechanics não são bounded-work authority e ficam em 3H.

---

## 7. Produced output identity — exact, write-once, role-typed

Todo ActorRun pode apresentar no máximo **uma** exact produced-output identity para Builder judgment.

Nome ilustrativo, não schema authority:

```text
producedOutputRef?
```

### 7.1 Presentation é um authority act

Antes da presentation:

```text
Mastra pode editar/testar/refinar livremente dentro da authority
→ nenhuma Builder produced-output fact ainda
```

Quando a presentation é admitida:

```text
A1.producedOutputRef = X
```

`X` é write-once.

Outro resultado semanticamente diferente:

```text
Y != X
→ não muta A1
→ exige novo ActorRun admitido quando aplicável
```

Isso evita moving-target judgment e torna desnecessário persistir `RESULT_READY`/`WAITING_ADMISSION`.

### 7.2 Same-identity re-presentation é idempotente

Recovery normal pode reapresentar o mesmo fato depois de crash/ack loss:

```text
A1 already has X
present X again
→ idempotent read-back / success semantics
```

Mas:

```text
A1 already has X
present Y
→ refused
```

Nenhuma idempotency-key machinery adicional é necessária.

### 7.3 Identity fica no canonical content level

Output identity é a canonical-content identity apropriada à result class, nunca embalagem/localização de storage.

Exemplos conceituais:

```text
code/build result     → commit/tree/content identity
verification output   → report/Evidence-candidate digest identity
no-op proof           → exact result/source + oracle proof identity
external effect       → typed receipt/effect identity
```

Portanto:

```text
re-packaging same content      → same identity
storage/custody repair         → 3M; identity unchanged
different semantic content     → new identity → new ActorRun
```

### 7.4 No UniversalOutput

`producedOutputRef` não define payload universal, resolver universal ou byte store.

Cada role/result continua apontando para typed durable owner/mechanism já autorizado. ActorRun guarda a presentation identity; não vira global artifact registry.

OBS/telemetry nunca é usada para reconstruir `was output presented?` como current domain authority.

---

## 8. ActorRun terminal partition

Owner-local semantic terminal partition:

```text
DELIVERED
FAILED
CANCELLED
```

A partição e os meanings são authority; exact DB enum/wire spelling não é public contract por esta decisão.

Terminal disposition é write-once e mutuamente exclusiva.

### 8.1 DELIVERED

`DELIVERED` significa:

> Builder admitiu o exact role-appropriate output daquele ActorRun como output válido da tentativa realizada.

Não significa:

```text
Change correctness proven
validator opinion admitted as hub_verified_evidence
Release eligible
Work Unit acceptedDelivery para todo role
runtime/model self-report success
```

Para WU-execution ActorRun:

```text
A1 DELIVERED
+
WU.acceptedDelivery = X
→ mesma owner-local atomic mutation
```

Para verifier/role-class ActorRun:

```text
DELIVERED
→ exact report/output foi admitido como produto daquele run
-X-> automatic Finding/Evidence verdict authority
-X-> WU acceptedDelivery
```

`validator_report != hub_verified_evidence` permanece integralmente válido.

### 8.2 FAILED

`FAILED` significa que a tentativa terminou sem role-appropriate admitted output.

Reason/evidence pode distinguir:

```text
runtime loss
tooling failure
delivery rejection
output contract mismatch
permanent custody loss
other typed operational cause
```

Esses reasons não são lifecycle states adicionais e exact enum permanece unfrozen até consumer real exigir.

`FAILED` nunca significa automaticamente `retryable=true`.

### 8.3 CANCELLED

`CANCELLED` significa que applicable authority terminou deliberadamente a tentativa antes de uma delivery válida daquela tentativa.

Cancel ActorRun permanece diferente de:

```text
abandon Work Unit
change decomposition
terminate Change
```

Para impedir future attempts, a authority superior correspondente precisa mudar.

---

## 9. One active WU-execution ActorRun in F1

Uma Work Unit pode possuir historical ActorRuns múltiplos, porém no F1:

```text
at most one non-terminal WU-execution ActorRun per Work Unit
```

Isso não impede verifier/other-role runs do mesmo Change e não cria global one-run-per-Change.

Motivo:

```text
no current best-of-N consumer
no winner arbitration need
less source conflict
less budget/race complexity
serial default from C-017
```

Same-WU competing implementation só retorna pelo Decision Loop com consumer medido.

---

## 10. Per-Change serialization membership

3G-03 instancia a serialization root já aprovada em 3G-02.

Para os ActorRuns do Change work graph, Builder authority mutations que podem alterar dispatch/closure truth serializam pela mesma Change-owned root, incluindo pelo menos:

```text
ActorRun admission / dispatch admission
produced-output presentation
ActorRun terminalization
Work Unit delivery admission
Work Unit acceptedDelivery
correction/validator budget reservation/consumption quando aplicável
```

Nenhum external I/O, Mastra turn, model call, E2B process, test ou network request permanece aberto sob essa transaction/serialization guard.

Consequências:

```text
Change closure commits first
→ later output/delivery/terminal authority mutation aborts

revision/Finding/decomposition mutation commits first
→ later delivery/retry re-evaluates current guards
```

---

## 11. Work Unit delivery boundary

Work Unit delivery admission responde somente:

> Este exact output é uma delivery legítima deste exact bounded work sob current authority?

Ela **não** responde se o Change inteiro está correto.

Minimum applicable checks incluem inherited obligations como:

```text
exact WU / ActorRun / output identity
output durable resolvability + content identity match
current approved decomposition membership
scope/readSet/writeSet/effectSet reconciliation
commit-matrix / result-class conformance
contract/governance/Actor Pack/required-access compatibility
applicable typed handoff judgment
required WU-local mechanical proof/receipts
```

Typed handoff é owner-side judgment de um existing 3F-02 `F5 PROPOSAL`; não cria `UniversalHandoff`/`HandoffContract` subsystem.

### 11.1 Atomic delivery

Successful WU delivery comita atomicamente dentro de Builder:

```text
A1 terminal = DELIVERED
+
WU.acceptedDelivery = X
```

Proibido stable state:

```text
A1 DELIVERED sem corresponding acceptedDelivery para WU-execution role
ou
WU.acceptedDelivery X sem producer run DELIVERED
```

At most one accepted delivery por Work Unit.

### 11.2 Delivery != Change correctness

Delivery-local checks não duplicam a Change validation stack.

Evidence produzida durante a WU pode ser reutilizada por Change validation/closure quando continuar admissível pelo full execution-context compatibility law de 3G-02.

Depois da delivery boundary:

```text
no new ActorRun for same WU
new bounded corrective work
→ new Work Unit via existing Finding/route/decomposition authority
```

Isso torna `LOCAL_FIX` pré-delivery e `FIX_WORK_UNIT` pós-delivery mecanicamente distinguíveis sem consultar CodingSession liveness.

---

## 12. Crash/recovery semantics

### 12.1 No produced output became durable

```text
A1 terminal absent
A1 producedOutputRef absent
runtime/output não é recuperável como current presented result
```

Quando existir sufficient owner-admissible basis de que a execução não está mais live/admissible, Builder pode executar explicit guarded terminalization:

```text
FAILED
```

Se applicable authority deliberadamente interrompeu, `CANCELLED`.

Detection de orphan/runtime loss é mechanics de 3H/3M; não existe timeout/heartbeat architecture law em 3G-03.

### 12.2 Produced output already exists

Se:

```text
A1 terminal absent
A1 producedOutputRef = X
```

runtime death **não** autoriza orphan `FAILED`.

A execução já apresentou um judgment target durável. O Hub deve recuperar/reavaliar o mesmo exact `X`.

Orphan terminalization guard inclui conceitualmente:

```text
terminal absent
AND producedOutputRef absent
```

Se presentation de X ganhou primeiro, orphan failure perde/aborta. Se orphan failure ganhou primeiro, late presentation perde e nunca ganha authority.

### 12.3 Temporarily unresolvable X

Temporária falta de custody/resolution de `X` não inventa terminal state:

```text
A1 pode permanecer non-terminal
→ 3M tenta custody recovery
```

Permanent-loss determination pode sustentar explicit `FAILED`.

Nenhum timer/deadline universal é congelado.

---

## 13. Retry / new-attempt admission

Outro WU-execution ActorRun da mesma Work Unit só é admissível quando current authoritative facts permitem, incluindo pelo menos:

```text
Change remains open
WU has no acceptedDelivery
WU belongs to current approved decomposition
WU immutable authority/pins remain current/admissible
no other non-terminal execution ActorRun exists for this WU
applicable budgets permit
Finding/current route does not require successor WU/replan/human first
RigorProfile recalculation passes
Actor Pack compilation / required access / inherited dispatch gates pass
```

`FAILED` não implica retry.

Não persistir generic `retryable` flag; ele ficaria stale contra os facts que resume.

### 13.1 Same-WU retry vs successor Work Unit

Same-WU new attempt é legítimo para failure puramente operacional/tático enquanto a bounded authority permanece idêntica.

Mudança material de:

```text
scope
sets
pins
fulfills
contract/decomposition meaning
```

é successor Work Unit/replan, não retry.

Numeric attempt limit não é architecture law; correction/attempt budgets já provêm mechanical bound.

Budget exhaustion bloqueia nova automatic attempt, mas não auto-terminaliza Work Unit nem Change.

---

## 14. External-effect safety stays Gateway authority

ActorRun/new-attempt admission **não** é last-mile replay authority.

Builder pode consumir Gateway effect-state projection como evidence/context e pode usar known `OUTCOME_UNKNOWN` como advisory efficiency signal, mas essa leitura:

```text
MAY evitar trabalho que provavelmente bloqueará
-X-> correctness authority de replay
-X-> atomic cross-owner dependency para dispatch
```

Gateway continua enforcement exclusivo sobre:

```text
effect_attempt
idempotency/reconciliation facts
traffic/outcome state
actual external-effect admission/replay
```

Portanto:

```text
new ActorRun admitted
!= permission to replay prior external effect
```

Um novo run pode executar trabalho local/non-effectful mesmo com efeito anterior `OUTCOME_UNKNOWN`; quando tentar o efeito ambíguo, Gateway deve recusar/reconciliar segundo sua own authority.

Agent reasoning sobre effect ambiguity deve preservar honest uncertainty: projection do Gateway pode entrar como contexto/evidence, mas Builder nunca decide que unknown = happened/not-happened por conveniência.

---

## 15. Cancellation and late output

Cancellation é terminal authority fact, não `cancel_requested` durable mini-state.

Sequência semântica:

```text
Builder commits A1 = CANCELLED
→ physical interrupt/cancel do runtime é best-effort realization
```

Depois de `CANCELLED`:

```text
late Mastra/runtime output
→ pode existir como raw/quarantined material
-X-> producedOutputRef admission
-X-> WU delivery
```

Crash depois do terminal cancel e antes do physical interrupt pode desperdiçar compute, mas não restitui authority ao runtime.

Post-cancel mutations que apareçam em future attempt candidate só podem reentrar através da nova attempt e sua full set/byte reconciliation; contamination extra é detectável/rejeitável na delivery.

Risco cognitivo de session contaminada permanece trigger de fresh CodingSession em 3A-R5; realization fica em 3H, sem `QUARANTINED_SESSION` state em 3G.

---

## 16. Verifier / role-class ActorRuns

Attempt-generic terminal/output/recovery laws também se aplicam a verifier/role-class runs dentro do Change work graph.

C-017 permanece authority:

```text
fresh verifier context when material
validator cannot fix what it judges
validator_report != hub_verified_evidence
Finding/evidence admission remains separate authority act
validator budget is reserved/admitted before dispatch when required
```

One-active-WU rule não limita verifier runs porque se aplica somente a competing execution attempts da mesma Work Unit.

UI 3K não deve apresentar verifier `DELIVERED` como “correctness passed”; role-run terminal é operational output admission, não content verdict.

---

## 17. Single-process Hub rationale; no lease in F1

F1 continua modular monolith com uma única Hub authority-writing topology aprovada.

Runtime/Mastra/E2B nunca possui Builder authority, portanto Hub-vs-runtime liveness não é split-brain de authority.

Com:

```text
per-Change serialization
write-once terminal facts
late-output refusal
```

não existe current failure class que exija:

```text
ActorLease
worker claim
heartbeat-as-authority
fencing token
```

Reopen trigger:

```text
future multi-process/distributed Hub dispatch writers
→ Decision Loop
→ lease/claim/fencing fact pode se tornar necessário
```

Não construir antecipadamente.

---

## 18. Mastra / CodingSession / E2B boundary

3A-R5 permanece integralmente válida:

```text
Conexus Builder
→ Change / Work Unit / ActorRun identities
→ authority pins / budgets / Findings / Evidence admission
→ output presentation / terminal / delivery

Mastra Code / AgentController
→ cognition / turns / tool loop / local task mechanics

Mastra Workspace + E2B
→ filesystem/process/sandbox mechanics
```

Runtime self-report nunca escreve por si só:

```text
ActorRun terminal authority
Work Unit acceptedDelivery
Finding resolution
Change closure
```

Physical mapping de ActorRun para Mastra run/turn/session é 3H realization e pode não ser 1:1.

---

## 19. Proof obligations

Antes de considerar implementation conforme esta authority, 3N/implementation verification deve provar pelo menos:

1. two concurrent same-WU ActorRun admissions → exactly one non-terminal attempt admits;
2. second/different produced output identity on same ActorRun → refused;
3. same produced identity re-presented after ack-loss → idempotent read-back;
4. resolved content mismatch against recorded canonical identity → fail closed;
5. output presentation racing orphan terminalization, both orders → exactly one authority path wins;
6. orphan terminalization on run with durable output ref → refused; same output judgment resumes;
7. runtime lost with no durable output → explicit guarded FAILED can release WU for later attempt;
8. presumed-dead runtime returns after FAILED/CANCELLED → late output cannot gain authority;
9. delivery admission racing Change closure, both orders → no delivery mutates closed Change;
10. delivery admission racing revision/Finding/decomposition change → losing path re-evaluates/fails closed;
11. WU delivery → `ActorRun DELIVERED + acceptedDelivery` atomic;
12. second accepted delivery for same WU → refused;
13. ActorRun terminal rewrite (`FAILED→DELIVERED`, etc.) → refused;
14. cancel racing delivery, both orders → one write-once terminal wins;
15. post-cancel runtime output → cannot be presented/admitted;
16. same-WU retry after WU left current decomposition → refused;
17. mutation of admitted WU scope/sets/pins/fulfills → refused; successor WU required;
18. budget exhausted → new automatic attempt refused; no automatic WU/Change terminalization;
19. verifier `DELIVERED` → does not create WU acceptedDelivery or promote verdict/Evidence automatically;
20. role-appropriate produced output survives Hub restart and resumes judgment without invented ActorRun;
21. temporarily unavailable output custody → no invented delivery/terminal; recovery path remains possible;
22. new ActorRun while prior external effect is OUTCOME_UNKNOWN → local/non-effect work may proceed, ambiguous replay refused by Gateway;
23. typed handoff missing required information → delivery refused; transcript-only facts cannot become authority;
24. no `retryable`, WU FSM, lease or fourth terminal is required for any above control to fire.

Proof deve demonstrar o controle **firing**, não apenas happy path.

---

## 20. YAGNI / anti-overengineering closure

3G-03 adiciona:

```text
new durable record class  = 0
new Tier-2 FK             = 0
new atomicity class       = 0
new module/subsystem      = 0
new scheduler/queue       = 0
new lease/heartbeat fact  = 0
new public failure code   = 0
```

F1 não autoriza por esta decisão:

```text
WorkUnit status FSM
ActorRun generic FSM engine
fourth terminal for TIMEOUT/RUNTIME_LOST/SUPERSEDED/DELIVERY_REJECTED
persisted retryable flag
RetryEngine / retry scheduler
CandidateService / DeliveryQueue
UniversalOutput / UniversalDelivery / UniversalHandoff
same-WU best-of-N competing runs
winner-selection/arbitration framework
mutable Work Unit authority
mutable produced-output target
OBS-derived current presentation truth
lease/claim/fencing before multi-writer failure class
hard timeout/heartbeat architecture law
cross-owner Gateway effect-state transaction at Builder dispatch
lock held during Mastra/E2B/external I/O
synthetic Inception Change merely for lifecycle symmetry
```

Qualquer expansão volta pelo Decision Loop com current consumer/failure class real.

---

## 21. Later routing

Permanece posterior:

```text
PlanningDepth × RigorProfile exact algorithm             → later 3G / N3
Mastra ActorRun/session/workspace realization            → 3H
runtime liveness/orphan detection mechanics              → 3H/3M
fresh-session / sandbox recovery mechanics               → 3H/3M
Gateway effect_attempt full lifecycle                    → later 3G
OUTCOME_UNKNOWN reconciliation/custody recovery          → 3M
numeric budgets/timeouts/caps                            → calibration/eval
product stop/retry/progress labels                       → 3K
InceptionInvestigation pre-Change agent execution shape  → Decision Loop when realization proves need
end-to-end behavioral proof                              → 3N/3O
```

---

## 22. Reopen triggers

Reabrir 3G-03 somente com evidence material, por exemplo:

1. current consumer exige mais de uma accepted delivery por Work Unit sem representar honestamente successor work;
2. current result class não pode ser identificada por one exact canonical-content identity usando typed existing owner/mechanism;
3. `DELIVERED | FAILED | CANCELLED` perde informação necessária para consumer que não possa viver em typed reason/details;
4. derived Work Unit admissibility não consegue representar lifecycle real sem durable status fan-out;
5. same-WU single active attempt cria bottleneck material e consumer medido justifica competing attempts/winner arbitration;
6. multi-process/distributed Hub dispatch writers tornam per-Change serialization insuficiente sem lease/claim/fencing;
7. runtime/custody recovery prova que write-once output presentation não consegue recuperar honestamente same-attempt result;
8. InceptionInvestigation prova necessidade real de ActorRun pré-Change e não pode usar o work graph atual sem artificial semantics;
9. effect ambiguity exige Builder-owned effect authority para uma operação real, contradizendo Gateway ownership;
10. implementation evidence encontra race capaz de produzir duplicate active attempt, moving delivery, late authority after cancel/closure, or retry under stale decomposition.

Preferência de framework, nomenclatura, feature existente em Factory/Mitra/Mastra ou future optionality hipotética não reabre a decisão.

---

## 23. Decisão final ratificada

> **No Conexus F1, Work Unit é bounded work authority imutável, membro da current approved/admitted decomposition e sem durable FSM; ela aceita no máximo uma exact delivery. ActorRun é uma tentativa concreta do Builder work graph, com execution identity pinada, um exact role-appropriate produced output identity opcional e write-once, e uma terminal partition owner-local `DELIVERED | FAILED | CANCELLED`. Presentation do mesmo output é idempotent read-back; output diferente exige novo ActorRun; identity vive no canonical-content level e custody é recuperável separadamente. `DELIVERED` significa apenas que o Hub admitiu o output apropriado do run, nunca self-report, Change correctness ou automatic verifier verdict. Para WU execution, `ActorRun DELIVERED + WorkUnit acceptedDelivery` comitam atomicamente sob a per-Change serialization root. Crash sem output durável pode ser explicitamente terminalizado quando execution não está mais live/admissible; crash com output durável retoma julgamento do mesmo output e não pode ser orphan-failed. Same-WU retry é nova tentativa somente enquanto a Work Unit imutável continua current, sem delivery, na decomposição atual, com budgets/routes/dispatch gates admissíveis; mudança de scope/sets/pins/fulfills é successor Work Unit. Cancellation vence late runtime output, external-effect replay continua enforcement do Gateway, CodingSession/Mastra/E2B permanecem mechanics subordinadas, e F1 não cria WU FSM, RetryEngine, queue, lease, fourth terminal, UniversalOutput ou synthetic Inception Change por simetria.**