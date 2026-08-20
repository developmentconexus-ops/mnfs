# 3D-FABLE-R1 — Capability Gateway Dependency Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3D — Dependency Architecture, pré-decisão 3D-02  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3D-02-FABLE-INDEPENDENT-REVIEW-HANDOFF.md`)  
**Base revisada:** `a650ee86fade73c5423c4be79d5e037a940e1f3e` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não é decisão 3D-02, não altera LEDGER nem decisões aprovadas, e não autoriza implementação. A revisão R0 (`3D-FABLE-R0`) é input não-autoritativo; onde esta revisão a corrige, esta prevalece como opinião de review.

---

## 1. Verdict

**O macro shape de 3D-01 sobrevive ao detalhamento concreto do hot path do Gateway.** Nenhum ciclo escondido novo, nenhuma duplicação de authority, nenhum Finding que exija reabrir 3C ou 3D-01. A boundary Admission + Execution de 3C-08 permanece globalmente preferível a qualquer split tentado (§13).

Quatro resultados materiais desta rodada:

1. **A porta de approval é claim/confirm, não verificação read-only — e esta revisão testou e rejeitou a simplificação.** A hipótese "envelope-binding na criação + dedupe de idempotency tornam consume desnecessário" foi construída e derrubada por dois fatos independentes: C-010 **já congela** `claim atômico` no fluxo HITL (read-only enfraqueceria autoridade aprovada silenciosamente), e o precedente primário OAuth (RFC 6749/9700) mostra que binding na criação é necessário mas **não suficiente** contra replay do mesmo efeito quando a supressão de duplicata tem janela de retenção própria (§8).
2. **`projectBindingValid` de 3C-08 é subespecificado de um jeito que produziria bug real:** a fonte da resolução de binding **difere por surface**. Serving publicado resolve binding do **ReleaseManifest pinado**; Builder/qualification resolvem **intent atual do Project**. Se a implementação ler binding atual do Project no caminho de serving, produz drift contra C-014. 3D-02 precisa congelar a regra por surface — Finding F-R1-2 (§12).
3. **A conjunção de admission deve virar união fechada.** O guard anti-god-module concreto é congelar as classes de fato de admission como lista fechada (adicionar classe = decisão, não código), no espírito do pipeline fixo de admission do Kubernetes (§13).
4. **Runs pinados a composição antiga × narrowing de permissão em release nova** é uma assimetria de authority real (agente in-flight segue policy da composição pinada; humano segue policy da release ativa). Não bloqueia a forma de dependência de 3D-02, mas a regra de qual composição governa policy de efeito precisa de owner explícito — Finding F-R1-4, roteado a 3G/3I (§12).

---

## 2. Authority reconstructed

Reconstrução a partir do repositório (ordem `AGENTS.md` → DOCUMENTATION-MAP → STATUS → `DECISOES.md` C-000..C-017 → `LEDGER.md` [3D-01 APROVADA] → 3C-01..15, 3C-R1, 3A-R5 → **3D-01 integral** → R0 como input não-autoritativo).

Baseline congelado por 3D-01 que esta revisão só desafia via Finding:

```text
import graph = DAG                          direct-call-first
orquestração nomeada e excepcional          tables/internals cross-module proibido
imutável viaja / revogável revalida         GW → I&A/Project/Registry/Connections/Release permitido
PAR → GW permitido; GW → PAR proibido       uma única inversão estreita p/ approval
Release → Builder proibido                  atomicidade compartilhada ≠ ownership compartilhado
substrate compartilhado sem coupling oculto RigorProfile primitive pura
```

De 3C-08 (boundary do Gateway, intocada): Minimal Enforcement Surface; No Universal Privileged Bus; admission = conjunção fail-closed; `NOT_SENT | SENT_NO_RESPONSE | RESPONSE_RECEIVED`; `OUTCOME_UNKNOWN` sem blind retry; monotonicidade (camada inferior só aperta); reads leves; promotion/migration/Git/Registry-publication/sandbox fora do Gateway.

---

## 3. O hot path concreto (modelo usado para expor problemas)

Para tornar TOCTOU/ciclos visíveis, esta revisão modela o efeito externo agent-originated — o pior caso, que contém todos os outros:

```text
1. PAR: LLM propõe tool call → args exatos/defaults → envelope canônico E
   envelopeHash = H(artifactRevisionDigest, canonical input, ConnectionRevision,
                    project/target identity, effect unit identity)
2. PAR: approvalFloor exige humano → ApprovalRequest criada VINCULADA a envelopeHash (C-010)
3. humano aprova (fora do hot path)
4. PAR → GW.executeEffect(AgentExecutionContext, E, approvalRef)
5. GW ADMISSION — uma transação Postgres:
   a. I&A: conta/sessão/authority do run ainda válidas          [lookup owner]
   b. Registry: resolve artifactRevisionDigest → payload compilado
      {schemas, effects[], approvalFloor, idempotency, executor}  [imutável, cacheável]
   c. composição: artifactRevision ∈ composição governante do run [ref imutável do caller]
   d. Connections: ConnectionRevision elegível? grant não revogado? [lookup owner]
   e. binding: slot → revision conforme fonte da surface (§7)      [lookup conforme surface]
   f. approval: port.claimForExecution(approvalRef, envelopeHash)  [inversão §8]
   g. budget durável: reserva atômica no admission ledger          [GW-owned]
   h. idempotency: claim único por effect identity                 [GW-owned]
   i. effect record: INSERT traffic_state=NOT_SENT                 [GW-owned]
   COMMIT  → DENY se qualquer fato ∈ {FALSE, UNKNOWN, STALE, MISSING, REVOKED}
6. EXECUTION: resolve credential handle no backend (server-side),
   executa contra target exato, sanitiza
7. SETTLEMENT (transação seguinte): traffic_state/receipt/outcome;
   OUTCOME_UNKNOWN nunca auto-retry; audit-required no mesmo commit aplicável
```

Reads publicados percorrem `a–e` com variantes leves (§10) e sem `f–i`.

---

## 4. Grafo de dependências exato do Gateway

```text
Capability Gateway
├── importa (public projections, direção descendente no DAG 3D-01 §15)
│   ├── Identity & Access   → EffectiveAccessContext / estado de sessão-conta
│   ├── Project             → {workspaceId, runtimeProfile, binding facts atuais}
│   ├── Artifact Registry   → resolve ref → revisão compilada exata
│   ├── Connections         → ConnectionExecutionFacts + eligibility
│   └── Release             → ActiveReleaseComposition / composition por digest
├── define (inversão única)
│   └── ApprovalVerification port ← implementado por PAR, wired no composition root
├── portas de infra
│   └── CredentialBackend (resolução de handle na execução)
├── emite
│   └── Observability & Audit (GATEWAY_AUTHORITY evidence + audit) — emit-only
└── owned state durável (não é import)
    └── admission ledger: budget reserve + idempotency claims + effect records
```

Proibido (reafirmado, com o porquê concreto):

```text
GW -X-> Builder / PAR / MAR / Brain imports      inverteria o DAG; fatos chegam por contexto
GW -X-> tables de ApprovalRequest                 ownership PAR; é para isso que a porta existe
GW -X-> credential material                       custódia é do backend; GW passa handle
GW -X-> Observability como leitura de authority   C-013; telemetry nunca decide admission
GW -X-> Workspace / Attachments / OBS-query       nenhum fato de admission vive lá
```

---

## 5. Arestas diretas — justificativa uma a uma (handoff §5.A)

| Aresta | Failure class atual | Fato estreito | Lookup vs ref | Fica fora da projeção |
|---|---|---|---|---|
| GW → I&A | sessão/conta revogada não pode executar efeito (C-015) | validade de principal/sessão + effective access p/ operação | **lookup** em efeito (revogável); read aceita resolução da surface no mesmo request (§10) | roles/memberships internals, credential auth |
| GW → Project | caller não escolhe binding/scope (3C-08) | workspaceId, runtimeProfile, binding facts *atuais* (surfaces não-serving) | lookup quando a fonte é intent atual (§7) | Baseline content, Inception, lifecycle |
| GW → Registry | executar exatamente a revisão compilada; classificação de segurança compilada fail-closed (C-005/C-010) | ref → {payload, schemas, effects[], approvalFloor, agentEligible, idempotency, executor class} | **ref imutável** — content-addressed, cacheável indefinidamente; o lookup é só digest→bytes | authoring, publication, semântica de domínio |
| GW → Connections | target/grant exatos; revogação fail-closed (C-007/C-016) | ConnectionRevision (imutável) + {grant state, eligibility, retirement} (revogáveis) | revision = ref; eligibility/revocation = **lookup por efeito** | secret bytes, qualification semantics, health como gate |
| GW → Release | admission de app publicado contra composição ativa (C-014) | composição por digest + ponteiro ativo (project, PROD) | ponteiro = **lookup** (efeitos revalidam em tx); composição por digest = ref imutável | conformance, promotion, migration, candidate lifecycle |
| GW → OBS | evidência GATEWAY_AUTHORITY + audit-required (C-013/C-016) | emit-only | n/a | qualquer leitura como authority |

Nenhuma dessas arestas vira interface/port: são chamadas diretas de public API descendentes no DAG (3D-01 §3). A única inversão é a approval (§8).

**Health de Connection explicitamente fora da conjunção:** `HEALTHY != allowed` (3C-07). Health é diagnóstico; admission usa eligibility/revocation. Colocar health na conjunção transformaria observação operacional em authority — a violação exata que C-013 proíbe.

---

## 6. Caller contexts por surface (handoff §5.B) — sem envelope universal

Quatro contextos tipados, distintos de propósito. O núcleo comum real é pequeno (principal-ish ref + project ref + capability ref + limites) e vive como value types do kernel — **não** como `UniversalExecutionContext` (proibido por 3D-01 §19; os shapes divergem no que importa):

```text
BuilderExecutionContext        (BuilderDiscoveryUseCase → GW)
├── ActorRunRef, ChangeRef, ProjectRef
├── contractRevisionDigest        [imutável]
├── escopo read permitido + limites (do Actor Pack pinado, C-017)
└── SEM: composição de release (não existe), approval (read-only), transcript
    GW revalida: I&A do operador do Change? não — authority é o ActorRun sob
    Change aprovado, validada pelo use case ANTES da chamada (3D-01 §7);
    GW enforça read-only, scope, timeout, result limits

AgentExecutionContext          (PAR → GW)
├── AgentRunRef, ConversationRef?
├── composição governante do run  [ref imutável — manifest digest pinado no run, 3C-10]
├── artifactRevision/ToolProjection ref, envelope E, approvalRef quando efeito
└── GW revalida: I&A, eligibility de Connection, budget, idempotency, approval (tx §3.5)

ServingContext                 (MAR → GW)
├── principal/access resolvidos pela surface via I&A (3C-15)
├── ProjectRef derivado server-side da rota — nunca do payload
├── surface = PUBLISHED_APP
└── GW revalida: ponteiro ativo (efeitos em tx; reads §10), binding via release pin (§7)

QualificationContext           (QualifyConnectionUseCase → GW)
├── ConnectionRevisionRef + ConnectorDefinition ref  [imutáveis]
├── probe operation nomeada (do connector contract), classificada não-mutante
└── GW enforça: non-mutating, egress p/ target exato, sanitização; SEM release/binding

plano semântico compilado      (AnalyticQueryUseCase → GW)
├── produzido pelo Brain in-process (código server-side confiável — não é
│   "caller-supplied privileged fact" no sentido proibido; a proibição cobre
│   browser/LLM/guest, 3C-08)
└── GW enforça: role de leitura, bounds, timeout, ceilings
```

Regra transversal: **contexto carrega refs imutáveis e fatos já validados pelo lado que os owns; nunca carrega cópia de authority revogável** ("approvalWasValid=true" é o anti-padrão nomeado em 3D-01 §6).

---

## 7. Resolução de binding e de composição — a regra por surface (handoff §5.D/E)

O fato central que 3C-08 deixou implícito e 3D-02 precisa congelar:

```text
surface publicada (MAR)
→ binding/artifact/config resolvidos do ReleaseManifest ATIVO
→ ponteiro ativo é o único fato mutável; o resto é content-addressed

PAR (agent run)
→ composição pinada no início do run [imutável]; ponteiro NÃO é consultado
   para trocar composição in-flight (3C-10 probe item 9)

Builder discovery/candidate
→ NENHUMA consulta a Release; authority é Change-scoped (contrato pinado
   + bindings de intent atual do Project quando a investigação usa Connection)

Qualification
→ nem Release nem Project: opera sobre ConnectionRevision exata no scope do owner
```

Consequências:

- **Release nunca conhece callers**: `ActiveReleaseComposition` é query caller-agnóstica (`(project, target) → manifest digest + pins` e `digest → pins`). Não vira policy aggregator porque devolve só identidade/pins; policy de efeito continua compilada nas revisions (Registry) e access no I&A.
- **Ponteiro stale nunca vira contexto imutável**: caller pode carregar o digest que *acha* ativo (ex.: MAR para servir assets), mas admission de **efeito** re-lê o ponteiro na transação. Read publicado executa sob a composição resolvida no início do request (staleness limitada à duração do request — §10/§11).
- **Uma projeção é suficiente.** O risco "Release vira runtime policy aggregator" se materializa apenas se a projeção começar a devolver fatos derivados (permissões efetivas, budgets). Congelar o shape = identidade/pins somente.

---

## 8. Approval — forma mínima da inversão (handoff §5.C)

### 8.1 A simplificação tentada — e por que ela falha

Esta revisão construiu deliberadamente a hipótese mais simples possível para atacar o claim de R0:

> "`ApprovalRequest` nasce vinculada ao envelope exato (hash total, C-010). Envelope diferente ⇒ hash diferente ⇒ approval inválida por construção. Retry do mesmo envelope é deduplicado pelo idempotency claim. Logo a porta pode ser read-only `verify(approvalRef, envelopeHash)` — sem consume."

A hipótese falha em dois pontos independentes:

1. **Contra a autoridade:** C-010 congela literalmente `AWAITING_APPROVAL durável → claim atômico → executor determinístico do envelope exato`. O claim atômico **é** parte da decisão aprovada. Congelar uma porta read-only em 3D-02 seria enfraquecer C-010 por implementação — exatamente o workaround silencioso que o handoff proíbe.
2. **Contra a evidência externa:** o precedente OAuth é direto (§14). RFC 6749 §4.1.2 + RFC 9700 §4.2.4 exigem consume-once do authorization code **mesmo com binding na criação** (client id, redirect URI, PKCE challenge): "codes MUST be invalidated after their first use", com revogação de derivados no replay. A lição transferível: binding na criação derrota *substituição* (envelope errado), mas só consume-once derrota *replay do mesmo efeito* — porque a supressão de duplicata via ledger de idempotency tem dependências próprias (janela de retenção — Stripe poda ≥24h; chave por effect identity, não por approval). Uma approval válida por horas combinada a claims de idempotency podados abriria re-execução tardia do mesmo envelope sem nova decisão humana.

### 8.2 Forma recomendada para 3D-02 congelar

```text
port (definido no Gateway, implementado pelo PAR, wired no composition root):
  claimForExecution(approvalRef, envelopeHash)
  → CLAIMED                      transição atômica APPROVED → CLAIMED,
                                 vinculada ao envelopeHash e ao effect record
  → ALREADY_CLAIMED_SAME_ENVELOPE  caminho de retry/reconciliação do MESMO
                                 envelope; elegibilidade segue traffic_state (§9)
  → INVALID(NOT_FOUND | ENVELOPE_MISMATCH | EXPIRED | REVOKED | ALREADY_TERMINAL)

propriedades:
- executa DENTRO da transação de admission do GW; a escrita é statement do
  PAR sobre a própria authority (3D-01 §10: atomicidade compartilhada,
  ownership intacto)
- claim no mesmo commit que budget reserve + idempotency claim + effect
  record NOT_SENT ⇒ nunca existe "approval claimed sem effect record":
  crash pós-commit deixa par claim+NOT_SENT que a reconciliação resolve —
  o claim não é queimado, é retomável para o envelope exato
- específica de approval; NUNCA generaliza para CallerAuthorityVerifier
- INVALID/erro/timeout da porta ⇒ DENY (fail-closed)
```

Isso é R0 confirmado com uma precisão a mais: `ALREADY_CLAIMED_SAME_ENVELOPE` é resultado legítimo (retry), não erro — a distinção replay-malicioso × retry-legítimo é feita pelo par (envelopeHash, traffic_state), não pela porta sozinha.

### 8.3 Alternativas falsificadas

- **Read-only `verify` + dedupe por idempotency**: §8.1 — contra C-010 e contra o precedente RFC 9700. Rejeitado.
- **Pre-claim pelo PAR antes de chamar o GW**: separa claim do effect record (duas transações) — crash entre elas queima approval sem effect record rastreável e reabre a janela que o claim-no-admission fecha de graça. Rejeitado.
- **Snapshot de approval no contexto**: TOCTOU direto; proibido por 3D-01 §6. Rejeitado.
- **GW ler tabela de ApprovalRequest**: viola ownership (3C-01 inv. 4/5). Rejeitado.
- **Mover execução de efeito para o PAR**: viola 3C-08 (GW owns effect execution); duplicaria ledger/egress/sanitização. Rejeitado.

---

## 9. Budget, idempotency e admission ledger — split de ownership (handoff §5.H/I)

```text
DEFINE (policy/valores)                      ENFORÇA (mecânica)
├── artifact/agent manifest (C-009/C-010)    ├── GW: reserva atômica durável
│   budgets por unidade de efeito            │   p/ EXTERNAL_EFFECT | EXPORT
├── política por conta × classe (C-016)      ├── GW: contadores leves in-memory
│   READ_CHEAP..EXTERNAL_EFFECT              │   p/ READ_* (best-effort throttle)
├── Release: composição que pina os valores  ├── GW: WRITE_LOCAL durável quando
└── Builder: budget de validação do Change   │   approvalFloor > NONE (C-016)
                                             └── GW: idempotency claim + effect record
```

O **admission ledger é estado owned do Gateway** — não é import, não é telemetria (C-013: effect ledger ≠ telemetry) e não é policy: guarda *contadores e claims*, nunca *valores de política*. Isso responde ao ponto de pressão god-module do handoff: o GW pode possuir o ledger sem virar budget authority porque a fronteira é "valores vêm compilados/da política; o ledger só debita".

Composição atômica anti-overspend/anti-duplo-efeito: §3 passo 5 — reserva de budget, `verify` de approval, claim de idempotency e effect record `NOT_SENT` no **mesmo commit**. Duas corridas resolvidas de graça pelo banco: budget concorrente (decremento atômico/row lock) e duplicata de idempotency (unique constraint; perdedor lê o effect record vencedor e responde conforme contrato — padrão Stripe, §14).

Precondition/idempotency como **parâmetros compilados**: a declaração tri-estado de precondition, a derivação da idempotency key e a classificação de efeito chegam da revisão compilada (Registry). Nenhum lookup semântico adicional na execução; o GW enforça a forma física (DML condicional com cardinalidade esperada, version/ETag). O significado continua no contrato da capability — GW não vira business-rule engine.

Para 3E/3G (não 3D): schema físico do ledger, janela de retenção de claims, política de settlement, recovery de `NOT_SENT` órfão (crash entre commit e send — vira `NOT_SENT` reconciliável, nunca efeito fantasma).

---

## 10. Reads permanecem leves — variante do caminho (handoff §5.A/H)

Para query/AnalyticQuery de app publicado:

```text
admission read = I&A da surface (mesmo request) + revisão compilada [cache por digest]
                 + composição resolvida no início do request + limites físicos
SEM: approval, budget durável, idempotency claim, effect record
```

Justificativa da assimetria (é a mesma de 3C-08 "reads simples permanecem leves"): o custo de uma leitura autorizada milissegundos após revogação é limitado e não-externo; o custo de um efeito é material e irrevogável. A classificação staleness-por-classe está no §11.

---

## 11. Matriz TOCTOU (handoff §5.K)

| Corrida | Classe | Tratamento |
|---|---|---|
| sessão/conta revogada durante call | efeito: **mesma tx de admission** (lookup I&A); read: *bounded stale* (resolução da surface no mesmo request) | janela = duração do request; sem efeito externo possível no read |
| ponteiro de Release troca durante call | efeito: **re-read na tx**; read: *bounded stale* (composição do início do request); asset serving: **ref imutável** (digest) | swap concorrente já é serializado pelo CAS do ponteiro (C-014) |
| credential/grant revogado durante call | admission: **lookup na tx** (eligibility CON); execução: backend falha closed na resolução; janela pós-send | pós-send = **contrato de concorrência com sistema externo** — `traffic_state`/receipt, nunca "FAILED" inventado (3C-08) |
| approval revogada/expirada/replay | **mesma tx** — claim atômico via porta §8 | INVALID ⇒ DENY; retry do envelope idêntico ⇒ `ALREADY_CLAIMED_SAME_ENVELOPE` + traffic_state decidem elegibilidade |
| budget consumido concorrentemente | **mesma tx** — reserva durável atômica | decremento condicional/row lock; sem reserva fora de tx |
| duplicata de idempotency em corrida | **mesma tx** — unique claim | perdedor devolve estado/receipt do vencedor conforme contrato |
| precondition muda entre read e efeito | **contrato de concorrência externa** | enforçada NO alvo (DML condicional/cardinalidade/ETag — C-010); nunca "verificar antes e confiar" |
| revisão compilada / ConnectionRevision / manifest digest | **ref imutável — sem revalidação** | content-addressed; cache indefinido permitido |

Nenhuma máquina de transação distribuída nasce: tudo à esquerda é uma transação Postgres; tudo que cruza a fronteira externa é tratado por desenho de efeito condicional + receipt.

---

## 12. Findings (classificados contra autoridade vigente)

### F-R1-1 — Porta de approval: claim/confirm confirmado; simplificação read-only testada e rejeitada (refinamento; alerta de precisão sobre 3D-01 §6)

3D-01 §6 descreve a capability com o verbo "revalidar/verificar" e o resultado `valid | invalid/stale/revoked` — linguagem que, lida isolada, admitiria uma porta read-only. C-010, autoridade superior, exige `claim atômico`. Esta revisão construiu a versão read-only, tentou sustentá-la, e a derrubou por autoridade (C-010) e por evidência externa (RFC 6749/9700: consume-once obrigatório mesmo com binding na criação — §8.1, §14). 3D-02 deve congelar a forma claim/confirm do §8.2 e, ao fazê-lo, fechar a ambiguidade de leitura de 3D-01 §6 explicitamente — sem emendar 3D-01, apenas precisando que "revalidar" se realiza como claim atômico conforme C-010. Classe: refinamento/derived precision; nenhuma violação de autoridade.

### F-R1-2 — Fonte de binding por surface (DERIVED_REQUIREMENT para 3D-02)

3C-08 lista `projectBindingValid → Project` sem distinguir surface. Implementação literal leria o binding *atual* do Project no caminho publicado — violando o pin de composição de C-014 (mudança de intent do Project alteraria serving sem Release). A regra correta (§7): serving resolve do ReleaseManifest ativo; Builder/qualification resolvem intent atual. Precisa ser congelada em 3D-02; é o tipo de gap que vira bug silencioso de produção. Não reabre 3C — refina a leitura de 3C-08 dentro da autoridade C-014 existente.

### F-R1-3 — Conjunção de admission como união fechada (DERIVED_REQUIREMENT para 3D-02)

O guard concreto contra a acreção god-module (risco nº 1 apontado em R0 e no handoff §5.L): congelar as classes de fato da conjunção (§3 passo 5, a–i) como **união fechada**. Nova classe de fato de admission = decisão de arquitetura registrada, não PR de implementação. Análogo externo: admission do Kubernetes cresce registrando estágio novo na ordem fixa, nunca alargando o contrato de um estágio (§14). Sem isso, cada feature nova adiciona "só mais um check" ao Gateway até ele virar o policy engine proibido.

### F-R1-4 — Policy de efeito sob composição pinada vs release ativa (roteado a 3G/3I; candidato a THREAT_MODEL_EXPANSION)

Assimetria descoberta ao cruzar 3C-10 (run antigo preserva Release antiga — probe item 9), C-015 (mudança de permissão nunca gera CLIENT_OUTDATED; policy amarrada ao releaseManifestDigest) e 3A-R5/3C-10 (runs suspensos podem durar dias): um **AgentRun suspenso e retomado executa efeitos sob approvalFloor/agentEligible/budgets da composição antiga**, mesmo após o operador promover release com *narrowing* deliberado de permissões. Humanos pegam a policy da release ativa; agentes in-flight, a pinada. A mecânica de dependência de 3D-02 serve às duas leituras (a projeção de Release resolve qualquer composição por digest) — o que falta é a **regra de governança**: qual composição governa fatos de *policy de efeito* para runs in-flight. Recomendação de disposição: 3D-02 registra a assimetria e congela apenas a mecânica; 3G/3I decidem a regra (opções: policy de efeito sempre da release ativa com código pinado; ou pin total com invalidação de runs no narrowing; ou floor = max(pinada, ativa) — monotônico com 3C-08). Não é blocker de 3D-02; é blocker de deixar implícito.

### Sem Finding contra 3D-01

O layering, as arestas GW aprovadas, a inversão única, a regra pinned/revalidated e a proibição `GW → PAR` resistiram ao detalhamento. Em particular a asserção de 3D-01 §15 ("obrigar caller a montar AdmissionContext completo duplica revalidation e aumenta TOCTOU") foi re-testada no §13 e confirmada.

---

## 13. Falsificação god-module: tentativas de split e por que falham (handoff §5.L)

**O argumento mais forte de que a boundary está larga demais:** o Gateway concentra (i) decisão de admission sobre fatos de cinco owners, (ii) estado durável próprio (ledger), (iii) execução física de dois executores, (iv) sanitização/receipts. Quatro responsabilidades; SRP sugere cortar.

**Split A — Admission (decisão) ≠ Execution (I/O), dois módulos.** Falha: o conjunto atômico {budget reserve, approval verify, idempotency claim, effect record} precisa commitar *vinculado à tentativa de execução* — separar módulos exige interface carregando a transação inteira + o envelope + os claims entre eles, uma superfície *maior* que a seam interna atual. Os análogos externos separam decisão de enforcement quando o decisor é **externo ao processo** (Envoy `ext_authz`, K8s webhooks); in-process, a separação correta é a que 3C-08 já fez — estágios internos ordenados, não módulos. O split cria machinery e não elimina classe de falha.

**Split B — ProjectDataExecutor ≠ ExternalIntegrationExecutor como módulos.** Falha: compartilham admission, ledger, sanitização e limites; divergem só no último degrau físico. 3C-08 já os fecha como executores internos da união fechada. Módulos separados = duplicação da conjunção ou um terceiro módulo "AdmissionCore" — god-module com outro nome.

**Split C — Encolher: AnalyticQuery para o Brain, qualification I/O para Connections.** Falha direta contra 3C-09 (`semantic planning != physical execution`) e 3C-07 (Connections não abre socket). Reabriria 3C sem failure class.

**Por que a boundary atual é globalmente preferível:** cada tentativa de split ou (a) recria a conjunção em dois lugares, (b) transporta a transação por interface, ou (c) devolve poder físico a um owner semântico. O tamanho do Gateway é controlado não por corte, mas por três travas já congeladas + uma proposta: Minimal Enforcement Surface, No Universal Privileged Bus, budget *values* fora do GW — e a união fechada de classes de admission (F-R1-3). Com as quatro, o crescimento do módulo exige decisão explícita em todo eixo.

---

## 14. Comparação externa com valor decisório

Formato exigido pelo handoff: fato observado → decisão que sustenta/desafia → por que a transferência vale.

**OAuth 2.0 — RFC 6749 §4.1.2 + RFC 9700 §4.2.4 (BCP, 2025).** Fato: authorization codes "MUST be invalidated after their first use"; replay ⇒ deny + SHOULD revogar tokens derivados — **mesmo com** binding na criação (client id, redirect URI, PKCE challenge/verifier). Decisão afetada: **derrubou a simplificação read-only da porta de approval** (§8.1). Transferência válida porque a estrutura é idêntica: artefato de autorização criado vinculado a uma requisição exata, apresentado depois por um portador em outro momento — binding derrota substituição; só consume-once derrota replay. Diferença de produto (in-process vs federated) reduz a janela, não a classe.

**Stripe idempotency (docs atuais).** Fatos: claim por chave com três estados — in-flight (duplicata concorrente ⇒ 409, nada cacheado), completed (replay devolve resultado salvo verbatim, incluindo erros), pruned (≥24h ⇒ re-executa como novo); parâmetros comparados no reuse (mismatch ⇒ `idempotency_error`); resultado só é salvo depois que a execução *começa*. Decisões sustentadas: o shape do idempotency claim do §9 (unique claim na tx; perdedor lê o vencedor; param/envelope hash vinculado ao claim) e o argumento de retenção do §8.1 — **a poda de claims é política do ledger, logo o ledger não pode ser a única barreira de replay de approval**. Transferência válida: Stripe é o contrato de efeito-sobre-sistema-externo mais exercitado publicamente; nossa fronteira externa tem exatamente a mesma física.

**Zanzibar/SpiceDB — consistência com ZedTokens/zookies.** Fatos: níveis por request (`minimize_latency` / `at_least_as_fresh` [ZedToken como piso causal] / `fully_consistent`, este "dramatically impacting latency"); o "New Enemy problem" é o nome do risco de staleness; a prática recomendada é staleness limitada com piso causal como default e consistência plena só onde a revogação precisa ser observada imediatamente. Decisão sustentada: o corte do §10/§11 — **reads toleram staleness limitada (request-scoped); efeitos revalidam na transação** — é a mesma estrutura do sistema de autorização mais escrutinado publicamente, com janela menor (in-process, sem replicação). Também sustenta a resposta ao contra-argumento §15.2: classe de read cujo vazamento seja material vira classe de efeito (EXPORT, C-016), não abandono do corte.

**Kubernetes admission (já estabelecido em R0, reaplicado).** Fato: pipeline fixo de estágios one-way; extensão por registro de estágio novo na ordem, nunca por alargar contrato de estágio existente; validators veem o objeto final. Decisão sustentada: F-R1-3 — a conjunção de admission como **união fechada** cuja extensão é decisão explícita. Transferência válida: é o mesmo problema (admission composta de authorities independentes) na mesma topologia (um enforcement point, N fontes de fato).

**Envoy `ext_authz`.** Fato: decisão de autorização tomada **antes de abrir o upstream**, por um decisor separado que recebe o contexto da request; o proxy permanece o único enforcement point. Decisão sustentada: GW como PEP que agrega fatos e decide antes do side-effect (§3); e a falsificação do Split A (§13) — a separação decisão/enforcement dos análogos externos existe porque o decisor é *outro processo*; in-process ela não paga a interface que cria.

**Mitra (corpus empírico interno, reaplicado de R0 onde muda decisão aqui).** Fatos: resolução de connection handle em execution-time server-side; "o defeito é existir segundo caminho" (release-as-set desenhado, operação por caminhos avulsos); guarda de credencial contornado por `fetch` cru sem egress governado. Decisões sustentadas: lookup de eligibility/credencial **por efeito** na tx (§5); F-R1-2 (fonte de binding por surface — o "segundo caminho" da Mitra é precisamente ler intent atual onde o pin deveria mandar); e a lembrança de que a matriz de imports é arquitetura, não fronteira física (3I completa).

**Rejeições explícitas de best practice externa:** (a) SpiceDB `fully_consistent` como default de admission — nossa admission já roda no Postgres autoritativo, não há cache a contornar; adotar a nomenclatura criaria machinery de consistência sem cache que a justifique. (b) Stripe "não salvar claim que nunca começou a executar" — correto para uma API pública com clientes arbitrários; nosso admission ledger *deve* registrar `NOT_SENT` antes do send porque o registro é a âncora da reconciliação (C-013 persist-first), e o chamador é código confiável do Hub. (c) Zanzibar como motor de autorização — proibido por 3C-02/LEDGER (sem FGA engine); só o modelo de consistência transfere.

---

## 15. Contra-argumento mais forte / falsificação da própria revisão

**1. "O claim na porta faz o Gateway escrever estado de outro owner dentro da sua transação — é a primeira rachadura no ownership."** O ataque mais forte à forma §8.2. Resposta: a escrita é executada pela implementação do PAR sobre a própria authority — o GW invoca a capability, não toca a tabela; é exatamente o caso que 3D-01 §10 legitima (atomicidade compartilhada via operações dos próprios owners). A alternativa read-only foi testada e cai contra C-010 e contra o precedente RFC 9700 (§8.1). O que deve permanecer vigiado: esta é a ÚNICA escrita cross-owner dentro da admission tx; uma segunda capability desse tipo exigiria decisão explícita, não analogia. Dependência frágil declarada: a segurança do conjunto ainda exige que o envelope hash inclua identidade única da unidade de efeito (dois envios legítimos = dois envelopes = duas approvals) — 3D-02 congela a propriedade, 3F realiza.

**2. "Bounded-stale para reads é um buraco de segurança disfarçado de pragmatismo."** O modelo de consistência de authorization mais escrutinado publicamente (Zanzibar) trata staleness limitada como *default* e reserva consistência plena para onde o "new enemy problem" importa — com a diferença de que aqui a janela é a duração de um request in-process (ms), não replicação global. O corte efeito-revalida/read-tolera segue a mesma lógica com janela menor. Se 3I identificar uma classe de read cujo vazamento pós-revogação seja material (ex.: export), a resposta é reclassificar *aquela classe* como efeito (EXPORT já é classe C-016), não abandonar o corte.

**3. "A união fechada (F-R1-3) vai ossificar a admission."** Custo real: cada fato novo exige decisão. É o custo desejado — a alternativa (adicionar checks por PR) é como gateways viram policy engines. K8s paga o mesmo custo há uma década com estágios fixos e extensão por registro explícito.

**4. "Modelar só o efeito agent-originated enviesa o desenho."** Os outros caminhos são subconjuntos estritos da conjunção (§3/§10) — verificado surface a surface no §6. O viés seria material se algum caminho exigisse fato *fora* da união; nenhum exige.

---

## 16. Recomendação exata: o que 3D-02 congela vs. difere (handoff §8.16)

**3D-02 congela:**

1. o grafo do §4 (arestas diretas + porta única + emit-only OBS + ledger owned);
2. a união fechada de classes de fato de admission (§3 passo 5 / F-R1-3);
3. a regra de fonte de binding/composição por surface (§7 / F-R1-2);
4. os quatro caller contexts tipados do §6 + a regra "ref imutável viaja, authority revogável nunca viaja como cópia";
5. a forma da porta de approval: `claimForExecution(approvalRef, envelopeHash)` com claim atômico dentro da tx de admission (realizando o `claim atômico` de C-010), resultado `ALREADY_CLAIMED_SAME_ENVELOPE` como caminho legítimo de retry, + a propriedade "envelope hash inclui identidade única da unidade de efeito" (§8, §15.1);
6. o split budget: valores/policy nos owners, ledger mecânico no GW; reserva/claims/effect record no mesmo commit (§9);
7. a matriz TOCTOU §11 como classificação normativa (o que exige tx, o que revalida, o que tolera staleness bounded, o que é contrato externo);
8. reads leves: sem approval/budget durável/idempotency/effect record (§10);
9. health fora da conjunção de admission (§5);
10. registro do Finding F-R1-4 com rota 3G/3I.

**3D-02 difere explicitamente:**

```text
schema físico do admission ledger, retenção, settlement            → 3E/3G
DTOs/assinaturas dos contexts e da porta; shape exato do envelope  → 3F
FSM de effect/retry/reconciliação; regra de qualification gating   → 3G
regra de governança de policy p/ runs in-flight (F-R1-4)           → 3G/3I
cache/invalidations de projeções; pooling; performance             → 3H
egress físico, custódia, sanitização de erro                       → 3I
recovery de NOT_SENT órfão / crash pós-commit                      → 3M
```

Congelar menos que isso deixa as duas armadilhas reais (F-R1-2, F-R1-3) para a implementação; congelar mais que isso invade 3E/3F/3G sem necessidade.

---

*Fim da revisão independente R1. Nenhuma implementação de produto é autorizada por este documento.*
