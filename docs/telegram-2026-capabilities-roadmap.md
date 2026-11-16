# Aytim × Telegram: 2026 platform capabilities and revised integration roadmap

**Research date:** 2026-11-15  
**Scope:** Telegram Bot API 9.3–10.4 (December 2025–November 2026), official Telegram client releases in 2026, and the existing Aytim bot/Mini App architecture.  
**Related:** [Telegram learning platform](telegram-learning-platform.md) · [Telegram bot UX audit](telegram-bot-ux-audit.md) · [Objective vocabulary review](f04-objective-vocabulary-review.md)

**Status:** P0 rich review, quick practice, inline keyboard fallback, and webhook update receipts are implemented. Production verification and a durable delivery outbox are pending.

## Executive decision

**Make Telegram native Rich Messages + callback buttons the first-class chat UI.** Keep compact ordinary bot messages and inline keyboards as a compatibility baseline. Build quiz and matching interaction state server-side in Cloudflare D1. Keep the Mini App for complete lessons and tests. Add group learning through ephemeral bot replies only after private-user outcomes are reliable. Treat HTML widgets as opportunistic, **not** a release dependency.

Telegram's formal Bot API 10.4 docs still advertise private-chat HTML widgets, but the [Telegram Bot API contributor comment on November 13, 2026](https://github.com/tdlib/telegram-bot-api/issues/947) states that general bots currently cannot use widgets even in private chats (`INPUT_MEDIA_WIDGET_NOT_ALLOWED`). Aytim's current quick-practice inline keyboard fallback is therefore the dependable path.

The original Aytim document overemphasized widgets. Its core architecture and learning rules remain valid, but widget-specific milestones are superseded by this addendum.

## 1. What Telegram introduced and how Aytim could use it

| Capability and release | Evidence/availability | Aytim use | Priority and constraints |
| --- | --- | --- | --- |
| **Rich Messages** — 10.1 (June 11); rich input blocks 10.2 (July 14); embedded buttons, compact tables, expandable quotes 10.3 (August 24) | Production bot message types via `sendRichMessage`; supports headers, tables, collapsible explanations, inline audio/images and callback buttons | Visual word card, grammar contrasts, short reading, audio/text together, progress summary, contextual next question inside one chat message | **P0 UX**. Sanitize untrusted text, render fallback as ordinary message with inline keyboard when Rich Message delivery unsupported |
| **Buttons inside Rich Messages** — 10.3 / Telegram August 25 client release | `RichMessageButton`, `RichTextButton`, `RichBlockButtons`, `<tg-button>`; callback data, URL, private-chat Mini App links, copy text and disabled states | Two-way MCQ, tap-to-match, grammar explanations with “Hint / Example / Try again”, lesson chooser | **P0**. Same signed server-side session validation as existing callbacks; never trust answer key embedded in client message |
| **Colored inline buttons** — 9.4 (Feb 9); **disabled button states** — 10.3 (Aug 24) | `InlineKeyboardButton.style` and `disabled`; styles vary by Telegram theme | Visually distinguish main action, correct/incorrect feedback, completed choices; disable old buttons | **P0** small safe UX enhancement. Don't rely on color alone for correctness/accessibility |
| **Ephemeral group messages** — 10.2 (Jul 14), 10.3 (Aug 24), easier callback reply 10.4 (Nov 9) | `ephemeral_message_parameters`, ephemeral commands; targeted reply visible to one learner and the bot in a group | Group challenge with personal hints, individual result and next task without flooding the group | **P1 social**. Private to group participants, not end-to-end secret storage; group identity and quiz session must be bound to caller |
| **Expanded quiz polls** — 9.6 (Apr 3), 10.0 (May 8), 10.1 (Jun 11) | Multiple correct answers; shuffled choices; revoting; optional attached media, links, restrictions and longer closure; poll answer updates | “Find every correct Arabic translation”, weekly community quizzes, image vocabulary polls, listening prompts followed by quiz | **P1** for group outreach. Treat poll responses as exploratory evidence, **not** four-check mastery without equivalent per-user validation, identity and evidence completeness |
| **Guest Mode** — 10.0 (May 8) | Enable in BotFather; `guest_message` updates and `answerGuestQuery`; explicit @mention, no prior group membership necessary | @AytimBot “Explain this Turkish phrase” in family/friend group, translation contextual help, invitation to practice in private bot | **P2**. Bot sees only the mentioned message and a specified replied-to message, not chat history or member lists; do not store others' private chat content by default |
| **Streaming responses** — 9.3/9.5, Rich drafts 10.1, stop controls 10.3 | `sendMessageDraft` and `sendRichMessageDraft` in private chats; `stopped_message_generation` updates | Streaming AI tutor, incremental explanation of an error, cancellable conversational role-play | **P2** after bounded tutor quality and cost testing. Drafts are transient and need a final persistent message; debounce updates |
| **Private-chat topics** — 9.3 (Dec 31 2025) and bot topic creation 9.4 (Feb 9 2026) | Optional BotFather setting; `createForumTopic`, `message_thread_id`, topic links (10.4) | Optional “Lug‘at”, “Gapirish”, “Hikoyalar”, “O‘qituvchi” spaces in one bot | **P2 optional**. Do **not** force this on first-time users; dashboard already supports zero-command flow; support both topic and non-topic users |
| **Communities & member onboarding** — 10.2 (Jul 14), Telegram Aug 25 welcome messages | Groups/channels/bots linked in Communities; welcome messages can target joiners | Aytim Uzbek→Arabic club, Turkish conversation club, weekly guided challenges, personal onboarding card | **P2** after moderator/abuse/privacy plan. Avoid auto-posting everyone's scores |
| **Inline mode** (established) plus Rich Message input content in 10.1 | Inline queries let a user share selected bot-generated material in any chat | Share a word of the day, self-contained translation, study challenge from an Aytim chat | **P2** for distribution. Enable via BotFather, add `inline_query` webhook updates, don't expose account-specific progress to recipients |
| **Main Mini App + deep links** (established), **home-screen shortcuts** and share methods (2024 onward) | Bot profile can feature a Main Mini App; Mini App APIs `addToHomeScreen`, `shareMessage`, `requestFullscreen`; Telegram 10.2 tightened origin controls | “Continue lesson” deep link, immersive lesson/test, shareable achievement card, optional home-screen Aytim shortcut | **P1**. Signed initData and server-side entitlement checks; share only approved public content and use stable HTTPS origin |
| **DeviceStorage/SecureStorage** — 9.0 (Apr 11 2025) | Telegram Mini App local APIs, not an alternative to D1 | Cache lightweight non-authoritative user preferences and incomplete input locally | **P2** if proven needed. D1 remains authoritative; don't create a second progress data model |
| **Date/time entities** — 9.5 (Mar 1 2026) | `date_time`/Rich `tg-time` renders recipient-friendly times; Telegram date UI can add calendar reminders | Daily goal, next review date, next group challenge displayed in local time | **P1**. Still ask/record learner timezone for scheduling; rendered date does not reveal their timezone to the Worker |
| **Smartwatch Telegram apps** — June 11 | Watch apps support reading messages and audio/voice interactions | Tiny one-question vocabulary practice, voice exercises from a watch | **P2 compatibility**. Keep messages short and tappable; no watch-specific backend needed |
| **Managed bots, bot-to-bot communication** — 9.6/10.0 | Available for enabled bots; requires privileges, token management and loop controls | Future teacher-run personal learning bots or automated partner exercises | **Defer**. Adds security complexity and little benefit to initial solo-learning outcomes |
| **Chat automation / secretary mode** — May 2026 | A user explicitly connects the bot to manage their account and grants access to selected chats | Contextual personal language assistant | **Defer**. Excessive privacy/permission burden for language learning; Guest Mode covers explicit requests |
| **Stars, gifts and monetization** — existing/expanded | Telegram supports digital goods via Stars | Optional future premium tutoring or courses | **Defer** until learning experience and retention merit pricing; never make wallet widgets a learning dependency |
| **HTML widgets** — 10.4 (Nov 9) | Official API defines private widget messages, but a Bot API contributor confirms **general bots currently blocked** as of Nov 13 | Later richer tap-to-match board if permission returns | **Blocked/defer**. Keep native controls; periodically probe without flooding logs or delaying learners |

## 2. Immediate product design

**First screen: one contextual dashboard** — “Tezkor mashq” (diagnostic), “Lug‘at takrorlash” (scored), “Darslar” (Mini App), “Natijalar” (short summary), optional “Gapirish” (when available). No typing a slash command is required.

**Rich word card:** show source text and target-language direction, optional audio, up to four callback choice buttons. After answer, edit the existing message with selected/correct state, one concise explanation and “Keyingi savol”. For two-column matching, use “select left → select right” and compact formatted tables when client support permits; preserve native keyboard fallback. For Arabic, test right-to-left script and mixed-script layouts.

**Rich explanation card:** “Nega?” button opens a concise, collapsible grammar explanation and one validated example. Use curated reference text, not unreviewed LLM-generated rules as grading keys.

**One chat dashboard, optional topic upgrade:** maintain no-command onboarding. Only offer private topics to active users who want separate tutor/speaking/review threads.

**Review invariants:** All assessed questions continue to reuse the existing four-check objective vocabulary engine (forward and reverse choice, forward and reverse matching), same 1/3/7/14/30-day schedule and ten-minute retry policy, per-pair gating, immutable account ownership, deduplication and idempotent D1 update. Casual chat, polls, tutor suggestions and guest interactions do not silently award mastery.

## 3. Roadmap — implement in this order

### P0 — Native UI and reliability (next changes)

1. **Harden the merged graded-review flow before expanding:** verify deployment of `0006_bot_review.sql`; run full `npm test`, D1 integration tests and live Telegram round; verify sync, duplicate button taps, pair switch, and XP. Do not treat a merged PR as proof the Worker is deployed.
2. Create `src/telegram-rich.mjs` as a *server-side renderer*: pure `LearningCard → sendRichMessage` with tested `sendMessage + inline_keyboard` fallback, escaped/validated user-facing text, schema fixtures, and observability for unsupported-client/API errors.
3. Use **embedded rich buttons**, 10.3 disabled buttons and 9.4 button styling for concise selection + feedback; keep backend choice validation unchanged. Test RTL, small/large text, light/dark and old clients.
4. Implement webhook update receipts and retry-safe delivery/outbox. Log redacted Telegram API errors; never log token, speech content, auth headers or learner answers.
5. Make conversation screens consistent: practice vs scored review visibly distinct, not a disclaimer after every answer; “Yana mashq”, “Lug‘at”, “Bosh menyu” after results.

**Exit:** Rich card and native fallback both finish a correct and incorrect scored review and produce exactly one synchronized learning outcome.

**Rollout:** Apply pending D1 migrations before deploying the Worker. Formatted text and inline buttons are the default. Use `TELEGRAM_RICH_MESSAGES=1` to test rich cards on a compatible Telegram client. If the API rejects a rich card, the bot sends the formatted native card. Use `TELEGRAM_PRACTICE_WIDGETS=1` to test widgets with native answer buttons available under the caption. Buttons in previously sent messages still work.

**Delivery:** D1 receipts suppress duplicate webhook updates after successful handling. A failed edit can be retried using the saved review state. A fresh Telegram send has no idempotency key, so a timeout after Telegram accepts the send can leave an extra chat message. The D1 review commit still awards progress once.

### P1 — High-value learning and Mini App integration

1. **Listening:** reuse existing Azure TTS + R2 cache for an audio prompt, send normal Telegram audio/voice, then native choice/matching questions. Speaker voice/language must match the word. Add failure fallback and budget.
2. **Speaking:** accept native Telegram voice notes; benchmark server-side speech-to-text separately from browser speech recognition. Do not use Azure STT, do not claim pronunciation grading, and do not award objective mastery from uncertain transcripts.
3. **Short reading/grammar in Rich Messages:** heading, example, optional inline audio, expandable notes, choices, and a link to the relevant Mini App lesson.
4. **Opt-in due-review reminders:** daily/weekly preference, local timezone field, quiet hours, “mute” and “stop”; render next due time with Telegram `date_time` entities where helpful. Scheduler uses Cloudflare cron + D1 job deduplication, not Telegram message scheduling on behalf of users.
5. **Deep links + Mini App:** validated links into the exact currently unlocked lesson, review and progress screen. Consider home-screen shortcut prompt once a user repeatedly returns.

**Exit:** A learner can practice vocabulary, listening and low-stakes speaking in chat, launch precise Mini App tasks, and stop reminders at will.

### P2 — Social and contextual learning

1. **Ephemeral group study:** one Rich Message posted in a group; taps produce individualized ephemeral questions/hints/results. Store results under verified `from.id` + `chat_id`; leaderboards strictly opt-in.
2. **Guest-mode language helper:** explicit mention or reply-to message gives a short translation/grammar explanation without bot group membership; limited context, limited rate/cost. Add `guest_message` update handling and `answerGuestQuery`; no automatic XP.
3. **Community quizzes/polls:** opt-in language clubs, shuffled multimedia polls, “all correct answers” exercises and anonymous cohorts where appropriate. For formal mastery, the bot must independently collect four verified checks per learner.
4. **Inline share + achievements:** send a shareable word card/challenge (never private course data without confirmation). Mini App `shareMessage` or Telegram inline results with stable deep links.
5. **Optional topic mode:** separate “O‘rganish”, “Gapirish”, “Ustoz” when a learner explicitly opts in; respect existing chat's topic configuration.

**Exit:** Safe group participation and invitation flow add learning utility without exposing private progress or collecting unrelated chats.

### P3 — Tutoring and advanced options

- Bounded conversational tutor using a chosen cost-controlled LLM backend, streamed via `sendMessageDraft`/`sendRichMessageDraft` with user cancellation; use vetted feedback, clear AI vs scored-assessment distinction.
- Optionally use `sendRichMessage` for bilingual annotated stories, references, scripts and multimedia lesson recaps.
- Defer managed bot networks, full account automation, monetization and TON wallet interactions until validated by user need.

## 4. Worker / webhook integration notes

- Existing server stays Cloudflare Workers + D1 + R2. Add a `telegram-rich` rendering adapter, not another frontend framework.
- **Webhook `allowed_updates`:** current deployment receives `message`, `callback_query` and `widget_query`. Phase P1 may use no new types. For community polls add `poll`, `poll_answer`; for Guest Mode add `guest_message`; for tutor streaming cancellation add `stopped_message_generation`. Only add types after implementing verified handlers. BotFather toggles alone do not populate Worker logic.
- **Identity:** all chat scores are attached to Telegram-authenticated user IDs mapped to existing Aytim learners. Never use a plain user-provided ID or a group message as an authentication shortcut. Confirm owner/allowed pair, level, cursor and result.
- **User permission and privacy:** no unsolicited group learning, no collecting third-party chat text beyond explicitly summoned context, no hidden leaderboard, no passive recording of ambient voice. Reminders require opt-in and explicit frequency/timezone.
- **Accessibility:** never encode correctness in color only; provide ordinary message/keyboard fallbacks for Rich Message rendering differences, especially for Arabic/RTL and low-end phones.
- **Budget:** deterministic exercises use no LLM; expensive tutor/STT only on demand with D1 quotas and Cloudflare cost alerts. Existing TTS cache should remain reusable.
- **Telemetry:** track fallback rate, webhook retries, callback latency, review sync conflicts, share-to-lesson conversion, opt-in/opt-out rates, and retention by interface. Avoid storing raw speech/audio unless required and disclosed.

## 5. Sources (official unless noted)

- [Telegram Bot API changelog (9.3–10.4)](https://core.telegram.org/bots/api-changelog)
- [Bot Features: Rich Messages, ephemeral replies, topics, guest bots, streaming and Mini Apps](https://core.telegram.org/bots/features)
- [Telegram Bot API specification](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Telegram: Welcome Messages and Buttons Inside Messages (Aug 25, 2026)](https://telegram.org/blog/welcome-messages-buttons-TG-13)
- [Telegram: Rich Text, Communities and Ephemeral Messages (Jul 14, 2026)](https://telegram.org/blog/communities-editor-invisible-messages)
- [Telegram: Rich Text for Bots (Jun 11, 2026)](https://telegram.org/blog/watch-apps-and-more)
- [Telegram: Guest Bots and Streaming (May 7, 2026)](https://telegram.org/blog/ai-bot-revolution-11-new-features)
- [Telegram: Expanded Polls (Mar 31, 2026)](https://telegram.org/blog/ai-editor-mighty-polls-and-more)
- [Telegram: Colored Buttons (Feb 9, 2026)](https://telegram.org/blog/crafting-android-design-and-more)
- [Telegram: Mini App login and date formatting (Mar 1, 2026)](https://telegram.org/blog/member-tags-disable-sharing-and-more)
- [Platform availability caveat: tdlib/telegram-bot-api issue #947, Nov 13, 2026](https://github.com/tdlib/telegram-bot-api/issues/947)

**Revalidate:** Telegram's client and server feature availability can change. The November 2026 HTML-widget restriction is a platform-operational fact at review time, not a reason to permanently remove widget support.
