# Mixed-skill lessons (Darslar)

The 56 lessons share `dist/lesson-flow.mjs`. Starting a lesson opens a continuous
mixed-skill sequence in one stable lesson panel.

## Questions and scoring

- **Every answerable question counts exactly once.** Standard lessons contain
  eight graded questions, and any adaptive bonus question increases the displayed
  total (for example, nine). There are no hidden "main" versus "practice" scores.
- The pass threshold is **80%, rounded up**: 7/8 for standard lessons, 8/9
  when adaptation adds a question. Both the introduction and any recovery
  review cards are unnumbered, ungraded instruction screens.
- The introduction states the real total and pass requirement. The progress
  indicator shows the same total as the result screen. Failing results use
  that same dynamic requirement in all six interface languages.
- Meaning choice, audio-first listening choice, fill-the-gap, word-bank
  writing, reverse translation, word-bank dictation, spoken-phrase meaning
  choice, and final meaning choice all contribute to the score.
- The spoken-phrase meaning choice asks learners to say an expression aloud,
  then select its meaning. Optional on-device recording and playback remain
  available; **pronunciation itself is not auto-graded**.
- Listening and dictation provide a transcript fallback when browser voices
  are missing. A learner can still complete the associated objective answer;
  listening proficiency should not be inferred from a revealed transcript.
- An incorrect answer may add an unscored recovery card immediately after it,
  at most twice per lesson. The denominator never changes for these cards.

## Progress storage

There are no existing learner accounts or progress records to migrate. Each
lesson stores its highest **percentage correct** (0–100) in `course.best`.
A score of at least 80% unlocks the next lesson. New attempts always display
their exact raw correct/total result, even though the persisted personal best
is normalized to handle eight- and nine-question lessons fairly.

The next lesson unlocks sequentially on completion; an independently passed
`Daraja testi` still unlocks the next level at 8/12. Lesson and vocabulary
items retain their explicit level metadata.

## Adaptation and limitations

Recent listening, recall or reading difficulties can add one extra scored
question from the lesson's curriculum. This changes both the denominator
and the rounded-up threshold, and it cannot silently alter the result.

Audio quality depends on the browser/device. Local recording uses
`MediaRecorder`; recordings are not uploaded. No pronunciation scoring, speech
recognition, AI correction or reliable listening assessment with a revealed
transcript is claimed. Word-bank sentence building is not free-form writing.

## Checks

Run `npm test` and `npm run deploy:check` when a Node environment is available.
Exercise a standard 8-question lesson and an adaptive 9-question lesson,
including a failed attempt at 6/8 or 7/9, a passed attempt at 7/8 or 8/9,
recovery cards, and loading a saved percentage score. Check RTL Arabic,
small screens, speech recording with permission granted/denied, and missing
browser voices. Verify Cloudflare's deployment follows the merged `main` commit.
