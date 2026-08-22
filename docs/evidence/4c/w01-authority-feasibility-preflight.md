# 4C W-01 — Authority Feasibility Preflight

> **Status:** `FINDING / 4C-F02 / UPSTREAM BOUNDED REOPEN REQUIRED`
> **Block:** `W-01` — Projects + create / inception / approved Baseline
> **Locked dependency:** `GF-01 H1-R2` remains `LOCKED / OPERATOR APPROVED` and is not reopened by this finding.
> **Implementation authority:** none.

W-01 was opened only after GF-01 completed its operator lock, exact P9 trace and P10 bounded consolidation. The first W-01 authority-feasibility question exposed a Product-semantic gap before any W-01 layout hypothesis or HTML wireframe was rendered.

The block must stop here until the smallest upstream correction is operator-adjudicated and mechanically green.

---

## 1. Human journey W-01 must complete

Accepted Journey B requires:

```text
Workspace
→ create/import a Project
→ establish current source/context
→ run Project Inception / investigation
→ inspect exact candidate Baseline subject
→ approve exact candidate Baseline
→ reach the current approved incremental Project Baseline
```

Load-bearing truths:

- Inception is not a fake Change;
- F1 has one canonical source repo per Project;
- Project Git is canonical Project-scoped authoring/provenance truth;
- approved Baseline pins exact `baselineDigest` + `sourceRevision` and carries readable source + `ApplicationRuntimeProfile`;
- a material Project-level decision missing from the Baseline may not be invented later by a coding actor.

---

## 2. Current accepted operation/wire facts

### `PRJ-01 ListProjects`

Current Workspace Projects browse read. It supplies exact disclosed `ProjectSummary` entries; it does not establish source authority.

### `PRJ-03 CreateProject`

Current request establishes:

```text
name
```

under the exact Workspace with idempotent Project creation and the accepted initial Project/I&A composition.

The current request exposes no source/repository/import/origin input.

### `PRJ-07 RunInceptionInvestigation`

Current wire intentionally has **no request body**. It runs over the Project's **currently admitted sources** and returns:

```text
candidateBaselineDigest
sourceRevision
```

The accepted 4B Project proof explicitly forbids making PRJ-07 caller-configurable through arbitrary URL, Connection, source ID or SQL. This negative law remains correct.

### `PRJ-08 GetApprovedProjectBaseline`

Returns the exact currently approved Baseline.

### `PRJ-09 ApproveProjectBaselineRevision`

Accepts the exact `candidateBaselineDigest` to make that candidate current, preserving stale/current-subject semantics.

---

## 3. Falsifier

The accepted authority simultaneously states:

```text
Journey B = Create/Import Project
PRJ-07 consumer = exact greenfield/brownfield Project
Project = exactly one canonical source repo in F1
```

but the caller-visible Product wire currently provides only:

```text
PRJ-03 CreateProject { name }
→ no source bootstrap choice/reference

PRJ-07 RunInceptionInvestigation {}
→ uses source that must already be admitted

no separate admitted Product source/import operation
```

Therefore the browser cannot truthfully render the accepted W-01 `Project create / source-association flow` for a brownfield Project.

A source URL/input drawn only in the frontend would be invented Product authority. Omitting brownfield onboarding would leave an accepted Journey-B branch without a human-operable path.

---

## 4. Technical Ingress does not close the gap

The current three Technical Ingress operations are exactly:

```text
TI-01 BeginOidcLoginProtocol
TI-02 CompleteOidcCallbackProtocol
TI-03 StreamAgentRunProjection
```

They are unrelated to Project source bootstrap. No hidden technical Git/source HTTP route exists in the current accepted 4B set that W-01 can lawfully surface.

`GitInfra` is an accepted infrastructure boundary, but mechanism capability is not Product authority. The existence of `GitInfra` cannot tell the frontend which source a user chose or authorize an import by itself.

---

## 5. TDD proof

Executable falsifier:

```text
tests/repository/4c-w01-source-onboarding.test.mjs
```

Observed result:

```text
Verify #458 = FAILURE / expected RED
repository tests = 49 total
prior tests       = 48 PASS
new W-01 gate     = 1 FAIL
```

Exact failure:

```text
W-01 cannot express brownfield source onboarding:
Journey B requires Create/Import and PRJ-07 expects an exact
greenfield/brownfield Project, but current Product wire exposes
no caller-visible source/repository onboarding authority before inception
```

No prior GF-01, 4C-F01, 4A/4B, architecture or repository gate regressed.

---

## 6. Smallest recommended bounded reopen

The leading YAGNI correction is **not** a generic Repository domain and does **not** need a new operation unless exact semantics prove otherwise.

Recommended Product semantic:

```text
PRJ-03 CreateProject
+ one closed creation-time Project source bootstrap

ProjectSourceBootstrap
= GREENFIELD
| IMPORT_GIT
```

### GREENFIELD

Semantics:

```text
CreateProject
→ establish the Project
→ establish its one canonical Project Git source authority
→ no caller-selected external source
```

Exact seed/scaffold mechanics remain 4D; 4C does not select them.

### IMPORT_GIT

Semantics:

```text
caller identifies one existing Git source for one-time bootstrap
→ trusted GitInfra obtains/read-custodies the source under later realization rules
→ exact imported source revision is established
→ canonical Project Git becomes the Project authoring/provenance truth
→ PRJ-07 later investigates only that admitted canonical source
```

Important semantic constraints for the bounded reopen:

- one-time bootstrap, **not** ongoing remote sync;
- one canonical Project repo after bootstrap;
- caller never supplies Git credentials/secrets inside Product source input;
- imported remote does not remain a second mutable Project authority;
- exact source revision must become provable before Baseline approval;
- source import cannot grant Workspace/Project authorization;
- no multi-repo Project;
- no post-create generic source switching/editing;
- no Repository CRUD/Product domain;
- no arbitrary source input added to `PRJ-07`.

The exact minimal locator/ref fields must be closed during the operator-accepted bounded 4A semantic correction before 4B wire recompilation. They must identify source without selecting a specific Git hosting provider or credential mechanism in 4C.

---

## 7. Explicitly rejected repairs

Do not repair W-01 by:

```text
frontend-only Git URL field
localStorage source association
screen-specific BFF/import DTO
hidden server default that silently decides brownfield source
caller-selected URL/sourceId added to PRJ-07
using Connection as generic Git source by convenience
adding Repository settings/rename/sync CRUD
adding multi-repo machinery
claiming GitInfra mechanism itself is Product authority
```

---

## 8. W-01 stop / resume condition

While `4C-F02` is open:

```text
W-01 structural hypotheses = BLOCKED
W-01 HTML P8 candidate      = BLOCKED
W-01 LOCKED                 = NO
W-02 and later blocks       = NOT OPENED
GF-01                       = remains LOCKED
4D / Product implementation = BLOCKED
```

If the operator accepts the bounded correction:

```text
smallest 4A Project source-bootstrap semantics
→ exact 4B Project wire recompile
→ make W-01 source-onboarding falsifier GREEN
→ resume W-01 reference / layout-hypothesis / authority-preflight cycle
→ render one bounded HTML/CSS lo-fi candidate
→ return to operator visual adjudication
```

No other accepted 4A/4B authority should be reopened by preference.
