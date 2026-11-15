import test from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';
import { botWebhook } from '../src/telegram-bot.mjs';
import { navigationActions } from '../src/telegram-navigation.mjs';
import { stories } from '../dist/stories.mjs';

test('Telegram stories enforce level access and explain the first answer in rich and plain cards', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  const originalFetch = globalThis.fetch;
  try {
    await migrate(mf);
    const db = await mf.getD1Database('DB');
    const now = Date.now();
    const state = { base: 'uz', target: 'ar', courses: {} };
    const saved = JSON.stringify(state);
    await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
      .bind('reader', saved, now, now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind('42', 'reader', 'Reader', now, now).run();

    const calls = [];
    const env = { DB: db, TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_WEBHOOK_SECRET: 'test' };
    let messageId = 50, screen, editFailure = false;
    globalThis.fetch = async (url, options) => {
      if (!String(url).startsWith('https://api.telegram.org/')) return originalFetch(url, options);
      const method = new URL(url).pathname.split('/').pop();
      const payload = JSON.parse(options.body);
      calls.push({ method, payload });
      if (method === 'answerCallbackQuery') return Response.json({ ok: true, result: true });
      if (editFailure && method === 'editMessageText') {
        editFailure = false;
        return Response.json({ ok: false, error_code: 503 }, { status: 503 });
      }
      assert.ok(['sendRichMessage', 'sendMessage', 'editMessageText'].includes(method));
      screen = { ...payload, message_id: payload.message_id ?? ++messageId };
      return Response.json({ ok: true, result: screen });
    };
    let updateId = 1;
    const chat = { id: 42, type: 'private' }, from = { id: 42 };
    const post = (update, id = updateId++) => botWebhook(new Request('https://aytim.test/api/telegram/webhook', {
      method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'test' },
      body: JSON.stringify({ update_id: id, ...update })
    }), env);
    const callback = (data, message = screen) => ({
      callback_query: { id: 'tap-' + updateId, data, from, message: { chat, ...message } }
    });
    const buttons = () => (screen.rich_message?.blocks.filter(block => block.type === 'buttons')
      .map(block => block.buttons) ?? screen.reply_markup.inline_keyboard).flat();
    const session = () => db.prepare('SELECT * FROM bot_story_sessions ORDER BY message_id DESC LIMIT 1').first();
    const open = { message: { chat, from, text: '/stories' } };
    const currentState = value => db.prepare('UPDATE learners SET state_json=? WHERE id=?')
      .bind(JSON.stringify(value), 'reader').run();
    const originalWarn = console.warn;

    assert.equal((await post(callback(navigationActions.stories, { message_id: 10 }))).status, 200);
    const first = await session();
    const story = stories.find(item => item.id === first.story_id);
    assert.equal(story.level, 1);
    const paragraphs = screen.rich_message.blocks.filter(block => block.type === 'paragraph').map(block => block.text);
    assert.ok(paragraphs.includes(story.lines.map(line => line.text.ar).join('\n')));
    const options = buttons().filter(option => /^[ABC]$/.test(option.text));
    assert.equal(options.length, 3);
    const correct = JSON.parse(first.option_order).indexOf(0);
    for (const item of options) assert.ok(Buffer.byteLength(item.callback_data) <= 64);
    const wrong = options.find((_, index) => index !== correct);
    const response = callback(wrong.callback_data);
    const responseId = updateId++;
    editFailure = true;
    console.warn = () => {};
    try {
      assert.equal((await post(response, responseId)).status, 503);
    } finally {
      console.warn = originalWarn;
    }
    assert.equal((await post(response, responseId)).status, 200);
    assert.match(JSON.stringify(screen.rich_message), /To‘g‘ri javob/);
    const selected = (await session()).selected_index;
    await post(callback(options[correct].callback_data));
    assert.equal((await session()).selected_index, selected);
    await post(callback(buttons().find(item => item.text === 'Nega?').callback_data));
    assert.match(JSON.stringify(screen.rich_message), /Hikoyadan/);
    await post(callback(screen.reply_markup.inline_keyboard[0][0].callback_data));
    assert.equal(screen.rich_message, undefined);
    assert.match(screen.text, /Hikoyadan/);
    assert.ok(buttons().some(item => item.text.includes('Keyingi hikoya')));

    await post(callback(navigationActions.stories));
    assert.notEqual((await session()).story_id, first.story_id);
    await currentState({ ...state, courses: { 'uz>ar': { best: {}, journey: { level: 8 } } } });
    env.TELEGRAM_RICH_MESSAGES = '0';
    await post(open);
    const advanced = await session();
    assert.equal(stories.find(item => item.id === advanced.story_id).level, 8);
    assert.equal(screen.rich_message, undefined);
    const advancedData = buttons()[0].callback_data;
    await currentState(state);
    await post(callback(advancedData));
    assert.match(calls.at(-1).payload.text, /Hikoya eskirgan/);
    assert.equal((await session()).selected_index, null);
    assert.deepEqual(await db.prepare('SELECT revision,state_json FROM learners WHERE id=?').bind('reader').first(),
      { revision: 0, state_json: saved });
  } finally {
    globalThis.fetch = originalFetch;
    await mf.dispose();
  }
});
