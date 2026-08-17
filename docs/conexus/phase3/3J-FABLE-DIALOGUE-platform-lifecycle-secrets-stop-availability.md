# 3J Fable Dialogue — Platform Lifecycle, Secret Injection, Emergency Stop & Availability

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3J — Deployment / Operations Architecture  
**Candidate:** `3J-03 — Platform Lifecycle, Secret Injection, Emergency Stop & Availability`  
**Purpose:** converge the final material 3J package after approved 3J-01 and 3J-02. Do not create authority or product code from this file.

---

## 1. Canonical state to reconstruct

Read `AGENTS.md` and canonical authority independently.

Expected state after current operator ratification:

```text
3A-R6 = APPROVED
3B..3I = CLOSED / APPROVED
3J-01 = APPROVED
3J-02 = APPROVED
3J = IN PROGRESS
```

3J-01 already owns:

```text
first production = company server → dedicated Linux VM
one Hub application process
co-located Postgres/Mastra/backings
private LAN/VPN + HTTPS
no public ingress
single failure domain accepted
out-of-band administration seam required
```

3J-02 already owns:

```text
class-based recovery set
RPO <= 6h / RTO <= 8h
B2/off-host immutability property
pre-production + periodic full restore proof
independent recovery-material path
reissuable operational credentials NOT in backup
pre-migration verified recovery checkpoint
```

3J-03 must finish:

```text
platform operational secret injection/custody
startup / shutdown / restart expectations
service supervision
material Hub deploy/upgrade sequence
backup/migration operational execution contexts
whole-Hub emergency-stop physical procedure
host-loss/restart operational boundary
minimum availability/degradation behavior
```

It must NOT invent semantic recovery state owned by 3M or technology proofs owned by 3L.

---

## 2. Product guardrail

C-001 remains product vision authority.

This package operates the first Conexus installation without redefining the product as:

```text
Metal Nobre software
Sankhya appliance
on-prem-only product
single-server forever
```

First-installation operational simplicity is evidence, not future deployment doctrine.

---

## 3. Root invariant

> **The first production installation must boot, stop, restart and upgrade from explicit durable authority and owner-scoped operational capabilities; unavailable dependencies fail only the surfaces they actually own where safe, whole-Hub authority failure fails closed, emergency stop remains out-of-band, and no operational mechanism becomes a second product/domain authority.**

Failure classes to prevent:

```text
Hub starts against missing/stale authority and serves anyway
missing secret silently falls back to global credential
migration/backup admin credential becomes ordinary Hub runtime power
process crash marks durable work successful or forgets it
service supervisor restarts a malicious Hub after emergency stop
platform deploy is confused with Project Promotion
failed platform migration auto-rolls back into incompatible code/schema
provider outage brings down unrelated platform surfaces by architecture fiction
partial availability invents a health orchestration framework
restore/restart resumes work from runtime memory instead of owner facts
```

---

## 4. Operational execution contexts

F1 keeps one **Hub application process**, but not one OS process for all operations.

Three execution classes are sufficient:

```text
A. Hub application runtime
   → normal owner-scoped DB capabilities
   → named Git/E2B/model/Connection/runtime capabilities as already approved
   → NO migration/restore/master-backup administration credential

B. bounded operational jobs
   → backup generation/timer
   → platform migration runner
   → exact least privilege for that operation
   → separate process invocation/job context on same production VM
   → not a Hub module/service/domain

C. operator recovery/emergency context
   → out-of-band host/hypervisor/physical administration
   → restore/recovery material only when required
   → never normal browser/app authority
```

No daemon/service decomposition is implied. Exact process runner/system manager is Realization.

Why B matters:

```text
backup credential / migrator capability
-X-> ordinary Hub runtime credential set
```

This composes 3I-05 least privilege with 3J-02 operational recovery.

---

## 5. Secret injection / boot custody candidate

### 5.1 General law

Operational secrets enter only the trusted consumer that owns their physical use.

```text
Git credential        → GitInfra/control side
E2B credential        → CodingRuntime/control side
model credential      → model adapter/control side
Connection root/KEK   → trusted Connections/Gateway custody path
B2 application key    → backup operational job
migration DB capability → migration operational job
Hub token-signing key → token issuer only when DEDICATED exchange is enabled
```

Same-process Hub does not claim process-level isolation between in-process adapters; full trusted-Hub compromise remains the accepted 3I residual. The architecture still avoids generic `SecretService`, global fetch API or shared secret bag as authority.

### 5.2 Injection property

Secret bytes must not be sourced from:

```text
Git/repository
Release/artifact payload
browser/client
E2B guest
domain rows
command-line arguments
logs/telemetry
```

They arrive through an OS/runtime-protected production injection class, outside canonical source, with exact file/supervisor/environment mechanism deferred to Realization.

Implementation must prove no deliberate propagation to untrusted child/guest context and safe diagnostics.

### 5.3 Missing secret behavior

No fallback credential.

```text
missing/corrupt owner-scoped secret
→ owning capability unavailable/fails closed
```

It does **not** automatically require whole-Hub shutdown when unrelated authority can operate safely.

Examples candidate:

```text
model key missing     → model-bearing Builder/PAR calls unavailable
E2B key missing       → Builder sandbox execution unavailable
Git key missing       → Git-dependent Builder/integration operations unavailable
Connection root key missing → secret-bearing Connection/Gateway operations unavailable
B2 key missing        → backup generation unavailable/recovery posture degrades
DEDICATED signing key missing while no DEDICATED consumer enabled → no effect
```

Any secret required for a currently enabled protected surface fails that surface closed.

### 5.4 Recovery material

Independent recovery copy from 3J-02 is not a normal Hub-readable secret store.

Current operational key copies required by runtime may exist on the trusted production host; the **independent recovery copy** remains outside the production-host/B2 single loss path.

Exact operator custody/retrieval ceremony = Realization.

---

## 6. Core startup/readiness candidate

No new durable readiness FSM.

### 6.1 Whole-Hub authority floor

Normal Hub/MANAGED serving requires at least:

```text
production config identity
compatible Hub platform build
compatible hub_control schema
hub_control authority DB reachable
required local authority/content backing for the requested surface
private HTTPS ingress realization valid
```

If `hub_control` is unavailable/incompatible:

```text
normal Control Plane / MANAGED / Builder / PAR / Gateway work = NOT READY
-X-> cached/latest authority fallback
```

A minimal unauthenticated/administrative health signal may exist as Realization; it never serves product authority.

### 6.2 Capability-local availability

After core authority is healthy, optional/owner-specific dependencies fail only relevant capabilities when prior laws permit it.

Candidate matrix:

```text
Project DB unavailable
→ affected Project query/action/job fails closed
→ unrelated Projects/control-plane may continue

mastra_builder unavailable
→ Builder governed execution unavailable
→ other Hub surfaces continue

E2B unavailable
→ Builder sandbox work unavailable

Git provider unavailable
→ Git-dependent Builder/source operations unavailable
→ existing active MANAGED Release serving unaffected

mastra_par unavailable
→ Production Agent execution/continuation unavailable
→ no fake completion/resume

model provider unavailable
→ relevant model-bearing call fails honestly
→ non-model platform operations continue

CredentialBackend backing/root unavailable
→ affected secret-bearing Connection/Gateway operation fails closed

specific external enterprise provider unavailable
→ exact Gateway operation fails honestly

active Release bytes missing/corrupt
→ affected MANAGED Project cannot be served as verified
→ no rebuild/latest fallback

B2/backup provider unavailable
→ backup generation fails + recovery posture degrades
→ ordinary serving does not instantly stop solely for one backup failure
```

Audit-required mutation remains fail-closed if mandatory AuditRecord cannot be recorded; ordinary Operational Telemetry remains degradable per 3C-13/C-013.

### 6.3 No availability orchestrator

Do not create generic dependency-graph/startup orchestrator, HealthAuthority, circuit-breaker platform or partial-start FSM.

Owners/adapters enforce their existing boundaries and expose derived operational status sufficient for diagnosis.

---

## 7. Normal restart semantics

### Process crash / VM reboot with intact durable storage

```text
restart
→ reopen from durable owner facts
→ rebuild runtime projections/contexts
→ revalidate current authority
→ never infer SUCCESS from process disappearance
→ never resume from transcript/runtime memory alone
```

Non-terminal work remains non-terminal until its owner/3M recovery semantics say otherwise.

Service supervision property:

> **Unexpected Hub process exit is supervised/restarted by host-level service management; repeated crash-loop remains visibly unavailable rather than an infinite hidden restart loop.**

Exact restart policy/backoff/service manager = Realization.

Normal physical-host reboot should admit deterministic restart of the production VM/services without rebuilding authority from scratch. Exact VM autostart/operator step is Realization as long as RTO contract remains achievable.

### Host/data loss

```text
3J-02 restore
+ re-provision reissuable operational credentials
+ supply authorized recovery/key material
+ start under this package
+ 3M settles interrupted semantic work
```

No automatic failover claim.

---

## 8. Planned shutdown / maintenance boundary

Single-host F1 accepts bounded maintenance downtime.

Candidate shutdown class:

```text
1. close new ingress/admission for material work
2. stop accepting new Builder/PAR/Gateway work
3. bounded best-effort drain of currently synchronous/in-process work
4. commit no fictitious terminal outcome merely to drain
5. stop Hub application process under supervisor
6. durable owner state remains source for later restart/3M settlement
```

Do not wait indefinitely for external/provider work.

Already-dispatched external effects are not undone by shutdown; `OUTCOME_UNKNOWN`/settlement remains Gateway/3M truth.

Exact drain timeout is Realization calibration.

---

## 9. Platform deploy / upgrade candidate

### 9.1 Platform deploy != Project Promotion

```text
Platform deployment
→ Conexus Hub code
→ hub_control platform schema lineage
→ platform config/runtime dependency versions

Project Promotion
→ one Project exact Release
→ Project DB migration/composition/pointer/served verification
```

Never use Project Promotion as Hub deploy state and never infer Project Release authority from host/Git deployment status.

No `PlatformDeployment` domain record is required F1; exact Git/build identity + migration/audit/ops evidence are sufficient unless later proof shows otherwise.

### 9.2 Exact platform identity

Production deploys an exact identified canonical product revision/build, never dirty workstation state.

F3B-R1 remains mandatory before post-C-018 Realization Planning chooses the canonical product repo/cutover.

### 9.3 Material deploy sequence

Smallest single-host maintenance sequence:

```text
1. verify current recovery posture satisfies 3J-02
2. if platform/hub_control material schema change → create required verified off-host checkpoint
3. enter whole-Hub maintenance admission closure
4. bounded drain under §8
5. stop Hub application process
6. run ordered hub_control migration lineage with dedicated migrator capability
7. install/select exact new platform build + compatible config
8. start Hub under normal secret/readiness laws
9. run post-deploy structural/security/served checks appropriate to changed surface
10. reopen private ingress/admission only after proof passes
```

Package/build preparation may happen before downtime; exact mechanics are Realization.

### 9.4 Failure / rollback honesty

```text
post-deploy proof fails
→ remain in maintenance/not-ready
```

If previous platform build is demonstrably compatible with current schema/config, bounded manual code rollback may select the previous exact build.

If a migration crossed compatibility:

```text
-X-> automatic code rollback into incompatible schema
→ roll-forward repair OR incident restore/recovery under 3J-02/3M
```

No generic automatic rollback engine.

Old Product Agent runtime coexistence/drain/cutover remains DEFER SAFELY until the first real runtime-affecting post-production upgrade per 3A-R6/3H.

---

## 10. Backup timer / operational health

Backup execution uses a bounded operational job context, not ordinary Hub application authority.

Required operational behavior:

```text
schedule/timer survives independently of Hub request traffic
backup success/failure is externally observable to existing operations status
recovery posture age is visible
stale beyond RPO <= 6h = unhealthy recovery posture
```

One failed backup does not automatically stop normal app serving. Operations requiring a fresh verified checkpoint (notably material migration/deploy paths where 3J-02 says so) fail closed when posture is insufficient.

External paging/SMS/email/alerting channel remains consumer-gated through existing integration/notification decisions; in-app operational status is sufficient F1 baseline.

No backup scheduler product/module.

---

## 11. Whole-Hub emergency stop candidate

3I-01 requires a physical operational fallback before production.

### 11.1 Property

> **An operator can prevent new Conexus ingress/execution through an out-of-band control independent from the healthy/authenticated Hub application path, and the stop cannot be silently defeated by normal service auto-restart.**

For current on-prem placement, admissible control layers include:

```text
Linux service supervision from admin context
Windows host / hypervisor control
physical host access as last resort
```

Exact commands = runbook/Realization.

### 11.2 Normal whole-Hub stop

```text
1. close/disable private Conexus ingress where feasible
2. stop Hub application service through supervisor so automatic restart is suppressed
3. prevent new Builder/PAR/Gateway/MANAGED admissions
4. preserve PostgreSQL/local durable stores running when safe for custody/forensics
5. do NOT fabricate terminal outcomes for in-flight work
6. explicit operator release is required before restarting/reopening
```

### 11.3 Strong fallback

If guest/application cannot be trusted or normal stop cannot be enforced:

```text
out-of-band hypervisor/physical control
→ power off/suspend dedicated Linux VM
```

This is emergency containment, not routine shutdown. It may leave interrupted work requiring 3M settlement and normal DB crash recovery/restore proof.

### 11.4 Boundary

Emergency stop does not claim to recall external effects already dispatched.

No `EmergencyStop`, `SecurityHold`, `KillSwitch` domain record/module is created.

Selective per-Project serving stop remains Decision Loop only on proven incident class where whole-Hub stop is unacceptable.

---

## 12. Availability claims / non-claims

F1 claims:

```text
single-host manual-recovery installation
RPO <= 6h / RTO <= 8h
supervised Hub process restart
fail-closed core authority
capability-local honest degradation where boundaries allow
out-of-band whole-Hub stop
```

F1 does NOT claim:

```text
HA
zero downtime
automatic failover
multi-host continuity
exactly-once external execution
transparent runtime upgrade
provider-independent uninterrupted agents
public Internet availability SLA
```

An availability requirement outside this class is a reopen trigger, not hidden future machinery.

---

## 13. Proof obligations

Fable should attack and future realization must falsify at least:

```text
1. hub_control unavailable/incompatible
   → no normal product authority/serving admitted

2. missing model/E2B/Git/Connection secret
   → exact owning capability unavailable; no fallback/global credential

3. migration/backup admin credential
   → absent from ordinary Hub application runtime capability set

4. mastra_par failure
   → PAR unavailable without fake continuation; Control Plane still functions if core authority intact

5. E2B/Git/model failure
   → Builder or model surface fails while existing unrelated MANAGED serving remains valid

6. active Release bytes missing/corrupt
   → affected app refuses verified serving; no rebuild/latest fallback

7. B2 outage
   → backup job fails/recovery posture ages; ordinary serving does not instantly fabricate total outage

8. process kill
   → supervisor can restart; durable work does not become SUCCESS solely from restart

9. repeated crash-loop
   → visible unavailable state; not hidden infinite restart success

10. planned maintenance
   → new admissions closed before Hub stop; already-sent external effects not narrated as cancelled

11. platform deployment
   → exact product revision + ordered hub migration; ingress remains closed until post-deploy proof

12. incompatible migration + new-build failure
   → no automatic old-code rollback across incompatible schema

13. emergency stop through supervisor
   → Hub cannot auto-restart until explicit operator release

14. malicious/unresponsive guest
   → out-of-band host/hypervisor stop terminates Linux VM independently of Hub/VPN web path

15. stopped Hub
   → no new Conexus work admitted; in-flight semantic settlement remains 3M

16. normal host restart with intact storage
   → reconstructs runtime from durable authority, not workstation/transcript/runtime-memory state

17. secret injection
   → no secret source in Git/browser/E2B/domain rows/argv/logs; no deliberate untrusted inheritance

18. backup job
   → uses backup-specific capability without broad Hub-runtime DB/admin authority
```

---

## 14. DEFER / REJECT

### DEFER SAFELY

```text
DEDICATED physical deployment/provisioning
→ first real DEDICATED deployment

old Product Agent runtime coexistence/drain/cutover
→ first runtime-affecting upgrade after production

external alerting/paging channel
→ first real operational recipient/SLA need

selective per-Project emergency serving stop
→ incident proves whole-Hub stop operationally unacceptable
```

### REJECT F1 absent trigger

```text
Kubernetes
service mesh
multi-region/active-active
HA/automatic failover
horizontal Hub scale
fleet scheduler
blue-green/canary framework
generic deployment orchestrator
PlatformDeployment domain FSM
startup dependency-graph engine
HealthAuthority / generic availability policy engine
Redis merely for health/rate-limit
external Vault/KMS/HSM
secret-manager service
backup scheduler product
mandatory Prometheus/Grafana/Sentry/OTel Collector stack
zero-downtime platform deploy requirement
second Hub process for module purity
```

---

## 15. Routing after 3J-03

```text
3L
→ CX-SBX-E2B-01
→ CX-BUILDER-MASTRA-01
→ CX-AGENT-MASTRA-01
→ CX-RUNTIME-ISOLATION-01
→ model-spend interception/usage/cost
→ Verification Observability
→ load-bearing Mastra restore/upgrade behavior where needed

3M
→ orphan/lost ActorRun/AgentRun
→ OUTCOME_UNKNOWN settlement
→ Promotion partial failure/recovery
→ post-emergency-stop semantic settlement
→ owner histories after restore/restart

3K
→ operator-visible maintenance/status/product UX where first vertical needs it

Realization Planning
→ hypervisor/systemd/service manager
→ secret files/credentials/env spelling
→ Linux user/group permissions
→ ports/firewall/TLS/DNS
→ backup timers/scripts
→ platform build/deploy commands
→ migration commands
→ emergency runbook exact commands
→ health endpoints
```

---

## 16. Candidate outcome

```text
one Hub application process = PRESERVED
operational backup/migration job contexts = REQUIRED class, not services/modules
normal Hub receives backup/migrator/admin credentials = NO
hub_control unavailable = whole Hub NOT READY
capability-local dependency failure = honest local degradation where safe
secret missing = fail owning capability closed; no fallback
platform deploy = bounded whole-Hub maintenance baseline
platform deploy != Project Promotion
exact platform revision required = YES
pre-migration verified off-host checkpoint = REQUIRED
post-deploy proof before reopening = REQUIRED
automatic rollback across incompatible migration = REJECT
normal process restart = supervisor-managed + durable-owner re-entry
whole-Hub emergency stop = out-of-band supervisor/host control REQUIRED
auto-restart defeating stop = FORBIDDEN
strong containment = power off dedicated Linux VM if necessary
new emergency-stop entity = 0
new health/deploy module = 0
HA/zero-downtime = 0
```

If Fable finds no material gap after corrections, next step is one bounded `3J-R1 — Deployment / Operations Architecture Final Closure`.

---

## 17. Fable mandate

Reconstruct authority independently. Attack especially:

1. whether three operational execution contexts preserve one-Hub-process law without smuggling a service architecture;
2. whether backup/migration credentials are correctly excluded from ordinary Hub runtime;
3. whether missing Connection root/KEK should degrade only Connection/Gateway surfaces or must block whole Hub boot;
4. which exact dependencies are true whole-Hub readiness prerequisites versus capability-local;
5. whether `hub_control unavailable => NOT READY` is sufficient and coherent with C-013;
6. whether capability-local degradation risks a hidden partial-start orchestration engine;
7. whether host-supervised restart + durable re-entry is correct without creating retry/recovery semantics owned by 3M;
8. planned shutdown/drain boundary vs already-dispatched external effects;
9. platform deploy sequence, especially migration ordering and recovery-checkpoint requirement;
10. whether code rollback after platform migration is too permissive or correctly compatibility-gated;
11. exact separation Platform deploy != Project Promotion;
12. first runtime-affecting Product Agent upgrade trigger remains properly deferred;
13. backup timer outside Hub runtime vs pg-boss/Hub scheduler reuse — challenge accidental mechanism duplication;
14. secret injection property: whether forbidding argv/Git/domain/client is sufficient without prematurely pinning systemd Credentials/Vault;
15. distinction active operational key copy vs independent recovery copy;
16. Hub token-signing key should not become mandatory before DEDICATED consumer;
17. emergency stop must defeat normal auto-restart and remain independent of VPN/Hub path;
18. whether preserving Postgres during normal emergency stop is safe/default or over-specific;
19. whether hypervisor power-off fallback is proportional and what recovery truth it creates;
20. whether availability matrix leaks semantics into 3M or product UX into 3K;
21. whether in-app operational status is enough F1 without external paging;
22. any missing 3A-R6 3J MUST item after 3J-01/02/03;
23. whether 3J can close after this package or needs a fourth material decision;
24. preserve C-001 product vision: current on-prem ops must not become universal product topology/lifecycle law.

Return:

```text
Material Findings
corrected whole-Hub vs capability-local availability matrix
secret/operational-context corrections
platform deploy corrections
emergency-stop corrections
3J vs 3L/3M/3K routing
anti-overengineering cuts
3J-04 justified? YES/NO
verdict = ACCEPT CANDIDATE | RESTRUCTURE | STOP
```

Append to this dialogue, commit/push. Do not create `3J-03` authority, do not close 3J, do not touch product code.

---

## 18. Fable independent review

**Method:** DevelopmentConexus Engineering Method v1.0.0. Authority reconstructed independently on **2026-08-17** from `AGENTS.md → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`: C-002 (pg-boss as Hub job substrate), C-006 (transactional-only migration; maintenance-required drain law for Project migrations; forward-only production), C-013 (Postgres down = domain stops fail-closed; persist-first admission ledger; in-app alarm baseline, external alerting gated), C-014 (Promotion machinery; maintenance windows; migration QA gates), C-015 (public-bind-without-TLS refuses startup; low-disk watermark), 3G-06 (OUTCOME_UNKNOWN Gateway truth), 3H-01/3H-02 (FRESH_BASE; PAR re-drive from durable facts; no fake resume), 3I-01 §13 (whole-Hub stop obligation: ingress/process stop, fail-closed new work, in-flight boundary), 3I-02 (root/KEK custody; E6 fail-closed missing root; accepted trusted-host residual), 3I-04 §15 (signing key operational, needed only when exchange enabled), 3I-05 (T11 operational DB authority out of request runtime; §14.4 migration authority separate), 3J-01 (out-of-band admin seam independent of served path), 3J-02 (recovery posture; pre-migration checkpoint; regenerable-secret class), LEDGER post-3J-02. Dialogue treated as challenger input only. Canonical state matches §1.

### 18.1 Verdict summary

**ACCEPT CANDIDATE** — with one genuinely material finding (the emergency-stop property stops one layer too high: VM autostart can resurrect a contained Hub, F-1), one ordering precision that prevents a real implementer error in the deploy sequence (F-2), and one custody-visibility correction for missing root/KEK (F-3). The three execution contexts, the credential exclusions, the availability floor/matrix, the deploy≠Promotion separation and the DEFER/REJECT lists all survive attack. **3J-04 justified? NO** — after 3J-01/02/03 every 3A-R6 §7 mandatory item has an owner (checklist at 18.7); the correct next step is `3J-R1` bounded closure.

### 18.2 Material Findings

#### F-1 — MATERIAL: emergency stop must defeat every auto-start layer, not only service supervision

```text
claim attacked     §11.1 property + §11.3 fallback are complete
failure            the property forbids "silently defeated by normal
                   service auto-restart" and §11.2 suppresses the SERVICE
                   supervisor. But the same failure class recurs one layer
                   down: §7 admits VM autostart so normal host reboots
                   restart production deterministically. Then: operator
                   powers off the Linux VM for containment (§11.3) →
                   Windows host later reboots (patch/power) → hypervisor
                   autostart resurrects the VM → supervisor inside starts
                   the Hub → the emergency stop is silently defeated by
                   exactly the mechanism §3 lists as a failure class, one
                   layer below where the candidate looked.
smallest fix       extend the §11.1 property: "…and the stop cannot be
                   silently defeated by ANY configured auto-start layer —
                   service supervision, VM/hypervisor autostart, or host
                   power-on defaults." §11.3 containment therefore includes
                   marking the VM stopped-held/autostart-disabled at the
                   hypervisor layer; §11.2 step 6's explicit operator
                   release applies to every layer that was suppressed.
                   Exact hypervisor mechanics = runbook/Realization.
proof addition     "host reboot while emergency stop is in force → Hub does
                   not return without explicit operator release" (18.6).
```

#### F-2 — MATERIAL (ordering precision): the migration step must run the exact target revision's lineage

```text
claim attacked     §9.3 sequence is implementable as written
failure            step 6 runs the hub_control migration lineage BEFORE
                   step 7 "install/select exact new platform build". The
                   migrations being run ARE part of the new revision; as
                   written, an implementer can read steps 5–7 as "run the
                   migrations available on the host, then fetch the new
                   build" — running the OLD tree's lineage or a mixed
                   state. §9.3's note ("preparation may happen before
                   downtime") implies the right answer without stating it.
smallest fix       rewrite step 6: "run the ordered hub_control migration
                   lineage OF THE EXACT TARGET REVISION (already staged
                   before downtime) with the dedicated migrator
                   capability"; step 7 becomes "activate/select that same
                   staged build". One revision identity spans steps 2–9;
                   mixed-revision deploys are not a state.
```

#### F-3 — MATERIAL (custody visibility): missing root/KEK where one previously existed is an incident signal, not quiet degradation

```text
claim attacked     §5.3 treats missing Connection root/KEK like any other
                   missing capability secret (mandate Q3)
adjudication       capability-LOCAL availability is CORRECT — the answer to
                   Q3 is "degrade only Connections/Gateway secret-bearing
                   surfaces", never whole-Hub boot: nothing else consumes
                   the KEK, 3I-02 E6 already fails those paths closed, and
                   blocking MANAGED serving because Connection custody is
                   degraded would fabricate coupling no authority created.
failure            but availability class != diagnostic class. A root key
                   that WAS present and is now missing/corrupt on a running
                   production host is a tamper/loss indicator for the
                   platform's most sensitive custody boundary. §5.3 as
                   written lets it surface as one more "capability
                   unavailable" row — operationally indistinguishable from
                   a missing model key.
smallest fix       one clause: "missing/corrupt previously-provisioned
                   root/KEK (or CredentialBackend backing) surfaces as an
                   operational INCIDENT state, distinct from ordinary
                   capability degradation, while availability behavior
                   remains capability-local." No new machinery — it is a
                   severity classification on the existing status surface.
```

### 18.3 Availability corrections (mandate Q3–Q6, Q20, Q21)

```text
floor (§6.1)        CONFIRMED complete and coherent with C-013's fail-closed
                    Postgres boundary; "no cached/latest authority fallback"
                    matches 3I-01 I8. Nothing belongs on the floor that is
                    not there; nothing there is capability-local.
matrix (§6.2)       CONFIRMED — every row traces to an existing owner law
                    (C-013 domain stop; 3H-02 no fake resume; C-014
                    SERVED_VERIFIED no-rebuild; 3I-02 E6; 3I-05 §6 adapters
                    fail closed; 3J-02 posture). Two additions:
                    (a) cross-reference the §10 rule INTO the matrix: "B2
                        unavailable + material migration required → the
                        migration path fails closed (3J-02 checkpoint law)"
                        — it is the one row where a capability outage blocks
                        an unrelated-looking operation, so it must be
                        visible in the matrix, not only in §10;
                    (b) F-3's incident classification for root/KEK.
no orchestrator     CONFIRMED — the matrix is a composition table of
(§6.3, Q6)          existing owner boundaries, not a dependency engine; the
                    REJECT list already kills HealthAuthority/partial-start
                    FSM. Keep the matrix descriptive, never executable.
in-app status (Q21) SUFFICIENT F1, matching C-013 (in-app alarm; external
                    channel consumer-gated). Add one honesty line: with the
                    Hub itself down, F1 detection is humans noticing —
                    acceptable for first internal use; an SLA/monitoring
                    requirement is a named reopen, not silent machinery.
3M/3K leakage (Q20) NONE — matrix rows state availability outcomes only;
                    settlement stays 3M, status UX stays 3K via §15.
```

### 18.4 Secret / operational-context corrections (Q1, Q2, Q13–Q16)

```text
three contexts (Q1) CONFIRMED — context B is not smuggled services: it is
                    the realization class REQUIRED by already-approved
                    authority (3I-05 §14.4 migration authority separate;
                    T11 operational credentials out of request runtime;
                    3J-02 backup credential separation). Bounded job
                    invocations on the same VM, no daemons/modules/domain.
credential
exclusion (Q2)      CONFIRMED. Note the backup credential's real power
                    (read-everything DB role + B2 write): its ONLY home is
                    context B; host compromise reaching it is the accepted
                    3I-02 residual, already mitigated at the backup plane
                    by 3J-02 immutability.
pg-boss reuse (Q13) REJECT reuse — and the decisive reason is credential
                    separation, not taste: a pg-boss-scheduled backup runs
                    INSIDE Hub application context with Hub runtime
                    credentials, which the exclusion law forbids; it also
                    dies exactly when the Hub is unhealthy. OS-level
                    timer/job class stands; exact mechanism Realization.
                    This is not mechanism duplication: pg-boss remains the
                    substrate for DOMAIN jobs; context B is not a queue.
injection (Q14)     SUFFICIENT without premature pinning. The §5.2 negative
                    list correctly omits environment variables from the
                    forbidden set — banning env would pin mechanism in the
                    other direction. Add the protection clause implied but
                    unstated: "whatever mechanism, secret material is
                    readable only by the owning execution context's OS
                    identity (file/unit permission class), and is absent
                    from process listings and diagnostic dumps."
key copies (Q15)    CONFIRMED distinct — operational copy on host for
                    runtime use; independent recovery copy outside the
                    host+B2 loss path (3J-02 §7). No correction.
signing key (Q16)   CONFIRMED — not a boot prerequisite while no DEDICATED
                    consumer is enabled (3I-04: exchange-enabled is the
                    condition); becomes required-for-that-surface only when
                    enabled. §5.3's row is exactly right.
```

### 18.5 Platform-deploy corrections (Q8–Q12)

```text
deploy != Promotion (Q11)  CONFIRMED clean both directions; no
                           PlatformDeployment record, matching AGENTS.md
                           (Git/CI own mechanical history) and 3A-R6.
sequence (Q9)              F-2 ordering fix; otherwise CONFIRMED — posture
                           check always (step 1), checkpoint on material
                           schema change (step 2, 3J-02 law), proof before
                           reopen (steps 9–10).
drain (Q8)                 CONFIRMED honest. Precision worth one line:
                           queued DURABLE work survives shutdown by design
                           (C-013 persist-first; pg-boss rows are durable)
                           — drain concerns only in-process synchronous
                           work, which §8 step 3 already says. C-006's
                           complete-drain law for maintenance-required
                           PROJECT migrations is a different, narrower
                           obligation owned by C-014/Promotion paths and
                           is unaffected by this package's bounded drain.
rollback (Q10)             CONFIRMED correctly compatibility-gated;
                           "demonstrably compatible" = a proof obligation
                           at Realization, not operator faith. Forward-
                           only across incompatible migration matches
                           C-006. No automatic engine.
old PAR runtime (Q12)      CONFIRMED still DEFER SAFELY on its 3A-R6
                           trigger; nothing in §9 pre-solves it.
```

### 18.6 Emergency-stop corrections (Q17–Q19) and proof additions

```text
Q17  F-1: the stop must defeat service supervision AND VM/hypervisor
     autostart AND host power-on defaults; independence from Hub/VPN path
     already holds via the 3J-01 admin seam (Windows host/hypervisor
     console + physical access).
Q18  preserving Postgres during a NORMAL emergency stop is the correct
     default-with-escape: it keeps custody/forensics and avoids needless
     crash recovery, while §11.3 remains available when the host/DB itself
     is suspect. Not over-specific — it is one sentence with a judgment
     clause, and the alternative (always power off) destroys evidence.
Q19  hypervisor power-off is proportional (existing layer, no machinery).
     Its recovery truth must be stated on restart: normal §6 readiness +
     DB crash recovery + operator decision whether 3J-02 restore/proof is
     needed + 3M settlement of interrupted work. Add that one line to
     §11.3 so "power off" never reads as consequence-free.

proof additions to §13:
19. host reboot during an in-force emergency stop → Hub does not return
    without explicit operator release (F-1)
20. platform deploy rehearsal proves single-revision identity across
    checkpoint→migration→activation→proof (F-2)
21. root/KEK removed from a provisioned host → Connections/Gateway fail
    closed AND operational status shows INCIDENT class, while MANAGED
    serving of unaffected apps continues (F-3)
```

### 18.7 3A-R6 §7 completeness check and routing (Q22, Q23)

Every 3A-R6 3J MUST DECIDE item now has an owner: deployment shape / single-host+split triggers / monolith+PG+Mastra placement / E2B connectivity / MANAGED serving / TLS-ingress → **3J-01**; backup ownership+set / restore-proof responsibility → **3J-02**; secret injection+custody / startup+shutdown+restart / material deploy sequence / whole-Hub emergency stop / host-loss honesty / minimum availability set → **3J-03** (host-loss seam split across 01/02/03 as adjudicated in the intake review). The two 3A-R6 DEFER items (DEDICATED physical; old-PAR drain) remain deferred with triggers. §15 routing is clean: no 3M semantics inside the matrix, no 3L technology pins (Mastra restore behavior correctly routed), no 3K UX. Anti-overengineering: §14 REJECT list CONFIRMED; nothing new needed beyond it.

```text
3J-04 justified? = NO
next step        = 3J-R1 — Deployment / Operations Architecture Final
                   Closure (bounded), after F-1/F-2/F-3 are folded into
                   the consolidated 3J-03 text
```

### 18.8 Closing block

```text
Material Findings                  = 3
  F-1 stop must defeat every auto-start layer (VM autostart resurrection)
  F-2 single-revision identity across the deploy sequence
  F-3 root/KEK loss = incident class; availability stays capability-local
availability corrections           = matrix + B2-blocks-migration row;
                                     incident classification; honesty line
                                     on whole-Hub-down detection
secret/operational-context corr.   = pg-boss reuse REJECTED on credential-
                                     separation grounds; injection
                                     protection clause; env not banned
platform-deploy corrections        = F-2; drain precision (durable queued
                                     work survives; C-006 Project drain law
                                     unaffected)
emergency-stop corrections         = F-1 layered property; §11.3 restart
                                     truth line; Q18 default confirmed
routing corrections                = none material; §15 stands
anti-overengineering cuts          = §14 stands; matrix stays descriptive,
                                     never an engine
3J-04 justified?                   = NO — 3A-R6 coverage complete; 3J-R1 next
prior authority reopen             = NONE

verdict = ACCEPT CANDIDATE
          with F-1/F-2/F-3 folded into the consolidated 3J-03 text before
          operator ratification; ID, LEDGER and 3J closure remain with the
          operator
```
