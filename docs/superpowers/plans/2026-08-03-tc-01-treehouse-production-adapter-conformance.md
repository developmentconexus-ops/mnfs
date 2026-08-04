---
id: PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
title: TC-01 Treehouse Production Adapter Conformance Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: current
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Treehouse Production Adapter Conformance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a disposable, deterministic TC-01 harness and execute it on canonical Ubuntu WSL2 to decide whether the pinned Treehouse binary satisfies the physical Lease contract required by `MIS-002/M01`.

**Architecture:** A standalone ESM harness under `spikes/tc-01/` owns fixture creation, exact subprocess invocation, Treehouse JSON parsing, Git/source observations, scenario Evidence and report derivation. Deterministic tests use injected runners and fake executables and are added to root `npm run verify`; only the explicit `npm run tc01 -- run` command invokes the real Treehouse binary on WSL2. Runtime Evidence remains outside the repository until an Operator-reviewed report is promoted under `docs/acceptance/`.

**Tech Stack:** Node.js 24.18.0+, ECMAScript modules, `node:test`, Git CLI, Treehouse 2.1.1 candidate, Ubuntu WSL2, SHA-256, repository documentation validation.

## Global Constraints

- Run real TC-01 scenarios only under canonical Ubuntu WSL2 on a Linux-owned filesystem.
- Use only disposable repositories and pools under `${MNFS_HOME:-$HOME/.local/state/mnfs}/fixtures/tc-01/<run-id>/`.
- Never point TC-01 at the MNFS checkout, a user repository, a user Treehouse pool or `/mnt/c`.
- Resolve and record the exact `treehouse` executable realpath, version and SHA-256 before scenario execution.
- The accepted fixture repository has no `origin` remote and receives no credentials.
- Use `spawn` with argument arrays, `shell: false`, closed stdin, bounded output and explicit timeouts.
- Never use `treehouse return --force`, `treehouse destroy`, broad prune or automatic destructive recovery.
- A command exit code never decides semantic success without fresh status and filesystem/Git observations.
- Preserve a failed fixture until trusted cleanup is explicitly safe.
- Deterministic CI tests must not require Treehouse, WSL2, network, credentials or a real user HOME.
- Do not modify production `src/` code, the approved Mission contract or `SEC-E1` in this plan.
- Do not implement the M01 production adapter, Write Track, Attempt, Worker Run, Claim or Lease persistence.
- M01 implementation and Pi Worker dispatch remain prohibited.

---

## Target File Set

### New

```text
scripts/run-tc01-tests.mjs
spikes/tc-01/README.md
spikes/tc-01/bin/git
spikes/tc-01/src/canonical-json.mjs
spikes/tc-01/src/cli.mjs
spikes/tc-01/src/errors.mjs
spikes/tc-01/src/evidence.mjs
spikes/tc-01/src/fixture.mjs
spikes/tc-01/src/git-observer.mjs
spikes/tc-01/src/orchestrator.mjs
spikes/tc-01/src/paths.mjs
spikes/tc-01/src/process-runner.mjs
spikes/tc-01/src/provenance.mjs
spikes/tc-01/src/report.mjs
spikes/tc-01/src/scenario-runner.mjs
spikes/tc-01/src/treehouse-client.mjs
spikes/tc-01/tests/cli.test.mjs
spikes/tc-01/tests/evidence.test.mjs
spikes/tc-01/tests/fixture.test.mjs
spikes/tc-01/tests/git-observer.test.mjs
spikes/tc-01/tests/harness-contract.test.mjs
spikes/tc-01/tests/orchestrator.test.mjs
spikes/tc-01/tests/paths.test.mjs
spikes/tc-01/tests/process-runner.test.mjs
spikes/tc-01/tests/provenance.test.mjs
spikes/tc-01/tests/report.test.mjs
spikes/tc-01/tests/scenario-runner.test.mjs
spikes/tc-01/tests/treehouse-client.test.mjs
```

### Modified during deterministic harness implementation

```text
package.json
scripts/validate-docs.mjs only when a new canonical acceptance artifact requires validation
scripts/test-documentation-tooling.mjs only when a new documentation invariant is introduced
docs/tracking/STATUS.md
docs/tracking/WORKLOG.md
```

### Created only after real WSL2 execution and Operator review

```text
docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md
```

---

### Task 1: Register the deterministic TC-01 harness

**Files:**
- Create: `spikes/tc-01/tests/harness-contract.test.mjs`
- Create: `scripts/run-tc01-tests.mjs`
- Create: `spikes/tc-01/README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: root ESM package and the existing recursive AS-02 test-runner pattern.
- Produces: `npm run test:tc01`, `npm run tc01 -- <command>` and inclusion of deterministic TC-01 tests in `npm run verify`.

- [ ] **Step 1: Write the RED harness-contract test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

 test('root verification includes deterministic TC-01 tests and an explicit real command', async () => {
  assert.equal(packageJson.scripts['test:tc01'], 'node scripts/run-tc01-tests.mjs');
  assert.equal(packageJson.scripts.tc01, 'node spikes/tc-01/src/cli.mjs');
  assert.match(packageJson.scripts.verify, /npm run test:tc01/u);

  const readme = await readFile('spikes/tc-01/README.md', 'utf8');
  assert.match(readme, /deterministic tests do not invoke the real Treehouse binary/iu);
  assert.match(readme, /npm run tc01 -- run/iu);
  assert.match(readme, /never use.*--force/iu);
});
```

Remove the single accidental leading space before `test(` when writing the file.

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test spikes/tc-01/tests/harness-contract.test.mjs
```

Expected: FAIL because `test:tc01`, `tc01` and the TC-01 README do not exist.

- [ ] **Step 3: Create the recursive test runner**

Use the AS-02 runner structure with the TC-01 directory and exact empty-suite error:

```js
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collect(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...collect(path));
    else if (entry.endsWith('.test.mjs')) files.push(path);
  }
  return files.sort();
}

const files = collect('spikes/tc-01/tests');
if (files.length === 0) {
  console.error('No TC-01 test files found under spikes/tc-01/tests.');
  process.exit(2);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
```

- [ ] **Step 4: Add root scripts**

Set:

```json
{
  "test:tc01": "node scripts/run-tc01-tests.mjs",
  "tc01": "node spikes/tc-01/src/cli.mjs",
  "verify": "npm run typecheck && npm run test:unit && npm run test:as02 && npm run test:tc01 && npm run docs:check"
}
```

Preserve every existing script not shown above.

- [ ] **Step 5: Write the README boundary**

Document exactly:

```text
npm run test:tc01
→ deterministic injected-runner tests; no real Treehouse invocation

npm run tc01 -- run [--run-id <id>] [--state-root <absolute-linux-path>]
→ real canonical WSL2 conformance run

npm run tc01 -- report --run-root <absolute-linux-path>
npm run tc01 -- cleanup --run-root <absolute-linux-path>
```

State that real execution uses a disposable repository, preserves material failures and never calls force, destroy or broad prune.

- [ ] **Step 6: Verify GREEN**

Run:

```bash
node --test spikes/tc-01/tests/harness-contract.test.mjs
npm run test:tc01
```

Expected: all discovered TC-01 tests PASS; at this task the suite contains only the harness-contract test.

- [ ] **Step 7: Commit**

```bash
git add package.json scripts/run-tc01-tests.mjs spikes/tc-01/README.md spikes/tc-01/tests/harness-contract.test.mjs
git commit -m "test: register TC-01 harness"
```

---

### Task 2: Safe process runner and stable error model

**Files:**
- Create: `spikes/tc-01/src/errors.mjs`
- Create: `spikes/tc-01/src/process-runner.mjs`
- Create: `spikes/tc-01/tests/process-runner.test.mjs`

**Interfaces:**
- Consumes: Node child processes and injected clocks.
- Produces:

```js
export function tc01Error(code, message, details = {})
export function assertTc01(condition, code, message, details = {})
export async function runProcess(spec)
```

`runProcess(spec)` accepts:

```ts
interface ProcessSpec {
  file: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  timeoutMs: number;
  stdoutLimitBytes?: number;
  stderrLimitBytes?: number;
}
```

and returns:

```ts
interface ProcessResult {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number | null;
  signal: string | null;
  stdout: Buffer;
  stderr: Buffer;
  timedOut: boolean;
}
```

- [ ] **Step 1: Write RED tests for exact process behavior**

Cover these independent tests:

```js
test('runs with shell false, closed stdin and preserves stdout and stderr bytes', async () => {});
test('terminates a command at the exact timeout and reports TC01_PROCESS_TIMEOUT', async () => {});
test('fails when stdout or stderr exceeds the configured bound', async () => {});
test('reports spawn failure without trying another executable', async () => {});
```

Use temporary Node scripts as real child processes. The first script writes `Buffer.from([0x41, 0x00, 0x42])` to stdout and `warning\n` to stderr. The timeout script runs an interval without exiting. The output-limit script writes 2,048 bytes with a configured 1,024-byte limit.

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test spikes/tc-01/tests/process-runner.test.mjs
```

Expected: FAIL with module-not-found for `process-runner.mjs`.

- [ ] **Step 3: Implement stable errors**

Use these codes only in the deterministic harness:

```js
export const TC01_ERROR_CODES = new Set([
  'TC01_INVALID_INPUT',
  'TC01_NOT_WSL2',
  'TC01_LINUX_FILESYSTEM_REQUIRED',
  'TC01_TOOL_MISSING',
  'TC01_VERSION_MISMATCH',
  'TC01_PROCESS_SPAWN_FAILED',
  'TC01_PROCESS_TIMEOUT',
  'TC01_OUTPUT_LIMIT',
  'TC01_COMMAND_FAILED',
  'TC01_TREEHOUSE_INVALID_OUTPUT',
  'TC01_FIXTURE_INVALID',
  'TC01_EVIDENCE_INVALID',
  'TC01_CLEANUP_BLOCKED',
]);
```

`tc01Error` returns an `Error` whose `name` is `Tc01Error`, with enumerable `code` and `details` fields.

- [ ] **Step 4: Implement the process runner**

Required implementation rules:

```js
const child = spawn(spec.file, spec.args, {
  cwd: spec.cwd,
  env: spec.env,
  shell: false,
  stdio: ['ignore', 'pipe', 'pipe'],
});
```

- default each output bound to 65,536 bytes;
- accumulate raw Buffers, never line-normalize;
- when a bound is exceeded, terminate the child and reject with `TC01_OUTPUT_LIMIT`;
- on timeout, send `SIGTERM`, wait up to 2 seconds, then send `SIGKILL` if still alive;
- reject timeout with `TC01_PROCESS_TIMEOUT` and bounded captured evidence;
- reject spawn errors with `TC01_PROCESS_SPAWN_FAILED`;
- never retry or fall back to a shell.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
node --test spikes/tc-01/tests/process-runner.test.mjs
npm run test:tc01
```

Expected: all process tests and the harness-contract test PASS.

- [ ] **Step 6: Commit**

```bash
git add spikes/tc-01/src/errors.mjs spikes/tc-01/src/process-runner.mjs spikes/tc-01/tests/process-runner.test.mjs
git commit -m "feat: add TC-01 process boundary"
```

---

### Task 3: Run-scoped paths and disposable Git fixture

**Files:**
- Create: `spikes/tc-01/src/paths.mjs`
- Create: `spikes/tc-01/src/fixture.mjs`
- Create: `spikes/tc-01/tests/paths.test.mjs`
- Create: `spikes/tc-01/tests/fixture.test.mjs`

**Interfaces:**
- Consumes: an explicit state root or Linux user state default, Git executable and `runProcess`.
- Produces:

```js
export function validateRunId(value)
export function assertLinuxOwnedAbsolutePath(value, label)
export function resolveTc01StateRoot({ env, homeDir })
export function resolveTc01RunRoot(stateRoot, runId)
export async function createFixture(input)
export async function loadFixture(runRoot)
```

`createFixture` returns:

```ts
interface Tc01Fixture {
  schemaVersion: 1;
  runId: string;
  runRoot: string;
  sourceRepo: string;
  poolRoot: string;
  artifactsRoot: string;
  snapshotsRoot: string;
  fakeHome: string;
  gitWrapperRoot: string;
  holder: string;
  initialCommit: string;
  createdAt: string;
}
```

- [ ] **Step 1: Write RED path tests**

Prove:

- `tc01-20260803-210600-a1b2c3d4` is valid;
- uppercase, whitespace, slash and `..` are rejected;
- `/mnt/c/...`, relative paths and `/mnt` are rejected;
- default state root resolves to `$HOME/.local/state/mnfs`;
- run root is `${stateRoot}/fixtures/tc-01/${runId}` and cannot escape.

- [ ] **Step 2: Verify RED path tests**

```bash
node --test spikes/tc-01/tests/paths.test.mjs
```

Expected: module-not-found.

- [ ] **Step 3: Implement path validation**

Use:

```js
const RUN_ID = /^tc01-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}$/u;
```

Resolve realpaths for existing parents and reject any resulting path under `/mnt`.

- [ ] **Step 4: Write RED fixture tests**

Using a temporary Linux path and injected Git runner, prove that `createFixture`:

- creates `source-repo`, `pool-root`, `artifacts`, `snapshots`, `fake-home` and `git-wrapper`;
- initializes exactly one Git repository and one deterministic commit;
- writes `treehouse.toml` with `max_trees = 2` and an absolute `root` pointing at `pool-root`;
- configures only local synthetic `user.name` and `user.email`;
- has no `origin` remote;
- finishes with empty `git status --porcelain=v1`;
- writes `fixture.json` atomically;
- refuses an existing non-empty run root.

- [ ] **Step 5: Verify RED fixture tests**

```bash
node --test spikes/tc-01/tests/fixture.test.mjs
```

Expected: module-not-found for `fixture.mjs`.

- [ ] **Step 6: Implement fixture creation**

The initial repository files are exactly:

```text
README.md                         "TC-01 disposable fixture\n"
treehouse.toml                   max_trees plus external absolute root
fixture-sentinel.txt             "tc01-fixture-sentinel\n"
```

Run Git with:

```text
git init --initial-branch=main
git config --local user.name MNFS-TC01
git config --local user.email tc01@mnfs.invalid
git add README.md treehouse.toml fixture-sentinel.txt
git commit -m "test: initialize TC-01 fixture"
```

Require `git remote` to return empty output. Store the exact initial commit and holder `mnfs-tc01-<run-id>`.

- [ ] **Step 7: Verify GREEN**

```bash
node --test spikes/tc-01/tests/paths.test.mjs spikes/tc-01/tests/fixture.test.mjs
npm run test:tc01
```

- [ ] **Step 8: Commit**

```bash
git add spikes/tc-01/src/paths.mjs spikes/tc-01/src/fixture.mjs spikes/tc-01/tests/paths.test.mjs spikes/tc-01/tests/fixture.test.mjs
git commit -m "feat: create disposable TC-01 fixtures"
```

---

### Task 4: Provenance and capability discovery

**Files:**
- Create: `spikes/tc-01/src/provenance.mjs`
- Create: `spikes/tc-01/tests/provenance.test.mjs`

**Interfaces:**
- Consumes: injected executable resolver, filesystem hashing and process runner.
- Produces:

```js
export async function discoverTc01Environment(input)
export function validateTreehouseCapabilities(provenance)
```

The returned provenance includes:

```ts
interface Tc01Provenance {
  schemaVersion: 1;
  environment: 'WSL2';
  ubuntuRelease: string;
  kernelRelease: string;
  nodeVersion: string;
  gitVersion: string;
  treehouseVersion: string;
  treehouseExecutable: string;
  treehouseExecutableHash: string;
  capabilities: {
    leaseJson: boolean;
    statusJson: boolean;
    conditionalLeaseId: boolean;
    conditionalHolder: boolean;
  };
  capturedAt: string;
}
```

- [ ] **Step 1: Write RED provenance tests**

Use a scripted runner and temporary executable to prove:

- one absolute executable realpath is required;
- SHA-256 is computed over executable bytes;
- `treehouse --version` must resolve exactly `2.1.1` for the accepted candidate;
- `get --help`, `status --help` and `return --help` must contain the four required capability flags;
- version mismatch returns `TC01_VERSION_MISMATCH` with actual and expected values;
- missing capability returns `TC01_VERSION_MISMATCH`, not a guessed compatibility result;
- WSL2 and Linux-filesystem preconditions fail closed.

- [ ] **Step 2: Verify RED**

```bash
node --test spikes/tc-01/tests/provenance.test.mjs
```

- [ ] **Step 3: Implement provenance discovery**

Commands:

```text
treehouse --version
treehouse get --help
treehouse status --help
treehouse return --help
git --version
uname -r
```

Read `/etc/os-release` directly and require WSL evidence from kernel release. Persist no secrets or complete host environment.

- [ ] **Step 4: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/provenance.test.mjs
npm run test:tc01
git add spikes/tc-01/src/provenance.mjs spikes/tc-01/tests/provenance.test.mjs
git commit -m "feat: capture TC-01 provenance"
```

---

### Task 5: Trusted Git wrapper and repository observations

**Files:**
- Create: `spikes/tc-01/bin/git`
- Create: `spikes/tc-01/src/git-observer.mjs`
- Create: `spikes/tc-01/tests/git-observer.test.mjs`

**Interfaces:**
- Consumes: `TC01_REAL_GIT`, `TC01_GIT_LOG`, process environment and repository paths.
- Produces:

```js
export async function snapshotRepository(input)
export async function snapshotPathTree(input)
export async function readGitInvocationLog(path)
export function assertNoFetchInvocation(entries)
export function compareRepositorySnapshots(before, after)
```

- [ ] **Step 1: Write RED wrapper/observer tests**

Prove that the wrapper:

- appends one JSON line containing exact argv and cwd;
- calls only `TC01_REAL_GIT` using argument arrays and `shell: false`;
- returns the real Git exit status;
- refuses missing absolute `TC01_REAL_GIT` or `TC01_GIT_LOG`;
- preserves stdout/stderr from the real Git process.

Prove that repository snapshots bind:

```text
HEAD
porcelain status bytes
local config bytes
refs bytes
tracked tree hash
working-tree file digest map excluding .git
```

and that `assertNoFetchInvocation` rejects an entry whose first argument is `fetch`.

- [ ] **Step 2: Verify RED**

```bash
node --test spikes/tc-01/tests/git-observer.test.mjs
```

- [ ] **Step 3: Implement the executable wrapper**

File `spikes/tc-01/bin/git` begins:

```js
#!/usr/bin/env node
```

It appends canonical single-line JSON to `TC01_GIT_LOG`, then executes:

```js
spawnSync(process.env.TC01_REAL_GIT, process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
  shell: false,
});
```

Set executable mode:

```bash
chmod 0755 spikes/tc-01/bin/git
```

- [ ] **Step 4: Implement repository snapshots**

Use exact Git commands:

```text
git rev-parse HEAD
git status --porcelain=v1 -z --untracked-files=all
git config --local --null --list
git for-each-ref --format=%(refname)%00%(objectname)%00
git write-tree
```

Walk non-`.git` files without following symlinks; hash relative path, mode and bytes. `compareRepositorySnapshots` reports changed fields rather than reducing them to one boolean.

- [ ] **Step 5: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/git-observer.test.mjs
npm run test:tc01
git add spikes/tc-01/bin/git spikes/tc-01/src/git-observer.mjs spikes/tc-01/tests/git-observer.test.mjs
git commit -m "feat: observe TC-01 Git effects"
```

---

### Task 6: Strict Treehouse JSON client

**Files:**
- Create: `spikes/tc-01/src/treehouse-client.mjs`
- Create: `spikes/tc-01/tests/treehouse-client.test.mjs`

**Interfaces:**
- Consumes: resolved Treehouse executable, fixture, trusted Git wrapper and `runProcess`.
- Produces:

```js
export function buildTreehouseEnvironment(input)
export async function acquireTreehouseLease(input)
export async function observeTreehouseStatus(input)
export async function returnTreehouseLease(input)
export function findStatusByPath(status, expectedPath)
```

Acquisition result:

```ts
interface ExternalLeaseObservation {
  path: string;
  leaseId: string;
  leaseHolder: string;
  leasedAt: string;
}
```

Status item:

```ts
interface TreehouseStatusItem {
  name: string;
  path: string;
  status: string;
  leaseId: string;
  leaseHolder: string;
  leasedAt?: string;
  processes: Array<{ pid: number; name: string }>;
}
```

- [ ] **Step 1: Write RED tests for environment and argv**

Require the environment to contain only:

```text
PATH=<git-wrapper-dir>:<treehouse-dir>:<real-git-dir>:/usr/bin:/bin
HOME=<fixture-fake-home>
LANG=C.UTF-8
LC_ALL=C.UTF-8
GIT_TERMINAL_PROMPT=0
GIT_OPTIONAL_LOCKS=0
TC01_REAL_GIT=<absolute-real-git>
TC01_GIT_LOG=<absolute-run-log>
```

Reject newline-bearing values and paths under `/mnt`.

Assert exact acquisition argv:

```js
['get', '--lease', '--lease-holder', holder, '--json']
```

Assert exact status argv:

```js
['status', '--json']
```

Assert exact release argv:

```js
['return', path, '--if-lease-id', leaseId, '--if-lease-holder', holder]
```

- [ ] **Step 2: Write RED JSON parser tests**

Prove:

- acquisition accepts exactly one JSON object and rejects leading/trailing non-whitespace bytes;
- required fields are non-empty and holder matches exactly;
- path resolves to one existing absolute Linux realpath;
- status accepts one JSON array with strict item shapes;
- duplicate status paths are rejected;
- human tabular output is rejected;
- release returns process evidence only and does not classify domain success.

- [ ] **Step 3: Verify RED**

```bash
node --test spikes/tc-01/tests/treehouse-client.test.mjs
```

- [ ] **Step 4: Implement the client**

All commands use 30,000 ms timeouts and 65,536-byte bounds. `acquireTreehouseLease` and `observeTreehouseStatus` reject non-zero exits. `returnTreehouseLease` returns its non-zero result so fencing scenarios can inspect it, but spawn, timeout and output-limit errors remain typed exceptions.

- [ ] **Step 5: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/treehouse-client.test.mjs
npm run test:tc01
git add spikes/tc-01/src/treehouse-client.mjs spikes/tc-01/tests/treehouse-client.test.mjs
git commit -m "feat: add strict Treehouse conformance client"
```

---

### Task 7: Atomic Evidence store and canonical hashing

**Files:**
- Create: `spikes/tc-01/src/canonical-json.mjs`
- Create: `spikes/tc-01/src/evidence.mjs`
- Create: `spikes/tc-01/tests/evidence.test.mjs`

**Interfaces:**
- Consumes: run-scoped fixture and process results.
- Produces:

```js
export function canonicalJson(value)
export function sha256Bytes(value)
export async function createEvidenceStore(fixture)
export function validateScenarioEvidence(value)
```

Evidence store methods:

```js
store.writeCommand({ scenarioId, commandId, spec, result })
store.writeScenario(record)
store.writeEnvironment(provenance)
store.readScenarios()
store.finalize()
```

- [ ] **Step 1: Write RED Evidence tests**

Prove:

- object-key order does not change canonical JSON hashes; array order does;
- scenario IDs must match `TC01-S01` through `TC01-S15`;
- `argv` is a non-empty string array and `cwd` is an absolute Linux path;
- raw stdout/stderr bytes are written under `artifacts/commands/<scenario>/<command>/`;
- scenario JSON stores only refs, hashes and bounded excerpts, not duplicated full outputs;
- writes use temp-file plus rename in the destination directory;
- artifact refs cannot escape the run artifacts root;
- duplicate scenario finalization is rejected;
- `finalize()` requires exactly S01–S15 once each.

- [ ] **Step 2: Verify RED**

```bash
node --test spikes/tc-01/tests/evidence.test.mjs
```

- [ ] **Step 3: Implement canonical JSON and Evidence writes**

Command artifacts:

```text
artifacts/commands/TC01-S02/acquire/
  metadata.json
  stdout.bin
  stderr.bin
```

Scenario aggregate:

```text
artifacts/scenarios.json
```

Each record contains the exact design fields plus `stdoutHash`, `stderrHash`, `stdoutRef`, `stderrRef` and excerpts capped at 4,096 UTF-8 characters after replacement decoding.

- [ ] **Step 4: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/evidence.test.mjs
npm run test:tc01
git add spikes/tc-01/src/canonical-json.mjs spikes/tc-01/src/evidence.mjs spikes/tc-01/tests/evidence.test.mjs
git commit -m "feat: persist TC-01 evidence"
```

---

### Task 8: Scenario runner and acquisition/recovery proof

**Files:**
- Create: `spikes/tc-01/src/scenario-runner.mjs`
- Create: `spikes/tc-01/tests/scenario-runner.test.mjs`

**Interfaces:**
- Consumes: fixture, provenance, Treehouse client, Git observer and Evidence store.
- Produces:

```js
export async function runTc01Scenarios(input)
export const TC01_SCENARIO_IDS
```

`runTc01Scenarios` executes scenarios sequentially and returns all structured records. A material failure stops mutation-heavy later scenarios, emits explicit `BLOCKED` records for unexecuted dependent scenarios and preserves the fixture.

- [ ] **Step 1: Write RED orchestration tests for S01–S06**

Using injected fake clients, prove:

- S01 validates provenance and capability identity;
- S02 validates acquisition JSON, exact holder, realpath, linked-worktree identity and clean status;
- S03 rejects any Git wrapper `fetch` invocation and requires zero remotes;
- S04 compares source snapshots and permits only expected external pool/Git linked-worktree metadata effects;
- S05 fresh-process recovery uses status-by-holder/path and never calls a second acquisition;
- S06 accepts only JSON status identity matching path, Lease ID and holder;
- a failure in S02 blocks S03–S13 that depend on an acquired Lease but still permits S14 and S15 deterministic checks.

- [ ] **Step 2: Write RED tests for S13–S15**

Prove:

- S13 records Treehouse private-state digest changes as a limitation only when Lease identity and worktree/source content remain unchanged;
- S14 inspects every command Evidence record for shell-false runner metadata, bounded outputs, closed-stdin contract and exact environment keys;
- S15 marks prior Evidence stale when Treehouse executable hash, version, Git version, kernel/Ubuntu identity or command-shape hash changes.

- [ ] **Step 3: Verify RED**

```bash
node --test spikes/tc-01/tests/scenario-runner.test.mjs
```

- [ ] **Step 4: Implement S01–S06 and S13–S15**

S02 linked-worktree proof uses:

```text
git -C <leased-path> rev-parse --show-toplevel
git -C <leased-path> rev-parse --git-common-dir
git -C <source-repo> rev-parse --git-common-dir
```

Canonicalize both common directories and require equality. S05 creates a new Treehouse client instance with no in-memory Lease object except the persisted expected holder/path/ID record.

S13 hashes the exact Treehouse private state file discovered from the configured external pool; absence before first acquisition is canonical `MISSING`, not an empty hash.

- [ ] **Step 5: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/scenario-runner.test.mjs
npm run test:tc01
git add spikes/tc-01/src/scenario-runner.mjs spikes/tc-01/tests/scenario-runner.test.mjs
git commit -m "feat: prove TC-01 acquisition and recovery"
```

---

### Task 9: Release, fencing and work-preservation scenarios

**Files:**
- Modify: `spikes/tc-01/src/scenario-runner.mjs`
- Modify: `spikes/tc-01/tests/scenario-runner.test.mjs`

**Interfaces:**
- Consumes: current exact Lease observation and sequential re-acquisition of the disposable Treehouse worktree.
- Produces: S07–S12 Evidence and trusted scenario cleanup transitions.

- [ ] **Step 1: Write RED test for S07 correct release**

Prove the runner:

1. verifies clean worktree and zero controlled processes;
2. invokes conditional return with exact external Lease ID and holder;
3. obtains fresh status afterward;
4. passes only if no matching Lease remains and no newer Lease occupies the path;
5. preserves the source checkout snapshot.

- [ ] **Step 2: Write RED tests for S08 and S09 fencing**

S08 uses `stale-<real-lease-id>` with the real holder. S09 uses the real Lease ID with `<holder>-stale`.

Both must prove:

- non-zero command exit;
- same Lease ID, holder and leased status after fresh observation;
- identical worktree content digest;
- no detach/reset effect;
- correct release is performed only during trusted scenario cleanup.

- [ ] **Step 3: Write RED test for S10 dirty preservation**

Create `controlled-uncommitted.txt` with exact bytes `tc01-dirty-sentinel\n`, then call the non-force conditional return with closed stdin.

Pass only when:

- sentinel remains byte-identical;
- Lease remains active and unchanged;
- source remains clean;
- no force/destroy/prune argument appears;
- trusted cleanup removes the sentinel and uses ordinary conditional release.

Treat an exit code of zero with an `Aborted` banner as advisory; state observations decide the result.

- [ ] **Step 4: Write RED tests for S11 and S12 classification**

S11 repeats the semantic release request after S07. It must first observe no matching Lease and return the stored successful semantic result without requiring a second raw return command. An optional advisory raw command may be captured only after the deciding classification.

S12 uses:

```text
<run-root>/missing-worktree
<run-root>/unmanaged-repo
```

Neither may be classified as successful release. Require explicit `DIVERGED_MISSING_PATH` or `TREEHOUSE_UNMANAGED_PATH`, and prove no managed Lease changes.

- [ ] **Step 5: Verify RED**

```bash
node --test spikes/tc-01/tests/scenario-runner.test.mjs
```

- [ ] **Step 6: Implement S07–S12 with sequential Lease isolation**

After each scenario that successfully releases a Lease, acquire a new Lease and record its new external identity before the next fencing scenario. Never reuse an old Lease ID as current state. Every cleanup release repeats the exact clean-worktree and identity checks.

- [ ] **Step 7: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/scenario-runner.test.mjs
npm run test:tc01
git add spikes/tc-01/src/scenario-runner.mjs spikes/tc-01/tests/scenario-runner.test.mjs
git commit -m "feat: prove TC-01 release fencing"
```

---

### Task 10: Verdict derivation and human report

**Files:**
- Create: `spikes/tc-01/src/report.mjs`
- Create: `spikes/tc-01/tests/report.test.mjs`

**Interfaces:**
- Consumes: validated provenance and exactly fifteen scenario records.
- Produces:

```js
export function deriveTc01Verdict(input)
export function renderTc01Report(input)
```

Verdict:

```ts
type Tc01Verdict = 'ACCEPT' | 'ACCEPT_WITH_LIMITATIONS' | 'REJECT' | 'BLOCKED';
```

- [ ] **Step 1: Write RED verdict tests**

Encode these precedence rules:

```text
Any FAIL in S02, S03, S04, S05, S07, S08, S09, S10 or S12
→ REJECT

S01 BLOCKED or required tooling/host mismatch
→ BLOCKED unless a material safety failure already requires REJECT

No FAIL, but S13 reports safe private-state normalization or S15 binds an explicit host/version limitation
→ ACCEPT_WITH_LIMITATIONS

All S01–S15 PASS with no limitation
→ ACCEPT

Any missing scenario
→ BLOCKED
```

- [ ] **Step 2: Write RED report tests**

Require deterministic scenario order, exact provenance table, hashes, limitations, failure rationale, artifact refs, cleanup state and one explicit statement:

```text
This Verdict is an R5 design input and does not authorize M01 implementation.
```

The report must not embed raw binary output or environment secrets.

- [ ] **Step 3: Verify RED**

```bash
node --test spikes/tc-01/tests/report.test.mjs
```

- [ ] **Step 4: Implement verdict and report**

Write runtime report to:

```text
<run-root>/artifacts/report.md
```

and machine summary to:

```text
<run-root>/artifacts/verdict.json
```

`verdict.json` binds `treehouseExecutableHash`, `treehouseVersion`, `gitVersion`, `kernelRelease`, command-shape hash and `scenariosHash`.

- [ ] **Step 5: Verify GREEN and commit**

```bash
node --test spikes/tc-01/tests/report.test.mjs
npm run test:tc01
git add spikes/tc-01/src/report.mjs spikes/tc-01/tests/report.test.mjs
git commit -m "feat: derive TC-01 verdict"
```

---

### Task 11: CLI and full deterministic orchestration

**Files:**
- Create: `spikes/tc-01/src/orchestrator.mjs`
- Create: `spikes/tc-01/src/cli.mjs`
- Create: `spikes/tc-01/tests/orchestrator.test.mjs`
- Create: `spikes/tc-01/tests/cli.test.mjs`

**Interfaces:**
- Consumes: all prior TC-01 modules.
- Produces commands:

```text
run
report
cleanup
```

- [ ] **Step 1: Write RED parser tests**

Accepted forms:

```text
run [--run-id <id>] [--state-root <absolute-path>] [--json]
report --run-root <absolute-path> [--json]
cleanup --run-root <absolute-path> [--json]
```

Reject duplicate flags, unknown flags, missing values, relative paths, unsafe run IDs and positional extras with exit code 2.

- [ ] **Step 2: Write RED orchestrator tests**

Using injected dependencies, prove:

- `run` creates a new run, discovers provenance, executes S01–S15, derives a Verdict and returns exact artifact paths;
- a material scenario failure preserves the fixture and prints a cleanup-blocked next action;
- `report` revalidates hashes before rendering and refuses tampered scenario data;
- `cleanup` runs only after Evidence finalization and refuses a live Lease, dirty worktree, changed source or unrecognized run path;
- no command touches paths outside the supplied run root;
- human output contains Verdict and concrete next action; `--json` is stable.

- [ ] **Step 3: Verify RED**

```bash
node --test spikes/tc-01/tests/orchestrator.test.mjs spikes/tc-01/tests/cli.test.mjs
```

- [ ] **Step 4: Implement orchestration**

`runTc01` sequence:

```text
validate host/path
→ allocate run ID when omitted
→ create fixture
→ discover provenance
→ create Evidence store
→ run scenarios
→ finalize Evidence
→ derive Verdict
→ write report
→ return summary
```

Generated run IDs use UTC:

```text
tc01-YYYYMMDD-HHMMSS-<8-lowercase-hex>
```

Use `crypto.randomBytes(4)` only for the suffix; persist the resulting ID before external operations.

- [ ] **Step 5: Implement trusted cleanup**

Cleanup requires all of:

- valid fixture manifest and run-root containment;
- finalized Evidence;
- no status item with the TC-01 holder prefix;
- source checkout unchanged and clean;
- no dirty managed worktree;
- no unresolved `REJECT` condition involving work preservation.

If any check fails, throw `TC01_CLEANUP_BLOCKED` and leave all artifacts intact.

- [ ] **Step 6: Verify GREEN**

```bash
node --test spikes/tc-01/tests/orchestrator.test.mjs spikes/tc-01/tests/cli.test.mjs
npm run test:tc01
npm run verify
```

Expected: all product, AS-02, TC-01 and documentation checks PASS without a real Treehouse dependency.

- [ ] **Step 7: Commit**

```bash
git add spikes/tc-01/src/orchestrator.mjs spikes/tc-01/src/cli.mjs spikes/tc-01/tests/orchestrator.test.mjs spikes/tc-01/tests/cli.test.mjs
git commit -m "feat: expose TC-01 conformance CLI"
```

---

### Task 12: Deterministic review, documentation and CI gate

**Files:**
- Modify: `spikes/tc-01/README.md`
- Modify: `docs/tracking/STATUS.md`
- Modify: `docs/tracking/WORKLOG.md`
- Modify: `package.json` only if the verified script contract differs from Task 1

**Interfaces:**
- Consumes: completed deterministic harness.
- Produces: reviewable pre-WSL2 checkpoint with no real conformance claim.

- [ ] **Step 1: Run the complete deterministic gate**

```bash
npm ci
npm run verify
```

Record:

- Node and npm versions;
- product test count;
- AS-02 test count;
- TC-01 test count;
- documentation ID count;
- exact branch head.

- [ ] **Step 2: Perform specification review**

Check every protocol scenario S01–S15 against a named test and implementation function. Record the mapping in the README under `Deterministic coverage`.

- [ ] **Step 3: Perform adversarial quality review**

Specifically inspect:

- any raw shell string;
- inherited host environment;
- any path that can reach a real pool/repository;
- unbounded output;
- cleanup before Evidence;
- force/destroy/prune tokens;
- exit-code-only semantic decisions;
- broad regex classification of release;
- missing version/hash binding;
- tests that only verify mocks instead of state observations.

Correct all Critical and Important findings before proceeding.

- [ ] **Step 4: Update tracking honestly**

Set:

```text
TC-01 harness:                 IMPLEMENTED / DETERMINISTICALLY VERIFIED
TC-01 real WSL2 Evidence:      NOT_STARTED
M01 microdesign:               PROPOSED
M01 implementation:            PROHIBITED
```

Do not change R5 to PASS.

- [ ] **Step 5: Commit**

```bash
git add spikes/tc-01/README.md docs/tracking/STATUS.md docs/tracking/WORKLOG.md package.json
git commit -m "docs: prepare TC-01 WSL2 execution"
```

- [ ] **Step 6: Push and wait for canonical CI**

```bash
git push
```

Require the PR merge commit workflow to pass `npm ci && npm run verify` before real execution.

---

### Task 13: Real canonical WSL2 conformance run

**Files:**
- Runtime only under `${MNFS_HOME:-$HOME/.local/state/mnfs}/fixtures/tc-01/`
- Later create: `docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md`
- Later modify: `docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md`
- Later modify: `docs/tracking/STATUS.md`
- Later modify: `docs/tracking/WORKLOG.md`

**Interfaces:**
- Consumes: CI-green harness and canonical WSL2 host.
- Produces: exact Treehouse conformance Evidence and an Operator-reviewable Verdict.

- [ ] **Step 1: Prepare the canonical checkout**

```bash
cd ~/src/mnfs
git fetch origin
git switch design/mis-002-m01
git pull --ff-only
npm ci
npm run verify
```

Require clean Git status before continuing.

- [ ] **Step 2: Confirm host and candidate without changing them**

```bash
uname -a
node --version
npm --version
git --version
command -v treehouse
realpath "$(command -v treehouse)"
treehouse --version
sha256sum "$(realpath "$(command -v treehouse)")"
```

Expected Treehouse candidate: `2.1.1`. A mismatch stops with `BLOCKED`; do not install or upgrade automatically inside the Evidence run.

- [ ] **Step 3: Execute TC-01**

```bash
npm run tc01 -- run --json | tee /tmp/mnfs-tc01-run.json
```

Extract `runRoot`, `reportPath` and `verdict` from the JSON. Do not delete `/tmp/mnfs-tc01-run.json` until the canonical report is promoted.

- [ ] **Step 4: Inspect Evidence in a fresh process**

```bash
RUN_ROOT="$(node -e "const x=require('/tmp/mnfs-tc01-run.json'); process.stdout.write(x.runRoot)")"
npm run tc01 -- report --run-root "$RUN_ROOT" --json
sed -n '1,260p' "$RUN_ROOT/artifacts/report.md"
```

Verify all fifteen scenarios exist and artifact hashes resolve.

- [ ] **Step 5: Preserve failure before cleanup**

For `REJECT` or `BLOCKED`, do not run cleanup. Record the exact run root in Issue #16 and preserve the fixture for investigation.

For `ACCEPT` or `ACCEPT_WITH_LIMITATIONS`, inspect source and worktree cleanliness before requesting cleanup:

```bash
npm run tc01 -- cleanup --run-root "$RUN_ROOT" --json
```

Cleanup failure is not overridden; preserve the fixture.

- [ ] **Step 6: Promote the canonical report**

Create `docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md` with:

- exact provenance and executable hash;
- scenario table S01–S15;
- Verdict and limitations;
- runtime artifact root and artifact hashes;
- cleanup result;
- explicit statement that the Verdict is an R5 design input only;
- exact accepted/rejected adapter command shape.

Do not promote raw binary command outputs to Git.

- [ ] **Step 7: Incorporate the Verdict into the M01 microdesign**

For `ACCEPT`:

- bind the exact supported Treehouse version and command shapes;
- retain mandatory preflight and freshness rules.

For `ACCEPT_WITH_LIMITATIONS`:

- add every limitation as an explicit invariant, entry criterion, failure behavior or verification step.

For `REJECT`:

- remove Treehouse as the selected production adapter and return R5 to architecture review.

For `BLOCKED`:

- leave the candidate unresolved and keep M01 implementation prohibited.

- [ ] **Step 8: Run final documentation and project verification**

```bash
npm run docs:check
npm run verify
```

- [ ] **Step 9: Commit Evidence and design reconciliation**

```bash
git add \
  docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md \
  docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md \
  docs/tracking/STATUS.md \
  docs/tracking/WORKLOG.md
git commit -m "docs: record TC-01 Treehouse conformance"
git push
```

---

### Task 14: Final R5 design review gate

**Files:**
- Modify only files required by review findings.

**Interfaces:**
- Consumes: TC-01 canonical Evidence and reconciled M01 microdesign.
- Produces: either an explicitly approved final microdesign or a blocked/replan result.

- [ ] **Step 1: Run constructive review**

Confirm each requirement has exact final coverage:

```text
CAP-EXEC-REQ-001 → current Attempt invariant
CAP-EXEC-REQ-002 → Worker Run identity separation
CAP-EXEC-REQ-004 → Claim plus Event atomicity
CAP-EXEC-REQ-005 → exact contract-hash binding
CAP-EXEC-REQ-006 → Lease Intent–Action–Observation
CAP-EXEC-REQ-007 → release idempotency and fencing
CAP-EXEC-REQ-008 → orphan/missing-worktree Reconcile
```

- [ ] **Step 2: Run adversarial review**

Challenge:

- every crash window;
- stale ID/generation/holder behavior;
- dirty/unclassified work preservation;
- migration preservation of M0/M1;
- claim/resource disposition consistency;
- false idempotency;
- hidden network or credential assumptions;
- stale TC-01 Evidence;
- accidental M02 implementation.

- [ ] **Step 3: Obtain explicit Operator decision**

Present the final microdesign, TC-01 Verdict, exact design version and remaining limitations. Do not infer approval from CI, PR state or the earlier design-package approval.

- [ ] **Step 4: Stop before M01 implementation**

After final microdesign approval, invoke the writing-plans workflow again to create the separate `MIS-002/M01` production implementation plan. Do not reuse this TC-01 plan as authorization to modify production execution code.

---

## Verification Commands

### Deterministic development

```bash
node --test spikes/tc-01/tests/<focused-test>.test.mjs
npm run test:tc01
npm run verify
```

### Real conformance

```bash
npm run tc01 -- run --json
npm run tc01 -- report --run-root <absolute-run-root> --json
npm run tc01 -- cleanup --run-root <absolute-run-root> --json
```

## Stop Conditions

Stop and return to design review when:

- Treehouse is not exactly the reviewed candidate and no new source/provenance review exists;
- the fixture cannot remain wholly on the Linux filesystem;
- a real repository, user pool, credential or Windows mount would be touched;
- acquisition invokes network or prompts for credentials in the accepted no-origin fixture;
- source checkout mutation is observed;
- stale Lease ID or holder can release the current Lease;
- dirty work is reset or removed without explicit destructive authority;
- status cannot return stable JSON Lease identity;
- recovery cannot rediscover an acquired Lease without a second acquisition;
- cleanup requires force, destroy or broad prune;
- Evidence cannot remain bounded, hash-bound and reproducible;
- the harness begins implementing production M01 domain behavior;
- any material protocol change lacks a fresh review.
