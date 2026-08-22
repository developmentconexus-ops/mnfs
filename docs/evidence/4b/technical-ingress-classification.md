# 4B Evidence — Technical Ingress / Protocol Classification

> **Kind:** bounded 4B Evidence / executable classification proof; not Product authority and not 4D technology-selection authority.
> **Status:** OPERATOR-APPROVED DESIGN / TDD GREEN.
> **Product census impact:** exactly `0`; `N_platform` remains `111`.

Repository current authority outranks this Evidence.

## Decision

Current F1 needs only three externally reachable technical HTTP interactions:

```text
TI-01 GET /protocol/oidc/login
      BeginOidcLoginProtocol

TI-02 GET /protocol/oidc/callback
      CompleteOidcCallbackProtocol

TI-03 GET /protocol/projects/{projectId}/agent-runs/{agentRunId}/stream
      StreamAgentRunProjection
```

Canonical technical HTTP source:

```text
contracts/api/technical/openapi.yaml
```

It is deliberately separate from `contracts/api/product/openapi.yaml` and carries no `x-conexus-4a-id`. Technical operation IDs cannot collide with Product operation IDs.

## Native-first / YAGNI disposition

```text
OIDC Authorization Code + PKCE S256
→ ADOPT standard OIDC protocol through a mature confidential-client library in 4D
→ do not implement OAuth/OIDC primitives manually

Product-Agent live stream
→ ADOPT Mastra native stream + @mastra/ai-sdk / AI SDK-compatible projection as the leading 4D realization
→ AgentRunId remains Conexus identity
→ no custom chat-streaming framework

Product-Agent schedule wake
→ INTERNAL typed callback into PAR guard
→ prefer native Mastra scheduling mechanics when 4D selects/pins them
→ no public schedule-fire HTTP endpoint

MAR delivery/redelivery
→ INTERNAL runtime mechanics
→ pg-boss remains the qualified incumbent candidate
→ no queue/worker HTTP endpoint

runtime → owner control
→ same-process typed callback under current topology
→ narrow authenticated RPC only if a future real process split requires it

provider refresh/callback
→ token refresh is outbound adapter mechanics
→ generic provider webhook ingress DEFERRED until an exact real provider consumer exists

DurableAgent/reconnect/replay
→ DEFERRED / REQUALIFICATION REQUIRED under current F1 authority
→ no resume token, Last-Event-ID, replay log or custom durable-stream service now
```

## OIDC boundary

The two OIDC routes are protocol mechanics, not I&A Product operations.

```text
browser
→ /protocol/oidc/login
→ exact configured Keycloak authorization endpoint
→ /protocol/oidc/callback
→ server-side code exchange/validation
→ verified (issuer, subject)
→ Conexus Account
→ __Host-conexus_session
→ current Conexus Product authorization on later Product calls
```

Caller cannot choose issuer, realm, client, redirect URI or PKCE verifier. Keycloak bearer tokens, claims, roles, groups and organizations never become Product authorization.

`IAM-02 EndSession` remains the Product logout operation; no duplicate technical logout API is added merely for symmetry.

## Product-Agent stream boundary

`PAR-04` / `PAR-05` first admit durable Conexus `AgentRun` truth. TI-03 is only a live projection of that already-admitted run.

Safe projected categories may include:

```text
assistant text
authorized sources
safe progress
safe tool activity
ApprovalRequest reference
safe status/error/finish projection
```

Never externally authoritative:

```text
raw reasoning / chain-of-thought
Mastra runId / toolCallId / threadId
RequestContext
raw provider chunks
runtime snapshots
stream EOF/disconnect
```

```text
stream EOF/disconnect -X-> AgentRun terminal truth
```

F1 does not promise live-stream resume after disconnect. Durable/replay behavior can later be adopted natively only after the existing requalification trigger is satisfied.

## Explicitly absent HTTP surfaces

The executable checker rejects prebuilding:

```text
generic webhook ingress
schedule-fire ingress
queue/worker delivery ingress
runtime bus / generic RPC
resume/reconnect route
caller token-refresh route
provider/model/Release/runtime override parameters
```

This keeps current topology in-process where accepted and prevents speculative authentication, replay, signature, service-credential and DTO machinery.

## Current external technology Evidence

Current official documentation checked during this bounded review supports the native-first direction:

- Mastra `@mastra/ai-sdk` exposes helpers such as `toAISdkStream` / `handleChatStream` for AI-SDK-compatible UI streaming.
- AI SDK `DefaultChatTransport` / `useChat` support custom stream/reconnect endpoints, so Conexus need not invent a frontend chat transport protocol.
- Mastra schedules provide persisted agent/workflow scheduling mechanics; current Conexus authority remains above those mechanics.
- Keycloak exposes standard OIDC authorization/token/logout protocol endpoints; Conexus should consume them through a mature OIDC client rather than reimplement the protocol.

These facts are realization Evidence only. Exact runtime/library versions and adapters remain 4D decisions.

## TDD proof

```text
Verify #346 = expected RED
→ Technical Ingress contract is missing
→ Product 111/111 and every prior owner gate remained green before the new gate

Verify #347 = SUCCESS
→ Technical Ingress = exactly 3 protocol-only operations
→ Product census remains 111/111
→ OIDC flow / Conexus-session boundary closed
→ AgentRun SSE projection closed without runtime identity authority
→ schedule/MAR/runtime mechanics remain internal
→ Budget Analyzer positive/negative proof remains green
```

The closeout additionally activates Redocly lint for the technical OAS before the semantic Technical Ingress checker.
