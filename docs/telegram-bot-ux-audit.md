# Telegram bot — UX and scoring audit, 2026-11-15

**Source basis:** screenshots from the Aytim private Telegram chat on 2026-11-15, the bot implementation under `src/`, the existing Mini App review engine, journey and activity modules, and the Telegram Bot API 10.4/widget documentation.

**Implementation:** This branch adds `src/telegram-review.mjs`, migration `0004_bot_review.sql`, UX changes, regression tests and widget diagnostics.

## User-visible fixes

| Finding | Severity | Change | Remaining check |
| --- | --- | --- | --- |
| Every quick answer said “Bu mashq Lug‘at bahosiga qo‘shilmaydi” | UX | Removed repetition from answer and widget feedback; diagnostic vs graded modes are distinct buttons | Verify copy on iOS/Android/Desktop |
| Tapping quick practice with insufficient vocabulary produced repeated warning bubbles | UX | Edit the existing dashboard where possible; a Telegram “message is not modified” error no longer creates a fresh warning | Tap repeatedly in a private chat |
| “Lug‘at (ilovada)” did not let users earn review credit in chat | Product gap | Replaced with “Lug‘at takrorlash”; graded word review works directly in the bot | Complete a real review in Telegram, verify Mini App |
| Short chat practice did not accrue learning evidence | By design | Quick practice remains diagnostic; the *new graded review* is distinct and saves objective evidence and due dates | Confirm users distinguish the two |
| Widget silently fell back to Telegram inline keyboard | Diagnostic gap | Worker logs the Telegram `sendWidget` error instead of hiding it; native buttons still work | Inspect live Worker logs. Screenshot proves the fallback, not its exact cause |
| Correct answers in bot not integrated with XP/learning activity | Data parity | Completed graded review now uses the same `recordObjectiveVocabularyReview`, `recordJourney`, `saveReview`, and `recordActivity` modules as the Mini App | Verify XP, due dates, streak, evidence and sync across devices |
| A new user needed enough unseen distractors for a four-word graded batch | Accessibility | Automatically choose smaller complete batches with at least two distinct distractors | Try after the first few words in each direction |
| Duplicate graded callbacks could credit the same round twice | Integrity | Version-guarded stage updates plus a D1 learner CAS/trigger that consumes the review session atomically with the progress write | Run D1 integration tests and tap rapidly on two devices |
| Learner switches language pair mid-review | Correctness | Expire the unfinished old-pair session when starting a review in a new pair | Test two pairs on the same Telegram account |
| Mistakes disappeared once the next question loaded | Learning UX | Incorrect individual answers receive Telegram callback feedback; the result screen lists missed words with both translations | Test long Arabic strings and non-ideal network latency |

## How scoring works

- A round includes up to four **due, introduced words**, drawn from the learner's current directed language pair and unlocked level.
- It uses Aytim's unchanged `createReviewRound` builder. Each reviewed entry receives exactly four checks: forward multiple-choice, reverse multiple-choice, forward matching and reverse matching. The bot renders a matching step as selecting a source word, then its target; filler targets act as distractors.
- A completed session is checked with the unchanged `scoreReviewRound`. An entry advances only when all four checks are correct. A failed entry follows Aytim's ten-minute retry scheduling; successful entries follow the 1/3/7/14/30-day ladder.
- The Word Mastery evidence in `vocabProgress` and the due schedule in `cards` are updated using the same functions the Mini App calls. Journey, activity and XP are recorded too.
- An individual correct response does **not** grant lesson credit or unlock levels.
- The bot currently grades **words**, not saved expressions/phrases or dialogue lines. The Mini App's more comprehensive review remains available there.
- A message callback never supplies an answer key. Choices and grading remain server-authoritative in D1.
- A completed review is consumed within the same SQLite write that increments the learner revision. Concurrent cloud edits cause the bot to recompute against the latest account state and retry; they do not silently overwrite it.

## Known issues and follow-ups

| Priority | Remaining issue | Proposed next work |
| --- | --- | --- |
| P0 before production confidence | Full `npm test`, `npm run deploy:check`, real Telegram/Cloudflare review completion and D1 migrations have not been executed in this editing session | Run full checks and verify against the deployed bot before relying on earned review credit |
| P1 | The user's screenshots show native inline keyboards rather than HTML widgets. The exact `sendWidget` failure is unknown | Read new `sendWidget` warnings in Cloudflare logs; if server accepted a widget, test client compatibility and rendering separately |
| P1 | Telegram can redeliver messages and start callbacks when the Worker crashes; new reviews are resumable but free-practice starts lack global webhook update receipts | Add idempotent webhook update receipts / delivery outbox and bounded retries |
| P1 | The bot has no per-learner timezone; server-recorded activity days use UTC, potentially shifting XP/streak to the wrong local calendar date | Sync IANA timezone from the Mini App or ask for timezone in bot settings |
| P1 | The short quiz still creates a new message for each next attempt; long chat sessions can become cluttered | Add a batch session with one reusable question message and a compact completion summary |
| P2 | Review coverage doesn't yet include phrases and saved expressions | Add phrasing validation and shared `phrases` coverage to the bot |
| P2 | The bot uses Uzbek UI copy regardless of base language | Localize bot messages in six Aytim interface languages |
| P2 | Audio listening and native voice-note practice are not implemented | Use existing Azure TTS/R2 for audio prompts; benchmark privacy-conscious server transcription for native voice messages, not Azure STT |
| P2 | Telegram matching uses tap source → tap translation, not the more playful inline widget board | Add a widget matching board when `sendWidget` is confirmed operational |
| P2 | No notification opt-in/preferences or proactive scheduling | Add opt-in reminders with quiet hours, frequency limits and opt-out controls |

## Deploy and verify

Run the normal Cloudflare deployment process **including D1 migration 0004** before testing the new graded-review button. Cloudflare's database is not migrated by a GitHub merge alone unless your deployment command executes migrations.

In the Telegram bot, open `/start`, tap **Lug‘at takrorlash** (not **Tezkor mashq**), finish all forward/reverse choice and matching stages, then open the Mini App and verify that word-review evidence, next due dates, XP and activity are synced. Repeat a completed button callback; it must not award additional credit. Test a wrong answer and verify its ten-minute retry. Tap **Bosh menyu** mid-round, return and resume without losing previous checks.

For the widget issue, inspect Cloudflare Worker logs after tapping **Tezkor mashq**. The bot logs the Telegram API error that triggered fallback. Do not assume the Telegram *client* is missing widget support: the server-side send itself may have failed.

This branch adds source-level and D1 tests, but **does not claim a live deployment or full test pass**.
