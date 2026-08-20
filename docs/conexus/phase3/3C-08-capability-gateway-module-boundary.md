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

## Precedência e authorities

A decisão reconcilia C-002, C-005, C-006, C-007, C-008, C-010, C-013, C-014, C-015, C-016 e as boundaries 3C-02..3C-07.

```text
Identity & Access
→ caller/reachability/permissions

Project
→ bindings e intenção de consumo

Artifact Registry
→ artifact/operation revision e classification

Connections
→ target/ConnectionRevision

Release
→ composição ativa

Builder / Production Agent Runtime
→ contexto de execução, approvals e budgets aplicáveis

Capability Gateway
→ last-mile admission + execution
```

Regra central:

```text
I&A ALLOW
!=
EXECUTE
```

Uma permission válida não ignora release state, binding, approval, budget, target, effect classification ou precondition.

## Finding material — interpretação de `Gateway-only`

C-008/C-016 usam linguagem de “Gateway-only” para proteger runtime/worker de acesso direto a dados/integrações. 3C-08 congela a interpretação correta:

```text
Gateway-only
→ Project-data + external-integration trust boundary
```

Não:

```text
all privileged Hub operations
→ one universal bus
```

Portanto:

```text
Git remote            → Git Infrastructure
production migration  → Release / Migration Runner
Registry publication  → Artifact Registry
Release promotion     → Release / Deployment
sandbox lifecycle     → Sandbox Infrastructure
```

A propriedade comum é que poder físico sensível permanece server-side; não que todo poder pertença ao mesmo módulo.

## Pesquisa comparativa

### Mitra

O acervo Mitra valida `caller expresses intent / server retains physical power`: app/agent referencia operações e Connections simbolicamente enquanto a plataforma mantém o acesso físico. Conexus preserva o padrão, mas adiciona admission mecânica e revisão exata de authority.

Fontes internas:

- `docs/reference/mitra/02-registro-artefatos.md`
- `docs/reference/mitra/04-integracao-externa.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

### Factory

Factory valida uma propriedade de monotonicidade: controles de camada inferior podem especializar/restringir o que uma organização permite, mas não devem ampliar limites superiores.

Referência interna:

- `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`

### Kubernetes

Authorization e admission são conceitos distintos. O valor transferido é:

```text
authorized principal
!=
operation admissible now
```

Referência: `https://kubernetes.io/docs/reference/access-authn-authz/`.

### Envoy

`ext_authz` demonstra a propriedade “decidir antes de abrir o upstream”. Referência: `https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_authz_filter.html`.

### Boundary / Vault

Credential injection demonstra “usar o poder sem entregar o material ao caller”. O Conexus adota a separação entre handle e custody, sem importar o produto.

### Nango

Valida mediação central de Connections/credentials. O Conexus rejeita usar um arbitrary upstream proxy como superfície normal de Production Agent ou Published App.

### MCP

MCP pode ser superfície de interoperabilidade futura, mas annotation/description de tool externa não vira authority Conexus.

### Stripe / AWS

Stripe fornece precedente para idempotency key de intended effect. AWS documenta throttling/quotas como best-effort, reforçando que throttle não substitui durable admission quando o limite é uma invariante de efeito/custo.

## Alternativas avaliadas

### A — Thin admission + execution boundary

**ADOTADA.**

```text
authoritative facts
        ↓
Gateway Admission
        ↓
DENY | ALLOW
          ↓
typed executor
          ↓
target
```

### B — proxy simples

**REJECT.** Mediar o acesso sem governar operation/target/effect/retry é insuficiente.

### C — policy/workflow engine central

**REJECT.** Duplicaria I&A, Project, Builder, Agent Runtime e Release.

### D — execução direta por cada domínio

**REJECT.** Duplicaria egress, role selection, retries, effect protocol e sanitization em múltiplos runtimes.

### E — toda tool passa pelo Gateway

**REJECT.** Internal domain calls sem trust/privilege boundary permanecem chamadas normais do modular monolith.

### F — universal operation bus

**REJECT.** Git, Registry, Release, Migration e Sandbox possuem lifecycles/failure modes próprios.

### G — OPA/Cedar/OpenFGA/policy DSL F1

**REJECT.** Não existe segundo authorization model que justifique engine genérica.

## Escopo F1

O Gateway cobre três casos reais:

1. **Project Data** — registered query/action, AnalyticQuery physical read e Builder data capabilities autorizadas;
2. **External Integration** — named ConnectorOperation sobre ConnectionRevision exata;
3. **Connection qualification dispatch** — o Gateway executa a probe; Connections continua owner do significado de qualification.

Não entra apenas por ser tool:

```text
read Project metadata
read Change state
record Finding
update Builder checklist
read Artifact metadata
read Brain metadata
read Connection metadata
```

## Admission

Nenhum browser/LLM/guest autodeclara autoridade por campos como role, environment, Connection ou approval status.

A propriedade conceitual é:

```text
mayExecute =
    callerAuthorized
  ∧ surfacePermits
  ∧ capabilityExists
  ∧ capabilityRevisionValid
  ∧ releaseOrCandidatePermits
  ∧ projectBindingValid
  ∧ targetEligible
  ∧ approvalSatisfied
  ∧ budgetAvailable
  ∧ preconditionsSatisfied
```

Qualquer fato requerido em `FALSE | UNKNOWN | STALE | MISSING | REVOKED` não vira allow.

O Gateway enforça sem assumir ownership:

```text
callerAuthorized       → Identity & Access
surfacePermits         → Builder / Agent Runtime / Published runtime
capability/classify    → Registry + kind contract owner
composition            → Release ou Builder candidate authority
binding                → Project
target                 → Connections
approval               → Production Agent Runtime / domain owner
budget definition      → runtime/artifact/project policy
precondition semantics → capability/domain contract
```

## Monotonicidade

Camada inferior pode apertar, nunca reduzir floor superior.

```text
operation approvalFloor = HUMAN
agent override = NONE
→ HUMAN
```

Não nasce `ExecutionGrant`/`AuthorityTicket` genérico. Calls normais calculam admission contra state atual; ApprovalRequest permanece no owner existente.

## Fluxo — Published App read

```text
Browser
  ↓ execute(slug,input)
Hub serving context
  ├── account/session
  ├── Project derivado da rota
  └── active Release
  ↓
Gateway Admission
  ↓
Project Data execution
  ├── menor DB role aplicável
  ├── prepared input
  ├── transaction regime
  └── row/byte/time limits
  ↓
Project DB
```

Read normal não recebe approval/effect machinery.

## Fluxo — Production Agent effect

```text
LLM proposal
  ↓
Production Agent Runtime
  ├── exact args/defaults
  └── ApprovalRequest quando requerido
  ↓ human approval
Gateway
  ├── revalida approval
  ├── revision/composition
  ├── Connection/target
  ├── authority
  ├── budget
  └── precondition
  ↓
effect admission
  ↓
execution
  ↓
receipt / traffic state / outcome
```

Approval torna a execução elegível; não executa por si só.

## Fluxo — Builder real-data discovery

```text
Pi/E2B
  ↓ ActorRun-bound caller proof
Hub resolves ActorRun/Project/Change authority
  ↓
Gateway
  ├── read-only
  ├── allowed scope
  ├── timeout
  └── result limits
  ↓
real source via Connection
```

O guest recebe resultado/evidência, não o acesso físico permanente.

## Fluxo — Connection qualification

```text
Connections
  ↓ exact ConnectionRevision
Gateway
  ├── exact ConnectorDefinition revision
  ├── target/environment
  └── non-mutating probe
  ↓
external system
  ↓ evidence
Connections decides qualification state
```

## Project Data

C-006 permanece authority para roles físicas. Query usa a role de leitura; action usa role de DML. Caller não escolhe owner/migrator.

Builder DEV pode ter capabilities tipadas de query/DML/DDL contra DEV autorizado. Isso não cria uma primitive `target=PROD`; production migration permanece no Release/Migration Runner.

AnalyticQuery continua owned semanticamente pelo Brain/analytic layer; quando produz plano físico autorizado, a execução de leitura usa a boundary de dados do Gateway.

## External Integration

```text
Named ConnectorOperation
  ↓
Gateway
  ├── exact ConnectorDefinitionRevision
  ├── exact ConnectionRevision
  ├── validated input
  ├── effect/idempotency/approval metadata
  ├── exact target
  └── limits
  ↓
External System
```

Production Agent/Published App não recebem arbitrary URL/method/header como primitive normal.

## Approval e preconditions

Gateway não owns ApprovalRequest/UI/inbox. Ele apenas verifica se a approval evidence exigida é válida para a execução exata imediatamente antes do efeito.

Precondition semantics ficam no capability/domain contract. Gateway enforça a forma física, como DML condicional com cardinalidade esperada ou version/ETag em API.

## Effect execution

Para efeitos materiais, Gateway owns semanticamente na boundary física:

```text
effect execution identity
atomic admission/claim
idempotency enforcement
traffic state
receipt
retry eligibility
OUTCOME_UNKNOWN
```

Isso não obriga criar entidade de produto genérica.

`traffic_state` mantém a distinção:

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

Request enviada + transporte interrompido pode ter sido processada. Não se inventa `FAILED`; `NON_IDEMPOTENT | UNKNOWN` não recebe blind retry.

## Limits e budgets

Gateway enforça limites físicos server-side: rows, result bytes, timeout, pagination ceiling e effect units conforme o tipo de capability.

```text
best-effort throttle
!=
durable effect budget
```

Reads simples podem usar mecanismo leve; effects com limite material usam admission durável. Budget definition permanece no runtime/artifact/project policy; Gateway enforça.

## Observability

Gateway produz Evidence `GATEWAY_AUTHORITY`. Observability persiste/correlaciona; nunca decide authorization/acceptance.

## Ownership explícito

- Identity & Access owns identidade, memberships, roles e permissions;
- Project owns bindings e intenção de configuração;
- Artifact Registry owns revisions/payloads/classification;
- Connections owns Connection/revision/qualification semantics;
- Builder owns Change/work graph/Findings;
- Production Agent Runtime owns AgentRun/ToolProjection/ApprovalRequest;
- Release owns composição, promotion e production migrations;
- secret-storage implementation permanece em infraestrutura própria;
- Observability registra Evidence, mas não decide;
- Gateway owns apenas enforcement + execução da boundary definida aqui.

## Explicitamente fora do Gateway

```text
production migration
Git push/PR/merge
Artifact Registry publication
Release promotion/CAS
sandbox create/destroy
secret-storage implementation
ordinary internal module calls
```

## Closed executors F1

Conceitualmente:

```text
Capability Gateway
├── ProjectDataExecutor
└── ExternalIntegrationExecutor
```

Nomes finais podem mudar; não existe executor plugin registry F1.

## Sem endpoint universal de baixo nível

Não criar uma surface pública onde caller escolhe diretamente role, raw target, transport method e policy. Entrypoints serão tipados por contexto; detalhes físicos são resolvidos server-side. Signatures ficam 3F.

## Invariantes de segurança/authority

1. caller não escolhe seu poder físico;
2. acesso permanente a target não sai para browser/LLM/guest;
3. target não é ampliado por input;
4. operation revision é exata;
5. binding/release context é server-side;
6. approval é revalidada no execution time;
7. budget é verificado antes do effect;
8. precondition é enforçada;
9. unknown outcome nunca vira fato inventado;
10. erros externos são sanitizados;
11. authoritative execution Evidence nasce no Hub/Gateway;
12. uma authority permissiva não compensa ausência de outra authority requerida.

## Anti-circumvention

Para capabilities governadas por esta boundary não pode existir caminho paralelo equivalente a:

```text
runtime → direct Project DB access
runtime → arbitrary external network call
agent → direct Connection access
browser → provider usando server-side authority
```

Drift que reintroduza caminho paralelo é finding arquitetural.

## Retry — princípio

```text
NOT_SENT + retryable
→ retry pode ser seguro

RESPONSE_RECEIVED + explicit retryable response
→ retry conforme contract

SENT_NO_RESPONSE + NON_IDEMPOTENT/UNKNOWN
→ no blind retry

OUTCOME_UNKNOWN
→ no blind retry
```

## Anti-overengineering F1

Não construir agora:

- OPA/Cedar/OpenFGA;
- policy/workflow DSL;
- service mesh;
- dynamic executor registry;
- arbitrary upstream proxy para Production Agent/Published App;
- universal execution bus;
- regra de que toda tool passa pelo Gateway.

## O que 3C-08 congela

1. existe `Capability Gateway` F1;
2. boundary in-process, não microservice obrigatório;
3. scope = Project-data/external-integration execution em nome de caller;
4. Admission + Execution no mesmo módulo;
5. enforcement de facts externos sem tomar ownership;
6. authority fail-closed e server-side;
7. caller não autodeclara role/target/approval;
8. Project data usa menor poder físico aplicável;
9. External Integration usa operação/revisões exatas;
10. qualification I/O passa pelo Gateway, semantics ficam em Connections;
11. approvals ficam no Agent Runtime e são revalidadas;
12. effect admission/idempotency/receipt/traffic state/`OUTCOME_UNKNOWN` pertencem à boundary física;
13. reads permanecem lightweight;
14. budget definition fica nos owners, enforcement no Gateway quando necessário;
15. Observability registra `GATEWAY_AUTHORITY`, não decide;
16. migrations, Git, Registry publication, Release promotion, sandbox lifecycle e secret storage ficam fora;
17. sem policy engine genérica F1;
18. sem dynamic executor registry;
19. sem arbitrary upstream proxy no runtime normal;
20. `Minimal Enforcement Surface` e `No Universal Privileged Bus` são normativos.

## Defer

- **3D:** dependency directions, anti-cycle rules, execution context e authority caching;
- **3E:** effect/execution ledger, durable budgets, idempotency claims e persistence;
- **3F:** signatures/envelopes/errors/caller proofs/refs;
- **3G:** effect FSM, retry/reconciliation e local-write × remote-effect;
- **3H:** runtime/process/concurrency/pools/performance;
- **3I:** physical authority, egress e credential handling;
- **3J:** operational topology, health/recovery/scaling.

## Decisão final

> `Capability Gateway` é o last-mile enforcement + execution boundary para Project-data e external-integration capabilities. Ele enforça fatos autoritativos dos respectivos owners sem absorvê-los, mantém o menor enforcement suficiente para cada failure mode e não vira um universal privileged-operation bus.

## Consequências

- 3D deverá impedir ciclos entre Gateway e authority providers;
- 3E deverá separar effect ledger de telemetry;
- 3F deverá impedir privileged facts caller-supplied;
- 3G deverá distinguir read/local write/remote effect;
- 3H manterá Gateway in-process por default até existir evidência para separação;
- 3I deverá provar authority/egress/credential isolation;
- C-008/C-016 ficam refinadas: “Gateway-only” significa a data/integration trust boundary desta decisão, não um universal privileged-operation bus;
- nenhuma implementação de produto é autorizada por esta decisão.
