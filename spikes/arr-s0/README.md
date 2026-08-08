# ARR-S0 Host Capability Probe

This directory contains the deterministic implementation surface for the ARR-S0 Host Capability Probe.

ARR-S0 records physical host facts and broad capability classes. It does not select a runtime, process envelope, virtual-machine envelope, workspace substrate or other named realization.

## Current authority

`GATE-S0-IMPLEMENT` authorized construction and deterministic tests. `DOC-ARR-S0-HOST-CAPABILITY-CONTRACT` version `1.0.0` is now accepted under D-021.

**Contract acceptance is not real-host execution authority.** Both `preflight` and `run` still require a separate `GATE-S0-EXECUTE` Operator authorization. `preflight` is read-only and lighter than `run`, but it still reads real repository, filesystem and host facts, so it is execution-gated too.

`GATE-S0-EXECUTE` must bind:

- the accepted S0 plan Git blob;
- the accepted ARR-S0 contract and its exact SHA-256;
- the exact canonical commit SHA containing the accepted contract;
- the exact successful deterministic verification workflow run for that commit;
- scope `canonical-host-probe-only`.

The exact runtime Operator token is supplied through the dedicated `MNFS_ARR_S0_EXECUTE_AUTHORIZATION` control-plane channel:

```text
MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=<accepted-plan-git-blob> contract_sha256=<exact-contract-sha256> base_sha=<exact-canonical-commit> verify_run=<exact-successful-workflow-run> scope=canonical-host-probe-only
```

The execution-authority token is parsed and validated as exact-bound Governance authorization against the accepted plan blob and SHA-256 recomputed from the exact accepted contract bytes **before any Git or host observation occurs**. Only then may the loader observe the repository commit and revalidate `base_sha`. This is a Governance Gate under the trusted Operator + trusted MNFS control-plane assumption, not cryptographic authentication, non-repudiation or a Security Boundary against a process able to rewrite the control plane. A missing, malformed, broader, stale or differently bound token fails closed.

The raw token is consumed by the control plane only. It is never passed to probe subprocesses and is never persisted; durable Evidence retains only its hash-bound authority projection (`gate`, plan blob, base commit, contract hash, verification run and token SHA-256).

## Machine interface

The frozen commands are:

```bash
npm run arr-s0 -- preflight --json
npm run arr-s0 -- run --json
npm run arr-s0 -- report --run-id RUN_ID --json
```

`preflight` requires `GATE-S0-EXECUTE`. After authority validation it checks whether the complete probe could run safely. It does not execute the complete capability suite, but it does perform bounded real observations of repository identity, repository/state-root filesystem boundaries, WSL2/Node identity and required reads. For a not-yet-created state root, it stats the nearest existing ancestor and accepts only a reviewed Linux-owned filesystem type.

`run` requires the same validated exact-bound Governance authorization. It generates the run identity only after exact plan/contract/source/execution authority and preflight have succeeded. After the actual run-root filesystem is validated and immediately before the first durable Evidence write, `run` re-observes Git source identity once more and requires the same clean commit/tree. Drift, missing identity or dirty state fails closed before `state/created.json` and before collector execution. Only then does the run persist lifecycle state, preserve raw observations, derive normalized host facts/classes, derive the mechanical Verdict, verify artifact hashes and finalize after integrity checks.

`report` reopens existing durable Evidence without a new host probe or host observation. It re-verifies manifest/result integrity by the machine-emitted run identity and never invents a Verdict for an incomplete run.

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

- observes the real canonical host before validated exact-bound `GATE-S0-EXECUTE` Governance authorization;
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

The exact host capability semantics are defined in accepted `docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md` version 1.0.0.
