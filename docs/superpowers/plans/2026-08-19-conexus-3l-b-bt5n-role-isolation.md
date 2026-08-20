---
id: PLAN-CONEXUS-3L-B-BT5N-ROLE-ISOLATION
title: Conexus 3L Package B BT-5N Role-Instance Isolation Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
last_reviewed: 2026-08-19
---

# Conexus 3L Package B BT-5N Role-Instance Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove or falsify whether `BuilderMastra` and `ParMastra` can coexist safely in one Node process with separate stores, PubSubs and registered runtime surfaces, while every process-global Mastra facility actually enabled by the Conexus F1 baseline remains unable to influence the opposite role.

**Architecture:** Build two explicit Mastra role instances in one deterministic Package-B harness over one PostgreSQL server but different Mastra schemas and different `EventEmitterPubSub` instances. Exercise only the native F1 surfaces already admitted by 3L-R1: direct code-defined Agents, role-local tools/workflows/memory/schedules and explicit persistent runtime attachment. Use one intentionally shared-PubSub negative control to prove the isolation guard is meaningful. Enumerate module-global facilities from the exact pinned source, but qualify only enabled F1 facilities; deferred scorer/eval, DurableAgent and Observational Memory globals remain disabled and become requalification triggers rather than reasons for speculative process split.

**Tech Stack:** Node `24.18.0`, npm lockfile v3, `node:test`, exact existing Package-B lock (`@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`), PostgreSQL `17.10`, repo-installed Mastra skill, Context7 `/mastra-ai/mastra`.

**Spec:** `docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md`  
**Admission:** `docs/conexus/phase3/3L-B-BT4N-lead-adjudication.md`

## Global Constraints

- Repository: `developmentconexus-ops/mnfs`.
- Branch: `agent/conexus-phase-3-system-design`.
- PR: `#40`; keep `OPEN / DRAFT / NOT MERGED`.
- Revalidate remote HEAD, PR state and fresh CI before touching files.
- Work in an isolated worktree created through `superpowers:using-git-worktrees`.
- Read `AGENTS.md`, the DevelopmentConexus Engineering Method, current Conexus README, 3L-R1 and the BT-4N lead adjudication before execution.
- Load `.agents/skills/mastra/SKILL.md` before any Mastra-specific reasoning, source inspection, editing or probing.
- Use Context7 `/mastra-ai/mastra` when current documentation is material. Exact-version deciding claims require the installed source/declarations for the existing lock and/or executable Evidence.
- Do not modify `spikes/conexus-3l-b/package.json`, `spikes/conexus-3l-b/package-lock.json`, direct/transitive pins or dependencies.
- Package-B lock SHA-256 remains `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`.
- Provider/model API calls = `0`; local deterministic model fixtures are allowed only to exercise an attached direct-Agent path.
- E2B calls = `0`.
- Real external effects = `0`.
- Product implementation, Product schemas and Product owner repositories are forbidden.
- Do not create RuntimeBus, EventBus, generic PubSub abstraction, ProcessRegistry, queue, outbox, lease/fencing system, microservice protocol or process split inside the harness.
- Do not create a universal runtime wiring layer merely to make the probe pass.
- The probe may contain test-local role fixtures and fail-closed assertions only; they do not become Product modules.
- Package C remains `DEFER SAFELY / NOT EXECUTED`.
- Packages D/E remain `NOT EXECUTED / RE-DERIVE AFTER PACKAGE B`.
- Stop immediately on a material contradiction rather than redesigning the architecture inside the spike.
- Package B remains open after executor completion. Architecture Lead adjudicates BT-5N and Package-B closure separately.

---

## File Structure

Create:

```text
spikes/conexus-3l-b/evidence/bt5n-source.json
spikes/conexus-3l-b/evidence/bt5n.json
spikes/conexus-3l-b/fixtures/bt5n-role-fixtures.mjs
spikes/conexus-3l-b/tests/bt5n-role-instance-isolation.test.mjs
```

Modify only as required for status/proof projection:

```text
scripts/test-conexus-3l-r1-routing.mjs
docs/conexus/current/README.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
docs/conexus/phase3/LEDGER.md
docs/conexus/phase3/3L-B-technology-qualification.md
```

Do not modify any Product source file, dependency manifest or lockfile.

---

### Task 1: Project BT-4N adjudication and close the current-tree routing gap

**Files:**
- Modify: `scripts/test-conexus-3l-r1-routing.mjs`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Modify: `docs/conexus/current/DECISION-RECONCILIATION.md`
- Modify: `docs/conexus/phase3/LEDGER.md`
- Modify: `docs/conexus/phase3/3L-B-technology-qualification.md`
- Read: `docs/conexus/phase3/3L-B-BT4N-lead-adjudication.md`

**Interfaces:**
- Consumes: BT-4N lead verdict `PASS_NATIVE_SCHEDULE_INGRESS`.
- Produces: one consistent current-tree route with BT-5N as the only authorized Package-B execution.

- [ ] **Step 1: Extend the router fitness test before changing docs**

Add the BT-4N adjudication document to the `Promise.all` read set and add assertions equivalent to this exact behavior:

```js
for (const [name, text] of Object.entries({ readme, architecture, reconciliation, ledger })) {
  assert.match(
    text,
    /BT-4N[^\n]*PASS[^\n]*LEAD-ADJUDICATED[^\n]*PASS_NATIVE_SCHEDULE_INGRESS/iu,
    `${name} must project the lead-adjudicated BT-4N PASS`,
  );
  assert.match(
    text,
    /BT-5N[^\n]*NEXT[^\n]*AUTHORIZED/iu,
    `${name} must route only BT-5N as next`,
  );
  assert.doesNotMatch(
    text,
    /BT-4N[^\n]*(?:NEXT|ADJUDICATION[^\n]*PENDING)/iu,
    `${name} must not retain stale BT-4N execution or pending-adjudication state`,
  );
}

assert.match(
  bt4nLead,
  /PASS_NATIVE_SCHEDULE_INGRESS/iu,
  'router projection must be anchored in the BT-4N lead adjudication',
);
```

Preserve all existing R11, 3L-R1, Package-C deferral and BT-3N assertions.

- [ ] **Step 2: Run the router test and capture RED**

Run from repository root:

```bash
node scripts/test-conexus-3l-r1-routing.mjs
```

Expected before projection: non-zero exit because `ARCHITECTURE-BASELINE.md` and `DECISION-RECONCILIATION.md` still say `BT-4N NEXT / EXECUTION AUTHORIZED`.

Record the exact failed assertion in the execution report; do not weaken the test to make it pass.

- [ ] **Step 3: Project the adjudicated state into every current router**

Update the listed documents so each relevant status/next-action projection states:

```text
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
BT-5N = NEXT / EXECUTION AUTHORIZED
Package B = IN PROGRESS / NOT CLOSED
Package C = DEFER SAFELY / NOT EXECUTED
Product implementation = BLOCKED
C-018 = NOT RATIFIED
```

Preserve the BT-4N limitation:

```text
stable occurrence adapter is bound to the exact qualified Mastra scheduler/run-id contract
→ fail closed on malformed material
→ requalify on behavior/version change
```

Do not restate or change Product semantics.

- [ ] **Step 4: Run the router test and capture GREEN**

```bash
node scripts/test-conexus-3l-r1-routing.mjs
```

Expected:

```text
Conexus 3L-R1 routing test passed.
```

- [ ] **Step 5: Commit only the routing projection**

```bash
git add \
  scripts/test-conexus-3l-r1-routing.mjs \
  docs/conexus/current/README.md \
  docs/conexus/current/ARCHITECTURE-BASELINE.md \
  docs/conexus/current/DECISION-RECONCILIATION.md \
  docs/conexus/phase3/LEDGER.md \
  docs/conexus/phase3/3L-B-technology-qualification.md

git commit -m "docs(conexus): project BT-4N lead adjudication"
```

---

### Task 2: Freeze the exact BT-5N source admission and enabled-surface inventory

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt5n-source.json`
- Read only: `.agents/skills/mastra/SKILL.md`
- Read only: exact installed `node_modules/@mastra/core/**`, `node_modules/@mastra/memory/**`, `node_modules/@mastra/pg/**`

**Interfaces:**
- Consumes: exact Package-B lock and current F1 Mastra realization from 3L-R1.
- Produces: a version-bound inventory distinguishing instance-local, enabled module-global, deferred module-global and unknown surfaces.

- [ ] **Step 1: Reinstall and verify the exact isolated lock**

```bash
cd spikes/conexus-3l-b
npm ci --ignore-scripts --audit=false --fund=false
npm run verify:lock
```

Expected:

```text
Package B lock admission passed.
```

Run:

```bash
sha256sum package-lock.json
```

Expected SHA-256:

```text
5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
```

Any drift is `STOP / LOCK IDENTITY DRIFT`.

- [ ] **Step 2: Inspect embedded docs and exact declarations first**

Follow the installed Mastra skill priority. Inspect public declarations/docs for:

```text
Mastra constructor/config:
  agents
  tools
  workflows
  memory
  storage
  pubsub
  workers / scheduler

role-local lookup:
  getAgent / getAgentById
  getTool / getToolById
  getWorkflow
  getMemory
  schedules APIs

runtime attachment/fallback:
  Agent registration / Mastra attachment
  standalone Agent ephemeral Mastra fallback

PubSub:
  explicit EventEmitterPubSub
  instance-configured pubsub
  module/default PubSub paths
```

Use bounded commands such as:

```bash
rg -n "class Mastra|interface Config|pubsub|EventEmitterPubSub|getAgentById|getToolById|getWorkflow|getMemory" \
  node_modules/@mastra/core/dist \
  --glob '*.d.ts' --glob '*.js' > /tmp/bt5n-instance-source.txt

rg -n "standalone|ephemeral|thread-stream|default.*PubSub|globalRunRegistry|registerHook|const hooks|activeOps" \
  node_modules/@mastra/core/dist node_modules/@mastra/memory/dist \
  --glob '*.d.ts' --glob '*.js' > /tmp/bt5n-global-source.txt
```

- [ ] **Step 3: Classify every source finding against the current F1 baseline**

Use exactly these classifications:

```text
INSTANCE_LOCAL
MODULE_GLOBAL_ENABLED_F1
MODULE_GLOBAL_DEFERRED
NOT_REACHABLE_IN_TESTED_BASELINE
UNKNOWN_LOAD_BEARING
```

At minimum classify:

```text
Mastra agent/tool/workflow/memory registries
configured storage
configured PubSub
scheduler/worker ownership
agent thread-stream/default PubSub machinery
scorer/evaluation hooks
DurableAgent run registry/cache/pubsub machinery
Observational Memory active-operation registry
standalone Agent ephemeral Mastra fallback
```

Rules:

```text
optional feature exists
-X-> enabled F1 capability

MODULE_GLOBAL_DEFERRED
-X-> process split requirement

UNKNOWN_LOAD_BEARING on an enabled F1 path
→ STOP before positive qualification
```

- [ ] **Step 4: Hash every deciding exact installed file**

For every file used to justify an instance/global classification:

```bash
sha256sum node_modules/@mastra/core/dist/<exact-file>
sha256sum node_modules/@mastra/memory/dist/<exact-file>
sha256sum node_modules/@mastra/pg/dist/<exact-file>
```

Do not cite mutable remote `main` as the version-specific authority.

- [ ] **Step 5: Write `bt5n-source.json` using this closed schema**

```json
{
  "probe": "BT-5N",
  "lockSha256": "5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0",
  "coreVersion": "1.56.0",
  "memoryVersion": "1.25.0",
  "pgVersion": "1.19.0",
  "context7Library": "/mastra-ai/mastra",
  "sourceFiles": [],
  "instanceLocalSurfaces": [],
  "enabledProcessGlobalSurfaces": [],
  "deferredProcessGlobalSurfaces": [],
  "standaloneFallback": {
    "exists": true,
    "requiredForGovernedAttachedExecution": false
  },
  "loadBearingUnknowns": [],
  "sourceAdmission": "PASS"
}
```

For `sourceFiles`, append objects with exactly:

```json
{
  "path": "node_modules/@mastra/core/dist/example.js",
  "sha256": "64-lowercase-hex-characters",
  "claim": "one bounded deciding claim"
}
```

Replace the illustrative path/hash with actual installed identities. Do not retain illustrative data.

For each surface list, use objects with:

```json
{
  "surface": "bounded surface name",
  "classification": "INSTANCE_LOCAL",
  "f1Enabled": true,
  "reason": "source-bound reason"
}
```

If any enabled F1 path remains `UNKNOWN_LOAD_BEARING`, set:

```json
"sourceAdmission": "STOP_NOT_PROVEN"
```

and stop before Task 3.

- [ ] **Step 6: Commit source admission only**

```bash
git add spikes/conexus-3l-b/evidence/bt5n-source.json
git commit -m "test(conexus): admit BT-5N role-isolation source"
```

---

### Task 3: Implement BT-5N RED controls and same-process role-isolation proof

**Files:**
- Create: `spikes/conexus-3l-b/fixtures/bt5n-role-fixtures.mjs`
- Create: `spikes/conexus-3l-b/tests/bt5n-role-instance-isolation.test.mjs`

**Interfaces:**
- Consumes: public exact surfaces admitted by `bt5n-source.json`.
- Produces: deterministic observations for object graph, registry, store, PubSub and enabled-global isolation.

- [ ] **Step 1: Build two explicit role fixtures with no implicit defaults**

In `bt5n-role-fixtures.mjs`, export a factory with this contract:

```js
export async function createRoleFixture({
  role,
  connectionString,
  schemaName,
  pubsub,
  counters,
}) {
  // returns { mastra, store, pubsub, agent, workflow, tool, memory, scheduleId, close }
}
```

Each role fixture must create unique IDs prefixed by the lower-case role:

```text
builder-agent / par-agent
builder-tool / par-tool
builder-workflow / par-workflow
builder-memory / par-memory
builder-schedule / par-schedule
```

Each fixture must:

```text
receive an explicit EventEmitterPubSub instance
receive an explicit PostgreSQL schema name
construct one explicit PostgresStore
construct one local deterministic model object
construct one code-defined direct Agent
construct one role-local tool
construct one role-local workflow with one deterministic step
construct/register one role-local Memory using the exact supported API
construct one Mastra instance with explicit store + pubsub + registries
avoid standalone Agent execution
avoid external/provider calls
```

The deterministic model may return a fixed text response only. It must increment a local `modelFixtureCalls` counter while the Evidence separately records `providerCalls = 0`.

`close()` must stop workers and close only the role's own PubSub/store resources.

- [ ] **Step 2: Write a RED wiring guard for accidental shared mutable identities**

Before positive execution, write a pure assertion helper in the test:

```js
function assertDistinctRoleWiring(builder, par) {
  assert.notEqual(builder.mastra, par.mastra, 'role Mastra instances must differ');
  assert.notEqual(builder.store, par.store, 'role stores must differ');
  assert.notEqual(builder.pubsub, par.pubsub, 'role PubSub instances must differ');
  assert.notEqual(builder.agent, par.agent, 'role Agent objects must differ');
  assert.notEqual(builder.memory, par.memory, 'role Memory objects must differ');
}
```

Prove the guard fires:

```js
assert.throws(
  () => assertDistinctRoleWiring(builder, { ...par, pubsub: builder.pubsub }),
  /role PubSub instances must differ/u,
);
```

Repeat the negative substitution for store, Agent and Memory. A guard that is never shown to fire is not Evidence.

- [ ] **Step 3: Demonstrate actual shared-PubSub bleed as the negative control**

Create one independent `EventEmitterPubSub` shared only by the negative fixture.

Subscribe two role observers to the same test topic without a consumer group. Publish one Builder-tagged event. Assert:

```js
assert.equal(builderObserverCount, 1);
assert.equal(parObserverCount, 1);
```

This proves that object identity sharing makes cross-role delivery reachable and that distinct PubSub wiring is not ceremonial.

Close this negative PubSub before creating the governed positive fixtures.

- [ ] **Step 4: Prove instance-local registry isolation**

With the two positive role fixtures, assert successful same-role resolution and opposite-role refusal using only public exact APIs admitted by source:

```text
BuilderMastra resolves builder Agent/tool/workflow/memory
BuilderMastra refuses par Agent/tool/workflow/memory
ParMastra resolves par Agent/tool/workflow/memory
ParMastra refuses builder Agent/tool/workflow/memory
```

Use exact thrown `MastraError`/not-found behavior from the installed version. Do not catch every error indiscriminately; assert the expected not-found class/message/id.

For schedule rows:

```text
create builder schedule through builder Mastra
create par schedule through par Mastra
builder schedules.get(par schedule id) → not found
par schedules.get(builder schedule id) → not found
```

This must use role-local public APIs and different PostgreSQL schemas, not direct cross-schema SQL.

- [ ] **Step 5: Prove role-local persistent store isolation**

Use schema names of the form:

```text
mastra_bt5n_builder_<12 hex>
mastra_bt5n_par_<12 hex>
```

Exercise at least one persistent native record per role through public APIs:

```text
one workflow run or schedule row in Builder store
one workflow run or schedule row in PAR store
```

Assert each role can reopen/read only its own expected identity through its configured store/API and receives not-found for the opposite-role identity.

Record exact schema names in runtime Evidence. Physical co-location on one PostgreSQL server is allowed; logical store identity must remain disjoint.

- [ ] **Step 6: Prove explicit PubSub runtime isolation on an actual Mastra workflow path**

Start the two Mastra worker sets using their explicit role PubSubs.

Publish or trigger one supported `workflow.start` path on Builder PubSub for the Builder workflow and one on PAR PubSub for the PAR workflow. Use exact public event/API surfaces proven in Task 2.

Assert:

```text
Builder workflow execution count = 1
PAR workflow execution count     = 1
Builder workflow never executes on PAR fixture
PAR workflow never executes on Builder fixture
Builder PubSub observer sees only Builder role events
PAR PubSub observer sees only PAR role events
```

The test must not use the same PubSub in the positive path.

- [ ] **Step 7: Prove attached direct Agents do not require standalone/ephemeral fallback**

Invoke each exact code-defined Agent through its own registered role instance using the deterministic local model.

Assert:

```text
Builder direct Agent result comes from builder fixture
PAR direct Agent result comes from par fixture
opposite-role tool is unavailable to each Agent
provider calls = 0
real external effects = 0
```

The source record must already establish that standalone/ephemeral fallback exists but is not required for attached governed execution. Do not invoke the standalone path as governed success.

- [ ] **Step 8: Challenge enabled process-global surfaces only**

Using the exact source inventory, create runtime canaries only for surfaces classified `MODULE_GLOBAL_ENABLED_F1`.

For the current expected baseline, the key canary is thread/stream PubSub routing under explicit role attachment. Exercise the exact supported Agent/workflow path and assert all observed events remain on the explicit role PubSub.

For each `MODULE_GLOBAL_DEFERRED` surface, record instead:

```text
scorers/eval hooks            = NOT ADMITTED / NOT QUALIFIED
DurableAgent run registry     = NOT ADMITTED / NOT QUALIFIED
Observational Memory globals  = NOT ADMITTED / NOT QUALIFIED
```

Do not enable a deferred feature merely to test it. Each becomes a reopen/requalification trigger.

If an enabled F1 module-global facility creates cross-role influence that remains after explicit store/PubSub/registry partitioning:

```text
verdict candidate = PROCESS_SPLIT_REQUIRED
```

Do not implement the split.

If the source/runtime cannot observe an enabled F1 global sufficiently:

```text
verdict candidate = NOT_PROVEN
```

Do not invent a private hook or monkey patch.

- [ ] **Step 9: Run the isolated BT-5N test**

```bash
cd spikes/conexus-3l-b
node --test --test-concurrency=1 tests/bt5n-role-instance-isolation.test.mjs
```

Allowed executor verdicts:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

The test must fail—not downgrade to a narrative limitation—if:

```text
opposite registry resolves
opposite store identity is visible through role API
positive role PubSub crosses roles
standalone fallback is required
an enabled module-global facility changes opposite-role governed execution
```

- [ ] **Step 10: Commit the probe**

```bash
git add \
  spikes/conexus-3l-b/fixtures/bt5n-role-fixtures.mjs \
  spikes/conexus-3l-b/tests/bt5n-role-instance-isolation.test.mjs

git commit -m "test(conexus): probe BT-5N role-instance isolation"
```

---

### Task 4: Record bounded BT-5N Evidence and stop for Package-B adjudication

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt5n.json`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/phase3/LEDGER.md`
- Modify: `docs/conexus/phase3/3L-B-technology-qualification.md`

**Interfaces:**
- Consumes: actual source/runtime result from Tasks 2–3.
- Produces: executor Evidence only; Architecture Lead adjudicates BT-5N and Package-B closure.

- [ ] **Step 1: Write `bt5n.json` with actual observed values**

Use this closed shape:

```json
{
  "probe": "BT-5N",
  "lockSha256": "5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0",
  "postgresqlVersion": "17.10",
  "roleInstancesDistinct": true,
  "storeSchemas": {
    "builder": "actual builder schema",
    "par": "actual par schema"
  },
  "pubsubInstancesDistinct": true,
  "sharedPubSubNegativeControl": "FIRED",
  "registryIsolation": "PASS",
  "persistentStoreIsolation": "PASS",
  "workflowPubSubIsolation": "PASS",
  "attachedAgentExecution": "PASS",
  "moduleDefaultOrGlobalCanary": "PASS",
  "enabledProcessGlobalSurfaces": [],
  "deferredProcessGlobalSurfaces": [],
  "builderExecutions": 0,
  "parExecutions": 0,
  "localModelFixtureCalls": 0,
  "providerCalls": 0,
  "e2bCalls": 0,
  "realExternalEffects": 0,
  "verdict": "QUALIFIED_SAME_PROCESS",
  "limitations": [],
  "requalificationTriggers": []
}
```

Replace all illustrative counts, schema strings, surface lists, verdict and limitations with actual observations. `builderExecutions`, `parExecutions` and `localModelFixtureCalls` may be positive because they are deterministic local fixtures. Provider/E2B/real-effect counters must remain zero.

Allowed `moduleDefaultOrGlobalCanary` values:

```text
PASS
NOT_PROVEN
FAIL_CROSS_ROLE_BLEED
```

Allowed verdicts:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

Required requalification triggers must include every deferred process-global Mastra feature identified by source, plus any future switch to a shared external PubSub/broker unless its namespaces are separately qualified.

- [ ] **Step 2: Project executor status without self-adjudicating**

Update only current README, LEDGER and Package-B result record to state:

```text
BT-5N EXECUTION = COMPLETE
BT-5N EXECUTOR VERDICT = <actual allowed verdict>
ARCHITECTURE-LEAD / PACKAGE-B CLOSURE ADJUDICATION = PENDING
Package B = IN PROGRESS / NOT CLOSED
Package C = DEFER SAFELY / NOT EXECUTED
Product implementation = BLOCKED
C-018 = NOT RATIFIED
```

Do not mark `CX-RUNTIME-ISOLATION-01` qualified or close Package B yourself.

- [ ] **Step 3: Run complete Package-B verification**

```bash
cd spikes/conexus-3l-b
npm run verify
```

Expected: exit `0`, with all BT-1, BT-2, BT-3, BT-3N, BT-4N and BT-5N tests represented honestly.

- [ ] **Step 4: Run full repository verification**

```bash
cd ../..
npm run verify
```

Expected: exit `0`.

- [ ] **Step 5: Commit executor Evidence**

```bash
git add \
  spikes/conexus-3l-b/evidence/bt5n.json \
  docs/conexus/current/README.md \
  docs/conexus/phase3/LEDGER.md \
  docs/conexus/phase3/3L-B-technology-qualification.md

git commit -m "docs(conexus): record BT-5N executor evidence"
```

- [ ] **Step 6: Push, wait for fresh CI and STOP**

Require fresh `SUCCESS` on the final HEAD for:

```text
Conexus 3L Package B
Documentation
```

Also confirm the existing Package-A workflows do not regress when triggered.

Do not execute Package C, Package D, Package E, 3M, C-018, Product implementation, PR readiness or merge.

Return exactly:

```text
final HEAD:
PR state:
Package-B lock SHA-256:
Mastra skill loaded:
Context7 library:
exact source files + SHA-256:
router RED evidence:
router GREEN evidence:
instance-local source findings:
enabled process-global findings:
deferred process-global findings:
role Mastra objects distinct:
role store schemas:
role PubSub objects distinct:
shared-PubSub RED control:
registry isolation:
persistent store isolation:
workflow/PubSub isolation:
attached Agent execution:
module-default/global canary:
Builder executions:
PAR executions:
local model fixture calls:
provider calls:
E2B calls:
real external effects:
BT-5N verdict:
Package-B npm run verify:
root npm run verify:
fresh CI:
Findings:
Package C = DEFER SAFELY / NOT EXECUTED
Package D = NOT EXECUTED
Package E = NOT EXECUTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
merge = NOT PERFORMED
```

Then STOP and return Evidence to Architecture Lead.

---

## Self-Review Checklist

Before handing executor completion back, verify:

```text
BT-4N lead adjudication is projected across every current router
router test proved RED against the stale Architecture Baseline/Reconciliation
router test is GREEN after projection
Mastra skill was loaded
Context7 was used only as current external documentation
exact installed source controls version-specific claims
Package-B lock did not change
BuilderMastra and ParMastra are different objects
stores use separate schemas
PubSubs are different objects
shared-PubSub negative control demonstrably fires
opposite Agent/tool/workflow/memory/schedule resolution fails
role-local persistent records do not alias
actual explicit-PubSub runtime path stays role-local
standalone/ephemeral fallback is not required
only enabled F1 module-global facilities are challenged
scorer/eval, DurableAgent and OM globals remain disabled/requalification-gated
no Product code or Product owner fixture was implemented
no process split/bus/queue/outbox was created
provider/model API calls, E2B calls and real effects are zero
BT-5N result is one allowed verdict
Package B remains open pending lead adjudication
fresh Package-B and Documentation CI succeeded
```