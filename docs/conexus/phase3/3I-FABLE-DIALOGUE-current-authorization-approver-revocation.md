# 3I Fable Dialogue — Current Authorization, Approver Eligibility & Revocation

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Candidate:** `3I-01 — Current Authorization, Approver Eligibility & Revocation`  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** ChatGPT candidate for independent Fable challenge. This file does **not** create 3I authority, does not update `LEDGER.md`, does not alter approved 3B..3H authority, and does not authorize implementation or merge.

---

## 0. Intake preamble — citation closure, not a separate decision

The approved 3I intake concluded that a standalone principal-taxonomy decision fails materiality. The following vocabulary is therefore carried only as the preamble of the first material decision.

### Inbound Conexus authorization principals — F1 closed set

```text
Account
→ human Conexus principal
→ authenticated by I&A/session mechanisms already frozen for the applicable surface

DedicatedApplicationPrincipal
→ non-human Conexus principal for DEDICATED server-to-platform exchange
→ semantic identity already frozen by 3F-06
→ concrete authentication mechanism remains later 3I work
```

No other current F1 identity authenticates into Conexus authorization.

Explicit non-principals:

```text
ActorRunId
AgentRunId
CodingSessionId
ConversationId
ApprovalRequestId
ReleaseRef
Mastra thread/run/tool ids
E2B logical/physical sandbox ids
traceId / spanId
provider request ids
Builder / PAR / Gateway runtime roles
Git author/committer identity
own-auth DEDICATED app-user refs
```

They may be durable domain identity, correlation, runtime mechanics or provenance, but never manufacture authorization identity.

### Outbound technical credentials are not Conexus principals

The Hub may authenticate **as a client** to external systems using owner-specific technical credentials, for example:

```text
GitInfra → Git remote
CodingRuntime adapter → E2B control API
Builder/PAR control-side model loop → model provider API
Hub → PostgreSQL login role
backup path → offsite storage
supply-chain tooling → package registry / vulnerability source
```

These are custody/capability concerns, not inbound Conexus principals. They never map automatically to `Account`, roles or Conexus permissions.

A new Conexus principal class requires Decision Loop with a named consumer/failure class.

---

## 1. Authority reconstructed before the candidate

This candidate was built from the canonical chain required by `AGENTS.md`:

```text
DevelopmentConexus Engineering Method v1.0.0
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ accepted task-specific authority
→ current external evidence only where load-bearing
```

Load-bearing accepted authority:

### `3C-02 — Identity & Access`

```text
Account = global Hub identity
I&A owns authentication/session/memberships/grants/role assignments/access-context resolution
CONTROL_PLANE | PREVIEW | PUBLISHED_APP = independent access contexts
operation owner declares the permission it protects
I&A DENY = deny
I&A ALLOW = only permission to continue owner/domain checks
relationship change → subsequent decisions use new authority
Observability != authorization authority
```

3C-02 explicitly routed privilege changes, self-grant, cache/invalidation and enforcement details to 3I.

### C-015 MANAGED published-runtime auth baseline

```text
server-side opaque session
Project/app derived server-side
membership before role
closed roles for PUBLISHED_APP
ViewerContext/effective capabilities derived server-side
session id rotation on material privilege changes
DISABLE/reset revoke sessions
zero browser JWT/localStorage authority
```

### `3F-03 — Approval Claim & ApprovalRequest`

```text
human decision = ALLOW_ONCE | DENY
approver principal and eligibility are server-derived
exact sealed subject is immutable
single-claim / permanent attempt binding after committed admission
approval is not generic permission
approver eligibility itself intentionally deferred to 3I
```

### `3G-01 — ApprovalRequest lifecycle`

```text
decision write-once
expiry derived
STALE exact-governing-pin semantics
binding permanent after committed effect admission
no generic Approval FSM / ApprovalService
```

### `3G-05 — Production AgentRun`

```text
AgentRun pins exact Release/composition at admission
caller/authority context appropriate to surface is part of admission facts
PAR does not turn runtime state into authority
cancel vs claim is guarded
old run may continue under exact pins while current owner/security/health gates permit specific operations
trigger DISABLE narrows future wake/admission but does not cancel admitted run
archive does not stop serving or admitted runtime
```

### `3G-06 — Gateway EffectAttempt`

```text
Gateway owns exact physical-effect truth
admitted NOT_SENT attempt may be closed-before-dispatch
CLOSE and DISPATCH race on the same current facts
close wins → never send
send wins → later cancel cannot pretend no effect
who may cause security/consumer close was left to 3I
```

### `3G-07 — Project lifecycle/bindings`

```text
ARCHIVED freezes future authoring intent, not serving
binding versions/current refs are future intent, not live Release revocation
trigger DISABLE while archived is explicit narrowing
operator/security permission for recovery remains 3I
```

### `3G-08 — Release/runtime admissibility`

```text
Release history is immutable
newer Release does not invalidate old Release merely for being newer
current security/owner policies may refuse particular operations immediately
old DEDICATED Release remains interpretable/admissible while support horizon and current owners allow
emergency global stop routed to 3I/operations
```

### `3H-01..03`

```text
runtime/history/session/snapshot state != current authority
Builder dispatch/rebind reapplies current Conexus authority
RequestContext is reconstructed from owner facts and replace-whole
F5 owner dispatch identity beats producer payload identity
runtime IDs/telemetry remain observation/correlation only
```

---

## 2. Current external evidence used to challenge the design

External sources are evidence only, never Conexus authority.

### NIST SP 800-207 — Zero Trust Architecture

Current NIST guidance preserves the distinction:

```text
authentication
!= authorization
```

and treats authorization as an access-time decision rather than a blanket consequence of network/session presence.

Primary source:

- https://csrc.nist.gov/pubs/sp/800/207/final

### NIST SP 800-53 Rev. 5 — Access Control

Relevant current control families include:

```text
AC-2 Account Management
AC-3 Access Enforcement
AC-5 Separation of Duties
AC-6 Least Privilege
AC-12 Session Termination
```

The useful transfer is not federal-process ceremony. It is that least privilege and separation of duties are deliberate access-control properties, not automatic reasons to invent extra roles/workflow when the application requirement does not need them.

Primary source / current controls:

- https://csrc.nist.gov/projects/risk-management/sp800-53-controls/downloads

### OWASP Authorization guidance

Current OWASP guidance recommends server-side, deny-by-default authorization and rechecking authorization per request/critical operation rather than trusting a previous check indefinitely.

Primary source:

- https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

### OWASP Session Management

Current guidance explicitly recommends renewing session identifiers after privilege-level changes. C-015 already freezes the corresponding Conexus property; 3I must not mistake session rotation for authorization truth itself.

Primary source:

- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

### OWASP Business Logic Security

Current guidance treats self-approval / separation-of-duty rules as **contextual business authorization** examples — e.g. a manager may be forbidden from approving their own expense — not as a universal property of every approval mechanism.

Primary source:

- https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html

### External-evidence conclusion

The standards support:

```text
recheck current authorization at protected boundaries
deny by default
least privilege
contextual separation of duties where the real workflow requires it
```

They do **not** justify:

```text
OPA/Cedar/OpenFGA
four-eyes on every approval
a generic revocation engine
a universal authorization snapshot
a global policy DSL
```

---

## 3. Evidence → Known / Inferred / Unknown / Deferred

### KNOWN

1. I&A owns current Account/session/access relationships; operation owners own the meaning of the permission they require.
2. A prior I&A `ALLOW` is not sufficient to execute later without owner/Gateway preconditions.
3. Membership/grant changes are intended to affect subsequent authorization decisions.
4. `CONTROL_PLANE`, `PREVIEW`, and `PUBLISHED_APP` authority remain separate.
5. ApprovalRequest decision is write-once and exact-effect-bound.
6. AgentRun/ActorRun/Release history is immutable and must not be rewritten to model current security changes.
7. Gateway already possesses a current last-mile admission boundary and close-before-dispatch primitive.
8. Trigger DISABLE already provides owner-local future-admission narrowing.
9. Connection/grant revocation already provides owner-local external-capability narrowing.
10. Project ARCHIVED is not a security stop or unpublish operation.
11. No current F1 requirement says every approval must involve two different human Accounts.
12. No current durable `SecurityHold`, `RevocationRecord`, `AuthoritySnapshot` or generic policy entity exists in the closed 3E inventory.

### INFERRED — candidate decisions to attack

1. Mutable I&A facts should not be cached across protected requests in F1; direct authoritative resolution is simpler than an invalidation subsystem.
2. A permission-changing mutation must be authorized from the **pre-mutation** authority state; the proposed grant/role/binding cannot participate in authorizing itself.
3. PAR `ALLOW_ONCE` eligibility can reuse the exact operation's existing authorization semantics instead of creating an `ApproverRole` model.
4. F1 should allow the same eligible human Account to request and approve an agent effect; universal four-eyes would add unsupported product machinery.
5. Approver eligibility should be evaluated at decision-write time; a committed decision remains historical authority and is not retroactively rewritten when that Account later loses a role.
6. Current owner/security gates still apply after an approval decision and may prevent the effect from being admitted/sent.
7. Revocation should be prospective at the next protected admission/control point unless an already-approved owner state machine explicitly has a stronger race/terminal law.
8. Existing owner-local controls + a whole-Hub operational stop are sufficient F1 incident-response primitives; no new project/global security-stop domain fact is justified yet.

### UNKNOWN — do not invent answers here

1. Exact permission literal names for every owner operation.
2. Whether a future financial/legal effect requires two-human or requester≠approver separation of duties.
3. Whether a real incident later requires a selective Project security hold that cannot be achieved with owner-local controls without stopping the whole Hub.
4. DEDICATED concrete authentication/revocation mechanism.
5. Exact implementation function/query/cache spelling.

### DEFERRED

```text
credential custody / plaintext / master-key mechanics         → later 3I family C
per-run model spend enforcement                               → later 3I family D
DEDICATED trust mechanism                                     → later 3I family E
network/telemetry trust zones                                 → later 3I family F
hub_control DB roles                                          → later 3I family G
whole-Hub stop physical ingress/process/network procedure      → 3J
failure repair/orphan settlement                              → 3M
exact library/provider/API proof                              → 3L
approval-card UI                                              → 3K
new dual-control approval model                               → Decision Loop on named consumer
new selective ProjectSecurityHold                             → Decision Loop on proven incident failure class
```

---

## 4. Root Cause

The unresolved failure class is not missing authentication. It is **stale or self-manufactured authority**.

Unsafe examples:

```text
session cookie authenticated yesterday
+ membership revoked today
→ cached yesterday permission still executes

member submits "make me admin"
→ proposed admin role participates in authorizing the same mutation

PUBLISHED_APP role
→ silently reused as CONTROL_PLANE role

agent asks for dangerous effect
→ any authenticated Account can approve although that Account could not perform that operation

old Release / old AgentRun
→ historical pin treated as irrevocable permission after Connection/grant/security narrowing

AgentRun cancelled before effect claim
→ effect still admits from stale runtime/approval state

security incident
→ platform mutates Release/history to pretend old facts were never valid
```

The structural cause is conflating three different things:

```text
historical/admitted identity
current authorization
physical effect/control-point truth
```

They must compose without becoming one mutable status.

---

## 5. Target invariants

### I1 — Current authority, not cached historical authority

> **Every protected F1 admission or mutation evaluates the mutable authorization facts relevant to that boundary from current owner authority. A previous request/session/run authorization decision never becomes a blanket authorization cache for a later protected operation.**

### I2 — Authentication never implies complete authorization

```text
authenticated Account
→ eligible to ask for authorization evaluation

not:

authenticated Account
→ execute anything reachable by the process
```

### I3 — Surface isolation

```text
CONTROL_PLANE authority
!= PUBLISHED_APP authority
!= PREVIEW authority
```

No role/access context is silently reused across surfaces.

### I4 — Mutation cannot authorize itself

> **A security-sensitive mutation is authorized entirely from pre-mutation current authority; facts introduced by the proposed mutation cannot help authorize that same mutation.**

### I5 — Owner meaning remains owner-local

```text
operation owner declares permission/preconditions
I&A resolves current principal relationships/roles/effective permission
owner/Gateway applies its remaining state/security gates
```

3I does not create a universal policy engine.

### I6 — Historical facts stay historical

```text
Release pin
Approval decision
AgentRun / ActorRun admission
Promotion history
EffectAttempt traffic truth
```

are not rewritten because current authorization later changes.

### I7 — Revocation narrows future authority at the next relevant control point

```text
current deny/revocation
→ prevents future protected admission/transition it governs
```

without claiming impossible rollback of an already-crossed physical boundary.

### I8 — No hidden authorization resurrection through cache/runtime state

If current mutable authority says deny, stale session metadata, RequestContext, Mastra state, telemetry, Release history or caller payload cannot turn it back into allow.

---

## 6. Alternatives

### Alternative A — Persist authorization snapshots into sessions/runs/releases and invalidate them on change

Shape:

```text
current access
→ AuthoritySnapshot
→ copied/pinned into Session / ActorRun / AgentRun / ApprovalRequest / Release
→ revocation fan-out / invalidation
```

**REJECT.**

Why:

- duplicate authority;
- fan-out writers on every privilege change;
- stale-copy races;
- new generic version/epoch semantics;
- historical artifacts would carry mutable authorization meaning;
- requires invalidation machinery before there is scale pressure.

### Alternative B — Resolve mutable current I&A facts at each protected boundary; compose with immutable exact pins and owner-local gates

Shape:

```text
protected operation
→ server-derived principal/surface/resource
→ current I&A access context
→ exact immutable operation/Release/run pins
→ owner-specific current gates
→ ALLOW | DENY
```

**ADOPT / GLOBAL MAXIMUM candidate.**

It removes stale-authority failure without new domain objects or a generic engine.

### Alternative C — Make every later authorization change retroactively mutate/kill all historical runtime state

Examples:

```text
membership removed → mutate every AgentRun/ApprovalRequest/Release
new Release → invalidate old Release universally
archive → cancel every run/unpublish
```

**REJECT.** Contradicts approved owner/history boundaries and creates fan-out/state fiction.

### Alternative D — Add universal security policy/revocation service + project/global kill switches now

**REJECT / DEFER.** Current owner-local controls plus the safe whole-Hub operational-stop fallback cover F1 correctness. A selective stop may later improve incident blast radius/availability but can be added without dismantling current authority.

---

## 7. Current authorization resolution law

### 7.1 Account-origin protected requests

For a protected request where the caller is an `Account`, derive server-side:

```text
Account from current valid session
surface
Workspace / Project / resource identity
operation owner
exact operation/policy revision when pinning applies
```

Then:

```text
I&A current facts
├── Account current auth-enabled state
├── current Workspace/Area/Project relationships
├── current surface-specific role/access relationship
└── effective permission required by the operation owner
        ↓
owner/domain current state + preconditions
        ↓
ALLOW | DENY
```

Caller input cannot supply authoritative:

```text
AccountId
ProjectId / WorkspaceId when route/context already owns them
role
permission
surface
authorization result
approval validity
```

### 7.2 Runtime-origin privileged work

A runtime identity is not a principal.

Builder/PAR/Gateway runtime work executes under owner-admitted domain context:

```text
owner dispatch/admission identity
+ exact run/composition pins
+ current owner/security facts required by the protected boundary
```

not:

```text
Mastra run id
E2B sandbox id
trace id
runtime role string
```

When a runtime invokes Gateway, Gateway consumes the owner-provided admitted context plus current authority providers required by the capability. PAR itself does not become an I&A engine.

### 7.3 DEDICATED

This decision does not select authentication mechanics. It freezes only the composition law inherited from 3F-06:

```text
authenticated DedicatedApplicationPrincipal
+ exact ReleaseRef
+ server-derived Project/audience/composition
+ current owner-side narrowing
→ possible Platform-Service admission
```

Family E must realize that law without redefining it.

---

## 8. Authorization cache / invalidation decision

### F1 baseline

No cross-request cache of mutable authority-bearing I&A facts:

```text
Account enabled/disabled state
session current validity
memberships
grants
Published App access relationship/current role
```

Protected operations resolve them from current I&A authority.

Allowed lightweight reuse:

```text
within one request/invocation/transaction
→ memoized access context may be reused
```

because it cannot outlive the protected decision envelope.

Immutable facts may be cached by exact identity/digest, for example:

```text
Release-pinned permission policy
ArtifactRevision security metadata
immutable role-set definition
```

but cached immutable facts still compose with current mutable access facts.

### Why no invalidation bus/epoch

Single-Hub F1 + local PostgreSQL makes direct resolution the cheaper and safer baseline.

Do not create:

```text
AuthorizationEpoch
global auth_version bus
permission cache invalidation event
Redis authorization cache
policy snapshot table
```

merely to optimize a database lookup before measurement.

Reopen only on measured authorization-path latency/scale where direct current resolution is materially insufficient. Any future cache must preserve a stated maximum revocation delay and prove negative revocation behavior.

C-015 session rotation/auth_version remains session-security machinery, not a replacement for current access resolution.

---

## 9. Security-sensitive mutation law

The owner declares the operation permission. I&A resolves the caller's **pre-mutation** authority.

Conceptually:

```text
BEGIN / guarded operation
  resolve current caller authority BEFORE proposed mutation takes effect
  validate owner-specific scope/lifecycle/preconditions
  apply conditional mutation/CAS
  audit when existing audit policy requires
COMMIT
```

The proposed state does not participate in its own authorization.

### 9.1 Self-widening

Example:

```text
member requests: grant me admin
```

If the member's **current** pre-state lacks `project.access.manage` (semantic example only):

```text
DENY
```

The requested future admin role cannot bootstrap the request.

An already-authorized administrator may modify their own access where the owner operation permits it; this decision does not invent a last-admin invariant, mandatory second admin, or lockout-prevention workflow without a named product requirement.

### 9.2 Owner-specific mutations covered by the same law

Examples include current authorization for:

```text
membership / grant / role mutation                → I&A owner
Project binding SET / UNBIND                      → Project owner
Connection credential binding create/replace/revoke eligibility → Connections + I&A
AgentTrigger CREATE/ENABLE/DISABLE/update          → PAR owner
AgentRun/ActorRun cancel where applicable          → respective owner
Release promote/recovery approval/operation        → Release owner
security-sensitive account/session administration → I&A owner
```

This list is illustrative, not a generic mutation registry.

### 9.3 Narrowing versus widening

Narrowing does not bypass current permission by default merely because it reduces power.

Example:

```text
random member revokes company Connection credential
```

is not allowed just because revoke is a narrowing operation.

Exception exists only where prior owner authority explicitly created a bounded narrowing path — for example 3G-07 permits trigger `DISABLE` while a Project is ARCHIVED — and the caller still needs the permission that owner defines for that operation.

---

## 10. PAR `ALLOW_ONCE` approver eligibility

### 10.1 Only human `Account` decides

F1 `ApprovalRequest` human decision remains:

```text
Account
→ ALLOW_ONCE | DENY
```

A Product Agent, DEDICATED application principal, runtime role, provider identity or guest cannot become the human approver.

### 10.2 Eligibility is current at decision-write time

When an Account submits a decision, server derives:

```text
ApprovalRequest exact identity
Project / origin surface from owner facts
exact sealed effect subject
exact pinned artifact/tool/effect classification
current Account access context for that Project/surface
```

An Account is eligible only if the exact operation would be within that Account's current human authority under the same Project/surface security policy, in addition to any owner-specific approval precondition.

Practical law:

> **An agent cannot use human approval to obtain an effect that the approving human is not currently authorized to cause in that Project/surface.**

`approvalFloor = HUMAN` therefore means:

```text
requires a currently eligible human decision
```

not:

```text
any authenticated human can approve
```

No independent `ApproverRole`, approver ACL or generic approval policy table is created.

### 10.3 Ineligible decision attempt

```text
Account currently ineligible
→ no ApprovalRequest decision write
→ request remains undecided/claimable for another eligible Account until existing expiry/lifecycle laws say otherwise
```

No `DENIED_BY_AUTHZ` lifecycle value is added.

Public failure follows existing boundary-safe 3F behavior; no new authorization oracle/code is minted automatically.

### 10.4 Self-approval / separation of duties

F1 does **not** impose requester≠approver or two-person control on every PAR effect.

Rationale:

- the current product explicitly supports small/solo operation;
- `ALLOW_ONCE` is already the human checkpoint against agent autonomy;
- universal four-eyes would require a second eligible Account and new product/availability semantics;
- NIST/OWASP separation-of-duty guidance is contextual — it is required where the protected workflow actually needs independent roles, not as a universal shape.

Therefore:

```text
same eligible Account initiated the conversation/request
+
same Account reviews exact sealed effect
+
current authority permits that exact operation
→ ALLOW_ONCE may be recorded
```

A future effect requiring:

```text
requester != approver
2-of-N humans
role A proposes / role B approves
financial dual control
legal segregation of duties
```

returns to Decision Loop as a named approval-policy/product requirement. It must not be smuggled in as generic IAM machinery.

### 10.5 After the decision commits

A committed `ALLOW_ONCE | DENY` remains immutable historical human decision.

Later role/membership change:

```text
-X-> rewrite/delete the decision
-X-> replace approver
-X-> reopen decision slot
```

This decision deliberately does **not** add generic ApprovalRequest revocation.

Current owner/security gates still apply before material effect admission/dispatch. A security incident that must stop a pending approved effect uses owner-local controls described below rather than rewriting approval history.

---

## 11. Revocation and current narrowing matrix

The design distinguishes **mutable current authority** from historical intent/pins.

### 11.1 Account/session/access relationships

For new Account-origin protected requests:

```text
Account no longer auth-enabled
session revoked/expired
required membership/grant removed
surface-specific access relationship removed/role narrowed
→ next protected authorization = DENY
```

A stale browser page, stale ViewerContext or old session metadata cannot preserve access.

Session rotation after privilege change remains C-015 hygiene. Correctness comes from current authoritative access resolution, not from trusting role fields inside session state.

### 11.2 Account-origin long-running runtime

Admission of an ActorRun/AgentRun is a historical owner fact; logout/session expiry does not by itself rewrite or cancel an admitted run.

However, subsequent privileged boundaries reached by that run must use the owner-admitted caller/authority context plus the current security facts that boundary requires. Runtime history cannot manufacture a permission that current I&A/owner facts deny.

Exact mapping of which account-origin runtime operations must re-resolve Account relationships is a review target for Fable: the candidate principle is **current authorization at the protected privilege boundary, not continuous mutation of run history**.

### 11.3 AgentTrigger

```text
DISABLE commits before firing admission
→ no new AgentRun

AgentRun admission commits first
→ trigger later DISABLE does not cancel admitted run
```

No change from 3G-05.

### 11.4 Connection credential/grant revocation

```text
old Release pins ConnectionRevision
+ credential/grant currently revoked / Connection currently ineligible for security reason
→ Gateway refuses new use
```

The Release remains historically exact; it is not mutated.

### 11.5 Project binding current-ref change

```text
UNBIND / new binding current intent
-X-> retroactively revoke already active Release's exact historical binding
```

Current binding intent is authoring authority, not a runtime revocation switch.

### 11.6 Project ARCHIVED

```text
ARCHIVED
-X-> authentication revocation
-X-> automatic unpublish
-X-> automatic run cancel
-X-> automatic active-Release invalidation
```

Preserve 3G-07.

### 11.7 Newer Release

```text
new Release exists/promoted
-X-> automatic security revocation of old in-flight run
-X-> automatic invalidation of supported DEDICATED exact Release
```

Preserve 3G-05/08.

### 11.8 Approval decision

Later loss of the approver's role does not rewrite an already-recorded exact decision.

If an incident requires stopping future execution of the approved effect, current owner-local controls must prevent admission/dispatch; history remains auditable.

---

## 12. Cancellation / Gateway close-before-dispatch authority

### 12.1 No public generic `close effect attempt` permission

Users/modules do not directly mutate `gw.effect_attempt` because they possess a generic security role.

The normal path is:

```text
consumer owner receives currently authorized narrowing/cancel command
→ owner commits its own current truth where applicable
→ narrow internal Gateway request attempts close-before-dispatch for related admitted NOT_SENT effect
→ Gateway's existing guarded CLOSE × DISPATCH law decides what is still physically possible
```

Examples:

```text
PAR AgentRun CANCELLED before FIRST_CLAIM
→ claim refused, no effect admitted

PAR cancel after effect admitted NOT_SENT
→ may request Gateway close
→ close wins → never sent
→ dispatch wins → cannot pretend no effect
```

### 12.2 Who may initiate cancellation/narrowing

I&A resolves current Account authority; the domain owner defines the cancellation/narrowing permission and relationship semantics.

3I does not create:

```text
UniversalCancelPermission
SecurityCommandBus
EffectAttempt admin API
```

### 12.3 Current Gateway gates

Same-attempt recovery/dispatch remains permitted only if the current Gateway gates required by that capability still allow it, as already frozen by 3G-06.

A stale ApprovalRequest/AgentRun/runtime callback cannot bypass a current Connection/security deny.

---

## 13. Security narrowing for old Releases

The candidate rejects both extremes:

### Wrong extreme 1 — old Release is irrevocable permission

```text
exact historical pin
→ forever allowed
```

Rejected.

### Wrong extreme 2 — every current authoring change rewrites old Release authority

```text
new binding/new Release/archive
→ old runtime silently changes
```

Rejected.

### F1 rule

> **An old exact Release remains the interpretation/composition authority for what it contains, while each live protected operation still intersects the current revocable facts owned by the boundaries that have independent current security meaning.**

Current narrowing facts already evidenced in F1 include owner-local facts such as:

```text
Account/access relationship for Account-origin authorization
Connection credential/grant current revocation/eligibility
AgentTrigger enabled/disabled at new trigger admission
AgentRun/ActorRun current terminal/cancel truth
Gateway close/current effect admission gates
Release support/compatibility rules already frozen
```

Not current revocation facts by themselves:

```text
Project current binding ref changed
newer Release exists
Project archived
telemetry says unhealthy
runtime snapshot lost
```

No generic `CurrentSecurityPolicySnapshot` is introduced.

---

## 14. Emergency-stop deletion test

The intake deliberately required testing existing owner-local narrowing before inventing a global stop object.

### Current F1 incident controls

```text
compromised/disabled Account      → account/session/access revoke
bad/mis-scoped external grant     → Connection credential/grant revoke
bad automation wake source        → AgentTrigger DISABLE
active Builder/Agent execution    → respective owner CANCEL when currently authorized
admitted effect not yet sent      → Gateway close-before-dispatch race
unsafe Release with safe predecessor → explicit current-conformant rollback/recovery Promotion
platform-wide emergency           → stop/disable Hub ingress/process/network operationally in 3J
```

### Candidate decision

No new durable/global:

```text
EmergencyStop
SecurityHold
ProjectKillSwitch
RevocationEpoch
SecurityPolicyState
```

in F1.

Why:

- correctness already has a safe whole-Hub stop fallback in the single-Hub topology;
- owner-local controls handle narrower named classes;
- a selective Project-wide hold is an availability/blast-radius improvement, not yet proven necessary for correctness;
- adding it later does not require dismantling existing authority.

### Reopen trigger

Return to Decision Loop if a real incident/probe proves:

> a Project or narrower scope must halt **all new privileged admissions across multiple owners immediately**, existing owner-local controls cannot cover it without unacceptable time/race exposure, and stopping the entire Hub is operationally unacceptable.

Then add the smallest scoped hold/fencing fact justified by that incident — not a generic scope/policy engine.

---

## 15. Authority / Boundary summary

### Identity & Access owns

```text
Account authentication/session current truth
memberships/grants/roles/published-app access relationships
current access-context resolution
Account-wide revocation
I&A-owned security mutations
```

### Operation/domain owner owns

```text
what operation exists
what permission that operation requires
resource/lifecycle/state preconditions
owner-specific cancellation/narrowing semantics
```

### PAR owns

```text
AgentRun current truth
ApprovalRequest exact decision/history
AgentTrigger current truth
current pending proposal semantics
```

### Gateway owns

```text
last-mile capability/effect admission
current Connection/security gates needed at execution
EffectAttempt traffic/outcome/idempotency/budget truth
close-before-dispatch physical race
```

### Release owns

```text
immutable Release composition
Promotion/active pointer/history
current rollout/recovery gates
```

### Observability owns

```text
audit/telemetry history and evidence
```

never current authorization.

---

## 16. Enforcement

### E1 — Server-derived authority context

Protected boundaries derive principal/resource/surface from trusted server context. Authority fields from browser/model/guest/runtime payload are ignored/rejected as appropriate.

### E2 — Current I&A read on protected Account authorization

Mutable access facts resolve from current I&A authority for each protected decision. No cross-request mutable authorization cache baseline.

### E3 — Owner-declared permission

No hardcoded `if role == admin` distributed as a second policy model. The owner operation declares its permission; I&A resolves current access context against the approved fixed role model.

### E4 — Pre-mutation authorization + guarded write

Sensitive mutation uses pre-state authorization and an owner-specific conditional/CAS mutation where concurrency matters. Proposed new authority never participates in the guard.

### E5 — Approval decision guard

PAR records human decision only after current eligibility is proven server-side for the exact request/project/surface/effect policy.

### E6 — Gateway current last-mile checks

Current security/resource revocation that independently owns live eligibility is rechecked at the existing Gateway control point; denied state cannot be bypassed by historical Release/approval/runtime data.

### E7 — No fan-out rewrite

Privilege changes do not scan/mutate historical Releases, AgentRuns, ActorRuns or approvals to create current truth mirrors.

### E8 — Audit uses existing OBS boundary

Existing audit-required security mutations/human decisions produce required immutable audit under 3C-13/3E rules. OBS is evidence, not authorization.

---

## 17. Proof strategy

Architecture/implementation must be able to falsify at least:

### Current access / cache

1. Account authenticated, membership removed, stale browser page submits protected request → DENY.
2. Account role narrowed, old ViewerContext says admin → DENY according to current I&A.
3. CONTROL_PLANE role never grants PUBLISHED_APP or reverse without explicit independent relationship.
4. Two consecutive requests around a grant revoke show second request using current authority without invalidation event machinery.
5. Restart cannot resurrect old authorization from memory/cache.

### Mutation/self-grant

6. `member` proposes grant-to-self admin and supplies `role=admin` in payload → DENY; zero privilege mutation.
7. currently authorized admin performs allowed role/grant mutation → owner guard succeeds.
8. losing a race with concurrent revocation causes guarded sensitive mutation to fail; stale pre-read cannot still commit.
9. narrowing operation does not bypass caller authorization merely because target power decreases.

### Approver eligibility

10. authenticated but currently unauthorized Account attempts ALLOW_ONCE → no decision write.
11. currently eligible Account can ALLOW_ONCE exact operation the human is authorized to cause.
12. same eligible Account may have initiated the conversation and approve under F1 baseline; no phantom second-person requirement.
13. committed ALLOW_ONCE remains immutable if role changes afterward.
14. later current Connection/security deny still blocks effect admission even with historical ALLOW_ONCE.
15. no Agent/runtime/provider identity can write human decision.

### Revocation / runs / effects

16. Account/session revoke blocks new Account-origin protected admissions.
17. trigger DISABLE before fire admission → no new AgentRun; disable after admission does not rewrite run.
18. AgentRun cancel before FIRST_CLAIM → no effect attempt.
19. AgentRun cancel after effect admitted NOT_SENT + close wins → attempt never dispatches.
20. dispatch wins before close → cancellation cannot assert NOT_SENT/FAILED fiction.
21. old Release + current Connection credential revoke → new Gateway use denied; Release bytes/history unchanged.
22. current binding UNBIND alone does not rewrite already active Release execution composition.
23. Project ARCHIVED does not accidentally become authorization revocation/unpublish.

### Emergency/YAGNI

24. named F1 incident classes above are containable using owner-local controls or whole-Hub operational stop without a generic `SecurityHold` entity.
25. if a test proves a selective cross-owner stop is required, current design has a clean Decision Loop seam and no hidden stop semantics to migrate.

---

## 18. Adversarial challenge before Fable

Fable must attack at least these questions independently:

1. Does “no cross-request mutable auth cache” belong in architecture or is it implementation overreach? If rejected, show an equally simple current-revocation guarantee with no invalidation subsystem.
2. Is authorization against the exact operation's existing permission sufficient for `ALLOW_ONCE`, or is there a concrete F1 case where a human should approve an effect they are not authorized to perform directly?
3. Does F1 self-approval create a real security failure class given the current solo/small-team product, or would universal requester≠approver be unsupported accidental complexity?
4. Should approver eligibility be rechecked after `ALLOW_ONCE` but before FIRST_CLAIM? If yes, reconcile with write-once ApprovalRequest semantics without hidden resurrection/fan-out or prove a Material Finding requiring STALE expansion.
5. For Account-origin long-running AgentRun/ActorRun, which current Account facts must be rechecked at later privileged Gateway boundaries, and which session facts are admission-only? Avoid both stale authority and “logout kills all durable work” by accident.
6. Is the current owner-local incident-control set + whole-Hub stop truly sufficient? Find a concrete F1 incident that requires a new project/global security fact now, or confirm deferral.
7. Does a Project-level security hold belong to Project, I&A, Release or another owner if it becomes necessary? Do not create it unless challenge 6 proves the failure class.
8. Are there any current owner facts incorrectly classified in §13 as “revocable now” versus “historical/future-intent only”?
9. Does any part of this candidate silently create a second authorization model beside 3C-02/C-015?
10. Can every proposed control be shown to fire without OPA, event bus, auth snapshot, generic revocation service or new durable record class?
11. Are any questions actually 3J/3L/3M rather than 3I?
12. Does this candidate require reopening 3F-03, 3G-01, 3G-05, 3G-06, 3G-07 or 3G-08? If yes, identify the exact Material Finding and failure schedule; preference is not enough.

---

## 19. Decision candidate

If the adversarial review survives, the intended authority would be approximately:

> **Conexus F1 authorizes protected work from current server-side authority, not from stale runtime/session/history. Identity & Access resolves current Account relationships/roles/effective permission for the exact surface; each operation owner retains the meaning of its permission and current state gates. Security-sensitive mutations are authorized from pre-mutation state, so proposed authority cannot self-bootstrap. PAR `ALLOW_ONCE` may be decided only by a currently eligible human Account whose current authority admits the exact effect under the same Project/surface; F1 does not require requester/approver separation unless a named future workflow does. Recorded approval and Release/run history remain immutable; later access changes narrow future protected admissions at their owner control points rather than rewriting history. Gateway preserves current last-mile security and close-before-dispatch semantics. Project archive, binding-current changes and newer Releases are not security revocation by convenience. F1 introduces no cross-request mutable authorization cache, no generic authorization snapshot, no revocation engine and no new security-stop entity; existing owner-local revoke/cancel/disable/close/rollback controls plus a 3J whole-Hub operational stop are the baseline, with a selective security hold returning only on a proven incident failure class.**

---

## 20. Provisional outcome before independent review

```text
Material Finding against approved 3B..3H authority = NONE found by ChatGPT
prior reopen required                              = NONE currently
candidate                                          = 3I-01
recommended alternative                            = B / current-resolution composition
new module                                         = 0
new durable record class                           = 0
new Tier-2 FK                                      = 0
new policy engine                                  = 0
new revocation engine                              = 0
new auth cache/invalidation bus                    = 0
new approval role                                  = 0
universal four-eyes                               = 0
new security hold                                  = 0
technology mechanism selected                      = 0
```

Fable should edit below this line only after reconstructing authority independently.

---

## 21. Fable independent adversarial review

**Fable: reconstruct the applicable authority from the repo, challenge the candidate above independently, research current primary security sources where load-bearing, and edit this same file with findings/corrections. Focus on authorization freshness, self-grant, approver eligibility/self-approval, post-approval revocation, Account-origin long-running runs, old-Release narrowing and the emergency-stop deletion test. Do not modify LEDGER, approved authority or product code.**

---

**Method:** DevelopmentConexus Engineering Method v1.0.0 applied. Authority reconstructed independently: 3C-02, C-015 (session/roles/permission manifest incl. `allowed_roles` closure), 3F-03, 3G-01, 3G-05..08, 3H-01..03, C-010 (`actorType=AGENT`, approvalFloor, budgets), C-011 (drift/health states), C-013 (admission ledger, producer trust), C-014 (conformance/maintenance), C-016, C-017. The candidate's §1 quotations were verified against these sources, not trusted. No claim in this round depends on live vendor behavior — the one concurrency finding rests on standard documented PostgreSQL transaction-isolation semantics — so no external research pass was needed; the candidate's NIST/OWASP citations were checked for what they are used for (contextual separation of duties, per-boundary recheck) and are used correctly.

## F.1 Verdict

Alternative B survives all eight attack targets. **No Material Finding against 3C..3H; no reopen of 3F-03, 3G-01, 3G-05..08 or any other approved authority is justified** — every schedule I constructed that looked like it needed a reopen is already closed by a composition of frozen laws once that composition is stated explicitly. The review returns six bounded refinements: one under-specified enforcement law (the pre-state guard's concurrency semantics), one open question the candidate itself flagged and which frozen 3H-01 law already answers (Account-origin long-running runs → re-entry control points), two classification sharpenings (§13 health/conformance facts; eligibility measured against the declared permission model), one composition that must be stated rather than implied (post-approval staleness = expiry + owner cancel/close, no recheck at claim), and one strengthening of the self-approval rationale that makes §10.4 structurally safe rather than merely proportionate. YAGNI holds: nothing below adds a policy engine, snapshot, revocation engine, durable record, approver role, or stop entity. Method outcome: **CURRENT STRUCTURE CONFIRMED** with bounded corrections.

## F.2 Findings

### F-1 — E4/proof 8 overclaims as written: the pre-state guard needs an explicit atomicity law, not a promised race loss

```text
claim challenged      §9/E4 "resolve current caller authority BEFORE proposed
                      mutation takes effect ... apply conditional mutation/CAS"
                      + proof 8 "losing a race with concurrent revocation causes
                      guarded sensitive mutation to fail; stale pre-read cannot
                      still commit"
concrete failure schedule
                      t0  admin A's authority rows are read (pre-state ALLOW)
                      t1  demote(A) commits in a concurrent transaction
                      t2  A's grant-admin-to-B mutation commits
                      Under default READ COMMITTED, t2 commits fine: the
                      pre-read at t0 and the write at t2 touch DIFFERENT rows
                      (A's grants vs B's grants), so no conflict is detected —
                      B becomes admin authorized by an already-revoked A.
                      Proof 8 as phrased asserts this cannot happen, but
                      nothing in E4 makes it true: "CAS mutation" guards the
                      TARGET row, not the AUTHORITY rows the decision was
                      read from. The proof would fail against the candidate's
                      own enforcement.
smallest correction   state the law E4 actually needs: for security-sensitive
                      mutations, the pre-state authorization read and the
                      mutation commit are ATOMIC — same transaction, with the
                      authority facts the decision consumed serialized against
                      concurrent revocation (locking read on those rows, or
                      serializable isolation with failure treated as DENY/retry).
                      This is one sentence of architecture law; the spelling
                      (FOR UPDATE vs SERIALIZABLE vs guard re-read) is
                      implementation. No engine, no epoch, no new record.
                      Scope it honestly: this atomicity is required for
                      security-sensitive MUTATIONS (§9.2 list); ordinary
                      protected reads/admissions keep plain current-read
                      semantics — their staleness is already bounded by the
                      no-cache baseline.
reopen prior authority?  NO — tightens the candidate's own E4/proof 8
later owner           3I-01 text (law), implementation (spelling)
```

### F-2 — Account-origin long-running runs: the candidate's open question is already answered by frozen law — recheck happens at durable re-entry points

```text
claim challenged      §11.2 leaves as review target which Account facts must be
                      re-resolved at later privileged boundaries of an admitted
                      ActorRun/AgentRun
analysis              the architecture already contains the answer; it only
                      needs to be composed and stated:

                      1. the run is not a prolonged human session. C-010 froze
                         agent execution as its own actor (actorType=AGENT,
                         stable actorId); 3G-05 froze caller/authority context
                         as ADMISSION facts. The originating Account is a
                         historical admission fact, not a live authority feed.
                      2. every path by which the run re-enters privileged
                         execution is ALREADY a defined current-authority gate:
                           new Builder dispatch/rebind → 3H-01 law: "current
                             Conexus authority/config is mechanically reapplied
                             on every dispatch/rebind"
                           trigger fire → guarded PAR admission (3H-02)
                           dangerous effect → ALLOW_ONCE with CURRENT human
                             eligibility (§10.2 of this candidate)
                           external effect → Gateway current last-mile gates
                             (3G-06, Connection/grant/budget/security)
                           boot/recovery re-drive → re-enters owner guards
                             (3H-02)
                      3. session facts (login/logout/session expiry) are
                         admission-only by construction: sessions authenticate
                         interactive surfaces (C-015); durable work survives
                         them. Logout must not cancel admitted work.
                      4. Account platform facts (DISABLED, removed membership)
                         take effect at every RE-ENTRY point in list 2 — a
                         disabled Account cannot open new dispatches/rebinds,
                         cannot be an eligible approver, cannot originate new
                         protected requests — while the currently executing
                         segment runs to its terminal under its admitted pins.
                      5. the residual — an admitted segment of a
                         now-disabled Account's run continuing non-approval
                         effects until segment terminal — is bounded by
                         budgets (C-010), Connection current state, Project
                         scope, and is exactly what owner CANCEL is for
                         (incident response cancels the runs of a compromised
                         account; it does not need a new mechanism).
smallest correction   replace §11.2's open paragraph with the re-entry-point
                      law: "Account platform facts are rechecked at every
                      durable re-entry control point (dispatch/rebind, trigger
                      admission, approval decision, Gateway admission,
                      recovery re-drive); session facts are admission-only;
                      no continuous mid-segment re-resolution; incident
                      response composes owner cancel/close."
                      This avoids both failure modes the candidate feared:
                      no stale eternal authority (every durable continuation
                      passes a current gate) and no "logout kills durable
                      work" (session is not one of the gated facts).
reopen prior authority?  NO — composes 3H-01/3H-02/3G-05/3G-06/C-010 as frozen
later owner           3I-01 text
```

### F-3 — Approver eligibility: measure against the declared permission model, and close two loose ends

```text
claim challenged      §10.2 "eligible only if the exact operation would be
                      within that Account's current human authority"
analysis + corrections
                      (a) "would be authorized to cause" must be measured
                      against the operation's DECLARED permission model, not
                      presentation reachability. An agent-eligible action with
                      no UI surface still has a total permission definition:
                      C-015 froze `action sem allowed_roles = MANIFEST_INVALID`
                      — every action carries allowed_roles (plus membership
                      before role, plus admin_only). So eligibility is always
                      well-defined: approver ∈ current members whose current
                      role satisfies the exact pinned action's declared
                      permission layer for that Project/surface. State this,
                      or "human authority" invites a UI-reachability reading
                      that would make agent-only actions unapprovable or —
                      worse — eligibility undefined.
                      (b) trigger-origin AgentRuns have no requesting human
                      session; §10.2's "Project / origin surface from owner
                      facts" must therefore be explicit that the approval
                      surface mapping is an OWNER-DERIVED fact of the pinned
                      Release/manifest (which surface's role model governs
                      approval for this action), never undefined and never
                      caller-chosen. No new policy object — the manifest/pins
                      already carry the action's permission layer.
                      (c) terminology: §10.3 says an undecided request remains
                      "claimable for another eligible Account". In 3F-03,
                      "claim" is the single effect-side claim of a committed
                      ALLOW_ONCE. Use "decidable" for the human slot; reusing
                      "claim" for both creates two meanings for a frozen term.
reopen prior authority?  NO
later owner           3I-01 text (a, b); editorial (c)
```

### F-4 — Post-approval authority loss: no recheck at claim; state the bounding composition explicitly

```text
claim challenged      §10.5 + challenge 4 — should eligibility be rechecked
                      after ALLOW_ONCE before FIRST_CLAIM?
concrete failure schedule examined
                      admin approves malicious effect → org demotes/disables
                      the approver → effect still pending NOT_SENT → dispatch
                      proceeds under a decision whose approver is now revoked.
analysis              rechecking eligibility at claim/dispatch would make the
                      committed decision revocable-by-side-effect: it
                      contradicts write-once + single-claim + permanent
                      binding (3F-03/3G-01), imports live I&A facts into the
                      Gateway claim guard (a second authorization model — the
                      candidate's own challenge 9), and opens resurrection
                      questions (role restored → re-eligible?). The schedule
                      is already closed WITHOUT it, by composition:
                        1. expiry (3G-01, derived) bounds how long any
                           committed decision can wait unexecuted — this is
                           the maximum approval-trust staleness, and it is a
                           frozen owner law, not a new parameter;
                        2. the incident action targets the EFFECT, not the
                           history: owner cancel (AgentRun/ActorRun) and
                           Gateway close-before-dispatch kill the pending
                           attempt (3G-05/06);
                        3. current last-mile gates (Connection/security) still
                           apply at admission/dispatch regardless of approval
                           history (3G-06).
                      If you distrust the approver, you revoke their access
                      (blocks all FUTURE decisions — F-2 re-entry law) and
                      cancel/close their pending effects. History stays
                      auditable.
smallest correction   §10.5 must state this composition normatively — expiry
                      as the staleness bound + cancel/close as the
                      post-decision revocation path — instead of gesturing at
                      "owner-local controls described below". No STALE
                      expansion, no reopen of 3F-03/3G-01.
reopen prior authority?  NO — the frozen semantics are exactly what makes the
                      answer safe
later owner           3I-01 text
```

### F-5 — §13 classification sharpening: owner-committed health/conformance states are current gates; raw telemetry is not — do not let one bullet blur the two

```text
claim challenged      §13 lists "telemetry says unhealthy" as not-a-revocation
                      fact, while the evidenced current-facts list omits
                      owner-committed operational gates
concrete failure class a reader (or implementer) collapses "unhealthy" into
                      one category and either (a) lets raw telemetry deny
                      operations — violating the frozen "observability is
                      never authorization authority" law — or (b) assumes NO
                      health-shaped fact may gate anything, contradicting
                      already-approved owner gates: C-011 froze drift/health
                      states where SUSPECT blocks effectful Brain-backed
                      operations (owner-committed state machine, runtime must
                      respect it); C-014 froze EnvironmentConformance
                      DRIFT => STOP and the maintenance serving-block
                      (3G-08: it survives failed Promotion terminalization).
smallest correction   split the vocabulary in §13: OWNER-COMMITTED operational
                      state (Brain health states, EnvironmentConformance,
                      maintenance/serving blocks, Connection eligibility) IS
                      part of the evidenced current-narrowing facts — each
                      owned, each already approved; RAW observation (metrics,
                      traces, provider/guest self-report) remains never-
                      authority (C-013 producer-trust discipline). The line
                      is "who committed the fact", not "does it smell like
                      health".
reopen prior authority?  NO — aligns the candidate with C-011/C-013/C-014
later owner           3I-01 text
```

### F-6 — Self-approval survives more strongly than argued: the eligibility law makes it a non-escalation by construction

```text
claim challenged      §10.4 defends F1 self-approval mainly on product
                      proportionality (solo/small-team operation)
analysis              the structural argument is stronger and should lead:
                      given §10.2, the approver must already hold current
                      authority to cause the exact operation directly.
                      Therefore self-approval grants ZERO privilege the human
                      does not already possess — approval is oversight of
                      AGENT autonomy (a checkpoint that a human saw the exact
                      sealed subject), not a second human control layer.
                      Removing self-approval would not remove any capability
                      from a malicious eligible human (they can perform the
                      operation directly); it would only add an availability
                      dependency on a second Account. Separation of duties
                      is therefore genuinely orthogonal: it becomes material
                      only when a workflow requires INDEPENDENT roles
                      (financial dual control), which is the Decision Loop
                      trigger the candidate already routes. The NIST AC-5
                      citation supports exactly this contextual reading.
smallest correction   lead §10.4 with the non-escalation composition;
                      keep the product rationale as secondary. No behavioral
                      change.
reopen prior authority?  NO
later owner           3I-01 text (rationale ordering only)
```

### F-7 — Emergency-stop deletion test: PASSES for F1; name the nearest future hold and its owner so the seam is real

```text
claim challenged      §14 — no new stop/hold entity; owner-local controls +
                      whole-Hub operational stop suffice
adversarial search    incident classes tested against the control set:
                        compromised Account        → revoke + cancel runs (F-2)
                        compromised Connection     → credential/grant revoke
                        malicious trigger source   → trigger DISABLE
                        runaway agent spend        → cancel + Family D caps
                        unsafe Release, safe pred. → rollback Promotion
                        actively-malicious served app, NO safe predecessor
                                                   → the one class where
                                                     owner-local controls are
                                                     slow: Connection revoke
                                                     kills external effects
                                                     but the app keeps serving
                                                     users; the remaining F1
                                                     answer is the whole-Hub
                                                     stop — acceptable at
                                                     single-Hub/few-project
                                                     scale, increasingly
                                                     unacceptable as projects
                                                     multiply.
verdict               deletion test PASSES for F1: no durable stop/hold
                      entity now. Two sharpenings make the deferral honest:
                      (1) name the nearest future hold explicitly — a
                      per-Project SERVING stop (halt serving admission for
                      one Project without touching Release history or other
                      projects) — as the likely first Decision Loop re-entry,
                      with its owner pre-identified: serving admission
                      (Release/MAR boundary), NOT I&A, NOT a new module, NOT
                      a cross-owner kill-switch engine. This answers
                      challenge 7 without creating anything.
                      (2) the whole-Hub stop is load-bearing in this design:
                      3J must deliver it as a PROVEN operational procedure
                      (stop ingress/process safely, fail-closed semantics for
                      in-flight work), not an assumption. Add that dependency
                      to the routed work.
reopen prior authority?  NO
later owner           Decision Loop (per-Project serving stop, on proven
                      incident class), 3J (whole-Hub stop procedure as a
                      deliverable), 3M (post-stop settlement)
```

## F.3 Answers to the twelve challenges

1. Keep the no-cache baseline, framed correctly: the LAW is zero cached staleness for mutable authority at protected boundaries (staleness bounded only by transaction visibility); the cache ban is the chosen F1 enforcement, with the candidate's measured-latency reopen + stated-max-staleness condition for any future cache. That is architecture stating a property plus its baseline enforcement — not implementation overreach.
2. Sufficient — with F-3(a): eligibility measures against the exact action's declared permission model (total by C-015's `allowed_roles` closure), never UI reachability. No F1 case exists for approve-without-authority, and admitting one would turn approval into authority laundering — the exact §10.2 target.
3. No real failure class (F-6): self-approval is non-escalating by construction under the eligibility law. Universal requester≠approver would be unsupported accidental complexity; contextual dual control returns via Decision Loop.
4. No recheck between decision and claim (F-4). Write-once + derived expiry + owner cancel/close + current last-mile gates already close the failure schedule. A recheck would be a second authorization model and hidden resurrection semantics. No STALE expansion; no Material Finding.
5. Answered by composition of frozen law (F-2): re-entry control points recheck Account platform facts; session facts are admission-only; no continuous mid-segment re-resolution; incident response = owner cancel. Neither stale eternal authority nor logout-kills-work.
6. Sufficient for F1 (F-7), including the honest worst case (malicious served app without safe predecessor → whole-Hub stop at current scale). Deferral confirmed with a named reopen trigger.
7. If proven: per-Project serving stop owned by the serving-admission boundary (Release/MAR) — not I&A, not Project lifecycle, not a new module. Not created now (F-7).
8. Yes, one: §13's telemetry bullet must be split — owner-committed operational state (C-011 health states, C-014 conformance, maintenance/serving blocks) belongs in the evidenced current-narrowing facts; raw observation stays never-authority (F-5).
9. No second authorization model found. The one place it could sneak in — approver eligibility as a parallel approver-policy store — is already avoided by reusing I&A resolution + the operation's declared permission layer; F-3 keeps it that way. F-4 blocks the other entry path (live I&A facts inside the Gateway claim guard).
10. Yes, with F-1's atomicity law added: per-boundary current reads, transactionally-serialized guarded mutations, existing owner primitives. Zero new records, engines, buses, snapshots.
11. Routing is clean: whole-Hub stop procedure = 3J (now an explicit deliverable per F-7); serialization spelling = implementation; settlement after stop/cancel = 3M. Nothing else misplaced.
12. No reopen of 3F-03, 3G-01, 3G-05..08 or anything else. Every schedule that appeared to need one is closed by stated composition of frozen laws (F-2, F-4). **Material Finding = NONE.**

## F.4 Closing verdict

```text
Material Finding against 3C..3H            = NONE
reopen required                             = NONE
alternative B                               = CONFIRMED / GLOBAL MAXIMUM
corrections to consolidate                  = F-1 (E4 atomicity law)
                                              F-2 (re-entry-point law replaces §11.2 open question)
                                              F-3 (eligibility vs declared permission model;
                                                   trigger-origin surface mapping; claim/decidable)
                                              F-4 (state expiry + cancel/close composition; no recheck)
                                              F-5 (owner-committed state vs raw observation in §13)
                                              F-6 (lead self-approval with non-escalation argument)
                                              F-7 (name per-Project serving stop + owner as the seam;
                                                   whole-Hub stop becomes an explicit 3J deliverable)
new policy/revocation engine                = 0
new snapshot / cache / invalidation bus     = 0
new durable record class                    = 0
new approver role / four-eyes               = 0
new stop/hold entity                        = 0
technology mechanism selected               = 0

verdict = CURRENT STRUCTURE CONFIRMED — ready for consolidation and
          operator review as 3I-01 after the corrections above are folded in
```

