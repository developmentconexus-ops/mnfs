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

---

## 15. Fable independent review

**Method:** DevelopmentConexus Engineering Method v1.0.0. Authority reconstructed independently on **2026-08-17** from `AGENTS.md → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`: 3A-R6 §7 (3J critical path), C-005/C-006/C-008 (registry immutability; backup precedent incl. `pg_dump -Fc` + encrypted B2 via rclone + monthly restore-test + PITR-by-RPO-trigger; E2B boundary), C-012 (hub serves dist directly, `deployments/<project>/<digest>`, no Caddy F1 with named trigger), C-013 (Postgres-down = domain stops fail-closed; telemetry loss never alters execution), C-014 (environments, Promotion machinery, GitHub private canonical remote, maintenance-required window, forward-only production), C-015 (loopback-only bind, tailnet opt-in, public bind without TLS refuses startup, blob CAS + mechanized backup ordering: GC lock → `hub_control` dump FIRST → Project dumps enumerated from it → blobs + integrity manifest; restore-test validates whole manifest), C-016 (tailnet browser access = HTTPS mandatory, `.ts.net` cert), 3E-01 (single Hub migration lineage; `mastra_par` backup obligation F3E01-R1; `mastra_builder` deliberately lower durability), 3H-03/3H-R1 (same-process allowed; CX-RUNTIME-ISOLATION-01 split trigger), 3I-01 §13 (whole-Hub stop = 3J proof: ingress/process stop, fail-closed new work, in-flight boundary), 3I-02 (C4 compromise-path law; §12.2 two-sided recovery proof; root-key injection/runbook → 3J), 3I-04 §15 (signing-key deployment → 3J), 3I-05 (zones, T11 operational DB authority, T12 store isolation), 3I-R1, LEDGER post-3I routing tables. The dialogue was treated as challenger input only.

Verified canonical state matches §1. No prior authority is reopened by this review.

### 15.1 Verdict summary

The three-package decomposition **survives with corrected ownership** — it is the smallest correct shape because the three groups have genuinely different reopen classes (topology commitment / durable-truth survival / operational behavior), and both degenerate alternatives fail (§8's giant authority couples unrelated reopen triggers; per-bullet microdecisions are ceremony). Single-host + one Hub process is **derived, not preference** (F-3). Three Material Findings correct the intake before any 3J-01 draft: an unassigned 3A-R6 mandatory item (F-1), an attachment-biased backup set that misses digest-addressed serving bytes and stays silent on canonical-Git loss (F-2), and a missing backup-immutability property that leaves host compromise able to destroy recoverability (F-4). Two non-material corrections sharpen E2B phrasing and the host-loss seam (F-6, F-7). Smallest 3J-01 = Package A as scoped in §15.5, gated on the operator evidence of §15.6.

### 15.2 Material Findings

#### F-1 — “operational secret injection/custody” is a 3A-R6 MUST DECIDE with no owning package

```text
claim attacked     §7 decomposition covers every 3A-R6 §7 mandatory item
failure            3A-R6 mandates "platform operational secret injection/
                   custody"; §1 of this intake lists it; §7 assigns it to
                   NO package. Package A owns only backing PLACEMENT class;
                   Package C only implies secrets via boot prerequisites.
                   LEDGER routes three concrete obligations here: host
                   root/recovery-key injection/permissions/runbook (3I-02),
                   Hub token-signing-key deployment/rotation (3I-04 §15),
                   operational credentials custody expectations (3I-05 T11).
                   Unassigned, a coding actor invents host secret handling —
                   the exact §4 root cause this intake exists to close.
smallest fix       Package C explicitly owns the injection/boot-custody
                   boundary: which secret classes must be present at boot,
                   fail-closed absence behavior, injection primitive CLASS
                   (file/env/systemd-credential family), custody separation
                   from backup path (3I-02 C4 composition), rotation
                   responsibility. Package A keeps only physical placement
                   class of backings. Exact primitive/permissions/runbook =
                   Realization, as already routed.
```

#### F-2 — backup-set hypothesis is attachment-biased and silent on canonical Git loss

```text
claim attacked     §9 required set is complete
failures           (a) "Blob/CAS bytes required by live attachments" names
                   only the C-015 attachment store. But digest-addressed
                   serving bytes exist elsewhere: frontend dist under
                   deployments/<project>/<digest> (C-012), and any registry/
                   BrainPack compiled payload realized as file/CAS rather
                   than DB rows. C-014 freezes that Promotion NEVER rebuilds
                   and rollback = re-point to an EXISTING digest; builds are
                   not proven byte-identical reproducible. Losing dist bytes
                   for the active or any rollback-eligible Release breaks
                   SERVED_VERIFIED (digest served == expected) and silently
                   destroys rollback capability — that is authority-bearing
                   content, not cache.
                   (b) §9 classifies the LOCAL checkout as reconstructible
                   "when remote canonical Git survives" but never classifies
                   remote-canonical-Git loss itself. C-005 is git-first:
                   artifact source authority IS Git. GitHub-loss risk must
                   be explicitly accepted-with-trigger or cheaply covered.
smallest fix       replace the enumerated blob line with a CLASS rule:
                   "required = every digest-addressed byte class referenced
                   by live/admissible pointers (attachments, frontend dist,
                   file-realized registry/BrainPack payloads) that no
                   accepted source regenerates byte-identically; classes
                   realized as rows inside dumped databases ride the dumps;
                   the backup implementation must mechanically enumerate,
                   not hand-list." Default classification for active-Release
                   bytes = REQUIRED now; downgrade only if deterministic
                   byte-identical rebuild is later proven (named reopen).
                   For Git: 3J-02 must classify canonical-remote loss —
                   either explicit accepted residual with revisit trigger,
                   or a periodic git bundle into the same off-host set
                   (cheap, no new machinery). Decide there, not silently.
```

#### F-3 — single host + one Hub process: GLOBAL MAXIMUM confirmed, with the honesty condition stated

```text
claim attacked     §6 INFERRED 1–3 might be smuggled preference
test               does any CURRENT named requirement force >1 host or >1
                   process? Swept: E2B is already external (C-008); B2 is
                   already off-host (C-006); Sankhya reachability is a
                   network path question, not a host-count question; tailnet
                   HTTPS needs no LB; no measured availability/RPO≈0
                   requirement exists; 3H-03 explicitly allows Builder/PAR
                   same-process pending CX-RUNTIME-ISOLATION-01; 3D froze
                   modules != deployment units. Distributed placement adds
                   crossings/credentials/partial-failure domains (3I-05
                   surface growth) with zero paying consumer — the exact
                   3A-R6 REJECT class.
condition          the conclusion is conditional on operator acceptance of
                   the stated loss model: single failure domain + off-host
                   backup = RPO measured in backup cadence, RTO measured in
                   manual restore. 3J-01 must state this acceptance as an
                   explicit operator input (§15.6 item 4), not bury it.
                   Postgres/Mastra/Blob/CredentialBackend co-location on the
                   same host follows the same test: moving any store off-host
                   creates a new credential+network+custody surface with no
                   current consumer. CONFIRMED as GLOBAL MAXIMUM under that
                   acceptance; managed-PG/HA re-enter only by named trigger.
```

#### F-4 — J8 “independent/off-host copy” misses the backup-destruction failure class

```text
claim attacked     §5 J8 + §9 separation are sufficient for restore proof
failure            the B2 credential lives on the host (rclone). A host
                   compromise can therefore delete/overwrite the off-host
                   copies and THEN destroy the host — recoverability dies
                   with the same single compromise the backups exist to
                   survive. 3I-02 accepted full-Hub compromise as residual
                   for SECRET custody; it never accepted losing RESTORE
                   capability to the same event. C4 separates root key from
                   ciphertext; nothing yet separates backup WRITE authority
                   from backup DESTRUCTION authority.
smallest fix       freeze one property in 3J-02: "off-host backup copies
                   must survive compromise of every host-resident
                   credential — realized by provider-native immutability/
                   versioning/object-lock or append-only credential class,
                   no new machinery." Proof: destruction attempt with
                   host-held credential leaves a recoverable copy. B2 reuse
                   then stands (F-5): one already-approved provider, no new
                   platform, with the residual "B2 + host lost
                   simultaneously" stated as accepted risk with trigger.
```

#### F-5 — B2 reuse: correct, no hidden shared path once F-4 and the key law hold

```text
verified           root/recovery key + backup-encryption recovery material
                   must live outside the B2+host path (3I-02 C4; §9 already
                   separates them; the two-sided §12.2 proof must cover the
                   rclone/crypt key too — encrypted backups with the crypt
                   key ONLY on the lost host are not backups).
                   With F-4's immutability property, reusing the approved
                   B2 path is smaller than any second backup platform.
                   CONFIRMED.
```

#### F-6 — E2B property phrasing: freeze the negative, do not pre-pin the transport (non-material)

```text
issue              §6 INFERRED 5 / J5 say "outbound where possible" — a
                   preference wearing a property's clothes, and it quietly
                   pre-answers what 3L must prove (CX-SBX-E2B-01; guest
                   telemetry capability transport proof is routed to 3L
                   under 3I-02).
fix                3J freezes exactly: "no generic and no public Hub inbound
                   surface exists for sandbox traffic; any guest→Hub channel
                   is the already-admitted narrow Hub-minted capability path
                   and physically traverses either a Hub-outbound provider
                   channel or an explicitly bounded authenticated ingress."
                   Which transport actually carries required evidence = 3L.
                   If 3L forces a bounded authenticated ingress, J5 survives
                   unchanged; only "generic/public" was ever prohibited.
```

#### F-7 — host-loss honesty is triple-owned; assign the seam once (non-material)

```text
issue              J1 (A), restore honesty (B) and host-loss/manual-restore
                   honesty (C) overlap — a duplicate-authority seed.
fix                A states the failure domain + accepted loss class;
                   B quantifies RPO/RTO and what provably survives;
                   C owns the operational procedure boundary (what the
                   operator does on loss/restart). 3M keeps semantic
                   settlement (orphans, OUTCOME_UNKNOWN, restore-vs-owner-
                   histories truth — already 3A-R6 §11's list, not 3J's).
```

Additional correction folded into Package C: the emergency-stop property must add **independence from the served path** — the admin channel used to stop ingress/process cannot be only the same tailnet/Hub path being stopped; its physical class (on-prem console/physical access vs provider console) is decided by Package A's placement, so the C proof composes with A. No new entity, unchanged.

### 15.3 Corrected Known / Inferred / Unknown / Deferred

**KNOWN — additions/corrections (rest of §6 stands):**

```text
K11 hub serves frontend dist directly; reverse proxy (Caddy) is a named
    C-012 trigger, not F1 — MANAGED serving needs no extra deployment unit
K12 GitHub private remote is canonical Git (C-014); local checkout is
    derived; remote loss class must be explicitly decided (F-2b)
K13 backup mechanization precedent already frozen: GC lock → hub_control
    dump FIRST → Project dumps enumerated from it → blobs + integrity
    manifest; restore-test validates the whole manifest (C-015/C-006)
K14 public bind without TLS already refuses startup fail-closed (C-015);
    tailnet browser access is HTTPS-MANDATORY, not merely supported (C-016
    corrects intake KNOWN 4)
K15 Postgres down = domain stops fail-closed platform-wide (C-013); this
    is the floor for the §12 core-availability set
K16 registry compiled payloads are immutable authority (C-005); their
    physical realization (rows vs files) decides their backup class (F-2a)
```

**INFERRED — corrected set to carry into packages:**

```text
I1  single-host first topology                       (F-3, conditional)
I2  one Hub Node process; split only on 3L trigger   (F-3)
I3  co-located Postgres/Mastra/Blob/CredentialBackend (F-3)
I4  tailnet-only HTTPS, no public ingress            (stands; §15.6 ev. 6)
I5  E2B negative property, transport = 3L            (F-6 rewrite)
I6  B2 reuse + immutability property                 (F-4/F-5 rewrite)
I7  bounded maintenance windows; no blue-green       (stands; C-014 window
                                                      machinery already
                                                      exists for migrations)
I8  core fail-closed boot set + owner-local capability degradation via
    EXISTING laws — no partial-start machinery       (stands)
I9  active-Release digest bytes default REQUIRED in backup set until
    deterministic rebuild proven                     (F-2a, new)
I10 backup copies survive host-credential compromise (F-4, new)
I11 emergency-stop admin channel independent of the served path (new)
```

**UNKNOWN — the intake list stands; add:**

```text
company-network egress policy (E2B/model/Git/B2 reachable from on-prem?)
out-of-band console class available per placement candidate
B2 bucket immutability/versioning capability + who owns the B2 account
device feasibility: can all first users run Tailscale under company policy
canonical-Git loss risk acceptance vs bundle-mirror choice
```

**DEFERRED — confirmed, with owners/triggers already named:** DEDICATED physical (first real consumer), old-runtime drain (first runtime-affecting upgrade), PITR (C-006 RPO trigger), managed/replicated Postgres (measured need), reverse proxy (C-012 trigger), public ingress (named consumer), process split (CX-RUNTIME-ISOLATION-01), `mastra_par` upgrade-op detail (first relevant upgrade).

### 15.4 Corrected decomposition and classification

Three packages CONFIRMED, ownership corrected:

```text
Package A — First Production Topology, Placement & Ingress   → 3J-01
  as §7A, PLUS: backing placement class only (custody/injection moves out);
  E2B property in F-6 form; host-loss = failure-domain statement only (F-7)

Package B — Operational State, Backup & Restore              → 3J-02
  as §7B, PLUS: F-2 class rule + active-Release-bytes default; canonical-
  Git loss classification; F-4 immutability property; crypt-key coverage
  in the two-sided proof; restore-proof = mechanical restorability +
  minimum semantic checks (manifest + hub_control-as-index); deep
  restore-vs-owner-truth semantics stay 3M

Package C — Platform Lifecycle, Secrets, Emergency Stop & Availability → 3J-03
  as §7C, PLUS: F-1 secret injection/boot custody boundary; stop-path
  independence; host-loss operational procedure boundary (F-7)
```

Order A → B → C stands: B and C consume A's failure domain; C consumes B's pre-deploy backup obligation.

```text
MUST DECIDE (3J, property level)
  A: failure-domain/placement decision + single-host/single-process baseline
     + store co-location + tailnet-only HTTPS ingress + no-public-surface +
     E2B negative property + MANAGED serving path (no extra unit)
  B: backup set by class rule + non-reconstructible classification incl.
     active-Release bytes + mastra_builder tier + off-host immutability
     property + key/crypt-key separation + restore-proof ownership +
     first-launch RPO/RTO acceptance + pre-migration backup obligation
  C: boot prerequisites/fail-closed set + secret injection/custody class +
     deploy sequence + platform-deploy != Promotion + maintenance baseline +
     out-of-band independent stop + host-loss procedure honesty + minimum
     availability set + capability-local degradation via existing laws

DEFER SAFELY (named owner/trigger)         → §15.3 DEFERRED list
REJECT F1 absent trigger                   → §1 list, PLUS:
  readiness/health-orchestration framework, startup dependency-graph
  engine, backup-orchestrator product beyond script/timer class, secrets-
  manager service beyond file/systemd-credential class, monitoring stack
  beyond C-013 in-app surface, CDN, IaC platform requirement (host-rebuild
  manifest suffices F1), second backup provider, git mirror INFRASTRUCTURE
  beyond a bundle job if F-2b chooses coverage
```

### 15.5 Smallest 3J-01 candidate

**3J-01 — First Production Topology, Placement & Ingress** (Package A as corrected). Rationale: every other 3J decision consumes its failure domain; its content is one coherent reopen class (topology commitment); most ingress law is composition/citation of C-015/C-016, so the genuinely new decisions are few: failure-domain class, placement rule, single-host/single-process baseline, store co-location, E2B negative property, serving-path confirmation. Splitting it further would separate facts that share one reopen trigger; merging B or C into it would couple three different reopen classes. Structure follows the sharpened placement logic:

```text
freeze placement-independent properties first:
  single Linux host · single Hub process · co-located stores ·
  tailnet-only HTTPS · no public ingress · E2B negative property ·
  hub-serves-dist · out-of-band console REQUIRED (class per placement)

then decide placement by evidence rule, not preference:
  LAN-only Sankhya reachability OR on-prem custody mandate → company host
  neither → single cloud/VPS host is operationally simpler
  (always-on, remote hands, provider console)
  either choice must satisfy every frozen property above
```

If the §15.6 evidence shows both candidates satisfy every frozen property, the final A-vs-B pick may be recorded as a bounded operator gate inside 3J-01 (the F3B-R1 pattern) rather than re-litigated as architecture.

### 15.6 Missing operator/environment evidence (blocking 3J-01 ratification)

```text
1. Sankhya reachability: is the company instance cloud/public-API or
   LAN-only? (single biggest placement fact — decides tunnel/crossing)
2. custody mandate: any policy/LGPD/contract reason authoritative data and
   secrets must stay on company premises?
3. company host inventory: existing Linux server? specs, UPS, ISP,
   physical access, who administers?
4. accepted first-launch RPO/RTO: hours of data loss and downtime
   tolerable; who performs manual recovery (F-3 condition)
5. cloud acceptance: operator accepts hub_control + encrypted backings on
   a VPS provider? acceptable jurisdictions?
6. users/devices: how many employees in first use; can all run Tailscale
   under device policy; any first-vertical user outside tailnet reach?
7. company-network egress: E2B/model providers/GitHub/B2 reachable from
   the on-prem network without proxy interference?
8. B2 account: who owns credentials; bucket versioning/object-lock
   available on current plan? (F-4)
9. out-of-band console class per candidate (physical vs provider console)
10. ops budget: monthly cost ceiling + who is on-call
```

### 15.7 Proof obligations (for the three future authorities)

```text
A: no non-loopback HTTP listener; no public listener at all; HTTPS-only
   tailnet ingress serves control-plane and MANAGED surfaces; no sandbox-
   reachable generic inbound; store co-location matches declared inventory
B: two-sided restore proof (3I-02 §12.2) extended to the backup-crypt key;
   full-manifest restore-test on an independent machine (C-015 precedent);
   digest-addressed class enumeration is mechanical and complete against
   live pointers; destruction attempt with host-held credential leaves a
   recoverable copy (F-4); mastra_builder absence does not block restored
   platform start
C: boot without root key / hub_control fails closed with no partial
   authority; stop drill executes via channel independent of Hub app AND
   of the served tailnet path; platform deploy rehearsal shows pre-deploy
   backup + window + verify sequence; killing mastra_par / a Project DB /
   model provider fails exactly the owning surface honestly while core
   survives (C-013 floor respected)
```

### 15.8 Reopen triggers (candidate set for the packages)

```text
measured availability/scale need breaking single-host acceptance
operator rejects the stated RPO/RTO loss model
Sankhya reachability class changes (LAN↔cloud)
CX-RUNTIME-ISOLATION-01 proves unpartitionable state → process split
deterministic byte-identical rebuild proven → downgrade dist-bytes class
B2 cannot provide immutability/versioning class → backup provider decision
first real DEDICATED consumer → physical DEDICATED topology
first public-ingress consumer → ingress architecture re-enters
canonical-Git residual (if accepted) fires on provider incident/evidence
```

### 15.9 Closing block

```text
Material Findings                     = 4 (F-1, F-2, F-3-condition, F-4)
  F-1 unassigned mandatory item (secret injection/custody → Package C)
  F-2 backup set: class rule + active-Release bytes + Git-loss class
  F-3 single-host GM CONFIRMED but conditional on stated operator loss-
      model acceptance (condition must be explicit in 3J-01)
  F-4 backup-destruction failure class → immutability property in 3J-02
non-material corrections              = F-5 confirmed, F-6 E2B phrasing,
                                        F-7 host-loss seam, stop-path
                                        independence
decomposition                         = three packages CONFIRMED with
                                        corrected ownership; order A→B→C
single-host / one process / co-location = GLOBAL MAXIMUM under condition
tailnet-only HTTPS / no public ingress  = CONFIRMED (evidence item 6)
3J-01 candidate                        = Package A as §15.5
prior-authority reopen                 = NONE
new deployment machinery               = 0 (REJECT list extended §15.4)
3L/3M leakage found                    = none after F-6/F-7 corrections
```