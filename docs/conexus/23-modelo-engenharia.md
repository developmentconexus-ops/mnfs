# C-017 — Modelo de engenharia + execução agentic (Tópico 17)

**Status: DECIDIDO — ratificado pelo operador em 2026-08-12.**

**Precedência de ID**: o Tópico 10 (estratégia de LLM) foi fechado **sem decisão nova** (commit `6eb49e4`, 2026-08-12) — seleção de modelo é mecanismo de build-time (golden eval, C-010), não decisão de planejamento. O identificador C-017 fica, portanto, atribuído ao Tópico 17. Último registro anterior: C-016.

## Escopo

Este é o último tópico de planejamento antes da reconciliação de arquitetura (Fase 3). A metade **direita** do pipeline já estava congelada por decisões ratificadas e permanece intacta: worker efêmero Pi em E2B por unidade de trabalho (C-002/C-008), bundle de saída em quarentena (C-008), execução real do artefato RUN/OBSERVE/ASSERT (C-013), aceitação exclusiva pelo hub (C-005/C-013), ReleaseManifest imutável + gate humano + promoção content-addressed (C-014), escada de conclusão até SERVED_VERIFIED (C-013). C-017 decide a ponta **esquerda** (como correção é fixada antes de decompor; a passagem plano→unidades) e o modelo de execução: objetos de trabalho, Finding e roteamento de correção, realização do validador independente, proporcionalidade de rigor, entrega de standards ao worker, ciclo de vida das regras do harness.

## Princípio central

> **O Hub controla identidade, autoridade, boundaries, budgets, Evidence, gates e estados terminais; o agente mantém liberdade sobre a tática local** (investigação, ordem interna de trabalho, uso de tools, estratégia de implementação).

Regra anti-overengineering adotada como critério interno do próprio modelo: **nenhuma entidade ou etapa nasce porque outra plataforma possui** — precisa mudar uma decisão mecânica, preservar um fato que seria perdido, ou eliminar uma classe de falha nomeada. A decisão fixa INVARIANTES; valores numéricos citados são referência de calibração (Golden Cases), não lei.

## Invariantes

### 1. Hierarquia de trabalho (work graph do builder)

`Group → Project → Change → Work Unit → ActorRun`, com telemetria em `agent_event` (C-013), é a espinha única de vocabulário do **builder**. O runtime do agente de produção (ConversationTurn etc., C-010/C-013) e o plano de release (PromotionRecord, C-014) são grafos tipados SEPARADOS que compartilham vocabulário de IDs e se correlacionam via `agent_event` — nenhuma árvore única forçada entre domínios. A Fase 3 reconcilia os textos de C-002/C-009/C-013 para este vocabulário.

- **Mission NÃO existe em F1** (gatilho: necessidade real de agrupamento de Changes com aprovação/validação/budget próprios).
- **Milestone NÃO existe em F1** (gatilho: um Change concreto exigir estado intermediário próprio de validação/aprovação).
- **Evidence** = projeção normalizada (referências + digests sobre `agent_event`/CAS), não entidade nova.
- **Handoff** = artefato JSON tipado, não entidade persistida própria.

### 2. Correctness antes da decomposição

Todo Change carrega **assertions de correção verificáveis com ID** ANTES de gerar Work Units:

- Assertion declara: `statement`, `source` (usuário/inferida/descoberta), `kind`, `verification_mode` (executable | served_query | manual), `required_access`, `oracle` (o que decide, com fonte AUTORITATIVA), `expected_evidence` (forma da prova).
- **Answerability operacional**: só é admissível assertion que o verificador consegue responder com o acesso que terá. `required_access` é pré-condição DECLARATIVA — jamais concede capability, amplia tools ou solicita acesso (autoridade segue exclusivamente C-002/C-008); acesso ausente no dispatch ⇒ assertion `BLOCKED` e o hub decide.
- Estados `UNVERIFIED`/`BLOCKED` distintos de FAIL. `verification_mode: manual` ⇒ gate humano obrigatório, nunca auto-aceite.
- **Anti-vacuidade substantiva**: oracle que consome dado exige `witness` mínimo (o que PROVA que exercitou o alvo), cardinalidade/cobertura esperada, identidade de ambiente/dataset (alinhada ao binding C-014), `asOf`/freshness quando temporal, ≥1 caso NEGATIVO quando aplicável. Exigência modulada pelo RigorProfile (CONTROLLED exige tudo; FAST exige witness). Slice vazia/ambiente errado reprova por witness/identidade.
- `NO_CHANGE_REQUIRED` é desfecho válido e verificável (anti action-bias): realiza-se como Work Unit de verificação sem mutação (ver invariante 11).
- Work Unit declara `fulfills:[COR-xxx…]`; nenhuma Work Unit órfã de assertion, nenhuma assertion MUST órfã ao fechar o plano.
- O contrato vive DENTRO do objeto Change e é **ATIVO consolidado**: o worker recebe o contrato atual pinado por `contractRevisionDigest`, nunca o histórico de conversa como autoridade (evidência SpecPath: 35/100 blocos aprovados falham sob histórico equivalente).
- **Autoridade do contrato = hub/Postgres** (registro canônico com CAS, aprovação humana registrada) — padrão C-013 "Postgres autoridade / projeção UI / git artefato". O worker recebe representação serializada digest-pinada no Actor Pack; nada que o worker escreva altera a revisão aprovada; branch carrega cópia informativa, nunca autoridade.
- **Revisão SEMÂNTICA do contrato** (assertions, effects, sets, required_access, plano pinado) ⇒ `HANDOFF_REQUIRED` + nova aprovação humana ANTES de novo dispatch; Work Units/Evidence anteriores ficam `STALE` (via `contractRevisionDigest` obrigatório em Work Unit, ActorRun e Evidence); evidência STALE nunca sustenta aceite. Apenas revalidação puramente mecânica de evidência dispensa novo gate.

### 3. Checkpoint humano em todo Change (HAR-3 intacta)

**Todo Change passa por checkpoint humano antes de codar** (F1, operador único: custo marginal baixo). A proporcionalidade regula a **PROFUNDIDADE** do checkpoint, nunca a existência:

- FAST: aprovação de contrato resumido em 1 tela.
- CONTROLLED: contrato + plano + discovery evidence.
- `NO_CHANGE_REQUIRED` também passa (humano confirma o não-fazer).
- Auto-aprovação de classe fechada = gatilho futuro que EXIGIRIA emenda formal a HAR-3 (registrado no não-construir).

**Discovery antes do contrato (HAR-2)**: Change que toca dado real (ERP/banco/integração) exige etapa de discovery via Gateway ANTES do fechamento do contrato, com evidência HUB/GATEWAY_AUTHORITY; assertions de dado nascem da descoberta, não de suposição (anti "escopo que inventa valores", Mitra OBS). Não-aplicabilidade declarada explicitamente (`discovery: NOT_APPLICABLE` + razão).

**Plano pinado (HAR-7/HAR-4)**: o Change pina por revisão/digest o plano visual (plan-schema v2) aprovado e os documentos de arquitetura/design que o worker deve consumir; dispatch de Work Unit só após plano aprovado (quando o Change exige plano). Sem objeto novo — referências pinadas.

### 4. Validação em camadas com aplicabilidade

Ordem fixa: **mecânico** (compilador/lint/schema/conformance) → **testes/oracle** → **RUN/OBSERVE/ASSERT** no runtime (C-013) → **fluxo de usuário no servido** → **validador LLM fresco** → **humano**.

- "Fluxo de usuário no servido" = **RunPreview por digest / dist servido ANTES da promoção** (camada de validação do candidate). Pós-CAS: exclusivamente GET real + digest servido == esperado (SERVED_VERIFIED, C-013). Smoke funcional pós-CAS segue PROIBIDO (RC-3 intacta).
- Validador agêntico **NÃO é universal**: dispara quando material (regra de negócio sem oracle completo, integração multi-superfície, UX, segurança/autoridade, risco de má-interpretação, refutar alegação do builder); é DESPERDÍCIO quando critério totalmente executável + diff pequeno + sem comportamento de usuário + compilador/teste já decide.
- Realização da independência (ordem de importância): contrato independente > contexto fresco > sem transcript do builder > fisicamente sem write tools > acesso ao servido > Evidence própria.
- **Substrato**: validador do builder = worker Pi FRESCO em E2B (C-002/C-008), fisicamente sem write tools, acessando o RunPreview com **identidade/Connection read-only dedicada** (capabilities derivadas server-side, C-015), sink de efeitos desabilitado para essa identidade (EXTERNAL_EFFECT/WRITE bloqueados no Gateway) + teste negativo de mutação no probe. Seu ActorRun registra `runtime`, `runtimeVersion`, `sandboxProvider/sandboxId`, `toolSurfaceHash`, `actorPackHash`, `contractRevisionDigest`, snapshot de política. Validações não-agênticas seguem nos gates do hub — não são ActorRun.
- Validador = **ActorRun próprio sob budgets** C-009/C-010 (tokens, custo, timeout); o Change reserva orçamento de validação antes do dispatch; estouro = BLOCKED honesto.
- Validador produz Finding, **nunca conserta**, nunca julga edição própria.
- **`validator_report` ≠ `hub_verified_evidence`**: parecer do validador é diagnóstico com trust de produtor (nunca autoridade de aceite); o hub promove evidência só após (a) verificação MECÂNICA independente (re-execução de oracle/conformance/digest) ou (b) decisão humana explícita. Assertion cujo veredicto depende só de parecer de LLM sem oracle executável ⇒ rota humana obrigatória.
- **Aceite exige cobertura total assertion→veredicto**: assertion sem veredicto+evidence_ref = `UNVERIFIED`; UNVERIFIED em assertion MUST **bloqueia aceite**. "Nenhum Finding" nunca é prova — prova é a matriz assertion×verdict completa, composta pelo hub a partir de evidência HUB/GATEWAY_AUTHORITY (`producer_trust`, C-013).
- **Assertion effectful**: oracle NUNCA é inspeção de UI — exige dry-run/test Connection não-produtiva (família testConnection, C-016) OU sink determinístico do Gateway com receipt verificável (`traffic_state`/`ActionReceiptMeta`, C-013/C-016) e zero efeito produtivo; sem oracle seguro ⇒ `BLOCKED` + rota humana sob CONTROLLED. Validador read-only prova negativos; positivos effectful provam-se pelo Gateway/humano.
- Scrutiny frio de artefato **não é gate** (MNFS: crew de 5 revisores lendo artefatos = 0 defeitos; c-CRAB ~40% de cobertura; CodeRabbit 56,3% de rejeição).

### 5. Finding único durável

Objeto tipado que sobrevive ao ActorRun e dirige decisão: `source` (GATE|VALIDATOR|RUNTIME|HUMAN), `type` (CORRECTNESS|SCOPE|SECURITY|CONTRACT|ENVIRONMENT|TOOLING), `severity`, `evidence_ref`, `affected_assertions`, `fingerprint`, `contract_impact` (NONE|LOCAL|INVALIDATES), `suggested_route`, `status`.

- Realização: eventos `finding.*` HUB_AUTHORITY em `agent_event` + **projeção operacional única no Postgres** (padrão checklist C-013: produtor propõe, HUB aplica, Postgres autoridade, UI projeção). Fingerprint canônico versionado; transições por CAS; reabertura = novo Finding com `parent_finding_id`, nunca in-place.
- **Rotas**: correção local (pré-SHARE, contrato+write-set intactos, hipótese nova) × Fix Work Unit (bounded, arquitetura intacta, trabalho separado) × Replan (assertion errada, requisito mudou, fronteira mudou) × humano (ambiguidade de negócio, irreversível, sem autoridade). Produtor SUGERE rota; **tabela determinística** `severity × contract_impact × reversibilidade × autoridade → rota` decide; o hub pode ELEVAR rota (local→fix→replan→humano), nunca rebaixar.
- **Cap por conteúdo**: mesmo fingerprint sem hipótese materialmente nova ⇒ elevação obrigatória, não repete. Referência de calibração: 2 ciclos locais com Evidence nova antes de subir de rota (não ratificado como lei).
- **Orçamento agregado de correção**: o Change reserva limites duráveis no admission ledger (família C-009/C-013) — ciclos de fix totais, ActorRuns de validação, custo, tempo. Fingerprint bloqueia repetição; o agregado bloqueia proliferação de "hipóteses novas". Esgotamento ⇒ `BLOCKED`/`ESCALATED` honesto com estado preservado.
- **Stuck ≠ complete**: estados terminais honestos; exaustão de tentativa nunca vira sucesso (rejeição explícita do anti-padrão documentado pela própria Factory).

### 6. Rigor proporcional calculado (contribuição própria — sem precedente público)

`RigorProfile` = projeção CALCULADA por Work Unit, não FSM nem entidade nova.

- **Piso = max(efeitos declarados no contrato, sinais detectados mecanicamente no diff/artefatos, risco do ambiente-alvo)** — nunca só a declaração do plano.
- Sinais (tabela NORMATIVA no build, ordem total FAST < BOUNDED < CONTROLLED): migration, permission diff, dependency/lockfile diff, código de auth, egresso novo, segredo/binding, rota pública, DML/efeito externo, schema fiscal/financeiro.
- Perfis F1: **FAST** (nada disso; local e reversível → checks determinísticos, sem validador LLM) / **BOUNDED** (engenharia normal dentro de fronteiras aprovadas → Work Unit fresca, bundle, build/teste, runtime quando aplicável) / **CONTROLLED** (qualquer sinal de efeito → gate humano, conformance, validação reforçada, servido real).
- **Fail-closed**: ausência/indeterminação de sinal NUNCA produz FAST — parsing falhou, artefato não classificável, geração dinâmica, SQL construído, efeito composto ⇒ mínimo BOUNDED; sinal de efeito ⇒ CONTROLLED. Desconhecido nunca reduz rigor.
- Recálculo com **detector único** (uma função pura, versão registrada na Evidence) em 3 momentos: dispatch da Work Unit, fechamento do Change, composição do ReleaseManifest — o maior vence.
- Sistema e operador podem ELEVAR; nenhum agente rebaixa abaixo do piso derivado.

### 7. Standards e contexto do builder

Pirâmide de enforcement como lei de alocação: **deny/fronteira física > gate/compilador > restrição de tools > geração/scaffold > guidance consultável**. Regra CRÍTICA vira mecanismo, nunca só doutrina (MNFS: advisory racionalizada 13×).

- **Actor Pack do builder ganha simetria com ContextPack/BrainPack** (C-010/C-011): compilado pelo hub, com digest, budget e `standards[]` (id, digest, source_path, applicability_reason, loaded_mode eager|lazy, owner, review_trigger).
- Standards normativos só de fonte PUBLICADA pelo hub (nunca de conteúdo do Change em julgamento); **standard obrigatório = eager sempre** (falha de compilação se não couber no budget); lazy = exclusivamente consultivo; digests efetivamente carregados registrados no ActorRun e na Evidence.
- **Falha de compilação bloqueia dispatch**: arquivo ausente, include quebrado, comando citado inexistente, digest mismatch, standard obrigatório não compilado. Fecha a metade estrutural do #118 (frescor do conhecimento consultável).
- Frescor semântico NÃO é mecanizável: review triggers + humano; **não construir "IA de frescura"**.
- Progressive disclosure: índice eager, conteúdo lazy (evidência Cursor: −46,9% tokens).
- Entrada de standard novo exige classe de falha nomeada + consumidor mecânico.

### 8. Política fora do change julgado

Gates e política sempre lidos da autoridade (hub/default branch), **nunca do change em avaliação**; escopo de qualquer agente corretivo limitado por RETENÇÃO de tools, não por prompt. (Generaliza Factory droid-action + revisor tool-restrito MNFS.)

- **Snapshot pinado (anti-TOCTOU)**: no dispatch de cada Work Unit e validador, o hub pina digest do conjunto de política/standards/gates aplicável; o Change registra o(s) digest(s) sob os quais foi julgado.
- Mudança SEMÂNTICA de política/standard/gate durante o ciclo ⇒ **bloqueia dispatch E aceite** até novo checkpoint humano (`HANDOFF_REQUIRED`); só mudança comprovadamente não-semântica (formatação/typo com diff auditável) permite revalidação automática — diff aparece no próximo checkpoint.

### 9. Ciclo de vida de regras com remoção

- Métricas APENAS para regras que bloqueiam/roteiam (deny, gate, hook, restrição), como eventos em `agent_event` — contadores derivados por query (applicable, fired, blocked, override, false_positive, duration, last_fired), sem warehouse/subsistema.
- Lifecycle `ACTIVE → OBSERVE_ONLY → DEPRECATED → REMOVED`. Candidata a remoção quando: substituída por mecanismo mais forte, duplicada, muitos overrides/FPs, Golden Eval passa sem ela. Remoção por **ablação controlada** com análise de consequência.
- **NUNCA auto-expiry por N usos sem disparo** (um deny de segurança pode nunca disparar e continuar valendo). Regras de segurança/autoridade/integridade **nunca entram em OBSERVE_ONLY** — remoção só por substituição comprovada por mecanismo mais forte + ablação.
- N/cadência exata = calibração, não ratificado.

### 10. Serial por padrão, paralelismo dirigido

- Sem coordenação contínua worker↔worker, sem locks compartilhados, sem integrador central (Cursor matou os três: 20 agentes → throughput de 1–3; integrador removido como gargalo).
- Work Unit declara `readSet`/`writeSet`/`effectSet` como **metadados declarativos mínimos**; hub reconcilia contra o bundle REAL (reconciliação byte a byte C-008 estende-se aos 3 sets; effect via RUN/OBSERVE/ASSERT); escopo excedente = REJECTED.
- Paralelismo em si **não construído F1** (gatilho: fila medida de Work Units independentes + custo de espera material). Quando ativado: exige disjunção dos 3 sets; set não determinável ⇒ sem paralelismo; efeito não determinável ⇒ mínimo CONTROLLED + prova adicional dirigida.
- Sem engine genérico de workflow: orquestração é "waterfall by handoff" — o hub decide o próximo passo julgando o handoff tipado (schema com implementado/não-implementado/verificação ran-assumed-could-not-run/testes/issues; o que não está no schema morre com o worker), não uma máquina de estados de processo.

### 11. Gate decisivo na unidade certa + matriz de commit

Correção exigida no fechamento da Work Unit e na composição do Change — **nunca por microcommit interno do worker** (Cursor: gate 100%-por-commit serializou o sistema; C-014 já fixa 1 commit canônico por Work Unit).

**Matriz de commit (EMENDA formal a C-014)**:

| Situação | Commit | Prova |
|---|---|---|
| `writeSet ≠ ∅`, sucesso | exatamente 1 commit canônico | bundle + reconciliação |
| `writeSet = ∅, effectSet ≠ ∅`, sucesso | sem commit | receipt/evidence do efeito (ActionReceiptMeta/effect units, C-012/C-013) |
| ambos vazios (verificação no-op) | sem commit | hub prova `baseTreeSha == resultTreeSha` + Evidence do oracle |
| falha/BLOCKED/terminal não-sucesso | nenhum commit | bundle descartado (quarentena C-008 nunca promovida) |

**Interpretação registrada (HAR-1)**: verificação sem mutação NÃO é turno de worker de construção — executa como ActorRun de CLASSE DE VERIFICAÇÃO (contexto fresco, fisicamente sem write tools, identidade read-only). HAR-1 ("1 commit/turno") legisla sobre ActorRuns de construção e permanece intacta; ActorRuns de verificação produzem Evidence, nunca commit.

### 12. Aceite amarrado ao release

- O digest de verificação/validação que o candidate carrega para o ReleaseManifest (C-014) inclui obrigatoriamente: `changeId`, `contractRevisionDigest`, digest do snapshot de política, e a **matriz assertion×verdict completa** (com evidence_refs). Candidate sem essa prova não chega a VERIFIED.
- **`executionContextDigest`** = digest composicional POR REFERÊNCIA: identidade de execução completa do ActorRun conforme C-002 (runtime, runtimeVersion, reasoning config, authBinding, versão do adapter `CodingWorkerRuntime`, modelo/provider pinado) + todos os pins de execução que o ReleaseManifest/candidate referencia (actorPackHash, toolSurfaceHash, scaffold digest C-012, Brain/binding C-011, Connection revision C-014, ambiente-alvo, snapshot de política, contractRevisionDigest). Regra: se um campo é identidade persistida do ActorRun ou pin do manifest, ENTRA por definição — a lista não pode divergir das decisões-fonte. **Exclusões explícitas (aciclicidade, C-014)**: o próprio `executionContextDigest`, `releaseManifestDigest`, `verificationDigest`, `validationDigest` — entram apenas pins de execução, preservando a ordem acíclica de fechamento.
- Qualquer componente mudar após a validação ⇒ Evidence `STALE` ⇒ novo checkpoint + revalidação dirigida antes de aceite/promote.

### 13. Emendas formais e reinterpretações

| Alvo | Mudança |
|---|---|
| **C-003 / HAR-11** (EMENDA) | Multi-modelo por papel permanece. A sub-exigência "validador de provedor DIFERENTE" é substituída por "validador com independência de CONTEXTO" (ordem do invariante 4). Provedor diferente = **gatilho experimental**: ativa se Golden Eval mostrar erros correlacionados E defeitos materiais escapando. Justificativa: 4 corpos de evidência + zero evidência controlada de ganho por provedor diverso (pesquisa externa T10 e T17 convergem). Resolve o resíduo do T10. |
| **C-014** (EMENDA) | Matriz de commit do invariante 11 ("exatamente 1 commit" → condicionado a `writeSet ≠ ∅`). |
| **HAR-1** (interpretação) | Delimitação de escopo: aplica-se a ActorRuns de construção (invariante 11). |
| **HAR-3** (preservada) | Checkpoint humano em todo Change; proporcionalidade regula profundidade. Auto-aprovação exigiria emenda futura. |
| **RC-3** (preservada) | Sem smoke funcional pós-CAS; fluxo de usuário só no RunPreview pré-promoção. |

## NÃO construir F1 (com gatilhos)

| Item | Gatilho de reavaliação |
|---|---|
| Mission / engine de missão | agrupamento real de Changes com aprovação/budget próprios |
| Milestone | Change que exija estado intermediário de validação |
| Frota paralela / fleet | fila medida de Work Units independentes + custo de espera material |
| Validador LLM em toda tarefa | (anti-padrão permanente — aplicabilidade do invariante 4) |
| Validador multi-provedor | Golden Eval: erros correlacionados + defeitos materiais escapando |
| "IA de frescura" semântica | (anti-padrão permanente — review triggers + humano) |
| RAG para standards | budget de inline determinístico estourado com evidência (C-011 G4) |
| Warehouse de analytics de regra | volume que query sobre agent_event não atenda |
| Auto-expiry de regra | (anti-padrão permanente) |
| Auto-aprovação de contrato (classe fechada) | emenda formal a HAR-3 com classe + oracle aceito |
| Marketplace de plugins / builder de agentes custom | F2/SaaS |
| Score de readiness 5 níveis | princípio "repo operável antes de autonomia" preservado como checklist do scaffold |

## Residuais explícitos para calibração no build (não decididos)

1. Tamanho de Work Unit × orçamento de turno (tensão T-3 da pesquisa interna).
2. Valores de cap/ciclos de correção e do orçamento agregado.
3. Fix-ratio esperado para budget (34,4% da Factory sem replicação independente).
4. Cadência exata de promoção de standards.
5. Tabela normativa final de sinais → RigorProfile (estrutura decidida; conteúdo detalhado no build).

## Evidência e convergência

- **Pesquisa interna** ([pesquisa-interna-modelo-engenharia.md](pesquisa-interna-modelo-engenharia.md)): 5 varreduras — MNFS+harness 0.4.0, Mitra medida (76 obs/9h), Factory AI (corpus RMUX corte 2026-05-23 + [mapa público 2026-07-24](../research/FACTORY-AI-HARNESS-REFERENCE-MAP.md)), Conexus C-000..C-016 + evidência MetalDocs/Marketplace Central.
- **Pesquisa externa** (deep research, corte 2026-08-12; prompt em [pesquisa-externa-modelo-engenharia-prompt.md](pesquisa-externa-modelo-engenharia-prompt.md)): P6 CONFIRMA FORTE, P1–P5/P7 REFINA, nada refutado. Fontes-chave: SpecFirst (arXiv 2607.27167, spec antes de sintetizar +6,9–21,3% pass), SWE-RPG (2608.09072, requisito implícito = gargalo nº1), SpecPath (2608.09799, contrato ativo > histórico), TDFlow (EACL 2026, oracle prévio = 88,8/94,3% SWE-Bench), FixedBench (2605.07769, action bias 35–65%), c-CRAB (2603.23448, review agents ~40%), CodeRabbit (2607.03316, 56,3% rejeição), 20.574 sessões (2605.29442, 91,49% correção humana), Wink (2602.17037), Cursor self-driving codebases (2026-02-05), Amp (remoções 2026), Devin/Codex App/Agent Teams (arquiteturas públicas). Sem evidência controlada: ganho de provedor diverso; handoff vs FSM central; auto-expiry.
- **Convergência adversarial**: Codex xhigh, 7 rodadas — 7,6 → 8,1 → 8,3 → 8,3 → 8,4 → 8,2 → **8,6/10**. 39 findings processados (12+10+6+6+3+2 aceitos ou refutados com evidência; 1 refutação aceita pelo revisor: colisão de ID C-017 inexistente).
