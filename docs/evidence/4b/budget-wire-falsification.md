# 4B Evidence — Budget Analyzer Wire Falsification

> **Kind:** executable 4B Evidence; never Product authority by itself.
> **Accepted semantic authority:** `docs/product/budget-analyzer-contract.md`.
> **Wire sources under test:** `contracts/api/project-operation.schema.json` and the two declarations under `contracts/examples/budget-analyzer/`.

## 1. Target

Use the first real Project-defined vertical to falsify the 4B declaration/generation grammar before mass fixed-platform schema authoring.

The proving instance is exactly:

```text
AnalyzePendingBudgets
ListPendingBudgets
N_budget = 2
```

No Product Agent, MAR, DEDICATED caller or third Budget operation was introduced.

## 2. Project declaration proof

Both declarations validate against `project-operation/v1` and preserve:

```text
regime            = QUERY
callers           = Published-App admin + member only
effectClass       = READ_ONLY
outcomeProfile    = ANALYTIC
icProfiles        = [IC0]
required pins     = active Release + Brain binding + Connection binding/revision
asOf input        = absent
arbitrary metrics = absent
arbitrary groupBy = absent
SQL/source fields = absent
```

The generator deterministically produces exactly two literal static paths:

```text
/api/projects/{projectId}/queries/analyze-pending-budgets
/api/projects/{projectId}/queries/list-pending-budgets
```

There is no runtime `{operationSlug}`, `/execute`, arbitrary operation registry or caller-selected target.

`Verify #211` established that the declarations validate, exactly two static paths are generated, and the generated OAD passes OpenAPI lint.

## 3. Truth-state wire properties

Both output schemas require a truth envelope containing:

```text
state
asOf
freshness
coverage
provenance
```

`asOf` is output/provenance only. It is an opaque system-issued source/reconciliation coordinate and is not accepted in either input schema.

Current state vocabulary:

```text
SUPPORTED_CURRENT
SUPPORTED_STALE
PARTIAL
UNVERIFIED
INDETERMINATE
UNSUPPORTED
DEPENDENCY_UNAVAILABLE
```

Money is represented as decimal strings in this vertical to avoid silently imposing binary floating-point semantics on exact business values.

## 4. Executable falsifiers

### BW-F1 — unknown must not become zero

Negative fixture:

```text
truth.state = UNVERIFIED
summary.pendingBudgetCount = 0
summary.pendingBudgetValue = "0"
```

Expected: INVALID.

Reason: an unverified source/result cannot masquerade as a supported empty/zero business result.

A separate `SUPPORTED_CURRENT` empty fixture with zero summary and empty grouping arrays is VALID, proving the schema distinguishes **known zero** from **unknown** rather than banning zero itself.

### BW-F2 — supported negative age must fail

Negative fixture:

```text
truth.state   = SUPPORTED_CURRENT
budgetAgeDays = -1
agingBand     = AGE_0_3
```

Expected: INVALID.

Reason: a supported result cannot classify a future-dated/negative-age Budget into a normal aging band.

### BW-F3 — negative age is never banded, even under PARTIAL

Positive partial fixture:

```text
truth.state   = PARTIAL
budgetAgeDays = -1
agingBand     = absent
```

Expected: VALID.

Negative partial fixture:

```text
truth.state   = PARTIAL
budgetAgeDays = -1
agingBand     = AGE_0_3
```

Expected: INVALID.

Reason: PARTIAL may truthfully surface the anomalous business date/age as provenance-aware data, but the anomaly never becomes a valid age-band classification.

## 5. Validator defect and correction

The first truth-fixture run failed before reaching semantic assertions because AJV strict mode does not include JSON Schema `date` / `date-time` format implementations in core since Ajv v7.

The schema was not weakened. The proof runner was corrected to load:

```text
ajv-formats@3.0.1
```

through the supported `ajv-cli -c ajv-formats` mechanism. This preserves RFC3339 format validation and strict schema compilation.

Official references:

```text
https://ajv.js.org/guide/formats
https://ajv.js.org/packages/ajv-cli.html
https://ajv.js.org/packages/ajv-formats.html
```

## 6. Current executable result

```text
Verify #218 = SUCCESS
→ RFC3339-enabled positive/negative truth fixtures execute correctly

Verify #221 = SUCCESS
→ additional PARTIAL negative-age banding falsifier fires correctly
```

At `Verify #221` the Budget proving instance establishes:

```text
Project declarations valid                    = 2/2
static generated paths                        = 2/2
generic executor paths                        = 0
caller-selected historical asOf               = 0
UNVERIFIED business-zero false positive       = rejected
SUPPORTED negative-age band false positive    = rejected
PARTIAL negative-age band false positive      = rejected
PARTIAL negative-age unbanded representation  = admitted
```

## 7. Scope conclusion

This Evidence validates the current Project-defined QUERY grammar and the first vertical truth-state shape only. It does not prove:

- all future Project ACTION/INTEGRATION declarations;
- fixed-platform request/response schemas;
- runtime implementation;
- Sankhya field mappings;
- real-source reconciliation;
- frontend behavior.

Those remain routed to their owning later 4B/4D/4E proof boundaries.
