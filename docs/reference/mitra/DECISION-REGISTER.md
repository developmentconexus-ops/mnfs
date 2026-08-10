# Registro de Decisões — Mitra → Conexus

> **O que é este arquivo.** A destilação do trabalho inteiro de engenharia reversa da Mitra num
> só lugar: cada padrão observado, seu veredito para o Conexus, e o porquê. É a peça de consulta
> mais importante desta pasta — quando for planejar o Conexus, comece por aqui.
>
> **De onde vem.** Extraído de [`MITRA-INSPIRATION-MAP.md`](../../research/MITRA-INSPIRATION-MAP.md)
> (v0.9.0), que permanece congelado como cadeia de evidência (fonte, citação, data). Este registro
> **deriva** dele; não o substitui. A coluna *Evidência* aponta a seção do mapa; a coluna *Ref*
> aponta o documento temático desta pasta que explica o padrão em profundidade.
>
> **Vocabulário** (`CAPABILITY-REALIZATION-METHOD`):
> `OWN` construir do zero como diferencial · `ADOPT` copiar o padrão · `ADAPT` copiar com mudança ·
> `SPIKE` investigar antes de decidir · `REFERENCE` guardar como lição, não implementar agora ·
> `DEFER` fora de escopo por ora · `REJECT` não fazer (com o motivo).

---

## Como ler o veredito

- **ADOPT / ADAPT** = a Mitra acertou. Copiar (talvez com ajuste). São o piso do Conexus.
- **OWN** = a Mitra **não tem** e é onde o Conexus ganha mercado. São as apostas.
- **REJECT** = a Mitra tem e está **errado/perigoso**. Cada um é um requisito negativo do Conexus
  (“não repetir isto”). Consolidados em [`08-limites-e-gaps.md`](08-limites-e-gaps.md).
- **SPIKE / REFERENCE / DEFER** = decidir depois, com contexto.

**Placar** (após dedup): ~95 ADOPT · ~25 ADAPT · ~6 OWN · ~22 REJECT · ~3 SPIKE · ~30 REFERENCE · ~4 DEFER.

---

## 1. Harness agêntico → [`01-harness-agentico.md`](01-harness-agentico.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| Harness = Claude Code CLI sobre sandbox E2B por projeto | REFERENCE | Confirma a direção; base do Conexus alinhada | [§2](../../research/MITRA-INSPIRATION-MAP.md), [§20](../../research/MITRA-INSPIRATION-MAP.md) |
| `CLAUDE.md`/`AGENTS.md` por projeto como contexto versionado | **ADOPT** | Context pack barato e auditável; precedência de arquivo sobre regra genérica | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§31.5](../../research/MITRA-INSPIRATION-MAP.md) |
| Protocolo de turno rígido `SYNC → BUILD → SHARE` | ADAPT | SYNC = reconciliação de abertura; SHARE = entrega explícita (no Conexus, com envelope) | [§34.10](../../research/MITRA-INSPIRATION-MAP.md) |
| Steering por fila em arquivo, drenada no SYNC | **ADOPT** | Zero interrupção do CLI; o agente decide quando ler | [§26](../../research/MITRA-INSPIRATION-MAP.md) |
| `taskId` = sessão contínua sem limite de turnos | ADOPT | Sessão longa por unidade de trabalho é o modelo certo | [§26](../../research/MITRA-INSPIRATION-MAP.md) |
| Escalada após 3 tentativas com dossiê estruturado | ADOPT | Regra barata para role contract de Worker | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§34.3](../../research/MITRA-INSPIRATION-MAP.md) |
| Tools do agente = server functions do projeto via **MCP** (`mcp__mitra-business`) | **ADOPT** | Melhor decisão da Mitra: capacidade do agente vira artefato versionável, revisável, permissionável | [§31.2](../../research/MITRA-INSPIRATION-MAP.md) |
| Um MCP server por domínio | **ADOPT** | Namespace limpo, isolamento por domínio | [§31.2](../../research/MITRA-INSPIRATION-MAP.md) |
| Sem tool de SQL direto para o agente de negócio | **ADOPT** | Guarda-corpo: SQL passa por SF auditável (`consulta_livre`) | [§31.2](../../research/MITRA-INSPIRATION-MAP.md), [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| `ToolSearch` / schemas de tool sob demanda | ADAPT | Necessário quando o registry cresce; já prever o formato de nome | [§31.2](../../research/MITRA-INSPIRATION-MAP.md) |
| Modelo × reasoning-effort como sufixo (`…:high`) por turno | ADOPT | Um seletor só; string única derivada no backend | [§26](../../research/MITRA-INSPIRATION-MAP.md) |
| Telemetria de token/custo por turno **e** por sessão | ADOPT | `turn_end.costUSD` + `taskUsage` acumulado é o mínimo | [§26](../../research/MITRA-INSPIRATION-MAP.md) |
| Múltiplos `agentType` (claudecode/codex/opencode) | ADAPT | Abstração existe; começar com 1 runtime sólido, interface de sessão pronta | [§18](../../research/MITRA-INSPIRATION-MAP.md), [§26](../../research/MITRA-INSPIRATION-MAP.md) |
| `AskUserQuestion` deve encerrar o turno (mitigação por prompt) | REFERENCE + STRENGTHEN | Preferir bloqueio mecânico no harness; a fraqueza confessa do prompt-only é o argumento | [§34.10 (CLAUDE.md)](../../research/MITRA-INSPIRATION-MAP.md) |
| Delegar compactação ao CLI nativo, sem expor estado | ADAPT / REJECT parcial | Base aceitável, mas o usuário precisa ver contexto restante | [§26](../../research/MITRA-INSPIRATION-MAP.md) |

## 2. Registro de artefatos (server functions) → [`02-registro-artefatos.md`](02-registro-artefatos.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| Três tipos de SF: `JAVASCRIPT` / `SQL` / `INTEGRATION` | ADOPT | Três tipos cobrem quase tudo | [§23](../../research/MITRA-INSPIRATION-MAP.md), [§34.4](../../research/MITRA-INSPIRATION-MAP.md) |
| Três registries irmãos: `serverFunction` / `dataLoader` / `dbAction`, todos por id + input | **ADOPT** | Nenhum SQL do cliente; toda operação é artefato nomeado e permissionável | [§32.3](../../research/MITRA-INSPIRATION-MAP.md), [§33](../../research/MITRA-INSPIRATION-MAP.md) |
| Provisionamento idempotente (`list → update \| create`) por `name` | **ADOPT** | O script é a versão; roda N vezes, mesmo estado | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§34.3](../../research/MITRA-INSPIRATION-MAP.md) |
| DDL idempotente (`CREATE TABLE IF NOT EXISTS`), nunca `DROP` | ADOPT | Aditividade por padrão | [§34.3](../../research/MITRA-INSPIRATION-MAP.md) |
| Envelope `{executionId, executionStatus, output:{rowCount, rows}}` | **ADOPT** | `executionId` = auditoria de graça; `executionStatus` abre o modo assíncrono | [§32.3](../../research/MITRA-INSPIRATION-MAP.md) |
| `executeServerFunctionAsync` + `stopServerFunctionExecution` | **ADOPT** | Cancelar execução longa é requisito | [§32.3](../../research/MITRA-INSPIRATION-MAP.md) |
| Dois SDKs: build privilegiado (`mitra-sdk`, DDL/DML) × runtime restrito (`mitra-interactions-sdk`) | **ADOPT** | Arquitetura central: o poder mora no build, não no runtime | [§34.1](../../research/MITRA-INSPIRATION-MAP.md) |
| Fragmentos SQL nomeados + regra "a SF de X nunca filtra `{{x}}`" + contrato `name/value/code` | **ADOPT** | Resolve cross-filter de BI inteiro com uma linha; um `Chart` genérico consome tudo | [§34.7](../../research/MITRA-INSPIRATION-MAP.md) |
| SF com cron embutido | ADOPT | Job scheduling sem serviço separado | [§16](../../research/MITRA-INSPIRATION-MAP.md), [§21](../../research/MITRA-INSPIRATION-MAP.md) |
| Espelho externo→MySQL com upsert `ON DUPLICATE KEY` (nunca DELETE+INSERT) | **ADOPT** | Paginação até esgotar + upsert em chunk + cursor derivado do dado + log por etapa | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§34.6](../../research/MITRA-INSPIRATION-MAP.md) |
| `serverFunctionId` **numérico** no cliente → `sf-ids.ts` gerado | **REJECT** | Acopla frontend a ids de banco; promote/duplicação vira remapeamento. O próprio prompt avisa "NUNCA IDs hardcoded". Usar slug estável | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§32.3](../../research/MITRA-INSPIRATION-MAP.md), [§34.3](../../research/MITRA-INSPIRATION-MAP.md) |
| Três sintaxes de binding (`event.x` textual / `event.x` global / `{{x}}` mustache) | **REJECT** | Inconsistência cara; uma só sintaxe | [§34.4](../../research/MITRA-INSPIRATION-MAP.md) |
| SQL por interpolação de string + sanitização por regex **no cliente** | **REJECT** | Vulnerável por design: quem chama fora do app pula o `limpar()`. Usar bind params reais | [§34.4](../../research/MITRA-INSPIRATION-MAP.md) |
| Código de job como string em template literal | **REJECT** | Frágil (a própria Mitra documenta a armadilha do `\s`); job é arquivo real | [§34.6](../../research/MITRA-INSPIRATION-MAP.md) |
| Toda superfície de dados do app atrás de SF (CRUD REST bloqueado p/ business) | REFERENCE / ADOPT (princípio) | "Superfície = contratos explícitos" | [§29](../../research/MITRA-INSPIRATION-MAP.md), [§34.4](../../research/MITRA-INSPIRATION-MAP.md) |

## 3. Camada de dados → [`03-camada-dados.md`](03-camada-dados.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| Um schema MySQL + container Docker por projeto, provisionado no create | **ADOPT** | Isolamento por padrão, sem etapa manual | [§33](../../research/MITRA-INSPIRATION-MAP.md) |
| Backend serverless: só SFs gerenciadas, sem `src/` | ADOPT | Reduz superfície; lógica versionada como SF + migration | [§21](../../research/MITRA-INSPIRATION-MAP.md) |
| Schema derivado de descrição em linguagem natural | ADAPT | Ótimo para começar; exige revisão humana antes de produção | [§33](../../research/MITRA-INSPIRATION-MAP.md) |
| Migrations append-only materializadas **pelo sistema** após o turno | ADOPT (princípio) | Efeito durável capturado por interceptação, fora da vontade do Worker | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§34.3 (CLAUDE.md)](../../research/MITRA-INSPIRATION-MAP.md) |
| Placeholders de FK (`CODVEND=0`) para dado sujo da origem | ADOPT | Detalhe de robustez que denuncia experiência real | [§34.6](../../research/MITRA-INSPIRATION-MAP.md) |
| **Sem ambiente de teste de dados por padrão** (banco de DEV = o banco) | **REJECT** | Maior risco operacional: SF destrutiva "em dev" apaga produção. Conexus: efêmero + fixtures | [§33](../../research/MITRA-INSPIRATION-MAP.md), [§34.9](../../research/MITRA-INSPIRATION-MAP.md) |
| **Banco e SFs não versionados; mudança vale na hora** | **REJECT** | Migration tem que ser gate, não só log | [§33](../../research/MITRA-INSPIRATION-MAP.md) |
| Smoke test contra o banco de produção (única forma possível lá) | **REJECT** | Só é "seguro" porque as SFs são SELECT. Conexus: asserção de valor, não "não explodiu" | [§34.9](../../research/MITRA-INSPIRATION-MAP.md) |
| Contradição doc-oficial × §27 sobre banco DEV vs PROD | SPIKE | Único conflito de fontes não resolvido; só um promote real decide | [§33.3](../../research/MITRA-INSPIRATION-MAP.md) |
| Credencial de banco externo criptografada no próprio banco do projeto | ADAPT | Aceitável, mas preferimos um único cofre | [§33](../../research/MITRA-INSPIRATION-MAP.md) |

## 4. Integração externa → [`04-integracao-externa.md`](04-integracao-externa.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| SF `INTEGRATION` = HTTP declarativo `{connection, method, endpoint, body}` (JSON, não código) | **ADOPT** | Conector declarativo + credencial simbólica → repo público-safe | [§34.5](../../research/MITRA-INSPIRATION-MAP.md) |
| `callIntegrationMitra` (proxy REST genérico; credencial fica no servidor) | ADOPT (princípio) | App nunca vê credencial; um contrato para N provedores | [§12](../../research/MITRA-INSPIRATION-MAP.md) |
| Conexão nomeada por blueprint (`sankhya_oauth`) + slug reutilizável | ADOPT | `connection` como handle; blueprint versionado | [§15](../../research/MITRA-INSPIRATION-MAP.md) |
| Blueprint com `fieldsSchema` dinâmico + `testEndpoint` | ADOPT | Catálogo versionado; formulário de credencial gerado do schema | [§16.2](../../research/MITRA-INSPIRATION-MAP.md), [§25](../../research/MITRA-INSPIRATION-MAP.md) |
| Union fechada de `AuthorizationConfig` (header/basic/cookie/query) + `DYNAMIC_TOKEN` | ADOPT | Cobre 95% dos SaaS; token-refresh server-side | [§25](../../research/MITRA-INSPIRATION-MAP.md) |
| Credencial server-side em `.env` gitignored, injetada no gateway | ADOPT | Segredo nunca no cliente nem no repo | [§15](../../research/MITRA-INSPIRATION-MAP.md) |
| Data Discovery por SQL para resolver escopo contra dado real | **ADOPT (forte)** | Antídoto ao "inventar regra": build valida hipóteses contra o schema real antes de codar | [§14](../../research/MITRA-INSPIRATION-MAP.md), [§15](../../research/MITRA-INSPIRATION-MAP.md) |
| 4 camadas de dado externo (rede→conexão→virtual/materializado→REST) | ADOPT | DataLoader com executionLog = esqueleto do pipeline de carga | [§16](../../research/MITRA-INSPIRATION-MAP.md) |
| Tunnel reverso gerenciado (Cloudflare) com token p/ a TI | ADOPT | Onboarding on-prem sem VPN; health por rota | [§18](../../research/MITRA-INSPIRATION-MAP.md), [§25](../../research/MITRA-INSPIRATION-MAP.md) |
| CSV como tipo de conexão (upload FormData) | ADOPT | Fonte barata e útil | [§25](../../research/MITRA-INSPIRATION-MAP.md) |
| Gateway com **SQL livre** contra o ERP | ADAPT (com trava) | Poderoso p/ Discovery, perigoso em produção: read-only forçado + allowlist por perfil | [§15](../../research/MITRA-INSPIRATION-MAP.md) |
| Perfil de ERP plugável (TGFCAB/TOP, `AD_`, multiempresa) | REFERENCE | Conhecimento de domínio versionado, não hardcoded no agente | [§15](../../research/MITRA-INSPIRATION-MAP.md) |
| Credencial de produção colada no chat; 1 token → 6 empresas | **REJECT / trava** | Canal de credencial dedicado; escopo por empresa; seleção explícita de ambiente | [§15](../../research/MITRA-INSPIRATION-MAP.md) |
| Chave de LLM no cliente / SF pública com segredo | **REJECT** | Anti-pattern de segurança; credencial de modelo sempre server-side | [§13](../../research/MITRA-INSPIRATION-MAP.md) |

## 5. Ciclo de vida (build → release → promote) → [`05-ciclo-de-vida.md`](05-ciclo-de-vida.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| Branch `user/{id}` por colaborador, `main` = baseline compartilhada | ADOPT | Isolamento de trabalho por pessoa; merge no SHARE | [§34 (CLAUDE.md)](../../research/MITRA-INSPIRATION-MAP.md) |
| Sandbox descartado após 20 min idle | REFERENCE | "Pular SHARE = trabalho órfão"; explica a urgência do commit | [§34 (CLAUDE.md)](../../research/MITRA-INSPIRATION-MAP.md) |
| PROD como projeto forkado e ligado ao DEV | **ADOPT** | Isolamento real de ambiente > flag "modo prod" | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Promote com 12 steps nomeados e observáveis | **ADOPT** | Deploy legível passo a passo é requisito | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Falha de deploy vira tarefa do agente ("Resolve with the agent") | **ADOPT** | Fecha o loop agente↔operação | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Save Release desacoplado de Promote | ADOPT | Separar "marcar versão" de "publicar versão" | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Rollback por promote de tag antiga (código, não schema) | ADOPT | Coerente com migrations forward-only | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| GitHub Release + CHANGELOG automáticos | ADOPT | Histórico auditável de graça | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Deploy por snapshot versionado (não live-mount do sandbox) | ADOPT | Prod imutável e reproduzível | [§24](../../research/MITRA-INSPIRATION-MAP.md) |
| Status `inSync/hasOutput/published/version` → diff "publicar mudanças" | ADOPT | UX clara de "há mudanças não publicadas" | [§24](../../research/MITRA-INSPIRATION-MAP.md) |
| `mergeMitraPackageBaseline` p/ atualizar template upstream | REFERENCE | Resolve "template evoluiu depois do fork" | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Scaffold / UI-kit byte-idêntico versionado entre projetos | ADAPT | Bom piso de qualidade; precisa de escape hatch | [§21](../../research/MITRA-INSPIRATION-MAP.md), [§34.2](../../research/MITRA-INSPIRATION-MAP.md) |
| Dry-run de migration só dentro do promote | **REJECT** | Descobrir migration quebrada no meio do deploy é tarde; validar antes | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Endpoint `/cancel` que a UI diz não poder cancelar | **REJECT** | Contrato inconsistente | [§27](../../research/MITRA-INSPIRATION-MAP.md) |
| Owner/Admin do workspace entra em todo projeto como dev | **REJECT** | Privilégio implícito não-revogável quebra segregação | [§33](../../research/MITRA-INSPIRATION-MAP.md) |
| Painel de Git da UI morto neste deploy (`/api/e2b-git/*` devolve o SPA) | REFERENCE (lição) | Nunca deixar rota crítica degradar em silêncio | [§34.12](../../research/MITRA-INSPIRATION-MAP.md) |

## 6. Runtime publicado → [`06-runtime-publicado.md`](06-runtime-publicado.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| REST em 2 camadas: `/agentAiShortcut` (dev) × `/interactions` (runtime) | ADOPT | Separar plano de controle do plano de dados | [§20](../../research/MITRA-INSPIRATION-MAP.md) |
| Config de runtime injetada no HTML no publish (`window.__mitraEnv`) | **ADOPT** | Sem rebuild por ambiente; app auto-contido | [§32.1](../../research/MITRA-INSPIRATION-MAP.md) |
| `records/${table}` genérico com filtro/paginação server-side | ADOPT | CRUD tabular genérico é a espinha do runtime | [§20](../../research/MITRA-INSPIRATION-MAP.md) |
| Normalizador defensivo do output (string JSON / `{result:[]}` / objeto) | ADOPT (disciplina) | Isolar defeito de plataforma num ponto de borda e comentar o porquê | [§34.8](../../research/MITRA-INSPIRATION-MAP.md) |
| Página de auth em origem separada (app nunca vê senha) | **ADOPT** | Reduz superfície de credencial no app gerado | [§29](../../research/MITRA-INSPIRATION-MAP.md) |
| Login popup **e** redirect com `returnTo` | ADOPT | Cobre embed e standalone | [§29](../../research/MITRA-INSPIRATION-MAP.md) |
| Self-signup com código de 6 dígitos por projeto | ADOPT | Contas próprias sem convite manual | [§29](../../research/MITRA-INSPIRATION-MAP.md) |
| RBAC do app em 5 eixos, leitura ≠ escrita, escopado por conexão | **ADOPT** | Melhor granularidade que a média low-code | [§29](../../research/MITRA-INSPIRATION-MAP.md) |
| RBAC administrável via SDK em runtime | **ADOPT** | O agente provisiona RBAC por código | [§29](../../research/MITRA-INSPIRATION-MAP.md) |
| `homeScreenId` por perfil | ADOPT | Landing por papel, barato e de alto valor | [§29](../../research/MITRA-INSPIRATION-MAP.md) |
| Chat-embed: handshake `loaded → init → ready → opened` | **ADOPT** | Resolve corrida de iframe sem `setTimeout` | [§32.4](../../research/MITRA-INSPIRATION-MAP.md) |
| Modo push/overlay/full por razão, não por breakpoint | **ADOPT** | Responsivo de verdade, 3 constantes | [§32.4](../../research/MITRA-INSPIRATION-MAP.md) |
| S3 multitenant: prefixo por tenant + sufixo único no nome | **ADOPT** | Padrão sólido de object storage multi-tenant | [§32.2](../../research/MITRA-INSPIRATION-MAP.md) |
| Tokens no fragment `#`, limpos via `replaceState` | ADOPT | Não vaza em referrer/log | [§21](../../research/MITRA-INSPIRATION-MAP.md) |
| Token repassado por `postMessage` com `targetOrigin:"*"` | **REJECT** | Vaza token para qualquer frame ouvinte; origem explícita | [§32.4](../../research/MITRA-INSPIRATION-MAP.md) |
| `X-TenantID` como **única** fronteira de tenancy | ADAPT | Bom para trace; não pode ser a única fronteira | [§32.3](../../research/MITRA-INSPIRATION-MAP.md) |
| `/public/` do bucket legível sem URL assinada | ADAPT | OK p/ anexo; perigoso como default. Conexus: privado por padrão | [§32.2](../../research/MITRA-INSPIRATION-MAP.md) |
| Erro colapsado em estado vazio na UI (aba Código) | **REJECT** | `vazio`, `carregando`, `falhou` são 3 estados distintos | [§34.12](../../research/MITRA-INSPIRATION-MAP.md) |

## 7. Padrão de projeto (como um app real nasce) → [`07-padrao-de-projeto.md`](07-padrao-de-projeto.md)

| Padrão da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| Etapa de **escopo** separada, antes do build (agente distinto) | ADOPT | O escopo é o contrato de handoff | [§13](../../research/MITRA-INSPIRATION-MAP.md) |
| Elicitação guiada por 4 gates de suficiência (objetivo/personas/regras/fluxos) | ADOPT | Checklist barato de completude antes de gerar spec | [§13](../../research/MITRA-INSPIRATION-MAP.md) |
| Gate de confirmação humana antes de gerar o documento | ADOPT | Interrupção só para decisão/aceite | [§13](../../research/MITRA-INSPIRATION-MAP.md) |
| Modelo diferente por etapa (Gemini escopo / Claude build) | ADAPT | Roteamento de modelo por custo/qualidade | [§13](../../research/MITRA-INSPIRATION-MAP.md) |
| Estágio 2 (build) **audita** o estágio 1 (escopo) contra o dado real | **ADOPT** | Achado mais importante: spec assertiva + Discovery com veto; spec só vira contrato após validada | [§14.1](../../research/MITRA-INSPIRATION-MAP.md) |
| Docs de planejamento versionados (`ux.md`, `design.md`, `featuresearquitetura.md`, `tasks.md`) | **ADOPT** | Memória externalizada que o agente relê ("Base: integracao-sankhya.md") | [§5](../../research/MITRA-INSPIRATION-MAP.md), [§34.10](../../research/MITRA-INSPIRATION-MAP.md) |
| `tasks.md` com log de correção + causa-raiz | ADOPT | Bom formato mínimo de razão de execução | [§17](../../research/MITRA-INSPIRATION-MAP.md) |
| Validação de backend **antes** do frontend, executando de verdade | ADOPT | Proof-first puro (acentos, FK) | [§14](../../research/MITRA-INSPIRATION-MAP.md) |
| Smoke test que reproduz as chamadas da UI sem navegador | ADOPT | Padrão de honestidade: declarar o que NÃO foi testado | [§14](../../research/MITRA-INSPIRATION-MAP.md), [§34.9](../../research/MITRA-INSPIRATION-MAP.md) |
| Revisão final item-a-item contra o prompt original | ADAPT | Gate barato no fechamento de feature | [§34.10](../../research/MITRA-INSPIRATION-MAP.md) |
| "Limitações conhecidas" + critérios de aceite **numéricos** obrigatórios | **ADOPT (requisito)** | O agente cancelou uma feature (margem) por falta de dado, com o número que prova | [§34.11](../../research/MITRA-INSPIRATION-MAP.md) |
| Template rico → agente herda boas decisões (reuso por analogia) | ADOPT | Investir no scaffold é alavanca de qualidade | [§14](../../research/MITRA-INSPIRATION-MAP.md) |
| Checklist-template invariante com validações embutidas | ADOPT | Barato e auditável p/ agente embutido | [§17](../../research/MITRA-INSPIRATION-MAP.md) |
| Auto-validação sem revisor frio | ADAPT | OK p/ CRUD; manter revisor frio p/ mudança de risco | [§17](../../research/MITRA-INSPIRATION-MAP.md) |

## 8. Agentes de 1ª classe — as apostas OWN → [`01`](01-harness-agentico.md) + [`08`](08-limites-e-gaps.md)

| Lacuna da Mitra | Veredito | Racional | Evidência |
|---|---|---|---|
| **Não existe entidade "Agente"** (identidade, versão, tools declaradas, ciclo de vida) — é convenção montada à mão no app | **OWN** | O diferencial central do Conexus: agente como objeto de 1ª classe | [§30](../../research/MITRA-INSPIRATION-MAP.md), [§31](../../research/MITRA-INSPIRATION-MAP.md) |
| Ausência de agentes customizados (prompt/tools/persona) | **OWN** | Lacuna clara; onde o Conexus diferencia | [§16.5](../../research/MITRA-INSPIRATION-MAP.md) |
| Ausência de IA no SDK de backend | **OWN** | Agente de domínio server-side é território livre | [§16.5](../../research/MITRA-INSPIRATION-MAP.md) |
| System prompt remontado à mão por app, a cada thread | **OWN** | A abstração faltante: contexto+tools+modelo+política versionados | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| Contexto único por projeto (sem escopo por agente/tarefa) | **OWN** | Conexus: contexto em camadas plataforma → projeto → agente → tarefa | [§31.5](../../research/MITRA-INSPIRATION-MAP.md) |
| **WS agêntico exige usuário logado — sem agente headless** | **REJECT → OWN** | Mata cron/webhook/evento; Conexus precisa de agente por evento com identidade de serviço | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| Permissão de tool por grupo de usuário, não por agente | ADAPT | Conexus: permissão **por agente ∩ por usuário** | [§31.3](../../research/MITRA-INSPIRATION-MAP.md) |
| Credencial de agente com escopo de workspace (coordinator) | SPIKE | Orquestrador precisa de identidade própria — desenhar antes | [§28](../../research/MITRA-INSPIRATION-MAP.md) |

### Padrões de produto de IA que valem ADOPT (do Playground / §31.6)

| Padrão | Veredito | Racional | Evidência |
|---|---|---|---|
| **Generative UI**: agente termina desenhando HTML self-contained em canvas versionado | **ADOPT** | Melhor padrão de produto da Mitra: resposta navegável > texto | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| Parâmetro de narração (`titulo`) obrigatório no contrato da tool | **ADOPT** | Trivial; ganho de percepção e auditoria | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| Modelo de **segmentos** ordenados (md/tool intercalados) + fusão ×N | **ADOPT** | Diferença entre "parece travado" e "parece pensando" | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| "Primeira consulta em <15s" como métrica de qualidade de contexto | **ADOPT** | Métrica objetiva | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| `input` de tool truncado exigindo regex tolerante | **REJECT** | Protocolo tem que entregar input íntegro; se grande, referenciar por id | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |
| `loadHistory()` devolvendo tool call como texto cru | **REJECT** | Histórico tipado na origem | [§31.6](../../research/MITRA-INSPIRATION-MAP.md) |

---

## Estratégia de credenciais e economia (transversal)

| Padrão | Veredito | Racional | Evidência |
|---|---|---|---|
| BYOS via OAuth (Claude/Codex) — assinatura do cliente no lugar de API credits | **ADOPT** | Muda a economia de operação; token-refresh server-side | [§18](../../research/MITRA-INSPIRATION-MAP.md) |
| BYOK 8 provedores + seletor de modelo por mensagem | ADOPT | Roteamento por tarefa/custo; catálogo dinâmico | [§18](../../research/MITRA-INSPIRATION-MAP.md) |
| `connectionId` amarrando task ↔ credencial ↔ histórico do usuário | **ADOPT** | Resolve custo de IA por usuário final — peça-chave | [§16.5](../../research/MITRA-INSPIRATION-MAP.md), [§18](../../research/MITRA-INSPIRATION-MAP.md) |
| `scope: user | connection` para chaves | **ADOPT** | Separar chave pessoal de chave de integração | [§28](../../research/MITRA-INSPIRATION-MAP.md) |
| Claude OAuth gated por domínio de email | ADOPT | Controle de quem usa a assinatura corporativa | [§28](../../research/MITRA-INSPIRATION-MAP.md) |
| Credenciais de integração em **servidor apartado**, fora do banco do projeto | **ADOPT** | Separação de domínio de segredo — copiar exatamente | [§33](../../research/MITRA-INSPIRATION-MAP.md) |
| `updateAdditional(Business)InstructionsMitra` (instrução dev vs business) | ADOPT | Separar instrução por audiência | [§12](../../research/MITRA-INSPIRATION-MAP.md) |
| Dogfooding total (comunidade/ajuda/tutorial = apps da própria plataforma) | **ADOPT (política)** | Prova de capacidade + loop de feedback real | [§32.5](../../research/MITRA-INSPIRATION-MAP.md) |
| Publicar o prompt de construção do produto-exemplo como anexo | **ADOPT** | Melhor peça de developer relations deles | [§32.5](../../research/MITRA-INSPIRATION-MAP.md) |

---

## Fora de escopo agora (DEFER / REJECT-para-Conexus)

| Item | Veredito | Motivo |
|---|---|---|
| Template de app + component library + seed data realista | DEFER | Só quando o Conexus tiver produto de geração |
| Integrações ERP-BR prontas / e-mail transacional / Drive / domínios | REJECT (p/ Conexus) | Feature de app-builder SaaS, fora do domínio agora |
| Gamificação / comunidade como parte do produto | DEFER | Fora de escopo por ora |
| Studio Nuxt × app React como stacks distintas | REFERENCE | Decisão deles; explica por que o SDK do runtime é separado |

---

*Índice mantido em [`00-OVERVIEW.md`](00-OVERVIEW.md). Evidência-fonte congelada em
[`MITRA-INSPIRATION-MAP.md`](../../research/MITRA-INSPIRATION-MAP.md) v0.9.0.*
