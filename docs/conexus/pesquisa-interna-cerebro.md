# Pesquisa interna — cérebro da empresa (tópico 15)

> **Natureza.** Pesquisa interna do tópico 15, conduzida em 2026-08-11 por 4 varreduras paralelas
> de fontes primárias (docs oficiais, specs, repos, benchmarks, papers), cada uma cobrindo um
> cluster das 10 perguntas do [prompt externo](pesquisa-externa-cerebro-prompt.md). Todo achado
> marcado como **fato** (URL verificada em 2026-08-11) ou **inferência**. Confrontada com a
> evidência primária Mitra ([17-log OBS-47/67.4](17-log-observacao-mitra.md)), os requisitos
> ratificados CER-1..5 ([03](03-requisitos.md)) e a C-010 ([09](09-agente-primeira-classe.md)).
> Insumo para cruzar com o HANDOFF da deep research externa antes da revisão adversarial (Codex)
> e ratificação.

---

## Q1 — Representação: YAML declarativo venceu; a inovação 2025-26 é o bloco LLM

**Fatos.**

- As 8 camadas semânticas relevantes (dbt/MetricFlow, Cube, LookML, Malloy, Snowflake Semantic
  Views, Databricks metric views, Wren MDL, AtScale SML) convergiram em **YAML declarativo
  git-versionável compilado para algo executável**. Interseção mínima de primitivas presente em
  TODAS: (1) tabela lógica com binding físico; (2) join/relationship com **cardinalidade**
  (`many_to_one`/`one_to_many` bastam — Databricks prova que só essas duas resolvem fan-out);
  (3) dimension (categorical|time); (4) time dimension com grain; (5) measure/metric
  (`agg` ∈ sum/count/count_distinct/avg/min/max + `expr` + filtro opcional); (6) metadados.
- A inovação recente não é primitiva analítica — é o **pacote de contexto para LLM como cidadão
  de 1ª classe**: `synonyms`, `sample_values`, `verified_queries`, `custom_instructions`
  (Snowflake); `meta.ai_context` (Cube); `instructions.md` + `queries.yml` versionados ao lado
  do modelo (Wren). Limite documentado do Cortex Analyst: definição ≤ 32K tokens.
- Padrão Wren de dois estágios: YAML autorado (humano/IA/UI) → **manifest JSON compilado e
  validado** consumido pela engine.
- Licenças/stack: Cube = Apache 2.0, TS+Rust, o vizinho mais próximo; MetricFlow = Apache 2.0
  mas Python + convenções dbt; Malloy = MIT TS porém **linguagem própria em v0.0.x**; LookML
  proprietário; Snowflake/Databricks vivem no vendor. OSI (Open Semantic Interchange, spec v0.1
  jan/2026, Apache 2.0) é nascente demais para adotar — mas convergir nomes reduz migração.
- MetricFlow está depreciando `measures` em favor de `metrics` diretos — o par
  (dimension, metric) vira a interface canônica.

**Confronto Mitra.** OBS-47: `DynamicCubeQuery`/`dimension_store` tem exatamente a primitiva
mínima (dimensão, atributo tipado, agregação padrão por atributo, chave única, cardinalidade,
cubo destino) — herança BI validando o conjunto. Mas: sem campos LLM, sem git, acoplada a
projeto/conexão. O `data_dictionary` da camada de query (OBS-67.4/31.3) reforça: a metade
estrutural existe lá; cross-projeto + regra/processo não.

**Posição Conexus.**

- Formato **próprio minimal** com vocabulário emprestado: nomes MetricFlow (`entities`,
  `dimensions`, `measures`/`metrics`, grain) + `cardinality` Databricks + bloco LLM Snowflake
  (`synonyms`/`sample_values`/`verified_queries`/`custom_instructions`). Máxima familiaridade
  de pré-treino, zero invenção terminológica, zero runtime de terceiro no caminho.
- Kind novo no registro C-005 (candidato: `semantic/v1`), padrão dois estágios: YAML autorado →
  compilação/validação no deployment → manifest com digest (mesmo desenho da ToolProjection da
  C-010). Nenhuma das 8 camadas é adotável inteira sem custo para operador solo.

## Q2 — Regras e processos: markdown curado com teto de dezenas; fórmula compila fora

**Fatos.**

- Mundo formal (DMN/SBVR/OWL/Drools) e mundo LLM seguem separados em produção. Zero evidência de
  LLM consumindo DMN/SBVR cru com ganho. As duas pontes que funcionam: converter o formal em
  texto estruturado no prompt; ou inverter — LLM interpreta, motor externo executa/valida.
- **Palantir Foundry é o único produto que acopla regra+ação à camada semântica**: ontologia =
  dado + lógica (Functions TS/Python) + ação (Action Types permissionados), exposta ao LLM como
  TOOLS, não como texto.
- Markdown curado tem a evidência mais forte por token: paper Cube (arXiv 2604.25149) — documento
  de **4 KB** com medidas/convenções/desambiguação = **+17,2 a +23,2pp** em 3 modelos frontier;
  BIRD external knowledge (regras de domínio em texto) = **+20pp** (34,88→54,89%, GPT-4).
- Teto de regras no prompt: IFScale (arXiv 2507.11538) — melhores modelos caem para 68% com 500
  instruções; **omissão (ignorar regra) é o modo de falha dominante**. "Curse of Instructions":
  sucesso conjunto ≈ (taxa individual)^n — 10 instruções: GPT-4o 15% all-correct, Claude 3.5
  44%. τ-bench: documento de política no prompt + tools = <50% sucesso, pass^8 <25%.
  Mitigador documentado: **seleção dinâmica por relevância** (Parlant: guidelines "When X Then
  Y" carregadas por turno; conformidade 90,2% com verificação pós-geração ARQ vs 81,5% direta).
- Agent Skills (SKILL.md, padrão aberto dez/2025): markdown + frontmatter + progressive
  disclosure em 3 camadas — a formalização mainstream de "conhecimento curado com carga sob
  demanda".

**Confronto Mitra/acervo.** Os 2 campos de texto por projeto da Mitra são markdown curado
primitivo — funcionam (velocidade observada) mas sem versão/camada/escopo. "VLRCUS não é custo
em 94,8%" (Minos) é literalmente o external knowledge do BIRD — a categoria com maior ROI
documentado.

**Posição Conexus.**

- Taxonomia de confiabilidade (a regra decide onde mora): **computável → compila fora do modelo**
  (view/query registrada; o prompt guarda a semântica "use vw_margem, nunca calcule na TGF", o
  SQL guarda a matemática — Foundry em miniatura); **julgamento → texto declarativo curto
  curado**; **crítica → verificação mecânica pós-geração** (já temos: HITL/executor da C-010).
- Orçamento: **dezenas de regras por contexto injetado, nunca centenas**. Quando crescer,
  seleção por escopo (grupo/domínio da pergunta), não prompt maior.
- Processos = markdown estruturado com tipos declarados (definição canônica, regra de
  confiabilidade de campo, fórmula-referência, processo, campanha) — tipo importa para o
  compilador decidir onde cada entrada vai (prompt vs artefato vs tool).

## Q3 — Evidência LLM × semantic layer: +17 a +38pp, e falha vira erro explícito

**Fatos.**

- Cinco fontes independentes convergem: BIRD +20pp; Snowflake +21pp (57→78% BIRD com semantic
  model; 90%+ vs 51% GPT-4o em benchmark interno de 150 perguntas); Cube +17-23pp; data.world
  ontologia+KG **16%→54%** (3,4×); Vanna ~3%→~80% com contexto relevante. É o efeito mais
  replicado da literatura text-to-SQL enterprise.
- Piso realista sem curadoria: **Spider 2.0 = 17-21%** para os melhores agentes (workflows
  enterprise reais, >3.000 colunas). 81,2% das falhas de text-to-SQL são de nível
  schema/semântico (Omni). A distância 21%→90% É o valor da camada.
- dbt benchmark 2026: semantic layer 98,2-100% vs text-to-SQL 84-90% em dados modelados; caso
  negativo documentado: "too many entity hops" → **0% via SL** até modelar — mas a falha do SL é
  **erro explícito**, a do text-to-SQL é **resposta plausível silenciosamente errada**.
- Exposição em produção: MCP server (dbt), REST+YAML (Cortex), injeção inline de markdown (o
  desenho testado com ganho no paper Cube). Nenhuma comparação head-to-head MCP vs inline.
- Prompt caching: leitura 0,1× (Anthropic), prefixo estável obrigatório; conteúdo dinâmico antes
  do breakpoint mata o hit.

**Confronto Mitra.** Nossas 13 SQLs corretas sem exploração replicam o desenho experimental da
Cube (markdown inline, single-shot). Mecanismo já validado interna E externamente.

**Posição Conexus.**

- Injeção inline **determinística** confirmada (C-010 comp. 11 já decidiu: camadas com digest).
  Contexto estável versionado = arquitetura cache-ótima (0,1× na quase totalidade das chamadas).
- **Recusa explícita como propriedade de produto**: "essa métrica não está no cérebro" ≥ resposta
  plausível. Já ratificado na C-010 comp. 18 ("agente nunca improvisa") — agora com evidência de
  que é o diferencial de confiabilidade, não limitação.

## Q4 — Discovery: o Sankhya tem dicionário nativo — a sonda começa por ELE

**Fatos.**

- **O ERP alvo tem dicionário de dados vivo dentro do próprio banco**: 18 tabelas de metadados —
  `TDDTAB` (tabelas), `TDDCAM` (campos), `TDDOPC` (opções/domínios), `TDDINS` (instâncias),
  `TDDLIG`/`TDDLGC` (ligações — as "FKs implícitas" estão MAPEADAS aí) — consultáveis por SQL
  (developer.sankhya.com.br/docs/dicionário-de-dados).
- Literatura de discovery converge no pipeline: poda/retrieval barato → LLM ranqueia/anota
  candidatos → **humano confirma o incerto**. Prompt-Matcher (arXiv 2408.14507) formaliza o loop
  de entrevista: escolher o que perguntar sob orçamento = NP-hard, algoritmo (1-1/e)-aproximado —
  perguntar primeiro o que mais reduz incerteza.
- Números realistas: column type annotation ~90% F1 em benchmark limpo vs colapso enterprise
  (caso ERP real com naming opaco: **10%** de acurácia; ~400 linhas de regras de domínio não
  documentadas precisaram ser codificadas à mão). Expansão de abreviações (Columbo/NameGuess):
  melhor caso 69-90%, **inglês apenas** — nada publicado para abreviação em português.
- SNAILS (SIGMOD 2025): correlação significativa entre naturalidade de identificador e acurácia
  NL-to-SQL; remédio = "natural views" (renomear via view sem tocar o schema).
- Atlan (produto de referência de HITL): IA só escreve onde não há descrição humana; conteúdo
  humano tem precedência; descrição IA carrega **badge de proveniência**; claim de 90%+ de
  aceitação.
- FK inference clássica (HoPF): 88% PKs / 91% FKs em schemas acadêmicos; LLM-FK 2026: F1 >93%
  MusicBrainz. Nenhum caso público sobre ERP brasileiro.

**Confronto acervo.** CER-3 (ratificado) já previa o loop de entrevista. O achado do dicionário
TDD* **inverte a arquitetura da sonda**: passo 1 não é profiling estatístico — é ler o dicionário
oficial; profiling (INDs, contagens, Metanome-style) vira auditoria e complemento (customizações
`AD_*`, campos reaproveitados, ligações não declaradas).

**Posição Conexus.**

- Sonda F1: (1) dicionário TDD* → nomes de exibição, domínios e ligações de graça; (2) profiling
  estatístico como verificação; (3) LLM propõe mapeamento; (4) entrevista prioriza por redução
  de incerteza; (5) **toda proposta = hipótese até confirmação humana**, com badge de
  proveniência (regras Atlan copiadas: IA preenche vazio, humano precede, badge sempre).
- Expectativa honesta: 70-90% das colunas comuns propostas certas, cauda longa só na entrevista.

## Q5 — Retroalimentação: é workflow de curadoria, não framework de memória

**Fatos.**

- **Nenhum dos 4 frameworks de memória tem o loop proposta → review humano → publicação.** Todos
  consolidam automaticamente (Mem0/Zep via LLM; Letta write direto). Mastra OM (fev/2026):
  Observer/Reflector comprimem 5-40×, contexto estável cacheável, recorde LongMemEval — mas
  escopo `thread`/`resource` (usuário), **sem escopo organizacional**; `resource` marcado
  experimental. Mem0 tem `org_id` mas a auto-resolução (ADD/UPDATE/DELETE por LLM) **deleta
  silenciosamente memórias ainda necessárias** (falha documentada por praticantes). Letta é o
  único com semântica de concorrência documentada (blocks `read_only` + um escritor designado).
  Zep group graphs: bi-temporal, contradição invalida edge preservando histórico.
- Poisoning é real e barato: MINJA — injeção de memória só via queries normais, >95% ISR;
  moderação/sanitização "largely ineffective". OWASP Agentic 2026 ASI06: validar antes de
  gravar, segmentar por domínio, **provenance + trust score**, snapshots/rollback.
- O loop que queremos existe em OUTRA categoria: stewardship de data catalog — DataHub Change
  Proposals (propor → task do steward → accept/reject → **log completo de decisões**),
  OpenMetadata (draft → reviewer → approved; **sem reviewer designado, aprova por default** —
  gate opt-in), Atlan (Intake → Triage → Draft → Review → Approve).

**Confronto C-010.** Cérebro read-only para o agente na fase 1 (comp. 12) **elimina o vetor MINJA
por construção** — decisão já ratificada, agora com nome de ataque e número.

**Posição Conexus.**

- Retroalimentação (CER-4, F1) = **pipeline de promoção com gate humano**, blueprint
  DataHub/Atlan. Não adotar framework de memória como fundação (consistente com C-010). OM =
  copiar o princípio (consolidação determinística que preserva cache), nunca a lib como
  autoridade.
- **Provenance por entrada desde o v0** (qual projeto/conversa/sonda originou a afirmação) — a
  mitigação OWASP mais barata e impossível de retrofitar.

## Q6 — Herança: produtor publica, consumidor pina por digest, bump explícito

**Fatos.**

- Padrão maduro convergente: LookML importa cross-projeto read-only e refina localmente
  (`+view`); pin por **commit SHA** com manifest lock; `final: yes` trava objeto contra
  refinamento; **o pai declara o que o filho pode sobrescrever** (`export:
  override_optional|required`); parâmetros classificados aditivos vs substitutivos. dbt:
  package-lock.yml com SHAs; bump só com `deps --upgrade`; root project vence para macros.
- **Ninguém faz re-eval automático de consumidores** quando o pai muda — sempre pin + bump
  explícito.
- Unity Catalog: sem DENY, união permissiva — anti-modelo para nós. Agent builders
  (Copilot/Agentforce/Dify): attach de fontes por agente, **sem herança em camadas nem semântica
  de conflito** — não servem de referência.

**Confronto C-010.** Comp. 11 já exige digest por camada; C-005 já tem deployment com manifesto e
pin. O mercado valida o desenho existente — herança de cérebro é o MESMO mecanismo.

**Posição Conexus.**

- Camada empresa publica versão; projeto **pina por digest**; promoção de versão = deploy (com os
  gates normais). Mudou o cérebro → agentes re-qualificam no próximo deploy, nunca mutação
  silenciosa sob os pés (consistente com "aprovação pendente invalidada se deployment muda").
- Conflito projeto×grupo: **por chave, com política declarada no pai** (`final`/aditivo/
  substituível) — projeto especializa via refinement read-only estilo LookML, nunca muta o pai.

## Q7 — Armazenamento e entrega: git é a fonte, Postgres é o índice; inline vence RAG

**Fatos.**

- Padrão "UI edita, git versiona" tem 3 implementações de referência (Looker IDE, dbt Cloud IDE,
  git-backed CMS tipo TinaCMS/Decap): toda edição vira commit; TinaCMS adiciona o híbrido
  relevante — **git como source of truth + índice em DB para leitura rápida**, push atualiza o
  índice.
- Inline vs RAG: Mastra OM supera RAG no LongMemEval com contexto denso estável (argumento
  central: RAG invalida prompt cache; claim 10× custo); arXiv 2501.01880: long context supera
  RAG quando cabe; consenso praticante: corpus pequeno/estático **<~100K tokens** = contexto
  direto. Chroma "Context Rot": todos os 18 modelos degradam com input maior — perda séria já
  com **~50K tokens** numa janela de 200K; lost-in-the-middle -30%+.
- Caching: Anthropic leitura 0,1×/escrita 1,25-2×; OpenAI automático ≥1024 tokens, ~50-90% off.

**Confronto acervo.** Registro C-005 já é git-first com deployment materializado — o híbrido
TinaCMS é o nosso desenho com outro nome. Mitra guarda contexto em campos de banco sem versão =
anti-modelo já rejeitado.

**Posição Conexus.**

- Cérebro = arquivos no repo (kind do registro), compilados no deployment para tabela de serving
  (índice). UI futura escreve **via commit**, nunca direto na tabela.
- **Budget de tokens por camada como constraint de produto declarada** (ex.: camada empresa ≤
  10K tokens; total das camadas estáveis ≤ ~30K — margem antes do context rot). Estouro não é
  "prompt maior": é compressão (princípio Reflector) ou material frio → **tool de lookup
  determinística** (não RAG por embedding).

## Q8 — Tool analítica tipada: compilador próprio TS falando o dialeto de query do Cube

**Fatos.**

- Benchmarks 2026: query estruturada sobre semantic layer = 98,2-100% (dbt, Sonnet 4.6 /
  GPT-5.3) vs 84-90% text-to-SQL; falha vira **erro explícito**; escolha de modelo quase
  irrelevante com SL.
- Formato de query do Cube (REST): `measures[]`, `dimensions[]`, `filters[]`
  ({member,operator,values}, 24 operadores, and/or com separação WHERE/HAVING),
  `timeDimensions[]` ({dimension,dateRange,granularity}), `limit` (default 10k, máx 50k),
  `order`, `timezone` — o formato JSON de query analítica com maior presença em corpus público.
- Rotas de engine: Cube Core self-host = serviço Node separado + JWT + modelo de config próprio
  (dobro de superfície p/ solo); `@cubejs-backend/schema-compiler` standalone = API interna sem
  doc; MetricFlow = runtime Python inteiro + convenções dbt, APIs de query pagas (dbt Cloud);
  Malloy = embed TS trivial (MIT) mas linguagem 0.0.x e superfície de expressão arbitrária
  (meio-termo de segurança, não allowlist).
- Compilador próprio allowlistado: validação Zod contra manifest → identificadores SÓ do
  manifest → valores SEMPRE parametrizados (`$n`) → LIMIT forçado + `statement_timeout` + role
  read-only. Injeção impossível por construção. [Inferência] semanas, não meses, se as
  primitivas forem as 6 do Q1.

**Confronto Mitra.** `DynamicCubeQuery` É essa tool (dimensão+agregação+cubo destino na UI) — o
concorrente valida o gatilho que a C-010 nomeou.

**Posição Conexus.**

- Rota recomendada: **compilador próprio TS, dialeto de query do Cube como spec** (familiaridade
  de pré-treino), validado contra o manifest do cérebro. Guard-rails copiados: teto de linhas
  Cube (default 10k), `cardinality` Databricks contra fan-out. `verified_queries` = literalmente
  nossas queries registradas.
- Cube Core = plano B declarado se demanda crescer (caching/pre-aggregations/multi-fonte).
- Gatilho da C-010 comp. 18 permanece: T15 decide a FORMA agora; construção entra quando o
  gatilho disparar (T15 decidido conta como disparo — sequenciar na ratificação).

## Q9 — Drift: metadado sem prova executável apodrece e mente

**Fatos.**

- Consenso transversal (contracts/catalogs/semantic layers): checks longe do código que produz
  ficam stale e passam a ser ignorados; a única forma documentada de manter camada viva é
  **asserção que roda no pipeline** (Elementary/dbt tests: schema change, freshness, anomalia
  como teste YAML; Monte Carlo circuit breakers: regra falhou → job para; padrão
  Write-Audit-Publish).
- Modos de morte documentados: catálogo vira "prateleira de documentação cara"; **metrics layer
  standalone fracassou como categoria inteira** (Benn Stancil: de ~6 empresas de 2021, nenhuma
  virou padrão); Prukalpa 2026: 3 causas — incentivos, economia de migração, e **fora do
  execution path** ("valor só após grande investimento"). Context drift/context failure já tem
  nome na literatura 2026: agente recupera premissa stale e **raciocina certo sobre premissa
  errada, com confiança total**.
- Freshness p/ KB de LLM (Atlan 2026): `last_verified` em todo documento + dono + monitoração da
  fonte — framework recente, não prática consolidada. Ninguém implementa TTL/bloqueio de
  contexto stale DENTRO do fluxo do agente como produto.
- Custo: números de mercado (57% do tempo em manutenção de dataset; 15h/incidente) são de
  equipes com stack grande — inexistente literatura para time de 1.

**Confronto acervo.** "94,8% dos registros satisfazem X" (Minos/VLRCUS) já É uma asserção
executável — só falta gravá-la junto do mapeamento e re-executar agendado.

**Posição Conexus.**

- **Cada mapeamento nasce com prova anexada**: query de verificação + resultado esperado + data +
  quem confirmou. Job agendado re-executa provas + diff do dicionário TDD* (schema drift oficial
  por SQL barato). Estado explícito por entrada — `verificado`/`suspeito`/`quebrado` — e o
  runtime RESPEITA: suspeito sai do contexto ou entra rotulado.
- Anti-morte sociológica: o cérebro tem que estar **no execution path** — é o que o agente usa
  para trabalhar (e corrige ao errar, via proposta com gate). Catálogo paralelo de documentação
  morre com probabilidade documentada de ~100%.

## Q10 — MVP: consumidor primeiro; 4 decisões que não se retrofitam

**Fatos.**

- Ordem unânime do mercado: **consumidor primeiro** (dbt: "as 20-50 métricas que dirigem as
  discussões executivas", "cada etapa entrega alavancagem própria"); "ontology before question"
  é o modo de morte documentado. OpenMetadata: sem reviewer designado, termo aprova por default
  — gate estrutural que degenera para self-merge com 1 pessoa e escala depois **sem mudança de
  esquema**.
- [Inferência da varredura] 4 decisões que NÃO se retrofitam e por isso entram no v0 mesmo
  mínimo: (1) **namespace por grupo** desde o 1º artefato; (2) **identidade por digest + pin no
  deployment** do agente; (3) **provenance por entrada**; (4) **separação estrutural
  draft/publicado** — mesmo que no v0 "proposta" seja um PR que o próprio operador aprova.

**Confronto acervo.** Caso 1 fornece as perguntas reais que o agente erra hoje (margem, custo,
campanha — o particular que o TOP 14 não mostra). Faseamento ratificado (CER-1/2/5 = MVP;
CER-3/4 = F1) casa exatamente com a ordem que o mercado indica.

**Posição Conexus.**

- v0 = seed manual do cérebro do grupo (caso 1), respondendo perguntas que os agentes erram sem
  ele; medir uso antes de expandir cobertura. Multi-grupo = novo namespace; discovery = novo
  produtor de propostas; retroalimentação = automatizar o Intake — nenhum exige rebuild do v0.

---

## Correções à nossa direção (8)

1. **Sonda de discovery invertida**: passo 1 é ler o dicionário nativo do Sankhya
   (`TDDTAB`/`TDDCAM`/`TDDOPC`/`TDDLIG` — FKs "implícitas" estão mapeadas lá, oficial, por SQL).
   Profiling estatístico vira auditoria, não fonte primária. CER-3 assumia inferência do zero.
2. **Regra em texto tem teto duro**: dezenas por contexto, nunca centenas (IFScale/Curse —
   sucesso ≈ p^n; omissão é o modo de falha). Seleção por escopo entra no desenho desde o v0.
3. **Fórmula estabilizada sai do prompt**: migra para artefato executável (view/query
   registrada); prompt guarda só a semântica. Padrão Foundry em miniatura.
4. **Retroalimentação não é framework de memória**: nenhum (Mastra OM/Letta/Zep/Mem0) tem
   proposta→review→publicação nem escopo organizacional maduro. Blueprint certo = stewardship de
   catálogo (DataHub/Atlan) com log de decisões. OM = princípio de consolidação, não lib.
5. **Recusa explícita é o diferencial, não limitação**: SL falha com erro explícito; text-to-SQL
   falha com número plausível errado. Reforça C-010 comp. 18 com evidência quantitativa.
6. **Mapeamento sem prova executável = passivo que mente**: cada entrada nasce com query de
   verificação + estado (verificado/suspeito/quebrado) que o runtime respeita. Sem isso, context
   failure (confiança total sobre premissa stale).
7. **Execution path ou morte**: metrics layer standalone fracassou como categoria; catálogo
   paralelo morre. O cérebro precisa ser o que o agente USA para responder — nunca documentação
   ao lado.
8. **4 fundações não-retrofitáveis no v0**: namespace por grupo, digest+pin, provenance por
   entrada, draft/publicado estrutural. Todo o resto é aditivo.

## Rascunho de decisão em 1 página (pré-cruzamento com a externa)

- **Forma**: cérebro = artefatos no registro C-005, por grupo de projetos. Dois tipos de
  conteúdo: (a) **modelo semântico** — YAML minimal, vocabulário MetricFlow + cardinality +
  bloco LLM (synonyms/sample_values/verified_queries/custom_instructions); (b) **conhecimento
  curado** — markdown estruturado com tipos (definição canônica, regra de confiabilidade,
  fórmula-referência, processo, campanha) e provenance por entrada. Compilação no deployment →
  manifest com digest (= camada empresa/cérebro do ContextPack da C-010).
- **Entrega**: injeção inline determinística com budget declarado por camada (~10K empresa /
  ~30K total estável); material frio via tool de lookup determinística; RAG rejeitado para
  corpus curado (gatilho nomeado se corpus explodir).
- **Herança**: projeto pina o cérebro por digest; bump explícito = deploy; conflito por chave
  com política declarada no pai; refinement read-only para especialização.
- **Escrita**: agente NUNCA escreve direto (read-only F1, C-010). Toda mutação = proposta →
  gate humano → publicação → log de decisões. Provenance + estado de verificação por entrada;
  provas executáveis re-verificadas por job; suspeito sai/rotula no contexto.
- **Discovery (F1)**: sonda TDD*-first + profiling como auditoria + entrevista priorizada por
  incerteza; toda proposta = hipótese com badge até confirmação.
- **Tool analítica** (gatilho C-010): compilador próprio TS, dialeto de query Cube, allowlist
  do manifest, valores parametrizados, teto de linhas; Cube Core = plano B declarado.
- **v0 (MVP)**: seed manual, 1 grupo (caso 1), inline, read-only — com as 4 fundações
  não-retrofitáveis desde o primeiro artefato.
- **Adiar com gatilho**: RAG/embeddings; framework de memória; re-eval automático de
  consumidores; multi-grupo; editor UI (commit-based) — cada um com gatilho nomeado na decisão.
