# Mastra Qualification and Reopen Triggers

## Evidence map

| Claim | Durable result | Reproducible location |
| --- | --- | --- |
| `CX-AGENT-MASTRA-01` | Qualified for current F1 tested properties | `qualification/3l/mastra-runtime/` BT-1 through BT-4N |
| `CX-RUNTIME-ISOLATION-01` | Qualified same-process for enabled F1 surfaces | BT-5N source, fixtures, test, and JSON Evidence |
| Builder substrate | Qualified tested properties with physical-incarnation guard | `qualification/3l/builder-substrate/` |
| `CX-MANAGED-JOB-01` | Qualified transactional-admission subset | `qualification/3l/managed-execution/` |

## Requalify before

- upgrading any exact Mastra pin, Node, PostgreSQL major/minor assumption used by the proof, pg-boss, E2B, or native Codex OAuth path;
- enabling scorer/evaluation, Observational Memory, DurableAgent, shared mutable globals, new storage domains, or cross-role facilities not exercised by BT-5N;
- changing RequestContext merge/resume semantics or trusting it for owner authorization;
- replacing direct Agent, native approval, Memory scoping, Scheduler ingress, or separate role instances;
- adding active-run automatic crash recovery or reconnect-to-same-stream guarantees;
- changing Builder/PAR process topology, storage/schema isolation, or PubSub identity wiring;
- selecting/admitting `@mastra/observability` or relying on telemetry completeness;
- allowing Product-Agent browser/source/workspace access, subagents/networks, agent-as-tool, external MCP/A2A clients, or advanced memory;
- altering owner admission, queue projection, recurrence, release handoff, cancellation, timeout, orphan, or partial-progress behavior.

## Boundaries

Fresh current docs are supporting mechanics. Exact lock/source and real bounded probes decide version-specific claims. Qualification never creates Product requirements and never establishes complete implementation or production correctness.

