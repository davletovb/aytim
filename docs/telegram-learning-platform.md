# Aytim Telegram Learning Platform — Bot + In-Chat Widgets + Mini App

**Status:** Proposal / design document (not implemented)  
**Date:** 2026-11-15  
**Scope:** Telegram-based learning experience for Aytim across all existing language pairs  
**Related documents:** [Telegram accounts](telegram-auth.md) · [Curriculum](curriculum.md) · [Objective vocabulary review](f04-objective-vocabulary-review.md) · [Mixed lessons](mixed-lessons.md) · [Skill practice](skills.md)

## 1. Executive summary

Aytim should operate as **one learning platform across three complementary interfaces**:

1. **Telegram bot chat:** the daily language-learning companion. Learners can receive short practice prompts, answer quizzes, send text or voice notes, receive concise feedback, and continue lessons.
2. **Native in-chat HTML widgets:** bite-size interactive exercises embedded directly in Telegram messages using the November 9, 2026 Bot API 10.4 widget system.
3. **Telegram Mini App / existing web app:** the full classroom for lessons, long-form stories, level tests, detailed vocabulary and progress analytics.

**Design principle:** Do not make the bot merely a reminder service or a duplicate, disconnected curriculum. A learner should be able to make genuine, recorded progress in the chat; both surfaces must share identity, unlock rules, review scheduling and scoring.

The bot should specialize in *low-friction, frequent retrieval and practice*. The Mini App should specialize in *complete, structured learning experiences*. Use deterministic curriculum logic where possible and optional AI only where open-ended language interaction adds value.

No application changes are authorized by this document. All technical choices described as proposed require implementation, testing and product review.

## 2. Goals, non-goals and success measures

### Goals

- Make useful practice possible in a normal Telegram conversation, without requiring a Mini App launch for every question.
- Reuse Aytim's existing Telegram identity and Cloudflare/D1 learner records.
- Keep the six supported languages (Uzbek, English, Russian, Modern Standard Arabic, Turkish, German) and all 30 directed language pairs.
- Respect per-pair progress, eight internal levels, gated vocabulary, sequential lessons and the direct level-test advancement path.
- Extend the existing **objective, bidirectional vocabulary review** to chat activities rather than returning to subjective flashcards.
- Make native Telegram voice notes a first-class speaking-practice route.
- Support lightweight, opt-in reminders that never become spam.
- Preserve accessibility and offer fallbacks for unsupported widget clients.

### Non-goals for the initial launch

- Replacing the Mini App or moving all course content into chat.
- Automated pronunciation certification or claims of CEFR proficiency.
- Arbitrary LLM-generated lesson content presented as validated curriculum.
- Implementing TON payments, crypto wallet features or monetization just because the widget API supports them.
- Production group/inline widgets before Telegram enables those surfaces.
- Automatically counting free-form conversations as lesson passes or vocabulary mastery.

### Suggested success metrics

- 7-day and 30-day practice retention; weekly returning learners.
- Percentage of due reviews completed on time; delayed recognition accuracy.
- Accuracy across both language directions and both review types, and whether it holds after subsequent intervals.
- Learner sessions that start in chat vs. Mini App, and completion/drop-off for each.
- Voice-note participation and transcription failure rates by language.
- Reminder opt-in, mute/block rates, bot API error rate, duplicate grading rate.
- Per-active-learner Worker requests, speech transcription minutes, audio cache hits and costs.

Do not equate message frequency or XP alone with learning quality.

## 3. Product experience

### 3.1 Onboarding

1. Learner opens the existing Aytim bot and chooses **Start**. The bot identifies the user from Telegram's authenticated update `from.id`; it must never trust a user-supplied Telegram ID.
2. Resolve the same learner record already used by the Mini App through the existing `telegram_accounts` mapping. Do not create a second identity provider or silently merge unrelated guest progress.
3. If this is a new account, ask for known language, target language and starting experience; reuse the same supported language-pair choices and existing placement route.
4. Offer a sample 30-second chat quiz and a clear **Open Aytim** Mini App button.
5. Ask *separately* for permission to send scheduled learning reminders and the preferred time, frequency and quiet hours. A user starting the bot is not by itself consent to daily marketing-like reminders.

If the learner already has Mini App progress, the bot should recognize the active pair and level, and pick up from the existing due reviews without making them repeat onboarding.

### 3.2 Example day

**Morning, 08:30:** “Xayrli tong! Bugun 6 ta so‘zni takrorlash vaqti keldi. 2 daqiqalik mashq qilamizmi?” Buttons: **Boshlash**, **Keyinroq**, **Eslatmalar**.

**A moment later:** An in-chat word quiz shows “Güvenilir” and four Uzbek answer choices. Tapping an option requests a validated answer from the bot and displays immediate feedback. A short series may alternate forward choice, reverse choice and matching. On completion, Aytim saves objective evidence and updates the existing due schedule.

**During the day:** The learner can message “mashq”, “lug‘at”, or choose a bot command. Aytim offers a short practice set, a grammar explanation, or a link to the next unlocked lesson. Avoid flooding the chat with many messages per individual question.

**Evening:** The bot asks, “Bugun nima qildingiz? Turkcha 20–40 soniya javob bering.” The user responds with an ordinary Telegram voice message. Server-side transcription plus bounded feedback identifies the understood phrase and one useful correction. This remains **practice, not pronunciation scoring or automatic lesson credit**.

**Optional Mini App continuation:** A precise button opens the relevant lesson, story or level-test path. When the learner returns, the bot sees the updated state.

### 3.3 Bot interaction taxonomy

- **Scheduled:** one daily practice prompt or a customized alternative.
- **User-initiated:** `/start`, `/practice`, `/review`, `/lesson`, `/progress`, `/settings`, `/help` and simple Uzbek equivalents.
- **Reactive:** answers to widgets, inline-keyboard presses, text replies and voice notes.
- **Deep links:** open the exact permitted Mini App content (validate user entitlement server-side).
- **Tutor mode (later):** structured, bounded conversation or role-play. Do not silently switch every message to a paid LLM call.

Prefer one easy-to-understand chat by default. Private-chat topics (daily activities, vocabulary, speaking, tutor) are an optional advanced organization mode, not a mandatory navigation scheme.

## 4. Telegram platform capabilities and constraints (verified 2026-11-15)

### 4.1 HTML widgets (Bot API 10.4, November 9, 2026)

Telegram added `sendWidget`, `sendSharedWidget`, `answerWidgetQuery`, `editMessageWidgetData`, `editSharedWidgetData`, `widget_query` and `shared_widget_query`. Widgets embed an HTML document with inline CSS and JavaScript **inside the message bubble**, rendered by Telegram in a restricted sandbox—not a hosted Mini App or normal WebView.

Key production realities:

- **Private bot chats only in production today.** Group, forwarded and inline-mode widgets are supported on the Telegram test server, not yet generally in production. Production widget messages are protected from forwarding.
- A widget's HTML is fixed when sent. Later state updates are made by the bot; changing the layout needs a new widget.
- Maximum **32,768 UTF-8 bytes of HTML** and **4,096 bytes after zlib level-9 compression**. Build/check this budget.
- QuickJS-based, constrained API; **no network, external fonts/assets, native audio/video, microphone or keyboard text entry**. Inputs/selects/textareas are removed. Buttons, pointer interactions and horizontal drags are possible; no HTML drag-and-drop.
- No internal scrolling; widget height is limited (up to 600 px). Design for narrow phones (~320 px) as well as desktop and Telegram light/dark themes.
- `TelegramWidget.request(data)` sends a 1–64-byte request to the bot. The bot must answer through `answerWidgetQuery` within 15 seconds; the answer is up to 1,024 bytes. A request result is **not** a persistent state edit.
- Limit repeated requests: only one in flight and Telegram rate-limits widget queries (currently five per five seconds per user/bot). Each graded attempt should normally need only one request.
- Telegram authenticates the `widget_query.from` user; the bot must still validate the activity, message, answer and entitlement. Never grade from client-side state alone.
- A client without widget support shows unsupported media plus the caption; include a useful fallback with buttons or a Mini App link.

**Recommended first use:** private, static per-user exercise widgets. Shared widgets can be explored later, but are unnecessary for individual scored learning.

Official references: [Bot API changelog](https://core.telegram.org/bots/api-changelog#november-9-2026), [Telegram Widgets specification](https://core.telegram.org/bots/widgets), [Bot API reference](https://core.telegram.org/bots/api).

### 4.2 Other useful Telegram capabilities

| Capability | Proposed use | Important distinction |
| --- | --- | --- |
| Rich Messages (2026 updates) | Structured explanations, contextual feedback and polished lesson previews | Not interchangeable with HTML widgets |
| Native inline keyboards and quiz polls | Simple quizzes, actions and older-client fallback | Less customizable than widgets |
| Voice/audio messages | Speaking response and listening playback | Audio handling belongs to bot/backend, not widget sandbox |
| Mini App menu/main button and deep links | Open lessons, reading, analytics and formal assessments | Validate launch data and progress entitlements |
| Bot reply streaming | Optional conversational tutor responsiveness | Not a requirement for deterministic quizzes |
| Private-chat topics | Optional organization of practice modes | Do not fragment onboarding |
| Ephemeral callback replies | Group activity feedback in a later phase | Standard bot group features can be used before group widgets |
| Group messages, polls and challenges | Social study experiences | Group widgets are not production-ready yet |
| Scheduled bot messages | Review reminders after user initiation and opt-in | Respect blocking, quiet hours and Telegram rate limits |

Source: [Bot API changelog](https://core.telegram.org/bots/api-changelog) and [Telegram Mini Apps documentation](https://core.telegram.org/bots/webapps).

### 4.3 What must *not* run in a widget

Do not put an audio player, microphone recorder, long article, external API call, textbox-based essay, large lesson flow or credential inside widget HTML. Instead use Telegram's normal chat voice/text/audio messages or a deep link to the full Mini App.

The word-bank builder can use **tap-to-order**, not browser HTML drag-and-drop. Matching can use successive taps on two columns.

## 5. Exercise and surface map

| Activity | Chat implementation | Mini App role | Recording policy |
| --- | --- | --- | --- |
| Translation multiple choice | Widget or button fallback | Full practice and lessons | Objectively graded |
| Bidirectional pair matching | Widget | Full vocabulary rounds | Objectively graded |
| Sentence building / word order | Tap-to-order widget | More complex word banks | Graded when lesson/assessment task |
| Fill the gap | Widget | Full lesson/practice | Objectively graded |
| Listening comprehension | Telegram audio message + widget choices | Audio-first lesson flows | Graded only with usable, understood audio |
| Native speaking | Telegram voice note + transcription and feedback | Existing browser speech capture | **Unscored formative practice** |
| Open-ended text translation | Ordinary Telegram text reply | Later productive tasks | Diagnostic unless rubric validated |
| Short reading comprehension | Rich text message + widget choices | Stories and extended readings | Save as reading-practice evidence |
| Daily vocabulary review | Widget sequence | Lug‘at review | Shared spaced-repetition state |
| Guided dialogue / role-play | Chat text/voice | Optional extended experience | No automatic mastery claim |
| Full mixed lesson | Selected tasks in chat, with clear completion rules | Primary structured lesson | Same central lesson engine |
| Level test / placement | Deep link to Mini App in initial release | Primary assessment flow | Existing unlock thresholds |
| Progress dashboard | Short chat summary | Full dashboard | Shared per-pair state |

### Widget templates to prototype

1. **Quick Quiz:** prompt, direction label, four answer buttons, feedback, next.
2. **Pair Matching:** small two-column board, match selections, progress and concise correction.
3. **Sentence Builder:** bank of tappable word tokens with chosen-order display and undo.
4. **Fill the Gap:** short sentence and options; no typing.
5. **Judgement/reading:** short text with True / False / Not Given, with proper evidence-based scoring. Avoid treating an unjustified inference as fact.
6. **Review summary:** brief results, next due time and Mini App continuation button.

All should use Telegram theme variables, legible typography, touch-friendly hit targets, optional transliteration for relevant scripts, language direction labels, accessibility checks and polite error/loading states.

## 6. Preserve existing Aytim learning rules

The current project already has [eight internal levels and 30 directions](curriculum.md). This extension should **adapt to those rules**, not create new ones.

- Levels have eight sequential lessons each. The level test can be taken directly at the currently unlocked level.
- Standard mixed lessons currently have eight scored questions, with passing at **7/8** (or **8/9** with an adaptive scored question). Speaking is unscored.
- Level tests are **12 questions**, passed at **10/12**, and directly unlock the next level even if its lessons were not all completed.
- Practice skill checks and casual chats do not unlock levels.
- Vocabulary is accessible only when entitled by the current per-pair level and reveal rules; bot messages must never expose future-level terms.
- Course progress remains per directed language pair; switching Uzbek → Turkish to Uzbek → Arabic must not corrupt either.
- Aytim's current vocabulary review is **four objectively scored checks per entry**: forward/reverse multiple-choice and forward/reverse matching. An entry advances only after all four checks are correct. Its existing review intervals are **1/3/7/14/30 days**, with the current retry behavior; do not substitute self-rated flashcards.
- Word exposure, recognition/association, delayed retention and independent production are distinct evidence types. Do not imply that correct multiple-choice answers prove fluent spontaneous language use.
- A bot exercise that is outside a defined lesson/assessment remains practice and must not silently alter lesson scores.

**Initial release rule:** Bot-driven review updates the *same* vocabulary evidence and schedule as Lug‘at. Bot lesson completion remains a subsequent phase until the full central scoring flow is reused and audited. The Mini App remains the authoritative level-test interface at launch.

See [Objective vocabulary review](f04-objective-vocabulary-review.md) and [Mixed-skill lessons](mixed-lessons.md).

## 7. Shared architecture and data flow

Proposed system:

    Telegram private chat
      ├── ordinary messages, audio, native keyboards
      └── HTML exercise widgets
               │ Telegram updates / widget_query
               ▼
       Cloudflare Worker bot webhook
               │
               ├── Telegram transport and update verifier
               ├── exercise session / attempt coordinator
               ├── shared curriculum and scoring adapter
               ├── vocabulary review scheduling adapter
               ├── notification and delivery queue
               └── optional speech transcription / tutor services
               │
               ▼
        Existing D1 learner/account data
               ▲
               │
        Existing Mini App + Worker API

### 7.1 Existing foundation

Aytim already has:

- A Telegram bot identity used for Mini App launch and web login, and a `telegram_accounts` table mapping the Telegram user to the D1 learner ([telegram-auth.md](telegram-auth.md)).
- A single Cloudflare Worker, D1 storage, per-pair lesson state and account synchronization.
- Curriculum, review generators and progress logic in `dist/`; API and auth in `src/worker.mjs`.
- Existing speaking-check recognition (`POST /api/speech`: Azure for Uzbek, Workers AI Whisper for the other languages; see [speaking checks](speaking-checks.md)) and Azure TTS/audio asset infrastructure.

**Do not assume the current browser-side scoring modules can be safely called in a Worker unchanged.** First audit module dependencies. Extract pure curriculum/scoring functions or create a shared server-safe adapter; do not fork the rules.

### 7.2 Proposed new modules and schema (illustrative, not committed)

- `src/telegram-bot.mjs` — webhook dispatch, commands, bot transport, delivery fallback.
- `src/telegram-widgets.mjs` — compact widget templates, query parser and client/theme profile.
- `src/learning-attempts.mjs` — authorized exercise sessions, assessment and idempotent scoring.
- `src/telegram-speech.mjs` — voice retrieval, speech-to-text routing and supported-language checks.
- `src/telegram-reminders.mjs` — opt-in schedule and paced delivery.
- D1 tables or equivalent bounded storage for `bot_preferences`, `bot_exercise_sessions`, `bot_attempts`, `bot_delivery_jobs` and `telegram_update_receipts`.
- Optional central immutable learning-event ledger if migration from the current saved progress model is justified; avoid risky full-state rewrites.

Preserve current JSON progress/API compatibility. Any new D1 schema needs migrations, account isolation tests and a forward/backward compatibility plan.

### 7.3 A scored widget interaction

1. Worker selects only an **authorized, due, unlocked** item for the learner's active language pair, creates an exercise session and sends the widget with `allow_queries=true`. Do not embed answer keys or secrets in its HTML.
2. A tap invokes `TelegramWidget.request('answer:<choice-id>')` with small opaque IDs (within the 64-byte request limit).
3. Telegram delivers `widget_query`. Worker reads `from.id` and the message context; loads the authoritative session from D1; validates owner, version, expiry, activity mode and answer ID.
4. A transaction or concurrency-safe compare-and-set inserts the attempt once, applies the existing evaluation and spaced-review logic once, then commits.
5. Worker calls `answerWidgetQuery` promptly (within 15 seconds) with a compact result; it also edits widget state with `editMessageWidgetData` to persist the display state.
6. Old/repeated taps return the already-computed result without duplicating attempts or XP. Replayed webhook updates should likewise be harmless.
7. The Mini App later syncs and shows the same progress. Define conflict behavior before enabling mixed-surface concurrent sessions.

The bot must be authoritative for grades. Widget local animations are merely presentation.

### 7.4 Identity and security

- Use **the same BotFather bot and token** as Mini App auth, stored only in Worker secrets.
- Configure `setWebhook` with a protected endpoint and Telegram's webhook secret token; verify requests and validate update payload types.
- Never trust Telegram IDs embedded in button text, widgets, deep links or chat messages.
- Bind every session to its Telegram user ID, learner ID and directed language pair.
- Apply rate limiting, payload-size limits, attempt expiry, message/edit throttling and audit logging without collecting unnecessary voice transcripts indefinitely.
- Do not log bot tokens, auth headers, raw private voice data or other secrets.
- Ensure deleting/resetting learning progress clears the bot's derived state but **does not delete Telegram authentication**, consistent with current project policy.
- Store only the data needed for feedback and learning; provide a clear retention policy for audio and transcripts.

## 8. Voice and listening strategy

### 8.1 Speaking via native Telegram voice notes

- Bot sends a short, level-appropriate prompt in the target language.
- User replies with an ordinary Telegram voice message; bot retrieves the Telegram file using its server-side token.
- A server-side transcription provider processes supported formats and languages; evaluate **Cloudflare Workers AI Whisper** as a candidate because Aytim already runs on Cloudflare. Confirm current quotas, costs, model language support, quality and audio-size limitations before committing to a provider.
- Compare the transcript with task requirements or use a carefully bounded language-feedback step; give one useful correction and one suggested expression.
- **Do not call this pronunciation assessment.** A matching transcript is evidence of recognized words, not a reliable phonetic grade.
- Treat transcription failure, background noise and unsupported languages as recoverable: retry, provide a text alternative, or open speaking practice in the Mini App.
- Provide opt-out and retention rules for storing transcripts; avoid keeping audio indefinitely.

The Mini App records speaking checks itself and recognizes them through `POST /api/speech` (Azure for Uzbek, Whisper on Workers AI for the other languages), which a voice-note route can reuse. Whisper does not recognize Uzbek usefully, so Uzbek voice notes need Azure or another Uzbek-capable recognizer.

### 8.2 Listening via native Telegram audio

Reuse Aytim's existing Azure text-to-speech generation and cached audio (including R2 where configured). Send audio as a Telegram audio/voice message followed by the related widget question. Cache and reuse Telegram file IDs where appropriate to reduce repeat uploads.

Maintain authentic voice/language selection rather than using an English voice for Turkish or Arabic. Where speech generation or audio playback fails, follow the existing lesson's fallback rule instead of grading a purported listening task without audio.

## 9. Optional personal tutor and creative extensions

These should be later, controlled experiences rather than part of the initial graded review engine:

- **Role-play:** restaurant, travel, shopping, university, interview and everyday situations, with difficulty aligned to the learner's unlocked level.
- **Serialized micro-stories:** one paragraph per day with an evidence-based comprehension widget; full story and reading aids in Mini App.
- **Weakness-targeted practice:** identify repeated errors in a grammatical pattern, vocabulary direction or listening mode; recommend deterministic remedial exercises.
- **Goal-specific tracks:** conversational Turkish, MSA reading, German exam preparation, etc. Do not invent certifications or imply eight Aytim levels equal CEFR levels.
- **Chat language helper:** concise translation, explanation and examples; distinguish AI-generated content from reviewed curriculum.
- **Friends and groups:** lightweight native Telegram polls, pair challenges and leaderboards; wait for production widget group support before using in-chat HTML group games.
- **Progress recap:** short weekly review showing practice done, due vocabulary and next step, with a Mini App deep link.

For LLM feedback, cap usage and spend, protect learner privacy, show uncertainty where appropriate, and keep the structured curriculum as the source of truth. Never let an open-ended model independently unlock levels.

## 10. Reminder design

Offer explicit choices: one daily session, morning/evening sessions, weekly recap, or no scheduled messages; also preferred time, timezone and quiet hours. Respect `/stop`, blocking and muted reminders immediately.

Rules:

1. Schedule by learner's declared local time; do not infer a precise location.
2. Prefer due reviews over random engagement prompts.
3. One message should contain an immediately actionable quiz or one-tap start, not just a link.
4. Reduce frequency after repeated ignores; never escalate pressure.
5. Use Cloudflare scheduled triggers and a durable paced queue for batch delivery; respect Telegram's rate limits and failures.
6. Separate practice/learning notifications from any future promotional messages.
7. Preserve user choice across both the bot and Mini App; provide a clear settings command.

## 11. Delivery roadmap

### Phase 0 — Technical spike / feasibility

- Confirm the existing Telegram bot, Worker routes, token handling and D1 shape; do not expose credentials.
- Send a safe **private-chat test widget**; validate dark/light themes and unsupported-client fallback.
- Measure widget compressed size and test `widget_query` → `answerWidgetQuery` → `editMessageWidgetData` round-trip, duplicate taps and timeout handling.
- Prototype a pure shared review/score adapter against existing course data.
- Decide retention and privacy policy for optional voice data.

**Exit gate:** A single objective question persists its result to the correct per-pair learner record exactly once, with Mini App sync verified in test environment.

### Phase 1 — Useful standalone bot (MVP)

- Existing-account onboarding and active language-pair selection.
- `/practice` and `/review` commands; choice, reverse-choice and pair-matching widgets.
- Four-check objective vocabulary reviews using existing intervals and retry policies.
- Native keyboards and Mini App fallbacks.
- Minimal progress reply, lesson/story deep links and opt-in reminder settings.
- Production client QA (Android, iOS, desktop/web where supported) and error monitoring.

**Exit gate:** A learner can complete an eligible due-review round entirely in bot chat; the Mini App reflects the same outcome without duplicated scores or corrupted unlocks.

### Phase 2 — Speaking, listening and more complete exercises

- Telegram voice notes + transcription provider benchmarking in all supported target languages.
- Existing Azure TTS/R2 audio reused in listening questions.
- Sentence-builder, fill-gap and short reading widgets.
- Shared central lesson completion integration **only after** matching existing eight-question scoring and fallbacks.
- Cost and latency limits for transcription.

**Exit gate:** Audio/language failures recover safely; speaking remains unscored; both surfaces agree on scored attempts.

### Phase 3 — Adaptive tutor

- Guided role-play, micro-stories, weakness-specific sessions and weekly learning recaps.
- Clearly separated AI-generated formative feedback.
- Personalized practice frequency based on explicit preferences and observed due items.

### Phase 4 — Social learning

- Native group quizzes, sharing and friendly study challenges.
- Later: richer collaborative widgets when Telegram permits production group and inline widgets.

## 12. Testing and acceptance checklist

**Functional**

- [ ] Existing Telegram identity resolves to the existing learner, not a new shadow account.
- [ ] All 30 language directions and all eight levels preserve gating, transliteration and correct typography.
- [ ] Bidirectional choice/matching record the same evidence and review outcomes as Lug‘at.
- [ ] Correct and wrong answers both follow existing review scheduling; exposure never counts as mastery.
- [ ] Bot practice does not invent passed lessons, checkpoint results or CEFR scores.
- [ ] Mini App and bot converge on the same results after refresh/device change.
- [ ] Stale/replayed Telegram updates and repeated taps do not duplicate XP, attempts or review advancement.
- [ ] Widget fallback works when unsupported or when the widget request times out.
- [ ] Disabling reminders stops delivery; bot block and `/stop` are handled cleanly.

**UX / localization**

- [ ] Uzbek copy is natural; target text/audio use the correct language and script.
- [ ] Both language directions are clearly labeled to prevent reversed answer confusion.
- [ ] Telegram light and dark chat themes, large text and narrow devices remain readable.
- [ ] Widget height/bytes/compression meet Telegram limits on every supported exercise.
- [ ] Listening has an accessible alternative when usable audio is unavailable.
- [ ] Speaking feedback never claims to measure accent or pronunciation quality.

**Security / operations**

- [ ] Webhook secret, account binding, authorization and token storage are verified.
- [ ] Widget request IDs, answers and state are validated server-side.
- [ ] Audio/transcript retention, user consent and deletion/reset semantics are documented.
- [ ] Retry/backoff, provider outages, Telegram API limits and cost ceilings are covered.
- [ ] Integration tests and live bot/Mini App smoke tests pass before enabling scheduled pushes.

## 13. Decisions recommended now

1. **Make private-chat practice the first product**, not a generic conversational AI tutor.
2. **Keep one Telegram identity and one learner record**, adapting the existing progress contract rather than starting another database.
3. **Implement objective vocabulary widgets first**. They offer high learning value, straightforward grading, compact widget payloads and strong reuse of existing Aytim logic.
4. **Leave formal level testing in the Mini App initially**, preserving current assessment semantics.
5. **Use native Telegram voice messages, not widget microphones**; transcription is a separately benchmarked server service.
6. **Make reminders opt-in, restrained and configurable.**
7. **Avoid production group widgets until Telegram expands support.**

The desired outcome is simple: **the bot is the daily companion; the Mini App is the structured classroom; both belong to the same learning journey.**

## 14. References and current-project pointers

### Telegram primary sources (checked November 15, 2026)

- [Telegram Bot API 10.4 release notes (November 9, 2026)](https://core.telegram.org/bots/api-changelog#november-9-2026)
- [Official Telegram Widgets guide — architecture, constraints, limits, production status](https://core.telegram.org/bots/widgets)
- [Official Telegram Bot API reference](https://core.telegram.org/bots/api)
- [Telegram Mini Apps: launch and signed user context](https://core.telegram.org/bots/webapps)
- [Bot Features](https://core.telegram.org/bots/features)

### Existing Aytim references

- [Telegram identity and account sync](telegram-auth.md)
- [Eight-level curriculum, directed language pairs, assessment rules](curriculum.md)
- [Objective bidirectional vocabulary review and intervals](f04-objective-vocabulary-review.md)
- [Mixed-skill lessons and scoring](mixed-lessons.md)
- [Speaking/listening and skill practice](skills.md)
- [Current Cloudflare Worker](../src/worker.mjs)
- [Current vocabulary review implementation](../dist/vocabulary-review.mjs)

> **Review note:** Telegram's widget platform is new and subject to change. Re-check its production availability, limits and compatibility before implementation; this document intentionally marks future product capabilities as proposals rather than shipped Aytim functionality.
