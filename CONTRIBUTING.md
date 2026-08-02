# Contributing to MNFS

## Start

1. Read `docs/DOCUMENTATION-MAP.md`.
2. Read `AGENTS.md`.
3. Confirm the current Product Milestone and Approved Mission Contract.
4. Use a branch or MNFS-managed Write Track.
5. Keep the change bounded to the accepted contract.

## Verification

```bash
npm ci
npm run verify
```

When editing Product Blueprint or capability traceability:

```bash
npm run docs:generate
npm run docs:coverage
npm run docs:check
```

## Architecture changes

Use:

- ADR for one durable architectural choice;
- Capability Spec for a reusable non-trivial capability;
- Mission Plan Revision for scoped implementation commitment;
- Research Report for evidence not yet adopted.

Do not use an issue comment or chat transcript as the final authority.

## Generated files

Never edit:

- `docs/product/PRODUCT-BLUEPRINT.md`;
- `docs/capabilities/*/COVERAGE.md`;
- rendered review HTML.

Edit their sources and regenerate.

## Current restriction

M2 implementation is blocked until Plan Contract schema v2, AS-02, a newly approved `MIS-002` revision and MCRM R0–R4 are complete.
