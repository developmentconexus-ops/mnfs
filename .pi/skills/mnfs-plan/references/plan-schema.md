# MNFS Mission Plan Contract schema

Every save supplies the **full JSON document**. MNFS validates, derives qualified identities and normalizes the document before hashing.

New plans and Replans use `schemaVersion: 2`. Schema v1 remains readable and materializable for accepted M0/M1 history and may be completed when an unapproved v1 draft already exists.

## Schema v2 example

```json
{
  "schemaVersion": 2,
  "missionId": "MIS-002",
  "title": "Concise Mission title",
  "goal": "Observable product outcome",
  "acceptanceCriteria": [
    {
      "id": "AC-01",
      "statement": "The Mission outcome is proved by an independent Receipt",
      "requirementRefs": ["CAP-EXEC-REQ-001"],
      "verificationPlan": {
        "method": "TEST",
        "owner": "MNFS-RUNNER",
        "proofType": "RECEIPT",
        "proofOwner": "MNFS-RUNNER"
      }
    }
  ],
  "scope": {
    "included": ["Explicitly included capability"],
    "excluded": ["Explicit non-goal"]
  },
  "assumptions": ["An assumption that must remain visible"],
  "productMilestoneRefs": ["M2"],
  "capabilityRefs": [
    {
      "id": "CAP-EXECUTION",
      "specPath": "docs/capabilities/CAP-EXECUTION/SPEC.md",
      "version": "0.1.0"
    }
  ],
  "requirementRefs": ["CAP-EXEC-REQ-001"],
  "environmentBinding": {
    "environmentRef": "ENV-E1",
    "securityPolicyRef": "SEC-E1",
    "securityPolicyHash": "sha256:<64 lowercase hexadecimal characters>"
  },
  "documentationImpact": {
    "status": "UPDATED",
    "refs": ["DOC-MNFS-PLAN-CONTRACT"],
    "rationale": "The schema and planning guidance change."
  },
  "requirementsImpact": {
    "status": "UPDATED",
    "refs": ["CAP-EXEC-REQ-001"],
    "rationale": "The requirement is allocated to explicit criteria."
  },
  "milestones": [
    {
      "id": "M01",
      "title": "Milestone title",
      "outcome": "Integrated result of this Milestone",
      "acceptanceCriteria": [
        {
          "id": "AC-01",
          "statement": "The Milestone outcome composes successfully",
          "requirementRefs": ["CAP-EXEC-REQ-001"],
          "verificationPlan": {
            "method": "TEST",
            "owner": "MNFS-RUNNER",
            "proofType": "RECEIPT",
            "proofOwner": "MNFS-RUNNER"
          }
        }
      ],
      "requirementRefs": ["CAP-EXEC-REQ-001"],
      "dependsOn": [],
      "features": [
        {
          "id": "F01",
          "title": "Feature title",
          "outcome": "Behavior delivered by the Feature",
          "acceptanceCriteria": [
            {
              "id": "AC-01",
              "statement": "Concrete externally observable criterion",
              "requirementRefs": ["CAP-EXEC-REQ-001"],
              "verificationPlan": {
                "method": "TEST",
                "owner": "MNFS-RUNNER",
                "proofType": "RECEIPT",
                "proofOwner": "MNFS-RUNNER"
              }
            }
          ],
          "requirementRefs": ["CAP-EXEC-REQ-001"],
          "dependsOn": []
        }
      ]
    },
    {
      "id": "M02",
      "title": "Dependent Milestone",
      "outcome": "A later integrated result",
      "acceptanceCriteria": [
        {
          "id": "AC-01",
          "statement": "The dependent Milestone composes with M01",
          "requirementRefs": [],
          "verificationPlan": {
            "method": "DEMONSTRATION",
            "owner": "MNFS-GATE",
            "proofType": "VERDICT",
            "proofOwner": "MNFS-GATE"
          }
        }
      ],
      "requirementRefs": [],
      "environmentBinding": {
        "environmentRef": "ENV-E1",
        "securityPolicyRef": "SEC-E1"
      },
      "dependsOn": ["MIS-002/M01"],
      "features": [
        {
          "id": "F01",
          "title": "Feature local IDs may repeat under another Milestone",
          "outcome": "Qualified identity remains unambiguous",
          "acceptanceCriteria": [
            {
              "id": "AC-01",
              "statement": "The Feature consumes the earlier qualified Feature",
              "requirementRefs": [],
              "verificationPlan": {
                "method": "INSPECTION",
                "owner": "MNFS-REVIEWER",
                "proofType": "RECORD",
                "proofOwner": "MNFS-REVIEWER"
              }
            }
          ],
          "requirementRefs": [],
          "dependsOn": ["MIS-002/M01/F01"]
        }
      ]
    }
  ],
  "risks": [
    {
      "id": "R01",
      "description": "Specific failure mode",
      "mitigation": "Concrete mitigation or proof"
    }
  ],
  "questions": [
    {
      "id": "Q01",
      "question": "Decision the Operator must make",
      "blocking": true,
      "status": "OPEN"
    }
  ]
}
```

## Qualified identities

MNFS derives and stores:

```text
Mission                       MIS-002
Milestone                     MIS-002/M01
Feature                       MIS-002/M01/F01
Mission criterion             MIS-002/AC-01
Milestone criterion           MIS-002/M01/AC-01
Feature criterion             MIS-002/M01/F01/AC-01
```

Do not invent a different `qualifiedId`. Input may omit it. When input includes it, it must exactly equal the derived identity.

Local Feature IDs are unique only inside their parent Milestone. Qualified Feature identities are unique across the Mission.

## Acceptance criteria and proof ownership

Schema v2 requires acceptance criteria at all three levels:

- Mission criteria prove the global outcome.
- Milestone criteria prove the integrated intermediate outcome.
- Feature criteria prove bounded implementation behavior.

Each criterion requires:

- local `id` in `AC-01` form;
- a testable `statement`;
- zero or more `requirementRefs` allocated to the same owner;
- one `verificationPlan`.

Allowed verification methods:

```text
TEST
INSPECTION
ANALYSIS
DEMONSTRATION
OPERATOR_CONFIRMATION
```

Allowed proof types:

```text
RECEIPT
ARTIFACT
VERDICT
RECORD
```

The plan identifies expected proof ownership. It does not contain runtime Receipts, Verdicts or Worker status.

## Requirement allocation

- Mission `requirementRefs` define the complete contract requirement set.
- Milestone and Feature requirement references must be subsets of the Mission set.
- A criterion may reference only requirements allocated to its direct owner.
- Requirement IDs use forms such as `CAP-EXEC-REQ-001`.
- Do not infer or fabricate requirement IDs. Resolve them from the canonical Capability traceability source.

## Dependencies

Schema v2 dependencies use fully qualified IDs:

```text
Milestone dependsOn → MIS-002/M01
Feature dependsOn   → MIS-002/M01/F01
```

A dependency must reference the same kind of element, must exist, must not reference itself and must not create a cycle. Local dependency forms such as `F01` are invalid in v2.

## Environment and Security Policy binding

Allowed fields are:

```text
environmentRef
securityPolicyRef
securityPolicyHash (optional)
```

Use repository-owned references and an exact SHA-256 policy hash when one has been frozen. Never place credentials, tokens, secret values, host paths or arbitrary policy bodies in the Mission contract.

A Milestone may provide an explicit environment binding when it differs from the Mission binding.

## Impact fields

Documentation impact states:

```text
NONE
UPDATED
FOLLOW_UP_REQUIRED
```

- `NONE` requires `refs: []` and no `followUp`.
- affected states require at least one reference.
- `FOLLOW_UP_REQUIRED` also requires a concrete `followUp` string.

Requirements impact states:

```text
NONE
UPDATED
NEW_REQUIREMENT
REPLAN_REQUIRED
```

- `NONE` requires `refs: []`.
- affected states require at least one requirement reference.

Both impact objects always require a non-empty rationale.

## General invariants

- `schemaVersion` is exactly `2` for new plans and Replans.
- `missionId` matches the target Mission and follows `MIS-001` format.
- Titles, goals, outcomes, criterion statements, descriptions, mitigations and rationales are non-empty after trimming.
- `scope.included` contains at least one item.
- At least one Milestone exists, and every Milestone contains at least one Feature.
- Milestone IDs use `M01`; Feature IDs use `F01`; risk IDs use `R01`; question IDs use `Q01`.
- Duplicate strings inside one array are rejected.
- Unknown object fields are rejected; they are never silently discarded.
- An `ANSWERED` question includes a non-empty `answer`.
- An `OPEN` question omits `answer`.
- Any blocking `OPEN` question prevents approval.
- Array order is semantic and affects the content hash; preserve intentional ordering.
- The schema version participates in the hash.

## Compatibility and Replan

| Situation | Required action |
|---|---|
| No plan exists | author schema v2 |
| Existing unapproved v1 draft | it may be revised and approved as v1, or deliberately upgraded to v2 |
| Existing approved v1 | preserve it; create a full v2 Replan with `--expected-hash <approved-hash>` |
| Existing v2 draft or approval | create later v2 revisions with the exact current hash |
| Requested v2 to v1 change | refuse; downgrade is unsupported |
| Content matches an older non-current revision | refuse; history cannot rewind |

While a Replan is a draft, the earlier approved revision remains the materialized contract. The new contract becomes authoritative only after exact-hash approval.

## Schema v1 historical compatibility

Schema v1 remains readable, hashable, recoverable and materializable. Do not rewrite accepted v1 content or add synthetic v2 fields to it. In particular, never edit `.mnfs/missions/MIS-002/plan.json` revision 3 in place.

## Planning boundary

Describe product intent, integration boundaries, observable outcomes, allocation, proof ownership, risks, decisions and acceptance criteria. Do not put Attempts, Worker Runs, session IDs, live Worker status, Receipts, Verdicts, credentials or transient execution state into this document.
