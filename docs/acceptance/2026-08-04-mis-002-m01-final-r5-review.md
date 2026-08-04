---
id: REVIEW-MIS-002-M01-R5-FINAL
title: MIS-002 M01 Final R5 Constructive and Adversarial Review
document_type: design_review
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - CAP-EXECUTION
  - ACCEPTANCE-M2-UNBLOCK
  - DOC-PROJECT-STATUS
  - TRACKING-WORKLOG
tracking_issue: 16
last_reviewed: 2026-08-04
---

# MIS-002/M01 final R5 constructive and adversarial review

## 1. Authority and decision boundary

The Operator explicitly authorized Task 14 after canonical TC-01 Evidence produced `ACCEPT` with S01–S15 all `PASS` and cleanup `COMPLETED`.

This document records the final constructive and adversarial review of:

```text
DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
version 0.6.1
status proposed
```

Review recommendation:

```text
APROVÁVEL
OPERATOR_DECISION_REQUIRED
```

This accepted review Evidence is not approval of the proposed microdesign. It does not authorize M01 implementation, Pi dispatch or PR merge.

## 2. Authorities reviewed

The review reconciled:

- Product Blueprint Sections 2, 5, 7, 8, 9, 10 and 12;
- ADR-0002, ADR-0003, ADR-0005 and ADR-0006;
- CAP-EXECUTION version 0.1.0 and TRACEABILITY;
- approved MIS-002 revision 5 and exact allocations;
- accepted TC-01 protocol, plan and canonical runtime Evidence;
- current Node.js 24 `node:sqlite` documentation;
- current SQLite migration, transaction and foreign-key documentation;
- current Git clone/worktree documentation;
- pinned Treehouse 2.1.1 source and current public command documentation.

## 3. Constructive requirement review

| Requirement | Contract criterion | Final design coverage | Result |
|---|---|---|---|
| `CAP-EXEC-REQ-001` | `MIS-002/M01/AC-01` | partial unique current-Attempt invariant, atomic supersession, optimistic version fence and fresh-process proof | COMPLETE |
| `CAP-EXEC-REQ-002` | `MIS-002/M01/AC-02` | separate Attempt and Worker Run identities, atomic replacement and process identity stronger than PID | COMPLETE |
| `CAP-EXEC-REQ-004` | `MIS-002/M01/AC-03` | Claim + Track transition + payload-versioned Event in one transaction with idempotency | COMPLETE |
| `CAP-EXEC-REQ-005` | `MIS-002/M01/AC-04` | exact approved hash, Attempt base commit, Git tree validation and ancestry-preserving composite FKs | COMPLETE |
| `CAP-EXEC-REQ-006` | `MIS-002/M01/AC-05` | source IAO plus helper-backed Treehouse grant/release IAO and every named crash window | COMPLETE |
| `CAP-EXEC-REQ-007` | `MIS-002/M01/AC-06` | generation, grant/release input hashes, internal/process/helper/external fences and dirty-work preservation | COMPLETE |
| `CAP-EXEC-REQ-008` | `MIS-002/M01/AC-07` | source/helper/Lease one-to-one read-only Reconcile with explicit divergence taxonomy | COMPLETE |

M01 Feature criteria are also covered:

- `MIS-002/M01/F01/AC-01` through `AC-05`: state model, identity, Claim atomicity, contract binding and M0/M1 migration preservation;
- `MIS-002/M01/F02/AC-01` and `AC-02`: Lease IAO, idempotency and fencing;
- `MIS-002/M01/F03/AC-01`: non-destructive orphan/missing-worktree Reconcile.

No M01 requirement remains orphaned and no M02 requirement was pulled into implementation scope.

## 4. Adversarial findings and disposition

### Critical C-01 — canonical checkout escaped the TC-01 boundary

**Finding:** TC-01 accepted Treehouse on a fixed repository with no `origin`. The canonical MNFS checkout has `origin`, and Treehouse acquisition may fetch it. Direct production use would introduce network, credentials and ref mutation not covered by accepted Evidence.

**Correction:** version 0.6.1 adds an Attempt-owned `ExecutionSourceAdapter`. It creates an independent Linux-local source at the exact base commit, with zero remotes, no hardlinks, no alternates, independent object/common directories and a controlled Git environment. Treehouse is prohibited from receiving the canonical checkout as cwd.

**Required proof:** network-off local materialization; no credential helper; canonical checkout unchanged; no remotes/shared objects/hooks; Treehouse cwd is always the READY source.

**Disposition:** CLOSED.

### Critical C-02 — inherited Treehouse user hooks/config

**Finding:** Treehouse supports user-level configuration and hooks. An inherited HOME/XDG config could execute unreviewed shell behavior and invalidate the no-network/no-credential boundary.

**Correction:** Attempt-owned HOME, XDG config, pool and empty hooks path; generated config contains only reviewed settings; global/system Git configuration and arbitrary host environment are disabled.

**Disposition:** CLOSED.

### Critical C-03 — duplicate external grant under concurrent callers

**Finding:** durable `REQUESTED` intent alone does not prevent two processes from executing `treehouse get`. PID ownership by the Lead also leaves a window when the Lead dies but its child continues.

**Correction:** exact action token plus trusted `LeaseActionRunner`. STARTED is crash-durably recorded before Treehouse invocation; surviving helper identity is observable; an inconclusive STARTED grant is never automatically repeated. Exact external completion is recovered semantically without a second `get`.

**Disposition:** CLOSED.

### Important I-01 — relational contract binding without ancestry binding

**Finding:** same contract hash did not prevent a Claim from referencing a Run from another Attempt or a Lease from another Track.

**Correction:** composite parent keys and Claim FKs prove exact Track → Attempt → Run/Lease ancestry as well as contract hash and base commit.

**Disposition:** CLOSED.

### Important I-02 — Event payload version was mutable metadata

**Finding:** storing schema version only on an Event type registry would allow the interpretation of historical payloads to change.

**Correction:** every Event persists `payload_schema_version`; `(type, payload_schema_version)` is the registry key. Existing Events migrate as version 1.

**Disposition:** CLOSED.

### Important I-03 — migration and downgrade mechanism incomplete

**Finding:** the earlier design stated that old binaries could not write schema v4 but did not define the mechanism or a consistent WAL-safe backup.

**Correction:** maintenance gate; `node:sqlite backup()`; fsync/hash/reopen/integrity verification; SQLite generalized table rebuild; row/hash/sequence checks; foreign-key and integrity checks; `user_version = 4`; required Event version without default makes supported pre-v4 transactional writes fail and roll back.

**Disposition:** CLOSED.

### Important I-04 — Git identity and result object under-specified

**Finding:** hash length alone does not prove a commit or tree, and `write-tree` is not a purely observational command.

**Correction:** Attempt stores Git object format and exact base commit; Git verifies commit/tree types; Claim result must resolve to a tree in the exact source; read-only inspector excludes `write-tree` and every mutating Git command.

**Disposition:** CLOSED.

### Important I-05 — false idempotency

**Finding:** semantic replay was described without unique command keys and canonical input binding; release CLI required a key not represented in schema.

**Correction:** unique grant, release and Claim idempotency keys; canonical input hashes; same key/same input returns prior result; same key/different input conflicts; Event IDs are allocated once.

**Disposition:** CLOSED.

### Important I-06 — first-match Reconcile

**Finding:** path-oriented lookup could hide duplicate IDs, paths or holders.

**Correction:** one-to-one matching with exact external Lease ID primary and holder/path/source/helper identity as corroboration. Duplicate or non-bijective observations become divergence and preserve resources.

**Disposition:** CLOSED.

### Important I-07 — Recovery read-only contradiction

**Finding:** an earlier Event list contained `RECOVERY_OBSERVED` despite plain Recovery being byte-for-byte non-mutating.

**Correction:** the generic Event was removed. Plain Recovery produces a content-addressed report and emits no Event. Explicit operation services record only the semantic repair Events they actually apply.

**Disposition:** CLOSED.

### Important I-08 — source object sharing

**Finding:** local Git clone defaults can use hardlinks; shared/reference clones can use alternates, coupling the execution source to canonical object storage.

**Correction:** copied independent object storage is mandatory; hardlinks, alternates, shared common directories and borrowed object stores are prohibited and mechanically inspected.

**Disposition:** CLOSED.

## 5. Crash-window review

### Execution source

| Window | Required behavior |
|---|---|
| source Intent committed, no temp | original operation may retry |
| incomplete recognized temp | inspect and remove only that Track-scoped temp |
| final source completed, semantic commit absent | validate fingerprint and commit READY |
| final source conflicts | DIVERGED; preserve |
| canonical checkout changed | fail and preserve |

### Lease grant

| Window | Required behavior |
|---|---|
| REQUESTED before action token | observe then claim token |
| token committed before helper | live owner blocks; dead owner with no STARTED may be replaced |
| helper STARTED | never launch another `get` until decisive observation |
| external Lease created before semantic commit | exact match commits ACTIVE without another acquisition |
| ACTIVE committed before response | same key/input returns ACTIVE |
| helper/status ambiguity | UNKNOWN/DIVERGED; preserve |

### Lease release

| Window | Required behavior |
|---|---|
| RELEASE_PENDING before helper | observe and claim exact release token |
| helper STARTED | observe first; only exact conditional retry is permitted |
| physical release before semantic commit | available managed path commits RELEASED |
| identity changed | fence conflict/divergence |
| path missing or unmanaged | `LD-05`; never infer success |
| dirty or unclassified work | no Treehouse call; preserve |

No crash window produces silent success, automatic destructive compensation or a second unbounded acquisition.

## 6. Migration preservation review

Version 0.6.1 requires proof that migration v4 preserves:

- repository identity and existing Mission rows;
- Event IDs, sequence, payload bytes and timestamp values;
- all historical plan revisions, including approved MIS-002 revision 3;
- exact approved revision 5 content and hash;
- schema migration history;
- foreign-key integrity and database integrity;
- fresh-process reads after migration.

Rollback restores a verified SQLite backup. It never removes execution sources or Treehouse worktrees.

## 7. Scope review

The design remains inside M01:

```text
included
- state/identity/migration
- independent local execution source
- Treehouse physical Lease adapter
- action helper needed to make IAO safe
- Claim OPEN atomicity
- read-only Reconcile

excluded
- Pi launch
- SEC-E1 runtime creation
- Authority Snapshot / Writer Pack
- Worker completion
- Receipt / Gate / acceptance
- parallel scheduling
- Integration / QA / delivery
```

The new source adapter and action helper do not introduce M02 product behavior. They are required to make the already-approved M01 Lease contract match the accepted TC-01 safety boundary.

## 8. Residual limitations

The following are explicit, non-blocking boundaries:

1. TC-01 accepted one exact Treehouse binary and host/tooling identity; drift requires fresh conformance review.
2. M01 implements only one qualified Feature per Track and one current Track for that Feature.
3. Plain Recovery does not repair. Operator-authorized repair commands remain separately bounded.
4. Claim state beyond `OPEN`, Pi execution, result-tree materialization, Receipt and Gate belong to M02.
5. Same-user hostile replacement of every local Artifact and hash is outside TC-01 authenticity; permissions and integrity checks remain required.
6. The exact implementation commands for independent local Git transfer are frozen in the separate implementation plan and must satisfy the no-hardlink/no-alternate proof.

None permits false acceptance, duplicate grant or destructive cleanup.

## 9. Review conclusion

```text
Constructive coverage:      COMPLETE — 7/7 M01 requirements
Critical findings:          3 found / 3 closed
Important findings:         8 found / 8 closed
Unresolved Critical:        0
Unresolved Important:       0
Replan required:            NO
Microdesign recommendation: APROVÁVEL
Exact version:              0.6.1
R5 state:                   IN_PROGRESS
Human gate:                 OPERATOR DECISION REQUIRED
```

After explicit approval, the next authorized action is only to write a separate TDD production implementation plan. Approval does not itself authorize implementation.
