---
id: PLAN-M1-VISUAL-MISSION-PLANNING
title: M1 Visual Mission Planning Implementation Plan
document_type: implementation_plan
form: explanation
authority: specification
status: implemented
owners:
  - developmentconexus-ops
---

# M1 Visual Mission Planning Implementation Plan

> Execute task-by-task with TDD. Do not begin worker execution, Treehouse, Herdr or parallel orchestration in this plan.

**Goal:** Create a structured, revisioned mission plan that Pi can draft, the operator can review through Lavish, and MNFS can approve as an exact hash-bound execution contract.

**Architecture:** SQLite owns draft revisions and approval state. The approved contract is materialized under `.mnfs/`. HTML is a deterministic projection. Pi uses a project-local skill and the existing CLI; Lavish is invoked through a narrow process adapter.

**Design:** `docs/design/2026-07-31-m1-visual-mission-planning.md`

## Global constraints

- Keep the core independent from Pi SDK and Lavish internals.
- No long JSON in command-line arguments; plans move through files.
- Every revision is append-only and content-addressed.
- HTML never becomes source of truth.
- Explicit operator approval with exact current hash is mandatory.
- Use `spawn` with argument arrays and `shell: false` for external CLIs.
- Continue stable error codes and hidden stack traces.
- Every behavior follows red → observed failure → minimal green → refactor.
- Update `docs/tracking/STATUS.md` and `WORKLOG.md` after each completed increment.

---

## Task 1 — Canonical plan content and validation

**Files**

- Create: `src/domain/mission-plan.ts`
- Create: `tests/domain/mission-plan.test.ts`
- Modify: `src/domain/errors.ts`
- Modify: `src/index.ts`

**Produces**

- `MissionPlanContent`
- `MissionPlanRevision`
- `validateMissionPlan(value, expectedMissionId)`
- `canonicalJson(value)`
- `hashPlanContent(content)`

### Steps

- [ ] Write failing tests for a valid minimal mission plan.
- [ ] Verify missing module/export failure.
- [ ] Implement plan types and minimal validation.
- [ ] Add failing tests for duplicate IDs, broken references and dependency cycles.
- [ ] Implement reference and cycle validation.
- [ ] Add failing tests for `ANSWERED` without answer and open blocking questions.
- [ ] Implement question invariants and `hasOpenBlockingQuestions`.
- [ ] Add deterministic canonical-hash tests: reordered object keys hash equally; reordered arrays do not.
- [ ] Implement recursive key sorting and SHA-256 hash.
- [ ] Run focused tests, typecheck and full suite.
- [ ] Commit: `feat: add mission plan domain and hashing`.

---

## Task 2 — SQLite revision persistence

**Files**

- Modify: `src/store/migrations.ts`
- Modify: `src/store/sqlite-store.ts`
- Modify: `src/domain/types.ts`
- Create: `tests/store/mission-plan-store.test.ts`

**Produces**

- migration v2;
- `saveMissionPlanRevision`;
- `getCurrentMissionPlan`;
- `listMissionPlanRevisions`;
- `approveMissionPlan`.

### Steps

- [ ] Write a failing migration test for `mission_plan_revisions` and widened event types.
- [ ] Implement migration v2 while preserving v1 data.
- [ ] Write a failing test proving revision row + `PLAN_REVISION_SAVED` event commit atomically.
- [ ] Implement first revision insert.
- [ ] Write failing tests for sequential revisions and identical-content idempotency.
- [ ] Implement `expectedPreviousHash` conflict checking inside `BEGIN IMMEDIATE`.
- [ ] Write failing tests proving invalid/stale writes leave no row or event.
- [ ] Implement rollback behavior.
- [ ] Write failing approval tests: exact current hash, one approved revision, matching event.
- [ ] Implement approval transaction and idempotency.
- [ ] Run store tests, typecheck and full suite.
- [ ] Commit: `feat: persist mission plan revisions`.

---

## Task 3 — Plan service and approved contract materialization

**Files**

- Create: `src/services/mission-plan-service.ts`
- Create: `tests/services/mission-plan-service.test.ts`
- Modify: `src/runtime/paths.ts`
- Modify: `src/index.ts`

**Produces**

- `savePlanFromFile`;
- `getCurrentPlan`;
- `approvePlan`;
- `materializeApprovedPlan`;
- runtime and repository artifact paths.

### Steps

- [ ] Write a failing service test loading plan JSON from a file.
- [ ] Implement file read, validation, hashing and store call.
- [ ] Write a failing stale-hash test through the service boundary.
- [ ] Preserve stable `PLAN_REVISION_CONFLICT` error.
- [ ] Write a failing approval test with an open blocking question.
- [ ] Implement `PLAN_BLOCKED`.
- [ ] Write a failing test for atomic `.mnfs/missions/<id>/plan.json` materialization.
- [ ] Implement temp-write + rename after the approval transaction.
- [ ] Write a recovery test: approved DB state rematerializes a missing file.
- [ ] Run focused and full verification.
- [ ] Commit: `feat: add mission plan lifecycle service`.

---

## Task 4 — Deterministic HTML renderer

**Files**

- Create: `src/planning/render-plan.ts`
- Create: `tests/planning/render-plan.test.ts`
- Create: `src/planning/html.ts`
- Modify: `src/services/mission-plan-service.ts`

**Produces**

- `renderMissionPlanHtml(revision)`;
- `renderCurrentPlan(missionId)`;
- runtime HTML artifact path.

### Steps

- [ ] Write a failing renderer test for all plan sections.
- [ ] Implement a minimal self-contained HTML document.
- [ ] Write failing XSS/escaping tests for every user-controlled field.
- [ ] Implement one shared HTML escaping function.
- [ ] Write a failing determinism test for identical revision input.
- [ ] Ensure no timestamp or random value is emitted by the renderer.
- [ ] Write a failing test for exact visible mission/revision/hash.
- [ ] Add the Lavish approval button that queues `MNFS_APPROVE_PLAN mission=<id> hash=<hash>`.
- [ ] Add a Mermaid dependency section only when dependency edges exist.
- [ ] Add responsive layout and native review controls without external assets.
- [ ] Run focused and full verification.
- [ ] Commit: `feat: render mission plans for Lavish review`.

---

## Task 5 — Lavish process adapter

**Files**

- Create: `src/adapters/lavish.ts`
- Create: `tests/adapters/lavish.test.ts`
- Modify: `src/domain/errors.ts`
- Modify: `src/index.ts`

**Produces**

- `openLavishPlan(htmlPath)`;
- `pollLavishPlan(htmlPath)`;
- `endLavishPlan(htmlPath)`;
- injected command runner.

### Steps

- [ ] Write a failing test asserting executable and argument arrays.
- [ ] Implement `spawn` boundary with `shell: false`.
- [ ] Write failing tests for missing executable and non-zero exit.
- [ ] Implement `LAVISH_NOT_FOUND` and `LAVISH_COMMAND_FAILED`.
- [ ] Write a failing poll test preserving stdout as opaque feedback.
- [ ] Implement long poll without internal timeout in production.
- [ ] Write cancellation/interruption test with no MNFS state transition.
- [ ] Confirm adapter never calls `share` or binds beyond loopback.
- [ ] Run focused and full verification.
- [ ] Commit: `feat: add Lavish planning adapter`.

---

## Task 6 — CLI planning commands

**Files**

- Modify: `src/cli/args.ts`
- Modify: `src/cli/main.ts`
- Modify: `src/cli/entry.ts`
- Create: `tests/cli/plan-commands.test.ts`
- Modify: `README.md`

**Commands**

```text
plan save
plan show
plan render
plan open
plan poll
plan approve
plan materialize
```

### Steps

- [ ] Write argument parser tests for all commands and invalid combinations.
- [ ] Implement parsing with file-based plan input.
- [ ] Write CLI tests for stable JSON output and error codes.
- [ ] Wire commands to `MissionPlanService` and Lavish adapter.
- [ ] Add human-readable output containing next action.
- [ ] Update README with the manual M1 loop.
- [ ] Run full verification.
- [ ] Commit: `feat: expose visual planning CLI`.

---

## Task 7 — Project-local Pi skill

**Files**

- Create: `.pi/skills/mnfs-plan/SKILL.md`
- Create: `.pi/skills/mnfs-plan/references/plan-schema.md`
- Create: `tests/pi/mnfs-plan-skill.test.ts`
- Modify: `package.json` only if a test script needs discovery.

### Steps

- [ ] Write a failing static test for valid skill frontmatter and required workflow markers.
- [ ] Create the smallest skill that loads on `/skill:mnfs-plan`.
- [ ] Require use of `plan show` before drafting.
- [ ] Require full structured JSON on every revision.
- [ ] Require expected current hash when revising.
- [ ] Require Lavish open → poll → revise loop.
- [ ] Forbid implementation work and self-approval.
- [ ] Include stop behavior for ended Lavish sessions.
- [ ] Run full verification.
- [ ] Commit: `feat: add Pi visual planning skill`.

---

## Task 8 — End-to-end tests and WSL2 pilot

**Files**

- Create: `tests/cli/visual-planning-walking-skeleton.test.ts`
- Modify: `docs/tracking/STATUS.md`
- Modify: `docs/tracking/BACKLOG.md`
- Modify: `docs/tracking/WORKLOG.md`

### Automated proof

- [ ] Process A creates mission and revision 1.
- [ ] Process B reads revision 1 and renders deterministic HTML.
- [ ] Revision 2 with expected hash supersedes revision 1.
- [ ] Stale revision write is rejected.
- [ ] Approval with wrong hash is rejected.
- [ ] Approval with open blocking question is rejected.
- [ ] Exact revision 2 approval succeeds.
- [ ] Process C reads approved status.
- [ ] Missing contract file is rematerialized.

### Real WSL2 proof

- [ ] Install/update `lavish-axi` in WSL2.
- [ ] Run Pi from repository root.
- [ ] Invoke `/skill:mnfs-plan` for a real small mission.
- [ ] Windows browser opens the generated plan through localhost.
- [ ] Operator annotates one exact change.
- [ ] Pi saves a new structured revision with a new hash.
- [ ] Operator approves the current hash.
- [ ] Approved `.mnfs` contract matches SQLite.
- [ ] Fresh Pi/CLI process recovers the approved plan.

### Completion

- [ ] Update issue #3 with evidence.
- [ ] Update tracking documents.
- [ ] Mark PR ready only after the real WSL2 proof.
- [ ] Commit: `test: prove visual mission planning loop`.

---

## Verification commands

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run verify
```

Manual acceptance:

```bash
pi
/skill:mnfs-plan
```

## Stop conditions

Stop and replan instead of extending scope when:

- Lavish output requires parsing undocumented internals;
- a Pi SDK host appears necessary only for convenience;
- plan schema starts absorbing execution/gate details from M2+;
- browser review cannot be proven through loopback on WSL2;
- revision and approval semantics cannot remain deterministic.
