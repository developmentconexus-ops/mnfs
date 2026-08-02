---
id: DOC-TOOLING-ADOPTION
title: MNFS Tooling Adoption
document_type: tooling_reference
form: reference
authority: policy
status: accepted
version: 2.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - external tooling adoption state
related:
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-09
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-11
  - DOC-PRODUCT-BLUEPRINT-12
last_reviewed: 2026-08-02
---

# Tooling adoption

MNFS is Pi-first and adapter-driven. An external tool enters only for a named consumer, behind a replaceable boundary, with an explicit proof and Removal Conditions.

## Lifecycle

```text
RESEARCHED
→ CANDIDATE
→ SPIKE
→ PILOT
→ ADOPTED
→ DEPRECATED
→ REMOVED
```

## Current matrix

| Tool | MNFS role | State | Proof / next decision |
|---|---|---|---|
| Pi | primary reasoning and Worker runtime | ADOPTED | M1 planning accepted; M2 secure Worker proof pending |
| Lavish | structured visual review | ADOPTED | M1 exact-hash planning loop accepted |
| SQLite | local operational state | ADOPTED | M0/M1 restart proof accepted |
| Git | code and accepted repository artifacts | ADOPTED | accepted contracts and docs versioned |
| Treehouse | physical worktree and Lease adapter | CANDIDATE | M2 real WSL2 Lease/recovery proof |
| Anthropic Sandbox Runtime | E1 local process sandbox | CANDIDATE | AS-02 |
| Herdr | optional terminal projection | DEFERRED | absence must not affect correctness |
| `pi-observational-memory` V3 | optional Lead Session memory | CANDIDATE | AS-01 after M3 |
| `pi-link` | future notification/steering transport | DEFERRED | durable command semantics first |
| Dev Container Spec/CLI | optional environment-as-code | TARGET | Repository Profile binding in M7 or earlier proven need |
| Daytona | future remote workspace | RESEARCHED | AS-04 before M12 |
| E2B | narrow remote sandbox alternative | RESEARCHED | AS-04 comparison |
| Ona | Software Factory/environment reference | REFERENCE | no runtime dependency |
| Firecracker | E4 isolation reference | REFERENCE | use established platform, do not build local runtime |
| OpenTelemetry | telemetry interchange | TARGET | instrument after stable end-to-end flow |
| Phoenix | local trace/evaluation backend | CANDIDATE | AS-03 |
| Langfuse | trace/evaluation backend | CANDIDATE | AS-03 |
| 1Password CLI | local secret injection binding | OPTIONAL | M7 provider-specific proof |
| SOPS | encrypted configuration binding | OPTIONAL | M7 provider-specific proof |
| no-mistakes | optional Delivery adapter | DEFERRED | M8 authority-overlap evaluation |
| Backstage | future multi-repository portal | OPTION | AS-05 before M11 |
| FirstMate | pattern and benchmark source | REFERENCE | never domain/runtime authority |

## Authority boundaries

```text
MNFS
→ domain, contracts, state, decisions, policy and gates

Pi
→ probabilistic reasoning and tool execution

Treehouse
→ physical worktree pool

Sandbox Runtime
→ technical process enforcement

Lavish
→ human review transport

Herdr
→ operational presentation

Observability backend
→ telemetry/evaluation projection

Git
→ code and versioned artifacts

SQLite
→ local operational state
```

## Admission rule

A tool is not adopted because it is popular or used by FirstMate. It must have:

1. a named failure mode or capability consumer;
2. a simpler baseline comparison;
3. a narrow adapter;
4. preserved MNFS authority;
5. real acceptance evidence;
6. a pinned version and source/license review;
7. Removal Conditions.
