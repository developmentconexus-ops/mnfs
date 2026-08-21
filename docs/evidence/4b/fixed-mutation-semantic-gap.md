# 4B Evidence — Fixed Mutation Semantic Gap

> **Kind:** material downstream falsifier Evidence against accepted 4A fixed-operation closure.
> **Status:** `4B-F01 OPEN / OPERATOR ADJUDICATION REQUIRED BEFORE MASS FIXED SCHEMA AUTHORING`.
> **Do not infer reopen by preference:** this finding is bounded to the three operations below.

## 1. Falsifier

4B must produce exact request schemas without creating new Product meaning.

While beginning the first fixed-owner schema pass, three accepted operations proved non-executable as currently specified:

```text
WS-03  UpdateWorkspace
WS-06  UpdateArea
PRJ-04 UpdateProject
```

For each operation, accepted 4A authority names a generic update command but does **not** define a closed Product-visible mutable property set.

Current accepted Product concepts establish only:

```text
Workspace
= sovereign Product isolation/organization root

Area
= optional organizational grouping of people inside a Workspace

Project
= independent unit of software/Product lifecycle inside a Workspace
```

No accepted Product/owner authority found by the bounded 4B route fixes any of the following as current mutable semantics:

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

Consequently a 4B request such as:

```json
{ "name": "..." }
```

or

```json
{ "settings": { "anything": "..." } }
```

would make 4B the first authority to decide what those operations mean.

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

There is also no accepted closed field inventory behind those verbs.

Therefore their survival cannot currently be justified by a concrete distinct Product interaction. Their shape is indistinguishable from CRUD completeness.

## 3. Strongest bounded correction

Recommended Lead disposition:

```text
WS-03  UpdateWorkspace → SUBTRACT
WS-06  UpdateArea      → SUBTRACT
PRJ-04 UpdateProject   → SUBTRACT
```

Do **not** replace them now with speculative `RenameWorkspace`, `RenameArea`, `RenameProject`, generic patch maps or settings APIs.

If 4C later exposes a real rename/metadata consumer, reopen only that exact Product interaction and admit the smallest semantic operation/property then.

## 4. Candidate census consequence if operator accepts

```text
current N_platform = 114
- WS-03            =  -1
- WS-06            =  -1
- PRJ-04           =  -1
-------------------------
proposed N_platform = 111
```

Prefix delta:

```text
WS  6 → 4
PRJ 22 → 21
all other prefixes unchanged
```

Ordinary Permission count need not change:

```text
workspace.manage
→ still has current Area-structure consumer(s), especially CreateArea and authorized Area administration/listing

project.manage
→ still has Project lifecycle/Baseline/binding/app-access consumers
```

No owner, principal class, trust boundary, durable record class or Budget operation changes.

## 5. Downstream recompile if accepted

Only the smallest affected 4A/4B artifacts need correction:

```text
4A operation ledger
4A Permission consumer wording where it names removed ops
4A coverage/census Evidence
4A fixed N_platform 114 → 111

4B HTTP shape Evidence
fixed Product OAD
4A↔OAS bijection count
current-state carrier exact IF_MATCH set
```

The following stay intact:

```text
Project-defined Ops(R) grammar
N_budget = 2
Budget declarations/generation/truth falsifiers
25-Permission semantic vocabulary unless a separate falsifier proves otherwise
46 durable record classes
13 semantic owners
4B representation/session/request-authenticity decisions
```

## 6. Negative control

Until adjudicated, 4B MUST NOT close these three operations with any schema that accepts:

```text
free-form property map
arbitrary settings object
field names inferred only from CRUD conventions
field names copied from a frontend hypothesis
```

A downstream wire that does so is a falsifier, not a completion.

## 7. Decision required

Because 4A was explicitly operator-ratified, changing the accepted fixed-operation census requires explicit operator approval.

Recommended decision:

> Accept `4B-F01` and boundedly reopen 4A only to subtract `WS-03`, `WS-06`, and `PRJ-04`, rederive `N_platform = 111`, then resume 4B from the corrected authority.

No 4C or Product implementation is authorized by this finding.
