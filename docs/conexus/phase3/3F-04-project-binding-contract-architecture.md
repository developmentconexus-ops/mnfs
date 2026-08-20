# 3F-04 — Project Binding Contract Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** quarta decisão aprovada de 3F  
**Importante:** esta decisão não constitui C-018, não encerra 3F nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1 existem **dois contratos de binding concretos e tipados**, não uma abstração genérica: `ProjectConnectionBinding` é uma versão imutável de ponteiro `(Project, slot, consumerTarget) → exact Connection + exact ConnectionRevision`, enquanto `ProjectBrainBinding` é uma adoção imutável do par `exact Brain revision + exact brain-binding/v1 artifact revision`; ambos são autorados exclusivamente pelo source canônico Git do Project, adotados como current intent do Hub via `SetProjectBinding` com CAS, congelados exatamente por Release, sem live inheritance/fallback, e expostos ao usuário como escolhas simples de produto sem vazar Git, digest, revision, CAS ou machinery interna.

---

## 1. Authority, método e provenance

Esta decisão fecha o item `Project binding contract shapes` roteado por authority anterior e reconcilia:

- 3B-15 — Workspace owns resource / Project owns explicit typed binding;
- 3B-16 — Git = authoring, Hub/Postgres = operational authority, Release/Registry = immutable outputs/serving;
- 3C-04 — Project owns `ProjectBrainBinding`, `ProjectConnectionBinding` e Config Contract intent;
- 3C-06 — `brain-binding/v1` é artifact PROJECT-scoped; Connection concreta não é artifact;
- 3C-07 — Connection + immutable ConnectionRevision + qualification/health separados do Project binding;
- 3C-09 / C-011 — Brain semantic authority, binding conformance e explicit Brain adoption;
- 3C-11 / C-014 — ReleaseManifest é composition root e active Release é serving authority;
- 3D-03 — `SetProjectBinding` é um dos sete use cases L7 fechados;
- 3D-R1 — PUBLISHED_APP usa active Release pins; AGENT_RUN usa run-pinned composition;
- 3E-02 — `prj.brain_binding` e `prj.connection_binding` são classes concretas; ProjectConnectionBinding pina Connection + exact ConnectionRevision; Tier-3 refs;
- 3F-01 — binding refs/revisions possuem durable-trait quando pinados por consumers independentes;
- 3F-02 — F3 operation rules, server-derived authority, stale-expectation semantics e ausência de generic envelopes;
- 3F-03 — exact-pinning/custody/recovery discipline como precedente de não reconstruir authority a partir de mutable current state.

Review/provenance não-autoritativa:

- `3F-FABLE-DIALOGUE-project-binding-contract-architecture.md`;
- `3F-FABLE-DIALOGUE-project-binding-contract-architecture-R2.md`.

O diálogo passou por duas rodadas adversariais ChatGPT ↔ Fable, com deletion test, buildability, Global Maximum e product-experience pass. Resultado final:

```text
READY FOR OPERATOR APPROVAL
nenhum Material Finding contra authority anterior
nenhum mecanismo UNSUPPORTED
zero probes novos exigidos por 3F-04
```

Nenhuma afirmação desta decisão depende de comportamento atual do Mastra.

---

## 2. Dois contratos, shared laws, nenhuma base genérica

F1 congela:

```text
ProjectConnectionBinding
!=
ProjectBrainBinding
```

Eles compartilham **leis**, não um payload/base type:

```text
Project owns current intent
immutable historical binding versions
Git-first reproducible source
mandatory per-version provenance
expected-current CAS para SET e UNBIND
same-Workspace/owner-scope checks
no implicit fallback
no live inheritance
specialized-owner validation
Release pins exact adopted refs
active Release/AgentRun never re-resolve mutable current Project intent
explicit history-preserving UNBIND
```

Isso **não** autoriza:

```text
Binding<T>
BindingRecord
BindingRepository
BindingService
BindingSet
BindingEngine
GenericProjectBinding
resourceType + bindingData
```

Private helper code pode ser compartilhado quando trivial; nenhuma public generic contract nasce.

---

## 3. Assimetria principiada: content vs pointer

### `brain-binding/v1` é conteúdo

`brain-binding/v1` representa conteúdo semântico Project-authored que um compiler/reader especializado interpreta, por exemplo:

```text
logical ID → local implementation mapping
assertions / conformance expectations
refinements / overrides quando admitidos
```

Portanto possui lifecycle legítimo de Artifact Registry:

```text
source Git
→ validate/compile
→ immutable artifact revision/digest
→ exact pin
```

### `ProjectConnectionBinding` é ponteiro

`ProjectConnectionBinding` contém somente a resolução explícita do Project:

```text
(project, slot, consumerTarget)
→ exact Connection
→ exact ConnectionRevision
```

Não possui conteúdo independente para compilar nem consumer independente de um compiled payload.

Portanto:

```text
brain-binding Registry kind = justificado
connection-binding Registry kind = rejeitado
```

Registrar um ponteiro como artifact apenas por simetria criaria outra pipeline/digest sem failure class atual.

---

## 4. Um único caminho de authoring: Git-first, UX-transparent

F1 possui exatamente um caminho de mutação de binding:

```text
Project canonical Git source
→ authored binding change
→ immutable source revision/commit
→ SetProjectBinding validates/adopts exact resolved intent
→ Hub current authority
```

Não existe:

```text
Control Plane → mutate prj.* only
Hub-only binding mutation
DB-only emergency rebind
```

### Control Plane continua sendo a experiência normal

Git-first **não significa** que a pessoa usa Git manualmente.

O Control Plane pode oferecer UI como:

```text
ERP principal
Produção: [ Sankhya Produção ▼ ]
[Testar conexão] [Salvar]
```

Ao salvar, a plataforma pode:

```text
resolve user's selection
→ write canonical binding source
→ commit Git automatically
→ call SetProjectBinding
```

A machinery fica interna.

### Provenance obrigatório por versão

Toda binding version registra provenance suficiente para responder:

> Qual source revision produziu exatamente esta intenção adotada, e qual principal originou a mudança?

Quando a plataforma cria o commit em nome do usuário, provenance registra **source revision + acting principal**, sem reduzir attribution ao bot/committer técnico.

### Reprodutibilidade

A authored source revision deve reproduzir deterministicamente os exact refs adotados.

São proibidas semânticas equivalentes a:

```text
connection = latest
brain = current
connection = whatever is named "Sankhya PROD"
select the only available connection
most recently qualified resource
time-varying auto-selection
```

Se re-resolver a mesma source revision não produz os mesmos exact refs, a source não é provenance suficiente.

### Break-glass futuro

Compatible secret/grant rotation pertence ao lifecycle da Connection/Credential e não exige rebind. Functional target/revision change não altera active Release sem nova composição/Promotion. Logo um DB-only emergency rebind não resolve corretamente nenhum consumer F1 atual.

Break-glass runtime override só entra por Decision Loop com incident failure class real.

---

## 5. `ProjectConnectionBinding`

### 5.1 Current logical key

```text
(Project, slot, consumerTarget)
```

onde:

```text
slot = Project-local symbolic purpose key
consumerTarget = DEV | PREVIEW | PROD
```

`slot` realiza a semântica de purpose de 3E-02. Não existe segundo `purpose` free-form que possa divergir.

Exemplos legítimos:

```text
erp.primary
erp.secondary
marketplace.primary
```

F1 não possui catálogo universal de slots. O slot é Project-local e explicitamente authored.

### 5.2 Closed consumer target

```text
DEV
PREVIEW
PROD
```

- DEV = workspace/development consumer target;
- PREVIEW = RunPreview binding face;
- PROD = production target.

BuildValidationDatabase não ganha selector; é ambiente efêmero de prova, não current Project Connection-binding target.

### 5.3 Immutable binding version

Uma versão preserva semanticamente informação equivalente a:

```text
Project identity
slot
consumerTarget
exact Connection identity
exact ConnectionRevision ref
mandatory source provenance
binding-version identity
```

`connection_id` e `connection_revision_ref` permanecem ambos explícitos conforme 3E-02:

```text
Connection stable identity
!=
exact ConnectionRevision identity
```

A relação revision→Connection é validada mecanicamente no set-time.

### 5.4 O que não é copiado

Não persistir no Project binding cópias de:

```text
credential handle/material
ConnectorDefinition digest separado
external target/environment separado
health
qualification result
operation allowlist
active Release
```

Esses fatos permanecem owned/derivados em Connections, Registry, Release, Gateway e demais owners.

### 5.5 Absence é fail-closed, sem selector inheritance

Se um consumer exige `(slot, consumerTarget)` e não existe exact current binding:

```text
BINDING_REQUIRED_BUT_ABSENT-class refusal
```

Nunca:

```text
PREVIEW absent → DEV
DEV absent → PROD
PROD absent → DEV
```

Mesmo quando DEV e PREVIEW apontam à mesma ConnectionRevision, isso é explicit data, nunca inheritance.

Um Preview que não usa uma Connection pode simplesmente não possuir aquele binding; absence só falha quando a capability concreta o exige.

### 5.6 Multi-account e failover

Duas contas/targets intencionais são dois slots explícitos, por exemplo:

```text
erp.primary
erp.secondary
```

F1 não permite múltiplas Connections concorrentes sob um mesmo slot/target. Pools, load balancing e failover automático retornam por Decision Loop.

---

## 6. Qualification, health e effective operation authority

Binding existence não equivale a qualification nem permission.

Uma Connection binding pode ser adotada quando:

```text
exact Connection/ConnectionRevision exists
revision relation is valid
scope/Workspace/Project relation is valid
Connection owner permits NEW adoption under current lifecycle
consumerTarget relationship is structurally valid
```

mesmo quando qualification ainda não está PASS.

Resultado legítimo:

```text
valid Project intent
+
not yet releasable/serving-eligible
```

Set-time pode exibir qualification atual como informação **advisory**, lida do owner, mas `prj.*` não persiste snapshot de qualification/health.

Release/EnvironmentConformance/Gateway enforçam current eligibility no gate material.

Effective operation authority permanece interseção de authorities existentes:

```text
Connector contract
∩ Connection current eligibility
∩ ProjectConnectionBinding
∩ Release composition
∩ artifact/tool classification
∩ caller authority
∩ policies/preconditions
∩ Gateway admission
```

Nenhuma operation allowlist adicional pertence ao binding.

---

## 7. `ProjectBrainBinding`

ProjectBrainBinding current authority preserva o par irredutível:

```text
exact Brain revision/digest
+
exact Project-scoped brain-binding/v1 artifact revision/digest
```

mais:

```text
immutable Project binding-version identity
current selection relationship
mandatory source provenance
```

O semantic payload existe somente no artifact `brain-binding/v1`; `prj.brain_binding` não copia mappings, assertions, refinements, health ou validation results.

### 7.1 Brain revision e binding artifact mudam independentemente

Brain revision é published Workspace resource. Binding artifact é Project-specific semantic realization.

Logo nenhum pode ser derivado silenciosamente do outro.

### 7.2 `brain-binding/v1` não embute o target Brain digest

Embedding criaria:

1. **source churn:** BR-12→BR-13 com realization idêntica exigiria artifact novo sem mudança semântica local;
2. **split authority:** embedded Brain pin e Project adoption pair poderiam divergir.

Portanto o artifact registra expectativas/conformance próprias, não a revisão de Brain atualmente adotada.

### 7.3 Reuse após revalidation

É legítimo:

```text
BR-12 + binding artifact B7
→ BR-13 published
→ specialized revalidation of (BR-13, B7)
→ if compatible: explicit adoption of BR-13 + same B7
```

Isso não é live inheritance: a nova Brain revision só vira current Project intent após explicit SetProjectBinding/adoption.

A identidade segue C-011:

```text
brainDigest may change
projectBindingDigest may remain stable
```

### 7.4 Validation evidence

Brain owns `brn.binding_validation`. Project não pina um validation row ref por default.

O owner resolve evidence/conformance pelo exact pair + lineage. Se 3N provar que correctness/audit exige identificar um validation record específico e isso não pode ser derivado com segurança, um narrow Tier-3 ref retorna por Decision Loop.

---

## 8. Adoption admissibility e historical pins

`SetProjectBinding` valida com owners especializados sem congelar as FSM labels de 3G.

Para nova adoção:

```text
Project owner
→ mutation admitted under current Project lifecycle

Connections owner
→ exact Connection/Revision exists, scope valid,
  target is owner-admissible for NEW adoption

Brain/Registry
→ exact Brain + binding artifact revisions resolve,
  Brain target is owner-admissible for NEW adoption,
  pair passes required specialized validation
```

3F-04 congela **new-adoption admissibility**, não enums como `ARCHIVED`/`WITHDRAWN`.

Target deixar de ser selecionável para nova adoção não invalida referências históricas já pinadas.

```text
new adoption eligibility
!=
historical reference resolvability
```

Rollback re-points um ReleaseManifest antigo; não re-adota o Project binding. Rollback pode ser inelegível por suas próprias regras C-014, mas nunca apenas porque o target pinado depois deixou de ser selecionável para novas adoções.

---

## 9. Expected-current CAS e historical immutability

SET e UNBIND exigem:

```text
expectedCurrentBindingRef
= ABSENT | exact prior immutable binding-version ref
```

Hub compara a expectation com current Project binding authority.

Mismatch:

```text
STALE_EXPECTATION / concurrency conflict
```

Nenhum global `bindingGeneration`, BindingSet generation ou set-level CAS é criado.

Binding versions são imutáveis. Nenhum campo — inclusive cosmetic metadata da versão — é corrigido in-place. Correção produz nova versão; errata/evidence pode ser appended separadamente quando aplicável.

Concurrent changes em slots independentes não precisam bloquear umas às outras.

---

## 10. UNBIND

UNBIND faz parte do contrato sem antecipar uma FSM complexa.

Connection:

```text
UNBIND_CONNECTION(Project, slot, consumerTarget, expectedCurrentBindingRef)
```

Brain:

```text
UNBIND_BRAIN(Project, expectedCurrentBindingRef)
```

O unbind:

```text
é authored no Git primeiro
usa source provenance + acting principal
é adotado com CAS
remove somente current Project intent
preserva historical immutable binding versions
não altera existing Release
```

Consumer gates que usam mutable current Project intent passam a ver absence e falham fechado quando a binding é requerida.

Lifecycle/status completo fica para 3G.

---

## 11. `SetProjectBinding` surface

O named L7 use case de 3D-03 continua um único flow com closed discriminated input:

```text
SET_CONNECTION
  Project
  slot
  consumerTarget
  exact Connection
  exact ConnectionRevision
  sourceProvenance
  expectedCurrentBindingRef

SET_BRAIN
  Project
  exact Brain revision
  exact brain-binding/v1 artifact revision
  sourceProvenance
  expectedCurrentBindingRef

UNBIND_CONNECTION
  Project
  slot
  consumerTarget
  sourceProvenance
  expectedCurrentBindingRef

UNBIND_BRAIN
  Project
  sourceProvenance
  expectedCurrentBindingRef
```

Isso é uma união fechada de operações concretas, não um generic binding dispatcher.

Proibido:

```text
{ kind, target, payload }
GenericBindingMutation
resourceType
bindingData: unknown
```

Exact TS names, HTTP/routes e wire representation não são congelados por 3F-04. Browser surface segue 3F-02 F3; authority/resource scope é derivado/validado server-side.

---

## 12. Três camadas de authority

A lei central é:

```text
Git source revision
→ what binding intent was authored

Project/Hub current binding ref
→ which immutable authored intent version is current Project authority

ReleaseManifest
→ which exact binding/revision pair is frozen into served composition
```

Consequências:

```text
new Git commit
!= current Project binding

new current Project binding
!= active Release changed

new Workspace Brain/Connection revision
!= Project binding changed
```

Release composition utiliza exact refs, não mutable current pointers.

Não existe `BindingSet` nem `bindingSetDigest`: o ReleaseManifest digest já faz commitment da composição completa. Um segundo aggregate/digest seria drift surface sem consumer.

---

## 13. Runtime composition law

Runtime surfaces não usam current Project bindings como authority.

```text
PUBLISHED_APP
→ active Release composition

AGENT_RUN
→ run-pinned composition
```

Uma mudança posterior no current Project binding não troca silenciosamente uma Release ativa nem um AgentRun em andamento.

Post-pinning narrowing/revocation continua nos owners roteados por 3G/3I, sem re-resolution do Project intent.

---

## 14. Failure semantics

3F-04 congela classes semânticas, não literal public stable codes.

```text
PROJECT_BINDING_MUTATION_NOT_ADMITTED
→ Project owner refuses new mutation under current lifecycle/authority

BINDING_SOURCE_NOT_REPRODUCIBLE
→ authored source/provenance cannot deterministically produce exact adopted refs

BINDING_REQUIRED_BUT_ABSENT
→ concrete consumer requires exact binding and none is pinned

BINDING_SCOPE_MISMATCH
→ cross-Workspace / wrong Project-owner relation

BINDING_TARGET_NOT_ADOPTABLE
→ specialized owner refuses exact target for NEW adoption

BINDING_EXPECTATION_STALE
→ expectedCurrentBindingRef != current authority

BINDING_REFERENCE_INVALID
→ exact ref/revision/artifact cannot be safely resolved/interpreted

BRAIN_BINDING_INCOMPATIBLE
→ specialized Brain validation rejects exact Brain + binding-artifact pair at adoption/conformance gate
```

Qualification-not-PASS não é automaticamente mutation failure; pode deixar o intent unreleasable.

Literal codes/per-code details/public mapping continuam later 3F sob 3F-02 laws.

---

## 15. Product experience — regra normativa

A arquitetura deve preservar:

> **arquitetura rigorosa por baixo; experiência simples por cima.**

O usuário não precisa conhecer:

```text
Git
commit SHA
digest
ConnectionRevision
ArtifactRevision
CAS
binding version
SetProjectBinding
ReleaseManifest internals
```

Conceitos legítimos de produto incluem:

```text
Usar esta conexão
Desenvolvimento
Preview
Produção
Testar conexão
Salvar
Atualização disponível
Revisar e atualizar
Parar de usar
Publicar
Histórico
```

### UX-1 — selection-time exact capture

Quando um usuário seleciona um resource na UI e salva:

```text
human-friendly selection
→ authoring layer resolves exact revision at Save
→ canonical source stores deterministic exact refs
→ adoption pins those exact refs
```

Assim a UX pode ser `pick + Save` sem adotar `latest` semantics.

### UX-2 — update available é projection, nunca auto-adoption

`Update available` é informação derivada, por exemplo:

```text
pinned exact ref vs owner current/newer available ref
```

É read-only e não altera authority.

Nova revision só é adotada por ação explícita do usuário/flow autorizado através do mesmo Git-first path.

### UX translation examples

CAS conflict:

```text
"Esta configuração mudou enquanto você editava. Atualize a tela e tente novamente."
```

UNBIND:

```text
"Isso afeta futuras publicações. A versão atualmente publicada não será alterada."
```

Unqualified Connection:

```text
"Você pode salvar esta configuração, mas publicar exigirá um teste de conexão bem-sucedido."
```

Required binding absent:

```text
proactive setup checklist
→ "Conexão de Produção não configurada"
→ [Configurar]
```

Nenhuma simplificação de UX pode bypassar authority, auditabilidade ou fail-closed behavior; nenhuma complexidade interna pode ser imposta ao usuário apenas porque existe na implementação.

---

## 16. Buildability

Os mecanismos retidos são:

```text
symbolic slot → resource indirection
exact revision pinning
immutable owner versions
expected-current CAS
closed typed mutation union
same-Workspace checks
Git source + Hub adoption
Release exact pins
owner-admissibility checks
```

Disposition:

```text
symbolic handle/slot pattern                  PROVEN em referências reais
UI authoring Git behind-the-scenes            PROVEN em produto real observado
immutable revisions + CAS                     PROVEN in-house no MNFS
Brain pair + explicit revalidation             CONVENTIONAL sobre machinery já congelada
owner-admissibility / closed unions            CONVENTIONAL
```

Nenhum mecanismo `UNSUPPORTED`.

Zero probes novos são exigidos por 3F-04. End-to-end binding/Release/runtime proof permanece 3N/3O.

---

## 17. Non-goals / anti-overengineering

3F-04 não autoriza:

```text
GenericBinding / Binding<T>
BindingRepository / BindingService / BindingEngine
BindingSet / bindingSet table / bindingSetDigest
generic {kind,target,payload} mutation
connection-binding Registry artifact
universal slot catalog
operation allowlist duplicada no Project binding
credential/secret copy no binding
health/qualification snapshot no Project
ConnectorDefinition/environment mirrors no Project binding
embedded target Brain digest in brain-binding/v1
mandatory brn.binding_validation ref sem failure class
live inheritance
auto-adoption / latest semantics
implicit Connection fallback/failover
Connection pools/load balancing
dual Git + Hub-only authoring paths
DB-only emergency rebind
break-glass override sem Decision Loop
cross-Workspace bindings
runtime mutable-current binding lookup for PUBLISHED_APP/AGENT_RUN
```

---

## 18. Routed onward

| Item | Later owner |
|---|---|
| binding lifecycle states/status labels | 3G |
| Project lifecycle details affecting mutation | 3G |
| permission/authority enforcement for who may change bindings | 3I |
| authored binding file/schema syntax | later 3F / implementation |
| literal failure codes + per-code details | later 3F |
| per-family Control Plane UI realization | 3K |
| exact validation-evidence ref if 3N proves it necessary | Decision Loop / 3N |
| binding/Release/runtime end-to-end proof | 3N / 3O |
| pools/failover/shared resource extensions | Decision Loop on real consumer |
| break-glass binding/runtime override | Decision Loop on real incident failure class |

---

## 19. Formal approval and advance rule

Operator approval on 2026-08-16 ratifies:

```text
3F-01 = APPROVED
3F-02 = APPROVED
3F-03 = APPROVED
3F-04 = APPROVED

3F — Contracts & API Architecture = IN PROGRESS
3G — NOT STARTED
```

3F remains open. A próxima decisão de 3F deve ser trabalhada com o operador antes de ganhar authority.

Esta decisão não autoriza product implementation, merge, PR readiness ou C-018.
