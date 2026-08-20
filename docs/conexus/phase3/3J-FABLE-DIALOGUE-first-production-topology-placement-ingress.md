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

---

## 13. Fable independent review

**Method:** DevelopmentConexus Engineering Method v1.0.0. Authority reconstructed independently on **2026-08-17** from `AGENTS.md → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`. Load-bearing texts read at source, not from this dialogue: C-015 §3/§4/§5 (session/cookie laws; declared same-origin trust zone with its subdomain triggers; **exposure binding**: loopback default, tailnet as explicit config opt-in with persistent banner + `agent_event`, boot refusal of public/routable bind without TLS), C-016 §6 (amendment to C-015 §5: remote browser access = HTTPS mandatory; ratified closed form **`localhost HTTP | tailnet HTTPS`**; `.ts.net` certificate as the then-current realization; banner/opt-in preserved), C-007 (Connector/Connection/Gateway; Sankhya = native-first connector profile, `client_credentials + X-Token`, sandbox×prod environments), C-012 (hub serves dist directly; reverse-proxy named trigger), C-006/C-014 (DEV recriável; environments; GitHub canonical; Promotion machinery), C-008/3I-02/3I-05 (E2B boundary; custody; crossings), 3H-03 (same-process; CX-RUNTIME-ISOLATION-01), 3A-R6 §7, the 3J intake + its review at `6aeacc3`. Canonical state matches §1.

### 13.1 Verdict summary

**ACCEPT CANDIDATE** with three Material Findings folded into consolidation — none is RESTRUCTURE-class and nothing approaches STOP. The placement is **GLOBAL MAXIMUM for the current operator environment** (13.3). Sankhya demotion is correct and already law (13.4). The VPN substitution is ratifiable inside 3J-01 — but only as an **explicit recorded amendment** to C-015 §5 / C-016 §6, not as the candidate's current "supersede the realization" framing, and it must carry the exposure laws it currently drops (F-1). Two silent assumptions must become stated evidence/preconditions: outbound egress integrity from the company network (F-2) and the clean-initialization rule for the workstation→server transition (F-3).

### 13.2 F-1 — MATERIAL: the VPN substitution amends ratified text; it must say so, and it drops three laws it must carry

```text
claim attacked     §3 "preserve invariant, supersede Tailscale realization"
                   can be ratified as-is in 3J-01
what is actually   C-016 §6 did not freeze only an invariant. It ratified a
frozen             closed final form — "localhost HTTP | tailnet HTTPS" —
                   amending C-015 §5, whose exposure enumeration is itself
                   ratified text (loopback default; tailnet = explicit
                   config opt-in + persistent banner + agent_event record;
                   public/routable bind without TLS refuses boot).
                   Company-LAN/VPN-reachable bind is a THIRD exposure state
                   not in that enumeration. Substituting it is therefore an
                   AMENDMENT of ratified enumerated form — the same class of
                   act as C-016 §6 amending C-015 §5, with ample program
                   precedent (C-012→C-005, C-013→C-012, C-015→C-003).
                   Calling it "reconciliation/supersession" without naming
                   the amended authority would create silent drift on
                   ratified text — exactly what the method forbids.
ratifiable where   IN 3J-01, yes — no separate reopen. The amendment is
                   narrow: C-015 §5 exposure enumeration + C-016 §6 final
                   form gain the company-private-network state. C-016's
                   supply-chain/egress/16-property baseline is untouched.
what the candidate (a) exposure opt-in + agent_event: C-015 §5 makes
currently DROPS        non-loopback exposure an EXPLICIT config opt-in
                       recorded as agent_event. That law must carry to the
                       LAN/VPN bind unchanged — exposure state remains
                       deliberate, recorded, never a default.
                   (b) banner translation: the C-015 banner marked a
                       NON-SECURE context (tailnet HTTP era). Under
                       VPN + HTTPS the secure context is real, so the
                       banner's original predicate dies; the amendment must
                       say the exposure opt-in/record law survives while
                       the non-secure-context banner text retires — not
                       leave both halves ambiguous.
                   (c) trusted-certificate / secure-context property:
                       `.ts.net` gave automatic browser-trusted certs.
                       A company-network realization must state the
                       property replacing that: the HTTPS certificate is
                       VALIDLY TRUSTED by first-user browsers (company
                       CA distribution or public cert on a company name);
                       certificate-warning click-through is not an
                       admissible normal state. With real TLS, C-015 §3's
                       __Host-/Secure cookie form activates — the amendment
                       should note this strengthening explicitly.
                   Exact cert mechanism/DNS name → Realization Planning.
smallest fix       one amendment clause in the 3J-01 decision text naming
                   C-015 §5 and C-016 §6, adding the company-private-
                   network exposure state under (a)/(b)/(c), preserving
                   loopback-HTTP-only, remote-HTTPS-mandatory and
                   public-sans-TLS boot refusal verbatim.
```

### 13.3 F-2 — MATERIAL: outbound egress reachability and TLS integrity from the company network are silently assumed

```text
claim attacked     §5.1 evidence list is sufficient to close placement
gap                the candidate proves INBOUND viability (VPN, HTTPS) but
                   says nothing about OUTBOUND. The intake evidence list
                   (§15.6 item 7 of the intake review) asked precisely
                   this and E1–E5 do not answer it. On-prem placement
                   fails at birth if the company network cannot give the
                   production VM direct HTTPS egress to: E2B control
                   plane, model providers, GitHub, B2, Sankhya endpoint,
                   admitted registries.
sharper danger     corporate networks commonly run TLS-inspection proxies.
                   A MITM proxy on Hub outbound flows would break custody
                   and crossing assumptions materially: provider
                   credentials and model traffic would transit a
                   corporate interception CA — a crossing 3I-02/3I-05
                   never admitted. This must be stated as a NEGATIVE
                   property, not discovered during implementation.
smallest fix       add to the 3J-01 decision text one evidence
                   precondition + one property:
                   "Production-VM outbound HTTPS to the named provider
                   set is direct/end-to-end; no TLS-interception proxy
                   sits on Hub platform-control or Gateway egress. If
                   the company network cannot satisfy this, placement
                   evidence is invalid and the decision reopens."
                   Verification lands in the §9 proofs (13.6).
```

### 13.4 F-3 — MATERIAL: workstation→server transition must exclude silent durable-state carry-over

```text
claim attacked     §5.2 "deployment transition, not Promotion, not second
                   topology family" fully closes the transition
gap                it closes the TOPOLOGY question but not the DATA one.
                   Proving on WSL2 will create real-looking durable state
                   (accounts, projects, hub_control rows, registry
                   payloads). The candidate never says whether that state
                   may move to production. Left open, a coding actor
                   "copies the dev database to prod" — manufacturing
                   production authority from a development environment,
                   against C-006's DEV-recriável class and the provenance
                   discipline of every owner history.
smallest fix       freeze in 3J-01: "First production starts from clean
                   platform initialization; durable authority enters
                   through normal platform operations on the production
                   host. No workstation/proving durable state becomes
                   production authority by copy. Any deliberate carry-over
                   is a restore-class operation under 3J-02 semantics or
                   an explicit Decision — never a file copy."
proof              production hub_control provenance shows fresh
                   initialization, not a workstation dump lineage (13.6).
```

### 13.5 Confirmations under attack (mandate items, compressed)

```text
1. on-prem closure     CONFIRMED as GLOBAL MAXIMUM for the current
                       environment, conditional on F-2 facts. Every VPS/
                       cloud alternative adds provider account/custody/
                       tunnel/remote-state surfaces while satisfying no
                       requirement the company host leaves unmet. The
                       candidate correctly splits LAW (one accepted private
                       failure domain + private HTTPS ingress) from
                       SELECTION (this company server, evidence-based,
                       reopenable) — §5.1's "not a universal law" line is
                       the right scope and must survive into the decision
                       text. E4 satisfies the intake F-3 acceptance
                       condition explicitly. One honesty line to add: the
                       Windows host may run other company workloads; they
                       share the accepted failure domain (co-tenant load is
                       covered by the accepted model, but say it).
2. Sankhya demotion    CONFIRMED and already law — C-007 froze Sankhya as
                       one native-first connector profile behind Connector/
                       Connection/Gateway; E1 adds the operator's product
                       correction. Nothing in the candidate gives any
                       integration topology authority; §5.8's Decision Loop
                       re-entry for a PROVEN future reachability constraint
                       is the correct seam.
4. WSL2 vs Linux VM    CONFIRMED. AGENTS.md itself makes WSL2 the canonical
                       LOCAL host — development class. Production = dedicated
                       Linux VM/guest with independent lifecycle. Hypervisor
                       deferral is genuinely safe: Builder sandboxes run on
                       E2B (external), so no nested-virtualization
                       requirement exists on the company host — the one fact
                       that could have made the hypervisor load-bearing.
5. single VM/process/  CONFIRMED GLOBAL MAXIMUM under E4. Same test as the
   co-location         intake review F-3: no current named requirement
                       forces a second host/process or off-host store;
                       3H-03 split trigger preserved (§5.3); 3I-05 logical
                       isolation survives co-location explicitly (§5.4).
7. MANAGED unit        CONFIRMED — §5.5 matches C-012 (hub serves dist
                       directly; reverse proxy stays a named trigger, not
                       pre-installed).
8. VPN ≠ authority     CONFIRMED — §5.6 + proof 4 keep I&A/membership
                       mandatory; network position never authenticates.
                       Same-origin trust zone of C-015 §4 is preserved
                       (one company hostname, subdomain triggers unfired);
                       hostname/DNS = Realization.
9. E2B wording         CONFIRMED — §5.7 freezes exactly the intake F-6
                       negative property and leaves transport truth to 3L.
10. admin seam         CONFIRMED sufficient — §7 freezes the prerequisite
                       only; on-prem the Windows-host/hypervisor console is
                       the natural out-of-band layer independent of the
                       Linux VM, the Hub and the VPN path. Procedure = 3J-03.
11. 3A-R6 coverage     CLEAN — all §7 topology-class items owned here;
                       secret injection stays 3J-03 (intake F-1), backup
                       3J-02, lifecycle 3J-03. Nothing pulled in, nothing
                       omitted.
12. smuggled machinery NONE found; §8 list stands. Add to it: no internal
                       PKI SERVICE (cert path = smallest company-trusted
                       mechanism, Realization) and no MDM/device-management
                       requirement created by 3J-01.
```

### 13.6 Proof corrections (additions to §9)

```text
12. production-class execution: the §9 bind/ingress negatives (2,3,5) run
    on the production Linux VM realization, not on WSL2 proving
13. certificate trust: first-user browsers accept the Conexus HTTPS
    certificate without warnings; __Host-/Secure session cookie form is
    active and functioning under the company hostname
14. egress integrity (F-2): from the production VM, HTTPS to E2B/model
    providers/GitHub/B2/Sankhya succeeds end-to-end and the observed
    certificate chains are the providers' — not a corporate interception CA
15. clean initialization (F-3): production hub_control provenance is fresh
    initialization; no workstation-era durable rows/dumps present
16. exposure record: the LAN/VPN bind opt-in exists as explicit config +
    agent_event, per the amended C-015 §5 law
```

### 13.7 Routing corrections

```text
certificate mechanism / private DNS / CA distribution → Realization Planning
company-network egress/proxy facts (F-2)              → operator evidence NOW,
                                                        before ratification
carry-over of any proving-era state (F-3)             → 3J-02 restore class /
                                                        explicit Decision only
Windows-host administration/console detail            → 3J-03 + Realization
everything else                                        → as §6/§7/§8 already route
```

### 13.8 Closing block

```text
Material Findings                = 3
  F-1 VPN substitution = explicit amendment of C-015 §5 + C-016 §6
      (closed form "localhost HTTP | tailnet HTTPS" → adds company-
      private-network state), carrying opt-in/agent_event, banner
      translation and trusted-cert/secure-context property
  F-2 outbound egress reachability + no-TLS-interception property must
      become stated evidence/precondition + proofs
  F-3 clean-initialization rule for workstation→server transition
reopen required                  = NONE beyond the F-1 bounded amendment,
                                   ratifiable inside 3J-01 itself; C-016
                                   baseline otherwise untouched
Global Maximum verdict           = on-prem company server → dedicated Linux
                                   VM → single Hub process → co-located
                                   stores = GLOBAL MAXIMUM for the current
                                   environment, conditional on F-2 evidence;
                                   installation-scoped, not product law
Sankhya                          = Connector/Connection/Gateway only —
                                   CONFIRMED, already C-007 law
new machinery                    = 0 (YAGNI list extended: no PKI service,
                                   no MDM requirement)
proof corrections                = 5 added (13.6)
routing corrections              = 13.7

verdict = ACCEPT CANDIDATE
          with F-1/F-2/F-3 folded into the consolidated 3J-01 text before
          operator ratification; ID and LEDGER remain with the operator
```
