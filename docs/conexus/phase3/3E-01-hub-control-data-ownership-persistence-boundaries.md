# 3E-01 — Hub Control Data Ownership & Persistence Boundaries

**Status:** APROVADO pelo operador em 2026-08-15  
**Fase:** 3E — Data Architecture  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 materializa o estado autoritativo do Hub em um único database PostgreSQL `hub_control`, com **um schema por módulo owner**, uma única lineage ordenada de migrations do Hub, referências cross-module restritas e explicitamente governadas, atomicidade cross-owner apenas nas classes já justificadas, `TxScope` opaco e sem capacidade de query, Observability como histórico/evidência e nunca segunda verdade, e storage Mastra fisicamente separado em `mastra_builder` e `mastra_par`; Project Data de C-006 permanece inalterado.

---

## 1. Autoridade e inputs

Esta decisão reconcilia:

- C-000..C-017;
- C-006 — Project Data / PostgreSQL topology;
- 3B CLOSED;
- 3C CLOSED + 3C-R1;
- 3D CLOSED + 3D-R1;
- 3A-R5;
- `3E-FABLE-R0-hub-control-data-boundaries-review.md` como review não-autoritativo;
- `3E-FABLE-R0.1-hub-control-data-boundaries-corrections.md` como correção não-autoritativa da R0.

A R0.1 prevalece onde corrige a R0.

A verificação de premissas atuais do Mastra foi refeita contra documentação atual via Context7 (`/mastra-ai/mastra`). Isso confirmou que `PostgresStore` suporta `schemaName`, `disableInit` existe e `MastraCompositeStore` suporta storage por domínio; portanto a escolha de dois databases Mastra **não** depende de uma falsa limitação de schema support.

---

## 2. Topologia física F1

C-006 continua autoridade para Project Data. 3E-01 ratifica o inventário do cluster como:

```text
PostgreSQL cluster (major pinado conforme C-006)
├── hub_control
│   ├── iam
│   ├── ws
│   ├── prj
│   ├── bld
│   ├── reg
│   ├── con
│   ├── gw
│   ├── brn
│   ├── par
│   ├── rel
│   ├── mar
│   ├── obs
│   └── att
├── mastra_builder
├── mastra_par
├── {project databases}       ← C-006
└── validation databases      ← efêmeros conforme C-006/3B-16
```

Regras:

- `hub_control` é authority de controle da plataforma;
- cada schema possui exatamente um module owner de 3C;
- **não existe schema `shared` ou `common`**;
- `Rigor` não recebe schema porque é primitive pura e stateless;
- schemas são fronteira de ownership/review, não microservices nem fronteira de deploy;
- Project Data permanece database-per-Project conforme C-006 e não é redesenhado em 3E-01.

---

## 3. Migrations do `hub_control`

F1 usa **uma única lineage ordenada de migrations do `hub_control`**.

Cada migration deve declarar seu módulo owner e o DDL deve ser compatível com o schema do owner. A verificação mecânica deve conseguir detectar referências cross-schema fora das exceções explicitamente aprovadas.

Regras:

```text
uma lineage do hub_control
DDL transacional como baseline
owner explícito por migration
schema qualification explícita
sem migration stream independente por módulo
sem schema como fronteira de deploy
```

O `hub_control` deverá ter prova mínima de rebuild `0..N` em database temporário no CI da plataforma. A realização concreta pertence à implementação/verification, sem criar um framework novo de migrations.

---

## 4. Cross-module references — política de três tiers

### Tier 1 — intra-módulo

FKs normais dentro do schema do próprio owner.

### Tier 2 — identidade estrutural estável

Uma FK cross-module **pode** existir apenas quando a relação representa identidade estrutural estável e todas as condições abaixo valem:

```text
alvo = PK pública/estável do owner
ON DELETE = RESTRICT / NO ACTION
nunca CASCADE
nunca SET NULL
constraint não concede authority de domínio
constraint não autoriza leitura/escrita cross-schema pelo módulo consumidor
```

**3E-01 aprova apenas a política.** A lista exata e fechada de FKs Tier 2 será decidida em 3E-02. Os exemplos dos reviews são ilustrativos, não authority.

Após 3E-02, implementação não pode adicionar FK cross-module por conveniência; qualquer nova FK retorna ao Decision Loop.

### Tier 3 — opaque ref / digest

É o default para o restante:

```text
correlation IDs
runtime refs
Change/ActorRun/AgentRun/Promotion refs entre ledgers
content-addressed digests
approval ↔ effect-attempt refs
observability references
```

Não criar FK:

- sobre digest/content-addressed identity;
- de/para `obs.*` e schemas de domínio;
- de/para `mastra_*`;
- entre ledgers de owners distintos apenas para “garantir” uma relação já protegida atomicamente.

---

## 5. Pin histórico vs espelho de estado

Regra normativa:

> **É permitido e obrigatório pinar em um registro histórico a revisão/digest exata usada naquele fato; é proibido manter em um módulo um espelho mutável do current-state owned por outro módulo.**

Teste:

```text
se a coluna precisaria de UPDATE apenas porque o estado atual de outro owner mudou
→ é espelho de estado
→ proibido

se registra o que foi usado/admitido/composto naquela ocorrência histórica
→ pin histórico
→ permitido
```

Exemplos de pins legítimos:

- ReleaseManifest digest;
- ArtifactRevision / BrainPack / contract revision digest;
- exact ConnectionRevision usada por uma attempt;
- composition/binding refs usados numa execução;
- frontend dist digest.

---

## 6. Atomicidade cross-owner

### Classe 1 — domínio, lista fechada F1

Existem atualmente dois casos de atomicidade cross-owner de domínio:

```text
1. CreateProject
   Project-owned create
   + I&A-owned initial grant

2. material effect admission
   Gateway-owned admission/ledger state
   + PAR-owned approval single-claim
```

Novo caso de atomicidade cross-owner de domínio exige Decision Loop.

### Classe 2 — transversal audit-required

Uma mutação classificada como `audit-required` deve gravar o `obs.audit_record` obrigatório na mesma transação local quando essa é a forma necessária para cumprir o fail-closed de 3C-13.

Isso:

- não move a verdade do domínio para OBS;
- não cria novo named use case;
- não é segunda domain authority;
- não transforma telemetry em requisito transacional.

Operational Telemetry permanece degradável e fora da transação de domínio.

---

## 7. `TxScope`

3E-01 congela uma propriedade, não uma implementação concreta.

```text
TxScope
→ token opaco de participação/lifecycle transacional
→ pode permitir que operações públicas de owners diferentes participem da mesma transaction
→ NÃO expõe query()
→ NÃO é pg.Client / PoolClient / raw connection / query builder
→ NÃO concede capacidade de SQL arbitrário
```

Cada módulo executa SQL somente pela sua própria camada de persistência privada.

Consequência normativa:

```text
shared transaction
!=
shared table access
```

Não criar generic repository framework, UnitOfWork framework ou DB client universal no shared kernel.

---

## 8. Gateway — mínimo durável congelado em 3E-01

3E-01 congela existência/ownership das classes mínimas de records, **não colunas finais nem FSM completa**.

Gateway possui pelo menos records equivalentes a:

```text
gw.effect_attempt
→ identidade durável da tentativa admitida
→ exact pins usados na admission
→ approval ref quando aplicável
→ traffic/outcome linkage necessário para persist-before-effect

gw.idempotency_claim
→ claim durável e UNIQUE no escopo correto
→ vinculado à attempt

gw.budget_counter / reservation state
→ somente nas classes que exigem enforcement durável
```

A forma final de states, errors, receipt envelope, retry/reconciliation e `OUTCOME_UNKNOWN` pertence a 3F/3G/3M.

Reads comuns não ganham ledger durável de efeito por padrão.

---

## 9. Approval claim + Gateway admission

Para efeito material que exige approval:

```text
BEGIN
  Gateway → reserva/claim de budget/idempotency próprios
  PAR     → claim single-use da ApprovalRequest via capability estreita
  Gateway → persiste effect_attempt com traffic_state inicial
COMMIT

fora da transaction
→ efeito físico

nova transaction
→ receipt / traffic state / outcome
```

Ownership permanece:

- Gateway escreve somente `gw.*`;
- PAR escreve somente `par.*`;
- Gateway invoca a narrow approval-claim capability; não emite SQL em `par.*`;
- nenhuma transação fica aberta através de I/O externo.

A relação approval↔attempt pode usar IDs opacos sem FK bidirecional; a consistência material nasce do claim atômico.

---

## 10. Mastra substrate storage

Builder e Production Agent Runtime usam Mastra como substrate, mas não compartilham mutable storage.

3E-01 aprova:

```text
mastra_builder
→ database dedicado ao coding/runtime substrate do Builder
→ estado cognitivo/runtime substituível
→ perda tolerável dentro dos limites definidos por 3A-R5

mastra_par
→ database dedicado ao substrate do Production Agent Runtime
→ conversation/memory/workflow checkpoint mechanics
→ possui requisitos de durabilidade/backup superiores ao Builder
```

Razões para dois databases mesmo com `schemaName` disponível no Mastra atual:

1. unidade de backup/restore coincide com a diferença de durabilidade;
2. DDL vendor-managed fica fisicamente confinado;
3. lifecycle/removal de Builder e PAR permanece independente;
4. evita coupling mutável ou colisão acidental via default `public`;
5. custo marginal é baixo no cluster F1.

Nenhum módulo Conexus consulta tabelas `mastra_*` diretamente.

Correlação ocorre por runtime IDs opacos gravados nos records Conexus apropriados. Não existem FKs para tabelas Mastra.

`mastra_par` deverá entrar no procedimento de backup/restore; o procedimento operacional concreto pertence a 3J. `mastra_builder` não é automaticamente elevado ao mesmo tier de durabilidade.

`disableInit`/migrations externas do Mastra ficam DEFER; não nasce machinery de migration vendor dia 1 sem failure class.

---

## 11. MAR serving route mapping

O mapping route→Project é estado owned por MAR e vive fisicamente em `mar`.

Forma semântica mínima:

```text
mar.serving_route
→ route identity/key
→ Project identity
→ environment/surface necessária
→ route operational state quando definido em 3G
```

A forma física de host/path/DNS pertence a 3J.

`mar.serving_route` **não armazena espelho da Release ativa**.

Request-time:

```text
route
→ Project/environment
→ Release public projection resolve active pointer/generation
→ frontend bytes pelo digest no CAS
```

Comportamento quando Project está arquivado permanece F3D04-R2 para 3G/3I.

---

## 12. Observability & Audit persistence

`obs` mantém duas classes físicas semanticamente diferentes:

```text
Audit Trail
→ durable/append-oriented history
→ fail-closed quando a operação é audit-required

Operational Telemetry
→ operational observations
→ insert-oriented / retention-governed
→ pode degradar sem bloquear trabalho comum
```

3E-01 não fecha nomes finais de colunas, particionamento ou índices.

Regras de authority:

- `obs.*` nunca substitui current-state do owner;
- módulo de domínio não lê `obs.*` para decidir autorização/current state;
- OBS não possui FK para schemas de domínio e vice-versa;
- lineage/projections derivadas em OBS são reconstruíveis e não-authoritative;
- telemetry comum não entra na transaction de domínio.

---

## 13. DB roles e security boundary

3E-01 **não decide a topologia final de roles do `hub_control`**.

Congelado:

```text
role-per-module NÃO é o mecanismo F1 de data ownership
```

Porque module ownership deve ser garantido estruturalmente no código/migrations e as transações cross-owner sancionadas precisam poder compartilhar uma mesma transaction boundary.

Ficam para 3I/ops, conforme threat model:

```text
runtime role(s)
migrator role
maintenance/backup role
read-only diagnostic role
schema grants adicionais
RLS quando houver failure class
```

Roles de Project Data definidas por C-006 permanecem inalteradas.

---

## 14. Project Data continua C-006

3E-01 não reabre:

- PostgreSQL como engine;
- database-per-Project;
- roles de query/action/migrator/owner;
- QA database gates;
- backup baseline;
- migration baseline;
- ETL cursor/staging/upsert baseline;
- schema template de Project Data.

`hub_control`, `mastra_builder` e `mastra_par` não transformam Project Data em shared database.

---

## 15. YAGNI / rejeições explícitas

Não criar em decorrência de 3E-01:

```text
database por módulo do Hub
role de DB por módulo
schema shared/common
generic repository framework
UnitOfWork framework
generic transaction bus
event sourcing
CQRS
outbox/inbox
saga framework
data mesh
RLS por default
GIN/partitioning/warehouse de events dia 1
observability database separado sem métrica/failure class
soft-delete framework universal
audit table por domain table
ORM escolhido em 3E
Mastra migration framework externo dia 1
shared JobQueue/Scheduler storage abstraction
```

---

## 16. Findings roteados

| Finding / requisito derivado | Owner |
|---|---|
| F3E01-R1 — `mastra_par` deve entrar em backup/restore | 3J |
| F3E01-R2 — `hub_control` precisa de rebuild 0..N no CI | 3E / implementation verification |
| F3E01-R3 — extensão do inventário do cluster com `mastra_builder` + `mastra_par` | **RESOLVIDO por esta decisão** |
| F3D04-R1 — route mapping físico | 3E-01 ownership fechado; host/path/topology 3J |
| F3D04-R2 — archived Project + active Release | 3G/3I |

Nenhum Finding material exige reabrir C-006, 3C ou 3D.

---

## 17. Próximo gate

Próximo gate:

```text
3E-02 — Module Durable Record Inventory & Reference Closure
```

3E-02 deve fechar:

- inventário mínimo de records duráveis por módulo;
- owner de cada record;
- identidade/chaves conceituais necessárias;
- opaque ID vs digest vs generation/CAS;
- lista **exata e fechada** de FKs cross-module Tier 2;
- referências/projeções necessárias sem current-state mirroring;
- records que explicitamente não devem existir ainda.

3E-02 não deve desenhar colunas finais/DTOs (3F) nem FSMs completas (3G).
