# Fase 3 — Detailed Decision Index

Este diretório contém decisões detalhadas da Fase 3 que complementam o ledger `../24-arquitetura-system-design.md`.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16-project-internal-resource-ownership.md](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | `../24-arquitetura-system-design.md` |
| Review transversal 3B | 3B-01..17 × C-000..C-017 | CONCLUÍDO | findings abaixo |
| 3C-01 | Modular Monolith no F1 | APROVADO | [3C-01-modular-monolith.md](3C-01-modular-monolith.md) |
| 3C-02 | Identity & Access Module Boundary | APROVADO | [3C-02-identity-access-module-boundary.md](3C-02-identity-access-module-boundary.md) |
| 3C-03 | Workspace Module Boundary | APROVADO | [3C-03-workspace-module-boundary.md](3C-03-workspace-module-boundary.md) |
| 3C-04 | Project Module Boundary | APROVADO | [3C-04-project-module-boundary.md](3C-04-project-module-boundary.md) |
| 3C-05 | Builder Module Boundary | APROVADO | [3C-05-builder-module-boundary.md](3C-05-builder-module-boundary.md) |
| 3C-06 | Artifact Registry Module Boundary | APROVADO | [3C-06-artifact-registry-module-boundary.md](3C-06-artifact-registry-module-boundary.md) |
| 3C-07 | Connections Module Boundary | APROVADO | [3C-07-connections-module-boundary.md](3C-07-connections-module-boundary.md) |
| 3C-08 | Capability Gateway Module Boundary | APROVADO | [3C-08-capability-gateway-module-boundary.md](3C-08-capability-gateway-module-boundary.md) |
| 3C-09 | Brain Module Boundary | APROVADO | [3C-09-brain-module-boundary.md](3C-09-brain-module-boundary.md) |
| 3C-10 | Production Agent Runtime Module Boundary | APROVADO | [3C-10-production-agent-runtime-module-boundary.md](3C-10-production-agent-runtime-module-boundary.md) |
| 3C-11 | Release Module Boundary | APROVADO | [3C-11-release-module-boundary.md](3C-11-release-module-boundary.md) |
| 3C-12 | Application Runtime Profiles | APROVADO | [3C-12-application-runtime-profiles.md](3C-12-application-runtime-profiles.md) |
| 3A-R5 | Builder / Coding Runtime Reassessment | APROVADO | [3A-R5-builder-coding-runtime-reassessment.md](3A-R5-builder-coding-runtime-reassessment.md) |

## 3B-17 — síntese normativa

Registrada no ledger ([../24-arquitetura-system-design.md](../24-arquitetura-system-design.md), entrada 3B-17).

## Review transversal — veredito

3B permanece APROVADA e pode avançar para 3C. Nenhum finding invalida Workspace, Project, Change, ReBAC, bindings ou isolamento já aprovados. Precedências Plan schema v2 e role set C-015 §6 registradas na seção 5 do ledger.

Findings materiais encaminhados, com owner registrado:

1. **F3B-R1 — repo canônico do produto** · owner: Architecture Reconciliation / operador. C-000 previa repo próprio do Conexus após runtime+sandbox. Resolver por cutover ou emenda explícita **antes de implementação**; não bloqueia 3C.
2. **F3B-R2 — Plan schema legado** · owner: 3C/3F. `MissionPlan v2` usa Mission/Milestone/Feature, enquanto C-017/3B usam Change/Work Unit. Reutilizar validation/revision/digest/render/dependency-graph/proof mapping re-tipados para Change/Work Unit, nunca o schema literalmente (precedência na seção 5 do ledger).
3. **F3B-R3 — escopo do Registry e mapa kind→authoring root** · **RESOLVIDO EM 3C por 3C-06 no nível de module ownership/scope/authoring root.** Mapa fechado: `integration → PLATFORM → Platform Connector Catalog Git`; `brain → WORKSPACE → Workspace Brain Git`; `query|action|job|agent|brain-binding → PROJECT → canonical Project repo`. `integration` significa ConnectorDefinition, não Connection. Resíduos legítimos permanecem em 3E/3F para physical schema e contracts de refs/publication.
4. **F3B-R4 — autorização versus browser trust zone** · owner: 3I/3J. 3B-14 separa Control Plane, Preview e Published App logicamente; Security/Deployment precisa decidir o isolamento físico correspondente.
5. **N3 — planning depth × rigor** · owner: 3C/3G. Os dois eixos permanecem distintos; rigor pode impor piso de artifacts/discovery/plano/gates. A relação final será decidida em 3C/3G — não se define aqui `CONTROLLED = FULL`.
6. **N4 — disposição de 3A**: 3A permanece reconciliation transversal contínua até C-018 (inclui reconciliações pontuais quando finding material exigir).
7. **3A-R5 — Builder/Coding Runtime: RESOLVIDO / APROVADO.** Mastra Code / AgentController é o harness principal F1; uma coding session persistente é escopada ao Change e pode atravessar WUs/ActorRuns; persistent thread ON, OM OFF inicialmente; E2B permanece substrate; verifier material é sessão nova independente; Pi fica apenas como fallback sob removal condition. A decisão detalhada registra as supersessões de C-002/C-008 e o refinamento de 3C-05.

Refinamentos materiais aprovados em 3C / Architecture Reconciliation:

- **3C-07-A — qualification de Connection:** a referência de C-007 a `(revision, environment, key_version)` é refinada semanticamente para `ConnectionRevision + ConnectorDefinitionRevision + credential binding/grant version + external target`. `key_version` criptográfica do vault é detalhe de custódia; recriptografia ou refresh transitório do mesmo grant não criam ConnectionRevision/Release nem invalidam qualification por si sós. Forma física/contratual final: 3E/3F/3I.
- **3C-09-A — BrainRevision:** `BrainRevision` é a visão semântica de uma `ArtifactRevision(kind=brain)` exata; Artifact Registry permanece a única authority técnica de revision identity/digest/payload/AVAILABLE. Brain owns significado, validação/compilação e publication semantics.
- **3C-09-B — Brain Health × Binding Conformance:** validade do conhecimento Workspace-scoped e conformidade da implementação de um Project são eixos distintos; binding local inválido não invalida automaticamente a definição global.
- **3C-09-C — Evolution by Preserved Semantics:** F1 não constrói RAG/graph/partitioning, mas preserva logical IDs, typed relationships, provenance, compiler boundary, eval signals e `EffectiveBrainSlice`, permitindo evolução futura por gatilhos medidos sem trocar a authority canônica.
- **3C-10-A — Production Agent substrate:** a rejeição categórica de framework de agente da C-010 é superseded para Production Agents. Mastra passa a ser substrate principal sob `ProductionAgentRuntime`; Conexus preserva authority sobre Registry/Release/I&A/Brain/Connections/Gateway/ApprovalRequest/AgentTrigger.
- **3C-10-B — durable agent semantics:** Agent é ator lógico durável; `AgentRun` é execução concreta. `AgentTrigger` fecha `SCHEDULE | EVENT`; runtime memory, workflow/checkpoint e suspend/resume podem ser realizados pelo Mastra sem virar authority empresarial.
- **3C-11-A — Release ownership:** `ReleaseManifest` é a composition root imutável; `Release` owns versões elegíveis e `Promotion` owns tentativas de ativação em `PROD`. `Deployment` não é módulo separado no F1.
- **3C-11-B — deployment target cut:** `PROD` é o único target persistente de Promotion; E2B, BuildValidationDatabase e RunPreview são execution/validation environments e não entram num `EnvironmentModule` genérico.
- **3C-11-C — active serving authority:** um active release pointer atualizado via CAS define a composição ativa; Registry `AVAILABLE`, Git ou runtime cache não substituem essa authority.
- **3C-11-D — promotion mechanics:** EnvironmentConformance, production migration orchestration, rollback eligibility/re-point e `SERVED_VERIFIED` pertencem a Release; canary/blue-green/traffic splitting/staging persistente continuam DEFER.
- **3C-12-A — one Factory, two runtime profiles:** `ApplicationRuntimeProfile = MANAGED | DEDICATED` é união fechada F1 e fato material do Project Baseline. Ambos usam o mesmo Project/Change/Builder/verification/Release model.
- **3C-12-B — MANAGED:** aplicações organizacionais usam build real, mas executam backend/capabilities sobre o runtime e os serviços governados compartilhados do Conexus; backend dedicado não é Golden Path.
- **3C-12-C — DEDICATED:** produtos/software independentes podem possuir frontend/server/data runtime próprios e consumir serviços Conexus somente por bindings explícitos; não são extensões privilegiadas do Hub.
- **3C-12-D — Release refinement:** `runtimeProfile` entra na composição da Release; MANAGED e DEDICATED possuem outputs de runtime diferentes, mantendo uma única authority de Release/Promotion/PROD.
- **3C-12-E — C-012 scope refinement:** a premissa `Hub já é o backend` passa a ser baseline MANAGED, não universal para DEDICATED.
- **3C-12-F — C-015 scope refinement:** a topologia de auth/serving compartilhada/same-origin de C-015 passa a ser baseline MANAGED. DEDICATED pode usar I&A Conexus por binding ou auth própria; trust/identity exchange/ingress ficam para 3I/3J.
- **3A-R5-A — Change-scoped coding cognition:** `CodingSession`, `WorkUnit`, `ActorRun` e sandbox têm lifetimes distintos. Work Unit/ActorRun não exige fresh cognition; novo Change recebe session nova por default.
- **3A-R5-B — Builder memory baseline:** persistent thread ON; Observational Memory OFF até trigger + eval. Conhecimento durável continua explícito em Git/Baseline/Brain/standards.
- **3A-R5-C — Builder runtime realization:** Mastra Code / AgentController + Workspace/E2B é a realização F1 escolhida; `@mastra/e2b` é usado inicialmente por YAGNI; Git remoto/durable secrets/authority permanecem Hub-side; ~45 min vira checkpoint operacional, não lei de decomposição.
- **3A-R5-D — verification:** deterministic proof first; verifier agentic apenas quando material, sempre em sessão nova cognitivamente independente e sem corrigir o que está julgando.

Dívida editorial (não material):

- 3B-12 ainda usa `PROJECT_MEMBER`; reconciliar com as roles de 3B-13 (`PROJECT_VIEWER | PROJECT_CONTRIBUTOR | PROJECT_ADMIN`).
- avaliar renomear `ViewerContext.capabilities` para `effectivePermissions`.
- `Workspace` fica reservado ao tenant (3B-01); o environment de desenvolvimento não usa o nome "workspace" — alinhar textos existentes (ex.: C-014, exemplos de 3B-15) nas fases 3C+.
- distinguir, quando aplicável, o validation database temporário do control/data plane (C-006/3B-16) do database sintético local do sandbox (`BuildValidationDatabase`, C-008).
- app role e data audience permanecem dimensões distintas; múltiplas audiences continuam sob trigger.
- validation database é temporário sob demanda, não terceiro environment persistente.
- self-grant de Workspace Admin fica para Identity & Access Design.
- textos C-012/C-015 anteriores que descrevem uma única topologia de published runtime devem ser lidos sob a precedência explícita de 3C-12 até a reconciliação editorial final.

## Encerramento de 3B e estado atual de 3C

```text
3B — System Context & Boundaries: CLOSED / APROVADA
3C — Domain / Module Architecture: EM ANDAMENTO
  3C-01 Modular Monolith: APROVADO
  3C-02 Identity & Access: APROVADO
  3C-03 Workspace: APROVADO
  3C-04 Project: APROVADO
  3C-05 Builder: APROVADO (runtime realization reconciled by 3A-R5)
  3C-06 Artifact Registry: APROVADO
  3C-07 Connections: APROVADO
  3C-08 Capability Gateway: APROVADO
  3C-09 Brain: APROVADO
  3C-10 Production Agent Runtime: APROVADO
  3C-11 Release: APROVADO
  3C-12 Application Runtime Profiles: APROVADO

3A-R5 Builder/Coding Runtime Reassessment: CLOSED / APROVADO

next:
  3C-13 Observability / Audit Module Boundary
```

Isso não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação.