---
id: DESIGN-PLAN-CONTRACT-SCHEMA-V2-READINESS
title: Plan Contract Schema v2 readiness
document_type: design_readiness
form: explanation
authority: specification
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - CAP-EXECUTION
  - DOC-PRODUCT-BLUEPRINT-02
  - DOC-PRODUCT-BLUEPRINT-07
  - DOC-PRODUCT-BLUEPRINT-12
tracking_issue: 6
---

# Plan Contract Schema v2 readiness

## Finding

The accepted M1 Plan schema can represent:

- Mission success criteria;
- Milestones;
- Features;
- Feature Acceptance Criteria.

It cannot currently represent all newly approved requirements:

- mandatory Milestone Acceptance Criteria;
- fully qualified Feature identity;
- proof type and Verification Plan bindings;
- Security Environment/policy binding;
- Product Milestone/capability traceability;
- Mission-level structured requirement references.

Therefore a compliant new `MIS-002` revision cannot be approved under schema v1 without losing approved architecture.

## Decision impact

```text
MIS-002 revision 3
→ remains historical and immutable

new MIS-002 revision
→ BLOCKED by Plan Contract schema v2
```

## Minimum schema v2 scope

- `schemaVersion: 2`;
- Milestone `acceptanceCriteria`;
- stable local IDs with qualified identity derived by MNFS;
- criterion IDs at Mission/Milestone/Feature levels;
- optional `requirementRefs`;
- optional `proof` metadata;
- optional Environment/security binding at Mission or Milestone scope;
- backward read/migration support for schema v1;
- exact canonical hashing;
- Lavish renderer support;
- approval/materialization support;
- fresh-process recovery;
- tests proving v1 history remains readable.

## Non-goals

- full generic Verification Plan compiler;
- Standards engine;
- arbitrary policy DSL;
- migration of revision 3 in place;
- changing M0/M1 accepted behavior.

## Required process

1. create a bounded Mission/Capability enabler;
2. design schema and compatibility;
3. implement through TDD;
4. verify M1 planning still works;
5. generate a schema v2 `MIS-002` draft;
6. review in Lavish;
7. approve exact hash;
8. rerun MCRM R0–R4.

## Current status

```text
BLOCKER IDENTIFIED
IMPLEMENTATION NOT STARTED
```
