# 3I Fable Dialogue — Security / Authority Intake & Decomposition

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** intake/decomposition only; this file does **not** create `3I-01`, does not alter approved authority, does not update `LEDGER.md`, and does not authorize implementation/merge.

## 1. Canonical starting point

Reconstructed from the repository authority chain required by `AGENTS.md`:

```text
DevelopmentConexus Engineering Method v1.0.0
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ accepted 3B..3H authority
→ current evidence / implementation only after authority
```

Current canonical status at intake:

```text
3B = CLOSED / APPROVED
3C = CLOSED / APPROVED
3D = CLOSED / APPROVED
3E = CLOSED / APPROVED
3F = CLOSED / APPROVED
3G = CLOSED / APPROVED
3H = CLOSED / APPROVED
3I = NOT STARTED / NEXT
```

`3H-R1-runtime-agent-architecture-final-closure.md` explicitly routes to 3I:

```text
credential custody
principal/trust boundaries
approver eligibility/revocation
last-mile authorization
browser/workspace/code-exec trust if enabled
DEDICATED delegation
network/egress authority
OTel baggage/redaction/egress rules
current security narrowing/emergency stop
per-run model spend-cap enforcement point
```

No `3I-XX` authority exists yet.

## 2. Evidence already frozen before 3I

### Identity / Authentication / Authorization

`3C-02-identity-access-module-boundary.md` already freezes:

```text
Account = global Hub human identity
Identity/AuthN and Access/AuthZ Context = distinct conceptual boundaries inside one I&A module
I&A owns account/session/memberships/grants/role assignments/access-context resolution
CONTROL_PLANE | PREVIEW | PUBLISHED_APP = independent authorization contexts
I&A DENY = deny
I&A ALLOW = only permission to continue evaluating domain/Gateway preconditions
Observability != authorization authority
```

`C-015` / `13-runtime-publicado.md` freezes for the MANAGED published-app baseline:

```text
central Account
server-side opaque session
HttpOnly cookie; no browser JWT/token authority
Project/surface derived server-side
membership before role
closed app roles
server-side authorization
account disable/reset revokes sessions
same-origin MANAGED apps = one browser code trust zone
```

`3C-12` later limits that shared-runtime auth/serving topology to MANAGED, not DEDICATED.

### Runtime identities are not automatically principals

`3H-01..03` freeze that:

```text
ActorRunId / AgentRunId / CodingSessionId = durable Conexus execution/correlation identities
Mastra/E2B/trace/provider refs = observations/correlation only
Builder/PAR runtime state != authority
RequestContext is rebuilt from owner facts and replaced whole on dispatch/resume
F5 in-process handoff binds owner run identity through owner-created context, not producer payload
```

Builder and PAR may remain same-process under distinct role-specific Mastra instances/stores/PubSub. Therefore current architecture does **not** justify service identities merely because modules have different owners.

### Gateway last-mile authority

`3C-08` freezes:

```text
Gateway = last-mile admission + controlled execution for Project Data / external integrations
caller cannot self-declare role/project/target/approval/release authority
required FALSE | UNKNOWN | STALE | MISSING | REVOKED fact never becomes ALLOW
approval/current authority rechecked immediately before execution
Gateway is not a universal privileged-operation bus
```

### Credential custody already constrained

`3C-07`, `C-008`, `C-016`, and `3A-R5` freeze:

```text
credential bytes never in Git/Registry/Release/browser/E2B by default
Connection stores opaque credential relation/handle + logical grant semantics, not plaintext
logical grant version != cryptographic key version
credential revoke => use becomes ineligible fail-closed
credential entry = platform write-only path; no echo to agent/chat
Builder model loop moved control-side in 3A-R5
provider provisioning/master key never enters E2B
any unavoidable guest-readable capability must be ephemeral + scoped + bounded + revocable
```

### DEDICATED exchange semantics already fixed, mechanism intentionally open

`3F-06-dedicated-platform-service-exchange.md` freezes:

```text
DEDICATED Platform-Service access = server-to-platform
asserted identities = DedicatedApplicationPrincipal + exact ReleaseRef
DelegatedConexusPrincipal only if independently established later
Project / Workspace / audience / bindings are derived and verified server-side
ReleaseRef is exact compatibility/composition attestation, not itself authentication proof
own-auth userId field never creates Conexus user authority
no browser-direct Platform-Service authority in F1
no raw Platform/Connection secret in DEDICATED runtime
```

3F-06 deliberately leaves auth mechanism, issuance/rotation/revocation, replay protection, delegation, credential custody and network policy to 3I.

### Release history versus current security

`3G-08` freezes:

```text
Release history/pins are immutable
newer Release does not invalidate an older supported DEDICATED Release merely for being newer
current owner/security policies may block operations immediately
old Release admissibility remains subject to independent current revocation/narrowing
emergency global stop belongs to 3I/ops
```

### Approval / effect revocation seam

`3F-03`, `3G-01`, `3G-06` freeze:

```text
approver principal + eligibility are server-derived; exact eligibility remains 3I
ApprovalRequest ALLOW_ONCE is exact/single-claim
Gateway EffectAttempt remains physical-effect truth
post-admission close-before-dispatch exists and races atomically with dispatch
who is authorized to cause close/revocation remains 3I + consumer authority
```

### Model-spend invariant survived the runtime change

`3H-R1` explicitly closes the reconciliation:

```text
C-008 per-ActorRun bounded model spend remains load-bearing
3A-R5 control-side model loop changes enforcement placement, not the invariant
3I must close per-ActorRun / per-AgentRun model spend-cap enforcement point
no model proxy / token broker / BudgetRuntime / generic quota engine is implied
```

### PostgreSQL role topology remains deliberately open only for hub_control/security

`3E-01` freezes:

```text
hub_control module ownership is enforced structurally in code/migrations, not by role-per-module
role-per-module = rejected F1 ownership mechanism
3I/ops still owns runtime role(s), migrator, maintenance/backup, diagnostic role and optional schema grants/RLS only under concrete threat model
Project Data roles from C-006 remain unchanged
```

`C-006` already freezes Project Data least privilege:

```text
owner NOLOGIN
migrator
query read-only
DML action role
negative privilege probes
```

### OTel / telemetry trust

`3H-03` freezes:

```text
OTel = observational plumbing, never authority
Conexus owner IDs do not use OTel baggage by default
baggage may propagate outbound and lacks built-in provenance/integrity suitable for authority
future baggage use requires explicit 3I trust/egress/redaction decision
producer_trust remains HUB_AUTHORITY | GATEWAY_AUTHORITY | PROVIDER_OBSERVED | GUEST_OBSERVED
```

## 3. Known / Inferred / Unknown / Deferred

### KNOWN

1. Human identity is `Account`; Account/session authority already exists and must not be reinvented.
2. DEDICATED introduces one real non-human trust subject: `DedicatedApplicationPrincipal`.
3. Builder, PAR and Gateway are current module/runtime roles, not automatically separately authenticated service principals in the same-process baseline.
4. `ActorRun`, `AgentRun`, trace IDs, Mastra refs and E2B sandbox IDs are not authorization principals.
5. Gateway remains last-mile data/integration enforcement; I&A alone never grants execution.
6. Durable secrets remain server-side; guest/browser do not receive them.
7. Historical Release pins must coexist with current revocation/security narrowing.
8. Per-run model spend is an authority/budget invariant, not merely telemetry/accounting.
9. `hub_control` DB role topology is still open; role-per-module and RLS-by-default are already rejected.
10. OTel/guest/provider telemetry cannot manufacture authority.

### INFERRED — must be challenged

1. 3I needs an explicit **closed F1 principal/trust-subject taxonomy**, including a negative list of things that are not principals.
2. Authentication and authorization need separate decisions/laws even if they remain within one I&A module.
3. Current authorization/revocation must be recomposed at each privileged boundary rather than snapshotted into runtime/session/Release state indefinitely.
4. `DedicatedApplicationPrincipal` can likely remain derived/non-record identity; credential lifecycle may still require a security record/handle, but that is not yet proven.
5. E2B guest should normally possess no direct durable Platform credential; any direct guest capability must pass the C-008 ephemeral/scoped/bounded/revocable deletion test.
6. Model-spend enforcement is distinct from Gateway external-effect budget accounting even if both can reuse narrow persistence/admission patterns.
7. One global emergency-stop object/boolean is **not** pre-admitted; first test whether existing owner-local revoke/cancel/close controls cover the concrete incident classes.

### UNKNOWN — do not freeze by memory

1. Concrete DEDICATED trust mechanism: OAuth-family, mTLS, signed token/JWT, key-based challenge, PoP, or another mechanism.
2. Whether the selected DEDICATED mechanism proves need for a new durable credential/grant record.
3. Concrete credential backend / encryption / KMS realization and master-key custody.
4. Strongest practical per-ActorRun/per-AgentRun spend enforcement supported by selected model/provider paths.
5. Exact `hub_control` runtime/migrator/backup/diagnostic grants and login-role realization.
6. Exact OTel baggage/exporter stripping/redaction mechanism if any baggage/export path is enabled.
7. Whether any current F1 consumer truly requires end-user delegation into DEDICATED Platform-Service calls.

### DEFERRED BY CURRENT AUTHORITY

```text
physical process/container/DNS/TLS/ingress topology             → 3J
Builder/PAR process split when qualification fires              → 3J
exact Mastra/E2B/OTel APIs/version behavior                     → 3L
E2B firewall/incarnation/OTLP mechanism proof                   → 3L
orphan/lost-run/undispatched/settlement recovery                → 3M
browser-direct DEDICATED Platform-Service access                → Decision Loop on named consumer
SSO/SCIM/passkeys/external IdP                                  → existing trigger / Decision Loop
positive DelegatedConexusPrincipal federation without consumer  → Decision Loop
internal service identities only because modules may split later→ Decision Loop after real process/trust boundary
OPA/Cedar/OpenFGA/policy DSL                                    → Decision Loop after second authorization model
RLS                                                             → only concrete audience/failure-class trigger
universal model proxy/token broker                              → trigger only if current boundary cannot enforce safely
```

## 4. Root Cause

The remaining security problem is **not** “Conexus lacks authentication” or “Conexus needs a security framework.” Those are already largely decided.

The unresolved failure class is:

> runtime, historical or caller-controlled state can outlive or misrepresent current authority unless every privileged trust crossing mechanically re-establishes who/what is acting, what exact scope/pins it carries, which current owner facts can still narrow it, and which physical credential/network/cost capability is actually being exercised.

Typical unsafe schedules:

```text
old browser/session + removed membership → still executes
old Release + revoked Connection/permission → still executes
approved effect + approver/caller authority narrowed before dispatch → stale execution proceeds
DEDICATED app asserts another Project/audience/user → widened Platform access
E2B guest or compromised coding tool finds durable credential → escapes one-run blast radius
control-side model loop loses per-run cap → runaway spend despite no external effect
telemetry/baggage injects owner ids/role-like fields → correlation becomes pseudo-authority
hub runtime DB credential can DDL/own/CREATEROLE → app compromise becomes control-plane takeover
```

## 5. Target Invariant

Provisional cross-cutting invariant for 3I review:

> **No browser, guest, model, runtime substrate, historical Release, telemetry context or caller payload may manufacture, widen or indefinitely retain authority. Each privileged boundary authenticates the appropriate F1 trust subject, derives scope server-side, intersects exact historical pins with current revocable owner/security facts, exercises only the least physical capability required, and fails closed when required identity/authority/custody/budget facts are missing, stale, revoked or unverifiable.**

A useful non-normative mental model:

```text
effective privilege
=
authenticated trust subject
∩ server-derived surface/scope
∩ exact admitted/pinned composition
∩ current owner authorization/revocation
∩ boundary-specific approval/budget/preconditions
∩ least physical credential/network/DB capability
```

No term may widen another.

## 6. Candidate material decision families — NO `3I-XX` IDs yet

The intake currently finds **seven decision families**. This is a decomposition hypothesis, not a commitment to seven decisions. Independent review must merge/split only by owner/failure-class cohesion.

### Family A — F1 principals & authentication trust boundaries

Questions:

```text
What is an authenticated principal/trust subject in F1?
Account vs DedicatedApplicationPrincipal semantics
What is explicitly NOT a principal? ActorRun, AgentRun, trace, runtime role, sandbox id, ReleaseRef
Where does authentication end and authorization begin?
Does any current internal component require service identity? likely no under same-process baseline
What session/credential proofs are accepted at each external boundary?
```

Likely owner/boundary:

```text
I&A → Account authentication/session
3I security exchange → DEDICATED application authentication realization
Builder/PAR/Gateway in-process roles → not new service principals by default
```

Why first: every later decision needs to know what identity is being authenticated before it can define delegation, revocation, credentials or least privilege.

### Family B — Current authorization, approver eligibility, revocation & security narrowing

Questions:

```text
How is current authority recomputed after authentication?
Which current facts can narrow old Release/session/runtime pins?
Exact approver eligibility for PAR ALLOW_ONCE
Who may mutate bindings / credentials / grants / triggers / security-sensitive platform state?
When authority changes, what must fail immediately versus only on next admission?
Who may request Gateway close-before-dispatch?
How does current security narrowing apply to old MANAGED / DEDICATED Releases without mutating history?
What concrete incident classes require an emergency stop, and can owner-local controls cover them without a universal kill-switch authority?
```

Constraint:

```text
I&A ALLOW != domain/Gateway execution ALLOW
historical pin != irrevocable permission
revocation/current deny may narrow, never silently widen
```

### Family C — Credential & ephemeral capability custody

Questions:

```text
CredentialBackend security contract
plaintext decryption boundary
master/provisioning key custody
logical grant version vs crypto key version
credential create/replace/revoke eligibility by Workspace/Project scope
write-only ingress / no echo / sanitization / audit
E2B guest capability rule after 3A-R5 moved model loop control-side
pause/resume/TTL/revocation behavior for any guest-readable capability
model/provider durable credential custody for Builder/PAR control-side runtimes
```

YAGNI constraint:

```text
no generic Secret domain
no provider framework
no universal credential record unless a lifecycle/failure class proves it
no durable secret in browser/E2B/log/telemetry
```

### Family D — Per-ActorRun / per-AgentRun model spend authority

Failure class:

```text
runaway / compromised / looping agent can burn model spend
without crossing Gateway external-effect budget boundary
```

Questions:

```text
who owns the spend limit for ActorRun and AgentRun?
where is reservation/admission checked before each model call?
how does restart/resume preserve cap consumption?
what provider-side limit can be trusted as primary/defense-in-depth?
how do actual usage observations reconcile without telemetry becoming authority?
how does cancellation/revocation stop future model spend?
```

Deletion test:

```text
Can existing Builder/PAR owner facts + narrow budget/admission persistence enforce this?
If yes, do not build ModelProxy/BudgetRuntime/quota engine.
```

### Family E — DEDICATED Platform-Service trusted exchange & delegation

Realizes 3F-06, without redefining it.

Questions:

```text
how DedicatedApplicationPrincipal is authenticated
how exact ReleaseRef is cryptographically/transport-wise bound to that principal
credential issuance/rotation/revocation/replay protection
bearer vs proof-of-possession tradeoff
service audience derivation and anti-substitution
anti-oracle auth failure behavior
whether runtime instance identity matters at all
how compromised app credential blast radius stays Release/service/budget bounded
```

Delegation challenge:

```text
SERVICE_SCOPED has a concrete F1 consumer
USER_DELEGATED currently has no proven named F1 consumer
```

Provisional routing:

> close service-scoped application trust in 3I; keep positive user delegation/federation disabled/deferred until a named consumer proves it necessary.

A raw `userId` or app-user identity never becomes Conexus authority.

### Family F — Runtime/browser/network/telemetry trust zones & egress authority

One threat-boundary package, not a deployment topology decision.

Must distinguish:

```text
MANAGED browser
DEDICATED browser + its own server boundary
Hub/Managed Runtime/PAR/Builder control-side
Capability Gateway
E2B guest/root
app-under-test/browser telemetry
external systems / model providers / OTel exporter backend if enabled
```

Questions:

```text
which zones may initiate which network class?
which destinations are server-derived versus caller-selected?
where egress is enforced outside untrusted guest/code
what authority crosses E2B boundary, if any
what Conexus can guarantee for independently deployed DEDICATED general egress versus Platform-Service calls
which telemetry fields may leave a trust zone
OTel baggage default OFF / stripping / redaction / third-party propagation law
how guest/provider telemetry remains observational only
```

Boundary with later phases:

```text
3I = security law / allowed trust crossing
3J = concrete network/process/TLS/firewall placement
3L = provider/API/version proof that control actually fires
```

### Family G — PostgreSQL least-privilege security realization

Scope only what C-006/3E-01 did not already freeze.

Questions:

```text
hub_control runtime login role(s)
hub_control migrator/owner relationship
maintenance/backup role
read-only diagnostics role if a real operational consumer exists
schema/search_path/default privilege hardening
mastra_builder vs mastra_par DB credential isolation
which privileges runtime explicitly must NOT have
whether any RLS/schema-level defense is justified by a concrete failure class
```

Constraints:

```text
no role-per-module ownership mechanism
no RLS by default
preserve sanctioned same-transaction cross-owner operations
Project Data role topology remains C-006 authority
```

## 7. Dependency/order hypothesis

Do not number yet. Dependency shape currently appears to be:

```text
A — Principals/AuthN
        ↓
B — Current AuthZ/Revocation
        ↓
C — Credential/Capability Custody
       ↙ ↘
D — Model Spend     E — DEDICATED Trust Exchange
       ↘             ↙
F — Trust Zones / Network / Telemetry Egress
        ↓
G — PostgreSQL Least Privilege  # can be advanced independently once A/B semantics are stable
```

Rationale:

- identity before authorization;
- authorization before credential power;
- custody before selecting machine-trust exchange;
- model-spend needs owner/current-authority + credential placement but not DEDICATED;
- network/trust-zone matrix should consume, not redefine, the trust subjects/credentials already decided;
- DB role topology is security realization and should not drive principal/domain architecture.

Fable should challenge whether B/C or E/F are more coherent as merged packages, or whether any family contains two independent failure classes that must split.

## 8. 3I vs later phases — routing matrix

| Topic | 3I | 3J | 3L | 3M | Decision Loop |
|---|---|---|---|---|---|
| Principal semantics | yes | process placement only | mechanism proof only | no | new principal class only on real consumer |
| Account session/authz security law | yes | TLS/ingress deployment | library/API proof | recovery only if needed | SSO/SCIM/passkeys trigger |
| DEDICATED app trust semantics/mechanism family | yes | cert/token distribution topology | pinned implementation qualification | broken credential recovery if needed | new durable credential record if proven |
| User delegation/federation | only baseline disabled/deferred law | later | later | later | positive implementation on named consumer |
| Credential custody invariant | yes | vault/key ops/runbooks | selected backend/API proof | orphan reconciliation if stateful | new universal broker/provider framework |
| E2B guest capability security | yes | no | E2B exact control proof | orphan/lost capability repair | new guest capability class only if consumer |
| Model spend cap | authority/enforcement law | no | provider/API proof | orphan/reservation repair if required | model proxy only if existing boundaries fail |
| Network/egress authority | yes | physical topology/firewall/TLS | exact provider/firewall behavior | no | arbitrary server-code new surface |
| OTel baggage/redaction | security law | exporter/collector placement | exact OTel bridge/export behavior | no | positive baggage use after closed phase |
| hub_control DB least privilege | yes | credential deployment/rotation/runbook | driver/PG behavior probe if load-bearing | restore/repair only | RLS/new isolation model only by failure class |
| Builder/PAR process auth | no new service identity in current baseline | process split trigger | qualification | no | revisit if real out-of-process trust boundary |
| old Release security narrowing | yes | operational emergency procedure | no | recovery after incident | explicit retirement lifecycle on install-base consumer |
| effect outcome reconciliation | no | no | no | yes | no |

## 9. Credible decomposition alternatives

### Alternative 1 — One giant “3I security architecture” decision

**Provisional REJECT.**

Would mix:

```text
human AuthN
current AuthZ
secret custody
machine trust
model cost
network egress
DB privilege
telemetry propagation
```

under different owners/failure classes, making proof and reopen triggers ambiguous.

### Alternative 2 — Technology-first decisions

Examples:

```text
JWT decision
Vault decision
mTLS decision
OPA decision
OTel decision
Postgres role decision
```

**Provisional REJECT.** Mechanisms would become architecture before trust/authority semantics and would encourage accidental frameworks.

### Alternative 3 — Boundary/failure-class families above

**Provisional ADOPT as intake/global-maximum candidate.**

It preserves approved owners, lets technology be qualified only where load-bearing, and allows aggressive deletion of mechanisms with no consumer.

## 10. Essential vs accidental complexity

### Essential

```text
human Account authentication
non-human DEDICATED app authentication
current revocation over stale runtime/history
exact approver eligibility
secret custody
one-run guest blast-radius bound if a guest capability exists
per-run model spend enforcement
untrusted browser/E2B/Dedicated trust crossings
Gateway egress authority
hub_control least privilege
telemetry non-authority/redaction at trust boundaries
```

### Accidental / not admitted by intake

```text
GenericPrincipal framework
service identities for same-process modules
custom policy DSL / OPA / Cedar / OpenFGA
service mesh / SPIFFE/SPIRE
universal token format
universal credential/grant entity
multiple vault/provider abstractions
model proxy / quota service
role-per-module DB topology
RLS everywhere
global RuntimeBus / security event bus
OTel baggage for owner IDs
always-on universal emergency-stop engine
browser-direct DEDICATED Platform-Service path
```

## 11. Proof obligations to use when decisions are materialized

At minimum, future 3I decisions should attempt to falsify:

```text
1. disabled Account/session cannot execute protected MANAGED operation
2. removed membership/grant takes effect on next protected admission even with stale browser/runtime context
3. caller-supplied Project/Workspace/role/audience never widens authority
4. approver losing eligibility before decision cannot ALLOW_ONCE
5. approval/current authority narrowed before Gateway dispatch cannot bypass current last-mile gates
6. old Release remains historically exact but revoked Connection/permission/security control blocks newly forbidden operation
7. DEDICATED credential for app/project A cannot present Release/project B
8. DEDICATED app cannot call service audience absent from exact Release composition
9. own-auth `userId` cannot become DelegatedConexusPrincipal
10. no durable Connection/Git/model provisioning credential is readable in E2B/browser/log/telemetry
11. expired/revoked guest capability remains dead after E2B pause/resume/reconnect
12. ActorRun/AgentRun cannot exceed authoritative model-spend cap through retries/restart/resume
13. usage telemetry loss cannot grant extra spend authority
14. runtime DB role cannot DDL/own/CREATEROLE/escape intended hub_control runtime privileges
15. Project Data query/action negative privilege tests remain intact
16. injected trace/baggage/provider fields cannot alter principal/run/role/Project authority
17. outbound telemetry cannot leak classified secret material
18. guest/provider observation cannot create terminal/correctness/authorization truth
19. emergency/security narrowing cannot silently rewrite immutable Release history
20. no generic mechanism is required to satisfy the above when a narrower owner-bound control suffices
```

## 12. Adversarial challenges already identified for Fable

1. Is `DedicatedApplicationPrincipal` enough to trigger a broader machine/service identity architecture, or can it stay a narrow derived principal without reopening 3C-02?
2. Does any current Builder/PAR/Gateway flow truly require an authenticated service principal while same-process is still baseline?
3. Is approver eligibility merely an I&A permission check, or does exact effect family/scope require owner-specific eligibility beyond I&A?
4. Can current owner-local revoke/cancel/close primitives satisfy incident response, or is a separate emergency-stop authority materially necessary?
5. Does DEDICATED secure authentication unavoidably require a new durable credential/grant record? If yes, prove lifecycle/failure class before admitting it.
6. Can model spend be enforced through existing Builder/PAR owner boundaries without a proxy/quota subsystem, including concurrency and restart?
7. Is provider-side spend cap sufficiently authoritative for any path, or only defense-in-depth? Do not answer from memory; research current provider behavior when this becomes a decision.
8. Does E2B currently need *any* guest-readable Conexus capability after the control-side model move? If no, delete the mechanism rather than preserve it ceremonially.
9. Is network/egress + telemetry propagation one coherent trust-boundary family or two independent decisions?
10. Does one `hub_control` runtime DB role create unacceptable blast radius despite same-process modular monolith? If proposing more roles, show how sanctioned cross-owner transactions remain possible without role gymnastics becoming accidental complexity.
11. Is a positive USER_DELEGATED DEDICATED path a real F1 consumer or speculative federation machinery?
12. Are any 3I questions actually technology qualification (3L), deployment (3J), or failure/recovery (3M) in disguise?

## 13. Provisional intake disposition

```text
Material Finding against approved 3B..3H authority = NONE found so far
reopen of approved architecture                = NOT JUSTIFIED
3I missing material work                       = YES
candidate decision families                    = 7 (hypothesis, not IDs/count commitment)
technology mechanism frozen by this intake     = NONE
new durable record admitted                    = NONE
new infrastructure admitted                    = NONE
policy/workflow/provider framework admitted    = NONE
```

The next action after independent review should be:

1. challenge the family boundaries and routing;
2. merge/split only if owner/failure-class evidence requires;
3. identify the smallest dependency-root family to become the first **candidate** decision;
4. only then name `3I-01`.

---

## 14. Fable independent adversarial response

**Fable: edit below this line. Do not treat ChatGPT's seven-family hypothesis as the answer. Reconstruct authority independently, research current primary sources where a claim depends on live technology/security behavior, and return Material Findings, corrected decomposition/order/routing, YAGNI deletions, and the smallest justified first candidate. Do not edit LEDGER, approved authority, or product code.**

