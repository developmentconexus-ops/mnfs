# 3L-D/E — Fable Independent Proportional Rederivation Review

**Status:** INDEPENDENT REVIEW / NON-AUTHORITATIVE / EVIDENCE ONLY  
**Fase:** 3L — Technology Qualification; Package D (Managed Execution) + Package E (Deciding Evidence)  
**Revisor:** independent Senior/Staff/Principal architecture, distributed-systems and technology-qualification review under the Fable independent-review convention, per `3L-DE-FABLE-adversarial-review-handoff.md` — operator-supplied brief, **not present in the reviewed tree**  
**Executing model:** Claude Opus 5 (prior pareceres in this family were executed by Claude Fable 5; authorship is recorded as executed, not inherited)  
**Método:** DevelopmentConexus Engineering Method v1.0.0 (cópia local canônica)  
**Base revisada:** `7939301be9f6da0d3e96ebb33b47a3d6d5dc009d` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Nota de HEAD:** matches the handoff target exactly. The local checkout was 68 commits stale at `f05e2f4…`, a strict ancestor with zero local commits; the entire review was performed against the target SHA through `git show`, with no working-tree mutation. See §A.1.  
**Prepared:** 2026-08-20  
**Importante:** este parecer é Evidence, nunca requirement authority. Não constitui C-018, não ratifica Package D nem Package E, não altera `LEDGER.md`, `current/` nem decisões aprovadas, não autoriza a execução de `DT-1`, implementação de produto, PR readiness ou merge do PR #40. A adjudicação é ato do Architecture Lead/operador sobre este parecer.

```text
Product implementation      = BLOCKED
C-018                       = NOT RATIFIED
Package D/E execution       = NOT AUTHORIZED by this review
PR #40 merge                = NOT AUTHORIZED
```

> This review is Evidence, not requirement authority. It does not ratify D or E, does not
> authorize `DT-1`, and does not reopen any decision beyond the exact ones named in
> `FBL-D1`. No authority file was edited, no dependency was acquired, no probe was executed,
> no provider/model/E2B call was made.
>
> **Filing note.** Handoff §2 listed `edit repository files` / `commit, push` among its MUST-NOT
> actions. That clause is new relative to prior Fable review briefs, and it conflicts with the
> established repository convention in which the reviewing session files its own
> non-authoritative parecer as one additive commit (`3D-FABLE-R0`, `3E-FABLE-R2`,
> `3F-FABLE-R1`, `3A-R11-fable-…`). The conflict was surfaced to the operator, who ratified
> filing under the convention. This commit therefore adds **this file only** — no `LEDGER.md`,
> no `current/`, no accepted-authority document, and no PR state change.

---

# A. Review identity and reconstruction

```text
Reviewed repo:                developmentconexus-ops/mnfs
Reviewed PR:                  #40 — OPEN / DRAFT / mergeable = CONFLICTING / base = main
Reviewed branch:              agent/conexus-phase-3-system-design
Reviewed HEAD:                7939301be9f6da0d3e96ebb33b47a3d6d5dc009d
HEAD matched handoff target:  YES
Material delta if NO:         n/a
Mastra skill loaded:          YES
```

## A.1 Working-tree caveat (disclosed, not material to the verdict)

The local checkout was at `f05e2f486544309f824cd62660d9eee6e535cab0`, which is a strict
ancestor of the review target and **68 commits stale** (it predates all Package-B execution,
`3L-R1` projection, BT-3N/BT-4N/BT-5N, and Package-B closure).

To avoid reviewing a stale tree without mutating working state, the entire review was
performed against the target SHA through `git show <sha>:<path>` after
`git fetch origin agent/conexus-phase-3-system-design`. Ancestry was verified
(`git merge-base --is-ancestor` = true; zero commits on local not in origin), so there is no
divergence — only staleness. No checkout, reset, stash or clean was performed.

## A.2 Location of the proposal under review

```text
Package-D / Package-E rederivation document in the reviewed tree = ABSENT
```

`docs/conexus/phase3/` at the target SHA contains **no** `3L-D-*`, `3L-E-*`, `package-d` or
`package-e` document. The proposal being falsified exists only in the review handoff. Findings
below therefore cite (a) the handoff section for the challenged claim and (b) the exact
current-tree path for the accepted authority or Evidence that decides it.

## A.3 Exact external pins/source reviewed

```text
@mastra/core   1.56.0   integrity sha512-0wpDpg3T6pDRs+MtvPiyiGVxAuLKalR1xabtn3sz6rhervunjBspiRD7Ho0QUW1eRamfFc5mjl7tazkuEK1YJA==
@mastra/memory 1.25.0
@mastra/pg     1.19.0
Package-B lock SHA-256 = 5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0   (independently recomputed — MATCHES current/README.md §7)
PostgreSQL     17.10    (qualification pin; not exercised — no probe run)
pg-boss        12.26.3  (official tag; source + docs read, not installed)
Node           24.18.0  (Q0 host pin)
```

**Mastra source provenance.** `spikes/conexus-3l-b/` is not materialized in the local
checkout, so its `node_modules` was unavailable. `@mastra/core 1.56.0` was instead read from
the Package-A install at `spikes/conexus-3l-a/node_modules/@mastra/core`. This is admissible
because the npm integrity hash for `@mastra/core@1.56.0` is **byte-identical** in both
`spikes/conexus-3l-a/package-lock.json` and `spikes/conexus-3l-b/package-lock.json`
(value above). The **full transitive closure** of the two locks differs; every Mastra claim
below is therefore additionally checked against the **Package-B lock's own package list**
(260 entries), which is the authority for what is and is not present in the exact Package-B
closure.

**pg-boss source provenance.** Read from `raw.githubusercontent.com/timgit/pg-boss` at tag
`12.26.3` — `package.json`, `src/manager.ts`, `src/plans.ts`, `src/timekeeper.ts`,
`src/worker.ts`, `docs/api/{jobs,scheduling,adapters,queues,constructor,workers}.md`,
`docs/install.md`, `README.md`. The package was **not** installed and **not** executed.

## A.4 Mastra skill compliance

`.agents/skills/mastra/SKILL.md` was loaded. The repository-vendored copy is byte-identical to
the loaded skill (`sha256 0dec6736b273c5c582d465427a7efaba4834c44f8554e3834a41ae79dd102938`).
Its mandated priority order was followed for every Mastra claim:

```text
1. embedded docs   node_modules/@mastra/core/dist/docs/references/*   ← used
2. installed source + type declarations                              ← used (decisive)
3. remote/Context7 docs                                              ← not needed; not used as a deciding claim
```

## A.5 Independently verified current state

Every status below was re-derived from the target tree, not inherited from the handoff.

```text
3A-R11                 = CLOSED / APPROVED / OPERATOR RATIFIED     current/README.md, LEDGER.md §2.7
3L-R1                  = CURRENT / APPROVED / OPERATOR RATIFIED    3L-R1 header, 2026-08-19
Phase 3                = IN PROGRESS                               LEDGER.md §2 table
Package A              = COMPLETE                                  current/README.md §12
Package B              = CLOSED / LEAD-ADJUDICATED                 3L-B-final-lead-closure.md
Package C              = DEFER SAFELY / NOT EXECUTED               3L-R1 §8
Package D              = NOT EXECUTED / REQUIRES PROPORTIONAL REDERIVATION
Package E              = NOT EXECUTED / REQUIRES PROPORTIONAL REDERIVATION
3M / 3N / 3O           = NOT STARTED                               LEDGER.md §2 table
C-018                  = NOT RATIFIED
Product implementation = BLOCKED
PR #40                 = DRAFT / NO MERGE AUTHORIZATION
```

This review changes none of them.

---

# B. Finding summary

```text
Material Findings:                    6
Non-material Findings:                6
New Product requirements proposed:    0
Architecture reopen required:         YES — bounded, exactly one decision family (FBL-D1)
Execution prerequisite split required: YES — Package D only
```

---

# C. Package D verdict

```text
STOP_SPLIT_PREREQUISITE
```

```text
Package D pre-C018 execution required:  UNDETERMINED until FBL-D1 resolves
                                        (branch-dependent — both branches stated below)

Admitted smallest probe:                NONE ADMITTED YET.
                                        DT-1 is admissible only under FBL-D1 branch (i),
                                        and only in the narrowed form DT-1' below.

Exact protected invariant:              Recurring managed work may reuse shared
                                        scheduling/queue mechanics, but its production
                                        meaning, exact revision, authority and allowed
                                        effects remain derived from existing
                                        Project/Release/artifact/Gateway owners; no
                                        execution without a durable JobRun, and no
                                        admitted JobRun irrecoverably lost to a
                                        persist→enqueue window.
                                        (3A-R9 §3, §15)

Exact external unknown:                 Only two remain, and both are composition
                                        properties, not API facts:
                                        (U1) does an owner-row INSERT and a pg-boss
                                             send() through one PostgreSQL transaction
                                             actually commit/roll back atomically in the
                                             pinned 12.26.3 path, given that send() also
                                             performs a queue-cache lookup outside the
                                             supplied adapter;
                                        (U2) under two concurrent transactions admitting
                                             the same logical occurrence, does the
                                             composition of the owner uniqueness
                                             constraint with pg-boss's
                                             `ON CONFLICT DO NOTHING` + policy partial
                                             unique index yield exactly one admission
                                             fail-closed, given that send() signals
                                             suppression by returning `null` and never by
                                             raising.
                                        Every other pg-boss property the handoff routes
                                        to DT-1 is now SOURCE-RESOLVED (see FBL-D8).

What remains first-build:               single-flight/coalesce owner lifecycle; retry pin
                                        preservation; cancel intent + cooperative abort
                                        via `job.signal`; MANAGED_JOB last-mile owner
                                        revalidation; Release-handoff settlement rule;
                                        next-due formula; honoring `job.signal`;
                                        `expireInSeconds` sizing.

What remains 3M:                        timeout/partial-progress honest settlement;
                                        RUNNING-orphan recovery after process loss with
                                        `retryLimit: 0`; cancel × in-flight races;
                                        maintenance/retention interaction.

What remains 3N/3O:                     absence of duplicate schedule authority across the
                                        composed system; end-to-end first-vertical
                                        freshness/failure truth with source-anchored
                                        Evidence.

New module/record/database required:    NO new module, NO new durable record class, NO new
                                        Conexus domain schema, NO scheduler domain, NO
                                        outbox.
                                        BUT: FBL-D1 shows the managed-job queue substrate
                                        has NO ratified physical home, and every candidate
                                        home either contradicts the closed `hub_control`
                                        inventory / single-migration-lineage law or
                                        forecloses the probe's central property.
                                        That disposition must be decided before D.
```

### Branch statement for FBL-D1

```text
(i)  queue substrate co-located inside hub_control under MAR ownership
     → same-transaction admission is reachable
     → Package D pre-C018 execution = YES, as narrowed DT-1' (U1 + U2 only)

(ii) queue substrate in a separate vendor database (the ratified mastra_* precedent)
     → same-transaction admission is UNREACHABLE
     → DT-1's P1/P2/P4 prove an untransferable property
     → Package D pre-C018 execution = NO
     → 3A-R9 §15's own fallback applies: prove the smallest equivalent mechanism,
       which is owner-side reconciliation — first-build/3M owner logic, not a substrate probe
```

---

# D. Package E verdict

```text
E_DEFER_SAFELY_CONFIRMED_WITH_BOUNDED_CORRECTION
```

```text
Package E pre-C018 runtime execution required:  NO

If YES, smallest exact question:                n/a

Why source inspection is insufficient:           It is sufficient. Handoff §16 Alternative B
                                                 ("source/type reachability review only, no
                                                 runtime") is the Global Maximum, and this
                                                 review performed it. The E-A uncertainty is
                                                 now CLOSED — but closed with the OPPOSITE
                                                 sign to the Lead's stated basis (FBL-E1).

What remains first-build:                        OBS ingestion + producer-trust stamping;
                                                 owner-ID binding from server-side dispatch
                                                 context; custom ObservabilityExporter →
                                                 Conexus OBS; per-role exporter/serviceName
                                                 attribution; negative fixtures for
                                                 GUEST_OBSERVED and for silently-disabled
                                                 observability.

What remains 3M:                                 dropped/missing/partial evidence semantics;
                                                 crash-before-flush; degraded-telemetry
                                                 behavior.

What remains 3N/3O:                              architecture-wide negative proof; first-
                                                 vertical deciding-evidence proof.

Mandatory collector/backend required now:        NO. No OTel Collector, Sentry, Spotlight,
                                                 ClickHouse, event bus or telemetry outbox is
                                                 justified by any current criterion.
```

**Bounded correction required before ratification:** the Lead's basis sentence — that the
exact `@mastra/core 1.56.0` family exposes usable `ObservabilityInstance` /
`ObservabilityExporter` surfaces — must be restated as: *core exposes the interfaces and a
no-op; the concrete implementation lives in `@mastra/observability`, which is **absent from
the exact Package-B lock**, and is therefore a named, not-yet-pinned, not-yet-C-016-admitted
realization dependency.* See `FBL-E1`.

---

# Findings

## FBL-D1 — Managed-job queue substrate has no ratified physical home

```text
Finding ID: FBL-D1
Package:    D
Severity:   MATERIAL
Category:   persistence topology / duplicate-lineage / probe transferability
```

**Claim challenged.** Handoff §9 and §11.2 P1: "owner fixture row + pg-boss job commit
atomically", and handoff §12 D-D's presupposition that "the accepted F1 topology permits the
owner record and pg-boss job to participate in one PostgreSQL transaction."

**Exact current-tree paths/statements.**

- `docs/conexus/current/ARCHITECTURE-BASELINE.md` §6.5: *"`hub_control` has exactly 13 owner
  schemas: `iam ws prj bld reg con gw brn par rel mar obs att`. … There is no shared/common
  schema."* (operator-ratified through 3A-R11)
- `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md` §2 physical
  inventory: `hub_control` (13 schemas) · `mastra_builder` · `mastra_par` ·
  `{project databases}` · `validation databases`. **pg-boss appears nowhere in the ratified
  physical topology.**
- `3E-01` §2 rules: *"cada schema possui exatamente um module owner de 3C"*;
  *"não existe schema `shared` ou `common`"*.
- `3E-01` §3: *"F1 usa **uma única lineage ordenada de migrations do `hub_control`** … sem
  migration stream independente por módulo"*.
- `3E-01` §10, on why Mastra got **two separate databases** even though `schemaName` was
  available: *"DDL vendor-managed fica fisicamente confinado"* — the ratified precedent for a
  vendor-managed-DDL substrate is a **separate database**, not a schema inside `hub_control`.
- `3A-R9` §31: `new database/schema = 0`.
- `3A-R9` §15: *"A realization preferida pode usar transação Postgres compartilhada com o
  queue substrate se o substrate pinado provar essa propriedade. Caso contrário,
  3L/Realization deve provar um mecanismo equivalente mínimo."*
- `3E-02` §`mar`: *"queue/scheduler substrate continua seam interno e não vira domain
  record/module apenas por existir async work."*

**Exact source Evidence.**

- `pg-boss@12.26.3` `src/plans.ts`: `DEFAULT_SCHEMA = 'pgboss'`; `CREATE SCHEMA IF NOT EXISTS
  ${schema}`.
- `docs/api/constructor.md`: `schema` — *"Database schema that contains all required storage
  objects. Only alphanumeric and underscore allowed, length: <= 50 characters"*;
  `migrate` — *"If this is set to false, this instance will skip attempts to run schema
  migrations during `start()`. If schema migrations exist, `start()` will throw and error and
  block usage."*
- `docs/install.md`: *"pg-boss will automatically create a dedicated schema (`pgboss` is the
  default name) in the target database"*; *"This will require the user in database connection
  to have the CREATE privilege"*; recommended path is *"Use the pg-boss CLI to manage schema
  creation and migrations"*, with a documented alternative to *"export SQL commands
  programmatically for manual execution by DBAs."*

**Why it matters.** DT-1's entire headline property is transactional co-admission. That
property is only *usable* if the production topology places the queue substrate in the same
physical database as `mar.job_run`. Current ratified authority does not place it anywhere, and
its two nearest applicable rules point in opposite directions:

- the closed 13-schema `hub_control` inventory and the single-DDL-lineage law argue **against**
  a vendor schema inside `hub_control`;
- the `mastra_*` vendor-DDL-confinement precedent argues **for** a separate database — which
  makes cross-database atomicity impossible in PostgreSQL without 2PC/FDW, neither of which is
  admitted anywhere in 3E/3J.

A probe that proves atomicity in a throwaway database, when production forbids co-location,
proves an untransferable property. Method: *"Evidence strength is claim-relative."*

**Failure / counterexample.**

```text
DT-1 executes in a scratch database
→ P1/P2/P4 PASS
→ Package D declared QUALIFIED_TRANSACTIONAL_DELAYED_PROJECTION
→ Realization Planning applies the ratified mastra_* precedent
→ pg-boss lands in its own database
→ same-transaction admission is impossible
→ the persist→enqueue window (3A-R9 CE-9) is reintroduced at implementation time
→ the failure class DT-1 existed to close is reachable again, after the probe passed
```

Symmetric counterexample: if the schema *is* placed inside `hub_control` without a decision,
an implementation actor silently adds a 14th schema with its own vendor DDL stream, breaking
the closed inventory and the single-lineage law that 3E-01 §3 requires the mechanical
cross-schema check to enforce.

**Evidenced candidate resolution (not a decision — for the Lead).** The exact pg-boss
configuration surface admits a resolution that appears to satisfy every constraint
simultaneously and is worth adjudicating first, because it would collapse this prerequisite
into a bounded clarification rather than an amendment:

```text
createSchema = false
migrate      = false            → start() fails closed if vendor migrations are pending
vendor DDL   = exported via the documented pg-boss SQL-export utilities
             → folded into the single ordered hub_control migration lineage
             → owner declared = MAR (3E-01 §3 requires an owner per migration)
schema       = one MAR-owned substrate schema inside hub_control
```

This preserves: one migration lineage; one owner per schema; vendor DDL versioned rather than
self-applied; `3E-02`'s "queue substrate is an internal seam"; and same-transaction
co-admission. It creates one recorded accepted risk — pg-boss version bumps require folding
new vendor DDL into the Conexus lineage — and it requires an explicit statement on whether a
vendor substrate schema counts against Baseline §6.5's *"exactly 13 owner schemas"*.

**Recommended disposition:** `SPLIT_PREREQUISITE`

**New Product requirement or architecture authority required?** NO new Product requirement.
YES, a bounded amendment/clarification of exactly one decision family — `3E-01` §2/§3,
`3E-02` `mar`, and Architecture Baseline §6.5 — limited to the physical placement and DDL
lineage of the managed-job queue substrate. This is a **correction of an omission** (the
ratified topology never placed a substrate that 3A-R9 §15 already presupposes), not a new
proposal: 3A-R9 §15 and 3A-R10 §10 already anticipate both branches.

**Probe impact:** `BLOCK_EXECUTION` (until resolved), then `MODIFY_DT1` under branch (i) or
`REMOVE_PRE_C018_PROBE` under branch (ii).

---

## FBL-D2 — Pre-admitted future JobRun × Release handoff has no frozen settlement rule

```text
Finding ID: FBL-D2
Package:    D
Severity:   MATERIAL
Category:   lifecycle semantics / Release handoff
```

**Claim challenged.** Handoff §9: the rolling candidate maintains one future-dated `QUEUED`
JobRun; §10 row 11 routes *"old Release cannot generate future work"* to FIRST-BUILD.

**Exact current-tree paths/statements.**

- `3A-R9` §10: *"Recurring production occurrence só pode nascer da exact managed composition
  que esteja **atualmente** apta a gerar trabalho"*; *"old Release leaves current production
  composition → does not generate new future occurrences"*; *"new Release pointer exists but
  not yet SERVED_VERIFIED → fail closed for new recurring occurrences"*; *"In-flight run já
  admitido permanece pinado à Release/revision com que **iniciou**."*
- `3A-R9` §19 minimal lifecycle: `QUEUED · RUNNING · SUCCEEDED · FAILED · CANCEL_REQUESTED ·
  CANCELLED`. **There is no `SKIPPED` or `SUPERSEDED`.** §19 does, however, establish the
  precedent that a terminal *reason/classification* may be used instead of a new state
  (`TIMEOUT`).
- `3G-05` §7: *"New run admission: resolve current active Release → pin exact composition"*;
  §8.1: trigger firing = **guarded admission at fire time**; *"DISABLE commits first → firing
  cannot admit run"*.
- `3G-08` §13.2: *"At new run admission: current active Release → exact run pin. Later pointer
  change does not mutate in-flight run."*

**Why it matters.** The accepted PAR model resolves the Release **at fire time**, so its
exposure window between admission and execution is effectively zero. The DT-1 candidate
inverts this: it admits and pins one occurrence **up to a full interval before** execution.
3A-R9 §10 protects a run that *began* (`iniciou`); it says nothing about an occurrence that is
admitted but has not begun. That gap is real, substrate-independent Product logic, and a
coding actor must silently pick one of:

```text
(a) execute the stale occurrence under R17 after R18 took over
(b) refuse it at last mile, settle it terminally, and let reconciliation admit under R18
(c) never pre-admit beyond the current instant
```

These are materially different systems. (a) lets a superseded composition do production work —
including a job artifact revision R18 may have changed or removed. (c) removes DT-1's entire
future-dating premise. The candidate implicitly assumes (b) ("MAR must revalidate current
owner/admission facts before physical sync"), but (b) needs a terminal settlement meaning that
`3A-R9` §19's state set does not currently provide.

**Failure / counterexample.**

```text
R17 active/SERVED_VERIFIED at 10:00
→ MAR admits JobRun J1, startAfter 11:00, pinned R17 / job v4
10:30 R18 promoted; job artifact v5 changes the target entity set; R17 leaves production
11:00 queue delivers J1
→ under (a): a sync runs for a composition no longer served — 3A-R9 CE-2 class
→ under (b): J1 must terminalize, but the only available terminal is CANCELLED, which
  asserts a cancel intent that no owner expressed — dishonest settlement, 3A-R9 §20 and
  §18 "never converts unknown/partial into success" read in spirit
```

**Recommended disposition:** `CORRECT_REDERIVATION`

**New Product requirement or architecture authority required?** NO. The fix is a bounded
clarification within `3A-R9` §10/§19 using the mechanism §19 already permits: a terminal
*reason/classification* (e.g. `SUPERSEDED_BY_CURRENT_COMPOSITION`) on the existing terminal
set, plus an explicit bound on how far ahead an occurrence may be admitted. No new durable
record, no new state machine, no new owner.

**Probe impact:** `MODIFY_DT1` — the admission horizon is a DT-1 parameter (P7 presupposes an
already-admitted row survived downtime). DT-1 must state the maximum admission lead and must
not claim Release-handoff correctness, which is owner logic.

---

## FBL-D3 — pg-boss `send()` signals suppression by returning `null`, never by raising

```text
Finding ID: FBL-D3
Package:    D
Severity:   MATERIAL
Category:   deterministic identity / fail-closed composition
```

**Claim challenged.** Handoff §11.2 P6: *"concurrent admission attempts for the same
deterministic occurrence produce at most one owner occurrence and at most one queue
projection"*; §8.3 *"job creation → explicit job id supported"*; §12 D-E *"return value or
error behavior under duplicate ID"*.

**Exact source Evidence (`pg-boss@12.26.3`).**

- `src/plans.ts` `insertJobs(schema, { table, name, returnId = true, notify = false })`:
  ```sql
  INSERT INTO ${schema}.${table} ( id, name, data, ... )
  SELECT ... FROM json_to_recordset($1::json) as x (...)
  JOIN ${schema}.queue q ON q.name = '${name}'
  ON CONFLICT DO NOTHING
  ${returning}
  ```
- `src/manager.ts`: `const db = wrapper || this.db` … `const { rows: try1 } = await
  db.executeSql(sql, [JSON.stringify([job])])` … `if (try1.length === 1) { return jobId }` …
  `return null`.
- The `division_by_zero` guard (`SELECT 1 / (CASE WHEN (SELECT count(*) FROM ins) =
  ${jobs.length} THEN 1 ELSE 0 END)`) that raises *"one or more jobs could not be created.
  This usually means a job id was duplicated…"* is present in **`insertFlowJobs`**, **not** in
  the ordinary `insertJobs`/`send()` path.
- `docs/api/jobs.md`: *"send() will resolve a null for job id under some use cases when using
  unique jobs or throttling"*.
- `src/plans.ts` policy indexes (exact predicates):
  ```sql
  job_i1 ... (name, COALESCE(singleton_key,'')) WHERE state = 'created' AND policy = 'short'
  job_i2 ... (name, COALESCE(singleton_key,'')) WHERE state = 'active'  AND policy = 'singleton'
  job_i3 ... (name, state, COALESCE(singleton_key,'')) WHERE state <= 'active' AND policy = 'stately'
  job_i4 ... (name, singleton_on, COALESCE(singleton_key,'')) WHERE state <> 'cancelled' AND singleton_on IS NOT NULL
  ```
- Job table PK is composite `(name, id)` on a `PARTITION BY LIST (name)` table.
- `docs/api/queues.md` retention: `retentionSeconds` default 14 days (created/retry);
  `deleteAfterSeconds` default 7 days (completed); `0` = keep forever.

**Why it matters.** Three consequences, none of which the candidate states:

1. **`null` is ambiguous and silent.** On a duplicate deterministic id, `send()` does **not**
   throw and does **not** abort the caller's transaction — it returns `null`, exactly as it
   does for throttling and singleton suppression. If the caller ignores the return value, the
   transaction commits an owner `JobRun` with **no queue projection**, silently.
2. **A missing queue row is also `null`.** The insert `JOIN`s `${schema}.queue`. If
   `createQueue` has not run for that queue name, zero rows insert and `send()` returns `null`
   — a configuration error is indistinguishable from a dedupe hit.
3. **Reusing the owner occurrence id as the pg-boss PK collides with retention.** Terminal
   rows persist for `deleteAfterSeconds`/`retentionSeconds`. A retry or a projection repair
   that re-sends the *same* deterministic id while the previous terminal row is retained
   silently conflicts and returns `null`. The policy partial indexes (`job_i2`, `job_i3`,
   `exclusive`) are the correct native fence precisely because their predicates **exclude
   terminal states**.

**Failure / counterexample.**

```text
MAR admits occurrence O
→ INSERT mar.job_run (owner unique constraint on the occurrence key)  → OK
→ boss.send(name, payload, { db: tx, id: deterministic(O) })          → null (retained terminal row)
→ return value ignored
→ COMMIT
→ owner JobRun is QUEUED forever; no worker will ever see it
→ freshness silently stops advancing; nothing failed; nothing is observable as failed
```

**Recommended disposition:** `CORRECT_REDERIVATION`

**New Product requirement or architecture authority required?** NO.

**Probe impact:** `MODIFY_DT1`. DT-1 must freeze the minimum identity rule, and it is now
derivable from source rather than guessable:

```text
primary fence          = owner-side uniqueness on mar.job_run over the logical occurrence key
                         (it raises → aborts the transaction → fail closed)
queue-side fence       = queue policy + singletonKey over the SAME logical occurrence key
                         (partial indexes exclude terminal rows → retention-safe)
queue job id           = per-projection-generation, never the bare occurrence id
send() returns null    = MUST be treated as fail-closed (abort or explicit reconcile mark),
                         NEVER as success
createQueue            = explicit prerequisite; its absence must not present as dedupe
```

DT-1 must additionally observe **what the losing transaction sees** under concurrency (U2),
which is the only part of this that source cannot settle.

---

## FBL-D4 — DT-1's admission model is undecided, and half its properties depend on that choice

```text
Finding ID: FBL-D4
Package:    D
Severity:   MATERIAL
Category:   Global Maximum / probe scope
```

**Claim challenged.** Handoff §8.1: *"Package D = ONE BOUNDED PRE-C-018 PROBE REQUIRED; Probe
= DT-1 — Transactional Delayed Occurrence Projection"*, and §12 D-J's framing of
Alternative A as the recommendation.

**Exact current-tree paths/statements.**

- `3A-R9` §14 states the catch-up law in **freshness-driven** form, not in
  late-durable-row form:
  ```text
  recurring job still required by current served Release
  + no active run
  + sync is behind current freshness target
  → admit at most one catch-up occurrence
  ```
- `3A-R9` §15 requires only: *"não existir execução sem JobRun durável, nem JobRun admitido
  que possa ser perdido para sempre por uma janela persist→enqueue não reconciliável."*
- `3A-R10` §10: *"pg-boss misses downtime schedule → narrow Release/owner-side catch-up
  reconciliation if sufficient"*; *"persist→enqueue window loses admitted job forever →
  smallest reconciliation/transaction mechanism; outbox only if evidence proves necessary."*

**Why it matters.** Handoff §12 D-J Alternative C is not a relocation of the scheduler — under
the accepted §14 wording it is **strictly smaller** than Alternative A, and it eliminates
`FBL-D2` entirely:

| Responsibility | A — rolling future occurrence | C — reconcile on tick, enqueue only immediate work |
|---|---|---|
| atomic owner+queue admission | required | required (identical) |
| owner single-flight | required | required (identical) |
| owner guard before physical effect | required | required (identical) |
| durable future-dated row | **required** | not needed |
| repair of *future* projections | **required** | not needed |
| Release-handoff settlement of pre-admitted rows | **required** (FBL-D2) | **not reachable** — Release resolved at admission = fire time, matching 3G-05 §7 |
| retention-horizon bound on future rows | **required** | not needed |
| periodic wake | not needed | required (process-local timer, or a platform tick) |

Under C, missing a wake tick costs at most one tick of latency, because the reconciler is
freshness-driven and idempotent. That makes `pg-boss`'s 60-second cron window (FBL-D8) *and*
issue #557 **harmless** rather than disqualifying — which materially weakens handoff §8.4's
stated reason for rejecting the native cron path.

The choice between A and C is an **architecture decision that must precede the probe**,
because it determines whether DT-1 properties `P3`, `P5`, `P7` (delayed execution, fresh-process
delivery of a future row, late-row downtime behavior) are load-bearing at all. Executing DT-1
before that choice buys evidence the chosen design may not need — the over-proof direction the
handoff §3 explicitly asks to attack.

**Failure / counterexample.**

```text
DT-1 executes and PASSES with all ten properties
→ Lead subsequently selects Alternative C on FBL-D2 grounds (the only clean answer to D-A)
→ P3, P5, P7 and the projection-repair-of-future-rows evidence are dead weight
→ the probe cost was paid for properties the realization does not use
→ meanwhile U1/U2 — the properties C *does* need — were tested only incidentally
```

**Recommended disposition:** `CORRECT_REDERIVATION`

**New Product requirement or architecture authority required?** NO. Both A and C are
realizations of `3A-R9` §14/§15 as already accepted; neither creates a record, module or
owner. A process-local reconcile timer is process-local mechanics, not a `SchedulerModule` —
it holds no per-job schedule state, no calendar and no future-slot queue.

**Probe impact:** `MODIFY_DT1` — narrow DT-1 to the admission-model-independent core:

```text
DT-1'  (admissible only under FBL-D1 branch (i))
P1  owner row + pg-boss job commit atomically through one transaction adapter
P2  forced rollback leaves neither row
P4  commit followed by process loss leaves both facts discoverable
P6  concurrent same-occurrence admission → exactly one owner occurrence, fail-closed loser,
    with the loser's exact observable behavior recorded
P9  queue delivery without a currently admissible owner fixture is refused before effect
P10 zero provider/model/E2B/Sankhya/external effects
RED-1 non-atomic owner/enqueue → demonstrate the lost-window class
RED-2 no owner uniqueness fence → demonstrate duplicate admission
RED-3 queue-as-authority → demonstrate the unguarded effect path, then block it
```

`P3/P5/P7` and `RED-4` become **optional add-ons**, executed only if Alternative A is selected.
`P8` narrows per `FBL-D7`.

---

## FBL-D5 — Fixed-interval next-due semantics are genuinely unfrozen

```text
Finding ID: FBL-D5
Package:    D
Severity:   MATERIAL
Category:   temporal correctness / silent implementation choice
```

**Claim challenged.** Handoff §10 row 1 routes *"Fixed interval produces occurrence"* to
`BOUNDED 3L`, and §12 D-F asks whether the coding actor still faces a silent choice.

**Exact current-tree paths/statements.** `3A-R9` §12: *"F1 admite: `MANUAL`,
`FIXED_INTERVAL` … Exact interval numérico é calibration/Project configuration, não
architecture law."* `3A-R9` §14: one catch-up, no N-slot backlog. `3A-R9` §13: SKIP/COALESCE on
overlap.

**Why it matters.** §12 freezes the interval *number* as calibration but never freezes the
*formula*. The four candidates in handoff §12 D-F produce different drift, different backlog
behavior and different Release-handoff exposure:

```text
previous intended slot + interval   → drift-free cadence; requires durable slot memory;
                                      after downtime the "previous intended slot" is
                                      ambiguous — this is where an N-slot backlog is born
completion time + interval          → self-healing, no slot memory, cadence drifts by run duration
current time rounded to interval    → aligned wall-clock slots; reintroduces slot semantics
Release activation + N*interval     → makes Release activation a temporal origin — this
                                      would make Release a schedule authority, contradicting
                                      3A-R9 §9
```

Only the fourth is clearly excluded by current authority. The other three are all admissible
readings of "FIXED_INTERVAL", and the choice is exactly the kind of material decision
`3A-R8` forbids delegating silently to the coding actor.

**Failure / counterexample.**

```text
Hub down 6h; interval = 15 min
→ implementation reads "previous intended slot + interval" literally
→ on restart it walks forward from the last intended slot
→ 24 slots are materialized
→ 3A-R9 CE-4 fires: "Hub fica 6h offline e volta enfileirando todos os slots perdidos" = FAIL
```

**Recommended disposition:** `CORRECT_REDERIVATION`

**New Product requirement or architecture authority required?** NO — it is a clarification
inside `3A-R9` §12/§14, and the smallest rule that satisfies both is already implied by §14:
*next admissible occurrence is derived from the sync's current freshness position, never by
walking nominal slots forward.* That single sentence closes the class and is neutral between
Alternatives A and C.

**Probe impact:** `NONE`. This is Product logic; no substrate property decides it.

---

## FBL-D6 — pg-boss 12.26.3 **does** deliver an `AbortSignal` per job; the Lead's cancel fact set is incomplete

```text
Finding ID: FBL-D6
Package:    D
Severity:   NON_MATERIAL
Category:   evidence correction (reduces risk)
```

**Claim challenged.** Handoff §8.3: *"cancel → mutates queue job state → does not by itself
appear to wire an active worker handler's AbortController"*, and §12 D-H's question *"Does the
first build need a local map/handle from JobRun to AbortController?"*

**Exact source Evidence (`pg-boss@12.26.3`).**

- `docs/api/workers.md`: each job object passed to a `work()` handler carries
  `signal` (`AbortSignal`) and `heartbeatSeconds` (`number | null`).
- `src/manager.ts` `#processJobs`:
  ```ts
  const ac = new AbortController()
  jobs.forEach(job => { job.signal = ac.signal })
  if (worker) { worker.abortController = ac }
  const result = await resolveWithinSeconds(callback(jobs), maxExpiration,
    `handler execution exceeded ${maxExpiration}s`, ac)
  ```
- `src/manager.ts` `failWip` (shutdown): `await this.fail(worker.name, jobIds, 'pg-boss shut
  down while active')` then `worker.abort()`.
- `src/plans.ts` `cancelJobs`:
  ```sql
  WITH results as (UPDATE ${schema}.${table} SET completed_on = now(), state = 'cancelled'
    WHERE name = $1 AND id = ANY($2::uuid[]) AND state < 'completed' RETURNING 1)
  SELECT COUNT(*) from results
  ```

**Why it matters.** The Lead's conclusion is **correct** — `boss.cancel()` is a pure SQL
UPDATE with no path to the worker's `AbortController`, and note that `state < 'completed'`
includes `'active'`, so cancel *can* flip a row whose handler is still running. But the
supporting fact set is incomplete in a way that changes the first-build design:

```text
job.signal EXISTS and is aborted on:
  (a) local handler-execution timeout (maxExpiration), and
  (b) pg-boss shutdown

job.signal is NOT aborted by boss.cancel()
```

Therefore the first build does **not** need to invent a JobRun→AbortController map for
timeout or shutdown — the substrate already provides cooperative interruption for both. Only
**owner cancel intent** needs an owner-side path, and the accepted `3A-R9` §20 order
(*cancel intent commits → no new retry/admission → best-effort interrupt → terminal
settlement*) is already satisfied by a process-local handle plus in-handler owner-state
checkpoints. Process-local mechanics are not the forbidden registry of `3H-03` §17, which
forbids `RuntimeBus`/`EventBus`/`outbox`/`handoff ledger` created "por optionality", and
`3A-R9` §19 forbids a durable `JobAttempt` record — neither is implicated.

**Failure / counterexample.** The reachable failure is the opposite of the one feared: a
handler that **ignores** `job.signal` will keep running past `maxExpiration` and past
shutdown, producing exactly the duplicate-physical-work overlap `D-G` worries about. Honoring
`job.signal` is therefore a first-build obligation, not an optional nicety.

**Recommended disposition:** `CORRECT_REDERIVATION` (evidence correction; verdict unchanged)

**New Product requirement or architecture authority required?** NO.

**Probe impact:** `NONE`. No pre-C-018 substrate probe is required for cancellation.

---

## FBL-D7 — The projection-repair rule set is incomplete and unbounded as stated

```text
Finding ID: FBL-D7
Package:    D
Severity:   NON_MATERIAL
Category:   recovery completeness / probe scope honesty
```

**Claim challenged.** Handoff §9 repair rules and §11.2 P8: *"a missing queue projection can
be reconstructed from an exact admissible owner fixture"*; §10 row 10 `KEEP BOUNDED IN DT-1`.

**Exact source Evidence.**

- `src/plans.ts` `failJobsByTimeout`: selects active jobs where
  `(started_on + expire_seconds * interval '1s') < now()` and reinserts as **retry or failed**
  depending on retry limits.
- `docs/api/jobs.md`: `expireInSeconds` default 15 minutes; `retryLimit` default 2.
- `docs/api/queues.md`: `retentionSeconds` default 14 days deletes **created/retry** jobs;
  `deleteAfterSeconds` default 7 days deletes completed jobs.

**Why it matters.** The stated repair rules cover only `QUEUED owner + missing queue row`.
Two reachable states are unaddressed:

1. **RUNNING orphan.** With `retryLimit: 0` — which `FBL-D8` shows is the correct setting to
   fence automatic redelivery — a worker crash leaves the owner `JobRun` in `RUNNING` while
   the queue row is terminalized to `failed` by `failJobsByTimeout` after `expire_seconds`.
   Nothing redelivers it. Repair must therefore also cover `RUNNING owner + terminal/absent
   queue row`, which is a **3M** obligation, not a DT-1 property.
2. **Retention-created false "missing projection".** `retentionSeconds` (default 14 days)
   deletes `created`/`retry` rows. Under Alternative A this bounds how far ahead an occurrence
   may be admitted; beyond that horizon a legitimately-admitted future row vanishes and repair
   cannot distinguish it from a never-enqueued one. For a minutes/hours first-vertical
   interval this is not reachable, but the bound must be stated rather than assumed.

**Failure / counterexample.**

```text
retryLimit = 0; expireInSeconds = 900
sync starts, worker process dies at t+120s
→ owner JobRun stays RUNNING
→ at t+900s failJobsByTimeout terminalizes the queue row to 'failed'
→ no redelivery (retryLimit 0)
→ repair rule "QUEUED + missing projection" does not match
→ the JobRun is RUNNING forever; single-flight blocks every future occurrence
→ freshness stops advancing and 3A-R9 §13 "at most one active" becomes a permanent block
```

**Recommended disposition:** `CORRECT_REDERIVATION`

**New Product requirement or architecture authority required?** NO. `3A-R9` §19's terminal
set plus a reason classification is sufficient; `3M` owns the recovery policy.

**Probe impact:** `MODIFY_DT1` — narrow `P8` to *"a missing queue projection for an admissible
`QUEUED` owner fixture can be reconstructed"*, and state explicitly that DT-1 does **not**
prove general projection reconstructibility. Route the `RUNNING`-orphan class to 3M by name so
it is not lost.

---

## FBL-D8 — Several "external unknowns" routed to DT-1 are already source-resolved

```text
Finding ID: FBL-D8
Package:    D
Severity:   NON_MATERIAL
Category:   Known/Inferred/Unknown misclassification
```

**Claim challenged.** Handoff §18 UNKNOWN list, and §11.1's probe question, which bundles
delayed/restart/dedupe/projection into one external unknown.

**Exact source Evidence.** All from `pg-boss@12.26.3`:

| Handoff claim | Status after source reading | Exact evidence |
|---|---|---|
| §8.3 "cron monitor requires a live instance" | **CONFIRMED** | `docs/api/scheduling.md`: *"At least one instance needs to be running for scheduling to work."* |
| §8.3 "due test considers the preceding cron occurrence only inside a narrow time window" | **CONFIRMED — window is exactly 60 s** | `src/timekeeper.ts` `shouldSendIt()`: `const prevDiff = (databaseTime - prevTime.getTime()) / 1000; return prevDiff < 60` |
| §8.3 "longer downtime does not provide one-catch-up by itself" | **CONFIRMED** | same; a slot missed by >60 s is permanently skipped |
| §8.3 internal cron path (`cron check → __pgboss__send-it → internal worker → manager.send`) | **CONFIRMED** | `src/timekeeper.ts` `onSendIt()` → `this.manager.send(data)` |
| §8.3 "explicit job id supported / startAfter supported / PG-persisted row" | **CONFIRMED** | `docs/api/jobs.md`; `src/plans.ts` job table |
| §8.3 "caller-supplied db/transaction adapter supported" | **CONFIRMED, with an exact interface** | `docs/api/adapters.md`: `interface Db { executeSql(text: string, values: any[]): Promise<{ rows: any[] }> }`; accepted by `send()`, `insert()`, `fetch()`, `complete()`; *"When the ORM transaction is rolled back … all pg-boss operations executed through the adapter are rolled back as well."* `src/manager.ts`: `const db = wrapper || this.db` |
| §8.3 "cancel does not wire the handler's AbortController" | **CONFIRMED but incomplete** | see `FBL-D6` |
| §12 D-G "can `retryLimit=0` disable automatic retry reliably?" | **SOURCE-RESOLVED: yes** | `failJobsByTimeout` reinserts *"as retry or failed based on retry limits"* — with `retryLimit: 0` an expired active job terminalizes to `failed` and is not redelivered |
| §12 D-D "does it accidentally depend on an ORM not yet chosen?" | **SOURCE-RESOLVED: no** | the adapter interface is a single `executeSql` method; a raw `pg` client wrapper satisfies it. The Drizzle/Knex/Kysely/Prisma helpers are conveniences, not requirements |

**Why it matters.** The proportional-rederivation law admits into 3L only what is genuinely
load-bearing and genuinely external. Carrying already-resolved API facts as "unknown" inflates
DT-1, and — more importantly — a `PASS` on those properties would be recorded as *new*
qualification evidence when it merely re-observes documented behavior. `3L-Q0` §14 forbids
reinterpreting evidence across identities; the mirror obligation is not to manufacture
evidence for facts the source already settles.

**Failure / counterexample.** Not a runtime failure — an evidence-quality failure: DT-1 returns
ten green properties, eight of which were knowable without execution, and the two that
actually needed a real PostgreSQL (`U1`, `U2`) receive proportionally less design attention
inside a large fixture.

**Recommended disposition:** `CORRECT_REDERIVATION` — move the rows above from `UNKNOWN` to
`KNOWN (source)` in §18 and cite the exact file/expression, so the classification survives a
version bump as a requalification trigger rather than as a vague unknown.

**New Product requirement or architecture authority required?** NO.

**Probe impact:** `MODIFY_DT1` (scope reduction, per `FBL-D4`).

---

## FBL-E1 — `@mastra/core 1.56.0` ships observability **interfaces and a no-op only**; the concrete implementation is a package absent from the Package-B lock

```text
Finding ID: FBL-E1
Package:    E
Severity:   MATERIAL
Category:   exact-lock reachability / unadmitted realization dependency
```

**Claim challenged.** Handoff §14.2: *"The Architecture Lead observed that the exact
`@mastra/core 1.56.0` family exposes public observability surfaces conceptually including …
`ObservabilityInstance` / `ObservabilityExporter` … drop-event notification … flush/shutdown"*,
and §15 row 2's disposition *"Public seam source-known; actual mapping first-build"*. This is
handoff §16 E-A, correctly identified as the strongest Package-E challenge — and it lands.

**Exact source Evidence** (all from the exact pinned bytes,
`@mastra/core@1.56.0`, integrity `sha512-0wpDpg3T6pDRs+MtvPiy…`, identical hash in the
Package-B lock).

1. `dist/observability/index.d.ts` header — the package's own statement:
   > *"Core observability utilities and types. To use observability, install
   > **@mastra/observability** and pass an Observability instance to Mastra constructor."*
2. `dist/observability/index.js` runtime exports — the only entrypoint implementation exported
   is `NoOpObservability`. No `Observability`, no `DefaultObservabilityInstance`, no
   `BaseObservabilityInstance`, no `MastraStorageExporter`, no `MastraPlatformExporter`.
3. Verified by absence across the whole `dist/` tree:
   `grep -rl "DefaultObservabilityInstance" dist/` → **no matches**;
   `grep -rl "BaseObservabilityInstance" dist/` → **no matches**.
   `MastraStorageExporter` appears **only** inside `.d.ts` doc comments and one runtime warning
   string — never as an implementation.
4. `dist/mastra/index.d.ts:129,133` — the Mastra config field:
   ```ts
   /** Observability entrypoint … Pass an instance of the Observability class from @mastra/observability.
    * @example import { Observability, MastraStorageExporter, MastraPlatformExporter } from '@mastra/observability'; */
   observability?: ObservabilityEntrypoint;
   ```
5. `dist/mastra/index.d.ts` — even the runtime registration path requires concrete objects the
   caller must supply:
   ```ts
   registerExporter(exporter: ObservabilityExporter, instance: ObservabilityInstance,
                    entrypoint: ObservabilityEntrypoint): void;
   ```
6. `dist/mastra-QUHtup00.js:778` — the silent-degradation path:
   > *"Observability configuration error: Expected an Observability instance, but received a
   > config object. Import and instantiate: import { Observability, MastraStorageExporter }
   > from \"@mastra/observability\" … **Observability has been disabled.**"*
   Emitted through `this.#logger?.warn(...)`. It is a warning, not a throw.
7. `dist/observability/types/core.d.ts:296` — core's own acknowledgement that the
   implementation may simply be absent: *"Returns `undefined` when no implementation is
   registered (e.g. `NoOpObservability`, or when `@mastra/observability` is not installed)."*
8. `@mastra/core@1.56.0` `package.json` — `@mastra/observability` is **not** a dependency, not
   a peer dependency and not an optional dependency.
9. **The Package-B lock** (`5e8b2b4e…`, 260 packages, enumerated) contains **no**
   `@mastra/observability` and no OpenTelemetry package.
10. Embedded docs (`dist/docs/references/reference-observability-tracing-instances.md`)
    document `DefaultObservabilityInstance` and `BaseObservabilityInstance` — confirming they
    exist in the product family, and (by 1–3) that they are not in core.

**Why it matters.** The Lead's *conclusion* survives — the failure class *"Mastra offers no
public export/correlation seam, therefore Conexus must cross-read `mastra_builder`/`mastra_par`
or make Mastra storage authority"* is **not** an unresolved pre-C-018 blocker, because a
public `ObservabilityExporter` interface and a public `observability` config field do exist.
But the Lead's *basis* is wrong in a way that matters twice:

1. **Reachability.** Handoff §16 E-A question 3 — *"Can a custom exporter be registered
   through public imports in the exact pin?"* — is **NO** on the exact Package-B lock alone.
   Both routes (constructor `observability` and `registerExporter`) require a concrete
   `ObservabilityEntrypoint`/`ObservabilityInstance` that core does not provide. The only
   admissible alternative to installing `@mastra/observability` would be Conexus hand-writing
   an `ObservabilityEntrypoint` + `ObservabilityInstance` — which is exactly the
   "patching framework internals" that handoff §16 E-F sets as the sufficiency test, and which
   would recreate a vendor subsystem inside Conexus.
2. **Admission.** `@mastra/observability` is a **new external package that appears in no
   qualification manifest**. `3L-Q0` §6 requires C-016 supply-chain admission and forbids
   adopting a release because its dist-tag says `latest`; `3L-Q0` §5.2 requires one exact
   committed lock closure with recorded integrity. Deferring E without naming this dependency
   means a coding actor discovers it at first-build and resolves a version with no pin, no
   admission and no requalification trigger — while `3L-Q0` §6's compromised-version deny set
   shows the Mastra supply chain has a real prior incident.

There is also a reachable **silent** failure: evidence item 6 shows that the natural mistake —
passing a plain config object — disables observability with only a `warn`. Nothing throws and
nothing is missing at the type level for a JS caller.

**Failure / counterexample.**

```text
Package E deferred on the stated basis "the exact core pin exposes usable observability surfaces"
→ first-build implements a Conexus ObservabilityExporter against the core interface (correct)
→ registers it via new Mastra({ observability: { configs: { default: { exporters: [ConexusExporter] } } } })
→ core logs one warning and DISABLES observability
→ zero spans ever reach Conexus OBS
→ nothing throws; the exporter object exists; the code reads correct
→ the first honest signal is a verification assertion returning NOT_PROVEN for missing
  runtime evidence — correct behavior, but the root cause is a silently disabled subsystem
```

**Recommended disposition:** `DEFER_SAFELY` **with `CORRECT_REDERIVATION`** of the stated
basis. Specifically, the rederivation must record:

```text
KNOWN   @mastra/core 1.56.0 exposes ObservabilityEntrypoint / ObservabilityInstance /
        ObservabilityExporter / ObservabilityBridge / CorrelationContext /
        ObservabilityDropEvent as PUBLIC TYPES, plus NoOpObservability, and the
        Mastra config field `observability?: ObservabilityEntrypoint`.

KNOWN   The concrete implementation (Observability, DefaultObservabilityInstance,
        BaseObservabilityInstance, MastraStorageExporter, MastraPlatformExporter) is NOT in
        @mastra/core 1.56.0 and is NOT in the Package-B lock 5e8b2b4e….

KNOWN   Passing a config object instead of an entrypoint instance disables observability with
        a logger warning only.

NAMED   @mastra/observability = required F1 realization dependency, version UNPINNED,
        C-016 admission NOT PERFORMED, lock closure NOT FROZEN.
        Requalification trigger: first acquisition; any later version drift.

REJECT  Conexus hand-implementing ObservabilityEntrypoint/ObservabilityInstance.
```

**New Product requirement or architecture authority required?** NO. This is a correction of a
factual basis plus the naming of an ordinary realization dependency under existing C-016 /
`3L-Q0` §5.2/§6 law. It creates no new owner, record, module or observability service.

**Probe impact:** `NONE`. Explicitly **not** `ADD_BOUNDED_E_PROBE`: handoff §16 E-A question 8
asks whether a tiny pre-C-018 instantiation probe is required — it is **not**, because source
inspection closed the question, and a probe would necessarily require acquiring the
unadmitted package, which the review boundary and C-016 both forbid. Handoff §16 E-H
Alternative B is the Global Maximum and has now been executed.

---

## FBL-E2 — `ObservabilityDropEvent` covers exactly two reasons; most loss classes are silent

```text
Finding ID: FBL-E2
Package:    E
Severity:   NON_MATERIAL
Category:   evidence precision / overclaim prevention
```

**Claim challenged.** Handoff §14.2 lists *"drop-event notification"* among the observed
surfaces supporting deferral, and §16 E-B warns against overclaiming detectability.

**Exact source Evidence** — `@mastra/core@1.56.0`
`dist/observability/types/core.d.ts`:

```ts
export type ObservabilityDropSignal = 'tracing' | 'log' | 'metric' | 'score' | 'feedback';
export type ObservabilityDropReason = 'unsupported-storage' | 'retry-exhausted';
export interface ObservabilityDropEvent {
  type: 'drop'; signal: ObservabilityDropSignal; reason: ObservabilityDropReason;
  count: number; timestamp: Date; exporterName: string; storageName?: string;
  error?: ObservabilityDropError;
}
```

Silent-by-design loss paths in the same file / embedded config docs:
`sampling` (`NEVER` / `RATIO` / `CUSTOM`), `excludeSpanTypes`, `spanFilter`,
`spanOutputProcessors`, `serializationOptions` truncation (`maxStringLength` 1024,
`maxDepth` 6, `maxArrayLength` 50, `maxObjectKeys` 50), plus process loss before `flush()`,
an exporter never initialized, and the `NoOpObservability` path of `FBL-E1`.

**Why it matters.** Detectable loss is exactly `unsupported-storage` and `retry-exhausted`.
Everything else — sampling, filtering, truncation, crash-before-flush, uninitialized exporter,
and downstream collector/backend loss after a successful local export — is invisible to the
framework. Silent truncation is particularly relevant: a required observation whose payload
exceeds the serialization limits is exported *successfully* but *incompletely*, with no drop
event.

This does **not** create a pre-C-018 blocker. It confirms the accepted law is the right one:
`3C-13` §13 — *"required runtime evidence missing → that assertion = NOT_PROVEN / INCONCLUSIVE
→ never PASS by absence"* — is an **owner/verifier policy that is independent of drop events**
and does not need guaranteed delivery to be correct.

**Failure / counterexample.**

```text
Realization treats onDroppedEvent as the completeness signal
→ "no drop events therefore telemetry is complete"
→ sampling RATIO 0.1 is configured for cost
→ 90% of spans never existed and never dropped
→ a verification assertion silently passes on partial evidence
→ 3K-02's explicit defect list ("observação promovida visualmente a verificação") is realized
```

**Recommended disposition:** `CORRECT_REDERIVATION` — record the exact two-value enum and the
silent-loss list as `KNOWN`, and state explicitly that drop events are **not** a completeness
signal.

**New Product requirement or architecture authority required?** NO. A mandatory
outbox/collector would be overengineering: `3H-03` §17 already sets the bar —
*"Queue/outbox só se torna justificável se aparecer uma concrete proposal whose correctness
requires durable delivery and the proposal cannot be deterministically re-derived/replayed"* —
and no current criterion meets it.

**Probe impact:** `NONE`.

---

## FBL-E3 — `requestContextKeys` is a concrete, framework-supported path from stale runtime state into telemetry

```text
Finding ID: FBL-E3
Package:    E
Severity:   NON_MATERIAL
Category:   producer trust / first-build negative fixture
```

**Claim challenged.** Handoff §16 E-C's attack: *"candidate or guest stamps
ActorRunId/AgentRunId → exporter forwards it → OBS accepts it as HUB_AUTHORITY."*

**Exact source Evidence.** `@mastra/core@1.56.0` `ObservabilityInstanceConfig`:

```ts
/** RequestContext keys to automatically extract as metadata for all spans created with this
 *  observability configuration. Supports dot notation for nested values. */
requestContextKeys?: string[];
```

`CorrelationContext` additionally carries `userId`, `organizationId`, `resourceId`, `runId`,
`sessionId`, `threadId`, `requestId`, `entityId`, `entityVersionId`, `environment`, `tags`.

**Why it matters.** Combined with accepted Package-B Evidence — `BT-3`: *"unknown stale
omitted key survives"* (`current/README.md` §7) — this is a concrete mechanism by which a
stale or runtime-supplied value is **auto-promoted to span metadata** and forwarded to an
exporter, arriving at OBS looking like a first-class correlation field.

It is **not** a framework blocker. The correct rule is already accepted architecture:

- `3H-03` §18: *"In-process callback não confia no run identity fornecido pelo producer
  payload … dispatch-scoped closure/opaque handle binds A"*;
- `3H-03` §10: *"Nenhum `traceId` pode substituir `ActorRunId`/`AgentRunId` ou vice-versa"*;
- `3C-13` §9: `HUB_AUTHORITY | GATEWAY_AUTHORITY | PROVIDER_OBSERVED | GUEST_OBSERVED`
  producer-trust classes are mandatory;
- `3L-R1` §4 corrected stale-authority invariant: no preserved runtime value may become
  current Conexus authority.

**Failure / counterexample.**

```text
Realization sets requestContextKeys: ['agentRunId','projectId'] for convenience
→ a resumed run's stale snapshot key survives (BT-3 proven behavior)
→ the exporter stamps the stale agentRunId onto every span
→ OBS ingests it without server-side rebinding
→ observations are attributed to the wrong owner run, and the attribution looks authoritative
```

**Recommended disposition:** `CORRECT_REDERIVATION` — record `requestContextKeys` by name in
the Package-E first-build negative-fixture list, so the fixture targets a real mechanism rather
than a hypothetical one. The owner-side rules to freeze: owner IDs are bound at the ingestion
boundary from server-side dispatch context; runtime-supplied IDs are retained as
cross-check observations only; mismatches are diagnosed, never silently accepted.

**New Product requirement or architecture authority required?** NO.

**Probe impact:** `NONE`.

---

## FBL-E4 — `MastraStorageExporter` is the wrong default for Conexus OBS and must be named as rejected

```text
Finding ID: FBL-E4
Package:    E
Severity:   NON_MATERIAL
Category:   vendor-table cross-read prevention
```

**Claim challenged.** Handoff §16 E-F; and handoff §13's *"Do not create by default: mandatory
`MastraStorageExporter` authority path."*

**Exact source Evidence.**

- `@mastra/core@1.56.0` embedded doc
  `reference-observability-tracing-configuration.md`, `ObservabilityRegistryConfig`:
  > **default** (`{ enabled?: boolean }`): *"Enable default configuration with
  > MastraStorageExporter and MastraPlatformExporter"*
- `dist/mastra/index.d.ts` example: `observability: new Observability({ configs: { default: {
  serviceName: 'mastra', exporters: [new MastraStorageExporter()] } } })`.
- `dist/storage/domains/observability/base.d.ts` — observability storage is a Mastra storage
  domain, i.e. it writes into the configured Mastra store.

**Why it matters.** `3E-01` §10 is unambiguous: *"Nenhum módulo Conexus consulta tabelas
`mastra_*` diretamente"*, and `3E-01` §4 / `3E-02` place any ref to/from `mastra_*` in Tier 3
with no FK. Under the accepted role topology (`3L-B-final-lead-closure` §5), `MastraStorageExporter`
would write Builder observability into `mastra_builder` and PAR observability into
`mastra_par`. Conexus OBS could then only reach it by cross-reading vendor tables — the exact
prohibited integration — or by promoting Mastra storage to a second current-state authority.

The **correct** path is the one `FBL-E1` establishes as reachable: a Conexus-authored class
implementing the public `ObservabilityExporter` interface, receiving `onTracingEvent` /
`onLogEvent` / `onMetricEvent` / `onScoreEvent` / `onFeedbackEvent` / `onDroppedEvent` /
`exportTracingEvent`, and writing into `obs.operational_event` under Conexus producer-trust
stamping. That path uses public imports only, needs no deep imports and needs no vendor-table
read.

Role attribution is preserved natively: `ObservabilityInstanceConfig.serviceName` is per
instance, and `BuilderMastra`/`ParMastra` each take their own entrypoint — satisfying
`3H-03` §12's requirement that role attribution be mechanical rather than inferred from PID or
port. Enabling `default: { enabled: true }` alongside a Conexus exporter is admissible **only**
as Studio/dev diagnostics and must never become a Conexus read path.

**Failure / counterexample.**

```text
Realization enables the documented default configuration for convenience
→ traces land in mastra_builder / mastra_par
→ Conexus OBS has no events of its own
→ the shortest path to a verifier query becomes "SELECT from mastra_par.…"
→ 3E-01 §10's prohibition is violated, and Mastra storage becomes a second current-state authority
```

**Recommended disposition:** `CORRECT_REDERIVATION` — name `MastraStorageExporter` /
`default: { enabled: true }` explicitly in the Package-E non-build list as *diagnostics-only,
never a Conexus OBS read path*, and name the custom `ObservabilityExporter` as the F1
integration seam.

**New Product requirement or architecture authority required?** NO.

**Probe impact:** `NONE`.

---

# E. Direct answers

### 1. Is a future-dated `QUEUED` JobRun compatible with current Release handoff law? — **CONDITIONAL**

Compatible **only** if the rederivation freezes a last-mile rule and a terminal settlement
meaning. `3A-R9` §10 protects a run that *began* (`iniciou`); a pre-admitted occurrence has
not begun, and §19's terminal set contains no honest settlement for "refused because the
current composition changed". `3G-05` §7 and `3G-08` §13.2 both resolve the Release at
*admission = fire time*, so the candidate introduces an interval-long exposure window the
accepted PAR model does not have. See `FBL-D2`. Alternative C removes the question entirely.

### 2. Is the rolling JobRun candidate still an occurrence rather than hidden `JobSchedule` authority? — **CONDITIONAL**

It remains an occurrence **provided** three properties hold, and only the third is currently
guaranteed by the candidate as written:

```text
(a) recurrence intent derives only from Project Baseline + exact served Release + job
    composition, never from any field on mar.job_run                      → holds by construction
(b) mar.job_run carries no mutable recurrence policy (interval, enabled, timezone, next-due
    as an editable value)                                                 → must be stated; the
    candidate's "its startAfter controls the next recurrence" wording is
    precisely the sentence that would make it a schedule table
(c) queue rows are reconstructible and never read as production truth     → holds; 3E-02 already
    classifies queue/scheduler substrate as an internal seam
```

Under Alternative A the set of "one always-maintained future row per composition" is
*functionally* a next-due table even if no column is editable. That is survivable, but only if
(b) is frozen as an explicit invariant and the next-due value is **derived on read** from
Release/job composition + sync freshness, never *stored as intent*. See `FBL-D5`.

### 3. Is the proposed reconciliation narrow owner mechanics rather than a custom scheduler/outbox? — **YES**

The minimum responsibility set — detect missing projection, derive next intended occurrence,
admit at most one catch-up, repair projection, handle Release handoff — requires **no** durable
state beyond `mar.job_run` and existing Release/job authority, **no** durable cursor, **no**
lease, **no** dispatcher, **no** calendar and **no** event log. It is not an outbox: an outbox
exists to make a *pending intent* durable, and here the durable intent already exists as the
owner `JobRun`. `3A-R10` §10 already pre-authorizes this exact disposition
(*"smallest reconciliation/transaction mechanism; outbox only if evidence proves necessary"*).

An implementation actor would **not** be forced to invent a `SchedulerModule`, on one
condition: the reconciler must remain a MAR-internal use case with no per-job schedule record.
Under Alternative C it additionally needs a wake tick, which is process-local mechanics
(`setInterval` in MAR, or one platform housekeeping tick) — not a scheduler domain, because it
holds no schedule state.

### 4. Is rejecting pg-boss native cron as the sole managed-sync baseline justified? — **YES**

Confirmed from exact source, not from the upstream issue alone. `src/timekeeper.ts`:

```ts
shouldSendIt (cron, tz) {
  const databaseTime = Date.now() + this.clockSkew
  const interval = CronExpressionParser.parse(cron, { tz, strict: false, currentDate: new Date(databaseTime) })
  const prevTime = interval.prev()
  const prevDiff = (databaseTime - prevTime.getTime()) / 1000
  return prevDiff < 60
}
```

A slot missed by more than **60 seconds** is permanently skipped, and
`docs/api/scheduling.md` states *"At least one instance needs to be running for scheduling to
work."* Cron alone therefore cannot satisfy `3A-R9` §14's one-catch-up law: after downtime it
delivers **zero** catch-up, not one.

Two qualifications on the *scope* of the rejection:
- rejecting cron as the **sole admission baseline** is justified; rejecting cron as a **wake
  tick for an owner reconciler** is **not** justified by this evidence, because a missed wake
  costs only latency under a freshness-driven reconciler (see `FBL-D4`);
- handoff §8.4's additional reason *"using cron rows as practical current truth risks authority
  drift"* is sound but applies equally to any queue row, and is already covered by `3A-R9` §9.

### 5. Is rejecting Mastra Scheduler as the MAR baseline justified? — **YES**

Justified on ownership *and* on measured total complexity, not on framework name:

```text
(a) MAR is not an agent runtime. BT-4N qualified native scheduling for PAR only:
    "native Mastra schedule row → deterministic run identity → PostgreSQL CAS claim →
     one-step workflow ingress → guarded PAR admission"        (3L-B-BT4N-lead-adjudication §2)
    Its §5 explicitly excludes MAR concerns: single-flight, SKIPPED/no-backlog, Release
    selection, owner occurrence cursor.

(b) It would require a THIRD Mastra instance and a THIRD vendor database. 3E-01 §2 ratifies
    exactly mastra_builder and mastra_par; 3A-R9 §31 sets new database/schema = 0; handoff §19
    lists "third Mastra instance for MAR" as requiring a named failure class. None exists.

(c) It structurally forecloses the property DT-1 exists to establish. Mastra schedule rows
    live in a mastra_* database; mar.job_run lives in hub_control. Cross-database atomicity is
    impossible, so the persist→enqueue window (3A-R9 CE-9) would be reintroduced by
    construction — a strictly worse position than pg-boss under FBL-D1 branch (i).

(d) BT-5N's isolation qualification is bound to exactly two role instances and to the currently
    ENABLED F1 surfaces (3L-B-final-lead-closure §6). A third role instance requires
    requalification before use.

(e) The value of the Mastra scheduler is agent/workflow targets. A deterministic MAR sync has
    no Agent, no model and no workflow — every distinctive capability would go unused.
```

### 6. Does same-transaction owner + queue insertion fit the accepted F1 topology? — **NO (as ratified today)**

The pg-boss API supports it: `docs/api/adapters.md` documents
`interface Db { executeSql(text, values): Promise<{rows}> }`, accepted per call by `send()`,
with *"When the ORM transaction is rolled back … all pg-boss operations executed through the
adapter are rolled back as well"*; `src/manager.ts` confirms `const db = wrapper || this.db`.
No ORM is required — a raw `pg` client wrapper satisfies the interface.

But the **accepted topology does not currently permit it**, because it does not place the queue
substrate anywhere. Architecture Baseline §6.5 closes `hub_control` at *"exactly 13 owner
schemas"* with *"no shared/common schema"*; `3E-01` §3 mandates a single ordered migration
lineage with no independent per-module DDL stream; `3E-01` §10's ratified precedent for
vendor-managed DDL is a **separate database**. pg-boss requires a schema, `CREATE` privilege
and its own migrations at `start()`. See `FBL-D1`. This is the split prerequisite.

### 7. Does DT-1 contain every remaining load-bearing external Package-D assumption? — **NO**

It contains more than remains external, and less than remains unresolved:

```text
already source-resolved, should not consume probe budget:
  native cron 60-second window; live-instance requirement; explicit id; startAfter;
  db adapter contract and rollback semantics; retryLimit=0 fencing automatic redelivery;
  cancel ≠ handler abort; job.signal existence and its two abort triggers;
  ON CONFLICT DO NOTHING → null; retention defaults; policy partial-index predicates
                                                                            → FBL-D6, FBL-D8

genuinely external and unresolved (U1, U2):
  atomicity of the composed owner-INSERT + send() through one transaction in the pinned path;
  exact observable behavior of the losing transaction under concurrent same-occurrence admission

unresolved but NOT external — must be decided, not probed:
  queue-substrate placement and DDL lineage                                  → FBL-D1
  admission model A vs C                                                     → FBL-D4
  Release-handoff settlement of a pre-admitted occurrence                    → FBL-D2
  next-due formula                                                           → FBL-D5
  identity/fence rule and null-handling                                      → FBL-D3
```

### 8. Does DT-1 include any Product proof that must be removed? — **YES, in part**

`P7` (downtime → one late occurrence, not an N-slot backlog) and `P8` (projection
reconstruction) as written assert **Product recurrence semantics**, not substrate properties.
Whether an N-slot backlog appears is decided entirely by the owner's next-due formula
(`FBL-D5`); no substrate behavior forces or prevents it. `P8` must narrow to the `QUEUED`
case (`FBL-D7`). `P3`/`P5` are genuine substrate properties but are load-bearing only under
Alternative A (`FBL-D4`). `RED-4` (native cron-only catch-up) is now redundant — the 60-second
window is source-proven, and re-demonstrating it at runtime adds nothing.

### 9. Does any deferred D criterion still risk expensive structural retrofit? — **YES — exactly two, and neither is fixed by DT-1**

```text
(1) Release-handoff settlement of pre-admitted occurrences (FBL-D2). Discovering at first-build
    that the terminal set cannot honestly represent "superseded" forces either a dishonest
    CANCELLED settlement or a late lifecycle amendment after mar.job_run semantics are in code.

(2) The next-due formula (FBL-D5). Discovering at first-build that the chosen formula produces
    an N-slot backlog after downtime means reworking the admission path, the reconciler and the
    freshness projection together — 3A-R9 CE-4 is a ratified FAIL counterexample.
```

Both are cheap to close **now** as sentences in the rederivation, and expensive to close later.
Neither requires a probe. Everything else the Lead defers — single-flight, retry pins, cancel,
timeout settlement, `MANAGED_JOB` revalidation — is owner logic over already-closed authority
and is correctly routed.

### 10. Is `pg-boss cancel` correctly treated as distinct from MAR cancellation? — **YES**

`src/plans.ts` `cancelJobs` is a pure `UPDATE … SET state = 'cancelled' WHERE … AND state <
'completed'` — note that `state < 'completed'` includes `'active'`, so it can flip a row whose
handler is still running, and it reaches no worker. So the distinction is correct.

The Lead's fact set is, however, incomplete in a risk-**reducing** direction: `job.signal`
(`AbortSignal`) *is* delivered per job and *is* aborted on local handler-execution timeout and
on pg-boss shutdown (`src/manager.ts` `#processJobs`, `failWip`). See `FBL-D6`. Consequence:
`3A-R9` §20's ordering is satisfiable without a new registry, and honoring `job.signal` becomes
a named first-build obligation.

### 11. Does the exact Mastra 1.56.0 lock expose a usable supported observability export seam? — **NO**

The **types and the config field** are in `@mastra/core 1.56.0`; the **concrete
implementation is not**, and `@mastra/observability` is absent from the Package-B lock
`5e8b2b4e…` (260 packages, enumerated). Core exports only `NoOpObservability`;
`DefaultObservabilityInstance` and `BaseObservabilityInstance` do not appear anywhere in
`dist/`; `registerExporter` demands a concrete instance *and* entrypoint from the caller; and
passing a config object logs a warning and disables observability. See `FBL-E1`.

The seam is **usable after** adding `@mastra/observability` under C-016 admission — which is an
ordinary realization dependency, but one that must be **named now** rather than discovered at
first-build.

### 12. Can that seam avoid direct cross-read of Mastra vendor tables? — **YES**

A Conexus-authored class implementing the public `ObservabilityExporter` interface receives
`onTracingEvent` / `onLogEvent` / `onMetricEvent` / `onScoreEvent` / `onFeedbackEvent` /
`onDroppedEvent` / `exportTracingEvent` and writes to `obs.operational_event`. Public imports
only; no deep imports; no `mastra_*` read; no public query API needed. Per-instance
`serviceName` preserves Builder/PAR role attribution as `3H-03` §12 requires.

The temptation is real and must be named as rejected: the documented `default: { enabled: true }`
configuration installs `MastraStorageExporter`, which lands observability in
`mastra_builder`/`mastra_par` and makes vendor-table cross-read the shortest path. See `FBL-E4`.

### 13. Does Package E currently contain any load-bearing external unknown not already covered by A/B? — **YES — exactly one, and it is now closed by this review**

The only one was E-A: whether the exact Package-B lock can instantiate a supported observability
export path. Source inspection closed it (`FBL-E1`) with the answer **no, an additional package
is required**. That converts a load-bearing unknown into a named, admittable realization
dependency — no runtime probe, no new authority.

Everything else in Package E is Product composition over owners that do not yet exist
(`ActorRun`/`AgentRun` facts, F5 callbacks, OBS ingestion, required-evidence policy, guest
instrumentation, verifier consumer), or is already proven: Package A proved E2B physical
`sandboxId` binding (`3L-A` §4.3), and Package B proved the current Mastra runtime/isolation
properties.

### 14. Is Package E safe to defer to first-build + 3M + 3N/3O? — **YES, with the `FBL-E1` correction applied**

Deferral is safe because every remaining criterion needs Product objects that do not exist, and
the governing laws are already accepted and framework-independent: `3C-13` §13
(`required runtime evidence missing → NOT_PROVEN`), `3C-13` §7 (telemetry may degrade;
audit-required is fail-closed), `3C-13` §9 (producer trust classes), `3H-03` §16–18 (F5
separate from telemetry; run identity from owner dispatch context), `3H-03` §17 (queue/outbox
bar). A pre-C-018 harness would invent `ActorRun`, `AgentRun`, F5 callbacks, OBS ingestion and
a verifier — and would prove the fixture, not the composition. That is over-proof.

Deferral is safe **only if** the rederivation records `@mastra/observability` as a named,
unpinned, unadmitted dependency with a requalification trigger, and records the exact
drop-event enum so no one later mistakes drop events for a completeness signal.

### 15. Is any new module, durable record, database, outbox, collector, or backend required before C-018? — **NO, with one disclosure**

```text
new module                = 0
new durable record class  = 0        (mar schema stays {serving_route, job_run})
new Conexus domain schema = 0
new scheduler domain      = 0
outbox / dispatcher       = 0        (same-transaction admission, or owner reconciliation, closes the window)
OTel Collector            = 0
Sentry / Spotlight        = 0
ClickHouse / event bus    = 0
new evidence module       = 0
third Mastra instance     = 0
Product code              = 0
```

**Disclosure.** Two *external substrate* placements remain unresolved and must be decided
before, not during, implementation:

```text
1. the managed-job queue substrate has no ratified physical home, and every candidate home
   contradicts either the closed hub_control inventory / single-lineage law or the
   same-transaction property                                                     → FBL-D1
2. @mastra/observability is required for any real observability path and is in no lock,
   no manifest and no C-018 admission record                                     → FBL-E1
```

Neither is a new Conexus module, record, database or backend. Both are unadmitted external
substrate placements that the current rederivation would carry silently past ratification.

### 16. After Architecture-Lead adjudication and operator ratification, may `DT-1` be admitted? — **CONDITIONAL**

```text
NOT as currently specified.

Admissible if and only if, before ratification:
  1. FBL-D1 resolves to branch (i) — queue substrate co-located under MAR ownership inside
     hub_control, with the vendor DDL folded into the single migration lineage;
  2. FBL-D4 selects Alternative A over Alternative C (otherwise the delayed half is dropped);
  3. FBL-D2, FBL-D3 and FBL-D5 are frozen as owner-logic sentences in the rederivation text;
  4. DT-1 is narrowed to DT-1' (P1, P2, P4, P6, P9, P10 + RED-1..3), with P3/P5/P7 admitted
     only under (2), P8 narrowed per FBL-D7, and RED-4 removed as source-resolved.

If FBL-D1 resolves to branch (ii), DT-1 is NOT admissible and Package D becomes
DEFER SAFELY, with 3A-R9 §15's "mecanismo equivalente mínimo" proven as owner reconciliation
at first-build / 3M.
```

---

# F. Criterion disposition matrix

## F.1 Package D — all thirteen criteria

No criterion disappears. Basis cites the exact deciding authority or source.

| # | Criterion (3A-R9 §25 / 3A-R10 Package D) | Final stage / disposition | Basis | Reopen trigger |
|---|---|---|---|---|
| 1 | Fixed interval produces expected occurrence | **FIRST-BUILD** — formula frozen now in the rederivation; removed from DT-1 | `3A-R9` §12 freezes only the interval *number* as calibration; the next-due formula is unfrozen and is owner logic (`FBL-D5`). No substrate property decides it | any consumer needing cron/calendar/RRULE (`3A-R9` §29); measured drift breaking the freshness target |
| 2 | JobRun durable identity before physical execution | **PRE-C018 LOAD-BEARING SUBSTRATE PROOF** — DT-1' `P1`,`P2`,`P4` — **gated on `FBL-D1` branch (i)** | `3A-R9` §15 requires no execution without a durable JobRun and names the shared transaction as the preferred realization; `docs/api/adapters.md` supplies the mechanism; only the composed behavior is unproven (`U1`) | co-location refused → branch (ii) → owner reconciliation at first-build; pg-boss adapter contract changes |
| 3 | Persist→enqueue crash recoverability, no lost-work window | **PRE-C018** under branch (i) (DT-1' `P2`,`P4`, `RED-1`); **FIRST-BUILD + 3M** under branch (ii) | `3A-R9` §15 and CE-9; `3A-R10` §10 *"smallest reconciliation/transaction mechanism; outbox only if evidence proves necessary"* | evidence that reconciliation cannot close the window without durable pending state |
| 4 | Same-occurrence dedupe under restart/race | **PRE-C018 LOAD-BEARING** — DT-1' `P6`, `RED-2` (`U2`), with the identity rule frozen first | `3A-R9` §16; source shows `ON CONFLICT DO NOTHING` → `null`, no raise, and policy partial indexes excluding terminal rows (`FBL-D3`). The owner constraint must be the primary fence | pg-boss policy/index semantics change; queue policy change |
| 5 | Single-flight / coalesce on overlap | **FIRST-BUILD** | `3A-R9` §13 defines the exclusion unit as `Project + managed environment + logical job identity`; that is owner logic. No substrate concurrency limitation was found — `localConcurrency` defaults to 1 and queue policies `singleton`/`exclusive` are available as defence in depth | a real parallel-job consumer (`3A-R9` §29); multi-writer Hub topology |
| 6 | One catch-up after downtime, no N-slot backlog | **FIRST-BUILD** (formula) **+ PRE-C018 only under Alternative A** (DT-1' `P7`) | `3A-R9` §14 states the law in freshness-driven form. Under Alternative C no substrate property is involved at all (`FBL-D4`). Native cron cannot supply it either way — `prevDiff < 60` (`src/timekeeper.ts`) | a job whose per-occurrence fidelity is a business requirement (`3A-R9` §29) |
| 7 | Timeout settles honestly without unmerged cursor advance | **FIRST-BUILD + 3M** | `3A-R9` §18 separates `job_run`, `sync_state` and source Evidence; provable only with real JobRun + sync-state composition. Substrate contribution is bounded and known: `expireInSeconds` default 900 s, `failJobsByTimeout`, and local abort via `job.signal` | ETL evidence showing partial-progress truth is not representable by current owner facts |
| 8 | Retry preserves exact Release + job pins | **FIRST-BUILD** | `3A-R9` §11/§17. Source-resolved: `retryLimit: 0` disables automatic substrate retry (`failJobsByTimeout` terminalizes to `failed`), so retry is owner-owned and pins are trivially preserved (`FBL-D8`). No pre-C-018 runtime probe needed | a future effectful job needing substrate-level retry; `retryLimit` semantics change |
| 9 | Cancel blocks new retry/admission; best-effort interrupt | **FIRST-BUILD + 3M** | `3A-R9` §20; `cancelJobs` is SQL-only and does not abort the handler, but `job.signal` exists and aborts on local timeout and shutdown (`FBL-D6`). Owner intent + cooperative abort + honest settlement suffices; process-local handle is not the registry `3H-03` §17 forbids | evidence that cooperative abort is insufficient for a real effectful job |
| 10 | Scheduler projection reconstructible from durable Release/job authority | **PRE-C018 (narrowed)** — DT-1' `P9`; `P8` narrowed to the `QUEUED` case; **RUNNING-orphan → 3M** | `3A-R9` §9 (*"Se o substrate for perdido → current durable Release/job authority → reconstruct"*) and `3E-02` (queue rows are substrate mechanics). `FBL-D7` shows the stated rule set is incomplete and retention (`retentionSeconds` 14 d / `deleteAfterSeconds` 7 d) bounds it | retention config change; admission horizon approaching the retention window |
| 11 | Old Release cannot generate future scheduled runs after handoff | **FIRST-BUILD / Release proof — but the settlement rule must be frozen PRE-RATIFICATION** | `3A-R9` §10; `3G-05` §7/§8.1; `3G-08` §13.2. The candidate's pre-admission opens a window the accepted PAR model does not have, and `3A-R9` §19 has no honest terminal for it (`FBL-D2`) | selecting Alternative C removes the question; a job artifact revision changing across promotion |
| 12 | New Release does not start recurring work before its admitted serving state | **FIRST-BUILD / Release proof** | `3A-R9` §10 (`SERVED_VERIFIED` gate); `3G-08` §8.3. Source-level substrate qualification is independent of real serving-state composition — nothing here is external | `SERVED_VERIFIED` semantics change; a preview/candidate recurring consumer appears (`3A-R9` §22) |
| 13 | `MANAGED_JOB` Gateway context cannot widen authority | **FIRST-BUILD security / Gateway** | `3A-R9` §8 derives the caller context server-side from `JobRunRef`/`ProjectRef`/`ReleaseRef`/`ArtifactRevision`; `3D-02` requires last-mile revalidation. No external technology assumption is involved. DT-1' `RED-3` demonstrates only the generic queue-as-authority class, not Gateway admission | a job payload path that can influence Connection/Project/Release selection |

## F.2 Package E — all ten criteria

| # | Criterion (3A-R10 Package E) | Final stage / disposition | Basis | Reopen trigger |
|---|---|---|---|---|
| 1 | Exact `ActorRun`/`AgentRun` + candidate/output correlation | **`CX-OBS-V0-01`, immediately after the smallest implementing observability/correlation slice** | Cannot be proven truthfully before owner records exist; `3H-03` §10 anchors correlation on Conexus owner IDs, which do not exist yet | first implementing slice lands without the correlation seam |
| 2 | Mastra observations tied without becoming owner identity | **CORRECTED** — public seam source-known **but requires `@mastra/observability`**, absent from lock `5e8b2b4e…`; mapping remains FIRST-BUILD | `FBL-E1`: core ships `ObservabilityEntrypoint`/`ObservabilityInstance`/`ObservabilityExporter` types + `NoOpObservability` only; `registerExporter` needs concrete objects; config-object misuse disables observability with a warning | acquisition of `@mastra/observability`; any Mastra observability API change |
| 3 | E2B observation anchored by pinned physical `sandboxId` | **ALREADY PROVEN (bounded)** in Package A, with one honest narrowing | `3L-A` §4.3 proved physical `sandboxId` binding and the incarnation guard RED→GREEN. It proved **identity anchoring**, not that the provider exposes every required observation by pull — that remains first-build/3O | provider observation surface changes; a required observation proves unavailable by pull |
| 4 | Guest/app remains `GUEST_OBSERVED` | **FIRST-BUILD negative security fixture** | `3C-13` §9 mandates the trust classes; this is Conexus-side stamping, not external technology uncertainty. `FBL-E3` names `requestContextKeys` as the concrete mechanism the fixture must target | a producer path that reaches OBS without traversing the ingestion boundary |
| 5 | Producer cannot forge `HUB`/`GATEWAY` authority | **FIRST-BUILD negative** | `3H-03` §18 already requires run identity from owner dispatch context, not producer payload; `3C-13` §9. Exporter metadata creates no pre-C-018 blocker — but `CorrelationContext` carries `runId`/`userId`/`organizationId` and `requestContextKeys` auto-extracts, so the negative fixture is concrete (`FBL-E3`) | OBS accepting a runtime-supplied owner ID as authoritative |
| 6 | Required-evidence capture policy | **REALIZATION + FIRST-BUILD** | Policy is expressible without choosing a durable transport or backend; `3L-Q0` §12 keeps collector/backend optional | a verification assertion whose evidence cannot be re-derived or rerun |
| 7 | Dropped/missing required evidence → `NOT_PROVEN` | **FIRST-BUILD + 3M**, with the exact drop-event enum recorded now | `3C-13` §13 already makes this owner/verifier policy independent of drop events. `FBL-E2`: `ObservabilityDropReason` is exactly `'unsupported-storage' \| 'retry-exhausted'`; sampling, `excludeSpanTypes`, `spanFilter`, truncation, crash-before-flush and uninitialized exporters are silent | any criterion that would require guaranteed durable telemetry delivery |
| 8 | Telemetry outage never manufactures `PASS` | **FIRST-BUILD + 3M** | `3C-13` §12/§13; `3K-02` (observation must not be promoted to verification). One hidden default now named: a config object instead of an entrypoint instance silently disables observability (`FBL-E1` evidence 6) — a first-build negative fixture, not a pre-C-018 blocker | a framework default that emits a success-shaped signal in the absence of instrumentation |
| 9 | Valid F5 without telemetry still reaches owner truth | **FIRST-BUILD owner composition** | `3H-03` §16/§17: F5 is a narrow typed owner-bound callback, semantically separate from telemetry; Package B proved the runtime isolation and typed owner boundary slice. What remains is real F5 handlers and owner records | a proposal whose correctness requires durable delivery and cannot be re-derived (`3H-03` §17) |
| 10 | Telemetry complete without F5 cannot move owner truth | **FIRST-BUILD negative** | `3C-13` §4 (`Observed(X) != Authoritative(X)`); `3H-03` §16 (*"runtime emits complete trace -X-> owner terminal fact"*); `3L-R1` §4. This is owner enforcement; no framework behavior found that can bypass it — exporters emit events and never write owner state | a framework path that writes owner-visible state directly from telemetry |

---

# G. Strongest counterargument against this review's own verdict

**Stated at full strength, not weakened.**

> `FBL-D1` is over-read, and `STOP_SPLIT_PREREQUISITE` is ceremony that delays a probe whose
> outcome is not actually in doubt.
>
> Architecture Baseline §6.5 says *"exactly 13 **owner** schemas"*. `pgboss` is not an owner
> schema — it owns no Conexus meaning, exactly as `3E-02` already states:
> *"queue/scheduler substrate continua seam interno e não vira domain record/module apenas por
> existir async work."* The Baseline's actual prohibition is on a *shared/common* schema, and a
> vendor substrate schema is neither. `3A-R9` §15 — ratified after 3E-01 — already names the
> shared PostgreSQL transaction as the **preferred** realization, which necessarily implies
> co-location; a later ratified decision that presupposes co-location is stronger evidence of
> intent than an inventory sentence written before the queue substrate had a named consumer.
> `3A-R10` §10 pre-authorizes the disposition. On that reading the placement is a bounded
> realization detail an Architecture Lead can settle in one sentence, and this review has
> escalated an omission into a stop.
>
> The same over-reading infects the rest. `FBL-D4` proposes Alternative C as "strictly smaller",
> but C replaces a durable future row with a **process-local, non-durable timer** — trading a
> fact PostgreSQL guarantees for one that dies with the process, in a system whose entire
> doctrine is that durable owner facts beat runtime state. C also makes the sync cadence
> depend on an in-memory `setInterval`, which is precisely the "stale runtime state" class
> Conexus has spent three phases removing. And C does not actually eliminate `FBL-D2`: it only
> shrinks the admission→execution window from one interval to one tick, so the settlement rule
> is still needed — meaning `FBL-D2` argues for freezing a sentence, not for changing the
> admission model.
>
> Finally, `FBL-D8` proves too much. If reading official source can retire eight of ten probe
> properties, the same argument retires the remaining two: `docs/api/adapters.md` states
> plainly that *"all pg-boss operations executed through the adapter are rolled back as well"*,
> and `ON CONFLICT DO NOTHING` under a unique index has decades of well-defined PostgreSQL
> semantics. On this review's own logic, Package D should be `D_DEFER_SAFELY_CONFIRMED` — not
> a stop, not a narrowed probe. By admitting DT-1' at all, the review keeps a probe it has
> itself argued is mostly redundant.

**Why the verdict is nonetheless retained.** Three points, and the first is the one that
decides it:

1. **The counterargument concedes the finding while disputing its cost.** It agrees the
   placement is undecided and argues only that it is *cheap* to decide. That is precisely a
   split prerequisite: a small, unresolved decision that must land before the probe, because
   the probe's central property is untransferable without it. If the Lead settles it in one
   sentence, the stop costs one sentence.
2. **The A-vs-C argument is a genuine hit and is recorded as such.** This review does **not**
   recommend C; `FBL-D4` recommends *deciding* between A and C before probing, and the
   non-durable-timer objection is a strong argument for A. That the objection exists is the
   reason the decision must be explicit rather than implied by a probe's shape.
3. **On `FBL-D8`, the distinction is claim-relative evidence, not source-versus-runtime.** The
   documented adapter contract establishes that pg-boss *intends* to run SQL through the
   supplied executor. It does not establish that the pinned `send()` path performs **no**
   out-of-band work — and `src/manager.ts` shows it calls `await this.getQueueCache(name)`
   before the insert, a lookup that may use `this.db` rather than the supplied wrapper. Whether
   any part of the admission path escapes the caller's transaction is exactly the kind of
   composed behavior that documentation cannot settle and a real PostgreSQL can. `U2` is
   similar: the *losing* transaction's observable behavior — block, then `null`, versus block,
   then raise — determines whether the composition is fail-closed, and `FBL-D3` shows the
   ordinary `send()` path does **not** carry the `division_by_zero` guard that the flow path
   does. Those two are worth a bounded fixture. The other eight are not.

---

# H. Exact next action

> **Open a bounded prerequisite/source question before ratification.**

Exactly one question, scoped, and it does not reopen MAR, Release, Gateway, OBS or runtime
isolation authority:

> **Where does the managed-job queue substrate physically live, and under whose DDL lineage?**
> Specifically: does a vendor-managed substrate schema inside `hub_control`, owned by MAR with
> its DDL folded into the single ordered `hub_control` migration lineage, remain admissible
> under Architecture Baseline §6.5 (*"exactly 13 owner schemas"* / *"no shared/common schema"*)
> and `3E-01` §2/§3 — or does the ratified `mastra_*` vendor-DDL-confinement precedent of
> `3E-01` §10 place it in a separate database and thereby foreclose same-transaction
> co-admission?

Resolve that, then — in the same adjudication pass and before seeking operator ratification —
freeze `FBL-D2`, `FBL-D3`, `FBL-D5` as owner-logic sentences, decide `FBL-D4` (Alternative A
versus C), apply the `FBL-D8` classification correction, and apply the `FBL-E1`, `FBL-E2`,
`FBL-E3`, `FBL-E4` corrections to the Package-E rederivation text. Only then is the D/E
disposition ratifiable, and only then — under branch (i) with Alternative A — may a bounded
`DT-1'` plan be written.

This review authorizes no code execution, no probe, no dependency acquisition, no
ratification and no merge.

```text
Package D          = STOP_SPLIT_PREREQUISITE
Package E          = E_DEFER_SAFELY_CONFIRMED_WITH_BOUNDED_CORRECTION
new module         = 0
new durable record = 0
new database/schema (Conexus domain) = 0
new scheduler domain = 0
new observability backend = 0
Product code       = 0
C-018              = NOT RATIFIED
implementation     = BLOCKED
PR #40 merge       = NOT AUTHORIZED
```
