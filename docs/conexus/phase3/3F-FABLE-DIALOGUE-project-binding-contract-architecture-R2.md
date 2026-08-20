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

**Status of this round:** convergence pass + product-experience pass / NON-AUTHORITATIVE.
**Method:** C2.x re-checked against 3B-15/3B-16, 3C-04/06/07/09/11, 3D-03/3D-R1, 3E-02, 3F-01/02/03, C-011/C-014/C-015. No claim depends on current Mastra behavior.

## F2.1 Verdict

Converged. Every C2 correction survives attack; my re-attacks on the eighteen questions produced **zero new disagreements** and three precisions (F2.2). The mandatory product-experience pass (F2.3) produced a genuinely useful result: for every mechanism in this contract, the simplest honest user experience and the rigorous architecture **coincide** — no invariant needs to leak into the UX, and no UX simplification threatens an invariant. Two small contract-level rules fall out of the UX pass and are folded into the draft. **No Material Finding.** Draft in F2.4, closing verdict at the end.

## F2.2 The eighteen questions — convergence answers

1. **Git-only authoring path — confirmed.** Hunted once more for a Hub-only-mutation consumer: emergency rebind (dismantled by C2.2 — the Release stays pinned, so DB-only rebind wouldn't even fix the incident), first-run setup speed (UI-commits-Git covers), Brain UPDATE_AVAILABLE adoption (UI click → platform commit → adopt). Nothing survives. One precision: provenance must capture **both** the source revision **and** the acting principal when the platform authors the commit on the user's behalf — otherwise UI-mediated commits collapse attribution into a bot identity and the audit question "who changed the PROD connection?" has no answer. One field, already in D-1's spirit.
2. **Reproducibility — sufficient as stated.** The law is mechanically testable ("re-resolve the source revision → identical exact refs") without freezing file syntax. `latest`/name-matching/auto-select confirmed prohibited; the same law also excludes time-varying resolution ("most recently qualified") by construction, since re-resolution would differ.
3. **`owner-admissible for NEW adoption` — closes the class without stealing 3G.** Searched for a case where new adoption should proceed against an owner's non-selectable verdict: bug reproduction against a retired revision uses historical Release pins, not new adoption; rollback re-points a manifest, which is not adoption. No case survives. The narrowing is correct.
4. **Historical pins — verified safe.** Adoption prohibition and historical resolvability are disjoint by construction: adoption is a Project-intent write path; historical refs resolve under 3F-01 PRESERVE horizons. Sharpening worth one sentence in the draft: **rollback eligibility may fail for its own reasons (C-014 schema rule) but never because a pinned binding target has since become non-adoptable** — re-pointing resolves pins, it does not re-adopt.
5. **Qualification — confirmed.** Advisory at set-time; the UI badge reads live from the Connections owner at render; nothing persisted in `prj.*`. The one temptation ("cache the badge") is a stale-mirror seed and stays prohibited.
6. **Connection shape — nothing deletable.** The one candidate (derive `connectionId` from the revision ref) is barred twice: 3E-02 froze the pair explicitly, and the pair encodes two genuinely distinct intents — "use THIS Connection" (stable identity) and "at THIS revision" (exact content). The redundancy is safe because `REVISION_RELATION_INVALID` is checked at set-time.
7. **Brain pair — irreducible, re-confirmed.** The two components change for independent reasons (Workspace publishes; Project adopts); each derivation direction re-creates a named failure class (embedding → churn/split authority; deriving artifact from revision → live inheritance of mappings).
8. **Artifact reuse after revalidation — holds against the strongest attack.** The hard case is semantic drift under a stable logical ID between BR-12 and BR-13. Embedding the Brain digest would only force a human re-look — and that human decision point **already exists**: SetProjectBinding is an explicit human-initiated adoption. Embedding adds no detection power (if the artifact's conformance assertions pass, no mechanism detects the drift either way) and costs churn + split authority. No semantic class requires it.
9. **CAS — sufficient; no generation, no set-level concurrency.** Keys are independent; concurrent SETs on different slots don't interact; Release composition reads a consistent snapshot in one transaction. `ABSENT | exact prior ref` covers first-bind races and replacement races completely.
10. **UNBIND Git-first — confirmed.** Removal is authored (binding entry removed from source), committed, adopted with CAS. No DELETE-only path exists; history preserved.
11. **Closed union — confirmed.** Four concrete operations, each owning its invariants. A `{kind,target,payload}` shape would move validation to runtime dispatch — failure class A of the parent round, verbatim.
12. **Failure classes — adequate.** `BINDING_TARGET_NOT_ADOPTABLE` + `PROJECT_BINDING_MUTATION_NOT_ADMITTED` absorb D-3 without lifecycle labels; `BINDING_SOURCE_NOT_REPRODUCIBLE` is the right new class for the Git-first law. Nothing missing that changes fields or invariants; literal codes stay later-3F.
13. **No BindingSet — final.** The rollback construction fails: re-validation reads manifest refs directly (C-014 revalidação leve), and "what changed between releases" is a manifest diff. A `bindingSetDigest` remains a second commitment over the same facts — drift surface, no consumer.
14. **Runtime — re-confirmed** via 3D-R1 §5 composition sources; no mutable current-intent lookup for PUBLISHED_APP/AGENT_RUN, ever.
15. **Validation evidence — no mandatory ref.** Final attempt found no failure class that pair + adoption-time ordering leaves open *while set-time validation remains advisory*. The 3N trigger stands.
16. **Buildability deltas:** UI-authors-Git-behind-the-scenes is **PROVEN in production — by Mitra itself**: the Studio UI drives commits to GitHub invisibly (SYNC/SHARE per turn, code viewer reads GitHub, sandbox discarded — only Git survives). The exact interaction shape this contract needs, live at commercial scale. Owner-admissibility checks and the closed union are CONVENTIONAL. Zero new probes.
17. **Global Maximum — no Material Finding.** The Git-only path is the smallest coherent authority model (a dual path adds a source-less authority and solves nothing); every prior-authority contact point in C2.16's list checks out.
18. Draft below.

## F2.3 Product-experience pass

Guardrail applied: *rigorous architecture underneath; simple experience on top.* For each mechanism — what stays internal, what the user must understand, how a normal person acts, leakage check, and whether a simpler experience exists that keeps the invariants.

| Mechanism | Internal (never surfaces) | User concept | Control Plane action |
|---|---|---|---|
| Connection binding | exact ConnectionRevision ref, Git commit, adoption, CAS ref | "Which connection does this project use in Production / Development / Preview?" | Project → Connections: one row per purpose (friendly slot label), a dropdown of available connections per environment, **Test connection**, **Save** |
| revision pinning | digest/revision identity | "This project keeps using what you chose until you update it" | selection at Save silently captures the connection's current exact revision; later changes to the Connection surface as **"Update available → Update"**, never silent |
| CAS | expectedCurrentBindingRef | none | conflict renders as "This setting changed while you were editing — reload and try again" (the 3F-02 L3 refresh pattern) |
| Git-first authoring | file shape, commit, adoption flow | none | Save does it all; **History** shows who changed what, when — served by immutable versions + provenance |
| Brain binding pair | brainDigest, artifact revision, revalidation machinery | "This project uses the company Brain. An update is available." | **Review & update** → runs revalidation → adopts on success; on failure: "This update needs adjustments in the project" → routes to a Builder Change |
| UNBIND | version history semantics | "Stop using this connection for Production" | confirm dialog: *"Future publishes requiring it will fail until you choose another. **The currently published version is not affected.**"* — Release immutability spoken in product language |
| qualification advisory | qualification records | "Not tested yet" | badge: "You can save this, but publishing will require a successful connection test" — bindable-but-unreleasable, translated |
| absence fail-closed | resolution law | "Production connection: not set" | required slots appear as a proactive checklist instead of a publish-time surprise; fail-closed unchanged underneath |

**Leakage verdict:** zero necessary leakage. Digest, revision, CAS, Git, adoption, binding versions — none of them needs to exist in the user's vocabulary. Every invariant has a faithful product-language surface, including the subtlest one (Release immutability = "your published version is not affected").

**Simpler-experience test:** the simplest candidate UX — "pick a connection, Save" — is exactly what the architecture supports, *because* selection-time capture resolves to an exact revision deterministically. The seemingly friendlier alternative ("just always use the connection's latest") is failure class B (live inheritance). Simplest honest UX and rigorous architecture coincide; neither is paying a tax for the other.

Two contract-level rules fall out of this pass and enter the draft:

```text
UX-1  selection-time capture: the authoring layer resolves a user's resource
      selection to the exact revision at Save; the authored source always
      contains exact refs (this is HOW reproducibility and a simple UX coexist)

UX-2  update-available is a read-only derived projection (pinned ref vs
      owner's current); it never auto-adopts — adoption is always an explicit
      user action through the same single path
```

## F2.4 Proposed 3F-04 decision text (smallest operator-facing form)

---

> ### 3F-04 — Project Binding Contract Architecture (DRAFT)
>
> **Decision in one sentence:** Conexus F1 freezes two distinct typed Project binding contracts — `ProjectConnectionBinding` as an immutable pointer version `(project, slot, consumerTarget) → exact Connection + exact ConnectionRevision`, and `ProjectBrainBinding` as an immutable adoption of the exact pair `Brain revision + brain-binding/v1 artifact revision` — sharing laws but no base type, authored exclusively through the Project's canonical Git source and adopted into Hub current authority via the single `SetProjectBinding` flow with expected-current CAS, validated by their specialized owners, frozen exactly by Releases, and surfaced to users as simple product choices with zero internal machinery leakage.
>
> **1. Two contracts, shared laws, no base.** `ProjectConnectionBinding ≠ ProjectBrainBinding`; they share laws only: Project-owned current intent; immutable historical versions; Git-first reproducible source with mandatory per-version provenance; expected-current CAS on SET and UNBIND; same-Workspace/owner-scope fail-closed checks; no implicit fallback or live inheritance; set-time specialized-owner validation; Release pins exact adopted refs; active Release/AgentRun never re-resolve mutable current intent; explicit CAS-protected UNBIND. No `Binding<T>`, `BindingSet`, `BindingEngine`, generic payload, or `connection-binding` Registry kind.
>
> **2. The asymmetry is principled.** `brain-binding/v1` is authored semantic **content** (logical→local mappings, assertions, refinements) with an independent compiler/reader — hence a Registry artifact. `ProjectConnectionBinding` is a **pointer pair** with no compiled content and no independent reader — hence a Project record, not an artifact. Symmetry arguments die here.
>
> **3. Single Git-first authoring path.** F1 has exactly one binding mutation path: binding intent is authored in the Project's canonical repository (directly or by the Control Plane authoring the commit on the user's behalf) → the source revision becomes immutable provenance → `SetProjectBinding` validates and adopts the exact resolved intent into Hub current authority. **No DB-only mutation path exists.** Provenance per version records the source revision **and the acting principal**. The authored source must resolve deterministically to the exact adopted refs — no `latest`, no name-matching, no auto-selection, no time-varying resolution (`BINDING_SOURCE_NOT_REPRODUCIBLE` otherwise). Emergency Hub-only rebind is rejected as a consumer (it could not alter a pinned active Release anyway); a future break-glass capability returns only by Decision Loop.
>
> **4. ProjectConnectionBinding.** Logical current key `(project, slot, consumerTarget)`; `slot` is the single Project-local symbolic purpose key (no separate free-form `purpose`; no universal slot catalog; never name-inferred); `consumerTarget = DEV | PREVIEW | PROD` closed. Immutable version content: Project, slot, consumerTarget, exact Connection identity, exact ConnectionRevision ref, source provenance, version identity — nothing else. Never copied in: credential material/handle, ConnectorDefinition digest, external environment, health, qualification, operation allowlists, Release refs. Effective execution authority remains the intersection of connector contract ∩ Connection eligibility ∩ binding ∩ Release ∩ tool/artifact classification ∩ caller authority ∩ policy ∩ Gateway admission. Absence of a required `(slot, consumerTarget)` binding **fails closed at the consumer gate; no selector ever resolves through another selector** — equal values across selectors are explicit data, not inheritance. `AGENT_RUN` and `PUBLISHED_APP` are not selectors: they consume run-pinned/Release-pinned composition (3D-R1 §5). Multi-account = distinct explicit slots; pools/failover are future decisions.
>
> **5. ProjectBrainBinding.** Current authority is the exact pair `Brain revision/digest + Project-scoped brain-binding/v1 artifact revision/digest`, plus immutable version identity, current selection and provenance. Semantic payload lives **only** in the artifact; `prj.brain_binding` never mirrors mappings/assertions/validation results. `brain-binding/v1` does **not** embed the target Brain digest (source churn + split authority); the same artifact may be adopted with a newer Brain revision **only after explicit specialized revalidation** — never by live inheritance. Trace identities behave as C-011 requires: `brainDigest` moves, `projectBindingDigest` may remain stable.
>
> **6. Adoption admissibility.** At set-time, owners validate structurally: existence, revision-relation, scope (cross-Workspace always fails closed; scope derived server-side), Project lifecycle admits mutation, and the target is **owner-admissible for NEW adoption**. 3F-04 freezes new-adoption admissibility semantics, not lifecycle state names (3G). Historical pins in Releases/evidence are never invalidated by later non-adoptability; rollback re-points a manifest and never re-adopts. Qualification is **not** a set-time requirement: a structurally valid but unqualified binding is legitimate intent that remains unreleasable until the Release/conformance gates pass; set-time qualification status is advisory, read live, never persisted into the binding.
>
> **7. CAS and UNBIND.** SET and UNBIND require `expectedCurrentBindingRef = ABSENT | exact prior binding-version ref`; mismatch fails closed as stale expectation (3F-02 L3 family). UNBIND is authored in Git and adopted like any mutation: removes current intent, preserves all historical versions, never touches an existing Release; consumer gates subsequently fail closed where a binding is required. No binding-generation framework; no set-level concurrency object.
>
> **8. `SetProjectBinding` surface.** One L7 flow (3D-03) with a closed discriminated input: `SET_CONNECTION | SET_BRAIN | UNBIND_CONNECTION | UNBIND_BRAIN`, each with its own typed fields/invariants (per C2.12). No `{kind, target, payload}`. Browser surface follows 3F-02 F3 rules; authority derived server-side.
>
> **9. Three-layer authority law.** Git source revision = what was authored; Hub current binding ref = which immutable version is current Project authority; ReleaseManifest = which exact composition was frozen for serving. Therefore: new commit ≠ current binding; new current binding ≠ active Release changed; new Workspace resource revision ≠ Project binding changed. No `BindingSet`/`bindingSetDigest` — the ReleaseManifest digest already commits the composition; a second aggregate is pure drift surface.
>
> **10. Failure semantics** (classes now, codes later-3F): `PROJECT_BINDING_MUTATION_NOT_ADMITTED`, `BINDING_SOURCE_NOT_REPRODUCIBLE`, `BINDING_REQUIRED_BUT_ABSENT`, `BINDING_SCOPE_MISMATCH`, `BINDING_TARGET_NOT_ADOPTABLE`, `BINDING_EXPECTATION_STALE`, `BINDING_REFERENCE_INVALID`, `BRAIN_BINDING_INCOMPATIBLE`. Qualification-not-PASS is not a mutation failure. All per 3F-02: exhaustive owner mapping, no locus on wire, code-scoped details only with a named consumer.
>
> **11. Product-experience principles.** Rigorous architecture underneath; simple experience on top — binding machinery never leaks: users act on "Use this connection", "Production", "Test connection", "Save", "Update available → Update", "Stop using" — never on digests, revisions, CAS, Git or adoption. Two normative rules make this coexistence work: **UX-1 selection-time capture** — the authoring layer resolves a user's selection to the exact revision at Save, so the authored source always carries exact refs; **UX-2 update-available is a read-only derived projection** (pinned vs current) that never auto-adopts — adoption is always an explicit user action through the single authored path. Conflicts surface as "changed while you were editing — reload"; UNBIND confirms with "the currently published version is not affected" (Release immutability in product language); required-but-absent bindings surface as a proactive setup checklist. No UX simplification may bypass authority, auditability or fail-closed behavior; no internal complexity may be imposed on the user because it exists internally.
>
> **12. Non-goals.** Everything in parent §15, plus: dual authoring paths, break-glass rebind (Decision Loop only), persisted qualification/health snapshots, embedded Brain digest in `brain-binding/v1`, mandatory `brn.binding_validation` ref (3N trigger only), auto-adoption of updates, generic `{kind,target,payload}` mutation.
>
> **13. Routed onward.** Lifecycle state machines/labels, binding status FSM → 3G; approver/authority enforcement → 3I; authored file schema, literal codes, per-code details → later 3F/implementation; Release/composition end-to-end proof → 3N/3O; per-family UI realization → 3K.
>
> **14. Buildability disposition.** Nothing UNSUPPORTED; zero new probes. Symbolic slots and UI-authors-Git-behind-the-scenes are PROVEN in production (Mitra: `connection:'sankhya'` handles; Studio commits to GitHub invisibly); immutable versions + CAS are PROVEN in-house (MNFS plan revisions, lease core); the rest is conventional over frozen machinery.

---

## F2.5 Closing verdict

All eighteen questions converge; the UX pass strengthened rather than strained the contract; no material question remains open — the one operator-level choice this dialogue surfaced (authoring path) is resolved inside the draft as the single Git-first path with the platform authoring commits behind the UI, per C2.2's acceptance of my Round 1 recommendation.

```text
READY FOR OPERATOR APPROVAL
```

No indispensable corrections beyond the draft above; the two UX rules (UX-1/UX-2) and the acting-principal provenance precision are already folded in.

No LEDGER or authority file was modified in this round.
