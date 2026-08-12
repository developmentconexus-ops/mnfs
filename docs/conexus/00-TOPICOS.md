# Conexus — backlog de planejamento

> Método acordado (2026-08-10): loop Discovery → Decision → Execution, registro de decisão em
> `DECISOES.md`, evidência antes de decisão, zero cerimônia além disso. Cada tópico tem saída fixa:
> **1 decisão curta com evidência suficiente para a materialidade da escolha**. Profundo onde é caro
> errar, raso onde é barato mudar. A hierarquia A0–A10 / R0–R8 / lanes do MNFS **não se aplica** a
> estes docs; isso não significa descartar o conhecimento de engenharia acumulado no MNFS, que segue
> como evidência/candidato e será reconciliado explicitamente antes do plano de implementação.

## Como ler este arquivo

Este arquivo é o **mapa de orientação do programa**, não uma nova fonte de autoridade arquitetural.

- `DECISOES.md` + o doc de cada tópico guardam o que já foi ratificado.
- Esta página mostra **onde estamos, o que falta decidir e o que acontece depois**.
- `DECIDIDO` = autoridade atual; `PENDENTE` = ainda não decidido; `HIPÓTESE DE TRABALHO` = direção
  a validar, nunca autorização de implementação.
- Evitar proliferação documental: quando uma fase futura precisar materializar design, primeiro
  escolher quais artefatos canônicos realmente reduzem incerteza; diagramas e projeções geráveis não
  viram novas autoridades por padrão.

## Fase atual

**FASE 1 — Discovery arquitetural + decisões fundacionais.**

Em 2026-08-12, C-000..C-013 cobrem visão, requisitos, runtime Pi, sandbox E2B, registro de artefatos,
dados, integrações, agente de 1ª classe, cérebro, scaffold/frontend, sonda Mitra e observabilidade.
Ainda não existe um Implementation Plan do Conexus — deliberadamente. Permanecem tópicos fundacionais
pendentes e abre-se agora a reconciliação transversal de engenharia/execução (T17).

A Discovery de T17 pode começar **agora**; sua decisão final deve considerar os tópicos ainda
pendentes que mudam o pipeline (especialmente ciclo de vida, runtime publicado e segurança).

| # | Tópico | Pergunta central | Profundidade | Status |
|---|---|---|---|---|
| 0 | [Relação Conexus × MNFS](01-relacao-mnfs.md) | O que do MNFS sobrevive? | funda | **DECIDIDO — C-000** |
| 1 | [Visão e escopo do produto](02-visao-escopo.md) | O que É / para quem / caso 1 / o que NÃO é | funda | **DECIDIDO — C-001** |
| 2 | [Requisitos: piso + teto](03-requisitos.md) | ADOPTs (piso) + pilares P1–P3 + C1–C4 viram requisitos | funda | **DECIDIDO — C-003** |
| 3 | [Runtime do agente (harness)](04-runtime-agente.md) | Hub próprio × Mastra; Pi × Agent SDK × ACP como workers | funda | **DECIDIDO — C-002** |
| 4 | [Sandbox de execução](05-sandbox.md) | E2B × local × alternativa | funda | **DECIDIDO — C-008** (supersede C-004; ativação probe-gated `CX-SBX-E2B-01`) |
| 5 | [Registro de artefatos + 2 SDKs](06-registro-artefatos.md) | SF/dataLoader/dbAction com slug + bind params | funda | **DECIDIDO — C-005** |
| 6 | [Camada de dados](07-camada-dados.md) | Postgres×MySQL, DB por projeto, migration gate, base efêmera | funda | **DECIDIDO — C-006** |
| 7 | [Integração externa](08-integracao-externa.md) | Blueprint de conector, vault, túnel, perfil Sankhya | funda | **DECIDIDO — C-007** |
| 8 | Scaffold + frontend | Template React/Vite, UI-kit, publish | média | **DECIDIDO — C-012** (scaffold rico por digest, ownership 3 classes, outputSchema/DataMeta emenda C-005, probe CX-SCAFFOLD-V0-01) — [doc](10-scaffold-frontend.md) |
| 9 | [Agente de 1ª classe](09-agente-primeira-classe.md) | Identidade, versão, tools, headless, contexto em camadas | funda | **DECIDIDO — C-010** (kind `agent` no registro; loop leve no hub; 4 objetos novos; RC-2 acionada; tool analítica → gatilho T15) |
| 10 | Estratégia de LLM | Modelos por fase, custo | rasa → aprofunda no build | **FECHADO SEM DECISÃO NOVA** (2026-08-12) — seleção de modelo já tem mecanismo ratificado (golden eval, C-010); pesquisas ([interna](pesquisa-interna-estrategia-llm.md) + externa cruzada) viram referência de build; resíduo único: reconciliar HAR-11 ("validador de outro provedor") no T17 |
| 11 | Ciclo de vida | Git model, DEV→PROD, release, rollback | média | **DECIDIDO** — C-014 ([doc](12-ciclo-de-vida.md)) |
| 12 | Runtime publicado | Auth/RBAC, embed, storage | rasa → aprofunda no build | **DECIDIDO** — C-015 ([doc](13-runtime-publicado.md)) |
| 13 | Observabilidade mínima | Log de turno, custo, status, checklist vivo (TodoWrite→eventos→UI) + `tasks.md` durável | rasa | **DECIDIDO — C-013** (agent_event Postgres + producer_trust, Pi telemetry nativa, custo multi-estado, SERVED_VERIFIED, probe CX-OBS-V0-01) — [doc](11-observabilidade.md) |
| 14 | Segurança proporcional | Credencial server-side, bind params, tenancy — o mínimo profissional | média | **DECIDIDO** — C-016 ([doc](14-seguranca-proporcional.md)) |
| 15 | [Cérebro da empresa](15-cerebro-empresa.md) | Camada semântica por grupo de projetos: schema+regras+processos, discovery assistido, retroalimentação | funda | **DECIDIDO — C-011** (kind `brain` + `brain-binding`; AnalyticQuery = 2º regime de leitura, emenda C-010 comp.7; sonda TDD*-first; probe CX-BRAIN-V0-01) |
| 16 | [Sonda de manutenção na Mitra](16-sonda-manutencao-mitra.md) | A Mitra sustenta a segunda volta? | funda | **DECIDIDO — C-009** (14 turnos, 76 observações; manutenção por classe, conteúdo>canal, conexão/egresso como teto) |
| 17 | [Modelo de engenharia + execução agentic](23-modelo-engenharia.md) | Como intenção vira software correto: pipeline, Mission/Plan/Work Units, standards, contexto, QA, validação e Replan | funda | **DECIDIDO — C-017** (correctness antes de decompor; checkpoint humano em todo Change; validação em camadas com validador Pi fresco read-only só quando material; Finding durável + rotas determinísticas; RigorProfile calculado fail-closed; Actor Pack com standards[] bloqueante; emendas C-003/HAR-11 e C-014; Codex 7 rodadas 7,6→8,6) |

## Mapa de fases até implementação

As fases abaixo são **gates de maturidade**, não uma nova governança pesada. Discovery de uma fase
seguinte pode começar cedo quando reduz risco; o que não pode acontecer é tratar hipótese como design
congelado ou pular direto de dezenas de decisões para código.

### Fase 1 — Discovery arquitetural e decisões fundacionais **← estamos aqui**

Objetivo: decidir as fronteiras caras de mudar e preservar probes para o que ainda é hipótese.

Saídas atuais: C-000..C-016 + T10 fechado sem decisão nova (mecanismo já era do build) + Discovery T17
em andamento — último tópico antes da reconciliação.

### Fase 2 — Reconciliação de engenharia e execução agentic (T17)

Objetivo: transformar o conhecimento espalhado em **um único modelo de como o Conexus constrói
software**, sem ressuscitar a governança pesada do MNFS e sem copiar a Mitra/Factory por aparência.

Inputs obrigatórios:

- MNFS: Development Governance, Capability Realization, L0–L3, proof-first, fresh Actor,
  independent validation, Replan, proporcionalidade FAST/BOUNDED/CONTROLLED e todo aprendizado de
  implementação — como candidatos, não autoridade automática;
- [Factory AI harness pública](../research/FACTORY-AI-HARNESS-REFERENCE-MAP.md): Missions,
  correctness antes de decomposição, workers frescos, validators, Skills/Hooks, Agent Readiness,
  QA real e estado externalizado — como evidência/candidatos, não receita de implementação;
- Mitra medida: scope→build, planning docs, checklist, manutenção real, gaps e comportamentos que eram
  apenas escolha do modelo;
- Conexus C-000..C-0xx: Hub, Pi, E2B, Postgres, git bundle, Brain, scaffold, artifact registry,
  observabilidade, lifecycle/security quando decididos;
- evidência dos nossos próprios produtos (MetalDocs e Marketplace Central), principalmente classes de
  drift, contratos duplicados, padrões por módulo, gates que dependiam de memória e divergência entre
  árvore correta e runtime errado.

Perguntas a resolver — **não assumir resposta porque existia no MNFS**:

1. `Mission` continua sendo unidade útil ou `Plan/Build/Change` + Work Units é suficiente?
2. Qual hierarquia mínima: Project → ? → Work Unit → ActorRun → Evidence?
3. O que de L0/L1/L2/L3 continua necessário e como simplificar sem devolver arquitetura ao Worker?
4. Quando fresh Worker e Validator independente são obrigatórios e quando são desperdício?
5. Como materializar proporcionalidade (FAST/BOUNDED/CONTROLLED ou forma mais simples) sem criar
   uma FSM cerimonial?
6. Qual é o pipeline canônico: Discovery/Scope → correctness → plan → approval → decomposition →
   build → run → observe → verify → share → validate → compose → deploy → served verification?
7. Como findings mudam o plano: correção local × nova unidade × Replan arquitetural?
8. Como os Engineering Standards chegam ao Actor certo **sem depender de memória da sessão** e sem
   carregar um manual inteiro em todo prompt?
9. Quais decisões devem virar código/geração/gate/scaffold e quais devem continuar orientação
   consultável?
10. Como medir se uma regra da harness ainda adiciona valor conforme modelos ficam melhores?

**Regra de preservação:** C-000 continua valendo. T17 recupera conhecimento e invariantes que
sobrevivem à mudança de produto; não restaura A0–A10/R0–R8/ARR por default.

### Fase 3 — Architecture Reconciliation

Objetivo: revisar **o sistema como um todo**, não cada documento isoladamente.

Executar cross-review/adversarial review de todas as decisões e procurar:

- contradições entre documentos;
- duas fontes de verdade para o mesmo conceito;
- lacunas entre componentes que isoladamente parecem corretos;
- objetos/estados/interfaces sem consumidor;
- responsabilidades duplicadas;
- assumptions que os probes ainda não provaram;
- segurança/authority que existe em documento mas não no boundary físico;
- decisão que ficou obsoleta por uma decisão posterior;
- complexidade que não elimina mais machinery do que cria.

Saída: **Architecture Synthesis coerente** e lista fechada de probes ainda bloqueantes. A forma
exata de materialização deve reutilizar/atualizar docs canônicos, não criar um documento por
contradição.

### Fase 4 — System Design

Só depois da arquitetura reconciliada transformar conceitos em desenho implementável.

Itens esperados, conforme aplicabilidade:

```text
Domain Model
Event Model
State Machines
Database Model / ERD
API Surface / OpenAPI e contratos
Service / module boundaries
Runtime contracts
Frontend information architecture
critical flows + wireframes
background jobs
error model
security boundaries
observability model
deployment topology
migration / rollback paths
```

O objetivo não é especificar cada linha de código. É garantir que um Worker não receba escondida uma
decisão de arquitetura, contrato ou modelo de dados que deveria ter sido resolvida antes.

### Fase 5 — Vertical Architecture Proof

Antes de decompor o produto inteiro, provar uma fatia vertical real — preferencialmente o Golden Case
Sankhya — atravessando as principais fronteiras:

```text
create project
→ company brain / discovery
→ scope
→ plan + approval
→ decomposition
→ fresh Pi worker em E2B
→ código + BuildValidationDatabase
→ test + browser/runtime observation
→ SHARE via bundle + quarantine
→ independent validation
→ deploy
→ SERVED_VERIFIED
```

Se a fatia expõe falha de arquitetura, voltar à Fase 2/3/4 conforme a classe; não escalar um roadmap
sobre uma integração vertical ainda hipotética.

### Fase 6 — Implementation Planning

Com System Design e vertical proof coerentes, decompor implementação:

```text
capabilities / outcomes
→ workstreams
→ dependency graph
→ bounded work units
→ acceptance criteria
→ deciding proof
→ owners/actors
→ rollout order
```

Aqui decidimos a forma final de Mission/Milestone/Feature/Work Unit resultante de T17 — não antes.

### Fase 7 — Execução + calibração

O próprio harness executa o plano sob os contratos definidos. Evidence de implementação alimenta
calibração: reduzir machinery que o modelo já superou, fortalecer o que continua falhando e promover
novos padrões somente quando existe uma classe real de defeito/consumidor.

## Hipótese de trabalho para Engineering Standards — validar em T17

O problema observado em MetalDocs/Marketplace Central não pede um "prompt mais rígido". Pede que o
conhecimento certo esteja disponível e, quando possível, seja **impossível ou mecanicamente difícil
fazer do jeito errado**.

Direção candidata, ainda não ratificada:

```text
1. Single source / geração        → não existem seis cópias manuais da mesma verdade
2. Scaffold / golden path        → existe um jeito correto e barato de iniciar
3. Mechanical verification       → regra importante dispara sozinha; não depende de lembrar
4. Progressive disclosure        → Actor Pack recebe standards aplicáveis ao trabalho, não a enciclopédia
5. Research protocol             → integração externa começa por docs + payload real + limites, não por adivinhação
6. Runtime conformance           → prova mede o sistema executado/servido, não só a árvore
7. Tactical freedom              → modelo decide L3 dentro das invariantes; harness não roteiriza pensamento
```

### Exemplo: API interna

Se a decisão futura confirmar contract-first, a orientação não deveria ser "lembre de atualizar API,
SDK e tipos". O objetivo é uma fonte canônica (por exemplo OpenAPI) + geração + runtime validation +
verificador de paridade, enquanto error semantics, auth e idempotência têm contratos/padrões
fornecidos uma vez. Isso ataca as classes que já apareceram nos nossos repositórios.

### Exemplo: integração externa (Mercado Livre/Sankhya/etc.)

Uma integração nova não deveria começar com "faça o endpoint funcionar". Pipeline candidato:

```text
requisito real
→ documentação primária/current + Context7 quando aplicável à biblioteca
→ mapear auth, rate limits, paginação, erros e lifecycle
→ probe read-only/live quando seguro
→ capturar e classificar payloads reais, inclusive campos desconhecidos
→ congelar contrato/fixtures
→ implementar adapter
→ contract tests + conformance real bounded
→ só então consumir no domínio/UI
```

A pesquisa/probe não deve obrigar uma sequência mental específica ao modelo; ela deve ser condição de
readiness para classes de trabalho onde implementar sobre uma hipótese externa é caro.

## Evidência já medida que justifica T17

Estes não são exemplos teóricos; são falhas de classes que já pagamos:

- Marketplace Central [#6](https://github.com/developmentconexus-ops/marketplace-central/issues/6):
  uma verdade de API/routing transcrita manualmente em seis superfícies; solução aponta para geração
  e set-equality, não "mais cuidado".
- Marketplace Central [#7](https://github.com/developmentconexus-ops/marketplace-central/issues/7):
  cada módulo reinventava decode/validate/error-map/respond; comportamento de boundary virou acidente
  do módulo.
- Marketplace Central [#2](https://github.com/developmentconexus-ops/marketplace-central/issues/2)
  e MetalDocs [#87](https://github.com/developmentconexus-ops/MetalDocs/issues/87): verificadores
  bons existiam, mas checks fora de um único entrypoint/pipeline equivalem a checks que podem não
  existir para uma sessão nova.
- MetalDocs [#90](https://github.com/developmentconexus-ops/MetalDocs/issues/90): OpenAPI/codegen por
  si só não bastou; validação runtime, error writer, actor extraction e idempotência continuaram em
  dialetos paralelos.
- MetalDocs [#92](https://github.com/developmentconexus-ops/MetalDocs/issues/92): transação, SQL,
  scanning e driver errors repetidos à mão mantinham correctness por acordo visual em vez de
  machinery tipada.
- MetalDocs [#93](https://github.com/developmentconexus-ops/MetalDocs/issues/93): o padrão correto de
  consumer-owned capability port existia, mas não era requerido; a arquitetura driftou em imports,
  SQL estrangeiro e sentinels.
- Marketplace Central [#35](https://github.com/developmentconexus-ops/marketplace-central/issues/35):
  árvore/testes verdes não garantiam deployment correto — papel RLS, schema real e sessão de auth
  divergiam no runtime.
- MetalDocs [#118](https://github.com/developmentconexus-ops/MetalDocs/issues/118): até uma regra de
  "consulte/sincronize a documentação" pode falhar se o caminho referenciado está stale e nenhum gate
  prova que o conhecimento consultável ainda existe.

A síntese a validar em T17 é:

> **O modelo não precisa memorizar o jeito certo. O sistema deve tornar o jeito certo descobrível,
> barato e, para propriedades críticas, mecanicamente verificável — preservando liberdade tática onde
> inteligência do modelo agrega valor.**

## Próximo marco do programa

```text
AGORA
├─ concluir Discovery/Decision dos tópicos fundacionais pendentes
└─ iniciar inventário/reconciliação T17 em paralelo

DEPOIS
T17 ratificado + tópicos fundacionais fechados
→ Architecture Reconciliation
→ System Design
→ Vertical Architecture Proof
→ Implementation Planning
→ Execution
```

Probes já autorizados por decisões (`CX-SBX-E2B-01`, `CX-BRAIN-V0-01`, `CX-SCAFFOLD-V0-01`,
`CX-OBS-V0-01`) continuam sendo Evidence dentro da Fase 1/vertical proof quando aplicável; eles não
constituem por si um início do roadmap de implementação completo.

> **Entrada obrigatória do T15, antes de gastar a aposta mais cara** (`17-log`, OBS-47): a Mitra **já
> tem a metade estrutural** de camada semântica — `DynamicCubeQuery` + `dimension_store`, com
> dimensão, atributo tipado, função de agregação padrão por atributo, chave única, cardinalidade e
> cubo de destino, tudo em chaves i18n (UI real). O que ela **não** tem: a camada atravessar
> **projetos**, e carregar **regra e processo** — só estrutura de dado. O diferencial do Conexus é
> exatamente esses dois pontos, não "ter camada semântica".

Evidência-base: [referência Mitra](../reference/mitra/00-OVERVIEW.md) ·
[DECISION-REGISTER](../reference/mitra/DECISION-REGISTER.md) ·
[mapa congelado v0.9.0](../research/MITRA-INSPIRATION-MAP.md).
