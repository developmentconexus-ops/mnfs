---
id: DOC-PRODUCT-BLUEPRINT-08
title: Estado, Recovery, Reconcile, Concorrência e Tolerância a Falhas
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
  - product blueprint section 8
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-07
tracking_issue: 6
---

## ARR-RECONCILIATION-2026-08-07 — Current Recovery semantics

This reconciliation block has precedence over older realization-specific wording in this section. Any conflicting tool-specific statement below is historical realization context, not current constitutional authority.

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
- um worktree desaparece;
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
- Treehouse;
- processos;
- Pi sessions;
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

Treehouse:
worktree não encontrado
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
| Mission lifecycle | MNFS/SQLite | CLI, Pi, futura UI |
| Approved Contract | SQLite + artefato versionado | Pi, Git, Lavish |
| Code tree | Git | MNFS, Worker |
| Worktree físico | Treehouse + Git | filesystem, MNFS |
| Lease semântico | MNFS/SQLite | Treehouse |
| Process existence | sistema operacional | Pi, Herdr |
| Worker Run state | MNFS/SQLite | process adapter, Pi events, Herdr |
| Claim state | MNFS/SQLite | Worker, CLI |
| Receipt | MNFS/SQLite + artifact | runner |
| Terminal presentation | Herdr | Operator |
| Visual feedback | Lavish até ser consumido | Pi, MNFS |
| Decision | MNFS/SQLite + artefato quando necessário | Operator, Lead |
| Integration candidate | Git + MNFS Integration Run | CI, QA |
| Evidence artifact | artifact store + hash | Git quando promovido |
| Quality Posture | MNFS aggregation | docs/dashboard |

## 8.3.1 Pi Session Ledger e memória observacional

O arquivo JSONL da Pi Session é o histórico exato daquele processo conversacional.

Uma memória observacional é uma projeção comprimida e probabilística sobre esse histórico.

```text
Pi JSONL source entries
→ histórico exato da Session

Observations / Reflections
→ projeção auxiliar e source-backed quando suportado

SQLite / Approved Contract
→ estado autoritativo atual
```

Uma Session completamente nova recupera a Mission por SQLite, Approved Contract, Current Authority Snapshot e Handoff Pack. Ela não depende de Observational Memory existir.

## 8.3.2 Transporte não é durabilidade

Process stdin, Pi queue, WebSocket ou terminal messaging podem entregar ou despertar Actors.

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

## 8.4.4 Worktree é preservável

Worktree representa trabalho físico.

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

- Treehouse;
- Git;
- processo Pi;
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
Treehouse get
        ↓
path e lease_id observados
        ↓
validar worktree
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

Worktrees isolam arquivos.

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
- espera Pi;
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
- Pi lifecycle event;
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
- Treehouse state;
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

SQLite Lease ativo, worktree ausente.

### LD-02

Worktree MNFS existe, Lease ausente.

### LD-03

External lease_id não corresponde.

### LD-04

Holder incorreto.

### LD-05

Path não é worktree real.

## 8.17.2 Git divergence

### GD-01

HEAD diferente do expected base.

### GD-02

Branch ausente.

### GD-03

Worktree dirty inesperadamente.

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
- worktree é válido;
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
| Lease REQUESTED | sem worktree | request incompleto | retry ou cancel |
| Lease REQUESTED | worktree correspondente | órfão adotável | validate + adopt |
| Lease ACTIVE | worktree existe | healthy | nenhuma |
| Lease ACTIVE | worktree ausente | divergence | block dispatch |
| sem Lease | worktree MNFS existe | orphan | inspect/preserve |
| Worker STARTING | processo existe | observe boot | aguardar/inspect |
| Worker STARTING | processo ausente | start failed | retry/new Run |
| Worker RUNNING | processo existe | healthy | nenhuma |
| Worker RUNNING | processo ausente | LOST candidate | reconcile |
| Worker EXITED | Claim ausente | incomplete | resume/correct |
| Claim COMPLETED | Receipts ausentes | awaiting verification | run gates |
| Claim ACCEPTED | tree mudou | stale acceptance | revoke/block |
| Track ACCEPTED | não integrada | awaiting integration | queue |
| Track INTEGRATED | worktree existe | cleanup pending | preserve/release |
| Track RELEASED | worktree existe | cleanup divergence | fenced cleanup |
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

Código permanece no worktree.

Recovery:

- Worktree diff;
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
- worktree trust.

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

Dois worktrees podem usar o mesmo:

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
- pode manter worktree;
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
- worktrees;
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

- released worktrees;
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
but its Treehouse worktree is missing.

Affected:
MIS-002/M02/F01
WT-004

Safe actions:
1. mark Lease DIVERGED and recreate worktree
2. inspect Treehouse manually

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

- worktree preservado;
- Attempt permanece recuperável.

### DR-03 — Duplicate lease grant

- apenas um Lease ativo.

### DR-04 — Orphan worktree

- detectado;
- não destruído silenciosamente.

### DR-05 — Lease without worktree

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

- Pi;
- Treehouse;
- processos;
- filesystem;
- fresh Lead process.

---

# 8.32 M2 recovery slice

M2 deve provar:

```text
one Lead
→ Lease
→ Pi Worker
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
- Treehouse adapter;
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
- custom worktree pool;
- automatic destructive repair;
- invisible background cleanup;
- retry infinito;
- “self-healing” que oculta divergence.

---

# 8.34 Invariantes de estado e recovery

1. SQLite é autoridade operacional local.
2. Git é autoridade sobre code tree.
3. Treehouse é autoridade física do pool.
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
17. Worktree não é removido com trabalho não classificado.
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

> **O MNFS mantém estado operacional autoritativo em SQLite e reconcilia esse estado com Git, Treehouse, processos, Pi sessions, artifacts e ambientes externos. Operações locais usam transactions; efeitos externos usam Intent–Action–Observation, idempotência, optimistic concurrency, fencing e reconcile. Sessions e processos são substituíveis; worktrees e evidências são preservados; resultados atrasados não sobrescrevem Attempts atuais; divergências permanecem explícitas. Recovery é um produto verificável por drills, não a reconstrução de transcripts nem uma promessa genérica de self-healing.**

---

---
