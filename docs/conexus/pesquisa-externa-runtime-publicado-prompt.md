# Prompt de pesquisa externa — Tópico 12: Runtime publicado (Auth/RBAC, embed, storage)

> Uso: colar em ferramenta de deep research. Resultado volta para cruzamento com a pesquisa
> interna (pesquisa-interna-runtime-publicado.md).

---

Você é um pesquisador técnico sênior. Preciso de pesquisa profunda, com fontes primárias e datas,
para decidir o runtime publicado de uma plataforma AI-first que gera e opera apps de negócio sobre
ERP. Responda em português, com links, priorizando documentação oficial, post-mortems, CVEs e
relatos de produção de 2024–2026. Quando a evidência for fraca ou contraditória, diga
explicitamente.

## Contexto do sistema (fixo — não re-decidir)

- Hub Node.js próprio + Postgres local; operador solo; fase 1 custo ~US$0; usuários finais são
  internos (single-tenant, um grupo de permissão como invariante declarada).
- Apps gerados por agente LLM são servidos pelo hub na MESMA origem, por path
  (`deployments/<project>/<digest>/dist`), atrás de ponteiro CAS atômico; CSP estrita,
  `frame-ancestors`, `nosniff` desde o 1º deploy.
- Todo acesso a dados passa server-side pelo hub (`execute(slug, input)`); credenciais nunca chegam
  ao browser; roles de banco mínimos por projeto (read-only × DML-only, selecionados pelo TIPO do
  artefato, não pelo usuário); RLS/row-level adiado por gatilho explícito.
- Frontend nunca é boundary de autorização (só presentation policy); contrato estrutural do
  cliente exclui autorização (mudança de permissão não invalida o bundle).
- Sem TLS/ingress público na fase 1 (rede local/tailnet); gatilhos nomeados para reverse proxy,
  hostname próprio e acesso externo.

## Perguntas

**Q1 — Sessão para apps servidos por proxy próprio (BFF).** Para N apps gerados servidos na MESMA
origem por path, qual o padrão 2025–2026 de sessão: cookie HttpOnly/SameSite server-side vs JWT?
Riscos reais e documentados de sessão única compartilhada entre apps da mesma origem (XSS num app
alcança todos?): CSP estrita mitiga o quê, e o que só subdomínio-por-app resolve? Path-scoped
cookies são fronteira de algo? O que plataformas maduras (Retool self-host, Budibase, Appsmith)
fazem no self-host single-origin?

**Q2 — Auth de usuário final mínima para operador solo.** Email/senha (argon2id) + provisão por
admin, sem self-signup, sem fluxo de email: é postura defensável em 2026 para apps internos? Onde
ela quebra primeiro (auditoria? rotatividade de funcionário? esquecimento de senha)? Magic
link/OTP e passkeys: dados atuais de adoção em apps INTERNOS de negócio (não consumer), e o
consenso sobre passkey como upgrade opcional vs porta de entrada. Custo real de operar reset por
admin vs SMTP.

**Q3 — RBAC declarado por agente LLM com enforcement externo.** Evidência 2025–2026 sobre apps
gerados por LLM e permissões: além do CVE-2025-48757 (Lovable/Supabase RLS), que outras classes de
falha de autorização em código gerado estão documentadas? Existe prática/ferramenta de validação
de manifestos de permissão gerados (lint "action sem role", diff de permissões entre versões,
bloqueio de alargamento silencioso em redeploy)? Como Retool/Glide/Softr impedem que o builder
alargue permissões sem revisão?

**Q4 — Granularidade de RBAC que apps internos realmente usam.** Dados reais (não marketing) sobre
o que apps de negócio internos usam: app-level roles (admin/editor/viewer) vs row-level vs
field-level — frequência, e quando row-level vira necessidade (sinais objetivos). O anti-padrão
"role que particiona dados" (carteira por vendedor) tratado como WHERE parametrizado server-side
vs RLS nativo: trade-offs documentados em Postgres.

**Q5 — Embed de app interno em portal/ERP em 2026.** Estado REAL de cookies em iframe
cross-origin: reversão do Chrome (out/2025), CHIPS `Partitioned` como baseline, Storage Access
API — relatos de produção (taxa de quebra em Safari/Firefox), não só docs. O padrão Retool Embed
(token curto na URL → sessão) tem vulnerabilidades conhecidas (leak por referrer/logs)? Para app
interno com hub próprio, o consenso é adiar embed até demanda real? Headers exatos do desenho de
destino.

**Q6 — Upload/anexo de arquivo em hub Node.js próprio.** Melhores práticas consolidadas
2025–2026: magic bytes (`file-type`), allowlist, limite, nome server-side, fora do docroot, servir
via rota autenticada — algo mudou ou faltou? ClamAV para operador solo: sinal objetivo de quando
passa a valer o daemon. Content-addressed storage (blob por SHA-256) para anexos: precedentes,
armadilhas (dedup entre projetos vaza existência de arquivo?), e o caminho filesystem → R2/MinIO
(quando migrar, dados de esforço real abaixo de 50 GB).

**Q7 — Guarda fiscal brasileira de anexos (contexto Sankhya/NF-e).** Requisitos legais de guarda
de XML de NF-e/documentos fiscais no Brasil (prazo, integridade, disponibilidade): storage por
digest SHA-256 satisfaz requisito de integridade? Exige carimbo de tempo/assinatura? Isso muda o
desenho do storage de anexos ou é responsabilidade do ERP (Sankhya) e o app só referencia?

**Q8 — Tela/rota pública em app interno.** Plataformas que permitem "public screen" (form público,
link de consulta sem login): como isolam (token de escopo único? origem separada? rate limit?) e
que incidentes existem. Para F1 sem ingress público isso é irrelevante — mas a FORMA da decisão
(flag por rota × app público inteiro) tem consequência de retrofit?

## Posições preliminares para veredito

Para cada uma: **CONFIRMA / REFINA / REFUTA**, com evidência e correção proposta se REFINA/REFUTA.

- **P1**: Auth F1 = contas no controle central do hub (UUID estável, uma conta → N apps),
  provisionadas pelo operador, email/senha argon2id, sessão server-side Postgres + cookie
  HttpOnly/SameSite=Lax; sem self-signup/magic link/passkey (gatilhos nomeados).
- **P2**: RBAC F1 = roles por app declarados no manifesto do deployment (dado, não código),
  enforcement único no hub por chamada (deny-by-default: action sem role declarada = só admin);
  UI condicional é cortesia; particionamento de DADOS por role fica atrás de gatilho (RLS/audience).
- **P3**: Embed = não construir F1; `frame-ancestors 'self'`; gatilho nomeado com desenho
  registrado (token assinado curto → cookie `Partitioned` → allowlist de portal).
- **P4**: Storage F1 = CAS por SHA-256 no filesystem do hub + metadados em Postgres por projeto;
  magic bytes + allowlist + ~20 MB; servir só por rota autenticada com role do app; privado por
  padrão, público assinado atrás do gatilho de ingress; sem ClamAV/quotas/versionamento F1.
- **P5**: Sessão única do hub para N apps + autorização por app a cada chamada; subdomínio por app
  só com o gatilho de hostname.

## Formato da resposta

1. Resposta por pergunta (Q1–Q8) com fontes datadas.
2. Veredito P1–P5.
3. Top 5 riscos do desenho proposto, em ordem de probabilidade × dano.
4. O que o mercado faz MELHOR que o proposto (oportunidade de superar, não só igualar).
5. Lista "não construa ainda" com sinais objetivos de gatilho.
