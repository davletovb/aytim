import { newCourse, pairKey, shuffled, validPair } from '../dist/engine.mjs';
import { accessibleLevel, path } from '../dist/journey.mjs';
import { appKeyboard, chatLabels, chatLanguage, homeButton, miniAppButton, navigationActions, primaryButton } from './telegram-navigation.mjs';
import { deliverLearningCard, learningCard, messageText } from './telegram-rich.mjs';

// Each short story uses one existing comprehension question. The remaining
// indices point to the sentences that support its answer in all six languages.
const storyQuestions = {
  chairs: [2, 1, 2, 3],
  'blue-cup': [1, 1],
  'red-notebook': [3, 3, 5],
  walk: [1, 3],
  riverside: [2, 2, 3],
  'quiet-evening': [2, 3],
  rain: [1, 1, 2],
  gift: [1, 2],
  soup: [1, 2, 3],
  'last-loaf': [2, 2],
  'shared-dinner': [0, 1],
  'library-card': [2, 3],
  'pharmacy-queue': [2, 4],
  'new-meeting-time': [2, 2, 3, 4],
  platform: [1, 2, 4],
  'missed-coach': [2, 3],
  'baggage-report': [1, 1],
  keys: [1, 2, 3],
  'route-home': [1, 1, 3],
  'rain-barrel': [2, 2, 3],
  'old-photo': [3, 1, 3, 5],
  'leaking-tap': [1, 2],
  'mistake-notebook': [2, 2, 3],
  'clear-request': [2, 4],
  team: [2, 3, 4],
  'shelf-pilot': [2, 4, 5],
  'meeting-notes': [2, 1, 3],
  'survey-decision': [2, 1, 2, 3]
};

const catalog = new Map(path.flatMap(level => level.stories)
  .filter(story => Object.hasOwn(storyQuestions, story.id))
  .map(story => [story.id, story]));
const lifetime = 30 * 60 * 1000;
const expired = 'Hikoya eskirgan. Qisqa hikoyalar bo‘limidan yangisini oching.';
const letters = ['A', 'B', 'C'];
const button = (text, id, action) => ({ text, callback_data: 'story:' + id + ':' + action });

function renderStory(env, story, session, note = false) {
  const [base, target] = session.pair.split('>');
  const [questionIndex, ...evidence] = storyQuestions[story.id];
  const { prompt, choices } = story.questions[questionIndex];
  const answers = JSON.parse(session.option_order);
  const correct = choices[0][base];
  const paragraphs = [
    chatLabels.stories + ' · ' + chatLanguage(target) + ' · ' + story.level + '-daraja',
    story.lines.map(line => line.text[target]).join('\n'),
    { text: prompt[base], bold: true }
  ];
  let keyboard;
  if (session.selected_index == null) {
    paragraphs.push(answers.map((choice, index) => letters[index] + '. ' + choices[choice][base]).join('\n'));
    keyboard = [letters.map((letter, index) => button(letter, session.id, index)), [homeButton]];
  } else {
    const selected = answers[session.selected_index];
    paragraphs.push(selected === 0
      ? '✓ To‘g‘ri! ' + correct
      : '✗ Sizning javobingiz: ' + choices[selected][base] + '\nTo‘g‘ri javob: ' + correct);
    if (note) paragraphs.push('Hikoyadan\n' + evidence.map(index => {
      const line = story.lines[index].text;
      return line[target] + '\n' + line[base];
    }).join('\n\n'));
    keyboard = [
      [primaryButton({ text: 'Keyingi hikoya', callback_data: navigationActions.stories })],
      note ? [homeButton] : [button('Nega?', session.id, 'why'), homeButton]
    ];
  }
  const app = miniAppButton(env, 'Hikoyani ilovada ochish', 'story:' + story.id);
  if (app) keyboard.push([app]);
  return learningCard(story.title[target], paragraphs, { inline_keyboard: keyboard });
}

async function deliverStory(env, call, session, story, { plain = false, note = false } = {}) {
  const sent = await deliverLearningCard(env, call, session.telegram_id, renderStory(env, story, session, note), {
    messageId: session.message_id, plain,
    alternative: button('Oddiy tugmalar', session.id, note ? 'plain-note' : 'plain')
  });
  if (sent?.message_id && sent.message_id !== session.message_id)
    await env.DB.prepare('UPDATE bot_story_sessions SET message_id=? WHERE id=? AND message_id IS ?')
      .bind(sent.message_id, session.id, session.message_id).run();
}

export async function startStory(env, call, telegramId, learner, state) {
  if (!validPair(state?.base, state?.target))
    return call(env, 'sendMessage', {
      chat_id: telegramId, ...messageText(chatLabels.stories, ['Avval Aytim ilovasida til yo‘nalishini tanlang.']),
      reply_markup: appKeyboard(env)
    });
  const pair = pairKey(state.base, state.target);
  const level = accessibleLevel(state.courses?.[pair] ?? newCourse());
  const pool = path[level - 1].stories.filter(story => catalog.has(story.id));
  if (!pool.length) return call(env, 'sendMessage', {
    chat_id: telegramId, ...messageText(chatLabels.stories, ['Hikoyalarni Aytim ilovasida oching.']),
    reply_markup: appKeyboard(env, 'stories')
  });
  const last = await env.DB.prepare(
    'SELECT story_id FROM bot_story_sessions WHERE telegram_id=? AND pair=? AND message_id IS NOT NULL ' +
    'ORDER BY created_at DESC, message_id DESC LIMIT 1'
  ).bind(telegramId, pair).first();
  const previous = pool.findIndex(story => story.id === last?.story_id);
  const story = pool[(previous + 1) % pool.length];
  const now = Date.now();
  const session = {
    id: crypto.randomUUID(), telegram_id: telegramId, pair, story_id: story.id, message_id: null,
    option_order: JSON.stringify(shuffled([0, 1, 2]))
  };
  await env.DB.batch([
    env.DB.prepare('DELETE FROM bot_story_sessions WHERE id IN (' +
      'SELECT id FROM bot_story_sessions WHERE expires_at<? LIMIT 20)').bind(now),
    env.DB.prepare(`INSERT INTO bot_story_sessions
      (id,telegram_id,learner_id,pair,story_id,option_order,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?)`)
      .bind(session.id, telegramId, learner.id, pair, story.id, session.option_order, now, now + lifetime)
  ]);
  await deliverStory(env, call, session, story);
}

export async function storyCallback(env, call, telegramId, query) {
  const match = /^story:([a-f0-9-]{36}):([0-2]|why|plain|plain-note)$/.exec(query.data ?? '');
  if (!match) return false;
  const [, id, action] = match;
  const now = Date.now();
  const session = await env.DB.prepare(`
    SELECT s.*, l.state_json FROM bot_story_sessions s
    JOIN telegram_accounts a ON a.telegram_id=s.telegram_id AND a.learner_id=s.learner_id
    JOIN learners l ON l.id=s.learner_id
    WHERE s.id=? AND s.telegram_id=? AND s.message_id=? AND s.expires_at>?
  `).bind(id, telegramId, query.message.message_id, now).first();
  const state = JSON.parse(session?.state_json ?? 'null');
  const story = catalog.get(session?.story_id);
  if (!story || session.pair !== pairKey(state?.base, state?.target) ||
      story.level > accessibleLevel(state.courses?.[session.pair] ?? newCourse())) {
    await call(env, 'answerCallbackQuery', { callback_query_id: query.id, text: expired });
    return true;
  }
  const note = action === 'why' || action === 'plain-note';
  if (note && session.selected_index == null) {
    await call(env, 'answerCallbackQuery', { callback_query_id: query.id, text: 'Avval javobni tanlang.' });
    return true;
  }
  if (!note && action !== 'plain') {
    const result = await env.DB.prepare(`
      UPDATE bot_story_sessions SET selected_index=COALESCE(selected_index,?)
      WHERE id=? AND telegram_id=? AND message_id=? AND expires_at>?
      RETURNING selected_index
    `).bind(Number(action), id, telegramId, session.message_id, now).first();
    if (!result) {
      await call(env, 'answerCallbackQuery', { callback_query_id: query.id, text: expired });
      return true;
    }
    session.selected_index = result.selected_index;
  }
  await call(env, 'answerCallbackQuery', { callback_query_id: query.id });
  await deliverStory(env, call, session, story, {
    plain: action.startsWith('plain') || !query.message.rich_message, note
  });
  return true;
}
