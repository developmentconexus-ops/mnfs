---
id: DESIGN-AS-02-LOCAL-PI-SANDBOX-WSL2
title: AS-02 Local Pi Sandbox on WSL2 Design
document_type: microdesign
form: explanation
authority: specification
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-12
  - ADR-0006
  - CAP-EXECUTION
tracking_issue: 8
---

# AS-02 — Local Pi Sandbox on WSL2

## 1. Decision summary

AS-02 will test whether the following composition is a sufficient local E1 execution boundary for the fixed M2 Worker slice:

```text
Pi host process
+ built-in tools disabled
+ first-party brokered Pi tools
+ @anthropic-ai/sandbox-runtime 0.0.67
+ Treehouse worktree
+ Ubuntu on WSL2
```

The selected candidate keeps the Pi/model-provider process in the trusted host plane while all repository-facing tool operations execute through the sandbox runtime. The spike will also prove why the upstream Pi example that overrides only `bash` is not, by itself, a complete Worker boundary: Pi also exposes native `read`, `write`, `edit`, `grep`, `find`, and `ls` tools unless they are disabled or replaced.

AS-02 is an architecture spike. It may recommend an adapter and policy, but it must not implement the production M2 Worker, approve a new Mission Plan, mutate `MIS-002` revision 3, or unblock M2 automatically.

## 2. Problem

A Treehouse worktree separates source trees. WSL2 provides the canonical Linux runtime. Neither one prevents a Worker process from:

- reading credentials from the WSL user home;
- reading or writing Windows host mounts;
- writing outside its worktree;
- connecting to the network;
- reaching Docker or other privileged Unix sockets;
- modifying Git configuration, hooks, `.pi`, `.mnfs`, or the active policy;
- spawning children that escape the intended restrictions;
- continuing unrestricted when sandbox startup fails.

ADR-0006 therefore requires an E1 boundary with OS-level enforcement, write allowlists, sensitive-read denial, network denied by default, no credentials, protected policy, and fail-closed startup.

## 3. Goals

1. Execute the Issue #8 S1–S15 scenarios on the real canonical Ubuntu WSL2 environment.
2. Use only synthetic sentinel secrets and disposable fixtures.
3. Verify filesystem, network, socket, process-tree, policy-integrity, fail-closed, restart, compatibility, and performance behavior.
4. Produce machine-readable raw evidence plus a human acceptance report.
5. Compare the upstream Pi `bash`-only sandbox pattern against a complete brokered-tools pattern.
6. Produce one explicit decision: `ACCEPT`, `ACCEPT_WITH_LIMITATIONS`, `REJECT`, or `BLOCKED`.
7. Recommend the smallest viable `ProcessSandboxAdapter` boundary for M2.
8. Document upgrade, disable, rollback, and removal conditions.

## 4. Non-goals

- No production Worker orchestration.
- No Attempt, Worker Run, Claim, Receipt, Gate, or recovery implementation.
- No production credentials or real provider mutation.
- No remote sandbox, Dev Container engine, VM, or microVM integration.
- No generic policy DSL.
- No automatic host security weakening.
- No automatic `sudo`, `sysctl`, AppArmor modification, WSL restart, or Windows command execution.
- No modification of `.mnfs/missions/MIS-002/plan.json`.
- No conclusion that WSL2, a worktree, a prompt, or a Pi extension is independently sufficient isolation.

## 5. Fixed constraints

- Canonical runtime: Ubuntu under WSL2.
- Repository and all disposable repositories must live on the Linux filesystem, never under `/mnt/c`.
- Supported Node.js floor remains `24.18.0`.
- `@anthropic-ai/sandbox-runtime` is pinned exactly to `0.0.67` for this spike.
- The Sandbox Runtime remains a Beta Research Preview; the spike must treat its API and behavior as candidate evidence, not a permanent platform guarantee.
- Linux dependencies are `bubblewrap`, `socat`, and `ripgrep`.
- Ubuntu 24.04 user-namespace/AppArmor restrictions must be observed and reported. The harness must not disable them automatically.
- The Pi version used by the real test must be captured exactly from the installed WSL environment.
- Third-party source references must record version or commit, license, checksum/lockfile, and reviewed capabilities.
- All deny tests operate on controlled synthetic fixtures. No real SSH key, cloud credential, kubeconfig, browser data, password-manager socket, or user `.env` is opened.
- Sandbox initialization failure must prevent the candidate tool action from running.
- A test may report `BLOCKED_BY_HOST_POLICY`; it must never silently retry outside the sandbox.

## 6. Options considered

### 6.1 Run the entire Pi process inside Sandbox Runtime

**Advantage:** one process-tree boundary includes Pi and its tools.

**Problem:** the Pi process needs model-provider authentication and usually provider network access. Giving the same process credentials and provider egress weakens the isolation that should protect those credentials from agent-directed tools. Separating model communication from tool execution becomes difficult.

**Disposition:** not selected for M2.

### 6.2 Use the upstream Pi example that overrides only `bash`

**Advantage:** minimal integration and a useful reference implementation.

**Problem:** Pi can still expose native filesystem tools. Sandboxing `bash` alone does not prove that `read`, `write`, `edit`, `grep`, `find`, and `ls` use the same OS boundary. The example also allows a `--no-sandbox` switch and records initialization failure without itself defining an MNFS fail-closed Worker transition.

**Disposition:** retain as an adversarial comparison, not as the accepted E1 design.

### 6.3 Disable built-ins and register first-party brokered tools

Pi starts with `--no-builtin-tools`. A reviewed first-party extension registers only the tool surface required by the spike. Every repository-facing operation is executed through a helper process launched by Sandbox Runtime under the frozen policy.

**Advantages:**

- model/provider authentication remains in the trusted Pi process;
- ordinary tool actions do not inherit full WSL user authority;
- the active tool inventory is explicit;
- policy hash, cwd, environment, command arguments, and evidence can be bound at one broker boundary;
- the extension can fail closed before a tool action exists;
- later M2 code can consume a narrow adapter rather than a third-party policy DSL.

**Cost:** the extension is trusted first-party code and must be small, pinned, reviewed, and kept outside Worker write authority.

**Disposition:** selected candidate.

## 7. Architecture

```text
Operator
  |
  v
AS-02 orchestrator --------------------------+
  |                                           |
  | creates fixture + policy                  | writes raw evidence
  v                                           v
Disposable Git repository               artifacts/as-02/<run-id>/
  |
  v
Treehouse leased worktree
  |
  +------------------- allowed write root
  |
Trusted Pi host process
  |  --no-builtin-tools
  |  exact extension path outside worktree write authority
  v
First-party AS-02 Pi extension
  |
  | validates frozen policy hash
  | validates cwd and environment allowlist
  | registers brokered tools only after sandbox initialization
  v
Sandbox Runtime 0.0.67
  |
  | bubblewrap + network namespace + proxy + seccomp where available
  v
Broker helper process and child process tree
  |
  v
Worktree / controlled temp only
```

### 7.1 Trusted plane

The following components are trusted for the spike:

- AS-02 orchestrator;
- frozen effective policy;
- first-party Pi extension;
- broker helper executable;
- installed Pi runtime;
- Sandbox Runtime package and lockfile;
- Treehouse adapter/CLI;
- operating-system sandbox primitives.

The disposable repository content, test prompts, child processes, generated files, and sentinel paths are untrusted test inputs.

### 7.2 Extension boundary

The extension must:

1. load policy from a path outside the worktree write roots;
2. canonicalize and hash policy content before initialization;
3. initialize Sandbox Runtime exactly once per Pi process;
4. register no brokered tools until initialization succeeds;
5. expose the effective policy hash and active tool inventory as evidence;
6. reject a cwd outside the leased worktree;
7. pass argument arrays rather than interpolated shell strings where the operation permits;
8. provide an explicit error when the sandbox is unavailable;
9. reset Sandbox Runtime on clean shutdown without treating cleanup failure as successful execution;
10. never implement a fallback that executes directly on the host.

The spike extension is not production code. Its purpose is to validate the adapter shape and boundary.

### 7.3 Brokered tool surface

The prototype tool set is intentionally small:

```text
bash
read
write
edit
grep
find
ls
```

Pi built-ins are disabled. The extension registers replacement tools with the same user-facing purposes. Their implementations call a controlled helper process inside the sandbox rather than calling unrestricted Node filesystem APIs from the trusted extension.

`bash` remains necessary for development workflows, but execution uses an explicit cwd, constrained environment, no credentials, and the Sandbox Runtime process-tree boundary.

### 7.4 Evidence boundary

The sandboxed Worker cannot write its own final Verdict. Raw outputs are captured by the trusted orchestrator into a run directory outside Worker write authority:

```text
artifacts/as-02/<run-id>/
  environment.json
  provenance.json
  policy.json
  policy.sha256
  scenarios.json
  commands/
  performance.json
  restart-before.json
  restart-after.json
  report.md
```

A scenario record contains:

```ts
interface ScenarioEvidence {
  scenarioId: string;
  startedAt: string;
  finishedAt: string;
  command: string[];
  cwd: string;
  expected: 'ALLOW' | 'DENY' | 'FAIL_CLOSED' | 'OBSERVE';
  exitCode: number | null;
  signal: string | null;
  stdoutRef: string;
  stderrRef: string;
  observedFilesystem: Record<string, string>;
  policyHash: string;
  result: 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE';
  rationale: string;
}
```

The human report is derived from these records. It cannot replace missing raw evidence.

## 8. Repository layout

```text
spikes/as-02/
  README.md
  package.json
  package-lock.json
  PROVENANCE.md
  policies/
    network-off.json
    narrow-network.json
  src/
    cli.mjs
    preflight.mjs
    fixture.mjs
    treehouse.mjs
    policy.mjs
    sandbox-runner.mjs
    scenario-runner.mjs
    evidence.mjs
    performance.mjs
    restart.mjs
    report.mjs
  broker/
    package.json
    index.mjs
    operations.mjs
  pi-extension/
    package.json
    package-lock.json
    src/index.ts
  scenarios/
    filesystem.mjs
    network.mjs
    sockets.mjs
    policy-integrity.mjs
    toolchain.mjs
    child-process.mjs
    fail-closed.mjs
    performance.mjs
  tests/
    preflight.test.mjs
    policy.test.mjs
    evidence.test.mjs
    fail-closed.test.mjs
    report.test.mjs
```

Selected evidence and the final acceptance report will be promoted under:

```text
docs/acceptance/2026-08-02-as-02-local-pi-sandbox-wsl2.md
```

Generated raw artifacts remain outside canonical documentation unless the report explicitly promotes a small fixture or checksum.

## 9. Fixture design

Each run creates a new temporary root under the Linux filesystem:

```text
/tmp/mnfs-as-02/<run-id>/
  source-repo/
  treehouse/
  fake-home/
  outside-write-root/
  active-policy/
  runtime-artifacts/
  controlled-sockets/
```

The fixture creates all protected files before Sandbox Runtime initialization because Linux bind-mount protection cannot reliably deny creation of every non-existent mandatory path.

Synthetic sentinels include:

```text
fake-home/.ssh/id_ed25519
fake-home/.aws/credentials
fake-home/.config/gcloud/application_default_credentials.json
fake-home/.kube/config
fake-home/.env
outside-write-root/host-sentinel.txt
source-repo/.mnfs/protected.json
source-repo/.pi/security.json
source-repo/.git/config
source-repo/.git/hooks/pre-commit
active-policy/e1-policy.json
```

Each sentinel contains a unique run-specific marker. The harness checks both content confidentiality and post-run integrity without printing sentinel contents into normal logs.

The environment passed to sandboxed processes uses `HOME=<fake-home>` and an explicit allowlist. The actual user HOME is never a test target.

## 10. Proposed E1 spike policy

### 10.1 Filesystem

Read policy uses broad deny regions with explicit re-allow of required locations:

```text
denyRead:
  - fake HOME root
  - /mnt
  - runtime state outside the run artifact references
  - active policy root

allowRead:
  - leased worktree
  - broker helper
  - required system and toolchain paths
  - controlled attempt temp
```

Write policy is allow-only:

```text
allowWrite:
  - leased worktree
  - controlled attempt temp

explicit denyWrite:
  - active policy
  - .mnfs
  - .pi
  - .git/config
  - .git/hooks
  - sentinel .env
  - outside-write-root
```

No write access is granted to package-manager global directories, the real user home, `/mnt`, `/usr`, `/etc`, or the MNFS operational SQLite location.

### 10.2 Network

Default policy:

```json
{
  "allowedDomains": [],
  "deniedDomains": [],
  "allowLocalBinding": false
}
```

The narrow-network scenario uses an explicit small allowlist and a separate policy hash. The test proves connectivity only to the declared target and continued denial elsewhere. It does not claim that a domain allowlist provides method-, account-, repository-, or mutation-level authority.

GitHub broad access is analyzed without credentials and without mutation. The conclusion is expected to remain: allowing `github.com` broadly is not sufficient write safety because domain filtering does not distinguish documentation reads from pushes, issues, gists, or uploads.

### 10.3 Unix sockets

Unix sockets remain denied by default. On supported Linux architectures, the Sandbox Runtime seccomp filter is expected to block `AF_UNIX` socket creation. The spike records architecture, seccomp availability, warnings, and behavior.

The Docker socket, when present, is never opened successfully. If it does not exist, the harness creates a controlled Unix socket with the same class of access and marks Docker-specific evidence as `NOT_PRESENT` rather than claiming a direct Docker proof.

### 10.4 Environment and credentials

The sandboxed process receives a constructed environment allowlist, not `process.env` wholesale. It contains only the values required for the fixture and toolchain, such as:

```text
PATH
HOME=<fake-home>
TMPDIR=<controlled temp>
LANG
LC_ALL
NODE_OPTIONS only when explicitly required
```

Provider tokens, SSH agent variables, cloud variables, Docker variables, browser variables, Windows interop variables, and arbitrary user variables are excluded.

## 11. Scenario matrix

| Scenario | Proof | Expected result |
|---|---|---|
| S1 Worktree write | Create and modify a file inside leased worktree | Allowed; exact content observed |
| S2 Host write escape | Write to outside-write-root and real parent paths | Denied; target unchanged |
| S3 Credential read | Read synthetic `.ssh`, `.aws`, gcloud, kube, `.env` sentinels | Denied; marker absent from stdout/stderr |
| S4 Windows mounts | Read and write under `/mnt/c` | Denied by default; no mutation |
| S5 Network default | HTTP, HTTPS, raw TCP, DNS-dependent request | Denied |
| S6 Narrow allowlist | Reach one declared domain and reject an undeclared domain | Declared succeeds, undeclared fails |
| S7 Broad provider risk | Inspect broad GitHub domain allowance without credentials | Classified insufficient for mutation authority |
| S8 Unix sockets | Create/connect controlled socket and reach Docker socket when present | Denied or sandbox marked unsupported |
| S9 Policy tamper | Modify policy, `.mnfs`, `.pi`, Git config/hooks, sentinel `.env` | Denied; hashes unchanged |
| S10 Toolchain | `git status`, Node, npm, TypeScript, tests, file tools | Succeeds inside worktree |
| S11 Child process | Parent spawns Node/shell children that repeat deny tests | Restrictions propagate |
| S12 Violation observability | Capture exit, stderr, optional `strace`, target integrity | Sufficient diagnosis recorded |
| S13 Fail closed | Invalid/missing sandbox primitive or deliberately invalid configuration | Tool does not run; sentinel side effect absent |
| S14 Performance | Baseline versus sandbox spawn and test commands | p50/p95/max and overhead recorded |
| S15 Restart | New process and operator-assisted WSL restart checkpoint | Same policy hash and outcomes or explicit drift |

### 11.1 Pi comparison proof

Two Pi configurations are tested:

**Configuration A — upstream-equivalent `bash` override**

- built-in tool inventory is recorded;
- the test proves that native non-bash tools remain present unless disabled or overridden;
- this configuration cannot receive an E1 acceptance Verdict.

**Configuration B — brokered tools**

```text
pi --no-builtin-tools --no-extensions -e <exact-extension-path>
```

- only the reviewed extension tools are active;
- each tool binds to the same policy hash and leased cwd;
- absence or failure of the extension leaves no repository-facing tool available;
- functional scenarios are repeated through this configuration.

Model behavior is not the sole proof. Deterministic harness calls, tool inventory, side-effect inspection, and OS results remain authoritative.

## 12. Fail-closed design

The fail-closed scenario deliberately supplies an invalid Sandbox Runtime dependency path or a configuration that cannot initialize. The candidate tool action attempts to create a unique sentinel inside the normally allowed worktree.

Acceptance requires:

```text
sandbox initialization fails
AND brokered tool is not registered or refuses execution
AND sentinel is not created
AND result is SANDBOX_UNAVAILABLE or equivalent named failure
```

Any direct host fallback is an immediate `REJECT`.

A `--no-sandbox` convenience flag is not part of the accepted Worker invocation. Disablement is an operator diagnostic procedure only and must not share the production Worker command path.

## 13. Performance method

Performance is measured rather than assumed.

### 13.1 Samples

- 5 warm-up runs excluded from statistics;
- 20 measured runs for trivial spawn;
- 20 measured runs for a Node command;
- 10 measured runs for a filesystem-heavy fixture command;
- 5 measured runs for `npm run typecheck` or the fixed spike test suite;
- baseline and sandbox run on the same fixture, process state, and WSL session.

### 13.2 Metrics

- wall-clock duration;
- p50, p95, min, max;
- process exit and signal;
- maximum resident set size when `/usr/bin/time -v` is available;
- initialization cost separated from per-command cost;
- repeated-execution behavior;
- report size and diagnostic cost.

The report will not invent a pass threshold absent product evidence. Large overhead, unstable tail latency, or required broad exceptions can produce `ACCEPT_WITH_LIMITATIONS` or `REJECT` with explicit rationale.

## 14. Restart proof

Restart proof has two levels.

### 14.1 New-process restart

The harness completes phase one, exits, then a fresh Node/Pi process:

- reloads the same frozen policy;
- recomputes the same policy hash;
- reconstructs fixture references from a checkpoint file;
- repeats representative allow/deny/fail-closed scenarios.

### 14.2 WSL restart

A WSL distribution restart cannot be safely initiated by the sandboxed test process. The harness therefore emits an exact checkpoint command and stops.

The Operator runs the documented Windows-side WSL restart, reopens Ubuntu, and executes the phase-two command. Phase two verifies:

- WSL distribution and kernel identity;
- policy and dependency versions;
- fixture/checkpoint integrity;
- representative S1, S3, S5, S9, S11, and S13 outcomes;
- drift from phase one.

The report distinguishes process restart proof from full WSL restart proof.

## 15. Error handling and classifications

Named outcomes:

```text
PREFLIGHT_FAILED
BLOCKED_BY_HOST_POLICY
SANDBOX_UNAVAILABLE
POLICY_HASH_MISMATCH
WORKTREE_IDENTITY_MISMATCH
TREEHOUSE_UNAVAILABLE
TOOLCHAIN_INCOMPATIBLE
SECURITY_VIOLATION_NOT_OBSERVABLE
NETWORK_POLICY_BYPASS
FILESYSTEM_POLICY_BYPASS
SOCKET_POLICY_UNSUPPORTED
FAIL_OPEN_DETECTED
RESTART_DRIFT
```

A missing prerequisite is not converted to a passing skip. The report uses `BLOCKED` or `INCONCLUSIVE` and names the missing proof.

## 16. Acceptance decision

### 16.1 `ACCEPT`

All required deny scenarios pass, common M2 toolchain commands work, child restrictions propagate, policy hashes remain stable, socket enforcement is supported and proven, fail-closed is proven, restart proof is complete, and limitations do not require broad exceptions that invalidate E1.

### 16.2 `ACCEPT_WITH_LIMITATIONS`

No material bypass or fail-open exists, but M2 must adopt explicit constraints such as:

- one supported WSL/Ubuntu/architecture combination;
- a pinned Sandbox Runtime version;
- mandatory host preflight;
- limited toolchain or cache roots;
- `strace`-assisted diagnostics;
- no GitHub/provider egress;
- no unsupported socket architecture;
- revalidation on Pi/Sandbox Runtime upgrade.

Every limitation becomes policy or an M2 entry criterion.

### 16.3 `REJECT`

Any of the following is sufficient:

- protected sentinel read succeeds;
- write escapes allowed roots;
- network bypass succeeds;
- Docker/privileged socket access succeeds;
- active policy can be modified;
- a child process escapes;
- sandbox failure executes on host;
- ordinary M2 toolchain requires exceptions that materially collapse the boundary;
- restart changes effective policy without detection.

### 16.4 `BLOCKED`

The canonical WSL2 host lacks required primitives or host policy prevents meaningful execution, and no approved adjustment has been made. `BLOCKED` does not authorize unrestricted M2 execution.

## 17. Upgrade, disable, rollback, and removal

### Upgrade

Any change to Pi, Sandbox Runtime, Ubuntu/WSL kernel, Bubblewrap, Socat, seccomp behavior, extension code, broker helper, or policy requires:

1. new provenance record;
2. new policy/extension hash;
3. rerun of all security scenarios;
4. performance comparison;
5. explicit acceptance update.

No automatic dependency range is used. The lockfile records exact transitive versions.

### Disable

The diagnostic harness may disable the candidate only to prove comparison or cleanup. Production M2 Worker dispatch must treat disabled/unavailable E1 as blocked.

### Rollback

Rollback restores the last accepted exact dependency and policy hashes, reruns preflight and a representative proof set, and records the rollback in the acceptance report.

### Removal conditions

Replace or remove the candidate when:

- a material bypass is found;
- WSL2 support remains unstable;
- the common toolchain needs broad filesystem/network/socket exceptions;
- violations cannot be diagnosed sufficiently;
- Pi or Sandbox Runtime upgrades repeatedly break the boundary;
- an alternative adapter demonstrates lower risk and complexity;
- the product moves to an environment requiring a stronger E3/E4 boundary.

## 18. Testing strategy

Behavior changes follow TDD.

Automated repository tests cover deterministic harness logic without requiring WSL sandbox primitives:

- policy normalization and hashing;
- environment allowlist construction;
- sentinel redaction;
- evidence schema;
- report derivation;
- fail-closed wrapper logic using injected runners;
- missing prerequisite classification;
- restart checkpoint integrity.

Real AS-02 tests run only on the canonical WSL2 host. They are not replaced by GitHub Actions because the spike specifically evaluates WSL2 behavior.

GitHub Actions continues to run the normal repository `npm run verify` gate and deterministic spike tests. The WSL2 report records separately executed environment evidence.

## 19. Deliverables

1. Spike harness under `spikes/as-02/`.
2. Exact dependency lockfiles and provenance.
3. Proposed E1 policies.
4. Brokered Pi extension prototype.
5. S1–S15 machine-readable evidence.
6. Performance measurements.
7. WSL restart checkpoint evidence.
8. Bash-only bypass/coverage analysis.
9. Final WSL2 acceptance report.
10. Adapter recommendation for M2.
11. ADR-0006 evidence linkage.
12. CAP-EXECUTION traceability/coverage update.
13. Project status and worklog update.
14. Draft PR for review; no Issue #8 closure until real WSL2 acceptance evidence is complete.

## 20. Documentation and requirements impact

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - DESIGN-AS-02-LOCAL-PI-SANDBOX-WSL2
    - EVID-AS-02-LOCAL-PI-SANDBOX-WSL2
    - ADR-0006
    - CAP-EXECUTION/TRACEABILITY.json
    - CAP-EXECUTION/COVERAGE.md
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
  rationale: "AS-02 establishes evidence for or against the proposed E1 local execution boundary."
  follow_up: null

requirements_impact:
  status: UPDATED
  affected:
    - CAP-EXEC-REQ-010
    - CAP-EXEC-REQ-011
    - CAP-EXEC-REQ-012
    - CAP-EXEC-REQ-013
  rationale: "These requirements are blocked specifically on AS-02 security and fail-closed evidence."
```

## 21. Source review basis

Primary references reviewed for this design:

- Anthropic Sandbox Runtime repository and package documentation: Linux uses Bubblewrap, network namespaces/proxies, write allowlists, read deny/allow precedence, seccomp-based Unix-socket restrictions on supported architectures, and manual `strace`-based violation diagnosis on Linux.
- Sandbox Runtime package version `0.0.67`, Apache-2.0, Beta Research Preview.
- Pi coding-agent extension documentation: built-in tools are `read`, `bash`, `edit`, `write`, `grep`, `find`, and `ls`; `--no-builtin-tools` disables built-ins while preserving extension tools; extensions can register or override tools and inspect/set active tools.
- Pi sandbox extension example: OS-level sandboxing is demonstrated by replacing `bash`, confirming its value as a pattern and its incompleteness as a full tool boundary unless other native tools are also handled.

Exact URLs, commit identifiers, installed versions, and checksums will be recorded in `spikes/as-02/PROVENANCE.md` during implementation and real execution.

## 22. Open decisions resolved by this design

- The spike will not read real credentials.
- The spike will not automatically weaken AppArmor or user-namespace policy.
- Pi remains in the trusted host plane; repository-facing tools cross a broker boundary.
- Built-in Pi tools are disabled for the accepted candidate.
- A `bash`-only configuration is tested only as an adversarial comparison.
- Raw evidence is written by the trusted orchestrator, not by the sandboxed process.
- Full WSL restart proof is operator-assisted and two-phase.
- No M2 unblock follows automatically from a green spike.
