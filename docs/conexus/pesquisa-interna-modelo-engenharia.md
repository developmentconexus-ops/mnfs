# Pesquisa interna — Tópico 17: Modelo de engenharia + execução agentic

**Data:** 2026-08-12 · **Método:** 5 varreduras paralelas — A (MNFS: repo + harness 0.4.0 fora do repo), B (Mitra medida: sonda C-009 + referência), C/C2 (Factory AI: acervo RMUX `references/factory-ai*`, corte 2026-05-23), D (Conexus C-000..C-016 + evidência MetalDocs/Marketplace). Profundidade FUNDA — T17 é a reconciliação transversal antes do Implementation Plan. **Adendo 2026-08-12:** incorporado o [mapa público da harness Factory](../research/FACTORY-AI-HARNESS-REFERENCE-MAP.md) (snapshot do GitHub público em 2026-07-24) — supersede o acervo RMUX como fonte Factory mais atual; ver bloco "Factory AI — atualização" abaixo.

## Q0 — O que o pipeline JÁ tem decidido (não redecidir)

A **metade direita** está praticamente congelada: worker Pi fresco por Work Unit em E2B (C-002/C-008) → SYNC→WORK→SHARE com bundle sem credencial + quarentena (C-008/C-005) → RUN/OBSERVE/ASSERT no runtime real (C-013 §16) → validação no hub, nunca auto-declaração (C-007/C-013 `producer_trust`) → ReleaseManifest imutável + EnvironmentConformance + gate humano + CAS (C-014) → SERVED_VERIFIED fechada pelo hub (C-013 §13). Contexto: Actor Pack compilado pelo hub (C-002 comp.5); standards mecanizados no scaffold + gates (C-012); budgets/HITL/ToolProjection fail-closed (C-010); 1 commit canônico por Work Unit, branch por Change (C-014 §4). Hierarquia parcial existente: **Grupo → Project → Change → Work Unit → ActorRun → agent_event**.

A **ponta esquerda** tem peças (HAR-2 escopo separado, HAR-7 plano aprovável, HAR-3 gate mecânico, discovery do Brain C-011 §8) mas: **"correctness antes de decomposição" não tem decisão nenhuma**; a passagem plano→decomposição→unidades não tem objeto nem gate; não existe objeto `Finding` genérico nem critério de Replan.

## Q1 — O que cada fonte entrega

### MNFS (varredura A)

Achado estrutural: existe geração posterior materializada fora do repo — plugin `mnfs-harness 0.4.0` (`HARNESS-CORE.md` + hooks executáveis `merge-gate.sh`/`dispatch-lint.sh`/`stop-gate.sh`) — a única fonte com pós-morte quantitativo: doutrina advisory racionalizada 13× numa missão (o próprio hub racionalizou um gate falso); crew frio de 5 revisores = **0 defeitos** enquanto o live drive achou todos os reais; contexto monolítico ~130k tokens/chamada; write-set verificado por byte = 10 dispatches com zero scope slip.

**8 ideias fortes** (cada uma com falha real medida): (1) correctness antes de decomposição + verification map por critério (critério sem mapa = defeito de planejamento); (2) Finding Admission + Complexity Burden of Proof (matou PKI inteira; único mecanismo que provadamente REMOVEU maquinaria); (3) pirâmide de enforcement — deny > hook > agente com tools restritas > lane executável > doutrina; (4) evidence types `ran/assumed/could-not-run` + catálogo False Completion FC-01..12; (5) pack compilado por script com SHA (o prompt salvo É o registro de auditoria); (6) write-set declarado + reconciliação `git diff` vs write-set; (7) terminação explícita (`SUCCESS/BLOCKED/ESCALATE/HANDOFF/REPLAN_REQUIRED`; exaustão nunca vira sucesso) + sessão fresca por fase; (8) máquina primeiro/julgamento depois + teto honesto do lane ("veredito máximo de script = FORM-COMPLETE").

**Não carregar** (evidência de morte): R0–R8/ARR (12 decisões, 0 substrato, programa encerrado — já REJECT em C-000), acceptance por task, coverage graph 10 nós, checklist de 27 concerns nunca compilada, crews frios empilhados, hierarquia de standards em 4 níveis nunca implementada (1652 linhas, zero arquivo real).

**Lacunas que o MNFS nunca respondeu**: quando validação independente é desperdício (a evidência contradiz o desenho); como medir se regra ainda vale (métricas listadas, zero coletadas); custo de si mesmo (nunca medido); se a forma aguenta volume (1 missão, 621 commits); critério de parada de Replan de oportunidade; lista curta do que SÓ o humano decide.

### Mitra medida (varredura B)

Pipeline real: 2 estágios (escopo Gemini → build Claude; **o estágio 2 audita o estágio 1** contra o dado real), 8 fases, planning docs relidos. A divisão que importa: quase tudo de qualidade (as 8 fases, validação, cobertura declarada, aposentadoria de artefato) é **escolha livre do modelo** — as únicas 3 invariantes que reprovaram algo em 9h de sonda vieram do ecossistema (`tsc`, `noUnusedLocals`, FK), não da Mitra. Síntese C-009: *"o Conexus não precisa de modelo melhor; precisa tornar obrigatório o que o bom modelo fez espontaneamente"*.

Top classes de falha de pipeline (das 76 OBS): verificar o canal em vez do conteúdo (8–10 camadas independentes numa noite; nenhuma passa por build/teste/diff); "concluído" colapsando feito/persistido/servido (OBS-52); teto silencioso com relatório verde (OBS-69.1 — invariante que vê parte do universo é falsa garantia); correção fora da fonte não sobrevive ao turno seguinte (OBS-44); proibição atravessa corte de contexto, propósito não (OBS-77.1); varredura com prova de exclusão sem prova de completude; verde por vacuidade; mudança transversal por regex; deriva de escopo por ajustes locais nunca somados; escopo que inventa valor e vira fato silencioso (perde fato/regra/hipótese).

### Factory AI (varreduras C/C2 — acervo RMUX, corte 2026-05-23)

Hierarquia de evidência: schema verbatim do SDK > artigo da Factory > docs de produto > hipóteses RMUX (rotuladas n/10). Onde narrativa diverge do schema, o schema vence.

Modelo Missions: orchestrator persistente + **workers efêmeros** + **validators independentes**, para dois modos de falha nomeados — acúmulo de contexto irrelevante e **contexto adversarial** (quem escreveu julga o que escreveu). **`validation-contract.md` escrito ANTES de qualquer feature** — *"features-first would let implementation thinking corrupt the contract"*; asserções com ID (`VAL-AUTH-001`) + `fulfills[]` ligando feature↔asserção; `expectedBehavior`/`verificationSteps` escritos antes da implementação. Workers frescos sem transcript; canal durável = `HandoffSchema` tipado (`whatWasImplemented/whatWasLeftUndone/verification/tests/discoveredIssues/skillFeedback`) — **se o campo não existe no schema, a informação morre com o worker**. Validator (scrutiny + user-testing caixa-preta com acesso ao sistema SERVIDO via `services.yaml`) **não conserta — reporta issues tipadas**; orchestrator cria fix features; sem max-retry (julgamento do orchestrator); bloqueio → halt + humano. Validator NÃO é cidadão de 1ª classe no wire (`DecompSessionType` só `orchestrator|worker`) — independência por prompt/config, não por tipo.

Números publicados: Slack clone 16h autônomo — **34,4% fix ratio**, 81 issues (65 blocking), validação ≈60% do custo da implementação. *"Confiável não porque os workers são espertos, mas porque validators frescos injetam julgamento independente."* Code review benchmark: **melhor F1 = 60,5%** por revisor único; custo explica só 21% da variância → camadas compostas, não um revisor caro. `legacy-bench`: **97% das falhas = o agente acredita que resolveu** (self-assessment quebrado em código legado — o dado mais transferível para Sankhya/ERP). Contexto: Deferred Context Engine (Discover→Promote→Reuse; índice compacto, schema completo sob demanda; −15% médio/−50% com 100+ tools); AutoWiki 4 passadas, não é RAG.

**Factory AI — atualização (mapa público, snapshot 2026-07-24).** O [FACTORY-AI-HARNESS-REFERENCE-MAP](../research/FACTORY-AI-HARNESS-REFERENCE-MAP.md) cobre a org GitHub inteira + docs e atualiza/estende o acervo RMUX:

- **Missions AINDA research preview em 2026-07-24**, com as mesmas 3 open questions — responde parte do que este doc mandava reverificar; a defasagem restante é só pós-julho.
- **`droid-control` (ARCHITECTURE.md): "waterfall by handoff, not framework"** — sem engine central impondo transição; o handoff carrega o suficiente para o próximo passo ser óbvio; parent mantém julgamento, worker recebe comando mecânico resolvido; artifacts/paths escopados por run; Evidence final comparada aos commitments originais; heurística "se uma mudança faz todo agente ler mais instrução global, a arquitetura está errada". Suporta diretamente P4/P5/P6.
- **Trust boundaries do `droid-action` (CI)**: política lida da default branch, nunca da PR julgada; editing tools concedidas só quando fix habilitado; escopo de fix por RETENÇÃO de tools, não por prompt; protected paths re-enforced pós-execução; budgets distinguem retry/fix/total por PR → precedente externo de **"política não pode ser alterada pelo próprio change que ela julga"** (mesma classe do merge-gate MNFS).
- **Agent Readiness** (5 níveis, 9 pilares, `/readiness-report`): repo operável como pré-requisito de autonomia — princípio PRESERVE, score/framework REFERENCE (risco de checklist theater; preferir prerequisites/probes por Work Unit).
- **QA gerado por app** (`/install-qa`/`/qa`): infere stack/auth/ambientes, gera config + sub-skills, seleciona só fluxos afetados pelo diff, dirige o sistema real (web/CLI/API), relatório PASS/FAIL/BLOCKED; Missions exige forma scriptável de subir o app — reforça convergência 4 (julgar o SERVIDO).
- **Autonomia em camadas** (Off/Low/Medium/High × allowlist/denylist/blocklist × org settings) + **permission handler ausente = cancelamento** (fail-closed em execução não interativa).
- **Anti-padrão documentado**: troubleshooting oficial sugere marcar worker travado como complete → **stuck ≠ complete**; estados honestos `BLOCKED/FAILED/DEFERRED/SKIPPED_BY_AUTHORITY` (REJECT explícito no mapa).
- Sandbox local Beta (Seatbelt/bubblewrap; a própria Factory manda usar VM para código não confiável — E2B/C-008 permanece), Droid Computers persistentes (DEFER/REJECT F1) e VFS público CoW (DEFER; bundle já cobre) — referências, não candidatos.
- Legacy-bench detalhado: pass 16,9–42,5%; bug fix > implementação > migração; nenhum modelo vence todas as categorias.
- §31 do mapa traz tabela de disposição PRESERVE/ADAPT/REFERENCE/DEFER/REJECT por padrão, §32 uma forma mínima F1 sugerida e §33 quinze perguntas prontas — insumo direto do cruzamento, não decisão.

Pesquisa externa reverifica apenas o pós-2026-07-24 (Missions GA?, schema do validator, Agent Teams, governança de plugin, benchmarks novos).

### Conexus + nossos produtos (varredura D)

Das 8 classes de falha medidas (MetalDocs/Marketplace), **7 já têm mecanismo total/parcial** ratificado; faltam: **#118** (nenhum gate prova que conhecimento consultável ainda existe — Engineering Standards fora do mecanismo de health/drift que o Brain tem) e a metade server-side da **#93** (ownership/imports só mecanizados no frontend).

**14 contradições/sobreposições catalogadas para a Fase 3** — as que o T17 resolve: `Mission` existe em diagrama (C-002 §4) e em nenhuma decisão (3 vocabulários coexistem); "validador independente" com 2 realizações incompatíveis em custo (agente HAR-11 × gates mecânicos + verifier do hub) — resíduo do T10; Actor Pack do builder sem budget/digest/falha-de-compilação/health que o ContextPack tem (assimetria C-002 × C-010/C-011); `Evidence` sem forma (manifesto exige `verificationDigest`/`validationDigest` sem derivação normatizada); 5 máquinas de aprovação humana sem decisão de unificação/não-unificação; `tasks.md` fechado e os outros 3 planning docs sem autoridade/ownership/gate; duas cadências de promoção de padrão (rule-of-three C-012 §18 × por-classe C-009); colisão de vocabulário "golden" (7 usos); assimetria gatilho de entrada × nenhum gatilho de remoção de regra (a própria Q10).

## Q2 — Convergência trans-fonte (o que as 4 fontes concordam)

1. **Fresh worker + estado externalizado tipado** — Factory (provado por schema), MNFS (medido: 130k tokens/chamada monolítica; regra de correção = regra de custo), Mitra (OBS-77.1: propósito perdido no corte), Conexus (já ratificado C-002). O que falta: o **contrato de compressão** do handoff (campos tipados; o que não está no schema morre).
2. **Auto-avaliação está quebrada; independência = contexto fresco + sem permissão de consertar** — Factory (97% legacy-bench; validator não conserta), MNFS (hub racionalizou P7 falso; advisory 13×; reviewer fisicamente read-only resolve por fronteira), Mitra (auto-validação única; smoke que só prova que "responde"), nossos #2/#87 (check fora do entrypoint = check inexistente).
3. **Correctness fixada ANTES de decompor** — Factory ("features-first corrompe o contrato"), MNFS (R4A gate + verification map por critério; write-set sem arquivo de teste = feature sem testes), Mitra (contraexemplo: escopo inventa valor → fato silencioso). É a maior lacuna decisória do Conexus (nenhuma decisão cobre).
4. **Julgamento sobre o sistema SERVIDO, não sobre a árvore** — Factory (user-testing + `services.yaml`; QA dirige o app), Mitra (OBS-52/57), nosso #35, Conexus (SERVED_VERIFIED já ratificado — falta estender ao validador de unidade).
5. **Máquina primeiro; doutrina só quando não dá para mecanizar** — MNFS (pirâmide de enforcement; "regra mecânica não permanece só em prompt"), Mitra (só invariantes mecânicas reprovaram), C-012 (gates decididos pelo hub, "builder não declara 'não precisa'"), Factory (escopo de fix por retenção de tools, não por prompt; hooks "tornam ações obrigatórias"; política lida da default branch, nunca do change julgado).
6. **Evidência tipada, nunca alegação** — MNFS (`ran/assumed/could-not-run`; Pass só sobre `ran`), Factory (`verification`/`tests` no handoff), Conexus (`producer_trust`, acceptance só HUB/GATEWAY_AUTHORITY).
7. **Cerimônia sem consumidor mecânico morre** — MNFS (ARR: 12 decisões/0 substrato; 27 concerns nunca compiladas; crews frios 0 defeitos). Aplicação direta da diretriz de proporcionalidade.

## Q3 — O que o T17 genuinamente decide (7 itens)

1. **Vocabulário e hierarquia** (Q1/Q2): fixar `Grupo → Project → Change → Work Unit → ActorRun` como espinha; decidir se existe agregado de outcome acima de Change (a "Mission") e a semântica de `Evidence` (objeto ou projeção com digests normatizados).
2. **Ponta esquerda do pipeline** (Q6): contrato de correção ANTES da decomposição — artefato (asserções verificáveis com ID + answerability), quem escreve, gate humano, ligação feature↔asserção; e a passagem plano→Work Units com objeto/gate.
3. **Finding e Replan** (Q7 — maior lacuna): objeto `Finding` único tipado com admissão (severity ≠ requirement authority) e roteamento correção-local × fix-unit × replan; cap de loop corretivo com escalada humana.
4. **Realização do validador** (Q4 + resíduo HAR-11): quando agente fresco read-only, quando só gates mecânicos, quando user-testing com acesso ao servido; "outro provedor" como gatilho, não invariante.
5. **Proporcionalidade** (Q5): classe da Work Unit derivada mecanicamente do contrato (`effects`/`approvalFloor`/permission+dependency diff) vs julgamento declarado (FAST/BOUNDED/CONTROLLED nunca testado em volume).
6. **Contexto do builder e standards** (Q3/Q8): simetria Actor Pack ↔ ContextPack (budget duro, digest no manifesto, falha de compilação, health/frescor — fecha #118); progressive disclosure; camada papel/tarefa com schema.
7. **Vida das regras** (Q9/Q10): critério ex-ante do que vira gate/geração vs orientação; métricas de valor por regra desde o dia 1 e gatilho de REMOÇÃO (a assimetria que nenhuma fonte resolveu).

## Tensões abertas (para a externa)

- **T-1**: validação independente por agente (HAR-11, Factory) × evidência MNFS de que scrutiny frio de artefato acha 0 defeitos e o exercício real acha todos — a síntese provável é "independência de contexto + acesso ao sistema servido" valem mais que "outro modelo"; falta evidência externa.
- **T-2**: cap de retry — Factory sem política (julgamento do orchestrator) × RMUX recomenda cap 3 × Mitra 3-tentativas-e-escala × MNFS "2× reject = redesign".
- **T-3**: orçamento de turno ≤45min (C-008) × RUN/OBSERVE/ASSERT dentro do E2B (C-013) × 11 passos de verify (C-012) — pressão direta sobre o tamanho da Work Unit; nada medido.
- **T-4**: cadência de promoção de standard — rule-of-three × por-classe-na-primeira-reprovação.
- **T-5**: fix ratio 34,4% e validação a 60% do custo da implementação (Factory) — o que isso implica para budgets por unidade (C-010) num operador solo.

## Posições preliminares (espelham o prompt externo)

P1 contrato de correção antes da decomposição, com answerability e gate humano · P2 julgador independente = contexto fresco + read-only físico + acesso ao servido; reporta Finding, nunca conserta; mesmo provider ok · P3 Finding único tipado com admissão e roteamento local/fix-unit/replan; cap com escalada · P4 proporcionalidade derivada do contrato, não FSM declarada · P5 standards pela pirâmide de enforcement + pack compilado com digest/budget/frescor (fecha #118) · P6 hierarquia mínima sem entidade nova sem consumidor; Evidence normatizada · P7 métrica de valor por regra + gatilho de remoção desde o dia 1.
