---
id: EVID-PLAN-CONTRACT-SCHEMA-V2
title: Mission Plan Contract schema v2 verification evidence
document_type: acceptance_evidence
form: explanation
authority: evidence
status: completed
owners:
  - developmentconexus-ops
related:
  - DESIGN-PLAN-CONTRACT-SCHEMA-V2
  - CAP-EXECUTION
tracking_issue: 7
---

# Mission Plan Contract schema v2 verification evidence

**Date:** 2026-08-02  
**Branch:** `feat/plan-schema-v2`  
**Pull request:** #12  
**Verified implementation head:** `5e7f41e714d2632fa672d235ecfba06ef58a1461`  
**Canonical environment:** GitHub Actions Ubuntu 24.04 with Node.js 24.18.0 and npm 11.16.0  
**Workflow run:** `30764704736`, job `91541239981`

## Outcome

The automated acceptance surface for Issue #7 is green. The proof establishes the schema implementation and compatibility machinery; it does not approve a new `MIS-002` revision, execute AS-02 or unblock M2.

## Canonical command

```bash
npm ci
npm run verify
```

Observed pipeline:

```text
tsc --noEmit
npm run build --silent
node scripts/run-tests.mjs
npm run docs:test
node scripts/validate-docs.mjs
```

Result:

```text
94 tests
94 passed
0 failed
0 cancelled
0 skipped
Documentation tooling tests passed
Documentation validation passed
```

The pull-request check reruns the same complete gate after evidence and tracking changes; the PR may leave draft only when its current HEAD is green.

## Acceptance proof mapping

| Required proof | Evidence |
|---|---|
| Create a schema v2 Mission | v2 fixtures pass versioned domain and service ingestion |
| Validate and normalize v2 | schema happy path returns normalized content |
| Qualified IDs are consistent | Mission, Milestone, Feature and all criterion identities are derived and mismatch is rejected |
| Mission/Milestone/Feature criteria | all levels are mandatory, rendered and separately tested |
| Capability and requirement references | Capability path/version and hierarchical requirement allocation are validated |
| Environment/Security binding without secrets | only references and optional policy hash are accepted; unknown secret-bearing fields fail |
| Deterministic hash | normalized content hashes stably; schema version and array order remain semantic |
| Complete Lavish projection | every deciding v2 field appears in deterministic escaped HTML |
| Exact-hash approval | service and existing walking skeleton reject stale approval and approve the exact current hash |
| Atomic contract publication | approval publishes the versioned file through atomic rename; failure remains repairable from SQLite |
| Fresh-process approved recovery | a new store instance recovers the exact approved v2 revision and hash |
| Schema v1 readability | the versioned reader validates v1 and existing v1 tests remain green |
| Historical v1 materialization | existing service and walking-skeleton materialization tests remain green |
| `MIS-002` revision 3 immutable | branch diff excludes the file; test verifies exact Git blob SHA and content hash |
| v1 to v2 Replan | an approved v1 remains historical while an exact-hash v2 draft and later approval are created |
| Downgrade behavior | v2 to v1 and historical rewind are rejected |
| Unknown-field behavior | unknown fields fail closed instead of disappearing during normalization |
| HTML escaping | v2 semantic fields and qualified graph identities are escaped and deterministic |
| Pi planning guidance | static tests require new plans/Replans as v2 and preserve v1 history |

## Historical preservation

The automated proof reads the committed file without modifying it and asserts:

```text
Path:
.mnfs/missions/MIS-002/plan.json

Revision:
3

Git blob SHA:
6b79117fe66cd5c9c8142099828812f470ce20de

Content hash:
sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1
```

The v1 reader recomputes the same content hash.

## Adversarial checks

The suite explicitly rejects:

- mismatched qualified identities;
- duplicate local IDs inside one owner;
- local or cross-level dependencies in v2;
- unknown references and cycles;
- malformed requirement IDs;
- criterion references outside owner allocation;
- element requirements outside the Mission set;
- unknown fields and arbitrary Environment fields;
- malformed Security Policy hashes;
- stale Replan hashes;
- approved v1 rewrites;
- v2 downgrades;
- reuse of older historical content to rewind state;
- approval with an open blocking question;
- stale exact-hash approval.

## Diff boundary

The changed-file review contains only planning domain, persistence, rendering, Pi skill, tests and documentation. It does not include:

```text
.mnfs/missions/MIS-002/plan.json
Worker implementation
AS-02 execution code
Herdr or remote execution integration
cloud contract format
generic policy DSL
```

## Remaining blockers

Issue #7 does not make M2 Contract Readiness pass. The required order remains:

```text
Issue #8 — execute AS-02 on canonical WSL2
→ Issue #9 — create the MIS-002 schema v2 Replan
→ Operator reviews and approves the exact new hash
→ mechanically rerun MCRM R0–R4
→ explicit Operator unblock
→ begin M2 implementation
```

R4 remains `BLOCKED` until those later proofs exist.
