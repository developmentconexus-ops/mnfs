# C-015 — Runtime publicado: Auth/RBAC, embed, storage

> **Decisão em 1 frase:** o app publicado autentica por conta central do hub (sessão server-side +
> cookie HttpOnly, zero token no browser), autoriza por membership e roles fechadas compiladas
> fail-closed no manifesto (widening = evidência obrigatória do gate de promote), não embeda nem
> expõe rota pública em F1, e anexa arquivos num CAS por SHA-256 com autoridade inteira no
> `hub_control` — tudo servindo na mesma origem declarada como uma única zona de confiança.

Ratificada em 2026-08-12. Profundidade rasa (forma agora, aprofunda no build). Convergência
adversarial: 8,2 → 8,4 → 8,4 → 8,1 → **8,7/10** (5 rodadas; nota final: "D1 e D2 fecham a última
fronteira ACID/snapshot sem contradizer C-005, C-006, C-008 ou C-013").

Fontes: pesquisa interna ([pesquisa-interna-runtime-publicado.md](pesquisa-interna-runtime-publicado.md)),
pesquisa externa (IETF draft-ietf-oauth-browser-based-apps-26, NIST SP 800-63-4 final, OWASP
Session/Password/File-Upload, CVE-2025-48757 Lovable, CVE-2024-42056 Retool, CVE-2026-24042
Appsmith, CVE-2026-35216 Budibase, PostgreSQL 17 RLS, MDN CHIPS, SEFAZ MG/SP), sonda Mitra C-009
(S9 = OBS-36/56).

---

## 1. Identidade: conta central + membership

- Conta de usuário final vive no `hub_control`: `account_id` UUID estável (uma conta → N apps;
  identidade nunca é email-string), `login_identifier`, `display_name`,
  status `ACTIVE | SUSPENDED | DISABLED`, `password_hash` + `password_hash_version`,
  `created_by/created_at/disabled_at`.
- Provisão pelo operador: cria conta → **setup credential aleatória de uso único** entregue por
  canal separado → troca obrigatória no primeiro login → credencial de setup morre. Sem
  self-signup em F1 (C-001: fase 2).
- Reset administrativo = token temporário de uso único com expiração curta; **revoga todas as
  sessões**; exige nova senha; registra operador/horário/motivo. `DISABLE` ⇒ revoga todas as
  sessões (offboarding é o ponto onde auth de operador solo quebra primeiro — evidência externa).
- **`ProjectMembership`**: `account_id × project_id → role (admin | member)` + status, no
  `hub_control`. Sessão diz QUEM; membership diz ONDE e COM QUAL role. Ordem de decisão em toda
  request de app: (1) hub deriva `projectId/appId` do serving path server-side (C-005 comp.10 —
  nunca do payload; payload adulterado = ignorado e registrado); (2) resolve membership — ausente
  ⇒ deny com 404 indistinguível; (3) só então aplica roles × policy compilada. Roles são POR
  PROJETO via membership, nunca globais.

## 2. Credencial

Email/senha conforme NIST SP 800-63-4: mínimo 15 caracteres, suporte a ≥64, frases com espaço
aceitas, blocklist de senhas comprometidas/comuns, SEM regras de composição, SEM rotação
periódica. Armazenamento Argon2id (piso OWASP: 19 MiB / t=2 / p=1, benchmarkado no hardware do
hub) com parâmetros versionados no registro. Rate limit por conta/origem/instalação. Resposta
indistinguível entre conta inexistente e senha errada.

Gatilhos nomeados (não construir antes): **SMTP/magic link** — resets recorrentes (~2–3/mês),
recuperação remota/fora de horário, usuário externo; **passkeys** — TLS+hostname E requisito
anti-phishing/usuário privilegiado; **SSO/SCIM** — diretório corporativo vira fonte de verdade do
funcionário ou cliente exige.

## 3. Sessão

- Server-side em Postgres (`hub_control`): armazena **HASH** do session_id (nunca valor bruto),
  `account_id`, `created_at`, `last_seen_at`, `idle_expires_at`, `absolute_expires_at`,
  `revoked_at`, `auth_version`.
- Cookie opaco: `HttpOnly; SameSite=Strict; Path=/`, sem `Domain`. Com TLS (gatilho):
  `__Host-cx_session=…; Secure; HttpOnly; SameSite=Strict; Path=/`.
- Rotação de session_id em login, reset e mudança material de privilégio. `Origin` +
  `Sec-Fetch-Site` verificados em métodos mutantes (defesa de app; a trava de rede é o bind, §5).
- **Zero JWT browser-side; zero token em URL/localStorage/fragment** (anti-S9 Mitra: JWT CREATOR
  de ~27 anos em URL→localStorage, OBS-36/56). Sessão expirada = `SessionBoundary.anonymous`
  (C-012 §17) com mensagem — nunca erro colapsado em vazio (REJECT E1), nunca `CLIENT_OUTDATED`.

## 4. Trust zone declarada

F1: todos os apps servidos na MESMA origem por path = **uma única zona de confiança de código
browser**. Isolamento por app é autorização de domínio, não isolamento de origem: XSS num app
opera outro app com os poderes do usuário (HttpOnly impede ler o cookie, não fazer request
autenticado; `Path` de cookie não é fronteira). CSP estrita (C-012 §16) reduz probabilidade de
execução injetada, não o blast radius pós-execução. Invariante declarada do serving, exibida como
tal no desenho — não é um bug a corrigir depois, é o custo aceito da topologia F1.

Gatilhos de **subdomínio por app** (ampliam o gatilho hostname C-012 §16): app carrega JS de
terceiros; classes de confiança distintas entre apps; primeiro app público/embeddable; requisito
explícito de que comprometimento do frontend A não alcance B.

## 5. Binding de exposição

Default de bind F1 = **loopback apenas**. Tailnet = opt-in EXPLÍCITO de configuração (config
contract C-012/C-014), com banner persistente de contexto não-seguro e registro do opt-in como
`agent_event`. Verificação no boot: bind em interface pública/roteável sem TLS ⇒ **hub recusa
subir (fail-closed)**. Sem secure context não existem passkeys nem cookies `Partitioned` — mais
uma razão do gatilho TLS. HTTP plaintext é limitação aceita de F1, nunca estado final.

## 6. RBAC: roles fechadas + ViewerContext

- Conjunto FECHADO de roles de plataforma F1: **`{admin, member}`**. O agente construtor NÃO
  inventa roles — apenas mapeia actions/queries a esse conjunto. Abertura do conjunto = decisão
  futura (gatilho: primeiro caso real que 2 roles não expressam), nunca deriva de geração.
- `ViewerContext = { userId, displayName, roles, capabilities }` — fecha o shape deixado mutável
  pela C-012 §17. `capabilities` são DERIVADAS server-side (roles × policy compilada do
  deployment), read-only, nunca aceitas do cliente. Presentation policy consome `capabilities`
  (C-012 intacta); roles viajam para exibição, não como fonte da UI condicional.
- Home por perfil (PUB-3) = presentation policy resolvida por role.
- RBAC de trace (delegação C-013 §19): F1 = trace/Run Timeline visíveis SÓ ao operador (role de
  plataforma do hub); usuário final de app nunca vê; refinamento adiado até segundo perfil real.

## 7. Manifesto de permissões: compilação fail-closed

Por action/query no manifesto do deployment: `allowed_roles`, `admin_only` explícito quando for o
caso. Regra central (correção material da pesquisa externa, aceita integralmente):

> **Action sem `allowed_roles` = `MANIFEST_INVALID` ⇒ candidate `REJECTED` (plano candidate
> C-014). NUNCA default "só admin"** — default otimista mascara omissão do agente e transforma
> campo esquecido em capacidade real. Autorização é propriedade mecânica do runtime, não
> disciplina de prompt.

- `allowed_roles` é camada **ADITIVA**: não redefine `effects`/`approvalFloor`/`agentEligible`/
  sensibilidade — essas classificações continuam vindas do registro (C-005/C-007/C-010) e entram
  compiladas na policy. Decisão efetiva = interseção (role permitida ∧ classificações do artefato
  respeitadas; approvalFloor exige aprovação humana independente de role).
- Erros de compilação: role desconhecida; regra órfã; action inexistente; conflito
  `admin_only: true` × `allowed_roles` com member; tentativa de rebaixar approvalFloor ou alargar
  effects via manifesto de permissões; referência a classificação inexistente.
- Teste positivo + negativo por action na verificação do candidate.
- Policy compilada amarrada ao `releaseManifestDigest` (C-014 — composição via manifesto do
  deployment).

## 8. Permission diff no promote (melhor-que-mercado)

Diff semântico release atual × candidata, computado mecanicamente. **Widening** (role adicionada a
action; `admin_only` → member; READ → WRITE; redução de approvalFloor; tool/action virando
`agentEligible`; ampliação de escopo) = **evidência OBRIGATÓRIA exibida no gate humano de promote**
(C-014 — o gate humano F1 já existe; o diff é insumo apresentado, não estado novo da máquina).
Promote sem exibir o diff = bloqueado. Narrowing = anotado, segue fluxo normal. Nenhuma plataforma
de mercado documenta diff semântico de poder efetivo pré-promote — este é o ponto onde o Conexus
supera, não iguala: *o agente propõe permissões; a plataforma mostra e compara o poder efetivo da
release antes de promovê-la.*

## 9. Authority × audience

Dimensões separadas: role responde "o que pode fazer"; audience responde "sobre quais dados". F1
tem UMA audiência (invariante C-006 comp.11 intacta). "Vendedor vê sua carteira" = `WHERE`
parametrizado com valor derivado da IDENTIDADE, injetado pelo hub server-side (nunca aceito do
browser) — caso a caso, não framework. Particionamento sistemático de dados por identidade/tenant
= RC-1 (inalterada). Quando RC-1 disparar, RLS entra como defesa ADICIONAL — nunca substitui bind
params + filtro no hub (caveats BYPASSRLS/owner/pooling do Postgres reconhecidos). Field-level =
gatilho próprio (mesmas linhas, colunas sensíveis distintas por usuário); antes de policy engine:
projections/views/output schemas.

## 10. Enforcement único

Hub/Gateway é o único ponto: `execute()` checa sessão → membership → roles → policy compilada;
deny em role/action desconhecida. UI condicional = presentation policy (C-012), cortesia de UX,
nunca controle. Mudança de permissão NUNCA gera `CLIENT_OUTDATED` (C-012 §12 — contrato estrutural
exclui autorização). Administração de contas/membership/roles = rotas de plataforma do hub —
NUNCA superfície nova no SDK runtime do app (`execute` only, C-005); o "administrável via SDK" do
PUB-3 lê-se como SDK administrativo do HUB.

## 11. Embed

- **F1: não construir embed de app.** `frame-ancestors 'self'` (preview do builder enquadra o app;
  mudança de valor = migration kit C-012 §5).
- Gatilho: consumidor NOMEADO (portal/ERP — precedente: a própria Mitra roda embarcada na Sankhya,
  OBS-31.6/67.5) + TLS + origens exatas + owner de lifecycle.
- Desenho registrado para o gatilho: portal autenticado solicita **código de troca de uso único**
  ao hub (opaco, registrado server-side, audience = app específico, portal_origin exata, nonce,
  expiração ~60s) → iframe abre URL com código → hub troca por cookie
  `__Host-…; Secure; HttpOnly; SameSite=None; Partitioned` → `303` limpa a URL → `postMessage` com
  targetOrigin exato e mensagens tipadas (REJECT S3 mantido). **Nunca bearer durável em URL**
  (leak por referrer/logs/histórico). Bootstrap com `Referrer-Policy: no-referrer` +
  `Cache-Control: no-store`. Storage Access API só se surgir necessidade de sessão NÃO
  particionada.
- PUB-4 (chat-embed F1) = chat do próprio app Conexus (C-012 §15, AGT-5) com handshake por estado
  (`loaded→init→ready→opened`) — piso Mitra menos S3. Embed EXTERNO do chat = mesmo gatilho.

## 12. Rota pública

NÃO existe em F1 — usuário externo = gatilho RC-1 já congelado (C-005 comp.13). Desenho registrado
para quando disparar: **dupla declaração** — classe de acesso por rota
(`AUTHENTICATED | PUBLIC_FORM | PUBLIC_TOKEN`) × `publicEligible` por capability (default
`false`); compilador reprova rota pública que alcança capability não pública (lição
CVE-2026-24042 Appsmith e CVE-2026-35216 Budibase: surface pública alcançando capability
perigosa). Flag única "app público" = REJEITADA. Primeiro público preferencialmente em
origem/router separados, sem cookie da sessão interna.

## 13. Storage de anexos (PUB-5)

### Modelo
- Blobs: CAS por SHA-256 no filesystem do hub (`blobs/sha256/aa/<digest>`), imutáveis, dedup
  global PERMITIDA.
- Identidade de ACESSO = `attachment_id` UUID opaco por projeto. **Digest nunca é credencial nem
  rota** (`GET /blob/<sha256>` proibido; API jamais confirma existência por digest; authz antes do
  lookup; dedup não observável por timing).
- **Autoridade de attachment inteira no `hub_control`** (mesmo database do registro de blobs):
  attachment (id, project_id, blob_digest, nome sanitizado, MIME declarado+detectado, size,
  status, lease, uploader, retention_class) + registro de blob
  (state `ACTIVE|QUARANTINED`, refcount, generation). Consequência: inserir attachment +
  incrementar refcount + `state=ACTIVE` = UMA transação ACID local; escritor único = hub (C-000).
  O database do projeto NUNCA guarda autoridade: linhas de negócio carregam `attachment_id` como
  VALOR OPACO (dado, não FK); resolução/serving = rota de plataforma (isolamento de roles C-006
  intacto — `{proj}_query` não conecta ao hub_control). Projeção de leitura no projeto = não
  construir (gatilho: primeira query de negócio que precise juntar metadados server-side).

### Pipeline de upload
1. Autenticação + membership + role.
2. **Reserva atômica de capacidade** antes do stream: tamanho declarado obrigatório
   (`Content-Length` ou campo do protocolo) contra orçamento agregado (global + projeto + conta);
   sem tamanho declarado ou inconsistente com o stream real ⇒ rejeição fail-closed, reserva
   liberada; chunked sem tamanho total = não suportado F1. Low-disk watermark avaliado sobre
   `livre − reservas ativas`.
3. Stream com limite aplicado durante; SHA-256 computado no caminho.
4. Allowlist curta (pdf, png/jpg, xlsx/csv, xml) + magic bytes (`file-type` = best effort, não
   prova) + limites POR CLASSE (XML fiscal menor; imagem/PDF/Office moderado; archive NÃO
   suportado F1). XML: parser com DTD/entidades externas DESABILITADAS, root/namespace esperado,
   bytes originais preservados.
5. fsync + atomic rename → metadata `PENDING → AVAILABLE` por compare-and-set.
6. `PENDING` carrega `lease_expires_at` renovado pelo stream (heartbeat); reconciler idempotente
   só coleta lease EXPIRADO; corrida PENDING→AVAILABLE × cleanup impossível por CAS de status.

### Higiene de nome
`original_filename` é DADO, nunca header: sanitização na entrada (CR/LF/controles/separadores
removidos, Unicode NFC, truncado, extensão coerente com tipo DETECTADO); emissão via RFC 6266/5987
(`filename*` + fallback ASCII). Nome físico = digest, nunca o nome do cliente.

### Download
Só por rota autenticada do hub com checagem de membership + role do app dono.
`Content-Disposition: attachment` + `X-Content-Type-Options: nosniff` por padrão; inline só
imagem/PDF validados; html/svg/executável nunca inline. Opt-in público = URL assinada com
expiração — **forma decidida, ativação atrás do gatilho de ingress público/TLS** (emenda PUB-5).

### GC em duas fases (sem corrida)
- Fase 1: blob com `refcount=0` ⇒ QUARENTENA via CAS
  (`WHERE digest=X AND refcount=0 AND generation=G`; `generation+1`).
- Commit de referência nova = mesma transação do attachment: `refcount+1` E `state=ACTIVE`
  incondicional (reativa se quarentenado), `generation+1`.
- Fase 2 (remoção física): só após janela de quarentena > intervalo máximo entre backups
  bem-sucedidos, com re-verificação final por CAS na geração observada — upload que reativou no
  intervalo muda a geração e a remoção aborta. Nenhuma janela em que blob referenciado é removível.

### Limites sistêmicos (obrigatórios F1)
Tamanho máximo por classe; concorrência de uploads; low-disk watermark com recusa fail-closed;
métricas de bytes/contagem (C-013). Sem quota COMERCIAL F1 (gatilho: abuso/cobrança/alocação por
cliente).

## 14. Backup e restore (emenda C-006 comp.7)

Sequência normatizada: (1) lock de geração do GC (pausa quarentena→remoção e remoções físicas);
(2) dump do **`hub_control` PRIMEIRO** (autoridade de contas, memberships, bindings, attachments,
blobs); (3) dumps de todos os databases de projeto — enumeração canônica extraída do dump do
hub_control recém-feito (coerência índice × conteúdo); (4) cópia dos blobs + **manifesto de
integridade** (digest → size, cardinalidade, checksums de todos os dumps); (5) libera lock.

Garantia: todo `AVAILABLE` no dump do hub_control tem blob presente na cópia (remoção física
pausada + quarentena cobre a janela). O grafo de referências é single-database ⇒ dump do
hub_control é snapshot consistente por si; mutações durante o backup não exigem lock nem journal —
referência pós-dump é apenas mais nova que o ponto de restore. Caso residual declarado: linha de
negócio referenciando `attachment_id` criado após o dump ⇒ no restore, "attachment indisponível"
— degradação explícita e segura (anexo é dado, nunca invariante de integridade), exibida como tal
(nunca E1).

**Restore-test** valida o manifesto INTEIRO: (a) cardinalidade == blobs restaurados; (b) todo item
presente com size conferido; (c) cruzamento completo attachments (hub_control restaurado como
índice) × manifesto × filesystem; (d) SHA-256 recomputado em amostra = prova adicional, nunca a
única; (e) id órfão sintético ⇒ "indisponível", nunca 500 nem blob de outro projeto. Divergência
em (a)–(c) ⇒ backup FAIL, alarme.

## 15. Fiscal (contexto Sankhya/NF-e)

Sankhya = repositório fiscal AUTORITATIVO em F1. XML de NF-e no Conexus = cache
`NON_AUTHORITATIVE` com referência (chave de acesso, protocolo de autorização,
`source_retrieved_at`). CAS prova integridade de BYTES; autenticidade fiscal vem da assinatura
ICP-Brasil + protocolo de autorização — dimensões distintas. Conexus como arquivo fiscal =
decisão FUTURA própria com validação contábil/jurídica; `retention_class FISCAL_NFE` reservada
(bytes exatos sem reserialização, imutável, offsite, hold, prazo decadencial). Verificação
operacional pendente (fila): Sankhya conserva/exporta o XML original e cobre o prazo legal.

## 16. Emendas registradas

| Alvo | Emenda |
|---|---|
| C-003 (PUB-2) | Reescrito: "Credencial nunca passa pelo código gerado; sessão nunca em URL/localStorage/fragment; F1 = BFF same-origin com cookie HttpOnly emitido pelo hub (login é rota de plataforma, não bundle). Se apps ganharem origem própria (gatilho hostname C-012 §16), o desenho origem-separada + token efêmero + refresh token torna-se o piso obrigatório." Aceite: probe (a)–(c) + grep mecânico de credencial/sessão no dist. |
| C-003 (PUB-5) | Reescrito: "Storage privado por padrão, escopado por projeto, servido só por rota autenticada (MVP). Acesso público = URL assinada com expiração, ativação atrás do gatilho de ingress público/TLS — forma decidida agora, implementação junto do gatilho." Racional: sem TLS/hostname não existe URL pública íntegra; assinatura antes do ingress = código morto (C-000). |
| C-006 comp.7 | Backup mecanizado: dois conjuntos (dumps + blobs) + manifesto de integridade + restore-test conjunto (§14). |
| C-012 §17 | Shape do `ViewerContext` fechado: `{userId, displayName, roles, capabilities}` com capabilities derivadas. |
| C-014 (promote) | Permission diff = evidência obrigatória do gate humano de promote (sem novo estado da máquina). |
| PUB-3 | "Administrável via SDK" reinterpretado: SDK administrativo do HUB (rotas de plataforma), nunca superfície no SDK runtime do app. |

## 17. O que NÃO construir em F1 (gatilhos objetivos)

| Não construir | Gatilho de reabertura |
|---|---|
| Self-signup | primeiro usuário não provisionado previamente pelo operador |
| SMTP/magic link | resets recorrentes (~2–3/mês), recuperação remota, usuário externo |
| Passkeys | TLS+hostname E anti-phishing/usuário privilegiado/custo real de senha |
| SSO/SCIM | diretório corporativo governa admissão/desligamento, ou cliente exige |
| Subdomínio por app | JS de terceiros; classes de confiança distintas; app público/embed; requisito de isolamento entre apps |
| RLS | múltiplas audiências/tenants na mesma tabela; caminho de leitura fora do hub; incidente de WHERE ausente |
| Field-level permissions | mesmas linhas, colunas sensíveis distintas por usuário |
| Embed | consumidor nomeado + TLS + origens exatas + owner de lifecycle |
| Rota pública | usuário externo (= RC-1) + ingress/TLS + responsável por abuso |
| ClamAV | uploader não confiável; ingress público; Office/archive redistribuído; parsing/conversão server-side |
| Object storage (R2/MinIO) | segundo hub; disco/backup não atinge RTO; offsite obrigatório |
| Quota comercial | abuso, cobrança ou alocação por cliente |
| Versionamento de anexos | requisito de negócio/fiscal para revisões do mesmo documento |
| Policy engine genérica (OPA/Cedar/OpenFGA) | segundo modelo real de autorização que o compilador estreito não expresse |
| Projeção de attachments no DB do projeto | primeira query de negócio que junte metadados de arquivo server-side |
| Chunked upload sem tamanho | primeiro caso real de tamanho desconhecido (desenho: reserva incremental com tetos) |

## 18. Probe CX-PUB-V0-01 (primeira implementação)

(a) cookie com flags corretas; session_id só como hash no banco;
(b) `DISABLE` ⇒ próxima request de qualquer sessão da conta falha;
(c) reset admin = token uso único que expira + revoga sessões;
(d) action sem `allowed_roles` ⇒ `MANIFEST_INVALID`, candidate `REJECTED`;
(e) widening diff exibido no gate de promote; promote sem diff = bloqueado;
(f) member chamando action admin via fetch direto ⇒ deny server-side;
(g) role desconhecida no manifesto ⇒ erro de compilação;
(h) mudança de permissão não gera `CLIENT_OUTDATED`;
(i) `.exe` renomeado `.pdf` ⇒ rejeitado por magic bytes;
(j) GET por digest direto ⇒ negado; `attachment_id` de outro projeto ⇒ negado;
(k) crash entre blob durável e metadata ⇒ PENDING nunca vira AVAILABLE sozinho; reconciler resolve;
(l) XML com DTD/entidade externa ⇒ rejeitado;
(m) low-disk watermark ⇒ upload recusado fail-closed;
(n) resposta do app com `frame-ancestors 'self'`;
(o) member não vê trace/Run Timeline;
(p) sessão member do projeto A: artefato/attachment/trace/rota admin do projeto B ⇒ deny/404
    indistinguível;
(q) `projectId/appId` adulterado no payload ⇒ ignorado (derivação server-side prevalece),
    tentativa registrada;
(r) conta sem membership no projeto servido ⇒ deny antes de avaliação de role;
(s) bind público sem TLS ⇒ hub recusa subir;
(t) restore-test: manifesto inteiro validado (cardinalidade + presença + size), amostra de digest
    recomputada, id órfão ⇒ "indisponível".

## 19. Vocabulário

Novos termos: `ProjectMembership` · `MANIFEST_INVALID` · permission diff / widening / narrowing ·
`attachment_id` · quarentena de blob (GC duas fases) · setup credential · trust zone declarada ·
`PUBLIC_FORM`/`PUBLIC_TOKEN`/`publicEligible` (reservados ao gatilho RC-1) ·
`retention_class FISCAL_NFE` (reservada). Reusados: `SessionBoundary`, `ViewerContext`,
`hub_control`, RC-1/RC-2, invariante de audiência, `frame-ancestors`, `CLIENT_OUTDATED`,
presentation policy. Rejeitados: token em URL/localStorage (S9), `targetOrigin:"*"` (S3), erro
vazio (E1), flag "app público", digest como rota de acesso, default "action sem role = admin".

## 20. Nota de convergência

5 rodadas adversariais (Codex, xhigh): 8,2 → 8,4 → 8,4 → 8,1 → **8,7 (convergência declarada)**.
Correções materiais incorporadas: membership explícito antes de role; capabilities derivadas
preservadas (C-012 sem emenda de semântica); PUB-2/PUB-5 como emendas formais a C-003;
`allowed_roles` aditivo sobre classificações do registro; backup de blobs mecanizado com
manifesto; reserva atômica de capacidade; reconciler com lease; sanitização RFC 6266; bind
fail-closed; probe cross-projeto; autoridade de attachment unificada no `hub_control` (fronteira
ACID real — transação cross-database não existe); snapshot de backup consistente por
single-database + quarentena.
