---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.45
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ACCEPTANCE-MIS-002-REPLAN
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - REVIEW-MIS-002-M01-R5-FINAL
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-PLAN-APPROVAL
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
tracking_issue: 16
---

# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2; Windows remains the browser, terminal and desktop host
- **Completed Product Milestones:** M0 — Foundation Walking Skeleton; M1 — Visual Mission Planning
- **Architecture baseline:** merged through PR #11 at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`
- **M2 contract reconciliation:** merged through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Current enabler:** Issue #16 — Task 13 RED awaits explicit authority
- **Current design/implementation PR:** #17 — `design/mis-002-m01` (draft; unmerged)

## Readiness result

```text
R0 Baseline              PASS
R1 Applicability         PASS
R2 Requirements          PASS
R3 Capability Readiness  PASS
R4 Contract Readiness    PASS
R5 Milestone Microdesign PASS
```

## Current M01 result

```text
CAP-EXECUTION:                    ACCEPTED — version 0.1.0
MIS-002 contract:                 APPROVED — revision 5 / exact hash
TC-01 canonical Evidence:         ACCEPT — 15/15 PASS, cleanup COMPLETED
M01 microdesign:                  ACCEPTED — version 0.6.1
Implementation plan:              CURRENT / APPROVED — version 1.0.1
Tasks 1–12:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 and later:                 NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT
```

## Accepted implementation baseline

```text
Task 1   execution domain                    ec6505d720d252aeef77d72192c401f460b4816
Task 2   trusted runtime primitives          ff4d345720c2a14623ec1777fc5f318c9d96d685
Task 3   SQLite transaction authority        2ed7e6d620f771dd1399421d06527911a2ffea0c
Task 4   maintenance and backup              d0172cc2c141cec6004f10caa9859bced9ac8d1c
Task 5   schema v4 and versioned Events       ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
Task 6   execution persistence               b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
Task 7   atomic lifecycle service             ff8fe7c972502ff6cc932687b7e65a16f37b6516
Task 8   independent Attempt source           aa4b9e1006d324acd8889b98b3507b020403d1d9
Task 9   production Treehouse boundary        f984dd0f94e752060bc88cff128061da23607f00
Task 10  trusted Lease action helper          2b80692a10ad162bb1c5874ff40f0bc19c22e3c6
Task 11  fenced Lease lifecycle service       11fe71df23f697b021bd37133854152c033311ec
Task 12  Claim OPEN and read-only Recovery     8c6fd9afa2cc7f707f96659b9efa73230579471a
```

## Task 10 accepted boundary

Task 10 provides the token-scoped durable external-action protocol:

```text
committed semantic action token
→ immutable canonical operation.json at mode 0400
→ durable STARTED before process invocation
→ exactly one bounded ProcessSpec
→ immutable raw stdout/stderr Artifacts
→ hash-linked FINISHED observation
→ semantic interpretation by Task 11
```

The helper never opens MNFS SQLite, imports domain stores or decides semantic Lease state. FINISHED remains advisory.

### Primary and corrective evidence

```text
Primary RED:                 86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
Functional GREEN:            e336116192d1261a9f94c2b6d5293f3ad5154c33
Corrective RED:              2b9f10f4a112af68c6a982c2163b0f1a7ccedbf6
Accepted corrective GREEN:   e1e1231c3e4efcf45ba82e83c666547f27609c8a
Accepted review:             4864279296 — 0 Critical / 0 Important / 0 Minor
```

Accepted corrective behavior includes zero-byte output support, exact Task 9 PATH alignment and metadata size guards before every control/output file read.

## Task 10 publication replay correction

A concurrent post-acceptance RED was introduced in:

```text
aebfddde7af27aeb9122a760f45475aceab6babe
tests/runtime/lease-action-publication-correction.test.ts
```

It proved that an existing oversized `operation.json` was reaching the generic durable-artifact replay path before the protocol-owned bounded reader.

Operator authorization:

```text
MNFS_AUTHORIZE_M01_TASK_10_PUBLICATION_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=aebfddde7af27aeb9122a760f45475aceab6babe
```

Correction:

```text
Head:              2b80692a10ad162bb1c5874ff40f0bc19c22e3c6
Synthetic merge:   a746b078d75f428a3a73e63e2cdff4aa45018974
Workflow / Job:    31008218205 / 92313369184
TypeScript:        PASS
Task 1–10 tests:   213/213 PASS
Task 11 RED:       0/21 expected failure
Product total:     213 PASS / 21 FAIL / 234 total
```

The new protocol-owned `publishIdempotent` path enforces:

```text
existing Artifact
→ lstat boundary/owner/mode/nlink checks
→ open O_NOFOLLOW
→ fstat and byte-limit check before read
→ exact byte comparison
→ idempotent replay or fail-closed conflict

absent Artifact
→ exclusive durable publication
→ bounded reopen and exact byte verification
```

It is used by operation, FINISHED and output publication. STARTED remains exclusive. Generic `writeDurableFile` is no longer used inside the Lease action protocol.

Adversarial review:

```text
Review:     4864602105
Critical:   0
Important:  0
Minor:      0
Result:     ACCEPTABLE
Replan:     not required
```

No LeaseService, SQLite semantic mutation, real Treehouse execution or Task 11 GREEN behavior was introduced.

Because the authorized Task 11 RED remains in the product suite, the root `verify` command intentionally stops after the 21 missing-LeaseService failures. AS-02, TC-01 and documentation were therefore not re-executed at the correction head. Their latest accepted evidence remains:

```text
AS-02:          119/119 PASS
TC-01:          78/78 PASS
Documentation:   PASS — 93 canonical IDs
```

## Task 11 RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_11_RED plan=1.0.1 microdesign=0.6.1 task10=e1e1231c3e4efcf45ba82e83c666547f27609c8a
```

Created only:

```text
tests/services/lease-service-grant.test.ts
tests/services/lease-service-release.test.ts
```

Commits:

```text
Grant matrix:    4bd8c9bd3423c2a0957953e5b7b123594d458edd
Release matrix:  ed6736cfb198119efbb3dde8cfac891632cd4b4c
```

### Grant RED — 10 tests

```text
1. READY source drift blocks before Lease intent and helper launch
2. intent-only retry performs exactly one acquisition
3. one exact external match is adopted without another acquisition
4. exact live action owner blocks takeover
5. dead pre-STARTED owner may receive a new token after fresh observation
6. durable STARTED without decisive Lease state never repeats get
7. external Lease before semantic commit is recovered without another get
8. ACTIVE replay is idempotent; candidate drift conflicts
9. non-bijective external matches commit DIVERGED and never first-match
10. two independent callers produce at most one acquisition and one ACTIVE Lease
```

### Release RED — 11 tests

```text
1. internal/external/holder/path/source fence drift blocks before helper
2. DIRTY and UNKNOWN work block without release intent
3. current Worker Run or Claim blocks release
4. clean release performs one exact conditional return and Event chain
5. exact live action owner blocks a competing caller
6. STARTED release retries only under the same fence after helper absence
7. physical release before semantic commit is recovered without another action
8. missing or unmanaged path becomes DIVERGED, never RELEASED
9. duplicate external identity becomes DIVERGED, never first-matched
10. RELEASED replay is idempotent; candidate drift conflicts
11. source contains no reset, clean, force, destroy, prune, deletion, shell or exec fallback
```

Task 11 signatures remain correct:

```text
20 behavioral tests:
  dist/src/services/lease-service.js absent

1 static boundary test:
  src/services/lease-service.ts absent
```

The Task 11 matrices use real `SqliteStore` fixtures, independent stores for concurrency, SQLite Event-failure triggers and scripted observation/helper/process authorities. They execute no Treehouse or helper process.

## Task 11 GREEN

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_11_GREEN plan=1.0.1 microdesign=0.6.1 red=ed6736cfb198119efbb3dde8cfac891632cd4b4c task10=2b80692a10ad162bb1c5874ff40f0bc19c22e3c6
```

Implementation head:

```text
11fe71df23f697b021bd37133854152c033311ec
feat: implement fenced Lease lifecycle
```

Implemented scope:

```text
src/services/lease-service.ts
src/store/sqlite-store.ts
tests/services/lease-service-grant.test.ts
tests/services/lease-service-release.test.ts
```

`LeaseService` now owns the bounded M01 grant/release Intent–Action–Observation workflow: exact source and candidate binding, idempotent semantic intent, CAS action ownership, durable helper observation, exact-match adoption, conditional release, non-bijective divergence and no destructive fallback.

The existing `SqliteStore` atomic session was extended only with the focused Lease operations required to commit Lease state plus its matching Event on the already-owned `DatabaseSync` connection. No second connection, schema, migration, package or external adapter authority was introduced.

Post-GREEN adversarial review added six fail-first cases for:

```text
same-owner grant re-entry
same-owner release re-entry
Track authority changing before grant action claim
Track authority changing before release action claim
conflicting helper identity after durable STARTED evidence
split/non-bijective external identity evidence
```

Canonical verification:

```text
Head:              11fe71df23f697b021bd37133854152c033311ec
Synthetic merge:   39d037fd7f2e608382509383b0d0d7a2027d187b
Workflow / Job:    31017373454 / 92344867725
Node:              24.18.0
TypeScript:        PASS
Task 11:           27/27 PASS
Product:           240/240 PASS
AS-02:             119/119 PASS
TC-01:             78/78 PASS
Documentation:     PASS — 93 canonical IDs
```

Scope review:

- one production service plus the bounded same-connection Lease transaction seam;
- no schema or migration change;
- no second SQLite connection;
- no real Treehouse or helper process execution;
- no Pi, SEC-E1 production dispatch, Claim completion, Receipt or Gate;
- no reset, clean, force, destructive Treehouse path or filesystem deletion fallback;
- Task 12 and M01 acceptance remain outside this authorization.

## Task 12 RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_12_RED plan=1.0.1 microdesign=0.6.1 task11=11fe71df23f697b021bd37133854152c033311ec
```

Commits:

```text
Initial RED:    dd9876ab9f839077e8da0a2f1701750b7e78b029
Reviewed RED:   86aae24ecfabb774710f10ace0d54fb4e53a16d5
```

The reviewed RED changes only:

```text
tests/services/claim-service.test.ts
tests/services/recovery-service.test.ts
```

No `src/services/claim-service.ts`, `src/services/recovery-service.ts`, schema, migration, package, Treehouse execution or Pi behavior was introduced.

### ClaimService RED — 12 tests

```text
1. exports only the M01 Claim OPEN boundary
2. opens Claim, moves Track to CLAIMED and appends CLAIM_OPENED atomically
3. rolls back Claim, Track and Event when CLAIM_OPENED insertion fails
4. revalidates Track, Attempt, Run and Lease versions after Git observation
5. rejects every independently stale expected version
6. rejects cross-lineage Worker Run and Lease references
7. rejects stale approved authority and wrong Attempt base
8. requires READY source, current Worker Run and ACTIVE matching Lease
9. rejects missing and non-tree result objects in the exact Attempt source
10. rejects empty, duplicate and out-of-Feature criteria
11. blocks a second current Claim
12. replays same-key/same-input and rejects conflicting binding
```

### RecoveryService RED — 18 tests

```text
1. exports a read-only M01 Recovery boundary
2. HEALTHY exact one-to-one match
3. ADOPTABLE exact external match for REQUESTED intent
4. LD-01 semantic Lease without external match
5. LD-02 external MNFS-like Lease without semantic owner
6. LD-03 external Lease ID drift
7. LD-04 holder drift
8. LD-05 missing, unmanaged or escaped path
9. LD-06 duplicate/non-bijective IDs, paths or holders
10. LD-07 inconclusive, conflicting or multiple helper evidence
11. SD-01 REQUESTED source with no final source
12. SD-02 source path/fingerprint/base/object-format drift
13. UNKNOWN insufficient observation
14. simultaneous independent source and Lease divergences
15. complete candidates, blocker, safe action, authority and next action
16. byte-for-byte non-mutation of SQLite, Events and managed resources
17. deterministic report for identical inputs
18. static absence of mutation, helper launch and destructive repair authority
```

Review corrections before acceptance strengthened only the RED matrix:

- Recovery fixtures now create the referenced `MIS-002` Mission before allocating a Track;
- the post-Git race test fences Track, Attempt, Worker Run and Lease versions independently;
- stale-contract authority and wrong-base behavior no longer shadow each other.

Canonical expected-failure evidence:

```text
Node:               24.18.0
Publisher Run/Job:  31021347465 / 92358541383
Baseline Product:   240/240 PASS
AS-02:              119/119 PASS
TC-01:               78/78 PASS
Documentation:      PASS — 93 canonical IDs
Task 12 RED:          0/30 PASS — expected failure
ClaimService:         0/12 expected failure
RecoveryService:      0/18 expected failure
```

Every behavioral failure reports the exact absent production module. The static Recovery boundary test reports the exact absent source file. This remains the accepted RED evidence consumed by the separately authorized GREEN below.

## Task 12 GREEN

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_12_GREEN plan=1.0.1 microdesign=0.6.1 red=86aae24ecfabb774710f10ace0d54fb4e53a16d5 task11=11fe71df23f697b021bd37133854152c033311ec
```

Functional implementation:

```text
74a6254ec6e0a237a26413956416798687c0b2f2
feat: add Claims and read-only Recovery
```

Accepted review correction:

```text
8c6fd9afa2cc7f707f96659b9efa73230579471a
fix: harden Claim and Recovery review boundaries
```

Implemented scope:

```text
src/services/claim-service.ts
src/services/recovery-service.ts
src/store/sqlite-store.ts
tests/services/claim-service.test.ts
tests/services/recovery-service.test.ts
```

`ClaimService` owns the exact M01 Claim OPEN boundary: latest approved MIS-002/M01 contract and Feature criteria, exact current Track/Attempt/Worker Run/Lease lineage, expected-version fences, READY Attempt-owned source, exact result tree observation, canonical input binding, idempotent replay and one same-connection transaction for Claim OPEN, Track `CLAIMED` and `CLAIM_OPENED`.

`RecoveryService` is deterministic and read-only. It reconciles authoritative Track/Attempt/latest Lease state with complete source, external Lease, helper-action and process observations; preserves every candidate and collection hash; classifies `HEALTHY`, `ADOPTABLE`, `LD-01`–`LD-07`, `SD-01`, `SD-02` and `UNKNOWN`; and emits blocker, safe action, required authority and concrete next action without mutation or helper execution.

The post-GREEN adversarial review expanded the accepted 30-test RED matrix to 50 tests. Twenty fail-first cases beyond the original RED now cover, among other boundaries:

```text
Track CAS rollback after Claim insertion
exact committed Claim replay after a newer approved contract
same-key concurrent Claim replay after Git observation
semantic DIVERGED Lease never appearing HEALTHY
canonical path aliases and non-bijective ownership
orphan source and process candidates
missing external Lease timestamps
phase-aware CLAIMED, STARTED and FINISHED helper evidence
live committed owner versus dead STARTED runner
semantic and physical Lease absence
ACTIVE worktree disappearance and RELEASE_PENDING adoption
locale-independent finding order and exact collection hashes
exact Windows mount-root escape classification
```

Canonical verification:

```text
Functional head:       74a6254ec6e0a237a26413956416798687c0b2f2
Functional Run/Job:    31027102669 / 92378259729
Accepted head:         8c6fd9afa2cc7f707f96659b9efa73230579471a
Correction Run/Job:    31028279068 / 92382202637
Node:                  24.18.0
TypeScript:            PASS
Task 12:               50/50 PASS
Product:               290/290 PASS
AS-02:                 119/119 PASS
TC-01:                 78/78 PASS
Documentation:         PASS — 93 canonical IDs
```

Adversarial scope review:

```text
Critical:    0 open
Important:   0 open
Minor:       0 open
Result:      ACCEPTABLE
Replan:      not required
```

Scope review:

- two production services plus the bounded same-connection Claim allocation seam and latest-Lease read required by Recovery;
- the final review correction changes only Claim/Recovery services and their tests; the accepted SQLite seam remains unchanged;
- no schema, migration, package or dependency change;
- no second SQLite connection or transaction authority;
- no real Treehouse, Lease helper or Pi process execution;
- no CLI composition, SEC-E1 production dispatch, Claim completion/acceptance, Receipt or Gate;
- Recovery contains no semantic mutation, Event append, action-token claim, acquire/release or destructive repair authority;
- Task 13 and M01 acceptance remain outside this authorization.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- no real Treehouse or Lease helper process runs before the final explicit WSL2 proof gate;
- grant STARTED without decisive exact Lease state never repeats acquisition;
- release retry remains conditional and bound to the same internal/external/source/helper fence;
- dirty, missing, unmanaged, ambiguous or non-bijective work is preserved;
- no reset, clean, force, destroy, prune or product deletion is authorized;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–12:                 COMPLETE / ACCEPTED
Task 11 RED:                OBSERVED / ACCEPTABLE
Task 11 GREEN:              VERIFIED / REVIEWED
Task 12 RED:                OBSERVED / ACCEPTABLE
Task 12 GREEN:              VERIFIED / REVIEWED
Task 13 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

A separate exact Operator continuation is required for Task 13 RED, bound to accepted Task 12 implementation head `8c6fd9afa2cc7f707f96659b9efa73230579471a`. Task 13 GREEN, Task 14, real Treehouse execution, Pi dispatch, M01 acceptance and merge remain unauthorized.
