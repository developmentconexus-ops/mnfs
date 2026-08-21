# Fable Review — Realization Planning

> Temporary non-authoritative review channel. Candidate authority remains `agent/realization-planning`; this file must never merge.

## Lead handoff

Repository: `developmentconexus-ops/conexus-os`
Candidate branch: `agent/realization-planning`
Candidate HEAD: `0fc7a7c4eedff1121056971335eb11fdfb69deb4`
Draft PR: `#52`
Review branch: `review/realization-fable`

Reconstruct authority strictly from:

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ docs/phases/realization-planning.md
→ docs/development/production-realization-guide.md only where the realization-research protocol itself is under challenge
```

Add one current owning reference only when a concrete finding requires it. Repository current authority > this handoff > reviewer opinion/research.

Apply DevelopmentConexus Engineering Method v1.0.0 and Repository Standard v1.0.0. This is an independent adversarial review, not agreement seeking.

### Candidate claim to attack

`CURRENT STRUCTURE CONFIRMED`: the smallest honest first build for the read-only Sankhya Budget Analyzer can be realized through R1–R7 without reopening C-018/3L, adding semantic owners, or manufacturing unused platform capabilities.

### Review focus

Challenge whether the candidate:

1. is genuinely the smallest sustainable first build and not a hidden platform bootstrap;
2. preserves every applicable `3N-V01..V28`, Architecture §42 and `3O-P1..P7` obligation without fake execution or silent waiver;
3. marks `NOT_INSTANTIATED` only where the protected surface is truly unreachable;
4. preserves FIRST_PRODUCTION obligations without DEV imitation;
5. keeps Keycloak strictly as authentication/OIDC mechanism while Conexus remains sovereign over Account/session/membership/grants/Published-App/Product authorization;
6. chooses standards/native/mature mechanics before custom machinery through the realization research protocol, without turning research/reference practices into ceremony or second Product authority;
7. keeps `REFERENCE_ONLY` useful without making reference technologies implicit requirements;
8. preserves Hub-outbound Z3/guest topology by not introducing guest→private-Hub inbound reachability;
9. handles Mastra repin correctly: no inheritance of old pins, no volatile latest, exact defect-class floor, only affected requalification, and no Mastra Product surface manufactured for this vertical;
10. can establish an independent live Sankhya oracle + honest common comparison coordinate + deterministic negative control without candidate self-reference;
11. keeps Gateway from becoming a generic mediator/God component and MAR from becoming a generic scheduler/workflow platform;
12. does not instantiate too much or too little durable authority from the closed 46-class architecture inventory;
13. makes Release/Promotion/SERVED_VERIFIED and independent Published App authorization reachable with the minimum required machinery;
14. preserves CR-1 current-authority serialization × owner isolation without prematurely selecting an implementation primitive;
15. introduces no hidden architecture reopen through Keycloak, OIDC session handling, Brain minimum semantics, read-model sync, frontend, or Release mechanics.

### Evidence/research rules

Use current primary sources, Context7, exact framework/source inspection, validated implementations or production references only where they materially improve a finding. A reference is Evidence, never requirement authority. Prefer `ADOPT | ADAPT | BUILD | DEFER | STOP`; identify a better Global Maximum only when it reduces total complexity while preserving all accepted invariants.

### Finding format

For each material finding record:

```text
ID
severity/materiality
claim being challenged
current authority violated or assumption falsified
Evidence
why it matters
smallest correction or owning decision to reopen
whether it changes Product/owner/trust/qualification authority
```

Do not propose Product implementation. Do not merge. Do not edit candidate files from this review branch. Write all reviewer dialogue/findings only below this line in this file.

---

## Fable

### Review identity

```text
Reviewer:         independent Fable (fresh adversarial pass; prior C-018 global review context)
Candidate:        agent/realization-planning @ 0fc7a7c4eedff1121056971335eb11fdfb69deb4
Candidate CI:     verify = success on exact head
Review delta:     review/realization-fable − candidate = docs/work/current/ai-dialog.md only (git diff --stat verified)
Authority route:  AGENTS.md → docs/index.md → docs/roadmap.md → phases/realization-planning.md
                  → development/production-realization-guide.md; owning references pulled only where a
                  finding required them (release-deployment §12/§35/§36, data §5.7/§6, 3N-V24 text,
                  mastra qualification triggers @ main 1f76fb3)
Bootstrap budget: AGENTS + index + roadmap = 11,759 bytes ≤ 20 KiB on candidate
External checks:  mastra-ai/mastra PR #21725 merge = 84a5b699f84d6bae0a34efe5a970d891090b9f41 (verified),
                  PR #21996 merge = 7c60df5c7872343fbac5c3e5b1175c8076a5abfd (verified),
                  7c60df5 descends from 84a5b69 (compare status "ahead", verified),
                  issue #21975 title matches and reproduces on 1.60.0 (verified)
```

### Verdict

```text
Candidate claim (CURRENT STRUCTURE CONFIRMED, smallest honest first build)
= SURVIVES WITH BOUNDED CORRECTIONS

Material findings                  4 (all bounded plan/guide corrections; none falsifies the slice
                                     decomposition, the R1–R7 order, or the exclusion list)
Non-material findings              4
C-018 / 3L reopen required         NO
Semantic owner / trust change      NO
New Product requirement            0
Hidden platform bootstrap          NOT FOUND — every instantiated surface sits on the vertical's
                                   critical path under accepted law (no-mutable-latest serving forces
                                   Release/Promotion; semantic admission forces Brain binding; governed
                                   source access forces Connection/Gateway; nothing further shrinkable
                                   without reopening ratified authority)
NOT_INSTANTIATED honesty           PASSES with one exception (RF-02 / 3N-V24)
Mastra repin handling              CORRECT — G0.1's exact-SHA floor, 1.60.0 denial and
                                   affected-criteria-only route were independently reverified against
                                   upstream and are consistent with the main-side realization repin guard
Z3 / guest topology                PRESERVED — no guest runtime, no inbound path
Oracle / comparison boundary       HONEST — G0.2 refuses to invent the coordinate and stops
                                   INDETERMINATE instead of compensating
```

### Focus-point sweep (handoff items 1–15)

```text
1  smallest sustainable        YES with RF-03 caveat — attempted further deletions (defer Release
                               machinery, hardcode semantics, skip Brain, serve unpinned) each violate
                               ratified law; the plan is the constitutional minimum, not a bootstrap
2  obligations preserved       YES except RF-02 (V24 disposition too narrow) and RF-03 (one
                               Release-owner law un-dispositioned); no fake execution found; the V16
                               note is a model of honest non-relabeling
3  NOT_INSTANTIATED honesty    28/28 IDs dispositioned exactly once; V24 is the one contested call
4  FIRST_PRODUCTION            preserved without DEV imitation; §14 recertification classes are
                               explicit — but omit the new IdP dependency they now rest on (RF-01)
5  Keycloak sovereignty        boundary design is correct (authentication mechanics vs Conexus
                               authorization split, no role-import, negative controls defined);
                               residual defects are recovery/topology closure (RF-01), decision
                               registration (RF-04) and one weasel qualifier (N-3)
6  research protocol           proportional — ADOPT/ADAPT/BUILD/DEFER/STOP with claim-relative
                               sources; no ceremony found; REFERENCE_ONLY correctly epistemic
7  REFERENCE_ONLY              useful and fenced — guide §3.4 examples explicitly block reference→
                               requirement conversion
8  Z3 outbound                 preserved — E2B/guest wholly absent; V05 names the constraint
9  Mastra repin                verified sound (see External checks); no Product Mastra surface
                               manufactured; packaging delay = dependency stop, not 1.60.0 permission
10 oracle + coordinate         constructible as contracted; G0.2 is the strongest part of the plan —
                               it converts the hardest unknown into a bounded pre-build probe with an
                               honest INDETERMINATE stop
11 Gateway/MAR scope           bounded — Gateway is read-only egress + server-derived binding; MAR is
                               one sync consumer + serving route; no mediator/scheduler drift
12 durable budget              coherent subset of the 46 closure; instantiated FK endpoints all
                               resolve inside the subset; two notes: identity mapping must stay an
                               iam.account attribute, not a 47th class (folded into RF-01), and
                               prj.config_contract_revision admission is correctly consumer-gated
13 Release/serving minimum     reachable with minimum machinery; the R6-before-R7 ordering argument
                               (§8.1) is correct and preserves job-admission law
14 CR-1                        preserved without premature primitive; the substitution clause is
                               honest; see N-2 for the atomicity-set boundary note
15 hidden reopen               none found beyond the bounded corrections below
```

### Material findings

#### RF-01 — Keycloak persistent state is outside the accepted recovery/topology closure its own authority classes now depend on

```text
severity/materiality       MATERIAL — bounded plan/guide correction; highest of this review
claim challenged           §14 "first-production obligations preserved, not imitated" +
                           guide §5 Keycloak ADOPT are complete for the instantiated authority classes
authority/assumption       release-deployment §35.3 (in-guest component enumeration), §36.1 required
                           recovery set, §36.7 RTO meaning; plan §14 recertification classes;
                           data §6.5.1 record-class admission law
Evidence                   Keycloak is a stateful trusted component: realm, user and credential state
                           in its own persistence. §36.1's required recovery set (hub_control, Project
                           DBs, mastra_par, bytes, credential backing, keys, Git bundles, manifests)
                           does not contain it; §35.3's guest enumeration does not contain it; plan
                           §14 recertifies iam.session/access facts but not the IdP state those
                           recertifications presuppose; guide §5.3 binds iam.account identity to
                           (issuer, subject), which is realm-scoped state inside Keycloak
why it matters             Two concrete first-production failure classes: (a) a restore per the
                           accepted set restores a platform no human can authenticate into — login is
                           a prerequisite of "useful safe platform service", so RTO ≤ 8h is breached
                           by construction; (b) a rebuilt realm issues new subject identifiers,
                           orphaning every iam.account mapping and inviting manual remapping under
                           pressure — an authority-fabrication path during recovery, exactly the class
                           3M exists to deny. First build is non-production, so nothing is violated
                           today; but this plan is the artifact that routes FIRST_PRODUCTION
                           obligations, and it routes them over a dependency it does not close.
smallest correction        In plan §14 (or guide §5): (1) declare Keycloak realm/credential state part
                           of the required recovery closure for first production — one consistent
                           generation, custody statement, restore-time (issuer, subject) continuity
                           proof — OR an explicit accepted-loss posture with an operator
                           re-provisioning procedure that structurally cannot silently remap existing
                           accounts; (2) record that the first-production in-guest topology gains one
                           component, routed through the owning operations/release reference when
                           first-production planning lands; (3) state that the (issuer, subject)→
                           account mapping is an iam.account attribute, not a new durable record class
authority change           NO Product/owner/trust/qualification change — trusted identity
                           infrastructure classifies inside existing zones; only closure completeness
```

#### RF-02 — 3N-V24 `NOT_INSTANTIATED` is too narrow: the served frontend composition is caller-addressable storage-object retrieval

```text
severity/materiality       MATERIAL — proof-routing honesty (handoff foci 2/3)
claim challenged           §9 "3N-V24 NOT_INSTANTIATED — no private attachment/blob or
                           caller-addressable storage-object capability"
authority/assumption       3N-V24 "storage object key bypassing owner authorization"; data §5.7
                           (key/digest possession is never authorization); MAR §27.1 serves "exact
                           digest-addressed verified frontend/runtime composition"; Product Contract
                           scenario row "Blob owner not authorized → storage key possession does not
                           grant read; deny"
Evidence                   R5/R6 serve the Published App as digest/content-addressed assets over HTTP.
                           Any LAN client can request an asset path directly. Either the serving route
                           authorizes before streaming bytes — in which case the V24-class boundary IS
                           instantiated and reachable — or app-shell assets are served pre-auth, which
                           is an explicit exposure decision ("public exposure only through explicit
                           admitted Product policy"), not an inherited default
why it matters             As written, the disposition waives a reachable falsifier by narrowing
                           "storage object" to the absent att.* surface while the instantiated
                           serving path retrieves storage objects on a caller-driven route. This is
                           precisely the silent-waiver class §19 item 3 forbids
smallest correction        Re-disposition V24 to EXECUTE for the serving-byte path with a §15 negative
                           control ("asset/data fetch without current Published App authorization is
                           denied"), OR record an explicit bounded pre-auth-app-shell admission (login
                           shell only, no business data in pre-auth assets) plus a negative control
                           proving data-bearing responses remain authorized
authority change           NO — disposition/routing correction only
```

#### RF-03 — ComposeRelease/Promotion "current proof" recheck has no first-build disposition without `bld.change_acceptance`

```text
severity/materiality       MATERIAL-LOW — one plan line prevents a bad implementation fork
claim challenged           §5 budget (bld.* wholly absent) + §8 R6 compose/promote are jointly complete
authority/assumption       release-deployment §12.6: "change_acceptance/current proof → rechecked at
                           ComposeRelease → rechecked immediately before material Promotion steps";
                           ReleaseManifest law includes "verification/validation Evidence digest"
Evidence                   First build has no Change lifecycle, so the object §12.6 names does not
                           exist; the plan never says what satisfies the recheck in R6
why it matters             The implementation fork is: (a) manufacture a fake bld.change_acceptance
                           row — violating the slice budget and the no-manufacturing law; or (b) skip
                           the admissibility recheck — silently weakening §12.6's protected property
                           (stale/inadmissible proof refuses progression). A plan exists to pre-decide
                           exactly this kind of fork
smallest correction        One line in §8/§9: first-build Release admission rechecks the candidate
                           verification Evidence digests composed into the manifest as the "current
                           proof" subject; the bld.change_acceptance side of §12.6 inherits its
                           original route when Builder is first instantiated
authority change           NO
```

#### RF-04 — The first material realization technology decision (Keycloak) is not discoverable through the decision register

```text
severity/materiality       MATERIAL-LOW — authority-surface/registration defect
claim challenged           guide §5 is a sufficient home for the Keycloak ADOPT/ADAPT decision
authority/assumption       Repository Standard §8 (a fresh actor discovers current decision
                           disposition without review chronology); METHOD §2 non-degradable minimum
                           for material decisions (citeable decision + invariant + proof strategy +
                           reopen triggers)
Evidence                   decisions/index.md has no row; guide §5 carries decision, invariant and
                           negative controls but no reopen trigger for the selection itself (only
                           exact-version revalidation); a "companion / DERIVED" guide holding a
                           security-relevant technology selection drifts toward a second decision
                           authority — the exact risk handoff focus 6 names
why it matters             Auth-provider selection is material (security property, external stateful
                           dependency, hard to reverse once real accounts exist). Its disposition,
                           consequences and reopen trigger belong on the register surface fresh
                           actors actually consult
smallest correction        On acceptance, add one decision-register row (disposition CURRENT):
                           Keycloak = authentication mechanism via narrow OIDC boundary; Conexus I&A
                           authorization sovereignty preserved; consequences include RF-01's recovery
                           closure; reopen triggers = real SSO/SCIM/passkey requirement, security
                           advisory class affecting the pinned release, IdP unfit for topology
authority change           NO new authority — registration of an already-drafted decision
```

### Non-material findings

- **N-1 — audit-required classification left implicitly empty.** The slice instantiates privileged mutations (grant changes, Connection secret entry, Promotion) while `obs.*` is absent. Under the three-degradation-class law, "audit-required → FAIL CLOSED" binds only classified operations, and nothing classifies any yet. Defensible for a single-operator non-production first build — but say it out loud: one plan line ("the first slice classifies zero operations audit-required; classification lands with the OBS first consumer / first production") prevents waiver-by-omission. Worth the line; not blocking.
- **N-2 — CR-1 vs the closed cross-owner atomicity set.** `PromoteRelease` is not one of the two accepted cross-owner atomicity entries, so the CR-1 realization must serialize against revoke/narrow without a same-transaction write into `iam`. The plan's open-primitive stance is correct; note only that if implementation Evidence shows a third cross-owner transaction is genuinely required, that is a data-owner Decision Loop, never an implementation convenience. Already implicitly covered by §16; no change required.
- **N-3 — guide §5.3 escape qualifier.** "confidential server-side OIDC client **where the selected Node OIDC library supports the required deployment shape**" — the qualifier lets a library choice downgrade confidentiality. The Hub is server-side; no deployment shape in this plan makes a public client acceptable. Delete the qualifier or invert it ("a library that cannot support a confidential client is not admissible").
- **N-4 — parallel admission procedures.** Guide §5.5's exact-version admission steps for Keycloak duplicate the intent of RP-G0.3's supply-chain gate. One cross-reference ("Keycloak admission runs under RP-G0.3 discipline") avoids two drift-prone procedures for the same property. Optional.

### What was independently verified rather than trusted

1. Both upstream Mastra fix merge commits, their ancestry relation, and the #21975/1.60.0 reproduction claim (see External checks) — G0.1's Evidence is real, current and correctly used; it matches the realization repin guard merged to main at `1f76fb3`.
2. Candidate CI green on the exact head; bootstrap budget within law; review-branch delta is this file only.
3. The 3N applicability manifest covers all 28 IDs exactly once; the §42 family table covers all 12 families; no ID or family dropped or duplicated.
4. The instantiated record subset's Tier-2 FK endpoints all resolve inside the subset; no new record class is introduced (with the RF-01 note that the identity mapping must stay an attribute).

### Conclusion

The plan survives adversarial challenge as genuinely the smallest honest first build: the strongest deletion attempts run into ratified law rather than plan preference, and the strongest missing-complexity attacks either land as the four bounded corrections above or are already handled by the plan's own stop conditions. None of RF-01..RF-04 reopens C-018, 3L, an owner, or a trust boundary; all four are correctable inside this planning candidate. G0.2 deserves specific recognition: converting the comparison-coordinate unknown into a pre-build probe with an honest `INDETERMINATE` stop is the difference between a proof contract and proof theater.

```text
Fable realization-planning review = COMPLETE
Recommended gate outcome = ACCEPT AFTER BOUNDED CORRECTIONS RF-01..RF-04 (+ optional N-1/N-3 lines)
Round 2 justified = only if a correction materially changes the slice decomposition or scope
```

