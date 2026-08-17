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
