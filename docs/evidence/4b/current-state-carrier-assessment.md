# 4B Evidence — Current-State Carrier Assessment

> **Kind:** bounded 4B derivation Evidence; not Product authority by itself.
> **Accepted semantic source:** current 4A operation authority/current-state/IC mapping, including operator-approved `4B-F01`.
> **Wire rule under test:** `docs/product/wire-contract.md` §7.

## 1. Decision question

> Which accepted IC2/current-subject obligations are truthfully representable through HTTP `ETag` / `If-Match`, and which require an explicit semantic revision/generation/subject carrier because the protected subject is not the HTTP target representation?

## 2. Normative rule

RFC 9110 defines `If-Match` as a precondition evaluated against the current selected representation of the **target resource** of the request.

Therefore:

```text
same target representation
→ ETag / If-Match may be honest

different owner resource, command subpath or collection
→ cross-resource ETag reuse is rejected
→ exact semantic revision/generation/subject must be carried explicitly
```

IC2 is a Product current-subject law. HTTP conditional headers are only one possible carrier.

## 3. Exact current `If-Match` set retained

After operator-approved `4B-F01`, the current fixed wire admits literal `IF_MATCH` only for:

```text
PRJ-12 ClearProjectBrainBinding
PAR-14 ReviseScheduleTrigger
```

Why they survive:

```text
ClearProjectBrainBinding
GET/DELETE same /projects/{projectId}/brain-binding representation

ReviseScheduleTrigger
GET/PATCH same /triggers/{triggerId} representation
```

The two previously truthful target-representation cases below no longer exist as Product mutations:

```text
WS-03  UpdateWorkspace → SUBTRACTED by 4B-F01
PRJ-04 UpdateProject   → SUBTRACTED by 4B-F01
```

Their removal narrows the `IF_MATCH` set; it does not change the HTTP conditional rule.

`PRJ-11 SetProjectBrainBinding` remains `CURRENT_OR_ABSENT`: the same exact target can later map present-state update through `If-Match` and absent-state create through an exact absent precondition such as `If-None-Match: *`, but 4B must close that request shape explicitly rather than pretending one unconditional ETag exists.

## 4. False cross-resource `If-Match` mappings removed

### IAM-17 — RevokePublishedAppAccess

Target wire:

```text
DELETE /api/control/projects/{projectId}/app-access/{accountId}
```

No exact item GET is currently admitted. Required current grant/role/revision therefore remains an explicit current subject.

```text
carrier = EXPLICIT_CURRENT_SUBJECT
```

### PRJ-05 — ArchiveProject

Target wire:

```text
POST /api/control/projects/{projectId}/commands/archive
```

The protected current subject is the Project, not the command subresource.

```text
carrier = EXPLICIT_CURRENT_SUBJECT
```

The exact Project revision/generation field belongs to request-schema closure.

### CON-06 — ReviseConnection

Target wire:

```text
POST /api/control/connections/{connectionId}/revisions
```

The protected subject is the current logical Connection/ConnectionRevision, not the revisions collection representation.

```text
carrier = EXPLICIT_CURRENT_REVISION
```

### REL-06 — PromoteRelease

Target wire:

```text
POST /api/control/projects/{projectId}/promotions
```

The protected mutable subject includes the current target-environment active pointer. Reusing an ETag from `GetProjectServingState` on the promotions collection would be cross-resource conditional semantics.

```text
carrier = EXPECTED_POINTER_GENERATION + IDEMPOTENCY_KEY
```

This preserves both accepted IC2 and IC3.

### PAR-10 — DecideApprovalRequest

Target wire:

```text
POST /api/runtime/projects/{projectId}/approval-requests/{approvalRequestId}/decisions
```

The protected subject is the exact sealed ApprovalRequest/proposal identity and current eligibility/Release state. A command-subpath ETag is not that subject.

```text
carrier = EXPLICIT_SEALED_SUBJECT
IC4     = owner/Gateway effect fence; not caller replay authority
```

### PAR-15 — EnableAgentTrigger

Target wire:

```text
POST /api/control/projects/{projectId}/agents/{agentId}/triggers/{triggerId}/commands/enable
```

The protected subject is the exact TriggerRevision/current state, not the command subresource.

```text
carrier = EXPLICIT_TRIGGER_REVISION
```

Historical pre-`4B-F01` carrier work also converted `WS-06 UpdateArea` from false `IF_MATCH` to `EXPLICIT_CURRENT_SUBJECT`; the later operator-approved subtraction removed that Product operation entirely.

## 5. Current-or-absent cases

These remain deliberately distinct from `IF_MATCH`:

```text
IAM-15 SetPublishedAppAccess
→ CURRENT_OR_ABSENT
→ create/update over one app-access meaning
→ request schema must state expected current grant/role/revision when updating
→ uniqueness/current owner law protects create

PRJ-11 SetProjectBrainBinding
→ CURRENT_OR_ABSENT
→ same target resource
→ exact present-vs-absent conditional wire is closed in request-schema work
```

## 6. Executable falsifier

The current machine mapping must satisfy:

```text
operations carrying literal IF_MATCH
= { PRJ-12, PAR-14 }
```

and must reject stale false mappings such as:

```text
IAM-17 IF_MATCH
PRJ-05 IF_MATCH
CON-06 IF_MATCH
REL-06 IF_MATCH+IDEMPOTENCY_KEY
PAR-10 IF_MATCH
PAR-15 IF_MATCH
```

The repository checker evaluates the **bundled canonical OAD**, not only source fragments, so a stale override/ref cannot evade the proof.

Current established proof:

```text
Verify #241 = SUCCESS
bundled fixed operations = 111
IF_MATCH exact set = PRJ-12,PAR-14
```

## 7. Scope

This Evidence decides carrier class only. It does not yet freeze:

- exact JSON property names for revision/generation/digest;
- request-body versus header placement for every explicit semantic carrier;
- response schema;
- persistence/locking mechanics;
- router/framework implementation.

Those are subsequent 4B/4D closures and may not weaken this property.

Related first owner-schema closure Evidence: [identity-workspace-schema-closure.md](identity-workspace-schema-closure.md).
