# Learning data and progress

Russian, Arabic and German lesson phrases that mark the speaker's gender use the
masculine form by default. **Settings** offers a feminine form instead; the choice
is saved with progress, and every lesson, practice, word list and audio prompt follows it.

Vocabulary and spaced repetition share the **Vocabulary / Lug‘at** page. Its review
banner includes due words and phrases, with a due count beside Vocabulary in the
menu. Learners can browse by topic and learning status, filter due or saved cards,
and return from a review to their previous vocabulary tab and filters. When no cards
are due, saved cards remain available for practice. Existing review intervals and
saved progress use the same browser and D1 format.

Progress and settings are saved in the browser immediately and backed up to D1 after a short delay. This includes all language pairs, lesson and story scores, spaced-repetition schedules, placement and adaptive level evidence, practice history, daily activity, XP, streaks, and transliteration settings. XP and streaks are derived from the saved activity history. Skill practice counts and checks are also saved, but microphone recordings and user-written responses are not.

Telegram Mini App learners sign in automatically using verified launch data. Desktop and other regular browsers show **Continue with Telegram**. Both open the same account and D1 progress. No password, email service, or recovery code is required. See [Telegram account setup](telegram-auth.md) before deploying this feature; it needs the owner's BotFather configuration and Cloudflare secrets.

Existing guest saves under `lingua-loop.v1` are retained and can be claimed on first sign-in. Signed-in local progress and sync metadata use separate keys for each Telegram identity. Pending edits continue to save locally and retry when connected. An expired or changed account cannot silently upload its private cache into an anonymous or different account. Opening the website itself still needs a connection or cached assets.

In **Settings**, learners can see their Telegram account and sign out. Optional JSON export/import controls are in the collapsed **Advanced** section; saving is automatic. If guest practice differs from account progress, learners explicitly choose which copy to keep. Progress from the account's other devices needs no choice: it is merged automatically (see [Telegram account setup](telegram-auth.md#progress-and-account-changes)). The guest choice and sync problems remain visible outside Advanced. A database revision check prevents stale tabs from silently replacing newer data. Progress exports contain no login credentials.

Desktop sessions use secure HttpOnly cookies. Telegram Web frames also support tab-scoped sessions for browsers that block third-party cookies. D1 stores session hashes and a minimal Telegram profile, not bot secrets or Telegram provider tokens. Clearing browser data requires signing in with the same Telegram account again. The old ChatGPT Sites publication remains a separate host; transfer any older browser-only progress with JSON export/import before using the account-backed version.

The API validates save structure and limits each request to 1 MiB. Unsaveable data remains local and can be exported. Do not treat these client-reported scores as an authoritative leaderboard or assessment record. Curriculum content stays in the repository; D1 stores learner data, not a second copy of the course catalog.

Listening audio comes from Azure neural voices through the Worker, with the browser's speech synthesis voices as the fallback ([Azure speech](azure-speech.md)).

See also [Telegram account setup](telegram-auth.md), [curriculum](curriculum.md), and [deployment](deployment.md).
