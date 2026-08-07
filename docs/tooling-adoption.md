---
id: DOC-TOOLING-ADOPTION
title: MNFS Tooling Adoption
document_type: tooling_reference
form: reference
authority: projection
status: current
version: 3.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - current external substrate projection
related:
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - TRACKING-DECISIONS
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-09
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-11
  - DOC-PRODUCT-BLUEPRINT-12
last_reviewed: 2026-08-07
---

# Tooling adoption

This document is a **projection of current capability-realization decisions**. It is not the architectural authority that decides what MNFS means.

Operator decisions D-012 through D-014 supersede the former tool-first assumption that Pi, Treehouse, a specific sandbox runtime or a future remote provider are inherently canonical product foundations.

Canonical sourcing direction:

```text
Thin Sovereign Semantic Kernel
+
Selective Open Substrates
```

MNFS owns differentiated semantics and authority. External tools realize mechanical capabilities only when they preserve that authority and eliminate enough machinery to justify their integration.

## Capability-realization vocabulary

```text
OWN
ADOPT
ADAPT
SPIKE
REFERENCE
DEFER
REJECT
```

These dispositions apply first to **capabilities and integration shapes**, not brands.

## Admission rules

A material dependency or substrate must have:

1. a named current or explicitly staged consumer;
2. a simpler baseline comparison;
3. a clear statement of what machinery it eliminates;
4. preserved MNFS authority and no duplicate source of lifecycle truth;
5. proofability in the canonical environment when applicable;
6. license, sovereignty and lock-in review;
7. a public/supported integration boundary and pinned provenance for foundational use;
8. upgrade policy and Removal Conditions;
9. a replacement/exit path whose cost is understood.

Additional rules:

- prefer the **lowest sufficient upstream layer**;
- prefer **one primary production substrate per concern**;
- do not add a dependency that merely replaces a small local helper with a larger integration surface;
- small local implementations may win when genuinely simpler and safer;
- proprietary foundational runtimes are `REFERENCE` by default unless an explicit Operator Decision accepts the sovereignty trade-off;
- generic provider/plugin abstractions require a second real consumer.

## Current capability projection

| Capability / concern | MNFS ownership | Current substrate/candidates | Disposition / next proof |
|---|---|---|---|
| operational state | lifecycle/schema meaning | SQLite | `ADOPT` engine; MNFS owns semantics |
| code/result tree | accepted Git identity and bindings | Git | `ADOPT` |
| visual plan review | approval semantics | Lavish | current `ADAPT`; revisit only if a better review surface has a named consumer |
| Agent Runtime | Role/ActorRun/Authority boundary | Pi incumbent; OpenCode/ACP challenger; second ACP implementation | `SPIKE` under D-012; no production winner selected |
| agent interoperability | MNFS runtime boundary | ACP | `SPIKE`; adopt only if multi-implementation conformance reduces total complexity |
| runtime Session / compaction | authority precedence only | selected agent runtime; Mastra reference | `ADAPT/DEFER`; never domain authority |
| live wake/steer | durable command meaning | Mastra Signals or another transport | `DEFER` until named live-session consumer |
| local process isolation | Environment policy identity | Anthropic Sandbox Runtime incumbent; nono challenger; Sandlock conditional | comparative `SPIKE` under D-013 |
| local microVM envelope | Environment semantics | BoxLite; `smol-machines/smolvm` | comparative `SPIKE` under D-013 |
| physical mutable workspace | WriteTrack ownership + Git result boundary | Treehouse/native Git incumbent mechanics; VFS/AgentFS if still needed | defer selection until execution-envelope spike resolves required workspace properties |
| whole-agent policy/inference brokerage | MNFS authority remains external | OpenShell | `REFERENCE`; possible future `SPIKE` |
| sandbox control plane | Environment lifecycle meaning | OpenSandbox | `REFERENCE`; future candidate when a named local/remote control-plane consumer exists |
| remote Firecracker execution | Environment semantics | E2B | `DEFER → SPIKE` for remote scale/BYOC consumer |
| remote/parallel sandboxing | Environment semantics | Mitos, Sandbox0, Kubernetes Agent Sandbox | `REFERENCE / DEFER` until named parallel/remote consumer |
| Daytona | none | public historical implementation | `REFERENCE`; public core no longer primary active development path |
| quality checks | Standard/applicability/Evidence binding | repo-native linters, typecheckers, scanners, contract tools | `ADAPT`; do not build a universal MNFS linter |
| browser automation | QA Journey/Evidence meaning | Playwright | expected `ADOPT/ADAPT` when QA consumer arrives |
| exploratory browser agent | QA authority/policy | agent-browser or equivalent | `SPIKE` only for a named exploratory Journey |
| provider/tool integration | Credential/Effect semantics | MCP, official provider SDKs/CLIs | `ADOPT/ADAPT`; tool availability never grants Effect Authority |
| credential delivery | Grant semantics | OIDC/workload identity, OS secret store, 1Password/SOPS, substrate brokers | `ADAPT`; MNFS never stores plaintext or becomes a password manager |
| telemetry interchange | domain event/attribute meaning | OpenTelemetry / OTLP | expected `ADOPT` when instrumentation consumer arrives |
| observability/eval backend | calibration meaning | Phoenix, Langfuse or another backend | `DEFER/SPIKE` |
| evaluation execution | Golden Mission/Evaluation semantics | Harbor or equivalent | `DEFER/SPIKE` |
| operator web stack | Mission-first interaction semantics | conventional open web stack | `DEFER`; adopt commodity framework when UI consumer exists |
| repository portal | catalog semantics | Backstage | `REFERENCE/DEFER` |
| durable distributed scheduling | domain work semantics | Temporal/Restate/DBOS/Inngest or future candidates | `DEFER`; compare upstream when a named distributed consumer appears |
| custom agent loop | none | — | `REJECT` by default |
| custom browser engine | none | — | `REJECT` |
| custom hypervisor/container runtime | none | Firecracker/Kata/gVisor are upstream building blocks/references | `REJECT` direct MNFS implementation by default |
| custom VCS/database engine | none | Git/SQLite | `REJECT` |
| Factory.ai / Droid | architecture reference only | proprietary product/runtime | `REFERENCE`; foundational dependency rejected under current sovereignty posture |
| FirstMate | pattern/laboratory reference | external project | `REFERENCE` |

## Historical Evidence does not equal permanent selection

An upstream tool can have accepted historical Evidence and still be reopened as a realization choice.

Examples:

```text
Pi AS-02 proof
→ strong incumbent Evidence
→ not permanent Agent Runtime authority

Treehouse M01 proof
→ accepted Evidence for the implemented worktree realization
→ not proof that WriteTrack must always be a worktree

Anthropic Sandbox Runtime AS-02 proof
→ accepted process-envelope Evidence
→ incumbent, not unchallengeable architecture
```

Sunk cost and prior successful integration are migration-cost inputs, not reasons to stop inquiry.

## Lifecycle projection

For a selected external substrate, operational adoption may still move through:

```text
RESEARCHED
→ CANDIDATE
→ SPIKE
→ PILOT
→ ADOPTED
→ DEPRECATED
→ REMOVED
```

This lifecycle is subordinate to capability sourcing decisions. A tool may also remain `REFERENCE` or `DEFER` indefinitely without entering the adoption lifecycle.
