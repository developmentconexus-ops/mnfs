# 3E-01 — Fable Hub-Control Data Boundaries Review Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Target:** 3E-01 — Hub Control Data Ownership & Persistence Boundaries  
**Phase:** 3E — Data Architecture  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`

3D is CLOSED. Reconstruct authority from `AGENTS.md` and `LEDGER.md`; treat 3D-R1 as the dependency intake.

## Objective

Close the smallest physical persistence foundation for the Conexus Hub without reopening module ownership or duplicating C-006.

Important existing authority:

- C-006 already decides **Project Data** topology: PostgreSQL, one database per Project plus separate `hub_control`, QA/backup/migration baseline.
- 3D fixes module ownership, the final import DAG, cross-owner transaction rules and the 3E intake.

So 3E-01 should focus primarily on **`hub_control` persistence boundaries**, not redesign Project Data.

## Questions to falsify

1. In one `hub_control` database, what is the smallest physical ownership model that preserves module boundaries?
   - schemas per module?
   - one schema with table ownership conventions?
   - another simpler shape?
   Compare operational cost, migration ergonomics, accidental coupling and enforceability.

2. How should cross-module references work?
   - opaque IDs only;
   - foreign keys across module-owned tables;
   - selective FKs only where they do not create authority/cascade coupling.
   Distinguish referential integrity from domain authority.

3. How is the one approved cross-owner atomic flow (`CreateProject`: Project + I&A) realized without repositories writing each other's tables?

4. How can the Gateway admission transaction atomically coordinate:
   - Gateway-owned ledger state;
   - PAR-owned approval claim capability;
   while preserving table ownership?

5. Which durable Gateway records are actually required now versus deferred to 3G/3M?
   Consider budget reservation, idempotency claim, admitted attempt, traffic state and receipt linkage without prematurely designing the full FSM.

6. How should Mastra substrate storage be physically isolated between Builder and PAR so shared Postgres technology cannot become hidden mutable coupling?

7. Where should MAR route→Project serving mapping live physically, consistent with MAR ownership and active Release authority?

8. What belongs in Observability/Audit persistence versus current-authority tables? Prevent telemetry from becoming a second source of truth.

9. What must remain content-addressed refs/digests rather than duplicated mutable state?

## Guardrails

- Do not reopen C-006's Project database architecture without a material Finding.
- Same PostgreSQL instance/database does **not** mean shared domain ownership.
- No cross-module repository/table access.
- No generic repository framework, UnitOfWork framework, event sourcing, CQRS, outbox/inbox, data mesh, or schema-per-service ritual without a current failure class.
- Do not decide final DTO/API shapes (3F), complete FSMs (3G), runtime substrate selection (3H/3L), security roles/RLS policy (3I), or deployment topology (3J).
- Prefer the simplest enforceable model for a single-process modular monolith.

## Expected output

Materialize only:

`docs/conexus/phase3/3E-FABLE-R0-hub-control-data-boundaries-review.md`

The review should end with:

- recommended `hub_control` physical ownership model;
- allowed/forbidden cross-module persistence relationships;
- transaction ownership model for `CreateProject` and approval/admission;
- minimum durable records needed before 3F/3G;
- explicit YAGNI rejections;
- Findings, if any, against C-006/3D authority;
- recommended next 3E gate after 3E-01.

Do not alter `LEDGER.md` or approved decisions. Commit/push and return the SHA.
