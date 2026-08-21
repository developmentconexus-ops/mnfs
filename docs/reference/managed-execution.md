# Managed Execution and Model Spend

Current technical detail extracted without semantic rewriting from the accepted Phase-3 architecture baseline. `docs/architecture/index.md` owns the overview; this file owns the detailed task surface named by its title.

## 27. Managed Application Runtime architecture

## 27.1 Published Application serving

```text
request
→ server resolves Project/current authority
→ exact active served Release
→ exact digest-addressed verified frontend/runtime composition
```

No rebuild/latest fallback at serve time.

## 27.2 `job/v1`

First F1 consumer = governed managed sync.

```text
Project job/v1 artifact
→ exact active Release composition
→ derived schedule
→ MAR job_run occurrence
→ governed Gateway/Project capabilities
```

Current laws:

```text
manual + fixed interval
single-flight + coalesce
after downtime, at most one catch-up only when the current served Release still requires
  sync and current freshness is behind
not N missed-slot replay
```

This is the bounded MAR managed-sync profile. It is not a shared recurrence abstraction and does not apply to Product-Agent `SCHEDULE` skipped slots.

Rejected:

```text
arbitrary privileged Project job code
generic workflow/automation/scheduler business domain
```

## 27.3 Queue/scheduler technology

Q0 incumbent Package-D candidate:

```text
pg-boss 12.26.3
```

Status:

```text
QUALIFIED FOR CURRENT F1 TESTED TRANSACTIONAL-ADMISSION MECHANICS / PRIVATE MAR SUBSTRATE / NOT AUTHORITY
```

The one-catch-up/no-N-slots law is preserved as a Product owner-side law and first-build reconciliation conformance obligation. It is not a remaining pg-boss cron/catch-up qualification probe.

## 27.4 Failure and recovery

Current recovery scope stays limited to the real F1 managed-sync consumer.

An exact-pinned `JobRun` that was durably admitted before process loss remains the same semantic occurrence. Queue presentation/redelivery is private mechanics and never authorizes execution by itself. A later Release does not rewrite or re-resolve the admitted JobRun pins.

A `RUNNING` orphan settles only current sync facts before continuation or terminalization:

```text
exact JobRun / Release / job pins
durable sync freshness/cursor
deterministic Project DB merge/commit state
single-flight / one-current-catch-up rules
```

Cancel or timeout first prevents new owner-authorized retry/redelivery, requests cooperative handler stop, establishes handler quiescence where required, and then settles durable sync progress. Timeout, process death and `job.signal` are not rollback or terminal truth.

The same JobRun may continue only when its durable cursor/merge contract proves continuation deterministic and compatible. The current sync/job contract must therefore carry enough cursor/merge semantics for that decision; no generic `JobAttempt` or recovery lifecycle is added.

Current F1 managed-sync recovery does **not** include a generic MAR→Gateway unresolved-effect discovery seam. The first real effect-capable `MANAGED_JOB` is a reopen trigger for the smallest MAR/Gateway recovery boundary; only then is a correlation/discovery seam or smaller proven alternative admitted.

Recurrence after restart remains freshness-derived: at most one current catch-up when due, never N historical slot replays.

---

## 28. Model-provider spend architecture

Model spend is owner-local run authority:

```text
Builder model spend → Builder ActorRun
Product Agent spend → Product AgentRun
```

## 28.1 F1 finite-execution invariant

F1 requires a small server allowlist of providers/models, exact Release-pinned model identity, finite server-derived `maxModelCalls`/step limits, strict bounded retries and no automatic fallback cascade unless separately admitted. Caller/model/runtime state cannot widen those limits.

## 28.2 Missing/ambiguous usage

```text
usage missing
cost unsupported
response lost
crash
ambiguous provider outcome
→ never zero
→ remain visibly missing/unknown
```

## 28.3 Deferred monetary enforcement

The hard per-run USD/provider-invoice guarantee, pre-provider maximum-liability reservation, qualified cost envelope and monetary settlement machinery are deferred for F1 by 3L-R1. Reopen on commercialization/billing/quotas, automatic multi-provider routing, contractual hard per-run budgets, material autonomous cost exposure or evidence that bounded F1 controls are insufficient.

## 28.4 Status

Finite execution limits and truthful cost/usage missingness = **CURRENT F1 OBLIGATION**.

Package C advanced monetary enforcement = **DEFER SAFELY / NO F1 EXECUTION**.

No generic BudgetService/model proxy/token broker/ModelCallAttempt business domain F1.

---
