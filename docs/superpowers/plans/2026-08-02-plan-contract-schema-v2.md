---
id: PLAN-MISSION-PLAN-SCHEMA-V2
title: Mission Plan Contract schema v2 implementation plan
document_type: implementation_plan
form: explanation
authority: specification
status: implementing
owners:
  - developmentconexus-ops
related:
  - DESIGN-PLAN-CONTRACT-SCHEMA-V2
  - DESIGN-PLAN-CONTRACT-SCHEMA-V2-READINESS
  - CAP-EXECUTION
tracking_issue: 7
---

# Mission Plan Contract schema v2 implementation plan

> **For agentic workers:** Use TDD and complete each proof before moving to the next increment. Do not implement M2 Worker behavior in this plan.

**Goal:** Add a versioned Mission Plan Contract capable of hierarchical acceptance, qualified identity, requirement/proof allocation, environment/security binding and explicit impact while preserving schema v1 history.

**Architecture:** Extend the planning domain as a discriminated v1/v2 union. Validate and normalize before canonical hashing. Keep immutable approved revisions in SQLite, permit exact-hash forward Replan, reject downgrade, and render every deciding v2 field through the existing deterministic Lavish projection.

**Tech Stack:** TypeScript 5.9, Node.js 24.18+, `node:test`, SQLite through `node:sqlite`, existing MNFS CLI and Lavish adapter.

## Global constraints

- Do not modify `.mnfs/missions/MIS-002/plan.json` revision 3.
- Do not implement Worker, AS-02, generic policy DSL, remote contracts or cloud execution.
- Preserve schema v1 reading, hashing, recovery, approval and materialization.
- Do not silently discard unknown fields or downgrade v2.
- Keep CLI file-based planning commands stable.
- Run `npm run verify` and inspect the complete output before claiming completion.

---

### Task 1: Versioned domain and qualified identities

**Files:**
- Modify: `src/domain/mission-plan.ts`
- Modify: `tests/domain/mission-plan.test.ts`
- Create: `tests/domain/mission-plan-v2.test.ts`
- Create: `tests/fixtures/mission-plans.ts`

- [x] Add failing tests for v2 shape, all criterion levels and derived qualified IDs.
- [x] Add failing tests for duplicate, ambiguous, cross-level and unknown references.
- [x] Add tests for requirement allocation, environment binding, impact and unknown-field rejection.
- [x] Implement discriminated v1/v2 types and versioned validation.
- [x] Preserve canonical serialization and v1 hash behavior.
- [x] Add exact `MIS-002` Git blob SHA and content-hash preservation proof.

### Task 2: Immutable approval history and Replan

**Files:**
- Modify: `src/store/migrations.ts`
- Modify: `src/store/sqlite-store.ts`
- Modify: `src/services/mission-plan-service.ts`
- Create: `tests/store/mission-plan-schema-v2-store.test.ts`
- Create: `tests/services/mission-plan-schema-v2-service.test.ts`

- [x] Add migration test starting from the M1 database schema.
- [x] Add tests preserving an approved v1 row while approving a later v2 revision.
- [x] Add exact-current-hash and historical-rewind rejection tests.
- [x] Add v1-to-v2 Replan and v2-to-v1 downgrade tests.
- [x] Add fresh-process recovery tests.
- [x] Make latest approved—not current draft—the materialization source.

### Task 3: Complete Lavish projection

**Files:**
- Modify: `src/planning/dependency-graph.ts`
- Modify: `src/planning/render-plan.ts`
- Modify: `tests/planning/render-plan.test.ts`
- Create: `tests/planning/render-plan-v2.test.ts`

- [x] Add tests requiring every deciding v2 field in HTML.
- [x] Add escaping tests for new semantic surfaces.
- [x] Add qualified dependency node and edge tests.
- [x] Render hierarchical criteria, proof ownership, traceability, environment/security and impact.
- [x] Preserve deterministic self-contained output and exact-hash controls.

### Task 4: Pi planning contract and documentation

**Files:**
- Modify: `.pi/skills/mnfs-plan/SKILL.md`
- Modify: `.pi/skills/mnfs-plan/references/plan-schema.md`
- Modify: `tests/pi/mnfs-plan-skill.test.ts`
- Create: `docs/design/PLAN-CONTRACT-SCHEMA-V2.md`
- Modify: `docs/tracking/STATUS.md`
- Modify: `docs/tracking/WORKLOG.md`

- [x] Publish the schema v2 reference and compatibility matrix.
- [x] Make Pi author new plans and Replans as v2.
- [x] Preserve the ability to finish an existing unapproved v1 draft.
- [x] Require authoritative Capability, requirement, environment, security and proof references.
- [x] Document non-goals, failure modes and impact.
- [ ] Update tracking after canonical verification completes.

### Task 5: Adversarial review and canonical proof

**Proofs:**

```bash
npm run verify

git diff --check
git diff --name-only main...HEAD
git hash-object .mnfs/missions/MIS-002/plan.json
```

- [ ] Confirm the full TypeScript compile is green on Node.js 24.18.0.
- [ ] Confirm all unit and walking-skeleton tests are green.
- [ ] Confirm documentation tooling, schemas and generated-projection freshness are green.
- [ ] Confirm the historical contract is absent from the branch diff.
- [ ] Confirm its Git blob SHA remains `6b79117fe66cd5c9c8142099828812f470ce20de`.
- [ ] Inspect the complete branch diff for accidental Worker or AS-02 implementation.
- [ ] Record verification evidence in the PR and tracking documents.
