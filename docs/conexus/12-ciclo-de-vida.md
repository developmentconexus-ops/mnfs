# C-014 — Ciclo de vida: git model, ambientes, release, rollback (T11)

> Ratificada em 2026-08-12. Convergência adversarial (Codex xhigh): 7,8 → 8,4 → **8,8/10** em
> 3 rodadas (barra 8,5) — "B1–B4 fecham as quatro objeções sem reabrir C-005, C-006, C-008 ou
> C-010–C-013". Insumos: pesquisa interna (3 varreduras — acervo C-000..C-013, Mitra medida
> OBS-01..77, mercado) + deep research externa (v0/Lovable/Bolt/Replit/Devin/Copilot agent,
> 12-factor, Vercel/Supabase/Neon, Prisma/Rails/Django/Flyway/Liquibase/Atlas/Drizzle,
> SLSA/in-toto/SPDX). Norte: global maximum — o modelo de conjunto da Mitra é bom; o defeito
> dela é operar em peças soltas. Ver [pesquisa interna](pesquisa-interna-ciclo-vida.md).

## 1. Decisão em 1 frase

Ciclo de vida F1 = **ReleaseManifest imutável como composition root sob o ponteiro CAS único**
(código + artefatos + schema + config contract + evidência + proveniência), com 1 commit
canônico por Work Unit, ambientes fechados {BuildValidationDatabase, workspace, preview
efêmero, PROD lazy}, promote como transação de domínio com gate humano e
EnvironmentConformance medindo o alvo real, migrations forward-only em produção com dois
ramos de compatibilidade, e rollback = re-point pelo mesmo gate com elegibilidade mecânica —
**nenhum caminho de mudança de schema/artefato/config existe fora do release**.

## 2. Regra de ouro (lição central da Mitra)

A sonda C-009 mediu a Mitra DESENHANDO release-como-conjunto (promote §27, 12 steps) e
OPERANDO em peças soltas: DDL vale no instante, SF publica por id, dado corrigido por UPDATE
avulso, deploy falha em silêncio (OBS-72.3), push recusado com turno "concluído" (OBS-52).
O defeito não é o modelo — é existir segundo caminho. Portanto:

**A plataforma não oferece nenhum caminho de mudança de schema, artefato ou config que não
passe pelo release.** Drift detectado (mudança que apareceu por fora) = `DRIFT` → STOP,
nunca "aplica o resto e vê".

## 3. ReleaseManifest = composition root

`releaseManifestDigest == deploymentManifestDigest` — **mesmo objeto, mesma identidade**.
T11 não cria manifesto novo: consolida o deployment manifest C-005, já estendido por
C-010/C-011/C-012, num schema único versionado (`manifestSchemaVersion`).

Composição:

- `source`: `commitSha`, `resultTreeSha`, `bundleDigest` — identidades da árvore/bundle que
  NÃO contém o manifesto (manifesto vive no plano de deployment do hub, nunca escrito de
  volta no repo/bundle que referencia).
- `artifacts`: `frontendDistDigest` + `runtimeContractDigest` (C-012),
  `registryArtifactSetDigest` (conjunto completo C-005), pins C-010 comp.2 POR INTEIRO —
  `agentRevisionDigest`, modelo solicitado+resolvido+provider+params, digests de
  contexto/policy, `toolProjectionDigest` + versão do compilador, digest da golden suite —
  e `brainDigest` + `projectBindingDigest` (C-011).
- `database`: `migrationHead`, `schemaFingerprint` esperado, `pgMajor`.
- `config`: `configContractDigest` por ambiente (§9).
- `dependencies`: `lockfileDigest`.
- `evidence`: `verificationDigest`, `validationDigest`.
- `provenance`: `actorRunIds` com identidade de execução C-002 (runtime, runtimeVersion,
  provider, model, actorPackHash, toolSurfaceHash).

Imutável; canonicalização C-011 §2 (ordenação, Unicode, números, line endings).

**Anti-circularidade — ordem total de fechamento:** (1) source digests (sem manifesto) →
(2) build digests (sem manifesto) → (3) evidence digests (sem manifesto) → (4) manifesto
canônico fecha incluindo 1+2+3 → (5) atestações externas (eval C-010) referenciam o digest
fechado. Eval attestation permanece FORA do manifesto (C-010 inalterada).

**Autoridades (3 de C-011, intactas):** composição = manifesto; serving = ponteiro CAS;
conteúdo publicado = git; ciclo operacional = Postgres. `ReleaseRecord` = projeção
operacional do manifesto no Postgres (`releaseSeq` monotônico por projeto + rótulo humano
opcional + estado) — NUNCA fonte de composição ou serving. `PromotionRecord` = histórico
append-only por ambiente — idem. Emenda a C-005 comp.12 registrada (§17).

## 4. Git model

- **1 commit canônico de resultado por Work Unit bounded** (C-002 "1 worker fresco por
  unidade") — NUNCA por model/tool turn. Worker livre para commits temporários no sandbox;
  SHARE importa exatamente 1 commit de resultado amarrado ao ActorRun (C-008 intacta).
- **Branch lógica por Change** — linha de mudança conduzida por 1 construtor, nome
  determinístico do hub (`change/CX-<id>`); work units sucessivas somam commits nela via hub;
  integração em `main` após validação de composição. Preserva 1-writer-por-branch (C-000) e
  CIC-1 (branch por construtor = a linha que ele conduz). Merge sem force/rebase; conflito →
  pergunta em linguagem de negócio.
- **Três histórias deliberadamente separadas:** operacional detalhada = `agent_event`/
  ActorRun (C-013); código = commits semânticos; percebida pelo usuário = Releases/Versions
  (nunca SHA cru).

## 5. Remoto e repositório

Repo git por app gerado. F1 = GitHub privado; **hub é o único portador de credencial de
push** (C-008 literal — nenhuma plataforma medida faz worker-sem-remoto → bundle →
quarentena; conservadorismo nosso sobre primitive git legítimo, mantido). Declarações no
repo (`frontend/`, `artifacts/` queries/actions/agents/brain-bindings, `migrations/`, config
schema, planning docs); registry do hub = projeção compilada de deployment, nunca segunda
fonte de authoring (C-005 comp.2). Brain: árvore/repo do grupo, fora do repo do projeto
(C-011 §2).

## 6. Ambientes — união fechada F1

`{BuildValidationDatabase (efêmero, C-008), workspace DEV (o database do projeto, C-006),
RunPreview (efêmero, autenticado, por digest, mesmo dist byte-a-byte — C-012 §16), PROD}`.

- **PROD = ambiente do mesmo projeto**, com database separado **no mesmo cluster Postgres**
  (C-006 comp.1), isolado por conexão/roles (role de workspace não conecta ao database PROD
  e vice-versa; grants cruzados ausentes), com roles/backup/restore-drill próprios e release
  pointer próprio. Criado **lazy no primeiro promote** (sub-máquina §11). Emenda a C-006
  comp.2 registrada (§17). Segunda instância/cluster = fora da F1.
- **CIC-2 reinterpretado** (emenda registrada): "projeto forkado" = **ambiente isolado com
  lineage do projeto**, não segundo projeto lógico. SPIKE da sonda ("promote cria banco
  novo?") fica irrelevante por design: PROD tem database próprio por definição.
- **Sem staging persistente** (proibições C-005/C-006 e RC-3 intactas). Necessidade
  prod-like = QA-DB-3 (snapshot sanitizado → rehearsal → destrói), que é UNIVERSAL (§10).
- **Binding ambiente-app × Connection-environment explícito** (fecha T-3): PROD → Connection
  environment de produção; workspace/preview → sandbox/homologação por default; exceção
  exige registro explícito. Projeto sem ambiente PROD não usa Connection de produção.

## 7. EnvironmentConformance

Gate mecânico pré e pós-promote que mede o **alvo real**, não os arquivos: pg major;
extensões; `current_user`; `rolsuper`/`rolbypassrls`; grants; migration ledger
expected×actual + checksums; `schemaFingerprint` real; config bindings requeridos presentes
e resolúveis; Connection revision **pinada == revision ativa no ambiente alvo** (não apenas
"qualified"); release pointer atual; digest servido.

`schemaFingerprint`: algoritmo versionado (`fingerprintAlgoVersion`), determinístico,
catálogo-apenas (tabelas, colunas, tipos, constraints, índices, defaults — nunca row
counts/estatísticas); pg_major, extensões, roles/grants/bypass = provas DISTINTAS, não
misturadas ao fingerprint.

Divergência ⇒ flag `DRIFT` → STOP. Evidência que paga o mecanismo: caso real Marketplace
(árvore verde + testes verdes; runtime PROD com role bypassando RLS — physical realization
divergiu do declarado) + OBS-72.3 (3 builds, host servindo antigo, zero detecção).

## 8. Promote = transação de domínio

Estados explícitos + recovery; não é distributed transaction. **Gate humano na F1**: operador
aprova a composição exata (diff + preview do MESMO dist). **Nunca rebuild no promote** —
condição necessária: candidate construído sob contrato de config compatível com o alvo;
config mudou entre validação e promote ⇒ candidate `STALE` → revalidação (nunca rebuild
silencioso sob o mesmo releaseId).

Máquina em **dois planos**:

```text
candidate/release (por projeto):   BUILDING → VERIFIED → AVAILABLE   (terminal: REJECTED)
promotion/environment (por alvo):  APPROVED → CONFORMANCE_CHECKED →
                                   [MIGRATING → MIGRATION_APPLIED_PENDING_CAS |
                                    MAINTENANCE_RECOVERY_REQUIRED]? →
                                   POINTER_SWAPPED → SERVED_VERIFIED
                                   (falhas: CONFORMANCE_FAILED | MIGRATION_FAILED |
                                    CAS_CONFLICT | SERVE_VERIFICATION_FAILED)
```

Flags ORTOGONAIS de bloqueio (não estados da união): `DRIFT`, `STALE`,
`ROLLBACK_UNAVAILABLE_SCHEMA_INCOMPATIBLE`.

Sequência com migration: aprovação → deployment lock (C-006) → EnvironmentConformance →
ledger+checksums+fingerprint → prova de compatibilidade (§10, por ramo) → backup
pré-migration com upload confirmado (C-006) → aplica migrations → conformance pós-migration →
CAS → GET pelo caminho real → digest == esperado → SERVED_VERIFIED.

Regras de recovery:

- CAS carrega `expectedGeneration`/`expectedPointer`; divergência ⇒ `CAS_CONFLICT` ⇒
  candidato revalida contra o novo estado (nunca força).
- Retry de promote com migration já registrada NUNCA reaplica (ledger + checksum
  idempotentes — retoma do passo seguinte).
- CAS ok + digest servido divergente ⇒ `SERVE_VERIFICATION_FAILED`; SERVED_VERIFIED nunca
  declarado; saída = re-point elegível ou forward-fix (precedente OBS-72.3).
- Primeiro promote: `previousReleaseId = null` explícito no PromotionRecord.
- Falha de step → **tarefa do agente** (CIC-3); **aceite = sempre hub** (C-013 — agente é
  executor, nunca autoridade de aceite; fecha T-12).
- Autorizador da janela `maintenance-required` = operador, no mesmo gate humano do promote.

**Observabilidade:** todos os steps = `agent_event` no Run Timeline (CIC-3 "steps nomeados
observáveis" satisfeito SEM dashboard e SEM smoke funcional pós-CAS — RC-3 preservada;
SERVED_VERIFIED continua prova de digest, não de comportamento). Promote não tem
`actor_run_id`: correlação por `promotionId` + `releaseManifestDigest` + `environment`
(emenda leve a C-013 §3).

## 9. Config: duas identidades

- **`configContractDigest`** (DENTRO do manifesto, parte da identidade do release): conjunto
  de slots + semântica + escopo + tipo + Connection revision bindings + valores NÃO-secretos,
  por ambiente. `ConfigBindingRevision` imutável, resolvida server-side pelo hub no serve.
  Mudança funcional (semântica, host, escopo, Connection revision, slot novo/removido) ⇒ nova
  revisão ⇒ candidate `STALE`.
- **Material secreto** (FORA da identidade do release): cofre do hub mapeia
  `slotRef → secretVersionId`; rotação troca a versão do valor do MESMO slot sem novo
  release; evento operacional auditável (`agent_event`). Segredo NUNCA no manifesto nem no
  artefato (sentinel scan C-008 cobre bundle). Conformance verifica presença/resolubilidade
  dos slotRefs, nunca valores.
- Artefato imutável × environment binding separados (12-factor build/release/run). Runtime
  config injection pelo hub no serve; `import.meta.env` para valores de ambiente = proibido —
  lint no audit de scaffold (emenda leve a C-012 §14).

## 10. Migrations: dois ramos de compatibilidade

QA-DB-1 → QA-DB-2 → QA-DB-3 **universal para toda migration** (C-006 intacta). Gatilho
(transforma dados / cardinalidade / índice material / constraint sobre histórico / alteração
em massa) decide APENAS origem do snapshot do rehearsal (sintético mínimo × pg_dump
sanitizado recente) e profundidade das asserções — nunca elimina o gate.

- **`backward-compatible`**: prova N-1 mecânica pré-promote — `R[n-1]+S[n] = PASS` e
  `R[n]+S[n] = PASS`. CONTRACT nunca na release que introduz a representação nova (EXPAND →
  estabiliza → CONTRACT em release posterior). Janela `MIGRATION_APPLIED_PENDING_CAS` é
  condição normal recuperável (release anterior funciona sobre o schema novo). Emenda a
  C-005 comp.8: expand/contract continua recomendação de DESIGN; a PROVA N-1 vira gate
  mecânico neste ramo.
- **`maintenance-required`**: N-1 não exigida (contradiria a classificação). Janela com
  drain completo (C-006: requests mutantes + jobs queued/deferred/retry = zero ou
  cancelamento explícito), backup confirmado. Pós-aplicação e pré-CAS: estado
  **`MAINTENANCE_RECOVERY_REQUIRED`** — lock e janela permanecem; serving do release antigo
  BLOQUEADO (incompatível por definição); admissões continuam bloqueadas; hub é o único
  ator: retry idempotente → forward-fix → restore (última instância, manifesto de recuperação
  C-006). Saída SÓ por CAS+SERVED_VERIFIED, restore validado ou forward-fix promovido. Nunca
  reabertura silenciosa do serving antigo. Rollback para trás dela = inelegível por definição.

**Produção forward-only**: "successful production migrations are forward-only; down
migrations are not a supported release rollback mechanism" — reverse migration permitida em
DEV/investigação. PITR = disaster recovery, nunca mecanismo de release (free tiers 2026:
Neon ~6h history, Supabase PITR pago — pg_dump US$0 confirmado); F1 = pg_dump diário +
pré-migration + offsite + restore drill (C-006 intacta). **Drift check periódico** do banco
vivo × ledger (job barato; alarme via C-013) — fecha o buraco "QA reprova drift no build,
nada vigia entre builds".

## 11. Provisionamento PROD

Sub-máquina própria: `PROVISIONING → READY | PROVISION_FAILED`, com reconciliação de banco
órfão (database criado sem PromotionRecord terminal ⇒ job marca e remove após janela).
Nunca meio-provisionado silencioso.

## 12. Rollback

**Rollback de release = re-point pelo MESMO gate de promote.** Elegibilidade mecânica:
manifesto alvo compatível com schema atual (migrationHead do alvo ≤ aplicado E prova N-1
registrada cobre o par); senão flag `ROLLBACK_UNAVAILABLE_SCHEMA_INCOMPATIBLE` → forward fix
ou recuperação de dados (incidente, C-006). Melhor um bloqueio honesto que um botão verde
que destrói o app.

- Re-point reverte a **composição inteira** (Brain/conector/agente voltam juntos —
  consequência do ponteiro único, T-4); mitigação: revalidação leve dos pins no gate
  (conformance + health das Connections/Brain do manifesto alvo; não re-roda golden eval —
  atestação imutável do manifesto alvo vale por referência).
- **UI explícita: rollback de release NÃO restaura dados** (anti-precedente
  Lovable/Bolt/Replit — evidência externa forte). Três operações com nomes distintos:
  Restore source/change ≠ Rollback release ≠ Restore data.
- CIC-2 "rollback por tag" (emenda registrada): tag = rótulo humano sobre `releaseSeq` que
  RESOLVE a manifesto arquivado (re-point) — nunca recompilação de git (resolve T-5 sem
  violar "registry não é ponteiro pra git").
- Retenção: servíveis N últimos + apontado + anterior (GC por política, C-012 §12);
  `previousReleaseId` obrigatório no PromotionRecord.
- Roll-forward continua caminho preferido (evidência Mitra: 100% dos casos reais).

## 13. Escada C-013 por ambiente-alvo

Escada escopada: `WORK_COMPLETED → RESULT_PERSISTED → VERIFIED → AVAILABLE` no plano
candidate/release; `PROMOTED (POINTER_SWAPPED) → SERVED_VERIFIED` no plano
promotion/environment, avaliados contra o ambiente do promote (emenda leve a C-013 §13
quando PROD ativa; camadas feito/persistido/servido continuam distintas — fecha T-8).
Existir ≠ promovido ≠ servido (alinha AVAILABLE ≠ promote de C-011).

## 14. Proveniência (F1)

Digests criptográficos + autoridade Postgres; SEM PKI/Sigstore/assinatura (gatilho: SaaS,
multi-operador ou compliance). SLSA/in-toto = arquitetura mental, não dependência —
ReleaseRecord hash-linked já liga commit ↔ digest ↔ evidência ↔ actorRuns; AI-provenance sem
padrão consolidado em 2026 (externa) — não inventar AI-SLSA.

## 15. Glossário anti-colisão e não-unificação

- **Glossário obrigatório** (T-6): migration de banco (C-005/6) ≠ migration kit de scaffold
  (C-012 §5) ≠ admission ledger (C-013 §10) ≠ receipt ledger do Gateway (C-010 comp.10).
- **T-7 decidido por NÃO-unificação**: os 4 mecanismos de "upstream mudou, consumidor
  pinado" (Brain revalidation C-011, conector pin C-007, scaffold kit C-012, agente
  attestation C-010) mantêm suas máquinas próprias; o ReleaseManifest apenas COMPÕE os pins.
  Gatilho de revisão: surgir um 5º mecanismo.

## 16. CIC-4 e duplicação de projeto

Duplicação copia código + config schema + declarações; NUNCA banco, credenciais ou bindings
de Connection (re-bind explícito no destino). Pergunta sobre dados com default SEM dados.

## 17. Tabela de emendas

| Decisão | Emenda |
|---|---|
| C-005 comp.12 | Release ganha identidade própria (`releaseSeq` + rótulo) como `ReleaseRecord` = projeção operacional do manifesto no Postgres; git segue fonte do conteúdo; "sem tabela separada" vale para composição (manifesto), não para a projeção |
| C-005 comp.8 | Prova N-1 vira gate mecânico no ramo `backward-compatible` com migration; expand/contract segue recomendação de design |
| C-006 comp.2 | PROD ativa ⇒ segundo database do projeto no mesmo cluster, roles/backup/drill próprios (lazy, no primeiro promote) |
| C-012 §14 | Lint anti-`import.meta.env` para valores de ambiente entra no audit/verify |
| C-013 §3 | Correlação alternativa por `promotionId` + `releaseManifestDigest` + `environment` quando evento não tem `actor_run_id` |
| C-013 §13 | Degraus DEPLOYED/SERVED_VERIFIED avaliados por ambiente-alvo quando PROD ativa |
| CIC-2 (interpretação) | "Projeto forkado" = ambiente isolado com lineage do projeto; "rollback por tag" = tag resolve a manifesto arquivado (re-point), nunca recompilação |

## 18. NÃO construir (F1)

Staging permanente; release train; canary (removido C-007); blue/green; feature flags; DB
branching própria; multi-region; signing infra/PKI; engine de down-migrations; abstração
multi-provider de deploy; botão "Rollback everything" (código+dados); segunda instância
Postgres.

## 19. Probe bloqueante CX-REL-V0-01

(a) manifesto canônico → digest estável e recomputável; (b) promote sem migration completo
com PromotionRecord + SERVED_VERIFIED por digest; (c) DDL manual injetado no alvo ⇒
conformance detecta DRIFT e bloqueia; (d) promote backward-compatible: N-1 provada, backup
confirmado antes de aplicar, janela MIGRATION_APPLIED_PENDING_CAS recuperável; (e) rollback
elegível = re-point com conformance; inelegível (CONTRACT aplicado) ⇒
ROLLBACK_UNAVAILABLE_SCHEMA_INCOMPATIBLE; (f) mudança de config contract pós-validação ⇒
candidate STALE, promote recusado; (g) lint pega `import.meta.env` de valor de ambiente no
dist; (h) QA-DB-3 roda para migration trivial (ADD COLUMN); (i) drain completo provado na
janela maintenance-required (job deferred pendente bloqueia); (j) corrida de CAS: dois
promotes concorrentes ⇒ um CAS_CONFLICT, zero estado corrompido; (k) retry pós
MIGRATION_APPLIED_PENDING_CAS não reaplica migration; (l) PROD em database separado no mesmo
cluster, isolado por conexão/roles (conexão cruzada falha; grants cruzados ausentes);
(m) projeto sem ambiente PROD não usa Connection environment de produção; (n) digest servido
divergente pós-CAS ⇒ SERVE_VERIFICATION_FAILED (nunca SERVED_VERIFIED); (o) recomputo do
manifesto das partes == digest registrado + busca do digest dentro das entradas = ausente
(sem ciclo).

## 20. Nota de convergência

Rodada 1 (7,8): manifesto como identidade única (== deployment manifest), QA-DB-3 universal
restaurado, N-1 em dois ramos, config binding imutável, recovery completo (CAS_CONFLICT,
retry idempotente, SERVE_VERIFICATION_FAILED, provisionamento PROD). Rodada 2 (8,4):
configContractDigest × material secreto, fronteira anti-ciclo do source/build,
MAINTENANCE_RECOVERY_REQUIRED como estado próprio, database separado no mesmo cluster.
Rodada 3: **8,8 — convergência declarada**.
