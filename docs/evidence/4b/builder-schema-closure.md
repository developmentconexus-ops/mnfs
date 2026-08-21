# 4B Evidence — Builder Schema Closure

> **Kind:** bounded 4B executable Evidence; not Product authority by itself.
> **Accepted semantic source:** current 4A Product authority plus accepted Builder/Harness, Project-Git and Evidence contracts.
> **Machine authority under proof:** `contracts/api/product/openapi.yaml` resolved graph.

## 1. Decision question

> Can all 17 current Builder Product operations be given exact wire shapes without exposing internal harness control as Product commands, weakening verification truth, or inventing lifecycle vocabularies?

## 2. Exact slice

```text
BLD-01 → BLD-17
```

Canonical active Path Items:

```text
contracts/api/product/builder-paths.yaml
```

They become authority only through the canonical `contracts/api/product/openapi.yaml` entrypoint and resolved bundle.

## 3. Closure laws proved

### Change / Plan

`CreateChange` accepts bounded intent only and is pinned to the current accepted Project Baseline. It does not accept WorkUnits, ActorRuns, sandbox identity, verification flags or owner state.

The accepted closed Builder vocabularies remain exact:

```text
PlanningDepth = DIRECT | LIGHT | FULL
RigorProfile  = FAST | BOUNDED | CONTROLLED
```

Plan is a projection of Hub-owned truth. `DecideChangePlanCheckpoint` decides one exact `planRevision` with `APPROVE | REJECT`; it is not plan JSON Patch authority and cannot directly mutate work-item state.

### Source / diff

Source tree/file reads require an exact immutable `sourceRevision`; file detail additionally requires an exact path. They are read-only and expose no write token, commit, push or apply-patch authority.

Change diff binds exact base/candidate source revisions rather than a mutable latest/head workspace.

### Preview truth

RunPreview keeps three truths separate:

```text
ready
verified
live = false
```

Preview readiness cannot masquerade as verification or production serving.

### Finding / Evidence

Finding closure requires:

```text
expectedFindingRevision
resolutionEvidenceIds (non-empty)
```

There is no generic status write.

A follow-up semantic falsifier proved that current Product authority does **not** ratify a named Finding lifecycle vocabulary. Therefore `Finding.state` remains a required owner-issued string; 4B does not freeze `OPEN/CLOSED` merely because `CloseFinding` exists.

Evidence detail remains bound to:

```text
evidenceId
changeId
claim
subjectDigest
provenance
```

Existence of telemetry, narration or a green badge is not proof.

### Context assistant / execution detail

Context assistant accepts a question and returns an answer with provenance. It accepts no permission/grant/tool/credential/system-prompt authority.

Execution detail is read-only projection over subordinate WorkUnit/ActorRun facts. It cannot dispatch/resume runs, set checklist state, mark verification, or expose credentials/tokens.

The accepted ActorRun lineage vocabulary remains exact:

```text
FRESH_BASE | CONTINUE_LINEAGE
```

## 4. Rejected generic mechanics remain absent

```text
AcceptChange
CreateWorkUnit
plan JSON patch
SetWorkItemStatus
CreateActorRun
ResumeSandbox
MarkVerified
```

These remain owner/runtime mechanics rather than Product operations.

## 5. TDD proof

```text
Verify #266 = FAILURE
→ expected initial RED
→ prior owner gates green
→ first Builder failure: BLD-01 is not SCHEMA_CLOSED

Verify #268 = SUCCESS
→ first full Builder machine closure
→ 111 fixed operations / 58 schema-closed

Verify #269 = FAILURE
→ deliberate semantic micro-RED
→ Finding.state enum OPEN|CLOSED rejected as unratified Product vocabulary

Verify #270 = SUCCESS
HEAD = 899834e28d394ce6b7cc65a94f45b7f3fcb3af28
→ enum removed; state remains owner-issued
```

Final machine proof:

```text
fixed 4A operations      = 111
fixed OAS operations     = 111
schema-closed operations = 58
IAM/Workspace            = 20 / 20
Project                  = 21 / 21
Builder                  = 17 / 17
missing                  = 0
extra                    = 0
duplicate                = 0
literal IF_MATCH          = { PRJ-12, PAR-14 }
```

Budget Analyzer declaration/codegen/truth-state positive and negative controls remained green in the same final run.

## 6. Result

```text
IAM + Workspace = CLOSED inside 4B
Project         = CLOSED inside 4B
Builder         = CLOSED inside 4B
schema-closed   = 58 / 111
4B overall      = OPEN / ACTIVE
Product code    = BLOCKED
```

The next owner slice must continue compiling accepted semantics into this same OAD. Missing semantic/property authority remains a falsifier/reopen trigger, never permission to invent DTO meaning.
