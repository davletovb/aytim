import { miniAppUrl, miniAppMenuPayload, botCommands } from './telegram-navigation.mjs';

const expectedUpdates = ['message', 'callback_query', 'widget_query'];

// The HMAC is private and stable per bot, so a separate webhook secret need not
// be manually installed. An explicitly configured secret always wins.
export async function botWebhookSecret(env) {
  if (env.TELEGRAM_WEBHOOK_SECRET) return env.TELEGRAM_WEBHOOK_SECRET;
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  const key = await crypto.subtle.importKey('raw',
    new TextEncoder().encode(env.TELEGRAM_BOT_TOKEN),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key,
    new TextEncoder().encode('aytim:telegram:webhook:secret:v1'));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function call(env, method, payload = {}) {
  const response = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/' + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000)
  });
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.ok) throw new Error('Telegram ' + method + ' failed: ' + (json?.description || response.status));
  return json.result;
}

// Worker can register itself when the signed-in app is opened, without asking
// the user to run commands or expose BotFather credentials in the browser.
// Never hijack a webhook already configured for a different service/deployment.
export async function connectTelegramBot(env) {
  if (!env.TELEGRAM_BOT_TOKEN) return 'missing-token';
  const origin = miniAppUrl(env);
  if (!origin) return 'invalid-app-origin';
  const url = origin + 'api/telegram/webhook';
  const current = await call(env, 'getWebhookInfo');
  if (current.url && current.url !== url) {
    console.warn('Aytim bot activation skipped: bot already has a webhook at a different URL');
    return 'different-webhook';
  }

  await call(env, 'setWebhook', {
    url,
    secret_token: await botWebhookSecret(env),
    allowed_updates: expectedUpdates
  });
  // The webhook is usable even if menu configuration fails. Keep actions
  // idempotent; a later authenticated app visit can retry incomplete setup.
  await call(env, 'setChatMenuButton', miniAppMenuPayload(env));
  await call(env, 'setMyCommands', { commands: botCommands(env) });
  return 'connected';
}

let connected = false;
let pending = null;
let retryAfter = 0;

export function activateTelegramBot(env, ctx, now = Date.now()) {
  if (env.TELEGRAM_AUTO_CONNECT !== '1' || !env.TELEGRAM_BOT_TOKEN || connected || !ctx?.waitUntil || now < retryAfter) return;
  if (!pending) {
    pending = connectTelegramBot(env).then(result => {
      if (result === 'connected' || result === 'different-webhook') connected = true;
      return result;
    }).catch(error => {
      console.warn('Aytim bot activation failed: ' + error.message);
    }).finally(() => {
      pending = null;
      retryAfter = Date.now() + 60_000;
    });
  }
  ctx.waitUntil(pending);
}
