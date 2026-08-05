from pathlib import Path

STATUS_PATH = Path("docs/tracking/STATUS.md")
FUNCTIONAL_HEAD = "74a6254ec6e0a237a26413956416798687c0b2f2"
FINAL_HEAD = "8c6fd9afa2cc7f707f96659b9efa73230579471a"

text = STATUS_PATH.read_text(encoding="utf-8")

simple_replacements = {
    "version: 1.8.44": "version: 1.8.45",
    f"Task 12  Claim OPEN and read-only Recovery     {FUNCTIONAL_HEAD}": (
        f"Task 12  Claim OPEN and read-only Recovery     {FINAL_HEAD}"
    ),
    (
        "A separate exact Operator continuation is required for Task 13 RED, "
        f"bound to accepted Task 12 implementation head `{FUNCTIONAL_HEAD}`. "
        "Task 13 GREEN, Task 14, real Treehouse execution, Pi dispatch, "
        "M01 acceptance and merge remain unauthorized."
    ): (
        "A separate exact Operator continuation is required for Task 13 RED, "
        f"bound to accepted Task 12 implementation head `{FINAL_HEAD}`. "
        "Task 13 GREEN, Task 14, real Treehouse execution, Pi dispatch, "
        "M01 acceptance and merge remain unauthorized."
    ),
}

for old, new in simple_replacements.items():
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected exactly one tracking replacement for {old!r}, found {count}")
    text = text.replace(old, new)

start_marker = "## Task 12 GREEN\n"
end_marker = "## Frozen boundaries\n"
start = text.find(start_marker)
end = text.find(end_marker, start)
if start < 0 or end < 0 or text.find(start_marker, start + 1) >= 0:
    raise RuntimeError("Task 12 GREEN tracking boundaries are missing or ambiguous")

final_section = f"""## Task 12 GREEN

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_12_GREEN plan=1.0.1 microdesign=0.6.1 red=86aae24ecfabb774710f10ace0d54fb4e53a16d5 task11=11fe71df23f697b021bd37133854152c033311ec
```

Functional implementation:

```text
{FUNCTIONAL_HEAD}
feat: add Claims and read-only Recovery
```

Accepted review correction:

```text
{FINAL_HEAD}
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
Functional head:       {FUNCTIONAL_HEAD}
Functional Run/Job:    31027102669 / 92378259729
Accepted head:         {FINAL_HEAD}
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

"""

text = text[:start] + final_section + text[end:]

required_fragments = (
    "version: 1.8.45",
    f"Task 12  Claim OPEN and read-only Recovery     {FINAL_HEAD}",
    "Task 12:               50/50 PASS",
    "Product:               290/290 PASS",
    f"bound to accepted Task 12 implementation head `{FINAL_HEAD}`",
)
for fragment in required_fragments:
    if text.count(fragment) != 1:
        raise RuntimeError(f"final tracking fragment missing or ambiguous: {fragment!r}")

STATUS_PATH.write_text(text, encoding="utf-8")
