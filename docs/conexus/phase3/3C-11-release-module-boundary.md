# 3C-11 — Release Module Boundary

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, `Release` é o módulo Project-scoped responsável por transformar uma composição verificada do Project em uma versão imutável e por promover essa versão para o único deployment target persistente do F1, `PROD`. `ReleaseManifest` define exatamente o que compõe uma Release; `Promotion` representa uma tentativa auditável de tornar uma Release ativa; o active release pointer é a authority de qual composição está ativa em PROD. `Deployment` não é módulo separado no F1 — é capability interna do lifecycle de `Promotion`.

A separação normativa é:

```text
Builder
→ responde "esta mudança está correta?"

Release
→ responde "qual composição exata constitui esta versão e qual está ativa em PROD?"

Published App Runtime
→ responde "como requests são servidos usando a versão ativa?"
```

---

## 1. Contexto e precedência

Esta decisão materializa no nível de module ownership semântica já aprovada principalmente por C-014 e reconcilia 3C-05, 3C-06, 3C-07, 3C-08, 3C-09, 3C-10 e 3A-R5.

Autoridades preservadas:

- C-014: `ReleaseManifest` imutável como composition root, release/promote separados, CAS do ponteiro ativo, EnvironmentConformance, migrations de produção, rollback por re-point e `SERVED_VERIFIED`;
- 3C-05: Builder owns `Change`, correctness, planning, Work Units, ActorRuns, Findings, verification orchestration e closure do Change; Builder não publica diretamente;
- 3C-06: Artifact Registry owns revisões compiladas imutáveis e `AVAILABLE`; `AVAILABLE != ACTIVE/SERVED`;
- 3C-07: Connections owns Connection/ConnectionRevision, qualification, health e credential lifecycle;
- 3C-08: Release promotion e production migration permanecem fora do Capability Gateway;
- 3C-09: Brain owns semântica e publication semantics; Release apenas pina revisões/bindings exatos;
- 3C-10: Production Agent Runtime executa a revisão do AgentDefinition pinada pela Release ativa; runtime não escolhe atualização por conta própria;
- 3A-R5: coding session/Builder termina antes da authority de Release; harness nunca promove por autodeclaração.

Nada aqui congela tabelas/FKs/índices (3E), DTOs/signatures/HTTP (3F), FSM física final (3G), serving topology (3J) ou frontend da experiência de publicação (3K).

---

## 2. Responsabilidade do módulo

`Release` responde à pergunta:

> Qual composição imutável e verificável deste Project existe e qual composição exata está atualmente ativa em PROD?

O módulo owns semanticamente:

```text
Release identity
ReleaseManifest
release eligibility/lifecycle
Promotion
active PROD release pointer
production EnvironmentConformance
production migration orchestration
rollback eligibility
rollback/re-point
SERVED_VERIFIED da Promotion
```

`Release` não vira owner dos conteúdos que compõe. Ele owns a **composição e ativação**.

---

## 3. ReleaseManifest = composition root

`ReleaseManifest` é imutável e referencia identidades exatas, não cópias mutáveis de conteúdo.

Forma conceitual:

```text
ReleaseManifest
├── source
│   └── commit/tree/bundle identity
├── frontend/runtime
│   ├── dist digest
│   └── runtime contract digest
├── artifacts
│   ├── query revisions
│   ├── action revisions
│   ├── job revisions
│   ├── agent revisions
│   └── brain-binding revisions
├── Brain
│   └── exact Brain revision
├── database
│   ├── migration head
│   └── expected schema identity
├── configuration
│   ├── non-secret config contract
│   └── Connection revision bindings
├── dependencies
│   └── dependency/lockfile identity
└── evidence
    └── verification/validation digests
```

Regra:

```text
ReleaseManifest
= immutable composition

ReleaseManifest
!= second registry
```

O manifesto não duplica source, SQL, AgentDefinition, Brain payload, secret material ou artifact payload. Ele referencia revisões/digests exatos owned pelos respectivos módulos/stores.

---

## 4. `Release` e `Promotion` são conceitos diferentes

### Release

`Release` representa uma versão imutável elegível do Project.

Pode existir sem estar servida:

```text
R-17 AVAILABLE
R-18 AVAILABLE
R-19 AVAILABLE
```

### Promotion

`Promotion` representa uma tentativa concreta e auditável de tornar uma Release ativa em um deployment target.

F1 possui apenas:

```text
target = PROD
```

Exemplo:

```text
Promotion P-41
R-18 → PROD
```

Portanto:

```text
Release = WHAT
Promotion = activate WHAT in PROD
```

Essa separação preserva a boa propriedade observada na Mitra (`Save Release != Promote`) sem obrigar a UX a expor dois rituais separados.

---

## 5. Release creation pode ser automática; Promotion é o ato material

F1 não exige approval theater.

Quando Builder fecha um `Change` e existe composição elegível, a plataforma pode compor uma nova Release automaticamente:

```text
Change accepted
→ composition eligible
→ Release R-18 AVAILABLE
```

Isso não publica nada.

A ação humana material é tornar aquela composição oficial em produção:

```text
[Publicar]
→ Promotion R-18 → PROD
```

A interface deve apresentar no mesmo checkpoint qualquer mudança material relevante, por exemplo:

```text
permission widening
new external effect
production migration
Connection target change
material config change
```

Não nasce outro workflow de aprovação apenas para repetir a decisão do mesmo operador.

---

## 6. Active release pointer

O estado servido é decidido por um único ponteiro ativo por Project/PROD, atualizado com compare-and-swap.

Forma conceitual:

```text
Project: Marketplace Hub
Target: PROD
activeRelease = R-18
generation = 42
```

Regra:

```text
expectedGeneration == currentGeneration
→ swap permitido

expectedGeneration != currentGeneration
→ CAS_CONFLICT
```

Nunca há overwrite silencioso nem "last writer wins" para promoção concorrente.

O ponteiro ativo é authority de serving composition; `ReleaseRecord`, Registry `AVAILABLE`, Git branch ou runtime cache não substituem essa authority.

---

## 7. O único deployment target persistente F1 é PROD

3C-11 refina ownership sem criar um domínio genérico de Environment.

Construção/verificação:

```text
E2B sandbox
BuildValidationDatabase
local/development workspace
RunPreview
```

são execution/validation environments do Builder e das fases de QA.

`PROD` é o único target persistente de Promotion owned pelo Release no F1.

Assim:

```text
execution environment
!= deployment target
```

Não existe `EnvironmentModule`, `EnvironmentRegistry`, staging persistente ou união genérica obrigatória entre E2B, Preview e PROD.

A forma física de onde PROD roda — localhost, servidor local, tailnet, cloud, domínio público — pertence a 3J Deployment / Operations Architecture, não a 3C-11.

---

## 8. EnvironmentConformance pertence ao Release como gate de Promotion

EnvironmentConformance responde:

> O alvo real ainda corresponde às assumptions/revisões que tornam esta Release elegível?

Release coordena a consulta aos owners apropriados; não nasce `ConformanceModule`, rule engine ou plugin system.

Conceitualmente:

```text
Release
├── Artifact Registry → revisions existem e resolvem?
├── Connections       → exact revisions/targets estão eligible?
├── Brain             → revisions/bindings resolvem?
├── DB infrastructure → schema/migration state corresponde?
└── Serving infra     → digest realmente servido corresponde?
```

Resultado relevante:

```text
CONFORMANT
ou
DRIFT / STALE / failure class específica
```

Conformance mede target real; pipeline verde ou árvore correta não são prova suficiente de estado servido.

---

## 9. Production migrations

Migration é authored e verificada antes de Release:

```text
Builder
→ authors migration
→ BuildValidationDatabase / QA-DB
→ candidate verification
```

Aplicação em PROD pertence ao lifecycle da Promotion:

```text
Promotion
→ migration orchestration
→ PROD database
```

F1 não cria `MigrationModule`.

`MigrationRunner` é infrastructure/internal component usado por Release. O conteúdo da migration continua versionado no source do Project; Release owns somente o momento/ordem/gates da aplicação em PROD.

As regras detalhadas de backward-compatible versus maintenance-required e recovery permanecem as aprovadas em C-014 e serão materializadas em 3G/3M.

---

## 10. Rollback

Rollback de Release é uma nova Promotion para uma Release anterior elegível.

Exemplo:

```text
PROD → R-18

problem detected

Promotion P-42
R-17 → PROD
```

Não muta R-18.

Não implica automaticamente:

```text
git revert
rebuild de tag
restore de dados
down migration
```

Release primeiro verifica elegibilidade da composição alvo contra schema/config/Connections atuais.

Se não for compatível:

```text
ROLLBACK_UNAVAILABLE_SCHEMA_INCOMPATIBLE
```

A saída é forward-fix ou recovery apropriado. Melhor bloqueio explícito do que "rollback" que produz runtime incompatível.

---

## 11. Boundary com Builder

Builder owns:

```text
Change
COR-*
Plan
Work Unit
ActorRun
Finding
candidate correctness
verification orchestration
Change closure
```

Builder pode produzir um resultado elegível para composição, mas:

```text
Change ACCEPTED
!= Release ACTIVE
```

E:

```text
coding harness says done
!= promote
```

A sessão Mastra não possui `publish` como authority de produto. Ela pode preparar evidence ou executar tarefas autorizadas de build/verification; Promotion permanece ação do módulo Release sob authority Conexus.

---

## 12. Boundary com Artifact Registry

Artifact Registry responde:

> Qual ArtifactRevision compilada exata existe e quais bytes imutáveis a representam?

Release responde:

> Quais ArtifactRevisions exatas fazem parte desta versão?

Logo:

```text
Registry AVAILABLE
!= Release active
```

Release não republica artifacts, não recompila payloads e não substitui Registry/CAS.

---

## 13. Boundary com Connections

Release pode piná-la:

```text
ConnectionRevision / environment / target
```

mas não owns:

```text
credential custody
qualification semantics
Connection health
credential rotation
ConnectorDefinition
```

Mudanças funcionais de binding/config podem tornar candidate/Release `STALE`; rotação transparente do material secreto do mesmo grant não cria Release por si só, conforme 3C-07/C-014.

---

## 14. Boundary com Brain

Release pina:

```text
BrainRevision
ProjectBrainBinding revision/digest
```

mas não decide o significado de métricas, regras ou processos.

Brain continua owner da semântica; Registry continua owner da identidade técnica da ArtifactRevision; Release apenas compõe a revisão exata servida.

---

## 15. Boundary com Production Agent Runtime

Uma Release ativa pode piná-la:

```text
agent revision
resolved model/runtime composition
policy/tool projection digests aplicáveis
```

Production Agent Runtime executa essa composição.

Ele não faz auto-upgrade porque nova revisão ficou `AVAILABLE`.

```text
AgentRevision AVAILABLE
→ nenhuma mudança runtime

new Release promoted
→ runtime passa a resolver a nova composição
```

---

## 16. Boundary com Capability Gateway

Promotion e production migration não passam pelo Capability Gateway.

O Gateway continua sendo last-mile admission/execution para Project Data e External Integrations em nome de callers.

Release usa chamadas internas aos módulos/infrastructure owners necessários para composição, conformance e promotion.

Não nasce um `UniversalPrivilegedBus`.

---

## 17. Boundary com Published App Runtime

Release não atende requests de negócio.

A boundary seguinte (3C-12) deverá possuir semanticamente:

```text
Published App Runtime
→ resolve active Release
→ materializa serving context
→ aplica I&A / runtime policy
→ chama Gateway/runtime capabilities
→ responde HTTP/app request
```

A regra desta decisão é apenas:

```text
Release owns WHAT IS ACTIVE
Published Runtime owns HOW IT IS SERVED
```

Isso evita transformar Release em god module.

---

## 18. Influência Mitra e Factory

### Mitra — ADOPT/ADAPT

O acervo observado da Mitra valida:

```text
Save Release != Promote
snapshot/versioned deploy
rollback por versão anterior
promote como processo observável
```

Referência interna principal:

- `docs/reference/mitra/05-ciclo-de-vida.md`

O Conexus adapta o modelo porque o app Conexus não é apenas frontend/source: pode depender de artifacts, Brain, agents, Connections, schema e config pinados. Por isso a Release Conexus representa a composição funcional inteira, não apenas uma tag/snapshot de código.

Também rejeitamos tratar PROD como outro Project lógico: F1 preserva um único Project e um target PROD isolado.

### Factory.ai — REFERENCE

Factory influencia principalmente a separação:

```text
execution/correctness
!= review
!= delivery
```

Isso reforça `Builder != Release` e a regra de que worker completion não dispara deploy como authority.

Não existe evidência pública suficiente para afirmar que Factory usa internamente os mesmos objetos `ReleaseManifest`, `Promotion`, CAS pointer ou EnvironmentConformance; portanto esses objetos não são atribuídos à implementação privada da Factory.

---

## 19. Alternativas avaliadas

### A — `Release` único com Promotion interna

**ADOTADA.**

Minimiza boundaries e preserva responsibilities reais.

### B — `ReleaseModule` + `DeploymentModule`

**REJECT F1.**

Não existe consumidor/lifecycle independente que pague duas boundaries. Deployment é capability da Promotion.

Trigger futuro: múltiplos deployment engines/targets com lifecycle próprio, multi-region ou provider deployment independente.

### C — Artifact Registry ativa revisions

**REJECT.**

Mistura existence/publication com serving authority e quebra `AVAILABLE != ACTIVE`.

### D — Project owns Release/Promotion

**REJECT.**

Project viraria god module com identidade, bindings, release, deployment e serving state.

### E — Generic Environment module

**REJECT F1.**

E2B, Preview e PROD têm consumers e lifecycles diferentes; abstração comum não elimina failure class atual.

### F — Pipeline/Deployment workflow engine

**REJECT F1.**

Não há segundo consumidor que justifique DSL/engine universal.

### G — rollout strategies agora

**REJECT F1:** canary, blue-green, traffic split, multi-region rollout e automatic rollout framework ficam DEFER até consumidor operacional real.

---

## 20. Public internal API conceitual

3C congela somente intents, não signatures:

```text
composeRelease(...)
getRelease(...)
getActiveRelease(...)
promote(...)
rollback(...)
evaluateConformance(...)
```

3F pode reduzir/renomear essa superfície.

Não pertencem ao módulo operações como:

```text
release.updateArtifact(...)
release.rotateSecret(...)
release.editBrain(...)
release.executeBusinessAction(...)
```

---

## 21. Invariantes

1. `ReleaseManifest` é a composition root imutável da versão.
2. `Release != Promotion`.
3. Registry `AVAILABLE != ACTIVE/SERVED`.
4. `Change ACCEPTED != Release ACTIVE`.
5. O único deployment target persistente do F1 é `PROD`.
6. E2B/BuildValidationDatabase/RunPreview não são targets de Promotion.
7. Active release pointer é a serving authority de composição e é atualizado via CAS.
8. Promotion nunca recompila silenciosamente a Release.
9. EnvironmentConformance mede o target real antes/depois dos passos materiais aplicáveis.
10. Production migration orchestration pertence ao Release; migration authoring pertence ao Project/Builder source flow.
11. Rollback é re-point para Release elegível, não mutação nem restore de dados implícito.
12. Release não owns Artifact semantics, Brain semantics, Connection lifecycle, I&A ou business capability execution.
13. Published Runtime consome a active Release; Release não serve requests de negócio.
14. Deployment não é módulo separado no F1.
15. Sem staging persistente, rollout engine, canary, blue-green, traffic splitting ou generic deployment strategy no F1 sem trigger real.

---

## 22. Deliberadamente deixado para etapas posteriores

### 3D — Dependency Architecture

- direção exata das dependências internas;
- prevenção de cycles entre Release/Registry/Runtime/Connections/Brain;
- event/call direction.

### 3E — Data Architecture

- tabelas de Release/Promotion/pointer;
- constraints/FKs/índices;
- representação de manifest/digests;
- migration ledger físico.

### 3F — Contracts/API

- command/query signatures;
- DTOs;
- HTTP/admin API;
- idempotency contracts;
- error shapes.

### 3G — Behavioral/State

- FSM detalhada de Release e Promotion;
- recovery transitions;
- flags `DRIFT`, `STALE`, rollback-ineligible;
- retry semantics.

### 3J — Deployment / Operations

- localhost/LAN/tailnet/cloud;
- reverse proxy;
- TLS/DNS;
- process supervision;
- physical database/process placement;
- backups e runtime infrastructure.

### 3K — Frontend/Product

- UI de Releases;
- diff antes de Publicar;
- rollback UX;
- progress/status da Promotion.

---

## 23. Fluxo F1 de referência

```text
User intent
   ↓
Change
   ↓
Builder / Mastra CodingSession
   ↓
COR + verification
   ↓
Change ACCEPTED
   ↓
Release compose
   ↓
R-18 AVAILABLE
   ↓
[Publicar]
   ↓
Promotion P-41
   ↓
EnvironmentConformance
   ↓
permission/effect diff
   ↓
migration gates se aplicável
   ↓
CAS active pointer
   ↓
real serving verification
   ↓
SERVED_VERIFIED
```

Falha em qualquer etapa não transforma tentativa parcial em sucesso por autodeclaração do agente.

---

## Estado

```text
3C-11 Release Module Boundary
→ CLOSED / APROVADO

next
→ 3C-12 Published App Runtime Module Boundary
```
