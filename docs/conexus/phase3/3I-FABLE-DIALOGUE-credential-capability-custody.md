# 3I Fable Dialogue — Credential & Capability Custody

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Candidate:** next material 3I decision; **no `3I-02` authority/ID is created by this file**  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** ChatGPT candidate for independent Fable challenge. This file does **not** update `LEDGER.md`, does not alter approved 3B..3I-01 authority, and does not authorize implementation, merge, or PR readiness.

---

## 1. Canonical starting point

Read path required by `AGENTS.md`:

```text
DevelopmentConexus Engineering Method v1.0.0
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ exact accepted authority
→ external/current evidence only where load-bearing
```

Current authority at this intake:

```text
3B..3H = CLOSED / APPROVED
3I      = IN PROGRESS
3I-01   = APPROVED
```

The approved 3I intake leaves these material families:

```text
Credential & Capability Custody
Per-ActorRun / Per-AgentRun Model Spend Enforcement
DEDICATED Trusted Exchange
Trust Zones & Crossings / Hub control-side egress / telemetry crossing
hub_control Least-Privilege Realization
```

This dialogue takes **Credential & Capability Custody** only.

---

## 2. Authority already frozen before this decision

### 2.1 Connections owns logical credential relationship, not secret bytes — 3C-07

Frozen:

```text
Connection
→ CredentialHandle / logical grant relationship
→ no secret bytes in domain-readable config

ConnectionRevision
→ immutable NON-SECRET configuration

CredentialBackend
→ encryption
→ key rotation
→ storage format
→ token material
→ secret version storage
→ provider/KMS implementation
```

Secret material never belongs in:

```text
Git
Artifact Registry payload
ConnectionRevision readable config
ReleaseManifest
Pi/E2B Actor Pack
browser read-back
```

Also frozen:

```text
new logical credential/grant
→ may invalidate qualification

cryptographic re-encryption only
→ no ConnectionRevision
→ no Release

transient access-token refresh/reacquisition
→ no ConnectionRevision
→ no Release

logical grant revoke
→ current use ineligible/fail-closed even if historical ConnectionRevision remains
```

And, critically:

```text
logical grant version
!= cryptographic key_version
```

### 2.2 CredentialBackend is already a narrow infrastructure boundary — 3D

3D freezes exactly four infrastructure seams. For credentials:

```text
CredentialBackend
→ current consumers: Connections + Capability Gateway
```

It is **not** a universal platform secret service.

Current other technical credentials have their own owners/boundaries:

```text
Git remote write credential    → GitInfra / Hub-side Git operations
E2B control-plane credential   → CodingRuntime adapter / Hub control-side
model-provider credential      → Builder/PAR control-side model caller
PostgreSQL login credentials   → DB/runtime deployment boundary
backup-storage credential      → backup/operations boundary
```

Adding those as `CredentialBackend` consumers merely because they are secrets would reopen 3D and create the generic infrastructure abstraction that 3D explicitly rejected.

### 2.3 Durable record inventory is closed — 3E-02

The F1 durable domain inventory is closed at 46 record classes.

Connections has only:

```text
con.connection
con.connection_revision
con.connection_qualification
```

`con.connection` stores only semantic facts equivalent to:

```text
credential backend/ref
logical grant version/facts
```

Secret material remains outside the Connections domain record model.

A new durable `Secret`, `Credential`, `CredentialGrant`, `CapabilityToken` or similar domain record requires Decision Loop with a real lifecycle/failure class.

### 2.4 3I-01 already owns WHO MAY mutate credential state

3I-01 freezes:

```text
credential create/replace/revoke eligibility
→ security-sensitive mutation
→ current pre-state authority
→ owner-specific permission
→ atomic against concurrent revocation of authority facts consumed
```

Therefore this custody decision must **not** re-decide roles, who may create/replace/revoke credentials, or self-grant semantics.

It consumes 3I-01.

### 2.5 C-007 / C-016 already constrain the F1 vault shape

C-007 freezes a Phase-1 Hub-owned credential backend conceptually equivalent to:

```text
hub-vault
→ authenticated encryption
→ master key outside database
→ key_version
→ ciphertext bound to its Connection/environment context
→ no plaintext in logs/errors/artifacts
```

The concrete cipher is an implementation pin, not domain authority.

C-016 explicitly rejects **external Vault/KMS in F1 without trigger** and keeps credential entry write-only through a platform route; chat/agent never receives the secret.

C-016 also freezes:

```text
key_version
!= refresh_generation
```

for future rotating-refresh-token machinery.

### 2.6 Guest durable-secret prohibition survives; the old guest LLM-key instance does not — C-008 + 3A-R5 + 3H

Still frozen:

```text
durable ERP/Connection credential → never E2B guest
durable Git write credential      → never E2B guest
provider provisioning/master key  → never E2B guest
```

3A-R5 moved the Builder model loop control-side:

```text
durable model-provider credential
→ does not need to enter E2B guest
```

Therefore the old C-008 guest-readable per-run LLM-key **instance fails the deletion test and is not a baseline F1 consumer anymore**.

The surviving law remains:

```text
if a guest-readable capability has a named current consumer
→ ephemeral
→ scoped
→ bounded
→ revocable
→ server-side expiry/revocation is authoritative
```

C-013 currently names one real guest capability:

```text
sandbox telemetry ingest
→ hub-issued ephemeral capability
→ server-bound Project + ActorRun + event-type scope
→ guest cannot authoritatively choose project_id / actor_run_id / source / revision identity
```

### 2.7 Secret observations never become authority

C-013/3H/3I-01 already freeze:

```text
logs / traces / guest/provider telemetry
-X-> authorization authority
```

Audit may prove a security operation happened; it never becomes the current credential/grant authority.

---

## 3. Current external evidence — evidence only, never Conexus authority

Primary/current sources checked on 2026-08-17.

### OWASP Secrets Management Cheat Sheet

Relevant transfer:

```text
centralize/control secret storage and lifecycle where a real shared custody boundary exists
least privilege
revocation/expiration
never log plaintext secrets
attribute secret administration/use where useful
backup critical secret material separately
```

OWASP also explicitly warns against storing encryption keys next to the secrets/data they protect.

Source:

- https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

### OWASP Cryptographic Storage Cheat Sheet

Relevant transfer:

```text
encryption keys should be separate from encrypted data where possible
DEK/KEK envelope structure can improve separation
more infrastructure separation improves protection
```

This supports key/data separation; it does **not** prove F1 needs external KMS or per-secret envelope encryption now.

Source:

- https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html

### NIST SP 800-57 Part 1 Rev. 5

Provides current general key-management guidance around protection, lifecycle, backup/recovery, compromise, access control and key-management functions.

Source:

- https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final

### Google Cloud KMS — envelope encryption

Current primary documentation confirms the standard distinction:

```text
DEK encrypts data
KEK wraps DEK
KEK remains in central key service
```

Envelope encryption improves large-scale/selective key management, but the same source frames its benefits around scale/centralized key management. C-007 already makes per-credential DEK/envelope a trigger, not F1 baseline.

Source:

- https://cloud.google.com/kms/docs/envelope-encryption

### E2B sandbox persistence

Current E2B documentation states pause/resume preserves filesystem **and memory**, including running processes and loaded variables; paused sandboxes are retained indefinitely and runtime windows reset after resume.

Consequence:

> **A capability placed in guest memory cannot rely on sandbox runtime lifetime for expiry.**

Expiry/revocation must be server-side.

Source:

- https://e2b.dev/docs/sandbox/persistence

---

## 4. Known / Inferred / Unknown / Deferred

### KNOWN

1. `CredentialBackend` is an approved infrastructure seam with only `Connections + Gateway` as current consumers.
2. Connections owns logical grant/handle relationship; CredentialBackend owns secret bytes/crypto mechanics.
3. Secret bytes are not a ConnectionRevision/Release/Git/browser/guest fact.
4. Logical grant version and crypto key version are different meanings.
5. 3I-01 already owns credential mutation eligibility.
6. External Vault/KMS is explicitly not F1 baseline under current authority.
7. Durable model-provider credential is control-side after 3A-R5 and does not need to enter E2B.
8. Current guest-readable named consumer exists for telemetry ingest.
9. E2B pause/resume can preserve a leaked guest capability indefinitely unless the authority expires server-side.
10. 3E-02 does not admit a generic durable Secret/Credential/CapabilityToken domain record.

### INFERRED — candidate decisions to attack

1. F1 should keep a **Hub-local CredentialBackend** for Connection secrets rather than adopting external KMS/Vault now.
2. The root/master key should remain outside encrypted credential storage and outside the ordinary data-backup payload; recovery material must follow a separate custody path.
3. Plaintext should exist only at write ingress and at the narrow trusted last-mile consumer that must present it externally.
4. `Connections` should never receive credential plaintext even though it owns logical credential relationship semantics.
5. Gateway should not expose a general `getSecret(handle): string` capability to arbitrary modules/runtime callers.
6. Platform operational credentials should obey the same no-leakage/least-lifetime laws but remain owner-specific deployment secrets, **not** become CredentialBackend records/consumers.
7. A single F1 root/KEK with versioned authenticated encryption is sufficient; per-secret DEK/envelope machinery has no current failure class.
8. Master-key rotation needs a crash-safe property, but not a rotation framework/domain state machine.
9. Secret admin/mutation/rekey/recovery actions require metadata-only audit; ordinary credential use can rely on existing Gateway/runtime observations rather than duplicate one audit record per use by default.
10. F1 must state the residual risk honestly: full compromise of the trusted Hub process may expose credentials the process is authorized to use; local at-rest encryption is not an HSM/process-isolation claim.

### UNKNOWN — do not turn into convenient defaults

1. Exact physical backing of encrypted CredentialBackend payloads, provided it does not create a new domain record/schema/database or violate 3E.
2. Exact host mechanism for supplying root/master key (`systemd` credential, host file, OS secret store, another narrow host mechanism).
3. Exact crypto library, nonce plumbing, serialized ciphertext format and atomic filesystem/storage spelling.
4. Exact future DEDICATED credential mechanism and whether it requires new durable key/grant lifecycle state.
5. Whether a future multi-tenant/cloud/compliance threat model requires external KMS/HSM or process-isolated credential service.

### DEFERRED

```text
physical host key injection / permissions / rotation runbook       → 3J + implementation
exact crypto/library/version proof                                  → implementation / 3L if version-sensitive
orphan secret blob after failed cross-store update                  → 3M if realization can produce it
rotating refresh-token state machine                                → C-016 trigger / Decision Loop
DEDICATED authentication key issuance/revocation                    → later 3I Trusted Exchange
model per-run spend                                                  → separate 3I family
Hub control-side egress                                              → later 3I Trust Zones/Crossings
PostgreSQL login role topology                                       → later 3I least-privilege family
external KMS/HSM/process-isolated secret service                     → Decision Loop on real threat/compliance/scale trigger
```

---

## 5. Root Cause

The unresolved defect is not “we need a vault product.”

It is:

> **secret-bearing capability can escape its legitimate owner/use boundary, survive longer than its authority, or become a second authorization model if custody, logical grant meaning, cryptographic key lifecycle and runtime exposure are not kept mechanically distinct.**

Unsafe examples:

```text
ConnectionRevision contains API key
→ immutable Release/Git/history now contains revocable secret

Connections reads credential plaintext
→ domain module becomes secret consumer despite Gateway-only execution boundary

CredentialBackend becomes universal SecretService
→ Git/E2B/model/DB/backup identities become one generic credential domain
→ 3D ownership collapses

key_version rotates
→ qualification/release incorrectly invalidated

logical credential replaced
→ old grant version still usable from stale handle

DB/B2 backup contains ciphertext + root key
→ one backup compromise yields plaintext

E2B guest capability relies on VM timeout
→ pause/resume preserves it for weeks

Hub logs request headers/body/error
→ credential leaks into OBS/evidence
```

---

## 6. Target invariants

### C1 — Domain meaning and secret bytes stay separate

```text
Connections
→ owns credential handle/logical grant facts
-X-> secret plaintext/ciphertext semantics

CredentialBackend
→ owns secret storage/crypto mechanics
-X-> Connection authorization/qualification meaning
```

### C2 — Plaintext has two narrow legitimate appearances

For Connection credentials:

```text
A. write-only administration ingress
B. trusted last-mile external-auth execution inside Gateway/credential strategy
```

Never as a normal domain read result, agent/chat context, browser read-back, log, artifact, Release or guest payload.

### C3 — Root key and encrypted data do not share one compromise path

> **Possession of the ordinary encrypted-data/backup set alone must not be sufficient to decrypt Connection credentials.**

Root/master key and its recovery material remain separate from credential ciphertext and from the ordinary backup object/location/credential path.

### C4 — Logical grant lifecycle != cryptographic lifecycle

```text
logical grant / credential-binding version
!= crypto key_version
!= transient access-token generation
!= future refresh_generation
```

No axis silently substitutes for another.

### C5 — CredentialBackend remains narrow

```text
CredentialBackend consumers F1 = Connections + Gateway
```

Platform technical credentials may reuse security **principles**, not automatically this port/domain.

### C6 — Guest authority cannot outlive server authority

Every named guest-readable capability is:

```text
hub-minted
ephemeral
scoped to exact consumer/run
bounded in authority
server-expiring
server-revocable
non-refreshable/non-mintable by guest
```

Sandbox lifetime is never the expiry authority.

### C7 — Secret operations are auditable without logging secrets

Security-relevant administration/key operations emit metadata-only audit/evidence. Secret bytes/ciphertext are not copied into audit payloads.

### C8 — No false process-compromise claim

F1 at-rest custody protects against repo/DB/backup/guest/browser exposure classes. It does **not** claim that a fully compromised trusted Hub process cannot access credentials that process is legitimately empowered to use.

---

## 7. Credible alternatives

### Alternative A — Owner-preserving custody + narrow Hub CredentialBackend

Shape:

```text
Connection secrets
→ narrow CredentialBackend
→ Hub-local encrypted backing
→ root/master key outside encrypted data/ordinary backup
→ plaintext only at ingress + Gateway last-mile use

platform operational secrets
→ owner-specific deployment custody
→ same no-leakage principles
-X-> no universal CredentialBackend record

guest capabilities
→ named ephemeral capability only
```

**ADOPT / GLOBAL MAXIMUM candidate.**

Why:

- preserves 3C/3D ownership;
- satisfies current durable Connection consumer;
- keeps no-secret guest/runtime laws;
- avoids a new domain record;
- avoids external KMS operational burden without blocking migration later;
- external KMS/process isolation can be added behind custody seams if the threat model changes.

### Alternative B — Universal `SecretService` / `Credential` domain

Shape:

```text
all Connection/Git/E2B/model/DB/backup secrets
→ SecretService
→ SecretRecord
→ universal handle/use policy
```

**REJECT.**

Failure:

- reopens 3D consumer boundaries without need;
- creates one generic authority over unrelated credential lifecycles;
- pressures 3E to add durable record classes;
- invites generic secret ACL/policy engine;
- makes shared mechanics own differentiated security meaning.

### Alternative C — External Vault/KMS/HSM now

**REJECT / DEFER for F1.**

Benefits are real for stronger operational separation, key audit and scale. Current authority explicitly has no consumer requiring it, and a compromised Hub process that is authorized to request decrypt can still abuse that authority.

Re-entry requires a material threat/scale/compliance reason, not “production systems use Vault.”

### Alternative D — Per-credential DEK + envelope encryption now

**REJECT / DEFER.**

C-007 already names it as a trigger for selective rotation/external KMS/scale. F1 has no current selective-rekey or high-volume key-management requirement that pays for DEK lifecycle machinery.

### Alternative E — Store plaintext/API keys in environment/config per Connection

**REJECT.**

Cannot safely support dynamic Workspace/Project Connections, write-only replacement, revocation, qualification/grant versioning, audit or bounded exposure. It also increases accidental inheritance to child processes/guests.

---

## 8. Credential classes — do not unify by accident

### 8.1 Connection credentials — current CredentialBackend consumer

Examples:

```text
password
client_secret
refresh token when a real provider later requires it
API key
private signing key when a connector auth strategy requires it
```

Semantic flow:

```text
admin write-only ingress
→ current 3I-01 eligibility
→ CredentialBackend stores/updates encrypted material
→ Connections stores opaque backend/ref + logical grant facts
→ Gateway resolves exact current Connection execution facts
→ CredentialBackend supplies material only to trusted Gateway auth/use path
→ external call
```

Connections owns the grant relationship, qualification and current eligibility semantics; CredentialBackend cannot turn ciphertext existence into ALLOW.

### 8.2 Platform operational credentials — NOT Connection credentials

Current examples:

```text
Git write credential
E2B provider/control API credential
model-provider API credential
PostgreSQL runtime/login credential
backup-storage credential
```

They obey:

```text
never Git/project artifact
never browser read-back
never guest unless a separately approved ephemeral capability exists
least owner scope
no generic logging
```

But they remain deployment/runtime credentials of the owning infrastructure boundary.

**This decision does not make them `CredentialHandle`, `Connection`, or CredentialBackend consumers.**

Their concrete host injection/rotation belongs to 3J/implementation; the model-provider credential is additionally constrained by the separate per-run spend decision.

### 8.3 Guest-readable ephemeral capabilities

Current closed baseline:

```text
telemetry ingest capability = YES, named consumer
per-run guest LLM key       = DELETE from F1 baseline after 3A-R5
```

No universal guest token service is created.

Future guest capability must enter by named consumer and re-run the C-008 deletion test.

---

## 9. Connection CredentialBackend semantic contract

3I should freeze **properties**, not TypeScript signatures.

### 9.1 Opaque handle only

Domain/runtime callers use an opaque reference.

Prohibited public shape:

```text
getSecret(handle) → string
listSecrets()
exportSecret(handle)
```

A trusted backend adapter may internally materialize plaintext for the exact last-mile operation, but ordinary module/runtime APIs do not return it.

### 9.2 Write-only ingress

Credential administration flow:

```text
human browser holds plaintext while entering it
→ HTTPS/platform administration request
→ server validates current 3I-01 mutation authority
→ secret enters CredentialBackend
→ response contains only safe status/metadata
```

Conexus never promises that the browser did not momentarily hold what the human typed. The invariant is **no server-side secret read-back/echo after submission**.

Do not expose by default:

```text
secret suffix
secret hash/fingerprint derived from low-entropy credential
ciphertext
provider token
```

Safe provider/account metadata discovered independently by Qualification may be displayed because it is not the credential value.

### 9.3 Authenticated context binding

Stored ciphertext must be cryptographically bound to stable expected context sufficient to prevent ciphertext substitution across credential handles/Connections/targets.

Exact AAD fields are implementation, but the property must prove:

```text
ciphertext copied from credential A
→ cannot be accepted as credential B merely by swapping database/file refs
```

This preserves the C-007 binding-to-Connection/environment invariant without freezing serialization.

### 9.4 Missing/corrupt material fails closed

```text
unknown credential_ref
unsupported crypto format/key_version
AEAD/authentication failure
missing root key
corrupt ciphertext
→ no external request using guessed/default credential
→ sanitized failure/evidence
```

Never fallback to environment/global credential by convenience.

### 9.5 Backend does not own logical ALLOW

```text
ciphertext exists / decrypt succeeds
-X-> Connection eligible
```

Gateway still intersects current Connection/grant/Release/approval/budget/precondition facts.

Backend unavailability/corruption may only narrow to DENY/UNAVAILABLE.

---

## 10. Plaintext lifecycle

For durable Connection secrets:

```text
plaintext at write ingress
→ transient Hub memory
→ authenticated encryption
→ ciphertext at rest

later Gateway external use
→ exact current authority gates first
→ decrypt/materialize as late as practical
→ apply auth/signing/request
→ do not persist plaintext
```

Forbidden:

```text
Connections domain object with plaintext
RequestContext with plaintext
Mastra memory/thread with plaintext
E2B env/file/process with durable credential
browser response with plaintext
structured log/error/audit/evidence with plaintext
Release/Git/Registry payload with plaintext
```

### Managed-runtime honesty

Node/managed runtimes do not permit a credible architecture claim that every secret copy is deterministically zeroized from process memory immediately.

Therefore F1 freezes the enforceable property:

```text
minimize plaintext lifetime
never deliberately persist/log/copy it outside the trusted use boundary
```

It does **not** claim memory-forensics resistance against a fully compromised Hub process.

---

## 11. Root/master-key custody and crypto lifecycle

### 11.1 F1 baseline

Adopt the existing C-007 local `hub-vault` direction:

```text
one active Hub root/KEK generation at a time for new writes
+ previous decrypt generation(s) only during bounded rekey
+ authenticated encryption format with crypto key_version
```

Exact algorithm/library remains implementation qualification; existing C-007 AES-GCM implementation pin is not redefined here.

### 11.2 Root key outside encrypted-data trust path

Root/master key is never stored in:

```text
hub_control domain rows
Connection/ConnectionRevision
Git/Registry/Release
E2B
ordinary database/blob backup payload
same B2/backup object or credential path as encrypted credential data
```

Exact host-storage/injection mechanism is 3J/implementation.

### 11.3 Crash-safe rekey property

Crypto rekey must not turn valid logical credentials into partial-loss state.

Property:

```text
new key generation introduced
→ new writes may use new generation
→ old referenced generation remains decrypt-capable while any ciphertext still references it
→ each ciphertext migration is authenticated/verified
→ old generation retires only after zero live ciphertext references + recovery proof
```

Crash halfway:

```text
-X-> secret loss
-X-> grantVersion change
-X-> ConnectionRevision change
-X-> Release change
```

Resume/retry continues crypto maintenance only.

No generic KeyRotation FSM/domain record is introduced by this property.

### 11.4 Logical credential compromise vs root-key compromise

Different incidents:

```text
one provider credential compromised
→ provider-side credential/grant rotate/revoke
→ Connections logical grant facts/version update as applicable

root/master key compromised
→ crypto-root incident
→ rotate root key + re-encrypt ciphertext
→ also rotate external credentials whose plaintext exposure cannot be ruled out
```

Exact incident runbook belongs to 3J/3M.

---

## 12. Logical grant version × cryptographic key version

The decision must preserve a strict axis table:

| Event | Logical grant/binding version | Crypto `key_version` | ConnectionRevision | Release |
|---|---:|---:|---:|---:|
| re-encrypt same plaintext under new root key | no | yes | no | no |
| change ciphertext format without changing external credential | no | maybe | no | no |
| reacquire transient access token under same external grant | no | no/infra-only | no | no |
| replace/reauthorize material such that credential/grant identity or qualification basis changes | yes | independent | no unless non-secret target/config changed | no by secret change alone |
| revoke logical grant | current eligibility revoked | independent | no | historical Release unchanged |
| change endpoint/tenant/non-secret target semantics | independent | independent | yes | later Release/binding adoption required |

Exact rule for a future rotating refresh-token generation remains the C-016 trigger; this decision does not invent that FSM.

---

## 13. Guest-readable capability law

### 13.1 Named-consumer admission

No guest capability exists because “agents may need tokens.”

It exists only when a named current consumer cannot be safely realized without it.

Current named baseline:

```text
sandbox telemetry ingest
```

### 13.2 Capability properties

A guest-readable capability must be:

```text
minted/authorized by Hub, never guest
bound server-side to exact consumer/run/scope
ephemeral with server-side expiry
revocable server-side
bounded in operation/data/effect authority
non-refreshable or refresh controlled only by trusted Hub boundary
not reusable across ActorRun/Project/consumer
not embedded in template/snapshot/Git/evidence/logs
```

For telemetry ingest specifically:

```text
Hub derives ProjectId + ActorRunId + producer trust/source
Guest supplies event content within allowed event types
Guest cannot widen authoritative identity fields
```

### 13.3 E2B pause/resume law

Because E2B preserves memory/files/process variables and paused sandboxes can persist indefinitely:

```text
capability expiry
-X-> sandbox timeout
-X-> process lifetime
-X-> pause state
```

The Hub/server validates expiry/revocation on every capability use.

A resumed sandbox holding old bytes receives DENY.

### 13.4 Deleted guest LLM-key instance

F1 baseline explicitly removes:

```text
ActorRun guest-readable LLM provider key
```

The C-008 *test* survives; this specific mechanism does not.

If `CX-BUILDER-MASTRA-01` proves an unavoidable guest-side model call for an enabled path, that is a qualification Finding and returns through Decision Loop/3I rather than silently reviving the old mechanism.

---

## 14. Audit / observability / secret-safe diagnostics

### 14.1 Audit-required security operations

At minimum, existing audit boundary must record metadata for successful/failed security administration equivalent to:

```text
credential created/replaced/revoked
logical grant relation changed
root/key generation introduced/retired
credential backend recovery/import action
privileged secret-administration failure
```

Metadata may include:

```text
credential handle/ref identity
Connection/owner scope refs
operation type
actor/principal responsible where applicable
logical grant version
crypto key_version
outcome
correlation/time
```

Never:

```text
plaintext
ciphertext
raw auth header
refresh/access token
private key
reversible secret fingerprint
```

### 14.2 Ordinary credential use

Do **not** automatically create a second high-volume secret-access audit ledger.

Gateway already records controlled capability/effect/traffic observations. Normal credential use should be attributable through those existing owner/effect events without duplicating secret material or creating another authority.

A future compliance requirement for per-decrypt audit can return through Decision Loop/implementation under the same semantic owners.

### 14.3 Error/redaction law

Credential/backend errors expose only safe typed failure + correlation.

Generic request/exception logging must not serialize:

```text
Authorization headers
credential request body fields
decrypted payloads
provider secret responses
```

C-016 sanitization remains authoritative; this decision only applies it to custody paths.

---

## 15. Backup / restore custody

### 15.1 Confidentiality property

Encrypted credential backing may be part of the normal recoverable platform backup set.

But:

> **ordinary backup-storage compromise alone must not yield credential plaintext.**

Therefore root/master key and its recovery copy are not stored in the same backup object/location/credential path as ciphertext.

### 15.2 Recoverability property

Separation cannot silently make disaster recovery impossible.

3J must define and prove a recovery path equivalent to:

```text
restore encrypted credential backing
+ separately supplied authorized recovery key material
→ decrypt a known recovery fixture / re-establish credential backend
```

Negative proof:

```text
restored encrypted backup without recovery key
→ cannot decrypt fixture
```

Exact cold-storage medium, operator procedure and cadence belong to 3J.

### 15.3 Backup credentials are not key custody

Credential used to write/read backup storage is not the encryption root key and must not make the same compromise path sufficient for both ciphertext and key material.

---

## 16. Accepted residual risk / threat-boundary honesty

F1 local Hub custody protects strongly against:

```text
repo leak
generated app leak
browser read-back
E2B/root guest compromise
DB/backup theft without root key
accidental logging/telemetry
cross-Connection ciphertext substitution when binding is enforced
```

It does **not** claim protection from:

```text
full arbitrary-code compromise of the trusted Hub process
operator/host compromise with access to both root key and encrypted data
external provider compromise
```

A separate KMS/HSM/process-isolated credential service becomes materially justified when a named threat/compliance/scale requirement demands that key custody remain outside the Hub process/host or demands independently controlled decryption policy/audit.

Prepare the seam; do not build the future system now.

---

## 17. Enforcement candidates

### E1 — Domain model excludes secret payload

Connection/ConnectionRevision/Release/Registry contracts cannot carry credential-value fields.

### E2 — Write-only platform route

Credential-value input accepted only on the authorized administration boundary; no read-back contract exists.

### E3 — Narrow CredentialBackend call graph

Only Connections/Gateway wiring can reach the Connection credential backend per 3D; agent/browser/Builder/PAR/MAR/domain DTOs have no secret-resolution path.

Connections uses handle/mutation semantics; Gateway is the trusted plaintext consumer for external execution.

### E4 — Authenticated encryption + context binding

Ciphertext corruption/substitution fails authentication; crypto metadata is explicit/versioned.

### E5 — Root key source separated

Startup fails closed when required root key is absent/invalid. No fallback hardcoded/default key.

### E6 — Current grant eligibility before decrypt/use

Gateway current gates resolve Connection/grant eligibility before last-mile use. Historical Release/ref cannot force decryption/use of revoked grant.

### E7 — Guest capability server validation

Every guest capability request hits authoritative expiry/revocation/scope validation outside guest control.

### E8 — Secret-safe audit/logging

Audit/log schema uses explicit safe fields; no generic object dump of credential ingress/decrypt context.

---

## 18. Proof strategy

Future implementation/qualification must be able to falsify at least:

### Connection secret path

1. create/replace secret → platform response never contains original secret/ciphertext;
2. Connection/ConnectionRevision/Release/Registry serialization contains no secret value;
3. Connections-domain code cannot request plaintext through its public model/API;
4. arbitrary Builder/PAR/MAR/guest path cannot invoke Connection secret resolution;
5. revoked logical grant + old Release/handle → Gateway refuses before external use;
6. missing/corrupt ciphertext or unknown key_version → fail closed; no fallback credential;
7. copy ciphertext/ref from Connection A into B → authentication/context-binding proof fails;
8. credential/backend error cannot leak secret/header/request body into public error/log fixture.

### Version-axis proof

9. root-key re-encryption only → grant version unchanged; qualification remains semantically valid; no Release change;
10. transient access-token refresh under same grant → no ConnectionRevision/Release/grant-version change;
11. credential replacement/reauthorization requiring new logical grant basis → logical version changes independently of crypto key_version;
12. logical revoke → current use denied while historical ConnectionRevision/Release stays immutable.

### Rekey / recovery

13. crash midway through root-key rekey → every committed credential remains decryptable under an admitted key generation; no partial silent loss;
14. old key cannot retire while live ciphertext still references it;
15. encrypted backup alone cannot decrypt recovery fixture;
16. encrypted backup + separately authorized recovery material can restore fixture;
17. root/master key never appears in ordinary DB/B2 backup payload.

### Guest capability

18. baseline Builder E2B contains no model-provider durable/ActorRun LLM key;
19. guest telemetry capability for ActorRun A cannot ingest as ActorRun/Project B;
20. capability expired/revoked server-side remains denied after E2B pause/resume even when old bytes survive in memory/filesystem;
21. guest cannot mint/refresh/widen its own capability;
22. template/snapshot/bundle/log/evidence scans contain no guest capability intended to survive its run.

### YAGNI / boundary

23. Git/E2B/model/DB/backup platform credentials remain owner-specific and are not turned into Connection CredentialBackend records merely for uniformity;
24. no new durable Secret/Credential/CapabilityToken domain record is needed to satisfy the above;
25. no external Vault/KMS/HSM or per-secret envelope lifecycle is required to satisfy the current F1 failure classes;
26. if future threat model demands Hub-process-resistant key custody, the current seam allows replacement without changing Connection/Release semantics.

---

## 19. Routing to later phases

```text
exact encrypted backing primitive/path                           → implementation/3J; may not add new domain record/schema/database silently
host root-key injection/permissions/recovery runbook             → 3J
exact crypto library/format/nonce/AAD spelling                   → implementation; 3L when version behavior is load-bearing
root-key incident + platform operations                          → 3J
orphan encrypted payload / partial external-store failure repair → 3M if chosen realization can produce it
DEDICATED app credential/key issuance/revocation                 → later 3I Trusted Exchange
per-run model spend enforcement                                  → separate 3I family
Hub outbound egress/telemetry crossings                          → later 3I Trust Zones
DB login-role least privilege                                    → later 3I DB family
rotating refresh token provider lifecycle                        → C-016 trigger / Decision Loop
external KMS/HSM/process-isolated broker                          → Decision Loop on named threat/compliance/scale consumer
```

A physical storage choice that requires a new database/schema/domain record is **not implementation detail**; it must return to Decision Loop because 3E-02 closed that inventory.

---

## 20. Reopen triggers if this candidate is ratified

1. a current consumer requires credential plaintext outside the Gateway Connection-use boundary;
2. a second true consumer requires `CredentialBackend` with the same lifecycle/failure class and justifies reopening 3D;
3. Hub-process/host compromise becomes an unacceptable credential-confidentiality assumption;
4. multi-Hub/cloud/compliance requirement needs independently controlled KMS/HSM/decrypt audit;
5. credential count/rekey cost proves one-root direct encryption materially insufficient and per-secret DEK/envelope pays for itself;
6. a real provider requires rotating-refresh-token state beyond existing logical-grant semantics;
7. a new guest capability cannot satisfy ephemeral/scoped/bounded/revocable law;
8. implementation proof shows encrypted backing cannot fit 3E constraints without a new durable record/schema/database;
9. backup/key separation prevents acceptable recovery or cannot be operationally proven.

---

## 21. Adversarial questions for Fable

Fable must reconstruct authority independently and attack at least:

1. **3D boundary:** Is keeping `CredentialBackend` limited to Connections+Gateway correct, or is there a real F1 reason model/Git/E2B/DB/backup credentials must become consumers? If expanding, identify the failure class and 3D reopen explicitly.
2. **3E storage tension:** Does the local Hub CredentialBackend require a durable record/schema/database that 3E-02 did not admit? If yes, classify this as a Material Finding rather than hiding it as implementation. If no, show a credible realization class and why the physical backing remains infrastructure storage rather than new domain authority.
3. **Plaintext boundary:** Is “write ingress + Gateway last-mile use” complete for Connection secrets? Find any current auth strategy requiring a third legitimate plaintext consumer.
4. **One root key:** Is one versioned Hub root/KEK actually sufficient F1, or does a concrete current failure class require per-secret DEKs/envelope encryption now?
5. **Rekey crash:** Is the bounded old+new key-generation overlap enough to prevent partial secret loss without inventing a rotation FSM/record?
6. **Logical version:** Tighten the exact line between `logical grant version`, provider credential replacement, transient token refresh and crypto `key_version`; do not let the same event increment multiple axes by convenience.
7. **Revocation:** Does logical revoke need the backend to delete/disable ciphertext synchronously, or is Connections/Gateway fail-closed eligibility enough with physical cleanup later? Avoid creating second revocation authority.
8. **Audit:** Which secret operations must be audit-required in F1, and is ordinary per-use audit duplication unnecessary given Gateway evidence?
9. **Guest capability:** Does telemetry ingest remain the only named current guest capability after deleting the LLM-key instance? Check current 3H/C-013 authority for any other consumer before claiming closure.
10. **Pause/resume:** Can any client-side/sandbox lifetime control satisfy expiry, or must every guest capability check server-side authority on use?
11. **Backup:** Is backup-custody separation sufficient and recoverable? Challenge whether “same backup credential path” is too strong/too weak.
12. **Residual risk:** Is accepting full Hub-process compromise as outside F1 at-rest custody honest and proportionate, or does current product already require process/KMS isolation?
13. **Platform credentials:** Do model/Git/E2B/DB/backup technical credentials need stronger 3I laws now beyond no-leakage + owner-specific deployment custody, or would further design actually belong to 3J/G/Families D/F?
14. **No new record:** Can all current facts be represented by existing `con.connection` logical grant facts + infra backing + existing audit records? If not, prove the unavoidable lifecycle before admitting a record.
15. Does any finding require reopening C-007/C-008/3C-07/3D/3E/3I-01? Preference or generic security best practice is not enough.

---

## 22. Provisional candidate outcome before independent review

```text
Material Finding against approved authority = NONE found by ChatGPT so far
prior reopen required                      = NONE currently
candidate family                           = Credential & Capability Custody
recommended alternative                    = A / owner-preserving narrow custody
new Hub module                             = 0
new durable record class                   = 0
new database/schema                        = 0
new generic Secret/Credential service      = 0
new CredentialBackend consumer             = 0
external Vault/KMS/HSM                     = 0 F1
per-secret DEK/envelope machinery          = 0 F1
new guest LLM key                          = 0
guest capability framework                 = 0
technology product selected                = 0
```

The next action is independent adversarial review. **Do not number or ratify this as `3I-02` until the review converges and the operator approves.**

---

## 23. Fable independent adversarial review

**Fable: reconstruct the applicable authority from the repository, challenge the candidate above independently, research current primary sources where a claim depends on live technology behavior, and edit below this line only. Focus especially on the 3E storage tension, CredentialBackend consumer boundary, logical-grant/key-version semantics, crash-safe rekey, backup/key separation, guest-capability consumers and Hub-process residual risk. Do not alter LEDGER, approved authority or product code.**

---

**Method:** DevelopmentConexus Engineering Method v1.0.0 applied. Authority reconstructed independently from the `AGENTS.md` chain with direct reads of 3C-07 (including the "Quem realiza external I/O da Qualification" section and Finding 3C-07-A), 3D-04 (infrastructure seam table and Gateway dependency rows), 3E-01 §10/§13, 3E-02 (Connections inventory + F3E02-R2 verbatim), 3I-01, and the C-006/C-007/C-008/C-013/C-015/C-016/3A-R5 records in `DECISOES.md` — the candidate's §2 synthesis was verified against these, not trusted. No new primary-source research pass was run this round: the only live-technology dependency in this family (E2B pause/resume persistence) already carries a dated primary-source citation in §3 that matches the independent research recorded in the 3I intake dialogue, and every other property rests on stable standards the candidate already cites. Nothing below selects a technology or numbers a decision.

## F.1 Verdict

Alternative A survives all ten attack targets, including the two designed to kill it. On the decisive question — the 3E storage tension — the answer is **NO Material Finding**, and not by charity: 3E-02's own F3E02-R2 explicitly states "3E-02 não congela secret table/provider/crypto storage layout" and routes physical secret custody to "3I / implementation of credential infrastructure". The inventory closure closed the **domain** record model; it deliberately left the CredentialBackend physical backing open, and a credible realization class exists that adds no record/schema/database (F-1). The consumer boundary holds as frozen (F-2), the plaintext two-appearance law is **complete** because frozen 3C-07 already places qualification's external I/O inside the Gateway (F-3), and the remaining findings are bounded sharpenings: transient-token custody (F-4), the rekey property's sufficiency argument (F-5), backup separation restated as compromise-path disjointness (F-6), guest-capability closure with the OTLP-push classification (F-7), and audit/residual-risk confirmation (F-8). **Material Finding against approved authority = NONE; reopen of C-007/C-008/3C-07/3D/3E/3I-01 = NOT JUSTIFIED.** Method outcome: **CURRENT STRUCTURE CONFIRMED** with bounded corrections.

## F.2 Findings

### F-1 — The 3E storage tension resolves with an existence proof, not a concession: physical backing is infra by 3E's own routing, and a no-new-record realization class exists

```text
claim challenged      §21-Q2 — does a Hub-local CredentialBackend require a
                      durable record/schema/database that 3E-02 did not admit?
analysis              three facts, all frozen, compose the answer:
                      1. F3E02-R2 (verbatim): "con.* guarda somente credential
                         backend/ref + logical grant/version facts necessários.
                         Secret custody físico pertence à infra boundary
                         CredentialBackend" — owner: "3I / implementation of
                         credential infrastructure", and "3E-02 não congela
                         secret table/provider/crypto storage layout."
                         The inventory closure and this routing were written
                         TOGETHER: the 46-class closure is a closure of domain
                         record classes, with physical secret custody
                         explicitly carved out — not an oversight this
                         candidate must apologize for.
                      2. the repo already has two precedents for durable
                         non-domain storage referenced opaquely: C-015 blob
                         custody (filesystem CAS + hub_control index) and the
                         mastra_* substrate pattern (3E-01 §10: correlation by
                         opaque runtime IDs, "Não existem FKs para tabelas
                         Mastra").
                      3. therefore at least one realization class satisfies
                         every constraint with ZERO new domain
                         record/schema/database: a Hub-filesystem encrypted
                         backing addressed by the opaque `credential_ref`
                         already stored in `con.connection`, with no FK, no
                         domain read path, no domain lifecycle — infra storage
                         in exactly the sense 3D froze the seam. Ciphertext is
                         not rebuildable (unlike projections) but it is
                         recoverable (§15), which is the correct durability
                         class for secret material.
                      what WOULD be a Material Finding — and must stay a
                      tripwire, not be softened: a realization that needs
                      domain semantics (FKs from domain records into the
                      backing, domain reads of backing rows, a lifecycle other
                      modules observe) or a new hub_control schema/database.
                      §19's sentence "not implementation detail; must return
                      to Decision Loop" is the correct guard — keep it
                      verbatim in the decision text, and extend it explicitly:
                      an in-database backing variant (new table/schema in
                      hub_control) is NOT admitted silently by this decision
                      either; it re-enters through the same tripwire because
                      3E-01 closed hub_control's owner-schema topology.
smallest correction   state the admitted realization CLASS (infra backing,
                      opaque-ref, FK-free, domain-opaque, recoverable) and
                      both precedents in the decision text, so implementation
                      inherits a proven shape instead of re-deriving it — and
                      keep the Decision Loop tripwire for anything heavier.
reopen prior authority?  NO — 3E-02 routed this here by name
later owner           implementation/3J within the stated class; Decision
                      Loop for any in-DB/schema/record variant
```

### F-2 — Consumer boundary holds: `CredentialBackend = Connections + Gateway`; uniformity is not a failure class

```text
claim challenged      §21-Q1/Q13 — should Git/E2B/model/DB/backup credentials
                      become CredentialBackend consumers?
analysis              verified frozen: 3D-04 seam table reads "CredentialBackend
                      → Connections + Gateway → secret material/custody
                      substituível já é invariante". Searching for a real
                      failure class that expansion would eliminate finds none:
                      the platform credentials differ from Connection
                      credentials on every axis that justified the backend —
                      no dynamic per-Workspace/Project creation, no write-only
                      admin ingress by end users, no qualification/grant
                      versioning, no Release binding, no browser surface.
                      Their real risks are already owned elsewhere: leakage
                      laws (this family §8.2), host injection/rotation (3J),
                      model spend (Family D), egress (Family F), DB privilege
                      (Family G). Expansion would buy uniformity and pay with
                      a 3D reopen plus a generic secret domain — Alternative B,
                      correctly rejected. One sharpening: the decision text
                      should state the REUSE RULE positively — platform
                      credentials reuse the custody PRINCIPLES (no-leakage,
                      least lifetime, fail-closed on missing, metadata-only
                      audit) as laws applied at their own boundaries, so
                      "not a CredentialBackend consumer" never gets misread as
                      "exempt from custody law".
reopen prior authority?  NO
later owner           decision text (reuse rule); 3J/D/F/G as routed
```

### F-3 — The plaintext two-appearance law is complete — and it is complete because frozen 3C-07 already decided the near-miss

```text
claim challenged      §21-Q3 — is "write ingress + Gateway last-mile" complete,
                      or does a third legitimate plaintext consumer exist?
analysis              the one candidate for a third consumer is Connection
                      Qualification: testConnection is semantically mandatory
                      (C-007) and requires a REAL external probe with the
                      credential. If Connections executed that probe, C2 would
                      be broken by the platform's own qualification flow. But
                      3C-07 already froze exactly this: "Connections owns o
                      significado e o resultado de qualification, mas não abre
                      socket arbitrário nem recebe segredo em plaintext" — the
                      probe executes INSIDE Capability Gateway (resolve
                      credential handle → enforce host/network policy → apply
                      auth strategy → execute non-mutating probe(s) → sanitize
                      result), and the dependency table reads "Capability
                      Gateway → qualification execution". So qualification is
                      a Gateway last-mile use, not a third appearance.
                      Transient-token reacquisition (e.g., a provider
                      /authenticate exchange) is likewise inside the Gateway
                      auth strategy. No third consumer exists in frozen
                      authority.
smallest correction   cite 3C-07's qualification-I/O law explicitly in the C2
                      section of the decision text. C2's completeness is
                      load-bearing; it should rest on a citation, not on
                      nobody-thought-of-it.
reopen prior authority?  NO
later owner           decision text
```

### F-4 — Version axes: close the one gap — where a transient acquired token LIVES

```text
claim challenged      §12 table + §21-Q6 — the axis table is correct but
                      silent on custody of the transient token itself
concrete failure class a Gateway auth strategy acquires a short-lived provider
                      token (session token, exchanged access token). If the
                      implementation caches it durably "for efficiency"
                      outside CredentialBackend custody — a hub_control column,
                      a Mastra memory, a runtime file — secret-at-rest escapes
                      every law in this family through the side door of
                      "it's only transient".
smallest correction   add one rule to §12: a transient acquired token is
                      memory-first; if a provider genuinely forces persistence
                      (cost/rate-limit on reacquisition), it persists ONLY
                      inside CredentialBackend custody under an infra-level
                      generation counter — never a domain fact, never a
                      ConnectionRevision input, never a qualification-identity
                      input (Finding 3C-07-A already decouples qualification
                      from key_version; the same decoupling applies to token
                      generations), and C-016's reserved
                      key_version != refresh_generation distinction stays
                      untouched for the future rotating-refresh trigger.
reopen prior authority?  NO
later owner           decision text (§12 rule); implementation
```

### F-5 — Crash-safe rekey: the no-FSM claim is honest, because the durable state the property needs already exists

```text
claim challenged      §11.3 + §21-Q5 — is bounded old+new generation overlap
                      enough without a rotation FSM/record?
analysis              enumerate the state a crash-safe rekey actually needs:
                      (a) which generation each ciphertext uses — already
                      exists as the per-ciphertext key_version (C-007);
                      (b) which root generations are decrypt-admitted — this
                      is the presence of the key material itself at the host
                      boundary (3J-owned), not a database fact;
                      (c) migration progress — derivable at any time by
                      scanning (a); a crash loses no information because both
                      generations remain admitted until retirement.
                      No additional durable state is required, therefore no
                      FSM/record is hidden anywhere. Two hardenings make the
                      property provable rather than asserted:
                      1. retirement gate = a PROVABLE zero-references scan
                         over (a) plus the §15 recovery-fixture proof under
                         the new generation, both BEFORE old-key destruction;
                      2. re-encryption must preserve the authenticated
                         context binding (§9.3) byte-for-byte in meaning —
                         a rekey that silently rewrites AAD/binding context
                         would convert a crypto maintenance action into an
                         unaudited semantic change. Add the negative proof:
                         rekeyed ciphertext for credential A still fails
                         substitution as credential B.
reopen prior authority?  NO
later owner           decision text (two hardenings); 3J (key material
                      custody); implementation (scan/migration spelling)
```

### F-6 — Backup separation: restate as compromise-path disjointness, answering "too strong / too weak" exactly

```text
claim challenged      §15/§21-Q11 — "not the same backup object/location/
                      credential path" — is that the right form?
analysis              as worded it is simultaneously too weak (root key on the
                      same HOST as ciphertext with one host credential
                      satisfies the letter — one compromise still yields both;
                      that residual is accepted ONLY via C8's honesty clause,
                      and should be said there, not hidden in backup wording)
                      and too strong if read as "multiply storage
                      infrastructure until everything is separate".
smallest correction   restate the property as the invariant it actually is:
                      NO SINGLE credential, location, or access path outside
                      the trusted Hub boundary may yield BOTH the credential
                      ciphertext set AND the root/recovery key material.
                      Backup storage compromise, backup-credential (e.g.
                      rclone config) compromise, and offsite bucket compromise
                      must each be insufficient alone. The Hub host itself
                      remains the C8 exception, stated as accepted residual.
                      This form is checkable (enumerate paths, prove each
                      insufficient — §18 proofs 15–17 already do) and does not
                      mandate extra infrastructure.
reopen prior authority?  NO
later owner           decision text; 3J (recovery custody realization + proof)
```

### F-7 — Guest-capability closure confirmed: one named class, and the OTLP-push realization is the SAME class, not a second one

```text
claim challenged      §21-Q9/Q10 — is telemetry ingest the only named guest
                      capability after deleting the LLM key?
analysis              swept current authority for guest-held capability:
                      - C-013 sandbox telemetry ingest → the named class;
                      - 3H-03 E2B OTLP push, if ever adopted, is sandbox-
                        originated telemetry delivery to a Hub-controlled
                        endpoint → same capability CLASS (ingest, hub-minted,
                        scoped to run, server-expiring), not a new one —
                        classify it so adoption cannot mint a second law;
                      - Spotlight sidecar (C-013) is loopback-only inside the
                        sandbox and carries no Hub capability;
                      - BuildValidationDatabase credentials are synthetic and
                        sandbox-local by construction (C-008: never "DEV") —
                        worthless outside the guest, out of custody scope,
                        and MUST remain synthetic (the proof obligation is
                        already implied by C-008; keep it visible);
                      - git SYNC/SHARE is hub-mediated bundles without guest
                        credential (C-008);
                      - RunPreview access is authenticated human traffic via
                        Hub proxy, not a guest capability.
                      Closure holds: ONE class. Server-side expiry/revocation
                      on every use is not optional hardening but the only
                      enforcement that exists — §3's E2B facts (pause preserves
                      memory/filesystem; paused sandboxes retained
                      indefinitely; runtime window resets on resume) make any
                      client-side lifetime control unenforceable by
                      construction. §13.3 is confirmed as written.
reopen prior authority?  NO
later owner           decision text (classify OTLP-push under the same class;
                      keep synthetic-DB visibility); 3L (transport proof)
```

### F-8 — Audit and residual risk: confirmed as scoped; the per-use ledger stays dead and the honesty clause is the correct boundary

```text
claim challenged      §14/§16 + §21-Q8/Q12
analysis              audit: the admin/rekey/recovery operation set in §14.1
                      maps onto the existing fail-closed Audit Trail class
                      (3E-01 §12) — audit-required, metadata-only; ordinary
                      credential use is already attributable through Gateway
                      effect/qualification/health observations, so a
                      per-decrypt ledger would duplicate evidence that exists
                      and create a second high-volume authority surface —
                      correctly rejected; a future compliance per-decrypt
                      requirement re-enters by Decision Loop as §14.2 says.
                      residual risk: C8 is honest AND proportionate — the
                      decisive test is that external KMS would NOT remove the
                      accepted residual (a compromised Hub process authorized
                      to request decryption abuses that authority regardless
                      of where keys live; the candidate's Alt C says exactly
                      this). What KMS/HSM would add — key non-exfiltration
                      and independently controlled decrypt policy/audit —
                      maps precisely onto the named reopen triggers (§20
                      items 3–4). Nothing in the current product (single
                      operator, single Hub, C-016's explicit
                      no-Vault/KMS-without-trigger law) demands it now.
reopen prior authority?  NO
later owner           unchanged routing
```

## F.3 Answers to the fifteen questions

1. Correct as frozen — 3D-04 verified verbatim. No expansion; no failure class found that expansion eliminates (F-2). Reuse rule stated positively so principles bind platform credentials without the port.
2. No Material Finding — F3E02-R2 routed physical custody here with layout explicitly unfrozen; a no-new-record realization class exists (filesystem-class infra backing, opaque-ref, FK-free; C-015 CAS and mastra_* precedents); the Decision Loop tripwire stays for any record/schema/database variant, including in-DB backing (F-1).
3. Complete — qualification's external I/O is already Gateway-executed by frozen 3C-07; transient-token reacquisition lives inside the Gateway auth strategy. Cite it in C2 (F-3).
4. One versioned root/KEK suffices; no current selective-rekey or scale failure class pays for per-secret DEKs (C-007 already makes envelope a trigger). Confirmed.
5. Yes — the property needs no durable state beyond per-ciphertext key_version plus host key-material presence; crash loses nothing while both generations stay admitted. Hardened with the provable zero-refs retirement gate and the binding-preservation negative proof (F-5).
6. Tightened via F-4: re-encrypt moves only key_version; provider credential replacement moves logical grant version; transient reacquisition moves nothing domain-visible (memory-first; CredentialBackend-custody generation if persistence is forced); 3C-07-A keeps qualification off both crypto axes.
7. Fail-closed eligibility at Connections/Gateway IS the revocation authority (frozen C-007/3C-07); synchronous ciphertext deletion would create a second revocation authority coupled to storage failure modes. Physical cleanup is hygiene — async, 3M/implementation.
8. Audit-required set = §14.1 (create/replace/revoke, grant change, key generation introduce/retire, recovery/import, privileged failure) on the existing fail-closed Audit Trail. Per-use duplication rejected — Gateway evidence already attributes use (F-8).
9. Yes — telemetry ingest is the only named class; OTLP-push, if adopted, is the same class by classification, not a new capability; Spotlight is loopback-only; BuildValidationDatabase secrets are synthetic by construction (F-7).
10. No client-side control can satisfy expiry — E2B pause/resume preserves guest memory/filesystem indefinitely and resets runtime windows; server-side authority check on every use is the only enforcement point. Confirmed with primary-source facts already in §3.
11. Sufficient once restated as compromise-path disjointness: no single non-Hub credential/location/path yields both ciphertext and key material; Hub-host co-residence is the C8 accepted residual, stated there (F-6).
12. Honest and proportionate — KMS would not remove the residual; its real additions map onto the named reopen triggers. No current requirement demands process isolation (F-8).
13. No stronger 3I laws now. Their remaining design belongs exactly where routed: host injection/rotation → 3J, model credential → Family D constraints, egress → Family F, DB roles → Family G. Custody principles bind them via F-2's reuse rule.
14. Yes — existing `con.connection` grant facts + infra backing (F-1 class) + existing audit classes represent everything. No unavoidable lifecycle for a durable Secret/Credential/CapabilityToken record was found; any future one must arrive with its lifecycle proof through Decision Loop.
15. No reopen of C-007, C-008, 3C-07, 3D, 3E or 3I-01. Every tension examined resolves inside frozen authority — the closest call (3E storage) resolves by 3E's own explicit routing. **Material Finding = NONE.**

## F.4 Closing verdict

```text
Material Finding against approved authority   = NONE
reopen required                                = NONE
alternative A                                  = CONFIRMED / GLOBAL MAXIMUM
corrections to consolidate                     = F-1 (state realization class + precedents;
                                                      extend tripwire to in-DB variant)
                                                 F-2 (positive reuse rule for platform credentials)
                                                 F-3 (cite 3C-07 qualification-I/O law in C2)
                                                 F-4 (transient-token custody rule in §12)
                                                 F-5 (zero-refs retirement gate + binding-
                                                      preservation negative proof)
                                                 F-6 (compromise-path disjointness restatement)
                                                 F-7 (OTLP-push same-class classification;
                                                      synthetic-DB visibility)
new durable record class                       = 0
new database/schema                            = 0
new CredentialBackend consumer                 = 0
external Vault/KMS/HSM                         = 0 F1
per-secret DEK/envelope                        = 0 F1
guest LLM key                                  = deleted, stays deleted
technology product selected                    = 0

verdict = CURRENT STRUCTURE CONFIRMED — ready for consolidation and operator
          review; numbering as a 3I decision remains with the operator
```

---

## 24. Fable Round 2 — scoped corrections (operator-directed)

**Scope:** exactly two points — the Postgres ↔ infra-backing consistency schedule left open by F-1, and a YAGNI re-attack on F-4's transient-token persistence pre-admission — plus one clarification of F-1's realization-class status. All other Round 1 findings (F-2, F-3, F-5, F-6, F-7, F-8) and the no-Material-Finding verdict are converged and are **not** reopened.

### R2-1 — The cross-store failure schedule closes with a durable-before-visible publication order; no FSM, record, or outbox

```text
claim challenged      F-1 named the realization class (domain row in Postgres +
                      ciphertext in infra backing) but left its consistency
                      schedule unstated: `con.connection` and a filesystem-class
                      object share no transaction. Crash between the two writes
                      must not produce a NORMAL state where a visible
                      credential_ref points at material that never became
                      durable.
failure schedules     create:  publish ref in domain row first, write object
                               second, crash between
                               → dangling LIVE ref: Connection appears
                                 credentialed; decrypt fails at use. Fail-closed
                                 catches it (§9.4), but a crash would ROUTINELY
                                 manufacture this state — wrong shape.
                      replace: in-place overwrite of the referenced object,
                               crash mid-write
                               → the ONLY copy of live material is now partial;
                                 AEAD detects corruption but cannot restore it —
                                 secret loss from a plain crash. Forbidden shape.
smallest law          DURABLE-BEFORE-VISIBLE publication order:

                      1. ciphertext objects are WRITE-ONCE and immutable; a new
                         logical write always produces a NEW object under a NEW
                         unique ref (never in-place mutation of a referenced
                         object);
                      2. the object is fully durable at the infra boundary
                         (atomic publish of complete bytes — e.g. temp-write +
                         fsync + atomic rename for a filesystem realization;
                         the equivalent atomic-complete-publish property for
                         any other admitted realization) BEFORE
                      3. the single domain transaction that makes the ref
                         visible commits — create sets credential_ref; replace
                         swaps credential_ref under the existing 3I-01 guarded
                         pre-state mutation; the old object merely becomes
                         unreferenced;
                      4. cleanup of unreferenced objects is DEFERRED hygiene:
                         a sweep may remove an unreferenced object only after
                         an age window safely longer than any in-flight
                         create/replace, honoring the existing backup-safety
                         pattern (C-015 GC precedent). At F1 volume this sweep
                         may be trivial/manual; 3M owns repair policy if the
                         realization can produce more than orphans.

                      consequences, stated as law:
                      - the ONLY crash residue this order can produce is an
                        unreferenced infra-side object — reconcilable, never
                        authority;
                      - a visible credential_ref resolving to missing/partial/
                        unauthenticatable material is therefore NOT a normal
                        crash outcome: if observed, it is an integrity
                        incident — fail closed per §9.4, surface as evidence,
                        repair via 3M/recovery (§15) — never silently
                        recreate or fall back.
why no machinery      the domain row's credential_ref is already the single
                      publication point; write-once objects have no states to
                      track (no FSM), nothing propagates asynchronously (no
                      outbox), and no new durable fact is needed (no record) —
                      ordering + immutability replace all three. This is the
                      same publish-after-durable discipline C-014/C-015 already
                      use for CAS pointers and blobs, applied to a two-store
                      seam.
reopen prior authority?  NO
later owner           decision text (the four-rule order + incident law);
                      implementation (atomic-publish spelling); 3M (repair)
```

### R2-2 — F-4 re-attacked on YAGNI: memory-only becomes the frozen baseline; persistence returns to Decision Loop with its first real consumer

```text
claim challenged      Round 1 F-4 pre-admitted a persistence design ("if a
                      provider forces persistence → CredentialBackend custody
                      under an infra-level generation counter")
YAGNI test            no current provider requires a durable transient-token
                      cache: the one qualified F1 profile (C-007, Sankhya) is
                      client_credentials + X-Token WITHOUT refresh —
                      reacquisition is an ordinary /authenticate call inside
                      the Gateway auth strategy, repeatable at will. Designing
                      generation-counter storage semantics for a consumer that
                      does not exist is exactly the speculative-capability
                      shape the method deletes; Round 1 should not have
                      sketched the mechanism.
corrected law         F1 freezes: transient acquired tokens are MEMORY-ONLY.
                      No durable transient-token cache exists in any store.
                      What survives as BOUNDARY law (the seam, not the
                      capability): any future persisted transient secret is
                      secret-at-rest and therefore falls entirely inside this
                      family's custody laws, is never a domain fact, never a
                      ConnectionRevision input, never a qualification-identity
                      input (3C-07-A). The persistence mechanism itself —
                      including whether a generation counter is even the right
                      shape — is decided by Decision Loop at the FIRST real
                      provider whose reacquisition cost/rate-limit/lockout
                      behavior proves the need. C-016's reserved
                      key_version != refresh_generation distinction remains
                      untouched, waiting for the rotating-refresh trigger.
reopen prior authority?  NO — supersedes Round 1 F-4's second half only
later owner           decision text (memory-only baseline + boundary law);
                      Decision Loop (first persistence consumer)
```

### R2-3 — Clarification: filesystem is the existence proof and an admissible shape, not frozen technology

Round 1 F-1 is to be read as follows, and the decision text should say it in one sentence: the filesystem-class backing is the **existence proof** that the realization class ("infra storage, opaque-ref addressed, FK-free, domain-opaque, write-once publishable per R2-1, recoverable per §15") can be satisfied with zero new domain records/schemas/databases — and it is an admissible shape, not a technology pin. Implementation may choose any equally narrow realization that satisfies the same class constraints and the R2-1 publication order without returning to Decision Loop; what still trips the Decision Loop tripwire is unchanged — any realization needing a new durable domain record, a new hub_control schema, a new database, domain-readable backing rows, or FKs into the backing.

### R2 closing

```text
cross-store schedule        = CLOSED: durable-before-visible publication order;
                              write-once objects; new-ref-then-swap replace;
                              deferred age-windowed cleanup; dangling live ref
                              = integrity incident, never normal state
machinery added             = NONE (no FSM, no record, no outbox)
F-4 second half             = WITHDRAWN; memory-only baseline frozen;
                              persistence → Decision Loop on first real
                              consumer; boundary law retained
filesystem backing          = existence proof / admissible shape, not a
                              technology pin; class constraints + tripwire
                              unchanged
converged findings          = F-2, F-3, F-5, F-6, F-7, F-8 stand unmodified
Material Finding            = NONE (unchanged)
```


