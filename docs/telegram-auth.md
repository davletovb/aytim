# Telegram accounts

Aytim uses one Telegram identity on both surfaces:

| Where the learner opens Aytim | Sign-in |
| --- | --- |
| Telegram Mini App, including Telegram Web frames | Automatically verify the signed launch data on the Worker |
| Regular desktop or mobile browser | **Continue with Telegram**, using the authorization-code flow with PKCE |

Both resolve to the numeric Telegram user ID and the same D1 learner record. Usernames are display names, so changing a username does not change the account. The OIDC `sub` is recorded but is not used to equate desktop users with Mini App users; the signed `id` claim provides that link.

## Set up the Aytim bot

Use one dedicated Aytim bot for both sign-in routes. Create or select it in [BotFather](https://t.me/BotFather) and give it the Aytim name and logo.

1. Configure the bot's **Main Mini App**, or its menu button, to open `https://aytim.behruz-davletov.workers.dev/`.
2. In the bot's **Login Widget** settings, register these Allowed URLs:

   ```text
   https://aytim.behruz-davletov.workers.dev
   https://aytim.behruz-davletov.workers.dev/api/auth/telegram/callback
   ```

3. Obtain its **Client ID** and **Client Secret** from that section. Leave its signing algorithm at the default **RS256**.
4. Obtain the same bot's token for Mini App launch verification.

Opening a plain website link inside Telegram's browser is different from launching its Mini App. The Main Mini App/menu launch supplies the signed Telegram user context needed for automatic sign-in.

## Configure Cloudflare

In the `aytim` Worker's variables and secrets, add:

| Name | Type | Value |
| --- | --- | --- |
| `TELEGRAM_CLIENT_ID` | Plain text variable | Client ID from BotFather |
| `TELEGRAM_CLIENT_SECRET` | Secret | Client Secret from BotFather |
| `TELEGRAM_BOT_TOKEN` | Secret | Token of the same Aytim bot |

`PUBLIC_APP_ORIGIN` is already declared in `wrangler.jsonc` as `https://aytim.behruz-davletov.workers.dev`. It must match the public sign-in origin exactly, without a trailing slash or path. `keep_vars` preserves dashboard-managed variables during Wrangler deployments; secrets stay outside Git. Never paste real tokens or client secrets into a PR, chat, source file, or frontend configuration.

Keep the production deploy command as:

```sh
npm run deploy
```

This applies `0002_telegram_accounts.sql` before publishing the new Worker. It adds accounts, authenticated-session metadata, and short-lived OAuth login transactions without deleting learning progress. Configure the bot and credentials before merging and deploying this feature. Each preview must use its own D1 database and test bot; do not run preview authentication against the production database.

For local development, copy `.dev.vars.example` to `.dev.vars` and supply a test bot's credentials. `.dev.vars` is ignored by Git. Local HMAC and OIDC integration tests use synthetic users and mocked Telegram keys/token exchange, so they require no real credentials. A real desktop sign-in requires the exact callback to be approved in BotFather; use an approved HTTPS test deployment if your chosen local URL is not accepted.

## Progress and account changes

- A new Telegram account claims the current anonymous learner when that browser's guest session is still valid. Its scores, reviews, activity, and settings stay on the same learner record.
- A returning Telegram account opens its existing learner record. Guest practice is offered for migration only when the server verified which guest session started sign-in. Competing progress copies require an explicit choice; they are never silently merged.
- Local caches are separate for every Telegram user. Switching identities does not import the preceding account's cache. Signing out clears the current account's local cache after its changes have synced and revokes that device's session.
- Old anonymous sessions cannot access a learner once it is claimed by a Telegram account. Recovery codes are removed from the interface, their endpoints return `410`, and their stored hash is cleared on claim.
- JSON export/import remains available as an optional backup. It contains learning state only, without Telegram login data or session credentials.

The Mini App's first launch must connect to verify identity. Once signed in, local saves and pending sync work as before. Reopening an expired Mini App launch uses its existing authenticated session when it still belongs to that Telegram identity; stale launch data cannot create or extend a session. If neither a valid session nor a recent launch is available, reopen the Mini App from Telegram.

## Implementation and verification

The Worker verifies Mini App HMAC signatures and launch timestamps before trusting user data. The browser only sends launch data, and only loads Telegram's SDK, when the page runs inside a Telegram client (its native bridge or an embedding frame). A regular tab opened from a link carrying someone else's launch data therefore stays signed out. Every progress request names the account it syncs, or none for a guest. The Worker rejects a request whose session belongs to anyone else, so a guest tab cannot read or overwrite a signed-in account through the shared cookie. If the sign-in check cannot complete, the browser keeps the last verified account's local cache open, and it syncs only while this browser's session still belongs to that account. Desktop sign-in uses a browser-bound, single-use state transaction, PKCE S256, a nonce, and Telegram's JWT signature, issuer, audience and expiry checks. Session tokens are random and hashed in D1. Normal browser sessions use HttpOnly, Secure, SameSite cookies. Telegram Web frames can use a tab-scoped bearer session when third-party cookies are blocked.

Only basic Telegram identity/profile access is requested. Aytim does not request a phone number or permission for the bot to send messages, and never stores the provider's access or ID tokens. Sessions last 30 days and rotate when signing in again. Other devices remain signed in when one device signs out.

Run `npm test` and `npm run deploy:check`. Tests cover both authentication routes reaching one account, signed-launch tampering and freshness, OIDC state/nonce/signature/audience/expiry failures, PKCE exchange, guest migration, account isolation, revoked sessions, concurrent claims, and cookie-blocked frames.

After production setup, verify an actual Mini App launch, desktop sign-in with the same Telegram user, progress surviving a refresh on both devices, sign-out, and switching Telegram users. These real-provider checks require the owner's bot configuration and consent and cannot be replaced by synthetic integration tests.

## Primary references

- [Telegram Mini Apps and launch-data validation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- [Telegram Login and OpenID Connect](https://core.telegram.org/bots/telegram-login)
- [jose JWT verification](https://github.com/panva/jose)
