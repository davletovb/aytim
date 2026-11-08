import { validateState } from './progress-data.mjs';

const metadataKey = 'aytim.cloud.v1';
const serialize = state => JSON.stringify(validateState(state));

// The local save stays authoritative until a versioned write succeeds.
export class CloudSync {
  constructor({ storage, getState, applyState, canApply = () => true, onStatus = () => {}, hasLocal = false, fetcher = (...args) => globalThis.fetch(...args) }) {
    Object.assign(this, { storage, getState, applyState, canApply, onStatus, hasLocal, fetcher });
    try { this.metadata = JSON.parse(storage.getItem(metadataKey) ?? 'null'); } catch { /* Local-only storage is optional. */ }
    this.metadata ??= {};
    this.status = 'connecting';
    this.ready = false;
    this.dirty = false;
    this.conflict = null;
    this.busy = null;
    this.timer = null;
    this.stopped = false;
  }

  setStatus(status) {
    this.status = status;
    this.onStatus(status);
  }

  remember(snapshot) {
    this.metadata = { profileId: this.profileId, revision: this.revision, snapshot };
    try { this.storage.setItem(metadataKey, JSON.stringify(this.metadata)); } catch { /* Keep practicing in memory. */ }
  }

  schedule(delay = 800) {
    clearTimeout(this.timer);
    if (this.stopped) return;
    this.timer = setTimeout(() => this.flush(), delay);
    this.timer.unref?.();
  }

  queue() {
    this.hasLocal = true;
    this.dirty = true;
    if (!this.conflict) this.setStatus('pending');
    this.schedule();
  }

  async request(path, options = {}) {
    const response = await this.fetcher('/api/' + path, {
      ...options, credentials: 'same-origin', cache: 'no-store',
      headers: { 'X-Aytim-Client': '1', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      throw Object.assign(new Error('Cloud saving is unavailable'), { status: 404 });
    }
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.error), { status: response.status, data });
    return data;
  }

  fail(error) {
    if (error.status === 409 && error.data?.state) {
      this.conflict = { ...error.data, state: validateState(error.data.state) };
      if (serialize(this.getState()) === serialize(this.conflict.state)) {
        this.profileId = this.conflict.profileId;
        this.revision = this.conflict.revision;
        this.updatedAt = this.conflict.updatedAt;
        this.conflict = null;
        this.dirty = false;
        this.remember(serialize(this.getState()));
        this.setStatus('saved');
        return;
      }
      this.setStatus('conflict');
    } else if (error.status === 401) {
      this.ready = false;
      this.setStatus('cookies');
    } else if ([400, 413, 415].includes(error.status)) {
      this.setStatus('invalid');
    } else {
      this.setStatus(error.status === 404 ? 'unavailable' : 'offline');
      if (error.status !== 404) this.schedule(30000);
    }
  }

  run(work) {
    if (this.busy) return this.busy;
    this.busy = (async () => {
      try { await work(); } catch (error) { this.fail(error); }
    })().finally(() => { this.busy = null; });
    return this.busy;
  }

  adopt(data) {
    const state = validateState(data.state);
    this.profileId = data.profileId;
    this.revision = data.revision;
    this.updatedAt = data.updatedAt;
    this.conflict = null;
    this.dirty = false;
    this.hasLocal = true;
    this.applyState(state);
    this.remember(serialize(this.getState()));
    this.setStatus('saved');
  }

  connect() {
    if (this.conflict) return Promise.resolve();
    return this.run(async () => {
      this.setStatus('connecting');
      const data = await this.request('progress');
      this.profileId = data.profileId;
      this.revision = data.revision;
      this.updatedAt = data.updatedAt;
      const local = serialize(this.getState());
      const dirty = this.dirty || (this.hasLocal && local !== this.metadata.snapshot);
      this.ready = true;
      if (data.state === null) {
        this.dirty = true;
      } else {
        data.state = validateState(data.state);
        if (local === serialize(data.state)) {
          this.dirty = false;
          this.remember(local);
        } else if (!dirty && this.canApply()) {
          this.adopt(data);
        } else if (dirty && this.metadata.profileId === data.profileId && this.metadata.revision === data.revision) {
          this.dirty = true;
        } else {
          this.conflict = data;
          this.setStatus('conflict');
          return;
        }
      }
      this.setStatus(this.dirty ? 'pending' : 'saved');
      if (this.dirty) this.schedule(0);
    });
  }

  flush({ keepalive = false } = {}) {
    if (this.stopped || this.conflict) return Promise.resolve();
    if (this.busy) return this.busy;
    if (!this.ready) return this.connect();
    if (!this.dirty) return Promise.resolve();
    return this.run(async () => {
      this.setStatus('saving');
      const snapshot = serialize(this.getState());
      const payload = JSON.stringify({ profileId: this.profileId, revision: this.revision, state: JSON.parse(snapshot) });
      const data = await this.request('progress', { method: 'PUT', body: payload, keepalive: keepalive && payload.length < 60000 });
      this.revision = data.revision;
      this.updatedAt = data.updatedAt;
      this.remember(snapshot);
      this.dirty = serialize(this.getState()) !== snapshot;
      this.setStatus(this.dirty ? 'pending' : 'saved');
      if (this.dirty) this.schedule(0);
    });
  }

  useCloud() {
    if (this.conflict) this.adopt(this.conflict);
  }

  async useLocal() {
    if (!this.conflict) return;
    this.profileId = this.conflict.profileId;
    this.revision = this.conflict.revision;
    this.conflict = null;
    this.dirty = true;
    await this.flush();
  }

  async recoveryCode() {
    if (this.busy) await this.busy;
    await this.flush();
    if (!this.ready || this.dirty || this.conflict) throw new Error('Save progress before creating a recovery code');
    return (await this.request('recovery-code', { method: 'POST' })).code;
  }

  async restore(code) {
    if (this.busy) await this.busy;
    clearTimeout(this.timer);
    // Run through the same lock as writes so a former profile cannot race restoration.
    let restored = false;
    const previousStatus = this.status;
    await this.run(async () => {
      try {
        const data = await this.request('restore', { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
        this.ready = true;
        this.adopt(data);
        restored = true;
      } catch {
        this.setStatus(previousStatus);
        if (this.dirty && !this.conflict) this.schedule();
      }
    });
    return restored;
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timer);
  }
}
