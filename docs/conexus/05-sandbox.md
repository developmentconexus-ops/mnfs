# Tópico 4 — Sandbox de execução

**Status: DECIDIDO — C-004, ratificado pelo operador em 2026-08-11.**
Fontes: 3 pesquisas internas (gerenciados, self-host, alternativas baratas — preços verificados na
web em 2026-08-10/11) + 2 rodadas de pesquisa externa independente (ChatGPT: relatório inicial +
[alinhamento](pesquisa-externa-sandbox-alinhamento.md)) + docs primários confirmados via Context7.
Evidência prática: spike AS-02 ([plano](../superpowers/plans/2026-08-02-as-02-local-pi-sandbox-wsl2.md) ·
[aceite](../acceptance/2026-08-02-as-02-local-pi-sandbox-wsl2.md)). Herda [C-002](04-runtime-agente.md)
(hub soberano + workers Pi frescos) e [C-003](03-requisitos.md).

## A decisão em uma frase

**Fase 1a roda 100% local e custa R$ 0**: Topologia B (Pi no host confiável, execução enjaulada
pelo SRT da Anthropic) no PC do operador — já construída e provada. A nuvem entra só por **gatilho
real** (primeira necessidade de disparar build com o PC desligado), e o caminho já fica escolhido
no papel: Vercel Sandbox se o spike passar, Fly.io se não.

## Contexto da escolha

- Restrições do operador: fase 1 solo; gastar quase nada (teto US$ 20/mês se comprar
  always-on + zero-ops); portabilidade PC → possível servidor caseiro → Fly.io.
- Duas topologias avaliadas: **A** = agente dentro do sandbox (estilo Mitra/E2B);
  **B** = agente fora (host confiável), só execução dentro. Síntese verificada: topologia
  segue o alvo de deploy — produtos cloud usam A; tooling local (Claude Code sandbox local,
  pi-chat, Pi+Gondolin) usa B.
- Spike AS-02 (aceito 2026-08-03): Pi no host + 7 tools brokered + SRT 0.0.67 em WSL2,
  suíte de segurança S1–S15 toda PASS (escape de escrita, leitura de credencial, rede
  default-deny, fail-closed, contenção de filhos). Topologia B está paga.

## Evidência-chave (verificada em fontes primárias)

| Fato | Fonte |
|---|---|
| SRT (sandbox-runtime, Anthropic): open source, bubblewrap+seccomp, sem KVM, x86-64+ARM, masking de credenciais nativo (TLS-terminate) desde 0.0.71 | github.com/anthropic-experimental/sandbox-runtime (2026-08) |
| Vercel Sandbox GA 30/01/2026 (v0, Blackbox, RooCode em produção); Firecracker; *"credentials brokering… ensuring secrets never enter the sandbox scope"* (`transform.headers`/`forwardURL` no firewall) | vercel.com/docs/sandbox/concepts/firewall via Context7 (2026-08-11) |
| Vercel Active CPU **não conta espera de LLM/rede**; Pro US$ 20/mês **inclui US$ 20 de crédito** → perfil (200×25min×2vCPU) cabe: sandbox ≈ US$ 20 flat | vercel.com/kb/guide/vercel-sandbox-duration-and-persistence (2026-08-10) |
| Vercel **não hospeda processo persistente** (functions máx 30min; *"queue-triggered functions rather than persistent worker processes"*) → hub precisa de VM | vercel.com/docs via Context7 (2026-08-11) |
| Agentes reais DENTRO da Vercel Sandbox: guias oficiais Claude Agent SDK e OpenCode; arquitetura Claude Managed Agents | vercel.com/kb (2026-08-10) |
| Modal/E2B/Daytona entregam secret como **env var legível no guest** (`echo $MY_SECRET` é o exemplo oficial do Modal) | modal.com/docs/guide/sandboxes via Context7 (2026-08-11) |
| Modal Starter: crédito **recorrente** US$ 30/mês cobre o perfil (~US$ 10–16); gVisor; allowlist por domínio (runtime update `_experimental_`); região `sa` +50% | modal.com/pricing + docs (2026-08-10/11) |
| E2B ≡ Daytona em preço ($0,0504/vCPU-h): perfil ~US$ 13,80/mês; créditos one-time US$ 100 (~7 meses) / US$ 200 (~14 meses); Daytona fechou o core (jun/2026) e default é container | e2b.dev/pricing · daytona.io/pricing (2026-08-11) |
| Fly Machines: Firecracker por machine, GRU nativo; rota "E2B caseiro" (hub machine + worker efêmera) ~US$ 8–12/mês; riscos: shared CPU baseline ~6,25%/vCPU (throttle em build), `/exec` limitado a 60s, bubblewrap no kernel guest não documentado (probe de 5 min resolve) | fly.io/docs/about/pricing + community.fly.io (2026-08-10) |
| Descartes: Vercel Hobby p/ produção (5h Active CPU ≈ ¼ do perfil), Cloudflare Sandboxes (~US$ 26, beta, sem pin de região — **candidata fase 2**: SAM + brokering via Worker), Oracle Always Free (corte jun/2026 + reclaim de idle), Fly Sprites (~US$ 46), Blaxel (vendor novo, vantagem irrelevante) | pesquisas 2026-08-10/11 |

## Decisão por componente

| # | Componente | Decisão |
|---|---|---|
| 1 | **Realização fase 1a (agora)** | 100% local no PC do operador (WSL2): hub + workers Pi (Topologia B) + **SRT pinado** (atualizar 0.0.67 → 0.0.71+, masking ligado). Custo US$ 0/mês. Linux-nativo: mesmo código roda em servidor caseiro ou Fly só mudando deploy. |
| 2 | **Spike Vercel (cedo no build)** | No plano **Hobby grátis** (5h Active CPU incluídas bastam). Responde os gates A1–A14 antes de o MVP acumular machinery da Topologia B além dos brokers já pagos. |
| 3 | **Gates A1–A14 (Vercel substitui local só se provar todos)** | A1 Pi roda no sandbox · A2 Actor Pack exato/sem descoberta ambiente · A3 credencial-raiz do provedor nunca no guest · A4 filho não recupera credencial · A5 default-deny funciona · A6 tools nativas contidas · A7 eventos estruturados chegam ao hub · A8 cancel/handoff mecânico · A9 reconexão sem autoridade de sessão do Pi · A10 extração de resultado sem credencial git · A11 performance de build representativo · A12 custo medido ≤ US$ 20/mês · A13 latência BR↔iad1 aceitável (medir, não chutar) · A14 **machinery eliminada > adicionada** (se virar proxy atrás de proxy, fica a B). |
| 4 | **Gatilho de nuvem** | Primeira necessidade real de disparar/acompanhar build com o PC desligado (celular, madrugada, viagem). Não é data — é evento. |
| 5 | **Rota nuvem principal (spike PASS)** | Hub + Postgres em **Fly Machine GRU** (~US$ 3–6/mês, always-on) + workers em **Vercel Sandbox Pro** (Topologia A, ~US$ 20 flat). Total ~US$ 23–26 — flag: passa o teto de 20 em poucos dólares, aceito pelo operador. |
| 6 | **Rota nuvem fallback (spike FAIL em credencial/topologia)** | **Fly-total**: hub machine + worker machine Firecracker efêmera por execução + SRT dentro (Topologia B remota, ~US$ 8–12/mês, tudo GRU). Probe mínimo F1–F6: bwrap/userns no kernel guest · sem flags fracas · controle via 6PN (não `/exec`, que trava em 60s) · cleanup/recovery de machines · build representativo sob shared CPU · custo real. |
| 7 | **Challenger #2 por gatilho de custo/latência** | **Modal** (Topologia A): se Vercel falhar em A12/A13, qualificar Modal (região `sa`, ~US$ 0 via crédito recorrente) — exige construir **inference gateway próprio** (key raiz no hub, token curto escopado no guest), justificado só nesse cenário. E2B/Daytona atrás do Modal (mesmo furo de env var, sem crédito recorrente; Daytona: core fechado + container). |
| 8 | **Fase 2 (SaaS multi-tenant)** | Re-decisão com gatilho próprio. Candidatas registradas: Cloudflare (SAM + brokering via Worker), Modal (gVisor multi-tenant), micro-VM self-host (exige KVM — servidor próprio, não Fly). |
| 9 | **Preview ≠ sandbox** | `ActorRunSandbox` (fresco, morre com a execução) ≠ `PreviewEnvironment` (nasce do resultado validado, vive dias, autenticado). Preview em nuvem = **Fly Machine GRU**. Local = dev server na máquina. Sandbox Vercel nunca vira preview (limite 24h). |
| 10 | **Git** | Worker usa git à vontade **localmente** no sandbox; `push`/PR/merge só o hub, com credencial do hub (padrão GitHub Copilot cloud agent). Nenhum PAT/deploy key no sandbox. |
| 11 | **Auth do modelo** | Fase 1: API key/BYOK (local: key no host, fora da jaula; Vercel: injetada no firewall). OAuth de assinatura: depois, via `forwardURL` + gateway próprio (composição possível, não bloqueia o Golden Path). |
| 12 | **Normativos herdados do alinhamento** | **Capability Gateway**: credencial de Postgres/ERP/git nunca no sandbox nem como env var (broker de header não protege protocolo nativo de DB). **`secretNotReadableByGuest`**: se o processo do agente consegue `echo $SECRET`, reprova. |
| 13 | **Fronteira de código** | `SandboxProvider` mínimo desde o dia 1 (mesmo espírito do `CodingWorkerRuntime` da C-002): 1 implementação ativa (local/SRT), troca por adapter, sem registry antes do segundo provedor real. |
| 14 | **Pinagem** | SRT e (quando entrar) `@vercel/sandbox` **pinados em versão exata** + teste de conformance + gate de upgrade (churn 2.x da Vercel é real; SRT é beta research preview). |
| 15 | **Removal conditions Vercel (congeladas)** | Sai da primeira posição se: brokering não cobrir nossa rota de provider sem secret cru; uso recorrente > US$ 20/mês; latência iad1 incompatível com UX; major/deprecation quebrar o conformance; fail-closed deixar de valer; teto 24h/recursos bloquear consumidor real; fase 2 exigir SLA/região que Pro não tem (SLA 99,99% é só Enterprise); lock-in exigir semântica Vercel dentro do hub. |

## O que NÃO vamos fazer (anti-overengineering)

- **Não** construir inference gateway agora (só no gatilho Modal).
- **Não** manter 3 adapters de sandbox — 1 ativo + próximo por gatilho.
- **Não** torneio simétrico de topologias: B é incumbente provado, A é challenger com hipótese de eliminação de machinery.
- **Não** montar infra de nuvem (Fly/Vercel/domínio) antes do gatilho — decisão é papel, não infraestrutura.
- **Não** multi-região, SOC2, threat model formal, Kubernetes, Firecracker próprio na fase 1.
- **Não** usar sandbox de execução como preview.

## Consequências

- Custo mensal hoje: **US$ 0**. Trabalho novo hoje: atualizar pin do SRT e ligar masking — resto já existe do AS-02.
- Identidade de execução (C-002) ganha campos `sandboxProvider` + `sandboxId` por ActorRun.
- Conexus Worker Eval (QUA-4) roda idêntico nos dois substratos — é o instrumento de comparação A×B no spike.
- Tópico 5 (registro de artefatos) e 6 (camada de dados) herdam: acesso a Postgres do projeto via Capability Gateway, nunca credencial no sandbox.
- Tópico 13 (observabilidade): eventos do worker → hub via bridge fina (local: IPC; Vercel: HTTP/SSE autenticado) — reconexão reconstrói do estado do hub, nunca da memória do agente.
