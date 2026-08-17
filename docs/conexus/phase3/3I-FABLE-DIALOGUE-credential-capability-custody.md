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
