# Pesquisa interna — Tópico 14: Segurança proporcional

**Data:** 2026-08-12 · **Método:** 3 varreduras paralelas (A = acervo C-000..C-015 + 03-requisitos; B = Mitra medida S1–S9 + OBS-01..77 + evidências MC/MetalDocs; C = mercado 2024–2026) consolidadas em sessão.
**Escopo nominal (00-TOPICOS linha 50):** credencial server-side, bind params, tenancy — o mínimo profissional. Profundidade média.

---

## Q0 — Achado central: o tópico já está ~85–90% decidido

O escopo nominal de T14 foi consumido por decisões anteriores. Mapa por eixo (citações completas na varredura A):

| Eixo | Estado | Decisões |
| --- | --- | --- |
| Credenciais (vault, custódia, guest nunca vê) | CONGELADO | C-007 comp.6–8, C-008 comp.3/11, C-006 comp.3, C-014 §9 |
| SQL / bind params (`:param`, inputSchema, roles reais, AnalyticQuery) | CONGELADO | C-005 comp.3–5, C-006 comp.3, C-009 comp.7, C-011 |
| Tenancy / fronteiras (derivação server-side, membership, trust zone, RC-1) | CONGELADO | C-015 §§1/4/9, C-006 comp.11/13, C-013 §6 |
| Sandbox / egresso de build (deny-all E2B, git mediado, sentinel scan) | CONGELADO | C-008 comp.5–6, C-005 adendo |
| Headers / CSP / anti-exfil de chat | CONGELADO | C-012 §§15–16, C-015 §§11/13, C-009 comp.16 |
| Aprovação / efeitos (effects, approvalFloor, HITL, allowed_roles fail-closed, permission diff) | CONGELADO | C-007 comp.4, C-009 comp.8–13, C-015 §§7–8 |
| Auth / sessão (NIST 800-63-4, Argon2id, cookie `__Host-`, CSRF Origin+Sec-Fetch-Site, bind fail-closed) | CONGELADO | C-015 §§1–6, C-010 §17 |
| Segredos em repo/logs (redaction por campo, sentinel scan, grep no dist) | CONGELADO | C-013 §19, C-007 comp.7/11a, C-015 §16 |

Tabela SEG do 03-requisitos: SEG-1 → C-007/C-008/C-014/C-015. SEG-2 → C-015 §1/§9. SEG-3 = F2 (permission diff C-015 §8 já antecipa). **SEG-4 = decisão-mãe do tópico**: "sem SOC2 theater, sem threat model formal; revisita na F2" — restringe o formato de qualquer C-016.

Catálogo Mitra S1–S9: **todas as 9 falhas originais já têm resposta ratificada** (S1→C-005; S2→C-006/C-008; S3→C-015 §11; S4→C-007 parcial; S5→C-008/C-010; S6→C-015 §1; S7→C-015/C-006; S8→C-015 §13; S9→C-015 §3, nomeada "anti-S9" no texto).

Falsos gaps verificados em sessão (varredura B apontou, acervo já cobre): rate limit de login — C-015 §2 ("Rate limit por conta/origem/instalação", 13-runtime-publicado.md:45); secret scan amplo — C-006 adendo ("nem qualquer segredo", 06-registro-artefatos.md:100). Também cobertos, contra a intuição: prompt injection do ERP (trustClass/taint C-009 comp.11 + anti-exfil comp.16 + golden cases), validação de `execute()` (inputSchema C-005 comp.5), CSRF (C-015 §3), supply chain do registry de UI (C-012 §9) e da camada AI SDK (C-010 adendo r3).

**O que resta de verdade** (interseção das 3 varreduras): 5 lacunas decisórias + 3 residuais Mitra + 1 entregável de consolidação. Detalhadas em Q1–Q8.

---

## Q1 — Supply chain do app gerado (lacuna nº 1, a maior)

**Fatos (acervo).** Allowlist de dependência existe só para itens do registry de UI (C-012 §9: digest, lifecycle scripts proibidos) e para a camada AI SDK (C-010 adendo r3: lockfile frozen + SBOM). "Lockfile congelado no install" (C-012 §14) congela o que entrou — **não decide o que pode entrar**. Quando o builder adiciona um pacote npm arbitrário ao app (lib de gráfico, utilitário de data), não há gate.

**Fatos (mercado, 2025–2026).** Shai-Hulud (set/2025, 500+ pacotes) e Shai-Hulud 2.0 (nov/2025, 700+ pacotes, ~14.000 segredos vazados em 487 orgs): worm npm autorreplicante; vetor dominante = **install scripts**; variantes 2026 já injetam MCP servers com prompt injection mirando assistentes de código. Slopsquatting (pacotes alucinados por LLM registrados por atacantes) é categoria ativa (Socket "SANDWORM_MODE" 2026). Resposta do ecossistema virou default: pnpm ≥10.16 tem `minimumReleaseAge` (pnpm 11 ativa por default) e **não roda lifecycle scripts de dependências** (allowlist `onlyBuiltDependencies`); Yarn 4.10 e npm 11.10 seguiram. `npm audit` só pega CVE conhecida — inútil contra pacote sequestrado no dia (janela de horas). Replit declara scanning determinístico + SBOM re-rodado ("dependency risks ficam invisíveis sem scanning tradicional"); Lovable pós-CVE-2025-48757 idem. As plataformas de referência confiam em ferramenta determinística, não no LLM.

**Confronto.** O risco nº 1 do Conexus não é CVE antiga — é o agente adicionar pacote sequestrado/alucinado no dia do build. Apps de negócio sobre ERP usam vocabulário pequeno e repetitivo de dependências → allowlist manual é viável para 1 operador. O mecanismo de aprovação fora da allowlist já existe no acervo: é o mesmo permission diff de C-015 §8.

**Posição preliminar.** Gate de admissão de dependência como propriedade mecânica: (a) pnpm no hub e nos apps gerados — scripts de dependência off por default + `minimumReleaseAge` 7 dias; (b) lockfile commitado + install sempre `--frozen-lockfile` no pipeline — agente nunca roda install solto; (c) allowlist curta de pacotes que o builder pode adicionar sem aprovação; pacote fora dela = **dependency diff no gate de promote** (extensão natural do permission diff C-015); (d) `pnpm audit` semanal como higiene, sem gate de build; Socket/Snyk adiados por gatilho.

## Q2 — Higiene de patch do hub e do template (lacuna nº 2)

**Fatos.** C-002 fixa pin+lockfile desde o 1º commit; upgrade gates existem para funcionalidade (C-014), não para patch de segurança. Nenhuma decisão define cadência/gatilho de atualização por CVE do hub Node, scaffold, SDK ou Postgres. Mercado: Renovate (free) domina o nicho 1 pessoa — schedule semanal, PRs agrupados, `minimumReleaseAge` próprio, automerge de patch com CI verde.

**Posição preliminar.** Renovate no repo do hub: semanal, agrupado, quarentena 7 dias, automerge só de patch com CI verde, major sempre manual; gatilho extraordinário = CVE crítica em dependência direta (aí a quarentena não se aplica — patch de segurança fura fila com verificação manual). Mesma política para o template/scaffold dos apps.

## Q3 — Egresso governado no runtime publicado (residual C-009 ponto 10)

**Fatos.** Deny-all + allowlist existe só para o worker E2B de build (C-008 comp.6). A sonda Mitra provou o risco no runtime: `fetch` cru de SF para host arbitrário foi o contorno que salvou a integração ML — "o guarda de credencial da plataforma não é fronteira" (OBS-73.4, C-009 p.10). E a barreira ancorada em hostname parou de vigiar em silêncio quando o host virou dado de banco (OBS-74.4) — **barreira precisa ancorar em egresso, não em destino**.

**Confronto.** Questão estrutural a resolver antes de decidir: no desenho atual, artefatos de produção são declarativos (queries/actions/integrations executados pelo hub via Gateway + Connection) — código de app com `fetch` arbitrário server-side pode nem existir por construção em F1. Se for isso, a "decisão" é declarar o invariante (runtime só executa kinds declarados; egresso de produção = só Gateway via Connection) e amarrar no probe. Se existir qualquer superfície de código server-side arbitrário (job, hook, integration custom), aí precisa de allowlist de egresso igual C-008.

**Posição preliminar.** Invariante declarado: **todo egresso de produção passa pelo Gateway via Connection registrada; artefato não tem primitiva de rede própria**. Verificação no probe (tentativa de fetch direto de artefato = falha). Allowlist de egresso de runtime só nasce se/quando nascer superfície de código arbitrário server-side (gatilho nomeado).

## Q4 — Credencial viva: canal de entrada + invariantes de rotação (residuais S4/OBS-74)

**Fatos.** C-007 define onde a credencial mora (vault, `credential_backend`+`credential_ref`) e delega explicitamente a T14: "vault do hub, invariantes de hook e fronteira do Gateway são insumos diretos" (08-integracao-externa.md:103). O que não está ratificado: (a) **como a credencial entra** — na Mitra ela entrou pelo chat, 2× (S4 §15; reincidente OBS-02/03: agente pede segredo via formulário no chat); OBS-03 marca OWN "canal dedicado de credencial com seleção explícita de ambiente"; (b) **invariantes de rotação** — refresh_token rotativo de uso único mata desenho ingênuo: lock por `rowsAffected` de UPDATE condicional (OBS-74.1: 3 formas de corrida deixaram passar 2 renovações), key_version, reconciliação pós-OUTCOME_UNKNOWN de renovação. C-007 tem os seams; as invariantes não estão escritas.

**Posição preliminar.** (a) Credencial entra SÓ por rota de plataforma dedicada do hub (mesma família das rotas admin C-015 §10): formulário próprio com seleção explícita de conexão+ambiente, write-only (nunca ecoa valor), registro de blast radius no momento (quantas empresas o token alcança — anti-S4); chat/agente proibidos de receber segredo — agente que precisar de conexão nova gera LINK para a rota, nunca formulário no chat. (b) Rotação: UPDATE condicional com verificação de `rowsAffected` como lock, `key_version` no ciphertext (já em C-007), renovação com OUTCOME_UNKNOWN → reconciliação antes de retry (nunca queimar refresh de uso único às cegas).

## Q5 — Erro sanitizado + atribuição de autoria (lacuna nº 3 + OBS-72.7)

**Fatos.** Peças locais existem: `last_error` sanitizado (C-007), "erros sanitizados" na camada AI SDK (C-010 adendo cond.4), erro tipado no envelope (C-005), redaction por campo (C-013 §19). Mas o invariante único — detalhe interno nunca atravessa o Gateway — não está escrito em lugar nenhum. E a sonda Mitra mediu a segunda metade: erro que nomeia ator externo sem tráfego ("O Mercado Livre recusou" quando o ML nunca foi contatado — OBS-72.7); o requisito `houve_resposta: boolean` + status bruto nasceu ali e não foi ratificado. Mercado (OWASP): resposta genérica + correlation ID; stack trace só em log server-side; `NODE_ENV=production` sempre.

**Posição preliminar.** Invariante único: stack trace/detalhe interno nunca atravessa Gateway para browser, agente ou log não-redacted; resposta externa = erro tipado + correlation ID; trace completo só no log estruturado do hub. Envelope de erro de integração ganha `houve_resposta: boolean` + status bruto obrigatórios; apresentação PROIBIDA de nomear ator externo quando `houve_resposta === false`.

## Q6 — Resíduos do compilador de queries + rate limit de `execute()` (lacuna nº 4)

**Fatos.** Bind params (C-005) matam SQLi estrutural. Resíduos conhecidos pós-bind (OWASP/consenso): wildcards de LIKE entram como dado (DoS/enumeração), ORDER BY não parametrizável (exige allowlist), paginação sem teto (DoS), statement_timeout já existe como higiene (C-006 comp.11: "timeouts = higiene, não budgets"). Rate limit existe para login (C-015 §2), upload (C-015 §13) e agente (C-009 comp.13 budgets) — `execute()` chamado por humano autenticado não tem teto. Mercado: por conta (não IP — tailnet NATeia), `rate-limiter-flexible` em memória, sem Redis.

**Posição preliminar.** No compilador, de uma vez para todos os apps: (a) parâmetro em LIKE escapado por default (`%`,`_`,`\`), opt-in explícito para wildcard; (b) ORDER BY só por allowlist de colunas declarada na query — input escolhe da lista, nunca string; (c) paginação com teto server-side; (d) statement_timeout permanece higiene. Rate limit de `execute()`: balde generoso por conta (anti-loop/anti-script, não anti-usuário), em memória, single-instance.

## Q7 — LGPD F1 (lacuna nº 5)

**Fatos.** PII lint existe só no Brain (C-011) e Spotlight (C-013 §16). Hub espelha dados pessoais do Sankhya (clientes PF, vendedores, contatos). Resolução CD/ANPD nº 2/2022 (pequeno porte): dispensa DPO nomeado e flexibiliza forma (registro simplificado, prazos dobrados), mas não dispensa base legal, princípios e direitos do titular; guia ANPD de segurança para pequeno porte = referência mínima. Base legal correta para operação interna B2B: execução de contrato (art. 7º V) + legítimo interesse (art. 7º IX) — consentimento é a base errada. Dados fiscais: retenção obrigatória ≥5 anos; direito de exclusão cede à obrigação legal (art. 16, I). SEG-4 empurra formalismo para F2 — mas LGPD é lei, não theater.

**Posição preliminar.** Postura F1 mínima e registrada: (a) ROPA simplificado de 1 página — gerável, porque o catálogo de sync já sabe quais tabelas pessoais são espelhadas; (b) **minimização no sync**: coluna pessoal que nenhum app usa não é espelhada (a mitigação mais barata que existe); (c) procedimento de exclusão de 1 parágrafo: exclusão no ERP propaga pelo sync; dado sob guarda fiscal é bloqueado/anonimizado no espelho, não apagado no ERP; (d) backup cifrado (já implicado por C-006 comp.7 — verificar se cifra está explícita) + logs de acesso = exatamente o que o guia ANPD pede; citar e encerrar. RIPD/DPO formal = F2 por gatilho.

## Q8 — Forma do tópico: consolidação como entregável

**Fatos.** Fase 3 do programa já prevê procurar "segurança/authority que existe em documento mas não no boundary físico" (00-TOPICOS:118). MC [#35] é a evidência real da casa: árvore/testes verdes ≠ deployment correto (papel RLS, schema e sessão divergiam no runtime) — já respondida por C-014 EnvironmentConformance + C-013 SERVED_VERIFIED. MetalDocs #87/#90: gate fora de entrypoint único ≡ gate que pode não existir; fronteira de auth como acidente do módulo. **Não há incidente de invasão medido nos nossos produtos** — a classe real é divergência runtime×árvore e drift de fronteira; a âncora de proporção é externa (CVE-2025-48757 Lovable, Retool, Appsmith, Budibase). Mercado: ASVS 5.0 L1 (mai/2025) rebaixado de propósito para ponto de partida; prática sobrevivente em time pequeno = 4 perguntas de Shostack por mudança, não documento anual.

**Posição preliminar.** T14 não produz threat model formal (SEG-4). Produz: (a) **mapa consolidado de invariantes de segurança** — tabela transversal dos 8 eixos × decisão × probe que verifica (CX-SBX-E2B-01 4–6, CX-SCAFFOLD-V0-01 6, CX-OBS-V0-01 3/8, CX-PUB-V0-01 a–t, CX-REL-V0-01 c) × fronteira física (hub/Gateway/roles PG/CSP) vs cortesia — índice referencial, não decisão nova; (b) checklist próprio ~15 itens, 1 página, versionado, cada item mapeado a onde é verificado (CI, gerador, gate), com ASVS 5.0 L1 como fonte rastreável sem adotar os 350; (c) threat model por exceção: 4 perguntas de Shostack só quando gatilho dispara (nova trust zone, novo egresso, primeira escrita em domínio novo do Sankhya, exposição fora do tailnet, chegada de TLS); (d) nomear que **o permission diff C-015 §8 já é o threat model contínuo do sistema** — evita processo duplicado. Disciplina de teste vira invariante: isca com a forma do caso real (403≠401, OBS-74.2); guarda que não quebra teste não protege o próximo turno (OBS-73.3).

---

## Tensões abertas

| # | Tensão | Estado |
| --- | --- | --- |
| T-1 | SEG-4 ("sem theater") × entregáveis de Q8 — checklist/mapa são índice do que existe ou processo novo disfarçado? | Posição: índice referencial passa; qualquer item sem probe/gate correspondente é theater e cai |
| T-2 | Q3 depende de fato estrutural: existe código server-side arbitrário em artefato F1 ou tudo é declarativo via Gateway? | Verificar no cruzamento; muda a decisão de invariante para allowlist |
| T-3 | Quarentena de 7 dias × patch de CVE crítica — atraso aumenta ou reduz risco líquido para hub sem exposição pública? | Pergunta externa |
| T-4 | Tailnet (WireGuard) sem TLS × LGPD com dados pessoais em trânsito — controle compensatório aceito ou gatilho de TLS deve antecipar? | Pergunta externa |
| T-5 | Canal dedicado de credencial: quanto de UI construir em F1 (rota simples write-only vs fluxo completo com teste de conexão embutido)? | Cruzamento |
| T-6 | Catálogo S1–S9 do doc de referência Mitra está desatualizado (achados C-009 p.9–10 sem ID) — atualizar é escopo de T14 ou manutenção do acervo? | Manutenção; não bloqueia decisão |

## Posições preliminares (para pesquisa externa)

- **P1 — Supply chain**: gate de admissão de dependência mecânico (pnpm, scripts off, `minimumReleaseAge` 7d, frozen lockfile, allowlist + dependency diff no promote). Global maximum: nenhuma plataforma AI-builder documenta gate de admissão com aprovação humana por diff.
- **P2 — Patch do hub**: Renovate semanal agrupado, automerge patch com CI verde, CVE crítica fura quarentena com verificação manual.
- **P3 — Egresso de produção**: invariante "todo egresso passa pelo Gateway via Connection; artefato não tem primitiva de rede" + probe; allowlist só por gatilho.
- **P4 — Credencial viva**: entrada só por rota de plataforma write-only com blast radius registrado (anti-S4); rotação com lock por rowsAffected + reconciliação pós-OUTCOME_UNKNOWN (anti-OBS-74.1).
- **P5 — Erro**: invariante único de sanitização (correlation ID, trace só server-side) + `houve_resposta` obrigatório + proibição de culpar ator externo sem tráfego (anti-OBS-72.7).
- **P6 — Resíduos e forma**: compilador fecha LIKE/ORDER BY/paginação; rate limit por conta em `execute()`; LGPD = ROPA gerado + minimização no sync + exclusão documentada; forma = mapa de invariantes + checklist ~15 + Shostack por gatilho; permission diff nomeado threat model contínuo.

## Vocabulário novo

- **Gate de admissão de dependência** — decisão sobre o que PODE entrar no lockfile, distinta de congelar o que entrou.
- **Dependency diff** — irmão do permission diff: pacote fora da allowlist vira item de aprovação no gate de promote.
- **Quarentena temporal** — `minimumReleaseAge`: versão npm só é instalável N dias após publicação.
- **Slopsquatting** — registro malicioso de nomes de pacote alucinados por LLM.
- **Fronteira física × documental** — invariante verificado por probe/gate/role vs invariante que só existe em texto.
- **Threat model por exceção** — 4 perguntas de Shostack disparadas por gatilho nomeado, nunca documento periódico.
- **ROPA simplificado** — registro de tratamento de 1 página (Res. CD/ANPD 2/2022), gerável do catálogo de sync.
