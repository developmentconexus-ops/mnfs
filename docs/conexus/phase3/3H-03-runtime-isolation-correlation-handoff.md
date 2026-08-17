# 3H-03 — Runtime Isolation, Correlation & Handoff

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3H — Runtime & Agent Architecture  
**Authority:** terceira decisão aprovada de 3H  
**Importante:** esta decisão não constitui C-018, não encerra 3H nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, Builder e Production Agent Runtime executam em **Mastra instances distintas e role-bound**, com persistent stores e PubSub/runtime namespaces separados, podendo coabitar o mesmo processo somente enquanto a qualification provar que qualquer state process-global habilitado permanece mecanicamente particionado; Conexus owner IDs continuam os anchors duráveis de correlação através de `0..N` trace segments, OpenTelemetry é plumbing observacional e nunca authority, RequestContext efetivo é reconstruído e **substituído por inteiro** a partir de owner facts em todo dispatch/resume, F5 control handoff permanece owner-bound/typed e separado de Operational Telemetry, e Verification Observability correlaciona Hub/Mastra/E2B/app-under-test preservando `producer_trust`, sem permitir que runtime, trace, provider ou guest observation manufacture domain truth.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa a realização cross-runtime já preparada por:

- 3C-13 — Observability & Audit;
- 3D-R1 — Dependency Architecture;
- 3E-01 / 3E-02 — persistence ownership e `mastra_builder != mastra_par`;
- 3F-02 / 3F-R1 — F5 proposal/observation semantics e correlation traits;
- 3G-R1 — owner-local lifecycle/terminal truth;
- 3H-01 — Builder Coding Runtime Realization;
- 3H-02 — Production Agent Runtime Realization.

Review/provenance não-autoritativa:

- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff.md`;
- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff-R2.md`;
- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff-R3.md`.

O diálogo incluiu dois rounds independentes com Fable, fresh source review de Mastra/E2B/OpenTelemetry/Spotlight e uma consolidação final. Convergência:

```text
Material Finding contra approved authority = NONE
reopen required                            = NONE
Alternative A                              = GLOBAL MAXIMUM
mandatory Builder/PAR process split        = NOT JUSTIFIED
3H-04                                      = NOT JUSTIFIED
new infrastructure                         = NONE
```

---

## 2. Escopo exato de 3H-03

3H-03 decide quatro famílias:

```text
A. Builder ↔ PAR runtime-role isolation
B. Conexus IDs ↔ runtime/trace/provider correlation
C. runtime → owner F5 control handoff
D. Verification Observability cross-layer realization
```

Não decide:

```text
credential custody / egress / principal authorization     → 3I
production process/container placement                     → 3J salvo split trigger material
collector/backend topology                                 → 3J/3L
retention/redaction/PII                                    → 3I/3J
orphan/lost-run settlement                                 → 3M
trace/debug UX                                             → 3K
exact Mastra/E2B/OTel versions                             → 3L
architecture-wide proof                                    → 3N/3O
```

---

## 3. Target invariant

```text
runtime role isolation
+
Conexus-domain-first correlation
+
owner-control F5 handoff
+
Operational Telemetry / Verification Observability
```

devem compor sem permitir que:

```text
runtime mutable state
trace context
RequestContext
telemetry
provider state
transport metadata
```

virem product authority.

Portanto:

```text
Conexus owner identity / pins / terminal facts
!= Mastra runtime identity / state
!= OTel trace/span identity
!= E2B provider observation
!= guest/app telemetry
```

---

## 4. Runtime-role isolation baseline

F1 usa duas role-specific Mastra instances:

```text
Builder role
├── BuilderMastra
├── mastra_builder persistent store
├── Builder-local PubSub/runtime namespace
├── Builder-only AgentController/coding agents/tools/workspaces
└── Builder observability role identity

PAR role
├── ParMastra
├── mastra_par persistent store
├── PAR-local PubSub/runtime namespace
├── PAR-only RuntimeAgentProjection/Product tools/schedules/memory
└── PAR observability role identity
```

Mesmo processo é permitido; mesma mutable runtime namespace não.

### 4.1 Proibido compartilhar entre roles

```text
same mutable Mastra storage
same same-process PubSub instance
same external PubSub namespace/keyPrefix
same Agent object instance
same mutable Memory instance
same Builder Workspace/toolset in PAR
standalone/ephemeral governed Agent execution
```

Isso não cria RuntimeRegistry, PubSub abstraction própria ou novo module.

---

## 5. Por que PubSub é parte do isolation contract

Current Mastra source possui runtime machinery process-global para thread/stream e um module-default PubSub. O mutable thread/run state relevante é particionado por PubSub identity.

A propriedade normativa é:

```text
same-process Builder/PAR
→ distinct PubSub instances

shared external broker
→ distinct per-role namespace/keyPrefix além de clients distintos
```

O exact provider, object construction e key spelling ficam 3L/implementation.

### 5.1 Default-PubSub fallback não pode receber governed role work

Um attached governed runtime deve resolver sua própria role PubSub.

Qualification deve provar:

```text
full Builder + PAR exercise set
→ zero role events land in module-default PubSub bucket
```

Se um enabled path cair no default bucket e não puder ser fenced mecanicamente, isso é isolation Finding.

---

## 6. Governed execution exige role-attached persistent runtime

Builder/PAR governed execution não pode depender de standalone Agent / ephemeral Mastra fallback.

F1 exige:

```text
governed run
→ role Mastra instance
→ explicitly configured persistent store
→ role PubSub
→ role registry/tool/memory configuration
```

Role instance que caiu no in-memory storage fallback não serve governed runs.

Motivo: standalone/ephemeral state pode aparentar funcionar até uma suspensão/restart e então desaparecer, quebrando durable waits e recovery semantics.

A property é normativa; o exact startup assertion fica 3L/implementation.

---

## 7. Same-process é permitido; process split é condition-triggered

Não congelar microservice/process split por estética.

Separate process/container passa a ser obrigatório apenas se `CX-RUNTIME-ISOLATION-01` provar que uma **enabled F1 capability** possui process-global mutable state com reachable cross-role failure class que não pode ser particionado/fenced pela role-specific instance boundary.

Triggers positivos incluem:

```text
module-global mutable registry altera execution/tools/permissions across roles
thread/run state não pode ser isolado por role-local PubSub
hook/broadcast influencia runtime da outra role sem guard confiável
role-specific storage/config não pode ser escolhido independentemente
uma role pode resolver/mutar Agent/Controller/Memory da outra via framework global state
```

Não são triggers por si só:

```text
OTel SDK global
AsyncLocalStorage tracing context
immutable singleton/constants
constructor holder
same Node process
```

Physical topology permanece 3J.

---

## 8. Process-global capabilities atualmente encontradas

A source review encontrou exemplos reais que justificam qualification contínua:

### Enabled/current-path relevant

```text
AgentThreadStreamRuntime / defaultAgentThreadPubSub
→ allowed only with role-safe PubSub partition + negative probes

Mastra evaluation/scorer module-level hooks
→ observational/eval tooling; owner-token/broadcast behavior must not influence other role execution

OTel global SDK / LoggerProvider when Bridge is used
→ observability plumbing; role identity must remain mechanical per signal
```

### Deferred/eval-gated capabilities

```text
Durable Agent globalRunRegistry
Observational Memory activeOps process-global registry
```

Como `createDurableAgent()` e Observational Memory estão fora do enabled F1 baseline, não forçam split agora.

Ao serem habilitados por consumidor real:

```text
re-run same-process multi-role isolation qualification
→ smallest guard if sufficient
→ process split only if unpartitionable
```

---

## 9. Correlation anchors

Durable Conexus identities permanecem os anchors:

```text
Builder:
ChangeId
CodingSessionId
WorkUnitId
ActorRunId
exact candidate/output identity

PAR:
AgentRunId
ConversationId quando aplicável
ApprovalRequestId quando aplicável
AgentTrigger + occurrence identity quando aplicável

Gateway/Release/etc:
owner-specific durable ids/pins already frozen
```

Runtime refs permanecem observacionais:

```text
traceId / spanId
Mastra run/thread/toolCall refs
E2B physical sandboxId / process refs
provider request ids
app/browser/request/error refs
```

---

## 10. Domain-run lifetime != trace lifetime

Uma domain execution pode atravessar:

```text
0 traces
1 trace
N traces
```

por restart, suspend/resume, process move, sampling/degradation ou transport boundaries.

Exemplo:

```text
AgentRun A17
├── Trace T1 → suspend
└── Trace T2 → resume after restart
```

continua sendo `AgentRun A17`.

Trace continuity loss é observability boundary, não domain-run boundary.

Nenhum `traceId` pode substituir `ActorRunId`/`AgentRunId` ou vice-versa.

---

## 11. OpenTelemetry boundary

OTel permanece a preferred vendor-neutral technical boundary para traces/logs/metrics.

Conexus não inventa custom tracing protocol.

Mas:

```text
OTel context != authority
OtelBridge != correctness dependency
one perfect distributed trace tree != correctness dependency
```

Current `OtelBridge` é experimental; pode ser qualificado em 3L.

Mesmo sem Bridge, multiple trace segments ligados pelos Conexus owner IDs satisfazem a arquitetura.

---

## 12. Runtime-role attribution em telemetry

Toda runtime observation precisa ser atribuível mecanicamente à role correta.

```text
Builder signal → role=BUILDER (ou equivalente)
PAR signal     → role=PAR (ou equivalente)
```

Realization:

- com per-role exporter/provider, resource/service identity pode distinguir roles;
- com shared global OTel SDK/LoggerProvider, **cada span/log relevante** precisa de per-signal role attribute porque process resource identity pode ser comum.

Não inferir role apenas por:

```text
PID
port
container name
backend destino
```

Exact field/service names ficam 3L.

---

## 13. RequestContext é runtime plumbing, não authority

Mastra RequestContext pode persistir com workflow/suspend mechanics.

Logo, proibição textual de stale authority não basta.

Em todo Builder dispatch/rebind e PAR dispatch/resume:

```text
current/pinned owner facts
→ build NEW role-specific effective RequestContext
→ apply load-bearing runtime configuration mechanically
→ REPLACE WHOLE the restored/effective runtime context
→ only then execute/resume
```

### 13.1 Replace-whole, nunca merge

```text
snapshot context
+
owner keys overlay
-X-> effective context
```

porque unknown stale keys sobreviveriam.

Snapshot-carried context pode ser mantido separado para diagnostics/correlation residue, mas não participa do effective resumed context salvo explicitamente reconstruído a partir de owner facts.

### 13.2 Nunca ressuscitar via snapshot

```text
current permissions
role eligibility
current revocation
current binding authority
approval authority
current trigger/schedule authority
tool/model surface além do admitted/pinned composition
```

---

## 14. OTel baggage

Conexus owner IDs não usam OTel Baggage por default.

Motivo:

- baggage pode ser automaticamente propagado para outbound requests;
- pode atravessar third-party boundaries;
- não possui built-in integrity que prove a origem do item.

Owner IDs podem aparecer, quando policy permitir, em:

```text
server-stamped RequestContext
trace/span attributes
log attributes
resource metadata
```

Future baggage use exige decisão explícita 3I incluindo egress stripping/redaction/trust semantics.

Trace context também permanece correlation mechanics, nunca authority.

---

## 15. Metrics cardinality law

High-cardinality durable IDs não viram default metric dimensions:

```text
ActorRunId
AgentRunId
ChangeId
ConversationId
ProjectId
traceId
spanId
```

podem existir em traces/logs e lookup/correlation records, mas metric labels default devem usar bounded dimensions.

Exact metric vocabulary fica 3L/implementation.

---

## 16. F5 control handoff é separado de Operational Telemetry

Runtime possui dois outbound paths semanticamente diferentes:

```text
A. owner-control F5 proposal
B. Operational Telemetry observation
```

Nunca reconstruir control truth de telemetry depois do fato.

```text
runtime emits complete trace
-X-> owner terminal fact
```

Control transition requer owner-specific typed proposal/handler e owner guard/application.

---

## 17. F1 F5 transport baseline

Quando runtime e owner estão co-located:

```text
runtime
→ narrow typed in-process callback/function
→ owner validates current facts
→ owner records transition
```

Não criar:

```text
RuntimeBus
EventBus
UniversalRuntimeResult
RuntimeEnvelope
queue
outbox genérico
handoff ledger genérico
```

por optionality.

Future process split pode usar narrow HTTP/RPC/request-reply mantendo a mesma semântica.

Queue/outbox só se torna justificável se aparecer uma concrete proposal whose correctness requires durable delivery and the proposal cannot be deterministically re-derived/replayed from existing owner/runtime facts.

---

## 18. F5 run identity deriva do owner dispatch context

In-process callback não confia no run identity fornecido pelo producer payload.

```text
owner dispatches run A
→ dispatch-scoped closure/opaque handle binds A
→ callback arrives
→ effective target = A
```

Producer payload id é cross-check apenas.

```text
closure/handle identity != payload identity
→ refuse proposal
→ diagnostic/finding as applicable
→ never terminalize another run
```

Future out-of-process equivalent usa authenticated/admitted transport context; trust mechanics ficam 3I/3J.

---

## 19. Duplicate/lost-response F5 remains owner-safe

Existing owner laws continuam suficientes:

Builder:

```text
producedOutputRef / exact candidate custody / presentation guards
→ duplicate callback cannot create a second different authoritative output
```

PAR:

```text
terminal write-once + current owner guards
→ duplicate complete callback cannot manufacture a new terminal transition
```

Transport ACK continua diferente de domain application.

No outbox é requerido para estes current F5 producers.

---

## 20. Producer provenance

3H-03 não cria outra trust taxonomy.

Usa as classes de 3C-13:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

Observation sources são mapeadas para essas classes; source/producer identity detalha o produtor dentro da classe.

Baseline:

```text
Hub owner/audit facts          → HUB_AUTHORITY
Gateway receipt/effect facts   → GATEWAY_AUTHORITY
Mastra runtime observation     → PROVIDER_OBSERVED-class runtime observation
E2B provider/platform evidence → PROVIDER_OBSERVED
app-under-test / guest OTel     → GUEST_OBSERVED
```

A exact versioned mapping/catalog fica implementation/3L.

---

## 21. Verification Observability — composição

Material verification pode correlacionar:

```text
exact Hub facts / candidate identity
+
Mastra agent/model/tool/runtime observations
+
E2B provider observations
+
app-under-test/browser/backend telemetry
+
Gateway authority receipts quando effect verification exigir
```

sempre preservando provenance/trust.

Nenhuma fonte observacional sozinha ganha correctness authority.

---

## 22. E2B provider evidence — dual path

Current E2B possui duas capabilities relevantes:

### 22.1 Platform-side pull anchored by physical sandboxId

```text
Builder has verified physical sandboxId
→ platform queries provider metrics/logs for exact sandbox
→ summarize per run under existing C-013 semantics
```

É o minimum mechanically attributable provider-observation path para exact Builder ActorRun association.

### 22.2 OTLP push enrichment

Current E2B também documenta OTLP HTTP/protobuf export de metrics/logs.

Mas:

```text
delivery = best effort
availability = configuration/onboarding dependent
current documented push contract does not freeze a per-sandbox identity attribute
```

Logo:

```text
E2B OTLP push
→ ADOPTABLE Operational Telemetry enrichment
→ PROVIDER_OBSERVED
→ never sole deciding evidence path
```

3L pode qualificar versão futura mais forte sem alterar o domínio.

---

## 23. Verification capture policy

Ordinary telemetry pode ser sampled/degraded conforme 3C-13.

Mas se uma material verification assertion declara runtime evidence como required:

```text
that exact verification execution
→ capture policy must preserve required evidence class
```

Randomly sampled-away required evidence não vira PASS.

```text
required evidence missing
→ NOT_PROVEN / INCONCLUSIVE
```

Não exige always-on 100% telemetry global.

---

## 24. App-under-test instrumentation remains GUEST_OBSERVED

App-under-test telemetry é extremamente útil para:

```text
browser exception
failed API call
server exception
async failure
latency/fan-out
runtime behavior
```

mas permanece `GUEST_OBSERVED` porque pode ser alterada pelo candidate/implementer.

Preferir instrumentation/collector/launch seams mais difíceis de remover silenciosamente, conforme 3C-13, sem transformar guest signal em Hub authority.

---

## 25. Spotlight

Spotlight permanece challenger/reference para local Verification Observability UX:

```text
errors
logs
traces
MCP access for coding/verification agents
```

Não fica obrigatório:

```text
Sentry SDK
Spotlight desktop
MCP
Sentry backend
```

A architecture property continua tool/vendor-neutral.

---

## 26. MastraStorageExporter

Mastra-native trace storage pode ser útil para Studio/dev diagnostics.

Mas não pode ser o único Conexus telemetry integration path porque:

```text
Conexus modules -X-> query mastra_builder / mastra_par tables directly
```

OBS recebe/exporta/projeta telemetry pela qualified observability boundary.

No hidden cross-read de vendor tables.

---

## 27. Degradation semantics

Ordinary Operational Telemetry export failure:

```text
→ telemetry degraded/MISSING
→ domain execution may continue unless another approved audit/verification invariant says otherwise
```

Audit-required operations seguem 3C-13 fail-closed rules.

Verification-required missing evidence segue `NOT_PROVEN/INCONCLUSIVE`.

Não confundir as três classes.

---

## 28. Technology qualification — `CX-RUNTIME-ISOLATION-01`

3H-03 adiciona um package de qualification cross-runtime; pode ser realizado dentro de 3L junto dos probes Builder/PAR existentes.

Minimum controls devem demonstrar firing:

```text
P1  BuilderMastra uses mastra_builder and ParMastra uses mastra_par
P2  Builder registry cannot resolve PAR Product Agent/schedule/memory and vice versa
P3  Builder coding/shell/E2B tool surface absent from PAR Product tools
P4  same-process role instances keep mutable storage/Agent/Memory objects distinct
P5  enabled Mastra process-global facilities cannot influence the other role execution
P6  same-process distinct PubSub instances produce disjoint thread/suspend/signal state
P7  same PubSub instance negative fixture is rejected by qualification/wiring guard
P8  module-default PubSub canary receives zero governed role events
P9  shared external broker, if used, uses distinct per-role namespace/keyPrefix and no cross-role delivery
P10 governed Product/Builder run cannot execute through standalone/ephemeral Mastra fallback
P11 role instance without explicit persistent storage refuses governed runs
P12 poisoned restored RequestContext is replaced whole; unknown stale keys disappear
P13 stale context cannot select permission/tool/model/binding/approval authority on resume
P14 one ActorRun/AgentRun continues across restart with fresh trace segment and same durable owner identity
P15 external/guest forged owner IDs/trace metadata do not change owner correlation truth
P16 Conexus owner IDs do not leak through OTel baggage on outbound third-party request
P17 shared global OTel SDK mode mechanically carries role identity on every relevant span/log
P18 direct typed F5 callback binds target by owner dispatch closure/handle
P19 mis-wired payload run ID is refused and cannot terminalize another run
P20 duplicate Builder/PAR runtime callbacks remain owner-idempotent/write-once safe
P21 telemetry complete without F5 proposal cannot set owner terminal truth
P22 F5 proposal without telemetry still reaches owner truth if valid
P23 telemetry exporter failure does not block ordinary domain execution
P24 required verification evidence sampled/missing → NOT_PROVEN/INCONCLUSIVE, not PASS
P25 app-under-test telemetry remains GUEST_OBSERVED under forged authority fields
P26 E2B pull by pinned physical sandboxId yields exact provider-side per-run observation when provider data is available
P27 E2B OTLP push, if configured, is enrichment; outage/drop degrades honestly and does not break exact pull anchor
P28 high-cardinality Conexus IDs are not default metric dimensions
P29 MastraStorageExporter data is not queried cross-schema by Conexus OBS
P30 enabling any previously-deferred process-global Mastra capability re-runs cross-role qualification before same-process admission
```

Exact versions/commands/configuration are 3L.

---

## 29. Split trigger

If qualification finds:

```text
cross-role mutable bleed
+
load-bearing enabled F1 capability
+
no smallest reliable role/instance partition
```

then:

```text
same-process = REJECTED for that qualified topology
→ 3J must physically split Builder/PAR process boundary
```

Isso não cria automaticamente microservice protocol/bus; narrow transport remains preferred.

---

## 30. No-build / YAGNI

3H-03 não cria:

```text
new module
new durable record class
new Tier-2 FK
RuntimeBus
EventBus
UniversalRuntimeEvent
UniversalF5Envelope
custom tracing protocol
shared RuntimeRegistry
ProcessRegistry
queue
outbox genérico
lease/fencing subsystem
mandatory OTel Collector
mandatory Sentry/Spotlight/backend
mandatory Builder/PAR process split
mandatory OtelBridge
mandatory E2B OTLP push
high-cardinality metrics strategy
3H-04
```

---

## 31. Reopen triggers

Reabrir 3H-03 apenas por Material Finding, por exemplo:

```text
pinned Mastra version has enabled process-global state that defeats role partition
role-local PubSub/store/instance cannot isolate current Builder/PAR mechanics
standalone/ephemeral fallback cannot be mechanically prevented for governed runs
runtime→owner proposal cannot be bound to owner dispatch identity without new durable handoff semantics
future process split introduces a proposal that is not re-derivable and requires durable transport/outbox
OTel/observability realization cannot preserve runtime role/provenance without becoming authority
Verification Observability cannot bind exact candidate/run to deciding evidence through any qualified path
```

Não reabrir por:

```text
framework preference
"microservices are safer"
"OTel SDK is global"
Spotlight/Sentry UI convenience
new Mastra feature merely existing
future Kafka/Temporal speculation
```

---

## 32. Final consistency

```text
3C-13 → OBS continua observation/history, nunca current domain authority
3D-R1 → direct-call-first; no bus/mediator added
3E      → mastra_builder / mastra_par stay isolated; no vendor-table cross-read
3F      → F5 remains typed owner-specific proposal/observation semantics
3G      → owner terminal/write-once laws remain sovereign
3H-01   → Builder exact runtime/candidate custody unchanged
3H-02   → PAR Release-pinned Agent realization/guarded resume unchanged
```

Nenhuma contradição encontrada.

---

## 33. Outcome

```text
Material Finding contra approved authority = NONE
reopen required                            = NONE
Alternative A                              = GLOBAL MAXIMUM
Mastra isolation                           = instance + persistent store + PubSub + role-bound runtime
same-process Builder/PAR                   = ALLOWED after qualification
mandatory process split                    = ONLY on unpartitionable enabled global mutable state
correlation                                = durable Conexus IDs; runtime/trace refs observational
trace lifetime                             = 0..N per domain run
RequestContext                             = REBUILD + REPLACE WHOLE
owner IDs in OTel baggage                  = PROHIBITED by default
F5 identity                                = owner dispatch closure/handle; payload cross-check only
telemetry vs F5                            = separate channels
producer provenance                        = existing producer_trust only
E2B provider evidence                      = pull-by-physical-sandboxId anchor + best-effort OTLP enrichment
new infrastructure                         = NONE
3H-04                                      = NOT JUSTIFIED
```

3H-03 foi ratificada pelo operador após o diálogo adversarial e a consolidação final acima. A existence de work posterior em 3I/3J/3L/3M não reabre 3H por si só.
