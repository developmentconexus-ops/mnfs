---
id: DOC-RESEARCH-MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1
title: MNFS Research — Security, Isolation, Environments, Credentials and External Effects
document_type: research_report
form: explanation
authority: research_historical
status: published
source_manifest: MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.sources.json
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1
related:
  - DOC-PRODUCT-BLUEPRINT
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# MNFS Research — Security, Isolation, Environments, Credentials and External Effects

**Status:** Research conclusion proposed for Product Blueprint Section 10  
**Date:** 2026-08-02  
**Scope:** Local Pi-first MNFS, WSL2 execution, future remote workers and software-factory evolution

---

# 1. Executive conclusion

Security in an agentic development harness cannot be represented by a single permission prompt or a single sandbox.

The MNFS needs a layered model:

```text
Domain Authority
→ what the Actor is allowed to decide

Tool Capability
→ which tools and operations are exposed

OS Sandbox
→ what the process can access technically

Execution Environment
→ where code, services and dependencies run

Credential Grant
→ which identity and secrets exist for this run

Network Policy
→ where data may leave

External Effect Gate
→ which mutation may affect shared or production systems
```

These layers are complementary.

```text
approval without sandbox
→ the process may still access too much

sandbox without authority
→ the agent may perform an in-scope but unauthorized external action

worktree without process isolation
→ code is separated, host files and credentials are not

container without credential policy
→ isolated code can still use overpowered secrets

network allowlist without request policy
→ allowed domains may still be used for exfiltration
```

The proposed architecture is:

1. **M2 remains local and Pi-first**, but its Writer must run under a Minimal Local Security Profile.
2. **Pi’s official sandbox extension pattern plus Anthropic Sandbox Runtime is the leading local candidate**, subject to Architecture Spike AS-02 on WSL2.
3. **Dev Containers are adopted as an optional Repository Environment Contract**, not as the sole security boundary.
4. **Daytona is the strongest future Remote Execution Environment candidate** because it already has a Pi extension and explicit per-session sandbox/reconciliation model.
5. **E2B is a candidate for smaller remote execution tasks**, while Ona is primarily a software-development platform reference whose scope overlaps much of MNFS.
6. **Firecracker is a future high-isolation architecture reference**, not a component MNFS should operate directly in the local product.
7. **Credentials are capability grants, not environment variables copied into prompts.** Prefer temporary/federated credentials; inject them only into the process or effect executor that needs them.
8. **External effects require their own lifecycle:** Request → Policy Decision → Credential Grant → Execution → Receipt → Reconcile.
9. **Worker write access to active security policy is forbidden.** Policy may be versioned in Git, but the effective policy must be compiled and frozen outside the Worker’s writable surface.
10. **No Worker has production access by default.**

---

# 2. Market and repository evidence

## 2.1 Pi

Pi deliberately exposes extension points for:

- tool-call interception;
- permission gates;
- protected paths;
- built-in tool overrides;
- OS-level sandboxing;
- custom UI and approvals;
- persisted extension state.

Pi’s own documentation warns that extensions and packages run with full system permissions and may execute arbitrary code. Therefore, third-party extensions are part of the trusted computing base and require source review and version pinning.

Pi also publishes an example sandbox extension that replaces or wraps the built-in Bash tool and uses `@anthropic-ai/sandbox-runtime` with project-level filesystem and network configuration.

### MNFS conclusion

Pi provides the right integration surface.

The MNFS should not create an unrelated command-filtering layer outside Pi while Pi still exposes unrestricted built-in tools.

The security adapter must control the actual tool execution path.

---

## 2.2 Anthropic Sandbox Runtime

`anthropic-experimental/sandbox-runtime` is an OS-level sandbox for arbitrary processes.

On Linux it uses:

- bubblewrap;
- network namespaces;
- proxy-mediated network access;
- seccomp restrictions;
- optional Unix-socket blocking;
- filesystem bind restrictions.

Its security model uses:

- write-deny by default;
- explicit write allowlists;
- network-deny by default;
- explicit domain allowlists;
- protected paths;
- process-tree enforcement.

The project explicitly warns:

- it is a beta research preview;
- broad domain allowlists can still enable exfiltration;
- access to the Docker socket effectively grants host power;
- broad filesystem writes can enable privilege escalation;
- weaker nested-sandbox modes reduce security.

### MNFS conclusion

This is the best local candidate because:

- it is already integrated in a Pi example;
- it works on Linux through bubblewrap;
- it controls the whole process tree;
- it can deny reads of credential directories;
- it can deny all network by default;
- it is replaceable behind an adapter.

It is not accepted automatically.

It requires a WSL2-specific spike and Removal Conditions.

---

## 2.3 Claude Code

Claude Code demonstrates a layered permission architecture:

- read-only operations can be allowed without prompts;
- Bash and writes can require approval;
- allow and deny lists can be configured;
- permission mode can be selected;
- a custom permission-prompt tool can arbitrate calls;
- `bypassPermissions` is documented as requiring a secure environment.

### MNFS conclusion

The useful market pattern is:

```text
permission policy
≠ secure execution environment
```

A no-prompt mode is acceptable only inside a boundary that already limits the process.

MNFS should preserve this separation.

---

## 2.4 OpenAI model guidance and Codex design pattern

OpenAI’s current model guidance recommends defining explicit autonomy and approval boundaries, allowing safe local work while requiring confirmation for external, destructive, costly or scope-expanding actions.

Codex’s broader security architecture also separates sandbox policy from approval policy.

### MNFS conclusion

The external-effect classification should be based on the effect, not the command name.

`curl`, `gh`, `git`, a database client or a browser can each perform read-only or destructive actions.

---

## 2.5 Dev Container Specification

The Dev Container Specification defines structured, version-controlled metadata for repeatable development environments.

It supports:

- images or Dockerfiles;
- Docker Compose;
- lifecycle commands;
- environment variables;
- users;
- workspace mounts;
- side services;
- reusable CLI and CI execution.

Dev Containers are supported by multiple local and cloud development services.

### MNFS conclusion

Dev Containers are valuable for:

- toolchain reproducibility;
- service setup;
- shared local/CI environments;
- onboarding;
- environment-as-code;
- prebuilds.

They are not automatically a strong security boundary.

Risks remain when a container has:

- privileged mode;
- broad host mounts;
- Docker socket access;
- host credentials;
- unrestricted network;
- root execution.

The Repository Profile may bind a Dev Container, but Security Policy remains separate.

---

## 2.6 Daytona

Daytona provides remote sandboxes with:

- isolated filesystem;
- network stack;
- allocated CPU/memory/disk;
- containers and VM classes;
- snapshots;
- persistence;
- network restrictions;
- SDK/API/CLI.

Most importantly for MNFS, Daytona already publishes a Pi extension in which:

- the Pi agent remains on the host;
- built-in tools execute inside one sandbox per Session;
- the sandbox can be resumed with the Session;
- a repository is cloned into the sandbox;
- work can sync to a per-session GitHub branch;
- orphaned sandboxes are reconciled.

### MNFS conclusion

Daytona is the strongest future candidate for:

```text
RemoteExecutionEnvironmentAdapter
```

Reasons:

- direct Pi integration;
- real lifecycle;
- filesystem and command APIs;
- persistent/restartable environments;
- per-session isolation;
- reconciliation pattern;
- container and VM options.

Do not adopt now.

Its current extension also makes choices MNFS must retain authority over, such as per-session branches, automatic pushing and merging.

The MNFS adapter would need narrower semantics.

---

## 2.7 E2B

E2B provides isolated cloud sandboxes with:

- Linux;
- filesystem APIs;
- command execution;
- isolated code execution;
- internet access;
- CI/CD use cases.

### MNFS conclusion

E2B is a candidate for:

- short-lived investigation;
- code execution;
- validation jobs;
- untrusted PR checks;
- narrow remote tools.

It appears less aligned than Daytona with a full persistent software-development workspace and Pi lifecycle, based on the researched materials.

Keep as a future alternative.

---

## 2.8 Ona

Ona provides isolated development environments for humans and agents.

Its model includes:

- Dev Containers;
- persistent environments;
- task-based agents;
- prebuilds;
- policies and command allow/deny lists;
- environments in cloud or customer infrastructure;
- one environment per task/agent.

### MNFS conclusion

Ona is a strong software-factory and platform-engineering reference.

Its scope overlaps:

- environment provisioning;
- agent orchestration;
- automation;
- policies;
- PR delivery;
- management plane.

MNFS should learn from it, but not depend on it as a core runtime.

---

## 2.9 Firecracker

Firecracker provides microVMs that combine hardware virtualization isolation with container-like density.

Its production security model uses:

- KVM boundary;
- seccomp filters;
- cgroups;
- namespaces;
- dropped privileges;
- jailer;
- host-level egress control.

The official design explicitly treats guest code as malicious and notes that Firecracker itself does not filter guest network traffic.

### MNFS conclusion

Firecracker is a future architecture reference for:

- untrusted code;
- multi-tenant cloud;
- high-assurance execution;
- customer-controlled runners.

MNFS should not build or operate its own Firecracker platform in the local roadmap.

Use an established sandbox provider or platform when E4 isolation becomes necessary.

---

# 3. Fundamental distinctions

## 3.1 Worktree isolation

Protects concurrent source changes.

Does not protect:

- host credentials;
- home directory;
- network;
- processes;
- shared database;
- ports;
- Docker daemon;
- Windows files.

## 3.2 Tool permission

Controls whether the agent may invoke a tool or operation.

It may be prompt-, policy- or UI-enforced.

It is not a kernel boundary.

## 3.3 OS sandbox

Restricts what a process tree can read, write, connect to or invoke.

It is technical enforcement.

## 3.4 Reproducible environment

Defines runtimes, tools, services and setup.

Dev Containers primarily solve this concern.

## 3.5 Credential isolation

Controls which identity is available and for how long.

## 3.6 External-effect authority

Controls whether a valid identity may perform a particular mutation.

## 3.7 Environment isolation

Separates processes, filesystem, services and resources between tasks.

---

# 4. Threat model

## 4.1 Initial local assumptions

Trusted:

- Operator;
- MNFS Core release;
- reviewed first-party code;
- WSL2 host owner.

Fallible or potentially untrusted:

- LLM output;
- repository content;
- dependency scripts;
- downloaded documentation;
- issue/PR text;
- tool output;
- third-party Pi extensions;
- generated shell commands;
- external provider responses.

The first local model assumes Workers are fallible rather than intentionally malicious.

However, untrusted repository or web content can cause prompt injection and induce malicious behavior.

## 4.2 Threat classes

```text
T01 accidental host write
T02 secret read/exfiltration
T03 unrestricted network egress
T04 destructive Git operation
T05 shared database contamination
T06 production mutation
T07 malicious dependency install script
T08 compromised Pi extension/package
T09 policy tampering
T10 command injection
T11 Docker socket escape
T12 cross-Track resource collision
T13 untrusted PR/repository execution
T14 credential leakage into logs, prompts or memory
T15 prompt injection from repository/web content
T16 stale or over-broad Credential Grant
T17 sandbox misconfiguration
T18 security bypass through Windows interoperability
T19 supply-chain dependency risk
T20 false belief that container/worktree equals security
```

---

# 5. Proposed security planes

```text
Plane 1 — Domain Authority
Plane 2 — Tool Capability
Plane 3 — Process Sandbox
Plane 4 — Execution Environment
Plane 5 — Credential Broker
Plane 6 — Network/Egress Policy
Plane 7 — External Effect Gate
Plane 8 — Evidence and Reconcile
```

A high-impact operation must pass all applicable planes.

---

# 6. Proposed isolation levels

## E0 — Inspection

Use for:

- Planning;
- read-only Investigation;
- initial Review;
- status;
- documentation analysis.

Properties:

- no repository write;
- network off by default;
- no secrets;
- read scope bounded;
- no external mutation.

## E1 — Local Worktree + OS Sandbox

Default target for local Writers.

Properties:

- Treehouse worktree;
- Pi tool interception;
- OS-level filesystem restrictions;
- write only worktree and explicit temp/runtime paths;
- deny sensitive reads;
- network off by default;
- no production credentials;
- process limits;
- security policy frozen outside writable scope.

## E2 — Dev Container Environment

Use when:

- repository setup is complex;
- multiple services are needed;
- toolchain drift matters;
- local/CI parity is valuable.

Properties:

- repository-defined environment;
- non-root user when possible;
- explicit mounts;
- no host Docker socket by default;
- security policy still enforced separately.

## E3 — Remote Sandbox

Use when:

- code is untrusted;
- many Workers run concurrently;
- local host risk is unacceptable;
- remote services are needed;
- environment needs strong lifecycle and disposal.

Candidates:

- Daytona;
- E2B;
- Ona environment model.

## E4 — Dedicated VM or microVM

Use for:

- multi-tenant execution;
- high-risk untrusted code;
- customer-isolated workloads;
- stronger kernel boundary.

Reference:

- Firecracker-based platforms;
- VM sandbox classes.

Not a local-MVP feature.

---

# 7. WSL2 security position

WSL2 provides a Linux VM boundary from Windows.

It is not a per-Worker sandbox.

WSL commonly allows:

- Windows filesystem mounts;
- Windows executable interoperability;
- user home credentials;
- local sockets;
- host network interactions.

MNFS policy:

- repositories live in the Linux filesystem;
- `/mnt/c` and other host mounts are denied for sandboxed Workers unless explicitly required;
- Windows executables are not part of default Worker capability;
- sensitive home paths are denied;
- WSL is the runtime host, not the security proof.

---

# 8. Local sandbox candidate

Candidate:

```text
Pi sandbox extension pattern
+
@anthropic-ai/sandbox-runtime
```

Required adaptations:

- policy compiled by MNFS;
- active policy stored outside the Worker write-set;
- no project-local policy override by the Worker;
- worktree-specific paths;
- protected `.mnfs`, `.pi`, Git config and hook paths;
- denied host credential paths;
- no Docker socket;
- network off by default;
- violation Events and Receipts;
- adapter capability detection.

Architecture Spike:

```text
AS-02 — Local Pi Sandbox on WSL2
```

The candidate remains optional until the spike passes.

---

# 9. Environment-as-code

Dev Containers should be supported through the Repository Profile.

Possible bindings:

```text
environment.kind = DEV_CONTAINER
configuration = .devcontainer/devcontainer.json
startup = devcontainer up
execute = devcontainer exec
```

MNFS must validate:

- privileged;
- capabilities;
- mounts;
- users;
- environment variables;
- Docker socket;
- lifecycle commands;
- side services;
- host reachability.

A Dev Container can be reproducible and still unsafe.

---

# 10. Credential architecture

## 10.1 Principle

A Worker does not receive “the user’s environment.”

It receives a bounded Credential Grant.

## 10.2 Credential classes

```text
NONE
BUILD_READ
PACKAGE_REGISTRY_READ
TEST_SANDBOX
PROVIDER_SANDBOX
SHARED_NONPROD_READ
SHARED_NONPROD_WRITE
PRODUCTION_READ
PRODUCTION_WRITE
DELIVERY
```

## 10.3 Preferred mechanisms

Priority:

```text
workload identity / OIDC
→ temporary role/session credentials
→ service-account token with narrow vault/resource access
→ encrypted repository secret requiring external key
→ long-lived static secret only when unavoidable
```

## 10.4 Local candidates

### 1Password CLI

Useful for:

- process-scoped secret injection;
- no plaintext in scripts;
- vault-scoped service accounts;
- interactive local use.

### SOPS + age/KMS

Useful for:

- encrypted configuration in Git;
- human-reviewable structure;
- process-scoped decryption through `exec-env` or `exec-file`;
- multiple recipients and key rotation.

Neither becomes mandatory.

Repository Profile selects the binding.

## 10.5 Cloud and CI

Prefer:

- GitHub Actions OIDC;
- cloud workload identity;
- AWS STS or equivalent;
- short-lived job credentials;
- repository/job claims;
- least privilege.

---

# 11. External-effect model

## 11.1 Effect classes

```text
X0 — PURE
     no mutation outside process memory

X1 — LOCAL_REVERSIBLE
     worktree writes, temp files, local tests

X2 — ISOLATED_SANDBOX
     disposable DB/provider sandbox mutation

X3 — SHARED_NONPROD
     shared staging/test systems

X4 — EXTERNAL_REVERSIBLE
     PR, issue comment, branch push, preview deploy

X5 — PRODUCTION_OR_COSTLY
     production write, release, charge, customer message

X6 — DESTRUCTIVE_OR_IRREVERSIBLE
     deletion, destructive migration, credential rotation
```

## 11.2 Policy

The same command may occupy different classes.

Example:

```text
gh pr view
→ X0/X1 read

gh pr create
→ X4

gh release create
→ X5
```

## 11.3 Lifecycle

```text
Effect Request
→ Authority and Policy Decision
→ Credential Grant
→ Execution
→ Effect Receipt
→ Reconcile
```

## 11.4 Production

No general Writer receives production credentials.

Production effects are performed by a separate Effect Executor or Delivery Actor after explicit gate and authority.

---

# 12. Network policy

Default:

```text
deny all
```

Possible modes:

```text
OFF
REGISTRY_ONLY
DOCUMENTATION_READ
PROVIDER_SANDBOX
DECLARED_ALLOWLIST
DELIVERY
```

Domain allowlists are insufficient by themselves.

Allowing a broad service such as GitHub may permit upload to an arbitrary repository.

Future high-risk networking may require:

- method restrictions;
- path/API restrictions;
- proxy inspection;
- request logging;
- egress identity;
- separate Effect Executor.

---

# 13. Policy integrity

Security policy may be versioned in the repository for review.

The effective policy used by a Worker must be:

- resolved before dispatch;
- content-addressed;
- copied outside the Worker write surface;
- referenced by hash;
- immutable for that Attempt.

A Worker may propose a policy change.

It cannot mutate its own active boundary.

Protected examples:

- `.mnfs/repo.json`;
- Approved Contract;
- runtime database;
- active sandbox policy;
- Pi settings/extensions;
- Git config and hooks;
- credentials configuration;
- delivery workflows when outside scope.

---

# 14. Setup and execution phases

A useful market pattern is to separate:

```text
SETUP
→ dependency resolution and environment preparation

AGENT EXECUTION
→ normal implementation with restricted egress

VERIFICATION
→ controlled checks and test credentials

DELIVERY
→ separate authority and credentials
```

Setup may need registry/network access.

It should not automatically receive delivery or production credentials.

Agent Execution should use prepared dependencies where possible.

---

# 15. Prompt injection and untrusted content

Repository files, issues, PRs, web pages, generated logs and dependency documentation are data, not authority.

Controls:

- authoritative instructions come from Role Contract and Current Authority Snapshot;
- untrusted content cannot grant tools or permissions;
- network is off by default;
- external effects require structured request;
- secrets are unavailable to ordinary content-reading Roles;
- suspicious instruction-like content is reported;
- Review and QA start with bounded authoritative packs.

---

# 16. Supply chain

Reference framework:

```text
NIST SSDF 1.1
```

Use as a taxonomy, not an immediate compliance program.

Candidate practices:

- pin Pi packages and extensions;
- review third-party extension source;
- lock dependencies;
- separate trusted setup from untrusted execution;
- inspect install scripts;
- record provenance;
- use vulnerability scanning;
- verify CI token permissions;
- maintain security policy;
- generate SBOM when delivery requirements justify it.

OpenSSF Scorecard can be used as supporting evidence for dependency/project risk.

It is not a universal gate or a replacement for source review.

---

# 17. Architecture Spike AS-02

## 17.1 Objective

Validate local Pi Worker isolation on WSL2 using:

```text
Pi sandbox extension pattern
+
@anthropic-ai/sandbox-runtime
```

## 17.2 Scenarios

1. write inside worktree succeeds;
2. write outside worktree fails;
3. read `~/.ssh`, `~/.aws`, `.kube` and selected Windows paths fails;
4. network is blocked by default;
5. allowed package/documentation domains work only when configured;
6. broad GitHub access is treated as high-risk;
7. Docker socket is inaccessible;
8. protected policy and `.pi` files cannot be changed;
9. Git, Node, npm, TypeScript and test commands still work;
10. Treehouse worktree paths work;
11. child process restrictions propagate;
12. violation is observable;
13. sandbox failure fails closed;
14. performance overhead is measured;
15. WSL reboot and resume behavior are tested.

## 17.3 Acceptance criteria

- all deny tests pass;
- no host secret is readable;
- no write escapes the permitted roots;
- no network bypass is observed in the test set;
- failure of the sandbox never runs the command unsandboxed;
- common MNFS commands remain usable;
- policy is frozen outside Worker control;
- overhead is measured and acceptable;
- disable and fallback behavior are explicit.

## 17.4 Removal conditions

Replace or remove the candidate if:

- WSL2 behavior is unreliable;
- bypasses are found;
- Pi upgrades repeatedly break it;
- common toolchains require unsafe exceptions;
- policy is not inspectable;
- a better local isolation adapter proves lower complexity.

---

# 18. Tool adoption matrix

| Tool/concept | Decision | MNFS role |
|---|---|---|
| Pi permission/tool interception | Adopt | capability enforcement |
| Pi sandbox example | Adopt pattern | local adapter reference |
| Anthropic Sandbox Runtime | Candidate | local OS sandbox |
| Dev Containers | Support | environment-as-code |
| Daytona | Future candidate | remote full workspace |
| E2B | Future alternative | narrow remote sandbox |
| Ona | Reference | software-factory/environment model |
| Firecracker | Reference | future high-isolation architecture |
| 1Password CLI | Optional binding | local secret injection |
| SOPS + age/KMS | Optional binding | encrypted repo configuration |
| GitHub Actions OIDC | Preferred for CI | short-lived workload identity |
| AWS STS/equivalent | Preferred | temporary cloud credentials |
| NIST SSDF | Adopt taxonomy | secure-development Standards |
| OpenSSF Scorecard | Optional evidence | dependency/project risk |

---

# 19. Roadmap impact

M2 must gain a Minimal Local Security Profile, but should not implement the complete Environment and Credential systems.

M2 baseline:

- process arguments without shell interpolation;
- explicit worktree cwd;
- environment allowlist;
- no production credentials;
- no network by default;
- protected paths;
- explicit external-effect denial;
- sandbox capability spike before unrestricted Worker execution.

Post-M2:

- Repository Environment Profile;
- Dev Container binding;
- Credential Broker;
- Effect Request/Receipt;
- remote Environment Adapter evaluation;
- policy and security telemetry.

---

# 20. Proposed ADRs

After approval:

## ADR-0006 — Security planes and execution isolation

- authority, permission, sandbox and environment are separate;
- E1 is the local Writer target;
- SRT is candidate after AS-02;
- WSL2/worktree are not sandboxes.

## ADR-0007 — Credential grants and external effects

- credentials are temporary and scoped;
- no secrets in Context Packs or memory;
- production effects use separate gate/executor;
- external effects have durable lifecycle.

## ADR-0008 — Reproducible and remote environments

- Dev Containers are optional environment contracts;
- Daytona is future remote candidate;
- remote execution remains adapter-based.

---

# 21. Final recommendation

> Add Security as a first-class control plane, not a collection of warnings.

> Keep the local product simple, but do not run general autonomous Writers with the full WSL user environment.

> Use a Minimal Local Security Profile in M2 and validate the Pi/Sandbox Runtime integration through AS-02.

> Treat Dev Containers as reproducibility, not sufficient isolation.

> Keep credentials out of prompts, logs, memory and generic Worker environments.

> Prefer temporary workload identities and process-scoped injection.

> Separate external effects from code execution.

> Use remote sandboxes and microVM-backed platforms only when the threat model or scale justifies them.
