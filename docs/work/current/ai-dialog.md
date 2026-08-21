# Fable Review — SoftwareForge → Conexus Blueprint/Paved-Road Decision

> **TEMPORARY REVIEW ARTIFACT — REVIEW BRANCH ONLY — MUST NEVER MERGE**

## Reviewer role

You are the independent adversarial reviewer for a bounded Conexus OS Phase-4 design decision.

Your output is **Evidence, not authority**. Do not add Product requirements by preference. Attack the candidate against current repository authority, YAGNI, Global Maximum, owner/trust boundaries and genuine downstream falsifiability.

## Exact candidate identity

Repository:

```text
developmentconexus-ops/conexus-os
```

Candidate branch reviewed:

```text
agent/4a-product-surface
```

Exact candidate HEAD:

```text
e16edab6072ae551e491b39f080f4e7866c33f20
```

This review branch was rebound from that exact HEAD before this temporary file was added. The only intended review-branch-only difference is this `docs/work/current/ai-dialog.md` file and your eventual review response appended here.

## Read route

Read strictly:

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ docs/development/softwareforge-reference-assessment.md
→ docs/development/blueprint-harness-design.md
→ docs/phases/4-implementation-readiness-program.md only if needed to resolve Phase-4 placement
```

Read current Product/architecture reference material only when a concrete finding requires it. Do not recursively re-read Phase-3 history/research by default.

SoftwareForge/Mitra/sibling repositories are Evidence/reference only. Current Conexus repository authority wins.

## Decision under review

The candidate proposes importing six bounded properties from SoftwareForge as Blueprint/Paved-Road design input:

```text
D1 Authority Traceability Graph
D2 Change Impact + Staleness Analysis
D3 WorkUnit Execution Envelope
D4 Authority Drift Gate before SHARE
D5 Versioned Policy Packs
D6 Brownfield Baseline Assessment
```

It explicitly rejects:

```text
new Traceability semantic owner
new WorkOrder Product concept
one universal Living-Spec owner
universal fixed PRD→BRD→Architecture pipeline
human approval at every stage by ritual
mandatory named SecurityAgent
local marker / dev-activity replay as correctness authority
new durable record classes merely to host these ideas
```

## Primary review question

> Does this bounded SoftwareForge-derived decision strengthen Conexus planning/execution continuity without creating duplicate authority, a speculative meta-platform, unbounded graph/policy machinery or implementation ceremony that violates current owners, YAGNI and the accepted Phase-4 staging?

## Required attack surface

### RF-SF-01 — traceability becomes second authority

Can a `TraceabilityManifest`/graph drift or be edited in a way that silently becomes more authoritative than the Product/owner artifacts it projects? If yes, identify the smallest required invariant/mechanical ownership rule. Do not invent a new owner unless current architecture truly cannot express it.

### RF-SF-02 — generic dependency graph overreach

Does impact/staleness analysis require a universal semantic dependency graph that becomes a new platform domain or duplicates existing exact references/digests? Test whether minimal invalidation can remain a derived function of canonical artifact relationships.

### RF-SF-03 — WorkUnit envelope duplicates authority

Does `WorkUnitExecutionEnvelope` duplicate Plan, WorkUnit, ContextManifest, Project Baseline or Paved-Road authority? Could two copies disagree? Prefer compilation/reference identity over copied mutable truth if sufficient.

### RF-SF-04 — drift gate becomes ceremony or false proof

Can an Authority Drift Gate genuinely detect unauthorized semantic expansion, or will it devolve into a marker/checklist that gives false confidence? Challenge false-negative and false-positive classes, and whether its output must remain Evidence/gate mechanics rather than acceptance truth.

### RF-SF-05 — Policy Packs create speculative compliance platform

Are versioned Policy Packs necessary as a general F1 concept, or should the design retain only an exact constraint-pack/profile seam until a real compliance/security consumer exists? Attack naming, scope, ownership, propagation and prompt-vs-authority risks.

### RF-SF-06 — Brownfield assessment is ForgeScore renamed

Does Brownfield Baseline Assessment add a real bounded Inception property, or does it create an unneeded scoring framework? Challenge whether dimensions should be fixed, project-derived or profile-specific.

### RF-SF-07 — missing stronger property

Is there a materially stronger SoftwareForge property in the reviewed source evidence that fits existing Conexus owners and should be represented, such as exact artifact-impact preview, traceability drift, work-order execution contracts, stage staleness, clarification/decision binding, skills/hooks/rules distribution or policy inheritance? Do not add it unless a current Conexus gap is concrete.

### RF-SF-08 — Phase placement

Verify each surviving property is routed to the smallest stage:

```text
4A = Product semantics/operations/Permissions only
4B = executable wire
4C = frontend interaction/UX proof
4D = Paved Road/runtime/scaffold/mechanism contracts
4E = composed coherence/golden flows
4F = implementation graph / WorkUnit execution contracts
4G = final adversarial readiness
```

Flag any proposal that contaminates 4A or prematurely selects 4D/4F mechanics.

### RF-SF-09 — C-018 / Phase-3 reopen test

Does any proposed property materially falsify an accepted Phase-3 owner, trust boundary, durable-record closure or architecture invariant? If not, explicitly say no Phase-3/C-018 reopen is justified. If yes, name the exact falsifier and smallest authority to reopen.

### RF-SF-10 — deletion challenge

For each D1–D6, ask:

```text
if deleted, what concrete current failure returns?
if retained, what is the smallest form that protects the property?
```

Recommend DELETE/DEFER when no current protected property survives that test.

## Required verdict format

Start with exactly one:

```text
SURVIVES
SURVIVES WITH BOUNDED CORRECTIONS
DOES NOT SURVIVE
```

Then provide:

1. **Material findings** — numbered `RF-SF-01`, `RF-SF-02`, ...; each must include evidence, impact, smallest correction, and whether it changes Product/owner/trust/durable-record authority.
2. **Non-material observations** — useful but not gate-blocking.
3. **Disposition table D1–D6** — `KEEP | REFINE | DEFER | DELETE` with one-line rationale.
4. **Reopen verdict** — exact statement for `4A`, `4D`, `4F`, `C-018`, and Phase 3.
5. **Second-round recommendation** — `YES` only if bounded corrections materially change the reviewed property enough that this review no longer covers it; otherwise `NO`.

## Hard constraints

- No Product implementation.
- No OpenAPI/frontend/runtime/SDK selection.
- No new Mastra package/version/API decision.
- No assumption that SoftwareForge marketing claims are true merely because published.
- No copying SoftwareForge nouns into Conexus unless semantic need independently exists.
- No reviewer-created Product requirement.
- No generic workflow/proof/recovery/traceability/policy owner by preference.
- No merge recommendation. Merge remains separate operator authority.

## Fable response

Append your review below this line, preserving the exact candidate SHA and verdict format.

---

## Fable independent review — SoftwareForge-derived Blueprint/Paved-Road decision

Reviewer: Claude (Fable 5), independent adversarial challenger.
Candidate reviewed: `developmentconexus-ops/conexus-os` branch `agent/4a-product-surface` at exact HEAD `e16edab6072ae551e491b39f080f4e7866c33f20`.
Review branch delta verified: `git diff e16edab..37e693c` touches only `docs/work/current/ai-dialog.md` (this file). The candidate decision consists of `docs/development/softwareforge-reference-assessment.md` (commit `df5c27b`) plus its two-line routing into `docs/index.md` (commit `e16edab`).

Read route followed: `AGENTS.md` → `docs/index.md` → `docs/roadmap.md` → `docs/development/softwareforge-reference-assessment.md` → `docs/development/blueprint-harness-design.md` → `docs/phases/4-implementation-readiness-program.md` (needed for RF-SF-08 placement resolution). No Phase-3 history was recursively re-read; no finding below required it.

This output is Evidence, not authority. No finding creates a Product requirement.

### Verdict

```text
SURVIVES WITH BOUNDED CORRECTIONS
```

The bounded disposition (six adapted properties, eight explicit rejections) is genuinely smaller than the SoftwareForge source it draws from, correctly refuses the strongest contamination vectors (Living-Spec owner, WorkOrder concept, marker-as-truth, named-agent fleet), and creates no Product operation, semantic owner, or durable record class. The corrections below close specific channels through which the adapted mechanisms could still silently acquire authority or emit false proof. All corrections are design-input-level bounds; none changes Product, owner, trust-boundary, or durable-record authority.

### 1. Material findings

#### RF-SF-01 — Traceability manifest can silently become deciding authority through staleness and the "where material" escape hatch

**Evidence.** `softwareforge-reference-assessment.md` §3 states "every edge has exact source identity/digest **where material**" and "graph is derived from canonical owner artifacts; it is not a second source of semantic truth." §6 then makes the "current TraceabilityManifest" a direct input to the Authority Drift Check. Nothing in the candidate states (a) who may regenerate the manifest, (b) that hand-editing it is forbidden, or (c) what happens when the manifest's recorded source digests no longer match the current owner artifacts.

**Impact.** The manifest is consumed by exactly the mechanisms (context compilation, impact analysis D2, drift gate D4) that decide what downstream actors see and what passes SHARE. A stale or hand-adjusted manifest therefore *functions* as authority regardless of the document's declaration that it is not one — the declared property is currently unfalsifiable. Worst concrete failure: owner artifact changes → manifest not regenerated → D4 compares the candidate diff against the stale projection → `NO_DRIFT` emitted for a diff that drifts from *current* authority. The "where material" qualifier compounds this: an edge without a digest cannot be checked for staleness at all, and no rule says which edges may omit digests.

**Smallest correction.** Three invariants added to the assessment (D1/D4 sections), no new owner and no new record class:

1. The manifest is `GENERATED`-class under the already-accepted ownership model: reproducible by deterministic compilation from exact owner artifacts, never hand-owned. The existing `GENERATED` mutation law already expresses this; the candidate merely needs to bind the manifest to it.
2. Every edge consumed as deciding by any gate or compiler carries exact source identity + digest. Drop "where material", or define it as exactly this rule — an undigested edge is by definition non-deciding and no gate may rely on it.
3. Freshness law: a consumer (D2 impact derivation, D4 drift gate, context compilation) MUST verify the manifest's recorded source digests against current owner artifacts before use; mismatch → manifest is `STALE` → consumer stops, it does not proceed on the stale projection.

**Authority change:** none. Uses the existing `GENERATED` classification; adds no owner, operation, or durable record.

#### RF-SF-03 — WorkUnitExecutionEnvelope and ContextManifest are two overlapping compiled-context mechanisms that can disagree

**Evidence.** `blueprint-harness-design.md` §6 defines `ContextManifest` with task/stage identity, `ProjectBaselineDigest`, exact owning authority refs/digests, permitted tool set, output contract, stop/reopen conditions. `softwareforge-reference-assessment.md` §5 defines `WorkUnitExecutionEnvelope` with WorkUnit/Change identity, `ProjectBaselineDigest`, exact upstream authority refs/digests, admitted dependency set, acceptance assertions, stop/reopen conditions — and a `ContextManifest digest` field, i.e. the envelope both *references* the manifest and *re-carries* several of the same fact classes beside it.

**Impact.** Two Hub-compiled artifacts asserting overlapping facts (baseline digest, authority refs, stop conditions) about the same WorkUnit is exactly the "two copies disagree" failure the review question names. If they diverge — compiled at different times, from different authority states — the executing agent and the D4 gate may consume different truths, and no rule in the candidate says which one wins or that divergence is even detectable. This also quietly grows a second compilation mechanism where the Blueprint design deliberately built one.

**Smallest correction.** One sentence of mechanism law in the assessment (D3 section): there is exactly one Hub-owned context-compilation mechanism; `WorkUnitExecutionEnvelope` is the WorkUnit-stage output profile of that compiler, not a second compiler. Fact classes present in the referenced ContextManifest appear in the envelope only as ref + digest, never re-stated as parallel content; any field that must be materialized in both is compiled in the same compilation act from the same inputs. On any detected divergence the compilation is void and recompiled — neither copy is adjudicated as truth.

**Authority change:** none. Both artifacts remain mechanism candidates; the correction removes a duplication channel, adds nothing.

#### RF-SF-04 — `NO_DRIFT` as stated is an unbounded claim the gate cannot honestly make

**Evidence.** §6 lists nine drift classes and a binary outcome `NO_DRIFT | DRIFT_DETECTED`. The listed classes differ enormously in mechanical detectability: "new Permission not admitted" is checkable against a closed ledger; "upstream semantic decision silently changed downstream" and semantic widening *inside* an already-admitted APP-OWNED operation are not mechanically detectable in general. The candidate correctly demotes markers/hooks from acceptance authority but places no bound on what `NO_DRIFT` asserts.

**Impact.** An unbounded `NO_DRIFT` is precisely the "marker that gives false confidence" the candidate says it rejects — the false-negative surface (in-operation semantic expansion, natural-language authority edits, renamed surfaces evading diff heuristics) is structural, not incidental. Conversely, over-broad heuristics attempting the undetectable classes will false-positive on legitimate APP-OWNED evolution and turn the gate into the ceremony the decision explicitly rejects. Both failure modes flow from the same root: the gate's coverage is undeclared.

**Smallest correction.** Two bounds, both instances of existing method law rather than new machinery:

1. Coverage declaration: the gate's output is Evidence of the form "no drift detected **in the declared checked classes**", with the checked-class list versioned alongside the gate. `NO_DRIFT` is never a total absence claim, and acceptance remains Hub-adjudicated facts + Evidence (which the candidate already states).
2. Proven-firing law: each declared drift class ships with a negative/RED fixture proving its detector fires, per the existing rule in `AGENTS.md` ("Prove controls can fire… a control that cannot be shown to fire is not proven"). A drift class without a firing proof may not appear in the declared coverage list.

Note the dependency: this gate consumes the D1 manifest, so RF-SF-01's freshness invariant is load-bearing here — without it, correction (1) is insufficient because even declared classes are checked against a stale projection.

**Authority change:** none. Gate output remains Evidence/mechanics; adjudication authority stays where the candidate already put it.

#### RF-SF-05 — "Versioned Policy Packs" names a concept whose only current need is three reference fields

**Evidence.** §7 rejects prebuilt HIPAA/PCI/SOC2 engines and reduces the adaptation to candidate `ContextManifest` fields (`policyPackRefs/digests`, `verificationProfile`, `securityPropertyRefs`) — yet still carries "Policy Pack" as a named F1-adjacent concept with versioning, propagation, applicability, and inheritance semantics gestured at. No current Conexus consumer requires a *pack* concept: platform engineering/security constraints are already carried by the authority router and the 4D-B Verification Kit properties; no Project-level compliance profile exists in F1 scope.

**Impact.** A named, versioned, propagating "Policy Pack" concept with no consumer is the seed of exactly the speculative compliance platform the review question warns about, and the Method's "prepare the seam, not the entire future capability" law cuts against it directly. Additionally, the stated rule "prompt injection cannot widen policy authority" is under-specified: compiled policy text sits in the model's context and is prompt-adjacent by construction.

**Smallest correction.** Retain only the seam: the three digest-pinned reference fields on ContextManifest, as candidates for 4D. `DEFER` the "Policy Pack" noun, versioning/propagation/inheritance model, and any pack-authoring surface until a real compliance/security consumer names a property. State the injection rule mechanically: referenced policy content may only *narrow* permitted behavior; all *granting* remains server-derived tool/capability authorization (which `blueprint-harness-design.md` §14.4 already establishes) — policy text compiled into context is constraint input to cognition and verification, never an authorization source.

**Authority change:** none; this shrinks the candidate.

### 2. Non-material observations

1. **D2 disposition vocabulary is undefined but correctly staged.** The semantic difference between `REVALIDATE`, `STALE`, and `RECOMPILE` is nowhere defined. Acceptable in a design input; 4D/4F must define them exactly before any mechanism consumes them. No action now.
2. **D2 needs one guard inherited from RF-SF-01:** invalidation must remain a pure derived function over D1's digest-pinned edges. No artifact may declare ad-hoc dependency edges outside its owner-artifact relationships — an independent edge-declaration surface would be the "universal semantic dependency graph" reopened through the side door. Worth one sentence when D2 is next touched; not gate-blocking because the candidate already states derivation from the traceability graph.
3. **D3/D5 field lists read as more decided than they are.** The envelope field list and ContextManifest additions are labeled candidates, but their concreteness invites later actors to treat them as settled 4D/4F selections. A one-line "field inventories are illustrative, not schema decisions" note would remove the ambiguity. (Flagged under RF-SF-08 discipline; the documents' status banners already provide partial protection.)
4. **D6's dimension list should stay project-derived.** If D6 is ever activated, fixed universal dimensions would repeat ForgeScore's shape; the dimensions should be derived per-Project from the Inception profile and each must bind to inspectable Evidence. Moot while deferred.
5. **Routing is correct.** The `docs/index.md` placement (commit `e16edab`) routes the assessment as add-only-when-needed reference under the Blueprint row and as a durable supporting route — consistent with the router's minimal-context law. No correction.
6. **RF-SF-07 answer — no missing stronger property.** I checked the remaining SoftwareForge surface named in the review contract: exact artifact-impact preview and stage staleness are D2; work-order execution contracts are D3; traceability drift is D1+D4; skills/hooks/rules distribution is already owned by the 4D Paved-Road/scaffold design; policy inheritance falls with the D5 deferral. The closest genuine candidate is **clarification/decision binding** (binding operator answers to the artifacts that consumed them), but Conexus already expresses this through the decision register plus ContextManifest "exact accepted decision refs" — no concrete current gap exists, so admission is not justified.

### 3. Disposition table D1–D6

| Property | Disposition | Rationale |
| --- | --- | --- |
| D1 Authority Traceability Graph | **REFINE** | Keep as derived, `GENERATED`-class, digest-pinned manifest (RF-SF-01 invariants). Deletion test: 4C/4E/4G coverage proofs (orphan/invented-operation = 0) have no mechanical substrate without it. |
| D2 Change Impact + Staleness | **KEEP** | Pure derived function over D1 edges; no independent dependency surface. Deletion test: authority edits either cascade into full re-review or silently under-invalidate — a staleness class this repository has already paid for (e.g., C-015 projection into references). |
| D3 WorkUnit Execution Envelope | **REFINE** | Keep the property; make the envelope the WorkUnit-stage profile of the single Hub context compiler, refs-not-copies (RF-SF-03). Deletion test: ad-hoc execution context returns the exact invention failure Phase 4 §2 exists to prevent. |
| D4 Authority Drift Gate | **REFINE** | Keep as Evidence-emitting mechanical pre-check; bound `NO_DRIFT` to declared, proven-firing classes (RF-SF-04). Deletion test: drift detection collapses onto human review alone at SHARE. |
| D5 Versioned Policy Packs | **REFINE / DEFER** | Keep only the three digest-pinned ContextManifest seam fields; defer the pack concept, versioning/propagation model, and naming until a real consumer exists (RF-SF-05). Deletion test on the concept: no current failure returns — seam suffices. |
| D6 Brownfield Baseline Assessment | **DEFER** | No brownfield Project exists in F1 scope; Budget Analyzer is greenfield-on-platform. Deletion test: no current failure returns. Existing Inception discovery obligation already covers the present need; revisit at first real brownfield Project with per-dimension Evidence, score as UX projection only. |

### 4. Reopen verdict

```text
4A      — NO REOPEN. The candidate adds no Product operation, principal, Permission,
          scope, or vocabulary; it does not contaminate the three 4A census surfaces.
          4A continues unchanged.
4D      — NO REOPEN REQUIRED; corrections RF-SF-01/03/04/05 land in the two design-input
          documents and flow into 4D-B/4D-D when those closures are drafted. 4D is
          NOT STARTED, so nothing is reopened.
4F      — NO REOPEN. D3's envelope law is input to a stage that has not started.
C-018   — NO REOPEN. No finding falsifies the ratified Product/architecture target,
          an owner, a trust boundary, or downstream falsifiability. All six properties
          are derived mechanisms over existing authority.
Phase 3 — NO REOPEN. No accepted 3A–3O invariant, durable-record closure, or
          qualification conclusion is contradicted by any finding above.
```

### 5. Second-round recommendation

```text
NO
```

Every correction narrows or bounds the reviewed properties (freshness/digest invariants, single-compiler law, declared gate coverage, seam-only D5, deferred D6); none introduces a new mechanism, owner, or property this review has not already attacked. The corrected candidate remains inside the coverage of this challenge.

No merge recommendation is made; merge remains operator authority.

---
