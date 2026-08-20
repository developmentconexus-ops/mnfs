# Release, Deployment, and Operations

Current technical detail extracted without semantic rewriting from the accepted Phase-3 architecture baseline. `docs/architecture/index.md` owns the overview; this file owns the detailed task surface named by its title.

## 12. Release and Promotion architecture

## 12.1 ReleaseManifest = exact composition root

Current Release composition is one immutable closure over the Product facts needed by serving/runtime, for example:

```text
source commit/tree/bundle identities
frontend/runtime-contract digests
registry artifact set / exact artifact revisions
agent revision + model/tool/context/policy pins where applicable
Brain revision + ProjectBrainBinding
ProjectConnectionBinding / qualified Connection revision
migration head + schema fingerprint + PG major
configContractDigest
lockfile/dependency digest
verification/validation Evidence digest
provenance / run identities
```

Exact schema spelling belongs Realization Planning, but the composition-root law is current.

```text
source/build/evidence digests close first
→ canonical ReleaseManifest closes over them
→ external attestations may reference the closed digest
```

No circular “manifest writes itself into source it hashes” design.

## 12.2 Three separate histories

```text
operational/run detail
!= Git source/change history
!= user-visible Release/Version history
```

## 12.3 Candidate/release vs promotion/environment state

These are separate planes, not one generic Status FSM.

Conceptual current candidate/release lifecycle:

```text
BUILDING
→ VERIFIED
→ AVAILABLE
terminal rejection/invalidity where applicable
```

Conceptual target-environment promotion progression includes:

```text
APPROVED
→ CONFORMANCE_CHECKED
→ migration/recovery branch when required
→ POINTER_SWAPPED
→ SERVED_VERIFIED
```

Material failures remain explicit, such as conformance failure, migration failure, CAS conflict and served-digest verification failure.

`DRIFT`, `STALE` and schema-rollback ineligibility are orthogonal blocking conditions, not proof of success.

## 12.4 CAS / expected state

Promotion pointer changes use expected current generation/pointer semantics. Conflict never force-writes over a new current state; candidate must revalidate/reconcile against the new state.

## 12.5 Serving verification

Pointer swap is not completion.

```text
real serving path GET/read
+ served revision/runtime/frontend digest == expected exact Release
→ SERVED_VERIFIED
```

HTTP 200 from stale content is not success.

## 12.6 Current proof and Promotion concurrency

```text
change_acceptance/current proof
→ rechecked at ComposeRelease
→ rechecked immediately before material Promotion steps
→ stale/inadmissible proof refuses progression without rewriting history
```

F1 admits at most one non-terminal Promotion per `(Project, PROD)`. Admission must use a conflicting Release-owner guard; the concurrent loser performs zero DDL, drain or other material step. This is refusal, not a Promotion queue/lease.

## 12.7 Maintenance and post-serving truth

Once a maintenance-required transition makes old serving incompatible, its serving-block survives Promotion failure/terminalization. Closing a Promotion never silently re-enables the old Release; exit remains forward-fix, validated restore or safe recovery Promotion.

Governance/proof drift after `SERVED_VERIFIED` does not automatically deactivate or rewrite the active pointer. Current security/health/owner gates may still narrow individual operations, and future Promotion uses current proof.

---

## 13. Environment architecture

Current environment classes are deliberately bounded:

```text
BuildValidationDatabase   ephemeral proof fixture
workspace DEV             persistent Project development business DB when needed
RunPreview                ephemeral authenticated candidate serving
PROD                      persistent production environment of the SAME Project
```

No permanent generic staging environment F1.

## 13.1 PROD is not a forked logical Project

PROD is the same Project under separate environment/database/current Release authority.

A production Project DB is isolated from DEV by connection/roles and is provisioned lazily on the first Promotion under the C-014 `PROVISIONING → READY | PROVISION_FAILED` semantics; partial/orphan provisioning is reconciled rather than treated as ready.

## 13.2 Environment ↔ Connection binding

Environment use of external systems is explicit. PROD does not silently use a sandbox Connection and DEV/Preview do not silently use production Connection merely because the provider is the same.

---

## 15. Config identity and secret rotation

Two independent axes:

## 15.1 `configContractDigest`

Part of Release identity: slots/semantics/scope/type/non-secret values and exact logical environment bindings needed by the Product.

Functional config-contract change makes the candidate stale/requires governed revalidation/Release treatment.

## 15.2 Secret material

Outside Release identity:

```text
slot/credential handle
→ secretVersion / cryptoKeyVersion / token generation
```

Compatible secret rotation may change value/version without rebuilding the Product Release. Secret value never enters manifest/source/artifact.

Conformance verifies required references/resolvability, never logs secret plaintext.

---

## 16. Migration architecture

Every production schema change remains a governed Release/migration transition with real validation, not a post-fact log.

For every migration, the universal proof order is:

```text
QA-DB-1 → QA-DB-2 → QA-DB-3
```

The migration class changes fixture/rehearsal depth, never removes the gate. A periodic live-database × migration-ledger drift check remains required between builds.

Promotion never rebuilds/recompiles a candidate under the same Release identity. Config/proof drift makes the candidate `STALE` and requires revalidation; it never silently produces different bytes under the same Release.

Current F1 uses two semantic branches:

## 16.1 Backward-compatible migration

Old runtime + new schema and new runtime + new schema compatibility are proven where the branch claims compatibility.

Expand/contract remains a design technique; compatibility proof is the gate.

A migration already recorded/checksummed is not blindly re-applied on Promotion retry.

## 16.2 Maintenance-required migration

Used when old runtime cannot safely serve the new schema.

Current properties:

```text
drain relevant mutating/queued/deferred/retry work
pre-migration backup confirmed
apply migration
post-migration conformance
old incompatible serving remains blocked
recover via idempotent continuation / forward fix / validated restore
```

No silent reopening of incompatible old serving.

## 16.3 Production migration direction

Successful production migrations are **forward-only**. Down migrations are not the Release rollback mechanism. Reverse migration can remain a DEV/investigation tool where safe; disaster restore is a recovery mechanism, not normal Release rollback.

## 16.4 Pre-migration recovery evidence

Promotion requiring migration records/validates required backup/recovery material before crossing the irreversible/maintenance boundary according to 3J-02 current recovery authority.

---

## 17. Project duplication architecture

Current C-014 Product contract is intentionally narrow:

```text
Duplicate Project
→ copy source/code
→ copy config schema/contracts
→ copy declarations/source artifacts as applicable
→ ask about business data
→ default = NO DATA
```

Never silently copy:

```text
Project DB contents
credentials
Connection bindings
current external authorization
runtime sessions/history
```

The accepted C-014 base is no Project DB contents, credentials or Connection bindings. Excluding current external authorization and runtime sessions/history is a monotonic consequence of their separate owner authority, not a new copy authority.

Destination must explicitly establish its own current Brain/Connection/environment/access bindings.

---

## 30. Observability, audit, cost and execution transparency

## 30.1 Durable owner facts vs observation

Current Phase-3 data authority uses owner-specific durable records/projections. Historical C-013 `agent_event` exact table/type wording is **not** a current generic event-owner/table requirement.

C-013 enduring semantics survive:

```text
append-only/auditable observations where appropriate
producer trust
causal correlation
usage/cost state honesty
live checklist
completion ladder
missing != zero
telemetry never acceptance authority
```

## 30.2 Correlation anchors

Conexus IDs:

```text
ChangeId / CodingSessionId / WorkUnitId / ActorRunId
ConversationId / AgentRunId / ApprovalRequestId / trigger occurrence
Release/Promotion/Effect owner IDs
```

Observational IDs:

```text
traceId/spanId
Mastra run/thread/tool refs
E2B sandbox/process refs
provider request IDs
browser/request IDs
```

Domain run may span `0..N` traces.

## 30.3 OTel

OpenTelemetry is preferred vendor-neutral observation plumbing where useful, not correctness authority.

A perfect one-tree trace is not required. High-cardinality owner IDs belong mainly in traces/logs/correlation records, not default metric dimensions.

OTel baggage excludes by default:

```text
credentials
security decisions / mutable authority facts
PII / secrets
all Conexus owner IDs
```

Baggage is cleared/omitted before external or untrusted egress unless a future explicitly admitted crossing says otherwise. Trace context remains correlation only.

## 30.4 Producer trust classes

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

Authenticated transport never upgrades trust class by itself.

## 30.5 Cost/usage states

Execution surfaces preserve distinctions such as:

```text
usage_state:
  REPORTED | INFERRED | MISSING

calculation_state:
  CALCULATED | MISSING_USAGE | MISSING_PRICE | UNSUPPORTED

reconciliation_state:
  NOT_AVAILABLE | PENDING | MATCHED | MISMATCH | ADJUSTED
```

Calculated/provider-reported/reconciled cost remain separate facts.

User-facing execution detail may show, when available:

```text
model/provider
token classes (input/output/cache/reasoning)
USD/cost state
duration
tools/runtime observations
sandbox wall-clock monetary cost separately from LLM cost
```

Rollup can aggregate by turn/run/conversation/Project/period without creating aggregate tables as new business authority.

## 30.6 Three degradation classes

```text
ordinary Operational Telemetry missing
→ degraded/MISSING; domain work may continue where telemetry is not required

audit-required durable AuditRecord unavailable
→ FAIL CLOSED

verification-required Evidence missing
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

Audit Trail and Operational Telemetry remain distinct meanings inside the Observability & Audit owner.

## 30.7 Required Evidence

If an assertion requires a class of runtime evidence:

```text
required Evidence missing
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

Package E owns deciding-evidence qualification of current surfaces.

---

## 35. First-production physical topology

This is **first-installation architecture**, not universal SaaS doctrine.

## 35.1 Development/proving

```text
operator Windows workstation
→ Ubuntu WSL2
→ development / qualification / proving
```

WSL2 is not production authority.

## 35.2 Physical failure domain

```text
existing company physical server
→ Windows host
→ one dedicated Linux production guest/VM
```

Physical host/Windows/guest/storage loss may take the entire installation down. Accepted initially; no HA claim.

## 35.3 Inside Linux guest

```text
one Node/TS Hub application process
├── Control Plane / L7
├── Managed Application Runtime
├── Capability Gateway
├── Builder control-side runtime
└── Production Agent Runtime

PostgreSQL cluster
├── hub_control
├── mastra_builder
├── mastra_par
└── production Project DBs

local platform backings
├── Artifact/Blob/CAS classes
└── encrypted CredentialBackend backing
```

Physical co-location never merges owners/stores/credentials.

E2B remains remote guest execution outside the production VM.

## 35.4 Private ingress

```text
inside company → LAN → HTTPS → Conexus
remote employee → existing corporate VPN → private company network → HTTPS → Conexus
```

```text
public Internet ingress F1 = NONE
anonymous/public app access F1 = NONE
remote plaintext HTTP = DENY
```

VPN is reachability, never authorization.

Remote production HTTPS must be normally trusted by first-user browsers; certificate-warning click-through is not a normal production state. Placement must also preserve an out-of-band infrastructure/host path to administer or stop ingress/application independently from the served Conexus web path.

## 35.5 MANAGED serving

Hub/MAR serves exact active-Release bytes directly in the baseline. No standalone MAR service/CDN/load balancer/reverse-proxy architecture is required for optionality.

Concrete hypervisor, Linux distro, VM sizing, hostname/DNS/TLS termination, service manager, ports/firewall/storage paths belong derived Realization Planning/activation proof.

Development/proving state can never silently become PROD authority. Activation requires explicit production identity/configuration and proof; failure blocks activation rather than relabeling the proving environment.

---

## 36. Operational resilience architecture

Current first-installation posture:

```text
single physical failure domain accepted
manual restore acceptable initially
RPO <= 6h
RTO <= 8h
off-host recoverable set required
complete restore proof from a real off-host protected generation before first production
whole-Hub emergency-stop drill before first production
no HA/auto-failover/multi-region claim
```

Required recovery set:

```text
hub_control
all production Project DBs
mastra_par
non-reconstructible digest-addressed bytes
CredentialBackend ciphertext backing
provider-independent canonical Git recovery bundles
recovery manifests
```

Not required by default: `mastra_builder` and E2B/validation/cache/reconstructible state. The RPO/RTO numbers are the first-installation operations contract, not a SaaS SLA.

3M still owns the semantic question: after interruption/restore, do current durable facts suffice to decide resume/retry/reconcile without fabricated success?

---
