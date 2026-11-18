import { miniAppRoute, miniAppRouteParam } from '../dist/mini-app-links.mjs';
import { codes } from '../dist/content.mjs';
import { chatBase, chatText as t } from './telegram-copy.mjs';

const languageNames = Object.freeze({
  uz: 'O‘zbekcha', en: 'Inglizcha', ru: 'Ruscha', ar: 'Arabcha', tr: 'Turkcha', de: 'Nemischa'
});

export function chatLanguage(code, base = 'uz') {
  if (typeof code !== 'string') return '';
  const locale = chatBase(base);
  if (locale === 'uz' || !codes.includes(code)) return languageNames[code] ?? code.toUpperCase();
  return new Intl.DisplayNames([locale], { type: 'language' }).of(code);
}

export function languageDirection(from, to, base) {
  return chatLanguage(from, base) + ' → ' + chatLanguage(to, base);
}

const navigationCopy = { lesson: 'continueLearning', listening: 'skillListening', speaking: 'skillSpeaking' };
export const chatLabel = (action, base) => t(base, navigationCopy[action] ?? action);

// Texts and callback data are intentionally short (Telegram callback_data <= 64 bytes).
export const navigationActions = Object.freeze({
  home: 'nav:home',
  practice: 'nav:practice',
  listening: 'nav:listening',
  speaking: 'nav:speaking',
  stories: 'nav:stories',
  reminders: 'nav:reminders',
  progress: 'nav:progress',
  review: 'nav:review',
  skills: 'nav:skills',
  build: 'nav:build',
  gap: 'nav:gap',
  dialogue: 'nav:dialogue',
  focus: 'nav:focus',
  recap: 'nav:recap'
});

const commandLabels = {
  start: 'home', practice: 'practice', listen: 'listening', speak: 'speaking', stories: 'stories',
  review: 'review', skills: 'skills', dialogue: 'dialogue', recap: 'recap', reminders: 'reminderCommand',
  progress: 'progress', help: 'help'
};

export function vocabularyCompanion(env) {
  return env?.TELEGRAM_FULL_CHAT !== '1';
}

function botCommands(env, base) {
  return Object.entries(commandLabels)
    .filter(([command]) => !vocabularyCompanion(env) || ['start', 'practice'].includes(command))
    .map(([command, action]) => ({ command, description: chatLabel(action, base) }));
}

export function botCommandMenus(env) {
  return [{ commands: botCommands(env, 'uz') },
    ...codes.map(base => ({ language_code: base, commands: botCommands(env, base) }))];
}

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
  reminders: '🔔',
  skills: '🧩',
  build: '✍️',
  gap: '🧩',
  dialogue: '💬',
  focus: '🎯',
  recap: '📅'
});

export function navigationButton(action, base, label = chatLabel(action, base)) {
  return { text: navigationIcons[action] + ' ' + label, callback_data: navigationActions[action] };
}

export const homeButton = base => navigationButton('home', base);

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

export function appKeyboard(env, route, base, text = t(base, 'openApp'), { primary = true } = {}) {
  const button = route ? miniAppButton(env, text, route) : appButton(miniAppUrl(env), text);
  return button ? { inline_keyboard: [[primary ? primaryButton(button) : button]] } : undefined;
}

export function dashboardKeyboard(env, hasAccount = true, base) {
  if (vocabularyCompanion(env)) {
    const rows = appKeyboard(env, undefined, base)?.inline_keyboard ?? [];
    if (hasAccount) rows.push([navigationButton('practice', base)]);
    return rows.length ? { inline_keyboard: rows } : undefined;
  }
  const open = hasAccount ? miniAppButton(env, '📖 ' + chatLabel('lesson', base), 'lesson') :
    appButton(miniAppUrl(env), t(base, 'getStarted'));
  const rows = open ? [[primaryButton(open)]] : [];
  if (hasAccount) {
    for (const group of [
      ['review'], ['practice'], ['listening', 'speaking'], ['skills'], ['stories'], ['progress', 'reminders']
    ]) {
      rows.push(group.map(action => navigationButton(action, base)));
    }
  }
  return rows.length ? { inline_keyboard: rows } : undefined;
}

export function continuationKeyboard(env, { review = false, base } = {}) {
  if (vocabularyCompanion(env)) {
    const rows = [[primaryButton(navigationButton('practice', base, t(base, 'again')))]];
    const app = appButton(miniAppUrl(env), t(base, 'openApp'));
    if (app) rows.push([app]);
    return { inline_keyboard: rows };
  }
  const next = review ? navigationButton('review', base, t(base, 'reviewAgain')) :
    navigationButton('practice', base, t(base, 'again'));
  const rows = [[primaryButton(next)]];
  const inApp = miniAppButton(env, t(base, 'reviewInApp'), 'review');
  if (review && inApp) rows.push([inApp]);
  if (!review) {
    rows.push([navigationButton('review', base)]);
    const app = appButton(miniAppUrl(env), t(base, 'app'));
    if (app) rows.push([app]);
  }
  rows.push([homeButton(base)]);
  return { inline_keyboard: rows };
}

export function progressKeyboard(env, base) {
  const app = miniAppButton(env, t(base, 'progressInApp'), 'progress');
  const review = miniAppButton(env, t(base, 'reviewInApp'), 'review');
  const rows = app ? [[primaryButton(app)]] : [];
  if (review) rows.push([review]);
  rows.push([navigationButton('recap', base)]);
  rows.push([navigationButton('practice', base), homeButton(base)]);
  return { inline_keyboard: rows };
}

export function miniAppMenuPayload(env) {
  const url = miniAppUrl(env);
  if (!url) throw new Error('Set an HTTPS PUBLIC_APP_ORIGIN to configure the bot menu');
  return { menu_button: { type: 'web_app', text: 'Aytim', web_app: { url } } };
}
