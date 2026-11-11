import { localized, units } from './content.mjs';
import { wordGroups } from './words.mjs';
import { stories, storyPassed } from './stories.mjs';
import { completed, reviewQueue } from './engine.mjs';

const steps = [
  [
    ['greetings', 'introductions', 'numbers', 'classroom-phrases', 'colors'], ['people', 'actions', 'numbers', 'colors'], ['chairs', 'blue-cup'],
    localized('Salomlashish va o‘zingizni tanishtirishni mashq qilyapsiz.', 'You’re practicing greetings and introducing yourself.', 'Вы учитесь здороваться и представляться.', 'تتدرّب على إلقاء التحية والتعريف بنفسك.', 'Selamlaşmayı ve kendini tanıtmayı çalışıyorsun.', 'Du übst, jemanden zu begrüßen und dich vorzustellen.')
  ],
  [
    ['family', 'routine', 'apartment', 'free-time', 'outdoors'], ['home', 'time', 'apartment', 'outdoors'], ['walk', 'riverside'],
    localized('Oilangiz va kundalik hayotingiz haqida gapirishni mashq qilyapsiz.', 'You’re practicing how to talk about your family and daily routines.', 'Вы учитесь рассказывать о семье и своём распорядке дня.', 'تتدرّب على الحديث عن عائلتك وروتينك اليومي.', 'Ailenden ve günlük hayatından bahsetmeyi çalışıyorsun.', 'Du übst, über deine Familie und deinen Alltag zu sprechen.')
  ],
  [
    ['cafe', 'market', 'meal', 'cooking', 'bakery'], ['food', 'menu', 'bakery'], ['rain', 'gift', 'soup', 'last-loaf'],
    localized('Buyurtma berish, narx va miqdorni so‘rashni mashq qilyapsiz.', 'You’re practicing ordering food and asking about prices and quantities.', 'Вы учитесь заказывать еду, спрашивать о цене и количестве.', 'تتدرّب على طلب الطعام والسؤال عن الأسعار والكميات.', 'Yemek siparişi vermeyi, fiyat ve miktar sormayı çalışıyorsun.', 'Du übst, Essen zu bestellen und nach Preisen und Mengen zu fragen.')
  ],
  [
    ['directions', 'plans', 'appointment', 'phone-call', 'library-visit'], ['city', 'weather', 'days', 'library'], ['library-card'],
    localized('Yo‘l so‘rash va uchrashuv vaqtini kelishishni mashq qilyapsiz.', 'You’re practicing asking for directions and arranging a time to meet.', 'Вы учитесь спрашивать дорогу и договариваться о встрече.', 'تتدرّب على السؤال عن الطريق وترتيب موعد للقاء.', 'Yol sormayı ve bir buluşma ayarlamayı çalışıyorsun.', 'Du übst, nach dem Weg zu fragen und ein Treffen zu vereinbaren.')
  ],
  [
    ['shopping', 'travel', 'hotel', 'post-office', 'coach-trip'], ['travel', 'clothes', 'hotel', 'coach'], ['platform', 'missed-coach'],
    localized('Do‘konda savol berish va safar rejasi o‘zgarganda gaplashishni mashq qilyapsiz.', 'You’re practicing asking questions in shops and dealing with changes to travel plans.', 'Вы учитесь задавать вопросы в магазине и обсуждать изменения в поездке.', 'تتدرّب على طرح الأسئلة في المتاجر والتعامل مع تغيّرات خطط السفر.', 'Alışverişte soru sormayı ve yolculuk planındaki değişiklikleri konuşmayı çalışıyorsun.', 'Du übst, im Geschäft Fragen zu stellen und mit Änderungen auf Reisen umzugehen.')
  ],
  [
    ['story', 'opinions', 'compare', 'describing-change', 'community-garden'], ['feelings', 'comparison', 'garden'], ['keys', 'route-home', 'rain-barrel'],
    localized('Voqeani ketma-ket aytib berish va fikr bildirishni mashq qilyapsiz.', 'You’re practicing telling a story in order and giving your opinion.', 'Вы учитесь последовательно рассказывать о событиях и высказывать своё мнение.', 'تتدرّب على سرد الأحداث بالترتيب والتعبير عن رأيك.', 'Olayları sırasıyla anlatmayı ve görüşünü belirtmeyi çalışıyorsun.', 'Du übst, Ereignisse der Reihe nach zu erzählen und deine Meinung zu äußern.')
  ],
  [
    ['problems', 'reflection', 'instructions', 'delivery-problem', 'maintenance'], ['connectors', 'instructions', 'repairs'], ['leaking-tap'],
    localized('Muammoni tushuntirish, yechim so‘rash va maqsadlaringiz haqida gapirishni mashq qilyapsiz.', 'You’re practicing explaining a problem, asking for alternatives, and talking about your goals.', 'Вы учитесь объяснять проблему, спрашивать о других вариантах и говорить о своих целях.', 'تتدرّب على شرح المشكلات وطلب بدائل والحديث عن أهدافك.', 'Bir sorunu açıklamayı, başka seçenekler sormayı ve hedeflerinden bahsetmeyi çalışıyorsun.', 'Du übst, ein Problem zu erklären, nach Alternativen zu fragen und über deine Ziele zu sprechen.')
  ],
  [
    ['work', 'messages', 'decisions', 'feedback', 'meeting-summary'], ['work', 'decisions', 'meetings'], ['team', 'shelf-pilot', 'meeting-notes'],
    localized('Ishdagi vazifalarni aniqlashtirish va xabar yozishni mashq qilyapsiz.', 'You’re practicing clarifying tasks at work and writing messages.', 'Вы учитесь уточнять рабочие задачи и писать сообщения.', 'تتدرّب على توضيح مهام العمل وكتابة الرسائل.', 'İş yerinde görevleri netleştirmeyi ve mesaj yazmayı çalışıyorsun.', 'Du übst, Aufgaben bei der Arbeit zu klären und Nachrichten zu schreiben.')
  ]
];

// A level test unlocks the next level at 80% (rounded up), the same standard as a lesson.
export const checkpointQuestionCount = 12;
export const checkpointPassMark = Math.ceil(checkpointQuestionCount * 0.8);

export const path = steps.map(([, , , description], index) => {
  const level = index + 1;
  const lessons = units.filter(unit => unit.level === level);
  const vocabulary = wordGroups.filter(group => group.level === level);
  const reading = stories.filter(story => story.level === level);
  return {
    level, description, units: lessons, wordGroups: vocabulary, stories: reading,
    phrases: lessons.flatMap(unit => unit.phrases),
    support: vocabulary.flatMap(group => group.words.map(word => word.id)).concat(reading.map(story => 'reading:' + story.id))
  };
});

export const orderedUnits = path.flatMap(step => step.units);
const entryLevels = new Map(path.flatMap(step => [
  ...step.phrases.map(entry => [entry.id, step.level]),
  ...step.wordGroups.flatMap(group => group.words.map(entry => [entry.id, step.level])),
  ...step.stories.map(story => ['reading:' + story.id, step.level])
]));
const maxLevel = path.length;

// A passed checkpoint unlocks the next level, even when lessons remain unfinished.
// Lessons still unlock sequentially within the active level; placement is another
// way for experienced learners to begin above Level 1.
export function journeyFor(course) {
  course.journey ??= { level: 1, evidence: {}, recent: {}, lastActivity: null };
  const journey = course.journey;
  journey.level = Math.min(maxLevel, Math.max(1, journey.level));
  journey.evidence ??= {};
  journey.recent ??= {};
  journey.lastActivity ??= null;
  while (journey.level < maxLevel && levelComplete(course, journey.level)) journey.level++;
  return journey;
}

export function lessonUnlocked(course, unit) {
  const level = journeyFor(course).level;
  if (!Number.isInteger(unit?.level) || unit.level > level) return false;
  if (unit.level < level) return path[unit.level - 1].units.some(item => item.id === unit.id);
  const step = path[unit.level - 1];
  const index = step?.units.findIndex(item => item.id === unit.id) ?? -1;
  return index >= 0 && (index === 0 || step.units.slice(0, index).every(previous => completed(previous, course)));
}

export function levelComplete(course, level) {
  const step = path[level - 1];
  return Boolean(step && (course.practiceBest?.['checkpoint-' + level] ?? 0) >= checkpointPassMark);
}

export function checkpointUnlocked(course, level) {
  const step = path[level - 1];
  return Boolean(step && level <= journeyFor(course).level);
}

export function accessibleLevel(course) {
  // Read-only access checks must not mutate a saved course (e.g., while browsing
  // vocabulary). Persist advancement when the journey is explicitly accessed.
  let level = Math.min(maxLevel, Math.max(1, course.journey?.level ?? 1));
  while (level < maxLevel && levelComplete(course, level)) level++;
  return level;
}

export function journeyStatus(course) {
  const journey = journeyFor(course);
  const current = path[journey.level - 1];
  const done = current.units.filter(unit => completed(unit, course)).length;
  const testPassed = (course.practiceBest?.['checkpoint-' + current.level] ?? 0) >= checkpointPassMark;
  const fill = testPassed ? 1 : done / (current.units.length + 1);
  return { current, fill, next: path[journey.level], complete: journey.level === maxLevel && fill === 1 };
}

export function needsSupport(course, skill) {
  const recent = journeyFor(course).recent[skill] ?? [];
  return recent.length >= 4 && recent.filter(Boolean).length * 2 < recent.length;
}

export function workingLevel(course, skill) {
  return Math.max(1, journeyFor(course).level - Number(needsSupport(course, skill)));
}

export function recordJourney(course, answers, activity, now = Date.now()) {
  const journey = journeyFor(course);
  for (const { id, correct, skill } of answers) {
    if (skill) journey.recent[skill] = [...(journey.recent[skill] ?? []), correct].slice(-6);
    if (!correct || !entryLevels.has(id)) continue;
    const card = course.cards[id];
    const delayed = card?.step >= 0 && card.due <= now;
    if (activity === 'review' && (!delayed || !journey.evidence[id])) continue;
    journey.evidence[id] = Math.max(journey.evidence[id] ?? 0, skill === 'recall' || delayed ? 2 : 1);
  }
  journey.lastActivity = activity;
  return journey.level;
}

export function applyPlacement(course, answers) {
  const journey = journeyFor(course);
  // Two questions per level, in level order. A level with both answers right is
  // passed. One slip in the whole test is forgiven when the next level is then
  // answered perfectly; otherwise the learner starts at the level they missed.
  let placed = 1;
  let slipForgiven = false;
  for (let level = 1; level <= maxLevel; level++) {
    const pair = [answers[level * 2 - 2], answers[level * 2 - 1]];
    if (pair.some(answer => !answer)) break;
    const right = pair.filter(answer => answer.correct).length;
    if (right === 2) {
      placed = Math.min(maxLevel, level + 1);
    } else if (right === 1 && !slipForgiven && level < maxLevel) {
      slipForgiven = true;
    } else break;
  }
  journey.level = Math.max(journey.level, placed);
  course.placementDone = true;
  return journey.level;
}

export function dueForLevel(course, now = Date.now()) {
  const level = accessibleLevel(course);
  return reviewQueue(course, false, now).filter(entry => (entryLevels.get(entry.id) ?? Infinity) <= level);
}

export function nextActivity(course, now = Date.now()) {
  const journey = journeyFor(course);
  const due = dueForLevel(course, now);
  if (due.length >= 3 && journey.lastActivity !== 'review') return { type: 'review', queue: due.slice(0, 4) };
  const step = path[journey.level - 1];
  const unit = step.units.find(item => !completed(item, course));
  if (unit) return { type: 'lesson', unit };
  if (checkpointUnlocked(course, step.level) && !levelComplete(course, step.level)) {
    return { type: 'checkpoint', level: step.level };
  }
  const story = path[workingLevel(course, 'reading') - 1].stories
    .find(item => !storyPassed(item, course.storyBest?.[item.id]));
  if (story && journey.lastActivity !== 'reading') return { type: 'story', story };
  return { type: 'mixed' };
}
