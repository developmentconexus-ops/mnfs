# Prompt de pesquisa externa — camada de dados (tópico 6)

> Copie tudo abaixo da linha e cole no ChatGPT (modo deep research), em chat novo.

---

Estamos projetando a camada de dados de uma plataforma que constrói e opera aplicativos de
negócio sobre ERPs usando agentes de IA. Pesquise com fontes primárias (docs oficiais,
benchmarks reproduzíveis), cite URL + data de acesso em cada resposta, marque claramente o que é
fato verificado vs inferência sua, e diga "não documentado publicamente" quando for o caso. Se
alguma direção nossa parecer errada, critique com evidência — preferimos correção a confirmação.

## Contexto (decisões já tomadas — são premissas, não estão em debate)

- Hub orquestrador Node/TS + Postgres + pg-boss rodando no PC do operador (WSL2) na fase 1;
  migração futura para nuvem (Fly.io região GRU) por gatilho. Operador solo, custo alvo ~US$ 0
  na fase 1, zero-ops como valor.
- Agentes de IA constroem os apps em sandbox. TODO acesso a banco passa por um "Capability
  Gateway" no hub — credencial de banco nunca entra no sandbox. Roles de banco por tipo de
  artefato: query → role read-only real; action → DML-only (sem DDL/GRANT); migration → role
  própria.
- Registro de artefatos já decidido: migrations são arquivos timestamp imutáveis (checksum
  divergente rejeita) com tabela de histórico; banco de DEV precisa ser 100% recriável só das
  migrations; deployment atômico = compila bundle → roda migrations → troca ponteiro; rollback
  de ponteiro só quando não há migration, senão roll-forward.
- Cada projeto (app) tem seu próprio banco isolado, separado do banco do hub.
- Perfil de carga: apps de negócio sobre ERP (Sankhya, acesso via API REST). ETL incremental
  importa orçamentos/clientes/produtos para a base do projeto (dezenas de milhares de linhas,
  upsert em chunk com cursor). Dashboards analíticos (agregações). Dezenas de usuários
  simultâneos no máximo. Single-tenant na fase 1; SaaS multi-tenant na fase 2 (re-decisão com
  gatilho próprio).
- Plataforma de referência que dissecamos ("Mitra") faz: MySQL em container Docker por projeto;
  SEM ambiente de teste (o banco de dev É o de produção, smoke test roda contra dados reais);
  migrations como log de auditoria pós-fato, não gate. Os dois últimos são defeitos que já
  rejeitamos.

## As 8 perguntas

1. **Engine**: Postgres × MySQL × outra para esse perfil. Pesos que importam para nós: DDL
   transacional (nosso deployment atômico depende disso), granularidade de roles/GRANT,
   ecossistema de migrations, JSON, capacidade analítica, taxa de erro de agentes LLM gerando
   SQL para cada dialeto (se houver dado público), footprint local em WSL2. Recomende um com
   evidência.
2. **Isolamento por projeto**: database por projeto na mesma instância Postgres × schema por
   projeto × container por projeto (padrão Mitra) × serviço com branching (Neon etc.).
   Compare: custo operacional para operador solo, blast radius, backup por projeto, limites
   práticos (quantos databases/schemas uma instância aguenta), e como plataformas comparáveis
   resolvem (Supabase, Neon, PlanetScale, Nhost).
3. **Base efêmera para QA**: mecanismos 2026 para (a) subir banco descartável, rodar migrations
   do zero + fixtures e fazer asserção de valor (`pendentes == 187`, não "query rodou");
   (b) dry-run de migration contra cópia realista ANTES de produção. Candidatos que conhecemos:
   `CREATE DATABASE ... TEMPLATE`, testcontainers, Neon branching, Database Lab Engine (thin
   clone), pg_dump/restore. Compare tempo de provisionamento e o que roda 100% local.
4. **Fixtures e dado realista em DEV**: fixtures sintéticas × subset anonimizado de produção ×
   cópia integral. Ferramentas de subset/anonimização (postgresql_anonymizer, Snaplet/greenmask
   etc., estado 2026). O que é proporcional para operador solo e o que é overkill.
5. **Rollback código+dados**: Replit App History faz checkpoint de código (commit git) + dados
   (branch copy-on-write do Neon) juntos. Existe equivalente viável 100% local/self-host?
   Alternativas: PITR com WAL-G/pgBackRest, snapshot de filesystem (ZFS/btrfs) — funciona em
   WSL2? O que dá o melhor "voltar no tempo por projeto" com custo ~zero e zero-ops?
6. **Backup fase 1 local**: mínimo profissional para bancos de projeto no PC do operador
   (pg_dump agendado × WAL archiving contínuo; destino; retenção; teste de restore) e o que
   muda ao migrar para Fly.io (volumes, snapshots, Postgres gerenciado do Fly ou não).
7. **Sincronização ERP → projeto**: staging table + upsert em chunk + cursor incremental é o
   padrão da referência (provado). Existe padrão superior documentado para nosso volume
   (dezenas de milhares de linhas/dia) — CDC, ferramentas tipo Airbyte/dlt, materialized
   views — ou isso é overkill e o padrão simples é o correto?
8. **Não-negociáveis do template de projeto**: checklist do que fixar no dia 1 para agente de IA
   não errar: encoding/collation (UTF-8), timezone (armazenar UTC?), tipos para dinheiro
   (NUMERIC × float), naming convention, PKs (identity × UUID), índices default. Cite guias de
   estilo públicos que valem adotar.

## Formato de saída

Respostas numeradas 1–8, cada uma com fonte primária + URL + data de acesso. No fim, síntese:
recomendação única por pergunta, ranking onde houver alternativas, e uma lista "onde a direção
de vocês parece errada" (vazia só se nada parecer errado).
