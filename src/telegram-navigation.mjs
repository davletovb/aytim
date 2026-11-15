import { miniAppRoute, miniAppRouteParam } from '../dist/mini-app-links.mjs';

// Texts and callback data are intentionally short (Telegram callback_data <= 64 bytes).
export const navigationActions = Object.freeze({
  home: 'nav:home',
  practice: 'nav:practice',
  listening: 'nav:listening',
  speaking: 'nav:speaking',
  stories: 'nav:stories',
  reminders: 'nav:reminders',
  progress: 'nav:progress',
  review: 'nav:review'
});

export const botCommands = [
  { command: 'start', description: 'Bosh menyu' },
  { command: 'practice', description: 'Tezkor mashq' },
  { command: 'listen', description: 'Tinglash' },
  { command: 'speak', description: 'Gapirish' },
  { command: 'stories', description: 'Qisqa hikoyalar' },
  { command: 'review', description: 'Lug‘at takrorlash' },
  { command: 'reminders', description: 'Lug‘at eslatmalari' },
  { command: 'progress', description: 'Natijalar' },
  { command: 'help', description: 'Yordam va bosh menyu' }
];

export function miniAppUrl(env) {
  try {
    const url = new URL(env?.PUBLIC_APP_ORIGIN);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' ||
        url.search || url.hash) return null;
    return url.origin + '/';
  } catch { return null; }
}

function appButton(url, text) {
  return url ? { text, web_app: { url } } : null;
}

export function miniAppButton(env, text, route) {
  const origin = miniAppUrl(env);
  if (!origin || !miniAppRoute(route)) return null;
  const url = new URL(origin);
  url.searchParams.set(miniAppRouteParam, route);
  return appButton(url.href, text);
}

export function appKeyboard(env, route, text = '📖 Aytim ilovasini ochish') {
  const button = route ? miniAppButton(env, text, route) : appButton(miniAppUrl(env), text);
  return button ? { inline_keyboard: [[button]] } : undefined;
}
export function dashboardKeyboard(env, hasAccount = true) {
  const url = miniAppUrl(env);
  const rows = [];
  if (hasAccount) {
    rows.push([{ text: '🎯 Tezkor mashq', callback_data: navigationActions.practice },
      { text: '🎧 Tinglash', callback_data: navigationActions.listening }]);
    rows.push([{ text: '📊 Natijalar', callback_data: navigationActions.progress },
      ...[miniAppButton(env, '📖 Darsni davom ettirish', 'lesson')].filter(Boolean)]);
    rows.push([{ text: '🧠 Lug‘at takrorlash', callback_data: navigationActions.review },
      { text: '🎙 Gapirish', callback_data: navigationActions.speaking }]);
    rows.push([{ text: '📖 Qisqa hikoyalar', callback_data: navigationActions.stories },
      { text: '🔔 Eslatmalar', callback_data: navigationActions.reminders }]);
  } else rows.push([appButton(url, '🌱 Aytimda boshlash')].filter(Boolean));
  return rows.some(row => row.length) ? { inline_keyboard: rows.filter(row => row.length) } : undefined;
}
export function continuationKeyboard(env, { review = false } = {}) {
  const url = miniAppUrl(env);
  const rows = [[{ text: '🔄 Yana mashq', callback_data: navigationActions.practice },
    { text: '🏠 Bosh menyu', callback_data: navigationActions.home }]];
  rows.push([{ text: '🧠 Baholi takrorlash', callback_data: navigationActions.review }]);
  if (url) rows.push([review ? miniAppButton(env, '🧠 Ilovada takrorlash', 'review') : appButton(url, '📖 Aytim ilovasi')]);
  return { inline_keyboard: rows };
}
export function progressKeyboard(env) {
  const rows = [[{ text: '🎯 Mashq qilish', callback_data: navigationActions.practice },
    { text: '🏠 Bosh menyu', callback_data: navigationActions.home }]];
  const app = miniAppButton(env, '📊 To‘liq natijalar (ilovada)', 'progress');
  if (app) rows.push([app]);
  const review = miniAppButton(env, '🧠 Ilovada takrorlash', 'review');
  if (review) rows.push([review]);
  return { inline_keyboard: rows };
}
export function miniAppMenuPayload(env) {
  const url = miniAppUrl(env);
  if (!url) throw new Error('Set an HTTPS PUBLIC_APP_ORIGIN to configure the bot menu');
  return { menu_button: { type: 'web_app', text: 'Aytim', web_app: { url } } };
}
