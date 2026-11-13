# Azure neural speech integration

Aytim now prefers Azure neural text-to-speech for **Uzbek, English, Russian, Arabic, Turkish, and German**. Every language has a female and male voice. The browser randomly selects a voice on each playback unless the curriculum phrase explicitly changes its first-person grammar according to the user's selected speaker form; in that case it preserves the grammar. This is voice diversity, not an assessment of learner pronunciation.

## Cloudflare setup

1. Add encrypted Worker runtime secret `AZURE_SPEECH_KEY` in the Cloudflare dashboard.
2. `AZURE_SPEECH_REGION=germanywestcentral` is committed under `vars` in `wrangler.jsonc`; do not commit the key.
3. Run `npm run deploy` once with production D1 permissions to apply migration `0004_azure_audio_budget.sql` before enabling the audio endpoint.
4. Create the private R2 Standard storage bucket named `aytim-audio` in the same Cloudflare account as the Worker. Its binding is **already committed** in `wrangler.jsonc` as `AUDIO` → `aytim-audio`. Do not add a second binding through the dashboard. The Worker checks edge cache first, then R2, and only generates Azure audio on a cache miss. R2 is private and requires no public URL. If the bucket is missing from the deployment account, the deployment may fail to bind R2.
5. Deploy the Worker, test a phrase from every language, and verify browser fallback on an Azure failure. No browser API key or public R2 bucket is needed.

The Worker exposes `GET /api/audio?id=<known-id>&lang=<code>&gender=m|f`. Arbitrary input text is rejected; only published curriculum IDs are accepted. The Azure REST synthesis endpoint is computed from the region. Azure key never appears in the browser, in the MP3 URL, or in repository files.

Audio uses MP3 (24 kHz, 48 kbps), SSML, a rate of -10%, browser playback with explicit stop/cancel, and existing browser-synthesis fallback when Azure fails. Listening is marked heard only when playback finishes. Speech recognition remains a separate browser capability.

**Cost controls:** migration adds a D1 monthly budget counter. Before each Azure generation attempt, the Worker atomically reserves input character count and refuses new cache misses above **350,000 characters/month**, below the published F0 500,000-character free tier. Failed requests still count toward this local conservative cap. The quota is for Aytim traffic and does not account for other workloads on the same Azure resource. R2 cache keys use the exact text and voice and will invalidate after catalog changes. R2 provides cross-region reusable audio storage. The separate edge cache reduces R2 reads. A cache miss can still race with another request or retry after an R2 write failure, and such additional synthesis attempts count toward the D1 generation budget.

## Verification

Run `npm test` and `npm run deploy:check`. Test male and female Uzbek, Turkish vowel sounds, Russian stress, Arabic MSA register, German and English samples by listening with a native-language reviewer. Cloudflare secrets are not available to local tests; tests use a mock Azure response.

The original text-to-speech browser fallback is retained. It can still vary by device and is not equivalent to a verified listening assessment.
