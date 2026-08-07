---
id: REVIEW-ARR-P1-F03-CORRECTION
title: ARR P1-F03 Contract-Binding Correction Review
document_type: review_record
form: reference
authority: evidence
status: accepted
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-ARR-P1-RECONCILIATION
  - ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT
  - ACCEPTANCE-ARR-P1-F03-CONTRACT-BINDING
  - DOC-ARR-SPIKE-GOVERNANCE
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
tracking_issue: 23
last_reviewed: 2026-08-07
---

# ARR P1-F03 Contract-Binding Correction Review

## Finding

A post-integration review of PR #24 identified that the shared Architecture Spike Evidence schema records `contractVersion` but did not bind deciding Evidence to the exact frozen Spike contract bytes.

The accepted governance requires the Spike contract to freeze an exact version/hash before candidate execution. The correction therefore strengthens B1 so machine Evidence carries and validates the exact SHA-256 of the contract bytes used for the run.

## Correction boundary

Correction work was limited to:

- Architecture Spike Evidence exact contract identity;
- exact contract-byte hashing/validation path;
- deterministic regression tests and CI path coverage;
- B1 governance wording required to describe the binding;
- review Evidence for this correction.

The correction does not authorize ARR-S0 implementation or execution, candidate installation/execution, runtime/environment selection, ARR-S1/S2/S2W/S3, M02 production work or production Worker dispatch.

## TDD Evidence

```text
branch:                    fix/p1-f03
review surface:            PR #26
base:                      dffd3c929eac0f939615408f4729781bd029f11a

initial RED workflow:      31202276551 — FAILURE
refined RED head:          aa70e28da8e603990d523705e411daecef03dd54
refined RED workflow:      31202444046 — FAILURE
accepted substantive head: 0b9fe9747887ef5817fffbb586db04ccb3292b27
accepted-head workflow:    31203105413 — SUCCESS — npm run verify
```

The refined RED removed an unnecessary schema-version assumption so the failing contract tests represented only the missing exact-byte binding.

## Implemented correction

The accepted B1 correction requires:

```text
contractVersion
+
contractHash = sha256:<64 lowercase hex>
+
exact frozen contract bytes supplied to validation
```

The existing validation interface remains canonical:

```bash
node scripts/validate-docs.mjs \
  --architecture-spike-evidence <evidence.json> \
  --artifact-root <artifact-root> \
  --contract <frozen-contract-file>
```

Validation fails closed when:

- `contractHash` is absent or malformed;
- `--contract` is absent;
- contract bytes cannot be read;
- SHA-256 recomputed from the supplied contract bytes differs from `contractHash`.

Existing raw-artifact hash/size/path, provenance and criterion-result validation remains in place.

## Review result

```text
implementation:        COMPLETE
npm run verify:        GREEN — 31203105413
fresh review:          Critical 0 / Important 0
review threads:        0
Operator acceptance:   GRANTED — D-018
merge/integration:     NOT AUTHORIZED
GATE-S0-IMPLEMENT:     NOT AUTHORIZED
```

## Operator Decision

The Operator explicitly accepted the correction with:

```text
MNFS_ACCEPT_ARR_P1_F03 program_blob=52033adcdfb7163f63606034b9912942b018f38e pr=26 head=0b9fe9747887ef5817fffbb586db04ccb3292b27 findings=critical:0,important:0
```

The canonical acceptance record is `ACCEPTANCE-ARR-P1-F03-CONTRACT-BINDING`.

Acceptance closes P1-F03 for the exact substantive head above. It does not imply merge/integration or authorize ARR-S0 implementation, real host probing, candidate execution, downstream ARR Spikes, M02 production work or production Worker dispatch.
