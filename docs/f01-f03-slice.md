# F01 + F03 — Curated dialogues and translation corrections

**Slice date:** 2026-11-13  
**Base:** [November 2026 content audit](content-quality-audit-2026-11-13.md)  
**Scope:** F01 (conversational integrity) and the **four specifically flagged** F03 examples (register/naturalness). No lesson scoring, vocabulary count, story content or level progression changes.

## F01: authentic speaker-to-speaker replies

The old `dist/dialogues.mjs` contained **61 pairs** that linked two existing lesson phrases without reliably distinguishing conversation turns from consecutive statements by the same speaker.

**Correction:** Curate explicit conversational responses instead of assuming adjacency is a valid reply. Retain only **18** previously existing pairs that make sense as two-speaker exchanges. Retire **43** original non-responsive, one-speaker or insufficiently specific pairings; add **28** explicitly authored responses with Uzbek, English, Russian, MSA Arabic, Turkish, German and Arabic Latin-script reading aids. The exercise now contains **46** curated pairs overall.

Examples of the corrected conversational meaning:

| Lesson | Cue | Correct reply |
| --- | --- | --- |
| Introductions | Where are you from? | I'm from Uzbekistan. |
| Ordering a meal | Which dish do you recommend? | I recommend the vegetable soup. |
| Classroom phrases | I don't understand. | Of course, I'll speak more slowly. |
| Paying for things | Do you take cards? | Yes, you can pay by card. |
| Working | When is this task due? | It's due on Friday. |
| Airport help | When is the next flight with available seats? | The next available flight leaves tomorrow morning. |

Other adjacent phrases can still be learned in their **lessons**, but they are no longer incorrectly presented as an answer in `Suhbat`. Nonresponsive or narrative-continuation tasks were removed from reply mode rather than silently relabeled as dialogues.

### Coverage and functional integration

| Level | Curated reply pairs |
| --- | ---: |
| 1 | 7 |
| 2 | 3 |
| 3 | 6 |
| 4 | 7 |
| 5 | 6 |
| 6 | 5 |
| 7 | 5 |
| 8 | 7 |
| **Total** | **46** |

The six-question reply round still works at every available level because it draws from earlier unlocked levels. New responses have stable `dialogue-` IDs, are registered for the speech-playback lookup and can enter the existing spaced-review queue after practice; without these integrations the answers would not be accessible for replay or later study. The base catalog remains **64 lessons and 384 lesson phrases**.

## F03: specific editorial flags corrected

| Phrase ID | Before | After | Rationale |
| --- | --- | --- | --- |
| `greetings-1` Russian | `Здравствуйте!` | `Привет!` | Matches the friendly/casual register of Uzbek `Salom!` and German `Hallo!`. Formal `Здравствуйте!` remains a valid translation in formal contexts, but is not the equivalent chosen for this casual greeting card. |
| `greetings-6` Arabic | `إلى الغد!` | `أراك غدًا!` | Natural directed “See you tomorrow!” phrase, with updated romanization. This form addresses a masculine singular listener; teach corresponding gender variants separately. |
| `bakery-1` Arabic | `هل خُبز هذا الخبز اليوم؟` | `هل خُبز هذا الرغيف اليوم؟` | Avoids repetition and identifies a loaf while asking whether it was baked today; updated reading aid. |
| `evaluating-evidence-1` German | `bilden aber möglicherweise nicht alle Bewohner ab` | `spiegeln aber möglicherweise nicht die Meinungen aller Einwohner wider` | Aligns the intended claim with survey respondents' *views* instead of merely representing the residents themselves. |

These four edits target the audited examples; they **do not** amount to independent native-speaker approval of every catalog translation. Register should eventually be explicit in lesson metadata and UI, especially where nearby phrases switch from casual greetings to polite second-person questions. Additional gender/addressee variants for Arabic need a separate speaker-form review.

## Regression checks

`test/dialogues.test.mjs` verifies:
- all curated exchanges have six nonempty texts, a distinct cue/answer and no accidental use of the old known-wrong pairs;
- all custom Arabic replies have token-aligned reading aids;
- every level and every one of the **30 language directions** generates six reply questions with four unique visible answer choices;
- synthetic replies enter spaced review by stable IDs;
- the four F03 source phrases keep the new translations and valid Arabic reading-aid alignment;
- the original 64 lesson / 384 phrase inventory is unchanged.

**Source-level verification performed:** 240 level/direction reply rounds and 1,440 generated answer-choice sets checked without failures; JavaScript app source parsed successfully, and a synthetic response's review round-trip succeeded.

**Not yet verified:** Full `npm test` in a local Node checkout, graphical/browser smoke test, audio behavior on live devices, deployed Cloudflare bundle, or complete native-speaker proofreading of the newly authored multilingual responses. These remain QA follow-ups and should not be described as already passed.

## Files in this slice

- [dialogue catalog](../dist/dialogues.mjs): curated pairs, custom responses, stable IDs
- [lesson content](../dist/content.mjs): Russian/Arabic greeting and Arabic bakery edits
- [expanded lessons](../dist/more-lessons.mjs): German survey correction
- [review engine](../dist/engine.mjs) and [app](../dist/app.mjs): expose custom replies to spaced review and audio
- [dialogue regression tests](../test/dialogues.test.mjs)

## Remaining editorial work

- Human native-speaker review of newly authored dialogue lines and their register in all six languages.
- Independent review of the other untranslated/unchanged corpus entries, beyond the four explicitly audited F03 examples.
- Context and politeness tags in the UI (including Arabic addressee-specific variants).
- Real-browser verification of speaking, reading-aid rendering and the `Suhbat` exercise.
