# ARR-S0 Host Capability Probe

This directory contains the deterministic implementation surface for the ARR-S0 Host Capability Probe.

ARR-S0 records physical host facts and broad capability classes. It does not select a runtime, process envelope, virtual-machine envelope, workspace substrate or other named realization.

## Current authority

`GATE-S0-IMPLEMENT` authorizes construction and deterministic tests only. The human-readable host capability contract remains proposed at version `0.1.0`.

A real canonical WSL2 run is **prohibited** until a separate `GATE-S0-EXECUTE` Operator authorization binds:

- the accepted S0 plan Git blob;
- an explicitly accepted ARR-S0 contract and its exact SHA-256;
- the exact canonical commit SHA observed at execution time;
- the exact successful deterministic verification workflow run;
- scope `canonical-host-probe-only`.

Contract acceptance is not execution authority. The real `run` path additionally requires the exact runtime Operator token through the dedicated `MNFS_ARR_S0_EXECUTE_AUTHORIZATION` control-plane channel:

```text
MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=<accepted-plan-git-blob> contract_sha256=<exact-contract-sha256> base_sha=<exact-canonical-commit> verify_run=<exact-successful-workflow-run> scope=canonical-host-probe-only
```

The token is consumed by the CLI authority loader only. Probe subprocesses still receive their own exact allowlisted environments and never receive this token or arbitrary host environment.

The production CLI therefore fails closed when either the contract is not accepted at version `1.0.0` or the independent execution token is missing, malformed, stale or bound to different bytes/source authority.

## Machine interface

The frozen commands are:

```bash
npm run arr-s0 -- preflight --json
npm run arr-s0 -- run --json
npm run arr-s0 -- report --run-id RUN_ID --json
```

`preflight` is read-only and checks whether the probe itself could run safely. It does not execute the complete capability suite. It validates both repository and state-root filesystem boundaries: for a not-yet-created state root, it stats the nearest existing ancestor and accepts only a reviewed Linux-owned filesystem type.

`run` generates the run identity only after exact plan/contract/source/execution authority is established, persists durable lifecycle state, preserves raw observations, derives normalized host facts/classes, derives the mechanical Verdict, verifies artifact hashes and finalizes only after integrity checks.

`report` reopens durable state by the machine-emitted run identity, re-verifies manifest/result integrity and never invents a Verdict for an incomplete run.

Mutating host-management verbs are intentionally absent from the parser.

## State and Evidence boundary

S0 runtime artifacts live under the validated Linux-owned MNFS state root:

```text
${XDG_STATE_HOME:-$HOME/.local/state}/mnfs/spikes/arr-s0/<RUN_ID>/
```

The implementation rejects relative roots, `/mnt/*` roots, traversal and existing symlink components. It additionally observes the real filesystem type of the state-root path or nearest existing ancestor and fails closed unless that type is on the reviewed Linux-owned allowlist.

Evidence publication uses restrictive files and no-replace publication: exact bytes are written to an exclusively created temporary file, fsynced, then atomically hard-linked to the final name. An existing concurrent destination is never overwritten; it is accepted only when its exact bytes already match. The temporary name is removed after successful publication and the parent directory is fsynced. Raw bytes remain outside the repository; only later explicitly reviewed normalized Evidence may be promoted to Git.

Subprocesses use exact argv, `shell: false`, closed stdin, explicit cwd, explicit allowlisted environment, bounded output and timeout cleanup of the full process group. Git identity/status observation additionally disables optional locks, prompts, system/global Git configuration, fsmonitor and hooks.

## Prohibited by this harness

The harness has no path that intentionally:

- installs packages or changes host configuration;
- enables kernel or virtualization features;
- changes sysctl/service configuration;
- creates Docker workloads or launches a process sandbox merely to test availability;
- mounts a FUSE filesystem;
- creates a VM or issues KVM ioctls;
- installs or executes candidate substrates;
- selects runtime/environment architecture;
- dispatches a production Worker;
- implements the superseded revision-5 M02 path.

The exact host capability semantics are defined in `docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md`.
