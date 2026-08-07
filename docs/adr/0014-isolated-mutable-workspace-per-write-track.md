---
id: ADR-0014
title: Isolated mutable workspace per Write Track
document_type: architecture_decision_record
form: explanation
authority: decision
status: accepted
date: 2026-08-07
owners:
  - developmentconexus-ops
approvers:
  - operator
supersedes:
  - ADR-0003
superseded_by: null
related:
  - DOC-PRODUCT-BLUEPRINT-02
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-08
  - DOC-PRODUCT-BLUEPRINT-10
  - TRACKING-DECISIONS
tracking_issue: 23
---

# ADR-0014 — Isolated mutable workspace per Write Track

## Context

ADR-0003 established an important semantic invariant: independently mutable/integrable write tracks require independent workspace state, and corrections can reuse that state while the contract/base/write set/trust boundary remain valid. It encoded the physical realization as a Git worktree.

D3/D-013 separated workspace semantics from execution substrate. Modern local/remote environments may realize private mutable state through a Git worktree, COW filesystem, private rootfs, VM disk, snapshot/fork or remote volume. Git result identity remains the provider-neutral integration boundary.

## Decision drivers

- Preserve independent mutation/integration semantics.
- Avoid making Treehouse/Git worktree a domain requirement.
- Preserve accepted M01 fencing/recovery/result-lineage Evidence.
- Permit a selected Execution Environment to provide workspace isolation directly when that eliminates machinery.
- Keep accepted output independent from workspace artifacts.

## Decision

A `WriteTrack` semantically owns an **isolated mutable workspace** suitable for the current bounded work and its governed correction lifecycle.

The workspace realization is replaceable. It may be, as proven appropriate:

```text
Git worktree
COW/delta filesystem
private container/rootfs state
private VM/microVM disk
persistent remote volume
other bounded substrate
```

No physical path, Lease type or filesystem implementation is part of the `WriteTrack` meaning.

The accepted provider-neutral result boundary remains Git identity:

```text
baseCommitSha
+
resultTreeSha
+
optional resultCommitSha
```

Workspace paths, deltas, snapshots, disks and volumes are execution artifacts used for mutation, resume, recovery or debugging. They never replace Claim/Evidence/Verdict authority.

The initial post-review implementation remains concrete. MNFS must not introduce a generic workspace-provider framework without a second real production consumer.

## Reuse and correction

A workspace may be reused for a local correction while all of these remain valid:

- current contract/criteria;
- base/result lineage;
- allowed write/resource set;
- trust/security boundary;
- current Attempt lifecycle policy;
- no contamination/divergence requiring abandonment.

A new workspace or Attempt is required when governed lifecycle/recovery rules classify the old state as invalid, contaminated, superseded or independently competing.

## Integration

Integration occurs against clean, authoritative Git result identity. Ports, databases, containers, services and external effects are separate resources and require their own isolation/serialization/effect policies.

## Consequences

### Positive

- M01 provider-neutral WriteTrack/Attempt semantics remain reusable.
- Treehouse can remain a concrete incumbent without becoming constitutional architecture.
- A microVM/COW environment can eliminate redundant workspace plumbing if Evidence supports it.
- Result acceptance stays stable across local and remote execution.

### Negative

- Workspace lifecycle can no longer be inferred from a filesystem path alone.
- Reconcile must observe the selected physical realization through its concrete adapter/binding.
- Additional workspace comparison may be needed after Execution Environment selection.

## Validation

`ARR-S2W` runs only if the selected Execution Environment does not already provide the required mutable-state semantics economically. If needed, the comparison must cover:

- exact-base creation;
- tracked/untracked/rename/delete/symlink/mode fidelity;
- isolation and dirty-state detection;
- crash/recovery behavior;
- result tree extraction/application;
- cleanup/reuse/fencing;
- performance/space/maintenance cost.

## Migration

Existing Treehouse Lease/worktree state remains historical M01 implementation Evidence. New product semantics refer to workspace identity/binding; Treehouse-specific entities are not retroactively renamed into universal abstractions.

## Supersession

This ADR supersedes ADR-0003 while preserving its independent mutable/integrable write-track intent.
