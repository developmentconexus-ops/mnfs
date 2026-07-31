# ADR-0002: SQLite for local operational state

- **Status:** Accepted for M0; reassess after the first multi-worker pilot
- **Date:** 2026-07-31

## Context

The plugin-era design implemented locking, append-only JSONL, projection cursors, checkpoint repair and replay manually because it prohibited a database. A standalone Pi-first control plane no longer has that constraint.

## Decision

Use SQLite for current operational state and an append-only `events` table for audit history.

Keep repository-owned planning contracts and accepted evidence under `.mnfs/`. Store transient runtime data under the user's state directory, keyed by a committed repository UUID.

For the initial implementation, use Node's built-in `node:sqlite` API behind one store module. The API is isolated so it can be replaced without changing the domain.

## Consequences

- Transactions, uniqueness, locking and crash recovery are delegated to SQLite.
- We do not build a projector or hash-chain ledger in M0.
- Event history remains available for debugging and later telemetry.
- The built-in Node API is still evolving; this is acceptable for the M0 pilot because the adapter boundary is narrow.
