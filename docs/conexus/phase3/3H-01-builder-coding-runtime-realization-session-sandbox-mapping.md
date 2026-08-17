# 3H-01 — Builder Coding Runtime Realization & Session/Sandbox Mapping

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3H — Runtime & Agent Architecture  
**Authority:** primeira decisão aprovada de 3H  
**Importante:** esta decisão não constitui C-018, não encerra 3H nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, `CodingSession` é a lineage cognitiva/runtime durável e Builder-owned de um Change, realizada por um thread persistente do Mastra, zero ou mais incarnations efêmeras de `AgentController Session` e no máximo uma current write-capable Mastra Workspace/E2B lineage em execução serial; cada ActorRun reaplica current Conexus authority mecanicamente e admite uma source-lineage disposition imutável `FRESH_BASE | CONTINUE_LINEAGE`; runtime/session/thread/sandbox state nunca vira authority; scratch mutável só cruza ActorRun boundary sob admissão positiva explícita, continuidade física observada e quiescence; output exato só é apresentado ao Builder depois de entrar em custódia durável do Hub; cancellation truth precede physical interrupt; material verifier usa fresh cognition e fresh materialization do candidato exato; liveness/control permanece no `CodingRuntime`, recovery policy fica em 3M e a realização concreta Mastra/E2B fica sujeita a `CX-BUILDER-MASTRA-01` em 3L, sem novo workflow engine, queue, scheduler, lease, retry engine, checkpoint engine, provider framework ou mandatory E2B wrapper.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa, sem reabrir:

- 3A-R5 — Mastra Code / AgentController + Mastra Workspace + E2B como realization primária do Builder; persistent CodingSession por Change como default; fresh independent verifier session quando material; `Change != CodingSession != ActorRun != Sandbox`;
- 3C-05 — Builder owns Change, correctness contract, Work Unit, ActorRun, validation, Findings e closure; runtime strategy é interna;
- 3C-13 — Conexus IDs são correlation authority; Mastra/E2B/app telemetry é observational, nunca acceptance authority;
- 3D-R1 — `CodingRuntime` permanece o boundary de infraestrutura; direct-call-first; nenhum generic provider/workflow/scheduler boundary novo;
- 3E-01 / 3E-02 — `bld.coding_session` e `bld.actor_run` já existem; `mastra_builder` permanece substrate store isolado; nenhuma nova durable record class/FK é necessária;
- 3F-02 / 3F-R1 — runtime output é F5 producer ingress/proposal; producer propõe, owner julga/aplica; mechanism nunca redefine authority;
- 3G-02 — Builder authority mutations serializam pelo Change-owned root; nenhuma transação engloba Mastra/E2B/external I/O;
- 3G-03 — ActorRun é one concrete attempt, output presentation é exact/write-once, terminal facts são write-once e external-effect replay safety continua Gateway-owned;
- 3G-R1 — owner-local state spaces e ausência de generic workflow/state/retry engines.

Review/provenance não-autoritativa:

- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization.md`;
- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization-R2.md`;
- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization-R3.md`.

A decisão passou por dois rounds independentes/adversariais Fable e uma consolidação final ChatGPT, com verificação atual de Mastra/E2B via Context7 e fontes primárias quando load-bearing.

Convergência anterior à ratificação:

```text
Material Finding contra approved 3A–3G authority = NONE
reopen required                                  = NONE
Alternative D                                    = GLOBAL MAXIMUM
WT-B                                              = ADOPTED with explicit admission
new infrastructure                               = NONE
Overengineering finding                          = NONE
Buildability with current substrate               = CREDIBLE; 3L qualification still required
```

---

## 2. Escopo fechado

3H-01 decide somente a realization do Builder coding runtime necessária para:

```text
CodingSession ↔ Mastra thread/live Session mapping
Mastra Workspace / E2B sandbox scope
ActorRun ↔ runtime execution mapping
clean restart versus mid-run process loss
current-authority reintroduction on dispatch
source-lineage disposition FRESH_BASE | CONTINUE_LINEAGE
working-tree continuity without authority leakage
physical sandbox incarnation observability
quiescence before lineage reuse
output custody before Builder presentation
cancel / physical interrupt ordering
background-process default lifetime
fresh verifier runtime/materialization isolation
runtime liveness/control surface
Mastra/E2B/trace correlation and Builder-side F5 handoff
```

3H-01 não decide:

```text
Production Agent Runtime realization                         → 3H-02
cross-runtime isolation/correlation package closure          → later 3H
credential/API-key custody                                   → 3I
network/egress/security trust topology                       → 3I
physical process placement / worker counts                   → 3J
UI/progress/recovery presentation                            → 3K
exact Mastra/E2B versions/APIs                               → 3L
orphan timeout / recovery policy / custody repair            → 3M
parallel Builder / multi-lineage execution                   → Decision Loop on measured consumer
numeric time/token/cost calibration                          → implementation/eval
```

---

## 3. Target invariant and lifetime law

```text
Conexus owns:
meaning + identity + admission + current authority + output presentation + terminal truth.

Mastra/E2B own:
cognition/runtime/session/workspace/sandbox/process mechanics.

Runtime continuity
!= domain authority
!= permission
!= accepted output
!= correctness
!= Release truth.
```

Load-bearing lifetime separation:

```text
Change lifetime
!= CodingSession lifetime
!= AgentController live Session lifetime
!= ActorRun lifetime
!= Mastra run/turn lifetime
!= Mastra Workspace lifetime
!= E2B physical sandbox lifetime
```

Nenhuma runtime identity pode ser usada como substituto para `ChangeId`, `WorkUnitId`, `ActorRunId`, `CodingSessionId`, accepted delivery, correctness ou Release authority.

---

## 4. CodingSession realization law

`bld.coding_session` é a durable Builder-owned identity para uma admitted cognitive/runtime lineage dentro de um Change.

Realization normal:

```text
CodingSession
→ one stored Mastra thread as persistent cognitive substrate
→ zero or more ephemeral AgentController live-Session incarnations
→ one current write-capable sandbox lineage when implementation execution is admitted
```

Portanto:

```text
CodingSession
!= AgentController Session
!= Mastra thread
!= Mastra run/turn
!= Mastra Workspace
!= E2B sandbox
```

O stored Mastra thread é runtime ref/context substrate. `CodingSession` é domain identity.

### 4.1 Clean process restart

Se nenhum ActorRun está ativo, perda/restart do AgentController process não cria automaticamente nova CodingSession.

```text
recreate controller
→ recreate/rebind live Session to exact stored thread
→ reapply current runtime configuration from Conexus authority
→ continue same CodingSession when still admissible
```

### 4.2 Mid-ActorRun process loss

F1 não promete transparent resume de um ActorRun após perda do live AgentController process.

```text
process loss during ActorRun
→ no implicit replay/resurrection of same execution episode
→ Builder liveness/orphan path applies
→ 3G-03 guarded terminalization remains authority
→ later successor ActorRun only if currently admissible
```

Exact liveness detection e recovery policy ficam em 3M/implementation.

---

## 5. AgentController live-session state nunca carrega authority

Conexus não persiste/restaura serialized live-session state como fonte de authority.

Isso inclui, como aplicável:

```text
live permission/grant state
pending Mastra approval state
pending suspension state
run/stream state
mode/model residue
arbitrary session state
```

Restart/rebind significa:

```text
persistent cognitive thread
+
current Conexus authority mechanically reapplied
```

Nunca:

```text
old serialized live Session
→ restored as authority
```

### 5.1 Load-bearing runtime config é aplicada incondicionalmente

A cada ActorRun dispatch/rebind, Builder aplica mecanicamente current values através da runtime API, sem confiar em persisted thread settings.

Load-bearing set inclui, conforme aplicável:

```text
model pin
provider pin
reasoning/runtime pin
mode
permission/tool surface
Observational Memory = OFF baseline
subagent model selection
```

Não usar `read old value → if different maybe override` para authority-bearing settings.

Prompt/context restatement transporta conhecimento; runtime configuration mecânica transporta execution authority.

---

## 6. Every ActorRun reintroduces current authority

Persistent cognition pode carregar facts antigos. Por isso todo ActorRun recebe novo current dispatch context do Builder.

Applicable facts incluem:

```text
ActorRun identity
Work Unit / role authority
current contract revision / semantic pins
scope / readSet / writeSet / effectSet when applicable
model/provider/runtime pins
approved tool surface
budget/correlation facts
source-lineage disposition
expected runtime/sandbox refs when load-bearing
```

Law:

```text
stored thread says X
current admitted ActorRun says Y
→ Y wins mechanically
```

Runtime history nunca vira permission ou current semantic authority.

---

## 7. Mastra Workspace / write-capable lineage scope

Workspace/sandbox execution scope é determinado pela CodingSession e imposto pelo Hub/runtime realization.

F1 serial congela somente:

> one implementation CodingSession owns at most one current write-capable sandbox lineage.

Current substrate evidence favorece per-session Mastra Workspace override/instance; exact API permanece 3L.

Não nasce `SandboxPool`, `WorkspaceRegistry`, generic provider framework ou multi-lineage scheduler.

---

## 8. Logical sandbox identity != physical incarnation

```text
Mastra logical sandbox id
!= E2B physical sandboxId
!= continuity proof
```

Pause/resume pode preservar a mesma physical incarnation. Lost/dead sandbox pode ser recriada sob o mesmo logical id.

Para write-capable execution, `CodingRuntime` deve conseguir:

```text
observe current physical sandboxId
bind ActorRun execution to observed sandboxId
compare expected/observed incarnation at required control points
```

Incapacidade de observar a physical incarnation é base insuficiente para continuidade.

### 8.1 Runtime refs são expectations para re-verificação

Todo runtime ref armazenado em `bld.*` é correlation/history fact e expectation a ser confrontada com live observation; nunca current-runtime authority.

Inclui, como aplicável:

```text
Mastra thread ref
logical sandbox ref
last-verified physical sandboxId
Mastra run ref
provider runtime ref
```

### 8.2 Silent recreation não pode sustentar falsa continuidade

A realization deve atribuir write-capable execution a uma physical incarnation com força suficiente para que:

> após uma unacknowledged physical-incarnation change, nenhuma segunda write-capable operation seja admitida sob a falsa suposição de continuidade.

Binding-time observation + pre/post operation comparison é realization plausível atual; exact check placement/frequency fica 3L.

### 8.3 Narrow wrapper trigger

Não construir custom E2B wrapper por simetria.

```text
incarnation attribution proven with available observation surface
→ no wrapper

completed write-capable operation cannot be attributed reliably
→ smallest narrow guard/wrapper that surfaces/fences recreation
```

Esse é trigger falsificável de 3L.

---

## 9. ActorRun source-lineage disposition

Todo write-capable ActorRun possui uma disposition imutável na admission:

```text
FRESH_BASE
CONTINUE_LINEAGE
```

Exact field name é implementation detail; o semantic fact é obrigatório porque `continuity conditions pass` não é equivalente a `Builder admitted continuity`.

No third `PARTIAL_RESET` mode.

### 9.1 FRESH_BASE

`FRESH_BASE` começa de exact Builder-admitted base/candidate identity e não herda predecessor mutable scratch.

Fresh physical VM não é requisito quando a existing sandbox pode ser safely reset/materialized ao exact base.

### 9.2 CONTINUE_LINEAGE

Permite reuse de non-authoritative scratch somente sob explicit Builder admission.

Required positive gates incluem, conforme aplicável:

```text
current authority / contract / decomposition compatibility
same Work Unit or admitted successor-WU compatibility
positive admitted evidence that FAILED predecessor is continuity-compatible, if FAILED
explicit applicable-authority admission, if predecessor CANCELLED
physical-incarnation continuity verified
quiescence established
no material contamination evidence
```

Scratch permanece non-authoritative.

### 9.3 FAILED asymmetry

`FAILED` sozinho não autoriza continuidade.

```text
FAILED + known admitted compatible basis → CONTINUE_LINEAGE may be admitted
FAILED + unknown/orphan basis            → FRESH_BASE
```

Post-hoc `probably transient` não é evidence.

Nenhum cause/retry policy engine é criado.

### 9.4 CANCELLED asymmetry

```text
CANCELLED predecessor
→ CONTINUE_LINEAGE requires explicit applicable-authority admission
→ otherwise FRESH_BASE
```

Cancellation também pode justificar fresh cognitive CodingSession pelos triggers de 3A-R5, mas não automaticamente.

### 9.5 Disposition é imutável; binding failure não degrada silenciosamente

Se `CONTINUE_LINEAGE` foi admitted e depois physical binding mostra:

```text
sandboxId mismatch
quiescence failure
continuity no longer observable
material contamination
```

então o ActorRun não continua silenciosamente como `FRESH_BASE`.

```text
CONTINUE_LINEAGE cannot be realized
→ abort admission if execution not begun, or terminalize current ActorRun with typed basis
→ later successor ActorRun may be admitted as FRESH_BASE
```

Isso preserva truthful immutable dispatch history.

---

## 10. WT-B — working-tree continuity sem authority leakage

Adotar:

> non-authoritative scratch may survive across ActorRuns when continuity is explicitly admitted; canonical truth and deciding proof never derive from scratch survival.

Rejeitar WT-A `always clean base per ActorRun`: ActorRun é attempt/audit boundary, não canonical Work Unit byte/commit boundary; forced reset em toda tentativa destrói measured/preserved continuity sem fechar failure classes que já exigem clean proof anchor.

Inherited environment pode conter:

```text
node_modules
build caches
untracked/generated files
process state
environment mutation
other scratch
```

Tudo continua non-authoritative.

Material proof/verification deve ser anchored/reconciled against exact candidate identity e clean/reproducible verification controls; dirty local pass sozinho nunca é deciding correctness Evidence.

---

## 11. Quiescence é precondition de CONTINUE_LINEAGE

```text
terminal predecessor ActorRun
+
successor CONTINUE_LINEAGE
→ no unknown predecessor-owned activity capable of mutating reused tree
```

Quiescence pertence a 3H como property + dispatch-gate placement. Recovery policy repetida fica 3M.

Tracked-process kill sozinho não prova quiescence.

Qualified basis deve cobrir as surfaces existentes no qualified template, inclusive:

```text
tracked background processes
untracked/self-daemonized processes
live process table / sandbox-level inspection
deferred execution capable of later mutation
  cron / at / systemd timers / equivalent qualified-template facilities
```

```text
quiescence proven       → reuse may continue if all other gates pass
quiescence not provable → reset/recreate/quarantine; no continued write authority
```

No lease/fencing subsystem in serial F1.

Threat boundary: quiescence protege provenance contra **accidental residual writers**. Malicious guest tentando derrotar inspection pertence a sandbox isolation, verification e 3I trust/security; não justificar recreate-always paranoia sem threat model correspondente.

---

## 12. Output custody before presentation

Runtime completion não é Builder delivery.

Exact output X só pode ser apresentado ao Builder quando o content já for durably resolvable fora de disposable sandbox/runtime state.

```text
runtime produces X
→ transfer/establish Hub-side durable custody resolving X
→ verify content/identity binding
→ then, or atomically with custody establishment, record producedOutputRef = X
```

Se bytes/content não podem ser custody-verified, presentation é refused.

Typed mechanism pode usar SHARE bundle / Git / CAS-equivalent Hub-owned storage sob existing authority. Não criar universal Candidate/Delivery entity.

`producedOutputRef` permanece exact e write-once. Depois da durable presentation, crash pode retomar judgment do mesmo X sem rerun do agente.

---

## 13. Cancellation / physical interrupt / background processes

Normative order:

```text
Builder commits ActorRun CANCELLED
→ best-effort physical abort/interruption
→ terminate/inspect ActorRun-owned processes as applicable
→ late runtime output cannot regain authority
```

Falha de physical abort não reabre ActorRun. Late output é telemetry/quarantine only.

Default background-process ownership:

```text
agent-spawned background process
→ ActorRun-owned
```

Pode viver por vários model/tool turns dentro do mesmo ActorRun; não ganha CodingSession lifetime automaticamente.

Future session-owned persistent preview/server exige concrete consumer + Decision Loop. No ProcessRegistry/SessionDaemon now.

---

## 14. Fresh verifier realization

Material verifier precisa de duas independências.

### 14.1 Cognitive independence

Use fresh verifier CodingSession/live Session/thread, sem implementer transcript/session state.

### 14.2 Mutable-workspace independence

Material verifier não executa dentro do implementer's live mutable workspace.

Quando execução é necessária:

```text
exact candidate X under Hub custody
→ fresh materialization of X in independent execution environment
→ verifier report binds X
```

Pure non-executing/read-only verification pode não precisar sandbox.

Proof target:

```text
verifier report binds exact X
+
verifier materialization cannot mutate implementer live lineage
+
Builder verifies judged/delivered content still resolves to X
```

Shared dependency/build cache é optimization de 3L somente se não reintroduzir shared mutable candidate state.

---

## 15. CodingRuntime capability surface

A realization deve expor mechanics suficientes para owner-side control e 3M recovery reasoning, como aplicável:

```text
create/rebind live coding session to exact persistent thread
resolve CodingSession-scoped Mastra Workspace
send/continue runtime work
abort active run
observe runtime run ref
observe logical sandbox ref
observe current physical sandboxId for write-capable execution
enumerate/terminate runtime-tracked processes
inspect sufficient sandbox/process/deferred-execution state for quiescence, or fail closed
obtain runtime/trace correlation refs
observe enough liveness/reconnect information for 3M orphan/recovery judgment
```

Exact method/interface names ficam implementation/3L.

No generic `LivenessService`, heartbeat FSM ou lease table.

---

## 16. Observability and F5 handoff

Conexus IDs continuam domain/correlation authority:

```text
ChangeId / WorkUnitId / ActorRunId / CodingSessionId
→ authoritative domain correlation

Mastra thread/run/session refs
E2B logical/physical refs
trace/span/tool/PID/provider refs
→ runtime correlation / telemetry
```

Mastra `complete` / `agent_end` ou equivalente é `PROVIDER_OBSERVED`, não ActorRun terminal/delivery fact.

No second runtime event ontology/status mirror.

Builder-side F5 realization:

```text
runtime proposes exact output X
→ custody/identity checks
→ Builder admits write-once producedOutputRef X
→ existing Builder delivery judgment follows
```

No `UniversalRuntimeResult`, CandidateService, runtime-handoff ledger ou universal delivery record.

---

## 17. 3H versus 3M

3H decide:

```text
what runtime can be observed/controlled
what must be pinned/reverified
what continuity assumptions are admissible
what must fail closed
```

3M decide:

```text
when a run is declared orphaned/lost
numeric timeout / waiting policy
which terminal reason/calibration follows
how missing/corrupt custody is repaired
operator/reconciliation path
repeated quiescence/reconnect failure policy
```

Nenhum numeric timeout faz parte de 3H-01.

---

## 18. Technology qualification obligations — CX-BUILDER-MASTRA-01

3H-01 não qualifica versão; define o que 3L precisa falsificar e demonstrar firing.

```text
P1  stored thread/messages survive clean controller recreation
P2  live AgentController session/run/grant state is not required for Builder authority
P3  exact current model/tool/permission config overrides poisoned stale thread settings mechanically
P4  clean controller restart rebinds exact thread without creating new CodingSession by default
P5  physical E2B sandboxId remains stable across ordinary pause/resume
P6  recreation under same logical sandbox id produces detectable new physical sandboxId
P7  write-capable ActorRun binds physical sandboxId before write execution
P8  dead-sandbox-mid-command path cannot silently continue authoritative lineage after reincarnation
P9  CONTINUE_LINEAGE is refused when physical continuity is unknown
P10 CONTINUE_LINEAGE is refused when quiescence cannot be established
P11 self-daemonized/untracked predecessor process causes quiescence control to fire
P12 FAILED predecessor with admitted continuity-compatible evidence may continue scratch under explicit dispatch fact
P13 FAILED predecessor whose delivery/scope failure implicates scratch does not inherit by terminal status alone
P14 CANCELLED predecessor cannot default to CONTINUE_LINEAGE
P15 Hub-side durable custody X exists before producedOutputRef X commits
P16 sandbox loss after producedOutputRef X does not prevent same-X Builder judgment
P17 custody unavailable/transient-only output causes presentation refusal
P18 cancel commits first; late runtime output cannot gain presentation/delivery authority
P19 material verifier does not execute in implementer live mutable workspace
P20 verifier mutation attempt cannot change judged candidate identity X or implementer lineage
P21 same CodingSession can span multiple ActorRuns/Work Units without making runtime state authority
P22 material semantic revision can force fresh CodingSession while sandbox mechanics remain independently reusable/resettable
P23 runtime complete observation cannot set ActorRun DELIVERED
P24 output presentation/delivery remains recoverable without runtime-status mirrors or CandidateService
P25 dirty inherited workspace pass that clean X would falsify is detected at verifier/compose/canonical proof anchor
P26 planted deferred execution from terminal predecessor causes quiescence gate to fire
P27 poisoned thread with stale model/provider, OM re-enabled and stale subagent selection is mechanically overridden
P28 admitted CONTINUE_LINEAGE whose final binding gates fail never silently executes as FRESH_BASE
P29 completed write-capable operation is attributable to physical incarnation; ambiguity triggers narrow-wrapper requirement
```

Qualification failure reabre primeiro substrate/realization choice, não domain semantics automaticamente.

---

## 19. Explicitly not built by 3H-01

```text
new module                          = 0
new durable record class            = 0
new Tier-2 FK                       = 0
new workflow engine                 = 0
new shared scheduler                = 0
new queue                           = 0
new retry engine                    = 0
new lease/fencing subsystem         = 0
new checkpoint engine               = 0
new generic runtime registry        = 0
new provider framework              = 0
new SandboxPool                     = 0
new ProcessRegistry                 = 0
new Candidate/Delivery service      = 0
mandatory E2B wrapper               = 0 unless P29 proves it necessary
sandbox snapshot manager            = 0
parallel Builder execution          = 0
best-of-N                           = 0
Observational Memory                = OFF baseline
```

---

## 20. Deferred ownership

### 3I

```text
credential/provider/E2B key custody
network/egress policy
server-side capability expiry enforcement
malicious-guest trust boundary
approver/cancel eligibility
```

### 3J

```text
same/separate physical processes
auto-pause / timeout / cost tuning
worker counts / supervision
shutdown topology
```

### 3K

```text
progress/recovery labels
cancel UX
technical drill-down
```

### 3L

```text
exact Mastra/E2B versions/APIs
incarnation attribution mechanism
per-session Workspace realization
LSP/mount/resolver constraints
cache sharing
quiescence inspection implementation
deferred-execution surface inventory
narrow-wrapper trigger
```

### 3M

```text
orphan detection policy / numeric timeout
lost sandbox/session recovery
repeated quiescence failure policy
missing/corrupt custody recovery
terminal reason/calibration
operator reconciliation
```

---

## 21. Alternatives

### A — CodingSession = AgentController live Session

**REJECT.** Builder identity ficaria acoplada a process-local state e clean restart deixaria semantic identity dependente de uptime.

### B — serialize/restore full AgentController live-session state

**REJECT.** Ressuscita stale authority, cria hard coupling a internals do vendor e pseudo checkpoint/session engine.

### C — fresh cognitive session + fresh sandbox per ActorRun

**REJECT.** Simplifica localmente, mas destrói a persistent-cognition value ratificada em 3A-R5 e não elimina custody/verifier/delivery concerns.

### D — durable CodingSession + persistent thread + explicit lineage admission + observable E2B incarnation

**ADOPT / GLOBAL MAXIMUM.** Preserva essential continuity mantendo authority/proof/terminal truth fora do substrate.

### E — heavy custom runtime/E2B wrapper from day one

**REJECT / DEFER.** Current failure classes pedem observability + fail-closed law, não provider framework. Narrow wrapper só nasce se P29 provar necessidade.

---

## 22. Reopen triggers

Reabrir 3H-01 somente diante de evidence como:

```text
Mastra cannot rebind persistent cognitive context without live Session becoming authority
Mastra cannot mechanically accept current runtime config at dispatch
E2B physical incarnation cannot be observed/attributed even with narrow guard
qualified sandbox cannot provide safe reset/recreate path
Hub-side exact-output custody requires materially different architecture
fresh verifier isolation is infeasible at acceptable cost
measured F1 needs parallel/multi-lineage semantics serial design cannot satisfy
```

Framework preference, symmetry ou hypothetical optionality não são reopen triggers.

---

## 23. Consequências e próxima decisão

3H-01 resolve o Builder side de:

```text
ActorRun / CodingSession / AgentController mapping
Mastra Workspace / E2B lineage semantics
physical sandbox incarnation observability
working-tree continuity admission
quiescence placement
Builder-side F5 output custody/handoff
fresh verifier runtime/materialization isolation
CodingRuntime liveness/control capability surface
```

Continuam abertos para fases posteriores:

```text
Production Agent Runtime suspend/resume/checkpoint/schedule realization → 3H-02
cross-runtime isolation/correlation package closure                    → later 3H
exact substrate qualification                                           → 3L
orphan/recovery policy                                                   → 3M
security/credential/egress                                               → 3I
physical deployment topology                                             → 3J
```

**Próxima decisão:** `3H-02 — Production Agent Runtime Realization`.

3H permanece **IN PROGRESS**. Esta decisão não autoriza implementação do produto.