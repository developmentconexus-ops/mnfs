# Pesquisa interna — Tópico 13: Observabilidade mínima

> Consolidação de 3 varreduras paralelas (2026-08-11): **A** = acervo de decisões C-000..C-012;
> **B** = Mitra medida (referência + log de observação da sonda C-009); **C** = mercado
> (OTel GenAI, ferramentas, padrões de UI de agente, metering BYOK). Estrutura por pergunta:
> Fatos → Confronto → Posição preliminar. Profundidade do tópico: **rasa** — mas ele carrega
> dois requisitos MVP já ratificados (HAR-8, OBS-1) e o achado "de maior retorno" da sonda.

## Q0 — O que T13 realmente decide (escopo)

**Já congelado, T13 não re-decide:**

- **HAR-8 (MVP)**: checklist vivo — unidades de trabalho do hub + eventos do worker → eventos
  tipados → UI marca ao vivo; `tasks.md` durável com status/output + causa-raiz ao final.
- **OBS-1 (MVP)**: custo/tokens por execução (ActorRun), por modelo e por projeto na UI; pós
  C-008 ganha P50/P95 de bootstrap/build/teste + custo de sandbox por ActorRun.
- **OBS-2 (MVP)**: vazio ≠ carregando ≠ falhou, sempre. **OBS-3 (F1)**: log de turno
  estruturado consultável.
- **C-010 comp.14**: trace = eventos estruturados sempre, nomes OTel `gen_ai.*`, custo gravado
  na escrita, mensagens 1× referenciadas, raw fora do trace principal, captura completa
  opt-in/cifrada/TTL, `capturePolicyId` dia 1. NÃO-construir: Langfuse/exporter OTel real até
  gatilho "UI de trace além do Postgres". **Trace mora no Postgres do hub por decisão.**
- **C-010 comp.13**: budgets por unidade (8 campos, incl. `maxCostUsd`) pré-efeito; usage
  ausente nunca vira custo zero (reserva conservadora + reconciliação).
- **C-011 §10**: health = eventos append-only + reducer versionado; projeção reconstruível;
  `lastSuccessfulCheck` + stale — ausência de execução nunca preserva verde.
- **C-012 §11/§13**: ReadDataMeta/ActionReceiptMeta, coverage união fechada, unknown ≠ 0, UI
  exibe decisão do runtime e nunca reinterpreta health.
- Heranças nomeadas: C-006 → alarme "último backup ok" + status `sync_state`; C-008 → métricas
  P50/P95 + custo por run; C-009 pontos 2/4/6/11/13 → cobertura por evidência positiva,
  "escrita sem leitura" como alerta contínuo, falha de credencial ANTES do envio.

**T13 decide (buracos reais, varredura A):** onde/como o trace persiste (tabelas, retenção,
GC); rollup de custo e convivência de 3 contabilidades; vocabulário dos DOIS regimes de
"turno"; schema do evento de checklist e autoridade da lista; autoridade e ownership do
`tasks.md`; superfície de consulta do log (OBS-3); agregação das 4 máquinas de estado numa
tela de status; alarme sem canal externo (dispatch deferido C-007); mecanismo de "escrita sem
leitura"; representação de custo estimado×reconciliado; console do hub (quem é dono).

## Q1 — Log de turno: formato, granularidade, correlação

**Fatos (B — Mitra medida):** unidade = turno; rodapé real `10/08/2026 23:11 in: 108.5K ·
out: 1.2K` + contador de tools (OBS-05, ADOPT explícito p/ T13). Dois níveis: `turn_end
{turnDurationMs, toolCount, commitHash, costUSD}` + `taskUsage` por sessão
{inputTokens, cacheRead, cacheCreation, output, costUSD, authMode}. `commitHash` dentro do
turn_end amarra custo a artefato git. Sessão real: 322 mensagens (93 text / 227 tool_activity /
1 build_status / 1 turn_end), 133 min, um `taskId`. Fonte durável ≠ transporte: Firestore
guarda o turno, WS é caminho quente; **fim de turno detectado pela fonte durável**, não pelo
socket (OBS-12). Defeitos medidos: `metadata` string-JSON-dentro-de-JSON com try/catch
(REJECT); tool input truncado exigindo regex tolerante (C4); histórico devolve tool call como
texto cru (C5).

**Fatos (C — mercado):** JSONL append-only por sessão = padrão de referência (Claude Code);
tabela de eventos/observations = padrão SaaS; os dois coexistem e cobrem usos diferentes
(replay/debug × query). Correlação por request/turn id = item nº1 da lista "impossível de
retro-instalar". OTel GenAI ainda "Development" — valor está no vocabulário, não no stack.

**Confronto com acervo (A):** C-010 já fixa Postgres + `gen_ai.*` + mensagens 1×. A palavra
"turno" está sobrecarregada: turno do worker (ActorRun, SYNC→BUILD→SHARE, ≤45min) ≠ turno de
conversa do agente (in/out tokens). Envelope C-005 já dá `executionId`; C-012 §7 já o entrega
ao cliente via `RuntimeClientError`.

**Posição preliminar:** tabela(s) append-only no Postgres do hub com vocabulário `gen_ai.*`
nos nomes de campo; payload jsonb; evento **tipado na origem** (nunca truncar input — se
grande, referenciar por id, lição C4/C5); id de correlação atravessa UI↔evento↔chamada↔tool
desde a primeira linha. Nomear os dois regimes (ex.: `WorkerTurn` × `ConversationTurn`) e
decidir se compartilham tabela. JSONL como segunda persistência: avaliar contra "Postgres =
verdade única" (provável: transcript exportável derivado, não segunda autoridade).

## Q2 — Custo: contabilidade, rollup, exibição

**Fatos (B):** Mitra mostra tokens no rodapé, não USD (custo USD existe no fio, não localizado
na UI). 99,8% do input de turno longo = cache read (razão cacheRead:input ≈ 16.000:1); custo
real dominado por tempo de parede de I/O, não token (OBS-51.6). `authMode` no registro de
custo distingue assinatura de API key. Limite de sessão: 3-4 paradas/dia medidas, 2 com
mensagem **consumida com `out: 0`** — modo de falha aparece DEPOIS do envio (C-009 p.13
exige ANTES).

**Fatos (C):** tabela de preços versionada como dado (padrão LiteLLM
`model_prices_and_context_window.json`); custo calculado na ingestão e **congelado no evento**
(Langfuse) — ninguém recalcula histórico; tokens crus são o fato imutável, custo é derivado.

**Confronto (A):** três contabilidades em unidades incompatíveis já congeladas: custo LLM
hub-side por chamada com reserva+reconciliação (C-010), spend cap provider-side por ActorRun
sem reset (C-008 comp.3), tempo LIGADO de sandbox incl. espera de LLM (C-008 comp.10). OBS-1
exige por run/modelo/projeto. Fase 1 = infra US$0 + BYOK — bolsos diferentes p/ builder e app.

**Posição preliminar:** gravar fatos imutáveis por chamada (tokens in/out/cache + model
solicitado×resolvido + provider + authMode); preço via tabela versionada no git (seed
LiteLLM); custo calculado na escrita e congelado, com estado `ESTIMATED | RECONCILED |
UNKNOWN` casando com "unknown ≠ 0" (C-012) e o terceiro estado de verdade (C-009); rollup =
GROUP BY turno→conversa/run→projeto→período, nunca tabela agregada de autoridade própria; as 3
contabilidades exibidas SEPARADAS (LLM ≠ sandbox ≠ caps), nunca somadas silenciosamente. UI:
rodapé por turno padrão Mitra (tokens + USD) + agregado por sessão/projeto. Painel só de token
conta metade da história — registrar duração/parede por passo (já vem de `gen_ai.*`).

## Q3 — Checklist vivo (TodoWrite → eventos → UI)

**Fatos (B):** caminho medido funcionando: `todo` = tipo de primeira classe no stream, `✱`
in_progress / `✓` completed / texto riscado (OBS-11, ADOPT; REJECT do rótulo rotativo
aleatório). Flag `is-live` no grupo de tools corrente. Parâmetro de narração obrigatório no
contrato da tool (`titulo`, descartado pela execução — existe só p/ UI; DECISION-REGISTER
ADOPT). Checklists medidos: 6/13/18 itens; os 13 são template de disciplina, não plano sob
medida.

**Fatos (C):** consenso Manus/Claude Code/Devin: 3 estados, 1 passo ativo, reescrito a cada
mudança; recitation reduz drift (~50 tool calls); UI empacotada existe (Vercel AI Elements —
Task/Tool/Reasoning). Ninguém expõe dashboard de latência ao usuário final.

**Confronto (A):** HAR-8 congela "eventos tipados → UI"; falta schema, autoridade da lista
(worker emite × hub decompõe — HAR-10), ligação item↔unidade de trabalho↔ActorRun, e o destino
de `in_progress` quando o worker morre/bundle não coletado (C-002: reconexão reconstrói do
estado do hub, nunca da memória do agente).

**Posição preliminar:** todo-update = evento tipado no mesmo stream de eventos do turno;
autoridade do ESTADO = hub (Postgres); worker emite proposta de mudança; morte do worker →
itens `in_progress` viram estado explícito de interrupção (nunca congelados em verde-fazendo);
narração por parâmetro obrigatório de tool (padrão `titulo`) em vez de rótulo rotativo.

## Q4 — `tasks.md` durável: autoridade e sobrevivência

**Fatos (B):** conteúdo real medido: tabela de tasks com status/output, log de correções com
causa-raiz, revisão item-a-item contra o prompt original, seção "Não incluído" (4.637 chars).
Usado como registro de estado: "não coube" registrado como pendente (OBS-71); lacuna conhecida
na MESMA tabela das que passam (OBS-65). **Argumento decisivo (OBS-77.1 ⭐⭐⭐⭐⭐):** após 4º
corte de contexto, proibições sobreviveram, **propósito não** — agente re-derivou intenção de
arquivo errado e publicou 2 SFs indevidas. "Se o objetivo precisa sobreviver, tem de estar num
artefato que o agente **releia**, não num resumo que ele **herde**."

**Confronto (A) — maior tensão do tópico:** dois precedentes congelados opostos: C-011 ("git =
publicado, Postgres = operacional; status não resolve a favor do git") × C-012 §3 (migration
ledger git-first, "Postgres projeta, nunca autoridade única"). Mais: C-008 comp.5 — só
sobrevive o que entra no commit e passa diff de paths (status do turno que FALHOU nunca
chega); C-012 §4 — arquivo sem classe de ownership = falha (tasks.md mutável não cabe em
GENERATED nem PLATFORM-CONTRACT; APP-OWNED fica fora da atestação); HAR-4 — agente precisa
reler no workspace.

**Posição preliminar (a validar na externa/Codex):** separar as duas funções que hoje moram no
mesmo nome. (1) **Estado operacional do checklist** = Postgres/eventos (autoridade), UI deriva.
(2) **`tasks.md` = documento de trabalho do agente no repo do projeto** (memória HAR-4 +
sobrevivência ao corte de contexto OBS-77.1): plano, escopo, causa-raiz, "não incluído" —
escrito pelo worker, entra no commit, classe APP-OWNED. Reconciliação: hub confere no SHARE
que o tasks.md do commit reflete o estado final dos eventos (gate leve), sem promovê-lo a
autoridade. Status de turno FALHO vive só no hub (o arquivo não pode ser o único registro).

## Q5 — Status do sistema e a semântica de "concluído"

**Fatos (B):** "concluído" na Mitra colapsa 3 camadas — feito no sandbox ✅ / persistido fora ❌
/ servido ao usuário ❌ — falha de push virou rodapé, app continuou servindo rotas removidas
(OBS-52). Publicação falha em silêncio; sem status de deploy; "só o hash denuncia" (OBS-72.3).
Estado publicado verificável já tem implementação real medida: build-info carimba commit,
tabela guarda esperado, tela compara — "divergência vira estado visível, não descoberta
arqueológica" (OBS-60.3). Sucesso parcial de primeira classe existe na camada de conector
(`partial_success`, accepted/rejected/reasons) e não é exposto ao artefato do app (OBS-67.1 —
"entrada direta do T13"). Teto silencioso de 2.000 linhas fez a melhor invariante da noite
reportar verde sobre 2/3 do universo (C7): **falsa garantia é pior que garantia ausente**.

**Confronto (A):** requisito duro já congelado: "concluído" só quando o artefato está onde o
usuário consome; falha de publicação reprova o turno. Autoridade = ponteiro CAS único
(C-005/C-012); precedente do lado certo: modelo só REDIGE do receipt (C-010 comp.8). 4 máquinas
de estado independentes sem agregação decidida (health C-011, Connection C-007, backup C-006,
deployment C-005/C-012). Health nunca vira KPI amarelo — UI exibe gate, não reinterpreta.

**Posição preliminar:** quem fecha turno de build = hub, lendo verify + ponteiro CAS — nunca a
declaração do agente; 3 camadas (feito/persistido/servido) sempre distintas em qualquer
superfície; tela de status agrega as 4 máquinas SEM reinterpretar (espelha estado + idade
`lastSuccessfulCheck`/stale); `desconhecido` = terceiro estado em toda métrica; nenhum verde
por ausência de erro. Sucesso parcial (accepted/rejected/reasons) entra no modelo de evento
desde o dia 1 — o modelo já foi validado 2× (conector Mitra + M2 recriou do zero certo).

## Q6 — Alarme, "escrita sem leitura", consulta do log

**Fatos/confronto:** C-006 lega alarme "último backup ok"; C-007 comp.12 deferiu dispatch
TOTAL → **alarme externo bloqueado por decisão; F1 = in-app**. C-009 p.4: "escrita sem
leitura" = detector de maior retorno (pegou 2 regressões invisíveis: tabela escrita nunca
lida → campo nulo em 38.877/38.877; SF registrada nunca chamada) — mas registry C-005 não
guarda leitores/escritores: T13 herda requisito sem suporte de dado. OBS-3 (F1): log
consultável, forma aberta; raw é opt-in/cifrado/TTL → log humano deriva dos eventos moldados.

**Posição preliminar:** F1 alarme = superfície in-app (tela de status + badge), gatilho
nomeado p/ canal externo (aciona dispatch C-007). "Escrita sem leitura": derivar
leitores/escritores dos PRÓPRIOS traces de execução (quem executou artefato que lê/escreve
tabela X) — projeção, sem emenda ao C-005 no v0; emenda só se a projeção se provar
insuficiente. Consulta do log F1 = tela simples filtrável por projeto/conversa/turno/status +
export JSONL; nada de query builder.

## Q7 — Ferramentas externas e telemetria do AI SDK

**Fatos (C):** OTel GenAI = "Development", sem release estável; repo próprio desde jun/2026;
sem atributo de custo monetário; conteúdo opt-in. Langfuse self-host exige
ClickHouse+Redis+S3 (caro p/ solo); LangSmith closed/free 5k traces 14d; Helicone =
proxy+aquisição (sinal amarelo); Phoenix = self-host mais barato, Python-first; AI SDK emite
spans GenAI via `experimental_telemetry`/`@ai-sdk/otel`.

**Confronto (A):** C-010 já bloqueia Langfuse/exporter real até gatilho E exige "telemetria
explicitamente off" na camada AI SDK (r3 item 4); comp.4 lista custo/trace como NOSSOS, não
da lib. **Divergência a resolver:** varredura C sugere usar telemetria nativa do SDK com
exporter custom; C-010 mandou desligar. Leitura provável: o loop é nosso e já emite eventos
estruturados por decisão — telemetria do SDK permanece off e os eventos nascem no loop (zero
dependência do formato experimental da lib); reavaliar só se duplicação de esforço medida.

**Posição preliminar:** nenhuma ferramenta externa F1; vocabulário `gen_ai.*` como nomes de
campo próprios; eventos emitidos pelo nosso loop (não pela telemetria do SDK); exporter OTel
real permanece gatilho C-010.

## Q8 — Console do hub (onde essa UI vive)

**Confronto (A):** C-002 §4 desenha "plano aprovável · checklist · progresso · custo" na
CONEXUS WEB; C-012 decide o scaffold do APP GERADO, explicitamente não o console do hub.
Buraco real: stack/ownership/gates do console não têm dono.

**Posição preliminar:** console do hub REUSA as decisões de engenharia do C-012 (mesma stack,
mesmos gates aplicáveis) sem passar pelo pipeline de app gerado; declarar isso em 1 parágrafo
no T13 em vez de abrir tópico novo. Padrões de UI: rodapé de custo por turno (OBS-05), todo
de primeira classe (OBS-11), tool calls colapsáveis com narração, 3 camadas de "concluído".

## Correções à nossa direção (o que as varreduras mudaram)

1. **"Log de turno" no singular esconde dois regimes.** WorkerTurn × ConversationTurn têm
   chaves, custos e ciclos diferentes; tratar como um só repetiria a sobrecarga que a Mitra
   tem com `taskId`.
2. **`tasks.md` não é o checklist.** São duas funções: estado operacional (hub) × memória
   durável de propósito (repo). OBS-77.1 prova que a segunda é obrigatória; a primeira já é
   HAR-8. Fundir as duas foi o erro de leitura da nossa direção original.
3. **Custo por turno na UI é padrão validado, mas token não basta** — turno longo é dominado
   por cache read e tempo de parede; USD + duração precisam aparecer, e `authMode` importa.
4. **Sucesso parcial não é feature de pipeline, é modelo de evento** — accepted/rejected/
   reasons validado 2× de forma independente; entra no vocabulário base.
5. **O modo de falha de credencial tem de aparecer ANTES do envio** (C-009 p.13) — a Mitra
   consome a mensagem com `out: 0`. Precisa de pré-cheque de janela/limite no loop.
6. **Telemetria do AI SDK: não usar** — decisão C-010 já tomada; eventos nascem no nosso loop.
   A sugestão da varredura C (exporter custom sobre telemetria do SDK) fica registrada como
   alternativa se o custo de emitir manualmente se provar alto.
7. **"Escrita sem leitura" sem emenda ao C-005** — projeção derivada dos traces cobre o v0.

## Rascunho de decisão em 1 página (pré-externa)

1. **Trace**: tabela(s) append-only no Postgres do hub; vocabulário `gen_ai.*` nos campos;
   payload jsonb; input de tool nunca truncado (referência por id quando grande); mensagens 1×
   referenciadas (C-010); retenção: manter até doer, GC por política simples; captura raw
   opt-in/cifrada/TTL já decidida.
2. **Correlação**: `conversationId|taskId` + `turnId` + `agentRunId|actorRunId` +
   `executionId` + `effectExecutionId` atravessam tudo desde o dia 1.
3. **Dois regimes nomeados** de turno; fim de turno detectado pela fonte durável (Postgres),
   nunca pelo transporte.
4. **Custo**: fatos imutáveis por chamada; tabela de preço versionada no git; custo congelado
   na escrita com estado ESTIMATED/RECONCILED/UNKNOWN; 3 contabilidades separadas; rodapé por
   turno + agregado por sessão/projeto em tokens E USD.
5. **Checklist vivo**: todo-evento tipado, autoridade hub, interrupção explícita; narração por
   parâmetro de tool.
6. **`tasks.md`**: documento de trabalho no repo (APP-OWNED, sobrevive ao corte de contexto),
   status operacional no hub; gate leve de reconciliação no SHARE.
7. **"Concluído"**: 3 camadas distintas; fecha pelo hub via verify + ponteiro CAS; sucesso
   parcial de primeira classe; nenhum verde por ausência; `desconhecido` = terceiro estado.
8. **Status/alarme**: tela única agregando 4 máquinas sem reinterpretar; stale por
   `lastSuccessfulCheck`; alarme in-app F1 (dispatch = gatilho C-007).
9. **Pré-cheque de credencial/janela antes do envio** (requisito C-009 p.13).
10. **NÃO construir F1**: Langfuse/exporter OTel (gatilho C-010), dashboards de latência,
    alerting externo, sampling, evals em CI, retenção multi-tier, query builder de log.
