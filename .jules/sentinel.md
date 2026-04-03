## 2025-05-15 - [Authentication] Restricted use of `getToken` with Auth.js v5
**Vulnerability:** Attempted to remove `accessToken` from the client-side session to mitigate XSS impact.
**Learning:** In Auth.js v5 (NextAuth v5), the default session cookie names changed (e.g., to `authjs.session-token`). Standard `getToken` utilities may fail to retrieve the token server-side without manual configuration of salts/secret/cookie names. The existing architecture intentionally forwards the token through the encrypted, HttpOnly session to ensure server-side API routes can access it via `auth()`.
**Prevention:** Do not replace `auth()` with `getToken()` in this codebase without addressing the cookie name compatibility. Prioritize server-side only access to tokens even if they exist in the session object.

## 2025-05-20 - [API Security] Server-side Double-Confirmation for Destructive Operations
**Vulnerability:** Repository deletion endpoint (`DELETE /api/repos/[owner]/[repo]`) previously accepted requests without a confirmation body, relying solely on UI-level checks. This increased the risk of accidental or unauthorized deletions if the API was called directly.
**Learning:** Client-side confirmation (typing a repository name) is a UX pattern, but for critical operations, the server must also verify the intent and the target identity via a request body.
**Prevention:** Implement mandatory JSON bodies for destructive endpoints (e.g., `{ confirm: true, name: "repo-name" }`) and validate that the provided name matches the URL parameter. Additionally, strictly validate URL parameters using regex-based Zod schemas to ensure they conform to expected naming conventions.

## 2025-05-25 - [API Security] Error Masking and Audit Logging
**Vulnerability:** API routes previously used fragile string matching for error status determination or returned overly detailed messages, potentially leaking internal details on 500 errors. Lack of audit logs made it difficult to track destructive actions.
**Learning:** Reliable status determination should prioritize the `status` property of caught error objects (common in libraries like Octokit) over string matching. Masking messages specifically for 500 errors ensures internal failures don't leak information while maintaining useful feedback for client-side errors (403, 404, 422).
**Prevention:** Always implement a consistent error handler in API routes that checks for `error.status` and masks 500 error messages. Implement audit logging (`console.info`) for all successful state-changing operations to maintain an actor-target-action trail.
