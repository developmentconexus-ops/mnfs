---
id: DOC-RESEARCH-MNFS-RESEARCH-CAPABILITY-ROADMAP-v1
title: MNFS Research — Capability Roadmap and Implementation Sequencing
document_type: research_report
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-CAPABILITY-ROADMAP-v1
related:
  - DOC-PRODUCT-BLUEPRINT
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# MNFS Research — Capability Roadmap and Implementation Sequencing

**Status:** Research conclusion proposed for Product Blueprint Section 12  
**Date:** 2026-08-02  
**Scope:** Rebuild the MNFS product roadmap after the Product Blueprint expanded from a coding harness into a local-first software factory and future agentic development platform

---

# 1. Executive conclusion

The current M0–M6 roadmap was an effective initial skeleton, but it no longer represents the complete product architecture.

It predates:

- the canonical Domain Model;
- mandatory Mission/Milestone/Feature criteria;
- Engineering Standards and Golden Paths;
- Repository Profiles;
- Context and Memory strata;
- Security Environments and sandboxing;
- Credential Grants and External Effects;
- Operator Control Plane;
- OpenTelemetry;
- Evaluation and Calibration;
- remote/cloud execution.

The roadmap should be replaced by an evidence-driven capability roadmap with four horizons:

```text
H0 — Proven Foundation
H1 — Trusted Local Harness
H2 — Complete Local Software Factory
H3 — Multi-Repository Agentic Development Platform
```

Recommended product milestones:

```text
M0  Foundation Walking Skeleton                     ACCEPTED
M1  Visual Mission Planning                         ACCEPTED

AB1 Architecture Baseline and Contract Reconciliation
                                                    CURRENT GATE

M2  Secure One-Worker Vertical Slice                COMMITTED
M3  Repository Profile and Engineering System v1    PLANNED
M4  Independent Review and Local Correction          PLANNED
M5  Parallel Write Tracks and Integration            PLANNED
M6  Adaptive Quality, Evidence and Live QA            PLANNED
M7  Credentials, External Integrations and Effects   TARGET
M8  Delivery, Closeout and Operational Proof         TARGET
M9  Observability, Evaluation and Calibration        TARGET
M10 Operator Web Console and DevEx                   OPTION
M11 Multi-Repository Software Factory                OPTION
M12 Remote Execution and Cloud Control Plane         OPTION
```

Architecture Spikes are separate from product milestones:

```text
AS-01 Pi Session Memory and Messaging
AS-02 Local Pi Sandbox on WSL2
AS-03 Observability and Calibration Backend
AS-04 Remote Execution Environment
AS-05 Multi-Repository Portal and Catalog
```

The critical next action is not to start implementing the current MIS-002 revision unchanged.

The approved M2 contract is historical evidence of the earlier architecture, but it is now stale against the Product Blueprint because it:

- does not define acceptance criteria at Milestone level;
- excludes environment isolation beyond worktrees;
- does not include a Security Environment or policy hash;
- uses a narrower Claim/Attempt model;
- predates Current Authority Snapshot;
- predates the new recovery and fencing rules.

Therefore:

```text
finish Product Blueprint
→ create ADRs
→ replace docs/roadmap.md
→ reconcile/supersede MIS-002
→ run AS-02
→ begin M2 implementation
```

---

# 2. Market and architecture principles

## 2.1 Walking skeleton

A walking skeleton proves an end-to-end path with minimal depth before breadth and sophistication.

Useful properties:

- exercises real architecture boundaries;
- exposes integration assumptions early;
- gives a persistent base for evolution;
- reduces late integration;
- produces a concrete proof rather than a component inventory.

MNFS M0 and M1 already follow this principle.

M2 should remain a walking skeleton for execution:

```text
approved contract
→ secure worktree/environment
→ Pi Worker
→ Claim
→ verification
→ Lead restart
→ explicit acceptance
```

It should not become a general scheduler or remote platform.

---

## 2.2 Vertical slices

A product milestone should cross all layers needed to prove one capability.

A bad milestone:

```text
build all database tables
```

A useful milestone:

```text
one real Worker produces a durable Claim,
survives Lead restart,
and is accepted only by a gate
```

Roadmap milestones are organized around observable outcomes, not layers or component inventories.

---

## 2.3 Evolutionary architecture

Architecture is not completed before feature work.

It is guided by:

- incremental change;
- fitness functions;
- explicit constraints;
- feedback;
- evidence;
- architectural decisions;
- ability to replace adapters.

The roadmap should implement the minimum architecture needed for the next proof while preserving the long-term boundaries defined in the Blueprint.

---

## 2.4 Minimum viable platform

Current platform-engineering guidance recommends starting with the most common workflow and building only enough platform to make that journey demonstrably better.

For MNFS, the first platform customer is:

```text
the Operator running one Pi Worker
in one trusted local repository
```

The first common journey is:

```text
plan
→ approve
→ execute
→ verify
→ recover
→ accept
```

Do not build:

- catalog;
- portal;
- remote fleet;
- multi-user RBAC;
- generic policy DSL;

before this journey is better than direct Pi usage.

---

## 2.5 Platform as a product

The platform is judged by:

- task success;
- reduction in cognitive load;
- developer/operator satisfaction;
- adoption and retention;
- delivery outcomes;
- reliability and security;
- cost.

Therefore each milestone must deliver an operator-visible improvement and collect feedback.

---

## 2.6 Golden Paths before broad platform

A platform gains value by making one high-frequency path:

- self-service;
- documented;
- secure;
- observable;
- repeatable;
- easier than manual composition.

MNFS should not build a Golden Path catalog first.

It should build:

```text
one fixed M2 path
→ one real Repository Golden Path
→ a small catalog based on repeated needs
```

---

## 2.7 Architecture runway

The roadmap needs enough enabling capability before dependent work, but no speculative platform program.

Examples:

```text
M2 needs a minimal sandbox boundary,
not the complete Credential Broker.

M3 needs Repository Profile v1,
not a universal repository ontology.

M4 needs one independent Reviewer path,
not a marketplace of review agents.

M5 needs one serial Integration queue,
not distributed merge scheduling.
```

---

# 3. Roadmap semantics

## 3.1 Product Milestone versus Mission Milestone

Product Roadmap Milestone:

```text
M2 — Secure One-Worker Vertical Slice
```

Mission-scoped Milestone:

```text
MIS-002/M01
```

Documentation must always preserve this distinction.

## 3.2 Capability

A durable product behavior available to future Missions.

## 3.3 Architecture Spike

A bounded investigation used to make an uncertain architectural decision.

It is not product delivery.

## 3.4 Enabler

A small capability required by a vertical slice.

It must have a named consumer.

## 3.5 Gate

A condition that must be true before a milestone begins or closes.

## 3.6 Horizon

A planning-confidence band.

Horizon is not a date.

---

# 4. Roadmap confidence model

## ACCEPTED

Capability implemented and proven.

## COMMITTED

Next capability with an approved or soon-to-be-reconciled contract.

## PLANNED

Architecture and sequence are known, but detailed Mission contract will be created near execution.

## TARGET

Desired capability with dependencies known; details remain changeable.

## OPTION

Strategic direction, not a commitment.

## DEFERRED

Explicitly outside the current horizon.

## REMOVED

No longer part of the roadmap.

---

# 5. Rules for roadmap milestones

Every milestone must contain:

```text
Outcome
Operator-visible value
Entry criteria
Capabilities
Golden proof
Exit criteria
Non-goals
Dependencies
Risks
Architecture spikes
Telemetry baseline
Removal/replan triggers
```

A milestone does not close because:

- code was merged;
- all Features are marked complete;
- a PR is green;
- the Lead reports success.

It closes when its milestone-level Acceptance Criteria pass.

---

# 6. Evidence ladder

Each milestone should prove more than the prior milestone.

```text
M0 — durable local state
M1 — durable approved intention
M2 — secure durable execution
M3 — repository-aware governed execution
M4 — independent quality judgment and correction
M5 — safe parallelism and composition
M6 — hierarchical quality and user-level validation
M7 — controlled external capabilities
M8 — delivery and closeout
M9 — measured improvement
M10 — integrated operator experience
M11 — repeatable multi-repository software factory
M12 — remote and cloud operation
```

---

# 7. Current repository assessment

## 7.1 M0

Implemented and accepted:

- WSL2 environment contract;
- Repository identity;
- runtime outside worktrees;
- SQLite;
- Mission open/status;
- fresh-process recovery;
- CLI/tests.

## 7.2 M1

Implemented and accepted:

- Mission Plan schema;
- revisions;
- content hash;
- deterministic HTML;
- Lavish loop;
- exact-hash approval;
- materialized contract.

## 7.3 Existing M2 contract

Strengths:

- smallest one-Worker slice;
- Treehouse boundary;
- durable Claim;
- explicit worker completion versus acceptance;
- Lead restart;
- no transcript parsing;
- Herdr deferred;
- WSL2 real proof.

Required reconciliation:

- hierarchical IDs;
- Milestone Acceptance Criteria;
- Attempt and Worker Run identity;
- Intent–Action–Observation;
- idempotency/fencing;
- Current Authority Snapshot;
- Environment Security Profile;
- network and credential default;
- policy hash;
- fail-closed behavior;
- Security drill;
- recovery taxonomy.

---

# 8. Architecture Baseline Gate AB1

## Outcome

All product architecture necessary to safely resume implementation is documented, reconciled and versioned.

## Deliverables

- Product Blueprint Sections 1–13;
- Domain Model;
- End-to-End Flows;
- Engineering System;
- Security model;
- Quality and Evidence;
- roadmap v2;
- documentation map;
- ADRs 0004–0011;
- legacy map;
- FirstMate inspiration map;
- superseded/reconciled MIS-002 contract.

## Entry

M0/M1 accepted.

## Exit

- no contradiction between Blueprint, ADRs and roadmap;
- every new durable decision has an ADR or explicit Blueprint authority;
- M2 contract references the new model;
- M2 Milestones have their own Acceptance Criteria;
- AS-02 is scheduled as a prerequisite;
- documentation sources of truth are named.

## Non-goals

- code for M2;
- all capability specs;
- final cloud design;
- full Standards catalog.

---

# 9. M2 — Secure One-Worker Vertical Slice

## Status

```text
COMMITTED AFTER CONTRACT RECONCILIATION
```

## Outcome

One Pi Worker executes a fixed deterministic task inside a Treehouse worktree and an approved local security boundary, produces a durable Claim, survives Lead restart, and is accepted only by an MNFS gate.

## Operator value

The Operator can delegate one bounded task without losing state, trusting process text or granting the Worker unrestricted host authority.

## Entry criteria

- AB1 closed;
- reconciled Approved Contract;
- ADRs 0001–0008 consistent;
- Treehouse available;
- Pi version pinned;
- AS-02 accepted or an equivalent local boundary approved;
- fixed demo task defined;
- canonical WSL2 environment healthy.

## Capability slices

### M2.C1 Identity and state reconciliation

- qualified Mission/Milestone/Feature IDs;
- Write Track;
- Attempt;
- Worker Run;
- Claim;
- Events;
- typed state errors.

### M2.C2 Treehouse Lease

- Intent;
- acquire;
- inspect;
- release;
- fencing;
- orphan detection;
- idempotency.

### M2.C3 Minimal Local Security Profile

- E1 Environment;
- policy hash;
- explicit cwd;
- `shell: false`;
- environment allowlist;
- write allowlist;
- sensitive read deny;
- network off;
- no credentials;
- external effects denied;
- fail closed.

### M2.C4 Fixed Writer Pack

- Current Authority Snapshot;
- Feature identity;
- contract hash;
- task;
- write-set;
- output contract;
- Claim command;
- security profile.

### M2.C5 Pi Worker Process Adapter

- start;
- observe;
- cancel;
- process/log refs;
- exit classification;
- no transcript parsing.

### M2.C6 Claim and minimal gate

- Claim transaction;
- worker completion;
- deterministic demo verification;
- explicit acceptance;
- no self-acceptance.

### M2.C7 Recovery

- Lead restart;
- Lease/Claim/Worker reconcile;
- no duplication;
- divergence report;
- safe next action.

## Golden proof

```text
initialize canonical repo
→ approve reconciled MIS-002
→ grant Treehouse Lease
→ launch sandboxed Pi Worker
→ Worker performs fixed edit
→ Worker opens/completes Claim
→ kill Lead
→ start fresh Lead
→ recover same Lease, Attempt, Worker Run and Claim
→ verify security sentinels remained inaccessible
→ execute deterministic gate
→ accept Claim
→ release Lease idempotently
```

## Exit criteria

- all Mission, Milestone and Feature criteria satisfied;
- DR-01 through relevant M2 drills pass;
- AS-02 deny tests remain green;
- no host escape;
- no duplicate Claim;
- no orphaned unclassified work;
- no Herdr dependency;
- fresh-process proof on WSL2;
- human and JSON CLI contracts stable;
- accepted Evidence preserved.

## Non-goals

- arbitrary operator tasks;
- independent Reviewer;
- multiple Workers;
- Integration queue;
- Observational Memory;
- `pi-link`;
- Web Console;
- remote sandbox;
- production effects;
- generic Engineering System.

---

# 10. M3 — Repository Profile and Engineering System v1

## Status

```text
PLANNED
```

## Outcome

MNFS can onboard a repository, understand its commands and boundaries, select one Golden Path, compile a bounded Context Pack and execute a real non-hardcoded Feature.

## Operator value

The Harness stops being a demo loop and becomes usable for one real repository workflow without manually rebuilding instructions every time.

## Entry criteria

- M2 closed;
- one real repository/fixture selected;
- Profile schema decisions bounded;
- no need for multi-repo catalog.

## Capabilities

### M3.C1 Repository Bootstrap

- stack detection;
- commands;
- architecture map;
- environments;
- contracts;
- open sections;
- operator ratification.

### M3.C2 Repository Profile v1

- build/test/typecheck;
- modules;
- protected paths;
- resource declarations;
- Environment binding;
- live QA capability;
- external systems.

### M3.C3 Standards Registry v1

Initial candidates:

- CORE-001;
- ARCH-001;
- TEST-001;
- INT-001;
- SEC baseline.

### M3.C4 One Golden Path

Recommended first choice:

```text
GP-BUGFIX
```

Rationale:

- common;
- bounded;
- requires regression proof;
- exercises repository knowledge;
- lower external risk.

Alternative:

```text
GP-API-ENDPOINT
```

only if a suitable fixture is stronger.

### M3.C5 Context Compiler v1

- Current Authority Snapshot;
- Role Contract;
- applicable Standards;
- Golden Path;
- code references;
- commands;
- security policy.

### M3.C6 Fitness Runner v1

- command bindings;
- Receipts;
- Standard mapping;
- actionable failures.

### M3.C7 Real bounded Worker

- non-hardcoded task;
- Profile-driven execution;
- Claim;
- deterministic verification.

### M3.C8 AS-01

Run Pi Session Memory and Messaging Spike after Current Authority Snapshot exists.

## Golden proof

Onboard a second repository or realistic fixture, compile its Profile, select a Golden Path, execute one real bounded bug fix and prove it without hardcoded MNFS-specific instructions.

## Exit criteria

- Profile contains no required silent `OPEN`;
- one Golden Path demonstrably reduces manual context;
- one real Feature uses compiled Pack;
- fitness checks produce Receipts;
- second fresh Session can understand the repository from artifacts;
- AS-01 produces an ADR decision;
- no project memory plugin becomes source of truth.

## Non-goals

- large Standards catalog;
- multiple Golden Paths;
- remote execution;
- generic code intelligence platform;
- vector database;
- independent Reviewer.

---

# 11. M4 — Independent Review and Local Correction

## Status

```text
PLANNED
```

## Outcome

A completed Claim is reviewed independently, rejected with confirmed Findings, corrected in the same valid Write Track and reaccepted through bounded delta verification.

## Operator value

The Harness can detect and correct defects without asking the Operator to inspect the implementation or spawning wasteful full retries.

## Entry criteria

- M3 closed;
- Context Packs;
- fixed SHA/tree;
- deterministic verification;
- Role isolation.

## Capabilities

- risk classification v1;
- Review Pack;
- cold Reviewer;
- Finding schema;
- anchor-or-abstain;
- Verdict;
- Correction Contract;
- same-worktree reuse;
- new Attempt;
- delta verification;
- anti-loop fingerprint v1;
- contested Finding flow;
- Review telemetry baseline.

## Golden proof

A deliberately flawed Feature passes Worker self-checks, an independent Reviewer finds a confirmed architecture/correctness issue, the same Worker/Track corrects it, the Reviewer verifies the delta and the gate accepts the Claim.

## Exit criteria

- Reviewer never receives Writer memory;
- Finding has locus/evidence;
- Reviewer does not implement;
- Correction does not expand scope;
- same worktree is safely reused;
- old Claim remains historical;
- new Receipt and Verdict bind to new tree;
- retry loop is bounded.

## Non-goals

- multiple parallel Tracks;
- dual Reviewer universal;
- browser QA;
- full risk engine;
- automatic model voting.

---

# 12. M5 — Parallel Write Tracks and Integration

## Status

```text
PLANNED
```

## Outcome

Two independent Write Tracks execute concurrently, preserve resource ownership, and compose into one verified candidate in a clean Integration workspace.

## Operator value

MNFS gains real concurrency without turning parallelism into collisions, lost work or hidden integration risk.

## Entry criteria

- M4 closed;
- stable Write Track model;
- Review/Correction;
- resource declarations;
- integration criteria.

## Capabilities

- write-set ownership;
- seam ownership;
- minimal resource reservation;
- two Pi Workers;
- Track-specific Environment;
- concurrency/fencing;
- Integration queue;
- clean workspace;
- merge order;
- CAS/base validation;
- conflict taxonomy;
- composition Receipts;
- Integration Verdict;
- worktree preservation;
- optional Herdr projection.

## Golden proof

Two disjoint Features run in parallel, produce accepted Claims, integrate serially, pass Milestone composition criteria and preserve source worktrees until the candidate is accepted.

A second scenario intentionally creates a semantic conflict and proves it cannot be resolved as a mechanical merge.

## Exit criteria

- no shared-write race;
- external resources isolated or serialized;
- Track changed after acceptance becomes stale;
- integration is reproducible;
- conflict does not destroy either Track;
- Milestone criteria prove composition;
- Herdr absence does not affect correctness.

## Non-goals

- arbitrary Worker pool;
- distributed scheduler;
- parallel Integration;
- remote Workers;
- auto-scaling.

---

# 13. M6 — Adaptive Quality, Evidence and Live QA

## Status

```text
PLANNED
```

## Outcome

MNFS compiles a risk-appropriate Gate DAG, proves criteria with fresh Evidence, validates user-facing behavior in a live environment and closes Feature/Milestone/Mission hierarchically.

## Operator value

The Operator receives proof of the actual outcome rather than a collection of green local checks.

## Entry criteria

- M5 closed;
- integration candidate;
- criteria hierarchy;
- Environment bindings;
- Evidence architecture.

## Capabilities

- complete Acceptance Criterion model;
- STATIC/EXECUTABLE/LIVE/JUDGMENT;
- Verification Plan compiler;
- Evidence Item;
- complete Receipt model;
- freshness/staleness;
- Gate DAG;
- risk-adaptive Review;
- second targeted Reviewer when justified;
- QA Journey;
- browser/API adapter;
- Evidence Bundle;
- hierarchical closure;
- accepted risk;
- anti-loop v2.

## Golden proof

A user-facing Feature is implemented across multiple components, integrated, validated by browser/API Journey and closed only after Feature, Milestone and Mission criteria receive fresh Evidence.

A second proof changes the code after a Receipt and shows that stale Evidence cannot close the target.

## Exit criteria

- no `PASS_WITH_ASSUMPTION`;
- live criteria use real seams;
- parent criteria are separate;
- Evidence provenance resolves;
- stale proof is rejected;
- QA failure creates Correction;
- Bundle explains acceptance.

## Non-goals

- production deployment;
- full credential system;
- universal browser automation;
- compliance suite;
- external observability backend.

---

# 14. M7 — Credentials, External Integrations and Effects

## Status

```text
TARGET
```

## Outcome

MNFS can safely use a provider sandbox or shared non-production system with scoped credentials and a durable External Effect lifecycle.

## Operator value

Agents can perform useful integrations without receiving general cloud, GitHub or production power.

## Entry criteria

- M6 closed;
- Security baseline;
- Environment Profile;
- Effect model;
- suitable sandbox provider.

## Capabilities

- Credential Requirement;
- Credential Grant;
- 1Password/SOPS binding optional;
- workload identity design;
- provider sandbox;
- Network Policy modes;
- Effect Request;
- Effect Executor;
- Effect Receipt;
- unknown-effect Reconcile;
- Security Violation;
- incident flow;
- Dev Container binding v1.

## Golden proof

A Worker requests a provider-sandbox operation, receives a scoped temporary Credential Grant through a separate executor, performs an idempotent effect, records a Receipt and recovers correctly after a simulated response timeout.

## Exit criteria

- secret absent from Packs/logs/memory;
- ordinary Writer has no production credential;
- effect class and Authority are correct;
- unknown effect is reconciled before retry;
- Credential expires/revokes;
- network policy enforced;
- security Evidence preserved.

## Non-goals

- production automation;
- enterprise secret manager;
- multi-cloud universal credential broker;
- remote Workers.

---

# 15. M8 — Delivery, Closeout and Operational Proof

## Status

```text
TARGET
```

## Outcome

An accepted Mission can create a delivery artifact, pass PR/CI gates, preserve complete Evidence and close with an auditable operational result.

## Operator value

MNFS completes the lifecycle from objective to reviewable delivery rather than stopping at a local worktree.

## Entry criteria

- M7 closed;
- integrated candidate;
- Delivery Effect model;
- Repository delivery bindings.

## Capabilities

- Delivery Gate;
- branch/PR Effect Request;
- optional no-mistakes adapter;
- CI observation;
- OIDC/workload identity where applicable;
- failed-delivery reconcile;
- Mission Evidence Bundle;
- Closeout;
- delivered SHA;
- release notes;
- known limitations;
- rollback or recovery record;
- Quality Posture delta.

## Golden proof

MNFS produces a PR from an integrated candidate, observes CI, handles one failed check and correction, records the final delivery state and closes the Mission with a complete Evidence Bundle.

## Exit criteria

- Delivery does not bypass Effect Authority;
- CI result binds to candidate SHA;
- unknown delivery state is reconciled;
- closeout references all criteria;
- accepted risks and Waivers appear;
- local work is preserved until delivery is safe;
- final operator summary is accurate.

## Non-goals

- automatic production deployment by default;
- release orchestration for every platform;
- organization-wide compliance.

---

# 16. M9 — Observability, Evaluation and Calibration

## Status

```text
TARGET
```

## Outcome

MNFS can explain its execution with vendor-neutral telemetry, evaluate changes on Golden Missions and change policies through explicit Calibration Decisions.

## Operator value

The Harness becomes empirically improvable rather than relying on intuition or model marketing.

## Entry criteria

- M8 provides complete end-to-end flow;
- stable Domain Events;
- enough accepted Missions for dataset candidates.

## Capabilities

- `mnfs.*` semantic attributes;
- OpenTelemetry;
- optional OTLP export;
- AS-03 Phoenix/Langfuse comparison;
- Golden Missions Dataset;
- Evaluation Result;
- deterministic/human/LLM evaluators;
- Experiment Run;
- segmentation;
- Calibration Candidate;
- shadow/canary/rollback;
- cost/quality scorecard;
- alert quality.

## Golden proof

Run the same Golden Mission under two model/context/gate configurations, compare quality, false completion, cost and latency, select a candidate through a Calibration Decision, deploy it in shadow/canary and roll it back on a defined regression.

## Exit criteria

- Domain State remains correct without backend;
- raw sensitive content off by default;
- experiments are reproducible;
- Evaluation is not Verdict;
- no universal productivity score;
- policy change has Evidence and rollback;
- telemetry coverage is explicit.

## Non-goals

- full autonomous self-tuning;
- ranking individual engineers;
- mandatory SaaS backend;
- organization-wide DORA program.

---

# 17. M10 — Operator Web Console and DevEx

## Status

```text
OPTION
```

## Outcome

The Operator can manage the complete local lifecycle through an integrated Mission-first interface using the same Application Services as the CLI.

## Operator value

The product becomes easier to operate, inspect and adopt without sacrificing authority or explainability.

## Entry criteria

- stable CLI JSON;
- stable Application Services;
- M8 flow proven;
- M9 telemetry semantics stable enough.

## Capabilities

- local API;
- Mission Control;
- Mission Workspace;
- Decision Inbox;
- Execution View;
- Quality/Evidence;
- Recovery Center;
- Security/Effects;
- Engineering System;
- Calibration Lab;
- Audit View;
- notifications;
- Herdr attach;
- Lavish migration/embedding decision.

## Golden proof

The Operator completes one Mission through the Web Console while the CLI observes identical state and all transitions remain in the Core.

## Exit criteria

- no duplicated Domain rules;
- CLI and UI show consistent state;
- all actions have Authority;
- accessibility and latency criteria pass;
- UI failure does not corrupt execution.

## Non-goals

- multi-tenant SaaS;
- Backstage;
- mobile app;
- custom terminal emulator.

---

# 18. M11 — Multi-Repository Software Factory

## Status

```text
OPTION
```

## Outcome

MNFS manages multiple repositories, reusable Golden Paths, ownership, documentation and Engineering Standards as a platform product.

## Operator value

The Harness becomes a repeatable software factory rather than a repository-specific tool.

## Entry criteria

- multiple real repositories;
- repeated Profile patterns;
- repeated Golden Paths;
- adoption demand;
- stable local platform.

## Capabilities

- Repository Catalog;
- ownership;
- Profile inheritance;
- Golden Path Catalog;
- Software Templates;
- repository scorecards;
- documentation portal;
- cross-repo contracts;
- shared Standards;
- contribution model;
- notification channels;
- permissions;
- AS-05 Backstage/portal spike.

## Golden proof

Onboard two materially different repositories, apply shared Standards and Golden Paths without duplicating configuration, and deliver one Feature in each while preserving repository-specific bindings.

## Exit criteria

- platform does not become central bottleneck;
- Golden Paths are optional and useful;
- repository owners can contribute safely;
- inheritance is explainable;
- quality and adoption are measured;
- portal remains presentation, not authority.

## Non-goals

- enterprise marketplace;
- universal ontology;
- forced standardization;
- multi-tenant remote execution.

---

# 19. M12 — Remote Execution and Cloud Control Plane

## Status

```text
OPTION
```

## Outcome

MNFS can execute Workers remotely with strong isolation, shared control-plane state and multi-user governance while preserving the local domain semantics.

## Operator value

The platform can scale beyond one WSL2 machine and support teams, larger concurrency and untrusted workloads.

## Entry criteria

- local Software Factory proven;
- real scaling/security need;
- Environment Adapter stable;
- multi-user product requirements;
- cost model.

## Capabilities

- AS-04 Daytona/E2B comparison;
- remote Environment Adapter;
- Pi SDK/RPC host;
- PostgreSQL;
- object storage;
- outbox/queue;
- workload identity;
- E3/E4 isolation;
- users/teams/tenants;
- RBAC/capabilities;
- audit;
- remote logs/telemetry;
- quota and cost controls;
- cloud Recovery.

## Golden proof

Two remote Workers execute isolated Tracks, survive control-plane restart, integrate through the same Claim/Evidence/Gate semantics and cannot access each other’s filesystem, credentials or tenant state.

## Exit criteria

- local and remote semantics match;
- tenant isolation proven;
- queue delivery/reconcile proven;
- cost/quota visible;
- no local-only assumption leaks;
- disaster recovery tested;
- security boundary independently reviewed.

## Non-goals

- custom microVM platform;
- every cloud provider;
- uncontrolled autoscaling;
- full enterprise compliance at first release.

---

# 20. Architecture Spikes

## AS-01 — Pi Session Memory and Messaging

Timing:

```text
end of M3
```

Reason:

- Current Authority Snapshot and Context Packs must exist first.

## AS-02 — Local Pi Sandbox on WSL2

Timing:

```text
before unrestricted M2 Worker proof
```

Reason:

- M2 must not institutionalize unsafe execution.

## AS-03 — Observability Backend

Timing:

```text
M9
```

Reason:

- complete flow and stable telemetry semantics should exist first.

## AS-04 — Remote Environment

Timing:

```text
before M12 contract
```

Candidates:

- Daytona;
- E2B;
- remote VM provider.

## AS-05 — Multi-Repository Portal

Timing:

```text
before M11 detailed design
```

Candidates:

- Backstage integration;
- custom lightweight catalog;
- no portal.

---

# 21. Capability dependency graph

```text
M0 Foundation
        ↓
M1 Planning
        ↓
AB1 Architecture Baseline
        ↓
AS-02 Local Sandbox
        ↓
M2 Secure One Worker
        ↓
M3 Profile + Engineering System
        ↓
AS-01 Session Memory
        ↓
M4 Review + Correction
        ↓
M5 Parallel + Integration
        ↓
M6 Quality + Live QA
        ↓
M7 Credentials + Effects
        ↓
M8 Delivery + Closeout
        ↓
M9 Observability + Calibration
       ├───────────────┐
       ↓               ↓
M10 Web Console    M11 Multi-Repo Factory
       └───────────────┬───────────────┘
                       ↓
                  AS-04 Remote
                       ↓
                  M12 Cloud
```

M10 and M11 may reorder based on actual demand.

M12 depends on proven local semantics, not only UI completion.

---

# 22. Commitment horizons

## H0 — Accepted foundation

```text
M0
M1
```

## H1 — Trusted local Harness

```text
AB1
M2
M3
M4
```

The product becomes practically useful for one repository and one governed Writer/Reviewer loop.

## H2 — Complete local Software Factory

```text
M5
M6
M7
M8
M9
```

The product supports parallel execution, integration, live quality, external effects, delivery and empirical improvement.

## H3 — Platform expansion

```text
M10
M11
M12
```

UI, multi-repository scale and cloud execution are driven by evidence and users.

---

# 23. Release strategy

## 23.1 Internal versions

Milestones may map to versions later.

Do not promise SemVer mapping now.

## 23.2 Pre-1.0

The local product remains pre-1.0 until at least:

- M8 closes;
- end-to-end delivery works;
- Recovery and Security are proven;
- contracts have migration policy.

## 23.3 Candidate 1.0 definition

Possible 1.0 threshold:

```text
M0–M8 accepted
+
documentation complete
+
upgrade compatibility
+
one real repository usage period
+
critical drills passing
```

M9 may be included if observability/calibration is considered essential for product operability.

This remains a future Decision.

---

# 24. Milestone execution protocol

For every product milestone:

```text
1. Inspect current evidence
2. Run necessary Architecture Spike
3. Create Mission Plan
4. Review visually
5. Approve exact hash
6. Implement Milestone microdesigns
7. Prove on canonical environment
8. Update ADRs and docs
9. Close with Evidence Bundle
10. Reassess roadmap
```

Do not pre-write implementation microdesigns for distant milestones.

---

# 25. Entry and exit governance

## Entry Gate

A milestone starts only when:

- dependencies are accepted;
- critical Architecture Spikes are decided;
- required Repository/Environment exists;
- contract is satisfiable;
- acceptance proof is feasible;
- no critical contradiction exists.

## Exit Gate

A milestone closes only when:

- its own Acceptance Criteria pass;
- Golden proof is executed;
- fresh Evidence exists;
- Recovery/Security drills pass where applicable;
- docs and ADRs match implementation;
- non-goals remain excluded;
- next milestone assumptions are updated.

---

# 26. Roadmap change protocol

A roadmap change is a Product Decision.

It records:

- evidence;
- reason;
- affected milestones;
- work preserved;
- work invalidated;
- new dependency graph;
- priority;
- status changes.

## Allowed changes

- split milestone;
- merge milestone;
- reorder;
- defer;
- remove;
- add capability;
- replace tool;
- change Golden proof.

## Not allowed

- silently edit accepted history;
- start a downstream milestone without entry criteria;
- add a tool without a proof target;
- preserve milestone name while changing its outcome invisibly.

---

# 27. Tooling and adapter gates

A tool moves through:

```text
RESEARCHED
→ CANDIDATE
→ SPIKE
→ PILOT
→ ADOPTED
→ DEPRECATED
→ REMOVED
```

Each adopted tool has:

- consumer;
- adapter boundary;
- version;
- capability;
- evidence;
- Removal Conditions;
- replacement path.

---

# 28. Metrics by roadmap stage

## M2–M4

Focus:

- correctness;
- Recovery;
- false completion;
- intervention;
- latency;
- security violations.

## M5–M6

Add:

- integration conflict;
- parallel efficiency;
- Evidence coverage;
- QA defects;
- correction rounds.

## M7–M8

Add:

- Effect success/unknown;
- credential exposure;
- delivery stability;
- Closeout completeness.

## M9+

Add:

- experiments;
- Golden Path task success;
- adoption;
- DevEx;
- DORA where delivery is real;
- platform cost.

---

# 29. Current immediate sequence

```text
1. Finish Product Blueprint Section 12
2. Finish Section 13 Documentation Governance
3. Consolidate Product Blueprint
4. Create canonical GitHub documents
5. Create ADR-0004 through ADR-0011
6. Replace docs/roadmap.md
7. Create detailed capability-spec backlog
8. Supersede/reconcile MIS-002 revision 3
9. Run AS-02
10. Approve new MIS-002 revision
11. Start M2 implementation
```

---

# 30. Final recommendation

> Preserve M0 and M1 as accepted history.

> Keep M2 as the smallest end-to-end execution slice, but make it secure and reconcile its contract before implementation.

> Insert Repository Profile and Engineering System before generalizing arbitrary Worker tasks.

> Introduce independent review before parallelism.

> Introduce parallelism before the full adaptive quality system, so Integration becomes a real proof target.

> Add Credentials and External Effects only after local quality is complete.

> Prove Delivery before investing in observability-driven Calibration.

> Build the Web Console only after CLI and Domain contracts stabilize.

> Build multi-repository and cloud capabilities only after repeated local product demand.

> Treat roadmap horizons as confidence levels, not delivery dates.
