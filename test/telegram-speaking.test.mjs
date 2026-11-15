import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';
import { botWebhook } from '../src/telegram-bot.mjs';
import { opusDuration } from '../src/telegram-speaking.mjs';
import { navigationActions } from '../src/telegram-navigation.mjs';
import { path } from '../dist/journey.mjs';
import { whisperModel } from '../src/recognition.mjs';

// Ogg pages with the fields the duration reader checks. Inference is mocked.
function voiceBytes(seconds, lastPageFlag = 4) {
  const page = (flags, samples, payload) => {
    const bytes = new Uint8Array(28 + payload.length);
    bytes.set(Buffer.from('OggS'));
    bytes[5] = flags;
    new DataView(bytes.buffer).setBigUint64(6, BigInt(samples), true);
    bytes[26] = 1;
    bytes[27] = payload.length;
    bytes.set(payload, 28);
    return bytes;
  };
  const header = new Uint8Array(19);
  header.set(Buffer.from('OpusHead'));
  header[8] = header[9] = 1;
  new DataView(header.buffer).setUint16(10, 312, true);
  return Uint8Array.from([...page(2, 0, header), ...page(lastPageFlag, 312 + seconds * 48000, [0])]);
}

test('voice length is derived from Ogg Opus rather than Telegram metadata', () => {
  assert.equal(opusDuration(voiceBytes(15)), 15);
  assert.equal(opusDuration(voiceBytes(0.5)), 0.5);
  assert.equal(opusDuration(voiceBytes(1, 0)), 1, 'complete audio pages without an end marker');
  assert.equal(opusDuration(voiceBytes(1, 0).slice(0, -1)), null);
  assert.equal(opusDuration(voiceBytes(1, 1)), null, 'unexpected packet continuation');
  assert.equal(opusDuration(voiceBytes(1).slice(0, -1)), null);
  assert.equal(opusDuration(new Uint8Array(100)), null);
});

test('the Worker runtime downloads Telegram voice notes and blocks download redirects', async () => {
  const telegram = 'https://api.telegram.org';
  const calls = [];
  const feedback = [];
  let redirect = false;
  const mf = new Miniflare(convertV4MiniflareOptions({
    ...workerOptions,
    modules: [{
      type: 'ESModule', path: resolve('test/telegram-worker-test.mjs'), contents: `
        import worker from './worker-bundle.mjs';
        export default {
          fetch(request, env, ctx) {
            return worker.fetch(request, {
              ...env, AI: { run: async () => ({ text: 'صباح الخير' }) }
            }, ctx);
          }
        };
      `
    }, ...workerOptions.modules],
    bindings: { TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_WEBHOOK_SECRET: 'test' },
    outboundService: async request => {
      calls.push(request.url);
      switch (request.url) {
        case telegram + '/bottest/getFile':
          return Response.json({ ok: true, result: { file_path: 'voice/file_1.oga' } });
        case telegram + '/file/bottest/voice/file_1.oga':
          return redirect ? Response.redirect('https://example.com/voice.oga') : new Response(voiceBytes(1));
        case telegram + '/bottest/sendMessage':
          feedback.push((await request.json()).text);
          return Response.json({ ok: true, result: { message_id: 100 } });
        default:
          return new Response('Unexpected outbound request', { status: 500 });
      }
    }
  }));
  try {
    await migrate(mf);
    const db = await mf.getD1Database('DB');
    const now = Date.now();
    await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
      .bind('learner', JSON.stringify({ base: 'uz', target: 'ar', courses: {} }), now, now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind('42', 'learner', 'Test', now, now).run();
    await db.prepare(`INSERT INTO bot_speaking_prompts
      (telegram_id,learner_id,message_id,pair,entry_id,reference,expires_at) VALUES (?,?,?,?,?,?,?)`)
      .bind('42', 'learner', 10, 'uz>ar', 'greetings-2', 'صباح الخير!', now + 60_000).run();
    const post = update_id => mf.dispatchFetch('https://aytim.test/api/telegram/webhook', {
      method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'test' },
      body: JSON.stringify({ update_id, message: {
        chat: { id: 42, type: 'private' }, from: { id: 42 }, message_id: 50 + update_id,
        voice: { file_id: 'voice-id', duration: 1 }
      } })
    });

    assert.equal((await post(1)).status, 200);
    assert.deepEqual(calls, [
      telegram + '/bottest/getFile', telegram + '/file/bottest/voice/file_1.oga', telegram + '/bottest/sendMessage'
    ]);
    assert.match(feedback[0], /Matn iboraga mos keldi/);
    assert.equal((await db.prepare('SELECT SUM(seconds) AS used FROM speech_budget').first()).used, 1);
    redirect = true;
    assert.equal((await post(2)).status, 200);
    assert.deepEqual(calls.slice(3), calls.slice(0, 3));
    assert.match(feedback[1], /yuklab bo‘lmadi/);
    assert.equal((await db.prepare('SELECT SUM(seconds) AS used FROM speech_budget').first()).used, 1);
  } finally {
    await mf.dispose();
  }
});

test('Telegram checks private voice notes against the active phrase without saving learner progress', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  const originalFetch = globalThis.fetch;
  try {
    await migrate(mf);
    const db = await mf.getD1Database('DB');
    const now = Date.now();
    const state = JSON.stringify({ base: 'uz', target: 'tr', courses: {} });
    await db.prepare('INSERT INTO learners (id,state_json,created_at,updated_at) VALUES (?,?,?,?)')
      .bind('learner', state, now, now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind('42', 'learner', 'Test', now, now).run();
    const calls = [], inference = [];
    let transcript, bytes = voiceBytes(1, 0), nextMessage = 10, filePath = 'voice/file_1';
    const downloads = [];
    const env = {
      DB: db, TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_WEBHOOK_SECRET: 'test',
      PUBLIC_APP_ORIGIN: 'https://aytim.test',
      AI: { run: async (model, input) => {
        inference.push({ model, input });
        return { text: transcript };
      } }
    };
    globalThis.fetch = async (url, options) => {
      if (!String(url).startsWith('https://api.telegram.org/')) return originalFetch(url, options);
      if (String(url).includes('/file/')) {
        assert.equal(options.redirect, 'manual');
        downloads.push(new URL(url).pathname);
        return new Response(bytes);
      }
      const method = new URL(url).pathname.split('/').pop();
      calls.push({ method, payload: JSON.parse(options.body) });
      return Response.json({ ok: true, result: method === 'getFile'
        ? { file_path: filePath } : { message_id: nextMessage++ } });
    };
    const chat = { id: 42, type: 'private' }, from = { id: 42 };
    let updateId = 1;
    const post = (update, id = updateId++) => botWebhook(new Request('https://aytim.test/api/telegram/webhook', {
      method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'test' },
      body: JSON.stringify({ update_id: id, ...update })
    }), env);
    const promptRow = () => db.prepare('SELECT * FROM bot_speaking_prompts WHERE telegram_id=?').bind('42').first();
    const speak = { message: { chat, from, text: '/speak' } };
    const voice = (promptId, extra = {}) => ({ message: {
      chat, from, message_id: 50, voice: { file_id: 'voice-id', duration: 1 },
      reply_to_message: { message_id: promptId }, ...extra
    } });

    const start = { callback_query: {
      from, id: 'start', data: navigationActions.speaking, message: { chat, message_id: 1 }
    } };
    assert.equal((await post(start)).status, 200);
    const first = await promptRow();
    assert.ok(path[0].units[0].phrases.some(entry => entry.id === first.entry_id));
    assert.ok(calls.at(-1).payload.text.includes(first.reference));
    assert.equal((await post(speak)).status, 200);
    const prompt = await promptRow();
    assert.notEqual(prompt.entry_id, first.entry_id);

    const beforeIgnored = calls.length;
    await post(voice(prompt.message_id, { chat: { id: 42, type: 'group' } }));
    await post(voice(prompt.message_id, { forward_origin: { type: 'user' } }));
    assert.equal(calls.length, beforeIgnored);
    for (const unrelated of [
      voice(first.message_id),
      voice(prompt.message_id, { chat: { id: 43, type: 'private' }, from: { id: 43 } }),
      voice(undefined, { reply_to_message: undefined, message_id: first.message_id }),
      voice(undefined, { reply_to_message: undefined, external_reply: {} })
    ]) {
      assert.equal((await post(unrelated)).status, 200);
      assert.match(calls.at(-1).payload.text, /yangi iborani oching/);
    }
    assert.equal(inference.length, 0);

    transcript = ' ' + prompt.reference + ' ';
    const answer = voice(prompt.message_id);
    const standalone = voice(undefined, { reply_to_message: undefined });
    const firstAnswer = updateId++;
    assert.equal((await post(standalone, firstAnswer)).status, 200);
    assert.deepEqual(downloads, ['/file/bottest/voice/file_1']);
    assert.match(calls.at(-1).payload.text, /Matn iboraga mos keldi/);
    assert.equal(calls.at(-1).payload.reply_parameters.message_id, 50);
    assert.equal(inference[0].model, whisperModel);
    assert.equal(inference[0].input.language, 'tr');
    assert.equal(inference[0].input.initial_prompt, undefined);
    assert.deepEqual(new Uint8Array(Buffer.from(inference[0].input.audio, 'base64')), bytes);
    await post(standalone, firstAnswer);
    assert.equal(inference.length, 1);

    transcript = 'başka bir cümle';
    await post(answer);
    assert.match(calls.at(-1).payload.text, /Matn iboraga mos kelmadi/);
    assert.match(calls.at(-1).payload.text, /başka bir cümle/);
    transcript = '';
    await post(answer);
    assert.match(calls.at(-1).payload.text, /So‘zlar eshitilmadi/);
    assert.equal(inference.length, 3);

    bytes = voiceBytes(16);
    await post(answer);
    assert.match(calls.at(-1).payload.text, /15 soniyagacha/);
    assert.equal(inference.length, 3);
    bytes = voiceBytes(1);
    const downloadCount = downloads.length;
    const oldWarn = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args);
    try {
      for (const unsafe of ['../../other.oga', 'voice/%2e%2e/other', 'https://example.com/voice.oga']) {
        filePath = unsafe;
        await post(answer);
        assert.match(calls.at(-1).payload.text, /yuklab bo‘lmadi/);
      }
      assert.equal(downloads.length, downloadCount);
      filePath = 'voice/file_1.oga';
      bytes = new Uint8Array(100);
      await post(answer);
      assert.match(calls.at(-1).payload.text, /formatini o‘qib bo‘lmadi/);
      assert.equal(warnings.length, 4);
      assert.doesNotMatch(JSON.stringify(warnings), /other|example.com|file_1|voice-id/);
    } finally {
      console.warn = oldWarn;
    }
    bytes = voiceBytes(1);
    filePath = 'voice/file_1.oga';
    env.SPEECH_WHISPER_SECONDS_PER_DAY = '3';
    await post(answer);
    assert.match(calls.at(-1).payload.text, /limiti tugadi/);
    assert.equal(inference.length, 3);
    assert.deepEqual(await db.prepare('SELECT revision,state_json FROM learners WHERE id=?').bind('learner').first(),
      { revision: 0, state_json: state });

    await db.prepare('UPDATE bot_speaking_prompts SET expires_at=0 WHERE telegram_id=?').bind('42').run();
    await post(standalone);
    assert.match(calls.at(-1).payload.text, /yangi iborani oching/);
    await post(speak);
    await db.prepare('UPDATE learners SET state_json=? WHERE id=?')
      .bind(JSON.stringify({ base: 'tr', target: 'uz', courses: {} }), 'learner').run();
    await post(speak);
    assert.match(calls.at(-1).payload.text, /O‘zbekcha gapirish mashqi Aytim ilovasida/);
    assert.ok(calls.at(-1).payload.reply_markup.inline_keyboard[0][0].web_app);
    await post(standalone);
    assert.match(calls.at(-1).payload.text, /yangi iborani oching/);
    assert.equal(inference.length, 3);
  } finally {
    globalThis.fetch = originalFetch;
    await mf.dispose();
  }
});
