# Integrations and Capability Gateway

Current technical detail extracted without semantic rewriting from the accepted Phase-3 architecture baseline. `docs/ARCHITECTURE.md` owns the overview; this file owns the detailed task surface named by its title.

## 18. Connections architecture

## 18.1 Ownership

```text
Connection.ownerScope = WORKSPACE | PROJECT

WORKSPACE
→ reusable organizational Connection

PROJECT
→ private Project Connection, not implicitly reusable by siblings

Connections
→ logical Connection/qualification/credential-handle facts

Project
→ ProjectConnectionBinding to exact ConnectionRevision

CredentialBackend
→ encrypted secret-byte/crypto mechanics

Gateway
→ trusted last-mile execution
```

Provider does not determine scope, and cross-Workspace use is denied. These rules preserve one Connection class; they do not create two Connection classes, a generic scope engine or a generic ResourceBinding framework.

## 18.2 Connector model

Connector definitions remain narrow/declarative and provider-aware enough to express real auth shape, operations, effects/idempotency, environment/qualification and bounded provider-specific behavior.

Native/provider-specific operations are admissible where that is the honest semantic shape. Lowest-common-denominator flattening and full provider DTO mirroring are both rejected.

Free-form hook runtime is not baseline merely for future flexibility.

## 18.3 Secret lifecycle

Connection secret plaintext exists only at:

```text
A. write-only trusted administration ingress
B. Gateway trusted last-mile external use
```

No read-back API by default. Credential material is durable-before-visible and fails closed on corrupt/missing/unsupported backing/key state.

Logical credential version, crypto key version and transient access-token generation remain separate meanings.

---

## 19. Capability Gateway architecture

Gateway is the narrow execution boundary for governed business/application capabilities and enterprise effects.

## 19.1 Owns

```text
current capability/effect admission
exact Connection/binding resolution where external
business/application external I/O
effect identity/idempotency/replay safety
last-mile precondition/effect rules
credential materialization at exact use point
execution receipt / traffic-state truth
external-effect unit/budget authority
```

## 19.2 Does not own

```text
Project business meaning
Brain semantic meaning
Account identity
Product Agent lifecycle
Release source authority
model-spend authority
```

## 19.3 Caller surfaces and the 3A-R9 amendment

Gateway caller context is surface-specific. Current callers include the bounded explicit:

```text
MANAGED_JOB
```

This is the 3A-R9 amendment to the older 3D-02 caller list. The Hub derives exact `JobRun`, Project/environment, Release, Job ArtifactRevision and admitted input/occurrence identity server-side; the caller cannot select arbitrary Project, Connection, Release, revision or environment. Package D must prove this context cannot widen authority.

## 19.4 Retry law

```text
runtime retry != effect retry permission
```

Possible external acceptance + ambiguous response:

```text
OUTCOME_UNKNOWN
→ current reconciliation/evidence
-X-> blind replay
```

## 19.5 Closed Contracts/API projection

```text
LIVE SURFACE = INTERNAL | INDEPENDENT
CONDITIONAL  = routing only
persistence alone != contract
VERSION-GAP  = PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD
```

Payload families remain owner-specific; there is no `UniversalRequest`, `UniversalResponse`, `UniversalStatus` or `InternalFailure`. One `ApprovalRequest` represents one human decision over one exact sealed effect subject. Bindings remain concrete: `ProjectConnectionBinding` and `ProjectBrainBinding`.

The closed public consumer-behavior code baseline is:

```text
CLIENT_OUTDATED
CAS_CONFLICT
CAPABILITY_UNAVAILABLE_HEALTH
NOT_FOUND
OPERATION_REJECTED
VALIDATION_FAILED
MANIFEST_INVALID
OUTPUT_CONTRACT_VIOLATION
INTERNAL_ERROR
```

`code` is the semantic consumer-behavior key; HTTP/transport status is not a second taxonomy. Exact route and DTO spelling remain derived realization, not frozen here.

---

## 37. First vertical architecture — Budget Analyzer

The first vertical proves one real composition, not every platform capability.

```text
Workspace: Metal Nobre
├── Workspace Brain
│   └── budget/pending/conversion semantics + caveats
├── Connection
│   └── Sankhya
└── Project: Budget Analyzer
    ├── Project Baseline
    ├── ProjectBrainBinding
    ├── ProjectConnectionBinding
    ├── governed managed sync
    ├── derived analytical Project DB read model
    ├── registered read-only Query capabilities
    ├── React application/dashboard
    └── exact Release / Published Application
```

Data path:

```text
Sankhya
→ Gateway live reads
→ Discovery / qualification / reconciliation / verification / Evidence

Sankhya
→ governed sync
→ Project analytical read model
→ registered Query capabilities
→ dashboard
```

Truth laws:

```text
Project DB != Sankhya source authority
Project DB != Brain semantic authority
read model exists != sync completeness proved
historical benchmark != current operational truth
```

No Product Agent or external/business write is required for this vertical.

The Sankhya/read-model pattern is not universal doctrine; every future Project selects the minimum path required by its current Baseline.

---
