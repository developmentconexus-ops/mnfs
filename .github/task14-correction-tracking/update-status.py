from pathlib import Path

path = Path('docs/tracking/STATUS.md')
s = path.read_text()

s = s.replace('version: 1.8.48', 'version: 1.8.49', 1)
s = s.replace(
    '- **Current enabler:** Issue #16 — Task 14 deterministic proof awaits explicit authority',
    '- **Current enabler:** Issue #16 — Task 14 canonical WSL2 preflight awaits explicit authority',
    1,
)

old_result = '''Tasks 1–13:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 RED:                       OBSERVED / ACCEPTABLE
Task 13 GREEN:                     VERIFIED / REVIEWED
Task 14:                           NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT'''
new_result = '''Tasks 1–13:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 RED:                       OBSERVED / ACCEPTABLE
Task 13 GREEN:                     VERIFIED / REVIEWED
Task 14 deterministic proof:       VERIFIED / REVIEWED
Task 14 R14-01 correction:         VERIFIED / CLOSED
Task 14 WSL2 preflight:            NOT AUTHORIZED
Task 14 real Treehouse proof:      NOT AUTHORIZED
Task 14 overall:                   IN PROGRESS
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT'''
assert old_result in s
s = s.replace(old_result, new_result, 1)

section = '''## Task 14 deterministic proof and R14-01 correction

Operator authorizations:

```text
MNFS_AUTHORIZE_M01_TASK_14_DETERMINISTIC plan=1.0.1 microdesign=0.6.1 task13=5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864
MNFS_AUTHORIZE_M01_TASK_14_DETERMINISTIC_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=a6822409e2b860de534c5fc68e9cc1ee1afb8c4d task13=5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864 blocker=R14-01
```

Published heads:

```text
Deterministic proof / correction RED:  a6822409e2b860de534c5fc68e9cc1ee1afb8c4d
R14-01 correction GREEN:               680b2e55d01f76da35922675c18ef997c56403d3
```

Deterministic proof surface:

```text
tests/integration/m01-composition.test.ts
tests/integration/m01-fresh-process.test.ts
```

The deterministic phase now proves, through fresh processes and strict disposable fixtures:

```text
Scenario A source, grant and release crash-window recovery
same-fence helper/action replay without duplicate external acquisition
fenced clean release, abandonment and idempotent repeated release
Scenario B exact WT-002/A01/WR01/LSE-002/Claim OPEN lineage for M02
revision-5 v3 → v4 migration with historical-byte preservation
pre-v4 writer rollback against v4 without logical drift
migration-4 commit-failure rollback to the exact v3 state
frozen production-boundary adversarial scan
```

R14-01 correction scope:

```text
src/services/recovery-service.ts
tests/services/recovery-service.test.ts
```

An explicit physical `REQUESTED` source observation is now treated as a durable source intent that has not yet materialized. Recovery reports `SD-01`, preserves the Attempt, requires `ORIGINAL_OPERATION` authority and directs a retry under the same Attempt fence. `SD-02` remains reserved for an existing or otherwise decisive source identity that actually drifts. Recovery remains read-only.

Canonical verification:

```text
Publisher Run / Job:   31049211257 / 92452161053
Verifier Run / Job:    31049566911 / 92453324460
Node:                  24.18.0
TypeScript / build:    PASS
Directed proof:        49/49 PASS
Product:               320/320 PASS
AS-02:                 119/119 PASS
TC-01:                  78/78 PASS
Documentation:         PASS — 93 canonical IDs
npm vulnerabilities:  0
```

Review result:

```text
Critical:    0 open
Important:   0 open
Minor:       0 open
R14-01:      CLOSED
Result:      DETERMINISTIC PHASE ACCEPTABLE
Replan:      not required
```

Scope review:

- the correction commit is a direct child of the exact correction RED and changes only two files, with 25 additions and one deletion;
- no schema, migration, package, dependency, SQLite authority or CLI command-surface change;
- no real Treehouse, Lease helper or Pi process was executed by the deterministic proof;
- no Claim completion/acceptance, Receipt, Gate, Integration or SEC-E1 production dispatch;
- no reset, clean, force, destructive Treehouse path or automatic Recovery repair;
- Task 14 remains in progress until canonical WSL2 preflight, real production Scenario A, Evidence-preserving cleanup and Operator acceptance.

'''
marker = '## Frozen boundaries\n'
assert marker in s
s = s.replace(marker, section + marker, 1)

old_boundary = '''Tasks 1–13:                 COMPLETE / ACCEPTED
Task 11 RED:                OBSERVED / ACCEPTABLE
Task 11 GREEN:              VERIFIED / REVIEWED
Task 12 RED:                OBSERVED / ACCEPTABLE
Task 12 GREEN:              VERIFIED / REVIEWED
Task 13 RED:                OBSERVED / ACCEPTABLE
Task 13 GREEN:              VERIFIED / REVIEWED
Task 14:                    NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED'''
new_boundary = '''Tasks 1–13:                    COMPLETE / ACCEPTED
Task 14 deterministic proof:  VERIFIED / REVIEWED
Task 14 R14-01:                VERIFIED / CLOSED
Task 14 WSL2 preflight:        NOT AUTHORIZED
Task 14 real Treehouse proof:  NOT AUTHORIZED
Task 14 overall:               IN PROGRESS
Pi Worker dispatch:            PROHIBITED
M01 acceptance:                NOT AUTHORIZED
PR #17 merge:                  NOT AUTHORIZED'''
assert old_boundary in s
s = s.replace(old_boundary, new_boundary, 1)

old_next = 'A separate exact Operator continuation is required for the deterministic portion of Task 14, bound to accepted Task 13 implementation head `5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864`. The later canonical WSL2/real-Treehouse proof, M01 acceptance, Pi dispatch and merge remain separately unauthorized.'
new_next = '''A separate exact Operator continuation is required for **Task 14 Step 5 — canonical WSL2 preflight only**, bound to deterministic correction head `680b2e55d01f76da35922675c18ef997c56403d3`:

```text
MNFS_AUTHORIZE_M01_TASK_14_WSL2_PREFLIGHT plan=1.0.1 microdesign=0.6.1 deterministic=680b2e55d01f76da35922675c18ef997c56403d3
```

That gate authorizes environment and exact-head readiness checks only. Real Treehouse acquisition, production Scenario A, cleanup, M01 acceptance, Pi dispatch and merge remain separately unauthorized.'''
assert old_next in s
s = s.replace(old_next, new_next, 1)

path.write_text(s)
