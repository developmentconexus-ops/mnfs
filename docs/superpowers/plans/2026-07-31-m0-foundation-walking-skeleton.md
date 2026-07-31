# M0 Foundation Walking Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-light TypeScript CLI that initializes an MNFS repository, stores operational state in SQLite, opens a mission transactionally and recovers its status from a fresh process.

**Architecture:** Repository-owned identity and planning artifacts live under `.mnfs/`. A committed UUID maps every linked worktree to one runtime directory under `MNFS_HOME` or the platform state directory. One SQLite store owns current mission rows and an append-only event table inside the same transaction. The CLI is a thin adapter over domain services and stable error codes.

**Tech Stack:** TypeScript 5.9, Node.js 24.18+, built-in `node:sqlite`, Node test runner, Git, Ubuntu under WSL2.

## Global Constraints

- Canonical runtime: Ubuntu under WSL2; repository path must not be under `/mnt/c`.
- Windows is the presentation host only.
- Node.js minimum: `24.18.0`.
- Runtime dependencies for M0: zero third-party packages.
- Development dependencies: TypeScript and Node type definitions only.
- Every behavior change follows red → observed failure → minimal green → refactor.
- Operational state lives outside worktrees; `.mnfs/` contains repository identity and later accepted artifacts.
- No Pi SDK, Lavish, Treehouse, Herdr or no-mistakes adapter is implemented in M0.
- No daemon, web UI, model router, parallel worker, event-sourcing projector, cloud service or sandbox.
- Every completed task updates `docs/tracking/STATUS.md` or `docs/tracking/WORKLOG.md`.

---

## File map

- `package.json` — scripts, engines and CLI declaration.
- `tsconfig.json` — strict Node ESM compilation.
- `bin/mnfs.mjs` — executable shim to compiled CLI.
- `src/domain/errors.ts` — stable error codes.
- `src/domain/types.ts` — repository, mission, event and status types.
- `src/runtime/environment.ts` — WSL2 and tool checks.
- `src/runtime/paths.ts` — Git root, repository identity and runtime location.
- `src/store/migrations.ts` — SQLite schema migrations.
- `src/store/sqlite-store.ts` — transaction and query boundary.
- `src/services/project-service.ts` — idempotent project initialization.
- `src/services/mission-service.ts` — open mission and status use cases.
- `src/cli/args.ts` — minimal argument parsing.
- `src/cli/main.ts` — command dispatch and output formatting.
- `src/index.ts` — public exports.
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

- [ ] **Step 1: Write a failing test for required and optional tool classification.**

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

- [ ] **Step 2: Run the focused test and verify failure because `inspectEnvironment` does not exist.**

Run: `npm run test:unit -- tests/runtime/environment.test.ts`
Expected: FAIL with missing module/export.

- [ ] **Step 3: Implement the minimal environment report.**

Required: WSL2, Node >=24.18.0, `git`, `pi`. Optional: `lavish-axi`, `treehouse`, `herdr`.

- [ ] **Step 4: Run the focused test and verify it passes.**

- [ ] **Step 5: Write a failing CLI test for `doctor --json`.**

- [ ] **Step 6: Implement only the `doctor` CLI path and stable JSON output.**

- [ ] **Step 7: Run doctor tests, build and typecheck.**

- [ ] **Step 8: Commit.**

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

- [ ] **Step 1: Write a failing test proving two worktrees with the same committed `.mnfs/repo.json` resolve to the same runtime directory.**
- [ ] **Step 2: Verify the test fails for the missing implementation.**
- [ ] **Step 3: Implement committed repository identity `{schemaVersion, repoId, createdAt}` and runtime resolution.**
- [ ] **Step 4: Verify the focused test passes.**
- [ ] **Step 5: Write a failing test proving initialization is idempotent.**
- [ ] **Step 6: Implement `initializeProject` with atomic `repo.json` creation.**
- [ ] **Step 7: Run all tests.**
- [ ] **Step 8: Commit.**

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

- [ ] **Step 1: Write a failing test asserting schema migration creates `missions`, `events` and `schema_migrations`.**
- [ ] **Step 2: Verify the red failure.**
- [ ] **Step 3: Implement migration v1 and WAL/foreign-key pragmas.**
- [ ] **Step 4: Verify migration test passes.**
- [ ] **Step 5: Write a failing test proving mission row and `MISSION_OPENED` event commit atomically.**
- [ ] **Step 6: Implement `BEGIN IMMEDIATE` transaction with rollback on any error.**
- [ ] **Step 7: Reopen the database in a second store instance and verify the mission persists.**
- [ ] **Step 8: Run all tests and commit.**

### Task 4: Mission service and status view

**Files:**
- Create: `src/services/mission-service.ts`
- Modify: `src/domain/types.ts`
- Test: `tests/services/mission-service.test.ts`

**Interfaces:**
- Produces: `openMission({goal, now}): Mission`
- Produces: `getStatus(): ProjectStatus`

- [ ] **Step 1: Write a failing test for sequential human-readable IDs `MIS-001`, `MIS-002`.**
- [ ] **Step 2: Verify the red failure.**
- [ ] **Step 3: Implement ID allocation inside the SQLite transaction.**
- [ ] **Step 4: Verify pass.**
- [ ] **Step 5: Write a failing test for status counts and active missions.**
- [ ] **Step 6: Implement the minimal status view.**
- [ ] **Step 7: Run all tests and commit.**

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

- [ ] **Step 1: Write a failing subprocess test: initialize temp Git repo, open mission, execute status in a second process.**
- [ ] **Step 2: Verify failure because commands are missing.**
- [ ] **Step 3: Implement argument parsing and command dispatch without adding a CLI framework.**
- [ ] **Step 4: Verify the subprocess test passes.**
- [ ] **Step 5: Add failure-path tests for non-Git directory, missing goal and uninitialized project.**
- [ ] **Step 6: Implement stable error codes for those cases.**
- [ ] **Step 7: Run `npm run verify` and capture the output.**
- [ ] **Step 8: Update README and tracking with verified commands only.**
- [ ] **Step 9: Commit.**

### Task 6: Publication tracking

**Files:**
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/ISSUE_TEMPLATE/work-item.yml`
- Create: `.github/pull_request_template.md`
- Modify: `docs/tracking/STATUS.md`

- [ ] **Step 1: Add issue and PR templates mirroring the local backlog fields.**
- [ ] **Step 2: Create the private GitHub repository when permission is available.**
- [ ] **Step 3: Push `main` and the implementation branch.**
- [ ] **Step 4: Create one GitHub issue per remaining M0 item and record links in `STATUS.md`.**
- [ ] **Step 5: Open a draft PR for the walking skeleton.**
