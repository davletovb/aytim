# Aytim Content Quality Audit

**Document date:** 2026-11-13  
**Audit baseline:** 2026-11-12  
**Repository:** [davletovb/aytim](https://github.com/davletovb/aytim)  
**Reviewed revision:** [f7f34b3](https://github.com/davletovb/aytim/commit/f7f34b384f56b06a3bdc27a50534c77ac900c8b7)  
**Status:** Findings and recommendations; no product/content fixes are implemented by this document.  
**Scope:** Uzbek, English, Russian, Modern Standard Arabic, Turkish, German and the 30 ordered base-to-target directions.

> **Executive conclusion:** Aytim is a structurally consistent multilingual phrase-learning and practice application with a sensible topic sequence. Its most important remaining problems are semantically weak dialogue pairings, overgeneralized grammar notes, inconsistent translation register/naturalness, and assessments that do not yet establish independent communicative ability. Correct these before scaling the catalog or claiming proficiency outcomes.

## 1. Scope and methodology

This is a **mixed structural and sample-based editorial audit**, not a complete native-speaker proofread. The repository's catalogs and practice design were reviewed; counts and examples were checked against the revision above.

- **Structural coverage:** lesson, vocabulary and story inventory; six-language text-field presence and basic script consistency; repeated text candidates; reading-aid availability; level distribution; question and dialogue structures.
- **Editorial sampling:** examples in all six languages from introductory to upper-level lessons, story passages, classroom copy, language notes and dialogue pairs. A specific editorial flag is **not** a claim that all similar entries are wrong.
- **Instructional assessment:** how new words enter the lesson flow, what the pass score measures, reading length and question design, dialogue realism, grammar coverage, and unsupported proficiency claims.
- **Not independently performed:** complete native-language proofreading of all 5,328 text fields; classroom trials; speech/audio evaluation on every browser; full end-to-end app/deployment testing; a formal CEFR alignment study.

### Catalog inventory at audit baseline

| Content | Count | Notes |
| --- | ---: | --- |
| Internal learning levels | 8 | Exactly 8 lessons at each level; **not CEFR certifications** |
| Lessons | 64 | 384 lesson phrases |
| Vocabulary entries | 359 | Shared entries across language directions |
| Stories | 28 | 145 story lines |
| Story-comprehension questions | 94 | Mainly three-choice comprehension |
| Conversation cue/reply pairs | 61 | Must be reviewed for conversational validity |
| Supported languages | 6 | 30 ordered base-to-target combinations |
| Language-specific fields sampled structurally | 5,328 | (384 + 359 + 145) × 6 |

| Internal level | Lessons | Vocabulary entries | Stories |
| --- | ---: | ---: | ---: |
| 1 | 8 | 57 | 3 |
| 2 | 8 | 65 | 3 |
| 3 | 8 | 38 | 5 |
| 4 | 8 | 39 | 3 |
| 5 | 8 | 46 | 3 |
| 6 | 8 | 38 | 4 |
| 7 | 8 | 38 | 3 |
| 8 | 8 | 38 | 4 |

**Structural results:** No empty text fields, obvious wrong-script entries, or missing Arabic reading aids were identified by the structural checks across the catalog. These tests are **not** evidence of semantic accuracy, naturalness or correct pronunciation. The curriculum also already documents programmatic constraints for catalog uniqueness; that does not replace editorial review.

**Key sources:** [curriculum](curriculum.md), [lesson content](../dist/content.mjs), [expanded lessons](../dist/more-lessons.mjs), [vocabulary](../dist/words.mjs), [stories](../dist/stories.mjs), [reading aids](../dist/reading-aid.mjs).

## 2. Findings requiring correction

### F01 — Non-responsive conversational pairs (P0; confirmed)

Several predefined exchanges connect individually valid phrases that do **not** form natural question–answer turns. This risks teaching inappropriate conversational responses.

| Lesson / pair | Current cue → reply (English reference) | Problem | Recommended change |
| --- | --- | --- | --- |
| **introductions**, indices 3 → 4 | “Where are you from?” → “I live here.” | Residence is not necessarily place of origin. | Provide a true origin answer (“I'm from Uzbekistan,” as an example), and translate it across all six languages. |
| **meal**, indices 1 → 2 | “Which dish do you recommend?” → “I'll have the vegetable soup.” | A customer order does not answer a request for a recommendation. | Provide a staff recommendation (e.g., “I recommend the vegetable soup”), or rewrite the cue to request an order. |
| Other cue/reply candidates | “I don't understand.” → “Could you speak more slowly?” | Often two utterances from the **same** speaker rather than two conversational turns. | Model speaker roles and realistic dialogue sequences, not arbitrary phrase adjacency. |

The affected list has **61 pairs**. A two-speaker dialogue needs explicit speaker identity, turn intent, a semantically appropriate response, and culturally/register-appropriate wording in *each* language.

**Acceptance:** Every dialogue pair must be reviewed by a linguist/editor for semantic appropriateness, speaker perspective, register, response contingency, and translation equivalence. Retain only approved dialogues; if a valid response requires new phrases, add them rather than forcing a mismatch.

**Evidence:** [dialogue definitions](../dist/dialogues.mjs), [introduction phrases](../dist/content.mjs), [meal phrases](../dist/content.mjs).

### F02 — Overgeneralized or misleading grammar explanations (P0; confirmed)

Brief grammar notes are useful, but learners can mistake them for universal rules.

- English: “Most questions need do, does or did at the front” omits questions with **be**, modal auxiliaries (*can*, *will*), and subject questions. Scope the rule to appropriate simple-present/past questions with lexical verbs and illustrate exceptions.
- English: “The order is subject, verb, object, and it hardly ever changes” overstates the rule. Questions, passives, fronting and intransitive clauses do not fit the simple template.
- Russian: “Adjectives and past-tense verbs follow [a noun's] gender” combines different agreement rules. Past-tense verbs agree with the **subject's** gender/number where relevant; adjectives agree with the noun they modify and reflect case and number.

The app currently supplies **five short language notes per target language**; it explicitly does not describe them as a grammar course. Nonetheless, the explanations should be accurate and bounded.

**Acceptance:** Review all notes and their six interface-language renderings; include at least one correctly contrasting example for every qualified rule; add editorial tests and references for language-specific grammar.

**Evidence:** [language notes](../dist/language-notes.mjs).

### F03 — Register and translation-naturalness mismatches (P1; editorial candidates)

The following examples are credible **review flags**, not universally invalid grammar. A native-speaker reviewer should approve the final form in context.

| ID | Source/current rendering | Concern / review direction |
| --- | --- | --- |
| **greetings-1** | Uzbek **Salom!** versus Russian **Здравствуйте!** | Informal versus formal politeness. Either align the register or explicitly label alternatives. |
| **greetings-6** | Arabic **إلى الغد!** for “See you tomorrow!” | Intelligible, but less idiomatic in this interaction than a context-appropriate form of **أراك غدًا**. Check addressee gender and context. |
| **evaluating-evidence-1** | German “Die Umfrageergebnisse sind nützlich, bilden aber möglicherweise nicht alle Bewohner ab.” | Could be more precise about representing **residents' views**, as the Uzbek/Russian/Turkish translations do. |
| **bakery-1** | Arabic “هل خُبز هذا الخبز اليوم؟” | Grammatically interpretable but lexically repetitive; review a more idiomatic bakery interaction. |

Also check person/gender defaults, formality, culture-specific pragmatic meaning, synonym acceptance, and phrases that only work when a particular speaker or addressee is assumed.

**Acceptance:** For each phrase, store a semantic intent, target register and validated translation; log reviewer, date and uncertainty. Resolve high-impact mismatches first, followed by stylistic improvements.

**Evidence:** [lesson catalog](../dist/content.mjs), [expanded lessons](../dist/more-lessons.mjs).

## 3. Curriculum and assessment gaps

### F04 — Vocabulary coverage versus retrieval coverage (P1; confirmed design limitation)

The lesson flow introduces a lesson's vocabulary share and ordinarily includes **one vocabulary-meaning question per lesson** when its vocabulary block is present. Thus a single pass through 64 lessons can directly assess **at most 64 distinct vocabulary entries in those specific lesson questions** versus 359 entries in the catalog. This is a coverage upper bound, **not** a count of all retrieval opportunities: other practice screens and level tests may test additional items.

A learner should not be considered to have learned a word merely because its card appeared.

**Recommendation:** Track each item's exposures and retrieval attempts; ensure every introduced word receives delayed, varied retrieval (comprehension, recognition, use in context) and prioritize weak items. Monitor item-level recall by interval rather than raw XP alone.

**Acceptance:** Every newly introduced item is scheduled for at least one later recall test, and the app reports vocabulary retention and untested words.

**Evidence:** [lesson-flow implementation](../dist/lesson-flow.mjs), [vocabulary catalog](../dist/words.mjs).

### F05 — Recognition-heavy assessment does not prove productive language use (P1; confirmed design limitation)

Typical lesson activities include meaning selection, gap choices, listening recognition, word-bank writing/dictation, and a final choice. Learners see phrases and translations before many scored questions. These are sensible early-stage scaffolds, but allow performance based on short-term recognition rather than spontaneous production.

**Important scoring distinction:** Eight graded questions (or nine when adaptive support inserts one) and an 80% rounded-up pass threshold are internally consistent. **That does not validate the level of language mastery**. Speaking transcript practice is unnumbered and unscored because browser availability varies and transcript matching is not pronunciation grading.

**Recommendation:** Introduce unfamiliar transfer examples, sentence transformations, delayed recall, comprehension from new material, and eventually independent production appropriate to the target level. Report separately what is *observed* (quiz accuracy) and what has *not* been measured (conversational fluency).

**Acceptance:** Each level has a blueprint separating recognition, constrained production and comprehension of unseen material, with a validated minimum per category.

**Evidence:** [mixed lesson flow](../dist/lesson-flow.mjs), [lesson design](mixed-lessons.md).

### F06 — Advanced reading is short and comprehension is shallow (P2; confirmed)

Level 8's four stories contain **58, 84, 61, and 89 English words**, averaging **73 words**. The longest story anywhere in the reviewed catalog is **95 words**. Across the catalog, the 94 reading-comprehension questions are primarily short multiple-choice items rather than open-ended interpretation or synthesis.

This is reasonable for introductory guided practice, but insufficient as the sole reading benchmark for learners who want to handle extended arguments, professional texts or complex narratives.

**Recommendation:** Gradually increase passage length and discourse complexity; add inference, evidence evaluation, comparing viewpoints and short summarization, especially in Levels 6–8. Keep accessibility supports without making the answer obvious.

**Acceptance:** Upper-level stories and texts include graduated long-form reading with validated inferential questions, not only direct fact lookup.

**Evidence:** [stories](../dist/stories.mjs), [additional stories](../dist/more-stories.mjs).

### F07 — Insufficient explicit grammar and pair-specific instruction (P2; confirmed design gap)

Eight internal levels do not yet constitute a tested sequence of grammar concepts for each target language. For example, Turkish needs a systematic treatment of case suffixes, vowel harmony, polarity, aspect and word order; Modern Standard Arabic needs gender/person agreement, roots and verb patterns, nominal structures and plural patterns. German and Russian require more explicit case and inflection scaffolding.

The same shared base curriculum also means Uzbek→Turkish learners are not consistently taught contrastive errors and near-cognate traps specific to that direction.

**Recommendation:** Establish a concept map by target language, then add language-pair-specific notes and transfer traps. Keep a concept's introduction, practice and review linked across levels.

**Acceptance:** Document prerequisites and mastery checks for target-language grammar concepts, with at least one relevant contrastive example for prioritized language pairs.

**Evidence:** [curriculum](curriculum.md), [language notes](../dist/language-notes.mjs).

### F08 — Reading aids do not establish pronunciation correctness (P2; confirmed limitation)

The catalog has manually authored Arabic Latin-script reading aids and automated Russian transliteration. Structural presence alone cannot verify correct pronunciation. In particular, Russian spelling-to-Latin transliteration does not by itself mark word stress or unstressed-vowel reduction. Browser speech playback and browser speech recognition can be inconsistent and recognition may involve external speech processing.

**Recommendation:** Linguistically review pronunciation aids and audio, mark Russian lexical stress, define one transliteration convention per target language, and test device/browser language tags. Treat transcript matches as rough textual feedback rather than a phonetic score.

**Acceptance:** Reviewed audio and reading-aid samples for each language and a documented fallback for unavailable browser voices/recognition.

**Evidence:** [reading aids](../dist/reading-aid.mjs), [speaking and listening notes](mixed-lessons.md).

## 4. Corrective-action plan

| Priority | Workstream | Owner role | Evidence of completion |
| --- | --- | --- | --- |
| **P0** | Repair dialogue cue/reply corpus | Multilingual editor + curriculum lead | All 61 pairs manually validated; no non-responsive replies; automated speaker/translation shape checks |
| **P0** | Correct grammar overgeneralizations | Target-language linguists | Reviewed 30 notes and all UI-language renderings; examples and exceptions approved |
| **P1** | Translation and register QA | Native-language reviewers | Review log for all 384 phrases, vocabulary and story texts; tagged intent/register and approved edits |
| **P1** | Item-level vocabulary recall | Learning engineering | Coverage metric for 359 items, delayed reviews, item-level results |
| **P1** | Assess transfer and production | Curriculum + product | Level-specific question blueprints; unseen examples; separately reported measurement categories |
| **P2** | Expand extended reading | Curriculum + multilingual authors | Longer passages and inference/argument questions at upper levels |
| **P2** | Grammar concept map by target/pair | Curriculum + linguists | Prerequisite map, contrastive notes, corresponding review exercises |
| **P2** | Pronunciation aid QA | Native speakers + audio QA | Stress/reading-aid guidelines, recorded QA samples, browser fallback |

### Recommended execution order

1. **Freeze content expansion temporarily.** Do not multiply unreviewed phrases into more questions.
2. **Repair P0 content correctness.** Fix and manually verify the 61 conversation pairs and high-risk grammar notes across six languages.
3. **Establish an editorial manifest.** Store per-entry intent, context, formality, accepted variants, reviewer status and revision provenance.
4. **Improve assessment validity.** Guarantee review coverage for introduced vocabulary and add controlled transfer questions before increasing difficulty labels.
5. **Add depth to advanced learning.** Expand reading, target grammar and authentic productive tasks after correctness gates pass.
6. **Automate regression gates.** Reject empty/missing fields, invalid dialogue IDs, one-tile word-order tasks, duplicate candidate answers, inconsistent answer metadata, and unreviewed changes to approved content.

## 5. Reporting and verification rubric

For content improvements, track at least:

- **Review coverage:** approved entries / total entries, by target language and content type.
- **Translation accuracy:** material semantic mismatches per 100 reviewed entries, with severity and reviewer confidence.
- **Dialogue integrity:** approved pairs / 61 baseline pairs, measured independently per language.
- **Grammar correctness:** approved concept explanations / total concept explanations.
- **Retrieval coverage:** introduced vocabulary items with a later recall attempt / introduced items.
- **Learning transfer:** performance on unseen examples versus repeated examples, by level.
- **Pronunciation support:** reviewed audio/reading aids and browser-fallback pass rate by language.

### Exit criteria for treating the catalog as editorially ready

- No unresolved P0 dialogue or grammar issues.
- All existing entry translations have a human-review disposition (approved, corrected, flagged for alternatives).
- The item-level learning system can distinguish **exposure**, **recognition**, **recall** and **productive use**.
- Upper-level progression reflects measured reading/grammar demands rather than only topic labels.
- User-facing descriptions avoid presenting internal Levels 1–8 as CEFR proficiency certificates without external validation.

## 6. Limitations and decision record

- The findings above were established from a **repository snapshot**, not the live Cloudflare deployment.
- **Structural validation** covers catalog integrity, but is not a 5,328-field semantic proofread.
- Items in F03 are **editorial review candidates**, not a claim that alternative variants are categorically wrong.
- The pass rule measures offered activity performance, not speaking proficiency, pronunciation quality or CEFR mastery.
- Counts and specific source excerpts can change after the [reviewed commit](https://github.com/davletovb/aytim/commit/f7f34b384f56b06a3bdc27a50534c77ac900c8b7).
- This audit **does not change the application content**. It is a decision and prioritization document for subsequent work.

---

**Proposed next deliverable:** P0 audit correction PR containing a checked, speaker-aware conversation corpus and revised grammar notes, with regression tests and a review log.
