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
      // Carry forward language and speaking-form preferences, not courses,
      // scores, XP, vocabulary review, placement or activity history.
      const fresh = new Map();
      const supported = ['uz', 'en', 'ru', 'ar', 'tr', 'de'];
      for (const key of keys) {
        const destination = key === 'lingua-loop.v1' ? 'aytim.progress.v2.guest'
          : key.startsWith('aytim.progress.telegram.')
            ? 'aytim.progress.v2.telegram.' + key.slice('aytim.progress.telegram.'.length) : null;
        if (!destination) continue;
        try {
          const old = JSON.parse(storage.getItem(key) ?? 'null');
          if (!supported.includes(old?.base) || !supported.includes(old?.target) || old.base === old.target) continue;
          fresh.set(destination, JSON.stringify({
            base: old.base, target: old.target,
            transliterate: typeof old.transliterate === 'boolean' ? old.transliterate : true,
            ...(old.speaker === 'm' || old.speaker === 'f' ? { speaker: old.speaker } : {}),
            courses: {}
          }));
        } catch { /* A corrupted old cache cannot prevent a clean start. */ }
      }
      for (const key of keys) storage.removeItem(key);
      for (const [key, value] of fresh) storage.setItem(key, value);
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
