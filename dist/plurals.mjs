// Counted labels change shape with the number in most of Aytim's languages, so
// a copy cell may hold one form per Intl plural category instead of a single
// string. Uzbek and Turkish keep a plain string: neither inflects after a
// numeral. Arabic uses all six categories, Russian four, English and German two.
const rules = new Map();

export function pluralCategory(language, count) {
  if (!rules.has(language)) rules.set(language, new Intl.PluralRules(language));
  return rules.get(language).select(count);
}

export function pluralText(language, forms, count) {
  if (typeof forms === 'string') return forms;
  if (!forms) return '';
  return forms[pluralCategory(language, count)] ?? forms.other ?? '';
}
