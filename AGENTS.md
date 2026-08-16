# MNFS / Conexus — Agent Instructions

## Start here

Before proposing or changing anything, read:

1. `docs/engineering/standards/root-cause-global-maximum-method.md`
2. `docs/DOCUMENTATION-MAP.md`
3. the current program router/status and decisions
4. task-specific accepted authority and supporting evidence

The local engineering-method file is a manual copy of **DevelopmentConexus Engineering Method v1.0.0**, canonically owned by `developmentconexus-ops/conexus-methodology/METHOD.md`. It is normative for engineering reasoning in this repo. Do not reinterpret or weaken it locally; when intentionally refreshed, replace it from the canonical source.

Do not duplicate the organizational method in this file.

## Program routing

This repository contains distinct program histories. Never infer current work from memory or Git history.

### Conexus

For Conexus work, use:

```text
docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md when working in Phase 3
→ accepted phase/task-specific authority
→ supporting evidence/current implementation
```

`docs/conexus/phase3/LEDGER.md` is the live Phase 3 status/navigation authority. Dialogue/review files are inputs, not authority unless ratified into an approved decision.

### MNFS legacy/product program

For MNFS-specific work, use:

```text
docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md when its MNFS-specific lifecycle/replan policy applies
→ docs/product/CAPABILITY-REALIZATION-METHOD.md when capability realization applies
→ exact task authority/evidence
```

`docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md` is an **MNFS-specific specialization**, not a second organizational engineering method. If it appears to conflict with the DevelopmentConexus method inside the latter's scope, surface the conflict rather than silently choosing or redefining either.

## Authority and evidence

- Current code, schemas, tests, runtime, prior plans and Git history are current-state evidence; they are not target authority merely because they exist.
- Conversations, transcripts, issues and runtime sessions do not create product doctrine or acceptance authority.
- Discovery may challenge accepted authority; execution may not silently ignore it.
- Material findings that change requirements, architecture, threat model or authority return to the appropriate Decision Loop before execution expands.
- Do not silently expand scope.

## Repository safety rails

- Ubuntu WSL2 is the canonical local host; repositories live on the Linux filesystem, not `/mnt/c`.
- Do not reset, revert, stash, clean or delete working state you do not own.
- Never expose secrets or PII in logs, transcripts, commits or documentation.
- Dependency changes require explicit scope.
- Do not edit generated files directly; regenerate and verify.
- Do not copy third-party code without origin/license records.
- Preserve explicit separation of execution environment, tool, credential, network/egress and external-effect authority where applicable.
- Product implementation, real external effects and production dispatch require the current program authority that owns them; historical authorization from another program does not carry over.

## Git and documentation

Git/GitHub/CI own mechanical history: commits, diffs, reviews, workflow results, merge identity and timestamps.

Durable docs should preserve material decisions, architecture/threat model, accepted risk, contracts and deciding evidence that Git history alone does not explain sufficiently. Do not create permanent handoff/acceptance documents for ordinary mechanical work.

Never merge without explicit operator authorization.

## Verification

Default final verification:

```bash
npm run verify
```

For Product Blueprint or capability-traceability changes, regenerate first:

```bash
npm run docs:generate
npm run docs:coverage
npm run docs:check
```

Presence is not execution. Use proof appropriate to the claim; mocks/fakes do not prove real integrations, and a control that cannot be shown to fire is not proven.
