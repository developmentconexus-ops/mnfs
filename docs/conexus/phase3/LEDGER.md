# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED` · próximo gate `3D — Dependency Architecture`  
**Base canônica da Fase 3:** `354f44219fb5970bb9233976773db90d2102ae7a`  
**Autoridade anterior:** C-000..C-017  
**Importante:** este ledger não constitui C-018, não encerra a Fase 3 inteira e não autoriza implementação.

## 1. Authority e precedência documental

A partir do fechamento de 3C, **este arquivo é o único ledger vivo/navegação de status da Fase 3**.

`../24-arquitetura-system-design.md` permanece autoridade histórica/detalhada das decisões 3B registradas nele, mas sua antiga afirmação de ser o "ledger vivo" fica superseded por este arquivo para evitar dupla autoridade de status.

Regras:

```text
C-000..C-017
→ autoridade fundacional anterior

3A/3B/3C approved docs
→ refinam/supersede linguagem anterior somente quando explicitamente declarado

3C-R1
→ authority de reconciliação final de 3C sobre nomenclatura/escopo conflitante

este LEDGER
→ status/navigation authority
→ não substitui conteúdo detalhado dos decision docs
```

Nenhuma conversa é authority. O repositório deve bastar para reconstruir o estado da arquitetura.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 | aplicar apenas findings materiais durante 3D–3O |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | nenhuma reabertura sem finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | dependências em 3D |
| 3D — Dependency Architecture | **NEXT / NÃO INICIADA** | fechar DAG/ports/application orchestration |
| 3E — Data Architecture | NÃO INICIADA | após 3D |
| 3F — Contracts & API Architecture | NÃO INICIADA | após dependencies/data adequados |
| 3G — Behavioral / State Architecture | NÃO INICIADA | FSMs/lifecycles |
| 3H — Runtime & Agent Architecture | NÃO INICIADA | realization/correlation/runtime mechanics |
| 3I — Security / Authority Architecture | NÃO INICIADA | trust/identity/egress |
| 3J — Deployment / Operations Architecture | NÃO INICIADA | local/server/cloud/topology |
| 3K — Frontend / Product Architecture | NÃO INICIADA | UX/scaffold/product surfaces |
| 3L — Technology Qualification | NÃO INICIADA | probes/qualification |
| 3M — Failure & Recovery Architecture | NÃO INICIADA | recovery/failure classes |
| 3N — Architecture Verification | NÃO INICIADA | adversarial verification |
| 3O — Vertical Architecture Proof Contract | NÃO INICIADA | end-to-end proof contract |

---

## 3. 3B — authority

Decisões 3B-01..3B-15 vivem em `../24-arquitetura-system-design.md`.

Detalhes adicionais:

- [3B-16 — Project-Internal Resource Ownership](3B-16-project-internal-resource-ownership.md)
- 3B-17 — Project Isolation and Explicit Reuse — registrada no ledger histórico `../24-arquitetura-system-design.md`.

3B permanece `CLOSED / APROVADA`.

---

## 4. 3C — decisões aprovadas

| ID | Boundary/decisão | Documento |
|---|---|---|
| 3C-01 | Modular Monolith | [3C-01](3C-01-modular-monolith.md) |
| 3C-02 | Identity & Access | [3C-02](3C-02-identity-access-module-boundary.md) |
| 3C-03 | Workspace | [3C-03](3C-03-workspace-module-boundary.md) |
| 3C-04 | Project | [3C-04](3C-04-project-module-boundary.md) |
| 3C-05 | Builder | [3C-05](3C-05-builder-module-boundary.md) |
| 3C-06 | Artifact Registry | [3C-06](3C-06-artifact-registry-module-boundary.md) |
| 3C-07 | Connections | [3C-07](3C-07-connections-module-boundary.md) |
| 3C-08 | Capability Gateway | [3C-08](3C-08-capability-gateway-module-boundary.md) |
| 3C-09 | Brain | [3C-09](3C-09-brain-module-boundary.md) |
| 3C-10 | Production Agent Runtime | [3C-10](3C-10-production-agent-runtime-module-boundary.md) |
| 3C-11 | Release | [3C-11](3C-11-release-module-boundary.md) |
| 3C-12 | Application Runtime Profiles `MANAGED | DEDICATED` | [3C-12](3C-12-application-runtime-profiles.md) |
| 3C-13 | Observability & Audit | [3C-13](3C-13-observability-audit-module-boundary.md) |
| 3C-14 | Attachments / Storage Boundary | [3C-14](3C-14-attachments-storage-boundary.md) |
| 3C-15 | Managed Application Runtime | [3C-15](3C-15-managed-application-runtime-boundary.md) |
| 3C-R1 | Cross-review Closure & Reconciliation | [3C-R1](3C-R1-cross-review-closure.md) |

Builder runtime realization adicional:

- [3A-R5 — Builder / Coding Runtime Reassessment](3A-R5-builder-coding-runtime-reassessment.md)

---

## 5. Mapa final de módulos 3C

```text
Conexus Hub — modular monolith

Identity & Access
Workspace
Project
Builder
Artifact Registry
Connections
Capability Gateway
Brain
Production Agent Runtime
Release
Managed Application Runtime
Observability & Audit
Attachments
```

Decisão transversal:

```text
ApplicationRuntimeProfile
├── MANAGED
└── DEDICATED
```

`DEDICATED Application Runtime` é runtime/output do Project e não módulo do Hub.

Infrastructure não promovida a domínio:

```text
Git
PostgreSQL / Project Data infrastructure
BlobStore / CAS
credential backend / vault
E2B / sandbox
Mastra substrate
MigrationRunner
queue/job substrate
serving/deployment infrastructure
```

---

## 6. Cross-review 3C — resultado

Veredito final: **CLOSE 3C WITH BOUNDED AMENDMENTS → amendments applied by 3C-15 + 3C-R1.**

Findings resolvidos:

- Managed App Runtime owner ausente → **3C-15**.
- `job/v1` runtime owner ausente → **3C-15**, sem `JobModule`.
- `AgentTrigger EVENT` sem ingress owner → `EVENT` reserved/deferred; `SCHEDULE` operacional F1.
- C-016 Gateway-only universal × DEDICATED → scope refinado em 3C-R1.
- DEDICATED multi-install → explicitamente DEFER.
- Inception execution dispatcher → Project authority + Builder engineering execution capability.
- application/orchestration layer implícita → declarada como stateless use-case layer; dependency rules em 3D.
- Brain `EVIDENCE` collision → `EVIDENCE_SPEC` semantic rename.
- binding authority pattern → Git authoring + Project approved intent + Registry compiled revision + specialized validation + Release pin.
- stale Pi/Workspace/Storage/Deployment terminology → precedence registrada.

Não foram encontrados blockers restantes de module ownership.

---

## 7. Open findings / routed work

Estes itens **não reabrem 3C**; possuem owner posterior explícito.

| Finding | Owner |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | 3A / operador — resolver antes de implementação |
| F3B-R2 — legacy `MissionPlan v2` | 3F — re-tipar para Change/Work Unit; não restaurar Mission/Milestone/Feature |
| F3B-R4 — browser/runtime physical trust zones | 3I/3J |
| N3 — Planning Depth × RigorProfile | 3G |
| Gateway↔Builder/Connections/AgentRuntime conceptual cycles | **3D** |
| Managed Runtime dependency graph/ports | **3D** |
| Project binding contracts | 3F |
| DEDICATED identity/authority exchange | 3F/3I |
| DEDICATED network/egress physical policy | 3I/3J |
| MANAGED/DEDICATED deployment topology | 3J |
| Mastra telemetry ↔ Conexus correlation realization | 3H/3L |
| Verification Observability realization (Spotlight/OTel/etc.) | 3H/3L/3N |
| DEDICATED multi-install/fleet management | DEFER; trigger = first external independent installation requiring Conexus-governed lifecycle |

---

## 8. Anti-overengineering guardrail

3C CLOSED não autoriza criar:

```text
microservices
EnvironmentModule
DeploymentModule
StorageModule
JobModule
SchedulerModule
WebhookModule
EventIngressModule
ApplicationLayerModule
InstallationModule
generic binding framework
workflow DSL / event bus
OPA/Cedar/OpenFGA
runtime profile plugin framework
Kafka/Kubernetes/Temporal as defaults
```

Qualquer item só volta ao Decision Loop com consumidor/failure class real.

---

## 9. Próximo gate — 3D

3D deve começar pela pergunta:

> Qual módulo pode depender de qual outro módulo, através de qual narrow port/projection, sem imports/tables access circulares e sem criar um universal mediator?

Prioridade de análise:

```text
Managed Application Runtime
Capability Gateway
Connections
Builder
Production Agent Runtime
Brain
Release
Identity & Access
Artifact Registry
Attachments
Observability
```

3D não reabre ownership de 3C sem finding material.

---

## 10. Regra de avanço

```text
3C = CLOSED
3D = NEXT
```

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger.