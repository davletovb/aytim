import { defaultPair } from './engine.mjs';
import { validateState } from './progress-data.mjs';

export const guestKeys = { progress: 'aytim.progress.v2.guest', metadata: 'aytim.cloud.v2.guest' };
const lastAccountKey = 'aytim.account.last';

// The last verified account lets a failed sign-in check keep using that account's cache. Its sync still
// has to prove the session to the Worker, so a stale record cannot reach anyone else's progress.
export function rememberAccount(storage, user) {
  try {
    if (user) storage.setItem(lastAccountKey, JSON.stringify({ telegramId: user.telegramId, name: user.name, username: user.username ?? null }));
    else storage.removeItem(lastAccountKey);
  } catch { /* Without storage, a failed sign-in check falls back to guest mode. */ }
}

export function rememberedAccount(storage, telegramId) {
  try {
    const user = JSON.parse(storage.getItem(lastAccountKey) ?? 'null');
    if (typeof user?.telegramId !== 'string' || !/^[1-9]\d{0,15}$/.test(user.telegramId) || typeof user.name !== 'string') return null;
    return telegramId === undefined || telegramId === user.telegramId ? user : null;
  } catch { return null; }
}

export function accountKeys(user) {
  if (!user) return guestKeys;
  const id = user.telegramId;
  return { progress: 'aytim.progress.v2.telegram.' + id, metadata: 'aytim.cloud.v2.telegram.' + id, importFrom: 'aytim.import.v2.telegram.' + id };
}

export function hasProgress(state) {
  return Object.values(state.courses).some(course => Object.keys(course.cards).length ||
    Object.values(course.best).some(Boolean) || Object.values(course.practiceBest ?? {}).some(Boolean) ||
    Object.values(course.storyBest ?? {}).some(Boolean) || Object.values(course.activityDays ?? {}).some(day => day.sessions) ||
    Object.keys(course.journey?.evidence ?? {}).length || course.placement);
}

const read = (storage, key) => JSON.parse(storage.getItem(key) ?? 'null');

export function loadAccountProgress(storage, account, pair = defaultPair) {
  const keys = accountKeys(account.user);
  let state;
  let raw;
  let migrated = false;
  let guestState = null;
  let storageAvailable = true;
  try { raw = storage.getItem(keys.progress); } catch { storageAvailable = false; }
  try { if (raw) state = validateState(JSON.parse(raw)); } catch { /* A damaged save starts fresh; the cloud copy can still restore it. */ }
  if (account.user && storageAvailable) {
    try {
      // The Worker names the guest profile whose session started this sign-in. Remembering it per account
      // keeps an unanswered guest-progress choice across later session rotations.
      const importFrom = account.importFromProfileId ?? storage.getItem(keys.importFrom);
      const metadata = read(storage, guestKeys.metadata);
      const guest = read(storage, guestKeys.progress);
      const candidate = importFrom && metadata?.profileId === importFrom && guest ? validateState(guest) : null;
      if (candidate && hasProgress(candidate)) {
        if (state && JSON.stringify(state) !== JSON.stringify(candidate)) {
          guestState = candidate;
          storage.setItem(keys.importFrom, importFrom);
        } else {
          state = candidate;
          storage.setItem(keys.progress, JSON.stringify(state));
          if (account.profileId === importFrom) storage.setItem(keys.metadata, JSON.stringify(metadata));
          // A claimed guest save must not reappear after signing out of its account.
          storage.removeItem(guestKeys.progress);
          storage.removeItem(guestKeys.metadata);
          storage.removeItem(keys.importFrom);
          migrated = true;
        }
      }
    } catch { /* Damaged or unavailable browser storage must not prevent sign-in. */ }
  }
  return { keys, state: state ?? { ...pair, courses: {}, transliterate: true }, hasLocal: Boolean(state), migrated, guestState,
    storageAvailable };
}
