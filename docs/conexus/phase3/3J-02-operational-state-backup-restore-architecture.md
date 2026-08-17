# 3J-02 — Operational State, Backup & Restore Architecture

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3J — Deployment / Operations Architecture  
**Authority:** segunda decisão aprovada de 3J  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** não constitui C-018, não encerra 3J/Fase 3 e não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 protege recoverability por **classes de truth/non-reconstructible state**, não por checklist de arquivos: `hub_control`, todos os Project DBs de produção, `mastra_par`, bytes imutáveis/digest-addressed não comprovadamente reconstruíveis, CredentialBackend ciphertext backing, canonical Git source via bundle off-provider e recovery manifests compõem o recovery set; `mastra_builder` e estado efêmero/reconstruível ficam fora por default; backups usam geração off-host imutável contra credenciais residentes no host, material de recuperação não regenerável permanece em caminho independente, credenciais operacionais reemitíveis não entram no backup, primeiro restore completo deve passar antes da ativação de produção, e o contrato inicial é `RPO <= 6h / RTO <= 8h` sem PITR, replicação, segundo provider ou plataforma de backup.

---

## 1. Guardrail de produto

C-001 permanece a product vision authority. 3J-02 protege **a plataforma Conexus e seus Projects**, não um sistema Metal Nobre/Sankhya.

```text
Metal Nobre current deployment
→ evidence for first RPO/RTO/operations

Sankhya / Mercado Livre / future ERP/SaaS
→ integrations via Connector / Connection / Gateway
→ never backup truth model of the platform
```

Production Project Data é protegido porque é Project state do Conexus, independentemente de ter sido originado, sincronizado ou enriquecido a partir de qualquer ERP/provider.

---

## 2. Authority e provenance

Esta decisão reconcilia sem reabrir:

- C-005 — git-first Artifact/Release source authority;
- C-006 — PostgreSQL backup precedent (`pg_dump -Fc`, pre-migration checkpoint, recovery manifest, encrypted B2, restore-test, PITR only by trigger);
- C-014 — immutable Release/Promotion, rollback re-points to existing exact Release bytes;
- C-015 — content/storage backup ordering and restore proof precedent;
- 3E-01 / 3E-02 — `hub_control`, Project DBs, `mastra_par`, `mastra_builder`, closed record inventory;
- 3H-01 / 3H-02 — Builder `FRESH_BASE` fallback and PAR continuation semantics;
- 3I-02 — CredentialBackend recoverability, write-once backing and independent recovery-key path;
- 3I-05 — store/credential isolation;
- 3J-01 — first single-host production failure domain.

Review/provenance não-autoritativa:

- `3J-FABLE-DIALOGUE-intake-decomposition.md`;
- `3J-FABLE-DIALOGUE-operational-state-backup-restore.md`.

Independent review returned:

```text
verdict = ACCEPT CANDIDATE
Material Findings = 3
RESTRUCTURE = NO
STOP = NO
prior authority reopen = NONE
new module/record/machinery = 0
```

Os findings válidos foram incorporados nas seções 7, 10 e 12. O review foi estreitado em dois pontos: secrets são separados por recoverability semantics, e ERP-specific mirror doctrine não é necessária porque production Project DBs já são REQUIRED por classe.

---

## 3. Root invariant

> **Tudo que seja necessário para restabelecer current ou historically admissible Conexus authority/capability e que não possa ser reconstruído de uma source aceita com semântica/bytes exigidos deve possuir recovery path off-host provado; reconstruível/efêmero entra apenas se sua perda quebrar uma continuity property já aprovada.**

Consequências:

```text
backup existence != recoverability
source code exists != digest bytes reconstructible
ciphertext exists != credential recoverable
GitHub exists != provider-independent source recovery
Mastra substrate != domain authority
```

---

## 4. Classificação de recovery

Para qualquer classe persistida `X`:

```text
REQUIRED se:
  retained/current owner truth depende de X
  AND não existe accepted source capaz de reconstruir exact required semantics/bytes

RECONSTRUCTIBLE se:
  accepted canonical source + deterministic/reliable realization recria X
  AND perda não destrói history/continuation authority
```

A classificação é semântica. Exact paths/filenames/backup scripts são Realization.

Digest-addressed content não é downgraded a reconstructible apenas porque source existe; byte-identical rebuild precisa ser provado antes.

---

## 5. Recovery set REQUIRED

### R1 — `hub_control`

REQUIRED inteiro.

Inclui os 13 owner schemas e as 46 classes de records já aprovadas, inclusive `obs.audit_record` e `obs.operational_event` porque vivem fisicamente na authority database.

Recovery inclui DB dump + metadata suficiente para reconstruir:

```text
PostgreSQL major
required extensions
roles / memberships / grants
ownership properties
migration head/platform version
```

### R2 — todos os production Project DBs

REQUIRED.

A enumeração deriva do `hub_control` capturado; validation/QA temporary DBs ficam fora.

Nenhum Project DB é downgraded a reconstructible porque parte de seus dados pode ser re-sincronizada de um ERP/provider. Recovery do Conexus não depende da disponibilidade/histórico de sistema externo.

### R3 — `mastra_par`

REQUIRED.

Motivo: conversation/thread/checkpoint substrate pode ser necessário para continuation semantics já aprovadas do Production Agent Runtime.

Após restore:

```text
PAR owner facts > restored Mastra substrate facts
```

Mastra nunca ganha domain authority.

### R4 — `mastra_builder`

**NOT REQUIRED BY DEFAULT F1.**

Perder Builder cognition/substrate pode forçar `FRESH_BASE`; não apaga Builder/Project authority já persistida no Conexus/Git/output custody.

Reopen somente se technology qualification provar uma continuity property aprovada e não reconstruível que dependa materialmente desse store.

### R5 — non-reconstructible digest-addressed bytes

REQUIRED por classe e por refs da owner truth capturada.

Inclui conforme realização física:

```text
attachments
active Release frontend dist
retained rollback/admissible Release frontend dist
ArtifactRevision payloads fora de DB rows
BrainPack / binding payloads fora de DB rows
other immutable CAS payloads referenced by retained authority/history
```

Não criar global cross-domain refcount owner. O backup enumera refs/manifests dos owners existentes.

### R6 — CredentialBackend encrypted backing

REQUIRED.

```text
restored credential_ref
+ missing/decryption-impossible backing
= failed restore
```

Capture todos os backing objects necessários para refs live do snapshot. Orphan ciphertext extra é tolerável; dangling live ref não.

### R7 — canonical Git source authority

REQUIRED com **provider-independent recovery coverage**, sem segundo SCM.

Smallest F1 realization class:

```text
canonical repo
→ periodic complete git bundle/archive
→ same immutable off-host generation
```

Covered repo inventory deriva de owner truth:

```text
captured Project → canonical repository refs
+
canonical Conexus product repository after F3B-R1 cutover
```

Local clones/worktrees não são recovery contract.

Não criar Git mirror service, GitLab replica, sync daemon ou multi-SCM abstraction.

### R8 — recovery manifest

REQUIRED e não-secreto.

Deve tornar cada generation interpretável/verificável, cobrindo pelo menos:

```text
generation identity / capture times
platform version + migration head
PostgreSQL major/extensions
DB inventory
role/grant/ownership reconstruction metadata
content/digest inventory + checksums
Mastra compatibility identity where required
Git bundle refs/checksums
backup crypto/key-generation identifiers without secret bytes
```

---

## 6. Classes explicitamente não obrigatórias por default

```text
mastra_builder
ephemeral validation DBs
E2B sandbox state
runtime temp/cache
local Git worktrees/checkouts
package caches / node_modules
rebuildable runtime projections
external/derived telemetry stores outside authority DBs
```

Operational telemetry que já vive dentro de `hub_control` acompanha R1; não criar dump-exclusion machinery para removê-la.

Uma classe retorna apenas se current invariant provar non-reconstructibility/continuity need.

---

## 7. Secret / key recoverability — três classes distintas

Não existe uma categoria única "backup all secrets".

### A. CredentialBackend ciphertext backing

```text
secret ciphertext object
→ REQUIRED in R6
```

Continua write-once / durable-before-visible conforme 3I-02.

### B. Non-regenerable recovery material

Material sem o qual um recovery set válido não pode ser decriptado/interpretrado deve sobreviver em **independent recovery path**, não somente:

```text
on production host
OR
inside the B2 dataset it decrypts
```

Inclui conforme realização:

```text
CredentialBackend root/recovery key generations still needed
backup-client encryption recovery material (e.g. rclone crypt class)
```

Exact operator/offline custody pertence a 3J-03/Realization, mas esta decisão owns a recoverability property.

### C. Reissuable operational credentials

Credenciais operacionais que podem ser reemitidas/reprovisionadas com owner custody **não entram no ordinary backup set**.

Exemplos conforme a realização:

```text
E2B control credential
model-provider credential
Git write credential
restricted B2 application key
reissuable TLS material
Hub token-signing key
```

Replacement host recebe nova credential via owner/provider control plane. Backup nunca vira generic secret escrow.

Se uma futura operational credential for comprovadamente não-regenerável e load-bearing, ela não pode ser silenciosamente encaixada aqui; retorna ao Decision Loop/custody analysis.

---

## 8. Off-host survivability / immutability

Required property:

> **Uma protected backup generation permanece recuperável mesmo após comprometimento de todas as credenciais que ficam continuamente presentes no production host.**

Portanto host-resident backup credential não pode conseguir destruir/encurtar todas as protected copies.

Current B2 provider-native Object Lock/retention é uma admissible smallest realization family para satisfazer a property sem segundo provider. Exact lock mode, retention, bucket/app-key capabilities e lifecycle wiring são Realization/qualification.

Account/master-level credential capaz de alterar protected storage policy não reside no production host; production host recebe apenas restricted application capability necessária à publicação/verification.

Se a conta/provider realization não provar essa property, produção fica bloqueada e a backup realization retorna ao Decision Loop.

Não criar custom immutability service.

---

## 9. Backup consistency model — honest non-atomic generation

Não existe distributed transaction entre:

```text
hub_control
Project DBs
mastra_par
CAS/filesystem backing
CredentialBackend backing
Git provider
B2
```

Logo, generation não finge global atomic snapshot.

Smallest sequence class:

```text
1. create generation identity; fence destructive GC where required
2. capture hub_control authoritative snapshot
3. derive required Project/content/backing/repo inventory from captured truth
4. capture consistent Project DB dumps
5. capture mastra_par using qualified store mechanism
6. capture required immutable bytes + CredentialBackend backing
7. capture required Git bundles
8. produce checksummed recovery manifest with individual capture points
9. publish immutable off-host generation
10. mark generation SUCCESS only after completeness/integrity verification
```

Writes posteriores podem naturalmente aparecer na próxima generation; após restore, 3M owns temporal/domain settlement of interrupted work. 3J-02 não promete simultaneidade inexistente.

---

## 10. RPO / RTO first-launch contract

Operator ratification neste fechamento aceita explicitamente:

```text
RPO <= 6 hours
RTO <= 8 hours
```

Meaning:

```text
RPO <= 6h
→ a perda máxima planejada de protected recoverable platform state é limitada a seis horas desde a última successful generation, salvo incident beyond the accepted model

RTO <= 8h
→ objetivo operacional é restaurar manualmente a instalação single-host em até oito horas após iniciar o recovery em host reparado/substituto
```

Esses números são **first-installation operational contract**, não product-wide SaaS SLA.

Calibration dentro da mesma single-digit-hours class pode ser re-ratificada pelo operador sem redesenhar a architecture. Necessidade de days-scale loss, near-zero RPO/RTO, HA/automatic failover ou incapacidade prática de cumprir esse contrato dispara Decision Loop/3J-01/3J-02 conforme a causa.

A geração completa precisa conseguir capture→verify→off-host SUCCESS suficientemente dentro do cadence para que o RPO não seja ficção.

---

## 11. Cadence, retention e pre-migration checkpoint

Architecture congela propriedades, não ladder detalhado.

```text
periodic successful immutable generations
→ cadence must satisfy RPO <= 6h

material production schema migration
→ required affected-set checkpoint
→ verified off-host before irreversible/material step
```

Se checkpoint obrigatório não chega a verified off-host state, migration falha closed salvo emergency override explicitamente autorizado/registrado por authority aplicável.

Retention properties:

```text
protected generations span required recovery horizon
at least one proven-good immutable generation remains inside protected window
pre-migration checkpoint retained until superseded by proven-good generation
immutability window covers every protected generation
storage remains bounded
```

Exact intra-day/daily/weekly ladder e provider lifecycle são Realization calibration, não architecture authority.

Backup failure comum não precisa derrubar serving imediatamente. Recovery posture fica unhealthy/stale; stale beyond RPO deve ser operationally visible e bloqueia somente operations cuja authority explicitamente exija fresh recovery checkpoint.

---

## 12. Restore proof — pre-activation + periodic

Artifact existence não prova recovery.

### 12.1 Gate antes da primeira produção

**Primeira production activation requer um complete successful restore proof a partir de uma real off-host protected generation.**

Sem esse proof:

```text
production serving/admission = NOT READY
```

Material change de provider/backup mechanism/key model que altera o recovery contract re-triggera complete proof antes de a nova realization assumir esse contrato.

### 12.2 Ongoing proof

Após ativação, baseline F1 mantém periodic full restore proof; C-006 monthly cadence é o starting operational baseline, ajustável por evidence sem nova architecture machinery.

Proof family:

```text
download generation FROM off-host provider
→ restore into independent controlled environment
→ reconstruct roles/extensions/config interpretation
→ restore hub_control
→ restore Project DBs
→ restore mastra_par
→ restore required digest-addressed bytes
→ restore/decrypt CredentialBackend backing using independent recovery material
→ restore Git bundle to working repository
→ run semantic + negative assertions
→ destroy temporary restored material
```

### 12.3 Restore environment custody

Enquanto existir, o restore-proof environment deve ser **production-custody-equivalent** para os dados restaurados:

```text
restricted access class
no public exposure
no telemetry/log export of restored payload/plaintext
credential decrypt proof without plaintext in evidence
proof outputs = metadata/checksums/assertion results only
restored data + temporary recovery-material copies destroyed/wiped after proof
```

Exact temporary host/VM/storage realization pertence a 3J-03/Realization.

### 12.4 Minimum semantic proof

```text
Hub owner records coherent/readable
Project inventory matches manifest
known semantic Project DB query passes
DB least-privilege negative tests still pass
active exact Release digest bytes exist
at least one retained rollback/admissible Release exists where applicable
live CredentialHandle ref resolves/decrypts without plaintext leak
PAR owner facts remain authority over Mastra restore
Git bundle produces valid repo/refs matching manifest
checksums/manifests match
```

`mastra_builder` may be absent; restored platform must not fake Builder continuation.

---

## 13. Proving → production governed carry-over

3J-01 já proíbe silent copy.

Se proving-era state for deliberadamente preservado:

```text
explicit source environment
→ same classified export/recovery boundary
→ provenance + integrity proof
→ clean target restore/import under accepted cutover plan
```

Isso é governed migration/restore, não promotion por conveniência.

Exact first cutover steps pertencem ao post-C-018 Realization Planning. Any ungoverned filesystem/PGDATA/random-dump copy remains prohibited.

---

## 14. Backup != product/runtime authority

```text
backup generation
!= Release
!= Promotion
!= platform deployment
!= owner terminal state
```

Restore reconstitui persisted truth; não reescreve história para aparentar clean execution.

Após restore:

```text
orphan/lost ActorRuns
AgentRuns
OUTCOME_UNKNOWN effects
partial Promotions
post-stop work
```

são 3M settlement/recovery concerns sob owner facts, não backup state machine.

---

## 15. Proof obligations

Antes/na realization, provar pelo menos:

```text
1. complete recovery set can be generated from current owner truth
2. protected B2/off-host generation survives destructive attempt using every credential continuously present on production host
3. independent recovery material still permits ciphertext recovery after production host loss
4. replacement-host operational credentials can be reissued without reading them from backup artifacts
5. full generation completes/validates inside a cadence compatible with RPO <= 6h
6. pre-production full restore succeeds from off-host copy before serving activation
7. restore-proof environment leaves no plaintext/personal-data residue after destruction
8. production Project DB semantic assertion passes after restore
9. owner/store privilege negative matrix remains valid after restore
10. active + retained admissible Release bytes verify exact digests
11. Git bundle restores working repository with expected refs/checksums
12. mastra_par restore supports required substrate continuity without overriding PAR facts
13. absent mastra_builder does not manufacture fake Builder continuation
14. recovery manifest completeness can detect missing referenced DB/content/backing class
```

A control que não pode ser falsificado não conta como recovery proof.

---

## 16. Reopen triggers

```text
RPO/RTO cannot be met with logical backup/manual restore
new non-reconstructible state class is not covered by class rule
B2/account realization cannot prove immutability against host-held credentials
independent recovery-key path cannot be realized safely
Mastra PAR cannot be restored compatibly under selected technology/version
Git bundle coverage becomes operationally disproportionate at real scale
byte-identical rebuild is proven and can safely downgrade a digest class
customer/compliance requirement changes retention/DR contract
single-host topology reopens under 3J-01 trigger
```

Calibration that preserves the same architectural properties does not reopen by preference alone.

---

## 17. YAGNI / explicit rejections

Não criar F1:

```text
Backup domain module / BackupRecord aggregate
backup orchestration platform
second object-storage provider
continuous DB replication
managed PostgreSQL requirement
WAL archive / PITR / pgBackRest baseline
filesystem snapshot platform
ZFS/btrfs requirement
cross-store distributed snapshot coordinator
custom Object Lock service
Git mirror service / second SCM
backup-held generic credential escrow
DR region / warm standby
automatic failover
```

Use scripts/timers/provider-native mechanisms no Realization layer até failure class real provar insuficiência.

---

## 18. Routing após 3J-02

### 3J-03

Owns:

```text
startup/shutdown/restart
service supervision expectation
platform operational secret injection at boot
how independent recovery material is operationally custodied/accessed
backup timers/alerts/health response
platform deploy/upgrade sequence
whole-Hub emergency stop physical procedure
host-loss operational procedure
minimum core/capability availability behavior
```

### 3L

Qualifica pinned Mastra store/export/restore behavior quando load-bearing, além dos probes já definidos por 3A-R6.

### 3M

Owns semantic settlement/recovery after restore/restart/loss, never backup history as second authority.

### Realization Planning

Owns exact:

```text
pg_dump/rclone/git-bundle commands
B2 Object Lock mode/retention/app-key capability set
backup schedule/retention ladder
manifest format
restore temporary environment implementation
secret storage paths/permissions
first proving→PROD cutover procedure
```

---

## 19. Outcome

```text
outcome = CURRENT STRUCTURE CONFIRMED
backup model = class-based recovery set
hub_control = REQUIRED
production Project DBs = REQUIRED
mastra_par = REQUIRED
mastra_builder = NOT REQUIRED BY DEFAULT
non-reconstructible digest bytes = REQUIRED
CredentialBackend ciphertext backing = REQUIRED
canonical Git off-provider bundle = REQUIRED
recovery manifest = REQUIRED
non-regenerable recovery material independent path = REQUIRED
reissuable operational credentials in backup = FORBIDDEN by default
off-host immutability against host credential compromise = REQUIRED
B2 provider-native Object Lock family = current smallest realization candidate
cross-store atomic snapshot = REJECT
RPO = <= 6h
RTO = <= 8h
pre-production complete restore proof = REQUIRED
periodic restore proof = REQUIRED
new Hub module = 0
new durable record = 0
new backup platform = 0
PITR/replication/second provider = 0
prior authority reopen = NONE
```

Next candidate: `3J-03 — Platform Lifecycle, Secret Injection, Emergency Stop & Availability`.
