import { createRemoteJWKSet, jwtVerify } from 'jose';
import { failure } from './http.mjs';

export const telegramIssuer = 'https://oauth.telegram.org';
const keys = createRemoteJWKSet(new URL(telegramIssuer + '/.well-known/jwks.json'), { timeoutDuration: 5000 });
const encoder = new TextEncoder();

export function telegramId(value) {
  const id = typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : value;
  if (typeof id !== 'string' || !/^[1-9]\d{0,15}$/.test(id) || !Number.isSafeInteger(Number(id))) {
    throw failure('Invalid Telegram identity', 401);
  }
  return id;
}

function profile(id, name, username) {
  username ??= undefined;
  if (typeof name !== 'string' || !name.trim() || name.length > 256 ||
      (username !== undefined && (typeof username !== 'string' || !/^[A-Za-z0-9_]{1,64}$/.test(username)))) {
    throw failure('Invalid Telegram profile', 401);
  }
  return { telegramId: telegramId(id), name: name.trim(), username: username ?? null };
}

export async function verifyMiniApp(initData, botToken) {
  if (typeof initData !== 'string' || !initData || initData.length > 16384) throw failure('Invalid Telegram launch', 401);
  const params = new URLSearchParams(initData);
  if ([...params.keys()].some(key => params.getAll(key).length !== 1)) throw failure('Invalid Telegram launch', 401);
  const signature = params.get('hash');
  if (!/^[a-f0-9]{64}$/.test(signature ?? '')) throw failure('Invalid Telegram launch', 401);
  params.delete('hash');
  const data = [...params.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, value]) => key + '=' + value).join('\n');
  const root = await crypto.subtle.importKey('raw', encoder.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const secret = await crypto.subtle.sign('HMAC', root, encoder.encode(botToken));
  const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const bytes = Uint8Array.from(signature.match(/../g), part => parseInt(part, 16));
  if (!await crypto.subtle.verify('HMAC', key, bytes, encoder.encode(data))) throw failure('Invalid Telegram launch', 401);
  const timestamp = params.get('auth_date');
  if (!/^\d{1,12}$/.test(timestamp ?? '')) throw failure('Invalid Telegram launch', 401);
  let user;
  try { user = JSON.parse(params.get('user')); } catch { throw failure('Invalid Telegram launch', 401); }
  if (!user || user.is_bot || typeof user.first_name !== 'string' ||
      (user.last_name !== undefined && typeof user.last_name !== 'string')) throw failure('Invalid Telegram user', 401);
  const result = profile(user.id, [user.first_name, user.last_name].filter(Boolean).join(' '), user.username);
  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age < -30) throw failure('Invalid Telegram launch', 401);
  return { ...result, fresh: age <= 300 };
}

export async function verifyDesktopToken(idToken, clientId, nonce) {
  const { payload } = await jwtVerify(idToken, keys, {
    issuer: telegramIssuer, audience: clientId, algorithms: ['RS256'],
    requiredClaims: ['sub', 'iat', 'exp', 'nonce', 'id'], maxTokenAge: '10m', clockTolerance: 30
  });
  if (payload.nonce !== nonce || typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) {
    throw failure('Invalid Telegram login', 401);
  }
  return { ...profile(payload.id, payload.name, payload.preferred_username), subject: payload.sub };
}

export async function pkceChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
