from pathlib import Path

path = Path("docs/tracking/STATUS.md")
text = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"expected one replacement, found {count}: {old!r}")
    text = text.replace(old, new, 1)


replace_once("version: 1.8.47", "version: 1.8.48")
replace_once(
    "- **Current enabler:** Issue #16 — Task 13 GREEN awaits explicit authority",
    "- **Current enabler:** Issue #16 — Task 14 deterministic proof awaits explicit authority",
)
replace_once(
    """Tasks 1–12:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 RED:                       OBSERVED / ACCEPTABLE
Task 13 GREEN:                     NOT AUTHORIZED
Task 14:                           NOT AUTHORIZED""",
    """Tasks 1–13:                        COMPLETE / ACCEPTED
Task 11 RED:                       OBSERVED / ACCEPTABLE
Task 11 GREEN:                     VERIFIED / REVIEWED
Task 12 RED:                       OBSERVED / ACCEPTABLE
Task 12 GREEN:                     VERIFIED / REVIEWED
Task 13 RED:                       OBSERVED / ACCEPTABLE
Task 13 GREEN:                     VERIFIED / REVIEWED
Task 14:                           NOT AUTHORIZED""",
)
replace_once(
    "Task 12  Claim OPEN and read-only Recovery     8c6fd9afa2cc7f707f96659b9efa73230579471a",
    """Task 12  Claim OPEN and read-only Recovery     8c6fd9afa2cc7f707f96659b9efa73230579471a
Task 13  execution CLI and composition          5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864""",
)

marker = "## Frozen boundaries\n"
if text.count(marker) != 1:
    raise SystemExit("Frozen boundaries marker is not unique")
section = """## Task 13 GREEN

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_13_GREEN plan=1.0.1 microdesign=0.6.1 red=fe6da615d2d0a32437e2adb0627f09a693f1bd57 task12=8c6fd9afa2cc7f707f96659b9efa73230579471a
```

Implementation head:

```text
5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864
feat: expose M01 execution CLI
```

Published scope:

```text
src/cli/args.ts
src/cli/main.ts
src/cli/entry.ts
src/runtime/paths.ts
tests/cli/execution-green-review.test.ts
```

The CLI now exposes the bounded M01 `track open/show/abandon`, `lease grant/show/release` and read-only `recover` surface with strict canonical arguments, SHA-1/SHA-256 Git object support, stable JSON, typed MNFS errors, human identity/version/hash visibility and one concrete next action.

The production composition validates current schema readiness before opening one `SqliteStore`, closes the store in `finally`, composes `ExecutionService`, `LeaseService`, `RecoveryService`, the independent source/Git/Treehouse boundaries and Linux process identity, and initializes physical dependencies only for commands that require them.

Adversarial review added four fail-first boundaries and their corrections:

```text
fixed separate LeaseActionRunner child entry instead of in-process execution
release cannot recreate missing Treehouse control state
component-by-component directory creation rejects symlink traversal
Recovery proves physical observation is non-mutating before adapters run
```

Canonical verification:

```text
Implementation:        5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864
Publisher Run / Job:   31037428769 / 92412985292
Verifier Run / Job:    31037580728 / 92413529799
Node:                  24.18.0
TypeScript:            PASS
Task 13 directed:      16/16 PASS
Product:               306/306 PASS
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
Result:      ACCEPTABLE
Replan:      not required
```

Scope review:

- four production files plus one adversarial boundary test;
- no schema, migration, package or dependency change;
- no second SQLite connection or transaction authority;
- no real Treehouse, helper action or Pi process was executed by Task 13 verification;
- no Claim completion/acceptance, Receipt, Gate, Integration or SEC-E1 production dispatch;
- no reset, clean, force, destroy, prune or automatic Recovery repair;
- Task 14, real WSL2 proof, M01 acceptance and merge remain separately gated.

"""
text = text.replace(marker, section + marker, 1)

replace_once(
    """Tasks 1–12:                 COMPLETE / ACCEPTED
Task 11 RED:                OBSERVED / ACCEPTABLE
Task 11 GREEN:              VERIFIED / REVIEWED
Task 12 RED:                OBSERVED / ACCEPTABLE
Task 12 GREEN:              VERIFIED / REVIEWED
Task 13 RED:                OBSERVED / ACCEPTABLE
Task 13 GREEN:              NOT AUTHORIZED
Task 14:                    NOT AUTHORIZED""",
    """Tasks 1–13:                 COMPLETE / ACCEPTED
Task 11 RED:                OBSERVED / ACCEPTABLE
Task 11 GREEN:              VERIFIED / REVIEWED
Task 12 RED:                OBSERVED / ACCEPTABLE
Task 12 GREEN:              VERIFIED / REVIEWED
Task 13 RED:                OBSERVED / ACCEPTABLE
Task 13 GREEN:              VERIFIED / REVIEWED
Task 14:                    NOT AUTHORIZED""",
)
replace_once(
    "A separate exact Operator continuation is required for Task 13 GREEN, bound to reviewed Task 13 RED head `fe6da615d2d0a32437e2adb0627f09a693f1bd57` and accepted Task 12 implementation head `8c6fd9afa2cc7f707f96659b9efa73230579471a`. Task 14, real Treehouse execution, Pi dispatch, M01 acceptance and merge remain unauthorized.",
    "A separate exact Operator continuation is required for the deterministic portion of Task 14, bound to accepted Task 13 implementation head `5daeb8d36a8cd5dd9615ce342a3d5223f3a6f864`. The later canonical WSL2/real-Treehouse proof, M01 acceptance, Pi dispatch and merge remain separately unauthorized.",
)

path.write_text(text, encoding="utf-8")
