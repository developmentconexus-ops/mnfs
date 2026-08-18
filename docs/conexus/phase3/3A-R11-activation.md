# 3A-R11 — Operator Activation Record

**Status:** APPROVED / ACTIVE  
**Activated:** 2026-08-18  
**Authority:** explicit operator approval of the written `3A-R11-whole-product-authority-rebaseline.md` specification  
**PR:** #40 — remains DRAFT / no merge authorization  

This record durably materializes the operator's approval of the complete written R11 specification.

## Active routing

```text
3L-Q0 = COMPLETE
3L Package A = COMPLETE

3A-R11 — Whole-Product Authority Rebaseline
= ACTIVE

3L Package B — Product Agent + Cross-Runtime
= PAUSED / NOT OPENED
```

Package B is paused only so it can be rederived from the reconciled current authority tree. Package B is not rejected and no previously ratified requirement is reopened by preference.

## Authorized R11 sequence

```text
R11-A Authority census
→ R11-B Decision reconciliation
→ R11-C Product Contract
→ R11-D Architecture Baseline
→ R11-E Whole-product scenario/coherence pass
→ R11-F Fresh self-review
→ R11-G independent Fable whole-product review
→ finding adjudication
→ R11-H final operator ratification
→ only then rederive/open Package B
```

## Hard boundaries

- no product implementation;
- no Package B spike while R11 is active;
- no C-018 ratification;
- no merge of PR #40;
- historical authority/evidence is preserved;
- accepted authority is reopened only by a material Finding;
- Fable review is independent Evidence, never automatic requirement authority;
- current technology status must distinguish selected/current architecture from actually qualified Evidence.

## Router consistency note

`docs/conexus/phase3/LEDGER.md` is still the Phase 3 router and must be reconciled to this approved checkpoint as part of R11 activation. Until that mechanical router update is persisted, this activation record is the durable evidence of the operator-approved superseding next-action decision: **R11 ACTIVE / Package B PAUSED**. No execution may use the stale `Package B NEXT` wording to start Package B.
