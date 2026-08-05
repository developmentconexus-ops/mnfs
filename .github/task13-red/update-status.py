from __future__ import annotations

from pathlib import Path

path = Path("docs/tracking/STATUS.md")
text = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"expected one replacement, found {count}: {old!r}")
    text = text.replace(old, new)


replace_once("version: 1.8.45", "version: 1.8.46")
replace_once(
    "- **Current enabler:** Issue #16 — Task 13 RED awaits explicit authority",
    "- **Current enabler:** Issue #16 — Task 13 GREEN awaits explicit authority",
)

replace_once(
    """Tasks 1–12:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 and later:                 NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT""",
    """Tasks 1–12:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 RED:                       OBSERVED / ACCEPTABLE
Task 13 GREEN:                     NOT AUTHORIZED
Task 14:                           NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT""",
)

section = """## Task 13 RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_13_RED plan=1.0.1 microdesign=0.6.1 task12=8c6fd9afa2cc7f707f96659b9efa73230579471a
```

Published RED head:

```text
956a067336df48f54d19e634666f14bdf5a92143
test: define Task 13 execution CLI RED
```

Test-only scope:

```text
tests/cli/execution-args.test.ts
tests/cli/execution-main.test.ts
```

The parser matrix defines the complete bounded M01 command surface for `track open/show/abandon`, `lease grant/show/release` and read-only `recover`. It rejects missing or duplicate flags, positional extras, malformed identities and hashes, non-positive versions, Claim/Run production commands, force release and Recovery repair.

The dispatch matrix requires one dependency call per command, stable JSON, human identity/version/hash visibility, a concrete next action, complete help text and preservation of typed MNFS errors.

Canonical expected-failure evidence:

```text
Head:              956a067336df48f54d19e634666f14bdf5a92143
Publisher Run/Job: 31030653641 / 92390206386
Node:              24.18.0
TypeScript:        PASS
Task 13 RED:       0/8 PASS — expected failure
Parser:            0/4 expected failure
Dispatch/output:   0/4 expected failure
Product total:     290 PASS / 8 expected FAIL / 298 total
AS-02:             119/119 PASS
TC-01:             78/78 PASS
Documentation:     PASS — 93 canonical IDs
```

Every Task 13 failure reports the exact missing production surface:

```text
M01 execution CLI parser is not implemented
M01 execution CLI dispatch is not implemented
```

No production source, schema, migration, package, Treehouse execution, Lease helper, Pi behavior, Task 14 proof or M01 acceptance was introduced. Task 13 GREEN remains separately gated.

"""

marker = "## Frozen boundaries\n"
if text.count(marker) != 1:
    raise SystemExit("expected one Frozen boundaries marker")
text = text.replace(marker, section + marker)

replace_once(
    """Tasks 1–12:                 COMPLETE / ACCEPTED
Task 11 RED:                OBSERVED / ACCEPTABLE
Task 11 GREEN:              VERIFIED / REVIEWED
Task 12 RED:                OBSERVED / ACCEPTABLE
Task 12 GREEN:              VERIFIED / REVIEWED
Task 13 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED""",
    """Tasks 1–12:                 COMPLETE / ACCEPTED
Task 11 RED:                OBSERVED / ACCEPTABLE
Task 11 GREEN:              VERIFIED / REVIEWED
Task 12 RED:                OBSERVED / ACCEPTABLE
Task 12 GREEN:              VERIFIED / REVIEWED
Task 13 RED:                OBSERVED / ACCEPTABLE
Task 13 GREEN:              NOT AUTHORIZED
Task 14:                    NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED""",
)

replace_once(
    "A separate exact Operator continuation is required for Task 13 RED, bound to accepted Task 12 implementation head `8c6fd9afa2cc7f707f96659b9efa73230579471a`. Task 13 GREEN, Task 14, real Treehouse execution, Pi dispatch, M01 acceptance and merge remain unauthorized.",
    "A separate exact Operator continuation is required for Task 13 GREEN, bound to reviewed Task 13 RED head `956a067336df48f54d19e634666f14bdf5a92143` and accepted Task 12 implementation head `8c6fd9afa2cc7f707f96659b9efa73230579471a`. Task 14, real Treehouse execution, Pi dispatch, M01 acceptance and merge remain unauthorized.",
)

path.write_text(text, encoding="utf-8")
