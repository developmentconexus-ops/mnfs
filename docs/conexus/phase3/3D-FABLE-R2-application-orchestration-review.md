# 3D-FABLE-R2 — Application / Use-case Orchestration Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3D — Dependency Architecture, pré-decisão 3D-03  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3D-03-FABLE-APPLICATION-ORCHESTRATION-REVIEW-HANDOFF.md`)  
**Base revisada:** `f068d48b363a36bf20af1b71cd54957c44175b4b` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não é decisão 3D-03, não altera LEDGER nem decisões aprovadas, e não autoriza implementação. R0/R1 são inputs não-autoritativos; onde esta revisão os corrige, esta prevalece como opinião de review.

---

## 1. Verdict

**A lista mínima de use cases F1 é OITO — dois a menos que a lista de R0.** O ataque adversarial desta rodada derrubou dois use cases da própria revisão anterior:

- **`BuilderDiscoveryUseCase` — RETIRADO.** `Builder → Gateway` é aresta direta aprovada (3D-01 §16); a validação do ActorRun é authority do próprio Builder; o `BuilderExecutionContext` é montado pelo Builder. Nenhuma das condições A–D de 3D-01 §4 se aplica. Chamada direta.
- **`SubmitKnowledgeProposalUseCase` — RETIRADO.** `Builder → Brain` e `PAR → Brain` são arestas diretas aprovadas; submissão de proposal é escrita single-owner (Brain owns o lifecycle). O fluxo de publicação (review humano → Git → compile → Registry) também não precisa de use case: cada passo é operação do owner com arestas descendentes existentes.

Três resultados estruturais além da lista:

1. **Regra de direção de invocação (F-R2-1):** módulos **nunca** invocam a application layer. Todo encadeamento pós-operação ("Change accepted → compose Release") vive na boundary L7 que iniciou o fluxo — nunca como callback do módulo para cima. Sem essa regra explícita, o "compose automático" de 3C-11 §5 convida exatamente o import ascendente que quebraria o DAG.
2. **Use case não aninha use case** (default; quebra exige decisão). É a trava mecânica que impede a camada de virar workflow engine por composição.
3. **Transação compartilhada é exceção dentro da exceção:** dos oito use cases, exatamente **um** (`CreateProject`) usa a transação cross-owner de 3D-01 §10. Nenhum use case segura transação de banco através de I/O externo.

Nenhum Finding contra 3D-01/3D-02/autoridade anterior. Dois DERIVED_REQUIREMENTs para 3D-03 congelar (§8).

---

## 2. Authority reconstructed

Cadeia reconstruída do repositório: `AGENTS.md` → `LEDGER.md` (3D-01 e 3D-02 APROVADAS) → `3D-01` (regra de admissão §4 A–D; application layer coordena, owner decide; topologia §15; §16 relações que devem ser orchestration) → `3D-02` (surfaces, conjunção fechada, approval single-claim, caller contexts) → 3C-R1 §5 (camada aprovada em conceito; exemplos `CreateProjectUseCase`, `QualifyConnectionUseCase`, `PromoteReleaseUseCase`) → 3C-01..15, C-000..C-017 conforme necessário.

Baseline que esta revisão só desafia via Finding:

```text
3D-01 §4  use case admitido por A (aresta proibida/ciclo), B (multi-owner com
          ordem/checkpoint/atomicidade material), C (A→B→A sem A importar B),
          D (composition/promotion/inception/binding com consumer real)
3D-01 §4  a camada não possui domain state, não vira mediator/bus/engine
3D-01 §10 transação única cross-owner permitida quando invariante atômica real
3D-02 §5  fonte de composição por surface
LEDGER §8 sem ApplicationLayerModule/event bus/workflow DSL
```

---

## 3. A regra de admissão, afiada para decisão objetiva

3D-01 §4 dá as condições A–D. Para 3D-03 virar procedimento aplicável em review de código, esta revisão propõe o teste em três passos — **na ordem**:

```text
PASSO 1 — teste da aresta
  A chamada direta usaria só arestas aprovadas na matriz 3D-01 §16?
  SIM → chamada direta. FIM. (não importa quão "conceitualmente cross-module"
        o fluxo pareça)
  NÃO → passo 2.

PASSO 2 — teste do fato
  O que falta é um FATO de outro owner que pode viajar como ref imutável
  ou projeção já aprovada?
  SIM → chamada direta com contexto/projeção. FIM.
  NÃO → passo 3.

PASSO 3 — use case nomeado
  Nomear o caso, declarar a condição (A|B|C|D), declarar qual owner
  continua dono de cada invariante tocada. Entra na lista fechada.
```

E o **teste de deleção** como verificação contínua (review/3N):

> Se remover o use case e chamar os owners na ordem certa violaria alguma invariante, então uma invariante vazou para a camada — defeito, não feature. O use case correto é *deletável sem perda de correctness*, custando apenas duplicação de sequência.

Este teste é o que separa "coordenador" de "god-layer": a camada legítima só possui *ordem*; toda *verdade* continua recuperável dos owners.

---

## 4. Ataque fluxo a fluxo (escopo do handoff)

### 4.1 `CreateProject` — MANTIDO (condição B; a única transação compartilhada)

Escritas em dois owners: Project (identidade/lifecycle) + I&A (grants iniciais do criador). Sem atomicidade: project órfão sem grant, ou grant pendurado sem project — estado intermediário material visível a qualquer listagem/authz concorrente. Alternativas atacadas: (a) PRJ conceder o grant inicial — viola 3C-02 (alternativa C, distribuição de authz, explicitamente rejeitada); (b) duas transações + reconciliação — machinery de compensação que 3D-01 §10 dispensou de propósito. Mantido como o caso paradigmático de B, e o **único** uso F1 da transação cross-owner.

### 4.2 `SetProjectBinding` — MANTIDO (condição C), com precisão de invariante

Fluxo: validar semântica/elegibilidade no owner do recurso (Brain/Connections) → registrar intent no Project → checkpoint quando aplicável. PRJ, BRN e CON são todos L2 — `PRJ → BRN/CON` seriam arestas intra-layer que 3D-01 §16 já direcionou para orchestration. Ataque tentado: *a validação no set-time é mesmo necessária?* O gate real de correção é posterior (Brain valida na compilação do binding; Release/conformance gates antes de servir — C-014). Resposta: sim ao use case, mas com a invariante no lugar certo — **a validade do binding NÃO é invariante do set-time**; o use case valida para UX/fail-early, e os gates de compile/conformance continuam sendo a verdade. Se 3D-03 congelar "binding só é gravado se válido" como invariante da camada, viola o teste de deleção do §3. Formulação correta: Project grava intent; owners julgam validade nos seus gates.

### 4.3 `QualifyConnection` — MANTIDO (condições A + C)

`Connections → Gateway` é aresta ascendente proibida (CON em L2, GW em L4); o resultado volta para Connections (A→B→A clássico). Sequência: CON fornece revision/connector refs [imutáveis] → GW executa probe não-mutante → CON registra Qualification. **Regra transacional explícita:** nenhuma transação de banco atravessa a probe externa — leitura, I/O, escrita são três passos; a probe pode falhar/pendurar sem lock em `hub_control`. O significado do resultado continua em Connections (3C-07); o use case só transporta.

### 4.4 Inception ↔ Builder — MANTIDO (condição A), forma mínima

`Project → Builder` é proibida (L2 → L5). 3C-R1 §4 já congelou a semântica: Project owns Inception authority; Builder fornece engineering execution capability. O use case pede investigação bounded ao Builder sob authority do Project e entrega material de Baseline candidate ao Project. Ataque tentado: *é só a UI chamando Builder?* Não — há ordem com authority significativa: verificar fase de Inception no Project (pode investigar?), despachar com escopo do Project, rotear resultado para candidatura de Baseline. Condição A + B leve. Mantido. Não nasce `InceptionRun`/`InceptionModule` (3C-R1 já proíbe); a representação operacional fica em 3E/3G/3H.

### 4.5 Brain/AnalyticQuery ↔ Gateway — MANTIDO (condição A), com decisão de localização

`Brain → Gateway` proibida (L2 → L4). Alguém acima dos dois precisa sequenciar `compile semântico → execução física → interpretação`. Três candidatos atacados:

- **(a) PAR sequencia internamente** (PAR já importa BRN e GW): funciona para AGENT_RUN, mas deixa PUBLISHED_APP sem solução — e duas implementações do mesmo contrato sutil (plano semântico → execução restrita) driftam.
- **(b) MAR sequencia** (exigiria aresta nova `MAR → Brain`): alarga MAR sem necessidade; a aresta não existe na matriz aprovada.
- **(c) um `AnalyticQueryUseCase` compartilhado pelas duas surfaces**: mantém a matriz intacta, um único lar para o contrato compile→execute→interpret. **Recomendado.**

Preocupação de mediator no hot path: o custo é uma chamada de função stateless; o risco real seria o use case acumular política (caps, budgets) — esses continuam nos owners (Brain: plano/limites semânticos; GW: ceilings físicos; C-011: min(request, caps, budget)). `BrainHealthProbeUseCase` mantém a mesma justificativa (A) para probes de health/conformance; os dois podem compartilhar esqueleto de implementação **sem** virar `BrainPhysicalExecutionFramework`.

### 4.6 `ComposeRelease` — MANTIDO (condição A), com a regra de invocação

Quebra `Release → Builder` (3D-01 §5). O ataque desta rodada foi no **gatilho**: 3C-11 §5 diz que a plataforma *pode compor automaticamente* quando o Change fecha. Quem chama o use case? Se o Builder chamasse ao fechar o Change, teríamos módulo (L5) invocando application layer (L7) — **import ascendente que quebra o DAG por outro caminho**. E event bus é proibido. Resolução (F-R2-1, §8): o encadeamento vive na boundary L7 — o fluxo de fechamento de Change (que já é dirigido de L7: checkpoint humano, UI/command) invoca `ComposeReleaseUseCase` após o closure retornar aceito; alternativamente um job L7 varre Changes aceitos sem Release composta. O Builder **não sabe** que composição existe. Sem transação compartilhada: compose lê acceptance (refs pinadas) e escreve REL; staleness é coberta pela re-verificação da Promotion (C-014, já confirmado em R0 §13.4).

### 4.7 `PromoteRelease` / served verification — MANTIDO (condições B + C), o caso rico

Coordena: conformance reads (Registry/Connections/Brain/DB infra) → gates (permission/dependency diff, migration) → CAS do ponteiro → served verification (GET + digest via cliente de infra — sem `Release → MAR`) → `SERVED_VERIFIED`. Duas travas para não virar workflow engine:

1. **O estado durável da Promotion é FSM owned pelo Release** (C-014: `APPROVED → ... → POINTER_SWAPPED → SERVED_VERIFIED`, steps como `agent_event`). O use case *dirige* passos; cada transição é gravada pelo owner. Crash no meio → recovery lê o estado da Promotion no Release, não um estado da camada. Passa o teste de deleção.
2. **Cada passo é sua própria transação** ancorada na FSM do owner; nenhuma transação global de promotion. O CAS do ponteiro é a única atomicidade forte, e é operação do Release.

### 4.8 Knowledge proposal — REJEITADO como use case

Handoff pergunta "only if truly cross-owner". Não é: `Builder → Brain` e `PAR → Brain` são arestas diretas aprovadas (3D-01 §16); `submitKnowledgeProposal` é operação pública do Brain, escrita single-owner, sem ordem multi-authority. Passo 1 do §3 resolve. A publicação posterior (review humano → Git → compile → Registry `AVAILABLE`) usa arestas existentes (`BRN → REG`) dirigidas pela UI de review do Brain em L7. R0 errou ao listá-lo; retirado.

### 4.9 `BuilderDiscovery` — REJEITADO como use case (correção de R0)

R0 §9 propôs `BuilderDiscoveryUseCase (BLD + GW)`. Reexame: `Builder → Gateway` é aresta direta aprovada; a validação do estado do ActorRun antes da chamada é authority do próprio Builder sobre objeto próprio (nenhum cross-owner); o contexto §8.2/R1-§6 é montado pelo Builder. 3D-02 §5 (`BUILDER/CANDIDATE`) já descreve o fluxo inteiro com arestas diretas. Passo 1 do §3 resolve. Retirado — o que sobra na "orquestração" era só a função pública do Builder que a UI chama.

---

## 5. Lista fechada F1 — oito use cases

| # | Use case | Condição 3D-01 §4 | Owners coordenados | Tx compartilhada? |
|---|---|---|---|---|
| 1 | `CreateProject` | B | PRJ + IAM | **SIM** (única) |
| 2 | `SetProjectBinding` | C | BRN/CON (read) + PRJ (write) | não |
| 3 | `QualifyConnection` | A + C | CON + GW + CON | não (nunca através de I/O) |
| 4 | `InceptionInvestigation` | A | PRJ + BLD | não |
| 5 | `AnalyticQuery` | A | BRN + GW (+ BRN) | não |
| 6 | `BrainHealthProbe` | A | BRN + GW + BRN | não |
| 7 | `ComposeRelease` | A | BLD (read) + REL (write) | não |
| 8 | `PromoteRelease` | B + C | REL + REG/CON/BRN/infra + probe | não (por passo, FSM no REL) |

**Não são use cases (lista negativa explícita):** serving `MAR → GW.execute`; tool calls `PAR → GW`; discovery `BLD → GW`; knowledge proposal `BLD/PAR → BRN`; qualquer CRUD single-owner (Workspace, Area, Connection create, Attachment upload/download, Agent conversation); resolução de artifact `* → REG`; emissão/consulta OBS; `resolveActiveRelease` por MAR/PAR; compile/publish de artifacts pelo owner (`BRN → REG`, Builder pipeline → REG).

Nomes são semânticos, não signatures (3F).

---

## 6. Regras estruturais da camada (para 3D-03 congelar)

1. **Invocação unidirecional:** use cases são invocados somente por boundaries L7 (HTTP/UI/command/job). Módulo nunca importa/invoca a application layer. Encadeamento pós-operação ("aceitou → compõe") vive na boundary do fluxo iniciador ou em job L7 — nunca em callback de módulo.
2. **Sem aninhamento por default:** use case não chama use case. Composição de fluxos acontece na boundary. Quebra pontual exige decisão registrada (nenhum caso F1 precisa).
3. **Stateless + teste de deleção:** a camada não possui estado durável nem invariantes próprias; estado multi-step durável vive na FSM do owner (Promotion no Release é o exemplo normativo). O teste do §3 é aplicável em review e em 3N.
4. **Transação:** compartilhada só quando invariante atômica real cruza owners (F1: `CreateProject`); cada statement continua do owner; **nunca** transação aberta através de I/O externo (probe, provider call, serving GET) — padrão já normativo em C-016 para rotação de credencial ("transação nunca aberta durante rede"), generalizado aqui para a camada.
5. **Lista fechada revisável:** novo use case = aplicar o procedimento §3 e registrar (mesmo mecanismo da união fechada de admission de 3D-02 §11). Remover é sempre permitido se o passo 1 passar a resolver.

---

## 7. Falsificação: os dois jeitos de a camada apodrecer

**Rota 1 — god-layer por acúmulo de invariantes.** Sintoma: "só o use case sabe a ordem certa; chamar os owners direto é perigoso". É o teste de deleção falhando. As oito entradas atuais passam: em cada uma, a verdade é recuperável dos owners (binding validity nos gates de compile/conformance; promotion na FSM do Release; qualification no registro do Connections). A literatura de god-class (R0 §12.4) mostra o mecanismo real de apodrecimento: *acreção por conveniência* — cada PR adiciona "só uma verificação" ao orquestrador. As travas §6.3 + lista fechada §6.5 são a resposta mecânica, não promessa de disciplina.

**Rota 2 — mediator por hábito.** Sintoma: fluxos que passariam no passo 1 do §3 ganhando use case "por consistência" (o argumento estético que 3D-01 §3 já veta). As duas retiradas desta revisão (§4.8, §4.9) são exatamente esse hábito flagrado **na própria revisão anterior** — evidência de que a pressão é real e de que o procedimento §3 detecta. Se R0 (escrita sob metodologia adversarial explícita) superproduziu use cases em 20%, implementação cotidiana superproduzirá mais; a regra objetiva importa mais que a lista.

**Contra-argumento mais forte ao desenho inteiro:** "oito funções nomeadas não precisam de 'camada' — são handlers da boundary; declarar uma *layer* convida a crescer." Resposta: o que 3D-03 deve congelar não é uma camada física com pacote próprio e identidade — é a **lista fechada + as regras §3/§6**. Se a realização física for "oito funções em `application/` sem framework, sem base class, sem registry", o desenho está correto; se nascer `UseCaseBase`, `UseCaseBus` ou injeção dinâmica de use cases, está errado independentemente da lista. A "camada" é regra de dependência, não artefato.

---

## 8. Findings

### F-R2-1 — Direção de invocação da application layer (DERIVED_REQUIREMENT para 3D-03)

3D-01 coloca a application layer em L7, acima dos módulos — mas nenhum doc proíbe explicitamente o caminho inverso, e 3C-11 §5 ("plataforma pode compor Release automaticamente" após Change accepted) **convida** a implementação a fazer o Builder invocar composição no fechamento — import ascendente L5→L7 que quebra o DAG por fora da matriz (a matriz 3D-01 §16 só cobre arestas módulo↔módulo). Com event bus proibido, o gap fica sem solução declarada. 3D-03 deve congelar: módulos nunca invocam use cases; encadeamento pós-operação vive na boundary L7 do fluxo ou em job L7. Sem contradição com autoridade — fecha um buraco de leitura.

### F-R2-2 — Use cases de R0 retirados (correção de input não-autoritativo; registro)

`BuilderDiscoveryUseCase` e `SubmitKnowledgeProposalUseCase` não passam no passo 1 do §3 (arestas diretas aprovadas resolvem). Não é Finding contra autoridade (R0 é não-autoritativo e 3D-01/3D-02 não os ratificaram); registrado para que 3D-03 não os herde por inércia de leitura de R0.

### Sem Finding contra 3D-01/3D-02

A regra A–D de 3D-01 §4 resistiu ao ataque em todos os oito casos mantidos e foi suficiente para rejeitar os dois retirados — sinal de que a regra é operante, precisando apenas do procedimento §3 e das regras estruturais §6 para virar prática verificável.

---

## 9. Comparação externa com valor decisório

Base: pesquisa primária de R0/R1 (ainda atual), reaplicada somente onde muda decisão desta rodada.

- **ABP Integration Services + kgrzybek (R0 §12.4):** a prática madura para o retorno de A→B→A é evento; o Conexus substitui por ordenação na camada porque o bus é proibido e o processo é único. O custo aparece exatamente no F-R2-1: sem eventos, o encadeamento "aceitou→compõe" precisa de um lar explícito — a boundary. A regra §6.1 é o preço declarado da rejeição do bus, e é mais barata que outbox/inbox in-process.
- **Padrão god-class (R0 §12.4):** mitigação documentada = um caso nomeado por fluxo, nunca `AppService` compartilhado; confirma §6 e a forma "oito funções nomeadas".
- **Factory "waterfall by handoff, not framework" (mapa interno §17, R0 §12.2):** sem engine central impondo transições; cada handoff carrega o suficiente para o próximo passo; a heurística deles — "se toda mudança faz cada agente ler mais instrução global, a arquitetura está errada" — traduz-se aqui como o teste de deleção §3: se todo fluxo novo precisa da camada para estar correto, a camada virou engine.
- **Kubernetes (R0/R1):** extensão por registro explícito em ordem fixa → mesma família da lista fechada §6.5, agora aplicada à camada como já foi à admission do Gateway (3D-02 §11). Os três pontos de extensão do sistema (admission classes, use-case list, module edges) passam a ter o mesmo mecanismo: crescer = decisão registrada.
- **Mitra "segundo caminho" (C-009/R1):** o risco simétrico ao god-layer — fluxos contornando o use case onde ele É necessário (compose manual fora da boundary, promote por partes). A resposta não é rotear tudo pela camada; é o enforcement de arestas (3D-01 §17) + FSM no owner: promote "por fora" é impossível não porque a camada bloqueia, mas porque só o Release muda o ponteiro e só via sua FSM. Confirma §6.3.

---

## 10. Recomendação exata: o que 3D-03 congela vs. difere

**Congelar:**

1. a lista fechada de oito use cases (§5) com condição declarada por entrada;
2. a lista negativa (§5) — fluxos que permanecem chamadas diretas;
3. o procedimento de admissão em três passos + teste de deleção (§3);
4. as cinco regras estruturais (§6): invocação só de L7, sem aninhamento, stateless/teste de deleção, regra transacional (única tx compartilhada = `CreateProject`; nunca tx através de I/O externo), lista fechada revisável;
5. F-R2-1 como regra normativa;
6. a localização do `AnalyticQueryUseCase` como orquestrador único para ambas as surfaces (§4.5);
7. invariantes de não-forma: sem pacote-framework, sem `UseCaseBase`/registry/bus, sem estado durável na camada — a camada é regra de dependência, não artefato (§7).

**Diferir:**

```text
signatures/DTOs dos oito use cases                          → 3F
FSM de Promotion/steps e recovery de fluxo multi-etapa      → 3G/3M
realização física de transaction scope                      → 3E
jobs L7 (varredura compose, agendamentos)                   → 3H
checkpoint/UX dos fluxos com gate humano                    → 3K
```

---

*Fim da revisão independente R2. Nenhuma implementação de produto é autorizada por este documento.*
