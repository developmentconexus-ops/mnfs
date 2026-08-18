# 3A-R9 — Managed Job / Deterministic Sync Dispatch Reconciliation

**Status:** APPROVED pelo operador em 2026-08-18  
**Fase:** 3A — Architecture Reconciliation contínua  
**Natureza:** bounded Decision Loop / reconciliation disparada por 3K-03  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra 3K nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

O primeiro consumidor real de `job/v1` no Conexus F1 é a sincronização recorrente do read model analítico do primeiro vertical. O desenho aprovado **não cria plataforma genérica de automação, SchedulerModule, JobModule, Workflow DSL ou runtime de código arbitrário no Hub**: `job/v1` continua artefato Project-scoped versionado, `Managed Application Runtime` continua owner do lifecycle operacional, `mar.job_run` continua o único record durável de ocorrência, e a primeira realization admitida é um **sync capability-driven** que coordena apenas capabilities governadas via Gateway. O schedule efetivo é composição pinada pela Release e a fila/scheduler é projeção mecânica reconstruível; a nova surface explícita `MANAGED_JOB` fecha o caller-context gap do Gateway sem criar nova authority.

---

## 1. Outcome

O trigger condicional de 3A-R6 foi disparado por 3K-03:

```text
3K-03 first vertical
→ derived analytical read model required
→ recurring governed sync required
→ job/v1 Decision Loop = FIRED
```

Resultado:

```text
existing job artifact model                  = CONFIRMED
existing Managed Application Runtime owner   = CONFIRMED
existing mar.job_run durable record          = CONFIRMED
existing C-006 ETL pattern                   = CONFIRMED

missing surface-specific Gateway caller      = VALID GAP
recurring schedule authority                 = VALID COMPOSITION GAP
arbitrary privileged Project job code        = REJECT F1
workflow/scheduler product                    = REJECT F1

new Hub module                               = 0
new durable record class                     = 0
new database/schema                          = 0
new generic queue/scheduler domain           = 0
prior phase structural reopen                = NONE
outcome                                      = CURRENT STRUCTURE CONFIRMED
                                               + bounded composition correction
```

---

## 2. Authority e precedência

3A-R9 materializa, sem reabrir ownership já fechado:

- C-005 — `job` é artifact kind Project-scoped, git-first, revision-pinned, inputSchema-validado, async/status/stop e version-locking;
- C-006 — quando sync é exigido, ETL usa cursor/watermark + overlap + pagination + staging + upsert, cursor só avança após merge, com cursor contract e delete policy por entidade;
- C-007 — Connector declara operations/capabilities reais, effects/idempotency/pagination/sync quando aplicável; credentials e external I/O continuam Gateway-governed;
- C-012 — truth/provenance/freshness/coverage chegam ao frontend por contracts, não inferência da UI;
- C-013 — operational execution, telemetry e Evidence não se confundem com acceptance/business truth;
- C-014 — ReleaseManifest é composition root; runtime usa exact pinned composition e promotion/serving authority permanece Release-owned;
- 3A-R6 — `job/v1` era CONDITIONAL MUST DECIDE se o primeiro vertical exigisse mirror/sync;
- 3A-R8 — Project Baseline é spec-anchored e guarda a necessidade de produto; realization mecânica não deve virar Project-level doctrine;
- 3C-15 — Managed Application Runtime owns `job/v1` operational lifecycle e job executa capabilities via Gateway;
- 3D-02 — Gateway usa caller contexts surface-specific e revalida authority revogável no last mile;
- 3D-04 — `job/v1` permanece internal machinery do MAR, sem novo módulo/scheduler boundary;
- 3E-02 — `mar.job_run` já é o record durável aprovado; queue/scheduler substrate é seam interno e não domain authority;
- 3G owner-local lifecycle laws — retries/cancel/terminal truth não podem criar UniversalState/RetryEngine;
- 3I — jobs não ganham credentials/secrets/broad authority por conveniência;
- 3J — primeira instalação continua um Hub process; job machinery não implica novo deployment unit;
- 3K-02 — UI deve distinguir execução, freshness, partial data e verification;
- 3K-03 — primeiro vertical usa Project analytical read model com source-anchored proof.

3A-R9 é a authority resultante para o bounded `job/v1` trigger do primeiro vertical.

---

## 3. Root cause

Sem esta reconciliação, três atalhos plausíveis poderiam reintroduzir as classes de falha que o Conexus já removeu:

```text
1. "job = arbitrary TS no Hub"
→ Project-authored code recebe poder implícito sobre network/DB/secrets/process
→ Capability Gateway deixa de ser enforcement boundary real

2. "scheduler row = current truth"
→ Release diz uma composição, scheduler mantém outra
→ segunda authority mutável de produção

3. "cada tick vira trabalho obrigatório"
→ downtime/overlap gera backlog artificial
→ sync de estado vira workflow calendar engine sem necessidade
```

Target invariant:

> **Recurring managed work may reuse shared scheduling/queue mechanics, but its production meaning, exact revision, authority and allowed effects remain derived from existing Project/Release/artifact/Gateway owners. Mechanism never becomes a second authority.**

---

## 4. `job/v1` permanece artifact, não domínio novo

O artifact continua Project-scoped e git-first:

```text
Project repo
└── job/v1 artifact
      ↓ compile/deploy
Artifact Registry
      ↓ exact revision pin
ReleaseManifest
      ↓ active managed composition
Managed Application Runtime
      ↓
mar.job_run
```

Não criar:

```text
JobModule
SchedulerModule
AutomationModule
WorkflowModule
JobDefinition domain parallel to Artifact Registry
JobSchedule current-state table
GenericTrigger for jobs
```

O Registry continua owner de artifact identity/revision; MAR continua owner da execução operacional; Release continua owner da composição ativa.

---

## 5. Primeiro execution profile: sync only, sem novo registry kind

O primeiro consumidor comprovado exige sincronização, não computação arbitrária.

Portanto F1 admite inicialmente uma **realization profile de sync** para `job/v1`.

Isso NÃO cria:

```text
kind = sync-job
JobExecutorType registry
configurable executor framework
workflow DSL
```

É apenas a restrição da primeira realização:

> **um managed sync job coordena operações/capabilities já governadas; ele não recebe uma sandbox genérica ou um processo Node privilegiado para executar código Project-authored arbitrário.**

Primeiro shape semântico necessário:

```text
source operation(s)
target merge/write capability
cursor contract
overlap/pagination semantics
delete policy where applicable
entity/slice selection
validated input
```

A representação exata em arquivo/schema pertence ao post-C-018 Realization Planning, desde que preserve esta semântica.

---

## 6. No arbitrary privileged code inside the Hub

F1 rejeita como baseline:

```text
Project-authored job code
→ arbitrary process.env
→ raw filesystem
→ raw network/fetch
→ direct Project DB credential
→ direct Connection credential
→ CredentialBackend
→ Hub internals
```

O motivo não é incapacidade do modelo. É authority:

```text
reviewed code
!=
privileged platform authority
```

Um futuro background workload que realmente exija arbitrary code, Python, browser, media processing ou similar retorna ao Decision Loop e pode justificar sandbox/runtime dedicado. O primeiro sync não é evidência suficiente para construir isso agora.

---

## 7. Capability-driven execution

O managed job pode coordenar, mas todo acesso material passa pela capability owner já aprovada.

Conceitualmente:

```text
Managed Sync Job
├── source read
│    → Capability Gateway
│    → exact Integration Operation / Connector revision / Connection revision
│
├── Project write/merge
│    → Capability Gateway
│    → exact Project action/write capability
│
└── progress
     → MAR job_run + Project-owned sync_state where C-006 requires it
```

Logo:

```text
job orchestration
!=
capability execution authority
```

Credentials continuam fora do job; external I/O continua Gateway-controlled; DB role continua selecionada pela capability/executor class já aprovada.

---

## 8. Bounded amendment — `MANAGED_JOB` Gateway surface

3D-02 tornou caller contexts surface-specific, mas sua lista nominal anterior não explicitou o caller já exigido por 3C-15.

3A-R9 torna explícita a surface:

```text
MANAGED_JOB
```

Sem novo módulo ou owner.

Contexto semântico deriva server-side de:

```text
JobRunRef
ProjectRef
environment
exact ReleaseRef / ReleaseManifest
exact Job ArtifactRevision
validated input / occurrence identity
correlation identity
```

O caller não escolhe:

```text
"latest" Release
arbitrary Project
arbitrary Connection
arbitrary artifact revision
arbitrary target environment
```

Gateway deriva/valida a composição pinada e revalida fatos revogáveis/materialmente atuais segundo sua authority normal.

`MANAGED_JOB` não exige sessão humana viva por construção. Isso não reduz I&A/Project/Connection/Release/Gateway checks aplicáveis ao caller server-side.

---

## 9. Schedule authority = Release composition

Não nasce `JobSchedule` como current authority paralela.

O requisito de produto vive no Project Baseline, por exemplo:

```text
budget analytical data freshness <= product-defined target
```

A realization concreta de execução recorrente vive na composição versionada/pinada do job/Release, por exemplo um fixed interval suficiente para o requisito.

Regra:

```text
Project Baseline
→ product freshness/recurrence requirement

job artifact/config + exact Release
→ admitted realization of that requirement

scheduler/queue row/timer
→ derived mechanics only
```

Editar scheduler substrate não altera authority da Release.

Se o substrate for perdido:

```text
current durable Release/job authority
→ reconstruct desired recurring mechanics
```

Nunca:

```text
scheduler says X
→ therefore X is production authority
```

---

## 10. Production activation and deactivation

Recurring production occurrence só pode nascer da exact managed composition que esteja atualmente apta a gerar trabalho.

Baseline F1:

```text
active exact Release
+
managed runtime admissible
+
SERVED_VERIFIED
→ future recurring occurrences may be admitted
```

Durante promotion:

```text
old Release leaves current production composition
→ does not generate new future occurrences

new Release pointer exists but not yet SERVED_VERIFIED
→ fail closed for new recurring occurrences

new Release SERVED_VERIFIED
→ recurring projection may activate for future occurrences
```

Isso evita trabalho de uma composição ainda não provada como servida.

In-flight run já admitido permanece pinado à Release/revision com que iniciou.

---

## 11. Version locking

Cada `job_run` preserva exact execution identity suficiente para responder:

> **qual composição e qual job revision executaram esta ocorrência?**

Semantic minimum:

```text
Project
managed environment
exact ReleaseRef / manifest identity
exact Job ArtifactRevision
trigger class: SCHEDULED | MANUAL
stable occurrence identity when scheduled
validated input identity/digest when load-bearing
timing/correlation
terminal outcome
```

Nomes de coluna e DTOs ficam para realization.

Regra:

```text
run started under R17 / job v4
+ R18 becomes active
→ current run remains R17 / v4
```

Retry da mesma ocorrência também preserva os exact pins já admitidos; não resolve latest no retry.

---

## 12. Fixed interval + manual only in F1

Primeiro consumidor precisa de freshness periódica e operação manual de recuperação/primeira carga, não de calendário universal.

F1 admite:

```text
MANUAL
FIXED_INTERVAL
```

Não congela/implementa por default:

```text
cron grammar
weekday calendars
business-day rules
holiday calendars
arbitrary timezone calendars
RRULE engine
event-triggered generic jobs
```

Primeiro consumidor real dessas semânticas retorna ao Decision Loop.

Exact interval numérico é calibration/Project configuration, não architecture law.

---

## 13. Single-flight and overlap law

Para o primeiro sync, a unidade lógica de exclusão é semanticamente:

```text
Project
+ managed environment
+ logical job identity
```

F1 garante no máximo uma execução ativa dessa unidade.

Quando um fixed-interval occurrence chega enquanto a execução anterior ainda está ativa:

```text
new tick
→ does not create execution backlog
→ SKIP/COALESCE semantics
```

A próxima admissible occurrence continua a partir do estado durável do sync.

Motivo:

- C-006 já exige cursor + overlap + replay-safe merge;
- o consumidor quer estado razoavelmente fresco, não fidelidade histórica de cada tick;
- backlog de slots seria complexidade acidental.

Não nasce generic concurrency-policy engine.

---

## 14. Downtime / catch-up

Se o Hub/scheduler ficar indisponível durante N intervals, recovery NÃO materializa N historical ticks.

Ao retomar:

```text
recurring job still required by current served Release
+ no active run
+ sync is behind current freshness target
→ admit at most one catch-up occurrence
```

O cursor/overlap de C-006 recupera a data range necessária.

Logo:

```text
missed 24 intervals
-X-> enqueue 24 syncs

missed 24 intervals
→ one catch-up run
```

Esse behavior pertence ao sync profile. Outro futuro job pode ter semântica diferente e retorna ao Decision Loop.

---

## 15. Durable-before-execution

Nenhum trabalho físico começa sem `mar.job_run` durável correspondente.

```text
intended occurrence/manual request
→ validate current authority/composition
→ persist exact job_run pins
→ make execution discoverable/enqueueable
→ physical execution
```

Nunca:

```text
queue fires
→ performs work
→ job_run written afterwards
```

A propriedade requerida é:

> **não existir execução sem JobRun durável, nem JobRun admitido que possa ser perdido para sempre por uma janela persist→enqueue não reconciliável.**

A realization preferida pode usar transação Postgres compartilhada com o queue substrate se o substrate pinado provar essa propriedade. Caso contrário, 3L/Realization deve provar um mecanismo equivalente mínimo; isso NÃO autoriza outbox/dispatcher framework por antecipação.

---

## 16. Stable occurrence identity / dedup

Scheduled occurrence recebe identidade estável antes da execução, suficiente para deduplicar restart/race do mesmo intended slot.

Regra:

```text
same logical scheduled occurrence
→ at most one admitted JobRun identity
```

A fórmula exata de key/id, timezone instant representation e constraint pertencem à realization.

A occurrence identity é dedupe/admission identity, não business event authority.

---

## 17. Retry

`job/v1` possuir retry machinery não transforma todo trabalho do job em replay-safe.

Para o primeiro sync, bounded automatic retry é admissível porque o data path deve preservar:

```text
cursor advances only after successful merge
staging + upsert
stable source identity
cursor overlap
connector-specific delete/cursor contract
```

Exact retry count/backoff/timeouts são calibration.

Regras:

```text
retry same job occurrence
→ exact Release/job pins preserved

job retry
-X-> bypass Gateway idempotency/effect rules

future effectful job
-X-> inherits sync retry semantics automatically
```

Qualquer external effect continua sujeito a Gateway-owned effect attempt/idempotency/OUTCOME_UNKNOWN semantics.

---

## 18. Timeout, partial progress and sync truth

Job terminal outcome e data freshness são authorities distintas.

```text
job_run
→ o que aconteceu com a execução

sync_state
→ até onde cada source/entity progrediu

source/Evidence
→ se o dado suporta o claim apresentado
```

Portanto:

```text
JOB SUCCEEDED
!= data verified correct

JOB FAILED
!= no data changed
```

Exemplo permitido:

```text
customers      synced/current
salespeople    synced/current
budgets        failed/stale

job_run        FAILED
```

Timeout não avança cursor não-mergeado e nunca converte unknown/partial em success.

Não se exige rollback artificial de entidades já corretamente sincronizadas antes da falha.

---

## 19. Minimal lifecycle semantics

3A-R9 não cria mega-FSM. `mar.job_run` precisa preservar fatos suficientes para representar pelo menos semanticamente:

```text
QUEUED
RUNNING
SUCCEEDED
FAILED
CANCEL_REQUESTED
CANCELLED
```

Exact enum/columns/transitions podem ser realizados por facts/derived predicates conforme padrões de 3G; os labels acima não exigem universal state engine.

`TIMEOUT` pode ser terminal reason/classification de failure em vez de novo lifecycle state.

Retry attempt internals não exigem novo durable `JobAttempt` record no F1 salvo prova posterior de necessidade.

---

## 20. Cancellation

Cancel segue a ordem de autoridade já usada pelo Conexus:

```text
cancel intent/current owner guard commits
→ no new retry/admission
→ best-effort interrupt/cancel in queue/runtime
→ terminal settlement
```

Physical interrupt success/failure não reescreve retroativamente o fato de cancel request.

Se external I/O já ocorreu, seu outcome continua pertencendo à capability/Gateway evidence e nunca é apagado pelo cancel do job.

---

## 21. Manual execution

O primeiro vertical pode oferecer `Sync now`/equivalente sem segundo código path.

```text
Data / Integrations control-plane action
→ current authority check
→ same exact job artifact/revision under active Release
→ mar.job_run trigger = MANUAL
```

Manual run usa o mesmo input contract, Gateway capabilities, sync semantics, Evidence e truth laws.

Manual execução não concede arbitrary parameters/capabilities fora do artifact/inputSchema ativo.

---

## 22. Preview/candidate boundary

F1 não ativa recurring timers automaticamente para cada Preview/candidate.

```text
active PROD/MANAGED Release
→ recurring schedule projection

Build/Preview/candidate
→ explicit/manual candidate execution only when required for verification
```

Isso evita abandoned preview gerando trabalho periódico e Connection traffic sem consumidor.

Candidate job execution, quando necessária, continua sob Builder/Candidate authority e não cria production `MANAGED_JOB` schedule.

---

## 23. Project archive composition

3G-07 preserva:

```text
ARCHIVE
!= UNPUBLISH
!= STOP
```

Portanto um Project arquivado que ainda possui active served Release não perde seu recurring managed job implicitamente.

```text
Project ARCHIVED
+ active served Release remains admissible
→ existing recurring job behavior may continue
```

Parar recurring work exige uma mutation/serving/config path explícita já owned por authorities apropriadas; archive nunca esconde esse efeito.

---

## 24. Product surfaces

3A-R9 não cria aba `Jobs` no F1.

A verdade relevante ao operador aparece no resource/context local definido por 3K-01/02/03:

### Data

```text
last successful refresh
source as-of
coverage
current / stale / partial / failed truth
Sync now when authorized
```

### Integrations

```text
source/Connection identity
last source contact
qualification/health where owner-derived
refresh relationship/status
```

### Activity

```text
sync started/completed/failed/cancelled
relevant causal timeline
details/Evidence drill-down
```

Internal queue, lease, retry and occurrence details aparecem somente em diagnostic drill-down quando úteis.

---

## 25. `CX-MANAGED-JOB-01` qualification obligation

3A-R9 adiciona ao 3L critical path um probe bounded de managed job mechanics, nome conceitual:

```text
CX-MANAGED-JOB-01
```

O probe deve falsificar/provar no substrate pinado, no mínimo:

```text
1. fixed interval produces expected occurrence
2. JobRun durable identity exists before physical execution
3. persist→enqueue/recovery has no irrecoverable lost-work window
4. same occurrence dedupes after restart/race
5. single-flight blocks/coalesces overlap
6. downtime yields one catch-up, not N-slot backlog
7. timeout settles honestly without unmerged cursor advance
8. retry preserves exact Release + job revision pins
9. cancel prevents new retry/admission and interrupts best-effort
10. scheduler projection can be reconstructed from durable Release/job authority
11. old Release cannot generate future scheduled runs after promotion handoff
12. new Release recurring work does not start before its admitted serving state
13. `MANAGED_JOB` Gateway context cannot widen Project/Release/Connection/artifact authority
```

O probe testa mechanism properties; não prova Sankhya business correctness, ETL semantics específicas ou UI.

Material failure:

```text
→ reopen smallest implicated realization/substrate assumption
→ do not automatically reopen Project/Connector/job domain ownership
```

---

## 26. Explicit non-goals / anti-overengineering

3A-R9 rejeita/defer no F1 atual:

```text
JobModule
SchedulerModule
AutomationModule
WorkflowEngine / Workflow DSL
Generic JobExecutor registry
arbitrary Project-authored privileged Node/TS runtime in Hub
arbitrary Python/background-code runtime
cron grammar
RRULE/calendar engine
business-day/holiday scheduler
EVENT-triggered generic managed jobs
parallel job orchestration
DAG/steps/conditionals/map/parallel workflow language
generic concurrency-policy engine
per-tick historical backlog for sync
JobSchedule authority table
JobAttempt durable record by default
outbox/dispatcher framework solely for queue atomicity before substrate proof
Temporal/Inngest/Kafka/Kubernetes solely for recurring sync
new queue infrastructure while existing Postgres-backed machinery can qualify
Jobs top-level product area
```

Future capability enters only on named real consumer/failure class and DevelopmentConexus Decision Loop.

---

## 27. Amendments / clarifications

### 27.1 3D-02 bounded amendment

Adicionar semanticamente `MANAGED_JOB` à família de caller surfaces do Capability Gateway.

Isso não muda dependências do Gateway, não cria reverse import e não faz MAR internals virarem Gateway authority.

### 27.2 3C-15 clarification

`job/v1 operational execution lifecycle` owned pelo MAR inclui reconstrução/realização de recurring mechanics derivada da exact active served Release, sem ownership de schedule business/product intent.

### 27.3 3E-02 clarification

`mar.job_run` já é suficiente como durable occurrence record para o first sync. Scheduler/queue rows são substrate mechanics/reconstructible state; nenhum novo current-authority record é aprovado.

### 27.4 C-006 / C-007 preservation

O sync executor reutiliza o ETL invariant de C-006 e Connector sync/cursor/delete semantics de C-007. 3A-R9 não cria universal ERP data model, universal sync DSL ou provider-specific law no core.

---

## 28. Proof strategy

Antes da implementação, a arquitetura deve poder ser falsificada por pelo menos estes counterexamples:

```text
CE-1: Project-authored job consegue raw network/DB secret fora do Gateway
→ FAIL

CE-2: scheduler row continua gerando R17 depois que R18 assumiu produção
→ FAIL

CE-3: same scheduled occurrence cria dois JobRuns sob restart race
→ FAIL

CE-4: Hub fica 6h offline e volta enfileirando todos os slots perdidos do sync
→ FAIL

CE-5: retry resolve latest artifact/Release em vez dos exact admitted pins
→ FAIL

CE-6: run falha depois de sync parcial e UI conclui "nenhum dado mudou"
→ FAIL

CE-7: job SUCCESS é usado como prova de business correctness sem source Evidence
→ FAIL

CE-8: Project archive silenciosamente interrompe recurring work apesar de Release servida permanecer ativa
→ FAIL

CE-9: persistiu JobRun mas crash pré-enqueue torna trabalho permanentemente perdido sem reconciliação
→ FAIL

CE-10: MANAGED_JOB caller escolhe Connection/Project/Release por payload não confiável
→ FAIL
```

3L prova substrate behavior; 3N/3O provam composição end-to-end e absence of duplicate authority.

---

## 29. Reopen triggers

Reabrir apenas quando evidência material demonstrar necessidade de uma classe nova, por exemplo:

- primeiro background workload que exige arbitrary code/isolated compute;
- primeiro recurring consumer que exige cron/calendário/RRULE real;
- primeiro job cuja fidelidade de cada missed occurrence é business requirement;
- primeiro real parallel job consumer cuja serial/single-flight baseline não atende;
- substrate selecionado não consegue realizar durable-before-execution/recovery sem nova machinery;
- effectful job expõe failure class não coberta pelas atuais Gateway semantics;
- DEDICATED runtime exige managed-job contract distinto;
- runtime topology muda de forma que schedule reconstruction/lease ownership exija nova authority.

Preferência, estética ou existência de feature equivalente em framework não são reopen trigger.

---

## 30. Consequências para o first vertical

O Analisador de Orçamentos pode agora assumir no Project Baseline/vertical proof:

```text
read-only analytical app
→ derived analytical Project read model
→ sync maintained by managed job
→ external/source reads through Gateway
→ Project merge/write through governed capability
→ source-anchored verification remains separate
→ Data/Integrations/Activity expose user-relevant freshness and failure truth
```

Mas os detalhes abaixo permanecem Project/Realization-specific:

```text
exact interval
exact source operations
exact entities/tables
exact pagination size
exact cursor columns/watermark
exact overlap duration
exact retry/backoff numeric values
exact UI copy/components
exact queue library APIs
exact SQL/TS implementation
```

---

## 31. Final verdict

```text
job/v1 conditional trigger                         = RESOLVED FOR FIRST VERTICAL
first execution profile                           = governed sync only
Managed Application Runtime owner                 = PRESERVED
mar.job_run durable record                        = PRESERVED / SUFFICIENT
Gateway surface                                   = MANAGED_JOB ADDED (bounded)
schedule authority                                = exact active served Release composition
scheduler/queue                                   = derived/reconstructible mechanics
manual + fixed interval                           = F1
single-flight + coalesce                          = F1
one catch-up after downtime                       = F1
arbitrary privileged Project job code             = REJECT F1
workflow/automation/scheduler domain               = REJECT F1
new module                                         = 0
new durable record class                           = 0
new database/schema                                = 0
new workflow engine                                = 0
CX-MANAGED-JOB-01                                  = MUST QUALIFY in 3L
prior structural phase reopen                      = NONE
outcome                                            = CURRENT STRUCTURE CONFIRMED
                                                     + bounded correction
```

Implementation permanece proibida até C-018 + post-C-018 Realization Planning aceito.
