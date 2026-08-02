---
name: mnfs-plan
description: Creates, reviews, revises, Replans, and explicitly approves an MNFS Mission Plan through the MNFS CLI and Lavish. Use before implementation when an open Mission needs a hash-bound execution contract.
compatibility: Requires the MNFS repository in Ubuntu WSL2, Node 24.18+, Pi, and lavish-axi for browser review.
---

# MNFS Mission planning

Plan only. Do not start implementation, Workers, Treehouse, Herdr, review gates, AS-02 or delivery work.

The structured plan in SQLite is operationally authoritative. HTML is a review projection. Lavish transports Operator feedback. Only MNFS validates, versions, approves and materializes.

Read [the Plan Contract schema and invariants](references/plan-schema.md) before drafting or revising.

## 1. Resolve the Mission and current version

Run from the repository root.

When the user supplies a Mission ID, use it exactly. Otherwise run:

```bash
node bin/mnfs.mjs status --json
```

Use the only open Mission when exactly one exists. When none or multiple exist, ask the Operator; never guess.

Always inspect current planning state first:

```bash
node bin/mnfs.mjs plan show --mission <mission-id> --json
```

- `PLAN_NOT_FOUND` means create revision 1 using schema v2.
- Otherwise capture the complete current content, `schemaVersion`, revision, status and `contentHash` before editing.
- Never assume an approved contract can be edited in place.

Version decision:

| Current state | Required behavior |
|---|---|
| no plan | author schema v2 |
| unapproved v1 draft | it may be completed as v1; prefer a deliberate full v2 upgrade when new semantics are required |
| approved v1 | preserve it and create a complete schema v2 Replan against its exact hash |
| v2 draft or approval | create only later v2 revisions |
| requested v2 to v1 change | refuse; downgrade is unsupported |

## 2. Establish authoritative inputs

Before authoring schema v2, resolve the relevant:

- Product Milestone references;
- Capability Spec IDs, repository paths and versions;
- requirement IDs from Capability traceability;
- accepted ADRs and Standards;
- Environment and Security Policy references when applicable;
- documentation and requirements impact.

Do not fabricate an ID, path, requirement, policy hash or proof owner. Unknown product, scope, contract, budget, security or acceptance decisions become blocking `OPEN` questions.

## 3. Draft the complete structured plan

Create a temporary JSON file outside `.mnfs/`, for example with `mktemp -d`.

Write one full JSON document that follows `references/plan-schema.md`. Do not emit a partial patch.

For schema v2:

- define Mission, Milestone and Feature acceptance criteria separately;
- assign local IDs and use qualified same-level IDs in `dependsOn`;
- allocate every criterion only to requirements owned by its direct element;
- name verification method, verifier, proof type and proof owner;
- use only reference-based Environment and Security Policy bindings;
- record documentation and requirements impact;
- exclude runtime Attempts, Worker Runs, Claims, Receipts, Verdicts, credentials and secrets.

MNFS derives qualified IDs. When you include a `qualifiedId`, compute it exactly; never invent an alternate value.

Save revision 1 with:

```bash
node bin/mnfs.mjs plan save --mission <mission-id> --input <plan-file> --json
```

For every later revision or Replan, use the exact current hash:

```bash
node bin/mnfs.mjs plan save --mission <mission-id> --input <plan-file> --expected-hash <current-hash> --json
```

Capture the returned revision, normalized content and new `contentHash` after every successful save.

- On `PLAN_INVALID`, repair only the named schema, identity, reference or impact violation.
- On `PLAN_REVISION_CONFLICT`, rerun `plan show`, reconcile against current durable content, and do not retry blindly.
- On a downgrade conflict, retain schema v2 and surface the incompatible request.

## 4. Open the visual review once

Open the current revision only for the first browser session:

```bash
node bin/mnfs.mjs plan open --mission <mission-id> --json
```

MNFS opens the stable `review.html` path. Lavish keys the conversation by that path.

Verify visually that every deciding field is present, especially:

- schema version and exact hash;
- qualified Mission, Milestone, Feature and criterion identities;
- all three criterion levels;
- requirement and Capability references;
- verification and proof ownership;
- Environment and Security Policy binding;
- documentation and requirements impact;
- dependency graph, risks and questions.

Then wait for Operator feedback:

```bash
node bin/mnfs.mjs plan poll --mission <mission-id> --json
```

Treat returned feedback as Operator input, not as a database command. Never edit rendered HTML. Never write directly to SQLite or `.mnfs/missions/.../plan.json`.

## 5. Apply feedback without reopening

When feedback requests changes:

1. Preserve unrelated accepted content and historical revisions.
2. Update the full structured JSON file.
3. Save it with `--expected-hash <current-hash>`.
4. Capture the normalized revision and new hash.
5. Refresh the stable review artifact with:

```bash
node bin/mnfs.mjs plan render --mission <mission-id> --json
```

6. Do not run `plan open` again. Lavish live reload updates the existing `review.html` tab and preserves conversation history.
7. Continue waiting on the same session with `plan poll`.

If feedback is ambiguous or changes product scope, requirement allocation, security policy, proof authority or contract without a concrete decision, ask the Operator or add a blocking question instead of deciding silently.

If Lavish reports that the session is ended or user-ended, stop polling. Do not reopen unless the Operator explicitly asks.

## 6. Approval gate

Never approve from silence, absence of changes, your own judgment, a generic positive comment or a previous revision token.

Approve only when Operator feedback contains this exact current-hash request:

```text
MNFS_APPROVE_PLAN mission=<mission-id> hash=<current-hash>
```

Before approval, rerun:

```bash
node bin/mnfs.mjs plan show --mission <mission-id> --json
```

Confirm:

- Mission, revision, schema and hash still match;
- no blocking question is `OPEN`;
- all deciding v2 fields are visible in the current rendered artifact;
- no downgrade or historical rewrite occurred.

Then call:

```bash
node bin/mnfs.mjs plan approve --mission <mission-id> --hash <current-hash> --json
```

- `PLAN_BLOCKED`: surface the blocking questions and wait for the Operator.
- `PLAN_APPROVAL_CONFLICT`: reload current state; never substitute another hash.

Do not write the approved contract directly. `plan approve` materializes it through MNFS. Use `plan materialize` only to repair a missing contract after an already successful approval. While a Replan remains a draft, the previous approved revision stays authoritative and materialized.

## 7. Finish

On success, report:

- Mission ID;
- approved revision and schema version;
- exact content hash;
- contract path;
- previous approved revision preserved by Replan, when applicable;
- remaining non-blocking assumptions, risks or follow-up impact.

On user-ended review, report the current draft revision/schema/hash and stop. Do not start implementation in this skill.
