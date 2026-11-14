export const progressEpoch = 'topic-words-2026-11-14-v1';
export const progressEpochHeader = 'X-Aytim-Progress-Epoch';
const marker = 'aytim.learning-epoch';

// Keep account identity and bearer; discard only old learning caches.
export function resetLearningCaches(storage, tabStorage) {
  let cleared = false;
  try {
    if (storage.getItem(marker) !== progressEpoch) {
      const keys = new Set(['lingua-loop.v1', 'aytim.cloud.v1']);
      if (typeof storage.key === 'function' && Number.isSafeInteger(storage.length)) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && ['aytim.progress.telegram.', 'aytim.cloud.telegram.', 'aytim.import.telegram.']
            .some(prefix => key.startsWith(prefix))) keys.add(key);
        }
      }
      let user;
      try { user = JSON.parse(storage.getItem('aytim.account.last') ?? 'null'); } catch {}
      if (/^[1-9]\d{0,15}$/.test(user?.telegramId ?? '')) {
        for (const prefix of ['aytim.progress.telegram.', 'aytim.cloud.telegram.', 'aytim.import.telegram.']) keys.add(prefix + user.telegramId);
      }
      for (const key of keys) storage.removeItem(key);
      storage.setItem(marker, progressEpoch);
      cleared = true;
    }
  } catch { /* Versioned keys still isolate old state when storage is blocked. */ }
  try {
    // sessionStorage is per-tab: discard stale interrupted lessons on every tab.
    if (tabStorage && tabStorage.getItem(marker) !== progressEpoch) {
      tabStorage.removeItem('aytim.lesson.v1');
      tabStorage.setItem(marker, progressEpoch);
    }
  } catch {}
  return cleared;
}
