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
- Lock integrity: generated and inspected in Task 12 before real execution; no package script is trusted implicitly.

## Pi coding agent

- Role: trusted host reasoning process and extension host
- MNFS state: `ADOPTED`, with secure Worker execution still pending AS-02
- Source reference: `https://github.com/badlogic/pi-mono`
- Reviewed interfaces:
  - async extension factory before startup completes;
  - `registerTool()` custom tools;
  - `session_shutdown` cleanup event;
  - `--no-builtin-tools` disables built-ins while keeping explicit extension tools;
  - `--no-extensions -e <absolute-path>` loads one exact extension without discovered extensions.
- Built-in inventory reviewed for the comparison: `bash`, `read`, `write`, `edit`, `grep`, `find`, `ls`.
- Package namespace is not imported by the AS-02 extension. The extension uses only the injected Pi API object and local JSON schemas, avoiding coupling to a mutable package namespace.
- Exact installed version: observed by `pi --version` in the WSL2 preflight and promoted to the acceptance report. A final Verdict is forbidden until that evidence exists.

## Treehouse

- Role: physical disposable worktree and external lease implementation
- MNFS state: `CANDIDATE`
- Adapter commands admitted by this spike:
  - `treehouse get --lease --lease-holder mnfs-as02-<run-id>`;
  - `treehouse status` as opaque evidence only;
  - `treehouse return <exact-leased-path>`.
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

Any change to Pi, Sandbox Runtime, Treehouse, Ubuntu/WSL kernel, Bubblewrap, Socat, seccomp behavior, extension code, broker code or effective policy requires a fresh provenance record and rerun of the security scenarios. A material bypass, unstable WSL2 support, required broad exceptions or inadequate diagnostics rejects/removes the candidate instead of silently weakening E1.
