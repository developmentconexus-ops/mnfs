# SoftwareForge Reference Assessment — Blueprint/Paved-Road Input

> **Status:** DESIGN INPUT / EVIDENCE SYNTHESIS / NOT PRODUCT AUTHORITY
> **Scope:** bounded assessment of SoftwareForge patterns that may strengthen the Conexus Blueprint Harness, Project Paved Road and future Builder execution envelope.
> **Decision boundary:** this document may influence later 4A/4D/4F contracts only after explicit admission. It creates no Product operation, semantic owner, durable record class, SDK API, Mastra workflow or implementation authority by itself.

## 1. Sources reviewed

Primary/current sources used for this assessment:

- `https://softwareforge.ai/`
- `https://softwareforge.ai/blog/ai-sdlc`
- `https://github.com/securefactory/forge-cursor-plugin`
- `https://github.com/securefactory/forge-cursor-plugin/blob/main/docs/forge-plugin-guide.html`

The public Cursor plugin is especially useful because it exposes operational mechanics beyond product marketing: Work Orders, project/journey context, artifact updates, ForgeScore, dev-activity synchronization, MCP tools, skills, rules and safety hooks.

SoftwareForge is a reference/evidence source only. Its names, claims and mechanisms do not outrank Conexus repository authority.

## 2. Overall verdict

SoftwareForge is materially closer to the Conexus problem than a conventional AI app builder. Its strongest transferable properties are not a fixed PRD/BRD pipeline or a named agent fleet; they are the continuity mechanisms connecting intent, specifications, architecture, implementation work and commit history.

The bounded Conexus disposition is:

```text
Authority Traceability Graph                 = ADOPT / ADAPT
Change Impact + Staleness Analysis            = ADOPT
WorkUnit Execution Envelope                   = ADAPT
Authority Drift Gate before SHARE             = ADOPT PROPERTY / OWN AUTHORITY MECHANISM
Versioned Policy Packs                        = ADAPT
Brownfield Baseline Assessment                = ADAPT / later profile

single giant Living Specification owner       = REJECT
fixed PRD→BRD→Architecture pipeline universal = REJECT
human approval at every stage by ritual       = REJECT
named SecurityAgent as required architecture  = REJECT
local marker / dev-activity replay as truth   = REJECT AS AUTHORITY
```

## 3. D1 — Authority Traceability Graph

### Observed useful property

SoftwareForge maintains requirements traceability across specification, architecture and Work Orders, and its IDE workflow checks linked traceability during execution/commit work.

### Conexus adaptation

Conexus should preserve a derived traceability graph/manifest over existing authorities rather than create a new Traceability semantic owner.

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

Properties:

- graph is derived from canonical owner artifacts; it is not a second source of semantic truth;
- every edge has exact source identity/digest where material;
- absence of a required edge is a Finding/closure defect rather than an invitation for the coding agent to infer intent;
- traceability supports context compilation, impact analysis, verification and review;
- no new durable record class is admitted by this design input.

Working names such as `TraceabilityManifest` or `AuthorityTraceManifest` are mechanism candidates only.

## 4. D2 — Change Impact and Staleness Analysis

### Observed useful property

SoftwareForge previews downstream impact before artifact updates and keeps related project artifacts connected rather than treating edits as isolated documents.

### Conexus adaptation

Before changing accepted authority, the system should derive the smallest affected downstream set from the traceability graph.

Candidate disposition vocabulary:

```text
UNAFFECTED
REVALIDATE
STALE
RECOMPILE
REOPEN
```

Example:

```text
ordinary Permission changes materially
→ affected operation authorization mapping
→ affected wire security contract
→ affected frontend interaction authorization
→ affected verification/golden-flow obligations
→ affected implementation slices
```

Non-property:

```text
any upstream text edit
-X-> invalidate entire project
```

The protected property is **minimal correct invalidation**, not maximum cascading ceremony.

## 5. D3 — WorkUnit Execution Envelope

### Observed useful property

SoftwareForge Work Orders carry bounded implementation context, dependencies, acceptance criteria and upstream intent to the coding agent.

### Conexus adaptation

Do not create a competing `WorkOrder` Product concept. Existing Builder authority remains:

```text
Project → Change → Plan → WorkUnit → ActorRun
```

4F/Builder should derive one machine-readable execution envelope for each admitted WorkUnit, conceptually:

```text
WorkUnitExecutionEnvelope
  WorkUnitId
  ChangeId
  ProjectBaselineDigest
  exact upstream authority refs/digests
  exact operation / wire / UX refs relevant to the slice
  in-scope surfaces
  out-of-scope surfaces
  GENERATED mutation law
  PLATFORM-CONTRACT mutation law
  APP-OWNED mutation law
  exact PavedRoadProfile identity
  admitted dependency/version set
  ContextManifest digest
  acceptance assertions
  falsifiers / negative controls
  required Evidence
  prerequisites / blockers
  stop / reopen conditions
```

The envelope is derived execution authority, not a place for the model to invent new Product meaning.

## 6. D4 — Authority Drift Gate before SHARE

### Observed useful property

SoftwareForge's plugin has pre-commit guards and traceability/activity checks around Work-Order commits.

### Conexus adaptation

Before canonical SHARE/result acceptance:

```text
candidate diff
+ exact WorkUnitExecutionEnvelope
+ current TraceabilityManifest
+ current authority
→ Authority Drift Check
```

It should detect classes such as:

```text
new Product operation not admitted
new Permission not admitted
wire/DTO authority introduced in parallel
PLATFORM-CONTRACT weakened/bypassed
GENERATED surface hand-owned
schema/owner boundary crossed outside envelope
new dependency without admitted protected property
frontend interaction invents backend capability
upstream semantic decision silently changed downstream
```

Outcome:

```text
NO_DRIFT
OR
DRIFT_DETECTED → Finding → STOP / smallest owning reopen
```

Conexus must not treat a local marker file, hook pass or agent declaration as correctness/acceptance authority. Hub-owned exact facts + Evidence decide admission.

## 7. D5 — Versioned Policy Packs

### Observed useful property

SoftwareForge carries security/compliance policies through generated artifacts and Work Orders.

### Conexus adaptation

Do not prebuild HIPAA/PCI/SOC2 policy engines for F1. Generalize only the useful property: exact versioned policy references can be compiled into context, Paved Road and verification when a Project/current property requires them.

Candidate additions to `ContextManifest`:

```text
policyPackRefs / digests
verificationProfile
securityPropertyRefs
```

A Policy Pack may represent platform engineering/security constraints, a Project-specific required standard or a future compliance profile.

Rules:

- policy text is versioned and provenance-preserving;
- prompt injection cannot widen policy authority;
- policy pack != Product business semantic owner;
- policy applicability is explicit and bounded;
- verification/gates protect properties, not policy-document volume.

## 8. D6 — Brownfield Baseline Assessment

### Observed useful property

ForgeScore assesses a legacy codebase before modernization planning.

### Conexus adaptation

Existing Project Inception already requires brownfield reality discovery. Strengthen the possible FULL/brownfield profile with an Evidence-backed dimensional assessment, for example:

```text
architecture topology / coupling
trust boundaries / security posture
dependency health
contract/API surface
data ownership and migration posture
test/verification posture
operational/deployment posture
semantic/domain clarity
change-risk concentrations / unknowns
```

Do not make one composite score authoritative.

```text
87 / 100
-X-> architecture acceptance
-X-> release eligibility
-X-> modernization truth
```

A score may later be a UX projection only if the underlying findings/evidence remain inspectable.

## 9. Existing Conexus strengths preserved

This assessment does not weaken current differentiators:

- repository current authority outranks research/history;
- one canonical home per meaning instead of one universal Living-Spec owner;
- semantic owners and trust boundaries remain explicit;
- `PlanningDepth × RigorProfile` avoids replaying a fixed enterprise document ceremony for every Change;
- operator judgment is requested only for real Product/architecture decisions, not every pipeline box;
- reviewer output remains Evidence, never automatic authority;
- Hub owns stage/gate/current authority; Mastra remains cognition/runtime mechanics;
- `GENERATED | PLATFORM-CONTRACT | APP-OWNED` remains the Project Paved-Road ownership model;
- Product implementation remains blocked through 4A–4G plus explicit execution authority.

## 10. Fable review target

Independent review should attack this exact decision, not SoftwareForge as a product review.

Material questions:

1. Does any proposed traceability/impact artifact duplicate an existing Conexus semantic owner or require a new durable record class prematurely?
2. Can the traceability graph become a dangerous second authority if edges drift from owner artifacts?
3. Is impact/staleness analysis actually derivable, or does it require an overly generic dependency graph that becomes a new platform domain?
4. Does `WorkUnitExecutionEnvelope` duplicate Plan/WorkUnit/ContextManifest authority or merely compile them safely for execution?
5. Can an Authority Drift Gate be meaningfully falsified without turning every commit into ceremony or blocking legitimate APP-OWNED evolution?
6. Are Policy Packs useful property carriers, or do they create a speculative compliance framework before a consumer exists?
7. Is Brownfield Baseline Assessment sufficiently bounded, or is it just ForgeScore renamed?
8. Are there stronger SoftwareForge properties we missed that fit existing Conexus owners without reopening C-018?
9. Did we copy any SoftwareForge mechanism where Conexus already has a stronger owner/current-authority model?
10. Does any correction require reopening 4A/4D/4F design only, or does it materially falsify accepted Phase-3 authority?

## 11. Acceptance boundary

This decision survives only if independent challenge supports the following bounded conclusion:

```text
SoftwareForge reference
→ strengthens Blueprint/Paved-Road execution continuity
→ does not create new Product semantic owners
→ does not create Product operations by reference
→ does not mandate new durable record classes
→ does not make research/traceability/policy projections current owner truth
→ remains staged for exact 4D/4F realization after upstream Product/wire/frontend contracts
```

If a material finding disproves one of those lines, reopen only the smallest implicated design input/Phase-4 contract.