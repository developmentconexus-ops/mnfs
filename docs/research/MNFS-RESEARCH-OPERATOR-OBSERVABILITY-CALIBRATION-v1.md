---
id: DOC-RESEARCH-MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1
title: MNFS Research — Operator Experience, Observability and Calibration
document_type: research_report
form: explanation
authority: research_historical
status: published
source_manifest: MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.sources.json
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1
related:
  - DOC-PRODUCT-BLUEPRINT
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# MNFS Research — Operator Experience, Observability and Calibration

**Status:** Research conclusion proposed for Product Blueprint Section 11  
**Date:** 2026-08-02  
**Scope:** Local operator experience, mission control, agent observability, evaluation, policy calibration, developer-platform evolution

---

# 1. Executive conclusion

The MNFS needs four distinct user and data planes:

```text
1. Operator Control Plane
   Current authoritative state, Decisions, gates and next actions

2. Operational Projection
   Live processes, terminals, logs and transient execution state

3. Observability Plane
   Traces, spans, metrics, logs, tokens, latency and model/tool activity

4. Evaluation and Calibration Plane
   Datasets, experiments, scores, policy comparisons and improvement decisions
```

These planes may be shown in one future web application, but they must not share authority.

The proposed architecture is:

- **SQLite and Domain Events remain the control-plane source of truth.**
- **CLI remains the local canonical command surface and machine API.**
- **Lavish remains the structured plan and decision-review surface.**
- **Herdr remains an optional live terminal projection.**
- **A future MNFS Web Console becomes the integrated operator UI only after the underlying domain and APIs are stable.**
- **OpenTelemetry is adopted as the vendor-neutral telemetry interchange and naming baseline.**
- **MNFS uses its own stable `mnfs.*` semantic attributes and maps to evolving GenAI/OpenInference conventions.**
- **Phoenix and Langfuse are optional observability/evaluation backends, not domain dependencies.**
- **AS-03 compares the local-only baseline, Phoenix and Langfuse through OTLP before selecting a preferred default.**
- **Calibration uses datasets, experiments and explicit Calibration Decisions; it does not directly tune policy from raw production metrics.**
- **No single productivity score is created.** DORA, SPACE and MNFS-specific outcome metrics are used according to the decision being informed.
- **Raw prompts, outputs, code and secrets are not captured by default.** Telemetry uses IDs, hashes and Artifact references unless a scoped policy enables content.
- **M2 needs structured status, Domain Events, durations, logs and token counters where available, but no external dashboard or telemetry backend.**

---

# 2. Market patterns

## 2.1 Backstage — developer portal and software factory surface

Backstage demonstrates a mature split between:

- centralized software catalog;
- ownership and metadata stored with code;
- software templates;
- docs-like-code through TechDocs;
- plugin architecture;
- notifications;
- permissions.

Relevant patterns for MNFS:

- one searchable portal for repositories, capabilities and ownership;
- source-controlled metadata as the source of truth;
- templates with input, review, execution, progress, failure logs and result links;
- documentation published from repository sources;
- plugins as UI composition, not domain authority;
- notifications are for humans, not inter-process coordination;
- permission policy and enforcement are distinct.

Decision:

```text
ADOPT PATTERNS
DEFER BACKSTAGE DEPENDENCY
```

Backstage becomes relevant when MNFS manages many repositories, teams and Golden Paths.

It is not appropriate as the local M2 UI.

---

## 2.2 GitHub Copilot coding-agent sessions

GitHub’s agent dashboard and agent pages provide:

- cross-repository session list;
- running and historical sessions;
- session status;
- logs;
- token usage;
- session count and length;
- ability to inspect approach;
- ability to steer or stop work.

Relevant patterns:

- session list separate from repository UI;
- session detail with progress and logs;
- token visibility;
- background-agent control;
- multiple access surfaces, including CLI and IDE.

Decision:

```text
ADOPT UX REFERENCE
```

MNFS must improve on one limitation common to agent-session UIs:

```text
session status
≠ Feature/Mission state
```

The MNFS UI centers Mission and contract state, with Sessions and Worker Runs as children.

---

## 2.3 Herdr — operational terminal projection

Herdr provides:

- persistent workspaces, tabs and panes;
- detach/reattach;
- real terminal views;
- agent-state indicators;
- blocked, working, done and idle signals;
- notifications;
- socket/CLI control;
- agent-aware workspace rollups.

Relevant patterns:

- real terminal remains inspectable;
- operator can attach when necessary;
- workspace rollups surface attention;
- processes survive client detachment;
- UI differentiates done-unseen from idle-seen;
- socket API enables automation.

Risks:

- screen/process heuristics are not domain authority;
- terminal state can diverge from Claim or Feature state;
- visual “done” can create false completion.

Decision:

```text
OPTIONAL OPERATIONAL PROJECTION
```

Herdr does not replace the MNFS status model.

---

## 2.4 FirstMate — one liaison and crew visibility

FirstMate’s product framing is:

```text
talk to one agent
→ that agent supervises a visible crew
```

Relevant patterns:

- one liaison;
- autonomous workers;
- visible session backend;
- isolated worktrees;
- delivery artifacts;
- reduced tab juggling.

Decision:

```text
ADOPT OPERATOR-MODEL REFERENCE
```

MNFS adds:

- deterministic state;
- hierarchical contracts;
- Claim–Receipt–Verdict;
- Security and Recovery;
- Engineering System;
- Quality Posture.

---

## 2.5 OpenTelemetry — vendor-neutral telemetry

OpenTelemetry provides:

- traces;
- spans;
- metrics;
- logs;
- resources;
- semantic conventions;
- OTLP export;
- collector architecture.

GenAI semantic conventions include concepts such as:

- agent ID/name/version;
- conversation/session ID;
- workflow name;
- provider/model;
- tool execution;
- input/output/reasoning token usage;
- cache tokens.

The GenAI conventions are still evolving.

Decision:

```text
ADOPT OTEL AS INTERCHANGE
OWN STABLE MNFS SEMANTICS
```

MNFS cannot bind its domain schema directly to unstable GenAI fields.

Use stable internal attributes:

```text
mnfs.repository.id
mnfs.mission.id
mnfs.milestone.id
mnfs.feature.id
mnfs.write_track.id
mnfs.attempt.id
mnfs.worker_run.id
mnfs.claim.id
mnfs.role
mnfs.contract.hash
mnfs.policy.hash
mnfs.context_pack.hash
```

Map to OTel/OpenInference where meaningful.

---

## 2.6 Langfuse

Langfuse provides:

- traces;
- sessions;
- nested observations;
- prompt/model/tool details;
- token, latency and cost;
- manual and automated scores;
- code evaluators;
- LLM-as-a-Judge;
- annotation queues;
- datasets and experiments;
- dashboards;
- OTLP endpoint;
- self-hosted and cloud options.

Useful data-model patterns:

```text
Trace
Observation
Session
Score
Score Config
Dataset
Dataset Item
Dataset Run
Experiment
```

Important distinction:

```text
observing what happened
≠ evaluating whether it was good
```

Decision:

```text
CANDIDATE OBSERVABILITY/EVALUATION BACKEND
```

Do not adopt Langfuse prompt management as the MNFS source of Role Contracts or prompts.

---

## 2.7 Arize Phoenix

Phoenix provides:

- OpenTelemetry/OTLP trace collection;
- OpenInference instrumentation;
- traces for model calls, retrieval, tools and custom logic;
- human, code and LLM evaluations;
- datasets;
- experiments;
- local/self-hosted UI;
- session feedback and agent-trajectory support.

Relevant strengths:

- direct OTLP collector;
- local open-source use;
- strong trace inspection;
- dataset-to-experiment loop;
- evaluations attached to traces/spans;
- TypeScript support;
- current support for standard OTel GenAI traces.

Decision:

```text
CANDIDATE LOCAL OBSERVABILITY/EVALUATION BACKEND
```

Phoenix is a strong local AS-03 candidate.

---

# 3. Four-plane architecture

## 3.1 Operator Control Plane

Authority:

```text
MNFS Core + SQLite + Approved Artifacts
```

Shows:

- Mission status;
- criteria;
- Decisions;
- Claims;
- gates;
- Evidence;
- next actions;
- Recovery;
- External Effects.

Performs:

- commands;
- approvals;
- pauses;
- cancellation;
- repair actions.

## 3.2 Operational Projection

Sources:

- OS process observations;
- Pi lifecycle;
- Herdr;
- logs;
- terminal output;
- Treehouse.

Shows:

- Worker live/unknown/lost;
- foreground operation;
- current logs;
- terminals;
- process details.

Never directly closes domain entities.

## 3.3 Observability Plane

Sources:

- OTel instrumentation;
- Domain Event projection;
- Pi/model/tool adapters;
- verification runners;
- sandbox;
- external providers.

Stores or exports:

- traces;
- spans;
- metrics;
- logs;
- token/cost;
- errors;
- latency;
- context/memory events.

## 3.4 Evaluation and Calibration Plane

Sources:

- accepted Evidence;
- production/staging traces;
- Recovery drills;
- Security drills;
- Golden Missions;
- human annotations;
- user feedback;
- experiments.

Produces:

- Evaluation Results;
- experiment comparisons;
- Calibration Candidates;
- Calibration Decisions;
- dataset growth;
- policy recommendations.

---

# 4. Operator experience principles

## 4.1 One liaison

The Operator interacts with the Lead.

The UI should reinforce this rather than expose a chat with every Worker.

## 4.2 Mission-first

Primary navigation:

```text
Mission
→ Milestone
→ Feature
→ Write Track
→ Attempt / Worker Run
```

Not:

```text
terminal
→ session
→ model call
```

## 4.3 Attention-first

The top-level UI answers:

- What requires me?
- What is blocked?
- What changed?
- What can advance automatically?
- What is at risk?
- What finished with Evidence?

## 4.4 Evidence-first

Completion pages show:

- criteria;
- Verdicts;
- Evidence;
- risks;
- limitations.

Logs remain secondary.

## 4.5 Progressive disclosure

Default view is compact.

Details are available by:

- expanding;
- opening Artifact;
- inspecting trace;
- attaching terminal;
- reading exact evidence.

## 4.6 Next-action clarity

Every actionable state provides:

- recommended action;
- required authority;
- impact;
- command or UI action;
- alternative actions.

## 4.7 No false certainty

UI differentiates:

```text
UNKNOWN
BLOCKED
FAILED
STALE
DIVERGED
```

It never substitutes one generic red status.

---

# 5. Proposed operator surfaces

## 5.1 Home / Mission Control

Shows:

- active Missions;
- phase;
- attention;
- progress by criteria;
- active Workers;
- pending Decisions;
- Recovery alerts;
- Security alerts;
- recently closed Milestones;
- cost snapshot;
- next actions.

## 5.2 Mission Workspace

Contains:

- goal;
- contract hash;
- scope;
- Milestones;
- criteria matrix;
- dependency graph;
- Decisions;
- active Tracks;
- Quality Posture delta;
- Evidence;
- timeline.

## 5.3 Plan Review

Current implementation:

```text
structured plan
→ HTML
→ Lavish
```

Future UI may embed:

- hierarchical plan;
- DAG;
- comments;
- version diff;
- exact-hash approval;
- unresolved questions.

## 5.4 Decision Inbox

Groups Decision Requests by:

- Mission;
- urgency;
- required authority;
- age;
- blocked scope;
- risk.

Each Decision shows:

- question;
- context;
- options;
- recommendation;
- affected entities;
- default action.

## 5.5 Execution View

Shows:

- Write Tracks;
- Leases;
- Environments;
- Attempts;
- Worker Runs;
- liveness;
- Claims;
- logs refs;
- context pressure;
- tokens;
- duration;
- sandbox violations.

Herdr attach may be offered.

## 5.6 Quality and Evidence View

Shows:

- criteria;
- Claims;
- Receipts;
- Findings;
- Verdicts;
- Integration Runs;
- QA Journeys;
- staleness;
- Evidence Bundle;
- accepted risks.

## 5.7 Recovery Center

Shows:

- expected versus observed;
- divergence class;
- affected entities;
- recommended action;
- authority;
- dry-run repair;
- prior repair Events.

## 5.8 Engineering System View

Shows:

- Repository Profile;
- Engineering Standards;
- Golden Paths;
- bindings;
- Waivers;
- Quality Posture;
- candidate Standards;
- gardening tasks.

## 5.9 Calibration Lab

Shows:

- datasets;
- Golden Missions;
- experiments;
- models;
- policies;
- score distributions;
- regressions;
- cost/latency;
- sample coverage;
- proposed Calibration Decisions.

## 5.10 Audit View

Shows:

- Domain Events;
- Decisions;
- approvals;
- security violations;
- Effect Requests;
- versions;
- immutable Evidence refs.

---

# 6. Interface strategy

## 6.1 CLI

CLI remains:

- canonical local command surface;
- agent-facing API;
- scriptable interface;
- recovery interface;
- JSON contract.

Every future UI calls the same Application Services.

## 6.2 Lavish

Use for:

- visual plan review;
- structured Decision review;
- possible Evidence review.

Lavish feedback is input, not state.

## 6.3 Herdr

Use for:

- operational terminals;
- attach/reattach;
- live investigation;
- visual process awareness.

Herdr remains optional.

## 6.4 Future Web Console

Introduce only after:

- Domain Model is stable;
- CLI JSON contracts are stable;
- multiple surfaces require unified presentation;
- local Mission flow is proven.

Possible implementation:

```text
local API/server
+
web client
+
same Application Services
```

## 6.5 Future developer portal

When MNFS manages multiple repositories and teams:

- catalog;
- ownership;
- documentation;
- Golden Paths;
- software templates;
- Quality Posture.

Backstage can be:

- integration target;
- embedding host;
- reference architecture;
- optional enterprise frontend.

---

# 7. Status model

Do not reduce all state to one status.

Each aggregate exposes:

```text
lifecycle
phase
attention
health
progress
next_action
```

## 7.1 Lifecycle

Examples:

```text
OPEN
CLOSED
CANCELLED
```

## 7.2 Phase

Examples:

```text
PLANNING
EXECUTING
VERIFYING
CLOSING
```

## 7.3 Attention

```text
NONE
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
```

## 7.4 Health

```text
HEALTHY
DEGRADED
UNKNOWN
DIVERGED
```

## 7.5 Progress

Based on hierarchical criteria and work state.

Not on model-reported percentage.

---

# 8. Notification model

## 8.1 Notification versus message

Notification targets a human.

It is not inter-process coordination.

## 8.2 Notification triggers

- Decision required;
- approval required;
- Mission blocked;
- Security Violation material;
- Recovery required;
- Milestone closed;
- Mission closed;
- delivery result;
- budget threshold;
- external effect unknown.

## 8.3 Deduplication

Group by:

```text
target
attention class
root cause
```

## 8.4 Escalation

An unresolved notification may increase prominence.

It does not silently change Authority or Decision.

## 8.5 Channels

Initial:

- CLI status;
- Pi Lead update;
- terminal notification.

Future:

- web inbox;
- desktop/toast;
- email;
- Slack;
- Backstage notification.

---

# 9. Domain Events versus telemetry

## 9.1 Domain Event

Represents a durable business fact.

Examples:

```text
PLAN_APPROVED
LEASE_GRANTED
CLAIM_ACCEPTED
MISSION_CLOSED
```

Properties:

- persisted in SQLite;
- authority-bearing;
- auditable;
- stable schema.

## 9.2 Telemetry

Represents execution observation.

Examples:

```text
command duration
model call latency
tool error
token usage
sandbox denial
process CPU
```

Properties:

- high volume;
- retention-controlled;
- exportable;
- not Domain Authority.

## 9.3 Projection

A Domain Event may emit an OTel Event or span attribute.

Loss of telemetry export does not erase the Domain Event.

---

# 10. Trace architecture

## 10.1 Avoid one giant Mission trace

A Mission may last hours or days.

Do not hold one root span for its entire lifecycle.

## 10.2 Operation trace

Create a trace for a bounded operation:

- plan revision;
- worker run;
- verification run;
- review;
- integration;
- QA Journey;
- Effect execution;
- Recovery action.

## 10.3 Correlation attributes

Every relevant span carries:

```text
mnfs.repository.id
mnfs.mission.id
mnfs.milestone.id
mnfs.feature.id
mnfs.write_track.id
mnfs.attempt.id
mnfs.worker_run.id
mnfs.claim.id
mnfs.role
mnfs.contract.hash
mnfs.policy.hash
mnfs.context_pack.hash
```

## 10.4 Span hierarchy

Example:

```text
mnfs.worker.run
├── mnfs.context.load
├── gen_ai.invoke_agent
│   ├── gen_ai.chat
│   └── gen_ai.execute_tool
├── mnfs.command
├── mnfs.claim.open
└── mnfs.worker.complete
```

## 10.5 Span links

Use links when:

- a new trace continues an earlier Attempt;
- review follows a Worker Run;
- integration consumes multiple Tracks;
- Correction follows Findings.

## 10.6 Trace identity

Trace ID is telemetry identity.

It is not Mission ID.

---

# 11. Semantic conventions

## 11.1 Stable internal namespace

MNFS owns:

```text
mnfs.*
```

## 11.2 OTel mapping

Use standard attributes for:

- service;
- errors;
- Git/CI when applicable;
- HTTP/database;
- GenAI provider/model/token usage.

## 11.3 GenAI conventions

Because GenAI conventions are evolving:

- map when stable enough;
- preserve internal fields;
- version the mapper;
- do not migrate Domain State because a convention changes.

## 11.4 OpenInference

Phoenix and other AI tools may use OpenInference attributes.

Treat them as exporter/backend mappings.

Not canonical domain fields.

---

# 12. Telemetry privacy and security

## 12.1 Default capture

Capture by default:

- IDs;
- hashes;
- timestamps;
- durations;
- result classes;
- model/provider;
- token counters;
- tool/command IDs;
- Artifact refs;
- error types;
- versions.

## 12.2 Default exclusion

Do not capture raw:

- prompts;
- system instructions;
- model outputs;
- source code;
- diffs;
- secrets;
- customer data;
- credentials;
- full tool output.

## 12.3 Scoped content capture

May be enabled for:

- local spike;
- isolated test repository;
- explicit debugging;
- approved evaluation dataset.

Requires:

- policy;
- redaction;
- retention;
- access scope;
- user awareness.

## 12.4 Artifact references

Telemetry points to durable Artifacts when detail is needed.

## 12.5 Backend failure

Telemetry backend failure:

- creates degradation signal;
- does not block ordinary local execution unless a required audit criterion says otherwise;
- never causes secrets to be logged locally as fallback.

---

# 13. Signals

## 13.1 Traces

Use for causal execution flow.

## 13.2 Metrics

Use for aggregates and trends.

## 13.3 Logs

Use for detailed diagnostics.

## 13.4 Domain Events

Use for authoritative state history.

## 13.5 Evaluations

Use for quality judgments.

Do not encode all of these as logs.

---

# 14. Core telemetry

## 14.1 Mission and flow

- time in each phase;
- active versus waiting time;
- Decision wait;
- number of Replans;
- criteria completion;
- integration queue time;
- Closeout latency.

## 14.2 Worker

- start latency;
- duration;
- liveness;
- Attempt count;
- completion class;
- files changed;
- write-set violations;
- cancellation;
- Lost rate.

## 14.3 LLM

- provider;
- model;
- role;
- input/output/reasoning tokens;
- cache tokens;
- latency;
- errors;
- compactions;
- memory-worker cost;
- context-pack size.

## 14.4 Tools and commands

- tool ID;
- command binding;
- duration;
- exit/result;
- retry;
- timeout;
- affected criterion.

## 14.5 Quality

- criterion coverage;
- Receipt freshness;
- Findings;
- reject/accept;
- re-review rounds;
- QA outcomes;
- false completion detected.

## 14.6 Security and Recovery

- Security Violations;
- blocked egress;
- credential grant age;
- unknown Effects;
- divergence count;
- Recovery time;
- drill outcomes.

---

# 15. Evaluation architecture

## 15.1 Observation is not evaluation

A trace says what happened.

An Evaluation Result says how well it met a criterion or rubric.

## 15.2 Evaluation Result

```ts
interface EvaluationResult {
  id: string;

  target:
    | TraceRef
    | SpanRef
    | WorkerRunId
    | ClaimId
    | MissionId
    | ExperimentRunId;

  evaluator:
    | 'DETERMINISTIC'
    | 'HUMAN'
    | 'LLM_JUDGE'
    | 'USER_FEEDBACK';

  rubricId: string;
  rubricVersion: number;

  value:
    | number
    | boolean
    | string;

  valueType:
    | 'NUMERIC'
    | 'BOOLEAN'
    | 'CATEGORICAL'
    | 'TEXT';

  evidenceRefs: ArtifactRef[];
  modelBinding?: string;

  coverage:
    | 'COMPLETE'
    | 'PARTIAL'
    | 'UNKNOWN';

  createdAt: string;
}
```

## 15.3 Authority

Evaluation Result is not automatically a domain Verdict.

It may inform:

- Calibration;
- Quality Posture;
- investigation;
- policy candidate.

Domain gate uses only approved Evidence and Authority.

---

# 16. Evaluation datasets

## 16.1 Golden Missions

Curated scenarios representing:

- planning;
- coding;
- review;
- recovery;
- security;
- integration;
- QA;
- memory;
- external effects.

Each scenario defines:

- inputs;
- repository fixture;
- expected domain outcomes;
- prohibited outcomes;
- Evidence requirements.

## 16.2 Sources

- accepted real Missions;
- false-completion incidents;
- Findings;
- Recovery drills;
- Security drills;
- operator feedback;
- regression bugs;
- adapter failures.

## 16.3 Dataset governance

Every item has:

- ID;
- source;
- sensitivity;
- version;
- expected result;
- owner;
- status;
- retirement reason.

## 16.4 No blind production ingestion

Production trace does not enter a dataset automatically.

It becomes a Dataset Candidate and is:

- redacted;
- classified;
- reviewed;
- normalized.

---

# 17. Experiments

## 17.1 Experiment variables

Examples:

- model;
- provider;
- effort;
- prompt/Role Contract;
- Context Pack strategy;
- memory adapter;
- Golden Path;
- gate policy;
- sandbox;
- review strategy;
- concurrency.

## 17.2 Fixed inputs

Experiment uses the same dataset/scenarios.

## 17.3 Outputs

- quality scores;
- deterministic outcomes;
- cost;
- latency;
- retries;
- false-completion;
- human preference;
- coverage.

## 17.4 Reproducibility

Record:

- MNFS version;
- policy version;
- model/provider;
- package versions;
- repository fixture SHA;
- Environment Spec;
- random/replay settings when available.

## 17.5 Comparison

Do not declare winner from aggregate average only.

Segment by:

- Role;
- risk;
- task class;
- repository;
- context size;
- language;
- environment.

---

# 18. Online and offline loop

```text
live Mission
→ trace and Evidence
→ failure or useful edge case
→ Dataset Candidate
→ curated Dataset Item
→ offline Experiment
→ Calibration Decision
→ shadow/canary
→ wider policy
```

## 18.1 Offline

Use before policy/model change.

## 18.2 Online

Use for monitoring real executions.

## 18.3 Shadow mode

Candidate policy observes and produces hypothetical decisions without controlling execution.

## 18.4 Canary

Candidate policy controls a limited low-risk subset.

## 18.5 Rollback

Every policy change has previous version and rollback condition.

---

# 19. Calibration

## 19.1 Definition

Calibration changes how MNFS selects or configures:

- models;
- effort;
- Context budgets;
- memory;
- gates;
- reviewers;
- Golden Paths;
- timeouts;
- retries;
- parallelism;
- security Environments.

## 19.2 Calibration Candidate

Generated from:

- experiment;
- measured regression;
- repeated Finding;
- operator feedback;
- cost anomaly;
- reliability issue.

## 19.3 Calibration Decision

```ts
interface CalibrationDecision {
  id: string;
  targetPolicy: string;
  currentVersion: string;
  candidateVersion: string;

  evidenceRefs: ArtifactRef[];
  datasetRefs: string[];
  experimentRefs: string[];

  expectedBenefit: string;
  risks: string[];
  segments: string[];

  rollout:
    | 'SHADOW'
    | 'CANARY'
    | 'FULL';

  rollbackConditions: string[];
  requiredAuthority: ActorRole;

  result:
    | 'PROPOSED'
    | 'APPROVED'
    | 'REJECTED'
    | 'ROLLED_BACK';
}
```

## 19.4 No self-tuning initially

The MVP does not automatically rewrite policies from metrics.

Automation may later adjust bounded parameters only when:

- coverage is complete;
- confidence is sufficient;
- limits are explicit;
- rollback is automatic;
- risk is low.

---

# 20. Measurement framework

## 20.1 Why first

Every metric must answer:

```text
Which decision will this metric inform?
```

If no decision exists, do not collect it by default.

## 20.2 Multi-dimensional

Use several dimensions rather than one score.

### Outcome and Quality

- criteria satisfaction;
- false completion;
- escaped defects;
- reopened Features;
- accepted-risk incidence;
- user outcome.

### Flow and Reliability

- Mission lead time;
- active time;
- waiting time;
- Decision wait;
- Recovery time;
- divergence;
- delivery stability.

### Efficiency and Cost

- total tokens;
- model cost;
- tool time;
- memory-worker cost;
- correction cost;
- unused context;
- repeated reads.

### Operator and Developer Experience

- interruptions;
- Decisions requested;
- time to clarity;
- manual interventions;
- perceived trust;
- satisfaction;
- cognitive load.

### Engineering Health

- Quality Posture;
- Standard coverage;
- Waivers;
- Golden Path adoption;
- debt and gardening;
- documentation quality.

## 20.3 DORA

Use DORA delivery metrics when the system performs real delivery.

Do not misuse DORA metrics for individual Worker ranking.

## 20.4 SPACE

Use SPACE as a reminder that productivity includes:

- satisfaction and well-being;
- performance;
- activity;
- communication and collaboration;
- efficiency and flow.

Do not collapse it into commit volume.

---

# 21. Metrics to avoid as goals

Do not optimize directly for:

- lines of code;
- commits;
- tool calls;
- number of agents;
- number of parallel Tracks;
- smallest token count;
- longest Session;
- fastest completion without quality;
- number of Findings;
- number of gates;
- average model confidence;
- raw activity.

These may be diagnostic signals.

They are not success outcomes.

---

# 22. Attention and alerting

## 22.1 Attention classes

```text
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

## 22.2 Alert quality

Track:

- true action required;
- false positive;
- duplicate;
- ignored;
- time to acknowledge;
- time to resolve.

## 22.3 Noise control

- group by root cause;
- suppress repeated symptoms;
- retain audit trail;
- show one recommended next action;
- avoid notifying for ordinary autonomous progress.

---

# 23. Tool adoption matrix

| Tool/concept | Decision | MNFS role |
|---|---|---|
| CLI | Adopt | canonical local control surface |
| Lavish | Adopt | structured visual review |
| Herdr | Optional | operational terminal projection |
| FirstMate | Reference | one liaison/visible crew |
| GitHub agent dashboard | Reference | session-monitoring UX |
| Backstage | Defer/reference | future multi-repo developer portal |
| OpenTelemetry | Adopt | telemetry interchange |
| OTel Collector | Future optional | routing/export |
| Phoenix | Candidate | local trace/eval backend |
| Langfuse | Candidate | trace/eval backend |
| DORA | Adopt selectively | delivery/system outcomes |
| SPACE | Adopt as framework | multi-dimensional productivity |
| Custom MNFS Web Console | Future | integrated operator UI |

---

# 24. AS-03 — Observability and Calibration Backend Spike

## 24.1 Objective

Compare:

```text
A. Local SQLite/CLI baseline
B. OTel → Phoenix
C. OTel → Langfuse
```

## 24.2 Scenario

Instrument an end-to-end demo:

```text
Mission
→ Plan
→ Worker Run
→ model/tool calls
→ Claim
→ Verification
→ Recovery drill
→ Closeout
```

## 24.3 Acceptance criteria

1. every trace can be correlated to MNFS IDs;
2. Domain Events remain correct with backend disabled;
3. no raw secret/prompt/code is exported by default;
4. token, latency, error and tool data are visible;
5. cross-trace continuation can be queried;
6. evaluation can attach to trace/span/session;
7. datasets and experiments can compare candidates;
8. local self-host path is documented;
9. export failure does not corrupt execution;
10. overhead is measured;
11. retention and deletion are available;
12. disable and replacement paths are clear.

## 24.4 Comparison dimensions

- local setup;
- TypeScript integration;
- OTLP compatibility;
- trace UX;
- sessions;
- token/cost support;
- human annotation;
- code evaluators;
- LLM evaluators;
- datasets;
- experiments;
- API access;
- self-hosting;
- privacy;
- maintenance;
- upgrade stability.

## 24.5 Result

Choose:

- one preferred optional backend;
- or keep both supported through OTLP;
- or keep local-only until later.

No backend becomes required for M2.

---

# 25. M2 observability slice

M2 includes:

- Domain Events;
- structured CLI status;
- Worker Run timestamps;
- process result;
- log Artifact refs;
- Claim transition Events;
- token counters when Pi exposes them;
- duration;
- adapter errors;
- Recovery Report;
- `--json`.

M2 does not include:

- Web Console;
- OTel Collector;
- Phoenix;
- Langfuse;
- dashboards;
- datasets;
- experiments;
- automatic calibration;
- DORA reporting.

---

# 26. Roadmap impact

After M2:

- instrument Application Services;
- define `mnfs.*` semantic attributes;
- add optional OTLP exporter;
- run AS-03;
- create Golden Missions dataset;
- add experiment runner;
- add Calibration Decision lifecycle;
- build operator UI only after CLI/domain contracts stabilize.

Before multi-repository Software Factory:

- Catalog;
- ownership;
- repository status;
- Golden Path discovery;
- documentation portal;
- notifications;
- permissions.

At that point, Backstage integration becomes a serious option.

---

# 27. Proposed ADRs

## ADR-0009 — Operator control plane and presentation surfaces

- Mission-first;
- CLI canonical;
- Lavish structured review;
- Herdr optional;
- future Web Console uses Application Services;
- session UI does not define domain state.

## ADR-0010 — Telemetry model and OpenTelemetry export

- Domain Events separate from telemetry;
- OTel adopted as interchange;
- `mnfs.*` stable namespace;
- no raw content by default;
- exporters optional.

## ADR-0011 — Evaluation and calibration framework

- datasets and experiments;
- Evaluation Result separate from Verdict;
- no single productivity score;
- policy changes require Calibration Decision;
- shadow/canary/rollback.

---

# 28. Final recommendation

> Build the local operator experience around Mission state, attention, Evidence and next action.

> Keep CLI as the control API, Lavish as structured review and Herdr as optional terminal projection.

> Instrument the MNFS with OpenTelemetry-compatible traces, but retain stable internal semantics and Domain Events.

> Use Phoenix and Langfuse only as optional backends selected through AS-03.

> Build calibration from curated Golden Missions, experiments and explicit Decisions.

> Measure outcomes, flow, cost, operator experience and engineering health separately.

> Never optimize the Harness using one productivity score or raw activity metrics.
