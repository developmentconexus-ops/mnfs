# 4C GF-01 — Authority Feasibility Preflight

> **Status:** FINDING / `4C-F01` / UPSTREAM BOUNDED REOPEN REQUIRED
> **Block:** `GF-01` — global frame + Workspace/Project navigation
> **Authority posture:** Evidence only. This record does not amend 4A/4B, select a Product field name, create a Product operation, or authorize a rendered wireframe.

GF-01 was opened after operator acceptance of the 4C-5 candidate inventory. The block stopped at the mandatory authority-feasibility preflight because current accepted authority cannot provide a coherent human-readable Workspace/Project context label.

No 4C-8 rendered structural wireframe is valid while this finding is open.

---

## 1. Required human property

The accepted Product model requires one Account to participate in multiple Workspaces and multiple Projects while preserving strict authority boundaries. The accepted 4C candidate IA therefore needs a global frame that can let a human understand which Workspace and Project context is current and move among currently disclosable contexts.

This requires, at minimum:

```text
opaque stable identity
+ human-readable label
+ current server-derived disclosure
```

The human-readable label is presentation identity. It does not create authorization; all context membership/disclosure remains server-owned.

A selector or context heading that exposes only opaque IDs does not satisfy the accepted human mental model and would force implementation-time invention of names/labels outside Product authority.

---

## 2. Current 4B wire evidence

### 2.1 Control Plane access context

`IAM-01 GetControlPlaneAccessContext` currently returns:

```text
accountId
workspaces[] → workspaceId only
projects[]   → projectId + workspaceId only
```

This is sufficient to prove which exact identifiers are currently disclosable. It is insufficient to render human-recognizable context choices by itself.

### 2.2 Workspace identity

`WS-02 GetWorkspace` currently returns:

```text
workspaceId
```

`WS-01 CreateWorkspace` currently has no Product request body and returns only `workspaceId`.

Therefore no accepted Workspace human label can be sourced by the frontend through current Product wire.

### 2.3 Project identity

`PRJ-01 ListProjects` returns `ProjectSummary`:

```text
projectId
workspaceId
archived
```

`PRJ-02 GetProject` and `PRJ-03 CreateProject` use `ProjectRepresentation`:

```text
projectId
workspaceId
projectRevision
archived
```

There is no accepted Project human label in the current representation.

---

## 3. 4C-7F preflight result

| Required preflight property | Current evidence | Result |
| --- | --- | --- |
| current Account/session identity | `IAM-01 accountId` | PASS |
| disclosable Workspace identities | `IAM-01 workspaces[].workspaceId` | PASS |
| disclosable Project identities | `IAM-01 projects[].projectId/workspaceId` | PASS |
| current Workspace exact read | `WS-02` | PASS for opaque identity |
| current Project exact read | `PRJ-02` | PASS for opaque identity/current owner state |
| human-readable Workspace context label | absent from `IAM-01`, `WS-01`, `WS-02` | **FAIL** |
| human-readable Project context label | absent from `IAM-01`, `PRJ-01`, `PRJ-02`, `PRJ-03` representations | **FAIL** |
| authorization source | server-owned Conexus authority | PASS |
| new navigation Product operation required | no; switching itself can remain `NAVIGATION` over disclosed identities | PASS |
| rendered global frame can be truthfully labeled | blocked by missing Product property | **FAIL** |

Result:

```text
GF-01 authority-feasibility preflight = RED
4C-8 rendered global-frame wireframe   = BLOCKED
```

---

## 4. Why frontend/local repair is rejected

The following repairs are forbidden:

```text
frontend invents Workspace/Project names from IDs
frontend owns an editable ID→label registry
localStorage becomes Product identity authority
source-repo name is silently substituted for Project Product identity
screen-only DTO adds displayName not present in accepted wire
BFF joins hidden infrastructure data solely to satisfy the screen
hard-coded labels in a prototype are cited as Product proof
```

A fixture may later use deterministic names for visual structure only **after** accepted Product semantics define what those names mean. It cannot close this finding.

---

## 5. Smallest upstream reopen

The smallest correction is not a new screen-shaped operation. The missing concept is a human-readable identity property on two already accepted Product resources:

```text
Workspace
Project
```

The bounded reopen should decide, at minimum:

```text
1. exact semantic meaning/name of the human-readable property;
2. whether it is required at creation or owner/system-derived;
3. whether F1 needs mutation/rename now or may keep the property immutable after creation;
4. how duplicate Project derives/requests the destination label;
5. exact read projections that carry it (`IAM-01`, `WS-02`, `PRJ-01`, `PRJ-02` at minimum);
6. 4B wire/schema recompilation without introducing parallel frontend DTO authority.
```

YAGNI constraint:

> GF-01 does **not** by itself prove the need for generic `UpdateWorkspace` / `UpdateProject` resurrection. A required creation-time human label plus accepted read projection may be sufficient for F1. Rename/mutable metadata requires its own real consumer and semantics.

Candidate field spelling such as `displayName`, `name`, `label` or `title` is **not selected by this Evidence**.

---

## 6. RED proof

Repository test:

`tests/repository/4c-gf01-human-context-labels.test.mjs`

The test accepts any explicit human-label-shaped field in the relevant accepted wire blocks; it deliberately does not prescribe the final Product property name.

`Verify #417` failed for the expected reason:

```text
GF-01 cannot render a human Workspace selector/context label:
current wire exposes only opaque Workspace identity
```

All prior 4C and repository gates remained green before this new falsifier.

---

## 7. External structural evidence retained for the eventual wireframe

The existing 4C-4 reference study remains sufficient for product-pattern comparison. GF-01 additionally notes two accessibility constraints from W3C guidance for later rendered work:

```text
multiple navigation landmarks → uniquely label each navigation landmark
responsive/reflow presentation → preserve information/functionality at 320 CSS px equivalent width
```

These are realization constraints only; they do not repair missing Product identity.

---

## 8. Stop condition

GF-01 stops here under the smallest-reopen law.

Do not:

```text
render GF-01 wireframe
LOCK candidate IA/global navigation
open dependent material blocks
begin 4D
implement Product code
```

Next action requires explicit operator adjudication of `4C-F01` and, if accepted, a bounded 4A semantic correction followed by exact 4B wire recompilation/proof before GF-01 resumes.
