# Phase 3 Curriculum & Pedagogical Expansion Plan (Revision 2)

> [!NOTE]
> **Review Document Only — No Implementation Code Modified Yet.**
> Baseline: `main` at commit `2769caf` (after PR #77 `c93de1b` and PR #78 `2769caf`; plan Revision 1 added in `d1dc73c`).
> This Revision 2 incorporates engineering and editorial feedback from both review passes and locks all five scope/staging decisions before PR 1 begins.

---

## 1. Executive Summary & Staging Strategy

Phases 1 and 2 of the content quality audit — plus Phase 3.4 ([`dist/language-notes.mjs`](../dist/language-notes.mjs) notes) — are merged on `main`. Based on review feedback against Aytim's prior decision records (PRs #24, #33, #35, #36, #56, #57, #64, #65, #75, #76, #77, [`docs/f03-translation-qa-2026-11-13.md`](./f03-translation-qa-2026-11-13.md), and [`docs/mixed-lessons.md`](./mixed-lessons.md)), Phase 3 is reshaped from one monolithic PR into **four focused, independently reviewable PRs**, with hidden/deferred items explicitly removed from release scope:

| PR | Scope | Type | Gate / Dependency |
| :---: | :--- | :--- | :--- |
| **PR 1** | **Word-card split along word-group boundaries + active-lesson resume hardening** | Code only | Zero catalog changes; immediately improves existing 9–16 word cards |
| **PR 2** | **Trimmed, topic-matched foundational vocabulary (+58 words) + F03 neutral `عذرًا` + `weather` move + lexical harmonization** | Catalog + docs | Strict PR #35 global no-duplicates rule; native-speaker sign-off recorded per F03 §5 |
| **PR 3** | **Curated web dialogues (`41/64` → `64/64` lessons) with hand-picked, audited distractors** | Catalog + docs | Every exchange audited for pragmatic distractor overlap across all 6 languages; native-speaker sign-off recorded per F03 §5 |
| **PR 4** | **Reading-depth question rewrites (genuine multi-clue higher-order questions)** | Editorial + catalog | Rewrites/designs multi-clue inferential/evidential prompts rather than tagging direct recall or producing `1/1` subscores |

### Explicitly Deferred / Out of Scope (Respecting Prior Decisions)
- **Hidden `Alifbo` (`alphabetSection`) & `Til haqida` (`languageNotesSection`):** Hidden since PR #33 (kept hidden in #76 and #77; [`dist/app.mjs:2218`](../dist/app.mjs#L2218) is never called). Dropped as a release goal and removed from manual release checklists; vocabulary is chosen purely on pedagogical value.
- **5 Telegram Branching Dialogue Scenes (`src/telegram-dialogues.mjs`):** Deferred while the default bot remains in vocabulary-companion mode (`Aytim ilovasini ochish` + `Tezkor mashqlar`; `/skills` and `/dialogue` are hidden behind `TELEGRAM_FULL_CHAT=1` per PR #65 and [`src/telegram-navigation.mjs:48`](../src/telegram-navigation.mjs#L48)).
- **Vocabulary & Custom-Dialogue Speaker-Form Machinery (former Workstream 4):** Deferred. Per F03 editorial policy ([`docs/f03-translation-qa-2026-11-13.md:85`](../docs/f03-translation-qa-2026-11-13.md#L85)), unknown-speaker generic `"sorry"` should not be gendered; `word-polite-words-3` switches Arabic `آسف` → speaker-neutral **`عذرًا`** (`ʿudhran`) in PR 2, matching the earlier F03 replies and German `Entschuldigung`. All 28 existing and 21 planned custom replies remain speaker-neutral.
- **Off-topic Vocabulary (`health-and-care`, `everyday-verbs`, `question-words`):** Deferred until dedicated lessons exist so PR #35's topic-alignment rule is preserved.
- **Forced Catch-Up Flow for Existing Higher-Level Learners:** Not added. Existing learners above Levels 1–4 see newly added lower-level words immediately in Lug‘at (and can manually save/review them) without forcing lesson replays or flooding their spaced-review queue.
- **Fresh Level-Test Scenarios:** Kept in its own separate PR as previously agreed.

### Baseline vs. Post-PR Metrics

| Dimension | Baseline (`2769caf`) | After PR 1 | After PR 2 | After PR 3 |
| :--- | :---: | :---: | :---: | :---: |
| Lessons / Lesson Phrases | `64` / `384` | `64` / `384` | `64` / `384` | `64` / `384` |
| Word Groups / Vocabulary Words | `68` / `489` | `68` / `489` | **`76` / `547`** (`+8` / `+58`) | `76` / `547` |
| Max Words on One `word-intro` Card | `16` (`apartment`) | **`8`** (group-aligned) | **`8`** (group-aligned) | `8` |
| Web Curated Dialogues (`exchanges` / `custom`) | `41/64` (`46` / `28`) | `41/64` (`46` / `28`) | `41/64` (`46` / `28`) | **`64/64`** (`69` / `49`) |
| `translation-quality.test.mjs` Entries / Text Fields | `1,079` / `9,090` | `1,079` / `9,090` | `1,137` / `9,438` | `1,158` / `9,564` |
| `Daraja testi` Vocabulary Pool (`L1/L2/L3/L4` groups) | `9 / 11 / 8 / 8` | `9 / 11 / 8 / 8` | **`12 / 14 / 9 / 9`** | `12 / 14 / 9 / 9` |

---

## 2. Locked Decisions & Editorial Sign-Offs

All seven decisions from Revision 1 and the five follow-up product forks are resolved below:

| # | Topic | Resolution Adopted in Revision 2 |
| :---: | :--- | :--- |
| **1** | **PR Staging** | Split into **4 focused PRs** (PR 1 code-only word-card split; PR 2 trimmed vocabulary; PR 3 audited web dialogues; PR 4 reading-depth question rewrites). |
| **2** | **Pronouns & `this`/`that`** | Drop `this`/`that` from vocabulary cards (eliminates `uz` `u` / `tr` `o` marking `"that"` wrong 60% of the time in same-group MCQs, avoids stilted German `jenes`, and avoids `tr` `şu`/`su` overlap). Gloss `you` as `sen / siz` · `ты / вы` · `أنتَ / أنتِ` · `du / Sie`, eliminating the German `Sie`/`sie` clash so all 5 personal pronouns (`I`, `you`, `he / she`, `we`, `they`) sit cleanly together in `L1 introductions`. |
| **3** | **Months Placement** | Keep `months` (`January`–`December`) with `L2 routine` alongside `days` because they belong with days and schedules. *(Correction from Rev 1: `"May I…"` appears in `L1 classroom-phrases`, not `polite-requests`; the `level <= 3` cap is still satisfied natively.)* |
| **4** | **German & Arabic Gloss Overlaps** | Use targeted glosses: `word-character-1` (`tall`, L6) German `groß` → **`groß gewachsen`** (reserving `groß` for L1 `big`); `word-building-words-2` (`corridor`, L4) Arabic `رواق` → **`ممرّ داخليّ`** (`mamarr dākhilī`, subject to Arabic editorial review; keeping `رواق` remains the zero-risk fallback). Both pass PR #35's strict global no-duplicates rule. |
| **5** | **Turkish & Uzbek Kinship** | Teach explicit **`küçük erkek kardeş`** (`younger brother`) and **`küçük kız kardeş`** (`younger sister`) in Turkish, and gender-neutral **`spouse`** (`uz: turmush o‘rtoq`, `tr: eş`, `en: spouse`, `ru: супруг`, `ar: زوج`, `de: der Ehepartner`) — avoiding the Turkish `koca`/`hanım` register friction and pairing cleanly with Uzbek `turmush o‘rtoq`. *(Subject to native editorial review for `ru`/`ar`/`de` gloss preference.)* |
| **6** | **Arabic `"sorry"` & Speaker Forms** | Switch `word-polite-words-3` Arabic `آسف` → speaker-neutral **`عذرًا`** (`ʿudhran`) per F03 policy ([`docs/f03-translation-qa-2026-11-13.md:85`](../docs/f03-translation-qa-2026-11-13.md#L85)), keeping ~6 files untouched and deferring Workstream 4 machinery. |
| **7** | **Preview Cards & Card Simplicity** | Split strictly along **word-group boundaries** (never mixing unrelated groups like `colleague` + `pronouns` on one card), capping any single oversized group at `<= 8` words per card via within-group balanced splitting. Keep the existing `lessonFlowWords` header label with **no extra `"· 1/2"` counter** (honoring PRs #56, #57, #64). |
| **8** | **PR #35 No-Duplicates Rule** | Keep PR #35's strict global no-duplicates rule across **all** new vocabulary by placing all 8 new groups directly in [`dist/lesson-words.mjs`](../dist/lesson-words.mjs) (no separate `foundational-words.mjs` bypass module). |
| **9** | **Telegram Scenes & Hidden UI** | Defer the 5 Telegram scenes while default bot stays in companion mode (PR #65). Remove hidden `Alifbo` and `Til haqida` from release scope and checklists (PR #33). |
| **10** | **Existing Learners Catch-Up** | No forced catch-up flow; existing learners above Levels 1–4 see newly added lower-level entries in Lug‘at and can optionally save/review them. |

---

## 3. Detailed Plan by PR

---

### PR 1 — Word-Card Split Along Group Boundaries & Active-Lesson Resume Hardening (Code Only)

> [!TIP]
> **Zero catalog edits in PR 1.** Ships independently to immediately break up the existing 14–16 word walls (`numbers`, `polite-requests`, `apartment`, `free-time`, `wellbeing`, `directions`) and harden mid-lesson reload resilience before PR 2 changes any vocabulary lists.

#### Scoring & Progression Invariants (Corrected from Rev 1)
- **Standard lessons:** `8` scored questions, **`7/8`** to pass (`Math.ceil(8 * 0.8)`).
- **Adaptive lessons:** When `needsSupport(course, ...)` appends an extra scored question ([`dist/lesson-flow.mjs:89-95`](../dist/lesson-flow.mjs#L89-L95)), the lesson has `9` scored questions and requires **`8/9`** to pass ([`docs/mixed-lessons.md:23-28`](./mixed-lessons.md#L23-L28)).
- **`word-intro` cards remain unnumbered and unscored in both cases** (`isQuestion` excludes `'word-intro'`, [`dist/lesson-flow.mjs:10`](../dist/lesson-flow.mjs#L10)), and each card calls `introduceVocabulary(course(), question.examples)` as the learner advances ([`dist/app.mjs:1586-1589`](../dist/app.mjs#L1586-L1589)), so all words in the lesson are scheduled before `word-meaning`.

#### `[MODIFY]` [`dist/journey.mjs`](../dist/journey.mjs)
- Export a helper `lessonVocabularyGroups(unit)` returning the ordered array of `wordGroup` objects mapped to `unit.id` via `lessonTopics`:
  ```js
  export function lessonVocabularyGroups(unit) {
    const step = path[(unit?.level ?? 0) - 1];
    if (!step?.units.includes(unit)) return [];
    return (lessonTopics[unit.id] ?? [])
      .map(id => step.wordGroups.find(group => group.id === id))
      .filter(Boolean);
  }

  export function lessonVocabulary(unit) {
    return lessonVocabularyGroups(unit).flatMap(group => group.words);
  }
  ```

#### `[MODIFY]` [`dist/lesson-flow.mjs`](../dist/lesson-flow.mjs)
- Split `word-intro` cards **along word-group boundaries first**, and only apply balanced within-group splitting when a single group exceeds `max = 8` words:
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
- Emit one `{ task: 'word-intro', entry: chunk[0], examples: chunk, core: false }` per chunk immediately before `word-meaning`.
- **No UI copy or card-header changes** (`lessonFlowWords` stays unchanged — zero extra counters).

#### `[MODIFY]` [`dist/app.mjs`](../dist/app.mjs#L2554-L2598) — Active-Lesson Resume Rollout Safety
- **Bug prevented:** In [`restoreLesson()`](../dist/app.mjs#L2576-L2598), saved mid-lesson answers replay by index against the freshly rebuilt `questions` array, matching only `entry.id !== answer?.id`. When a deploy inserts an extra `word-intro` card before `word-meaning`, an in-progress attempt saved after `word-meaning` normally discards cleanly — **except** in the edge case where the old scored `word-meaning` happened to pick the exact same word that becomes `chunk[0]` of the newly inserted second `word-intro` card, causing a scored answer (`scored: true`) to align accidentally with an unscored preview card (`core: false`).
- **Fix:**
  1. Bump `lessonSessionKey` from `'aytim.lesson.v1'` → `'aytim.lesson.v2'` ([`dist/app.mjs:2557`](../dist/app.mjs#L2557)) so pre-split in-flight sessions reset cleanly on first reload after deploy.
  2. Strengthen `restoreLesson()` ([`dist/app.mjs:2585-2590`](../dist/app.mjs#L2585-L2590)) to verify task/scoring alignment: `if (!entry || entry.id !== answer?.id || Boolean(answer?.scored) !== Boolean(question.core)) return null;` (and store `task: question.task` on each answer or validate `answer.task` when present).
- **Immediate PR 1 card impact on existing 64 lessons:** `L1 numbers` (`14w` → `7+7`), `L1 polite-requests` (`6+8`), `L2 apartment` (`8+8`), `L2 free-time` (`6+5`), `L2 wellbeing` (`6+8`), `L4 directions` (`9w` → `4+5`). All other 58 lessons keep 1 card (`6–8w`).

#### `[MODIFY]` Tests & Docs for PR 1
- [`test/lesson-flow.test.mjs`](../test/lesson-flow.test.mjs#L109-L118): Assert every `word-intro` card has `1 <= examples.length <= 8`, never mixes entries from two different word groups on the same card, all `word-intro` cards precede `word-meaning`, flattened `examples` equal `lessonVocabulary(unit)`, `lessonQuestionTotal === 8` (standard) and `9` (adaptive with `needsSupport`).
- Add a unit test verifying mid-lesson resume logic rejects a pre-split saved answer stream (specifically testing the `scored: true` vs. `core: false` coincidental-ID case) and resumes cleanly on a v2 multi-card session.
- [`docs/mixed-lessons.md`](./mixed-lessons.md) & [`README.md`](../README.md): Note that lessons with multiple groups or >8 words present group-aligned `word-intro` cards of up to 8 words each.

---

### PR 2 — Trimmed, Topic-Matched Foundational Vocabulary (+58 Words) & Lexical Harmonization

> [!IMPORTANT]
> **Strict PR #35 Compliance:** All 8 new groups are added directly to [`dist/lesson-words.mjs`](../dist/lesson-words.mjs) (no bypass module), so [`test/lesson-words.test.mjs`](../test/lesson-words.test.mjs#L26-L39) enforces **global cross-level uniqueness across all 6 languages** on every single word. Pre-flight simulation verified **58 new words, 0 errors**.

#### Existing-Word Harmonization & Level Adjustment
| File | Entry | Change | Rationale |
| :--- | :--- | :--- | :--- |
| [`dist/lesson-words.mjs:17`](../dist/lesson-words.mjs#L17) | `word-polite-words-3` (`sorry`, L1) | Arabic `آسف` (`āsif`) → **`عذرًا`** (`ʿudhran`) | Follows F03 speaker-neutral policy ([`docs/f03-translation-qa-2026-11-13.md:85`](../docs/f03-translation-qa-2026-11-13.md#L85)); defers Workstream 4 machinery |
| [`dist/lesson-words.mjs:44`](../dist/lesson-words.mjs#L44) | `word-ordering-5` (`to recommend`, L3) | Arabic `أوصى` (`awṣā`) → **`نصح`** (`naṣaḥa`) | Matches `meal-1` |
| [`dist/lesson-words.mjs:88`](../dist/lesson-words.mjs#L88) | `word-post-words-1` (`package`, L5) | Uzbek `posilka` → **`jo‘natma`** | Matches `post-office-1`/`2` |
| [`dist/lesson-words.mjs:81`](../dist/lesson-words.mjs#L81) | `word-building-words-2` (`corridor`, L4) | Arabic `رواق` (`riwāq`) → **`ممرّ داخليّ`** (`mamarr dākhilī`) | Reinforces `inside-a-building-5` root `ممرّ` without colliding with L2 `word-outdoors-2` (`ممرّ`); subject to Arabic editorial review (keeping `رواق` is zero-risk fallback) |
| [`dist/lesson-words.mjs:120`](../dist/lesson-words.mjs#L120) | `word-character-1` (`tall`, L6) | German `groß` → **`groß gewachsen`** | Matches Uzbek `baland bo‘yli` & Turkish `uzun boylu`; reserves `groß` for L1 `big` |
| [`dist/words.mjs:110`](../dist/words.mjs#L110) | `weather` (`word-weather-1..8`, 8w) | Move Level `4` (`plans`) → Level `2` (`outdoors`) | Fixes PR #35 loose fit; preserves identical IDs (`word-weather-1..8`). Per PR #36, Level 2 learners see `weather` in Lug‘at after encountering it or finishing `outdoors`, while Level 3+ learners see it immediately. |

#### Deliberate `Daraja testi` Pool Impact & Early-Level Load Discipline
- **Checkpoint (`Daraja testi`) vocabulary sampling ([`dist/practice.mjs:187-189`](../dist/practice.mjs#L187-L189)):** Keeps `10/12` pass mark and 4 vocabulary questions drawn from 4 distinct groups of the level. Adding 8 topic groups deliberately broadens sampling pools from:
  - Level 1: `9` → **`12`** groups (`72` → `87` words, `+15`)
  - Level 2: `11` → **`14`** groups (`78` → `107` words, `+21` new + `8` moved `weather`)
  - Level 3: `8` → **`9`** groups (`56` → `64` words, `+8`)
  - Level 4: `8` → **`9`** groups (`57` → `63` words, `+14` new − `8` moved `weather`)
  - Levels 5–8: unchanged (`8` groups each; `58 / 56 / 56 / 56` words).
- **Early-level load discipline:** Dropping `teens` (from L1 `numbers`), `core-verbs` (from L1 `classroom-phrases`), `question-words` (from L1 `greetings`), `everyday-verbs` (from L2 `home-chores`), and `health-and-care` (from L4 `appointment`) cuts Level 1 growth from `+42` down to **`+15` words** — keeping every newly touched Level 1 lesson at `12–13` words (after the first 3 Level 1 lessons, `33` words enter next-day review instead of `48`). The only lesson above 16 words is `L2 routine` (`20w` = `days` `8w` + indivisible `months` `6w + 6w`), which will be explicitly mobile-tested.

#### Complete 58-Word Editorial Table (`dist/lesson-words.mjs` — Subject to Native-Speaker Sign-Off per F03 §5)

<details open>
<summary><strong>Level 1 — 3 New Groups (+15 words): <code>pronouns</code> (5w), <code>basic-adjectives</code> (6w), <code>personal-items</code> (4w)</strong></summary>

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
| `basic-adjectives` → `colors` | `yomon` | `bad` | `плохой` | `سيّئ` | `kötü` | `schlecht` | `sayyiʾ` |
| `basic-adjectives` → `colors` | `oson` | `easy` | `лёгкий` | `سهل` | `kolay` | `einfach` | `sahl` |
| `personal-items` → `belongings` | `telefon` | `phone` | `телефон` | `هاتف` | `telefon` | `das Telefon` | `hātif` |
| `personal-items` → `belongings` | `surat` | `photo` | `фотография` | `صورة` | `fotoğraf` | `das Foto` | `ṣūra` |
| `personal-items` → `belongings` | `ryukzak` | `backpack` | `рюкзак` | `حقيبة ظهر` | `sırt çantası` | `der Rucksack` | `ḥaqībat ẓahr` |
| `personal-items` → `belongings` | `hamyon` | `wallet` | `кошелёк` | `محفظة` | `cüzdan` | `die Geldbörse` | `miḥfaẓa` |

</details>

<details open>
<summary><strong>Level 2 — 2 New Groups + 3 Appended to <code>relatives</code> (+21 new words; plus moved <code>weather</code> 8w)</strong></summary>

| Group → Lesson | `uz` | `en` | `ru` | `ar` | `tr` | `de` | `romanization` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `relatives` *(append #8–10)* → `family` | `uka` | `younger brother` | `младший брат` | `أخ أصغر` | `küçük erkek kardeş` | `der jüngere Bruder` | `akh aṣghar` |
| `relatives` *(append #8–10)* → `family` | `singil` | `younger sister` | `младшая сестра` | `أخت صغرى` | `küçük kız kardeş` | `die jüngere Schwester` | `ukht ṣughrā` |
| `relatives` *(append #8–10)* → `family` | `turmush o‘rtoq` | `spouse` | `супруг` | `زوج` | `eş` | `der Ehepartner` | `zawj` |
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
<summary><strong>Level 3 &amp; Level 4 — 3 New Groups (+22 words): <code>tens-and-hundreds</code> (L3, 8w), <code>plans-and-frequency</code> (L4, 8w), <code>ordinals</code> (L4, 6w)</strong></summary>

| Group → Lesson | `uz` | `en` | `ru` | `ar` | `tr` | `de` | `romanization` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `tens-and-hundreds` → `L3 market` | `qirq` | `forty` | `сорок` | `أربعون` | `kırk` | `vierzig` | `arbaʿūn` |
| `tens-and-hundreds` → `L3 market` | `ellik` | `fifty` | `пятьдесят` | `خمسون` | `elli` | `fünfzig` | `khamsūn` |
| `tens-and-hundreds` → `L3 market` | `oltmish` | `sixty` | `шестьдесят` | `ستّون` | `altmış` | `sechzig` | `sittūn` |
| `tens-and-hundreds` → `L3 market` | `yetmish` | `seventy` | `семьдесят` | `سبعون` | `yetmiş` | `siebzig` | `sabʿūn` |
| `tens-and-hundreds` → `L3 market` | `sakson` | `eighty` | `восемьдесят` | `ثمانون` | `seksen` | `achtzig` | `thamānūn` |
| `tens-and-hundreds` → `L3 market` | `to‘qson` | `ninety` | `девяносто` | `تسعون` | `doksan` | `neunzig` | `tisʿūn` |
| `tens-and-hundreds` → `L3 market` | `yuz` | `one hundred` | `сто` | `مئة` | `yüz` | `hundert` | `miʾa` |
| `tens-and-hundreds` → `L3 market` | `ming` | `one thousand` | `тысяча` | `ألف` | `bin` | `tausend` | `alf` |
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
| `L1 belongings` | `8` (1 card) | `8` | `12` → `everyday-objects` (`8`) + `personal-items` (`4`) |
| `L2 family` | `7` (1 card) | `7` | `10` → `relatives` (`5 + 5`) |
| `L2 routine` | `8` (1 card) | `8` | `20` → `days` (`8`) + `months` (`6 + 6`) |
| `L2 apartment` | `16` (1 card) | `8 + 8` | `16` → `home` (`8`) + `apartment` (`8`) |
| `L2 free-time` | `11` (1 card) | `6 + 5` | `11` → `hobbies` (`6`) + `linking-basics` (`5`) |
| `L2 outdoors` | `6` (1 card) | `6` | `14` → `outdoors` (`6`) + `weather` (`8`, moved from L4) |
| `L2 wellbeing` | `14` (1 card) | `6 + 8` | `14` → `mood` (`6`) + `body-and-rest` (`8`) |
| `L2 telling-time` | `8` (1 card) | `8` | `14` → `time` (`8`) + `seasons-and-time` (`6`) |
| `L3 market` | `8` (1 card) | `8` | `16` → `food` (`8`) + `tens-and-hundreds` (`8`) |
| `L4 directions` | `9` (1 card) | `4 + 5` | `9` → `city` (`4 + 5`) |
| `L4 plans` | `8` (`weather`) | `8` | `8` → `plans-and-frequency` (`8`) |
| `L4 inside-a-building` | `6` (1 card) | `6` | `12` → `building-words` (`6`) + `ordinals` (`6`) |
| *Remaining 48 lessons* | `6`–`8` (1 card) | `6`–`8` | `6`–`8` (1 card, unchanged) |

#### Supporting PR 2 Updates
- [`dist/russian-stress.mjs`](../dist/russian-stress.mjs): Add verified stress entries for every new Russian word (0 unstressed multisyllabic words).
- **Tests:** Update `words.length` (`489 → 547`) in [`test/catalog.test.mjs`](../test/catalog.test.mjs), [`test/learning-depth.test.mjs`](../test/learning-depth.test.mjs), [`test/progression.test.mjs`](../test/progression.test.mjs), and [`test/translation-quality.test.mjs`](../test/translation-quality.test.mjs) (`1,137` entries / `9,438` text fields); assert `word-polite-words-3` is speaker-neutral `عذرًا`.
- **Docs:** Update word counts and group notes in [`README.md`](../README.md), [`docs/curriculum.md`](./curriculum.md), [`docs/mixed-lessons.md`](./mixed-lessons.md), and [`docs/f04-objective-vocabulary-review.md`](./f04-objective-vocabulary-review.md).

---

### PR 3 — Curated Web Dialogues (`41/64` → `64/64`) with Hand-Picked, Audited Distractors

> [!WARNING]
> **Hard Editorial Gate (PR #75 & F03 §5):** No exchange is counted as covered until (1) every distractor is verified to be pragmatically **wrong** in **all 6 languages** (not just English — e.g. avoiding Turkish `kalem` / Arabic `قلم` overlap between *pen* and *pencil*), and (2) independent native-speaker review verdicts are recorded per [`docs/f03-translation-qa-2026-11-13.md:117`](../docs/f03-translation-qa-2026-11-13.md#L117).

#### `[MODIFY]` [`dist/dialogues.mjs`](../dist/dialogues.mjs) & [`dist/arabic-address.mjs`](../dist/arabic-address.mjs)
Add **23 curated speaker-to-speaker exchanges** (`2` phrase-reusing + `21` custom speaker-neutral 6-language replies), bringing web coverage to `64/64` lessons (`69` exchanges, `49` `dialogueReviewEntries`). Every exchange flagged during review now carries explicit `distractorIndices`:

| Level | Lesson | Type | Cue | Proposed Reply (`en` preview) | Audited Distractors (`distractorIndices`) |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | `numbers` | Custom | `5`: *"Could you repeat the number?"* | *"Of course: zero, five, two, nine."* | **`[2, 3, 4]`** *(excludes `1` "One, two, three." and `6` "Please write it down.")* |
| 1 | `belongings` | Custom | `4`: *"Is this key yours?"* | *"Yes, it’s mine. Thank you!"* | **`[1, 2, 3, 5]`** *(excludes `6` "This notebook is not mine.")* |
| 1 | `where-things-are` | Custom | `6`: *"Where is my pencil?"* | *"It’s next to the box."* | **`[2, 3, 4, 5]`** *(excludes `1` "The pen is on the notebook." — prevents `tr` `kalem` / `ar` `قلم` overlap)* |
| 2 | `family` | Custom | `5`: *"Where does your family live?"* | *"They live in another city."* | **`[1, 2, 4, 6]`** *(excludes `3` "My friend lives nearby.")* |
| 2 | `apartment` | Custom | `6`: *"Could you close the door?"* | *"Of course, I’ll close it now."* | Default `[1, 2, 3, 4, 5]` (room/furniture statements) |
| 2 | `free-time` | Custom | `6`: *"I’m learning to swim."* | *"That’s great! Where do you practice?"* | **`[1, 2, 3, 5]`** *(excludes `4` question); register 2sg AR addressee in `arabic-address.mjs`* |
| 2 | `home-chores` | Custom | `4`: *"Can you take out the trash?"* | *"Sure, I’ll do it right away."* | **`[1, 2, 3, 5]`** *(excludes `6` "We have finished; now we can rest.")* |
| 2 | `telling-time` | Custom | `6`: *"What time do you finish?"* | *"I finish at six o’clock."* | **`[1, 2, 3, 4]`** *(excludes `5` "I need a little time.")* |
| 3 | `market` | Custom | `2`: *"Are these tomatoes fresh?"* | *"Yes, they arrived this morning."* | Default `[1, 3, 4, 5, 6]` (customer requests) |
| 3 | `dietary-needs` | Custom | `4`: *"Do you have a dish that is not spicy?"* | *"Yes, the vegetable soup is not spicy."* | Default `[1, 2, 3, 5, 6]` (customer requests) |
| 4 | `directions` | Custom | `4`: *"Is it far?"* | *"No, it’s about a five-minute walk."* | Default `[1, 2, 3, 5, 6]` |
| 4 | `plans` | Reused | `1`: *"Do you have time tomorrow?"* | `3`: *"I’m free after work."* | **`[4, 6, 'appointment-6']`** *(excludes `2` "Let’s meet at six." and `5` "I’ll call you later.")* |
| 4 | `city-services` | Custom | `4`: *"Do I need an appointment?"* | *"No, you can wait in line at the counter."* | Default `[1, 2, 3, 5, 6]`; register 2sg AR addressee in `arabic-address.mjs` |
| 5 | `shopping` | Custom | `1`: *"Do you have a smaller size?"* | *"Let me check in the back for you."* | Default `[2, 3, 4, 5, 6]`; register 2sg AR addressee in `arabic-address.mjs` |
| 5 | `hotel` | Custom | `2`: *"Is breakfast included in the price?"* | *"Yes, it is served from seven to ten."* | Default `[1, 3, 4, 5, 6]` |
| 6 | `story` | Custom | `1`: *"Yesterday I missed the bus."* | *"Oh no, how did you get there in the end?"* | Default `[2, 3, 4, 5, 6]` (1st-person narrator lines); register 2sg AR addressee |
| 6 | `compare` | Reused | `4`: *"Which option would you choose if you had more time?"* | `6`: *"Both options are convenient, but I’d choose the train."* | **`[1, 5, 'community-garden-1']`** *(excludes `2` and `3`)* |
| 6 | `describing-people` | Custom | `5`: *"At first he seems shy."* | *"Yes, but he opens up once you get to know him."* | **`[1, 3, 6]`** *(excludes `2` and `4`); register 2sg AR addressee* |
| 7 | `reflection` | Custom | `2`: *"I’d like to feel more confident when I speak."* | *"Practicing a little every day really helps with that."* | **`[1, 3, 5, 6]`** *(excludes `4` "The more I practice, the easier it gets.")* |
| 7 | `instructions` | Custom | `6`: *"Could you show me how you did it?"* | *"Sure, I’ll walk you through it step by step."* | **`[1, 2, 3, 5]`** *(excludes `4` "You only need to change the first two lines."); register 2sg AR addressee* |
| 7 | `learning-strategies` | Custom | `1`: *"Although I understand the text, I struggle to express myself freely."* | *"Try summarizing each paragraph aloud in your own words."* | **`['reflection-1', 'reflection-5', 'reflection-6']`** *(excludes `learning-strategies` `2–6` which all read like study advice); register 2sg AR addressee* |
| 8 | `feedback` | Custom | `3`: *"Could we move the background information to the beginning?"* | *"Yes, that will make the structure much clearer."* | **`[1, 2, 4]`** *(excludes `5` and `6` "Let’s review the revised version together...")* |
| 8 | `short-update` | Custom | `6`: *"I would like five minutes at the next meeting."* | *"Sure, I’ll add your update to the agenda."* | **`[1, 2, 3, 4]`** *(excludes `5` "There is nothing blocking us."); register 2sg AR addressee* |

#### Supporting PR 3 Updates
- [`dist/russian-stress.mjs`](../dist/russian-stress.mjs): Add verified stress entries for every new Russian token in the 21 custom replies.
- [`test/dialogues.test.mjs`](../test/dialogues.test.mjs) & [`test/translation-quality.test.mjs`](../test/translation-quality.test.mjs): Update counts (`69` exchanges, `49` custom replies, `1,158` entries, `9,564` text fields) and add explicit regression checks for the hand-picked distractors above (mirroring the existing `news-reports` / `evaluating-evidence` / `negotiating-priorities` assertions).
- [`README.md`](../README.md#L83-L84): Update `46` exchanges / `28` replies → `69` exchanges / `49` replies.

---

### PR 4 — Reading-Depth Question Rewrites (Separate Editorial Pass)

> [!IMPORTANT]
> **Why Revision 1's 10-Tag Plan Was Replaced:**
> 1. Six of Revision 1's ten proposed tags (`keys` Q2, `route-home` Q2, `leaking-tap` Q3, `rain-barrel` Q3, `pharmacy-queue` Q4, `shelf-pilot` Q3) can be answered almost verbatim from a single sentence in the story (e.g., [`dist/stories.mjs:451`](../dist/stories.mjs#L451) explicitly states *"so he could bring the right spare part"*). Tagging recall questions inflates reading-depth scores and violates F06's goal (*"validated inferential questions, not only direct fact lookup"*).
> 2. Adding a single tag to a 3-question story triggers an extra `"1 / 1"` `readingDepthResult` line on the result screen ([`dist/app.mjs:1865-1869`](../dist/app.mjs#L1865-L1869)), reintroducing the tiny subscore noise PR #24 intentionally retired.
> 3. Note: Stories without explicit `kind` properties simply omit `kind` (defaulting to `'detail'` in [`dist/practice.mjs:211`](../dist/practice.mjs#L211)).

#### Revised PR 4 Approach (Designed & Reviewed Separately After PRs 1–3)
- **Drop the 100% tagging target.** Never tag single-sentence factual recall.
- **Keep result screens clean:** Gate `readingDepthResult` rendering ([`dist/app.mjs:1865`](../dist/app.mjs#L1865)) or story tagging so a story only displays a separate reading-depth score when it contains **at least 2 genuine higher-order questions** (never a `"1/1"` subscore).
- **Rewrite, don't relabel:** Draft new multi-clue questions (e.g., asking which two details in the story together justify a conclusion, or distinguishing an assumption from verified evidence) for targeted Level 5–8 stories — starting with `baggage-report` (whose Q4 already tests genuine evidence vs. expectation) and selected Level 6–8 stories (`team`, `meeting-notes`, `shelf-pilot`, `leaking-tap`). Each rewritten question must pass option-length balance checks ([`test/catalog.test.mjs`](../test/catalog.test.mjs)) and 6-language native editorial sign-off.

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
- [ ] **PR 1 — Active-lesson resume rollout check:** Start `L1 numbers`, advance past `word-intro` and `word-meaning`, reload the tab mid-lesson; confirm v2 resume restores cleanly, and verify a simulated pre-split v1 session in `sessionStorage` is cleanly discarded without error.
- [ ] **PR 2 — Vocabulary & Lug‘at reveal behavior:** Test `L1 introductions` (`8+5`), `L2 routine` (`8 + 6 + 6` on mobile), `L2 outdoors` (`6+8` with moved `weather`), and `L4 inside-a-building` (`6+6`); confirm Level 2 learners see `weather` in Lug‘at only after meeting it or finishing `outdoors`, while Level 3 learners see it immediately; confirm `word-polite-words-3` shows `عذرًا` (`ʿudhran`) in Arabic regardless of speaker setting.
- [ ] **PR 2 — Default Telegram bot sanity check:** Verify default companion mode remains unchanged (`Aytim ilovasini ochish` and `Tezkor mashqlar`), and new introduced words appear cleanly in quick practice and `/review`.
- [ ] **PR 3 — Reply practice (`64/64`):** Spot-check newly covered lessons across Levels 1–8 (`numbers`, `where-things-are`, `plans`, `compare`, `reflection`, `instructions`, `learning-strategies`, `feedback`) in multiple directions (including `tr` and `ar`) to confirm unambiguous answers and Arabic feminine addressee hints where registered.
- [ ] **PR 4 — Reading result simplicity:** Confirm no story shows a `"1 / 1"` reading-depth line and rewritten higher-order questions require synthesizing multiple story details rather than single-sentence lookup.
