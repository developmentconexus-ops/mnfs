# 3G-04 — Planning Depth & Rigor Composition Architecture

**Status:** CANDIDATE / AWAITING OPERATOR RATIFICATION / NOT AUTHORITY  
**Fase:** 3G — Behavioral / State Architecture  
**Importante:** este draft consolida o pacote revisado ChatGPT ↔ Fable. Ele não altera `LEDGER.md`, não fecha 3G, não constitui C-018 e não autoriza implementação, merge ou PR readiness até ratificação explícita do operador.

## Decisão em uma frase

No Conexus F1, `PlanningDepth = DIRECT | LIGHT | FULL` e `RigorProfile = FAST | BOUNDED | CONTROLLED` são eixos ortogonais: PlanningDepth governa quanto entendimento/decomposição explícita precisa virar authority antes do dispatch, enquanto RigorProfile governa quanta proteção de execução/evidência/verificação é obrigatória; o checkpoint C-017/3G-02 fixa o piso de PlanningDepth, sinais mecânicos/operador podem apenas elevá-lo, o RigorProfile continua calculado pelo piso máximo já ratificado em C-017, e nenhum grid 3×3, PlanningEngine, risk score por LOC ou classificador LLM autoritativo é criado.

---

## 1. Authority e provenance

Este candidato materializa sem reabrir:

- C-017 — correctness antes da decomposição, checkpoint humano em todo Change, `RigorProfile` calculado, unknown nunca reduz rigor, detector versionado e recálculo em dispatch/closure/Release;
- 3C-05 — Builder owns PlanningDepth/Rigor semantics, sem `RigorModule` de domínio;
- 3D-04 — shared rigor evaluation permanece primitive pura, não módulo;
- 3G-02 — contract/Plan requirement é parte da semantic identity aprovada do Change; checkpoint e dispatch serializam sob a per-Change root;
- 3G-03 — Work Unit/ActorRun dispatch só ocorre quando current authority/gates permitem;
- pacote não-autoritativo `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture.md` + R2;
- Fable Package Review R1 + Final Review R2, que confirmaram orthogonality e exigiram somente ancoragem explícita do PlanningDepth no checkpoint.

Convergência de review:

```text
PlanningDepth × RigorProfile orthogonality = CONFIRMED
3×3 workflow matrix                        = NOT JUSTIFIED
LLM planning classifier as authority       = REJECTED
new module/record/engine                    = NONE
prior reopen                               = NONE
```

---

## 2. Root cause e invariant

O defeito a evitar é colapsar duas perguntas diferentes:

```text
quanto precisamos entender/decompor antes de executar?
!=
quanto controle/prova precisamos durante/depois de executar?
```

Erros rejeitados:

```text
small plan => weak proof
high risk => giant plan
FULL planning => CONTROLLED automaticamente
DIRECT planning => FAST automaticamente
9-cell matrix => workflow taxonomy
agent proposes depth => proposal vira authority
```

Target invariant:

> **Planning depth e rigor podem compartilhar sinais de entrada, mas cada um possui significado, gate e authority próprios; nenhum eixo reduz silenciosamente o outro.**

---

## 3. PlanningDepth

`PlanningDepth` é requisito de planejamento no nível do `Change`, não estado da Work Unit, não score de risco e não FSM.

### 3.1 `DIRECT`

Use quando correctness/contract pode ser fixado e checkpointed de forma suficiente sem um Plan ordenado separado, e uma unidade bounded coerente pode ser admitida diretamente.

```text
approved Change contract/checkpoint
→ bounded Work Unit admission
```

`DIRECT` não significa trivial, low-risk ou FAST.

Exemplo válido:

```text
mudança pequena de permissão já totalmente entendida
→ DIRECT + CONTROLLED
```

### 3.2 `LIGHT`

Exige Plan/decomposição concisa quando dependências, ordering, handoffs ou múltiplas Work Units precisam ser explicitados para evitar ambiguidade, mas arquitetura/authority permanecem dentro das boundaries aprovadas.

Não exige design ceremony completa.

### 3.3 `FULL`

Exige Plan explícito authority-bearing quando a própria decomposição segura depende de resolver materialmente:

```text
architecture / boundary / ownership
competing structural alternatives
material discovery whose result changes the plan
multi-part sequencing where wrong decomposition changes correctness
```

`FULL` não significa automaticamente CONTROLLED.

Exemplo válido:

```text
refactor amplo, read-only/reversible, com decomposição material
→ FULL + BOUNDED
```

### 3.4 O que NÃO seleciona PlanningDepth

Isoladamente, não são laws:

```text
file count
LOC
number of folders
frontend + backend
large token budget
migration keyword when design already fixed
model opinion
```

Podem ser evidência, nunca authority por si.

---

## 4. Authority de seleção e evolução

### 4.1 Checkpoint é a authority

O piso aplicável de PlanningDepth fica fixado no checkpoint humano já obrigatório por C-017/3G-02.

```text
agent/system proposal
→ input para checkpoint

checkpoint approval
→ PlanningDepth floor becomes Change authority
```

O agente nunca é authority do próprio nível de planejamento.

### 4.2 Elevação

System/mechanical signals ou operador podem elevar o piso.

Se a elevação torna um Plan novo/materialmente diferente obrigatório:

```text
semantic contract/plan revision
→ checkpoint necessário
→ dispatch futuro bloqueado até aprovação
```

O runtime não pode fazer downgrade in-place.

### 4.3 Race elevation × dispatch

Nenhum mecanismo novo é necessário:

- mutation de contract/Plan/checkpoint;
- Work Unit/ActorRun dispatch admission;

já serializam sob a per-Change serialization root de 3G-02.

```text
elevation commits first
→ dispatch re-evaluates and blocks pending checkpoint

dispatch commits first
→ in-flight output remains pinned to old exact context;
  superseded-context admissibility rules govern its later admission
```

Não nasce lock global nem Planning lease.

---

## 5. RigorProfile

C-017 permanece authority:

```text
FAST < BOUNDED < CONTROLLED
```

Piso por Work Unit:

```text
max(
  declared effect / authority risk,
  mechanically detected diff/artifact signals,
  target-environment risk
)
```

Unknown nunca reduz rigor.

O evaluator é o primitive puro compartilhado já aprovado; 3G-04 não cria segundo classifier.

### 5.1 `FAST`

Mudança local/reversível sem sinal material que exija BOUNDED/CONTROLLED. Proof continua proporcional e real; FAST nunca significa sem correctness.

### 5.2 `BOUNDED`

Default de engenharia material dentro das boundaries aprovadas, com bounded execution, bundle/handoff, checks e runtime proof quando aplicável.

### 5.3 `CONTROLLED`

Aplica quando signals/authority/effects exigem proteção reforçada, inclusive human gate/conformance/evidence apropriada segundo C-017 e authorities especializadas.

### 5.4 Recálculo

Preserva C-017:

```text
Work Unit / ActorRun dispatch
Change closure
Release composition
```

O maior piso aplicável vence.

A recalculação não reescreve ActorRuns/Evidence históricos. Ela decide admissibility do consumer atual.

---

## 6. Composition law

PlanningDepth controla:

```text
pre-execution understanding
explicit Plan requirement
decomposition/checkpoint material
```

RigorProfile controla:

```text
execution controls
isolation/capability restrictions
evidence strength
verification depth
human/mechanical gates when applicable
```

Dispatch exige ambos:

```text
planning gate passes
AND rigor gate passes
AND remaining 3G-02/03 gates pass
```

Não existe tabela autoritativa de nove células.

---

## 7. Release consumer-time rigor

Na composição, Release recalcula/consome o rigor exigido pela composição exata.

Se:

```text
required rigor at composition
>
proof supporting change_acceptance
```

então:

```text
composition inadmissible
→ directed/on-demand revalidation
→ historical Change/acceptance remain immutable
```

Isso é consumer-time admissibility, não segunda Change authority e não fan-out de STALE.

---

## 8. Product surface

A UX pode mostrar somente o nível de interação necessário:

```text
compact approval
expanded plan/review
additional verification required
```

Usuário não precisa conhecer `DIRECT/LIGHT/FULL` ou `FAST/BOUNDED/CONTROLLED` como vocabulário obrigatório.

---

## 9. Proof obligations

Antes de implementation acceptance, demonstrar pelo menos:

1. `DIRECT + CONTROLLED` funciona sem Plan FULL artificial;
2. `FULL + BOUNDED` funciona sem gates CONTROLLED artificiais;
3. agent proposal não baixa PlanningDepth aprovado;
4. mechanical elevation antes de dispatch bloqueia sob per-Change guard;
5. dispatch anterior à elevação permanece pinado e não ganha authority sob contexto novo automaticamente;
6. risk signal tardio eleva closure rigor e Evidence insuficiente não fecha Change;
7. Release-time rigor maior recusa composição até revalidation;
8. unknown signal nunca produz FAST por conveniência;
9. nenhum controle acima exige 3×3 matrix ou PlanningEngine.

Proof deve mostrar controles firing, não somente happy path.

---

## 10. YAGNI / não construir

```text
PlanningEngine
PlanningStateMachine
RigorModule de domínio
9-cell workflow matrix
LOC/file-count risk score
LLM-only planning/risk classifier autoritativo
persistent mutable current-rigor fan-out
automatic plan simplifier
workflow engine para combinar PlanningDepth×Rigor
```

---

## 11. Later routing

```text
exact signal table/calibration updates   → evidence-based C-017 amendment / implementation calibration
exact UI wording                         → 3K
runtime enforcement mapping              → 3H/implementation
end-to-end proof                         → 3N/3O
```

---

## 12. Reopen triggers

Reabrir somente com evidence material, por exemplo:

1. consumer real prova que os eixos não conseguem decidir independentemente um gate necessário;
2. current risk class não cabe em C-017 `FAST|BOUNDED|CONTROLLED`;
3. late rigor escalation não pode ser tratada por directed revalidation sem duplicar authority;
4. implementation prova que checkpoint + per-Change serialization não consegue impedir dispatch sob PlanningDepth superseded.

Preferência de framework/naming ou future optionality não reabre.

---

## 13. Candidato à ratificação

Se ratificado pelo operador, 3G-04 passa a congelar:

> **PlanningDepth e RigorProfile são eixos ortogonais, ancorados em authorities distintas; checkpoint fixa PlanningDepth, C-017 evaluator fixa rigor, ambos podem ser elevados mas nunca silenciosamente reduzidos, e nenhum workflow matrix/classifier extra é necessário.**
