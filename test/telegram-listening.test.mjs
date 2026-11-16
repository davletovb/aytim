import test from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';
import { botWebhook } from '../src/telegram-bot.mjs';
import { audio, resolveAudio } from '../src/speech.mjs';
import { navigationActions } from '../src/telegram-navigation.mjs';
import { words } from '../dist/words.mjs';
import { newCourse } from '../dist/engine.mjs';

test('Telegram listening shares the web audio cache and records one ungraded answer', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  try {
    await migrate(mf);
    const db = await mf.getD1Database('DB');
    const course = newCourse();
    course.vocabProgress = {};
    for (const word of words.filter(word => word.level === 1).slice(0, 4)) {
      course.cards[word.id] = { step: -1, due: 0 };
      course.vocabProgress[word.id] = { introducedAt: 1 };
    }
    const saved = JSON.stringify({ base: 'uz', target: 'ar', courses: { 'uz>ar': course } });
    const now = Date.now();
    await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
      .bind('listener', saved, now, now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind('42', 'listener', 'Listener', now, now).run();

    const clips = new Map(), writes = [], calls = [];
    const origin = 'https://aytim.test';
    const env = {
      DB: db, TELEGRAM_BOT_TOKEN: 'fake', TELEGRAM_WEBHOOK_SECRET: 'test', TELEGRAM_FULL_CHAT: '1',
      PUBLIC_APP_ORIGIN: origin, AZURE_SPEECH_KEY: 'fake', AZURE_SPEECH_REGION: 'test',
      AUDIO: {
        get: async key => clips.has(key) ? { body: clips.get(key) } : null,
        put: async (key, bytes) => { clips.set(key, bytes); }
      }
    };
    const ctx = { waitUntil: promise => writes.push(promise) };
    const mp3 = [0x49, 0x44, 0x33];
    let ssml, azureCalls = 0, messageId = 70, rejectAudio = false;
    globalThis.fetch = async (url, options) => {
      if (String(url).startsWith('https://test.tts.speech.microsoft.com/')) {
        azureCalls++;
        ssml = options.body;
        return new Response(new Uint8Array(mp3));
      }
      if (!String(url).startsWith('https://api.telegram.org/')) return originalFetch(url, options);
      const method = new URL(url).pathname.split('/').pop();
      const payload = method === 'sendAudio' ? options.body : JSON.parse(options.body);
      calls.push({ method, payload });
      if (method === 'sendAudio' && rejectAudio)
        return Response.json({ ok: false, error_code: 400 }, { status: 400 });
      return Response.json({ ok: true, result: { message_id: ++messageId } });
    };
    let updateId = 1;
    const post = (update, id = updateId++) => botWebhook(new Request(origin + '/api/telegram/webhook', {
      method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'test' },
      body: JSON.stringify({ update_id: id, ...update })
    }), env, ctx);
    const chat = { id: 42, type: 'private' }, from = { id: 42 };
    const tap = (data, message) => ({ callback_query: {
      id: 'tap-' + updateId, from, data, message: { chat, ...message }
    } });

    assert.equal((await post(tap(navigationActions.listening, { message_id: 70 }))).status, 200);
    assert.deepEqual(calls.map(call => call.method), ['answerCallbackQuery', 'sendAudio']);
    const form = calls[1].payload;
    assert.equal(form.get('chat_id'), '42');
    assert.equal(form.get('audio').name, 'tinglash.mp3');
    assert.equal(form.get('audio').type, 'audio/mpeg');
    assert.deepEqual([...new Uint8Array(await form.get('audio').arrayBuffer())], mp3);
    const row = await db.prepare('SELECT * FROM bot_practice_sessions WHERE message_id=?').bind(messageId).first();
    const gender = ssml.includes('ar-SA-ZariyahNeural') ? 'f' : 'm';
    assert.match(ssml, /ar-SA-(Zariyah|Hamed)Neural/);
    assert.equal(row.kind, 'listening');
    assert.equal(row.question, resolveAudio(row.entry_id, 'ar', gender).text);
    assert.equal(form.get('caption').includes(row.question), false);
    assert.equal(form.get('title').includes(row.question), false);
    const buttons = JSON.parse(form.get('reply_markup')).inline_keyboard.flat();
    assert.equal(buttons.length, 4);
    assert.equal(buttons[row.correct_index].text, words.find(word => word.id === row.entry_id).text.uz);
    const mediaMessage = { message_id: row.message_id, audio: {} };
    const badMessage = tap(buttons[row.correct_index].callback_data, { ...mediaMessage, message_id: 123 });
    assert.equal((await post(badMessage)).status, 200);
    assert.match(calls.at(-1).payload.text, /muddati tugagan/);

    const wrong = (row.correct_index + 1) % buttons.length;
    const answer = tap(buttons[wrong].callback_data, mediaMessage);
    const answerId = updateId++;
    assert.equal((await post(answer, answerId)).status, 200);
    const result = calls.at(-1);
    assert.equal(result.method, 'editMessageCaption');
    assert.equal(result.payload.message_id, row.message_id);
    assert.ok(result.payload.caption.includes(row.question));
    assert.ok(result.payload.caption.includes(buttons[row.correct_index].text));
    assert.match(result.payload.caption, /xato/);
    assert.equal(result.payload.reply_markup.inline_keyboard[0][0].callback_data, navigationActions.listening);
    const callCount = calls.length;
    assert.equal((await post(answer, answerId)).status, 200);
    assert.equal(calls.length, callCount);
    assert.equal((await post(tap(buttons[row.correct_index].callback_data, mediaMessage))).status, 200);
    assert.equal(calls.at(-1).payload.caption, result.payload.caption);
    assert.deepEqual(await db.prepare('SELECT revision,state_json FROM learners WHERE id=?').bind('listener').first(),
      { revision: 0, state_json: saved });

    await Promise.all(writes);
    const request = new Request(origin + '/api/audio?' + new URLSearchParams({ id: row.entry_id, lang: 'ar', gender }));
    const cached = await audio(request, { AUDIO: env.AUDIO }, ctx, { cache: null });
    assert.equal(cached.status, 200);
    assert.equal(azureCalls, 1);
    assert.deepEqual([...new Uint8Array(await cached.arrayBuffer())], mp3);

    console.warn = () => {};
    env.SPEECH_LIMITER = { limit: async () => ({ success: false }) };
    const command = { message: { chat, from, text: '/listen' } };
    assert.equal((await post(command)).status, 200);
    assert.equal(calls.at(-1).method, 'sendMessage');
    assert.match(calls.at(-1).payload.text, /Audio hozircha mavjud emas/);
    assert.equal(azureCalls, 1);
    env.SPEECH_LIMITER = undefined;
    rejectAudio = true;
    assert.equal((await post(command)).status, 200);
    assert.deepEqual(calls.slice(-2).map(call => call.method), ['sendAudio', 'sendMessage']);
    assert.match(calls.at(-1).payload.text, /Tezkor mashq/);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    await mf.dispose();
  }
});
