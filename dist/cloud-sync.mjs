import { mergeProgress } from './progress-merge.mjs';
import { validateState } from './progress-data.mjs';

const serialize = state => JSON.stringify(validateState(state));

// The local save stays authoritative until a versioned write succeeds. When another
// device saved first, its copy is merged with this one (see progress-merge.mjs), so
// every device of an account ends up with the same progress and nothing is lost.
export class CloudSync {
  constructor({ storage, getState, applyState, canApply = () => true, onStatus = () => {}, hasLocal = false,
    metadataKey = 'aytim.cloud.v1', accountId = null, fetcher = (...args) => globalThis.fetch(...args) }) {
    Object.assign(this, { storage, getState, applyState, canApply, onStatus, hasLocal, fetcher, metadataKey, accountId });
    try { this.metadata = JSON.parse(storage.getItem(metadataKey) ?? 'null'); } catch { /* Local-only storage is optional. */ }
    this.metadata ??= {};
    this.status = 'connecting';
    this.ready = false;
    this.dirty = false;
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
    try { this.storage.setItem(this.metadataKey, JSON.stringify(this.metadata)); } catch { /* Keep practicing in memory. */ }
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
    this.setStatus('pending');
    this.schedule();
  }

  async request(path, options = {}) {
    const response = await this.fetcher('/api/' + path, {
      ...options, credentials: 'same-origin', cache: 'no-store',
      headers: { 'X-Aytim-Client': '1', ...(this.accountId ? { 'X-Aytim-Account': this.accountId } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
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
      // Another device saved first: take its progress in, then save the combined copy.
      try { this.settle(this.reconcile(error.data)); } catch { this.setStatus('invalid'); }
    } else if (error.status === 401) {
      this.ready = false;
      this.setStatus(this.accountId || error.data?.reason === 'account' ? 'signin' : 'cookies');
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

  // Brings this device up to date with the cloud copy. Changes this device has not
  // saved yet are merged with it rather than overwritten. An open exercise holds the
  // current progress, so while one runs nothing is applied: returns false to wait.
  reconcile(data) {
    const local = serialize(this.getState());
    const cloud = data.state === null ? null : serialize(validateState(data.state));
    const changedHere = this.dirty || (this.hasLocal && local !== this.metadata.snapshot);
    const sameBase = this.metadata.profileId === data.profileId && this.metadata.revision === data.revision;
    const adopting = cloud !== null && cloud !== local && !(changedHere && sameBase);
    if (adopting && !this.canApply()) return false;
    const base = this.metadata.profileId === data.profileId && this.metadata.snapshot ? JSON.parse(this.metadata.snapshot) : null;
    this.profileId = data.profileId;
    this.revision = data.revision;
    this.updatedAt = data.updatedAt;
    if (cloud !== null && (adopting || cloud === local)) this.remember(cloud);
    if (adopting) {
      this.hasLocal = true;
      this.applyState(changedHere ? mergeProgress(base, JSON.parse(local), JSON.parse(cloud)) : JSON.parse(cloud));
    }
    this.ready = true;
    this.dirty = cloud === null || serialize(this.getState()) !== cloud;
    return true;
  }

  settle(done) {
    if (!done) {
      // Retried once the exercise ends (its save queues a flush) or after a short wait.
      this.ready = false;
      this.setStatus('pending');
      this.schedule(30000);
      return;
    }
    this.setStatus(this.dirty ? 'pending' : 'saved');
    if (this.dirty) this.schedule(0);
  }

  connect({ quiet = false } = {}) {
    return this.run(async () => {
      if (!quiet) this.setStatus('connecting');
      this.settle(this.reconcile(await this.request('progress')));
    });
  }

  // Picks up what other devices saved since this one last looked, e.g. when the
  // app comes back to the foreground.
  refresh() {
    if (this.stopped || this.status === 'unavailable') return Promise.resolve();
    if (this.busy) return this.busy;
    return this.connect({ quiet: this.ready });
  }

  flush({ keepalive = false } = {}) {
    if (this.stopped) return Promise.resolve();
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

  stop() {
    this.stopped = true;
    clearTimeout(this.timer);
  }
}
