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

  async logout() {
    await this.request('logout', { method: 'POST' });
    this.bearer = null;
    this.user = null;
    try { this.storage?.removeItem(bearerKey); } catch { /* Nothing is persisted when storage is blocked. */ }
  }
}

export function miniAppData(location, webApp) {
  return webApp?.initData || new URLSearchParams(location.hash.replace(/^#/, '')).get('tgWebAppData') || '';
}
