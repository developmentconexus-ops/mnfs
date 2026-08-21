# 4B Evidence — HTTP Shape Derivation

> **Kind:** bounded 4B derivation Evidence; not Product authority and not the canonical machine-readable wire.
> **Canonical destination:** `contracts/api/product/openapi.yaml`.
> **Accepted source:** current 4A `docs/product/operation-ledger.md`.
> **Status:** CURRENT METHOD/PATH DERIVATION / `4B-F01` RECOMPILED / EXECUTABLY PROVED.

## 1. Derivation law

HTTP shape is derived from accepted operation meaning rather than CRUD symmetry.

```text
accepted read/provenance read
→ GET unless structured analytical/assistant input makes POST materially clearer

accepted create with server-owned new identity
→ POST collection + Idempotency-Key when IC3 requires repeatable intake

accepted exact membership/grant replacement/removal
→ PUT / DELETE exact subject when Product meaning is precisely that subject

accepted semantic command/decision/proof
→ POST semantic command/decision path
→ do not manufacture a CRUD resource identity just to look RESTful

IC1
→ no mandatory caller precondition by symmetry; current authority is rechecked through owner commit

IC2
→ If-Match only when the protected subject is the same current HTTP target representation
→ otherwise carry exact revision/generation/digest/current subject explicitly

IC3
→ Idempotency-Key when the caller can repeat consequential intake

IC4
→ caller carrier only where it is the correct effect-intake identity
→ owner/Gateway effect fence remains authoritative

path identifier
→ untrusted reference only
→ never authority by possession
→ disclosure law remains server-side
```

Current surface roots:

```text
/api/control/...   authenticated Control Plane Product interaction
/api/apps/...      Published Application human interaction
/api/headless/...  admitted Product-Agent headless interaction
/api/runtime/...   owner-neutral PAR read/approval surface where 4A admits CP and/or PA
/api/projects/...  owner-neutral multi-ingress fixed capability such as AnalyticQuery
```

A shared multi-ingress route does not merge authorization planes. Exact admitted ingress classes remain operation metadata and current owner authorization is rechecked independently.

## 2. Current executable census

The exact current method/path map is intentionally **not duplicated as a second 111-row prose table**. It is represented once by the canonical OAD and mechanically joined back to the exact 4A ledger by `scripts/check-wire-bijection.mjs`.

Current established closure:

```text
fixed 4A operations       = 111
bundled OAS operations    = 111
missing                   = 0
extra                     = 0
duplicate operationId     = 0
duplicate 4A ID           = 0
duplicate method+path     = 0
generic executor paths    = 0
Verify #241               = SUCCESS
```

The initial pre-`4B-F01` method/path derivation had 114 operations. Exact historical rows remain available through Git provenance, but they are not current wire authority and are not reproduced here because doing so would create a manually maintained parallel map that can drift from the executable OAD.

## 3. `4B-F01` recompile

Executable request-schema derivation proved that these three generic mutation operations had no accepted mutable Product property inventory:

```text
WS-03  UpdateWorkspace
WS-06  UpdateArea
PRJ-04 UpdateProject
```

After explicit operator approval:

```text
114
- WS-03
- WS-06
- PRJ-04
= 111
```

Current path consequence:

```text
GET /api/control/workspaces/{workspaceId}
→ retained as WS-02 GetWorkspace
→ no PATCH sibling

/api/control/workspaces/{workspaceId}/areas/{areaId}
→ no fixed Product operation remains
→ path removed from canonical active OAD

GET /api/control/projects/{projectId}
→ retained as PRJ-02 GetProject
→ no PATCH sibling
```

No speculative `Rename*`, settings or generic patch route replaces them.

Bounded Evidence: [fixed-mutation-semantic-gap.md](fixed-mutation-semantic-gap.md).

## 4. Current-state carrier correction

Method/path mapping does not imply that every IC2 operation uses `If-Match`.

The bundled current wire is separately challenged by [current-state-carrier-assessment.md](current-state-carrier-assessment.md).

Current literal `IF_MATCH` set is exactly:

```text
PRJ-12 ClearProjectBrainBinding
PAR-14 ReviseScheduleTrigger
```

Cross-resource/command-subpath cases use explicit semantic carriers instead. `4B-F01` removed `WS-03` and `PRJ-04` from the Product surface, further reducing the same-target ETag set.

## 5. Command-shaped paths remain deliberate

Where 4A admits an exact command but no stable Product resource identity for the command subject, 4B preserves command-shaped HTTP rather than manufacturing a REST noun.

Examples include current exact operations such as:

```text
ArchiveProject
DuplicateProject
SetProjectConnectionBinding
RemoveProjectConnectionBinding
CloseFinding
```

The subject/current-state carrier is determined independently from the path aesthetics.

## 6. Static Project-operation generation remains separate

The fixed 111-operation platform OAD does not become a generic runtime executor for future Project business operations.

Exact Release-pinned `project-operation/v1` declarations generate literal static paths by regime:

```text
QUERY       → /api/projects/{projectId}/queries/<static operation segment>
ACTION      → /api/projects/{projectId}/actions/<static operation segment>
INTEGRATION → /api/projects/{projectId}/integrations/<static operation segment>
```

The Budget Analyzer proves two exact generated paths and zero `{operationSlug}`/`/execute` escape hatch.

## 7. Proof custody

Current exact map custody is:

```text
4A operation ledger
→ canonical OAS entrypoint + referenced Path Items
→ deterministic bundle
→ bijection checker
```

This Evidence records the derivation law and material corrections. It does not compete with the OAD as an editable route map.

Any future method/path change must either:

1. remain a faithful representation of unchanged accepted Product meaning and preserve the bijection; or
2. stop and reopen the smallest upstream Product authority when the change requires new meaning.
