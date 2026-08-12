# Prompt de pesquisa externa — Tópico 14: Segurança proporcional

> Colar este prompt inteiro numa ferramenta de deep research com acesso à web. Corte de conhecimento desejado: o mais recente possível (estamos em agosto/2026). Responder em PT-BR.

---

Sou o único operador de uma plataforma AI-first ("Conexus") que gera e opera aplicativos de negócio internos sobre o ERP Sankhya. Stack: hub Node.js + Postgres locais (single-instance), apps servidos na mesma origem do hub, rede = loopback ou tailnet WireGuard (sem TLS em F1), builds de agente em sandbox E2B, fase F1 com custo alvo ~US$0 e nenhum usuário externo. Preciso de pesquisa externa rigorosa para fechar a última decisão de segurança do planejamento.

**Contexto já decidido (NÃO re-decidir; usar como premissa):**
- Credenciais só server-side: vault do hub com AES-256-GCM, chave-mestra fora do banco; sandbox de build nunca vê credencial durável (só chave LLM efêmera com TTL e spend cap); egresso do sandbox = deny-all + allowlist.
- SQL: sintaxe única `:param` → bind real (nunca interpolação), parser pinado, `inputSchema` JSON Schema validado antes de executar, roles reais de Postgres por tipo de artefato (query read-only, action DML-only, owners NOLOGIN).
- Tenancy: 1 database Postgres por projeto + `hub_control` separado; projectId derivado server-side do serving path (payload adulterado ignorado); membership explícita checada antes de role; ausência = 404 indistinguível.
- Auth de usuário final: contas centrais, senha NIST 800-63-4 + Argon2id versionado, sessão server-side (hash) com cookie `__Host-` HttpOnly SameSite=Strict, rate limit de login, zero JWT browser-side, zero token em URL/localStorage; CSRF = SameSite + verificação de Origin/Sec-Fetch-Site.
- RBAC compilado fail-closed: action sem `allowed_roles` = erro de deployment (nunca default admin); mudança de permissão que amplia poder = "permission diff" que exige aprovação humana no gate de promote.
- CSP estrita + security headers desde o 1º deploy; anti-exfil no chat (imagem remota proibida, links allowlist); bind público sem TLS = hub recusa subir.
- Prompt injection: dados de ERP/usuário são untrusted com taint propagado; aprovação humana para efeitos; renderer anti-exfil. Arquitetura equivale aos padrões "plan-then-execute"/"code-then-execute".
- Restrição de método (ratificada): "sem SOC2 theater, sem threat model formal em F1" — tudo precisa ser proporcional a 1 operador.

**O que resta decidir (o objeto desta pesquisa)** — minhas posições preliminares P1–P6; para cada uma dê veredito CONFIRMA / REFINA / REFUTA com evidência e fonte primária datada:

- **P1 — Supply chain de apps gerados por LLM.** Gate de admissão de dependência mecânico: pnpm com lifecycle scripts de dependência desligados, `minimumReleaseAge` 7 dias, install sempre `--frozen-lockfile`, allowlist curta de pacotes que o agente pode adicionar sozinho, e pacote fora da allowlist vira "dependency diff" aprovado por humano no gate de promote. `npm audit` semanal só como higiene (sem gate). Socket/Snyk adiados.
- **P2 — Patch do próprio hub.** Renovate semanal agrupado, automerge só de patch com CI verde, major manual, quarentena de 7 dias — e CVE crítica em dependência direta fura a quarentena com verificação manual.
- **P3 — Egresso de produção.** Invariante: todo egresso de rede em produção passa pelo Gateway do hub via Connection registrada; artefato gerado não tem primitiva de rede própria (fetch direto = impossível por construção, verificado por probe). Allowlist de egresso de runtime só nasce se surgir superfície de código server-side arbitrário.
- **P4 — Credencial como estado vivo.** Credencial entra SÓ por rota de plataforma write-only (nunca chat/agente — o agente gera link para a rota), com seleção explícita de ambiente e registro do blast radius (quantas empresas o token alcança). Rotação de refresh token de uso único: lock por UPDATE condicional (`rowsAffected`), `key_version`, e renovação com desfecho desconhecido → reconciliação antes de retry.
- **P5 — Erros.** Invariante único: stack trace/detalhe interno nunca atravessa o Gateway (resposta = erro tipado + correlation ID; trace só em log estruturado server-side). Envelope de erro de integração carrega `houve_resposta: boolean` + status bruto; a UI é proibida de nomear ator externo ("o Mercado Livre recusou") quando não houve tráfego.
- **P6 — Resíduos e forma.** Compilador de queries fecha de uma vez: escape automático de LIKE (opt-out explícito), ORDER BY só por allowlist de colunas declarada, teto server-side de paginação. Rate limit de `execute()` por conta (não IP), em memória. LGPD F1: ROPA simplificado de 1 página gerado do catálogo de sync + minimização de colunas pessoais no espelho + procedimento de exclusão (dado fiscal bloqueado, não apagado). Forma do tópico: mapa de invariantes (decisão × probe × fronteira física) + checklist ~15 itens rastreado a ASVS 5.0 L1 + threat model por exceção (4 perguntas de Shostack disparadas por gatilho); o permission diff é declarado o threat model contínuo do sistema.

**Perguntas específicas (responda todas, com fontes primárias e datas):**

1. **Quarentena × CVE**: com `minimumReleaseAge` de 7 dias, qual a evidência empírica (2025–2026) sobre a janela entre patch de CVE crítica no npm e exploração em massa? Para um hub interno sem exposição pública, o atraso de 7 dias aumenta ou reduz o risco líquido? Existe recomendação oficial (pnpm, OpenSSF, CISA) sobre exceção de segurança à quarentena?
2. **Tamanho real de allowlist**: Lovable, Replit, Bolt, v0 ou similar publicaram (docs, engineering blogs, incident reports, talks 2025–2026) como tratam dependência que o agente quer adicionar — lista fixa, análise automática, aprovação humana? Qual o vocabulário típico de dependências de apps CRUD/dashboard gerados (para calibrar allowlist de ~20–50 pacotes)?
3. **Prompt injection em geração de código**: medições (benchmarks 2025–2026) da taxa de sucesso de injeção indireta quando o dado contaminado entra só como amostra delimitada no prompt de um GERADOR de código (não agente com tools) — spotlighting/delimitação reduz a quanto? Há caso documentado de código malicioso gerado por injeção via dados de negócio?
4. **Tailnet sem TLS × LGPD**: existe posição documentada (Tailscale, auditorias SOC2/ISO de clientes, ANPD, DPAs) aceitando WireGuard/tailnet como controle equivalente a TLS-in-transit para dados pessoais? Ou o gatilho de TLS deve ser antecipado quando dados pessoais de ERP trafegam na tailnet?
5. **ANPD e espelhos de ERP**: orientação/enforcement da ANPD (2024–2026) tratando réplica interna de dados de ERP (hub local, data warehouse) — o registro simplificado da Res. CD/ANPD 2/2022 basta? Minimização de colunas no espelho é reconhecida como medida? Como tratar exclusão quando o dado-fonte é fiscal?
6. **Rotação de refresh token de uso único**: padrão de implementação correto (2025–2026) para renovação concorrente-segura de refresh token rotativo (tipo Mercado Livre) em single-instance Postgres — advisory lock, UPDATE condicional, fila? Como tratar OUTCOME_UNKNOWN (timeout na troca) sem queimar o token?
7. **Rate limiting interno**: para app interno atrás de auth, qual o consenso atual sobre rate limit por conta (janelas, penalidade progressiva)? `rate-limiter-flexible` em memória é suficiente ou há razão para persistir contadores?
8. **Checklist proporcional**: existe precedente publicado (2024–2026) de "security baseline" de ~15 itens para operador solo/microempresa derivado de ASVS 5.0 L1 ou OWASP Top 10:2025 que eu deva usar como base em vez de inventar o meu?

**Formato da resposta:**
1. Conclusão executiva (≤10 linhas): o que muda nas minhas posições.
2. Vereditos P1–P6 (CONFIRMA/REFINA/REFUTA + evidência).
3. Respostas às perguntas 1–8 com fontes primárias datadas.
4. Top 5 riscos que eu estou subestimando, em ordem.
5. "O que o mercado faz melhor": práticas documentadas superiores às minhas posições.
6. "Não construa ainda": o que posso adiar com segurança e qual o gatilho para construir.
