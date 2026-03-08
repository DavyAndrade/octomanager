## 2025-05-15 - GitHub Access Token Exposure
**Vulnerability:** The GitHub OAuth access token was exposed to the client-side via the Auth.js `session` object.
**Learning:** In Next.js App Router, while `auth()` is convenient, it can inadvertently expose sensitive data to the client if the `session` callback includes it. `getToken` from `next-auth/jwt` is a more secure way to retrieve tokens server-side in API routes.
**Prevention:** Never include sensitive tokens in the `session` callback. Always use `getToken` in API routes and server actions to access provider tokens securely.
