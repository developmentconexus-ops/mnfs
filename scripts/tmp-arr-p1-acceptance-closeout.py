from pathlib import Path
import subprocess

ROOT = Path('.')


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    s = p.read_text()
    if old not in s:
        raise SystemExit(f'missing locus in {path}: {old}')
    p.write_text(s.replace(old, new, 1))


def run(*args: str, capture: bool = False) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=capture, check=False)


# RED — require the post-acceptance state before recording it.
test_path = Path('scripts/test-documentation-tooling.mjs')
test_text = test_path.read_text()
red_replacements = {
    "assert.match(statusText, /\\*\\*Current phase:\\*\\* `ARR P1 — Operator Acceptance Review`/u, 'STATUS current phase must be Operator P1 review');":
        "assert.match(statusText, /\\*\\*Current phase:\\*\\* `ARR P1 — ACCEPTED \\/ INTEGRATION_PENDING`/u, 'STATUS current phase must be P1 accepted/integration pending');",
    "assert.match(statusText, /ARR P1 A1-A4 \\+ B1 \\+ P1-F01 \\+ P1-F02:[^\\n]*IMPLEMENTED \\/ VERIFIED \\/ FRESH_REVIEW_PASSED \\/ OPERATOR_DECISION_REQUIRED/u, 'STATUS must record P1 review-ready state');":
        "assert.match(statusText, /ARR P1 A1-A4 \\+ B1 \\+ P1-F01 \\+ P1-F02:[^\\n]*ACCEPTED — GATE-R \\/ D-017/u, 'STATUS must record P1 GATE-R acceptance');",
    "assert.match(statusText, /## Immediate next action — Operator P1 decision/u, 'STATUS next action must be Operator P1 decision');":
        "assert.match(statusText, /## Immediate next action — P1 integration decision/u, 'STATUS next action must be P1 integration decision');",
}
for old, new in red_replacements.items():
    if old not in test_text:
        raise SystemExit(f'missing RED locus: {old}')
    test_text = test_text.replace(old, new, 1)
test_path.write_text(test_text)

red = run('npm', 'run', 'docs:test', capture=True)
print(red.stdout)
print(red.stderr)
if red.returncode == 0:
    raise SystemExit('RED unexpectedly passed')
if 'STATUS current phase must be P1 accepted/integration pending' not in (red.stdout + red.stderr):
    raise SystemExit('RED failed for the wrong reason')

# GREEN — exact Operator acceptance Evidence.
Path('docs/acceptance/2026-08-07-arr-p1-reconciliation-acceptance.md').write_text('''---
id: ACCEPTANCE-ARR-P1-RECONCILIATION
title: ARR P1 Reconciliation Acceptance
document_type: acceptance_record
form: reference
authority: evidence
status: accepted
owners:
  - developmentconexus-ops
related:
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - TRACKING-DECISIONS
  - DOC-PROJECT-STATUS
  - ADR-0013
  - ADR-0014
  - ADR-0015
tracking_issue: 23
last_reviewed: 2026-08-07
---

# ARR P1 Reconciliation Acceptance

## Decision

On 2026-08-07 the Operator accepted ARR P1 / `GATE-R` after the authorized A1-A4+B1 tranche, P1-F01/P1-F02 corrections, normal PR verification and a fresh adversarial review with no Critical or Important findings.

The Operator token was:

```text
MNFS_ACCEPT_ARR_P1 program_blob=52033adcdfb7163f63606034b9912942b018f38e pr=24 head=02e99b25842562d111488d5c8c7008cb2635f3da findings=critical:0,important:0
```

This acceptance is bound to:

```text
program_blob: 52033adcdfb7163f63606034b9912942b018f38e
PR:           24
P1 head:      02e99b25842562d111488d5c8c7008cb2635f3da
Critical:     0
Important:    0
```

The accepted P1 head is the substantive reconciliation tree reviewed by the Operator. Administrative acceptance-recording commits may advance the PR head only to record this already-issued Decision; any material change to P1 semantics, architecture, scope or deciding Evidence requires a new review/Decision.

## Deciding Evidence

```text
P1-F02 constitutional tree: d741b64b41bb04d4ceabaf0efa4b565a9d7e935e
PR verification run:        31194802381 — SUCCESS — npm run verify
fresh review run:           31194963494 — SUCCESS
fresh review findings:      Critical 0 / Important 0
final accepted-head verify: 31195841392 — SUCCESS — npm run verify
```

The fresh review classified remaining Pi/Treehouse/E0-E4/AB1/AS-01/AS-02/worktree mentions as historical/incumbent/reference Evidence, research, negative examples or property options rather than current substrate authority.

## What GATE-R accepts

GATE-R accepts the P1 reconciliation result:

- A1 — MCRM aligned with accepted execution-planning semantics;
- A2 — provider-neutral successor ADRs accepted and predecessor ADRs preserved as superseded history;
- A3 — current constitutional Blueprint bodies reconciled with D-011 through D-016;
- A4 — current roadmap/read-path/tooling projections reconciled to the ARR program;
- B1 — shared Architecture Spike governance/Evidence contract established;
- P1-F01 and P1-F02 — resolved.

This closes the pre-Spike semantic/authority reconciliation gate defined by the accepted ARR program plan.

## What this acceptance does not authorize

This Operator acceptance does **not** authorize:

- merge or integration of PR #24;
- ARR-S0 harness implementation;
- ARR-S0 real host probing;
- candidate installation or execution;
- Agent Runtime / Execution Environment selection;
- ARR-S1/S2/S2W/S3 execution;
- `MIS-002` revision-5 M02 implementation;
- production Worker dispatch;
- automatic delivery/merge.

## Integration prerequisite and next possible gate

ARR-S0 remains unavailable until either:

1. the accepted P1 tree is integrated into the canonical branch; or
2. a later exact S0 base SHA explicitly includes the accepted P1 tree.

Only after that prerequisite may the Operator separately authorize `GATE-S0-IMPLEMENT` for deterministic construction/testing of the S0 harness. Real host probing remains behind the later `GATE-S0-EXECUTE`.
''')

# STATUS 1.19.0.
replace_once('docs/tracking/STATUS.md', 'version: 1.18.0', 'version: 1.19.0')
replace_once('docs/tracking/STATUS.md', '  - ACCEPTANCE-ARR-GATE-P0-PLAN-APPROVAL\n', '  - ACCEPTANCE-ARR-GATE-P0-PLAN-APPROVAL\n  - ACCEPTANCE-ARR-P1-RECONCILIATION\n')
replace_once('docs/tracking/STATUS.md', '- **Current phase:** `ARR P1 — Operator Acceptance Review` under Issue #23 / PR #24.', '- **Current phase:** `ARR P1 — ACCEPTED / INTEGRATION_PENDING` under Issue #23 / PR #24.')
replace_once('docs/tracking/STATUS.md', '- **Current P1 tranche:** A1–A4 + B1 + P1-F01 + P1-F02 implemented and verified. The P1-F02 fresh review found no Critical/Important finding; P1 now awaits explicit Operator acceptance or rejection.', '- **Current P1 tranche:** A1–A4 + B1 + P1-F01 + P1-F02 is ACCEPTED under GATE-R / D-017, bound to program blob `52033adcdfb7163f63606034b9912942b018f38e`, PR #24 head `02e99b25842562d111488d5c8c7008cb2635f3da`, and findings Critical 0 / Important 0. Integration/merge remains separately unauthorized.')
replace_once('docs/tracking/STATUS.md', 'P1-F02 fresh review:        Critical 0 / Important 0 — 31194963494 — SUCCESS\n', 'P1-F02 fresh review:        Critical 0 / Important 0 — 31194963494 — SUCCESS\nP1 accepted head verify:     31195841392 — SUCCESS — npm run verify\nP1 Operator acceptance:      GATE-R — D-017 — ACCEPTED\nP1 accepted head:            02e99b25842562d111488d5c8c7008cb2635f3da\nP1 acceptance record:        ACCEPTANCE-ARR-P1-RECONCILIATION\n')
replace_once('docs/tracking/STATUS.md', 'ARR P1 A1-A4 + B1 + P1-F01 + P1-F02:       IMPLEMENTED / VERIFIED / FRESH_REVIEW_PASSED / OPERATOR_DECISION_REQUIRED\n', 'ARR P1 A1-A4 + B1 + P1-F01 + P1-F02:       ACCEPTED — GATE-R / D-017\nPR #24 merge / integration:                     NOT AUTHORIZED\n')
replace_once('docs/tracking/STATUS.md', '## Immediate next action — Operator P1 decision\n\nThe Operator reviews PR #24 and explicitly accepts P1 or requests/rejects further changes. The fresh-review result supports acceptance but does not grant it automatically.\n', '## Immediate next action — P1 integration decision\n\nP1 is accepted under GATE-R / D-017. PR #24 remains open/draft and its merge/integration is not authorized by the acceptance token. The next Operator decision is whether to integrate the accepted P1 tree or provide a later exact S0 base SHA that includes it.\n')

# D-017.
decisions = Path('docs/tracking/DECISIONS.md')
ds = decisions.read_text()
if '| D-017 |' in ds:
    raise SystemExit('D-017 already exists')
ds = ds.rstrip() + "\n| D-017 | 2026-08-07 | Accept ARR P1 / GATE-R after the authorized A1-A4+B1 tranche and P1-F01/P1-F02 corrections. Acceptance is bound to program-plan blob `52033adcdfb7163f63606034b9912942b018f38e`, PR #24 substantive head `02e99b25842562d111488d5c8c7008cb2635f3da`, and fresh-review findings `Critical 0 / Important 0`. This closes the pre-Spike semantic/authority reconciliation gate and accepts the provider-neutral MCRM/ADR/Blueprint/roadmap/read-path plus shared Architecture Spike Evidence governance produced by P1. It does not authorize PR #24 merge/integration, ARR-S0 implementation or host probing, candidate execution/selection, ARR-S1/S2/S2W/S3 execution, MIS-002 revision-5 M02 production work, production Worker dispatch or automatic delivery. ARR-S0 may become eligible only after the accepted P1 tree is integrated into the canonical branch or an exact later S0 base SHA explicitly includes it, followed by a separate `GATE-S0-IMPLEMENT`. | Operator | — |\n"
decisions.write_text(ds)

# ARR tracking.
replace_once('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md', '  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE\n', '  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE\n  - ACCEPTANCE-ARR-P1-RECONCILIATION\n')
replace_once('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md', 'ARR PROGRAM PLAN                                 REVIEW_READY — v0.2.0\nARR-S0 PLAN                                      REVIEW_READY — v0.2.0\nCURRENT GATE                                     GATE-P0', 'ARR PROGRAM PLAN                                 ACCEPTED — GATE-P0 — v0.2.0\nARR-S0 PLAN                                      ACCEPTED — GATE-P0 — v0.2.0\nP1 / GATE-R                                      ACCEPTED — D-017\nNEXT POSSIBLE GATE                               GATE-S0-IMPLEMENT — NOT AUTHORIZED')
replace_once('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md', '## Review-ready execution plan package', '## Accepted execution plan package')
arr_path = Path('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md')
arr = arr_path.read_text()
start = arr.index('## Current gate — GATE-P0')
end = arr.index('## Current relationship to MIS-002/M02')
new_gate = '''## P1 / GATE-R closeout — ACCEPTED

On 2026-08-07 the Operator accepted ARR P1 / GATE-R, bound to:

```text
program blob: 52033adcdfb7163f63606034b9912942b018f38e
PR:           #24
P1 head:      02e99b25842562d111488d5c8c7008cb2635f3da
findings:     Critical 0 / Important 0
Decision:     D-017
Evidence:     ACCEPTANCE-ARR-P1-RECONCILIATION
```

GATE-R accepts the pre-Spike semantic/authority reconciliation and shared Spike governance produced by A1-A4+B1 plus the explicitly authorized P1-F01/P1-F02 corrections.

It does **not** authorize:

- PR #24 merge/integration;
- ARR-S0 implementation or host probing;
- S1/S2/S2W/S3 execution;
- candidate adoption/selection;
- M02 production implementation;
- production Worker dispatch;
- automatic merge/delivery.

## Next possible gate — GATE-S0-IMPLEMENT (NOT AUTHORIZED)

Before `GATE-S0-IMPLEMENT` can be issued, the accepted P1 tree must either be integrated into the canonical branch or be explicitly included in the exact later S0 base SHA. The S0 implementation gate must then be separately authorized. Real host probing remains separately controlled by `GATE-S0-EXECUTE`.

'''
arr_path.write_text(arr[:start] + new_gate + arr[end:])

# Fresh Actor gate surfaces.
replace_once('AGENTS.md', '`GATE-P0` accepted the Architecture Reconciliation / ARR master plan and ARR-S0 plan. The currently authorized tranche is P1 under PR #24 and is limited to Tasks `A1,A2,A3,A4,B1` of the accepted master plan.', '`GATE-P0` accepted the Architecture Reconciliation / ARR master plan and ARR-S0 plan. ARR P1 / GATE-R was accepted by D-017 for Tasks `A1,A2,A3,A4,B1` plus the explicitly authorized P1-F01/P1-F02 corrections, bound to PR #24 substantive head `02e99b25842562d111488d5c8c7008cb2635f3da`. PR integration/merge remains separately unauthorized.')
replace_once('AGENTS.md', 'ARR P1 reconciliation A1-A4 + B1:       AUTHORIZED / CURRENT\n', 'ARR P1 reconciliation A1-A4 + B1:       ACCEPTED — GATE-R / D-017\nPR #24 merge / integration:               NOT AUTHORIZED\n')
replace_once('AGENTS.md', 'After P1 is implemented and independently verified, the next possible gate is **GATE-S0-IMPLEMENT** for deterministic construction/testing of the host-capability harness. Real host probing remains separately gated and is not implied by S0 implementation approval.', 'After the accepted P1 tree is integrated into the canonical branch, or an exact later S0 base SHA explicitly includes it, the next possible gate is **GATE-S0-IMPLEMENT** for deterministic construction/testing of the host-capability harness. That gate is not currently authorized. Real host probing remains separately gated and is not implied by S0 implementation approval.')

replace_once('docs/DOCUMENTATION-MAP.md', 'ARR P1 A1-A4 + B1:                        AUTHORIZED / CURRENT — PR #24\n', 'ARR P1 A1-A4 + B1:                        ACCEPTED — GATE-R / D-017 — PR #24\nP1 acceptance record:                      ACCEPTANCE-ARR-P1-RECONCILIATION\nPR #24 merge / integration:                 NOT AUTHORIZED\n')
replace_once('docs/DOCUMENTATION-MAP.md', 'The next action inside the current authority is to complete and independently verify P1 only. Finishing P1 does not infer S0 authority; a fresh gate must explicitly authorize the next tranche.', 'P1 is accepted but not integrated. The immediate next action is a separate Operator integration decision for PR #24. P1 acceptance does not infer merge or S0 authority; after the accepted tree is integrated (or explicitly included in a later exact S0 base SHA), a fresh `GATE-S0-IMPLEMENT` must still explicitly authorize the next tranche.')

# Stronger exact acceptance regression assertions.
test_text = test_path.read_text()
anchor = "const statusText = await readFile(path.join(root, 'docs/tracking/STATUS.md'), 'utf8');\n"
if anchor not in test_text:
    raise SystemExit('missing test read anchor')
test_text = test_text.replace(anchor, anchor + "const decisionsText = await readFile(path.join(root, 'docs/tracking/DECISIONS.md'), 'utf8');\nconst arrReviewText = await readFile(path.join(root, 'docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md'), 'utf8');\nconst p1AcceptanceText = await readFile(path.join(root, 'docs/acceptance/2026-08-07-arr-p1-reconciliation-acceptance.md'), 'utf8');\n", 1)
marker = "assert.doesNotMatch(statusText, /## Immediate next action — GATE-P0/u, 'STATUS must not point back to completed GATE-P0');\n"
if marker not in test_text:
    raise SystemExit('missing test assertion anchor')
extra = marker + "assert.match(statusText, /PR #24 merge \\/ integration:[^\\n]*NOT AUTHORIZED/u, 'STATUS must keep P1 integration separately gated');\nassert.match(p1AcceptanceText, /MNFS_ACCEPT_ARR_P1 program_blob=52033adcdfb7163f63606034b9912942b018f38e pr=24 head=02e99b25842562d111488d5c8c7008cb2635f3da findings=critical:0,important:0/u, 'P1 acceptance record must bind the exact Operator token');\nassert.match(decisionsText, /\\| D-017 \\| 2026-08-07 \\| Accept ARR P1 \\/ GATE-R[\\s\\S]*02e99b25842562d111488d5c8c7008cb2635f3da/u, 'D-017 must record exact P1 acceptance authority');\nassert.match(arrReviewText, /P1 \\/ GATE-R[^\\n]*ACCEPTED — D-017/u, 'ARR review must close GATE-R');\nassert.match(arrReviewText, /NEXT POSSIBLE GATE[^\\n]*GATE-S0-IMPLEMENT — NOT AUTHORIZED/u, 'ARR review must keep S0 implementation unapproved');\nassert.match(agentsText, /ARR P1 reconciliation A1-A4 \\+ B1:[^\\n]*ACCEPTED — GATE-R \\/ D-017/u, 'AGENTS must orient fresh actors to accepted P1');\nassert.match(documentationMapText, /ARR P1 A1-A4 \\+ B1:[^\\n]*ACCEPTED — GATE-R \\/ D-017/u, 'Documentation Map must record accepted P1');\n"
test_path.write_text(test_text.replace(marker, extra, 1))

# GREEN / full verification.
for command in [
    ('npm', 'run', 'docs:test'),
    ('npm', 'run', 'docs:check'),
    ('npm', 'run', 'verify'),
]:
    result = run(*command)
    if result.returncode != 0:
        raise SystemExit(f'verification failed: {command}')

check = run('git', 'diff', '--check')
if check.returncode != 0:
    raise SystemExit('git diff --check failed')

# Remove transport-only files before publication.
Path('.github/workflows/arr-p1-acceptance-closeout.yml').unlink(missing_ok=True)
Path('scripts/tmp-arr-p1-acceptance-closeout.py').unlink(missing_ok=True)
