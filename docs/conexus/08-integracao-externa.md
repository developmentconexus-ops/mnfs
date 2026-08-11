# Tópico 7 — Integração externa: abstração de conector (C-007)

> **Status:** DECIDIDO — C-007, ratificado 2026-08-11.
> **Fontes:** acervo Mitra ([04-integracao-externa](../reference/mitra/04-integracao-externa.md)) +
> 2 pesquisas internas (abstração de conector; agentes × third parties) + deep research externa
> ([prompt](pesquisa-externa-integracao-prompt.md)) + Codex gpt-5.6-sol xhigh, 2 rodadas
> adversariais (6/10 → 8,5/10, "convergido, não resta divergência arquitetural material").
> **Herda:** C-002 (validador independente), C-004 (Capability Gateway, credencial nunca em
> sandbox/browser), C-005 (kind `integration`, allow-list de host, revisão imutável SHA+digest,
> inputSchema obrigatório), C-006 (ETL cursor+staging+upsert; política de deletes por entidade e
> contrato de cursor obrigatórios no blueprint).

## Decisão em uma frase

Conector é artefato git versionado com **contrato declarativo de kernel estreito** (identidade,
auth shape, operações tipadas com metadata de efeito, extensões discriminadas só para o que o
caso real usa) — **sem runtime de hooks no dia 1** (seam reservado, gatilho registrado), operações
**native-first** que nascem **dual-face no modelo** (app e agente são projeções do mesmo registry),
**Connection por empresa/ambiente no hub** com custódia de credencial substituível
(`credential_backend`+`credential_ref`, vault mínimo próprio fase 1), e **nenhum resultado de
agente aceito por auto-declaração** — gates independentes decidem elegibilidade.

## Contexto

Visão estratégica declarada (molda o desenho, não o escopo): futuro com time de agentes
construindo conectores continuamente ("integrar com tudo" — marketplaces, ERPs, SaaS, Google,
Meta) + construtor de agentes onde usuário cria agente que fala com o app dele E com third
parties. Pergunta central do tópico: qual abstração decidida agora (construindo só Sankhya)
aguenta esse futuro **sem reescrever o core** — otimizada para IA escrever conectores. Resposta
das 3 fontes: congelar **seams** (Connector/Operation/Connection/CredentialRef/Hook/Webhook/
Sync/Deployment) e **semântica**, não formato de serialização nem DSL universal.

## Evidência

| Fonte | Achado decisivo |
|---|---|
| Pesquisa interna 1 (conectores) | Únicos 2 players apostando em "IA constrói conector" (Airbyte AI Assist, Nango) convergiram: núcleo declarativo com uniões fechadas + escape de código. Airbyte ~80% do catálogo declarativo. Embed juridicamente hostil (ELv2/SUL) → importar padrões, não software. |
| Pesquisa interna 2 (agentes) | MCP = padrão de-facto agente↔third-party (Linux Foundation/AAIF) mas spec instável (breaking 2026-07-28) → MCP como superfície gerada, registry interno proprietário. Dual-face é norma de mercado (Pipedream/Zapier/n8n/Nango servem app E agente do mesmo catálogo). Token cifrado no vault, execução server-side, LLM nunca vê credencial. |
| Deep research externa | "AI-friendly ≠ máximo YAML": experimento Nango (~200 integrações geradas em ~15min/<US$20) documenta agente falsificando fixture, fingindo reachability, alucinando CLI → verificação independente pós-conclusão é o que torna geração agêntica viável. Connection com custódia substituível. Conformance harness > DSL 100% declarativa. |
| Acervo Mitra | 4 acertos confirmados pelo mercado (chamada declarativa com credencial simbólica; blueprint fieldsSchema; união fechada de auth; túnel). 5 defeitos rejeitados (catálogo hardcoded no bundle; teste opcional; zero camada operacional; zero versionamento; zero webhook). Mitra renova token Sankhya por reautenticação — confirma modelo. |
| Codex rodada 1 (6/10) | Derrubou: DSL universal no 1º conector; confinamento fictício de hooks (`signRequest` recebe segredo no processo do Gateway); união exclusiva de efeitos errada (EXTERNAL_SEND também muta); canary sem população; duas listas de host; `granted_scopes`/`company` Sankhya-specific no núcleo genérico. Corrigiu factual: Sankhya = OAuth2 `client_credentials` + `X-Token` **sem refresh_token** (renovação = reautenticação via `/authenticate`); Sankhya **tem** ambientes sandbox/homolog × produção; autorização Sankhya = permissões de serviço/tela, não scopes. |
| Codex rodada 2 (8,5/10) | Convergido com 4 sínteses aceitas: sem runtime de hook dia 1 + invariantes; hosts autoridade única via projeção compilada; perfil Sankhya corrigido; campos dual-face no v1, projeção por gatilho. |

## Decisão — componentes

| # | Componente | Decisão |
|---|---|---|
| 1 | Formato | Connector = artefato git no kind `integration` (C-005). Contrato declarativo **kernel estreito** `connector/v1`: identidade+revisão; auth shape sem valores (gera formulário de credencial); operações nomeadas com `inputSchema`/`outputSchema`/`effects`/`idempotency`/`agentEligible`/`approvalFloor` + request mapping comum; extensões **opcionais discriminadas** só para o que o caso real usa (sync com cursor+delete policy por entidade [C-006], paginação). Ausência = capacidade não implementada, sem default imaginário. Schema versionável `connector/v1`→`v2`. Congela-se o modelo semântico, não YAML×JSON×TS. |
| 2 | Hooks | **Sem runtime de hook no dia 1.** Sankhya não precisa: auth = união fechada de estratégias implementadas pelo Gateway (código de plataforma revisado). Seam `hooks` reservado no modelo; **schema rejeita campo preenchido** enquanto runtime não existir (nunca ignora em silêncio). Gatilho = 1º provider fora da união fechada. Condições de admissão congeladas: hook computacional é **função pura** (sem rede/fs/env/segredo), saída = dado não confiável, Gateway reaplica host/scheme/port/IP/redirect policy antes de qualquer I/O; passo que toca segredo (signing/token exchange) **nunca vira hook livre** — vira nova estratégia da união fechada do Gateway; signing por-conector inevitável exigiria prova de confinamento (processo separado, secret handle, sem ambiente herdado) antes de existir. |
| 3 | Operações | **Native-first canônico** (`sankhya.orcamentos.list`). Unified/common models = projeção semântica futura, gatilho = 2º conector real da mesma categoria; nunca substituem as operações nativas. Passthrough cru (`method+endpoint+body` livre) = ferramenta dev/admin restrita, **nunca tool de agente de negócio**. |
| 4 | Taxonomia de operação | `effects`: lista acumulável (`REMOTE_MUTATION`, `EXTERNAL_SEND`; vazia = leitura — união exclusiva rejeitada: enviar WhatsApp também muta estado remoto). `idempotency: IDEMPOTENT\|NON_IDEMPOTENT\|UNKNOWN` — UNKNOWN fail-closed para retry automático; retry off por default e proibido para NON_IDEMPOTENT/UNKNOWN. `agentEligible` (limite do contrato, default **false**) ≠ `exposed` (decisão do projeto, fora da revisão do conector) ≠ `approvalFloor` (mínimo do contrato); aprovação efetiva = max(contrato, política, contexto). "Destructive" = classificação derivada de política, não eixo mecânico. Classificação é autoridade do contrato Conexus, nunca do LLM. |
| 5 | Dual-face | Campos no v1 (custo ~zero, valor de enforcement/auditoria mesmo sem agente); **construção** da tool projection (naming, descrição LLM, filtro) = gatilho do 1º consumidor agente real. MCP = **adapter** por gatilho (1º consumidor externo), nunca modelo canônico interno (spec breaking jul/2026). Nunca dois tipos de integração. |
| 6 | Connection | Objeto do `hub_control`: `connector_slug`, `environment`, `credential_backend`+`credential_ref` (custódia substituível: hub-vault hoje, broker amanhã, produto não muda), `authorization_meta` (metadata observada/declarada por conector — não prova permanente; nome `granted_scopes` rejeitado), `status`, resultado de validação ligado a (revision, environment, key_version), `last_error` estruturado/sanitizado. Identidade de tenant/account = metadata validada pelo conector, fora do núcleo genérico. **Configuração por projeto**: catálogo de conectores é da plataforma; cada projeto pina revisão por ambiente e referencia connection nomeada; app só executa operações do manifesto ativo. |
| 7 | Vault fase 1 | `credential_backend = hub-vault`: criptografia **autenticada**; chave-mestra fora do banco e não herdada por workers; formato versionado + `key_version` (rotação); binding do ciphertext a conexão+ambiente; proibição de plaintext em logs/erros/artefatos. AES-256-GCM pinado **na implementação** (nonce correto, AAD, lib revisada), não no modelo de domínio. Envelope/DEK por conexão = gatilho (rotação seletiva, KMS externo, escala). Corrige inconsistência Mitra (credencial no banco do projeto → vault único no hub). Broker OAuth (Nango/Composio/Arcade/Pipedream) = decisão de sourcing adiada; **gatilho = 1º OAuth delegado** (account linking/consentimento de usuário final — client_credentials não conta). Full Nango self-host rejeitado (free = só auth/proxy). |
| 8 | testConnection | **Obrigatório e semântico** (corrige defeito Mitra): prova credencial válida + tenant/account resolvido + capability mínima efetiva + ambiente correto, na revisão/ambiente/key_version atuais, sem mutação. Roda na **qualificação da Connection** (vincular/promover), não no gate offline do artefato. |
| 9 | Webhook | **Fora do `connector/v1`** — extensão discriminada aditiva no 1º webhook real. Desenho já validado para quando entrar: registration lifecycle; `verification: builtin-por-protocolo\|hook` (Standard Webhooks como builtin quando o provider fala o protocolo; challenge de registro ≠ verificação por evento; "sem assinatura + re-fetch" = degradação documentada, nunca chamado de verificação); dedupe por id antes de parse; fast 2xx → fila → re-fetch do recurso canônico (webhook = "algo mudou", não estado); ingress = named Cloudflare Tunnel (hostname publicado = **entrada pública real** — tratado como tal); fronteira persist/enqueue (atomicidade banco × pg-boss) decidida no 1º webhook. Standard Webhooks para NOSSOS webhooks de saída = 1º emissor real. |
| 10 | Versionamento | Revisões imutáveis por digest (alinha C-005); pin por projeto/ambiente; nenhum projeto muda porque `main` mudou; **sem auto-upgrade**. Hosts: **autoridade única** — contrato declara, allow-list do kind `integration` é projeção compilada no payload imutável carregando digest do contrato-fonte + versão do schema + versão do compilador; mismatch falha fechado; enforcement do Gateway lê só a projeção (e continua provando normalização/DNS/redirects). |
| 11 | Gates (3, separados) | (a) **Conformidade offline da revisão** — dia 1 incondicional: contrato válido; prova de canais definidos sem credencial-sentinela em logs/erros/output/artefatos/projeções; host permitido; redirect recusado ou revalidado por salto; input/output conformes; fixtures determinísticas dos caminhos implementados; metadata effects/idempotency presente com exposição de agente fechada por default; retry off por default. Condicional ao que a fase 1 entrega: compile (se houver TS), provas de paginação/cursor-resume/delete-policy (ETL incremental entrega → obrigatórias por C-006). (b) **Qualificação da Connection** — testConnection + **live smoke test** connection-scoped não-mutante em ambiente autorizado ("dry-run" rejeitado como nome: chamada real não é dry-run). (c) **Promoção a ambiente** — deployment gate C-005. Canary removido (unidade única de deployment — cerimônia). Harness = checklist de cobertura condicional; framework reutilizável extraído no 2º conector ou na 1ª geração por agente. Nenhum resultado de agente aceito por auto-declaração (C-002). |
| 12 | Dispatch | **Defer total** — nem WhatsApp nem e-mail pré-escolhido; sem API genérica de dispatch. Canal nativo quando existir requisito real (caso/destinatário/volume/consentimento). WhatsApp quando entrar: avaliar Cloud API direta × BSP na hora (pricing Meta muda 2026-10-01; fontes primárias Meta inacessíveis na pesquisa — não congelar premissa). |
| 13 | Perfil Sankhya | Auth = OAuth2 `client_credentials` (`client_id`/`client_secret` + `X-Token`); **sem refresh_token** — renovação modelada como **aquisição/reautenticação via `/authenticate`** (bate com acervo: Mitra renova por reautenticação). Sankhya **tem** ambientes distintos (sandbox/homologação × produção, URLs e credenciais próprias) → `environment` na Connection desde o dia 1, conferido no testConnection. Autorização por serviço/tela → `authorization_meta`. Data Discovery por SQL antes de codificar (ADOPT do acervo). |

## Mapa Mitra (sobrevivência)

| Padrão Mitra | Veredito |
|---|---|
| Chamada declarativa `{connection, method, endpoint, body}` com credencial simbólica server-side | ADOPT — ABI da camada de execução; padrão universal do mercado (Merge passthrough / Nango proxy / Composio) |
| Blueprint `fieldsSchema` gera formulário de credencial | ADOPT — vira JSON Schema padrão no auth shape |
| União fechada de auth + renovação server-side | ADOPT — estratégias do Gateway; renovação = reautenticação |
| Túnel Cloudflare para on-prem | ADOPT (named tunnel; hostname publicado tratado como entrada pública) |
| Data Discovery por SQL antes de codificar | ADOPT forte |
| Catálogo hardcoded no bundle frontend | REJECT — catálogo = projeção do registry (SELECT), fatal para visão agêntica |
| Teste de conexão opcional/allowlistado | REJECT — obrigatório e semântico |
| Zero camada operacional declarada (retry/rate-limit/paginação) | REJECT — declarável no contrato (paginação dia 1; rate-limit por gatilho) |
| Zero versionamento/breaking-change de conector | REJECT — revisão imutável + pin + promotion |
| Zero modelo de webhook | REJECT — extensão de contrato (por gatilho) |
| Credencial cifrada dentro do banco do projeto | REJECT — vault único no hub_control |

## NÃO-construir agora (com gatilhos)

| Item | Gatilho de entrada |
|---|---|
| Unified ERP/marketplace API (common models) | 2º conector real da mesma categoria com interseção estável |
| OAuth broker (próprio ou Nango/Composio/Arcade/Pipedream) | 1º OAuth **delegado** com consentimento de usuário final |
| Runtime de hooks TS | 1º provider cuja irregularidade não cabe na união fechada (condições de admissão no componente 2) |
| Extensão webhook + ingress público (named tunnel) | 1º webhook real |
| Tool projection / construtor de agentes | 1º consumidor agente real |
| MCP adapter / server público | 1º consumidor MCP externo |
| Envelope/DEK por conexão, KMS | Rotação seletiva, backend externo ou escala |
| Framework de conformance reutilizável | 2º conector ou 1ª geração de conector por agente |
| API genérica de dispatch; canal WhatsApp/e-mail | Requisito real com caso/destinatário/volume/consentimento |
| Full Nango self-host / Airbyte/n8n embarcado | Nunca como embed (ELv2/SUL hostil); reavaliar só como serviço externo pago |
| Detector automático de breaking change de API | Não existe de forma realista — defesa em profundidade (pin+testes+smoke+observação) |
| Conector Google/Meta universal | Nunca — por capability real com scope mínimo, quando houver caso |

## Consequências

- **Tópico 8+ (scaffold/frontend)**: catálogo de conectores e formulário de credencial são
  projeções do registry — nada hardcoded no template.
- **Tópico 9 (agente de 1ª classe)**: herda taxonomia de operação (effects/approvalFloor) como
  base do human-in-the-loop; tool projection é gatilho deste tópico.
- **Tópico 11 (ciclo de vida)**: promotion de conector usa o mesmo deployment gate C-005; pin de
  revisão por projeto/ambiente entra no modelo de release.
- **Tópico 14 (segurança)**: vault do hub, invariantes de hook e fronteira do Gateway são
  insumos diretos.
- **Pendências de execução (não reabrem a decisão)** — delimitação do vertical Sankhya:
  operações/entidades exatas da 1ª entrega; contrato concreto de paginação/cursor; delete policy
  por entidade; capability usada pelo testConnection; live smoke test escolhido; evidências
  esperadas nos 3 gates. Caminho declarado pelo revisor para 9+/10.

## Adendo pós-C-008 (2026-08-11) — worker remoto e credenciais de integração

A [C-008](05-sandbox.md) reafirma e endurece a fronteira da C-007 para o worker em nuvem:

- **Worker E2B jamais recebe Connection, credencial de ERP ou conteúdo do vault** — coberto
  pelo invariante `durableSecretNotReadableByGuest` (sem exceção, mesmo com root no guest).
  Chamada a ERP durante build/validação = só via Capability Gateway no hub, que devolve
  evidência estruturada ou fixture sanitizada.
- A ÚNICA credencial que entra no guest é a chave de LLM efêmera por run
  (`guestReadableRunCapabilityIsEphemeralAndBounded` — `expires_at`, spend cap, revogação);
  nenhuma credencial de integração se qualifica para essa classe.
- Egress do sandbox é deny-all + allowlist (LLM, registry, git do hub) — endpoint de ERP NÃO
  entra na allowlist do worker; se entrar por engano, o teste de conexão semântico do conector
  continua rodando só no hub.
- Túnel Cloudflare nomeado (entrada pública real, C-007) segue exclusivo do hub — RunPreview do
  sandbox é servido por reverse proxy autenticado do hub e nunca vira ingress de webhook.
