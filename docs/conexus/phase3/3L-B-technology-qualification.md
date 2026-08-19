# 3L Package B — Proportional Technology Probe Result

**Status:** `BT-4N PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS / BT-5N EXECUTION COMPLETE / EXECUTOR VERDICT NOT_PROVEN / ARCHITECTURE-LEAD PACKAGE-B CLOSURE ADJUDICATION PENDING`

**Execution authority:** [3L-R1 framework-native proportional qualification rebaseline](3L-R1-framework-native-proportional-qualification-rebaseline.md), preserving the historical [3L-B proof-routing amendment](3L-B-proof-routing-amendment.md) as Evidence

**Exact lock:** `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`; SHA-256 `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`

**PostgreSQL probe identity:** `17.10 (Debian 17.10-1.pgdg12+1)`

This record preserves the earlier BT-1..BT-3 evidence, the lead-adjudicated BT-3N PASS, and the lead-adjudicated BT-4N PASS under 3L-R1. BT-5N executor evidence is recorded below; this is not Package-B closure, architecture redesign, C-018, Product implementation, Package-C authorization or merge authorization.

## BT-1 — Direct Agent authority closure

- **Question:** can the governed path execute an exact code-defined Agent instance without a mutable selector or Editor override?
- **Exact identity:** `@mastra/core 1.56.0`; `node_modules/@mastra/core/dist/agent-3cYAz4qr.js`; SHA-256 `871818d21f0ceaadeac9848f72687ccbc0133acec10d2b4b5dbf2cb56b64932d`.
- **Negative control:** a deliberately mutable selector selected `newMutable`, proving substitution was detectable.
- **Observed result:** the direct governed object remained `oldExact`; only its deterministic local fixture ran; `newMutable` call count was zero; runtime editor config was `false`.
- **Known / limitation:** this qualifies the exact direct-instance/editor-closure substrate only; it does not implement or prove Product owners.
- **Verdict:** `PASS`.

## BT-2 — Conversation / memory substrate isolation

- **Question:** can the exact memory/PostgreSQL substrate support explicit thread/resource isolation?
- **Exact identity:** `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL `17.10`; memory source `node_modules/@mastra/memory/dist/src-BgdYYHLc.js`; SHA-256 `6305ab80d0e88b28da948b8395da3ded79b73a54cf5239d765c5041d86820c38`.
- **Negative control:** an intentionally insufficient shared thread/resource key produced observable cross-conversation aliasing.
- **Observed result:** distinct explicit identities isolated history, incompatible resource ownership was refused, and thread-scoped recall differed from resource-wide enumeration.
- **Known / limitation:** Semantic Recall, Observational Memory, working memory, title generation and other advanced memory were disabled; this proves substrate capability, not a future Conexus key encoder.
- **Verdict:** `PASS`.

## BT-3 — Suspend / process loss / fresh RequestContext

- **Question:** after durable direct-Agent suspension and real process loss, does a supplied fresh RequestContext replace authority-shaped stale context on resume?
- **Exact identity:** `@mastra/core 1.56.0`; `node_modules/@mastra/core/dist/agent-3cYAz4qr.js`; SHA-256 `871818d21f0ceaadeac9848f72687ccbc0133acec10d2b4b5dbf2cb56b64932d`; PostgreSQL `17.10`.
- **Negative/falsification fixture:** the suspend process persisted `currentRole=OLD` plus poison key `unknownStaleKey=MUST_DISAPPEAR`; it exited before a fresh Node process rediscovered and resumed the run with only `currentRole=NEW` supplied.
- **Observed result:** genuine tool suspension, durable rediscovery and fresh-process resume all worked. The resumed tool observed `currentRole=NEW`, but it also observed the restored poison key `unknownStaleKey=MUST_DISAPPEAR`.
- **Pinned-source explanation:** the resume implementation starts from the supplied RequestContext and backfills every snapshot key that is absent. The runtime observation therefore matches the exact pinned source rather than a harness artifact.
- **Known / Unknown / limitation:** suspended continuation is durable; replace-whole fresh-context authority is not realized. Plain active-Agent crash characterization is `NOT_EXECUTED_AFTER_LOAD_BEARING_FAILURE`.
- **Verdict:** `FAIL_REALIZATION`.
- **Architecture consequence:** mandatory STOP for Architecture-Lead adjudication. No compensating wrapper or owner was invented in the spike.

## BT-4 — Schedule intended-slot / redelivery substrate

- **Execution:** `NOT EXECUTED — STOP AFTER BT-3`.
- **Verdict:** `NOT EXECUTED`.
- **Known / limitation:** no BT-4 negative control or runtime claim was produced after the load-bearing stop.

## BT-5 — Same-process Builder ↔ PAR isolation

- **Execution:** `NOT EXECUTED — STOP AFTER BT-3`.
- **Verdict:** `NOT EXECUTED`.
- **Known / limitation:** no same-process qualification claim is permitted; the existing source-map unknown remains unresolved.

## BT-3N — Native HITL / restart / current-owner authority boundary

- **Question:** can the exact direct Agent use static native `requireApproval`, survive real process loss, be rediscovered from PostgreSQL by a fresh process, and still make the current external owner authoritative at the tool/effect boundary?
- **Exact identity:** `@mastra/core 1.56.0`; `node_modules/@mastra/core/dist/agent-3cYAz4qr.js`, SHA-256 `871818d21f0ceaadeac9848f72687ccbc0133acec10d2b4b5dbf2cb56b64932d`; `node_modules/@mastra/core/dist/agent/agent.d.ts`, SHA-256 `a077b5bb90c9591c49f052684ffc5de19f39f20c7020a5299fd3cbc9aa141cf8`; PostgreSQL `17.10`.
- **Native suspension and restart:** static `requireApproval: true` suspended before tool execution. Process A exited; process B discovered the exact suspended run through persistent storage and used the public Agent approval/decline APIs.
- **Revoked-owner scenario:** the raw resumed `RequestContext` still exposed stale `staleBusinessAuthority=ALLOW`; process B mechanically approved; the tool boundary re-read current external owner truth as `DENY`; synthetic effect count was `0`. The stale raw value was observable but was not used as authority.
- **Allowed-owner scenario:** the current external owner returned `ALLOW`; tool-boundary execution count was `1`; synthetic effect count was exactly `1`.
- **Decline scenario:** native decline executed neither the tool boundary nor the effect; both counts were `0`.
- **External activity:** provider/model API calls `0`; E2B calls `0`; real external effects `0`. The harness used only a deterministic local model object and a current-owner fixture at the tool/effect boundary.
- **Known / limitation:** this proves framework-native boundary feasibility. It does not prove Product PAR/Gateway implementation conformance or fully qualify `CX-AGENT-MASTRA-01`; the Architecture Lead accepted only the bounded BT-3N slice.
- **Executor verdict:** `PASS_NATIVE_HITL_OWNER_BOUNDARY`.

## BT-4N — Native Scheduler → PAR narrow dispatch seam

- **Question:** can the exact pinned scheduler expose one stable logical scheduled occurrence through a deterministic non-Agent seam before Product execution while leaving PAR as the only future AgentRun admission authority?
- **Exact identity:** `@mastra/core 1.56.0`; `@mastra/pg 1.19.0`; PostgreSQL `17.10`; exact deciding files and SHA-256 values are recorded in `spikes/conexus-3l-b/evidence/bt4n-source.json`.
- **Native target:** public workflow schedule creation and public `Scheduler.tick()` reached one deterministic workflow step. No `Agent`, model, business tool, Gateway or Product owner state was constructed.
- **Stable occurrence:** the pinned scheduler derived `runId = sched_<scheduleId>_<scheduledFireAt>` before publish. The fixture normalized the actual `scheduleId = schedule_bt4n-native-slot` and `scheduledFireAt = 1767225600000` into logical occurrence `schedule_bt4n-native-slot:1767225600000`.
- **Concurrent ticks:** a test-only barrier forced two native scheduler instances to read the same due PostgreSQL row before either CAS. Exact `SchedulesPG` CAS admitted one winner, one trigger row and one synthetic PAR ingress.
- **Duplicate/redelivery:** public `EventEmitterPubSub` `nack()` redelivered the same native `workflow.start` event with `deliveryAttempt` values `1` then `2`; the exact logical run material remained unchanged and produced one stable logical occurrence identity.
- **External activity:** Product Agent executions `0`; model calls `0`; business tool calls `0`; provider calls `0`; E2B calls `0`; real external effects `0`.
- **Known / limitation:** the stable occurrence adapter is bound to the exact qualified Mastra scheduler/run-id contract → fail closed on malformed material → requalify on behavior/version change. The workflow ingress derives the stable schedule/slot pair from the exact pinned public run-id format. It creates no Conexus scheduler, ScheduleOccurrence durable record, queue, outbox or automation domain.
- **Executor verdict:** `PASS_NATIVE_SCHEDULE_INGRESS`.

## BT-5N — Same-process Builder ↔ PAR role-instance isolation

- **Execution:** complete as executor evidence; the required PostgreSQL-backed positive runtime was not proven locally.
- **Exact lock:** SHA-256 `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`; PostgreSQL probe pin `17.10`; direct pins remain `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, and `@mastra/pg 1.19.0`.
- **RED wiring guard:** fired for all four mutable role identities: `pubsub`, `store`, `agent`, and `memory`.
- **Shared-PubSub negative control:** fired; the Builder-tagged event was delivered once to the Builder observer and once to the PAR observer, demonstrating cross-role bleed under an intentionally shared PubSub identity.
- **Worker path limitation:** the required PostgreSQL-backed positive test includes the public `OrchestrationWorker`/workflow/PubSub path, but that worker path was not reached locally; no focused one-instance worker success is claimed.
- **Required positive runtime limitation:** `TEST_DATABASE_URL` was unset, and no PostgreSQL listener or `postgres`, `psql`, or `pg_isready` executable was available locally. Therefore positive role-instance/store-schema/schedule/workflow/attached-Agent/AgentThreadStreamRuntime canary isolation was not reached.
- **Observed positive values:** role-instance distinctness, Builder/PAR store schemas, PubSub distinctness, registry isolation, persistent-store isolation, workflow/PubSub isolation, attached-Agent execution and the module-default/global canary are all `NOT_PROVEN`; none is represented as `PASS`.
- **Process-global scope:** enabled F1 `AgentThreadStreamRuntime` remains fenced by explicit role PubSub identity. Scorer/evaluation hooks, DurableAgent global run state/cache/stream machinery, and Observational Memory active-operation/static buffering registries remain disabled and deferred.
- **External activity:** Builder executions `0`, PAR executions `0`, local model fixture calls `0`, provider calls `0`, E2B calls `0`, and real external effects `0` in the required positive path.
- **Executor verdict:** `NOT_PROVEN`.
- **Requalification triggers:** enabling any deferred process-global surface, reaching the module-default PubSub fallback, or switching to a shared external PubSub/broker requires fresh qualification; a shared broker additionally requires distinct per-role namespaces/key prefixes.

## Candidate package result returned for adjudication

```text
BT-1 = PASS
BT-2 = PASS
BT-3 = FAIL_REALIZATION
BT-4 = NOT EXECUTED — STOP AFTER BT-3
BT-5 = NOT EXECUTED — STOP AFTER BT-3
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
BT-5N EXECUTION = COMPLETE
BT-5N EXECUTOR VERDICT = NOT_PROVEN
ARCHITECTURE-LEAD / PACKAGE-B CLOSURE ADJUDICATION = PENDING

CX-AGENT-MASTRA-01 = PARTIALLY QUALIFIED / PACKAGE B NOT CLOSED
CX-RUNTIME-ISOLATION-01 = NOT_PROVEN / BT-5N positive runtime not reached
Package B = IN PROGRESS / NOT CLOSED
Package C = DEFER SAFELY / NOT EXECUTED
Product implementation = BLOCKED
C-018 = NOT RATIFIED
```

External provider/model calls, E2B calls and real external effects were zero. BT-4N constructed no model or Agent. No dependency, Product module, Package-C work, C-018 action or merge was introduced.
