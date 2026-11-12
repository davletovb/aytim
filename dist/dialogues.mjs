// Two-line exchanges made from phrases the lessons already teach: a cue and the
// line that follows it. Nothing here is new text, only the order in which the
// course's own sentences fit together, so an exchange works the same in all
// thirty directions. Each number is a phrase's place in its lesson.
//
// A pair is listed only where no other phrase in that lesson would do as well,
// because the exercise offers the lesson's other phrases as the wrong answers.
export const exchanges = {
  'greetings': [[3, 4]],
  'introductions': [[2, 1], [3, 4]],
  'classroom-phrases': [[4, 5]],
  'colors': [[1, 2]],
  'polite-requests': [[3, 4], [1, 6]],
  'routine': [[1, 2]],
  'outdoors': [[5, 6]],
  'wellbeing': [[3, 4]],
  'cafe': [[1, 2], [5, 6]],
  'meal': [[1, 2]],
  'cooking': [[5, 6]],
  'hosting-meal': [[5, 6]],
  'appointment': [[2, 3], [4, 5]],
  'phone-call': [[1, 2], [2, 3]],
  'library-visit': [[3, 4]],
  'changing-plans': [[1, 2], [4, 5]],
  'travel': [[1, 2], [5, 6]],
  'post-office': [[1, 2]],
  'coach-trip': [[2, 3]],
  'airport-help': [[2, 3], [4, 5]],
  'travel-options': [[1, 6]],
  'story': [[1, 2], [5, 6]],
  'opinions': [[5, 6]],
  'describing-change': [[1, 2]],
  'community-garden': [[2, 3]],
  'memories': [[4, 6]],
  'news-reports': [[1, 3], [5, 6]],
  'problems': [[1, 3], [4, 5]],
  'instructions': [[2, 3]],
  'delivery-problem': [[1, 2]],
  'maintenance': [[1, 2]],
  'formal-requests': [[1, 2]],
  'learning-strategies': [[4, 5]],
  'work': [[1, 4]],
  'messages': [[4, 6]],
  'decisions': [[2, 3], [3, 4]],
  'feedback': [[1, 2]],
  'meeting-summary': [[2, 3]],
  'evaluating-evidence': [[3, 4]],
  'negotiating-priorities': [[1, 2]],
  'takeaway': [[1, 2]],
  'inside-a-building': [[1, 2], [3, 4]],
  'paying-for-things': [[1, 2], [5, 6]],
  'apologising': [[1, 2], [2, 4]],
  'short-update': [[1, 2], [4, 5]],
};

export function lessonExchanges(unit) {
  return (exchanges[unit?.id] ?? [])
    .map(([cue, reply]) => ({ cue: unit.phrases[cue - 1], reply: unit.phrases[reply - 1] }))
    .filter(pair => pair.cue && pair.reply && pair.cue !== pair.reply);
}
