# Frontend and Product Surfaces

Current technical detail extracted without semantic rewriting from the accepted Phase-3 architecture baseline. `docs/architecture/index.md` owns the overview; this file owns the detailed task surface named by its title.

## 33. Scaffold and frontend architecture

Current paved road:

```text
React
TypeScript strict
Vite SPA
TanStack Router/Query family under current scaffold authority
```

Framework reconsideration is not open absent real failure class.

## 33.1 Versioned deterministic scaffold

The platform scaffold is versioned/byte-controlled and intentionally **infrastructure-rich / Product-feature-poor**.

It carries paved-road mechanics so each generated Project does not ask its coding agent to reinvent auth boundaries, API/client contract patterns, error/loading truth, security headers/CSP rules, test/build gates, telemetry hooks or other accepted platform invariants.

An escape hatch exists for a real Project need; using it does not silently waive platform/security contracts.

## 33.2 Three ownership layers

Generated code is classified conceptually as:

```text
GENERATED
→ reproducible from platform source/model; do not hand-own divergent semantics

PLATFORM-CONTRACT
→ Project-visible seam controlled by platform contract; app can consume but not weaken invariant

APP-OWNED
→ Project business/product source the Builder may legitimately evolve
```

This prevents regeneration from overwriting Project-owned work and prevents app code from mutating platform security/authority seams by convenience.

## 33.3 First-build conformance

Scaffold presence is not proof. The first real Product slice must demonstrate the applicable scaffold/codegen/frontend/security contracts actually fire.

Implementation-dependent scaffold probes remain downstream rather than being faked in 3L without Product code.

## 33.4 Workspace shell

```text
Workspace
├── Projects
├── Agents
├── Brain
├── Connections
├── Members
└── Settings
```

## 33.5 Project shell

```text
Project
├── Build
├── Data
├── Capabilities
├── Integrations
├── Agents
├── Brain
├── Versions
├── Activity
└── Settings
```

Exact labels/order/components are realization details; semantic surfaces are current.

## 33.6 Build surface

```text
Project navigation
+ Preview dominant/default
+ contextual Conexus/Platform Consultant panel
+ Preview | Code | Diff lenses
+ Plan/checklist/Evidence/cost detail as needed
```

No second IDE/editor mutation authority.

Load-bearing projection laws:

```text
working != blocked != waiting-for-user != completed
building next candidate != currently inspectable last-good Preview
```

Building the next candidate must not require destroying/replacing the last usable Preview before the new candidate is ready.

## 33.7 Honest client projection

Frontend/cache is projection only. It preserves loading/empty/failure/partial, source/freshness/coverage/provenance, exact approval subject and Release/serving distinctions.

## 33.8 Contextual inspectability / progressive disclosure

```text
REAL PRODUCT RESOURCES
→ directly inspectable: Data, Capabilities, Integrations, Product Agents, Brain binding,
  Versions, Preview, Code/Diff and Activity/Evidence entry

PLATFORM MACHINERY
→ progressive detail: WorkUnit/ActorRun internals, Gateway/Registry/CAS mechanics,
  Mastra/E2B refs, owner rows and technical digests unless material
```

`Ask Conexus about this` passes selected resource/context to the contextual assistant under current server-derived authorization. It grants no new authority, capability or cross-Project access.

---
