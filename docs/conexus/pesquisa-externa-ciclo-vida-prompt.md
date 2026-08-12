# Prompt — deep research externa: Ciclo de vida de apps gerados por agente (T11)

> Cole o texto abaixo numa sessão de deep research (ChatGPT). Saída esperada: relatório com
> fontes, separando fato de opinião, cobrindo as perguntas na ordem.

---

Pesquise a fundo o estado da arte (2025–2026) de **ciclo de vida de código e deploy para apps
de negócio gerados e mantidos por agentes LLM**, numa plataforma operada por uma pessoa só, e
valide/refute as posições preliminares abaixo.

**Contexto do sistema (fixo, não re-decidir):** plataforma AI-first que constrói e opera apps
de negócio sobre ERPs. Hub Node.js próprio + Postgres (verdade operacional única) + git
(verdade de artefatos publicados). Builder = agente em sandbox efêmero (E2B) que devolve
trabalho como **git bundle auditado** (quarentena → verificação → integração). Artefatos
(queries, actions, agentes, brains, scaffold de frontend) vivem num **registro versionado por
digest** com compilação e lifecycle próprios; publicar disponibiliza (`AVAILABLE`), promover é
ato separado com revalidação. Migrations de banco passam por **gate com base efêmera de
validação** antes de tocar o banco do projeto. Deploy de frontend = hub serve `dist` por
digest com **troca atômica de ponteiro CAS**; conclusão exige `SERVED_VERIFIED` (GET no
caminho real + digest servido == esperado). Fase 1: operador solo, infra ~US$0, um app
inicial (caso Sankhya). Apps são de NEGÓCIO (dados de ERP), não sites.

**Pergunta central do tópico:** git model, ambientes DEV→PROD, semântica de release e
rollback — para os APPS GERADOS (não para a plataforma em si).

**Perguntas (responda todas, com fontes):**

1. **Git model para código gerado por agente.** Como v0, Lovable, Bolt, Replit Agent e
   Claude Code (e outros que encontrar) versionam o trabalho do agente: commit por turno?
   checkpoint próprio fora do git? squash na entrega? O usuário vê git ou vê "versões"?
   Histórico linear vs branches — alguém usa branch de feature para trabalho de agente?
   Evidência de arrependimento com histórico poluído por micro-commits de agente, ou o
   contrário (perda de granularidade)?
2. **Checkpoints e restore.** O que exatamente os checkpoints/rollbacks dessas plataformas
   restauram: só código? banco junto? estado de conversa? Documentação real do que Replit
   ("rollback"), Lovable ("revert"), v0 ("restore version") fazem com o BANCO quando voltam
   uma versão do app. Casos documentados de rollback de código que deixou banco incompatível.
3. **Ambientes.** Preview efêmero vs staging persistente vs prod: o que essas plataformas
   oferecem de fato; quando um staging separado (com dados próprios) vale a pena para
   operador solo vs preview + prod direto; padrão preview-por-mudança (estilo Vercel) —
   custo/benefício quando o hub é próprio e serve por digest. Para apps de NEGÓCIO com banco:
   staging usa dados sintéticos, cópia mascarada, ou snapshot real?
4. **Release como unidade imutável.** Prática consolidada de release = conjunto fechado
   (digest de código + versão de schema + config + dependências) vs deploy de peças soltas;
   formatos de release manifest; "build once, deploy many" — o que exige (artefato imutável,
   config fora do build, migrations desacopladas). Nosso ponteiro CAS já seleciona digests de
   frontend+contrato: o que falta para isso ser um "release" completo?
5. **Rollback de código × rollback de dados.** Estado da arte: trocar ponteiro de código é
   trivial; migrations não. **Expand/contract (parallel change)** como padrão para nunca
   depender de down-migration — quem pratica, ferramentas que suportam, custo real para
   operador solo; down migrations na prática (quem escreve, quem testa, quem abandonou e por
   quê — posições de Rails/Django/Prisma/Drizzle/Flyway/Liquibase); backup/restore
   point-in-time como rollback de última instância para banco pequeno (Postgres PITR,
   custo/complexidade solo); **limites reais dos free tiers em 2026** para PITR/branching de
   Postgres (Neon history window, Supabase branching/PITR, alternativas) vs pg_dump diário a
   custo zero; janela de compatibilidade N-1 (código velho tolera schema novo)
   como requisito mínimo.
6. **Promoção.** Gates humanos vs automáticos em plataformas pequenas; "promote = re-point,
   nunca rebuild" — evidência de quem rebuilda na promoção e se arrependeu (build não
   reproduzível); o que plataformas de app-building fazem entre "o agente terminou" e "está
   em produção" (revisão humana? diff? preview de aprovação?).
7. **Config e segredos entre ambientes.** Padrões para config fora do artefato (12-factor e
   evolução); como plataformas de app gerado lidam com env vars por ambiente; classes de
   drift DEV×PROD documentadas (auth, RLS/roles de banco, feature flags) e mitigação
   mecânica — nosso caso real: árvore verde + testes verdes e runtime PROD divergindo em
   role/schema/sessão.
8. **Migrations em produção contínua.** Ordem/serialização de migrations com agente gerando
   várias mudanças; detecção de drift entre schema declarado e banco real (ferramentas:
   Atlas, Drizzle push vs migrate, Prisma migrate diff); migration aplicada em staging mas
   não em prod (ou vice-versa) — detecção mecânica; validação contra snapshot prod-like vs
   base sintética (nosso gate usa base efêmera — o que o mercado valida além disso?).
9. **Repo por projeto.** Para apps gerados: repo git por app vs monorepo da plataforma;
   relação repo × registry de artefatos × deployments quando o mesmo projeto tem frontend +
   queries/actions versionadas fora do repo; precedentes de "bundle-based flow" (worker sem
   acesso ao remoto entrega bundle; hub integra) — alguém mais faz isso?
10. **Proveniência de release para código gerado por agente.** Existe em 2026 tooling ou
    padrão emergente (SLSA para agentes, attestations in-toto, "AI BOM") que amarre prova de
    revisão/auditoria ao digest do artefato? Como projetos reais estruturam release
    manifest/record para código de agente (campos, assinatura, ligação commit↔digest↔prova)?
11. **Anti-overengineering para operador solo.** O que times de 1 pessoa NÃO deveriam
    construir no dia 1 (staging persistente? release train? feature flags? blue-green?
    canary?) com evidência; e o inverso — o que barato no dia 1 fica caro de retrofitar
    (identidade de release? ordem de migrations? N-1?). Dentro do quadro: hub próprio,
    Postgres-only, US$0.

**Formato:** para cada pergunta: fatos com fonte → inferência → recomendação para ESTE
sistema (solo, US$0, hub próprio, deploy por digest+CAS já decidido). Termine com: (a) tabela
"posição preliminar nossa × sua avaliação (confirma/refuta/refina)"; (b) top 5 riscos do
nosso desenho de ciclo de vida; (c) o que você construiria diferente. Não recomende adotar
plataforma de deploy SaaS — hub próprio servindo por digest já está decidido; critique-o se
tiver evidência forte, mas dentro do quadro solo/US$0.

**Posições preliminares nossas (valide/refute):**

- P1: histórico git do app = commits por turno do worker, integrados via bundle após
  verificação; usuário vê "versões/releases", não git cru.
- P2: sem staging persistente na F1; preview autenticado por digest + prod, com promoção
  explícita.
- P3: release = ponteiro CAS sobre conjunto de digests (frontend + contrato + artefatos +
  versão de schema); rollback de código = re-point para release anterior.
- P4: sem down-migrations; expand/contract quando mudança é destrutiva + backup/PITR como
  última instância; janela N-1 obrigatória para o par código×schema.
- P5: promoção sempre por gate explícito (humano na F1); nunca rebuild na promoção.
