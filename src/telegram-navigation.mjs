import { miniAppRoute, miniAppRouteParam } from '../dist/mini-app-links.mjs';

const languageNames = Object.freeze({
  uz: 'O‘zbekcha', en: 'Inglizcha', ru: 'Ruscha', ar: 'Arabcha', tr: 'Turkcha', de: 'Nemischa'
});

export function chatLanguage(code) {
  return typeof code === 'string' ? languageNames[code] ?? code.toUpperCase() : '';
}

export function languageDirection(from, to) {
  return chatLanguage(from) + ' → ' + chatLanguage(to);
}

export const chatLabels = Object.freeze({
  home: 'Bosh menyu',
  lesson: 'Darsni davom ettirish',
  practice: 'Tezkor mashq',
  review: 'Lug‘at takrorlash',
  listening: 'Tinglash',
  speaking: 'Gapirish',
  stories: 'Qisqa hikoyalar',
  progress: 'Natijalar',
  reminders: 'Eslatmalar'
});

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

const navigationIcons = Object.freeze({
  home: '🏠',
  practice: '🎯',
  review: '🧠',
  listening: '🎧',
  speaking: '🎙',
  stories: '📖',
  progress: '📊',
  reminders: '🔔'
});

export function navigationButton(action, label = chatLabels[action]) {
  return { text: navigationIcons[action] + ' ' + label, callback_data: navigationActions[action] };
}

export const homeButton = navigationButton('home');

export function primaryButton(button) {
  return { ...button, style: 'primary' };
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

export function appKeyboard(env, route, text = '📖 Aytim ilovasini ochish', { primary = true } = {}) {
  const button = route ? miniAppButton(env, text, route) : appButton(miniAppUrl(env), text);
  return button ? { inline_keyboard: [[primary ? primaryButton(button) : button]] } : undefined;
}

export function dashboardKeyboard(env, hasAccount = true) {
  const open = hasAccount ? miniAppButton(env, '📖 ' + chatLabels.lesson, 'lesson') :
    appButton(miniAppUrl(env), '🌱 Aytimda boshlash');
  const rows = open ? [[primaryButton(open)]] : [];
  if (hasAccount) {
    for (const group of [
      ['review'], ['practice'], ['listening', 'speaking'], ['stories'], ['progress', 'reminders']
    ]) {
      rows.push(group.map(action => navigationButton(action)));
    }
  }
  return rows.length ? { inline_keyboard: rows } : undefined;
}

export function continuationKeyboard(env, { review = false } = {}) {
  const next = review ? navigationButton('review', 'Yana takrorlash') :
    navigationButton('practice', 'Yana mashq');
  const rows = [[primaryButton(next)]];
  const inApp = miniAppButton(env, '🧠 Ilovada takrorlash', 'review');
  if (review && inApp) rows.push([inApp]);
  if (!review) {
    rows.push([navigationButton('review')]);
    const app = appButton(miniAppUrl(env), '📖 Aytim ilovasi');
    if (app) rows.push([app]);
  }
  rows.push([homeButton]);
  return { inline_keyboard: rows };
}

export function progressKeyboard(env) {
  const app = miniAppButton(env, '📊 Ilovada natijalarni ko‘rish', 'progress');
  const review = miniAppButton(env, '🧠 Ilovada takrorlash', 'review');
  const rows = app ? [[primaryButton(app)]] : [];
  if (review) rows.push([review]);
  rows.push([navigationButton('practice'), homeButton]);
  return { inline_keyboard: rows };
}

export function miniAppMenuPayload(env) {
  const url = miniAppUrl(env);
  if (!url) throw new Error('Set an HTTPS PUBLIC_APP_ORIGIN to configure the bot menu');
  return { menu_button: { type: 'web_app', text: 'Aytim', web_app: { url } } };
}
