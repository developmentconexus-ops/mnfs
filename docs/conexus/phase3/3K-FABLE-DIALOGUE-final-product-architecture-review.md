# 3K — Final Independent Adversarial Review (Fable)

**Status:** NON-AUTHORITATIVE REVIEW PROVENANCE / EVIDENCE ONLY
**Fase:** 3K — Frontend / Product Architecture
**Reviewer:** Fable — independent adversarial architecture reviewer (fresh session, single call)
**Data:** 2026-08-18
**Review packet:** `3K-FABLE-PACKAGE-final-product-architecture-review.md`
**Importante:** este arquivo é evidence de revisão, não authority. Não fecha 3K, não constitui C-018, não autoriza implementação. Adjudicação pertence a operador/ChatGPT contra repository authority.

## Escopo examinado

3K-01, 3K-02, 3K-03, 3K-04 compostas com 3A-R6, 3A-R8, 3A-R9, contra:

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md (Method v1.0.0)
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md (C-000..C-017)
→ docs/conexus/phase3/LEDGER.md
→ 3B..3J closures e prior authorities citadas:
  3A-R7, 3B-08, 3C-04/05/10/15, 3D-02/03, 3E-02, 3G-R1, 3H-R1, 3I-R1, 3J-R1,
  C-001/003/005/006/007/010/011/012/013/014/015/016/017
```

Citações load-bearing verificadas contra os arquivos reais: 3B-08 (`24-arquitetura-system-design.md` §3B-08), `prj.approved_baseline` e `mar.job_run` (3E-02), ownership de `job/v1` no MAR (3C-15), lista nominal de caller surfaces (3D-02), read law direct-call/public-projection (3D-03 Passo 2), AGT-2/3/5 (C-003), restrição v0 de AnalyticQuery (C-011), guardrails de 3A-R7.

Nota de processo: a revisão foi executada sobre `0f7f96b` (origin/agent/conexus-phase-3-system-design); o clone local estava 18 commits atrás e foi fast-forwarded antes da leitura.

---

## 1. Verdict

```text
CURRENT STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS
```

## 2. Material findings

`NONE`

Ataques executados e por que não sobreviveram ao teste de materialidade:

- **Authority/ownership contradiction:** o Workspace Agents catalog (3K-04 §27–31) foi atacado contra 3A-R7, 3K-01 §12/§19 e 3D-03/3E. Não move ownership (Project permanece owner; New Agent resolve Project explícito §31), não cria durable record/fleet state (computed projection; reopen trigger nomeado para cache §41), não exige novo L7 use case (3D-03 Passo 2: reads = direct call + public projection), é access-filtered server-side (§29, consistente com C-015 membership-before-role), e não colide com 3A-R7 — que rejeitou *platform/global persistent Agent artifact* (AGT-4), coisa distinta de projeção cross-Project de Agents tenant. A emenda a 3K-01 é bounded, registrada (§42) e ratificada — forma correta pelo método. A rejeição anterior "Workspace-global Agent fleet" era condicionada a "sem consumidor real"; o consumidor foi declarado e AGT-2 (C-003 F1) já exigia central de agentes.
- **Segunda truth escondida:** varridos read model (3K-03 §6 — declarado não-authority, não prova a si mesmo), scheduler (3A-R9 §9 — projeção reconstruível, Release = authority), catalog (projection), Activity (projection sobre C-013), `sync_state` (Project-DB ETL state já exigido por C-006, não novo record de `hub_control`), RuntimeAgentProjection (3H-02, rebuildable). Nenhuma segunda authority nasce. `MANAGED_JOB` fecha gap real: 3D-02 nomeava PUBLISHED_APP/AGENT_RUN/BUILDER/CONNECTION_QUALIFICATION/ANALYTIC_QUERY e 3C-15 já exigia o caller — a surface faltava mesmo; emenda bounded, sem novo owner.
- **Journeys F1 faltantes (packet §4A):** todos os 14 itens de 3A-R6 §8 têm decisão de journey/authority: seleção/criação Workspace-Project (3K-01 §4/§18), Inception/Baseline (3K-01 §18 + 3A-R8 §6/§9), Change review (3K-02 D1), progresso/blocked (3K-01 §6.2 + 3K-02 §6), Finding/Evidence (3K-02 §6–7), Connections admin/qualification (3K-01 §11 → owner Workspace surface + C-016 credential entry), Brain (3K-01 §13 + 3K-03 §9), Preview (3K-01 §7.1 + 3K-02 §8), Publish/Promotion/rollback (3K-01 §14 + 3K-02 D3), Product Agent (3K-04), MANAGED access (3K-01 §14 Open App + C-015), timeline (3K-01 §15 + 3K-02 §22), access management (3K-01 §16 + 3K-02 D4), data path (3K-03). AGT-4 surface resolvida em 3K-01 §6 (painel contextual "Conexus AI Builder / Platform Consultant"). Project duplication: sem consumidor F1 atual; CIC-4 (C-014) preservada; defer legítimo — não é gap material. Itens restantes são spelling de Realization sob authority inequívoca.
- **Catalog/Tool overreach (packet §4B/§4D):** UniversalTool rejeitado; fontes de ToolProjection = owners existentes (consistente com C-010 fail-closed/agentEligible); `execute(anySlug)` rejeitado; agent-as-tool/MCP/A2A consumer-gated. Nada exige owner universal.
- **Authoring convergence (packet §4C):** manual + natural language convergem no mesmo Change/candidate/`agent/v1`; Mastra Stored/Editor/latest excluídos como authority (consistente com 3H-02 REJECT list); edição trivial sem LLM admitida sem criar segunda draft authority (mutation mechanism → Realization, lifecycle único).
- **Source-aware vs context-aware (packet §4E):** nenhum consumidor F1 exige repo/shell/browser no Product Agent (first vertical tem zero Agents); hints de app context são refs tipados não-autoritativos — consistente com 3I-05 (destination authority nunca de payload/model output).
- **Distorção do first vertical (packet §4F):** 3K-03 §2–3 + 3A-R8 impedem universalização explicitamente (`Sankhya uses sync -X-> ERP integrations use sync`); mirror ≠ authority; benchmark histórico ≠ current truth (§12); zero fake Agent/write; escopo de espelhamento mínimo (§8). 3A-R9 resolve o trigger `job/v1` na menor forma sustentável (sync profile, single-flight, one catch-up, sem workflow engine) com counterexamples CE-1..CE-10 e `CX-MANAGED-JOB-01` em 3L.
- **False-green (packet §4G):** cada cenário do packet tem lei explícita em 3K-02 (§8–§15, §19, §21, §24) mais falsification list #1–18, incluindo mutation de approval subject pós-apresentação (#13). Janela pointer-swap→SERVED_VERIFIED é fail-closed inclusive para recurring occurrences (3A-R9 §10) — coerente com a escada C-013.
- **Overengineering (packet §4H):** deletion test na seção 4; nada sem consumidor nomeado foi congelado.

O que teria falsificado a conclusão: um consumidor F1 exigindo journey sem owner decidido; catalog exigindo durable state/mutation authority; sync exigindo novo módulo/record; qualquer lei 3K contradizendo texto ratificado de 3B..3J. Nenhum encontrado.

## 3. Non-material corrections / ambiguities

Nenhuma muda owner, durable meaning, trust boundary ou semântica de produto:

1. **LEDGER — 3 links quebrados em seções CLOSED** (introduzidos no período 3K, sobreviveram aos commits "restore"): `3C-R1` aponta para `3C-R1-dependency-architecture-final-closure.md` (inexistente; correto: `3C-R1-cross-review-closure.md`); `3G-01` aponta para `3G-01-approval-claim-binding-state-architecture.md` (correto: `3G-01-approval-request-lifecycle-claim-binding-state-architecture.md`); `3G-05` aponta para `3G-05-production-agentrun-approval-trigger-continuation-architecture.md` (correto: `3G-05-production-agent-run-approval-trigger-continuation-architecture.md`). LEDGER é navigation authority — restaurar.
2. **LEDGER — corrupção de wording em law de 3G-R1:** "DEDICATED old exact Release is not invalid merely **porque** newer exists" (era "because"). Restaurar texto exato ratificado.
3. **LEDGER — drift de wording em laws de 3I-02/3I-05 (CLOSED):** "guest ActorRun LLM-provider key" virou "LLM key"; as duas linhas de egress de 3I-05 ("business/application external execution remains Gateway-owned" + "platform-control egress uses only named owner-specific adapters") foram comprimidas em uma, perdendo "only named owner-specific adapters" do sumário. Os docs 3I permanecem authority intacta; restaurar o wording exato do ledger.
4. **3K-04 §30 × 3K-02 §17:** o catalog pode mostrar "pending decisions where authorized" enquanto 3K-02 rejeita cross-Project pending-decision inbox F1. §36/§38 já mantêm decisões context-local; recomenda-se uma linha explícita em §30: attention/pending counts são projeção de descoberta, nunca surface de decisão — o claim segue no owner context.
5. **3K-04 §9:** quando a structured mutation sem LLM for realizada, deve satisfazer a matriz de commit C-014/C-017 (Work Unit, 1 commit canônico). Já implícito por "same Change lifecycle"; uma citação explícita evita interpretação de caminho de mutação fora do work graph no Realization Planning.

## 4. Deletion test

`NONE`

Mecanismos candidatos varridos: Workspace Agents catalog (consumidor declarado + AGT-2 F1), `MANAGED_JOB` surface (consumidor = sync do first vertical), sync profile de `job/v1` (idem), Agent candidate test/preview (pré-condição de Publish sob 3K-02), structured no-LLM edit (remoção tornaria edits triviais model-dependent — falha nomeada em 3K-04 §4). Tudo que carecia de consumidor já está em REJECT/DEFER com trigger nomeado (Jobs tab, cron/RRULE, EVENT, Skills/subagents/MCP/A2A, memória não qualificada, chat widget universal, Approval Center).

## 5. Coverage result

C-001 caso 1: ancorado e exercitado por 3K-03 sem distorção (read-only, benchmark separado de produção). C-003 F1: AGT-1/2/3/5 cobertos por 3K-04; AGT-4 por 3A-R7 + 3K-01 §6; HAR-7 plano visual no Golden Path/D1; PUB-2/4/5 conforme C-015 reescritos; orphan requirements = 0 (confirma resultado do pre-3K checkpoint; nada regrediu). 3A-R6 §8 MUST DECIDE: 14/14 cobertos; `job/v1` conditional → RESOLVED por 3A-R9; `CX-MANAGED-JOB-01` adicionado ao 3L critical path. Nenhum orphan requirement verdadeiro encontrado.

## 6. Reopen result

```text
reopen 3B–3J = NONE
new module required = 0
new durable record required = 0
new database/schema required = 0
```

`prj.approved_baseline` e `mar.job_run` já existiam em 3E-02; 3A-R8/R9 compõem sem criar classe nova; `MANAGED_JOB` e `ProjectBaselineDigest`-in-proof são bounded amendments registradas, não reopens.

---

Per packet §7: este output é evidence only — não fecha 3K. Próximo passo do fluxo: adjudicação operador/ChatGPT das 5 correções não-materiais (itens 1–3 = restauração de texto do LEDGER; 4–5 = uma linha cada) e então closure/ratificação final de 3K.
