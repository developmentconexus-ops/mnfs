---
id: PLAN-CONEXUS-3L-R1-PROJECTION-BT3N
title: Conexus 3L-R1 Projection and BT-3N Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
last_reviewed: 2026-08-19
---

# Conexus 3L-R1 Projection + BT-3N Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Project the operator-ratified 3L-R1 framework-native qualification rebaseline into the canonical routers and produce one deciding BT-3N probe for native Mastra HITL plus current-owner authority after process loss.

**Architecture:** Preserve the direct code-defined Mastra Agent and PostgreSQL-backed suspended-run substrate already qualified by BT-1/BT-3. Use Mastra native `requireApproval`/approve-or-decline solely as pause/resume mechanics. Model current Conexus owner truth with a deterministic external fixture that is read at tool/effect boundary time, never from raw `RequestContext`; prove revocation after suspension wins even if Mastra is mechanically approved and stale runtime context remains physically observable.

**Tech Stack:** Node 24.18.0, npm lockfile v3, `node:test`, `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL 17.10, Markdown/documentation fitness tests.

**Spec:** `docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md`

## Global Constraints

- Repository: `developmentconexus-ops/mnfs`.
- Branch: `agent/conexus-phase-3-system-design`.
- PR: `#40`; keep `OPEN / DRAFT / NOT MERGED`.
- The prompt/plan is bootstrap only. `AGENTS.md`, the DevelopmentConexus Engineering Method, current Conexus authority and `3L-R1` control.
- Use an isolated worktree created through `superpowers:using-git-worktrees`.
- Before any Mastra-specific reasoning/edit/probe, load `.agents/skills/mastra/SKILL.md`.
- Use Context7 library `/mastra-ai/mastra` for current documentation when material.
- Version-specific claims must be checked against installed exact source for `@mastra/core 1.56.0` and the existing Package-B lock.
- Do not modify `spikes/conexus-3l-b/package.json`, `package-lock.json`, direct/transitive pins or dependencies.
- Provider/model API calls = `0`.
- E2B calls = `0`.
- Real external effects = `0`.
- Product implementation = forbidden.
- No `RuntimeContextService`, AuthorityProjection service, context bus, mini PAR, mini Gateway, fork, monkey patch, private snapshot mutation or generic workflow/runtime framework.
- BT-4N and BT-5N remain blocked. Stop after BT-3N Evidence and fresh CI.

---

### Task 1: Revalidate the execution base and freeze the proof contract

**Files:**
- Read: `AGENTS.md`
- Read: `docs/engineering/standards/root-cause-global-maximum-method.md`
- Read: `docs/conexus/current/README.md`
- Read: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Read: `docs/conexus/current/DECISION-RECONCILIATION.md`
- Read: `docs/conexus/phase3/LEDGER.md`
- Read: `docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md`
- Read: `.agents/skills/mastra/SKILL.md`
- Read: `spikes/conexus-3l-b/package-lock.json`

**Interfaces:**
- Consumes: operator-ratified `3L-R1`, exact Package-B lock and existing BT-1/2/3/3A Evidence.
- Produces: one frozen execution note in the final report; no repository file is required for ordinary bootstrap facts.

- [ ] **Step 1: Fetch and revalidate the branch/PR**

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/agent/conexus-phase-3-system-design
git status --short --branch
```

Expected:

```text
local HEAD = remote branch HEAD before edits
working tree = clean
PR #40 = open + draft + not merged
```

If local and remote differ, fast-forward/recreate the isolated worktree. Do not reset/delete another actor's work.

- [ ] **Step 2: Load required skills**

Read:

```text
superpowers:using-git-worktrees
superpowers:test-driven-development
superpowers:systematic-debugging
superpowers:verification-before-completion
.agents/skills/mastra/SKILL.md
```

If `.agents/skills/mastra/SKILL.md` is missing:

```text
STOP / MISSING EXECUTION PREREQUISITE
```

- [ ] **Step 3: Verify the exact Package-B lock without changing it**

```bash
cd spikes/conexus-3l-b
npm ci --ignore-scripts
npm run verify:lock
npm ls @mastra/core @mastra/memory @mastra/pg --all
sha256sum package-lock.json
```

Expected direct pins:

```text
@mastra/core   1.56.0
@mastra/memory 1.25.0
@mastra/pg     1.19.0
```

Expected existing lock digest:

```text
5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
```

If any identity differs, stop and report `PACKAGE_B_IDENTITY_DRIFT`.

- [ ] **Step 4: Record the falsification contract before editing**

The BT-3N claim is false if any occurs:

```text
native requireApproval does not suspend before execute
fresh process cannot discover/approve the suspended call
mechanical Mastra approval bypasses the current owner-boundary denial
raw stale RequestContext is consulted as business authority
revoked current owner truth still permits the local effect fixture
approved/allowed path executes the local effect more than once
```

Do not weaken these conditions after seeing runtime behavior.

---

### Task 2: Project 3L-R1 into the canonical routers with a RED→GREEN fitness test

**Files:**
- Create: `scripts/test-conexus-3l-r1-routing.mjs`
- Modify: `package.json`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/PRODUCT-CONTRACT.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Modify: `docs/conexus/current/DECISION-RECONCILIATION.md`
- Modify: `docs/conexus/phase3/LEDGER.md`
- Modify: `docs/conexus/phase3/3L-Q0-qualification-manifest.md`
- Modify: `docs/conexus/phase3/3L-B-proof-routing-amendment.md`
- Modify: `docs/conexus/phase3/3L-B-product-agent-cross-runtime-qualification.md`
- Modify: `docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md`
- Modify: `docs/conexus/phase3/3L-B-BT3A-lead-adjudication.md`

**Interfaces:**
- Consumes: exact supersession map and revised routing in `3L-R1`.
- Produces: canonical discovery path with `BT-3N NEXT`, Package C `DEFER SAFELY`, and no stale `BT-3A NEXT` execution instruction.

- [ ] **Step 1: Write the failing routing test**

Create `scripts/test-conexus-3l-r1-routing.mjs`:

```js
#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const read = (p) => readFile(path.join(root, p), 'utf8');

const [readme, product, architecture, reconciliation, ledger, q0, bt3a, bt3aLead] = await Promise.all([
  read('docs/conexus/current/README.md'),
  read('docs/conexus/current/PRODUCT-CONTRACT.md'),
  read('docs/conexus/current/ARCHITECTURE-BASELINE.md'),
  read('docs/conexus/current/DECISION-RECONCILIATION.md'),
  read('docs/conexus/phase3/LEDGER.md'),
  read('docs/conexus/phase3/3L-Q0-qualification-manifest.md'),
  read('docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md'),
  read('docs/conexus/phase3/3L-B-BT3A-lead-adjudication.md'),
]);

for (const [name, text] of Object.entries({ readme, architecture, reconciliation, ledger })) {
  assert.match(text, /3L-R1/u, `${name} must route through the operator-ratified 3L-R1 amendment`);
}

assert.match(readme, /BT-3N[^\n]*NEXT/u, 'current README must route Package B to BT-3N');
assert.match(ledger, /BT-3N[^\n]*NEXT/u, 'LEDGER must route Package B to BT-3N');
assert.doesNotMatch(readme, /BT-3A NEXT/u, 'current README must not re-authorize completed BT-3A');
assert.doesNotMatch(ledger, /BT-3A NEXT/u, 'LEDGER must not re-authorize completed BT-3A');
assert.match(architecture, /RequestContext[^\n]*runtime[^\n]*configuration[^\n]*not[^\n]*authority/iu,
  'Architecture Baseline must project RequestContext as non-authoritative runtime/configuration substrate');
assert.doesNotMatch(architecture, /REPLACE WHOLE restored\/effective context/u,
  'Architecture Baseline must not retain the superseded Mastra object-level replace-whole mechanism');
assert.match(product, /hard per-run USD[^\n]*not[^\n]*F1/iu,
  'Product Contract must not promise a hard per-run USD guarantee in F1');
assert.match(reconciliation, /Package C[^\n]*DEFER/u,
  'Decision Reconciliation must classify Package C as deferred for F1');
assert.match(q0, /Package C[^\n]*DEFER/u,
  'Q0 must project the Package-C deferral amendment');
assert.match(bt3a, /EXECUTED|SUPERSEDED/u,
  'BT-3A discriminant must say it is no longer the next action');
assert.match(bt3aLead, /3L-R1/u,
  'BT-3A lead adjudication must route its superseded candidate direction to 3L-R1');

console.log('Conexus 3L-R1 routing test passed.');
```

- [ ] **Step 2: Add the test to `docs:test`**

In root `package.json`, append the new test immediately after `test-conexus-r11-routing.mjs`:

```json
"docs:test": "npm run build --silent && node scripts/test-documentation-tooling.mjs && node scripts/test-conexus-r11-routing.mjs && node scripts/test-conexus-3l-r1-routing.mjs && ..."
```

Do not alter unrelated scripts/dependencies.

- [ ] **Step 3: Run RED**

```bash
node scripts/test-conexus-3l-r1-routing.mjs
```

Expected: FAIL on stale `BT-3A NEXT`/missing `3L-R1` projection.

Capture the first deciding failure in the completion report.

- [ ] **Step 4: Apply the exact current-state projection**

Required projection, without creating new semantics:

```text
3L-R1 = APPROVED / OPERATOR RATIFIED / CURRENT AMENDMENT
Package B = IN PROGRESS
BT-1 = PASS
BT-2 = PASS
BT-3 = FRAMEWORK BEHAVIOR CHARACTERIZED
BT-3A = COMPLETE / NATIVE SCHEMA HYPOTHESIS REJECTED
BT-3N = NEXT / EXECUTION AUTHORIZED
BT-4N = BLOCKED
BT-5N = BLOCKED
Package C = DEFER SAFELY / NO F1 EXECUTION
Package D/E = REDERIVE PROPORTIONALLY AFTER B
Product implementation = BLOCKED
C-018 = NOT RATIFIED
merge = NOT AUTHORIZED
```

Specific semantic replacements:

```text
Mastra RequestContext = REPLACE WHOLE authority state
→ SUPERSEDED

Mastra RequestContext
→ request/runtime configuration + correlation substrate
→ NEVER current business authority

governed decision
→ current/pinned Conexus owner facts rechecked at owner/tool/Gateway boundary
```

Product Contract addition near Product Agent/budget/cost language:

```text
F1 preserves finite server-derived model-call/step limits and truthful usage/cost visibility.
F1 does not promise a hard per-run USD/provider-invoice guarantee; monetary reservation/cost-envelope enforcement is deferred by 3L-R1 until a named trigger.
```

Q0 amendment:

```text
old unconditional A → B → C → D → E execution
→ amended by 3L-R1
→ C deferred; D/E rederived before admission
```

BT-3A files must preserve historical Evidence while adding a clear top note that the execution completed and the next route is `3L-R1 → BT-3N`.

- [ ] **Step 5: Run GREEN**

```bash
node scripts/test-conexus-3l-r1-routing.mjs
npm run docs:test
```

Expected:

```text
Conexus 3L-R1 routing test passed.
documentation tests = PASS
```

- [ ] **Step 6: Commit the authority projection**

```bash
git add \
  scripts/test-conexus-3l-r1-routing.mjs \
  package.json \
  docs/conexus/current/README.md \
  docs/conexus/current/PRODUCT-CONTRACT.md \
  docs/conexus/current/ARCHITECTURE-BASELINE.md \
  docs/conexus/current/DECISION-RECONCILIATION.md \
  docs/conexus/phase3/LEDGER.md \
  docs/conexus/phase3/3L-Q0-qualification-manifest.md \
  docs/conexus/phase3/3L-B-proof-routing-amendment.md \
  docs/conexus/phase3/3L-B-product-agent-cross-runtime-qualification.md \
  docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md \
  docs/conexus/phase3/3L-B-BT3A-lead-adjudication.md

git commit -m "docs(conexus): project framework-native 3L rebaseline"
```

---

### Task 3: Freeze the exact native HITL source/API ordering

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt3n-source.json`
- Test: existing Package-B verifier/test suite

**Interfaces:**
- Consumes: installed Mastra skill, Context7 `/mastra-ai/mastra`, exact installed source for `@mastra/core 1.56.0`.
- Produces: exact source/API evidence used by the runtime fixture; no runtime PASS yet.

- [ ] **Step 1: Consult embedded docs first**

Follow `.agents/skills/mastra/references/embedded-docs.md` and inspect installed docs/source for:

```text
createTool requireApproval
Agent listSuspendedRuns
Agent approveToolCall / approveToolCallGenerate
Agent declineToolCall / declineToolCallGenerate
persistent storage requirement
fresh-process suspended-run discovery
requestContext supplied on approval/resume
exact tool args/toolCallId preservation
```

- [ ] **Step 2: Query Context7 for the same concepts**

Use library:

```text
/mastra-ai/mastra
```

Queries must be narrow:

```text
Mastra direct Agent tool requireApproval approveToolCall persistent storage restart
Mastra listSuspendedRuns approveToolCall requestContext
Mastra human in the loop requireApproval vs tool suspend
```

Record Context7 as current external Evidence only.

- [ ] **Step 3: Inspect and hash exact installed source**

Use `rg`/`sha256sum` inside `spikes/conexus-3l-b/node_modules` to find the exact bundles implementing the public APIs.

Deciding questions:

```text
Does requireApproval stop tool.execute before approval?
Can listSuspendedRuns discover after process restart from PG storage?
Which public approve/decline API resumes the exact call?
Can a fresh RequestContext be supplied on approval?
Does native approval itself claim business authorization? (Expected: no; it is mechanism.)
Does any model/provider call occur before the approval gate in the deterministic fixture? (Expected: only local deterministic model.)
```

- [ ] **Step 4: Write `bt3n-source.json`**

Use this exact shape:

```json
{
  "probe": "BT-3N",
  "lockSha256": "5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0",
  "coreVersion": "1.56.0",
  "context7Library": "/mastra-ai/mastra",
  "sourceFiles": [
    {
      "path": "<exact installed relative path>",
      "sha256": "<exact sha256>",
      "claim": "requireApproval and public approve/decline ordering"
    },
    {
      "path": "<exact installed relative path>",
      "sha256": "<exact sha256>",
      "claim": "storage-backed suspended-run discovery after process restart"
    }
  ],
  "requireApprovalBeforeExecute": true,
  "freshProcessDiscoverySupported": true,
  "publicApprovalApi": "<exact public API used>",
  "freshRequestContextAccepted": true,
  "businessAuthorityOwnedByMastra": false,
  "unknowns": []
}
```

Do not use guessed file names or leave placeholders in the committed artifact. If any expected property is false/unknown, record it and stop before runtime implementation with the appropriate BT-3N failure class.

- [ ] **Step 5: Commit source Evidence**

```bash
git add spikes/conexus-3l-b/evidence/bt3n-source.json
git commit -m "test(conexus): freeze BT-3N native HITL source contract"
```

---

### Task 4: Implement BT-3N with a genuine process-loss RED/control and current-owner boundary

**Files:**
- Create: `spikes/conexus-3l-b/fixtures/bt3n-child.mjs`
- Create: `spikes/conexus-3l-b/tests/bt3n-native-hitl-owner-boundary.test.mjs`
- Create: `spikes/conexus-3l-b/evidence/bt3n.json`
- Reuse: `spikes/conexus-3l-b/fixtures/bt3-child.mjs`
- Reuse: `spikes/conexus-3l-b/tests/bt3-suspend-process-loss.test.mjs`

**Interfaces:**
- Consumes: native public APIs frozen in `bt3n-source.json`.
- Produces: one runtime verdict proving or falsifying native HITL + current-owner recheck after real process loss.

#### Required fixture contract

`bt3n-child.mjs` receives:

```text
mode
schemaName
authorityStatePath
effectStatePath
runId
```

Modes:

```text
suspend
approve
reject
```

The authority state file contains exactly:

```json
{"decision":"ALLOW"}
```

or:

```json
{"decision":"DENY"}
```

The effect state file contains:

```json
{"count":0}
```

The local effect fixture may only increment this file. It is not a real external effect.

- [ ] **Step 1: Write the runtime test first**

Create `bt3n-native-hitl-owner-boundary.test.mjs` with three subtests:

```js
await t.test('native approval suspends before execute and survives process loss', ...)
await t.test('current owner revocation blocks effect after mechanical approval', ...)
await t.test('current owner allow executes the local effect exactly once', ...)
```

Required assertions for suspension:

```js
assert.equal(suspended.finishReason, 'suspended');
assert.equal(suspended.toolExecuteCount, 0);
assert.equal(suspended.suspendedRuns.length, 1);
assert.equal(suspended.suspendedRuns[0].runId, runId);
assert.equal(suspended.suspendedRuns[0].toolCalls[0].requiresApproval, true);
```

Required assertions for revoked current authority:

```js
assert.notEqual(resumed.pid, suspended.pid);
assert.equal(resumed.discoveredRunId, runId);
assert.equal(resumed.mechanicalApproval, true);
assert.equal(resumed.currentOwnerDecision, 'DENY');
assert.equal(resumed.effectCount, 0);
assert.equal(resumed.toolResult.decision, 'DENIED_CURRENT_AUTHORITY');
assert.equal(resumed.rawRequestContext.staleBusinessAuthority, 'ALLOW');
```

The last assertion is intentional: the stale value may remain physically visible, but the current owner fixture must win. Do not sanitize it away merely to pass.

Required assertions for allowed current authority:

```js
assert.equal(resumed.currentOwnerDecision, 'ALLOW');
assert.equal(resumed.effectCount, 1);
assert.equal(resumed.toolResult.decision, 'EFFECT_APPLIED');
assert.deepEqual(resumed.approvedArgs, suspended.originalArgs);
```

Required assertions for native decline:

```js
assert.equal(declined.toolExecuteCount, 0);
assert.equal(declined.effectCount, 0);
```

- [ ] **Step 2: Run RED before the fixture exists**

```bash
cd spikes/conexus-3l-b
node --test --test-concurrency=1 tests/bt3n-native-hitl-owner-boundary.test.mjs
```

Expected: FAIL because `bt3n-child.mjs`/result contract is absent.

- [ ] **Step 3: Implement the deterministic direct Agent**

The fixture must use:

```js
import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { RequestContext } from '@mastra/core/request-context';
import { createTool } from '@mastra/core/tools';
import { PostgresStore } from '@mastra/pg';
```

Tool shape:

```js
const governedTool = createTool({
  id: 'bt3n-governed-effect',
  description: 'A deterministic local effect guarded by current owner truth.',
  requireApproval: true,
  inputSchema: /* reuse an exact schema form supported by the locked source */,
  execute: async (input, context) => {
    toolExecuteCount += 1;
    const authority = JSON.parse(await readFile(authorityStatePath, 'utf8'));
    const rawRequestContext = context.requestContext.toJSON();

    if (authority.decision !== 'ALLOW') {
      return {
        decision: 'DENIED_CURRENT_AUTHORITY',
        currentOwnerDecision: authority.decision,
        rawRequestContext,
        input,
      };
    }

    const effect = JSON.parse(await readFile(effectStatePath, 'utf8'));
    effect.count += 1;
    await writeFile(effectStatePath, JSON.stringify(effect));

    return {
      decision: 'EFFECT_APPLIED',
      currentOwnerDecision: authority.decision,
      rawRequestContext,
      input,
    };
  },
});
```

Do not use `requestContext.get('staleBusinessAuthority')` for the decision. The raw context is recorded only to prove semantic inertness.

The deterministic local model must issue one tool call with stable non-empty args, then return a final text after the tool result. Provider/network calls are prohibited.

- [ ] **Step 4: Implement genuine process A suspension**

In `suspend` mode:

```text
RequestContext:
  runtimeRole = PAR
  staleBusinessAuthority = ALLOW
  currentRole = OLD

current authority file:
  ALLOW
```

Call the direct Agent through the exact public generate API with the supplied run ID.

Expected:

```text
requireApproval suspends before tool.execute
snapshot persists in PostgreSQL
process exits cleanly
```

- [ ] **Step 5: Implement fresh-process approve/decline**

In `approve` mode:

```text
new Node PID
→ listSuspendedRuns()
→ locate exact run/toolCall
→ call the exact native approve API from bt3n-source.json
→ supply fresh RequestContext:
   runtimeRole = PAR
   currentRole = NEW
→ collect final output/tool result/effect count
```

In `reject` mode, use the exact native decline API and prove the tool did not execute.

The current authority file is read only inside the governed tool boundary after mechanical approval. The test harness mutates the file from `ALLOW` to `DENY` between process A and B for the revocation scenario.

- [ ] **Step 6: Run GREEN**

```bash
cd spikes/conexus-3l-b
node --test --test-concurrency=1 tests/bt3n-native-hitl-owner-boundary.test.mjs
npm run verify
```

Allowed verdict mapping:

```text
all required assertions pass
→ PASS_NATIVE_HITL_OWNER_BOUNDARY

native suspension/discovery/approve API fails on exact supported path
→ FAIL_NATIVE_HITL_RECOVERY

mechanical approval can reach local effect despite current owner DENY
→ FAIL_OWNER_RECHECK_BOUNDARY

only private patch/fork/snapshot mutation/new architecture can solve
→ MATERIAL_REALIZATION_FAILURE
```

- [ ] **Step 7: Write `bt3n.json` from actual results**

Use exact committed values; no placeholders:

```json
{
  "probe": "BT-3N",
  "lockSha256": "5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0",
  "postgresqlVersion": "17.10",
  "nativeRequireApprovalBeforeExecute": "PASS",
  "freshProcessSuspendedRunDiscovery": "PASS",
  "nativeApprovalApi": "<actual API>",
  "nativeDeclineApi": "<actual API>",
  "staleRawRequestContextObservable": true,
  "staleRawRequestContextUsedAsAuthority": false,
  "revokedCurrentOwnerEffectCount": 0,
  "allowedCurrentOwnerEffectCount": 1,
  "providerCalls": 0,
  "e2bCalls": 0,
  "realExternalEffects": 0,
  "verdict": "PASS_NATIVE_HITL_OWNER_BOUNDARY",
  "limitations": [
    "The deterministic current-owner fixture proves boundary feasibility, not Product PAR/Gateway implementation conformance."
  ]
}
```

Use the actual failure verdict if required assertions do not pass.

- [ ] **Step 8: Commit BT-3N**

```bash
git add \
  spikes/conexus-3l-b/fixtures/bt3n-child.mjs \
  spikes/conexus-3l-b/tests/bt3n-native-hitl-owner-boundary.test.mjs \
  spikes/conexus-3l-b/evidence/bt3n.json

git commit -m "test(conexus): qualify native Product Agent HITL boundary"
```

---

### Task 5: Record executor Evidence, verify the entire repository, push, and STOP

**Files:**
- Modify: `docs/conexus/phase3/3L-B-technology-qualification.md`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/phase3/LEDGER.md`

**Interfaces:**
- Consumes: actual BT-3N source/runtime Evidence.
- Produces: an executor result only; Architecture Lead still owns adjudication and BT-4N authorization.

- [ ] **Step 1: Update status without self-adjudicating Package B**

If BT-3N passes, project:

```text
BT-3N EXECUTION = COMPLETE
BT-3N EXECUTOR VERDICT = PASS_NATIVE_HITL_OWNER_BOUNDARY
ARCHITECTURE-LEAD ADJUDICATION = PENDING
BT-4N = BLOCKED / NOT AUTHORIZED
BT-5N = BLOCKED / NOT AUTHORIZED
Package B = IN PROGRESS / NOT CLOSED
```

If it fails, project the exact failure and:

```text
BT-4N = BLOCKED
STOP → Architecture Lead
```

Do not mark `CX-AGENT-MASTRA-01` qualified or Package B closed.

- [ ] **Step 2: Run fresh package verification**

```bash
cd spikes/conexus-3l-b
npm run verify
```

Required result: exit `0`, all tests pass. A failing BT-3N claim must be represented as a passing detector test plus failure verdict Evidence, not hidden by making CI red forever.

- [ ] **Step 3: Run fresh root verification**

```bash
cd <repo-root>
npm run verify
```

Required result before any completion claim: exit `0`.

- [ ] **Step 4: Push and wait for fresh PR CI**

```bash
git push origin HEAD:agent/conexus-phase-3-system-design
```

Wait for these workflows on the final HEAD:

```text
Documentation
Conexus 3L Package B
Conexus 3L Package A
Conexus 3L Package A Lock Bootstrap
```

All must be `SUCCESS`. Provider/model/E2B jobs must not be newly enabled by this work.

- [ ] **Step 5: Return the exact completion report and STOP**

```text
final HEAD:
PR state/draft/merged:
Package-B lock SHA-256:
Mastra skill loaded:
Context7 library:
exact source files + SHA-256:
3L-R1 routing RED result:
3L-R1 routing GREEN result:
BT-3N source ordering verdict:
BT-3N native suspend result:
BT-3N fresh-process discovery result:
BT-3N revoked-owner result:
BT-3N allowed-owner result:
BT-3N decline result:
stale raw RequestContext physically observable?:
stale raw RequestContext used as authority?:
Package-B npm run verify:
root npm run verify:
fresh CI:
provider/model calls:
E2B calls:
real external effects:
Findings:
BT-4N = NOT EXECUTED
BT-5N = NOT EXECUTED
Package C = NOT EXECUTED / DEFER SAFELY
C-018 = NOT RATIFIED
Product implementation = NOT PERFORMED
merge = NOT PERFORMED
```

Do not continue into BT-4N by inheritance. Architecture Lead reads and adjudicates BT-3N first.

---

## Plan self-review

- Spec coverage: 3L-R1 projection, BT-3N native approval, process loss, current-owner recheck, stale context inertness, Package-C deferral routing and serial stop are all covered.
- Placeholders: placeholders appear only in prescribed Evidence templates and must be replaced with actual values before commit; the plan explicitly forbids committing them.
- Dependency/type consistency: no dependency or lock changes; fixture/test contract uses stable file paths and the exact API name frozen by Task 3.
- Scope: BT-4N/BT-5N/Product code/Package C execution remain excluded.
