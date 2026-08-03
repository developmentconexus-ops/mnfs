---
id: ACCEPTANCE-CAP-EXECUTION-R3
title: CAP-EXECUTION R3 Acceptance
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - CAP-EXECUTION
  - CAP-EXECUTION-COVERAGE
  - ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2
  - DESIGN-MIS-002-REPLAN
tracking_issue: 9
last_reviewed: 2026-08-03
---

# CAP-EXECUTION R3 Acceptance

## 1. Decision

The Operator accepted `CAP-EXECUTION` version `0.1.0` as the normative Capability Spec for governed local one-Worker execution.

Exact authority token:

```text
CAP_EXECUTION_ACCEPT version=0.1.0
```

Result:

```text
R3 Capability Readiness: PASS
```

This decision approves the capability architecture, requirements, boundaries and proof strategy. It does not claim implementation, approve a MIS-002 Replan, pass R4, unblock M2 or authorize Worker dispatch.

## 2. Reviewed scope

The review covered:

- goals and non-goals;
- one Write Track, one current Attempt and one Pi Worker Run;
- Treehouse Lease ownership and Intent–Action–Observation;
- durable Claim and Domain Event atomicity;
- fresh-Lead recovery without transcript, terminal scraping or Observational Memory;
- `SEC-E1` security boundary and AS-02 evidence;
- Current Authority Snapshot and fixed Writer Pack;
- Minimal Deterministic Receipt and Gate authority;
- failure drills, rollout, rollback and upgrade/downgrade;
- 28 capability requirements and 23 applicability domains;
- explicit deferral of Reviewer, browser QA, generalized parallelism, remote execution and external observability.

## 3. Requirement and applicability coverage

| Measure | Accepted value |
|---|---:|
| Requirements | 28 |
| MUST | 27 |
| SHOULD | 1 |
| Applicability domains | 23 |
| Unassessed domains | 0 |
| Requirements with source | 28/28 |
| Requirements with planned allocation | 28/28 |
| Requirements with verification method | 28/28 |

No critical requirement gap or unresolved applicability decision was identified during R3 review.

## 4. Security evidence

AS-02 run `as02-20260803t144645276z-7048d3` produced verdict `ACCEPT` on canonical Ubuntu WSL2. The accepted run recorded:

- effective policy hash `sha256:886eb0f1fb5c2087d0b5bf16a51f399dc1ffb9a75aab16d4900a9ffe6ab57797`;
- restart status `PASS`;
- no restart drift;
- cleanup status `COMPLETE`;
- all S1–S15 scenarios passing.

The AS-02 effective hash is evidence for that run. The reusable Mission contract binds the stable exact-byte hash of `policies/SEC-E1.json`; each future Attempt must separately record its compiled effective-policy hash.

## 5. Accepted Golden Proof

```text
initialize canonical repository
→ approve reconciled MIS-002
→ grant Treehouse Lease
→ create E1 Environment
→ launch sandboxed Pi Worker
→ fixed edit
→ durable Claim
→ terminate Lead
→ fresh Lead recovers exact state
→ protected sentinels remain inaccessible
→ Minimal Deterministic Receipt
→ explicit Gate acceptance
→ idempotent Environment and Lease release
```

## 6. Boundary of this acceptance

After this decision:

```text
CAP-EXECUTION status: accepted
CAP-EXECUTION implementation_status: planned
R3: PASS
R4: BLOCKED
M2: BLOCKED
Worker dispatch: PROHIBITED
```

R4 remains blocked because the current approved MIS-002 materialization is revision 3 with schema version 1, all requirement allocations remain proposed, and `BLOCK-MIS-002-REPLAN` remains open.

## 7. Required next sequence

1. build the complete deterministic MIS-002 schema-v2 Replan candidate;
2. save it through the real planning service against the exact revision-3 approved hash;
3. review the full candidate in Lavish;
4. approve only the exact current content hash after an explicit Operator token;
5. replace proposed allocations with exact approved criterion identities;
6. recalculate R0–R4 mechanically;
7. require a separate explicit Operator decision before M2 may enter R5 microdesign.
