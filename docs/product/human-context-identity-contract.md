# Conexus OS — Human Context Identity Contract

> **Status:** CURRENT / `4C-F01` OPERATOR ACCEPTED / BOUNDED 4A CORRECTION
> **Scope:** Workspace and Project human-readable presentation identity only.
> **Operation impact:** none; `N_platform` remains 111.
> **Implementation authority:** none.

This contract is the smallest Product-semantic correction exposed by the `GF-01` frontend authority-feasibility preflight. It supplements the current 4A operation ledger with one property on two already accepted Product resources; it does not create a new semantic owner, Permission, trust boundary or generic metadata model.

## 1. Falsifier

Current 4A/4B authority already provides stable opaque Workspace/Project identifiers and server-derived disclosure, but the accepted Control Plane global-frame journey also requires humans to recognize which Workspace and Project context they are entering or switching among.

Opaque identifiers alone are not sufficient human presentation identity.

## 2. Accepted bounded semantics

The operator accepts one exact property:

```text
Workspace.name
Project.name
```

For both resources, `name` means:

- required human-readable presentation identity;
- non-blank string;
- supplied when the resource is created in F1;
- returned only when the underlying Workspace/Project itself is currently disclosable;
- independent from the stable opaque `workspaceId` / `projectId` identity;
- never an authorization, containment, routing or uniqueness source;
- not required to be globally or Workspace-locally unique by this contract;
- immutable after creation in F1 because no current rename consumer has been admitted.

Exact authorization continues to use server-owned Account/session/membership/grant/owner facts and stable resource identifiers.

## 3. Creation and duplication

```text
WS-01 CreateWorkspace
→ requires name
→ returns workspaceId + name

PRJ-03 CreateProject
→ requires name
→ returns Project representation including name

PRJ-06 DuplicateProject
→ requires destinationWorkspaceId + explicit destination name
→ destination name is not silently copied from source Project authority
```

An implementation may suggest a default destination name locally, but the admitted command must still carry the explicit destination `name` chosen for the new Project. The source Project name is not hidden mutation authority.

## 4. Required read projection

At minimum, current generated wire must make the accepted human identity available through:

```text
IAM-01 GetControlPlaneAccessContext
  workspaces[] → workspaceId + name
  projects[]   → projectId + workspaceId + name

WS-02 GetWorkspace
  → workspaceId + name

PRJ-01 ListProjects
  → ProjectSummary including name

PRJ-02 GetProject
  → ProjectRepresentation including name
```

Other responses that already return `ProjectRepresentation` inherit the same exact current representation; this does not create an independent DTO authority.

## 5. Explicit non-authority

`4C-F01` does **not** admit:

```text
WS-03 UpdateWorkspace
PRJ-04 UpdateProject
RenameWorkspace
RenameProject
generic metadata/settings patch
name uniqueness semantics
slug/URL authority derived from name
authorization derived from name
frontend-owned ID→name registry
repo name as Project Product identity
```

Area semantics are unchanged. `WS-06 UpdateArea` remains subtracted and no Area name is introduced by this correction.

If a real rename consumer appears later, reopen only that exact mutation semantic with current-state/concurrency obligations. Do not infer it from the existence of creation-time `name`.

## 6. Preservation assertions

```text
N_platform                              = 111
N_budget                                = 2
ordinary Permissions                    = 25
new Product operations                  = 0
resurrected generic mutation operations = 0
new semantic owners                     = 0
new trust boundaries                    = 0
Product implementation authority        = 0
```

The historical `4B-F01` finding remains correct for the authority that existed when it was closed: at that time no Workspace/Project mutable property inventory or current rename consumer existed. `4C-F01` is a later evidence-driven, creation/read-only semantic addition and does not rewrite that historical Evidence.

## 7. Recompile obligation

The accepted semantic chain is:

```text
this bounded 4A property authority
→ current fixed 4B OpenAPI projections
→ generated frontend/server projections later
→ GF-01 human context navigation
```

The `GF-01` block remains blocked until repository tests prove creation/read projection closure and absence of generic mutation resurrection. Product implementation remains blocked by the Phase-4 program.
