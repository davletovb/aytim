# F04 — Objective, bidirectional vocabulary review

**Date:** 2026-11-13  
**Replaces:** The reveal/“Got it”/“Needs practice” flashcard flow on the Lug‘at vocabulary page.  
**Scope:** All existing words and saved phrases in any of Aytim’s 30 base-target directions.  
**Progress:** All 359 vocabulary words remain accessible through existing lessons; no lesson or level unlock rules change.

## Learner experience

- **One short round:** up to **four due entries** at a time. A review may be started from Lug‘at, the Home quick-review action, or the next-activity path.
- **Multiple choice in both directions:** e.g. **Uzbek → Arabic** *and* **Arabic → Uzbek*. Choosing an answer submits it immediately, shows the correct answer, then advances using the existing Next control.
- **Pair matching in both directions:** select an item on the left and its translation on the right. The sides reverse for the other direction. Four pairs are shown whenever distinct distractors are available, even if only one entry is due.
- **One result:** correct attempts / total attempts (four scored checks per reviewed entry). No disclosure of technical submetrics or subjective “I know it” buttons.
- **Spaced repetition:** the learner must correctly complete **all four** checks (both directions × both formats) on the reviewed entry to advance that entry to its next review interval. Missed entries return later.
- A learner may voluntarily test saved entries early. A **correct** answer does not accelerate an existing review schedule, while an objectively **incorrect** result resets that entry to a sooner retry.
- Manually saving a word or phrase **does not count as a wrong answer**.

## Evidence and terminology

- **Exposure:** seeing a word in a lesson. This schedules review but cannot earn correctness.
- **Tested:** answering a scored vocabulary question (including lessons), regardless of whether it is correct.
- **Bidirectionally verified:** the **most recent** answer in each of forward/reverse choice and forward/reverse matching is correct. A subsequent incorrect attempt removes the verification until that mode is passed again. This is objectively scored recognition/association, **not independent recall or speech**.
- **Retained:** the entry also reaches spaced-review step 3 after multiple due-date intervals. Due-date spacing and repeated objective tests are stronger evidence than self-rating; however, this still does **not** prove free-form language production or long-term mastery outside the tested formats.

## Data and migration

- `reviewAssessmentVersion: 2` marks the objective-review system.
- Legacy progress is accepted. On the first course load, entries previously promoted by the old self-rated flashcards are requeued for objective review (`step: -1, due: now`); existing lesson scores, introduced vocabulary, and practice history are preserved.
- Optional legacy `recallAttempts/recallCorrect` are **read-only compatibility fields**; they do not count toward objective review evidence, status, or displayed progress.
- New word evidence is saved under `vocabProgress[word.id].reviewEvidence` with four bounded counters: `forwardChoice`, `reverseChoice`, `forwardMatch`, `reverseMatch` (attempts, correct, and latest-correct status). Counts are validated on import and Worker sync.
- The original review interval ladder (1/3/7/14/30 days) and ten-minute retry rule remain.
- Existing save format limits and language-pair isolation remain unchanged.

## Implementation

- [Review builder and legacy upgrade](../dist/vocabulary-review.mjs)
- [Objective review evidence](../dist/vocabulary-progress.mjs)
- [Review scheduling](../dist/engine.mjs)
- [UI and interaction](../dist/app.mjs)
- [Save validation](../dist/progress-data.mjs)
- [Translated UX copy](../dist/vocabulary-copy.mjs)
- [Tests](../test/vocabulary-review.test.mjs)

## Verification and limitations

Source-level tests exercise all **30 language directions**, four-entry batches, mixed phrase/word catalog, and single-entry reviews. They check forward/reverse choices, both matching boards, distinct answer options, correct scoring, failure handling, spaced scheduling, legacy migration, and saving four objective evidence counters.

**Needs live verification:** full `npm test`, browser interactions on desktop/mobile (including RTL Arabic matching layout), accessible keyboard/focus behavior, Cloudflare deployment, and real TTS availability. None is claimed complete from a source-level check.

**Further pedagogical work:** delayed free-form retrieval, usage in new contexts, synonyms/ambiguous meanings, audio recognition and independently scored production remain stronger possible signals for later levels.
