import { defaultPair } from './engine.mjs';
import { validateState } from './progress-data.mjs';

export const guestKeys = { progress: 'lingua-loop.v1', metadata: 'aytim.cloud.v1' };
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
  return user ? { progress: 'aytim.progress.telegram.' + user.telegramId, metadata: 'aytim.cloud.telegram.' + user.telegramId } : guestKeys;
}

export function hasProgress(state) {
  return Object.values(state.courses).some(course => Object.keys(course.cards).length ||
    Object.values(course.best).some(Boolean) || Object.values(course.practiceBest ?? {}).some(Boolean) ||
    Object.values(course.storyBest ?? {}).some(Boolean) || Object.values(course.activityDays ?? {}).some(day => day.sessions) ||
    Object.keys(course.journey?.evidence ?? {}).length || course.placement);
}

export function loadAccountProgress(storage, account) {
  const keys = accountKeys(account.user);
  let state;
  let migrated = false;
  let guestState = null;
  try {
    const raw = storage.getItem(keys.progress);
    if (raw) state = validateState(JSON.parse(raw));
    if (account.user && account.importFromProfileId) {
      const metadata = JSON.parse(storage.getItem(guestKeys.metadata) ?? 'null');
      const guest = JSON.parse(storage.getItem(guestKeys.progress) ?? 'null');
      if (metadata?.profileId === account.importFromProfileId && guest) {
        const candidate = validateState(guest);
        if (hasProgress(candidate)) {
          if (state && JSON.stringify(state) !== JSON.stringify(candidate)) guestState = candidate;
          else {
            state = candidate;
            storage.setItem(keys.progress, JSON.stringify(state));
            if (account.profileId === metadata.profileId) storage.setItem(keys.metadata, JSON.stringify(metadata));
            migrated = true;
          }
        }
      }
    }
    if (migrated) {
      // A claimed guest save must not reappear after signing out of its account.
      const metadata = JSON.parse(storage.getItem(guestKeys.metadata) ?? 'null');
      if (metadata?.profileId === account.importFromProfileId) {
        storage.removeItem(guestKeys.progress);
        storage.removeItem(guestKeys.metadata);
      }
    }
  } catch { /* Damaged or unavailable browser storage must not prevent sign-in. */ }
  return { keys, state: state ?? { ...defaultPair, courses: {}, transliterate: true }, hasLocal: Boolean(state), migrated, guestState };
}
