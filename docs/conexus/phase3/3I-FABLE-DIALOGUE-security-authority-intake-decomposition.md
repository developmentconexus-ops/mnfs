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

---

**Method:** DevelopmentConexus Engineering Method v1.0.0 applied. Authority reconstructed independently from the `AGENTS.md` chain — `DECISOES.md` C-000..C-017, `LEDGER.md`, and direct reads of 3C-02, 3C-12, 3E-01 §13, 3F-03, 3F-06, 3G-08, 3A-R5 §8.2, 3H-01 and 3H-R1 — not from this intake's quotations. Primary-source research was run on 2026-08-17 for every claim that depends on live technology behavior: OpenTelemetry baggage propagation, E2B pause/resume persistence, Anthropic/OpenAI provider-side spend controls, current M2M authentication standards (RFC 9700, OAuth 2.1 draft, FAPI 2.0 Final, RFC 9449, RFC 8725), and PostgreSQL 15–18 privilege defaults. No mechanism is selected in this round.

## F.1 Verdict

I concur with the intake's central disposition: **no Material Finding against approved 3B..3H authority**; the quotations in §2 are faithful to the underlying decisions I re-read. Alternative 3 (boundary/failure-class families) survives against Alternatives 1 and 2, and the seven family **names** survive. The decomposition as drafted does not survive unchanged. The review finds: one owner-boundary defect (the same eligibility question lives in both B and C), one dependency-order error (D does not depend on C), one missing trust zone that no prior authority covers (Hub control-side egress after the 3A-R5 control-side move), one dead-machinery deletion candidate inside C (the C-008 per-run guest LLM key), and three families whose drafted question lists are substantially restatement of already-frozen authority (A, C, F) and must shrink to their genuinely open content before any of them becomes `3I-01`. Family count stays seven — no merge or split is justified by owner/failure-class evidence — but content moves. The smallest dependency-root candidate is a **rescoped Family A** (F.5).

## F.2 Findings

### F-1 — Family A is mostly restatement; the only new decision in it is the closure itself

```text
claim challenged      §6 Family A question list: principal semantics, authn/authz
                      seam, session proofs per boundary, non-principal list
concrete failure class none prevented by re-deciding what is already frozen;
                      cost created: a "3I-01" that re-litigates 3C-02 (Account,
                      I&A seam, ALLOW-continues-evaluation), C-015 (opaque
                      session, HttpOnly, server-side authz), 3F-06 (Dedicated
                      principal, two asserted identities) and 3H-01..03 (runtime
                      IDs are correlation only) invites drift between two
                      authorities for the same meaning — the exact defect class
                      the method presumes wrong. Every constituent of A already
                      has an owner. What NO prior authority states is the
                      CLOSURE: that the F1 trust-subject set is COMPLETE with
                      exactly {Account, DedicatedApplicationPrincipal}, that
                      everything else is non-principal by construction, and that
                      a new principal class re-enters only through Decision Loop.
smallest correction   rescope A to closure-only content (F.5). Session
                      mechanics stay C-015; DEDICATED proof stays Family E;
                      in-process identity stays 3H-03 dispatch-closure law.
                      A cites them by reference; it re-decides none of them.
reopen prior authority?  NO
later owner           A rescoped = first candidate decision (F.5)
```

### F-2 — Credential mutation eligibility appears in both B and C: owner-boundary defect

```text
claim challenged      §6 Family B asks "Who may mutate bindings / credentials /
                      grants / triggers?"; Family C independently asks
                      "credential create/replace/revoke eligibility by
                      Workspace/Project scope"
concrete failure class the same authorization question decided in two decisions
                      = two authorities for one meaning; the answers WILL
                      diverge (different review rounds, different reopen
                      triggers), and the divergence surfaces exactly at the
                      most privileged mutation on the platform
smallest correction   B owns ALL "who may" questions, including credential
                      create/replace/revoke/rotate eligibility. C owns custody
                      MECHANICS only: where plaintext exists, decryption
                      boundary, master-key custody, key-version vs grant-version,
                      write-only ingress, no-echo, sanitization, guest-capability
                      shape. C consumes B's eligibility output; it never
                      restates it.
reopen prior authority?  NO
later owner           B (eligibility), C (custody)
```

### F-3 — Dependency-order error: D does not depend on C; corrected shape

```text
claim challenged      §7 places C strictly before the D/E fork ("custody before
                      selecting machine-trust exchange"; D below C)
concrete failure class false serialization. D's enforcement point is per-call
                      admission against owner facts (ActorRun/AgentRun cap,
                      reservation, cancellation-stops-spend). None of that
                      needs the custody contract decided first — the model
                      credential's storage location is irrelevant to WHERE the
                      cap check fires. Serializing D behind C delays the one
                      residue 3H-R1 explicitly ordered 3I to close (C-008
                      spend-cap continuity) for no decision-quality gain.
                      E, by contrast, genuinely consumes C: issuance/verification
                      key custody must not become a second custody law inside E.
smallest correction   A → B → { C ∥ D } → E → F, with G advanceable in
                      parallel any time after A/B (G is realization; it must
                      consume, never drive, principal/authorization semantics —
                      the intake already says this).
reopen prior authority?  NO
later owner           §7 order hypothesis replaced by this shape
```

### F-4 — Family C contains dead machinery: the C-008 per-run guest LLM key fails the deletion test

```text
claim challenged      §6 Family C carries forward "E2B guest capability rule"
                      with the C-008 ephemeral/scoped/bounded/revocable key as
                      live machinery to re-secure
concrete failure class preserving a guest-readable model credential mechanism
                      that no longer has a consumer. C-008 designed the per-run
                      guest LLM key for a model loop that ran INSIDE the guest.
                      3A-R5 §8.2 moved the model loop control-side ("Com model
                      loop control-side, a credencial durável do provider/modelo
                      não precisa entrar no guest E2B") and 3H-01 realized the
                      AgentController control-side. The realization permits it;
                      therefore the guest LLM key is dead machinery, and every
                      security question hanging off it (sentinel scan for that
                      key, its TTL, its revocation reconciliation) deletes with
                      it rather than being ceremonially re-secured.
                      Answer to challenge 8: NOT zero capabilities — C-013's
                      sandbox telemetry-ingest ephemeral capability remains a
                      named current consumer, and any SHARE/preview mechanics
                      3L proves to need one re-enter by name. The C-008 TEST
                      (ephemeral + scoped + bounded + revocable, server-side)
                      survives as the law for every SURVIVING capability; the
                      LLM-key INSTANCE deletes.
                      Primary-source confirmation that server-side expiry is the
                      only real enforcement point: E2B pause snapshots
                      filesystem AND memory; "Paused sandboxes are kept
                      indefinitely; there is no automatic deletion or
                      time-to-live limit"; resume restores processes and loaded
                      variables intact; the continuous-runtime limit RESETS
                      after resume (docs.e2b.dev/sandbox/persistence, accessed
                      2026-08-17). Any secret in guest memory at pause time
                      survives resume weeks later. Client-side TTL is
                      unenforceable by construction.
smallest correction   C's guest-capability section becomes: (1) enumerate
                      surviving guest capabilities by named consumer (currently:
                      telemetry ingest); (2) apply the C-008 test with
                      server-side expiry/revocation as the enforcement point;
                      (3) delete the per-run LLM key instance unless
                      CX-BUILDER-MASTRA-01 proves a guest-side model call is
                      unavoidable, which would be a 3L Finding, not a default.
reopen prior authority?  NO — 3A-R5/3H-R1 already moved the placement; this
                      completes their deletion test
later owner           C (law), 3L (whether any realization forces a guest-side
                      exception)
```

### F-5 — Family F is missing the one trust zone nobody froze: Hub control-side egress

```text
claim challenged      §6 Family F zone list covers browsers, Hub/runtimes as
                      zones, Gateway, E2B, external systems — but its egress
                      QUESTIONS only re-ask what C-008/C-016 already froze
                      (guest deny-all + allowlist; app-server Gateway-only by
                      construction; browser CSP self-only)
concrete failure class the Hub process itself is now a first-class egress
                      initiator and NO approved authority governs it. C-016's
                      server egress law is scoped to generated app artifacts
                      ("artefato sem primitiva de rede"); C-008 governs the
                      guest. After 3A-R5/3H, the control-side Hub directly
                      calls: model providers (Builder AND PAR loops), the E2B
                      control API, an external broker if 3H-03's shared-broker
                      option is exercised, and an OTel exporter backend if 3J/3L
                      ever adopt one. A compromised or prompt-injected
                      control-side loop exfiltrating via unrestricted Hub
                      egress is precisely the C-009 lesson ("egresso governado")
                      applied to the new topology. This is not a Material
                      Finding against C-016 — nothing contradicts it — but it
                      is mandatory NEW 3I scope, not restatement.
smallest correction   F adds the Hub control-side zone with a closed egress
                      destination-class list (model providers, E2B API,
                      qualified broker, exporter-if-adopted, Gateway-mediated
                      Connections) and the law that Hub egress destinations are
                      configuration-derived, never model/caller-selected.
                      Second correction, same family: for DEDICATED, general
                      egress of a customer-deployed app is OUTSIDE Conexus
                      authority — F must state this as an explicit non-guarantee
                      (trust-boundary honesty), with the enforceable seam being
                      only the inbound Platform-Service side. Writing an
                      unenforceable "DEDICATED egress policy" law would be a
                      control that cannot be shown to fire.
reopen prior authority?  NO
later owner           F (law), 3J (physical firewall/topology), 3L (proof the
                      control fires)
```

### F-6 — Challenge 9 answered: one family, one zone matrix, two crossing classes — and the baggage law must be mechanical, not policy

```text
claim challenged      §6/§12-Q9 — whether network/egress and telemetry
                      propagation are one or two decisions
concrete failure class splitting them produces two decisions that must share
                      one trust-zone taxonomy — a duplicate-authority seam for
                      the zone definitions themselves. Egress (connect-out) and
                      telemetry propagation (data-out) are two CROSSING CLASSES
                      of the same matrix; both fail closed against the same
                      zone set. Keep F merged, internally structured by
                      crossing class.
                      Primary sources force one sharpening: the frozen "baggage
                      default OFF" is not self-executing. The OTel spec default
                      for propagators is "tracecontext,baggage", and the JS
                      NodeSDK/auto-instrumentation injects the `baggage` header
                      on MOST outbound instrumented requests by default; the
                      official docs warn baggage has "no built-in integrity
                      checks" and is visible to anyone inspecting traffic.
                      There is NO SDK-level baggage redaction: the only controls
                      are propagator configuration or removing entries from
                      context; the Collector redaction processor operates on
                      span/log/metric ATTRIBUTES only and never touches the
                      inter-service baggage header (opentelemetry.io baggage
                      docs + spec env-var defaults + collector-contrib
                      redactionprocessor README, accessed 2026-08-17).
smallest correction   F's telemetry-crossing law must mandate the MECHANISM
                      class: governed runtimes configure propagators WITHOUT
                      baggage (or with an empty-on-egress strip proven by test),
                      rather than relying on "we do not put owner IDs in
                      baggage" as convention. The proof obligation is a
                      negative wire test at the egress boundary, owned by 3L.
reopen prior authority?  NO — realizes 3H-03's frozen default, does not change it
later owner           F (law), 3L (exporter/propagator qualification)
```

### F-7 — Family D confirmed separate, with the provider question answered from sources: provider caps are defense-in-depth only

```text
claim challenged      §6 Family D questions + §12-Q7 ("Is provider-side spend
                      cap sufficiently authoritative for any path?") + the
                      implicit option of merging D into C
concrete failure class merging D into C would couple a custody contract to
                      budget mechanics under different primary owners
                      (Connections/CredentialBackend vs Builder/PAR admission)
                      with different failure classes (secret theft vs cost
                      blast-radius without external effect) — reopen triggers
                      become ambiguous. D stays separate. Its scope must stay
                      narrow: 3I closes WHO owns the cap (ActorRun/AgentRun
                      owner facts), WHERE it fires (control-side per-model-call
                      admission, before dispatch), that cancellation/revocation
                      stops future spend, and that usage-telemetry loss NEVER
                      grants spend (fail closed, C-013 usage_state discipline).
                      Provider research (2026-08-17): for raw Messages/Responses
                      traffic there is NO per-run provider cap on either
                      provider — Anthropic's smallest scope is workspace +
                      calendar month, Console-only, no programmatic write
                      (the Rate Limits Admin API is read-only); OpenAI's is
                      project + month, dashboard-only, with official wording
                      "Enforcement is not instantaneous". The single per-run
                      mechanism that exists (Anthropic Managed Agents session
                      budget, beta, hard USD cap enforced between requests)
                      belongs to a provider-managed agent runtime that would
                      displace the frozen Mastra/owner-authority architecture —
                      inadmissible as primary enforcement. Conclusion: provider
                      caps = coarse backstop only; the per-run invariant is
                      enforceable ONLY control-side. `max_tokens` bounds tokens
                      per call, not cost per run.
smallest correction   keep D; pin its YAGNI edge: reservation/consumption
                      persistence must reuse the C-013 admission-ledger family;
                      any NEW durable record class exits 3I and returns through
                      Decision Loop (3E-02's closed inventory already forces
                      this). Exact Mastra/AI-SDK pre-call hook points → 3L.
reopen prior authority?  NO
later owner           D (law), 3L (hook/provider behavior proof),
                      implementation (persistence spelling)
```

### F-8 — Smaller corrections: one missing B question, one dead E question, and G's cost drops on current PG facts

```text
B — missing question  separation of duties for ALLOW_ONCE: may the requesting
                      principal approve their own effect? No approved authority
                      answers it (3F-03 fixes single-claim mechanics and routes
                      eligibility here; C-010 fixes claim atomicity). B must
                      answer it explicitly — even if F1's answer is "one human,
                      allowed, logged", it must be a decision, not an accident.
E — dead question     delete "whether runtime instance identity matters at
                      all": 3F-06 §3.2 already freezes instance IDs as
                      correlation-only. Restatement.
E — decision criteria current standards for the mechanism-family choice
                      (recorded as inputs, NOT chosen here): RFC 9700 §2.5 and
                      the OAuth 2.1 draft RECOMMEND asymmetric client
                      authentication (private_key_jwt / mTLS RFC 8705) over
                      shared secrets; FAPI 2.0 Final permits ONLY those two for
                      high-security profiles; DPoP (RFC 9449) is the app-layer
                      sender-constraining alternative where mTLS is impractical;
                      rfc7523bis tightens JWT client-auth audience to the AS
                      issuer identifier; key rotation via published key sets
                      avoids out-of-band secret redistribution; revocation
                      latency is bounded by short-lived tokens vs introspection
                      (RFC 7662). For a vendor issuing credentials to
                      CUSTOMER-DEPLOYED servers, asymmetric proof means Conexus
                      stores only public keys — which also shrinks Family C's
                      custody surface for this exchange. (All accessed
                      2026-08-17.)
G — cost drops        current PostgreSQL facts lower G's realization cost, they
                      do not change its scope: PG15+ already revokes CREATE on
                      schema public from PUBLIC (owner = pg_database_owner);
                      predefined roles (pg_read_all_data, pg_monitor,
                      pg_maintain, pg_checkpoint) cover diagnostics/maintenance
                      without custom machinery; PG16 CREATEROLE now requires
                      ADMIN OPTION for membership changes. Two sharpenings:
                      (1) the read-only diagnostics role condition hardens from
                      "if a real operational consumer exists" to Decision Loop
                      on a NAMED consumer — do not pre-decide it in 3I;
                      (2) pg_dump has no dedicated built-in backup role and
                      needs read access to everything it dumps — whether
                      pg_read_all_data suffices for the hub_control dump is an
                      implementation-verification fact, not a 3I decision.
                      (postgresql.org release-15/predefined-roles/pg_dump docs,
                      accessed 2026-08-17.)
```

## F.3 Answers to the twelve challenges

1. `DedicatedApplicationPrincipal` stays a narrow derived principal. No broader machine-identity architecture; no 3C-02 reopen — 3C-02's own triggers already name "machine/service identities tornam-se materialmente diferentes" as the Decision Loop re-entry.
2. No. Same-process baseline + 3H-03's owner-created dispatch closures already bind in-process identity. Service principals only after a real process/trust split (3J trigger).
3. Both, composed: I&A resolves the platform permission; the subject's owner supplies effect-family/scope eligibility facts. It is an instance of B's recomposition law at the APPROVE transition — not a separate decision. Plus the separation-of-duties gap (F-8).
4. Test owner-local primitives first (intake INFERRED 7 is correct). Connection revoke + trigger DISABLE + Gateway close-before-dispatch + promotion/serving blocks cover most named classes; only an uncovered residue ("halt new admissions globally") would justify any stop object, decided in B.
5. Not proven. Asymmetric verification stores public keys server-side; lifecycle (rotation overlap windows, revocation flags) may fit existing handle/config patterns. A durable credential/grant record enters only through Decision Loop with lifecycle evidence — E must run this deletion test, not assume the record.
6. Yes — control-side per-call admission against owner facts, persistence via the C-013 admission-ledger family, concurrency/restart via existing reservation semantics. No proxy/quota subsystem. Hook-point existence → 3L (F-7).
7. Answered from primary sources: defense-in-depth only, for every raw-API path (F-7).
8. Not zero — telemetry ingest survives with a named consumer; the per-run guest LLM key deletes (F-4).
9. One family, two crossing classes of one zone matrix (F-6).
10. One `hub_control` runtime login role is acceptable F1 **provided** it structurally lacks DDL/ownership/CREATEROLE — ownership enforcement is already code/migrations by 3E-01, and a single role preserves sanctioned same-transaction cross-owner operations. Blast radius is bounded by what the role cannot do, not by role multiplication. More roles only via concrete failure class (G).
11. Speculative. No named F1 consumer; 3F-06 already leaves delegation to independent establishment. E realizes SERVICE_SCOPED only; USER_DELEGATED stays a disabled/deferred law.
12. Yes, several sub-questions are 3L in disguise and the routing matrix mostly catches them; the corrections are: E2B pause/TTL mechanics → 3L under C's law (F-4); provider budget behavior → 3L/implementation under D's law (F-7); exporter/propagator behavior → 3L under F's law (F-6); E's instance-identity question deletes (F-8).

## F.4 Corrected decomposition and order

Seven families, content moved per F-1/F-2/F-4/F-5/F-8:

```text
A — F1 Trust Subject & Authentication Boundary Closure   (rescoped, thin)
        ↓
B — Current Authorization, Approver Eligibility & Revocation
    (owns ALL "who may" questions, incl. credential mutation eligibility;
     emergency stop enters only by uncovered incident class)
        ↓
C — Credential & Capability Custody          ∥          D — Per-Run Model
    (mechanics only; guest LLM key deleted;                Spend Enforcement
     backup-custody separation added)                      (narrow; ledger reuse)
        ↓
E — DEDICATED Trusted Exchange (consumes A/B/C; SERVICE_SCOPED only)
        ↓
F — Trust Zones & Crossings (one matrix; + Hub control-side egress zone;
    + DEDICATED non-guarantee; connect-out and data-out crossing classes)

G — hub_control Least-Privilege Realization
    (parallel any time after A/B; never drives semantics)
```

One addition to C beyond the intake's list: **backup custody ≠ key custody** — a `hub_control` dump (which contains encrypted credential rows) plus backup storage access must not yield plaintext; the master key never travels with the backup. This is a custody law (C); the backup procedure itself stays 3J.

## F.5 Smallest dependency-root candidate

Propose as the first candidate decision (naming `3I-01` stays with the operator):

> **F1 Trust Subject & Authentication Boundary Closure** — one thin decision that: (1) closes the positive principal set at exactly `Account` (human) and `DedicatedApplicationPrincipal` (non-human, derived from Project/Release authority); (2) closes the negative list — `ActorRunId`/`AgentRunId`/`CodingSessionId`/`ConversationId`, Mastra/E2B/trace/provider refs, runtime roles (Builder/PAR/Gateway), `ReleaseRef`, own-auth app-user refs are never principals and never authenticate anything; (3) restates by reference (not re-decides) the authn/authz seam — I&A ALLOW only permits continued evaluation; (4) freezes "no internal service identities while same-process is baseline", with the 3J process-split trigger as the only re-entry; (5) maps each external boundary to its accepted proof by reference — MANAGED browser = C-015 opaque session; DEDICATED = the Family-E mechanism (placeholder, not chosen); internal in-process = 3H-03 owner dispatch closure, no authentication; (6) rules that any new principal class enters only through Decision Loop.
>
> Explicitly excluded: session mechanics, eligibility, custody, mechanism selection, spend, zones, DB roles.

Why this is the root: every other family consumes the subject set, and the **closure** is the only content in A that no prior authority states. It is small enough to ratify fast and makes every later "who is acting?" question answerable by citation instead of reconstruction.

## F.6 Additional proof obligations

Append to §11 when decisions materialize:

```text
21. a hub_control dump plus backup-storage access cannot yield plaintext
    credential material (master key custody separate from backup custody)
22. DEDICATED authentication failure behavior is anti-oracle: it does not
    reveal principal existence, key validity, or Release admissibility
    before authentication completes
23. a revoked DEDICATED credential loses effect within the bounded latency
    the mechanism declares (token lifetime or introspection window) — the
    latency is stated, tested, and not assumed zero
24. no outbound request leaving a governed trust zone carries a baggage
    header (or carries only what the exporter/propagator law explicitly
    admits) — proven by negative wire test, not by convention
```

## F.7 Closing verdict

```text
Material Finding against 3B..3H          = NONE (concur, independently verified)
reopen of approved architecture           = NOT JUSTIFIED
family count                              = 7 (names confirmed)
decomposition as drafted                  = CORRECTED, not accepted:
  eligibility ownership B ← C             (F-2)
  order A → B → {C ∥ D} → E → F, G ∥      (F-3)
  guest LLM key                           = DELETE from C (F-4)
  Hub control-side egress zone            = ADD to F (F-5)
  DEDICATED egress non-guarantee          = ADD to F (F-5)
  baggage law mechanical, not policy      (F-6)
  provider spend caps                     = defense-in-depth only (F-7)
  separation-of-duties question           = ADD to B (F-8)
  E instance-identity question            = DELETE (F-8)
technology mechanism frozen by this round = NONE
new durable record admitted               = NONE
first candidate decision                  = F.5 (rescoped Family A)
```

The intake may proceed to materialize the first candidate decision after consolidating these corrections.

---

## 15. Fable Round 2 — scoped corrections (operator-directed)

**Scope:** exactly two points — an adversarial re-test of my own F.5 Family-A candidate, and a correction of Family F's Hub-egress "closed destination list" — plus a retraction of provider-specific claims as load-bearing basis. Findings F-2, F-3, F-4, F-6 and F-8, and the F.1 concurrence (no Material Finding against 3B..3H), are converged and are **not** reopened here.

### R2-1 — Family A fails its own materiality test: the closure is a preamble, not a decision; B is the first material decision

```text
claim challenged      my own F.5: a standalone thin decision "F1 Trust Subject
                      & Authentication Boundary Closure" as dependency root
test applied          the method's materiality floor: a decision earns standing
                      only if it eliminates a failure class some concrete F1
                      boundary can currently reach that no cited owner already
                      denies. Enumerating the candidate classes the closure
                      could claim:

                      1. boundary authenticates a runtime identity
                         (ActorRun/AgentRun/sandbox/trace as caller proof)
                         → already denied: 3H-01..03 (runtime state/refs never
                           authority; correlation only), 3C-08 (caller cannot
                           self-declare identity/authority)
                      2. own-auth app user becomes a Conexus principal
                         → already denied: 3F-06 §4.2 (userId never creates
                           Conexus user authority; fail closed)
                      3. internal service principals minted for same-process
                         modules
                         → already denied: 3H-03 dispatch-closure law + C-017
                           anti-entity rule; 3C-02 triggers name the re-entry
                      4. a NEW principal class enters silently via E or
                         implementation
                         → already denied path-by-path: 3F-06 freezes
                           DelegatedConexusPrincipal as "only if independently
                           established"; C-017 requires consumer/failure class
                           for any new entity; 3C-02 routes machine identities
                           to Decision Loop
                      5. an external boundary exists with no accepted-proof
                         owner
                         → none found: MANAGED browser = C-015; DEDICATED =
                           Family E; internal in-process = 3H-03; platform
                           routes = C-015 session; sandbox telemetry ingress =
                           C-013 ephemeral capability

                      Every class is already owned. What remains in A is
                      vocabulary and an index — citation convenience, not a
                      failure-class elimination. A standalone 3I-01 whose
                      entire normative content is citations is exactly the
                      restatement-decision defect F-1 attacked in the intake.
                      The F.5 candidate does not survive its own test.
concrete failure class of keeping A standalone: a ratified decision with no
                      falsifiable content of its own becomes a second citation
                      authority for meanings owned elsewhere — drift surface,
                      zero decision-quality gain (method: ceremony may shrink;
                      C-017: no entity/mechanism without failure class)
smallest correction   demote A to the NORMATIVE PREAMBLE (§0) of Family B's
                      decision. The preamble is ratified WITH B — it acquires
                      authority without standalone ceremony — and contains:
                      the closed inbound set, the negative list, the
                      inbound/outbound axis distinction below, and the
                      per-boundary accepted-proof map by reference.
                      First material decision of 3I = B — Current
                      Authorization, Approver Eligibility & Revocation.
                      Falsifiability is preserved by a reopen guard: if any
                      later 3I family or implementation finds a boundary that
                      must authenticate a subject outside the closed set, that
                      is a Material Finding against the preamble and returns
                      to Decision Loop — the closure stays testable without
                      being a decision.
reopen prior authority?  NO — supersedes my own F.5 only
later owner           B carries the preamble; corrected order:
                      B(+preamble) → { C ∥ D } → E → F, G parallel after B
```

The distinction the preamble must state rigorously — this is the genuinely new vocabulary, and it is vocabulary, not law:

```text
INBOUND — Conexus authorization principals (CLOSED SET)
  subjects Conexus AUTHENTICATES at its own boundaries and to which it
  RESOLVES authorization/access context:
    Account                        (human)
    DedicatedApplicationPrincipal  (non-human, derived from Project/Release)
  nothing else authenticates inbound; nothing else reaches authorization.

OUTBOUND — technical credentials/identities (OPEN BY CONSUMER, NEVER PRINCIPALS)
  identities the Hub PRESENTS as a client to external systems:
    GitInfra → GitHub (repo credentials; hub sole holder, C-014)
    CodingRuntime adapter → E2B control API
    Builder/PAR control-side loops → model provider APIs
    Hub → PostgreSQL login roles (C-006 / Family G)
    backup path → offsite storage (C-006 B2/rclone)
    dependency admission → package registry (C-016)
  these are capabilities held in custody, not trust subjects: they never
  appear in authorization decisions, never map to Account/permissions, and
  their power is bounded by C (custody), F (crossing law), G (DB privilege).
  the seam failure class — outbound identity drifting into pseudo-principal
  (e.g., Git author identity or provider key identity treated as Conexus
  actor authority) — is already denied per-path by C-013 provenance and
  C-014 mechanical-history discipline; the preamble names the seam so the
  denial is citeable in one place.
```

### R2-2 — Family F: closed destination list REJECTED; smallest owner-preserving egress law

```text
claim challenged      my own F-5 "smallest correction": a closed egress
                      destination-class list for the Hub control-side zone
                      (model providers, E2B API, qualified broker,
                      exporter-if-adopted, Gateway-mediated Connections)
concrete failure class proof of incompleteness by demonstration — one round,
                      at least three legitimate egress classes missing:
                        GitInfra → git remotes        (C-014: repo per app,
                                                       hub sole credential holder)
                        backup → offsite storage       (C-006: encrypted B2
                                                       copy via rclone)
                        supply chain → package registry(C-016: dependency
                                                       admission, Renovate,
                                                       OSV scan; plus
                                                       quarantined E2B installs)
                      a list that is wrong on arrival can only survive as a
                      central registry every new consumer must amend — F would
                      become the universal network authority, the same shape
                      3C-08 explicitly rejected for the Gateway ("not a
                      universal privileged-operation bus") and the LEDGER's
                      anti-overengineering guardrail rejects as generic policy
                      machinery. Centralizing all egress in one owner also
                      breaks owner-preservation: each destination set is
                      currently derived from authority that ALREADY has an
                      owner (Connection hosts are Connection authority;
                      git remotes are GitInfra/C-014 authority; registry pins
                      are C-016 catalog authority).
smallest correction   F owns a LAW and the zone/crossing matrix — never a
                      destination registry. The law, smallest form:

                      1. every Hub control-side outbound connection class has
                         a NAMED OWNER (the module/infra boundary that
                         legitimately initiates it);
                      2. that owner's destination set is DERIVED from its own
                         pinned configuration/authority (Connection host
                         authority, GitInfra remote config, E2B endpoint
                         config, provider endpoint config, backup target
                         config, registry/catalog pins);
                      3. no destination is ever selected by model output,
                         caller payload, or artifact content;
                      4. egress with no named owner and no config-derived
                         destination = deny, fail closed;
                      5. enforcement lives at each owner's boundary; no
                         central egress broker/proxy is created, and the
                         Gateway remains exactly the external-integration
                         last-mile it already is (3C-08 preserved intact);
                      6. a new legitimate egress consumer arrives WITH its
                         owner and its config-derived destination authority —
                         the law covers it without reopening F.

                      The current owner inventory (Gateway→Connection hosts;
                      GitInfra→git remotes; E2B adapter→E2B API; Builder/PAR
                      loops→provider endpoints; backup→offsite target;
                      dependency admission→registry; exporter-if-adopted→
                      collector) enters F as NON-NORMATIVE EVIDENCE, explicitly
                      non-exhaustive — it illustrates the law, it does not
                      enumerate authority.

                      Consequence for model-driven destinations: a capability
                      whose purpose is model-chosen egress (e.g., Product
                      Agent browsing, already consumer-gated SELECTIVE by
                      3H-02 and routed 3I/Decision Loop by the LEDGER) can
                      only enter as an OWNED capability whose owner declares
                      its destination authority and trust zone — rule 3 is not
                      violated by such a capability existing; it is violated
                      by ownerless model-selected egress.
reopen prior authority?  NO — F-5's finding (the zone exists and is mandatory
                      3I scope) stands; only its "smallest correction" shape
                      is replaced
later owner           F (law + matrix), owners (destination sets),
                      3J (physical placement), 3L (proof the deny fires)
```

### R2-3 — Retraction: provider-specific claims are demoted to non-normative research notes

The F-7 **law** stands unchanged: per-run model-spend enforcement is Conexus control-side, at per-call admission against owner facts; any provider-side limit is optional defense-in-depth and never primary; telemetry loss never grants spend.

Retracted as load-bearing: the provider-specific enumeration used to support that law — spend-limit scopes/windows, console-vs-API availability, enforcement-latency wording, and the Managed Agents session-budget mechanism. Those are dated observations (2026-08-17) of beta-flagged, changeable vendor surfaces; the law does not need them (it follows from owner-authority discipline alone: no external party can be the authority for a Conexus run invariant), and they are not durable enough to found authority. They remain in the Round 1 text as research provenance only. No 3I decision text may cite a provider scope, window, latency or budget feature as basis; **3L owns provider-behavior facts at qualification time, against then-current pinned docs.**

### R2 closing

```text
A standalone decision       = WITHDRAWN; closure becomes normative preamble of B
first material 3I decision  = B — Current Authorization, Approver Eligibility
                              & Revocation (carrying the preamble)
inbound/outbound taxonomy   = preamble vocabulary: closed principal set inbound;
                              outbound technical credentials never principals
F closed destination list   = REJECTED (incomplete by demonstration; universal-
                              authority shape); owner-bound, config-derived,
                              never-model/caller-selected, deny-by-default law
                              adopted; Gateway scope per 3C-08 untouched
provider-specific claims    = non-normative, dated; F-7 law unchanged; 3L owns
                              provider facts
converged findings          = F-2, F-3 (order now rooted at B), F-4, F-6, F-8
                              stand unmodified
technology mechanism frozen = NONE
new durable record admitted = NONE
```


