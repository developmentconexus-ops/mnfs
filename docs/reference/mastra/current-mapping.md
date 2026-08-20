# Conexus OS to Mastra Current Mapping

## Ownership split

| Conexus OS owns | Mastra provides |
| --- | --- |
| Product authority | Agent runtime mechanics |
| Workspace and Project | Memory substrate |
| Release and immutable serving composition | RequestContext runtime/configuration carrier |
| RuntimeAgentProjection | native `requireApproval` and suspend/resume mechanics |
| AgentRun and terminal Product truth | Workflow for real deterministic flow |
| ApprovalRequest and current approver/revocation truth | Scheduler trigger mechanics |
| TriggerRevision and narrow scheduled admission | storage adapters |
| Gateway EffectAttempt and effect authority | observability contracts/exporters |
| authorization, budgets, current owner truth | framework-local traces, snapshots, and runtime records |

## Accepted realization

- Product Agent: direct Mastra `Agent`; no universal Workflow wrapper.
- Conversation: Mastra Memory with explicit Conexus-derived `threadId` and `resourceId`; Brain remains separate.
- RequestContext: runtime/configuration/correlation substrate, not authority. Pinned restart Evidence showed stale omitted keys may survive resume. Governed decisions re-read current owner truth.
- Risky tool pause: native `requireApproval`; PAR owns `ApprovalRequest`, eligibility, revocation, and continuation admission.
- Effects: Gateway owns exact authorization, idempotency, execution, and `EffectAttempt` truth. Model/framework output never proves effect completion.
- Scheduling: native Mastra Scheduler may trigger, but execution crosses narrow PAR admission before AgentRun/model work. Scheduler state is not MAR due-work or recurrence authority.
- Workflow: use only for a real deterministic multi-step flow; universal wrapping of every Agent is rejected.
- Builder/PAR isolation: separate BuilderMastra and ParMastra instances; enabled F1 same-process surfaces are qualified conditionally.
- DurableAgent: deferred safely; activation is a requalification trigger.

## Tested same-process boundary

Separate storage/schema, registry, workflow, agent, model fixture, and PubSub identities were exercised for enabled surfaces. A deliberately shared PubSub negative control demonstrated the wiring guard can fire. Disabled scorer/evaluation, Observational Memory, DurableAgent, and other process-global facilities remain unqualified and off.

## Exact qualification pins

```text
@mastra/core 1.56.0
@mastra/memory 1.25.0
@mastra/pg 1.19.0
PostgreSQL 17.10
Node 24.18.0
```

Current Context7 documentation was checked during consolidation for RequestContext, Memory scoping, approval/suspension, schedules, storage, workflows, and observability. It supports the mechanism/authority distinction but does not supersede the pinned qualification.

