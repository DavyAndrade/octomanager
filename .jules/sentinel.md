## 2025-05-15 - [Authentication] Restricted use of `getToken` with Auth.js v5
**Vulnerability:** Attempted to remove `accessToken` from the client-side session to mitigate XSS impact.
**Learning:** In Auth.js v5 (NextAuth v5), the default session cookie names changed (e.g., to `authjs.session-token`). Standard `getToken` utilities may fail to retrieve the token server-side without manual configuration of salts/secret/cookie names. The existing architecture intentionally forwards the token through the encrypted, HttpOnly session to ensure server-side API routes can access it via `auth()`.
**Prevention:** Do not replace `auth()` with `getToken()` in this codebase without addressing the cookie name compatibility. Prioritize server-side only access to tokens even if they exist in the session object.

## 2025-05-20 - [API Security] Server-side Double-Confirmation for Destructive Operations
**Vulnerability:** Repository deletion endpoint (`DELETE /api/repos/[owner]/[repo]`) previously accepted requests without a confirmation body, relying solely on UI-level checks. This increased the risk of accidental or unauthorized deletions if the API was called directly.
**Learning:** Client-side confirmation (typing a repository name) is a UX pattern, but for critical operations, the server must also verify the intent and the target identity via a request body.
**Prevention:** Implement mandatory JSON bodies for destructive endpoints (e.g., `{ confirm: true, name: "repo-name" }`) and validate that the provided name matches the URL parameter. Additionally, strictly validate URL parameters using regex-based Zod schemas to ensure they conform to expected naming conventions.
