export function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers
  } });
}

export function failure(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

export function token() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function cookieName(request, name = 'session') {
  return (new URL(request.url).protocol === 'https:' ? '__Host-' : '') + 'aytim_' + name;
}

export function readCookie(request, name = 'session') {
  const prefix = cookieName(request, name) + '=';
  return (request.headers.get('Cookie') ?? '').split(';').map(part => part.trim())
    .find(part => part.startsWith(prefix))?.slice(prefix.length);
}

export function cookie(request, value, { name = 'session', seconds = 30 * 24 * 60 * 60 } = {}) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${cookieName(request, name)}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${seconds}${secure}`;
}

export function requireSameOrigin(request) {
  if (request.headers.get('X-Aytim-Client') !== '1' || request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
      (request.headers.has('Origin') && request.headers.get('Origin') !== new URL(request.url).origin)) {
    throw failure('Same-origin requests only', 403);
  }
}

export async function body(request, maxBytes = 1024 * 1024) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw failure('Expected JSON', 415);
  }
  if (Number(request.headers.get('Content-Length')) > maxBytes) throw failure('Request is too large', 413);
  const reader = request.body?.getReader();
  if (!reader) throw failure('Missing JSON');
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) { await reader.cancel(); throw failure('Request is too large', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw failure('Invalid JSON'); }
}
