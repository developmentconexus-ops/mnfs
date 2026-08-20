# Phase 3L — Technology Qualification

## Final state

| Package / claim | Outcome |
| --- | --- |
| Package A | COMPLETE; Builder Mastra/E2B/native Codex OAuth tested properties accepted; physical-incarnation guard required |
| Package B | CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES |
| Package C | DEFER SAFELY / NO F1 EXECUTION |
| Package D | CLOSED / LEAD-ADJUDICATED / QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION |
| Package E | DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE |
| `CX-AGENT-MASTRA-01` | QUALIFIED FOR CURRENT F1 TESTED PROPERTIES |
| `CX-RUNTIME-ISOLATION-01` | QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES |
| `CX-MANAGED-JOB-01` | QUALIFIED FOR CURRENT F1 TESTED TRANSACTIONAL-ADMISSION SUBSET; downstream remainder preserved |

## Exact pins and identities

```text
@mastra/core 1.56.0
@mastra/memory 1.25.0
@mastra/pg 1.19.0
PostgreSQL 17.10
Node 24.18.0
Package-B lock SHA-256 = 5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
pg-boss 12.26.3
```

Exact package locks, criteria, tests, fixtures, raw JSON Evidence, and vendor DDL live under `qualification/3l/`. [../evidence/qualification/3L/summary.md](../evidence/qualification/3L/summary.md) maps the durable evidence.

## Proven

- Direct exact Agent behavior and explicit conversation Memory scoping.
- Persistent suspension/restart behavior, including stale omitted RequestContext values.
- Native `requireApproval` plus current PAR owner denial/allow boundary.
- Native Scheduler mechanics crossing narrow PAR admission before Agent execution.
- Separate BuilderMastra/ParMastra instances for enabled same-process F1 surfaces; negative shared-PubSub control fired.
- Transactional owner admission plus pg-boss projection through one physical PostgreSQL transaction; rollback, concurrency, rediscovery, and queue-not-authority controls fired.

## Not proven

No Product implementation correctness, provider/model quality, real E2B external effect, Sankhya integration, Product MAR, Release, cron/future scheduling, cancellation/timeout/orphan recovery, partial-progress recovery, full observability ingestion, HA, or production topology correctness is claimed.

## Downstream obligations

Current owner truth must be revalidated at governed boundaries; stale runtime context never authorizes. Disabled scorer/evaluation, DurableAgent, Observational Memory, and other globals require requalification before enablement. Managed execution retains owner uniqueness, one-catch-up recurrence law, exact Release pinning, vendor-DDL migration integration, and 3M recovery work. Observability requires an exact admitted `@mastra/observability` pin and Conexus-authored trusted export path.

## Reviews and verification

The final 3L independent Fable review was incorporated. The accepted final closure recorded zero remaining material technology questions and root verification PASS on the exact Phase-3 tree. This repository consolidation preserves that result; it does not rerun or broaden it.

The block below is the frozen 3L-closure snapshot, not current status authority. Consult [../ROADMAP.md](../ROADMAP.md) for current phase and implementation status.

```text
3L = CLOSED
3M = NEXT / NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```

Requalification triggers are canonical in [../reference/mastra/qualification-and-reopen-triggers.md](../reference/mastra/qualification-and-reopen-triggers.md).
