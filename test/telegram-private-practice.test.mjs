import test from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { migrate, workerOptions } from './worker-helper.mjs';
import { codes } from '../dist/content.mjs';
import { newCourse, seededRandom } from '../dist/engine.mjs';
import { dialogueExercise } from '../src/telegram-dialogues.mjs';
import { createPrivateExercise } from '../src/telegram-private-practice.mjs';
import { orderedUnits } from '../dist/journey.mjs';

test('private exercises use the shared curriculum across all directed pairs', () => {
  for (const base of codes) for (const target of codes.filter(code => code !== base)) {
    for (const kind of ['build', 'gap', 'dialogue']) {
      const item = createPrivateExercise(kind, newCourse(), base, target, [], seededRandom(11));
      assert.equal(item.unit.id, 'greetings');
      assert.equal(item.kind, kind);
      if (kind === 'build') assert.ok(item.exercise.bank.expected.length >= 2);
      if (kind === 'gap') assert.ok(item.exercise.options[item.exercise.correct]);
      if (kind === 'dialogue') assert.equal(item.exercise.turns.start.options.filter(option => option.next).length, 2);
    }
  }
  const cafe = orderedUnits.find(unit => unit.id === 'cafe');
  const { turns } = dialogueExercise(cafe, 'tr', seededRandom(11));
  assert.ok(turns.start.options.some(option => option.next === 'menu'));
  assert.ok(turns.start.options.some(option => option.next === 'sugar'));
});

test('private chat grades word banks and gaps, branches dialogues and targets misses without changing shared grades', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  const originalFetch = globalThis.fetch;
  try {
    await migrate(mf);
    const db = await mf.getD1Database('DB');
    const env = { DB: db, TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_WEBHOOK_SECRET: 'test' };
    const { botWebhook } = await import('../src/telegram-bot.mjs');
    const state = JSON.stringify({ base: 'uz', target: 'tr', courses: { 'uz>tr': newCourse() } });
    const now = Date.now();
    await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
      .bind('learner', state, now, now).run();
    await db.prepare(`INSERT INTO telegram_accounts
      (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)`)
      .bind('42', 'learner', 'Learner', now, now).run();
    const chat = { id: 42, type: 'private' };
    const from = { id: 42 };
    let outgoing, messageId = 0, updateId = 0;
    globalThis.fetch = async (url, init) => {
      if (!String(url).startsWith('https://api.telegram.org/')) return originalFetch(url, init);
      const method = new URL(url).pathname.split('/').at(-1);
      const payload = JSON.parse(init.body);
      if (method === 'answerCallbackQuery') return Response.json({ ok: true, result: true });
      outgoing = { ...payload, chat, message_id: payload.message_id ?? ++messageId };
      return Response.json({ ok: true, result: outgoing });
    };
    const post = update => botWebhook(new Request('https://aytim.test/api/telegram/webhook', {
      method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'test' },
      body: JSON.stringify({ update_id: ++updateId, ...update })
    }), env);
    const tap = data => post({ callback_query: { id: 'tap' + updateId, from, data, message: outgoing } });
    const buttons = () => outgoing.reply_markup.inline_keyboard.flat();
    const find = end => buttons().find(button => button.callback_data?.endsWith(end)).callback_data;
    const read = () => db.prepare('SELECT * FROM bot_private_practice WHERE message_id=?').bind(outgoing.message_id).first();
    assert.equal((await post({ message: { chat, from, text: '/skills' } })).status, 200);
    assert.equal((await tap('nav:build')).status, 200);
    const bank = JSON.parse((await read()).exercise_json).bank;
    const tile = find(':tile' + bank.expected[0].id);
    await tap(tile);
    await tap(tile);
    assert.deepEqual(JSON.parse((await read()).state_json).selected, [bank.expected[0].id]);
    await tap(find(':undo'));
    for (const word of bank.expected) await tap(find(':tile' + word.id));
    await tap(find(':check'));
    assert.equal((await read()).correct, 1);
    for (let attempt = 0; attempt < 2; attempt++) {
      await tap('nav:gap');
      const exercise = JSON.parse((await read()).exercise_json);
      await tap(find(':pick' + ((exercise.correct + 1) % exercise.options.length)));
      assert.equal((await read()).correct, 0);
    }
    await tap('nav:focus');
    assert.equal((await read()).kind, 'gap');
    assert.match(outgoing.text, /Qayta mashq/);
    const focus = await read();
    await db.prepare('UPDATE learners SET state_json=?,revision=revision+1 WHERE id=?')
      .bind(JSON.stringify({ base: 'uz', target: 'ar', courses: {} }), 'learner').run();
    await tap(find(':pick0'));
    assert.equal((await read()).version, focus.version);
    await db.prepare('UPDATE learners SET state_json=?,revision=0 WHERE id=?').bind(state, 'learner').run();
    await tap('nav:dialogue');
    const dialogue = JSON.parse((await read()).exercise_json);
    const first = dialogue.turns.start.options.findIndex(option => option.next === 'morning');
    await tap(find(':pick' + first));
    assert.equal(JSON.parse((await read()).state_json).turn, 'morning');
    const final = dialogue.turns.morning.options.findIndex(option => option.next === 'done');
    await tap(find(':pick' + final));
    assert.equal((await read()).correct, 1);
    assert.match(outgoing.text, /Suhbat yakunlandi/);
    assert.deepEqual(await db.prepare('SELECT state_json,revision FROM learners WHERE id=?').bind('learner').first(),
      { state_json: state, revision: 0 });
  } finally {
    globalThis.fetch = originalFetch;
    await mf.dispose();
  }
});
