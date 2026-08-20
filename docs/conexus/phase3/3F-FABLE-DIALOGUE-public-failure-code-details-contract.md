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

---

# Round 1 — Fable

**Status of this round:** adversarial review / NON-AUTHORITATIVE.
**Method:** DevelopmentConexus Engineering Method v1.0.0 (local copy) applied — evidence checked against 3F-01..3F-04, C-005/C-007/C-011/C-012/C-013/C-014/C-015/C-016; adversarial challenge run on alternative C; structural inversion test applied to the baseline. No claim depends on current Mastra behavior.

## F.1 Verdict

Alternative C (owner default + boundary admission + static contract projection) survives as the Global Maximum — alternatives A/B/D are correctly rejected and my attempts to falsify C failed (F.3 Q1). But the candidate has **two genuine defects and four sharpenings**: the literal baseline is one layer incomplete — it enumerates the distinct-behavior codes while omitting the **generic foreseen classes** that everything else maps to by default, and without those two literals every boundary mints its own generic (`failure class A` reborn at the layer this decision exists to close); and the **one-locus law has a hole at the fallback code**, which the candidate's own proof test 1 would trip over. Method outcome: **CURRENT STRUCTURE CONFIRMED** with bounded corrections. No Material Finding against 3F-01..04 or C-016. Draft in F.5; closing verdict at the end.

## F.2 Findings

### F-1 — The baseline is missing its floor: two generic foreseen literals

```text
claim challenged      §7's conservative baseline (5 candidates + not-found + fallback)
                      as sufficient
concrete failure class the fallback is reserved by 3F-02 for UNFORESEEN faults only.
                      A foreseen, well-typed domain rejection with no distinct client
                      behavior (binding target not adoptable, mutation not admitted,
                      rate refusal…) therefore has NO code to map to — so each
                      boundary invents its own generic ("REJECTED", "DENIED",
                      "CANNOT_PROCEED"…), and clients branch on accidental boundary
                      wording. That is failure class A, reborn one layer down, on
                      day one of implementation.
smallest correction   freeze two generic literals in the baseline:
                        OPERATION_REJECTED  (L1) — contract understood; domain/
                          authority/eligibility refuses; behavior: present message,
                          no automatic retry
                        VALIDATION_FAILED   (L2) — submitted input violates its
                          contract; behavior: field-level presentation; carries the
                          only currently-frozen details schema (F-5)
                      Every foreseen owner variant WITHOUT a distinct public
                      behavior maps to one of these by default; distinct literals
                      exist only where a distinct client behavior is evidenced.
reopen prior authority?  NO — this is the 3F-02 exhaustive-mapping law made landable
later owner           none; baseline is exactly 3F-05's scope
```

### F-2 — The one-locus law has a hole at the fallback

```text
claim challenged      §6.3 "same literal never maps to two loci" + §10 proof test 1,
                      applied to the fallback literal
concrete failure class an unforeseen fault is by definition UNCLASSIFIED — it is not
                      L1 (domain understood+refused), not L2 (no contract was
                      evaluated), not L3, not L4. Forcing it into a locus to satisfy
                      the projection check either corrupts a locus's meaning or
                      makes the check unimplementable. The candidate's own collision
                      test would flag its own fallback.
smallest correction   the fallback literal is the SOLE declared exception to the
                      code→locus table: it is explicitly UNCLASSIFIED by definition,
                      carries no details, no retryable, correlationId always, and
                      emits the defect event (3F-02). The projection verifies that
                      exactly one code has this status.
reopen prior authority?  NO — 3F-02's law governs classified codes; this names the
                      boundary of the law instead of leaving it to be discovered
later owner           none
```

### F-3 — The literal is the authority unit; mappings select, never define

The candidate's identity rule implies this but never states who owns a literal's meaning — which is exactly where a hidden second authority would grow (Q1). State it:

```text
literal definition (meaning + locus + details-contract identity)
  = a single public-contract fact, recorded once in the static projection

owner default / boundary admission / boundary override
  = choices of WHICH literal a variant maps to
  = may never redefine what a literal means
```

Under Method §3 (Mechanism ≠ Authority): the projection centralizes only the **public contract surface** — which is legitimately singular, like any contract — while owner unions keep all internal meaning. It is a contract record, not an ErrorRegistry in disguise (Q5): no runtime, no service, no owner-variant catalog, no registration of internal failures.

### F-4 — Sharpen the namespace rule: domain vocabulary allowed, module identity prohibited

The flat-vs-prefix question (Q2) hides two different things:

```text
module/package identity in literals   (GW_, PRJ_, BLD_)   → PROHIBITED
  leaks architecture into a long-lived contract; breaks the client-refactor test
product-domain vocabulary in literals (BINDING_, APPROVAL_) → PERMITTED
  stable product language; survives any internal refactor
```

Without this distinction, the prohibition on prefixes gets read as a prohibition on descriptive names, and the naming pressure produces cryptic literals instead. Collision risk in the flat namespace is already closed mechanically by the projection's uniqueness check.

### F-5 — Details: freeze the validation-issue shape now; defer the diagnostics fields; permit schema reuse by reference

Q13/Q14 split cleanly under the named-consumer test:

```text
VALIDATION_FAILED details — freeze the minimal closed shape NOW:
  issues[]: { field (public contract path), issueCode, params? (closed) }
  consumer is current and ratified: C-007 fieldsSchema credential forms and
  binding forms exist in F1; without the shape, field highlighting requires
  message parsing (the exact 3F-02 F-3 failure class)

MANIFEST_INVALID diagnostics — consumer exists (Control Plane promote/compile
  view) but the field vocabulary depends on manifest validation output that
  later 3F freezes; freeze only that its details are a closed issue collection
  over public identifiers; exact fields belong to the promote-surface contract
```

Two codes may declare details contracts that **reference the same schema** — reuse by reference is not a `UniversalIssue` model; each code still owns one declared details-contract identity.

### F-6 — Consolidation is the point, not the exception: one literal per behavior family

Q3 asked whether unrelated owners may share a literal. The stronger, correct statement is that they **should** when consumer behavior is identical — that is what semantic codes are for. Concrete F1 case: the refresh-then-retry family (checklist CAS per C-013, binding expectation per 3F-04, decision CAS per 3F-03, promotion `CAS_CONFLICT` per C-014) is ONE client behavior — reload current state, re-evaluate, retry. One literal, one handler in the generated client. The caller always knows which operation failed from the call site; the code does not need to carry owner identity. Distinct literals in this family would make clients write four identical handlers that drift independently.

Also under this finding: **`NOT_FOUND` indistinguishability is a law attached to the literal, not a per-boundary presentation choice** (Q11). The security property IS the cross-boundary uniformity: foreign/unauthorized identity must be byte-indistinguishable from nonexistent (same literal, same shape, no details, per C-015). One boundary distinguishing them creates an existence oracle — so this cannot be left boundary-specific.

## F.3 The twenty questions

1. **Global Maximum:** yes, with F-3's explicit literal-ownership rule. Attacked C by structural inversion (what if boundaries owned codes outright? → failure class A; what if owners owned public admission? → internal-only variants leak public codes) — both inversions fail, C stands. No hidden second authority once F-3 lands.
2. **Flat namespace:** correct, with F-4's split. The concrete future-cost of module prefixes is measured in kind: they turn every internal reorganization into a public contract event — the client-refactor proof test fails permanently.
3. **Reuse:** yes — F-6 inverts it into the design intent.
4. **Static projection necessary:** yes. Delete it and the one-locus, uniqueness, and owner-default laws become unenforceable prose — literal drift is then invisible until a client breaks. It is the *smallest* mechanism that makes 3F-02's laws mechanical.
5. **Registry in disguise:** no, per F-3's Mechanism≠Authority analysis — provided it records only public-contract facts and never enumerates internal variants.
6. **Smallest enforcement:** one typed constant module (literal → locus + details-contract identity; uniqueness by construction of object keys; exhaustiveness by TS closed unions) plus one contract test that walks boundary mappings verifying: known-variant coverage, owner-default on second admission, no locus/details collision, exactly one UNCLASSIFIED code. No codegen, no service, no database.
7. **Freeze now vs governance only:** both — governance laws AND the literals whose consumers are already ratified. Freezing zero literals now would hand the first implementer the naming decisions this contract exists to govern.
8. **The five candidates:** all five are real, not illustrative — each has a ratified mechanism and consumer: `CLIENT_OUTDATED` (C-012 handshake + generated-client reload), `CAS_CONFLICT` (C-014 literal; F-6 family), `CAPABILITY_UNAVAILABLE_HEALTH` (C-011/C-012 health gate + app unavailable-state), `MANIFEST_INVALID` (C-015 candidate REJECTED + Control Plane diagnostics), `OUTPUT_CONTRACT_VIOLATION` (C-005/C-012 runtime authority + client fail). Freeze all five.
9. **Approval classes:** zero new public literals. Unknown/foreign request → `NOT_FOUND`; decision CAS → `CAS_CONFLICT`; malformed decision → `VALIDATION_FAILED`; FIRST_CLAIM key-set violations are INTERNAL-surface contract errors between Gateway and PAR — if one ever reaches a public wire it is a platform defect and surfaces as the fallback; DENY/EXPIRE/STALE are outcomes, not failures (3F-03).
10. **Binding classes:** zero new public literals now. Expectation-stale → `CAS_CONFLICT`; scope/foreign → `NOT_FOUND`; not-adoptable, mutation-not-admitted → `OPERATION_REJECTED` with message; required-but-absent surfaces primarily as the proactive checklist read-model (3F-04 UX), and as `OPERATION_REJECTED` where an operation actually fails. A distinct literal enters only when a distinct client *behavior* (not a distinct message) is evidenced — none is today. This is the no-bulk-promotion law working as intended.
11. **Not-found:** shared literal + attached indistinguishability law — F-6.
12. **Fallback literal:** name it now — `INTERNAL_ERROR` — precisely because leaving it unnamed invites per-boundary variants of "UNKNOWN_ERROR". Deliberately meaning-free; sole UNCLASSIFIED code (F-2); laws from 3F-02 attached (no details, no retryable, correlationId, defect event).
13/14. **Details:** F-5 — validation shape now, diagnostics fields deferred to the promote-surface contract, reuse by reference permitted.
15. **Evolution:** additive-only suffices for F1, and more sharply than the candidate states: a shipped literal enters the release-facing contract family, and 3F-01's regime for that family is pinned fail-closed with PRESERVE horizons — an in-place rename would break every active pinned release consuming it. So renames are not "handled without aliases"; they are **structurally excluded in F1**. Alias/deprecation machinery would be machinery for an operation the architecture already forbids. The reopen trigger (a real windowed-compatibility consumer, likely DEDICATED external installs) is correctly listed in §11.
16. **UX:** confirmed — code as machine key, message-key as localized presentation, `CAS_CONFLICT` → "changed while you were editing" is exactly the 3F-04 pattern. Zero internals leak; the literal never needs to be shown to an ordinary user.
17. **Deletion test, one by one:** module prefixes — already deleted, refactor-stability is the recovered benefit; static projection — deleting it returns invisible literal drift (keep); shared literals — deleting returns N drifting handlers for one behavior (keep); details — deleting returns message-parsing for forms, a named-consumer break (keep minimal); owner defaults — deleting returns cross-boundary divergence, the measured Marketplace #7 class (keep). Every retained element survives; nothing else is deletable.
18. **Cross-check:** no Material Finding. C-016 sanitization is preserved verbatim (message/key presentation-safe, correlation-only bridge); 3F-02's laws are implemented, not modified; F-1/F-2 operate inside the scope 3F-02 explicitly routed here. Nothing reopens.
19. **Buildability:** everything CONVENTIONAL — typed constant + contract test + generated-client mapping tables (C-012 machinery). In-house PROVEN precedent: the MNFS kernel's 52-code closed typed taxonomy, operated in practice. **Zero new probes.**
20. Draft below.

## F.4 Structural inversion check on the baseline

Method §3 test applied: if every current boundary were the opposite (many external SDK consumers, multi-version windows, third-party clients), which conclusions survive? The governance laws (literal ownership, one locus, owner default, no internal leakage) all survive — they are consumer-count-independent. What would change: evolution (aliases would return) and namespace pressure (composition might return). Both are already the reopen triggers of §11. The baseline is therefore not overfit to today's single-operator shape.

## F.5 Proposed 3F-05 decision text (smallest operator-facing form)

---

> ### 3F-05 — Public Failure Code & Details Contract (DRAFT)
>
> **Decision in one sentence:** Conexus F1 governs public failure codes by owner-default + boundary-admission with a static contract projection — flat semantic literals owned as single public-contract facts, a nine-literal baseline covering every currently-evidenced public behavior including the two generic foreseen classes, code-discriminated closed details only where a named consumer exists, additive-only evolution under the release-facing PRESERVE regime, and no error registry, service, or taxonomy framework.
>
> **1. Laws.** (a) A literal's definition — meaning, locus, details-contract identity — is a single public-contract fact recorded once in the static projection; owner defaults and boundary admissions select literals and may never redefine them. (b) Owner-local variants stay private until admitted to a public boundary; admission mapping is mechanically exhaustive; the same variant on a second public boundary requires the owner-level default; boundary overrides are explicit with rationale. (c) One literal per consumer-behavior family across owners — distinct literals require a distinct evidenced client behavior, never a distinct owner or message. (d) Flat namespace: product-domain vocabulary permitted, module/package identity prohibited. (e) Loci L1–L4 never on the wire; each classified literal maps to exactly one locus; the fallback is the sole declared UNCLASSIFIED code. (f) No bulk promotion: 3F-03/3F-04 semantic classes are not public codes by name; they map to the baseline generics until a distinct behavior is evidenced.
>
> **2. Baseline literals** (strings operator-approvable; semantics frozen):
>
> | Literal | Locus | Client behavior | Details |
> |---|---|---|---|
> | `CLIENT_OUTDATED` | L3 | reload/refresh contract attestation, then retry | none |
> | `CAS_CONFLICT` | L3 | re-read current state, re-evaluate, retry — one shared literal for the whole refresh-then-retry family (checklist, bindings, approval decisions, promotion) | none — never a data channel |
> | `CAPABILITY_UNAVAILABLE_HEALTH` | L1 | present unavailable state; no retry storm | none |
> | `NOT_FOUND` | L1 | treat as nonexistent — **with attached law:** foreign/unauthorized identity is byte-indistinguishable from nonexistent on every public boundary (C-015); no details ever | none |
> | `OPERATION_REJECTED` | L1 | present sanitized message; no automatic retry — the generic foreseen domain/authority rejection | none |
> | `VALIDATION_FAILED` | L2 | field-level presentation | frozen minimal closed shape: `issues[]: { field: public contract path, issueCode, params? }` |
> | `MANIFEST_INVALID` | L2 | present diagnostics | closed issue collection over public identifiers; exact fields → promote-surface contract |
> | `OUTPUT_CONTRACT_VIOLATION` | L2 | fail the operation; surface as platform-side contract defect | none now |
> | `INTERNAL_ERROR` | UNCLASSIFIED (sole exception) | present generic failure + correlationId | none; no retryable; always emits the 3F-02 defect event |
>
> **3. Details.** Absent by default; closed, code-specific, public-identifiers-only; two codes may reference the same schema without creating a Universal model; everything in 3F-02's forbidden list stays forbidden.
>
> **4. Static projection.** One typed constant module (literal → locus + details identity; uniqueness by construction) + one contract test walking boundary admissions (coverage, owner defaults, collisions, single UNCLASSIFIED). Compile/test-time only; records public contract facts exclusively; never enumerates internal variants; no runtime component.
>
> **5. Evolution.** Additive-only in F1: shipped literals join the release-facing contract family under 3F-01 PRESERVE — in-place rename/meaning/locus/details-breaking changes are structurally excluded while any pinned release consumes them; splits/merges are explicit contract evolution. No alias/deprecation machinery (reopen trigger: a real windowed-compatibility consumer).
>
> **6. UX law.** Code is a machine key, never required in user-facing display; message/key carries sanitized localized presentation; correlationId is the support bridge; generated clients translate codes into product language (per 3F-04 §11 patterns).
>
> **7. Non-goals.** ErrorRegistry/service/database, UniversalError/Issue/Diagnostic, RecoveryClass, module-prefixed codes, HTTP status/route inventory, SDK generation, schema-library choice, localization framework, complete owner catalogs, public codes for internal-only variants, alias machinery.
>
> **8. Routed onward.** Exact wire layout per boundary, promote-diagnostics fields, HTTP mapping, tooling realization → later 3F/implementation; new literals → boundary admission + Decision Loop with evidenced behavior.
>
> **9. Proof strategy** (architecture-stage): the six falsification tests of §10 plus: the baseline-floor test — every foreseen rejection on a current surface must map to a baseline literal without inventing a new generic; and the UNCLASSIFIED-uniqueness check. Implementation evidence later: compile-time exhaustiveness + the contract test firing on seeded violations.
>
> **10. Reopen triggers.** As §11 of this dialogue, plus: a foreseen-rejection class that demonstrably cannot map to `OPERATION_REJECTED`/`VALIDATION_FAILED` without losing a needed client behavior.

---

## F.6 Closing verdict

All twenty questions converge; the two defects (F-1, F-2) are corrected inside the draft; the four sharpenings are folded in; the structural inversion check shows the result is not overfit to F1's current shape. No material question remains.

```text
READY FOR OPERATOR APPROVAL
```

No LEDGER or authority file was modified in this round.
