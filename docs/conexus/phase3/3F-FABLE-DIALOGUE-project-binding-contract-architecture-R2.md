# 3F — ChatGPT ↔ Fable Dialogue — Project Binding Contract Architecture — Round 2

**Status:** WORKING DIALOGUE CONTINUATION / NON-AUTHORITATIVE  
**Phase:** 3F — Contracts & API Architecture  
**Candidate decision:** `3F-04 — Project Binding Contract Architecture`  
**Parent dialogue:** `3F-FABLE-DIALOGUE-project-binding-contract-architecture.md`  
**Parent Fable-reviewed head:** `beea02aab8d6786c81e5e143bbf76466b8c78fbc`  
**Important:** review/co-design provenance only. This file is not authority, does not approve 3F-04, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

The authority chain, Global Maximum/YAGNI method, evidence-vs-authority discipline and Mastra guardrail from the parent dialogue remain unchanged.

---

# Round 2 — ChatGPT

## C2.1 Verdict

Fable Round 1 confirms the central architecture and improves it in six places. I accept D-1, D-2, D-4, D-5 and D-6 substantially. I accept the failure class behind D-3 but narrow its wording so 3F-04 does not prematurely freeze `ARCHIVED` / `WITHDRAWN` lifecycle labels that belong to 3G.

The strongest outcome of the round is that the asymmetry is now principled:

```text
ProjectConnectionBinding
→ Project-owned immutable pointer version
→ (slot, consumerTarget) → exact Connection + exact ConnectionRevision

ProjectBrainBinding
→ Project-owned immutable adoption/version
→ exact Brain revision + exact brain-binding/v1 artifact revision
```

They share laws, not a base payload.

No current consumer justifies:

```text
GenericBinding<T>
BindingSet
connection-binding Registry artifact
binding operation allowlist
binding-level health/qualification snapshot
binding-level credential/config mirror
```

No Material Finding against 3B-15/3B-16, 3C-04/06/07/09/11, 3D, 3E, 3F-01/02/03, C-011 or C-014 is established.

---

## C2.2 D-1 — ACCEPT mandatory per-version source provenance; FREEZE one Git-authored path in F1

Fable is correct that Change/Release provenance cannot reconstruct a binding version that became current intent but was never released.

Therefore every immutable binding version must retain source provenance sufficient to answer:

> **Which authored Project source revision produced this exact adopted binding intent?**

This is mandatory, not optional.

### F1 authoring path

I accept Fable's recommended world (a):

```text
Project canonical Git repository
→ binding source authored/changed
→ source revision/commit becomes immutable provenance
→ SetProjectBinding validates/adopts exact resolved intent into Hub authority
```

There is **no DB-only binding mutation path in F1**.

This does **not** mean the user must manually edit YAML in GitHub.

The Control Plane may provide a binding editor, but its write path is:

```text
Control Plane UI
→ platform authors the binding change in the canonical Project repo
→ commit/revision exists
→ SetProjectBinding adopts it into Hub current authority
```

not:

```text
Control Plane UI
→ mutate prj.* only
→ no reproducible Project source
```

### Why emergency DB-only rebind is not a current consumer

The strongest plausible counterexample is incident response.

But current authority already separates:

```text
compatible secret/grant rotation
→ Connection/Credential lifecycle
→ no Project binding change required

functional target/revision change
→ new exact ConnectionRevision/binding intent
→ active Release remains pinned to old composition
→ correct PROD change still requires validated composition/Release/Promotion
```

Therefore a direct Hub-only emergency rebind would not safely change an already active Release and would create a second authoring authority without solving the incident correctly.

If a future incident class requires an emergency runtime override distinct from Release/rollback, it returns by Decision Loop as an explicit break-glass capability; it does not justify dual binding authoring today.

### Reproducibility requirement on the authored form

The authored source representation must resolve deterministically to the exact adopted refs.

Prohibited authoring semantics include equivalent forms of:

```text
connection = "latest"
brain = "current"
connection = "whatever is named Sankhya PROD"
auto-select the only available resource
```

A source revision that cannot deterministically reproduce the exact adopted resource/revision pair is not sufficient provenance.

The exact file/schema syntax remains implementation/later-3F work.

---

## C2.3 D-2 — ACCEPT exact selector absence = fail closed; no inheritance/fallback

Final Connection binding selector space remains:

```text
DEV | PREVIEW | PROD
```

for ProjectConnectionBinding current intent.

Normative rule:

> If a consumer requires `(slot, consumerTarget)` and no exact current binding exists, resolution fails closed. No selector falls back to another selector.

Therefore never:

```text
PREVIEW absent → DEV
DEV absent → PROD
PROD absent → DEV
```

Even when two selectors currently point to the same ConnectionRevision, that equality is explicit data, not inheritance.

A Project whose Preview does not use a real Connection may simply have no PREVIEW binding for that slot; absence becomes an error only when the concrete preview capability requires it.

This preserves 3B-15's no-implicit-environment-choice invariant.

---

## C2.4 D-3 — ACCEPT the failure class, NARROW lifecycle wording

I agree that SetProjectBinding must not create current intent that is structurally impossible to adopt.

But 3F-04 should not freeze a universal rule like:

```text
ARCHIVED resource → always reject
WITHDRAWN BrainRevision → always reject
```

before 3G closes exact lifecycle states and historical/reference semantics.

For example, historical exact revisions must remain resolvable for Release/audit even after they are no longer selectable for **new** adoption. `archived` can mean different things across owners.

### Smaller owner-local rule

At set/adoption time:

```text
Project owner
→ must admit binding mutation under current Project lifecycle

Connections owner
→ exact Connection + ConnectionRevision must exist, belong to allowed scope,
  and be owner-admissible as a NEW binding target

Brain/Registry owners
→ exact Brain revision + brain-binding artifact revision must resolve,
  and the Brain revision must be owner-admissible for NEW Project adoption
```

If an owner says the referenced target is retired/terminal/non-selectable for new adoption, SetProjectBinding fails with the owner/domain rejection.

3F-04 freezes **new-adoption admissibility**, not the final names/state machine implementing it.

Historical pins already captured by Releases/evidence remain governed by their own PRESERVE horizons and are not invalidated merely because new adoption is prohibited.

This closes Fable's dead-current-intent failure class without stealing 3G.

---

## C2.5 D-4 — ACCEPT no mandatory `brn.binding_validation` ref in Project

`prj.brain_binding` should not collect Brain-owned evidence refs by reflex.

Current minimum remains:

```text
exact Brain revision
+ exact brain-binding/v1 artifact revision
+ immutable Project binding version identity
+ current-selection/CAS relationship
+ mandatory source provenance
```

Brain resolves its own validation/conformance evidence by the exact pair.

Set-time validation is fail-early/advisory correctness help; Release/conformance is the serving gate. Therefore an exact validation-record ref is not currently load-bearing.

Decision Loop trigger remains:

> if 3N proves that reconstructing which exact validation admitted a binding version is necessary for correctness/audit and cannot be derived safely from pair + time/evidence lineage, add one narrow Tier-3 evidence ref then.

No mirror now.

---

## C2.6 D-5 — ACCEPT and strengthen the content-vs-pointer distinction

This argument should be operator-facing because it explains the deliberate asymmetry.

### Brain binding

```text
brain-binding/v1
= authored semantic CONTENT
```

It contains Project-specific realization such as:

```text
logical → local implementation mapping
assertions/conformance expectations
refinements/overrides when admitted
```

It has an independent compiler/reader and therefore legitimately uses Artifact Registry revision/digest lifecycle.

### Connection binding

```text
ProjectConnectionBinding
= Project current-intent POINTER
```

Its semantic payload is only the explicit resolution:

```text
(project, slot, consumerTarget)
→ exact Connection
→ exact ConnectionRevision
```

There is no separate compiled content for another independent reader.

Therefore:

```text
brain-binding Registry kind = justified
connection-binding Registry kind = unjustified
```

The asymmetry is semantic, not accidental and not merely a cost optimization.

---

## C2.7 D-6 — ACCEPT structurally valid but unqualified Connection binding as current intent

SetProjectBinding should reject structural/authority impossibility, not require operational readiness that belongs to later gates.

A Connection binding may be adopted when:

```text
exact Connection/Revision exists
scope/Workspace/Project relation is valid
owner permits new adoption under lifecycle
consumer target relationship is structurally valid
```

while qualification is not yet PASS.

That produces:

```text
valid Project intent
but
not yet releasable/serving-eligible
```

This supports legitimate parallel work:

```text
configure Project intent
+
qualify Connection
```

without pretending qualification is irrelevant.

Set-time UI/result may expose current qualification as **advisory information**, but Project does not persist a qualification snapshot and the Set operation does not turn that advisory state into binding authority.

Release/EnvironmentConformance/Gateway enforce the current required qualification/eligibility at the actual gate.

---

## C2.8 Shared laws — accepted without a shared base type

The two binding contracts share these laws:

```text
Project owns current intent
immutable historical versions
Git-first reproducible source
mandatory source provenance per version
expected-current CAS on adoption/unbind
same-Workspace / owner-scope checks
no implicit fallback/live inheritance
set-time specialized-owner validation
Release pins exact adopted versions/refs
active Release never re-resolves mutable current Project intent
explicit CAS-protected UNBIND
```

These are architectural laws, not justification for:

```text
Binding<T>
BindingRecord
BindingRepository
BindingService
BindingSet
```

Implementation may share trivial private helper code where natural; no public generic contract is admitted.

---

## C2.9 Connection contract — current converged shape

### Logical key

```text
(project, slot, consumerTarget)
```

with:

```text
slot = Project-local symbolic purpose key
consumerTarget = DEV | PREVIEW | PROD
```

No separate free-form `purpose` field is admitted.

Multi-account/multi-resource is expressed by distinct explicit slots, not multiple resources under one slot:

```text
erp.primary
erp.secondary
```

Pools/load balancing/failover remain future decisions.

### Immutable binding version meaning

A version preserves equivalent semantics to:

```text
Project identity
slot
consumerTarget
exact Connection identity
exact ConnectionRevision ref
mandatory source provenance
binding-version identity
```

It does NOT copy:

```text
credential handle/material
ConnectorDefinition digest separately
external environment separately
health
qualification result
operation allowlist
active Release
```

Those facts remain owned/derived elsewhere.

### CAS adoption

Mutation/adoption requires:

```text
expectedCurrentBindingRef = ABSENT | exact prior immutable binding-version ref
```

The Hub compares this expectation against current Project binding authority.

Mismatch fails closed as stale/concurrency conflict.

No global binding generation framework.

### Explicit unbind

```text
UNBIND(project, slot, consumerTarget, expectedCurrentBindingRef)
```

semantically removes **current intent** while preserving historical immutable versions.

Existing Releases remain pinned and unchanged. Consumer gates using mutable current Project intent subsequently see absence and fail closed when a binding is required.

Exact lifecycle/status representation remains 3G/implementation.

---

## C2.10 Brain contract — current converged shape

ProjectBrainBinding current authority preserves the pair:

```text
exact Brain revision/digest
+
exact Project-scoped brain-binding/v1 artifact revision/digest
```

plus:

```text
immutable Project binding-version identity/current selection
mandatory source provenance
```

The semantic content stays only in `brain-binding/v1`.

### No embedded target Brain digest inside brain-binding/v1

The artifact should not duplicate the selected Brain revision merely to make the pair look self-contained.

Reasons:

```text
1. source churn
   unchanged Project realization + BR-12→BR-13
   would require a fake artifact revision solely to update a pin

2. split authority
   embedded Brain pin and Project current pair could disagree
```

Therefore the same exact binding artifact may legitimately be evaluated/adopted with a newer Brain revision when specialized Brain validation/conformance proves compatibility.

This preserves the useful identity behavior:

```text
brainDigest changes
projectBindingDigest remains stable
```

when shared semantics evolve but the Project's realization content does not.

No live inheritance follows: adoption of the new Brain revision still requires explicit SetProjectBinding / validation / later Release composition.

---

## C2.11 Git source × Hub current authority × Release composition

The final three-layer law should be explicit:

```text
Git source revision
→ what binding intent was authored

Project / Hub current binding ref
→ which immutable authored intent version is current Project authority

ReleaseManifest
→ which exact binding/revision pair was frozen into a served composition
```

Therefore:

```text
new Git commit alone
!= current binding

new current Project binding
!= active Release changed

new Workspace Brain/Connection revision
!= Project binding changed
```

This is the central TOCTOU/authority split of 3F-04.

---

## C2.12 `SetProjectBinding` surface

The existing 3D named use case remains one orchestration flow with a closed discriminated input, not a generic binding engine.

Conceptually:

```text
SET_CONNECTION
  Project + slot + consumerTarget
  exact Connection + exact ConnectionRevision
  sourceProvenance
  expectedCurrentBindingRef

SET_BRAIN
  Project
  exact Brain revision
  exact brain-binding/v1 artifact revision
  sourceProvenance
  expectedCurrentBindingRef

UNBIND_CONNECTION
  Project + slot + consumerTarget
  sourceProvenance
  expectedCurrentBindingRef

UNBIND_BRAIN
  Project
  sourceProvenance
  expectedCurrentBindingRef
```

This is a **closed union of concrete operations**.

Do not generalize to:

```text
{ kind, target, payload }
GenericBindingMutation
resourceType
bindingData: unknown
```

Exact TS names/HTTP/wire representation are not frozen here.

The authoritative scope/resource IDs are still server-validated/derived where 3F-02 requires; this semantic sketch does not turn browser-submitted IDs into authority.

---

## C2.13 Failure behavior — refine without stealing 3G

Current semantic failures include at least these classes:

```text
PROJECT_BINDING_MUTATION_NOT_ADMITTED
→ Project owner refuses mutation under current lifecycle/authority

BINDING_SOURCE_NOT_REPRODUCIBLE
→ authored source/provenance cannot deterministically produce the exact adopted refs

BINDING_REQUIRED_BUT_ABSENT
→ concrete consumer requires exact slot/target or Brain binding and none is pinned

BINDING_SCOPE_MISMATCH
→ cross-Workspace / wrong Project-owned Connection / owner relation mismatch

BINDING_TARGET_NOT_ADOPTABLE
→ specialized owner says exact resource/revision is not available for NEW adoption

BINDING_EXPECTATION_STALE
→ expectedCurrentBindingRef does not match Hub current binding authority

BINDING_REFERENCE_INVALID
→ exact ref/revision/artifact cannot be resolved/interpreted safely

BRAIN_BINDING_INCOMPATIBLE
→ specialized Brain validation rejects exact Brain + binding-artifact pair where the current set/adoption gate requires rejection
```

These are semantic classes, not final public stable codes.

Do not freeze generic `ARCHIVED` state names here.

Qualification-not-PASS is **not** automatically a SetProjectBinding contract failure; it can leave the current intent unreleasable until later gates pass.

---

## C2.14 Release / runtime law

### Release composition

Release freezes exact refs required for the composition.

For Connection intent it must ultimately preserve the exact selected Connection/Revision relationship needed by the Release/config contract.

For Brain it preserves the exact:

```text
Brain revision/digest
brain-binding artifact revision/digest
```

No `BindingSet` or `bindingSetDigest` is introduced merely to group these facts.

The ReleaseManifest digest already commits the whole exact composition.

### Runtime

```text
PUBLISHED_APP
→ active Release composition

AGENT_RUN
→ run-pinned composition
```

Neither may resolve mutable current Project bindings as runtime authority.

A later current binding change affects only future candidate/composition work until a new Release/run adopts it.

---

## C2.15 Buildability disposition

Fable's table survives with the D-1/D-3 refinements.

```text
symbolic slots                          PROVEN pattern evidence
exact immutable revision refs           CONVENTIONAL; failure class measured
immutable Hub binding versions + CAS    PROVEN in-house class
Brain pair + explicit revalidation      CONVENTIONAL over existing Registry/Brain machinery
closed SetProjectBinding union          CONVENTIONAL
git-first source provenance             PROVEN architectural pattern already used by Conexus artifacts/config
owner-local new-adoption checks         CONVENTIONAL
```

No mechanism is `UNSUPPORTED`.

No new probe is justified by 3F-04 itself; end-to-end concurrency/composition proof remains 3N/3O.

No current Mastra premise is introduced.

---

## C2.16 Global Maximum re-run

The revised model preserves:

```text
3B-15 explicit typed bindings, no implicit reuse
3B-16 Git authoring vs Hub operational authority
3C-04 Project ownership of binding intent
3C-06 Registry only for genuine artifacts
3C-07 exact ConnectionRevision + independent qualification
3C-09 Brain semantic validation + Project-owned intent
3C-11 Release immutable composition
3D-03 one named SetProjectBinding orchestration flow
3E-02 concrete typed durable rows, no GenericProjectBinding
3F-01 exact durable pins/horizons
3F-02 no universal envelope/framework
C-011 no live Brain inheritance
C-014 Release/config composition authority
```

The Git-only F1 authoring path is the smallest coherent authority model because a dual DB-only path would create source-less binding authority and still could not safely bypass Release pins for PROD.

The D-3 narrowing avoids the opposite failure: freezing lifecycle vocabulary before 3G.

No globally superior alternative or Material Finding is currently established.

---

## C2.17 Questions for Fable Round 2

This should be a convergence pass, not a redesign.

1. **Git-only authoring path:** attack C2.2. Can you produce a current F1 consumer that requires direct Hub-only binding mutation and cannot be satisfied by a Control Plane editor that commits Git then adopts? If not, confirm F1 has one authored path.
2. **Reproducibility:** is it sufficient that the authored source deterministically resolves to the exact adopted refs, without freezing literal file fields now? Attack `latest`/name-only selectors.
3. **Lifecycle wording:** attack C2.4. Does `owner-admissible for NEW adoption` close the dead-intent failure without freezing `ARCHIVED/WITHDRAWN` semantics? Find any case where new adoption should be allowed even though the owner says non-selectable.
4. **Historical pins:** verify that prohibiting new adoption does not invalidate historical Release/evidence refs.
5. **Qualification:** recheck bindable-but-unreleasable and ensure advisory qualification at set-time does not become a persisted Project snapshot.
6. **Connection shape:** try once more to delete any retained field from `(project, slot, consumerTarget, Connection, ConnectionRevision, source provenance, version identity)`.
7. **Brain shape:** try once more to derive either Brain revision or binding-artifact revision from the other without source churn or live inheritance.
8. **Brain artifact reuse:** attack reuse of the same brain-binding artifact against a newer Brain revision after explicit validation. Find a semantic class where embedding the Brain digest is actually required.
9. **CAS:** recheck `expectedCurrentBindingRef = ABSENT | prior exact ref` for SET and UNBIND; find any need for generation or BindingSet-level concurrency.
10. **UNBIND + Git-first:** confirm removal/unbind is also authored in Git first, then adopted with CAS; no DELETE-only Hub path.
11. **SetProjectBinding union:** attack the four concrete operations. Can any current consumer justify a generic `{kind,target,payload}` shape?
12. **Failure classes:** attack C2.13 for over-generalization or missing material failure. Keep literal stable codes for later 3F.
13. **Release:** try to construct a rollback/composition failure that needs `BindingSet` or `bindingSetDigest` beyond ReleaseManifest's own commitment.
14. **Runtime:** re-confirm no current Project binding lookup for PUBLISHED_APP/AGENT_RUN.
15. **Validation evidence:** try again to prove a mandatory `brn.binding_validation` ref is needed now; otherwise keep the 3N trigger only.
16. **Buildability:** re-run only the deltas. No new probe without an empirical gap.
17. **Global Maximum/YAGNI:** no Material Finding unless a concrete prior-authority contradiction appears.
18. If converged, draft the **smallest operator-facing 3F-04 text** and finish with `READY FOR OPERATOR APPROVAL` only if no material issue remains.

For every disagreement use:

```text
claim challenged
concrete failure class
smallest correction
reopen prior authority? yes/no
later owner if deferred
```

Do not modify authority or `LEDGER.md`.

---

# Round 2 — Fable

_Pending Fable response._
