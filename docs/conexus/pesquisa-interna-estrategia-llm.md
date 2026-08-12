# Pesquisa interna — Tópico 10: Estratégia de LLM

**Data:** 2026-08-12 · **Método:** 2 varreduras paralelas (A = acervo C-000..C-016 + Mitra; B = mercado ago/2026), proporcional à profundidade RASA do tópico ("rasa → aprofunda no build").

## Q0 — O que já está congelado (não redecidir)

| Tema | Decisão | Fonte |
| --- | --- | --- |
| Auth de modelo | Assinatura do operador OU API key; nunca assinatura do cliente sem autorização Anthropic; semântica de missão nunca depende de token de assinatura | C-002 comp.10 (04-runtime-agente §4) |
| Multi-modelo por papel | HAR-11: escopo barato / builder forte / validador de outro provedor; identidade runtime≠modelo por ActorRun | 03-requisitos HAR-11 |
| Chave efêmera por run | `guestReadableRunCapabilityIsEphemeralAndBounded`: TTL ≤ sandbox, spend cap por ActorRun fail-closed, revogação; probe CX-SBX-E2B-01 item 5 valida provider-side | C-008 (05-sandbox comps 3–4, 11) |
| Budgets | Budget no manifesto do agente; budgets por unidade pré-efeito (8 campos, forma sem valores) | C-010 (09 comps 1, 12) |
| Contabilidade de custo | Multi-estado (usage × calculation × reconciliation), preço pinado por versão git, cache r/w separado, usage ausente ≠ custo zero, 2 custos monetários (LLM + sandbox) | C-013 (11-observabilidade §9) |
| Onde roda / SDK | Agente de produção = loop leve no hub com Vercel AI SDK dentro de ModelProviderAdapter próprio (7 condições); builder = worker Pi no E2B | C-010 adendo r3 |
| Seleção de modelo | "Mais barato que passa golden eval com margem", pinado por deployment, drift de alias invalida; router dinâmico = NÃO construir (gatilho: prova de eval) | C-010 |

Evidência de custo do acervo (tudo em tokens de assinatura): turno M1 da sonda = 43,3M in / 195K out com **99,8% cache**; 173,5K in para descobrir schema de 7 endpoints — contexto injetado é o custo dominante; discovery deve virar artefato cacheado, não custo por turno (OBS marcada para T10/T13). Limite medido da assinatura: 3 paradas/dia, janela 5h, turno consumido com `out: 0` (C-009 p.13).

## Q1 — Mercado ago/2026 (varredura B, fontes datadas no histórico)

Preços $/Mtok (in/out): Fable 5 10/50 · Opus 5 5/25 · Sonnet 5 3/15 (intro 2/10 até 31/08/2026; tokenizer novo ~+30% tokens vs 4.6) · Haiku 4.5 1/5 · GPT-5.2 0,88/7 · GPT-5.2 Codex 1,75/14 · Gemini 3 Pro 2/12 · Gemini 3 Flash 0,25/1,50 · DeepSeek V4 Pro 0,435/0,87 (80,6% SWE-bench V). Alavancas: cache read ~0,1× (write 1,25×/2×), Batch −50%; em loop agêntico típico >90% do input vira cache read. Plataformas builder não publicam mix de modelos (detalhe interno volátil); padrão observável = forte no build, barato no auxiliar. BYOK: para operador solo a distinção colapsa — "key da plataforma" É a key do operador. Ordem de grandeza F1: builder US$30–150/mês + runtime US$5–50/mês ≈ **US$50–200/mês total**.

## Q2 — O que o T10 decide (4 itens, nada mais)

1. **Credencial por papel em F1**: worker E2B = API key efêmera (obrigatório por C-008; assinatura não entra no guest). Lead/agentes no hub = key da plataforma (a do operador). Assinatura do operador pode alimentar sessões interativas de planejamento fora do pipeline, nunca semântica de missão (C-002 já proíbe).
2. **Defaults de modelo por papel até o golden eval existir** (o eval é o mecanismo de seleção; isto é só o ponto de partida): builder = Sonnet 5 com escalonamento manual a Opus 5 quando travar; agente de app runtime = Haiku 4.5 com upgrade por app a Sonnet 5 se qualidade exigir; discovery/classificação = Haiku 4.5 + Batch quando assíncrono; validador de outro provedor (HAR-11) = tier barato não-Anthropic. Fable 5 fora de F1 (preço sem caso de uso).
3. **Postura de custo**: prompt caching no loop do builder desde o dia 1 (prefixo estável; alavanca dominante) + teto mensal de sanidade como ALERTA via C-013 (referência: US$200/mês; valor não ratificado — mesmo padrão dos rate limits C-016); budgets por run seguem a única trava dura.
4. **Provider da chave efêmera**: o que provar `expires_at`+cap no probe CX-SBX-E2B-01 item 5 (bloqueante); preferência pelo caminho com menos intermediários (Anthropic direto), OpenRouter como alternativa qualificada se o cap não for confirmável.

## Q3 — Fica para o build (com gatilho)

Qual modelo passa o golden eval mais barato (QUA-4); consumo real por build do Golden Path; confirmação provider-side do cap (probe); custo do discovery do Brain; valores dos 8 campos de budget; roteamento multi-provider (gatilho C-010: prova de eval; + varredura B: >1 operador ou custo >US$500/mês); open-weights self-hosted (economia não paga troca de ecossistema em F1); billing por cliente/BYOK de terceiros (gatilho: segundo pagante).

## Tensões abertas (para a externa)

- T-1: tokenizer do Sonnet 5 (+30%) pós-intro pode aproximar custo efetivo de Opus 5 em código — medir com payload real.
- T-2: fronteira Haiku 4.5 × Sonnet 5 em tool use de runtime (SQL/ERP com schema em contexto) — hoje adivinhação.
- T-3: custo real por app gerado em plataformas comparáveis para calibrar budget por run.

## Posições preliminares (espelham o prompt externo já publicado)

P1 modelo por papel (com defaults do Q2.2) · P2 caching+batch, sem router · P3 single-provider Anthropic via AI SDK, BYOK não · P4 teto mensal simples + budgets por run, sem chargeback · P5 não decidir agora (lista Q3). Veredito da varredura A: **C-017 fina — 1 página de postura + gatilhos**, grosso do doc = ponteiros ao já-congelado.

## Fechamento (2026-08-12) — T10 FECHADO SEM DECISÃO NOVA

Pesquisa externa cruzada em sessão (corte 12/08/2026). Achados materiais preservados:

1. **Haiku 4.5 com aposentadoria anunciada para 15/10/2026** — antes de a plataforma operar. Não desenhar componente em torno de modelo concreto; contrato diz "tier aprovado", modelo é escolhido no build.
2. **Preços/famílias mudam mais rápido que o programa** — varredura B e externa divergiram na mesma semana (Sonnet 5 3/15 vs 2/10; famílias GPT-5.2 vs GPT-5.6). Mais uma razão para nunca ratificar número.
3. **"Validador de outro provedor" (HAR-11) refutado como invariante F1** — fresh Actor + fresh context + contrato de validação próprio entregam o grosso da independência; provider diferente vira gatilho (erro correlacionado do mesmo provider demonstrado, OU 2º provider já operacional por outro motivo, OU ganho material medido em eval).
4. Nenhum post-mortem público de "arrependimento de single-provider"; padrão de mercado = poucos tiers claros, não roteador por request.

**Razão do fechamento sem C-017** (ratificado pelo operador em 2026-08-12): os 4 itens do Q2 já estão decididos ou pertencem ao build — seleção de modelo tem mecanismo ratificado (golden eval C-010: "mais barato que passa com margem", ID pinado por deployment); credencial por papel é composição C-002+C-008; custo/teto é C-010 (budgets) + C-013 (eventos); provider da chave efêmera é decidido pelo probe CX-SBX-E2B-01 item 5. Ratificar defaults de modelo hoje usurparia o mecanismo do eval e fixaria nomes com validade de meses. Defaults, preços e envelopes deste doc = **referência de build, sem autoridade**.

**Resíduo único**: reconciliar o texto do HAR-11 no T17.
