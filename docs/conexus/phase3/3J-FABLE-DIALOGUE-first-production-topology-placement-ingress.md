# 3J Fable Dialogue — First Production Topology, Placement & Ingress

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3J — Deployment / Operations Architecture  
**Candidate:** `3J-01 — First Production Topology, Placement & Ingress`  
**Purpose:** consolidate the first real production topology after the 3J intake/Fable review and current operator environment evidence. This file does not create authority, update `LEDGER.md`, authorize implementation, merge or PR readiness.

---

## 1. Canonical state to reconstruct independently

Read `AGENTS.md` and the canonical chain. Do not trust this dialogue as authority.

Expected state:

```text
3A-R6 = APPROVED
3B..3I = CLOSED / APPROVED
3I-R1 = APPROVED / CLOSED
3J = NOT STARTED / NEXT
3K..3O = NOT STARTED
```

Prior non-authoritative provenance:

- `3J-FABLE-DIALOGUE-intake-decomposition.md`;
- its Fable review at HEAD `6aeacc3455d836029c026eef1aca4d062d930819`.

The intake review confirmed the three-package 3J decomposition after corrections:

```text
3J-01 topology / placement / ingress
3J-02 operational state / backup / restore
3J-03 platform lifecycle / secret injection / emergency stop / availability
3J-R1 bounded closure
```

No prior authority was reopened by that intake review.

---

## 2. Operator/environment evidence now supplied

Current operator facts, to be treated as evidence for this candidate rather than timeless product authority:

### E1 — Sankhya is not a placement constraint

For the current Metal Nobre use, Sankhya is consumed as an external integration using its registered credential/authentication path. It is not a LAN-only Oracle dependency for Conexus runtime placement.

More importantly, the operator explicitly corrected the framing:

> Sankhya is one important integration for Metal Nobre and the first practical consumer, but Conexus is a general platform. Platform topology must not be shaped around Sankhya.

This aligns with C-007:

```text
Connector = platform catalog artifact
Connection = company/environment-specific hub object
Project pins connector revision + named Connection
Gateway owns execution/custody boundary
Sankhya = one native-first connector profile, not platform topology authority
```

Therefore:

```text
Sankhya
-X-> on-prem requirement
-X-> special network path in 3J-01
-X-> platform-specific deployment unit
```

External systems remain Connections/Integrations under C-007/3C-07/3C-08/3I.

### E2 — development/proving environment

The operator intends to build/prove the system first on the operator workstation:

```text
Windows workstation
→ WSL2 canonical development environment
→ operator-only proving/testing before first production placement
```

This is **not** the first production topology and must not become production authority merely because development starts there.

### E3 — company production host exists

The company already has a server that can remain as the first production physical host. The host OS is Windows and a Linux VM/guest can be created.

Candidate production realization class:

```text
existing company Windows server
→ one dedicated Linux VM/guest
→ Conexus first-production failure domain
```

Exact hypervisor/product, VM sizing, filesystem paths and service manager are Realization Planning/implementation details unless later evidence makes one load-bearing.

WSL2 remains a development/proving environment in this candidate; the production class is a dedicated Linux guest/VM because it gives an independently managed server lifecycle without adding a second physical/cloud host.

### E4 — single failure domain accepted for first internal production

Operator accepts:

```text
single host may fail
→ Conexus may remain unavailable for hours
→ manual restore/recovery is acceptable
→ some hours of data loss since latest successful backup are acceptable initially
```

Exact RPO/RTO numbers belong to 3J-02, but this evidence satisfies the 3J-intake Fable condition required to justify the single-host Global Maximum.

### E5 — existing company VPN is the private access boundary

Initial users are company employees with platform logins. The company already has a VPN used by managers.

Intended progression:

```text
operator development
→ localhost on operator workstation

first company production
→ local company server
→ private company network
→ remote manager connects company VPN when outside
→ private HTTPS access to Conexus
```

No current consumer requires public Internet ingress.

---

## 3. Material correction — C-016 transport pin vs security invariant

C-015/C-016 froze an important security property:

```text
remote browser access
→ HTTPS required
public/routable plaintext bind
→ fail closed
```

Their then-current realization used Tailscale/tailnet and `.ts.net` certificate handling.

Current operator evidence shows a real existing corporate VPN. Requiring Tailscale *in addition* would introduce a second private-network overlay with no current consumer/failure class.

Candidate reconciliation:

> Preserve the C-015/C-016 **security invariant** (`remote private access => HTTPS`, no public F1 ingress), but supersede the Tailscale-specific first-production realization with the **existing company VPN/private network** for this deployment.

Therefore:

```text
private-access authority
= existing company VPN/network path

browser transport
= HTTPS even inside VPN

public Internet listener
= NONE F1

Tailscale
= NOT REQUIRED by first-production topology
```

This is not a relaxation:

```text
VPN
!= TLS
```

VPN supplies private reachability; HTTPS remains the browser/application transport requirement.

Exact private DNS/certificate/TLS termination mechanism is Realization Planning unless a 3L/3J proof shows a topology constraint.

Reopen only if:

```text
existing VPN cannot support required first users reliably
public/third-party consumer appears
VPN cannot preserve the remote-HTTPS invariant without disproportionate machinery
```

Do not reopen C-016's unrelated supply-chain/egress/security baseline.

---

## 4. Root cause and target invariant

Root cause:

> Without one explicit first-production failure domain and ingress model, implementation actors would still choose workstation/server/cloud/process/store placement and network exposure by convenience.

Target invariant:

> **First production uses one deliberately accepted physical failure domain and one private HTTPS ingress model, while keeping the Hub modular monolith, existing runtime/store/security boundaries and external integrations independent of deployment placement.**

---

## 5. Candidate `3J-01` decision

### 5.1 Placement

F1 first production:

```text
ON-PREM COMPANY HOST

existing company Windows server
        ↓
one dedicated Linux VM/guest
        ↓
one Conexus production failure domain
```

Why on-prem is the Global Maximum **for the current operator environment**:

1. a usable company server already exists;
2. private employee access already exists through the company VPN;
3. no current integration requires cloud placement;
4. operator accepts single-host/manual-restore availability;
5. cloud/VPS would add provider account/custody/networking/tunnel/remote-data placement without satisfying a missing current requirement;
6. no current requirement needs HA, auto-failover or public Internet serving.

This is not a universal Conexus law that all future installations are on-prem. It is the first production topology of the current Conexus installation.

### 5.2 Development != production

```text
operator Windows + WSL2
→ development / qualification / proving

company server Linux VM
→ first production
```

No durable production authority should depend on the operator's interactive workstation being powered on.

The migration from workstation proving to the company server is a deployment transition, not Project Release Promotion and not a second topology family.

### 5.3 One Hub process baseline

Inside the Linux production guest:

```text
one Node/TS Hub process
├── control-plane/application orchestration
├── Managed Application Runtime
├── Capability Gateway
├── Builder control-side runtime
└── Production Agent Runtime
```

This does not collapse module ownership.

Process split occurs only if `CX-RUNTIME-ISOLATION-01` proves an enabled F1 framework state cannot be mechanically isolated in-process.

No process split for aesthetic security/module purity.

### 5.4 Co-located persistent stores/backings

Same Linux VM/failure domain initially contains:

```text
PostgreSQL cluster
├── hub_control
├── mastra_builder
├── mastra_par
└── production Project DBs

platform file/content backing classes
├── Blob/CAS / digest-addressed served bytes
└── CredentialBackend encrypted backing
```

Logical credential/database isolation from 3I-05 remains mandatory even while physical host is shared.

Co-location does **not** mean same credential, same DB, same schema, same owner or same backup semantics.

Moving a store to managed/cloud infrastructure is not justified until availability/RPO/scale/security evidence creates a real consumer.

3J-02 owns the complete backup classification and off-host survival properties.

### 5.5 MANAGED serving path

No extra deployment unit is created for MANAGED apps.

```text
employee browser
→ company private network / VPN
→ HTTPS
→ Hub / Managed Application Runtime
→ route resolves Project server-side
→ active exact Release
→ exact digest-addressed verified frontend bytes
```

Hub/MAR serves the real Release-pinned application bytes as already frozen.

No separate web-hosting platform/CDN/reverse-proxy service is required by architecture merely because an app is published.

Exact HTTP server/reverse proxy/TLS implementation remains Realization Planning; if prior C-012 trigger for a reverse proxy fires from concrete TLS/ops constraints, use Decision/Realization evidence rather than pre-installing one now.

### 5.6 Ingress

First-production ingress:

```text
local company network
+
existing corporate VPN for remote managers
+
HTTPS
```

Explicitly:

```text
public Internet ingress      = NONE
anonymous/public app access  = NONE
public DEDICATED ingress     = NONE
browser plaintext remote     = DENY
second overlay VPN           = NOT REQUIRED
```

The platform login/I&A model remains unchanged: VPN reachability does not itself grant Conexus authority.

### 5.7 E2B / sandbox traffic

Freeze only the negative property from the intake review:

> **No generic and no public Hub inbound surface exists for sandbox traffic.**

Any guest→Hub traffic must use an already-admitted narrow Hub-minted capability and a transport proven by 3L. It may physically ride a Hub-outbound provider channel or an explicitly bounded authenticated ingress if the qualified substrate requires it.

Do not pin the transport in 3J-01 before `CX-SBX-E2B-01`/guest-capability qualification.

### 5.8 External integrations remain topology-independent

```text
Sankhya
Mercado Livre
Google/Meta/future ERP/SaaS
etc.
```

remain:

```text
Connector revision
+ named Connection
+ Project binding/release composition
+ Gateway execution
```

Their provider-specific auth/network mechanics do not choose the Hub deployment topology unless a future integration has a **proven** reachability/custody requirement. That future fact returns through the applicable Decision Loop.

---

## 6. Failure-domain honesty

Accepted first-production statement:

```text
company physical server failure
OR Windows host failure
OR Linux VM loss
→ current Conexus production can become unavailable as one failure domain
```

No HA claim.

Recovery expectation at this stage:

```text
off-host recoverable set
+ replacement/repaired host
+ manual restore
```

Exact:

```text
RPO
RTO
backup set
immutability/versioning
Git-loss coverage
restore proof
```

belong to 3J-02.

Operational procedure after host loss belongs to 3J-03; owner-state semantic settlement belongs to 3M.

---

## 7. Administration / emergency-stop composition seam

3J-01 only freezes the placement-dependent prerequisite:

> The selected production placement must provide an **out-of-band administrative channel** independent from the served Conexus application path.

For an on-prem physical server this may be physical/local host administration or another existing infrastructure-management channel. Exact procedure/command is 3J-03/Realization.

The emergency-stop control must not depend solely on a healthy/authenticated Conexus web application or the exact browser path being stopped.

---

## 8. Explicit non-goals / YAGNI

Do not create for 3J-01:

```text
VPS/cloud account requirement
managed PostgreSQL
second physical host
Postgres replication
Kubernetes
containers as deployment architecture requirement
service mesh
load balancer
CDN
public ingress
Tailscale requirement when existing VPN satisfies private reachability
blue-green/canary
HA/failover manager
fleet scheduler
IaC platform requirement
multiple Hub processes
MAR standalone service
E2B inbound gateway service
cloud abstraction
```

Exact Linux distro/version, VM hypervisor, CPU/RAM/disk sizing, service manager, firewall rules, ports, DNS, certificate mechanism and deployment scripts are Realization Planning unless later proof makes one load-bearing.

---

## 9. Proof obligations

At qualification/realization, falsify at least:

```text
1. development workstation off
   → first-production Hub remains independent on company server

2. remote manager outside LAN without company VPN
   → no Conexus ingress available

3. remote manager on company VPN but using plaintext HTTP
   → denied/not admitted as normal remote serving path

4. authenticated VPN user without Conexus membership/permission
   → denied by normal I&A; VPN never grants app authority

5. public Internet scan/path
   → no Hub/MANAGED listener intentionally exposed

6. MANAGED request
   → exact active-Release digest bytes served; no latest/filesystem rebuild fallback

7. sandbox traffic
   → cannot reach a generic/public Hub inbound API

8. Builder/PAR same-process qualification passes
   → no process split required

9. qualification fails due unpartitionable runtime-global state
   → 3J split trigger fires without redesigning domain ownership

10. normal Hub DB credential
   → cannot collapse owner/store isolation merely because all stores cohabit one VM

11. company host/VM is lost
   → topology admits that serving stops; no HA fiction
```

---

## 10. Reopen triggers

```text
current company server no longer operationally viable
measured uptime/RTO/RPO need exceeds single-host/manual-restore model
first public/external browser consumer
existing company VPN cannot satisfy private first-user reachability
first integration introduces a proven LAN/custody/topology constraint
CX-RUNTIME-ISOLATION-01 requires Builder/PAR process split
store workload/availability requires independent managed placement
compliance/customer contract requires cloud/on-prem isolation change
first real DEDICATED deployment
```

A provider preference, generic cloud best practice or hypothetical future scale does not reopen 3J-01.

---

## 11. Outcome candidate

```text
prior authority reopen                  = bounded C-016 transport-realization reconciliation only
C-016 remote-HTTPS security invariant   = PRESERVED
Tailscale-specific first-prod transport = superseded by existing corporate VPN/private network
first production placement              = existing company server / on-prem
production execution environment        = one dedicated Linux VM/guest
Hub process baseline                     = one
Postgres/Mastra/backing placement        = co-located in same Linux VM/failure domain
public ingress                           = 0
private ingress                          = corporate LAN/VPN + HTTPS
Sankhya topology authority               = 0; remains Connection/Integration
extra MANAGED deployment unit           = 0
HA/replication/cloud framework           = 0
new durable record/module                = 0
new deployment machinery                = 0
outcome                                 = CURRENT STRUCTURE CONFIRMED + bounded physical realization selection
```

---

## 12. Fable review mandate

Reconstruct authority independently. Attack this candidate, especially:

1. whether the operator evidence truly closes on-prem vs VPS/cloud without making current Metal Nobre topology a universal Conexus product law;
2. whether Sankhya is correctly demoted back to ordinary Connector/Connection/Gateway semantics under C-007;
3. whether existing corporate VPN can replace the Tailscale-specific first-production realization while preserving C-015/C-016 remote HTTPS/no-public-ingress security laws, or whether an exact earlier authority must be explicitly amended/reopened;
4. whether Windows host → dedicated Linux VM/guest is the correct architecture-level class while WSL2 remains development/proving, with exact hypervisor deferred;
5. whether single Linux VM + one Hub process + co-located Postgres/Mastra/Blob/CredentialBackend is truly the Global Maximum under the accepted failure model;
6. whether the development-workstation → company-server transition creates any hidden authority/data migration decision that belongs in 3J-01 rather than Realization;
7. whether MANAGED serving needs no additional deployment unit;
8. whether private VPN reachability + application HTTPS creates any hidden same-origin/certificate/ingress contradiction;
9. whether E2B negative-property wording correctly avoids stealing 3L's transport qualification;
10. whether an out-of-band administrative channel prerequisite is sufficient at this stage without pre-solving 3J-03;
11. whether any item from 3A-R6 3J MUST DECIDE was accidentally pulled into or omitted from 3J-01;
12. whether any new machinery is being smuggled in.

Return:

```text
Material Findings
reopen required + exact authority if any
Global Maximum verdict
corrected 3J-01 candidate
proof corrections
routing corrections
YAGNI cuts
verdict = ACCEPT CANDIDATE | RESTRUCTURE | STOP
```

Append to this dialogue, commit/push. **Do not update LEDGER, do not create 3J-01 authority, do not touch product code.**
