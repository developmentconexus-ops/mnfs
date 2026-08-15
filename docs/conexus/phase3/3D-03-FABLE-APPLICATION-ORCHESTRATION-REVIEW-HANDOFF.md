# 3D-03 — Fable Application / Use-case Orchestration Review Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Target:** 3D-03 — Application / Use-case Orchestration  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`

Continue com o mesmo papel/metodologia adversarial já estabelecidos.

Leia `AGENTS.md`, `LEDGER.md`, `3D-01-macro-dependency-architecture.md` e `3D-02-capability-gateway-dependency-architecture.md`.

Objetivo desta rodada:

> decidir quais operações realmente justificam Application/Use-case Orchestration e quais devem continuar direct module calls, sem criar god-layer, mediator, workflow engine ou mover invariantes para fora dos owners.

Ataque especialmente:

- `CreateProject`;
- `SetProjectBinding`;
- `QualifyConnection`;
- Project Inception ↔ Builder;
- Brain/AnalyticQuery ↔ Gateway;
- `ComposeRelease`;
- `PromoteRelease` / served verification;
- knowledge proposal only if truly cross-owner;
- cross-module transaction participation;
- risco de todo fluxo virar use case por hábito.

Busque a menor lista necessária de orchestration flows e uma regra objetiva para admitir/rejeitar novos use cases.

Se encontrar falha material em 3D-01/3D-02 ou autoridade anterior, levante Finding.

Materialize somente em:

`docs/conexus/phase3/3D-FABLE-R2-application-orchestration-review.md`

Não altere LEDGER/decisões aprovadas. Faça commit/push e retorne o SHA.
