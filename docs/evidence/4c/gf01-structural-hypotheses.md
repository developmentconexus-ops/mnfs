# 4C GF-01 — Structural Hypotheses

> **Status:** CANDIDATE / 4C-7 / FABLE REVIEW INCORPORATED
> **Block:** `GF-01` — global frame + Workspace/Project navigation
> **Prerequisite:** `4C-F01` RESOLVED / authority-feasibility GREEN.
> **Decision posture:** no hypothesis is `LOCKED`; only the operator may lock the rendered HTML structure.

GF-01 began with one real ambiguity: whether Workspace and Project navigation should coexist as persistent navigation landmarks or one contextual navigation landmark should adapt to current scope. The first rendered H1 exposed useful review findings, now adjudicated in [GF-01 Fable Shell Review Adjudication](gf01-fable-review-adjudication.md).

The earlier 4C-4 reference study remains sufficient. Additional broad research is not required for this revision.

## 1. Constraints

The frame must preserve:

```text
Account/session visibility
human-readable Workspace + Project context
Workspace → Project hierarchy
Projects as primary Workspace destination
Build as primary/default Project destination
Control Plane != Published Application
server-owned authorization
no global Product search authority
no generic Workspace Settings
one usable narrow responsive transformation
keyboard/focus/read-order plausibility
Preview-dominant Build width
contextual Conexus seam without global assistant authority
```

## 2. H1-R2 — Single adaptive rail + breadcrumb-switcher — RECOMMENDED CANDIDATE

Structure:

```text
TOP BAR
Conexus / Workspace ▾ / Project ▾                         Account
          └ Workspace menu can switch Workspace
            + bounded Workspace shortcuts

LEFT RAIL — Workspace context
Projects
Agents
Brain
Connections
People & access
Audit

LEFT RAIL — Project context
Project identity cue
← Back to Projects
Build
PRODUCT
  Data
  Capabilities
  Integrations
  Agents
  Brain
OPERATE / INSPECT
  Releases
  Activity
MANAGE
  Settings

STAGE
current route/surface
+ optional contextual assistant panel seam
```

### Breadcrumb-switcher

Context identity is navigation, not form entry:

```text
Conexus / Metal Nobre ▾ / Budget Analyzer ▾
```

Each segment opens only currently disclosed context choices. Local filtering inside the menu is `LOCAL_UI`, not a global Product search operation.

### Workspace cross-scope mitigation

H1's main cost was one extra navigation step to Workspace resources while inside a Project. The Workspace breadcrumb menu mitigates that without a permanent second rail by exposing bounded navigation shortcuts:

```text
Brain
Connections
People & access
```

This retains one active primary rail and does not move ownership into Project scope.

### Contextual Conexus frame seam

The frame reserves a collapsible right-side cooperation seam for the contextual Conexus assistant. The current surface decides whether the `Ask Conexus` affordance is eligible; GF-01 does not make the assistant global.

Current structural candidate:

```text
wide:    content may cooperate with a pushed panel
medium:  panel may overlay
narrow:  panel may occupy the available viewport
```

Exact thresholds/mode selection belong to the later assistant/surface block. The seam exists now so P-01/P-02 do not need to retrofit the global grid after frame lock.

### Strengths

- one primary navigation landmark at a time;
- breadcrumb expresses Workspace → Project hierarchy with low top-bar noise;
- Workspace menu shortcuts remove most practical advantage of permanent dual rails;
- maximum default width for Preview-dominant Build;
- direct mobile transformation to one navigation drawer;
- Project navigation scales vertically;
- contextual assistant can cooperate with frame layout without becoming global authority.

### Cost / risk

- Workspace shortcuts inside a context menu must remain discoverable;
- Project-name cue in rail may be redundant with the breadcrumb and is explicitly under walkthrough;
- assistant seam adds a frame responsibility, so actual panel eligibility/content must remain surface-owned;
- relative navigation order is still not frequency-backed by `4C-A02`.

## 3. H2 — Persistent Workspace rail + nested Project rail — REJECTED AS LEADING CANDIDATE

Structure:

```text
TOP BAR
context

WORKSPACE RAIL      PROJECT RAIL
Projects            Build
Agents              Data
Brain               Capabilities
Connections         Integrations
People & access     Agents
Audit               Brain
                    Releases
                    Activity
                    Settings

CONTENT
```

### Strengths

- Workspace destinations always visible;
- hierarchy continuously visible.

### Cost / risk

- two navigation landmarks compete for attention and keyboard traversal;
- permanent horizontal cost reduces Build/Preview space;
- denser responsive logic;
- visually suggests two adjacent Product taxonomies rather than a scope transition;
- no evidence that constant cross-scope switching justifies the cost;
- H1-R2 Workspace-menu shortcuts now mitigate H2's only clear advantage.

## 4. Decision matrix

| Criterion | H1-R2 adaptive rail | H2 dual rail |
| --- | --- | --- |
| Human scope clarity | **strong breadcrumb hierarchy** | strong but heavier |
| Build/Preview width | **best** | materially reduced |
| Cross-scope Workspace access | one context-menu action | always visible |
| Keyboard landmarks | **one primary rail** | two persistent rails |
| Mobile transformation | **one drawer** | requires rail merging/cascading |
| Contextual assistant retrofit risk | **seam reserved now** | still needs third-column policy |
| Evidence for permanent dual navigation | none | none |
| YAGNI | **lower structural cost** | higher permanent cost |

## 5. Review carry-forwards that are not GF-01 decisions

```text
Workspace Agents ownership wording
→ W-04 Workspace Agent catalog

Workspace Brain vs Project Brain semantics
→ W-02 / P-02 headings/descriptors

Projects cards vs list/table
→ W-01 competing hypothesis; GF-01 cards are fixture only

pending ApprovalRequest discoverability
→ 4C-S06, primarily P-03 with P-04 / PA-01 cross-check
```

A universal Approval Center remains rejected.

## 6. Responsive candidate

For narrow layouts:

```text
TOP BAR
menu | Workspace / Project breadcrumb segments | Account

NAVIGATION DRAWER
current Workspace + Project identity
scope-appropriate adaptive rail
explicit Back to Projects

ASSISTANT
contextual seam may overlay/full rather than consume a permanent second column

CONTENT
single-column current surface
```

The drawer is the same semantic navigation as desktop, not a separate Product IA.

## 7. Rendered evidence

The revised leading H1-R2 is rendered in:

[GF-01 Global Frame Low-Fidelity HTML Wireframe](gf01-global-frame-wireframe.html)

The artifact is HTML/CSS lo-fi with bounded vanilla JavaScript only to inspect context menus, scope transitions, rail behavior, assistant seam and narrow-layout transformation. It is P8 Evidence, not production frontend or P11 whole-flow proof.

## 8. Operator decision requested

The revised H1-R2 can receive only one of:

```text
LOCKED   — operator accepts this structural baseline
REVISE   — operator identifies a material structural change
REJECTED — operator selects another hypothesis
```

Assistant/tool output does not set `LOCKED`.
