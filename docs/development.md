# Development

All source paths and commands below are relative to the repository root.

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

## Source layout

- `dist/index.html`: page shell, branding, and metadata.
- `dist/app.mjs`: navigation, interface, saved state, and browser audio.
- `dist/cloud-sync.mjs`: browser save queue, offline retries, migration, and refreshing from other devices.
- `dist/progress-merge.mjs`: combines two devices' progress for the same account so nothing practiced is lost.
- `dist/auth.mjs`, `dist/account-data.mjs`: Telegram sign-in and separate local account caches.
- `dist/progress-data.mjs`: shared save validation for the API and JSON imports.
- `dist/content.mjs`, `dist/words.mjs`, `dist/stories.mjs`: learning content.
- `dist/word-orders.mjs`: other natural word orders accepted in word-bank answers.
- `dist/speaker-forms.mjs`: feminine speaker forms of Russian, Arabic and German lesson phrases.
- `dist/engine.mjs`, `dist/journey.mjs`, `dist/practice.mjs`, `dist/skill-lab.mjs`, `dist/lesson-flow.mjs`, `dist/word-bank.mjs`, `dist/home-progress.mjs`: learning and progress logic.
- `dist/*copy.mjs`: interface translations.
- `dist/styles.css`, `dist/home.css`, and SVG assets: presentation (the unified question card is in `styles.css`).
- `dist/bright.css`, `dist/theme.mjs`, `dist/fonts/`, `dist/mark-bright.svg`: the Bright theme, the default (see Appearance).
- `src/worker.mjs`: progress API.
- `src/speech.mjs`, `src/recognition.mjs`: Azure text-to-speech audio, and speaking-check recognition (Azure for Uzbek, Workers AI Whisper otherwise).
- `dist/speech-capture.mjs`, `dist/browser-speech.mjs`: recording a speaking check in the page, and the browser-recognition fallback.
- `src/auth.mjs`, `src/telegram.mjs`, `src/sessions.mjs`: verified Telegram accounts and sessions.
- `docs/telegram-auth.md`: BotFather, Cloudflare, migration, and rollout instructions.
- `migrations/`: versioned D1 database schema.
- `test/progress.test.mjs`, `test/auth.test.mjs`: local workerd/D1 integration tests for progress, restart persistence, both Telegram sign-in routes, and account isolation.

## Loading

`dist/index.html` lists every module `app.mjs` imports as a `modulepreload`
hint. Without them the browser only discovers a module after parsing the one
that imports it, so the thirty-seven arrive in three waves and each wave costs
a round trip; with them they arrive in one. `dist/_headers` keeps the scripts
and styles revalidating, because neither carries a content hash, and lets the
artwork and fonts be held for a day.

About 300 KiB reaches the browser once Cloudflare has compressed it. Roughly
half of that is the catalog, which carries all six languages in one file even
though a learner reads two. Cutting that further means either a build step or
splitting the catalog per language, and both trade away the property this
project set out with: plain modules, no build, editable in place. The Bright
stylesheet adds about 8 KiB; its fonts load only while Bright is on.

For deployment, see [Cloudflare deployment](deployment.md). For the appearance implementation, see [interface and appearance](interface.md).
