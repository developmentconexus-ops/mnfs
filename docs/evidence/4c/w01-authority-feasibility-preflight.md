# 4C W-01 — Authority Feasibility Preflight / Global-Maximum Adjudication

> **Status:** `FINDING / 4C-F02 / REVISED BOUNDED CORRECTION REQUIRES OPERATOR DECISION`
> **Block:** `W-01` — Projects + create/import / Inception / candidate+approved Baseline
> **Locked dependency:** `GF-01 H1-R2` remains `LOCKED / OPERATOR APPROVED`.
> **Implementation authority:** none.

The operator conditionally approved the first source-bootstrap proposal only if it survived the Conexus Global-Maximum method. It did not. Completing the whole Journey-B preflight exposed three independent missing Product properties before any W-01 layout or HTML was authored.

## 1. Accepted Journey B

Current Product authority requires:

```text
Workspace
→ Create/Import Project
→ establish/associate canonical source repo
→ Inception / Discovery
→ inspect objective/users/constraints/source systems/real data where relevant
→ propose sufficient Project Baseline
→ human checkpoint: “this is what we are building”
→ approved Baseline digest
→ initial Change
```

F1 has one canonical source repo per Project. Project Git is canonical Project authoring/provenance truth. Inception is not a fake Change.

## 2. Three independent falsifiers

### F02-A — source bootstrap is not caller-expressible

Current `PRJ-03 CreateProject` accepts only `name`. `PRJ-07 RunInceptionInvestigation` intentionally accepts no source selector and operates over already admitted sources. No Product or Technical-Ingress operation establishes a brownfield Git source.

### F02-B — Inception business intent is not caller-expressible

Journey B requires objective/users/constraints to participate in Inception. Current `PRJ-07` has no request body and no separate admitted Inception-context command exists. Source inspection alone cannot tell a greenfield Project what humans intend to build.

### F02-C — candidate Baseline is not durably readable before approval

`PRJ-07` yields `candidateBaselineDigest + sourceRevision`; `PRJ-09` approves the digest; `PRJ-08` reads only the already-approved Baseline. There is no durable caller-readable exact candidate subject for refresh/re-entry before the human checkpoint. Browser cache/localStorage or rerunning Inception is not authority.

Corrected TDD result:

```text
Verify #465 = EXPECTED RED
repository tests = 51
prior gates      = 48 PASS
W-01 falsifiers  = 3 FAIL exactly

F02-A source bootstrap
F02-B inception intent
F02-C candidate Baseline re-entry/read
```

All prior GF-01, 4C-F01, 4A/4B, architecture, documentation and repository gates remain green.

## 3. Adversarial option comparison

| Need | Candidate | Disposition | Reason |
| --- | --- | --- | --- |
| source bootstrap | enrich `PRJ-03 CreateProject` with discriminated source bootstrap | **LEADING** | source choice is part of Project birth; reuses existing atomic Project+initial-grant creation meaning |
| source bootstrap | new `ImportProject` operation | REJECT | duplicates Project creation semantics and splits one human job without a distinct lifecycle owner |
| source bootstrap | post-create `AttachSource` | REJECT | creates a partially initialized Project and invents post-create source mutation/switching state |
| source bootstrap | source selector on `PRJ-07` | REJECT | conflates source admission with investigation and breaks the accepted inputless-source-scope law |
| Inception context | required `intent` on `PRJ-07` | **LEADING** | keeps human intent at the investigation boundary without turning it into generic Project metadata |
| Inception context | add intent to `PRJ-03` | REJECT | mixes Project/source establishment with semantic investigation and risks hidden mutable metadata authority |
| Inception context | separate context CRUD/operation | REJECT | no independent owner/lifecycle/consumer; unnecessary ceremony |
| candidate review | exact candidate read by digest | **LEADING** | supports refresh/re-entry and exact human review without mutating candidate state |
| candidate review | overload `PRJ-08 GetApprovedProjectBaseline` | REJECT | collapses current approved truth with unapproved candidate truth into one ambiguous read |
| candidate review | rely on `PRJ-07` response/browser state | REJECT | transient UI state cannot be durable review authority |
| candidate review | use generic source-file read | REJECT | no accepted candidate Baseline path contract and source-read Permission is not the Baseline-management authority |

Current platform references (Vercel/Render/Replit) support repository selection as part of creation rather than later source CRUD; they are pattern Evidence only and do not define Conexus authority.

## 4. Revised bounded Global-Maximum candidate

### 4.1 `PRJ-03 CreateProject` — source bootstrap at Project birth

Keep one Product operation. Add one required closed discriminated input:

```text
sourceBootstrap.mode = NEW | EXISTING_GIT
```

`NEW`:

```text
Project creation
→ platform establishes the one canonical Project Git
→ exact scaffold/seed/hosting mechanics remain 4D
```

`EXISTING_GIT`:

```text
caller identifies one existing Git remote through an untrusted provider-neutral locator
→ trusted GitInfra validates/adopts it under server-side credentials/policy
→ that remote becomes the one canonical Project Git
→ exact immutable source revision is resolved server-side
```

Constraints:

- no Git credential/secret in Product payload;
- no generic outbound-network authority from the locator;
- no second mutable source authority/copy kept in parallel;
- no post-create source switching;
- no multi-repo F1;
- no Repository CRUD domain;
- no provider-specific GitHub/GitLab Product semantic;
- idempotent CreateProject intake still prevents duplicate Project creation.

The exact locator schema is closed in the bounded 4A/4B recompile; mechanism/credential package stays 4D.

### 4.2 `PRJ-07 RunInceptionInvestigation` — human intent, not source selection

Add exactly one required human business-intent input:

```text
intent: string (non-blank)
```

It may express objective/users/constraints in ordinary language. It is Inception input, not generic mutable Project metadata.

`PRJ-07` still MUST NOT accept:

```text
repositoryUrl
sourceUrl
sourceId
connectionId chosen only to widen source authority
SQL
arbitrary target URL
```

The server resolves the already-admitted canonical Project source and applicable already-authorized source context. The investigation returns the exact candidate Baseline representation for immediate review.

### 4.3 New exact read — `PRJ-23 GetProjectBaselineCandidate`

A real consumer now proves one new fixed Product read is necessary:

```text
consumer    = W-01 human candidate-Baseline review/re-entry
owner       = Project
principal   = HUMAN_ACCOUNT_SESSION
Ingress     = CP
Permission  = project.manage
class       = READ
IC          = IC0
subject     = exact Project + candidateBaselineDigest
```

Return one exact immutable candidate only:

```text
ProjectBaselineCandidate
  candidateBaselineDigest
  sourceRevision
  sourceText
  applicationRuntimeProfile = MANAGED | DEDICATED
```

No list-candidates operation, candidate CRUD, workflow/status domain or generic artifact API is admitted. Candidate bytes/source may be durably projected from existing Project-Git/immutable-byte mechanisms; this read alone does not justify a new Hub durable record class.

`PRJ-07` may return the same representation immediately. `PRJ-23` exists because a durable exact read is independently necessary after refresh/re-entry.

`PRJ-09 ApproveProjectBaselineRevision` remains the exact decision by `candidateBaselineDigest` and continues to revalidate current eligibility/staleness.

## 5. Consequence if operator accepts

Counts are derivation results, not targets:

```text
fixed Product operations      111 → 112
Project operations             21 → 22
fixed frontend-reachable      110 → 111
fixed no-direct-browser         1 = PAR-05
Budget operations               2 unchanged
total frontend-reachable      112 → 113
ordinary Permissions           25 unchanged
Technical Ingress               3 unchanged / Product impact 0
semantic owners                unchanged
new durable record classes      0 expected
```

Preserving `111` by hiding the candidate read in frontend state or overloading an unrelated operation would violate the same methodology that produced the count.

## 6. Smallest recompile if accepted

```text
bounded Project/Journey-B Product semantics
→ operation ledger + exact counts/consumer mapping
→ Permission consumer mapping (vocabulary stays 25)
→ Project OAS / checker
→ 4A↔4B 112↔112 bijection
→ 4C coverage/surface mapping 113 frontend-reachable
→ all three W-01 RED falsifiers GREEN
```

No GF-01 reopen, no 4D selection and no Product implementation.

## 7. Stop condition

Until explicit operator acceptance of this **revised** correction:

```text
4C-F02 = OPEN
W-01 HTML/layout = BLOCKED
later 4C blocks = NOT OPENED
GF-01 = LOCKED
4D / Product implementation = BLOCKED
```
