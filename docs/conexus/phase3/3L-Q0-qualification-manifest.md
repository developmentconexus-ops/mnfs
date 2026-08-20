# 3L-Q0 — Technology Qualification Manifest

**Status:** APPROVED / Q0 COMPLETE pelo operador em 2026-08-18  
**Fase:** 3L — Technology Qualification  
**Natureza:** probe admission / reproducibility manifest  
**Authority:** 3L routing authority derivada de 3A-R10; não altera domain/system architecture  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** Q0 não executa probe, não autoriza product implementation, não constitui C-018 e não autoriza merge do PR #40.

> **Current amendments — 3L-R1 + 3L-R2:** exact identity/admission and serial adjudication remain current, but unconditional Package execution is superseded. Package B is closed for its tested F1 properties; Package C = `DEFER SAFELY / NO F1 EXECUTION`; Package D = `REDERIVED / DT-1' ROUTE ADMITTED / EXECUTION NOT YET AUTHORIZED`; Package E = `DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE`.

## Decisão em uma frase

3L abre com uma **qualification stack reproduzível e fail-closed**: cada Package admitido só pode produzir deciding Evidence contra versões/configurações explicitamente pinadas; `latest`, alias mutável, transitive dependency não congelada, package acquisition fora de C-016 ou historical probe não compilado contra current authority tornam a prova inadmissível. Serial adjudication permanece; 3L-R1/3L-R2 supersede execução incondicional de packages que não têm questão load-bearing atual e compilam Package D para um único probe de composição.

---

## 1. Q0 outcome

Historical Q0 opening state:

```text
3L                                  = OPEN / IN PROGRESS
Q0 Qualification Manifest           = APPROVED / COMPLETE
Package A                           = IN PROGRESS / A1+A2 ADJUDICATED / A3 NEXT
Packages B–E                        = NOT STARTED
product implementation              = BLOCKED
C-018                               = NOT YET RATIFIED
prior architecture reopen           = NONE
new module / record / DB / workflow = 0
```

Current route is projected by `3L-R1` + `3L-R2`; Q0 itself closes **identidade e admission da prova**, not Package results.

```text
technology selected != technology qualified
package version pinned != package behavior proven
provider docs say capability exists != Conexus control proven to fire
```

---

## 2. Authority compiled before execution

Toda execução 3L usa, nesta ordem:

```text
DevelopmentConexus Engineering Method v1.0.0
→ 3A-R6 critical-path law
→ 3A-R8 Project Baseline/change law when applicable
→ 3A-R9 managed-job law
→ 3A-R10 current realization + historical-probe compilation law
→ current 3L-R1 / 3L-R2 amendment applicable to the Package
→ exact current 3H/3I/3J authority for the property
→ this Q0 manifest
→ Package-specific criteria/evidence
```

Historical mechanism nunca recupera authority por aparecer num antigo checklist.

Examples already compiled by 3A-R10:

```text
Pi functional in CX-SBX-E2B-01
→ current Builder Mastra AgentController/Workspace workload functional in E2B

guest LLM key
→ DELETED by 3I-02; model-spend proof is control-side under 3I-03

hard 45-minute architectural cutoff
→ removed by 3A-R5; measured resource/cost viability survives

Pi-specific C-013 observability adapter
→ current Mastra/E2B/app provenance path under 3H-03
```

---

## 3. Qualification host/toolchain pin

Current repository/toolchain evidence is reused rather than inventing a second build stack.

```text
host class          = Ubuntu WSL2 canonical local host
Node                = 24.18.0 LTS probe pin
package manager     = npm / package-lock lockfileVersion 3
TypeScript          = 5.9.3 when TS harness code is required
repository branch   = agent/conexus-phase-3-system-design
```

Basis:

- repo `package.json` already requires Node `>=24.18.0` and uses npm scripts;
- Node 24 is current LTS at Q0 time and satisfies current Mastra/E2B/pg-boss engine floors;
- existing repo lockfile is npm lockfile v3;
- current repo TypeScript pin is 5.9.3.

A later Realization Plan may select a newer supported patch/minor after qualification. Q0 evidence remains bound to the versions above unless the package record explicitly changes before execution and the affected criteria are requalified.

---

## 4. PostgreSQL probe pin

Architecture remains:

```text
PostgreSQL major = 17
```

Current official PostgreSQL release evidence at Q0 lists:

```text
PostgreSQL = 17.10
```

Therefore substrate probes requiring PostgreSQL use **17.10** unless a Package explicitly proves another exact 17.x minor is necessary before execution.

```text
PG18 merely newer → NOT a qualification reason
```

`DT-1'` retains PostgreSQL `17.10` as its deciding database pin and must record the physical image/runtime identity actually executed, not only a mutable image tag.

---

## 5. Mastra qualification candidate stack

### 5.1 Direct pins

Current stable candidate set for executed Package-A/B evidence remains:

```text
@mastra/code-sdk = 1.1.2   # A3 native Codex OAuth surface
@mastra/core     = 1.56.0
@mastra/memory   = 1.25.0   # Package A OM candidate path only
@mastra/pg       = 1.19.0
@mastra/e2b      = 0.8.0
```

Source-level compatibility facts checked at Q0:

```text
@mastra/core 1.56.0
→ exports ./agent-controller and ./coding-agent

@mastra/memory 1.25.0
→ peer @mastra/core >=1.4.1-0 <2.0.0-0
→ Node >=22.13.0

@mastra/pg 1.19.0
→ peer @mastra/core >=1.53.0-0 <2.0.0-0
→ Node >=22.13.0

@mastra/e2b 0.8.0
→ peer @mastra/core >=1.55.0-0 <2.0.0-0
→ depends on e2b ^2.29.1
→ Node >=22.13.0
→ 0.8.0 changes the stale peer floor + Code Mode tool-name reuse, not the qualified lifecycle/network contract

@mastra/code-sdk 1.1.2
→ same stable release family as core 1.56.0
→ exposes native openai-codex device OAuth/AuthStorage/provider surfaces used by A3
```

The Package A candidate family was explicitly repinned before A3 live execution to the current mutually compatible **stable** Mastra release family above. This is not a follow-`latest` policy: alpha/prerelease builds remain excluded, exact versions are frozen in the package lock, and any later version drift must rerun only criteria whose behavior may have changed.

### 5.2 Transitive lock closure

Before any Package dependency acquisition, npm must produce one exact spike-local lock closure and record the directly relevant transitive identities/integrities.

Current Package A latest-stable closure after approved repin:

```text
@mastra/code-sdk = 1.1.2
@mastra/core     = 1.56.0
@mastra/e2b      = 0.8.0
@mastra/memory   = 1.25.0
@mastra/pg       = 1.19.0
e2b SDK          = 2.40.0
package-lock SHA-256 = 7f61c6c74ad92b23abd0fb44353bc63f444ab01dd3b62d23cec7d7de4b1051d5
```

Exact Package-B lock used by current source adjudication:

```text
@mastra/core   = 1.56.0
@mastra/memory = 1.25.0
@mastra/pg     = 1.19.0
package-lock SHA-256 = 5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
@mastra/observability = ABSENT
```

3L-R2 therefore names `@mastra/observability` as a future realization dependency only: VERSION UNPINNED / C-016 admission NOT PERFORMED / no Package-E acquisition before a real first-build consumer.

---

## 6. Supply-chain admission is mandatory

Q0 does not authorize installation of candidate dependencies. Package acquisition remains subject to C-016 dependency admission, frozen lockfile/integrity and explicit scope.

Known June-2026 Mastra compromised versions are an explicit negative fixture/deny set, including at minimum:

```text
@mastra/core   1.42.1
@mastra/memory 1.20.4
@mastra/e2b    0.3.4
```

Any acquisition that resolves a known malicious release or the `easy-day-js` malicious dependency family is **FAIL / no probe execution**.

A newly published release is never adopted merely because its dist-tag says `latest`. Exact acquisition must satisfy current C-016 supply-chain gates before it becomes an executable probe pin.

For Package D this rule applies to the exact `pg-boss 12.26.3` + direct probe `pg 8.22.0` lock closure before `DT-1'` executes. For Package E, no `@mastra/observability` acquisition is authorized by 3L-R2.

---

## 7. Model/provider pin law

Q0 intentionally does **not** choose a permanent Builder/Product model winner. Model quality and cost are part of Package A/C evidence.

Before any billable probe call, the Package record MUST freeze:

```text
provider
immutable/exact model identifier
requested model identifier
resolved/returned model identity when observable
model parameters / reasoning controls
provider SDK/adapter path
pricing profile revision/ref
finite request-envelope assumptions
```

Forbidden deciding identity:

```text
latest
floating alias without resolved identity evidence
provider default model
```

Package C is currently `DEFER SAFELY / NO F1 EXECUTION` under 3L-R1. `DT-1'` has zero model/provider calls.

---

## 8. Model-call interception facts carried forward

Current Mastra source/docs provide two historical facts retained for downstream realization when the relevant model-spend trigger returns:

1. Agent processor retries are configurable and can be disabled with `maxProcessorRetries = 0`; some error-processor configurations may otherwise enable retry behavior.
2. `processLLMRequest` sees the model request before provider dispatch and is a plausible interception seam, but **plausible != qualified**.

Current Mastra output exposes `usage`, `totalUsage`, `providerMetadata` and response metadata. Missing component token fields can remain `undefined`, while aggregate `totalTokens` may be synthesized from missing components.

No model proxy/token broker is authorized by Q0 or 3L-R1.

---

## 9. Builder Observational Memory candidate

Package A already evaluated:

```text
A0 = persistent Change-scoped thread + OM OFF
A1 = same shape + OM ON
```

Current adjudicated result:

```text
CX-BUILDER-COGNITION-01 = EVALUATED / NOT_PROVEN FOR ENABLEMENT / KEEP OM OFF
```

No Package-D/E routing reopens that result.

---

## 10. E2B qualification identity

Package-A E2B deciding evidence remains bound to its recorded exact live identities. No E2B durable credential, model-provider credential, ERP credential, Git write credential or Hub DB credential may enter the guest.

`DT-1'` uses no E2B; its Evidence must assert `e2bCalls = 0`.

---

## 11. Managed-job candidate pin — amended by 3L-R2

Package D candidate remains:

```text
pg-boss = 12.26.3
PostgreSQL = 17.10
Node = 24.18.0
```

`3L-R2` compiles the load-bearing question to:

```text
DT-1' — Transactional Managed-Occurrence Admission
```

Current candidate placement/configuration:

```text
pg-boss database = hub_control scratch equivalent in probe
pg-boss schema   = existing mar owner schema
createSchema     = false
migrate          = false
schedule         = false
retryLimit       = 0
```

Package D no longer probes or adopts native cron catch-up, delayed future occurrences or rolling future JobRuns. Recurrence is owner-side freshness reconciliation; the probe is limited to owner+queue same-transaction composition, rollback, fresh-process rediscovery, concurrency and queue-not-authority controls.

Exact `DT-1'` dependency acquisition/execution remains blocked until explicit operator execution authorization after review of the derived Codex plan.

No outbox/dispatcher/workflow/scheduler framework exists before evidence demands it.

---

## 12. Observability candidate surface — amended by 3L-R2

Package E remains:

```text
DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE
```

Baseline deciding paths remain:

```text
Hub owner facts
+ Mastra runtime observations
+ E2B provider pull anchored by physical sandboxId
+ app-under-test/browser/backend observation where required
```

Exact Package-B source/lock now establishes:

```text
@mastra/core 1.56.0
→ public observability contracts/types + NoOp path
→ concrete full observability implementation NOT present in core lock

@mastra/observability
→ named later realization dependency
→ unpinned/unadmitted until first real acquisition under C-016/Q0
```

A future Conexus exporter uses the public Mastra observability seam and server-side trust/correlation binding. `MastraStorageExporter` is not a Conexus OBS read path. Missing required evidence remains:

```text
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

No mandatory OTel Collector, OtelBridge, Sentry, Spotlight or E2B OTLP push is created by 3L-R2.

---

## 13. Serial adjudication — current route after 3L-R1 + 3L-R2

3L keeps one operator-visible adjudication line, but a deferred package is not executed for sequence ceremony:

```text
Q0 COMPLETE
↓
Package A — COMPLETE
↓
Package B — CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
↓
Package C — DEFER SAFELY / NO F1 EXECUTION
↓
Package D — REDERIVED / DT-1' ROUTE ADMITTED
  ↓
  review exact Codex execution plan
  ↓
  explicit operator execution authorization REQUIRED
  ↓
  DT-1' execution
  ↓
  Architecture-Lead evidence adjudication
↓
Package E — DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE
↓
3L completeness/deletion check and any final independent review required by current router
↓
3L closure
```

No Package automatically starts from the success claim of the previous one without its evidence/route being read and adjudicated. `DT-1' ROUTE ADMITTED` is not execution authorization.

---

## 14. Package admission record

Before Package-D first execution, capture a bounded record with:

```text
Q0 revision / commit
3L-R2 revision / commit
current repo HEAD
exact pg-boss / pg direct dependency pins
resolved transitive lock digest/integrities
PostgreSQL 17.10 physical runtime/image identity
current compiled DT-1' criteria
negative fixtures R1..R3
expected Evidence P1..P6
known UNKNOWN/PARTIAL facts
explicit zero external-effect surface
```

If any listed identity drifts mid-package:

```text
stop
→ evidence remains bound to old identity
→ repin explicitly
→ rerun only affected criteria
```

Never reinterpret old evidence as proving new bytes.

---

## 15. Stop/reopen law

For every failed criterion:

```text
config/API-local defect
→ bounded correction + reprobe

provider/substrate limitation behind existing seam
→ smallest adapter/guard/challenger qualification

material architecture contradiction
→ Finding + reopen exact implicated authority only

missing/ambiguous evidence
→ NOT_PROVEN
```

Framework preference, new release availability or benchmark curiosity is not a reopen trigger.

---

## 16. Q0 non-goals

Q0 and its current amendments create none of:

```text
product implementation
Product MAR implementation
new Product package dependency merely because a probe uses it
TechnologyRegistry domain
provider registry
model router
workflow/scheduler engine
memory service
model proxy/token broker
new domain record/schema/database
outbox/dispatcher
observability backend
```

Candidate versions are **qualification identities**, not permanent Product architecture.

---

## 17. Current Q0 projection

```text
3L-Q0 = APPROVED / COMPLETE
3L = IN PROGRESS
3L-R1 = APPROVED / CURRENT
3L-R2 = APPROVED / CURRENT / OPERATOR RATIFIED 2026-08-20

Package A = COMPLETE
Package B = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
Package C = DEFER SAFELY / NO F1 EXECUTION
Package D = REDERIVED / DT-1' ROUTE ADMITTED / EXECUTION NOT YET AUTHORIZED
Package E = DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE

Product code authorization = FALSE
C-018 = NOT YET RATIFIED
PR #40 merge = explicit operator authorization required
```

Exact next gate:

> Review the filed Codex `DT-1'` implementation plan against 3L-R2. Only a new explicit operator authorization may begin Package-D dependency acquisition and probe execution.
