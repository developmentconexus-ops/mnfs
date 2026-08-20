# 3D-04 — Fable Remaining Dependency Closure Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Target:** 3D-04 — Remaining Module Dependency Closure

Continue com o mesmo papel/metodologia adversarial já estabelecidos.

Leia `AGENTS.md`, `LEDGER.md` e 3D-01/02/03.

Feche o dependency graph restante, atacando principalmente:

- Managed Application Runtime — incluindo a nova aresta estreita `MAR → Brain`;
- Release ↔ serving/conformance sem reverse import para MAR/Builder;
- Production Agent Runtime;
- Builder/Project/Inception residuals;
- Connections/Qualification residuals;
- Brain/Registry/health paths;
- Attachments, Workspace, I&A e Observability;
- infrastructure seams que realmente precisam ser ports;
- full DAG / hidden cycles / unnecessary edges.

Objetivo: produzir a menor matriz final allowed/forbidden de módulos, projections/contexts ainda necessários e dizer se 3D pode seguir para cross-review final sem nova decisão intermediária.

Não reabra 3D-01/02/03 sem Finding material.

Materialize em:

`docs/conexus/phase3/3D-FABLE-R3-remaining-dependency-closure-review.md`

Não altere LEDGER/decisões aprovadas. Commit/push e retorne o SHA.
