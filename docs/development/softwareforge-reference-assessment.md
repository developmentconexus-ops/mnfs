# SoftwareForge Reference Assessment — Blueprint/Paved-Road Input

> **Status:** DESIGN INPUT / EVIDENCE SYNTHESIS / FABLE-ADJUDICATED / NOT PRODUCT AUTHORITY
> **Scope:** bounded assessment of SoftwareForge patterns that may strengthen the Conexus Blueprint Harness, Project Paved Road and future Builder execution envelope.
> **Decision boundary:** this document may influence later 4D/4F contracts only after exact admission. It creates no Product operation, semantic owner, durable record class, SDK API, Mastra workflow or implementation authority by itself.

## 1. Sources reviewed

Primary/current sources used for this assessment:

- `https://softwareforge.ai/`
- `https://softwareforge.ai/blog/ai-sdlc`
- `https://github.com/securefactory/forge-cursor-plugin`
- `https://github.com/securefactory/forge-cursor-plugin/blob/main/docs/forge-plugin-guide.html`

The public Cursor plugin is especially useful because it exposes operational mechanics beyond product marketing: Work Orders, project/journey context, artifact updates, ForgeScore, dev-activity synchronization, MCP tools, skills, rules and safety hooks.

SoftwareForge is a reference/Evidence source only. Its names, claims and mechanisms do not outrank Conexus repository authority.

## 2. Fable-reviewed disposition

Independent Fable review over exact candidate `e16edab6072ae551e491b39f080f4e7866c33f20` returned:

```text
SURVIVES WITH BOUNDED CORRECTIONS
```

Lead adjudication accepted material findings `RF-SF-01`, `RF-SF-03`, `RF-SF-04` and `RF-SF-05` because each closes a concrete false-authority or false-proof channel while shrinking the mechanism. No finding changes Product meaning, semantic owners, trust boundaries or the 46-record durable closure. No 4A, C-018 or Phase-3 reopen is justified. A second review round is not required because the corrections only narrow properties already attacked.

Final bounded disposition:

```text
D1 Authority Traceability Graph              = REFINE / KEEP
D2 Change Impact + Staleness Analysis         = KEEP
D3 WorkUnit execution context profile         = REFINE / KEEP
D4 Authority Drift Gate before SHARE          = REFINE / KEEP
D5 named/versioned Policy Pack concept        = DEFER
   digest-pinned constraint reference seam    = KEEP AS 4D CANDIDATE
D6 Brownfield Baseline Assessment             = DEFER UNTIL FIRST REAL BROWNFIELD PROJECT

single giant Living Specification owner       = REJECT
independent traceability/dependency owner      = REJECT
second context compiler for WorkUnits          = REJECT
unbounded `NO_DRIFT` proof claim               = REJECT
fixed PRD→BRD→Architecture pipeline universal = REJECT
human approval at every stage by ritual       = REJECT
named SecurityAgent as required architecture  = REJECT
local marker / dev-activity replay as truth   = REJECT AS AUTHORITY
```

## 3. D1 — Authority Traceability Graph

### Observed useful property

SoftwareForge maintains requirements traceability across specification, architecture and Work Orders, and its IDE workflow checks linked traceability during execution/commit work.

### Conexus adaptation

Conexus should preserve a **derived traceability manifest** over existing authorities rather than create a Traceability semantic owner.

Conceptual forward chain:

```text
Product intent / journey
→ semantic invariant
→ owner
→ Product operation / capability
→ Permission / scope
→ executable wire
→ UX interaction
→ Paved-Road protected property
→ implementation slice / WorkUnit
→ acceptance assertion
→ Evidence / test
→ canonical result commit
→ Release
```

Required reverse question:

```text
changed file / result commit
→ WorkUnit / assertion
→ wire / operation
→ owner
→ Product intent / invariant
```

### Binding invariants after `RF-SF-01`

The manifest is a `GENERATED`-class mechanism under the existing Project ownership model:

```text
canonical owner artifacts
→ deterministic traceability compilation
→ generated TraceabilityManifest
```

Therefore:

- the manifest is reproducible and never hand-owned or manually edited into authority;
- every edge consumed as **deciding** by Context Compiler, impact/staleness analysis, drift gate or another material gate carries exact source identity **and digest**;
- an edge without exact digest is non-deciding and no gate may rely on it for a positive claim;
- every deciding consumer verifies the manifest's recorded source digests against current canonical owner artifacts before use;
- any mismatch makes the manifest `STALE`; the consumer stops and requires regeneration/recompilation rather than continuing from the stale projection;
- absence of a required edge is a Finding/closure defect, not permission for the coding agent to infer intent;
- the manifest remains projection/Evidence mechanics and never becomes Product or owner truth by convenience;
- no new durable record class is admitted by this design input.

Working names such as `TraceabilityManifest` or `AuthorityTraceManifest` remain mechanism candidates only.

## 4. D2 — Change Impact and Staleness Analysis

### Observed useful property

SoftwareForge previews downstream impact before artifact updates and keeps related project artifacts connected rather than treating edits as isolated documents.

### Conexus adaptation

Before changing accepted authority, the system should derive the **smallest affected downstream set** from the fresh digest-pinned traceability projection.

Candidate disposition vocabulary remains design input only:

```text
UNAFFECTED
REVALIDATE
STALE
RECOMPILE
REOPEN
```

The exact semantics of those states belong to 4D/4F before any mechanism consumes them.

Example:

```text
ordinary Permission changes materially
→ affected operation authorization mapping
→ affected wire security contract
→ affected frontend interaction authorization
→ affected verification/golden-flow obligations
→ affected implementation slices
```

Binding law:

```text
impact/staleness = pure derived function of canonical artifact relationships
                 + fresh digest-pinned D1 edges
```

There is no independent user/model-editable dependency-edge surface. Adding such a surface would create the universal semantic dependency graph this decision rejects.

Non-property:

```text
any upstream text edit
-X-> invalidate entire project
```

The protected property is **minimal correct invalidation**, not maximum cascading ceremony.

## 5. D3 — WorkUnit execution context profile

### Observed useful property

SoftwareForge Work Orders carry bounded implementation context, dependencies, acceptance criteria and upstream intent to the coding agent.

### Conexus adaptation after `RF-SF-03`

Do not create a competing `WorkOrder` Product concept and do not create a second context compiler. Existing Builder authority remains:

```text
Project → Change → Plan → WorkUnit → ActorRun
```

There is exactly **one Hub-owned Context Compiler**. A future `WorkUnitExecutionEnvelope` is only the **WorkUnit-stage output profile** of that compiler, not a second compiler or authority artifact family.

Conceptually, the WorkUnit profile may expose:

```text
WorkUnitId / ChangeId
ContextManifest ref + digest
exact operation / wire / UX refs relevant to the slice
in-scope / out-of-scope surfaces
GENERATED / PLATFORM-CONTRACT / APP-OWNED mutation constraints
exact PavedRoadProfile identity
admitted dependency/version set
acceptance assertions
falsifiers / negative controls
required Evidence
prerequisites / blockers
```

Fact classes already owned by `ContextManifest` — for example `ProjectBaselineDigest`, upstream authority identities or stop/reopen conditions — are referenced by identity/digest rather than re-stated as a parallel mutable truth copy.

If a realization must materialize the same fact in two renderings, both are emitted in the **same compilation act from the same inputs**. Any detected divergence voids the compilation and requires recompilation; neither copy is adjudicated as truth.

The field inventory above is illustrative design input, not a frozen schema or API.

## 6. D4 — Authority Drift Gate before SHARE

### Observed useful property

SoftwareForge's plugin has pre-commit guards and traceability/activity checks around Work-Order commits.

### Conexus adaptation after `RF-SF-04`

Before canonical SHARE/result acceptance:

```text
candidate diff
+ exact WorkUnit-stage Context Compiler output
+ fresh TraceabilityManifest
+ current canonical authority
→ Authority Drift Check
```

Mechanically detectable candidate classes may include, when a detector is actually proven:

```text
new Product operation not admitted
new Permission not admitted
wire/DTO authority introduced in parallel
PLATFORM-CONTRACT weakened/bypassed
GENERATED surface hand-owned
schema/owner boundary crossed outside admitted slice
new dependency without admitted protected property
frontend interaction invents backend capability
```

The gate MUST NOT claim universal semantic understanding. Its positive Evidence is bounded:

```text
NO_DRIFT_DETECTED_IN_DECLARED_CLASSES
```

not an unqualified `NO_DRIFT` claim.

Binding laws:

1. the exact checked-class set is versioned/identified with the gate result;
2. each claimed drift class has a deterministic negative/RED fixture proving that detector can fire;
3. a class without a proven firing control is not included in positive coverage;
4. the gate consumes only a fresh D1 manifest whose deciding source digests revalidate against current canonical authority;
5. the gate result is Evidence/gate mechanics, never Change acceptance, Product truth or Release eligibility by itself;
6. semantic classes that cannot be mechanically detected remain for explicit review/falsification rather than being hidden behind heuristics that produce false confidence.

Failure remains:

```text
DRIFT_DETECTED
→ Finding / bounded stop
→ smallest owning replan/reopen path
```

A local marker file, hook pass or agent declaration is never correctness/acceptance authority.

## 7. D5 — digest-pinned constraint reference seam; `Policy Pack` concept DEFERRED

### Observed useful property

SoftwareForge carries security/compliance constraints through generated artifacts and Work Orders.

### Conexus adaptation after `RF-SF-05`

F1 does **not** admit a named `PolicyPack` Product/platform concept, pack authoring surface, propagation/inheritance model or prebuilt HIPAA/PCI/SOC2 engine without a real consumer.

Retain only the smallest possible seam as a future 4D candidate in the existing `ContextManifest` compiler, conceptually:

```text
constraintRefs / digests
verificationProfile
securityPropertyRefs
```

These field names remain illustrative, not frozen schema.

Rules:

- every deciding reference is exact/digest-pinned and provenance-preserving;
- referenced constraint content may **narrow** cognition/verification behavior but can never grant Product, tool, data, network or platform authority;
- all grants remain server-derived through existing Conexus capability/tool/current-owner authorization;
- prompt/context text is never an authorization source;
- applicability remains explicit and bounded;
- verification/gates protect exact properties, not policy-document volume.

Reopen the named pack/versioning/propagation model only when a real security/compliance consumer cannot fit the seam above.

## 8. D6 — Brownfield Baseline Assessment DEFERRED

### Observed useful property

ForgeScore assesses a legacy codebase before modernization planning.

### Conexus disposition after deletion challenge

Current F1 has no real brownfield Project that needs a separate assessment framework. Existing Inception already requires discovering current source/contracts/architecture/data reality.

Therefore:

```text
Brownfield Baseline Assessment framework = DEFER
ForgeScore-like fixed dimension model     = REJECT AS CURRENT REQUIREMENT
composite score as authority              = REJECT
```

At the first real brownfield Project, reopen only the Inception/profile seam. Any assessment dimensions must be derived from that Project/profile and bind to inspectable Evidence. A composite score, if ever useful, is UX projection only and never architecture or Release authority.

## 9. Existing Conexus strengths preserved

This assessment does not weaken current differentiators:

- repository current authority outranks research/history;
- one canonical home per meaning instead of one universal Living-Spec owner;
- semantic owners and trust boundaries remain explicit;
- `PlanningDepth × RigorProfile` avoids replaying a fixed enterprise document ceremony for every Change;
- operator judgment is requested only for real Product/architecture decisions, not every pipeline box;
- reviewer output remains Evidence, never automatic authority;
- Hub owns stage/gate/current authority; Mastra remains cognition/runtime mechanics;
- one Hub Context Compiler remains the only context-compilation mechanism;
- `GENERATED | PLATFORM-CONTRACT | APP-OWNED` remains the Project Paved-Road ownership model;
- Product implementation remains blocked through 4A–4G plus explicit execution authority.

## 10. SoftwareForge properties deliberately not added

Independent challenge found no missing stronger current property requiring admission. In particular:

```text
artifact-impact preview / stage staleness  → covered by D2
Work Order execution contract              → covered by D3 without new WorkOrder concept
traceability drift                         → D1 + D4
skills / hooks / rules distribution        → already a 4D Paved-Road/scaffold concern
policy inheritance                         → falls with D5 deferral
clarification/decision binding             → current decision refs + ContextManifest already cover the concrete need
```

No new concept is admitted merely because SoftwareForge names it.

## 11. Phase placement / reopen result

```text
4A      = unchanged; this decision adds no Product operation, principal, Permission or scope
4D      = future owner of D1/D2/D4 realization constraints and the D5 reference seam where admitted
4F      = future owner of the WorkUnit-stage compiled execution profile
C-018   = no reopen
Phase 3 = no reopen
```

These are Phase-4 design inputs only. 4D/4F are NOT STARTED, so the review does not reopen them; it bounds what may later be derived there.

## 12. Acceptance boundary

The SoftwareForge reference decision survives only in this bounded form:

```text
SoftwareForge reference
→ strengthens traceability / impact / execution-context / drift continuity
→ keeps traceability GENERATED and freshness-checked
→ keeps one Hub Context Compiler
→ emits only bounded, proven-firing drift Evidence
→ defers Policy Pack and brownfield frameworks until real consumers
→ creates no new Product semantic owner
→ creates no Product operation by reference
→ creates no durable record class
→ never makes research/traceability/context constraints current owner truth
→ remains staged for exact 4D/4F realization after upstream Product/wire/frontend contracts
```

Any later realization that violates one of those lines reopens only the smallest implicated Phase-4/owner decision.