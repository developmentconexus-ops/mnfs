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
