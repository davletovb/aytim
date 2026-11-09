# Curriculum catalog

Aytim has eight numbered learning levels for all 30 directions between Uzbek,
English, Russian, Modern Standard Arabic, Turkish, and German. These are internal
learning stages, not CEFR certifications.

The November 2026 expansion adds 16 lessons (96 phrases), 128 vocabulary entries,
eight stories with 32 comprehension questions, and a repeatable 12-question test
at every level. The complete catalog now contains 56 lessons, 336 lesson phrases,
336 vocabulary entries, and 26 stories.

| Level | New lessons | New vocabulary themes | New story |
| --- | --- | --- | --- |
| 1 | Please and thank you; My belongings | Everyday objects; Positions | The red notebook |
| 2 | Chores at home; How do you feel? | Household chores; Body and rest | A quiet evening |
| 3 | Asking about food; Having guests for dinner | Ingredients; At the table | Dinner together |
| 4 | Services in town; Changing plans | Public services; Scheduling | A new meeting time |
| 5 | Getting help at the airport; Travel choices | Airport; Booking conditions | The missing suitcase |
| 6 | Memories and change; Reporting news | Memory and change; News and sources | The street in an old photo |
| 7 | Making a formal request; Improving how you learn | Formal correspondence; Learning tools | A clear request |
| 8 | Evaluating evidence; Negotiating priorities | Evidence and reasoning; Negotiation | A decision after a survey |

Every level has seven lessons. New catalog modules are `dist/more-lessons.mjs`,
`dist/more-words.mjs`, and `dist/more-stories.mjs`; `dist/catalog.mjs` supplies their
data factories. Each item declares its numbered level. `dist/journey.mjs` appends
these items to that level while keeping original lesson IDs and placement anchors.
Arabic phrases, words, and story lines include Latin-script reading aids.

Level tests are available inside each learning-path level and on the practice page
for the learner's current level. Home and the learning path show seven lessons
followed by the level test on one connected route: four stops per row on wider
cards, a vertical trail on narrow cards. Test stops use an amber rounded square
and flag, turning green with a check after passing. Lesson counts still exclude
the test, whose best score is displayed on its own stop.

Each test samples all seven lessons, with eight
phrase questions and four words from distinct groups. Translation, gap filling,
spelling, and sentence rebuilding are mixed; sentences unsuitable for rebuilding
use spelling instead. Passing requires eight of twelve correct answers. Best scores
are stored per language pair in `practiceBest['checkpoint-N']`, using the existing
browser and D1 save format. Incorrect items enter spaced repetition. Taking a test
does not mark individual lessons as completed or bypass the placement mechanism.

New story quizzes have four questions and require three correct answers for reading
completion. Original three-question stories still require two. Story cards show
their level; the existing guided flow continues to recommend reading adaptively.

Run `npm test` to validate catalog completeness and exercise generation across all
30 directions and eight levels, alongside the Worker and D1 integration tests.
`npm run deploy:check` verifies the Cloudflare deployment bundle without publishing.
