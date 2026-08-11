# Prompt de pesquisa externa — integração externa (tópico 7)

> Copie tudo abaixo da linha e cole no ChatGPT (modo deep research), em chat novo.

---

Estamos projetando a camada de integração externa de uma plataforma que constrói e opera
aplicativos de negócio sobre ERPs usando agentes de IA. Pesquise com fontes primárias (docs
oficiais, specs, repos, pricing pages), cite URL + data de acesso em cada resposta, marque
claramente fato verificado vs inferência sua, e diga "não documentado publicamente" quando for o
caso. Se alguma direção nossa parecer errada, critique com evidência — preferimos correção a
confirmação.

## Contexto (decisões já tomadas — são premissas, não estão em debate)

- Hub orquestrador Node/TS + Postgres rodando no PC do operador (WSL2) na fase 1; nuvem
  (Fly.io GRU) por gatilho. Operador solo, custo ~US$0 fase 1, anti-overengineering como valor:
  cada peça só entra com gatilho real.
- Agentes de IA constroem os apps em sandbox. TODO acesso a credencial passa por um "Capability
  Gateway" no hub — credencial NUNCA entra no sandbox nem no browser.
- Registro de artefatos: artefato executável = arquivo no repo git; kind `integration` já
  existe com allow-list de host por conector; inputSchema obrigatório; deployment com gate.
- Camada de dados: Postgres, 1 database por projeto; ETL do ERP via REST com cursor + staging +
  upsert; blueprint de conector DEVE declarar política de deletes por entidade e contrato de
  cursor (decidido).
- Caso 1 = ERP Sankhya (REST). Fase 1 precisa de: conector Sankhya + possivelmente 1 canal de
  dispatch (e-mail/WhatsApp).
- Plataforma de referência dissecada ("Mitra") faz: integração declarativa (JSON
  `{connection: 'sankhya', method, endpoint, body}` com credencial por nome simbólico,
  server-side — repo público-safe), blueprint com `fieldsSchema` que gera formulário de
  credencial, union fechada de auth (`header|basic|cookie|query` + token-refresh server-side),
  túnel Cloudflare para on-prem. Defeitos já rejeitados: catálogo de conectores hardcoded no
  bundle do frontend (conector tem que ser DADO, não código embarcado), teste de conexão
  opcional/allowlistado (vai virar obrigatório), credencial de produção colada em chat.

## A visão (importa para o desenho, não para o escopo da fase 1)

Integração é aposta estratégica do produto: no futuro, um TIME DE AGENTES DE IA construirá
conectores continuamente — a plataforma deve integrar com "tudo" (marketplaces como Mercado
Livre/Shopee/Amazon, ERPs, SaaS, Google, Meta/WhatsApp e mais). Além de apps, teremos um
CONSTRUTOR DE AGENTES: usuário cria agente que fala com o app dele E com third parties, de forma
fácil. Portanto a pergunta central do tópico é: **qual abstração de conector decidimos AGORA
(construindo só Sankhya) que aguenta esse futuro sem reescrita — e que seja otimizada para IA
escrever conectores?**

## As 8 perguntas

1. **Formato de conector**: declarativo puro (manifest YAML/JSON) × código (SDK/CDK) × híbrido
   (manifest + hooks de código). Como definem conector: Airbyte (low-code CDK manifest × Python
   CDK), n8n (declarative × programmatic nodes), Nango, Zapier Platform, Windmill, Prismatic,
   Paragon, Merge.dev, Composio. O que o formato cobre (auth, endpoints, paginação, rate limit,
   retries, schema, teste de conexão, webhooks)? Qual formato tem evidência de ser mais
   amigável para GERAÇÃO POR IA (algum vendor já gera conector por IA? qual taxa de
   sucesso/limitações)? Recomende um desenho.
2. **Unified API × passthrough**: Merge/Apideck/Nango vendem modelo comum por categoria (CRM,
   accounting, e-commerce). Para nós: começar passthrough puro (endpoint+body livres dentro do
   allow-list) e extrair modelo comum por categoria DEPOIS é caminho seguro, ou o modelo comum
   é decisão fundacional que não dá pra adiar? Como eles tratam campos fora do modelo (remote
   fields, passthrough requests)?
3. **Auth e vault**: arquitetura de OAuth broker (authorize → callback → refresh automático →
   vault) das plataformas (Nango self-host? licença 2026?, Composio, Arcade.dev). Para operador
   solo fase 1: vault próprio no Postgres do hub (envelope encryption, escopo por
   conexão+ambiente, rotação) × Nango self-hosted × outro. A Mitra guarda credencial de
   integração cifrada DENTRO do banco do projeto (inconsistência que rejeitamos — queremos
   vault único no hub). Valide ou corrija.
4. **Agentes × third parties (dual-face)**: estado do MCP 2026 (authorization spec, registry,
   remote servers, adoção OpenAI/Google/Anthropic). Plataformas de auth-para-agentes
   (Composio, Arcade, Zapier MCP, Pipedream Connect) — fluxo de OAuth em nome do usuário final
   + human-in-the-loop para ações sensíveis. Pergunta de desenho: nosso conector deve nascer
   "dual-face" (mesma definição serve execução no app E tool de agente — operação → tool com
   naming/descrição/schema pra LLM), ou app-first com face de agente depois? Alguém já unifica
   isso (Pipedream? n8n node→AI tool? Composio)?
5. **Google e Meta na prática**: o que custa de verdade — Google OAuth verification (scopes
   sensíveis/restritos, CASA security assessment: custo, prazo, renovação), Meta app review +
   Business verification, WhatsApp Business (Cloud API direto × BSP tipo Twilio/360dialog —
   pricing 2026). Para plataforma pequena BR: barreiras, prazos, e o que adiar.
6. **Marketplaces**: Mercado Livre API (OAuth, notificações, requisitos de app), Shopee Open
   Platform, Amazon SP-API — exigências de registro/review e padrão de integração. Esforço
   realista por conector de marketplace.
7. **Webhooks e eventos**: recepção robusta (verificação de assinatura HMAC, replay protection,
   retries do emissor, fila interna) — como Nango/Paragon/Prismatic modelam webhook no
   conector. Fase 1 local sem IP público: Cloudflare Tunnel resolve recepção de webhook? O que
   é proporcional agora vs gatilho.
8. **Robustez contra mudança de terceiro**: detecção de breaking change (contract tests,
   monitoramento de schema), versionamento de conector, seleção explícita sandbox × produção
   do fornecedor, teste de conexão obrigatório. O que plataformas maduras automatizam e o que
   fica manual.

## Formato de saída

Respostas numeradas 1–8, cada uma com fonte primária + URL + data de acesso. No fim, síntese:
(a) recomendação única por pergunta com ranking onde houver alternativas; (b) o desenho de
abstração de conector que você recomendaria (esqueleto concreto: o que é declarativo, o que é
código, o que é dado no banco); (c) lista "onde a direção de vocês parece errada" (vazia só se
nada parecer errado).
