# Telegram chat practice — first implementation slice

**Status:** Feature-branch MVP, requires deploy and live Telegram verification.
**Plan:** [Telegram learning platform proposal](telegram-learning-platform.md).

This slice creates a **working bot practice path**, distinct from Aytim's objective four-check review. It intentionally does not change XP, card spacing, lesson scores, level tests or speech features.

## Behavior

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

## Configure test deployment

1. Set up a **separate test Telegram bot and test D1 database**. Never point preview Worker traffic or tests at Aytim's production learner database.
2. Configure `TELEGRAM_BOT_TOKEN`, `PUBLIC_APP_ORIGIN` and a new, cryptographically random `TELEGRAM_WEBHOOK_SECRET` in the test Worker's secrets. The secret must be 1–256 allowed webhook-secret characters (letters, digits, underscore or hyphen).
3. Run `npm run db:migrate:local` and `npm test` locally. For a test Worker deployment, apply migrations to its own D1 and deploy it.
4. Register the webhook for the test bot using Telegram's `setWebhook`, passing a JSON object of this shape (substitute securely; **never commit secrets**):

   ```json
   {
     "url": "https://YOUR-TEST-WORKER.example/api/telegram/webhook",
     "secret_token": "YOUR-WEBHOOK-SECRET",
     "allowed_updates": ["message", "callback_query", "widget_query"]
   }
   ```

5. Use `getWebhookInfo` to verify the webhook address, pending update count and error messages. Confirm `allowed_updates` includes `widget_query`; otherwise tap requests will time out.
6. Open the test bot privately and sign into the **same** test bot identity from the test Mini App. Complete a first lesson that introduces at least four distinct words; /practice should now create a widget.
7. Test one answer, an incorrect answer, repeated taps, a spoofed session ID, old/expired message, old Telegram client and inline-keyboard fallback. Verify **no XP, review step or lesson grades change**.
8. Verify /progress reflects the learner's latest Mini App progress and the bot never displays future-level/unintroduced words.
9. Only after successful live test should the production bot's webhook be switched to the production Worker endpoint, with an independent webhook secret.

You can call the Telegram Bot API with curl while keeping the token and webhook secret in environment variables. Avoid typing them in commands that will be saved in shell history. Telegram setup is not performed automatically by merging this PR.

## Next PR

Build the full objective review round: forward choice, reverse choice, forward matching and reverse matching, all scored server-side against the same shared engine. Apply `recordObjectiveVocabularyReview` and `saveReview` **once per completed round**, with atomic synchronization to the learner's D1 revision and conflict handling for the Mini App. Add webhook delivery deduplication and end-to-end Miniflare/Telegram API fixtures.

Only once those are in place should completed chat review advance spaced-repetition intervals.
