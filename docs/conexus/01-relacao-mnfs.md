# Tópico 0 — Relação Conexus × MNFS

**Status: DECIDIDO — ratificado pelo operador em 2026-08-10 ([C-000](DECISOES.md)).**
Evidência: auditoria completa do código em 2026-08-10 (varredura de `src/`, `tests/`, `bin/`,
`.mnfs/`, ADRs, blueprint).

## O que o MNFS realmente é hoje (fatos)

- **15.544 LOC em `src/` + 20.399 LOC de testes (317 casos), zero dependências npm de runtime.**
  Kernel 100% determinístico: **nenhuma linha chama LLM** — grep por `anthropic|openai|claude|llm`
  em `src/` = 0 hits. O único uso real de agente vive num spike (`spikes/as-02`, Pi + Haiku).
- O que funciona fim-a-fim (CLI `mnfs`): `doctor`, `init`, `mission open`, `status`,
  `plan save/show/render/approve/materialize`, `track open` (**hardcoded MIS-002/M01**),
  `lease grant/release` (**exige binário `treehouse` 2.1.1 pinado por sha256**), `recover`
  (read-only). Sem comandos de worker, claim, verificação ou fechamento de missão.
- Objetos completos: Mission, PlanRevision (v1+v2, o mais rico), WriteTrack, Attempt, Lease
  (33 campos, fencing por geração). Parciais: Claim (só `OPEN`), WorkerRun (nada nunca inicia um
  worker). **Inexistentes: Evidence como objeto, Gate, Verdict, Verification executável.**
- Amarrado ao host: **só roda em WSL2** (rejeita `/mnt/*`), DB fora do repo
  (`~/.local/state/mnfs/`), binários externos pinados (`treehouse`, `lavish-axi`).
- Visão original (blueprint §1): *"development harness planning-first"* — operador conversa com um
  Lead, kernel determinístico governa workers probabilísticos. Produto local, CLI-first, 1 operador.

## O confronto com o produto Mitra-shaped

| Dimensão | MNFS kernel construiu | Conexus (Mitra-shaped) precisa |
|---|---|---|
| Forma | CLI local WSL2 | plataforma web multi-tenant + sandbox cloud |
| Unidade de valor | missão de dev governada | **app publicado** para usuário de negócio |
| Estado durável | SQLite + leases + fencing + recovery | git + registro de artefatos + DB por projeto |
| Concorrência | multi-writer com lease/fencing | 1 writer por branch de usuário (modelo Mitra) — merge do git resolve |
| Agente | zero integração (era o M02, superado) | é o coração: harness + turn protocol + MCP |
| UI | HTML de revisão de plano | studio completo + runtime publicado |

Conclusão fatual: o MNFS resolveu com excelência (TDD rígido, crash-recovery entre processos
reais) **um problema que o Conexus MVP não tem** — coordenação durável multi-worker. A Mitra opera
sem nada disso: git é o único estado durável do build; e multi-agent está na nossa própria lista de
gaps dela ([08](../reference/mitra/08-limites-e-gaps.md)), ou seja, nem a concorrente precisa disso
para vender.

## Recomendação

**Conexus = produto novo, Mitra-shaped. MNFS kernel vira acervo de referência — não é a fundação.**

Vereditos por ativo:

| Ativo | Veredito | Racional |
|---|---|---|
| **Plan schema v2 + validação + render HTML + grafo SVG** (`src/domain/mission-plan.ts`, `src/planning/`) | **REUSE** | É a peça mais product-grade do repo; vira a etapa de escopo/plano visual do Conexus (par do estágio-escopo da Mitra) |
| Padrões de store SQLite (migrations versionadas, sessões atômicas, backup verificado) | **REUSE (padrão)** | Control plane do Conexus precisa disso; copiar padrão, não o módulo inteiro |
| `doctor` (probe de ambiente com veredito) | REUSE (padrão) | barato e útil em qualquer CLI/setup |
| Taxonomia de erros tipados (52 códigos) | REUSE (padrão) | disciplina barata |
| Lease/fencing/Claim/WorkerRun/recovery (`LeaseService` 1.241 LOC etc.) | **DEFER** | resolve multi-writer concorrente; Conexus MVP é 1 writer por branch. Reabrir SE/quando houver frota concorrente |
| Materialização de source git isolado + inspetores | DEFER | útil no futuro build-plane; sandbox cloud (tópico 4) provavelmente resolve diferente |
| Treehouse pinado, lavish, exigência WSL2, zero-deps | **REJECT p/ Conexus** | produto web tem deps; host é cloud |
| Governança A0–A10 / R0–R8 / ARR / acceptance por task | **REJECT** (já decidido no método) | processo >> produto; morre |
| **Programa ARR + replan M2** | **ENCERRAR** | pergunta ("qual substrato local?") deixa de existir; tópico 4 decide sandbox cloud. ARR-S0 facts ficam como evidência |
| ADR-0002 (SQLite), ADR-0004 (estratos de memória), ADR-0007 (credential grants) | REFERENCE | alimentam tópicos 6, 9 e 7/14 respectivamente |
| ADR-0013/0014/0015 (WSL2, workspace, exec env) | REFERENCE (histórico) | superados pela decisão de sandbox do tópico 4 |
| Spike AS-02 (`@anthropic-ai/sandbox-runtime` + Pi + challenge-file) | REFERENCE | evidência real para tópicos 3/4 |

Consequências práticas se ratificado:

1. Repo `mnfs` congela como acervo (código + evidência + pesquisa). Nada é deletado.
2. Produto Conexus nasce em **repo próprio** quando tópicos 3+4 estiverem decididos; até lá, o
   planejamento vive em `docs/conexus/` aqui.
3. STATUS/roadmap do MNFS deixam de reger o trabalho; `docs/conexus/00-TOPICOS.md` + `DECISOES.md`
   assumem.
4. M2 "OPPORTUNITY_REPLAN" e a fila ARR-S1/S2 são encerradas sem implementação.

## Decisão

Ratificada como recomendado — registrada como [C-000](DECISOES.md).
