# 3D-FABLE-R3 — Remaining Dependency Closure Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3D — Dependency Architecture, pré-decisão 3D-04  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3D-04-FABLE-REMAINING-DEPENDENCY-CLOSURE-HANDOFF.md`)  
**Base revisada:** `eaf807a6e53d8e77dedfcea54420b03c0c19de1f` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não é decisão 3D-04, não altera LEDGER nem decisões aprovadas, e não autoriza implementação. R0–R2.1 são inputs não-autoritativos; onde esta revisão os corrige, esta prevalece como opinião de review.

---

## 1. Verdict

**O grafo fecha. Nenhum ciclo escondido restante; a matriz final tem MENOS arestas que a de R0.** Depois de varrer os módulos restantes contra 3D-01/02/03:

1. **Quatro arestas de R0 caem** — `Connections → I&A`, `Builder → I&A`, `PAR → I&A` e `Attachments → I&A` são desnecessárias. A consolidação que as elimina é o resultado estrutural desta rodada: **authz se resolve em exatamente três boundaries — L7 (control plane), MAR (serving) e Gateway (admission). Módulos interiores recebem access context validado; nunca re-resolvem I&A.** Reduz o fan-out de I&A no import graph de "quase todos" para três consumidores.
2. **Duas arestas novas de infraestrutura, nenhuma de módulo:** `MAR → BlobStore/CAS` (servir bytes do dist por digest — impede o creep `MAR → Registry`) e `MAR → JobQueue` (lifecycle de `job/v1`, 3C-15). A única aresta de módulo nova de toda a fase 3D continua sendo `MAR → Brain` (3D-03 §7).
3. **`MigrationRunner` rebaixado de porta a seam interno do Release** — consumidor único; porta seria cerimônia. As portas de infra ficam em **cinco**: CodingRuntime, CredentialBackend, BlobStore/CAS, GitInfra, JobQueue(-lite).
4. **3D pode seguir para o cross-review final sem decisão intermediária adicional** — desde que 3D-04 congele a matriz final (§4), a regra das três boundaries (§5) e roteie os dois resíduos pequenos encontrados (§8: mapping rota→Project e serving de Project arquivado).

Nenhum Finding material contra 3D-01/02/03 ou autoridade anterior.

---

## 2. Authority reconstructed

Cadeia: `AGENTS.md` → `LEDGER.md` (3D-01, 3D-02, 3D-03 APROVADAS) → 3D-01 (topologia §15, arestas §16, enforcement §17) → 3D-02 (arestas do Gateway §3–4, surfaces §5, união fechada §11) → 3D-03 (sete use cases, `MAR → Brain`, control-plane-only, invocação §8, transação §10) → 3C-01..15/3C-R1/3A-R5 → C-000..C-017 conforme necessário.

Regras que esta revisão aplica sem reabrir: DAG obrigatório; least dependency necessary (3D-01 §15: layer não implica importar tudo abaixo); imutável viaja/revogável revalida; nenhuma porta sem failure class; substrate isolado (3D-01 §14).

---

## 3. Fechamento módulo a módulo (resíduos do handoff)

### 3.1 Managed Application Runtime

Arestas finais: `IAM, Release, Gateway, PAR, Attachments, Brain, OBS` + infra `JobQueue, BlobStore/CAS`.

- **`MAR → Brain` (nova, 3D-03):** verificada contra o DAG — `L6 → L2`, descendente, escopo limitado a `compileAnalyticQuery` + projeções explicitamente aprovadas (health read, 3D-03 §5.5). Sem creep possível: authoring/proposals/publication/binding intent continuam proibidos (3D-03 §7).
- **`MAR → BlobStore/CAS` (infra):** o dist do frontend é pinado por digest no ReleaseManifest (C-012/C-014); os bytes são content-addressed. MAR busca bytes por digest direto na infra — **não** via Registry. Motivo: Registry resolve *ArtifactRevisions* para execução (caminho do Gateway); servir bytes imutáveis por digest não precisa de authority nenhuma (digest é a prova). Bloquear aqui o creep `MAR → Registry` evita que o Registry vire CDN por conveniência.
- **`MAR → JobQueue` (infra):** `job/v1` lifecycle é MAR-owned (3C-15 §7); jobs executando são runtime surface → só descem (job → GW quando cruza capability boundary). Substrate concreto fica 3H/3L.
- **Sem `MAR → Project`:** o serving context deriva Project de rota/host (3C-15 §4). O mapeamento rota→Project é estado operacional de serving — **owned pelo MAR**, gravado no publish/promotion flow via L7. Adicionar `MAR → PRJ` só para "validar que o Project existe" duplicaria um fato que o próprio mapping + Release ativa já implicam. Resíduo real roteado (§8.2): comportamento de serving quando Project é arquivado.
- **Sem `MAR → Registry`:** capabilities executam via GW (que resolve REG); bytes via CAS. Nada resta.

### 3.2 Release ↔ serving/conformance

Arestas finais: `Project, Registry, Connections, Brain, rigor` + infra `DB/MigrationRunner (seam interno)`. Sem reverse imports:

- served verification = cliente HTTP no `PromoteReleaseUseCase` (GET + digest), nunca `Release → MAR` (mantido de R0/3D-03 §5.7);
- Change acceptance = input pinado via `ComposeReleaseUseCase`, nunca `Release → Builder` (3D-01 §5);
- **sem `Release → I&A`:** autorização de promote é checada na boundary L7 antes do use case; a FSM do Release não resolve principals.
- **`MigrationRunner` rebaixado:** consumidor único (Promotion), lifecycle acoplado ao do Release, substituto real inexistente. Porta formal = cerimônia; fica seam interno do Release. Correção sobre R0 §8.4, que o listava como porta.

### 3.3 Production Agent Runtime

Arestas finais: `Release, Registry, Brain, Gateway, OBS` + substrate Mastra isolado + implementação da approval-claim capability do GW.

- **`PAR → I&A` cai (correção sobre R0):** conversas interativas chegam com principal resolvido pela surface (MAR); runs scheduled/background não exigem sessão humana **por construção** (3D-02 §7/§17.9); approvals são decididas por humano no control plane (L7 → I&A lá); o GW revalida a authority aplicável na admission. Nenhum caminho exige o PAR resolver I&A por conta própria. A aresta era herança do desenho pré-3D-02.
- PAR → REL: leitura de `ActiveReleaseComposition` **no início do run** para pinar composição (3D-02 §5 AGENT_RUN); depois disso o run usa a ref imutável. Descendente, já aprovada.
- Substrate: instância/namespace isolado do Builder (3D-01 §14) — realização 3H.

### 3.4 Builder / Project / Inception

Builder final: `Project, Brain, Registry, Gateway, rigor, OBS (emit + query de Verification Observability)` + portas `CodingRuntime, GitInfra`.

- **`Builder → I&A` cai (correção sobre R0):** checkpoints humanos são fluxo de control plane (L7 resolve I&A); a authority operacional do Builder é o próprio work graph (Change/ActorRun, C-017); o GW revalida o que importa na admission de discovery. O Builder nunca resolve principal.
- Inception: fechada por 3D-03 §5.4 (use case). Resíduo zero.
- Project final: `Workspace, OBS` + porta `GitInfra` (associação de repo). Bindings via use case (3D-03 §5.2). Sem `PRJ → I&A` (nunca teve — 3C-02 já dava IDs opacos).

### 3.5 Connections / Qualification

Connections final: `Registry, OBS` + porta `CredentialBackend`.

- **`Connections → I&A` cai (correção sobre R0):** CRUD de Connection e qualification são fluxos de control plane — authz na boundary L7. O módulo julga *qualification/eligibility semantics* (3C-07), não principals.
- Qualification: fechada por 3D-03 §5.3 (use case; transação nunca através da probe). Resíduo zero.
- `Gateway → Connections` (execução) + `Gateway → CredentialBackend` (resolução de handle no efeito) mantidas de 3D-02/R1.

### 3.6 Brain / Registry / health

Brain final: `Registry, OBS`. Health probes via use case (3D-03 §5.5); runtime lê projeção de health por aresta descendente (`PAR/MAR → Brain`); AnalyticQuery por sequenciamento caller-side (3D-03 §6). Registry final: `BlobStore/CAS, OBS` — folha; **nunca** invoca compilers de módulos especializados (3D-01 §16 proibida); publicação é sempre `owner → Registry`. Resíduo zero.

### 3.7 Attachments / Workspace / I&A / Observability

- Attachments final: `BlobStore/CAS, OBS`. **`ATT → I&A` cai (correção sobre R0):** o principal/access context chega validado da surface (MAR para app publicado; L7 para control plane); ATT enforça as preconditions *do attachment* (att pertence ao Project do contexto, lifecycle, limites — 3C-14 §7). Não re-resolve membership.
- Workspace final: `OBS`. I&A final: `OBS`. Observability final: **nada** (folha absoluta). `rigor` final: nada.

---

## 4. Matriz final proposta (allowed/forbidden)

Linha importa coluna. `●` aprovada; `port` porta/capability especial; vazio = proibida. Emissão para OBS omitida da tabela (todos → OBS, sempre permitida e obrigatória onde audit-required).

| importa → | IAM | WS | REG | rigor | ATT | CON | BRN | PRJ | REL | GW | BLD | PAR | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **IAM** | · | | | | | | | | | | | | |
| **WS** | | · | | | | | | | | | | | |
| **REG** | | | · | | | | | | | | | | |
| **rigor** | | | | · | | | | | | | | | |
| **ATT** | | | | | · | | | | | | | | |
| **CON** | | | ● | | | · | | | | | | | |
| **BRN** | | | ● | | | | · | | | | | | |
| **PRJ** | | ● | | | | | | · | | | | | |
| **REL** | | | ● | ● | | ● | ● | ● | · | | | | |
| **GW** | ● | | ● | | | ● | | ● | ● | · | | port¹ | |
| **BLD** | | | ● | ● | | | ● | ● | | ● | · | | |
| **PAR** | | | ● | | | | ● | | ● | ● | | · | |
| **MAR** | ● | | | | ● | | ● | | ● | ● | | ● | · |
| **L7/use cases** | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |

¹ exclusivamente a approval-claim capability (3D-01 §6 / 3D-02 §8); implementada pelo PAR, wired no composition root.

Portas/infra por consumidor:

```text
CodingRuntime (Mastra Code/E2B)   → Builder
Mastra substrate (isolado)        → PAR
CredentialBackend                 → Connections, Gateway
BlobStore/CAS                     → Registry, Attachments, MAR (bytes por digest)
GitInfra                          → Project (assoc.), Builder, operações remotas Hub-side
JobQueue (seam-lite)              → MAR, jobs L7
MigrationRunner                   → seam interno do Release (não é porta)
serving probe (HTTP client)       → PromoteReleaseUseCase (não é porta)
```

Ordem topológica de verificação: `OBS < {IAM, WS, REG, rigor} < {ATT, CON, BRN, PRJ} < REL < GW < {BLD, PAR} < MAR < L7`. Toda célula `●` desce. **Zero ciclos.**

Delta vs. R0 §7: −4 arestas I&A (ATT/CON/BLD/PAR), −`PRJ → IAM` implícita, +`MAR → BRN` (3D-03), `GW → CredentialBackend` explicitada, MigrationRunner rebaixado. A matriz final é estritamente menor.

---

## 5. A regra que fecha o grafo: três boundaries de authz

Consolidação normativa proposta para 3D-04:

```text
I&A é resolvida em exatamente TRÊS lugares no import graph:

L7 / control plane      → resolve principal + authority antes de invocar
                          use case ou operação de módulo
MAR / serving           → resolve principal + PUBLISHED_APP access context
                          por request (3C-15)
Gateway / admission     → revalida a authority aplicável ao caller/surface
                          na admissão (3D-02 §7)

Módulo interior NUNCA importa I&A para re-resolver principal.
Access context viaja como contexto validado pela boundary de origem.
```

Por que é seguro: toda entrada no sistema passa por uma das três boundaries (não existe quarto ponto de entrada — runtime surfaces são MAR/PAR/BLD, e PAR/BLD só agem via GW quando cruzam capability boundary); o fato revogável (sessão/conta) é revalidado onde 3D-02 §7 já exige; módulos interiores operam sobre operações já autorizadas, com o GW como última linha para efeitos. Por que importa: sem essa regra, cada módulo "por segurança" importa I&A, o fan-out volta, e a resolução de acesso passa a ter N interpretações — o risco exato que 3C-02 (alternativa C) rejeitou.

Precedente externo (base R0/R1, reaplicada): Kubernetes resolve authn/authz **na borda do API server**, nunca dentro de controllers; Backstage resolve permission na boundary da plugin API; Zanzibar é consultado pelo PEP, não por cada componente. Mesmo padrão, mesma razão.

---

## 6. Projeções/contexts finais necessários

Inventário completo após o fechamento — nada além disto:

```text
projeções (na public API do owner):
I&A      → EffectiveAccessContext                (consumidores: L7, MAR, GW)
Release  → ActiveReleaseComposition / por digest (GW, MAR, PAR)
Connections → ConnectionExecutionFacts           (GW)
Project  → identity/binding facts por surface    (GW, REL)
Builder  → ChangeAcceptance/candidate refs       (ComposeReleaseUseCase)
Registry → ExactRevision/ArtifactRef             (GW, REL, CON, BRN, BLD, PAR)
Brain    → compileAnalyticQuery + health read    (PAR, MAR)
OBS      → telemetry/audit query                 (BLD verifier, L7 UI)

caller contexts (3D-02, inalterados):
BuilderExecutionContext · AgentExecutionContext · ServingContext · QualificationContext
```

Nenhuma projeção nova nasceu nesta rodada; duas potenciais foram evitadas (MAR→PRJ identity; MAR→REG payload) por atribuição correta de ownership (§3.1).

---

## 7. Varredura final de ciclos escondidos e arestas desnecessárias

Caminhos compostos re-testados (além dos já fechados em R0/R1):

```text
GW → REL → PRJ → WS                 desce; WS não importa nada       ✓
MAR → PAR → REL → CON → REG         desce em cada passo              ✓
MAR → BRN → REG ← BLD               REG folha; sem retorno           ✓
BLD → GW → REL → BRN ← BLD          BRN não importa BLD              ✓
L7 job → ComposeRelease → BLD/REL   L7 desce; módulo não sobe (3D-03 §8) ✓
MAR job → GW → CON/CredBackend      runtime desce                    ✓
PAR (port impl) → GW → port type    aresta única PAR → GW            ✓
audit fail-closed: * → OBS emit     OBS folha absoluta               ✓
```

Arestas desnecessárias procuradas e não encontradas além das 4 removidas: cada `●` da matriz §4 tem consumidor/failure class citável em decisão aprovada (rastreado em §3 e §5 de 3D-01/02/03).

---

## 8. Findings e resíduos

### F-R3-1 — Consolidação de authz em três boundaries (DERIVED_REQUIREMENT para 3D-04)

§5. Não contradiz nada aprovado — 3C-02 lista consumidores como *colaboração*; 3D-02 §3/§7 já concentra revalidação no GW; esta regra apenas fecha a leitura para o import graph e remove 4 arestas. Sem ela, o fan-out de I&A regenera por "defensive checks" na implementação.

### F-R3-2 — Mapping rota→Project e serving de Project arquivado (resíduo roteado; não bloqueia 3D)

O mapeamento host/rota→Project é estado operacional de serving owned pelo MAR, escrito pelo fluxo de publish/promotion via L7 (§3.1). Duas perguntas ficam com owners posteriores: forma persistida do mapping (3E) e comportamento de serving quando o Project é arquivado com Release ativa (3G — archive não é purge, 3B-16; mas servir app de Project arquivado precisa de regra explícita). Nenhuma aresta de módulo nova é necessária para nenhuma resposta plausível.

### F-R3-3 — MigrationRunner não é porta (correção sobre R0 §8.4; registro)

Consumidor único, sem substituto real, lifecycle acoplado ao Release. Seam interno. R0 superproduziu a porta pelo mesmo hábito que superproduziu use cases — registrado para 3D-04 não herdar.

### Sem Finding contra 3D-01/02/03

A topologia, as surfaces, os sete use cases, a regra control-plane-only e a aresta `MAR → Brain` resistiram à varredura completa. As correções desta rodada são todas **reduções** sobre inputs não-autoritativos (R0), não sobre decisões.

---

## 9. Contra-argumento mais forte

**"Remover I&A dos módulos interiores é defense-in-depth a menos — um bug numa boundary vira bypass total."** É o ataque certo à consolidação §5. Resposta em três partes: (a) o modelo de três boundaries não remove *enforcement*, remove *re-resolução* — o Gateway continua revalidando authority revogável na admissão de tudo que é governado, e efeitos têm a conjunção completa (3D-02); (b) defense-in-depth real contra bug de boundary é a que C-016 já constrói (fronteiras físicas: egress, roles de banco, CSP), não N cópias da mesma consulta lógica ao mesmo Postgres — cópias criam *divergência* de interpretação, o risco que 3C-02 rejeitou explicitamente; (c) o custo da alternativa é concreto: com I&A importado por 8+ módulos, qualquer mudança na resolução de acesso toca o grafo inteiro e o teste de cada módulo passa a exigir fixture de authz — acoplamento máximo pelo benefício de uma redundância ilusória. Rejeitado, com a ressalva honesta: se 3I identificar uma operação interior específica cujo bypass de boundary seja catastrófico e barato de blindar, a resposta é elevá-la a capability governada pelo GW (classe existente), não reabrir o fan-out.

---

## 10. Prontidão para o cross-review final de 3D

**SIM — 3D pode seguir para cross-review final sem decisão intermediária adicional**, com 3D-04 congelando:

1. a matriz final §4 (allowed/forbidden completa, incluindo colunas de infra por consumidor);
2. a regra das três boundaries de authz (§5 / F-R3-1);
3. o inventário fechado de projeções/contexts (§6) — mesma disciplina de união fechada de 3D-02 §11/3D-03;
4. as cinco portas de infra (§4) e os dois rebaixamentos (MigrationRunner seam; serving probe client);
5. o roteamento de F-R3-2 (3E/3G);
6. enforcement mecânico da matriz completa como pré-condição de implementação (3D-01 §17 — ferramenta em 3L).

Critério de prontidão verificado contra o stopping rule do handoff original de 3D: cadeia de autoridade reconstruível do repo ✓; colaboração × import distinguidos em toda decisão ✓; todo ciclo aparente com disposição ✓; nenhuma porta cerimonial (cinco portas, cada uma com failure class; duas rejeições) ✓; todo use case com razão cross-module ✓; bypass de tables proibido e re-afirmado ✓; comparação externa com valor decisório (acumulada R0–R3) ✓; contra-argumento mais forte atacado (§9) ✓; conflitos com autoridade = zero, findings roteados ✓.

O que o cross-review final deve varrer por último: consistência textual entre 3D-01 §16 (lista original de arestas) e a matriz final de 3D-04 (as 4 remoções desta rodada tornam algumas frases de 3D-01 mais largas que a matriz — precedência deve ser declarada, sem editar 3D-01), e a checagem "nenhuma invariante vive só em use case" (3D-03 §4) contra os sete fluxos.

---

*Fim da revisão independente R3. Nenhuma implementação de produto é autorizada por este documento.*
