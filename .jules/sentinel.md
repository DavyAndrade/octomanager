## 2025-05-15 - [Exposed Access Tokens in Session]
**Vulnerability:** GitHub OAuth access tokens were being exposed to the client-side via the Auth.js `session` object.
**Learning:** Auth.js (NextAuth.js) `session` callback by default includes whatever is returned from it in the session object available to `useSession()` on the client and in the HTML for SSR.
**Prevention:** Always use `getToken({ req })` from `next-auth/jwt` in API routes to access sensitive tokens instead of putting them in the session object. Keep the session object for non-sensitive user metadata only.
