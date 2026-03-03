## 2025-05-22 - [Access Token Leakage via Session]
**Vulnerability:** The GitHub OAuth access token was being exposed to the client-side through the Auth.js `session` callback.
**Learning:** Even when security guardrails are documented (e.g., in `CLAUDE.md`), implementations can sometimes inadvertently violate them by following default or common (but less secure) patterns. Auth.js `session` callback is a common place to put data for the client, but sensitive tokens should remain server-side.
**Prevention:** Use `getToken({ req })` server-side in API routes to retrieve sensitive tokens from the encrypted JWT instead of passing them through the session object to the client.
