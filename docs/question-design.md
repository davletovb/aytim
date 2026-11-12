# Question design

Every question in Aytim — lessons, practice, skill checks, story quizzes, level
tests, placement, matching and vocabulary review — uses one card with the same
five parts in the same order. Only the prompt panel and the answer area change
with the question type. Open [question-design.html](question-design.html) for the
visual reference of every type, phone layouts and Arabic.

The helpers live in `dist/app.mjs` (`questionHeader`, `questionInstruction`,
`promptPanel`, `audioPrompt`, `promptRows`, `wordBankMarkup`, `questionFooter`,
`showFeedback`) and the styles in the "Unified question card" section of
`dist/styles.css`. `test/question-card.test.mjs` keeps both in line.

## Anatomy

1. **Header** — skill chip on the start side; counter on the end side
   ("Savol 3 / 8", "Vazifa", "Juftlik" or "Karta"), or a dashed "Baholanmaydi"
   tag on unscored cards; progress bar underneath.
2. **Instruction** — one sentence at 18 px / 650. Never inside a coloured box,
   never a large heading. It is the focus target after each question.
3. **Prompt panel** — the green panel holding what is being asked about. Top
   row: language label (12 px caps) and, when there is audio, the **Tinglash**
   pill. Prompt text is 26 px / 650 (21 px when longer than ~60 characters,
   22 / 19 px on phones). An optional support line (15 px, muted) holds the
   translation hint, gap meaning, revealed transcript or story text.
   Audio-only questions show one large play button instead of text.
4. **Answer area** — one of: choice list, word bank, match board, speaking
   control, or reveal box. All answer text is 17 px / 600 and every target is at
   least 44–52 px tall.
5. **Footer** — a divider, then one secondary text action on the start side
   before answering (Tozalash, "Tinglay olmayapsizmi?", "Iborani ko‘rish",
   "Hikoyani qayta o‘qish", "Namunaviy javobni ko‘rish"), replaced by the feedback
   after answering; the primary button on the end side. On phones the button is
   full width under the secondary action.

## Type scale

| Role | Size / weight |
| --- | --- |
| Prompt text | 26 / 650 (21 long; 22 / 19 on phones) |
| Instruction | 18 / 650 |
| Answers: options, tiles, match cards | 17 / 600 |
| Support text, feedback, footer actions | 15 |
| Chip, counter, field labels, notes | 13 / 700 (prompt labels 12 caps) |

The only other sizes are the 14 px listen pill and the 12 px reading aid.

## Skill chips

| Chip | Question types | Answer area |
| --- | --- | --- |
| O‘qish (Reading) | Meaning choice, reverse translation, final challenge, gap fill, story question, conversation reply | Choice list |
| Tinglash (Listening) | Listen and choose, dictation | Choice list, word bank |
| Yozish (Writing) | Build the sentence | Word bank |
| Gapirish (Speaking) | Repeat the phrase, open response | Speaking control |
| Lug‘at (Vocabulary) | Word meaning, matching, review card | Choice list, match board, reveal box |
| Yangi iboralar / Qayta eslang | Lesson intro and mistake recovery (not questions) | Phrase rows in the prompt panel |

## Rules

- **One listen control.** The outlined pill at the top of the prompt panel;
  audio-only prompts use the large play button. No other audio buttons.
- **Fallbacks are footer actions**, never a second button.
- **One primary button**, always bottom-end. Choice questions answer on tap;
  word banks use "Javobni tekshirish"; speaking and info cards use "Davom etish".
  Review cards are the only place with two buttons after the answer is shown.
- **Feedback in the footer** (✓ To‘g‘ri! / ✗ To‘g‘ri javob: …), with the chosen
  option or the answer line turning green or red.
- **Word banks** everywhere share the dashed answer line, the tray and
  "Tozalash" (except listening, whose footer action is the transcript reveal).
- **Speaking** uses one microphone button that starts and stops.
- **Start-aligned** everywhere, using logical CSS properties so Arabic mirrors.
