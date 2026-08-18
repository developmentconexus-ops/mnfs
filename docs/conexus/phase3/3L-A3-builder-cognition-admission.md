# 3L-A3 — Builder Cognition / Observational Memory Admission

**Status:** ADMITTED / NO BILLABLE CALLS EXECUTED / AWAITING DEDICATED MODEL CREDENTIAL  
**Fase:** 3L — Technology Qualification  
**Package:** A — Builder Substrate + Cognition  
**Track:** A3 — CX-BUILDER-COGNITION-01  
**Authority:** 3L-A + 3L-Q0 + 3A-R10 + current 3H-01 / 3H-03 / 3I-03 authority  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Natureza:** execution-admission/evidence record only; this file does not enable OM, does not implement product code, does not constitute C-018 and does not authorize merge of PR #40.

## 1. Decision in one sentence

A3 may execute one small paired experiment against the current Mastra Builder realization to answer whether Observational Memory provides material Builder cognition/effectiveness benefit, but a positive quality result is **not sufficient to enable OM**: the pinned `@mastra/memory 1.24.0` contains hidden Observer/Reflector retry behavior that must later pass Package C owner-local spend/admission qualification or OM remains OFF.

---

## 2. Exact execution identity

A1/A2 evidence remains bound to its previous lock. A3 uses a new explicit lock closure and does not reinterpret prior evidence against new bytes.

```text
A1/A2 deciding authority commit      = e2c245809ccc55e7437a61fe6438d58e6bce8791
A3 adapter-pin commit                = 8fe34aaca753574f8873587822307bec1852727f
A3 lock materialization commit       = f86f7bddab7640192538b97008a7a4f3ba194fbf
A3 package-lock SHA-256              = 70975a4b3aadc453959bd36835c1c4ad3edc320c862a9ebfb6ace7feb4fd1864
Node                                = 24.18.0
npm lockfileVersion                  = 3
@mastra/core                        = 1.55.0
@mastra/memory                      = 1.24.0
@mastra/pg                          = 1.18.1
@mastra/e2b                         = 0.7.0
e2b SDK                             = 2.40.0
@openrouter/ai-sdk-provider-v6      = npm:@openrouter/ai-sdk-provider@2.10.0
OpenRouter adapter integrity        = sha512-FMsAEjLUt5pWuRE2LDC/LCvVrFjLlrEzUITH5+5SZtfq7KZ2wrOHjQVxzz92sju8S9ltpzW87CLW8/b0oBXVCw==
supply-chain deny-set               = PASS
package lifecycle scripts at lock   = DISABLED
```

Any drift in the above identity before execution stops A3, preserves old evidence as old evidence, and requires an explicit repin/requalification of affected criteria.

---

## 3. Model/provider pins

### 3.1 Builder Actor

```text
Mastra model ID                     = openrouter/anthropic/claude-sonnet-5
OpenRouter model slug               = anthropic/claude-sonnet-5
upstream model ID                   = claude-sonnet-5
provider route                      = Anthropic only
provider fallback                   = DISABLED
provider parameter support          = REQUIRED
reasoning effort                    = medium
```

Provider options for every primary Actor call MUST request the equivalent of:

```json
{
  "openrouter": {
    "provider": {
      "only": ["anthropic"],
      "order": ["anthropic"],
      "allow_fallbacks": false,
      "require_parameters": true
    },
    "reasoning": {
      "effort": "medium"
    }
  }
}
```

`claude-sonnet-5` is a versioned Claude model ID, not the mutable OpenRouter `~anthropic/claude-sonnet-latest` alias. Mutable latest-family aliases are inadmissible deciding identity.

### 3.2 OM Observer / Reflector

A3 follows the **actual pinned Mastra Code realization**, whose current default OM model at the qualified bytes is Gemini 3.5 Flash rather than an older remembered default.

```text
Mastra model ID                     = openrouter/google/gemini-3.5-flash
OpenRouter model slug               = google/gemini-3.5-flash
upstream stable model ID            = gemini-3.5-flash
provider route                      = Google AI Studio only
provider fallback                   = DISABLED
provider parameter support          = REQUIRED
reasoning effort                    = medium
```

Observer and Reflector provider options MUST request the equivalent of:

```json
{
  "openrouter": {
    "provider": {
      "only": ["google-ai-studio"],
      "order": ["google-ai-studio"],
      "allow_fallbacks": false,
      "require_parameters": true
    },
    "reasoning": {
      "effort": "medium"
    }
  }
}
```

Response/provider metadata must be captured. A returned model/provider that contradicts the admitted route makes that run inadmissible rather than silently broadening the experiment.

---

## 4. External spend containment — probe only

Before the first billable call, execution MUST use a dedicated OpenRouter key with all of:

```text
key name / label                 = conexus-3l-a3
hard lifetime spend limit        = USD 10.00
limit reset                      = NONE / null
expiry                           = <= 24 hours from creation
shared production key            = FORBIDDEN
E2B guest exposure               = FORBIDDEN
log/plaintext persistence        = FORBIDDEN
```

The key-level hard cap is an **external containment device for this qualification experiment**. It does not satisfy 3I-03, does not become product model-spend architecture, and does not convert unknown usage into safe capacity.

The A3 runner additionally uses a bounded workflow timeout and serial execution. If the external limit, timeout, provider rate limit or retry behavior interrupts a run, the outcome is recorded as interrupted/NOT_PROVEN; the test is not silently rerun until a preferred result appears.

---

## 5. Experimental matrix — exactly four primary Actor runs

A3 intentionally stays small:

```text
Fixture A — long-context authority-currentness
  A0 = OM OFF
  A1 = OM ON

Fixture B — deterministic coding task
  B0 = OM OFF
  B1 = OM ON

primary Actor runs total = 4
```

The same Actor model, provider class, reasoning level, task definition, tool surface, starting repository/history and current authority are used inside each OFF/ON pair.

No repeated independent samples are added merely because one result is inconvenient. A genuine infrastructure interruption may be retried only with the failed attempt retained in evidence and the reason explicit.

---

## 6. OM configuration under test

The production-adjacent reference is the pinned Mastra Code OM shape:

```text
scope                       = thread
bufferTokens                = 1/5 of observation threshold
bufferActivation            = 2000 in current Mastra Code realization
previousObserverTokens      = 1000
observation blockAfter      = 2
reflection bufferActivation = 1/2
reflection blockAfter       = 1.1
activateAfterIdle           = auto
activateOnProviderChange    = true
threadTitle                 = true
```

A3 uses the same semantic shape but deliberately lower thresholds so the feature actually fires inside a bounded qualification fixture:

```text
scope                       = thread
observation.messageTokens   = 8000
observation.bufferTokens    = 0.2
observation.bufferActivation= 0.8
observation.previousObserverTokens = 1000
observation.blockAfter      = 2
observation.threadTitle     = true
reflection.observationTokens= 2000
reflection.bufferActivation = 0.5
reflection.blockAfter       = 1.1
activateAfterIdle           = auto
activateOnProviderChange    = true
semantic/vector recall      = OFF
memory extractors           = OFF
working-memory expansion    = OFF
```

These thresholds exist only to make the mechanism observable within A3. They do **not** replace the current Mastra Code defaults (`30k` observation / `40k` reflection) as a future product choice.

OM ON must produce at least one successful Observer cycle in each enabled fixture for the pair to be deciding. Reflection is measured when naturally triggered by the admitted fixture; failure to trigger reflection is not repaired by unrelated artificial content. Full retry/interception coverage belongs to Package C.

All background OM work must settle before final scoring for that condition.

---

## 7. Fixture A — long-context / authority-currentness

Purpose: determine whether OM helps long Change-scoped cognition **without allowing memory to become authority**.

Both OFF and ON receive the same persisted synthetic history. The history contains:

1. early valid requirements and implementation context;
2. enough distributed technical detail to exceed the A3 observation threshold;
3. an intentionally stale earlier rule `X`;
4. later explicit current authority `Y` that supersedes `X`;
5. a final task whose correct output mechanically requires `Y` and several earlier non-conflicting constraints.

The final prompt must not restate all earlier details; this is what makes continuity measurable.

Hard correctness law:

```text
memory/history says X
current authority says Y
→ Y MUST win
```

A run that follows stale `X` is a correctness failure regardless of token savings.

Scoring records at least:

```text
current-authority violations
forgotten required constraints
invented constraints
explicit rediscovery/re-read tool calls
final answer checklist score
Actor input/output/total usage with missingness preserved
OM Observer/Reflector usage separately
wall clock
OM cycles / errors / retries visible through hooks
provider/model metadata
```

---

## 8. Fixture B — deterministic coding effectiveness

Purpose: test whether OM improves the Builder's actual work rather than conversational recall alone.

The fixture is a synthetic, deterministic TypeScript repository containing:

```text
small multi-file change
pre-existing tests
one or more requirements distributed through the persistent thread
one superseded requirement where current authority wins
no network dependency
no production source/data/credentials
```

The Actor receives a bounded writable workspace equivalent in semantics to the current Builder tool surface. The resulting candidate is judged by deterministic verifier checks, not prose impression.

Scoring records at least:

```text
tests passed / failed
required assertions satisfied
stale-authority violations
unexpected changed paths
failed-test / rework cycles
read/search rediscovery operations
tool-call count
final diff size
Actor usage
OM usage
wall clock
human intervention required
```

A mechanically green test suite that violates the current authority fixture is still FAIL.

---

## 9. Evidence capture

A3 must preserve at minimum:

```text
exact lock digest and HEAD
requested + returned model identity
requested + returned provider metadata
per-condition thread/resource/session IDs
Actor token usage, preserving MISSING != ZERO
Observer usage via OM hooks
Reflector usage via OM hooks
OM cycle start/end/error evidence
wall-clock timestamps
final output / candidate digest
verifier results
read/search/tool-call counters
failed attempt evidence
external key limit/remaining observation before and after when available
```

`onObservationEnd` / `onReflectionEnd` usage/provider metadata from the pinned OM implementation are evidence sources. They do not themselves prove Package C admission semantics.

---

## 10. F-3L-A-02 — hidden OM retry path

**State:** MATERIAL / KNOWN BEFORE BILLABLE EXECUTION / ROUTED TO PACKAGE C.

Source inspection of `@mastra/memory 1.24.0` establishes that Observer/Reflector calls are wrapped in an internal retry helper with a retry budget that is independent from the main Agent's `maxRetries` setting. The pinned public `@mastra/memory/processors` API does not expose that retry configuration as a supported caller control.

Therefore:

```text
Agent maxRetries = 0
-X-> proves OM retry neutralization

A3 hard provider key limit
= bounds experiment damage
-X-> proves owner-local product admission

A3 OM quality PASS
-X-> enables OM in F1
```

Package C must determine whether every physical Observer/Reflector attempt can be intercepted/admitted/charged to the correct owner and whether hidden retries can be neutralized or independently gated. If not, OM remains OFF even if A3 shows cognitive benefit.

This finding does not require a generic model proxy/token broker by itself. Package C starts from the smallest interception/admission seam and escalates only if direct owner gating fails.

---

## 11. Decision rule

A3 does not search for a reason to enable OM. It chooses among these outcomes:

```text
material quality/continuity gain + no authority regression + acceptable observed overhead
→ COGNITIVELY QUALIFIED CANDIDATE
→ still blocked on Package C F-3L-A-02 / model-spend proof

mechanically safe but no material benefit
→ KEEP OM OFF for F1

quality gain but stale-authority regression
→ REJECT current OM realization for F1

quality gain but unacceptable latency/context/cost behavior
→ KEEP OFF unless a smaller configuration change is independently justified and requalified

provider/model identity drift, interrupted run, missing deciding evidence
→ NOT_PROVEN
```

No outcome automatically reopens 3H domain semantics or introduces a memory service.

---

## 12. Stop law

A3 stops immediately if any of the following occurs:

```text
lock/model/provider identity drift
unexpected provider fallback
dedicated key not hard-limited
key exposed outside runner/control side
billable path cannot be correlated to condition/owner
runaway retry approaches external cap
fixture cannot force at least one Observer cycle in OM ON
OM state overrides explicit current authority
model/provider returns evidence too incomplete to score honestly
```

A stop produces a Finding / NOT_PROVEN record; it does not trigger ad-hoc framework comparison.

---

## 13. Admission outcome

```text
A3 execution design                 = ADMITTED
A3 exact dependency closure         = COMPLETE
A3 billable calls                   = 0
A3 dedicated OpenRouter key         = REQUIRED / NOT YET PRESENT
A3 primary Actor runs               = NOT STARTED
F-3L-A-02 hidden OM retries         = OPEN / ROUTED TO PACKAGE C
OM current F1 baseline              = OFF
OM enablement authorized            = FALSE
product implementation              = BLOCKED
C-018                               = NOT YET RATIFIED
PR #40 merge                        = explicit operator authorization required
```
