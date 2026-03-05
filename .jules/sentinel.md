## 2025-05-14 - [Sensitive Token Exposure in Session]
**Vulnerability:** GitHub OAuth access tokens were being exposed to the client-side via the Auth.js session object.
**Learning:** Auth.js (NextAuth) by default might include JWT data in the session if explicitly mapped in the `session` callback. This makes sensitive tokens accessible to client-side JavaScript (`useSession`), increasing XSS risk.
**Prevention:** Always use `getToken({ req })` from `next-auth/jwt` in server-side API routes to retrieve sensitive tokens directly from the encrypted cookie, and ensure they are not mapped to the session object in the `session` callback.
