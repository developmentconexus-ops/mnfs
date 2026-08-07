# ARR-S0 Host Capability Probe

This directory contains the deterministic implementation surface for the ARR-S0 Host Capability Probe.

ARR-S0 records physical host facts and broad capability classes. It does not select a runtime, process envelope, virtual-machine envelope, workspace substrate or other named realization.

## Current authority

`GATE-S0-IMPLEMENT` authorizes construction and deterministic tests only. The human-readable host capability contract remains proposed at version `0.1.0`.

A real canonical WSL2 run is **prohibited** until a separate `GATE-S0-EXECUTE` Operator authorization binds:

- an explicitly accepted ARR-S0 contract version/hash;
- the accepted S0 plan identity;
- an exact canonical commit SHA;
- deterministic verification Evidence for that exact tree.

The production CLI enforces this boundary: the real `run` path refuses execution while the contract is not accepted at version `1.0.0`.

## Machine interface

The frozen commands are:

```bash
npm run arr-s0 -- preflight --json
npm run arr-s0 -- run --json
npm run arr-s0 -- report --run-id RUN_ID --json
```

`preflight` is read-only and checks whether the probe itself could run safely. It does not execute the complete capability suite.

`run` generates the run identity, persists durable lifecycle state, preserves raw observations, derives normalized host facts/classes, derives the mechanical Verdict, verifies artifact hashes and finalizes only after integrity checks. It remains fail-closed behind the contract/execution gate above.

`report` reopens durable state by the machine-emitted run identity, re-verifies manifest/result integrity and never invents a Verdict for an incomplete run.

Mutating host-management verbs are intentionally absent from the parser.

## State and Evidence boundary

S0 runtime artifacts live under the validated Linux-owned MNFS state root:

```text
${XDG_STATE_HOME:-$HOME/.local/state}/mnfs/spikes/arr-s0/<RUN_ID>/
```

The implementation rejects relative roots, `/mnt/*` roots, traversal and existing symlink components. Evidence publication uses restrictive files, atomic rename and fsync. Raw bytes remain outside the repository; only later explicitly reviewed normalized Evidence may be promoted to Git.

Subprocesses use exact argv, `shell: false`, closed stdin, explicit cwd, explicit allowlisted environment, bounded output and timeout cleanup of the full process group.

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
