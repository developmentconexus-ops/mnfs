# 3D-FABLE-R4 — Final Dependency Cross-Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3D — Dependency Architecture, cross-review final (gate 3D-R1)  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3D-R1-FABLE-FINAL-DEPENDENCY-CROSS-REVIEW-HANDOFF.md`)  
**Base revisada:** `998995b8d868ab7c1fd57aef7712a07ce4fc2cb3` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não altera LEDGER nem decisões aprovadas, e não autoriza implementação. O fechamento formal de 3D é ato do operador sobre este parecer.

---

## 1. Verdict

# **CLOSE 3D**

A tentativa de falsificação não encontrou blocker. Os oito critérios de 3D-04 §11 passam; a prova de aciclicidade está no §3 (28 arestas de módulo, descida estrita comprovada aresta a aresta); a precedência sobre linguagem anterior mais ampla está declarada no §4; nenhuma invariante de domínio vive só em orchestration (§5); a única inversão de domínio continua sendo o approval claim (§6); as quatro infra boundaries passam burden-of-proof individual (§7); zero `module/runtime → L7`, zero table access implícito (§8); nenhum finding aberto bloqueia 3E (§10).

Dois guard notes registrados (§9) — nenhum é Finding contra 3D: (a) a regra "exatamente três boundaries de I&A" vale **enquanto `AgentTrigger EVENT` permanece reservado**; a ativação futura de EVENT deve declarar sua boundary de authn/ingress explicitamente (o gatilho C-007/3C-R1 §1 já existe — a nota amarra os dois); (b) o mesmo vale para a futura identity exchange de DEDICATED bindings (já roteada a 3F/3I).

3D fica reconstruível por um fresh actor a partir de: `3D-01` (regras macro) → `3D-02` (Gateway) → `3D-03` (orchestration) → `3D-04` (matriz final, que prevalece onde estreitou) → este R4 (prova + precedência + intake de 3E).

---

## 2. Método

Ataques executados, na ordem do handoff: consistência 3D-04 × 3D-01..03 e 3C (§4); busca de ciclo transitivo por atribuição de nível e verificação exaustiva de arestas (§3); varredura de `module/runtime → L7` implícito por inventário de gatilhos (§8.1); teste de vazamento de invariante nos sete use cases (§5); busca de segunda inversão de domínio escondida (§6); burden-of-proof porta a porta (§7); varredura de table access implícito nas decisões (§8.2); ataque à regra das três boundaries por inventário de caminhos de entrada (§8.3); verificação das arestas/ausências do MAR (§8.4); verificação dos seams internos (§8.5); tabela de findings abertos × prontidão de 3E (§10).

---

## 3. Prova de aciclicidade

Atribuição de níveis (ordem topológica de 3D-04 §4):

```text
nível 0: OBS
nível 1: IAM · WS · REG · RIGOR
nível 2: ATT · CON · BRN · PRJ
nível 3: REL
nível 4: GW
nível 5: BLD · PAR
nível 6: MAR
nível 7: L7 / use cases / boundaries
```

Arestas de módulo da matriz 3D-04 §4 — cada uma com `nível(destino) < nível(origem)`:

```text
CON(2) → REG(1)                                              ✓
BRN(2) → REG(1)                                              ✓
PRJ(2) → WS(1)                                               ✓
REL(3) → REG(1) · RIGOR(1) · CON(2) · BRN(2) · PRJ(2)        ✓ ✓ ✓ ✓ ✓
GW(4)  → IAM(1) · REG(1) · CON(2) · PRJ(2) · REL(3)          ✓ ✓ ✓ ✓ ✓
BLD(5) → REG(1) · RIGOR(1) · BRN(2) · PRJ(2) · GW(4)         ✓ ✓ ✓ ✓ ✓
PAR(5) → REG(1) · BRN(2) · REL(3) · GW(4)                    ✓ ✓ ✓ ✓
MAR(6) → IAM(1) · ATT(2) · BRN(2) · REL(3) · GW(4) · PAR(5)  ✓ ✓ ✓ ✓ ✓ ✓
```

**28 arestas, 28 descidas estritas.** Casos especiais verificados:

- emissão `* → OBS(0)`: sempre descendente, inclusive de IAM/WS/REG/RIGor (nível 1 → 0) ✓;
- approval claim: implementação do contrato do GW pelo PAR = aresta `PAR(5) → GW(4)` já contada; o wiring no composition root (L7) não cria aresta de módulo ✓;
- `L7 → qualquer módulo`: nível 7 → ≤6, sempre descendente; `módulo → L7` proibido e não encontrado (§8.1) ✓;
- portas de infra são folhas fora do grafo de módulos (consumidores descem para elas) ✓.

Como todo grafo com função de nível estritamente decrescente sobre arestas é acíclico, **o import graph final é um DAG. QED.**

Caminhos compostos mais longos re-testados por amostragem adversarial (todos já cobertos pela prova, listados para o fresh actor): `MAR→PAR→REL→CON→REG`, `MAR→BRN→REG`, `BLD→GW→REL→BRN→REG`, `GW→REL→PRJ→WS`, `PAR→GW→CON→REG` — todos estritamente descendentes.

---

## 4. Consistência e precedência — 3D-04 × linguagem anterior

### 4.1 3D-04 × 3D-01/02/03 — sem conflito real

- 3D-01 §16 "Diretas aprovadas" **nunca listou** `CON/BLD/PAR/ATT → I&A` — as remoções de 3D-04 estreitam **R0** (não-autoritativo) e intenções de 3C, não 3D-01. Únicos deltas reais sobre 3D-01 §16: +`MAR → Brain` (introduzida por 3D-03 §7) e a explicitação de `RIGOR` como dependência de BLD/REL (já implícita em 3D-01 §11). Consistente.
- 3D-02 §3: arestas do Gateway idênticas às da matriz ✓. 3D-02 §5 surfaces ✓. 3D-03: sete use cases, `MAR → Brain`, control-plane-only ✓.

### 4.2 Precedência declarada sobre intenções 3C mais largas (para o fresh actor)

As boundaries 3C escreveram "allowed dependency **intentions**" antes de 3D fechar o grafo. Onde a matriz final é mais estreita, **3D-04 prevalece** (declarado em 3D-04 §1) sem reabrir ownership. Casos concretos:

| Texto anterior (intenção) | Grafo final |
|---|---|
| 3C-07: "Connections pode consumir I&A → caller authorization context" | removida — authz nas três boundaries; CON recebe contexto |
| 3C-05 §25: "Builder pode consumir I&A … Connections via binding" | removidas — checkpoint autorizado em L7; Connections só via GW |
| 3C-04: "Project pode depender da public boundary de Brain/Connections para validar binding" | via `SetProjectBinding` (3D-03), sem aresta PRJ→BRN/CON |
| 3C-02: consumers de I&A = "praticamente todos" | colaboração, não import; resolvem L7/MAR/GW |
| 3C-08: `surfacePermits → Builder/Agent Runtime` (lido como lookup do GW) | fatos chegam por caller context tipado + approval port (3D-02 §6–8) |
| 3C-15 §5: MAR "roteia para capability owner" | rotas fechadas: GW/PAR/ATT/BRN; sem PRJ/REG (3D-04 §5.11) |
| R0 §7 (matriz) e R0 §8.4 (portas) | superseded por 3D-04 §4/§6 — R0 é input, não autoridade |

Nenhum desses casos move ownership de 3C — todos trocam *como o fato viaja*, não *quem o decide*.

---

## 5. Os sete use cases — teste de vazamento de invariante

Critério (3D-03 §4): "apagar o use case pode perder o fluxo; nunca pode perder a verdade."

| Use case | Verdade que permanece no owner com o use case apagado | Veredito |
|---|---|---|
| `CreateProject` | PRJ valida project; I&A valida grant; a atomicidade é coordenação legítima (3D-03 §4.2) — sem ela perde-se o fluxo, nenhum owner aceita estado inválido | ✓ |
| `SetProjectBinding` | validade de binding julgada nos gates de compile (Brain) e conformance (Release); set-time é fail-early | ✓ |
| `QualifyConnection` | significado de qualification em Connections; non-mutating enforçado pelo GW | ✓ |
| `InceptionInvestigation` | Inception/Baseline authority no Project; runtime nunca aprova Baseline (3C-R1 §4) | ✓ |
| `BrainHealthProbe` | interpretação PASS/FAIL/CHECK_ERROR no Brain; execução física no GW | ✓ |
| `ComposeRelease` | elegibilidade de composição validada pelo Release no compose; staleness pega na Promotion | ✓ |
| `PromoteRelease` | FSM durável, gates e CAS do ponteiro são authority do Release; crash/recovery lê estado do Release | ✓ |

Zero invariantes de domínio residentes em L7. ✓

---

## 6. Inversão de domínio única — varredura por segundas inversões

Candidatos examinados e descartados: `RIGOR` (função pura importada para baixo — não inverte); portas de infra (fronteiras de substrate, não de authority de domínio); serving probe (cliente HTTP de use case); Mastra tool wrappers do PAR (descem para GW); emissão OBS (descendente); wiring de composition root (montagem, não dependência de módulo). **A única capability em que um módulo inferior define contrato implementado por módulo superior é o approval claim (`GW` define, `PAR` implementa)** — exatamente a única admitida por 3D-01 §6/3D-02 §8. ✓

---

## 7. Quatro infra boundaries — burden-of-proof individual

| Porta | Failure class atual | Substituto real | Consumidores reais | Veredito |
|---|---|---|---|---|
| `CodingRuntime` | removal conditions estruturais de 3A-R5 §15 | Pi (fallback nomeado por autoridade) | Builder | **PASSA** |
| `CredentialBackend` | custódia substituível é invariante (C-007: `credential_backend`+`credential_ref`; vault mínimo → KMS/vault por gatilho) | backend alternativo previsto em autoridade | Connections (lifecycle) + Gateway (resolução no efeito) | **PASSA** |
| `BlobStore/CAS` | filesystem → object storage por gatilho operacional (C-015/3C-14) | object storage | Registry + Attachments + MAR — três consumidores distintos do mesmo primitive | **PASSA** |
| `GitInfra` | GitHub é provider, não semântica (3C-04); credencial nunca no guest, push só no Hub (C-008) | provider Git alternativo | Project (associação) + Builder + operações remotas do Hub | **PASSA** |

Contraprova dos rebaixamentos mantida: `MigrationRunner` (consumidor único, sem substituto — seam do Release) e `job/v1` machinery (idem — seam do MAR) continuam **fora** da lista; nenhuma porta genérica foi reintroduzida por 3D-04 (§6/§9 conferidos). Meta-verificação da R3.1 aplicada: cada porta acima foi testada individualmente, não herdada de lista. ✓

---

## 8. Varreduras negativas

### 8.1 `module/runtime → L7` implícito — inventário de gatilhos

```text
Change accepted → compose          boundary do closure ou job L7 (3D-03 §5.6)   ✓
AgentTrigger SCHEDULE              acorda DENTRO do PAR (substrate); desce       ✓
job/v1 dispatch/lifecycle          interno ao MAR; job desce para GW             ✓
ApprovalRequest pendente → humano  PAR expõe estado; L7/UI CONSULTA (pull)       ✓
Finding → escalation humana        Builder expõe estado; L7 consulta             ✓
health probes agendadas            job L7                                        ✓
qualification pós-criação          fluxo L7 desde a criação                      ✓
```

Padrão geral confirmado: **módulos expõem estado; L7 puxa.** Push/notificação é realização de 3H/3K fora do import graph. Zero subidas encontradas.

### 8.2 Cross-module table/internal access implícito

Reconferidos os pontos onde a tentação existiria: approval claim (escrita do PAR via capability própria, nunca leitura de tabela pelo GW); admission ledger (GW-owned); transação de `CreateProject` (statements por owner, 3D-01 §10); projeções de lineage de C-013 §15 (derivadas de eventos emitidos a OBS, tabelas de OBS); substrate Mastra (namespaces isolados, partição de storage → 3E). Zero acessos implícitos. ✓

### 8.3 Três boundaries de I&A — ataque por inventário de entradas

Caminhos de entrada no sistema: control plane → L7 ✓; app publicado → MAR ✓; agent SCHEDULE → sem principal humano; authority = AgentRun/Agent/Project, revalidada no GW (3D-02 §7) ✓; **guest/sandbox → Hub** (Builder): o canal autentica o **ActorRun** (fato owned pelo Builder, caller proof de 3C-08), não uma Account — por isso não é boundary de I&A; o GW revalida na admission ✓. Nenhum quarto ponto de resolução de I&A existe hoje. Guard notes (§9) cobrem os dois pontos futuros que poderão adicionar entradas.

### 8.4 MAR — arestas e ausências

`MAR → Brain` limitada a compile de AnalyticQuery + health read (3D-03 §7; sem authoring/proposals/publication) ✓. `MAR → BlobStore/CAS` serve bytes por digest — content-addressed dispensa authority; impede Registry-como-CDN ✓. Ausências `MAR → Project/Registry` verificadas contra necessidade real: route mapping é estado do MAR (F3D04-R1 → 3E/3J); capabilities resolvem REG via GW ✓.

### 8.5 Seams internos

`MigrationRunner` e `job/v1` machinery permanecem internos aos owners com gatilhos de reabertura nomeados (3D-04 §6). Nenhuma decisão posterior os reelevou. ✓

---

## 9. Guard notes (não-Findings; amarram gatilhos já existentes)

1. **EVENT ingress:** a regra "exatamente três boundaries de I&A" é verdadeira **enquanto `AgentTrigger EVENT` está reservado** (3C-R1 §1). Quando o primeiro consumidor real ativar EVENT, o desenho do ingress (autenticação/assinatura/dedupe já previstos pelo gatilho C-007) deve **declarar explicitamente sua boundary de authn** — quarta entrada ou subordinação a uma das três. Nada a decidir agora; a nota impede que a regra quebre em silêncio.
2. **DEDICATED identity exchange:** a entrada de apps DEDICATED nos Platform Services (bindings explícitos, 3F/3I) definirá onde sua authority se resolve. Mesma natureza da nota 1; já roteada.

---

## 10. Findings abertos × prontidão de 3E

| Finding/resíduo | Owner | Bloqueia 3E? |
|---|---|---|
| F3D02-R1 — policy de AgentRun in-flight × narrowing | 3G/3I | NÃO — refs de composição já viajam nos records; a regra é comportamental |
| F3D04-R1 — forma física do route mapping | **3E**/3J | NÃO — é trabalho *de* 3E, não pré-condição |
| F3D04-R2 — Project arquivado com Release ativa | 3G/3I | NÃO |
| F3B-R1 — repo canônico/cutover do produto | operador, antes de implementação | NÃO (gate de implementação, não de 3E) |
| F3B-R2 — plan-schema legado re-tipado | 3F | NÃO |
| F3B-R4 — physical trust zones | 3I/3J | NÃO |
| N3 — Planning Depth × RigorProfile | 3G | NÃO |
| DEDICATED identity/egress/deploy · Mastra telemetry correlation · multi-install DEFER | 3F/3I/3J/3H/3L | NÃO |

**Intake de 3E derivado de 3D** (o que 3E deve materializar, sem redecidir): admission/effect ledger do GW (budget/idempotency/attempt/traffic_state); realização do transaction scope compartilhado (`CreateProject`) e do claim de approval na mesma tx; partição de storage do substrate Mastra por owner (3D-01 §14); route mapping do MAR (F3D04-R1); tabelas de OBS (audit/telemetry/lineage projections); representação física das projeções §7 de 3D-04 — tudo respeitando data ownership por módulo e zero FKs cross-owner que criem authority implícita.

---

## 11. Checklist final de 3D-04 §11

```text
1. matriz consistente + precedência explicitada          ✓  §4
2. zero cycles no import graph completo                  ✓  §3 (prova)
3. zero module→L7                                        ✓  §8.1
4. sete use cases sem invariante vazada                  ✓  §5
5. única domain inversion = approval claim               ✓  §6
6. quatro infra boundaries com burden-of-proof individual ✓  §7
7. nenhum finding exige reabrir ownership de 3C          ✓  §10 (nenhum toca ownership)
8. findings roteados com owner posterior explícito       ✓  §10
```

**Recomendação ao operador: declarar `3D = CLOSED / APROVADA` no LEDGER e abrir `3E — Data Architecture` com o intake do §10.**

---

*Fim do cross-review final R4. Nenhuma implementação de produto é autorizada por este documento.*
