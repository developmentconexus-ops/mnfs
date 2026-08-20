# 3F-01 — Contract Surface Classification & Versioning Boundary

**Status:** APPROVED pelo operador em 2026-08-15  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** primeira decisão aprovada de 3F  
**Importante:** esta decisão não constitui C-018, não encerra 3F nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 classifica boundaries de interação viva como `INTERNAL | INDEPENDENT`, usa `CONDITIONAL` apenas como estado de roteamento quando a janela de compatibilidade depende de uma fase posterior, aplica um **durable-representation trait** somente por admissão explícita, resolve todo version gap por um dos cinco modos fechados `PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD`, exige canonicalização determinística por domínio de digest e distingue quatro loci semânticos de falha — sem criar framework universal de contracts, DTO/wire ceremony para chamadas internas, versionamento sombra das 46 classes duráveis ou suporte multi-versão sem consumidor real.

---

## 1. Authority, método e evidência

Esta decisão foi trabalhada com o operador após 3E CLOSED / APPROVED e reconciliada contra:

- C-005..C-017;
- 3C CLOSED + 3C-R1;
- 3D CLOSED + 3D-R1;
- 3E CLOSED + 3E-R1;
- `3F-CONTRACTS-API-ARCHITECTURE-HANDOFF.md`.

Como review/provenance não-autoritativa, foi usado:

- `3F-FABLE-DIALOGUE-contract-surface-classification.md`, incluindo três rodadas adversariais e uma rodada final de buildability.

A rodada de buildability usou como evidência, sem promover referência a authority:

- observações reais de Mitra registradas no repositório;
- contratos públicos e reference map da Factory AI;
- práticas já executadas no acervo MNFS;
- probes já aprovados por authority anterior.

Resultado do buildability review:

```text
nenhum mecanismo UNSUPPORTED
zero probes novos exigidos por 3F-01
zero subsistemas novos exigidos por 3F-01
nenhum Material Finding contra 3D ou 3E
```

Mitra e Factory continuam **evidence/reference**, nunca authority do Conexus. Nenhuma afirmação nova sobre comportamento atual do Mastra é introduzida por esta decisão; premissas dependentes de substrate continuam sujeitas aos probes já roteados.

---

## 2. Live interaction surfaces

Toda superfície viva relevante é classificada no menor nível suficiente.

### `INTERNAL`

Boundary tipada estreita dentro do mesmo sistema/release unit.

```text
Module A
→ narrow public internal API / projection
→ Module B
```

Regras:

- 3D `direct-call-first` permanece intacto;
- não criar wire DTO, `/v1`, adapter, transport protocol ou compatibility layer apenas porque existe uma boundary de módulo;
- producer + consumers internos podem mudar no mesmo Change/release quando nenhuma representação durável independente fica para trás;
- invariantes e ownership continuam explícitos mesmo sem versionamento independente.

### `INDEPENDENT`

Usado quando peers vivos podem possuir versões independentemente fixadas e se encontrar materialmente, independentemente da causa:

```text
separate deployment
browser cache
external ownership
independent upgrade cadence
ou outra janela real de mixed versions
```

A causa física não define a classe por si só. Processo/rede não são condição necessária nem suficiente.

### `CONDITIONAL`

`CONDITIONAL` **não é um terceiro tipo de contrato**. É apenas estado de roteamento quando a classificação da janela viva depende de authority posterior, como 3H/3J.

Cada caso `CONDITIONAL` deve preservar:

1. content obligations já congeladas;
2. a pergunta ainda aberta;
3. a fase/owner posterior que a resolverá.

Nenhum protocolo é inventado antecipadamente para responder uma pergunta de deployment/runtime que ainda não foi decidida.

---

## 3. Durable-representation trait

Durability física em Postgres/Git/storage **não transforma automaticamente uma representação em contrato versionado**.

O trait é aplicado à representação ou componente mínimo que realmente cruza uma fronteira de interpretação/evolução.

### Admission test

Uma representação/componente recebe o trait quando pelo menos uma condição é verdadeira:

**D1 — independent interpretation without mandatory transform**  
Writer e reader/intérprete posterior podem possuir versões independentemente fixadas **sem um `TRANSFORM` obrigatório entre eles**.

**D2 — authority/comparison stability**  
Os bytes/shape são authority por hash/digest/signature/pin, **ou** a correção depende de uma derivação determinística ser comparável entre versões, como fingerprint versionado.

**D3 — leaves owner migration boundary**  
A representação sai da boundary de migration de seu owner e um consumidor independente depende do shape declarado.

Consequências:

```text
persisted row != durable contract
FSM durability != wire/schema contract
owner-local migration-private state pode ser TRANSFORM sem ganhar versão pública
trait pode existir em um componente sem versionar a tabela inteira
```

### Idempotency realization rule

Para uma tentativa já admitida pelo Gateway:

```text
idempotency key
= compute once
→ persist once in gw.idempotency_claim
→ retries reuse the stored key verbatim
```

Retries de uma tentativa existente **não recomputam** a key após upgrade. Derivation/version rules governam novas admissões; componentes que exigem recompute-and-compare através do tempo, como finding fingerprints, possuem derivação explicitamente versionada.

`idempotency_claim` garante deduplicação **do lado Conexus**. Esta decisão não afirma que Sankhya ou qualquer sistema externo fornece idempotência end-to-end.

---

## 4. Version-gap resolution modes — união fechada F1

Todo gap concreto recebe **um modo primário**. Um cenário composto pode possuir vários gaps, cada um com seu próprio modo.

```text
PRESERVE
REJECT_STALE
QUIESCE
TRANSFORM
DISCARD
```

### `PRESERVE`

Manter interpretação/compatibilidade para um **horizonte semântico declarado**.

Exemplos de horizonte:

```text
enquanto referenciado por Release ativo/rollback-eligible
enquanto ApprovalRequest ainda pode alcançar decisão terminal
supported backup/restore horizon
declared evidence-retention horizon
```

`PRESERVE` deve declarar também comportamento de fim do horizonte. Por default, referência fora do horizonte resolve como `STALE_EXPECTATION`, nunca como falha silenciosa.

Verificabilidade de bytes por digest pode sobreviver ao horizonte semântico **sem ampliar a promessa de compatibilidade semântica**.

### `REJECT_STALE`

Fail closed quando a expectativa atual não pode mais ser atendida; requer refresh, reapproval, re-auth, requalification, recompilation ou ação equivalente antes de prosseguir.

### `QUIESCE`

Eliminar a janela de versões antes da mudança por drain/stop/maintenance.

### `TRANSFORM`

Migrar, re-tipar, recompilar, rebuildar ou re-release deterministicamente antes do novo intérprete consumir o estado.

### `DISCARD`

Estado explicitamente não-authoritative/disposable pode ser perdido/recriado quando authority anterior já garante recovery suficiente.

### External-owned surfaces

Para a **evolução do contrato do vendor**:

```text
REJECT_STALE
TRANSFORM   # mudança de pin/version via qualificação
```

Conexus não promete `PRESERVE` sobre uma superfície que não controla. `DISCARD` pode governar separadamente estado emitido pelo provider que o Conexus retém quando disposability/recovery já estiver projetada.

`negotiated multi-version support` não é um sexto modo. É uma possível tática de `PRESERVE` e **não é admitida no F1** sem consumidor nomeado + Decision Loop.

---

## 5. Digest / canonicalization contracts

Não existe `UniversalDigestFramework` nem um serializer universal obrigatório para todos os domínios.

Cada domínio de digest que participa de authority deve declarar o suficiente para recomputação determinística:

```text
typed semantic context / domain
canonical byte / encoding profile
hash algorithm/profile
pinned canonicalization implementation identity (library/version)
profile evolution rule
```

Domínios podem compartilhar o mesmo profile quando isso for natural; não são forçados a compartilhar por simetria arquitetural.

Domínios de digest externamente owned, como Git object IDs, são identificados como externos; seu profile não é versionado pelo Conexus.

`provider/runtime ref` continua a classe opaca de correlação de 3E; provider continuation token, por exemplo, não é promovido a digest.

A seleção concreta de biblioteca/implementação pertence a later 3F/3L e deve respeitar qualification/pinning.

---

## 6. Failure loci

3F-01 congela apenas os loci semânticos. Códigos finais, envelopes e wire representation continuam trabalho posterior de 3F.

### L1 — `DOMAIN_OR_AUTHORITY_REJECTION`

O contrato foi compreendido, mas domain truth, authority ou eligibility atual recusa/indisponibiliza a operação.

Exemplo já conhecido:

```text
CAPABILITY_UNAVAILABLE_HEALTH
```

### L2 — `CONTRACT_INVALID`

A representação/resultado não satisfaz o contrato que afirma cumprir.

Exemplos:

```text
MANIFEST_INVALID
OUTPUT_CONTRACT_VIOLATION
```

### L3 — `STALE_EXPECTATION`

Uma expectativa pinada/assumida deixou de corresponder ao counterpart atual.

Pode envolver:

```text
code version
content pin
state generation
compatibility horizon expirado
```

Exemplos:

```text
CLIENT_OUTDATED
CAS_CONFLICT
rollback ineligibility
out-of-horizon reference
```

Generation/CAS continua owner-local concurrency state de 3E; aparecer aqui descreve a **semântica da falha**, não promove generation a durable contract.

### L4 — `DURABLE_INTERPRETATION_FAILURE`

Representação retida **dentro de seu horizonte declarado** deveria continuar interpretável/verificável, mas não pode ser lida/verificada de modo seguro.

Regras:

```text
fail closed
never silently coerce
do not assume retry repairs it
route according to declared gap mode
operator/alarm-worthy when required by later ops design
```

### Explicitly outside these loci

`OUTCOME_UNKNOWN` / `traffic_state` permanecem semântica própria do effect ledger C-013/C-016. Eles representam incerteza sobre efeito externo, não contract failure.

Da mesma forma:

```text
Conexus-side idempotency/dedup
!=
external-system idempotency guarantee
```

Incerteza do sistema externo continua `UNKNOWN` fail-closed + reconciliation; nunca retry cego.

---

## 7. Baseline classification matrix

Esta matriz é o ponto de partida autoritativo de 3F. Nova superfície/gap material exige re-aplicação do admission test + Decision Loop proporcional.

| Boundary / representação | Classificação F1 |
|---|---|
| L7 → module public APIs dos sete flows aprovados | `INTERNAL` |
| ordinary approved module → module dependencies | `INTERNAL` |
| Gateway module API dentro do Hub | `INTERNAL` |
| approval capability call Gateway ↔ PAR implementation | `INTERNAL` |
| ApprovalRequest exact envelope + claim identity | durable trait; preserve exact semantics pelo horizonte da decisão ou fail-closed para novo checkpoint conforme lifecycle posterior |
| existing Gateway idempotency claim/key | durable component; persist-once + reuse-verbatim |
| Control Plane browser ↔ Hub | `INDEPENDENT`; F1 fail-closed staleness, exact handshake posterior 3F |
| published app/browser ↔ served release/platform | `INDEPENDENT`; pins + fail-closed staleness; sem negotiated window F1 |
| registry artifact kind/vN family (`connector/v1`, `agent/v1`, `brain/v1`, `brain-binding/v1`, `job/v1`, query/action schemas, outputSchema/DataMeta) | durable trait; `PRESERVE` pelo horizonte declarado |
| ToolProjection / MCP projection quando ativa | compiled/release-pinned durable contract; fail closed |
| Project binding refs / exact ConnectionRevisionRef / release pins | durable trait conforme semantics de 3E |
| plan/contract revision digests | durable trait; preserve pelo Change/evidence horizon aplicável |
| finding row | migration-private por default; fingerprint derivation é durable contract component versionado |
| CodingRuntime/CredentialBackend/BlobStore-CAS/GitInfra — module → nosso adapter/port | `INTERNAL` |
| nossos adapters → vendor/substrate API/SDK/protocol | `INDEPENDENT`, externally-owned; pin + conformance/qualification |
| Builder Runtime live transport | `CONDITIONAL`; preservar bundle/quarantine, Actor Pack, SHARE/correlation já congelados |
| Production Agent Runtime live transport | `CONDITIONAL`; topology/window posterior 3H/3J |
| backup/restore manifest | durable trait; `PRESERVE` pelo restore horizon; restored DB pode depois `TRANSFORM` via migrations |
| agent_event schema + versioned OTel mapping | durable trait quando necessário à evidência histórica; preserve pelo evidence-retention horizon |
| connector sync/cursor semantic contract | parte do `connector/v1`; durable semantic contract |
| nosso watermark/cursor record | migration-private / `TRANSFORM` |
| provider continuation token/ref | opaque provider ref; pode `REJECT_STALE` e recovery pode `DISCARD` conforme desenho aprovado |
| credential crypto envelope profile | durable contract component para leitura de ciphertext antigo |
| legacy `MissionPlan v2` | one-time `TRANSFORM` para semântica atual de Change / Work Unit; não vira live surface |
| `job_run` queued payloads | migration-private; upgrade pode `QUIESCE`; comportamento in-flight final → 3G |
| promotion step storage | migration-private; lifecycle/restart → 3G |
| SCHEDULE trigger persistence | migration-private por default; release/artifact pins carregam contratos duráveis independentes |
| admission attempts / budget counters | persistence/invariant internos; não são automaticamente shape contracts |
| ordinary internal relational rows | migration-private por default; as 46 classes de 3E não recebem versionamento sombra |
| export JSONL / derived projections | não são contract surfaces F1 salvo promoção explícita futura por Decision Loop |
| AgentTrigger EVENT ingress | reservado; classificar quando ativado, preservando guard note de 3D |

---

## 8. F3B-R2 — legacy MissionPlan v2

O roteamento de F3B-R2 para 3F é resolvido conceitualmente:

```text
MissionPlan v2 legacy durable representation
→ TRANSFORM one-time
→ current Change / Work Unit semantics
```

Isso **não** reintroduz Mission/Milestone no F1 e não cria um compatibility layer permanente. Detalhe mecânico da transformação só é implementado quando houver consumidor/migração real autorizada.

---

## 9. Buildability disposition

O review final de construibilidade classificou os mecanismos de 3F-01 como combinação de:

```text
PROVEN
CONVENTIONAL
PROBE_REQUIRED
```

Nenhum mecanismo ficou `UNSUPPORTED`.

Evidência/probes relevantes já existiam antes desta decisão, incluindo quando aplicável:

```text
CX-BUILDER-MASTRA-01
CX-SBX-E2B-01
CX-SCAFFOLD-V0-01
CX-REL-V0-01
CX-PUB-V0-01
CX-OBS-V0-01
```

3F-01 não adiciona probe, produto auxiliar ou technology commitment novo. A existência de evidência de Mitra/Factory não elimina qualification própria do Conexus.

---

## 10. Não autorizado / YAGNI

3F-01 **não autoriza**:

```text
HTTP route inventory
field-level DTO inventory
OpenAPI intermediary por default
GraphQL / gRPC / event protocol por default
SDK generation
generic port/interface por módulo
wire DTO para toda chamada interna
/v1 em toda public module API
negotiated multi-version support sem consumidor
contract registry service
UniversalContract / UniversalEnvelope
universal serializer
UniversalDigestFramework
shadow contract/versioning layer sobre as 46 classes duráveis
microservices por causa de compatibility
workflow/event/command bus
provider framework genérico
```

Qualquer item retorna apenas com consumidor/failure class real + Decision Loop.

---

## 11. Trabalho roteado adiante

Permanece trabalho posterior de 3F, sem decisão escondida nesta etapa:

```text
exact error codes / error envelopes
request/response envelope shapes por boundary concreta
approval capability exact signature
Project binding contract shapes
ConnectionRef / exact ConnectionRevisionRef wire/durable shape quando exigido
DEDICATED identity/authority exchange shape
technology/schema representation selection quando um consumidor exigir
```

Roteamento para fases posteriores permanece:

```text
FSM / staleness / eligibility / in-flight lifecycle → 3G
runtime transport/window realization              → 3H / 3J
trust / identity / authority enforcement          → 3I
technology qualification                          → 3L
recovery machinery                                → 3M
architecture-wide proof                           → 3N / 3O
```

---

## 12. Global Maximum / reopen rule

3F-01 passou por três ataques adversariais contra 3D/3E, incluindo buildability, sem Material Finding.

Portanto:

```text
3D direct-call-first = permanece authority
3E ownership/ref model = permanece authority
```

Isso não transforma decisões anteriores em dogma. Qualquer fase posterior pode reabrir 3F-01, 3D ou 3E se surgir Finding material com failure class concreta e correção globalmente superior.

---

## 13. Estado após aprovação

Ratificado pelo operador em 2026-08-15:

```text
3F-01 = APPROVED
3F — Contracts & API Architecture = IN PROGRESS
3G = NOT STARTED
```

A próxima decisão de 3F deve ser trabalhada com o operador antes de ser materializada. A Fase 3 completa continua aberta até C-018.