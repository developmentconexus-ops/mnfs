# 3F — Fable R1 Final Contracts & API Coherence Review

**Status:** INDEPENDENT REVIEW / NON-AUTHORITATIVE
**Fase:** 3F — Contracts & API Architecture
**Método:** DevelopmentConexus Engineering Method v1.0.0 (cópia local canônica)
**HEAD revisado:** `436add6767fca53eb247cbd08195a4ea4973754c`
**Importante:** este review não fecha 3F, não altera `LEDGER.md`, não constitui C-018 e não autoriza implementação, merge ou PR readiness. O verdict abaixo foi congelado **antes** da leitura de `3F-CHATGPT-R1-final-contracts-api-coherence-review.md`; a seção 9 registra a comparação feita somente depois.

---

## 1. Pergunta central e teste de fechamento

> Existe alguma decisão arquitetural material ainda faltando em 3F que precise ser resolvida antes de iniciar 3G, ou os resíduos restantes pertencem corretamente a implementação / 3G / 3H / 3I / 3K / 3L?

Teste de fechamento aplicado (derivado da definição de materialidade do método, §2):

> Um resíduo só bloqueia o fechamento se resolvê-lo de formas diferentes puder alterar um invariante, authority/ownership, o significado de um contrato público/durável, uma trust boundary, ou um input obrigatório de fase posterior. Se toda realização admissível do resíduo preserva esses fatos, o resíduo é realization, não arquitetura.

Ferramentas usadas: deletion test, Structural Inversion, Future-Cost, essential vs accidental complexity, proof-at-maturity, adversarial challenge.

---

## 2. Reconstrução de estado

Estado reconstruído por `AGENTS.md` → método → `DECISOES.md` → `LEDGER.md`:

```text
3B/3C/3D/3E = CLOSED / APPROVED
3F = EM ANDAMENTO
3F-01..3F-06 = APPROVED
3G = NOT STARTED
```

Authority lida integralmente: 3C-R1, 3D-R1, 3E-R1, 3F-01..3F-06, `3F-CONTRACTS-API-ARCHITECTURE-HANDOFF.md`. C-005..C-017 consultadas por cross-check (C-005, C-007, C-010..C-017, com foco em C-012 handshake/`runtimeContractDigest`/`CLIENT_OUTDATED` e C-014 ReleaseManifest/composition root).

---

## 3. Cobertura do intake — as 7 obrigações materiais de 3F têm dono aprovado

O handoff 3E→3F roteou exatamente estes itens. Verificação item a item:

| Item roteado a 3F | Resolvido por |
|---|---|
| DTO/API/envelope shapes | 3F-02 (F1..F5 + T1..T6; rules-only, sem universal envelope) |
| error taxonomy / failure representation | 3F-01 (loci L1..L4) + 3F-02 (T1) + 3F-05 (9 literais, details fechados, static projection) |
| approval capability signature | 3F-03 (`FIRST_CLAIM`/`RECOVER_BOUND`, atomic admission, sealed subject; literal TS names = implementação) |
| ConnectionRef / exact ConnectionRevisionRef contract | 3F-04 §5 (ambos explícitos; relação validada no set-time) |
| Project binding contracts | 3F-04 (dois contratos concretos, Git-first, CAS, três camadas de authority) |
| F3B-R2 — MissionPlan v2 | 3F-01 §8 (one-time `TRANSFORM`, sem compatibility layer) |
| DEDICATED identity/authority exchange (dimensão de contrato) | 3F-06 (duas asserted identities, derivação server-side, Release-as-attestation) |

Nenhuma obrigação chartered de 3F ficou sem decisão dona. A questão restante é somente se os resíduos "later 3F" são arquitetura ou realization — seções 5 e 6.

---

## 4. Global Coherence Review

### G1 — 3C ownership × 3D dependency × 3E data × 3F contracts

- O padrão 3C-R1-B (Git → Project intent → Registry → specialized owner → Release) é realizado literalmente pela lei de três camadas de 3F-04 §12. Sem drift.
- A única inversão de domínio de 3D (approval claim) permanece **uma** capability em 3F-03; a discriminação `FIRST_CLAIM`/`RECOVER_BOUND` é união fechada de input, não segunda inversão nem segundo port.
- 3E-02 `prj.connection_binding` (Connection + exact ConnectionRevision, Tier-3) e `prj.brain_binding` (pair de digests) batem campo a campo com 3F-04. `TxScope` opaco de 3E-01 é respeitado (presente só em `FIRST_CLAIM`; ausente em `RECOVER_BOUND`, read-equivalent).
- Surface-specific composition de 3D-02 (PUBLISHED_APP → active Release; AGENT_RUN → run-pinned) é preservada por 3F-03 §4.2-B2, 3F-04 §13 e 3F-06 §5.
- "runtime never calls L7" (3D) não é violado por 3F-06: a regra congela direção de import interna do Hub; um DEDICATED runtime é cliente externo entrando por boundary de plataforma, como qualquer cliente.

**Disposition: coerente.**

### G2 — Single authority / ausência de authorities duplicadas

Verificado por meaning:

```text
public failure meaning      → um literal, uma definição (3F-05 §2.1); sem ErrorRegistry
sealed approval subject     → PAR custody única; sem cópia Gateway (3F-03 §18)
served composition          → ReleaseManifest digest único; sem BindingSet/bindingSetDigest (3F-04 §12)
                              sem second per-call attestation digest (3F-06 §6.1)
binding truth               → três camadas com owners distintos por significado, não duplicação
compatibility attestation   → uma por surface: runtimeContractDigest (MANAGED app, C-012),
                              exact ReleaseRef (DEDICATED, 3F-06); superfícies distintas,
                              trust models distintos, ambas derivadas da Release-pinned composition
```

Duas attestations para duas superfícies **não** é authority duplicada: nenhum significado tem dois donos; cada surface tem exatamente uma attestation.

**Disposition: coerente.**

### G3 — Release como composition root

C-014 permanece a authority; 3F-04 congela os exact binding pins dentro dela; 3F-06 estende o conteúdo do DEDICATED ReleaseManifest (pinar service-contract identities consumidas pelo build) sem criar segundo aggregate/digest. Rollback re-aponta manifesto antigo sem re-adotar binding (3F-04 §8), coerente com C-014 rollback = re-point.

**Disposition: coerente.**

### G4 — Current Project intent vs Release-pinned runtime composition

A lei é uniforme nas três superfícies: PUBLISHED_APP (active Release), AGENT_RUN (run-pinned), DEDICATED (asserted exact ReleaseRef, verificada pertencer ao Project do principal, fail closed). `new Git commit != current binding != active Release` fecha o triângulo. Old Release ainda in-horizon não vira escape de policy: owner last-mile checks continuam (3F-06 §5) e a admissibility window é 3G/3I — roteada, não esquecida.

**Disposition: coerente.**

### G5 — MANAGED × DEDICATED sem duas factories

As duas superfícies compartilham: famílias 3F-02 (F2/F3), T1 + baseline 3F-05, composition law da Release, Gateway admission, `NOT_FOUND` indistinguishability. Divergem somente na camada identity/attestation (browser session + runtimeContractDigest vs server principal + ReleaseRef), justificado por trust boundaries estruturalmente diferentes. Não nasce stack paralelo de contrato, error taxonomy DEDICATED-prefixed nem universal DedicatedRequest.

**Disposition: coerente.**

### G6 — Public failure × lifecycle outcome × effect outcome

Três vocabulários permanecem distintos e não-unificados:

```text
T1 public failure (3F-05)          != lifecycle/domain outcome (AWAITING_APPROVAL/DENY/EXPIRE/STALE)
                                   != attempt/admission state (C-013)
                                   != effect receipt outcome (SUCCEEDED/FAILED/PARTIAL/OUTCOME_UNKNOWN)
```

Cross-check adversarial: as classes semânticas de 3F-04 §14 mapeiam ao baseline sem literal novo (`BINDING_EXPECTATION_STALE` → `CAS_CONFLICT`; `BINDING_REQUIRED_BUT_ABSENT` → L1 rejection coberta), e 3F-05 §2.5 congela explicitamente a lei anti-bulk-promotion. `OUTCOME_UNKNOWN` permanece fora da failure taxonomy (3F-01 §6). 3G recebe FSMs livres sem herdar error taxonomy.

**Disposition: coerente.**

### G7 — Approval exact-subject / single-claim

Cadeia C-010 → 3D inversion → 3E atomicity → 3F-03 fechada sem contradição: PREPARE sem side effects, sealed immutable subject, claim atômico com admission, monotonic STALE commit-on-refusal, `RECOVER_BOUND` sem recheck de pins (o efeito já foi lawfully admitted), all-units-or-nothing, PRESERVE horizon de custody incluindo `OUTCOME_UNKNOWN`. Rollback não consome approval; race resolve por single-claim condition owner-local.

**Disposition: coerente.**

### G8 — Compatibility / PRESERVE horizons

Uma lei única atravessa: 3F-01 define PRESERVE + end-of-horizon (`STALE_EXPECTATION`, nunca falha silenciosa); 3F-03 aplica ao sealed subject; 3F-05 congela evolução additive-only enquanto consumidor pinado depende; 3F-06 transforma o horizon em support law (drop in-horizon = breaking change, anti-kill-switch). Nenhum multi-version negotiation nasceu.

**Disposition: coerente.**

### G9 — Server-derived authority

Lei uniforme em C-015, 3F-02 §10, 3F-03 §7, 3F-04 §11, 3F-06 §3.2: caller fields nunca concedem authority; expectations (`expectedRevision`, pins) são testadas, nunca obedecidas. `userId` asserted nunca vira Conexus principal (3F-06 §4.2).

**Disposition: coerente.**

### G10 — YAGNI / overengineering

Nos dois sentidos:

- **Excesso:** nenhuma decisão 3F criou mecanismo sem consumidor. 3F-05 = um typed constant module + contract tests; 3F-06 deletou assertions e o digest paralelo; 3F-03 recusou ApprovalService/BatchApproval/DisplayContext.
- **Under-engineering (seams removidos indevidamente):** não encontrado. Alias/deprecation deferido **com** a lei additive-only preservando o seam; duplicate Gateway custody deferido **com** trigger de failure class nomeado; EVENT ingress reservado com guard note.

**Disposition: coerente.**

---

## 5. Ataque aos cinco resíduos

Formato: (a) material architecture still missing? (b) current authority already sufficient? (c) exact later owner; (d) failure class if deferred incorrectly.

### R1 — exact wire / HTTP mapping

(a) **Não.** Structural Inversion: qualquer realização de wire (status codes semânticos vs envelope, header vs body, nomes de campo) que preserve os fatos congelados — famílias 3F-02, T1 shape, literais 3F-05, server-derived authority, sanitização C-016 — é admissível; nenhuma escolha entre elas move authority ou significado, porque **o literal é a unidade de authority pública** (3F-05 §2.1), não o transporte.
(b) **Sim.** A contract-test family de 3F-05 §6 + exhaustiveness de 3F-02 §6 já são o enforcement home.
(c) Implementação, sob contract tests; 3L somente se tecnologia de schema/transport exigir qualification.
(d) Failure class real se mal deferido: cliente passando a **branch por HTTP status em vez de `code`**, criando segunda chave semântica de facto. Já proibido por construção pela lei do literal; vale registrar o corolário explicitamente no fechamento (correção documental D3 abaixo), não uma decisão nova.

### R2 — exact MANIFEST_INVALID diagnostics

(a) **Não.** 3F-05 §5.2 já congela a forma legal (closed issue collection, public identifiers only, nunca data channel, discriminado por code). Os fields exatos dependem do output real do validador de compile/promote — consumidor que ainda não existe. Congelar fields agora violaria a própria lei "details somente com consumidor real".
(b) **Sim.**
(c) Contrato da promote/compile surface na implementação + apresentação 3K, sob as leis 3F-05. Reopen 3F-05 somente se um consumidor real de diagnóstico não couber na lei de schema fechado.
(d) Failure class se mal deferido: diagnostics virando generic bag / canal de vazamento — ambos já proibidos e testáveis (seeded violations, 3F-05 §11).

### R3 — approval card/display contracts por família

(a) **Não.** As propriedades de correctness já são invariantes 3F-03 §8: card = projeção mecânica do sealed subject verificado; projector identity/version/digest gravado server-side como decision evidence; sem stored card; conjuntos grandes com total exato + full list + preview determinístico; significado material obrigatório na exibição. O que resta é conteúdo/layout por família — produto/UX, incapaz de criar authority nova por construção.
(b) **Sim.**
(c) 3K + implementação, constrangidos por 3F-03. Reopen 3F-03 somente se uma família real de subject não puder ser projetada verdadeiramente sem mudar o modelo de subject.
(d) Failure class se mal deferido: card que omite significado material → humano aprova o que não viu. Já bloqueado normativamente por 3F-03 §8; a prova pertence a 3N/3O + implementation evidence.

### R4 — binding file/schema + literal mutation DTOs

(a) **Não.** 3F-04 congela o que importa: união fechada de mutações com campos semânticos exatos (§11), lei de reprodutibilidade (source revision reproduz deterministicamente exact refs; `latest`/name-matching proibidos, §4), CAS, provenance com acting principal. Qualquer sintaxe de arquivo que satisfaça isso é equivalente estrutural.
(b) **Sim.** `BINDING_SOURCE_NOT_REPRODUCIBLE` já é a classe de falha que pega a sintaxe errada.
(c) Implementação (file syntax + TS/DTO spelling); 3K para authoring UI; 3L somente se tooling de representação exigir qualification.
(d) Failure class se mal deferido: file schema guardando nomes simbólicos em vez de exact refs → quebra de reprodutibilidade. Já proibido explicitamente; detecção mecânica no adoption path.

### R5 — browser/Hub e published-app compatibility handshake (ataque adversarial especial)

Cadeia de authority reconstruída independentemente:

```text
3F-01  browser↔Hub e published-app↔platform = INDEPENDENT;
       "F1 fail-closed staleness, exact handshake posterior 3F"
C-012  published app/scaffold: 3 digests; runtimeContractDigest estrutural SEM health,
       calculado pelo hub; mismatch = CLIENT_OUTDATED fail-closed;
       ponteiro CAS único seleciona frontendDistDigest
3F-02  T4 CompatibilityAttestation — somente em boundary com mixed-version admitida
3F-05  CLIENT_OUTDATED congelado: L3, comportamento = atualizar/recarregar attestation
       e tentar novamente, sem details
3F-06  DEDICATED: exact ReleaseRef É a T4 attestation; segundo canal por request proibido
```

**Deletion test (decisivo):** delete o handshake inteiro. Alguma correctness quebra? **Não.** A carga de correctness de staleness nunca repousa no handshake: mutações são protegidas por CAS/`expectedRevision`/`expectedCurrentBindingRef`/governing pins (3F-02 §10, 3F-03 §11, 3F-04 §9), e a composição servida é Release-pinned por construção. O que se perde sem handshake é somente **especificidade do erro** (o stale client receberia `CAS_CONFLICT`/`VALIDATION_FAILED` em vez do `CLIENT_OUTDATED` preciso) — UX/precisão, não integridade. Um mecanismo cuja deleção não viola invariante não é arquitetura faltante; é realization de uma obrigação já congelada ("fail-closed staleness", 3F-01 baseline matrix).

**Por superfície:**

```text
MANAGED published app  → arquitetura JÁ decidida por C-012 (pré-3F); 3F-01/02/05 a preservam
DEDICATED              → arquitetura decidida por 3F-06 (Release-as-attestation, sem 2º canal)
Control Plane browser  → obrigação congelada (fail-closed staleness + T4 + CLIENT_OUTDATED);
                         realização exata = implementação, com C-012 como padrão provado
```

Nuance de provenance: C-012 é authority do handshake da **published-app/scaffold surface**; para o Control Plane ele é padrão/evidência reutilizável, não authority direta. Isso não muda o resultado: a obrigação do Control Plane (staleness fail-closed) é de 3F-01, e qualquer attestation identity que a satisfaça (contract digest vs asset digest) difere apenas em taxa de falso-positivo de reload — precisão, não correctness, fail-closed em ambos.

**Structural Inversion:** se o transporte fosse o oposto em todo aspecto relevante (polling vs header, per-session vs per-request), as leis congeladas continuariam determinando o mesmo comportamento observável do consumidor (reload on `CLIENT_OUTDATED`). Conclusão sobrevive à inversão.

**Future-Cost:** fechar 3F e errar aqui custa um reopen bounded via Decision Loop (o método suporta reopen por evidência material). Manter 3F aberto por um resíduo sem failure class própria custa phase drift e ceremony. Assimetria favorece fechar.

**Veredicto do resíduo:** falta somente wire realization. Nenhum 3F-07 é justificado — não existe failure class material que a authority atual + fase posterior não possuam.

---

## 6. Resíduos adicionais varridos (não listados pelo operador)

- **Pagination/filter/ORDER BY:** C-016 já congela caps server-side, LIKE escapado, allowlist de ORDER BY. Implementação.
- **Async/attempt status projection:** F2 congela a semântica; projeção → 3G/3H (roteado).
- **F5 wire realization:** → 3H (roteado).
- **Config Contract surface:** revisão durável content-addressed (3E-02) + `configContractDigest` na identidade da Release (C-014) + F4 (3F-02). Nada faltante em 3F.
- **AgentTrigger EVENT ingress:** reservado com guard note 3D; classificação na ativação (3F-01 matrix). Correto.

Nenhum item exige decisão 3F adicional.

---

## 7. Verdict

```text
CLOSE 3F

MATERIAL BLOCKERS: 0
DECISÕES ARQUITETURAIS AINDA NECESSÁRIAS DENTRO DE 3F: 0
3F-07: NÃO JUSTIFICADO (nenhuma failure class material sem dono)
NEW PROBES: 0
NEW SUBSYSTEMS: 0
```

3F congelou a arquitetura semântica de contratos que 3G..3O precisam como input. Todos os resíduos são realization sob leis já congeladas, com donos exatos e failure classes já bloqueadas normativamente. 3G pode iniciar sem redecidir nada de 3F.

### Correções documentais/routing exigidas pelo fechamento (sem arquitetura nova)

Estas correções pertencem ao futuro documento de fechamento (3F-R1-style, a ser trabalhado com o operador) e à manutenção do ledger; **nenhuma foi aplicada por este review**:

- **D1 — re-routing das linhas "later 3F" do LEDGER §8:**
  ```text
  exact wire layout / HTTP mapping        → implementation (contract tests); 3L se tecnologia exigir
  exact MANIFEST_INVALID diagnostic fields → promote/compile surface contract (implementation/3K)
  per-family approval card/display         → 3K + implementation, sob 3F-03
  binding file/schema + literal DTOs       → implementation (+3K authoring UI)
  ```
- **D2 — disposição do "exact handshake posterior 3F" de 3F-01:** registrar que a semântica está resolvida por C-012 + 3F-02 T4 + 3F-05 + 3F-06 e que somente transport placement/nome/serialização da compatibility identity resta à implementação; mudar fonte semântica, horizon, stale behavior ou authority model exige reopen 3F. Precedência documental, não emenda de conteúdo.
- **D3 — corolário anti-segunda-chave:** registrar explicitamente que HTTP status/transport nunca vira segunda chave de comportamento do consumidor; branching é sempre por `code` (corolário direto de 3F-05 §2.1, não decisão nova).
- **D4 — fechamento formal:** o fechamento em si exige documento de reconciliação ratificado pelo operador (padrão 3C-R1/3D-R1/3E-R1) e atualização de status no LEDGER. Fora do escopo deste review.

### Reopen triggers pós-fechamento

Somente evidência material: consumidor independente real que as leis de compatibility/version-gap não expressem; comportamento público real que não mapeie com segurança ao baseline 3F-05; representação durável nova que falhe D1/D2/D3; consumidor de approval incompatível com exact-subject/single-claim; consumidor de binding incompatível com os dois contratos concretos; evidência 3I/3H/3J de que um contrato não é realizável sem mudar authority/significado; prova de implementação de que um resíduo "realization-only" na verdade muda semântica pública.

---

## 8. Proof-at-maturity

Nenhum mecanismo semântico remanescente de 3F é `UNSUPPORTED` na evidência revisada. A prova está corretamente distribuída por maturidade: falsification/buildability já executados em 3F-01..06 (architecture stage); contract tests + seeded violations na implementação; verificação adversarial de arquitetura em 3N; prova vertical em 3O. Não criar framework de teste 3F apenas para fechar a fase.

---

## 9. Independent convergence / divergence with ChatGPT

Comparação feita **após** o congelamento do verdict acima, contra `3F-CHATGPT-R1-final-contracts-api-coherence-review.md`.

**Convergência (total no material):** mesmo verdict `CLOSE 3F`; zero blockers; zero probes/subsystems novos; mesma disposição dos quatro resíduos R1..R4 e mesmos owners; mesma conclusão de que nenhum 3F-07 é justificado; correções documentais equivalentes (BC-1/BC-2 do ChatGPT ≅ D1/D2 deste review); mesmos reopen triggers em substância.

**Divergências — nenhuma material; três nuances:**

1. **Carga de prova do handshake.** Este review acrescenta o deletion test explícito mostrando que a correctness de staleness nunca repousa no handshake (CAS/expectations/pins carregam a carga; sem handshake perde-se apenas especificidade de erro). O BC-2 do ChatGPT chega ao mesmo routing sem esse argumento; a conclusão é idêntica, a fundamentação aqui é mais forte contra um futuro questionamento de "handshake como arquitetura faltante".
2. **Provenance do C-012 para o Control Plane.** O BC-2 cita C-012 como semântica existente para browser↔Hub em geral; estritamente, C-012 é authority da published-app/scaffold surface, e para o Control Plane vale como padrão provado, com a obrigação vinda de 3F-01 (fail-closed staleness) + T4 + 3F-05. Mesma disposição final; correção de citação apenas.
3. **Corolário anti-segunda-chave (D3).** Este review explicita que HTTP status nunca pode virar segunda chave semântica de comportamento; no ChatGPT isso fica implícito no critério geral de R1. Recomenda-se registrar explicitamente no fechamento.

Nenhuma divergência altera verdict, routing ou correções exigidas.

---

## 10. Disposição

```text
Recomendação NON-AUTHORITATIVE: CLOSE 3F
Próximo passo: fechamento formal (3F-R1-style) trabalhado com o operador,
incorporando D1..D4, seguido de 3G — Behavioral / State Architecture
```

Este review é input não-autoritativo. Somente ratificação do operador cria authority de fechamento.
