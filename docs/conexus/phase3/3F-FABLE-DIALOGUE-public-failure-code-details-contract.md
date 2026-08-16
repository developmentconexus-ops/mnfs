# 3F — ChatGPT ↔ Fable Dialogue — Public Failure Code & Details Contract

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate:** `3F-05 — Public Failure Code & Details Contract`  
**Parent authority:** `3F-01`, `3F-02`, `3F-03`, `3F-04`  
**Important:** this file is review/co-design provenance only. It does not approve 3F-05, change `LEDGER.md`, constitute C-018, authorize implementation, merge, or PR readiness.

This round follows the local copy of **DevelopmentConexus Engineering Method v1.0.0**. No current Mastra behavior is required by this decision.

---

# Round 1 — ChatGPT

## 1. Decision admission

3F-05 is material because it fixes an externally consumed contract and the semantics clients may branch on.

Non-degradable minimum for this round:

```text
citeable outcome/basis
explicit invariant
proof strategy
reopen triggers
```

No HTTP route inventory, schema library, error service, or implementation is admitted by this decision.

---

## 2. Evidence

### Accepted authority

`3F-01` freezes four internal semantic loci:

```text
L1 DOMAIN_OR_AUTHORITY_REJECTION
L2 CONTRACT_INVALID
L3 STALE_EXPECTATION
L4 DURABLE_INTERPRETATION_FAILURE
```

and explicitly says loci are not the final public wire taxonomy.

`3F-02` freezes public failure projection:

```text
stable code
sanitized presentation-safe message/key
correlationId
details?   # only when the code declares a closed schema
```

plus these laws:

```text
stable code = consumer behavior key
locus L1-L4 never goes on the public wire
no generic details/meta/context bag
internal-only failure variants get no public code
public mapping is exhaustive per boundary
second public admission of the same owner variant requires an owner-level default
unknown/untyped fault → one bounded generic code, no details, no retryable
public stable code → exactly one semantic locus
```

`3F-02` deliberately routed forward:

```text
literal stable public codes
per-code details schemas
public-code → failure-locus table
exact wire field/layout per concrete boundary
```

`3F-03` further freezes that normal ApprovalRequest outcomes are not T1 failures:

```text
AWAITING_APPROVAL
DENY
EXPIRE
STALE
```

while public contract misuse may include malformed decision, stale/CAS expectations, invalid FIRST_CLAIM key-set, foreign/bound request misuse, or durable interpretation failure.

`3F-04` freezes binding failure **semantic classes**, explicitly not literal public codes:

```text
PROJECT_BINDING_MUTATION_NOT_ADMITTED
BINDING_SOURCE_NOT_REPRODUCIBLE
BINDING_REQUIRED_BUT_ABSENT
BINDING_SCOPE_MISMATCH
BINDING_TARGET_NOT_ADOPTABLE
BINDING_EXPECTATION_STALE
BINDING_REFERENCE_INVALID
BRAIN_BINDING_INCOMPATIBLE
```

Only variants actually admitted to an independent/public boundary may become public codes.

### Known / inferred / unknown / deferred

**Known**

- Public clients need a stable branch key independent of presentation text.
- A code may not change semantic locus across time.
- Details are optional and code-discriminated.
- Internal failure unions remain owner-local.
- HTTP status, logs, traces and locus are not the public behavior key.

**Inferred**

- A runtime error-registry service would duplicate compile-time contract meaning and has no current consumer.
- Module-prefixed public codes risk leaking internal architecture into a long-lived independent contract.
- A single flat literal may be reused safely only when public consumer semantics are genuinely identical.

**Unknown**

- Whether F1 needs any module/domain namespace in public code literals.
- Which owner-specific semantic classes are definitely admitted publicly before route inventory is frozen.
- Which current details consumers justify exact fields now rather than at the boundary-specific contract.

**Deferred by authority**

- HTTP route/status mapping and exact transport layout.
- OpenAPI/JSON Schema/TypeScript library choice.
- Recovery machinery and FSMs.

Unknowns must not become convenient defaults.

---

## 3. Root cause

Two opposite failure classes exist.

### Failure class A — boundary-local/ad hoc codes

```text
same owner failure
→ code A on one public surface
→ code B on another
→ clients branch on accidental boundary wording
→ future refactor changes behavior contract silently
```

### Failure class B — central universal error framework

```text
all errors forced into central registry/taxonomy/service
→ internal owner meaning duplicated centrally
→ generic categories/details grow without consumers
→ second authority + accidental complexity
```

The root problem is not “we need a list of errors”. It is:

> Public behavior semantics must remain stable without centralizing internal failure meaning.

---

## 4. Target invariant

For every public failure emitted by Conexus F1:

1. `code` is a stable consumer-behavior contract, not an internal exception/class name by default;
2. the same literal always has one public semantic meaning, one L1-L4 locus, and at most one declared details-contract identity;
3. owner-local failures remain owner-local until admitted publicly;
4. the same owner variant admitted on multiple public boundaries uses its owner-level default unless an explicit boundary override is justified;
5. `details` is absent unless a named consumer needs structured recovery/presentation information;
6. public handling never requires the client to know module ownership, stack/SQL/path, or internal locus;
7. unknown/untyped faults fail to the one bounded sanitized fallback from 3F-02.

---

## 5. Credible alternatives

### A — Runtime/global Error Registry service

```text
ErrorRegistry.register(...)
CentralErrorCatalog
RecoveryClass
```

**Reject candidate.** No runtime consumer requires a service. It duplicates owner-local meaning and conflicts with 3F-02.

### B — Each boundary invents its own codes

**Reject candidate.** Violates the cross-boundary default law and creates client drift.

### C — Owner default + boundary admission + static contract projection

```text
owner-local failure variant
→ public admission mapping
→ stable literal code
→ optional closed details contract
→ one internal locus

if same owner variant crosses >1 public boundary
→ owner-level public default required
```

A build/test-time static table/projection may verify code uniqueness/semantics. No runtime registry/service is implied.

**Current preferred candidate.**

### D — HTTP status is the taxonomy

**Reject candidate.** Transport status is too coarse and transport-specific; multiple stable consumer behaviors may share the same HTTP status.

---

## 6. Candidate contract

### 6.1 Code literals

Candidate rules:

```text
UPPER_SNAKE_CASE
semantic, not presentation text
not localized
stable across refactors
not automatically module-prefixed
```

A literal may be reused across unrelated owners only if all are identical:

```text
consumer behavior semantics
semantic locus
admitted details-contract identity
```

Otherwise use distinct literals.

There is no current justification for exposing module/package names in public codes merely to guarantee uniqueness.

### 6.2 Ownership

```text
owner module
→ owns its local failure variants
→ owns default public projection semantics after repeated public admission

public boundary
→ owns which variants are admitted
→ maps them exhaustively
→ may override owner default only explicitly + rationale
```

No public code is created for internal-only completeness.

### 6.3 Static catalog, not service

3F-02 requires mechanical:

```text
public code → exactly one locus
```

Candidate realization is a **static contract projection/test input**, assembled from admitted public mappings.

It verifies at least:

```text
same literal never maps to two loci
same literal never declares incompatible details schemas
second public admission of same owner variant has owner default
known admitted variant has mapping
```

This is not a runtime `ErrorRegistry`, database table, service, or central owner of domain failures.

Exact code-generation/tooling is implementation/later-3F only if needed.

### 6.4 Evolution

Once a code has shipped on an `INDEPENDENT` surface:

```text
meaning change      → prohibited in place
locus change        → prohibited in place
details incompatible change → prohibited in place
new code            → additive when consumer/failure class exists
rename/split/merge  → explicit contract evolution, never silent refactor
```

Public-code compatibility follows the `PRESERVE`/staleness rules already frozen by 3F-01 for the relevant surface horizon.

### 6.5 Details

Default:

```text
details = absent
```

Add details only when a named consumer must make a useful decision that cannot safely be made from:

```text
code + presentation-safe message/key + correlationId
```

A details schema must be:

```text
closed
code-specific
presentation/recovery relevant
limited to public identifiers/values already legal for that boundary
```

Forbidden:

```text
Record<string, unknown>
metadata:any
internal stack/path/sql
secret/provider raw payload
fresh domain state used to bypass a normal authorized read
retryable as generic authority
locus
```

Current 3F-02 evidence names two legitimate consumer classes:

```text
server-side form validation
compile/promote diagnostics over public identifiers
```

Open question: freeze their exact field schemas in 3F-05, or wait until each concrete boundary is frozen. Do not create a UniversalIssue/Diagnostic model merely because both are collections.

---

## 7. Literal baseline — deliberately conservative

I do **not** propose enumerating every semantic failure class from 3F-03/04 as a public code. Public admission has not yet been proven for all of them.

The following semantics are already strong candidates because prior authority names real independent/public consumers:

```text
CLIENT_OUTDATED
CAS_CONFLICT
CAPABILITY_UNAVAILABLE_HEALTH
MANIFEST_INVALID
OUTPUT_CONTRACT_VIOLATION
```

plus one security-safe not-found behavior where a public boundary intentionally hides foreign/unauthorized identity, and the one bounded unknown/untyped fallback required by 3F-02.

However, 3F-05 should freeze a literal only if its public consumer and remediation semantics are already sufficiently evidenced. Fable should attack whether any of these examples are still merely illustrative names from 3F-01 rather than final public literals.

For bindings and approvals, 3F-05 must distinguish:

```text
semantic failure class already frozen
!=
automatically public stable code
```

No bulk promotion by name.

---

## 8. UX/product law

Public `code` is primarily a machine behavior key. It does not need to be displayed to ordinary users.

```text
code
→ client behavior / typed branch

message/key
→ sanitized presentation/localization

details
→ only structured information needed by that interaction

correlationId
→ support/diagnostic bridge
```

The client may translate `CAS_CONFLICT` into product language such as:

```text
“This changed while you were editing. Reload and try again.”
```

without exposing CAS or owner internals to the user.

---

## 9. YAGNI / anti-overengineering

Do not add in 3F-05:

```text
ErrorRegistry service/database
UniversalError
UniversalFailure
RecoveryClass taxonomy
module-prefixed namespace by default
HTTP status inventory
route inventory
SDK generation
schema library choice
localization framework
UniversalIssue / UniversalDiagnostic
complete owner failure catalog
public code for internal-only variants
```

The smallest useful artifact is contract law + the literal baseline that current public consumers actually justify.

---

## 10. Proof strategy

Architecture-stage falsification:

1. **collision test:** attempt to map one literal to two loci or incompatible details schemas → must be rejected by the contract model;
2. **owner-consistency test:** same owner variant admitted to two public surfaces without default → must be mechanically detectable;
3. **internal-only deletion test:** adding an internal variant must not require a public code;
4. **unknown fallback test:** unforeseen exception maps only to bounded sanitized fallback + correlation, never details/retryable;
5. **client refactor test:** moving an internal failure between modules must not force public code change when consumer semantics are unchanged;
6. **details necessity test:** delete each proposed details field/schema; if no named consumer behavior breaks, do not freeze it.

No new runtime/technology probe is currently required. Mechanisms are conventional; exact compile/test realization remains implementation evidence later.

---

## 11. Reopen triggers

Reopen 3F-05 only on material evidence such as:

- a real public consumer requires code composition/namespacing the flat semantic literals cannot safely express;
- one literal legitimately needs multiple details contracts or loci;
- a second transport/SDK consumer proves the current projection insufficient;
- a real compatibility horizon requires alias/deprecation semantics not covered by additive codes;
- current static projection becomes a demonstrated maintenance bottleneck.

---

## 12. Questions for Fable Round 1

Attack the candidate, especially:

1. Is owner-default + boundary admission the Global Maximum, or does it hide a second authority?
2. Is a flat semantic code namespace better than owner/module prefixes? Find a concrete collision/future-cost failure.
3. Can one literal ever safely be reused by unrelated owners under the identity rule proposed?
4. Is a static code→locus/details projection necessary, or is even that accidental ceremony?
5. Does the static projection accidentally become a central error registry in another form?
6. What is the smallest mechanical way to enforce 3F-02's exactly-one-locus law?
7. Should any literal codes be frozen now, or should 3F-05 freeze only governance until exact boundary admission?
8. For `CLIENT_OUTDATED`, `CAS_CONFLICT`, `CAPABILITY_UNAVAILABLE_HEALTH`, `MANIFEST_INVALID`, `OUTPUT_CONTRACT_VIOLATION`: which are actual F1 public literals vs merely semantic examples in prior docs?
9. Which 3F-03 approval misuse classes require distinct public behaviors now, if any?
10. Which 3F-04 binding semantic classes require distinct public behaviors now, if any?
11. Is security-safe not-found a shared public code or boundary-specific presentation rule?
12. What should the bounded unforeseen fallback literal be, and is naming it in architecture useful or premature?
13. Do current named consumers justify exact details schemas for form validation and compile/promote diagnostics now?
14. If yes, propose the minimum closed schemas; if no, name the exact later decision boundary that owns them.
15. Attack the evolution rule: can additive-only codes plus explicit breaking evolution handle F1 without aliases/deprecation machinery?
16. Does code-as-machine-key + message/key-as-presentation preserve UX without leaking architecture?
17. Deletion test: remove module prefixes, static projection, code reuse, details, owner defaults one by one — what real failure returns?
18. Cross-check 3F-01/02/03/04 and C-016. Any Material Finding against prior authority?
19. Buildability: any non-conventional mechanism or required probe?
20. Produce the smallest operator-facing 3F-05 draft. Finish `READY FOR OPERATOR APPROVAL` only if no material question remains.

For every disagreement use:

```text
claim challenged
concrete failure class
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

Do not modify authority or `LEDGER.md` in this review round.
