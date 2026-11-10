# Mixed-skill lessons (Darslar)

The existing 56 lessons use the same `dist/lesson-flow.mjs` activity builder.
Selecting an unlocked lesson immediately starts a continuous sequence within
one stable lesson panel; users no longer need to study a separate phrase list
and then move into an unrelated six-question quiz.

## Activity sequence

A typical lesson combines the following activities, in order:

1. **Meet two phrases**: read translations, listen if a suitable device voice
   exists, and continue without a graded answer.
2. **Meaning choice**: one automatically scored translation task.
3. **Audio-first listening choice**: a target-language phrase and multiple-choice
   meaning question. A transcript fallback is available; this activity is
   formative and does not affect lesson completion.
4. **Fill the gap**: one scored missing-word question.
5. **Writing**: arrange shuffled target-language words into the correct sentence
   by tapping the tiles, with undo. The base-language prompt remains visible.
   Longer phrases are preferred at higher levels. This is **one of the five
   scored core questions**, with a single bottom button that changes from
   Check answer to Next question after submission.
6. **Reverse translation**: one scored multiple-choice question that starts in
   the base language and asks for the matching target-language expression.
   The old memorize/hide/rebuild task is retired; learners can still assemble
   sentences directly through the word-bank writing exercises.
7. **Dictation**: hear a target-language phrase and arrange a shuffled set of
   target-language word tiles in the correct order. The reference transcript can
   be revealed if needed. When audio is unavailable or the transcript is shown,
   the activity remains formative and is not treated as scored listening.
8. **Speaking**: repeat a phrase aloud, or describe a scenario at higher
   levels. Users may record and play back their voice **locally**; no microphone
   or cloud recognition is required, and pronunciation is not auto-graded.
9. **Final challenge**: one scored translation question.

This totals **five deterministic scored questions** and four formative tasks
in the standard sequence. A wrong core answer can insert an extra **unscored
recovery card** immediately after it, at most twice per lesson. Skill evidence
may also insert one more formative listening, writing or single-phrase reading item.

## Completion and progression

- Completing at least **4/5 core questions** marks the lesson passed, exactly
  as a score of 4 did in the old six-question lesson engine.
- The next lesson unlocks sequentially on completion.
- Incorrect word-bank writing **does** reduce the core score, just like an
  incorrect multiple-choice answer. Microphone access, unavailable audio and
  ungraded speaking practice **never** reduce the score.
- The existing direct **Daraja testi** still advances to the next level on
  a score of 8/12 regardless of lesson completions.
- Lesson and vocabulary items inherit the existing explicit level metadata.
- Saved lesson IDs and `best` completion scores are unchanged; older progress
  remains compatible with the new lesson renderer.

## Adaptation

The plan contains all four modalities, regardless of the learner's recent
performance. Recent failures in *listening*, *recall* or *reading* can add an
extra formative activity. Reading support now uses a **single phrase** instead
of showing two unrelated sentences. Core task count and unlock criteria never change.

Scored questions use the same catalog translations and deterministic answer
keys as the existing practice modules. These are short task contexts, not
large synthetic conversational passages, and no LLM service is used.

## Audio, privacy and limitations

Audio still uses browser voices, which can be unreliable or unavailable for
some languages. It is always optional for lesson completion. Speaking uses
`MediaRecorder` when available; recordings are kept only in transient browser
memory and revoked when leaving or advancing. No speech recognition, AI
feedback, scoring of accented speech or synthetic audio pack is claimed.

Writing is currently scored word-bank sentence assembly with fixed expected ordering.
Even a perfect result is not evidence of unrestricted writing proficiency.
After checking an answer, only short feedback appears; no repeated score
explanations or large reference-answer card are shown.
Listening dictation also uses word-bank sentence assembly rather than typing.
Neither listening dictation nor Yozish requires free-text entry in this version.
Listening screens no longer show the routine device-voice notice or a separate
"continue without audio" button. The transcript reveal remains available,
and missing voices are handled as an unscored fallback.

## Checks

- Run `npm test` for all 56 × 30 lesson plans, lesson unlocks, regression
  coverage, save compatibility and task content.
- Run `npm run deploy:check` to verify Worker bundle configuration.
- Browser smoke test: lesson 1, a mid-level lesson and Level 8; RTL Arabic,
  dark theme, narrow screens, keyboard-only navigation; recording permission
  granted and denied; browser with no available voice; responsive result screen;
  wrong answers introducing recovery cards without score changes.
- Verify Cloudflare deployment points to the merged `main` commit.

No browser/audio production checks are implied by passing source-module tests.
