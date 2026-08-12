# Pesquisa interna — Tópico 11: Ciclo de vida (git model, ambientes, release, rollback)

> Consolidação de 3 varreduras paralelas (2026-08-12): **A** = acervo de decisões C-000..C-013
> (o que já está congelado, o que T11 realmente decide, tensões); **B** = Mitra medida
> (referência `docs/reference/mitra/` + log da sonda C-009, OBS-01..77); **C** = mercado
> (v0/Lovable/Bolt/Replit/Devin/Codex cloud/Jules + prática de release/migrations/rollback).
> Estrutura por pergunta (espelha o prompt externo): Fatos → Confronto → Posição preliminar.
> Prompt externo em [pesquisa-externa-ciclo-vida-prompt.md](pesquisa-externa-ciclo-vida-prompt.md).

## Q0 — O que T11 realmente decide (escopo)

**Já congelado — T11 NÃO re-decide (varredura A, com citação):**

- **Fluxo git do build**: SYNC → WORK → SHARE mediado pelo hub; git bundle sem credencial;
  repositório de quarentena; verificação ancestry/diff/paths/`resultTreeSha`; validação
  independente; sentinel scan; "git push só no hub" é literal e PRESERVE na supersessão
  C-004→C-008 (C-008 comp.5 + matriz).
- **1 writer por branch de usuário; merge do git resolve** — argumento que matou lease/fencing
  do MNFS (C-000, `01-relacao-mnfs.md`). Produto nasce em **repo próprio**; repo do produto ≠
  repo do projeto gerado.
- **Três autoridades separadas** (C-011 §2): git = source of truth do publicado; Postgres =
  autoridade operacional; registry = payload compilado imutável, **não ponteiro pra git**
  (C-005 comp.2: `sourceCommitSha` + `artifactRevisionDigest`).
- **Deployment**: merge da branch validada DISPARA deployment; ativação = CAS por ambiente,
  geração monotônica, fila serializada por ambiente; manifesto = conjunto completo; 1 artefato
  inválido → nada ativa (C-005 comp.6). Pipeline canônico por extenso em C-006 comp.5
  ("gated deployment com migration transacional e cutover controlado", com deployment lock,
  quiesce, janela `maintenance-required` com drain completo incl. jobs).
- **Migrations**: arquivos timestamp imutáveis (checksum divergente REJEITA), QA-DB-1/2/3 em
  base efêmera, DEV 100% recriável das migrations, fase 1 só DDL transacional (C-005 comp.7,
  C-006 comp.4/5). `BuildValidationDatabase` nunca se chama "DEV" (C-008 comp.7).
- **Rollback regra-mãe** (C-005 comp.8): ponteiro volta SÓ sem migration no meio; com
  migration: roll-forward (preferência documentada) ou restore; expand/contract N/N-1 =
  recomendação, não gate. Paraquedas C-006 comp.8: dump pré-migration → restore em scratch →
  recuperação controlada só em incidente extraordinário; SEM time-travel local; cursor de ETL
  e efeitos externos no Sankhya ficam fora de qualquer mecanismo de banco.
- **Frontend**: `deployments/<project>/<digest>/dist`; publish = write completo → verify →
  troca do ponteiro C-005; rollback = ponteiro de volta; **ponteiro CAS ÚNICO** seleciona
  também `frontendDistDigest` — nenhum segundo ponteiro (C-012 §12/§16). 3 digests sem ciclo +
  handshake `CLIENT_OUTDATED`.
- **Escada de conclusão** (C-013 §13): `WORK_COMPLETED → RESULT_PERSISTED → VERIFIED →
  DEPLOYED → SERVED_VERIFIED`; SERVED_VERIFIED = GET no caminho real + digest servido ==
  esperado (nunca HTTP 200 — precedente OBS-60.3); **sem smoke funcional pós-CAS até RC-3**;
  hub fecha lendo verify + ponteiro, nunca declaração do agente.
- **Publish ≠ promote**: `AVAILABLE`/`UPDATE_AVAILABLE` informativo; promoção por projeto com
  revalidação; live inheritance REJECT; pin por projeto/ambiente sem auto-upgrade (C-011 §6,
  C-007 comp.10); promoção de conector reusa o gate C-005 (C-007 comp.11); canary removido.
- **Release = deployment, sem tabela separada na fase 1**; e a delegação literal: "Tag de
  release + versão visível no app: mecânica no tópico 11" (C-005 comp.12).
- **Requisitos ratificados sem decisão C-\*** (C-003, §CIC): CIC-1 MVP branch por construtor +
  main baseline, merge sem force/rebase, conflito → pergunta em linguagem de negócio; CIC-2 F1
  PROD = projeto forkado, deploy por snapshot versionado, rollback por tag; CIC-3 F1 promote
  com steps nomeados observáveis + falha de deploy vira tarefa do agente; CIC-4 F1 duplicação
  pergunta sobre dados (default sem dados).
- **STAGING proibido hoje** (C-005/C-006 §NÃO-fazer) e gatilhado por RC-3; `PreviewEnvironment`
  estável = decisão separada ADIADA (C-008 comp.9).

**T11 decide (8 lacunas reais, varredura A):**

1. **Branch model do repo gerado**: nome/formato do branch; 1 branch por construtor × por
   unidade de trabalho × por ActorRun (C-002 "1 worker fresco por unidade" não casa 1:1 com
   "branch por usuário" do C-000); PR × merge direto; resolução de conflito e em que
   linguagem; deleção de branch; bundles concorrentes na mesma quarentena.
2. **Onde vive o remoto**: host do repo do projeto (GitHub? bare no hub?); criação, naming,
   acesso; relação repo-do-grupo × repo-do-projeto × repo do scaffold/UI registry.
3. **União fechada de ambientes da F1**: DEV é só database (C-006) ou deployment servido com
   URL? PROD forkado (CIC-2) entra quando? Sem acionar RC-3 por acidente.
4. **Semântica de release**: tag git × GitHub Release + CHANGELOG × semver × conjunto de
   digests; Save Release ≠ Promote (ADOPT de acervo, sem C-*); string visível ao usuário;
   relação com geração monotônica do CAS.
5. **Rollback acoplado**: quantos deployments antigos servíveis e por quanto tempo (C-012 §12
   só diz "GC por política"); re-point re-executa QA gates?; destino dos pins co-versionados
   (Brain, conector, agente, eval attestation); rollback = botão de produto ou procedimento de
   incidente; cursor de ETL.
6. **Quem promove e quando**: aprovação humana explícita? agente pode disparar/retentar
   deploy? CIC-3 "falha de deploy vira tarefa do agente" × "hub fecha, nunca o agente"; quem
   autoriza janela `maintenance-required`.
7. **Objeto Deployment unificado**: campos, ciclo, estados; schema do manifesto hoje estendido
   por 3 decisões independentes (C-010 comp.2 agente, C-011 §6 brain, C-012 §12 frontend); GC
   de `deployments/<digest>`; projeção UI do progresso (CIC-3 pede 12 steps; C-013 §18 dá Run
   Timeline e proíbe dashboards).
8. **CIC-4** (duplicação de projeto) — sem nenhuma decisão correspondente.

## Q1 — Git model para código gerado por agente

**Fatos (B — Mitra medida):** commit por turno + 1 push ao final do turno; branch `user/{id}`;
main = baseline; fetch+merge todo turno; idle 20min mata o sandbox; `migrations/` é EXCLUÍDO
do `git add` do agente (materializada fora do turno, append-only). Falha real: OBS-52 — push
recusado silenciosamente e o turno fechou "concluído" (tabela feito/persistido/servido);
OBS-69.6 — falha de push é TRANSITÓRIA, não de config (retry resolve).

**Fatos (C — mercado):** dois modelos dominantes. (a) **Checkpoint amarrado ao chat**
(Replit, Bolt, Cursor, Claude Code, Lovable, v0): usuário vê "versões", não git cru; commits
automáticos por turno/checkpoint. (b) **Branch + PR por tarefa** (Devin, Codex cloud, Jules,
Copilot agent): branch efêmero, squash no merge — histórico do main limpo, granularidade de
turno preservada só na branch. Consenso emergente: **duas camadas de versão** — efêmera
(turnos/checkpoints) × durável (tarefa aceita/release).

**Confronto (A):** SHARE já produz "1 commit de resultado" por unidade (C-008 comp.5) — o
Conexus já é nativamente camada-dupla: micro-histórico fica no bundle/quarentena, o repo do
projeto recebe commits de resultado. CIC-1 exige conflito em linguagem de negócio.

**Posição preliminar (P1 refinada):** histórico do repo = commits de resultado integrados via
bundle após verificação (não micro-commits de turno); usuário vê versões/releases; branch por
unidade de trabalho do lado do hub (nome determinístico), merge pelo hub, sem force/rebase.

## Q2 — Checkpoints e restore

**Fatos (C):** Lovable restore = **código apenas; Supabase não volta junto** — falha de
mercado mais citada (banco incompatível pós-restore). Replit rollback também não reverte
efeitos externos. Nenhuma plataforma mainstream resolve restore código+banco atomicamente.

**Fatos (B):** Mitra não tem checkpoint de produto; "voltar" = agente conserta no próximo
turno. OBS-57: não existe migração de DADO como artefato — correção de dado foi UPDATE avulso
sem trilha.

**Confronto (A):** C-006 comp.8 já rejeita time-travel local pelo motivo exato que o mercado
comprova: tag git + timestamp não é checkpoint consistente (cursor ETL + efeitos no Sankhya
fora do banco). Gatilho CoW registrado: "voltar projeto p/ momento X virar feature" (T-11).

**Posição preliminar:** restore de código nunca prometido como restore de estado; UI deixa
explícito o que volta (código/config) e o que não volta (banco, efeitos ERP) — anti-precedente
Lovable. Restore de banco permanece procedimento de incidente (C-006), não botão.

## Q3 — Ambientes

**Fatos (B):** camada A (medida): **SEM DEV/PROD** — "o banco de DEV é o banco"; schema muda
no instante do DDL; SF publicada por id; anti-lição S2 do acervo ("falta-lhe ambiente, não
guarda"). Camada B (desenhada, nunca executada na sonda): PROD = projeto forkado (§27).

**Fatos (C):** padrão de mercado p/ operador solo: **preview por mudança + prod**, sem staging
persistente (staging com dados próprios = custo de sincronização permanente que times de 1
pessoa abandonam). Preview deve servir o MESMO dist byte-a-byte que será promovido (não
rebuild). Para apps de negócio: staging real só com dados mascarados — caro; sintético cobre
QA-DB-2.

**Confronto (A):** T-1: C-005 manda herdar "DEV+PROD por projeto"; C-006 entrega 1 database
por projeto e nunca provisiona o segundo — dobrar ambiente dobra roles, backup, restore-test.
T-2: "ambiente" é eixo normativo em 3 decisões mas o conjunto nunca é enumerado. T-3:
ambiente EXTERNO (Connection sandbox×produção Sankhya) existe desde C-007; ambiente de
aplicação, não — nada impede projeto sem ambiente apontar pra Connection de produção. T-10:
preview durável reabre C-008 (decisão adiada).

**Posição preliminar (P2 refinada):** F1 = união fechada {preview por digest candidato
(efêmero, proxy autenticado C-012), prod}; sem staging persistente; DEV permanece database de
trabalho (C-006), não um deployment servido; fork PROD (CIC-2) = a fronteira que T11 precisa
datar (F1 tardio ou gatilho); binding projeto-ambiente × Connection-ambiente vira regra
explícita (fechar T-3).

## Q4 — Release como unidade imutável

**Fatos (C):** prática consolidada = release como conjunto fechado; recomendação forte da
varredura: **release como entidade de 1ª classe no Postgres** apontada pelo CAS:
`{app_id, release_seq, code_digest, schema_version, config_ref/hash, bundle_commit, audit_id,
review_proof, status}`. Invariante de promote: **schema_version do release ≤ schema aplicado
no banco alvo**. Build-once-deploy-many exige: artefato imutável, config fora do build,
migrations desacopladas. Config: **runtime config injection pelo hub no serve**
(`import.meta.env` para valores de env = proibido; lint no audit) — senão "build once" morre.

**Fatos (B):** Mitra desenhou release-como-conjunto (12 steps nomeados §27:
preview/fork/env/baseline/build/tarball/sync/apply-migrations/deploy/changelog/
github-release/tag) mas **opera em peças soltas** (camada A). A lição central: o defeito não é
o modelo — é existir **segundo caminho** por onde schema/SF escapam do release. Vereditos
congelados (acervo §5, ADOPT): PROD forkado; 12 steps observáveis; Save Release ≠ Promote;
deploy por snapshot versionado (não live-mount); status `inSync/hasOutput/published/version`.

**Confronto (A):** T-5: "rollback por tag" (CIC-2) × "registry não é ponteiro pra git"
(C-005) — promover tag antiga exige recompilar (deployment novo com QA) ou reativar manifesto
arquivado (não é "tag"); semânticas incompatíveis hoje. C-005 comp.12 já diz "sem tabela
separada na fase 1" — a recomendação release-entidade-Postgres colide de frente e vira ponto
de cruzamento com a externa. T-6: colisão de vocabulário "migration"/"ledger" (kit de
scaffold C-012 × migration de banco C-005/6 × admission ledger C-013 × ledger do Gateway
C-010).

**Posição preliminar (P3 refinada):** release = manifesto-conjunto de digests + schema
version, selecionado pelo ponteiro CAS único; "tag" vira rótulo humano sobre o manifesto
arquivado (re-point, nunca recompila — resolve T-5); invariante schema_version ≤ aplicado
entra no gate de promote; se "entidade Postgres" exige emendar C-005 comp.12, a emenda é
mínima (projeção operacional do manifesto, git continua fonte); **regra de ouro anti-Mitra:
nenhum caminho de mudança de schema/artefato fora do release**.

## Q5 — Rollback de código × rollback de dados

**Fatos (C):** down-migrations abandonadas pelo mercado (Prisma sem down por design; Flyway
undo é pago; Rails/Django mantêm mas times não testam); expand/contract 3 fases = padrão para
mudança destrutiva; N-1 como requisito mínimo; PITR/branching em free tier 2026 é
apertado/instável → **pg_dump diário + drill de restore** é o caminho US$0 (pergunta de free
tier delegada à externa, Q5 do prompt).

**Fatos (B):** **ZERO rollbacks executados** em toda a sonda — sempre roll-forward ("agente
conserta no próximo turno"); migration = log de auditoria, NÃO gate (§33.3); forward-only sem
rollback de schema; OBS-44: correção que não toca a fonte não sobrevive (rebuild resssuscita o
bug — rollback de artefato sem tocar fonte é armadilha).

**Confronto (A):** regra-mãe C-005 comp.8 + paraquedas C-006 comp.8 já alinham com tudo
acima. T-4: ponteiro CAS único faz rollback ser TOTAL — voltar o ponteiro reverte também
Brain/conector/agente/modelo pinados; existe revalidation na promoção (C-011 §6) mas nenhum
correspondente para DESpromoção; validade da eval attestation ao reativar manifesto anterior
= indefinida. T-11: rollback como feature aciona gatilho CoW registrado.

**Posição preliminar (P4 refinada):** confirma P4 (sem down; expand/contract quando
destrutivo; pg_dump diário + drill; N-1 obrigatória) e adiciona: re-point para release
anterior exige o MESMO gate de promote (invariante schema_version + revalidação leve dos pins
— fecha T-4 sem criar máquina nova); roll-forward continua caminho preferido (evidência B:
100% dos casos reais); rollback na UI = re-point de release, nunca promessa de estado.

## Q6 — Promoção

**Fatos (B):** promote §27 NUNCA rodou na sonda — tudo que se sabe é extração de bundle;
sonda publicou por build/publish §24. Falhas do caminho medido: OBS-72.3 publicação falha em
silêncio (3 builds, host servindo antigo, `getDeployStatusMitra` inexistente; hash do bundle =
única detecção); OBS-68.7 proof comparou canal errado (não sabia do remoto) → 3 estados em
OBS-69.6; OBS-77.2/77.3 escrever ≠ compilar ≠ rotear ≠ publicar (página invisível de 3
jeitos); OBS-50 smoke asserta que HÁ resposta, não o valor (45 × 45.947). Veredito congelado
REJECT: dry-run só dentro do promote (validar ANTES — já absorvido por QA-DB-3).

**Fatos (C):** "promote = re-point, nunca rebuild" é consenso (rebuild na promoção = build
não reproduzível, arrependimento documentado); gate humano explícito é padrão saudável em
plataforma pequena entre "agente terminou" e "produção" (diff + preview de aprovação).

**Confronto (A):** merge dispara deployment (C-005) mas quem aprova o merge/promote de
projeto não está escrito (só Brain tem "humano publica", C-011). T-9: 12 steps observáveis
(CIC-3) não acionam RC-3 — observabilidade de steps ≠ smoke funcional pós-CAS; mas qualquer
verificação FUNCIONAL pós-deploy aciona. T-12: compatível se agente = executor sem autoridade
de aceite (falha de deploy vira TAREFA do agente; ACEITE continua do hub) — precisa ser
escrito.

**Posição preliminar (P5 refinada):** promoção por gate humano explícito na F1 (operador
aprova com diff + preview do MESMO dist); nunca rebuild; 12 steps do promote = eventos
`agent_event` no Run Timeline (C-013, sem dashboard novo); falha de step → tarefa do agente,
aceite sempre do hub (fecha T-12); rebuild órfão detectável por SERVED_VERIFIED (digest).

## Q7 — Config e segredos entre ambientes

**Fatos (C):** 12-factor evoluído: config fora do artefato, injetada no serve; classes de
drift DEV×PROD documentadas: auth, roles/RLS de banco, feature flags — mitigação mecânica =
mesma imagem + config declarada + diff de config entre ambientes.

**Confronto (A):** C-012 já proíbe `LOCAL_DEVELOPMENT_IDENTITY` em build de produção (gate);
Connection já carrega `environment` + credencial por ambiente (C-007); nosso caso real do
prompt (árvore verde + testes verdes, runtime PROD divergindo em role/schema/sessão) é
exatamente drift classe-roles. Segredos nunca no artefato: sentinel scan já cobre bundle.

**Posição preliminar:** config por ambiente = documento versionado referenciado pelo release
(`config_ref/hash` no manifesto — mercado confirma); valores de segredo NUNCA no manifesto
(referência a slot, valor no cofre do hub); lint anti-`import.meta.env` p/ env values entra no
audit de scaffold (emenda leve C-012 a confirmar no cruzamento).

## Q8 — Migrations em produção contínua

**Fatos (B):** `migrations/` fora do commit do agente (materialização fora do turno) —
separação autor×aplicador já validada na prática; migration como log, não gate (§33.3) = o
anti-padrão que C-006 já corrige.

**Fatos (C):** detecção de drift schema-declarado × banco-real (Atlas, Prisma migrate diff,
Drizzle) é o complemento que gate de aplicação não dá; serialização de migrations com agente
gerando várias mudanças = fila única por banco.

**Confronto (A):** QA-DB-1/2/3 + checksum + ordem + DEV recriável já cobrem aplicação; o que
falta é DRIFT DETECTION contínua (QA reprova drift no build, mas nada vigia o banco vivo entre
builds — camada A da Mitra mostra o custo: DDL avulso invisível). Fila serializada por
ambiente (C-005) já dá a serialização.

**Posição preliminar:** drift check periódico banco-vivo × migrations (job barato, alarme via
C-013) — candidato a entrar em T11 como herança do princípio "nenhum caminho fora do
release"; validação contra snapshot prod-like permanece QA-DB-3 (pg_dump sanitizado), nada
novo.

## Q9 — Repo por projeto

**Fatos (B):** Mitra: repo por projeto gerado, branch `user/{id}`, main baseline — funciona
medido. **Fatos (C):** bundle-based flow (worker sem remoto entrega bundle; hub integra) não
tem precedente idêntico no mercado mainstream — nosso desenho C-008 é mais restritivo que
todos os medidos (Devin/Codex dão credencial de push ao agente).

**Confronto (A):** repo próprio já decidido (C-000); lacunas 1–2 do Q0 (branch model + host
do remoto) são o que resta. Brain: repo/árvore do grupo, nunca dentro do repo do primeiro
projeto (C-011 §2).

**Posição preliminar:** repo git por app gerado; remoto = escolha operacional a fechar no
cruzamento (GitHub privado F1 pela infra US$0 + trilha, com hub como único portador de
credencial — coerente com C-008); artefatos compilados NUNCA no repo (registry), dist NUNCA no
repo (`deployments/`).

## Q10 — Proveniência de release

**Fatos (A):** já temos quase tudo por construção: manifesto com digests (C-010/C-011/C-012),
eval attestation imutável separada (C-010 comp.2), `scaffoldManifestDigest` calculado pelo hub
(C-012 §3), review_proof/audit via quarentena (C-008). **Fatos (C):** SLSA/in-toto/AI-BOM p/
código de agente = emergente, sem padrão consolidado — pergunta delegada à externa (Q10).

**Posição preliminar:** ligação commit↔digest↔prova já existe nas peças; T11 só nomeia o
registro (release record) que as junta; NÃO adotar framework de attestation externo sem
gatilho (anti-overengineering).

## Q11 — Anti-overengineering (solo, US$0)

**Convergência A+B+C:** não construir dia 1 — staging persistente, release train, feature
flags, blue-green, canary (já removido C-007), time-travel, PITR/WAL (C-006). Barato dia 1 e
caro de retrofitar (todas as fontes concordam): **identidade de release** (manifesto-conjunto
+ seq), **ordem/imutabilidade de migrations** (já temos), **N-1**, **config fora do build**,
**correlação release↔evento** (C-013 já pede `deployment_id` no evento).

## Tensões abertas para o cruzamento (varredura A, numeração T-1..T-12)

| # | Tensão | Rota provável |
|---|---|---|
| T-1 | "DEV+PROD por projeto" (C-005) × 1 database por projeto (C-006) | T11 enumera união fechada F1; PROD forkado datado |
| T-2 | "ambiente" normativo em 3 decisões, conjunto nunca enumerado | idem |
| T-3 | ambiente externo (Connection) existe; ambiente de aplicação não; nada impede projeto apontar p/ Connection de produção | binding projeto-ambiente×Connection-ambiente explícito |
| T-4 | ponteiro único ⇒ rollback total (Brain/conector/agente juntos); despromoção sem revalidação definida | re-point passa pelo gate de promote |
| T-5 | "rollback por tag" (CIC-2) × registry não aponta pra git | tag = rótulo sobre manifesto arquivado; re-point |
| T-6 | 2 "migrations" + 3 "ledgers" homônimos | glossário no doc de decisão |
| T-7 | 4 mecanismos de "upstream mudou, consumidor pinado" sem máquina comum | declarar que NÃO unifica (ou unifica) — decisão explícita |
| T-8 | escada C-013 assume 1 alvo de serving; PROD separado repete degraus? | emenda C-013 se PROD entrar |
| T-9 | 12 steps observáveis × proibição de smoke pós-CAS (RC-3) | steps = eventos, não smoke funcional |
| T-10 | preview durável reabre C-008 (PreviewEnvironment ADIADA) | manter preview efêmero F1 |
| T-11 | rollback como feature aciona gatilho CoW registrado (C-006) | rollback = re-point de release (código), não time-travel |
| T-12 | "falha de deploy vira tarefa do agente" × "hub fecha, nunca o agente" | agente = executor; aceite = hub; escrever |

**SPIKE aberto (única contradição de fontes não resolvida, varredura B):** promote da Mitra
cria banco NOVO no fork ou reaponta? Fontes divergem; irrelevante pro nosso desenho se PROD
forkado tiver database próprio por definição — confirmar no cruzamento.

## Vocabulário congelado que T11 reusa (não reinventar)

SYNC/WORK/SHARE · quarentena · `baseCommitSha`/`resultTreeSha` · manifesto (conjunto
completo) · `deploymentManifestDigest` · geração monotônica · CAS · ponteiro único · fila
serializada por ambiente · `compatibility: backward-compatible|maintenance-required` · drain
completo · roll-forward first · expand/contract N/N-1 · QA-DB-1/2/3 ·
`BuildValidationDatabase` · `deployments/<project>/<digest>/dist` · `frontendDistDigest` ·
`runtimeContractDigest` · `AVAILABLE`/`UPDATE_AVAILABLE` · revalidation na promoção ·
version-locking · `WORK_COMPLETED→…→SERVED_VERIFIED` · RC-1/2/3 · Run Timeline.

**Termos que reintroduzem gatilho se usados:** "DEV" pro banco do sandbox · STAGING · smoke
pós-deploy · canary · dry-run p/ chamada real · live inheritance · auto-upgrade · time-travel
· promoção automática · dashboards.

## Posições preliminares consolidadas (entrada do cruzamento)

- **P1**: histórico = commits de resultado via bundle verificado; usuário vê releases; branch
  por unidade de trabalho, merge pelo hub.
- **P2**: F1 = {preview efêmero por digest, prod}; sem staging persistente; PROD forkado
  datado; binding ambiente app×Connection explícito.
- **P3**: release = manifesto-conjunto (digests + schema version + config hash) sob ponteiro
  CAS único; tag = rótulo humano; regra de ouro: nenhum caminho de mudança fora do release.
- **P4**: sem down-migrations; expand/contract quando destrutivo; pg_dump diário + drill;
  N-1; re-point passa pelo gate de promote.
- **P5**: promote = gate humano F1, re-point nunca rebuild; 12 steps como eventos no Run
  Timeline; falha de step = tarefa do agente, aceite do hub.

**Status:** interna consolidada. Aguarda relatório da deep research externa
([prompt](pesquisa-externa-ciclo-vida-prompt.md)) para cruzamento.
