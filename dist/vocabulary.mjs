import { reviewQueue, reviewStatus, searchText } from './engine.mjs';
import { accessibleLevel } from './journey.mjs';

// The review queue always includes words and phrases, independent of browsing filters.
export function vocabularyReviewSummary(course, now = Date.now()) {
  const level = accessibleLevel(course);
  const ready = reviewQueue(course, false, now).filter(entry => entry.level <= level).length;
  const saved = reviewQueue(course, true, now).filter(entry => entry.level <= level).length;
  return { ready, saved, state: ready ? 'due' : saved ? 'caught-up' : 'empty' };
}

export function vocabularyEntries(groups, course, { query = '', topic = '', filter = '', base, target }, now = Date.now()) {
  const search = searchText(query);
  const hasArabic = [base, target].includes('ar');
  return groups.filter(group => group.level <= accessibleLevel(course) && (!topic || topic === group.id)).flatMap(group => group.entries.flatMap(entry => {
    const card = course.cards[entry.id];
    const due = Boolean(card && card.due <= now);
    const status = reviewStatus(course, entry.id);
    if (filter === 'due' ? !due : filter === 'saved' ? !card : filter && status !== filter) return [];
    if (search && ![entry.text[base], entry.text[target], hasArabic ? entry.romanization : '']
      .some(value => searchText(value ?? '').includes(search))) return [];
    return [{ entry, group, status, due }];
  }));
}
