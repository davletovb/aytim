// Texts and callback data are intentionally short (Telegram callback_data <= 64 bytes).
// The actual level-tested Lug'at review and Darslar still open the full Mini App.
export const navigationActions = Object.freeze({
  home: 'nav:home',
  practice: 'nav:practice',
  progress: 'nav:progress',
  review: 'nav:review'
});

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
export function appKeyboard(env) {
  const button = appButton(miniAppUrl(env), '📖 Aytim ilovasini ochish');
  return button ? { inline_keyboard: [[button]] } : undefined;
}
export function dashboardKeyboard(env, hasAccount = true) {
  const url = miniAppUrl(env);
  const rows = [];
  if (hasAccount) {
    rows.push([{ text: '🎯 Tezkor mashq', callback_data: navigationActions.practice },
      { text: '📊 Natijalar', callback_data: navigationActions.progress }]);
    // Full four-check review is intentionally not yet available in bot chat.
    rows.push([appButton(url, '🧠 Lug‘at (ilovada)'), appButton(url, '📖 Darslar (ilovada)')]
      .filter(Boolean));
  } else rows.push([appButton(url, '🌱 Aytimda boshlash')].filter(Boolean));
  return rows.some(row => row.length) ? { inline_keyboard: rows.filter(row => row.length) } : undefined;
}
export function continuationKeyboard(env) {
  const url = miniAppUrl(env);
  const rows = [[{ text: '🔄 Yana mashq', callback_data: navigationActions.practice },
    { text: '🏠 Bosh menyu', callback_data: navigationActions.home }]];
  if (url) rows.push([appButton(url, '📖 Aytim ilovasi')]);
  return { inline_keyboard: rows };
}
export function progressKeyboard(env) {
  const rows = [[{ text: '🎯 Mashq qilish', callback_data: navigationActions.practice },
    { text: '🏠 Bosh menyu', callback_data: navigationActions.home }]];
  const app = appButton(miniAppUrl(env), '📊 To‘liq natijalar (ilovada)');
  if (app) rows.push([app]);
  return { inline_keyboard: rows };
}
export function miniAppMenuPayload(env) {
  const url = miniAppUrl(env);
  if (!url) throw new Error('Set an HTTPS PUBLIC_APP_ORIGIN to configure the bot menu');
  return { menu_button: { type: 'web_app', text: 'Aytim', web_app: { url } } };
}
