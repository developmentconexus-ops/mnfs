# 10 — Scaffold + frontend (C-012)

> **Decisão C-012, ratificada em 2026-08-11.** Tópico 8 do [backlog](00-TOPICOS.md). Convergência:
> acervo Mitra ([07-padrão](../reference/mitra/07-padrao-de-projeto.md), C-009) + Marketplace
> Central medido + design system extraído + [pesquisa interna 4 varreduras](pesquisa-interna-scaffold.md)
> + deep research externa independente + Codex xhigh 3 rodadas (7,9 → 8,4 → **8,8/10**, barra 8,5).
> Emendas aditivas a C-005, C-010 e C-011 na §16.

## 1. Decisão em uma frase

O Conexus adota um **scaffold frontend versionado e reproduzível** — rico em decisões de
engenharia, pobre em features — cuja materialização é identificada por digest e atestada pelo
hub; o código de aplicação passa a pertencer ao projeto sob um modelo de ownership em 3 classes,
mudanças cross-app viajam por migration kit explícito (propagação silenciosa proibida), as regras
de honestidade de dado viram **tipos + componentes + testes** (não convenção de prompt), e o
primeiro deploy fica bloqueado pelo probe **CX-SCAFFOLD-V0-01**.

## 2. Anatomia — rich infrastructure, feature-light

Nasce no scaffold (o agente NÃO redecide): stack, pastas, routing, server-state, primitivas de
UI, tokens, fronteira do runtime SDK, tipos gerados, contratos de erro/estado, componentes de
honestidade, fronteira do chat embarcado, auth seam, gates, harness de smoke, metadata de
deployment. NÃO nasce no scaffold: features de exemplo, CRUD framework, dashboards fictícios,
abstrações de domínio especulativas.

O agente gera: features, rotas/páginas, composições, colunas/filtros, hooks de feature, uso de
queries/actions registradas, testes de negócio. **Template decide engenharia; agente decide
aplicação.** CLAUDE.md do template carrega diretivas anti-slop (tokens sim, cor crua não) — como
documentação, nunca como única barreira (padrão validado: v0/Lovable operam scan mecânico
pós-geração além do prompt).

## 3. Identidade e atestação

- `scaffold.manifest.json` no app desde o dia 1: id, versão e **digest** do scaffold + versão/
  digest do UI registry + `runtimeContract`. Digest = identidade mecânica (padrão cruft/copier;
  nenhum AI builder grava âncora — sem ela, nenhuma estratégia futura de update existe).
  Não-retrofitável.
- O manifesto no repo **não prova a própria origem** (builder pode editá-lo). Autoridade:
  deployment registra `scaffoldManifestDigest` **calculado pelo hub**; hub compara digests de
  GENERATED/PLATFORM-CONTRACT contra scaffolds/migration kits conhecidos; adulteração = reprova.
- Migration ledger é git-first dentro do manifesto (sobrevive a clone/rebuild); Postgres projeta,
  nunca é autoridade única. APP-OWNED fica fora da atestação — não precisa ser byte-idêntico.
- **Reinterpretação ratificada do HAR-5**: "byte-controlado" = nascimento reproduzível por digest
  + autoridade contínua sobre GENERATED/PLATFORM-CONTRACT — não app eternamente idêntico ao
  template (lição shadcn: escape total → merge manual eterno; lição Expo CNG: zona regenerável +
  customização declarativa concilia).

## 4. Ownership em 3 classes

| Classe | Exemplos | Regra |
|---|---|---|
| GENERATED | `src/generated/*`, `routeTree.gen.ts` | nunca editar; regenerar. Gate `git diff --exit-code` pós-codegen pega stale E edição manual |
| PLATFORM-CONTRACT | runtime client, verify config, deployment manifest, renderer do chat | muda só por migration kit explícito |
| APP-OWNED | rotas, features, componentes copiados, theme overrides | o app é dono; nunca sobrescrito silenciosamente |

`ownership-map` no scaffold: `path/glob + class + sourceDigest + generator/itemId + waivable`.
Invariantes: (1) **classificação total** — arquivo novo em área de infraestrutura sem classe
declarada = falha do ownership-check; nada cai implicitamente em APP-OWNED fora de
`src/features|routes`; (2) PLATFORM-CONTRACT expõe **extension points** APP-OWNED nomeados
(config declarativa, wrappers) — customização fora deles = conflito detectado; (3) item copy-in
carrega `registryItemId + itemDigest + baseDigest` individual (3-way merge futuro sem
framework); (4) **segurança crítica é PLATFORM-CONTRACT não-excepcionável**: renderer/sanitizer
do chat, política anti-exfil, card de aprovação, runtime client, exclusão de identidade fake em
produção.

## 5. Update — migration kit explícito

Kit: `migrationId + fromDigest + toDigest + digest do próprio kit + preconditions/postconditions
mecânicas + paths/classes permitidos + idempotência (ledger) + lockfile diff esperado`. Fluxo:
dry-run → diff → clean apply OU conflito → merge agente/humano → **postconditions rodam de
novo** → full verify; conflito ou verify vermelho = zero promoção. Kit percorre C-008: E2B →
bundle → quarentena → verify no hub. **Propagação automática/silenciosa proibida** (anti-modelo:
Lovable admite design systems não versionados propagando; modelo: Bolt com revision history sem
mutação automática).

Escape hatch rastreável: `scaffoldException { rule, scope/path, reason, introducedAt,
reviewOnUpgrade }` — só quando um gate exigir; sem framework de exceção no v0. Não-excepcionáveis:
tsc, generated integrity, runtime-contract compatibility, renderer seguro, identidade fake em
produção.

## 6. Stack

React + TypeScript + Vite **SPA**. TS strict ampliado: `strict` + `noUncheckedIndexedAccess` +
`exactOptionalPropertyTypes` + `noUnusedLocals` + `noUnusedParameters` (validado pela sonda
C-009). Next.js REJECT MVP (SSR/RSC/SEO sem consumidor; hub já é o backend). TanStack Start
REJECT MVP (full-stack em RC; docs oficiais: quem não precisa de SSR usa Router sozinho — nosso
caso). **TanStack Router file-based**: `routeTree.gen.ts` = GENERATED; search params
tipados/validados = estado de URL para filtro/sort/página de tabela densa; esqueleto de rotas
nasce no template (mitiga desvantagem de corpus). pt-BR: `Intl` nativo com wrappers finos
(`formatMoney`/`formatDate`) — zero lib de i18n.

## 7. Estado e dados no cliente

Três casas, zero libs extras no v0: server state → **TanStack Query**
(`queryOptions({queryKey, queryFn})`); URL state → Router; component state → React. Global-state
manager DEFER (gatilho: estado cross-feature que não é URL nem server cache). Form framework
DEFER (gatilho: primeiro form complexo real; validação de input já é server-side via inputSchema
C-005); scaffold traz Field/Label/ValidationMessage/ActionForm do kit.

Isolamento (obrigatório no template): key factory gerada inclui `runtimeContractDigest` +
`sessionEpoch` opaco; transição de identidade limpa o QueryClient; `RuntimeClientError` preserva
`code/phase/retryable/executionId`; retry só para queries com códigos transitórios allowlisted;
actions exclusivamente via `useMutation` sem retry genérico; `AbortSignal` propagado; toda rota
com filtros usa `validateSearch` — **URL é input não confiável e não concede capacidade**
(filtros/sort/limit permanecem allowlisted no backend).

## 8. Tabela densa

TanStack Table headless com `<table>` semântica (padrão APG sortable-table, não role=grid).
Default F1: **paginada server-side**. Virtualização (TanStack Virtual) só após medida de DOM
real, com fallback não-virtual acessível. Dois eixos independentes: DATA VOLUME → server
pagination/filter/sort via query registrada; DOM VOLUME → virtualização. Dados anteriores durante
troca de filtro = estado "atualizando" explícito, nunca resultado atual.

## 9. UI-kit — registry copy-in com supply chain controlada

- **Copy-in source-owned** (o app é dono; código visível ao agente) via **Registry Conexus
  servido pelo hub**, formato registry-item.json compatível shadcn (CLI 3.0 + MCP — o agente
  descobre/instala componente com ferramenta que já conhece). `@conexus/ui` npm REJECT como
  fundação.
- ~20 componentes existentes (extraídos do Marketplace Central) = registry v0; cada item com
  metadata AI-native: description, useWhen, doNotUseWhen, requires (ex.: métrica requires
  provenance).
- **Supply chain**: CLI e schema PINADOS (nunca `@latest`); item identificado por digest;
  normalização de path + bloqueio de traversal/overwrite; dependências/licenças allowlisted;
  lifecycle/postinstall **proibidos para dependência de registry item** (sem exceção); closure da
  plataforma: exceção allowlisted por `package@version + digest do script`, mudança = reprova;
  install sem credenciais sob egress controlado; fetch mediado pelo hub — token nunca durável no
  E2B (capability efêmera C-008); source closure do item entra no digest do scaffold/UI.
- **Prontidão do kit = condição de probe, não afirmação**: inventário completo no manifest (hoje
  só Button), props de honestidade OBRIGATÓRIAS nos tipos (StatCard.basis,
  SourceStamp.source/readAt, EmptyState.reason — hoje opcionais), migração `.jsx+.d.ts` → `.tsx`,
  `DataTable<T>` genérica sem `row: any`, CSS extraído no build (sem `<style>` runtime).
- Theming: Tailwind v4 `@theme` → CSS variables; base tokens → company theme → project overrides.
  Sem theme engine próprio.

## 10. Enforcement de uso do kit — 4 camadas mecânicas

Prompt sozinho REJECT. (1) Registry context/MCP no contexto do builder; (2)
`noRestrictedImports` — MUI/Ant/Chakra/Mantine proibidos, deep-import de internals proibido; (3)
**type contracts** — componente de métrica exige provenance por tipo (não compila sem); (4)
product-invariant tests. HTML nativo (`<button>`, `<table>`) NÃO banido — primitivas corretas;
só classes com invariante Conexus exigem componente tipado (precedente Atlassian/Primer).

## 11. SDK de runtime — output contract e metadata

- **Gatilho da C-005 acionado**: o SDK frontend é o primeiro consumidor externo de output.
  Emenda aditiva: artefato **exposto ao frontend** exige `outputSchema`; sem ele o artefato
  continua válido, mas output = `unknown` e não alimenta Honest UI tipada (sem exceção).
  AnalyticQuery: output derivado mecanicamente dos membros tipados do EffectiveBrainPlan (C-011).
- **`outputSchema` é autoridade runtime, não só fonte de TypeScript.** Pipeline no Gateway:
  execução → serialização global C-005 → shaping/limites → **validação outputSchema** → cálculo
  de ReadDataMeta → resposta. Output inválido nunca chega ao browser
  (`OUTPUT_CONTRACT_VIOLATION`). Schema descreve a representação SERIALIZADA (decimal/bigint como
  string, timestamp ISO). Subset versionado de JSON Schema: `additionalProperties: false`
  default; keyword não suportada = falha de compilação do artefato; limites de
  profundidade/bytes/linhas; corpus de conformance no probe.
- **Codegen direto do registro** (OpenAPI intermediário REJECT; Zod `fromJSONSchema`
  experimental ≠ fundação): manifest types + mapped types —
  `execute<K extends keyof Inputs>(slug: K, input: Inputs[K]): Promise<RuntimeResult<Outputs[K]>>`.
  `src/generated/` bound ao digest do registro. Envelope wire C-005
  `{executionId, status, error?, output}` **preservado**; `RuntimeResult<T>` = adapter do cliente
  gerado, não segundo contrato de rede; na fronteira do Query, queryFn desembrulha e lança.
- **Metadata separada por natureza (emenda aditiva C-005/C-011)** — `dataMeta` no braço success
  do envelope, **obrigatório condicionalmente** para artefato exposto ao frontend (ausência =
  `OUTPUT_CONTRACT_VIOLATION`):
  - `ReadDataMeta` (query/AnalyticQuery): `provenance: SourceRef` (derivada do
    binding/artefato/Connection PINADOS), `sourceAsOf`, `retrievedAt` (nunca finge ser
    sourceAsOf), `rowCount` (calculado mecanicamente PÓS-shaping, nunca declarado pelo autor),
    `coverage` (união fechada: complete | partial{shown,total?,reasonCode} |
    not_measured{reasonCode}), `healthSummary?`.
  - `ActionReceiptMeta` (action): `receiptId`, `outcome: SUCCEEDED|FAILED|OUTCOME_UNKNOWN`,
    `effectedAt?`, `effectUnits`. Envelope `status: success` + `outcome: FAILED` = "executor
    terminou e produziu receipt de falha", não efeito bem-sucedido.
  - Princípio: **proveniência é dado da resposta; o frontend nunca sintetiza meta.**

## 12. Digests, handshake e ponteiro único

Três digests distintos, sem ciclo:

- `frontendDistDigest` — o bundle.
- `runtimeContractDigest` — hash **estrutural** do conjunto de contratos expostos:
  slugs + inputSchema + outputSchema + IDs/tipos da AnalyticQuery + brainDigest +
  projectBindingDigest + versão de schema/compiler + datasets/membros/tipos expostos.
  **EXCLUI** healthSnapshotDigest, effectiveBrainSliceDigest operacional e autorização de usuário
  — health operacional não pode tornar o contrato volátil (check de assertion não é troca de
  contrato). Os 4 digests do trace C-011 continuam no TRACE.
- `deploymentManifestDigest` — manifesto que referencia os dois (dist embute
  runtimeContractDigest, nunca o manifestDigest).

Handshake: request envia `runtimeContractDigest` como atestação; servidor deriva o deployment
ativo server-side (C-005 inalterada) e compara. Mismatch → `CLIENT_OUTDATED`: action falha
fechada, leitura instrui reload. Membro estruturalmente conhecido mas bloqueado por health →
`CAPABILITY_UNAVAILABLE_HEALTH` (não some do TypeScript). **Ponteiro CAS ÚNICO**: o ponteiro de
deployment C-005 seleciona também o frontendDistDigest — nenhum segundo ponteiro
filesystem/`active`. Assets de deployments anteriores permanecem servíveis durante janela de
rollback/abas abertas (GC por política).

## 13. Honest UI mecanizada

Diferencial autoral confirmado pelas duas pesquisas: nenhum design system público formaliza
proveniência de número de negócio como componente (mercado resolve no pipeline/catálogo —
Tableau badges, dbt freshness). Mecanização em eixos ortogonais (união plana rejeitada):

- **Transporte** — `RequestState<T>`: loading | error{error, previous?} | success{data,
  refreshing}.
- **Qualidade** — vem da resposta (`ReadDataMeta`): completeness × freshness × provenance ×
  healthSummary. `success + partial + stale` é representável.
- **Health C-011 = decisão do runtime**: INVALID/SUSPECT effectful bloqueiam server-side; a UI
  EXIBE o bloqueio, nunca reinterpreta nem rebaixa para banner.

Componentes: métrica exige provenance POR TIPO (TypeScript falha sem); `DataQualityBoundary` de
página materializa SampleBanner automaticamente quando coverage=partial (feature não precisa
lembrar); EmptyState com `reason` obrigatório ("0 alertas" ≠ "não conferimos"); "não medido"
nunca renderiza como 0; vocabulário alinhado a GOV.UK Analysis Function. **"Rótulo não exagera" =
golden product-invariant tests** com fixtures (fixture: sample parcial; forbidden: "Valor total:
R$ 5M") — nunca lint semântico.

## 14. Gates mecânicos

Pipeline `verify` (before-delivery): (1) generated-check (`git diff --exit-code src/generated` +
routeTree) → (2) `tsc --noEmit` (autoridade de tipos) → (3) Biome (lint+format+imports) → (4)
ESLint residual (**só `@tanstack/eslint-plugin-query`** dia 1: exhaustive-deps,
stable-query-client, no-unstable-deps, no-void-query-fn; regra custom autoral só quando regra
repetível justificar; oxlint DEFER — reabre se tempo de lint medido virar problema; nunca 3
linters) → (5) Knip (órfãos — versão industrializada do achado C-009; generated entrypoints
configurados) → (6) product invariants → (7) unit/component → (8) vite build → (9) Playwright
smoke → (10) ARIA snapshots → (11) bundle regression vs baseline CALIBRADO no 1º app (teto
universal REJECT).

Per-turn (leve): generated-check + tsc + Biome + testes direcionados. **Hub decide quando roda o
quê — builder não declara "não precisa".** Falha volta ao agente com log (loop de autocorreção,
padrão v0/Lovable).

Gates de boundary antes do 1º deploy: install com lockfile congelado + toolchain pinado;
ownership/classification check; codegen REPRODUZIDO no hub sobre bundle em quarentena (C-008);
teste de handshake runtimeContractDigest; Playwright contra o `dist` SERVIDO PELO HUB (não Vite
dev); teste negativo server-side (effectful sem aprovação = recusado — card visível não prova
segurança); build de produção FALHA se `LOCAL_DEVELOPMENT_IDENTITY` habilitada; axe scan nas
rotas principais; CSP + headers; fallback SPA só para navegação de documento (asset/API
inexistente = 404, nunca index.html). Visual regression: gate só após ambiente pinado, no hub —
não SaaS. dependency-cruiser DEFER (gatilho: regra de grafo que noRestrictedImports não
expressa).

## 15. Chat embarcado

Fronteira no scaffold, classe PLATFORM-CONTRACT não-excepcionável. Markdown renderer com raw
HTML OFF + sanitização allowlist + **política anti-exfil separada da sanitização XSS** (exfil
via markdown-image documentada; defaults de lib são permissivos — opt-in que não está no
template não existe): imagens externas proibidas por default (ou proxy explícito), links
allowlist restrita ao hub, data-URI off, protocolos allowlist. Shape de transporte AI SDK v5
(POST+SSE, casa com C-010). Lib exata = decisão de build; a política é a decisão.

## 16. Publish F1 e segurança estática

Hub serve `dist/` estático DIRETO (sem Caddy no dia 1 — gatilho: TLS/hostname/multi-app
routing/ingress público). `deployments/<project>/<digest>/dist`; publish = write completo →
verify → troca atômica do ponteiro C-005; rollback = ponteiro de volta. Assets com digest no
nome = `immutable, max-age=1y`; index.html = `no-cache`. Preview = proxy autenticado do hub
(preview privado a US$0 não existe em free tier — hub é a única rota). Cloud futuro (gatilho:
acesso externo): **Cloudflare Workers static assets** (não Pages). Vercel Hobby comercial
REJECT (personal/non-commercial).

Segurança estática desde o 1º deploy (não espera T12): CSP, `nosniff`, `frame-ancestors`,
`Referrer-Policy`, `Permissions-Policy`; path resolution exclusivamente por digest conhecido.
**CSP posição declarada**: `script-src` estrito sem unsafe-inline; `style-src-elem 'self'` (CSS
do kit extraído no build); `style-src-attr 'unsafe-inline'` = concessão explícita e isolada para
style props de layout (largura de coluna, transform de virtualização, CSS vars de tema) — nunca
strings CSS, URLs ou valores não validados derivados de usuário/ERP; valores numéricos tipados,
limitados e convertidos mecanicamente podem controlar layout/dataviz. Probe carrega
tabela+chat+modal+temas com a CSP real e falha em violação de console.

## 17. Auth seam (T12 permanece dono)

(1) `SessionBoundary` — loading/anonymous/authenticated, sem saber COMO; (2) `ViewerContext`
tipado (userId/displayName/roles/capabilities — shape mutável por T12; proíbe
`if (user.email === ...)` espalhado); (3) presentation policy = UX, **frontend RBAC nunca é
boundary de autorização** — autoridade real = hub/Gateway. Sessão F1 = cookie HttpOnly do hub,
zero token no browser (runtime já é BFF: todo dado passa por execute()). Identidade fake de dev =
`LOCAL_DEVELOPMENT_IDENTITY` explícita com banner honesto; build de produção falha com ela
habilitada; nunca descrita como "segurança implementada".

## 18. Faseamento e o que NÃO construir

Ordem (a correta já foi seguida: design system EXTRAÍDO de app real em produção, não inventado
antes): scaffold v0 (kit existente + esqueleto + SDK + gates) → caso 1 GERADO sobre ele → verify
→ benchmark → falhas classificadas: defeito app-specific → corrige app; classe repetível →
candidato scaffold/gate; misuse de design system → candidato registry/componente; trabalho órfão
→ candidato Knip/reachability; violação de honestidade → candidato type/invariant. **Scaffold
v0.1 nasce da evidência** (operacionaliza C-009: correção por classe = harness reprova a
classe). Extração/abstração séria entre 1º e 3º app (rule of three).

NÃO construir agora (gatilhos nomeados): Next/Start/SSR/RSC; global-state lib; form framework;
`@conexus/ui` npm; dependency-cruiser; suite visual massiva; Storybook; router/query/table/
virtualizer próprios; OpenAPI intermediário; Zod-from-JSON-Schema como fundação; Vercel Hobby
comercial; propagação automática de scaffold; overwrite de design system; RBAC client-side como
segurança; theme engine; helpers manuais de i18n; Caddy (gatilho em §16); monorepo de template
(>1 consumidor externo do kit).

## 19. Probe bloqueante CX-SCAFFOLD-V0-01

Bloqueia o 1º deploy do caso 1. O probe é evidência — **nenhuma garantia arquitetural vive só no
probe** (todas normativas nas §§ acima). 12 itens:

1. Kit pronto: inventário real no manifest, `.tsx`, props de honestidade obrigatórias,
   `DataTable<T>`, CSS build-time sob CSP.
2. Scaffold materializado por digest; ownership-map com classificação total validada.
3. Codegen do registro reproduzido no hub byte-idêntico.
4. Caso 1 GERADO pelo builder sobre o scaffold.
5. Verify completo verde contra o `dist` servido pelo hub.
6. Gates negativos: `CLIENT_OUTDATED`; effectful sem aprovação recusado server-side; prod build
   com identidade fake falha; 404 de asset; axe; CSP real sem violação de console.
7. Benchmark de produto: tabela densa funciona; filtros na URL sobrevivem refresh;
   loading ≠ empty ≠ error; partial declarado; KPI com proveniência; unknown ≠ 0; chat
   sanitizado.
8. Falhas classificadas → candidatos v0.1.
9. Conformance de outputSchema/DataMeta (corpus §11).
10. Health muda SEM alterar `runtimeContractDigest`.
11. Adulteração do `scaffold.manifest.json` reprova.
12. Fluxo acessível por teclado: filtros/tabela; abrir/fechar chat; foco inicial + trap +
    restauração no modal de aprovação; foco visível; viewport estreito/zoom;
    `prefers-reduced-motion`; streaming sem flood de `aria-live`.

## 20. Emendas a decisões anteriores

- **C-005** (aditiva): (a) gatilho de outputSchema acionado — artefato exposto ao frontend exige
  `outputSchema` validado em runtime no Gateway (§11); (b) `dataMeta?` no braço success do
  envelope, obrigatório condicionalmente (ReadDataMeta × ActionReceiptMeta); (c) o ponteiro de
  deployment seleciona também o `frontendDistDigest` (ponteiro único, §12).
- **C-010**: renderer do chat, política anti-exfil e card de aprovação = PLATFORM-CONTRACT
  não-excepcionável no scaffold (§4/§15). `execute(slug,input)` no app OK; proibido oferecê-lo
  genericamente ao LLM.
- **C-011**: contrato do browser usa digest ESTRUTURAL (brainDigest + projectBindingDigest +
  versões + membros expostos) — health operacional fora do `runtimeContractDigest`; health
  permanece gate server-side com `CAPABILITY_UNAVAILABLE_HEALTH`; os 4 digests do trace intactos
  (§12).
- **HAR-5**: reinterpretado (§3) — byte-controle = nascimento reproduzível + autoridade sobre
  GENERATED/PLATFORM-CONTRACT, com escape hatch rastreável por exceção (§5).

## 21. Nota de convergência

Interna (4 varreduras) e externa convergiram em ~85% de forma independente; externa fechou o
router e refinou ownership para 3 classes; interna corrigiu a externa em Cloudflare
(Workers static assets, não Pages). Codex xhigh: r1 7,9 (10 findings — 3 contratos centrais
abertos: output contract, digests/ponteiro, prontidão do kit), r2 8,4 (4 fechamentos textuais),
r3 **8,8/10** — "não falta decisão arquitetural material para ratificação; o que falta é
evidência de implementação: o primeiro deploy permanece corretamente bloqueado até os 12 itens
do CX-SCAFFOLD-V0-01 passarem".
