# 3E-FABLE-R0.1 — Hub-Control Data Boundaries: Corrections

**Status:** REVIEW / NÃO-AUTORITATIVO — corretivo de `3E-FABLE-R0-hub-control-data-boundaries-review.md`  
**Fase:** 3E — Data Architecture, primeira rodada (target 3E-01)  
**Revisor:** Fable, sob direção do operador (cinco pontos de revisão, 2026-08-15)  
**Base revisada:** `93c48b2d9e087dca85b345f299f99c2233367067` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, não autoriza implementação. Onde este R0.1 diverge do R0, **R0.1 prevalece**; o restante do R0 permanece como está.

---

## 1. Correção — atomicidade de audit é uma TERCEIRA classe, transversal

O R0 §6/§13 enumerou "dois sites de transação cross-owner" e simultaneamente propôs `audit_record` na mesma transação da mutação audit-required (R0 §10). As duas afirmações eram inconsistentes como escritas. Reconciliação:

```text
CLASSE 1 — transação cross-owner de DOMÍNIO (lista fechada F1)
  a. CreateProject           (L7 — 3D-03 §5.1)
  b. admissão de efeito
     + approval claim        (Gateway/PAR — 3D-02 §8–9)
  → coordena VERDADE de dois owners de domínio
  → só entra caso novo via Decision Loop

CLASSE 2 — atomicidade transversal audit-required + OBS
  qualquer mutação audit-required (de módulo ou de use case L7)
  + obs.audit_record via public emit capability do OBS
  na MESMA transação
  → NÃO coordena verdade de dois owners de domínio:
    OBS é sink/leaf (3D-04 §5.13), o registro é histórico, não estado
  → é realização física do fail-closed de 3C-13 §7
  → 3D-01 §13 já a classifica: availability/operation semantics,
    NÃO authority inversion
  → NÃO é named use case, NÃO entra na lista dos sete,
    NÃO reabre a regra A–D de admissão de 3D-01 §4
```

As classes compõem: a transação do `CreateProject` pode conter operações `prj` + `iam` + `obs` (audit da criação/grant) — continua sendo UMA ocorrência da Classe 1 com emit da Classe 2 dentro.

Fronteira preservada: **só a classe Audit Trail é transacional**. Operational Telemetry nunca entra em transação de domínio (C-013: falha de telemetria com Postgres saudável nunca altera execução; 3C-13 §7: degrada sem bloquear).

---

## 2. Correção — DB roles: R0 congelou demais

R0 §3 congelou "um role de aplicação F1". Isso invade 3I, que o handoff explicitamente difere. Substituição:

```text
CONGELADO POR ESTE REVIEW (data architecture)
  role-per-module NÃO é mecanismo de ownership de módulo:
  morre contra as transações cross-owner sancionadas (Classe 1 do §1),
  que exigem operações de dois owners na mesma conexão/sessão.
  O enforcement de "no cross-module table access" é estático/estrutural
  (3D-01 §17), não privilégio de banco.

NÃO CONGELADO — decisão posterior (3I / operações)
  quantidade e forma dos roles do hub_control:
  runtime role(s), migrator role, maintenance/backup role,
  read-only diagnostic role, ou qualquer partição que 3I justifique.
```

O desenho de schemas por módulo (R0 §3) permanece compatível com qualquer resultado de 3I — fronteira nomeada permite `GRANT` por schema depois, sem rename. As roles mecânicas C-006 dos databases de projeto seguem intocadas.

---

## 3. Re-falsificação — storage Mastra: `1 database + schemas` × `2 databases`

### 3.1 Método e fontes

Ordem do operador: não usar memória do modelo para afirmar limitações do Mastra. Verificação executada via **Context7** (`/mastra-ai/mastra`, source reputation High), docs + source atual. A skill de Mastra citada na direção **não existe neste ambiente** — `ListSkills`/`SearchSkills` retornaram vazio para "mastra"; registro honesto, Context7 cobriu a verificação.

### 3.2 Fatos verificados (2026-08-15)

```text
F1. PostgresStore suporta schemaName como opção de primeira classe
    (default 'public'; v1 renomeou `schema` → `schemaName`;
    índices custom prefixados pelo schema; setupSchema() na init)

F2. Composite storage por DOMÍNIO existe: MastraCompositeStore roteia
    memory / workflows / scores / observability / agents / datasets /
    experiments para adapters/stores distintos, com default store

F3. Regime de DDL do adapter PG:
    - init() coalesce só IN-PROCESS (#initPromise); SEM advisory lock
      cross-process, SEM migrations table, SEM estado de migração gravado
    - DDL idempotente (CREATE TABLE IF NOT EXISTS / ALTER TABLE ADD
      COLUMN IF NOT EXISTS) porém NÃO-transacional e sem rollback
    - disableInit / MASTRA_DISABLE_STORAGE_INIT desliga DDL automático
      (migrations gerenciadas externamente)

F4. CREATE EXTENSION (PgVector, se algum dia usado) é database-scoped
```

### 3.3 O que muda no argumento do R0

**Premissa do R0 §8 morta:** "o isolamento dependeria da configuração de schema do adapter do vendor — superfície que não controlamos" está **desatualizada**. `schemaName` é documentado e estável (F1); `1 database mastra + schemas mastra_bld/mastra_par` é tecnicamente viável hoje. O R0 fica corrigido neste ponto.

**F2 não decide a questão:** composite storage separa **domínios dentro de uma instância**, não **consumidores entre si**. Builder e PAR são dois consumidores com realização de instância decidida em 3H (3D-01 §14). F2 é relevante para 3H (ex.: rotear domínio observability do substrate), não para a fronteira física de 3E.

### 3.4 Comparação re-executada — pelos eixos que o operador exigiu

```text
eixo             1 DB + 2 schemas                2 databases
───────────────  ──────────────────────────────  ─────────────────────────────
lifecycle/DDL    DDL vendor não-transacional     mesmo regime, mas blast
                 sem lock cross-process (F3)     radius confinado por database;
                 confinado por schema SE         colisão em 'public' é
                 schemaName sempre setado;       estruturalmente impossível
                 default 'public' compartilhado  entre databases
                 = classe de colisão real
                 (config, não estrutura)

durability/      pg_dump é POR DATABASE          assimetria mapeia 1:1:
backup           (C-006); assimetria             dump de mastra_par inteiro,
                 mastra_par(backup) ×            mastra_builder fora;
                 mastra_builder(sacrificável)    C-015 enumera DATABASES —
                 exigiria --schema filtering     extensão natural do
                 no procedimento C-015           procedimento mecanizado
                 (novo modo de falha no backup)

restore          restore seletivo por schema     restore de mastra_par não
                 dentro de DB compartilhado =    toca mastra_builder por
                 cirurgia com pg_restore -n      construção

replaceability   DROP SCHEMA ... CASCADE         DROP DATABASE mastra_builder
(3A-R5)          funciona, mas não remove        remove tudo do consumidor,
                 vazamento acidental em          inclusive vazamento em
                 'public' nem extensões          'public' e extensões (F4)
                 compartilhadas (F4)

custo            1 connection string a menos     ~zero no cluster local;
                 no inventário                   2 entradas no inventário
                                                 (F3E01-R3 já cobre)
```

### 3.5 Veredito re-falsificado

**2 databases (`mastra_builder`, `mastra_par`) continuam vencendo** — agora pelas razões corretas:

1. **backup/restore**: a fronteira de durabilidade exigida (par durável × builder sacrificável) coincide com a unidade nativa de `pg_dump`/C-015 (database), não com um filtro de schema adicional no procedimento mecanizado;
2. **lifecycle**: o regime de DDL vendor (F3 — não-transacional, sem lock cross-process, sem ledger) fica confinado por fronteira física, e a classe de misconfiguração "dois consumidores no default `public`" deixa de existir;
3. **replaceability**: removal condition de 3A-R5 vira `DROP DATABASE`, completo por construção;
4. **custo**: marginal ~zero localmente.

E explicitamente **não** pela premissa morta "vendor não suporta schemas" — suporta (F1).

Registrado como opção futura, sem adoção (YAGNI): `disableInit` (F3) permite DDL do substrate gerenciado/revisado externamente se 3I/ops um dia exigir — não adotar dia 1; criaria machinery de migration para tabelas vendor sem failure class atual.

---

## 4. Correção — `TxScope` é opaque e non-query-capable

R0 §6 disse "handle opaco de transação/conexão". A metade "conexão" era perigosa. Substituição normativa:

```text
TxScope
├── É:  token opaco de identidade/lifecycle de transação
│       (participação, commit/rollback pela boundary que abriu)
├── NÃO É:  pg.Client, pg.PoolClient, raw connection, query builder,
│           ou qualquer shared DB client que aceite SQL arbitrário
└── NÃO EXPÕE:  API de query. Nenhum código com TxScope na mão
                consegue expressar SQL por meio dele.
```

Realização (propriedade congelada, mecanismo livre): a execução de SQL acontece **exclusivamente dentro da camada de persistência do módulo owner**, que resolve `TxScope → execução vinculada` através de binding privado do módulo fornecido no composition root. Um módulo que recebe `TxScope` ganha exatamente uma capacidade: *executar as próprias operações dentro daquela transação*. Cross-schema SQL não é expressável pela interface.

Consequência para as duas classes do §1: **shared transaction nunca vira shared table access** — a atomicidade viaja pelo token; a capacidade de query nunca viaja.

---

## 5. Correção — FKs cross-module: política agora, lista exata em 3E-02

A política de três tiers do R0 §4 permanece (FK cross-module só em identidade estrutural estável, PK, `RESTRICT`/`NO ACTION`, nunca `CASCADE`/`SET NULL`, nunca sobre digest, nunca de/para `obs.*`/`mastra_*`).

Correções:

1. Os cinco exemplos do R0 §4 tier-2 são **candidatos ilustrativos**, não lista aprovada.
2. A **lista fechada e exata de FKs tier-2 é entregável de 3E-02** (junto do inventário de registros duráveis por módulo).
3. Regra de mudança: **implementação não adiciona FK cross-module por conveniência.** Toda FK tier-2 nova, após 3E-02, entra por emenda da lista fechada via Decision Loop — nunca por migration avulsa.

---

## 6. Efeito líquido sobre a síntese do R0 §13

Substituições pontuais (o restante do R0 §13 permanece):

```text
ONDE O R0 DIZIA                          PASSA A VALER
──────────────────────────────────────   ────────────────────────────────────
"transação cross-owner APENAS em         Classe 1 (CreateProject; admissão+
 CreateProject e admissão+claim"          claim) + Classe 2 transversal
                                          audit-required+OBS (§1)

"UM role de aplicação F1"                congelado só: role-per-module não é
                                          mecanismo de ownership; partição de
                                          roles do hub_control → 3I (§2)

Mastra §8 "superfície que não            premissa corrigida por F1–F4; 2 DBs
 controlamos"                             vencem por backup/lifecycle/
                                          replaceability/custo (§3)

TxScope "handle de transação/conexão"    opaque, non-query-capable (§4)

FKs tier-2 com exemplos como se lista    política congelada; lista fechada
                                          exata → 3E-02 (§5)
```

Findings F3E01-R1/R2/R3 do R0 §12 permanecem válidos e roteados como estavam.

---

*Fim de 3E-FABLE-R0.1. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
