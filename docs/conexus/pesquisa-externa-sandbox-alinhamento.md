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
8. **Alternativa barata: Fly Machines como o próprio sandbox.** Fly Machine JÁ é uma micro-VM
   Firecracker — e o sandbox-runtime da Anthropic (bubblewrap, open source, sem KVM) roda
   dentro dela: isolamento em dupla camada, região GRU (São Paulo), sem limite de 24 h,
   ~US$ 5/mês total. O custo real é operacional: egress allowlist DIY (Fly não tem
   `networkPolicy` nativo), secrets = env vars visíveis (só o Capability Gateway protege),
   pool/pre-warm DIY via machines paradas. Para UM operador solo: quantas horas/mês de ops
   essa rota realmente custa vs Vercel? Existe precedente público de coding agent usando
   Fly Machines como sandbox? Dado o teto de US$ 20, a diferença de ~US$ 15/mês justifica
   a Vercel ou o Fly+SRT é o racional?

## Formato de saída

Respostas numeradas 1–8 com fonte + URL + data cada; no fim, diga se mantém
"Vercel primeiro a qualificar" dadas as informações novas (custo teto US$ 20, B já pago,
hub no Fly, alternativa Fly+SRT a ~US$ 5), ou se muda a ordem — e o porquê em 5 linhas.
