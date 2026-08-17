# 3J-01 — First Production Topology, Placement & Ingress

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3J — Deployment / Operations Architecture  
**Authority:** primeira decisão aprovada de 3J  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** não constitui C-018, não encerra 3J/Fase 3 e não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

A primeira produção interna do Conexus usa o **servidor físico já existente da empresa** como um único failure domain, com **um Linux guest/VM dedicado**, **um único processo de aplicação Hub Node/TS**, PostgreSQL/Mastra/backings co-localizados nesse guest sob os isolamentos já aprovados, MANAGED servido diretamente pelo Hub/MAR a partir da exact active Release, e **ingress privado por LAN/VPN corporativa existente + HTTPS, sem public Internet ingress**; WSL2 permanece development/proving, integrações como Sankhya continuam Connector/Connection/Gateway e nunca escolhem a topologia, e cloud/HA/process split só retornam por trigger material.

## 1. Guardrail de produto

C-001 permanece a authority de visão: Conexus é uma **plataforma unificada, AI-first, que constrói e opera aplicativos de negócio integrados a ERPs, guiada por agente e apoiada em conhecimento profundo da empresa**.

Esta decisão não redefine Conexus como produto Metal Nobre, plataforma Sankhya, software exclusivamente on-prem ou app de uma única empresa.

```text
Metal Nobre current environment → evidence for first deployment
Sankhya                       → one Connector/Connection consumer
neither                       → universal product topology authority
```

C-007 continua governando integrações:

```text
Connector + Connection + Project binding/Release + Gateway
```

Futuras instalações SaaS/cloud/customer-specific podem usar outra topology quando requisito real disparar Decision Loop.

## 2. Evidence do operador

```text
E1 Sankhya é integration autenticada; não é constraint LAN-only de placement.
E2 proving começa na workstation Windows + WSL2 do operador.
E3 existe servidor físico da empresa, Windows, apto a hospedar Linux VM/guest.
E4 single-host failure é aceitável inicialmente: horas de indisponibilidade, restore manual e algumas horas de RPO são aceitáveis.
E5 primeiros usuários são funcionários; a empresa já possui VPN corporativa.
E6 nenhum consumidor atual exige public Internet ingress.
```

Esses fatos escolhem a primeira instalação; não criam product doctrine.

## 3. Root invariant

> **A primeira produção possui um failure domain físico explícito e um único modelo de ingress privado que realiza as authorities existentes sem distributed-systems machinery, sem transformar o primeiro ambiente em product law e sem permitir que a workstation de desenvolvimento vire production authority.**

## 4. Development/proving != production

```text
Operator Windows + WSL2
→ development / qualification / proving

Existing company Windows server
→ dedicated Linux VM/guest
→ first production
```

WSL2 continua o host local canônico de desenvolvimento de `AGENTS.md`.

Exact hypervisor, Linux distro/version, VM sizing, filesystem e service manager são Realization Planning salvo evidence load-bearing posterior.

### No silent state promotion

```text
WSL2 DB/files
-X-> copied and silently declared PROD
```

Posteriormente são admissíveis somente:

```text
A. clean production initialization
OR
B. deliberate governed migration/restore
   → exact source/provenance + integrity proof
   → admitted under 3J-02 / Realization authority
```

3J-02 decide portability/restore; 3J-01 só proíbe promoção silenciosa de proving state.

## 5. First-production topology

### 5.1 Physical failure domain

```text
one company physical server
→ one Windows host
→ one dedicated Linux production guest
```

Physical host, Windows host ou Linux guest loss podem derrubar toda a instalação. Isso é aceito; não há HA claim.

Outros workloads no Windows host compartilham esse accepted failure domain; resource contention medido que torne o host inadequado é reopen trigger.

### 5.2 One Hub application process

Dentro do Linux guest:

```text
one Node/TS Hub application process
├── Control Plane/L7
├── Managed Application Runtime
├── Capability Gateway
├── Builder control-side runtime
└── Production Agent Runtime
```

Isso não significa um único OS process total e não colapsa module ownership.

Builder/PAR continuam role-specific. Process split só se `CX-RUNTIME-ISOLATION-01` provar state F1 não-isolável in-process.

### 5.3 Co-located stores/backings

```text
PostgreSQL cluster
├── hub_control
├── mastra_builder
├── mastra_par
└── production Project DBs

local platform backings
├── digest-addressed / Blob-CAS classes
└── CredentialBackend encrypted backing
```

Co-location não muda DB/schema/owner/credential/store/backup semantics. 3I-05/3I-R1 least privilege permanece obrigatório.

Off-host/managed stores ficam DEFER SAFELY até requirement real de availability, RPO/RTO, scale, security/compliance ou customer topology.

## 6. MANAGED serving

```text
employee browser
→ private network/VPN
→ HTTPS
→ Hub / MAR
→ serving route resolves Project server-side
→ active exact Release
→ exact digest-addressed verified frontend bytes
```

```text
verified build bytes = served active-Release bytes
```

3J-01 não cria standalone MAR service, separate frontend hosting, CDN, load balancer ou reverse-proxy requirement. Concrete TLS/reverse-proxy realization pode entrar depois se C-012 trigger real disparar.

## 7. Ingress

```text
inside company  → LAN → HTTPS → Conexus
outside company → corporate VPN → private company network → HTTPS → Conexus
```

```text
public Internet ingress      = NONE
anonymous/public app access  = NONE
remote plaintext             = DENY
second overlay VPN           = NOT REQUIRED
```

VPN fornece reachability, nunca authority. I&A continua decidindo authentication/membership/permissions.

## 8. Bounded amendment — C-015 §5 / C-016 §6

C-015/C-016 haviam ratificado:

```text
localhost HTTP | tailnet HTTPS
```

A instalação atual possui VPN corporativa real. 3J-01 faz amendment explícita apenas da enumeração de exposure realization:

```text
development loopback → localhost HTTP permitted
production remote/private access → company-private-network HTTPS
  ├── LAN
  └── existing corporate VPN
public/routable plaintext → fail closed
public Internet ingress → none
```

Preservado:

```text
remote browser access => HTTPS
non-loopback exposure is deliberate configuration
public/routable plaintext is forbidden
network position != Conexus authorization
```

`.ts.net`/Tailscale deixam de ser requirement desta instalação.

### Exposure recording

Private-network exposure deve ser configuração explícita e usar as atuais semantics de OBS/Audit. **Não criar/reviver `agent_event` como nova classe durável**: 3E-02 fechou o inventário F1 e OBS já possui `obs.operational_event`.

### Certificate property

Remote production HTTPS deve ser normalmente confiável pelos browsers dos first users; certificate-warning click-through não é normal production state.

Exact hostname/private DNS/company CA/public certificate/TLS termination é Realization Planning. Sob TLS, C-015 `Secure`/`__Host-` session semantics aplicam-se normalmente.

O restante do C-016 não reabre.

## 9. Outbound egress property

Current classes continuam:

```text
CodingRuntime → E2B
model adapter → model provider
GitInfra → Git provider
backup → off-host provider
Gateway → Connection target
build/install → admitted registries
```

> **Production placement deve permitir required HTTPS egress preservando 3I trust/custody; unexpected TLS interception não pode virar secret/plaintext consumer silencioso.**

Isso é **production activation proof**, não blocker da arquitetura antes do production VM existir.

Falha no activation proof:

```text
activation blocked
→ fix network path
OR
→ reopen placement if environment cannot satisfy property proportionally
```

## 10. E2B crossing

> **No generic and no public Hub inbound surface exists for sandbox traffic.**

Guest→Hub usa somente narrow Hub-minted capability + transport qualificado em 3L. O exact transport não é escolhido aqui.

## 11. Integrations remain topology-independent

Sankhya, Mercado Livre, Google/Meta e futuros ERP/SaaS continuam Connector/Connection/Project binding/Release/Gateway.

Só uma futura integração com **proven** reachability/custody requirement pode reabrir topology.

## 12. Out-of-band administration seam

A placement precisa permitir administrar/parar ingress/application fora da served Conexus web path.

No on-prem server isso pode ser physical/local Windows-host administration ou existing hypervisor/infrastructure path. Procedure concreto é 3J-03/Realization. Nenhuma `EmergencyStop` entity é criada.

## 13. Failure-domain honesty

```text
physical server OR Windows host OR Linux VM OR shared local storage lost
→ production may be unavailable
```

Baseline conceitual:

```text
off-host recoverable set + repaired/replacement host + manual restore
```

Sem HA, auto-failover, zero-downtime ou RPO≈0 assumptions.

3J-02 quantifica RPO/RTO e what survives; 3J-03 owns operational restart/host-loss procedure; 3M owns semantic settlement.

## 14. Proof obligations

```text
P1 workstation off → PROD independent on company server
P2 remote outside LAN/VPN → no ingress
P3 VPN + plaintext HTTP → not normal serving path
P4 VPN user without Conexus permission → DENY
P5 first-user browser → trusted HTTPS cert + Secure/__Host session behavior
P6 public Internet path → no intentional Hub/MANAGED listener
P7 MANAGED → exact active-Release bytes, no latest/rebuild fallback
P8 sandbox → no generic/public Hub inbound
P9 same-process qualification passes → no split required
P10 runtime isolation fails materially → split trigger fires without domain redesign
P11 owner/store isolation survives physical co-location
P12 production HTTPS egress → expected end-to-end trust, no unexpected interception
P13 proving state → cannot silently become PROD authority
P14 host/VM loss → serving stops honestly, no HA fiction
P15 private exposure → explicit config + existing OBS/audit recording semantics as applicable
```

## 15. REJECT / DEFER F1 machinery

Não criar por 3J-01:

```text
cloud/VPS requirement
managed PostgreSQL
second physical host / replication
Kubernetes / service mesh
load balancer / CDN / public ingress
Tailscale on top of current VPN
blue-green/canary/HA/failover framework
fleet scheduler / cloud abstraction / IaC platform requirement
multiple Hub processes
MAR standalone service
E2B inbound gateway service
internal PKI service
MDM requirement
new operational-event domain record
```

## 16. Routing

```text
3J-02 → backup classes, RPO/RTO, off-host immutability, Git-loss, restore proof, controlled proving→PROD migration if needed
3J-03 → boot, secrets, startup/shutdown/restart, platform deploy, emergency stop, availability, host-loss operation
3L → E2B/Mastra/runtime-isolation/model-spend/Verification-Observability truth
3M → interrupted durable-work semantic recovery
Realization Planning → hypervisor/distro/sizing/DNS/TLS/service manager/ports/firewall/storage paths
```

## 17. Reopen triggers

```text
company server becomes unsuitable
measured uptime/RTO/RPO exceeds single-host/manual restore
first public/external browser consumer
VPN cannot satisfy first-user reachability
production network cannot satisfy required provider egress
future integration proves special reachability/custody constraint
CX-RUNTIME-ISOLATION-01 forces split
store workload/availability needs independent placement
customer/compliance changes placement
first real DEDICATED deployment
```

Generic cloud preference or hypothetical scale does not reopen.

## 18. Outcome

```text
prior broad authority reopen            = NONE
bounded amendment                       = C-015 §5 + C-016 §6 exposure realization only
C-016 remote HTTPS property             = PRESERVED
first production placement              = existing company server / on-prem
production execution class              = dedicated Linux VM/guest
Hub application process baseline        = one
Postgres/Mastra/backing                  = co-located same VM/failure domain
public ingress                           = 0
private ingress                          = company LAN/VPN + HTTPS
Sankhya topology authority               = 0
extra MANAGED deployment unit           = 0
HA/cloud/distributed machinery           = 0
new module / durable record / framework = 0
outcome                                  = CURRENT STRUCTURE CONFIRMED
```

C-001 remains product vision authority.

## 19. Provenance

Non-authoritative review inputs:

- `3J-FABLE-DIALOGUE-intake-decomposition.md`;
- `3J-FABLE-DIALOGUE-first-production-topology-placement-ingress.md`.

Independent Fable verdict: `ACCEPT CANDIDATE`.

Adjudication:

```text
VPN substitution → explicit bounded amendment; legacy agent_event wording reconciled to current 3E-02 OBS inventory
outbound TLS → property + production activation proof, not pre-VM architecture blocker
proving→PROD → no silent copy; mandatory clean init rejected as over-strong; controlled migration/restore remains possible via 3J-02
```

No Round 2 required; no material contradiction remained.
