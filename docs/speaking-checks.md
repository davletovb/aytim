# Speaking checks in lessons

A lesson's speaking turn checks what the learner said against the phrase. It is
formative: it is not a pronunciation grade and never changes the lesson score.

## How it works

1. The page records the phrase itself (`getUserMedia` and the Web Audio API in
   `dist/speech-capture.mjs`): 16 kHz mono 16-bit WAV, at most 12 seconds, with
   leading and trailing silence trimmed. A silent recording is never sent.
2. It posts the clip to the Worker, `POST /api/speech?lang=<code>` (`src/recognition.mjs`).
3. The Worker asks a recognizer for the text and answers `{ transcript }`:

   | Target language | Recognizer | Why |
   | --- | --- | --- |
   | Uzbek | Azure speech-to-text, short-audio REST API, `uz-UZ` | Whisper does not recognize Uzbek usefully (WER near or above 100%) |
   | English, Russian, Arabic, Turkish, German | Whisper large-v3 turbo on Cloudflare Workers AI (`@cf/openai/whisper-large-v3-turbo`) | Runs inside Cloudflare through the `AI` binding: no extra vendor or key |

4. `lessonReferenceMatch` compares the text with the phrase and displays a check
   or cross with the microphone.

Because the page records the audio itself, this works wherever it can open the
microphone: browsers without the Web Speech API, and Telegram's own apps, whose
web view has no speech recognition service. Developer reports say Telegram's
Android app asks for the microphone on every request, so the page keeps one
microphone stream open while the learner is on a speaking question and releases it
when they leave the question or hide Aytim.

**Nothing is stored.** The Worker neither keeps the audio nor logs the transcript;
neither reaches D1, R2 or progress exports. The clip is sent only to the recognizer
for its language (Microsoft for Uzbek, Cloudflare for the rest).

## Fallbacks

The microphone button chooses a method each time it is pressed:

| Situation | What happens |
| --- | --- |
| The page can record and Aytim's check is available | Aytim's check (above) |
| Aytim's check answered that it is unavailable (not configured, over budget, recognizer down, or a static host without the Worker) | For the rest of the session, the microphone can use the browser's own Web Speech API where supported. The learner can continue the lesson either way. |
| The microphone was denied or is missing | The microphone button is disabled and the learner can continue the lesson. |
| Too many checks from one address (20 a minute) | A "wait a moment" message; the next press tries again |
| No connection | A connection message; the next press tries again |

## Cost controls

Recognition is meant to stay inside free allowances:

- **Azure (Uzbek):** F0 includes 5 audio hours a month. The Worker reserves each
  clip's seconds (rounded up) in D1 table `speech_budget` before calling Azure, and
  refuses new clips above **16,200 seconds (4.5 hours) a month**.
- **Workers AI (other languages):** the free allocation of 10,000 neurons a day
  covers about 214 minutes of Whisper turbo. The Worker stops at **12,000 seconds
  (200 minutes) a day**, counted per UTC day like the allocation.
- **Rate limit:** the `SPEECH_LIMITER` binding allows 20 checks a minute per
  address, so a script cannot spend the day's budget at once.

Over a cap, the endpoint answers 429 and the page falls back as described above.
To raise a cap (for example after moving the Azure resource to S0, about $1 per
audio hour), set the Worker variable `SPEECH_AZURE_SECONDS_PER_MONTH` or
`SPEECH_WHISPER_SECONDS_PER_DAY`. At roughly 5 seconds a clip, the default caps
allow about 3,200 Uzbek checks a month and 2,400 checks a day in the other languages.

## Setup

- **Azure:** none beyond [Azure text-to-speech](azure-speech.md). Recognition uses the
  same `AZURE_SPEECH_KEY` secret and `AZURE_SPEECH_REGION`.
- **Workers AI and the rate limiter:** their bindings are committed in `wrangler.jsonc`
  (`AI`, `SPEECH_LIMITER`); Workers AI needs no key. They exist only in deployed and
  `wrangler dev` Workers.
- **D1:** `npm run deploy` applies migration `0005_speech_budget.sql` before deploying.
  Without the table, the budget cannot be reserved and every check falls back.

## Manual checklist on real devices

1. Chrome on Android and desktop, Safari on iOS and macOS: record a matching and a
   different phrase in all six target languages (Uzbek and Arabic especially), and
   check that the card shows a check or cross respectively.
2. Telegram on Android, iOS and desktop: the microphone button records and checks.
   On Android, the microphone prompt appears once per speaking question, not per press.
   Where the microphone cannot be opened, the learner can continue the lesson.
3. Deny the microphone. The card explains the error and Continue stays available.
4. Stay silent and press stop: "No speech was heard", without a request to `/api/speech`.
5. Navigate away while recording or while the check is running: nothing changes
   afterwards, and the device's microphone indicator turns off.
6. Confirm that no audio or transcript appears in D1, R2 or progress exports.
