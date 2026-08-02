---
id: DOC-RESEARCH-MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1
title: MNFS Research — Documentation Governance, Sources of Truth and Evolution
document_type: research_report
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1
related:
  - DOC-PRODUCT-BLUEPRINT
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# MNFS Research — Documentation Governance, Sources of Truth and Evolution

**Status:** Research conclusion proposed for Product Blueprint Section 13  
**Date:** 2026-08-02  
**Scope:** Documentation architecture, decision records, proposal lifecycle, ownership, drift prevention, agent read order and canonical publication

---

# 1. Executive conclusion

MNFS documentation must operate as a governed knowledge system, not a collection of Markdown files.

The proposed model combines:

```text
Docs as Code
+
Decision Log
+
Structured Proposal Process
+
Documentation Type Discipline
+
Ownership
+
Automated Drift Checks
+
Supersession Instead of Silent Rewriting
+
Progressive Disclosure for Humans and Agents
```

The key architectural decisions are:

1. **Git is the canonical store for product doctrine, decisions, specifications and repository-owned evidence.**
2. **SQLite is the canonical store for current operational state, not product doctrine.**
3. **`.mnfs/` stores repository-owned machine-readable identity, approved Mission contracts, promoted evidence and closeouts.**
4. **Issues, PR discussions, chats, transcripts and observational memory are not sources of truth until their outcomes are promoted into canonical documents or structured state.**
5. **Each concept has exactly one owning document. Other documents link, summarize or explain without redefining it.**
6. **Accepted ADRs and approved Mission revisions are not semantically rewritten. Changes are made through superseding records or new revisions.**
7. **The Product Blueprint is a living constitutional document with explicit versions, change classes and a changelog.**
8. **The large Blueprint should be maintained as modular source sections and published as a generated aggregate.**
9. **Non-trivial capabilities use KEP/RFC-like specifications with goals, non-goals, risks, tests, graduation, upgrade/rollback and implementation history.**
10. **Diátaxis guides the reader-oriented form—tutorial, how-to, reference or explanation—but authority class remains separate.**
11. **Every canonical document has machine-readable metadata: identity, type, status, authority, owners, version, relations and review triggers.**
12. **Documentation changes are reviewed through Git and protected by CODEOWNERS and CI checks.**
13. **Documentation freshness is primarily event-triggered, not based on arbitrary calendar refreshes.**
14. **A PR or Claim must declare documentation impact.**
15. **The root entrypoints remain short: README for humans, AGENTS.md for agents, and `docs/DOCUMENTATION-MAP.md` for discovery.**

---

# 2. Market and repository evidence

## 2.1 Diátaxis

Diátaxis separates documentation into four reader needs:

```text
Tutorial
How-to Guide
Reference
Explanation
```

Relevant conclusions:

- tutorials are learning-oriented;
- how-to guides are task-oriented;
- reference describes machinery accurately;
- explanation builds understanding and context;
- mixing forms reduces clarity;
- the framework is intentionally lightweight and implementation-agnostic.

### MNFS decision

Use Diátaxis to classify reader intent.

Do not use it as the authority hierarchy.

Examples:

```text
Product Blueprint
→ explanation + constitutional authority

CLI reference
→ reference + descriptive authority

“Run M2 locally”
→ how-to + guidance authority

“Learn the MNFS lifecycle”
→ tutorial + guidance authority
```

Authority and documentation form are orthogonal metadata.

---

## 2.2 Architecture Decision Records

The ADR community defines an ADR as a record of one architecturally significant decision, including rationale, alternatives, trade-offs and consequences. A collection of ADRs forms a decision log.

MADR provides:

- standard Markdown templates;
- minimal and full forms;
- numbered files;
- status;
- considered options;
- decision outcome;
- consequences;
- tooling and linting patterns.

### MNFS decision

Use a MADR-inspired template adapted to MNFS.

An accepted ADR is historical evidence of a decision at a point in time.

Do not rewrite its semantic outcome.

Use:

```text
new ADR
→ supersedes old ADR
```

for changed decisions.

Editorial corrections may occur only when they do not change meaning.

---

## 2.3 Kubernetes Enhancement Proposals

Kubernetes uses KEPs for most non-trivial changes.

The process emphasizes:

- common template;
- tracking issue;
- approvers and reviewers;
- goals and non-goals;
- design;
- test plan;
- graduation criteria;
- upgrade/downgrade;
- version skew;
- production readiness;
- monitoring;
- implementation history;
- presubmit checks for metadata and Markdown.

### MNFS decision

Capability Specifications should use a KEP-like structure.

The GitHub issue tracks work.

The specification owns the proposal.

The implementation PRs reference the specification.

The spec remains as historical design context after implementation.

---

## 2.4 Python PEP lifecycle

Python PEPs distinguish states such as:

```text
Draft
Accepted / Active
Deferred
Final
Provisional
Rejected
Superseded
Withdrawn
```

Rejected and superseded proposals remain discoverable rather than being deleted.

### MNFS decision

Canonical proposal/decision documents remain in history with explicit status.

Deletion is reserved for:

- accidental duplicates;
- generated artifacts;
- content that never became canonical and has no historical value.

---

## 2.5 Docs like code and Backstage TechDocs

Backstage TechDocs uses a docs-like-code model:

- Markdown lives with code;
- Git is source;
- CI can generate static sites;
- publication is a projection;
- documentation is discoverable through a catalog;
- generated sites can be read-only;
- HTML is sanitized.

### MNFS decision

Keep source Markdown and structured metadata in the repository.

Any future rendered site or portal is a projection.

Do not edit generated output.

The future Software Factory may publish documentation through TechDocs or another static pipeline, but the repository remains canonical.

---

## 2.6 CODEOWNERS

GitHub CODEOWNERS can:

- assign owners to paths;
- automatically request review;
- integrate with required review rules;
- protect documentation and the CODEOWNERS file itself.

### MNFS decision

Use CODEOWNERS for:

- Product Blueprint;
- ADRs;
- Security policy;
- Standards;
- Golden Paths;
- Mission contract schemas;
- documentation governance.

In the current single-owner phase, ownership may point to the repository owner.

The mechanism should already reflect future team ownership.

---

## 2.7 RFC processes

RFC systems such as Rust/npm and KEP/PEP processes provide:

- a reviewable proposal;
- public discussion;
- rough consensus or approvers;
- accepted/rejected status;
- preserved history;
- linkage between proposal and implementation.

### MNFS decision

Use a capability-spec process instead of turning every architecture discussion into an ADR.

```text
ADR
→ one durable decision

Capability Spec
→ complete proposed capability and proof

Mission Contract
→ scoped implementation commitment
```

---

# 3. Problems to prevent

## D01 — Duplicate authority

Two docs define the same lifecycle differently.

## D02 — Silent rewrite

An accepted decision changes without a superseding record.

## D03 — Stale tracking as doctrine

A status file is treated as architecture.

## D04 — Issue-comment decision

A GitHub comment is treated as accepted product policy.

## D05 — Transcript dependency

A future agent must read chat history to understand the product.

## D06 — Generated-source confusion

Rendered HTML is edited instead of its structured source.

## D07 — Missing ownership

No one is responsible for a critical document.

## D08 — Documentation theater

A document exists but has no update trigger or consumer.

## D09 — Monolithic agent entrypoint

AGENTS.md contains the entire doctrine and bloats every Session.

## D10 — Reference/explanation confusion

Reference material contains opinions and narratives while explanation is mistaken for exact API truth.

## D11 — Accepted-history deletion

Rejected, superseded or failed designs disappear, causing repeated mistakes.

## D12 — Documentation drift

Code, contract, schema or policy changes while docs remain green.

## D13 — Checklist-only governance

A PR checks “docs updated” without naming the affected source.

## D14 — Research becomes policy

A research report is treated as an adopted decision.

## D15 — Runtime becomes doctrine

SQLite observations are interpreted as product architecture.

---

# 4. Documentation authority model

The proposed authority classes are:

```text
A0 — Constitutional
A1 — Decision
A2 — Specification
A3 — Contract
A4 — Standard / Policy
A5 — Reference
A6 — Guidance
A7 — Evidence
A8 — Tracking
A9 — Research / Historical
A10 — Generated Projection
```

## A0 — Constitutional

Examples:

- Product Blueprint;
- Documentation Governance.

Owns:

- product definition;
- constitutional principles;
- canonical domain vocabulary;
- authority hierarchy;
- non-goals.

## A1 — Decision

Examples:

- ADRs;
- Calibration Decisions.

Owns:

- one accepted choice;
- rationale;
- alternatives;
- consequences;
- supersession.

## A2 — Specification

Examples:

- capability spec;
- architecture spike plan;
- schema spec.

Owns:

- detailed intended capability;
- requirements;
- design;
- tests;
- rollout;
- graduation.

## A3 — Contract

Examples:

- Approved Mission Plan;
- accepted API contract;
- Evidence Bundle contract.

Owns:

- scoped commitments;
- exact approved content;
- execution criteria.

## A4 — Standard / Policy

Examples:

- Engineering Standards;
- Golden Paths;
- Security Policy;
- Repository Profile bindings.

Owns:

- applicable rules;
- recommended path;
- enforcement;
- exceptions.

## A5 — Reference

Examples:

- CLI reference;
- schemas;
- commands;
- state machines;
- tool compatibility matrix.

Owns:

- exact description of current machinery.

## A6 — Guidance

Examples:

- tutorials;
- how-to guides;
- contributor guide;
- runbooks.

Owns:

- instructions for users.

Does not override higher authority.

## A7 — Evidence

Examples:

- accepted test report;
- research measurement;
- closeout bundle;
- drill report.

Owns:

- what was observed under named conditions.

## A8 — Tracking

Examples:

- STATUS.md;
- issue;
- checklist;
- progress board.

Owns:

- current work coordination.

Does not own architecture.

## A9 — Research / Historical

Examples:

- market study;
- legacy map;
- rejected concept;
- old contract.

Owns:

- source analysis;
- historical record.

Does not become normative until promoted.

## A10 — Generated Projection

Examples:

- review.html;
- aggregate Blueprint;
- static docs site;
- generated API docs.

Owns nothing independently.

It is regenerated from sources.

---

# 5. Authority precedence

When content conflicts:

```text
1. Current accepted ADR specific to the decision
2. Current Product Blueprint constitutional rule
3. Current accepted Capability Specification
4. Current Approved Contract for the scoped execution
5. Current Engineering Standard / Policy / Repository Profile
6. Current Reference generated from implementation
7. Guidance
8. Tracking
9. Research / historical material
10. Generated projections follow their source
```

This ordering is not a license for contradictions.

A conflict creates:

```text
DOCUMENTATION_DIVERGENCE
```

and blocks dependent work when material.

---

# 6. One owner per concept

Every durable concept has one canonical owner.

Examples:

| Concept | Owning source |
|---|---|
| Product promise | Product Blueprint |
| Mission hierarchy | Product Blueprint / Domain Model |
| Exact architectural choice | ADR |
| Capability design | Capability Spec |
| Product sequencing | Roadmap |
| Scoped implementation commitment | Approved Mission Contract |
| Current execution state | SQLite |
| Repository commands | Repository Profile |
| Engineering rule | Engineering Standard |
| Preferred implementation path | Golden Path |
| CLI current syntax | CLI reference/generated help |
| Current work progress | Tracking |
| Observed proof | Evidence Artifact |
| Historical comparison | Research Report |

Other docs may summarize and link.

They must not redefine.

---

# 7. Proposed repository layout

```text
README.md
AGENTS.md
CONTRIBUTING.md
CHANGELOG.md

.github/
├── CODEOWNERS
├── pull_request_template.md
└── workflows/
    └── docs.yml

docs/
├── DOCUMENTATION-MAP.md
├── roadmap.md
│
├── product/
│   ├── README.md
│   ├── blueprint/
│   │   ├── 01-product-vision.md
│   │   ├── 02-domain-model.md
│   │   ├── 03-lifecycle-flows.md
│   │   ├── 04-engineering-system.md
│   │   ├── 05-system-architecture.md
│   │   ├── 06-roles-authority.md
│   │   ├── 07-quality-evidence.md
│   │   ├── 08-state-recovery.md
│   │   ├── 09-context-memory.md
│   │   ├── 10-security-isolation.md
│   │   ├── 11-operator-observability.md
│   │   ├── 12-capability-roadmap.md
│   │   └── 13-documentation-governance.md
│   └── PRODUCT-BLUEPRINT.md
│
├── adr/
│   ├── README.md
│   ├── template.md
│   └── 0001-*.md
│
├── capabilities/
│   ├── README.md
│   ├── template.md
│   └── CAP-*/
│       ├── SPEC.md
│       ├── TEST-PLAN.md
│       └── IMPLEMENTATION-HISTORY.md
│
├── standards/
│   ├── README.md
│   └── <DOMAIN>-<NUMBER>-*.md
│
├── golden-paths/
│   ├── README.md
│   └── GP-*/
│       ├── PATH.md
│       ├── templates/
│       └── examples/
│
├── repository-profile/
│   ├── PROFILE.md
│   └── *.json
│
├── reference/
├── how-to/
├── tutorials/
├── explanation/
│
├── research/
├── design/
├── tracking/
│   └── archive/
└── history/

.mnfs/
├── repo.json
├── missions/
│   └── MIS-*/
│       ├── plan.json
│       ├── accepted-evidence/
│       └── closeout.json
└── accepted-evidence/
```

Not every directory must be created immediately.

Directories are added when their first canonical consumer exists.

---

# 8. Modular Product Blueprint

The complete Blueprint is already large.

Maintaining one 400k+ character file as the only source increases:

- merge conflicts;
- navigation cost;
- agent context load;
- ownership ambiguity;
- accidental broad edits.

Decision:

```text
canonical editable source
→ 13 modular section files

generated publication
→ PRODUCT-BLUEPRINT.md
```

Rules:

- section files are canonical;
- aggregate is generated;
- aggregate contains generated header;
- CI verifies aggregate freshness;
- version belongs to Blueprint index/manifest;
- section IDs and headings are stable;
- cross-section links use stable anchors or section IDs;
- a future static site may render the same sources.

The current consolidated artifact becomes the seed for the modular source.

---

# 9. Document metadata

Canonical Markdown documents use YAML frontmatter where practical.

Example:

```yaml
---
id: DOC-PRODUCT-BLUEPRINT-01
title: Product Vision
document_type: product_blueprint_section
form: explanation
authority: constitutional
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - product promise
  - constitutional principles
supersedes: []
superseded_by: null
related:
  - ADR-0001
review_triggers:
  - product promise changes
  - authority model changes
last_reviewed: 2026-08-02
---
```

## Required fields

Depending on document class:

```text
id
title
document_type
authority
status
owners
version or revision
source_of_truth_for
related
```

## Optional fields

```text
form
approvers
implementation_status
supersedes
superseded_by
review_triggers
last_reviewed
generated_from
tracking_issue
canonical_environment
```

## Rules

- IDs are globally unique within the repository documentation graph;
- relation targets must exist;
- generated documents identify their source;
- accepted normative docs must have owners;
- research docs declare non-normative status;
- tracking docs declare that they do not own architecture.

---

# 10. Status model

Status is constrained by document class.

## ADR

```text
PROPOSED
ACCEPTED
REJECTED
SUPERSEDED
DEPRECATED
```

## Capability Spec

```text
DRAFT
PROPOSED
ACCEPTED
IMPLEMENTING
IMPLEMENTED
DEFERRED
SUPERSEDED
WITHDRAWN
```

## Product Blueprint

```text
DRAFT
PROPOSED
ACCEPTED
SUPERSEDED
```

The current Blueprint remains active through version updates.

## Standard

```text
CANDIDATE
PILOT
RATIFIED
ENFORCED
DEPRECATED
SUPERSEDED
```

## Golden Path

```text
DRAFT
PILOT
ACTIVE
DEPRECATED
RETIRED
```

## Research

```text
DRAFT
PUBLISHED
SUPERSEDED
HISTORICAL
```

## Tracking

```text
CURRENT
COMPLETED
ARCHIVED
```

## Generated

```text
GENERATED
```

Implementation status is separate from proposal status when needed.

---

# 11. ADR process

## 11.1 When required

Create an ADR when a decision:

- changes an architectural boundary;
- selects or removes a material tool;
- changes source-of-truth rules;
- changes security or data policy;
- changes persistence;
- changes execution topology;
- changes API/contract strategy;
- has significant alternatives or consequences;
- should survive the current Mission.

## 11.2 Not required

Do not create an ADR for:

- local variable names;
- routine refactors;
- implementation detail fully governed by an accepted spec;
- reversible low-impact choice;
- progress update;
- research finding without decision.

## 11.3 Template

```text
Title
Status
Context and Problem Statement
Decision Drivers
Considered Options
Decision Outcome
Positive Consequences
Negative Consequences
Risks
Validation
Supersedes / Superseded By
Related Documents
```

## 11.4 Accepted ADR immutability

Allowed:

- typo correction;
- link repair;
- metadata clarification;
- explicit superseded link.

Not allowed:

- changing chosen option;
- rewriting rationale to match hindsight;
- deleting consequences;
- removing rejected alternatives.

Semantic change requires a new ADR.

---

# 12. Blueprint evolution

The Product Blueprint is living, but governed.

## 12.1 Change classes

### B0 — Editorial

- spelling;
- formatting;
- link;
- no semantic change.

Review:

- normal docs review.

Version:

- no bump or patch, according to release process.

### B1 — Clarification

- makes an existing decision clearer;
- does not change observable behavior or authority.

Review:

- owner;
- affected ADR consistency check.

Version:

- patch.

### B2 — Material extension

- adds a capability or rule consistent with the constitution;
- changes dependent specs or roadmap.

Review:

- architecture issue;
- ADR when a decision is involved;
- Operator approval.

Version:

- minor.

### B3 — Constitutional change

- changes product promise;
- changes authority hierarchy;
- changes source of truth;
- removes a constitutional invariant;
- changes fundamental domain identity.

Review:

- explicit architecture proposal;
- adversarial review;
- Operator approval;
- migration/reconciliation plan.

Version:

- major.

## 12.2 Blueprint changelog

Every B1–B3 update records:

- version;
- date;
- summary;
- changed sections;
- ADRs;
- affected specs/contracts;
- migration.

## 12.3 Accepted snapshots

Git history remains authoritative history.

For major accepted baselines, create:

- release/tag;
- generated aggregate artifact;
- change log entry.

No need to duplicate every version in a permanent directory unless a consumer requires it.

---

# 13. Capability Specification process

Use a KEP-like process for non-trivial capabilities.

## Required sections

```text
Metadata
Summary
Motivation
Goals
Non-goals
User/Operator Stories
Domain Changes
Architecture
Security and Privacy
State and Recovery
Interfaces
Observability
Test Plan
Golden Proof
Graduation Criteria
Upgrade/Downgrade
Rollout/Rollback
Dependencies
Risks and Mitigations
Alternatives
Implementation History
Open Questions
```

## Lifecycle

```text
DRAFT
→ PROPOSED
→ ACCEPTED
→ IMPLEMENTING
→ IMPLEMENTED
```

Alternative endings:

```text
DEFERRED
WITHDRAWN
SUPERSEDED
```

## Relationship to Mission

Capability Spec:

- owns reusable product design.

Mission Contract:

- owns the scoped implementation commitment.

A Mission may implement part of a Capability Spec.

The Mission must link to the accepted spec version.

---

# 14. Mission Contract governance

Approved Plan Revisions are immutable.

Rules:

- Drafts live in SQLite/runtime artifacts;
- approved revision is materialized under `.mnfs/missions`;
- new material change creates new revision;
- old revision remains accessible;
- active Attempts bind to exact content hash;
- Replan reconciles active work;
- no manual edit of approved `plan.json`;
- CI validates schema;
- hierarchical IDs are required;
- Mission/Milestone/Feature criteria are required.

The current MIS-002 revision 3 remains historical and is superseded by a newly approved revision.

---

# 15. Standards and Golden Paths

## Engineering Standard

Owns:

- statement;
- level;
- applicability;
- rationale;
- enforcement;
- exceptions;
- Evidence;
- lifecycle.

## Golden Path

Owns:

- task class;
- preferred sequence;
- templates;
- checks;
- Evidence expectations;
- Safety Nets;
- deviations.

Rules:

- independently versioned;
- Profile binds versions;
- Mission records effective versions;
- accepted work remains interpretable after later updates;
- a Standard is not redefined inside a Golden Path;
- a Golden Path references Standards.

---

# 16. Repository Profile

The Repository Profile owns repository-specific bindings:

- commands;
- modules;
- contracts;
- environments;
- resources;
- external systems;
- ratified assumptions;
- Profile-specific Golden Paths and Standards.

It does not own:

- universal MNFS constitution;
- current Mission state;
- temporary runtime output;
- generic tool documentation.

A Profile update that changes active execution semantics invalidates affected Context Packs.

---

# 17. Research reports

Research is evidence, not authority.

A report must state:

- question;
- scope;
- date;
- sources;
- findings;
- uncertainties;
- recommendation;
- limitations;
- adoption decision status.

Lifecycle:

```text
DRAFT
PUBLISHED
SUPERSEDED
HISTORICAL
```

A new report supersedes old conclusions.

The original report remains available.

A recommendation becomes normative only through:

- ADR;
- Blueprint update;
- Capability Spec;
- Standard;
- Roadmap Decision.

---

# 18. Tracking documents and issues

Tracking owns current coordination.

Examples:

- GitHub issue;
- STATUS.md;
- checklist;
- project board;
- implementation history.

Rules:

- tracking may be rewritten;
- Git preserves history;
- architecture is never sourced solely from tracking;
- completed tracking is archived or closed;
- issue discussions must link to promoted outcomes;
- closing an issue does not itself approve architecture;
- a PR is a change vehicle, not the final authority.

Issue #6 is the architecture work container.

The canonical result will live in the Product Blueprint, supporting docs, ADRs and roadmap.

---

# 19. `.mnfs/`, `docs/` and SQLite

## `docs/`

Human-readable product knowledge:

- constitution;
- decisions;
- specifications;
- Standards;
- Golden Paths;
- research;
- guidance;
- reference;
- tracking.

## `.mnfs/`

Repository-owned machine-readable MNFS artifacts:

- Repository ID;
- approved Mission contracts;
- promoted accepted evidence;
- closeouts;
- future machine manifests.

It is not the home for general prose doctrine.

## SQLite

Operational state:

- active entities;
- revisions;
- Attempts;
- Worker Runs;
- Claims;
- Receipts;
- Findings;
- Decisions;
- Events;
- artifact refs.

It is not product documentation.

## Runtime artifact store

Generated and temporary:

- logs;
- prompts;
- review HTML;
- traces;
- screenshots;
- outputs;
- temporary evidence.

Artifacts are promoted when they become accepted evidence or durable documentation.

---

# 20. Generated documentation

Generated documents must declare:

```text
GENERATED — DO NOT EDIT
source
generator version
source hash
generated at
```

Examples:

- full Product Blueprint aggregate;
- review HTML;
- CLI reference;
- schema reference;
- static site;
- diagrams generated from structured source.

CI verifies generated output matches source.

A generated artifact never outranks its source.

---

# 21. Required entrypoints

## README.md

For humans.

Must remain concise:

- what MNFS is;
- current maturity;
- canonical environment;
- quick start;
- documentation links;
- current roadmap state;
- project status.

README does not contain the full architecture.

## AGENTS.md

For agents.

Must remain short:

- first commands;
- hard safety rules;
- source-of-truth links;
- required verification;
- documentation impact rule;
- prohibited shortcuts.

AGENTS.md is an index and bootstrap contract.

It is not the Product Blueprint.

## docs/DOCUMENTATION-MAP.md

For humans and agents.

Contains:

- authority hierarchy;
- document catalog;
- source-of-truth matrix;
- read paths;
- current versions;
- superseded docs;
- ownership;
- generated artifacts;
- update protocol.

---

# 22. Read order

## New human reader

```text
README
→ Documentation Map
→ Product Blueprint overview
→ Roadmap
→ relevant Capability Spec
→ relevant ADRs
```

## Architecture contributor

```text
Documentation Map
→ Product Blueprint
→ ADR log
→ Capability Specs
→ Research
→ current architecture issue
```

## MNFS Lead

```text
AGENTS.md
→ mnfs status / Current Authority Snapshot
→ Approved Mission Contract
→ Context/Handoff Pack
→ relevant Capability Spec
→ relevant ADRs
```

## Writer Worker

```text
Current Authority Snapshot
→ Writer Pack
→ exact contracts/code refs
```

No full Blueprint by default.

## Reviewer

```text
Review Pack
→ fixed diff/SHA
→ criteria
→ Standards
→ relevant ADRs/specs
```

No Writer transcript or OM.

## QA Actor

```text
QA Pack
→ Journey
→ environment
→ expected observations
```

---

# 23. Documentation Impact declaration

Every PR and Claim with repository change declares:

```text
documentation_impact:
  status: NONE | UPDATED | FOLLOW_UP_REQUIRED
  affected:
    - ...
  rationale: ...
  follow_up: ...
```

## NONE

Requires explanation.

## UPDATED

Names canonical documents changed.

## FOLLOW_UP_REQUIRED

Allowed only when:

- docs cannot be safely completed in the same change;
- follow-up issue exists;
- no unsafe contradiction is introduced;
- owner and deadline/trigger are named.

A vague “no docs needed” is invalid for material change.

---

# 24. Change-impact rules

Examples:

| Changed area | Documentation impact check |
|---|---|
| Domain entities/FSM | Blueprint, capability spec, ADR, reference |
| CLI | CLI reference, how-to, AGENTS if bootstrap changed |
| SQLite schema | capability spec, migration reference, Recovery |
| Pi adapter | capability spec, tooling/adoption record |
| Security policy | ADR, threat model, Profile, how-to |
| Standard | Standard, Golden Paths, Profile bindings |
| Golden Path | path version, templates, examples |
| API/schema | contract/reference, consumers, migration |
| Environment | Profile, setup/how-to, security review |
| External tool version | research/adoption record, notices, doctor |
| Mission scope | new Plan Revision, not Blueprint by default |
| Roadmap outcome/order | Roadmap Decision, dependencies |
| Operator UI | capability spec, reference, accessibility proof |

These rules begin as review guidance.

Reliable subsets can become CI checks.

---

# 25. Documentation CI

Initial checks:

```text
markdown lint
link validation
frontmatter schema
unique document IDs
relation targets exist
status allowed for document type
owner required
supersedes/superseded-by consistency
ADR numbering and index
Blueprint aggregate freshness
Documentation Map coverage
Mission contract schema
hierarchical ID validation
generated-file header
no direct edit of generated files
no unresolved placeholder in accepted normative docs
documentation-impact declaration
```

Future checks:

- changed-code to docs-impact policy;
- generated CLI reference;
- stale Profile bindings;
- standard references;
- broken Artifact refs;
- diagrams;
- spell/style checks.

CI detects structural drift.

It cannot prove semantic accuracy alone.

---

# 26. Documentation review

## Owners

Each path has owner(s).

## Required review

Material changes to:

- Blueprint;
- ADR;
- Security;
- Standards;
- Golden Paths;
- schema;
- docs governance;

require owner review.

## Adversarial review

Use for:

- B3 Blueprint change;
- source-of-truth change;
- security/credential policy;
- persistence;
- authority;
- removal of invariant.

## Operator approval

Required for:

- Product Blueprint B2/B3;
- accepted ADRs with D3–D5 consequence;
- roadmap commitment change;
- Mission contract approval;
- accepted risk;
- documentation governance major change.

---

# 27. Freshness policy

Documentation freshness is primarily triggered by change.

## Change-triggered review

Examples:

- code changes API;
- adapter upgraded;
- Standard changes;
- incident reveals gap;
- Mission finds contradiction;
- Product Milestone closes.

## Time-triggered review

Use only when the subject can become stale without repository change:

- external tool compatibility;
- security assumptions;
- credentials/provider docs;
- support matrix;
- external links;
- operational runbook.

## Research

Research reports are not periodically rewritten.

Create a new report or superseding addendum.

## Staleness states

```text
CURRENT
REVIEW_REQUIRED
STALE
SUPERSEDED
UNKNOWN
```

Stale normative docs can block dependent work.

Stale tutorials usually create documentation debt rather than blocking core execution.

---

# 28. Documentation debt

Documentation debt is explicit work.

Sources:

- docs-impact follow-up;
- broken link;
- stale reference;
- unowned document;
- contradictory source;
- missing how-to;
- outdated screenshot;
- missing implementation history.

Represent as:

- Finding;
- issue;
- gardening task;
- Standard candidate.

Do not hide durable debt in untracked TODO comments.

---

# 29. Supersession and archive

## Supersede in place

For ADRs/specs/research:

- keep original path;
- set status;
- add banner;
- link successor.

Moving files may break historical links.

## Archive tracking

Completed tracking can move to:

```text
docs/tracking/archive/
```

with links preserved where practical.

## Delete only when

- generated;
- accidental;
- duplicate with no unique history;
- secret or legally required removal.

Git history alone is not used as an excuse to keep secret-bearing content visible.

---

# 30. Documentation versioning

## Product Blueprint

Semantic version:

```text
MAJOR — constitutional change
MINOR — material compatible extension
PATCH — clarification/editorial correction
```

## ADR

Immutable record with its own ID.

No SemVer required.

## Capability Spec

Revision or version.

Implementation binds to accepted version/hash.

## Standards and Golden Paths

Individually versioned.

## Repository Profile

Versioned with Git and optional schema version.

## Mission Contract

Content hash + revision.

## Generated references

Bound to implementation SHA and generator version.

---

# 31. Documentation change protocol

```text
detect need
→ classify document owner and change class
→ open issue/proposal if material
→ update source document
→ update relations and dependents
→ run docs CI
→ owner review
→ Operator approval when required
→ merge
→ regenerate projections
→ invalidate affected Context Packs
→ reconcile active Missions
```

If a documentation change reveals implementation conflict:

```text
Documentation Divergence
→ Finding / Decision / Replan
```

Do not simply edit docs to match accidental implementation.

---

# 32. Documentation and Context Packs

Context Pack Compiler reads canonical docs through the Documentation Map.

It does not crawl all Markdown indiscriminately.

Inputs are selected by:

- document authority;
- target;
- relationship;
- version;
- status;
- Repository Profile;
- Role.

Superseded/rejected/historical docs are excluded from ordinary execution context unless explicitly requested for research.

---

# 33. Documentation security

- no secrets in docs;
- sensitive incidents use restricted Artifacts;
- generated HTML is sanitized;
- external links are treated as untrusted content;
- documentation build dependencies are pinned;
- diagrams/plugins are reviewed;
- CODEOWNERS protects governance and security docs;
- Workers cannot mutate active policy through docs.

---

# 34. Initial implementation sequence

After Section 13 approval:

```text
1. Create architecture branch
2. Split approved Blueprint into 13 source sections
3. Generate PRODUCT-BLUEPRINT.md aggregate
4. Create DOCUMENTATION-MAP.md
5. Publish research reports
6. Create ADR log/template and ADR-0004–0011
7. Replace docs/roadmap.md
8. Create capability-spec template
9. Add document metadata schemas/checker
10. Add CODEOWNERS and docs-impact PR template
11. Update README.md
12. Update AGENTS.md
13. Update tracking STATUS
14. Reconcile MIS-002
15. Review architecture PR
16. Close AB1 only after all checks and operator acceptance
```

---

# 35. Tooling strategy

Start with lightweight repository tools:

- Markdown;
- YAML frontmatter;
- TypeScript validation script;
- markdownlint;
- link checker;
- simple aggregate generator;
- GitHub Actions;
- CODEOWNERS.

Do not introduce immediately:

- documentation database;
- custom CMS;
- Backstage;
- Docusaurus/MkDocs site;
- graph database;
- search service;
- custom RFC web app.

Add a rendered site only when discovery through GitHub becomes insufficient.

---

# 36. Proposed ADR

After approval:

## ADR-0012 — Documentation authority, lifecycle and generated Product Blueprint

Decide:

- authority classes;
- Git/`.mnfs`/SQLite boundaries;
- modular Blueprint source;
- generated aggregate;
- ADR immutability;
- capability-spec process;
- Documentation Map;
- docs-impact declaration;
- CI and ownership.

---

# 37. Final recommendation

> Treat documentation as an executable governance system.

> Keep canonical knowledge close to the code and versioned in Git.

> Separate authority class from reader form.

> Use ADRs for durable choices, capability specs for complete proposals, Mission contracts for scoped commitments, and SQLite for operational state.

> Preserve rejected and superseded history.

> Make the Blueprint modular and generate the aggregate.

> Keep README and AGENTS short.

> Add ownership, metadata, CI and documentation-impact checks before M2 resumes.

> Do not build a documentation portal until the repository-based system becomes insufficient.
