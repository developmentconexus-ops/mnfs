# 3E-02 — Fable Durable Record Inventory & Reference Closure Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Target:** 3E-02 — Module Durable Record Inventory & Reference Closure  
**Phase:** 3E — Data Architecture  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`

3E-01 is APPROVED. Reconstruct authority from `AGENTS.md` and `LEDGER.md`; treat `3E-01-hub-control-data-ownership-persistence-boundaries.md` as the direct data-architecture authority.

## Objective

Close the **minimum durable record inventory** needed by the approved F1 architecture, without prematurely designing final schemas/DTOs/FSMs.

For each Hub module, determine only what must durably exist now to preserve its approved authority/lifecycle and what should remain DEFER/derived/content-addressed instead of becoming a table.

## Questions to falsify

1. For each persisted Hub module (`iam`, `ws`, `prj`, `bld`, `reg`, `con`, `gw`, `brn`, `par`, `rel`, `mar`, `obs`, `att`), what is the smallest set of durable record classes required by current authority?
2. What is the owner and conceptual identity of each record?
3. Which identities are:
   - opaque IDs;
   - content-addressed digests/revision refs;
   - generation/CAS identities;
   - provider/runtime refs only?
4. Which proposed records are actually duplicates, projections, caches, telemetry, or current-state mirrors and therefore should **not** become authoritative tables?
5. Close the exact F1 allowlist of **Tier-2 cross-module FKs** under 3E-01 rules. Every FK needs a concrete integrity failure class; absence remains the default.
6. Verify that historical pins do not become mutable mirrors and that OBS/Mastra remain outside domain referential authority.
7. Confirm the minimum Gateway durable records from 3E-01 without expanding into the full 3G/3M FSM.
8. Confirm what MAR, PAR, Builder and Release must persist versus what remains substrate/internal/ref-only.

## Required challenge discipline

- Treat every proposed table/record as guilty until a named owner + consumer/invariant justifies persistence.
- Prefer opaque refs/digests over duplicated mutable state.
- Do not add a record merely because a future UI/report might want it; projections can be derived later.
- No FK cross-module by convenience. Produce one explicit closed allowlist.
- No cross-module repository/table access.
- No schema `shared/common`.
- No generic persistence framework, event sourcing, CQRS, outbox/inbox or soft-delete framework.

## Mastra/current-framework verification

For any statement that depends on **current Mastra behavior**, use **Context7 plus the Mastra skill available in your environment** and prefer current official docs/source. Do not rely on model memory. If the skill is unavailable, record that fact and use Context7/current primary documentation.

Do not use Mastra internals as Conexus domain authority; `mastra_builder` and `mastra_par` remain substrate databases per 3E-01.

## Do not decide yet

- final columns/types/indexes or SQL DDL details → later 3E/implementation;
- DTO/API/envelope contracts → 3F;
- complete lifecycle/FSM/state taxonomy → 3G;
- runtime mechanics → 3H;
- DB roles/RLS/threat hardening → 3I;
- deployment/backup implementation details → 3J;
- ORM/tool selection → 3L/implementation qualification.

## Expected output

Materialize only:

`docs/conexus/phase3/3E-FABLE-R1-durable-record-inventory-review.md`

The review should end with:

- one compact inventory: module → minimum durable record classes → authority reason;
- explicit DEFER/REJECT records to prevent speculative schema growth;
- identity/ref classification;
- exact closed Tier-2 FK allowlist with justification per FK;
- any contradiction/finding against 3E-01 or earlier authority;
- recommendation whether 3E-02 can be decided directly or needs a focused correction.

Do not alter `LEDGER.md` or approved decisions. Commit/push and return the SHA.
