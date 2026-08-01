# MNFS mission plan schema

Every save supplies the **full JSON document**. MNFS validates and normalizes it before hashing.

```json
{
  "schemaVersion": 1,
  "missionId": "MIS-001",
  "title": "Concise mission title",
  "goal": "Observable product outcome",
  "successCriteria": [
    "A measurable condition that proves the mission outcome"
  ],
  "scope": {
    "included": ["Explicitly included capability"],
    "excluded": ["Explicit non-goal"]
  },
  "assumptions": ["An assumption that must remain visible"],
  "milestones": [
    {
      "id": "M01",
      "title": "Milestone title",
      "outcome": "Integrated result of this milestone",
      "dependsOn": [],
      "features": [
        {
          "id": "F01",
          "title": "Feature title",
          "outcome": "Behavior delivered by the feature",
          "acceptanceCriteria": [
            "Concrete externally observable criterion"
          ],
          "dependsOn": []
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
      "question": "Decision the operator must make",
      "blocking": true,
      "status": "OPEN"
    }
  ]
}
```

## Required invariants

- `schemaVersion` is exactly `1`.
- `missionId` matches the target mission and follows `MIS-001` format.
- Titles, goals, outcomes, criteria, descriptions, and mitigations are non-empty after trimming.
- `successCriteria` and `scope.included` contain at least one item.
- At least one milestone exists, and every milestone contains at least one feature.
- Milestone IDs use `M01`; feature IDs use `F01`; risk IDs use `R01`; question IDs use `Q01`.
- IDs are unique in their category; feature IDs are unique across the whole mission.
- Every `dependsOn` references an ID in the same category and never references itself.
- Milestone and feature dependency graphs contain no cycle.
- Duplicate strings inside one array are rejected.
- An `ANSWERED` question includes a non-empty `answer`.
- An `OPEN` question omits `answer`.
- Any blocking `OPEN` question prevents approval.
- Array order is semantic and affects the content hash; preserve intentional ordering.

## Planning boundary

Describe product intent, integration boundaries, observable outcomes, risks, decisions, and acceptance criteria. Do not put runtime attempts, session IDs, worker status, receipts, or transient execution state into this document.
