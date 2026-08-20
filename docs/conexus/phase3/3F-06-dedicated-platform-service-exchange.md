# 3F-06 — DEDICATED Platform Service Exchange

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** sexta decisão aprovada de 3F  
**Importante:** esta decisão não constitui C-018, não encerra 3F nem a Fase 3 e não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

Um runtime `DEDICATED` consome Conexus Platform Services **server-to-platform** sob um trusted exchange cujas únicas identities assertadas são `DedicatedApplicationPrincipal` e exact `ReleaseRef`, com `DelegatedConexusPrincipal` apenas quando estabelecido independentemente por 3I; Project, Workspace, audiences, bindings e service-contract identities são derivados e verificados server-side a partir da Release pinada, a própria Release realiza a compatibility attestation, contratos dentro do `PRESERVE` horizon permanecem suportados, e nenhum novo authority record, universal envelope ou trust mechanism é criado por 3F-06.

## 1. Authority, método e provenance

Esta decisão especializa o exchange `DEDICATED` já exigido por 3C-12 e reconcilia 3C-02, 3C-12, 3D-02/3D-R1, 3E-02, 3F-01..3F-05, C-013..C-016 e a DevelopmentConexus Engineering Method v1.0.0.

Review/provenance não-autoritativa:

- `3F-FABLE-DIALOGUE-dedicated-platform-service-exchange.md`.

A revisão adversarial terminou em:

```text
CURRENT STRUCTURE CONFIRMED
READY FOR OPERATOR APPROVAL
no Material Finding against 3F-01..3F-05, 3C-12 or C-014
```

O deletion test removeu Project/audience como assertions e removeu uma compatibility attestation paralela; nenhuma tecnologia de trust foi escolhida.

## 2. F1 access surface

O baseline F1 é:

```text
browser
→ DEDICATED application boundary
→ DEDICATED server/runtime
→ Conexus Platform Service
```

Não existe direct browser → Platform-Service authority em F1.

Isso não impede um produto DEDICATED de escolher Conexus Identity para seu próprio login; apenas mantém Platform Service authority no server/runtime boundary independente.

Reopen trigger: consumidor nomeado cujo requisito real não possa atravessar sua própria application boundary sem perder uma propriedade material.

## 3. Trusted exchange context

### 3.1 Asserted identities

O exchange estabelece somente:

```text
DedicatedApplicationPrincipal
exact ReleaseRef
DelegatedConexusPrincipal?   # somente se 3I estabelecer independentemente
```

### 3.2 Derived and verified server-side

Nunca são authority fields livres do caller:

```text
Project
Workspace
admissible Platform Service audiences
exact Project bindings/composition
consumed service-contract identities
```

Derivação mínima:

```text
DedicatedApplicationPrincipal
→ Project

exact ReleaseRef
→ Release
→ Project
→ Release-pinned composition
```

A Release deve pertencer ao Project resolvido para o application principal; mismatch falha fechado.

Workspace deriva do Project.

A operação chamada determina o service owner, e a Release-pinned composition determina se aquele audience/service está admitido. `audience` continua dimensão semântica load-bearing de authority, mas **não é caller assertion**.

Runtime instance IDs, trace IDs, provider refs e equivalentes são correlation only.

O mecanismo escolhido por 3I deve bindar as asserted identities de modo que payload arbitrário não possa ampliá-las.

## 4. Identity model

### 4.1 Application identity

`DedicatedApplicationPrincipal` está sempre presente em Platform Service calls.

Ele é um principal semântico derivado da authority existente de Project/Release e realizado pelo trust/credential mechanism posterior de 3I.

3F-06 não cria:

```text
DedicatedApplication identity table
DedicatedAccessGrant
DedicatedSession
ServiceCredential domain record
```

Novo record durável exige lifecycle/failure class concreto + Decision Loop.

### 4.2 End-user identity

Existem somente duas semânticas:

```text
SERVICE_SCOPED
→ aplicação age como ela mesma

USER_DELEGATED
→ aplicação + DelegatedConexusPrincipal estabelecido por mecanismo independente
```

Um campo como:

```text
userId = "123"
```

nunca concede Conexus user authority.

Se o produto usa auth própria e não existe delegação/federação confiável, Conexus enxerga somente o application principal. Serviço que exige Conexus-user authority falha fechado.

Um own-auth DEDICATED pode fornecer um opaque app-user ref apenas para correlation/audit provenance; ele é attributable to the app assertion, nunca resolvido como Conexus principal e nunca consultado por authorization.

## 5. Release-pinned composition

Toda chamada executa sob a exact Release declarada no trusted exchange.

```text
exact Release
→ exact frozen composition
→ exact bindings
→ exact service-contract identities
```

Proibido:

```text
current Project bindings
latest Connection/Brain revision
runtime binding handle supplied by caller
mutable-current lookup
```

Nova binding revision segue:

```text
Project authoring
→ adoption
→ new Release
```

nunca runtime parameter.

Owner last-mile policy/health/revocation checks continuam valendo; Release pin não transforma histórico em permissão irrevogável.

## 6. Compatibility

### 6.1 ReleaseRef é a T4 attestation

O `DEDICATED ReleaseManifest` deve pinar as exact service-contract identities consumidas pelo build.

Logo:

```text
exact ReleaseRef
→ exact service-contract identities
→ Hub compatibility verification
```

A Release é a compatibility attestation dessa surface.

Não existe segundo canal por request como:

```text
runtimeContractDigest
clientContractDigest
version assertion paralelo
```

Mismatch/unsupported contract falha fechado com a semântica `CLIENT_OUTDATED` quando aplicável.

### 6.2 Support horizon law

Service-contract identities pinadas por qualquer Release ainda dentro de seu 3F-01 `PRESERVE` horizon devem permanecer suportadas pelo Hub.

```text
in-horizon pinned contract
→ support required

drop support while still in horizon
→ contract-breaking change
```

Isso evita transformar fail-closed compatibility em remote kill switch acidental.

Old/new Releases podem coexistir; cada runtime apresenta sua exact Release. A admissibility window de Releases antigas pertence a 3G/3I.

Nenhum version negotiation, alias ou multi-version registry nasce por isso.

## 7. Payload and failure semantics

3F-06 não cria:

```text
DedicatedRequest
DedicatedResponse
DedicatedError
DedicatedContext
```

Os serviços preservam suas famílias 3F-02:

```text
Gateway runtime execute → F2
platform operation      → F3 quando aplicável
public failure          → T1 / 3F-05
```

Operation payload continua operation-specific; trusted exchange context não é copiado como authority fields em cada DTO.

Após authentication/admission, public failures usam 3F-05 owner/boundary mapping. `NOT_FOUND` preserva a mesma semantic indistinguishability law dessa decisão, sem existence oracle.

Authentication/credential-layer outcomes são **PRE-CONTRACT** e pertencem a 3I, inclusive challenge e anti-oracle wire behavior. O baseline 3F-05 governa authenticated/admitted exchanges. Novo post-auth public code entra apenas por 3F-05 boundary admission.

## 8. Secret and capability custody

Para consumir Platform Services, o DEDICATED runtime não recebe raw:

```text
Connection credentials
vault/master material
Hub DB credentials
Git write credentials
Brain internals
provider/provisioning keys
```

O runtime recebe somente o poder bounded necessário ao exchange realizado por 3I.

Compromised app credential permanece residual material de 3I; seu blast radius deve continuar limitado por:

```text
Release-derived audience scope
owner-side authorization/policy
budgets
approval/effect gates
revocation
```

Nenhum service binding implica wildcard access aos demais services.

## 9. Developer experience

A implementação deve esconder os internals de authority sem escondê-los da arquitetura.

Developer-facing concepts naturais:

```text
Use Conexus Brain
Use company ERP connection
Call Conexus agent
```

Não exigir manualmente:

```text
WorkspaceId
ProjectId authority field
binding revision IDs
contract digests
vault credentials
broad Platform secrets
```

A integração futura deve ser estreita e tipada no server-side; exact SDK/tooling fica para implementação/3K/3L.

## 10. Preservado integralmente para 3I

3F-06 fixa **o que deve ser verdade**, não como trust é implementado.

3I continua livre e responsável por decidir:

```text
mechanism family: OAuth / mTLS / JWT / keys / other
credential issuance / rotation / revocation lifecycle
bearer vs proof-of-possession
replay protection
auth challenge / anti-oracle wire semantics
instance identity handling
DelegatedConexusPrincipal realization
network / egress policy
break-glass
credential custody realization
```

Esses mecanismos devem realizar, não redefinir, as semantics desta decisão.

## 11. Proof strategy

No architecture stage, tente falsificar:

1. **Scope substitution:** caller consegue escolher Project/Workspace/audience por payload? Deve ser não por construção.
2. **Principal/Release mismatch:** Release de outro Project passa? Deve falhar fechado.
3. **Release drift:** runtime consegue resolver newly-current bindings sem nova Release? Deve ser não.
4. **Service widening:** acesso a um Platform Service implica outro? Deve ser não.
5. **User fabrication:** own-auth app consegue criar Conexus-user authority por campo? Deve ser não.
6. **Secret leakage:** consumir service exige raw platform/Connection secret no app? Deve ser não.
7. **Managed lock-in:** DEDICATED precisa rodar em MANAGED same-origin/session topology? Deve ser não.
8. **Payload pollution:** operation DTO precisa carregar scope/role authority universal? Deve ser não.
9. **Trust substitution:** 3I consegue trocar mechanism sem redefinir domain operation contracts? Deve ser sim.
10. **Old Release identity:** sistema identifica exact Release mesmo se policy posterior a recusar? Deve ser sim.
11. **Support horizon:** retirar suporte de contract identity ainda pinada por in-horizon Release deve ser detectável como breaking change.
12. **Browser deletion:** ausência de direct browser authority não quebra consumidor F1 nomeado.

Implementation evidence posterior deve provar esses failures fisicamente no mecanismo escolhido.

## 12. Non-goals / YAGNI

3F-06 não autoriza:

```text
Universal DedicatedRequest/Response/Error/Context
PlatformServiceRegistry
service mesh
SPIFFE/SPIRE
OAuth token exchange selection
mTLS PKI
JWT architecture
long-lived API-key architecture
identity federation
SCIM/OIDC broker
wildcard service audience
direct browser Platform-Service authority
generic delegation framework
DedicatedAccessGrant table
PlatformServiceBinding entity
DedicatedSession table
ServiceCredential domain record
runtime plugin system
multi-version negotiation
per-call contract attestation
asserted Project/Workspace/audience authority fields
DEDICATED-prefixed failure taxonomy
auth-failure code minting outside 3F-05 admission
fleet management
```

Qualquer item retorna apenas com consumer/failure class real ou se 3I provar que é a menor realization suficiente.

## 13. Routed onward

| Questão | Owner posterior |
|---|---|
| concrete auth/trust mechanism | 3I |
| credential lifecycle/revocation | 3I |
| challenge/anti-oracle/replay semantics | 3I |
| optional Conexus-user delegation/federation | 3I / Decision Loop on real consumer |
| Release admissibility window / old-vs-new lifecycle | 3G / 3I |
| network/egress policy | 3I / 3J |
| deployment topology | 3J |
| typed client/SDK realization | implementation / 3K / 3L |
| divergent deployed-binary detection if proven necessary | 3I / 3N |
| browser-direct Platform-Service authority | Decision Loop on named consumer |
| new durable credential/grant record | Decision Loop if 3I proves lifecycle need |

## 14. Global Maximum / reopen rule

O review confirmou a estrutura e removeu complexidade:

```text
ProjectRef assertion          → deleted
audience assertion            → deleted; semantic dimension retained
separate compatibility digest → deleted; exact Release is attestation
new durable authority records → not admitted
browser-direct authority      → not admitted
```

Reopen apenas com material evidence, incluindo:

```text
named browser-direct consumer
real federation/delegation consumer
demonstrated credential-lifecycle need for a durable record
windowed multi-version compatibility consumer / external install base
3I evidence that the two-identity assertion set cannot realize required trust safely
```

## 15. Formal disposition

Operator approval on 2026-08-16 ratifies:

```text
3F-01 = APPROVED
3F-02 = APPROVED
3F-03 = APPROVED
3F-04 = APPROVED
3F-05 = APPROVED
3F-06 = APPROVED
3F = IN PROGRESS
3G = NOT STARTED
```

Esta decisão não fecha 3F, não constitui C-018, não autoriza implementação de produto e não altera o status DRAFT do PR da Fase 3.
