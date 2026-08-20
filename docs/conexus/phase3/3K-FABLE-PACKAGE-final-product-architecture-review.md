# 3K — Final Independent Adversarial Review Packet

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3K — Frontend / Product Architecture  
**Purpose:** one final independent adversarial challenge after internal convergence  
**Important:** this file is not authority, does not close 3K, does not authorize implementation, does not amend any accepted decision and must not be treated as evidence of review merely because it exists.

## 1. Reviewer role

Act as an **independent adversarial architecture reviewer**.

Do not optimize for agreement with the candidate architecture. Attempt to falsify it.

The review must distinguish:

```text
accepted repository authority
!=
review packet
!=
review opinion
!=
implementation preference
```

A finding is material only when it demonstrates a real conflict, missing owner/authority, unsafe trust boundary, durable semantic ambiguity, missing current F1 journey, hidden second source of truth, or a choice that a future coding actor would otherwise have to make with material architectural consequences.

Do not create work from generic best-practice preference, symmetry, future optionality or framework capability without a named current consumer/failure class.

## 2. Required read order

Start at repository authority, not this packet:

1. `AGENTS.md`
2. `docs/engineering/standards/root-cause-global-maximum-method.md`
3. `docs/DOCUMENTATION-MAP.md`
4. `docs/conexus/DECISOES.md`
5. `docs/conexus/phase3/LEDGER.md`
6. exact authorities below

Primary 3K candidate authorities:

- `docs/conexus/phase3/3K-01-product-model-project-shell-build-workspace-inspectability.md`
- `docs/conexus/phase3/3K-02-trust-decision-observable-truth.md`
- `docs/conexus/phase3/3K-03-first-vertical-composition-data-path.md`
- `docs/conexus/phase3/3K-04-product-agent-authoring-management-use-journey.md`

Required composition authorities:

- `docs/conexus/phase3/3A-R6-phase3-critical-path-implementation-readiness.md`
- `docs/conexus/phase3/3A-R8-project-baseline-change-engineering-coherence.md`
- `docs/conexus/phase3/3A-R9-managed-job-deterministic-sync-dispatch-reconciliation.md`

Load-bearing prior authorities to inspect where the candidate relies on them:

- `docs/conexus/02-visao-escopo.md` — C-001
- `docs/conexus/03-requisitos.md` — C-003
- `docs/conexus/06-registro-artefatos.md` — C-005
- `docs/conexus/07-camada-dados.md` — C-006
- `docs/conexus/08-integracao-externa.md` — C-007
- `docs/conexus/09-agente-primeira-classe.md` — C-010 historical/superseded portions only as routed by later authority
- `docs/conexus/15-cerebro-empresa.md` — C-011
- `docs/conexus/10-scaffold-frontend.md` — C-012
- C-013..C-017 exact files as routed by `DECISOES.md` / documentation map
- `docs/conexus/phase3/3C-04-project-module-boundary.md`
- `docs/conexus/phase3/3C-05-builder-module-boundary.md`
- `docs/conexus/phase3/3C-10-production-agent-runtime-module-boundary.md`
- `docs/conexus/phase3/3C-15-managed-application-runtime-boundary.md`
- `docs/conexus/phase3/3D-02-capability-gateway-dependency-architecture.md`
- `docs/conexus/phase3/3D-03-application-use-case-orchestration.md`
- `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`
- `docs/conexus/phase3/3G-R1-behavioral-state-architecture-final-closure.md`
- `docs/conexus/phase3/3H-R1-runtime-agent-architecture-final-closure.md`
- `docs/conexus/phase3/3I-R1-security-authority-architecture-final-closure.md`
- `docs/conexus/phase3/3J-R1-deployment-operations-architecture-final-closure.md`

Use supporting Mitra/market/research material only as evidence after authority is reconstructed. Never let a reference implementation override accepted Conexus authority by familiarity.

## 3. Candidate architecture to falsify

Do not assume the following claims are correct; attack them against authority and failure classes.

### 3.1 Product shell

Candidate claims:

```text
Workspace shell != Project shell
Project is the dominant product/software context
Build is agent-first, Preview-dominant, Conexus-contextual
Data / Capabilities / Integrations / Agents / Brain / Versions / Activity are inspectable Project resources
Code / Diff are Build lenses
platform machinery remains progressive detail
```

3K-04 bounded-amends the Workspace shell with an access-filtered `Agents` catalog/projection while keeping Product Agent ownership Project-scoped.

### 3.2 Truth model

Candidate claims:

```text
UI projects owner truth; never owns it
observed != verified
loading != empty != failed != partial
Release AVAILABLE / pointer swapped != SERVED_VERIFIED
AgentRun completion != effect success
no Finding != verification
unknown/missing != zero
four human decision families remain semantically separate
```

### 3.3 First vertical / data path

Candidate claims:

```text
Conexus has no universal LIVE/MIRROR/HYBRID integration default
Connector declares source capability
Project Baseline chooses the current product data path
Budget Analyzer uses derived Project analytical read model
live source access remains Discovery/qualification/reconciliation/verification/Evidence anchor
mirror is not source/semantic authority
first vertical remains read-only and does not invent Product Agent/effect use
```

3A-R9 closes the sync trigger with governed managed sync rather than a generic automation/workflow platform.

### 3.4 Product Agent product model

Candidate claims:

```text
Product Agent remains Project-owned / git-first / Release-pinned
canonical authoring remains agent/v1
Agent Builder is a specialized Builder experience, not another module/runtime/database
structured/manual + natural-language authoring converge on the same Change/candidate
missing capabilities/integrations may be proposed only as explicit Change expansion
Agent ToolProjection compiles governed owner resources; no UniversalTool domain
Workspace Agents is discovery/observation projection, never Agent owner/fleet runtime
Builder is source-aware; Product Agent is product/context-aware
Product Agent gets typed context refs/hints, not browser-authored business truth
repo/source/shell/filesystem/browser/raw network are not default Product Agent powers
interactive and headless are usage modes of the same Product Agent concept
only currently admitted trigger/memory/runtime regimes may be exposed in F1 authoring
Mastra is runtime mechanics, never competing authoring/version authority
```

## 4. Mandatory adversarial questions

### A — Completeness / coding-actor leakage

Attempt to find any current F1 product decision still left to a coding actor, including:

- Workspace/Project selection and creation;
- Inception / Baseline approval;
- Change/correctness review;
- Build progress and blocked/waiting semantics;
- Finding/Evidence/verifier feedback;
- Connections administration/qualification/use;
- Brain binding/use;
- Preview/review;
- Publish/Promotion/rollback;
- Product Agent authoring/testing/publishing/use;
- MANAGED app access;
- operational timeline;
- permissions/access management;
- first vertical source/data path;
- Project duplication semantics if product placement is materially unresolved.

If an unresolved item is only component/layout/DTO/transport/library spelling and existing authority makes its semantic meaning unambiguous, classify it as Realization rather than a material 3K finding.

### B — Workspace Agents catalog

Try to prove that the cross-Project catalog:

- secretly moves Agent ownership to Workspace;
- requires a new durable fleet record/state;
- leaks Agents across unauthorized Projects;
- requires a new L7 use case rather than direct read/public projections;
- creates a second current status/truth store;
- creates global mutation/stop/publish authority absent a current failure class;
- conflicts with 3A-R7 rejection of a platform/global persistent Agent artifact.

If none of those follows, do not reject the catalog merely because other products call similar features a registry/control plane.

### C — Agent authoring authority

Try to prove that manual structured editing + natural-language Builder cannot converge on one canonical `agent/v1` without either:

- a second mutable Agent draft authority;
- hidden direct production mutation;
- bypassing Change/Baseline/Release;
- making trivial edits unnecessarily model-dependent;
- creating unreviewed capability/permission/effect widening.

Challenge Mastra Stored/Editor/File-Based Agent use specifically: runtime convenience must not become target-authority override.

### D — Tool model

Try to prove that ToolProjection is insufficient or contradictory.

Check whether:

- Query/Action Capability and Integration Operation can remain owned by their existing domains while producing Agent-facing tools;
- ToolProjection can be Release-pinned and fail-closed;
- adding platform-native or future agent-as-tool behavior requires a current new domain or can remain consumer-triggered;
- a universal Tool owner is secretly required;
- generic `execute(anySlug)` would bypass current safety semantics.

Do not assume every Tool must be a Capability. Do not create a UniversalTool merely for naming symmetry.

### E — Builder source-aware vs Product Agent context-aware

Try to falsify the separation:

```text
Builder → scoped source-aware engineering context
Product Agent → typed product/app context + Brain + governed ToolProjection
```

Find a current Product Agent consumer that *requires* repo/source/shell/browser/filesystem/raw-network power for F1. If no named consumer requires it, do not promote those powers merely because Mastra/frameworks support them.

Check that app-context hints cannot become authorization/business truth simply because they came from a rendered UI.

### F — First vertical distortion

Try to show that Sankhya or the Budget Analyzer has been promoted improperly into a platform-wide law.

Specifically challenge:

- universal mirror assumption;
- universal ERP semantics;
- unnecessary replication scope;
- false local-read-model authority;
- benchmark numbers treated as current production truth;
- sync machinery leaking into a generic automation product;
- fake Product Agent/write/effect introduced just to exercise architecture.

### G — Truth / UI semantic collapse

Try to construct false-green scenarios where UI can claim success/live/verified/healthy/empty/zero while owner authority has not established it.

Challenge especially:

- partial/stale sync;
- Connection configured/qualified/bound/healthy/authorized distinctions;
- AgentRun vs effect outcome;
- pointer swap vs served verification;
- cost missingness;
- provider/guest observation vs authoritative Evidence;
- approval subject mutation after human presentation.

### H — Anti-overengineering / deletion test

For every proposed finding, ask:

```text
What breaks if we do NOT add this machinery now?
Which current consumer/failure class requires it?
Can existing owner + seam + Realization detail satisfy it later without changing authority?
```

Explicitly attack unnecessary proposals for:

- AgentBuilderModule/DB/runtime;
- Workspace Agent fleet owner;
- UniversalTool;
- generic Agent workflow engine;
- universal chat widget;
- broad Product Agent computer/browser/source access;
- generic Automation/Scheduler/Job domains;
- universal data-path strategy engine;
- extra status/truth/readiness stores.

## 5. Required output

Return exactly these sections.

### 1. Verdict

Choose one:

```text
CURRENT STRUCTURE CONFIRMED
CURRENT STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS
MATERIAL FINDINGS — DO NOT CLOSE 3K
```

### 2. Material findings

For each material finding use:

```text
ID:
Claim challenged:
Applicable authority:
Failure class / concrete counterexample:
Why material:
Smallest sufficient correction:
Owner / phase to reopen or amend:
What must remain deferred:
```

If none, write `NONE`.

### 3. Non-material corrections / ambiguities

List only corrections that improve wording/routing/Realization clarity without changing owners, durable meaning, trust boundaries or public/product semantics.

If none, write `NONE`.

### 4. Deletion test

List any candidate mechanism that should be removed/deferred because it lacks a current consumer or failure class.

If none, write `NONE`.

### 5. Coverage result

State whether C-001/C-003/3A-R6 current 3K obligations are covered and identify any true orphan requirement.

### 6. Reopen result

State explicitly:

```text
reopen 3B–3J = NONE | <exact target + reason>
new module required = 0 | <exact module + proof>
new durable record required = 0 | <exact record + proof>
new database/schema required = 0 | <exact requirement + proof>
```

## 6. Reviewer constraints

- Do not implement anything.
- Do not edit authority.
- Do not treat this packet as authority.
- Do not score architecture with an opaque numeric score.
- Do not invent future requirements.
- Do not recommend framework capabilities merely because available.
- Do not confuse presentation projection with durable owner state.
- Do not confuse Mastra runtime mechanics with Conexus Product Agent authority.
- Do not assume Mitra, Mastra, Salesforce, Microsoft, Google, Retool or any other product is target authority.
- Be willing to conclude `CURRENT STRUCTURE CONFIRMED` if attacks do not survive the materiality test.

## 7. After the review

The independent review output is evidence only.

```text
Fable output
→ ChatGPT/operator adjudication against repository authority
→ surviving material Finding(s) only
→ bounded Decision Loop if required
→ otherwise 3K final closure/ratification
```

Do not close 3K inside the review itself.