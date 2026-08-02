---
id: DOC-RESEARCH-MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1
title: MNFS Research — Pi Memory, Context, Communication and Token Efficiency
document_type: research_report
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1
related:
  - DOC-PRODUCT-BLUEPRINT
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# MNFS Research — Pi Memory, Context, Communication and Token Efficiency

**Status:** Research conclusion proposed for approval  
**Date:** 2026-08-01  
**Scope:** Review Product Blueprint Section 9 before it becomes canonical

---

# 1. Executive conclusion

The MNFS must not treat “memory” as one subsystem.

It needs five distinct layers:

```text
L0 — Authoritative Product and Domain Memory
     Git contracts/docs + SQLite operational state

L1 — Compiled Working Context
     Current Authority Snapshot + Role-specific Context Pack

L2 — Session Observational Memory
     Lossy, source-backed continuity for one Pi session/branch

L3 — Exact Session History
     Pi JSONL session ledger and exact source recall

L4 — Transport and Wake-up
     Process input, Pi lifecycle, optional ephemeral messaging
```

Central decision:

> Session memory may help an agent remember, but it never authorizes, accepts, closes, dispatches or overrides current MNFS state.

The strongest Pi-native candidate is `pi-observational-memory` V3. It should enter only as a pinned and optional **Session Memory Adapter**, after a controlled architecture spike.

Initial scope:

```text
MNFS Lead only
```

It must not become:

- repository memory;
- Mission state;
- cross-worker shared memory;
- contract storage;
- Claim evidence;
- acceptance authority.

Mastra Observational Memory is an architecture and evaluation reference, not a framework dependency. Embedding Mastra would introduce a second agent runtime and storage model beside Pi and MNFS.

M2 must not depend on Observational Memory or `pi-link`.

---

# 2. Why the previous Section 9 was incomplete

The earlier section correctly established:

- Context Packs;
- progressive disclosure;
- artifacts instead of large messages;
- session rotation;
- transcript not being state;
- bounded context;
- token telemetry.

But it did not decide:

1. which memory primitives Pi already provides;
2. whether MNFS should replace Pi compaction;
3. whether memory is session-, project- or Mission-scoped;
4. whether observations and reflections may be trusted;
5. how exact recall works;
6. what happens when memory contradicts SQLite;
7. which Roles may inherit memory;
8. whether workers need a Pi-native communication tool;
9. whether repository knowledge should live in a Pi memory extension;
10. how multiple memory plugins would interact.

These choices affect drift, cost, recovery, review independence and false completion.

---

# 3. Pi native capabilities

## 3.1 Session ledger

Pi stores sessions as JSONL.

Entries form a tree through `id` and `parentId`.

The ledger can contain:

- messages;
- tool calls and results;
- model and thinking changes;
- compaction entries;
- branch summaries;
- extension state;
- custom messages;
- labels.

This is exact session history.

It is not automatically the entire active model context.

## 3.2 Resume and branching

Pi can:

- continue the latest session;
- select a saved session;
- navigate the session tree;
- fork;
- clone;
- preserve abandoned branches.

These are useful session primitives, but they do not replace the MNFS domain model.

## 3.3 Native compaction

Pi compaction:

1. selects a safe turn boundary;
2. keeps recent context;
3. asks a model to summarize older entries;
4. appends a Compaction Entry;
5. rebuilds the active context.

Compaction is explicitly lossy.

The original entries remain in the JSONL ledger.

## 3.4 Extension points

Pi extensions can:

- intercept `session_before_compact`;
- provide custom compaction;
- append persistent entries;
- register tools and commands;
- inspect context usage;
- react to session lifecycle;
- inject context.

MNFS therefore does not need to fork Pi to evaluate alternative session memory.

## 3.5 SDK and RPC

Pi also provides:

- a TypeScript SDK;
- an RPC JSONL mode;
- streamed events;
- steering and follow-ups;
- session controls;
- programmatic compaction.

These are future integration options, not M2 requirements.

---

# 4. Mastra Observational Memory

## 4.1 Architecture

Mastra OM uses:

```text
Actor
+
Observer
+
Reflector
```

The active context contains:

```text
observations/reflections
+
recent unobserved messages
```

The Observer converts older messages into dense observations.

The Reflector consolidates accumulated observations and removes information judged obsolete or less useful.

## 4.2 Reported benefits

Mastra reports:

- stable, prompt-cacheable context;
- background memory work;
- reduced repeated raw history;
- 3–6× text compression in its experiments;
- higher anecdotal compression for tool-heavy context;
- 84.23% LongMemEval with GPT-4o;
- 94.87% with GPT-5-mini.

These results are useful evidence for conversational recall.

They are not proof of coding-harness correctness.

LongMemEval does not test:

- Git state;
- Claim lifecycle;
- worker recovery;
- review independence;
- false-completion prevention;
- integration correctness.

## 4.3 Decision

Do not embed `@mastra/memory` into MNFS.

Reasons:

- Pi already owns agent sessions;
- MNFS owns operational state;
- Mastra would add another runtime;
- Mastra storage would duplicate authority;
- Pi exposes the required compaction hooks;
- cloud-level complexity would enter too early.

Use the architecture lessons and benchmarks as references.

---

# 5. `pi-observational-memory` V3

## 5.1 Researched version

```text
3.0.3
```

Published characteristics:

- Pi extension;
- MIT;
- zero runtime dependencies;
- Observation, Reflection and Dropper stages;
- source-backed recall;
- background memory work;
- deterministic compaction rendering;
- branch-scoped ledger entries;
- visible and full memory views.

## 5.2 Lifecycle

```text
turn_end
→ Observer when due
→ Reflector when due
→ Dropper after reflection

agent_end
→ proactive compaction trigger

session_before_compact
→ render prepared memory without waiting for a model
```

## 5.3 Ledger model

V3 appends entries such as:

```text
om.observations.recorded
om.reflections.recorded
om.observations.dropped
```

Observations carry source Pi entry IDs.

Reflections point to supporting Observation IDs.

Dropping removes entries from active memory, not from exact session history.

## 5.4 Recall

The `recall` tool resolves exact source evidence for an Observation or Reflection ID.

This is valuable for:

- traceability;
- verifying compressed claims;
- recovering exact rationale;
- checking a memory before material Decisions.

It is not general semantic search.

## 5.5 Strengths

- native to Pi;
- no external database;
- preserves raw history;
- source-backed;
- inspectable;
- compaction latency path is model-free;
- can use a cheaper dedicated memory model;
- can be disabled;
- replaceable behind an adapter.

## 5.6 Risks

### Probabilistic compression

Observer, Reflector and Dropper are model-driven.

They can omit, distort, generalize or preserve stale information.

### Completion-authority conflict

The default rendered guidance says work described as completed should not be redone unless requested.

That is incompatible with MNFS authority:

```text
Observation says completed
≠ Claim accepted
≠ Feature closed
```

Current SQLite state, Approved Contract and gates must always win.

### Session scope

The ledger belongs to a Pi session branch.

It is not canonical repository or Mission memory.

### Upgrade compatibility

V3 does not read V2 memory/settings.

Rolling back also loses visibility across formats.

### Cost

Observer, Reflector and Dropper use model calls.

Without an override, they may use the main session model.

### Missing harness-specific benchmark

There is no published proof that it prevents coding drift or false completion in a system like MNFS.

## 5.7 Verdict

```text
CANDIDATE — ADOPT ONLY AFTER SPIKE
```

Proposed Role:

```text
Optional Session Memory Adapter
```

Initial enablement:

```text
MNFS Lead only
```

Pinned candidate:

```text
pi-observational-memory@3.0.3
```

---

# 6. Other Pi memory candidates

## 6.1 `pi-observational-memory-extension`

Capabilities include:

- Mastra-style Observer/Reflector;
- session or project scope;
- local retrieval;
- optional embeddings;
- secret redaction;
- background buffering;
- TUI inspection.

It is richer, but project scope would create a second repository-memory authority.

Decision:

```text
DEFER
```

## 6.2 `pi-memory`

Provides persistent memory, daily logs, scratchpad and semantic search.

Useful as a personal Pi tool.

It would duplicate MNFS canonical repository memory.

Decision:

```text
NOT MNFS CORE MEMORY
```

## 6.3 `@josephakern/pi-memory`

Useful design patterns:

- capped always-injected index;
- topic files on demand;
- strict writeback;
- archive;
- visible Markdown;
- global/project separation.

Decision:

```text
BORROW PATTERNS, DO NOT ADOPT AS SECOND PROJECT MEMORY
```

## 6.4 `pi-memctx`

Provides:

- Markdown workspace packs;
- qmd/grep retrieval;
- automatic prompt-time injection;
- auto-learning;
- review queue;
- runbooks;
- decisions;
- fallback to repository inspection;
- secret filtering.

It overlaps with the planned MNFS Repository Profile, Context Pack Compiler, Decisions, Code Map and Memory Promotion Gateway.

Decision:

```text
RESEARCH REFERENCE / FUTURE BENCHMARK
```

## 6.5 `pi-agenticoding`

Provides:

- clean child contexts;
- task-scoped notebook;
- deliberate handoff;
- topic boundaries;
- readonly mode;
- context-pressure visibility.

Useful principles:

- same task → isolate noise;
- new task → deliberate handoff;
- task memory should die with the task;
- avoid forever-memory rot.

It overlaps with MNFS spawning, Context Packs, handoffs and Roles.

Decision:

```text
ADOPT PRINCIPLES, NOT CORE DEPENDENCY
```

---

# 7. Messaging and `pi-link`

## 7.1 Pi native position

Pi sessions are isolated.

Pi provides process/session lifecycle and message queues inside a session, but no authoritative durable multi-session command bus.

## 7.2 `pi-link`

Capabilities:

- local WebSocket network;
- named Pi terminals;
- direct chat;
- remote prompts;
- status;
- session-resume convenience.

Potential uses:

- wake a Reviewer;
- send steering;
- notify about a Claim;
- make multi-terminal operation visible.

It must not own durable coordination.

Decision:

```text
OPTIONAL NOTIFICATION TRANSPORT LATER
NOT M2 DEPENDENCY
```

Future safe pattern:

```text
MNFS persists command
→ pi-link wakes Actor
→ Actor reads command from MNFS
→ result persists in MNFS
```

## 7.3 M2 communication

M2 only needs:

```text
Lead
→ spawn Pi Worker with Dispatch Packet

Worker
→ use MNFS CLI to open/complete Claim

new Lead
→ recover from SQLite and observed processes/filesystem
```

No general message bus is required.

---

# 8. Revised MNFS memory architecture

## 8.1 L0 — Authoritative memory

Sources:

- SQLite;
- Git;
- Approved Contracts;
- ADRs;
- Product Blueprint;
- Repository Profile;
- Standards;
- Golden Paths;
- Decisions;
- Evidence Bundles;
- Closeouts.

Only L0 can determine lifecycle and acceptance.

## 8.2 L1 — Current Authority Snapshot and Context Pack

Every Actor receives current structured facts:

```text
target
current state
contract hash
current Attempt
blockers
active Decisions
permitted next actions
```

This must precede any session memory.

## 8.3 L2 — Session Observational Memory

Properties:

- supporting;
- session/branch scoped;
- probabilistic;
- source-backed when supported;
- never a gate input by itself;
- never completion authority.

## 8.4 L3 — Exact session history

Pi JSONL preserves exact session entries.

Use exact recall only when necessary.

Do not inject entire transcripts by default.

## 8.5 L4 — Transport

Process input, lifecycle events, WebSocket frames and future RPC delivery are replaceable notification mechanisms.

They are not memory.

---

# 9. Precedence

For deciding what to do now:

```text
1. Current SQLite state
2. Current Approved Contract and policy
3. Current Authority Snapshot / Context Pack
4. Session Observational Memory
5. Session summaries
6. Historical transcript
```

For determining what was historically said, exact source entries can be authoritative about that historical event.

They are not necessarily authoritative about current state.

---

# 10. Role policy

| Role | Observational Memory | Initial policy |
|---|---|---|
| MNFS Lead | Candidate | enable only after spike |
| Planner | Optional | same Planning phase only |
| Investigator | Off by default | Artifact-first work |
| Writer Worker | Off by default | bounded Context Pack |
| Long-running Writer | Conditional | isolated multi-day Track |
| Initial Reviewer | Off | preserve independence |
| Remedy Reviewer | Same session may resume | same Finding and bounded delta |
| Integrator | Off | short deterministic work |
| QA Actor | Off/fresh | avoid implementation bias |
| Closeout Actor | Optional | structured aggregation dominates |

Never share one OM stream between:

- Lead and Writer;
- parallel Workers;
- Writer and Reviewer;
- Reviewer and QA;
- unrelated Missions.

Project-scoped OM is not adopted.

---

# 11. Memory Promotion Gateway

Useful knowledge can originate in:

- transcript;
- Observation;
- Reflection;
- Investigation;
- Finding;
- Review;
- QA.

It must not remain trapped in session memory.

It must not become canonical automatically.

Promotion flow:

```text
source
→ Memory Candidate
→ exact-source verification
→ classification
→ Authority check
→ canonical target
→ persistence through MNFS
```

Canonical targets:

- Decision;
- Repository Profile amendment;
- Standard candidate;
- Golden Path improvement;
- Defect Class;
- Review Learning;
- Evidence;
- gardening task.

Future command concept:

```text
mnfs memory propose
```

---

# 12. One memory system per concern

Do not stack multiple memory plugins for one Role.

Unsafe default:

```text
pi-observational-memory
+
pi-memory
+
pi-memctx
+
another compactor
```

Risks:

- duplicated injection;
- contradictory facts;
- token bloat;
- hook conflicts;
- multiple hidden write paths;
- multiple background model costs;
- unclear precedence.

Policy:

```text
one Session Memory Adapter
+
one canonical MNFS memory system
+
exact recall
```

---

# 13. Architecture Spike AS-01

## 13.1 Baselines

Compare only:

```text
A. Pi native compaction
B. pi-observational-memory V3
```

## 13.2 Environment

- WSL2;
- pinned Pi version;
- pinned `pi-observational-memory@3.0.3`;
- isolated repository;
- source review;
- explicit memory model;
- token/cost tracking;
- debug logs during the spike.

## 13.3 Scenarios

1. Long Lead session with multiple compactions;
2. exact source recall;
3. an old Decision superseded by a new Decision;
4. OM says completed while SQLite says rejected;
5. Approved Contract changes;
6. memory-model failure;
7. resume same Session;
8. new clean Lead Session;
9. Role isolation;
10. at least three compactions;
11. upgrade/rollback drill;
12. total cost and compaction latency.

## 13.4 Acceptance criteria

Accept the candidate only if:

1. no critical false memory appears in the test corpus;
2. current MNFS state always wins conflicts;
3. exact recall succeeds;
4. three compactions preserve all deciding facts;
5. memory failure never changes domain state;
6. a clean Session recovers without OM;
7. Reviewer and QA isolation remains intact;
8. total cost and latency are measured;
9. benefit over native compaction is material;
10. install, disable, upgrade and rollback are documented.

## 13.5 Removal conditions

Disable or remove it if:

- false memory is material;
- false completion increases;
- cost exceeds benefit;
- failures block the main Actor;
- Pi upgrades repeatedly break it;
- recall is unreliable;
- maintenance becomes disproportionate.

---

# 14. Adoption matrix

| Tool or mechanism | Decision | MNFS role |
|---|---|---|
| Pi JSONL sessions | Adopt | exact session history |
| Pi native compaction | Keep | baseline and fallback |
| `pi-observational-memory@3.0.3` | Candidate | Lead Session Memory Adapter |
| Mastra OM package | Do not embed | research reference |
| `pi-observational-memory-extension` | Defer | alternative research |
| `pi-memory` | Not core | optional personal memory |
| `@josephakern/pi-memory` | Borrow patterns | capped index/writeback |
| `pi-memctx` | Research reference | future repository-recall benchmark |
| `pi-agenticoding` | Borrow principles | deliberate handoff |
| `pi-link` | Defer | future notification transport |
| Pi SDK/RPC | Future | programmatic control |
| MNFS SQLite | Adopt | durable coordination |
| Git Artifacts | Adopt | canonical versioned memory |

---

# 15. Roadmap impact

## M2

M2 does not depend on:

- OM;
- `pi-link`;
- project memory;
- generic Context Pack Compiler;
- Pi SDK host.

M2 uses:

- fixed Writer Pack;
- child Pi process;
- CLI;
- SQLite;
- Claim;
- Recovery.

## Post-M2

Run AS-01 before long-lived Lead orchestration with OM becomes default.

## Before multiple live Actors need steering

Define durable command/outbox semantics.

Only then evaluate a transport adapter.

## Before project-wide retrieval

Deliver:

- Repository Profile;
- Context Index;
- Code Map;
- Memory Promotion Gateway.

Then compare the MNFS approach against `pi-memctx`.

---

# 16. Proposed ADRs after approval

## ADR-0004 — Memory strata and session observational memory

- canonical memory remains in SQLite/Git;
- OM is supporting;
- Current Authority Snapshot wins;
- memory is Role-scoped;
- plugin requires accepted spike.

## ADR-0005 — Durable coordination versus ephemeral transport

- durable state and commands remain in MNFS;
- transport only delivers or wakes;
- M2 uses child process + CLI;
- `pi-link` is deferred.

---

# 17. Final recommendation

> Replace the generic memory model in Section 9 with explicit memory strata.

> Reuse Pi JSONL as exact session history.

> Evaluate `pi-observational-memory` V3 as an optional Lead-only Session Memory Adapter.

> Always inject a Current Authority Snapshot above observational memory.

> Never allow Observational Memory to become Mission state, repository truth, Evidence authority or cross-worker memory.

> Do not install multiple memory extensions for the same Role.

> Keep M2 independent of OM and `pi-link`.

> Adopt tooling only after a coding-specific spike proves continuity, safety and total cost.
