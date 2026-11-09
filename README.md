# Aytim

A language learning website with short lessons, stories, vocabulary practice, quizzes, and spaced repetition. Practice Uzbek, English, Russian, Arabic, Turkish, and German in any direction.

The course includes 56 lessons, 336 vocabulary entries, 26 stories, and mixed level
tests across eight numbered levels. See [the curriculum catalog](docs/curriculum.md)
for coverage and assessment behavior.

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
- `dist/cloud-sync.mjs`: browser save queue, offline retries, migration, and conflict handling.
- `dist/auth.mjs`, `dist/account-data.mjs`: Telegram sign-in and separate local account caches.
- `dist/progress-data.mjs`: shared save validation for the API and JSON imports.
- `dist/content.mjs`, `dist/words.mjs`, `dist/stories.mjs`: learning content.
- `dist/engine.mjs`, `dist/journey.mjs`, `dist/practice.mjs`, `dist/home-progress.mjs`: learning and progress logic.
- `dist/*copy.mjs`: interface translations.
- `dist/styles.css`, `dist/home.css`, and SVG assets: presentation.
- `src/worker.mjs`: progress API.
- `src/auth.mjs`, `src/telegram.mjs`, `src/sessions.mjs`: verified Telegram accounts and sessions.
- `docs/telegram-auth.md`: BotFather, Cloudflare, migration, and rollout instructions.
- `migrations/`: versioned D1 database schema.
- `test/progress.test.mjs`, `test/auth.test.mjs`: local workerd/D1 integration tests for progress, restart persistence, both Telegram sign-in routes, and account isolation.

## Learning data and audio

Vocabulary and spaced repetition share the **Vocabulary / Lug‘at** page. Its review
banner includes due words and phrases, with a due count beside Vocabulary in the
menu. Learners can browse by topic and learning status, filter due or saved cards,
and return from a review to their previous vocabulary tab and filters. When no cards
are due, saved cards remain available for practice. Existing review intervals and
saved progress use the same browser and D1 format.

Progress and settings are saved in the browser immediately and backed up to D1 after a short delay. This includes all language pairs, lesson and story scores, spaced-repetition schedules, placement and adaptive level evidence, practice history, daily activity, XP, streaks, and transliteration settings. XP and streaks are derived from the saved activity history.

Telegram Mini App learners sign in automatically using verified launch data. Desktop and other regular browsers show **Continue with Telegram**. Both open the same account and D1 progress. No password, email service, or recovery code is required. See [Telegram account setup](docs/telegram-auth.md) before deploying this feature; it needs the owner's BotFather configuration and Cloudflare secrets.

Existing guest saves under `lingua-loop.v1` are retained and can be claimed on first sign-in. Signed-in local progress and sync metadata use separate keys for each Telegram identity. Pending edits continue to save locally and retry when connected. An expired or changed account cannot silently upload its private cache into an anonymous or different account. Opening the website itself still needs a connection or cached assets.

In **Settings**, learners can see their Telegram account and sign out. Optional JSON export/import controls are in the collapsed **Advanced** section; saving is automatic. If guest practice or another device's edits differ from account progress, learners explicitly choose which copy to keep. These choices and sync problems remain visible outside Advanced. A database revision check prevents stale tabs from silently replacing newer data. Progress exports contain no login credentials.

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
