# Pesquisa interna — Tópico 12: Runtime publicado (Auth/RBAC, embed, storage)

> Data: 2026-08-12. Profundidade declarada do tópico: **rasa → aprofunda no build** (00-TOPICOS linha 12).
> Fontes: acervo C-000..C-014 (docs 01–12 + DECISOES.md + 03-requisitos.md), referência Mitra
> (docs/reference/mitra/06, 08, DECISION-REGISTER §6) + sonda C-009 (OBS-01..77), varredura de
> mercado com web (12/08/2026). Convenção Mitra: **camada A = medido na sonda** ·
> **camada B = desenhado/extraído de bundle**.

---

## Q0 — O que já está congelado × o que T12 realmente decide

### Congelado (T12 NÃO reabre)

| Área | Fato congelado | Fonte |
|---|---|---|
| Serving | Hub serve `deployments/<project>/<digest>/dist` direto; ponteiro CAS único; publish = write → verify → troca atômica; assets `immutable`, index `no-cache`; Caddy/Cloudflare = gatilhos nomeados | C-012 §16 |
| Headers | CSP estrita, `nosniff`, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy` desde o 1º deploy ("não espera T12") | C-012 §16 |
| Handshake | 3 digests sem ciclo; mismatch ⇒ `CLIENT_OUTDATED` fail-closed; health ⇒ `CAPABILITY_UNAVAILABLE_HEALTH` | C-012 §12/§14 |
| Auth seam | `SessionBoundary` (loading/anonymous/authenticated) + `ViewerContext` tipado (shape **mutável por T12**); F1 = cookie HttpOnly do hub, zero token no browser; runtime é BFF | C-012 §17 |
| Dev identity | `LOCAL_DEVELOPMENT_IDENTITY` com banner; build de produção falha com ela habilitada (PLATFORM-CONTRACT) | C-012 §17/§14 |
| Derivação | Projeto/app/deployment derivados server-side ou de token assinado — nunca aceitos do browser; SDK runtime = só `execute(slug, input)` | C-005 comp.10 |
| Preview | `RunPreview` privado via reverse proxy autenticado do hub; `PreviewEnvironment` estável = decisão adiada separada | C-008 comp.9; C-012 §16 |
| Roles de banco | `{proj}_owner/_migrator/_query/_action`; Gateway seleciona credencial pelo KIND do artefato, não pelo usuário; T12 não cria role Postgres por usuário | C-005/C-006 |
| Audiência | Invariante declarada: single-tenant, usuários internos, **um grupo de permissão**; RC-1 dispara ANTES de segundo grupo de permissão; RC-2 já acionada (C-010, metadata `effects`/`approvalFloor`) | C-006 comp.11; C-005 comp.13; C-010 |
| RBAC client-side | Nunca é boundary — presentation policy = UX; autoridade real = hub/Gateway (NÃO-construir: "RBAC client-side como segurança") | C-012 §17/§18 |
| Contrato | `runtimeContractDigest` EXCLUI autorização de usuário (mudar permissão ≠ `CLIENT_OUTDATED`) | C-012 §12 |
| Promote | Gate humano; `POINTER_SWAPPED → SERVED_VERIFIED`; PROD = database separado lazy, isolado por roles; EnvironmentConformance mede roles/grants/`rolbypassrls` reais | C-014 |
| Telemetria | Nunca decide autorização; RBAC de trace = delegado a T12 | C-013 §1/§19 |
| Tenancy | Fronteira no servidor (header é trace — SEG-2 MVP); arquitetura nasce multi-tenant; segundo tenant real = RC-1 | C-001; 03-requisitos; C-005 comp.13 |

### Requisitos ratificados que T12 realiza

| Req | Fase | Texto | Situação |
|---|---|---|---|
| PUB-1 | MVP | Publish injeta config de ambiente no HTML; app usa só SDK restrito | Já realizado por C-005/C-012/C-014 |
| PUB-2 | MVP | Auth em origem separada; token no fragment, limpo; refresh token (não iframe) | **Tensão com C-012 §17 — exige reinterpretação (T-1)** |
| PUB-3 | F1 | RBAC leitura≠escrita, escopado, administrável via SDK; home por perfil | **Lacuna — como caber sob invariante de audiência (T-2)** |
| PUB-4 | F1 | Chat-embed com handshake de estado; origem explícita no postMessage | Lacuna — forma decidida (C-012 §15 p/ chat interno), realização externa aberta |
| PUB-5 | MVP | Storage privado por padrão; público = opt-in assinado; prefixo por tenant | **Única linha MVP sem NENHUMA arquitetura por trás — lacuna integral** |
| SEG-2 | MVP | Tenancy com fronteira no servidor | Congelado; T12 herda |
| AGT-5 | F1 | Sessão de agente embutível com eventos tipados | Forma do `AgentTaskSession` (C-010/C-012) |

### Lacunas que T12 decide (numeradas)

1. Mecanismo de auth de usuário final: quem emite/valida o cookie, formato/duração da sessão, login/logout/renovação.
2. Modelo e ciclo de vida da conta: onde vivem as contas, provisão pelo operador (F1 sem self-signup), reset de credencial.
3. Shape final do `ViewerContext` (roles/capabilities).
4. Realização do PUB-3 sob a invariante de audiência — ou declaração formal de quando RBAC de app aciona RC-1.
5. Se/como a identidade do viewer entra na decisão do Gateway (mecânica do "autoridade do usuário ∩ allowlist ∩ policies" da C-010 comp.3).
6. RBAC de trace (delegação C-013 §19).
7. Embed em sistema externo: permitido ou não; valor default de `frame-ancestors`; realização do PUB-4.
8. Storage PUB-5: substrato, API de upload, servir com auth, opt-in público, limites, GC, backup.
9. Escopo da sessão no serving multi-projeto: uma sessão do hub para N apps × sessão por app.
10. Reconciliação formal de PUB-2 com C-012 §17 (padrão HAR-5: reinterpretação registrada).

---

## Q1 — Auth de usuário final: mecanismo

**Fatos (Mitra).** Camada B desenha: auth em origem separada, popup + redirect `returnTo`, token no
fragment limpo via `replaceState`, refresh por iframe, self-signup com código de 6 dígitos. Camada A
mediu pior: JWT HS256 com `sub`=e-mail, `accessType: CREATOR`, validade ~27 anos, transportado por
URL → `localStorage`, sem cookie, sem expiração (OBS-36, OBS-56 → S9). Sem token, tela vazia sem
mensagem (E1). Pós-sonda, S9 virou requisito no doc 08: sessão por cookie HttpOnly+SameSite, token
curto, URL nunca carrega credencial.

**Fatos (mercado).** Plataformas separam builder auth de end-user auth; SSO/SAML/SCIM = tier
enterprise. Panorama 2026: passkeys mainstream em enterprise mas 87% das organizações ainda usam
senha; recomendação corrente = magic link/OTP como porta + passkey como upgrade opcional — nunca
pré-requisito. Para app servido por proxy próprio na mesma origem, cookie de sessão HttpOnly +
SameSite=Lax first-party domina JWT em simplicidade e revogação; JWT só ganha com múltiplas origens.

**Confronto.** A Mitra precisa de origem separada porque serve apps em subdomínio próprio
(`<ws>-<proj>.build.mitralab.io`) fora da origem da plataforma. O Conexus F1 serve tudo pela MESMA
origem do hub (BFF, C-012 §17) — a razão arquitetural do token-no-fragment não existe aqui. Magic
link exigiria provedor de email operacional (dependência + custo em F1).

**Posição preliminar.** Contas de usuário final vivem no `hub_control` (identidade única: uma conta
→ N apps, id estável UUID); provisionadas pelo operador (convite/cadastro admin, sem self-signup
F1; reset feito pelo operador); credencial = email/senha com argon2id; sessão server-side em
Postgres (revogação imediata) + cookie HttpOnly/SameSite=Lax/Secure emitido pelo hub. Gatilhos
nomeados: magic link/OTP quando houver SMTP operacional por outro motivo; passkey por pedido
explícito/compliance; self-signup = fase 2 (C-001).

## Q2 — Reconciliação PUB-2 × C-012 §17

**Fatos.** PUB-2 (MVP, ratificado): "auth em origem separada (app nunca vê senha); token no
fragment, limpo; refresh token (não iframe)". C-012 §17 (posterior, normativa): cookie HttpOnly do
hub, zero token no browser, runtime = BFF.

**Confronto.** PUB-2 é piso extraído da arquitetura Mitra (apps em origem própria). No Conexus o
app publicado é servido pela origem do hub; a página de login é rota do hub, não do bundle do app —
o espírito de PUB-2 ("app nunca vê senha") é PRESERVADO: o bundle gerado nunca renderiza campo de
senha nem toca credencial; o hub (código de plataforma) faz o login. Token no fragment e refresh
token tornam-se não-aplicáveis enquanto houver uma só origem.

**Posição preliminar.** Reinterpretação registrada (precedente HAR-5): PUB-2 lê-se como "credencial
nunca passa pelo código gerado; sessão nunca em URL/localStorage". Mecanismo concreto F1 = login
como rota de plataforma do hub + cookie HttpOnly. Se um dia apps forem servidos em origem própria
(gatilho: ingress público/multi-hostname do C-012 §16), o desenho Mitra B (origem separada + token
fragment + refresh token) volta a ser o piso.

## Q3 — RBAC do app (PUB-3) sob a invariante de audiência

**Fatos (Mitra).** Camada B: RBAC 5 eixos, leitura ≠ escrita, escopado por conexão, administrável
via SDK, `homeScreenId` por perfil. Camada A: NUNCA medido — sonda rodou como operador solo; token
de preview carregava papel CREATOR; a proteção GET-only era código cravado, não permissão de
plataforma (OBS-73.3).

**Fatos (mercado).** Granularidade real dominante = app-level roles (admin/editor/viewer) +
visibilidade condicional; row/field-level é aproximação ou enterprise. Anti-padrão documentado em
apps gerados por LLM: CVE-2025-48757 — 170+ apps Lovable com tabelas legíveis sem auth porque o
agente gera schema sem policies; conclusão dos analistas: scaffolding não infere "quem vê o quê".
Outros erros: permissão só no frontend, service-key no cliente.

**Confronto.** A arquitetura Conexus já neutraliza a classe do CVE (queries/actions server-side,
credencial nunca no cliente). O que o agente PODE gerar com segurança é **declaração** (manifesto:
"esta action exige role X"); o **enforcement** é código de plataforma do hub, fixo, não-gerado.
Leitura ≠ escrita já tem mecânica congelada por KIND (`{proj}_query` × `{proj}_action`). A
invariante de audiência proíbe segundo grupo de permissão com enforcement de DADOS distinto sem
disparar RC-1.

**Posição preliminar.** F1: roles nomeados POR APP declarados no manifesto do deployment (dado, não
código), refletidos em `ViewerContext.roles`; hub/Gateway é o único enforcement point, checando
role exigida em cada `execute()` (deny-by-default: action sem role declarada = só admin); UI
condicional = cortesia de UX (presentation policy C-012). Interpretação da invariante: roles que
regulam ACESSO A ARTEFATOS (quem chama qual action/query, home por perfil) cabem na audiência
única; roles que exigem particionar DADOS (carteira por vendedor, RLS) disparam RC-1 — fronteira
declarada no doc de decisão. "Administrável via SDK" (PUB-3) NÃO cria superfície administrativa no
SDK runtime (`execute` only, C-005): administração de roles = plano do hub/registro. Filtro por
usuário pontual ("vendedor vê só seus pedidos") = `WHERE` parametrizado com `userId` da sessão
injetado pelo hub, caso a caso — não framework.

## Q4 — Viewer no Gateway e shape do ViewerContext

**Fatos.** C-010 comp.3: autoridade efetiva do agente interativo = autoridade do usuário ∩
allowlist ∩ policies — sem mecânica definida para "autoridade do usuário". C-012 §12:
`runtimeContractDigest` exclui autorização (mudar permissão ≠ novo contrato).

**Posição preliminar.** `ViewerContext` F1 = `{ userId, displayName, roles: string[] }` —
capabilities computadas derivam de roles × manifesto, não viajam soltas. O Gateway resolve
`userId → roles` server-side pela sessão (nunca do browser) e aplica o ∩ da C-010. RBAC de trace
(C-013 §19): F1 = trace visível só para o operador (role de plataforma), usuários finais não veem
Run Timeline; refinamento fica para quando houver segundo perfil real.

## Q5 — Embed

**Fatos (Mitra).** Chat-embed 100% camada B: handshake por estado `loaded→init→ready→open→opened`,
modos push/overlay/full por razão, `window.__mitraChat`; defeito: `postMessage` com
`targetOrigin:"*"` (REJECT S3). Achado de bundle: a própria Mitra roda embarcada na Sankhya
(`bkApiUrl`/`skwVersion` por query param) — canal de distribuição, nunca medido.

**Fatos (mercado).** Chrome manteve third-party cookies (reversão out/2025), mas Safari/Firefox/
Brave bloqueiam; o que funciona cross-browser em iframe: CHIPS (`Partitioned`, baseline dez/2025),
Storage Access API, ou token curto na URL trocado por cookie particionado (padrão Retool Embed).
Controle de enquadramento moderno = CSP `frame-ancestors` com allowlist (X-Frame-Options legado).

**Confronto.** Embed é caro (auth cross-origin, sessão particionada, debugging por browser) e o
valor F1 é baixo — usuário interno abre o link. O caso futuro real é embutir no ERP/portal
(precedente Mitra-na-Sankhya). O desenho de destino já é conhecido e o retrofit é barato porque
toda auth passa pelo hub (embed = segundo caminho de emissão de sessão).

**Posição preliminar.** F1: **não construir embed de app**; `frame-ancestors 'self'` como default
(preview do builder enquadra o app — 'none' quebraria isso; valor é PLATFORM-CONTRACT, mudança =
migration kit C-012 §5). Gatilho nomeado (RC): primeiro pedido real de embed em portal/ERP; desenho
registrado: endpoint de embed com token assinado curto (~60s) emitido pelo hub → troca por cookie
`Partitioned; SameSite=None; Secure` → `frame-ancestors https://portal-especifico`. PUB-4
(chat-embed F1) realiza-se como o chat do próprio app Conexus (C-012 §15, AGT-5) com handshake por
estado e origem explícita no postMessage — o piso Mitra menos o S3; embed do chat em sistema
EXTERNO cai no mesmo gatilho de embed.

## Q6 — Storage de arquivos (PUB-5)

**Fatos (Mitra).** Camada B: S3 multitenant `tenant_{projectId}/ai-files/public/…`, prefixo por
tenant + sufixo único; `/public/` legível sem URL assinada (REJECT S8 → PUB-5). Camada A: upload de
usuário final nunca exercitado; único storage medido foi o serving do próprio app.

**Fatos (mercado).** Consenso de segurança de upload: validar magic bytes (`file-type`), allowlist
de extensões, limite de tamanho, nome gerado pelo servidor (nunca do cliente), fora do docroot,
servir só via controller autenticado com `Content-Disposition`; Node.js apontado como propenso a
erro de configuração. ClamAV = daemon a operar (custo p/ operador solo). R2 free tier 2026 = 10 GB
/ egress zero; MinIO = mais um serviço para 1 pessoa operar.

**Confronto.** O hub já tem CAS por digest para dists — anexo é o MESMO problema: blob imutável
endereçado por SHA-256 + metadados em Postgres. Reusar o padrão elimina decisão nova e a migração
futura de backend (R2) é trivial num CAS. "Público = opt-in assinado" esbarra no serving F1 sem
ingress público (gatilho C-012 §16) — decidir a forma sem antecipar a infra.

**Posição preliminar.** F1: filesystem do hub, layout CAS por SHA-256 (`files/<project>/<digest>`),
metadados no database do projeto (tabela de plataforma: digest, nome original, MIME detectado,
tamanho, uploader `userId`, app, timestamp); upload via superfície de plataforma do hub (não novo
verbo no SDK além do necessário — forma exata a decidir com T12); allowlist curta (pdf, png/jpg,
xlsx/csv, xml), magic bytes, limite ~20 MB, nome do cliente nunca vira path; servir SEMPRE por rota
autenticada do hub com a mesma checagem de role do app (`Content-Disposition: attachment` default;
inline só imagem/PDF validados); privado por padrão — opt-in público assinado = forma decidida
(URL assinada com expiração), ativação atrás do gatilho de ingress público; blobs entram na rotina
de backup C-006; sem ClamAV F1 (gatilho: upload aberto a externos), sem quotas/versionamento/
thumbnail.

## Q7 — Sessão no serving multi-projeto

**Fatos.** Serving é multi-projeto por path na mesma origem (C-012 §16); derivação server-side
(C-005 comp.10); SEG-2 fronteira no servidor.

**Confronto.** Uma origem única com N apps por path implica que XSS num app alcança a origem
inteira — mitigado por CSP estrita congelada, mas é o risco estrutural a validar na externa
(path-scoped cookies não são fronteira de segurança; subdomínio por app exigiria o gatilho
Caddy/hostname).

**Posição preliminar.** F1: sessão ÚNICA do hub (cookie de origem) + autorização POR APP no
Gateway (sessão diz quem; manifesto+roles dizem o quê em cada app). Isolamento adicional por
subdomínio = junto do gatilho de hostname já nomeado na C-012 §16. Pergunta aberta para externa
(risco real de XSS cross-app same-origin com CSP estrita; o que operadores maduros fazem).

---

## Tensões e rotas

| # | Tensão | Rota proposta |
|---|---|---|
| T-1 | PUB-2 (origem separada, token fragment) × C-012 §17 (cookie, BFF mesma origem) | Reinterpretação registrada (padrão HAR-5): espírito preservado — credencial nunca no código gerado, sessão nunca em URL/localStorage; desenho Mitra volta como piso se houver origem própria por app |
| T-2 | PUB-3 (RBAC F1) × invariante de audiência (um grupo de permissão) | Fronteira declarada: roles de ACESSO a artefatos cabem; particionar DADOS por role dispara RC-1 |
| T-3 | PUB-3 "administrável via SDK" × SDK runtime = só `execute` (C-005) | Administração de roles = plano do hub/registro; SDK runtime intocado |
| T-4 | PUB-5 "público = opt-in assinado" × serving F1 sem ingress público | Forma decidida (URL assinada), ativação atrás do gatilho C-012 §16 |
| T-5 | `frame-ancestors` desde 1º deploy × preview do builder enquadra o app | Default `'self'` (não `'none'`); mudança de valor = migration kit |
| T-6 | Autorização por viewer × roles de banco por KIND | Viewer é camada do Gateway ACIMA das roles Postgres; zero role de banco por usuário |
| T-7 | RBAC de trace (C-013 §19) × telemetria nunca autoriza | Trace = visibilidade (operador-only F1), jamais gate |
| T-8 | Auth interativa × `runtimeContractDigest` exclui autorização | Mudança de permissão nunca gera `CLIENT_OUTDATED`; sessão expirada = `SessionBoundary.anonymous`, não erro de contrato |

## Vocabulário

**Reusar:** `SessionBoundary` · `ViewerContext` · `LOCAL_DEVELOPMENT_IDENTITY` · presentation
policy · `CLIENT_OUTDATED` · `RunPreview` · Capability Gateway · `hub_control` ·
`{proj}_query/_action` · RC-1/RC-2 · invariante de audiência · ponteiro CAS · `SERVED_VERIFIED` ·
EnvironmentConformance · `frame-ancestors` · PUB-1..5 · SEG-2 · AGT-5.

**Não reintroduzir:** RBAC client-side como segurança (NÃO-construir C-012 §18) · token em
localStorage/URL (S9 medido, OBS-36/56) · iframe para refresh (PUB-2) · header como fronteira de
tenancy (SEG-2) · "audience"/"tenant binding" (reservados à RC-1) · `PreviewEnvironment` (adiado
C-008) · `targetOrigin:"*"` (REJECT S3) · erro colapsado em vazio (REJECT E1).

## Posições consolidadas (para veredito da externa)

- **P1 — Auth F1**: contas no `hub_control` (UUID estável, uma conta → N apps), provisionadas pelo
  operador, email/senha argon2id, sessão server-side em Postgres + cookie HttpOnly/SameSite=Lax;
  sem self-signup/magic link/passkey (gatilhos nomeados). PUB-2 reinterpretado (T-1).
- **P2 — RBAC F1**: roles por app declarados no manifesto (dado), `ViewerContext.roles`,
  enforcement único no hub/Gateway por `execute()` deny-by-default; UI condicional = cortesia;
  fronteira RC-1 = particionamento de DADOS por role.
- **P3 — Embed**: não construir F1; `frame-ancestors 'self'`; gatilho nomeado com desenho
  registrado (token curto → cookie Partitioned → allowlist); PUB-4 = chat do próprio app
  (piso Mitra − S3).
- **P4 — Storage F1 (PUB-5)**: CAS por SHA-256 no filesystem do hub + metadados no database do
  projeto; magic bytes + allowlist + limite; servir só por rota autenticada com role do app;
  privado por padrão, opt-in assinado atrás do gatilho de ingress; backup junto do C-006.
- **P5 — Sessão multi-app**: sessão única do hub, autorização por app no Gateway; subdomínio por
  app só com o gatilho de hostname.

**Nunca medido na Mitra (declarar como lacuna, não como evidência):** RBAC de usuário final,
chat-embed ao vivo, upload de arquivo — tudo camada B. `allows_public_screen` (tela pública) segue
na fila de investigação da sonda; regime de tela pública NÃO entra em F1 sem decisão própria.
