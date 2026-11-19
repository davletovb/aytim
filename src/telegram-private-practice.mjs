import { newCourse, pairKey, shuffled, validPair } from '../dist/engine.mjs';
import { accessibleLevel, lessonUnlocked, needsSupport, orderedUnits } from '../dist/journey.mjs';
import { gapCandidates, practiceQuestion, writingQuestion } from '../dist/practice.mjs';
import { tileWords, wordBankAlternatives, wordBankMatches, wordBankSelection } from '../dist/word-bank.mjs';
import { dialogueExercise, dialogueScenes } from './telegram-dialogues.mjs';
import { appKeyboard, chatLabel, homeButton, languageDirection, navigationButton, primaryButton } from './telegram-navigation.mjs';
import { chatBase, chatText as t } from './telegram-copy.mjs';
import { arabicAddressContext } from '../dist/arabic-address.mjs';
import { feminineForms } from '../dist/speaker-forms.mjs';
import { deliverLearningCard, learningCard } from './telegram-rich.mjs';

const kinds = ['build', 'gap', 'dialogue'];
const lifetime = 30 * 60_000;
const retention = 30 * 86_400_000;
const maxTiles = 10;
const unitById = new Map(orderedUnits.map(unit => [unit.id, unit]));
const menu = base => ({ inline_keyboard: [...kinds.map(kind => [navigationButton(kind, base)]),
  [navigationButton('focus', base)], [homeButton(base)]] });

function forSpeaker(entry, speaker) {
  if (speaker !== 'f' || !entry) return entry;
  const forms = feminineForms[entry.id];
  if (!forms) return entry;
  const text = { ...entry.text };
  for (const [code, value] of Object.entries(forms)) {
    if (code !== 'romanization') text[code] = value;
  }
  return { ...entry, text, ...(forms.romanization ? { romanization: forms.romanization } : {}) };
}

function unitForSpeaker(unit, speaker) {
  return speaker === 'f' ? { ...unit, phrases: unit.phrases.map(entry => forSpeaker(entry, speaker)) } : unit;
}

export function privatePracticeMenu(env, call, id, message, base) {
  const card = learningCard(chatLabel('skills', base), [], menu(base));
  return deliverLearningCard(env, call, id, card, { messageId: message?.text && message.message_id, plain: true });
}

function candidates(kind, course, target, speaker = 'm') {
  return orderedUnits.filter(unit => lessonUnlocked(course, unit)).flatMap(rawUnit => {
    const unit = unitForSpeaker(rawUnit, speaker);
    if (kind === 'dialogue') return dialogueScenes[unit.id] ? [{ unit }] : [];
    const entries = kind === 'gap' ? gapCandidates(unit.phrases, target) : unit.phrases;
    return entries.flatMap(entry => {
      const tiles = tileWords(entry.text[target], target);
      if (tiles.length < 2 || tiles.length > maxTiles) return [];
      if (kind === 'build' && !wordBankAlternatives(entry, target, tiles).length) return [];
      return [{ unit, entry }];
    });
  });
}

function exerciseFor(kind, unit, entry, base, target, random, speaker = 'm') {
  if (kind === 'build') {
    const address = target === 'ar' ? arabicAddressContext(entry, base) : '';
    return {
      prompt: entry.text[base] + (address ? ' (' + address + ')' : ''), answer: entry.text[target],
      bank: writingQuestion(unit, entry, base, target, random).wordBank
    };
  }
  if (kind === 'gap') {
    const q = practiceQuestion('gap', entry, 0, base, target, random, unit.phrases);
    if (q.options.length < 2) return null;
    return {
      prompt: q.gap.before + '____' + q.gap.after, answer: entry.text[target],
      options: q.options.map(option => option.text[target]),
      correct: q.options.findIndex(option => option.id === q.entry.id)
    };
  }
  return dialogueExercise(unit, target, random, base, speaker);
}

// Look for repeated recent misses within one skill. Earlier isolated mistakes
// do not keep influencing the recommendation after the learner improves.
function weakSkill(recent) {
  return kinds.map(kind => {
    const sample = recent.filter(row => row.kind === kind).slice(0, 5);
    const misses = sample.filter(row => row.correct === 0);
    return { kind, misses, ratio: misses.length / (sample.length || 1) };
  }).filter(item => item.misses.length >= 2 && item.ratio >= 0.5)
    .sort((a, b) => b.ratio - a.ratio || b.misses.length - a.misses.length)[0];
}

export function createPrivateExercise(requested, course, base, target, recent = [], random = Math.random, speaker = 'm') {
  const level = accessibleLevel(course);
  const weak = requested === 'focus' ? weakSkill(recent) : null;
  const kind = requested === 'focus' ? weak?.kind ?? (needsSupport(course, 'recognition') ? 'gap' : 'build') : requested;
  const last = recent.find(row => row.kind === kind);
  const weakUnits = new Set(weak?.misses.map(row => row.unit_id));
  const pool = shuffled(candidates(kind, course, target, speaker), random).sort((a, b) =>
    Number(weakUnits.has(b.unit.id)) - Number(weakUnits.has(a.unit.id)) ||
    Math.abs(level - a.unit.level) - Math.abs(level - b.unit.level) ||
    Number(a.unit.id === last?.unit_id) - Number(b.unit.id === last?.unit_id));
  for (const { unit, entry } of pool) {
    const exercise = exerciseFor(kind, unit, entry, base, target, random, speaker);
    if (exercise) return { kind, unit, exercise, targeted: Boolean(weak) };
  }
  return null;
}

function renderCard(row) {
  const [base, target] = row.pair.split('>');
  const item = JSON.parse(row.exercise_json);
  const state = JSON.parse(row.state_json);
  const title = chatLabel(row.kind, base);
  const context = languageDirection(base, target, base);
  const button = (text, action) => ({ text, callback_data: 'pp:' + row.id + ':' + row.version + ':' + action });
  const other = [navigationButton('skills', base), homeButton(base)];
  const keyboard = [];
  const paragraphs = [context, item.targeted && t(base, 'targeted') + ' · ' + unitById.get(row.unit_id).title[base]];
  if (row.kind === 'dialogue') {
    if (state.lines?.length) paragraphs.push(state.lines.map(line => '— ' + line).join('\n'));
    if (row.completed_at) paragraphs.push(t(base, 'dialogueDone'));
    else {
      const turn = item.turns[state.turn ?? 'start'];
      if (turn.cue) paragraphs.push({ text: turn.cue, bold: true });
      paragraphs.push(turn.goal);
      if (state.wrong) paragraphs.push(t(base, 'dialogueWrong', { answer: state.wrong }));
      keyboard.push(...turn.options.map((option, index) => [button(option.text, 'pick' + index)]));
    }
  } else {
    paragraphs.push({ text: item.prompt, bold: true });
    if (row.completed_at) {
      paragraphs.push(row.correct ? '✓ ' + t(base, 'correct') : '✗ ' + t(base, 'yourAnswer', { answer: state.answer }),
        t(base, 'sample', { answer: item.answer }));
    } else if (row.kind === 'build') {
      const selected = state.selected ?? [];
      paragraphs.push(t(base, 'orderWords'), wordBankSelection(item.bank, selected)
        .map(word => word.text).join(' ') || '…');
      const tray = item.bank.tray.filter(tile => !selected.includes(tile.id));
      for (let index = 0; index < tray.length;) {
        const size = tray[index].text.length <= 12 && tray[index + 1]?.text.length <= 12 ? 2 : 1;
        keyboard.push(tray.slice(index, index + size).map(tile => button(tile.text, 'tile' + tile.id)));
        index += size;
      }
      if (selected.length) keyboard.push([button(t(base, 'undoWord'), 'undo')]);
      if (selected.length >= 2) keyboard.push([primaryButton(button(t(base, 'checkAnswer'), 'check'))]);
    } else {
      paragraphs.push(t(base, 'chooseGap'));
      keyboard.push(...item.options.map((option, index) => [button(option, 'pick' + index)]));
    }
  }
  if (row.completed_at) {
    if (!row.correct) keyboard.push([primaryButton(navigationButton('focus', base))]);
    keyboard.push([navigationButton(row.kind, base, t(base, 'again'))]);
  }
  keyboard.push(other);
  return learningCard(title, paragraphs, { inline_keyboard: keyboard });
}

async function showPractice(env, call, id, row) {
  const sent = await deliverLearningCard(env, call, id, renderCard(row), { messageId: row.message_id, plain: true });
  if (sent?.message_id && sent.message_id !== row.message_id) await env.DB.prepare(
    'UPDATE bot_private_practice SET message_id=? WHERE id=? AND message_id IS ? AND version=?'
  ).bind(sent.message_id, row.id, row.message_id, row.version).run();
}

export async function startPrivatePractice(env, call, id, learner, saved, requested) {
  const { base, target } = saved ?? {};
  if (!validPair(base, target)) return deliverLearningCard(env, call, id, learningCard(chatLabel('skills', base),
    [t(base, 'choosePair')], appKeyboard(env, undefined, base)), { plain: true });
  const now = Date.now();
  const pair = pairKey(base, target), course = saved.courses?.[pair] ?? newCourse();
  const { results: recent } = await env.DB.prepare(`
    SELECT kind,unit_id,correct FROM bot_private_practice
    WHERE telegram_id=? AND learner_id=? AND pair=? AND completed_at>=?
    ORDER BY completed_at DESC, rowid DESC LIMIT 30
  `).bind(id, learner.id, pair, now - retention).all();
  const speaker = saved.speaker === 'f' ? 'f' : 'm';
  const chosen = createPrivateExercise(requested, course, base, target, recent, Math.random, speaker);
  const resumeLesson = appKeyboard(env, 'lesson', base);
  if (!chosen) return deliverLearningCard(env, call, id, learningCard(chatLabel('skills', base),
    [t(base, 'practiceLocked')],
    { inline_keyboard: [...(resumeLesson?.inline_keyboard ?? []), ...menu(base).inline_keyboard] }), { plain: true });
  const row = {
    id: crypto.randomUUID().replaceAll('-', '').slice(0, 20), pair, kind: chosen.kind,
    unit_id: chosen.unit.id, exercise_json: JSON.stringify({ ...chosen.exercise, targeted: chosen.targeted }),
    state_json: '{}', version: 0, message_id: null
  };
  await env.DB.batch([
    env.DB.prepare('DELETE FROM bot_private_practice WHERE id IN (' +
      'SELECT id FROM bot_private_practice WHERE expires_at<? AND (completed_at IS NULL OR completed_at<?) LIMIT 32)')
      .bind(now, now - retention),
    env.DB.prepare(`INSERT INTO bot_private_practice
      (id,telegram_id,learner_id,pair,kind,unit_id,exercise_json,expires_at) VALUES (?,?,?,?,?,?,?,?)`)
      .bind(row.id, id, learner.id, pair, row.kind, row.unit_id, row.exercise_json, now + lifetime)
  ]);
  await showPractice(env, call, id, row);
}

function advance(row, action) {
  const item = JSON.parse(row.exercise_json), state = JSON.parse(row.state_json);
  if (row.kind === 'build') {
    const selected = state.selected ?? [];
    const id = action.slice(4);
    if (action.startsWith('tile') && item.bank.tray.some(tile => tile.id === id) && !selected.includes(id)) {
      return { state: { selected: [...selected, id] } };
    }
    if (action === 'undo' && selected.length) return { state: { selected: selected.slice(0, -1) } };
    if (action !== 'check' || selected.length < 2) return null;
    return { state: { answer: wordBankSelection(item.bank, selected).map(tile => tile.text).join(' ') },
      correct: wordBankMatches(item.bank, selected) };
  }
  if (!action.startsWith('pick')) return null;
  const index = Number(action.slice(4));
  if (row.kind === 'gap') {
    if (!item.options[index]) return null;
    return { state: { answer: item.options[index] }, correct: item.correct === index };
  }
  const turn = item.turns[state.turn ?? 'start'];
  const option = turn.options[index];
  if (!option) return null;
  if (!option.next) return { state: { ...state, wrong: option.text, missed: true } };
  const lines = [...(state.lines ?? []), ...(turn.cue ? [turn.cue] : []), option.text,
    ...(option.next === 'done' && turn.closing ? [turn.closing] : [])];
  return { state: { turn: option.next, lines, missed: state.missed }, correct: option.next === 'done' ? !state.missed : undefined };
}

export async function privatePracticeCallback(env, call, id, query) {
  const match = /^pp:([a-f0-9]{20}):(\d{1,6}):(tile(?:\d|x[01])|pick[0-3]|undo|check)$/.exec(query.data ?? '');
  if (!match) return false;
  const [, session, version, action] = match;
  const now = Date.now(), messageId = query.message.message_id;
  const row = await env.DB.prepare(`
    SELECT p.*,l.state_json AS learner_state,l.revision AS learner_revision FROM bot_private_practice p
    JOIN telegram_accounts a ON a.telegram_id=p.telegram_id AND a.learner_id=p.learner_id
    JOIN learners l ON l.id=a.learner_id
    WHERE p.id=? AND p.telegram_id=? AND p.message_id=? AND p.expires_at>?
  `).bind(session, id, messageId, now).first();
  const saved = JSON.parse(row?.learner_state ?? 'null');
  if (!row || row.pair !== pairKey(saved?.base, saved?.target) ||
      !lessonUnlocked(saved.courses?.[row.pair] ?? newCourse(), unitById.get(row.unit_id))) {
    await call(env, 'answerCallbackQuery', { callback_query_id: query.id, text: t(chatBase(saved?.base, query.from?.language_code), 'practiceExpired') });
    return true;
  }
  await call(env, 'answerCallbackQuery', { callback_query_id: query.id });
  if (row.version !== Number(version) || row.completed_at) {
    await showPractice(env, call, id, row);
    return true;
  }
  const next = advance(row, action);
  if (!next) return true;
  const changed = await env.DB.prepare(`
    UPDATE bot_private_practice SET state_json=?,version=version+1,correct=?,completed_at=?
    WHERE id=? AND message_id=? AND version=? AND completed_at IS NULL AND expires_at>? AND EXISTS (
      SELECT 1 FROM telegram_accounts a JOIN learners l ON l.id=a.learner_id
      WHERE a.telegram_id=? AND a.learner_id=bot_private_practice.learner_id AND l.revision=?
    ) RETURNING *
  `).bind(JSON.stringify(next.state), next.correct == null ? null : Number(next.correct),
    next.correct == null ? null : now, session, messageId, row.version, now, id, row.learner_revision).first();
  if (changed) await showPractice(env, call, id, changed);
  return true;
}
