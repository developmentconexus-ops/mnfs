# 3B-16 — Project-Internal Resource Ownership

**Status:** APROVADO pelo operador  
**Fase:** 3B — System Context & Boundaries  
**Importante:** esta decisão não constitui C-018 nem autoriza implementação.

## Decisão em uma frase

Todo recurso interno durável pertence logicamente a um Project ou a uma sub-raiz inequivocamente pertencente a ele. Git, Hub/Postgres, Project Database e Registry/CAS/serving possuem responsabilidades distintas e não são fontes de verdade concorrentes. DEV e PROD são ambientes persistentes quando existentes; bancos de validação são temporários e criados apenas quando uma prova realmente exige estado limpo, migrations, fixtures ou rehearsal.

## Regra anti-overengineering

As distinções de ownership, authoring, operação, armazenamento e serving são perguntas de arquitetura, não um framework a ser implementado. Não haverá `GenericOwnedResource`, `OwnershipAuthority`, engine genérico de ownership ou campos universais de authority em todas as tabelas.

Cada domínio deve usar a solução concreta mínima que satisfaça suas invariantes.

## Quatro responsabilidades

```text
Git
→ conteúdo autorado e versionado

Hub/Postgres
→ estado operacional, approvals, lifecycle e authority

Project Database
→ dados de negócio do aplicativo por environment

Registry/CAS + active environment pointer
→ outputs imutáveis e versão efetivamente servida
```

Nem todo recurso passa pelos quatro substratos.

### Git

O source repository canônico do Project contém source, migrations, artifact/agent definitions, Project Baseline, bindings/config contracts, tests e planning memory. O último commit não significa automaticamente Baseline aprovado, Release ativa ou estado servido.

### Hub/Postgres

Governa relationships, approved baseline digest, Changes e contract revisions, Builder state, ActorRuns, Findings, runtime sessions, Release/Promotion records, active pointers, attachment authority e operational events. Não substitui Git como authoring nem vira business database.

### Project Database

Guarda dados e estado de negócio do app. Não governa Accounts, memberships, grants, Changes, ActorRuns, Releases, credentials ou registry.

```text
hub_control != Project business database
```

### Registry/CAS e serving

Artifact revisions, agent revisions, frontend dist e ReleaseManifests são outputs imutáveis. Registry não é authoring. O active pointer do target environment determina o que está servido.

## Ambientes — modelo simplificado

```text
Project
├── DEV   — persistente
├── PROD  — persistente quando houver primeiro promote
└── validation DB(s) — temporários, apenas quando necessários
```

Não existe um ambiente TEST permanente obrigatório por Project.

### DEV

É o ambiente contínuo de desenvolvimento. Serve para iteração rápida e pode acumular estado de desenvolvimento; por isso não é prova suficiente de rebuild ou ausência de drift.

### PROD

É environment do mesmo Project, com database e bindings próprios quando o primeiro promote real ocorrer. Não é um segundo Project.

### Validation Database

É test fixture efêmero, não terceiro ambiente permanente. Quando necessário:

```text
candidate exige prova de banco
→ cria DB temporário
→ aplica migrations
→ carrega fixtures quando aplicável
→ roda assertions/privilégios
→ destrói DB
```

Não há um database por gate e não se cria temp DB para todo Change.

### Aplicabilidade proporcional

- mudança apenas de frontend: normalmente sem validation DB;
- regra sem persistência: normalmente sem validation DB;
- query/action dependente de banco: DEV para iteração, DB limpo quando a prova decisória depender de schema/fixtures/privilégios;
- nova migration: DB limpo prova rebuild 0..N, constraints, roles e fixtures;
- migration que transforma dados existentes: rehearsal adicional em snapshot sanitizado somente quando necessário.

## Por que DEV sozinho não basta

DEV pode conter DDL manual, dados deixados por testes, permissões amplas ou drift. Exemplo: uma coluna criada manualmente faz o app passar em DEV, mas se a migration correspondente foi esquecida, uma instalação limpa ou PROD quebra. Rebuild em database limpo prova reprodutibilidade.

## RunPreview

RunPreview é um candidate servido para revisão, não ambiente persistente. Pode usar fixtures, mocks controlados, DEV quando seguro ou um validation DB já preparado. Não é obrigatório criar DB próprio por Preview.

Invariante: Preview nunca usa silenciosamente PROD, credentials ou audience de produção.

## Isolamento entre Projects

```text
Project A database
-X-> Project B database
```

Nenhum Project consulta diretamente database, mutable tables, conversations, attachments ou runtime state interno de outro. Reuso legítimo entre Projects será tratado por contratos explícitos em 3B-17.

## Artifacts, agents e releases

```text
Artifact Source   → Git do Project
Artifact Revision → registry imutável Project-scoped
Artifact Execution→ Project + Environment + Release

AgentDefinition   → Git do Project
AgentRevision     → registry imutável Project-scoped
Agent runtime      → Conversations/AgentRuns do Project

ReleaseManifest   → composição imutável do Project
Active pointer    → authority do que está servido no environment
```

Slug/revision não é autoridade global fora do contexto do Project.

## Dados externos e provenance

Sincronizar dado de ERP não muda automaticamente sua autoridade empresarial. Uma row do Sankhya continua tendo o Sankhya como fonte empresarial quando assim definido; a row local é uma projeção derivada e deve preservar provenance suficiente (`source_system`, `source_entity`, `source_id`, timestamps de origem/sync quando aplicável).

## Findings e Evidence

Finding é Project-scoped e pode sobreviver ao ActorRun que o originou. Worker/Validator/Runtime pode originar um Finding, mas não o possui nem o fecha unilateralmente.

Evidence é composição de refs/digests sobre fatos verificáveis (Hub/Gateway events, result digests, test reports, served proof, receipts, manual decisions). Texto de agent por si só não vira Evidence de aceite.

## Attachments e CAS

Attachment pertence logicamente ao Project. Blob bytes podem ser deduplicados num CAS global sem conceder acesso cross-Project.

```text
same bytes != same authority
```

Digest não é credencial; acesso passa pela identidade autorizada do attachment.

## Archive antes de purge

Neste nível, a única invariante é:

```text
ACTIVE
→ ARCHIVED/DISABLED
→ dependency + retention analysis
→ controlled purge por classe quando permitido
```

Nunca `DELETE project CASCADE everything`. Arquivar Project não apaga Brain/Connections do Workspace, Accounts, Areas ou Platform resources.

## Invariantes aprovadas

1. Recurso interno durável tem Project scope explícito ou derivável inequivocamente.
2. Não existe ownership engine genérico.
3. Git contém authoring; Hub contém estado operacional.
4. Project DB guarda business data, não Control Plane authority.
5. Registry/CAS contém outputs imutáveis, não authoring mutável.
6. Active environment pointer determina serving.
7. DEV/PROD são persistentes quando existentes.
8. Validation DB é condicional e efêmero; não existe TEST permanente obrigatório.
9. Não existe DB-per-gate nem temp DB para todo Change.
10. Preview é candidate serving e não requer DB próprio por default.
11. Preview não usa produção silenciosamente.
12. Dados externos preservam provenance e authority declarada.
13. Cross-Project mutable storage access é proibido.
14. Artifacts e agents são Project-scoped.
15. Finding sobrevive ao produtor quando necessário.
16. Evidence é composta, não autodeclarada.
17. Physical sharing em hub_control/registry/CAS não cria autoridade global.
18. Archive precede purge.

## Não construir no F1

- Generic ProjectResource / GenericOwnedResource;
- OwnershipAuthority framework;
- ambiente TEST permanente por Project;
- DB separado por validation gate;
- temp DB para todo Change;
- Postgres container obrigatório por Project;
- cross-Project FK/shared mutable tables;
- event sourcing completo da plataforma;
- database separado por submódulo;
- hard-delete cascade de Project.

## Deixado para fases posteriores

Tabelas/FKs finais, schema de ProjectEnvironment, provisionamento/drop de validation DB, critérios exatos de Preview data source, archive/purge states, retention, localização física final de registry/CAS, backup/restore, fork/clone/export e quotas.

## Consequência

3C/3D/3E podem agora definir módulos, dependências e tabelas sem transformar estas distinções em machinery antecipada. O princípio permanece: **se uma distinção arquitetural não exige mecanismo próprio, ela continua sendo uma regra de design.**
