from pathlib import Path
import subprocess

MERGE_SHA = 'def9e5fe819f76950d61fba2cf5abcda1533c07f'


def replace_once(path, old, new):
    p = Path(path)
    s = p.read_text()
    if old not in s:
        raise SystemExit(f'missing locus in {path}: {old}')
    p.write_text(s.replace(old, new, 1))


def run(*args):
    return subprocess.run(args, text=True, capture_output=True)

# RED: tracking tests must require the real integrated state before docs are changed.
test_path = 'scripts/test-documentation-tooling.mjs'
replace_once(
    test_path,
    "assert.match(statusText, /\\*\\*Current phase:\\*\\* `ARR P1 — ACCEPTED \\/ INTEGRATION_PENDING`/u, 'STATUS current phase must be P1 accepted/integration pending');",
    "assert.match(statusText, /\\*\\*Current phase:\\*\\* `ARR P1 — ACCEPTED \\/ INTEGRATED`/u, 'STATUS current phase must be P1 integrated');",
)
replace_once(
    test_path,
    "assert.match(statusText, /ARR P1 A1-A4 \\+ B1 \\+ P1-F01 \\+ P1-F02:[^\\n]*ACCEPTED — GATE-R \\/ D-017/u, 'STATUS must record P1 GATE-R acceptance');",
    "assert.match(statusText, /ARR P1 A1-A4 \\+ B1 \\+ P1-F01 \\+ P1-F02:[^\\n]*ACCEPTED — GATE-R \\/ D-017 \\/ INTEGRATED/u, 'STATUS must record P1 integration');",
)
replace_once(
    test_path,
    "assert.match(statusText, /## Immediate next action — P1 integration decision/u, 'STATUS next action must be P1 integration decision');",
    "assert.match(statusText, /PR #24 merge \\/ integration:[^\\n]*COMPLETE[^\\n]*def9e5fe819f76950d61fba2cf5abcda1533c07f/u, 'STATUS must bind P1 integration to the real merge commit');\nassert.match(statusText, /## Immediate next action — GATE-S0-IMPLEMENT review/u, 'STATUS next action must be GATE-S0-IMPLEMENT review');",
)

red = run('npm', 'run', 'docs:test')
print(red.stdout)
print(red.stderr)
if red.returncode == 0:
    raise SystemExit('RED unexpectedly passed')
if 'STATUS current phase must be P1 integrated' not in (red.stdout + red.stderr):
    raise SystemExit('RED failed for the wrong reason')

# GREEN: record only actual post-merge facts. S0 remains prohibited.
status = Path('docs/tracking/STATUS.md')
s = status.read_text()
s = s.replace('version: 1.18.0', 'version: 1.19.0', 1)
s = s.replace('  - ACCEPTANCE-ARR-GATE-P0-PLAN-APPROVAL\n', '  - ACCEPTANCE-ARR-GATE-P0-PLAN-APPROVAL\n  - ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT\n', 1)
s = s.replace('**Current phase:** `ARR P1 — ACCEPTED / INTEGRATION_PENDING`', '**Current phase:** `ARR P1 — ACCEPTED / INTEGRATED`', 1)
s = s.replace(
    'Current P1 tranche:** A1–A4 + B1 + P1-F01 + P1-F02 is ACCEPTED under GATE-R / D-017, bound to program blob `52033adcdfb7163f63606034b9912942b018f38e`, PR #24 head `02e99b25842562d111488d5c8c7008cb2635f3da`, and findings Critical 0 / Important 0. Integration/merge remains separately unauthorized.',
    f'Current P1 tranche:** A1–A4 + B1 + P1-F01 + P1-F02 is ACCEPTED under GATE-R / D-017 and INTEGRATED into `main` by squash merge of PR #24 at `{MERGE_SHA}`. The accepted substantive head remains `02e99b25842562d111488d5c8c7008cb2635f3da`; integration does not authorize ARR-S0.',
    1,
)
s = s.replace(
    'P1 acceptance record:        ACCEPTANCE-ARR-P1-RECONCILIATION\n',
    f'P1 acceptance record:        ACCEPTANCE-ARR-P1-RECONCILIATION\nP1 integrated commit:        {MERGE_SHA}\nP1 integration record:       ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT\n',
    1,
)
s = s.replace(
    'ARR P1 A1-A4 + B1 + P1-F01 + P1-F02:       ACCEPTED — GATE-R / D-017\nPR #24 merge / integration:                     NOT AUTHORIZED\n',
    f'ARR P1 A1-A4 + B1 + P1-F01 + P1-F02:       ACCEPTED — GATE-R / D-017 / INTEGRATED\nPR #24 merge / integration:                     COMPLETE — {MERGE_SHA}\n',
    1,
)
s = s.replace(
    '## Immediate next action — P1 integration decision\n\nP1 is accepted under GATE-R / D-017. PR #24 remains open/draft and its merge/integration is not authorized by the acceptance token. The next Operator decision is whether to integrate the accepted P1 tree or provide a later exact S0 base SHA that includes it.\n\nP1 acceptance does **not** implicitly authorize ARR-S0 implementation, real host probing, candidate execution, M02 production work, Worker dispatch or automatic merge.\n\nAfter P1 is accepted and merged, or an exact later S0 base SHA explicitly includes the accepted P1 tree, the next possible gate is a separate `GATE-S0-IMPLEMENT` authorizing deterministic construction/testing of the ARR-S0 host-capability harness. Real probing of the canonical WSL2 host remains separately gated by the later `GATE-S0-EXECUTE`.',
    f'## Immediate next action — GATE-S0-IMPLEMENT review\n\nP1 is accepted and integrated into `main` at `{MERGE_SHA}`. The integration prerequisite from the ARR program is therefore satisfied.\n\n`GATE-S0-IMPLEMENT` is now the **next possible gate**, but it is **NOT AUTHORIZED** by P1 acceptance or integration. The Operator must separately authorize deterministic construction/testing of the ARR-S0 harness against an exact canonical base SHA and the accepted ARR-S0 plan.\n\nARR-S0 real host probing, candidate execution, M02 production work and production Worker dispatch remain prohibited. Real probing of the canonical WSL2 host remains behind the later separate `GATE-S0-EXECUTE`.',
    1,
)
status.write_text(s)

# Fresh Actor read-path surfaces.
replace_once(
    'AGENTS.md',
    '`GATE-P0` accepted the Architecture Reconciliation / ARR master plan and ARR-S0 plan. ARR P1 / GATE-R was accepted by D-017 for Tasks `A1,A2,A3,A4,B1` plus the explicitly authorized P1-F01/P1-F02 corrections, bound to PR #24 substantive head `02e99b25842562d111488d5c8c7008cb2635f3da`. PR integration/merge remains separately unauthorized.',
    f'`GATE-P0` accepted the Architecture Reconciliation / ARR master plan and ARR-S0 plan. ARR P1 / GATE-R was accepted by D-017 for Tasks `A1,A2,A3,A4,B1` plus P1-F01/P1-F02 and was integrated into `main` by PR #24 at `{MERGE_SHA}`. This integration does not authorize S0.',
)
replace_once(
    'AGENTS.md',
    'ARR P1 reconciliation A1-A4 + B1:       ACCEPTED — GATE-R / D-017\nPR #24 merge / integration:               NOT AUTHORIZED',
    f'ARR P1 reconciliation A1-A4 + B1:       ACCEPTED — GATE-R / D-017 / INTEGRATED\nPR #24 merge / integration:               COMPLETE — {MERGE_SHA}',
)
replace_once(
    'AGENTS.md',
    'After the accepted P1 tree is integrated into the canonical branch, or an exact later S0 base SHA explicitly includes it, the next possible gate is **GATE-S0-IMPLEMENT** for deterministic construction/testing of the host-capability harness. That gate is not currently authorized. Real host probing remains separately gated and is not implied by S0 implementation approval.',
    f'P1 is integrated into canonical `main` at `{MERGE_SHA}`. The next possible gate is **GATE-S0-IMPLEMENT** for deterministic construction/testing of the host-capability harness, but that gate is **not currently authorized**. Real host probing remains separately gated and is not implied by S0 implementation approval.',
)

replace_once(
    'docs/DOCUMENTATION-MAP.md',
    'ARR P1 A1-A4 + B1:                        ACCEPTED — GATE-R / D-017 — PR #24\nP1 acceptance record:                      ACCEPTANCE-ARR-P1-RECONCILIATION\nPR #24 merge / integration:                 NOT AUTHORIZED',
    f'ARR P1 A1-A4 + B1:                        ACCEPTED — GATE-R / D-017 / INTEGRATED\nP1 acceptance record:                      ACCEPTANCE-ARR-P1-RECONCILIATION\nP1 integration record:                     ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT\nPR #24 merge / integration:                 COMPLETE — {MERGE_SHA}',
)
replace_once(
    'docs/DOCUMENTATION-MAP.md',
    'P1 is accepted but not integrated. The immediate next action is a separate Operator integration decision for PR #24. P1 acceptance does not infer merge or S0 authority; after the accepted tree is integrated (or explicitly included in a later exact S0 base SHA), a fresh `GATE-S0-IMPLEMENT` must still explicitly authorize the next tranche.',
    f'P1 is accepted and integrated into `main` at `{MERGE_SHA}`. The next possible gate is `GATE-S0-IMPLEMENT`, but it remains separately **NOT AUTHORIZED** until the Operator issues an exact gate. Real S0 host execution remains behind `GATE-S0-EXECUTE`.',
)

arr = Path('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md')
a = arr.read_text()
a = a.replace('  - ACCEPTANCE-ARR-P1-RECONCILIATION\n', '  - ACCEPTANCE-ARR-P1-RECONCILIATION\n  - ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT\n', 1)
a = a.replace('P1 / GATE-R                                      ACCEPTED — D-017\nNEXT POSSIBLE GATE                               GATE-S0-IMPLEMENT — NOT AUTHORIZED', f'P1 / GATE-R                                      ACCEPTED / INTEGRATED — D-017\nP1 integration                                   PR #24 — {MERGE_SHA}\nNEXT POSSIBLE GATE                               GATE-S0-IMPLEMENT — NOT AUTHORIZED', 1)
a = a.replace('## P1 / GATE-R closeout — ACCEPTED', '## P1 / GATE-R closeout — ACCEPTED / INTEGRATED', 1)
a = a.replace('GATE-R accepts the pre-Spike semantic/authority reconciliation and shared Spike governance produced by A1-A4+B1 plus the explicitly authorized P1-F01/P1-F02 corrections.', f'GATE-R accepts the pre-Spike semantic/authority reconciliation and shared Spike governance produced by A1-A4+B1 plus P1-F01/P1-F02. PR #24 was subsequently integrated by squash merge at `{MERGE_SHA}`.', 1)
a = a.replace('- PR #24 merge/integration;\n', '', 1)
a = a.replace('Before `GATE-S0-IMPLEMENT` can be issued, the accepted P1 tree must either be integrated into the canonical branch or be explicitly included in the exact later S0 base SHA. The S0 implementation gate must then be separately authorized. Real host probing remains separately controlled by `GATE-S0-EXECUTE`.', f'The P1 integration prerequisite is satisfied by `main` commit `{MERGE_SHA}`. `GATE-S0-IMPLEMENT` may now be reviewed as the next possible gate, but remains separately **NOT AUTHORIZED**. Real host probing remains separately controlled by `GATE-S0-EXECUTE`.', 1)
arr.write_text(a)

Path('docs/acceptance/2026-08-07-arr-p1-integration-closeout.md').write_text(f'''---
id: ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT
title: ARR P1 Integration Closeout
document_type: acceptance_record
form: reference
authority: evidence
status: accepted
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-ARR-P1-RECONCILIATION
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - DOC-PROJECT-STATUS
tracking_issue: 23
last_reviewed: 2026-08-07
---

# ARR P1 Integration Closeout

## Integration result

After ARR P1 was accepted under GATE-R / D-017, the Operator instructed finalization/integration. PR #24 was marked ready and squash-merged into canonical `main`.

```text
accepted substantive head: 02e99b25842562d111488d5c8c7008cb2635f3da
administrative PR head:     f0eb415d26f0338fa9f827ab320d3cecf48ae550
merge method:               squash
canonical merge commit:     {MERGE_SHA}
```

The merge integrates the accepted P1 semantic reconciliation and its administrative acceptance closeout. It does not change the scope of GATE-R.

## Verification before integration

```text
PR head:                    f0eb415d26f0338fa9f827ab320d3cecf48ae550
Documentation workflow:     31197812676
npm run verify:             SUCCESS
PR mergeability:            true
review threads:             0
```

## Authorization boundary after integration

```text
ARR P1 / GATE-R:            ACCEPTED / INTEGRATED
GATE-S0-IMPLEMENT:          NOT AUTHORIZED
ARR-S0 real host probe:     PROHIBITED pending GATE-S0-EXECUTE
ARR-S1/S2/S2W/S3:           PROHIBITED pending later gates
MIS-002 revision-5 M02:     PROHIBITED / SUPERSEDED PATH
Production Worker dispatch: PROHIBITED
```

P1 integration satisfies the program prerequisite for reviewing the next possible gate. It does not itself authorize ARR-S0 implementation or any real host/candidate operation.
''')

# GREEN verification.
for cmd in [
    ('npm', 'run', 'docs:test'),
    ('npm', 'run', 'docs:check'),
    ('npm', 'run', 'verify'),
]:
    result = run(*cmd)
    print(result.stdout)
    print(result.stderr)
    if result.returncode != 0:
        raise SystemExit(f'command failed: {cmd}')
