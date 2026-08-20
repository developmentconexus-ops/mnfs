# 3K Fable Dialogue — Package A Adversarial Review: Product Model, Navigation & Golden Path

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3K — Frontend / Product Architecture  
**Package under review:** A — `3K-CHATGPT-DIALOGUE-product-model-navigation-golden-path.md` (NON-AUTHORITATIVE candidate)  
**Authority base reviewed:** PR #40 branch `agent/conexus-phase-3-system-design` at `529bb9d21c55ee9adb89326ebe9854503debd1e6`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Purpose:** independent Fable adversarial review of Package A. This file does not create `3K-01`, does not alter `LEDGER.md`, does not reopen 3B–3J, does not constitute C-018 and does not authorize product implementation, merge or PR readiness.

---

## 1. Review basis

Authority reconstructed independently at `529bb9d` via `AGENTS.md → engineering method → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`. Load-bearing claims of Package A were verified against the exact approved sources, notably:

```text
3B-14  three authorization contexts (CONTROL_PLANE / PREVIEW / PUBLISHED_APP)
3B-15  Workspace owns Brain/Connections; Project owns explicit bindings
3C-03  Workspace = tenancy root + Area; Brain/Connections separate modules
3C-07  Connection ownerScope = WORKSPACE | PROJECT (closed)
3F-04  Git-first UX-transparent binding authoring; per-family Control Plane UI → 3K
3A-R7  Platform Consultant = Builder-owned / Control-Plane-presented; negatives
C-011  Brain publish/adopt separation; KnowledgeProposal NO AUTO MERGE
C-014  promote = human gate; usuário vê Releases; binding ambiente×Connection explícito
C-015  same-origin single browser code trust zone + named subdomain triggers
C-017  checkpoint em todo Change; plano visual aprovado pinado (HAR-7/HAR-4)
LEDGER §12 3K-routed rows; 3K intake sweep (non-authoritative input)
```

---

## 2. VERDICT

> **PACKAGE A: SOUND CORE / INCOMPLETE COVERAGE — ready for consolidation WITH mandatory corrections; Round 2 NOT required.**

No material contradiction with C-001/C-003/3A-R6/3A-R7/3B–3J was found. Alternative A is a defensible Global Maximum candidate. All findings are coverage omissions inside the package's own scope, correctable by bounded amendment in the consolidated candidate.

---

## 3. MATERIAL FINDINGS

### F-A1 — GP-6 (Control Plane × published app browser origin/trust zone) unowned and prejudged

The 3K intake classifies GP-6 as MUST ("3K must adjudicate, coding actor must not"; C-015 trigger "classes de confiança distintas"). Package A §13 writes "even when current deployment uses the same Hub/origin mechanics internally" — it assumes the C-015 baseline (same origin by path = one browser code trust zone) without adjudicating whether the subdomain trigger fires for Control Plane × published apps. Package B, per the scope declared in Package A §1 ("approval/risk/evidence/status presentation"), does not own it either.

Result: a MUST DECIDE with no owner in the A/B/C decomposition, and wording that converts uncertainty into a convenient default — exactly what the Method forbids. P6 ("visibly distinct contexts") is presentation; the browser trust boundary is a separate decision a coding actor would otherwise have to make (session cookie scope, CSP, route/link layout). A wrong choice is material retrofit.

**Correction:** adjudicate inside Package A (a legitimate likely outcome: C-015 baseline confirmed for first production — internal team over LAN/VPN per 3J-01 — with the named subdomain triggers preserved) OR explicitly route it with a named owner. Decide; do not presume.

### F-A2 — GP-5 (entry/first-run journey) absent

Package A §5.1 starts at "After central Account authentication". The first-access journey — operator-created Account, single-use setup credential + mandatory change (C-015), first-Workspace bootstrap on a fresh installation — is a journey (Package A's own §15 split: A = where the journey exists; B = what truth the surface shows) and appears nowhere, nor is it routed. Intake GP-5 = MUST.

**Correction:** add the entry/first-run journey at journey level, citing closed C-015 mechanics without re-deciding them.

### F-A3 — GP-11 (archive/unpublish/trigger-disable UX) unrouted

LEDGER §12: "3K only where first vertical requires it; otherwise DEFER SAFELY". Package A does not mention it in Versions/Publish, does not list it in DEFER §16 and does not route it to Package C. A conditional item is left orphaned.

**Correction:** explicit row — adjudication conditioned on Package C; otherwise DEFER with named trigger.

---

## 4. Strongest counterarguments (attacked; candidate survives)

1. **Does the unified Build conversation merge Consultant/Inception/Builder authority?** No. 3A-R7 already fixes the consultant as Builder-owned / Control-Plane-presented — the same owner as build assistance; one surface does not cross owners. Every authority-bearing act (Baseline approval, Change checkpoint, knowledge publish, credential entry, Publish gate) sits outside the conversation in dedicated gates/surfaces (steps 4–5, §9–10; credential never in chat). The conversation carries no authority. Condition: owner-exact decision cards = Package B.
2. **Does the `Product` grouping become a hidden aggregate?** §6.3 explicitly negates the objects; a reopen trigger exists for the multi-app Project case. Reversible presentation. Survives.
3. **Does Build-centrism make Brain feel Project-local (the Mitra failure)?** Step 4 forces the round-trip through the Workspace governance surface (propose → publish → explicit adopt); §9 separates the two faces with the four correct laws (published ≠ adopted etc.), consistent with C-011/3B-15. Survives at architecture level; residual risk is realization-level.
4. **Is Versions/Publish ceremony?** It is the minimum durable truth surface (active version, history, rollback — C-014/3G-08); the deletion test covers it. A single `Publish` action does not collapse the human gate — gate truth (permission/dependency diff, C-015/C-016) is correctly routed to B. Survives.

---

## 5. Required corrections

1. **F-A1:** adjudicate or route GP-6 with a named owner; remove the presumptive wording from §13.
2. **F-A2:** add the entry/first-run journey.
3. **F-A3:** route GP-11.
4. **§7 step 7 wording:** "A live plan/checklist **can** be shown" must not read as weakening HAR-7/C-017 (approved visual plan pinned by digest whenever planning applies). Reword to preserve the obligation conditioned on PlanningDepth.
5. **§7 step 3 (Inception with code inspection/data discovery):** record that the journey does not silently promote the deferred "InceptionInvestigation pre-Change execution shape" (LEDGER §12) into a requirement — 3A-R7 assistance mechanics suffice; the shape remains Decision Loop on realization evidence.
6. **Decomposition reconciliation:** consolidation must reconcile the A/B/C split with the intake's 3K-01..3K-05 — in particular declare where AS-1..AS-6 live (A = placement/journey, B = truth) so no sweep item is orphaned.

---

## 6. Divergent MUST / DEFER / REJECT calls

```text
GP-6  → MUST DECIDE            (package: silent / presumed)   — F-A1
GP-5  → MUST DECIDE            (package: silent)              — F-A2
GP-11 → CONDITIONAL MUST via C (package: silent)              — F-A3

SCHEDULE trigger admin:
  intake says MUST (AS-4); package defers until real consumer.
  Fable sides WITH THE PACKAGE — 3A-R6 rule: no first-vertical consumer
  → no first-product dependency; the package's conditional formulation
  already covers the flip if Package C fires it.
  The intake↔package divergence must be recorded at consolidation,
  not left silent.
```

All other MUST/DEFER/REJECT items in the package align with approved authority. No included item should instead be DEFER/REJECT; no internal machinery leaks into the Golden Path; no truth/authority is hidden in the name of directness (the never-hide contract is correctly delegated to Package B — with the structural caveat, already guaranteed by the decomposition via 3K-R1, that Package A alone cannot close 3K).

---

## 7. Readiness

**Ready for consolidation after corrections 1–6 are incorporated.** A full Round 2 is not justified: zero material contradiction with approved authority; findings are bounded coverage gaps. Exception: if the GP-6 adjudication during consolidation produces a contentious outcome (e.g. the subdomain trigger firing already in F1), that returns as its own decision before 3K-01 closes.

No authority, LEDGER or code was altered by this review.
