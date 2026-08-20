# 3J Fable Dialogue — Operational State, Backup & Restore

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3J — Deployment / Operations Architecture  
**Candidate:** `3J-02 — Operational State, Backup & Restore Architecture`  
**Purpose:** converge the smallest complete recovery-set architecture for the first production installation after approved 3J-01. Do not create authority or product code from this file.

## 1. Canonical state to reconstruct

Read `AGENTS.md` and canonical authority independently.

Expected state:

```text
3A-R6 = APPROVED
3B..3I = CLOSED / APPROVED
3J-01 = APPROVED
3J = IN PROGRESS
```

3J-01 freezes only the first physical topology:

```text
operator WSL2 = development/proving
company server → dedicated Linux VM = first production
one Hub application process
Postgres/Mastra/local backings co-located
private LAN/VPN + HTTPS
no public ingress
single failure domain accepted
```

3J-02 must answer what survives loss of that domain and how recoverability is proved. It must not redesign topology, Product semantics or 3M recovery state machines.

## 2. Product guardrail

C-001 remains product vision authority. Metal Nobre is the first real internal consumer; backup architecture protects **Conexus platform/project authority generally**, not a Sankhya-specific system.

No backup decision may hardcode one ERP/integration as the platform's truth model.

## 3. Root cause

A list such as "backup Postgres and attachments" is insufficient because current authority also depends on:

```text
immutable Release/frontend bytes
Registry/Brain/CAS payloads depending on physical realization
CredentialBackend encrypted backing
Mastra PAR substrate continuity
Git-first source authority
PostgreSQL roles/extensions/recovery metadata
keys required to decrypt recovered material
```

Conversely, backing up every cache/runtime artifact creates restore complexity without protecting authority.

Root invariant:

> **Everything non-reconstructible that is required to re-establish current or historically admissible Conexus authority must have an off-host recoverable copy; reconstructible/substrate data is backed up only when its loss would violate an approved continuity property. Recovery must be proven, not inferred from file existence.**

## 4. Existing authority — do not redesign

### C-006 Project Data precedent

Already frozen:

```text
pg_dump -Fc per Project
pre-migration dump
recovery manifest (major/extensions/roles/memberships/grants)
encrypted off-host Backblaze B2 copy
restore-test from B2
roll-forward first
PITR only on real RPO/RTO trigger
```

### C-015 storage ordering precedent

Current backup consistency precedent is equivalent to:

```text
GC/retention mutation fenced as required
→ hub_control dump first
→ enumerate Project DBs/content refs from owner truth
→ Project dumps / referenced bytes
→ integrity/recovery manifest
```

No cross-store distributed transaction is implied.

### 3E-01

```text
mastra_par MUST participate in backup/restore
mastra_builder is deliberately lower durability
```

### 3I-02

```text
CredentialBackend backing is recoverable
root/recovery key does not share one non-Hub loss/compromise path with ciphertext backup
write-once backing + durable-before-visible publication
```

### 3J-01

Single-host loss is accepted. Recovery is off-host copy + repaired/replacement host + manual restore. Exact RPO/RTO is owned here.

## 5. Backup classification rule

Do not maintain an ad hoc filename checklist as authority.

For any persisted class `X`:

```text
required backup if:
  current/historical admissible owner truth references X
  AND no accepted source can reconstruct exact required semantics/bytes

reconstructible if:
  accepted canonical source + deterministic/reliable realization recreates X
  AND loss does not erase required history/continuation authority
```

Digest-addressed bytes are not reconstructible merely because source code exists. Byte-identical rebuild must be proven before downgrade.

## 6. Candidate required recovery set

### R1 — `hub_control` — REQUIRED

Contains current platform/domain authority across 13 schemas and 46 durable classes.

Backup requires database dump + recovery manifest sufficient to recreate major/extensions/roles/grants/ownership properties.

### R2 — production Project DBs — REQUIRED

Every production Project DB referenced by the captured Hub authority is included.

Validation/QA temporary DBs are excluded.

### R3 — `mastra_par` — REQUIRED

Reason: Production Agent conversations/thread/checkpoint substrate can be required for approved continuation semantics.

It remains substrate, not domain authority. Restore never allows Mastra state to override PAR owner facts.

### R4 — `mastra_builder` — NOT REQUIRED BY DEFAULT F1

Builder authority/history lives in Conexus records/Git/output custody. Persistent Builder cognition is useful but losing it may force `FRESH_BASE`; it does not by itself erase domain authority.

Therefore:

```text
routine production backup obligation = NO
```

Reopen if qualification/implementation proves an approved non-reconstructible Builder continuation property actually depends on this store.

### R5 — non-reconstructible digest-addressed bytes — REQUIRED BY CLASS

At minimum, mechanically enumerate bytes referenced by captured owner facts that are needed for current/historical admissible use, including as physically applicable:

```text
Attachment bytes
active Release frontend dist
rollback/admissible Release frontend dist
ArtifactRevision payloads realized outside DB rows
BrainPack / brain-binding payloads realized outside DB rows
other immutable CAS payloads referenced by retained owner history
```

Rule:

```text
owner fact retained
+ referenced bytes not provably byte-identical reconstructible
→ bytes remain in recovery set
```

Do not create global cross-domain refcount authority; enumeration consumes owner refs/manifests.

### R6 — CredentialBackend encrypted backing — REQUIRED

A restored `credential_ref` without corresponding decryptable backing is not a successful restore.

Capture backing objects required by the `hub_control` snapshot. Extra orphan ciphertext is tolerable; dangling live refs are not.

### R7 — canonical Git source authority — REQUIRED OFF-PROVIDER COVERAGE

C-005 is git-first; Git provider loss cannot silently erase source authority.

Candidate smallest realization class:

```text
periodic provider-independent git bundle/archive
→ same immutable off-host recovery set
```

This is not a Git mirror service, second SCM, sync daemon or multi-provider Git abstraction.

Local workstation/server clones remain derived and are not the backup contract.

Fable must attack whether this coverage is proportional or whether explicit GitHub-loss residual acceptance is the smaller correct F1 answer.

### R8 — recovery manifests/config needed to interpret backups — REQUIRED

Include enough non-secret metadata to identify at least:

```text
backup-set identity/timestamp
platform version / migration head
PostgreSQL major + required extensions
DB inventory
roles/grants/ownership reconstruction inputs
Project DB inventory
content/digest inventory + checksums
Mastra store compatibility identity where required
Git bundle refs/checksum where adopted
backup encryption/key-generation identifiers without secret bytes
```

Exact file format is Realization.

## 7. Secret/recovery-key separation

Backing up ciphertext while losing every decryption path is false recoverability.

Required property:

```text
production host + B2 ciphertext path lost/compromised
→ independent recovery material still exists
```

At least these classes must have an independent recovery path where applicable:

```text
CredentialBackend root/recovery key material
client-side backup encryption recovery material (e.g. rclone crypt class)
```

They must not exist **only** on the production VM or only inside the same B2 dataset they decrypt.

Exact offline/operator custody mechanism belongs to 3J-03/Realization, but 3J-02 owns the recoverability requirement.

## 8. Off-host backup survivability / immutability

A production-host credential must not be capable of destroying every recoverable copy.

Property:

> **Off-host backup generations remain recoverable after compromise of every credential continuously present on the production host.**

Current Backblaze B2 supports provider-native Object Lock/retention capable of preventing object modification/deletion until a retention deadline. This is deciding evidence that the already-approved B2 path can satisfy the property without a second backup provider. Exact mode/retention/app-key capabilities remain Realization/qualification.

Do not invent a custom immutability service.

If B2 qualification cannot satisfy the property with the selected account/bucket/credential model, return to Decision Loop before production activation.

## 9. Backup consistency model — honest, not globally atomic

There is no distributed transaction across:

```text
hub_control
Project DBs
mastra_par
filesystem/CAS
CredentialBackend backing
Git provider
B2
```

Do not claim a globally atomic snapshot.

Candidate sequence class:

```text
1. establish backup-set identity / fence GC destructive mutation where required
2. capture hub_control authoritative snapshot
3. derive required Project/content/backing inventory from captured owner truth
4. capture Project DB consistent dumps
5. capture mastra_par consistent backup/export according to qualified store behavior
6. capture required digest bytes + CredentialBackend backing
7. capture Git recovery bundles according to chosen coverage policy
8. produce checksummed recovery manifest
9. upload/commit immutable off-host generation
10. mark backup generation SUCCESS only after completeness verification
```

Writes may continue where prior authority allows; therefore the manifest records individual capture points. After restore, 3M owns semantic settlement/reconciliation of interrupted work rather than 3J pretending cross-store simultaneity.

## 10. First-launch RPO / RTO candidate

Operator accepted "some hours" of loss and hours of manual downtime.

Small explicit F1 target candidate:

```text
RPO target <= 6 hours for Hub/Project/current required authority set
RTO target <= 8 hours for manual restore to a replacement/repaired single host
```

Rationale:

- measured in hours as explicitly accepted;
- achievable with simple scheduled logical backup, no WAL/PITR/replication;
- strong enough that "daily backup" cannot silently become ~24h data loss;
- does not promise high availability.

Pre-migration/material schema-change checkpoint is additional and is not replaced by periodic cadence.

Fable must challenge 6h/8h for arbitrariness; if a less numeric architecture contract is sufficient without letting implementation actors choose an unacceptable cadence, propose it.

## 11. Backup cadence / pre-migration law

Candidate:

```text
periodic successful off-host generation at cadence satisfying RPO
+
mandatory affected-set checkpoint before material production schema migration
```

If the pre-migration checkpoint cannot reach verified off-host state, material migration fails closed unless an explicit operator emergency override is separately authorized/recorded under applicable authority.

Ordinary application serving need not stop merely because one scheduled backup failed; instead recovery posture becomes unhealthy and the next successful generation must restore the RPO contract. Stale recovery posture beyond accepted RPO must be visible to operations and blocks operations whose authority explicitly requires a fresh checkpoint.

## 12. Retention candidate

Do not build retention policy engine.

Preserve existing simple C-006 family and adapt it to the complete recovery generation:

```text
7 daily generations
4 weekly generations
```

But with a <=6h RPO, periodic intra-day generations need a bounded shorter retention to avoid unbounded storage. Candidate:

```text
last 48 hours of intra-day generations
+ 7 daily
+ 4 weekly
```

Exact lifecycle/Object-Lock interaction must preserve immutability for the protected window.

Fable should challenge whether this detail belongs in architecture or Realization; retain only what materially shapes recoverability/cost.

## 13. Restore proof

Artifact existence is not proof.

Required proof family:

```text
periodically retrieve a generation FROM the off-host provider
→ restore into independent non-production environment
→ reconstruct roles/extensions/config interpretation
→ restore hub_control
→ restore Project DBs
→ restore mastra_par where required
→ restore required digest-addressed bytes
→ restore/decrypt CredentialBackend backing with independent recovery material
→ verify Git bundle recoverability if adopted
→ run semantic assertions
```

Minimum semantic assertions include:

```text
Hub owner records readable and internally coherent
Project inventory matches manifest
Project DB known semantic query passes
normal privilege negative tests still hold
active Release exact digest bytes available
one retained rollback/admissible Release bytes available where applicable
CredentialHandle live ref resolves/decrypts without exposing plaintext to test logs
PAR owner facts remain authority over restored Mastra state
checksums/manifests match
```

Restore proof runs from B2/off-host copies, not merely local staging files.

Existing C-006 monthly restore-test cadence is the F1 baseline candidate for the full recovery set.

## 14. Promotion / deployment relationship

Backup is not a Release or Promotion authority.

```text
Project Promotion
!= platform backup generation
!= platform deploy
!= restore
```

Rollback remains Release/Promotion semantics from 3G/C-014; backup restore is incident recovery when the actual storage truth was lost/damaged.

Pre-migration checkpoint enables recovery but does not create automatic rollback.

## 15. Proving→production controlled carry-over

3J-01 prohibited silent copy.

If the operator later chooses to preserve proving-era durable state:

```text
source = explicitly identified proving environment
→ captured through the same classified recovery/export boundary
→ integrity/provenance verified
→ restored into clean production target under an explicit migration plan
```

It does not become production merely because a DB directory/dump existed.

Exact first cutover procedure belongs to post-C-018 Realization Planning; 3J-02 only admits the governed migration family.

## 16. Explicitly excluded from backup authority

By default F1:

```text
ephemeral validation DBs
runtime temp/cache
E2B sandbox state
provider/runtime traces as authority
ordinary derived Operational Telemetry where retention loss is acceptable
local Git checkouts/worktrees
mastra_builder
package caches/node_modules
rebuildable process/runtime projections
```

A class re-enters only if a current invariant proves it non-reconstructible.

## 17. YAGNI / rejected machinery

Do not create:

```text
backup domain module / BackupRecord aggregate
backup orchestration platform
second object-storage provider
continuous replication
managed-Postgres requirement
WAL archive / PITR / pgBackRest baseline
filesystem snapshot platform
ZFS/btrfs requirement
cross-store distributed snapshot coordinator
custom Object Lock service
Git mirror service
cross-domain global CAS refcount
DR region / warm standby
automatic failover
```

Use scripts/timers/provider-native storage capabilities in Realization unless a later failure class proves insufficient.

## 18. Boundary to 3J-03 / 3M / 3L

```text
3J-02 owns:
what must survive
RPO/RTO contract
backup completeness/immutability
key-path recoverability property
restore proof responsibility
pre-migration checkpoint requirement

3J-03 owns:
who/what runs backup timers operationally where needed
boot secret injection
service supervision
backup alerting surface/operating response
host replacement/startup/stop procedure
platform deploy sequence

3M owns:
what durable runs/effects/promotions mean after restore
orphan/lost/OUTCOME_UNKNOWN settlement
partial publication/recovery semantics

3L owns:
pinned Mastra store export/restore behavior if technology-specific proof is load-bearing
```

## 19. Reopen triggers

```text
measured RPO/RTO cannot be met with logical backup/manual restore
first non-reconstructible state class not covered by the class rule
B2/account cannot provide required immutability against host-held credentials
restore proof shows credential/key compromise-path coupling
Mastra PAR cannot be restored compatibly under selected version path
source Git scale makes periodic bundle coverage materially unsuitable
first compliance/customer requirement changes retention/DR
single-host topology itself reopens under 3J-01 trigger
```

## 20. Candidate outcome

```text
backup model = class-based, not filename-list authority
hub_control = REQUIRED
production Project DBs = REQUIRED
mastra_par = REQUIRED
mastra_builder = NOT REQUIRED BY DEFAULT
digest-addressed non-reconstructible referenced bytes = REQUIRED
CredentialBackend backing = REQUIRED
canonical Git off-provider coverage = CANDIDATE REQUIRED
recovery manifest = REQUIRED
independent recovery-key path = REQUIRED
off-host immutability against host credential compromise = REQUIRED
B2 reuse = candidate GLOBAL MAXIMUM
cross-store atomic snapshot = REJECT
RPO/RTO candidate = <=6h / <=8h
full restore proof = REQUIRED
new module/durable record = 0
PITR/replication/second provider = 0
```

## 21. Fable mandate

Reconstruct authority independently. Attack especially:

1. whether the class-based rule captures all non-reconstructible authority without backing up every substrate/cache;
2. whether `hub_control`, all production Project DBs, `mastra_par`, CredentialBackend backing and referenced immutable bytes are the correct required set;
3. whether excluding `mastra_builder` is consistent with 3H continuation/cognition laws;
4. whether active + retained admissible/rollback Release bytes must be backed up until byte-identical rebuild is proven;
5. whether canonical Git provider-loss coverage should be REQUIRED via cheap `git bundle`, or accepting GitHub-loss residual is more proportional;
6. whether B2 Object Lock/provider-native immutability is sufficient property-level answer without selecting exact mode/retention now;
7. root/recovery-key and backup-encryption-key separation: find any same-loss-path hole;
8. whether the cross-store capture sequence is honest without distributed snapshot semantics;
9. whether <=6h RPO / <=8h RTO is a justified bounded first-launch contract or arbitrary over-specification;
10. retention: decide what is architecture vs Realization and cut unnecessary detail;
11. whether monthly full restore proof from off-host copy is proportional and sufficient;
12. whether silent proving→PROD copy is closed while controlled migration remains possible;
13. whether any 3J-03/3M/3L concern leaked into this package;
14. whether the package accidentally designs Metal Nobre backup rather than Conexus platform recovery.

Return:

```text
Material Findings
corrected required/reconstructible classification
RPO/RTO adjudication
Git-loss adjudication
immutability/key-path adjudication
proof obligations
DEFER SAFELY / REJECT F1
reopen triggers
verdict = ACCEPT CANDIDATE | RESTRUCTURE | STOP
```

Append below, commit/push. Do **not** update `LEDGER.md`, do not create `3J-02` authority and do not touch product code.

---

## 22. Fable independent review

**Method:** DevelopmentConexus Engineering Method v1.0.0. Authority reconstructed independently on **2026-08-17** from `AGENTS.md → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities`: C-005 (git-first, registry immutable payloads), C-006 (backup precedent: `pg_dump -Fc`, pre-migration dump, recovery manifest, encrypted B2, monthly restore-test, PITR-by-trigger, DEV recriável), C-013 (`agent_event` append-only in Hub Postgres; evidence classes), C-014 (repo per app GitHub private; Promotion never rebuilds; rollback re-points to existing digests), C-015 (storage/backup ordering: GC fence → `hub_control` first → enumerate from owner truth → blobs + manifest; restore-test validates whole manifest; Sankhya = authoritative fiscal archive, Conexus cache NON_AUTHORITATIVE), 3E-01/3E-02 (`mastra_par` MUST / `mastra_builder` lower durability; closed record inventory incl. `obs` classes in `hub_control`), 3G-05/3H-01/3H-02 (approval suspension continuation; FRESH_BASE rebind), 3I-02 (C4 compromise-path law; §12.2 two-sided recovery proof; write-once backing), 3I-05 (T11/T12), 3J-01 (accepted failure model; no-silent-copy adjudication), LEDGER post-3J-01. Dialogue treated as challenger input only. Canonical state matches §1.

### 22.1 Verdict summary

**ACCEPT CANDIDATE** with three Material Findings folded into consolidation and five adjudications closed below. The class rule (§5), required set R1–R8, honest non-atomic sequence (§9), immutability property (§8) and key-separation property (§7) survive attack. The findings: the restore proof must run **once, completely, before production activation** — not first at month one (F-1); the restore-proof environment handles **real secrets and personal data** and needs production-equivalent custody + destruction discipline (F-2); and the candidate never states the **regenerable-operational-secret class**, leaving a coding actor free to put provider credentials into backups by convenience (F-3). No RESTRUCTURE; nothing approaches STOP. The package designs Conexus platform recoverability, not Metal Nobre backup — confirmed at 22.4.

### 22.2 Material Findings

#### F-1 — MATERIAL: first full restore proof must gate production activation

```text
claim attacked     §13 "periodically retrieve... monthly baseline" suffices
failure            monthly cadence starting AFTER go-live means the first
                   production month runs on an unproven recovery path —
                   exactly the "inferred from file existence" state the §3
                   root invariant forbids. 3I-02 §12.2 already demands the
                   two-sided recovery proof; 3J-01 demanded evidence before
                   placement facts became architecture. Same discipline
                   here: recoverability is a precondition of production,
                   not a scheduled discovery.
smallest fix       add to the decision text: "production activation
                   requires one prior SUCCESSFUL complete restore proof of
                   a real off-host generation (full §13 family, including
                   independent recovery material). The monthly cadence is
                   the ongoing baseline thereafter. A material change to
                   backup mechanism/provider/key model re-triggers one full
                   proof before it becomes the recovery contract."
```

#### F-2 — MATERIAL: restore-proof environment custody is unstated

```text
claim attacked     §13 proof family is complete
failure            the proof restores REAL hub_control, REAL production
                   Project DBs (personal data under LGPD; C-016 posture)
                   and decrypts REAL Connection credentials with the real
                   independent recovery material — into an "independent
                   non-production environment" with NO stated custody
                   class. As written, a coding actor could run monthly
                   restores onto an unmanaged machine, creating a periodic
                   uncontrolled copy of every secret and every personal
                   record the platform holds — a new compromise path that
                   3I-02/3I-05 never admitted.
smallest fix       freeze the property: "the restore-proof environment is
                   production-custody-equivalent for the duration of the
                   proof: same access restriction class, no telemetry/log
                   export of restored content, credential decryption
                   verified without materializing plaintext beyond the
                   check (§13 already says logs; extend to any output),
                   and the restored dataset + any recovery-material copy
                   are destroyed/wiped at proof completion. Proof evidence
                   is metadata/checksums/assertion results — never data."
                   Exact environment realization → Realization/3J-03.
```

#### F-3 — MATERIAL: the regenerable-operational-secret class is missing from the classification

```text
claim attacked     §6/§7/§16 cover all secret-adjacent classes
failure            operational provider credentials — E2B API key, Git
                   write credential, model-provider keys, B2 application
                   key, host TLS material, Hub token-signing key — appear
                   nowhere in the classification. Two silent failure modes:
                   (a) an implementer includes them in the backup set "for
                   completeness", violating 3I-02 owner-custody and C4
                   (secrets riding the ordinary encrypted-data path);
                   (b) the restore runbook has no stated path to working
                   credentials on a replacement host.
smallest fix       add the class: "REGENERABLE OPERATIONAL SECRETS — never
                   members of any backup set; recovery path = re-issuance/
                   re-provisioning under each owner's custody (provider
                   consoles, key regeneration). Hub token-signing key is
                   explicitly regenerable (outstanding short-TTL tokens die;
                   DEDICATED clients re-authenticate — 3I-04 semantics
                   unaffected)." Plus one custody line closing the account-
                   level path of §8: "the B2 MASTER/account credential is
                   operator-held off-host (independent-path family of §7);
                   the production host holds only the restricted application
                   key" — otherwise account takeover from the host defeats
                   Object Lock at the account plane.
```

### 22.3 Adjudications requested by the mandate

```text
RPO/RTO (Q9)        ACCEPT <=6h / <=8h as RECORDED OPERATOR CONTRACT
                    VALUES, not arbitrary over-specification. The
                    architecture property is "loss and recovery bounded in
                    explicitly recorded single-digit hours, with recovery
                    posture visible when stale" — an unnumbered contract
                    would let implementation drift to daily/24h silently,
                    which E4's "some hours" acceptance does not cover.
                    Changing the numbers is an operator CALIBRATION act
                    recorded in the LEDGER, not a reopen; breaching the
                    property class (days, or HA demands) reopens.
                    Add one proof consequence: a full generation must
                    complete + verify well inside the cadence window,
                    else the 6h contract is fiction (22.5 item 5).

Git-loss (Q5)       REQUIRED coverage via periodic git bundle — adjudicated
                    against residual acceptance. C-005 makes Git the source
                    authority of every artifact; residual acceptance would
                    hang platform authority continuity on one external
                    provider with zero mitigation, while the bundle rides
                    the already-required off-host set at marginal cost.
                    Add the enumeration rule the candidate omits: covered
                    repos derive from owner truth (Project→repo inventory
                    in the captured hub_control snapshot) PLUS the Conexus
                    platform repo itself. No mirror service — §17 stands.

Immutability (Q6)   B2 Object Lock as property-level answer is SUFFICIENT;
                    mode/retention/app-key capabilities stay Realization/
                    qualification with the §8 Decision-Loop return if the
                    account model cannot satisfy it. With F-3's master-
                    credential custody line, the account-plane hole closes.

mastra_par /        CONFIRMED as drafted. PAR approval continuation (3G-05
mastra_builder      suspensions lasting days) makes the PAR substrate part
(Q2/Q3)             of approved continuation semantics → REQUIRED, with
                    restored Mastra state never overriding PAR owner facts
                    (already stated, keep). Builder loss forcing FRESH_BASE
                    is exactly 3H-01's law — exclusion consistent; reopen
                    condition already correct in R4.

Release bytes (Q4)  CONFIRMED REQUIRED for active + retained admissible/
                    rollback Releases until byte-identical rebuild is
                    proven. C-014 forbids rebuild-on-promote and rollback
                    re-points to EXISTING digests — losing those bytes
                    silently deletes rollback capability and falsifies
                    SERVED_VERIFIED. R5 as written captures this; keep the
                    downgrade path as a named reopen only.

Retention (Q10)     CUT the ladder from architecture. Freeze only the
                    properties: (a) retained generations span >= the
                    protected window with at least one provably-good
                    generation always inside it; (b) pre-migration
                    checkpoints retained until a superseding good
                    generation exists; (c) immutability window covers every
                    protected generation; (d) storage bounded. The
                    48h/7d/4w ladder becomes the evidence-based Realization
                    default (C-006 family), numbers = calibration.

Sequence (Q8)       HONEST as drafted. GC fence (step 1) + write-once/
                    never-overwrite laws (3I-02 E8) close the torn-capture
                    holes: refs in the snapshot cannot lose their bytes
                    mid-capture; newer orphan bytes are tolerable per R6.
                    Post-restore simultaneity honesty correctly lands in 3M.

obs/telemetry       PRECISION correction to §16: telemetry physically
                    inside hub_control (obs schema — operational_event,
                    audit_record are closed 3E-02 classes) RIDES the R1
                    dump by default; excluding tables from dumps would be
                    new machinery for negative value and would endanger the
                    audit class. §16's exclusion applies only to telemetry
                    living OUTSIDE the authority databases, if any is ever
                    adopted (3L/3J exporters).

Mirror data         guardrail holds (Q14) — one line worth adding: ERP-
                    mirrored rows inside Project DBs are NOT downgraded to
                    reconstructible even though a re-sync path exists;
                    platform recovery must not depend on external-system
                    availability/history retention (C-015 keeps Sankhya
                    authoritative for its own fiscal archive; Conexus
                    recovers its own cache and re-syncs freshness as a
                    post-restore operational step, 3M/ops).

proving→PROD (Q12)  CLOSED as drafted — governed family only, silent copy
                    remains prohibited, first cutover procedure stays in
                    Realization Planning. Consistent with the 3J-01
                    adjudication that rejected mandatory clean-init as
                    over-strong.

Leaks (Q13)         NONE material. §11's "operations whose authority
                    explicitly requires a fresh checkpoint" is the contract
                    hook, not 3J-03 operations; alerting/timers/injection
                    correctly sit in 3J-03; Mastra export behavior in 3L;
                    settlement in 3M. §18 boundary table stands.
```

### 22.4 Metal Nobre guardrail check (Q14)

No Sankhya-specific truth model found: every required class is platform-generic (owner truth, digest classes, substrate, custody backing, source authority); Metal Nobre appears only as the deployment whose evidence set the RPO/RTO acceptance. The one place ERP specificity could have leaked — treating mirrored ERP data as reconstructible via re-sync — is closed in the opposite, platform-protective direction (22.3 Mirror data). Guardrail HOLDS.

### 22.5 Proof obligations (additions/corrections to §13)

```text
1. pre-activation gate (F-1): one successful complete restore proof from
   the real off-host provider before first production serving
2. custody drill (F-2): proof run demonstrates no plaintext/personal-data
   residue after environment destruction; proof outputs are metadata only
3. re-provisioning drill (F-3): replacement-host path reaches working
   operational credentials by re-issuance alone — no secret recovered from
   any backup artifact
4. immutability negative test: every credential continuously present on
   the production host, including the B2 application key, cannot delete or
   shorten a protected generation; the master-credential path is off-host
5. cadence feasibility: a full generation (capture → verify → upload →
   SUCCESS) completes well inside the RPO window at realistic data volume
6. git bundle proof: a covered repo restores to a working clone with refs/
   checksums matching the manifest
7. selective-restore honesty: restoring hub_control + Project DBs while
   mastra_builder is absent yields a startable platform whose interrupted
   Builder work settles per 3M — no fake continuation
```

### 22.6 DEFER SAFELY / REJECT F1

DEFER SAFELY (owner/trigger named): PITR/WAL (C-006 RPO trigger), retention ladder values (Realization calibration), Mastra store export mechanics (3L where load-bearing), byte-identical rebuild downgrade (named reopen), intra-day cadence tuning (calibration inside RPO contract). REJECT F1 list of §17 CONFIRMED and extended by F-3's prohibition: no secret class ever enters a backup set; no backup-held credential escrow service.

### 22.7 Closing block

```text
Material Findings                = 3
  F-1 pre-activation full restore proof gates production
  F-2 restore-proof environment custody + destruction discipline
  F-3 regenerable-operational-secret class + B2 master-credential custody
adjudications                    = RPO/RTO 6h/8h ACCEPTED as recorded
                                   operator contract (calibration path
                                   defined); Git bundle REQUIRED with
                                   enumeration rule; B2 Object Lock
                                   sufficient at property level;
                                   mastra_par/mastra_builder CONFIRMED;
                                   Release bytes REQUIRED until rebuild
                                   proven; retention ladder → Realization;
                                   obs-inside-hub_control precision;
                                   mirror-data non-downgrade
required-set corrections         = + regenerable-secret class (F-3);
                                   + covered-repo enumeration rule;
                                   §16 obs precision
prior authority reopen           = NONE
new module/record/machinery      = 0
3J-03/3M/3L leakage              = none material

verdict = ACCEPT CANDIDATE
          with F-1/F-2/F-3 and the 22.3 adjudications folded into the
          consolidated 3J-02 text before operator ratification; ID and
          LEDGER remain with the operator
```
