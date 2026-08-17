# 3I Fable Dialogue — Final Security / Authority Closure

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Candidate:** bounded final closure review of 3I; no `3I-R1` authority is created by this file  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** independently determine whether 3I-01..3I-05 are globally coherent and complete enough to close 3I under 3A-R6. This file does not update authority, close 3I, authorize implementation, merge or PR readiness.

---

## 1. Canonical state to reconstruct independently

Read from `AGENTS.md` and the canonical chain. Do not trust this summary as authority.

Expected current status to verify from repo:

```text
3A-R6 = APPROVED
3B..3H = CLOSED / APPROVED
3I = IN PROGRESS
3I-01 = APPROVED
3I-02 = APPROVED
3I-03 = APPROVED
3I-04 = APPROVED
3I-05 = APPROVED
remaining material 3I family on current evidence = 0 candidate
```

3I decisions:

```text
3I-01 — Current Authorization, Approver Eligibility & Revocation
3I-02 — Credential & Capability Custody
3I-03 — Per-ActorRun / Per-AgentRun Model Spend Enforcement
3I-04 — DEDICATED Trusted Exchange
3I-05 — Trust Zones, Crossings & hub_control Least Privilege
```

3A-R6 requires a **single bounded closure review**, not a fresh threat-model program.

---

## 2. Closure question

Determine only:

> **Does the approved 3I architecture provide a complete, non-duplicated and implementable F1 security/authority model for every currently admitted trust/authority path, with all remaining technology/topology/recovery/detail work correctly routed, such that no coding actor must invent a material security decision?**

If YES, recommend `CLOSE 3I` / `3I-R1` candidate.

If NO, identify the exact Material Finding and smallest implicated authority to reopen. Do not create a new topic merely because a generic security mechanism exists in industry.

---

## 3. Required global checks

### A. Principal / authorization completeness

Verify:

```text
Account human principal
DedicatedApplicationPrincipal non-human principal
runtime/run/trace IDs remain non-principals
I&A ALLOW != complete execution ALLOW
current mutable authority reapplied at owner control points
no stale session/runtime/Release/telemetry authority resurrection
```

Look for any currently admitted caller that has no explicit principal/authentication/current-authorization path.

### B. Surface separation

Verify:

```text
CONTROL_PLANE
PREVIEW
PUBLISHED_APP
DEDICATED Platform Service exchange
```

remain distinct where required and do not silently inherit roles/memberships/tokens from one another.

### C. Credential/capability custody

Verify every current secret/capability class has an owner/use boundary:

```text
human/session credential
Connection credential
CredentialBackend root/recovery material
Git credential
E2B operational credential
model-provider credential
backup credential
sandbox telemetry-ingest capability
DEDICATED private key
Hub access-token signing key
PostgreSQL owner/runtime/migration/transaction capabilities
```

Find any secret path that can reach browser, guest, generated app, telemetry or wrong owner contrary to approved laws.

### D. External effects / business egress

Verify:

```text
application/business execution → Gateway
Connection secret materialization → Gateway last mile
approval/idempotency/budget/outcome laws remain Gateway-owned
platform-control operational egress is owner-specific, not Gateway-universal
model/caller/artifact cannot choose a privileged adapter destination
```

Look specifically for an admitted bypass from Builder/PAR/MANAGED/DEDICATED to enterprise systems.

### E. Model spend

Verify 3I-03 composes with 3H and C-013 without duplicate budget authority:

```text
ActorRun/AgentRun owner-local spend
Gateway budget remains external-effect authority
OBS remains evidence/accounting
provider-native limits = defense in depth
```

Any load-bearing implementation proof belongs to 3L unless domain/security semantics are actually missing.

### F. DEDICATED

Verify 3I-04 + 3I-05 compose:

```text
DAP + signed exact ReleaseRef
Project-owned current credential generation
short-lived bearer + current recheck
SERVICE_SCOPED-only F1
no Hub internals in DEDICATED
physical deployment deferred under first-consumer trigger
DPoP/mTLS/fleet/attestation remain safely deferred
```

Check whether any trust-zone rule accidentally contradicts the same-Project Release residual accepted in 3I-04.

### G. Guest / E2B

Verify:

```text
root-capable untrusted guest
no durable/enterprise/Hub-DB/Git-write/model-provider secret
bounded guest telemetry capability only
outside-guest deny-by-default network property
RunPreview private/authenticated
```

Do not reopen E2B technology choice; pinned behavior qualification belongs to 3L.

### H. Telemetry / audit

Verify:

```text
transport != producer trust
GUEST_OBSERVED / PROVIDER_OBSERVED cannot become HUB/GATEWAY authority
Operational Telemetry != Audit Trail
Guest telemetry cannot mint AuditRecord
OTel baggage excludes owner authority/secrets by default
required evidence missing → NOT_PROVEN / INCONCLUSIVE
```

Look for any place telemetry is used as authorization, terminal lifecycle truth or acceptance by absence.

### I. `hub_control` least privilege

Verify 3I-05 is coherent with 3D/3E:

```text
one physical hub_control DB
13 semantic owner schemas
no direct cross-module internals
normal owner DB capability cannot reach another owner
no ordinary broad/SET-able god runtime login
exactly two current cross-owner domain transaction cases
narrow audit append exception
migration/backup/recovery authority outside normal runtime
Mastra/Project DB credentials isolated from hub_control
```

Check whether any approved use case legitimately requires a third cross-schema direct SQL path or a new durable record. If not, do not invent one.

### J. Browser/security baseline duplication

Verify 3I-05 correctly **cites rather than duplicates**:

```text
C-015 session/cookie + Origin/Sec-Fetch-Site mutation baseline
C-016/C-012 self-only browser egress / CSP baseline
```

A closure finding should arise only on contradiction/gap, not because another CSRF/CSP mechanism could also be used.

### K. Recovery/topology/technology routing

For every unresolved security-shaped question, classify:

```text
3J — physical deployment/ingress/TLS/secret injection/whole-Hub stop
3L — load-bearing provider/framework behavior probes
3M — concrete failure/recovery semantics
3N/3O — global/end-to-end proof
Realization Planning — exact roles/grants/DTOs/libraries/headers/pools/config
Decision Loop — consumer-triggered future capability
```

If something is routed but a coding actor would still need to choose owner/authority/durable meaning/trust contract, that is a Material Finding.

---

## 4. Anti-overengineering closure test

Do not recommend any of these without a named current failure class that existing authority cannot cover:

```text
Keycloak/Auth0/WorkOS/SSO/SCIM F1
OPA/Cedar/OpenFGA
service mesh / SPIFFE-SPIRE
UniversalEgressService
microservices
network segmentation between in-process modules
external Vault/KMS/HSM
new security/revocation/policy engine
new secret/token/session record
RLS engine for module ownership
generic transaction framework
telemetry PKI
DPoP/mTLS/fleet/binary attestation
process split solely for aesthetic isolation
```

Human F1 auth is already Conexus-native under C-015/3C-02; external IdP returns only on its named trigger.

---

## 5. Closure proof questions

Try to construct at least these counterexamples from approved architecture:

```text
1. revoked Account still performs a new protected operation
2. stale runtime RequestContext resurrects permission
3. browser asserts Project/role/Release and widens authority
4. E2B guest reaches ERP or Hub DB
5. generated app/model chooses arbitrary privileged egress destination
6. Connection secret escapes Gateway last mile
7. telemetry payload upgrades itself to HUB_AUTHORITY
8. guest telemetry satisfies audit-required mutation
9. DEDICATED Project A credential reaches Project B Release/service
10. old DEDICATED token survives credential generation change
11. normal owner DB capability SELECTs/UPDATEs another schema
12. normal DB capability SET ROLEs into another owner
13. cross-owner transaction profile accesses a third schema
14. ordinary runtime uses migration/backup/recovery credential
15. Mastra store credential connects to hub_control/Project DB
16. model-call retry/fallback bypasses 3I-03 reservation gate
17. any path turns valid authentication into unconditional domain execution
18. any open LEDGER item still requires a material 3I decision before C-018
```

For each reachable counterexample, identify the exact authority gap. For each unreachable one, cite the governing authority rather than adding a new control.

---

## 6. Required output

Append an independent review below this section with only decision-relevant material:

```text
Material Findings against approved authority
missing material 3I decision count
reopen required? exact IDs only
unrouted C-018 blocker?
new module/record/security engine required?
3A-R6 classification of every residual
closure verdict = CLOSE 3I | RESTRUCTURE | STOP
```

If the verdict is `CLOSE 3I`, provide the minimal content that `3I-R1` must ratify and any proof/routing corrections that belong in the closure authority.

Do not update `LEDGER.md`, do not create `3I-R1`, do not modify approved authority and do not touch product code. External research is unnecessary unless a conclusion truly depends on unstable third-party behavior; if used, use only primary sources.

---

## 7. Fable independent closure review

**Method:** DevelopmentConexus Engineering Method v1.0.0. Authority reconstructed independently on **2026-08-17** from `AGENTS.md → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`: full texts of 3I-01..3I-05, 3A-R6 §6.4/§18, C-015/C-016 (browser/session/egress baselines cited by 3I-05 §12), C-013/3H-03 (producer trust), 3C-R1 + 3D-R1/3D-R4 (EVENT ingress reserved + authn guard note), 3E-01/3E-02 (TxScope, closed atomicity/record inventory), 3G-05/3G-06, 3H-01..3H-03/3H-R1, plus LEDGER §11/§12 post-3I-05 routing state. Canonical state verified from repo: `3A-R6 APPROVED; 3B..3H CLOSED; 3I-01..3I-05 APPROVED — 2026-08-17; remaining material 3I family on current evidence = 0`. Round-1 corrections F-2..F-5 are confirmed **incorporated in ratified 3I-05** (T5 destination anti-injection = F-2; §12 citation-only browser rules = F-3; §8.2/§8.5/§14.2 per-owner-login consequence + pool-budget honesty + fresh-session proof note = F-4; §10 dual audit-append realizations = F-5). No external research was needed: every conclusion rests on repo authority plus the dated primary-source facts already recorded in the 3I-05 dialogue.

### 7.1 Global checks A–K

```text
A. principal/authz      COMPLETE. Closed two-principal set (Account, DAP) with
                        explicit non-principals (3I-01 §3); every currently
                        admitted caller authenticates as one of them or holds a
                        Hub-minted guest capability governed by 3I-02 §13.2
                        (which covers ALL guest-readable capabilities — control
                        callbacks and telemetry alike, server-checked on every
                        use). Account ceremony end-to-end = C-015 (Argon2id
                        versioned, server-side session hash, setup credential,
                        full-session revocation). SCHEDULE trigger wakes inside
                        PAR — no external caller, no invented requesting
                        Account (3I-01 §8.2); EVENT ingress stays reserved with
                        the 3D-R1/3D-R4 authn guard note bound to activation.
                        No caller found without a principal/authn path.
B. surfaces             SEPARATE. CONTROL_PLANE != PREVIEW != PUBLISHED_APP
                        (3I-01 I3, C-015 membership-before-role, 404
                        indistinguishable); DEDICATED exchange is
                        SERVICE_SCOPED-only with own-auth users as correlation
                        only (3I-04 D7/§12). No surface inherits roles/
                        memberships/tokens from another.
C. custody              COMPLETE. All eleven listed classes have owner + use
                        boundary + revocation story: session (C-015/iam),
                        Connection (3I-02 C1/C2), root/recovery (C4 separate
                        compromise path), Git write (GitInfra, never guest),
                        E2B control (CodingRuntime), model provider (adapter +
                        3I-03 gate, guest key DELETED), backup (operational,
                        3J custody), telemetry-ingest capability (3I-02 §13),
                        DEDICATED private key (DEDICATED host only, 3I-04
                        §5.1), Hub signing key (operational credential, 3I-04
                        §15, not CredentialBackend), PostgreSQL owner/
                        migration/transaction capabilities (3I-05 §8, T11).
                        No secret path reaches browser/guest/generated app/
                        telemetry contrary to law.
D. business egress      GATEWAY-OWNED, not weakened. The platform-control
                        class is disjoint by construction (infrastructure
                        mechanics, never Connection/business execution) and
                        T5 closes the injection channel: no adapter accepts
                        model/caller/artifact-derived destinations. No
                        admitted bypass from Builder/PAR/MANAGED/DEDICATED to
                        enterprise targets exists in any approved text.
E. model spend          NO duplicate budget authority. M1 owner-local
                        (bld.actor_run / par.agent_run); gw.budget_counter
                        stays external-effect authority; OBS stays evidence;
                        provider-native limits defense-in-depth. Remaining
                        work is exactly the 3L MUST-QUALIFY subset — proof,
                        not missing semantics.
F. DEDICATED            COMPOSES. Token non-snapshot (D5) re-enters 3I-01
                        current authority at every Platform-Service admission;
                        issuance is read-only composition over prj/rel public
                        APIs (no security-sensitive mutation on that path);
                        Z4 does not contradict the accepted same-Project
                        Release-selection residual (3I-05 leaves Release
                        choice to 3I-04 §11 exactly as ratified); physical
                        deployment stays first-consumer deferred.
G. guest/E2B            HOLDS. Root-capable untrusted; never-receives list
                        (Z3) matches 3I-02; deny-by-default outside guest;
                        RunPreview behind authenticated Hub proxy; registry
                        access during build is admitted-destination
                        realization under C-016 pins. E2B behavior proof =
                        3L, technology not reopened.
H. telemetry/audit      HOLDS. Boundary-derived producer trust; guest
                        capability writes Operational Telemetry only and
                        cannot mint obs.audit_record; baggage excludes
                        authority/secrets/owner IDs by default; required
                        evidence missing → NOT_PROVEN, never PASS by absence.
                        No place found where telemetry acts as authorization
                        or terminal lifecycle truth.
I. hub_control          COHERENT with 3D/3E, one composition correction for
                        3I-R1 (CR-1, §7.3): the ratified exception set (two
                        domain transaction cases + audit append) is complete
                        for DOMAIN atomicity but the 3I-01 §7.2 authorization-
                        serialization requirement is not reconciled in text.
                        No third cross-schema SQL need found (Release reads
                        Registry via public API; Gateway composes via APIs +
                        own schema; OBS is a sink; reporting rolls up
                        obs-owned tables) — the closed set stands.
J. browser duplication  CLEAN. 3I-05 §12 cites C-015 (Origin + Sec-Fetch-Site
                        on mutating methods, cookie laws) and C-016/C-012
                        (self-only/CSP, platform-owned headers) without
                        restating either normatively. No contradiction, no
                        second CSRF/CSP law.
K. routing              CLEAN. Every unresolved security-shaped item in
                        3I-05 §15 + LEDGER §11 carries a named owner and
                        classification (3J physical/stop/backup; 3L E2B/OTel/
                        model-spend/Verification-Observability probes; 3M
                        already-routed recovery only; 3N/3O negative matrix;
                        Realization Planning roles/grants/pools/headers/
                        adapters; Decision Loop consumer-gated items with
                        3I-05 pre-binding the Product Agent browsing shape).
                        Nothing dangles.
```

### 7.2 Closure proof questions — counterexample construction

All eighteen attempted from approved architecture; none reachable. Governing authority cited per item:

```text
 1. revoked Account new protected op        UNREACHABLE — 3I-01 I1/E2 (no
    mutable-auth cache; current resolution); race variant is exactly the
    §7.2 serialization law — proof composition carried by CR-1 (§7.3)
 2. stale RequestContext resurrection       UNREACHABLE — 3I-01 I8; 3H-01
    rebuild on re-entry
 3. browser asserts Project/role/Release    UNREACHABLE — Z1 + C-015
    server-derived identities; 3F-06
 4. guest reaches ERP / Hub DB              UNREACHABLE — Z3 never-receives
    list + deny-by-default egress; 3I-02 C6
 5. model/app chooses privileged egress     UNREACHABLE — T5 destination
    anti-injection law (owner-pinned config only)
 6. Connection secret escapes last mile     UNREACHABLE — 3I-02 C2/E4 +
    prohibited-propagation list §6.2
 7. telemetry self-upgrades to HUB          UNREACHABLE — T7; 3H-03; C-013
    acceptance consumes HUB/GATEWAY only
 8. guest telemetry satisfies audit         UNREACHABLE — 3I-05 §7.2; 3E-01
    same-transaction fail-closed audit law
 9. Project A DAP → Project B Release       UNREACHABLE — 3I-04 D2 fail-closed
10. old token survives generation change    UNREACHABLE — 3I-04 D4 per-request
    generation recheck
11. owner capability reads other schema     UNREACHABLE — T9 + §14.2 DENY
    matrix (fresh-session proof discipline)
12. SET ROLE into another owner             UNREACHABLE — §8.3 umbrella
    rejection on documented PG semantics; T10
13. transaction profile → third schema      UNREACHABLE — §9 closed set +
    §14.3 negative proof
14. runtime uses migration/backup cred      UNREACHABLE — T11; operational
    custody separated
15. Mastra credential → hub_control         UNREACHABLE — T12 + §11 negative
    CONNECT matrix
16. retry/fallback below spend gate         UNREACHABLE by law — 3I-03 §8/E6;
    mechanical truth = 3L MUST QUALIFY (routed blocker by 3A-R6's own gate,
    not an open 3I decision)
17. authentication → unconditional exec     UNREACHABLE — 3I-01 I2; 3I-04 D5
18. open LEDGER item needs 3I decision      NONE — LEDGER §11 swept row by
    row: every item is RESOLVED-at-property, Realization/3L/3J/3N-routed, or
    consumer-gated Decision Loop with named trigger
```

### 7.3 CR-1 — the one composition correction 3I-R1 must ratify

```text
finding class         latent composition ambiguity between two approved
                      authorities; NOT a contradiction, NOT a missing
                      decision, NOT a reopen
the two laws          3I-01 §7.2: every security-sensitive mutation must
                      serialize ALL consumed mutable authority facts against
                      concurrent revocation until mutation commit (proof
                      obligation 5: stale pre-read cannot commit).
                      3I-05 T9/§9: a normal owner persistence capability
                      cannot read/mutate/acquire another owner schema; the
                      enumerated exceptions are the two domain transaction
                      cases + the audit append.
the unstated seam     almost every security-sensitive mutation lives OUTSIDE
                      iam while consuming iam authority facts (binding SET →
                      prj; credential replace → con; trigger mutation / run
                      cancel → par/bld; promote → rel). Under the rejected
                      broad login, 3I-01's named "locking read" realization
                      just worked; under owner-scoped capabilities a
                      cross-owner SELECT ... FOR SHARE is exactly what §14.2
                      must DENY, and serializable isolation cannot span two
                      sessions. Neither authority says out loud what replaces
                      the inadmissible family. The two enumerated profiles
                      never needed it (CreateProject contains iam by
                      construction; FIRST_CLAIM deliberately excludes
                      approver-eligibility recheck per 3I-01 §9) — the gap is
                      exactly and only the authorization-fact class.
why no reopen         the laws are jointly satisfiable TODAY under the
                      ratified texts: a transaction-scoped advisory-lock /
                      conflicting-guard realization (both the iam revocation
                      path and the consuming mutation serialize on the exact
                      authority-fact key) takes ZERO cross-owner schema
                      authority — admissible under T9 as written, and already
                      inside 3I-01's open mechanism clause ("fresh conflicting
                      guard ou equivalente"). A second admissible family is an
                      iam-owned narrow SECURITY DEFINER current-authority
                      locking-read surface — the same admission shape 3I-05
                      §10 already uses for the audit append (one owned helper,
                      not the rejected authorization substrate). A third —
                      enumerated narrow read+lock grants on exact iam
                      authority projections — would require an explicit T9
                      exception row and is the least preferred.
why it must be said   left unstated, a coding actor implementing any
                      sensitive mutation must choose among: silently granting
                      cross-owner reads (erodes T9), silently dropping
                      serialization (violates 3I-01 §7.2), or silently minting
                      a broad transaction role (rejected Alternative by the
                      back door). That is the exact 3A-R6 §18.1 failure class
                      this closure review exists to catch — and it is the
                      only instance of it found in the whole 3I system.
minimal 3I-R1 text    (a) composition clause: "The 3I-01 §7.2 serialization
                      property composes with 3I-05 T9 through realizations
                      that take no cross-owner schema authority (transaction-
                      scoped conflicting-guard/advisory-lock class, in which
                      revocation and consuming mutation serialize on the same
                      authority-fact key) or through a narrow iam-owned
                      locking-read surface admitted the same way §10 admits
                      the audit-append helper; cross-owner locking reads by
                      broad grants and umbrella-role realizations remain
                      inadmissible. Family selection is Realization Planning;
                      no durable state, no new privilege breadth, no general
                      cross-owner query capability arises."
                      (b) combined proof obligation: "3I-01 proof 5 (stale
                      pre-read cannot commit under concurrent revocation) and
                      the 3I-05 §14.2 negative privilege matrix must pass
                      SIMULTANEOUSLY on the same realization — one green
                      without the other is a failed proof." Routed with the
                      existing negative matrix to Realization Planning + 3N/3O.
                      (c) reopen alignment: read 3I-05 DB-plane trigger 8
                      as covering authorization-fact serialization, not only
                      connection/performance economics.
```

### 7.4 3A-R6 classification of every residual

```text
MUST DECIDE — none remaining. All five 3I families are decided at property
level; nothing left in 3I meets the §4.1/§5 tests.

routed blockers (pre-C-018 by 3A-R6's own gates, not open 3I decisions):
  3L MUST QUALIFY — E2B deny-by-default; model-spend interception/usage/
  missingness/cost-envelope subset; Mastra probes; Verification Observability
  deciding-evidence subset; OTel propagator behavior where load-bearing
  3J obligations — whole-Hub stop proof (3I-01 §13), backup/recovery
  two-sided proof (3I-02 §12.2), custody runbooks, first topology
  3N/3O — negative privilege/crossing matrix incl. the CR-1 combined proof
  F3B-R1 — repo/cutover operator gate before Realization Planning

DEFER SAFELY (owner + trigger named): DEDICATED physical deployment (first
real consumer / 3J); Product Agent browsing (named consumer; T5 pre-binds
shape); EVENT ingress (first consumer; 3D-R1 authn guard note); new browser
origin/embed (C-015/C-016 triggers); DPoP/mTLS/fleet/attestation (3I-04
triggers); external KMS/HSM, per-secret DEK, transient-token persistence
(3I-02 triggers); mutable-auth cache (measured scale + max-staleness proof);
dual-control approval (named workflow); per-Project serving stop (proven
incident class); process split for credential isolation (concrete Finding).

REJECT F1 (standing, re-entry only via Decision Loop): service mesh /
SPIFFE-SPIRE, UniversalEgressService / privileged generic fetch, RLS/policy
engines, generic authorization/transaction engines, microsegmentation and
per-module processes/databases, telemetry PKI, god transaction role,
per-request ephemeral DB roles, external IdP absent trigger, refresh tokens
for DEDICATED, new security/token/session records.

new module/record/security engine required by closure = 0.
```

### 7.5 Required output

```text
Material Findings against approved authority   = NONE
  (CR-1 is a latent composition ambiguity, jointly satisfiable under the
   ratified texts; it enters 3I-R1 as a correction, exactly the 3H-R1
   precedent of non-material corrections incorporated in closure authority —
   it is also the ONLY invention-shaped choice left to a coding actor, and
   3I-R1 ratifying clause 7.3(a)/(b)/(c) reduces that count to zero)
missing material 3I decision count             = 0
reopen required                                 = NO — exact IDs: none
unrouted C-018 blocker                          = NONE
new module / record / security engine required  = 0
five 3A-R6 §6.4 questions                       = NONE / NONE / NONE / NONE / NONE
coding-actor material inventions before C-018   = 1 → 0 with CR-1 in 3I-R1

closure verdict = CLOSE 3I

minimal content 3I-R1 must ratify:
  1. the five §6.4 closure answers (NONE ×5) + unrouted-blocker = NONE, with
     this review as non-authoritative provenance;
  2. CR-1 composition clause + combined proof obligation + trigger reading
     (§7.3 a/b/c) — the only correction this review adds;
  3. confirmation that Round-1 F-2..F-5 are already carried inside ratified
     3I-05 (no separate amendment needed);
  4. the residual classification table of §7.4 as the binding routing
     snapshot at 3I closure (3J/3L/3M/3N/3O/Realization/Decision Loop);
  5. explicit statement that 3I closes with zero new modules, records,
     databases, engines, processes, and that no generic threat catalog
     creates further 3I work.

RESTRUCTURE — not justified: one authority / two planes stands (Round-1 F-1);
no duplicate or missing authority found anywhere in 3I-01..3I-05.
STOP — nothing found approaching it.
```
