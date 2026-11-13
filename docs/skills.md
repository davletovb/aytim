# Listening, writing, and speaking — first functional slice

Aytim includes three **level-aware practice activities** inside the same
**Mashqlar** grid as translation, vocabulary, missing-word selection, listening
comprehension, matching and the level test. The keyboard-only spelling test has
been retired rather than duplicating the missing-word exercise. The general
12-question **Daraja testi** needs 10/12 (80%, the lesson standard) and presents
selectable questions and two sentence-building word banks instead of keyboard-based
spelling. The new skill checks **never unlock levels**
and should not be interpreted as CEFR-style certification.

## Access, progression, and task generation

Each skill offers Practice and Skill Check buttons. Practice chooses an appropriate
unlocked level using Aytim's current review-support logic; Skill Check uses the
learner's current unlocked level. Both draw five different lesson contexts from
the canonical eight-level curriculum. The Skill Check can be taken directly and
repeated. Existing lesson ordering, onboarding placement, vocabulary visibility,
stories, and checkpoint advancement are unaffected.

- **Listening:** Audio-first sentence reconstruction. Learners tap words from a
  shuffled bank in the order they hear, rather than entering free text. Revealing
  the reference, not hearing audio, or using the missing-voice fallback makes
  the response **unscored**. Listening screens do not display a routine voice
  quality warning or a separate skip-audio button; transcript reveal is available.
  Audio presently comes from the device's browser speech-synthesis voices; its
  quality and language coverage are inconsistent. Do not use the listening check
  as high-stakes or certified testing until reviewed, pre-generated audio is
  available. No unverified audio recordings have been added to the repository.
- **Writing:** The learner sees a sentence in the base language and taps words
  from a shuffled target-language word bank to construct the reference sentence.
  The bank holds two extra words from the same lesson that must be left out, tiles
  show no punctuation or sentence-initial capital, and natural alternative word
  orders from `dist/word-orders.mjs` are accepted. Tiles can be removed or the
  entire answer cleared before checking. Level 4+ uses longer curriculum phrases
  rather than unrestricted text input. Matching against the reference and its
  accepted orders is consistent without AI. This is **sentence construction**,
  not an assessment of unrestricted written fluency.
- **Speaking:** The learner repeats a phrase or, at higher levels, responds
  spontaneously to a situation. With permission, the browser's MediaRecorder
  records and plays audio back on the **same page**; microphone-unavailable users
  can practice aloud and continue. Speaking results count completed activities,
  **not pronunciation accuracy**. Recording blobs, transcription, and submitted
  written responses are never sent to Aytim's server or saved to D1.

Audio quality and writing/speaking proficiency must be calibrated against
human-reviewed examples before introducing automated progression gates. Future
iterations may add quality-checked audio packs, opt-in recognition and model
feedback, but those features are **not** claimed by this slice.

## Progress and privacy

The following shape is optional, and validated by the same shared save schema
used by the browser, JSON import, and Worker:

```json
{
  "skills": {
    "listening": {
      "practice": 2,
      "tests": {
        "3": { "attempts": 1, "best": 2, "total": 4, "completed": 5 }
      }
    }
  }
}
```

`practice` counts finished practice rounds. Each test stores attempts and
its highest *reference matches*, scored-item count, and completion count,
bounded to 0–5. Writing matches are **not** grammatical validity claims;
speaking tests have no automatically scored items. The save contains **no
recordings, transcripts, user-authored text, or microphone permissions**.

Progress stays separate for each of the 30 supported language pairs. Older
saves without `skills` remain valid. Invalid skill names, levels, result bounds,
or excessively large values are rejected.

## QA

Run `npm test` and `npm run deploy:check` from the repository root before
deploying. Browser acceptance checks should cover:

1. Skill practice and test sessions at Level 1 and after checkpoint advancement,
   without showing higher-level content.
2. Successful audio playback versus unavailable device voices; reveal fallback
   must not produce a scored listening result.
3. Recording permissions granted/denied, recording and playback, navigating
   away during recording, and ensuring no browser blob survives navigation.
4. Writing word order (including an accepted alternative order), extra tiles,
   duplicate tiles, RTL display and successful saves across page reloads and
   account sync.
5. Keyboard navigation, RTL Arabic, and narrow mobile screens.

This is a functional foundation, not a claim that professional-quality
text-to-speech, autonomous speaking assessment, or AI writing feedback
is already available.
