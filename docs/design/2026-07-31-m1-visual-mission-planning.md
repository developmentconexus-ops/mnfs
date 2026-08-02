---
id: DESIGN-M1-VISUAL-MISSION-PLANNING
title: M1 Visual Mission Planning Design
document_type: design_document
form: explanation
authority: specification
status: implemented
owners:
  - developmentconexus-ops
---

# M1 — Visual Mission Planning with Pi and Lavish

**Date:** 2026-07-31  
**Status:** implementation baseline  
**Issue:** #3  
**Parent:** Pi-first MNFS roadmap

## 1. Outcome

Turn one open MNFS mission into a structured, revisioned plan that the operator can review in a local browser, change through Lavish feedback, and explicitly approve as the execution contract.

```text
mission goal
    ↓
Pi drafts structured plan
    ↓
MNFS validates and stores revision
    ↓
MNFS renders deterministic HTML
    ↓
Lavish opens in Windows browser via WSL localhost
    ↓
operator annotates / requests changes / approves
    ↓
Pi applies feedback to structured plan
    ↓
new revision + new hash
    ↓
approved revision materialized in .mnfs/
```

## 2. Non-goals

M1 does **not** implement:

- worker execution;
- Treehouse leases;
- Herdr panes;
- parallel agents;
- review or QA gates;
- dependency graph reachability;
- cloud execution;
- a custom web application;
- a generic workflow engine;
- automatic parsing of arbitrary human prose into patches without Pi.

## 3. Authority boundaries

| Component | Authority |
|---|---|
| MNFS domain | plan schema, revisions, hashes, approval and contract materialization |
| Pi | reasoning over the goal and human feedback |
| Lavish | browser review surface and feedback transport |
| SQLite | operational draft/revision state |
| `.mnfs/` | approved, versioned execution contract |
| HTML | deterministic projection only; never source of truth |

Constitutional rule:

> Lavish feedback may cause Pi to propose a new structured revision, but only MNFS validates, stores and approves it.

## 4. Simplest useful Pi integration

M1 uses a project skill at:

```text
.pi/skills/mnfs-plan/SKILL.md
```

Pi discovers project skills natively. The skill instructs Pi to use the MNFS CLI and Lavish CLI. M1 does **not** add a Pi SDK host or extension yet.

Why:

- no new process host;
- no Pi runtime dependency in the core package;
- no duplicated session management;
- easy dogfood through `/skill:mnfs-plan`;
- the CLI contract remains reusable by a future Pi extension, RPC host or web UI.

An extension becomes justified only when a second workflow needs programmatic tools or TUI widgets.

## 5. Plan content schema

The semantic content is independent from revision metadata.

```ts
interface MissionPlanContent {
  schemaVersion: 1;
  missionId: string;          // MIS-001
  title: string;
  goal: string;
  successCriteria: string[];
  scope: {
    included: string[];
    excluded: string[];
  };
  assumptions: string[];
  milestones: MilestonePlan[];
  risks: RiskPlan[];
  questions: PlanQuestion[];
}

interface MilestonePlan {
  id: string;                 // M01
  title: string;
  outcome: string;
  dependsOn: string[];
  features: FeaturePlan[];
}

interface FeaturePlan {
  id: string;                 // F01, unique across mission
  title: string;
  outcome: string;
  acceptanceCriteria: string[];
  dependsOn: string[];
}

interface RiskPlan {
  id: string;                 // R01
  description: string;
  mitigation: string;
}

interface PlanQuestion {
  id: string;                 // Q01
  question: string;
  blocking: boolean;
  status: 'OPEN' | 'ANSWERED';
  answer?: string;
}
```

### Validation invariants

- mission exists and is open;
- `missionId` equals the target mission;
- title, goal, outcomes and criteria are non-empty after trimming;
- milestone, feature, risk and question IDs are unique;
- milestone dependencies reference milestones in the same plan;
- feature dependencies reference features in the same plan;
- dependency cycles are rejected;
- `ANSWERED` questions require a non-empty answer;
- approval is rejected while a blocking question remains open.

M1 may use a small explicit validator. Do not add a schema framework unless the validator becomes harder to maintain than the dependency.

## 6. Revision and hash model

```ts
interface MissionPlanRevision {
  missionId: string;
  revision: number;
  status: 'DRAFT' | 'SUPERSEDED' | 'APPROVED';
  contentHash: string;        // sha256:<hex>
  content: MissionPlanContent;
  createdAt: string;
  approvedAt?: string;
}
```

Hash:

```text
sha256(canonicalJson(plan content))
```

Canonical JSON recursively sorts object keys and preserves array order. Revision number, timestamps and approval state are excluded from the content hash.

Rules:

- revisions are append-only;
- saving identical semantic content is idempotent and returns the existing revision;
- a revision after the first requires `expectedPreviousHash`;
- a stale expected hash is rejected with `PLAN_REVISION_CONFLICT`;
- approving requires the exact current hash;
- approval is idempotent for the same hash;
- an approved plan is immutable; later changes require an explicit future replan flow, outside M1.

## 7. Persistence

SQLite migration v2 adds:

```text
mission_plan_revisions
```

Columns:

- `mission_id`;
- `revision`;
- `status`;
- `content_hash`;
- `content_json`;
- `created_at`;
- `approved_at`.

Constraints:

- primary key `(mission_id, revision)`;
- unique `(mission_id, content_hash)`;
- at most one approved revision per mission;
- foreign key to `missions`.

The generic event table is widened to accept:

- `MISSION_OPENED`;
- `PLAN_REVISION_SAVED`;
- `PLAN_APPROVED`.

Revision row and matching event commit in one SQLite transaction.

## 8. Approved contract materialization

After the approval transaction, MNFS writes atomically:

```text
.mnfs/missions/<mission-id>/plan.json
```

Envelope:

```json
{
  "schemaVersion": 1,
  "missionId": "MIS-001",
  "revision": 3,
  "contentHash": "sha256:...",
  "approvedAt": "...",
  "content": {}
}
```

SQLite remains able to rematerialize the file if a crash occurs after database commit but before file publication. Missing materialization is a repairable artifact problem, not loss of approval state.

Drafts and generated HTML are not committed by default.

## 9. HTML projection

The renderer reads one persisted revision and writes:

```text
<runtime-root>/artifacts/plans/<mission-id>/rev-<NNNN>.html
```

Requirements:

- deterministic output for the same revision;
- all user/model strings HTML-escaped;
- mission, revision and exact content hash visible;
- sections for outcome, scope, milestones/features, risks and questions;
- Mermaid dependency view when dependencies exist;
- responsive layout;
- no build step and no local asset requirement;
- approval button queues the exact mission and hash through Lavish;
- request-changes controls produce feedback, never mutate source directly.

Approval prompt emitted by the artifact:

```text
MNFS_APPROVE_PLAN mission=MIS-001 hash=sha256:...
```

The core still verifies the hash before approval. The prompt is a request, not authority.

## 10. Lavish adapter

M1 integrates the published `lavish-axi` CLI, not its internal server APIs.

Commands:

```text
lavish-axi <html-file>
lavish-axi poll <html-file>
lavish-axi end <html-file>
```

Adapter requirements:

- use `spawn`/argument arrays with `shell: false`;
- inject the process runner in tests;
- keep stdout as opaque feedback for Pi rather than maintaining a brittle parser;
- surface named errors for missing executable, non-zero exit and interrupted poll;
- never bind beyond loopback;
- keep Lavish state in its own default state directory;
- do not publish or share artifacts in M1.

The Windows browser reaches the WSL server through localhost. No custom networking configuration is introduced.

## 11. CLI contract

```text
mnfs plan save --mission MIS-001 --input <file> [--expected-hash <hash>] [--json]
mnfs plan show --mission MIS-001 [--json]
mnfs plan render --mission MIS-001 [--json]
mnfs plan open --mission MIS-001 [--json]
mnfs plan poll --mission MIS-001 [--json]
mnfs plan approve --mission MIS-001 --hash <hash> [--json]
mnfs plan materialize --mission MIS-001 [--json]
```

Large plan content always travels through files, never a long inline argument.

## 12. Pi skill loop

The project-local skill instructs Pi to:

1. inspect the mission and current revision;
2. draft a complete JSON plan from the operator goal;
3. call `plan save`;
4. call `plan render` and `plan open`;
5. call `plan poll` and wait for feedback;
6. if feedback requests change, produce the full updated JSON and save with the previous hash;
7. render and reopen the new revision;
8. only call `plan approve` after explicit operator approval containing the current hash;
9. stop when approval succeeds or the user ends the Lavish session.

The skill must not:

- edit the HTML projection;
- write directly to SQLite;
- approve based on its own judgment;
- silently resolve blocking product questions;
- start implementation workers.

## 13. Failure behavior

| Failure | Result |
|---|---|
| invalid plan | named validation errors; no revision/event |
| stale previous hash | `PLAN_REVISION_CONFLICT` |
| current revision missing | `PLAN_NOT_FOUND` |
| blocking question open | `PLAN_BLOCKED` |
| wrong approval hash | `PLAN_APPROVAL_CONFLICT` |
| Lavish missing | `LAVISH_NOT_FOUND` with install command |
| Lavish poll interrupted | no state transition; feedback remains in Lavish |
| materialization fails | approved state preserved; `plan materialize` repairs |

## 14. Security and trust

- Lavish binds to loopback only;
- no `share` command;
- no HTML script from mission text;
- all semantic text is escaped;
- external links are rendered as text in M1;
- Pi and Lavish run with the operator's local permissions, so only trusted package sources are used;
- approval remains an explicit operator action tied to the exact hash.

## 15. Incremental delivery

### M1.1 — Domain and revision store

Proof: valid revision saves; invalid/stale revision makes no database change.

### M1.2 — Deterministic renderer

Proof: snapshot/semantic tests show escaped content, exact hash and approval request.

### M1.3 — Lavish process adapter

Proof: injected runner receives safe argument arrays; missing/non-zero cases are named.

### M1.4 — Pi skill

Proof: Pi discovers `/skill:mnfs-plan` and follows the CLI loop without core SDK coupling.

### M1.5 — Real WSL2 acceptance

Proof:

1. create mission;
2. Pi drafts revision 1;
3. browser opens in Windows;
4. operator requests a concrete change;
5. revision 2 changes structured JSON and hash;
6. operator approves revision 2;
7. `.mnfs/missions/<id>/plan.json` contains the approved exact hash;
8. a fresh process shows the approved plan.

## 16. Deferred decisions

- Pi extension/TUI widget: revisit when M2 needs worker lifecycle tools;
- JSON Schema/Ajv: revisit when more than one external producer needs validation;
- plan diff UI: derive after the first real Lavish pilot;
- replan of an approved mission: belongs to later execution governance;
- cloud persistence: outside local MVP.
