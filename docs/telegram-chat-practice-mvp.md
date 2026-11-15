# Telegram chat practice — first implementation slice

**Status:** Feature-branch MVP, requires deploy and live Telegram verification.
**Plan:** [Telegram learning platform proposal](telegram-learning-platform.md).

This slice creates a **working bot practice path**, distinct from Aytim's objective four-check review. It intentionally does not change XP, card spacing, lesson scores, level tests or speech features.

## Behavior

### Tap-first navigation

- Starting or returning to the bot displays a **Bosh menyu** dashboard with inline buttons; learners do not have to type commands.
- **🎯 Tezkor mashq** starts a diagnostic in-chat vocabulary question; **📊 Natijalar** shows a compact, current D1 progress summary.
- **🧠 Lug‘at (ilovada)** and **📖 Darslar (ilovada)** open the Mini App. They do **not** claim to jump into a specific internal screen because the web application has not yet implemented such deep links.
- Completing an HTML widget displays **🔄 Yana mashq** and **🏠 Bosh menyu** under that widget. The ordinary-button fallback replaces the question text with feedback and the same continuation controls, rather than generating an extra message.
- Progress and dashboard buttons reuse a text message when Telegram allows it; otherwise the bot sends a new menu.
- Slash commands are supported as optional shortcuts and a few simple Uzbek text phrases also work. The bot does **not** display a large permanent reply keyboard over the typing area.

- /start and /help describe the bot and open the existing Aytim Mini App.
- /practice and /review select an introduced, unlocked word from the learner's current pair, preferring due words. The bot sends a 4-option HTML widget with a server-authorized answer.
- Unsupported-widget delivery falls back to ordinary Telegram inline-keyboard choices.
- /progress reads the learner's existing D1 progress to show the active language pair, level and due count.
- Users without an existing Telegram-linked learner are directed to sign in through the Mini App, rather than creating another account.
- Responses are **practice-only**. This is deliberate: advancing objective vocabulary requires both directions *and* both question formats for each reviewed entry. Claiming success from one widget would regress the existing spaced-repetition system.
- Review/lesson results in the existing Mini App are not changed by this slice.

### First-release limitations

- No complete four-check bot review round, tap-to-match, speaking transcription or scheduled reminders yet.
- There is no bot-side language-pair onboarding. The existing Mini App owns it.
- The inline-keyboard fallback is a single selected answer; repeated taps return the first committed answer and must not create additional scores.
- Telegram production HTML widgets currently support private bot chats only. Other chat types are not handled.
- No live Telegram verification was performed during repository editing; use a test bot first.

## Security and database

The new `bot_practice_sessions` D1 table stores a bounded random exercise ID, Telegram account, learner, active pair, prompt, options, hidden correct answer, first answer, message ID and expiry (15 minutes).

The webhook is **POST /api/telegram/webhook**, which requires the configured `TELEGRAM_WEBHOOK_SECRET` in Telegram's `X-Telegram-Bot-Api-Secret-Token` header. Missing or mismatched secrets return 401. It validates the authenticated Telegram private-chat sender against the chat ID. Per-answer database updates are conditional on `selected_index IS NULL`. It does not accept answer keys from widget HTML, and neither practice nor fallback updates the learner's course progress.

Replayed `/practice` webhook messages may currently create another diagnostic practice widget; do not use this endpoint for costly AI requests or reminders until global webhook deduplication has been added. If an API request fails after Telegram accepted a message, retrying may also produce another message. This is a known MVP hardening item.

## Activation on the deployed Aytim bot (no local setup)

The production Worker now supports **automatic Telegram activation** when `TELEGRAM_AUTO_CONNECT=1` (configured in `wrangler.jsonc`), `TELEGRAM_BOT_TOKEN` exists in Worker secrets, and `PUBLIC_APP_ORIGIN` points at the HTTPS Aytim host.

1. Deploy the updated `main` branch, including the original `0003_bot_practice.sql` migration. A code deployment alone does not run D1 migrations unless the build/deploy pipeline applies them; the repository's `npm run deploy` command does.
2. Open **https://aytim.behruz-davletov.workers.dev/** using the existing website or Telegram Mini App. The normal `/api/auth/session` call then triggers the Worker to check `getWebhookInfo` and configure `setWebhook`, `setChatMenuButton`, and `setMyCommands` without exposing credentials to the browser or needing a local terminal.
3. Open the same Aytim bot in Telegram and tap **Start**. It should show the inline button dashboard. If you already opened the bot before, send `/start` once to request a new dashboard.
4. Tap **Natijalar** and **Tezkor mashq**. A quiz requires enough introduced vocabulary in your signed-in Aytim course; lesson progress stays in the existing D1 account.

### Security and limits

- A preconfigured `TELEGRAM_WEBHOOK_SECRET` remains supported. If it is missing, the Worker derives a stable, unguessable webhook header secret using **HMAC-SHA256 keyed by the existing bot token**. Telegram receives this value through `setWebhook`, and the Worker checks it on every incoming webhook. Neither value is exposed to the frontend.
- Automatic activation **refuses to overwrite an existing webhook pointing to another URL**, to avoid hijacking another bot deployment. In that case, inspect the bot's webhook configuration and Cloudflare Worker logs.
- Setup requests are deduplicated per Worker instance and retried after errors; errors are logged, not included in the normal browser response.
- The web app must be accessed again after deploying the auto-activation change so the session endpoint can initiate registration. It does not retroactively activate an earlier Worker build.
- If Telegram login is unavailable because `TELEGRAM_BOT_TOKEN` is missing, the Worker cannot activate the bot. Set that secret using Cloudflare **Worker → Settings → Variables and Secrets**, without editing source or using a local environment.
- The chat-practice D1 migration still must exist. Successful registration alone does not create the table.

## Configure test deployment

1. Set up a **separate test Telegram bot and test D1 database**. Never point preview Worker traffic or tests at Aytim's production learner database.
2. Configure `TELEGRAM_BOT_TOKEN`, `PUBLIC_APP_ORIGIN` and a new, cryptographically random `TELEGRAM_WEBHOOK_SECRET` in the test Worker's secrets. The secret must be 1–256 allowed webhook-secret characters (letters, digits, underscore or hyphen).
3. Run `npm run db:migrate:local` and `npm test` locally. For a test Worker deployment, apply migrations to its own D1 and deploy it.
   Configure the bot's persistent Mini App menu **against the test bot**, using `TELEGRAM_BOT_TOKEN` and `PUBLIC_APP_ORIGIN` from its environment, then run `npm run telegram:configure-menu`. This calls Telegram's `setChatMenuButton` and sets optional commands with `setMyCommands`. It is a deliberate external operation and is **not** executed automatically during deploy. Use a valid HTTPS app origin.
4. Register the webhook for the test bot using Telegram's `setWebhook`, passing a JSON object of this shape (substitute securely; **never commit secrets**):

   ```json
   {
     "url": "https://YOUR-TEST-WORKER.example/api/telegram/webhook",
     "secret_token": "YOUR-WEBHOOK-SECRET",
     "allowed_updates": ["message", "callback_query", "widget_query"]
   }
   ```

5. Use `getWebhookInfo` to verify the webhook address, pending update count and error messages. Confirm `allowed_updates` includes `widget_query`; otherwise tap requests will time out.
6. Open the test bot privately. **Start** should show tap-to-navigate welcome actions. Sign into the **same** test bot identity from the test Mini App, then complete a lesson introducing at least four distinct words. Tap **🎯 Tezkor mashq** to create a widget. Use **🧠 Lug‘at (ilovada)** to launch the full graded review, not another diagnostic question.
7. Test one answer, an incorrect answer, repeated taps, a spoofed session ID, old/expired message, old Telegram client and inline-keyboard fallback. Verify **no XP, review step or lesson grades change**. After both widget and fallback completions, tap **🔄 Yana mashq** and **🏠 Bosh menyu**. Check **📊 Natijalar** from the dashboard, verify tapping works without slash commands, and confirm the persistent **Aytim** Menu button opens the Mini App.
8. Verify /progress reflects the learner's latest Mini App progress and the bot never displays future-level/unintroduced words.
9. Only after successful live test should the production bot's webhook be switched to the production Worker endpoint, with an independent webhook secret.

You can call the Telegram Bot API with curl while keeping the token and webhook secret in environment variables. Avoid typing them in commands that will be saved in shell history. Telegram setup is not performed automatically by merging this PR.

## Next PR

Build the full objective review round: forward choice, reverse choice, forward matching and reverse matching, all scored server-side against the same shared engine. Apply `recordObjectiveVocabularyReview` and `saveReview` **once per completed round**, with atomic synchronization to the learner's D1 revision and conflict handling for the Mini App. Add webhook delivery deduplication and end-to-end Miniflare/Telegram API fixtures.

Only once those are in place should completed chat review advance spaced-repetition intervals.
