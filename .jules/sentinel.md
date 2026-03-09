## 2025-05-15 - [GitHub Token Exposure in Session]
**Vulnerability:** The GitHub OAuth access token was being attached to the `session` object in `auth.ts`, making it accessible to the client-side via the `useSession` hook and the `/api/auth/session` endpoint.
**Learning:** In Auth.js (NextAuth.js), the `session` callback defines what data is sent to the client. Including sensitive tokens here exposes them to potential XSS attacks.
**Prevention:** Store sensitive tokens in the JWT only and retrieve them on the server using `getToken({ req })` in API routes or Server Actions.
