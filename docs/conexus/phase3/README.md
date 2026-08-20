# Fase 3 — Detailed Decision Index

Este diretório contém as decisões detalhadas da Fase 3 — Architecture & System Design do Conexus.

> **Status/navigation authority:** [LEDGER.md](LEDGER.md).  
> Este README é somente um índice de descoberta. Não duplica o live status para evitar que um summary secundário se torne stale ou concorra com o LEDGER.

## Read path

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ exact accepted phase/task authority
→ supporting evidence/current implementation when material
```

Conversa, review, dialogue e pesquisa continuam evidence/input; não viram authority sem ratificação explícita.

## Current orientation

Consulte sempre o [LEDGER](LEDGER.md) para o estado exato. Os checkpoints/current task authorities relevantes são:

- [3A-R10 — Pre-Implementation Convergence & Realization Routing](3A-R10-pre-implementation-convergence-realization-routing.md).
- [3L-Q0 — Technology Qualification Manifest](3L-Q0-qualification-manifest.md).

No momento desta atualização:

```text
3B–3K = CLOSED / APPROVED
3A-R10 = APPROVED
3L — Technology Qualification = IN PROGRESS
3L-Q0 = APPROVED / COMPLETE
Package A — Builder Substrate + Cognition = IN PROGRESS / A1+A2 COMPLETE / A3 CODEX OAUTH SMOKE NEXT
C-018 = NOT YET RATIFIED
product implementation = BLOCKED
PR #40 merge = explicit operator authorization required
```

Se este snapshot divergir do LEDGER, **o LEDGER vence**.

## Decision families

### Architecture Reconciliation

- [3A-R5 — Builder / Coding Runtime Reassessment](3A-R5-builder-coding-runtime-reassessment.md)
- [3A-R6 — Phase 3 Critical Path & Implementation Readiness](3A-R6-phase3-critical-path-implementation-readiness.md)
- [3A-R7 — Platform Consultant Ownership Reconciliation](3A-R7-platform-consultant-ownership-reconciliation.md)
- [3A-R8 — Project Baseline & Change Engineering Coherence](3A-R8-project-baseline-change-engineering-coherence.md)
- [3A-R9 — Managed Job / Deterministic Sync Dispatch Reconciliation](3A-R9-managed-job-deterministic-sync-dispatch-reconciliation.md)
- [3A-R10 — Pre-Implementation Convergence & Realization Routing](3A-R10-pre-implementation-convergence-realization-routing.md)

### 3B — System Context & Boundaries

Historical/detail authority: `../24-arquitetura-system-design.md` plus `3B-*` decisions.

### 3C — Domain / Module Architecture

- `3C-01..3C-15`
- [3C-R1 — Cross-review Closure](3C-R1-cross-review-closure.md)

### 3D — Dependency Architecture

- `3D-01..3D-04`
- [3D-R1 — Final Closure](3D-R1-dependency-architecture-final-closure.md)

### 3E — Data Architecture

- `3E-01..3E-02`
- [3E-R1 — Final Closure](3E-R1-data-architecture-final-closure.md)

### 3F — Contracts & API Architecture

- `3F-01..3F-06`
- [3F-R1 — Final Closure](3F-R1-contracts-api-architecture-final-closure.md)

### 3G — Behavioral / State Architecture

- `3G-01..3G-08`
- [3G-R1 — Final Closure](3G-R1-behavioral-state-architecture-final-closure.md)

### 3H — Runtime & Agent Architecture

- [3H-01 — Builder Coding Runtime Realization](3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md)
- [3H-02 — Production Agent Runtime Realization](3H-02-production-agent-runtime-realization.md)
- [3H-03 — Runtime Isolation, Correlation & Handoff](3H-03-runtime-isolation-correlation-handoff.md)
- [3H-R1 — Final Closure](3H-R1-runtime-agent-architecture-final-closure.md)

### 3I — Security / Authority Architecture

- `3I-01..3I-05`
- [3I-R1 — Final Closure](3I-R1-security-authority-architecture-final-closure.md)

### 3J — Deployment / Operations Architecture

- `3J-01..3J-03`
- [3J-R1 — Final Closure](3J-R1-deployment-operations-architecture-final-closure.md)

### 3K — Frontend / Product Architecture

- `3K-01..3K-04`
- [3K-R1 — Final Closure](3K-R1-frontend-product-architecture-final-closure.md)

## 3L routing after 3A-R10 + Q0

3L is **Technology Qualification**, not framework exploration. [3L-Q0](3L-Q0-qualification-manifest.md) is **APPROVED / COMPLETE** and binds deciding evidence to exact versions/configuration. Historical probe criteria must be compiled against current authority before execution.

Execution is intentionally serial to avoid branch divergence:

```text
Package A — Builder Substrate + Cognition
  CX-SBX-E2B-01
  CX-BUILDER-MASTRA-01
  CX-BUILDER-COGNITION-01
↓ adjudication
Package B — Product Agent + Cross-Runtime
  CX-AGENT-MASTRA-01
  CX-RUNTIME-ISOLATION-01
↓ adjudication
Package C — Model Economics / Enforcement
  3I-03 technology-dependent interception/retry/usage/cost-envelope subset
↓ adjudication
Package D — Managed Execution
  CX-MANAGED-JOB-01
↓ adjudication
Package E — Deciding Evidence
  Verification Observability deciding-evidence subset
↓ internal completeness/deletion check
ONE final independent Fable review of complete 3L
```

Builder Observational Memory is **MUST EVALUATE / NOT MUST ENABLE**. Product Agent OM, Semantic Recall and Memory Extractors remain consumer/eval-gated unless a later accepted decision says otherwise.

## Downstream first-build proof map

These proof obligations are intentionally **not pulled into 3L** when they require implemented Conexus bytes to exist. They remain mandatory in the implementing slices and must be placed by post-C-018 Realization Planning:

```text
CX-BRAIN-V0-01
CX-BRAIN-DISCOVERY-01
CX-BRAIN-FEEDBACK-01
CX-SCAFFOLD-V0-01
CX-OBS-V0-01           ← compile historical Pi-specific criteria to current Mastra authority
CX-PUB-V0-01
CX-REL-V0-01
QA-DB-1 / QA-DB-2 / QA-DB-3
C-016 F1 Security Baseline conformance
C-003 QUA-1 Golden benchmark / QUA-4 Worker Eval as applicable
```

## Structural map preserved

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

Transversal application runtime profile remains:

```text
ApplicationRuntimeProfile = MANAGED | DEDICATED
```

`DEDICATED Application Runtime` is a Project output/runtime, not a Hub module.

## Program route

```text
3A-R10 checkpoint
→ 3L Technology Qualification
   Q0 COMPLETE
   Package A IN PROGRESS — A3 CODEX OAUTH SMOKE NEXT
→ 3M Failure & Recovery
→ 3N Architecture Verification
→ 3O Vertical Architecture Proof Contract
→ C-018
→ F3B-R1 canonical product repo/cutover gate
→ post-C-018 Implementation Realization Planning Gate
→ accepted executable implementation plan(s)
→ product implementation
→ slice-owned first-build conformance probes
→ Golden Budget Analyzer
→ SERVED_VERIFIED
```

No product implementation is authorized by this index, and PR #40 must not be merged without explicit operator authorization.