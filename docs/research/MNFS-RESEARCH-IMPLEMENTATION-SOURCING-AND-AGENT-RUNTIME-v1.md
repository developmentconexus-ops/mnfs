---
id: DOC-RESEARCH-MNFS-RESEARCH-IMPLEMENTATION-SOURCING-AND-AGENT-RUNTIME-v1
title: MNFS Research — Implementation Sourcing, Agent Runtime and Reuse Boundaries
document_type: research_report
form: explanation
authority: research_historical
status: published
source_manifest: MNFS-RESEARCH-IMPLEMENTATION-SOURCING-AND-AGENT-RUNTIME-v1.sources.json
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-IMPLEMENTATION-SOURCING-AND-AGENT-RUNTIME-v1
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - CAP-EXECUTION
  - ADR-0001
  - ADR-0005
  - ADR-0006
  - ADR-0008
  - GH-ISSUE-21
last_reviewed: 2026-08-07
tracking_issue: 21
---

# MNFS Research — Implementation Sourcing, Agent Runtime and Reuse Boundaries

**Status:** Published research evidence for `MIS-002/M02` R5 preparation  
**Date:** 2026-08-07  
**Scope:** Reassess how the accepted MNFS product architecture should be realized now that execution has begun and mature agent/runtime/infrastructure primitives exist upstream

---

# 1. Executive conclusion

The MNFS product architecture should be preserved.

The implementation-sourcing strategy should become more explicit.

The core conclusion is:

> **MNFS should own differentiated semantics and authority, while adopting or adapting replaceable mechanical infrastructure whenever an upstream primitive can satisfy the required boundary without becoming a second domain authority.**

This is not a framework-selection decision. It is a realization rule.

The product should continue to own:

```text
Mission / Milestone / Feature semantics
Acceptance Criteria and MCRM
Approved Contract and Authority
Write Track / Attempt / Worker Run semantics
Claim / Receipt / Verdict
Evidence and staleness
Engineering Governance
Recovery and Reconcile decisions
External Effect semantics
hierarchical closure
```

The product should actively avoid rebuilding commodity machinery such as:

```text
LLM provider loops
OAuth/provider clients
agent wire protocols
browser engines
GitHub/Linear/Slack protocol clients
telemetry protocols
remote VM/sandbox fleets
workflow schedulers
pub/sub transports
```

unless a required invariant cannot be satisfied by an existing replaceable component.

The immediate M02 conclusion is more specific:

```text
Pi 0.83.0 agent loop                  ADOPT
Pi 0.83.0 RPC wire protocol           CANDIDATE — CONFORMANCE REQUIRED NOW
Pi internal RpcClient helper          REJECT FOR DIRECT M02 USE
MNFS bounded process authority        OWN
MNFS strict RPC adapter               BUILD SMALL ADAPTER
Pi trusted extension/tool surface     ADAPT
Treehouse                              PRESERVE / ADAPT
SEC-E1 + Sandbox Runtime              PRESERVE / ADAPT
Mastra Factory runtime                REFERENCE ONLY FOR M02
Mastra AgentController / Signals      DEFER TO EXPANDED AS-01 SPIKE
Generic durable workflow engine       DEFER IN H1
```

No reviewed source creates a material conflict with `MIS-002` revision 5.

Current disposition:

```text
REPLAN_REQUIRED = NO
```

The new evidence changes likely **implementation design**, not the approved M02 outcome, criteria or authority model.

Before the M02 microdesign is accepted, a small real Pi RPC conformance proof should verify the exact `0.83.0` process/resource/security composition. This is an R5 external-tool design input, not production Worker dispatch.

---

# 2. Why this review is necessary now

The Product Blueprint was intentionally written before implementation details were known. It defines capabilities, responsibilities, authorities and long-term seams rather than freezing every library. [mnfs-blueprint-architecture] [mnfs-blueprint-roadmap]

That was correct.

The project has now crossed a threshold:

```text
M0/M1
→ product and planning skeleton proven

M01
→ durable execution identities and Treehouse lifecycle implemented

M02
→ first real governed Worker boundary
```

At this point, interpreting every conceptual component in the Blueprint as software that MNFS itself must implement would create a new risk:

```text
sound architecture
→ unnecessary custom infrastructure
→ large maintenance surface
→ slow product progress
→ less time spent on the actual differentiator
```

The Blueprint already prevents this outcome if read correctly.

Section 5 states that dependencies point inward and that external tools implement replaceable ports. It explicitly keeps Pi SDKs, Treehouse commands, process APIs, browser automation and provider SDKs outside the Domain Core. [mnfs-blueprint-architecture]

ADR-0001 similarly states that Pi is the first execution runtime while the domain must not import Pi APIs directly. [mnfs-adr-pi-first]

Therefore the new research question is not:

> Which existing architecture should we replace?

It is:

> Which accepted MNFS responsibilities are differentiated semantics, and which can be realized by upstream machinery behind an MNFS-owned boundary?

---

# 3. Research method

This report uses five tests for every candidate dependency.

## 3.1 Semantic ownership test

Ask:

> If this behavior changes, does the meaning of an MNFS Mission, Criterion, Claim, Evidence item, Authority decision or Recovery outcome change?

If yes, the semantic rule remains MNFS-owned even when machinery is external.

## 3.2 Authority inversion test

Ask:

> Would adopting this component make its workflow/session/task state the place from which MNFS lifecycle truth is inferred?

If yes, either:

- reject the integration shape;
- constrain it behind an adapter;
- or require an explicit architecture decision before adoption.

## 3.3 Mechanical leverage test

Ask:

> Is the candidate solving difficult but non-differentiated machinery that would otherwise require substantial custom code and ongoing maintenance?

High leverage favors adoption.

## 3.4 Replaceability test

Ask:

> Can the candidate fail, upgrade or be removed without migrating core MNFS semantics?

A good adapter dependency preserves stable MNFS identity and contracts while allowing implementation replacement.

## 3.5 Proofability test

Ask:

> Can the integration be verified against the exact applicable criteria in the canonical environment?

A library being popular, feature-rich or well designed is not proof that it satisfies MNFS requirements.

---

# 4. Sourcing vocabulary

This report uses these dispositions.

| Disposition | Meaning |
|---|---|
| `OWN` | The semantic behavior and authority belong to MNFS. |
| `ADOPT` | Use the upstream primitive substantially as designed. |
| `ADAPT` | Reuse upstream machinery behind an MNFS-owned port/policy boundary. |
| `SPIKE` | Candidate has material leverage but needs real proof before adoption. |
| `REFERENCE` | Study implementation/patterns without runtime dependency. |
| `DEFER` | Potentially useful, but no current consumer justifies adoption. |
| `REJECT` | The evaluated integration shape contradicts an invariant or costs more than it saves. |

This report intentionally does not introduce these as constitutional product types yet. They are research vocabulary for R5 decisions.

A later Engineering System change may formalize a narrower version after repeated use.

---

# 5. The MNFS semantic kernel

The following concerns are product differentiation and must remain MNFS-owned.

## 5.1 Work definition

```text
Mission
Milestone
Feature
qualified identities
Acceptance Criteria
requirements allocation
Approved Contract
```

The Product Blueprint defines MNFS as the deterministic control plane around probabilistic workers. [mnfs-blueprint-vision]

A third-party board, workflow or agent session can project this state but must not replace it.

## 5.2 Execution meaning

MNFS owns the meaning of:

```text
Write Track
Attempt
Worker Run
Claim
Lease semantic state
Execution Environment binding
```

A process PID, agent thread or sandbox instance is an observed physical resource, not the domain object itself. [mnfs-blueprint-architecture] [mnfs-blueprint-recovery]

## 5.3 Quality meaning

MNFS owns:

```text
Claim
≠ Receipt
≠ Verdict
```

and criterion-bound Evidence, freshness and acceptance Authority. [mnfs-blueprint-vision]

No agent-framework `done`, workflow completion, PR merge or test exit code can be mapped directly to Feature/Milestone/Mission closure.

## 5.4 Recovery meaning

MNFS Recovery is not generic workflow resume.

It reconciles independent authorities:

```text
SQLite operational state
Git code tree
Treehouse physical worktree
OS process existence
Pi runtime/session observations
sandbox/provider observations
```

and computes a safe next action without silently choosing whichever external component most recently reported success. [mnfs-blueprint-recovery]

## 5.5 Engineering Governance

MNFS owns:

```text
Standard meaning
applicability
Golden Path meaning
Waiver meaning
required Evidence
Quality Posture
```

but the check that enforces a Standard should normally be an existing repository tool when one exists. [mnfs-blueprint-engineering]

---

# 6. Broad build/adopt map

The first product-wide disposition is:

| Concern | MNFS ownership | Candidate machinery | Current disposition |
|---|---|---|---|
| Mission/Plan/Contract | full semantics | — | `OWN` |
| Criteria/MCRM | full semantics | — | `OWN` |
| Track/Attempt/Claim | full semantics | — | `OWN` |
| Receipt/Verdict/Gate | full semantics | — | `OWN` |
| SQLite lifecycle model | schema/transactions/state meaning | SQLite engine | `OWN + ADOPT` |
| physical worktrees | Lease semantics/fencing | Treehouse | `ADAPT` |
| agent reasoning loop | authority boundary only | Pi | `ADOPT` |
| Pi process wire protocol | Worker Run/process mapping | Pi RPC | `SPIKE → likely ADAPT` |
| Writer tool execution | allowed capability/policy | Pi extensions + SEC-E1 broker | `ADAPT` |
| local OS isolation | Environment/policy identity | Sandbox Runtime/Bubblewrap | `ADAPT` |
| session runtime | L0/L1 authority precedence | Pi/Mastra | `SPIKE in AS-01` |
| wake/notification | durable command meaning | Mastra Signals or other transport | `SPIKE in AS-01` |
| multi-harness protocol | Role/Authority semantics | ACP | `DEFER/SPIKE later` |
| durable scheduler | work/domain semantics | Inngest/DBOS/Restate/Temporal | `DEFER H1` |
| code-quality checks | Standard/Evidence binding | repo-native linters/tests/scanners | `ADAPT` |
| browser verification | QA Journey/Evidence semantics | Playwright | `ADOPT/ADAPT M6` |
| exploratory browser agent | QA authority/policy | agent-browser | `SPIKE M6` |
| integration protocol | Credential/Effect semantics | MCP/official provider SDKs | `ADAPT M7+` |
| telemetry transport | stable `mnfs.*` semantics | OpenTelemetry | `ADOPT M9` |
| eval backend | Evaluation/Calibration meaning | external backend | `SPIKE M9` |
| operator web infrastructure | Mission-first semantics | conventional web stack / Factory reference | `DEFER M10` |
| repository portal | catalog semantics | Backstage | `DEFER M11` |
| remote sandbox fleet | Environment semantics | provider sandboxes / WorkspaceSandbox-compatible seam | `SPIKE AS-04` |

The significance of the matrix is not that every candidate will be used.

It creates a default rule:

> Before building infrastructure code, first prove that an upstream primitive cannot satisfy the named MNFS consumer and its criteria.

---

# 7. M02 is the immediate decision boundary

The M02 Product Milestone remains a vertical slice:

```text
one fixed Pi Worker
→ exact leased worktree
→ E1
→ fresh authority
→ fixed Writer Pack
→ durable Claim
→ fresh Lead recovery
→ deterministic Receipt
→ MNFS Gate
→ safe release
```

The approved contract intentionally excludes scheduler, multiple Workers, generic workflow engines, remote execution, OM and Web Console. [mnfs-blueprint-roadmap] [mnfs-cap-execution-traceability]

Therefore the implementation-sourcing decision for M02 should optimize one thing:

> Build the smallest trustworthy Pi process boundary that proves the current criteria and remains evolvable.

---

# 8. Pi 0.83.0 RPC is a strong M02 substrate candidate

AS-02 accepted Pi `0.83.0` in the real E1 composition. [mnfs-as02-acceptance]

This report therefore evaluates Pi RPC at **exactly 0.83.0**, not current/latest Pi.

Pi RPC provides a headless process protocol over stdin/stdout JSONL. It supports correlated command responses and streams structured agent/session events. [pi-rpc-doc]

Useful M02 control primitives include:

```text
prompt
abort
get_state
set_auto_retry
set_auto_compaction
get_session_stats
new_session
shutdown/session controls
```

The event stream includes tool/message events plus lifecycle signals. Critically, Pi distinguishes `agent_end` from `agent_settled`: `agent_end` can precede retry, compaction retry or queued continuation, while `agent_settled` represents a fully settled loop. [pi-rpc-doc] [pi-rpc-mode]

That distinction maps naturally to the MNFS rule:

```text
Pi event
→ observation
→ validated MNFS service transition

never

Pi event
→ acceptance
```

RPC also exposes session statistics, including token/cost/context information, which can satisfy the M2 `available token counters` observability goal without parsing terminal prose or transcripts. [pi-rpc-doc] [pi-rpc-mode]

---

# 9. Pi RPC compatibility with M02 requirements

The RPC protocol is not intended to realize every M02 requirement. It should realize only process/control mechanics.

| Requirement | RPC fit | Design implication |
|---|---|---|
| `CAP-EXEC-REQ-003` completion cannot accept | `SUPPORTS` | `agent_settled`/exit remain observations; Gate authority stays MNFS. |
| `REQ-009` exact leased cwd | `STRONG` | Spawn RPC process with `cwd` equal to observed Lease path and bind observation to Attempt. |
| `REQ-010` frozen E1 policy | `NEUTRAL` | Preserve AS-02 policy compilation/hash checks outside Pi RPC. |
| `REQ-011` protected host/credential deny | `NEUTRAL` | Enforcement remains SEC-E1 broker/sandbox. |
| `REQ-012` no network/credentials/X2+ | `NEUTRAL` | Preserve accepted E1 execution policy; RPC adds no authority. |
| `REQ-013` fail closed | `NEUTRAL` | Worker start must be gated on sandbox/policy readiness before prompt dispatch. |
| `REQ-014` fresh Authority Snapshot | `TRANSPORT` | Send compiled fresh Snapshot as bounded input; RPC does not own it. |
| `REQ-015` fixed Writer Pack | `TRANSPORT` | Writer Pack remains MNFS artifact/contract; RPC carries or references it. |
| `REQ-016` exit is observation | `STRONG` | Structured lifecycle/exit makes terminal scraping unnecessary. |
| `REQ-017` fresh Lead recovery | `SUPPORTS IF STATE-INDEPENDENT` | Recovery must read SQLite/OS/Git, not RPC session transcript. |
| `REQ-018` late result fencing | `NEUTRAL` | Attempt/WorkerRun identity and service checks stay MNFS. |
| `REQ-019` deterministic Receipt | `NO DOMAIN ROLE` | Runner owns verification. |
| `REQ-020` MNFS Gate acceptance | `NO DOMAIN ROLE` | Gate stays MNFS. |
| `REQ-021` stale/wrong evidence reject | `NO DOMAIN ROLE` | Gate freshness checks stay MNFS. |
| `REQ-022` preserve/release resources | `NO DOMAIN ROLE` | Environment/Lease services own disposition. |
| `REQ-024` available token counters | `USEFUL` | `get_session_stats` can provide bounded structured telemetry. |

Conclusion:

> Pi RPC is a good **process adapter substrate** precisely because it does not need to become the lifecycle model.

---

# 10. Do not import Pi's internal RpcClient directly

Pi 0.83.0 contains an internal TypeScript `RpcClient`, but it is not a suitable M02 dependency shape. [pi-rpc-client] [pi-package-083]

Two findings are decisive.

## 10.1 It is not a public package export

The coding-agent package exports its root and `rpc-entry`, not the internal `src/modes/rpc/rpc-client` module. [pi-package-083]

Depending on a deep internal path would make an M02 security/process boundary sensitive to upstream internal refactors.

Disposition:

```text
REJECT direct internal RpcClient import
```

## 10.2 Its process environment policy conflicts with the accepted boundary

The internal helper spawns Pi with:

```text
env: { ...process.env, ...options.env }
```

[pi-rpc-client]

That is a reasonable generic client default.

It is not the MNFS M02 default.

The accepted AS-02 architecture deliberately prevents arbitrary host environment inheritance across the Worker-facing boundary. [mnfs-as02-acceptance]

Therefore the safe design is:

```text
adopt Pi RPC protocol
+
retain MNFS-owned process/environment construction
+
implement a minimal strict protocol adapter
```

This is not Not-Invented-Here behavior.

MNFS is not reimplementing Pi's agent protocol or agent runtime. It is providing the security-compatible host adapter that a generic upstream helper cannot provide.

---

# 11. Strict JSONL framing is part of the integration contract

Pi's own implementation explicitly uses LF-only framing and warns that Node `readline` is not a valid protocol parser because additional Unicode separators can legally occur in JSON strings. [pi-jsonl]

M02 should therefore avoid a casual line parser.

A minimal adapter needs:

```text
UTF-8 StringDecoder
LF-only record split
optional CR stripping
bounded partial-line buffer
JSON parse error classification
request-id correlation
independent event dispatch
bounded retained output/artifacts
```

This is a small adapter responsibility with a concrete upstream contract.

It should not grow into a generic message-bus library.

---

# 12. RPC control commands must not bypass the E1 tool path

Pi RPC exposes a direct `bash` command. In RPC mode, this command emits the extension `user_bash` hook and, absent an extension-provided result, falls through to Pi's direct `session.executeBash`. [pi-rpc-mode]

M02 does not need this command.

The production `PiProcessAdapter` should use RPC for **control**, such as:

```text
prompt
abort
settled observation
state/stats needed for bounded telemetry
shutdown
```

The Worker agent itself should perform repository operations only through the reviewed seven-tool extension/broker path already proven by AS-02. [mnfs-as02-acceptance]

Recommended rule:

```text
MNFS control plane MUST NOT issue RPC `bash` in the M02 Writer flow.
```

This prevents a convenient control-plane API from becoming an accidental second execution capability.

---

# 13. Resource loading can remain deterministic

Pi 0.83.0 supports disabling discovered resources while still loading explicit resources. [pi-usage-083]

Relevant controls include:

```text
--no-builtin-tools
--no-extensions
--no-skills
--no-prompt-templates
--no-context-files
-e <explicit extension>
```

AS-02 already proves an explicit composition using:

```text
--no-builtin-tools
--no-extensions
-e pinned Anthropic auth plugin
-e reviewed first-party broker extension
```

[mnfs-as02-acceptance]

The M02 RPC conformance proof should extend this accepted composition rather than invent a new one.

A likely candidate invocation is conceptually:

```text
pi --mode rpc
  --no-session
  --no-approve
  --no-builtin-tools
  --no-extensions
  -e <pinned subscription-auth extension>
  -e <exact reviewed MNFS E1 extension>
  --no-skills
  --no-prompt-templates
  --no-context-files
  --model <pinned model>
```

The exact command is **not accepted by this research report**. It belongs to the Pi RPC conformance proof and M02 microdesign.

In particular, the conformance proof must establish that each no-discovery flag behaves as expected with the explicit trusted extensions at the pinned version.

---

# 14. M02 process-boundary implementation options

Three realistic M02 approaches were compared.

## Option A — Continue with one-shot `--print`

Shape:

```text
MNFS
→ spawn `pi --print ...`
→ wait for process exit
→ collect bounded output
```

This is close to AS-02's accepted real pilot.

### Strengths

- already exercised in the security spike;
- minimal process complexity;
- no long-lived stdin protocol.

### Costs

- process output is less structured;
- cancellation/control is coarser;
- settled agent-loop semantics are harder to distinguish from process exit;
- session statistics/control require additional paths;
- M02 would likely create custom conventions around output/termination.

### Estimated implementation effort

```text
M
```

### Disposition

```text
VALID FALLBACK
NOT RECOMMENDED FIRST CHOICE
```

## Option B — Official Pi RPC protocol + MNFS safe process adapter

Shape:

```text
MNFS Worker service
→ spawn exact Pi 0.83.0 RPC process with explicit env/cwd
→ strict JSONL adapter
→ correlated control commands
→ structured lifecycle events
```

### Strengths

- upstream protocol instead of MNFS protocol invention;
- explicit lifecycle events;
- abort/control;
- structured stats;
- clean future evolution toward steering/session control;
- process isolation preserved;
- no requirement to embed Pi SDK in the MNFS process.

### Costs

- current MNFS process runner is one-shot and ignores stdin, so M02 needs a bounded persistent-child seam; [mnfs-process-runner]
- strict JSONL framing must be implemented correctly;
- protocol/version conformance becomes a pinned external boundary;
- extension UI requests need a deterministic policy, preferably no interactive dependency in fixed M02.

### Estimated implementation effort

```text
M
```

The effort class is similar to Option A because M02 already needs Worker lifecycle/process observation. The difference is where complexity goes: Option B spends effort on a bounded standard adapter and avoids accumulating custom process protocol conventions.

### Disposition

```text
RECOMMENDED — SUBJECT TO REAL CONFORMANCE
```

## Option C — Embed Pi SDK in the MNFS process

### Strengths

- richest programmatic API;
- no JSONL transport layer.

### Costs

- weakens the explicit process boundary between MNFS control plane and probabilistic Worker runtime;
- complicates WorkerRun/process failure semantics;
- increases shared-process trusted computing base;
- makes the first secure Worker proof less representative of future isolated workers.

### Estimated implementation effort

```text
M initially, higher coupling tail
```

### Disposition

```text
DEFER
```

The SDK may be appropriate for a future trusted Lead/session runtime. It is not the preferred M02 Writer boundary.

---

# 15. Required Pi RPC conformance before freezing M02 design

A small R5 conformance proof should answer only the uncertainties that could invalidate the proposed adapter.

It should not become a second harness.

## 15.1 Version and invocation

Prove at exact accepted Pi `0.83.0`:

- RPC starts non-interactively;
- exact reviewed extensions load;
- uncontrolled resource discovery remains disabled;
- exact leased worktree is cwd;
- provider subscription authentication still functions under the accepted trusted-host composition.

## 15.2 Protocol

Prove:

- strict LF JSONL framing;
- command IDs correlate responses;
- events can interleave with responses safely;
- malformed/oversized records fail boundedly;
- stdout contains protocol records only under normal RPC operation;
- stderr/log capture remains bounded and redacted.

## 15.3 Lifecycle

Prove:

- prompt accepted;
- Worker reaches `agent_settled` after the fixed task;
- `agent_end` is not treated as the terminal semantic signal;
- abort works;
- process exit/signal is observable separately;
- no event directly mutates Claim/Feature state.

## 15.4 E1

Repeat only the distinct physical assumptions affected by changing `--print` to RPC:

- one allowed worktree edit succeeds through the broker;
- protected read/write remains denied;
- network remains denied;
- direct-host fallback is absent;
- RPC control path never uses direct RPC `bash`.

The complete AS-02 matrix need not be recreated if the unchanged policy/broker boundary remains proven and only the changed process protocol is under test.

## 15.5 Fresh process

Prove that killing the Lead/RPC client does not require the transcript or Pi Session to recover MNFS state.

A fresh process must classify the Worker Run from:

```text
SQLite
OS process identity
Lease/Environment observations
Git/result tree
Claim
```

not from `get_messages` or `get_entries`.

---

# 16. Mastra Factory validates the product direction but should not own M02

Mastra's Software Factory is now a concrete product rather than only a conceptual comparison.

It implements a workflow around work items, boards/stages, typed rules, deferred decisions, persistent dispatch records, leases, retry/backoff, sessions, integrations and sandbox fleets. [mastra-factory-template] [mastra-factory-dispatcher]

This validates multiple MNFS principles:

- plan before implementation;
- governed transitions;
- human gates;
- risk routing;
- deferred external effects;
- idempotency;
- durable records;
- sandboxed execution;
- session recovery;
- operator control surfaces.

However the Factory's primary domain model is not the MNFS domain model.

Its core shape is approximately:

```text
WorkItem
→ board/stage
→ session/binding
→ rule decision
→ deferred effect
```

MNFS requires:

```text
Mission
→ Milestone
→ Feature
→ Write Track
→ Attempt
→ Worker Run
→ Claim
→ Receipt
→ Verdict
```

The second model encodes hierarchical criteria, exact contract identity, independent proof and explicit acceptance Authority.

Forcing it into Factory work-item/stage semantics would transfer product meaning to a framework lifecycle.

M02 disposition:

```text
@mastra/factory = REFERENCE
```

---

# 17. Mastra's implementation is especially useful as a design reference

The Factory dispatcher contains several patterns worth carrying into future adversarial design review. [mastra-factory-dispatcher]

Examples:

```text
deferred effect record
idempotency identity
lease owner + expiry
lease renewal
bounded batch claiming
max in-flight capacity
retry/backoff
terminal failure
causal chain
error sanitization
```

These patterns should not be copied mechanically.

Instead, M02/M5 design should ask:

1. Is every external action tied to a stable intent identity?
2. Can a fresh process determine whether an action is pending, leased, completed, failed or unknown?
3. Is causal lineage sufficient to explain why an effect occurred?
4. Is retry fenced against stale Attempts and changed authority?
5. Are long-running actions prevented from starving unrelated dispatch work?

Mastra is therefore valuable even when it is not a runtime dependency.

---

# 18. Mastra AgentController is a serious future candidate

`AgentController` is explicitly designed for applications that would otherwise have to build session/runtime infrastructure around an agent. It coordinates modes, models, storage, workspaces, tool approvals, subagents and channels. [mastra-agent-controller]

That is exactly the class of mechanical infrastructure the MNFS should avoid building without a reason.

The fit is strongest for future Lead/Reviewer/session orchestration, not the M02 isolated Writer.

Mastra also explicitly warns that AgentController is beta and subject to breaking changes in minor versions. [mastra-agent-controller]

Therefore:

```text
AgentController
→ SPIKE_CANDIDATE
→ not M02 dependency
```

A future spike should test whether MNFS can remain authoritative while AgentController owns only:

```text
live Session runtime
thread mechanics
model selection
message/run control
tool approval UX
channels
```

The test must reject any design in which Session state becomes required to recover Mission/Feature lifecycle.

---

# 19. Mastra Signals fit ADR-0005 unusually well

Mastra Signals support:

- delivery into active runs;
- waking idle threads;
- persistence instead of wake;
- queued user messages;
- state signal lanes;
- durable notification inbox records;
- dedupe/coalescing primitives. [mastra-signals]

This maps cleanly to ADR-0005 if the integration direction remains:

```text
MNFS durable state/command
→ commit first
→ transport notification
→ Actor wakes
→ Actor re-reads MNFS authority
```

not:

```text
Mastra notification/session
→ becomes MNFS command state
```

Signals are also beta. [mastra-signals]

Disposition:

```text
SPIKE in expanded AS-01
```

This candidate should be compared against simpler Pi-native process/session transport rather than adopted because it is feature-rich.

---

# 20. ACP is a multi-runtime candidate, not an M02 abstraction requirement

`@mastra/acp` can spawn ACP-compatible coding agents and expose them as Mastra tools or subagents. [mastra-acp]

This is strategically relevant because MNFS may eventually choose different harnesses for different Roles.

Potential future shape:

```text
MNFS Role + Contract
        │
   ┌────┴─────────────┐
   │                  │
Pi adapter         ACP adapter
                      │
                compatible harnesses
```

But M02 has exactly one real Worker runtime consumer: Pi.

Creating a generic `WorkerRuntimeProvider` now would be speculative abstraction.

Disposition:

```text
PiProcessAdapter now
→ extract generic WorkerRuntime port only when a second real runtime consumer exists
```

ACP should be revisited when multi-runtime selection becomes a named Product Milestone need.

A separate security caveat exists: Mastra's ACP options describe `env` as merged with the current process environment. [mastra-acp]

That is another reason not to treat a generic agent launcher as automatically compatible with MNFS execution boundaries.

---

# 21. Mastra WorkspaceSandbox is strategically interesting for AS-04

Mastra's `WorkspaceSandbox` interface is provider-neutral and supports optional:

```text
clone / reattach
executeCommand
process management
networking
file upload
mounts
lifecycle
```

[mastra-workspace-sandbox]

This is the correct kind of mechanical abstraction for future remote execution.

It should not replace the accepted M02 E1 boundary merely because it exists.

Instead, AS-04 should test whether an MNFS Environment adapter can use this or a similarly narrow provider abstraction while preserving:

```text
MNFS Environment identity
policy hash
Credential Grant
Network Policy
Effect Authority
Evidence
Reconcile
cleanup semantics
```

Disposition:

```text
REFERENCE / AS-04 CANDIDATE
```

---

# 22. Mastra maturity argues for seams, not avoidance

As of this research snapshot:

- the public Factory template is pinned to `@mastra/factory@0.5.1-alpha.0` and corresponding alpha core/code packages; [mastra-factory-template]
- the Mastra monorepo at the same research date has already versioned `@mastra/factory` to `0.6.0-alpha.1`; [mastra-factory-package]
- AgentController and Signals explicitly carry beta stability warnings. [mastra-agent-controller] [mastra-signals]

This does not mean Mastra is unsuitable.

It means the correct adoption pattern is:

```text
thin adapter
pinned version
real conformance proof
removal conditions
no domain imports
```

The faster an external subsystem evolves, the more valuable our existing ports-and-authority architecture becomes.

---

# 23. Generic durable-execution engines were evaluated adversarially

M01/M02 include patterns that resemble durable workflow engines:

```text
Intent
retry
idempotency
leases
recovery
long-running work
external actions
```

It would be irresponsible to assume MNFS should implement these mechanisms itself without checking mature alternatives.

Four families were reviewed.

---

# 24. Inngest

Inngest self-hosting includes an Event API, event stream, Runner, Queue, Executor, State Store, database/API/UI and can start as one binary with SQLite persistence. [inngest-self-host]

Its durable functions checkpoint steps, persist results, skip already completed steps on replay and provide retry/flow-control primitives. [inngest-durable]

This is substantial mechanical leverage.

However adopting it in H1 would introduce a second execution-lifecycle state model beside MNFS:

```text
Inngest function/run/step state
+
MNFS Track/Attempt/WorkerRun/Claim/Lease state
```

The core M02 Recovery problem would still exist because Inngest cannot decide whether a Treehouse worktree, Git result, Claim, Environment or stale Attempt is authoritative for MNFS.

Disposition:

```text
DEFER H1
REVISIT when scheduler/background durable work is a named consumer
```

A strong revisit trigger is M5 or later if the product actually requires a general queue/scheduler rather than one or two explicit dispatch paths.

---

# 25. DBOS

DBOS provides TypeScript durable workflows as a Postgres-backed library and checkpoints workflow execution for recovery. [dbos-architecture] [dbos-typescript]

It is attractive because it is closer to a library than a large workflow service.

For current MNFS local H1, the cost is architectural:

```text
SQLite = MNFS operational authority
+
Postgres = DBOS durable workflow state
```

That would add a second database primarily to avoid writing bounded local lifecycle coordination that the product already needs to semantically understand.

Disposition:

```text
DEFER
```

Revisit if MNFS has already moved to shared Postgres for a genuine remote/multi-process requirement and durable workflow execution becomes a named consumer.

---

# 26. Restate

Restate provides durable execution, built-in state, reliable service communication and workflow recovery through a Restate Server that retains execution state/history. [restate-overview] [restate-workflows]

It solves a broad distributed-application problem effectively.

For local H1 it would again create a second lifecycle/state authority whose recovery semantics do not eliminate MNFS's Git/Treehouse/Claim/Environment reconciliation obligations.

Disposition:

```text
DEFER
```

A future service-oriented/cloud control plane may change the economics.

---

# 27. Temporal

Temporal provides crash-proof durable application execution through Temporal Service/Cloud plus application Workers. [temporal-docs]

It is the strongest mature choice when the product requirement truly is long-running distributed workflow orchestration.

That is not the current M02 requirement.

M5 explicitly keeps generic scheduler/Worker pool out of scope, and M02 is one local Worker. [mnfs-blueprint-roadmap]

Disposition:

```text
DEFER
```

Temporal should be reconsidered only if later architecture requires distributed workflow orchestration as a first-class capability rather than as implementation detail around a few MNFS effects.

---

# 28. Durable-execution conclusion

The correct conclusion is not:

```text
MNFS should always hand-write retries
```

nor:

```text
MNFS should adopt a workflow engine now
```

It is:

> **Do not adopt a second workflow authority until a concrete scheduler/distributed-execution consumer exists. Continue implementing only the bounded durability mechanisms required by the current semantic model, while using mature workflow systems as design and future sourcing references.**

Revisit trigger examples:

```text
many independently queued jobs
scheduled/background work
cross-process durable dispatch
large delayed external-effect inventory
remote worker fleet
multi-node control plane
operational burden of custom outbox/retry exceeds adapter cost
```

---

# 29. M3 — own Engineering Governance, bind existing tools

M3 should not become a custom static-analysis platform.

MNFS must own:

```text
Repository Profile meaning
Standard identity/status
applicability
Golden Path selection
verification binding
Receipt mapping
Waiver semantics
Quality Posture
```

But a Repository Profile should bind Standards to existing tools whenever possible:

```text
TypeScript compiler
ESLint
Semgrep
OpenAPI compatibility tool
repository test command
migration checker
formatter
security scanner
custom script only when no adequate tool exists
```

This is already consistent with the Engineering System Blueprint, which describes enforcement bindings rather than one universal MNFS checker. [mnfs-blueprint-engineering]

Disposition:

```text
OWN governance
ADAPT existing enforcement tools
```

This materially reduces M3 implementation scope compared with treating every Engineering System box as a new engine.

---

# 30. AS-01 should be reconsidered as a broader runtime substrate spike

The existing roadmap names:

```text
AS-01 — Pi Session Memory and Messaging
```

Its sequencing remains correct: M3 first establishes Authority Snapshot, Context Pack and Role isolation. [mnfs-blueprint-roadmap]

The candidate set has changed enough that the spike question should likely broaden before AS-01 executes.

Proposed future research question:

> **What is the smallest reliable Agent Runtime, Session, Memory and Messaging substrate for long-lived MNFS actors while keeping SQLite/Git authoritative?**

Candidate baselines should include at least:

```text
A. Pi native session/compaction/control
B. Pi native + selected session-memory extension
C. Mastra AgentController + Signals as non-authoritative session substrate
D. a mixed shape where Pi remains Worker runtime and Mastra only serves selected Lead/channel concerns
```

This report does **not** amend the roadmap name or ADR-0004.

It recommends a separate canonical review when AS-01 approaches execution.

---

# 31. M4 — own Finding/Verdict semantics, reuse reviewer runtime

MNFS must own:

```text
review independence
Review Pack authority
Finding identity/severity/status
correction binding
Verdict
accepted/rejected transition
anti-loop policy
```

The model/runtime that performs the judgment is replaceable.

Pi, a Mastra-hosted reviewer, an ACP-compatible harness or another future runtime may implement the Reviewer Role if it receives the correct bounded context and cannot inherit Writer authority.

Mastra Factory's review and orchestration patterns are strong references, but importing Factory work-item lifecycle is unnecessary.

Disposition:

```text
OWN review semantics
ADAPT runtime later
```

---

# 32. M5 — preserve concurrency semantics; reconsider scheduler only on evidence

M5 requires two real Write Tracks, resource ownership and serial integration.

It explicitly excludes:

```text
Worker pool
scheduler
parallel Integration
autoscaling
```

[mnfs-blueprint-roadmap]

Therefore M5 should first prove:

```text
Track ownership
resource reservations actually needed by two Tracks
Attempt fencing
Integration Run semantics
clean candidate composition
```

Before implementing any general dispatcher/scheduler subsystem, compare the concrete need with:

- Mastra Factory deferred dispatcher patterns; [mastra-factory-dispatcher]
- Inngest;
- DBOS;
- Restate;
- Temporal.

A general scheduler becomes justified only when the current explicit services become the observed bottleneck.

---

# 33. M6 — browser machinery should be upstream

M6 owns QA semantics, not a browser engine.

Playwright provides isolated BrowserContexts suitable for deterministic verification and tracing artifacts suitable for later inspection. [playwright-isolation] [playwright-tracing]

For exploratory agentic browser work, `agent-browser` provides accessibility-tree snapshots with compact references plus domain/action-policy controls. [agent-browser]

A reasonable future split is:

```text
MNFS QA Journey / Criterion / Evidence
       │
       ├── deterministic browser checks → Playwright
       └── exploratory agent QA        → candidate agent-browser adapter
```

Disposition:

```text
Playwright = likely ADOPT/ADAPT
agent-browser = SPIKE candidate
```

MNFS should not create a browser automation framework.

---

# 34. M7/M8 — MCP and provider SDKs should implement mechanics, never Effect Authority

MCP has rapidly matured as an agent integration protocol. The 2026-07-28 specification moves the core toward stateless requests, formal extensions and stronger authorization/deprecation semantics. [mcp-2026-spec]

This makes MCP increasingly attractive as an integration substrate.

But protocol access is not MNFS authorization.

MCP security guidance explicitly treats authorization and token handling as security boundaries and prohibits token passthrough patterns. [mcp-security]

MNFS therefore still owns:

```text
Credential Requirement
Credential Grant
Effect Request
Effect Authority
Effect Receipt
unknown-effect Reconcile
Security Violation
```

while an MCP server or official provider SDK may own:

```text
API protocol
OAuth mechanics
request serialization
provider-specific retry/error details
```

Disposition:

```text
ADAPT MCP/provider SDKs in M7/M8
DO NOT map tool availability to Effect Authority
```

---

# 35. M9 — OpenTelemetry remains a clear adoption case

MNFS does not need a telemetry protocol.

OpenTelemetry already supplies vendor-neutral traces, metrics/log plumbing and semantic-convention machinery. Its semantic conventions continue to evolve, including GenAI-specific conventions. [otel-semconv]

MNFS should preserve stable domain attributes such as:

```text
mnfs.repository.id
mnfs.mission.id
mnfs.feature.id
mnfs.write_track.id
mnfs.attempt.id
mnfs.worker_run.id
mnfs.claim.id
mnfs.contract.hash
mnfs.policy.hash
```

and map them to ecosystem conventions where appropriate.

Disposition:

```text
OTel = ADOPT as telemetry interchange
mnfs.* semantics = OWN
backend = SPIKE in M9
```

This agrees with the existing roadmap rather than changing it.

---

# 36. M10 — use existing web infrastructure; preserve Mission-first UX

The future Web Console has differentiated information architecture:

```text
Mission-first
attention-first
evidence-first
Authority-visible
recovery-visible
```

That UX/domain projection belongs to MNFS.

Generic web machinery does not.

Mastra Factory is a useful control-room reference because it already integrates sessions, boards, integrations and sandbox status, but the MNFS UI must remain a projection over MNFS Application Services rather than a Factory board becoming the source of truth.

Disposition:

```text
OWN UX/domain projection
REUSE conventional web infrastructure
REFERENCE Factory UI
```

No Web Console dependency should enter H1 merely to make M02 more visible.

---

# 37. M11 — Backstage is a future portal/catalog candidate, not current core

Backstage's Software Catalog keeps repository/software metadata in source-controlled descriptors and exposes ownership/discovery through a centralized portal. [backstage-catalog]

Software Templates provide reusable scaffolding/publishing machinery. [backstage-templates]

Those patterns overlap with future MNFS concerns:

```text
Repository Catalog
ownership
Golden Path Catalog
Software Templates
documentation portal
plugins
```

But M11 is explicitly conditional on multiple real repositories/teams and repeated Profile/Golden Path patterns. [mnfs-blueprint-roadmap]

Disposition:

```text
DEFER
REFERENCE / candidate integration host in M11
```

Do not embed Backstage into the current local harness.

---

# 38. AS-04/M12 — never build a cloud sandbox platform by default

The Blueprint already says M12 is about preserving local MNFS semantics under remote execution, not building a custom Firecracker platform. [mnfs-blueprint-roadmap]

Mastra's provider-neutral `WorkspaceSandbox` demonstrates one viable abstraction shape for clone/reattach/process/network/file operations. [mastra-workspace-sandbox]

Future AS-04 should compare actual providers on:

```text
isolation
reattach/recovery
filesystem persistence
credentials
network enforcement
snapshots
cost
observability
cleanup/reconcile
vendor lock-in
```

MNFS owns the Environment contract and Evidence.

A provider should own VM/container fleet mechanics.

Disposition:

```text
remote compute machinery = ADOPT/ADAPT after AS-04
custom cloud sandbox service = REJECT by default
```

---

# 39. Qualitative implementation economics

False numerical person-day estimates would create precision without evidence.

This report instead classifies relative effort:

```text
S  bounded adapter/configuration
M  substantive subsystem but one clear boundary
L  multiple coordinated subsystems
XL platform/product in its own right
```

| Concern | Build ourselves | Integrate upstream | Maintenance tail if custom |
|---|---:|---:|---:|
| Mission/criteria/evidence semantics | required | not meaningfully outsourceable | `M` |
| Pi process wire protocol | `M/L` | `M` via safe RPC adapter | `M` if custom protocol |
| agent session runtime | `L/XL` | `M` candidate | `L/XL` |
| wake/notification transport | `L` | `S/M` candidate | `L` |
| browser automation | `XL` | `S/M` | `XL` |
| OAuth/model/provider clients | `XL` cumulative | `S/M` | `XL` |
| GitHub/Linear/Slack mechanics | `L/XL` | `M` | `L` |
| telemetry protocol/export | `L` | `S` OTel adapter | `L` |
| remote sandbox fleet | `XL` | `M` provider adapter | `XL` |
| distributed durable scheduler | `XL` | `M` integration | `XL` |
| Claim/Receipt/Gate semantics | required | not safely outsourceable | `M` |
| Engineering applicability | required | not safely outsourceable | `M` |
| individual check engines | `XL` cumulative | `S` bindings | `XL` |

The highest economic risk is not writing a few domain services.

It is accidentally turning MNFS into the maintainer of infrastructure categories that already have dedicated communities/products.

---

# 40. Dependency adoption discipline

For an external mechanical dependency to graduate from `SPIKE`/`REFERENCE` to runtime dependency, require:

1. **Named consumer** — a current milestone criterion or accepted design element.
2. **No authority inversion** — MNFS lifecycle remains reconstructable without the dependency's hidden state.
3. **Pinned identity** — version/source bytes or equivalent supply-chain identity appropriate to risk.
4. **Conformance proof** — real boundary exercised where physical behavior matters.
5. **Failure classification** — timeout/crash/partial completion/version mismatch are explicit.
6. **Removal path** — adapter can be replaced without rewriting domain history.
7. **No duplicate subsystem without reason** — second DB/session/workflow state requires explicit justification.
8. **Maintenance comparison** — integration complexity must be lower than custom implementation plus expected upgrade tail.

This is a candidate R5 practice, not yet an accepted MCRM amendment.

---

# 41. What should not be generalized now

The reuse review could itself trigger overengineering.

Avoid creating the following in M02 without a second consumer:

```text
GenericWorkerRuntimeProvider
GenericSessionRuntimeProvider
GenericDurableWorkflowProvider
GenericSandboxFleet
GenericNotificationBus
GenericIntegrationMarketplace
```

Use the concrete names that match the current consumer:

```text
PiProcessAdapter
E1 ProcessSandboxAdapter
TreehouseAdapter
```

When a second real runtime/provider requires the same domain-facing contract, extract the common interface then.

This preserves YAGNI while keeping domain imports clean.

---

# 42. Recommended M02 design direction

Subject to the real Pi RPC conformance proof, the M02 microdesign should prefer:

```text
Approved MIS-002 rev5
        │
        ▼
Execution Preparation
        │
        ├── Current Authority Snapshot
        ├── fixed Writer Pack
        ├── Treehouse Lease
        └── SEC-E1 Environment binding
        │
        ▼
PiProcessAdapter
        │
        ├── exact Pi 0.83.0
        ├── explicit cwd/env/resources
        ├── persistent child process
        ├── strict official RPC JSONL protocol
        ├── no RPC bash in Writer flow
        ├── structured events
        └── bounded artifacts/telemetry
        │
        ▼
Pi Worker agent loop
        │
        ▼
reviewed seven-tool E1 broker
        │
        ▼
leased worktree
```

Process events then feed observations into MNFS services:

```text
process spawned
agent settled
process exit
signal/abort
protocol error
extension error
```

None is a Claim acceptance event.

---

# 43. Recovery consequence of RPC

RPC should improve live observation without becoming recovery authority.

A Lead crash can lose:

```text
in-memory request correlation
live event subscriptions
current RPC client object
```

and MNFS must still recover.

This is a feature, not a limitation.

The fresh Lead should read:

```text
Write Track
Lease
Environment
Attempt
Worker Run
Claim
process identity observation
Git/result tree
```

and classify:

```text
process still exists
process lost
Claim exists
Claim missing
Attempt stale/current
result tree observed/not observed
```

The new Lead may reattach to a future session/process transport only if an explicit safe mechanism exists. M02 correctness must not require that reattachment.

This preserves `CAP-EXEC-REQ-017`. [mnfs-cap-execution-traceability]

---

# 44. Documentation and roadmap impact

This research does not modify accepted architecture.

Current impact:

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - docs/research/MNFS-RESEARCH-IMPLEMENTATION-SOURCING-AND-AGENT-RUNTIME-v1.md
    - docs/research/MNFS-RESEARCH-IMPLEMENTATION-SOURCING-AND-AGENT-RUNTIME-v1.sources.json
  rationale: "New R5 research evidence for implementation sourcing and Pi RPC compatibility."
  follow_up: "Use as input to MIS-002/M02 microdesign; separately review any canonical AS-01/MCRM changes."

requirements_impact:
  status: NONE
  affected:
    - CAP-EXEC-REQ-003
    - CAP-EXEC-REQ-009
    - CAP-EXEC-REQ-010
    - CAP-EXEC-REQ-011
    - CAP-EXEC-REQ-012
    - CAP-EXEC-REQ-013
    - CAP-EXEC-REQ-014
    - CAP-EXEC-REQ-015
    - CAP-EXEC-REQ-016
    - CAP-EXEC-REQ-017
    - CAP-EXEC-REQ-018
    - CAP-EXEC-REQ-019
    - CAP-EXEC-REQ-020
    - CAP-EXEC-REQ-021
    - CAP-EXEC-REQ-022
  rationale: "Research changes candidate realization choices, not approved requirements or allocation."
```

Potential future canonical changes requiring separate review:

1. broaden AS-01 from memory/messaging-only wording to agent runtime/session/memory/messaging substrate evaluation;
2. add an implementation-sourcing check to R5 after repeated evidence that the vocabulary is useful;
3. record any new accepted dependency category only if it improves governance beyond ordinary adapter documentation.

---

# 45. Replan assessment

The approved contract requires one Pi Worker, exact E1 binding, durable Claim, fresh Lead recovery, deterministic Receipt and MNFS Gate acceptance.

None of the investigated upstream primitives invalidates those requirements.

Pi RPC is compatible with the contract because it is an implementation mechanism behind the existing `PiProcessAdapter` responsibility. [mnfs-cap-execution-traceability]

Mastra does not create a contract change because it is not proposed as an M02 dependency.

Durable workflow products do not create a contract change because they are deferred.

Therefore:

```text
MIS-002 revision 5: PRESERVE
CAP-EXECUTION 0.1.0: PRESERVE
M02 criteria: PRESERVE
REPLAN_REQUIRED: NO
```

A future conformance finding would trigger Replan only if it proves that the approved outcome cannot be realized without materially changing security, authority, environment or Claim/Evidence semantics.

---

# 46. R5 follow-up sequence

Recommended next sequence:

```text
1. Accept/review this research evidence

2. Run a narrow Pi 0.83.0 RPC conformance proof
   - no production M02 Worker dispatch
   - reuse existing AS-02 fixture/boundaries where possible
   - test only changed integration assumptions

3. Freeze M02 PiProcessAdapter realization choice

4. Write the complete MIS-002/M02 microdesign
   - files/modules
   - migrations/state changes
   - Environment binding
   - Snapshot/Writer Pack
   - process/RPC adapter
   - Claim completion
   - fresh-Lead Recovery
   - Receipt/Gate
   - exact verification matrix

5. Adversarial R5 review

6. Operator approval

7. Only then prepare a separate TDD implementation plan
```

This sequence preserves the current Issue #21 authorization boundary. [mnfs-documentation-map]

---

# 47. Final disposition matrix

```text
PRODUCT ARCHITECTURE
  preserve

MNFS SEMANTIC CORE
  OWN

M02
  Pi 0.83.0                         ADOPT
  official Pi RPC protocol          SPIKE NOW → likely ADAPT
  Pi internal RpcClient             REJECT direct use
  bounded persistent process seam   BUILD in Pi-specific adapter shape
  trusted Pi E1 extension           PRESERVE / ADAPT
  Treehouse                         PRESERVE / ADAPT
  Sandbox Runtime / SEC-E1          PRESERVE / ADAPT
  generic workflow engine           DEFER
  Mastra Factory                    REFERENCE

M3
  Engineering semantics             OWN
  existing repo checks              ADAPT

AS-01
  Pi native runtime                 BASELINE
  session memory candidate          SPIKE
  Mastra AgentController            SPIKE candidate
  Mastra Signals                    SPIKE candidate

M4
  Finding/Verdict semantics         OWN
  reviewer runtime                  ADAPT

M5
  Track/resource/integration rules  OWN
  Factory dispatcher                REFERENCE
  durable scheduler products        REVISIT IF NEEDED

M6
  QA/Evidence semantics             OWN
  Playwright                        ADOPT/ADAPT
  agent-browser                     SPIKE

M7/M8
  credentials/effects/delivery      OWN semantics
  MCP/provider SDKs                 ADAPT mechanics

M9
  mnfs.* telemetry semantics        OWN
  OpenTelemetry                     ADOPT
  evaluation backend                SPIKE

M10
  Mission-first UX semantics        OWN
  web infrastructure                REUSE
  Factory UI                        REFERENCE

M11
  multi-repo semantics              OWN
  Backstage                         DEFER / candidate host

AS-04/M12
  Environment semantics             OWN
  sandbox/VM fleet                  ADOPT/ADAPT after spike
```

---

# 48. Final principle

The MNFS should not become a factory that manufactures every mechanical part of its own factory.

Its competitive responsibility is stronger:

> **Know what must be true, who may authorize it, which existing component may perform the mechanics, how that component is bounded, and what Evidence proves the complete composition.**

That principle is consistent with the architecture already accepted.

The implementation strategy can now exploit it more aggressively.
