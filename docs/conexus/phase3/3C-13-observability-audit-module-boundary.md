# 3C-13 — Observability & Audit Module Boundary

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1 existe um único módulo `Observability & Audit`, responsável por registrar histórico de auditoria durável e por correlacionar telemetry operacional da plataforma sem possuir o estado de negócio dos módulos observados. O módulo mantém duas classes semanticamente distintas — `Audit Trail` e `Operational Telemetry` — e inclui `Verification Observability` como consumidor explícito da telemetry para Builder/Verifier/QA. Telemetry ajuda a descobrir o que realmente aconteceu no runtime; nunca vira autoridade de aceite por autodeclaração do app, worker, model ou ferramenta de observabilidade.

A separação normativa é:

```text
Domain owner
→ owns current authoritative state

Observability & Audit
→ owns durable audit history + operational observations

Verifier / QA
→ may consume runtime telemetry as diagnostic/proof input
→ never treats telemetry alone as correctness authority
```

---

## 1. Contexto e precedência

Esta decisão materializa no nível de module ownership principalmente C-013 e reconcilia 3C-02, 3C-05, 3C-07, 3C-08, 3C-10, 3C-11, 3C-12 e 3A-R5.

C-013 já congelou propriedades centrais que permanecem válidas:

- eventos estruturados append-only;
- `producer_trust` explícito;
- timeline causal Hub → runtime observado;
- correlação por IDs duráveis;
- custo multiestado;
- app-under-test como camada de observabilidade;
- Spotlight local apenas como spike/candidato de realização;
- telemetry diz o que aconteceu, mas não decide autorização/aceite;
- verifier consegue consultar runtime evidence antes de aceitar resultado.

3C-13 generaliza a semântica de C-013 de `agent_event` agent-centric para observabilidade platform-wide e separa auditabilidade durável de telemetry operacional potencialmente efêmera/volumosa.

Nada aqui congela tabelas/índices/particionamento (3E), schemas/DTOs/event names (3F), máquinas de falha/retry (3G/3M), instrumentation concreta (3H/3L), trust/retention/security detalhados (3I), backend de observabilidade ou deployment topology (3J).

---

## 2. Responsabilidade do módulo

`Observability & Audit` responde a duas perguntas diferentes:

### Audit Trail

> Quem realizou uma ação material, sobre qual recurso, sob qual autoridade, quando e qual foi o resultado registrado?

### Operational Telemetry

> Como o sistema e seus runtimes se comportaram enquanto executavam trabalho?

Exemplo:

```text
AUDIT
Leandro promoted Release R-18 to PROD.

TELEMETRY
Promotion P-41 took 18.4s;
migration took 4.2s;
served verification took 320ms.
```

A diferença de semântica e retenção é intencional.

---

## 3. Duas classes, um único módulo F1

F1 não cria módulos independentes de `Audit`, `Logging`, `Tracing`, `Metrics`, `Analytics` ou `Telemetry`.

Forma conceitual:

```text
Observability & Audit
├── Audit Trail
└── Operational Telemetry
    └── Verification Observability
```

A separação protege duas necessidades sem introduzir cinco lifecycles artificiais.

### Audit Trail

Histórico durável de ações materiais e decisões de authority.

### Operational Telemetry

Observações técnicas como traces, logs, metrics, latência, custo, model/tool usage, runtime diagnostics e timeline operacional.

### Verification Observability

Uso dirigido da Operational Telemetry pelo Builder/Verifier/QA para observar o candidate/app real rodando, detectar erros invisíveis a testes superficiais e correlacionar cenário de QA com traces/logs/errors do runtime.

---

## 4. Domain state continua nos respectivos owners

Observability nunca substitui o owner do estado atual.

```text
Change / Work Unit / ActorRun
→ Builder

AgentRun / Conversation / ApprovalRequest
→ Production Agent Runtime

Connection / qualification / health
→ Connections

Release / Promotion / active pointer
→ Release

Account / session / grants
→ Identity & Access

ArtifactRevision
→ Artifact Registry

Brain semantics
→ Brain

capability admission/outcome
→ Capability Gateway
```

Exemplo:

```text
Release says:
Promotion P-41 = SERVED_VERIFIED
```

Observability pode registrar:

```text
release.promotion.served_verified
```

Mas esse registro não passa a ser a authority do lifecycle da Promotion.

Regra:

```text
Observed(X)
!=
Authoritative(X)
```

---

## 5. Authority própria do Audit Trail

Existe uma nuance: o módulo não owns o estado atual do domínio, mas owns o **registro histórico de auditoria** que recebeu/registrou.

Exemplo:

```text
I&A authority agora:
Mariana = PROJECT_CONTRIBUTOR

Audit authority histórica:
às 14:32, Grant G-17 foi atribuído por Leandro
```

Portanto:

```text
current business/control state
→ domain owner

historical audit record
→ Observability & Audit
```

Audit record é append-oriented; correção histórica acontece por novo registro/correction link, não por reescrita silenciosa do passado.

---

## 6. Classes de ação audit-required no F1

3C congela classes, não catálogo final de event types.

Audit obrigatório inclui pelo menos ações materiais destas famílias:

```text
Identity
→ account disable/enable, credential/reset material, session revocation material

Access
→ grant/revoke/role change

Authority
→ approval/rejection/checkpoint humano material

Connections
→ binding/target/credential-authority change, qualification material

Knowledge
→ Brain publication / binding authority change material

Software
→ Release creation material, Promotion, rollback, production migration outcome

External effects
→ efeito empresarial material admitido/executado via Gateway

Security / Administration
→ privileged deny relevante, policy/config authority change
```

Reads normais, navegação de UI e filtros não viram audit forever por default.

---

## 7. Fail-closed apenas onde audit é requisito

Operational telemetry é observação e pode degradar sem bloquear trabalho comum.

Exemplo:

```text
OTel exporter unavailable
→ telemetry MISSING/degraded
→ ordinary read/build/model call may continue
```

Mas uma operação classificada como `audit-required` não deve completar silenciosamente sem o registro durável requerido.

Exemplo:

```text
promote PROD
admin grant
approve material external effect
credential authority change
```

Se o sistema não consegue produzir o AuditRecord obrigatório:

```text
FAIL CLOSED
```

A realização transacional exata pertence a 3E/3G/3I.

---

## 8. `agent_event` de C-013 é generalizado semanticamente

C-013 nomeou o evento canônico como `agent_event`, adequado ao foco então dominante em Builder/agent runtime.

3C-13 refina a ontologia:

```text
agent-centric event model
→ platform-wide operational event model
```

O nome físico de tabela não é decidido aqui.

A semântica deve conseguir correlacionar eventos de:

```text
Builder
Mastra coding runtime
E2B
app-under-test
Capability Gateway
Connections
Production Agent Runtime
Release
MANAGED runtime
DEDICATED runtime integrations
```

Sem criar event sourcing da plataforma.

---

## 9. Producer provenance / trust permanece obrigatório

C-013 acertou ao distinguir fonte de observação de authority.

Todo evento operacional deve preservar conceitualmente:

```text
producer identity
producer/runtime kind
provenance/trust class
correlation IDs
revision/runtime identity quando aplicável
```

Classes exatas podem evoluir, mas a distinção equivalente a:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

permanece necessária.

Um worker, app-under-test, SDK de telemetry ou coding harness pode produzir dados úteis e ainda assim estar em um ambiente manipulável pelo implementador.

Logo:

```text
worker says PASS
!= proof

app emits no error
!= proof

Spotlight shows no exception
!= proof
```

---

## 10. Verification Observability — decisão normativa

### Problema

Testes e inspeção estática não revelam todos os defeitos de runtime.

Um candidate pode:

```text
compile successfully
pass unit tests
render a page
```

mas ainda apresentar:

```text
browser exception hidden from the QA script
failed API request swallowed by UI
incorrect retry loop
server-side exception after an interaction
slow external dependency
unexpected query fan-out
broken async path
```

### Decisão

`Verification Observability` é uma capability/consumer do módulo `Observability & Audit`, não módulo separado.

Durante verify/QA material:

```text
Verifier / QA
      │
      ├── exercises candidate through real preview/runtime path
      │
      └── queries correlated runtime telemetry
            ├── errors / stack traces
            ├── traces / spans
            ├── logs
            └── selected performance/runtime facts
```

Isso permite que o verifier investigue **o que o software realmente fez**, não apenas o que o código parece fazer.

---

## 11. Spotlight — referência de capability, não decisão de produto

O repositório `getsentry/spotlight` demonstra uma realização útil para desenvolvimento:

```text
App
→ Sentry SDK
→ local Spotlight sidecar
→ errors / logs / traces
→ UI / CLI / MCP
→ AI coding assistant
```

Seu MCP permite ao agente buscar errors com stack traces, logs, traces e detalhes de performance do app local.

O Conexus adota a **propriedade**, não o produto:

```text
AI verifier can inspect runtime telemetry of the real app-under-test
```

Não fica aprovado em 3C:

```text
Sentry SDK obrigatório
Spotlight obrigatório
MCP obrigatório
Sentry como backend de production observability
```

Spotlight permanece candidato/spike/challenger para a realização local de Verification Observability.

OpenTelemetry permanece a boundary técnica preferida para correlação vendor-neutral de traces/logs/metrics, especialmente para DEDICATED, sem congelar collector/backend agora.

---

## 12. Verifier não pode transformar telemetry em correctness authority

Esta é a salvaguarda central.

Runtime telemetry pode:

```text
support investigation
support a Finding
show a concrete exception
correlate a QA scenario to a request/trace
provide selected Evidence
```

Mas não pode por si só afirmar:

```text
"no error event" → COR satisfied
```

Porque telemetry pode ser:

```text
desabilitada
mal instrumentada
amostrada
incompleta
falsificada pelo guest
incapaz de observar uma classe de defeito
```

Acceptance continua baseada em correctness contract + deterministic/mechanical proof + independent verifier quando material + authoritative Hub/Gateway facts aplicáveis.

---

## 13. Missing telemetry e `NOT_PROVEN`

C-013 permanece válido: ausência de Spotlight/telemetry não bloqueia **toda** acceptance automaticamente.

3C-13 adiciona a regra de precisão:

```text
telemetry globally missing
→ diagnostic MISSING / degraded
→ not automatic global failure
```

Porém, se um cenário/assertion de verification explicitamente exige runtime evidence para provar determinada propriedade:

```text
required runtime evidence missing
→ that assertion = NOT_PROVEN / INCONCLUSIVE
→ never PASS by absence
```

Isso evita dois erros:

```text
observability unavailable → whole platform unusable
```

e:

```text
observability unavailable → verifier guesses success
```

---

## 14. Instrumentation não deve depender apenas do implementador

Se o mesmo agente que escreve o feature puder simplesmente remover toda observabilidade e depois usar "nenhum erro apareceu" como argumento, a capacidade perde valor.

Logo a realização futura deve preferir, quando tecnicamente aplicável:

```text
platform/scaffold instrumentation contract
runtime launch wrapper
proxy/collector outside app authority
mechanical instrumentation presence checks
```

em vez de depender exclusivamente de código ad hoc escrito pelo Change.

A forma concreta será decidida em 3H/3I/3K/3L e validada no 3N/3O.

A propriedade é:

```text
verification telemetry should be harder for the implementer to silently defeat
```

sem fingir que guest telemetry pode se tornar HUB_AUTHORITY.

---

## 15. Correlação causal

O módulo deve permitir navegar sem possuir os objetos correlacionados.

Exemplo:

```text
Change CX-184
├── CodingSession CS-184
├── Work Unit WU-01
│   └── ActorRun A-91
│       ├── model/tool runtime
│       ├── E2B
│       ├── build/tests
│       └── app-under-test traces/errors
├── Finding F-21
├── ActorRun A-92
└── Release R-18
    └── Promotion P-41
        └── SERVED_VERIFIED
```

Correlação usa IDs dos respectivos domain owners.

Observability não cria `UniversalActivity` como entidade soberana.

---

## 16. OpenTelemetry como boundary técnica preferida

F1 preserva o Conexus Event/Audit schema como ontologia própria de domínio/controle.

OTel é adequado para transportar/correlacionar signals técnicos:

```text
traces
logs
metrics
trace/span context
resource/runtime metadata
```

Regra:

```text
Conexus audit/domain event schema
!= OTel semantic conventions
```

OTel pode ser adapter/export/projection versionada.

Mudança futura de semantic convention ou backend observability não deve migrar authority do domínio.

---

## 17. MANAGED × DEDICATED

### MANAGED

O Conexus controla grande parte do runtime e pode instrumentar diretamente:

```text
Gateway
managed queries/actions
agents
runtime serving
platform data paths
```

Verification Observability pode ser integrada fortemente ao Golden Path.

### DEDICATED

O app possui runtime próprio.

Ele pode emitir telemetry via contrato/vendor-neutral boundary para Conexus ou para outro backend.

```text
Dedicated App
→ OTLP / qualified telemetry adapter
→ Conexus Observability or external backend
```

Conexus não finge observar o que não recebeu/mediu.

Telemetry proveniente do Dedicated app permanece com provenance coerente com sua trust boundary.

---

## 18. Cost & usage

Observability owns a projeção histórica/operacional do que foi consumido:

```text
Change cost
ActorRun cost
AgentRun cost
provider/model usage
sandbox duration/cost
```

Mas não owns os budgets permitidos.

```text
observed usage/cost
→ Observability

budget definition/admission
→ owning domain policy
```

Os estados multiestado de custo aprovados por C-013 permanecem válidos e serão concretizados em 3E/3F.

---

## 19. Public internal capabilities — sem congelar 3F

A boundary deve suportar semanticamente capacidades equivalentes a:

```text
recordAudit(...)
recordOperationalObservation(...)
queryAuditHistory(...)
queryTimeline(...)
queryRuntimeTelemetry(...)
queryCostUsage(...)
```

Nomes/signatures finais não estão congelados.

Verifier/QA recebe apenas leitura do escopo de candidate/run necessário; ele não edita telemetry histórica nem estado de domínio através desse módulo.

---

## 20. Não construir no F1

```text
Event Sourcing da plataforma
Universal Event Bus
Kafka como requisito
separate Audit Service
separate Logging Service
separate Metrics Service
separate Tracing Service
Analytics domain/module
SIEM próprio
ClickHouse obrigatório
Elasticsearch obrigatório
Grafana/Loki/Tempo obrigatórios
Sentry obrigatório
Spotlight obrigatório
custom tracing protocol
observability policy DSL
```

Essas tecnologias/capabilities só entram quando um consumidor, escala ou requisito operacional concreto justificar.

---

## 21. Invariantes

1. Domain owner continua authority do estado atual.
2. Observability nunca decide authorization, correctness, promotion ou effect admission.
3. Audit Trail e Operational Telemetry são semanticamente distintos.
4. AuditRecord material é durável/append-oriented.
5. Operação audit-required não termina silenciosamente sem audit persistido.
6. Telemetry comum pode degradar sem parar o domínio por default.
7. Producer provenance/trust é explícito.
8. Guest/provider telemetry nunca sobe de confiança por conveniência.
9. Correlation IDs atravessam Builder, runtimes, Gateway, Release e app-under-test onde aplicável.
10. Verification Observability permite ao verifier consultar o runtime real do candidate.
11. Nenhum erro observado não equivale a correctness provada.
12. Runtime evidence exigida e ausente produz `NOT_PROVEN/INCONCLUSIVE`, não PASS.
13. Spotlight é referência/challenger de realização, não dependência arquitetural.
14. OpenTelemetry é preferred technical interoperability boundary, não domain authority.
15. MANAGED pode ter instrumentation mais integrada; DEDICATED preserva portabilidade e provenance explícita.
16. Observability não vira Universal Event Bus nem Event Sourcing.

---

## 22. Deliberadamente deixado para fases posteriores

### 3E — Data Architecture

- estrutura física de AuditRecord/OperationalEvent;
- retenção/tiering;
- índices/partition triggers;
- blobs/attachments de trace;
- custo/storage projections.

### 3F — Contracts & API Architecture

- event schemas;
- audit event catalog;
- telemetry query contracts;
- correlation envelope;
- verifier read contract.

### 3G / 3M — Behavior & Recovery

- fail-closed de audit-required;
- ingestion retry/idempotency;
- dropped telemetry semantics;
- partial/inconclusive verification behavior.

### 3H — Runtime & Agent Architecture

- Mastra telemetry adapter;
- app-under-test observability integration;
- verifier access mechanics;
- candidate runtime instrumentation.

### 3I — Security / Authority

- capture/redaction policy;
- PII/secrets;
- producer authentication;
- trace access;
- retention/deletion authority.

### 3J — Deployment / Operations

- OTel Collector ou equivalente;
- backend/storage externo quando necessário;
- production observability topology;
- Dedicated export path.

### 3K / 3L

- scaffold instrumentation seam;
- SDK/probe qualification;
- Spotlight/Sentry/OTel realization evaluation.

### 3N / 3O

- verificar que runtime telemetry realmente melhora finding rate sem gerar false-green;
- provar correlação browser/request/backend;
- provar que instrumentation missing não vira sucesso;
- qualificar `Verification Observability` no vertical proof.

---

## 23. Consequência arquitetural

Após 3C-13, o mapa fica:

```text
Domain modules
    │
    ├── authoritative state
    │
    └── audit/observations
             │
             ▼
     Observability & Audit
       ├── Audit Trail
       └── Operational Telemetry
             └── Verification Observability
                       │
                       ▼
                  Verifier / QA
```

A observabilidade aumenta a capacidade de descobrir falsos verdes, mas a própria arquitetura impede que ela se torne mais uma fonte de falso verde.
