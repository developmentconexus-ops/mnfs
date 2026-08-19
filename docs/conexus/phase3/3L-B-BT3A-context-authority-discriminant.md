# 3L Package B — BT-3A Context Authority Discriminant

**Status:** `EXECUTED / COMPLETE / SUPERSEDED AS NEXT ROUTE BY 3L-R1`

**Phase:** 3L — Technology Qualification  
**Scope:** Package B — Product Agent + Cross-Runtime  
**Parent proof route:** [3L-B proof-routing amendment](3L-B-proof-routing-amendment.md)  
**Observed failure:** [3L-B technology qualification](3L-B-technology-qualification.md)  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Nature:** bounded Architecture-Lead adjudication design; this file does not authorize Product implementation, BT-4/BT-5, C-018 or merge.

> **Current route:** BT-3A preserved its historical source Evidence and rejected the native schema hypothesis. [3L-R1](3L-R1-framework-native-proportional-qualification-rebaseline.md) is now current authority; `BT-3N` is next and `BT-4N`/`BT-5N` remain blocked.

## 1. Decision in one sentence

BT-3's observed Mastra resume behavior is accepted as real Evidence, but it is **not yet accepted as proof that the selected Mastra realization is architecturally incompatible**: the next and only admitted step is BT-3A, a minimal discriminating probe that tests whether a closed, complete, current Conexus authority projection can prevent any stale persisted RequestContext value from influencing load-bearing runtime decisions after genuine process loss and resume.

## 2. What BT-3 proved

Against the exact Package-B lock:

```text
@mastra/core   = 1.56.0
@mastra/memory = 1.25.0
@mastra/pg     = 1.19.0
PostgreSQL     = 17.10
```

BT-3 proved:

```text
genuine direct-Agent suspension               = PASS
persistent suspended-run storage               = PASS
fresh-process rediscovery                      = PASS
fresh-process resume                           = PASS
fresh caller RequestContext accepted            = PASS
caller value overrides same-key stale value    = PASS
unknown stale snapshot key disappears          = FAIL
```

Observed behavior:

```text
snapshot RequestContext
+
fresh resume RequestContext
→ effective merged RequestContext
```

The stale key `unknownStaleKey=MUST_DISAPPEAR` survived because the fresh context did not contain that key.

This is a real pinned-runtime behavior, not a harness artifact. The exact pinned source and the deterministic fresh-process probe agree.

## 3. Root-cause interpretation

The Architecture Lead separates two layers that the previous realization wording had collapsed.

### 3.1 Protected invariant — remains mandatory

```text
No stale runtime/snapshot value may become current Conexus authority
or influence a current permission, tool, model, binding, approval,
identity or other load-bearing Product decision after dispatch/resume.
```

This invariant is unchanged.

### 3.2 Previously selected mechanism — now under challenge

The prior literal realization said, in effect:

```text
Mastra RequestContext itself must be replaced whole on resume.
```

BT-3 demonstrates that the pinned direct-Agent resume path does not natively implement that object-level replacement semantic. That is a **mechanism finding**, not yet an architecture contradiction.

Method rule:

```text
Mechanism != Authority
```

The deciding question is therefore not whether Mastra preserves continuation context internally. The deciding question is whether stale preserved context can become or influence Conexus authority.

## 4. Candidate bounded realization to discriminate

The candidate realization preserves Mastra's continuation mechanics while closing the Conexus authority surface.

```text
Conexus owner truth
→ build COMPLETE current authority projection
→ closed authority key contract
→ pass fresh complete projection on every dispatch/resume
→ Mastra continuation mechanics
→ no stale value may influence a governed decision
```

Key properties:

1. **Complete, not delta.** Every authority-bearing field required by the governed execution is supplied from current/pinned owner facts on every dispatch/resume.
2. **Closed keyspace.** Arbitrary runtime keys cannot silently become Conexus authority.
3. **Explicit absence.** Where a previously present optional authority fact becomes absent, the current projection uses the contract's explicit absence representation rather than relying on key omission if omission would permit stale fallback.
4. **Current values win.** The candidate relies only on behavior actually proven in the pinned runtime: a freshly supplied value wins over the same persisted key.
5. **Mastra substrate state remains non-authoritative.** Preserved internal/continuation context may exist, but it cannot be used as a Product authority source.
6. **No late sanitization.** A guard that runs only inside the final tool is insufficient if stale context can already affect dynamic instructions, model/tool selection, permission shaping or another load-bearing decision earlier in execution.

`requestContextSchema` is a candidate framework-supported enforcement surface to investigate, not an assumed solution. BT-3A must prove its actual behavior in the pinned version and must not infer security from schema presence alone.

## 5. BT-3A exact question

> After a genuine direct-Agent suspend, process loss and fresh-process resume, can the exact pinned Mastra realization execute with a complete current Conexus authority projection such that no stale persisted authority value — including an unknown/invalid authority-shaped key — can influence any load-bearing Agent decision before or during resumed execution?

This is the only question admitted by BT-3A.

## 6. Execution prerequisites

Before any Mastra-specific edit or probe, the executor must follow the permanent Conexus framework execution protocol:

```text
current Conexus authority
→ DevelopmentConexus Engineering Method
→ installed Mastra skill
→ Context7 /mastra-ai/mastra
→ exact pinned package source/config/lock
→ falsification strategy
→ RED control firing
→ GREEN/probe
→ Evidence
→ Architecture-Lead adjudication
```

If the Mastra skill is unavailable:

```text
STOP / MISSING EXECUTION PREREQUISITE
```

Context7 is current external Evidence only. Exact version claims must be checked against the locked package source and runtime behavior.

## 7. BT-3A probe constraints

BT-3A reuses the existing Package-B spike and exact lock. It must not add Product implementation or a new architecture component merely to make the probe pass.

Required environment:

```text
Node            = 24.18.0
@mastra/core    = 1.56.0
@mastra/memory  = 1.25.0
@mastra/pg      = 1.19.0
PostgreSQL      = 17.10
provider calls  = 0
model API calls = 0
E2B calls       = 0
real effects    = 0
```

The model remains a deterministic local fixture.

The probe must retain genuine:

```text
direct Agent
→ tool suspension
→ persisted snapshot
→ process A exits
→ process B starts
→ suspended run rediscovered
→ resume through supported direct-Agent API
```

No monkey patch, package fork, snapshot mutation through private tables, unsupported internal hook or Product-owner mini-implementation is admitted.

## 8. Falsification fixtures

### 8.1 Changed authority values

Suspend with an old complete authority projection such as:

```text
currentRole = SALES
workspaceId = W1
featureFlag = ON
```

Resume with a new complete authority projection:

```text
currentRole = FINANCE
workspaceId = W1
featureFlag = OFF
```

Every load-bearing observation point exercised by the probe must see only the current values.

### 8.2 Unknown stale authority-shaped key

The suspended snapshot must contain a key deliberately outside the admitted authority contract, for example:

```text
evilStaleAuthority = MUST_NOT_INFLUENCE
```

The negative control must prove that the unguarded pinned path would make the stale value observable.

The candidate realization must then prove one of the following before any governed decision can rely on it:

```text
unknown key is mechanically absent from the effective authority view
OR
execution fails closed before the unknown key can influence a load-bearing decision
```

Merely ignoring the key in the final tool is insufficient.

### 8.3 Authority value that becomes absent

Suspend with an optional authority fact present:

```text
connectionId = C1
```

Resume with the contract's explicit current absence representation, for example `null` only if the accepted authority contract permits that representation.

The resumed governed decision must never observe `C1` as current authority.

BT-3A must not invent an absence encoding; it must derive it from the relevant current Conexus authority.

## 9. Observation points

The executor must inspect the exact pinned source first and choose the smallest supported load-bearing surfaces that can prove whether stale context affects execution **before** the final tool.

At minimum, the probe must cover the currently selected direct-Agent path across:

```text
dynamic instructions/configuration surface
model-selection/configuration surface when RequestContext-sensitive
available tool/toolset or equivalent execution-shaping surface when RequestContext-sensitive
resumed tool execution
```

If the pinned API does not expose one of these surfaces in the assumed form, record the exact source finding and use the actual supported surface. Do not invent an API to satisfy this document.

The proof is about the ordering boundary:

```text
fresh current authority projection
must dominate
before any stale value can alter governed execution
```

## 10. RED control requirement

A trusted PASS requires a control that demonstrably fires.

BT-3A must first preserve/reproduce the unguarded stale-key behavior and show that the test detects stale influence.

Only then may the candidate bounded realization be applied and tested.

A test that never demonstrates the stale path is not sufficient Evidence.

## 11. Allowed verdicts

### `PASS_BOUNDED_REALIZATION`

Allowed only when all required observations prove:

```text
current complete authority values dominate
stale unknown authority cannot influence governed decisions
explicitly removed/absent authority cannot revive from snapshot
negative control fires
no unsupported/private mechanism is required
```

This verdict does **not** close BT-3 by itself because the previously stopped plain active-Agent crash characterization remains unexecuted.

### `FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT`

Use when framework-supported schema/native surfaces cannot prevent stale authority influence at the required boundary, while a bounded Conexus boundary adapter remains a plausible next alternative.

Consequence:

```text
STOP → Architecture Lead
```

No adapter is invented inside the spike without a new approved design.

### `FAIL_REALIZATION_MATERIAL`

Use when stale authority necessarily influences a governed decision before any supported reliable boundary can fence it, or when avoiding that requires private snapshot mutation, framework fork/patch or another materially different realization.

Consequence:

```text
STOP → Decision Loop / Architecture Lead + Operator
```

## 12. What BT-3A does not authorize

```text
BT-4 schedule probe                    = BLOCKED
BT-5 runtime-isolation probe           = BLOCKED
plain active crash characterization    = NOT PART OF BT-3A
Product implementation                 = BLOCKED
RuntimeContext service/module          = NOT AUTHORIZED
Mastra fork/patch                       = NOT AUTHORIZED
snapshot table mutation                 = NOT AUTHORIZED
provider/model calls                    = NOT AUTHORIZED
E2B calls                               = NOT AUTHORIZED
Package C execution                     = NOT AUTHORIZED
C-018                                   = NOT RATIFIED
PR #40 merge                            = NOT AUTHORIZED
```

## 13. Architecture consequence if BT-3A passes

A BT-3A PASS is evidence for a bounded realization correction, not permission to rewrite the architecture silently.

The Architecture Lead would then adjudicate whether to replace the overly literal mechanism wording with the more precise invariant:

```text
Conexus authority-bearing runtime context
= COMPLETE CURRENT REPLACEMENT PROJECTION FROM OWNER FACTS

Mastra may retain non-authoritative continuation/substrate context,
but persisted runtime context is never Product authority and cannot
influence a governed decision contrary to the current owner projection.
```

Only after that adjudication may the remaining BT-3 obligation, including plain active-Agent crash characterization, be authorized.

BT-4 remains blocked until BT-3 is fully adjudicated.

## 14. Package C relationship

The operator separately approved that advanced model benchmarking/calibration/automatic optimization is not part of the F1 critical qualification path and should be deferred safely while preserving the required seams and reopen triggers.

BT-3A does not perform that reconciliation. Package-C routing will be reconciled separately after Package B is stabilized so no current-authority contradiction is hidden.

## 15. Exact next action

The operator ratified this written discriminant on 2026-08-19 and authorized execution of BT-3A only:

```text
BT-3A = NEXT / EXECUTION AUTHORIZED
BT-4 = BLOCKED
BT-5 = BLOCKED
BT-3 plain active crash = NOT AUTHORIZED BY BT-3A
Package C = NOT AUTHORIZED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
merge = NOT AUTHORIZED
```

Execute the bounded BT-3A plan and return exact source/runtime Evidence for independent Architecture-Lead adjudication. Do not close BT-3 or continue into another probe/package by inheritance.
