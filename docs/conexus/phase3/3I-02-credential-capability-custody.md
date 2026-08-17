# 3I-02 — Credential & Capability Custody

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3I — Security / Authority Architecture  
**Authority:** segunda decisão aprovada de 3I  
**Importante:** esta decisão não constitui C-018, não encerra 3I nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, **Connection secret custody preserva os owners existentes**: `Connections` owns apenas `CredentialHandle` e logical-grant facts, enquanto o `CredentialBackend` continua a infra boundary estreita consumida por `Connections + Gateway`; plaintext de Connection aparece somente na entrada administrativa write-only e no Gateway no último momento do uso externo, material cifrado vive em backing de infraestrutura opaco e recoverable sem novo domain record/schema/database, publicação segue **durable-before-visible** com objetos write-once e new-ref-then-swap, logical grant / crypto key / transient-token lifecycles permanecem distintos, root/recovery key não compartilha um único compromise path com ciphertext/backup, transient tokens são memory-only no F1, guest-readable capability continua Hub-minted/server-expiring/server-revocable com a antiga guest LLM key removida, e não nasce `SecretService`, external Vault/KMS/HSM, per-secret envelope machinery, KeyRotation FSM, durable transient-token cache ou per-use secret ledger sem novo failure class material.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa, sem reabrir:

- C-007 — Hub-owned credential backend, authenticated encryption, key outside database, write-only secret administration;
- C-008 — durable secret outside E2B + bounded guest-readable capability law;
- C-013 — sandbox telemetry-ingest capability + producer-trust discipline;
- C-016 — F1 proportional security, no external Vault/KMS without trigger, `key_version != refresh_generation`;
- 3A-R5 — Builder model loop moved control-side; durable model-provider credential need not enter guest;
- 3C-07 — Connections owns logical credential relationship; secret bytes/crypto belong to credential infrastructure; qualification external I/O runs through Gateway;
- 3D-04 / 3D-R1 — `CredentialBackend` is one of four justified infra boundaries and has `Connections + Gateway` as current consumers;
- 3E-01 / 3E-02 — closed Hub schema/domain-record inventory while physical CredentialBackend custody remains infrastructure realization behind opaque refs;
- 3I-01 — credential create/replace/revoke eligibility is already a current-authority, pre-state, concurrency-safe mutation question.

Review/provenance não-autoritativa:

- `3I-FABLE-DIALOGUE-security-authority-intake-decomposition.md`;
- `3I-FABLE-DIALOGUE-credential-capability-custody.md`.

O review independente convergiu após dois rounds:

```text
Material Finding contra approved authority = NONE
reopen required                             = NONE
Alternative A                               = GLOBAL MAXIMUM
outcome                                     = CURRENT STRUCTURE CONFIRMED
new module                                  = 0
new durable domain record                   = 0
new hub_control schema/database             = 0
new CredentialBackend consumer              = 0
external Vault/KMS/HSM F1                   = 0
per-secret DEK/envelope F1                  = 0
guest LLM key                               = DELETED
```

A consolidação final deliberadamente **não** congela o `age-windowed cleanup` sugerido no Round 2: orphan cleanup/GC é higiene posterior, e um objeto só pode ser removido quando a realização consegue provar que está unreferenced e não pode ainda tornar-se live.

---

## 2. Escopo exato

3I-02 fecha:

```text
A. Connection secret plaintext/ciphertext custody boundary
B. CredentialBackend consumer closure
C. admissible physical backing class under closed 3E inventory
D. durable-before-visible cross-store publication law
E. logical grant × crypto key × transient-token axis separation
F. root-key custody + crash-safe rekey property
G. backup/recovery compromise-path separation
H. guest-readable capability law after guest LLM-key deletion
I. metadata-only secret-operation audit + secret-safe diagnostics
J. accepted F1 residual risk for full trusted-Hub compromise
```

Não fecha:

```text
who may create/replace/revoke credentials                         → 3I-01 already approved
exact backing technology/path                                    → implementation / 3J
exact cipher/library/nonce/AAD serialization                     → implementation; 3L only if version-sensitive
host key injection/file permissions/rotation runbook             → 3J
orphan encrypted-payload repair/GC                               → 3M/3J/implementation
rotating refresh-token lifecycle                                 → C-016 trigger / Decision Loop
DEDICATED authentication/key issuance/revocation                 → later 3I Trusted Exchange
per-ActorRun/per-AgentRun model spend enforcement               → next 3I material family
Hub control-side network/telemetry crossings                    → later 3I Trust Zones/Crossings
hub_control PostgreSQL login-role topology                       → later 3I least-privilege family
```

---

## 3. Root cause e target invariants

O unresolved failure class não é “falta um produto de vault”. É:

> **Uma secret-bearing capability pode escapar do seu owner/use boundary, sobreviver mais que sua authority ou virar uma segunda authorization model se logical grant meaning, secret-byte custody, cryptographic lifecycle e runtime exposure forem confundidos.**

### C1 — Domain meaning != secret bytes

```text
Connections
→ CredentialHandle + logical grant/current eligibility facts
-X-> secret plaintext/ciphertext ownership

CredentialBackend
→ encrypted secret storage/crypto mechanics
-X-> Connection authorization/qualification meaning
```

### C2 — Plaintext tem somente duas aparições legítimas para Connection credentials

```text
A. write-only administration ingress
B. trusted Gateway/auth-strategy last-mile external use
```

3C-07 já congela que Qualification executa seu real external I/O **dentro do Gateway**, portanto qualification não cria um terceiro plaintext consumer.

### C3 — CredentialBackend permanece narrow

```text
CredentialBackend F1 consumers = Connections + Gateway
```

Git/E2B/model-provider/PostgreSQL/backup credentials reutilizam as custody **principles** nos seus próprios owners; não viram `Connection`, `CredentialHandle` ou consumidores deste port por uniformidade.

### C4 — Root key e encrypted-data backup não compartilham um único compromise path

> **Fora do trusted Hub boundary, nenhum único credential, location ou access path pode entregar simultaneamente o ciphertext set de Connection credentials e o root/recovery key material necessário para decriptá-lo.**

### C5 — Version axes permanecem independentes

```text
logical grant / credential-binding version
!= crypto key_version
!= transient access-token generation
!= future refresh_generation
```

### C6 — Guest authority não sobrevive server authority

Guest-readable capability é sempre:

```text
Hub-minted
exact-consumer/run scoped
bounded
server-expiring
server-revocable
guest cannot mint/widen/refresh its authority
```

Sandbox lifetime nunca é expiry authority.

### C7 — Physical publication never exposes not-yet-durable secret material

Um `credential_ref` live só pode ser publicado depois que os bytes cifrados completos estão durable/atomically published na infra boundary.

### C8 — No false Hub-compromise claim

F1 protege contra repo/DB/backup/browser/guest/accidental-log exposure classes; não afirma proteger um credential que um fully compromised trusted Hub process possui authority legítima para usar.

---

## 4. Credible alternatives

### Alternative A — owner-preserving narrow custody

```text
Connection secrets
→ narrow CredentialBackend
→ opaque encrypted infra backing
→ root key separate from ordinary encrypted-data backup path
→ plaintext only ingress + Gateway last-mile

platform operational credentials
→ owner-specific deployment/runtime custody
→ same no-leakage principles

named guest capabilities
→ separate ephemeral Hub authority
```

**ADOPT / GLOBAL MAXIMUM.**

### Alternative B — universal SecretService / Credential domain

**REJECT.** Reabriria 3D, pressionaria 3E por generic durable records/ACLs e faria shared mechanics absorver semanticamente lifecycles diferentes de Git/E2B/model/DB/backup/Connections.

### Alternative C — external Vault/KMS/HSM now

**DEFER.** Pode ser correto quando houver independently controlled decryption policy/audit, HSM/non-exfiltration, multi-tenant/compliance ou host-compromise requirement. Nada atual paga a operational/technology commitment; além disso, um compromised Hub autorizado a pedir decrypt ainda pode abusar dessa authority.

### Alternative D — per-secret DEK/envelope hierarchy now

**DEFER.** C-007 já deixa o seam; entra quando selective rekey, KMS externo ou escala medida pagar pelo lifecycle adicional.

### Alternative E — plaintext/environment config per dynamic Connection

**REJECT.** Não preserva write-only administration, logical grant versioning, qualification, revocation ou bounded exposure e aumenta inheritance acidental para child processes/guests.

---

## 5. Credential classes e owner preservation

### 5.1 Connection credentials

Current dynamic secret consumer class:

```text
password
client secret
API key
private signing key when connector auth requires it
future refresh token only when a real provider activates that lifecycle
```

Semantic flow:

```text
human write-only ingress
→ 3I-01 current mutation authority
→ CredentialBackend encrypted material
→ Connections opaque backend/ref + logical grant facts
→ Gateway current execution/admission gates
→ CredentialBackend last-mile materialization inside trusted auth strategy
→ external call / qualification probe
```

`ciphertext exists` ou `decrypt succeeds` nunca significa `Connection eligible`.

### 5.2 Platform operational credentials

Examples:

```text
Git remote write credential
E2B control API credential
model-provider credential
PostgreSQL runtime/login credential
backup-storage credential
```

Eles obedecem:

```text
no Git/project artifact
no browser read-back
no guest unless separately-approved ephemeral capability exists
least owner scope/lifetime
fail closed when missing/invalid
metadata-only security audit where required
secret-safe logging
```

Mas continuam credentials dos seus owners. 3I-02 **não** amplia `CredentialBackend` para eles.

---

## 6. Connection plaintext lifecycle

### 6.1 Write-only ingress

```text
human browser contains what human types
→ protected administration request
→ 3I-01 authority check
→ CredentialBackend accepts material
→ response returns safe metadata/status only
```

Não há server-side secret read-back/echo contract.

Não retornar por default:

```text
secret suffix
low-entropy secret fingerprint/hash
ciphertext
raw token/private key
```

Safe provider/account metadata discovered independently by Qualification pode ser apresentado.

### 6.2 Gateway last-mile

```text
current Connection/grant/Release/approval/budget/precondition gates
→ resolve exact opaque credential ref
→ decrypt/materialize as late as practical
→ apply auth/signing/exchange
→ external call
→ do not persist plaintext
```

Proibido propagar plaintext para:

```text
Connections domain object
RequestContext
Mastra thread/memory
E2B env/file/process
browser response
Git/Registry/Release
logs/traces/audit/evidence
```

### 6.3 Managed-runtime honesty

F1 não promete deterministic memory zeroization em Node/managed runtime. A enforceable law é:

```text
minimize plaintext lifetime
+ never deliberately persist/log/propagate it beyond trusted last-mile use
```

---

## 7. CredentialBackend semantic contract

### 7.1 Opaque ref only

Não existe public/general API equivalente a:

```text
getSecret(handle) → string
listSecrets()
exportSecret(handle)
```

Connections opera handles/logical relationship; Gateway possui o trusted last-mile path necessário ao external execution.

### 7.2 Authenticated context binding

Ciphertext precisa ser autenticado/bound a stable expected context suficiente para impedir substitution entre credentials/Connections/targets.

Normative proof:

```text
copy ciphertext/ref from credential A
→ cannot be accepted as credential B only by swapping refs
```

Exact AAD fields/serialization são implementation.

### 7.3 Missing/corrupt fails closed

```text
unknown credential_ref
unsupported format/key_version
AEAD/authentication failure
missing required root generation
corrupt ciphertext
→ no guessed/default/fallback credential
→ safe typed failure + evidence
```

Nunca fallback para global/environment credential por conveniência.

---

## 8. Physical backing class e 3E tripwire

3E-02 fechou **domain records**, mas explicitamente deixou physical CredentialBackend secret custody para infra realization.

Admissible F1 realization class:

```text
infra-owned secret backing
opaque-ref addressed
FK-free
domain-opaque
recoverable
supports write-once complete publication
```

Um filesystem-class encrypted backing é **existence proof/admissible shape**, não technology pin. Qualquer equally-narrow realization pode ser escolhida se satisfizer as mesmas properties.

Retorna ao Decision Loop, não entra como “implementation detail”, qualquer realization que exija:

```text
new durable domain record class
new hub_control schema
new database
domain-readable backing rows
FK from domain into secret backing
new shared secret lifecycle visible to other modules
```

---

## 9. Durable-before-visible publication law

`con.connection`/logical grant facts e secret infra backing não compartilham transaction. Correctness vem de ordering + immutability, não de distributed transaction/outbox.

### 9.1 Write-once objects

Cada new logical secret write cria:

```text
NEW complete ciphertext object
under NEW opaque unique ref
```

Nunca mutate/overwrite in place o objeto referenciado por um live `credential_ref`.

### 9.2 Publish order

```text
1. encrypt + authenticated-context binding
2. atomically publish COMPLETE ciphertext bytes at infra boundary
3. prove that object is durable under new ref
4. only then commit domain transaction that makes the ref live
```

Create:

```text
new object durable
→ create/set live credential_ref
```

Replace:

```text
old live ref A remains intact
→ publish new durable object B
→ 3I-01 guarded pre-state transaction swaps A → B
→ A becomes unreferenced, never overwritten
```

### 9.3 Crash semantics

Normal crash residue may be:

```text
unreferenced complete encrypted object
→ not authority
→ repair/cleanup hygiene later
```

A live ref resolving to missing/partial/unauthenticatable material is **not a normal crash state**. It is:

```text
integrity incident
→ fail closed
→ evidence
→ recovery/repair under 3M/3J
→ never silently recreate/fallback
```

### 9.4 No GC framework frozen here

3I-02 does not freeze age-based cleanup, automated GC, orphan FSM or outbox. Deletion of unreferenced backing is allowed only when the chosen realization can prove the object is not live and cannot still become live through a pending publication path.

At F1 volume, no automatic orphan GC is required for correctness.

---

## 10. Version axes e transient tokens

| Event | Logical grant version | Crypto `key_version` | ConnectionRevision | Release |
|---|---:|---:|---:|---:|
| re-encrypt same external credential under new root generation | no | yes | no | no |
| ciphertext-format maintenance with same credential meaning | no | maybe | no | no |
| reacquire transient access token under same grant | no | no domain-visible change | no | no |
| replace/reauthorize material changing qualification/logical-grant basis | yes | independent | no unless non-secret config changed | no solely for secret change |
| logical grant revoke | current eligibility revoked | independent | no | historical Release unchanged |
| endpoint/tenant/non-secret target semantic change | independent | independent | yes | later binding/Release adoption |

### 10.1 F1 transient token baseline

```text
transient acquired token
→ MEMORY ONLY
→ no durable transient-token cache in any F1 store
```

Se o primeiro provider real provar que reacquisition cost/rate-limit/lockout exige persistence:

```text
named provider + concrete failure class
→ Decision Loop
→ persistence mechanism decided then
```

Boundary law already prepared: qualquer future persisted transient secret continua secret-at-rest, nunca domain fact, ConnectionRevision input ou qualification identity.

C-016 `key_version != refresh_generation` permanece reservado ao future rotating-refresh-token trigger.

---

## 11. Root/master-key custody e crash-safe rekey

### 11.1 F1 baseline

```text
versioned authenticated encryption
+ one current Hub root/KEK generation for new writes
+ previous decrypt generation(s) only during bounded rekey/recovery
```

Exact cipher/library remains implementation qualification; 3I-02 não redefine o implementation pin anterior.

### 11.2 Root material is separate

Root/recovery key material não fica em:

```text
hub_control domain rows
Connection/ConnectionRevision
Git/Registry/Release
E2B
ordinary encrypted-data backup object
same non-Hub compromise path as ciphertext backup
```

Exact host key injection/storage/permissions são 3J/implementation.

### 11.3 Rekey property

```text
introduce K2
→ new writes may use K2
→ K1 remains decrypt-capable while any live ciphertext references K1
→ migrate each ciphertext with authenticated verification and same semantic binding context
→ prove zero live K1 references
→ prove recovery fixture under K2
→ only then destroy/retire K1
```

Crash midway não altera logical grant, ConnectionRevision ou Release e não pode causar secret loss enquanto referenced key generations remain admitted.

Não nasce `KeyRotation` FSM/domain record.

---

## 12. Backup / recovery custody

### 12.1 Compromise-path law

Fora do trusted Hub boundary:

> **Nenhum single backup credential, storage location ou access path pode fornecer simultaneamente encrypted credential backing e root/recovery key material.**

Logo, isoladamente:

```text
backup bucket compromise
backup-storage credential compromise
encrypted backup exfiltration
→ insufficient to decrypt Connection credentials
```

O trusted Hub host continua sendo a explicit accepted residual boundary de §15.

### 12.2 Recoverability

3J deve provar os dois lados:

```text
encrypted credential backup without separately-authorized recovery key
→ cannot decrypt recovery fixture

encrypted backup + separately supplied authorized root/recovery material
→ can recover known fixture / re-establish backend
```

Se separação tornar recovery impraticável, isto é Material Finding/reopen trigger, não motivo para colocar a key no mesmo backup silenciosamente.

---

## 13. Guest-readable capabilities

### 13.1 Current baseline

```text
sandbox telemetry ingest capability = current named class
ActorRun guest-readable model-provider key = DELETED from F1 baseline
```

Eventual E2B→Hub OTLP push, se adotado, pertence à **mesma telemetry-ingest capability class**, não cria uma segunda guest-capability architecture.

Spotlight loopback-only e BuildValidationDatabase synthetic/local credentials não são Hub secret capabilities; Git SYNC/SHARE permanece bundle-mediated sem guest remote credential.

### 13.2 Server-side authority

Toda guest-readable capability:

```text
Hub mints/authorizes
Hub binds Project/ActorRun/consumer/scope
Hub validates current expiry/revocation on EVERY use
guest cannot set authoritative owner IDs
guest cannot mint/refresh/widen
```

E2B pause/resume/process lifetime nunca define validade. Um sandbox retomado segurando bytes antigos recebe DENY quando server authority expirou/revogou.

### 13.3 Future consumer admission

Primeiro novo guest capability consumer retorna ao Decision Loop/3I se não puder satisfazer o C-008 law sem mudar o threat model. `CX-BUILDER-MASTRA-01` não pode reviver silently a guest LLM-key mechanism.

---

## 14. Audit, observability e safe diagnostics

Audit-required secret administration reutiliza a existing audit boundary, metadata-only, para operações equivalentes a:

```text
credential create/replace/revoke
logical grant relation change
root/key generation introduce/retire
credential-backend recovery/import
privileged secret-administration failure
```

Safe metadata pode incluir actor, owner/Connection/ref, operation type, logical grant version, crypto key_version, outcome, correlation/time.

Nunca audit/log:

```text
plaintext
ciphertext
raw Authorization header
access/refresh token
private key
reversible secret fingerprint
credential request body
```

Ordinary Gateway credential use não cria automaticamente um segundo per-decrypt/per-use ledger. Gateway effect/qualification/health evidence continua suficiente no current F1; future compliance requirement pode reabrir.

---

## 15. Accepted residual risk

F1 local custody protege especificamente contra classes como:

```text
repo/generated-app leak
browser read-back
E2B/root guest compromise
DB/backup theft without root key
accidental log/telemetry exposure
cross-Connection ciphertext substitution
```

Não afirma proteger contra:

```text
full arbitrary-code compromise of trusted Hub process
operator/host compromise that reaches both ciphertext + root material
external provider compromise
```

External KMS/HSM/process-isolated custody volta quando um named threat/compliance/scale requirement exige key non-exfiltration, independently controlled decrypt policy/audit ou host/process separation. Prepare the seam, not the future system.

---

## 16. Enforcement

```text
E1 domain contracts exclude credential-value fields
E2 only protected write-only administration boundary accepts secret input
E3 only Connections/Gateway wiring reaches Connection CredentialBackend
E4 only Gateway trusted last-mile path materializes Connection plaintext
E5 authenticated encryption/context binding rejects substitution/corruption
E6 missing root/backing/ref fails closed; no fallback credential
E7 backing object becomes domain-visible only after complete durable publication
E8 replacement = new-ref-then-swap; never overwrite live ciphertext
E9 current grant eligibility is checked before decrypt/use
E10 root/recovery material separated from ordinary ciphertext backup compromise path
E11 guest capability validates server-side authority on every use
E12 audit/logging schemas expose metadata only
```

---

## 17. Proof strategy

Future implementation/qualification must falsify at least:

### Connection secret path

1. create/replace response never returns original secret/ciphertext;
2. Connection/ConnectionRevision/Release/Registry serialization contains no secret value;
3. Connections public domain API cannot read plaintext;
4. Builder/PAR/MAR/browser/guest cannot invoke Connection secret resolution;
5. revoked logical grant + old Release/ref is denied before external use;
6. missing/corrupt ciphertext/key generation fails closed with no fallback;
7. ciphertext from Connection A substituted as B fails authentication/context binding;
8. public errors/log fixtures contain no secret/header/request-body leak.

### Cross-store publication

9. crash after new object durable but before DB switch leaves only an unreferenced complete object;
10. live domain ref is never committed before referenced bytes are durably complete;
11. replacement crash cannot corrupt the old live credential because old object is immutable;
12. observed dangling/missing live ref is surfaced as integrity failure, never reconstructed silently.

### Version/rekey/recovery

13. re-encrypt only changes crypto generation, not logical grant/qualification/Release;
14. transient token reacquisition creates no durable cache/domain version change;
15. old root generation cannot retire while live ciphertext references it;
16. rekeyed A remains substitution-resistant as B;
17. encrypted backup alone cannot decrypt recovery fixture;
18. encrypted backup + separately-authorized recovery material can restore fixture;
19. root/recovery key absent from ordinary encrypted-data backup.

### Guest capability

20. baseline E2B contains no model-provider durable/ActorRun LLM key;
21. telemetry capability for A cannot ingest as Project/ActorRun B;
22. expired/revoked capability remains denied after pause/resume despite old bytes;
23. guest cannot mint/refresh/widen its own capability.

### YAGNI/boundary

24. Git/E2B/model/DB/backup credentials remain owner-specific, not CredentialBackend records;
25. no new durable Secret/Credential/CapabilityToken record/schema/database is necessary;
26. no external KMS/HSM/per-secret envelope/KeyRotation FSM/durable transient-token cache/orphan-GC framework/per-use secret ledger is necessary for current F1 invariants.

---

## 18. Anti-overengineering closure

3I-02 does **not** authorize:

```text
SecretService / universal Credential domain
new Secret/Credential/CapabilityToken durable record
new hub_control secret schema/database
new CredentialBackend consumers by uniformity
external Vault/KMS/HSM in F1
per-secret DEK/envelope hierarchy
KeyRotation FSM/record
credential-specific outbox/distributed transaction
in-place overwrite of live ciphertext
durable transient-token cache
orphan GC framework
per-decrypt/per-use secret audit ledger
generic guest token/capability service
revival of guest LLM provider key
```

---

## 19. Later routing

```text
exact encrypted backing technology/path                         → implementation/3J
host root/recovery-key injection/permissions/runbook            → 3J
credential backup/recovery procedure                            → 3J
orphan encrypted backing repair/cleanup                        → 3M/3J/implementation
exact crypto library/serialization                             → implementation / 3L if load-bearing
DEDICATED app authentication/key lifecycle                     → later 3I Trusted Exchange
per-run model spend                                            → next 3I material family
Hub outbound network/telemetry crossings                       → later 3I Trust Zones/Crossings
hub_control login roles                                        → later 3I least-privilege family
rotating refresh token lifecycle                               → Decision Loop on first consumer
external KMS/HSM/process-isolated custody                       → Decision Loop on named threat/compliance/scale consumer
```

---

## 20. Reopen triggers

1. a current consumer requires Connection plaintext outside write ingress/Gateway last-mile;
2. another real owner needs the same CredentialBackend lifecycle and justifies reopening 3D consumer closure;
3. implementation cannot realize opaque infra backing without new durable record/schema/database;
4. Hub process/host compromise becomes unacceptable custody assumption;
5. compliance/multi-tenant requirement needs independently controlled decrypt policy/audit or HSM;
6. measured credential count/rekey cost justifies per-secret DEK/envelope;
7. first provider proves durable transient-token/rotating-refresh storage is necessary;
8. new guest capability cannot satisfy server-expiring/scoped/revocable law;
9. backup/key separation cannot provide acceptable, proven recovery;
10. publication/infra realization cannot prevent routine dangling live refs without stronger durable machinery.

---

## 21. Formal outcome

A aprovação do operador em **2026-08-17** ratifica:

```text
3I-02 = APPROVED
Material Finding against prior authority = NONE
reopen = NONE
Alternative A = GLOBAL MAXIMUM / CURRENT STRUCTURE CONFIRMED

new Hub module = 0
new durable domain record = 0
new hub_control schema/database = 0
new CredentialBackend consumer = 0
SecretService = 0
external Vault/KMS/HSM F1 = 0
per-secret DEK/envelope F1 = 0
KeyRotation FSM/record = 0
durable transient-token cache = 0
orphan GC framework = 0
per-use secret ledger = 0
guest LLM key = DELETED
```

3I continua **IN PROGRESS**. A próxima decisão material é **Per-ActorRun / Per-AgentRun Model Spend Enforcement**; somente depois dela o caminho principal para DEDICATED Trusted Exchange fica completamente desbloqueado pela sequência aprovada do intake.
