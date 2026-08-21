# Conexus OS — Permission Contract

> **Status:** CLOSED CANDIDATE / 4A OPEN / INDEPENDENT REVIEW PENDING / NOT RATIFIED
> **Purpose:** derive the smallest ordinary Permission vocabulary needed by the exact Conexus platform operation candidate without turning personas, screens, Keycloak claims or Published-App roles into a universal policy system.
> **Operation authority:** [operation-ledger.md](operation-ledger.md).
> **Mutable program status:** owned only by [../roadmap.md](../roadmap.md).

This document is the single candidate home for ordinary Conexus Control-Plane/runtime Permission names during 4A. It does not define HTTP security schemes, storage policy mechanics or a role editor and it does not authorize implementation.

The exact operation → principal/ingress/Permission/scope/outcome/current-authority/idempotency-concurrency mapping is canonical in the operation ledger. This document owns only the reusable ordinary Permission vocabulary and its separation from special/runtime/app authority.

---

## 1. Permission law

An ordinary Permission exists only when it represents a reusable semantic authority distinction that at least one current concrete operation needs.

```text
screen/button             -X-> Permission
narrative persona         -X-> Permission
Keycloak role/group       -X-> Permission
runtime/model/provider id -X-> Permission
Project business op name  -X-> global Permission string
```

A Permission is necessary but may be **insufficient**. Operations still recheck exact containment, current grant/membership, immutable subject, owner state, Release/binding pins and other current eligibility facts.

```text
Permission
= reusable semantic capability class

current owner facts
= whether this exact current subject may be exercised now
```

The vocabulary is not a universal policy language and does not imply a custom Role/Permission editor in F1.

---

## 2. Non-ordinary authority conditions

| Condition | Meaning |
| --- | --- |
| `authenticated` | valid current Conexus Account/session; Keycloak token alone is not sufficient |
| trusted `platform_operator` | first-installation/trusted F1 Account/Workspace provisioning condition; not a general tenant Permission |
| current Workspace membership | containment/disclosure root; does not grant all Workspace resources |
| exact Project grant | Project access fact; still constrained by operation Permission/current owner state |
| Published App role `{admin, member}` | independent app-use authority; never automatically Control-Plane authority or effect-approval authority |
| exact PAR AgentRun/ToolProjection | runtime capability context; not a human Permission |
| exact MAR JobRun/Release projection | managed execution context; queue identity is not authority |
| owner/system transition | internal current-state transition after admitted authority/proof; no public Permission |
| DEDICATED `SERVICE_SCOPED` projection | exact future service-principal allowlist; no concrete F1 Product operation without a real consumer |

`PlanningDepth`, `RigorProfile`, provider/model names, Mastra identities and E2B identities are never Permissions.

---

## 3. Ordinary Permission vocabulary

The vocabulary is frozen as the **4A candidate**, not yet operator-ratified.

### 3.1 Workspace and access

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `workspace.manage` | administer Workspace/Area structure and ordinary Workspace settings | `WS-03..06` |
| `workspace.access.manage` | administer Workspace membership, Area membership and Workspace-derived Project grants | `IAM-04..12` |
| `project.create` | create a Project in an exact Workspace or duplicate into an admitted destination Workspace | `PRJ-03`; destination side of `PRJ-06` |

### 3.2 Project

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `project.read` | inspect ordinary Project-level Product truth/projections | `PRJ-01/02/16/17/22`, ordinary Release/Promotion/serving/job/activity reads |
| `project.source.read` | inspect Project source/diff/authored definitions without write authority | `BLD-07..09`, `PRJ-20/21` |
| `project.data.read` | inspect declared Product/read-model/source resources without becoming a generic DB console | `PRJ-18/19`; Control-Plane `BRN-12` together with `brain.read` |
| `project.manage` | administer Project identity/lifecycle, Baseline, bindings and independent Published-App access configuration | `PRJ-04..15` where mapped; `IAM-14/15/17`; source side of `PRJ-06` |
| `project.build` | create/evolve accepted Project Product/Agent intent through Change/Builder | `BLD-01..04/06/10/16/17` |
| `project.review` | participate in exact Plan/Change checkpoint, Finding and Evidence review | `BLD-05/11..15` |

`project.manage` does **not** imply `project.build`, `project.review`, Published-App business use, Brain publication, Connection use or Release promotion.

### 3.3 Release, managed execution and audit

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `release.promote` | inspect exact target conformance and decide/perform governed Promotion/rollback | `REL-06`, `REL-08` |
| `job.run` | manually admit an occurrence of an exact Release-pinned managed `job/v1` | `MAR-03` |
| `audit.read` | inspect audit/effect/technical execution Evidence and exact decision subjects through read-only investigator paths beyond ordinary owner views | `OBS-02/04/05`, `GW-01/02`, investigator route of `PAR-09` |

Release composition is an owner/system transition gated by exact accepted proof; there is no `release.compose` Permission. Ordinary Release/Promotion history and serving/job-run projections use `project.read` where disclosed.

### 3.4 Brain

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `brain.read` | inspect current Workspace Brain, immutable revisions and health/conformance projections | `BRN-01..03/10`; Control-Plane `BRN-12` together with `project.data.read` |
| `brain.propose` | submit a provenance-preserving KnowledgeProposal without publication authority | `BRN-07` |
| `brain.discover` | initiate admitted read-only Brain Discovery against exact governed source scope | `BRN-04`; plus `connection.use` when an external Connection is required |
| `brain.review` | inspect/review/decide exact KnowledgeProposal subjects | `BRN-05/06/08` |
| `brain.publish` | publish a reviewed/validated immutable Brain revision | `BRN-09` |
| `brain.bind` | authorize a Project to adopt an exact Brain revision/binding, distinct from merely sharing the Workspace | `PRJ-11` together with `project.manage`; removal/narrowing needs no continued bind grant |

`BRN-12 RunAnalyticQuery` does **not** create `analyticquery.execute`:

```text
Control Plane human
→ brain.read + project.data.read + exact Project grant/binding/dataset authority

Published-App human
→ exact Release-declared app role subset + current app access + exact Brain/dataset projection

Product Agent
→ exact PAR ToolProjection + current AgentRun/Release/Brain/dataset projection
```

### 3.5 Connections

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `connection.read` | inspect exact Connector/Connection/revision/qualification facts in the admitted owner scope | `CON-01..04/09` |
| `connection.manage` | create/revise Connection configuration and write credential material through the protected write-only boundary | `CON-05..07` |
| `connection.qualify` | run exact environment/revision qualification Evidence without granting Project use | `CON-08` |
| `connection.use` | authorize use/binding of an exact Connection resource by an admitted Project/Brain operation; same Workspace alone is insufficient | `PRJ-14` with `project.manage`; external-source `BRN-04` with `brain.discover` |

`connection.use` does not itself grant runtime invocation. Runtime also requires exact ProjectConnectionBinding, Release/capability projection and current owner/Gateway gates.

### 3.6 Product Agent runtime

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `agent.trigger.manage` | create/revise/enable/disable exact `SCHEDULE` trigger authority for a Project-owned Product Agent | `PAR-11..16` |
| `agent.headless.invoke` | manually invoke an exact active Product Agent through the admitted headless surface | `PAR-05` |
| `agent.effect.approve` | participate as a human approver for an exact current sealed ApprovalRequest subject when separately eligible | `PAR-08..10` approver routes |

Product Agent authoring is **not** `agent.manage`; it remains ordinary Project evolution through `project.build` and the same Change/Release path.

Interactive Published-App Agent use is authorized by exact Published-App access/role + active Agent/Release semantics, not by `agent.headless.invoke`.

`agent.effect.approve` is a semantic authority distinction, not a Control-Plane UI entitlement. An eligible human may reach the exact owner-specific approval surface through Control Plane or Published App when that Product experience exposes it, but every decision still rechecks current approver eligibility, revocation, Release, exact sealed proposal and owner state. Published-App role `{admin,member}` alone is never approval authority; conversely, presenting approval in a Published App never grants Builder/Control-Plane access.

`audit.read` can expose `PAR-09` read-only to a separately authorized investigator; it can never decide an ApprovalRequest.

---

## 4. Candidate census

```text
workspace.manage
workspace.access.manage
project.create

project.read
project.source.read
project.data.read
project.manage
project.build
project.review

release.promote
job.run
audit.read

brain.read
brain.propose
brain.discover
brain.review
brain.publish
brain.bind

connection.read
connection.manage
connection.qualify
connection.use

agent.trigger.manage
agent.headless.invoke
agent.effect.approve
```

```text
ordinary Permissions = 25
status = FROZEN 4A CANDIDATE / NOT RATIFIED
```

The number 25 has no independent value. It survives because the completed operation mapping requires each distinction and no accepted operation requires a 26th ordinary Permission.

---

## 5. Explicit anti-expansion rules

Rejected unless material current Product Evidence proves a distinct reusable authority class:

```text
account.read
account.manage
area.read
area.manage
baseline.approve
finding.close
evidence.read
preview.read
source.file.read
query.execute
action.execute
integration.execute
analyticquery.execute
release.read
release.compose
promotion.read
effect.read
job.read
conversation.read
agent.run.read
agent.manage
workflow.execute
admin
superadmin
```

These either duplicate an existing semantic capability, mirror CRUD/UI nouns, describe operation/mechanism type rather than authority, or would create an unjustified universal policy layer.

Material compound mappings remain explicit rather than collapsed:

```text
SetProjectConnectionBinding
→ project.manage + connection.use + exact qualified compatible ConnectionRevision

SetProjectBrainBinding
→ project.manage + brain.bind + exact immutable Brain revision + binding conformance

StartBrainDiscovery using external source
→ brain.discover + connection.use + exact source/binding/egress admission

DecideApprovalRequest
→ agent.effect.approve + exact current approver eligibility + exact sealed proposal
→ current ingress may be CP or an exact admitted PA approval surface; PA role alone grants nothing
```

---

## 6. Published Application authorization remains separate

Current F1 Published-App role set remains exactly:

```text
admin
member
```

These roles are an independent Product authorization plane.

```text
Project admin -X-> app admin
app admin     -X-> project.manage
app member    -X-> project.read
app role      -X-> agent.effect.approve
```

Every exact Project-defined operation in `Ops(R)` declares its admitted app-role subset, PAR/MAR projection or future real DEDICATED service allowlist. Conexus does not create a global Permission per customer business operation.

For the operator-approved Budget Analyzer:

```text
admin  → AnalyzePendingBudgets + ListPendingBudgets
member → AnalyzePendingBudgets + ListPendingBudgets
```

No Product Agent, MAR JobRun or DEDICATED caller is admitted to those two operations in F1 merely to exercise infrastructure.

---

## 7. Project-defined capability authorization grammar

A Project-defined operation gains authority only from its exact Release contract:

```text
exact semantic operation
+ exact consumer/principal/ingress
+ exact Project/Published-App scope
+ exact operation-local app/runtime authority class
+ current Project/Brain/Connection/Release facts
```

Admitted operation-local caller classes include only current real cases:

```text
Published-App role subset `{admin, member}`
PAR ToolProjection
MAR JobProjection
DEDICATED SERVICE_SCOPED allowlist when a real consumer exists
Control-Plane Project capability where current Product semantics explicitly admit it
```

Future customer-specific business policy remains Project Product logic. It does not become an unbounded Conexus global Permission namespace.

---

## 8. Closure proof

The completed operation ledger maps every concrete operation to exactly one ordinary Permission route or explicit non-ordinary/special route.

```text
fixed platform operations                    = 114
fixed operations with authorization route    = 114/114
Budget Analyzer operations                   = 2
Budget operations with authorization route   = 2/2
ordinary Permissions                         = 25
operations requiring a new global business-op Permission = 0
Keycloak claims used as Product grants        = 0
Published-App roles implying Control Plane    = 0
Published-App roles implying effect approval  = 0
```

Closure challenge dispositions:

1. **PASS** — every fixed platform operation maps to ordinary Permission(s) or explicit special/current-authority conditions in the ledger.
2. **PASS** — no Permission exists only because a screen/menu/CRUD noun exists.
3. **PASS** — Workspace/Project/Brain/Connection/app/Agent authority remains non-transitive except where one operation explicitly requires a compound route.
4. **PASS** — Project-defined operations do not create an unbounded global Permission namespace.
5. **PASS** — Published-App roles remain independent from Control Plane Permissions and from effect-approval eligibility.
6. **PASS** — Keycloak proves authentication only and never substitutes for Conexus grants.
7. **PASS** — narrowing/revocation paths retain the exact administration authority needed to reduce current authority without demanding a new broader grant.
8. **PASS** — binding/approval/promotion compound operations preserve owner-specific current checks atomically at the semantic level.
9. **PASS** — removing any of the surviving 25 Permissions would either merge a currently distinct reusable authority class or force operation-local hidden policy.

This is a frozen **candidate** result only. Independent adversarial review and explicit operator 4A ratification remain required before the vocabulary becomes accepted authority.