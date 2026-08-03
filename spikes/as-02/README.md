# AS-02 — Local Pi Sandbox on WSL2

This directory contains the isolated acceptance harness for GitHub Issue #8. It evaluates whether a Pi host process with built-in tools disabled, first-party brokered tools, `@anthropic-ai/sandbox-runtime@0.0.67`, a Treehouse worktree and Ubuntu WSL2 can satisfy the MNFS E1 boundary required before the real M2 Worker proof.

## Safety boundary

- The harness uses only run-specific synthetic sentinels.
- It never opens real SSH keys, cloud credentials, kubeconfig, browser data or user `.env` files.
- It never weakens AppArmor, user namespaces, `sysctl` settings or WSL configuration automatically.
- Sandbox initialization failure blocks execution; there is no host fallback.
- Raw evidence is written by the trusted orchestrator outside Worker write roots.
- Fixture and Treehouse Lease acquisition are persisted before later work can fail, allowing explicit cleanup after interruption.
- `.mnfs/missions/MIS-002/plan.json` is outside this spike and must remain unchanged.

## Deterministic tests

From the repository root:

```bash
npm ci
npm run verify
```

These tests verify harness logic without claiming WSL2 security acceptance.

## Install the isolated runtime

The Sandbox Runtime is intentionally not installed in the root package. Install the exact reviewed dependency graph from its dedicated lockfile:

```bash
npm ci --prefix spikes/as-02 --ignore-scripts
```

The lockfile pins Sandbox Runtime `0.0.67` and every transitive dependency with registry integrity hashes. The AS-02 preflight rejects a missing or different installed version.

## Real execution

The canonical sequence is:

```bash
npm run as02 -- preflight
npm run as02 -- run
npm run as02 -- restart-prepare
npm run as02 -- restart-resume --checkpoint <absolute-path>
npm run as02 -- report --run <run-id>
npm run as02 -- cleanup --run <run-id>
```

`restart-prepare` prints the exact operator-assisted PowerShell and Ubuntu commands. The harness never terminates WSL automatically.

The real S1–S15 proof must run from the canonical Ubuntu WSL2 checkout on the Linux filesystem. GitHub Actions is not a substitute for that environment-specific evidence. A green deterministic suite does not imply AS-02 acceptance; only the generated report and mechanical Verdict may do so.
