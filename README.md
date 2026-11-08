# Aytim

A language learning website with short lessons, stories, vocabulary practice, quizzes, and spaced repetition. Practice Uzbek, English, Russian, Arabic, Turkish, and German in any direction.

## Run locally

The complete website, including all learning content, lives in `dist/`. It uses native JavaScript modules and has no build step or browser package dependencies. Node.js 22 or newer is needed only for Cloudflare's deployment tooling.

To run with Cloudflare's local server:

```sh
npm ci
npm run dev
```

Open the local URL printed by Wrangler, normally <http://localhost:8787>.

For a simple static server without installing Node.js dependencies, run the following from the repository root:


```sh
python3 -m http.server 8080 --directory dist
```

Open <http://localhost:8080>. Serve the files over HTTP rather than opening `index.html` directly, so JavaScript modules load correctly.

## Deploy to Cloudflare Workers

`wrangler.jsonc` configures Cloudflare Workers Static Assets to serve `dist/` directly. This includes the HTML, JavaScript modules, lessons, vocabulary, stories, styles, and illustrations. No Worker application code, database, or server is required for the current features.

### Connect this GitHub repository

In the Cloudflare dashboard, open **Workers & Pages**, create an application, and import `davletovb/aytim` from GitHub as a Worker. Use these settings:

| Setting | Value |
| --- | --- |
| Worker name | `aytim` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | Leave empty |
| Deploy command | `npm run deploy` |

Cloudflare installs the tooling declared in `package.json` and uses the checked-in Wrangler configuration. Deploy the application to receive its Cloudflare URL. Once Git integration is connected, pushes to `main` trigger deployments in Cloudflare.

### Deploy from your machine

```sh
npm ci
npm run deploy:check
npx wrangler login
npm run deploy
```

`deploy:check` validates the deployment without publishing or requiring a Cloudflare login. The actual deploy requires your Cloudflare account and prints the live URL. If you have access to multiple Cloudflare accounts, select the intended account when prompted or set `CLOUDFLARE_ACCOUNT_ID` in your local environment.

The production Worker name must match `name` in `wrangler.jsonc`. Add a custom domain through the Worker's **Settings > Domains & Routes** after deploying.

## Cloudflare Pages alternative

The same `dist/` files also work with Cloudflare Pages. Import this repository as a **Pages** project and use these settings:

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
- `dist/content.mjs`, `dist/words.mjs`, `dist/stories.mjs`: learning content.
- `dist/engine.mjs`, `dist/journey.mjs`, `dist/practice.mjs`, `dist/home-progress.mjs`: learning and progress logic.
- `dist/*copy.mjs`: interface translations.
- `dist/styles.css`, `dist/home.css`, and SVG assets: presentation.

## Learning data and audio

Progress and settings are stored in the learner's browser, separately for each website origin. Moving to a Cloudflare URL or a new custom domain does not automatically transfer progress from the old URL. The legacy `lingua-loop.v1` storage key is retained so the rename to Aytim preserves existing progress on the same origin.

All learning content is included in this repository. D1 is not needed to serve it; shared accounts and progress synchronization would require a separate backend feature.

Pronunciation uses the browser's available speech synthesis voices. Changing the hosting provider does not change voice availability or pronunciation quality.

## Cloudflare references

- [Deploy a static site on Workers](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Workers asset configuration](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Workers Git build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Deploy static HTML to Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
