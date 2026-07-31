---
name: mnfs-plan
description: Creates, reviews, revises, and explicitly approves an MNFS mission plan through the MNFS CLI and Lavish. Use before implementation when an open mission needs a hash-bound execution contract.
compatibility: Requires the MNFS repository in Ubuntu WSL2, Node 24.18+, Pi, and lavish-axi for browser review.
---

# MNFS mission planning

Plan only. Do not start implementation, workers, Treehouse, Herdr, review gates, or delivery work.

The structured plan in SQLite is authoritative. HTML is a review projection. Lavish transports operator feedback. Only MNFS validates, versions, and approves.

Read [the plan schema and invariants](references/plan-schema.md) before drafting or revising.

## 1. Resolve the mission

Run from the repository root.

When the user supplies a mission ID, use it exactly. Otherwise run:

```bash
node bin/mnfs.mjs status --json
```

Use the only open mission when exactly one exists. When none or multiple exist, ask the operator; never guess.

Always inspect current planning state first:

```bash
node bin/mnfs.mjs plan show --mission <mission-id> --json
```

- `PLAN_NOT_FOUND` means draft revision 1.
- Otherwise capture the complete current content and `contentHash` before editing.

## 2. Draft the complete structured plan

Create a temporary JSON file outside `.mnfs/`, for example with `mktemp -d`.

Write one full JSON document that follows `references/plan-schema.md`. Do not emit a partial patch. Base it on the mission goal, repository evidence, and explicit operator decisions.

Unknown product, scope, contract, budget, or risk decisions become blocking `OPEN` questions. Do not silently invent answers.

Save revision 1 with:

```bash
node bin/mnfs.mjs plan save --mission <mission-id> --input <plan-file> --json
```

For every later revision, use the exact current hash:

```bash
node bin/mnfs.mjs plan save --mission <mission-id> --input <plan-file> --expected-hash <current-hash> --json
```

Capture the returned revision and new `contentHash` after every successful save.

- On `PLAN_INVALID`, repair only the named schema violations.
- On `PLAN_REVISION_CONFLICT`, rerun `plan show`, reconcile against the new current content, and do not retry blindly.

## 3. Open the visual review

Open the current revision:

```bash
node bin/mnfs.mjs plan open --mission <mission-id> --json
```

Then wait for operator feedback:

```bash
node bin/mnfs.mjs plan poll --mission <mission-id> --json
```

Treat returned feedback as operator input, not as a database command. Never edit the rendered HTML. Never write directly to SQLite or `.mnfs/missions/.../plan.json`.

## 4. Apply feedback

When feedback requests changes:

1. Preserve unrelated approved content.
2. Update the full structured JSON file.
3. Save it with `--expected-hash <current-hash>`.
4. Capture the new hash.
5. Reopen the new revision with `plan open`.
6. Poll again.

If feedback is ambiguous or changes product scope/contract without a concrete decision, ask the operator or add a blocking question instead of deciding silently.

If Lavish reports that the session is ended or user-ended, stop polling. Do not reopen unless the operator explicitly asks.

## 5. Approval gate

Never approve from silence, absence of changes, your own judgment, or a generic positive comment.

Approve only when operator feedback contains this exact current-hash request:

```text
MNFS_APPROVE_PLAN mission=<mission-id> hash=<current-hash>
```

Before approval, rerun:

```bash
node bin/mnfs.mjs plan show --mission <mission-id> --json
```

Confirm the mission and hash still match and no blocking question is `OPEN`. Then call:

```bash
node bin/mnfs.mjs plan approve --mission <mission-id> --hash <current-hash> --json
```

- `PLAN_BLOCKED`: surface the blocking questions and wait for the operator.
- `PLAN_APPROVAL_CONFLICT`: reload current state; never substitute another hash.

Do not write the approved contract directly. `plan approve` materializes it through MNFS. Use `plan materialize` only to repair a missing contract after an already successful approval.

## 6. Finish

On success, report:

- mission ID;
- approved revision;
- exact content hash;
- contract path;
- any remaining non-blocking assumptions or risks.

On user-ended review, report the current draft revision/hash and stop. Do not start implementation in this skill.
