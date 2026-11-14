# Aytim

A language learning website with short lessons, stories, vocabulary practice, quizzes, and spaced repetition. Practice Uzbek, English, Russian, Arabic, Turkish, and German in any direction.

The course includes 64 lessons, 486 vocabulary entries, 28 stories, and mixed level
tests across eight numbered levels.

Course access is level-gated: on each level, eight lessons unlock sequentially;
the **level test can be taken at any time** and a score of **10/12 (80%, the same
standard as a lesson)** directly unlocks the next level, even when lessons remain
incomplete. Learners can alternatively complete all lessons before taking the test.
A voluntary 16-question placement assessment can start an experienced learner at a
higher level; it samples every lesson of each level and forgives one slip. Lesson and vocabulary groups, individual phrases and words, stories,
practice questions, matching, search, and spaced repetition all obey the same
explicit level metadata. Lug‘at only shows unlocked words and phrases, with no
future-level previews. Progression is saved separately for every language pair. See [the curriculum catalog](docs/curriculum.md)
for coverage and assessment behavior.

## Mixed-skill lessons

**Darslar** opens one connected learning session per lesson, mixing reading,
listening, writing, speaking, and vocabulary in a single flow rather than a
separate study page followed by a multiple-choice quiz. **The lesson begins by
presenting all six of its phrases**, each with its translation and a listen
button, and every question that follows is drawn from them. All **64 lessons** use the same typed
activity plan and adapt to the learner's language pair, level and observed skill
support needs. Lessons include guided introductions, one-phrase reading questions,
audio-first tasks, fill-in questions, a scored word-bank sentence, a speaking turn,
the lesson's share of the level's vocabulary and a final challenge. Up to two wrong core answers generate unscored recovery cards
before the learner continues.

Every lesson has **eight scored questions** (nine when an adaptive question is
added): meaning choice, listening choice, fill-the-gap, word-bank writing, reverse
translation, word-bank dictation, a vocabulary question and the final challenge.
**Listening counts toward the score.** Passing needs 80%, rounded up: **7/8**
(or 8/9). The result screen lists the phrases answered incorrectly, with their
translations, alongside the score; they are also scheduled for review.
Without a usable device voice the listening choice shows its transcript
(a reading question) and the dictation shows the sentence's meaning (a writing
question), so a device never blocks completion and the answer is never simply
copied. Speaking is unscored practice. A separate **Daraja testi** still unlocks
the next level directly, regardless of unfinished lessons. Existing lesson IDs
and course progress remain compatible.

The lesson preview has one bottom Continue button and is excluded from question
numbering. Recovery cards are similarly excluded, so the numbered exercise
count remains stable. The phrase preview also avoids stray array indexes.

The lesson panel stays mounted between activity transitions to minimize
screen flashing. See [mixed-lesson implementation and QA](docs/mixed-lessons.md).

Each lesson also **teaches the vocabulary of its own topic**: every level's
word groups are assigned to its lessons by topic in `dist/lesson-words.mjs`
(colours in "Describing colours", polite words in "Please and thank you"), so each
lesson presents six to sixteen words on an unscored card and then asks about one of them.
Across a level the lessons cover its vocabulary exactly once, which means the
four vocabulary questions in the level test are now drawn from words the guided
route has taught. Taking the level test directly still tests the whole level.

Levels 4 and 7 carried the least reading in the course, two stories each. A
longer seven-line story has been added to both, and every level has gained an
eighth lesson (`dist/extra-lessons.mjs`), taking it from forty-two phrases to
forty-eight and easing the step up to the next level.

## One question format

Every question — lessons, practice, skill checks, story quizzes, level tests,
placement, matching and review — uses the same card: a header with a skill chip
(Reading, Listening, Writing, Speaking or Vocabulary), counter and progress bar;
one instruction; the green prompt panel; the answer area; and a footer with one
secondary action or the feedback, plus one primary button. Text uses one scale
(prompt 26, instruction 18, answers 17, support 15, labels 13). See
[the question design](docs/question-design.md) and its
[visual reference](docs/question-design.html).

## Listening, writing, and speaking

**Mashqlar** presents a single grid combining listening, writing, speaking,
translation, vocabulary, missing-word selection, listening comprehension,
matching, conversation and the level test. **Suhbat / Conversation** gives a
line from a lesson and asks which of that lesson's other lines comes next:
the exchanges in `dist/dialogues.mjs` are pairs of phrases the course already
teaches, so no new text is involved and they work the same in all thirty
directions. Skill cards retain practice and repeatable
five-task checks, with all activities respecting unlocked levels.
The duplicate keyboard-only **Imlo testi** has been removed, including from
adaptive practice and level checkpoints. Audio-first dictation and writing use tappable word banks rather than text entry.
Word banks include two extra words that must be left out, show no punctuation or
sentence-initial capital, and accept the natural alternative word orders listed in
`dist/word-orders.mjs`. In skill checks, listening offers a transcript reveal on
demand (or when no suitable voice exists), and such responses remain unscored;
writing is matched against the reference sentence and its accepted orders rather than AI grading. Speaking supports local recording/playback with a microphone-free
fallback. Higher levels use longer sentence-building exercises and open speaking.

Results are stored separately for each language pair, but skill checks **do not
unlock levels** and are **not certified proficiency scores**. Existing
Daraja testi advancement remains unchanged. Audio quality still depends on
the browser/device; reviewed audio assets and validated pronunciation scoring
are future work, not features of this release. See
[skill practice and assessment details](docs/skills.md).

## Interface language and navigation

A first visit opens in the visitor's own language when Aytim has it: the
language Telegram reports for a Mini App launch, otherwise the browser's. A
visitor whose language Aytim also teaches starts out learning English, an
English speaker starts with Uzbek, and any other language keeps the Uzbek
default. A saved choice always wins, so this only affects a first visit.

Every screen adds one history entry, so the browser's Back button, Android's,
and Telegram's Mini App back button all step back one screen and leave a lesson
rather than the site. Questions inside a lesson do not add entries of their own.
Reloading still ends a lesson in progress, because lesson state is held in memory.

English content uses British spelling and vocabulary throughout.

Arabic and Russian text carries a Latin-script reading aid, under the phrase and
on each word-bank tile and gap option, so a learner who cannot yet read the
script can still do the exercise. Arabic's is written by hand, because the
script omits short vowels; Russian's is produced letter for letter and does not
mark stress. **Settings** turns the aid off for a pair that uses either script.

**Lug'at** opens with a collapsible alphabet primer when the target language is
Arabic or Russian: every letter with its reading aid and a word from the
vocabulary the learner has already unlocked, with the letter highlighted where
it falls. Arabic letters also show the shapes they take once joined up, and the
six that never join to the letter after them show only the two forms they have.
Nothing in the primer is translated prose, so it reads the same in all six
interface languages.

Below it, **About this language** holds five short notes on how the target
language works, written in whichever of the six languages the learner reads:
word order, gender and articles, cases or vowel harmony, and which form of
*you* the course uses. The course addresses people formally throughout
(Sie, вы, siz), and the notes say so and name the informal form, rather than
leaving a learner to discover that *Sie* is wrong with a friend.

## Loading

`dist/index.html` lists every module `app.mjs` imports as a `modulepreload`
hint. Without them the browser only discovers a module after parsing the one
that imports it, so the thirty-seven arrive in three waves and each wave costs
a round trip; with them they arrive in one. `dist/_headers` keeps the scripts
and styles revalidating, because neither carries a content hash, and lets the
artwork be held for a day.

About 300 KiB reaches the browser once Cloudflare has compressed it. Roughly
half of that is the catalog, which carries all six languages in one file even
though a learner reads two. Cutting that further means either a build step or
splitting the catalog per language, and both trade away the property this
project set out with: plain modules, no build, editable in place.

## Run locally

The complete browser app, including all learning content, lives in `dist/`. It uses native JavaScript modules and has no build step or browser package dependencies. `src/worker.mjs` provides a same-origin API backed by Cloudflare D1 (SQLite). Node.js 22 or newer runs the development tools and tests.

To run with Cloudflare's local server:

```sh
npm ci
npm test
npm run dev
```

Open the local URL printed by Wrangler, normally <http://localhost:8787>. `dev` applies pending migrations to a local SQLite database before starting. Local development never uses the production database.

For a simple static server without installing Node.js dependencies, run the following from the repository root:


```sh
python3 -m http.server 8080 --directory dist
```

Open <http://localhost:8080>. This static-only mode keeps local progress and JSON backups; online saving and Telegram accounts require the Worker. Serve the files over HTTP rather than opening `index.html` directly, so JavaScript modules load correctly.

## Deploy to Cloudflare Workers

`wrangler.jsonc` serves `dist/` through Workers Static Assets and routes `/api` and `/api/*` to the Worker. Only API requests invoke the Worker. The `DB` binding connects it to the `aytim-db` D1 database.

### Database setup

The production database is already bound in `wrangler.jsonc`. For a new installation in another account, create its own database:

```sh
npm ci
npx wrangler login
npm run db:create
```

`db:create` creates `aytim-db` and writes its real `database_id` into the existing `DB` binding in `wrangler.jsonc`. Commit that configuration change to this repository so Git deployments use the same database. The ID identifies the database and is not a secret. No fabricated production database ID is checked in.

If `aytim-db` already exists, use `npx wrangler d1 list`, then add its ID as `database_id` in the existing binding instead of creating another database. Use the same Cloudflare account as the `aytim` Worker.

The token used by Cloudflare Git builds must have **D1 Edit** access to that account, in addition to its existing Worker deployment permissions. `npm run deploy` applies pending remote migrations first and only deploys the Worker after they succeed. Existing migrations are tracked and are not reapplied. A failed migration leaves the previous Worker deployment running.

### Connect this GitHub repository

In the Cloudflare dashboard, open **Workers & Pages**, create an application, and import `davletovb/aytim` from GitHub as a Worker. Use these settings:

| Setting | Value |
| --- | --- |
| Worker name | `aytim` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | Leave empty |
| Deploy command | `npm run deploy` |

Keep these settings for an existing connected Worker. Complete the one-time D1 setup above, then Cloudflare installs the tooling declared in `package.json` and uses the checked-in Wrangler configuration. Once Git integration is connected, pushes to `main` trigger deployments in Cloudflare.

### Deploy from your machine

```sh
npm ci
npm run deploy:check
npx wrangler login
npm run deploy
```

`deploy:check` bundles the Worker and validates asset and binding configuration without publishing, applying remote migrations, or requiring a Cloudflare login. The actual deploy requires your Cloudflare account, the database created above, and prints the live URL. If you have access to multiple Cloudflare accounts, select the intended account when prompted or set `CLOUDFLARE_ACCOUNT_ID` in your local environment.

The production Worker name must match `name` in `wrangler.jsonc`. Add a custom domain through the Worker's **Settings > Domains & Routes** after deploying.

### Verify the deployed revision

For Git deployments, compare the source commit in Cloudflare's build details with
the latest commit on `main`, then confirm that the resulting version is the active
deployment. **Retry build** reruns the selected build's revision, so a successful
retry can still publish an older revision.

Pushes to the production branch trigger builds without requiring a pull request.
If a new commit has neither a Cloudflare check run nor a corresponding build in
Cloudflare's history, inspect the Git connection and build watch paths.

To publish the current source while investigating the Git trigger, switch a local
checkout to `main`, run `git pull --ff-only origin main`, and follow **Deploy from
your machine** above. This publishes the checked-out source directly with Wrangler.

## Cloudflare Pages alternative

The same `dist/` files also work as a static-only Cloudflare Pages site, with browser saves and JSON backups. D1 online saving and Telegram accounts use the Worker deployment above; this repository does not include Pages Functions. For static-only Pages, use these settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `exit 0` |
| Build output directory | `dist` |

The root `wrangler.jsonc` is for Workers; Pages uses the dashboard settings above. Do not use `npm run deploy` as a Pages build command: it deploys the Worker. Publish only `dist/`, rather than the repository root.

The `.openai/hosting.json` file identifies the existing ChatGPT Sites publication. Cloudflare deployment uses `wrangler.jsonc` or the Pages settings instead.

## Source layout

- `dist/index.html`: page shell, branding, and metadata.
- `dist/app.mjs`: navigation, interface, saved state, and browser audio.
- `dist/cloud-sync.mjs`: browser save queue, offline retries, migration, and refreshing from other devices.
- `dist/progress-merge.mjs`: combines two devices' progress for the same account so nothing practised is lost.
- `dist/auth.mjs`, `dist/account-data.mjs`: Telegram sign-in and separate local account caches.
- `dist/progress-data.mjs`: shared save validation for the API and JSON imports.
- `dist/content.mjs`, `dist/words.mjs`, `dist/stories.mjs`: learning content.
- `dist/word-orders.mjs`: other natural word orders accepted in word-bank answers.
- `dist/speaker-forms.mjs`: feminine speaker forms of Russian, Arabic and German lesson phrases.
- `dist/engine.mjs`, `dist/journey.mjs`, `dist/practice.mjs`, `dist/skill-lab.mjs`, `dist/lesson-flow.mjs`, `dist/word-bank.mjs`, `dist/home-progress.mjs`: learning and progress logic.
- `dist/*copy.mjs`: interface translations.
- `dist/styles.css`, `dist/home.css`, and SVG assets: presentation (the unified question card is in `styles.css`).
- `src/worker.mjs`: progress API.
- `src/auth.mjs`, `src/telegram.mjs`, `src/sessions.mjs`: verified Telegram accounts and sessions.
- `docs/telegram-auth.md`: BotFather, Cloudflare, migration, and rollout instructions.
- `migrations/`: versioned D1 database schema.
- `test/progress.test.mjs`, `test/auth.test.mjs`: local workerd/D1 integration tests for progress, restart persistence, both Telegram sign-in routes, and account isolation.

## Learning data and audio

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

Telegram Mini App learners sign in automatically using verified launch data. Desktop and other regular browsers show **Continue with Telegram**. Both open the same account and D1 progress. No password, email service, or recovery code is required. See [Telegram account setup](docs/telegram-auth.md) before deploying this feature; it needs the owner's BotFather configuration and Cloudflare secrets.

Existing guest saves under `lingua-loop.v1` are retained and can be claimed on first sign-in. Signed-in local progress and sync metadata use separate keys for each Telegram identity. Pending edits continue to save locally and retry when connected. An expired or changed account cannot silently upload its private cache into an anonymous or different account. Opening the website itself still needs a connection or cached assets.

In **Settings**, learners can see their Telegram account and sign out. Optional JSON export/import controls are in the collapsed **Advanced** section; saving is automatic. If guest practice differs from account progress, learners explicitly choose which copy to keep. Progress from the account's other devices needs no choice: it is merged automatically (see [Telegram account setup](docs/telegram-auth.md#progress-and-account-changes)). The guest choice and sync problems remain visible outside Advanced. A database revision check prevents stale tabs from silently replacing newer data. Progress exports contain no login credentials.

Desktop sessions use secure HttpOnly cookies. Telegram Web frames also support tab-scoped sessions for browsers that block third-party cookies. D1 stores session hashes and a minimal Telegram profile, not bot secrets or Telegram provider tokens. Clearing browser data requires signing in with the same Telegram account again. The old ChatGPT Sites publication remains a separate host; transfer any older browser-only progress with JSON export/import before using the account-backed version.

The API validates save structure and limits each request to 1 MiB. Unsaveable data remains local and can be exported. Do not treat these client-reported scores as an authoritative leaderboard or assessment record. Curriculum content stays in the repository; D1 stores learner data, not a second copy of the course catalog.

### Database commands

| Command | Effect |
| --- | --- |
| `npm run db:migrate:local` | Apply migrations to local SQLite only |
| `npm run db:migrate:remote` | Apply migrations to the configured production D1 database |
| `npx wrangler d1 export aytim-db --remote --output aytim-backup.sql` | Export a production database backup; keep the file private |

Never bind a branch preview to the production database. If enabling Cloudflare branch previews, configure a separate preview D1 binding and apply the same migrations to that database.

Pronunciation uses the browser's available speech synthesis voices. Changing the hosting provider does not change voice availability or pronunciation quality.

## Cloudflare references

- [Deploy a static site on Workers](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Workers asset configuration](https://developers.cloudflare.com/workers/static-assets/binding/)
- [D1 getting started](https://developers.cloudflare.com/d1/get-started/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [Workers Git build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Deploy static HTML to Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
