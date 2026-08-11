# Tópico 15 — Cérebro da empresa

> **Status: DECIDIDO — C-011** (ratificado 2026-08-11).
> Evidência: acervo Mitra (OBS-47/67.4) + [pesquisa interna](pesquisa-interna-cerebro.md) (4
> varreduras, 8 correções) + deep research externa ([prompt](pesquisa-externa-cerebro-prompt.md);
> HANDOFF com 10 correções C1–C10) + revisão adversarial Codex xhigh 2 rodadas (7,9 → 8,8/10,
> "sem contradição material remanescente com C-002/C-005/C-006/C-007/C-008/C-010").
> As duas pesquisas, independentes, convergiram no mesmo desenho central — as divergências foram
> resolvidas por composição e estão marcadas neste doc.

## 1. Decisão em uma frase

O cérebro da empresa é um **pacote de conhecimento git-first por grupo de projetos** — modelo
semântico + conhecimento de negócio + evidência executável — compilado para um artefato imutável
com digest que os projetos **pinam**, entregue **inline e deterministicamente** aos agentes
(builder e produção), onde **máquina propõe e humano publica**, e cuja tool analítica é um
**compilador próprio restrito** que só aceita IDs do próprio cérebro.

## 2. Forma: objetos e autoridades

Três eixos de conteúdo:

- **SEMANTIC** — datasets/entities com grain declarado, dimensions, measures, metrics,
  relationships com cardinalidade (`one_to_one` | `many_to_one`; `many_to_many` rejeitado no v0).
- **KNOWLEDGE** — glossário canônico, regras de negócio, caveats, processos, campanhas: markdown
  com frontmatter tipado.
- **EVIDENCE** — provenance por entrada, assertions executáveis, golden cases, health.

Objetos (separação lógico × físico × operacional — fecho da rodada adversarial):

| Objeto | Escopo | O que é |
|---|---|---|
| `BrainDefinition` | grupo | Conteúdo lógico autorado: IDs lógicos, significado, regras. Contrato `brain/v1`, **kind `brain`** no registro C-005; SEMANTIC/KNOWLEDGE/EVIDENCE são tipos internos do kind, não kinds próprios. |
| `BrainRevision` | grupo | Versão publicada da definição (merge no git do grupo → registry `AVAILABLE`). |
| `BrainPack` | grupo | Payload compilado imutável com content digest — nunca arquivo autorado. É a camada empresa/cérebro do ContextPack (C-010 comp. 11). |
| `ProjectBrainBinding` | projeto | Contrato `brain-binding/v1`: liga ID lógico a view/query artifact pinado do projeto e **prova conformidade** (assertions de grain/unicidade). Herdar "margem significa X" ≠ provar que minhas views materializam X. |
| `EffectiveBrainPlan` | runtime | BrainDefinition + binding + healthSnapshot → fatia renderizada no ContextPack. |

**Ownership git cross-project**: fonte git canônica de escopo **grupo** (árvore/repo próprio do
grupo, nunca dentro do repo do primeiro projeto); registro operacional central no `hub_control`;
projeto só **pina** revisão publicada; bindings e overrides vivem no repo do projeto.

**Três autoridades separadas** (nunca "git resolve tudo"):

1. **Git** = source of truth do conhecimento **publicado** (incluindo especificações de prova).
2. **Postgres** = autoridade **operacional**: proposals, health, execuções de prova, jobs — esses
   estados não "resolvem a favor do git".
3. **Registry serving** = payload compilado imutável (C-005).

Health **não entra** no digest do BrainPack. BrainPack é imutável — item INVALID não "sai do
pack": é excluído da **fatia efetiva** e bloqueia capabilities dependentes deterministicamente.

**Trace registra 4 digests** (não 1): `brainDigest`, `projectBindingDigest`,
`healthSnapshotDigest`, `effectiveBrainSliceDigest` — seleção por agente e exclusão por health
produzem prompts diferentes sobre a mesma versão. Definição normativa:

```text
brainDigest              = canonical source closure + brain schema version + compiler version
effectiveBrainSliceDigest = selected item digests + binding digest + health snapshot digest
                           + selector/renderer version
```

Canonicalização obrigatória: ordenação, normalização Unicode, números, line endings.

**Escopo server-side**: projeto só pina Brain do **próprio grupo** — `groupId` e associação
projeto→grupo derivados do `hub_control`; compiler/deployment rejeita Brain fora do grupo; escopo
nunca vem de manifesto ou browser sem validação.

## 3. Formato: YAML + markdown tipado, DSL pequena assumida

- **YAML** para o que máquina interpreta: vocabulário alinhado a MetricFlow/Apache Ossie onde
  natural (entities, dimensions, measures, metrics, grain, cardinality) + bloco LLM do padrão
  Cortex (`synonyms`, `sample_values`, `verified_queries`, `custom_instructions`).
- **Markdown com frontmatter tipado** para conhecimento humano (tipo importa: o compilador decide
  onde cada entrada vai — prompt, artefato ou tool).
- Honestidade adversarial: isso **é** uma DSL própria — pequena, versionada, alinhada aos
  vocabulários de mercado. Apache Ossie (ex-OSI, incubating; spec ainda `0.2.0.dev0`) =
  REFERENCE/ALIGN de vocabulário, nunca base de compatibilidade nem dependência.
- Padrão dois estágios (Wren): artefatos autorados → Brain Compiler valida/resolve herança/rejeita
  conflito → BrainPack.

## 4. Três classes de regra, fronteira dura

(a) Regra que **define número** → estruturada no semantic model (metric/measure), nunca só
markdown; fórmula estabilizada compila para artefato executável — o prompt guarda a semântica
("use vw_margem, nunca calcule na TGF"), o SQL guarda a matemática. O Brain Compiler gera
**candidato** de view; publicação segue o lifecycle C-005/C-006 — o compilador nunca cria objeto
em produção. (b) Regra **interpretativa** ("VLRCUS não é custo confiável") → rule/caveat/
glossário. (c) **Processo/política** → knowledge tipado. DMN/BPMN/ontologia/knowledge graph =
DEFER por consumidor (G6).

Contrato mínimo de métrica do caso 1: tipo, unidade/moeda, precisão, timezone, tratamento de
null, grain, key, cardinalidade, agregação, assertions.

## 5. Entrega: inline determinística com budget duro

- Injeção inline do BrainPack compilado — subconjunto aplicável ao projeto/agente, nunca schema
  físico inteiro do ERP. Conteúdo estável no início do prompt (cache-ótimo, leitura 0,1×).
- **Teto de regras injetadas = dezenas, nunca centenas** (IFScale: sucesso conjunto ≈ p^n;
  omissão é o modo de falha dominante).
- **Budgets duros no deployment**: `maxBrainTokens` + `maxStableContextTokens` — compilação
  **falha** ao exceder; mudar budget = deployment + eval. Estouro: 1º seleção determinística por
  escopo ou lookup por ID; RAG/embeddings só depois (G4).
- **Dependency closure na seleção**: métrica + definição + caveats críticos + binding = bundle
  indivisível. Não cabe no budget → compilação falha ou a capability inteira sai — nunca métrica
  injetada sem sua ressalva.
- G4 (retrieval) com sinais mensuráveis: % médio do Brain usado por turno, cache hit rate,
  custo/latência vs SLO, delta na golden suite. Índice de retrieval quando vier = derivado do
  git, nunca autoridade.

## 6. Herança: pin por digest, override explícito, publicação ≠ promoção

- Projeto pina o Brain por digest; deployment referencia `brainDigest` (+ binding + agent +
  project digests). **Live inheritance = REJECT.**
- Brain novo publicado = consumidores marcados **`UPDATE_AVAILABLE`** (informativo).
  REVALIDATION começa quando o projeto tenta **promover** o digest novo: candidate brain+binding
  → golden eval → deployment CAS. `AVAILABLE` não significa aprovado para nenhum consumidor.
  Health failure = circuito separado do upgrade.
- Override **sempre explícito** com referência ao ID (`overrideOf: company:margin` + reason);
  conflito não declarado = **falha de compilação**; pai pode travar chave (`final`).
- Três operações distintas no compilador — conflar destruiria o reuso cross-project:
  **binding** (mesma semântica, implementação local), **refinement** (especialização compatível),
  **override** (significado local substitui o canônico).
- Política genérica aditivo/substitutivo por chave = fora do v0; merge definido **por tipo de
  item** no compilador; regimes novos só quando surgir override real.

## 7. Tool analítica: AnalyticQuery = segundo regime de leitura

Gatilho da C-010 comp. 18 disparado por esta decisão. **Não é query C-005 comum** — SQL gerado
dinamicamente não é payload pré-registrado. Admitida como segundo regime de leitura declarado,
com **emenda à C-010 comp. 7**:

> Leitura somente por query estática registrada **ou por plano semântico compilado pelo
> AnalyticQueryExecutor qualificado contra BrainPack e binding pinados**.

Pipeline:

```text
AnalyticQuery tipada
→ validação contra EffectiveBrainPlan pinado
→ plano semântico canônico
→ SQL via AST restrita
→ prova SELECT-only do parser C-005
→ Capability Gateway
→ role {proj}_query + transação read-only
→ shaping + budgets
```

- Formato = **subset Conexus inspirado em Cube** (não "dialeto Cube" — a superfície real do Cube
  é maior): `{dataset, metrics[], dimensions[], filters[] (member+operator+values, operadores
  allowlistados), time{dimension,from,to,granularity}, order[], limit}`.
- Agente envia **só IDs do Brain** — nunca SQL, nome físico, expressão, join, função.
- Limites: `min(request, datasetCap, toolCap, remainingRunBudget)` — default do agente na ordem
  de dezenas/centenas de linhas; time range máximo por dataset; operadores por membro;
  `statement_timeout`; valores sempre parametrizados.
- **Restrição v0: uma AnalyticQuery opera sobre UM dataset analítico curado.** Pergunta que exige
  combinação nova = builder cria dataset/view aprovado; join graph escolhido por LLM em runtime
  nunca. Relationships cross-dataset podem existir como metadata; o executor v0 rejeita o uso.
- **Fonte analítica componível**: binding só aceita view criada por migration com contrato
  analítico, ou query artifact marcado `analyticSource: true` (single-SELECT componível,
  outputSchema fechado, grain declarado, sem parâmetros livres incompatíveis) — nem toda query
  registrada pode virar `FROM (...)`.
- Semantic core **sem SQL cru**: métricas usam agregações/AST allowlisted; fórmula complexa vira
  artefato C-005 revisado.
- Platform tool com handler, conformance **negativa**, error taxonomy e trace próprios.
- Cube Core/Wren/MetricFlow/Malloy = REFERENCE; spike comparativo só com gatilho (G5).

## 8. Discovery assistido (F1) — sonda TDD*-first

Machine-propose / human-decide. Correção estrutural ao desenho de mercado: o Sankhya tem
**dicionário de dados nativo no próprio banco** (`TDDTAB`/`TDDCAM`/`TDDOPC`/`TDDINS`/`TDDLIG`/
`TDDLGC`, consultável por SQL — confirmado na doc oficial pelo revisor adversarial). Ordem:

1. Dicionário TDD* + catálogo Postgres → inventário e candidatos (nomes de exibição, domínios,
   ligações oficiais de graça).
2. Profiling estatístico **direcionado** como auditoria: prova grain, unicidade, cardinalidade,
   nulls, órfãos dos candidatos — nunca indiscriminado em centenas de tabelas. Cobre
   customizações `AD_*`, campos reaproveitados, ligações não declaradas.
3. LLM propõe mapeamento semântico.
4. Entrevista humana priorizada por redução de incerteza (Prompt-Matcher).
5. Toda proposta = **hipótese com badge de proveniência** até confirmação (regras Atlan: IA só
   preenche vazio, humano precede, badge sempre). Relação inferida nunca ganha autoridade
   automática.

Expectativa de acerto ("70–90%") **não entra na decisão** — é hipótese medida pelo probe
`CX-BRAIN-DISCOVERY-01` antes de construir a sonda (CER-3). Discovery e compilação com dado real
rodam no **Hub/Gateway — nunca no E2B com credencial de ERP** (C-008).

## 9. Retroalimentação (F1) — proposta, nunca escrita direta

`KnowledgeProposal` {proposalId, sourceProject, sourceActorRun, proposedTargetId, proposedChange,
evidenceRefs[], confidence, detectedConflicts[], status, reviewer} → detecção de conflito por
**ID + escopo + dependency/impact footprint** (similaridade semântica só levanta candidato,
nunca faz merge; contradição material = NO AUTO MERGE) → review humano → commit → novo digest.

- LLM output = evidência/proposta; artefato aprovado por humano = autoridade.
- **Self-write = REJECT** (elimina MINJA por construção; consistente com C-010 comp. 12).
- EvidenceRef durável e sanitizado com digest — conversa/run pode ser **origem**, não autoridade
  permanente.
- Compressão nunca resume regra normativa automaticamente; resumo derivado tem digest +
  proveniência + eval; crítico exige review.
- Frameworks de memória (Mastra OM/Letta/Zep/Mem0) = candidatos a **fonte** de proposta, nunca
  autoridade — nenhum tem loop proposta→review→publicação nem escopo organizacional maduro.
  Blueprint certo = stewardship de catálogo (DataHub/Atlan) com log de decisões.

## 10. Drift e evidência: 5 estados que o runtime respeita

Item importante nasce com prova anexada (query de verificação + resultado esperado + data + quem
confirmou). Job agendado re-executa provas + diff do dicionário TDD* (schema drift oficial
barato).

- Estados: **UNVERIFIED / VALID / SUSPECT / INVALID / CHECK_ERROR**. `ASSERTION_FAILED` ≠
  `CHECK_ERROR` — banco indisponível não torna a regra falsa. Status = overlay operacional,
  nunca reescreve git/pack.
- Consumo por severidade + tipo: métrica/número/conteúdo effectful SUSPECT = **bloqueia**;
  rótulo só para descritivo de baixa severidade. SUSPECT nunca usado silenciosamente.
- Tipos de prova por classe: assertion (claim de dado), documento+owner+review (política),
  validade temporal (campanha), evidência amostral (hipótese). TTL só para conhecimento
  tempo-dependente.
- **Health auditável**: execuções de prova append-only; reducer determinístico e versionado
  produz o status atual; tabela de status = projeção reconstruível; `healthSnapshotDigest`
  deriva das observations + versão do reducer.
- **Corrida health × execução**: AgentRun pina snapshot; recheck do health epoch das
  dependências críticas antes da resposta final e antes de **qualquer** efeito/approval
  execution; mudança crítica invalida continuação/aprovação e recompõe o contexto. Approval
  dependente do Brain vincula `effectiveBrainSliceDigest`.
- Catch-up de job: `lastSuccessfulCheck` + estado stale — ausência de execução nunca preserva
  verde (PC desligado coberto).
- Anti-morte sociológica: o Brain está no **execution path** — é o que o agente usa para
  responder (metrics layer standalone fracassou como categoria; catálogo paralelo morre).

## 11. Segurança de conteúdo

- `sample_values`/`verified_queries`: só enum, valor sintético ou classe não sensível.
  `sampleSource: enum|synthetic` obrigatório; importação direta de resultado de query proibida;
  lint de PII + secret scanners + review humano (lint é defesa, não prova). `verified_queries`
  contêm plano semântico canônico e fixtures sintéticas — nunca SQL cru nem valores de produção.
  Dado real de ERP nunca entra no git.
- `custom_instructions`: tipos e escopos **fechados**; proibido instruir sobre autorização,
  tools, approvals, credenciais e políticas de plataforma. Conteúdo livre entra como
  conhecimento, não como comando privilegiado.
- Authority lattice: Brain **nunca** contraria platform policy/authorization/approval (camada
  plataforma vence — C-010); nunca cria grant, tool ou data scope — só referencia fontes já
  permitidas pelo deployment e pela ToolProjection.

## 12. Golden eval desde o v0

Contrato = **perguntas de negócio** (pergunta → intenção semântica esperada → tool call esperada
→ valores-chave), não "YAML compilou" nem SQL cru como contrato principal. Verified query
incorreta **piora** acurácia (alerta Snowflake) → curadoria igual ao resto. Recusa explícita é
propriedade de produto: "essa métrica não está no cérebro" ≥ resposta plausível errada.

## 13. v0 (MVP)

1 grupo (Metal Nobre), domínio do caso 1 (Analisador de Orçamentos), seed manual, inline, agente
read-only. **Datasets e regras entram por cobertura observável das perguntas golden do caso 1 —
não por meta de contagem** (a estimativa de trabalho aponta ~3–5 datasets lógicos: budgets,
budget_items, customers, products, salespeople).

4 fundações não-retrofitáveis desde o 1º artefato: namespace por grupo; digest + pin no
deployment; provenance por entrada; separação estrutural draft/publicado (no v0, proposta = PR
que o operador aprova).

**NÃO entra no v0**: knowledge graph, RDF/OWL, DMN, BPMN, vector DB, RAG, graph DB, promoção
automática, self-write, catálogo ERP completo, schema Sankhya inteiro, Cube/Wren/MetricFlow como
serviço, autoridade automática de FK inferida, live inheritance, contradição resolvida por IA,
política de override por chave, `many_to_many` no executor.

## 14. Faseamento e probes

Gatilhos: **G1** segundo projeto da empresa (prova herança/binding/reuso — a prova do
diferencial); **G2** repetição de descoberta → sonda (§8); **G3** descobertas em projetos →
KnowledgeProposal (§9); **G4** sinais mensuráveis de contexto (§5) → retrieval derivado; **G5**
compilador virando semantic engine → spike Cube/Wren/MetricFlow/Malloy; **G6** regras viram
decisões executáveis complexas → DMN/decision tables; **G7** muitas empresas/brains →
catálogo/stewardship.

**Probe bloqueante `CX-BRAIN-V0-01`** — antes do primeiro deploy Brain-backed (mesmo padrão do
`CX-SBX-E2B-01` da C-008):

1. Mesmas fontes + toolchain geram os mesmos digests (reprodução byte a byte).
2. Referência ausente, ciclo, override de `final` e binding incompatível falham fechado.
3. Brain V2 publicado não altera projeto pinado em V1.
4. Binding não conformante em grain/unicidade não promove.
5. AnalyticQuery rejeita ID, operador, cross-dataset, many-to-many, expressão e campo
   desconhecidos.
6. Valores maliciosos continuam bindados; SQL final passa prova SELECT-only.
7. Role query não escreve; timeout, limites e budgets vencem sempre.
8. ASSERTION_FAILED, CHECK_ERROR e stale produzem estados e gates distintos.
9. Mudança crítica de health entre composição e finalização aborta/recompõe.
10. Seleção por tokens preserva dependency closure.
11. PII/sample real e instrução que tenta ampliar autoridade são rejeitados.
12. Golden questions retornam valores corretos; perguntas fora do catálogo recusam
    explicitamente.

**Probes posteriores**: `CX-BRAIN-DISCOVERY-01` antes de CER-3 (leitura TDD* via Gateway,
profiling direcionado, cobertura/erros medidos, zero credencial no E2B, toda inferência como
hipótese); `CX-BRAIN-FEEDBACK-01` antes de CER-4 (proposal→review→commit→compile→publish;
conflito material não auto-merge; run é origem, não autoridade; self-write impossível).

## 15. Diferencial (reformulado)

**Não** é "ter camada semântica" — Wren 2026 já é context layer (semantic + rules + glossary +
caveats + exemplos); a Mitra tem a metade estrutural (OBS-47). O defensável é a **composição**:
company-scoped + cross-project + semantics + business/process knowledge + evidence com estados +
versionamento com digest + aprendizado governado por humano + compartilhado por builder **e**
agentes de produção. Prova crítica = o **segundo projeto** da mesma empresa nascer sabendo o que
o primeiro descobriu (G1).

## 16. Ajustes a decisões anteriores

- **C-010 comp. 7** (emenda de texto): leitura por query estática registrada **ou** plano
  semântico compilado pelo `AnalyticQueryExecutor` qualificado contra BrainPack e binding
  pinados (§7).
- **C-010 comp. 11**: camada empresa/cérebro do ContextPack = BrainPack; trace passa a registrar
  os 4 digests (§2).
- **C-010 comp. 18**: gatilho "tool analítica tipada" disparado — forma decidida aqui;
  construção sequenciada no build.
- **C-005**: kinds novos `brain` (`brain/v1`) e binding (`brain-binding/v1`), respeitando o
  invariante "kind escolhe compilação + lifecycle + handler"; extensão de ownership: fonte git
  de escopo grupo + publicação `AVAILABLE` ≠ promoção por projeto.
- **C-008**: discovery/compilação com dado real só no Hub/Gateway — credencial de ERP nunca no
  guest E2B (reforço do invariante existente).
- **CER-3**: semântica mantida; arquitetura da sonda invertida para TDD*-first; probe
  `CX-BRAIN-DISCOVERY-01` obrigatório antes.

## 17. Convergência

Rodada 1: 7,9/10 — 3 boundaries de autoridade abertas (lógico×físico×ownership; AnalyticQuery
como regime novo; git×Postgres×serving) + 21 riscos com mitigação. Rodada 2 (deltas D1–D12):
**8,8/10, barra 8,5 superada** — "as três boundaries fecharam no nível arquitetural, nenhuma
reaberta; restam fechamentos de contrato, não divergências"; os 9 fechamentos restantes foram
incorporados a este doc (§2 escopo server-side e digests normativos, §7 fonte componível, §10
corrida health×execução e health append-only, §5 dependency closure, §11 PII e
custom_instructions, §6 publicação≠promoção).
