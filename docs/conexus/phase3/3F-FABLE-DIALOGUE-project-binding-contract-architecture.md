# 3F — ChatGPT ↔ Fable Dialogue — Project Binding Contract Architecture

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-04 — Project Binding Contract Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Important:** this file is review/co-design provenance only. It is not authority, does not approve 3F-04, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Dialogue protocol

1. Reconstruct authority from `AGENTS.md` and its required read chain before treating this file as input.
2. Immediate authority for this decision includes at minimum:
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/24-arquitetura-system-design.md` — especially 3B-15;
   - `docs/conexus/phase3/3B-16-project-internal-resource-ownership.md`;
   - `docs/conexus/phase3/3C-04-project-module-boundary.md`;
   - `docs/conexus/phase3/3C-06-artifact-registry-module-boundary.md`;
   - `docs/conexus/phase3/3C-07-connections-module-boundary.md`;
   - `docs/conexus/phase3/3C-09-brain-module-boundary.md`;
   - `docs/conexus/phase3/3C-11-release-module-boundary.md`;
   - `docs/conexus/phase3/3D-03-application-use-case-orchestration.md`;
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`;
   - `docs/conexus/phase3/3F-01-contract-surface-classification-versioning-boundary.md`;
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`;
   - C-011 and C-014 where Brain binding and Release composition are authority.
3. Previous decisions are baseline, not dogma. Reopen only for a Material Finding with a concrete failure class and globally better correction.
4. Fable is challenger/reviewer, not authority. Operator approval is the authority boundary.
5. Preserve YAGNI. No `GenericBinding`, `BindingEngine`, generic slot registry, environment registry, policy engine or resource-binding framework without a current consumer.
6. `ProjectBrainBinding` and `ProjectConnectionBinding` are already approved as **distinct typed contracts**. Similarity does not authorize a common payload/base class.
7. This decision may freeze semantic contract shape and exact-ref laws; literal TypeScript/HTTP/OpenAPI field inventory remains implementation detail unless a failure class requires exact representation now.
8. If any claim depends on current Mastra behavior, use Context7 `/mastra-ai/mastra` and the Mastra skill before relying on it. This Round 1 makes no current-Mastra claim.
9. Do not modify approved authority or `LEDGER.md` while dialogue is unresolved.
10. No product implementation, merge or PR readiness.

Goal:

> Freeze the smallest typed contracts by which a Project explicitly chooses a Brain revision and concrete Connection revisions for its own consumer contexts, while preserving same-Workspace isolation, exact pinning, Git-vs-Hub authority, Release immutability, fail-closed resolution and zero generic binding machinery.

---

# Round 1 — ChatGPT

## 1. Authority already fixed before 3F-04

### 1.1 Project owns binding intent

3C-04 freezes:

```text
Project
= software identity + approved intent + explicit bindings
```

and specifically:

```text
Project owns ProjectBrainBinding
Project owns ProjectConnectionBinding
```

while specialized owners retain resource semantics:

```text
Brain       → reusable semantic resource + binding semantic validation
Connections → Connection identity/revision/qualification/health
Release     → exact promoted/served composition
```

Changing Project intent does **not** mutate an already active Release.

### 1.2 3B-15 explicitly rejects a generic resource-binding model

F1 authority is:

```text
Workspace owns resource
Project owns binding
```

with only two typed families:

```text
ProjectBrainBinding
ProjectConnectionBinding
```

and explicitly rejects:

```text
workspace_resources
resource_bindings
resource_type
subject_type
binding_payload
GenericProjectBinding
DSL genérica de binding
```

A third resource type would receive its own concrete contract after a real consumer exists.

### 1.3 ProjectConnectionBinding already has load-bearing properties

3B-15 + 3C-07 + 3E-02 freeze:

```text
project
project-local symbolic slot / purpose
consumer environment/surface
Connection identity
EXACT ConnectionRevision ref
```

and:

```text
Connection qualified != Project authorized to use it
Connection healthy    != operation permitted
binding exists        != Release/runtime authorized
```

Both `connection_id` and the exact revision ref are Tier-3 opaque refs; no cross-owner FK is introduced.

3B-15 also freezes:

```text
slot: erp.primary
workspace/DEV → Sankhya homologation
preview       → Sankhya homologation
PROD          → Sankhya production
```

with no inference by name and no fallback to “the only available Connection”.

### 1.4 ProjectBrainBinding already has content semantics

C-011 / 3B-15 / 3C-09 freeze that a Project Brain binding carries consumer-specific semantic implementation, including equivalent concepts to:

```text
logical IDs used
logical → local implementation mapping
conformance assertions
explicit refinements / overrides
binding digest
```

while:

```text
BrainRevision / BrainPack
→ Workspace-scoped reusable meaning

brain-binding/v1
→ Project-scoped authored binding contract
```

Artifact Registry already has a concrete Project-scoped kind:

```text
brain-binding → brain-binding/v1
```

No corresponding `connection-binding` artifact kind exists or was approved.

### 1.5 Data Architecture already materialized two different durable records

3E-02 owns in `prj`:

```text
brain_binding
connection_binding
```

and explicitly says:

```text
no GenericProjectBinding
no settings bag
```

For Connection binding, exact `ConnectionRevision` pin is mandatory.

For Brain binding, the known Tier-3 relationship is through binding/revision digests, not cross-schema FK.

### 1.6 SetProjectBinding is already one named L7 flow

3D-03 keeps one control-plane orchestration flow:

```text
SetProjectBinding
```

because:

```text
specialized owner validates/explains applicable compatibility
→ Project records consumer-specific binding intent
```

Set-time validation is fail-early/UX. It is **not** the only correctness gate: Release/conformance/runtime owners revalidate what must still be true before serving/execution.

### 1.7 Environment model is small

3B-16/C-014 freeze current relevant consumer contexts as:

```text
DEV                  persistent Project development environment
RunPreview           ephemeral review surface
PROD                 persistent promoted target
```

F1 has no generic EnvironmentModule/registry.

Production runtime does not dynamically choose current Project bindings:

```text
PUBLISHED_APP → active Release pins
AGENT_RUN     → run-pinned composition
```

Builder/candidate work may use current Project intent.

---

## 2. Central failure classes 3F-04 must close

### A. Generic binding erases domain-specific meaning

```text
GenericBinding {
  resourceType
  resourceId
  payload
}
```

would make Connection target/environment, Brain logical mappings, qualification/conformance and version rules runtime-dispatched metadata rather than typed invariants.

### B. Connection live inheritance

```text
slot erp.primary → Connection C
C gets new revision R9
→ Project silently starts using R9
```

violates the exact ConnectionRevision pin.

### C. Environment fallback

```text
PREVIEW binding absent
→ resolver chooses PROD because it is available
```

can leak production effects/data into Preview.

### D. Historical mutation

```text
Release R17 referenced a Project binding
→ Project admin edits the same binding row in place
→ R17 now resolves different semantics
```

destroys Release immutability and rollback explainability.

### E. Duplicate Connection truth in the binding

Copying into Project state:

```text
external environment
health
qualification
credential ref
ConnectorDefinition metadata
operation classification
```

creates stale mirrors of Connections/Registry authority.

### F. Brain binding payload duplicated in Hub

If `brain-binding/v1` already contains logical mappings/assertions/refinements, copying the whole semantic payload into `prj.brain_binding` creates two authorities that can drift.

### G. Brain live inheritance

```text
Project binding uses Brain BR-12
BR-13 becomes AVAILABLE
→ Project silently changes meaning
```

violates C-011/3B-15.

### H. Lost update in Control Plane

Two administrators concurrently replace the same slot/current Brain binding. A blind last-writer-wins update can silently erase the other accepted intent.

### I. Binding mistaken for permission

Binding to a Connection must not become an operation allowlist, credential grant or bypass of Gateway/Release/policy gates.

### J. Source/authority ambiguity

3B-16 says Project bindings/config contracts are authored in Git, while Project Hub state governs operational/current intent. 3F-04 must avoid both:

```text
latest Git file == active binding authority
```

and:

```text
Hub binding with no reproducible source/provenance
```

where authoring is required.

---

## 3. Candidate principle — two contracts, no common binding payload

Working model:

```text
ProjectConnectionBinding
!=
ProjectBrainBinding
```

They may share only cross-cutting **laws**, not a shared DTO/base aggregate:

```text
Project-owned current intent
same-Workspace fail-closed
exact version/ref pinning
historical immutability
CAS-protected current replacement
Release freezes exact composition
no implicit fallback/live inheritance
```

No:

```text
Binding<T>
BindingResourceRef
BindingPayload
BindingKind registry
BindingResolver framework
```

unless Fable proves a current failure class requiring one.

---

## 4. Candidate `ProjectConnectionBinding` semantics

### 4.1 One binding version represents one exact resolution

Candidate semantic version:

```text
ProjectConnectionBinding
  project
  slot
  consumerTarget
  connectionId
  exact ConnectionRevisionRef
  source provenance as required by Project Git authoring
```

A historically referenced version is immutable.

Changing any load-bearing value creates a **new binding version/ref**, not an in-place edit of a version already referenced by Release/evidence.

This does **not** require a new durable record class beyond `prj.connection_binding`; 3F-04 is defining the semantics of records/refs already admitted by 3E.

### 4.2 `slot` is the Project-local purpose identity

I propose collapsing the two conceptual terms:

```text
purpose
project-local symbolic slot
```

into one stable Project-local semantic key:

```text
erp.primary
marketplace.primary
```

The binding does **not** also carry an independent free-form `purpose` that can disagree with `slot`.

Rules:

```text
slot is stable Project-local identity
slot name is not Connection identity
slot name is not permission
slot name is never interpreted by fuzzy/name matching
```

There is **no universal slot catalog**.

The exact declaration of which slots a Project requires and what connector/type constraints they expect belongs naturally to the Project Config Contract decision later in 3F. Until then, implementation must not infer expected provider semantics from the string `erp.primary`.

Fable should attack whether `purpose` and `slot` truly collapse or whether a current consumer needs both.

### 4.3 Candidate closed consumer selector

I propose the smallest current selector:

```text
consumerTarget = DEV | PREVIEW | PROD
```

Meaning:

```text
DEV
→ current Project development/candidate intent

PREVIEW
→ explicit RunPreview resolution when the preview needs a real Connection

PROD
→ Project intent from which a candidate/Release may freeze production resolution
```

`PREVIEW` is a surface, not a persistent environment; the field is intentionally named `consumerTarget`, not `environmentId`.

Not admitted as Project binding selectors:

```text
AGENT_RUN
PUBLISHED_APP
```

because those runtime surfaces consume the exact binding/composition already pinned by their Release/run, not current Project intent.

No generic environment registry or arbitrary string targets.

Fable should attack whether `DEV | PREVIEW | PROD` exactly reconciles 3B-15's `workspace/preview/PROD` wording with 3B-16/C-014, or whether one label/selector is wrong.

### 4.4 Exact Connection identity + exact revision

Both are retained:

```text
connectionId
connectionRevisionRef
```

because:

```text
Connection stable identity
!=
exact immutable revision used
```

The binding does not re-copy:

```text
external environment
endpoint
ConnectorDefinition digest
credential handle
qualification
health
```

Those remain derivable from the exact ConnectionRevision/Connections owner.

If Fable finds a current consumer that requires one duplicated field for offline interpretation, it must name the independent-reader/failure class.

### 4.5 Scope admission is structural

Before Project records the binding, Connections must be able to prove at least:

```text
Connection exists
revision belongs to that Connection

if ownerScope=PROJECT
  owner Project == binding Project

if ownerScope=WORKSPACE
  Connection Workspace == binding Project Workspace
```

Cross-Workspace always fails closed.

No client-supplied Workspace identity is authority; Project scope is derived server-side.

### 4.6 Environment compatibility without fallback

The exact ConnectionRevision owns its real external target/environment semantics.

Project binding owns only the explicit mapping:

```text
consumerTarget
→ exact ConnectionRevision
```

No duplicated `connectionEnvironment` field is required merely for display.

Rules:

```text
no fuzzy environment matching
no name-based matching
no fallback to another binding
no “only available Connection” behavior
```

Compatibility between Project consumer target and external target is validated by the proper owner/gate. 3F-04 does not create an `environmentCompatibilityOverride` bag. A future explicit exception must have a named current consumer/policy.

### 4.7 Binding does not carry operation authority

Candidate deletion rule:

`ProjectConnectionBinding` does **not** contain copies of:

```text
allowedOperations
permissions
approvalFloor
effects[]
idempotency class
credential authority
health/qualification gate result
```

Effective execution authority remains the approved intersection:

```text
Connector contract
∩ Connection/revision eligibility
∩ explicit Project binding
∩ Release composition
∩ Artifact/Tool classification
∩ caller authority
∩ policies/preconditions
∩ Gateway admission
```

Fable should try to prove whether an operation allowlist in the binding has a real F1 consumer that cannot already be expressed by artifact/Release/tool projection authority.

---

## 5. Candidate Connection binding current-state / CAS semantics

The immutable historical version is separate from “which binding version is current intent for this logical key”.

Current-key candidate:

```text
(project, slot, consumerTarget)
```

At most one current binding version is selected for that key.

Mutation contract should be lost-update-safe without inventing a global Project generation:

```text
expectedCurrentBindingRef = ABSENT | exact prior binding ref
```

Then:

```text
SET
  expected matches current
  → install a new immutable binding version as current

UNBIND
  expected matches current
  → remove current intent for the key

expected mismatch
  → STALE_EXPECTATION / CAS conflict semantics
```

Historical binding versions remain resolvable for Release/rollback/evidence horizons.

No tombstone payload or `BindingGeneration` framework is proposed unless Fable proves it is necessary.

A Release already using the prior exact binding stays unchanged after SET/UNBIND.

Fable should attack whether `expectedCurrentBindingRef` is the smallest safe CAS key or whether Git/source concurrency already closes the failure class sufficiently.

---

## 6. Candidate Connection binding authoring and authority split

3B-16 says Project repo contains bindings/config contracts, but 3C-06 deliberately has **no `connection-binding` Registry artifact kind**.

Candidate split:

```text
Project Git
→ human/machine-authored Connection binding intent source

Project module / Hub
→ which exact binding version is accepted/current operational intent

Connections
→ resource/revision truth + validation

Release
→ exact immutable binding composition selected for candidate/PROD
```

Therefore:

```text
latest Git binding file != current binding authority
```

and:

```text
Connection binding source != Registry artifact
```

The Project-owned binding version should preserve enough source provenance to explain which Project source revision/change produced it, but 3F-04 need not invent a new Artifact kind or duplicate the source file into Registry.

Exact authored file path/YAML shape remains implementation/later-3F detail unless a failure class requires it now.

Fable should attack whether source provenance is mandatory on each binding version or already sufficiently inherited from Change/Release provenance.

---

## 7. Candidate `ProjectBrainBinding` semantics

Connection binding is a direct operational-resource mapping. Brain binding is different: it has a **Project-authored semantic artifact**.

I propose current ProjectBrainBinding authority as the exact pair:

```text
brainRevisionRef / brainDigest
+
brainBindingArtifactRevisionRef / brain-binding/v1 digest
```

with Project identity derived/owned by the Project record.

Because F1 has at most one canonical Brain per Workspace, Project has at most one **current Brain binding selection** at a time, although historical selections remain resolvable.

No generic slot is needed for Brain.

### Why the pair matters

The same Project-local mapping can remain compatible across Brain upgrades:

```text
BR-12 + binding B7 → VALID
BR-13 + same B7    → VALID after revalidation
```

If valid, adopting BR-13 should not require source churn merely to mint a semantically identical mapping artifact.

Therefore I currently prefer:

> `brain-binding/v1` describes the Project-local realization/mapping; the Project's current Brain revision pin is a separate exact component of `ProjectBrainBinding` authority.

Fable should attack whether the `brain-binding/v1` payload itself must embed the Brain digest. If embedding is required, identify the independent-reader/failure class that pays for the duplicated pin and define which copy is authority if they disagree.

---

## 8. What lives inside `brain-binding/v1`

Candidate content remains the already-approved Project-specific semantic realization:

```text
logical IDs selected/used
logical → exact local implementation refs
mapping semantics needed by Brain compiler
conformance assertions/specifications
explicit refinement / override declarations
required provenance/content contract fields
```

Exact local implementation refs must be immutable/exact where correctness depends on them; no "current query by name" resolution inside a historical binding artifact.

The Project Hub row **does not duplicate** those mappings/assertions/refinements.

Instead:

```text
prj.brain_binding
→ exact Brain revision pin
→ exact brain-binding/v1 artifact revision pin
→ current/historical Project intent metadata
```

This keeps semantic payload authority in the immutable Project-authored artifact and current adoption authority in Project.

Fable should attack whether the Project row needs any additional semantic field beyond the pair/current-intent metadata.

---

## 9. Brain validation/conformance remains Brain-owned

Set-time flow candidate:

```text
L7 SetProjectBinding[BRAIN]
→ Brain validates:
     same Workspace
     exact Brain revision resolves
     exact Project-scoped brain-binding/v1 revision belongs to this Project
     logical IDs exist
     mappings/refinements/overrides obey Brain semantics
     local exact refs/assertion shape are valid as applicable
→ Project records the exact pair as current intent
```

`brn.binding_validation` preserves Brain-owned validation/conformance evidence for the exact pair/context that Brain requires.

Project does **not** copy:

```text
VALID / INVALID health snapshot
semantic validation result
Brain health
```

into the binding as current truth.

Set-time success is not forever-serving proof; Release/Brain conformance gates re-check the applicable exact composition.

Fable should test whether `binding_validation` must be explicitly referenced by the Project binding or whether Brain can resolve validation evidence by exact pair without a duplicate ref.

---

## 10. Brain binding mutation / CAS

Candidate current-selection CAS:

```text
expectedCurrentBrainBindingRef = ABSENT | exact prior Project Brain binding ref
```

A successful adoption produces a new immutable Project-owned binding selection/ref over the exact pair.

Removing Brain binding is explicit `UNBIND`, preserves history, and does not mutate an active Release.

No `BrainBindingGeneration` or generic binding generation is introduced.

Fable should attack whether the current selection needs a Project-owned opaque binding ref at all, or whether the pair `(brainDigest, brainBindingArtifactDigest)` itself is enough for CAS/history.

---

## 11. `SetProjectBinding` remains one named use case, but inputs stay typed

3D already froze one named flow; 3F-04 should not split it casually into new L7 use cases.

Candidate semantic input is a **closed typed union**, not a generic payload:

```text
SetProjectBindingInput
=
  SetConnectionBinding
  | SetBrainBinding
  | UnbindConnection
  | UnbindBrain
```

Each variant owns its own fields/invariants.

Shared transport fields do not create a `BindingBase`.

The browser/control-plane boundary may be F3 `PLATFORM_OPERATION_RULES`; the L7/module calls remain F1 `INTERNAL_TYPED_CALL` under 3F-02.

Project/Workspace authority is derived server-side from route/session/context; the client never obtains authority by asserting Workspace/resource ownership.

Fable should attack whether UNBIND variants belong here or are 3G lifecycle concerns; the minimum requirement is explicit removal with CAS and historical preservation.

---

## 12. Set-time validation versus serving/runtime validation

I propose a strict split.

### Hard structural errors — reject binding mutation

Examples:

```text
cross-Workspace resource
Project-scoped Connection owned by another Project
ConnectionRevision does not belong to Connection
Brain revision not in Project Workspace
brain-binding artifact not Project-scoped to this Project
malformed/contract-invalid binding artifact
logical mapping structurally/semantically incompatible at set-time
```

### Operational/current conditions — do not copy into binding

Examples:

```text
Connection health changes
credential rotates
qualification becomes stale/fails
Brain health/conformance later regresses
current runtime authority changes
```

These conditions may make a candidate/Release/execution non-admissible without rewriting Project binding identity.

Set-time validation is fail-early, not the sole runtime gate.

Fable should challenge whether currently-unqualified ConnectionRevision should be impossible to bind or may exist as explicit intent that remains unreleasable until qualification. Name the product/failure-class tradeoff.

---

## 13. Release/config relationship

C-014/3C-11 already say ReleaseManifest freezes exact:

```text
Brain revision
brain-binding revision
Connection revision bindings
config contract/binding
```

3F-04 must preserve this separation:

```text
Project binding
→ current consumer intent

ReleaseManifest / ConfigBindingRevision
→ exact immutable environment-specific composition selected from validated Project intent
```

Therefore:

```text
Project binding update
-X-> mutates active Release
```

and runtime never asks:

```text
"what is the current Project binding now?"
```

for an already-pinned Production Release/AgentRun.

For Connection bindings, I do **not** propose a durable `BindingSet` object or `connectionBindingSetDigest`: ReleaseManifest can freeze the exact list/map of binding refs/revision refs it needs, and its own manifest digest already commits the composition.

For Brain, C-011 trace identities remain naturally:

```text
brainDigest
projectBindingDigest = exact brain-binding/v1 artifact revision digest
```

If the same binding artifact is reused with a new Brain revision, `brainDigest` changes while `projectBindingDigest` can remain stable; the pair still identifies the effective semantic inputs.

Fable should attack this interpretation against C-011/C-014.

---

## 14. Candidate failure semantics — exact public codes remain later 3F

Do not freeze literal public code inventory yet, but semantic classes should include at least:

```text
EXPECTED_BINDING_STALE          → L3-style CAS expectation conflict
RESOURCE_SCOPE_MISMATCH         → L1 domain/authority rejection
REVISION_RELATION_INVALID       → L2/owner contract invalid depending source
CONSUMER_TARGET_INCOMPATIBLE    → domain/conformance rejection
BRAIN_BINDING_INCOMPATIBLE      → domain/semantic rejection
BINDING_ARTIFACT_INVALID        → L2 contract invalid
BINDING_REQUIRED_BUT_ABSENT     → domain/authority rejection at consumer gate
```

Names above are working labels only, not stable codes.

Per 3F-02:

- public surfaces map known owner failures mechanically/exhaustively;
- details are code-scoped only when a named consumer requires them;
- no locus is put on wire;
- no generic metadata bag.

Fable should identify missing semantic failure classes that materially change the contract.

---

## 15. Explicit non-goals

3F-04 does not authorize:

```text
GenericBinding<T>
GenericProjectBinding
BindingEngine / BindingResolver framework
resource-binding registry
UniversalResourceRef
universal slot catalog
arbitrary environment registry
WorkspaceConnection + ProjectConnection split
connection-binding Registry artifact kind
operation allowlist duplicated in ProjectConnectionBinding
credential/secret copy in Project binding
health/qualification snapshot copy in Project binding
Brain payload copy into prj.brain_binding
live inheritance
implicit Connection fallback/failover
BindingSet aggregate
binding-set database table
binding-set digest merely for symmetry
cross-Workspace bindings
runtime resolution from mutable current Project intent when Release pins exist
```

---

## 16. Buildability hypothesis

Nothing proposed requires a novel substrate:

```text
typed closed unions
immutable/versioned Hub records
opaque exact refs
Artifact Registry exact revision refs
CAS with expected-current ref
same-Workspace checks
owner-local validation
Release exact pins
```

are conventional mechanisms already used elsewhere in Conexus/MNFS.

No new probe appears justified by this contract itself. Runtime/Release proof remains in 3N/3O and environment/security details in their already-routed phases.

No current Mastra behavior is required.

---

## 17. Global Maximum / deletion test

Before convergence, Fable should try to delete every field/concept that is only symmetric or convenient.

Specific deletion candidates:

```text
separate free-form purpose beside slot
connectionEnvironment duplicate
ConnectorDefinition duplicate in Connection binding
bindingDigest for Connection merely for symmetry with Brain
Project copy of Brain mapping/assertion payload
Project copy of binding_validation result
BindingSet object/digest
binding generation framework
common Binding base type
operation allowlist in binding
```

And try to prove whether these retained items are actually load-bearing:

```text
exact ConnectionRevision ref
consumerTarget
slot
same-Workspace rule
historical immutable binding version
expected-current CAS
Brain revision + brain-binding artifact pair
server-side specialized-owner validation
explicit UNBIND
```

No prior authority should be reopened without a concrete Material Finding.

---

## 18. Questions for Fable Round 1

Attack the model rather than endorsing it.

1. **Decision scope:** is combining the two concrete binding contracts in one 3F-04 decision useful because they share SetProjectBinding/Release laws, or does it hide a failure class that requires separate operator decisions?
2. **No common base:** can any current F1 consumer justify a shared `Binding<T>`/base payload? Name the consumer and what fails without it.
3. **Slot vs purpose:** can `slot` fully realize 3E-02's `purpose`, or does a real consumer require two independent fields? Construct the divergence if both exist.
4. **Consumer target:** attack `DEV | PREVIEW | PROD`. Reconcile 3B-15 `workspace/preview/PROD`, 3B-16 and C-014. Is a different closed set smaller/correcter?
5. **Runtime surfaces:** prove/falsify that `AGENT_RUN` and `PUBLISHED_APP` must not be current Project binding selectors because they consume Release/run-pinned composition.
6. **Connection duplicate fields:** try to justify storing external environment, ConnectorDefinition digest, qualification, health or credential handle in ProjectConnectionBinding. If none survive, confirm derivation from exact ConnectionRevision/owner.
7. **Operation authority:** find a current operation allowlist consumer that truly belongs in ProjectConnectionBinding rather than artifact/tool projection/Release/Gateway policy.
8. **Current-key uniqueness:** is `(project, slot, consumerTarget)` the right current logical key? Test multi-account/multi-Connection cases without inventing BatchBinding or pools.
9. **CAS:** is `expectedCurrentBindingRef = ABSENT | prior ref` necessary and sufficient, or can Git/source concurrency safely delete it? Test concurrent Control Plane changes.
10. **Historical immutability:** can a binding row referenced by a Release ever be updated in place safely? If yes, name exactly which fields and why Release identity remains intact.
11. **Connection binding authoring:** does Git-authoring + Hub-current-authority require per-binding source provenance, or can Change/Release provenance reconstruct it without another field?
12. **No connection-binding artifact kind:** try to prove whether Registry registration buys anything current. If not, keep it out.
13. **Brain pair:** attack `Brain revision + brain-binding/v1 artifact revision` as the ProjectBrainBinding authority. Can one component be derived safely from the other without forcing source churn/live inheritance?
14. **Brain artifact pin duplication:** must `brain-binding/v1` embed the target Brain digest? If yes, prove why; if no, confirm that the same binding artifact may be revalidated/reused against a new Brain revision.
15. **Hub Brain row:** does `prj.brain_binding` need any semantic payload beyond exact pair/current-selection/provenance, or would that duplicate the immutable artifact?
16. **Binding validation evidence:** must Project pin a `brn.binding_validation` ref, or can Brain resolve validation/conformance by exact pair? Test historical/audit needs.
17. **Set-time Connection qualification:** should an unqualified but structurally valid exact ConnectionRevision be bindable as intent but unreleasable, or should SetProjectBinding reject it? Use current authority and product flow, not preference.
18. **UNBIND:** is explicit CAS-protected unbind part of 3F contract now or can lifecycle defer it to 3G without leaving ambiguity about how a Project stops consuming a resource?
19. **Release/config relationship:** attack the no-`BindingSet` rule and the interpretation `brainDigest + projectBindingDigest`. Identify any Release/rollback failure that needs another durable binding aggregate/digest.
20. **Failure classes:** identify missing semantic failures that materially change fields/invariants, not just names.
21. **Buildability:** classify each retained mechanism `PROVEN | CONVENTIONAL | PROBE_REQUIRED | UNSUPPORTED`; add no probe without a real empirical gap.
22. **Global Maximum:** re-run against 3B-15, 3C-04/06/07/09/11, 3D-03, 3E-02, 3F-01/02 and C-011/C-014. Reopen only for a Material Finding.
23. If the model converges, propose the **smallest operator-facing 3F-04 decision text**, preserving non-goals and routed work. Do not modify authority or `LEDGER.md`.

For every disagreement use:

```text
claim challenged
concrete failure class
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

---

# Round 1 — Fable

**Status of this round:** adversarial review / NON-AUTHORITATIVE.
**Method:** authority rebuilt per `AGENTS.md` → C-000 → `DECISOES.md` → `LEDGER.md` → 3B-15/3B-16 → 3C-04/06/07/09/11 → 3D-03/3D-R1 → 3E-02 → 3F-01/3F-02/3F-03 → C-011/C-014. Mitra/Factory/in-house material used as evidence only. **No claim in this round depends on current Mastra behavior** (protocol rule 8; Context7 verification therefore not triggered).

## F.1 Verdict

The model survives its own deletion test better than any previous 3F candidate — most of my attacks confirmed rather than broke it. I found **six findings**, of which one is load-bearing (per-version source provenance is mandatory, and it surfaces an authoring-path question the candidate leaves silently open), two close missing failure classes, and three are answers to questions the candidate deliberately left open, each argued from a failure class rather than preference. Symmetry was rejected as justification everywhere it appeared — including one place where I *strengthen* the asymmetry with an argument the candidate lacks (F.2 D-5). **No Material Finding against 3B-15, 3C-04/06/07/09/11, 3D-03, 3E-02, 3F-01/02/03, C-011 or C-014.**

## F.2 Findings

### D-1 — Per-version source provenance is mandatory; and the authoring path must be named, not implied

```text
claim challenged      §6 "3F-04 need not invent…" + Q11's suggestion that Change/
                      Release provenance might reconstruct binding provenance
concrete failure class failure class J is not closed by Change/Release provenance:
                      current intent legitimately changes BETWEEN Releases, and a
                      binding version that was current-but-never-released appears
                      in no ReleaseManifest at all. If such a version has no
                      provenance of its own, the Hub holds operational authority
                      with no reproducible source — exactly the state 3B-16
                      prohibits ("Hub binding with no reproducible source").
smallest correction   every binding version records its source provenance: the
                      authored Project source revision that produced it, or the
                      explicit operator/control-plane action identity where one
                      is admitted. One field, already listed in §4.1 — this
                      finding converts it from "as required" to mandatory.
reopen prior authority?  NO
later owner           exact authored file shape → later 3F/implementation
```

The same analysis exposes an **open point the candidate does not decide and should surface to the operator rather than bury**: 3B-16 makes Git the authoring layer and the Hub the current-intent layer, but nothing yet says whether a binding mutation may originate in the Control Plane UI *without* an authored source revision (e.g., emergency PROD rebind after a credential incident). Two coherent worlds exist: (a) single path — author in Git, adopt via `SetProjectBinding`, provenance = source revision, always; (b) dual path — UI mutation admitted with operator-action provenance. I recommend (a) for F1 as the smaller and the one 3B-16's wording favors, with (b) returning by Decision Loop when a real incident-speed consumer demands it — but this is an operator call, and 3F-04's text must state which world it freezes.

### D-2 — PREVIEW absence semantics must be stated, or convenience will reinvent fallback

```text
claim challenged      §4.3 defines the selector set but not absence behavior per
                      selector
concrete failure class the obvious "convenience improvement" — PREVIEW absent →
                      resolve DEV, since 3B-15's own example maps both to the
                      same homologation Connection — is failure class C wearing
                      a friendly face. Equal values in one example do not make
                      inheritance a rule; the first Project whose DEV points at
                      a scratch Connection would leak scratch data into review
                      surfaces silently.
smallest correction   one sentence: absence of a binding for a required
                      (slot, consumerTarget) is fail-closed at the consumer
                      gate (BINDING_REQUIRED_BUT_ABSENT-class); no selector ever
                      resolves through another selector. PREVIEW may legitimately
                      remain unbound for Projects whose previews touch no real
                      Connection.
reopen prior authority?  NO
later owner           none
```

### D-3 — Two missing structural failure classes: archived resource, archived Project

§12's hard-error list checks existence, scope and relation but not terminality. Binding to an **archived/terminal Connection** (or adopting a Brain revision withdrawn from its Workspace) is a structural set-time reject — the intent can never become releasable and recording it manufactures dead current-intent. Symmetrically, binding mutation on an **archived Project** is an L1-class domain rejection (the F3D04-R2 lifecycle detail stays routed to 3G/3I; the set-time reject does not need to wait for it). Two rows added to §12's first list; no new machinery.

### D-4 — Q16 answered: no mandatory validation-evidence ref on the Project row

Both positions are defensible, so I take the smaller and name its trigger honestly. Brain resolves its own `brn.binding_validation` evidence by the exact pair `(brainDigest, bindingArtifactDigest)`; the adoption timestamp orders which evidence existed at-or-before adoption. The residual ambiguity — "which of several validations of the same pair admitted THIS adoption" — is not currently load-bearing because set-time validation is fail-early UX, not the correctness gate (§1.6); Release/conformance gates re-prove what matters. If 3N's verification design shows the audit ambiguity is real, one Tier-3 evidence ref enters the adoption provenance by Decision Loop. Adding it now is a mirror-shaped reflex: the Project row starts collecting Brain-owned facts one opaque ref at a time.

### D-5 — The content-vs-pointer argument: why the asymmetry is principled, not accidental

The candidate defends "no `connection-binding` Registry kind" by cost (§6). The stronger defense, worth one paragraph in the decision text because it will be attacked by symmetry forever:

```text
brain-binding/v1 is CONTENT — Project-authored semantic realization
  (mappings, assertions, refinements) that a compiler consumes; it needs
  immutable revisions, digests, compilation and Registry lifecycle because
  it IS an authored artifact.

ProjectConnectionBinding is a POINTER PAIR — (slot, target) → exact
  ConnectionRevision. It has no authored semantic content to compile, no
  independent reader of a compiled payload, and its immutability is already
  supplied by prj versioning + Release pins.
```

Registering a pointer as an artifact buys a compilation pipeline for a three-field record. The asymmetry follows from what each thing *is*; symmetry arguments should die against this, not against a cost estimate that inflation erodes.

### D-6 — Q17 answered: structurally valid + scope-valid is bindable; qualification gates the Release, not the intent

Forcing qualification at set-time would couple exactly what 3B-15 froze apart (`Connection qualified != Project authorized to use it`) and would serialize work that is legitimately parallel (authoring intent while qualification runs). The measured evidence points the same way: Mitra's environment-proof failure (OBS-42 — `testEndpoint: null` for Sankhya forced the agent to prove sandbox-vs-prod by hand) is a *gate-absence* failure at serving time, not a set-time one; C-007's three gates and C-014's EnvironmentConformance (`Connection revision pinada == ativa`) are where unqualified intent fails closed. Set-time validation reports qualification status as **advisory warning**; structural/scope/relation/terminality errors reject; qualification does not. Intent-but-unreleasable is the correct product shape.

## F.3 Answers to the twenty-three questions

1. **Scope:** one decision is right — the two contracts share laws, one L7 flow and one Release relationship; separating them would duplicate the law text and invite drift between two decisions. The contracts remain distinct inside it; nothing is hidden.
2. **No common base:** no consumer found. Every shared thing is a *law* (immutability, CAS, same-Workspace, no-fallback), and laws don't need a base type. A `Binding<T>` would exist only to be dispatched on — the §2.A failure class verbatim. Confirmed.
3. **Slot vs purpose:** collapse is correct. 3E-02's wording ("project-local symbolic slot / purpose") already reads as one concept with two names, not two fields. The divergence construction seals it: with both fields, `slot=erp.primary, purpose="marketplace"` forces an answer to "which governs resolution?" — any answer makes the other field a lie. Human-facing description belongs to the authored source, not the contract. Confirmed, one key.
4. **Consumer target:** `DEV | PREVIEW | PROD` reconciles cleanly — 3B-15's `workspace/DEV` and C-014's `workspace DEV` are the same environment under two spellings, `preview` is RunPreview's binding face, `PROD` is itself. BuildValidationDatabase needs no selector (it is not a Connection consumer context; builder discovery through the Gateway uses DEV intent). With D-2's absence rule, the closed set is exactly right — no fourth member found, none deletable.
5. **Runtime surfaces:** confirmed excluded, and the proof is direct: 3D-R1 §5 freezes composition sources per surface — `PUBLISHED_APP → active Release pins`, `AGENT_RUN → run-pinned composition`. Making them binding selectors would have runtime reading mutable current intent, which is the precise sentence §13 prohibits. Any agent/app need for different Connections is expressed at composition time, not at binding-resolution time.
6. **Duplicate fields:** none survive. Display reads through the Connections owner in-process; Release freezes what serving needs; evidence lives in receipts/conformance records. Every duplicated field is a stale-mirror seed (3E prohibition). Confirmed: derive everything from the exact ConnectionRevision.
7. **Operation authority:** no consumer survives. Every candidate allowlist already has a home with an owner — connector `effects[]`/`agentEligible` (C-007), ToolProjection (C-010), `allowed_roles` (C-015), Release composition, Gateway admission. A binding-level copy adds a second place to check and therefore a second place to be wrong; the intersection formula in §4.7 is complete without it. Confirmed.
8. **Current key:** `(project, slot, consumerTarget)` holds. Multi-account is two slots (`erp.primary`, `erp.secondary`) — explicit, named, no pool; multi-Connection-per-slot-per-target is a load-balancing fantasy with no F1 consumer. Slot rename = new slot + explicit UNBIND of the old, history intact. Confirmed.
9. **CAS:** necessary and sufficient; Git concurrency cannot replace it because Git merge protects the *authored file*, while the lost update happens at the *adoption* action in the Hub (failure class H is two admins in the Control Plane, not two commits). The `ABSENT` arm is load-bearing — it is what makes concurrent first-binds safe. Confirmed as proposed.
10. **Historical immutability:** no field is in-place-updatable, including cosmetic ones — a "safe" description edit on a version referenced by evidence still changes what an auditor reads. Corrections are new versions; errata are appends. Simplicity wins over field-level cleverness. Confirmed: none.
11. **Provenance:** mandatory per version — D-1.
12. **Registry kind:** kept out — D-5 gives the principled argument; the practical one stands too (closed kind→scope map in 3E-02, no independent reader of a compiled pointer).
13. **Brain pair:** survives attack. Deriving one component from the other fails in both directions: deriving revision from artifact = embedding (see 14); deriving artifact from revision = live inheritance of mappings. The pair is irreducible because the two components change for independent reasons (Workspace publishes; Project adopts).
14. **Embedding the Brain digest in `brain-binding/v1`:** must NOT embed. Two failure classes: (a) source churn — adopting BR-13 with an unchanged mapping would force minting a semantically identical artifact revision whose only delta is a digest, polluting authored history with noise; (b) split authority — the embedded pin and the Project row pin can disagree, and any tie-break rule makes one of them decorative. The artifact's genuine Brain-compatibility expectations are its conformance assertions, evaluated at revalidation — C-011's `revalidation na promoção` is exactly the mechanism that makes cross-revision reuse safe. Same artifact + new Brain revision + revalidation = legitimate, and the trace identities behave correctly (`brainDigest` moves, `projectBindingDigest` stable — consistent with C-011's trace digests).
15. **Hub Brain row:** pair + current-selection + provenance (D-1) and nothing else. Any semantic field is a drift seed against the immutable artifact (failure class F). Confirmed.
16. **Validation evidence:** no mandatory ref — D-4, with the named Decision Loop trigger.
17. **Set-time qualification:** bindable-but-unreleasable — D-6.
18. **UNBIND:** belongs in 3F-04 now, at semantic level only: explicit, CAS-protected, history-preserving, Release-untouched, consumer gates fail closed afterward (D-2's rule covers the aftermath). Without it, "how does a Project stop consuming" defaults to somebody's DELETE statement. Binding lifecycle *states* beyond this remain 3G. Confirmed as proposed.
19. **No BindingSet:** confirmed, with the sharper reason: the ReleaseManifest digest already commits the exact composition, so a `bindingSetDigest` would be a **second commitment over the same facts** — two digests that can only ever agree or reveal a bug, i.e. pure drift surface. Rollback re-points to the old manifest and resolves the old refs; no aggregate needed. The `brainDigest + projectBindingDigest` interpretation is consistent with C-011/C-014 as argued in 14.
20. **Missing failure classes:** archived resource and archived Project (D-3). Also verified benign: `SLOT_ALREADY_BOUND` is just the `ABSENT`-expectation CAS mismatch, not a new class; a compose racing a SET is safe (compose freezes whichever current intent it read — both are valid intents; the gate that matters re-validates the frozen one).
21. **Buildability:** table below. Nothing UNSUPPORTED, zero new probes.
22. **Global Maximum:** re-run against every listed authority. The pair model *implements* C-011 (pin-by-digest + revalidation) rather than bending it; D-1 implements 3B-16; the selector set implements C-014's environment model; no contact point produces a contradiction or a superior global alternative — a generic binding base, a registry'd pointer, or a BindingSet each re-open a failure class this model closes. **No Material Finding; nothing reopens.**
23. **Convergence:** the model converges once D-1..D-6 land. Given the D-1 authoring-path question is an operator call embedded in the decision text, I propose drafting the operator-facing 3F-04 text in Round 2 after ChatGPT accepts or contests these findings — matching the cadence of 3F-02/3F-03.

## F.4 Buildability

| Mechanism | Class | Evidence |
|---|---|---|
| symbolic slot → server-side resource indirection | **PROVEN** | Mitra runs it in production: `connection: 'sankhya'` symbolic handle in SF INTEGRATION artifacts, credential server-side (`04-integracao-externa`) — the slot pattern, live against a real ERP |
| exact revision pinning on the binding | CONVENTIONAL; failure class it closes is **measured** | Mitra's bindings are mutable-in-place with no revision pin — the C-009-adjacent weakness our exact `ConnectionRevisionRef` closes; environment proof done "na unha" (OBS-42) is the measured cost of weak binding validation |
| immutable versioned Hub records + expected-current CAS | **PROVEN in-house** | MNFS plan revisions (immutable approved revisions) + lease core CAS/fencing with real crash-recovery tests |
| Brain pair + revalidation-on-adoption | CONVENTIONAL | C-011 design (pin-by-digest, revalidation na promoção); registry revision machinery already frozen by C-005 |
| closed typed union for SetProjectBinding input | CONVENTIONAL | TS discriminated unions; 3F-02 F3/F1 family rules already govern the surfaces |
| same-Workspace structural checks / server-derived scope | CONVENTIONAL | C-015 derivation pattern (payload adulterado ignorado; 404-indistinguishable) |

Zero new probes; set-time/Release gate behavior is exercised by already-planned 3N/3O verification.

## F.5 Position for convergence

Accept the candidate with: D-1 (mandatory per-version provenance + the authoring-path decision surfaced to the operator, recommending the single Git-authored path), D-2 (explicit fail-closed absence, no selector inheritance), D-3 (archived-resource and archived-Project structural rejects), D-4 (no mandatory validation ref, trigger named), D-5 (content-vs-pointer paragraph in the decision text), D-6 (bindable-but-unreleasable). Everything else is confirmed as proposed — including the collapses and deletions the candidate asked me to attack: one slot key, no duplicates, no allowlist, no BindingSet, no common base, no registry kind, exclusion of runtime surfaces. If ChatGPT accepts these in Round 2, I will draft the smallest operator-facing 3F-04 text there.

No LEDGER or authority file was modified in this round.
