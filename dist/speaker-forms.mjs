import { phrases } from './content.mjs';

// Lesson phrases whose Russian, Arabic or German wording depends on the
// speaker's gender. The catalog stores the masculine form; these are the
// feminine forms (with the Arabic reading aid where the Arabic changes).
export const speakerForms = ['m', 'f'];

export const feminineForms = {
  'introductions-5': { ru: 'Я студентка.', ar: 'أنا طالبة.', romanization: 'Anā ṭāliba.', de: 'Ich bin Studentin.' },
  'cafe-1': { ru: 'Я хотела бы чай.' },
  'story-1': { ru: 'Вчера я опоздала на автобус.' },
  'story-2': { ru: 'Пока я ждала, начался дождь.' },
  'story-3': { ru: 'В конце концов я взяла такси.' },
  'story-5': { ru: 'Сначала я не знала, что делать.' },
  'opinions-2': { ru: 'В этом я с вами согласна.' },
  'problems-2': { ru: 'Я просила номер с двумя кроватями.' },
  'reflection-2': { ru: 'Я хотела бы говорить увереннее.' },
  'reflection-5': { ru: 'Раньше я боялась ошибаться.' },
  'messages-1': { ar: 'آسفة على التأخّر في الردّ.', romanization: 'Āsifa ʿalā at-taʾakhkhuri fī ar-radd.' },
  'messages-3': { ru: 'Вам удалось открыть файл, который я отправила?' },
  'hotel-5': { ru: 'В номере, который я забронировала, есть балкон.' },
  'compare-2': { ru: 'Я предпочла бы выехать пораньше, чтобы избежать пробок.' },
  'compare-6': { ru: 'Оба варианта удобны, но я бы выбрала поезд.' },
  'decisions-4': { ru: 'Я готова поддержать это, если мы договоримся, кто отвечает за каждый шаг.' },
  'post-office-1': { ru: 'Я хотела бы отправить эту посылку в Германию.' },
  'describing-change-1': { ru: 'Когда я только переехала сюда, я никого не знала.' },
  'describing-change-4': { ru: 'С тех пор я стала ездить на работу на автобусе.' },
  'describing-change-6': { ru: 'Оглядываясь назад, я рада, что переехала.' },
  'delivery-problem-3': { ru: 'Я уже спросила соседей, но никто из них не получал посылку.' },
  'feedback-5': { ru: 'Я бы оставила заключение и сократила вступление.' },
  'coach-trip-2': { ru: 'Первый автобус опоздал, и я не успела на пересадку.' },
  'home-chores-5': { ru: 'Я полила цветы.' },
  'wellbeing-2': { ru: 'Я немного устала.', ar: 'أنا متعبة قليلًا.', romanization: 'Anā mutʿabatun qalīlan.' },
  'wellbeing-3': { ar: 'أنا عطشى.', romanization: 'Anā ʿaṭshā.' },
  'wellbeing-6': { ru: 'Я хотела бы немного отдохнуть.' },
  'airport-help-4': { ru: 'Я опоздала на пересадку из-за задержки первого рейса.' },
  'memories-1': { ar: 'عندما كنت طفلةً، كنّا نزور القرية كلّ صيف.', romanization: 'ʿIndamā kuntu ṭiflatan, kunnā nazūru al-qaryata kulla ṣayf.' },
  'memories-3': { ru: 'С тех пор как я уехала, район сильно изменился.' },
  'memories-6': { ru: 'В следующий приезд я хотела бы увидеть старых друзей.' },
  'news-reports-3': { ru: 'Я хотела бы знать, откуда эта информация.' }
};

const masculine = new Map();

// Switches every listed phrase to the chosen speaker form. Phrase objects are
// shared by lessons, practice, vocabulary and audio, so all of them follow.
export function applySpeakerForms(form = 'm') {
  const feminine = form === 'f';
  for (const entry of phrases) {
    const forms = feminineForms[entry.id];
    if (!forms) continue;
    if (!masculine.has(entry.id)) masculine.set(entry.id, { text: { ...entry.text }, romanization: entry.romanization });
    const original = masculine.get(entry.id);
    for (const code of Object.keys(forms)) {
      if (code === 'romanization') entry.romanization = feminine ? forms.romanization : original.romanization;
      else entry.text[code] = feminine ? forms[code] : original.text[code];
    }
  }
  return feminine ? 'f' : 'm';
}
