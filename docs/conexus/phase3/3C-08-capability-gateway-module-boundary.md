# 3C-08 — Capability Gateway Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão normativa

No Conexus F1, `Capability Gateway` é a boundary in-process de **admission mecânica e execução controlada** para capabilities que acessam dados de Project ou sistemas externos em nome de um caller.

O Gateway usa fatos autoritativos server-side de Identity & Access, Project, Artifact Registry, Connections, Release, Builder e Production Agent Runtime. Ele aplica esses fatos de forma fail-closed, mas **não passa a ser owner de roles, bindings, approvals, releases, Connections ou regras de negócio**.

As duas salvaguardas normativas são:

```text
Minimal Enforcement Surface
No Universal Privileged Bus
```

### Minimal Enforcement Surface

O Gateway só participa quando uma operação cruza a boundary de dados/integração e precisa de enforcement físico. Reads simples permanecem leves; chamadas internas de domínio não passam pelo Gateway apenas por serem tools.

### No Universal Privileged Bus

A existência do Gateway não transforma todas as operações internas/administrativas do Hub numa `CapabilityInvocation`.

Permanecem fora do Gateway:

- Git remote operations;
- Artifact Registry publication;
- Release promotion;
- production migration orchestration;
- sandbox lifecycle;
- secret-storage implementation;
- ordinary internal module calls.

## Escopo F1

O Gateway cobre três casos reais:

1. **Project Data** — registered query/action, AnalyticQuery physical read e Builder data capabilities autorizadas;
2. **External Integration** — named ConnectorOperation sobre ConnectionRevision exata;
3. **Connection qualification dispatch** — o Gateway executa a probe; Connections continua owner do significado de qualification.

## Invariantes

```text
I&A ALLOW != EXECUTE
Gateway enforcement != policy ownership
caller-provided claims != execution authority
```

O caller não escolhe autoritativamente role, target, Connection, environment, approval status ou poder físico. Esses fatos são derivados pelo Hub.

Uma execução só é admitida quando todos os fatos requeridos estão válidos. `UNKNOWN`, `STALE`, `MISSING`, `REVOKED` ou deny em uma authority necessária não são convertidos em allow.

## Effects

Para efeitos materiais, o Gateway é a boundary física responsável por admission/claim, idempotency, receipt, traffic state, retry eligibility e `OUTCOME_UNKNOWN`. Reads normais não recebem essa machinery sem necessidade.

Approval lifecycle continua no Production Agent Runtime; o Gateway apenas revalida a approval aplicável imediatamente antes da execução.

## Ownership explícito

- Identity & Access owns identidade, memberships, roles e permissions;
- Project owns bindings e intenção de configuração;
- Artifact Registry owns revisions/payloads/classification;
- Connections owns Connection/revision/qualification semantics;
- Builder owns Change/work graph/Findings;
- Production Agent Runtime owns AgentRun/ToolProjection/ApprovalRequest;
- Release owns composição, promotion e production migrations;
- Observability registra Evidence, mas não decide;
- Gateway owns apenas enforcement + execução da boundary que esta decisão define.

## Refinamento de C-008/C-016

“Gateway-only” passa a ser interpretado como **a data/integration trust boundary governada por esta decisão**, não como um barramento universal de qualquer operação privilegiada do Hub.

## Anti-overengineering F1

Não construir agora:

- OPA/Cedar/OpenFGA;
- policy/workflow DSL;
- service mesh;
- dynamic executor registry;
- arbitrary upstream proxy para Production Agent/Published App;
- universal execution bus;
- regra de que toda tool passa pelo Gateway.

## Defer

- 3D: dependency directions e anti-cycle rules;
- 3E: effect/execution ledger e durable budget persistence;
- 3F: contracts/envelopes/error taxonomy;
- 3G: detailed effect/retry state machines;
- 3H: runtime/process/concurrency;
- 3I: physical authority/credential/egress controls;
- 3J: operational topology/recovery.

## Decisão final

> `Capability Gateway` é o last-mile enforcement + execution boundary para Project-data e external-integration capabilities. Ele enforça fatos autoritativos dos respectivos owners sem absorvê-los, mantém o menor enforcement suficiente para cada failure mode e não vira um universal privileged-operation bus.
