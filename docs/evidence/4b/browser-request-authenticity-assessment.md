# 4B Evidence — Browser Request Authenticity

> **Kind:** bounded standards/security Evidence for 4B; not Product authority by itself.
> **Accepted source boundary:** `docs/reference/security-and-authority.md` requires browser self-only/CSP/session/request-authenticity laws to remain platform-controlled and admits only the exact Keycloak redirect/callback as a bounded cross-origin authentication protocol.
> **Question:** what is the smallest wire-level request-authenticity contract for opaque-cookie Product HTTP without inventing a CSRF subsystem or weakening cross-origin isolation?

## 1. Current official Evidence

### Cookie scope

MDN current cookie guidance documents that:

- `__Host-` cookies require `Secure`, `Path=/`, and no `Domain` attribute in supporting user agents;
- `HttpOnly` prevents script access to the session cookie while still allowing normal browser HTTP requests;
- `SameSite=Lax` blocks the cookie from ordinary cross-site unsafe requests while preserving top-level navigation behavior;
- `SameSite=Strict` is stronger but also withholds the cookie on all cross-site navigation contexts.

Current source:

```text
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies
```

### CSRF / cross-site request context

OWASP's current CSRF Prevention Cheat Sheet recommends Fetch Metadata, especially `Sec-Fetch-Site`, as a primary signal for rejecting cross-site unsafe requests, with standard `Origin`/`Referer` verification as fallback/defense in depth. It explicitly warns that `same-site` is broader than `same-origin` and should not be trusted for state-changing requests when sibling subdomains are not an authority boundary.

Current source:

```text
https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
```

The accepted Conexus architecture is stricter than a generic same-site web application: browser Product access is self-origin only, and any new cross-origin browser capability is an explicit later Product/security decision.

## 2. Candidate disposition

```text
session cookie
= __Host-conexus_session
+ Secure
+ HttpOnly
+ Path=/
+ no Domain
+ SameSite=Lax

credentialed cross-origin Product API
= DENY F1

browser Product request authenticity
= exact same-origin policy
```

`SameSite=Lax` is defense in depth, not the sole request-authenticity decision. It is preferred over `Strict` because normal top-level navigation into the product need not lose the session carriage on the navigation itself, while exact-origin verification provides the stronger state-changing boundary.

## 3. Exact request-authenticity law proposed for 4B

For cookie-authenticated Product HTTP requests:

```text
if Sec-Fetch-Site is present
→ same-origin = eligible to continue
→ same-site / cross-site / none = reject for /api Product requests

if Sec-Fetch-Site is absent on a browser Product ingress
→ exact Origin must equal the server-configured current Conexus origin
→ else exact Referer origin must equal the same configured origin
→ if neither trusted signal is present, reject

HEADLESS ingress
→ is not a browser-authority class
→ absence of browser metadata does not itself deny the request
→ but if browser metadata is present, foreign/same-site-non-origin context is still rejected
→ exact `agent.headless.invoke` + current owner facts remain required
```

The target origin is server-configured/current deployment authority. Client-supplied forwarded-host data is never accepted as authority merely by arrival; trusted proxy topology is a later 4D mechanism that must preserve this 4B property.

This policy applies to Product API requests, not to the allowlisted OIDC redirect/callback protocol. The Keycloak callback remains Technical Protocol and does not become a Product API operation.

## 4. Why no synchronizer/double-submit token in F1 4B

A separate CSRF token subsystem would add state/carriage/generation/rotation mechanics. Current F1 does not need it because all of the following are already accepted/selected:

```text
single host-bound opaque session
+ no credentialed cross-origin Product API
+ safe HTTP methods never change Product state
+ exact same-origin Fetch Metadata / Origin verification
+ host-only cookie prefix
+ explicit SameSite restriction
```

If a real future cross-origin browser consumer is admitted, this decision must reopen at the smallest security/wire boundary; convenience CORS configuration may not silently weaken it.

## 5. Negative controls

A conforming 4B/4D realization must prove at least:

```text
foreign Origin + valid session cookie               → denied
same-site sibling Origin + valid session cookie     → denied
Sec-Fetch-Site: cross-site + unsafe method          → denied
Sec-Fetch-Site: same-site + unsafe method           → denied
no metadata on CP/PA browser request where required → denied
HEADLESS non-browser request + exact authority      → not denied merely for absent Fetch Metadata
Keycloak callback                                   → handled only by exact technical protocol allowlist
GET Product endpoint                                → never mutates Product state
```

No frontend framework, router, middleware package, proxy header syntax, token store or deployment topology is selected by this Evidence.
