# 4A Evidence — Product Operation Coverage

> **Kind:** Evidence / supporting proof, not Product authority.
> **Candidate authority under test:** `docs/product/operation-ledger.md` + `docs/product/permission-contract.md` + `docs/product/budget-analyzer-contract.md`.
> **Status:** 4A OPEN / CENSUS + SUBTRACTION + CONSISTENCY PROOF COMPLETE / INDEPENDENT FABLE REVIEW COMPLETE / LEAD-ADJUDICATED / OPERATOR RATIFICATION PENDING.

This Evidence records the completed 4A challenge against accepted Product journeys, semantic owners, durable record classes, first-vertical semantics and whole-product negative laws. It does not ratify 4A, open 4B or authorize Product implementation.

Repository current authority always outranks this Evidence.

---

## 1. Exact closure under test

The completed candidate derives three different Product surfaces:

```text
fixed Conexus platform operations = 114
Project-defined operations        = exact finite Release-pinned Ops(R)
first Budget Analyzer operations  = 2
ordinary Conexus Permissions      = 25
```

Required concrete closure:

```text
fixed operations with semantic owner       = 114/114
fixed operations with real consumer        = 114/114
fixed operations with principal/ingress    = 114/114
fixed operations with auth/scope route     = 114/114
fixed operations with outcome/disclosure   = 114/114
fixed operations with exact IC profile     = 114/114
Budget operations with all fields          = 2/2
orphan concrete operations                 = 0
speculative concrete operations            = 0
```

The exact grouped authority matrix is canonical in `operation-ledger.md`.

---

## 2. Durable-record subtractive proof — 46/46

Persistence does not manufacture Product CRUD. Each accepted durable record class is classified as one of:

```text
DIRECT      current Product consumer requires exact owner operation/read
PROJECTION  visible only through a purpose-built owner/Product projection
INTERNAL    owner/runtime state intentionally not caller-controlled
CARRIER     byte/transport/property reachable only through an owning operation
```

Category census:

```text
Identity & Access           7
Workspace                   2
Project                     5
Builder                     8
Artifact Registry           2
Connections                 3
Gateway                     3
Brain                       3
Production Agent Runtime    4
Release                     3
Managed Application Runtime 2
Observability & Audit       2
Attachments & Blob          2
-----------------------------
TOTAL                      46
```

Results:

```text
record classes checked                          = 46/46
unclassified                                    = 0
record class requiring CRUD only by symmetry    = 0
mutable foreign-owner mirror required           = 0
```

Material subtractive dispositions preserved:

- Builder `WorkUnit`, `ActorRun`, `CodingSession` remain subordinate/internal rather than direct CRUD.
- Artifact Registry remains semantic projection; no Universal Artifact API.
- Gateway idempotency/effect execution remains internal; only bounded EffectAttempt inspection is Product-visible.
- Brain health probe is internal proof orchestration; current Brain health is the Product read.
- authored Product Agent definition remains Project/Builder authority; PAR owns runtime only.
- Release composition and active pointer transitions remain owner-controlled; Promotion is the explicit Product decision.
- Attachments/Blob remain owner-bound carriers; no global File Manager.
- MAR owns job-run/serving semantics; no generic scheduler/workflow Product domain.

---

## 3. Semantic-owner boundary proof — 13/13

| Owner | Product home | Inflation prevented |
| --- | --- | --- |
| I&A | identity/session/access | Keycloak/provider claims excluded; app access CRUD symmetry removed |
| Workspace | Workspace/Area lifecycle | no generic organization tree |
| Project | Project/Baseline/binding intent | no hidden resource registry |
| Builder | Change/Plan/Findings/execution projections | no WorkUnit/CodingSession API authority |
| Artifact Registry | immutable semantic projections | no Universal Artifact CRUD |
| Connections | Connection lifecycle/qualification | no generic secret/provider executor |
| Gateway | effect receipts + internal last mile | no second business-command/retry API |
| Brain | reusable semantics/knowledge | no RAG/memory/policy owner; probe internal |
| PAR | Conversation/AgentRun/Approval/Trigger runtime | no authored-Agent duplication; surface never grants approval eligibility |
| Release | Release/Promotion/serving authority | composition/pointer/served truth owner-controlled |
| OBS/Audit | Evidence/observation projection | never current business-state authority |
| Attachments/Blob | operation-bound carrier | no global file owner |
| MAR | managed occurrence/serving projection | no scheduler/workflow Product owner |

```text
semantic owner boundaries preserved = 13/13
owner collision requiring new owner  = 0
```

---

## 4. Whole-product consumer/journey coverage

The accepted Product journeys A–O and material whole-product negatives were re-walked against the candidate.

```text
A first access / Workspace             COVERED
B Project inception / Baseline         COVERED
C Plan / build / verify / publish      COVERED
D Brain assisted Discovery             COVERED
E Brain publish / bind / feedback      COVERED
F Connection / Integration             COVERED
G Data / Query / AnalyticQuery         COVERED
H publish/use business application     COVERED
I create/evolve Product Agent          COVERED
J use Product Agent                    COVERED
K exact effect approval                COVERED
L managed sync/job                     COVERED
M duplicate Project                    COVERED
N Budget Analyzer                      COVERED
O maintenance/reusable learning        COVERED
```

Honest non-Product/deferred boundaries remain explicit:

- backup/restore/emergency stop = operations control, not ordinary Product API;
- DEDICATED physical consumer operations = deferred until a real consumer;
- SaaS private/on-prem reachability = future requirement class;
- unsupported Budget margin/probability/conversion claims = no Product operation.

No accepted current journey requires an orphan or speculative operation.

---

## 5. Fixed-platform census and subtraction

Prefix census:

```text
IAM = 16
WS  =  6
PRJ = 22
BLD = 17
BRN = 11
CON =  9
REL =  7
PAR = 16
GW  =  2
MAR =  3
OBS =  5
----------------
TOTAL = 114
```

Independent subtractive equation:

```text
initial admitted platform candidate        = 117
S1 IAM grant/role-change semantic merge    =  -1
S2 BrainHealthProbe → SYSTEM               =  -1
S3 ComposeRelease → SYSTEM                 =  -1
------------------------------------------------
N_platform                                 = 114
```

Applied decisions:

```text
IAM-15 SetPublishedAppAccess
IAM-16 removed from census

BRN-10 GetBrainHealth = Product read
BRN-11 RunBrainHealthProbe = SYSTEM proof orchestration

REL-03 ComposeRelease = SYSTEM owner transition
REL-06 PromoteRelease = explicit consequential Product decision
```

Kept after subtraction because exact detail has independent Product meaning:

```text
GetConnectionQualification
List/Get EffectAttempt
purpose-built list/detail pairs where detail is materially richer or exact-subject scoped
```

---

## 6. Project capability grammar falsification

The grammar remains finite per exact Release:

```text
exact Release R
→ exact Ops(R)
→ registered Query / registered Action / honest Integration Operation
→ exact owner + caller + authority + scope + binding pins
→ positive and negative proof
```

Effect/read law:

```text
registered Query                    → read-only / IC0
repeatable consequential Action     → IC3
Action/Integration external effect  → IC4 effect fence + idempotency/reconciliation
```

Rejected generic authority:

```text
execute(anySlug,anyInput)
execute(anySql)
execute(anyProviderOperation)
caller-selected Connection
a caller-selected target URL
mutable-latest operation
unregistered Product-Agent tool
```

The first Budget Analyzer exercises this grammar with two exact registered Queries without turning it into a generic analytics executor.

---

## 7. First Budget Analyzer proof

`4A-BUDGET-01` was explicitly operator-approved on 2026-08-21.

Closed Product semantics:

```text
Product focus           = pending-budget intelligence
Budget                  = Brain-admitted Budget document
Pending                 = admitted current-pending Budget with no admitted conversion relation proving otherwise
source mappings         = Sankhya/Brain Evidence, not Product meaning
Budget age              = canonical business date → result as_of; DTALTER is not age authority
aging bands             = 0–3 / 4–7 / 8–30 / 31+
results                 = R1–R6
margin                  = unsupported
heuristic probability   = rejected
conversion              = deferred until separately proved/admitted
operations              = BUD-01 AnalyzePendingBudgets + BUD-02 ListPendingBudgets
N_budget                = 2
```

Independent review narrowed two ambiguous time semantics without expanding Product scope:

```text
as_of
= system-resolved source/reconciliation coordinate disclosed per response/page
-X-> arbitrary caller-selected historical coordinate

F1 cross-call/page snapshot retention
= NOT PROMISED

changed coordinate
→ must remain visible
-X-> represent mixed-coordinate results as one coherent snapshot

budget_age_days < 0
→ never clamp to 0
→ never assign to AGE_0_3
→ PARTIAL if affected records can be isolated
→ otherwise UNVERIFIED / INDETERMINATE
```

A future requirement for retained snapshot history or future-dated Budget classification reopens only the smallest Budget semantic item.

---

## 8. Permission and authority closure

The ordinary Permission vocabulary remains exactly 25 and is owned by `permission-contract.md`.

```text
fixed platform operations with auth route  = 114/114
Budget operations with auth route          = 2/2
new global Permission per Project op        = 0
Keycloak claim used as Product grant        = 0
Published-App role implying Control Plane   = 0
Published-App role implying effect approval = 0
```

Material compound boundaries remain explicit, including:

```text
SetProjectConnectionBinding
→ project.manage + connection.use + exact qualified compatible ConnectionRevision

SetProjectBrainBinding
→ project.manage + brain.bind + exact immutable Brain revision + binding conformance

DecideApprovalRequest
→ agent.effect.approve + exact current eligibility + exact sealed proposal
→ CP or admitted PA presentation may expose the owner-specific subject
→ PA role alone grants nothing
```

Investigative approval access is deliberately narrow:

```text
PAR-08 ListApprovalRequests
→ eligible approver route only

PAR-09 GetApprovalRequest
→ eligible approver route
OR separately authorized audit.read investigator exact-subject read
-X-> investigator decision
-X-> audit.read approval-queue listing
```

---

## 9. Idempotency/current-authority precision

Independent review confirmed the profile model and identified grouped precision gaps. Lead adjudication now binds them exactly:

```text
IAM-03 ProvisionAccount = IC3
IAM-15 SetPublishedAppAccess = IC2 with explicit absent state on create

WS-03 UpdateWorkspace = IC2
WS-04 ListAreas       = IC0
WS-05 CreateArea      = IC3
WS-06 UpdateArea      = IC2

REL-06 PromoteRelease = IC2 AND IC3
```

Other already-exact consequential boundaries remain unchanged, including PAR approval/effects, managed job occurrence and Gateway `OUTCOME_UNKNOWN` fencing.

---

## 10. Independent Fable review

### Reviewed subject

```text
candidate branch = agent/4a-product-surface
reviewed HEAD    = d296852a1705520aac49a6bde3b4bce893acf0af
review branch    = review/4a-final-fable
review delta     = docs/work/current/ai-dialog.md only
```

The review branch is temporary Evidence and MUST NEVER merge.

Fable independently reproduced repository verification on the reviewed candidate in the required WSL2/Linux-filesystem environment and reported **39/39 repository tests passing**. The review branch itself correctly fails hygiene because `docs/work/**` is intentionally prohibited from the merge candidate.

### Verdict

The complete candidate **survived every trust-critical falsifier**. Fable found no:

```text
missing accepted journey/consumer
speculative or CRUD-symmetry operation
owner collision / hidden owner
unsafe universal executor
Permission derived from Keycloak/app role/UI location
cross-scope disclosure oracle
before-only protected authority check
stale exact-subject win
blind OUTCOME_UNKNOWN replay
unknown/partial/stale analytics → zero/current
Budget source mapping → Product meaning leak
arbitrary caller historical as_of
approval surface → eligibility grant
internal mechanism promoted to Product API
```

Fable found two material consistency defects and five minor precision defects. All seven were bounded textual/semantic consistency corrections; none changed `N_platform`, `N_budget`, Permission count, owner count or trust topology.

---

## 11. Lead adjudication of Fable findings

```text
4A-IR-01 ACCEPT
PAR-08 had stale investigator wording
→ PAR-08 is eligible-approver listing only
→ audit.read investigator exact-subject path remains PAR-09 only

4A-IR-02 ACCEPT
Budget contract asserted same result coordinate without deciding retention semantics
→ F1 does not promise retained cross-call/page snapshot pinning
→ every response/page discloses its own system coordinate
→ coordinate changes cannot masquerade as one snapshot

4A-IR-03 ACCEPT
WS/REL grouped IC disjunctions were not exact
→ WS-03 IC2; WS-04 IC0; WS-05 IC3; WS-06 IC2
→ REL-06 IC2 AND IC3

4A-IR-04 ACCEPT
ProvisionAccount creation idempotency differed from other create intake without reason
→ IAM-03 IC3
→ IAM-15 create path explicitly uses absent current state under IC2

4A-IR-05 ACCEPT
PAR-01 table wording implied an owner/CP route absent from canonical matrix
→ PAR-01 wording aligned to PA-only route

4A-IR-06 ACCEPT
permission-contract consumer list omitted PAR-06/07 Control-Plane project.read use
→ list corrected; no Permission change

4A-IR-07 ACCEPT
negative Budget age had no semantic disposition
→ no clamp/band; PARTIAL or UNVERIFIED/INDETERMINATE preserves truth
```

```text
material unresolved independent findings = 0
minor unresolved independent findings    = 0
```

### Second-round disposition

No second independent round is required.

Reason:

1. every accepted correction is one of the bounded resolutions explicitly proposed by Fable;
2. the corrections only narrow disclosure, remove an unsupported guarantee or make an existing obligation exact;
3. no new operation, Permission, semantic owner, trust boundary, principal class, ingress class or Product capability was introduced;
4. `114 / 25 / 2`, `46/46` and `13/13` remain unchanged;
5. the changed properties are directly checkable in the corrected canonical contracts and remain subject to fresh repository verification on the resulting exact HEAD.

---

## 12. Final proof conclusion

```text
fixed platform census                  = 114
Project capability grammar             = closed exact-Release admission law
Budget Analyzer census                 = 2
ordinary Permission vocabulary         = 25
durable record classes                 = 46/46 classified
semantic owner boundaries              = 13/13 preserved
orphan concrete operations             = 0
speculative concrete operations        = 0
known semantic blockers                = 0
Lead adversarial findings open         = 0
independent material findings open     = 0
independent minor findings open        = 0
trust-critical independent falsifiers  = SURVIVED
```

The only remaining 4A closure gate is **fresh repository verification on the exact corrected candidate HEAD followed by explicit operator 4A ratification**.

No prior approval authorizes PR #54 merge, 4B opening or Product implementation.