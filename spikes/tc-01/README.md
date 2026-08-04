# TC-01 Treehouse Production Adapter Conformance

TC-01 is a disposable conformance harness for the exact Treehouse binary used by the canonical Ubuntu WSL2 environment. It is not the M01 production adapter.

## Deterministic verification

```bash
npm run test:tc01
```

The deterministic tests do not invoke the real Treehouse binary. They use injected runners and controlled fixtures so root CI can verify harness logic without WSL2, network, credentials, a real user HOME or a user Treehouse pool.

## Real canonical WSL2 execution

```bash
npm run tc01 -- run [--run-id <id>] [--state-root <absolute-linux-path>]
npm run tc01 -- report --run-root <absolute-linux-path>
npm run tc01 -- cleanup --run-root <absolute-linux-path>
```

Real execution must use a disposable Linux-owned repository and a run-specific pool outside the MNFS checkout. It must preserve material failures for review and never use `treehouse return --force`, `treehouse destroy`, broad prune or automatic destructive recovery.

The real `run`, `report` and `cleanup` commands are introduced by later TC-01 tasks. Task 1 only registers the deterministic test boundary and command contract.
