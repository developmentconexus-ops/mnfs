# 3L Package B — BT-3A Architecture-Lead Adjudication

**Status:** `LEAD ADJUDICATED / FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT / BOUNDED REALIZATION DESIGN REQUIRED`  
**Phase:** 3L — Technology Qualification  
**Scope:** Package B — Product Agent + Cross-Runtime  
**Observed executor HEAD:** `61346a6acf4096d42ae138a4f362af557c97f843`  
**BT-3A spec:** [3L-B-BT3A-context-authority-discriminant.md](3L-B-BT3A-context-authority-discriminant.md)  
**Source Evidence:** `spikes/conexus-3l-b/evidence/bt3a-source.json`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  

> **Current route:** this adjudication remains historical Evidence. [3L-R1](3L-R1-framework-native-proportional-qualification-rebaseline.md) ratified the bounded framework-native correction; `BT-3N` is next and no BT-4N/BT-5N authorization is inherited.

## 1. Adjudication

The BT-3A source gate **falsified the proposed native `requestContextSchema` realization before a guarded runtime candidate was worth implementing**.

Architecture-Lead verdict:

```text
BT-3A source discriminant                 = COMPLETE
proposed native schema/closed-view path   = NOT SUPPORTED AT REQUIRED BOUNDARY
runtime guarded candidate                 = NOT EXECUTED BY DESIGN
BT-3A verdict                             = FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT
architecture contradiction               = NOT ESTABLISHED
Mastra incompatibility                    = NOT ESTABLISHED
bounded realization alternative          = PLAUSIBLE / DESIGN REQUIRED
BT-3                                      = OPEN
BT-4                                      = BLOCKED / NOT EXECUTED
BT-5                                      = BLOCKED / NOT EXECUTED
Package B                                 = IN PROGRESS
C-018                                     = NOT RATIFIED
Product implementation                    = BLOCKED
merge                                     = NOT AUTHORIZED
```

This is a **bounded realization finding**, not permission to reopen Product meaning, create a new service, fork Mastra, mutate framework snapshots or weaken the stale-authority invariant.

## 2. Evidence accepted

Against the exact Package-B closure:

```text
Node              = 24.18.0
@mastra/core      = 1.56.0
@mastra/memory    = 1.25.0
@mastra/pg        = 1.19.0
Package-B lock    = sha256:5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
```

The executor recorded exact installed-source hashes:

```text
@mastra/core/dist/agent-3cYAz4qr.js
sha256:871818d21f0ceaadeac9848f72687ccbc0133acec10d2b4b5dbf2cb56b64932d

@mastra/schema-compat/dist/chunk-VNIPWNNH.js
sha256:4b302264b2f51d562c8b5f05fa5e1c5a00491c28becc63fd0890206970f09689
```

The deciding source ordering is:

```text
fresh caller RequestContext
→ early Agent default/model/instruction/tool shaping
→ workflow resume
→ snapshot keys missing from fresh RequestContext are backfilled
→ merged RequestContext reaches execution engine / resumed tool
```

For the proposed native candidate, the exact source also shows:

```text
post-merge requestContextSchema execution = NONE
schema validation.value used as closed execution view = NO
plain Standard Schema candidate provides required closed projection = NO
```

The source gate therefore reached the stop condition defined by the approved BT-3A contract. Continuing to implement a guarded runtime fixture around that falsified native hypothesis would have produced ceremony, not stronger Evidence.

## 3. What this does and does not prove

### KNOWN

```text
Mastra direct-Agent continuation may preserve/backfill persisted RequestContext keys.
Fresh same-key caller values win where supplied.
The proposed requestContextSchema path does not provide a post-merge closed replacement authority view in the exact pinned realization.
The executor correctly stopped before inventing an adapter or unsupported framework mechanism.
```

### NOT PROVEN

```text
Mastra as a Product Agent runtime is incompatible with Conexus.
A small Conexus-owned authority projection boundary cannot safely realize the invariant.
A process split is required.
BT-4 schedule behavior.
BT-5 Builder/PAR same-process isolation.
Plain active-Agent crash behavior.
```

No runtime candidate test was executed after the source gate. Do not describe BT-3A as a runtime failure.

## 4. Protected invariant remains unchanged

The load-bearing requirement remains:

```text
No stale runtime/snapshot value may become current Conexus authority
or influence a current permission, tool, model, binding, approval,
identity or other governed Product decision after dispatch/resume.
```

The finding challenges the earlier **mechanism wording** that expected the Mastra `RequestContext` object itself to behave as whole-replacement authority state.

Method law:

```text
Mechanism != Authority
```

Mastra continuation state may exist only as subordinate runtime substrate. It cannot become Product authority by persistence or convenience.

## 5. Smallest sustainable realization direction for operator review

The next design question should separate Mastra continuation context from Conexus authority explicitly:

```text
Mastra RequestContext
= non-authoritative continuation/runtime substrate

Conexus CurrentRuntimeAuthorityProjection
= closed + complete + current projection rebuilt from authoritative owner facts
```

A candidate bounded realization may therefore be:

```text
current Conexus owner facts
→ construct complete closed authority projection
→ supply all current authority-bearing keys on every dispatch/resume
→ explicit current absence for optional authority facts where the accepted contract permits it
→ Mastra continuation mechanics
→ governed Conexus boundary consumes only the closed current projection
→ arbitrary/stale raw RequestContext keys are never permission/tool/model/binding/approval authority
```

This direction is **not yet authorized for implementation or probing**. It requires operator ratification of the bounded realization correction and a new exact discriminating proof contract.

The preferred shape, if ratified, is a small boundary constructor/value-object/adapter using already-owned facts. It must not become a generic `RuntimeContextService`, new database, new owner or cross-runtime bus merely to work around Mastra.

## 6. Required next proof if the bounded correction is ratified

A follow-up discriminant should answer only:

> Can a small Conexus-owned current-authority projection boundary make every governed decision consume current owner-derived authority while stale Mastra continuation keys remain physically possible but semantically inert?

It must prove ordering across the exact pinned direct-Agent path, including that:

```text
early dynamic instructions/model/tool shaping sees complete fresh current values
optional authority removal cannot revive a stale same-key value
unknown stale raw keys never participate in governed Product decisions
resumed tool/effect admission consumes the closed Conexus authority projection, not arbitrary RequestContext.all
no Product effect can occur between snapshot merge and the Conexus authority boundary without revalidation
```

If this cannot be proven using public/stable framework surfaces plus a bounded Conexus boundary, then the finding escalates to `FAIL_REALIZATION_MATERIAL` and enters the Decision Loop.

## 7. Explicit non-authorizations

Until a new operator-ratified proof contract exists:

```text
BT-3 continuation probe                = NOT AUTHORIZED
BT-4                                    = BLOCKED
BT-5                                    = BLOCKED
boundary adapter implementation         = NOT AUTHORIZED
3H-03 wording change                    = NOT YET RATIFIED
Mastra fork/patch                       = NOT AUTHORIZED
private snapshot mutation               = NOT AUTHORIZED
new runtime/context service             = NOT AUTHORIZED
provider/model calls                    = NOT AUTHORIZED
E2B calls                               = NOT AUTHORIZED
Package C execution                     = NOT AUTHORIZED
C-018                                   = NOT RATIFIED
Product implementation                  = BLOCKED
PR #40 merge                            = NOT AUTHORIZED
```

Package C's separately operator-approved `DEFER SAFELY` direction remains pending a bounded authority reconciliation after Package B stabilizes.

## 8. Verification state

At executor HEAD `61346a6acf4096d42ae138a4f362af557c97f843`, fresh PR workflow runs were all successful:

```text
Conexus 3L Package A Lock Bootstrap = SUCCESS
Conexus 3L Package B                = SUCCESS
Documentation                        = SUCCESS
Conexus 3L Package A                = SUCCESS
```

Green CI proves repository/verifier coherence at that HEAD. It does **not** convert the BT-3A source finding into a PASS.

## 9. Current Architecture-Lead status

```text
CURRENT ARCHITECTURE                  = NOT REOPENED
PROTECTED STALE-AUTHORITY INVARIANT   = CONFIRMED
NATIVE SCHEMA REALIZATION             = REJECTED FOR THIS BOUNDARY
NEXT REALIZATION DIRECTION             = BOUNDED AUTHORITY-PROJECTION BOUNDARY / OPERATOR REVIEW REQUIRED
PACKAGE B                              = IN PROGRESS
```

After operator ratification, the current router/LEDGER must be projected to this adjudication before any next probe executes.
