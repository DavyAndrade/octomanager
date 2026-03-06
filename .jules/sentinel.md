## 2025-05-15 - Token exposure in session callback
**Vulnerability:** GitHub access tokens were being passed to the client-side session.
**Learning:** By default, NextAuth.js (Auth.js) session objects are serialized and sent to the client. Any sensitive information, like OAuth access tokens, should be excluded from the `session` callback and accessed only on the server using `getToken`.
**Prevention:** Always use `getToken({ req })` from `next-auth/jwt` in API routes and server actions to access sensitive tokens from the JWT, rather than adding them to the session object.
