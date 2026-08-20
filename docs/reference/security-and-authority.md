# Security and Authority

Current technical detail extracted without semantic rewriting from the accepted Phase-3 architecture baseline. `docs/architecture/index.md` owns the overview; this file owns the detailed task surface named by its title.

## 31. Security architecture — six logical trust zones

Zones are **security classifications, not mandated deployment units**.

## Z1 — Browser / Client

Authenticated or not, caller remains untrusted for authority-bearing fields. Client Project/Release/role/approval IDs are references/hints only and resolved server-side.

Control Plane, Preview and Published App browser contexts remain separate.

## Z2 — Trusted Hub Control

Trusted modular-monolith owners and co-located trusted control-side runtimes.

Module boundary is not intra-process RCE isolation. Full arbitrary trusted-Hub-process compromise remains an accepted F1 residual class; normal-path least privilege still limits avoidable blast radius.

## Z3 — Guest Execution

Current named guest = E2B Builder sandbox/app-under-test.

Root-capable/untrusted; gets bounded run/work capabilities only, no durable privileged credentials.

## Z4 — DEDICATED External Application

Authenticated external server-to-platform consumer under DEDICATED profile when a real consumer exists.

Its independently executable application may own its runtime/data plane and Product-specific network behavior. Conexus-owned capability access is explicit binding/Platform Service only; Gateway is that governed capability boundary, not the application's universal network stack. No Hub internals, Connection/Hub/Vault credentials or Project DB credentials are inherited. Physical DEDICATED deployment remains deferred until first real deployment.

## Z5 — External Provider / Enterprise

Model provider, E2B, Git provider, package registries, ERP/marketplace, backup targets and similar systems.

Authenticated/TLS provider response is observation/data, never Hub authority merely by transport.

## Z6 — Trusted Data / Storage Infrastructure

Logical storage zone containing:

```text
hub_control
Project databases
mastra_builder
mastra_par
Artifact/Blob/CAS backing
CredentialBackend backing
backup material
```

Not one credential domain. Each store preserves owner-specific capabilities/lifecycle.

---

## 32. Trust crossings and egress

## 32.1 Business/application egress

```text
Published/managed app capability
Product Agent business capability
Builder governed enterprise-data capability
→ Capability Gateway
→ exact Connection / Project-data executor
```

Generated app/browser/guest never bypasses Gateway to ERP/enterprise target.

## 32.2 Platform-control egress

Owner-specific infrastructure adapters may call exact providers without routing all control traffic through Gateway:

```text
CodingRuntime → E2B
GitInfra → Git provider
Model adapter → model provider
backup operation → backup target
admitted build/package mechanics → pinned registry/catalog target
```

Every privileged adapter has a named owner, owner-specific credential and server-derived/pinned destination.

No universal privileged `fetch(url, secret)` service/egress proxy F1.

## 32.3 Browser egress

Browser self-only/CSP/session/request-authenticity laws are platform-controlled. New cross-origin browser capability is explicit Product/security contract change, not app-config convenience.

## 32.4 Future SaaS ↔ private/on-prem reachability

C-003 preserves a real future requirement class:

```text
SaaS Conexus selected
+ enterprise target only reachable privately/on-prem
→ decide authenticated private reachability/custody topology
```

Current architecture does **not** preselect or deploy a managed tunnel F1. Mechanism is rederived from real SaaS/customer topology.

## 32.5 DEDICATED trusted exchange

The DEDICATED trust contract is current even though its physical deployment is deferred:

```text
principal              = DedicatedApplicationPrincipal
client authentication  = private_key_jwt
signed assertion binds = exact ReleaseRef
access token           = short-lived signed bearer
F1 mode                = SERVICE_SCOPED only
```

Every Platform Service request rechecks current `credentialGeneration`, Project/Release containment, Release-pinned service composition and current owner/security gates. No auth record/session store, refresh-token, DPoP, mTLS or fleet machinery is introduced.

---

## 34. Published Application access and private storage

## 34.1 Independent app authorization

```text
CONTROL_PLANE
!= PREVIEW
!= PUBLISHED_APP
```

Current closed F1 Published App role set:

```text
{admin, member}
```

until explicit later material Product decision changes it.

```text
Project admin -X-> app admin automatically
app member    -X-> Builder/source access automatically
```

Published App authorization is server-derived; frontend is not enforcement authority.

## 34.2 Session boundary

Current C-015/3I direction uses server-owned opaque session/cookie semantics; historical URL-fragment bearer flow is not current authority.

## 34.3 Private-by-default bytes

Attachments/blobs are private by default:

```text
owner record/current authorization
→ access decision
→ storage byte retrieval
```

Public exposure requires explicit admitted Product policy/consumer. Storage key/path/prefix/provider URL never grants semantic access by possession alone.

---
