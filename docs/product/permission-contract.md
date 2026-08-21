# Conexus OS — Permission Contract

> **Status:** CANDIDATE / 4A OPEN / NOT RATIFIED
> **Purpose:** derive the smallest ordinary Permission vocabulary needed by the concrete Conexus platform operation candidate without turning personas, screens, Keycloak claims or Published-App roles into a universal policy system.
> **Operation authority:** [operation-ledger.md](operation-ledger.md).
> **Mutable program status:** owned only by [../roadmap.md](../roadmap.md).

This document is the single candidate home for ordinary Conexus Control-Plane/runtime Permission names during 4A. It does not define HTTP security schemes and it does not authorize implementation.

---

## 1. Permission law

An ordinary Permission exists only when it represents a reusable semantic authority distinction that at least one current concrete operation needs.

```text
screen/button
-X-> Permission

narrative persona
-X-> Permission

Keycloak role/group
-X-> Permission

runtime/model/provider identity
-X-> Permission
```

A Permission is necessary but may be **insufficient**. Operations still recheck exact containment, current grant/membership, immutable subject, owner state, Release/binding pins and other current eligibility facts.

```text
Permission says which semantic capability class may be exercised
+
owner facts say whether this exact current subject may be exercised now
```

The vocabulary is not a universal policy language and does not imply a custom Role/Permission editor F1.

---

## 2. Non-ordinary authority conditions

The following remain separate from the ordinary Permission vocabulary:

| Condition | Meaning |
| --- | --- |
| `authenticated` | valid current Conexus Account/session only; Keycloak token alone is not sufficient |
| trusted `platform_operator` | first-installation/trusted F1 Account/Workspace provisioning condition; not a general tenant Permission |
| current Workspace membership | containment/disclosure root; does not grant all Workspace resources |
| exact Project grant | Project access fact; still constrained by operation Permission/current owner state |
| Published App role `{admin, member}` | independent app-use/app-admin authority; never automatically Control-Plane authority |
| exact PAR AgentRun/ToolProjection | runtime capability context; not a human Permission |
| exact MAR JobRun/Release projection | managed execution context; queue identity is not authority |
| owner/system transition | internal current-state transition after admitted authority; no public Permission |
| DEDICATED `SERVICE_SCOPED` projection | exact future service-principal operation allowlist; not admitted as ordinary human Permission without a real consumer |

`PlanningDepth`, `RigorProfile`, provider/model names, Mastra identities and E2B identities are never Permissions.

---

## 3. Candidate ordinary Permission vocabulary

The candidate is intentionally small and semantic. The count is an output, not a target.

### 3.1 Workspace and access

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `workspace.manage` | administer Workspace/Area structure and ordinary Workspace settings | `WS-03..06` |
| `workspace.access.manage` | administer Workspace membership, Area membership and Workspace-derived Project grants | `IAM-04..12` |
| `project.create` | create a Project in an exact Workspace or duplicate into an admitted destination Workspace | `PRJ-03`, destination side of `PRJ-06` |

### 3.2 Project

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `project.read` | inspect Project-level Product truth and ordinary Project projections | `PRJ-01/02`, Release/Activity ordinary reads where separately disclosed |
| `project.source.read` | inspect Project source/diff/authoring definitions without write authority | `BLD-07..09`, `PRJ-20/21` where source-like detail is exposed |
| `project.data.read` | inspect declared Product/read-model/source resources without becoming a generic DB console | `PRJ-18/19` |
| `project.manage` | administer Project identity/lifecycle, Baseline, bindings and independent Published-App access configuration | `PRJ-04/05/08..15`, `IAM-14..17` subject to additional resource-use authority where applicable |
| `project.build` | create/evolve accepted Project Product/Agent intent through Change/Builder | `BLD-01..04/06/10/16/17`, `BLD-03` write path |
| `project.review` | participate in exact Plan/Change checkpoint, Finding and Evidence review | `BLD-05`, `BLD-11..15` |

`project.manage` does **not** imply `project.build`, `project.review`, Published-App business use, Brain publication, Connection use or Release promotion.

### 3.3 Release and managed execution

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `release.promote` | decide/perform exact Release Promotion/rollback under current conformance/proof | `REL-04..08`, especially `REL-06` |
| `job.run` | manually admit an occurrence of an exact Release-pinned managed `job/v1` | `MAR-03` |
| `audit.read` | inspect audit/effect/technical execution evidence beyond ordinary owner views | `OBS-02/04/05`, `GW-01/02` where authorized |

Release composition is an owner/system transition gated by exact current accepted proof in the current subtractive candidate; it therefore carries no ordinary human `release.compose` Permission. Ordinary Release/Promotion history may remain visible under `project.read`; `release.promote` is the consequential authority distinction.

### 3.4 Brain

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `brain.read` | inspect current Workspace Brain, immutable revisions and health/conformance projections | `BRN-01..03/10` |
| `brain.propose` | submit a provenance-preserving KnowledgeProposal without publication authority | `BRN-07` |
| `brain.discover` | initiate/participate in admitted read-only Brain Discovery against exact governed source scope | `BRN-04` plus current `connection.use` when an external Connection is required |
| `brain.review` | review/decide exact KnowledgeProposal subjects | `BRN-05/06/08` |
| `brain.publish` | publish a reviewed/validated immutable Brain revision | `BRN-09` |
| `brain.bind` | authorize a Project to adopt an exact Brain revision/binding, distinct from merely being in the Workspace | `PRJ-11` together with `project.manage`; removal/narrowing does not require continued bind authority |

`RunAnalyticQuery` requires current admitted read authority for the exact Project/dataset/semantic IDs. 4A must decide during final mapping whether that is represented by `brain.read` plus Project/application use authority or needs a separate semantic Permission; no `analyticquery.execute` Permission is admitted merely for naming symmetry.

### 3.5 Connections

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `connection.read` | inspect exact Connections/revisions/qualification facts in the admitted owner scope | `CON-01..04/09` |
| `connection.manage` | create/revise Connection configuration and write credential material through the protected write-only boundary | `CON-05..07` |
| `connection.qualify` | run/accept exact environment/revision qualification Evidence without granting Project use | `CON-08/09` |
| `connection.use` | authorize use/binding of an exact Connection resource by an admitted Project/Brain operation; same Workspace alone is insufficient | `PRJ-14` together with `project.manage`; Brain Discovery/source use together with `brain.discover` |

`connection.use` does not itself grant runtime invocation. Runtime also requires an exact ProjectConnectionBinding, Release/capability projection and current owner/Gateway gates.

### 3.6 Product Agent runtime

| Permission | Meaning | Material current consumers |
| --- | --- | --- |
| `agent.trigger.manage` | create/revise/enable/disable exact `SCHEDULE` trigger authority for a Project-owned Product Agent | `PAR-11..16` |
| `agent.headless.invoke` | manually invoke an exact active Product Agent through the admitted headless surface | `PAR-05` |
| `agent.effect.approve` | decide one exact current sealed ApprovalRequest subject when separately eligible | `PAR-08..10` |

Product Agent authoring is **not** `agent.manage`; it remains ordinary Project evolution through `project.build` and the same Change/Release path.

Interactive Published-App Agent use is authorized by the exact Published-App access/role + active Agent/Release semantics, not automatically by `agent.headless.invoke`.

`agent.effect.approve` is necessary but never sufficient: current approver eligibility, exact proposal identity and current subject state must still pass atomically.

---

## 4. Candidate census

Current candidate ordinary Permission vocabulary:

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
candidate ordinary Permissions = 25
status = NOT FROZEN / NOT RATIFIED
```

The number 25 has no independent value. It survives only if each Permission remains necessary after final operation subtraction and no accepted operation requires a missing semantic distinction.

---

## 5. Explicit anti-expansion rules

The following are rejected as ordinary Permissions unless a material current Product requirement later proves them distinct:

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

Reason: these either duplicate an existing semantic capability, mirror CRUD/UI nouns, describe mechanism/operation type rather than authority, or would create an unjustified universal policy layer.

The final operation → Permission mapping may still require exact special conditions or compound requirements, e.g.:

```text
SetProjectConnectionBinding
→ project.manage + connection.use + exact qualified compatible ConnectionRevision

SetProjectBrainBinding
→ project.manage + brain.bind + exact immutable Brain revision + binding conformance

StartBrainDiscovery using external source
→ brain.discover + connection.use + exact source/binding/egress admission

DecideApprovalRequest
→ agent.effect.approve + exact current approver eligibility + exact sealed proposal
```

---

## 6. Published Application authorization remains separate

Current F1 Published-App role set remains exactly:

```text
admin
member
```

These roles are a separate Product authorization plane.

```text
Project admin -X-> app admin
app admin     -X-> project.manage
app member    -X-> project.read
```

Each exact Project-defined application operation in `Ops(R)` must declare which admitted app role(s), service projection(s) or other current caller classes may invoke it. 4A does not create arbitrary custom app roles.

The first Budget Analyzer must make that exact mapping once `N_budget` is resolved.

---

## 7. Project-defined capability authorization grammar

A Project-defined operation does not get a new global ordinary Permission merely because it has a new business name.

Its exact Release contract declares an operation-local authorization class from the admitted Project/app/runtime authority vocabulary, for example:

```text
Published-App role subset `{admin, member}`
PAR ToolProjection
MAR JobProjection
DEDICATED SERVICE_SCOPED allowlist when a real consumer exists
Control-Plane Project capability where current Product semantics explicitly admit it
```

The operation may additionally require current resource/domain facts in its own Project Product logic. Conexus does not turn every future customer-specific business rule into a global platform Permission string.

---

## 8. Closure challenge

Before this candidate can freeze, 4A must prove:

1. every fixed platform operation maps to one ordinary Permission or one explicit special/non-ordinary current-authority condition;
2. no Permission exists only because a screen/menu/CRUD noun exists;
3. no Permission silently grants cross-Workspace, cross-Project, Brain, Connection, app or Agent authority by co-location;
4. Project-defined operations do not create an unbounded global Permission namespace;
5. Published-App roles stay independent from Control Plane Permissions;
6. Keycloak claims never substitute for Conexus authority;
7. narrowing/revocation operations do not require a broader grant than necessary to reduce authority;
8. compound operations such as binding/approval preserve all owner-specific current checks atomically;
9. removing any candidate Permission either remains safe through another exact authority or exposes a concrete widening/ambiguity defect.

Only after this challenge and operation subtraction may the ordinary Permission census be ratified.