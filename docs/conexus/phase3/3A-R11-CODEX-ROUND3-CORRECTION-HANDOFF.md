# 3A-R11 — Codex Round-3 Projection Correction Handoff

**Status:** EXECUTION HANDOFF / NON-AUTHORITATIVE  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Branch:** `agent/conexus-phase-3-system-design`  
**PR:** #40 / DRAFT  
**Prepared after:** `3A-R11-fable-review-adjudication.md`  
**Implementation:** BLOCKED  
**Package B:** PAUSED / NOT OPENED  

> This handoff is bootstrap only. Revalidate HEAD and repo authority before making any edit. The adjudication file is the controlling bounded correction record for this execution; detailed accepted semantic authority remains the underlying source of truth.

---

## 1. Mandatory read order

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/phase3/3A-R11-whole-product-authority-rebaseline.md
→ docs/conexus/phase3/3A-R11-activation.md
→ docs/conexus/phase3/3A-R11-fable-independent-whole-product-review.md
→ docs/conexus/phase3/3A-R11-fable-review-adjudication.md
→ docs/conexus/current/README.md
→ docs/conexus/current/PRODUCT-CONTRACT.md
→ docs/conexus/current/ARCHITECTURE-BASELINE.md
→ docs/conexus/current/DECISION-RECONCILIATION.md
→ docs/conexus/phase3/LEDGER.md
```

Then inspect the exact detailed semantic homes cited by the adjudication when applying a correction. Do not trust a review paraphrase if the detailed accepted authority says something else.

---

## 2. Execution boundary

This is **projection/router correction only**.

Do not:

```text
reopen 3B–3K
create a new Product requirement
create a new module / record / DB / service / framework
run Package B
change Package-A evidence/verdict
ratify C-018
implement Product code
merge PR #40
mark PR ready
perform final R11 ratification
fully rewire AGENTS/Documentation Map/historical-register authority before R11-H
```

If a requested correction appears to require any of the above, stop and report the exact contradiction instead of improvising.

---

## 3. Files expected to change

Primary:

```text
docs/conexus/current/README.md
docs/conexus/current/PRODUCT-CONTRACT.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
docs/conexus/phase3/LEDGER.md
```

R11 evidence/status docs may be added/updated only as needed to record Round-3 execution/verifications. Historical accepted authorities are **not rewritten** merely to fit the current tree.

---

## 4. Exact correction contract

Apply **all FBL-01..17** exactly as adjudicated in:

```text
docs/conexus/phase3/3A-R11-fable-review-adjudication.md
```

Mandatory high-risk corrections:

### FBL-01
EnvironmentConformance must say:

```text
exact pinned Connection revision == active revision in target environment
```

Qualification alone is not sufficient.

### FBL-02
Product-Agent `SCHEDULE` and MAR managed-sync recurrence must be separately documented.

PAR/Product Agent:

```text
stable intended-slot identity BEFORE AgentRun admission
cursor per (TriggerId, TriggerRevision)
guarded PAR schedule-fire ingress
single-flight
active-run overlap → consume occurrence as SKIPPED
NO catch-up/backlog from skipped Product-Agent slots
schedule fire never directly executes Product Agent
```

MAR sync:

```text
downtime → at most one catch-up if current served Release still requires sync and freshness is behind
NO N-slot backlog
```

Do not create a shared recurrence abstraction.

### FBL-03
Restore explicit Project ARCHIVED semantics:

```text
archive freezes ordinary authoring/future intent expansion
archive != unpublish
archive != stop current serving
archive != stop pre-existing enabled Product-Agent trigger
archive != stop existing managed recurrence by itself
explicit trigger DISABLE remains allowed narrowing
CREATE/ENABLE/reconfiguration remains blocked while archived
archived recovery target must have been previously activated and still pass current conformance
```

The Product Contract/entrypoint must tell the operator that Archive does not stop automations and does not unpublish.

### FBL-04
Restore the three degradation classes:

```text
ordinary telemetry missing → degraded/MISSING, domain may continue where telemetry not required
audit-required durable AuditRecord unavailable → FAIL CLOSED
verification-required Evidence missing → NOT_PROVEN/INCONCLUSIVE, never PASS
```

### FBL-05
Restore Brain runtime/content safeguards:

```text
AgentRun pins health snapshot
critical health recheck before final response and before any effect/approval execution
Brain-dependent approval binds effectiveBrainSliceDigest
critical health change invalidates continuation and recomposes context
critical SUSPECT/INVALID content blocks where accepted authority says it blocks
real ERP data never enters Brain Git
sampleSource enum|synthetic required for samples/fixtures
PII lint + secret scanning + human review
custom_instructions closed and cannot command authorization/tools/approvals/credentials/platform policy
Brain never widens authority/grant/tool/data scope
```

### FBL-06
Restore Release/Promotion laws:

```text
change_acceptance/current proof rechecked at ComposeRelease
rechecked immediately before material Promotion steps
max one non-terminal Promotion per (Project, PROD)
concurrent loser performs zero DDL/drain/material steps
maintenance serving-block survives Promotion terminalization
governance/proof drift after SERVED_VERIFIED does not auto-deactivate pointer
```

### FBL-07
Expose `MANAGED_JOB` as explicit Gateway caller surface and route old 3D-02 caller-list readers through the 3A-R9 amendment. Preserve no-authority-widening semantics.

### FBL-14 — execute during this batch
Update `phase3/LEDGER.md` mechanically so the live router says:

```text
3A-R11 ACTIVE / ROUND-3 CORRECTION
Package B PAUSED / NOT OPENED
```

and does not say Package B is next/startable while R11 is active.

Do **not** do the full post-ratification AGENTS/Documentation Map/DECISOES rewiring yet.

---

## 5. Remaining bounded corrections

Apply FBL-08..13 and FBL-15..17 from the adjudication, including:

- CR-1 combined revoke×least-privilege proof;
- exact two cross-owner domain atomicities + narrow audit append exception;
- ciphertext backup vs root/recovery-key compromise-path separation;
- complete OTel baggage negative law;
- memory-only transient tokens + server-expiring/server-revocable guest capability;
- no in-place upward model-spend cap top-up + full-max streaming reservation;
- 3J out-of-band admin / trusted cert / no-silent-proving→PROD properties;
- Builder durable custody before output presentation;
- cancellation truth before physical abort + late-output non-authority;
- CONTINUE_LINEAGE quiescence/FAILED/CANCELLED/immutable-disposition rules;
- material verifier fresh candidate materialization;
- restore mandatory modal verbs weakened to may/can;
- universal QA-DB-1→2→3 for every migration + periodic live drift check + no rebuild during promote;
- correct C-011 disposition wording in Decision Registry;
- explicitly route old C-011 case-1 Agent idea to 3K-03 no-Product-Agent first vertical;
- remove automatic implication that AnalyticQuery is a current Product-Agent ToolProjection source;
- name CX-BRAIN-V0-01 / CX-BRAIN-DISCOVERY-01 / CX-BRAIN-FEEDBACK-01 / CX-BUILDER-MASTRA-01 where their current proof obligations are routed;
- update current-tree R11 status to Fable COMPLETE / finding adjudication COMPLETE / Round 3 in progress;
- restore 3K working/blocked/waiting/completed, last-good Preview vs next candidate, progressive resource-vs-machinery disclosure and Ask Conexus about this;
- preserve 3C-09 G2 Graph projection and G4 Advanced knowledge-governance seams;
- normalize architectural owner naming to Production Agent Runtime (PAR);
- restore accepted C-014 PROD provisioning semantics unless a later accepted authority explicitly supersedes it;
- preserve only monotonic/narrowing duplication restrictions and cite the accepted base;
- make F5 target-identity mismatch refusal explicit.

---

## 6. Anti-overshoot requirements

Do not respond to the Fable review by cloning detailed authority into the current tree.

Goal:

```text
Fresh Actor can discover the load-bearing current law
OR the current tree explicitly routes them to the exact semantic home
without requiring prior knowledge that an omitted law exists.
```

Prefer compact law + exact semantic-home pointer over copied multi-page mechanism detail.

Do not add a fifth canonical current document merely to hold corrections. Corrections belong in the existing four-file tree plus the live LEDGER router.

---

## 7. Verification before completion

At minimum:

1. `git fetch` and record exact initial/final HEAD.
2. Inspect every diff; changed paths should be docs/current + LEDGER + bounded R11 evidence only.
3. Search current tree for stale/wrong phrases, including at least:

```text
exact qualified Connection revision
Package B NEXT
Iniciar Package B
R11-F NEXT
R11-G NOT RUN
five trust zones
```

4. Search positively for all high-risk restored laws, including:

```text
active revision in target environment
consume occurrence as SKIPPED
archive does not / archived semantics
audit-required
FAIL CLOSED
effectiveBrainSliceDigest
one non-terminal Promotion
MANAGED_JOB
CR-1
QA-DB-1
CX-BRAIN-V0-01
working != blocked
```

5. Run the repo's applicable documentation/non-billable verification (`npm run verify` or exact repo routing equivalent). Do not run billable/live A3 or Package B.
6. Ensure no Product implementation bytes were added.
7. Ensure PR #40 remains DRAFT and unmerged.

---

## 8. Do not close R11

After edits/tests, **do not declare R11 passed**.

Stop with an execution handoff containing:

```text
final HEAD
commits
changed files
FBL-01..17 correction map (file/section)
LEDGER exact status/next action
verification commands/results
any disagreement/ambiguity found
confirmation no architecture reopen / no Product code / no Package B
```

The next authority action is GPT/architecture review:

```text
Round-3 closure-keyed coherence pass
→ Fresh Actor re-review
→ only if clean: R11-H operator ratification
```
