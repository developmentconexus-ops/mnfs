# 3J Fable Dialogue — Deployment / Operations Architecture Final Closure

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3J — Deployment / Operations Architecture  
**Candidate:** `3J-R1 — Final Closure`  
**Purpose:** perform one bounded independent closure review after operator-approved `3J-01`, `3J-02`, `3J-03`. This file does not close 3J, update authority by itself, authorize implementation, merge or PR readiness.

---

## 1. Canonical state to reconstruct independently

Read `AGENTS.md` and canonical chain. Do not trust this dialogue as authority.

Expected decision state before mechanical ledger projection:

```text
3A-R6 = APPROVED
3B..3I = CLOSED / APPROVED
3J-01 = APPROVED
3J-02 = APPROVED
3J-03 = APPROVED by operator
3J = IN PROGRESS
3J-04 = NOT JUSTIFIED candidate
```

Exact approved 3J authorities:

- `3J-01-first-production-topology-placement-ingress.md`
- `3J-02-operational-state-backup-restore-architecture.md`
- `3J-03-platform-lifecycle-secret-injection-emergency-stop-availability.md`

Review/dialogue files are provenance only.

---

## 2. Product guardrail

C-001 remains product vision authority:

> Conexus is a unified AI-first platform that builds and operates business applications integrated with ERPs, agent-guided and supported by deep company knowledge.

Closure must explicitly reject any accidental inference that:

```text
Metal Nobre = product boundary
Sankhya = topology/backup/runtime authority
first on-prem deployment = universal deployment law
single-host F1 = permanent scale architecture
```

3J is about the **first real installation and operations contract**, not narrowing the product vision.

---

## 3. Approved package summary to attack

### 3J-01 — topology / placement / ingress

```text
first production = existing company server → dedicated Linux VM
one Hub application process baseline
Postgres / hub_control / Project DBs / mastra stores / local backings co-located
private company LAN/VPN + HTTPS
public ingress = 0
MANAGED served directly by Hub/MAR from exact active Release bytes
E2B has no generic/public Hub inbound surface
Sankhya and future providers remain Connector/Connection/Gateway
single failure domain accepted; installation-scoped, not universal product law
process split only if CX-RUNTIME-ISOLATION-01 fires
```

### 3J-02 — recoverability

```text
class-based recovery set
REQUIRED:
  hub_control
  production Project DBs
  mastra_par
  non-reconstructible digest-addressed bytes
  CredentialBackend ciphertext backing
  canonical Git provider-independent bundle
  recovery manifests
mastra_builder + ephemeral/reconstructible state = excluded by default
reissuable operational credentials are not ordinary backup material
non-regenerable recovery material survives on an independent path
off-host generations survive compromise of host-resident backup credentials
first complete restore proof before production + periodic restore proof
RPO <= 6h / RTO <= 8h
pre-migration verified off-host checkpoint
cross-store atomic snapshot fiction rejected
PITR/replication/second provider/backup platform rejected absent trigger
```

### 3J-03 — lifecycle / secrets / stop / availability

```text
one Hub application runtime context
bounded backup/migration operational-job context with separate credentials
operator recovery/emergency context
owner-scoped secret injection; no generic secret service/bag/fallback
hub_control unavailable/incompatible → whole Hub normal product authority NOT READY
optional dependency failure → capability-local degradation where safe
prior-provisioned root/KEK loss/corruption → INCIDENT-class signal + secret-bearing paths fail closed, unrelated surfaces may continue
restart from durable owner facts, never runtime memory/transcript
bounded shutdown/drain; sent effects not undone
platform deploy != Project Promotion
one exact target revision spans build + migration lineage + activation + proof
incompatible schema forbids automatic old-code rollback
backup timer/job outside normal Hub runtime authority
whole-Hub emergency stop out-of-band and held across all auto-start layers until explicit release
HA/zero-downtime/public SLA not claimed
```

---

## 4. Closure questions

Independent reviewer must answer only material closure questions.

### A. 3A-R6 completeness

Reconstruct 3A-R6 §7 and prove every `MUST DECIDE` belongs to one approved 3J authority or is still missing.

Expected mapping to challenge:

```text
first deployment shape / single-host+split / monolith placement
PG/project/Mastra placement / E2B connectivity / MANAGED serving / TLS-ingress
→ 3J-01

backup ownership + required set + restore-proof responsibility
→ 3J-02

secret injection/custody / startup-shutdown-restart / deploy sequence
whole-Hub emergency stop / host-loss operations / minimum availability set
→ 3J-03
```

If anything material has no owner, return `MISSING MATERIAL DECISION` and identify smallest package; do not invent work for generic best practice.

### B. Cross-package coherence

Attack at least:

```text
single-host failure model × RPO/RTO contract
co-location × owner-scoped credentials
one Hub process × separate bounded operational-job contexts
hub_control whole-Hub authority floor × capability-local optional degradation
CredentialBackend backing backup × independent recovery material × reissuable operational credentials
B2 immutability × host backup credential compromise
Git-first authority × off-provider bundle
MANAGED exact Release bytes × backup/recovery set
platform deploy × Project Promotion separation
platform migration × exact target revision identity
normal restart × 3M semantic settlement boundary
emergency stop × auto-start supervision/VM/host defaults
```

### C. Prior-authority regressions

Check for contradiction against load-bearing prior authority, especially:

```text
C-001 product vision
C-005/C-006/C-007/C-012/C-013/C-014/C-015/C-016
3E-01/3E-02
3G-06/3G-08
3H-01/3H-02/3H-03/3H-R1
3I-01..3I-05/3I-R1
```

A real contradiction is material. Preference for cloud/Kubernetes/managed DB/etc. is not.

### D. Boundary leakage

Verify 3J did not pre-decide:

```text
3L technology truth
  exact E2B transport behavior
  Mastra store/export behavior
  process-global runtime isolation
  exact packages/versions

3M semantic recovery
  orphan/lost work
  OUTCOME_UNKNOWN settlement
  interrupted Promotion/effect/run meaning

3K product UX
  status screens
  maintenance UX
  recovery/approval UI

post-C-018 Realization Planning
  systemd/cron/hypervisor
  secret file/env/unit mechanics
  ports/firewall/DNS/TLS certificate mechanism
  exact commands/scripts/paths
```

### E. Triggered defers preserved

Confirm still deferred with owners/triggers:

```text
DEDICATED physical deployment
→ first real DEDICATED deployment

old Product Agent runtime coexistence/drain/cutover
→ first runtime-affecting upgrade after production
```

Do not convert either to current work without a real trigger.

### F. Anti-overengineering

Prove closure does **not** require:

```text
Kubernetes / service mesh / multiple Hub services
managed/replicated PostgreSQL
HA/failover/multi-region
blue-green/canary framework
availability/dependency orchestration
backup platform / second object provider
external Vault/KMS/HSM absent trigger
PlatformDeployment / Backup / EmergencyStop domain aggregates
monitoring/paging platform absent SLA consumer
public ingress
```

---

## 5. Closure outcome contract

Return exactly one architecture verdict:

```text
CLOSE 3J
REOPEN SPECIFIC APPROVED 3J AUTHORITY
ADD 3J-04 — only if a genuinely distinct material owner/failure class remains
STOP — prior authority contradiction blocks closure
```

If `CLOSE 3J`, state explicitly:

```text
Material Finding against 3J-01/02/03 = NONE
missing material 3J decision = 0
3J-04 = NOT JUSTIFIED
unrouted material deployment/operations blocker = 0
prior phase reopen = NONE
C-001 product guardrail preserved = YES
3L/3M/3K/Realization boundaries preserved = YES
verdict = CLOSE 3J
```

Do not create closure authority or update LEDGER to CLOSED; operator/lead owns ratification.

---

## 6. Fable independent closure review

**Method:** DevelopmentConexus Engineering Method v1.0.0, executed as a **bounded closure review**, not a design round. Authority reconstructed independently on **2026-08-17** from `AGENTS.md → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`: full ratified texts of 3J-01/3J-02/3J-03 (verified that all prior-round review findings are incorporated: C-015 §5/C-016 §6 bounded amendment with carried exposure laws in 3J-01; pre-production restore proof, regenerable-secret class and immutability property in 3J-02; all-layer emergency-stop hold, single target-revision identity and root/KEK incident class in 3J-03), 3A-R6 §7, and the load-bearing prior set C-001/C-005/C-006/C-007/C-012/C-013/C-014/C-015/C-016, 3E-01/3E-02, 3G-06/3G-08, 3H-01..3H-03/3H-R1, 3I-01..3I-05/3I-R1. Canonical state matches §1. No external research required.

### 6.1 A — 3A-R6 §7 completeness: every MUST DECIDE has exactly one owner

Reconstructed from 3A-R6 §7 directly and mapped item by item:

```text
first Hub deployment shape                          → 3J-01
single-host/process baseline + exact split trigger  → 3J-01 (CX-RUNTIME-ISOLATION-01 preserved)
Hub modular-monolith placement                      → 3J-01
PostgreSQL / hub_control / Project DB placement     → 3J-01 (under 3E/3I-05 laws, co-location ≠ credential collapse)
Builder/PAR Mastra substrate-store placement        → 3J-01
E2B control connectivity                            → 3J-01 (negative property; transport truth 3L)
MANAGED serving path                                → 3J-01 (Hub/MAR direct, exact Release bytes, no extra unit)
TLS / ingress boundary                              → 3J-01 (LAN/VPN + HTTPS; explicit bounded C-015 §5/C-016 §6 amendment)
platform operational secret injection/custody       → 3J-03
startup / shutdown / restart expectations           → 3J-03
material upgrade/deploy sequence                    → 3J-03 (single target revision R)
backup ownership + required backup set              → 3J-02 (class-based)
restore-proof responsibility                        → 3J-02 (pre-production + periodic, from off-host copy)
whole-Hub emergency-stop physical procedure         → 3J-03 (property + procedure class + all-layer hold)
host-loss/restart honesty                           → 3J-01 failure domain / 3J-02 RPO-RTO-restore / 3J-03 procedure (seam adjudicated at intake, no duplicate authority)
minimum availability set for first internal use     → 3J-03 (floor + capability-local matrix)
```

Both 3A-R6 §7 DEFER items remain deferred with explicit triggers (checked at 6.5). `MISSING MATERIAL DECISION` = none.

### 6.2 B — Cross-package coherence: attacked pairwise, no contradiction found

```text
single-host failure model × RPO/RTO           coherent — E4 hours-class acceptance is exactly what <=6h/<=8h binds; no HA fiction anywhere
co-location × owner-scoped credentials        coherent — 3J-01 §5.4 explicitly preserves 3I-05 logical isolation under shared host
one Hub process × operational-job contexts    coherent — contexts B/C are the realization class 3I-05 §14.4/T11 already REQUIRES; jobs are invocations, not services/modules
hub_control floor × capability-local          coherent with C-013 fail-closed Postgres boundary; no cached/latest fallback (3I-01 I8)
backing backup × recovery key × reissuables   coherent custody triangle — ciphertext in the recovery set (R6), non-regenerable key material on the independent path, reissuable credentials FORBIDDEN in backup; no single loss/compromise path re-emerges anywhere
B2 immutability × host credential compromise  closed — off-host generations survive every host-resident credential; master/account credential off-host
Git-first × off-provider bundle               closed — provider loss no longer erases source authority; no mirror service
MANAGED exact bytes × recovery set            closed triangle — serving requires exact digest bytes (3J-01), those bytes are REQUIRED backup class incl. rollback-eligible Releases (3J-02 R5), and availability law forbids rebuild/latest fallback (3J-03)
platform deploy × Project Promotion           separated both directions; no PlatformDeployment record; Git/CI own mechanical history
migration × target revision identity          one exact revision R spans checkpoint/staging/migration/activation/proof; mixed-revision deploys are not a state
normal restart × 3M boundary                  held — restart rebuilds from durable owner facts; semantic settlement stays 3M in every text
emergency stop × auto-start layers            held at all three layers (supervisor, VM autostart, host power-on) until explicit operator release
```

### 6.3 C — Prior-authority regressions: NONE

The only prior-authority modification in all of 3J is the **explicit bounded amendment** of C-015 §5 + C-016 §6 (exposure realization: company-VPN/LAN state added with opt-in/record/HTTPS/fail-closed laws carried) — recorded as an amendment in ratified 3J-01, which is the method-correct act, not a regression. Checked against the load-bearing set: C-013's Postgres fail-closed floor is restated, not weakened; C-014 forward-only/maintenance machinery untouched (bounded platform drain is a different, wider-scope obligation than C-006's Project-migration complete-drain law, which remains owned by C-014/Promotion paths); C-006 backup precedent extended, not contradicted; 3I-02/3I-05 custody and least-privilege are strengthened by the operational-context split; 3G-06/3H-02 effect/runtime honesty preserved verbatim; 3G-08/C-014 Release semantics untouched. No STOP condition exists.

### 6.4 D — Boundary leakage: NONE material

```text
3L    not pre-decided — E2B transport, Mastra store/export/restore behavior,
      runtime isolation, exact versions all remain probe-owned; 3J freezes
      only negative properties and routing
3M    not pre-decided — every 3J text stops at "durable owner facts remain;
      settlement is 3M"; no orphan/OUTCOME_UNKNOWN/Promotion-recovery
      semantics were invented
3K    not pre-decided — operational status is a routing pointer, no UX
Realization  preserved — hypervisor/systemd/cron/cert/DNS/ports/commands/
      paths/timeouts all deferred; no premature mechanism pin found
      (secret injection deliberately stays a protected-class property)
```

### 6.5 E — Triggered defers preserved

```text
DEDICATED physical deployment       → deferred in all three texts; trigger = first real DEDICATED deployment
old PAR runtime coexistence/drain   → deferred in 3J-03 §9; trigger = first runtime-affecting post-production upgrade
```

Neither was converted into current work. Consumer-gated items (external alerting, per-Project serving stop, PITR, managed placement) all retain named triggers.

### 6.6 F — Anti-overengineering: closure requires none of the rejected machinery

The union of the three REJECT lists covers every item in §4F; nothing in any approved text depends on a rejected mechanism to satisfy its own laws — verified specifically for the three tempting cases: immutability (provider-native Object Lock, no custom service), availability (descriptive matrix, no orchestrator), deploy (sequence + proofs, no orchestrator/record).

### 6.7 Findings discipline

One candidate was tested against the materiality bar and **rejected as non-material**: 3J-03 does not restate that the emergency-stop drill belongs to the pre-production proof family — but the "before production" requirement already exists in approved authority (3I-01 §13 makes the whole-Hub stop proof a 3J obligation **before production**), so no decision is missing and no coding actor gains discretion; the composition is citable. It survives only as a consolidation note: **3J-R1 should state the pre-production gate family in one place — 3J-02's complete restore proof + 3I-01/3J-03's emergency-stop drill — both already required by approved authority.** Nothing else surfaced under A–F. No new finding meets the DevelopmentConexus materiality bar.

### 6.8 Minimal content for `3J-R1` (operator ratification)

```text
1. the closure statement block below, with this review as non-authoritative provenance;
2. the pre-production gate family note (6.7): restore proof + emergency-stop drill, by citation to 3J-02/3I-01/3J-03 — no new obligation created;
3. confirmation that the single prior-authority amendment of 3J (C-015 §5 + C-016 §6 exposure realization) is bounded, recorded in 3J-01, and reopens nothing else;
4. the 6.1 ownership map as the binding 3A-R6 §7 coverage snapshot at closure;
5. defers/rejects tables carried by citation; 3J-04 = NOT JUSTIFIED;
6. explicit statement that 3J closes installation-scoped: first-installation operations contract, with C-001 product vision authority intact and Metal Nobre/Sankhya as first-deployment evidence/integration only.
```

### 6.9 Closure statement

```text
Material Finding against 3J-01/02/03            = NONE
missing material 3J decision                     = 0
3J-04                                            = NOT JUSTIFIED
unrouted material deployment/operations blocker  = 0
prior phase reopen                               = NONE
C-001 product guardrail preserved                = YES — installation-scoped
                                                   operations contract; no
                                                   on-prem/single-host/ERP
                                                   inference became product law
Metal Nobre / Sankhya                            = first-deployment evidence /
                                                   ordinary integration only
DEDICATED physical + old-PAR drain               = still DEFER SAFELY with triggers
3L/3M/3K/Realization boundaries preserved        = YES
new module/record/engine required by closure     = 0

verdict = CLOSE 3J
```

3J-R1 authority creation and marking 3J CLOSED in the LEDGER remain with the operator's final ratification.
