# F03 — Multilingual Translation and Naturalness QA

**Review date:** 2026-11-13  
**Baseline:** `main` at `f7a81f4e2abf10ee27414a33ef8d0ff9cbeaf90b`  
**Parent audit:** [Aytim content quality audit](content-quality-audit-2026-11-13.md)  
**Languages:** Uzbek, English, Russian, Modern Standard Arabic, Turkish and German (30 ordered learning directions)  
**Status:** Targeted editorial corrections merged with catalog-wide *mechanical* QA. **A complete independent native-speaker semantic proofread is still outstanding.**

## 1. Purpose and what was actually reviewed

This is a follow-up to **F03 — translation/register quality**. The correction slice deliberately retains all lesson IDs, story IDs, vocabulary IDs, language directions, question answers, level assignments and scoring rules.

The **mechanical QA** traverses:

| Class | Source entries | Localized text fields |
| --- | ---: | ---: |
| Lesson phrases | 384 | 2,304 |
| Vocabulary | 359 | 2,154 |
| Story lines | 177 | 1,062 |
| Curated dialogue-only replies | 28 | 168 |
| Story questions and options | 436 objects: 109 prompts + 327 answers | 2,616 |
| **Total** | **1,384 localized objects** | **8,304** |

Validated automatically for missing/blank locale fields, wrong-script Arabic/Russian values, placeholder/corrupt text, question-mark agreement, token-aligned Arabic Latin reading aids for entries, and identical answer options within each language. All passed in the updated branch.

**Editorial review:** Examined lesson and vocabulary examples across all levels, story titles and comprehension questions, dialogue reply meaning, and suspicious semantic/formality patterns. Corrected high-confidence errors and ambiguity. This is an **editorial sample and issue-driven pass**, not a field-by-field native review of all 8,304 renderings and not a CEFR assessment. Automated validators cannot recognize every false friend, case error, discourse mismatch or unnatural idiom.

## 2. Corrections made

The following rows are grouped by **stable content entry ID**. Arabic reading aids are updated whenever the Arabic text changed.

### Lessons: meaning, grammatical role, naturalness and formal register

| ID | Language | Correction and rationale |
| --- | --- | --- |
| `hotel-3` | Arabic | Changed “leave the room” to **تسجيل المغادرة** (hotel check-out), matching the intended hospitality action. |
| `phone-call-2` | Arabic | Replaced wording meaning “she is far from her desk” with **ليست عند مكتبها الآن** (“she is not at her desk now”). |
| `instructions-3` | Uzbek, Russian | Replaced questionnaire-specific **anketa / анкета** with form/blank equivalents **blank / бланк** in the step to fill out and send a form. |
| `airport-help-1` | Uzbek | Changed “which exit door does our flight fly from?” to the natural passenger question **Reysimizga qaysi eshikdan chiqamiz?** |
| `airport-help-5` | Uzbek | Changed “next empty flight” to **next flight with available seats**, restoring the availability condition. |
| `city-services-2` | German | Replaced a place “closing” as an agent with **Um wie viel Uhr schließen Sie hier?**, a service-staff question. |
| `city-services-5` | Russian | Made the building's **rear entrance** more idiomatic and explicit. |
| `formal-requests-5` | German | Corrected **Werktagen → Arbeitstagen** to match *working days* in formal correspondence. A German `Werktag` may include Saturday in common statutory contexts; the latter term must not be silently treated as an ordinary Monday–Friday workday. |
| `apologising-4` | Arabic | Made **سأصلح الأمر اليوم** unambiguously mean “I’ll put it right today,” not “I’ll fix this day.” |

### Vocabulary: headword scope and precise usage

| ID | Language | Correction and rationale |
| --- | --- | --- |
| `word-city-8` | Uzbek | **bekat → avtobus bekati** to explicitly name a *bus* stop. |
| `word-travel-4` | German | **die Fahrkarte → das Ticket** for a generic travel ticket (including air travel, not only a ground-transport ticket). |
| `word-mood-5` | Russian | **хочет пить → хочется пить**; the former is third-person “(someone) wants to drink,” while the latter is an idiomatic impersonal expression for thirst. |
| `word-instructions-1` | Uzbek, Russian | **anketa / анкета → blank / бланк** for the general document form in this course context rather than specifically a questionnaire. |
| `word-repairs-4` | Uzbek | **taxminiy narx → xarajatlar smetasi** to describe a cost estimate/quote, not only an approximate price. |
| `word-formal-correspondence-7` | German | **der Werktag → der Arbeitstag**, consistent with the related formal request phrase. |

### Curated dialogue replies: speaker neutrality and equivalence

| Exchange ID | Language | Correction and rationale |
| --- | --- | --- |
| `colors` | Arabic | **لونه أزرق** now agrees with the masculine demonstrative/object in the cue rather than presupposing an unspecified feminine referent. |
| `meal` | Arabic | **أنصح بحساء الخضار** preserves the recommendation without requiring a masculine addressee. |
| `travel`, `problems` | Arabic | Replaced masculine-speaker **آسف** with context-appropriate, speaker-neutral **عذرًا**. |
| `post-office` | Arabic | Corrected verb agreement **تكلف → يكلّف**, referring to masculine **الشحن** (“shipping”) in the cue. |
| `airport-help` | Uzbek | The reply now explicitly says **flight with available seats**, not an empty flight. |
| `memories` | Arabic | Reworded the question into a more idiomatic **ما أكثر شيء تغيّر؟** (“What changed most?”). |
| `community-garden` | Arabic | Used **هذا صحيح** rather than a male-only addressee form for “You're right / That's right.” |
| `apologising` | German | Rephrased “thanks for the information” to the more equivalent **danke, dass Sie mir Bescheid gesagt haben** (“thanks for letting me know”). |

### Stories: translated titles and summaries

| Story ID | Language | Correction and rationale |
| --- | --- | --- |
| `route-home` | Uzbek title | **Uyga qaytishning ikki yo‘li** preserves the two routes in “Two ways home.” |
| `missed-coach` | Uzbek title | **Keyingi avtobusga ulgurolmaslik** distinguishes a missed connecting bus from a bus that merely drove past. |
| `new-meeting-time` | German title | **Eine neue Zeit für das Treffen** specifies the meeting, not just an arbitrary new time. |
| `baggage-report` | Uzbek description | Clearly identifies a suitcase that **did not arrive**, rather than an unspecified suitcase report. |
| `missing-delivery` | Uzbek description | Replaces “before making a complaint” with **“before accusing someone”**, preserving the story's crucial distinction between a delivery mistake and an unsupported theft accusation. |
| `library-hours-pilot` | Uzbek description | Restores the three analytical factors in the source: **cost, participation and incomplete evidence**, rather than claiming only that the team discussed the trial's result. |

## 3. Editorial policy and what not to “correct”

1. **Semantic intent before word-for-word similarity.** A natural equivalent is preferable to grammatical mimicry, but must preserve the speaker, tense, negation, quantity, time/deadline and any consequential qualifier.
2. **Register consistency.** The same dialogue should not unexpectedly alternate informal/intimate address with formal service language unless the context justifies it. Formality in German, Russian, Turkish, Uzbek and Arabic is **not mapped one-to-one**; record when alternatives depend on social relationship.
3. **Gender and person.** Arabic, German and Russian often mark gender or person where English/Uzbek/Turkish do not. The app's `speaker-forms.mjs` handles certain first-person gender variants in lessons, but not every addressee variant, vocabulary item or story. Avoid assigning a gender to an unknown speaker just to translate generic English “you” or “sorry.”
4. **Arabic verb lemmas are not necessarily mistranslations.** The 3rd-person masculine singular perfect is a standard **Arabic dictionary citation form** for the English infinitive gloss (e.g. كتب for “to write”). Replacing all of these with verbal nouns would be an unjustified “correction”; add conjugation/lemma guidance when teaching grammar instead.
5. **Consequence-sensitive content:** dates and business-day terms, allergies, fees, travel tickets, transport connections and instructions for public services must be checked in context. A seemingly small difference can change the action a learner takes.
6. **Keep review status honest.** Structural checks, a bilingual editorial pass, native-speaker approval and live-audio validation are separate milestones.

### Supporting reference material

- [German `Werktag` and Saturdays (KomNet NRW)](https://www.komnet.nrw.de/_sitetools/dialog/5136)
- [Uzbek dictionary entry for `blank` (Izoh.uz)](https://izoh.uz/word/blank)
- [Arabic verb dictionary citation forms (Elon.io)](https://elon.io/grammar/arabic-modern-standard/verbs/dictionary-form)

## 4. Quality gates and validation

Added [`test/translation-quality.test.mjs`](../test/translation-quality.test.mjs), which enforces:

- all **8,304** source content fields maintain a six-language translation and the expected Arabic/Russian script;
- all **948** lesson/vocabulary/story/dialogue entries retain a valid Arabic reading aid;
- all 109 story questions have three **distinct** options in every target language and matching question punctuation;
- the corrected semantics and speaker/register-sensitive phrases cannot silently regress;
- story title and summary mismatches do not reappear.

Catalog counts, object IDs, lesson scores, level unlocks and story pass thresholds are intentionally unchanged. Text is still accessed through existing shared content objects, so corrections affect lesson cards, audio, listening and word-bank practice in all 30 language directions.

## 5. Remaining items before F03 can be considered fully closed

**This PR does not certify all 8,304 fields as native-quality translations.** The following work remains necessary for that claim:

- Independent native-speaker review **per language** for every lesson phrase, vocabulary word, story line and question/choice, plus each curated dialogue reply and story title/description. Record accept/correct/variant-needed and reviewer rationale.
- Establish **source intent and register tags**, including informal/formal target variants; avoid treating translations as an unrestricted one-to-one dictionary.
- Check gender/person agreement in dialogue and all 30 language directions, including Arabic feminine forms and the correct context for Russian and German variants.
- Review allergy terms and other medically consequential language with extra care; terminology for “nuts” may not align exactly across cultures and categories.
- Audio and speech recognition validation on actual browsers after changing wording and Arabic reading aids (F08 remains separately open).
- Resume the same per-field human review whenever new content is added; passing a linter alone must never mark an entry as “approved.”

**Recommended status:** F03 **improved substantially at the code and QA level**, but **editorial certification pending** until the field-by-field native-speaker review is completed.
