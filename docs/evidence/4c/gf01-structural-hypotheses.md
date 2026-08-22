# 4C GF-01 — Structural Hypotheses

> **Status:** CANDIDATE / 4C-7
> **Block:** `GF-01` — global frame + Workspace/Project navigation
> **Prerequisite:** `4C-F01` RESOLVED / authority-feasibility GREEN.
> **Decision posture:** neither hypothesis is `LOCKED`; only the operator may lock a rendered structure.

GF-01 has one real structural ambiguity: whether Workspace and Project navigation should coexist as persistent navigation landmarks or whether one contextual navigation landmark should adapt to the current scope.

The earlier 4C-4 bounded reference study already supplies enough pattern evidence for this question. No additional external research is required before rendering this block.

## 1. Constraints

The frame must preserve:

```text
Account/session visibility
Workspace human-readable context + switching
Project human-readable context when inside a Project
Projects as primary Workspace destination
Build as primary/default Project destination
Control Plane != Published Application
server-owned authorization
no global Product search authority
no generic Workspace settings
one usable 320-CSS-px responsive transformation
keyboard/focus/read-order plausibility
```

The frame must not consume horizontal space so aggressively that the accepted Preview-dominant Build workspace becomes secondary.

## 2. H1 — Single adaptive navigation rail — RECOMMENDED CANDIDATE

Structure:

```text
TOP BAR
Conexus | Workspace selector | Project context when present | session/account

LEFT RAIL — Workspace context
Projects
Agents
Brain
Connections
People & access
Audit

LEFT RAIL — Project context
← Projects / Workspace context
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

CONTENT
current route/surface
```

The rail changes its destination set when the user enters a Project; the top bar preserves the Workspace and Project context so scope never disappears.

### Strengths

- one primary navigation landmark at a time;
- maximum content width for Preview-dominant Build;
- clear scope transition Workspace → Project;
- mobile transformation is straightforward: rail becomes one labeled navigation drawer;
- fewer simultaneously focusable navigation items;
- Project navigation can scale vertically without horizontal tab overflow;
- Project context does not look like a sibling of Workspace-level shared resources.

### Cost / risk

- Workspace destinations are one navigation step farther away while inside a Project;
- the `← Projects` / Workspace-context affordance must be prominent enough that users do not feel trapped in Project scope;
- current Workspace + Project naming must remain visible in the top bar, which is now possible after `4C-F01`.

## 3. H2 — Persistent Workspace rail + nested Project rail

Structure:

```text
TOP BAR
Conexus | Workspace selector | Project context | session/account

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
current route/surface
```

### Strengths

- Workspace destinations remain one click away from every Project screen;
- Workspace/Project hierarchy is continuously visible;
- may help operators who constantly alternate shared Workspace resources and one Project.

### Cost / risk

- two navigation landmarks compete for attention and keyboard traversal;
- consumes materially more horizontal space from Build/Preview;
- denser and harder to preserve at tablet/mobile sizes;
- risks presenting Workspace and Project destinations as two adjacent product taxonomies rather than a scope transition;
- more responsive states and collapse rules are required before any Product value is gained;
- `4C-A02` does not provide evidence that constant cross-scope switching is frequent enough to justify this permanent cost.

## 4. Decision matrix

| Criterion | H1 single adaptive rail | H2 dual rail |
| --- | --- | --- |
| Human scope clarity | strong if top context is persistent | strong but visually heavier |
| Build/Preview width | **best** | materially reduced |
| Keyboard/navigation landmark simplicity | **best** | weaker |
| Mobile transformation | **one drawer** | requires combining/cascading rails |
| Workspace quick access from Project | one extra step | **best** |
| Evidence for permanent cross-scope access need | no direct need | no direct need |
| YAGNI | **lower structural cost** | higher permanent cost |
| Future Project destination growth | strong vertical scaling | strong but expensive |

## 5. Leading candidate

**H1 — single adaptive navigation rail** is the leading candidate.

Rationale:

```text
accepted primary work = Project Build
Preview should remain dominant
cross-scope switching frequency = not proved
one navigation landmark = simpler
responsive transformation = simpler
Workspace/Project context can now be named truthfully
```

H2 remains a useful falsifier: if rendered H1 makes Workspace-level Brain/Connections/People work too difficult to recover from Project scope, the operator can reject H1 or require a bounded cross-scope affordance without adopting two permanent rails.

## 6. Responsive candidate

For narrow layouts:

```text
TOP BAR
menu button | current scope name | account/session

MENU DRAWER
current Workspace name
current Project name when present
scope-appropriate navigation destinations
explicit “Back to Workspace / Projects” transition

CONTENT
single-column current surface
```

The mobile drawer is the same semantic navigation as desktop, not a separate Product IA. Essential navigation remains reachable without drag gestures or hover.

## 7. Conexus P8 medium decision

The operator rejected a static SVG/image as the primary GF-01 wireframe medium and requires the Conexus 4C structural wireframe to be inspectable as a **low-fidelity browser artifact**.

For current and subsequent Conexus P8 block work:

```text
primary wireframe medium = unbranded HTML + CSS
bounded vanilla JavaScript = allowed only when needed to inspect structure, navigation or responsive behavior
production frontend framework = forbidden in P8 Evidence
static image / SVG = not current wireframe authority
```

This is stricter than the reusable methodology's media allowance and is the current Conexus 4C operator decision. It does not collapse P8 into P11: P8 remains one bounded structural block and does not claim complete cross-flow or backend behavior.

## 8. Rendered/viewable Evidence

Leading H1 is implemented as a low-fidelity browser wireframe in:

[GF-01 Global Frame HTML Wireframe](gf01-global-frame-wireframe.html)

The HTML intentionally supports only bounded structural inspection:

```text
Workspace ↔ Project context transition
scope-appropriate adaptive rail
Back to Projects recovery
Workspace/Project context selectors using deterministic fixture labels
narrow-width drawer behavior
keyboard-focusable navigation controls
```

It does not select brand styling, component library, router, production state model or Product implementation.

## 9. Operator decision requested

The rendered H1 can receive only one of:

```text
LOCKED  — operator accepts this structural baseline
REVISE  — operator identifies a material structural change
REJECTED — operator selects a different hypothesis
```

Assistant/tool output does not set `LOCKED`.
