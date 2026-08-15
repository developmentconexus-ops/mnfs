# 3D-FABLE-R3.1 — JobQueue Seam Correction

**Status:** REVIEW / NÃO-AUTORITATIVO — adendo corretivo à R3  
**Fase:** 3D — Dependency Architecture, pré-decisão 3D-04  
**Revisor:** Fable  
**Corrige:** `3D-FABLE-R3-remaining-dependency-closure-review.md` §1.3, §3.1, §4 (lista de infra), §10.4  
**Importante:** não constitui C-018, não altera LEDGER nem decisões aprovadas, não autoriza implementação.

---

## 1. Verdict

**A hipótese do operador está correta. `JobQueue` reprovaria no mesmo burden-of-proof que rebaixou o MigrationRunner — R3 a manteve por inércia de R0.** Corrigido:

```text
JobQueue como shared infra port          → RETIRADA
job/v1 execution machinery               → seam INTERNO do MAR
jobs L7 (ex.: varredura de compose)      → mecanismo mínimo próprio quando
                                           houver consumidor concreto; nada
                                           compartilhado nasce antes
qualificação de queue/scheduler substrate → 3H/3L, conforme 3C-15 §7 já dizia
```

**Portas de infra finais: QUATRO** — `CodingRuntime`, `CredentialBackend`, `BlobStore/CAS`, `GitInfra`.

**A matriz de módulos §4 da R3 permanece inalterada** — JobQueue nunca foi coluna de módulo; a correção afeta somente a lista de infra por consumidor.

---

## 2. O teste aplicado (o mesmo do MigrationRunner, F-R3-3)

```text
1. Failure class ATUAL que a porta elimina?
   NENHUMA. O substrate de queue/scheduler nem foi selecionado — 3C-15 §7
   difere explicitamente a 3H/3L. Porta sobre substrate inexistente =
   abstração especulativa de provider, vedada por invariante dura do
   AGENTS.md ("no generic provider abstraction before a second real
   production consumer") e por C-017.

2. Substituto real existente?
   NÃO. Não há implementação a substituir; pg-boss (C-002) é candidato
   histórico, não seleção. A porta abstrairia uma escolha ainda não feita.

3. Segundo consumidor real?
   NÃO. "Jobs L7" é especulativo: ComposeRelease via job é realização
   OPCIONAL (3D-03 §5.6 — a boundary do closure é a alternativa primária).
   E mesmo quando existir, é consumidor de OUTRA COISA: uma varredura
   periódica de plataforma, não o lifecycle de job/v1.
```

Ponto adicional que R3 não nomeou: compartilhar a machinery entre `job/v1` e jobs L7 seria **falsa unificação semântica**. `job/v1` é artefato de produto com lifecycle rico owned pelo MAR — dispatch/enqueue, lease, timeout, retry policy, status, cancel, **version-locking à Release que iniciou o run** (3C-15 §7). Uma varredura L7 é housekeeping de plataforma sem nada disso. Unificar por parecerem "ambos background" é a classe de erro que C-014 (T-7 — não-unificação dos mecanismos de pin) e a própria 3C-15 (recusa de `JobModule`/`SchedulerModule`) já vetaram. Bytes compartilhados não criam domínio compartilhado (3C-14); "background compartilhado" tampouco.

---

## 3. Forma corrigida

```text
MAR
└── job/v1 execution machinery = seam interno
    (mesma categoria do MigrationRunner dentro do Release:
     consumidor único, lifecycle acoplado ao owner, substituto inexistente)
    → realização/substrate qualificados em 3H/3L
    → jobs executando permanecem runtime surface: só arestas descendentes
      (job → Gateway quando cruza capability boundary) — inalterado

jobs L7
└── quando o primeiro consumidor concreto existir (ex.: varredura de
    Changes aceitos sem Release composta), 3H qualifica o menor mecanismo
    suficiente PARA ELE — que pode ou não coincidir com o substrate do MAR.
    A coincidência, se houver, é decisão de qualificação futura, nunca
    pré-unificação estrutural.
```

Gatilho de reabertura (nomeado, como manda o método): uma **segunda** machinery de background com os mesmos requisitos operacionais de `job/v1` (lease/retry/status/version-lock) surgindo fora do MAR → aí sim uma capability compartilhada volta ao Decision Loop com consumidor real.

---

## 4. Delta sobre a R3

1. §1.3: "duas arestas novas de infraestrutura" → **uma** (`MAR → BlobStore/CAS`); `MAR → JobQueue` deixa de ser aresta de infra declarada — vira mecânica interna do MAR.
2. §1.3 e §10.4: portas de infra "cinco" → **quatro**.
3. §4, lista de infra por consumidor: linha `JobQueue (seam-lite) → MAR, jobs L7` substituída por `job execution machinery → seam interno do MAR (substrate 3H/3L)`.
4. §3.1: bullet `MAR → JobQueue (infra)` lido sob esta correção.
5. F-R3-3 ganha um irmão: `JobQueue` registrada como segunda superprodução de porta de R0 herdada por R3 — o burden-of-proof de portas deve ser aplicado item a item no 3D-04, não por lista herdada.
6. Matriz de módulos §4: **sem alteração**. Ordem topológica: **sem alteração**. Prontidão para cross-review final (§10): **mantida** — esta correção reduz o que 3D-04 precisa congelar.

---

*Fim do adendo R3.1. Nenhuma implementação de produto é autorizada por este documento.*
