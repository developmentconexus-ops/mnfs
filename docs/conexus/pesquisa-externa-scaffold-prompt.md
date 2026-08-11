# Prompt de pesquisa externa — scaffold + frontend (tópico 8)

> Copie tudo abaixo da linha e cole no ChatGPT (modo deep research), em chat novo.

---

Estamos projetando o SCAFFOLD e a camada de FRONTEND de uma plataforma que constrói e opera
aplicativos de negócio sobre ERPs usando IA. O agente construtor gera apps React a partir de um
template versionado; a tese do produto é que **engenharia vive no template + gates mecânicos, não
em governança** ("scaffold rico → agente herda decisões"). Pesquise com fontes primárias (docs
oficiais, repos, changelogs, posts de engenharia, benchmarks), cite URL + data de acesso, marque
fato verificado vs inferência sua, diga "não documentado publicamente" quando for o caso. Se
alguma direção nossa parecer errada, critique com evidência — preferimos correção a confirmação.

## Contexto (decisões já tomadas — são premissas, não estão em debate)

- Hub orquestrador próprio Node/TS + Postgres + pg-boss no PC do operador (fase 1). Operador
  solo, custo de infra ~US$0, inferência BYOK. Anti-overengineering: capacidade sem consumidor
  nomeado só entra com gatilho real; estrutura de objetivo declarado do produto entra cedo.
- Registro de artefatos git-first (kinds `query`/`action`/`job`/`integration`/`agent`/`brain`),
  artefato = arquivo no repo, deployment atômico com manifesto e digest, rollback de ponteiro.
  Queries/actions têm inputSchema validado e envelope de resposta discriminado.
- Builder roda em microVM (E2B) com git mediado pelo hub; app final lê dados SÓ por queries
  registradas ou por uma tool analítica compilada (nunca SQL livre no cliente).
- Agente de produção embarcável no app (chat), com renderer sanitizado anti-exfiltração.
- Auth/RBAC do app publicado é OUTRO tópico (T12) — aqui só interessa o que o template precisa
  prever como slot/fronteira.
- Já existe um design system pronto (tokens Tailwind v4 + ~20 componentes React) extraído do
  nosso app de referência em produção — inclui componentes de "honestidade de dado" descritos
  abaixo. Não estamos escolhendo linguagem visual; estamos decidindo arquitetura de scaffold.

## Evidência das plataformas de referência (dissecadas, funcionam em produção)

- Plataforma "Mitra" (concorrente que operamos por sonda): scaffold **byte-idêntico** + UI-kit +
  `CLAUDE.md` de plataforma com protocolo de turno rígido + SDK de build privilegiado. Veredito
  medido: scaffold garante o **piso**, não o teto; a qualidade alta vem do protocolo + SDK + docs
  de planejamento relidos como memória. Apps são SPA React + Vite com env injetado
  (`window.__mitraEnv`) e SDK de runtime para chamar as funções registradas.
- Sonda de manutenção na Mitra (14 turnos, 76 observações): as únicas barreiras que reprovaram
  código ruim foram **invariantes mecânicas** (`tsc`, `--noUnusedLocals`, FK do banco); tudo o
  mais dependeu de escolha espontânea do modelo. Conclusão ratificada: manutenção só é corrigida
  POR CLASSE quando uma invariante mecânica reprova; "artefato órfão" (escrito e nunca lido) é o
  detector mais barato de garantia quebrada.
- Nosso app de referência (Marketplace Central, medido no bundle publicado): React SPA, 20 rotas,
  Vite, Tailwind v4, 898 KB de JS; metade das telas são tabelas densas de milhares de linhas
  usadas o dia inteiro (densidade é requisito, não defeito). Regras de produto não negociáveis
  que já viraram componentes: **nenhum número aparece sem fonte + data + sobre quantas linhas**;
  **estado vazio diz por que está vazio** ("0 alertas" ≠ "não conferimos nada"); **amostra
  parcial se declara no topo da tela**; **"não sei / não medido" é estado visual de 1ª classe**;
  **rótulo não pode exagerar** (virou teste automático).

## Requisitos já ratificados

- HAR-5: scaffold versionado **byte-controlado** (template rico → agente herda decisões) com
  escape hatch. MVP.
- HAR-6: engenharia como artefato — padrões vivem no template + gates mecânicos (lint,
  typecheck, teste, benchmark); zero manual de governança. MVP.
- Caso 1 (benchmark): Analisador de Orçamentos sobre Sankhya — app read-only com poucas ações
  aprovadas, tabelas densas, agente embarcado.

## As 10 perguntas

1. **Anatomia do scaffold**: o que as plataformas de app-building por IA (v0, Lovable, Bolt,
   Replit Agent, Base44, Databutton, Create.xyz e afins) colocam no template inicial vs deixam o
   agente gerar do zero; template rico vs mínimo — evidência de que decisões herdadas do
   scaffold seguram qualidade/consistência do código gerado (anti-slop). O que é público sobre
   os system prompts/templates deles.
2. **Versionamento e drift do scaffold**: app nasceu no scaffold v1, plataforma está no v5 — o
   que o mercado faz (nada? codemods? regeneração assistida? nunca atualiza?). Como conciliar
   "byte-controlado" com escape hatch (app que customizou o template). Template como artefato
   versionado com digest; monorepos de template; experiência do shadcn com diffs/updates.
3. **UI-kit — distribuição e propriedade**: modelo shadcn (copy-in, o app é dono do código) vs
   pacote npm versionado vs híbrido — trade-offs para apps GERADOS POR IA que precisam evoluir
   com a plataforma. Como garantir que o agente USE o kit em vez de inventar: lint de imports
   proibidos, registry de componentes com metadata para LLM (o registry.json do shadcn),
   catálogo no prompt. Theming por projeto/empresa sobre tokens (Tailwind v4 `@theme`).
4. **Stack do template**: para app de negócio interno gerado por IA em 2026 — React + Vite SPA
   (nossa base medida) vs Next.js vs TanStack Start; roteador (file-based vs código), estado,
   data-fetching (TanStack Query?), forms, tabela densa performática (milhares de linhas —
   TanStack Table? virtualização?), TypeScript strict, a11y piso, pt-BR/Intl. O que os
   AI-builders usam de fato e por quê.
5. **SDK de runtime no frontend**: shape do cliente para chamar queries/actions registradas
   (`execute(slug, input)` tipado); geração de tipos TS a partir dos schemas do registry
   (codegen: orval/openapi-ts/zod-to-ts — qual padrão); tratamento do envelope de erro
   discriminado; sessão; embed do chat do agente com streaming e sanitização de markdown
   (anti-exfil: quais sanitizações são padrão). 
6. **Gates mecânicos sobre código gerado**: o piso que reprova automaticamente — typecheck
   strict, lint (eslint vs oxlint/biome), detector de código órfão (knip), fronteiras de import
   (dependency-cruiser/eslint-boundaries), testes smoke headless (Playwright), visual regression
   barata, bundle-size budget. O que plataformas de código IA rodam de gate hoje; o que vale
   para operador solo (custo de manutenção do gate em si).
7. **Regras de produto como componente + teste ("honest UI")**: alguém no mercado formaliza
   regras tipo as nossas (número com proveniência, empty state explicado, amostra declarada,
   estado "não medido" de 1ª classe, rótulo não exagera)? Design systems de dados
   (observabilidade, BI, fintech) que tratam proveniência/incerteza como componente. Como
   transformar essas regras em lint/teste mecânico em vez de convenção de prompt.
8. **Publish fase 1 a US$0**: SPA estática servida pelo próprio hub (Node/Caddy) vs
   Vercel/Netlify/Cloudflare Pages free tier — limites reais dos free tiers 2026; deployment
   atômico aplicado a frontend (digest do bundle, troca de ponteiro, rollback); preview privado
   por build (nosso preview é proxy do hub); rota/subdomínio por projeto em rede local +
   eventual exposição.
9. **Fronteira com auth (T12, não decidir aqui)**: o que o template PRECISA prever hoje — slot
   de auth trocável, perfis de visão (supervisor × operação) sem fingir segurança ("login
   demonstrativo" honesto), session em SPA interna. Padrões de "auth slot" em templates.
10. **MVP e faseamento**: scaffold v0 honesto para o caso 1 que não precisa ser jogado fora;
    ordem de construção (template antes do 1º app? extraído do 1º app?); onde times erram
    (design system antes de app real, kit abstrato demais, framework próprio de UI). Gatilhos
    nomeados para o que ficar de fora.

## Formato de resposta

HANDOFF estruturado: resposta por pergunta com fontes; lista "correções à direção de vocês";
proposta de decisão em 1 página (anatomia do scaffold v0 + UI-kit + stack + SDK frontend + gates
+ publish + o que adiar com gatilho). Direto, sem preâmbulo.
