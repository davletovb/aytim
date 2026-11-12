const bearerKey = 'aytim.telegram.session';

export class TelegramAuth {
  constructor({ fetcher = (...args) => globalThis.fetch(...args), storage, initData = '' } = {}) {
    this.fetcher = fetcher;
    this.storage = storage;
    this.initData = initData;
    this.isMiniApp = Boolean(initData);
    this.user = null;
    this.config = { miniAppEnabled: false, webEnabled: false };
    if (this.isMiniApp) {
      try { this.bearer = storage?.getItem(bearerKey); } catch { /* A memory session still works. */ }
    }
  }

  fetch(input, options = {}) {
    const headers = new Headers(options.headers);
    if (this.isMiniApp && /^[a-f0-9]{64}$/.test(this.bearer ?? '')) headers.set('Authorization', 'Bearer ' + this.bearer);
    return this.fetcher(input, { ...options, headers });
  }

  async request(path, options = {}) {
    const response = await this.fetch('/api/auth/' + path, {
      ...options, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000),
      headers: { 'X-Aytim-Client': '1', ...(options.body ? { 'Content-Type': 'application/json' } : {}) }
    });
    if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Sign-in is unavailable');
    const data = await response.json();
    if (!response.ok) throw new Error('Sign-in was not completed');
    return data;
  }

  async load() {
    const data = this.isMiniApp
      ? await this.request('miniapp', { method: 'POST', body: JSON.stringify({ initData: this.initData }) })
      : await this.request('session');
    if (data.sessionToken) {
      this.bearer = data.sessionToken;
      try { this.storage?.setItem(bearerKey, this.bearer); } catch { /* Remain signed in for this page. */ }
    }
    this.user = data.user;
    this.config = { miniAppEnabled: data.miniAppEnabled, webEnabled: data.webEnabled };
    return data;
  }

  // Deletes the account on the server. The caller clears this device afterwards.
  async remove() {
    await this.request('delete', { method: 'POST' });
    this.bearer = null;
    this.user = null;
    try { this.storage?.removeItem(bearerKey); } catch { /* Nothing is persisted when storage is blocked. */ }
  }

  async logout() {
    await this.request('logout', { method: 'POST' });
    this.bearer = null;
    this.user = null;
    try { this.storage?.removeItem(bearerKey); } catch { /* Nothing is persisted when storage is blocked. */ }
  }
}

// Telegram clients expose a native bridge or embed the Mini App in a frame. A top-level browser tab
// opened from a crafted #tgWebAppData link has neither, so its launch data would sign the visitor into
// the link creator's account and hand that account this browser's guest progress.
export function insideTelegram(runtime = globalThis) {
  try {
    return runtime.TelegramWebviewProxy !== undefined ||
      (typeof runtime.external === 'object' && runtime.external !== null && 'notify' in runtime.external) ||
      (runtime.parent != null && runtime.parent !== runtime);
  } catch { return false; }
}

export function miniAppData(location, webApp, runtime = globalThis) {
  if (!insideTelegram(runtime)) return '';
  return webApp?.initData || new URLSearchParams(location.hash.replace(/^#/, '')).get('tgWebAppData') || '';
}

// Unverified, like launchUserId: this only chooses the language the interface opens in.
export function launchLanguage(initData) {
  try {
    const code = JSON.parse(new URLSearchParams(initData).get('user'))?.language_code;
    return typeof code === 'string' ? code : '';
  } catch { return ''; }
}

// Unverified: only chooses which local cache to show while the Worker cannot confirm the launch.
export function launchUserId(initData) {
  try {
    const id = JSON.parse(new URLSearchParams(initData).get('user'))?.id;
    return Number.isSafeInteger(id) && id > 0 ? String(id) : null;
  } catch { return null; }
}
