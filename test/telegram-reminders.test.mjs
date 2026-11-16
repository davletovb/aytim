import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';
import { newCourse } from '../dist/engine.mjs';
import { words } from '../dist/words.mjs';
import { nextReminderAt, runReviewReminders } from '../src/telegram-reminders.mjs';

test('daily and weekly reminders follow local time, DST, mutes and the last send', () => {
  const next = (now, settings) => new Date(nextReminderAt({
    time_zone: 'Europe/Berlin', frequency: 'daily', hour: 19, ...settings
  }, Date.parse(now))).toISOString();
  assert.equal(next('2026-03-28T18:05:00Z'), '2026-03-29T17:00:00.000Z');
  assert.equal(next('2026-10-24T17:05:00Z'), '2026-10-25T18:00:00.000Z');
  assert.equal(next('2026-11-15T17:00:00Z', { frequency: 'weekly' }), '2026-11-16T18:00:00.000Z');
  assert.equal(next('2026-11-15T13:00:00Z', { time_zone: 'Asia/Tashkent' }), '2026-11-15T14:00:00.000Z');
  assert.equal(next('2026-11-15T13:00:00Z', { muted_until: Date.parse('2026-11-16T18:30:00Z') }),
    '2026-11-17T18:00:00.000Z');
  assert.equal(next('2026-11-15T17:00:00Z', { last_attempt_at: Date.parse('2026-11-15T12:00:00Z') }),
    '2026-11-16T18:00:00.000Z');
  assert.equal(nextReminderAt({ time_zone: 'UTC', frequency: null, hour: 19 }, Date.now()), null);
});

test('the Worker schedules only opted-in, due reviews and supports muting and stopping', async () => {
  const outgoing = [];
  const now = Date.parse('2026-11-16T15:05:00Z');
  const mf = new Miniflare(convertV4MiniflareOptions({
    ...workerOptions,
    modules: [{
      type: 'ESModule', path: resolve('test/reminder-worker-test.mjs'), contents: `
        import worker from './worker-bundle.mjs';
        Date.now = () => ${now};
        export default {
          async fetch(request, env, ctx) {
            if (new URL(request.url).pathname !== '/test-cron') return worker.fetch(request, env, ctx);
            await worker.scheduled({ scheduledTime: Date.now() }, env);
            return new Response('OK');
          }
        };
      `
    }, ...workerOptions.modules],
    bindings: { TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_WEBHOOK_SECRET: 'test', PUBLIC_APP_ORIGIN: 'https://aytim.test' },
    outboundService: async request => {
      const method = new URL(request.url).pathname.split('/').pop();
      const payload = await request.json();
      outgoing.push({ method, payload });
      return Response.json({ ok: true, result: { message_id: 100 } });
    }
  }));
  try {
    await migrate(mf);
    const origin = 'https://aytim.test';
    const db = await mf.getD1Database('DB');
    const course = newCourse();
    course.vocabProgress = {};
    for (const entry of words.filter(entry => entry.level === 1).slice(0, 8)) {
      course.cards[entry.id] = { step: -1, due: 0 };
      course.vocabProgress[entry.id] = { introducedAt: 1 };
    }
    const progress = { base: 'uz', target: 'ar', courses: { 'uz>ar': course } };
    let updateId = 1;
    const post = update => mf.dispatchFetch(origin + '/api/telegram/webhook', {
      method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'test' },
      body: JSON.stringify({ update_id: updateId++, ...update })
    });
    const command = (id, text) => post({ message: { from: { id }, chat: { id, type: 'private' }, text } });
    const callback = (id, data) => post({ callback_query: {
      id: 'test-' + updateId, from: { id }, data,
      message: { chat: { id, type: 'private' }, message_id: 100, text: 'Eslatmalar' }
    } });
    const settings = id => db.prepare('SELECT * FROM telegram_review_reminders WHERE telegram_id=?').bind(id).first();
    const scheduleNow = (id, time = now - 1000) =>
      db.prepare('UPDATE telegram_review_reminders SET next_at=? WHERE telegram_id=?').bind(time, id).run();
    const runCron = () => mf.dispatchFetch(origin + '/test-cron');
    assert.equal((await runCron()).status, 200);
    for (const id of [42, 43, 44]) {
      await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
        .bind('learner-' + id, JSON.stringify(id === 43 ? { ...progress, courses: {} } : progress), now, now).run();
      await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
        .bind(String(id), 'learner-' + id, 'Learner', now, now).run();
    }
    assert.equal((await command(42, '/reminders')).status, 200);
    assert.match(outgoing.at(-1).payload.text, /O‘chiq/);
    assert.equal((await callback(42, 'rem:daily')).status, 200);
    assert.equal(await settings('42'), null);
    assert.match(outgoing.at(-1).payload.text, /Vaqt mintaqangizni tanlang/);
    await callback(42, 'rem:zone:0');
    assert.equal((await settings('42')).frequency, null);
    await callback(42, 'rem:daily');
    await callback(42, 'rem:hour:20');
    let row = await settings('42');
    assert.equal(row.frequency, 'daily');
    assert.equal(row.hour, 20);
    assert.equal(new Date(row.next_at).getUTCHours(), 15);
    await command(43, '/remindzone Europe/Berlin');
    await callback(43, 'rem:weekly');
    await scheduleNow('42');
    await scheduleNow('43');
    outgoing.length = 0;

    const cronResponses = await Promise.all([runCron(), runCron()]);
    assert.ok(cronResponses.every(response => response.status === 200));
    assert.equal(outgoing.length, 1);
    assert.equal(String(outgoing[0].payload.chat_id), '42');
    assert.equal(outgoing[0].payload.reply_markup.inline_keyboard[0][0].callback_data, 'nav:review');
    assert.equal(outgoing[0].payload.reply_markup.inline_keyboard[1][0].web_app.url,
      'https://aytim.test/?open=review');
    assert.ok((await settings('43')).next_at > now);
    assert.equal(await settings('44'), null);

    await callback(43, 'rem:recapon');
    assert.equal((await settings('43')).recap_enabled, 1);
    assert.equal(new Date((await settings('43')).next_recap_at).toISOString(), '2026-11-16T18:00:00.000Z');
    await db.prepare(`INSERT INTO bot_private_practice
      (id,telegram_id,learner_id,pair,kind,unit_id,exercise_json,expires_at,completed_at,correct)
      VALUES ('recap-fixture','43','learner-43','uz>ar','build','greetings','{}',?,?,1)`)
      .bind(now, now - 86_400_000).run();
    await db.prepare('UPDATE telegram_review_reminders SET next_recap_at=? WHERE telegram_id=?')
      .bind(now - 1, '43').run();
    await scheduleNow('43');
    await db.prepare('UPDATE learners SET state_json=? WHERE id=?')
      .bind(JSON.stringify(progress), 'learner-43').run();
    outgoing.length = 0;
    await Promise.all([runCron(), runCron()]);
    assert.equal(outgoing.length, 1, 'one message covers the weekly recap and due review');
    assert.match(outgoing[0].payload.text, /2026-11-09 – 2026-11-15/);
    assert.match(outgoing[0].payload.text, /Telegram til mashqlari: 1/);
    assert.equal(outgoing[0].payload.reply_markup.inline_keyboard[0][0].callback_data, 'nav:review');
    assert.equal(outgoing[0].payload.reply_markup.inline_keyboard[1][0].web_app.url,
      'https://aytim.test/?open=progress');
    await callback(43, 'rem:mute');
    assert.ok((await settings('43')).next_recap_at > now + 86_400_000);
    await callback(43, 'rem:recapoff');
    assert.equal((await settings('43')).next_recap_at, null);
    assert.equal((await settings('43')).frequency, 'weekly');
    await command(43, '/recap');
    assert.match(outgoing.at(-1).payload.text, /Haftalik hisobot/);

    await callback(42, 'rem:mute');
    row = await settings('42');
    assert.ok(row.muted_until > now);
    assert.ok(row.next_at > row.muted_until);
    await callback(42, 'rem:resume');
    assert.equal((await settings('42')).muted_until, null);
    await callback(42, 'rem:off');
    row = await settings('42');
    assert.equal(row.frequency, null);
    assert.equal(row.next_at, null);

    await callback(42, 'rem:daily');
    await scheduleNow('42', now - 24 * 60 * 60_000);
    await runReviewReminders({ DB: db, TELEGRAM_BOT_TOKEN: 'test' },
      () => assert.fail('stale periods should not be sent'), now);
    await scheduleNow('42');
    const quietHours = now + 55 * 60_000;
    await runReviewReminders({ DB: db, TELEGRAM_BOT_TOKEN: 'test' },
      () => assert.fail('reminders should not be sent during quiet hours'), quietHours);
    assert.ok((await settings('42')).next_at > quietHours);
    await scheduleNow('42');
    await runReviewReminders({ DB: db, TELEGRAM_BOT_TOKEN: 'test' },
      () => { throw Object.assign(new Error('Forbidden'), { code: 403 }); }, now);
    assert.equal((await settings('42')).frequency, null);
    await db.prepare('DELETE FROM telegram_accounts WHERE telegram_id=?').bind('42').run();
    assert.equal(await settings('42'), null);

    const backlog = Array.from({ length: 85 }, (_, index) => String(index + 100));
    for (const offset of [0, 30, 60]) {
      await db.batch(backlog.slice(offset, offset + 30).flatMap(id => [
        db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
          .bind('learner-' + id, JSON.stringify(progress), now, now),
        db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
          .bind(id, 'learner-' + id, 'Learner', now, now),
        db.prepare(`INSERT INTO telegram_review_reminders (telegram_id,time_zone,frequency,next_at)
          VALUES (?,'Asia/Tashkent','daily',?)`).bind(id, now - 65 * 60_000)
      ]));
    }
    outgoing.length = 0;
    for (let run = 0; run < 3; run++) assert.equal((await runCron()).status, 200);
    assert.equal(outgoing.length, backlog.length);
    assert.deepEqual(outgoing.map(({ payload }) => String(payload.chat_id)).sort(), backlog);
    assert.equal((await runCron()).status, 200);
    assert.equal(outgoing.length, backlog.length);
  } finally {
    await mf.dispose();
  }
});
