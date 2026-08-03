# AS-02 — Local Pi Sandbox on WSL2

This directory contains the isolated acceptance harness for GitHub Issue #8. It evaluates whether a Pi host process with built-in tools disabled, first-party brokered tools, `@anthropic-ai/sandbox-runtime@0.0.67`, a Treehouse worktree and Ubuntu WSL2 can satisfy the MNFS E1 boundary required before the real M2 Worker proof.

## Safety boundary

- The harness uses only run-specific synthetic sentinels.
- It never opens real SSH keys, cloud credentials, kubeconfig, browser data or user `.env` files.
- It never weakens AppArmor, user namespaces, `sysctl` settings or WSL configuration automatically.
- Sandbox initialization failure blocks execution; there is no host fallback.
- Raw evidence is written by the trusted orchestrator outside Worker write roots.
- `.mnfs/missions/MIS-002/plan.json` is outside this spike and must remain unchanged.

## Deterministic tests

From the repository root:

```bash
npm run test:as02
npm run verify
```

These tests verify harness logic without claiming WSL2 security acceptance.

## Real execution

Real commands will be exposed through:

```bash
npm run as02 -- preflight
npm run as02 -- run
npm run as02 -- restart-prepare
npm run as02 -- restart-resume --checkpoint <absolute-path>
npm run as02 -- report --run <run-id>
```

The real S1–S15 proof must run from the canonical Ubuntu WSL2 checkout on the Linux filesystem. GitHub Actions is not a substitute for that environment-specific evidence.
