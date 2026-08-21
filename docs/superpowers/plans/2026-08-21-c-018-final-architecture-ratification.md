# C-018 Final Product Architecture Ratification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open C-018 as a bounded final architecture-ratification gate, prove that C-018 cannot authorize Product implementation by itself, and preserve a separately operator-authorized ratification closure.

**Architecture:** Reuse the existing roadmap + Decision Register + repository guard model. `docs/roadmap.md` owns mutable gate status; `docs/decisions/index.md` remains `NOT RATIFIED` while C-018 is open; `scripts/check-current-state.mjs` enforces phase continuity plus a deny-only Product implementation gate. Final ratification is a separate transition and must not execute until explicit operator ratification is received.

**Tech Stack:** Markdown authority documents, Node.js 24 repository guards, `node:test`, GitHub Actions `verify`.

**Spec:** `docs/superpowers/specs/2026-08-21-c-018-final-architecture-ratification-design.md`

## Global Constraints

- Repository authority order remains `AGENTS.md → docs/index.md → docs/roadmap.md → task-specific owners`.
- Base is `main@2985268b74bf8da05d94b7afefe40ae8e43a9a2c` unless revalidation proves `main` moved before execution.
- 3A–3O remain `CLOSED`; no accepted phase is reopened by preference.
- Opening C-018 changes only the roadmap gate to `OPEN / RATIFICATION REVIEW`; `docs/decisions/index.md` must remain `C-018 = NOT RATIFIED` until explicit operator ratification.
- Product implementation remains `BLOCKED` while C-018 is open and after C-018 is ratified.
- C-018 does not execute FIRST_BUILD/FIRST_PRODUCTION proof, Product code, live Sankhya, runtime, migration, deployment, or production effects.
- No new Product requirement, semantic owner, trust boundary, runtime/database/framework choice, or generic ratification machinery may be introduced.
- Do not run another whole-architecture Fable review unless current work introduces or exposes a material contradiction that genuinely benefits from independent adversarial review rather than direct smallest-owner reopen.
- Run `npm ci && npm run verify` before any completion/closure claim.
- One coherent C-018 branch + Draft PR. Never merge without separate explicit operator merge authority.

---

## File Structure

### Opening candidate

- Create: `docs/phases/c-018-final-architecture-ratification.md` — durable C-018 continuity/ratification contract and later result summary.
- Modify: `docs/roadmap.md` — mutable gate status only: `OPEN / RATIFICATION REVIEW` during review.
- Modify: `docs/index.md` — route C-018 durable phase document.
- Modify: `scripts/check-current-state.mjs` — admit only legal C-018 opening state and keep Product implementation deny-only.
- Create: `tests/repository/c018-ratification.test.mjs` — focused C-018 projection/continuity tests.
- Modify: `tests/repository/repository-contract.test.mjs` — negative controls for overlap and accidental Product unblocking.
- Preserve unchanged during opening: `docs/decisions/index.md` C-018 row remains `NOT RATIFIED`.

### Ratification closure — only after explicit operator ratification

- Modify: `docs/phases/c-018-final-architecture-ratification.md` — append durable ratification result.
- Modify: `docs/roadmap.md` — `C-018 = RATIFIED / OPERATOR RATIFIED`, Product remains `BLOCKED`.
- Modify: `docs/decisions/index.md` — use existing controlled Decision Register vocabulary: `CURRENT / OPERATOR RATIFIED` for C-018.
- Modify: `scripts/check-current-state.mjs` — admit ratified roadmap state only when 3A–3O remain closed, Decision Register projection matches, and Product remains blocked.
- Modify: `tests/repository/c018-ratification.test.mjs` and `tests/repository/repository-contract.test.mjs` — prove ratified-state continuity, projection, and deny-only behavior.

### Planning-only artifacts

The spec and this plan are execution aids, not Conexus authority. Before opening the merge-candidate PR, remove these two files from the candidate tree so `check-doc-index.mjs` does not require them as durable authority routes:

- `docs/superpowers/specs/2026-08-21-c-018-final-architecture-ratification-design.md`
- `docs/superpowers/plans/2026-08-21-c-018-final-architecture-ratification.md`

Their commits remain in branch/PR history; they must not enter the final squash tree.

---

### Task 1: Enforce C-018 opening continuity and deny-only Product implementation

**Files:**
- Modify: `tests/repository/repository-contract.test.mjs`
- Modify: `scripts/check-current-state.mjs`

**Interfaces:**
- Consumes: roadmap rows parsed as `{ name, status }` and Decision Register rows parsed as `{ id, status }`.
- Produces: legal C-018 roadmap states `NOT RATIFIED | OPEN / RATIFICATION REVIEW` during the opening candidate; Product implementation always `BLOCKED`; open C-018 requires all phases 3A–3O closed and Decision Register C-018 still `NOT RATIFIED`.

- [ ] **Step 1: Add the RED overlap negative control**

Append to `tests/repository/repository-contract.test.mjs`:

```js
test('C-018 ratification review cannot overlap an open architecture phase', () => {
  const path = resolve(root, 'docs/roadmap.md')
  const original = readFileSync(path, 'utf8')
  let mutated = original.replace('| C-018 | NOT RATIFIED |', '| C-018 | OPEN / RATIFICATION REVIEW |')
  mutated = mutated.replace('| 3O | CLOSED |', '| 3O | OPEN / ACTIVE |')
  if (mutated === original) throw new Error('C-018 overlap mutation target missing')
  writeFileSync(path, mutated)
  try {
    const result = run('scripts/check-current-state.mjs')
    const output = `${result.stdout}\n${result.stderr}`
    if (result.status === 0 || !output.includes('C-018 ratification review requires all phases CLOSED')) {
      throw new Error(`C-018 overlap negative control did not fire:\n${output}`)
    }
  } finally {
    writeFileSync(path, original)
  }
})
```

- [ ] **Step 2: Add the RED deny-only negative control**

Append:

```js
test('C-018 ratification alone cannot unblock Product implementation', () => {
  const path = resolve(root, 'docs/roadmap.md')
  const original = readFileSync(path, 'utf8')
  let mutated = original.replace('| C-018 | NOT RATIFIED |', '| C-018 | RATIFIED / OPERATOR RATIFIED |')
  mutated = mutated.replace('| Product implementation | BLOCKED |', '| Product implementation | AUTHORIZED |')
  if (mutated === original) throw new Error('C-018 deny-only mutation target missing')
  writeFileSync(path, mutated)
  try {
    const result = run('scripts/check-current-state.mjs')
    const output = `${result.stdout}\n${result.stderr}`
    if (result.status === 0 || !output.includes('Product implementation must remain BLOCKED')) {
      throw new Error(`C-018 deny-only negative control did not fire:\n${output}`)
    }
  } finally {
    writeFileSync(path, original)
  }
})
```

- [ ] **Step 3: Run the repository-contract test and verify RED for the intended reasons**

```bash
node --test tests/repository/repository-contract.test.mjs
```

Expected before production change:

```text
C-018 ratification review cannot overlap an open architecture phase = FAIL
C-018 ratification alone cannot unblock Product implementation = FAIL
```

The first must fail because current guard ignores C-018 overlap. The second must fail because the new deny-only behavior/message is absent; syntax/errors do not count.

- [ ] **Step 4: Implement the minimal opening guard**

In `scripts/check-current-state.mjs`, immediately after phase progression validation, add:

```js
const c018Status = byName.get('C-018')
const allowedC018Statuses = new Set(['NOT RATIFIED', 'OPEN / RATIFICATION REVIEW'])
if (!allowedC018Statuses.has(c018Status)) {
  errors.push(`roadmap invalid C-018 status before operator ratification: ${c018Status ?? 'missing'}`)
}
if (c018Status === 'OPEN / RATIFICATION REVIEW' && phases.some(({ status }) => status !== 'CLOSED')) {
  errors.push('C-018 ratification review requires all phases CLOSED')
}
if (byName.get('Product implementation') !== 'BLOCKED') {
  errors.push('Product implementation must remain BLOCKED until a later Realization Planning / explicit execution-authority gate')
}
```

Remove the weaker current rule:

```js
if (byName.get('Product implementation') !== 'BLOCKED' && byName.get('C-018') !== 'RATIFIED') errors.push('Product implementation cannot be unblocked before C-018 ratification')
```

After Decision Register rows are parsed, add:

```js
const c018DecisionStatus = decisionRows.find(({ id }) => id === 'C-018')?.status
if (c018Status === 'OPEN / RATIFICATION REVIEW' && c018DecisionStatus !== 'NOT RATIFIED') {
  errors.push(`C-018 must remain NOT RATIFIED in the Decision Register while ratification review is open; got ${c018DecisionStatus ?? 'missing'}`)
}
```

Do not add a legal ratified roadmap state in this task.

- [ ] **Step 5: Re-run focused test and verify GREEN**

```bash
node --test tests/repository/repository-contract.test.mjs
```

Expected: all tests in the file PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add -- scripts/check-current-state.mjs tests/repository/repository-contract.test.mjs
git commit -m "test(c-018): enforce ratification gate isolation"
```

---

### Task 2: Open C-018 without ratifying it

**Files:**
- Create: `tests/repository/c018-ratification.test.mjs`
- Create: `docs/phases/c-018-final-architecture-ratification.md`
- Modify: `docs/roadmap.md`
- Modify: `docs/index.md`
- Preserve unchanged: `docs/decisions/index.md`

**Interfaces:**
- Consumes: legal `OPEN / RATIFICATION REVIEW` status from Task 1.
- Produces: durable R1–R7 continuity contract, roadmap opening state, docs-router entry, and proof that Decision Register remains `NOT RATIFIED`.

- [ ] **Step 1: Write the RED authority-projection test**

Create `tests/repository/c018-ratification.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(new URL('../../', import.meta.url).pathname)
const read = path => readFileSync(resolve(root, path), 'utf8')

test('C-018 opens as ratification review without promoting decision or Product implementation', () => {
  const roadmap = read('docs/roadmap.md')
  const decisions = read('docs/decisions/index.md')
  assert.match(roadmap, /\| C-018 \| OPEN \/ RATIFICATION REVIEW \|/)
  assert.match(roadmap, /\| Product implementation \| BLOCKED \|/)
  assert.match(decisions, /\| C-018 \| Final Product architecture ratification\. \| NOT RATIFIED \|/)
})

test('C-018 durable contract carries R1 through R7 and deny-only execution law', () => {
  const contract = read('docs/phases/c-018-final-architecture-ratification.md')
  for (const id of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7']) assert.match(contract, new RegExp(`\\b${id}\\b`))
  assert.match(contract, /C-018 = RATIFIED[\s\S]*!=[\s\S]*Product implementation authorized/)
  assert.match(contract, /FIRST_BUILD/)
  assert.match(contract, /FIRST_PRODUCTION/)
  assert.match(contract, /explicit operator ratification/)
})

test('documentation router reaches the C-018 durable contract', () => {
  assert.match(read('docs/index.md'), /phases\/c-018-final-architecture-ratification\.md/)
})
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/repository/c018-ratification.test.mjs
```

Expected: FAIL because roadmap is still `NOT RATIFIED`, C-018 durable file does not exist, and docs/index does not route it.

- [ ] **Step 3: Create the durable C-018 contract**

Create `docs/phases/c-018-final-architecture-ratification.md`:

```markdown
# C-018 — Final Product Architecture Ratification

Current gate status remains owned only by [../roadmap.md](../roadmap.md). Decision disposition remains owned by [../decisions/index.md](../decisions/index.md). This document owns the bounded final-ratification continuity contract and, after explicit operator ratification, its durable result summary.

C-018 does not redesign accepted architecture, authorize Product implementation, execute FIRST_BUILD/FIRST_PRODUCTION proof, or select realization mechanics.

## Ratification question

Has the complete accepted Product architecture reached final ratification with no unresolved material contradiction, while every implementation-dependent proof obligation remains mandatory and C-018 itself remains insufficient to authorize implementation?

## Ratification contract

- **R1 — phase continuity:** 3A–3O remain CLOSED with accepted results intact.
- **R2 — architecture continuity:** current Product requirements, semantic owners, trust boundaries, structural laws and qualification scopes remain mutually coherent.
- **R3 — unresolved-contradiction closure:** no material 3N/3O/current-authority contradiction remains unresolved; a new contradiction reopens only the smallest owning decision.
- **R4 — downstream proof preservation:** FIRST_BUILD/FIRST_PRODUCTION obligations remain mandatory and reachable; C-018 never treats them as already proven.
- **R5 — no new architecture by ratification:** C-018 creates no Product requirement, semantic owner, trust boundary, framework/runtime/database/deployment choice or KPI meaning.
- **R6 — deny-only implementation gate:** `C-018 = RATIFIED` != `Product implementation authorized`; Product remains BLOCKED until later Realization Planning plus explicit execution authority.
- **R7 — repository/verification closure:** exact ratification candidate contains no temporary review material and passes `npm ci && npm run verify`.

## Opening state

```text
3A–3O = CLOSED
C-018 roadmap gate = OPEN / RATIFICATION REVIEW
C-018 Decision Register = NOT RATIFIED
Product implementation = BLOCKED
```

Opening the gate is not partial ratification.

## Review law

Do not replay 3N/3O by ceremony. A material contradiction stops C-018 and returns to the smallest owning decision. Independent review is added only when a new material change or contradiction genuinely benefits from an adversarial challenger.

## Ratification gate

C-018 may become ratified only after this continuity contract is satisfied on one exact green candidate head and the operator gives explicit operator ratification. Ratification remains separate from merge authority.

Until then, C-018 remains NOT RATIFIED in the Decision Register and Product implementation remains BLOCKED.
```

- [ ] **Step 4: Open C-018 in roadmap only**

Replace:

```markdown
| C-018 | NOT RATIFIED | Final architecture ratification remains pending | Ratification requires preceding closures |
```

with:

```markdown
| C-018 | OPEN / RATIFICATION REVIEW | Final Product architecture continuity/ratification gate is active; no decision promotion yet | A material contradiction reopens the smallest owning decision; ratification requires an exact green candidate plus explicit operator ratification |
```

Change status block to:

```text
C-018 = OPEN / RATIFICATION REVIEW; Decision Register = NOT RATIFIED
Product implementation = BLOCKED
```

Update only the final roadmap prose needed to name C-018 continuity review as the exact current action. Explicitly say Decision Register remains `NOT RATIFIED` and Product remains blocked.

- [ ] **Step 5: Route durable C-018 from docs/index**

Replace the existing durable-phase bullet with:

```markdown
- Phase baselines / final gate: [3A](phases/3a-authority-baseline.md), [3L](phases/3l-technology-qualification.md), [3M](phases/3m-failure-recovery-architecture.md), [3N](phases/3n-architecture-verification.md), [3O](phases/3o-vertical-architecture-proof-contract.md), [C-018](phases/c-018-final-architecture-ratification.md).
```

Do not restate mutable C-018 status in docs/index.

- [ ] **Step 6: Re-run focused tests**

```bash
node --test tests/repository/c018-ratification.test.mjs tests/repository/repository-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Prove Decision Register remained unchanged**

```bash
git diff main -- docs/decisions/index.md
```

Expected: no diff.

- [ ] **Step 8: Commit Task 2**

```bash
git add -- docs/phases/c-018-final-architecture-ratification.md docs/roadmap.md docs/index.md tests/repository/c018-ratification.test.mjs
git commit -m "docs(c-018): open final architecture ratification gate"
```

---

### Task 3: Remove planning-only artifacts and prove the opening candidate

**Files:**
- Delete: `docs/superpowers/specs/2026-08-21-c-018-final-architecture-ratification-design.md`
- Delete: `docs/superpowers/plans/2026-08-21-c-018-final-architecture-ratification.md`

**Interfaces:**
- Consumes: completed opening candidate.
- Produces: candidate tree containing only durable authority/mechanism/tests; planning artifacts remain only in branch history.

- [ ] **Step 1: Delete planning-only files from candidate tree**

```bash
git rm -- docs/superpowers/specs/2026-08-21-c-018-final-architecture-ratification-design.md docs/superpowers/plans/2026-08-21-c-018-final-architecture-ratification.md
git commit -m "chore(c-018): remove planning-only artifacts from candidate"
```

- [ ] **Step 2: Run complete repository gate**

```bash
npm ci && npm run verify
```

Expected: repository hygiene, documentation reachability, canonical current state, 3N architecture verification, qualification provenance and all repository tests PASS; exit code 0.

- [ ] **Step 3: Inspect exact diff against main**

```bash
git diff --stat main...HEAD
git diff --name-only main...HEAD
```

Expected changed paths only:

```text
docs/index.md
docs/phases/c-018-final-architecture-ratification.md
docs/roadmap.md
scripts/check-current-state.mjs
tests/repository/c018-ratification.test.mjs
tests/repository/repository-contract.test.mjs
```

`docs/decisions/index.md`, Product code, runtime, qualification harnesses and `docs/work/**` must not appear.

---

### Task 4: Publish OPEN C-018 candidate for operator review

**Files:** none beyond Tasks 1–3.

**Interfaces:**
- Consumes: exact green opening candidate HEAD.
- Produces: one Draft PR against current `main`, with roadmap C-018 open and Decision Register C-018 still NOT RATIFIED.

- [ ] **Step 1: Revalidate base before publication**

```bash
git fetch origin
git rev-parse origin/main
git rev-parse HEAD
```

If main moved, stop and rebase/revalidate before publication.

- [ ] **Step 2: Push branch**

```bash
git push -u origin arch/c-018-final-ratification
```

- [ ] **Step 3: Open one Draft PR**

Title:

```text
docs(c-018): open final architecture ratification
```

Body must state:

```text
3A–3O = CLOSED
C-018 roadmap = OPEN / RATIFICATION REVIEW
C-018 Decision Register = NOT RATIFIED
Product implementation = BLOCKED
no Product code / FIRST_BUILD / FIRST_PRODUCTION execution
no new Product requirement / owner / trust boundary / realization selection
npm ci && npm run verify = exact-head evidence
ratification requires a later explicit operator decision
merge requires separate explicit operator authority
```

- [ ] **Step 4: Confirm CI on exact PR HEAD**

Require GitHub Actions `verify = SUCCESS`; confirm both `npm ci` and `npm run verify` succeeded on that exact head.

- [ ] **Step 5: Review exact candidate against R1–R7**

If no Product/owner/trust/qualification contradiction exists, do not create Fable review by default. If a real contradiction exists, stop and return to the smallest owner; use isolated Fable review only when independent challenge materially helps adjudication.

- [ ] **Step 6: STOP for explicit operator ratification**

Do not execute Task 5. Report exact candidate HEAD, CI evidence, changed files, and that C-018 remains NOT RATIFIED in Decision Register.

---

### Task 5: Ratify C-018 — DO NOT EXECUTE WITHOUT EXPLICIT OPERATOR RATIFICATION

**Files:**
- Modify: `tests/repository/c018-ratification.test.mjs`
- Modify: `tests/repository/repository-contract.test.mjs`
- Modify: `scripts/check-current-state.mjs`
- Modify: `docs/roadmap.md`
- Modify: `docs/decisions/index.md`
- Modify: `docs/phases/c-018-final-architecture-ratification.md`

**Interfaces:**
- Consumes: operator-approved exact green OPEN candidate from Task 4.
- Produces: roadmap `C-018 = RATIFIED / OPERATOR RATIFIED`, Decision Register `C-018 = CURRENT / OPERATOR RATIFIED`, 3A–3O still CLOSED, Product implementation still `BLOCKED`.

- [ ] **Step 1: Add RED ratified-state projection test**

Append to `tests/repository/c018-ratification.test.mjs`:

```js
test('ratified C-018 projects operator ratification while Product remains blocked', () => {
  const roadmap = read('docs/roadmap.md')
  const decisions = read('docs/decisions/index.md')
  assert.match(roadmap, /\| C-018 \| RATIFIED \/ OPERATOR RATIFIED \|/)
  assert.match(roadmap, /\| Product implementation \| BLOCKED \|/)
  assert.match(decisions, /\| C-018 \| Final Product architecture ratification\. \| CURRENT \/ OPERATOR RATIFIED \|/)
})
```

Run:

```bash
node --test tests/repository/c018-ratification.test.mjs
```

Expected: FAIL while candidate is still open/not ratified.

- [ ] **Step 2: Add RED ratified-phase-continuity negative control**

Append to `tests/repository/repository-contract.test.mjs`:

```js
test('ratified C-018 cannot coexist with an unclosed architecture phase', () => {
  const path = resolve(root, 'docs/roadmap.md')
  const original = readFileSync(path, 'utf8')
  let mutated = original.replace('| C-018 | OPEN / RATIFICATION REVIEW |', '| C-018 | RATIFIED / OPERATOR RATIFIED |')
  mutated = mutated.replace('| 3O | CLOSED |', '| 3O | OPEN / ACTIVE |')
  if (mutated === original) throw new Error('C-018 ratified-continuity mutation target missing')
  writeFileSync(path, mutated)
  try {
    const result = run('scripts/check-current-state.mjs')
    const output = `${result.stdout}\n${result.stderr}`
    if (result.status === 0 || !output.includes('C-018 ratification requires all phases CLOSED')) {
      throw new Error(`C-018 ratified continuity negative control did not fire:\n${output}`)
    }
  } finally {
    writeFileSync(path, original)
  }
})
```

Run:

```bash
node --test tests/repository/repository-contract.test.mjs
```

Expected: FAIL because the open-state checker does not yet admit/validate the ratified suffix state with the required message.

- [ ] **Step 3: Extend current-state guard only enough to admit explicit ratification**

Change:

```js
const allowedC018Statuses = new Set(['NOT RATIFIED', 'OPEN / RATIFICATION REVIEW'])
```

to:

```js
const allowedC018Statuses = new Set(['NOT RATIFIED', 'OPEN / RATIFICATION REVIEW', 'RATIFIED / OPERATOR RATIFIED'])
```

Replace the open-only phase-continuity block with:

```js
if (c018Status === 'OPEN / RATIFICATION REVIEW' && phases.some(({ status }) => status !== 'CLOSED')) {
  errors.push('C-018 ratification review requires all phases CLOSED')
}
if (c018Status === 'RATIFIED / OPERATOR RATIFIED' && phases.some(({ status }) => status !== 'CLOSED')) {
  errors.push('C-018 ratification requires all phases CLOSED')
}
```

Remove the obsolete exact-string rule if still present:

```js
if (byName.get('C-018') === 'RATIFIED' && phases.some(({ status }) => status !== 'CLOSED')) errors.push('C-018 cannot be RATIFIED before all phases close')
```

After Decision Register parsing, add:

```js
if (c018Status === 'RATIFIED / OPERATOR RATIFIED' && c018DecisionStatus !== 'CURRENT / OPERATOR RATIFIED') {
  errors.push(`ratified C-018 must project CURRENT / OPERATOR RATIFIED in the Decision Register; got ${c018DecisionStatus ?? 'missing'}`)
}
```

Preserve unchanged:

```js
if (byName.get('Product implementation') !== 'BLOCKED') {
  errors.push('Product implementation must remain BLOCKED until a later Realization Planning / explicit execution-authority gate')
}
```

- [ ] **Step 4: Update Decision Register only now**

Replace only C-018 row with:

```markdown
| C-018 | Final Product architecture ratification. | CURRENT / OPERATOR RATIFIED | 3A–3O closed; the continuity gate passed on an exact green candidate and the operator explicitly ratified the accepted architecture. | Accepted architecture is the current implementation target; Product implementation still requires Realization Planning plus explicit execution authority. | None | [ROADMAP.md](../roadmap.md), [C-018 contract](../phases/c-018-final-architecture-ratification.md) | Material Product/owner/trust/qualification contradiction or first-build/first-production Evidence invalidates an accepted invariant |
```

Do not change C-001..C-017 unless independent material Evidence requires it.

- [ ] **Step 5: Update roadmap ratification state while keeping Product blocked**

Set rows:

```markdown
| C-018 | RATIFIED / OPERATOR RATIFIED | Final Product architecture ratified; implementation-dependent proof remains routed forward | Material Evidence invalidates an accepted architecture invariant |
| Product implementation | BLOCKED | Requires Realization Planning and explicit execution authority after C-018 ratification | No ratification or historical authorization alone unblocks implementation |
```

Status block:

```text
C-018 = RATIFIED / OPERATOR RATIFIED
Product implementation = BLOCKED
```

Exact next action becomes Realization Planning under a separately authorized gate.

- [ ] **Step 6: Append durable ratification result**

Add to C-018 contract:

```markdown
## Ratification result

C-018 was explicitly operator-ratified after R1–R7 continuity passed on the exact green candidate. No Product requirement, semantic owner, trust boundary, qualification scope or realization mechanism was added by ratification. All FIRST_BUILD/FIRST_PRODUCTION obligations remain mandatory. Product implementation remains BLOCKED pending Realization Planning and explicit execution authority.
```

- [ ] **Step 7: Re-run focused tests then full gate**

```bash
node --test tests/repository/c018-ratification.test.mjs tests/repository/repository-contract.test.mjs
npm ci && npm run verify
```

Expected: all PASS / exit code 0.

- [ ] **Step 8: Confirm closure diff contains no Product implementation**

```bash
git diff --name-only main...HEAD
```

Allowed changes remain documentation/guard/tests only. No Product source/runtime/qualification harness or `docs/work/**` file may appear.

- [ ] **Step 9: Update PR body and STOP for merge authority**

Record exact closure HEAD + CI run. Do not merge until operator separately authorizes merge.

---

## Plan Self-Review Result

- Spec coverage: opening status, Decision Register non-promotion, R1–R7 continuity, deny-only Product gate, no forced Fable replay, planning-artifact cleanup, explicit ratification gate and separate merge gate are all mapped to tasks.
- Placeholder scan: no `TBD`, `TODO`, “implement later”, unspecified test, or open-ended error-handling step remains.
- State consistency: opening allows only `NOT RATIFIED | OPEN / RATIFICATION REVIEW`; ratified suffix is introduced only in Task 5 after explicit operator ratification; both open and ratified states require 3A–3O `CLOSED`; Product remains `BLOCKED` in all C-018 states.
- Decision vocabulary consistency: opening preserves `NOT RATIFIED`; closure uses existing controlled `CURRENT / OPERATOR RATIFIED` rather than inventing a new Decision Register disposition.
