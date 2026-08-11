# Mensagem de alinhamento — sandbox (para ChatGPT)

> Copie tudo abaixo da linha e cole no ChatGPT, no mesmo chat da pesquisa de sandbox.

---

Recebemos sua pesquisa de sandbox. Cruzamos com duas pesquisas internas nossas e estamos
**perto de convergir na sua recomendação** (Topologia A + Vercel Sandbox como primeira hipótese),
com duas informações novas que você não tinha e oito dúvidas que precisam fechar antes de
ratificarmos. Responda com fontes primárias + URLs + data; marque o que não conseguir verificar.

## Contexto novo (você não tinha)

1. **Restrições do operador**: fase 1 é uso solo; teto de custo **US$ 20/mês** para o sandbox
   (pagável se comprar segurança + zero operação + always-on); ele considera três lugares para
   rodar a plataforma: o próprio PC (Windows/WSL2), um PC velho em casa como servidor, ou
   **Fly.io (já tem conta)**. Desejo forte: disparar builds de qualquer lugar, com a máquina
   pessoal desligada.
2. **Já temos a Topologia B construída e provada**: spike local (WSL2) com Pi no host +
   7 tools brokered + sandbox-runtime da Anthropic (bubblewrap), suíte de segurança S1–S15
   toda PASS (escape de escrita, leitura de credencial, rede default-deny, fail-closed,
   propagação a filhos). Ou seja: o argumento "B exige construir brokers custom" não se aplica
   a nós — já está pago. B vira fallback de custo zero, não trabalho novo.
3. Registramos também: o sandbox-runtime da Anthropic ganhou masking de credenciais nativo
   (TLS-terminate + sentinel + injectHosts) — o mesmo padrão placeholder do
   Gondolin/Daytona/Vercel, em projeto com release semanal.

## Direção que estamos propondo (critique se discordar)

- **Hipótese nº 1**: Topologia A + Vercel Sandbox, com gates de qualificação.
- **Fallback preservado**: Topologia B + sandbox-runtime local (para dev offline e como
  Removal Condition da Vercel) — sem torneio simétrico.
- **Hub + Postgres no Fly.io** (o operador já usa) — sempre ligado, ~US$ 3–5/mês.
- Capability Gateway seu: ADOTADO integralmente (credencial de Postgres/ERP/git nunca no
  sandbox; broker de header não protege protocolo nativo de DB).
- `ActorRunSandbox` ≠ `PreviewEnvironment`: ADOTADO.

## As 8 dúvidas que precisam fechar

1. **Credencial do modelo (LLM) na Topologia A**: confirme que o
   `defineSandboxProxy`/forwarding da Vercel consegue injetar `Authorization` para
   `api.anthropic.com` (e OpenAI/Google) com o plaintext comprovadamente fora do guest.
   Como fica **refresh de token OAuth** (assinatura Claude) nesse modelo? E provider cujo SDK
   não usa header simples? Se não der, a key do modelo entra na VM — isso derruba A?
2. **Alguém roda um AGENTE dentro do Vercel Sandbox?** v0 roda builds; existe evidência
   pública de agente de código (loop LLM+tools) rodando DENTRO de um Vercel Sandbox em
   produção? Limites práticos: sessão 24 h (Pro) basta; mas e reconexão/streaming de eventos
   do processo interno para um hub externo — qual o mecanismo suportado (WebSocket? SSE?
   polling do SDK)?
3. **Billing "Active CPU" com workload de agente**: o agente passa a maior parte do tempo
   esperando resposta do LLM. Confirme na fonte primária que espera de I/O de rede NÃO conta
   como Active CPU — isso deixaria nosso custo perto do piso (~US$ 7–12/mês). Se contar,
   refaça a conta.
4. **Git sem PAT no sandbox**: você propôs NO GIT PAT no guest. Então como o commit sai?
   Opções que vemos: (a) push via Capability Gateway (worker manda diff/bundle, hub faz push);
   (b) deploy key de escopo único injetada por proxy; (c) extração de artefato/snapshot.
   Qual você recomenda e por quê? Existe precedente documentado?
5. **Preview > 24 h**: sandbox Vercel morre em 24 h (Pro). PreviewEnvironment que vive
   dias — onde? (a) segundo sandbox Vercel re-provisionado sob demanda do resultado validado;
   (b) app Fly (o operador já tem conta); (c) Vercel deploy normal (não sandbox). Recomende.
6. **Latência Brasil → iad1**: operador está no Brasil; região única `iad1`. Para eventos de
   UI (checklist vivo, streaming de progresso) via hub no Fly GRU → sandbox iad1, isso é
   aceitável? Algum plano público da Vercel de multi-região para Sandbox?
7. **Maturidade/SLA**: Vercel Sandbox é GA? Tem SLA no plano Pro (US$ 20)? Breaking changes
   recentes no SDK `@vercel/sandbox`? Cadência? Nossa Removal Condition dispararia em quê
   (preço, região, limite, deprecation)?
8. **Alternativas mais baratas — verificamos na web em 2026-08-10; cruze e critique.**
   Custo mensal no nosso perfil (200 exec × 25 min × 2 vCPU + hub Node/Postgres always-on):

   | Arquitetura | US$/mês | Key do LLM fora do guest? | Egress allowlist | Região |
   |---|---|---|---|---|
   | Hub Fly + workers **Modal** (Starter: crédito recorrente US$ 30/mês cobre o uso) | ~3 | não (env var) | nativa por domínio (beta) | `sa` +50% |
   | Hub Fly + workers **E2B Hobby** (crédito one-time US$ 100 ≈ 7 meses) | ~3 → ~17 | não (env var) | nativa por domínio | só US |
   | **Fly total** ("E2B caseiro"): hub machine + worker machine Firecracker EFÊMERA por execução via Machines API + SRT dentro (egress allowlist do próprio SRT) — Topologia B, key fica no hub | ~8–12 | **sim** | via SRT | **GRU/BR** |
   | Hub Fly + **Vercel Pro** | ~23 | **sim** (proxy OIDC — único gerenciado) | nativa | só iad1 |

   Descartes nossos: Vercel Hobby (Active CPU 5 h/mês cobre ~¼ do perfil), Cloudflare
   Sandboxes (~US$ 26 com standard-3, sem pin de região), Oracle Always Free (corte de
   junho/2026 + reclaim de idle), Fly Sprites (~US$ 46). Riscos que já vemos: créditos
   Modal/E2B são promocionais (podem sumir); rota Fly-total exige probe de bubblewrap no
   kernel guest do Fly (nunca documentado publicamente; namespaces+cgroups v2 confirmados
   por staff — probe de 5 min resolve) e ~1 dia de integração (endpoint `/exec` da Machines
   API trava em 60 s → servidor HTTP próprio na worker via rede privada 6PN).
   **Pergunta**: dado teto US$ 20, key-fora-do-guest como propriedade normativa e o desejo
   de zero-ops — qual dessas 4 você ranqueia primeiro e por quê? A diferença de ~US$ 11–20/mês
   da Vercel se justifica só pelo proxy OIDC + zero-ops, ou a rota Fly-total (BR, soberana,
   ~US$ 10) é o racional? Modal/E2B com key visível no guest é aceitável na fase 1 solo
   (o Capability Gateway já protege DB/ERP/git; sobraria só a key do LLM exposta)?

## Formato de saída

Respostas numeradas 1–8 com fonte + URL + data cada; no fim, ranqueie as 4 arquiteturas da
dúvida 8 (Modal ~3 · E2B ~3→17 · Fly-total ~8–12 · Vercel ~23) dadas as informações novas
(teto US$ 20, Topologia B já paga, hub no Fly) e diga se mantém "Vercel primeiro a
qualificar" ou muda a ordem — e o porquê em 5 linhas.
