# Prompt de pesquisa externa — cérebro da empresa (tópico 15)

> Copie tudo abaixo da linha e cole no ChatGPT (modo deep research), em chat novo.

---

Estamos projetando o "CÉREBRO DA EMPRESA" de uma plataforma que constrói e opera aplicativos de
negócio sobre ERPs usando IA: uma camada de conhecimento por GRUPO de projetos — schema semântico
+ definições canônicas + regras de negócio + processos — que todos os projetos do grupo herdam
como contexto, alimentando tanto os agentes que CONSTROEM apps quanto os agentes de produção que
vivem DENTRO dos apps. É a aposta mais autoral do produto. Pesquise com fontes primárias (docs
oficiais, specs, repos, benchmarks, papers), cite URL + data de acesso, marque fato verificado vs
inferência sua, diga "não documentado publicamente" quando for o caso. Se alguma direção nossa
parecer errada, critique com evidência — preferimos correção a confirmação.

## Contexto (decisões já tomadas — são premissas, não estão em debate)

- Hub orquestrador próprio Node/TS + Postgres + pg-boss no PC do operador (fase 1). Operador
  solo, custo de infra ~US$0, inferência BYOK. Anti-overengineering: capacidade sem consumidor
  nomeado só entra com gatilho real; estrutura/plumbing de objetivo declarado do produto entra
  cedo enquanto é barato.
- Registro de artefatos git-first (kinds `query`/`action`/`job`/`integration`/`agent`), slug =
  nome, deployment atômico com manifesto e digest; artefato = arquivo no repo.
- Postgres, 1 database por projeto; ETL do ERP (Sankhya, via REST) para o banco do projeto com
  cursor/staging/upsert. Agente de produção lê SÓ queries registradas (SQL livre nunca).
- Agente de produção (decidido agora): contexto em CAMADAS versionadas com digest — plataforma →
  empresa/cérebro → projeto → agente → conversa — com trustClass por camada e taint tracking.
  ContextPack provider-agnóstico montado por nós. Cérebro é READ-ONLY para o agente na fase 1
  (sem self-write); extração de fatos async mediada por review humano é gatilho futuro.
- Gatilho herdado do tópico de agente: "tool analítica tipada" (dimensões/métricas/filtros
  allowlistados compilados para SQL seguro) pertence a ESTE tópico — o cérebro é o dono do
  modelo semântico; o agente é dono de autorização/budget/execução.
- Framework de agente (Mastra/LangGraph) rejeitado como fundação; módulos isolados (ex.: Mastra
  Observational Memory, Apache 2.0) podem ser avaliados individualmente.

## Evidência da plataforma de referência ("Mitra" — dissecada, funciona em produção)

- A Mitra JÁ TEM a metade estrutural de camada semântica, dentro do produto: componente
  `DynamicCubeQuery` + `dimension_store` — dimensão com atributos tipados, função de agregação
  PADRÃO POR ATRIBUTO, chave única, cardinalidade (`allow_linking_multiple_records`), vínculo a
  cubo de destino, aviso de versão na edição. Vocabulário i18n completo = UI real, não código
  morto. Herança do mundo planilha/BI corporativo.
- O que ela NÃO tem: a camada não atravessa projetos (acoplada a conexão/projeto) e não carrega
  regra de negócio nem processo — só estrutura de dado. Nosso diferencial é exatamente esses
  dois pontos, não "ter camada semântica".
- Query do usuário passa por camada de validação com `data_dictionary` e variáveis nativas —
  não é SQL cru.
- Contexto persistente = 2 campos de texto por projeto (instruções adicionais + de negócio)
  concatenados a toda mensagem. Sem versionamento, sem camadas, sem cross-projeto — conhecimento
  descoberto num projeto morre preso nele.
- Injeção inline de schema + convenções no prompt elimina exploração: observamos o agente
  embarcado executar 13 consultas SQL corretas SEM nenhuma exploração prévia do schema.
- Experiência própria anterior (app "Minos" sobre o mesmo ERP): mapear banco + regras semânticas
  + regras de negócio à mão provou valor — ex.: descobrir que o campo `VLRCUS` não é custo
  confiável em 94,8% dos registros. O ERP tem schema opaco legado (tabelas `TGF*`, centenas de
  colunas abreviadas em português).

## A visão (requisitos já ratificados)

- MVP: projetos em grupos por empresa; cérebro v0 = base estruturada EDITÁVEL (schema semântico,
  definições canônicas, regras de negócio, processos, campanhas), seed manual, formato
  versionado; contexto em camadas determinístico.
- Fase seguinte: discovery assistido (sonda roda no banco do ERP, propõe mapeamentos e PERGUNTA
  ao humano o que não infere — loop de entrevista); retroalimentação (descoberta de projeto
  promovida ao cérebro do grupo com review); consultor de plataforma usa o MESMO mecanismo de
  cérebro apontado para os docs da própria plataforma.
- Caso 1 (benchmark): Analisador de Orçamentos sobre Sankhya — perguntas e ações curadas, agente
  read-only + poucas ações aprovadas.

## As 10 perguntas

1. **Forma de representação**: o que exatamente cada semantic layer moderna versiona e quais são
   as primitivas — dbt Semantic Layer/MetricFlow, Cube.dev, LookML, Malloy, AtScale, Snowflake
   Semantic Views/Cortex Analyst (YAML), Databricks metric views, Wren AI (MDL). Entity /
   dimension / measure / metric / join / grain: qual conjunto mínimo. Qual formato aguenta
   melhor (a) geração e edição POR IA, (b) git-first com diff/review humano, (c) consumo por
   LLM em prompt. O que é open-source/embeddable em stack TS+Postgres de operador solo.
2. **Além do schema — regras e processos**: como codificar regra de negócio ("margem se calcula
   assim", "campo X não é confiável", política comercial, campanha, processo operacional) para
   consumo CONFIÁVEL por agente. Ontologias/SBVR/DMN/decision tables × markdown estruturado
   curado × glossário canônico. Evidência sobre o que LLM segue com confiabilidade. Alguém no
   mercado acopla "business rules/process layer" à semantic layer, ou isso não existe como
   produto?
3. **Evidência LLM × semantic layer**: benchmarks/dados de que camada semântica melhora acurácia
   de text-to-SQL e analytics conversacional (Cortex Analyst, Cube AI API, dbt MCP, Wren AI,
   Vanna; Spider 2.0/BIRD com schema linking). Onde semantic layer NÃO ajudou ou atrapalhou.
   Como expõem o modelo semântico ao LLM na prática: MCP server, tool schema, prompt inline —
   e limites de tamanho documentados.
4. **Discovery assistido**: profiling automático de banco legado de ERP (centenas de tabelas
   opacas): ferramentas que inferem FKs implícitas/padrões/joins e propõem mapeamento semântico
   (profilers, dbt codegen, LLM-driven schema discovery — papers e produtos). Padrões de "loop
   de entrevista" (máquina propõe, humano confirma, máquina pergunta o que não infere).
   Experiências documentadas com ERPs reais (SAP/Dynamics/NetSuite têm o mesmo problema do
   Sankhya). O que é realista para operador solo.
5. **Retroalimentação e memória organizacional**: loop "descoberta em projeto → promoção ao
   conhecimento do grupo com review humano" — quem tem isso (data catalogs com stewardship,
   Mastra Observational Memory estado 2026, Letta/Zep/Mem0 em escopo ORGANIZACIONAL, não
   por-usuário). Consolidação, dedup, resolução de conflito, prevenção de poisoning quando a
   fonte é output de agente. O que é maduro vs pesquisa.
6. **Escopo e herança**: org → grupo → projeto: como plataformas modelam herança e override de
   conhecimento/config (LookML projects/refinements, dbt packages, Unity Catalog, workspaces de
   agent builders). Conflito projeto×grupo: quem vence e como se declara. Versionamento por
   camada com digest; invalidação: cérebro mudou → o que acontece com agentes/apps que o herdam
   (re-eval? re-deploy? nada)?
7. **Armazenamento e entrega**: arquivo git-first (kind novo no nosso registro) × tabelas
   Postgres × híbrido — trade-offs para base editável por UI E versionada. Entrega ao agente:
   injeção inline determinística (nossa evidência favorece) × RAG/embeddings × tool de lookup
   sob demanda. Evidência de RAG piorar em corpus pequeno curado; a partir de que tamanho de
   corpus/schema a injeção inline quebra (tokens, custo com prompt caching por camada estável).
8. **Tool analítica tipada**: engine "dimensões/métricas/filtros → SQL seguro": adotar núcleo
   existente (Cube core, MetricFlow, Malloy runtime) × compilador próprio allowlistado sobre as
   nossas queries registradas. Propriedades de segurança exigidas: nunca SQL livre, agregação
   declarada, LIMIT/teto por contrato. Formato de query estruturada para o LLM com evidência de
   taxa de acerto. Custo de manutenção de cada rota para operador solo.
9. **Drift e manutenção**: ERP muda (campo novo, significado muda, processo muda): detecção de
   drift entre cérebro e realidade (re-profiling agendado, asserções tipo "94,8% dos registros
   satisfazem X" re-verificadas como teste). Modos de falha documentados — "semantic layer
   abandonada que mente" — e circuit breakers (stale = camada sai do contexto? avisa?). Custo
   real de manutenção documentado.
10. **MVP e faseamento**: dado tudo acima, qual é o cérebro v0 honesto para fase 1 (seed manual,
    1 grupo, caso 1, agente read-only) que NÃO precisa ser jogado fora quando chegarem
    multi-grupo, discovery assistido, retroalimentação e construtor de agentes. Ordem de
    construção que o mercado indica; onde times erram (catálogo antes de consumidor, ontologia
    antes de pergunta real).

## Formato de resposta

HANDOFF estruturado: resposta por pergunta com fontes; lista "correções à direção de vocês";
proposta de decisão em 1 página (forma do cérebro v0 + representação + entrega ao agente + tool
analítica + o que adiar com gatilho). Direto, sem preâmbulo.
