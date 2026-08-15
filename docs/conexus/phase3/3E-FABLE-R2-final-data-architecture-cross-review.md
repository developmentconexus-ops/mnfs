# 3E-FABLE-R2 — Final Data Architecture Cross-Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3E — Data Architecture, cross-review final (gate 3E-R1)  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3E-R1-FABLE-DATA-ARCHITECTURE-CROSS-REVIEW-HANDOFF.md`)  
**Base revisada:** `f8775bee95f2096effb097bcba8f029c03dccd98` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, e não autoriza implementação. O fechamento formal de 3E é ato do operador sobre este parecer. Os arquivos `3E-FABLE-R*` anteriores são inputs históricos; a autoridade revisada aqui é 3E-01 + 3E-02.

---

## 1. Verdict

# **CLOSE 3E**

A tentativa de falsificação não encontrou blocker nem correção editorial obrigatória. As 15 perguntas do handoff passam (§3–§17); a emenda ratificada do operador (`ProjectConnectionBinding` pina Connection **e** exact ConnectionRevision, ambos Tier-3) é coerente e testada (§8); `att.blob` permanece backing de Attachments e não vira CAS global (§14); os nove itens do intake de 3D-R1 §12 têm cobertura durável explícita (§3); nenhum item restante exige decisão 3E adicional — todos têm owner posterior nomeado (§17).

Dois guard notes não-bloqueantes acompanham o fechamento (§18): (a) o probe `CX-AGENT-MASTRA-01` deve nomear explicitamente **stored agents** e **workflowDefinitions** do substrate como caminhos proibidos de authoring; (b) GC/refcount de bytes do CAS fora do domínio Attachments (payloads de Registry, dists servidos) permanece sem owner de rotina — roteado a 3J/implementação, sem record novo agora.

3E fica reconstruível por fresh actor a partir de: 3E-01 (topologia/ownership/transações/TxScope) → 3E-02 (44 classes, identidades, 16 FKs, pins×espelhos) → este R2 (prova de cobertura + roteamento final).

---

## 2. Método e fontes

Autoridade reconstruída: `AGENTS.md` → `LEDGER.md` → 3E-01 + 3E-02 (autoridade sob revisão) → 3D-R1 (intake §12) → 3C owners consultados em cada suspeita de mismatch (3C-02/03/04/06/07/08/10/13/15) → C-005..C-017 onde citados.

Ataques executados na ordem do handoff: cobertura item a item do intake 3D-R1 (§3); varredura de ownership dos 44 records (§4); teste das regras de referência contra "FK finge live authority" (§5); desafio individual das 16 FKs + busca de FK faltante (§6); varredura pins×espelhos incluindo os records novos (§7); teste da emenda do operador (§8); coerência do modelo Connections (§9); registry scope-by-kind (§10); suficiência do ledger do Gateway sem congelar FSM (§11); OBS como história e nunca verdade atual (§12); verificação Mastra com fontes atuais (§13); fronteira `att.blob` × CAS global (§14); fronteira hub_control × Project Data incluindo o cursor de ETL (§15); caça YAGNI nos 44 records/16 FKs (§16); teste de fechamento — resta decisão 3E material? (§17).

### Verificação Mastra

A skill de Mastra citada no handoff **não existe neste ambiente** — `ListSkills`/`SearchSkills` retornam vazio (re-verificado nesta sessão). Fato registrado conforme instruído; verificação via **Context7** (`/mastra-ai/mastra`, docs + source atuais):

```text
F-M1  domain `memory` persiste threads/messages/resources no substrate
F-M2  domain `workflows` persiste run snapshots (suspend/resume);
      domain `workflowDefinitions` persiste definições dinâmicas
F-M3  schedules são persistidos como rows próprias, sobrevivem restart,
      CRUD via mastra.schedules, id estável opcional
F-M4  NOVO — "stored agents": configs COMPLETAS de agente (instructions,
      model, tools, subagents, memory options) persistidas em database,
      com create/update/delete EM RUNTIME e estados draft/publish
      (mastraClient.createStoredAgent / storedAgent.update)
```

---

## 3. Q1 — Cobertura do intake 3D-R1 §12 — 9/9

| Item do intake | Cobertura durável |
|---|---|
| 1. ownership/schema boundaries por módulo | 3E-01 §2 — 13 schemas, 1 owner cada, sem shared/common ✓ |
| 2. Gateway admission/effect ledger (budget/idempotency/attempt/traffic/receipt) | 3E-01 §8 + 3E-02 `gw` (3 classes) ✓ |
| 3. CreateProject cross-owner atômico | 3E-01 §6 Classe 1 + §7 TxScope ✓ |
| 4. approval claim + admission atômicos | 3E-01 §9 (claim single-use na mesma tx; IDs opacos) ✓ |
| 5. MAR route→Project mapping | 3E-01 §11 + `mar.serving_route` sem espelho de Release ✓ |
| 6. OBS persistence + lineage projections | 3E-01 §12 + `obs` (2 classes + derivadas reconstruíveis) ✓ |
| 7. Mastra storage partition/isolation | 3E-01 §10 — `mastra_builder`/`mastra_par` ✓ |
| 8. representação de narrow refs/projections | 3E-02 §4 — opaque/digest/generation/runtime-ref ✓ |
| 9. nenhum shortcut de persistência cross-owner | tiers + TxScope non-query + §5/§6 de 3E-02 ✓ |

Varredura adicional de lifecycles 3C por representação faltante que forçaria decisão arquitetural escondida na implementação: Inception/Baseline candidate (estado dentro da classe `approved_baseline`/`project`; FSM → 3G, sem classe nova necessária), checkpoint humano de Change (estado em `bld.change` + `obs.audit_record`), DEPENDENCY_PROPOSAL (evidência de promotion + audit — DEFER mantido), eval attestation C-010 (evidence refs em gates/acceptance; ver §13), EnvironmentConformance (resultado na promotion + obs). **Nenhuma omissão material.**

---

## 4. Q2 — Ownership — PASS

Os 44 records mapeiam cada um para exatamente um schema/owner de 3C; nenhuma classe aparece em dois módulos; os dois pontos de contato cross-owner (CreateProject; admissão+claim) executam SQL apenas pelo código do respectivo owner via capability/operação pública com `TxScope` — que é non-query-capable por 3E-01 §7, então a atomicidade viaja sem transportar acesso a tabela. `att.blob` pertence a Attachments (não é CAS global — §14); `job_run` pertence a MAR; `binding_validation` pertence a Brain (validação especializada) enquanto o intent fica em `prj.*`. Sem shortcut encontrado.

---

## 5. Q3 — Regras de referência — PASS

Tier 1 livre no próprio schema; Tier 2 fechado por allowlist com RESTRICT-only; Tier 3 default. A separação crítica está explícita na própria 3E-02 §5: *"referential integrity não deve fingir live authorization"* — FK prova existência estrutural no commit, nunca eligibilidade/autoridade viva, que é revalidada no owner (3D-01 §8). As rejeições nominais (binding→connection, gw↔par, digest, obs, mastra) preservam exatamente os casos onde FK daria falsa garantia. Coerente.

---

## 6. Q4 — Desafio das 16 FKs + busca de FK faltante — PASS

Cada entrada testada contra lifecycle/purge:

- **#1–#6 (iam→ws/prj):** linhas de autoridade nunca penduram em estrutura fantasma; RESTRICT implementa archive-before-purge (3B-16) — purge de workspace/project exige remover autoridade primeiro, por classe. Nenhuma bloqueia arquivamento (estado, não DELETE). ✓
- **#7 (prj→ws):** derivação de escopo íntegra; base do caso PROJECT de Connections (workspace derivado, nunca copiado). ✓
- **#8/#9 (con condicionais):** XOR por `ownerScope`; connection portadora de credential_ref jamais órfã de dono. Purge de project com Project Connection viva é bloqueado — correto: credencial é a última coisa que deve dangling. ✓
- **#10/#11 (reg condicionais):** identidade compilável/servível ancorada; PLATFORM sem FK artificial. ✓
- **#12–#16 (bld/rel/mar/att → prj):** registros de entrada de autoridade; RESTRICT ordena purge por classe. ✓

**FKs faltantes candidatas — todas rejeitadas com razão:**

```text
par.conversation / par.agent_run → prj.project
  purge já bloqueado por #12–#16; escopo enforced na admission boundary;
  regra consistente: episódio/runtime record não ganha FK de projeto

gw.effect_attempt → prj.project
  ledger de alto volume com retenção própria; pins por digest; FK
  bloquearia GC/purge por classe sem eliminar failure class nova

mar.job_run → rel.release
  pin histórico por digest (imutável) — FK sobre digest proibida

rel.active_pointer → rel.release
  o ponteiro resolve manifest DIGEST (CAS), não release id; intra-módulo
  e content-addressed por construção — sem FK
```

Allowlist fechada de 16 permanece necessária e suficiente.

---

## 7. Q5 — Pins × espelhos — PASS

Varredura completa dos 44 contra 3E-02 §6: pins históricos corretos (`agent_run`, `job_run`, `effect_attempt`, `promotion`, `change_acceptance`, bindings pinando revisão exata); espelhos proibidos ausentes (`mar.serving_route` sem Release digest; Project sem `activeRelease`; Registry sem estado operacional de Connection; OBS sem current-state decisório). Casos-limite verificados: `bld.change → contract_revision ativa` e `prj.config_contract_revision` ativa são transições do próprio owner (não espelho); `connection_binding` pina identidade imutável e a eligibilidade é revalidada — intent pin, não mirror. ✓

---

## 8. Q6 — Project intent + emenda do operador — PASS

`approved_baseline` (append, digest), `brain_binding` (tipado, pin de revisão `brain-binding/v1`), `connection_binding` (tipado, purpose × environment), `config_contract_revision` (append, digest, ativa) cobrem 3C-04 sem `GenericProjectBinding`/settings bag.

**Emenda testada:** o pin duplo `connection identity + exact ConnectionRevision ref` é necessário (revisions coexistem pinadas independentemente — 3C-07) e coerente como Tier-3: a consistência `revision ∈ connection` é validada por Connections no set/gate (fail-early 3D-03 §5.2), e existência/qualification/revogação/eligibility são revalidadas por Connections/Gateway/Release na hora H. FK aqui fingiria exatamente a live authority que a regra proíbe. Binding para connection retirada falha fechado nos gates — comportamento correto, sem integridade estrutural violada. ✓

---

## 9. Q7 — Connections — PASS

O modelo fecha sem autoridade duplicada escondida:

```text
connection (ownerScope XOR + grant version)   → identidade/custódia de relação
connection_revision (imutável)                → configuração semântica exata
connection_qualification (append-only)        → fato histórico provado
health                                        → derivação operacional, HEALTHY != ALLOW
eligibility atual                             → derivação/policy (3G) sobre os três acima
```

Testes: qualification de grant antigo não "vale" para grant novo (linha pina grant version — 3C-07-A); requalificação não sobrescreve história; revision paralela mantém qualifications independentes; `key_version` criptográfica ausente do domínio; nenhum consumidor lê `con.*` cross-schema (projeções públicas). ✓

---

## 10. Q8 — Registry — PASS

Kind→scope como função fechada em CHECK (integration→refs NULL; brain→workspace; demais→project), um único Registry, sem registry configurável de kinds/scopes, sem framework de ownership. `brain-binding` PROJECT-scoped é coerente com authoring no repo canônico do Project (3C-06) e com `prj.brain_binding` pinando a revisão por digest. PLATFORM sem FK artificial — nenhuma "tabela Platform" nasce por consequência. ✓

---

## 11. Q9 — Gateway — PASS

As 3 classes bastam para 3F/3G sem congelar FSM: `effect_attempt` dá identidade durável + pins + traffic/outcome/receipt linkage (valores de `traffic_state` já são autoridade C-013/3C-08 anterior, não expansão de 3E); `idempotency_claim` dá replay-safety; `budget_counter` cobre apenas classes duráveis C-016. Settlement/retry/reconciliation/`OUTCOME_UNKNOWN` machinery = estados/colunas futuros sobre essas classes (3G/3M), não classes novas. Reads/DENY sem ledger — preservado. ✓

---

## 12. Q10 — Audit/OBS — PASS

Classe 2 transversal grava `audit_record` na transação da mutação audit-required — mas o registro é **histórico append-only**; nenhum caminho de decisão lê `obs.*` para autorização/estado atual, zero FK em ambas as direções, e telemetry comum permanece assíncrona/degradável (buffer bounded, `events_dropped`). OBS não se torna verdade de domínio por participar da transação: participa como sink de durabilidade, não como authority. ✓

---

## 13. Q11 — Mastra substrate — PASS com guard note

Domínio a domínio do storage atual (F-M1..F-M4) contra a pergunta "algum estado do substrate exige novo record de authority Conexus?":

| Domain Mastra | Estado | Precisa de record Conexus novo? |
|---|---|---|
| memory (threads/messages/resources) | substrate | não — `par.conversation` já é a identidade/policy |
| workflows (run snapshots) | substrate | não — `par.agent_run` pina composição/lifecycle |
| workflowDefinitions | substrate | não — **nunca** vira authoring authority (F3E02-R1) |
| schedules | substrate | não — `par.agent_trigger` é a autoridade de existência/enable |
| **stored agents (F-M4)** | substrate | não — e é o risco mais alto: config completa de agente mutável em runtime com draft/publish; 3C-10 já REJECT como source of truth |
| scores | substrate | não — evidência de eval Conexus entra por obs/gates (atestação C-010 = evidence refs), nunca pela tabela de scores do substrate |
| observability (traces/spans) | substrate | não — correlação 3H/3L; `obs.operational_event` é o record Conexus |
| datasets/experiments | substrate | não — sem consumidor F1; nunca viram autoridade de golden fixtures sem Decision |

`mastra_builder`/`mastra_par` permanecem substrate-only; correlação por runtime refs; zero FK; nenhum record Conexus adicional necessário. **Guard note §18-a**: o probe deve nomear stored agents explicitamente. ✓

---

## 14. Q12 — `att.blob` × CAS global — PASS

3E-02 §3 é explícito: `att.blob` = metadata/refcount/generation **exclusivamente do backing de Attachments** (C-015: mesmo database para transação ACID única com `attachment`); não coordena lifecycle/refcount de Registry/Release/Evidence/OBS/Backup; igualdade física de digest entre domínios não cria ownership compartilhado; refcount global cross-domain proibido/deferido. Consequência honesta registrada: GC de bytes CAS **fora** do domínio Attachments (payloads compilados de Registry, dists servidos) não tem rotina owner hoje — bytes são imutáveis e pinados por Releases, então acúmulo é custo de disco, não corrupção. Roteado a 3J/implementação (guard note §18-b), sem record novo agora. ✓

---

## 15. Q13 — Project Data intacto — PASS

`hub_control` não contém business rows; `{proj}_query`/`{proj}_action` não conectam ao `hub_control` (C-015); acesso a Project Data só pelo Gateway com roles C-006. Ponto verificado explicitamente para fechar uma ambiguidade de implementação: **o cursor de ETL (`sync_state` C-006 comp. 9) vive no database do Project**, não em `hub_control`/`mar` — o cursor só avança pós-merge e precisa ser transacional com o upsert de staging no mesmo database; `mar.job_run` guarda apenas o lifecycle operacional do job. Colocá-lo no hub seria shortcut cross-boundary que quebraria a atomicidade cursor↔merge. C-006 permanece intacta em engine, topologia, roles, QA gates, backup e template. ✓

---

## 16. Q14 — YAGNI — PASS

Caça a record/FK/helper sem owner+consumidor+failure class atual: os 44 têm consumidor nomeado (classes condicionais como `plan_revision` são "quando aplicável" por planning depth — C-017; `ws.area` opcional por tenant = zero rows, não classe especulativa); as 16 FKs têm failure class individual (§6); o único helper transacional é `withTransaction`+`TxScope` com dois consumidores reais; projeções derivadas declaradas reconstruíveis. A lista não-construir de 3E-02 §7 cobre os candidatos a crescimento especulativo. Nada a remover. ✓

---

## 17. Q15 — Fechamento e roteamento — nenhuma decisão 3E adicional necessária

Tudo que resta pertence a fases posteriores, com owner explícito:

```text
3F   DTOs/APIs/envelopes; error taxonomy; approval capability signature;
     ConnectionRef/RevisionRef; contratos de binding do Project;
     re-tipagem F3B-R2 (MissionPlan v2 → Change/WU)

3G   FSMs completas (attempt/settlement, Promotion, Inception/Baseline,
     job lifecycle, qualification staleness/eligibility, Finding);
     F3D02-R1 (in-flight narrowing) e F3D04-R2 (archived + active Release)
     com 3I; N3 Planning Depth × RigorProfile

3H   realização runtime (Mastra instances/domínios, job substrate no MAR,
     caches/invalidations); Mastra telemetry ↔ Conexus correlation (c/ 3L)

3I   roles/RLS/grants do hub_control; CredentialBackend custody físico
     (F3E02-R2); grant version contract; trust/egress

3J   backup/restore operacional incl. mastra_par (F3E01-R1); GC de CAS
     fora de Attachments (guard §18-b); topologia/DNS/TLS; retenção física

3L   CX-AGENT-MASTRA-01 (incl. guard §18-a: stored agents +
     workflowDefinitions nunca authoring), CX-BUILDER-MASTRA-01 e demais
     probes; qualificação de tooling de enforcement/ORM

3M   crash recovery (NOT_SENT/OUTCOME_UNKNOWN, orphan reconciliation,
     GC de blobs em duas fases sob falha)

impl rebuild 0..N do hub_control no CI (F3E01-R2); colunas/tipos/índices/
     DDL; migrations físicas
```

Nenhum desses itens exige representação durável nova que 3E-01/3E-02 não tenham previsto — logo **não há 3E-03 material**.

---

## 18. Guard notes — não bloqueiam fechamento

### a. Probe deve nomear stored agents e workflowDefinitions

F-M4 confirma que o substrate atual persiste configs completas de agente mutáveis em runtime (draft/publish), além de workflowDefinitions (F-M2). 3C-10 e F3E02-R1 já proíbem semanticamente; o guard aqui é operacional: `CX-AGENT-MASTRA-01` deve incluir prova negativa explícita de que **nenhuma definição criada/alterada via stored-agents/workflowDefinitions do substrate executa fora do que a Release pina** (definição runtime deriva só do artifact compilado). **Owner: 3H/3L.**

### b. GC de bytes CAS fora de Attachments

`att.blob` cobre refcount/GC apenas do backing de Attachments. Bytes CAS de Registry payloads e dists servidos são imutáveis/pinados e sem rotina de GC — aceitável no F1 (acúmulo = disco, nunca corrupção), mas a rotina/limpeza eventual precisa de owner operacional quando houver pressão de disco. **Owner: 3J/implementação; gatilho: high-water mark de disco do CAS.**

---

## 19. Checklist final de fechamento

```text
intake 3D-R1 §12                     9/9 cobertos (§3)
44 record classes                    owner único cada; sem shortcut (§4)
16 FKs Tier-2                        todas necessárias/seguras; nenhuma faltante (§6)
pins × espelhos                      zero espelho; casos-limite verificados (§7)
emenda ProjectConnectionBinding      coerente; Tier-3 correto (§8)
Connections                          sem autoridade duplicada (§9)
Registry scope-by-kind               fechado sem framework (§10)
Gateway ledger                       suficiente p/ 3F/3G; FSM não congelada (§11)
OBS                                  história, nunca verdade atual (§12)
Mastra                               substrate-only; 4 fatos verificados via
                                     Context7; skill ausente registrada (§13)
att.blob                             Attachments-only; CAS global deferido (§14)
Project Data / C-006                 intacto; sync cursor no Project DB (§15)
YAGNI                                nada sem consumidor (§16)
decisão 3E adicional                 não necessária (§17)
guard notes                          2, não-bloqueantes, com owner (§18)
```

Se o operador ratificar:

```text
3E-01 = APPROVED
3E-02 = APPROVED
3E-R1 = APPROVED
3E — Data Architecture = CLOSED / APPROVED
3F — Contracts & API Architecture = NEXT
```

---

*Fim de 3E-FABLE-R2. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
