import { lessonExchanges } from '../dist/dialogues.mjs';
import { localized } from '../dist/content.mjs';
import { orderedUnits } from '../dist/journey.mjs';
import { searchText, shuffled } from '../dist/engine.mjs';

const byId = new Map(orderedUnits.map(unit => [unit.id, unit]));
const lesson = (id, number) => byId.get(id).phrases[number - 1];
const exchange = (id, index) => lessonExchanges(byId.get(id))[index];
const choice = (entry, next = 'done') => ({ entry, next });
const distractor = entry => choice(entry, null);

const greeting = exchange('greetings', 0);
const [name, origin] = lessonExchanges(byId.get('introductions'));
const tea = exchange('cafe', 0);

// Each scene uses curated curriculum lines. A valid choice can change the
// next turn, including who speaks first. Wrong choices stay on the same turn.
export const dialogueScenes = {
  greetings: [
    { goal: 'Salomlashing.', options: [
      choice(lesson('greetings', 1), 'how'), choice(lesson('greetings', 2), 'morning'),
      distractor(lesson('greetings', 6))
    ] },
    { id: 'how', cue: greeting.cue, goal: 'Hol-ahvolingizni ayting.', options: [
      choice(greeting.reply), distractor(lesson('greetings', 2)), distractor(lesson('greetings', 6))
    ] },
    { id: 'morning', cue: lesson('greetings', 2), goal: 'Ertalabki salomga javob bering.', options: [
      choice(lesson('greetings', 2)), distractor(lesson('greetings', 6)), distractor(greeting.reply)
    ] }
  ],
  introductions: [
    { cue: name.cue, goal: 'Ismingizni ayting.', options: [
      choice(name.reply, 'origin'), distractor(lesson('introductions', 4)), distractor(lesson('introductions', 5))
    ] },
    { id: 'origin', cue: origin.cue, goal: 'Qayerdan ekaningizni ayting.', options: [
      choice(origin.reply), distractor(name.reply), distractor(lesson('introductions', 5))
    ] }
  ],
  cafe: [
    { goal: 'Choy buyurtma qiling yoki menyuni so‘rang.', options: [
      choice(tea.cue, 'sugar'), choice(lesson('cafe', 4), 'menu'), distractor(lesson('cafe', 5))
    ] },
    { id: 'sugar', cue: tea.reply, goal: 'Choyni shakarsiz so‘rang.', options: [
      choice(lesson('cafe', 2)), distractor(lesson('cafe', 4)), distractor(lesson('cafe', 5))
    ] },
    { id: 'menu', goal: 'Endi choy buyurtma qiling.', options: [
      choice(tea.cue, 'sugar'), distractor(lesson('cafe', 4)), distractor(lesson('cafe', 5))
    ] }
  ],
  directions: [
    { goal: 'Vokzal qayerdaligini so‘rang.', options: [
      choice(lesson('directions', 1), 'distance'), distractor(lesson('directions', 5)),
      distractor(lesson('directions', 6))
    ] },
    { id: 'distance', cue: lesson('directions', 3), goal: 'Vokzal uzoqmi, deb so‘rang.', options: [
      choice(lesson('directions', 4)), distractor(lesson('directions', 5)), distractor(lesson('directions', 6))
    ], closing: localized('Yo‘q, yaqin.', 'No, it’s nearby.', 'Нет, он рядом.', 'لا، المحطة قريبة.',
      'Hayır, yakın.', 'Nein, er ist ganz in der Nähe.') }
  ]
};

export function dialogueExercise(unit, target, random) {
  const scene = dialogueScenes[unit.id];
  if (!scene) return null;
  return {
    turns: Object.fromEntries(scene.map(({ id = 'start', cue, goal, closing, options }) => {
      const answers = options.filter(item => item.next);
      const seen = new Set();
      const unique = [...answers, ...options.filter(item => !item.next)].flatMap(({ entry, next }) => {
        const text = entry.text[target], key = searchText(text);
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ text, next }];
      });
      return [id, { cue: cue?.text[target], goal, closing: closing?.[target], options: shuffled(unique, random) }];
    }))
  };
}
