# Mastra Evaluation

Mastra was evaluated as a replaceable execution framework, not as Product architecture. The accepted Global Maximum uses native primitives where they fit named mechanics while retaining Conexus OS owners.

Adopted: direct Agent, Memory with explicit thread/resource scope, RequestContext for runtime configuration/correlation, native `requireApproval`, persistent suspend/resume, native Scheduler triggering through narrow PAR admission, separate Builder/PAR instances, storage adapters, and public observability contracts.

Adapted: approval resumes only after current PAR owner truth is checked; scheduled execution becomes a TriggerRevision/AgentRun only after PAR admission; observability exports into Conexus-owned trust/correlation and never determines business completion.

Deferred: DurableAgent, advanced memory/Observational Memory, scorer/evaluation globals, active-run reconnect/recovery, agent networks/subagents, and advanced framework-global facilities.

Rejected: universal Workflow wrapping, Mastra Stored/Editor/latest Agent as release authority, RequestContext as authorization authority, Scheduler as MAR recurrence/due-work authority, framework tables as Conexus observability truth, and framework mechanics creating generic Product owners.

See [../../reference/mastra/framework-findings.md](../../reference/mastra/framework-findings.md) for the full accepted technical reasoning.

