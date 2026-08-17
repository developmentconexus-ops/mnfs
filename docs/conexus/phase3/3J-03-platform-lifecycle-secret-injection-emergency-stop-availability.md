# 3J-03 — Platform Lifecycle, Secret Injection, Emergency Stop & Availability

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3J — Deployment / Operations Architecture  
**Authority:** terceira decisão aprovada de 3J  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** não constitui C-018, não encerra 3J/Fase 3 e não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

A primeira instalação produtiva do Conexus opera com **um único processo de aplicação Hub** apoiado por contextos operacionais separados para backup/migration, startup/restart reconstruído de authority durável, secrets owner-scoped injetados apenas no consumer que precisa deles, deploy de plataforma com **uma única target revision identity** e maintenance fail-closed, whole-Hub emergency stop out-of-band que derrota toda camada de auto-start até liberação explícita do operador, e degradation capability-local quando seguro; `hub_control` incompatível/indisponível torna o Hub inteiro `NOT READY`, sem cached/latest fallback, HA fiction ou availability orchestrator.

---

## 1. Product guardrail

C-001 permanece a product vision authority. Esta decisão opera a primeira instalação sem redefinir Conexus como software Metal Nobre, appliance Sankhya, produto on-prem-only ou single-server forever.

```text
first installation simplicity = current evidence
future deployment topology     = Decision Loop on real consumer/failure class
```

---

## 2. Authority e provenance

Esta decisão compõe, sem reabrir, pelo menos:

- C-006 / C-014 — migration, maintenance, forward-only production e Promotion semantics;
- C-013 / 3C-13 — fail-closed authority persistence, audit/telemetry distinction e in-app operational status;
- 3G-06 — Gateway external-effect/`OUTCOME_UNKNOWN` truth;
- 3H-01 / 3H-02 — restart/re-drive from owner facts, `FRESH_BASE`, no fake continuation;
- 3I-01 — whole-Hub emergency-stop proof obligation;
- 3I-02 — owner-specific secret custody, root/KEK recoverability and no fallback credential;
- 3I-04 — Hub signing key only when DEDICATED exchange is enabled;
- 3I-05 — owner-scoped runtime persistence and operational credentials outside normal request authority;
- 3J-01 — first production placement/ingress/out-of-band admin seam;
- 3J-02 — recovery posture, backup contexts, RPO/RTO, checkpoint and recovery-key separation.

Review provenance não-autoritativa:

- `3J-FABLE-DIALOGUE-platform-lifecycle-secrets-stop-availability.md`.

Independent review returned:

```text
verdict = ACCEPT CANDIDATE
Material Findings = 3
3J-04 = NOT JUSTIFIED
RESTRUCTURE = NO
STOP = NO
```

Os três findings foram incorporados: all-layer emergency-stop hold, single target-revision identity across platform deploy, and incident classification for lost/corrupt previously-provisioned root/KEK while availability remains capability-local.

---

## 3. Root invariant

> **A first-production installation boots, stops, restarts and upgrades only from explicit durable authority and owner-scoped operational capabilities; core authority failure fails closed, optional dependency failure degrades only the owning capability when prior laws allow, and operational mechanisms never become second product/domain authority.**

---

## 4. Operational execution contexts

F1 keeps one Hub application process, but three execution classes:

```text
A. Hub application runtime
   → normal owner-scoped runtime capabilities
   → NO backup-admin / migration / recovery-master credential

B. bounded operational jobs
   → backup generation / timer
   → platform migration runner
   → exact least privilege for that operation
   → separate process invocation on same Linux VM
   → not a Hub module/service/domain

C. operator recovery/emergency context
   → Windows host / hypervisor / physical administration
   → recovery material only when required
   → never browser/product authority
```

`pg-boss` remains domain-job substrate and is **not** reused for backup/migration administrative jobs because those credentials must stay outside normal Hub runtime and must remain operable when Hub request processing is unhealthy.

Exact OS timer/process manager is Realization Planning.

---

## 5. Secret injection / custody

### 5.1 Owner-scoped consumer law

```text
Git credential           → GitInfra/control side
E2B credential           → CodingRuntime/control side
model credential         → model adapter/control side
Connection root/KEK      → trusted Connections/Gateway custody path
B2 application key       → backup operational job
migration DB capability  → migration operational job
Hub signing key          → token issuer only when DEDICATED exchange enabled
```

No generic `SecretService`, global secret bag or general `getSecret()` authority.

### 5.2 Injection properties

Secret bytes must not originate from or deliberately propagate to:

```text
Git / repository / artifact / Release
browser/client
E2B guest
hub_control domain rows
command-line arguments
logs / telemetry / diagnostic dumps
unnecessary child processes
```

Whatever exact mechanism Realization chooses, secret material must be readable only by the owning execution context's OS identity/permission class and absent from process listings/diagnostic dumps in normal operation.

No fallback credential.

### 5.3 Missing/corrupt secret behavior

```text
missing/corrupt owner-scoped secret
→ owning protected capability fails closed
```

Examples:

```text
model key missing     → model-bearing Builder/PAR calls unavailable
E2B key missing       → Builder sandbox execution unavailable
Git key missing       → Git-dependent work unavailable
B2 key missing        → backup generation unavailable / recovery posture ages
DEDICATED signing key missing while no DEDICATED consumer enabled → no effect
```

A **previously-provisioned root/KEK or CredentialBackend backing that becomes missing/corrupt** is additionally an operational **INCIDENT-class signal**, distinct from ordinary capability degradation. Availability behavior remains capability-local: unaffected MANAGED/control-plane surfaces do not fail merely because Connection secret custody is unavailable.

Independent recovery material from 3J-02 is not a normal Hub-readable secret store.

---

## 6. Core startup/readiness and degradation

### 6.1 Whole-Hub authority floor

Normal product authority requires at least:

```text
exact compatible platform build
compatible hub_control schema
hub_control reachable
required core config / authority backing
valid private HTTPS ingress realization
```

If `hub_control` is unavailable/incompatible:

```text
Control Plane / MANAGED / Builder / PAR / Gateway normal work = NOT READY
-X-> cached/latest authority fallback
-X-> permissive offline mode
```

A minimal non-authoritative health signal may exist as Realization.

### 6.2 Capability-local matrix

```text
Project DB unavailable
→ affected Project data operations fail closed; unrelated Projects may continue

mastra_builder unavailable / E2B unavailable
→ Builder governed execution unavailable

Git provider unavailable
→ Git-dependent source/build work unavailable; existing active MANAGED serving unaffected

mastra_par unavailable
→ Production Agent execution/continuation unavailable; no fake continuation

model provider unavailable
→ relevant model-bearing call fails honestly; unrelated non-model work continues

CredentialBackend/root unavailable
→ affected secret-bearing Connection/Gateway operations fail closed
→ prior provisioned-loss/corruption also INCIDENT-class

enterprise provider unavailable
→ exact Gateway operation fails honestly

active Release bytes missing/corrupt
→ affected MANAGED Project cannot serve verified bytes; no rebuild/latest fallback

B2 unavailable
→ backup fails + recovery posture degrades; ordinary serving does not instantly stop

B2 unavailable + material migration/deploy requiring fresh checkpoint
→ migration/deploy path fails closed under 3J-02
```

Audit-required mutation still fails closed when mandatory AuditRecord cannot be recorded; ordinary Operational Telemetry remains degradable.

This matrix is descriptive composition of existing owner laws, **not** executable dependency graph, `HealthAuthority`, partial-start FSM or generic circuit-breaker platform.

For first internal use, whole-Hub-down detection may be human/operational observation. External SLA monitoring is a future named consumer, not F1 machinery.

---

## 7. Restart and shutdown

### 7.1 Normal restart

```text
process crash / VM reboot with intact durable storage
→ reopen from durable owner facts
→ rebuild runtime projections/contexts
→ revalidate current authority
→ never infer SUCCESS from process disappearance
→ never resume from transcript/runtime memory alone
```

Unexpected Hub exit is supervised by host-level service management. Crash loops remain visibly unavailable; no hidden infinite-restart success fiction.

Queued durable work survives shutdown according to existing owner/substrate semantics; bounded drain concerns synchronous/in-process work only.

### 7.2 Planned shutdown

```text
1. close new material admissions
2. stop accepting new Builder/PAR/Gateway work
3. bounded best-effort drain of synchronous/in-process work
4. fabricate no terminal outcome merely to drain
5. stop Hub application process
6. durable owner facts remain restart/recovery truth
```

Already-dispatched external effects are not undone by shutdown; Gateway/3M own ambiguity and settlement.

---

## 8. Platform deploy / upgrade

### 8.1 Platform deploy != Project Promotion

```text
Platform deployment
→ Conexus Hub code + hub_control platform schema + platform config/runtime deps

Project Promotion
→ exact Project Release + Project migration/composition/pointer/served verification
```

No `PlatformDeployment` domain record F1.

### 8.2 Exact revision identity

Every material platform deploy uses one exact canonical **target revision R** across staging, migration lineage, activated build and verification.

Mixed-revision deploy is not an admissible state.

### 8.3 Sequence

```text
1. verify current recovery posture satisfies 3J-02
2. if material hub_control schema change → verified off-host checkpoint
3. stage exact target revision R:
   ├── Hub build R
   └── ordered migration lineage R
4. close whole-Hub material admission / enter maintenance
5. bounded drain
6. stop Hub application process
7. run hub_control migration lineage OF R with dedicated migrator capability
8. activate/select Hub build R + compatible config
9. start under normal secret/readiness laws
10. run post-deploy structural/security/serving proofs appropriate to changed surface
11. reopen private ingress/admission only after proof passes
```

Failure:

```text
post-deploy proof fails
→ remain maintenance / NOT READY
```

Previous code may be manually selected only when demonstrably compatible with current schema/config. Incompatible migration forbids automatic old-code rollback; recovery is roll-forward or 3J-02/3M incident recovery.

Old Product Agent runtime coexistence/drain/cutover remains DEFER SAFELY until the first runtime-affecting post-production upgrade.

---

## 9. Backup operational execution

Backup uses context B, outside ordinary Hub application authority.

```text
OS-level timer/job class
→ bounded backup process
→ backup-only DB/storage credentials
```

Required operational outcomes:

```text
recovery posture age visible
stale beyond RPO <= 6h = unhealthy recovery posture
material operation requiring fresh verified checkpoint = fail closed when posture insufficient
```

No backup scheduler product/module.

---

## 10. Whole-Hub emergency stop

### 10.1 Property

> **An operator can prevent new Conexus ingress/execution through an out-of-band control independent from the healthy/authenticated Hub application path, and while emergency stop remains in force no configured auto-start layer may resurrect Conexus without explicit operator release.**

The hold applies across realization layers, including as applicable:

```text
Hub service supervision
Linux VM / hypervisor autostart
host power-on/reboot defaults
```

Exact mechanics are runbook/Realization.

### 10.2 Normal stop

```text
1. close/disable private Conexus ingress where feasible
2. suppress Hub automatic restart
3. stop Hub application process
4. prevent new Builder/PAR/Gateway/MANAGED admissions
5. preserve Postgres/local durable stores running when they are not themselves suspected
6. fabricate no terminal outcomes for in-flight work
7. keep every suppressed auto-start layer held
8. require explicit operator release before restart/reopen
```

### 10.3 Strong fallback

If guest/application cannot be trusted or normal stop cannot be enforced:

```text
Windows/hypervisor/physical control
→ disable/hold guest autostart
→ power off/suspend dedicated Linux VM
```

On later release/restart, normal readiness + DB crash recovery/3J-02 restore decision apply; 3M settles interrupted semantic work.

Emergency stop does not recall already-dispatched external effects.

No `EmergencyStop`, `SecurityHold`, `KillSwitch` domain entity/module. Selective per-Project serving stop remains Decision Loop on a proven incident class.

---

## 11. Availability claims / non-claims

F1 claims:

```text
single-host manual-recovery installation
RPO <= 6h / RTO <= 8h
supervised Hub process restart
fail-closed core authority
capability-local honest degradation
out-of-band whole-Hub stop with explicit release
```

F1 does not claim:

```text
HA / zero downtime / automatic failover
multi-host continuity
exactly-once external execution
transparent runtime upgrade
provider-independent uninterrupted agents
public Internet SLA
```

---

## 12. Proof strategy

Future realization/qualification must falsify at least:

1. `hub_control` unavailable/incompatible → no normal product authority admitted;
2. missing model/E2B/Git/Connection secret → exact owning capability unavailable; no fallback/global credential;
3. migration/backup admin credential absent from ordinary Hub runtime capability set;
4. `mastra_par` failure → PAR unavailable without fake continuation while unrelated core can remain available;
5. E2B/Git/model failure → owning capability fails while valid unrelated MANAGED serving can continue;
6. active Release bytes missing → affected app refuses verified serving;
7. B2 outage → recovery posture degrades; serving is not fabricated as total outage;
8. B2 outage + material migration requiring fresh checkpoint → migration blocked;
9. process kill → supervised restart; durable work does not become SUCCESS from restart;
10. repeated crash-loop → visible unavailable state;
11. planned maintenance → admissions close before stop; sent effects are not narrated as cancelled;
12. platform deploy → one exact target revision spans checkpoint/staging/migration/activation/proof;
13. incompatible schema + new-build failure → no automatic incompatible old-code rollback;
14. emergency stop → Hub cannot auto-restart until explicit operator release;
15. host reboot while emergency stop in force → VM/Hub remain held;
16. untrusted/unresponsive guest → hypervisor/physical control can terminate VM independent of Hub/VPN web path;
17. root/KEK removed/corrupted after prior provisioning → Connection/Gateway secret-bearing paths fail closed + INCIDENT status while unrelated MANAGED serving can continue;
18. normal host restart with intact durable storage → runtime reconstructs from durable authority, not workstation/runtime memory.

---

## 13. Routing / defer / reject

### DEFER SAFELY

```text
DEDICATED physical deployment boundary
→ first real DEDICATED deployment

old Product Agent runtime coexistence/drain/cutover
→ first runtime-affecting upgrade after production

external outage/SLA monitoring
→ first real SLA/operational consumer
```

### Realization Planning

```text
systemd/cron/task runner exact choice
secret file/env/unit mechanism + permissions
Linux distro/hypervisor/service names
ports/firewall/private DNS/certificate mechanics
exact restart/backoff/drain timeout
migration commands/build staging layout
emergency-stop commands/runbook
```

### REJECT F1 absent trigger

```text
Kubernetes / service mesh / HA / automatic failover
blue-green/canary framework
availability orchestration/dependency graph
HealthAuthority / partial-start FSM
backup scheduler product
external Vault/KMS/HSM without named security/compliance trigger
PlatformDeployment domain record
EmergencyStop/SecurityHold/KillSwitch domain record
internal PKI service / monitoring platform only for optionality
```

---

## 14. Completeness candidate

3A-R6 3J MUST DECIDE ownership is now:

```text
3J-01 → topology / placement / process/store baseline / E2B ingress negative / MANAGED serving / TLS-ingress
3J-02 → backup ownership / required recovery set / RPO-RTO / restore proof
3J-03 → secret injection/custody / startup-shutdown-restart / platform deploy / emergency stop / host-loss operational boundary / minimum availability
```

The two 3A-R6 deferred items remain deferred with explicit triggers.

```text
3J-04 = NOT JUSTIFIED
next = 3J-R1 bounded final closure
```
