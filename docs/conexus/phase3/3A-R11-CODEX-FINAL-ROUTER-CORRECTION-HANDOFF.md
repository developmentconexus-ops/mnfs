# 3A-R11 — Codex Final Router Correction Handoff

**Status:** EXECUTION HANDOFF / NON-AUTHORITATIVE  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Expected starting HEAD:** `f05e2f486544309f824cd62660d9eee6e535cab0` — revalidate before editing  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Product implementation:** BLOCKED  
**Package B execution:** FORBIDDEN  
**Merge:** FORBIDDEN  

> Bootstrap only. Operator ratification and the accepted current tree remain authority. This handoff exists only because final GPT verification found two stale projections inside the live Phase-3 router.

---

## 1. Root cause / reproduced defect

R11 mechanical finalization correctly updated the LEDGER top-level state to:

```text
3A-R11 = CLOSED / APPROVED / OPERATOR RATIFIED
Package B = NEXT / NOT STARTED
```

but two internal LEDGER projections were missed:

### Defect A — authority map stale

Current stale text:

```text
3A-R11
→ Whole-Product Authority Rebaseline / ACTIVE / Round-3 projection correction
```

Required current meaning:

```text
3A-R11
→ Whole-Product Authority Rebaseline / CLOSED / APPROVED / OPERATOR RATIFIED
```

### Defect B — read path stale

Current stale path still routes:

```text
AGENTS.md
→ Engineering Method
→ DOCUMENTATION-MAP
→ docs/conexus/DECISOES.md
→ LEDGER
```

This contradicts ratified `AGENTS.md`, `docs/DOCUMENTATION-MAP.md`, `docs/conexus/current/README.md` and R11 itself.

Required LEDGER read path is equivalent to:

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/current/README.md
→ current Product Contract / Architecture Baseline / Decision Reconciliation as needed
→ this LEDGER when Phase-3 status/detail is relevant
→ exact accepted detailed semantic authority
→ deciding Evidence/current implementation only when material
```

`docs/conexus/DECISOES.md` remains historical/provenance and must not appear before `current/` in the active path.

No architecture or Product decision is reopened.

---

## 2. Allowed files — exact

```text
docs/conexus/phase3/LEDGER.md
scripts/test-documentation-tooling.mjs
```

No other file may change.

The test file is allowed only to add regression coverage for the live LEDGER routing defect. Do not modify unrelated documentation tests.

---

## 3. Required RED → GREEN

### RED first

Before correcting `LEDGER.md`, extend `scripts/test-documentation-tooling.mjs` minimally so it reads:

```text
docs/conexus/phase3/LEDGER.md
```

and mechanically asserts at least:

1. the LEDGER authority map projects `3A-R11` as `CLOSED / APPROVED / OPERATOR RATIFIED`, not ACTIVE;
2. the LEDGER active read path contains `docs/conexus/current/README.md` before the LEDGER/current phase detail;
3. the LEDGER active read path does not route through `docs/conexus/DECISOES.md` before current authority.

Run the focused documentation test and record the expected RED caused by the two stale LEDGER projections.

Do not weaken the assertion to make the stale file pass.

### GREEN

Make only the two LEDGER corrections described in §1.

Then rerun the focused test. It must pass.

---

## 4. Full verification

After GREEN:

```bash
npm run verify
```

Also inspect/search the active router docs and establish:

```text
LEDGER 3A-R11 authority map = CLOSED / APPROVED / OPERATOR RATIFIED
LEDGER read path starts through current/README after Method + Documentation Map
DECISOES is absent from the active LEDGER read path
Package B = NEXT / NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
PR #40 merge = NOT AUTHORIZED
```

Historical handoffs/reviews may retain historical text; do not erase provenance.

Do not manually run provider-live/billable qualification jobs.

---

## 5. Completion report

Report:

```text
starting HEAD
final HEAD
exact two files changed
focused RED evidence
focused GREEN evidence
npm run verify result
stale-routing search result
confirmation: no Product/architecture meaning change
confirmation: no Package B execution
confirmation: no merge / no ready-for-review transition
```

Stop if anything beyond these two projections appears necessary.
