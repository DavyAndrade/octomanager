## 2025-05-15 - [Authentication] Restricted use of `getToken` with Auth.js v5
**Vulnerability:** Attempted to remove `accessToken` from the client-side session to mitigate XSS impact.
**Learning:** In Auth.js v5 (NextAuth v5), the default session cookie names changed (e.g., to `authjs.session-token`). Standard `getToken` utilities may fail to retrieve the token server-side without manual configuration of salts/secret/cookie names. The existing architecture intentionally forwards the token through the encrypted, HttpOnly session to ensure server-side API routes can access it via `auth()`.
**Prevention:** Do not replace `auth()` with `getToken()` in this codebase without addressing the cookie name compatibility. Prioritize server-side only access to tokens even if they exist in the session object.

## 2025-05-20 - [API Security] Server-side Double-Confirmation for Destructive Operations
**Vulnerability:** Repository deletion endpoint (`DELETE /api/repos/[owner]/[repo]`) previously accepted requests without a confirmation body, relying solely on UI-level checks. This increased the risk of accidental or unauthorized deletions if the API was called directly.
**Learning:** Client-side confirmation (typing a repository name) is a UX pattern, but for critical operations, the server must also verify the intent and the target identity via a request body.
**Prevention:** Implement mandatory JSON bodies for destructive endpoints (e.g., `{ confirm: true, name: "repo-name" }`) and validate that the provided name matches the URL parameter. Additionally, strictly validate URL parameters using regex-based Zod schemas to ensure they conform to expected naming conventions.

## 2025-06-12 - [Audit Logging & Error Masking] Secure Audit Trails and Robust Error Handling
**Vulnerability:** Lack of server-side audit trails for repository modifications and inconsistent error masking that could either leak internal 500 details or block legitimate client-side validation feedback.
**Learning:** Security monitoring requires explicit audit logs for state-changing operations. Furthermore, error masking must be granular: generic messages for internal 500 errors to prevent information leakage, while allowing specific status codes (401, 403, 404, 422) for actionable client feedback.
**Prevention:** Implement `console.info` logging for all successful `PATCH`, `POST`, and `DELETE` operations. Use a robust error-to-status mapping that prioritizes safe messages for unexpected errors while preserving context for known client-side errors.
