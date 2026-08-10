# Tópico 1 — Visão e escopo do produto

**Status: DECIDIDO — ratificado pelo operador em 2026-08-10 ([C-001](DECISOES.md)).**
Insumos: decisões do operador (2026-08-10), 3 pilares de melhoria ditados pelo operador,
referência Mitra completa, acervo MNFS.

## Definição

**Conexus é uma plataforma unificada, AI-first, que constrói e opera aplicativos de negócio
integrados a ERPs — guiada por agente, com conhecimento profundo da empresa do cliente.**

Dentro dela vive o **Conexus Harness**: o motor de desenvolvimento agêntico, herdeiro dos
princípios MNFS (planning-first, evidência antes de decisão, plano visual aprovável) — não do
código do kernel ([C-000](DECISOES.md)).

- **Fase 1 (interna):** o operador usa o Conexus para entregar apps a clientes. Sem self-signup,
  sem billing. Arquitetura já nasce multi-tenant (barato agora, caro depois).
- **Fase 2 (SaaS):** abre como plataforma.

## Os 3 pilares de diferenciação (do operador)

### P1 — Cérebro da empresa (a maior aposta)

Problema real observado: o agente integrado ao Sankhya **descobre** o óbvio (TOP 14 = orçamento é
visível no dado), mas **não sabe** o particular — como a margem é calculada, gasto variável,
suposições, campanhas, procedimentos. Vai errar. A experiência do app Minos provou o valor de
mapear banco + regras semânticas + regras de negócio.

Proposta: a plataforma organiza projetos em **grupos por empresa** (ex.: grupo Metalnobre), e cada
grupo tem um **cérebro** — base de conhecimento estruturada (schema semântico, regras de negócio,
definições canônicas, processos, campanhas) que TODOS os projetos do grupo herdam como contexto.

Mecanismos:
- **Discovery assistido**: sonda roda no banco do ERP, identifica estrutura e padrões, propõe
  mapeamentos, e **pergunta ao humano** o que não dá pra inferir (loop de entrevista).
- **Retroalimentação**: descoberta feita num projeto (ex.: "VLRCUS não é custo em 94,8%") volta
  para o cérebro — o próximo projeto do grupo já nasce sabendo. Na Mitra esse conhecimento morre
  preso no `integracao-sankhya.md` de um projeto.
- Construção incremental — não nasce completo.

Evidência de que é gap real: Mitra tem contexto único por projeto, sem camada empresa
([08 §OWN](../reference/mitra/08-limites-e-gaps.md)); ADR-0004 do MNFS (estratos de memória) já
apontava nessa direção e vira REFERENCE de design.

### P2 — Engenharia embutida no template, não em governança

Questão do operador: quanto da "parte de engenharia" do MNFS o Conexus precisa? Resposta da
evidência Mitra ([07](../reference/mitra/07-padrao-de-projeto.md)): o padrão de código da Mitra não
vem de governança — vem de **scaffold byte-idêntico + CLAUDE.md de plataforma + SDK que restringe o
que é possível**. Engenharia como *artefato versionado*, não como *processo*.

Direção Conexus: padrões de código, arquitetura de referência e qualidade vivem no **template
versionado + gates mecânicos do harness** (lint, typecheck, teste, benchmark). Zero manual de
governança. Avaliação fina no tópico 2/8.

### P3 — AI-first nativo (plataforma que se entende)

- **Consultor de agente da plataforma**: agente que conhece o Conexus (docs, SDKs, padrões) e
  ajuda a construir — melhor que o playground genérico da Mitra ([§31](../research/MITRA-INSPIRATION-MAP.md)).
- **Candidato de framework: Mastra** (TS — agentes, workflows, memória, evals) como camada de
  orquestração da plataforma.
- **Candidato de protocolo: ACP** (Agent Client Protocol) para falar com CLIs de código — Claude
  Code tem adapter ACP; Pi é alternativa. Arquitetura possível: Mastra orquestra agentes de
  plataforma (consultor, discovery, headless); harness de build dirige uma CLI de código via ACP.
- **Nada decidido** — tópico 3 faz o deep-dive (Context7: docs Mastra + ACP + Agent SDK) e
  confronta candidatos.

## Complementos propostos pelo harness (Claude)

- **C1 — Insight → Ação**: agentes headless por evento (cron/webhook) como cidadãos de 1ª classe.
  O app de orçamentos da Mitra *mostra* os R$ 6,2M parados nas 72h; o do Conexus **age** — notifica
  o vendedor, dispara a campanha. Mitra não consegue (WS exige usuário logado — gap catalogado).
- **C2 — Golden benchmark**: o caso 1 (replicar o Analisador de Orçamentos) vira suíte permanente
  de regressão do builder: mesma entrada, comparar saída — contra a Mitra e contra versões
  anteriores do próprio Conexus. Mitra não tem como medir a qualidade do próprio builder.
  (Princípio MNFS de evidência aplicado ao produto; ADR-0011 vira REFERENCE.)
- **C3 — Custo e contexto visíveis**: tokens/custo por turno e por projeto na UI (gap E3 da Mitra).
- **C4 — Cérebro come o próprio dogfood**: o consultor de plataforma (P3) usa o mesmo mecanismo de
  cérebro (P1) apontado para os docs do Conexus — um só sistema de conhecimento, dois usos.

## Caso de uso nº 1

Replicar o **Analisador Inteligente de Orçamentos (Sankhya)** no Conexus. Benchmark perfeito:
espec conhecida, dado real, resultado Mitra documentado seção a seção ([§34](../research/MITRA-INSPIRATION-MAP.md))
para comparação direta.

## O que NÃO é (fase 1)

- Não é SaaS aberto: sem self-signup, sem billing.
- Não é marketplace de apps/plugins.
- Não é mobile nativo — web responsivo.
- Não substitui o ERP — opera sobre ele.
- Não reconstrói a governança MNFS — engenharia vive no template e nos gates (P2).
- Não constrói multi-agent concorrente no MVP (lição C-000: 1 writer por branch; lease core fica
  no acervo se um dia precisar).

## Decisão

Ratificada ([C-001](DECISOES.md)). Pilares P1–P3 + C1–C4 viram requisitos no tópico 2.
Nota do operador na ratificação: Mastra visto como encaixe natural para C1 (central de agentes
com ação); checklist vivo de tarefas na UI (padrão Mitra) avaliado no tópico 13.
