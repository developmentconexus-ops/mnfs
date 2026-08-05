from pathlib import Path

path = Path("docs/tracking/STATUS.md")
text = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"expected one replacement, found {count}: {old!r}")
    text = text.replace(old, new, 1)


replace_once("version: 1.8.46", "version: 1.8.47")

start_marker = "## Task 13 RED\n"
end_marker = "## Frozen boundaries\n"
if text.count(start_marker) != 1 or text.count(end_marker) != 1:
    raise SystemExit("Task 13 or Frozen boundaries marker is not unique")
start = text.index(start_marker)
end = text.index(end_marker, start)

reviewed_section = """## Task 13 RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_13_RED plan=1.0.1 microdesign=0.6.1 task12=8c6fd9afa2cc7f707f96659b9efa73230579471a
```

RED lineage:

```text
Initial RED:   956a067336df48f54d19e634666f14bdf5a92143
Initial track: 7872071c6ed7238ec0cb8dc55e613d25d1f6d9fd
Reviewed RED:  fe6da615d2d0a32437e2adb0627f09a693f1bd57
```

Test-only scope:

```text
tests/cli/execution-args.test.ts
tests/cli/execution-main.test.ts
tests/cli/execution-red-review.test.ts
```

The parser matrix defines the complete bounded M01 command surface for `track open/show/abandon`, `lease grant/show/release` and read-only `recover`. It rejects missing or duplicate flags, positional extras, malformed or non-canonical identities and hashes, non-positive versions, Claim/Run production commands, force release and Recovery repair.

The dispatch matrix requires one dependency call per command, stable JSON, human identity/version/hash visibility, a concrete next action, complete help text and preservation of typed MNFS errors.

Adversarial review strengthened the initial eight-test matrix with four additional fail-first cases:

```text
positive SHA-256 Git object-id support with canonical identity validation
unscoped recover dispatch without inventing a Write Track
read-only show commands that do not touch physical-operation dependencies
production composition using current-schema readiness and the complete bounded M01 runtime
```

Canonical reviewed expected-failure evidence:

```text
Reviewed head:      fe6da615d2d0a32437e2adb0627f09a693f1bd57
Publisher Run/Job:  31031446681 / 92392885796
Node:               24.18.0
TypeScript:         PASS
Task 13 RED:         0/12 PASS — expected failure
Parser:              0/5 expected failure
Dispatch/output:     0/6 expected failure
Composition root:    0/1 expected failure
Product total:       290 PASS / 12 expected FAIL / 302 total
AS-02:               119/119 PASS
TC-01:                78/78 PASS
Documentation:       PASS — 93 canonical IDs
```

Every reviewed Task 13 failure reports one of the exact missing production surfaces:

```text
M01 execution CLI parser is not implemented
M01 execution CLI dispatch is not implemented
M01 production composition root is not implemented
```

RED review result:

```text
Initial matrix:   8 tests
Review additions: 4 tests
Reviewed matrix: 12 tests
Result:          ACCEPTABLE
Replan:          not required
```

No production source, schema, migration, package, Treehouse execution, Lease helper, Pi behavior, Task 14 proof or M01 acceptance was introduced. Task 13 GREEN remains separately gated.

"""
text = text[:start] + reviewed_section + text[end:]

replace_once(
    "A separate exact Operator continuation is required for Task 13 GREEN, bound to reviewed Task 13 RED head `956a067336df48f54d19e634666f14bdf5a92143` and accepted Task 12 implementation head `8c6fd9afa2cc7f707f96659b9efa73230579471a`. Task 14, real Treehouse execution, Pi dispatch, M01 acceptance and merge remain unauthorized.",
    "A separate exact Operator continuation is required for Task 13 GREEN, bound to reviewed Task 13 RED head `fe6da615d2d0a32437e2adb0627f09a693f1bd57` and accepted Task 12 implementation head `8c6fd9afa2cc7f707f96659b9efa73230579471a`. Task 14, real Treehouse execution, Pi dispatch, M01 acceptance and merge remain unauthorized.",
)

path.write_text(text, encoding="utf-8")
