## 2025-05-15 - [Secure Token Handling]
**Vulnerability:** GitHub OAuth access tokens were being exposed to the client-side via the Auth.js session object.
**Learning:** Auth.js (NextAuth) session objects are often accessible on the client-side (e.g., via `useSession` or `/api/auth/session`). Passing sensitive tokens through the `session` callback makes them vulnerable to XSS and accidental exposure in logs or browser extensions.
**Prevention:** Only include non-sensitive user profile information in the session object. Retrieve sensitive tokens on the server-side using `getToken({ req })` from `next-auth/jwt` within API routes.

## 2025-05-15 - [Defense in Depth: CSP]
**Vulnerability:** Lack of Content Security Policy (CSP) headers left the application more vulnerable to XSS and injection attacks.
**Learning:** Security headers are a critical second layer of defense. While input validation and sanitization are primary, CSP provides a policy-based mechanism to restrict where scripts, styles, and images can be loaded from.
**Prevention:** Implement a standard, strict-as-possible CSP in `next.config.ts` (or middleware) for all Next.js applications to provide defense-in-depth against common web vulnerabilities.
