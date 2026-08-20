# 3C-14 — Attachments / Storage Boundary

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1 **não existe um módulo genérico `Storage`**. Armazenamento de bytes é infraestrutura. Existe, porém, uma boundary de produto `Attachments` para arquivos de usuário/aplicação no profile `MANAGED`, responsável por identidade, escopo, lifecycle, metadata, upload/download controlado e retention. `Attachments` usa uma primitive interna `BlobStore/CAS`, mas Artifact Registry, Release, Observability, Evidence, backup e outros domínios não passam por `Attachments` apenas porque também armazenam bytes. No profile `DEDICATED`, usar Conexus Attachments é opcional e explícito; o aplicativo pode possuir seu próprio storage.

A separação normativa é:

```text
PRODUCT / DOMAIN
Attachments
    │
    ▼
INFRASTRUCTURE
BlobStore / CAS
    │
    ▼
filesystem hoje
object storage amanhã
```

---

## 1. Contexto e precedência

Esta decisão resolve o candidato `Storage` listado em 3C-01 e reconcilia principalmente C-015, 3C-02, 3C-06, 3C-08, 3C-11, 3C-12 e 3C-13.

C-015 já congelou semântica substancial de anexos para o published runtime então dominante:

- `attachment_id` opaco como identidade de acesso;
- digest nunca como credencial/rota;
- metadata e lifecycle no `hub_control`;
- upload reservado, limitado, validado e finalizado;
- download autorizado;
- retention e GC em duas fases;
- storage privado por default;
- object storage atrás de gatilho operacional.

3C-12 posteriormente separou os runtime profiles `MANAGED | DEDICATED`. Portanto, a topologia de attachment governado pelo Hub é baseline `MANAGED`, não obrigação universal para produtos `DEDICATED`.

Nada aqui congela tabelas/FKs/índices/refcount físicos (3E), DTOs/HTTP/protocolos de upload (3F), FSM exata (3G), auth detalhada/content-security (3I), filesystem/S3/R2/MinIO/provider concreto (3J/3L) ou UX de file picker/browser (3K).

---

## 2. Finding: bytes compartilhados não formam um domínio compartilhado

O Conexus precisa armazenar bytes em vários contextos:

```text
Artifact Registry
→ compiled artifact bytes

Release
→ build/application outputs

Observability
→ optional trace/log payloads

Evidence
→ selected proof payloads

Attachments
→ PDF, imagem, XML, planilha do usuário

Backup
→ dumps + manifests

Builder
→ temporary workspace files
```

A semelhança física não cria semântica comum.

Criar:

```text
StorageModule
├── saveArtifact()
├── saveAttachment()
├── saveTrace()
├── saveEvidence()
├── saveRelease()
└── saveBackup()
```

produziria um god module cujo único significado seria “guarda bytes”.

Regra:

```text
same physical primitive
!=
same domain lifecycle
```

---

## 3. `Storage` como módulo de domínio — REJECT

`Storage` não responde uma pergunta de produto coerente.

Ele não deveria decidir:

```text
quem pode acessar
qual Project possui
se é um ArtifactRevision
se é documento fiscal
se pertence a Release
se é Evidence
se é trace descartável
qual retention de negócio se aplica
```

Essas perguntas pertencem aos respectivos owners.

Portanto:

```text
Generic Storage Module
→ REJECT F1
```

O fato de múltiplos módulos consumirem uma primitive comum de bytes não justifica uma boundary de domínio.

---

## 4. `BlobStore / CAS` é infrastructure capability

A primitive de infraestrutura responde apenas a perguntas físicas equivalentes a:

```text
put(bytes) → content identity
read(content identity)
exists(content identity)
verify digest/size
commit durable bytes
remove physical bytes quando autorizado pelo owner
```

Pode ser realizada inicialmente por filesystem local e futuramente por object storage.

Ela não owns:

```text
Account
Project
role/permission
Attachment lifecycle
ArtifactRevision
Release
Evidence
retention de negócio
```

O contrato técnico exato e sua separação por namespace/owner serão fechados depois.

### Sem provider leakage

Domínios não devem espalhar APIs concretas de S3/R2/filesystem.

A intenção é:

```text
domain owner
→ narrow storage capability
→ physical provider
```

não:

```text
domain owner
→ AWS SDK / filesystem path semantics everywhere
```

---

## 5. `Attachments` possui semântica de produto real — ADOPT

Diferentemente de Storage, `Attachment` responde uma pergunta de domínio:

> Qual arquivo lógico pertence a este contexto de aplicação, quem pode acessá-lo, qual metadata/lifecycle ele possui e quais bytes imutáveis o representam?

Forma conceitual:

```text
Attachment
├── attachment identity
├── Project scope
├── uploader/principal context
├── original/sanitized filename metadata
├── declared/detected content type
├── byte size
├── lifecycle state
├── retention class
└── blob/content reference
```

`Attachments` owns semanticamente:

```text
Attachment identity
Project association
attachment lifecycle
attachment metadata
attachment → blob reference
upload reservation semantics
upload finalization
content-class validation policy
retention classification
attachment availability
download/serving semantics
attachment deletion/release semantics
```

Os nomes físicos e campos finais ficam para 3E/3F.

---

## 6. `attachment_id` é application/access identity

C-015 permanece correto:

```text
attachment_id
!=
blob digest
```

Exemplo:

```text
Attachment
id = att_123
blobDigest = 7f83b165...
```

O aplicativo referencia:

```text
att_123
```

Nunca usa o digest como authority de acesso.

Regra normativa:

```text
attachment_id
→ logical/application identity

blob digest / object key / filesystem path
→ infrastructure identity
```

Consequências:

- digest não é rota pública;
- digest não é credential;
- conhecer o digest não prova autorização;
- Project DB pode carregar `attachment_id` como valor opaco sem virar owner do Attachment;
- troca de provider físico não muda a identidade lógica do arquivo.

---

## 7. Boundary com Identity & Access

Identity & Access continua owner de:

```text
Account
session
memberships
grants
roles
effective permissions
```

Attachments continua owner de:

```text
attachment resource semantics
Project association
attachment-specific preconditions
```

Conceitualmente:

```text
I&A
→ principal may reach this Project/surface

Attachments
→ att_123 belongs to expected Project
→ operation is permitted by attachment policy/preconditions
```

Attachments não inventa role model próprio e não confia em Project/Account IDs fornecidos pelo browser como authority isolada.

---

## 8. Boundary com Capability Gateway

Attachments é uma platform capability própria e não precisa converter todo upload/download em uma generic business `CapabilityInvocation`.

O Gateway permanece focado em Project Data e External Integrations conforme 3C-08.

Portanto:

```text
query/action/integration execution
→ Capability Gateway

attachment lifecycle / upload / download
→ Attachments
```

Ambos aplicam authority server-side apropriada, mas possuem failure modes e lifecycles diferentes.

---

## 9. Artifact Registry não passa por Attachments

Artifact Registry responde:

> Qual revisão compilada imutável de software existe?

Attachments responde:

> Qual arquivo lógico de usuário/aplicação existe e pode ser acessado?

Logo:

```text
query:v7
agent:v2
brain pack
frontend build artifact
→ Artifact Registry / release storage path
```

Enquanto:

```text
nota-fiscal.xml
planta.pdf
produto.jpg
orcamento.xlsx
→ Attachments
```

Mesmo que ambos usem content-addressed storage fisicamente.

Não fazer:

```text
Artifact Registry
→ Attachments
→ BlobStore
```

A infraestrutura comum pode ficar abaixo dos dois owners.

---

## 10. Evidence, telemetry e backup também não são Attachments

Um screenshot de verifier, trace payload, test report ou dump pode conter bytes, mas não se transforma automaticamente em Attachment.

```text
Evidence
→ Evidence owner + storage primitive

Telemetry payload
→ Observability & Audit + storage primitive

Backup
→ Operations/backup process + storage primitive
```

`Attachments` só entra quando existe a semântica de arquivo lógico da aplicação/usuário.

F1 não cria um supertipo:

```text
File
├── ATTACHMENT
├── ARTIFACT
├── EVIDENCE
├── TRACE
├── BACKUP
└── RELEASE
```

Esses objetos compartilham bytes, não lifecycle.

---

## 11. MANAGED — Attachments é Platform Service

No profile `MANAGED`, Attachments é o Golden Path para arquivos de aplicação/usuário.

Exemplo:

```text
Managed App
    ↓
Attachments
    ↓
Identity & Access / domain checks
    ↓
BlobStore infrastructure
```

Um Project MANAGED pode guardar no seu banco de negócio:

```text
document_attachment_id = att_123
```

como referência opaca.

A authority de lifecycle/metadata do Attachment permanece no Hub/platform control plane, conforme o baseline C-015.

### App real, storage governado

O fato de o frontend/app ser um build real não muda a custódia:

```text
app expresses attachment intent
platform governs attachment lifecycle
```

Isso preserva isolamento entre Projects e evita distribuir storage credentials ao código do app.

---

## 12. DEDICATED — storage próprio ou binding explícito

3C-12 estabelece que um Project `DEDICATED` é um aplicativo independentemente executável e não deve ser obrigado a depender do Managed Runtime.

Logo C-015 é refinada:

```text
C-015 Attachments topology
→ MANAGED baseline
```

Para `DEDICATED`, existem duas formas legítimas:

```text
A. Dedicated app owns its storage/domain
```

ou:

```text
B. Dedicated app binds explicitly to Conexus Attachments
```

O binding B pode ser útil quando se deseja:

```text
shared enterprise governance
Conexus identity integration
audit
retention
centralized attachment policy
```

Mas não é dependência universal.

### Dedicated não recebe storage power cru por default

Se usar Conexus Attachments, o app recebe uma API/capability explícita, não credenciais master do backing store.

---

## 13. MANAGED → DEDICATED não promete migração automática

Um Project pode começar MANAGED e mais tarde tornar-se produto DEDICATED.

Se usava Conexus Attachments, a revisão arquitetural pode decidir:

```text
keep explicit Attachments binding
```

ou:

```text
migrate to app-owned storage
```

F1 não implementa:

```text
convertAttachmentsToDedicatedStorage()
```

A identidade opaca e a ausência de paths físicos espalhados preservam a possibilidade futura sem criar machinery agora.

---

## 14. Lifecycle de Attachment permanece, realização vai para 3G

C-015 já define a intenção geral:

```text
upload requested
→ capacity reserved
→ PENDING
→ stream + hash + validation
→ durable bytes
→ AVAILABLE
```

com recovery de upload abandonado e GC seguro.

3C-14 apenas atribui ownership:

```text
Attachment lifecycle
→ Attachments
```

Estados finais, CAS transitions, leases, GC e recovery serão formalizados em 3G/3M.

---

## 15. Quarantine de lifecycle não implica malware scanner F1

C-015 usa quarentena também como mecanismo seguro de GC/refcount.

Isso não autoriza automaticamente:

```text
ClamAV
malware analysis service
content detonation
Office conversion pipeline
```

Security quarantine por conteúdo malicioso continua atrás de consumidor/gatilho real, como upload público/não confiável ou parsing/redistribuição de formatos de risco.

---

## 16. Upload direto futuro não muda o domínio

Hoje a realização pode ser:

```text
Browser
→ Hub
→ filesystem
```

Futuramente, se object storage justificar:

```text
Browser
→ Attachments authorization
→ short-lived upload capability
→ object storage
→ finalize/verify through Attachments
```

A identity/lifecycle continua:

```text
attachment_id
```

O fato de os bytes atravessarem ou não o processo do Hub é detalhe de infraestrutura/deployment.

---

## 17. Release não pina attachments de usuário

Attachments são runtime/business data, não composição de software.

Não fazer:

```text
ReleaseManifest
├── att_123
├── att_124
└── att_125
```

Release pode piná-la apenas a contratos/revisions de capability quando necessário, nunca ao conjunto mutável de documentos do usuário.

Logo:

```text
software composition
→ Release

runtime attachment data
→ Attachments
```

---

## 18. Dedup físico não cria coupling de domínio

C-015 permite dedup físico de attachments por digest.

Essa otimização pode permanecer dentro do storage backing de Attachments.

Mas F1 não congela um refcount global cruzando:

```text
Attachments
Artifact Registry
Evidence
Observability
Release
Backup
```

Um blob fisicamente igual em dois domínios não obriga os owners a compartilhar lifecycle ou GC.

A storage primitive deve permitir isolamento por owner/namespace lógico; dedup cross-domain só pode existir futuramente se for transparente ao lifecycle dos domínios.

---

## 19. Comparação com referências

### Mitra

Valida o valor do storage compartilhado por tenant/project para apps organizacionais. Conexus transfere essa propriedade para `MANAGED`, mas fortalece a identidade lógica/autorização com `attachment_id` privado por default em vez de tratar path/object key como acesso.

### Factory.ai

Reforça o corte da Software Factory: software produzido não deve ser obrigado a armazenar seus dados de runtime dentro da própria Factory. Isso sustenta a liberdade de `DEDICATED` possuir storage próprio.

### Mastra

Mastra Workspace/Filesystem demonstra que filesystem/storage é capability técnica substituível e separada da semântica do agente. Conexus preserva o mesmo princípio: Builder workspace files e application Attachments não são o mesmo domínio.

### Vercel Blob / object stores

Validam storage como primitive (`put/get/delete/list`) sobre a qual a aplicação constrói significado próprio. Isso sustenta `BlobStore != Attachments`.

### Cloudflare bindings

Validam platform resources fornecidos explicitamente ao código de aplicação por bindings, em vez de entregar acesso universal. Isso sustenta `DEDICATED → optional explicit Attachments binding`.

Essas referências validam propriedades; não congelam provider ou produto externo no F1.

---

## 20. Public internal API — sem congelar 3F

A boundary precisa suportar semanticamente operações equivalentes a:

```text
reserveUpload
completeUpload
getAttachmentMetadata
downloadAttachment
release/deleteAttachment
```

Talvez futuramente:

```text
createShortLivedDownloadGrant
createShortLivedUploadGrant
```

quando object storage/ingress justificar.

Não expor como domain API aos apps:

```text
storage.put(bytes)
storage.get(path)
storage.list(prefix)
storage.delete(objectKey)
```

Apps devem operar sobre `Attachment`, não sobre backing-store primitives.

---

## 21. Não construir no F1

```text
generic Storage module
generic File aggregate
storage provider plugin framework
S3/R2/MinIO como requisito arquitetural
public bucket por default
platform-wide file browser
folders/directories abstraction
attachment versioning
share-link product
CDN/media pipeline
thumbnail/conversion service
malware scanner sem trigger
commercial quota engine
cross-domain global refcount
universal File supertype
mandatory Conexus storage for DEDICATED
```

Gatilhos anteriores de C-015 permanecem válidos onde não contrariados por 3C-12/3C-14.

---

## 22. Ownership summary

| Pergunta | Owner |
|---|---|
| Qual arquivo lógico de usuário/app existe? | Attachments |
| A qual Project pertence? | Attachments |
| Qual principal/role existe? | Identity & Access |
| Quais bytes representam o attachment? | Attachments referencia BlobStore |
| Onde os bytes estão fisicamente? | BlobStore infrastructure |
| Qual ArtifactRevision existe? | Artifact Registry |
| Qual Evidence existe? | Builder/Evidence semantics |
| Qual telemetry payload existe? | Observability & Audit |
| Qual Release está ativa? | Release |
| Onde um Dedicated app guarda seus arquivos? | O próprio app, salvo binding explícito |

---

## 23. Invariantes

1. **Storage não é domínio:** guardar bytes não cria module ownership.
2. **Attachment é domínio:** identidade, scope, metadata, lifecycle e serving são owned por Attachments.
3. **Digest não autoriza:** digest/path/object key nunca substitui `attachment_id` + authz.
4. **Private by default:** acesso de arquivo é governado; exposição pública exige capability/ingress explícitos.
5. **MANAGED baseline:** Conexus Attachments é Platform Service para apps MANAGED.
6. **DEDICATED freedom:** Dedicated pode possuir storage próprio ou bindar Attachments explicitamente.
7. **No universal File:** artifact/evidence/trace/backup não viram Attachment por conter bytes.
8. **No domain coupling by dedup:** otimização física não cria lifecycle compartilhado.
9. **Provider replaceable:** filesystem/object storage é realização posterior atrás de boundary estreita.
10. **Release/data separation:** attachments de runtime não entram na composição imutável da Release.

---

## 24. Refinamentos normativos

### 3C-14-A — Storage module

O candidato `Storage` de 3C-01 é **REJECTED como módulo de domínio F1**. `BlobStore/CAS` é infrastructure capability.

### 3C-14-B — Attachments

`Attachments` é **ADOPTED** como module/capability de produto para arquivos de usuário/aplicação no regime MANAGED.

### 3C-14-C — C-015 scope refinement

A topologia de attachment governado integralmente pelo Hub de C-015 passa a ser baseline `MANAGED`, não obrigação universal para `DEDICATED`.

### 3C-14-D — Dedicated binding

`DEDICATED` pode possuir storage próprio ou consumir Conexus Attachments apenas por binding/contract explícito; nenhum storage credential master é entregue por default.

### 3C-14-E — byte-domain separation

Artifact Registry, Release, Evidence, Observability, backup e Builder workspace permanecem owners de suas semânticas e podem consumir storage infrastructure diretamente; não passam por Attachments.

---

## 25. Deliberadamente deixado para fases posteriores

### 3E — Data Architecture

- tabelas e chaves;
- metadata física;
- blob refs/refcount/generation;
- ownership schema;
- quota/reservation persistence.

### 3F — Contracts/API

- upload/download DTOs;
- errors;
- MIME/content metadata;
- SDK/runtime interfaces;
- signed capability contracts quando aplicável.

### 3G / 3M — State / Recovery

- PENDING/AVAILABLE/quarantine states;
- lease/reconciler;
- GC two-phase;
- crash recovery;
- idempotency.

### 3I — Security

- content validation;
- permission mapping;
- public access triggers;
- PII/fiscal retention;
- malware scanning trigger.

### 3J / 3L — Deployment / Technology

- filesystem vs S3/R2/MinIO/object store;
- direct upload;
- backup/offsite;
- capacity and RTO triggers.

### 3K — Product UX

- upload affordances;
- attachment cards;
- preview/download behavior;
- unavailable/degraded states.

---

## Veredito

```text
Generic Storage Module
→ REJECT

Attachments
→ ADOPT for MANAGED platform semantics

BlobStore / CAS
→ infrastructure

DEDICATED
→ own storage OR explicit Conexus Attachments binding
```

Essa decisão reduz o catálogo de módulos em vez de ampliá-lo: preserva apenas a semântica de produto que já possui consumidor real e mantém bytes/providers como detalhe de infraestrutura substituível.

## Próximo passo

Não abrir nova boundary automaticamente. Executar **cross-review final de 3C** procurando:

```text
owner ausente
owner duplicado
boundary artificial
dependência conceitual circular
conceito de infraestrutura promovido indevidamente a domínio
```

Se não houver finding material, 3C pode ser encerrada e a arquitetura avança para 3D — Dependency Architecture.
