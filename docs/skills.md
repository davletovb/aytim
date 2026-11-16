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
  shuffled bank in the order they hear. The learner can also reveal the meaning
  and build the target-language sentence from that cue. Scoring requires completed
  audio playback with the meaning hidden. The player uses Aytim audio and falls
  back to the browser's speech synthesis if needed.
- **Writing:** The learner sees a sentence in the base language and taps words
  from a shuffled target-language word bank to construct the reference sentence.
  The bank holds two extra words from the same lesson that must be left out, tiles
  show no punctuation or sentence-initial capital, and natural alternative word
  orders from `dist/word-orders.mjs` are accepted. Tiles can be removed or the
  entire answer cleared before checking. Level 4+ uses longer curriculum phrases
  rather than unrestricted text input. Matching against the reference and its
  accepted orders is consistent without AI. This is **sentence construction**,
  not an assessment of unrestricted written fluency.
- **Speaking:** Fixed phrases use the [same speech check as lessons](speaking-checks.md)
  and display a check or cross against the reference. Higher levels also have
  open-ended prompts with local recording and playback. Learners can speak aloud
  and continue if the microphone is unavailable. Speaking results count completed
  activities. Progress stores no recordings or transcripts.

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
