# 4B — Independent Fable Review Handoff

**Status:** REVIEW HANDOFF / NON-AUTHORITATIVE

**Reviewed candidate HEAD:** `734c00854b11d5c6cdbf28cecf001b0081ce22dc`

**Candidate branch:** `agent/4b-executable-wire`

**Review branch:** `review/4b-fable`

**Draft PR:** `#56`

**Product implementation:** BLOCKED

This file is review routing only. Repository authority at the reviewed candidate HEAD beats this handoff.

## 1. Read order

Start fresh and reconstruct the exact reviewed candidate before accepting any claim:

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ docs/phases/4b-executable-wire-contract.md
→ docs/product/wire-contract.md
```

Add only exact accepted 4A authority or bounded 4B Evidence when a concrete finding requires it. Do not recursively read phase history, research or qualification harnesses.

Run the current verification path on the reviewed candidate before issuing a verdict:

```text
npm ci
npm run verify
```

Latest Lead evidence before handoff: Verify `#367` = SUCCESS on the exact reviewed candidate HEAD. Treat that as a claim to reproduce/challenge, not authority.

## 2. Independent review mission

Try to falsify the **complete 4B Executable Wire candidate**, not merely confirm that its scripts are green.

The current candidate claims:

```text
fixed Product wire = 111 ↔ 111
schema-closed = 111 / 111
literal IF_MATCH = { PRJ-12, PAR-14 }
Technical Ingress = 3 protocol-only HTTP operations / N_platform impact 0
Project-defined operation grammar + deterministic OAS projection = closed
Budget Analyzer executable proving instance = green
generated projection / no-parallel-DTO = green with real Kubb 5.0.0 probe
whole-4B adversarial proof = green
```

Challenge whether those properties are actually transferable to implementation without adding Product authority or hiding a second transport/runtime contract.

## 3. Priority falsifiers

Review at least these boundaries, with concrete repository evidence for every material finding:

1. **4A → 4B authority fidelity** — no accepted Product operation/Permission/owner/scope/truth distinction is lost, invented or collapsed; `4B-F01` does not hide an unresolved upstream contradiction.
2. **Surface separation** — Product `/api`, Technical `/protocol`, PA/CP/HEADLESS, `PAR_TOOL`, `MAR_JOB`, system/runtime mechanics and provider transport remain distinct. HTTP namespace/security metadata must not grant authority.
3. **Project-defined capability grammar/projection** — exact finite `Ops(R)` stays literal/static; no generic executor, mutable-latest dispatch, caller-selected Connection/URL or unregistered tool capability can reappear. Explicitly challenge the post-#363 mixed-ingress correction (`CONTROL_PLANE` + `PAR_TOOL`).
4. **Security and disclosure** — opaque Conexus session, browser request-authenticity, 403/404 non-disclosure, current-state carriers, idempotency, secrets/write-only fields and OIDC separation do not create bypasses or existence oracles.
5. **Owner truth / uncertainty** — analytical `unknown != zero`, `partial != complete`, Gateway `OUTCOME_UNKNOWN`, MAR owner truth vs queue mechanics, OBS telemetry vs owner state, and immutable Audit remain machine-expressible rather than prose-only.
6. **Generated projections** — Kubb/projection evidence must not rely on a fixture-specific illusion, lose status/carrier/schema semantics, silently expose `any`, or permit generated output/hand DTOs to become co-authority. Do not select the 4D Paved Road here.
7. **Whole-4B negative proof quality** — determine whether the negative controls genuinely falsify cross-surface properties or merely test strings/fixtures that cannot fail under realistic drift.
8. **YAGNI / deletion challenge** — identify any current 4B mechanism, metadata, endpoint, schema abstraction or checker that can be deleted without losing an accepted property. Prefer deletion/simplification over new abstraction when equivalent.
9. **Framework/standard leverage** — flag bespoke wire/protocol/runtime machinery that duplicates OpenAPI/JSON Schema/OIDC/Mastra/AI SDK or other already-adopted standard capability without a proved gap. Do not reopen 4D technology selection by preference.
10. **Warnings / hidden debt** — classify current Redocly/AJV warnings as material, non-material or tool-shape noise. In particular inspect OIDC redirect-response warnings, absent license metadata, bundle component renames, and AJV strict-type warnings around conditional schemas. Do not dismiss warnings merely because exit code is zero.

## 4. Global-maximum / proportionality test

A proposed correction is justified only when it materially improves one or more of:

```text
authority fidelity
security/trust correctness
falsifiability
implementation transferability
operational simplicity
framework/standards leverage
```

without adding speculative Product meaning or a new subsystem.

Prefer:

```text
DELETE
→ reuse existing standard/native mechanism
→ thin correction/projection
→ new abstraction only for a proved irreducible gap
```

Do not create a new Product requirement merely to make the wire aesthetically uniform.

## 5. Finding classes

Class every finding as one of:

- `MATERIAL_CORRECTION_REQUIRED` — candidate cannot be ratified safely as-is.
- `NON_MATERIAL_CORRECTION` — worthwhile bounded cleanup, no authority reopen.
- `DEFER_TO_4C` — frontend interaction realization question only.
- `DEFER_TO_4D` — runtime/Paved-Road/toolchain/implementation mechanism question only.
- `NO_FINDING` — challenged property survived.

For a material finding, state the **smallest correction** and whether it requires reopening 4A. Do not prescribe implementation code unless necessary to prove the defect.

## 6. Required output

Add exactly one review output file on `review/4b-fable`:

```text
docs/evidence/4b/fable-independent-review.md
```

Recommended structure:

```text
Reviewed HEAD
Verification reconstruction
Verdict
Material findings
Non-material findings
Deletion/YAGNI result
Warnings disposition
4A reopen required? YES/NO
4B ratifiable after corrections? YES/NO
```

The review output is Evidence only. It must not modify accepted authority, `docs/roadmap.md`, Product/Technical contracts, checkers, PR state or implementation code. Commit only the review file.

Do not close 4B, open 4C, merge PR #56 or authorize Product implementation.
