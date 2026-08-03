# AS-02 Dependency Provenance

This record covers the third-party components admitted to the AS-02 spike. It does not promote them to permanent MNFS dependencies. Final acceptance remains bound to the exact versions and integrity observed on the canonical Ubuntu WSL2 host.

## Anthropic Sandbox Runtime

- Package: `@anthropic-ai/sandbox-runtime`
- Exact spike version: `0.0.67`
- Source: `https://github.com/anthropic-experimental/sandbox-runtime`
- Reviewed source ref: `v0.0.67`
- License declared by package/source: Apache-2.0
- MNFS state: `CANDIDATE / SPIKE`
- Named consumer: E1 local Process Sandbox for the fixed M2 Worker slice
- Reviewed capabilities:
  - `SandboxManager.initialize(config, networkCallback, enableWatchers)`;
  - `SandboxManager.wrapWithSandboxArgv(command, shell, cwd, signal, commandCwd)`;
  - `SandboxManager.checkDependenciesAsync()`;
  - Bubblewrap filesystem boundary on Linux;
  - proxy/network namespace enforcement;
  - strict domain allowlist support;
  - Unix-socket filtering on supported architectures;
  - reset/cleanup lifecycle.
- Important limitations:
  - Beta Research Preview;
  - Linux behavior depends on Bubblewrap, Socat, user namespaces, AppArmor and architecture;
  - broad domain allowlisting is not mutation authority;
  - Linux wrapped descriptors expose the host process environment, so MNFS discards that value and supplies its own Worker environment allowlist;
  - real WSL2 behavior must be revalidated on every accepted upgrade.

### Lock integrity

The isolated `spikes/as-02/package-lock.json` was generated and verified on Ubuntu 24.04 with Node.js 24.18.0 by GitHub Actions run `30808419487`:

```text
npm install --package-lock-only --ignore-scripts
npm ci --ignore-scripts
```

Both commands passed. The committed lockfile has SHA-256:

```text
85983de1e8089fe59f13a1f090a5587de0cd7ddc1e07a9c476677ccbbf73f2c0
```

The reviewed graph is:

| Package | Exact locked version |
|---|---:|
| `@anthropic-ai/sandbox-runtime` | `0.0.67` |
| `@pondwader/socks5-server` | `1.0.10` |
| `commander` | `12.1.0` |
| `node-forge` | `1.4.0` |
| `zod` | `3.25.76` |

The deterministic AS-02 suite asserts the exact main package integrity and every locked version. Package lifecycle scripts are not executed during installation.

## Pi coding agent

- Role: trusted host reasoning process and extension host
- MNFS state: `ADOPTED`, with secure Worker execution still pending AS-02
- Source reference: `https://github.com/badlogic/pi-mono`
- Reviewed interfaces:
  - async extension factory before startup completes;
  - `registerTool()` custom tools;
  - `session_shutdown` cleanup event;
  - `--no-builtin-tools` disables built-ins while keeping explicit extension tools;
  - `--no-extensions` disables discovered extensions while repeated `-e` admits only named sources.
- Built-in inventory reviewed for the comparison: `bash`, `read`, `write`, `edit`, `grep`, `find`, `ls`.
- Package namespace is not imported by the AS-02 extension. The extension uses only the injected Pi API object and local JSON schemas, avoiding coupling to a mutable package namespace.
- Exact installed version: observed by `pi --version` in the WSL2 preflight and promoted to the acceptance report. A final Verdict is forbidden until that evidence exists.

## Pi Anthropic OAuth compatibility extension

- Package: `@gotgenes/pi-anthropic-auth`
- Exact admitted version: `2.0.1`
- Source: `https://github.com/gotgenes/pi-anthropic-auth`
- MNFS state: `CANDIDATE / HOST AUTH ADAPTER`
- Purpose: allow the trusted Pi host to use an existing Anthropic Claude Pro/Max OAuth subscription instead of falling back to Anthropic extra usage.
- Invocation admitted by AS-02: `-e npm:@gotgenes/pi-anthropic-auth@2.0.1`.
- Discovery remains disabled. The pilot loads exactly two extension sources: this pinned auth adapter and the exact local AS-02 broker extension.
- The adapter runs in the trusted host plane with the same user authority as Pi. It is not inside the Worker sandbox and is therefore part of the trusted computing base.
- It must not add Worker filesystem or process tools. The authoritative Worker inventory remains exactly `bash`, `read`, `write`, `edit`, `grep`, `find`, and `ls`, all supplied by the first-party AS-02 extension.
- The exact adapter version is a required restart-checkpoint dependency. Any change produces mechanical restart drift and requires a fresh AS-02 run.
- The first canonical pilot without this explicit source initialized the sandbox correctly but was blocked before any tool call because Pi fell back to Anthropic extra usage. This failure established why auto-discovered interactive auth cannot be assumed by a `--no-extensions` acceptance run.

## Treehouse

- Role: physical disposable worktree and external lease implementation
- MNFS state: `CANDIDATE`
- Adapter commands admitted by this spike:
  - `treehouse get --lease --lease-holder mnfs-as02-<run-id>`;
  - `treehouse status` as opaque evidence only;
  - `treehouse return <exact-leased-path>`.
- Fixture creation and successful Lease acquisition are persisted immediately in the run state. Cleanup does not call `treehouse return` when acquisition never succeeded.
- Destructive commands and forced release are outside ordinary AS-02 cleanup.
- Exact installed version: observed by `treehouse --version` in the WSL2 preflight and promoted to the acceptance report.

## Host primitives

The preflight records versions and availability without changing host policy:

- Ubuntu/WSL kernel;
- Node.js and npm;
- Bubblewrap;
- Socat;
- ripgrep;
- Git;
- Bash;
- curl;
- GNU Time;
- user namespace settings;
- AppArmor user-namespace restriction;
- Docker socket presence without opening it.

## Upgrade and removal rule

Any change to Pi, the Pi Anthropic OAuth adapter, Sandbox Runtime, Treehouse, Ubuntu/WSL kernel, Bubblewrap, Socat, seccomp behavior, extension code, broker code or effective policy requires a fresh provenance record and rerun of the security scenarios. A material bypass, unstable WSL2 support, required broad exceptions or inadequate diagnostics rejects/removes the candidate instead of silently weakening E1.
