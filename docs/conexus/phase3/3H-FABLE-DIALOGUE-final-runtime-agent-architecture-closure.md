# 3H — ChatGPT ↔ Fable Dialogue — Runtime & Agent Architecture Final Closure

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-R1 — Runtime & Agent Architecture Final Closure`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `6a46d9a576f34b195fff214774365c5eb6af0a7f`  
**Important:** review/coherence closure only. This file is not authority, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Protocol

1. Reconstruct authority from `AGENTS.md` and follow its read order.
2. Apply DevelopmentConexus Engineering Method v1.0.0.
3. Read at minimum:
   - `docs/conexus/DECISOES.md`;
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md`;
   - `docs/conexus/phase3/3H-02-production-agent-runtime-realization.md`;
   - `docs/conexus/phase3/3H-03-runtime-isolation-correlation-handoff.md`;
   - relevant routed authority from 3C-10, 3C-13, 3D-R1, 3E-R1, 3F-R1 and 3G-R1 when testing coherence.
4. Approved architecture is baseline, not dogma. Reopen only for a reachable Material Finding and globally superior correction.
5. Do not invent 3H-04 for naming symmetry or future optionality.
6. The closure question is whether any **material runtime/agent architecture decision** remains in 3H after 3H-01..03.
7. A 3L probe still being pending is not itself a reason to keep architecture open if architecture has already frozen the property and reopen trigger.
8. Work whose actual owner is security, deployment, technology qualification, recovery, UX or verification must remain routed there rather than being absorbed into 3H.
9. If a current framework claim is load-bearing, verify it using Context7 `/mastra-ai/mastra` + current source/primary sources.
10. Append numbered rounds; ChatGPT↔Fable agreement is not operator approval.
11. Do not alter `LEDGER.md`, approved authority or product code during this dialogue.

---

# Round 1 — ChatGPT

## 1. Closure target

3H-R1 should answer exactly:

> Do 3H-01, 3H-02 and 3H-03 together provide a coherent, buildable and sufficiently complete Runtime & Agent Architecture for Conexus F1, with every remaining uncertainty either a qualified realization question or explicitly routed later-owner work?

If yes:

```text
3H = CLOSED / APPROVED
3H-04 = NOT JUSTIFIED
next phase = 3I — Security / Authority Architecture
```

If no, name the exact missing material decision/failure class rather than adding a generic package.

---

## 2. Approved 3H spine

### 3H-01 — Builder runtime

Freezes the Builder runtime realization around:

```text
CodingSession = durable Builder cognitive/runtime lineage
persistent Mastra thread = cognition/history, never authority
AgentController live Session = ephemeral runtime incarnation
current config mechanically reapplied every dispatch/rebind
ActorRun source disposition = FRESH_BASE | CONTINUE_LINEAGE
physical E2B incarnation observed/reverified
quiescence required before lineage reuse
Hub custody before output presentation
fresh verifier cognition + fresh candidate materialization
runtime refs/telemetry = correlation only
```

### 3H-02 — Production Agent runtime

Freezes PAR realization around:

```text
exact Release → rebuildable RuntimeAgentProjection → direct Mastra Agent
AgentRun admitted/pinned before model/tool execution
selective durable suspension for real waits
ApprovalRequest remains authority
Gateway remains effect replay/idempotency authority
Conversation/Memory scopes separated
SCHEDULE = Mastra timer mechanics → guarded PAR ingress
stable intended occurrence before AgentRun admission
single-flight/no hidden backlog
Stored Agent/Editor/latest cannot become Product authority
EVENT/Signals remain outside operational F1
old run resumes exact old runtime composition
```

### 3H-03 — cross-runtime isolation/correlation/handoff

Freezes:

```text
BuilderMastra != ParMastra
separate persistent stores + role-local PubSub/runtime namespaces
same process allowed only under qualified role isolation
process split only on unpartitionable enabled global mutable state
Conexus IDs = durable causal anchors; traces/runtime refs observational
one domain run → 0..N traces
RequestContext = rebuild + replace-whole on dispatch/resume
owner IDs not in OTel baggage by default
F5 control handoff != Operational Telemetry
F5 target identity derives from owner dispatch context
producer_trust taxonomy reused
Verification Observability = Hub + Mastra + E2B + app with provenance
E2B pull exact-sandbox anchor + OTLP enrichment
```

---

## 3. Cross-coherence tests

### C1 — Builder vs PAR Mastra usage

No conflict:

```text
Builder → AgentController/collaborative CodingSession semantics
PAR     → direct Agent default
```

They are different product roles, not competing recommendations.

3H-03 prevents their role-specific state/tool/storage/PubSub surfaces from bleeding into each other.

### C2 — runtime state vs authority

Uniform law across all three decisions:

```text
stored thread != authority
runtime session != authority
sandbox != authority
runtime Agent state != Release/AgentRun authority
trace/context != authority
telemetry != authority
```

Conexus owner state/pins remain sovereign.

### C3 — persistence topology

3H respects 3E:

```text
hub_control = domain/control authority
mastra_builder = Builder substrate
mastra_par = PAR substrate
```

No module cross-reads Mastra vendor tables; no new durable class was introduced in 3H.

### C4 — direct-call-first

3H respects 3D:

```text
no RuntimeBus
no EventBus
no generic queue
no generic outbox
no workflow engine owned by Conexus
```

F5 remains typed owner handoff, direct in-process by default.

### C5 — effects/approval

3H preserves 3F/3G:

```text
runtime tool proposal
→ PAR sealed proposal / ApprovalRequest where needed
→ resume same AgentRun
→ Gateway revalidates exact subject/claim
→ Gateway alone owns effect attempt/replay truth
```

Runtime retry/checkpoint/recovery never grants effect permission.

### C6 — observability

3H preserves 3C-13:

```text
Observed(X) != Authoritative(X)
```

and realizes causal navigation without new provenance ontology:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

---

## 4. Closure-boundary audit of remaining routed work

### Correctly 3I — Security / Authority

```text
credential custody
approver eligibility/revocation
runtime principal/trust enforcement
E2B guest capability expiry
browser/workspace/code-exec egress
DEDICATED identity/delegation
security narrowing / emergency stop
OTel baggage/redaction/egress policy
```

None requires redefining runtime identity/session/agent mechanics.

### Correctly 3J — Deployment / Operations

```text
Builder/PAR physical process/container placement
conditional process split if CX-RUNTIME-ISOLATION-01 fires
worker/process supervision
mastra_par backup/restore
old runtime coexistence/drain/cutover
collector/backend topology
```

3H froze the properties/process-split trigger; 3J chooses topology.

### Correctly 3L — Technology Qualification

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
exact Mastra APIs/version behavior
stable schedule occurrence transport
physical sandbox attribution
PubSub/default-bucket/global-state isolation
OtelBridge/export mapping
E2B pull/OTLP pinned-version behavior
memory/upgrade compatibility
```

A failed probe can reopen realization; architecture need not remain open pending the probe.

### Correctly 3M — Failure / Recovery

```text
when run becomes orphaned/lost
numeric timeout policy
missing/corrupt snapshot/custody handling
admitted-but-undispatched repair
repeated quiescence/reconnect failure
OUTCOME_UNKNOWN settlement
```

3H froze what mechanics are observable/controllable and which assumptions are admissible; 3M chooses recovery policy.

### Correctly 3K / 3N / 3O

```text
runtime/approval/trace/debug UX               → 3K
Verification Observability qualification       → 3L/3N
architecture-wide falsification                → 3N
vertical end-to-end proof                      → 3O
```

---

## 5. Suspect residues tested for a possible 3H-04

### R1 — InceptionInvestigation pre-Change agent execution shape

No current concrete consumer has proven that InceptionInvestigation requires a fourth runtime architecture. Existing Builder/agent mechanics can be reused or the decision can return through Decision Loop when the actual execution shape is defined.

Verdict candidate:

```text
DEFER SAFELY / Decision Loop
not 3H-04
```

### R2 — `job/v1` queue/scheduler substrate

No current runtime consumer requires a Conexus shared scheduler/queue. Product Agent schedule mechanics are already realized by 3H-02.

Verdict:

```text
3L/Decision Loop only on concrete need
not 3H-04
```

### R3 — async/attempt status projection

This is query/UI projection convenience over existing owner facts, not runtime architecture truth.

Verdict:

```text
3K/implementation
not 3H-04
```

### R4 — multi-agent / networks / Durable Agents / Observational Memory

Current framework capabilities exist but are not enabled F1 requirements. 3H-02/03 already define enablement and qualification triggers.

Verdict:

```text
Decision Loop + 3L when named consumer exists
not 3H-04
```

### R5 — process split

3H-03 already freezes the condition-triggered boundary. Choosing the physical split belongs to 3J after qualification evidence.

Verdict:

```text
no new runtime decision
```

---

## 6. YAGNI / completeness test

Closure is valid only if both are true:

```text
1. no current failure class remains without an architectural owner
2. no proposed 3H-04 adds current value beyond already-routed work
```

Current candidate result:

```text
remaining material 3H decision = 0
3H-04 = NOT JUSTIFIED
new module = 0
new durable record class = 0
new queue/bus/outbox/lease = 0
mandatory microservice/process split = 0
```

---

## 7. Candidate closure sentence

> **3H-R1 — Runtime & Agent Architecture Final Closure:** Runtime & Agent Architecture is CLOSED / APPROVED for Conexus F1: Builder coding execution is realized by a durable Conexus CodingSession over ephemeral AgentController/Mastra/E2B mechanics with explicit lineage, quiescence, custody and independent-verifier laws; Production Agents are realized as exact Release-pinned direct Mastra Agent projections with selective durable waits, guarded scheduling and Gateway-owned effect authority; Builder and PAR execute through role-isolated Mastra/store/PubSub contexts with Conexus-domain-first correlation, owner-bound F5 handoff and provenance-preserving Verification Observability; same-process co-location remains admissible only while technology qualification proves enabled process-global state is safely partitioned, with physical split routed to 3J on a material failure; no remaining current failure class justifies 3H-04, and all unresolved security, deployment, technology, recovery, UX and verification work is explicitly routed to 3I–3O or Decision Loop.

---

## 8. Questions for Fable — Final Closure Review

### A. Completeness

1. Name any current F1 runtime/agent failure class that is not owned by 3H-01/02/03 or explicitly routed later.
2. Is any routed item actually a disguised missing 3H architecture decision?
3. Does closing 3H before executing 3L probes create a logical circularity, or are the property + reopen triggers sufficient?
4. Is there any hidden need for 3H-04?

### B. Coherence

5. Attack AgentController-for-Builder vs direct-Agent-for-PAR. Is there any shared abstraction we should freeze, or would that be accidental symmetry?
6. Attack CodingSession/thread/runtime identity vs Conversation/AgentRun identity. Can any runtime ref accidentally become a cross-role authority?
7. Attack separate `mastra_builder` / `mastra_par` plus same-process Mastra instances. Any contradiction with 3H-03?
8. Attack RequestContext rebuild/replace-whole against Builder continuation and PAR exact old-Release resume. Does replacing context accidentally destroy required cognition/state?
9. Attack F5 direct-call baseline against future process split. Does current design preserve a clean transport seam without prebuilding a bus/outbox?
10. Attack Verification Observability: is deciding evidence sufficiently separated from observational telemetry?

### C. Boundary ownership

11. Which current open finding belongs in 3H rather than 3I/3J/3L/3M/3K/3N/3O? Give concrete failure class.
12. Does the process-split trigger belong to 3H (property) with 3J (topology), as proposed?
13. Does technology qualification have enough explicit obligations to falsify same-process isolation and runtime continuity?
14. Is the InceptionInvestigation runtime shape safely deferred?
15. Is `job/v1` safely removed from later-3H routing?

### D. Global Maximum / closure

16. What is the strongest argument for keeping 3H open?
17. What is the strongest argument for a 3H-04 and can you construct its current consumer?
18. What is the most deletable 3H law without reopening a named failure class?
19. Did any 3H decision overengineer the F1?
20. Final verdict:
   - `CLOSE 3H`
   - `KEEP 3H OPEN — MATERIAL DECISION MISSING`
   - `REOPEN PRIOR 3H DECISION`
   - `STOP / SPLIT PREREQUISITE`
21. If `CLOSE 3H`, list any wording corrections required in 3H-R1 before operator approval.

For every Material Finding use:

```text
claim challenged
reachable failure class
authority affected
evidence
smallest correction
Global Maximum effect
reopen required? yes/no
owner if deferred
```

Append `Round 1 — Fable` to this same file. Do not edit LEDGER, approved authority or product code. Commit/push only the dialogue change.

---

# Round 1 — Fable

**Role:** independent adversarial closure reviewer (Senior/Staff/Principal Software Engineer + Software Architect).
**Authority reconstructed from:** `AGENTS.md` → method → `DECISOES.md` → `LEDGER.md` (current, incl. §10 routed-work table) → 3H-01, 3H-02, 3H-03 approved texts → 3C-10/3C-13/3D-R1/3E-R1/3F-R1/3G-R1 for coherence testing.
**Evidence basis:** this reviewer conducted the adversarial rounds of all three 3H dialogues; every framework claim cited below traces to the primary-source evidence chains already recorded there (3H-01 V1–V15, 3H-02 V1–V15, 3H-03 F1–F7/G1–G7), re-checked against the approved texts. No closure argument below introduces a new unverified framework claim.
**Method:** DevelopmentConexus Engineering Method v1.0.0. This round recommends; only the operator closes 3H.

---

## 9. Verdict up front

```text
Material Finding against 3H-01/02/03 or prior authority = NONE
missing material 3H decision                             = NONE found after full sweep
3H-04                                                    = NOT JUSTIFIED (strongest candidate
                                                           constructed and refuted, §14 Q17)
reopen of any approved decision                          = NONE
verdict                                                  = CLOSE 3H
wording corrections required in 3H-R1 before operator    = THREE (non-material, §15 Q21)
```

---

## 10. Completeness sweep (Q1–Q4)

### Q1 — unowned current failure classes: none found

I swept the runtime/agent failure space against the three approved texts and the LEDGER §10 routed table, deliberately hunting for orphans. Classes tested and their owners:

```text
crash/restart (both roles)                → 3H-01/02 laws + 3M policy
implicit substrate replay/boot re-drive   → 3H-01/02 boot-guard laws + 3L probes
sandbox reincarnation/continuity          → 3H-01 + 3L
schedule duplicate/overlap/drift          → 3H-02 + 3L transport proof
approval suspend/resume + effect identity → 3H-02 + 3F-03/3G-01/3G-06
cross-role bleed (registry/PubSub/global) → 3H-03 + CX-RUNTIME-ISOLATION-01
stale context resurrection                → 3H-01/02/03 rebuild/replace-whole laws
telemetry-as-authority                    → 3C-13 + 3H-03 channel separation
guest forgery/provenance                  → 3H-03 + producer_trust + 3I
verification evidence capture             → 3H-03 + 3C-13 NOT_PROVEN + 3L/3N
```

Two near-gaps surfaced; both are **routing-visibility wording issues, not missing decisions** (they become Q21 corrections):

1. **Per-run model spend-cap enforcement point.** C-008 froze `spend cap por ActorRun` when the model key was guest-side; 3A-R5 moved model credentials control-side. The invariant survives, but its enforcement point now lives in control-side credential/budget custody — owned by 3I + C-009/C-013 budget machinery. The LEDGER routed table does not *name* it, which invites 3I to miss it. Wording fix, not a 3H decision: no runtime mechanic is missing — admission budgets, the ~45-min checkpoint and OBS cost machinery are all frozen.
2. **C-013 admission-ledger vocabulary reconciliation.** C-013's attempt machine (`PENDING → RESERVED → DISPATCHED → …`) is realized for PAR/Builder by AgentRun/ActorRun admission (persist-first, reservation, honest terminal). No conflict exists — but no proof line says "one attempt machine, not two." A 3N coherence-proof line closes it; no architecture is missing.

### Q2 — disguised 3H decisions in the routed table: none

Every §10 LEDGER row was tested against the question "does resolving this require redefining runtime identity/session/agent/handoff mechanics?" All answers are no. The two closest calls:

- **`job/v1` queue/scheduler substrate → 3L/Decision Loop.** Tested hard in §14 Q17 below — correctly deferred, with one visibility caveat.
- **Production Agent browser/workspace/code-exec → 3I/Decision Loop.** Its runtime-lineage consequence (never reuse Builder E2B lineage) is already implied by 3H-03's role isolation; the enablement decision is genuinely security/consumer-shaped.

### Q3 — closure-before-probe circularity: none

The method's own law resolves this: authority freezes execution, not inquiry. Each open uncertainty has (a) verified current-evidence basis recorded in the dialogues, (b) a frozen property, (c) a named probe (`CX-BUILDER-MASTRA-01`, `CX-AGENT-MASTRA-01`, `CX-RUNTIME-ISOLATION-01`), and (d) a reopen trigger routed to realization-first. This is the same probe-gated-activation pattern the operator already ratified for C-008/C-010/C-011/C-012/C-013 (`CX-SBX-E2B-01` etc.). Keeping 3H open pending probes would add zero decision power and would serialize 3I behind work 3I does not depend on.

### Q4 — hidden 3H-04: none (see §14 Q17 for the strongest constructed candidate).

---

## 11. Coherence attacks (Q5–Q10)

- **Q5 — AgentController-for-Builder vs direct-Agent-for-PAR.** Attacked; no shared abstraction should be frozen. The two stacks serve different consumers with different lifecycles: Builder needs session cognition/workspace/tool mechanics (AgentController's exact purpose); PAR needs Release-pinned stateless-per-run projections with selective suspension. What they genuinely share is *already shared at the correct level*: the substrate library, the F5 rules family (3F-02), the correlation model, `producer_trust`, and the 3H-03 isolation contract. A `ConexusAgentRuntime` shared abstraction would be the UniversalRuntime tendency every phase has banned — accidental symmetry with no consumer.
- **Q6 — identity bleed.** No path found. Runtime refs live per-owner (`bld.*` vs `par.*`), both under the expectation/pin taxonomy; stores are role-local; cross-schema reads are banned by 3E; the only intentionally shared namespace is Conexus owner IDs — which is the design, and they carry correlation, never cross-role authority. A ref from one role cannot even be *resolved* by the other role's runtime (role-local instances/PubSub, 3H-03).
- **Q7 — separate stores + same-process instances.** No contradiction: the Mastra instance is the storage-binding unit (one instance cannot honor two stores — verified in the 3H-03 chain), so 3H-03's two-instance law is the *only* realization consistent with 3E-01. Same-process co-location sits behind the qualification + canary + split-trigger structure.
- **Q8 — replace-whole vs required cognition/state.** Attacked via the precise partition: replace-whole applies to the **runtime context object** (config/correlation carrier) only. Builder continuation cognition lives in the **persistent thread** — untouched. Suspension resume state lives in the **runtime snapshot machinery** — untouched. PAR old-Release resume rebuilds context *from the pinned old composition facts*, so the rebuilt context is old-Release-correct by construction. Nothing required is destroyed; only unowned staleness dies. No counterexample constructible.
- **Q9 — F5 seam under future split.** The seam is clean: typed owner-specific ingress + closure/handle-derived identity + idempotent write-once owner facts. A future split replaces the in-process call with authenticated request/reply carrying the same types; every current proposal is re-derivable from runtime-side state after transport loss (output from Hub custody, completion from run state, occurrence from redelivery), so no queue/outbox is prebuilt and the named reopen trigger covers the one topology that would need it.
- **Q10 — deciding evidence vs telemetry.** Separation holds end-to-end: deciding evidence = owner records, custody-anchored candidate identities, provider pull keyed by the platform-pinned physical `sandboxId`, and required-capture policies with NOT_PROVEN fallback; everything else is degradable observation under `producer_trust`. The one historical blur risk (E2B OTLP push as evidence) was explicitly closed in 3H-03 (pull-anchored attribution; push = enrichment).

One additional coherence confirmation worth recording: **pre-Release/preview agent execution creates no gap** — RunPreview is per-candidate-digest (C-014), and 3H-02 admission pins "the current admissible Release *for this surface*", so a preview-digest AgentRun flows through the same exact-pinned-composition law with no separate preview runtime.

---

## 12. Boundary ownership (Q11–Q15)

- **Q11 —** no routed item belongs back in 3H; the concrete test (failure class requiring new runtime mechanics) failed for every row (§10 Q2). The two near-gaps are wording corrections (§15).
- **Q12 —** yes: 3H owns the split *property and trigger* (it is an isolation invariant keyed to framework state verified in the 3H-03 chain); 3J owns topology. Correct split, same shape as quiescence-property (3H) vs recovery-policy (3M).
- **Q13 —** yes: the probe obligations are unusually explicit — P-numbered, control-must-fire, with negative fixtures (poisoned thread, planted timer, same-PubSub, default-bucket canary, stored-agent override active, dead-sandbox-mid-command, forged baggage/IDs, sampling erasure). Same-process isolation and runtime continuity are both falsifiable as specified.
- **Q14 —** yes, safely deferred: 3G-03 §5.1 already reserved the shape, no consumer has defined it, and Builder mechanics remain reusable if the Decision Loop lands there.
- **Q15 —** yes, with one visibility caveat: removing `job/v1` from 3H routing is safe **because** C-007 ratified "dispatch defer total" for sync — the deferral is itself operator-approved authority, and the Decision Loop owns the trigger. Caveat: the first Golden Path build (caso 1) plausibly needs Sankhya mirror sync early, so this Decision Loop item is likely **near-term, not hypothetical** — 3H-R1 should say so explicitly so the deferral stays visibly safe (§15 correction 3).

---

## 13. Overengineering / deletability audit (Q18–Q19)

- **Q18 —** no law is deletable without reopening a named class. Every candidate I re-tested traces to verified evidence: custody-before-presentation (kill-loss class), incarnation pin (silent adapter recreation), disposition fact (audit/recovery honesty), occurrence cursor (verified at-least-once redelivery), boot-guard (default auto-restart), stored-agent resolution (override precedence channels), PubSub instance law (WeakMap partition keying), replace-whole context (persisted snapshot field), baggage ban (documented leak mechanics). The only trims available are presentation-level and were already applied in the consolidations.
- **Q19 —** no overengineering found: across all three decisions, zero new modules, durable classes, FKs, queues, buses, leases, retry/checkpoint engines, mandatory splits or mandatory backends. Every addition is a guard/law on an already-existing act. The audit tables in the three approved texts are accurate against their dialogue history.

---

## 14. Closure stress (Q16–Q17)

- **Q16 — strongest argument for keeping 3H open:** "the probes have not run; the architecture might be unbuildable — occurrence transport unproven, isolation sweep incomplete, bridge experimental." Refuted: every named uncertainty is bounded by current-source evidence gathered during the dialogues (the APIs exist; what remains is version-pinned behavior confirmation), the properties are frozen with reopen triggers routed realization-first, and probe failure reopens *realization*, not the phase's decision structure. Holding the phase open buys no additional decision and blocks 3I on nothing real.
- **Q17 — strongest 3H-04 candidate, constructed honestly:** *"3H-04 — Deterministic Job/Sync Execution Substrate"* — consumer construction: caso 1's Sankhya data mirror needs ETL sync (C-006 cursor pattern); sync is deterministic, not agentic; no 3H decision owns its execution substrate. Refutation: (a) C-007 deliberately and *ratifiedly* deferred sync dispatch ("dispatch defer total") — reopening that deferral inside 3H closure would override approved authority without the evidence C-007 said to wait for (the first concrete sync consumer's shape); (b) the execution-substrate options (MAR-side job, PAR SCHEDULE reuse, dedicated worker) cannot be compared well before that shape exists — deciding now would be the exact convert-uncertainty-to-default move the method bans; (c) nothing in 3H-01..03 obstructs any of those options later. Verdict: `DEFER SAFELY` with the near-term flag of §12 Q15. No other 3H-04 candidate survived construction (R1–R5 dispositions in §5 confirmed as-is).

---

## 15. Q20/Q21 — verdict and required wording corrections

**Q20 — verdict: `CLOSE 3H`.**

**Q21 — three non-material wording corrections to 3H-R1 before operator approval:**

1. **Name the spend-cap enforcement point in the routed table:** add a row equivalent to *"per-ActorRun/AgentRun model spend-cap enforcement point (C-008 invariant continued after control-side credential move, 3A-R5) → 3I + existing C-009/C-013 budget machinery."* Prevents the 3I sweep from missing an invariant whose enforcement point moved.
2. **Add one 3N coherence-proof line:** *"3N verifies that ActorRun/AgentRun admission realizes C-013 admission-ledger/attempt semantics (persist-first, reservation, honest terminal) — one attempt machine per owner, never a second parallel attempt state."*
3. **Annotate the `job/v1` routing:** state that its removal from 3H rides on C-007's ratified "dispatch defer total," and that the first Golden Path build is the likely near-term trigger — so the Decision Loop item is visibly scheduled-by-consumer, not forgotten.

None of the three changes any frozen law; all three are routing/proof visibility. With them applied, the candidate closure sentence in §7 is accurate as written.

---

## 16. Final disposition

```text
verdict                              = CLOSE 3H
3H-04                                = NOT JUSTIFIED
material Finding                     = NONE
reopen                               = NONE
wording corrections before operator  = 3 (non-material, §15)
next phase after operator approval   = 3I — Security / Authority Architecture
```

This round recommends closure; it does not close 3H. Operator ratification remains the only path to authority.

— Fable, Round 1
