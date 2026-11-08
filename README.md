# Aytim

A language learning website with short lessons, stories, vocabulary practice, quizzes, and spaced repetition. Practice Uzbek, English, Russian, Arabic, Turkish, and German in any direction.

## Run locally

The complete website lives in `dist/`. It uses native JavaScript modules and has no build step or package dependencies.

From the repository root, run:

```sh
python3 -m http.server 8080 --directory dist
```

Open <http://localhost:8080>. Serve the files over HTTP rather than opening `index.html` directly, so JavaScript modules load correctly.

## Deploy

Publish `dist/` to a static host. For Cloudflare Pages, leave the build command empty and set the output directory to `dist`.

The `.openai/hosting.json` file identifies the existing ChatGPT Sites project and its static directory.

## Source layout

- `dist/index.html`: page shell, branding, and metadata.
- `dist/app.mjs`: navigation, interface, saved state, and browser audio.
- `dist/content.mjs`, `dist/words.mjs`, `dist/stories.mjs`: learning content.
- `dist/engine.mjs`, `dist/journey.mjs`, `dist/practice.mjs`, `dist/home-progress.mjs`: learning and progress logic.
- `dist/*copy.mjs`: interface translations.
- `dist/styles.css`, `dist/home.css`, and SVG assets: presentation.

Progress and settings are stored in the learner's browser, separately for each website origin. The legacy `lingua-loop.v1` storage key is retained so the rename to Aytim preserves existing progress on the same origin. Pronunciation uses the browser's available speech synthesis voices.
