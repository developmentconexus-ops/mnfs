# Prompt de pesquisa externa — Tópico 10: Estratégia de LLM

> Colar este prompt inteiro numa ferramenta de deep research com acesso à web. Corte de conhecimento desejado: o mais recente possível (estamos em agosto/2026). Responder em PT-BR. Tópico de profundidade RASA — a decisão fixa postura e gatilhos, não contratos detalhados; profundidade real vem no build.

---

Sou o único operador de uma plataforma AI-first ("Conexus") que gera e opera aplicativos de negócio internos sobre o ERP Sankhya. Dois papéis de LLM bem distintos: (a) **builder** — agente de codificação que constrói/mantém os apps em sessões longas dentro de sandbox (tarefas de horas, muito contexto, qualidade manda); (b) **agente de app** — runtime respondendo usuários de negócio em interações curtas (chat, consultas, pequenas ações aprovadas), latência e custo mandam; (c) secundário: **discovery/classificação** — varrer schema/semântica do ERP, tarefas baratas em lote. Fase F1: pouquíssimos apps, um operador, custo de infra ~US$0 — tokens são o único custo variável relevante.

**Já decidido (premissas, não re-decidir):**
- O loop de agente roda no hub (server-side); o modelo é chamado via camada de abstração (AI SDK) — trocar provider é mudança de config, não de arquitetura.
- Sandbox de build recebe só chave LLM efêmera por run (TTL + spend cap + revogação); nenhuma credencial durável no guest.
- Budgets por unidade de trabalho fail-closed já existem (por run/efeito); custo é rastreado multi-estado na observabilidade (estimado → medido → reconciliado).
- Auth de modelo: API key da plataforma ou BYOK; nunca credencial de modelo no cliente/browser.
- Segurança de supply chain, prompt injection e egresso já decididos em outras decisões.

**O que o T10 decide (postura + gatilhos):** modelo por papel, postura de custo mensal, quando revisitar. Minhas posições preliminares:

- **P1 — Modelo por papel**: builder = modelo de topo de linha para código (qualidade paga o próprio custo em retrabalho evitado); agente de app = tier médio/rápido; discovery/classificação em lote = tier barato + batch API. Nada de fine-tuning nem open-weights self-hosted em F1.
- **P2 — Alavancas de custo**: prompt caching agressivo (system prompt + schema do app são estáveis) e batch API para discovery; sem otimização prematura de roteamento dinâmico por request.
- **P3 — Provider**: começar single-provider (Anthropic) pela camada AI SDK; multi-provider real só por gatilho (indisponibilidade recorrente, mudança de preço material, capability que o provider não tem). BYOK do cliente = não em F1 (um operador, contas da plataforma).
- **P4 — Postura de custo**: teto mensal simples definido pelo operador + budgets por run já decididos; sem chargeback por app em F1 (gatilho: segundo pagante/cliente externo).
- **P5 — Não decidir agora**: escolha fina de modelo por tarefa dentro do builder (planner vs executor), embeddings/reranking do Brain, avaliação automatizada de qualidade de output — tudo "aprofunda no build" com evidência real de custo.

**Perguntas (responder com fontes primárias e datas; preços atuais):**

1. **Preços e tiers ago/2026**: tabela atual de preço por Mtok (input/output/cached/batch) dos modelos relevantes de Anthropic (família Claude 5: Fable/Opus/Sonnet; Haiku 4.5), OpenAI (GPT-5.x) e Google (Gemini atual) nos tiers topo/médio/barato. Qual mapeamento tier→papel (builder/app/discovery) os preços atuais sugerem?
2. **Custo realista por unidade**: números documentados (2025–2026) de custo de agente de codificação por feature/app pequeno gerado (sessões longas com ferramenta tipo Claude Code/Codex/Devin) e de custo por interação de chat de agente de app com contexto de negócio. Ordem de grandeza mensal esperada para: 1 operador construindo ~2–4 apps/mês + ~20 usuários internos usando apps com chat.
3. **Prompt caching e batch na prática**: números atuais de desconto (Anthropic/OpenAI), TTLs, e pegadinhas documentadas (invalidação de cache, mínimos) que mudem a economia de um hub single-instance com system prompts estáveis.
4. **Mix de modelos das plataformas**: o que Lovable/Replit/v0/Cursor/Bolt documentam (2025–2026) sobre usar modelo forte para geração e barato para tarefas auxiliares; algum caso público de plataforma que se arrependeu de single-provider?
5. **Risco de concentração**: histórico 2025–2026 de outages/deprecações/mudanças de preço abruptas dos providers principais; o SLA/depreciação policy atual da Anthropic justifica gatilho de multi-provider mais agressivo?
6. **BYOK**: para B2B interno pequeno, há evidência de que BYOK do cliente final compense a complexidade operacional (billing, suporte, rate limits por conta) — ou consenso de que conta da plataforma é o padrão até escala?

**Formato:** 1) conclusão executiva ≤8 linhas; 2) vereditos P1–P5 (CONFIRMA/REFINA/REFUTA + evidência); 3) respostas 1–6 com fontes datadas; 4) tabela final "papel → modelo recomendado → preço → alavanca de custo"; 5) "não decida ainda": o que deixar para o build com qual gatilho.
