# C-016 — Segurança proporcional F1

**Status:** RATIFICADA (12/08/2026) · **Tópico:** 14 · **Convergência Codex:** 8,2 → 8,8 (2 rodadas)
**Insumos:** [pesquisa interna](pesquisa-interna-seguranca-proporcional.md) (3 varreduras) + pesquisa externa (corte 12/08/2026: OpenSSF jul/2026, pnpm, RFC 9700, NIST 800-63B, Tailscale, ANPD, ASVS 5.0/AISVS 1.0, LLMail-Inject/NAACL 2025) + diretriz de proporcionalidade do operador.

## 1. Decisão em uma frase

O mínimo profissional de segurança F1 é fechado com 6 invariantes novos (admissão de dependência, patch do hub, egresso em duas superfícies, HTTPS na tailnet, credencial viva, erro sanitizado) + resíduos do compilador + postura LGPD, consolidados num baseline de 16 propriedades testáveis — decisões fixam invariantes; parâmetros concretos são referência não-ratificada.

## 2. Escopo real do tópico

A pesquisa interna mediu: o escopo nominal (credencial server-side, bind params, tenancy) já estava ~85–90% congelado por C-005..C-015; todas as 9 falhas S da Mitra têm resposta ratificada. SEG-4 ("sem SOC2 theater, sem threat model formal") é a decisão-mãe: esta decisão cabe dentro dela. O que C-016 decide é somente o que nenhuma decisão cobria.

## 3. Supply chain do app gerado — gate de admissão de dependência

- **Install determinístico:** lockfile congelado (`--frozen-lockfile` sempre no pipeline; agente nunca roda install solto), integridade verificada com falha explícita em checksum divergente.
- **Quarentena temporal:** versão recém-publicada não é instalável antes de uma janela mínima (referência: 7 dias; mecanismo nativo do package manager — ADOPT, não reconstruir no hub). **Lane de exceção para security update:** bypass explícito, versão exata, revisão humana; critérios: CISA KEV aplicável, malware confirmado no pacote instalado, CVE crítica em dependência direta e alcançável, falha de integridade do package manager/registry.
- **Dependency diff (emenda C-014):** dependência fora do catálogo da plataforma = `DEPENDENCY_PROPOSAL` no gate de promote — diff legível (pacote, capability, motivo, mudanças diretas+transitivas, scripts/binários nativos/licença), aprovado por humano. Irmão do permission diff C-015 §8.
- **Catálogo por capability:** entrada = pacote + range + capability + scripts permitidos + ambientes; nunca lista numérica; conteúdo emerge do scaffold e dos golden cases (não ratificado).
- **Autoridade de install script é do hub, nunca do app:** scripts permitidos vêm exclusivamente do catálogo pinado pelo hub (`package@version` + digest do conteúdo que roda no build); metadata do app gerado não concede execução — script fora do catálogo = install falha fail-closed. Instalação sempre em quarentena: sandbox E2B (C-008), sem credencial durável, egresso deny-all+allowlist — o pior install script comprometido não alcança segredo nem rede aberta.
- **Scan OSV/audit** roda no dependency diff e no release; achado não-crítico = Finding com prazo, nunca bloqueio automático; bloqueio automático só para malware confirmado / KEV / crítica direta alcançável.

## 4. Patch do próprio hub e do template

Renovate (ou equivalente) semanal agrupado. Automerge só para conjunto de baixo risco **declarado** — "é patch" não concede automerge por si. Dependências sensíveis (auth, crypto, driver de banco, sandbox, package manager, Gateway) sempre têm revisão humana, mesmo patch. Security update fura a quarentena pela lane do §3. Major sempre manual.

## 5. Egresso em duas superfícies

Invariante único com duas metades:

- **Servidor — Gateway-only por construção:** todo egresso de rede em produção passa pelo Gateway do hub via Connection registrada; artefato gerado não tem primitiva de rede própria. Probe cobre TODAS as primitivas (fetch, http/https, net/tls, dns, WebSocket, child_process, native addon). No Gateway, destino e redirect são validados contra origem exata allowlisted da Connection. Sem DNS pinning/metadata blocking novos (seria emenda a C-005 — não fazemos; gatilho: primeiro destino dinâmico legítimo). Allowlist de egresso de runtime = NÃO construir; gatilho: primeira superfície de código server-side arbitrário.
- **Browser — self-only por CSP:** app publicado restringe ORIGENS DE REDE a `'self'` em todas as diretivas de carga/envio (`connect-src`, `img-src`, `script-src`, `font-src`, `form-action`, `worker-src`, `frame-src`, `media-src`) — fecha a CSP da C-012 §16 como invariante de egresso, não só de XSS; **preserva a concessão isolada `style-src-attr` já ratificada em C-012** (valores numéricos tipados, nunca strings de usuário/ERP). Prova: teste negativo no navegador (fixture tenta `img`/`sendBeacon`/`form` para origem externa → bloqueado; mesmo mecanismo do CX-SCAFFOLD-V0-01 item 6). Anti-exfil do chat (C-010 §15) permanece camada própria.

## 6. HTTPS na tailnet — emenda à C-015 §5

- HTTP permitido **só em loopback/localhost**.
- Acesso browser de outra máquina = **HTTPS obrigatório** (tailnet + certificado automático `.ts.net`; nome de máquina não sensível — vai a Certificate Transparency).
- Razão: WireGuard cifra o transporte, mas o browser vê HTTP — `__Host-`, `Secure`, secure context e passkeys futuros seriam fisicamente falsos. Esta emenda corrige a contradição interna da C-015.
- Forma final: `localhost HTTP | tailnet HTTPS`. Tailnet HTTP deixa de existir como estado normal. Fail-closed de bind público sem TLS permanece. Banner/opt-in de exposição tailnet permanece.

## 7. Credencial viva (fecha a delegação da C-007)

- **Entrada:** credencial entra SÓ por rota de plataforma write-only com seleção explícita de conexão+ambiente; chat/agente nunca recebem segredo — agente que precisar de conexão nova gera LINK para a rota (anti-S4 / OBS-02/03 Mitra). Valor nunca é ecoado.
- **Blast radius:** descoberto DA API no testConnection (conta real, scopes, empresas alcançáveis), nunca só da descrição digitada; registrado no momento da conexão.
- **Rotação de refresh token rotativo = DESENHO REGISTRADO com gatilho, não construção F1.** Fato: Sankhya F1 usa client credentials; nenhum provider com refresh token está no escopo congelado. Construção F1 = entrada write-only + testConnection com blast radius + `key_version` no vault (já C-007). Gatilho: primeira Connection cujo provider use refresh token rotativo (ex.: Mercado Livre). Quando ativado, requisitos vinculantes: máquina de estados `READY(gen=N) → ROTATING → {READY(gen=N+1) | REAUTH_REQUIRED | OUTCOME_UNKNOWN}`; `attempt_id` por tentativa; LEASE com expiração em ROTATING (estado obsoleto recuperável por reconciliação temporal — nunca preso); CAS por UPDATE condicional (`rowsAffected=1`); transação Postgres nunca aberta durante chamada de rede; `key_version` (chave AES do vault) ≠ `refresh_generation` (geração OAuth); OUTCOME_UNKNOWN sem retry automático — reconciliação não destrutiva, e o desfecho honesto pode ser REAUTH_REQUIRED (provedor que não expõe recuperação de sucessor — nunca prometer recuperação inexistente); retry direto só se o transporte provar que a requisição não foi enviada.

## 8. Erro sanitizado — invariante único

- Detalhe interno (stack, SQL, header, path) **nunca atravessa o Gateway** para browser, agente ou log não-redacted. Resposta externa = erro tipado + correlation ID; trace completo só em log estruturado server-side (redaction C-013 §19 aplica).
- Envelope de erro de integração carrega `traffic_state ∈ {NOT_SENT, SENT_NO_RESPONSE, RESPONSE_RECEIVED}`; status bruto do ator externo só existe com RESPONSE_RECEIVED.
- Apresentação PROIBIDA de nomear ator externo como agente da falha sem RESPONSE_RECEIVED (anti-OBS-72.7 — "o Mercado Livre recusou" quando o ML nunca foi contatado; SENT_NO_RESPONSE também não autoriza).

## 9. Resíduos do compilador + rate limit de `execute()`

- **Compilador de queries fecha de uma vez para todos os apps:** parâmetro em LIKE escapado por default (`%`, `_`, `\`; opt-in explícito para wildcard); ORDER BY só por allowlist de colunas declarada na query (input escolhe da lista, nunca string); teto server-side de paginação. `statement_timeout` permanece higiene (C-006 comp.11).
- **Rate limit de `execute()`:** chave composta conta × classe de operação — taxonomia `READ_CHEAP | READ_HEAVY | WRITE_LOCAL | EXTERNAL_EFFECT | EXPORT`; política por classe; valores calibrados em operação (não ratificados). Armazenamento por criticidade: READ_* = memória (restart zera, aceitável); **EXTERNAL_EFFECT e EXPORT = contador/admissão durável no Postgres** (mesma família do admission ledger C-013 e dos budgets C-009 comp.13 — reutiliza padrão, não cria mecanismo); WRITE_LOCAL durável quando approvalFloor > NONE. Restart não zera limite de efeito. Persistência ampliada por gatilho (2ª instância, quota exata, efeito financeiro).

## 10. LGPD F1

- ROPA gerado do catálogo de sync = status `DRAFT_FROM_TECHNICAL_CATALOG`; campos jurídicos (finalidade, base legal, retenção, compartilhamento) exigem decisão humana — o catálogo projeta, não decide. Base legal típica: execução de contrato + legítimo interesse (consentimento é a base errada para operação interna B2B).
- **Minimização no sync:** coluna pessoal sem consumidor nomeado não é espelhada.
- **Exclusão por classe:** `DELETE_ALLOWED | RETENTION_BLOCKED_LEGAL | ANONYMIZE_ALLOWED`. RETENTION_BLOCKED_LEGAL registra base legal, prazo/revisão, campos que permanecem e derivados/caches que PODEM ser apagados. Retenção fiscal do dado-fonte não justifica retenção indefinida de projeções/índices/logs/embeddings.
- Referência de conformidade: Res. CD/ANPD 2/2022 + guia ANPD de pequeno porte. RIPD/DPO formal = F2 por gatilho.

## 11. Conexus F1 Security Baseline — 16 propriedades testáveis

Nome próprio — nunca "ASVS compliant". Cada item = invariante → fronteira física → probe positivo+negativo → referência externa (ASVS 5.0 L1 / AISVS 1.0 / guia ANPD) com gaps declarados.

| # | Propriedade | Prova mínima |
| --- | --- | --- |
| 1 | Browser remoto só por HTTPS | hub recusa bind remoto HTTP; probe cookie `Secure` |
| 2 | Sessão opaca server-side revogável | flags + hash + teste de revogação (CX-PUB a/b) |
| 3 | Disable de conta encerra poder | DISABLE mata todas as sessões (CX-PUB b) |
| 4 | Membership antes de role | sem membership = 404 indistinguível (CX-PUB r) |
| 5 | RBAC compilado fail-closed | action sem `allowed_roles` reprova deployment (CX-PUB d) |
| 6 | Widening de permissão exige humano | fixture de widening bloqueia promote (CX-PUB e) |
| 7 | SQL e identificadores fechados | bind real + LIKE literal + ORDER BY enum + teto de paginação |
| 8 | Roles físicas mínimas de banco | probes negativos query×DML×owner (C-006) |
| 9 | Segredo durável fora de browser/sandbox/log | sentinel scans + fixtures negativas (C-008/C-013) |
| 10 | Egresso fechado nas duas superfícies | servidor só Gateway; browser self-only por CSP (teste no navegador) |
| 11 | Supply chain reproduzível e declarada | frozen lockfile + quarentena + catálogo de scripts + integridade |
| 12 | Dado externo permanece tainted | fixture adversarial não altera tools/permissions/deps (golden C-009) |
| 13 | Erro público não vaza internals | stack/SQL/segredo nunca no envelope; correlation ID |
| 14 | Efeitos com limite, idempotência e unknown | timeout pós-envio = OUTCOME_UNKNOWN (C-009) |
| 15 | Dados com finalidade, retenção e restore | ROPA aprovado + minimização + restore-test (C-015 §14) |
| 16 | Capability efêmera do sandbox é limitada | TTL ≤ run, escopo, spend cap, não reutilizável, revogável, nunca emitida pelo guest (CX-SBX + fixture de revogação) |

Probes novos nascem só onde não há cobertura (egresso runtime, LIKE/ORDER BY, `traffic_state`, itens do baseline sem probe referenciado); o resto referencia CX-SBX-E2B-01, CX-SCAFFOLD-V0-01, CX-OBS-V0-01, CX-PUB-V0-01, CX-REL-V0-01.

## 12. Threat model por exceção

Four Questions de Shostack (o que construímos / o que pode dar errado / o que fazemos / ficou bom?) disparadas SÓ por gatilho nomeado: nova trust boundary; acesso público; tenant/audience adicional; credencial ou efeito externo novo; código server-side arbitrário; upload/processamento de arquivo novo; embed; dependência com capability material; armazenamento de dado sensível; mudança de permission surface. **Permission diff C-015 §8 = detector contínuo de ameaça DA AUTORIZAÇÃO** — declarado que não cobre supply chain, XSS, segredo, disponibilidade, upload ou privacidade (não é threat model completo). Disciplina de teste: isca com a forma do caso real (403≠401, OBS-74.2); guarda que não quebra teste não protege o próximo turno (OBS-73.3).

## 13. Emendas a decisões anteriores

| Decisão | Emenda |
| --- | --- |
| C-015 §5 (binding) | HTTP só em loopback; acesso browser via tailnet = HTTPS obrigatório (cert `.ts.net`); tailnet HTTP deixa de ser estado normal. Fail-closed de bind público sem TLS e banner de exposição permanecem. |
| C-014 (gate de promote) | Gate ganha **dependency diff** ao lado do permission diff: `DEPENDENCY_PROPOSAL` com aprovação humana para pacote fora do catálogo; widening de supply chain nunca passa silencioso. |

## 14. NÃO construir F1 (com gatilhos)

| Mecanismo | Gatilho |
| --- | --- |
| Socket/Snyk SaaS | volume recorrente de dependências desconhecidas ou incidente de malware |
| Dependency firewall/proxy próprio | múltiplos apps adicionando pacotes dinamicamente ou registry privado |
| Redis para rate limit | 2ª instância/processo ou quota exata que não pode zerar |
| Firewall de egresso de runtime | primeira superfície de código server-side arbitrário |
| OPA/Cedar/OpenFGA | segundo modelo de autorização que roles fechadas + audience não representam |
| Threat model formal recorrente | ingresso público, multi-tenant, efeito financeiro ou incidente material |
| SIEM/SOC2 machinery | exigência de cliente/contrato ou segunda pessoa operando |
| Vault/KMS externo | segundo host, HA ou master key local inadministrável |
| SAST/DAST enterprise | exposição pública ou falha que os probes deixaram passar |
| Automação completa de RIPD/LGPD | tratamento de alto risco, dado sensível em escala ou exigência ANPD |
| Máquina de rotação de refresh token | primeira Connection com provider de refresh token rotativo (§7) |
| DNS pinning/metadata blocking no Gateway | primeiro destino dinâmico legítimo (emendaria C-005) |

## 15. Vocabulário

- **Gate de admissão de dependência** — decide o que PODE entrar no lockfile; distinto de congelar o que entrou.
- **Dependency diff / DEPENDENCY_PROPOSAL** — item de aprovação humana no promote para pacote fora do catálogo.
- **Quarentena temporal** — versão npm só instalável N dias após publicação; lane de segurança fura com revisão.
- **Catálogo de dependências** — registro por capability (pacote+range+capability+scripts+ambientes), autoridade única de install scripts.
- **Egresso em duas superfícies** — servidor Gateway-only + browser self-only por CSP.
- **`traffic_state`** — `NOT_SENT | SENT_NO_RESPONSE | RESPONSE_RECEIVED`; autoridade sobre o que a UI pode afirmar de ator externo.
- **Conexus F1 Security Baseline** — as 16 propriedades testáveis; nome próprio, com gaps declarados vs ASVS/AISVS.
- **Threat model por exceção** — Four Questions disparadas por gatilho nomeado.
- **DRAFT_FROM_TECHNICAL_CATALOG** — ROPA projetado pelo catálogo de sync, pendente de decisão humana nos campos jurídicos.

## 16. Nota de convergência

Rodada 1: 8,2 (5 falhas: egresso browser não coberto; rate limit em memória para efeitos; máquina OAuth = overengineering F1; autoridade de install script; capability efêmera fora do baseline). Rodada 2: **8,8 — convergência** ("as cinco correções fecham os gaps materiais"), com a ressalva incorporada no §5 (self-only restringe origens de rede; `style-src-attr` da C-012 preservada).
