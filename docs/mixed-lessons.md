# Mixed-skill lessons (Darslar)

The 64 lessons share `dist/lesson-flow.mjs`. Starting a lesson opens a continuous
mixed-skill sequence in one stable lesson panel.

The sequence previews **all six phrases**, with translations and audio.
Every subsequent exercise is based on those familiar examples. There is no
special two-phrase holdout, separate hidden subscore or additional requirement
beyond the normal lesson pass score.

`lessonVocabulary` in `dist/journey.mjs` shares each level's word groups out
evenly over its eight lessons, in catalog order, so every word belongs to
exactly one lesson. An unscored `word-intro` card presents that lesson's words
immediately before the scored `word-meaning` question that asks about one of
them. Advancing from that screen **schedules every introduced word** for
delayed review after one day; exposure alone never counts as a correct answer.
Recognition attempts and self-reported flashcard recall are tracked separately.

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
  writing, reverse translation, word-bank dictation, a vocabulary question
  and the final choice each contribute to the lesson score.
  **Listening counts**: both the listening choice and the dictation are scored.
- A wrong answer always shows the correct answer in the target language,
  including word-bank answers. The result screen then lists every phrase that
  was answered incorrectly, with its translation.
- Speaking is a separate, unnumbered, ungraded **speech-only practice** screen,
  with no meaning choice. With consent, browser SpeechRecognition attempts to
  transcribe the phrase; Aytim compares the result to the target phrase.
  It is a textual match, not a phonetic pronunciation-quality assessment.
  Recognition may use an external online speech service.
- Without a usable voice (or when the learner chooses **Can't listen? Show the
  meaning**), the listening choice shows its transcript, which makes it a reading
  question, and the dictation shows the sentence's meaning in the base language,
  which makes it a writing question. Both still count, but neither can be answered
  by copying, and they are recorded as reading/recall evidence, not listening.
- Writing/dictation word banks are never one-word tap tasks: phrases with two or
  more target-language words are selected, and a meaningful choice task replaces
  a word bank when no such phrase exists. Writing uses the lesson's longest phrase
  (ties in lesson order); dictation uses the next one.
- Word banks add two extra words from the same lesson that must be left out, so the
  check button does not reveal the answer length. Tiles carry no punctuation, and
  the first word is shown in lower case unless it is always capitalised (names,
  German nouns, formal *Sie*, English *I*). Natural alternative word orders listed in
  `dist/word-orders.mjs` are accepted; every writing sentence in all six languages
  has been reviewed for them.
- When the same phrase is tested twice in one lesson, a miss on either question
  keeps it due for review.
- An incorrect answer may add an unscored recovery card immediately after it,
  at most twice per lesson. Recovery and speaking practice cards do not alter
  the question denominator or lesson pass threshold.

## Progress storage

Each lesson stores its highest **percentage correct** (0–100) in `course.best`.
Optional `vocabProgress` stores item-level vocabulary metrics without
invalidating existing saved courses. Older `transferBest` values are accepted
on load for compatibility but are no longer calculated or displayed.
A score of at least 80% unlocks the next lesson. New attempts display the
correct/total score and pass outcome; unsuccessful attempts also show the
threshold for retrying. The result page no longer shows implementation details
about review cards or a separate two-phrase score. The personal best is stored
as a percentage to handle eight- and nine-question lessons fairly.

The next lesson unlocks sequentially on completion; an independently passed
`Daraja testi` unlocks the next level at 10/12 (80%, rounded up). Lesson and vocabulary
items retain their explicit level metadata.

## Adaptation and limitations

Recent listening, recall or reading difficulties can add one extra scored
question from the lesson's curriculum. This changes both the denominator
and the rounded-up threshold, and it cannot silently alter the result.

Word-bank reconstruction is a constrained task with supplied tiles/audio;
it is not free-form writing, spontaneous speaking, or validated proficiency.

Audio quality depends on the browser/device. Speaking lesson transcript checks
use the Web Speech API (SpeechRecognition or webkitSpeechRecognition); this is
not uniformly available and can call a third-party server. Aytim does not
store speech recordings or transcript results. The separate speaking skill
practice retains optional local MediaRecorder playback. No reliable phonetic
pronunciation scoring or AI correction is claimed. Word-bank sentence building
is not free-form writing.

## Checks

Run `npm test` and `npm run deploy:check` when a Node environment is available.
Exercise a standard 8-question lesson and an adaptive 9-question lesson,
including a failed attempt at 6/8 or 7/9, a passed attempt at 7/8 or 8/9,
recovery cards, and loading a saved percentage score. Check RTL Arabic,
small screens, speech recognition supported/unsupported and permission
granted/denied, and missing browser voices. Verify Cloudflare's deployment follows the merged `main` commit.
