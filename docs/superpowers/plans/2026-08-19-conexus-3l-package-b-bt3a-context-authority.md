---
id: PLAN-CONEXUS-3L-PACKAGE-B-BT3A-CONTEXT-AUTHORITY
title: Conexus 3L Package B BT-3A Context Authority Discriminant Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
last_reviewed: 2026-08-19
---

# Conexus 3L Package B BT-3A Context Authority Discriminant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute only the operator-ratified BT-3A discriminating probe and determine whether the exact pinned Mastra direct-Agent resume path can safely realize a **complete current Conexus authority projection** despite Mastra preserving/merging continuation RequestContext state.

**Architecture:** Extend only the existing qualification spike under `spikes/conexus-3l-b/`. Preserve the genuine suspend → PostgreSQL snapshot → process loss → fresh-process rediscovery → supported direct-Agent resume path. First prove the unguarded stale-context control fires; then test the smallest framework-supported candidate using `requestContextSchema` as a closed authority projection surface **only if the exact pinned source proves that surface is supported at the required ordering boundary**. No Product owner, runtime service, framework fork, private snapshot mutation, provider call or architecture expansion is allowed.

**Tech Stack:** Node 24.18.0, Node built-in test runner, `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL 17.10.

**Spec:** `docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md`

## Global Constraints

- Handoff/chat text is bootstrap only. Start from current repository authority after a fresh `git fetch`.
- Use an isolated worktree via `superpowers:using-git-worktrees` before edits.
- Read `AGENTS.md` fully and follow the canonical Conexus read path.
- Before any Mastra-specific planning/edit/probe, load the installed Mastra execution skill. If unavailable, STOP with `MISSING EXECUTION PREREQUISITE`.
- Query Context7 for `/mastra-ai/mastra` before Mastra-specific edits. Context7 is current external Evidence, not exact-version authority.
- Exact `@mastra/core 1.56.0` installed source + runtime behavior decide version-specific claims.
- Preserve the existing Package-B lock. **Do not add or upgrade dependencies. Do not change `package.json` or `package-lock.json`.** If the candidate requires a new dependency, STOP and return `MATERIAL NEW DEPENDENCY REQUIRED`.
- Use only the existing direct dependencies: `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`.
- Provider/model API calls = 0. E2B calls = 0. Real business effects = 0. The model remains a deterministic local fixture.
- No Product source/runtime modules. No ApprovalRequest, Gateway replay, PAR owner, Release owner or other mini-Product implementation.
- No monkey patch, package fork, private table mutation, unsupported internal hook or source patch.
- BT-4 and BT-5 remain BLOCKED. Plain active-Agent crash characterization remains outside BT-3A. B1-01..B4-18 are not executed literally.
- Package C execution, C-018, Product implementation, PR readiness and merge remain unauthorized.
- B5 remains NOT ADMITTED.
- Unknown stays `UNKNOWN` / `NOT_PROVEN`; do not manufacture a PASS.
- Any material authority/boundary contradiction → STOP and return Evidence to the Architecture Lead/operator.
- Unexpected runtime behavior → use `superpowers:systematic-debugging`; do not guess/fix by trial and error.
- TDD / RED→GREEN is mandatory for the candidate realization. The negative control must visibly fire before the guarded candidate can be trusted.
- At completion, run both the Package-B verifier and root `npm run verify` before claiming success.

---

## File Structure

### Create

- `spikes/conexus-3l-b/fixtures/bt3a-child.mjs` — fresh-process BT-3A suspend/resume fixture with observation points and optional closed authority projection.
- `spikes/conexus-3l-b/tests/bt3a-context-authority.test.mjs` — RED control + guarded candidate tests.
- `spikes/conexus-3l-b/evidence/bt3a-source.json` — exact pinned-source ordering/surface evidence generated from Task 2 inspection.
- `spikes/conexus-3l-b/evidence/bt3a.json` — bounded behavioral result Evidence.
- `docs/conexus/phase3/3L-B-BT3A-execution-result.md` — human-readable BT-3A result returned for Architecture-Lead adjudication.

### Modify before execution

- `docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md` — move the already operator-approved written spec from review-gated to execution-authorized.
- `docs/conexus/current/README.md` — route Package B to `BT-3A NEXT`; BT-4/BT-5 remain blocked.
- `docs/conexus/current/ARCHITECTURE-BASELINE.md` — project the bounded BT-3 adjudication and BT-3A next action without changing the protected architecture invariant.
- `docs/conexus/phase3/LEDGER.md` — live router becomes `BT-3A NEXT / EXECUTION AUTHORIZED`.

### Modify after execution

- `docs/conexus/phase3/3L-B-technology-qualification.md` — preserve original BT-3 result and append BT-3A result.
- `docs/conexus/current/README.md`
- `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- `docs/conexus/phase3/LEDGER.md`

Final router state after Codex execution must be `BT-3A EVIDENCE RETURNED / ARCHITECTURE-LEAD ADJUDICATION REQUIRED`, regardless of PASS or FAIL. Codex does not close BT-3.

---

### Task 1: Ratify the written BT-3A spec and move the live router to BT-3A

**Files:**
- Modify: `docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Modify: `docs/conexus/phase3/LEDGER.md`

**Interfaces:**
- Consumes: operator approval of the written BT-3A spec in chat on 2026-08-19.
- Produces: durable repository routing that authorizes BT-3A only.

- [ ] **Step 1: Revalidate branch and PR identity**

Run:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/agent/conexus-phase-3-system-design
gh pr view 40 --repo developmentconexus-ops/mnfs --json state,isDraft,mergedAt,headRefName,headRefOid,baseRefName
```

Expected:

```text
PR #40 = open
PR #40 = draft
mergedAt = null
headRefName = agent/conexus-phase-3-system-design
```

If local HEAD differs from remote branch, fast-forward/recreate the isolated worktree before editing. Never force-push over concurrent work.

- [ ] **Step 2: Read current authority and the approved written spec**

Read, in order:

```text
AGENTS.md
DevelopmentConexus Engineering Method
DOCUMENTATION-MAP
conexus/current/README.md
conexus/current/PRODUCT-CONTRACT.md as needed
conexus/current/ARCHITECTURE-BASELINE.md
conexus/current/DECISION-RECONCILIATION.md as needed
conexus/phase3/LEDGER.md
conexus/phase3/3H-03-runtime-isolation-correlation-handoff.md
conexus/phase3/3L-B-proof-routing-amendment.md
conexus/phase3/3L-B-technology-qualification.md
conexus/phase3/3L-B-BT3A-context-authority-discriminant.md
```

Stop if any newer accepted authority materially contradicts the ratified BT-3A scope.

- [ ] **Step 3: Persist the operator ratification in the BT-3A spec**

Replace the spec status with exactly:

```text
OPERATOR RATIFIED 2026-08-19 / EXECUTION AUTHORIZED / BT-3A NEXT
```

Replace Section 15 heading/body so the next action is execution, not another written-review request. Required meaning:

```text
BT-3A = NEXT / EXECUTION AUTHORIZED
BT-4 = BLOCKED
BT-5 = BLOCKED
BT-3 plain active crash = NOT AUTHORIZED BY BT-3A
Package C = NOT AUTHORIZED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
merge = NOT AUTHORIZED
```

- [ ] **Step 4: Update the live routers without changing architecture semantics**

Use the following status meaning in all three router projections:

```text
Package B = IN PROGRESS
BT-1 = PASS
BT-2 = PASS
BT-3 observed Mastra merge behavior = CONFIRMED EVIDENCE
BT-3 architecture contradiction = NOT YET ESTABLISHED
BT-3A = NEXT / EXECUTION AUTHORIZED
BT-4..BT-5 = BLOCKED
CX-AGENT-MASTRA-01 = NOT QUALIFIED / BT-3A PENDING
CX-RUNTIME-ISOLATION-01 = NOT PROVEN / BT-5 NOT EXECUTED
```

The exact next action in `ARCHITECTURE-BASELINE.md` must become:

```text
Execute only the operator-ratified BT-3A Context Authority Discriminant against the existing exact Package-B lock and return Evidence for Architecture-Lead adjudication. Do not execute BT-4/BT-5 or close BT-3.
```

Do not change the protected 3H-03 invariant yet. A mechanism wording correction is permitted only after BT-3A Evidence returns and the Architecture Lead adjudicates it.

- [ ] **Step 5: Run documentation/root verification**

Run:

```bash
npm run verify
```

Expected: exit 0. If a documentation fitness test encodes the old `LEAD ADJUDICATION REQUIRED` router, update only that exact projection to the newly ratified `BT-3A NEXT` state; do not weaken the test.

- [ ] **Step 6: Commit the ratification/router change**

```bash
git add \
  docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md \
  docs/conexus/current/README.md \
  docs/conexus/current/ARCHITECTURE-BASELINE.md \
  docs/conexus/phase3/LEDGER.md
git commit -m "docs(conexus): authorize Package B BT-3A"
```

---

### Task 2: Reconfirm exact pinned Mastra ordering before writing the candidate

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt3a-source.json`
- Read only: exact installed `node_modules/@mastra/core/**`

**Interfaces:**
- Consumes: exact Package-B lock and current Mastra skill + Context7 Evidence.
- Produces: a bounded source-ordering record that says whether the candidate schema surface is admissible before load-bearing runtime decisions.

- [ ] **Step 1: Load execution guidance and current external docs**

Load the installed Mastra skill. Then query Context7 `/mastra-ai/mastra` for these exact concepts:

```text
Agent requestContextSchema validation/transformation semantics
Agent dynamic instructions/model/tools resolution ordering
Agent suspend/resume RequestContext restoration semantics
```

Record only the document/source references needed for this probe. Do not treat current docs as proof of 1.56.0 behavior.

- [ ] **Step 2: Install only the existing exact lock**

```bash
cd spikes/conexus-3l-b
npm ci --ignore-scripts --audit=false --fund=false
npm run verify:lock
```

Expected:

```text
Package B lock admission passed.
```

Confirm the lock SHA-256 still equals the admitted Package-B lock:

```bash
sha256sum package-lock.json
```

If the digest changed, STOP. Do not regenerate the lock.

- [ ] **Step 3: Inspect exact pinned source for the ordering boundary**

Use `rg`/source inspection against installed `@mastra/core 1.56.0` to locate and trace, end-to-end:

```text
resumeGenerate / resumeStream
snapshot RequestContext restoration
fresh RequestContext overlay
requestContextSchema validation/transformation
creation of the effective RequestContext view
resolution of dynamic instructions
resolution of dynamic model
resolution of dynamic tools/toolsets or equivalent execution-shaping surface
resumed tool execution
snapshot persistence source vs transformed execution view
```

Representative search commands:

```bash
rg -n "resumeGenerate|resumeStream|requestContextSchema|snapshot.*requestContext|requestContext.*snapshot|validateRequestContext|DynamicArgument|instructions|tools|toolsets" node_modules/@mastra/core/dist
```

Do not stop at matching strings. Trace the actual call/data flow until the ordering is Known.

- [ ] **Step 4: Prove the schema form can be built without a new dependency**

The preferred test schema is a plain Standard Schema object so BT-3A does not add `zod` as a direct spike dependency. Confirm exact source accepts Standard Schema for `requestContextSchema` through the supported public schema path.

Candidate schema shape to use only if exact source confirms it is supported:

```js
const AUTHORITY_KEYS = new Set([
  'currentRole',
  'workspaceId',
  'featureFlag',
  'connectionId',
]);

function createClosedAuthoritySchema() {
  return {
    '~standard': {
      version: 1,
      vendor: 'conexus-bt3a',
      validate(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
          return { issues: [{ message: 'authority context must be an object' }] };
        }
        const value = input;
        if (typeof value.currentRole !== 'string') {
          return { issues: [{ message: 'currentRole must be string', path: ['currentRole'] }] };
        }
        if (typeof value.workspaceId !== 'string') {
          return { issues: [{ message: 'workspaceId must be string', path: ['workspaceId'] }] };
        }
        if (value.featureFlag !== 'ON' && value.featureFlag !== 'OFF') {
          return { issues: [{ message: 'featureFlag must be ON or OFF', path: ['featureFlag'] }] };
        }
        if (value.connectionId !== null && typeof value.connectionId !== 'string') {
          return { issues: [{ message: 'connectionId must be string or null', path: ['connectionId'] }] };
        }
        return {
          value: {
            currentRole: value.currentRole,
            workspaceId: value.workspaceId,
            featureFlag: value.featureFlag,
            connectionId: value.connectionId,
          },
        };
      },
    },
  };
}
```

The returned execution value deliberately contains **only** the four admitted authority keys. `evilStaleAuthority` must never appear in this returned projection.

If exact pinned source does not accept this Standard Schema shape, STOP with `SUPPORTED CLOSED SCHEMA FORM NOT PROVEN`; do not add a package.

- [ ] **Step 5: Freeze source Evidence**

Create `evidence/bt3a-source.json` with this exact JSON shape, populated from runtime/source inspection rather than guesses:

```json
{
  "probe": "BT-3A",
  "coreVersion": "1.56.0",
  "lockSha256": "<computed package-lock SHA-256>",
  "sourceFiles": [
    {
      "path": "<exact dist file>",
      "sha256": "<computed SHA-256>",
      "claim": "resume RequestContext merge ordering"
    },
    {
      "path": "<exact dist file>",
      "sha256": "<computed SHA-256>",
      "claim": "requestContextSchema execution-view ordering"
    }
  ],
  "resumeMergeBeforeSchema": true,
  "schemaResultUsedBeforeDynamicInstructions": true,
  "schemaResultUsedBeforeDynamicModel": true,
  "schemaResultUsedBeforeRequestContextSensitiveToolShaping": true,
  "plainStandardSchemaSupported": true,
  "snapshotPersistenceObservation": "<KNOWN statement from source>",
  "unknowns": []
}
```

The booleans above are **not expected answers**. Set them to the actual observed booleans. If a property is not provable, replace that property with an explicit string state such as `"NOT_PROVEN"`; do not force `true`.

If source proves stale raw context can influence a governed dynamic decision **before** the schema/transformed execution view, record the finding, commit the source Evidence, STOP with `FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT`, and do not invent a boundary adapter.

- [ ] **Step 6: Commit source Evidence**

```bash
git add spikes/conexus-3l-b/evidence/bt3a-source.json
git commit -m "test(conexus): freeze BT-3A Mastra source ordering"
```

---

### Task 3: Build the RED control and prove stale authority influence is detected

**Files:**
- Create: `spikes/conexus-3l-b/fixtures/bt3a-child.mjs`
- Create: `spikes/conexus-3l-b/tests/bt3a-context-authority.test.mjs`

**Interfaces:**
- Consumes: existing BT-3 direct-Agent/PostgreSQL/process-loss fixture pattern.
- Produces: a negative control that demonstrates the test fails if stale authority reaches a load-bearing observation point.

- [ ] **Step 1: Create the BT-3A child fixture by copying only proven BT-3 mechanics**

Start from the existing `fixtures/bt3-child.mjs` mechanics:

```text
PostgresStore
same schema across process A/B
Agent.listSuspendedRuns()
Agent.generate()
Agent.resumeGenerate()
deterministic local model
real createTool().suspend()
```

Do not copy Product semantics or add infrastructure.

The new fixture command shape must be:

```bash
node fixtures/bt3a-child.mjs <variant> <mode> <schemaName>
```

with:

```text
variant = unguarded | guarded
mode    = suspend | resume
```

Use distinct stable run IDs per variant:

```text
bt3a-unguarded-run
bt3a-guarded-run
```

- [ ] **Step 2: Add four observation helpers**

The fixture must record an observation before returning to the parent test:

```js
function snapshotContext(requestContext) {
  return {
    currentRole: requestContext.get('currentRole') ?? null,
    workspaceId: requestContext.get('workspaceId') ?? null,
    featureFlag: requestContext.get('featureFlag') ?? null,
    connectionId: requestContext.get('connectionId') ?? null,
    evilStaleAuthority: requestContext.get('evilStaleAuthority') ?? null,
  };
}

function observe(point, requestContext) {
  observations.push({
    point,
    requestContext: snapshotContext(requestContext),
  });
}
```

Wire `observe(...)` into every supported load-bearing point proven by Task 2, including at minimum:

```text
dynamic instructions
RequestContext-sensitive model resolver
resumed tool execution
```

If exact pinned source supports a RequestContext-sensitive tools/toolsets resolution surface used by the selected Agent path, instrument it too. If not, record `NOT_APPLICABLE_PINNED_SURFACE`; do not invent an API.

- [ ] **Step 3: Use old and fresh complete authority projections**

Suspend projection:

```js
const OLD_AUTHORITY = [
  ['currentRole', 'SALES'],
  ['workspaceId', 'W1'],
  ['featureFlag', 'ON'],
  ['connectionId', 'C1'],
  ['evilStaleAuthority', 'MUST_NOT_INFLUENCE'],
];
```

Resume projection:

```js
const NEW_AUTHORITY = [
  ['currentRole', 'FINANCE'],
  ['workspaceId', 'W1'],
  ['featureFlag', 'OFF'],
  ['connectionId', null],
];
```

The fresh projection is complete for the admitted authority contract. `connectionId=null` is the explicit absence fixture; `evilStaleAuthority` is intentionally omitted because it is outside the authority contract.

- [ ] **Step 4: Write the unguarded control test**

The first test must prove the pinned unguarded resume still leaks stale authority:

```js
assert.equal(resumedObservation.requestContext.currentRole, 'FINANCE');
assert.equal(resumedObservation.requestContext.featureFlag, 'OFF');
assert.equal(resumedObservation.requestContext.connectionId, null);
assert.equal(
  resumedObservation.requestContext.evilStaleAuthority,
  'MUST_NOT_INFLUENCE',
);
```

At least one pre-tool observation point must also see `evilStaleAuthority=MUST_NOT_INFLUENCE`; otherwise the control is insufficient for the ordering claim.

- [ ] **Step 5: Write the guarded expectation before implementing the guard**

Temporarily make the `guarded` fixture behavior identical to `unguarded`, then add a guarded test whose required outcome is:

```js
for (const observation of guardedResume.observations) {
  assert.equal(observation.requestContext.currentRole, 'FINANCE');
  assert.equal(observation.requestContext.workspaceId, 'W1');
  assert.equal(observation.requestContext.featureFlag, 'OFF');
  assert.equal(observation.requestContext.connectionId, null);
  assert.equal(observation.requestContext.evilStaleAuthority, null);
}
```

- [ ] **Step 6: Run only BT-3A and verify RED**

```bash
node --test --test-concurrency=1 tests/bt3a-context-authority.test.mjs
```

Expected:

```text
unguarded control = PASS
candidate guarded expectation = FAIL
failure shows evilStaleAuthority=MUST_NOT_INFLUENCE at a guarded resumed observation
```

If the guarded test passes before the candidate is implemented, the control does not prove the intended mechanism. STOP and fix the test design, not the Product architecture.

- [ ] **Step 7: Commit the RED control**

```bash
git add \
  spikes/conexus-3l-b/fixtures/bt3a-child.mjs \
  spikes/conexus-3l-b/tests/bt3a-context-authority.test.mjs
git commit -m "test(conexus): add BT-3A stale-context RED control"
```

---

### Task 4: Apply the smallest framework-supported closed authority projection and rerun GREEN

**Files:**
- Modify: `spikes/conexus-3l-b/fixtures/bt3a-child.mjs`
- Test: `spikes/conexus-3l-b/tests/bt3a-context-authority.test.mjs`

**Interfaces:**
- Consumes: the exact source ordering proved in Task 2 and the RED control from Task 3.
- Produces: the BT-3A candidate result without Product implementation.

- [ ] **Step 1: Add the closed authority schema only to the guarded variant**

Use the exact `createClosedAuthoritySchema()` from Task 2 only if exact pinned source confirmed it is a supported `requestContextSchema` input.

Configure the guarded Agent with:

```js
requestContextSchema: createClosedAuthoritySchema(),
```

The unguarded Agent must remain unchanged so the negative control continues to prove stale leakage.

- [ ] **Step 2: Make all guarded dynamic decisions consume only the effective RequestContext supplied by Mastra**

Do **not** manually sanitize inside the observation function, model fixture or tool. That would invalidate the probe.

Forbidden examples:

```js
delete requestContext.evilStaleAuthority;
const safe = pickKnownKeys(requestContext.toJSON());
const safeContext = new RequestContext(NEW_AUTHORITY);
```

The guarded observation must read the exact RequestContext object Mastra presents to that supported decision surface.

- [ ] **Step 3: Run BT-3A and verify GREEN or bounded failure**

```bash
node --test --test-concurrency=1 tests/bt3a-context-authority.test.mjs
```

A trusted `PASS_BOUNDED_REALIZATION` requires all of these:

```text
unguarded control still exposes evilStaleAuthority
process A PID != process B PID
genuine suspended run rediscovered in fresh process
guarded currentRole = FINANCE at every supported resumed load-bearing point
guarded workspaceId = W1 at every supported resumed load-bearing point
guarded featureFlag = OFF at every supported resumed load-bearing point
guarded connectionId = null at every supported resumed load-bearing point
guarded evilStaleAuthority = absent/null at every supported resumed load-bearing point
no manual sanitization/private snapshot mutation/framework patch
```

If schema validation fails closed before resumed dynamic decisions because the unknown stale key is rejected, that is also an admissible safety behavior **only if the rejection occurs before any load-bearing resumed decision and the unguarded control proved the stale path**. Record the outcome as `FAIL_CLOSED_UNKNOWN_KEY` inside the PASS evidence rather than pretending the key was stripped.

If a stale value reaches even one load-bearing guarded observation, verdict = `FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT`; STOP after recording Evidence. Do not implement the next boundary-adapter alternative.

- [ ] **Step 4: Re-run original BT-3 to ensure the finding is not accidentally hidden**

```bash
node --test --test-concurrency=1 tests/bt3-suspend-process-loss.test.mjs
```

Expected: existing BT-3 test still passes as a detector of the pinned merge behavior. BT-3A must not rewrite history by deleting the original failure Evidence.

- [ ] **Step 5: Commit the candidate probe**

```bash
git add \
  spikes/conexus-3l-b/fixtures/bt3a-child.mjs \
  spikes/conexus-3l-b/tests/bt3a-context-authority.test.mjs
git commit -m "test(conexus): execute BT-3A context authority discriminant"
```

---

### Task 5: Materialize bounded Evidence and return control to the Architecture Lead

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt3a.json`
- Create: `docs/conexus/phase3/3L-B-BT3A-execution-result.md`
- Modify: `docs/conexus/phase3/3L-B-technology-qualification.md`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Modify: `docs/conexus/phase3/LEDGER.md`

**Interfaces:**
- Consumes: Task 2 exact-source Evidence + Task 3/4 behavioral Evidence.
- Produces: a reviewable result package; no BT-3 closure.

- [ ] **Step 1: Create `evidence/bt3a.json`**

Use exactly this shape and actual results:

```json
{
  "probe": "BT-3A",
  "lockSha256": "<computed lock digest>",
  "versions": {
    "node": "24.18.0",
    "@mastra/core": "1.56.0",
    "@mastra/memory": "1.25.0",
    "@mastra/pg": "1.19.0",
    "postgresql": "17.10"
  },
  "control": {
    "unguardedStaleInfluenceDetected": true,
    "preToolStaleInfluenceDetected": true
  },
  "candidate": {
    "currentRole": "PASS|FAIL",
    "workspaceId": "PASS|FAIL",
    "featureFlag": "PASS|FAIL",
    "explicitAbsenceConnectionId": "PASS|FAIL",
    "unknownStaleAuthority": "ABSENT|FAIL_CLOSED_BEFORE_DECISION|FAIL",
    "processLossFreshResume": "PASS|FAIL"
  },
  "calls": {
    "provider": 0,
    "modelApi": 0,
    "e2b": 0,
    "realEffects": 0
  },
  "plainActiveCrash": "NOT_EXECUTED_BT3A_SCOPE",
  "bt4": "BLOCKED",
  "bt5": "BLOCKED",
  "verdict": "PASS_BOUNDED_REALIZATION|FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT|FAIL_REALIZATION_MATERIAL"
}
```

Do not use a PASS verdict if any candidate property is not actually proven.

- [ ] **Step 2: Write the human-readable execution result**

`3L-B-BT3A-execution-result.md` must include:

```text
exact final execution HEAD
exact lock SHA-256
exact pinned source files + SHA-256
Context7 library id
Mastra skill loaded = yes/no
negative control result
fresh-process proof
all observation points and observed values
explicit absence result
unknown-key result
Known / Unknown / limitation
verdict
architecture consequence = returned for Lead adjudication only
BT-4/BT-5 = not executed
provider/model/E2B/real effects = 0
```

Do not claim architecture correction yet, even on PASS.

- [ ] **Step 3: Append BT-3A to the technology qualification record without erasing BT-3**

Preserve:

```text
BT-3 original = FAIL_REALIZATION observation / mechanism finding
```

Add:

```text
BT-3A = <actual verdict>
Architecture-Lead adjudication = REQUIRED
BT-3 plain active crash = NOT EXECUTED
BT-4..BT-5 = NOT EXECUTED / BLOCKED
```

- [ ] **Step 4: Set the router to Evidence-returned state**

Use this meaning in README / Architecture / LEDGER:

```text
Package B = IN PROGRESS
BT-1 = PASS
BT-2 = PASS
BT-3 observed merge behavior = CONFIRMED
BT-3A = <actual verdict> / EVIDENCE RETURNED
Architecture-Lead adjudication = REQUIRED
BT-3 = NOT CLOSED
BT-4..BT-5 = BLOCKED / NOT EXECUTED
CX-AGENT-MASTRA-01 = NOT QUALIFIED PENDING LEAD ADJUDICATION
CX-RUNTIME-ISOLATION-01 = NOT PROVEN / BT-5 NOT EXECUTED
```

No router may say BT-4 is next.

- [ ] **Step 5: Run fresh verification**

Package B:

```bash
cd spikes/conexus-3l-b
npm run verify
```

Expected: all admission/lock tests plus BT-1, BT-2, BT-3 and BT-3A tests pass as tests of their declared verdicts.

Root:

```bash
cd <repo-root>
npm run verify
```

Expected: exit 0.

- [ ] **Step 6: Commit result and router**

```bash
git add \
  spikes/conexus-3l-b/evidence/bt3a.json \
  docs/conexus/phase3/3L-B-BT3A-execution-result.md \
  docs/conexus/phase3/3L-B-technology-qualification.md \
  docs/conexus/current/README.md \
  docs/conexus/current/ARCHITECTURE-BASELINE.md \
  docs/conexus/phase3/LEDGER.md
git commit -m "test(conexus): record Package B BT-3A evidence"
```

- [ ] **Step 7: Push the same PR branch and stop**

```bash
git push origin HEAD:agent/conexus-phase-3-system-design
```

Do not execute BT-3 plain active crash, BT-4, BT-5, Package C or any Product implementation after the push.

---

## Codex Return Contract

Return to the Architecture Lead exactly:

```text
final HEAD:
Package-B lock SHA-256:
Mastra skill loaded:
Context7 library id:
exact pinned source files + SHA-256:
source ordering verdict:
BT-3A RED control:
BT-3A candidate verdict:
observation points:
explicit absence result:
unknown stale authority result:
Package-B npm run verify:
root npm run verify:
provider/model/E2B/real-effect calls:
Findings:
BT-3 plain active crash = NOT EXECUTED
BT-4 = NOT EXECUTED
BT-5 = NOT EXECUTED
C-018 = NOT RATIFIED
merge = NOT PERFORMED
```

After this return, stop. The Architecture Lead independently re-reads current authority, exact Evidence and fresh CI before deciding whether the candidate becomes a bounded realization correction, whether a boundary adapter needs a new approved design, or whether a material Decision Loop is required.
