# 3A-R7 — Platform Consultant Ownership Reconciliation

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3A — Architecture Reconciliation contínua  
**Escopo:** bounded pre-3K gap-fill para `C-003 / AGT-4`  
**Importante:** esta decisão não reabre 3B–3J, não constitui C-018, não encerra a Fase 3 e não autoriza implementação de produto.

## Decisão em uma frase

No Conexus F1, o **Platform Consultant** de `AGT-4` é uma capability de assistência **owned pelo Builder e apresentada pelo Control Plane**, não um Product Agent global: ele usa as mechanics já escolhidas do runtime de assistência/coding quando aplicável, consome conhecimento canônico da própria plataforma por contexto publicado, versionado, provenance-preserving e digest-pinned sob a mesma disciplina de packs usada pelo Conexus, e recebe somente o Workspace/Project atualmente autorizado e derivado server-side; não nasce novo módulo, principal, `PLATFORM`-scoped `agent` artifact, hidden Workspace/Project, lifecycle PAR independente, estado global de agente ou authority cross-Workspace.

---

## 1. Finding material

O pre-3K Global Platform Coherence Checkpoint encontrou um único requisito F1 sem owner explícito:

```text
C-003 / AGT-4
→ Consultor de plataforma:
  agente que conhece docs/SDKs/padrões do Conexus
  e usa o mecanismo do cérebro.
```

C-001 P3/C4 exige que a própria plataforma se entenda e use sua disciplina de conhecimento para ajudar o operador a construir. Entretanto, as authorities já aprovadas distinguiam apenas:

```text
Builder
→ evolução verificável de Projects

Production Agent Runtime
→ agentes empresariais Project-scoped

Workspace Brain
→ conhecimento organizacional de um tenant
```

Sem esta reconciliação, um coding actor poderia escolher silenciosamente entre `PlatformAgent`, hidden Workspace, hidden Project, principal global, novo scope de Registry ou reutilização indevida do Workspace Brain. Essas alternativas alteram owner, tenancy, authority e trust; portanto a lacuna é material pela DevelopmentConexus Engineering Method.

Review provenance, não-autoritativa:

- `3A-FABLE-DIALOGUE-pre-3K-global-platform-coherence-checkpoint.md`;
- independent ChatGPT whole-platform checkpoint;
- independent Fable adversarial whole-platform review, que convergiu em `CURRENT STRUCTURE CONFIRMED + BOUNDED 3A-R7 REQUIRED BEFORE 3K`.

---

## 2. Owner e boundary

### 2.1 Owner semântico

```text
Builder
→ owns AGT-4 assistance semantics while the user is understanding,
  scoping, creating or evolving software with Conexus

Control Plane
→ presents the assistance surface and derives current authorized context
```

O Platform Consultant não vira novo módulo porque seu consumidor atual é exatamente a experiência de construção já owned pelo Builder.

```text
consultant assistance
!= independent business-agent lifecycle
!= platform-wide autonomous actor
```

### 2.2 Runtime mechanics

O consultant pode reutilizar as mechanics de assistência/coding já qualificadas para o Builder, inclusive Mastra/AgentController ou mecanismo equivalente admitido pela realization vigente.

Essas mechanics permanecem substrate:

```text
session / thread / model / tool mechanics
!= Builder authority
!= platform authority
```

Nenhum segundo coding/assistant runtime é implementado apenas para AGT-4.

---

## 3. Conhecimento da plataforma — dogfood sem falsificar tenancy

C-001 C4 permanece preservada: o consultor usa **o mesmo princípio de conhecimento governado** que diferencia o Brain, mas isso não significa armazenar documentação global do Conexus dentro do Workspace Brain de um cliente.

Forma normativa:

```text
canonical Conexus docs / SDK contracts / published standards
        ↓
Hub-published platform context
        ↓
versioned + provenance-preserving + digest-pinned
        ↓
deterministic applicable selection / closure as needed
        ↓
Platform Consultant context
```

A disciplina compartilhada é:

```text
published source
+ provenance
+ version identity
+ immutable/digest-pinned delivery
+ deterministic applicability
+ no hidden live inheritance
```

Não é obrigatório que a realization reutilize literalmente `brain/v1`, `BrainDefinition`, `BrainPack` ou o mesmo compiler físico. Reuso literal só entra se provar ser a menor realization sem misturar scopes/owners.

Portanto:

```text
platform knowledge
!= Workspace Brain content

same knowledge discipline
!= same tenant-owned artifact class
```

---

## 4. Tenant e authority context

Quando o consultant ajuda dentro de um Workspace/Project, todo contexto empresarial é derivado server-side a partir da sessão e da superfície atual.

```text
Account
→ current authorized Workspace
→ current authorized Project when applicable
→ effective Control Plane permissions
→ explicitly admitted Brain/Connection/Project context
→ consultant
```

Ser "agente da plataforma" nunca concede alcance universal.

Invariantes:

1. ausência de relation/grant continua deny;
2. o consultant não enumera outro Workspace por conhecimento global da plataforma;
3. Brain/Connection/Project data só entram pelo mesmo owner/binding/permission model já aprovado;
4. durable credentials nunca são entregues ao consultant/guest;
5. current resource identity é derivada server-side, nunca aceita de payload como boundary de autorização;
6. platform docs podem ser globais; tenant business context nunca é globalizado por isso.

---

## 5. O que AGT-4 NÃO cria

```text
new module                              = 0
new durable record class                = 0
new principal                           = 0
PLATFORM-scoped AgentDefinition         = 0
hidden Workspace                        = 0
hidden Project                          = 0
new Registry scope/kind                 = 0
new Production Agent Runtime lifecycle  = 0
cross-Workspace authority               = 0
global durable agent memory             = 0
second knowledge authority              = 0
```

O inventário 3E-02 permanece intacto.

---

## 6. Relação com Production Agent Runtime

`3C-10 / 3H-02` continuam Project-scoped para Product Agents que fazem parte de um produto/release.

O Platform Consultant não é promovido como `agent/v1` global apenas para reutilizar PAR.

```text
Product Agent
→ Project artifact + Release + PAR lifecycle

Platform Consultant
→ Builder-owned Control Plane assistance capability
```

Se futuramente existir um consumidor real que exija um agente global persistente da plataforma, com lifecycle, grants, triggers, memória ou identidade próprios fora do Builder, isso retorna ao Decision Loop antes de qualquer implementação.

---

## 7. Relação com 3K

Esta decisão congela **owner/scope/authority**, não UI.

3K deve decidir somente a product surface apropriada, por exemplo:

```text
contextual assistant
Builder conversation
Inception / Discovery assistant
help / platform guidance surface
```

3K não pode redefinir o consultant como Product Agent global, hidden Project ou cross-tenant principal por conveniência de UI.

Guardrail de produto carregado ao 3K:

> A robustez interna do Conexus deve permanecer majoritariamente invisível no Golden Path. O usuário pensa em intenção, entendimento, prova, preview e resultado; records/rigor/gates internos aparecem apenas quando materialmente úteis para decisão ou confiança.

---

## 8. Relação com C-018

C-018 deve incluir esta reconciliation no supersession/reconciliation index e consolidar também os pins históricos já explicitamente superseded, sem reescrever silenciosamente decisões antigas.

Notas não bloqueantes para C-018 já confirmadas no checkpoint:

```text
C-003 QUA-4 runtime-comparison semantics survives;
old Pi × Claude-Agent-SDK mechanism spelling is stale after 3A-R5

C-017 provider-diverse validator mechanism was superseded;
fresh/context-independent verification is the load-bearing law

C-013 agent_event was generalized by 3C-13 / 3E

C-010 custom AI-SDK Product loop was superseded by 3C-10 / 3H-02

C-015/C-016 tailnet realization was bounded-amended by 3J-01
```

Essas notas não reabrem authority agora.

---

## 9. Proof strategy

Antes de considerar AGT-4 realizado no first usable Control Plane, Evidence deve demonstrar pelo menos:

1. o consultant responde sobre Conexus usando uma platform-context revision/digest identificável;
2. atualizar docs/standards publicados não altera silenciosamente uma sessão/execução pinada quando pinning é requerido;
3. o consultant dentro do Workspace A não consegue acessar Brain/Connection/Project do Workspace B por ser platform assistance;
4. a surface não depende de hidden Workspace/Project ou Product Agent artifact global;
5. perda/rebuild da sessão não perde nem redefine authority do Project/Change;
6. knowledge source/provenance é auditável o suficiente para distinguir plataforma publicada de conteúdo tenant/user;
7. qualquer capability empresarial usada pelo consultant continua passando pelas authorities/gates normais.

Exact UI, context-pack file shape, retrieval strategy, compiler reuse e prompt assembly pertencem a 3K/3L/Realization conforme materialidade.

---

## 10. Reopen triggers

Reabrir esta decisão somente se surgir consumidor concreto que exija uma das propriedades abaixo:

- platform consultant persistente fora de qualquer Builder/Control Plane journey;
- triggers/background lifecycle independentes;
- grants/revocation próprios distintos da Account/current surface;
- durable global memory própria;
- agent artifact versionado com lifecycle global independente;
- cross-Workspace administration/analysis legitimamente autorizada;
- segundo consumidor real de platform knowledge que torne um artifact/compiler global próprio a menor solution.

Até lá, criar `PlatformAgent`, hidden tenant ou global PAR é `REJECT F1`.

---

## 11. Resultado do pre-3K checkpoint

Com esta única reconciliação:

```text
product thesis materially preserved          = YES
C-003 F1 orphan requirements                 = 0
approved 3B–3J authority reopened            = NONE
material structural overengineering finding  = NONE
Mitra/Factory/MNFS references copied blindly = NO
C-001 P1/P2/P3 + C1–C4 coverage              = COMPLETE at architecture-owner level
next phase                                   = 3K — Frontend / Product Architecture
```

O checkpoint não substitui 3N. 3N permanece a independent global architecture verification após 3K–3M, conforme 3A-R6.

## Decisão final aprovada

> **`AGT-4` é uma capability de assistência owned pelo Builder e apresentada no Control Plane, usando conhecimento da própria plataforma em contexto publicado/versionado/provenance-preserving/digest-pinned sob a disciplina de packs do Conexus, sem converter documentação global em Workspace Brain e sem criar novo módulo, principal, artifact `agent` global, hidden tenant, PAR lifecycle ou cross-Workspace authority. A surface concreta pertence a 3K. Um agente global persistente da plataforma só volta por Decision Loop quando existir consumidor real que exija lifecycle/authority próprios. Esta reconciliation fecha o único gap material encontrado no pre-3K whole-platform checkpoint; a estrutura corrente permanece confirmada e 3K pode iniciar.**
