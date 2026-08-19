# 3L Package B — B0 Architecture-Lead Evidence Adjudication

**Status:** `BOUNDED CORRECTION REQUIRED / B1 BLOCKED / NO ARCHITECTURE REOPEN`  
**Reviewed executor HEAD:** `3f7c64e75b4bee86baa89848bd528c719b4129e9`  
**Reviewed B0 evidence-capture HEAD:** `0957361a04c3c0096860245077924ab21491f02a`  
**Ratified Package-B spec:** [3L-B-product-agent-cross-runtime-qualification.md](3L-B-product-agent-cross-runtime-qualification.md)  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Nature:** Architecture-Lead adjudication of B0 Evidence; this document does not change Product/architecture meaning, does not authorize B1, does not constitute C-018 and does not authorize merge.

## 1. Outcome

B0 executor work is structurally useful and stayed inside the admitted scope: the Package-B lock/source map/criterion pack exists, Mastra skill + Context7 prerequisites were recorded, B5 remains not admitted, and no B1–B5 qualification probe or Product implementation was executed.

However B0 is **not yet Lead-adjudicated as complete** because the review found four bounded enforcement/projection defects. None falsifies accepted architecture.

```text
architecture contradiction     = NONE
material Product finding       = NONE
new module/record/database     = 0
B0 executor work               = COMPLETE AS EXECUTION CLAIM
B0 Lead adjudication           = BOUNDED CORRECTION REQUIRED
B1                              = BLOCKED / NOT AUTHORIZED
B5                              = NOT ADMITTED
Product implementation         = BLOCKED
C-018                          = NOT RATIFIED
merge                           = NOT AUTHORIZED
```

## 2. B0-LD-01 — criterion semantic-home routing needs bounded correction

The validator proves presence/form but currently accepts any non-empty `authority` array. Manual authority review found six load-bearing route defects while the protected invariants/mechanisms themselves remain correct.

Required corrections:

```text
B2-07 repeated resume/retry → duplicate physical effect authority
  MUST include 3G-06 — Gateway EffectAttempt / Idempotency / Budget State
  3H-02 and 3G-05 may remain as continuation/runtime context

B2-08 same idempotency identity + different subject
  MUST include 3G-06
  3G-05 is not the replay/idempotency semantic home

B2-09 OUTCOME_UNKNOWN / SENT_NO_RESPONSE never blind resend
  MUST include 3G-06
  3G-05 is not the traffic/outcome/replay semantic home

B3-08 DISABLE × firing commit order
  MUST include 3G-05 — AgentRun / Approval Continuation / Trigger Architecture
  MUST NOT use 3G-06 as the trigger-race semantic home
  3H-02 remains applicable for schedule realization

B3-09 TriggerRevision update × stale fire
  MUST include 3H-02
  MUST NOT use 3G-06
  3G-05 may be retained only as trigger-lifecycle companion authority

B3-12 Product-Agent no-catch-up != MAR one-catch-up
  MUST include 3H-02 + 3A-R9
  replace the current 3H-03 catch-up anchor with 3A-R9, which owns MAR deterministic-sync/catch-up semantics
```

Do not encode the entire Conexus architecture into the validator. Add only narrow required/forbidden authority anchors for these high-risk compiled criteria plus negative fixtures showing the guard fires.

## 3. B0-LD-02 — resolved direct-package identity is not fully enforced

`verify-lock.mjs` currently validates the root dependency declarations and deny/prerelease rules, but it does not independently require:

```text
lock.packages["node_modules/@mastra/core"].version   == 1.56.0
lock.packages["node_modules/@mastra/memory"].version == 1.25.0
lock.packages["node_modules/@mastra/pg"].version     == 1.19.0
```

The accepted Package-A lock workflow already demonstrates this stronger pattern. B0 qualification identity requires the resolved bytes, not only the root declaration.

Required RED→GREEN correction:

1. mutate a resolved `node_modules/<direct package>.version` while leaving the root declaration unchanged;
2. prove current guard fails to reject / new test is RED;
3. minimally strengthen `verifyLock()` to reject the mismatch;
4. prove all three exact resolved direct pins pass on the real lock.

No new dependency is authorized by this correction.

## 4. B0-LD-03 — B0 has no durable CI enforcement yet

Fresh HEAD `3f7c64e...` is green for the existing workflows, but those workflows are Documentation and Package-A workflows. Root `npm run verify` does not execute `spikes/conexus-3l-b/npm run verify`, and no Package-B workflow exists.

Therefore current green CI does not prove that B0 lock/admission guards would fail a future Package-B regression.

Required bounded correction:

Create a deterministic PR workflow, preferably `.github/workflows/conexus-3l-b.yml`, scoped to Package-B spike/spec/adjudication paths. At minimum it MUST:

```text
checkout
setup Node 24.18.0
npm ci --ignore-scripts --audit=false --fund=false in spikes/conexus-3l-b
npm run verify in spikes/conexus-3l-b
```

It MUST NOT use secrets, provider/model calls, E2B, external schedule activation or Product runtime. Future B1–B4 may extend this workflow only under their admitted proof contracts.

The final correction is not accepted until this workflow reports fresh `SUCCESS` on the corrected HEAD.

## 5. B0-LD-04 — executor status advanced past the adjudication boundary

The ratified operating split says Codex executes and records Evidence; Architecture Lead adjudicates it before the next subpackage runs. The current router wording `B0 COMPLETE / B1 NEXT` and the executor record heading `B0 adjudication` prematurely collapse execution completion into Lead adjudication.

During correction, project status MUST read semantically:

```text
Package B = IN PROGRESS
B0 execution = COMPLETE
B0 Lead adjudication = BOUNDED CORRECTION REQUIRED / CORRECTION IN PROGRESS
B1 = BLOCKED / NOT AUTHORIZED / NOT EXECUTED
```

The B0 record should distinguish `executor result` from Lead adjudication and route to this document. Only a later Architecture-Lead PASS may set `B0 ADJUDICATED / B1 NEXT|AUTHORIZED`.

## 6. What the review accepts provisionally

Subject to the four corrections above, the review found no material defect in:

- minimal direct Package-B dependency family (`@mastra/core`, `@mastra/memory`, `@mastra/pg`);
- Context7 official library identity `/mastra-ai/mastra` as current external Evidence;
- recorded Mastra-skill prerequisite;
- exact-source SHA mapping approach;
- explicit UNKNOWNs for plain active-Agent crash behavior, end-to-end schedule redelivery idempotency, and full same-process enabled-global isolation;
- criterion decomposition counts `B1=10 / B2=12 / B3=12 / B4=18`;
- nine observability/deciding-evidence families routed to Package E;
- historical P30 preserved only as the deferred-process-global capability reopen trigger;
- `B5.admitted = false`;
- no Product implementation and no B1–B5 execution.

Unknown remains Unknown; none of these facts qualifies `CX-AGENT-MASTRA-01` or `CX-RUNTIME-ISOLATION-01`.

## 7. Correction proof contract

Correction is accepted only when all are true on one fresh HEAD:

```text
six semantic-home routes corrected
semantic-anchor negative tests fire
resolved-direct-version negative test fires
real Package-B lock passes exact root + resolved pin checks
B0 local npm run verify = PASS
root npm run verify = PASS
Conexus 3L Package B workflow = SUCCESS
routers say Lead correction/adjudication pending until Lead reviews
B1–B5 execution = NONE
provider/model/E2B/external effect = NONE
Product code = NONE
```

After that Evidence returns to the Architecture Lead. Codex MUST stop; it does not self-authorize B1.
