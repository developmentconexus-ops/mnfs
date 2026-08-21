# 4B Evidence — Fixed Mutation Semantic Gap

> **Kind:** material downstream falsifier Evidence against the original operator-ratified 4A fixed-operation closure.
> **Status:** `4B-F01 CLOSED / OPERATOR ACCEPTED / RECOMPILED`.
> **Decision date:** `2026-08-21`.
> **Scope:** bounded exclusively to the three operations below.

## 1. Falsifier

4B must produce exact request schemas without creating new Product meaning.

While beginning the first fixed-owner schema pass, three accepted operations proved non-executable as specified:

```text
WS-03  UpdateWorkspace
WS-06  UpdateArea
PRJ-04 UpdateProject
```

For each operation, the original accepted 4A authority named a generic update command but did **not** define a closed Product-visible mutable property set.

Accepted Product concepts establish only:

```text
Workspace
= sovereign Product isolation/organization root

Area
= optional organizational grouping of people inside a Workspace

Project
= independent unit of software/Product lifecycle inside a Workspace
```

No accepted Product/owner authority fixed any of the following as current mutable semantics:

```text
Workspace name / display name
Workspace description
Workspace arbitrary settings
Area name / display name
Area description
Project name / display name
Project description
Project arbitrary settings
```

Consequently a 4B request such as `{ "name": "..." }` or a free-form `settings` map would make wire/DTO the first authority to decide what those operations mean.

That violates the Phase-4 law:

```text
Product meaning before wire
missing upstream semantic decision
→ STOP
→ reopen smallest owning authority
→ do not silently repair in DTO/schema
```

## 2. Consumer challenge

The accepted whole-product journeys A–O were checked for a concrete consumer requiring these generic updates.

Relevant current journeys require:

```text
Journey A
trusted operator provisions Account
→ authenticated session
→ Workspace context
→ enter/create authorized Workspace

Journey B
Workspace
→ Create/Import Project
→ Inception / Discovery
→ approved Baseline

Workspace/Area authority
→ optional Area grouping and access administration
```

No accepted current journey requires:

```text
generic Workspace edit
generic Area edit
generic Project edit
```

There was also no accepted closed field inventory behind those verbs. Their survival was therefore indistinguishable from CRUD completeness.

## 3. Operator decision

The operator explicitly accepted the bounded Lead recommendation:

```text
WS-03  UpdateWorkspace → SUBTRACT
WS-06  UpdateArea      → SUBTRACT
PRJ-04 UpdateProject   → SUBTRACT
```

The correction deliberately does **not** replace them with speculative `RenameWorkspace`, `RenameArea`, `RenameProject`, generic patch maps or settings APIs.

If 4C later exposes a real rename/metadata consumer, reopen only that exact Product interaction and admit the smallest semantic operation/property then.

## 4. Current census consequence

```text
operator-ratified pre-finding N_platform = 114
- WS-03                               =  -1
- WS-06                               =  -1
- PRJ-04                              =  -1
-------------------------------------------
current N_platform                    = 111
```

Prefix delta:

```text
WS  6 → 4
PRJ 22 → 21
all other prefixes unchanged
```

Ordinary Permission count remains exactly 25:

```text
workspace.manage
→ still has ListAreas/CreateArea as distinct current structural administration consumers

project.manage
→ still has Project lifecycle/Baseline/binding/app-access consumers
```

No owner, principal class, trust boundary, durable record class or Budget operation changed.

## 5. Completed downstream recompile

The bounded correction was projected into:

```text
4A operation ledger
4A Permission consumer wording
4A fixed N_platform 114 → 111
fixed Product OAD active graph
4A↔OAS bijection count
current-state carrier exact IF_MATCH set
```

Executable TDD proof:

```text
RED  Verify #233
→ expected 111 fixed 4A operations after 4B-F01, found 114

GREEN Verify #241
→ corrected 4A census = 111
→ corrected bundled Product OAD = 111
→ missing = 0
→ extra = 0
→ duplicate = 0
→ IF_MATCH exact set = { PRJ-12, PAR-14 }
```

The following remain intact:

```text
Project-defined Ops(R) grammar
N_budget = 2
Budget declarations/generation/truth falsifiers
25 ordinary Permissions
46 durable record classes
13 semantic owners
4B representation/session/request-authenticity decisions
```

## 6. Permanent negative control

4B/4C/4D MUST NOT resurrect these generic mutations by convenience through:

```text
free-form property map
arbitrary settings object
field names inferred only from CRUD conventions
field names copied from a frontend hypothesis
```

A future mutation requires a real consumer and a separately admitted exact Product semantic.

## 7. Closure

`4B-F01` is resolved. 4A is **operator-ratified as boundedly corrected** to `N_platform = 111`; 4B may resume from the corrected authority.

No 4C or Product implementation is authorized by this correction.
