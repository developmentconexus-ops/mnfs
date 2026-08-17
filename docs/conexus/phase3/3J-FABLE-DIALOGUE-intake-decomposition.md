# 3J Fable Dialogue — Deployment / Operations Intake

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3J — Deployment / Operations Architecture  
**Purpose:** decompose the **first real Conexus production topology** under 3A-R6 before allocating any 3J authority ID. This file does not update `LEDGER.md`, approve topology, authorize implementation, merge or PR readiness.

## 1. Canonical state to reconstruct

Read `AGENTS.md` and the canonical chain independently.

Expected state to verify:

```text
3A-R6 = APPROVED
3B..3I = CLOSED / APPROVED
3I-R1 = APPROVED / CLOSED
3J = NOT STARTED / NEXT
3K..3O = NOT STARTED
```

3A-R6 requires 3J to decide the **first production topology**, not future topology families.

MUST DECIDE:

```text
first Hub deployment shape
single-host/process baseline + split triggers
Hub modular-monolith placement
PostgreSQL / hub_control / Project DB placement
Builder/PAR Mastra-store placement
E2B control connectivity
MANAGED serving path
TLS / ingress
operational secret injection/custody
startup / shutdown / restart
material platform deploy/upgrade sequence
backup owner + required backup set
restore-proof responsibility
whole-Hub emergency-stop physical procedure
host-loss/restart honesty
minimum availability set for first internal production use
```

DEFER SAFELY:

```text
DEDICATED physical topology → first real DEDICATED deployment
old Product Agent runtime coexistence/drain → first runtime-affecting post-prod upgrade
```

REJECT F1 absent trigger:

```text
Kubernetes / service mesh
multi-region / active-active
automatic failover / horizontal scale framework
fleet scheduler
blue-green/canary framework
multi-cloud abstraction
external Vault/KMS/HSM
advanced DEDICATED fleet
HA/PITR beyond accepted first-launch need
```

## 2. Authority already frozen — do not redesign

```text
Hub = modular monolith; modules are not deployment units.

PostgreSQL logical inventory:
  hub_control + 13 owner schemas
  mastra_builder
  mastra_par
  database-per-Project
  ephemeral validation DBs

MANAGED serving:
  active exact Release
  → exact verified frontend build
  → Managed Application Runtime
  → server-derived serving context

Promotion:
  one non-terminal Promotion per Project/PROD
  durable step facts
  maintenance serving-block may survive failed Promotion
  pointer truth is not rewritten after failure
  rollback = new Promotion

Runtime isolation:
  BuilderMastra != ParMastra
  same Node process allowed
  process split only if CX-RUNTIME-ISOLATION-01 proves an enabled unpartitionable failure class

Ingress/security:
  HTTP only loopback/localhost
  remote browser access => HTTPS
  first F1 browser surface = same-origin trust zone
  browser egress self-only
  business external egress => Gateway / Connection
  platform-control egress => named owner adapter
  E2B guest receives no durable/platform/business secrets
  whole-Hub physical emergency stop required before production
```

C-006 already provides a Project DB backup precedent: logical dumps, encrypted off-host Backblaze B2 copy, and restore-test. 3E-01 requires `mastra_par` to join backup/restore; `mastra_builder` is deliberately lower durability unless later evidence changes that.

## 3. Research challengers, not authority

**Mitra:** measured cloud platform uses E2B as external sandbox, separates build/control from published runtime, and serves apps on production domains. Useful lesson: sandbox does not need platform secrets and serving is platform-owned. Proprietary backend/process/HA topology remains unknown.

**Factory:** public platform supports local/worktree/sandbox/CI and persistent Droid Computers. Useful lesson: multiple execution targets can exist over time. It does not justify a Conexus persistent worker fleet, worker Git credentials, or fleet scheduler; C-008 E2B remains the F1 guest boundary.

## 4. Root cause

Without 3J, coding actors would still invent:

```text
company server vs VPS vs developer machine
one process vs several
local vs remote Postgres
how employees reach MANAGED apps
whether Hub is Internet-public
how E2B connects
where operational secrets enter
what host loss means
what is actually backed up
what restore proves
how reboot/startup behaves
platform deploy vs Product Promotion
how to stop a broken Hub without trusting the Hub itself
which dependency failure kills which surface
```

These affect trust, failure domain, recovery, availability and hard-to-reverse topology.

Target root invariant:

> The first production deployment has one explicit physical failure domain and operating model that realizes existing semantic authorities without manufacturing distributed-systems machinery.

## 5. Target properties

```text
J1 one deliberate first failure domain; host loss is stated honestly
J2 modules do not imply services/processes
J3 durable owner truth survives process restart; framework memory never replaces it
J4 MANAGED serving has one bounded HTTPS ingress; no implicit public surface
J5 E2B does not force generic/public Hub ingress
J6 host operational credentials remain owner-specific capabilities
J7 backups cover non-reconstructible authority/content, not only SQL
J8 restore proof comes from independent/off-host copy and semantic checks
J9 platform deployment != Project Release Promotion
J10 emergency stop is out-of-band from the Hub app path
J11 capability/provider outages fail the affected surface honestly rather than inventing success
J12 topology remains compatible with the 3L process-split trigger without pre-splitting
```

## 6. Known / Inferred / Unknown / Deferred

### KNOWN

1. Hub is a modular monolith.
2. PostgreSQL logical cluster inventory is already fixed.
3. MANAGED apps serve exact active-Release bytes via MAR.
4. Remote F1 browser access requires HTTPS; C-016 already supports tailnet HTTPS.
5. E2B is outside the trusted Hub boundary.
6. Builder/PAR can share one process until qualification proves otherwise.
7. `mastra_par` needs backup/restore; `mastra_builder` is not automatically equal durability.
8. Attachment/blob metadata without required blob bytes is not a complete restore.
9. CredentialBackend recovery keys must not share one non-Hub loss/compromise path with ciphertext backups.
10. DEDICATED physical deployment and HA machinery are not current 3J scope.

### INFERRED — challenge these

1. F1 likely wants a **single-host first topology**; distributed placement currently adds more failure/network/credential surfaces than value.
2. Hub application likely starts as **one Node process** containing L7/MAR/Gateway/Builder-control/PAR, with distinct Builder/PAR Mastra instances.
3. Co-locating the PostgreSQL cluster and current platform file stores on that first host is likely the smallest topology; off-host backup covers host loss rather than synchronous replication.
4. First employee ingress is likely **tailnet-only HTTPS / no public Internet ingress** with same-origin path routing.
5. Hub→E2B should be outbound control/pull where possible; guest→Hub generic inbound is unnecessary.
6. Reusing the already-approved B2 off-host path is likely smaller than adding a new backup platform.
7. Initial platform deploy can accept bounded maintenance/downtime; zero-downtime deployment is YAGNI.
8. Core Hub should fail closed if `hub_control`/required local authority storage is unavailable, while optional external/provider substrates should fail only affected capabilities where current contracts permit.

### UNKNOWN — material 3J evidence

```text
on-prem/company Linux host vs cloud/VPS placement
acceptable first-launch availability / RPO / RTO
private Sankhya/LAN reachability needs
on-prem power/UPS/ISP/hardware reliability if selected
whether authoritative state may live in cloud
exact Blob/CAS and CredentialBackend backing primitive
whether active Release/build bytes are independently reconstructible
exact tailnet TLS termination mechanism
result of CX-RUNTIME-ISOLATION-01
exact supervisor/secret-injection primitive
exact platform-upgrade sequence once implementation exists
backup frequency needed after RPO is accepted
```

Provider **brand** is not yet the architectural question; on-prem vs cloud placement is material because it changes network reachability, custody and failure domain.

## 7. Proposed decomposition — three packages

### Package A — First Production Topology, Placement & Ingress

Owns:

```text
host/failure-domain class
on-prem vs cloud placement semantics
single-host baseline
one Hub Node process baseline
3L-triggered Builder/PAR split rule
Postgres/Mastra physical placement
Blob/CredentialBackend backing placement class
E2B connectivity
MANAGED serving path
HTTPS/tailnet ingress
public-ingress prohibition
```

Likely first authority candidate:

```text
3J-01 — First Production Topology, Placement & Ingress
```

Why first: backup, startup, emergency stop and availability all depend on the selected physical failure domain.

### Package B — Operational State, Backup & Restore

Owns:

```text
required backup set
reconstructible vs non-reconstructible classes
hub_control / Project DB / mastra_par
mastra_builder durability classification
Blob/CAS
CredentialBackend encrypted backing
separate recovery-key path
Git/local checkout classification
active Release/build bytes classification
backup owner + off-host copy
pre-migration backup obligation
restore-proof owner + minimum semantic proof
first-launch RPO/RTO
```

Candidate:

```text
3J-02 — Operational State, Backup & Restore Architecture
```

### Package C — Platform Lifecycle, Emergency Stop & Availability

Owns:

```text
boot prerequisites / fail-closed startup
service supervision expectation
shutdown/drain boundary
process/host restart
platform code/schema deploy sequence
platform deploy != Product Promotion
maintenance-window baseline
post-deploy verification responsibility
out-of-band whole-Hub emergency stop
host-loss/manual restore honesty
minimum core availability set
safe capability-level degradation
```

Candidate:

```text
3J-03 — Platform Lifecycle, Emergency Stop & Availability
```

3M still owns semantic recovery/settlement for orphan runs, OUTCOME_UNKNOWN, partial Promotion, post-stop work and owner-state repair.

After A–C, one bounded `3J-R1` closure should be sufficient if no material finding remains.

## 8. Key alternatives

**One giant 3J authority:** likely too coupled; placement, backup and lifecycle have different reopen triggers.

**Decision per 3A-R6 bullet:** rejected as microdecision ceremony.

**Choose provider first:** rejected; failure-domain/boundary property comes before Ubuntu/Hetzner/Fly/Caddy/systemd/etc.

**Distributed managed-cloud baseline:** reject F1 absent named availability/RPO/compliance need.

### Placement candidates for later operator decision

```text
A. dedicated company/on-prem Linux host
   + private ERP proximity / local custody / tailnet access
   - power/hardware/ISP/manual replacement are operator failure domain

B. single cloud/VPS Linux host
   + datacenter always-on / remote admin
   - private ERP tunnel may be required; authoritative state/provider dependency moves off-site

C. split managed-cloud topology
   → REJECT F1 absent requirement
```

Do not choose A vs B from preference. Identify the actual environment facts required for the decision.

## 9. Backup-set hypothesis to attack

Likely required:

```text
hub_control
production Project DBs
mastra_par
Blob/CAS bytes required by live attachments/non-reconstructible active content
CredentialBackend encrypted backing
role/extension/recovery manifests
```

Separate loss/compromise path:

```text
CredentialBackend root/recovery key
backup-encryption recovery material
```

Potentially reconstructible / not automatically backed up:

```text
mastra_builder
local Git checkout/worktree when remote canonical Git survives
ephemeral validation DBs
runtime temp/cache
derived Operational Telemetry
```

Must be explicitly classified:

```text
active Release build bytes / artifact CAS
```

If they are not reproducibly available from another accepted source, calling them reconstructible is false.

## 10. Platform deploy != Product Promotion

```text
Platform deploy:
Conexus Hub code + hub_control/platform schema + framework/config/host services

Product Promotion:
Project Release + Project DB migration + active pointer + MANAGED served build
```

Do not use `Promotion` as the generic Hub deployment record. Do not use host/Git deployment state as Project Release authority.

Initial launch may use a maintenance window. Old/new Product Agent runtime coexistence is explicitly deferred until the first runtime-affecting upgrade after production.

## 11. Emergency stop candidate property

> Operator can prevent new Conexus ingress/execution using an out-of-band host/ingress control that does not depend on a healthy/authenticated Hub application path.

Single-host realization may combine stopping ingress + stopping Hub application process. Exact commands are Realization/runbook detail. Stopping does not erase already-sent effects; post-stop settlement is 3M.

No `EmergencyStop` database entity is justified.

## 12. Availability candidate

Likely core start dependency:

```text
host/config
hub_control
required secret-decryption material
required local authoritative storage
```

Likely capability-local failure examples:

```text
Project DB down     → affected Project operations fail closed
mastra_par down     → Product Agent unavailable, no fake success
mastra_builder/E2B down → Builder unavailable
model provider down → model-bearing run fails/degrades honestly
Git provider down   → Git-dependent work unavailable
enterprise API down → exact Gateway operation fails honestly
```

If actual framework coupling makes one of these a whole-Hub dependency, that is evidence for 3L/3J — not a reason to assume it.

## 13. Boundary to later stages

```text
3L → E2B/Mastra/process-isolation/OTel/model-spend technology truth
3M → semantic crash/orphan/OUTCOME_UNKNOWN/partial-Promotion/post-stop recovery
3K → deployment/maintenance/operational UX
3N/3O → global + vertical restart/security/backup/topology proof
Realization Planning → exact packages, paths, systemd/reverse-proxy/Tailscale config,
                       ports/firewall, env names, DB GRANT/pools, backup scripts/timers,
                       restore commands, health endpoints, deployment workflow
```

## 14. Fable mandate

Reconstruct authority independently and attack:

1. whether the three-package decomposition is correct;
2. any missing 3A-R6 mandatory item;
3. whether single-host/one-Hub-process is justified or smuggled preference;
4. whether colocated Postgres/stores is global maximum or premature;
5. whether on-prem vs VPS/cloud must be frozen before C-018 and what evidence decides it;
6. tailnet-only HTTPS/no-public-ingress viability for first internal production;
7. whether E2B can remain Hub-outbound without new public inbound surface;
8. whether MAR needs any extra deployment unit;
9. backup-set omissions, especially Blob/CredentialBackend/Release bytes;
10. `mastra_builder` lower durability vs `mastra_par` backup requirement;
11. extending B2 vs shared failure/credential concerns;
12. root/recovery-key separate-compromise-path law;
13. platform deploy vs Product Promotion separation;
14. bounded initial downtime/maintenance;
15. out-of-band emergency stop without new durable entity;
16. capability-level availability vs hidden partial-start complexity;
17. accidental 3M recovery decisions inside 3J;
18. accidental 3L technology pins inside 3J;
19. whether any HA/PITR/managed-service machinery is actually required now;
20. the **smallest and most logical candidate for 3J-01**.

Return:

```text
Material Findings
corrected Known / Inferred / Unknown / Deferred
corrected package decomposition
MUST DECIDE / DEFER SAFELY / REJECT F1
missing operator/environment evidence
smallest 3J-01 candidate + rationale
proof obligations
reopen triggers
anti-overengineering cuts
```

Append below, commit/push. **Do not update `LEDGER.md`, do not create 3J authority, do not touch product code.**