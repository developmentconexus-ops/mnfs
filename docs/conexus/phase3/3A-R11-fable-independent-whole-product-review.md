# 3A-R11-G — Fable Independent Whole-Product Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3A-R11 — Whole-Product Authority Rebaseline (etapa R11-G)  
**Revisor:** Fable (independent Senior/Staff/Principal whole-product review, per `3A-R11-FABLE-INDEPENDENT-WHOLE-PRODUCT-REVIEW-HANDOFF.md`)  
**Base revisada:** `673cb890dbd10b084ccea60a966b946dc97d8426` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Nota de HEAD:** o handoff cita target `86a2618…`; o delta `86a2618..673cb89` é exclusivamente o próprio handoff — o conteúdo sob revisão é idêntico.  
**Importante:** este parecer é Evidence, nunca requirement authority. Não constitui C-018, não ratifica R11, não altera `LEDGER.md` nem decisões aprovadas, não autoriza implementação nem merge do PR #40. A adjudicação é ato do operador/R11 sobre este parecer.

---

## 1. Verdict

# **BOUNDED CORRECTION REQUIRED**

A estrutura aceita (3B–3K + dispositions + forma de 4 arquivos) está **confirmada**; nenhum Decision Loop precisa reabrir. Em ~40 documentos de autoridade detalhada confrontados independentemente: **zero contradições de autoridade aceita, zero mecanismo stale preservado como current, zero autoridade duplicada, zero overstatement de qualificação, zero maquinário futuro dormente**.

A proposição do handoff ("accurately and completely compiles… safe to ratify") falha em uma única direção, sistemática: **completude de leis enforcement-grade**. O current tree projeta fielmente o que diz, mas omite ou suaviza obrigações que as próprias closures ratificaram — concentradas exatamente nas seções profundas que as Rounds 1–2 não amostraram. Os candidatos exigem uma Round 3 de correções de projeção + re-coherence antes de R11-H.

---

## 2. Método e fontes

Autoridade reconstruída sem depender das auto-citações do R11:

- Leitura direta integral: `AGENTS.md` → método DevelopmentConexus → `DOCUMENTATION-MAP.md` → os 9 documentos de processo R11 → as 4 peças de `docs/conexus/current/` → `DECISOES.md` → `03-requisitos.md` → `3L-Q0` → `3L-A` → `3A-R10` → `LEDGER.md` → spot-checks (`3A-R7`, `24-arquitetura-system-design.md` §cross-review, família 3E).
- 7 verificações adversariais independentes, cada uma lendo integralmente a família de autoridade detalhada e atacando cada claim do current tree nas duas direções (completude/perda × invenção/falsa preservação), com evidência file:line:
  1. Brain — C-011 (`15-cerebro-empresa.md`) + 3C-09;
  2. Release/lifecycle — C-014 (`12-ciclo-de-vida.md`) + 3C-11 + 3G-08;
  3. Observabilidade/F5 — C-013 (`11-observabilidade.md`) + 3C-13 + 3H-03 + 3K-02 (+3E-02);
  4. Product Agent — C-010 (`09-agente-primeira-classe.md`) + 3C-10 + 3G-05 + 3H-02 + 3K-04;
  5. Builder runtime — 3A-R5 + 3H-01 + 3H-R1 + 3A-R8 + C-001 (`02-visao-escopo.md`);
  6. Segurança/topologia — 3I-01..05 + 3I-R1 + 3J-01 + 3J-R1;
  7. Frontend/jobs — 3K-01 + 3K-03 + 3K-R1 + 3A-R9.

Verificações de qualificação (§7.5 do handoff) feitas contra as fontes primárias 3L-Q0/3L-A, não contra o resumo do R11.

**Escala de severidade usada** (declarada para adjudicabilidade): MATERIAL = correção obrigatória antes de R11-H — ratificar como está deixaria a camada de descoberta ativamente enganosa ou poria em risco a rederivação de Package B. NON_MATERIAL = correção bounded que deve acompanhar a mesma rodada. **Nenhum finding reabre autoridade aceita; todos são defeitos da compilação R11, disposição `CORRECT_PROJECTION`, nova autoridade = NO em todos.**

---

## 3. Findings

### FBL-01 · MATERIAL · summary-weakens-authority

- **Current tree:** `ARCHITECTURE-BASELINE.md:737` — EnvironmentConformance verifica "exact **qualified** Connection revision for target environment".
- **Autoridade:** `12-ciclo-de-vida.md:116` — "Connection revision **pinada == revision ativa no ambiente alvo** (não apenas 'qualified')".
- **Por que importa:** o tree afirma exatamente o predicado que C-014 declarou insuficiente — viola o corolário 3 do target invariant do R11 (resumo nunca enfraquece autoridade detalhada). Não é omissão: lendo o texto, nada sinaliza necessidade de consultar a home.
- **Falha:** realização derivada do tree implementa o check fraco; Connection qualificada-mas-não-ativa passa conformance.

### FBL-02 · MATERIAL · Package-B prerequisite / cross-law confusion

- **Current tree:** única semântica de catch-up visível é a de MAR — `PRODUCT-CONTRACT.md:754`, `ARCHITECTURE-BASELINE.md:1300` ("one catch-up after downtime"). ARCH §24 não tem subseção de SCHEDULE.
- **Autoridade:** 3H-02 §15–18 — trigger de Product Agent tem lei **oposta**: single-flight com consume-on-skip, **sem** catch-up/backlog; stable intended-slot identity **antes** da admissão do AgentRun; cursor por (TriggerId, TriggerRevision); schedule-fire nunca executa o Agent diretamente.
- **Por que importa:** Package B será rederivado deste tree; CX-AGENT-MASTRA-01 qualifica exatamente essas semânticas.
- **Falha:** rederivação empresta a lei de MAR para triggers de Agent e especifica catch-up onde a autoridade manda skip.

### FBL-03 · MATERIAL · lost product law (ordered explicit)

- **Current tree:** zero ocorrências de "archiv*" nas 4 peças.
- **Autoridade:** 3G-05 §9 ("Archive congela expansão/authoring; não vira serving authority"; trigger habilitado pré-existente continua gerando AgentRun; 3G-05:345 **ordena**: "UX 3K deve deixar explícito que arquivar não para automações nem despublica"); 3G-08:319–339 (recuperação de Project ARCHIVED limitada a Release já ativada, guarda mecânica); 3A-R9 §23 (archive não para recorrência de jobs).
- **Por que importa:** comportamento visível ao usuário que a autoridade mandou o produto declarar; o Product Contract é agora essa camada.
- **Falha:** operador arquiva Project esperando parar automações; agentes/jobs continuam rodando.

### FBL-04 · MATERIAL · lost security/audit law

- **Current tree:** zero ocorrências de "audit-required"; ARCH §30 intitula-se "Observability, audit…" mas carrega só "append-only/auditable observations where appropriate".
- **Autoridade:** 3C-13 §7 + invariante 5 ("operação audit-required não termina silenciosamente sem audit persistido — FAIL CLOSED"); 3H-03 §27 tríade de degradação (telemetria ordinária degrada e domínio segue / audit-required fail-closed / verification-required NOT_PROVEN); 3E-02:320.
- **Por que importa:** das três classes de degradação, o tree projeta só a terceira; leitor não reconstrói a fronteira.
- **Falha:** realização trata falha de audit como falha de telemetria e segue executando.

### FBL-05 · MATERIAL · lost Brain enforcement cluster

- **Current tree:** ARCH §§20–23 e PC Journey K sem nenhum dos dois blocos.
- **Autoridade:** C-011 §10 — AgentRun pina health snapshot; **recheck de health de dependência crítica antes de resposta final e antes de qualquer efeito/aprovação**; aprovação Brain-dependente vincula `effectiveBrainSliceDigest`; mudança crítica invalida continuação. C-011 §11 — segurança de conteúdo: nenhum dado real de ERP no Brain Git; `sampleSource` obrigatório; PII lint + revisão humana; `custom_instructions` fechado (proibido instruir sobre autorização/tools/aprovações/credenciais); authority lattice (Brain nunca amplia autoridade).
- **Por que importa:** são as travas que impedem o Brain de virar canal de escalada de autoridade ou de servir número SUSPECT em efeito.
- **Falha:** agente executa efeito baseado em métrica cuja health virou INVALID após o pin; ou conteúdo de Brain instrui aprovação.

### FBL-06 · MATERIAL · lost Release/Promotion behavioral cluster

- **Current tree:** ARCH §12 cobre C-014/3C-11 mas nenhum refinamento 3G-08.
- **Autoridade:** 3G-08:137–165 (**uma única Promotion não-terminal por (Project, PROD)**, admissão conflict-realized, perdedor zero passos materiais); 3G-08:235–259 (maintenance serving-block sobrevive à terminalização da Promotion); 3G-08:83–135 (recheck de `change_acceptance` no ComposeRelease e imediatamente antes de passos materiais; stale ⇒ recusa sem mutar aceite); 3G-08:389–397 (governance drift pós-SERVED_VERIFIED não desativa pointer automaticamente).
- **Por que importa:** leis comportamentais que impedem corrida de Promotions e reabertura silenciosa de serving incompatível.
- **Falha:** realização derivada do tree admite duas Promotions concorrentes para PROD.

### FBL-07 · MATERIAL · superseded routing / lost amendment

- **Current tree:** zero ocorrências de `MANAGED_JOB` caller surface; ARCH §19 não enumera caller surfaces; `DECISION-RECONCILIATION.md:86` roteia "Dependencies → 3D-01..04" sem flag.
- **Autoridade:** 3A-R9 §8/§27.1 — única emenda estrutural do 3A-R9: adicionar `MANAGED_JOB` à família de caller surfaces do Gateway; 3A-R10 Package D: "MANAGED_JOB Gateway caller cannot widen authority".
- **Por que importa:** leitor que segue o routing chega à lista pré-emenda do 3D-02 — instância exata da failure class que R11 existe para eliminar.
- **Falha:** realização de MAR deriva caller surface inexistente ou herda lista desatualizada.

### FBL-08 · NON_MATERIAL · security completeness cluster

Ausentes/enfraquecidos (recuperáveis via routing 3I/3J): composição CR-1 (3I-01 §7.2 + 3I-R1 §4 — serialização de mutações sensíveis vs revogação concorrente; prova combinada mandada para 3N/3O, ausente também do ARCH §46); separação root/recovery-key ↔ backup (3I-02 C4/§12 — nenhum caminho único entrega ciphertext + root key; prova two-sided); conjunto **fechado de exatamente 2** capacidades cross-owner (3I-05 §§9–10, diluído para "explicitly justified" em ARCH:281); lei completa de OTel baggage (3I-05 §7.3 — proíbe todos owner IDs/credenciais/PII por default, não só "sensitive"; baggage limpo antes de egress externo); tokens transientes memory-only F1 (3I-02 §10.1); capability de guest server-expiring/server-revocável a cada uso incl. pause/resume DENY (3I-02 C6/§13.2); sem top-up de cap mid-run + pré-reserva full-max em streaming (3I-03 §5.3/§13); itens 3J menores (admin out-of-band, propriedade de certificado sem click-through, no-silent-proving→PROD).

### FBL-09 · NON_MATERIAL · Builder law cluster

~4 das 14 leis finais de 3H-R1 §3 não projetadas: custódia Hub-side durável **antes** de apresentação de output (3H-01 §12); cancel terminal comete antes do abort físico + late output nunca recupera autoridade (3H-01 §13); gates de CONTINUE_LINEAGE (quiescence como precondição; FAILED sozinho nunca autoriza reuso de lineage; CANCELLED exige admissão explícita; disposição imutável sem degradação silenciosa para FRESH_BASE); verificador material usa **fresh candidate materialization**, não só cognição fresca (3H-01 §14.2 — ARCH 38.3 projeta só a independência cognitiva).

### FBL-10 · NON_MATERIAL · modal softening cluster

"must" → "can/may": bloqueio de semântica crítica SUSPECT/INVALID (`ARCHITECTURE-BASELINE.md:1083` "can block" vs C-011 "bloqueia"); gate mecânico do bloco estruturado do `tasks.md` (`PRODUCT-CONTRACT.md:244` / `ARCHITECTURE-BASELINE.md:432` "may be mechanically checked" vs C-013 §12 gate obrigatório no SHARE); 4 digests do trace ("can distinguish" vs "registra"); ordem TDD*-first da Discovery Sankhya ("can be used" vs mandada); prova de conformidade do binding ("where required").

### FBL-11 · NON_MATERIAL · migration/QA completeness

Ausentes: universalidade QA-DB-1→2→3 para toda migration (`12-ciclo-de-vida.md:193-196` — zero menção a QA-DB no tree); drift check periódico live-DB × ledger entre builds (`12-ciclo-de-vida.md:218-219` — conformance no tree é só promote-time); "nunca rebuild no promote"/sem recompile silencioso sob mesmo releaseId no plano compose-side (ARCH:1281 cobre só serve-time).

### FBL-12 · NON_MATERIAL · Decision Registry defects

(a) `DECISION-RECONCILIATION.md:170` — coluna "superseded/refined" do C-011 lista posições **originais** do C-011 ("Brain != RAG/memory", "live inheritance rejected") como se fossem correções posteriores; (b) supersessão específica não roteada: esboço v0 do C-011 §13 ("agente read-only" no caso 1) → superseded por 3K-03 (vertical sem agente — confirmado na fonte 3K-03 §5C); (c) `ARCHITECTURE-BASELINE.md:1260` lista "AnalyticQuery surface where admitted" como fonte de ToolProjection — nem 3K-04 §11 nem C-010 (comp. 18: tool analítica gated por triggers nomeados) a nomeiam; pré-admissão suave de capability gated.

### FBL-13 · NON_MATERIAL · probe identity traceability

IDs de probes bloqueantes não nomeados no tree: CX-BRAIN-V0-01 / CX-BRAIN-DISCOVERY-01 / CX-BRAIN-FEEDBACK-01 em lugar nenhum; CX-BUILDER-MASTRA-01 só como "Package-A tested properties". ARCH §42 preserva as famílias genericamente; nomear os IDs preserva rastreabilidade sem duplicar conteúdo.

### FBL-14 · NON_MATERIAL · router integrity

`docs/conexus/phase3/LEDGER.md` tem **zero sinal de R11**: estado geral e ação final ainda dizem "PACKAGE B NEXT / Iniciar Package B". O activation record exige a reconciliação do LEDGER "as part of R11 activation", e a proteção ("no execution may use the stale wording") vive num arquivo que o caminho de leitura padrão (AGENTS → LEDGER) nunca alcança. Instância viva da failure class do R11 no próprio router. Correção: flip mecânico mínimo agora (`R11 ACTIVE / Package B PAUSED`); rewiring completo continua pós-ratificação.

### FBL-15 · NON_MATERIAL · stale internal status

As 4 peças carregam status/próxima-ação defasados vs HEAD: `current/README.md` §11–12 diz "R11-F NEXT / R11-G NOT RUN" (R11-F está COMPLETE; R11-G é esta revisão); rodapés de PC §36 / ARCH §50 / DR §12 apontam ações já executadas. O entrypoint responde errado à pergunta "qual a próxima ação governada?".

### FBL-16 · NON_MATERIAL · 3K product-law completeness

Ausentes: lei load-bearing `working != blocked != waiting-for-user != completed` (3K-01:173 — zero hits no tree); lei de progressive disclosure + classificação REAL PRODUCT RESOURCES vs PLATFORM MACHINERY (3K-01 §17); "building next candidate" != Preview inspecionável atual (3K-01:190 — não destruir o último Preview usável); "Ask Conexus about this" como propriedade de inspecionabilidade (3K-01 §8).

### FBL-17 · NON_MATERIAL · miscellany

Seams 3C-09 G2 (graph projection) e G4 (ontologia/DMN) ausentes das listas de future seams; drift de nome "Product Agent Runtime" vs "Production Agent Runtime" (`ARCHITECTURE-BASELINE.md:1797` vs §24); hedge "historically lazy… where applicable" no PROD provisioning (ARCH:716) sem autoridade nomeada para o rebaixamento do mecanismo decidido em C-014; extensão benigna (restritiva — manter, citando base) da lista never-copy de duplicação; F5 mismatch-refusal (3H-03 §18 — recusa proposta, nunca terminaliza outro run) só implícito em "cross-check only".

---

## 4. Resposta ao §9 — falsificação do processo de revisão R11

Parcialmente falsificado, na direção prevista pelo handoff. Os veredictos "0 material findings" das Rounds 1–2 **sobrevivem** (confirmo 0 contradições de autoridade aceita). O claim implícito de **completude** não sobrevive: a Round 1 derivou completude da matriz C-003 + hotspots H1–H8 do próprio census, e a Round 2 verificou **as próprias 14 correções** — nunca re-amostrou as listas de leis preservadas das closures de fase. Os 17 findings acima se concentram exatamente onde esse método não olha: 3G-05 §9, 3G-08 (meio), 3H-R1 §3, 3C-13 §7, C-011 §10–11, 3I-R1 CR-1, emenda 3A-R9 §8.

Confirmação do viés apontado: o self-review usou os próprios eixos do census para provar o census. Correção de processo recomendada para a Round 3: rodar o passe de completude **keyed off a lista de leis preservadas de cada R1 de fase** (3C-R1..3K-R1 + closures 3G-05/3G-08/3H-01..03), não das decisões C-*.

---

## 5. Demais eixos do handoff — resultado limpo

- **§7.2 falsa preservação/stale inheritance:** os 16 itens da lista de ataque verificados independentemente — todos corretamente mortos/roteados. Nenhum mecanismo stale implementável a partir do tree.
- **§7.3 autoridade duplicada/ausente:** nenhuma encontrada; owner map singular; projeções não viram authority.
- **§7.4 Product ↔ architecture:** todas as journeys têm home estrutural sem inventar owner novo.
- **§7.5 honestidade tecnológica:** matriz verificada contra 3L-Q0/3L-A primários — nenhum upgrade selected→qualified; guard E2B, OM KEEP OFF, Codex OAuth só caminho testado, pg-boss candidate-only, B–E não qualificados: tudo correto.
- **§7.6 YAGNI bidirecional:** nenhum maquinário dormente introduzido; nenhum seam evidenciado apagado (dois micro-seams fora das listas — FBL-17).
- **§7.7 first installation:** corretamente scoped como primeira instalação, não lei SaaS universal, nas três peças + 3J-R1.
- **§7.8 Package B:** identifiers/obligations de 3A-R10 intactos; recompilação (não replay) de probes históricos garantida por 3A-R10 §7 + Q0 §2; único risco de compilação é FBL-02 (+FBL-07 para Package D).
- **§8 objetivo do operador:** as 11 perguntas do operador são respondíveis pelo tree, exceto "qual a próxima ação governada" (FBL-15). Forma de 4 arquivos **confirmada como a menor camada sustentável**; o modo de falha observado é sub-projeção, não duplicação — as correções devem adicionar linhas de lei + ponteiros de routing, **não** clonar detalhe (guardar contra overshoot para uma segunda spec).

---

## A. Finding summary

```text
Material Findings: 7 (FBL-01..FBL-07)
Non-material Findings: 10 (FBL-08..FBL-17)
New Product requirements proposed: 0
Architecture reopen required: NO
```

## B. Whole-product verdict

```text
BOUNDED CORRECTION REQUIRED
```

## C. Current-tree fitness

```text
Can current/ become the canonical current discovery/source-of-truth layer? CONDITIONAL — sim, após FBL-01..07 (mínimo) + re-coherence
Does it lose still-current Product meaning? YES — bounded (archive, agent-trigger, audit fail-closed, Brain enforcement); corrigível sem nova autoridade
Does it preserve stale mechanism as current? NO
Does it create duplicate semantic authority? NO
Does it overstate qualification? NO
Does it overbuild Future? NO
Does it erase justified Future seams? NO
Is Package B safely rederivable from it after ratification? CONDITIONAL — YES após FBL-02 (+FBL-07)
```

## D. Strongest counterargument

O tree declara-se projeção, com as homes detalhadas controlando e "absence is never permission to contradict" — logo todo finding acima seria editorial e "CONFIRMED WITH NON-MATERIAL CORRECTIONS" bastaria, pelo mesmo padrão que a Round 1 aplicou aos seus 14 findings. Rejeito por três razões: (1) FBL-01 não é omissão — afirma o predicado que a autoridade declarou insuficiente, e nada no texto sinaliza necessidade de consultar a home; (2) o bar de sucesso do R11 é descoberta **sem** arqueologia, e as leis ausentes são unknown-unknowns — não se roteia para uma lei cuja existência se ignora; (3) FBL-02 toca diretamente a razão declarada da pausa de Package B. Ratificar sem correção reintroduziria, dentro da própria camada current, a failure class que ela existe para eliminar.

## E. Exact next action

R11 **pode prosseguir para finding adjudication** — nenhum Decision Loop precisa reabrir. Sequência recomendada:

```text
1. adjudicar FBL-01..17 como correções de projeção (Round 3), prioridade FBL-01..07
2. flip mecânico mínimo do LEDGER (FBL-14) imediatamente, por exigência do próprio activation record
3. re-rodar coherence fria keyed off as listas de leis preservadas de cada closure de fase
4. atualizar status/next-action internos (FBL-15) no flip de ratificação
5. só então R11-H — operator ratification
```

Package B permanece PAUSED até lá.
