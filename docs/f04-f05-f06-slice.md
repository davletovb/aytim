# F04 + F05 + F06 — Vocabulary, assessment, and extended reading

> **F04 update (2026-11-13):** The self-rated flashcard review described below has been replaced by [objectively scored bidirectional vocabulary tests](f04-objective-vocabulary-review.md). Multiple-choice and matching now run both ways, and only correct completed review rounds advance spaced intervals. This original slice remains a historical implementation record.

> **Updated 2026-11-13 — F05 UX simplification:** This report documents the original F04–F06 implementation. The two withheld lesson phrases, their `2/2` subscore, and the associated result explanation were subsequently **retired**. The current lesson flow previews all six phrases and shows only ordinary lesson results. Vocabulary scheduling (F04), eight-question scoring, and extended reading (F06) remain active. See [Mixed-skill lesson behavior](mixed-lessons.md).


**Slice date:** 2026-11-13  
**Audit:** [Aytim content quality audit](content-quality-audit-2026-11-13.md)  
**Scope:** The three learning-depth findings together. The previous F01/F03 corrections remain intact.

## Summary

The slice keeps the current **eight internal levels** and the existing 80% (rounded-up) lesson pass rule, but improves what learners encounter, review, and measure.

| Finding | Implemented | Evidence |
| --- | --- | --- |
| **F04 — vocabulary exposure is not recall** | All 486 catalog words are partitioned across 64 lesson word-introduction cards, by topic. Showing a card schedules every word for delayed review, while recognition answers and self-reported flashcard recall are tracked independently. | `vocabulary-progress.mjs`, `engine.mjs`, `app.mjs`, `progress-data.mjs` |
| **F05 — recognition-heavy assessment** | Two phrases per lesson are withheld from the opening preview, then used in first-encounter word-bank writing and audio-first dictation. Their **constrained reconstruction** score is shown and saved separately from lesson passing. | `lesson-flow.mjs`, `app.mjs`, `lesson-copy.mjs` |
| **F06 — short upper-level reading** | Three connected, original, multilingual extended texts for Levels 6, 7 and 8, with five graded questions each including evidence and inference. Extended readings are labelled in the catalog and show a separate higher-order question result. | `extended-stories.mjs`, `stories.mjs`, `practice.mjs`, `app.mjs` |

## F04 — Word scheduling and evidence

- The **word-introduction card** is the trigger: advancing from the card calls `introduceVocabulary()` with its full set of words and persists progress immediately.
- A newly introduced word has a **pending** review card (step -1), due one day later. This is **not counted as learned or correctly answered**. Re-entering the same lesson must not postpone existing or overdue cards.
- Scored vocabulary questions increment a recognition/assessment count when a real question is completed; simply saving a word manually does not. The flashcard “Known”/“Needs practice” response increments a **separate, explicitly self-reported recall** count.
- The Lug‘at word summary shows introduced / unlocked, objectively assessed and self-checked recall counts. These metrics never assert phonetic, conversational or durable mastery.
- The optional `course.vocabProgress` dictionary is validated in browser/Worker saves (bounded to 1,000 entries). Existing courses without this key remain accepted. The shared `cards` queue still owns the review due dates.

**Limitations:** Review scheduling provides an opportunity, not proof the learner later completed the review. Self-reported flashcard ratings are not objective recall tests. Mastery metrics should eventually use delayed active retrieval without answer reveal.

## F05 — First-encounter constrained production

- On each standard lesson, preview **four** of its six lesson phrases. The other **two** target-language phrases are not shown before their first graded appearance.
- Reconstruct the first reserved phrase from a base-language prompt using a word bank; reconstruct the second from audio using word tiles. This reduces immediate copying from the introduction and introduces a first-encounter challenge.
- The graded lesson total remains **8** (or **9** when an adaptive question is present). Passing remains **7/8** or **8/9** respectively.
- A separate `lessonFirstEncounterScore()` reports **0–2** correct on these first-encounter activities, and `transferBest` persists the best percentage for later analysis; it does not change lesson unlocking.
- The UI explicitly states this is **constrained production with supplied tiles/audio**, *not* free-form writing, speaking fluency or generalization to unrelated language contexts. This is a meaningful step toward F05, not a definitive solution to independent-production assessment.

**Next step beyond this slice:** Author reviewed genuinely novel contexts and calibrated productive tasks by target language, with clear scoring and accessibility alternatives. Do not automatically claim CEFR proficiency.

## F06 — Extended reading strand

Three new multilingual stories are available alongside the shorter stories (the original 28 remain, total becomes **31**). They are accessible at the relevant internal level, have normal audio/translation controls, and remain optional to the level-test unlock.

| Internal level | Story ID | Approx. English words | Comprehension |
| --- | --- | ---: | --- |
| **6** | `clinic-route` | **147** | Competing route constraints, updated deadline, evidence and inference |
| **7** | `missing-delivery` | **163** | Verify claims against records, distinguish a mistake from an unproven accusation, prevention |
| **8** | `library-hours-pilot` | **210** | Sampling bias, a confounding event, budget evidence, policy trade-offs and qualified conclusions |

Each includes **five** three-choice questions and passes at **4/5** (the existing story pass rule is two-thirds rounded up). Higher-order questions are labelled `inference`, `evidence`, `analysis`, `evaluation`, `synthesis`, or `application` in metadata; their aggregate accuracy appears separately as **reading comprehension**, not global language mastery. The highest percentage is stored in optional `readingDepthBest`.

**Future Levels 9+:** Reserve **much longer** reading (potentially 300–600+ words per connected text, increasing with the syllabus), primary-source style texts, comparing perspectives and evidence-backed written summaries. Do **not** add Level 9 now: the current path, level locking, placement, and saved-state validation still explicitly support eight levels. Extend those together when new levels are genuinely authored and calibrated, rather than presenting longer text as a hidden ninth level.

## QA and acceptance

Regression tests: [`test/learning-depth.test.mjs`](../test/learning-depth.test.mjs), existing catalog/progression/lesson tests.

Checked through source-level JavaScript module execution:
- **1,920** lesson configurations (64 lessons × 30 directions), with two genuinely hidden first-encounter source phrases each and unchanged 8-question passing denominator;
- **486/486** vocabulary entries scheduled once from their lesson introductions, each due after 24 hours, with no early recall;
- recognition and self-reported recall counters separated; optional progress survives the validation round trip;
- reading lengths **147 / 163 / 210 English words**, six-language presence and token-aligned Arabic reading aids;
- question choices and metadata present for the three texts.

**Not verified here:** `npm test` in a local Node checkout, live Cloudflare deployment, end-to-end browser/a11y/audio behavior, and independent native-language copyediting of all new material. A source-level check is not a full QA pass.

## Files modified

- New: [vocabulary-progress](../dist/vocabulary-progress.mjs), [extended stories](../dist/extended-stories.mjs), [regression tests](../test/learning-depth.test.mjs)
- Updated: [lesson flow](../dist/lesson-flow.mjs), [progress validation](../dist/progress-data.mjs), [engine](../dist/engine.mjs), [stories](../dist/stories.mjs), [practice](../dist/practice.mjs), [app](../dist/app.mjs), [copy](../dist/lesson-copy.mjs), [vocabulary copy](../dist/vocabulary-copy.mjs), [page copy](../dist/pages-copy.mjs), and exact catalog/progression story counts in tests.

### Explicit remaining limitations

- First-encounter tile reconstruction is stronger than repeating a preview, but is not general productive competence.
- Richer Level 6–8 reading is introduced without requiring learners to complete it before taking level tests.
- Some Arabic forms and other multilingual renderings require editorial native-speaker review; structural reading-aid alignment does not prove linguistic accuracy.
- Future Level 9+ content, longer assessment formats, CEFR benchmarking and direct speech grading are separate work.
