---
id: PLAN-AS-02-LOCAL-PI-SANDBOX-WSL2
title: AS-02 Local Pi Sandbox on WSL2 implementation plan
document_type: implementation_plan
form: explanation
authority: specification
status: implementing
owners:
  - developmentconexus-ops
related:
  - DESIGN-AS-02-LOCAL-PI-SANDBOX-WSL2
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-12
  - ADR-0006
  - CAP-EXECUTION
tracking_issue: 8
---

# AS-02 Local Pi Sandbox on WSL2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use TDD for every behavior change and execute this plan task-by-task. Do not start M2 Worker implementation from this plan.

**Goal:** Build and execute a reproducible security spike that determines whether a Pi host process with built-in tools disabled, first-party brokered tools, `@anthropic-ai/sandbox-runtime@0.0.67`, a Treehouse lease and Ubuntu WSL2 is a sufficient E1 boundary for the fixed M2 slice.

**Architecture:** Keep Pi and provider authentication in the trusted host plane. Compile an exact, hash-bound sandbox policy outside Worker write authority, initialize Sandbox Runtime before exposing any brokered operation, invoke sandboxed commands through `SandboxManager.wrapWithSandboxArgv()` and `spawn(..., { shell: false })`, and write raw evidence through a trusted orchestrator. Deterministic harness logic runs in normal CI with injected runners; S1–S15 acceptance runs only on the canonical WSL2 host.

**Tech Stack:** Node.js 24.18+, ECMAScript modules, `node:test`, Pi extensions, `@anthropic-ai/sandbox-runtime@0.0.67`, Bubblewrap, Socat, ripgrep, Git, Treehouse CLI and Ubuntu WSL2.

## Global Constraints

- Do not modify `.mnfs/missions/MIS-002/plan.json`; revision 3 remains immutable historical evidence.
- Do not implement Attempt, Worker Run, Claim, Receipt, Gate, M2 recovery or production Worker dispatch.
- Do not read real credentials or existing user files; all protected probes use synthetic run-specific sentinels.
- Do not run `sudo`, change AppArmor or `sysctl`, restart WSL, or invoke Windows executables automatically.
- Repository and disposable Git repositories must live on the Linux filesystem, never under `/mnt/c`.
- Pin Sandbox Runtime exactly to `0.0.67`; record the installed Pi and Treehouse versions during real execution.
- Pi must run with `--no-builtin-tools --no-extensions -e <exact-extension-path>` for the brokered candidate.
- Sandbox initialization failure must expose no repository-facing tool and must never fall back to a host process.
- Use exact realpaths for the leased worktree, policy, broker, Git metadata and controlled temporary paths.
- Use `shell: false` for host process spawning. Where Sandbox Runtime requires one command string, construct it only from controlled argv with a tested POSIX quoting function.
- Capture raw evidence outside Worker write roots; never treat model text as a security Verdict.
- A missing prerequisite is `BLOCKED`, not a passing skip.
- GitHub Actions proves deterministic logic only; real WSL2 behavior remains a separate acceptance gate.
- Run `npm run verify` and inspect complete output before any completion claim.

---

## File and Interface Map

### Root integration

- `package.json` — adds deterministic AS-02 tests to the canonical verify gate and commands for real spike execution.
- `scripts/run-as02-tests.mjs` — discovers and runs `spikes/as-02/tests/*.test.mjs` deterministically.

### Spike control plane

- `spikes/as-02/src/errors.mjs` — named AS-02 error codes and typed error helper.
- `spikes/as-02/src/canonical-json.mjs` — stable recursive JSON serialization and SHA-256 hashing.
- `spikes/as-02/src/policy.mjs` — compiles the frozen SRT policy and Worker environment.
- `spikes/as-02/src/preflight.mjs` — observes WSL, toolchain, sandbox primitives and host policy without mutation.
- `spikes/as-02/src/fixture.mjs` — creates and cleans durable controlled sentinels and disposable repository state under the Linux MNFS state root.
- `spikes/as-02/src/controlled-socket.mjs` — derives, opens, recreates and cleans the short ephemeral Unix socket used only by S8.
- `spikes/as-02/src/treehouse.mjs` — narrow Treehouse lease adapter.
- `spikes/as-02/src/evidence.mjs` — validates, redacts and persists raw scenario evidence.
- `spikes/as-02/src/sandbox-session.mjs` — fail-closed SRT initialization and command execution seam.
- `spikes/as-02/src/scenario-runner.mjs` — executes S1–S13 and trusted observations.
- `spikes/as-02/src/performance.mjs` — S14 sampling and percentile calculations.
- `spikes/as-02/src/restart.mjs` — S15 checkpoint and phase-two verification.
- `spikes/as-02/src/report.mjs` — derives `ACCEPT`, `ACCEPT_WITH_LIMITATIONS`, `REJECT` or `BLOCKED`.
- `spikes/as-02/src/cli.mjs` — user-facing commands: `preflight`, `run`, `restart-prepare`, `restart-resume`, `report` and `cleanup`.

### Broker and Pi boundary

- `spikes/as-02/broker/index.mjs` — receives one operation JSON file and performs exactly one bounded operation inside SRT.
- `spikes/as-02/broker/operations.mjs` — implementations for `bash`, `read`, `write`, `edit`, `grep`, `find` and `ls`.
- `spikes/as-02/pi-extension/src/index.ts` — async Pi extension that verifies policy/worktree identity, initializes SRT before registering tools and forwards tool calls to the broker.

### Scenario definitions

- `spikes/as-02/scenarios/*.mjs` — controlled commands, trusted observations and evaluation rules for S1–S13.
- `spikes/as-02/policies/network-off.json` — immutable network-off profile fragment.
- `spikes/as-02/policies/narrow-network.json` — immutable narrow-domain profile fragment.

### Evidence and documentation

- `spikes/as-02/PROVENANCE.md` — source, version, license, integrity and capability review.
- `docs/acceptance/2026-08-02-as-02-local-pi-sandbox-wsl2.md` — final promoted acceptance report after real WSL2 proof.
- `docs/adr/0006-security-planes-and-local-execution-isolation.md` — evidence link and resulting candidate disposition, without rewriting the accepted decision.
- `docs/capabilities/CAP-EXECUTION/TRACEABILITY.json` — requirement evidence/state update.
- `docs/capabilities/CAP-EXECUTION/COVERAGE.md` — generated projection only.
- `docs/tracking/STATUS.md` and `docs/tracking/WORKLOG.md` — current state and chronology.

---

### Task 1: Wire Deterministic AS-02 Tests into the Canonical Gate

**Files:**
- Create: `scripts/run-as02-tests.mjs`
- Create: `spikes/as-02/tests/harness-contract.test.mjs`
- Create: `spikes/as-02/package.json`
- Create: `spikes/as-02/README.md`
- Modify: `package.json`

**Interfaces:**
- Produces command `npm run test:as02`.
- Produces command `npm run as02 -- <subcommand>` mapped to `node spikes/as-02/src/cli.mjs`.
- Canonical `npm run verify` must execute `test:as02` after existing compiled tests and before documentation checks.

- [ ] **Step 1: Add the failing harness-contract test**

Create a `node:test` case that reads root `package.json` and asserts:

```js
assert.equal(root.scripts['test:as02'], 'node scripts/run-as02-tests.mjs');
assert.match(root.scripts.verify, /npm run test:as02/);
assert.equal(root.scripts.as02, 'node spikes/as-02/src/cli.mjs');
assert.equal(spike.dependencies['@anthropic-ai/sandbox-runtime'], '0.0.67');
```

- [ ] **Step 2: Commit RED and verify the failure in GitHub Actions**

Expected failure: `test:as02` is missing from root scripts or the runner file does not exist.

- [ ] **Step 3: Implement the deterministic test runner and scripts**

`run-as02-tests.mjs` must recursively collect only `.test.mjs` files under `spikes/as-02/tests`, sort paths, fail with exit code `2` when none exist, and spawn Node with `['--test', ...files]` using `shell: false`.

`spikes/as-02/package.json` must be private, ESM, require Node `>=24.18.0`, pin SRT to `0.0.67`, and expose no publish configuration.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm run test:as02
npm run verify
```

Expected: harness-contract test passes and the pre-existing 94 tests remain green.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/run-as02-tests.mjs spikes/as-02/package.json spikes/as-02/README.md spikes/as-02/tests/harness-contract.test.mjs
git commit -m "test: wire AS-02 harness into verification"
```

### Task 2: Canonical Policy, Hash and Environment Allowlist

**Files:**
- Create: `spikes/as-02/src/errors.mjs`
- Create: `spikes/as-02/src/canonical-json.mjs`
- Create: `spikes/as-02/src/policy.mjs`
- Create: `spikes/as-02/policies/network-off.json`
- Create: `spikes/as-02/policies/narrow-network.json`
- Create: `spikes/as-02/tests/policy.test.mjs`

**Interfaces:**

```js
canonicalJson(value) -> string
sha256Text(text) -> `sha256:${string}`
compilePolicy(input) -> { config, canonical, hash }
buildWorkerEnv(hostEnv, paths) -> Record<string, string>
assertPolicyHash(expected, actual) -> void
```

`compilePolicy()` consumes exact absolute realpaths and emits an SRT-compatible object with `network`, `filesystem`, `allowUnixSockets`, `allowLocalBinding` and no credentials.

- [ ] **Step 1: Write failing policy tests**

Cover:

- recursive object-key ordering yields the same hash;
- array order remains semantic;
- network-off sets `strictAllowlist: true`, empty allowed/denied domains and `allowLocalBinding: false`;
- write roots contain only leased worktree and controlled temp;
- deny-write contains `.mnfs`, `.pi`, `.env`, Git common/worktree metadata, policy root, real/fake HOME and `/mnt`;
- deny-read covers real HOME, fake HOME, `/mnt`, policy root and unexposed runtime state;
- exact allow-read carve-outs include worktree, broker, controlled temp and required disposable Git metadata;
- Linux policy rejects glob characters;
- `buildWorkerEnv()` excludes token, SSH agent, cloud, Docker, browser, Windows and arbitrary user variables;
- a mismatched policy hash throws `POLICY_HASH_MISMATCH`.

- [ ] **Step 2: Verify RED**

Expected failure: module exports do not exist.

- [ ] **Step 3: Implement minimal policy compiler**

Use `realpathSync.native()` for existing paths, deduplicate literal paths, reject empty/non-absolute paths, and preserve semantic array order. Construct the Worker environment from an allowlist rather than copying `process.env`.

- [ ] **Step 4: Verify GREEN and full regression**

```bash
npm run test:as02
npm run verify
```

- [ ] **Step 5: Commit**

```bash
git add spikes/as-02/src/errors.mjs spikes/as-02/src/canonical-json.mjs spikes/as-02/src/policy.mjs spikes/as-02/policies spikes/as-02/tests/policy.test.mjs
git commit -m "feat: compile frozen AS-02 security policy"
```

### Task 3: Safe Fixture, Git Metadata Discovery and Controlled Cleanup

**Files:**
- Create: `spikes/as-02/src/process-runner.mjs`
- Create: `spikes/as-02/src/fixture.mjs`
- Create: `spikes/as-02/tests/fixture.test.mjs`

**Interfaces:**

```js
runProcess({ file, args, cwd, env, timeoutMs, signal }) -> Promise<ProcessResult>
discoverGitMetadata(worktree, runner) -> Promise<GitMetadata>
createFixture(options) -> Promise<Fixture>
digestResources(resourcePaths) -> Promise<Record<string, string>>
cleanupFixture(fixture) -> Promise<CleanupResult>
```

`ProcessResult` contains `exitCode`, `signal`, byte-preserved `stdout`, byte-preserved `stderr`, `startedAt` and `finishedAt`.

- [ ] **Step 1: Write failing fixture tests**

Use only temporary directories and an injected runner. Assert:

- run ID accepts only `[a-z0-9-]+` and path containment is enforced;
- all restart-bound fixture roots are below `${MNFS_HOME:-$HOME/.local/state/mnfs}/fixtures/as-02/<run-id>`; only the controlled Unix socket is ephemeral under a short per-user `/tmp` pathname, and the optional mount sentinel remains under `/mnt/c/mnfs-as-02/<run-id>`;
- sentinels exist before policy compilation and contain unique markers;
- normal evidence exposes only digest and logical resource ID, not marker plaintext;
- linked-worktree metadata is discovered with `git rev-parse --git-common-dir`, `--git-dir`, `--git-path config`, `--git-path hooks` and `--git-path index`;
- no path in the real MNFS repository is mutated;
- cleanup removes only paths registered in the fixture manifest;
- failed containment or an unexpected modified outside sentinel throws a named failure.

- [ ] **Step 2: Verify RED**

Expected failure: `createFixture` and `discoverGitMetadata` are missing.

- [ ] **Step 3: Implement fixture and process runner**

Create a disposable source repository, initial commit and protected files. Keep real user HOME untouched; create one synthetic absolute-home sentinel under a run-owned path supplied by the orchestrator. Create `/mnt/c` evidence only when trusted setup can create the exact run-owned directory.

- [ ] **Step 4: Verify GREEN**

```bash
npm run test:as02
npm run verify
```

- [ ] **Step 5: Commit**

```bash
git add spikes/as-02/src/process-runner.mjs spikes/as-02/src/fixture.mjs spikes/as-02/tests/fixture.test.mjs
git commit -m "feat: create safe AS-02 fixtures"
```

### Task 4: Treehouse Durable Lease Adapter

**Files:**
- Create: `spikes/as-02/src/treehouse.mjs`
- Create: `spikes/as-02/tests/treehouse.test.mjs`

**Interfaces:**

```js
acquireTreehouseLease({ repositoryPath, runId, runner }) -> Promise<TreehouseLease>
inspectTreehouseLease({ repositoryPath, lease, runner }) -> Promise<LeaseObservation>
releaseTreehouseLease({ lease, runner, force }) -> Promise<ReleaseObservation>
```

Acquisition command:

```text
treehouse get --lease --lease-holder mnfs-as02-<run-id>
```

Release command:

```text
treehouse return <exact-leased-path>
```

- [ ] **Step 1: Write failing adapter tests**

Assert exact argv, `shell: false`, repository cwd, one absolute stdout path, no extra stdout lines, exact realpath validation, `treehouse status` inspection, idempotent interpretation of already-returned state, and no destructive `destroy`/`--force` use during ordinary cleanup.

- [ ] **Step 2: Verify RED**

Expected failure: Treehouse adapter exports do not exist.

- [ ] **Step 3: Implement adapter**

Treat non-zero acquisition as `TREEHOUSE_UNAVAILABLE`; reject a path outside Treehouse-managed Linux roots; record stdout/stderr as evidence; never parse human banners from stderr as state.

- [ ] **Step 4: Verify GREEN**

```bash
npm run test:as02
npm run verify
```

- [ ] **Step 5: Commit**

```bash
git add spikes/as-02/src/treehouse.mjs spikes/as-02/tests/treehouse.test.mjs
git commit -m "feat: add Treehouse spike lease adapter"
```

### Task 5: Evidence Schema, Redaction and Verdict Engine

**Files:**
- Create: `spikes/as-02/src/evidence.mjs`
- Create: `spikes/as-02/src/report.mjs`
- Create: `spikes/as-02/tests/evidence.test.mjs`
- Create: `spikes/as-02/tests/report.test.mjs`

**Interfaces:**

```js
validateScenarioEvidence(value) -> ScenarioEvidence
redactOutput(buffer, secretMarkers) -> { bytes, redactions }
writeScenarioEvidence({ artifactRoot, evidence, stdout, stderr }) -> Promise<ScenarioEvidence>
deriveDecision({ scenarios, preflight, restart, performance, limitations }) -> Decision
renderReport(input) -> string
```

- [ ] **Step 1: Write failing evidence tests**

Assert required S1–S15 identities, ISO timestamps, exact policy hash, external stdout/stderr references, digest-only protected resource observations, output size limits and sentinel redaction across chunk boundaries.

- [ ] **Step 2: Write failing decision tests**

Assert:

- any sentinel read, write escape, network bypass, privileged socket access, policy mutation, child escape or fail-open yields `REJECT`;
- missing required WSL proof yields `BLOCKED`;
- unsupported socket enforcement cannot yield unrestricted `ACCEPT`;
- all mandatory scenarios passing may yield `ACCEPT`;
- explicit non-material constraints yield `ACCEPT_WITH_LIMITATIONS` and are listed as M2 entry criteria;
- model text cannot override computed results.

- [ ] **Step 3: Verify RED**

Expected failure: evidence and report functions are missing.

- [ ] **Step 4: Implement evidence and report modules**

Write JSON atomically through temp-file plus rename, use byte limits, redact before persistence, and sort scenario records by numeric scenario ID in the final report.

- [ ] **Step 5: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/src/evidence.mjs spikes/as-02/src/report.mjs spikes/as-02/tests/evidence.test.mjs spikes/as-02/tests/report.test.mjs
git commit -m "feat: derive AS-02 evidence and verdicts"
```

### Task 6: Fail-Closed Sandbox Runtime Session

**Files:**
- Create: `spikes/as-02/src/posix-argv.mjs`
- Create: `spikes/as-02/src/sandbox-session.mjs`
- Create: `spikes/as-02/tests/sandbox-session.test.mjs`
- Modify: `spikes/as-02/PROVENANCE.md`

**Interfaces:**

```js
quotePosixArg(value) -> string
commandFromArgv(argv) -> string
loadSandboxRuntime() -> Promise<{ SandboxManager }>
createSandboxSession({ manager, processRunner, policy, expectedPolicyHash, cwd, workerEnv }) -> SandboxSession
SandboxSession.initialize() -> Promise<void>
SandboxSession.run(argv, options) -> Promise<ProcessResult>
SandboxSession.close() -> Promise<void>
```

- [ ] **Step 1: Write failing quoting tests**

Cover empty strings, spaces, quotes, semicolons, command substitution, newlines and Unicode. Round-trip controlled argv through `/bin/bash -c` in the test fixture and assert exact arguments.

- [ ] **Step 2: Write failing fail-closed tests**

Using fake managers/runners, prove:

- `run()` before successful `initialize()` throws `SANDBOX_UNAVAILABLE` and never calls the process runner;
- initialization rejection leaves the session permanently unavailable;
- policy hash mismatch prevents initialization;
- `wrapWithSandboxArgv()` receives the controlled command, abort signal and exact cwd;
- returned `argv` is executed as `file=argv[0]`, `args=argv.slice(1)`, `shell:false`, exact cwd and constructed env;
- no direct-host fallback exists;
- close invokes `SandboxManager.reset()` once and reports cleanup errors separately.

- [ ] **Step 3: Verify RED**

Expected failure: sandbox session exports are missing.

- [ ] **Step 4: Implement the session**

Dynamically import SRT so deterministic tests do not require nested installation. Call `SandboxManager.initialize(policy.config, undefined, true)`, then `wrapWithSandboxArgv(command, '/bin/bash', undefined, signal, cwd)`. Use the wrapped `env` only as the base required by SRT and overlay the explicit Worker allowlist; remove disallowed variables again before spawn.

- [ ] **Step 5: Record source provenance**

Record package `0.0.67`, Apache-2.0, npm integrity from the generated lockfile, official repository, exact reviewed source commit/tag, exported APIs and known Linux limitations.

- [ ] **Step 6: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/src/posix-argv.mjs spikes/as-02/src/sandbox-session.mjs spikes/as-02/tests/sandbox-session.test.mjs spikes/as-02/PROVENANCE.md
git commit -m "feat: add fail-closed SRT session"
```

### Task 7: Bounded Broker Operations

**Files:**
- Create: `spikes/as-02/broker/index.mjs`
- Create: `spikes/as-02/broker/operations.mjs`
- Create: `spikes/as-02/tests/broker.test.mjs`

**Interfaces:**

```js
validateOperation(value, boundary) -> BrokerOperation
executeOperation(operation, boundary) -> Promise<BrokerResult>
```

Operations:

```text
bash { command, timeoutMs }
read { path, offset?, limit? }
write { path, content }
edit { path, oldText, newText }
grep { query, path, maxResults }
find { pattern, path, maxResults }
ls { path, maxEntries }
```

- [ ] **Step 1: Write failing broker tests**

Assert exact-worktree path containment after realpath resolution, rejection of `..`/symlink escapes, output truncation, deterministic ordering, atomic write/edit, edit requires exactly one old-text match, and subprocess execution uses explicit cwd/environment with timeout and process-group termination.

- [ ] **Step 2: Verify RED**

Expected failure: operation functions are missing.

- [ ] **Step 3: Implement operations**

`index.mjs` reads one operation JSON path from argv, reads boundary paths from environment, executes one operation, prints one JSON result to stdout and exits non-zero with one named JSON error on failure. It must not read policy from the worktree.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/broker spikes/as-02/tests/broker.test.mjs
git commit -m "feat: add bounded AS-02 broker operations"
```

### Task 8: First-Party Pi Extension and Bash-Only Adversarial Comparison

**Files:**
- Create: `spikes/as-02/pi-extension/package.json`
- Create: `spikes/as-02/pi-extension/src/index.ts`
- Create: `spikes/as-02/src/pi-inventory.mjs`
- Create: `spikes/as-02/tests/pi-extension.test.mjs`
- Create: `spikes/as-02/tests/pi-inventory.test.mjs`

**Interfaces:**

The extension reads only:

```text
MNFS_AS02_POLICY_PATH
MNFS_AS02_POLICY_HASH
MNFS_AS02_WORKTREE
MNFS_AS02_BROKER
MNFS_AS02_OPERATION_ROOT
MNFS_AS02_ARTIFACT_ROOT
```

It exports an async default factory and registers exactly:

```text
bash read write edit grep find ls
```

- [ ] **Step 1: Write failing static and fake-API tests**

Assert:

- extension factory is async;
- policy/worktree/broker realpaths and hash are checked before `registerTool` is called;
- SRT initialization failure registers zero tools;
- successful initialization registers exactly seven tools;
- every tool writes an operation file outside Worker write authority and calls the sandboxed broker session;
- tool results truncate output and return no sentinel plaintext;
- shutdown resets the sandbox session;
- no `--no-sandbox`, config disable flag or direct host fallback exists.

- [ ] **Step 2: Add the adversarial inventory test**

Represent Configuration A as the upstream-equivalent bash-only pattern and assert the inventory still contains native `read`, `write`, `edit`, `grep`, `find` and `ls`. Represent Configuration B as `--no-builtin-tools --no-extensions -e <path>` and assert only the seven reviewed extension tools can become active.

- [ ] **Step 3: Verify RED**

Expected failure: extension and inventory modules do not exist.

- [ ] **Step 4: Implement extension**

Use current Pi extension APIs and TypeBox schemas. Throw from tool execution on broker error. Keep extension source and dependencies outside the leased worktree write roots during the real run.

- [ ] **Step 5: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/pi-extension spikes/as-02/src/pi-inventory.mjs spikes/as-02/tests/pi-extension.test.mjs spikes/as-02/tests/pi-inventory.test.mjs
git commit -m "feat: add brokered Pi sandbox extension"
```

### Task 9: Preflight and Provenance Capture

**Files:**
- Create: `spikes/as-02/src/preflight.mjs`
- Create: `spikes/as-02/tests/preflight.test.mjs`
- Modify: `spikes/as-02/PROVENANCE.md`

**Interfaces:**

```js
runPreflight({ repositoryPath, runner, env }) -> Promise<PreflightReport>
classifyPreflight(report) -> 'READY' | 'BLOCKED_BY_HOST_POLICY' | 'PREFLIGHT_FAILED'
```

- [ ] **Step 1: Write failing preflight tests**

Assert observation of:

- `/proc/version`, `WSL_DISTRO_NAME`, `uname -a`, `/etc/os-release`;
- Node/npm/Pi/Treehouse versions;
- `bwrap`, `socat`, `rg`, `git`, `bash`, `curl`, `node` and `/usr/bin/time` availability;
- `SandboxManager.checkDependenciesAsync()` output when the package is installed;
- `kernel.apparmor_restrict_unprivileged_userns`, `kernel.unprivileged_userns_clone` and architecture;
- repository realpath is not under `/mnt`;
- Docker socket presence without opening it;
- no preflight command mutates host policy;
- missing primitives yield `BLOCKED`, not skip/pass.

- [ ] **Step 2: Verify RED**

Expected failure: preflight exports are missing.

- [ ] **Step 3: Implement preflight**

All commands use argument arrays and `shell:false`. Store full command outputs in the runtime artifact directory and put only bounded summaries in `environment.json`.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/src/preflight.mjs spikes/as-02/tests/preflight.test.mjs spikes/as-02/PROVENANCE.md
git commit -m "feat: add AS-02 host preflight"
```

### Task 10: S1–S13 Scenario Definitions and Orchestrator

**Files:**
- Create: `spikes/as-02/src/scenario-runner.mjs`
- Create: `spikes/as-02/scenarios/filesystem.mjs`
- Create: `spikes/as-02/scenarios/network.mjs`
- Create: `spikes/as-02/scenarios/sockets.mjs`
- Create: `spikes/as-02/scenarios/policy-integrity.mjs`
- Create: `spikes/as-02/scenarios/toolchain.mjs`
- Create: `spikes/as-02/scenarios/child-process.mjs`
- Create: `spikes/as-02/scenarios/fail-closed.mjs`
- Create: `spikes/as-02/tests/scenarios.test.mjs`

**Interfaces:**

```js
scenarioDefinitions(context) -> ScenarioDefinition[]
runScenario(definition, context) -> Promise<ScenarioEvidence>
runSecuritySuite(context) -> Promise<ScenarioEvidence[]>
```

A definition contains controlled argv, expected enforcement class, trusted before/after observations, timeout and evaluation function.

- [ ] **Step 1: Write failing matrix tests**

Assert exact S1–S13 coverage, unique IDs, no command targets an uncontrolled real-user path, and every deny scenario requires both blocked process behavior and unchanged trusted digests.

- [ ] **Step 2: Write failing evaluator tests**

Prove each material bypass maps to a named failure:

```text
FILESYSTEM_POLICY_BYPASS
NETWORK_POLICY_BYPASS
SOCKET_POLICY_UNSUPPORTED or socket bypass
POLICY_HASH_MISMATCH
TOOLCHAIN_INCOMPATIBLE
SECURITY_VIOLATION_NOT_OBSERVABLE
FAIL_OPEN_DETECTED
```

- [ ] **Step 3: Verify RED**

Expected failure: scenario modules do not exist.

- [ ] **Step 4: Implement scenarios**

S4 uses only `/mnt/c/mnfs-as-02/<run-id>`. S5 covers HTTP, HTTPS, raw TCP and DNS-dependent access. S6 uses `registry.npmjs.org` and an undeclared target without credentials or mutation. S7 performs safe unauthenticated GitHub reads and always records that domain allowlisting is not mutation authority. S8 tests controlled Unix socket and Docker socket only when present. S10 uses `GIT_OPTIONAL_LOCKS=0 git --no-optional-locks status --short` plus Node/npm/TypeScript/tests. S11 repeats deny probes in child Node and shell processes. S12 records SRT violation diagnostics or bounded stderr plus target integrity. S13 uses an injected initialization failure and verifies absence of a normally allowed sentinel side effect.

- [ ] **Step 5: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/src/scenario-runner.mjs spikes/as-02/scenarios spikes/as-02/tests/scenarios.test.mjs
git commit -m "feat: define AS-02 security scenarios"
```

### Task 11: Performance, Restart and CLI Workflow

**Files:**
- Create: `spikes/as-02/src/performance.mjs`
- Create: `spikes/as-02/src/restart.mjs`
- Create: `spikes/as-02/src/cli.mjs`
- Create: `spikes/as-02/tests/performance.test.mjs`
- Create: `spikes/as-02/tests/restart.test.mjs`
- Create: `spikes/as-02/tests/cli.test.mjs`

**Interfaces:**

```js
summarizeSamples(samples) -> { count, minMs, p50Ms, p95Ms, maxMs, meanMs }
createRestartCheckpoint(context) -> Promise<RestartCheckpoint>
verifyRestartCheckpoint(checkpoint, context) -> Promise<RestartObservation>
runCli(argv, dependencies) -> Promise<number>
```

- [ ] **Step 1: Write failing performance tests**

Assert deterministic percentile selection, five warm-ups excluded, configured sample counts `20/20/10/5`, baseline and sandbox labels, initialization separated from command cost, and no invented pass threshold.

- [ ] **Step 2: Write failing restart tests**

Assert checkpoint includes policy hash, dependency versions, WSL identity, fixture manifest digest and representative scenario digests. Mutation, version drift or policy drift yields `RESTART_DRIFT`.

- [ ] **Step 3: Write failing CLI tests**

Cover strict commands:

```text
preflight
run
restart-prepare
restart-resume --checkpoint <absolute-path>
report --run <run-id>
cleanup --run <run-id>
```

Reject unknown commands, duplicate flags, relative checkpoint paths, unsafe run IDs and automatic WSL restart attempts.

- [ ] **Step 4: Verify RED**

Expected failure: modules and CLI are missing.

- [ ] **Step 5: Implement modules and workflow**

`restart-prepare` prints the exact operator steps:

```text
From Windows PowerShell: wsl --terminate <captured-distro-name>
Reopen Ubuntu.
cd <repository-path>
npm run as02 -- restart-resume --checkpoint <absolute-checkpoint-path>
```

It must not execute these commands.

- [ ] **Step 6: Verify GREEN and commit**

```bash
npm run test:as02
npm run verify
git add spikes/as-02/src/performance.mjs spikes/as-02/src/restart.mjs spikes/as-02/src/cli.mjs spikes/as-02/tests/performance.test.mjs spikes/as-02/tests/restart.test.mjs spikes/as-02/tests/cli.test.mjs
git commit -m "feat: add AS-02 execution workflow"
```

### Task 12: Install Exact Spike Dependencies and Run the Real WSL2 Proof

**Files:**
- Create: `spikes/as-02/package-lock.json`
- Create: `spikes/as-02/pi-extension/package-lock.json`
- Create: runtime evidence outside Git under `${MNFS_HOME}/artifacts/as-02/<run-id>/`

**Interfaces:**
- This task is executed on the Operator's canonical Ubuntu WSL2 checkout.
- No host-setting change is automated.

- [ ] **Step 1: Synchronize the spike branch in Ubuntu WSL2**

```bash
cd ~/src/mnfs
git fetch origin
git switch spike/as-02-local-sandbox
git pull --ff-only origin spike/as-02-local-sandbox
node --version
npm --version
```

Expected Node: `v24.18.0` or newer supported v24.

- [ ] **Step 2: Generate exact nested lockfiles without broad version ranges**

```bash
npm install --prefix spikes/as-02 --package-lock-only --ignore-scripts --save-exact
npm install --prefix spikes/as-02/pi-extension --package-lock-only --ignore-scripts --save-exact
npm ci
npm run verify
```

Inspect lockfile package names, versions, integrity and install scripts before executing SRT.

- [ ] **Step 3: Run non-mutating preflight**

```bash
npm ci --prefix spikes/as-02 --ignore-scripts
npm run as02 -- preflight
```

Stop with `BLOCKED_BY_HOST_POLICY` if Bubblewrap/user namespace/AppArmor primitives are unavailable. Do not change host policy automatically.

- [ ] **Step 4: Execute phase one**

```bash
npm run as02 -- run
```

Expected outputs include run ID, artifact root, policy hash, Treehouse leased path, S1–S14 results and restart checkpoint path.

- [ ] **Step 5: Perform the operator-assisted WSL restart**

Use only the exact command printed by `restart-prepare`, reopen Ubuntu and run `restart-resume` with the absolute checkpoint path.

- [ ] **Step 6: Generate final report**

```bash
npm run as02 -- report --run <run-id>
```

Inspect raw scenario outputs, protected-resource digests, policy hash, violations, performance and restart drift before accepting the computed Verdict.

- [ ] **Step 7: Commit only lockfiles and selected promoted evidence**

Do not commit raw sentinels, unrestricted logs, runtime databases or the full runtime artifact directory.

### Task 13: Promote Evidence, Recalculate Coverage and Prepare Review

**Files:**
- Create: `docs/acceptance/2026-08-02-as-02-local-pi-sandbox-wsl2.md`
- Modify: `docs/adr/0006-security-planes-and-local-execution-isolation.md`
- Modify: `docs/capabilities/CAP-EXECUTION/TRACEABILITY.json`
- Regenerate: `docs/capabilities/CAP-EXECUTION/COVERAGE.md`
- Modify: `docs/tooling-adoption.md`
- Modify: `docs/tracking/STATUS.md`
- Modify: `docs/tracking/WORKLOG.md`
- Modify: PR #13 body

- [ ] **Step 1: Write the acceptance report from raw evidence**

Record exact environment, dependency versions, policy hash, source integrity, S1–S15 outcomes, performance, bypass analysis, limitations, adapter recommendation, upgrade/disable/removal procedure and computed Verdict. Distinguish observed facts from inference.

- [ ] **Step 2: Update ADR-0006 evidence without rewriting the accepted decision**

Append validation evidence and the candidate disposition. A semantic decision change requires a new superseding ADR rather than editing the original outcome.

- [ ] **Step 3: Update requirement traceability mechanically**

For `CAP-EXEC-REQ-010` through `013`, add exact evidence references and set state according to the actual Verdict. Do not promote R4 solely because AS-02 passed; the approved MIS-002 schema v2 Replan remains required.

- [ ] **Step 4: Regenerate and verify docs**

```bash
npm run docs:generate
npm run docs:coverage
npm run verify
git diff --check
git diff --name-only main...HEAD
git hash-object .mnfs/missions/MIS-002/plan.json
```

Historical blob must remain:

```text
6b79117fe66cd5c9c8142099828812f470ce20de
```

- [ ] **Step 5: Adversarial review**

Inspect for:

- real credential access;
- uncontrolled `/mnt/c` targets;
- host fallback;
- broad environment inheritance;
- shell interpolation of untrusted values;
- writable active policy or extension;
- unprotected Git common dir;
- model-authored Verdict;
- missing raw evidence;
- accidental M2 implementation;
- accidental MIS-002 revision 3 mutation.

- [ ] **Step 6: Update PR #13**

Keep the PR draft until the current head is green and real WSL2 evidence is complete. Issue #8 closes only after integration of an accepted or explicitly rejected/blocked spike result with evidence.

---

## Plan Self-Review

- Every design deliverable maps to a task.
- S1–S15 all have implementation and proof owners.
- Deterministic CI and real WSL2 proof are explicitly separated.
- Treehouse, Pi, SRT, broker, policy, evidence and report boundaries have named interfaces.
- No task authorizes host-policy weakening, real credential reads, unrestricted fallback, M2 implementation or MIS-002 mutation.
- `ACCEPT`, `ACCEPT_WITH_LIMITATIONS`, `REJECT` and `BLOCKED` are computed from evidence rather than selected manually.
- The plan contains no unresolved placeholders.
