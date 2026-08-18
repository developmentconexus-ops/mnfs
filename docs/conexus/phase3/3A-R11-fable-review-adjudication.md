# 3A-R11-G — Fable Whole-Product Review Adjudication

**Status:** ADJUDICATED / ROUND-3 CORRECTION REQUIRED  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Reviewed Evidence:** `3A-R11-fable-independent-whole-product-review.md` at `e8f129a8364c6fb9cd4d78dd96c7a616cc1674ca`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Implementation:** BLOCKED  
**Package B:** PAUSED / NOT OPENED  
**C-018:** NOT RATIFIED  

This document adjudicates the independent Fable review as Evidence. It does not copy the reviewer verdict blindly and does not create new Product or architecture authority. Each surviving item below was checked against accepted detailed authority.

---

## 1. Adjudication verdict

```text
Fable whole-product verdict           = BOUNDED CORRECTION REQUIRED
Architecture/Product reopen           = NONE
New Product requirement               = 0
New semantic owner/module/record/DB   = 0
Stale mechanism preserved by R11      = NONE
Qualification overstatement           = NONE
Future/YAGNI overbuild                 = NONE

FBL-01..07                             = ACCEPT / MANDATORY CURRENT-TREE CORRECTION
FBL-08..13                             = ACCEPT / BOUNDED COMPLETENESS CORRECTION
FBL-14                                 = ACCEPT / MANDATORY ROUTER CORRECTION
FBL-15..17                             = ACCEPT / BOUNDED CURRENT-TREE CORRECTION

R11-H operator ratification            = BLOCKED pending Round 3 + re-coherence
Package B                              = PAUSED pending R11-H
```

Severity note: the reviewer classified FBL-14 as non-material. R11 adjudication upgrades its **execution priority**, not architecture severity: `phase3/LEDGER.md` is the live Phase-3 router and the approved R11 activation record explicitly requires its reconciliation as part of activation. A stale router is therefore a mandatory correction before any next-action claim, while still requiring no Decision Loop or architecture reopen.

---

## 2. FBL-01 — EnvironmentConformance predicate

**Disposition:** ACCEPT / MANDATORY PROJECTION CORRECTION.

Accepted C-014 authority requires:

```text
pinned Connection revision
== active revision in target environment
```

and explicitly states that `qualified` alone is insufficient.

Round-3 correction:

```text
ARCHITECTURE-BASELINE EnvironmentConformance
→ exact pinned Connection revision == exact active target-environment revision
→ qualification remains an independent prerequisite/fact, never a substitute for active-revision equality
```

No semantic authority changes.

---

## 3. FBL-02 — Product-Agent schedule semantics vs MAR catch-up

**Disposition:** ACCEPT / MANDATORY PACKAGE-B PREREQUISITE CORRECTION.

Two different recurring-work laws must remain visibly distinct.

### Product Agent `SCHEDULE` / PAR

Current 3H-02 authority:

```text
schedule wake
→ guarded PAR ingress
→ current trigger/revision/schedule validation
→ stable intended-slot identity before AgentRun admission
→ cursor scoped by (TriggerId, TriggerRevision)
→ single-flight
→ exact current Release pin
→ AgentRun
```

Overlap:

```text
new valid occurrence + active trigger-origin run
→ occurrence consumed as SKIPPED
→ no AgentRun
→ no hidden backlog/catch-up
```

Schedule fire never directly executes the Product Agent.

### Managed sync / MAR

Current 3A-R9 law remains different:

```text
downtime across N intervals
→ at most one catch-up run if current served Release still requires sync and freshness is behind
→ never N historical slots
```

Round-3 correction must expose both laws without a shared generic recurrence abstraction.

---

## 4. FBL-03 — Project Archive behavior

**Disposition:** ACCEPT / MANDATORY PRODUCT-LAW CORRECTION.

Current authority:

```text
ARCHIVED
→ freezes ordinary authoring/future intent expansion
-X-> unpublish
-X-> stop existing serving
-X-> stop pre-existing enabled Product-Agent trigger
-X-> stop already-authorized managed recurrence by itself
```

While archived, current laws allow narrowing such as explicit trigger `DISABLE`, while trigger CREATE/ENABLE/reconfiguration and ordinary new composition remain blocked. Release recovery while archived is bounded to a Release previously activated for that Project and still currently conformant.

Product Contract/current entrypoint must make the user-observable law explicit: **Archive does not stop automations and does not unpublish.**

---

## 5. FBL-04 — Audit-required fail-closed triad

**Disposition:** ACCEPT / MANDATORY SECURITY/AUDIT CORRECTION.

Current Observability/Audit law has three distinct degradation classes:

```text
ordinary Operational Telemetry missing
→ MISSING/degraded
→ ordinary domain work may continue where telemetry is not required

audit-required operation cannot persist required AuditRecord
→ FAIL CLOSED

verification-required runtime Evidence missing
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

Round 3 must project all three. Audit Trail and Operational Telemetry remain different meanings inside one module.

---

## 6. FBL-05 — Brain enforcement and content-security cluster

**Disposition:** ACCEPT / MANDATORY BRAIN CORRECTION.

Current C-011 laws to restore:

### Runtime health currentness

```text
AgentRun pins Brain health snapshot
→ before final answer AND before any effect/approval execution
→ recheck health epoch of critical dependencies
→ critical change invalidates continuation/approval and recomposes context

Brain-dependent approval
→ binds effectiveBrainSliceDigest
```

Critical `SUSPECT`/`INVALID` semantic content is not silently used where authority says it blocks.

### Brain content boundary

```text
real ERP data in Brain Git = forbidden
sampleSource = enum | synthetic for sample values / verified-query fixtures
PII lint + secret scanning + human review = required defense
custom_instructions = closed types/scopes
custom_instructions cannot command authorization/tools/approvals/credentials/platform policy
Brain never creates grant/tool/data scope or widens platform authority
```

No RAG/memory/security-policy machinery is added.

---

## 7. FBL-06 — Release / Promotion behavioral laws

**Disposition:** ACCEPT / MANDATORY RELEASE CORRECTION.

Current 3G-08 laws to restore:

```text
change_acceptance/current proof
→ rechecked at ComposeRelease
→ rechecked immediately before material Promotion steps
→ stale/inadmissible proof refuses progression without rewriting history

(Project, PROD)
→ at most one non-terminal Promotion
→ losing concurrent request performs zero DDL/drain/material steps

maintenance incompatibility crossed
→ serving-block survives failed/stuck Promotion terminalization
→ closing Promotion never silently re-enables old incompatible serving

post-SERVED_VERIFIED governance/proof drift
→ does not automatically deactivate/rewrite active pointer
→ current owner/security/health gates may still narrow individual operations
```

No Promotion queue/lease/workflow engine is introduced.

---

## 8. FBL-07 — `MANAGED_JOB` Gateway caller amendment

**Disposition:** ACCEPT / MANDATORY ROUTING/ARCHITECTURE CORRECTION.

3A-R9 explicitly amends the Gateway caller-family with:

```text
MANAGED_JOB
```

Server-derived context includes exact JobRun, Project/environment, Release, Job ArtifactRevision and admitted input/occurrence identity. `MANAGED_JOB` cannot widen authority or select arbitrary Project/Connection/Release/revision/environment.

Round 3 must:

- expose `MANAGED_JOB` in Architecture Baseline Gateway caller surfaces;
- mark 3A-R9 as the bounded amendment when routing from old 3D-02 caller lists;
- preserve 3A-R10 Package-D proof obligation.

---

## 9. FBL-08 — Security completeness cluster

**Disposition:** ACCEPT / BOUNDED CORRECTION.

Restore without new machinery:

1. **CR-1:** security-sensitive mutation consuming mutable authority owned elsewhere must serialize/conflict with concurrent revoke/narrow through commit while preserving owner-scoped DB isolation; 3N/3O combined negative proof remains mandatory.
2. **Closed cross-owner domain atomicity set:** F1 contains exactly:
   - `CreateProject → prj + iam initial grant`;
   - `effect admission → gw + par approval claim`;
   plus the narrow append-only audit capability required by audit-required same-transaction paths; no generic cross-owner UnitOfWork.
3. **Credential backup separation:** outside trusted Hub boundary no one compromise path/location/credential may yield both Connection ciphertext set and root/recovery key material.
4. **OTel baggage:** credentials, mutable authority/security decisions, PII/secrets and Conexus owner IDs are outside baggage by default; clear/omit before external/untrusted egress unless a future explicitly admitted crossing says otherwise.
5. **Guest capability:** Hub-minted, exact-run/consumer scoped, bounded, server-expiring, server-revocable; guest cannot mint/widen/refresh; pause/resume never preserves authority without current server check. F1 transient tokens are memory-only.
6. **Model spend:** no upward in-place run-cap top-up; streaming/provider attempt reserves full qualified maximum liability before provider I/O.
7. **3J properties:** out-of-band administration/stop seam; production certificate path is normally browser-trusted without warning click-through; proving state never silently becomes PROD authority.

---

## 10. FBL-09 — Builder final-law completeness

**Disposition:** ACCEPT / BOUNDED CORRECTION.

Restore current 3H-01/R1 laws:

```text
runtime output
→ Hub-side durable custody + identity verification
→ only then output presentation/producedOutputRef authority

cancel requested
→ Builder terminal cancellation truth commits first
→ physical abort is best effort afterward
→ late output/snapshot never regains authority

CONTINUE_LINEAGE
→ immutable admission disposition
→ requires current compatibility + physical continuity + quiescence
→ FAILED alone never authorizes reuse
→ CANCELLED requires explicit applicable-authority admission
→ if admitted continuation becomes unrealizable, do not silently downgrade same ActorRun to FRESH_BASE

material verifier
→ fresh cognition
+ fresh candidate materialization anchored to exact candidate identity
```

---

## 11. FBL-10 — Modal softening

**Disposition:** ACCEPT / BOUNDED WORDING CORRECTION.

Where detailed authority says `must/required/blocks`, the current tree must not say `can/may/where required` in a way that converts an invariant into optional behavior.

Round 3 must restore mandatory modality for at least:

- critical Brain SUSPECT/INVALID blocking where applicable;
- structured `tasks.md` SHARE gate against current Plan revision/state;
- four Brain trace digests;
- Sankhya Discovery TDD*-first order for the current Sankhya consumer;
- ProjectBrainBinding conformance proof required by the accepted semantic-binding contract.

---

## 12. FBL-11 — Migration/QA completeness

**Disposition:** ACCEPT / BOUNDED CORRECTION.

Restore:

```text
QA-DB-1 → QA-DB-2 → QA-DB-3 = universal for every migration
```

with proportional data/rehearsal depth, not optional elimination of the gate.

Also restore:

- periodic live-DB × migration-ledger drift check between builds;
- no rebuild/recompile during Promotion under the same Release identity; config/proof drift makes candidate stale/revalidated, never silently rebuilt into the same Release.

---

## 13. FBL-12 — Decision Registry / AnalyticQuery corrections

**Disposition:** ACCEPT WITH ONE CLARIFYING NUANCE.

### Registry wording

C-011 positions such as `Brain != RAG/memory` and live-inheritance rejection are original C-011 invariants; they must not be presented as if later authority newly superseded them.

### First vertical

The early C-011 v0 idea of a read-only Agent for case 1 is superseded by accepted 3K-03:

```text
first Budget Analyzer vertical
→ Product Agent required = NO
```

### AnalyticQuery

AnalyticQuery remains an admitted Brain semantic read regime. However, the current Product-Agent ToolProjection sources in 3K-04 do **not** automatically include AnalyticQuery merely because the platform owns that regime. Therefore:

```text
AnalyticQuery
-X-> automatic Product Agent ToolProjection source
```

A Product Agent can consume it only when the applicable current consumer/Release/tool authority explicitly admits that use. Round 3 removes the baseline's premature implication while preserving AnalyticQuery itself.

---

## 14. FBL-13 — Probe identity traceability

**Disposition:** ACCEPT / BOUNDED CORRECTION.

Name the already-existing proof identities where the current tree routes their obligations, without copying the old probe bodies:

```text
CX-BRAIN-V0-01
CX-BRAIN-DISCOVERY-01
CX-BRAIN-FEEDBACK-01
CX-BUILDER-MASTRA-01
```

Also preserve the downstream first-build proof map from 3A-R10 without implying those probes are already qualified.

---

## 15. FBL-14 — live router integrity

**Disposition:** ACCEPT / MANDATORY ROUTER CORRECTION NOW.

`phase3/LEDGER.md` remains the live Phase-3 router. R11 activation explicitly requires reconciliation to:

```text
3A-R11 = ACTIVE
Package B = PAUSED / NOT OPENED
```

The current `Package B NEXT` wording is stale and must be mechanically corrected in Round 3 **before** any new next-action claim.

This is not the full post-ratification authority-tree rewiring. `AGENTS.md`, Documentation Map and historical-register role changes remain gated until R11-H. The correction here is only live status/router integrity.

---

## 16. FBL-15 — internal current-tree status

**Disposition:** ACCEPT / BOUNDED CORRECTION.

After this adjudication the current tree must no longer say R11-F is next or R11-G has not run.

Round-3 status before re-coherence:

```text
R11-A census                         COMPLETE
R11-B/C/D current-tree candidates   ROUND-3 CORRECTION IN PROGRESS
R11-E rounds 1/2                    COMPLETE
R11-F fresh actor                   COMPLETE / PASS
R11-G Fable review                  COMPLETE / BOUNDED CORRECTION REQUIRED
Fable finding adjudication          COMPLETE
Round-3 corrections                 NEXT / IN PROGRESS
Round-3 closure-based coherence     NOT YET COMPLETE
R11-H operator ratification         BLOCKED
Package B                           PAUSED
```

---

## 17. FBL-16 — 3K Product-law completeness

**Disposition:** ACCEPT / BOUNDED PRODUCT CORRECTION.

Restore user-visible Product laws:

```text
working != blocked != waiting-for-user != completed
building next candidate != currently inspectable last-good Preview
```

Preserve progressive disclosure explicitly:

```text
REAL PRODUCT RESOURCES
→ directly inspectable

PLATFORM MACHINERY
→ progressive detail only
```

And preserve `Ask Conexus about this` as contextual inspectability: selected resource/context can be passed under current server-derived authorization without granting new authority/capability/cross-Project access.

---

## 18. FBL-17 — bounded miscellany

**Disposition:** ACCEPT WITH NARROW WORDING.

Round 3 should:

- preserve 3C-09 future seams for **G2 Graph projection** and **G4 Advanced knowledge governance** (ontology / DMN-BPMN / temporal/formal rules) without building them;
- normalize current naming to **Production Agent Runtime (PAR)** where referring to the architectural owner; Product Agent remains the Product concept;
- restore C-014's decided F1 PROD provisioning semantics rather than hedging them without a later superseding authority;
- keep any extra Project-duplication never-copy restrictions only where they are monotonic/narrowing and cite the accepted base rather than presenting them as new product law;
- make F5 target-identity mismatch explicit: owner dispatch handle/context controls the target, producer payload identity is cross-check only, mismatch refuses proposal and can never terminalize another run.

---

## 19. Round-3 process correction

Fable correctly falsified the **completeness method**, not the accepted architecture.

Rounds 1/2 were keyed mainly from C-003 and the R11 census/hotspots. Round 3 must instead perform a fresh completeness pass keyed off the **preserved/final-law lists of the accepted phase closures and late behavioral/runtime/security decisions**, including at minimum:

```text
3C-R1
3D-R1
3E-R1
3F-R1
3G-R1 + 3G-05 + 3G-08
3H-R1 + 3H-01 + 3H-02 + 3H-03
3I-R1
3J-R1
3K-R1
3A-R8 / R9 / R10
3L-Q0 / Package A deciding Evidence
```

The goal is not to clone every detailed rule. The pass asks whether a Fresh Actor using the current tree can discover every load-bearing current law or be routed to it without first knowing that the omitted law exists.

---

## 20. Exact next action

```text
apply Round-3 current-tree + LEDGER corrections from FBL-01..17
→ verify only projection/router changes, no semantic reopen
→ run closure-keyed fresh coherence pass
→ run fresh-actor read test again
→ if clean, present R11-H whole-product contract/baseline/reconciliation for explicit operator ratification
```

Package B remains paused. No product implementation. No merge.