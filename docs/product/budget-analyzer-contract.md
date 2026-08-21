# Budget Analyzer — First-Vertical Product Semantic Contract

> **Status:** CANDIDATE / OPERATOR DECISION REQUIRED / 4A-BUDGET-01
> **Product:** Analisador Inteligente de Orçamentos — Sankhya
> **Purpose:** close the smallest real business semantic/result inventory required to instantiate the 4A Project-defined Query grammar without copying Mitra's implementation fragmentation.
> **Not authorized:** OpenAPI, SQL, schema, sync implementation, frontend, runtime or Product code.

This contract is a **Product/Brain semantic decision candidate**. It deliberately uses Mitra only as benchmark Evidence. No Mitra query, table, heuristic or function count becomes Conexus authority by observation.

---

## 1. Decision question

> What is the smallest useful and truth-preserving first Budget Analyzer result set that is sufficiently exact for 4A to derive the first Project-defined Product operations, while refusing unsupported margin/conversion/probability semantics?

The first vertical remains read-only analytics.

---

## 2. Evidence we have — not authority

The Mitra benchmark/source study established useful historical Evidence against a real Sankhya environment:

```text
candidate Budget population evidence
→ CODTIPOPER IN (14, 714)
→ TGFTOP.ORCAMENTO='S' was unreliable in that source

candidate pending evidence
→ PENDENTE='S'
→ no derivative relation in TGFVAR

historical benchmark snapshot
→ 187 pending budgets
→ R$ 6,283,878 pending value

margin
→ VLRCUS was not usable as cost in 94.8% of sampled items
→ margin feature was correctly cancelled

aging
→ days since DTALTER
→ Mitra used bands <=3, <=7, <=30, >30

Mitra implementation
→ 28 analytical server functions
→ seller/customer/aging/month cross-filters
```

The benchmark also used a heuristic factor approximately `1.00 / 0.45 / 0.20 / 0.05` by aging band. That factor has no accepted Conexus business authority and is **not** imported by this candidate.

These facts are useful to formulate and falsify the Conexus Product contract. They do not settle it.

---

## 3. Recommended F1 semantic boundary

### 3.1 Dataset grain

One analytical Budget entity represents **one exact Sankhya budget/order header** under the admitted source/Connection scope.

Conceptually:

```text
Budget grain
= exact source-qualified budget document identity
```

The canonical source identity and field mapping are proven later against the real Sankhya Connection; 4A does not select physical mirror columns.

### 3.2 Budget eligibility

Recommended Product rule:

> A document is a Budget only when the current published Brain semantic definition admits its Sankhya operation/type into the Budget population.

For the first benchmark, the **initial semantic candidate** is the observed source rule:

```text
CODTIPOPER ∈ {14, 714}
```

but this rule becomes authoritative only after operator acceptance here **and** later real-source validation confirms those meanings still hold for the bound Sankhya source.

`TGFTOP.ORCAMENTO='S'` is not accepted as authority merely because a field is named like a business concept.

### 3.3 Pending Budget

Recommended Product meaning:

> A Pending Budget is an admitted Budget whose current source state says it remains pending and for which no current admitted derivative/sale relation establishes conversion.

First benchmark candidate:

```text
PENDENTE = 'S'
AND no admitted derivative relation in TGFVAR
```

The exact derivative topology is a real-source proof obligation. Unknown/ambiguous derivation must not be silently classified as pending or converted.

### 3.4 Time semantics

All age/time-derived results are bound to an explicit **`as_of` source/reconciliation coordinate**, never hidden database/server "now".

Recommended age measure:

```text
age_days
= calendar-day difference between current source DTALTER date and explicit as_of date
```

This makes replay/reconciliation deterministic and avoids a dashboard changing historical meaning simply because it was queried later.

### 3.5 Aging bands

For benchmark comparability, recommend the first semantic bands:

```text
AGE_0_3
AGE_4_7
AGE_8_30
AGE_31_PLUS
```

These are neutral analytical bands, not probability claims.

The Mitra label `Janela de ouro` is **not** canonical business truth in this candidate. 4C may later choose a user-facing label only if it does not imply unsupported probability/business policy.

### 3.6 Source qualification

Seller, customer, company and budget identities remain source-qualified.

If one Connection credential can technically see multiple companies, that does **not** authorize ambient all-company analysis. The exact ProjectConnectionBinding/source scope decides what is admitted.

---

## 4. Supported first Product-visible results

The recommended minimum useful result inventory is:

### R1 — Pending summary

```text
pending_budget_count
pending_budget_value
as_of
freshness / coverage / provenance state
```

No zero is returned for unknown/partial/unverified source state.

### R2 — Pending by seller

Per exact seller identity:

```text
budget_count
budget_value
average_age_days
```

### R3 — Pending by customer

Per exact customer identity:

```text
budget_count
budget_value
average_age_days
```

### R4 — Pending by aging band

Per accepted band:

```text
budget_count
budget_value
```

### R5 — Pending by month

Per admitted calendar month of the Budget source date:

```text
budget_count
budget_value
```

The exact source date used for month grouping must be fixed by the published Brain mapping before implementation; 4A does not silently choose `DTNEG` versus another business date by field-name intuition.

### R6 — Pending Budget drilldown

A pageable/read-only list sufficient to inspect the budgets behind aggregate results, with exact source-qualified identifiers and the minimum accepted business fields such as:

```text
budget identity
budget source/business date
last-change time/date
age_days
value
seller identity/presentation
customer identity/presentation
source/company identity where admitted
current pending/derivation evidence state
```

4C decides the presentation. 4B decides exact wire. 4D decides SQL/read-model mechanics.

---

## 5. Deliberately unsupported/deferred results

### 5.1 Margin

```text
margin = UNSUPPORTED_F1
```

Reason: benchmark Evidence found the apparent source-cost field unreliable in 94.8% of sampled items. A future margin result requires a real current cost semantic source and Brain publication; it may not be estimated from `VLRCUS` by convenience.

### 5.2 Heuristic conversion probability / opportunity score

```text
Mitra FATOR aging heuristic = REJECT_F1_AS_AUTHORITY
```

The observed `1.00 / 0.45 / 0.20 / 0.05` weighting is not a verified business probability model. Conexus must not label it "chance of conversion", expected revenue or intelligence score without evidence/owner acceptance.

### 5.3 Actual conversion rate/value

Recommended current disposition:

```text
conversion metrics = DEFER / UNSUPPORTED until exact derivative semantics are proved
```

Reason: it is not enough to know that a `TGFVAR` row exists. Correct conversion may require proving one-to-many derivations, partial conversion, cancellations/returns, relevant operation types, time attribution and value semantics.

If the operator explicitly requires conversion in the first vertical, 4A must open a bounded semantic decision/probe for that metric before `N_budget` can close. It must not guess.

---

## 6. Product operation reduction

Mitra's 28 analytical server functions are an implementation artifact, not 28 Product meanings.

The recommended Conexus operation surface is only **two** Project-defined registered Queries:

### `AnalyzePendingBudgets`

One semantic analytical read over the exact current result boundary, capable of returning R1–R5 under admitted filters/dimensions.

Conceptual filter semantics may include:

```text
seller
customer
aging band
calendar month
source/company where explicitly admitted
```

The operation is not screen-shaped: its meaning is the coherent pending-budget analysis dataset/result set, usable by dashboard, tests and independent 3O candidate reconciliation.

Cross-filter presentation behavior belongs to 4C. The semantic operation simply applies explicit filters truthfully.

### `ListPendingBudgets`

One pageable drilldown read for R6 under the same accepted semantic filters/`as_of`/source scope.

No third `GetBudgetDetail` operation is admitted until a real 4C interaction proves the list representation is insufficient.

Therefore the recommended first-vertical census is:

```text
N_budget = 2
```

subject to operator semantic acceptance and later 4A proof.

---

## 7. Published-App authorization

The first Budget Analyzer is read-only. Recommended F1 operation authorization:

```text
Published App role admin  → AnalyzePendingBudgets + ListPendingBudgets
Published App role member → AnalyzePendingBudgets + ListPendingBudgets
```

Control Plane Project administration does not imply either app role. App roles do not imply Control Plane authority.

No Product Agent, MAR job caller or DEDICATED caller is admitted to these two Product operations merely to exercise infrastructure.

The internal governed sync that prepares the read model is a Release-pinned job and is not a Published-App business operation.

---

## 8. Required truth states

Both operations must preserve at least these semantic states where reachable:

```text
SUPPORTED_CURRENT
SUPPORTED_STALE
PARTIAL
UNVERIFIED / INDETERMINATE
UNSUPPORTED
DEPENDENCY_UNAVAILABLE
```

Exact code spelling belongs to 4B.

Rules:

```text
unknown != zero
partial != complete
stale != current
read-model result != source proof
empty current result != failed source
```

The dashboard must expose material `as_of`, freshness, coverage and provenance rather than treating request time as data time.

---

## 9. 3O proof linkage

If accepted, the first-vertical result inventory becomes:

```text
R1 summary
R2 seller distribution
R3 customer distribution
R4 aging distribution
R5 monthly trend
R6 drilldown
```

The later 3O concrete candidate/proof must:

- bind every result to exact Brain semantic IDs/source mappings;
- prove the Budget and Pending population against real Sankhya at one common comparison coordinate;
- prove the exact business-date choice for R5;
- cover distinct transformation-rule classes rather than merely result count;
- include one deterministic negative control such as excluded non-Budget operation type, derivative converted budget, wrong seller/customer scope or wrong aging boundary;
- return INDETERMINATE/UNSUPPORTED rather than fabricate truth when the source coordinate or semantic mapping is insufficient.

---

## 10. Operator decision

### Recommended acceptance

Accept the first Budget Analyzer F1 semantic contract as:

```text
Product focus            = pending-budget intelligence
Budget rule candidate    = CODTIPOPER {14,714}, subject to real-source validation
Pending rule candidate   = PENDENTE='S' + no admitted TGFVAR derivative, subject to real-source validation
Time                     = explicit as_of; age from DTALTER
Age bands                = 0–3 / 4–7 / 8–30 / 31+
Supported results        = summary + seller + customer + aging + month + drilldown
Margin                   = unsupported
Heuristic probability    = rejected
Conversion metric        = deferred until separately proved
Product operations       = AnalyzePendingBudgets + ListPendingBudgets
N_budget                  = 2
App roles                 = admin + member read access
```

This is the smallest contract that remains useful, comparable with the benchmark and honest about what the current Evidence does **not** establish.

### Reopen triggers

Reopen only the smallest semantic item if real-source proof establishes that:

- `{14,714}` is not the correct Budget population;
- the Pending/TGFVAR rule is incomplete or false;
- the business date for monthly analysis differs from the selected Brain mapping;
- the age-band boundaries do not reflect desired Product meaning;
- a real first-vertical consumer requires detail not expressible through the two admitted Queries;
- correct conversion semantics are proved and explicitly admitted.