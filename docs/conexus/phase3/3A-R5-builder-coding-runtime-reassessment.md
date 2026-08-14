# 3A-R5 — Builder / Coding Runtime Reassessment

**Status:** EM PESQUISA / NÃO RATIFICADO  
**Fase:** Architecture Reconciliation contínua durante 3C  
**Importante:** este documento não escolhe runtime, não reabre o Builder inteiro e não autoriza implementação.

## Motivo do checkpoint

C-002 escolheu Hub soberano + workers Pi frescos e tratou Mastra principalmente como framework genérico que criaria segunda authority. Desde então surgiu evidência material nova:

- Mastra Code é coding harness real usado pela própria Mastra;
- `AgentController` foi extraído do Mastra Code para construir harnesses stateful/headless;
- Mastra Workspaces oferece filesystem/shell/LSP/sandboxes e integração com E2B;
- Mastra Factory materializa uma software factory completa, de issue até produção;
- Mastra tornou-se meta-harness e integra coding agents externos;
- Production Agent Runtime 3C-10 passou a adotar Mastra como substrate principal.

Por isso, `Pi` não permanece escolha congelada por inércia. A decisão de coding runtime volta para qualificação arquitetural.

## O que NÃO está automaticamente reaberto

Continuam válidas até finding contrário:

```text
Project
→ Change
→ Builder ownership
→ explicit authority
→ independent verification
→ Evidence
→ Git/Hub durable truth
```

Também permanecem normativas as invariantes de segurança da C-008: durable secrets não entram no guest, resultado do worker não é aceito por autodeclaração, e qualquer sandbox/runtime precisa de boundary verificável.

A pesquisa pode, porém, concluir que a realização concreta de sessão, memória, sandbox adapter, planning assistance ou worker lifetime precisa mudar.

## Pergunta central

> Para construir software com qualidade e autonomia comparáveis ou superiores à Mitra/Factory, o Conexus deve continuar com `Hub → fresh bounded Pi worker`, migrar o coding worker para `Mastra Code/AgentController`, adotar uma sessão longa persistente, ou compor um modelo híbrido?

## Candidatos obrigatórios

```text
A. PiWorkerRuntime
B. MastraCodeWorkerRuntime / AgentController
C. Hybrid: Conexus Hub + Mastra long-lived coding harness
```

`Mastra Factory` é referência comparativa de software-factory topology, não candidato automático para substituir o domínio Builder.

Outros coding harnesses (Claude Code/Codex/Cursor via ACP/SDK) podem entrar como challengers apenas se ajudarem a responder uma questão material; não ampliar o estudo por catálogo.

## Eixos da deep research

### 1. Unidade de autonomia

Comparar:

```text
fresh worker per Work Unit
vs
long-lived coding session per Project/Change
vs
hybrid session with bounded execution episodes
```

Avaliar context retention, drift, recovery, custo, latency e qualidade de mudança complexa.

### 2. Planning authority

Pergunta:

```text
Hub Plan
vs
harness Plan/Goal/Task list
```

Objetivo: descobrir se plan/goal interno do coding harness deve ser ferramenta subordinada ao Builder ou se existe benefício real em mover mais planning para a sessão longa sem criar duas authorities.

### 3. Memory / context management

Comparar:

- Pi compaction/session model;
- Mastra Observational Memory;
- persistent project threads;
- explicit project/task artifacts (`tasks.md`, Actor Pack, Baseline);
- custo de reidratar fresh workers;
- risco de stale/incorrect long-term memory.

### 4. Coding mechanics

Comparar com tarefa real:

- filesystem navigation;
- search/grep;
- edit quality;
- AST/LSP tooling;
- shell/build/test;
- browser/preview;
- Git/worktree local;
- subagents;
- interruption/cancel;
- structured events;
- headless embedding.

### 5. Sandbox / E2B

Comparar:

```text
Conexus SandboxProvider → E2B
vs
Mastra Workspace/Sandbox → E2B
```

Perguntas:

- qual camada realmente controla lifecycle/egress/ports/filesystem?
- conseguimos preservar `durableSecretNotReadableByGuest`?
- Mastra Workspace simplifica ou cria segunda authority?
- RunPreview e BuildValidationDatabase continuam distinguíveis?

E2B permanece baseline atual; trocar provider não é objetivo desta pesquisa.

### 6. Git / worktree authority

Avaliar:

- session-long worktree;
- fresh branch/worktree por Work Unit;
- commit cadence;
- Hub-mediated push/PR;
- recovery de session crash;
- conflito entre subagents;
- como manter result/evidence reviewável.

Git remote credential continua Hub-side até finding material contrário.

### 7. Verification / QA

Conexus não abre mão de verifier independente por simplesmente usar harness melhor.

Comparar:

- self-test do worker;
- fresh independent review;
- test execution outside worker session;
- browser QA;
- evidence completeness;
- false-green rate.

### 8. Software-factory topology

Comparar profundamente:

- Mitra observada: sessão longa por Project, E2B, coding agent, MCP/platform tools, build/share;
- Mastra Factory: issue → triage → planning → build → validate → release → docs → monitor;
- Factory.ai / software-factory patterns;
- Conexus Hub/Builder aprovado.

Pergunta principal:

> quais loops devem pertencer ao Hub e quais são melhor delegados ao coding harness?

### 9. Recovery / durability

Testar mentalmente e depois em probe:

- Hub crash;
- sandbox crash;
- worker process crash;
- context overflow;
- model/provider transient failure;
- interrupted git state;
- long approval/human wait;
- resumed work after hours/days.

### 10. Complexity ownership

Medir o que cada opção faz o Conexus construir/manter:

```text
agent loop
memory
planning UI/protocol
subagents
LSP/editing
session persistence
sandbox integration
event normalization
cost/trace adapters
recovery
```

Complexidade importada de um substrate conta, mas complexidade reconstruída no Hub também conta.

## Golden scenarios obrigatórios

A comparação deve incluir pelo menos:

1. feature backend com novos contracts/tests;
2. migration + código compatível;
3. página React + integração backend;
4. bug complexo com causa-raiz não óbvia;
5. integração Sankhya realista;
6. refactor multi-arquivo sem regressão;
7. teste quebrado + recovery;
8. investigação grande de repo;
9. tarefa que excede 45 min e testa a hipótese de sessão longa;
10. retomada após crash/restart;
11. mudança que exige browser/preview;
12. Change com duas Work Units parcialmente independentes.

## Métricas

```text
COR assertions passed
independent verifier result
test pass rate
false-green rate
unwanted diff
files touched unnecessarily
rework loops
context loss / stale memory
time to first useful action
wall time
tokens / cost
sandbox time
evidence completeness
recovery success
authority violations
forbidden-path attempts
operator interventions
```

## Hipóteses adversariais a testar

### H1 — Fresh workers são melhores

Porque cada Work Unit começa limpo, recebe somente contexto necessário e não carrega drift/memória falsa.

### H2 — Long-lived harness é melhor

Porque entendimento cumulativo de codebase, goals, OM/LSP e histórico reduzem rediscovery e permitem mudanças complexas com menos coordenação.

### H3 — O melhor desenho é híbrido

Uma sessão longa mantém project/codebase cognition, mas execução continua organizada em episódios/Work Units com checkpoints, diff/evidence e verifier independente.

Nenhuma hipótese é default.

## Evidence baseline atual

- Mitra prova coding session longa em E2B como produto funcional, mas com limitações observadas e sem nosso authority model.
- Mastra Code prova long-running coding harness com persistent threads, OM, modes, permissions e subagents.
- AgentController explicita sessões stateful e controle de harness.
- Mastra Factory prova uma topology de software factory com specialized agents, typed workflows, memory, scheduling, tools e observability.
- Pi continua prova forte de coding harness mínimo, embutível, multi-modelo e adequado a fresh workers.

## Saída esperada

A pesquisa termina somente quando puder produzir uma decisão explícita sobre:

1. coding runtime principal;
2. worker lifetime model;
3. ownership de planning/goal/task internals;
4. memory strategy do Builder;
5. sandbox/E2B integration boundary;
6. subagent strategy;
7. verification topology;
8. Git/worktree lifecycle;
9. migration path das decisões C-002/C-008/3C-05 afetadas;
10. `Conexus Worker Eval` e activation probe correspondentes.

## Regra de parada

Não continuar 3C/3D como se C-002 estivesse estável enquanto este finding estiver aberto. Decisões independentes podem prosseguir apenas se não dependem da topology de coding runtime.

## Estado

```text
Production Agents / 3C-10
→ CLOSED / approved

Builder/Coding Runtime
→ RECONCILIATION OPEN
→ no Pi/Mastra Code winner yet
```
