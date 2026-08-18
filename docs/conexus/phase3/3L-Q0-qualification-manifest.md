# 3L-Q0 — Technology Qualification Manifest

**Status:** APPROVED / Q0 COMPLETE pelo operador em 2026-08-18  
**Fase:** 3L — Technology Qualification  
**Natureza:** probe admission / reproducibility manifest  
**Authority:** 3L routing authority derivada de 3A-R10; não altera domain/system architecture  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** Q0 não executa probe, não autoriza product implementation, não constitui C-018 e não autoriza merge do PR #40.

## Decisão em uma frase

3L abre com uma **qualification stack reproduzível e fail-closed**: cada Package A–E só pode produzir deciding Evidence contra versões/configurações explicitamente pinadas e admitidas; `latest`, alias mutável, transitive dependency não congelada, package acquisition fora de C-016 ou historical probe não compilado contra current authority tornam a prova inadmissível. A execução será serial `A → B → C → D → E`; cada package é adjudicado antes do próximo, e Material Finding reabre somente a menor assumption/realization falsificada.

---

## 1. Q0 outcome

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

Q0 fecha **identidade e admission da prova**, não o resultado das tecnologias.

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

---

## 5. Mastra qualification candidate stack

### 5.1 Direct pins

Current stable candidate set for 3L:

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

Before Package A/B execution, npm acquisition must produce one exact committed/spike-local lock closure. At that point record at least:

```text
resolved e2b SDK version + integrity
all @mastra/* resolved versions + integrity
model/provider SDKs reachable by the selected path
lockfile digest
```

A semver range in an upstream package is **not** deciding identity.

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

The physical E2B SDK remained `2.40.0` across the repin. Package A requalifies changed Mastra surfaces separately from historical provider-live evidence rather than relabeling old evidence as new bytes.

---

## 6. Supply-chain admission is mandatory

Q0 does not install the candidate dependencies. Package acquisition remains subject to C-016 dependency admission, frozen lockfile/integrity and explicit scope.

Known June-2026 Mastra compromised versions are an explicit negative fixture/deny set, including at minimum:

```text
@mastra/core   1.42.1
@mastra/memory 1.20.4
@mastra/e2b    0.3.4
```

Any acquisition that resolves a known malicious release or the `easy-day-js` malicious dependency family is **FAIL / no probe execution**.

A newly published release is never adopted merely because its dist-tag says `latest`. Exact acquisition must satisfy current C-016 supply-chain gates before it becomes an executable probe pin.

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

Package C may only claim invoice-bound spend protection for exact qualified provider/model/request classes under 3I-03.

---

## 8. Model-call interception facts to carry into Package C

Current Mastra source/docs provide two facts worth testing rather than trusting:

1. Agent processor retries are configurable and can be disabled with `maxProcessorRetries = 0`; some error-processor configurations may otherwise enable retry behavior.
2. `processLLMRequest` sees the model request before provider dispatch and is a plausible interception seam, but **plausible != qualified**.

Current Mastra output exposes `usage`, `totalUsage`, `providerMetadata` and response metadata. Missing component token fields can remain `undefined`, while aggregate `totalTokens` may be synthesized from missing components.

Therefore:

```text
framework aggregate totalUsage/totalTokens
→ diagnostics/cross-check only until Package C proves missingness safety

owner downward settlement
→ requires exact qualified usage extraction preserving MISSING != ZERO
```

No model proxy/token broker is authorized by Q0.

---

## 9. Builder Observational Memory candidate

Package A compares:

```text
A0 = persistent Change-scoped thread + OM OFF
A1 = same shape + OM ON
```

For A1, `@mastra/memory 1.25.0` is the current candidate package pin after the approved latest-stable repin.

Current OM surfaces include model-bearing observer/reflector work, persisted observational state and async/buffering controls. Therefore OM cannot be enabled by a pure quality score alone.

A1 must satisfy simultaneously:

```text
net Builder quality/economic gain
3H-01 authority-currentness law
3H-03 Builder/PAR isolation law
3I-03 owner-local model-spend law
restart/resume honesty
```

Verdict remains:

```text
MUST EVALUATE
!= MUST ENABLE
```

---

## 10. E2B qualification identity

Package A must record the exact live E2B facts used for every run:

```text
E2B account/tier facts relevant to limits
region when relevant
template ID + template digest/hash
physical sandboxId
envd/runtime identity when exposed
CPU / memory / disk allocation
network config
allowPublicTraffic
allowOut / denyOut or equivalent policy
timeout / lifecycle config
pause/resume/stop/destroy path
```

E2B account pricing/credit or historical one-hour assumptions are **not architecture** and are re-observed at execution.

No E2B durable credential, model-provider credential, ERP credential, Git write credential or Hub DB credential may enter the guest.

---

## 11. Managed-job candidate pin

Package D starts with:

```text
pg-boss = 12.26.3
```

Reason:

- it remains aligned with the approved Node/Postgres topology;
- supports transactional job creation and queue/schedule mechanics useful to 3A-R9;
- it is the incumbent candidate, not schedule authority;
- Q0 does not chase a just-published package revision merely for recency.

Known deciding hazard preserved:

> native schedule wake/catch-up during downtime is NOT assumed; current upstream discussion demonstrates that missed scheduled execution during service outage is a real failure class.

Therefore Package D must prove the Conexus `one catch-up, not N slots` law using the selected mechanics or add the smallest owner-side reconciliation sufficient to satisfy 3A-R9.

No outbox/dispatcher/workflow framework exists before that proof demands it.

---

## 12. Observability candidate surface

Package E does **not** require a mandatory OTel Collector, OtelBridge, Sentry, Spotlight or E2B OTLP push.

Baseline deciding paths remain:

```text
Hub owner facts
+ Mastra runtime observations
+ E2B provider pull anchored by physical sandboxId
+ app-under-test/browser/backend observation where required
```

OTel is preferred observational plumbing where useful, but exporter/backend versions are pinned only if Package E actually needs them for a criterion.

Missing required evidence:

```text
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

---

## 13. Serial package order — no branch divergence

Although some mechanics could be probed independently, 3L executes one operator-visible line:

```text
Q0 COMPLETE
↓
Package A — Builder Substrate + Cognition
↓
adjudication
↓
Package B — Product Agent + Cross-Runtime
↓
adjudication
↓
Package C — Model Economics / Enforcement
↓
adjudication
↓
Package D — Managed Execution
↓
adjudication
↓
Package E — Deciding Evidence
↓
adjudication + internal completeness/deletion check
↓
ONE final independent Fable review of the complete 3L package
↓
3L closure
```

No Package automatically starts from the success claim of the previous one without its evidence being read/adjudicated.

---

## 14. Package admission record

Before each Package first execution, capture a bounded record with:

```text
Q0 revision / commit
current repo HEAD
exact direct dependency pins
resolved lock digest
external provider/runtime identity
model/provider pins when applicable
current compiled probe criteria
negative fixtures
expected evidence
known UNKNOWN/PARTIAL facts
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

Q0 creates none of:

```text
product implementation
probe harness implementation
new package dependency in the product
TechnologyRegistry domain
provider registry
model router
workflow/scheduler engine
memory service
model proxy/token broker
new domain record/schema/database
Fable review cycle
```

The candidate versions above are **qualification identities**, not permanent product architecture.

---

## 17. Final Q0 outcome

```text
3L-Q0 = APPROVED / COMPLETE
3L = OPEN / IN PROGRESS
current = Package A — Builder Substrate + Cognition / IN PROGRESS / A3 NEXT

Package A executes:
  CX-SBX-E2B-01 compiled against current authority
  CX-BUILDER-MASTRA-01
  CX-BUILDER-COGNITION-01

Package A not executed by Q0 = TRUE
Product code authorization = FALSE
C-018 = NOT YET RATIFIED
PR #40 merge = explicit operator authorization required
```
