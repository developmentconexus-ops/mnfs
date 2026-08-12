# C-013 — Observabilidade mínima (T13)

> Ratificada em 2026-08-12. Convergência adversarial (Codex xhigh): 7,7 → 8,4 → 8,3 → **8,8/10**
> em 4 rodadas (barra 8,5). Insumos: pesquisa interna (3 varreduras — acervo C-000..C-012,
> Mitra medida, mercado) + deep research externa independente com eixo extra de Agent Runtime
> Observability (Pi 0.84.1, E2B, Sentry Spotlight).

## 1. Decisão em 1 frase

Observabilidade F1 = **eventos estruturados append-only no Postgres do hub** com confiança
de produtor explícita, custo multi-estado congelado na escrita, checklist vivo com hub como
autoridade, `tasks.md` como memória de propósito, escada de conclusão até SERVED_VERIFIED e
timeline causal do Hub ao runtime observado — **telemetria diz o que aconteceu; nunca decide
autorização ou aceite**.

## 2. Princípio e 5 camadas de evidência

Requisito do tópico: timeline causal correlacionável do Hub até o runtime observado, sem
transformar telemetria em autoridade de domínio.

| Camada | Pergunta | Fonte | Durabilidade |
|---|---|---|---|
| 1. Hub Conexus | o que foi autorizado/despachado/aceito/bloqueado | eventos nossos | Postgres (autoridade) |
| 2. Runtime Pi (builder) | o que o agente fez (turnos/LLM/tools/compaction) | telemetria nativa Pi | resumo normalizado no Postgres |
| 3. Sandbox E2B | o que aconteceu com a máquina | API E2B | resumo por run no Postgres |
| 4. App em desenvolvimento | o código construído rodou? | Spotlight local (spike) | efêmero; evidência selecionada |
| 5. Artefato publicado | o servido é a revisão validada? | health + revision proof | Postgres |

Anti-lições Mitra pagas por este desenho: OBS-65/66 (70 verificações, zero sobre runtime
real; 10 camadas de falso verde), OBS-52 ("concluído" colapsa feito/persistido/servido),
OBS-72.3 (publicação falha em silêncio), OBS-12 (fim de turno pela fonte durável, nunca pelo
transporte).

## 3. Evento canônico: `agent_event`

Tabela **única** append-only no Postgres do hub. Hot fields como colunas relacionais;
`payload jsonb` só com o que varia por tipo.

Colunas: `event_id`, `occurred_at` (relógio da fonte), `recorded_at` (relógio do hub —
nunca ordenar globalmente por timestamp da fonte), `schema_version`, `project_id`,
`actor_run_id`, `conversation_id`, `turn_id`, `execution_id` (C-005),
`effect_execution_id` (C-010), `deployment_id/revision`, `sandbox_id`, `parent_event_id`
(causalidade), `trace_id/span_id`, `source`, `producer_trust`, `type`, `status`,
`duration_ms`, `provider`, `model`, `tool_name`, tokens
(`input/output/cache_read/cache_write`), colunas de custo (§9), `payload`.

Ingestão:
- Identidade de produtor estável: `producer_instance_id` + `producer_event_id` (único por
  produtor) + `source_seq` (monotônico, reinicia por instância). Ingestão **idempotente**
  por (producer_instance_id, producer_event_id) — replay/reinício não duplica.
- Buffer de emissão bounded; overflow ⇒ contador coalescido em slot reservado, emitido como
  `events_dropped{count}` após recuperação — nunca no mesmo buffer cheio, nunca bloqueio do
  caminho de domínio.
- Role Postgres de escrita = **INSERT-only**. Correção = novo evento apontando o corrigido.
  GC = job privilegiado auditado (§19).

Índices dia 1: B-tree em (actor_run_id, occurred_at) e (project_id, occurred_at). **Sem GIN
global. Sem particionamento.** Gatilhos nomeados: GIN quando query medida exigir; partição
por latência de consulta / tamanho de índice / duração de vacuum / custo de deleção — nunca
"tabela > RAM" por si.

## 4. Confiança da evidência: `producer_trust`

Todo evento carrega `producer_trust: HUB_AUTHORITY | GATEWAY_AUTHORITY | PROVIDER_OBSERVED
| GUEST_OBSERVED`.

- Pi, app-under-test e Spotlight vivem em máquina controlável pelo worker — podem ser
  desabilitados, falsificados ou alimentados com eventos fabricados. Por isso:
- **Acceptance/verify/gates consomem apenas HUB_AUTHORITY e GATEWAY_AUTHORITY.**
  PROVIDER_OBSERVED e GUEST_OBSERVED são diagnóstico; nunca entram em decisão de aceite.
- Ingestão do sandbox usa **capability efêmera** emitida pelo hub, vinculada server-side a
  projeto + ActorRun + tipos de evento permitidos. Guest **nunca** fornece
  autoritativamente `project_id`/`actor_run_id`/`source`/revision identity — o hub estampa
  do contexto da capability.
- Evidência obrigatória de acceptance, enumerada: eventos HUB_AUTHORITY/GATEWAY_AUTHORITY +
  resultado do verifier independente. Ausência de Pi/Spotlight nunca bloqueia acceptance
  por si — vira diagnóstico `MISSING`.

## 5. Schema soberano + mapping OTel versionado

Conexus Event Schema v1 é a ontologia. OTel `gen_ai.*` (status "Development", repo próprio
desde jun/2026, sem atributo de custo) entra como **projeção semântica versionada**
(`semantic_mapping = "otel-genai"` + versão) — rename do OTel troca a projeção, nunca migra
a ontologia. Exporter OTel real permanece sob gatilho C-010 ("UI de trace além do
Postgres").

## 6. Correlação soberana

`actor_run_id` (builder) / `conversation_id`+`turn_id` (agente de produção) atravessam tudo
desde a primeira linha. Obrigações mecânicas: sandbox e app-under-test propagam
`actor_run_id` + revision identity; verify consegue consultar runtime evidence antes de
aceitar resultado. `pi.session.id` = observação de runtime, nunca chave de domínio.

## 7. Dois regimes de turno, duas fontes, um schema

- **WorkerTurn (builder)**: Pi 0.84.1 tem telemetria nativa vendor-neutral
  (`@earendil-works/pi-telemetry`: pi.ai.request, pi.harness.turn/step/tool/compaction/
  checkpoint; usage completo incl. cacheRead/cacheWrite/reasoning, custo, TTFC, stop
  reason, modelo solicitado×respondido). Implementação: **injetar um `TelemetryContext`
  Conexus no PiWorkerRuntime** — adapter passivo, nunca lança erro no caminho do agente;
  telemetria indisponível ⇒ o **supervisor do hub** emite eventos com
  `usage_state=MISSING` (adapter morto não registra a própria ausência) e a execução
  segue. **Nunca raspar stdout.** `pi.*` vai em metadata diagnóstica; nunca vira contrato
  público (troca de runtime muda só `runtime.native_type`).
- **ConversationTurn (agente de produção)**: eventos nascem no NOSSO loop (C-010 comp.4/14;
  telemetria AI SDK permanece off).
- Fim de turno detectado pela **fonte durável** (Postgres), nunca pelo transporte (WS).

## 8. Conteúdo no trace: nunca truncado *silenciosamente*

Linha principal guarda `safe_projection + content_digest + original_byte_length +
content_state`, com `content_state: CAPTURED | OMITTED_BY_POLICY | TOO_LARGE |
UNAVAILABLE`. `CAPTURED` = conteúdo completo presente (linha segura ou `content_ref`) —
nunca "tentamos capturar". Conteúdo integral só como blob referenciado quando capturePolicy
autorizar (opt-in, cifrado, TTL — C-010 intacto). O consumidor sempre SABE que não tem o
dado completo e por quê (lição Mitra C4/C5: protocolo que corrompe dado silenciosamente
obriga o consumidor a regex tolerante).

## 9. Custo: estados independentes, colunas que não se sobrescrevem

Eixos independentes por evento de chamada:

- `usage_state: REPORTED | INFERRED | MISSING`
- `calculation_state: CALCULATED | MISSING_USAGE | MISSING_PRICE | UNSUPPORTED`
- `reconciliation_state: NOT_AVAILABLE | PENDING | MATCHED | MISMATCH | ADJUSTED`

Colunas: `calculated_cost_usd` (nullable — usage presente não implica preço qualificado),
`provider_reported_cost_usd`, `reconciled_cost_usd`. Nenhum valor sobrescreve outro. NUMERIC
exato; rollup monetário v0 = USD only. `price_version_id` consultado é registrado mesmo
quando não encontrou preço. Custo sobre usage INFERRED permanece marcado como inferido.
Reconciliação adiciona fatos; **histórico nunca recalculado**.

Regras herdadas e mantidas: tabela de preços versionada no git, pin por digest (seed
LiteLLM — seed, nunca autoridade); cache write 5min 1,25×, 1h 2×, hit 0,1× (Anthropic) com
contabilidade separada; usage ausente nunca vira custo zero (reserva conservadora C-010 até
reconciliação/expiração); **dois custos monetários separados** — LLM e sandbox wall-clock
(C-008) — effect units = contabilidade operacional, não terceiro custo monetário (custo
monetário de external effect = DEFER até conector que reporte preço).

Rollup = GROUP BY (turno → conversa/run → projeto → período), nunca tabela agregada com
autoridade própria. UI: rodapé por turno (tokens + USD + duração — padrão Mitra OBS-05;
token sozinho conta metade: turno longo é dominado por cache read e tempo de parede) +
agregado por sessão/projeto (OBS-1).

## 10. Persist-first + admission ledger (reinterpretação C-009 p.13)

Preflight universal de limite de assinatura **não existe** de forma confiável (Anthropic:
429 + retry-after ajudam; OpenAI sub: sem API de "remaining"). Substituto mecânico — a
essência do requisito ("modo de falha aparece antes do envio") preservada: **a mensagem
nunca é consumida silenciosamente** (anti-lição Mitra: limite de sessão consumiu mensagem
com out: 0).

- Mensagem/intenção **persistida antes de qualquer chamada**; budget-check nosso (C-010
  comp.13); sinais recentes do provider quando disponíveis.
- **Admission ledger** local por `provider + authBinding + quotaClass` (nunca chaveado por
  credencial secreta): reserva atômica antes da chamada, settlement pós-usage;
  `blocked_until` alimentado por retry-after/429/capacity observados; circuit breaker para
  chamadas repetidamente condenadas; contador de janela SÓ quando limite
  conhecido/configurado — nunca fingir saldo opaco do provider.
- **Máquina de attempt** (sem exactly-once ilusório):

  ```text
  PENDING | PENDING_CAPACITY
    → RESERVED
    → DISPATCHED
    → COMPLETED | FAILED | OUTCOME_UNKNOWN | CANCELLED
  ```

  Pós-DISPATCHED, `FAILED` só quando o provider confirma falha sem processamento possível —
  qualquer ambiguidade (crash pós-envio) ⇒ `OUTCOME_UNKNOWN`, que **nunca tem retry
  automático**: novo envio = novo `attempt_id` + custo potencial duplicado assumido e
  visível. `CANCELLED` só antes do dispatch. Settlement por terminal: COMPLETED ⇒ ajusta à
  usage real; FAILED/CANCELLED ⇒ libera; OUTCOME_UNKNOWN ⇒ mantém reserva conservadora até
  reconciliação ou expiração definida. Idempotency key externa só quando o provider
  suportar de fato. Idempotência de inferência não substitui idempotência de efeito
  (ledger C-010 intocado).
- Falha de capacity/rate ⇒ mensagem fica `PENDING_CAPACITY` — não some, não é consumida
  pelo domínio, distinta de falha de modelo.

## 11. Checklist vivo (HAR-8)

Worker/modelo **propõe** (`plan.item.proposed/start_requested/complete_requested/blocked`);
**hub aplica a transição** e grava (`plan.item.started/completed/...`); Postgres =
autoridade; UI = projeção; tasks.md = memória. Transições exigem `expectedRevision` (CAS
otimista); JSON Patch arbitrário por índice **nunca** comanda a máquina de estado (AG-UI
validou a forma — ActivitySnapshot/Delta, activityType PLAN — não adotamos o protocolo).
Morte do worker ⇒ itens in_progress viram `INTERRUPTED` explícito (C-002: reconexão
reconstrói do hub). Narração = parâmetro obrigatório no contrato da tool (padrão `titulo`
Mitra — descartado pela execução, existe só para UI); rótulo rotativo aleatório = REJECT
(OBS-11). Streaming à UI via data parts tipadas do AI SDK — transporte, não autoridade.

## 12. `tasks.md`: memória de propósito, não autoridade operacional

Postgres responde "o item 7 está concluído?"; tasks.md responde "o que estamos construindo,
por quê, o que falta, o que ficou de fora" — perguntas diferentes, sem disputa de
autoridade. Evidência: OBS-77.1 (pós-corte de contexto, proibições sobreviveram, PROPÓSITO
não — "objetivo tem de estar em artefato que o agente RELEIA, não em resumo que ele HERDE")
+ Manus recitation.

Arquivo no repo do projeto, classe APP-OWNED (C-012), escrito pelo worker, entra no commit.
Conteúdo padrão validado na Mitra: status/output + log de correções com causa-raiz + revisão
item-a-item contra o prompt original + "Não incluído" na mesma tabela.

**Gate mecânico no SHARE**: tasks.md contém bloco estruturado (fenced, schema fixo) com
`planRevision + [{itemId, statusCode}]`. O gate compara SÓ esse bloco contra a autoridade
Postgres, com matriz de compatibilidade formal `statusCode × estado do evento` —
`statusCode` contradizendo estado terminal ⇒ bloqueia (worker não escreve "done" sobre
FAILED); `planRevision` divergente ⇒ reprova como STALE. Prosa livre permanece
não-autoritativa — nenhuma interpretação semântica por LLM no gate.

## 13. Escada de conclusão

```text
WORK_COMPLETED → RESULT_PERSISTED → VERIFIED → DEPLOYED → SERVED_VERIFIED
```

`SERVED_VERIFIED` = GET pelo caminho real de serving + **prova mecânica** de que
deployment/runtimeContract/frontend digest servidos == esperados (digest, não HTTP 200 —
precedente OBS-60.3; servidor velho saudável responde 200). **Sem smoke funcional
pós-CAS** — permanece rejeitado até RC-3 (C-005); smoke funcional continua PRÉ-promoção
contra o dist servido pelo hub (C-012). Quem fecha = HUB lendo verify + ponteiro CAS, nunca
declaração do agente. Camadas feito/persistido/servido sempre distintas em qualquer
superfície.

## 14. Sucesso parcial de 1ª classe (emenda C-012)

`ActionReceiptMeta.outcome = SUCCEEDED | PARTIAL | FAILED | OUTCOME_UNKNOWN` + breakdown
obrigatório para operação multiunidade:

```text
total     = succeeded + rejected + unprocessed + unknown
attempted = succeeded + rejected + unknown        (unprocessed = não tentada)
reasonCodes[]
```

Invariantes: `OUTCOME_UNKNOWN` tem precedência máxima se qualquer unidade puder ter
produzido efeito sem confirmação; `unprocessed` (não tentada) ≠ `unknown` (pode ter
ocorrido); `PARTIAL` só para contrato que declare cardinalidade multiunidade — ação atômica
nunca é PARTIAL; `SUCCEEDED` = todas as unidades tentadas com sucesso; timeout nunca vira
FAILED automático quando o efeito pode ter ocorrido (C-010). Precedentes: BigQuery
DONE+errorResult; MS Graph batch 200 com subrequests 4xx; conector Mitra
partial_success/accepted/rejected/reasons (validado 2×). Não altera o envelope wire.

## 15. Lineage declarada × observada (emenda C-005)

Duas fontes compostas:

- **Declarada**: saída compilada dos artefatos registrados passa a incluir
  `directReads/directWrites` (objetos citados no SQL) + `resolvedReads/resolvedWrites`
  (resolução física via catálogo Postgres na compilação/promoção — views/functions/
  triggers) + `resolutionState: COMPLETE | PARTIAL | UNKNOWN` (UNKNOWN ⇒ warning, nunca
  falso verde). Emenda aditiva C-005; metadata autorada não vira autoridade.
- **Observada**: Capability Gateway emite `resources.read[]/write[]` por execução (modelo
  OpenLineage: lineage deriva de RUNS, não de parsing). Ids: `db:project/tabela`,
  `artifact:slug`, `integration:conn/recurso`, `file:path`.

Taxonomia de achados (C-009 p.4 — detector de maior retorno da sonda):

| Achado | Definição | Severidade |
|---|---|---|
| Órfão estrutural | nenhum consumidor declarado referencia o artefato | warning |
| UNOBSERVED_ACTIVE_ARTIFACT | alcançável, sem execução na janela | diagnóstico |
| Escrita sem leitura | recurso escrito sem leitor declarado/observado compatível | warning contínuo |

Supressões legítimas: create/migration/cache. Projeções `resource_reader`/`resource_writer`
sobre eventos.

## 16. Runtime validation do builder (eixo novo)

Ciclo do worker evolui: `TEST → BUILD → RUN → OBSERVE REAL RUNTIME → ASSERT → SHARE` —
verificar o runtime REAL do app construído, não só artefatos de entrada.

**Spotlight Sidecar** (Sentry dev-mode) DENTRO do E2B, ao lado do app em teste: agente
consulta via MCP (`search_errors/search_logs/search_traces/get_traces`) o que o app
realmente fez. Regras duras (Sidecar não tem autenticação):

- loopback/internal only; **nunca RunPreview, nunca URL pública, nunca produção** — com
  teste negativo obrigatório;
- pacote pinado por versão/digest; DSN/cloud export desligados e verificados; MCP via stdio
  preferencial; captura de headers/cookies/bodies/PII off por default; limites de
  envelopes/logs;
- falha do sidecar não altera comportamento do app;
- efêmero por design (memória, morre com o sandbox) = qualidade, não defeito;
- `producer_trust = GUEST_OBSERVED` por construção — **jamais prova de acceptance**;
- hub persiste SÓ resumo `runtime_validation` (http_requests, traces, errors,
  unhandled_exceptions, slowest_request_ms, observed_revision) + `evidence_ref` bounded
  quando erro material; dump completo só sob capturePolicy.

Disposições: Spotlight como observabilidade canônica = REJECT; Sentry cloud = DEFER;
persistir envelopes Sentry = REJECT. Entrada via **spike `CX-OBS-SPOTLIGHT-01`**
(preferencialmente dobrado nos probes existentes), não frente arquitetural nova.

## 17. Sandbox E2B: resumo por run

Ao fim de cada ActorRun, via API E2B: `sandbox_duration_ms`, cpu/ram p50/p95/max,
`disk_max`, `teardown_reason` separado em solicitado (hub) × observado (lifecycle events).
Amostras de 5s NÃO importadas; exporter OTel do E2B NÃO ativado (best-effort). Cobertura
explícita: `metrics_state: COMPLETE | PARTIAL | MISSING` + `sample_count` +
primeiro/último timestamp; percentil = NULL quando amostras insuficientes (p50 ≥ 4, p95 ≥
20 — fixado no probe); coleta final ANTES do teardown. Alimenta P50/P95 + custo de sandbox
por run (C-008).

## 18. Superfície F1: Run Timeline, status, alarme, consulta

- **Run Timeline** causal por ActorRun/Conversation (sandbox created → Pi started → turn →
  LLM request $ → tool → app error → test → bundle → quarantine → deploy → served proof) —
  a superfície central; **não** dashboards.
- Tela de status única espelhando as 4 máquinas de estado congeladas (health C-011,
  Connection C-007, backup/sync C-006, deployment C-005/C-012) SEM reinterpretar; stale por
  `lastSuccessfulCheck` (ausência de execução nunca preserva verde — C-011);
  `desconhecido` = terceiro estado em toda métrica; vazio ≠ carregando ≠ falhou (OBS-2);
  nenhum verde por ausência de erro.
- Alarme F1 = in-app (badge/tela). Canal externo bloqueado por C-007 comp.12 (dispatch
  DEFER; gatilho lá definido).
- Consulta (OBS-3): tela filtrável por projeto/conversa/turno/status/tipo + export JSONL
  derivado (Postgres única autoridade). Sem query builder.

## 19. Retenção, GC, segurança

- Retenção máxima por idade (default 90d observacional) + disk high-water mark (dispara GC
  antecipado + alarme in-app).
- GC remove por run/trace COMPLETO, nunca linhas soltas; **nunca** remove run aberto nem
  trace referenciado por investigação/captura ativa; dry-run auditável.
- Domain receipts/approvals/ledgers/decisões = FORA do GC observacional (retenção de
  domínio ≠ retenção de trace).
- **Fronteira Postgres × telemetria**: Postgres é autoridade operacional (C-002) —
  indisponibilidade dele PARA o domínio fail-closed (nenhuma mensagem admitida, nenhum
  run/efeito/aprovação, nenhum SHARE). O que NÃO pode afetar domínio é falha/backpressure
  do pipeline de TELEMETRIA com Postgres saudável.
- Redaction POR CAMPO com allowlist de campos públicos — host/slug/ambiente são dado de
  auditoria, não segredo (anti-lição OBS-19: redaction por bloco escondeu evidência exigida
  por gate). Credencial nunca em log (C-007/C-008); raw cifrado+TTL (C-010). RBAC de trace
  = T12.

## 20. NÃO-construir F1 (gatilhos nomeados)

Langfuse/exporter OTel (gatilho C-010: UI de trace além do Postgres) · dashboards de
latência · alerting externo (gatilho C-007) · sampling · evals em CI · retenção multi-tier ·
warehouse de traces · particionamento (gatilho: latência/vacuum medidos) · importar
amostras 5s do E2B · persistir envelopes Sentry · query builder de log · protocolo AG-UI ·
conversão de moeda (gatilho: segunda moeda real).

## 21. Probe `CX-OBS-V0-01` (bloqueante) + spike

Probes existentes provam componentes; este prova a **composição causal**
Hub → Pi → Gateway → verify → deployment.

1. Conformance do schema de eventos: validação por tipo/versão, deduplicação
   (producer_instance_id + producer_event_id), reinício, clock skew, parentage.
2. Correlação ponta a ponta: `actor_run_id`, `execution_id`, `effect_execution_id`,
   deployment, sandbox.
3. Testes negativos de confiança: guest não forja `source=HUB`, outro projeto/run, nem
   evento de acceptance.
4. Adapter Pi: spans/usage/cache/model/stop reason traduzidos sem stdout scraping; falha de
   telemetria não altera a execução; supervisor emite MISSING.
5. Golden de custos: cache read/write, usage ausente, alias drift, preço pinado
   (calculation_state incl. MISSING_PRICE), reconciliação, rollup; desconhecido nunca vira
   zero.
6. Máquina do checklist: transições inválidas recusadas, concorrência por
   `expectedRevision`, morte do worker ⇒ INTERRUPTED.
7. Tabela-verdade do receipt: SUCCEEDED/PARTIAL/FAILED/OUTCOME_UNKNOWN + equações
   `total`/`attempted` + precedência de OUTCOME_UNKNOWN.
8. Redaction/capture/GC: credencial e raw não entram no trace normal; retenção não apaga
   ledger de domínio.
9. Fronteira telemetria × Postgres: falha/backpressure do pipeline de telemetria com
   Postgres saudável não altera a execução; falta de evidência obrigatória
   (HUB/GATEWAY + verifier) bloqueia SHARE; Postgres caído ⇒ domínio para fail-closed.

Dobras (sem duplicar): resumo E2B no `CX-SBX-E2B-01`; revision proof servido no
`CX-SCAFFOLD-V0-01`; Spotlight no spike `CX-OBS-SPOTLIGHT-01` (app sintético: 1 exception +
1 request lenta + 1 log + 1 rota saudável → Pi acha tudo via MCP → hub recebe só resumo
bounded → sandbox morre sem estado necessário → porta inacessível de fora) — o probe T13
referencia o resultado se o spike aprovar.

## 22. Emendas registradas por esta decisão

| Alvo | Emenda | Natureza |
|---|---|---|
| C-012 | `ActionReceiptMeta.outcome` ganha PARTIAL + breakdown multiunidade (§14) | aditiva |
| C-005 | saída compilada ganha reads/writes declarados + resolutionState (§15) | aditiva |
| C-009 p.13 | preflight → persist-first + admission ledger + máquina de attempt (§10) | reinterpretação mecânica declarada |
| C-010 | intacto — capturePolicy, budgets, receipts, protocolo de efeito, telemetria AI SDK off preservados | — |

## 23. Nota de convergência

4 rodadas adversariais (Codex xhigh, sessão contínua): r1 7,7 (10 findings — producer_trust,
dedup/ordenação, content_state, custo em colunas, gate mecânico de tasks.md, lineage
declarada, RC-3 preservada, retenção dia 1, metrics_state E2B, contenção Spotlight; 3
arbitragens — PARTIAL por emenda, admission ledger, probe próprio); r2 8,4 (4 pendências —
taxonomia de órfão, máquina de attempt, fronteira Postgres×telemetria, calculation_state);
r3 8,3 (2 ajustes — equação total/attempted, máquina completa com
PENDING_CAPACITY/FAILED/CANCELLED); r4 **8,8 — convergência declarada**, "não restam
contradições materiais com C-000–C-012".
