import { buildChatRound } from './telegram-review.mjs';
import { pairKey, reviewQueue, validPair } from '../dist/engine.mjs';
import { xpPerActivity } from '../dist/home-progress.mjs';
import { chatLabels, homeButton, languageDirection, miniAppButton, navigationButton, primaryButton, vocabularyCompanion } from './telegram-navigation.mjs';
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
const settingsLead = 'Vaqt mintaqasi va eslatma soatini tanlang.';
const setupActions = ['daily', 'weekly', 'recapon'];

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

function utcTime(formatter, local) {
  const estimate = local - (wallTime(formatter, local) - local);
  return estimate + local - wallTime(formatter, estimate);
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
    const utc = utcTime(formatter, local);
    if (utc > after && wallTime(formatter, utc) === local) return utc;
  }
  return null;
}

function nextRecapAt(settings, now) {
  return nextReminderAt({ ...settings, frequency: settings.recap_enabled ? 'weekly' : null,
    last_attempt_at: settings.last_recap_attempt_at }, now);
}

function previousWeek(zone, now) {
  const formatter = zoneClock(zone);
  const localDay = Math.floor(wallTime(formatter, now) / dayMs) * dayMs;
  const end = localDay - ((new Date(localDay).getUTCDay() + 6) % 7) * dayMs;
  const start = end - 7 * dayMs;
  return { from: utcTime(formatter, start), to: utcTime(formatter, end),
    first: new Date(start).toISOString().slice(0, 10), last: new Date(end - dayMs).toISOString().slice(0, 10) };
}

const countPractice = `
    SELECT COUNT(*) FROM bot_private_practice
    WHERE telegram_id=? AND learner_id=? AND pair=? AND completed_at>=? AND completed_at<?
`;

function recapCard(env, scheduled, state, week, chatSessions, now) {
  const course = state.courses?.[pairKey(state.base, state.target)];
  const entries = Object.entries(course?.activityDays ?? {})
    .filter(([date]) => date >= week.first && date <= week.last);
  const seconds = entries.reduce((sum, [, entry]) => sum + entry.seconds, 0);
  const sessions = entries.reduce((sum, [, entry]) => sum + entry.sessions, 0);
  const xp = entries.reduce((sum, [, entry]) => sum + (entry.xp ?? entry.sessions * xpPerActivity), 0);
  const due = course ? reviewQueue(course, false, now).length : 0;
  const details = [
    languageDirection(state.base, state.target),
    week.first + ' – ' + week.last,
    'Mashg‘ulotlar: ' + sessions + ' · ' + Math.floor(seconds / 60) + ' daq. · ' + xp + ' XP\n' +
      'Telegram til mashqlari: ' + chatSessions + '\nTakrorlashga tayyor: ' + due
  ];
  const app = miniAppButton(env, '📊 Ilovada natijalarni ko‘rish', 'progress');
  const practice = vocabularyCompanion(env) ? navigationButton('practice') :
    due ? navigationButton('review', 'Takrorlashni boshlash') : navigationButton('focus');
  return {
    ...messageText(chatLabels.recap, details),
    reply_markup: { inline_keyboard: [
      [primaryButton(practice)],
      ...(app ? [[app]] : []),
      [navigationButton('reminders')],
      ...(scheduled ? [[button(pauseLabel, 'mute'), button('Hisobotni o‘chirish', 'recapoff')]] : [[homeButton]])
    ] }
  };
}

export async function showWeeklyRecap(env, call, id, learner, state, message) {
  if (!validPair(state?.base, state?.target)) return show(env, call, id,
    messageText(chatLabels.recap, ['Avval Aytim ilovasida til yo‘nalishini tanlang.']), message);
  const now = Date.now();
  const settings = await readSettings(env.DB, id);
  const week = previousWeek(settings?.time_zone ?? 'UTC', now);
  const result = await env.DB.prepare('SELECT (' + countPractice + ') AS sessions')
    .bind(id, learner.id, pairKey(state.base, state.target), week.from, week.to).first();
  return show(env, call, id, recapCard(env, false, state, week, result.sessions, now), message);
}

function readSettings(db, id) {
  return db.prepare('SELECT * FROM telegram_review_reminders WHERE telegram_id=?').bind(id).first();
}

function scheduleLabel(time, timeZone) {
  return new Intl.DateTimeFormat('uz-Latn-UZ', {
    timeZone, dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23'
  }).format(time);
}

function renderSettings(settings, now) {
  const { time_zone, frequency, recap_enabled, hour = defaultHour, muted_until, next_at, next_recap_at } = settings ?? {};
  const paused = muted_until > now && (frequency || recap_enabled);
  const status = !frequency ? 'O‘chiq' : frequency === 'daily' ? 'Har kuni' : 'Har dushanba';
  return {
    ...messageText(chatLabels.reminders, [
      'Lug‘at: ' + status + '\nHaftalik hisobot: ' + (recap_enabled ? 'Har dushanba' : 'O‘chiq'),
      clockLabel(hour) + ' · ' + (time_zone ?? 'Vaqt mintaqangizni tanlang'),
      time_zone && frequency && next_at != null && 'Keyingi lug‘at tekshiruvi: ' + scheduleLabel(next_at, time_zone),
      time_zone && recap_enabled && next_recap_at != null && 'Keyingi hisobot: ' + scheduleLabel(next_recap_at, time_zone),
      paused && '24 soatga jim qilingan',
      time_zone ? 'Lug‘at eslatmasi faqat takrorlashga tayyor so‘zlar bo‘lsa keladi.' : settingsLead
    ]),
    reply_markup: { inline_keyboard: [
      [button('Har kuni', 'daily'), button('Har dushanba', 'weekly')],
      hours.map(time => button(clockLabel(time), 'hour:' + time)),
      [button(recap_enabled ? 'Haftalik hisobotni o‘chirish' : 'Haftalik hisobotni yoqish',
        recap_enabled ? 'recapoff' : 'recapon')],
      [button('Vaqt mintaqasi', 'zones')],
      ...(frequency || recap_enabled ?
        [[button(paused ? 'Davom ettirish' : pauseLabel, paused ? 'resume' : 'mute')]] : []),
      ...(frequency ? [[button('Lug‘at eslatmalarini o‘chirish', 'off')]] : []),
      [homeButton]
    ] }
  };
}

function renderZones(setupAction) {
  const suffix = setupAction ? ':' + setupAction : '';
  return {
    ...messageText('Vaqt mintaqangizni tanlang', [
      'Boshqa mintaqa uchun, masalan, /remindzone America/New_York' +
        (setupAction ? ' ' + setupAction : '') + ' buyrug‘ini yuboring.'
    ]),
    reply_markup: { inline_keyboard: [
      timeZones.map(([city], index) => button(city, 'zone:' + index + suffix)),
      [button('Ortga', 'settings'), homeButton]
    ] }
  };
}

function activationChanges(action, current) {
  if (action === 'recapon') return { recap_enabled: 1 };
  if (action === 'daily' || action === 'weekly')
    return { frequency: action, ...(current?.recap_enabled ? {} : { muted_until: null }) };
  return {};
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
    const recap = nextRecapAt(updated, now);
    const result = await db.prepare(`
      UPDATE telegram_review_reminders SET time_zone=?,frequency=?,hour=?,muted_until=?,next_at=?,
        recap_enabled=?,next_recap_at=?,revision=revision+1
      WHERE telegram_id=? AND revision=? RETURNING *
    `).bind(updated.time_zone, updated.frequency, updated.hour, updated.muted_until, next,
      updated.recap_enabled, recap, id, current.revision).first();
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
  const [zone, action] = input.split(/\s+/, 2);
  const setupAction = setupActions.includes(action) ? action : undefined;
  const time_zone = cleanZone(zone);
  if (!time_zone) return show(env, call, id, renderZones(setupAction));
  const now = Date.now();
  const current = setupAction ? await readSettings(env.DB, id) : null;
  const settings = await saveSettings(env.DB, id, { time_zone, ...activationChanges(setupAction, current) }, now);
  return show(env, call, id, renderSettings(settings, now));
}

export async function reminderCallback(env, call, id, query) {
  const match = /^rem:(daily|weekly|off|recapon|recapoff|mute|resume|settings|zones|zone:([0-3])(?::(daily|weekly|recapon))?|hour:(?:9|13|19|20))$/.exec(query.data ?? '');
  if (!match) return false;
  const [, action, zoneIndex, setupAction] = match;
  const now = Date.now();
  let current = await readSettings(env.DB, id);
  const needsZone = setupActions.includes(action) && !current?.time_zone;
  if (action === 'zones' || needsZone) {
    await call(env, 'answerCallbackQuery', { callback_query_id: query.id });
    await show(env, call, id, renderZones(needsZone ? action : undefined), query.message);
    return true;
  }
  const changes = zoneIndex !== undefined ?
    { time_zone: timeZones[Number(zoneIndex)][1], ...activationChanges(setupAction, current) }
    : setupActions.includes(action) ? activationChanges(action, current)
    : action === 'off' ? { frequency: null }
    : action === 'recapoff' ? { recap_enabled: 0 }
    : action === 'mute' ? { muted_until: now + dayMs }
    : action === 'resume' ? { muted_until: null }
    : action.startsWith('hour:') ? { hour: Number(action.slice(5)) }
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
      SELECT r.*,COALESCE(MIN(r.next_at,r.next_recap_at),r.next_at,r.next_recap_at) AS due_at,
        l.id AS learner_id,l.state_json,l.revision AS progress_revision FROM telegram_review_reminders r
      JOIN telegram_accounts a ON a.telegram_id=r.telegram_id JOIN learners l ON l.id=a.learner_id
      WHERE (r.next_at<=? OR r.next_recap_at<=?) AND (due_at,r.telegram_id)>(?,?)
      ORDER BY due_at,r.telegram_id LIMIT ?
    `).bind(now, now, afterTime, afterId, deliveryBatchSize).all();
    if (!results.length) break;
    ({ due_at: afterTime, telegram_id: afterId } = results.at(-1));
    await deliverBatch(env, call, results, now);
    if (results.length < deliveryBatchSize) break;
  }
}

async function deliverBatch(env, call, reminders, now) {
  const jobs = reminders.map(reminder => {
    const formatter = zoneClock(reminder.time_zone);
    const localNow = wallTime(formatter, now);
    const localDay = Math.floor(localNow / dayMs) * dayMs;
    const timely = scheduled => scheduled !== null && scheduled <= now &&
      wallTime(formatter, scheduled) >= localDay && localNow < localDay + lastDeliveryHour * hourMs;
    const state = JSON.parse(reminder.state_json ?? 'null');
    const recap = reminder.recap_enabled && timely(reminder.next_recap_at) && validPair(state?.base, state?.target);
    const due = reminder.frequency && timely(reminder.next_at) && Boolean(buildChatRound(state, Math.random, now));
    // A recap can also carry the day's review prompt. Claim both slots before
    // sending that single message when both timers are due.
    const lastAttempt = due ? now : reminder.last_attempt_at;
    const lastRecap = recap ? now : reminder.last_recap_attempt_at;
    const reviewTimerDue = reminder.next_at !== null && reminder.next_at <= now;
    const recapTimerDue = reminder.next_recap_at !== null && reminder.next_recap_at <= now;
    const next = reviewTimerDue ? nextReminderAt({ ...reminder, last_attempt_at: lastAttempt }, now) : reminder.next_at;
    const nextRecap = recapTimerDue ?
      nextRecapAt({ ...reminder, last_recap_attempt_at: lastRecap }, now) : reminder.next_recap_at;
    const week = recap ? previousWeek(reminder.time_zone, now) : null;
    const count = week ? '(' + countPractice + ')' : '0';
    const countArgs = week ? [
      reminder.telegram_id, reminder.learner_id, pairKey(state.base, state.target), week.from, week.to
    ] : [];
    const claim = env.DB.prepare(`
      UPDATE telegram_review_reminders SET next_at=?,last_attempt_at=?,next_recap_at=?,last_recap_attempt_at=?,revision=revision+1
      WHERE telegram_id=? AND revision=? AND EXISTS (
        SELECT 1 FROM telegram_accounts a JOIN learners l ON l.id=a.learner_id
        WHERE a.telegram_id=telegram_review_reminders.telegram_id AND l.id=? AND l.revision=?
      ) RETURNING ${count} AS sessions
    `).bind(next, lastAttempt, nextRecap, lastRecap,
      reminder.telegram_id, reminder.revision, reminder.learner_id, reminder.progress_revision, ...countArgs);
    return { reminder, state, due, week, claim };
  });
  // Claim before sending, so overlapping Cron runs and ambiguous timeouts
  // cannot send the same slot twice.
  const claims = await env.DB.batch(jobs.map(job => job.claim));
  const inApp = miniAppButton(env, '🧠 Ilovada takrorlash', 'review');
  const practice = vocabularyCompanion(env) ? navigationButton('practice') :
    navigationButton('review', 'Takrorlashni boshlash');
  const blocked = await Promise.all(jobs.map(async ({ reminder, state, due, week }, index) => {
    const result = claims[index].results[0];
    if ((!due && !week) || !result) return null;
    try {
      await show(env, call, reminder.telegram_id, week ? recapCard(env, true, state, week, result.sessions, now) : {
        ...messageText('Lug‘at eslatmasi', [
          languageDirection(state.base, state.target),
          'Takrorlashga tayyor so‘zlaringiz bor.'
        ]),
        reply_markup: { inline_keyboard: [
          [primaryButton(practice)],
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
    UPDATE telegram_review_reminders SET frequency=NULL,next_at=NULL,recap_enabled=0,next_recap_at=NULL,revision=revision+1
    WHERE telegram_id=? AND revision=?
  `).bind(reminder.telegram_id, reminder.revision + 1));
  if (disabled.length) await env.DB.batch(disabled);
}
