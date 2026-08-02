---
id: PLAN-M0-FOUNDATION-WALKING-SKELETON
title: M0 Foundation Walking Skeleton Plan
document_type: implementation_plan
form: explanation
authority: specification
status: implemented
owners:
  - developmentconexus-ops
---

# M0 Foundation Walking Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a dependency-light TypeScript CLI that initializes an MNFS repository, stores operational state in SQLite, opens a mission transactionally and recovers its status from a fresh process.

**Architecture:** Repository-owned identity and planning artifacts live under `.mnfs/`. A committed UUID maps every linked worktree to one runtime directory under `MNFS_HOME` or the platform state directory. One SQLite store owns current mission rows and an append-only event table inside the same transaction. The CLI is a thin adapter over domain services.

**Tech Stack:** Node.js 24 LTS, TypeScript 5.9, Node test runner, built-in `node:sqlite`, Git, Ubuntu under WSL2.

## Global Constraints

- Canonical environment is Ubuntu under WSL2; repositories must not live under `/mnt/c`.
- Node.js floor is `>=24.18.0` for the supported environment.
- No runtime npm dependencies in M0.
- Use `node:sqlite` only through `src/store/sqlite-store.ts`.
- Use TDD for every production behavior.
- Operational state must never be written inside a worker worktree.
- All timestamps are injected ISO-8601 UTC strings in domain tests.
- CLI errors use a stable code and a human message; stack traces are hidden unless `MNFS_DEBUG=1`.
- YAGNI: no Pi, Lavish, Treehouse, Herdr, worker, review or gate implementation in M0.

---

## File map

- `package.json` — scripts, engine floor and CLI binary.
- `tsconfig.json` — strict NodeNext compilation into `dist/`.
- `src/domain/types.ts` — mission and status types.
- `src/domain/errors.ts` — stable `MnfsError` contract.
- `src/runtime/environment.ts` — WSL and executable probes.
- `src/runtime/paths.ts` — project root, repository identity and runtime paths.
- `src/store/migrations.ts` — versioned SQL schema.
- `src/store/sqlite-store.ts` — transaction and query boundary.
- `src/services/project-service.ts` — idempotent project initialization.
- `src/services/mission-service.ts` — open mission and status use cases.
- `src/cli/args.ts` — minimal argument parsing.
- `src/cli/main.ts` — command dispatch and output formatting.
- `src/index.ts` — public exports.
- `bin/mnfs.mjs` — compiled CLI launcher.
- `tests/**/*.test.ts` — behavior-first tests.

### Task 1: Package bootstrap and environment doctor

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/domain/errors.ts`
- Create: `src/runtime/environment.ts`
- Create: `src/cli/args.ts`
- Create: `src/cli/main.ts`
- Create: `bin/mnfs.mjs`
- Test: `tests/runtime/environment.test.ts`
- Test: `tests/cli/doctor.test.ts`

**Interfaces:**
- Produces: `inspectEnvironment(input: EnvironmentProbeInput): EnvironmentReport`
- Produces: `runCli(argv: string[], dependencies: CliDependencies): Promise<CliResult>`

- [x] **Step 1: Write a failing test for required and optional tool classification.**

```ts
const report = inspectEnvironment({
  platform: 'linux',
  release: '5.15.153.1-microsoft-standard-WSL2',
  nodeVersion: 'v24.18.0',
  which: (name) => ({ git: '/usr/bin/git', pi: '/home/u/.local/bin/pi' })[name] ?? null,
});
assert.equal(report.ready, true);
assert.equal(report.environment, 'wsl2');
assert.deepEqual(report.missingOptional, ['herdr', 'lavish-axi', 'treehouse']);
```

- [x] **Step 2: Run the focused test and verify failure because `inspectEnvironment` does not exist.**

Run: `npm run test:unit -- tests/runtime/environment.test.ts`
Expected: FAIL with missing module/export.

- [x] **Step 3: Implement the minimal environment report.**

Required: WSL2, Node >=24.18.0, `git`, `pi`. Optional: `lavish-axi`, `treehouse`, `herdr`.

- [x] **Step 4: Run the focused test and verify it passes.**

- [x] **Step 5: Write a failing CLI test for `doctor --json`.**

- [x] **Step 6: Implement only the `doctor` CLI path and stable JSON output.**

- [x] **Step 7: Run doctor tests, build and typecheck.**

- [x] **Step 8: Commit.**

```bash
git add package.json tsconfig.json bin src tests
 git commit -m "feat: add MNFS environment doctor"
```

### Task 2: Repository identity and runtime path

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/runtime/paths.ts`
- Create: `src/services/project-service.ts`
- Test: `tests/runtime/paths.test.ts`
- Test: `tests/services/project-service.test.ts`

**Interfaces:**
- Produces: `findGitRoot(startPath: string): string`
- Produces: `resolveRuntimeRoot(repoId: string, env: NodeJS.ProcessEnv): string`
- Produces: `initializeProject(input: InitializeProjectInput): ProjectIdentity`

- [x] **Step 1: Write a failing test proving two worktrees with the same committed `.mnfs/repo.json` resolve to the same runtime directory.**
- [x] **Step 2: Verify the test fails for the missing implementation.**
- [x] **Step 3: Implement committed repository identity `{schemaVersion, repoId, createdAt}` and runtime resolution.**
- [x] **Step 4: Verify the focused test passes.**
- [x] **Step 5: Write a failing test proving initialization is idempotent.**
- [x] **Step 6: Implement `initializeProject` with atomic `repo.json` creation.**
- [x] **Step 7: Run all tests.**
- [x] **Step 8: Commit.**

### Task 3: SQLite schema and transaction boundary

**Files:**
- Create: `src/store/migrations.ts`
- Create: `src/store/sqlite-store.ts`
- Test: `tests/store/sqlite-store.test.ts`

**Interfaces:**
- Produces: `class SqliteStore`
- Produces: `SqliteStore.open(path: string): SqliteStore`
- Produces: `store.openMission(input): Mission`
- Produces: `store.listMissionStatuses(): MissionStatus[]`

- [x] **Step 1: Write a failing test asserting schema migration creates `missions`, `events` and `schema_migrations`.**
- [x] **Step 2: Verify the red failure.**
- [x] **Step 3: Implement migration v1 and WAL/foreign-key pragmas.**
- [x] **Step 4: Verify migration test passes.**
- [x] **Step 5: Write a failing test proving mission row and `MISSION_OPENED` event commit atomically.**
- [x] **Step 6: Implement `BEGIN IMMEDIATE` transaction with rollback on any error.**
- [x] **Step 7: Reopen the database in a second store instance and verify the mission persists.**
- [x] **Step 8: Run all tests and commit.**

### Task 4: Mission service and status view

**Files:**
- Create: `src/services/mission-service.ts`
- Modify: `src/domain/types.ts`
- Test: `tests/services/mission-service.test.ts`

**Interfaces:**
- Produces: `openMission({goal, now}): Mission`
- Produces: `getStatus(): ProjectStatus`

- [x] **Step 1: Write a failing test for sequential human-readable IDs `MIS-001`, `MIS-002`.**
- [x] **Step 2: Verify the red failure.**
- [x] **Step 3: Implement ID allocation inside the SQLite transaction.**
- [x] **Step 4: Verify pass.**
- [x] **Step 5: Write a failing test for status counts and active missions.**
- [x] **Step 6: Implement the minimal status view.**
- [x] **Step 7: Run all tests and commit.**

### Task 5: End-to-end CLI walking skeleton

**Files:**
- Modify: `src/cli/args.ts`
- Modify: `src/cli/main.ts`
- Create: `src/index.ts`
- Test: `tests/cli/walking-skeleton.test.ts`
- Modify: `README.md`
- Modify: `docs/tracking/STATUS.md`
- Modify: `docs/tracking/WORKLOG.md`

**Interfaces:**
- Adds commands: `mnfs init`, `mnfs mission open --goal <text>`, `mnfs status [--json]`.

- [x] **Step 1: Write a failing subprocess test: initialize temp Git repo, open mission, execute status in a second process.**
- [x] **Step 2: Verify failure because commands are missing.**
- [x] **Step 3: Implement argument parsing and command dispatch without adding a CLI framework.**
- [x] **Step 4: Verify the subprocess test passes.**
- [x] **Step 5: Add failure-path tests for non-Git directory, missing goal and uninitialized project.**
- [x] **Step 6: Implement stable error codes for those cases.**
- [x] **Step 7: Run `npm run verify` and capture the output.**
- [x] **Step 8: Update README and tracking with verified commands only.**
- [x] **Step 9: Commit.**

### Task 6: Publication tracking

**Files:**
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/ISSUE_TEMPLATE/work-item.yml`
- Create: `.github/pull_request_template.md`
- Modify: `docs/tracking/STATUS.md`

- [x] **Step 1: Add issue and PR templates mirroring the local backlog fields.**
- [x] **Step 2: Create the public GitHub repository.**
- [ ] **Step 3: Push `main` and the implementation branch.**
- [ ] **Step 4: Create one GitHub issue per remaining M0 item and record links in `STATUS.md`.**
- [ ] **Step 5: Open a draft PR for the walking skeleton.**
