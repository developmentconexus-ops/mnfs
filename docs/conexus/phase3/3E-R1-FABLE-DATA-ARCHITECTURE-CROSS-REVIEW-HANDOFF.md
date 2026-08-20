# 3E-R1 — Fable Data Architecture Cross-Review Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Target:** 3E-R1 — Data Architecture Cross-Review / Closure  
**Phase:** 3E — Data Architecture  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`

3E-01 and 3E-02 are APPROVED. Reconstruct authority from `AGENTS.md` and `LEDGER.md`; treat the two approved 3E decisions as direct data-architecture authority.

## Objective

Perform the **final adversarial cross-review of Data Architecture** before any transition to 3F.

Do not redesign the architecture from scratch. Attempt to falsify whether 3E-01 + 3E-02 are sufficient, internally consistent and faithful to C-006/3C/3D. Reopen an approved decision only for a material Finding.

## Authority under review

Read at minimum:

- `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`
- `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`
- `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`
- relevant 3C owner docs when testing an alleged mismatch.

The `3E-FABLE-R*` files are historical review inputs only; do not treat them as authority over the approved 3E decisions.

## Questions to falsify

1. **Coverage:** does every material authority/lifecycle from approved 3C/3D have a sufficient durable representation, without requiring a hidden implementation-time architecture decision?
2. **Ownership:** does every durable record have exactly one owner, with no cross-module repository/table shortcut?
3. **References:** do Tier-1/Tier-2/Tier-3 rules preserve referential integrity without pretending that an FK grants live authority?
4. **Tier-2 allowlist:** challenge all 16 entries. Is each necessary and safe under lifecycle/purge semantics? Is any missing FK required to prevent a concrete structural integrity failure?
5. **Pins versus mirrors:** verify all current-state facts remain with their semantic owner and all cross-owner copies are historical immutable pins/refs only.
6. **Project intent:** verify Baseline, Brain binding, Connection binding + exact ConnectionRevision, and Config Contract are sufficient without GenericProjectBinding/settings machinery.
7. **Connections:** verify WORKSPACE|PROJECT ownership, immutable revisions, credential grant refs, append-only Qualification and derived health form a coherent model without hidden duplicate authority.
8. **Registry:** verify PLATFORM|WORKSPACE|PROJECT scope-by-kind works without generic scope registry or ownership framework.
9. **Gateway:** verify effect attempt/idempotency/budget records are sufficient before 3F/3G and do not prematurely freeze the FSM.
10. **Audit/OBS:** verify audit-required atomicity does not turn OBS into current domain truth and Operational Telemetry remains degradable.
11. **Mastra:** verify `mastra_builder`/`mastra_par` remain substrate only and no current Mastra capability/state needs another Conexus authority record. For any claim about current Mastra behavior, use **Context7 + the Mastra skill available in your environment**; if skill unavailable, record that and use Context7/current primary docs/source.
12. **Attachments/CAS:** verify `att.blob` remains Attachments-owned metadata/refcount only and does not become global BlobStore/CAS ownership/refcount.
13. **Project Data:** verify `hub_control` cannot become a shortcut to read/write Project business data and C-006 topology remains intact.
14. **YAGNI:** identify any record/FK/schema/transaction helper/projection that has no current owner+consumer+failure class.
15. **Closure:** are remaining questions truly owned by 3F+ (contracts/FSM/runtime/security/deployment/qualification/recovery), or is another 3E decision materially required?

## Operator-approved amendment that must be tested

3E-02 explicitly requires `ProjectConnectionBinding` to pin both:

```text
Connection identity
+ exact ConnectionRevision ref
```

Both remain Tier-3 opaque refs/no cross-module FK; live eligibility is revalidated by the appropriate owners/gates.

Also verify:

```text
att.blob
= Attachment-domain backing metadata/refcount
!= platform-global CAS registry/refcount
```

## Guardrails

- No final column/type/index/DDL design unless a missing detail is itself a material architecture blocker.
- No DTO/API design (3F).
- No complete FSMs (3G).
- No runtime implementation or queue design (3H).
- No DB-role/RLS/security design (3I).
- No deployment/backup procedure design (3J).
- No ORM/tool choice (3L).
- No generic persistence framework, event sourcing, CQRS, outbox/inbox, policy engine, relationship graph, binding engine or scope engine.
- No implementation, no C-018, no LEDGER mutation.

## Expected output

Materialize only:

`docs/conexus/phase3/3E-FABLE-R2-final-data-architecture-cross-review.md`

End with one verdict:

```text
CLOSE 3E
CLOSE 3E WITH BOUNDED EDITORIAL CORRECTIONS
MATERIAL FINDING — REOPEN 3E-01
MATERIAL FINDING — REOPEN 3E-02
MATERIAL FINDING — ADD 3E-03
```

For every Finding, state:

- violated authority/invariant;
- concrete failure class;
- smallest correction;
- whether it blocks 3E closure;
- later owner if it does not block.

If closure is recommended, provide a compact final checklist showing coverage of the 3D-R1 intake and the exact items routed to 3F/3G/3H/3I/3J/3L/3M.

Commit/push the review and return the SHA. Do not alter approved decisions or `LEDGER.md`.
