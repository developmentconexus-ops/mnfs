---
id: DESIGN-PLAN-CONTRACT-SCHEMA-V2
title: Mission Plan Contract schema v2 microdesign
document_type: microdesign
form: explanation
authority: specification
status: implementing
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - DESIGN-PLAN-CONTRACT-SCHEMA-V2-READINESS
  - CAP-EXECUTION
  - ADR-0002
  - ADR-0005
  - ADR-0012
source_of_truth_for:
  - Mission Plan Contract schema v2 shape
  - schema v1 and v2 compatibility behavior
  - qualified Mission Plan identity rules
  - Mission Plan Replan and downgrade behavior
review_triggers:
  - Mission Plan schema changes
  - approval or materialization semantics change
  - hierarchical criteria or proof ownership change
last_reviewed: 2026-08-02
tracking_issue: 7
---

# Mission Plan Contract schema v2 microdesign

## 1. Outcome

Schema v2 extends the accepted M1 planning contract without rewriting schema v1 history. It makes Mission, Milestone and Feature acceptance explicit, binds criteria to requirements and proof ownership, identifies every hierarchical element unambiguously, and carries environment, security, documentation and requirements impact into exact-hash review.

This design is bounded to Issue #7. It does not implement a Worker, AS-02, a generic policy language, remote execution or the `MIS-002` Replan itself.

## 2. Baseline and invariants

The implementation preserves these invariants:

1. `.mnfs/missions/MIS-002/plan.json` revision 3 remains byte-for-byte unchanged.
2. Schema v1 content continues to validate, hash, recover and materialize.
3. Approved revisions are historical records and are never edited or demoted.
4. A Replan creates a later revision and requires the exact current hash.
5. A schema v2 revision cannot be downgraded to schema v1.
6. Unknown fields fail validation rather than disappearing during normalization.
7. The schema version is part of canonical content and therefore part of the content hash.
8. HTML remains a projection. SQLite remains operational authority. Git remains contract authority after materialization.
9. Approval remains bound to the exact current content hash.
10. M2 remains blocked after Issue #7 until AS-02, the `MIS-002` Replan, exact-hash approval, MCRM R0–R4 and explicit Operator unblock.

## 3. Schema v1 inventory

| Concern | Current implementation | Schema v1 behavior | Schema v2 change | Compatibility rule |
|---|---|---|---|---|
| Domain types | `src/domain/mission-plan.ts` | One closed `MissionPlanContent` interface | Discriminated `MissionPlanContentV1 | MissionPlanContentV2` | v1 type and semantics remain available |
| Validation | `validateMissionPlan` | Accepts only `schemaVersion: 1` | Dispatches by schema version and normalizes v2 qualified IDs | v1 input follows the original validation path |
| Identity | `src/domain/mission-plan.ts` | Local `M01` and globally unique `F01` | Derived qualified Mission, Milestone, Feature and criterion IDs | v1 local IDs remain unchanged |
| Acceptance | `successCriteria` and Feature strings | Mission criteria are strings; no Milestone criteria | Structured criteria at Mission, Milestone and Feature levels | v1 renderer preserves historical labels |
| References | local `dependsOn` | same-category local references | v2 dependencies use qualified same-level identities | local dependency syntax is accepted only in v1 |
| Traceability | not representable | no Capability or requirement binding | Product Milestone, Capability Spec and requirement references | optional allocation within v2 structure, never inferred |
| Verification | not representable | criteria have no proof owner | criterion verification method, verifier, proof type and proof owner | no synthetic verification metadata added to v1 |
| Environment/security | not representable | absent | repository-owned environment and security policy references plus optional policy hash | secrets and arbitrary unknown fields are rejected |
| Impact | external PR convention | absent from contract | structured documentation and requirements impact | status/reference consistency is validated |
| Canonical serialization | `canonicalJson` | object keys sorted; array order semantic | unchanged algorithm over normalized versioned content | historical v1 hashes reproduce exactly |
| Persistence | `src/store/sqlite-store.ts` | revisions stored as JSON; one approved row per Mission | multiple immutable approved revisions are retained | latest approved revision is the materialization source |
| Approval | `MissionPlanService` and store | exact-current-hash approval | unchanged exact-hash gate | existing v1 drafts remain approvable |
| Replan | blocked after approval | no later revision after approval | exact-hash later draft is permitted | approved v1 may move only to v2 |
| Materialization | `.mnfs/missions/<id>/plan.json` | outer schema hard-coded to 1 | outer schema follows approved content version | v1 contract shape remains readable |
| Recovery | SQLite row cast | JSON was trusted as v1 | every recovered row is validated through the versioned reader | unsupported or malformed persisted content fails closed |
| HTML/Lavish | `src/planning/render-plan.ts` | v1 sections and local identities | all v2 deciding fields are rendered and escaped | exact-hash controls remain unchanged |
| Dependency graph | `src/planning/dependency-graph.ts` | local graph IDs | v2 graph uses qualified identities | v1 graph output is preserved |
| CLI | file-based planning commands | save/show/render/open/poll/approve/materialize | no command proliferation; JSON payload carries version | existing CLI contracts remain stable |
| Pi skill | `.pi/skills/mnfs-plan/` | authors schema v1 | authors new contracts and Replans as schema v2 | can inspect and finish an existing v1 draft |
| Historical contract | `.mnfs/missions/MIS-002/plan.json` | approved revision 3 | unchanged | CI recomputes blob SHA and content hash |

## 4. Schema v2 shape

### 4.1 Mission

A schema v2 Mission contains:

```text
schemaVersion: 2
missionId
title
goal
acceptanceCriteria[]
scope
assumptions[]
productMilestoneRefs[]
capabilityRefs[]
requirementRefs[]
environmentBinding?
documentationImpact
requirementsImpact
milestones[]
risks[]
questions[]
```

Mission `acceptanceCriteria` replace the ambiguous v1 `successCriteria` field for new contracts. Each criterion contains:

```text
id
qualifiedId derived by MNFS
statement
requirementRefs[]
verificationPlan:
  method
  owner
  proofType
  proofOwner
```

Verification metadata names the planned authority and proof. It does not create a Receipt, Verdict or runtime state.

### 4.2 Milestone

A schema v2 Milestone contains:

```text
id
qualifiedId derived by MNFS
title
outcome
acceptanceCriteria[]
requirementRefs[]
environmentBinding?
dependsOn[]
features[]
```

Milestone acceptance is mandatory. Feature completion cannot mechanically imply Milestone acceptance; the Milestone criteria are a separate contract surface.

### 4.3 Feature

A schema v2 Feature contains:

```text
id
qualifiedId derived by MNFS
title
outcome
acceptanceCriteria[]
requirementRefs[]
dependsOn[]
```

Feature local IDs need only be unique inside their parent Milestone. The qualified identity is globally unambiguous inside the Mission.

## 5. Qualified identity rules

MNFS derives identities from validated local IDs:

```text
Mission                       MIS-002
Milestone                     MIS-002/M01
Feature                       MIS-002/M01/F01
Mission criterion             MIS-002/AC-01
Milestone criterion           MIS-002/M01/AC-01
Feature criterion             MIS-002/M01/F01/AC-01
```

Rules:

- Mission IDs use `MIS-<three-or-more digits>`.
- Milestone local IDs use `M<two-or-more digits>`.
- Feature local IDs use `F<two-or-more digits>`.
- criterion local IDs use `AC-<two-or-more digits>`.
- local criterion IDs are unique within their owner.
- Feature local IDs are unique within one Milestone, not across the Mission.
- a supplied `qualifiedId` is accepted only when it exactly equals the derived identity.
- normalized schema v2 content always stores the derived `qualifiedId`.

## 6. Reference rules

### 6.1 Dependencies

Schema v2 `dependsOn` values are qualified identities:

```text
Milestone → Milestone
Feature → Feature
```

A dependency must:

- resolve to an existing element at the same level;
- not reference itself;
- not cross Mission/Milestone/Feature levels;
- not create a cycle.

Local IDs such as `F01` are rejected in v2 because they become ambiguous when different Milestones reuse local Feature IDs.

### 6.2 Requirement allocation

Mission `requirementRefs` define the contract requirement set. Milestone and Feature requirement references must be subsets of that set. A criterion may reference only requirements allocated to its direct owner.

This prevents a criterion from claiming coverage for an undeclared or differently allocated requirement.

### 6.3 Capability and document references

A Capability reference contains a stable Capability ID, repository-relative Markdown path and optional version. Paths are data references only; validation rejects absolute paths, parent traversal, Windows separators and non-Markdown targets.

The contract validates identifier shape and internal allocation. Repository document existence remains a contract-readiness/documentation check rather than a hidden filesystem dependency in canonical hashing.

## 7. Environment and security binding

An Environment binding contains only:

```text
environmentRef
securityPolicyRef
securityPolicyHash?
```

It may appear at Mission scope and be overridden at Milestone scope. It does not contain credentials, secret values, tokens, host paths or arbitrary policy content. Unknown fields are rejected, which prevents secret-bearing material from being silently normalized into the contract.

The optional hash binds the contract to frozen policy content once such content exists. Issue #7 does not define the E1 policy or execute AS-02.

## 8. Documentation and requirements impact

### Documentation impact

Allowed states:

```text
NONE
UPDATED
FOLLOW_UP_REQUIRED
```

Rules:

- `NONE` requires an empty reference list and no follow-up.
- affected states require at least one document reference.
- `FOLLOW_UP_REQUIRED` requires a concrete follow-up statement.

### Requirements impact

Allowed states:

```text
NONE
UPDATED
NEW_REQUIREMENT
REPLAN_REQUIRED
```

Rules:

- `NONE` requires an empty reference list.
- affected states require at least one requirement reference.

These structures record impact; they do not automatically mutate Capability traceability or documentation.

## 9. Normalization and hashing

The validator returns the complete normalized versioned content. Normalization:

- trims semantic strings;
- derives qualified IDs;
- removes no unknown data silently because unknown keys fail;
- preserves array order;
- preserves optional-field absence;
- validates all internal references before persistence.

Canonical JSON recursively sorts object keys and preserves array order. SHA-256 covers the full normalized content, including `schemaVersion`. Therefore:

```text
same semantic normalized v2 content → same hash
array reordering                     → different hash
schema v1 versus schema v2           → different hash
unknown field                         → validation failure, not hash omission
```

The algorithm is unchanged for v1 and reproduces the accepted `MIS-002` revision 3 content hash.

## 10. Compatibility matrix

| Operation | v1 | v2 | Result |
|---|---:|---:|---|
| Read and validate historical content | yes | yes | supported |
| Recover from SQLite in a fresh process | yes | yes | supported through versioned validation |
| Materialize an approved contract | yes | yes | supported; outer version follows content |
| Continue editing an existing unapproved v1 draft | yes | n/a | supported to preserve M1 workflows |
| Approve an existing v1 draft | yes | n/a | supported |
| Start a new plan through current Pi guidance | no | yes | Pi authors v2 |
| Create a later v1 revision after v1 approval | no | n/a | rejected; approved history is immutable |
| Replan approved v1 to v2 | yes | yes | supported with exact current hash |
| Revise v2 to later v2 | n/a | yes | supported with exact current hash |
| Downgrade v2 to v1 | no | no | explicitly rejected |
| Reuse content from an older revision to rewind | no | no | explicitly rejected |
| Unknown fields | reject | reject | fail closed |
| Edit an approved row in place | no | no | prohibited |

The parser retains v1 compatibility. Product guidance makes v2 the format for new work; the runtime does not destroy the ability to complete an already-created v1 draft.

## 11. Persistence and Replan

Migration v3 removes the database rule that limited a Mission to one approved row. That old rule made historical approval incompatible with Replan.

The new invariant is:

```text
zero or one current highest revision
zero or more immutable historical approved revisions
zero or one current draft, which is always the highest revision
latest approved revision = highest APPROVED revision
```

Saving a later revision requires `expectedPreviousHash` equal to the exact current revision hash. When the current revision is a draft, it becomes `SUPERSEDED`. When it is approved, it remains `APPROVED` and the later revision is created as a draft.

Materialization reads the latest approved revision rather than the current revision. Consequently, while a Replan is still a draft, the previous approval remains the repository contract. Approving the new exact hash atomically changes the materialized contract to the later approval.

## 12. Rendering and Operator review

Lavish renders every deciding v2 field:

- schema version and exact hash;
- Mission, Milestone, Feature and criterion qualified IDs;
- all three levels of acceptance criteria;
- requirement allocations;
- verification method, verifier, proof type and proof owner;
- Product Milestone and Capability references;
- Environment and Security Policy binding;
- documentation and requirements impact;
- qualified dependency graph;
- risks and questions.

All semantic strings are HTML escaped. The artifact remains deterministic and self-contained. The approval and change-request controls continue to include the exact Mission and hash.

## 13. Failure modes

| Failure | Required behavior |
|---|---|
| unsupported schema version | `PLAN_INVALID`; no row or event |
| unknown field | `PLAN_INVALID`; field is not dropped |
| qualified ID mismatch | `PLAN_INVALID` with derived expected identity |
| duplicate local ID in one owner | `PLAN_INVALID` |
| unknown, self or cross-level dependency | `PLAN_INVALID` |
| dependency cycle | `PLAN_INVALID` |
| criterion references unallocated requirement | `PLAN_INVALID` |
| environment binding contains secret-like arbitrary field | `PLAN_INVALID` |
| stale Replan hash | `PLAN_REVISION_CONFLICT`; no row or event |
| approved v1 followed by another v1 | `PLAN_REVISION_CONFLICT` |
| v2 followed by v1 | `PLAN_REVISION_CONFLICT` |
| content equals a non-current historical revision | `PLAN_REVISION_CONFLICT`; no rewind |
| draft exists during materialization | materialize latest approved revision |
| malformed persisted JSON | recovery fails closed through versioned validation |
| materialization publication fails | approved SQLite state remains repairable |

## 14. Verification plan

Deterministic tests cover:

- schema v2 happy path and normalization;
- Mission, Milestone and Feature criteria;
- qualified identity derivation and mismatch rejection;
- repeated local Feature IDs under different Milestones;
- qualified dependencies and cross-level rejection;
- duplicate, unknown and cyclic references;
- requirement allocation boundaries;
- Environment and Security Policy binding;
- documentation and requirements impact;
- unknown fields;
- canonical hash stability and version sensitivity;
- schema v1 validation and historical content hash reproduction;
- exact `MIS-002` revision 3 Git blob SHA preservation;
- migration v3 and multiple immutable approvals;
- exact-hash v1-to-v2 Replan;
- downgrade and rewind rejection;
- fresh-process recovery;
- latest-approved materialization during a draft Replan;
- full v2 Lavish rendering, HTML escaping and exact-hash controls.

The closing proof command remains:

```bash
npm run verify
```

Canonical acceptance requires Node.js 24.18.0 in Ubuntu/CI. Targeted tests in any fallback environment are supplementary evidence, not a substitute for the full gate.

## 15. Documentation impact

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - DESIGN-PLAN-CONTRACT-SCHEMA-V2
    - DESIGN-PLAN-CONTRACT-SCHEMA-V2-READINESS
    - CAP-EXECUTION
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
    - .pi/skills/mnfs-plan/references/plan-schema.md
  rationale: Schema v2 behavior, compatibility and planning guidance become explicit.
  follow_up: null
```

## 16. Requirements impact

```yaml
requirements_impact:
  status: UPDATED
  affected:
    - CAP-EXEC-REQ-026
    - CAP-EXEC-REQ-027
  rationale: Schema representation and documentation proof are implemented, while the approved MIS-002 Replan remains unavailable.
```

Issue #7 does not make CAP-EXECUTION R4 pass. The Capability requirement remains blocked until Issue #9 creates and the Operator approves a new exact-hash `MIS-002` revision after AS-02.
