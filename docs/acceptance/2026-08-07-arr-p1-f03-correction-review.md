---
id: REVIEW-ARR-P1-F03-CORRECTION
title: ARR P1-F03 Contract-Binding Correction Review
document_type: review_record
form: reference
authority: evidence
status: proposed
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-ARR-P1-RECONCILIATION
  - ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT
  - DOC-ARR-SPIKE-GOVERNANCE
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
tracking_issue: 23
last_reviewed: 2026-08-07
---

# ARR P1-F03 Contract-Binding Correction Review

## Finding

A post-integration review of PR #24 identified that the shared Architecture Spike Evidence schema records `contractVersion` but does not bind deciding Evidence to the exact frozen Spike contract bytes.

The accepted governance requires the Spike contract to freeze an exact version/hash before candidate execution. The correction therefore strengthens B1 so machine Evidence carries and validates the exact SHA-256 of the contract bytes used for the run.

## Correction boundary

Authorized correction work is limited to:

- Architecture Spike Evidence schema/version;
- exact contract-byte hashing/validation path;
- deterministic regression tests;
- B1 governance wording/metadata required to describe the binding;
- tracking needed to expose review state.

This correction does not authorize ARR-S0 implementation or execution, candidate installation/execution, runtime/environment selection, ARR-S1/S2/S2W/S3, M02 production work or production Worker dispatch.

## Required proof

The correction is reviewable only after:

1. RED evidence demonstrates the accepted validator does not satisfy exact contract binding;
2. valid schema-v2 Evidence with an exact contract SHA-256 passes;
3. missing contract bytes fail closed;
4. declared contract hash mismatch against the supplied bytes fails;
5. `npm run verify` is green on the correction head;
6. a fresh review reports Critical 0 / Important 0.

No acceptance or merge is implied by implementation completion.
