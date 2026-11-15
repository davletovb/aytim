// Run deliberately against your chosen test/production bot after setting the
// environment variables. Never commit the token or pass it in CLI arguments.
import { miniAppMenuPayload } from '../src/telegram-navigation.mjs';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token))
  throw new Error('TELEGRAM_BOT_TOKEN is required');
const payload = miniAppMenuPayload({ PUBLIC_APP_ORIGIN: process.env.PUBLIC_APP_ORIGIN });
async function call(method, body) {
  const response = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10000)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) throw new Error(method + ' failed: ' + (result?.description || response.status));
}
await call('setChatMenuButton', payload);
await call('setMyCommands', { commands: [
  { command: 'start', description: 'Bosh menyu' },
  { command: 'practice', description: 'Tezkor mashq' },
  { command: 'review', description: 'Lug‘at takrorlash' },
  { command: 'progress', description: 'Natijalar' },
  { command: 'help', description: 'Yordam va bosh menyu' }
] });
console.log('Telegram default Mini App menu and optional shortcut commands configured.');
