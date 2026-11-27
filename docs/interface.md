# Interface and appearance

## Interface language and navigation

A first visit opens in the visitor's own language when Aytim has it: the
language Telegram reports for a Mini App launch, otherwise the browser's. A
visitor whose language Aytim also teaches starts out learning English, an
English speaker starts with Uzbek, and any other language keeps the Uzbek
default. A saved choice always wins, so this only affects a first visit.

A new learner (no saved progress in this browser or account) starts with a short
**onboarding**: the language they speak (the detected one is pre-selected and the
interface switches at once), the language they want to learn, and how well they know
it: "I'm just starting" opens Level 1, "I already know some" runs the placement
assessment. It is a focused screen without navigation, and finishing it sets
`onboarded` in the saved progress, so the account's other devices skip it. Existing
learners never see it (`dist/onboarding.mjs`).

After onboarding, the language button in the top bar only switches the language
being learned: it lists the other five languages, and tapping one switches the course
at once. The base language (the one Aytim explains and translates in) changes in
**Settings**, which also offers the same target picker. Choosing the current target
language as the new base swaps the pair. Each language pair keeps its own progress.

Every screen adds one history entry, so the browser's Back button, Android's,
and Telegram's Mini App back button all step back one screen and leave a lesson
rather than the site. Questions inside a lesson do not add entries of their own.
Reloading in the same tab resumes a lesson in progress from its saved seed and
answers (`restoreLesson` in `dist/app.mjs`), restarting cleanly whenever that
lesson's activity sequence changes (for example after a release or when its
adaptive question changes).

English course text uses American spelling and vocabulary, consistent with the
`en-US` speech locale.

Arabic and Russian text can show a Latin-script reading aid. Arabic aids are
written by hand and include connected-speech vowels within clauses. Russian aids
combine transliteration with stress marks for verified word forms and contextual
readings. **Settings** controls the aid for pairs that use either script.

Dialogue and service phrases use polite address where appropriate (German
`Sie`, Russian `вы`, Uzbek and Turkish `siz`). German and Turkish app
instructions use the familiar forms established in their interface copy. Arabic
uses singular forms for one listener and plural forms when addressing a group or
organization.

Telegram chat instructions follow the learner's saved base language. Before the
learner links an account or chooses a language, chat uses the language reported
by Telegram, with Uzbek as the fallback.

## Appearance: Bright and Calm

**Bright**, the default look, is a playful style inspired by Duolingo: white
surfaces and saturated color with a job (green to continue and for a correct
answer, blue for what is selected and for audio, red for a miss, gold for level
tests and XP, orange for the streak), a color for each skill's question prompts
and for each level on the path, outlined controls that press into a darker 4px
lip, a full-width banner after every answer that shows the correct one on a
miss, and the rounded Nunito typeface. **Settings › Appearance** switches to
**Calm**, the original look. Dark mode follows the device in both.

A choice is saved with progress (`theme` in the save), so it reaches the
account's other devices like the other settings; when two devices changed it
since they last synced, the device in use wins. A save from a tab still running
an older release, which leaves `theme` out, keeps the stored choice. Learners
who never chose get Bright. `dist/theme.mjs` applies the theme (Bright as
`<html data-theme="bright">`, Calm without the attribute) along with the
browser's theme color and the logo. `index.html` starts in Bright and keeps a
copy of a Calm choice under `aytim.theme`, which it reads before anything is
drawn, so a Calm learner does not see Bright flash while the app loads; the
copy is written the first time the app applies Calm on a device.

Every rule in `dist/bright.css` is scoped to `[data-theme="bright"]`, so Calm is
untouched. Nunito is self-hosted under the SIL Open Font License
(`dist/fonts/OFL.txt`): a browser downloads a subset (20–39 KB each, for Latin
and Cyrillic) only while Bright is on and the page uses it, and Arabic keeps the
system font. Primary buttons carry dark green labels on the bright green
(6.6:1), and icons on a colored fill use that color's deep shade.
`test/theme.test.mjs` checks that every text color keeps WCAG AA contrast in
light and dark mode, and that the stylesheet stays scoped and free of CSS
nesting, which older Safari versions ignore.

## One question format

Every question — lessons, practice, skill checks, story quizzes, level tests,
placement, matching and review — uses the same card: a header with a skill chip
(Reading, Listening, Writing, Speaking or Vocabulary), counter and progress bar;
one instruction; the green prompt panel; the answer area; and a footer with one
secondary action or the feedback, plus one primary button. Text uses one scale
(prompt 26, instruction 18, answers 17, support 15, labels 13). See
[the question design](question-design.md) and its
[visual reference](question-design.html).

See [Development](development.md) for source layout and loading behavior.
