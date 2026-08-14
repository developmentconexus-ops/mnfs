# 3D-FABLE-R0 — Independent Dependency Architecture Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3D — Dependency Architecture, pré-decisão  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3D-FABLE-INDEPENDENT-REVIEW-HANDOFF.md`)  
**Base revisada:** `52800dddf96bf61ac15cfd27d5242bd44b0a0f72` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não é decisão 3D, não altera LEDGER nem decisões aprovadas, e não autoriza implementação.

---

## 1. Verdict

**A hipótese candidata do handoff (§10) sobrevive à tentativa de falsificação em sua substância, com quatro correções materiais.** Um grafo de imports estruturalmente acíclico é alcançável **sem enfraquecer o ownership de 3C** (resposta afirmativa à pergunta 11), mas somente se 3D decidir explicitamente quatro pontos que a hipótese não cobre ou cobre de forma incompleta:

1. **Existe um triângulo de ciclo não listado em 3C-R1 §13:** `Gateway → Release → Builder → Gateway`. A quebra correta é remover a aresta `Release → Builder` (composição de Release orquestrada em use case), não qualquer das outras duas.
2. **`Production Agent Runtime ↔ Gateway` não se resolve só com "caller execution context":** a revalidação de approval no instante do efeito (anti-TOCTOU, 3C-08) exige que o Gateway consulte validade de approval owned pelo PAR *no momento da execução*. Este é o único lugar do grafo onde uma **porta de inversão de dependência** (definida no Gateway, implementada pelo PAR, ligada no composition root) se paga por classe de falha real. Todas as outras inversões seriam cerimônia.
3. **O detector de RigorProfile (F3C05-1) precisa de um lar estrutural abaixo de Builder e Release**, senão a aresta `Release → Builder` reaparece por outro caminho. Recomendação: módulo mínimo de nível folha (função pura versionada sobre sinais declarados), não policy engine.
4. **Mastra como substrate compartilhado de Builder (3A-R5) e Production Agent Runtime (3C-10) é o canal de acoplamento oculto mais provável da implementação.** Se realizado como uma instância/registro global único, Builder e PAR passam a se acoplar por fora do grafo de imports. 3D deve declarar a regra; 3H realiza.

Nenhum finding encontrado exige reabrir C-000..C-017 ou 3C. Não há ciclo de *authority* real no modelo aprovado — todos os pares bidirecionais de 3C-R1 §13 são colaboração bidirecional realizável como estrutura unidirecional.

---

## 2. Authority reconstructed

Autoridade reconstruída do repositório, na ordem exigida por `AGENTS.md` e pelo handoff:

```text
AGENTS.md → DOCUMENTATION-MAP → STATUS → (governança MNFS-legacy, preservada, não bloqueia Conexus por C-000)
docs/conexus/DECISOES.md          C-000..C-017
docs/conexus/phase3/LEDGER.md     3B CLOSED · 3C CLOSED · 3D NEXT
3C-01..3C-15, 3C-R1, 3A-R5, 3B-16
```

Fatos de autoridade que restringem materialmente o grafo (todos verificados nos docs aprovados):

- Modular monolith, um deployable; módulos não importam internals uns dos outros; compartilhar `hub_control` não autoriza leitura de tabela alheia (3C-01, repetido em todas as boundaries).
- Camada de application/use-case aprovada em conceito (3C-R1 §5): stateless, sem domain state próprio, sem virar `ApplicationLayerModule`/mediator/event bus/workflow engine.
- `I&A ALLOW != EXECUTE` (3C-02/3C-08); Gateway enforça fatos de vários owners sem absorvê-los; `Minimal Enforcement Surface` e `No Universal Privileged Bus` são normativos (3C-08).
- `AVAILABLE != ACTIVE`; Registry não é authoring nem execution authority (3C-06); Release é o único caminho para serving (3C-11); promotion/migration/Git/Registry publication ficam **fora** do Gateway (3C-08 §"Explicitamente fora").
- Connections owns semantics de qualification; Gateway executa a probe I/O (3C-07/3C-08).
- Brain compila plano semântico; Gateway executa leitura física (3C-09).
- Observability nunca é authority; audit-required fail-closed (C-013/3C-13).
- Anti-overengineering guardrail do LEDGER §8 proíbe, entre outros, `ApplicationLayerModule`, event bus, workflow DSL, policy engines.
- 3A-R5: coding harness = Mastra Code/AgentController atrás de boundary `CodingWorkerRuntime`; Pi = fallback; E2B via `@mastra/e2b` sem adapter próprio antecipado.
- 3C-10: Mastra é substrate do PAR; mechanics nunca viram segunda authority.

Precedência aplicada: C-000..C-017 → 3A/3B/3C aprovados → 3C-R1 para conflitos de nomenclatura/escopo → LEDGER para status. Conversa não é authority.

---

## 3. Os cinco grafos são coisas diferentes

O handoff exige distinguir e não colapsar. Definições usadas nesta revisão:

```text
collaboration graph   quem conversa com quem em algum fluxo (bidirecional é normal)
authority graph       quem decide fato que outro consome (direção do fato)
import graph          quem importa código/tipos de quem (deve ser DAG)
runtime call flow     ordem de chamadas numa operação concreta (pode ir e voltar)
data ownership graph  quem escreve quais tabelas (partição, nunca compartilhado)
```

Duas observações que evitam erros recorrentes:

1. **"Downstream" em dataflow é frequentemente "leaf" em imports.** Observability é *downstream/sink* no fluxo de dados, mas estruturalmente é um **módulo folha que todos importam** (para emitir). A hipótese do handoff diz "keep Observability primarily downstream/sink-like" — correto em dataflow; em imports a formulação precisa é: *Observability não importa nenhum módulo de domínio; todos podem importá-la para emitir/consultar*.
2. **Runtime call flow A → B → A não implica import cycle.** `Builder → Gateway → (fatos de Builder)` é call flow com retorno; vira ciclo estrutural apenas se o Gateway *importar* Builder para buscar o fato. As quebras abaixo existem exatamente para impedir essa tradução ingênua.

---

## 4. Grafo conceitual de colaboração implícito em 3C (pergunta 1)

Pares de colaboração extraídos das boundaries aprovadas (setas = fluxo de colaboração, não import):

```text
IAM ⇄ todos                    resolve principal/access; owners declaram permissions
Workspace ⇄ IAM/Project        estrutura vs. relações de acesso; scoping
Project ⇄ Brain/Connections    binding intent vs. validação semântica/eligibilidade
Project ⇄ Builder              Inception authority vs. investigação agentic
Builder ⇄ Gateway              discovery reads; caller proof ActorRun-bound
Builder ⇄ Registry             compile/publish de project kinds
Builder ⇄ Observability        emite eventos; consulta Verification Observability
Connections ⇄ Gateway          qualification dispatch vs. target facts p/ execução
Connections ⇄ Registry         pin de ConnectorDefinition exata
Brain ⇄ Registry               revisão/payload vs. semântica/compilação
Brain ⇄ Gateway                plano semântico vs. execução física (AnalyticQuery, probes)
PAR ⇄ Gateway                  tool execution vs. revalidação de approval
PAR ⇄ Release/Registry         composição ativa pinada
Release ⇄ Builder              Change accepted como input de composição
Release ⇄ Registry/Connections/Brain/DB/serving   conformance reads
Managed Runtime ⇄ Release/IAM/Gateway/PAR/Attachments   serving path
Attachments ⇄ IAM              authz de acesso a arquivo
todos → Observability          audit/telemetry
```

Todos os "⇄" acima são **colaboração**. Nenhum é ciclo de authority: em cada par, cada fato tem exatamente um owner (3C-R1 confirmou ausência de authority duplicada). A pergunta de 3D é somente qual lado vira import e qual lado vira projeção/contexto/use case.

---

## 5. Ciclos aparentes e disposição de cada um (perguntas 2 e 3)

| # | Ciclo aparente | Natureza | Disposição estrutural |
|---|---|---|---|
| 1 | Builder ⇄ Gateway | call flow com retorno de fato | `BLD → GW` import; caller context validado antes da chamada (ver §8.2); GW nunca importa BLD |
| 2 | Connections ⇄ Gateway | colaboração (qualification vs. execução) | `GW → CON` (projeção estreita: revision/target/credential handle); qualification via `QualifyConnectionUseCase`; CON nunca importa GW |
| 3 | PAR ⇄ Gateway | **quase-ciclo real de import** | `PAR → GW` import; revalidação de approval via porta `ApprovalVerifier` definida no GW, implementada no PAR (§8.1) |
| 4 | Brain ⇄ Registry | colaboração | `BRN → REG` import (publica/resolve revisão); REG nunca chama compilers — orquestração de publicação fica no owner/use case |
| 5 | Brain ⇄ Gateway | call flow (plan → exec → interpret) | `AnalyticQueryUseCase` e `BrainHealthProbeUseCase`; nem BRN importa GW nem GW importa BRN — o plano compilado chega ao GW como argumento in-process de código server-side confiável |
| 6 | Release ⇄ Builder | colaboração (acceptance como input) | **remover `REL → BLD`**: `ComposeReleaseUseCase` lê acceptance do BLD e chama `REL.compose` com evidence refs pinadas |
| 7 | Release ⇄ Managed Runtime | colaboração (served verification) | `REL` verifica digest servido via probe de infraestrutura de serving (cliente HTTP/GET+digest no `PromoteReleaseUseCase`), **não** importando MAR; `MAR → REL` permanece one-way |
| 8 | Project ⇄ Builder (Inception) | colaboração | `InceptionInvestigationUseCase`: Project authority + Builder engineering capability; PRJ nunca importa BLD |
| 9 | **GW → REL → BLD → GW** (triângulo, não listado em 3C-R1) | ciclo de import se as três arestas fossem diretas | quebrado pela disposição do #6: sem `REL → BLD`, o triângulo vira cadeia `BLD → GW → REL` |

O achado #9 merece destaque: cada aresta é individualmente razoável (`GW → REL` para admission contra composição ativa; `REL → BLD` para "Change accepted?"; `BLD → GW` para discovery) e nenhum doc de 3C as coloca lado a lado. É o tipo de ciclo que só aparece quando se monta o grafo inteiro — e apareceria em TypeScript como circular import no primeiro sprint.

---

## 6. DAG estrutural proposto (import graph)

Setas = "importa a public internal API de". Camadas apenas para leitura; a autoridade é a matriz do §7.

```text
L0  shared kernel        IDs opacos, refs/digests, tipos de erro, tipos de evento
                         (sem comportamento de domínio)

L1  Identity & Access    → kernel
    Workspace            → kernel
    Artifact Registry    → kernel, BlobStore/CAS (infra)
    Observability&Audit  → kernel
    rigor (primitive)    → kernel          [ver §11.3]
    infra ports          BlobStore, CredentialBackend, GitInfra,
                         CodingRuntime(Mastra/E2B), JobQueue, MigrationRunner

L2  Attachments          → IAM, BlobStore
    Connections          → IAM, Registry, CredentialBackend
    Brain                → Registry
    Project              → Workspace, GitInfra(assoc. de repo)

L3  Release              → Project, Registry, Connections, Brain,
                           DB infra, MigrationRunner, rigor

L4  Capability Gateway   → IAM, Project, Registry, Connections, Release
                           + porta ApprovalVerifier (implementada por PAR)

L5  Builder              → IAM, Project, Brain, Registry, Gateway,
                           Observability(query), CodingRuntime, GitInfra, rigor
    Production Agent Rt. → IAM, Release, Registry, Brain, Gateway,
                           Mastra substrate; implementa GW.ApprovalVerifier

L6  Managed App Runtime  → IAM, Release, Gateway, PAR, Attachments, JobQueue

L7  application layer    → qualquer módulo (stateless use cases)
    HTTP/UI boundary     → application layer / módulo direto quando 1-owner

emissão de eventos: qualquer módulo → Observability (edge L_n → L1, sempre descendente)
```

Verificação de aciclicidade: existe ordem topológica (kernel < L1 < L2 < L3 < L4 < L5 < L6 < L7) e toda aresta listada aponta para baixo. A implementação da porta `ApprovalVerifier` pelo PAR é aresta `PAR → GW` (importa o tipo da porta), não `GW → PAR`.

Duas assimetrias intencionais que merecem defesa explícita:

- **Gateway acima de Release, abaixo de Builder/PAR.** O Gateway lê projeções de cinco owners porque *esse é seu trabalho* (last-mile admission). A alternativa "Gateway puro que recebe todo o contexto montado pelo caller" foi considerada e rejeitada (§13, contra-argumento 2).
- **Observability como folha universal.** Todos emitem para ela; ela não importa ninguém. Correlação usa IDs opacos do kernel. O fail-closed de audit-required (3C-13 §7) é dependência de *disponibilidade*, não de import — compatível.

---

## 7. Matriz de dependência direta (pergunta 4)

Linha importa coluna. `●` import estrutural permitido; `port` via porta DIP; `uc` somente via use case; `–` proibido.

| importa → | IAM | WS | REG | OBS | ATT | CON | BRN | PRJ | REL | GW | BLD | PAR | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **IAM** | · | – | – | ● | – | – | – | – | – | – | – | – | – |
| **WS** | – | · | – | ● | – | – | – | – | – | – | – | – | – |
| **REG** | – | – | · | ● | – | – | – | – | – | – | – | – | – |
| **OBS** | – | – | – | · | – | – | – | – | – | – | – | – | – |
| **ATT** | ● | – | – | ● | · | – | – | – | – | – | – | – | – |
| **CON** | ● | – | ● | ● | – | · | – | – | – | uc | – | – | – |
| **BRN** | – | – | ● | ● | – | – | · | – | – | uc | – | – | – |
| **PRJ** | ● | ● | – | ● | – | uc | uc | · | – | – | uc | – | – |
| **REL** | – | – | ● | ● | – | ● | ● | ● | · | – | uc | – | uc |
| **GW** | ● | – | ● | ● | – | ● | – | ● | ● | · | – | port | – |
| **BLD** | ● | – | ● | ● | – | – | ● | ● | – | ● | · | – | – |
| **PAR** | ● | – | ● | ● | – | – | ● | – | ● | ● | – | · | – |
| **MAR** | ● | – | – | ● | ● | – | – | – | ● | ● | – | ● | · |

Notas normativas da matriz:

- `IAM`, `WS`, `REG`, `OBS` são folhas de domínio: **não importam nenhum outro módulo de domínio**. IAM opera sobre IDs opacos (3C-02 já exigia); validação de existência de recurso é orquestrada no use case.
- `PRJ` linha: bindings (`CON`/`BRN`) marcados `uc` — a validação semântica na escrita do binding é cross-module com checkpoint humano; orquestrar em `SetProjectBindingUseCase` mantém Project em L2 com fan-out mínimo. Leitura de refs pinadas pelo Project não requer import (dados próprios).
- `GW → PAR` é exclusivamente a porta `ApprovalVerifier` (§8.1). Qualquer outro uso é violação.
- `REL → MAR` marcado `uc`: served verification via probe de infra no use case de promotion, nunca import de módulo.
- `–` na célula não proíbe *colaboração* — proíbe *import*. A colaboração passa por use case, contexto imutável ou projeção do owner.

---

## 8. Ports, projeções e contextos que se pagam (perguntas 6 e 8)

### 8.1 A única porta DIP de domínio: `ApprovalVerifier`

Classe de falha real: approval humana pode ser revogada/expirar entre a proposta do efeito e a execução. 3C-08 exige revalidação *imediatamente antes do efeito*, dentro da admission atômica. Se o use case buscasse a validade e depois chamasse o Gateway, haveria janela TOCTOU; se o Gateway importasse o PAR, haveria ciclo `PAR → GW → PAR`.

```text
Gateway package
└── define interface ApprovalVerifier { verify(approvalRef, executionDigest): Valid | Invalid }

PAR package
└── implementa ApprovalVerifier sobre sua authority de ApprovalRequest

composition root
└── injeta a implementação no Gateway
```

Custo: uma interface, uma implementação, um wiring. Elimina: ciclo estrutural + janela TOCTOU. É a resposta ao teste de burden-of-proof do handoff §2 — e é a *única* inversão de domínio que passa nesse teste.

### 8.2 Caller execution context do Builder: contexto validado, não porta

O quase-simétrico `Builder ⇄ Gateway` **não** recebe porta, deliberadamente. A assimetria é por classe de falha:

```text
approval humana revogada    → falha de AUTHORITY (humano decidiu; efeito externo material)
ActorRun cancelado mid-call → falha OPERACIONAL (trabalho desperdiçado, sem efeito indevido:
                              discovery é read-only por 3C-08)
```

Para discovery reads do Builder, o fluxo é: use case/Builder valida o estado do ActorRun e monta um contexto de execução estreito (ActorRunId, ChangeId, escopo read autorizado, budget aplicável) que viaja como argumento; o Gateway revalida o que é dele (sessão/IAM, limites físicos, binding, target). A janela in-process entre validação e chamada é de milissegundos e a pior consequência é uma leitura autorizada momentos antes — não é a mesma classe do approval. Criar `CallerAuthorityVerifier` genérico com implementações por superfície seria o começo do policy framework que o LEDGER §8 proíbe.

### 8.3 Projeções de leitura estreitas (na API pública do owner, não pacotes separados)

| Projeção | Owner | Consumidor | Justificativa |
|---|---|---|---|
| `EffectiveAccessContext` | IAM | todos | única fonte de resolução de acesso (3C-02) |
| `ActiveReleaseComposition` | REL | GW, MAR, PAR | admission/serving contra composição exata; ponteiro é authority mutável |
| `ConnectionExecutionFacts` (revision, target, credentialHandle) | CON | GW | execução externa exige target exato server-side |
| `ProjectBindingFacts` | PRJ | GW, REL | binding é precondição de admission/composição |
| `ChangeAcceptance` | BLD | `ComposeReleaseUseCase` | quebra `REL → BLD` |
| `ExactRevision/ArtifactRef` | REG | vários | já exigida por 3C-06 |
| telemetry/audit query | OBS | BLD(verifier), UI | Verification Observability (3C-13) |

Todas são métodos de query na public internal API do módulo owner. Nenhuma vira pacote/DTO universal.

### 8.4 Portas de infraestrutura (não são hexagonal ceremony — cada uma tem substituto real ou mandato)

```text
CodingRuntime      3A-R5: Mastra hoje, Pi fallback; boundary já é autoridade
CredentialBackend  C-007/3C-07: backend substituível é invariante
BlobStore/CAS      3C-14: filesystem hoje, object storage por gatilho
GitInfra           GitHub é provider, não semântica (3C-04); credencial nunca no guest
JobQueue           3C-15: substrate de job não decidido em 3C
MigrationRunner    C-014: infra usada pelo Release
```

### 8.5 Fatos pinados vs. authority revalidada (pergunta 8)

A regra candidata do handoff ("versioned/pinned facts travel; mutable authority is revalidated") está certa mas subespecificada. Refinamento proposto para 3D-01:

> **Viaja como contexto imutável o que é content-addressed ou imutável por construção** (digests de artifact/connector/brain/release manifest/contract revision/dist, IDs opacos, ConnectionRevision id, baseline digest). **É revalidado no owner, o mais próximo possível da execução — idealmente dentro da mesma admissão atômica — tudo que um humano ou sistema externo pode revogar**: sessão/conta (IAM), approval (PAR via porta), ponteiro de release ativo (REL), estado de grant/credencial (CON/credential backend), budget durável (GW admission ledger), qualification/health eligibility (CON), conformance (REL na promotion).

O discriminador não é "versionado vs. mutável" — um ponteiro de release é versionado *e* mutável. O discriminador é **revogabilidade**: se alguém pode invalidar o fato depois que ele foi lido, ele não viaja como verdade; viaja como referência e o owner responde na hora H. Nenhum `UniversalAuthoritySnapshot` é necessário nem permitido.

---

## 9. Use cases de application layer nomeados (perguntas 5 e 13)

Cada um existe por uma razão cross-module nomeada (regra do stopping rule do handoff):

| Use case | Owners coordenados | Razão de existir |
|---|---|---|
| `CreateProjectUseCase` | WS + IAM + PRJ | criação multi-owner (3C-R1 §5, exemplo aprovado) |
| `SetProjectBindingUseCase` | PRJ + BRN/CON | validação semântica + intent + checkpoint sem `PRJ → BRN/CON` fan-out |
| `QualifyConnectionUseCase` | CON + GW | quebra `CON → GW`; CON mantém significado, GW executa probe |
| `InceptionInvestigationUseCase` | PRJ + BLD | quebra `PRJ → BLD`; Project authority + Builder tactics (3C-R1 §4) |
| `BuilderDiscoveryUseCase` | BLD + GW | valida ActorRun context e chama GW (§8.2) |
| `AnalyticQueryUseCase` | BRN + GW | semantic-plan → physical-exec → interpretation; quebra `BRN → GW` |
| `BrainHealthProbeUseCase` | BRN + GW | mesma quebra, para health/conformance probes |
| `ComposeReleaseUseCase` | BLD + REL | quebra `REL → BLD` e o triângulo §5.9 |
| `PromoteReleaseUseCase` | REL + REG/CON/BRN/DB/serving probe | conformance + swap + served verification sem `REL → MAR` |
| `SubmitKnowledgeProposalUseCase` | BLD/PAR + BRN | origem múltipla, publicação humana no Brain |

**Onde use case seria mediator anti-pattern (pergunta 13):** o hot path de serving (`MAR → GW.execute`), tool calls do PAR (`PAR → GW`), operações de Attachments, qualquer leitura de um único owner, emissão de eventos. Regra proposta para 3D-01:

> Use case obrigatório somente quando (a) a operação escreve/coordena ≥2 owners com ordem/authority significativa, ou (b) a chamada direta criaria aresta proibida da matriz §7. Caso contrário, chamada direta de módulo. O número de use cases é uma **lista fechada revisável**, não uma camada por onde toda chamada passa.

Isso mantém a camada como o que 3C-R1 aprovou (coordenação) e impede a deriva para god-layer — que é o risco número 2 do grafo inteiro (§13).

---

## 10. Interfaces/ports explicitamente rejeitados como overengineering (pergunta 7)

```text
- porta/interface para consumir IAM, PRJ, REG, CON, REL in-process
  (chamada direta da public API basta; substituto real não existe)
- CallerAuthorityVerifier genérico por superfície            (§8.2; embrião de policy engine)
- pacote separado "approvals-read"                           (a porta §8.1 já resolve)
- ServingProbe como porta formal de domínio                  (é um GET+digest num use case)
- event bus / domain events para desacoplar módulos          (proibido pelo LEDGER §8; sem consumidor)
- command bus para chamadas internas                         (handoff §6 já veta; confirmado)
- generic PolicyEngine/mediator na frente das admission reads do GW
  (o GW ler N projeções É o trabalho dele — hipótese do handoff confirmada)
- UseCase base class / framework de orquestração             (funções nomeadas bastam)
- interfaces de repositório por módulo "para testabilidade"  (Postgres único; testar contra DB real/temp
  é o padrão já aceito em C-006; mocks de repo não eliminam classe de falha atual)
- OBS como dependência importável de domínio p/ decisão      (proibido por C-013; OBS é folha emit/query)
```

---

## 11. Findings

Nenhum finding é `CONTRACT_VIOLATION` contra autoridade aprovada. Classificação conforme handoff §11.

### F-3D-R0-1 — Triângulo `GW → REL → BLD → GW` (DERIVED_REQUIREMENT para 3D-01)

3C-08 dá ao Gateway `releaseOrCandidatePermits` (⇒ `GW → REL`); 3C-05 §24 permite Release perguntar "este Change está accepted?" (⇒ `REL → BLD` se lido como import); 3C-05 §25 dá ao Builder o Gateway para discovery (⇒ `BLD → GW`). Nenhum doc contradiz outro, mas a soma é um ciclo de import que 3C-R1 §13 não lista. 3D-01 deve fixar a quebra: `ComposeReleaseUseCase` (a aresta que sai é `REL → BLD`, a mais fraca — acceptance é input de composição, não authority contínua que Release precise reler).

### F-3D-R0-2 — Revalidação de approval exige porta DIP (DERIVED_REQUIREMENT para 3D-01)

Descrito em §8.1. Sem a porta, a implementação escolherá entre ciclo `GW ↔ PAR`, TOCTOU no approval, ou leitura de tabela do PAR pelo Gateway — as três violam autoridade aprovada (3C-01 invariante 4/5; 3C-08 invariante 6). A porta é o mecanismo mínimo.

### F-3D-R0-3 — Detector de RigorProfile sem lar estrutural (DERIVED_REQUIREMENT, herdado de F3C05-1)

C-017 exige detector único versionado; 3C-05 §17 registra que Builder **e** Release o consomem e roteia o posicionamento para 3D/3G. Se o detector nascer dentro do Builder, `REL → BLD` reaparece (e o triângulo F-3D-R0-1 junto). Recomendação: módulo `rigor` mínimo em L1 — função pura versionada `(sinais declarados) → FAST|BOUNDED|CONTROLLED`, fail-closed, sem I/O, importada por BLD e REL. Não é policy engine: é uma função com tabela normativa, exatamente como C-017 a descreve.

### F-3D-R0-4 — Substrate Mastra compartilhado entre BLD e PAR (FUTURE_HARDENING, decidir a regra em 3D, realizar em 3H)

3A-R5 põe Mastra Code/AgentController no Builder; 3C-10 põe Mastra no PAR; ambos persistem estado de substrate no mesmo Postgres. Se a realização usar uma instância/registro Mastra global (agents/tools/storage namespaces compartilhados), Builder e PAR ganham um canal de acoplamento invisível ao grafo de imports — mudança de configuração de um afeta o outro, e tool registration de um vaza para o outro. 3D deve declarar: **substrate Mastra é instanciado por módulo consumidor (ou namespaced por boundary), nunca singleton compartilhado entre Builder e PAR**; storage do substrate segue a partição de dados do owner (3E). Sem isso, a replaceability prometida ("Pi como fallback do Builder" sem tocar PAR) é fake replaceability.

### F-3D-R0-5 — Transação cross-module em use cases (questão aberta genuína → Operador, ver §16)

Postgres único torna tecnicamente trivial um use case abrir uma transação cobrindo tabelas de dois owners (ex.: `CreateProjectUseCase` gravando PRJ + grants IAM). 3C não decide isso e as opções divergem materialmente: (a) permitir transação única por use case (simples, atômico, mas acopla schemas no nível de transação e dificulta extração futura de módulo); (b) proibir e aceitar consistência por etapas com compensação (puro, porém mais machinery agora — contra C-017). Recomendação: **permitir (a) explicitamente no F1**, com a regra de que cada statement continua tocando apenas tabelas do owner que o executa (a transação compartilha *atomicidade*, nunca *acesso*). Mas é decisão com consequência de longo prazo em 3E/3M — merece ratificação do Operador em 3D-01, não default silencioso.

---

## 12. Comparação externa

> Critério do handoff: evidência com valor decisório, não citação decorativa. Cada item abaixo sustenta ou desafia uma escolha concreta do §6–§9.

### 12.1 Mitra (evidência empírica interna)

Fontes: `docs/reference/mitra/*`, `docs/research/MITRA-INSPIRATION-MAP.md`, sonda C-009 (`16-sonda-manutencao-mitra.md`, `17-log-observacao-mitra.md`). Fatos observados, com o que cada um sustenta ou desafia:

**Sustenta o DAG proposto:**

- **A aresta build → registry → runtime é one-way na Mitra observada** (`mitra-sdk` cria/atualiza; `mitra-interactions-sdk` só executa por id; nenhuma escrita runtime→registry — `00-OVERVIEW` §fatos, `02-registro-artefatos`). Valida Registry como folha consumida por id/revisão, nunca chamando de volta.
- **Resolução de connection handle é execution-time, server-side** (`connection: 'sankhya'` simbólico; credencial injetada pelo servidor na hora da chamada — `04-integracao-externa`). Evidência empírica direta da regra §8.5: referência viaja, authority resolve na execução. É exatamente `GW → ConnectionExecutionFacts` no desenho proposto.
- **"O defeito não é o modelo — é existir segundo caminho"** (`12-ciclo-de-vida` §2): a Mitra *desenhou* release-as-set mas *opera* por caminhos avulsos (SF publica por id na hora, DDL vale no instante, deploy falha silencioso). Isso é o argumento empírico mais forte a favor de a matriz §7 ser **enforçada mecanicamente** (célula `–` = lint error), não documentada: todo ciclo/bypass começa como "só desta vez".
- **`sf-ids.ts`**: o registry da Mitra endereça por id numérico sequencial, forçando codegen frágil e remap manual em promote/duplicação (`02` §elo, `08` C1). Valida o `ArtifactRef` por scope+slug+digest de 3C-06 e mostra o custo concreto de deixar identidade de registry vazar como acoplamento de build.

**Desafia / informa riscos:**

- **O teto da Mitra é a camada de conexão modelar credencial como configuração estática, nunca como estado vivo** (C-009 p.9; 3 ocorrências). Consequência dependency-relevante: o estado vivo de grant/credencial precisa de owner com API própria (CON) consultada na execução — qualquer desenho em que o fato de credencial viaja pinado repete o teto da Mitra. Reforça que `credentialHandle` na projeção do GW é *referência*, resolvida pelo credential backend no efeito.
- **`fetch` cru escapa do guarda de credencial sem egress governado** (C-009 p.10): o guarda no nível de import/módulo não é fronteira física. Confirma que a matriz §7 protege *arquitetura*, e a fronteira física é de 3I — a invariante anti-circumvention de 3C-08 precisa das duas camadas.
- **A app publicada da Mitra abre o mesmo WebSocket agêntico do builder** ("dois agentes, um backend" — `09-agente-embarcado`), acoplando runtime publicado à infra do build plane por acidente de implementação, e gateado em sessão de usuário logado (mata headless/cron). O Conexus faz a versão governada disso: `MAR → PAR` como aresta explícita one-way, e `AgentTrigger SCHEDULE` sem sessão humana. A lição é que esse acoplamento *vai* existir — melhor como import declarado do que como backend compartilhado implícito.
- **Orphan/lineage detection só existiu porque o operador pediu** (C-009 p.4; regressões achadas apenas por "escrita sem leitura" — OBS-61/62). Valida OBS como owner das projeções `resource_reader`/`resource_writer` *derivadas de eventos do Gateway* (C-013 §15) — ou seja, lineage observada nasce no GW e flui para OBS, sem criar aresta REG → OBS nem OBS → REG.

### 12.2 Factory.ai (documentação pública atual + mapa interno)

Fontes: documentação pública atual (docs.factory.ai, factory.ai/news, 2026-08) e `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`. Fatos públicos verificados; internals de backend permanecem UNKNOWN-PROPRIETARY (o próprio mapa interno lista o que a evidência pública não prova).

- **Monotonicidade de policy é fato público**: "Organization-managed settings have the highest priority... local and project settings cannot weaken organization command policy"; org define Default e **Maximum Autonomy Level** como teto ([auto-run](https://docs.factory.ai/cli/user-guides/auto-run), [identity-and-access](https://docs.factory.ai/enterprise/identity-and-access)). Valida a monotonicidade do GW (camada inferior só aperta, 3C-08) como padrão de mercado, não idiossincrasia.
- **Runtime é folha, com fan-out limitado por construção**: subagent não cria subagent (profundidade 1), um único retorno ao parent, `AskUser` desabilitado em subagent ([custom-droids](https://docs.factory.ai/cli/configuration/custom-droids)). E o dado empírico decisivo do mapa interno (§27.1, legacy-bench): **em 97% das falhas o agente acreditava ter resolvido** — self-report do runtime não é admissível como validação. Sustenta `BLD → CodingRuntime` estritamente descendente e worker-nunca-authority.
- **"Waterfall by handoff, not framework"** (mapa §17, `droid-control/ARCHITECTURE.md`): sem engine central impondo transições; o handoff carrega o suficiente para o próximo passo. É a mesma forma dos use cases §9 — coordenação por ordenação explícita, não por workflow engine. Validators só reportam; o orquestrador cria fix features (mapa §9.4/9.5) — Review→Execution mediado, nunca direto, igual ao Finding routing do Builder.
- **"Política não pode ser alterada pelo próprio change que ela julga"** (mapa §20: policy lida do default branch, não do PR; fix scope por retenção de tools). Fortalece a regra §8.2: o caller execution context do Builder é montado a partir de authority do Hub pinada no dispatch (C-017), nunca do conteúdo julgado. Uma implementação em que o contexto do GW derivasse de estado gravável pelo worker violaria isso.
- **Separação platform/execution como corte público**: "Factory cloud handles orchestration, org metadata, and web authentication" enquanto o agente roda em qualquer lugar, e o tráfego LLM não precisa passar pela Factory ([network-and-deployment](https://docs.factory.ai/enterprise/network-and-deployment)). O corte análogo do Conexus é Hub authority vs. Mastra/E2B mechanics — mesma direção, granularidade diferente (in-process).
- **Contraste sem transferência**: na Factory, "Project" não é entidade forte de servidor — a fronteira dura é a Organization; project scope é config em `.factory/` no repo. O Conexus faz Project first-class (3C-04) porque produz e serve o software, não só o constrói. Diferença de produto, não finding.

### 12.3 Mastra (substrate escolhido — estrutura atual)

Fontes: repositório `mastra-ai/mastra` (main, `@mastra/core` 1.x), blog "Announcing Mastra 1.0", docs atuais (2026-08).

- **A própria Mastra é hub-and-spoke com satélites que nunca se importam entre si**: `@mastra/core` é o hub; memory/server/deployer/observability declaram core como *peer dependency* (instância única em runtime) e não dependem uns dos outros. O 1.0 extraiu telemetry do core para `@mastra/observability` como sink puro — "nothing in the execution path depends on an exporter". Validação externa direta de duas escolhas do §6: OBS como folha fora do caminho de execução, e satélites (módulos) sem arestas laterais não declaradas.
- **`RequestContext` explícito em vez de DI container**: o 1.0 renomeou `RuntimeContext`→`RequestContext` e documenta que valores fluem "through function arguments and configuration callbacks", não por container. Valida a preferência desta revisão por contexto passado como argumento (§8.2) e pela rejeição de framework de DI — a única inversão fica na porta §8.1, ligada manualmente no composition root.
- **Cuidado — o padrão interno da Mastra é um service locator**: componentes se resolvem via registro da instância (`mastra.getAgentById()`, `getTool()`) em runtime, não em import time. Para um *substrate* isso é aceitável; para os módulos de domínio do Conexus é exatamente o `service locator` que o handoff §6 proíbe. Não copiar o padrão do substrate para o domínio.
- **F-3D-R0-4 é viável com o substrate atual**: a instância Mastra *é* o registro — dois consumidores (Builder harness, PAR) podem instanciar `new Mastra({...})` separados; e o Composite Storage do 1.0 roteia storage por domínio explicitamente ("cost, latency, and scaling tradeoffs scoped to the domains that need them"). Ou seja, a regra "substrate não-compartilhado entre BLD e PAR" não luta contra a ferramenta — é o uso natural dela. Sem essa regra, o registro único de agents/tools é o canal de acoplamento descrito no finding.
- **Trajetória do projeto confirma a postura "mechanics, não authority"**: o core encolhe para primitives+registro; tudo operacional vira satélite substituível pinado por peer-range. É o mesmo corte que 3C-10/3A-R5 exigem do Conexus — e sugere que a superfície que o Conexus consome deve ser pinada por versão exata (C-002 pinning) dado o ritmo de minor releases observado.

### 12.4 Pesquisa primária atual (modular monolith / enforcement / padrões)

**Enforcement compile-time (pergunta 14).** Estado atual das ferramentas (fontes primárias, adoção npm semana 2026-08-03..09):

```text
dependency-cruiser        3,2M downloads/sem — allowed-edge lists ("not-in-allowed":
                          tudo que não está permitido é proibido), circular:true com
                          via/viaOnly, reachability; CLI, feedback em CI
eslint-plugin-boundaries  1,5M — element-types por tag + regra dedicada
                          boundaries/entry-point (public API por módulo), in-editor
@softarc/sheriff-core     109k — alternativa leve; adoção ~30x menor
TS project references     fronteira real de compilação, mas allowed-edge only,
                          incompatível com path-alias, custo de manutenção documentado
Nx enforce-module-boundaries  requer adoção Nx; não recomendado só para isso
```

Recomendação: **par complementar dependency-cruiser (matriz §7 como `allowed` + `circular`) + eslint-plugin-boundaries (`entry-point` para public API por módulo)**, num único pacote npm com módulos por pasta no F1. Workspaces/project references ficam como hardening posterior por gatilho (extração de módulo, tempo de build). É o setup de facto para repos não-Nx e cobre 100% da matriz.

**Application layer / A→B→A (perguntas 5 e 13).** As duas referências maduras de modular monolith divergem do desenho proposto num ponto e convergem no resto:

- `kgrzybek/modular-monolith-with-ddd` (C#, a referência do gênero): módulos se comunicam **somente** por integration events assíncronos em bus in-memory — "direct method calls are not allowed"; cada módulo expõe um único gate `ExecuteCommand/ExecuteQuery`. É o desafio externo mais forte ao desenho desta revisão — tratado no §13.7.
- ABP framework nomeia as duas lanes: **Integration Services** (application services estreitos, síncronos, para lookups/checks entre módulos — o análogo das projeções §8.3) e event bus in-process para workflows assíncronos. A prática madura para A→B→A: ida síncrona pela API pública estreita de B; volta como evento. O Conexus, sem bus (LEDGER §8), substitui a volta por ordenação no use case — mesma aciclicidade, custo diferente (§13.7).
- Padrão de falha documentado de god-layer: service classes que acumulam orquestração até 1000+ linhas tocando muitos módulos. Mitigação registrada na literatura = um use case nomeado por fluxo, nunca um "AppService" compartilhado — exatamente a regra §9.

**Backstage**: plugins backend são proibidos de importar uns aos outros; comunicação por network calls; contrato exposto via pacote *node-library* separado (`@backstage/plugin-catalog-node`) com clients e extension points — "depend on contracts, never import a peer's runtime". O análogo in-process do Conexus é a public internal API + kernel de tipos; se o contrato de um par de módulos crescer (candidato: GW↔PAR), o shape Backstage de "pacote de contrato" é o escape natural — hoje, a porta dentro do pacote do GW basta.

**Kubernetes authn/authz/admission**: pipeline one-way fixo — authentication → authorization → mutating admission → validation (re-executada após toda mutação) → validating admission → persistência; estágio nenhum chama estágio anterior; validators veem o objeto final. Regra transferível: *cross-cutting policy entra registrando estágio novo na ordem fixa, não alargando o contrato de um estágio existente*. É o argumento externo para o GW crescer por **novos fatos na conjunção de admission**, nunca por absorver owners — e para a UI/use cases não "pré-validarem" o que o GW valida.

**GitHub/GitLab registry ↔ repo**: nos registries novos de ambos, o package é authority própria que *referencia* a identidade do repo (herança de permissão é default opcional, não subordinação). Valida REG como módulo folha com namespace authority próprio, ligado a — não derivado de — Project (3C-06 já apontava isso via GitHub Packages).

**Pinado vs. revalidado (pergunta 8, confirmação externa)**: OCI digest (content-addressed, imutável) vs. tag (ponteiro mutável — "immutable tags" de registry são política revogável, não propriedade do conteúdo); Nix/Bazel content-addressing; JWT stateless vs. RFC 7662 introspection ("if no server-side state exists, nothing exists to revoke"; híbrido dominante = access token curto + refresh revalidado na authority). A regra transferível da literatura é idêntica ao refinamento §8.5: *nunca deixar um valor derivado de authority sobreviver, em cache, à capacidade da authority de dizer não*.

---

## 13. Strongest counterargument / falsificação adversarial (pergunta 16)

Tentativas honestas de derrubar o desenho proposto, com veredito:

**1. "A camada de use cases vira o god-layer que 3C-R1 proibiu."** Este é o risco mais forte. Dez use cases nomeados hoje; a pressão natural é cada nova operação virar use case, invariantes migrarem dos owners para os orquestradores, e o application layer virar o `ApplicationLayerModule` proibido com outro nome. Mitigação estrutural: (a) a regra de admissão do §9 (lista fechada; direto quando 1-owner); (b) invariantes sempre enforçadas no owner — o use case *ordena*, nunca *decide*; (c) revisão de 3N deve incluir "nenhum invariante vive só num use case". O risco não invalida o desenho — a alternativa (imports diretos bidirecionais) é estritamente pior — mas exige a regra escrita, não boa vontade.

**2. "Gateway devia ser função pura de enforcement: recebe todo o contexto montado, importa nada."** Alternativa real (functional-core): todo caller monta `AdmissionContext` completo e o GW só valida/executa. Falsificação: as authorities mais críticas da admission são exatamente as revogáveis (§8.5) — ponteiro ativo, grant/credencial, budget durável, approval. Se o caller as monta, cada superfície reimplementa revalidação (duplicação que 3C-02 alt. C já rejeitou para authz) e o TOCTOU cresce. O Gateway importar 5 projeções de leitura é o menor acoplamento que mantém fail-closed verdadeiro. A hipótese do handoff ("let Gateway depend on several authoritative projections if that is its real job") sobrevive.

**3. "Aceite o ciclo PAR ↔ GW no nível de pacote; TypeScript tolera se for só tipo."** Falso em runtime: a revalidação é chamada de valor, não de tipo; `import type` não resolve. E ciclo de pacote aceito "só aqui" é o precedente que derruba a regra inteira — o primeiro ciclo tolerado autoriza o segundo. A porta custa ~10 linhas.

**4. "ComposeReleaseUseCase deixa a Release compor sobre acceptance stale."** Janela real: acceptance lida, Change reaberto, compose executa. Mitigação já existente na autoridade: composição pina evidence refs por digest e a **promotion** re-verifica conformance (3C-11 §8) com gate humano — o serving nunca depende só do compose. Stale compose vira Release não-promovível, não incidente. Aceitável.

**5. "Treze módulos + kernel + use cases é estrutura demais para um F1 de um operador."** O contra-argumento YAGNI global. Resposta: a estrutura aqui é *regra de import + pastas*, não infraestrutura — zero processos novos, zero frameworks, uma interface DIP, um linter. O custo marginal de manter o DAG desde o dia 1 é radicalmente menor que o custo de desfazer ciclos depois (evidência: a própria motivação do C-000 de recomeçar fora do kernel MNFS). Rejeitado.

**6. "IAM em L1 sem importar Workspace quebra validação de existência de Area."** A consistência Area↔membership é real (3C-03 §"Area criada/renomeada"), mas é problema de *ordem de escrita* (use case/transação, §11.5), não de import. Colocar `IAM → WS` para "validar existência" recriaria acoplamento que 3C-02 explicitamente dispensou (IDs opacos). Rejeitado.

**7. "A referência madura do gênero (kgrzybek) proíbe chamadas diretas entre módulos — só eventos assíncronos. O desenho proposto, baseado em chamadas síncronas diretas + use cases, está contra a melhor prática."** Este é o desafio externo mais forte (§12.4). Resposta em três partes: (a) o modelo all-events do kgrzybek é otimizado para extração futura em microservices — cada módulo já paga outbox/inbox, at-least-once e consistência eventual *agora* para não mudar código *depois*; é precisamente a antecipação que C-017 e o LEDGER §8 (sem event bus) proíbem sem consumidor real. (b) A segunda referência madura (ABP) legitima a lane síncrona nomeada — Integration Services — para exatamente o uso que as projeções §8.3 fazem; o Conexus está dentro da prática documentada, não fora. (c) O custo real da escolha é conhecido e aceito: acoplamento temporal síncrono (um módulo lento atrasa o chamador) e, na extração futura de um módulo, as chamadas viram rede com falha parcial — nesse dia, a boundary já existe e a conversão é local. Se o F1 rodasse distribuído, o veredito inverteria. In-process, num único Postgres, com um operador: eventos comprariam complexidade de reconciliação sem eliminar classe de falha atual. Rejeitado com custo registrado.

---

## 14. Respostas consolidadas às 16 perguntas do handoff

1. **Grafo conceitual:** §4.
2. **Ciclos aparentes:** §5 — oito pares + um triângulo novo (`GW → REL → BLD → GW`).
3. **Authority cycle vs. colaboração:** nenhum ciclo de authority real; todos são colaboração bidirecional (§5, coluna "Natureza").
4. **Dependências diretas:** matriz §7.
5. **Use cases nomeados:** §9 (dez, cada um com razão cross-module).
6. **Ports/projeções que se pagam:** §8.1 (uma porta de domínio), §8.3 (sete projeções), §8.4 (seis portas de infra mandatadas).
7. **Overengineering rejeitado:** §10.
8. **Pinado vs. revalidado:** §8.5 — critério refinado: content-addressed viaja; revogável revalida no owner.
9. **Ordem de decisão em 3D:** §15.
10. **Escopo de 3D-01:** §15.
11. **DAG acíclico sem enfraquecer 3C:** **sim** — §6 exibe a ordem topológica; nenhuma ownership de 3C foi movida.
12. **Aresta mais provável de virar god-module/ciclo futuro:** o Gateway — por acreção ("só mais um fato na admission") e pela tentação de rotear operações não-boundary por ele (drift já vetado por `No Universal Privileged Bus`); em segundo lugar, o application layer (§13.1).
13. **Orquestração justificada vs. mediator:** §9, regra de admissão.
14. **Enforcement compile-time:** toda a matriz §7 é enforçável; ver recomendação de tooling em §12.4/§15.
15. **Shared value types em vez de import:** kernel L0 — IDs opacos (`WorkspaceId`, `ProjectId`, `ChangeId`, `ActorRunId`…), refs/digests (`ArtifactRef`, `ConnectionRevisionRef`, `releaseManifestDigest`…), enums de trust (`producer_trust`), envelope de erro. Um módulo nunca é importado só para obter um tipo de ID.
16. **Argumento mais forte contra o desenho:** §13.1 (god-layer de use cases) — mitigado por regra escrita, não eliminado.

---

## 15. Sequência recomendada de decisões 3D e escopo de 3D-01 (perguntas 9 e 10)

```text
3D-01  Macro dependency architecture (o grosso do valor está aqui)
       a. adotar o DAG §6 e a matriz §7 como allowed/forbidden import rules
       b. adotar as quebras de ciclo nomeadas: porta ApprovalVerifier (F-3D-R0-2),
          ComposeReleaseUseCase (F-3D-R0-1), use cases §9
       c. adotar a regra de admissão de use case (§9) e a regra pinned/revalidated (§8.5)
       d. posicionar o detector de rigor em L1 (F-3D-R0-3)
       e. declarar substrate Mastra não-compartilhado entre BLD e PAR (F-3D-R0-4)
       f. decidir F-3D-R0-5 (transação cross-module em use case)
       g. escolher enforcement mecânico (recomendação: §12.4) e topologia de pacote
       h. reafirmar: cross-module table access proibido; hub_control compartilha
          atomicidade quando (f) permitir, nunca acesso

3D-02  Gateway admission surface em detalhe
       projeções exatas consumidas, shape do caller execution context (§8.2),
       contrato da porta ApprovalVerifier, atomicidade admission+budget

3D-03  Application layer em detalhe
       assinatura/localização dos use cases §9, transaction boundaries conforme (f),
       regra "invariante vive no owner" verificável em review

3D-04  Infra ports
       contratos mínimos de CodingRuntime/CredentialBackend/BlobStore/GitInfra/
       JobQueue/MigrationRunner — só o que 3F/3H não cobrirá melhor depois
```

3D-01 **não** decide: DTOs/signatures (3F), tabelas/FKs (3E), FSMs (3G), realização física de Mastra/E2B (3H), segurança física (3I), topologia (3J). Decidir menos que (a)–(h) deixaria decisão arquitetural escondida na implementação — exatamente o que o stopping rule do handoff proíbe.

---

## 16. Questões que genuinamente exigem Decisão do Operador

1. **F-3D-R0-5 — transação única cross-module em use cases: permitir (recomendado) ou proibir?** Consequência direta em 3E/3M e no custo de extração futura de módulos.
2. **Ratificar a porta `ApprovalVerifier`** como única inversão de domínio do F1 (recomendado) — alternativa é aceitar ciclo controlado PAR↔GW, que esta revisão desaconselha.
3. **Topologia de pacote + enforcement** (recomendação em §12.4): decisão pequena, mas congela o mecanismo que protege todo o resto.
4. **Ratificar a regra de admissão de use case (§9)** — é a única defesa escrita contra o risco nº 1 (§13.1).

Todo o restante desta revisão é derivável da autoridade existente e não precisa de decisão nova — precisa apenas de ratificação em 3D-01.

---

*Fim da revisão independente. Nenhuma implementação de produto é autorizada por este documento.*
