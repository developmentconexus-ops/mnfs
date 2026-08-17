# 3I Fable Dialogue — Trust Zones, Crossings & `hub_control` Least Privilege

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Candidate:** final bounded material package of 3I under 3A-R6; **no new 3I authority ID is created by this file**  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** independent challenge before any operator ratification. This file does **not** update `LEDGER.md`, does not close 3I, does not alter approved authority, and does not authorize product implementation, merge or PR readiness.

---

## 1. Canonical starting point

Required authority path:

```text
DevelopmentConexus Engineering Method v1.0.0
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ exact accepted authority
→ current primary-source evidence only where realization behavior is load-bearing
```

Current canonical state:

```text
3A-R6   = APPROVED — Phase 3 Critical Path & Implementation Readiness
3B..3H  = CLOSED / APPROVED
3I      = IN PROGRESS
3I-01   = APPROVED — Current Authorization / Revocation
3I-02   = APPROVED — Credential & Capability Custody
3I-03   = APPROVED — Per-run Model Spend Enforcement
3I-04   = APPROVED — DEDICATED Trusted Exchange
```

3A-R6 classifies the only remaining 3I families as `MUST DECIDE` at property level:

```text
Trust Zones & Crossings / Hub control-side egress / telemetry crossing
hub_control Least-Privilege Realization
```

After these, 3A-R6 calls for one bounded 3I closure review rather than manufacturing more security topics from generic catalogs.

---

## 2. Why these two families are treated as one package candidate

The shared root cause is:

> **A semantic owner/trust boundary is not an enforceable security boundary if code can bypass it through a different physical channel — direct network egress, browser exfiltration, guest connectivity, telemetry propagation, or an over-privileged database session.**

Two enforcement planes address the same failure class:

```text
A. network / runtime / browser / telemetry crossing plane
B. PostgreSQL persistence-capability plane
```

This package does **not** claim that network policy and database roles are the same mechanism or owner. It asks whether one security authority can freeze their shared boundary law while leaving exact firewall/CSP/role/GRANT/pool spelling to 3J/3L/Realization Planning.

Fable must split the authority only if the two planes have materially incompatible ownership, proof, lifecycle or reopen semantics. Do not split merely because the mechanisms differ.

---

## 3. Authority already frozen — do not redesign it

### 3.1 3D/3E — module boundaries and data ownership already exist

`hub_control` is one PostgreSQL authority database with thirteen owner schemas:

```text
iam ws prj bld reg con gw brn par rel mar obs att
```

There is no `shared/common` schema.

3D already freezes:

```text
modular-monolith DAG
no cross-module table/internal access
public APIs/projections only
runtime never calls L7
OBS as leaf/sink
```

3E already freezes:

```text
one schema per owner
one Hub migration lineage
46 durable record classes
closed Tier-2 FK allowlist
TxScope opaque and query-incapable
no FK to/from OBS or Mastra stores
mastra_builder != mastra_par
```

Cross-owner domain atomicity is a **closed F1 set**:

```text
1. CreateProject
   prj-owned create
   + iam-owned initial grant

2. material effect admission
   gw-owned admission
   + par-owned approval single claim
```

New cross-owner domain atomicity requires Decision Loop.

Audit-required mutations may additionally require the `obs.audit_record` insert in the same transaction without moving current domain authority to OBS.

### 3.2 3D — exact authorization entry boundaries already exist

Only three direct I&A resolution boundaries exist in the import graph:

```text
L7 / Control Plane
Managed Application Runtime
Capability Gateway
```

Interior modules do not independently re-resolve I&A.

Physical defense in depth — database roles, egress, CSP, sandboxing — was explicitly left to 3I.

### 3.3 C-016 — important egress baseline already exists

C-016 froze two application-facing egress properties:

```text
MANAGED/server application capability egress
→ governed external/business execution goes through Capability Gateway + registered Connection
→ generated app has no arbitrary server network primitive

browser
→ self-only network origins by CSP baseline
→ direct arbitrary exfiltration origin is not part of F1
```

This package must **reconcile**, not erase, the fact that the Hub itself now has legitimate **platform-control operational egress** that is not a business `Connection`:

```text
CodingRuntime → E2B control plane
GitInfra → Git provider
model adapter → model provider
backup operation → backup storage
package/build mechanics → admitted registries where applicable
```

The candidate distinction is:

```text
application/business egress
→ Gateway / Connection authority

platform-control operational egress
→ named owner-specific infrastructure adapter/capability

arbitrary generated-app / guest / browser egress
→ forbidden unless separately admitted
```

Do **not** turn Gateway into a universal egress proxy merely to make the vocabulary uniform.

### 3.4 C-008 / 3I-02 — E2B is an untrusted guest boundary

Sandbox guest is assumed capable of root inside its VM.

Frozen laws include:

```text
durable secrets never guest-readable
Git write credential never enters guest
real ERP/Connection credentials never enter guest
BuildValidationDatabase is synthetic, not real DEV authority
RunPreview is private/authenticated through Hub boundary
network egress policy is outside guest
```

3I-02 later **deleted the guest LLM-provider key** after the Builder model loop moved control-side.

The only current guest-readable capability class is narrow telemetry ingest, Hub-minted, exact-scope, server-expiring and server-revocable.

### 3.5 3H-03 — telemetry is already non-authoritative

Frozen producer trust classes are equivalent to:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

Transport or successful ingestion cannot upgrade producer trust.

Frozen laws also include:

```text
owner IDs do NOT use OTel baggage by default
trace/runtime IDs are correlation only
app-under-test telemetry = GUEST_OBSERVED
E2B/provider telemetry = PROVIDER_OBSERVED
required runtime evidence missing = NOT_PROVEN / INCONCLUSIVE
F5 control handoff != Operational Telemetry
```

### 3.6 3I-04 — DEDICATED is authenticated external application code

DEDICATED is not a trusted Hub process.

It receives only its bounded server-to-platform exchange authority:

```text
DedicatedApplicationPrincipal
+ exact ReleaseRef
+ short-lived access token
```

No Hub DB credentials, Connection secrets, Git authority or broad Platform secret enters the DEDICATED application.

3A-R6 explicitly defers **physical DEDICATED deployment/ingress topology** until the first real DEDICATED deployment. This package decides trust semantics only.

---

## 4. Current primary-source behavior used as proportional evidence

These are implementation/mechanism facts, not product authority.

### PostgreSQL 17 role membership

Official PostgreSQL 17 documentation states that a membership granted with the `SET` option allows the login session to `SET ROLE` into that role; `NOINHERIT` prevents automatic inheritance but does **not** prevent role switching when `SET` remains allowed.

Security consequence for this design:

```text
one umbrella login
+ membership in every owner role
+ INHERIT false but SET true
→ session can still become every owner role
```

So that pattern does not satisfy an invariant that arbitrary SQL reachable through one normal module persistence capability cannot reach another owner's schema.

### OpenTelemetry propagation

Current OpenTelemetry guidance states that context propagation crosses service boundaries and warns that internal trace IDs, span IDs or baggage may disclose internal/business information to external services. Baggage can contain arbitrary values, has no built-in integrity proving origin, and can be automatically propagated downstream.

This reinforces — rather than creates — 3H-03's law:

```text
Conexus owner IDs / secrets / authority
-X-> OTel baggage by default
```

The Baggage API explicitly provides clearing capability before an untrusted process boundary.

### E2B network control

Current E2B API documentation continues to expose sandbox network control where `allow_internet_access=false` is equivalent to deny-out `0.0.0.0/0`.

This is current evidence that the C-008 outside-guest deny baseline remains technically plausible; exact current E2B network policy syntax remains 3L.

### Browser request authenticity / CSP

OWASP's current CSRF guidance treats state-changing cookie-authenticated browser requests as requiring request-authenticity/CSRF protection rather than relying solely on an ambient session cookie; framework-native defenses, Fetch Metadata/origin validation and token patterns are credible mechanisms.

OWASP CSP guidance identifies `connect-src` as the control for fetch/XHR/EventSource/beacon/WebSocket destinations and supports restrictive self-only baselines.

The architecture candidate freezes only the properties; exact header/directive/token implementation remains Realization Planning / 3L where framework behavior is load-bearing.

---

## 5. Known / Inferred / Unknown / Deferred

### KNOWN

1. Browser, E2B guest and DEDICATED application code are not trusted Hub authority.
2. MANAGED app/browser must use server-derived serving/access context; caller-supplied Project/Release/role is not authority.
3. Governed application/business external I/O is Gateway-owned.
4. Hub platform mechanics legitimately need non-Gateway operational egress through named infrastructure owners.
5. E2B guest must not receive durable secrets or direct real enterprise credentials.
6. Guest/model/app/provider/telemetry observations never become current domain authority merely because transport is authenticated.
7. `hub_control` has thirteen semantic owner schemas and cross-module direct internals are forbidden.
8. There are exactly two current cross-owner domain-atomicity cases plus the transversal audit-required insert class.
9. Builder and PAR Mastra databases are distinct from each other and from `hub_control`.
10. Full compromise of the trusted Hub process is an accepted F1 residual risk under 3I-02; this package must not claim DB roles defeat arbitrary Hub RCE.
11. C-016 already requires browser self-only egress at property level.
12. 3A-R6 defers exact firewall/proxy/CSP/OTel exporter and PostgreSQL GRANT/pool spelling.

### INFERRED — challenge before ratification

1. The smallest sustainable trust model needs six logical zones, but **not six processes/services**:
   - Browser/Client
   - Trusted Hub Control
   - Guest Execution
   - DEDICATED External Application
   - External Provider/Enterprise
   - Trusted Data/Storage Infrastructure
2. Module boundaries inside the trusted Hub are **not** separate network trust zones.
3. Owner-specific control-plane egress adapters are sufficient; no universal egress proxy/service mesh is needed F1.
4. Browser state-changing requests under ambient server-side session auth need request-authenticity enforcement at the Hub boundary; exact mechanism can remain derived realization.
5. Browser/Preview/MANAGED code should inherit restrictive outbound-origin policy, preserving C-016 self-only egress; exceptions are explicit platform contract changes, not app-chosen origins.
6. Operational telemetry capability must be write-only into the operational-event path and unable to mint `AuditRecord` or elevate producer trust.
7. `hub_control` normal runtime persistence should use owner-scoped login capabilities rather than one ordinary broad `hub_runtime` login.
8. An umbrella login with SET-able membership into all owner roles is too broad even with `NOINHERIT`.
9. Cross-owner atomicity can be preserved without broad ordinary runtime authority by **named narrow cross-owner transaction capabilities** only for the two approved domain cases.
10. Audit-required same-transaction persistence can be supported by narrowly allowing the appropriate owner transaction capability to produce the required `obs.audit_record`, without general OBS read/update authority.
11. Separate DB credentials/pools do not force process split; same Hub process may hold multiple owner-specific DB capabilities while full-process compromise remains accepted residual.

### UNKNOWN — realization, not architectural truth

1. Exact PostgreSQL role names and whether implementation uses one Pool per owner, lazy pools or another equivalent connection-capability shape.
2. Exact grant surface needed by every owner schema/table/sequence/function.
3. Exact two cross-owner transaction credential/profile definitions.
4. Exact audit-record insertion implementation under shared `TxScope`.
5. Exact Node/TS pool/transaction abstraction that preserves opaque `TxScope`.
6. Exact CSP directives beyond the already-frozen self-only egress property.
7. Exact CSRF/request-authenticity realization for the chosen frontend/server stack.
8. Exact E2B network-policy API/version syntax.
9. Exact OTel propagator/exporter/collector setup and which third-party calls carry trace context.
10. Exact DNS/TLS/reverse-proxy/host topology.

### DEFERRED

```text
physical process/container placement                → 3J
whole-Hub ingress/TLS/DNS topology                  → 3J
physical DEDICATED ingress/network path             → 3J on first real DEDICATED deploy
exact firewall rules                                → 3J/Realization
exact CSP/header syntax                             → Realization/3L if framework-sensitive
exact CSRF mechanism                                → Realization/3L if framework-sensitive
exact OTel Collector/backend/exporter               → 3J/3L
advanced telemetry backend                          → 3J/3L
separate Hub processes solely for credential isolation → only if CX-RUNTIME-ISOLATION-01 or new Finding fires
service mesh                                        → REJECT F1
universal egress proxy                              → REJECT F1
network microsegmentation between in-process modules→ REJECT F1
RLS/policy engine for module ownership              → REJECT F1 unless new row-level failure class
```

---

## 6. Root cause and target invariants

### Root cause

A logical boundary can be correct on paper while remaining bypassable:

```text
browser skips runtime SDK → calls external target directly
sandbox receives a credential → calls ERP directly
app emits forged HUB_AUTHORITY telemetry
OTel baggage leaks internal owner IDs to third party
module A imports no module B code, but same broad DB login SELECTs b.* anyway
normal runtime can SET ROLE to every schema owner
cross-owner transaction convenience becomes universal god credential
```

### T1 — Untrusted code cannot manufacture Hub authority

```text
browser / E2B guest / app-under-test / DEDICATED app / external provider input
→ data / request / observation / bounded authenticated principal where explicitly defined
-X-> Hub authority by self-assertion
```

### T2 — Named crossing only

Every F1 trust-zone crossing with material power has a named boundary/owner and bounded credential/capability class.

No generic "can reach network" or "can reach database" capability substitutes for that owner.

### T3 — Application/business egress stays governed

```text
MANAGED app capability / Production Agent / Builder governed business-data or enterprise execution
→ Capability Gateway
→ exact Connection / Project Data executor
```

Generated app/browser/guest cannot bypass Gateway to ERP/enterprise targets.

### T4 — Platform-control egress is distinct, named and owner-specific

Legitimate Hub operational calls may bypass Gateway **only because they are not application/business capabilities** and already have named owner/infrastructure boundaries, e.g.:

```text
CodingRuntime → E2B
GitInfra → Git provider
ModelAdapter → model provider under 3I-03
Backup operation → backup store
```

This does not create a universal control-plane network client.

### T5 — Secret-bearing crossing is minimal

A credential crosses only to the owner/last-mile component that needs it and never into browser/guest/generated app by convenience.

### T6 — Producer trust survives transport honestly

```text
transport authenticated
-X-> producer trust upgraded
```

Guest/provider telemetry remains Guest/Provider observed.

### T7 — Telemetry context is non-authority and non-secret

No credentials, authorization decisions or mutable authority facts in trace/baggage context.

Conexus owner IDs remain out of OTel baggage by default.

### T8 — Normal owner persistence cannot cross schemas

> **Arbitrary SQL reachable through one normal module persistence capability cannot read or mutate another owner schema.**

Exceptions are only the explicitly enumerated narrow cross-owner transaction/audit capabilities required by already-approved atomicity.

### T9 — Runtime roles are not owners/admins

Normal runtime DB capability:

```text
no ownership
no SUPERUSER
no CREATEROLE
no CREATEDB
no BYPASSRLS
no broad SET ROLE path into another owner
```

### T10 — Migration/backup/recovery authority stays out of ordinary runtime

Deployment/recovery credentials with broader power are operational capabilities, not normal request-path credentials.

### T11 — Store/database isolation is physical

```text
hub_control runtime capability
-X-> mastra_builder / mastra_par / Project DB by default

mastra_builder credential
-X-> hub_control / mastra_par / Project DB

mastra_par credential
-X-> hub_control / mastra_builder / Project DB

Project query/action/migrator credential
-X-> hub_control / Mastra stores / another Project DB
```

Exact connection topology is realization; cross-store denial property is architecture.

---

## 7. Candidate trust-zone model

These are **logical security zones**, not deployment-unit requirements.

### Z1 — Browser / Client Zone — UNTRUSTED CALLER

Includes:

```text
Control Plane browser
PREVIEW browser
PUBLISHED_APP browser
```

Even after an Account session authenticates the user, browser-supplied authority fields remain untrusted.

Inbound:

```text
browser → Hub/MAR/L7 allowed through the exact surface contract
```

Forbidden:

```text
browser → hub_control / Project DB / Mastra stores
browser → Connection credential backend
browser → ERP / enterprise Connection as privileged app path
browser → model-provider credential/API as platform authority
browser → Git write authority
browser → DEDICATED Platform-Service authority bypass
```

State-changing requests authenticated by ambient session cookie require a server-enforced request-authenticity property. Exact CSRF mechanism is Realization Planning.

Browser application outbound network origins preserve the C-016 restrictive/self-only baseline. New external browser origin is explicit contract/security change, not app payload/config freedom.

### Z2 — Trusted Hub Control Zone

Contains the modular-monolith owners and trusted control-side runtimes when co-located.

Important honesty:

```text
module owner boundary
!= separate process/network trust zone
```

The Hub is trusted to possess the operational capabilities it legitimately needs. A fully compromised trusted Hub process can potentially abuse several capabilities in memory; 3I-02 already accepts this F1 residual.

Security goal is therefore **least capability on each normal path**, not a false claim of arbitrary-RCE containment inside one process.

Control-side operational egress is only through named infrastructure/owner adapters.

No generic `fetchAnything(url, credential)` platform capability.

### Z3 — Guest Execution Zone — UNTRUSTED / ROOT-CAPABLE

Current named guest = E2B Builder sandbox/app-under-test.

Guest receives:

```text
workspace/code/materialized build inputs
synthetic BuildValidationDatabase
bounded runtime/control handles actually required
narrow telemetry-ingest capability where enabled
```

Guest never receives:

```text
Hub DB credential
Project authoritative DB credential
Connection/ERP credential
CredentialBackend/root material
Git write credential
model-provider/provisioning credential
backup credential
DEDICATED private key
```

Guest egress is deny-by-default outside guest and explicitly admitted only to destinations required by the bounded runtime/build surface.

No direct ERP/private Hub DB/control endpoint route.

RunPreview remains behind authenticated Hub proxy; no anonymous public preview is implied.

### Z4 — DEDICATED External Application Zone — AUTHENTICATED BUT UNTRUSTED TO HUB INTERNALS

Inbound to Platform Services only via 3I-04 trusted exchange.

It may hold its own DEDICATED private key and short-lived Platform token; it does not inherit Hub internals.

Physical ingress/TLS/network path remains deferred to 3J first-consumer trigger.

### Z5 — External Provider / Enterprise Zone

Includes distinct external parties such as:

```text
model providers
E2B control plane
Git provider
package registries when admitted
ERP / Sankhya / marketplace APIs
backup storage
```

External response/data never becomes Hub authority merely because TLS/auth succeeded.

Credentials are owner-specific and materialized at named last mile.

Business/enterprise Connection I/O is Gateway-only.

Platform operational I/O uses the existing named owner adapter; it does not masquerade as Connection business authority.

### Z6 — Trusted Data / Storage Infrastructure Zone

Includes logically:

```text
hub_control
Project databases
mastra_builder
mastra_par
BlobStore/CAS physical backing
CredentialBackend backing
backup material
```

This is not one credential domain.

Each store is reached only by the capability/credential set justified by its owner and lifecycle.

Browser, guest and external application code have no direct database/storage authority.

---

## 8. Crossing matrix — F1 property level

| From | To | F1 crossing | Authority / capability | Baseline |
|---|---|---|---|---|
| Browser | Hub Control / MAR | yes | Account session + surface-specific server checks | authenticated; mutable authority server-derived |
| Browser | external privileged service | no direct platform path | none | browser self-only egress baseline |
| Hub Builder control | E2B control API | yes | CodingRuntime owner-specific operational credential | exact runtime actions only |
| Hub model loop | model provider | yes | owner-specific model credential + 3I-03 pre-I/O spend gate | no guest key |
| Hub Git mechanics | Git provider | yes | GitInfra owner-specific credential | guest never receives write credential |
| Hub Gateway | enterprise / ERP | yes | exact Connection last-mile credential | Gateway admission required |
| Hub backup ops | backup store | yes | backup owner operational credential | not ordinary request authority |
| E2B guest | Hub control callbacks | narrow | admitted runtime/control channel | no general Hub API authority |
| E2B guest | telemetry ingest | optional narrow | Hub-minted expiring guest capability | Operational Telemetry only |
| E2B guest | ERP / Hub DB / Git write / model provider | no | none | deny-by-default |
| DEDICATED server | Platform Services | yes | 3I-04 DAP + exact Release token | server-to-platform only |
| External provider | Hub | responses/webhooks only where separately admitted | provider data/observation | never authority by transport |
| Hub processes | `hub_control` | yes | owner-scoped DB capabilities + named transaction exceptions | no ordinary god login |
| Mastra stores | Hub | substrate only through role runtime | separate store credential | never control-plane authority |

Exact ports/hosts/URLs/proxies are not frozen here.

---

## 9. Browser request-authenticity property

C-015/3I-01 already establish server-side session/current authorization. This package adds only the trust-boundary property needed so browser possession of ambient session credentials is not enough to forge state mutation cross-origin.

Normative:

```text
state-changing browser request under ambient session auth
→ must prove acceptable request origin/authenticity at server boundary
```

Allowed realization families may include framework-native CSRF protection, Fetch Metadata + origin policy, synchronizer token or equivalent after Realization Planning.

Do not freeze a custom CSRF token protocol now.

Safe-method requests must not be used as hidden mutation paths.

This property applies per CONTROL_PLANE / PREVIEW / PUBLISHED_APP surface; it does not merge their authorization contexts.

---

## 10. Browser egress / CSP property

C-016 already freezes self-only browser egress as a security invariant.

This package preserves it as a trust crossing:

```text
MANAGED / Preview generated frontend
→ same-origin Conexus runtime surface
→ Hub routes governed capability
```

Not:

```text
generated frontend
→ arbitrary ERP / provider / exfiltration origin
```

Exact CSP directives belong to Realization Planning, but the realization must mechanically prevent generated app code from widening outbound network origins by ordinary app configuration/content.

A named product feature requiring browser-direct external origin is a Decision Loop/security contract change, not a silent CSP exception.

---

## 11. Hub control-side egress law

Do not read C-016 as requiring **all Hub infrastructure traffic** to pretend to be a business `Connection`.

Closed classes:

### Application/business egress

```text
query/action/integration/business external operation
→ Capability Gateway
→ exact Connection / Project Data executor
```

### Platform-control operational egress

```text
CodingRuntime → E2B
GitInfra → Git provider
model adapter → model provider
backup mechanism → backup storage
other already-approved infrastructure owner → its exact provider
```

Requirements:

```text
owner-specific credential/capability
bounded destination class configured server-side
no caller-chosen broad secret
no generated app/guest access to that client
safe logging/redaction
fail closed when required credential/target missing
```

No `UniversalEgressService`, sidecar mesh or all-traffic proxy F1.

If future arbitrary server-side generated code becomes a current surface, C-016's recorded trigger reopens server egress architecture before enabling it.

---

## 12. Telemetry crossing law

### 12.1 Transport does not upgrade trust

```text
valid telemetry-ingest capability
+ accepted OTLP payload
-X-> HUB_AUTHORITY
```

Producer-trust class is assigned from the authenticated/admitted producer boundary, not a field in producer payload.

Guest cannot request:

```text
producer_trust = HUB_AUTHORITY
producer_trust = GATEWAY_AUTHORITY
```

### 12.2 Guest capability is Operational Telemetry only

Guest telemetry capability may write/submit only the operational-observation path.

It cannot create the fail-closed `AuditRecord` required for material Hub authority mutations.

Audit-required owner mutation remains Hub owner transaction + OBS audit semantics under 3E-01/3C-13.

### 12.3 Context propagation

Baseline:

```text
Conexus owner IDs
credentials
PII/secrets
mutable authority facts
→ not OTel baggage
```

Before outbound traffic to an external/untrusted service, baggage is absent/cleared unless an explicitly admitted future crossing says otherwise.

Trace context itself is correlation only. Sending `traceparent` to an external provider is allowed only where the owner integration needs distributed correlation and redaction/propagation policy admits it; absence never affects authority.

Exact propagator/header stripping belongs to Realization Planning / 3L.

### 12.4 Telemetry loss

Operational Telemetry may degrade under 3C-13.

If a verification assertion requires a particular runtime evidence class:

```text
missing required evidence
→ NOT_PROVEN / INCONCLUSIVE
```

never inferred PASS.

---

## 13. `hub_control` least-privilege root cause

Current architecture says:

```text
13 semantic owners
+ no cross-module internals
+ one physical PostgreSQL database
```

If ordinary runtime uses:

```text
hub_runtime LOGIN
→ SELECT/INSERT/UPDATE on every schema
```

then a SQL-injection/persistence-layer defect in one module can bypass the module graph entirely.

The data architecture would be review discipline only, not enforced isolation.

The candidate therefore protects **normal persistence capabilities**, while explicitly not claiming containment of arbitrary full-process Hub compromise.

---

## 14. Candidate `hub_control` privilege model

### 14.1 Object ownership

Each owner schema has a non-login object owner role or equivalent ownership identity.

Normal request/runtime login capabilities are not object owners.

### 14.2 Owner-scoped normal runtime capability

Each persisted owner receives a runtime database capability whose effective privileges are limited to the owner's own schema and required database mechanics.

The architecture does **not** freeze thirteen literal Pool objects or role names; it freezes this negative property:

> **A session created for owner A's normal persistence path has no direct/inherited/SET-able path to owner B's privileges.**

Therefore the F1 baseline rejects:

```text
one normal umbrella LOGIN
+ membership in all owner roles
+ NOINHERIT only
+ SET ROLE still allowed
```

because PostgreSQL membership can retain role-switch power even without automatic inheritance.

Equivalent physical realizations are allowed if negative privilege tests prove the same property.

### 14.3 Normal runtime privileges

Normal owner runtime capability must not have:

```text
SUPERUSER
CREATEROLE
CREATEDB
BYPASSRLS
schema/object ownership
broad CREATE outside explicitly required ephemeral mechanics
membership/SET path into unrelated owner roles
```

It receives only the DML/sequence/function privileges needed by its public/private persistence implementation.

Exact table/sequence grants belong to Realization Planning.

### 14.4 Migration authority

`hub_control` migration authority is separate from ordinary runtime capability.

It may perform the DDL required by the single owner-declared Hub migration lineage, but is absent from normal request/runtime code paths and does not become an ordinary application credential.

Exact migration role/topology/injection is 3J/Realization Planning.

### 14.5 Backup/recovery authority

Backup/restore/role-provisioning credentials with broader database power are operational credentials with separate custody and runbooks.

They are never normal runtime credentials merely because the same deployment needs both.

---

## 15. Cross-owner transaction exceptions

Owner-scoped normal sessions must not destroy already-approved cross-owner atomicity.

### 15.1 Domain atomicity — closed two-case allowlist

Existing allowed cases remain exactly:

```text
CreateProject
→ prj + iam

material effect admission
→ gw + par
```

F1 may realize each through a **named narrow cross-owner transaction capability/profile** that has only the database privileges required by that exact use case.

Properties:

```text
not ordinary module pool
not global hub transaction role
not available as generic query capability
TxScope remains opaque / query-incapable
module public APIs still own meaning
new cross-owner privilege profile requires Decision Loop
```

The exact role/session/pool implementation is Realization Planning.

### 15.2 Audit-required same-transaction insert

Audit-required owner mutation must preserve 3E-01's same-transaction fail-closed property.

The underlying transaction capability may have narrowly bounded ability to insert the required `obs.audit_record` through the OBS public persistence path.

It does **not** imply:

```text
other owners SELECT obs.*
other owners UPDATE/DELETE obs.audit_record
other owners write operational_event arbitrarily
OBS becomes domain owner
```

Fable must challenge whether narrow INSERT privilege on `obs.audit_record` is the smallest realization, or whether another same-transaction pattern preserves the property more cleanly without reintroducing a broad transaction role.

---

## 16. Store/database credential isolation

The closed data topology requires independent database credentials/capabilities such that ordinary roles cannot cross store boundaries.

Mechanical negative properties:

```text
mastra_builder runtime credential
-X-> CONNECT/use hub_control
-X-> CONNECT/use mastra_par
-X-> Project DB authority

mastra_par runtime credential
-X-> CONNECT/use hub_control
-X-> CONNECT/use mastra_builder
-X-> Project DB authority

hub_control owner runtime credential
-X-> Mastra stores
-X-> Project DBs unless through separately admitted Gateway data capability

Project query/action/migrator credential
-X-> hub_control
-X-> Mastra stores
-X-> other Project DBs
```

A module may own multiple **separate** capabilities where its approved job requires them — e.g. Gateway's Hub control-state capability and a separately selected Project-data execution capability — but one credential must not silently collapse those authority classes.

---

## 17. Same process does not imply one credential

F1 remains a modular monolith and 3H-03 allows Builder/PAR same-process execution while isolation holds.

This package does not force microservices/process split merely because several DB capabilities coexist in one trusted process.

Honest residual:

```text
full arbitrary-code compromise of trusted Hub process
→ may access multiple in-memory/deployment credentials
```

Accepted under 3I-02 F1 threat model.

What DB least privilege **does** reduce:

```text
SQL injection scoped to one persistence path
accidental cross-schema query
wrong repository/table usage
misconfigured module pool
privilege escalation by broad SQL session
```

Do not sell it as process-RCE containment.

---

## 18. Credible alternatives — trust crossings

### Alternative A — logical zones + named crossings + owner-specific egress

```text
untrusted browser/guest/DEDICATED boundaries
+ trusted Hub
+ external provider boundary
+ data/storage boundary
+ Gateway for application/business egress
+ named infrastructure adapters for platform-control egress
+ telemetry provenance preserved
+ no generic egress proxy
```

**RECOMMEND / candidate GLOBAL MAXIMUM.**

### Alternative B — universal egress proxy / service mesh

**REJECT F1.** Adds deployment, policy and identity machinery without a current distributed-service consumer and risks making shared mechanism a new authority.

### Alternative C — application checks only, no mechanical guest/browser egress property

**REJECT.** Contradicts C-008/C-016 and leaves the exact observed Mitra failure class — direct fetch/exfiltration bypass — reachable.

---

## 19. Credible alternatives — `hub_control`

### Alternative A — owner-scoped normal DB capabilities + narrow named cross-owner transaction exceptions

**RECOMMEND / candidate GLOBAL MAXIMUM.**

Benefits:

```text
physical enforcement mirrors semantic ownership
SQL defect blast radius is owner-scoped on normal path
preserves single database + atomicity
no database-per-module
no policy engine
exact implementation can remain derived
```

Costs:

```text
multiple runtime credentials/capabilities
pool/transaction wiring discipline
negative privilege test matrix
```

### Alternative B — one umbrella login + `NOINHERIT`, `SET ROLE` into every owner

**REJECT baseline.** The login remains capable of switching into all owners; a compromised/incorrect SQL path has a broad escalation primitive.

### Alternative C — one broad `hub_runtime` login + code/import/static checks only

**REJECT.** Does not physically realize the security property explicitly routed to 3I; one SQL defect bypasses the module DAG.

### Alternative D — database-per-module / microservices

**REJECT.** Reopens 3E and adds deployment/atomicity complexity with no current lifecycle need.

### Alternative E — stored-procedure / SECURITY DEFINER authorization substrate

**REJECT F1.** Moves application authority into a new database function policy layer and adds a second contract surface without current consumer need.

---

## 20. Proof strategy — Trust Zones & Crossings

Future realization must be able to falsify at least:

1. browser-supplied Project/Release/role cannot become authority;
2. cross-origin forged state mutation under ambient session auth is rejected by selected request-authenticity control;
3. generated MANAGED/Preview frontend external fetch/beacon/form/WebSocket origin is denied absent explicit platform policy;
4. browser cannot directly reach privileged ERP/Connection/Hub DB path;
5. E2B guest cannot read Hub DB/Connection/Git-write/model-provider/backup credentials;
6. E2B guest cannot directly call ERP/private control endpoints;
7. sandbox egress starts deny-by-default and only admitted destinations work;
8. guest telemetry credential can submit operational telemetry but cannot create trusted AuditRecord or claim HUB/GATEWAY producer trust;
9. telemetry transport authentication does not upgrade producer-trust class;
10. no secret/PII/authority is injected into OTel baggage;
11. baggage is absent/cleared at external/untrusted crossings by default;
12. optional trace-context propagation cannot influence authorization;
13. model call reaches provider only through control-side 3I-03 admitted path;
14. Git write reaches provider only through GitInfra owner path;
15. business Connection I/O reaches external target only through Gateway;
16. DEDICATED can reach Platform Services only through 3I-04 semantics and has no internal DB/secret path;
17. loss of ordinary telemetry does not create authority or false PASS.

---

## 21. Proof strategy — `hub_control` Least Privilege

Future schema/role realization must falsify at least:

1. owner-A normal runtime session `SELECT` owner-B table → denied;
2. owner-A normal runtime session `INSERT/UPDATE/DELETE` owner-B → denied;
3. owner-A session cannot `SET ROLE` into owner-B/owner roles;
4. ordinary Hub runtime role is not SUPERUSER/CREATEROLE/CREATEDB/BYPASSRLS/object owner;
5. module runtime cannot create arbitrary objects in unrelated schema;
6. ordinary runtime cannot invoke migration/backup/recovery authority;
7. `mastra_builder` credential cannot CONNECT/use `hub_control`, `mastra_par` or Project DB;
8. `mastra_par` credential cannot CONNECT/use `hub_control`, `mastra_builder` or Project DB;
9. Project query/action/migrator credential cannot CONNECT/use `hub_control` or another Project DB;
10. CreateProject named transaction can atomically apply prj + iam public operations, but its credential/profile cannot access unrelated schemas;
11. material-effect named transaction can atomically apply gw + par public operations, but cannot access unrelated schemas;
12. new cross-owner domain atomicity cannot silently reuse a broad role;
13. audit-required mutation atomically creates required AuditRecord while unrelated OBS read/update/delete remains denied;
14. `TxScope` never exposes raw query/client capability;
15. role/privilege DDL is mechanically testable in CI and rebuild;
16. same-process module composition still works without one god DB login;
17. a full Hub process compromise is **not** falsely claimed to be contained by DB roles.

---

## 22. Explicit non-construction / YAGNI

Do not build F1 by this package:

```text
service mesh
SPIFFE/SPIRE
generic NetworkPolicy DSL
universal egress proxy
application-defined outbound allowlist
network microsegmentation between in-process Hub modules
per-module container/microservice solely for security theater
generic ZeroTrustService
telemetry authority service
telemetry signature PKI
per-span auth
owner IDs in OTel baggage
global distributed trace as correctness requirement
mandatory external OTel Collector/backend
new Audit service/module
new database per Hub module
RLS policy engine for module boundaries
one global Hub transaction god role
generic cross-owner transaction engine
SECURITY DEFINER authorization layer
dynamic database-role broker
per-request ephemeral DB roles
new durable security/credential record
```

Exact grants/pools/firewall/header syntax are derived realization, not omitted authority.

---

## 23. Routing under 3A-R6

```text
first physical Hub/process topology                       → 3J
TLS/DNS/reverse proxy/firewall implementation             → 3J + Realization Planning
whole-Hub emergency stop                                  → 3J
exact DEDICATED physical ingress                          → 3J first-consumer trigger
Hub DB migration/backup/recovery credential deployment    → 3J
exact PostgreSQL roles/GRANT/default privileges/pools      → post-C-018 Realization Planning
negative DB privilege tests                               → Realization/3N/3O as applicable
exact CSRF mechanism                                      → Realization; 3L only if framework-sensitive
exact CSP header/directives                               → Realization/3K
exact OTel propagators/exporters/Collector                 → 3L/3J/Realization
E2B current firewall API                                  → 3L CX-SBX-E2B-01
Verification Observability deciding-evidence behavior      → 3L/3N
full process split if runtime global state is unisolatable → 3J only if CX-RUNTIME-ISOLATION-01 fires
recovery after credential/store failure                    → 3M
```

---

## 24. Reopen triggers

Return through Decision Loop if any becomes real:

1. a named generated server-side code surface requires arbitrary outbound network access;
2. a browser product feature requires direct third-party network origin;
3. a real DEDICATED deployment requires physical ingress/network policy now;
4. multiple Hub processes/services create independent machine-identity/network-policy lifecycles;
5. same-process Hub compromise becomes an explicit threat to contain, invalidating accepted F1 residual;
6. owner-scoped DB capabilities cannot preserve required cross-owner transaction atomicity without unsafe broad privilege;
7. the number/lifecycle of cross-owner transaction profiles materially grows beyond the two closed cases;
8. PostgreSQL realization proves owner-scoped negative privilege property impractical under the chosen stack;
9. a module legitimately needs cross-schema query semantics rather than owner public API;
10. telemetry requires a trusted external producer class not representable by current provenance taxonomy;
11. compliance/privacy requires stronger trace-context isolation or dedicated telemetry infrastructure;
12. 3L proves E2B deny-by-default or selected browser/request-authenticity realization cannot enforce the required properties.

---

## 25. Candidate disposition before independent review

```text
Material Finding against approved authority = NONE found
reopen prior architecture                    = NONE candidate

package shape
→ one security authority candidate
→ two enforcement planes:
   Trust Zones & Crossings
   hub_control Least Privilege

trust zones
→ 6 logical zones
→ NOT 6 services/processes

application/business egress
→ Gateway + exact Connection/Project-data owner

platform-control operational egress
→ named owner-specific infrastructure adapters

browser
→ untrusted
→ request-authenticity required for state mutation
→ C-016 self-only outbound origin preserved

guest E2B
→ root-capable untrusted
→ durable secrets absent
→ deny-by-default egress

telemetry
→ transport never upgrades producer trust
→ guest capability operational-event only
→ owner IDs/secrets/authority not baggage

hub_control
→ owner-scoped normal runtime DB capabilities
→ no ordinary god login
→ no SET-able path to unrelated owners
→ named narrow transaction exceptions only for existing atomicity
→ migration/backup creds separate from runtime

new module                         = 0
new durable record                 = 0
new database                       = 0
mandatory process split            = 0
service mesh / universal egress    = 0
policy engine / RLS engine         = 0
```

Method outcome candidate: **CURRENT STRUCTURE CONFIRMED with physical enforcement closure**.

---

## 26. Fable independent-review brief

Reconstruct authority from `AGENTS.md`; do not trust this synthesis.

Attack especially:

1. whether Trust Zones/Crossings and `hub_control` least privilege truly share one material root cause or should be split into two authorities;
2. whether six logical zones are sufficient/minimal and whether any is accidentally a deployment topology decision belonging to 3J;
3. C-016 reconciliation: application/business egress through Gateway versus platform-control operational egress through CodingRuntime/GitInfra/model/backup owners — ensure this does not silently weaken `Gateway-only` application egress or turn infrastructure adapters into bypasses;
4. browser request-authenticity: whether it is MUST DECIDE architecture or safely Realization-only; preserve server-side session semantics without inventing auth protocol;
5. browser self-only egress/CSP: whether this is already fully closed by C-016 and should be citation-only rather than new authority;
6. E2B deny-by-default and no durable secrets after guest LLM-key deletion;
7. telemetry trust: guest capability must never mint AuditRecord/HUB_AUTHORITY; transport authentication != producer-trust upgrade;
8. OTel baggage/external propagation; determine the smallest law needed without creating tracing-security machinery;
9. whether owner-scoped `hub_control` DB credentials are necessary proportional enforcement or overengineering inside a single trusted modular-monolith process;
10. challenge the target invariant: arbitrary SQL reachable through one normal module persistence capability cannot reach another owner schema;
11. PostgreSQL semantics: specifically test whether a single umbrella `NOINHERIT` login with role memberships could still `SET ROLE` and therefore fails the invariant;
12. whether one login per owner is unnecessarily frozen — preserve property, not literal role/pool count;
13. the two cross-owner domain transactions: prove the proposed named narrow transaction capability can preserve one PostgreSQL transaction without becoming a generic god role;
14. audit-required same-transaction record: challenge the narrow `obs.audit_record` INSERT shape and find a smaller safe realization if one exists;
15. Mastra/project/hub_control cross-database credential isolation and whether this belongs to 3I property level versus 3J spelling;
16. whether `BYPASSRLS` prohibition matters in `hub_control` even though current module boundary is schema-based, and whether retaining it is harmless defense-in-depth or unnecessary statement;
17. whether separate credentials in one process create meaningful safety given full Hub compromise is accepted residual; distinguish SQL-path containment from process-RCE containment;
18. whether any current owner legitimately needs cross-schema direct SQL that would contradict 3D/3E;
19. whether any new durable record/module/policy/egress service/process split is actually required;
20. route everything safely to 3J/3L/3M/Realization Planning and identify any hidden C-018 blocker.

Use official PostgreSQL/OpenTelemetry/E2B/OWASP sources only if external verification is needed. Preserve 3A-R6 proportionality: do not expand generic security work. Return Material Findings, corrected candidate, proof obligations, YAGNI cuts, reopen triggers and whether this package can be the last material 3I decision before bounded closure review.

Append below, commit/push. **Do not update LEDGER, approved authority or product code. Do not allocate a new 3I ID.**