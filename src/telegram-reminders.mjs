import { buildChatRound } from './telegram-review.mjs';
import { homeButton, languageDirection, miniAppButton, navigationActions, primaryButton } from './telegram-navigation.mjs';
import { messageText } from './telegram-rich.mjs';

const hourMs = 3_600_000;
const dayMs = 24 * hourMs;
// Leave room for other subrequests on Workers Free and cap simultaneous sends.
const deliveryBatchSize = 6;
const deliveryBatches = 5;
const lastDeliveryHour = 21;
const hours = [9, 13, 19, 20];
const defaultHour = 19;
const timeZones = [
  ['Toshkent', 'Asia/Tashkent'], ['Istanbul', 'Europe/Istanbul'],
  ['Berlin', 'Europe/Berlin'], ['UTC', 'UTC']
];
const clockLabel = hour => String(hour).padStart(2, '0') + ':00';
const button = (text, action) => ({ text, callback_data: 'rem:' + action });
const pauseLabel = '24 soatga jim qilish';
const stopLabel = 'O‘chirish';
const settingsLead = 'Vaqt mintaqasi, takrorlanish muddati va soatni tanlang.';

function zoneClock(timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric',
    minute: 'numeric', second: 'numeric', hourCycle: 'h23'
  });
}

function wallTime(formatter, time) {
  const parts = Object.fromEntries(formatter.formatToParts(time).map(({ type, value }) => [type, value]));
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
}

export function nextReminderAt({ time_zone, frequency, hour, muted_until, last_attempt_at }, now) {
  if (!time_zone || !frequency) return null;
  const formatter = zoneClock(time_zone);
  const lastDay = last_attempt_at == null ? null : Math.floor(wallTime(formatter, last_attempt_at) / dayMs) * dayMs;
  const after = Math.max(now, muted_until ?? 0);
  const firstDay = Math.floor(wallTime(formatter, after) / dayMs) * dayMs;
  for (let day = firstDay; day <= firstDay + 7 * dayMs; day += dayMs) {
    if (day === lastDay || (frequency === 'weekly' && new Date(day).getUTCDay() !== 1)) continue;
    const local = day + hour * hourMs;
    let utc = local - (wallTime(formatter, local) - local);
    utc += local - wallTime(formatter, utc);
    if (utc > after && wallTime(formatter, utc) === local) return utc;
  }
  return null;
}

function readSettings(db, id) {
  return db.prepare('SELECT * FROM telegram_review_reminders WHERE telegram_id=?').bind(id).first();
}

function renderSettings(settings, now) {
  const { time_zone, frequency, hour = defaultHour, muted_until } = settings ?? {};
  const paused = frequency && muted_until > now;
  const status = !frequency ? 'O‘chiq' : paused ? '24 soatga jim qilingan' :
    frequency === 'daily' ? 'Har kuni' : 'Har dushanba';
  return {
    ...messageText('Lug‘at eslatmalari', [
      status + ' · ' + clockLabel(hour) + ' · ' + (time_zone ?? 'Vaqt mintaqangizni tanlang'),
      time_zone ? 'Takrorlashga tayyor so‘zlar bo‘lsa, eslatma keladi.' : settingsLead
    ]),
    reply_markup: { inline_keyboard: [
      [button('Har kuni', 'daily'), button('Har dushanba', 'weekly')],
      hours.map(time => button(clockLabel(time), 'hour:' + time)),
      [button('Vaqt mintaqasi', 'zones')],
      ...(frequency ? [[button(paused ? 'Davom ettirish' : pauseLabel, paused ? 'resume' : 'mute'),
        button(stopLabel, 'off')]] : []),
      [homeButton]
    ] }
  };
}

function renderZones() {
  return {
    ...messageText('Vaqt mintaqangizni tanlang', [
      'Boshqa mintaqa uchun, masalan, /remindzone America/New_York buyrug‘ini yuboring.'
    ]),
    reply_markup: { inline_keyboard: [
      timeZones.map(([city], index) => button(city, 'zone:' + index)),
      [button('Ortga', 'settings'), homeButton]
    ] }
  };
}

function cleanZone(input) {
  if (!/^[a-z][a-z0-9_+/-]{0,79}$/i.test(input)) return null;
  try { return zoneClock(input).resolvedOptions().timeZone; } catch { return null; }
}

async function saveSettings(db, id, changes, now) {
  await db.prepare(`
    INSERT INTO telegram_review_reminders (telegram_id)
    SELECT telegram_id FROM telegram_accounts WHERE telegram_id=? ON CONFLICT DO NOTHING
  `).bind(id).run();
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await readSettings(db, id);
    if (!current) return null;
    const updated = { ...current, ...changes };
    const next = nextReminderAt(updated, now);
    const result = await db.prepare(`
      UPDATE telegram_review_reminders SET time_zone=?,frequency=?,hour=?,muted_until=?,next_at=?,revision=revision+1
      WHERE telegram_id=? AND revision=? RETURNING *
    `).bind(updated.time_zone, updated.frequency, updated.hour, updated.muted_until, next, id, current.revision).first();
    if (result) return result;
  }
  throw new Error('Reminder settings changed concurrently');
}

async function show(env, call, id, payload, message) {
  if (message?.text && message.message_id) {
    try {
      return await call(env, 'editMessageText', { chat_id: id, message_id: message.message_id, ...payload });
    } catch (error) {
      if (error.notModified) return;
      if (error.code !== 400) throw error;
    }
  }
  return call(env, 'sendMessage', { chat_id: id, ...payload });
}

export async function reminderSettings(env, call, id, message) {
  return show(env, call, id, renderSettings(await readSettings(env.DB, id), Date.now()), message);
}

export async function setReminderZone(env, call, id, input) {
  const time_zone = cleanZone(input);
  if (!time_zone) return show(env, call, id, renderZones());
  const now = Date.now();
  return show(env, call, id, renderSettings(await saveSettings(env.DB, id, { time_zone }, now), now));
}

export async function reminderCallback(env, call, id, query) {
  const match = /^rem:(daily|weekly|off|mute|resume|settings|zones|zone:[0-3]|hour:(?:9|13|19|20))$/.exec(query.data ?? '');
  if (!match) return false;
  const action = match[1];
  const now = Date.now();
  let current = await readSettings(env.DB, id);
  if (action === 'zones' || ((action === 'daily' || action === 'weekly') && !current?.time_zone)) {
    await call(env, 'answerCallbackQuery', { callback_query_id: query.id });
    await show(env, call, id, renderZones(), query.message);
    return true;
  }
  const changes = action === 'daily' || action === 'weekly' ? { frequency: action, muted_until: null }
    : action === 'off' ? { frequency: null, muted_until: null }
    : action === 'mute' ? { muted_until: now + dayMs }
    : action === 'resume' ? { muted_until: null }
    : action.startsWith('hour:') ? { hour: Number(action.slice(5)) }
    : action.startsWith('zone:') ? { time_zone: timeZones[Number(action.slice(5))][1] }
    : null;
  if (changes) current = await saveSettings(env.DB, id, changes, now);
  await call(env, 'answerCallbackQuery', { callback_query_id: query.id });
  await show(env, call, id, renderSettings(current, now), query.message);
  return true;
}

export async function runReviewReminders(env, call, now = Date.now()) {
  if (!env.DB || !env.TELEGRAM_BOT_TOKEN) return;
  let afterTime = 0, afterId = '';
  for (let batch = 0; batch < deliveryBatches; batch++) {
    const { results } = await env.DB.prepare(`
      SELECT r.*,l.state_json,l.revision AS progress_revision FROM telegram_review_reminders r
      JOIN telegram_accounts a ON a.telegram_id=r.telegram_id JOIN learners l ON l.id=a.learner_id
      WHERE r.next_at<=? AND (r.next_at,r.telegram_id)>(?,?)
      ORDER BY r.next_at,r.telegram_id LIMIT ?
    `).bind(now, afterTime, afterId, deliveryBatchSize).all();
    if (!results.length) break;
    ({ next_at: afterTime, telegram_id: afterId } = results.at(-1));
    await deliverBatch(env, call, results, now);
    if (results.length < deliveryBatchSize) break;
  }
}

async function deliverBatch(env, call, reminders, now) {
  const jobs = reminders.map(reminder => {
    const formatter = zoneClock(reminder.time_zone);
    const localNow = wallTime(formatter, now);
    const localDay = Math.floor(localNow / dayMs) * dayMs;
    const timely = wallTime(formatter, reminder.next_at) >= localDay &&
      localNow < localDay + lastDeliveryHour * hourMs;
    const state = JSON.parse(reminder.state_json ?? 'null');
    const due = timely && Boolean(buildChatRound(state, Math.random, now));
    const lastAttempt = due ? now : reminder.last_attempt_at;
    const next = nextReminderAt({ ...reminder, last_attempt_at: lastAttempt }, now);
    const claim = env.DB.prepare(`
      UPDATE telegram_review_reminders SET next_at=?,last_attempt_at=?,revision=revision+1
      WHERE telegram_id=? AND revision=? AND next_at=? AND EXISTS (
        SELECT 1 FROM telegram_accounts a JOIN learners l ON l.id=a.learner_id
        WHERE a.telegram_id=telegram_review_reminders.telegram_id AND l.revision=?
      ) RETURNING telegram_id
    `).bind(next, lastAttempt, reminder.telegram_id, reminder.revision, reminder.next_at, reminder.progress_revision);
    return { reminder, state, due, claim };
  });
  // Claim before sending, so overlapping Cron runs and ambiguous timeouts
  // cannot send the same slot twice.
  const claims = await env.DB.batch(jobs.map(job => job.claim));
  const inApp = miniAppButton(env, 'Ilovada takrorlash', 'review');
  const blocked = await Promise.all(jobs.map(async ({ reminder, state, due }, index) => {
    if (!due || !claims[index].results.length) return null;
    try {
      await show(env, call, reminder.telegram_id, {
        ...messageText('Lug‘at eslatmasi', [
          languageDirection(state.base, state.target),
          'Takrorlashga tayyor so‘zlaringiz bor.'
        ]),
        reply_markup: { inline_keyboard: [
          [primaryButton({ text: 'Takrorlashni boshlash', callback_data: navigationActions.review })],
          ...(inApp ? [[inApp]] : []),
          [button(pauseLabel, 'mute'), button(stopLabel, 'off')]
        ] }
      });
    } catch (error) {
      if (error.code === 403) return reminder;
      console.warn('Telegram review reminder delivery failed', { code: error.code ?? null });
    }
    return null;
  }));
  const disabled = blocked.filter(Boolean).map(reminder => env.DB.prepare(`
    UPDATE telegram_review_reminders SET frequency=NULL,next_at=NULL,revision=revision+1
    WHERE telegram_id=? AND revision=?
  `).bind(reminder.telegram_id, reminder.revision + 1));
  if (disabled.length) await env.DB.batch(disabled);
}
