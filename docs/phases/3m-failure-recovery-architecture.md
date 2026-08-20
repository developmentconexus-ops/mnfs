# Phase 3M — Failure & Recovery Architecture

> **Closure/result summary only.** Current mutable phase/status authority lives in [../roadmap.md](../roadmap.md). Detailed current semantics live in the owning references below; this file does not create a second recovery authority.

## Outcome

```text
3M = CLOSED / OPERATOR RATIFIED
Method outcome = CURRENT STRUCTURE CONFIRMED + BOUNDED RECOVERY SEMANTICS
Global Maximum = owner-local recovery + narrow deny-only operational coordination
new Product capability = 0
new semantic owner = 0
new Hub domain module = 0
new durable record class = 0
new database/schema = 0
new cross-owner transaction = 0
new generic retry/recovery engine = 0
new pre-C-018 runtime probe = 0
3L requalification = NO
```

The operator ratified the first-installation recovery refinements after independent Fable review. C-018 remains separately gated and Product implementation remains blocked by the roadmap.

## Current semantic homes

- Builder interruption, physical lineage and post-restore Git reconciliation: [../reference/builder-and-harness.md](../reference/builder-and-harness.md).
- Product Agent restart/suspension/active-run interruption: [../reference/runtime-and-agents.md](../reference/runtime-and-agents.md).
- Managed-sync `JobRun` restart/orphan/cursor settlement: [../reference/managed-execution.md](../reference/managed-execution.md).
- Effect identity, unresolved admission, replay and disaster-restore effect posture: [../reference/integrations-and-gateway.md](../reference/integrations-and-gateway.md).
- Credential/key recovery closure and store boundaries: [../reference/data-and-persistence.md](../reference/data-and-persistence.md).
- Restored sessions/current-authority re-establishment: [../reference/security-and-authority.md](../reference/security-and-authority.md).
- Release/Promotion recovery and first-installation restore/reactivation contract: [../reference/release-deployment-and-operations.md](../reference/release-deployment-and-operations.md).
- Whole-system structural summary and reopen families: [../architecture/index.md](../architecture/index.md).

## Closure invariants

The accepted result preserves these cross-cutting laws without creating a shared lifecycle:

```text
recovery meaning remains owner-local
same-execution continuation requires positive owner-specific basis
cancel / timeout / process death do not imply rollback
runtime retry does not grant effect retry permission
one logical effect intent has one Gateway-owned replay identity
unresolved Gateway truth fences duplicate new admission inside validated scope
normal restart requires positive current-generation continuity
disaster restore != normal restart
missing after restore != never happened
recovery posture is deny-only and cannot grant Product authority
initial disaster recovery denies governed external effects by default
post-cutoff canonical Git is preserved but not auto-promoted
recoverable ciphertext requires separately custodied recoverable decryption means
current MAR recovery remains bounded to the real governed-sync consumer
```

## First-installation refinements ratified in 3M

1. Normal PROD starts only with positive generation-continuity evidence.
2. The mutable PostgreSQL recovery set restores from one internally consistent PostgreSQL generation under the current topology.
3. Restored sessions and potentially stale privileged/autonomous/effectful authority are not treated as current by assumption.
4. Governed external-effect admission is deny-by-default during initial disaster recovery and reopens only through existing owners after acceptable reconciliation.
5. Recoverable ciphertext requires separately custodied recoverable key-generation/recovery means and restore-time decryptability proof.
6. Recovery posture survives process restart, is deny-only, and reactivation remains per-owner rather than a new composite L7 grant.
7. `RTO <= 8h` targets useful safe platform service; an unreconciled effect surface may remain fail-closed rather than fabricate certainty.

## Fable independent review

Round 1 used the isolated review-branch workflow required by Repository Standard v1.0.0. Fable reconstructed repository authority, challenged Global Maximum/YAGNI/Mastra/recovery assumptions, and initially raised eight material findings. Lead adjudication accepted/refined the valid roots; Fable then explicitly conceded the two challenged points:

```text
M-06 proposed MAR→Gateway seam = WITHDRAWN AS YAGNI
M-02 Lead effect-identity refinement = ACCEPTED AS SUPERIOR
material contradictions surviving = 0
Round 2 = NOT JUSTIFIED
```

Reviewer output remained Evidence only; operator ratification decided the accepted operations refinements.

## Downstream proof routing

3M did not manufacture pre-implementation runtime proofs. The falsifiers are routed to the earliest real consumers:

- **3N:** authority uniqueness, current/exact-pinned re-entry, unknown preservation, dependency/storage boundaries, generation-continuity/deny-only posture, Gateway new-admission fence, idempotency-scope validation, and YAGNI deletion challenge.
- **First build:** Builder/PAR/MAR/Gateway/Release kill points over real owner records and integrated paths.
- **First production:** real off-host restore, cross-store closure, credential decryptability, stale-authority fencing, external-effect deny default, post-cutoff Git reconciliation, EnvironmentConformance, exact serving verification and emergency-stop drill.
- **3O:** real read-only managed-sync recovery for the Budget Analyzer first vertical.

## Reopen triggers

Reopen only the smallest affected boundary when material Evidence shows, for example:

```text
positive generation continuity needs a new semantic owner/class
real provider cannot fit validated Gateway idempotency/reconciliation semantics
first real effect-capable MANAGED_JOB is admitted
single-cluster recovery consistency no longer holds
credential recovery cannot preserve separate custody
first-build kill tests show owner facts are insufficient
HA/PITR/zero-loss effects become a real requirement
DurableAgent/active-run same-stream recovery is selected
EVENT triggers or broader autonomous execution are admitted
Builder/PAR topology or isolation changes
DEDICATED deployment creates another recovery domain
ratified RPO/RTO cannot be met
post-cutoff Git reconciliation exposes missing semantic ownership
```

Framework popularity or a newer feature by itself is not a reopen trigger.
