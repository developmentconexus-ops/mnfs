# 4C GF-01 — Authority Feasibility Preflight

> **Status:** `4C-F01` / OPERATOR ACCEPTED / BOUNDED 4A+4B RECOMPILE ACTIVE
> **Block:** `GF-01` — global frame + Workspace/Project navigation
> **Authority posture:** Evidence of the falsifier and its bounded adjudication; current Product property authority is `docs/product/human-context-identity-contract.md`.

GF-01 was opened after operator acceptance of the 4C-5 candidate inventory. The block stopped at the mandatory authority-feasibility preflight because the then-current accepted wire could not provide a coherent human-readable Workspace/Project context label.

The operator explicitly accepted the smallest upstream correction. No 4C-8 rendered structural wireframe is valid until the bounded recompile is mechanically GREEN.

---

## 1. Required human property

The accepted Product model requires one Account to participate in multiple Workspaces and multiple Projects while preserving strict authority boundaries. The accepted 4C candidate IA therefore needs a global frame that lets a human recognize which Workspace and Project context is current and move among currently disclosable contexts.

This requires:

```text
opaque stable identity
+ human-readable presentation identity
+ current server-derived disclosure
```

The human-readable property does not create authorization; all context membership/disclosure remains server-owned.

---

## 2. Falsified pre-correction wire

The RED candidate exposed:

```text
IAM-01 workspaces[] → workspaceId only
IAM-01 projects[]   → projectId + workspaceId only
WS-02               → workspaceId only
PRJ-01 summary       → projectId + workspaceId + archived
PRJ-02 representation→ projectId + workspaceId + projectRevision + archived
```

That was enough for exact machine identity/disclosure but not enough for human-recognizable navigation.

Repository proof:

```text
Verify #417 / #419
→ GF-01 human-context-label test RED

Verify #424
→ exact 4C-F01 recompile test RED
→ generic GF-01 human-label test RED
→ 43 prior repository gates PASS
```

The second RED pins the accepted correction so a decorative response-only field cannot satisfy the finding.

---

## 3. Operator adjudication

`4C-F01` is **ACCEPTED** with this exact bounded semantic:

```text
Workspace.name
Project.name
```

Properties:

```text
required at creation
non-blank human-readable string
presentation identity only
not stable ID
not authorization
no uniqueness guarantee
no rename/update in F1
```

Creation/projection consequences:

```text
WS-01  requires name
WS-02  returns name
IAM-01 disclosable Workspace entries carry name

PRJ-03 requires name
PRJ-06 requires explicit destination Project name
PRJ-01/02 representations carry name
IAM-01 disclosable Project entries carry name
```

Canonical bounded Product property authority:

`docs/product/human-context-identity-contract.md`

---

## 4. Explicit negative controls

The correction does **not** authorize:

```text
UpdateWorkspace
UpdateProject
RenameWorkspace
RenameProject
generic metadata/settings map
name-based authorization
name-based routing identity
frontend ID→label authority
source-repository name as Product identity
Area metadata/name changes
```

`4B-F01` remains historically correct and its generic mutation subtractions remain current.

---

## 5. Recompile proof contract

The recompile must make both tests GREEN:

```text
tests/repository/4c-f01-identity-recompile.test.mjs
tests/repository/4c-gf01-human-context-labels.test.mjs
```

and preserve the full existing verification package:

```text
N_platform = 111
4A ↔ OAS = 111 ↔ 111
Technical Ingress Product impact = 0
Budget proof = GREEN
parallel Product DTO authority = 0
PRJ-04 / WS-03 resurrection = 0
```

---

## 6. GF-01 stop / resume condition

Until the exact recompile is GREEN:

```text
GF-01 rendered wireframe = BLOCKED
GF-01 LOCKED             = NO
dependent material blocks= BLOCKED
```

After GREEN, resume only the `GF-01` structural cycle: compare bounded global-frame hypotheses, render one low-fidelity structural candidate, and return to the operator for visual adjudication. Do not begin 4D or Product implementation.
