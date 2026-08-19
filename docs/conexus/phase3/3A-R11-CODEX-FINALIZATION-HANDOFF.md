# 3A-R11 — Codex Mechanical Finalization Handoff

**Status:** EXECUTION HANDOFF / NON-AUTHORITATIVE  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Operator ratification authority:** `3A-R11-operator-ratification.md`  
**Expected starting HEAD:** `ff8ae5abeaeb63e9ee93b84f08774068dece938a` — revalidate before doing anything  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Product implementation:** BLOCKED  
**Package B execution:** FORBIDDEN in this handoff  
**Merge:** FORBIDDEN  

> This handoff is bootstrap only. Read `AGENTS.md` → Engineering Method → `docs/DOCUMENTATION-MAP.md` → current live router → `3A-R11-operator-ratification.md`. The operator ratification is authority; this handoff only describes the bounded mechanical consequences.

---

## 1. Mission

Materialize the operator-approved R11 closure **without changing Product or architecture meaning**.

The exact semantic current-tree bytes were ratified by blob SHA in `3A-R11-operator-ratification.md`. Your edits must be limited to status/routing/authority-role language required to make the repository reflect that ratification.

No new design work is admitted.

---

## 2. Allowed files

Normal scope:

```text
AGENTS.md
docs/DOCUMENTATION-MAP.md
docs/conexus/DECISOES.md
docs/conexus/current/README.md
docs/conexus/current/PRODUCT-CONTRACT.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
docs/conexus/phase3/LEDGER.md
docs/conexus/phase3/3A-R11-whole-product-authority-rebaseline.md
```

You may add **one** final R11 closure/status document only if the existing R11 spec cannot cleanly carry the final closure record. Prefer updating the existing R11 spec/status over creating redundant authority.

Do not edit C-000..C-017 or accepted 3B–3K semantic authority.

---

## 3. Required state after finalization

### 3.1 Current tree

The four current artifacts must no longer say:

```text
CANDIDATE
GPT AUTHORITY REVIEW PENDING
R11-H BLOCKED
NOT YET CURRENT AUTHORITY
```

They must state an unambiguous current role equivalent to:

```text
CURRENT / ACCEPTED by 3A-R11 operator ratification
```

Preserve the Product/architecture content. Do not rewrite sections just to make wording prettier.

The current README next action becomes:

```text
Package B — Product Agent + Cross-Runtime
= NEXT / NOT STARTED

First action
= rederive bounded Package-B admission/spec from current canonical authority
```

Do not claim Package B has started.

### 3.2 AGENTS.md

Conexus routing must become:

```text
docs/conexus/current/README.md
→ current Product Contract / Architecture Baseline / Decision Reconciliation as needed
→ docs/conexus/phase3/LEDGER.md when Phase-3 status/detail is relevant
→ exact accepted detailed semantic authority
→ deciding Evidence/current implementation only when material
```

`docs/conexus/DECISOES.md` must not remain before `current/` in the active Conexus discovery path.

Preserve MNFS routing unchanged.

### 3.3 docs/DOCUMENTATION-MAP.md

Keep its MNFS authority/discovery content intact, but make this repository-wide map explicitly aware of the Conexus program.

Add a concise Conexus canonical entrypoint/read path stating:

```text
AGENTS.md
→ Engineering Method
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/current/README.md
→ current Product/Architecture/Reconciliation artifact as needed
→ docs/conexus/phase3/LEDGER.md for active Phase-3 status/detail
→ exact accepted detailed semantic authority
→ Evidence/current implementation only when material
```

List the four current artifacts as canonical Conexus entrypoints.

Update map metadata/version/last_reviewed proportionally because the authority map changed. Do not rewrite the MNFS program status/history.

### 3.4 docs/conexus/DECISOES.md

Preserve all historical decision rows/content.

At the top, make its role explicit:

```text
HISTORICAL / PROVENANCE DECISION INDEX
NOT the current-state entrypoint
NOT precedence-by-recency authority
```

Route current questions to:

```text
docs/conexus/current/README.md
→ DECISION-RECONCILIATION.md when an older decision appears inconsistent
```

Do not delete or rewrite the historical decision record merely because parts are superseded.

### 3.5 LEDGER.md

Change current status to:

```text
3A-R11 = CLOSED / APPROVED / OPERATOR RATIFIED
3L = IN PROGRESS / Q0 COMPLETE / PACKAGE A COMPLETE
Package B = NEXT / NOT STARTED
```

The exact next action must be Package-B **rederivation/admission from the ratified current tree**, not Package-B execution by assumption.

Preserve:

```text
C-018 = NOT RATIFIED
Product implementation = BLOCKED
PR #40 merge = NOT AUTHORIZED
```

Do not change Packages C–E status.

### 3.6 R11 spec/status

Update `3A-R11-whole-product-authority-rebaseline.md` status/gate language so it no longer says proposed/spec-pending/current gate before census.

Preserve its design/history. Append a compact final closure record if needed:

```text
operator ratification = APPROVED 2026-08-18
R11-A..G = complete
R11-H = approved
mechanical rewiring = complete after this commit
R11 = CLOSED / ACCEPTED
Material reopen = NONE
Package B = NEXT / NOT STARTED
```

Do not rewrite the original execution strategy into a different checkpoint.

---

## 4. Exact semantic guard

The ratified current-tree content was bound by blob SHA before this mechanical finalization.

Therefore edits to the four current files may change only:

```text
status/header text
R11 state text
exact-next-action/routing text
post-ratification authority-role wording
```

If you discover you need to alter any of these, STOP and report instead of editing:

```text
Product concept
owner/authority
runtime realization
security/trust rule
data/contract law
qualification state
future/deferred scope
reopen trigger
```

That would exceed mechanical ratification finalization.

---

## 5. Verification

Run:

```text
npm run verify
```

Also perform explicit repository searches/inspection proving:

### Required positives

```text
AGENTS Conexus route starts at docs/conexus/current/README.md
Documentation Map lists current README/Product Contract/Architecture Baseline/Decision Reconciliation
DECISOES declares historical/provenance role
current four docs declare CURRENT/ACCEPTED
LEDGER says 3A-R11 CLOSED/APPROVED and Package B NEXT/NOT STARTED
R11 spec records operator ratification/closure
```

### Required stale negatives in active current/router docs

Equivalent stale claims must be absent:

```text
R11-H BLOCKED
GPT AUTHORITY REVIEW PENDING
current tree NOT YET CURRENT AUTHORITY
Package B PAUSED by R11
Package B OPEN/IN PROGRESS
DECISOES before current/ in Conexus active read path
```

Historical review/handoff documents may of course retain their historical statuses; do not rewrite provenance files to erase history.

### Scope proof

Compare starting HEAD to final HEAD. Expected semantic edits are documentation/routing only.

No Product code, dependency, workflow, provider-live probe, Package-B harness or accepted detailed architecture file may change.

Do not rerun billable/provider-live qualification jobs manually.

---

## 6. Stop conditions

STOP and report if:

```text
ratified current bytes appear semantically inconsistent with accepted detailed authority
rewiring requires changing Product/architecture meaning
any material Finding appears
Package B would need execution to prove closure
C-018/implementation status appears to require change
```

Do not invent a correction.

---

## 7. Completion report

Persist or report:

```text
starting HEAD
final HEAD
files changed
status of each required rewiring item
npm run verify result
stale-string negative-search result
confirmation: no Product code / no Package B execution / no merge
```

Do not merge PR #40 and do not mark it ready for review unless separately authorized by the operator.
