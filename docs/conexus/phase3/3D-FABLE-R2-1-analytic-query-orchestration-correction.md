# 3D-FABLE-R2.1 — AnalyticQuery Orchestration Correction

**Status:** REVIEW / NÃO-AUTORITATIVO — adendo corretivo à R2  
**Fase:** 3D — Dependency Architecture, pré-decisão 3D-03  
**Revisor:** Fable  
**Corrige:** `3D-FABLE-R2-application-orchestration-review.md` §4.5, §5, §10.6  
**Importante:** não constitui C-018, não altera LEDGER nem decisões aprovadas, não autoriza implementação.

---

## 1. Verdict

**A contradição apontada pelo operador é real e o `AnalyticQueryUseCase` compartilhado é estruturalmente inalcançável.** R2 recomendou simultaneamente (i) um use case L7 compartilhado pelas surfaces `PUBLISHED_APP` e `AGENT_RUN` e (ii) a regra de que módulos nunca invocam a application layer (§6.1/F-R2-1). As duas invocações de AnalyticQuery nascem **dentro de módulos** — o loop de tool do PAR (L5) e a serving boundary do MAR (L6, 3C-15) — não em boundary L7. Não existe caminho até o use case sem módulo→L7, loopback HTTP, service locator ou nova DIP, todos proibidos.

**Correção: `AnalyticQueryUseCase` RETIRADO. A forma menor correta é sequenciamento caller-side com arestas descendentes diretas:**

```text
PAR → Brain + Gateway     (arestas já aprovadas em 3D-01 §16)
MAR → Brain + Gateway     (Gateway existente; Brain = UMA aresta estreita nova)
```

A lista fechada F1 passa de oito para **sete** use cases. `BrainHealthProbeUseCase` sobrevive ao mesmo teste (§5). O deletion test da R2 §3 é refinado no §6 conforme solicitado.

Regra geral extraída (fecha a classe do erro, não só a instância): **a application layer é control-plane-only. Runtime surfaces (serving do MAR, tool loop do PAR, job execution) alcançam capabilities somente por arestas diretas descendentes.** Qualquer futuro "use case" alcançável a partir de uma runtime surface é automaticamente suspeito pelo mesmo argumento.

---

## 2. O call/import graph concreto nas duas surfaces

### 2.1 `AGENT_RUN` (respeitando 3C-10 e 3D-02 §5)

```text
Mastra agent loop                                [PAR internals]
  → typed analytic tool (ToolProjection compilada; input = request tipada
    com IDs do Brain — LLM nunca envia SQL, C-011)
  → PAR tool wrapper:
      1. Brain.compileAnalyticQuery(request,
           brain-binding ref da COMPOSIÇÃO PINADA DO RUN)     PAR → Brain   [existente]
         → RestrictedSemanticPlan
           {physical read plan, bound params, caps aplicados,
            output mapping + caveats resolvidos na compilação}
      2. Gateway.executeAnalyticRead(plan, AgentExecutionContext)
                                                              PAR → Gateway [existente]
         → resultado bounded (role read-only, ceilings físicos)
      3. resposta semântica = aplicação determinística do output
         mapping carregado pelo próprio plano (função pura)
```

### 2.2 `PUBLISHED_APP` (respeitando 3C-15 e 3D-02 §5)

```text
Browser → runtime SDK request → MAR              [serving boundary, 3C-15]
  1. serving context + principal via I&A                      MAR → I&A     [existente]
  2. Brain.compileAnalyticQuery(request,
       brain-binding ref pinada pela RELEASE ATIVA)           MAR → Brain   [ARESTA NOVA]
  3. Gateway.executeAnalyticRead(plan, ServingContext)        MAR → Gateway [existente]
  4. output mapping determinístico → resposta ao SDK
```

Verificações:

- **DAG:** `MAR(L6) → Brain(L2)` e `PAR(L5) → Brain(L2)` são descendentes; zero ciclos; zero reverse imports; zero DIP nova; zero locator; zero loopback.
- **Fonte de binding por surface (3D-02 §5 / F-R1-2) preservada:** o caller fornece o binding ref conforme sua regra de surface — release-pinada no MAR, run-pinada no PAR. Brain compila contra a ref recebida; não escolhe fonte.
- **Plano confiável preservado:** compile roda in-process invocado por código do Hub; browser/LLM fornecem apenas a request tipada. Mesma garantia da forma anterior.
- **Interpretação sem terceira chamada:** o mapping semântico/caveats é resolvido **na compilação** e viaja dentro do plano (determinístico). Se um helper `Brain.interpret(plan, rows)` existir, é função pura — não muda o grafo.

---

## 3. Comparação adversarial das alternativas

| Forma | Custo estrutural | Veredito |
|---|---|---|
| **A. `AnalyticQueryUseCase` L7 compartilhado** (R2 §4.5) | inalcançável: exigiria PAR→L7 e MAR→L7 (viola R2 §6.1/F-R2-1), ou loopback HTTP, ou dispatch dinâmico | **morta estruturalmente** |
| **B. Caller-side sequencing** — `PAR → BRN+GW`, `MAR → BRN+GW` | 1 aresta estreita nova (`MAR → Brain`); duplicação de ~3 linhas de sequência por surface | **ADOTAR** |
| C. DIP: Gateway define porta `SemanticPlanCompiler`, Brain implementa | segunda inversão de domínio — 3D-01 admite exatamente uma (approval); porta sem classe de falha própria = cerimônia | rejeitada |
| D. Módulo compartilhado "AnalyticOrchestration" abaixo de PAR/MAR | módulo novo sem ownership de fato — mini-mediator com nome de módulo; viola 3C-R1/LEDGER §8 | rejeitada |
| E. Duplicar compile no Gateway (GW→Brain) | reverse import proibido (3D-02 §4); Gateway viraria consumidor semântico | rejeitada |

**Por que a duplicação de sequencing da forma B é benigna por construção:** as invariantes não vivem na sequência — vivem nos owners fail-closed. `Gateway.executeAnalyticRead` aceita **somente** `RestrictedSemanticPlan` produzido pelo compile do Brain (contrato de tipo/proveniência; realização em 3F); caps semânticos são aplicados na compilação (Brain); ceilings físicos na execução (Gateway). Um caller que sequencie errado **falha**, não fura. É exatamente o deletion test refinado (§6) aplicado: o que se duplica é ordem trivial; a verdade é irremovível dos owners. Drift entre as duas cópias da sequência não tem onde causar dano silencioso.

Custo real da forma B declarado: a matriz 3D-01 §16 ganha a aresta `Managed Application Runtime → Brain` (projeção estreita: `compileAnalyticQuery` e nada mais — não abre `EffectiveBrainSlice`/proposals/health para o MAR). Alargamento de MAR de 6 para 7 dependências, todas descendentes. Menor que qualquer alternativa viva.

---

## 4. Regra geral que fecha a classe do erro

A distinção que R2 não tinha nomeado:

```text
fluxo de CONTROL PLANE
→ origina em boundary L7 (UI/HTTP/command/job do operador)
→ PODE ser orquestrado por named use case

fluxo de RUNTIME SURFACE
→ origina DENTRO de um módulo (MAR serving, PAR agent/tool loop,
  job execution do Managed Runtime)
→ alcança capabilities SOMENTE por arestas diretas descendentes
→ NUNCA sobe para a application layer
```

Teste rápido para 3D-03: *"quem segura o stack frame inicial deste fluxo?"* Se for um módulo, use case está fora do alcance por construção. Os sete use cases restantes passam (§5); AnalyticQuery era o único da lista de R2 com origem em runtime surface — por isso era o único quebrado.

---

## 5. Re-verificação dos sete restantes sob a regra §4

| Use case | Origem do fluxo | Passa? |
|---|---|---|
| `CreateProject` | UI control-plane (L7) | ✓ |
| `SetProjectBinding` | UI control-plane (L7) | ✓ |
| `QualifyConnection` | UI/admin control-plane (L7) | ✓ |
| `InceptionInvestigation` | UI control-plane (L7) | ✓ |
| `BrainHealthProbe` | operador ou job L7 (health/conformance é operação de control plane, 3C-09; recheck pré-resposta, se adotado em 3G, executa como leitura de health projection pelo runtime — **não** como probe disparada da runtime surface) | ✓ |
| `ComposeRelease` | boundary L7 do fluxo de closure ou job L7 (F-R2-1) | ✓ |
| `PromoteRelease` | UI control-plane (L7) | ✓ |

Nota em `BrainHealthProbe`: se 3G decidir "recheck de health antes de resposta/efeito" (C-011), o runtime **lê** a projeção de health do Brain (aresta descendente `PAR/MAR → Brain`, leitura) — disparar probes físicas continua sendo fluxo de control plane/job. A distinção leitura-de-projeção × disparo-de-probe mantém a regra §4 intacta.

---

## 6. Deletion test refinado (solicitado pelo operador)

A formulação da R2 §3 ("deletável sem perda de correctness") era forte demais: apagaria a razão de existir do `CreateProject`, cuja atomicidade cross-owner **é** contribuição legítima de correctness do use case. Refinamento em duas partes:

```text
(a) LOCALIDADE DE INVARIANTE — obrigatória
    Toda invariante de DOMÍNIO permanece enforçada pelo owner com o use case
    removido. Owners são fail-closed sozinhos: Brain rejeita binding inválido
    na compilação; Gateway rejeita input que não é plano compilado; Release
    FSM recusa passo de promotion fora de ordem; I&A rejeita grant malformado.
    Violação de (a) = defeito: invariante vazou para a camada.

(b) CORRETUDE DE COORDENAÇÃO — legítima no use case
    Ordering e atomicidade CROSS-OWNER de um fluxo específico podem viver no
    named use case como responsabilidade própria (CreateProject: transação
    PRJ+IAM; PromoteRelease: ordem dos passos dirigida sobre a FSM do owner).
    Remover o use case pode perder O FLUXO — nunca corromper um owner
    para dentro de estado inválido.
```

Formulação final:

> **Apagar o use case pode perder o fluxo; nunca pode perder a verdade.**

Aplicação: (a) é verificável em review/3N ("cada invariante citada tem enforcement no owner?"); (b) é o que justifica a entrada na lista fechada (a condição B de 3D-01 §4 *é* correctness de coordenação). A R2 §3/§7 fica lida sob esta precisão.

---

## 7. Delta para a recomendação de 3D-03

Substituições sobre R2 §5/§10:

1. Lista fechada F1 = **sete** use cases (tabela R2 §5 sem a linha `AnalyticQuery`).
2. Lista negativa ganha: **AnalyticQuery nas duas surfaces = sequenciamento caller-side** (`PAR → Brain+Gateway`; `MAR → Brain+Gateway`).
3. Matriz 3D-01 §16: adicionar aresta estreita **`Managed Application Runtime → Brain`** limitada à capability de compilação de AnalyticQuery.
4. Congelar a regra §4 (application layer é control-plane-only; runtime surfaces só descem) — generaliza F-R2-1 e fecha a classe do erro.
5. Congelar o deletion test na forma refinada §6 (duas partes), no lugar da formulação da R2 §3.
6. Congelar a propriedade "Gateway aceita somente plano compilado pelo Brain" como contrato (realização de proveniência/tipo em 3F).
7. Item R2 §10.6 (localização do `AnalyticQueryUseCase`) — **revogado**.

Tudo o mais da R2 permanece como está.

---

*Fim do adendo R2.1. Nenhuma implementação de produto é autorizada por este documento.*
