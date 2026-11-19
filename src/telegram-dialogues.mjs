import { lessonExchanges } from '../dist/dialogues.mjs';
import { localized } from '../dist/content.mjs';
import { orderedUnits } from '../dist/journey.mjs';
import { searchText, shuffled } from '../dist/engine.mjs';
import { feminineForms } from '../dist/speaker-forms.mjs';

const byId = new Map(orderedUnits.map(unit => [unit.id, unit]));
const lesson = (id, number) => byId.get(id).phrases[number - 1];
const exchange = (id, index) => lessonExchanges(byId.get(id))[index];
const choice = (entry, next = 'done') => ({ entry, next });
const distractor = entry => choice(entry, null);
const textFor = (entry, target, speaker) => speaker === 'f' && feminineForms[entry?.id]?.[target]
  ? feminineForms[entry.id][target] : entry?.text?.[target];

const greeting = exchange('greetings', 0);
const [name, origin] = lessonExchanges(byId.get('introductions'));
const tea = exchange('cafe', 0);

// Each scene uses curated curriculum lines. A valid choice can change the
// next turn, including who speaks first. Wrong choices stay on the same turn.
export const dialogueScenes = {
  greetings: [
    { goal: localized('Salomlashing.', 'Say hello.', 'Поздоровайтесь.', 'ألقِ التحية.', 'Selam ver.', 'Begrüße dein Gegenüber.'), options: [
      choice(lesson('greetings', 1), 'how'), choice(lesson('greetings', 2), 'morning'),
      distractor(lesson('greetings', 6))
    ] },
    { id: 'how', cue: greeting.cue, goal: localized('Hol-ahvolingizni ayting.', 'Say how you’re doing.', 'Скажите, как у вас дела.', 'قل كيف حالك.', 'Nasıl olduğunu söyle.', 'Sag, wie es dir geht.'), options: [
      choice(greeting.reply), distractor(lesson('greetings', 2)), distractor(lesson('greetings', 6))
    ] },
    { id: 'morning', cue: lesson('greetings', 2), goal: localized('Ertalabki salomga javob bering.', 'Reply to the morning greeting.', 'Ответьте на утреннее приветствие.', 'رُدّ على تحية الصباح.', 'Sabah selamına karşılık ver.', 'Antworte auf den Morgengruß.'), options: [
      choice(lesson('greetings', 2)), distractor(lesson('greetings', 6)), distractor(greeting.reply)
    ] }
  ],
  introductions: [
    { cue: name.cue, goal: localized('Ismingizni ayting.', 'Say your name.', 'Назовите своё имя.', 'اذكر اسمك.', 'Adını söyle.', 'Sag, wie du heißt.'), options: [
      choice(name.reply, 'origin'), distractor(lesson('introductions', 4)), distractor(lesson('introductions', 5))
    ] },
    { id: 'origin', cue: origin.cue, goal: localized('Qayerdan ekaningizni ayting.', 'Say where you’re from.', 'Скажите, откуда вы.', 'قل من أين أنت.', 'Nereli olduğunu söyle.', 'Sag, woher du kommst.'), options: [
      choice(origin.reply), distractor(name.reply), distractor(lesson('introductions', 5))
    ] }
  ],
  cafe: [
    { goal: localized('Choy buyurtma qiling yoki menyuni so‘rang.', 'Order tea or ask for the menu.', 'Закажите чай или попросите меню.', 'اطلب الشاي أو قائمة الطعام.', 'Çay sipariş et veya menüyü iste.', 'Bestelle Tee oder bitte um die Speisekarte.'), options: [
      choice(tea.cue, 'sugar'), choice(lesson('cafe', 4), 'menu'), distractor(lesson('cafe', 5))
    ] },
    { id: 'sugar', cue: tea.reply, goal: localized('Choyni shakarsiz so‘rang.', 'Ask for your tea without sugar.', 'Попросите чай без сахара.', 'اطلب الشاي من دون سكّر.', 'Çayını şekersiz iste.', 'Bitte um Tee ohne Zucker.'), options: [
      choice(lesson('cafe', 2)), distractor(lesson('cafe', 4)), distractor(lesson('cafe', 5))
    ] },
    { id: 'menu', goal: localized('Endi choy buyurtma qiling.', 'Now order tea.', 'Теперь закажите чай.', 'اطلب الشاي الآن.', 'Şimdi çay sipariş et.', 'Bestelle jetzt einen Tee.'), options: [
      choice(tea.cue, 'sugar'), distractor(lesson('cafe', 4)), distractor(lesson('cafe', 5))
    ] }
  ],
  directions: [
    { goal: localized('Vokzal qayerdaligini so‘rang.', 'Ask where the train station is.', 'Спросите, где находится вокзал.', 'اسأل أين تقع محطة القطار.', 'Tren istasyonunun nerede olduğunu sor.', 'Frag, wo der Bahnhof ist.'), options: [
      choice(lesson('directions', 1), 'distance'), distractor(lesson('directions', 5)),
      distractor(lesson('directions', 6))
    ] },
    { id: 'distance', cue: lesson('directions', 3), goal: localized('Vokzal uzoqmi, deb so‘rang.', 'Ask whether the train station is far.', 'Спросите, далеко ли вокзал.', 'اسأل إن كانت محطة القطار بعيدة.', 'Tren istasyonunun uzak olup olmadığını sor.', 'Frag, ob der Bahnhof weit weg ist.'), options: [
      choice(lesson('directions', 4)), distractor(lesson('directions', 5)), distractor(lesson('directions', 6))
    ], closing: localized('Yo‘q, yaqin.', 'No, it’s nearby.', 'Нет, он рядом.', 'لا، المحطة قريبة.',
      'Hayır, yakın.', 'Nein, er ist ganz in der Nähe.') }
  ]
};

export function dialogueExercise(unit, target, random, base = 'uz', speaker = 'm') {
  const scene = dialogueScenes[unit.id];
  if (!scene) return null;
  return {
    turns: Object.fromEntries(scene.map(({ id = 'start', cue, goal, closing, options }) => {
      const answers = options.filter(item => item.next);
      const seen = new Set();
      const unique = [...answers, ...options.filter(item => !item.next)].flatMap(({ entry, next }) => {
        const text = textFor(entry, target, speaker), key = searchText(text);
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ text, next }];
      });
      return [id, { cue: textFor(cue, target, speaker), goal: goal[base], closing: closing?.[target], options: shuffled(unique, random) }];
    }))
  };
}
