import { test } from 'node:test';
import { readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { workerOptions, migrate } from './worker-helper.mjs';

test('D1 review-commit trigger marks one session atomically and rejects a replay',async()=>{
  const mf = new Miniflare(convertV4MiniflareOptions(workerOptions));
  try {
    await migrate(mf);
    const db=await mf.getD1Database('DB');
    const now=Date.now(),learnerId='review-unit-1',telegramId='314159';
    await db.prepare('INSERT INTO learners (id,created_at,updated_at) VALUES (?,?,?)')
      .bind(learnerId,now,now).run();
    await db.prepare('INSERT INTO telegram_accounts (telegram_id,learner_id,display_name,created_at,last_login_at) VALUES (?,?,?,?,?)')
      .bind(telegramId,learnerId,'Review unit test',now,now).run();
    const round=JSON.stringify({entries:['word-people-1'],stages:[{kind:'choice'}]});
    const create = async id => db.prepare('INSERT INTO bot_review_sessions '+
      '(id,telegram_id,learner_id,pair,round_json,cursor,created_at,expires_at) VALUES (?,?,?,?,?,1,?,?)')
      .bind(id,telegramId,learnerId,'uz>ar',round,now,now+100000).run();
    await create('first-session');
    await assert.rejects(create('overlapping-session'),/UNIQUE constraint failed/,
      'the partial index prevents two active graded rounds for one Telegram user');
    const save = async(id,revision)=>db.prepare(
      'UPDATE learners SET revision=revision+1, updated_at=?,last_bot_review_session_id=? '+
      'WHERE id=? AND revision=? AND EXISTS ('+
      'SELECT 1 FROM bot_review_sessions WHERE id=? AND learner_id=learners.id '+
      'AND committed_at IS NULL AND expires_at>? AND cursor=json_array_length(json_extract(round_json,\'$.stages\'))'+
      ') RETURNING revision'
    ).bind(now,id,learnerId,revision,id,now).first();
    assert.equal((await save('first-session',0)).revision,1);
    assert.equal((await db.prepare('SELECT committed_at FROM bot_review_sessions WHERE id=?')
      .bind('first-session').first()).committed_at,now);
    assert.equal(await save('first-session',1),null,'a completed session cannot be written twice');
    assert.equal((await db.prepare('SELECT revision FROM learners WHERE id=?').bind(learnerId).first()).revision,1);
    await create('second-session');
    assert.equal(await save('second-session',0),null,'stale Mini App revision rejected');
    assert.equal((await db.prepare('SELECT committed_at FROM bot_review_sessions WHERE id=?')
      .bind('second-session').first()).committed_at,null);
    assert.equal((await save('second-session',1)).revision,2);
    assert.equal((await db.prepare('SELECT committed_at FROM bot_review_sessions WHERE id=?')
      .bind('second-session').first()).committed_at,now);
  } finally {await mf.dispose();}
});

test('the graded-review migration follows the production speech-budget migration',async()=>{
  const names=(await readdir(new URL('../migrations/',import.meta.url))).sort();
  assert.ok(names.includes('0005_speech_budget.sql'));
  assert.ok(names.includes('0006_bot_review.sql'));
  assert.ok(!names.includes('0004_bot_review.sql'));
  assert.ok(names.indexOf('0006_bot_review.sql')>names.indexOf('0005_speech_budget.sql'));
});
