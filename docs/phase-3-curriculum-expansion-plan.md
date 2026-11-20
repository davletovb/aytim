# Phase 3 Curriculum & Pedagogical Expansion Plan (Revision 3)

> [!NOTE]
> **Review Document Only — No Implementation Code Modified Yet.**
> Baseline: `main` at commit `2769caf` (after PR #77 `c93de1b` and PR #78 `2769caf`; Rev 1 in `d1dc73c`, Rev 2 in `11ccec1`).
> This Revision 3 resolves every remaining invariant, rollout, vocabulary, distractor, and Telegram-story dependency finding from the Rev 2 review passes.

---

## 1. Executive Summary & Staging Strategy

Phases 1 and 2 of the content quality audit — plus Phase 3.4 ([`dist/language-notes.mjs`](../dist/language-notes.mjs) notes) — are merged on `main`. Honoring Aytim's prior decision records (PRs #24, #33, #35, #36, #56, #57, #64, #65, #75, #76, #77, [`docs/f03-translation-qa-2026-11-13.md`](./f03-translation-qa-2026-11-13.md), and [`docs/mixed-lessons.md`](./mixed-lessons.md)), Phase 3 is split into **four focused, independently reviewable PRs**:

| PR | Scope | Type | Gate / Dependency |
| :---: | :--- | :--- | :--- |
| **PR 1** | **Word-card split along word-group boundaries + cross-release active-lesson resume hardening + stale `README` resume note fix** | Code + doc fix | Zero catalog changes; immediately improves existing 9–16 word cards and protects both pre-PR-1 and PR 1 → PR 2 rollouts |
| **PR 2** | **Trimmed, topic-matched foundational vocabulary (+52 words, all groups `>= 5` words) + F03 neutral `عذرًا` + `weather` move + lexical harmonization** | Catalog + docs | Strict PR #35 global no-duplicates rule; `matchRound()` 5-card invariant verified; native-speaker sign-off recorded per F03 §5 |
| **PR 3** | **Curated web dialogues (`41/64` → `64/64` lessons) with hand-picked, audited distractors** | Catalog + docs | Every distractor verified pragmatically wrong across all 6 languages; native-speaker sign-off recorded per F03 §5 |
| **PR 4** | **Reading-depth question rewrites (genuine multi-clue higher-order questions) + Telegram story evidence-index sync** | Editorial + catalog | Question rewrites treated independently from the `readingDepthResult` display-threshold decision; [`src/telegram-stories.mjs`](../src/telegram-stories.mjs) evidence indices synced for any changed shared question |

### Explicitly Deferred / Out of Scope (Respecting Prior Decisions)
- **Hidden `Alifbo` (`alphabetSection`) & `Til haqida` (`languageNotesSection`):** Hidden since PR #33 (kept hidden in #76 and #77; [`dist/app.mjs:2218`](../dist/app.mjs#L2218) is never called). Dropped as a release goal and removed from manual release checklists; vocabulary is chosen purely on pedagogical value.
- **5 Telegram Branching Dialogue Scenes (`src/telegram-dialogues.mjs`):** Deferred while the default bot remains in vocabulary-companion mode (`Aytim ilovasini ochish` + `Tezkor mashqlar`; `/skills` and `/dialogue` are hidden behind `TELEGRAM_FULL_CHAT=1` per PR #65 and [`src/telegram-navigation.mjs:48`](../src/telegram-navigation.mjs#L48)).
- **Vocabulary & Custom-Dialogue Speaker-Form Machinery (former Workstream 4):** Deferred. Per F03 editorial policy ([`docs/f03-translation-qa-2026-11-13.md:85`](../docs/f03-translation-qa-2026-11-13.md#L85)), unknown-speaker generic `"sorry"` is not gendered; `word-polite-words-3` switches Arabic `آسف` → speaker-neutral **`عذرًا`** (`ʿudhran`) in PR 2, matching the earlier F03 replies and German `Entschuldigung`. All 28 existing and 22 planned custom replies remain speaker-neutral.
- **Numbers Expansion (`teens` `11–14, 16–19` AND `tens-and-hundreds` `40–1,000`):** Deferred together so numbers beyond `0–10, 15, 20, 30` expand coherently in one dedicated pass rather than leaving an `11–19` gap while adding `40–1,000`.
- **Off-Topic Vocabulary (`health-and-care`, `everyday-verbs`, `question-words`):** Deferred until dedicated lessons exist so PR #35's topic-alignment rule is preserved.
- **Forced Catch-Up Flow for Existing Learners:** Not added. Existing learners above Levels 1–4 — as well as learners at Levels 1–4 who already completed a touched lesson before deploy — see newly added words for completed/lower levels in Lug‘at (and can optionally save/review them) without forcing lesson replays or flooding their spaced-review queue.
- **Fresh Level-Test Scenarios:** Kept in its own separate PR as previously agreed.

### Baseline vs. Post-PR Metrics (Simulated & Verified)

| Dimension | Baseline (`2769caf`) | After PR 1 | After PR 2 | After PR 3 |
| :--- | :---: | :---: | :---: | :---: |
| Lessons / Lesson Phrases | `64` / `384` | `64` / `384` | `64` / `384` | `64` / `384` |
| Word Groups / Vocabulary Words | `68` / `489` | `68` / `489` | **`75` / `541`** (`+7` / `+52`) | `75` / `541` |
| Min / Max Words per Word Group | `5` / `14` | `5` / `14` | **`5` / `14`** (`matchRound` safe) | `5` / `14` |
| Max Words on One `word-intro` Card | `16` (`apartment`) | **`8`** (group-aligned) | **`8`** (group-aligned) | `8` |
| Web Curated Dialogues (`exchanges` / `custom`) | `41/64` (`46` / `28`) | `41/64` (`46` / `28`) | `41/64` (`46` / `28`) | **`64/64`** (`69` / `50`) |
| `translation-quality.test.mjs` Entries / Text Fields | `1,079` / `9,090` | `1,079` / `9,090` | **`1,131` / `9,402`** | **`1,153` / `9,534`** |
| `Daraja testi` Vocabulary Pool (`L1/L2/L3/L4` groups) | `9 / 11 / 8 / 8` | `9 / 11 / 8 / 8` | **`12 / 14 / 8 / 9`** | `12 / 14 / 8 / 9` |

---

## 2. Locked Decisions

| # | Topic | Final Resolution (Rev 3) |
| :---: | :--- | :--- |
| **1** | **PR Staging** | **4 focused PRs:** PR 1 code-only word-card split + resume hardening; PR 2 trimmed vocabulary (`+52` words); PR 3 audited web dialogues (`64/64`); PR 4 reading-depth question rewrites. |
| **2** | **Pronouns & `this`/`that`** | Drop `this`/`that` from vocabulary cards (eliminates `uz` `u` / `tr` `o` MCQ conflicts, German `jenes`, and `tr` `şu`/`su`). Gloss `you` as `sen / siz` · `ты / вы` · `أنتَ / أنتِ` · `du / Sie`, eliminating the German `Sie`/`sie` clash so all 5 personal pronouns (`I`, `you`, `he / she`, `we`, `they`) stay together in `L1 introductions`. |
| **3** | **Months & Seasons Placement** | Keep `months` (`January`–`December`) with `L2 routine` alongside `days` (`"May I…"` is in `L1 classroom-phrases`, so `level <= 3` holds natively). Keep `seasons-and-time` (using US English `fall`, PR #77) with `L2 telling-time` (loose fit explicitly accepted). |
| **4** | **German & Arabic Gloss Overlaps** | Targeted glosses: `word-character-1` (`tall`, L6) German `groß` → **`groß gewachsen`**; `word-building-words-2` (`corridor`, L4) Arabic `رواق` → **`ممرّ داخليّ`** (`mamarr dākhilī`, subject to Arabic editorial review; keeping `رواق` remains the zero-risk fallback). Both pass PR #35's strict global no-duplicates rule. |
| **5** | **Kinship (`relatives`)** | Use explicit Turkish **`küçük erkek kardeş`** (`younger brother`) and **`küçük kız kardeş`** (`younger sister`), plus two everyday entries **`husband`** (`uz: er`, `tr: koca`, `ru: муж`, `ar: زوج`, `de: der Ehemann`) and **`wife`** (`uz: xotin`, `tr: eş` or `hanım` — Turkish reviewer to confirm, `ru: жена`, `ar: زوجة`, `de: die Ehefrau`), avoiding the gender-mismatch and formal register of single-entry `spouse`. |
| **6** | **Arabic `"sorry"` & Speaker Forms** | Switch `word-polite-words-3` Arabic `آسف` → speaker-neutral **`عذرًا`** (`ʿudhran`) per F03 policy ([`docs/f03-translation-qa-2026-11-13.md:85`](../docs/f03-translation-qa-2026-11-13.md#L85)), deferring Workstream 4 machinery. |
| **7** | **Preview Cards & Card Simplicity** | Split strictly along **word-group boundaries**, capping any single oversized group at `<= 8` words per card via within-group balanced splitting. Keep the existing `lessonFlowWords` header label with **no extra counter** (honoring PRs #56, #57, #64). |
| **8** | **PR #35 No-Duplicates & `matchRound` Invariants** | Place all 7 new groups directly in [`dist/lesson-words.mjs`](../dist/lesson-words.mjs) so PR #35's global no-duplicates test covers every new word. **Every word group MUST contain `>= 5` words** (`matchRound()` takes 5 words from one group at [`dist/practice.mjs:220`](../dist/practice.mjs#L220), asserted by [`test/catalog.test.mjs:144`](../test/catalog.test.mjs#L144)): `personal-items` therefore includes `cup` (5 words total). |
| **9** | **Numbers & Object Adjectives** | Defer **`tens-and-hundreds`** (`40–1,000`) alongside **`teens`** (`11–14, 16–19`) so numbers expand together coherently later. In `L1 colors` (`basic-adjectives`), replace `bad`/`easy` with object-describing **`clean`** and **`heavy`** (`big, small, new, old, clean, heavy`). |
| **10** | **Existing Learners (No Forced Catch-Up)** | No forced catch-up flow. Both learners above Levels 1–4 and learners at Levels 1–4 who already completed a touched lesson before deploy see newly added lower/completed-lesson words in Lug‘at via `entryRevealed` without receiving their `word-intro` card or flooding their review queue. |

---

## 3. Detailed Plan by PR

---

### PR 1 — Word-Card Split Along Group Boundaries & Cross-Release Active-Lesson Resume Hardening (Code + Doc Fix)

> [!TIP]
> **Zero catalog edits in PR 1.** Ships independently to break up existing 9–16 word cards (`numbers`, `polite-requests`, `apartment`, `free-time`, `wellbeing`, `directions`) and make active-lesson resume safe across **both** the pre-PR-1 → PR 1 rollout AND the PR 1 → PR 2 catalog rollout.

#### Scoring & Progression Invariants
- **Standard lessons:** `8` scored questions, **`7/8`** to pass (`Math.ceil(8 * 0.8)`).
- **Adaptive lessons:** When `needsSupport(course, ...)` appends an extra scored question ([`dist/lesson-flow.mjs:89-95`](../dist/lesson-flow.mjs#L89-L95)), the lesson has `9` scored questions and requires **`8/9`** to pass ([`docs/mixed-lessons.md:23-28`](./mixed-lessons.md#L23-L28)).
- **`word-intro` cards remain unnumbered and unscored in both cases** (`isQuestion` excludes `'word-intro'`, [`dist/lesson-flow.mjs:10`](../dist/lesson-flow.mjs#L10)), and each card calls `introduceVocabulary(course(), question.examples)` as the learner advances ([`dist/app.mjs:1586-1589`](../dist/app.mjs#L1586-L1589)).

#### `[MODIFY]` [`dist/journey.mjs`](../dist/journey.mjs)
- Export `lessonVocabularyGroups(unit)` returning the ordered array of `wordGroup` objects mapped to `unit.id` via `lessonTopics`, with `lessonVocabulary(unit)` flattening `lessonVocabularyGroups(unit)`.

#### `[MODIFY]` [`dist/lesson-flow.mjs`](../dist/lesson-flow.mjs)
- Split `word-intro` cards **along word-group boundaries first**, applying balanced within-group splitting only when a single group exceeds `max = 8` words:
  ```js
  function wordIntroChunks(groups, max = 8) {
    return groups.flatMap(group => {
      const entries = group.words;
      const count = Math.ceil(entries.length / max);
      return Array.from({ length: count }, (_, index) =>
        entries.slice(
          Math.floor(index * entries.length / count),
          Math.floor((index + 1) * entries.length / count)
        )
      );
    });
  }
  ```
- Export a pure helper `lessonSequenceSignature(activities)` computing a compact structural fingerprint of the initial (pre-recovery) activity list — e.g.:
  ```js
  export function lessonSequenceSignature(activities) {
    return activities
      .map(item => `${item.task}:${(item.studyEntry ?? item.entry)?.id ?? ''}:${item.examples?.length ?? 0}`)
      .join('|');
  }
  ```
- Keep the existing `lessonFlowWords` header label (zero extra counters).

#### `[MODIFY]` [`dist/app.mjs`](../dist/app.mjs#L2554-L2598) — Cross-Release Active-Lesson Resume Hardening
- **Why both PR 1 and PR 2 need protection:**
  - `saveLesson()` divides by the number of scored answers ([`dist/engine.mjs:80`](../dist/engine.mjs#L80)), so a single misaligned answer skews the stored percentage.
  - Across **pre-PR-1 → PR 1**, `numbers` splits from 1 `word-intro` card into 2; a saved `word-meaning` answer could coincide with `chunk[0]` of the newly inserted second card.
  - Across **PR 1 → PR 2**, a session saved under the new `v2` key still faces two sequence shifts on changed lessons:
    1. `L1 introductions` saved right after `word-meaning` now expects the new `pronouns` `word-intro` card at that position.
    2. `L2 family` splits `relatives` (`11w` → `5 + 6`), whose second card starts with an **existing** word (`word-relatives-6`, `"son"`), creating a coincidental `entry.id` match even under `v2`.
  - Meanwhile, **unaffected lessons** (e.g., `L1 greetings`, `L3 cafe`) whose activity sequence did not change between PR 1 and PR 2 **must still resume seamlessly**.
- **Fix (handles PR 1, PR 2, and all future catalog releases without further key bumps):**
  1. Bump `lessonSessionKey` from `'aytim.lesson.v1'` → `'aytim.lesson.v2'` ([`dist/app.mjs:2557`](../dist/app.mjs#L2557)) so pre-PR-1 sessions discard cleanly on reload.
  2. Store `signature: lessonSequenceSignature(initialQuestions)` in the saved `tabStorage` payload (computed once when `startStudy` builds the initial activities, before any recovery insertions), and include `task: question.task` on each saved answer in `run.answers`.
  3. Extract pure, testable `replaySavedLesson(saved, questions)` (called by `restoreLesson()`):
     - If `!saved.signature || saved.signature !== lessonSequenceSignature(questions)` → call `forgetLesson()` and return `null` (changed lessons restart predictably; unaffected lessons pass because their signature is identical!).
     - During answer replay, enforce `entry.id === answer?.id && Boolean(answer?.scored) === Boolean(question.core) && (!answer.task || answer.task === question.task)`.
     - On any mismatch, call `forgetLesson()` and return `null` so a rejected session is never re-attempted on subsequent reloads.

#### `[MODIFY]` Tests & Docs for PR 1
- [`test/lesson-flow.test.mjs`](../test/lesson-flow.test.mjs#L109-L118):
  - Assert every `word-intro` card has `1 <= examples.length <= 8`, never mixes words from two distinct groups, all `word-intro` cards precede `word-meaning`, flattened `examples` equal `lessonVocabulary(unit)`, `lessonQuestionTotal === 8` (standard) and `9` (adaptive with `needsSupport`).
  - Add dedicated rollout-resume tests covering all 4 cases:
    1. Pre-PR-1 (`v1` / missing signature) session on `L1 numbers` (including coincidental `entry.id` collision between scored `word-meaning` and unscored `word-intro`) → rejected cleanly.
    2. PR 1 → PR 2 (`v2`) session on `L1 introductions` saved right after `word-meaning` when `pronouns` is inserted → signature mismatch rejects cleanly and restarts predictably.
    3. PR 1 → PR 2 (`v2`) session on `L2 family` where a new second `word-intro` card starts with existing `word-relatives-6` (`"son"`) → both signature mismatch and `scored !== core` guard reject cleanly.
    4. PR 1 → PR 2 (`v2`) session on an unaffected lesson (`L1 greetings`, `L3 cafe`) → resumes cleanly at the exact saved index with recovery cards intact.
- [`README.md:128`](../README.md#L128): Fix stale statement (*"Reloading still ends a lesson in progress, because lesson state is held in memory."*) to accurately reflect `restoreLesson()` ([`dist/app.mjs:3187`](../dist/app.mjs#L3187)).
- [`docs/mixed-lessons.md`](./mixed-lessons.md): Document group-aligned `word-intro` cards (`<= 8` words/card) and cross-release lesson resume behavior.

---

### PR 2 — Trimmed, Topic-Matched Foundational Vocabulary (+52 Words) & Lexical Harmonization

> [!IMPORTANT]
> **Hard Invariants Verified in Simulation (`541` words, `75` groups, `0` errors):**
> 1. All 7 new groups live directly in [`dist/lesson-words.mjs`](../dist/lesson-words.mjs) — strictly subject to PR #35's global cross-level no-duplicates test across all 6 languages ([`test/lesson-words.test.mjs:26-39`](../test/lesson-words.test.mjs#L26-L39)).
> 2. **Every word group contains `>= 5` words**, satisfying `matchRound()` ([`dist/practice.mjs:220`](../dist/practice.mjs#L220)) and [`test/catalog.test.mjs:144`](../test/catalog.test.mjs#L144).
> 3. Every Arabic reading aid passes `readingAid(entry, 'ar')` alignment.

#### Existing-Word Harmonization & Level Adjustment
| File | Entry | Change | Rationale |
| :--- | :--- | :--- | :--- |
| [`dist/lesson-words.mjs:17`](../dist/lesson-words.mjs#L17) | `word-polite-words-3` (`sorry`, L1) | Arabic `آسف` (`āsif`) → **`عذرًا`** (`ʿudhran`) | Follows F03 speaker-neutral policy ([`docs/f03-translation-qa-2026-11-13.md:85`](../docs/f03-translation-qa-2026-11-13.md#L85)); defers Workstream 4 machinery |
| [`dist/lesson-words.mjs:44`](../dist/lesson-words.mjs#L44) | `word-ordering-5` (`to recommend`, L3) | Arabic `أوصى` (`awṣā`) → **`نصح`** (`naṣaḥa`) | Matches `meal-1` |
| [`dist/lesson-words.mjs:88`](../dist/lesson-words.mjs#L88) | `word-post-words-1` (`package`, L5) | Uzbek `posilka` → **`jo‘natma`** | Matches `post-office-1`/`2` |
| [`dist/lesson-words.mjs:81`](../dist/lesson-words.mjs#L81) | `word-building-words-2` (`corridor`, L4) | Arabic `رواق` (`riwāq`) → **`ممرّ داخليّ`** (`mamarr dākhilī`) | Reinforces `inside-a-building-5` root `ممرّ` without colliding with L2 `word-outdoors-2` (`ممرّ`); subject to Arabic editorial review (keeping `رواق` is zero-risk fallback) |
| [`dist/lesson-words.mjs:120`](../dist/lesson-words.mjs#L120) | `word-character-1` (`tall`, L6) | German `groß` → **`groß gewachsen`** | Matches Uzbek `baland bo‘yli` & Turkish `uzun boylu`; reserves `groß` for L1 `big` |
| [`dist/words.mjs:110`](../dist/words.mjs#L110) | `weather` (`word-weather-1..8`, 8w) | Move Level `4` (`plans`) → Level `2` (`outdoors`) | Fixes PR #35 loose fit; preserves identical IDs (`word-weather-1..8`). Per PR #36, Level 2 learners who have not finished `outdoors` see `weather` in Lug‘at once met or `outdoors` completed; Level 2 learners who already finished `outdoors` and Level 3+ learners see it immediately. |

#### Deliberate `Daraja testi` Pool Impact & Early-Level Load
- **Checkpoint (`Daraja testi`) vocabulary sampling ([`dist/practice.mjs:187-189`](../dist/practice.mjs#L187-L189)):** Keeps `10/12` pass mark and 4 vocabulary questions from 4 distinct groups per level. Deliberate sampling-pool change:
  - Level 1: `9` → **`12`** groups (`72` → `88` words, `+16`)
  - Level 2: `11` → **`14`** groups (`78` → `108` words, `+22` new + `8` moved `weather`)
  - Level 3: **`8`** groups unchanged (`56` words; `tens-and-hundreds` deferred with `teens`)
  - Level 4: `8` → **`9`** groups (`57` → `63` words, `+14` new − `8` moved `weather`)
  - Levels 5–8: unchanged (`8` groups each; `58 / 56 / 56 / 56` words).
- **Early-level load:** Every newly touched Level 1 lesson stays at `12–13` words (`introductions` `13w`, `colors` `12w`, `belongings` `13w`). The only lesson above 16 words is `L2 routine` (`20w` = `days` `8w` + indivisible `months` `6w + 6w`), explicitly included in the mobile QA checklist.

#### Complete 52-Word Editorial Table (`dist/lesson-words.mjs` — Subject to Native-Speaker Sign-Off per F03 §5)

<details open>
<summary><strong>Level 1 — 3 New Groups (+16 words): <code>pronouns</code> (5w), <code>basic-adjectives</code> (6w), <code>personal-items</code> (5w)</strong></summary>

| Group → Lesson | `uz` | `en` | `ru` | `ar` | `tr` | `de` | `romanization` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `pronouns` → `introductions` | `men` | `I` | `я` | `أنا` | `ben` | `ich` | `anā` |
| `pronouns` → `introductions` | `sen / siz` | `you` | `ты / вы` | `أنتَ / أنتِ` | `sen / siz` | `du / Sie` | `anta / anti` |
| `pronouns` → `introductions` | `u` | `he / she` | `он / она` | `هو / هي` | `o` | `er / sie` | `huwa / hiya` |
| `pronouns` → `introductions` | `biz` | `we` | `мы` | `نحن` | `biz` | `wir` | `naḥnu` |
| `pronouns` → `introductions` | `ular` | `they` | `они` | `هم` | `onlar` | `sie` | `hum` |
| `basic-adjectives` → `colors` | `katta` | `big` | `большой` | `كبير` | `büyük` | `groß` | `kabīr` |
| `basic-adjectives` → `colors` | `kichik` | `small` | `маленький` | `صغير` | `küçük` | `klein` | `ṣaghīr` |
| `basic-adjectives` → `colors` | `yangi` | `new` | `новый` | `جديد` | `yeni` | `neu` | `jadīd` |
| `basic-adjectives` → `colors` | `eski` | `old` | `старый` | `قديم` | `eski` | `alt` | `qadīm` |
| `basic-adjectives` → `colors` | `toza` | `clean` | `чистый` | `نظيف` | `temiz` | `sauber` | `naẓīf` |
| `basic-adjectives` → `colors` | `og‘ir` | `heavy` | `тяжёлый` | `ثقيل` | `ağır` | `schwer` | `thaqīl` |
| `personal-items` → `belongings` | `telefon` | `phone` | `телефон` | `هاتف` | `telefon` | `das Telefon` | `hātif` |
| `personal-items` → `belongings` | `surat` | `photo` | `фотография` | `صورة` | `fotoğraf` | `das Foto` | `ṣūra` |
| `personal-items` → `belongings` | `ryukzak` | `backpack` | `рюкзак` | `حقيبة ظهر` | `sırt çantası` | `der Rucksack` | `ḥaqībat ẓahr` |
| `personal-items` → `belongings` | `hamyon` | `wallet` | `кошелёк` | `محفظة` | `cüzdan` | `die Geldbörse` | `miḥfaẓa` |
| `personal-items` → `belongings` | `piyola` | `cup` | `чашка` | `كوب` | `fincan` | `die Tasse` | `kūb` |

</details>

<details open>
<summary><strong>Level 2 — 2 New Groups + 4 Appended to <code>relatives</code> (+22 new words; plus moved <code>weather</code> 8w)</strong></summary>

| Group → Lesson | `uz` | `en` | `ru` | `ar` | `tr` | `de` | `romanization` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `relatives` *(append #8–11)* → `family` | `uka` | `younger brother` | `младший брат` | `أخ أصغر` | `küçük erkek kardeş` | `der jüngere Bruder` | `akh aṣghar` |
| `relatives` *(append #8–11)* → `family` | `singil` | `younger sister` | `младшая сестра` | `أخت صغرى` | `küçük kız kardeş` | `die jüngere Schwester` | `ukht ṣughrā` |
| `relatives` *(append #8–11)* → `family` | `er` | `husband` | `муж` | `زوج` | `koca` | `der Ehemann` | `zawj` |
| `relatives` *(append #8–11)* → `family` | `xotin` | `wife` | `жена` | `زوجة` | `hanım` *(or `eş` — confirm)* | `die Ehefrau` | `zawja` |
| `months` → `routine` | `yanvar` | `January` | `январь` | `يناير` | `ocak` | `der Januar` | `yanāyir` |
| `months` → `routine` | `fevral` | `February` | `февраль` | `فبراير` | `şubat` | `der Februar` | `fibrāyir` |
| `months` → `routine` | `mart` | `March` | `март` | `مارس` | `mart` | `der März` | `māris` |
| `months` → `routine` | `aprel` | `April` | `апрель` | `أبريل` | `nisan` | `der April` | `abrīl` |
| `months` → `routine` | `may` | `May` | `май` | `مايو` | `mayıs` | `der Mai` | `māyū` |
| `months` → `routine` | `iyun` | `June` | `июнь` | `يونيو` | `haziran` | `der Juni` | `yūnyū` |
| `months` → `routine` | `iyul` | `July` | `июль` | `يوليو` | `temmuz` | `der Juli` | `yūlyū` |
| `months` → `routine` | `avgust` | `August` | `август` | `أغسطس` | `ağustos` | `der August` | `aghusṭus` |
| `months` → `routine` | `sentabr` | `September` | `сентябрь` | `سبتمبر` | `eylül` | `der September` | `sibtambir` |
| `months` → `routine` | `oktabr` | `October` | `октябрь` | `أكتوبر` | `ekim` | `der Oktober` | `uktūbar` |
| `months` → `routine` | `noyabr` | `November` | `ноябрь` | `نوفمبر` | `kasım` | `der November` | `nūfambir` |
| `months` → `routine` | `dekabr` | `December` | `декабрь` | `ديسمبر` | `aralık` | `der Dezember` | `dīsambir` |
| `seasons-and-time` → `telling-time` | `bahor` | `spring` | `весна` | `ربيع` | `ilkbahar` | `der Frühling` | `rabīʿ` |
| `seasons-and-time` → `telling-time` | `yoz` | `summer` | `лето` | `صيف` | `yaz` | `der Sommer` | `ṣayf` |
| `seasons-and-time` → `telling-time` | `kuz` | `fall` *(en-US)* | `осень` | `خريف` | `sonbahar` | `der Herbst` | `kharīf` |
| `seasons-and-time` → `telling-time` | `qish` | `winter` | `зима` | `شتاء` | `kış` | `der Winter` | `shitāʾ` |
| `seasons-and-time` → `telling-time` | `yil` | `year` | `год` | `سنة` | `yıl` | `das Jahr` | `sana` |
| `seasons-and-time` → `telling-time` | `daqiqa` | `minute` | `минута` | `دقيقة` | `dakika` | `die Minute` | `daqīqa` |

</details>

<details open>
<summary><strong>Level 4 — 2 New Groups (+14 words): <code>plans-and-frequency</code> (8w), <code>ordinals</code> (6w)</strong></summary>

| Group → Lesson | `uz` | `en` | `ru` | `ar` | `tr` | `de` | `romanization` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `plans-and-frequency` → `L4 plans` | `tez orada` | `soon` | `скоро` | `قريبًا` | `yakında` | `bald` | `qarīban` |
| `plans-and-frequency` → `L4 plans` | `bo‘sh vaqt` | `free time` | `свободное время` | `وقت الفراغ` | `boş zaman` | `die Freizeit` | `waqt al-farāgh` |
| `plans-and-frequency` → `L4 plans` | `birga` | `together` | `вместе` | `معًا` | `birlikte` | `zusammen` | `maʿan` |
| `plans-and-frequency` → `L4 plans` | `doim` | `always` | `всегда` | `دائمًا` | `her zaman` | `immer` | `dāʾiman` |
| `plans-and-frequency` → `L4 plans` | `ba’zan` | `sometimes` | `иногда` | `أحيانًا` | `bazen` | `manchmal` | `aḥyānan` |
| `plans-and-frequency` → `L4 plans` | `tez-tez` | `often` | `часто` | `غالبًا` | `sık sık` | `oft` | `ghāliban` |
| `plans-and-frequency` → `L4 plans` | `hech qachon` | `never` | `никогда` | `أبدًا` | `asla` | `nie` | `abadan` |
| `plans-and-frequency` → `L4 plans` | `allaqachon` | `already` | `уже` | `بالفعل` | `zaten` | `schon` | `bi-l-fiʿl` |
| `ordinals` → `L4 inside-a-building` | `birinchi` | `first` | `первый` | `أوّل` | `birinci` | `erste` | `awwal` |
| `ordinals` → `L4 inside-a-building` | `ikkinchi` | `second` | `второй` | `ثانٍ` | `ikinci` | `zweite` | `thānin` |
| `ordinals` → `L4 inside-a-building` | `uchinchi` | `third` | `третий` | `ثالث` | `üçüncü` | `dritte` | `thālith` |
| `ordinals` → `L4 inside-a-building` | `to‘rtinchi` | `fourth` | `четвёртый` | `رابع` | `dördüncü` | `vierte` | `rābiʿ` |
| `ordinals` → `L4 inside-a-building` | `beshinchi` | `fifth` | `пятый` | `خامس` | `beşinci` | `fünfte` | `khāmis` |
| `ordinals` → `L4 inside-a-building` | `oxirgi` | `last` | `последний` | `أخير` | `son` | `letzte` | `akhīr` |

</details>

#### Before vs. After Group-Aligned `word-intro` Cards (Affected Lessons Across PR 1 + PR 2)
| Lesson | Baseline (`2769caf`) | After PR 1 | After PR 2 (group-aligned cards) |
| :--- | :---: | :---: | :--- |
| `L1 introductions` | `8` (1 card) | `8` | `13` → `people` (`8`) + `pronouns` (`5`) |
| `L1 numbers` | `14` (1 card) | `7 + 7` | `14` → `numbers` (`7 + 7`) *(unchanged in PR 2)* |
| `L1 colors` | `6` (1 card) | `6` | `12` → `colors` (`6`) + `basic-adjectives` (`6`) |
| `L1 polite-requests` | `14` (1 card) | `6 + 8` | `14` → `polite-words` (`6`) + `actions` (`8`) |
| `L1 belongings` | `8` (1 card) | `8` | `13` → `everyday-objects` (`8`) + `personal-items` (`5`) |
| `L2 family` | `7` (1 card) | `7` | `11` → `relatives` (`5 + 6`) |
| `L2 routine` | `8` (1 card) | `8` | `20` → `days` (`8`) + `months` (`6 + 6`) |
| `L2 apartment` | `16` (1 card) | `8 + 8` | `16` → `home` (`8`) + `apartment` (`8`) |
| `L2 free-time` | `11` (1 card) | `6 + 5` | `11` → `hobbies` (`6`) + `linking-basics` (`5`) |
| `L2 outdoors` | `6` (1 card) | `6` | `14` → `outdoors` (`6`) + `weather` (`8`, moved from L4) |
| `L2 wellbeing` | `14` (1 card) | `6 + 8` | `14` → `mood` (`6`) + `body-and-rest` (`8`) |
| `L2 telling-time` | `8` (1 card) | `8` | `14` → `time` (`8`) + `seasons-and-time` (`6`) |
| `L4 directions` | `9` (1 card) | `4 + 5` | `9` → `city` (`4 + 5`) |
| `L4 plans` | `8` (`weather`) | `8` | `8` → `plans-and-frequency` (`8`) |
| `L4 inside-a-building` | `6` (1 card) | `6` | `12` → `building-words` (`6`) + `ordinals` (`6`) |
| *Remaining 49 lessons* | `6`–`8` (1 card) | `6`–`8` | `6`–`8` (1 card, unchanged) |

#### Supporting PR 2 Updates
- [`dist/russian-stress.mjs`](../dist/russian-stress.mjs): Add verified stress entries for every new Russian word (0 unstressed multisyllabic words).
- **Tests:** Update `words.length` (`489 → 541`) in [`test/catalog.test.mjs`](../test/catalog.test.mjs), [`test/learning-depth.test.mjs`](../test/learning-depth.test.mjs), [`test/progression.test.mjs`](../test/progression.test.mjs), and [`test/translation-quality.test.mjs`](../test/translation-quality.test.mjs) (`1,131` entries / `9,402` text fields); assert every word group has `>= 5` entries and `word-polite-words-3` is speaker-neutral `عذرًا`.
- **Docs:** Update word counts and group notes in [`README.md`](../README.md), [`docs/curriculum.md`](./curriculum.md), [`docs/mixed-lessons.md`](./mixed-lessons.md), and [`docs/f04-objective-vocabulary-review.md`](./f04-objective-vocabulary-review.md).

---

### PR 3 — Curated Web Dialogues (`41/64` → `64/64`) with Hand-Picked, Audited Distractors

> [!WARNING]
> **Hard Editorial Gate (PR #75 & F03 §5):** No exchange is counted as covered until (1) every distractor is verified to be pragmatically **wrong** in **all 6 languages**, and (2) independent native-speaker review verdicts are recorded per [`docs/f03-translation-qa-2026-11-13.md:117`](../docs/f03-translation-qa-2026-11-13.md#L117).

#### `[MODIFY]` [`dist/dialogues.mjs`](../dist/dialogues.mjs) & [`dist/arabic-address.mjs`](../dist/arabic-address.mjs)
Add **23 curated speaker-to-speaker exchanges** (`1` phrase-reusing + `22` custom speaker-neutral 6-language replies), bringing web coverage to `64/64` lessons (`69` exchanges, `50` `dialogueReviewEntries`). Revisions from Rev 2 resolve `home-chores-2`, `reflection-5`, `instructions-2`, `feedback-1`, and the `compare` cue/reply mismatch:

| Level | Lesson | Type | Cue | Proposed Reply (`en` preview) | Audited Distractors (`distractorIndices`) |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | `numbers` | Custom | `5`: *"Could you repeat the number?"* | *"Of course: zero, five, two, nine."* | **`[2, 3, 4]`** *(excludes `1` "One, two, three." and `6` "Please write it down.")* |
| 1 | `belongings` | Custom | `4`: *"Is this key yours?"* | *"Yes, it’s mine. Thank you!"* | **`[1, 2, 3, 5]`** *(excludes `6` "This notebook is not mine.")* |
| 1 | `where-things-are` | Custom | `6`: *"Where is my pencil?"* | *"It’s next to the box."* | **`[2, 3, 4, 5]`** *(excludes `1` "The pen is on the notebook." — prevents `tr` `kalem` / `ar` `قلم` overlap)* |
| 2 | `family` | Custom | `5`: *"Where does your family live?"* | *"They live in another city."* | **`[1, 2, 4, 6]`** *(excludes `3` "My friend lives nearby.")* |
| 2 | `apartment` | Custom | `6`: *"Could you close the door?"* | *"Of course, I’ll close it now."* | Default `[1, 2, 3, 4, 5]` (room/furniture statements) |
| 2 | `free-time` | Custom | `6`: *"I’m learning to swim."* | *"That’s great! Where do you practice?"* | **`[1, 2, 3, 5]`** *(excludes `4` question); register 2sg AR addressee in `arabic-address.mjs`* |
| 2 | `home-chores` | Custom | `4`: *"Can you take out the trash?"* | *"Sure, I’ll do it right away."* | **`[1, 3, 5]`** *(excludes `2` "I am tidying my room today." excuse and `6` "We have finished...")* |
| 2 | `telling-time` | Custom | `6`: *"What time do you finish?"* | *"I finish at six o’clock."* | **`[1, 2, 3, 4]`** *(excludes `5` "I need a little time.")* |
| 3 | `market` | Custom | `2`: *"Are these tomatoes fresh?"* | *"Yes, they arrived this morning."* | Default `[1, 3, 4, 5, 6]` (customer requests) |
| 3 | `dietary-needs` | Custom | `4`: *"Do you have a dish that is not spicy?"* | *"Yes, the vegetable soup is not spicy."* | Default `[1, 2, 3, 5, 6]` (customer requests) |
| 4 | `directions` | Custom | `4`: *"Is it far?"* | *"No, it’s about a five-minute walk."* | Default `[1, 2, 3, 5, 6]` |
| 4 | `plans` | Reused | `1`: *"Do you have time tomorrow?"* | `3`: *"I’m free after work."* | **`[4, 6, 'appointment-6']`** *(excludes `2` "Let’s meet at six." and `5` "I’ll call you later.")* |
| 4 | `city-services` | Custom | `4`: *"Do I need an appointment?"* | *"No, you can wait in line at the counter."* | Default `[1, 2, 3, 5, 6]`; register 2sg AR addressee in `arabic-address.mjs` |
| 5 | `shopping` | Custom | `1`: *"Do you have a smaller size?"* | *"Let me check in the back for you."* | Default `[2, 3, 4, 5, 6]`; register 2sg AR addressee in `arabic-address.mjs` |
| 5 | `hotel` | Custom | `2`: *"Is breakfast included in the price?"* | *"Yes, it is served from seven to ten."* | Default `[1, 3, 4, 5, 6]` |
| 6 | `story` | Custom | `1`: *"Yesterday I missed the bus."* | *"Oh no, how did you get there in the end?"* | Default `[2, 3, 4, 5, 6]` (1st-person narrator lines); register 2sg AR addressee |
| 6 | `compare` | Custom | `4`: *"Which option would you choose if you had more time?"* | *"If I had more time, I’d take the bus because it’s cheaper."* | **`[2, 3, 5]`** *(fixes Rev 2 mismatch where faster train answered "more time"; excludes `1` and `6`)* |
| 6 | `describing-people` | Custom | `5`: *"At first he seems shy."* | *"Yes, but he opens up once you get to know him."* | **`[1, 3, 6]`** *(excludes `2` and `4`); register 2sg AR addressee* |
| 7 | `reflection` | Custom | `2`: *"I’d like to feel more confident when I speak."* | *"Practicing a little every day really helps with that."* | **`[1, 3, 6]`** *(excludes `4` "The more I practice..." and `5` "I used to be afraid of making mistakes.")* |
| 7 | `instructions` | Custom | `6`: *"Could you show me how you did it?"* | *"Sure, I’ll walk you through it step by step."* | **`[1, 5, 'formal-requests-2']`** *(excludes `2` "Before you start...", `3`, and `4`); register 2sg AR addressee* |
| 7 | `learning-strategies` | Custom | `1`: *"Although I understand the text, I struggle to express myself freely."* | *"Try summarizing each paragraph aloud in your own words."* | **`['reflection-1', 'reflection-6', 'formal-requests-5']`** *(excludes `learning-strategies` `2–6` and sympathetic `reflection-5`); register 2sg AR addressee* |
| 8 | `feedback` | Custom | `3`: *"Could we move the background information to the beginning?"* | *"Yes, that will make the structure much clearer."* | **`[2, 4, 'messages-3']`** *(excludes `1` "The main point comes through clearly." pushback, `5`, and `6`)* |
| 8 | `short-update` | Custom | `6`: *"I would like five minutes at the next meeting."* | *"Sure, I’ll add your update to the agenda."* | **`[1, 2, 3, 4]`** *(excludes `5` "There is nothing blocking us."); register 2sg AR addressee* |

#### Supporting PR 3 Updates
- [`dist/russian-stress.mjs`](../dist/russian-stress.mjs): Add verified stress entries for every new Russian token in the 22 custom replies.
- [`test/dialogues.test.mjs`](../test/dialogues.test.mjs) & [`test/translation-quality.test.mjs`](../test/translation-quality.test.mjs): Update counts (`69` exchanges, `50` custom replies, `1,153` entries, `9,534` text fields) and add explicit regression checks for the hand-picked distractors above.
- [`README.md:83-84`](../README.md#L83-L84): Update `46` exchanges / `28` replies → `69` exchanges / `50` replies.

---

### PR 4 — Reading-Depth Question Rewrites & Telegram Story Evidence Sync (Separate Editorial Pass)

> [!IMPORTANT]
> **Two Distinct Decisions in PR 4:**
> 1. **Question rewrites (in scope):** Draft genuine multi-clue higher-order questions (e.g., asking which two story details jointly justify a conclusion, or separating assumption from verified evidence) on targeted Level 5–8 stories — starting with `baggage-report` (whose Q4 already tests genuine evidence vs. expectation) and selected Level 6–8 stories (`team`, `meeting-notes`, `shelf-pilot`, `leaking-tap`). Never tag single-sentence factual recall.
> 2. **`readingDepthResult` display threshold (explicit separate UI decision):** Enforcing a 2-question minimum on [`dist/app.mjs:1865`](../dist/app.mjs#L1865) to avoid `"1 / 1"` lines (PR #24) would also hide the existing depth summary on **`old-photo`** and **`mistake-notebook`** (each currently has 1 tagged question). Before changing [`dist/app.mjs:1865`](../dist/app.mjs#L1865), decide explicitly whether to:
>    - *(a)* keep `old-photo` and `mistake-notebook` unchanged (or add a second genuine higher-order question to each), and
>    - *(b)* continue persisting `readingDepthBest[story.id]` for 1-question stories even if the UI hides `total < 2`, or persist only when `total >= 2`.

#### Required Telegram Story Dependency Check ([`src/telegram-stories.mjs:10-42`](../src/telegram-stories.mjs#L10-L42))
- `storyQuestions` in [`src/telegram-stories.mjs`](../src/telegram-stories.mjs#L10-L42) selects one 0-based question index and hand-listed 0-based supporting-sentence indices for every story — notably **`team: [2, 3, 4]`**, **`shelf-pilot: [2, 4, 5]`**, **`meeting-notes: [2, 1, 3]`** (all Q3, index `2`), as well as `new-meeting-time: [2, 2, 3, 4]` and `baggage-report: [1, 1]`.
- Whenever PR 4 rewrites any question referenced by `storyQuestions`, it **must** update the corresponding supporting-sentence indices in [`src/telegram-stories.mjs`](../src/telegram-stories.mjs#L10-L42) and verify explanations against [`test/telegram-stories.test.mjs`](../test/telegram-stories.test.mjs) (old chat sessions expire automatically after 30 minutes).
- Every rewritten question must also pass option-length balance checks ([`test/catalog.test.mjs`](../test/catalog.test.mjs)) and 6-language native editorial sign-off.

---

## 4. Verification Plan (Per PR)

### Automated Checks (Every PR)
1. **Pure Node Test Suite:**
   ```bash
   node --test test/azure-speech.test.mjs test/browser-speech.test.mjs test/catalog.test.mjs \
     test/dialogues.test.mjs test/learning-depth.test.mjs test/learning-reset.test.mjs \
     test/lesson-flow.test.mjs test/lesson-words.test.mjs test/mini-app-links.test.mjs \
     test/onboarding.test.mjs test/practice-layout.test.mjs test/progress-merge.test.mjs \
     test/progress.test.mjs test/progression.test.mjs test/question-card.test.mjs \
     test/skills.test.mjs test/speaker-forms.test.mjs test/speech-recognition.test.mjs \
     test/theme-illustrations.test.mjs test/translation-quality.test.mjs \
     test/vocabulary-review.test.mjs test/vocabulary.test.mjs test/word-bank.test.mjs
   ```
2. **Full `npm test` & Worker Bundle Check (CI / Miniflare environments):**
   ```bash
   npm test
   npm run deploy:check
   ```
3. **Russian Stress 0-Missing Audit (PR 2, PR 3, PR 4):** Verify every multisyllabic Cyrillic token without `ё` across all catalog entries receives an explicit stress mark from `markRussianStress()`.
4. **Syntax & Diff Hygiene:**
   ```bash
   git diff --check
   for f in dist/*.mjs src/*.mjs test/*.mjs; do node --check "$f"; done
   ```

### Manual Release Checklist (Visible Production Features Only)
- [ ] **PR 1 — Group-aligned `word-intro` cards on mobile:** Open `L1 numbers` (`7+7`), `L1 polite-requests` (`6+8`), `L2 apartment` (`8+8`), and `L4 directions` (`4+5`) on a mobile viewport; confirm each card uses the clean existing `lessonFlowWords` header (no extra counter), contains at most 8 thematically cohesive words, keeps standard pass threshold at `7/8` (and adaptive at `8/9`), and reveals/schedules all lesson words in Lug‘at upon advancing.
- [ ] **PR 1 — Active-lesson resume rollout checks (both releases):**
  - Reload mid-lesson on `L1 numbers` under `v2` → resumes cleanly.
  - Simulate a pre-PR-1 `v1` saved session in `sessionStorage` → discarded cleanly without error.
  - Simulate a PR 1 `v2` session on `L1 introductions` (saved after `word-meaning`) and `L2 family` (where card 2 starts with `word-relatives-6`) against PR 2's sequence → signature check rejects cleanly and restarts predictably, while an unaffected lesson (`L1 greetings`) still resumes cleanly.
- [ ] **PR 2 — Vocabulary, `matchRound`, & Lug‘at reveal behavior:** Test `L1 introductions` (`8+5`), `L1 belongings` (`8+5`), `L2 family` (`5+6`), `L2 routine` (`8 + 6 + 6` on mobile), `L2 outdoors` (`6+8` with moved `weather`), and `L4 inside-a-building` (`6+6`); confirm Matching practice draws 5 distinct cards cleanly on `personal-items` and `pronouns`; confirm Level 2 learners who have not finished `outdoors` see `weather` in Lug‘at only after meeting it or finishing `outdoors`, while Level 3 learners see it immediately; confirm `word-polite-words-3` displays `عذرًا` (`ʿudhran`) in Arabic.
- [ ] **PR 2 — Default Telegram bot sanity check:** Verify default companion mode remains unchanged (`Aytim ilovasini ochish` and `Tezkor mashqlar`), and new introduced words appear cleanly in quick practice and `/review`.
- [ ] **PR 3 — Reply practice (`64/64`):** Spot-check newly covered lessons across Levels 1–8 (`numbers`, `where-things-are`, `home-chores`, `plans`, `compare`, `reflection`, `instructions`, `learning-strategies`, `feedback`) in multiple directions (including `tr` and `ar`) to confirm unambiguous answers and Arabic feminine addressee hints where registered.
- [ ] **PR 4 — Reading rewrites & Telegram story evidence:** Verify rewritten questions require synthesizing multiple story details, confirm the decided `readingDepthResult` display/persistence behavior on `old-photo` and `mistake-notebook`, and confirm Telegram story explanations still cite exact supporting sentences for any changed shared question.
