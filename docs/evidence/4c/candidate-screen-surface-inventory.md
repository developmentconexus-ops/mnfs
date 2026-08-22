# 4C — Candidate Screen / Material-Surface Inventory

> **Status:** CANDIDATE / 4C-5
> **Authority posture:** derived from the operator-accepted-for-progression 4C-4 candidate IA, the green 4C-0→4C-3 foundation and current accepted Product authority. This document does not create Product operations, DTOs, authorization, runtime behavior, implementation authority or final visual structure.
> **Method:** `docs/development/frontend-product-experience-planning-method.md` v2.1 profiled by the Conexus 4C contract.

4C-5 answers one question only:

> Which candidate route/pages and material sub-surfaces are necessary to complete accepted human work without turning endpoint count, backend topology or visual convenience into screen authority?

4C-4 remains CANDIDATE and is not `LOCKED`. Operator acceptance of 4C-4 authorized progression to this inventory only.

```text
4C-0→3 foundation                    = GREEN
4C-4 candidate IA                    = ACCEPTED FOR PROGRESSION / NOT LOCKED
4C-5 candidate screen inventory      = THIS DOCUMENT
4C-6/7 reference + hypotheses        = NOT STARTED except already-bounded 4C-4 IA research
4C-8 rendered structural wireframes  = NOT STARTED
4D Paved Road/runtime                = NOT STARTED
Product implementation               = BLOCKED
```

---

## 1. Surface-splitting law

A Product operation does not imply a screen. Multiple operations may share one human surface when they serve one coherent job and preserve one semantic context.

A separate material surface is justified only when one or more change materially:

```text
primary semantic truth
safe user action
write owner
identity source
concurrency / idempotency behavior
content exactness / integrity
security / disclosure context
recovery path
viewer / editor mode
```

Recognized candidate surface kinds:

```text
ROUTE_PAGE
MATERIAL_REGION
DRAWER_MODAL
INLINE_COMPOSITION
ALTERNATE_VIEW
MATERIAL_STATE_VARIANT
APP_COMPOSED_SURFACE
```

Exact URL paths, component boundaries, responsive placement, visual density and reusable component APIs are not selected here.

---

## 2. Global Control Plane + Workspace candidate surfaces

| Surface ID | Candidate surface | Kind | Human job / truth | Material boundary / reason |
| --- | --- | --- | --- | --- |
| CP-S01 | Access & context frame | `INLINE_COMPOSITION` | know the current authenticated Account/session and current disclosable Workspace context; end session safely | global session/context truth; never owns grants |
| CP-S02 | First access / Workspace chooser | `ROUTE_PAGE` + bounded create modal | enter an authorized Workspace or create the trusted F1 Workspace when eligible | first-access recovery differs from normal Workspace work |
| CP-S03 | Trusted Account provisioning | `ROUTE_PAGE` / privileged internal surface | provision a known human Account at the trusted F1 operator boundary | platform-operator-only; not public signup and not normal Workspace IA |
| WS-S01 | Projects | `ROUTE_PAGE` | browse current disclosed Projects and start Project creation | primary Workspace work entry |
| WS-S02 | Project create / source-association flow | `ROUTE_PAGE` or `DRAWER_MODAL` candidate | establish one Project under an exact Workspace and continue to inception | Project creation is a bounded command; import/source association must not invent a second generic mutation API |
| WS-S03 | Workspace Agent catalog | `ROUTE_PAGE` | browse accessible Project-owned Agents across the Workspace | filtered projection only; never a fleet owner |
| WS-S04 | Workspace Brain overview | `ROUTE_PAGE` | inspect Brain identity, immutable revisions and health/provenance | reusable Workspace semantic authority differs from Project binding |
| WS-S05 | Brain discovery + proposal review | `ROUTE_PAGE` with material review regions | run bounded discovery, inspect proposals, decide/publish reviewed meaning | machine-propose/human-decide and publication authority require exact review states |
| WS-S06 | Connections browse / detail | `ROUTE_PAGE` | browse Connector definitions, Connections, revisions and qualification truth | Connection lifecycle owner truth; ownerScope visible |
| WS-S07 | Connection create / revise | `MATERIAL_REGION` or `DRAWER_MODAL` candidate | establish or revise a Connection without changing its semantic owner | consequential intake / current-revision semantics differ from browse |
| WS-S08 | Connection credential entry | `MATERIAL_REGION` / secure form | set a credential through the write-only secret boundary | write-only secret semantics require distinct handling; no secret readback |
| WS-S09 | Connection qualification | `MATERIAL_REGION` | run real-environment qualification and inspect qualification result | proof operation is not generic Save/Test URL behavior |
| WS-S10 | People & access | `ROUTE_PAGE` | administer Workspace membership, Areas and Project access | task-centered administration; does not imply Published-App business access |
| WS-S10A | Workspace membership | `MATERIAL_REGION` | list/add/remove Workspace members | membership current-authority subject differs from Project grants |
| WS-S10B | Areas + Area Project access | `MATERIAL_REGION` | list/create Areas and grant/revoke Area Project access | Area is organizational grouping, not software owner |
| WS-S10C | Direct Account Project access | `MATERIAL_REGION` | grant/revoke exact Account access to exact Project | Project grant is a separate current-authority subject |
| WS-S11 | Audit inspection | `ROUTE_PAGE` + detail surface | inspect immutable Workspace/Project audit records | evidence/provenance only; never current business state |

No generic Workspace `Settings` screen is created by symmetry. Current authority has no generic Workspace/Area metadata mutation after `4B-F01`.

---

## 3. Project candidate surfaces

| Surface ID | Candidate surface | Kind | Human job / truth | Material boundary / reason |
| --- | --- | --- | --- | --- |
| PRJ-S00 | Project context frame | `INLINE_COMPOSITION` | understand the exact current Project context and current disclosure | Project identity/context projection only; no generic Project metadata editor |
| PRJ-S01 | Project Inception / investigation | `ROUTE_PAGE` | inspect objective/users/constraints/source reality and run bounded investigation | Journey B is not a fake Change; source investigation is proof-oriented |
| PRJ-S02 | Approved Baseline review / decision | `MATERIAL_REGION` or focused route candidate | inspect exact Baseline candidate/current digest and approve only the current subject | exact decision subject / stale-candidate semantics justify a distinct block |
| PRJ-S03 | Build workspace | `ROUTE_PAGE` | state Change intent, inspect current Change/progress and keep build work centered | accepted primary Project workspace; Hub truth, not model narration |
| PRJ-S04 | Plan + checkpoint review | `MATERIAL_REGION` | inspect exact Plan revision and make an eligible checkpoint decision | decision/current-subject semantics differ from passive Build progress |
| PRJ-S05 | Preview lens | `ALTERNATE_VIEW` | inspect last-good/current candidate Preview honestly | Preview ready != verified/live; next candidate must not destroy last-good Preview |
| PRJ-S06 | Code/source lens | `ALTERNATE_VIEW` | inspect exact source tree/file revision | source read authority is distinct from Build mutation authority |
| PRJ-S07 | Diff lens | `ALTERNATE_VIEW` | inspect exact candidate/result lineage | immutable/source lineage truth differs from current editor state |
| PRJ-S08 | Findings + Evidence | `MATERIAL_REGION` / drawers candidate | inspect Findings/Evidence and close a Finding only with current resolution authority | review/provenance + exact decision semantics |
| PRJ-S09 | Change execution detail | `MATERIAL_REGION` / detail drawer | inspect subordinate WorkUnit/ActorRun facts for one Change | progressive platform detail; not a separate owner |
| PRJ-S10 | Contextual Conexus assistant | `INLINE_COMPOSITION` | ask about selected authorized Project context / next safe action | contextual helper; grants no new authority |
| PRJ-S11 | Data | `ROUTE_PAGE` with master-detail candidate | inspect declared Product/read-model resources, grain, freshness, coverage and provenance | declared Product resources only; never generic DB explorer |
| PRJ-S12 | Analytic Query interaction | `MATERIAL_REGION` / `APP_COMPOSED_SURFACE` depending admitted route | ask governed semantic analytical questions over exact Brain/dataset scope | owner is Brain/Gateway; exact placement between Data/Brain or Published App remains block-level design work |
| PRJ-S13 | Capabilities | `ROUTE_PAGE` with detail candidate | inspect exact authored/Release Queries/Actions without gaining invocation by inspection | capability identity/meaning differs from source and Integration mechanics |
| PRJ-S14 | Integrations / Project bindings | `ROUTE_PAGE` | inspect/set/remove exact ProjectConnectionBinding | Project use/binding differs from Connection lifecycle ownership |
| PRJ-S15 | Project-scoped Connections | `MATERIAL_REGION` inside external-system work | browse/manage private Project-owned Connection lifecycle separately from bindings | preserves Connection != Integration while avoiding a duplicate top-level backend-shaped domain |
| PRJ-S16 | Agents | `ROUTE_PAGE` with detail candidate | inspect Project-owned authored Agent identity/revisions/Release state | Agent authoring still flows through Change/Build, not a second Agent editor authority |
| PRJ-S17 | Agent triggers | `MATERIAL_REGION` | inspect/create/revise/enable/disable exact schedule triggers | TriggerRevision/current-state and archive narrowing laws are distinct |
| PRJ-S18 | Agent runs | `MATERIAL_REGION` | inspect AgentRun list/detail under current disclosure | runtime evidence; COMPLETED != every effect succeeded |
| PRJ-S19 | Project Brain binding | `ROUTE_PAGE` / focused resource page | inspect/set/clear exact Brain revision binding and health context | Project binding owner differs from Workspace Brain publication owner |
| PRJ-S20 | Releases | `ROUTE_PAGE` with Release detail | inspect immutable Release composition, conformance and serving state | Release AVAILABLE != Promotion != served verification |
| PRJ-S21 | Promotion | `MATERIAL_REGION` / focused action surface | inspect Promotion history/current state and promote an exact Release to an exact environment | consequential current-pointer decision / repeat-safe intake |
| PRJ-S22 | Activity | `ROUTE_PAGE` | browse Project activity entries that point back to owner facts | chronological projection; does not replace owner truth |
| PRJ-S23 | Execution observation detail | `MATERIAL_REGION` / detail drawer | inspect one closed typed execution observation | technical Evidence detail only |
| PRJ-S24 | Usage & cost | `MATERIAL_REGION` | inspect Project/run usage/cost with reported/inferred/missing provenance | missing != zero; calculated != provider/reconciled |
| PRJ-S25 | Effect attempts | `MATERIAL_REGION` / detail surface | inspect external effect attempt/reconciliation provenance | no Retry/MarkSucceeded authority; OUTCOME_UNKNOWN remains explicit |
| PRJ-S26 | Managed jobs | `MATERIAL_REGION` | inspect managed JobRuns and trigger an admitted run-now occurrence | Project job occurrence semantics; not universal scheduler domain |
| PRJ-S27 | Project audit | `MATERIAL_REGION` | inspect audit records scoped to the exact Project | governance evidence distinct from Activity/current state |
| PRJ-S28 | Exact ApprovalRequest | `MATERIAL_REGION` attached to exact AgentRun/context | list/inspect/decide only exact currently eligible approval subjects | no global Approval Center; exact sealed subject + current eligibility |
| PRJ-S29 | Project lifecycle management | `ROUTE_PAGE` / bounded management surface | archive or duplicate an exact Project with explicit preserved semantics | no generic Project update; archive != unpublish/stop automations |
| PRJ-S30 | Published-App access administration | `MATERIAL_REGION` | list/set/revoke exact app access/role under Project administration | app access is independent from Workspace/Builder membership |

Project-scoped Connection lifecycle is deliberately represented as a distinct material surface inside the Integrations work context. It preserves `Connection != Integration` without adding a second top-level Project destination by backend symmetry. If later operator walkthrough proves this harms findability, the smallest affected 4C-4/4C-5 decision reopens.

---

## 4. Published Application candidate surface families

Published Applications do not inherit Control Plane navigation. Their exact business IA is Project-defined from the active Release and admitted app authority.

| Surface ID | Candidate surface | Kind | Human job / truth | Material boundary / reason |
| --- | --- | --- | --- | --- |
| PA-S01 | Published-App access/session frame | `INLINE_COMPOSITION` | establish current app access/role context without exposing Builder authority | app authorization is independent from Control Plane access |
| PA-S02 | Project-defined business / analytic surface | `APP_COMPOSED_SURFACE` | consume exact active-Release business capabilities, including admitted AnalyticQuery when the app owns that journey | no universal platform page or generic execute UI |
| PA-S03 | Product Agent conversation | `APP_COMPOSED_SURFACE` | list/open/create Conversation and send turns to exact active Agent | Project-designed app context; exact Release/Agent pinning |
| PA-S04 | Agent run detail | `MATERIAL_REGION` | inspect exact AgentRun/receipts under app authority where admitted | runtime provenance differs from Conversation transcript |
| PA-S05 | Exact effect approval | `MATERIAL_REGION` attached to exact app/AgentRun context | inspect and decide exact sealed ApprovalRequest when current app route admits it | app role alone never confers approval eligibility |
| BUD-S01 | Budget Analyzer analysis dashboard | `ROUTE_PAGE` | run the exact accepted pending-budget analysis and understand current/stale/partial/unverified truth | first-vertical concrete business screen; no arbitrary metric/query builder |
| BUD-S02 | Pending budgets drilldown | `ROUTE_PAGE` or focused detail route | inspect exact pending-budget rows under the response/page result coordinate | drilldown has distinct row-level truth and paging coordinate semantics |

The Budget Analyzer two-screen candidate is semantic, not visual. Whether drilldown is a dedicated route, master-detail region or another structural hypothesis belongs to its later per-block cycle.

---

## 5. Material state-variant obligations

4C-5 does not duplicate every state into a new page. It records state variants only when truth/recovery materially changes what the user must understand.

| Surface family | Required material distinctions carried forward |
| --- | --- |
| Global/session | unauthenticated vs authenticated; denied vs absent/non-disclosable; session expiry/reauthentication |
| Build | working vs blocked vs waiting-for-user vs completed; current Hub truth vs model narration |
| Preview | last-good inspectable Preview vs next candidate building; ready vs verified vs live |
| Brain | inferred/proposed vs reviewed/published; UNVERIFIED/VALID/SUSPECT/INVALID/CHECK_ERROR |
| Connections | configured vs qualified vs bound vs healthy vs caller-authorized |
| Data/analytics/Budget | loading vs known-empty vs failed vs partial; SUPPORTED_CURRENT/STALE/PARTIAL/UNVERIFIED/UNSUPPORTED/DEPENDENCY_UNAVAILABLE |
| Releases | candidate verified vs AVAILABLE vs Promotion approved vs pointer switched vs SERVED_VERIFIED |
| Agent/effects | AgentRun completed vs effect success; pending/denied/stale/expired; OUTCOME_UNKNOWN without blind replay |
| Usage/cost | reported/inferred/missing; calculated/provider/reconciled distinctions where available |

These are later Screen Contract and wireframe obligations, not client-owned lifecycle state machines.

---

## 6. Material-block ledger for later 4C-6→4C-9 cycles

The inventory is intentionally not an all-at-once wireframe plan. Candidate surfaces are grouped into reviewable material blocks so one structural error does not propagate across the whole frontend.

| Block | Candidate scope | Why grouped | Reference / hypothesis trigger |
| --- | --- | --- | --- |
| `GF-01` | global frame + Workspace/Project navigation | first whole-product coherence checkpoint; later blocks inherit context/navigation | reference evidence already exists from 4C-4; competing hypothesis only if rendered global frame exposes real ambiguity |
| `W-01` | Projects + create/inception/Baseline | one continuous Journey B entry/outcome | high-impact flow; bounded references only if creation/inception structure is ambiguous |
| `W-02` | Workspace Brain + Connections | reusable enterprise context/resources | separate sub-blocks may be required because Brain review and secret/qualification behavior differ materially |
| `W-03` | People/access + audit | governance/admin work | conventional structure unless access complexity creates real ambiguity |
| `P-01` | Build + Plan/Preview/Code/Diff/Findings/Evidence/assistant | primary high-impact Project workspace | reference study triggered; likely competing structural hypotheses before lock |
| `P-02` | Data + Capabilities + Integrations + Project Connections + Brain binding | directly inspectable Product resources | Analytic Query placement and Project Connection findability are explicit candidate questions |
| `P-03` | Agents + triggers + runs + exact approvals | Product Agent lifecycle/runtime human work | approval placement is trust-critical; reference/hypothesis work triggered |
| `P-04` | Releases + Promotions + Activity + effect/job/usage/audit evidence | operate/inspect work | truth distinctions are high-impact; avoid deployment-dashboard flattening |
| `P-05` | bounded Project lifecycle + Published-App access administration | exact management actions only | no generic Settings symmetry |
| `PA-01` | Published-App platform frame + Product Agent surfaces | independent app authority | exact app composition varies; platform-owned boundaries must stay minimal |
| `BUD-01` | Budget Analyzer dashboard + drilldown | first vertical / proving instance | structural hypotheses likely for dashboard→drilldown relationship |

`GF-01` must be the first rendered global-frame block before later blocks inherit navigation as baseline.

---

## 7. Concrete operation-to-surface coverage

The table below is a coverage proof, not a screen count. Repeated mappings are allowed where the same admitted operation has multiple legitimate human ingress contexts. The set of mapped operation IDs must equal the current frontend-reachable concrete set.

| Candidate surface(s) | Concrete Product operation IDs |
| --- | --- |
| CP-S01 | `IAM-01`, `IAM-02`, `WS-02` |
| CP-S02 | `WS-01` |
| CP-S03 | `IAM-03` |
| WS-S01 | `PRJ-01` |
| WS-S02 | `PRJ-03` |
| WS-S03 | `PRJ-22` |
| WS-S04 | `BRN-01`, `BRN-02`, `BRN-03`, `BRN-10` |
| WS-S05 | `BRN-04`, `BRN-05`, `BRN-06`, `BRN-07`, `BRN-08`, `BRN-09` |
| WS-S06 / PRJ-S15 | `CON-01`, `CON-02`, `CON-03`, `CON-04`, `CON-09` |
| WS-S07 / PRJ-S15 | `CON-05`, `CON-06` |
| WS-S08 / PRJ-S15 | `CON-07` |
| WS-S09 / PRJ-S15 | `CON-08` |
| WS-S10A | `IAM-04`, `IAM-05`, `IAM-06` |
| WS-S10B | `IAM-09`, `IAM-10`, `IAM-11`, `IAM-12`, `WS-04`, `WS-05` |
| WS-S10C | `IAM-07`, `IAM-08` |
| WS-S11 / PRJ-S27 | `OBS-04`, `OBS-05` |
| PRJ-S00 | `PRJ-02` |
| PRJ-S01 | `PRJ-07` |
| PRJ-S02 | `PRJ-08`, `PRJ-09` |
| PRJ-S03 | `BLD-01`, `BLD-02`, `BLD-03`, `BLD-06` |
| PRJ-S04 | `BLD-04`, `BLD-05` |
| PRJ-S05 | `BLD-10` |
| PRJ-S06 | `BLD-08`, `BLD-09` |
| PRJ-S07 | `BLD-07` |
| PRJ-S08 | `BLD-11`, `BLD-12`, `BLD-13`, `BLD-14`, `BLD-15` |
| PRJ-S09 | `BLD-17` |
| PRJ-S10 | `BLD-16` |
| PRJ-S11 | `PRJ-18`, `PRJ-19` |
| PRJ-S12 / PA-S02 | `BRN-12` |
| PRJ-S13 | `PRJ-16`, `PRJ-17` |
| PRJ-S14 | `PRJ-13`, `PRJ-14`, `PRJ-15` |
| PRJ-S16 | `PRJ-20`, `PRJ-21` |
| PRJ-S17 | `PAR-11`, `PAR-12`, `PAR-13`, `PAR-14`, `PAR-15`, `PAR-16` |
| PRJ-S18 / PA-S04 | `PAR-06`, `PAR-07` |
| PRJ-S19 | `PRJ-10`, `PRJ-11`, `PRJ-12` |
| PRJ-S20 | `REL-01`, `REL-02`, `REL-07`, `REL-08` |
| PRJ-S21 | `REL-04`, `REL-05`, `REL-06` |
| PRJ-S22 | `OBS-01` |
| PRJ-S23 | `OBS-02` |
| PRJ-S24 | `OBS-03` |
| PRJ-S25 | `GW-01`, `GW-02` |
| PRJ-S26 | `MAR-01`, `MAR-02`, `MAR-03` |
| PRJ-S28 / PA-S05 | `PAR-08`, `PAR-09`, `PAR-10` |
| PRJ-S29 | `PRJ-05`, `PRJ-06` |
| PRJ-S30 | `IAM-14`, `IAM-15`, `IAM-17` |
| PA-S01 | `IAM-13` |
| PA-S03 | `PAR-01`, `PAR-02`, `PAR-03`, `PAR-04` |
| BUD-S01 | `BUD-01` |
| BUD-S02 | `BUD-02` |

---

## 8. Explicit no-screen / no-domain dispositions

The current inventory deliberately keeps these out of browser screen authority:

```text
PAR-05 RunProductAgentHeadless
→ HEADLESS Product ingress
→ no direct browser UI consumer

universal Approval Center
→ REJECTED
→ exact ApprovalRequest surfaces remain contextual

universal workflow center / scheduler
→ REJECTED

screen-shaped Product operations = 0
parallel frontend Product DTO authority = 0
generic execute UI = 0
raw DB explorer = 0
global file manager = 0
provider/runtime console as Product authority = 0
```

A browser control that is only navigation, projection, local view state or modal presentation does not gain a Product operation.

---

## 9. Findings / questions carried into block work

No upstream Product gap is exposed by 4C-5. Three structural questions are intentionally left for the smallest later block cycles:

| ID | Candidate question | Why not decide here | Next proving block |
| --- | --- | --- | --- |
| `4C-S01` | Exact global-frame navigation placement/order after responsive/accessibility constraints | requires rendered structural evidence; IA alone is insufficient | `GF-01` → 4C-6/7F/8 |
| `4C-S02` | Project-scoped Connection lifecycle: nested distinct surface under Integrations vs separate contextual destination | semantic distinction is closed; findability needs rendered/user-task evidence | `P-02` |
| `4C-S03` | Control Plane AnalyticQuery placement: Data-led vs Brain-led entry | operation/owner is closed; human mental-model placement remains ambiguous | `P-02` |
| `4C-S04` | Exact ApprovalRequest host in Control Plane and in each Published App | owner/authority is closed; safe placement depends on exact AgentRun/app context | `P-03` / `PA-01` |
| `4C-S05` | Budget drilldown as route vs master-detail region | both preserve authority; task density/context preservation needs structural evidence | `BUD-01` |

`4C-A02` relative frequency/urgency remains open where it materially affects ordering or density. It does not authorize speculative navigation priority.

---

## 10. Candidate closure result

```text
frontend-reachable concrete operations expected = 112
frontend-reachable concrete operations mapped   = mechanically checked by repository test
PAR-05 browser surface                          = 0
invented user needs                             = 0
screen-shaped Product operations                = 0
parallel Product DTO authority                  = 0
4C-8 rendered structural wireframes             = NOT STARTED
4D selections                                   = 0
Product implementation                          = 0
```

4C-5 is complete only as a **candidate inventory**. It cannot become structural baseline by prose approval alone. After operator acceptance for progression, the next action is the first material block cycle on `GF-01`: bounded reference/hypothesis work only when triggered, authority-feasibility preflight, rendered structural wireframe and explicit operator visual adjudication before dependent blocks inherit the global frame.
