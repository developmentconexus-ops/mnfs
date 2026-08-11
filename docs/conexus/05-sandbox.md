# Tópico 4 — Sandbox de execução

**Status: DECIDIDO — C-008 (supersede C-004), ratificado pelo operador em 2026-08-11.**
Fontes: análise "Factory in a Box" ([research](../research/factory-in-a-box.md)) + preços/docs
verificados na web em 2026-08-11 (E2B, Daytona, Modal, exe.dev) + Codex xhigh 2 rodadas
adversariais (6,5 → **9,1/10, "convergido, sem divergência arquitetural material"**) + decisão
do dono do produto (objetivo do sandbox re-priorizado: **agency**, não só confinamento). Herda
[C-002](04-runtime-agente.md) (hub soberano + workers Pi frescos) e preserva os normativos da
C-004 conforme matriz abaixo. C-004 permanece como registro histórico no fim deste doc.

## A decisão em uma frase

**Worker ganha uma máquina completa**: hub local orquestra workers Pi em **microVM Firecracker
alugada (E2B, adapter único do `SandboxProvider`)** — root, apt, browser headless, portas,
Postgres sintético interno — com egress fechado por política nativa fora do guest, git mediado
pelo hub, segredos duráveis jamais no guest, e ~US$ 100 de crédito cobrindo ~meses de fase 1;
ativação condicionada ao probe `CX-SBX-E2B-01`.

## Por que superseder a C-004

1. **Objetivo mudou de ênfase**: C-004 otimizou confinamento a custo zero (SRT). A visão
   ratificada (vídeo Factory in a Box + Mitra + construtor de agentes) exige **agency**:
   máquina completa por worker — smoke test de browser (fase TESTE herdada da Mitra), serviços,
   portas. SRT (processo confinado, sem root/instalação/systemd) não entrega isso.
2. **Isolamento até SOBE**: microVM Firecracker (kernel próprio) > namespaces do SRT.
3. **Egress não regride**: E2B tem firewall nativo (deny-all + allowlist de domínio/CIDR,
   aplicado FORA do guest, `allowPublicTraffic:false`) — fronteira correta para um Pi com root
   (root contornaria SRT interno).
4. **Mitra-proven**: a referência que fatura roda coding agents em E2B em produção (prova o
   substrato; NÃO prova nossa topologia — daí o probe).
5. Dual boot rejeitado (perde o daily driver; hub precisa rodar junto); operar Firecracker cru
   rejeitado (Windows sem KVM; semanas de infra); exe.dev rejeitado (fechado, flat fee,
   recursos pooled na conta).

## Matriz de supersessão

| | Itens |
|---|---|
| **SUPERSEDE** | Topologia fase 1a (local+SRT → hub local + microVM E2B); rota de nuvem Vercel/Fly como plano principal (viram challengers); SRT como fronteira de execução; preview Fly Machine (adiado); gatilho de nuvem "absorvido em parte" (workers já na nuvem; ver componente 11); invariante `secretNotReadableByGuest` (desdobrado — componente 3). |
| **PRESERVE** | Capability Gateway (credencial de Postgres/ERP/git nunca no sandbox); `SandboxProvider` mínimo providerless; SDKs pinados + conformance + gate de upgrade; removal conditions como método; `ActorRunSandbox` ≠ `PreviewEnvironment`; "git push só no hub". |
| **REINTERPRET** | AS-02 = evidência histórica da Topologia B; os CENÁRIOS S1–S15 são reutilizáveis como suíte, o VEREDITO não transfere para a nova topologia. |

## Decisão por componente

| # | Componente | Decisão |
|---|---|---|
| 1 | **Topologia** | Hub local (máquina do operador) + workers Pi FRESCOS por task em sandbox E2B (Firecracker, template próprio com toolchain Node/Bun + Playwright/Chromium + PG17). Worker tem root DENTRO da VM; fronteiras ficam fora do guest (egress, TTL, credencial). |
| 2 | **Provider** | **E2B adapter ÚNICO** + conformance dos comportamentos necessários + removal conditions. Daytona = challenger NÃO implementado (gatilho de qualificação: crédito E2B restante < orçamento de N runs OU falha eliminatória do probe). Modal = exigiria NOVA decisão (gVisor muda classe de isolamento). exe.dev descartado. Self-host E2B OSS = decisão futura quando servidor caseiro existir (infra pesada: Firecracker/KVM+Terraform+Nomad+Consul — soberania de código, não "instalar em casa"). |
| 3 | **Invariante de segredo (desdobrado)** | **`durableSecretNotReadableByGuest`**: credenciais ERP/Connection, conteúdo do vault, provisioning keys de QUALQUER provider — nunca no guest, sem exceção. **`guestReadableRunCapabilityIsEphemeralAndBounded`**: chave de LLM por run É segredo (não reclassificar), mas pode entrar no guest sob condições: criada só pelo hub (provisioning key nunca cruza); `expires_at` provider-side ≤ TTL do sandbox; spend cap sem reset, específico do ActorRun; **fail-closed se expiração/cap não puderem ser confirmados**; nunca em template/snapshot/argv/logs/evidência/bundle; sentinel scan no SHARE; revogação no teardown + reconciliação de órfãs; aceite explícito: root pode ler e gastar até o cap — blast radius = cap de 1 run. |
| 4 | **Gatilhos do proxy de inferência** (não construir agora) | Multi-tenant SaaS · incidente de vazamento · provider de LLM sem TTL/cap confiável · capability cujo dano não seja limitado a gasto · necessidade de credencial durável no fluxo de inferência. |
| 5 | **Git — push mediado pelo hub** | SYNC: hub `fetch origin`, congela `baseCommitSha`, envia **git bundle sem credencial**. WORK: worker usa git localmente, produz 1 commit de resultado. SHARE: hub coleta bundle + evidências pela API E2B → importa em **repositório de quarentena** → verifica ancestry/diff/paths/`resultTreeSha` → validação independente (C-002) → hub faz push/PR/merge. SHARE = worker→hub, nunca worker→GitHub. Nenhum write token no guest; submodule/package privado = materialização pelo hub ou credencial read-only brokerada. |
| 6 | **Egress** | `deny all` + allow explícito (LLM, registry, git estritamente necessários) + `allowPublicTraffic:false`, pela política NATIVA do E2B fora do guest. Limitações congeladas p/ probe: filtro de domínio só 80/443 (outras portas = CIDR); QUIC/HTTP3 fora do filtro; DNS público liberado automático; allow prevalece sobre deny; atualização de política SUBSTITUI a anterior (`{}` reabre tudo); TCP bloqueado pode parecer aberto (validar resposta de aplicação). SRT: rebaixado — opção futura para subprocesso nomeado, não fronteira. |
| 7 | **Banco no sandbox** | **`BuildValidationDatabase`** — nome próprio, NUNCA "DEV" (duas autoridades seria violação da C-006). PG17 exato, localhost/Unix socket, porta 5432 jamais exposta, reconstruído de migrations + golden fixtures pequenas; roda QA-DB-1/2 + smoke de browser. **DEV autoritativo + ETL Sankhya + Data Discovery (HAR-2) + QA-DB-3 (rehearsal com dump sanitizado) + validação final ficam LOCAIS via Capability Gateway.** Bug dependente de dado real → fixture sanitizada mínima ou evidência estruturada produzida pelo Gateway. |
| 8 | **Sessão 1h (Hobby)** | Restrição de desenho aceita: execução representativa ≤40–45 min. Marcos: 45' para trabalho novo · 50' checkpoint/commit + testes decisivos · 55' exporta bundle/evidência · 58' confirmação de coleta ou falha explícita. Template com toolchain pronta; `npm ci`/lockfile congelado; testes estratificados (targeted no worker, suíte completa no gate do hub); métricas P50/P95 de bootstrap/LLM/build/teste/exportação. Pause/resume existe mas NÃO vira mecanismo padrão (não burlar decomposição fresca da C-002). |
| 9 | **Preview** | URL do sandbox = **`RunPreview`**: efêmero, privado, não compartilhável, vivo só durante a execução, servido por **reverse proxy autenticado do hub** (incl. WebSocket/HMR) — sem URL pública anônima; sem webhook/integração externa real; PG e endpoints operacionais nunca expostos. `PreviewEnvironment` estável (dias, autenticado) = decisão separada ADIADA. |
| 10 | **Economia** | Créditos: E2B US$ 100 one-time (Hobby; sessão 1h; 20 concorrentes; 10 GiB disco). Perfil 2vCPU+4GiB ≈ US$ 0,17/h (~600h); provável 8 GiB ≈ US$ 0,23/h (~434h) — ainda ~meses. **Custos ocultos reconhecidos**: cobrança por tempo LIGADO (espera de LLM conta); disco 10 GiB aperta (PG+Chromium+node_modules); template só Debian-derived, sem multi-stage, kernel congelado na build; manutenção Playwright/Chromium/PG17; template custom no Hobby a confirmar ANTES de congelar economia; Hobby sem SLA = risco aceito. Depois dos créditos: pagar uso (~US$ 10–20/mês) ou re-decidir com servidor caseiro. |
| 11 | **Higiene de lifecycle** | TTL provider-side + `onTimeout: kill` + metadata por ActorRun + spending limit na conta + **reconciliação de sandboxes/chaves órfãos no boot do hub** (queda do hub/WSL não pode queimar crédito nem deixar chave viva). |
| 12 | **Gatilho "PC desligado"** | **NÃO absorvido** — com hub local desligado ninguém cria/supervisiona/cancela/coleta/valida. Preservado como gatilho em aberto; candidatos: servidor caseiro (hub migra) ou hub-na-nuvem (Fly GRU continua candidato). |
| 13 | **Seam `SandboxProvider`** | Mínimo: `create`, `transfer workspace`, `exec/stream`, `interrupt`, `fetch result`, `destroy`. Snapshots, volumes e template builders FORA do domínio comum (divergem demais entre providers). |
| 14 | **Fallback local não qualificado** | Container rootful / 2ª distro WSL2 descartável: ganha em custo US$ 0, latência, dado local, agency; perde em isolamento do daily driver (kernel/utility VM compartilhados — precisão: não equivale a root no Windows todo, mas o blast radius no ambiente diário justifica E2B), firewall de egress nativo, higiene de lifecycle e trajetória (forma final = microVM). Registrado como **fallback NÃO QUALIFICADO**; gatilhos: economia colapsa · conectividade inviabiliza loop remoto · falha eliminatória do `CX-SBX-E2B-01`. |

## Ativação probe-gated — `CX-SBX-E2B-01`

Decisão vale AGORA; ativação (1º build real = 1º build do Golden Path, com repo e dados
sintéticos controlados) exige:

1. Probe real no Hobby com template 2vCPU/4GiB (e confirmação de que template custom existe no
   plano) — economia congelada só depois.
2. Build representativo completo ≤45 min, P50/P95 medidos.
3. Pico de RAM/disco com Pi + PG17 + Chromium + build.
4. Egress deny-by-default comprovado (incl. redirects e portas não-HTTP).
5. Chave LLM com `expires_at` + spend cap confirmados provider-side (OpenRouter suporta),
   injeção fora de template/snapshot.
6. `echo`/`/proc`/filesystem/logs provando ausência de segredo durável.
7. Fluxo git bundle SYNC→SHARE + importação em quarentena funcionando.
8. `BuildValidationDatabase`: paridade PG17/extensões/ICU/roles + testes negativos + tempo até
   pronto + teardown + porta fechada.
9. RunPreview privado com WebSocket/HMR via proxy do hub, sem URL anônima.
10. Falha do hub/WSL: TTL, expiração de chave, reconciliação de órfãos, bundle não coletado.
11. Conformance de eventos, cancelamento, processo filho, teardown.

**Roteamento proporcional de falha** (congelado): falha localizada dentro do envelope aprovado →
corrige/reprova o componente · falha que aciona removal condition do E2B → NÃO ativa; qualifica
challenger · falha que altera invariante/threat model/premissa econômica → replan/emenda da
C-008. Propriedades ELIMINATÓRIAS do substrato (não "detalhes corrigíveis"): egress fail-closed,
git recuperável, ausência de segredo durável, Pi funcional, custo/recursos viáveis.

## O que NÃO vamos fazer

- **Não** proxy de inferência (gatilhos no componente 4).
- **Não** escada de créditos implementada (E2B único; Daytona/Modal = challengers/nova decisão).
- **Não** multi-conta em provider para renovar crédito (viola ToS; trocar de provider é o
  caminho legítimo e o seam torna barato).
- **Não** `PreviewEnvironment` estável agora.
- **Não** self-host E2B OSS/Firecracker antes de servidor caseiro + conta que justifique.
- **Não** Best-of-N agora (seam registrado nos tópicos 9/10 — `executeCandidate` é meio caminho).
- **Não** snapshots/volumes/template builder no domínio comum do `SandboxProvider`.

## Consequências (propagadas nesta data)

- [04-runtime-agente.md](04-runtime-agente.md): adendo — bridge hub-local↔worker-remoto,
  desconexão, teardown, SYNC→SHARE mediado.
- [06-registro-artefatos.md](06-registro-artefatos.md): adendo — bundle em quarentena +
  validação final hub-side antes do deployment atômico.
- [07-camada-dados.md](07-camada-dados.md): adendo — `BuildValidationDatabase` × DEV/QA
  autoritativos.
- [08-integracao-externa.md](08-integracao-externa.md): adendo — worker cloud jamais recebe
  Connection/credencial de ERP; consultas a dado real só via Gateway.
- [03-requisitos.md](03-requisitos.md): revisão pós-C-008 (agency, RunPreview, invariante
  desdobrado, database sintético).
- AGENTS.md: clarificação de que a governança ARR/M2 é legado MNFS (C-000) e não bloqueia
  probes Conexus.
- Tópico 13: UI de observabilidade herda métricas P50/P95 + custo por run.

---

# REGISTRO HISTÓRICO — C-004 (superseded pela C-008 em 2026-08-11)

**Status original: DECIDIDO — C-004, ratificado pelo operador em 2026-08-11 (mesma data,
anterior à análise Factory in a Box).** Conteúdo preservado verbatim como histórico; normativos
sobreviventes listados na matriz de supersessão acima.

Fontes: 3 pesquisas internas (gerenciados, self-host, alternativas baratas — preços verificados na
web em 2026-08-10/11) + 2 rodadas de pesquisa externa independente (ChatGPT: relatório inicial +
[alinhamento](pesquisa-externa-sandbox-alinhamento.md)) + docs primários confirmados via Context7.
Evidência prática: spike AS-02 ([plano](../superpowers/plans/2026-08-02-as-02-local-pi-sandbox-wsl2.md) ·
[aceite](../acceptance/2026-08-02-as-02-local-pi-sandbox-wsl2.md)). Herda [C-002](04-runtime-agente.md)
(hub soberano + workers Pi frescos) e [C-003](03-requisitos.md).

## A decisão em uma frase (histórica)

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

## Decisão por componente (histórica)

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

## O que NÃO vamos fazer (anti-overengineering — histórico)

- **Não** construir inference gateway agora (só no gatilho Modal).
- **Não** manter 3 adapters de sandbox — 1 ativo + próximo por gatilho.
- **Não** torneio simétrico de topologias: B é incumbente provado, A é challenger com hipótese de eliminação de machinery.
- **Não** montar infra de nuvem (Fly/Vercel/domínio) antes do gatilho — decisão é papel, não infraestrutura.
- **Não** multi-região, SOC2, threat model formal, Kubernetes, Firecracker próprio na fase 1.
- **Não** usar sandbox de execução como preview.

## Consequências (históricas)

- Custo mensal hoje: **US$ 0**. Trabalho novo hoje: atualizar pin do SRT e ligar masking — resto já existe do AS-02.
- Identidade de execução (C-002) ganha campos `sandboxProvider` + `sandboxId` por ActorRun.
- Conexus Worker Eval (QUA-4) roda idêntico nos dois substratos — é o instrumento de comparação A×B no spike.
- Tópico 5 (registro de artefatos) e 6 (camada de dados) herdam: acesso a Postgres do projeto via Capability Gateway, nunca credencial no sandbox.
- Tópico 13 (observabilidade): eventos do worker → hub via bridge fina (local: IPC; Vercel: HTTP/SSE autenticado) — reconexão reconstrói do estado do hub, nunca da memória do agente.
