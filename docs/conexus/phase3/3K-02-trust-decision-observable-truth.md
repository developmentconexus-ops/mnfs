# 3K-02 — Trust, Decision & Observable Truth

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3K — Frontend / Product Architecture  
**Authority:** segunda decisão aprovada de 3K  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra 3K nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, **truth aparece no contexto onde ela importa e Evidence permite aprofundar**: a UI simplifica apresentação, nunca significado; estados, decisões e prova permanecem owner-derived e semanticamente separados; observação nunca é promovida visualmente a verificação; `UNKNOWN`, `PARTIAL`, `BLOCKED`, missingness e limitações conhecidas permanecem explícitos; approvals apresentam o subject exato que será autorizado; e o produto só declara sucesso, live ou served quando a authority correspondente realmente estabeleceu esse fato.

---

## 1. Authority, evidência e relação com 3K-01

Esta decisão compõe, sem reabrir, pelo menos:

- [3K-01](3K-01-product-model-project-shell-build-workspace-inspectability.md) — `agent-first + simple by default + inspectable by design`; Project shell, Build workspace e superfícies inspecionáveis;
- C-012 — Honest UI / `RequestState<T> × DataMeta`, empty-state honesty e frontend contracts;
- C-013 — observabilidade, producer trust, custo multi-estado, checklist Hub-owned, completion ladder e Run Timeline;
- C-014 — Release / Promotion / rollback;
- C-015 — access, role/capability truth e permission diff;
- C-016 — dependency diff, external traffic truth e sanitização;
- C-017 — Change checkpoint, assertions, Evidence, Finding, verifier e proportionality;
- 3F-03 — exact ApprovalRequest subject / mechanical presentation;
- 3F-05 — public failure behavior;
- 3G-R1 — owner-local state spaces and forbidden semantic collapse;
- 3G-05 — AgentRun versus effect outcome;
- 3I-01 — current authorization / access mutation;
- 3I-03 — model-spend truth.

Referências Mitra, Factory e candidate/dialogue 3K anteriores foram usadas como evidence/review input, nunca authority. O operador decidiu que o independent adversarial reviewer externo retorna somente no fechamento global de 3K; esta decisão foi deliberada entre operador + ChatGPT e será atacada novamente no closure de 3K.

---

## 2. Root cause

Sem uma lei de apresentação de truth, implementation poderia criar falso verde mesmo preservando toda a authority correta no backend.

Falhas possíveis:

```text
agent says done              → UI says done
provider emitted event       → UI says verified
Release AVAILABLE            → UI says live
pointer swapped              → UI says served
no Finding                   → UI says verified
missing usage                → UI says $0
SENT_NO_RESPONSE             → UI blames external actor
AgentRun COMPLETED           → UI implies all effects succeeded
empty request failure        → UI says no data
partial source coverage      → UI presents total-like number
```

Esses são defeitos de produto, não novos problemas de state architecture. 3K deve impedir a camada de apresentação de apagar distinções que 3F–3I já pagaram para preservar.

---

## 3. Global Maximum — context-local truth + progressive Evidence

Foram consideradas três famílias:

### A — status simplificado universal

Um `green/yellow/red`, `healthy`, `done` ou score universal para tudo.

**REJECT.** É simples, mas colapsa state spaces owner-local e recria falso verde.

### B — Trust / Governance / Approval Center como superfície principal

Centraliza Change approval, effect approval, Publish, access, Evidence e diagnostics.

**REJECT F1.** Mistura quatro famílias de decisão com owners diferentes, cria navegação burocrática e tende a exigir taxonomia universal sem failure class atual.

### C — truth local + Evidence progressivamente inspecionável

**APPROVED / GLOBAL MAXIMUM.**

```text
normal surface
→ truthful bounded summary
→ explanation
→ Evidence / assertions / provenance / receipts
→ technical diagnostics when materially useful
```

Isto compõe diretamente com 3K-01: simple by default, inspectable by design.

Nenhum novo module, durable record, truth store, status FSM, governance service ou approval engine nasce por 3K-02.

---

## 4. Root invariant — UI projects authority; it never becomes authority

```text
owner facts
→ authorized product projection
→ UI

model narration / client cache / visual state / telemetry alone
-X-> domain authority
-X-> security authority
-X-> verification authority
```

A UI pode resumir e traduzir owner vocabulary para linguagem de produto, mas não pode criar uma equivalência que o owner não estabelece.

Um shared visual grammar é permitido e desejável; shared semantic state não é.

---

## 5. Truth depth — presentation, not a new domain model

Quando materialmente útil, uma mesma verdade pode ser apresentada em profundidades crescentes:

```text
1. SUMMARY
   “7/7 criteria verified”

2. EXPLANATION
   quais critérios, quais pendências, que limitation existe

3. PROOF
   assertions, verdicts, source, environment, coverage, receipts, provenance

4. DIAGNOSTIC DETAIL
   run/timeline/correlation/digests/provider/runtime observation
```

Isto não é FSM, storage model ou taxonomia normativa. É apenas uma regra de product architecture: simplificação não pode bloquear acesso à prova relevante.

Detalhes de drawer/modal/route/component pertencem ao post-C-018 Realization Planning.

---

## 6. Build — progress and verification truth

Build apresenta progresso na linguagem da tarefa/Change, não na linguagem obrigatória de `WorkUnit`/`ActorRun`.

Exemplo conceitual:

```text
Construindo análise por vendedor

✓ regra de orçamento confirmada
✓ dados reais validados
→ interface em construção
○ verificação final
```

Mas:

```text
worker/model says “done”
!= Hub-owned progress completed
```

A checklist normal projeta C-013/C-017 owner state; o modelo pode narrar, nunca fechar autoridade.

Quando a execução é complexa ou falha, o operador pode atravessar para Work Unit / ActorRun / Evidence / Finding / timeline sem esses conceitos comandarem o Golden Path.

### Verification presentation

A superfície deve permitir responder:

```text
what had to be proven?
what is proven?
what failed?
what is BLOCKED?
what is UNVERIFIED?
what Evidence supports each verdict?
```

`UNVERIFIED` em MUST assertion nunca recebe success treatment.

`validator_report != hub_verified_evidence` continua explícito; nenhum parecer de LLM vira prova apenas por apresentação.

---

## 7. No Finding is not proof

Finding e verification não são inversos.

```text
0 Findings
!= verified
```

A apresentação positiva de verificação depende da cobertura assertion→verdict→Evidence exigida por C-017.

Finding surfaces podem resumir:

```text
problem
scope/assertions affected
severity/impact
Evidence
current route
owner status
```

O frontend não cria um segundo Finding lifecycle.

---

## 8. Preview truth

`Preview ready` significa que existe Preview admissível para inspeção; não significa verificado, publicado ou live.

```text
Preview ready
!= VERIFIED
!= Release AVAILABLE
!= DEPLOYED
!= SERVED_VERIFIED
```

A Preview surface pode expor, quando útil:

```text
candidate identity / version
verification coverage
known limitations
staleness or blocker state
```

O último Preview útil pode permanecer observável enquanto novo candidate é construído conforme 3K-01; isso não autoriza rotular o candidate em construção como ready.

---

## 9. Delivery and production truth

A escada C-013 permanece exact authority:

```text
WORK_COMPLETED
→ RESULT_PERSISTED
→ VERIFIED
→ DEPLOYED
→ SERVED_VERIFIED
```

Produto só recebe semântica `Live` / `Served` quando a authority aplicável atingiu `SERVED_VERIFIED`.

Explicitamente proibido:

```text
HTTP 200                 → Live
build completed          → Live
Release AVAILABLE        → Live
Promotion approved       → Live
pointer swapped          → Live
model says deployed      → Live
```

Durante Publish, progresso pode mostrar fases distintas e honestas. Após pointer swap, UI permanece em verificação do serving real até `SERVED_VERIFIED`.

---

## 10. Data truth — source, environment, freshness and coverage

Quando um número/dataset depende de contexto que muda interpretação, a superfície preserva as dimensões materiais disponibilizadas pela authority, incluindo conforme aplicável:

```text
source
PREVIEW / PROD environment
sourceAsOf / retrievedAt / freshness
coverage
partiality
provenance
```

A apresentação nunca transforma “o que carregamos” em “o total que existe” sem Evidence que sustente essa semântica.

Exemplo:

```text
187 resultados
Coverage: 3 / 13 empresas
→ PARTIAL
```

não pode ser apresentado como total global sem qualificação.

Essa lei não cria novo metadata model; usa C-012/C-013/DataMeta e owner facts existentes.

---

## 11. Honest request state

As seguintes situações são user-observably distintas:

```text
loading / unresolved
successful empty
failed
partial
```

Um empty business state só é permitido quando owner-derived success estabelece positivamente que o conjunto é vazio.

```text
failed request
-X-> “no data”

unresolved request
-X-> “0 results”

partial result
-X-> complete-looking empty/success
```

Onde owner fornece reason/coverage, a superfície preserva isso.

---

## 12. Capability truth

Capabilities podem projetar truth relevante sem criar lifecycle próprio de frontend.

Conforme aplicável, operador pode compreender:

```text
capability type
source / binding
where used
verification state
last verification/proof context
limitations/blockers
```

`Verified` só é mostrado quando authority-grade Evidence sustenta o claim.

Qualquer stale condition que torne a verificação anterior materialmente inadequada deve ser projetada a partir da owner authority pertinente; 3K não inventa um generic stale engine.

---

## 13. Connection / Integration truth

A UI não reduz Connection a um único badge `Connected`.

Distinções owner-derived permanecem separadas quando materiais:

```text
configured
qualified
bound
healthy
currently authorized/admissible
```

Em especial:

```text
qualified != bound != healthy != authorized
```

Project → Integrations pode apresentar a binding Project-scoped e apontar para a Workspace Connection owner, conforme 3K-01, sem duplicar authority.

### External traffic truth

C-016 permanece exact semantic floor:

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

Produto pode traduzir para linguagem amigável, mas não pode atribuir falha ao ator externo sem `RESPONSE_RECEIVED` que sustente essa atribuição.

Exemplos conceituais:

```text
NOT_SENT
→ operação não saiu do Conexus

SENT_NO_RESPONSE
→ envio ocorreu; resposta/resultado não confirmado

RESPONSE_RECEIVED
→ ator externo respondeu; detalhes sanitizados podem ser mostrados
```

---

## 14. Outcome uncertainty and partial effects

`PARTIAL` e `OUTCOME_UNKNOWN` são first-class presentation truths quando a authority aplicável os produz.

```text
OUTCOME_UNKNOWN
-X-> failed
-X-> succeeded
-X-> safe to retry
```

Não existe generic retry affordance que torne ambiguidade invisível.

Multi-unit effect com partial outcome deve preservar breakdown material entre succeeded / rejected / unprocessed / unknown conforme owner evidence; um único label genérico não pode esconder unidade ambígua.

---

## 15. Product Agent truth

`AgentRun COMPLETED` significa terminal do AgentRun conforme sua authority; não significa que todo external effect proposto pelo run foi bem-sucedido.

```text
AgentRun COMPLETED
!= all effects SUCCEEDED
```

Quando material ao usuário, o resultado do run e o outcome de seus effects são apresentados separadamente.

Exemplo conceitual:

```text
Run completed
12 opportunities found

External actions
2 succeeded
1 not executed
1 outcome unknown
```

A conversa pode resumir, mas não apagar effect truth.

---

## 16. Four human decision families remain separate

O produto usa linguagem visual coerente, mas não cria `UniversalApproval`.

### D1 — Change checkpoint

Surface: Build.

Todo Change recebe checkpoint humano conforme C-017. Proporcionalidade altera profundidade, não existência.

A pessoa entende, conforme materialidade:

```text
intent / business outcome
what Conexus understood
assertions / correctness contract
known assumptions and unknowns
required discovery/access facts
plan when applicable
material risk/effect signals
```

Approval binds owner-controlled current contract/plan identity, nunca mera paráfrase do modelo.

### D2 — exact effect ApprovalRequest

Surface: active Agent/product context; quando não há conversa interativa, owner-derived pending decision pode ser alcançada pelo contexto operacional Project/AgentRun apropriado.

A surface deriva mecanicamente do exact sealed ApprovalRequest conforme 3F-03.

Quando aplicável, apresenta antes de decisão:

```text
effect family/type
target / Connection / external actor
exact unit count + identities
final material content/value
Project/business scope
expiry
```

Large sets: deterministic bounded preview + exact count + full authoritative set acessível antes da decisão.

Modelo pode explicar; conversa nunca é o approval subject.

### D3 — Publish / rollback gate

Surface: Versions / Publish + top-level Publish action conforme 3K-01.

Um único gate humano compõe facts existentes:

```text
candidate version
current active version
target environment
verification/assertion coverage
permission widening evidence
dependency widening evidence
binding/config blockers
migration/maintenance implications
known limitations
rollback eligibility + data caveat
```

Permission/dependency widening nunca fica escondido em “advanced details”.

Rollback preserva a verdade:

```text
re-point previous eligible composition
!= restore data
```

### D4 — access mutation

Surface: Project/Workspace Settings / Access conforme owner e contexto.

Security-sensitive mutation mostra pre-state + proposed state; proposed new authority nunca autoriza a própria mutação.

No F1 não nasce generic policy editor nem four-eyes workflow.

---

## 17. No global Approval Center in F1

```text
Change approval        → Build
Effect approval        → active Agent / applicable Project operational context
Publish approval       → Versions / Publish
Access mutation        → Settings / Access
```

Uma future cross-Project pending-decision inbox só retorna quando houver workload real que a justifique; se criada, permanece aggregate projection, nunca authority.

---

## 18. Known limitations

Toda delivery/verification context material deve permitir ao operador conhecer limitações registradas.

Se não houver limitation registrada, a UI pode dizer de forma semanticamente honesta que nenhuma limitação conhecida está registrada; não pode afirmar que “não existem limitações”.

Known limitations nunca são escondidas quando alteram decisão de Build/Publish/use.

---

## 19. Evidence provenance

Friendly labels são permitidas, mas classes de confiança não podem ser achatadas.

Conceitualmente:

```text
owner-authoritative / verified by Conexus
runtime/provider observation
external response observed
not verified / unavailable
```

`PROVIDER_OBSERVED` / `GUEST_OBSERVED` nunca recebem tratamento equivalente a Hub/Gateway authoritative Evidence.

Transport não promove trust.

---

## 20. Knowledge/content provenance

Quando a origem muda confiança ou decisão, o produto preserva a distinção:

```text
platform-published Conexus knowledge
!= Workspace Brain / tenant knowledge
!= user/project-authored content
```

3K-01 define onde esses recursos/contextos aparecem; 3K-02 garante que apresentação não apague a provenance material.

Não é necessário expor artifact kind/digest em toda frase; detalhe deve ser auditável quando material.

---

## 21. Cost and spend truth

UI pode mostrar custo de forma compacta, inclusive tokens + USD + duration, mas preserva missingness e proveniência.

C-013 e 3I-03 continuam owners das semantics.

Os eixos permanecem independentes:

```text
usage_state
× calculation_state
× reconciliation_state
```

Portanto:

```text
missing usage != 0 tokens
missing price != $0
conservative reserved liability != exact actual cost
provider-reported != calculated != reconciled
```

Se custo exato não estiver disponível, produto mostra unavailable/estimate/reserved conforme owner facts; nunca `$0.00` por ausência de informação.

Aggregates são informação, não budget authority.

---

## 22. Activity and diagnostics

`Activity` de 3K-01 é a história causal user-facing do Project, não apenas raw logs.

Exemplo conceitual:

```text
Version served and verified
Promotion pointer changed
Publish approved
Assertions verified
Builder Change completed
```

Cada item pode aprofundar até Evidence/technical timeline quando autorizado.

Build acompanha trabalho durante execução; Activity permite investigar histórico após o fato.

C-013 Run Timeline continua a deep causal diagnostic source; 3K não cria segunda telemetry store.

---

## 23. Never-hide contract

Progressive disclosure nunca pode esconder, quando material à ação/decisão:

```text
exact authority-bearing decision subject
exact current scope/context
authorization / permission widening
dependency widening
PARTIAL
OUTCOME_UNKNOWN
attempted vs admitted vs sent vs response received distinctions
unknown != zero
verified vs observed provenance
platform vs tenant/user knowledge provenance
SERVED_VERIFIED distinction
maintenance/degradation affecting availability
known limitations
access pre-state → proposed state
rollback schema/data caveat
```

Se archive/trigger controls entrarem no first vertical por 3K Package C, também deve permanecer explícito:

```text
ARCHIVE != unpublish != stop serving != disable trigger
```

---

## 24. Explicit REJECT F1

```text
UniversalStatus / frontend-owned truth FSM
Trust Score / confidence score aggregating unrelated facts
opaque “ready for production” score
Trust Center / Governance Center as F1 primary product model
global Approval Center without cross-Project consumer
UniversalApproval / UniversalDecision record
generic policy editor / four-eyes workflow
UI-only authorization enforcement
Release AVAILABLE styled as live
pointer swap styled as served
AgentRun COMPLETED styled as effect success
no Finding styled as verified
missing cost styled as zero
SENT_NO_RESPONSE styled as external rejection
Provider/Guest observation styled as authoritative Evidence
partial/unknown hidden by generic success/failure
generic retry button over OUTCOME_UNKNOWN
capability-local degradation styled as whole-platform failure
```

---

## 25. DEFER SAFELY

```text
pixel-level visual treatment / colors / icons / exact copy
specific component composition (drawer/modal/toast/card)
exact placement of Evidence links
complete telemetry explorer
log export/filtering beyond current F1 trust need
global notification center
cross-Project approval inbox
billing/invoice/reconciliation product
fleet governance dashboard
rich incident console
external alerting
raw architecture dashboards
user-editable rigor
exact HTTP/WebSocket/SSE/event realization
exact frontend cache/query/store realization
```

Re-entry exige named consumer/failure class ou post-C-018 derived Realization Planning conforme propriedade.

---

## 26. Proof / falsification

3K-02 é falsificada se o produto não puder satisfazer qualquer uma das propriedades abaixo sem nova authority:

1. Agent diz “done” mas UI mantém verification pendente até Hub owner truth;
2. Preview pode estar ready sem ser mostrado como verified/live;
3. Release AVAILABLE e pointer swap não podem virar `Live` antes de SERVED_VERIFIED;
4. MUST UNVERIFIED não recebe green/success treatment;
5. `no Finding` não fecha verification;
6. failed/unresolved request não aparece como empty business state;
7. partial source coverage não aparece como complete total;
8. provider/runtime observation não aparece como owner-verified Evidence;
9. missing usage/cost nunca vira zero;
10. SENT_NO_RESPONSE não culpa external actor;
11. OUTCOME_UNKNOWN não implica safe retry;
12. AgentRun COMPLETED não implica all effects succeeded;
13. effect approval não pode mudar target/content depois da human view sem novo ApprovalRequest;
14. permission/dependency widening não pode ficar escondido no Publish gate;
15. access mutation mostra exact pre-state + proposed context;
16. rollback deixa claro que re-point não restaura dados;
17. operator consegue atravessar summary → Evidence → diagnostic detail sem novo truth owner/store;
18. reload/reconstruction da UI não exige frontend-owned durable status authority.

Falha material que exija novo domain/security owner ou reopening de prior authority retorna ao applicable Decision Loop; problema apenas de realization permanece post-C-018 Realization Planning.

---

## 27. Reopen triggers

Reabrir esta decisão apenas por evidence material, como:

- cross-Project workload real que justifique aggregate pending decisions;
- real 2-of-N/four-eyes workflow requirement;
- novo user audience/role model que não caiba nas surfaces atuais;
- public/embed/third-party context que mude trust presentation;
- volume real que torne current Activity/Run Timeline impraticável;
- billing/quota consumer real;
- notification consumer real fora do active context;
- nova owner authority com decision/status family material ainda não representável;
- Evidence proving users cannot make safe decisions with current progressive-disclosure boundary.

---

## 28. Boundary para Package C

3K-02 não decide qual vertical concreta exige cada superfície opcional.

Package C deve provar o first vertical real e decidir, sob consumer evidence:

```text
live Gateway read vs mirror/sync
job/v1 trigger if mirror/sync is required
which Data/Capability/Integration surfaces are exercised
whether Product Agent use/effect approval is exercised
whether archive/unpublish/trigger-disable has a real F1 consumer
which Connection environments/qualification journey is needed
benchmark comparability vs Mitra
no invented WRITE/effect merely to exercise architecture
```

3K-02 apenas obriga a apresentação honesta caso esses consumers existam.

---

## Decisão final aprovada

> **O Conexus F1 usa context-local truth + progressive Evidence como product law. UI é projeção, nunca segunda authority; owner-local states permanecem distintos; observação não vira verificação; unknown/partial/blocked/missing continuam visíveis; approvals mostram exact authority-bearing subject; Build/Preview/Data/Capabilities/Integrations/Agents/Versions/Activity apresentam somente claims sustentados por seus owners; Publish só chega a Live em SERVED_VERIFIED; e qualquer complexidade técnica pode ser aprofundada sem transformar Trust Center, universal status, approval engine ou telemetry store em novos conceitos de domínio.**
