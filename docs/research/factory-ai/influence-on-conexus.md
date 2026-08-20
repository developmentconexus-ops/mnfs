---
id: DOC-RESEARCH-FACTORY-AI-HARNESS-REFERENCE-MAP
title: Factory AI Harness Reference Map
document_type: research_map
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - public Factory AI harness reference for Conexus T17
  - classification of publicly observable Factory patterns
related:
  - DOC-RESEARCH-FIRSTMATE-INSPIRATION-MAP
  - DOC-RESEARCH-MITRA-INSPIRATION-MAP
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
review_triggers:
  - material Factory Missions architecture change
  - material public SDK, sandbox, readiness or QA contract change
  - T17 reconciliation or implementation planning begins
last_reviewed: 2026-08-12
---

# Factory AI Harness Reference Map

> Idioma: PT-BR intencionalmente. Este documento é pesquisa e referência; não é decisão do Conexus, não autoriza adoção de Factory e não restaura automaticamente mecanismos do predecessor program.

## 1. Propósito

A Factory AI foi uma das principais inspirações externas do predecessor program porque não é somente um coding agent. Ela materializa uma **harness de desenvolvimento agent-native**: runtime de agente, sessões, tools, política de autonomia, Skills, Hooks, MCP, execução headless, SDKs, Git/CI, QA real, ambientes de computação e uma camada de orquestração de trabalho longo chamada **Missions**.

O conhecimento original ficou parcialmente concentrado em sessões e acervo externo. Este documento torna a referência durável no repositório para que o T17 — Modelo de engenharia + execução agentic — consiga comparar Factory, predecessor program, Mitra, Conexus e a evidência dos nossos produtos sem depender da memória da conversa.

Uso correto:

```text
Factory pública observável
→ extrair problema, mecanismo, evidência e custo
→ comparar com falhas reais do Conexus/predecessor program
→ PRESERVE / ADAPT / REFERENCE / DEFER / REJECT
```

Uso incorreto:

```text
Factory tem
→ Conexus precisa copiar
```

## 2. Corte, fontes e nível de evidência

### 2.1 Snapshot principal

- Organização: [`Factory-AI`](https://github.com/Factory-AI)
- Documentação: [`docs.factory.ai`](https://docs.factory.ai)
- Repositório público central: [`Factory-AI/factory`](https://github.com/Factory-AI/factory)
- Snapshot principal revisado: commit [`1fd9026d72f81668d88f37237cb5a2e89a17e6e2`](https://github.com/Factory-AI/factory/commit/1fd9026d72f81668d88f37237cb5a2e89a17e6e2), de 2026-07-24
- Data da revisão deste mapa: 2026-08-12

O repositório `Factory-AI/factory` contém principalmente documentação pública, changelog, workflows e superfícies de integração. Ele **não** contém o backend proprietário completo da Factory.

### 2.2 Classes de evidência

```text
PUBLIC-CONTRACT
  documentação oficial, tipos do SDK, código público ou formato executável

VENDOR-MEASURED
  número publicado pela Factory sobre benchmark, missão ou cliente;
  útil, mas não auditado independentemente

INFERRED
  conclusão forte derivada de várias superfícies públicas;
  sempre marcada

UNKNOWN-PROPRIETARY
  detalhe não publicado; não preencher por imaginação
```

Quando narrativa comercial e contrato público divergem, o contrato do SDK/código prevalece sobre a narrativa.

### 2.3 O que “varrer o GitHub” significa aqui

Foi inventariada a organização pública e analisados em profundidade os repositórios diretamente relevantes à harness. Não faria sentido ler byte por byte de imagens, traduções, assets ou utilitários sem relação com o T17. A cobertura foi dividida assim:

| Repositório | Papel no mapa | Profundidade |
|---|---|---|
| `Factory-AI/factory` | documentação principal, Missions, CLI, settings, sandbox, readiness, QA | funda |
| `Factory-AI/droid-sdk-typescript` | contrato público de runtime, daemon, sessões, tools e observabilidade | funda |
| `Factory-AI/droid-sdk-python` | cliente JSON-RPC assíncrono e eventos tipados | média |
| `Factory-AI/droid-action` | CI/GitHub, review, segurança, trust boundaries | funda |
| `Factory-AI/factory-plugins` | plugins, droid-control, QA/evidência, security skills | funda |
| `Factory-AI/skills` | formato e exemplos de Skills | média |
| `Factory-AI/examples` | uso headless em aplicação | rasa |
| `Factory-AI/vfs` | VFS CoW, pack/adopt, branch/checkpoint de sessão | média; beta |
| `Factory-AI/legacy-bench` | benchmark de manutenção legada e autoavaliação | média |
| `Factory-AI/terminal-bench-leaderboard` | resultados/logs de benchmark de terminal | rasa |
| `Factory-AI/SERA` | pesquisa de agentes especializados e soft verification | rasa/média |
| extensões, ESLint e utilitários auxiliares | ecossistema | inventário, não arquitetura central |

### 2.4 Limites honestos

Não estão publicamente disponíveis, em detalhe suficiente para afirmação factual:

- schema interno do control plane da Factory;
- banco operacional e guarantees de crash consistency de Missions;
- scheduler/queue e algoritmo exato de lease/claim;
- prompts proprietários correntes do orchestrator/worker/validator;
- isolamento físico de todos os ambientes cloud;
- política interna completa de retries e reconciliação;
- protocolo privado entre Mission Control e workers;
- critérios privados de model routing;
- dados brutos completos dos benchmarks e missões comerciais;
- ameaça e tenancy internas completas.

Logo, este documento mapeia a **harness pública observável**, não uma reprodução da implementação proprietária.

## 3. Fato central: Factory é uma harness, não apenas um chat de código

A forma pública atual pode ser representada assim:

```text
Superfícies do operador
CLI / IDE / Web / Desktop / Slack / Linear-Jira / GitHub Actions
                         │
                         ▼
Droid runtime
CLI subprocess / daemon / SDK / JSON-RPC / sessões / turnos / streams
                         │
          ┌──────────────┼────────────────┐
          ▼              ▼                ▼
   Contexto          Capabilities       Policy
 AGENTS.md            Tools/MCP        Autonomy
 Skills               Plugins          Permissions
 Custom Droids        Hooks            Org settings
          │              │                │
          └──────────────┼────────────────┘
                         ▼
Execution target
workspace local / worktree / sandbox / Droid Computer / CI runner
                         │
                         ▼
Missions
orchestrator → fresh workers → validators → fix features → revalidation
                         │
                         ▼
Git / PR / CI / QA real / review / security / evidence / telemetry
```

A Factory combina dois produtos relacionados, porém distintos:

```text
Droid
→ runtime de coding agent, sessões, ferramentas e execução

Missions
→ sistema superior de planejamento e orquestração de trabalho longo
```

Esse recorte é transferível ao Conexus:

```text
Pi
→ runtime do Worker

Hub/T17
→ semântica de planejamento, decomposição, validação e integração
```

A similaridade não implica usar Droid nem adotar Factory como dependência.

## 4. Superfícies e contrato público do Droid

### 4.1 Superfícies de produto

O README oficial posiciona Droid em CLI, Web, Slack/Teams, Linear/Jira, Mobile e integrações de IDE. O repositório público oferece SDKs TypeScript e Python e uma GitHub Action. O valor arquitetural não é a quantidade de interfaces; é a tentativa de manter **um runtime de agente reutilizável por várias superfícies**, em vez de implementar um agente diferente em cada UI.

Fonte: [`Factory-AI/factory/README.md`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/README.md).

### 4.2 SDK TypeScript

O SDK TypeScript expõe duas formas principais:

| Runtime | Forma | Uso |
|---|---|---|
| Node | `@factory/droid-sdk/node` | inicia subprocesso Droid, sessões locais, SDK MCP tools |
| daemon/browser-safe | `@factory/droid-sdk` | conecta a daemon existente, inclusive múltiplas sessões |

Contratos públicos observados:

- `run()` para execução one-shot;
- `createSession()` / `resumeSession()` para multi-turn;
- `connectToDaemon()` para várias sessões por conexão;
- stream tipado de assistant, user, tool call, tool result, hook, error e result;
- deltas opcionais de texto, thinking, tool progress, token e estado;
- uma execução ativa por handle de sessão;
- cancellation/interrupt com resultado terminal;
- structured output via JSON Schema;
- handlers de permission e `AskUser`;
- seleção de modelo, reasoning, autonomy e interaction mode;
- tools desabilitadas, MCP, skills e hooks;
- fork, compact e rewind de sessão;
- context/token stats;
- observability injection;
- recursos de daemon para sessions, workspace, settings, models, terminals, MCP, skills, plugins, automations e Git.

Fonte: [`droid-sdk-typescript`](https://github.com/Factory-AI/droid-sdk-typescript), especialmente o [`TypeScript SDK reference`](https://github.com/Factory-AI/droid-sdk-typescript/blob/main/docs/typescript-sdk-reference.md).

### 4.3 SDK Python e JSON-RPC

O SDK Python usa JSON-RPC 2.0 sobre subprocesso `droid exec` e oferece mensagens tipadas para texto, thinking, tool use/result/progress, mudança de estado, uso de tokens, conclusão e erro. Isso confirma que a Factory não depende exclusivamente de parsing textual de terminal para integração programática.

Fonte: [`Factory-AI/droid-sdk-python`](https://github.com/Factory-AI/droid-sdk-python).

### 4.4 `droid exec`

`droid exec` é o modo headless para CI, scripts e pipelines. Suporta:

- one-shot com stdout/stderr;
- modo read-only por padrão;
- autonomia `low`, `medium`, `high`;
- saída text/JSON/stream JSON-RPC;
- continuação/fork de sessão;
- modelo e reasoning explícitos;
- worktree isolado;
- tools restritas/adicionais/desabilitadas;
- `--mission` com modelos distintos para worker/validator;
- working directory e tags;
- composição paralela por shell/CI.

A existência de JSON-RPC e SDK significa que um sistema externo pode construir sua própria UI, policy layer, scheduler e storage sem tratar o terminal como protocolo.

Fonte: [`Droid Exec`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/droid-exec/overview.mdx).

### 4.5 Insight transferível

```text
runtime de agente
≠
semântica de produto/orquestração
```

O Conexus deve manter o Pi atrás da interface mínima já decidida, enquanto estados de Work Unit, Evidence, aprovação e release pertencem ao Hub.

## 5. Auto, Spec e Mission são modos diferentes

A Factory distingue três profundidades de interação.

### 5.1 Auto

O Droid trabalha diretamente dentro da autonomia permitida. É apropriado para tarefas pequenas ou já compreendidas.

### 5.2 Specification Mode

Spec Mode transforma um objetivo em especificação e plano antes de mutar o código. Durante análise/planning, a documentação declara operação read-only. O usuário revisa e aprova antes da implementação; o plano pode ser persistido em Markdown.

Fluxo:

```text
objetivo
→ leitura/investigação read-only
→ acceptance criteria
→ technical implementation plan
→ testing/security considerations
→ aprovação
→ implementação
```

Fonte: [`Specification Mode`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/user-guides/specification-mode.mdx).

### 5.3 Missions

Missions é o modo para trabalho grande, multi-feature e longo. Adiciona orchestrator, features, milestones, workers, validators, shared artifacts e Mission Control.

### 5.4 Transferência para T17

O princípio útil é a **proporcionalidade de forma**:

```text
mudança pequena
→ execução direta com prova

tarefa material conhecida
→ plano bounded + Work Unit

outcome grande/incerto
→ correctness, decomposição, milestones e validação
```

Não é necessário copiar três produtos ou uma FSM equivalente. O T17 deve decidir a forma mínima que preserva essa proporcionalidade.

## 6. Autonomia, permissões e política

### 6.1 Níveis de autonomia

A documentação atual expõe `Off`, `Low`, `Medium` e `High`:

| Nível | Capacidade aproximada |
|---|---|
| Off | leitura e comandos allowlisted |
| Low | edição e comandos/tools de baixo risco |
| Medium | mudanças reversíveis, install, build, commit local |
| High | push, deploy, migration e efeitos de alto risco, salvo bloqueios |

Autonomy controla aprovação automática; não define sozinho quais tools existem.

### 6.2 Allowlist, denylist e blocklist

- allowlist reduz prompts para comandos conhecidos;
- denylist ainda permite execução após aprovação;
- blocklist é hard stop sem caminho de aprovação;
- settings organizacionais podem limitar autonomy e impedir enfraquecimento local.

Fonte: [`Autonomy Level`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/user-guides/auto-run.mdx).

### 6.3 Permission handlers

Nos SDKs, ausência de permission handler resulta em cancelamento da solicitação. Isso é um bom precedente de fail-closed para execução não interativa.

### 6.4 Insight para Conexus

O valor não está em copiar quatro níveis de tool prompt. Está em separar:

```text
capability disponível
×
autoridade para usar
×
aprovação automática
×
fronteira física
```

O Conexus já vai além ao colocar o Worker em E2B e manter credenciais/efeitos duráveis fora dele. T17 pode reutilizar proporcionalidade sem criar prompts por comando quando a sandbox e o Hub já resolvem fisicamente o risco.

## 7. Missions: motivação arquitetural

A Factory publicou em 2026-04-10 a arquitetura de Missions em [`How Missions Work`](https://factory.ai/news/missions-architecture). A tese central é que agentes são extremamente reativos ao contexto.

Dois modos de falha são nomeados:

```text
context dilution
→ contexto amplo acumula informação irrelevante

self-evaluation bias / adversarial context
→ quem implementou acumula razões para confirmar a própria solução
```

Daí surgem os papéis:

| Papel | Responsabilidade | O que evita |
|---|---|---|
| Orchestrator | entender, planejar, decompor, coordenar e fechar gaps | consumir toda granularidade |
| Worker | implementar feature focada com critério claro | contexto amplo e drift |
| Validator | avaliar completude/correção sem consertar | autoavaliação enviesada |

A arquitetura foi lançada publicamente em 2025-02-26 em [`Introducing Missions`](https://factory.ai/news/missions) e aprofundada em 2026.

## 8. Correctness antes da decomposição

O mecanismo mais importante para T17 é a ordem:

```text
requisitos entendidos
→ validation contract
→ features
→ milestones
→ workers
```

A Factory argumenta que criar features antes do contrato de validação contamina a definição de sucesso com o plano de implementação. O orchestrator primeiro escreve um conjunto finito de assertions comportamentais; depois features declaram quais assertions cumprem.

Artefatos mostrados publicamente incluem:

```text
validation-contract.md
features.json
services.yaml
AGENTS.md
research / operational guidelines / knowledge library
```

Exemplo de assertion publicado:

```text
VAL-AUTH-001
comportamento esperado
ferramenta de verificação
Evidence esperada
```

Esse princípio já influenciou o predecessor program como L0 correctness antes de L2 decomposition. A forma exata dos arquivos não deve ser copiada; a ordem semântica merece avaliação como invariante do T17.

## 9. Features, milestones, workers e validators

### 9.1 Features

Uma feature é uma unidade bounded de implementação. O worker recebe contexto focado e critérios de sucesso.

### 9.2 Milestones

Milestones agrupam features e definem frequência de validação. A documentação recomenda um milestone para projeto simples e maior granularidade quando o trabalho longo exige contenção de drift.

Fonte: [`Planning & Validation`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/planning.mdx).

### 9.3 Fresh workers

Cada feature usa um worker em contexto fresco. O worker acredita que terminou, mas não possui autoridade final de acceptance.

### 9.4 Dois validators

A arquitetura pública descreve:

- **scrutiny validator**: revisa implementação/qualidade;
- **user-testing validator**: exerce o sistema como caixa-preta contra o validation contract.

Validators reportam gaps; o orchestrator cria **fix features** para outros workers. O validator não corrige silenciosamente aquilo que julga.

### 9.5 Revalidation

Após fix features, o milestone é validado novamente até passar ou bloquear. Se a execução fica bloqueada, o orchestrator devolve controle ao humano.

### 9.6 Paralelismo

A Factory afirma preferir execução serial com paralelismo direcionado onde o custo de coordenação é baixo. A própria documentação mantém “paralelismo é necessário?” como questão aberta. Logo:

```text
multi-agent
≠
paralelismo amplo obrigatório
```

## 10. Medição pública de uma Mission

A Factory publicou uma Mission que construiu um clone do Slack. Estes números são **VENDOR-MEASURED**, não auditoria independente:

| Métrica | Valor publicado |
|---|---:|
| Runtime total | 16,5 h |
| Agent runs | 185 |
| Tokens totais | 778,5 M |
| Tempo de implementação | 9,98 h |
| Tempo de validação | 6,14 h — 37,2% |
| Features originais | 40 |
| Fix features | 21 |
| Fix ratio | 34,4% do trabalho de implementação |
| Issues achados pelos validators | 81, sendo 65 blocking |
| Rodadas de validação | 2–4 por milestone |
| Linhas geradas | 38,8k, 52,5% testes |
| Statement coverage | 89,25% |

Fonte: [`How Missions Work`](https://factory.ai/news/missions-architecture), 2026-04-10.

Interpretação útil:

- validação real tem custo material;
- “um worker forte” não eliminou correções;
- a maior parte da confiabilidade veio do loop de validação/correção;
- uma Mission completa pode ser economicamente incompatível com trabalho pequeno;
- F1 do Conexus precisa de validação proporcional, não de uma Mission para cada alteração.

A própria documentação atual chama Missions de **research preview** e registra três perguntas abertas: paralelismo, maximização de correctness e custo × qualidade.

## 11. Missões não são fire-and-forget

Mission Control permite ao operador:

- acompanhar features/milestones;
- inspecionar workers;
- alterar modelos;
- pausar;
- intervir;
- reorientar;
- replanejar;
- retomar uma Mission passada.

A documentação descreve o humano como project manager de agentes, não como observador passivo.

Fonte: [`Running in the CLI`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/features/missions/running-cli.mdx) e [`Running in Desktop/Web`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/web/missions.mdx).

### Finding importante

O troubleshooting público sugere, em um caso de worker travado, pedir ao orchestrator que marque o item como completo e siga. Para o Conexus:

```text
stuck
≠
complete
```

Estados honestos seriam `BLOCKED`, `FAILED`, `DEFERRED` ou `SKIPPED_BY_AUTHORITY`. Essa recomendação da Factory não deve ser transportada como semântica de domínio.

Fonte: [`Missions troubleshooting`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/troubleshooting.mdx).

## 12. Contexto externalizado e progressive disclosure

A Factory não tenta carregar toda a organização num único prompt. Ela combina:

```text
AGENTS.md
Skills
Custom Droids
Plugins
MCP
Hooks
shared Mission artifacts
```

A ideia transferível é separar tipos de conhecimento.

| Conhecimento | Superfície Factory |
|---|---|
| convenções gerais do repositório | `AGENTS.md` |
| workflow/expertise reutilizável | Skill |
| agente especializado com tool/model policy | Custom Droid |
| sistema externo | MCP |
| regra determinística de lifecycle | Hook |
| pacote distribuível | Plugin |
| estado de trabalho longo | Mission artifacts |

## 13. Skills

Skills são diretórios com `SKILL.md`/`skill.mdx`, frontmatter e arquivos auxiliares. Podem conter instruções, schemas, scripts e checklists. Podem ser invocadas pelo usuário ou pelo modelo; flags controlam invocação automática.

Boas práticas publicadas:

- responsabilidade única;
- inputs explícitos/estruturados;
- success criterion claro;
- verification section;
- proof artifacts;
- idempotência;
- sem estado escondido fora da branch;
- referenciar docs existentes em vez de duplicá-las;
- PR sem merge automático em fluxos próximos de produção.

Fonte: [`Skills`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/skills.mdx) e [`Factory-AI/skills`](https://github.com/Factory-AI/skills).

### Insight para T17

Skills são uma realização concreta de **progressive disclosure**. O Actor não recebe a enciclopédia inteira; recebe a capacidade aplicável ao trabalho atual.

## 14. Custom Droids e subagents

Subagents possuem:

- contexto e sessão próprios;
- prompt próprio;
- tools próprias;
- modelo/reasoning próprios;
- autonomy própria;
- execução foreground/background;
- um retorno final ao parent;
- `AskUser` desabilitado;
- proibição de subagent criar outro subagent.

A configuração em Markdown pode representar reviewer, researcher, migration writer ou outro papel. O parent mantém o contexto principal e delega trabalho focado.

Fonte: [`Subagents / Custom Droids`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/custom-droids.mdx).

### Transferência cuidadosa

O Conexus precisa de papéis, mas não necessariamente de uma biblioteca dinâmica de subagents F1. `Lead`, `Worker` e `Validator` podem começar como contratos internos do Hub; custom-agent marketplace só nasce com segundo consumidor real.

## 15. Hooks: orientação versus mecanismo

A Factory define Hooks como comandos determinísticos executados em eventos do lifecycle, por exemplo:

- `PreToolUse`;
- `PostToolUse`;
- `UserPromptSubmit`;
- `Stop`;
- `SubagentStop`;
- `PreCompact`;
- `SessionStart`/`SessionEnd`.

Eles podem bloquear tools, formatar código, registrar comandos ou proteger arquivos. A documentação afirma explicitamente que hooks tornam certas ações obrigatórias em vez de depender da escolha do Droid.

Fonte: [`Hooks`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/hooks-guide.mdx).

### Limite

Hooks executam com o ambiente e credenciais presentes; hook malicioso pode exfiltrar dados. Para o Conexus, regras críticas devem preferir:

```text
Hub compiler/gate
→ boundary confiável
```

em vez de shell hook arbitrário dentro do guest.

## 16. Plugins e MCP

Plugins podem empacotar:

```text
skills/
droids/
commands/
mcp.json
hooks.json
```

O marketplace público inclui revisão, segurança, browser/terminal automation, PR workflows e outras capacidades.

Fonte: [`Factory Plugins Marketplace`](https://github.com/Factory-AI/factory-plugins).

MCP expõe integrações externas; a Factory suporta políticas organizacionais e OAuth/configuração por servidor. O valor para o Conexus é a borda de interoperabilidade, já preservada em C-002. Não há motivo para copiar marketplace ou governança de plugins na F1.

## 17. `droid-control`: arquitetura de atenção, não FSM gigante

O documento público mais valioso para T17 fora de Missions é [`droid-control/ARCHITECTURE.md`](https://github.com/Factory-AI/factory-plugins/blob/master/plugins/droid-control/ARCHITECTURE.md).

Ele parte de uma restrição:

> o agente que opera a ferramenta também é o runtime; arquitetura é information architecture para decidir o que carregar, ignorar, delegar e usar como prova.

Padrões:

```text
intent contract
→ routing por target/stage/artifact
→ atom skill relevante agora
→ handoff explícito
→ próxima etapa
→ verify contra commitments originais
```

A Factory chama isso de:

```text
waterfall by handoff, not framework
```

Não existe necessariamente uma engine central impondo cada transição. O handoff contém o bastante para tornar o próximo passo óbvio.

Outras regras transferíveis:

- parent mantém julgamento;
- workers recebem comandos mecânicos resolvidos;
- contexto específico de plataforma só é carregado quando aplicável;
- artifacts e paths recebem escopo por run;
- Evidence final é comparada aos commitments originais;
- se uma mudança faz todo Droid ler mais instrução global, provavelmente a arquitetura está errada.

Essa referência apoia uma síntese importante para o Conexus:

```text
contratos fortes nos handoffs
+
capabilities escopadas
+
pouca maquinaria central
```

## 18. Agent Readiness

A Factory mede se o repositório permite autonomia. O modelo público contém cinco níveis:

1. Functional;
2. Documented;
3. Standardized;
4. Optimized;
5. Autonomous.

E nove pilares:

- style & validation;
- build system;
- testing;
- documentation;
- development environment;
- debugging & observability;
- security;
- task discovery;
- product & experimentation.

O score desbloqueia níveis com 80% dos critérios anteriores e pode ser calculado por repo ou subapp. `/readiness-report` gera diagnóstico e `/readiness-fix` tenta remediação.

Fontes: [`Agent Readiness Overview`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/web/agent-readiness/overview.mdx) e [`readiness-report`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/features/readiness-report.mdx).

### O que preservar

```text
agente bom + repo ilegível
→ resultado ruim
```

Build reproduzível, testes executáveis, logs estruturados e instruções atualizadas são parte do produto de autonomia.

### O que não copiar

Um score global pode virar checklist theater. O Conexus deve preferir prerequisites/probes específicos da Work Unit e do Golden Path, não implementar cinco níveis e dashboards antes de ter volume.

## 19. QA contra o sistema real

A Factory oferece `/install-qa` e `/qa`:

1. analisa stack, apps, auth, ambientes, flags e integrações;
2. pergunta o que não conseguiu inferir;
3. gera config e sub-skills por app;
4. lê o diff;
5. seleciona somente fluxos afetados;
6. executa web, CLI/TUI ou API;
7. captura screenshot/snapshot/response;
8. produz relatório `PASS/FAIL/BLOCKED`.

Fonte: [`Automated QA`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/guides/skills/automated-qa.mdx).

A documentação de Missions também exige uma forma scriptável de subir e dirigir o app e recomenda logs acessíveis ao agente. Sem isso, user-testing não é confiável.

### Transferência para Conexus

```text
build/test
≠
usuário conseguiu usar
```

O Conexus já decidiu `RUN → OBSERVE → ASSERT` e `SERVED_VERIFIED`; T17 deve encaixar a validação da Work Unit/Change nesse pipeline sem reconstruir toda a skill factory.

## 20. Code review e security review

A Factory publica workflows de PR review e security review via `droid exec`/GitHub Action.

Padrões importantes:

- revisar diff e contexto de PR;
- comentários inline;
- separar code review de security review;
- segurança em duas passadas: candidate generation → validation de exploitability/reachability;
- full-repo audit por Mission quando necessário;
- modelo/depth configurável;
- evitar style noise;
- findings estruturados.

Fontes:

- [`Automated Code Review`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/guides/droid-exec/code-review.mdx)
- [`Security Review`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/enterprise/security-review.mdx)
- [`Factory-AI/droid-action`](https://github.com/Factory-AI/droid-action)

### Trust-boundary finding no `droid-action`

O CI Medic público possui controles mecânicos relevantes:

- não executa PRs de forks em `workflow_run` com secrets/write tokens;
- policy é lida da default branch, não da PR;
- editing tools são concedidas somente quando fix está habilitado;
- protected paths são revertidos/enforced após a execução;
- scope de fix é implementado retendo tools, não só por prompt;
- budgets distinguem retry, fix attempts e total de runs por PR.

Esse é um ótimo precedente para:

```text
política não pode ser alterada pelo próprio change que ela julga
```

## 21. Sandbox local da Factory

O sandbox público está marcado como **Beta**.

Implementação documentada:

- macOS Seatbelt;
- Linux/WSL2 bubblewrap + seccomp;
- proxy HTTP/SOCKS para egresso;
- modo `per-command` ou `whole-process`;
- write deny fora do CWD por padrão;
- network deny exceto domínios Factory e allowlist;
- fail-closed quando a isolação necessária não está disponível;
- policy aplicada a commands, hooks, MCP e subagents.

Limitações assumidas pela própria Factory:

- domínio permitido continua sendo canal de exfiltração;
- CWD permitido pode ser destruído/modificado;
- sandbox é defense in depth;
- para código realmente não confiável, usar container ou VM dedicada.

Fonte: [`Sandbox`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/sandbox.mdx).

### Conclusão para Conexus

A decisão E2B/microVM permanece mais coerente com full agency e código não confiável. O sandbox local da Factory é referência de policy layering, não candidato para substituir C-008.

## 22. Worktrees, Git e SCM

O Droid suporta `--worktree`, branches e operações Git. O daemon expõe commit, push, branch e create PR. Managed Droid Computers podem receber credenciais Git automaticamente.

Isso prova valor operacional de isolamento por branch/worktree, mas entra em tensão com o Conexus:

```text
Factory
→ worker/máquina pode possuir credencial Git e publicar

Conexus
→ worker nunca recebe write credential remoto
→ SHARE bundle
→ quarantine no Hub
→ validação
→ push/PR só pelo Hub
```

A forma Conexus reduz blast radius e mantém o Hub como autoridade de integração. Factory continua referência de UX/parallel work, não de autoridade Git.

## 23. Droid Computers

Droid Computers são máquinas persistentes, BYOM ou gerenciadas. A documentação atual descreve máquina gerenciada com 4 CPU, 8 GB RAM e 6 GB swap, usuário com sudo, auto-pause/resume, métricas, SSH/port-forward e credenciais Git.

Fonte: [`Droid Computers`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/features/droid-computers.mdx).

O padrão prova que agentes long-running se beneficiam de uma máquina de desenvolvimento completa. Ele não prova que persistência é necessária para cada Worker.

Disposição preliminar:

```text
REFERENCE
```

Conexus F1 usa sandbox efêmero por Work Unit. Persistência só volta se instalação/estado repetido medido superar o custo de limpeza, segurança e drift.

## 24. VFS público da Factory-AI

`Factory-AI/vfs` é um projeto público Beta descrito como filesystem para agentes:

- SQLite-backed;
- copy-on-write;
- FUSE/NFS;
- delta proporcional ao trabalho;
- `pack`/`adopt` entre máquinas;
- branch de sessão;
- history/revert;
- artifact content-addressed;
- checkpoint para S3-compatible storage;
- integrity checks e base pin;
- preservação de dirty/staged/untracked state.

Fonte: [`Factory-AI/vfs`](https://github.com/Factory-AI/vfs).

### Limite de evidência

Não encontrei contrato público que prove que VFS é o storage interno de produção das Missions atuais. Ele deve ser tratado como projeto público relacionado, não como descrição do backend proprietário.

### Valor para T17

É referência futura para:

- handoff de workspace não commitado;
- checkpoint verificável;
- base pin;
- branch/fork de sessão;
- content-addressed execution artifact.

Não construir F1: Git bundle + result commit + E2B já cobrem o caminho decidido. VFS só volta se existir consumidor real de dirty-state handoff.

## 25. Observabilidade e custo

O SDK TypeScript permite injetar logger, metrics e tracing. Seu contrato evita enviar prompt text, message content, tool inputs, raw output e stack traces pelo adapter de observabilidade. Eventos de token usage e resultados incluem duração/turn count quando disponíveis.

Mission Control mostra:

- tempo;
- créditos;
- progresso;
- workers/milestones;
- output detalhado;
- critérios e commits.

Hooks também podem registrar ações.

### Limite público

Não existe schema público completo do banco operacional de Missions nem guarantee pública de que toda telemetria sobreviva a crash. O Conexus mantém `agent_event`/Postgres como autoridade própria e usa Pi/E2B/Spotlight como producers.

## 26. Modelos por papel

Missions permite modelos/reasoning diferentes para:

- orchestrator;
- workers;
- validators.

Subagents também podem mapear `light`, `medium`, `heavy` a modelos diferentes. O artigo de lançamento de 2025 mostra uso multi-provider por papel, mas isso é escolha da Factory em escala, não prova de requisito universal.

Fonte: [`Missions Reference`](https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/reference.mdx).

Conclusão para T10/T17:

```text
fresh context + papel separado
→ valor independente de provider diferente
```

Provider/model diversity permanece gatilho, não invariante F1.

## 27. Benchmarks e pesquisa pública

### 27.1 Legacy-Bench

O benchmark público cobre manutenção/migração de stacks legadas. Entre os achados publicados:

- pass rates de 16,9% a 42,5% no benchmark completo;
- bug fix supera implementação, que supera migração;
- erros visíveis ajudam iteração;
- nenhum modelo vence todas as categorias;
- em **97% das falhas**, o agente acreditou ter resolvido.

Fonte: [`Factory-AI/legacy-bench`](https://github.com/Factory-AI/legacy-bench).

O último ponto é muito transferível para ERP/brownfield:

```text
worker claim
≠
correctness
```

### 27.2 Terminal-Bench leaderboard

O repositório preserva logs de execuções repetidas e alerta contra secrets nos logs. É evidência de investimento em avaliação reproduzível, não prova direta da harness de produção.

Fonte: [`Factory-AI/terminal-bench-leaderboard`](https://github.com/Factory-AI/terminal-bench-leaderboard).

### 27.3 SERA

SERA é pesquisa sobre especialização de repository agents e soft verification, com pipeline de geração, distillation, eval e resume. É relevante para o futuro de modelos especializados, não mecanismo necessário do Conexus F1.

Fonte: [`Factory-AI/SERA`](https://github.com/Factory-AI/SERA).

## 28. O que a Factory pública prova

Com bom grau de confiança, a evidência pública prova que é viável productizar:

1. runtime de coding agent por SDK/daemon/JSON-RPC;
2. planejamento read-only antes da execução;
3. orquestração de trabalho longo por features/milestones;
4. fresh workers;
5. validators separados;
6. externalização de contexto em artifacts;
7. Skills/AGENTS/Hooks/MCP como camadas diferentes;
8. headless CI e GitHub workflows;
9. QA dirigindo sistema real;
10. browser/terminal evidence;
11. policy de autonomy/tools em camadas;
12. repo readiness como prerequisite de autonomia;
13. intervenção humana em Missions longas;
14. modelo por papel;
15. trabalho paralelo com worktrees quando aplicável.

## 29. O que a Factory pública NÃO prova

A evidência não prova que:

- `Mission` seja a melhor unidade de domínio para o Conexus;
- toda feature precise de fresh validator agent;
- paralelismo amplo melhore custo/qualidade;
- provider diferente seja necessário para independência;
- cinco níveis de readiness sejam melhores que probes específicos;
- persistent computers sejam melhores que E2B efêmero;
- sessão possa ser autoridade operacional durável;
- Skills substituam gates mecânicos;
- hooks sejam boundary de segurança forte;
- direct Git credentials sejam aceitáveis no nosso threat model;
- métricas de uma Slack clone generalizem para apps Sankhya;
- Missions evitem false completion em todos os crash/retry paths;
- a implementação proprietária possua guarantees equivalentes ao predecessor program/Conexus.

## 30. Factory × predecessor program × Conexus

| Dimensão | Factory | predecessor program legado | Conexus atual |
|---|---|---|---|
| Produto | agent-native development platform | harness local planning-first | plataforma AI-first para apps de negócio |
| Runtime | Droid CLI/daemon/SDK | Pi planejado; kernel sem LLM | Pi SDK em E2B |
| Unidade grande | Mission | Mission/Milestone/Feature | aberto no T17; `Change` já existe |
| Unidade de execução | Feature/subagent run | Execution Unit/Track/Attempt | Work Unit/ActorRun |
| Estado | session + Mission artifacts + Git + serviço Factory | SQLite + Git | Postgres Hub + Git |
| Workspace | local/worktree/sandbox/computer | WSL2/worktree/lease | E2B microVM efêmera |
| Transporte do resultado | Git/commit/push/PR | Git/Track | bundle sem credencial → quarantine Hub |
| Contexto | AGENTS/Skills/Droids/artifacts | Context Pack/Standards | Actor Pack compilado |
| Correctness | validation contract antes de feature | L0 + criteria | lacuna explícita do T17 |
| Validação | scrutiny + user-testing | Claim/Receipt/Verdict planejado | gates + validator a decidir proporcionalmente |
| QA | browser/CLI/API real | Golden Paths/Evidence | RUN/OBSERVE/ASSERT + SERVED_VERIFIED |
| Security | autonomy, org policy, local sandbox, hooks | authority/effects/contracts | microVM, secrets fora, Gateway, git mediado |
| Release do app | fora do foco principal | não chegou | ReleaseManifest + CAS + conformance |
| Escala | enterprise/multi-surface | operador solo | operador solo F1, SaaS futuro |

## 31. Disposição preliminar para o T17

Esta tabela é input de pesquisa, não decisão.

| Padrão Factory | Disposição candidata | Racional para Conexus |
|---|---|---|
| correctness/validation contract antes da decomposição | **PRESERVE + ADAPT** | maior lacuna atual; forma deve ser mínima e ligada a proof |
| features declarando assertions cumpridas | **ADAPT** | ligar Work Unit a critérios, sem importar `features.json` por obrigação |
| milestones definindo frequência de validação | **ADAPT** | útil para outcome grande; desnecessário em change pequeno |
| fresh worker por unidade material | **PRESERVE** | já ratificado; evita context dilution |
| validator fresco que não conserta | **ADAPT** | aplicar quando material; gates mecânicos bastam para unidades simples |
| user-testing caixa-preta | **PRESERVE** | necessário quando outcome é interação real; integrar ao runtime já decidido |
| fix features após finding | **ADAPT** | `Finding → local correction / fix Work Unit / Replan` |
| externalized shared artifacts | **PRESERVE** | Postgres/Git/Actor Pack como autoridade, não session transcript |
| orchestrator delega investigação detalhada | **ADAPT** | protege contexto; só quando investigação é realmente separável |
| serial por padrão + paralelismo dirigido | **PRESERVE** | menor coordenação para operador solo |
| Skills como progressive disclosure | **PRESERVE + ADAPT** | standards aplicáveis por Actor Pack; evitar manual global |
| Hooks para regras determinísticas | **ADAPT** | implementar no Hub/gates; não confiar em shell arbitrário no guest |
| Custom Droids dinâmicos | **DEFER** | roles internas bastam na F1 |
| Plugin marketplace | **DEFER** | nenhum segundo produtor/consumidor real |
| Agent Readiness score 1–5 | **REFERENCE** | adotar princípio, não score/framework |
| generated QA skill per app | **ADAPT** | scaffold pode gerar contrato de start/flows; não precisa skill generator geral |
| autonomia Off/Low/Medium/High | **REFERENCE/ADAPT** | proporcionalidade existe; aproveitar boundaries já decididos |
| sandbox local Beta | **REFERENCE** | E2B é boundary F1 |
| persistent Droid Computers | **DEFER/REJECT F1** | estado durável/credencial aumenta drift e blast radius |
| direct Git push pelo worker | **REJECT** | Hub medeia Git |
| worktree por sessão | **REFERENCE** | bundle/branch por Change resolve o caso atual |
| session resume/fork/rewind | **REFERENCE** | UX útil; session permanece não-authority |
| VFS dirty-state teleport | **DEFER** | não há consumidor além do result commit/bundle |
| provider diferente por validator | **DEFER** | fresh context é a propriedade; provider diversity por gatilho |
| model routing light/medium/heavy | **DEFER** | medir antes; aliases simples bastam |
| enterprise policy hierarchy completa | **DEFER** | operador solo |
| policy lida fora da PR/default branch | **PRESERVE** | change não pode enfraquecer o gate que o julga |
| validators podem ser desligados | **ADAPT** | somente por não-aplicabilidade explícita e verificável |
| marcar worker travado como complete | **REJECT** | false completion |
| expor thought process como status | **REJECT/AVOID** | expor eventos/evidence, não raciocínio privado como autoridade |
| TDD universal por worker | **ADAPT** | TDD quando test é proof correto; não ritual em docs/config |

## 32. Forma mínima sugerida para a F1 do Conexus

O menor conjunto que captura o valor da Factory sem copiar sua escala é:

```text
User intent
→ Scope/Discovery
→ Correctness assertions verificáveis
→ plano aprovável quando material
→ Work Units ligadas às assertions
→ fresh Pi Worker em E2B por unidade material
→ result commit + bundle
→ mechanical gates
→ RUN/OBSERVE/ASSERT quando aplicável
→ fresh validator somente por risco/integração/comportamento
→ Finding tipado
→ correction / fix Work Unit / Replan
→ composition
→ ReleaseManifest / Promote / SERVED_VERIFIED
```

Não necessário na F1:

```text
Mission engine genérica
parallel fleet
plugin marketplace
custom-droid builder
readiness scoring platform
persistent agent computers
VFS próprio
multi-provider orchestrator
enterprise policy hierarchy
validator agent para toda mudança trivial
```

## 33. Perguntas que a Factory ajuda o T17 a responder

1. O Conexus precisa do objeto `Mission` ou `Change + correctness + Work Units` já basta?
2. Correctness será uma lista de assertions, um Validation Contract ou outra forma menor?
3. Qual ligação mecânica entre assertion, Work Unit e Evidence?
4. Quando milestone existe e quando uma única composição é suficiente?
5. Quando validator agent é necessário versus gate determinístico?
6. User-testing valida cada Work Unit, cada milestone ou somente o Change composto?
7. Qual é o handoff tipado mínimo entre Worker e Hub?
8. O que do Actor Pack é eager e o que é progressive disclosure?
9. Quais rules viram Hub gate, compiler, scaffold, Skill ou apenas guidance?
10. Como impedir que policy do Change enfraqueça o próprio gate?
11. Como Findings criam fix units sem gerar loop infinito?
12. Qual budget/cap de correção é proporcional ao operador solo?
13. Como medir valor de uma regra e removê-la quando o modelo/ambiente a torna obsoleta?
14. Qual status honesto substitui qualquer `complete` sem Evidence?
15. Como preservar julgamento no parent e delegar somente trabalho mecânico/resolvido?

## 34. Critério de uso futuro

Quando T17 ou implementação consultar este documento:

```text
1. verificar review trigger e fontes atuais
2. identificar o problema real do Conexus
3. localizar o mecanismo Factory correspondente
4. separar PUBLIC-CONTRACT de VENDOR-MEASURED
5. comparar custo/overhead
6. escolher a forma mínima suficiente
7. exigir probe/consumidor antes de adicionar machinery
```

Uma referência Factory só deve virar mecanismo do Conexus quando responder:

```text
qual falha real elimina?
quem consome?
qual autoridade mantém?
qual evidence prova?
qual machinery substitui/remove?
qual gatilho permite deletá-la depois?
```

## 35. Registro de fontes primárias

### Arquitetura e Missions

- Factory, **Introducing Missions**, 2025-02-26: <https://factory.ai/news/missions>
- Factory, **How Missions Work**, 2026-04-10: <https://factory.ai/news/missions-architecture>
- Missions overview, snapshot 2026-07-24: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/overview.mdx>
- Planning & Validation: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/planning.mdx>
- Missions reference: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/reference.mdx>
- Running CLI: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/features/missions/running-cli.mdx>
- Running Web/Desktop: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/web/missions.mdx>
- Troubleshooting: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/features/missions/troubleshooting.mdx>

### Runtime e integrações

- Factory public repo: <https://github.com/Factory-AI/factory>
- TypeScript SDK: <https://github.com/Factory-AI/droid-sdk-typescript>
- Python SDK: <https://github.com/Factory-AI/droid-sdk-python>
- Droid Exec: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/droid-exec/overview.mdx>
- Specification Mode: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/user-guides/specification-mode.mdx>
- Autonomy: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/user-guides/auto-run.mdx>
- Settings: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/settings.mdx>
- Hierarchical settings: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/enterprise/hierarchical-settings-and-org-control.mdx>

### Contexto, Skills e policy

- Skills: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/skills.mdx>
- Custom Droids/Subagents: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/custom-droids.mdx>
- Hooks: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/hooks-guide.mdx>
- Plugin marketplace: <https://github.com/Factory-AI/factory-plugins>
- Skills examples: <https://github.com/Factory-AI/skills>
- droid-control architecture: <https://github.com/Factory-AI/factory-plugins/blob/master/plugins/droid-control/ARCHITECTURE.md>

### QA, review e readiness

- Automated QA: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/guides/skills/automated-qa.mdx>
- Code review: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/guides/droid-exec/code-review.mdx>
- Security review: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/enterprise/security-review.mdx>
- Droid Action: <https://github.com/Factory-AI/droid-action>
- Agent Readiness: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/web/agent-readiness/overview.mdx>
- Readiness report/fix: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/features/readiness-report.mdx>

### Execution environments e pesquisa

- Sandbox: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/configuration/sandbox.mdx>
- Droid Computers: <https://github.com/Factory-AI/factory/blob/1fd9026d72f81668d88f37237cb5a2e89a17e6e2/docs/cli/features/droid-computers.mdx>
- VFS: <https://github.com/Factory-AI/vfs>
- Legacy-Bench: <https://github.com/Factory-AI/legacy-bench>
- Terminal-Bench logs: <https://github.com/Factory-AI/terminal-bench-leaderboard>
- SERA: <https://github.com/Factory-AI/SERA>

## 36. Síntese

```text
Factory
→ demonstra uma harness completa, multi-superfície e extensível
→ organiza trabalho grande por correctness, fresh workers e validators
→ usa Skills/Hooks/MCP/Readiness para tornar o repositório operável por agentes
→ valida software real, não apenas diffs
→ admite custo, falhas e perguntas abertas de Missions

Conexus
→ deve preservar os princípios que eliminam classes reais de falha
→ manter Hub/Postgres/Git como autoridade própria
→ usar Pi em E2B sem credencial remota
→ aplicar validação proporcional
→ evitar importar a maquinaria enterprise/experimental antes de consumidor real
```

A principal lição não é “construir uma Factory menor”. É:

> **Projetar a informação, os handoffs e as fronteiras para que o agente receba somente o necessário, o sistema verifique o que importa e o operador intervenha apenas onde existe julgamento real.**


---

---
id: DOC-RESEARCH-FIRSTMATE-INSPIRATION-MAP
title: FirstMate Inspiration Map
document_type: research_map
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - classification of FirstMate patterns for predecessor program
related:
  - DOC-PRODUCT-BLUEPRINT
  - ADR-0001
  - ADR-0003
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# FirstMate Inspiration Map

## 1. Purpose

FirstMate is a reference implementation for operating a visible crew of coding agents.

predecessor program does not fork FirstMate. It selectively adopts product and operational patterns while retaining a different domain model and authority system.

Classification:

```text
ADOPT
ADAPT
REFERENCE ONLY
REJECT
```

## 2. Executive map

| FirstMate pattern | Classification | predecessor program treatment |
|---|---|---|
| One liaison / lead | ADOPT | Operator speaks primarily to predecessor program Lead |
| Visible worker crew | ADAPT | Worker Runs/Tracks visible; domain state remains SQLite |
| Ship and scout task shapes | ADAPT | Writer and Investigator Role Contracts |
| Brief on disk before spawn | ADOPT | Context Pack and Current Authority Snapshot |
| Isolated worktrees | ADOPT | Treehouse Lease per Write Track |
| Restart reconciliation | ADOPT + STRENGTHEN | Reconcile SQLite/Git/Treehouse/process/filesystem |
| Event-driven supervision | ADAPT | Domain Events plus replaceable notifications |
| Durable wake principles | ADAPT | Messages wake; state/artifacts remember |
| Semantic worker lifecycle | ADOPT | Worker Run states separate from process heuristics |
| Short messages pointing to artifacts | ADOPT | `predecessor programMessage` with Artifact refs |
| Preserve unlanded work | ADOPT | No release until integrated or explicitly abandoned |
| Operator authority | ADOPT + FORMALIZE | D0–D5 Decisions and A0–A5 autonomy |
| Treehouse | ADOPT behind adapter | Physical pool/lease only |
| Herdr | OPTIONAL | Operational projection only |
| Lavish | ADAPT | Structured plan/decision review |
| Full distro/fork | REJECT | predecessor program remains its own product |
| Watcher matrix | REFERENCE ONLY | Add only with measured need |
| Multi-harness compatibility | REJECT | Pi-first |
| Session UI as state | REJECT | Session is operational projection |
| Auto merge/ship semantics | REJECT | Integration and Delivery Gates govern |

## 3. One liaison

Adopt:

```text
Operator
↔ predecessor program Lead
↔ bounded Actors
```

Benefits:

- lower tab and context switching;
- consolidated Decisions;
- one accountable coordinator;
- workers remain specialized.

predecessor program strengthens the pattern by making the Lead a governance role, not a super-worker.

## 4. Ship and scout

FirstMate distinguishes work that writes from work that investigates.

predecessor program maps this to:

```text
Writer Worker
→ bounded Write Track and Claim

Investigator
→ read-only question, budget, exit criteria and report
```

A scout result is not implementation.

A Writer does not expand into broad investigation without escalation.

## 5. Brief before spawn

Adopt as a hard rule.

predecessor program artifact:

```text
Current Authority Snapshot
+
Context Pack
+
Role Contract
```

The pack contains:

- target;
- criteria;
- scope;
- write-set;
- Standards;
- commands;
- security policy;
- output contract;
- termination and escalation.

## 6. Worktrees and Treehouse

Adopt Treehouse as a narrow external adapter.

Treehouse owns:

- physical worktree acquisition;
- path;
- external lease ID;
- physical release.

predecessor program owns:

- semantic Write Track;
- holder;
- Attempt;
- Claim;
- trust;
- acceptance;
- integration;
- release authorization.

Worktree is the unit of concurrent write Track, not session or retry.

## 7. Visibility

FirstMate demonstrates the value of visible background workers.

predecessor program provides three layers:

```text
Domain state
→ authoritative

Operational projection
→ process/session/worktree

Terminal projection
→ optional Herdr
```

A visual `done` indicator never closes a Feature.

## 8. Restart reconciliation

Adopt and strengthen.

Fresh Lead does not depend on the old transcript.

It compares:

- SQLite;
- Git;
- Treehouse;
- filesystem;
- process state;
- Pi session artifacts.

Result:

- healthy;
- divergence;
- unknown;
- safe action;
- required Authority.

## 9. Event-driven supervision and wake

Adopt the insight:

```text
polling every transcript line is wasteful
```

Adaptation:

- Domain Events persist facts;
- notification transports can wake Actors;
- artifacts carry payload;
- Reconcile recovers lost messages;
- no transport becomes authority.

Potential future transports:

- process stdin;
- Pi SDK/RPC;
- `pi-link`;
- cloud queue.

## 10. Semantic lifecycle

Adopt lifecycle distinct from process output:

```text
STARTING
RUNNING
IDLE_ADDRESSABLE
EXITED
LOST
CANCELLED
```

Separate:

```text
Worker Run
Attempt
Claim
Write Track
```

Process alive does not prove progress.

Process exit does not prove completion.

## 11. Short messages and artifacts

Adopt:

```text
small envelope
+
Artifact reference
```

Messages do not carry:

- whole diff;
- whole plan;
- logs;
- Evidence Bundle;
- contract.

Lost message does not lose state.

## 12. Operator authority and preservation

Adopt:

- Operator owns product and irreversible Decisions;
- workers cannot destroy unlanded work;
- cleanup is explicit;
- cancellation preserves evidence/diff;
- worktree stays until integration or abandonment.

predecessor program formalizes this with:

- Authority Matrix;
- Effect Request;
- Recovery action;
- fencing;
- Evidence.

## 13. What predecessor program adds

FirstMate inspiration is operational. predecessor program adds:

- Mission/Milestone/Feature contracts;
- criteria hierarchy;
- Product Roadmap Milestones;
- Capability Realization Method;
- Claim/Receipt/Verdict;
- Engineering Standards;
- Golden Paths;
- Quality Posture;
- Security Environments;
- Credential Grants;
- External Effects;
- Evidence Bundles;
- Evaluation and Calibration.

## 14. Why no full fork

A fork would inherit:

- distro decisions;
- watcher architecture;
- multiple harness compatibility;
- session-first semantics;
- release cadence;
- unrelated UI/runtime assumptions.

predecessor program needs:

- Pi-first narrow runtime;
- TypeScript modular monolith;
- SQLite authority;
- WSL2-first local proof;
- explicit replaceable adapters;
- its own domain contracts.

## 15. Tool-specific decisions

### Treehouse

```text
ADOPT
```

after real WSL2 proof.

### Herdr

```text
OPTIONAL
```

Presentation only.

### Lavish

```text
ADOPTED FOR PLANNING
```

May later support other reviews.

### no-mistakes

```text
DEFER
```

Delivery adapter only after predecessor program quality authority exists.

### FirstMate itself

```text
REFERENCE ONLY
```

No runtime dependency.

## 16. Rejection list

predecessor program rejects:

- session as task identity;
- terminal parsing as recovery;
- worker self-verdict;
- UI status as domain state;
- automatic destruction after process completion;
- universal watcher matrix;
- mandatory full crew for small work;
- compatibility with multiple agent harnesses before Pi-first proof;
- importing code without license/origin records.

## 17. Summary

```text
FirstMate
→ proves one-liaison and visible-worker product value

predecessor program
→ preserves that value while adding deterministic contracts,
   authority, evidence, recovery, security and engineering governance
```
