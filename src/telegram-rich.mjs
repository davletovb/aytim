export class TelegramApiError extends Error {
  constructor(method, code, description = '') {
    super(`Telegram ${method} failed (${code})`);
    this.code = code;
    this.notModified = /message is not modified/i.test(description);
    this.callbackExpired = /query is too old|query id is invalid/i.test(description);
    this.widgetBlocked = /INPUT_MEDIA_WIDGET_NOT_ALLOWED/i.test(description);
  }
}

// Telegram entity offsets and lengths are measured in UTF-16 code units.
export function messageText(title, paragraphs = []) {
  let text = title;
  const entities = [{ type: 'bold', offset: 0, length: title.length }];
  for (const paragraph of paragraphs.filter(Boolean)) {
    const value = paragraph.text ?? paragraph;
    text += '\n\n';
    if (paragraph.bold === true) entities.push({ type: 'bold', offset: text.length, length: value.length });
    text += value;
  }
  return { text, entities };
}

export function learningCard(title, paragraphs, reply_markup) {
  return {
    ...messageText(title, paragraphs),
    reply_markup,
    blocks: [
      { type: 'heading', size: 4, text: title },
      ...paragraphs.filter(Boolean).map(paragraph => ({
        type: 'paragraph',
        text: paragraph.bold === true ? { type: 'bold', text: paragraph.text } : paragraph.text ?? paragraph
      }))
    ]
  };
}

// RichText accepts literal strings, so vocabulary never goes through a markup parser.
export function richCard(card) {
  return {
    skip_entity_detection: true,
    blocks: [
      ...card.blocks,
      ...(card.reply_markup?.inline_keyboard ?? []).map(buttons => ({ type: 'buttons', buttons }))
    ]
  };
}

export async function deliverLearningCard(env, call, chatId, card, {
  messageId, plain = false, alternative
} = {}) {
  const base = { chat_id: chatId, ...(messageId ? { message_id: messageId } : {}) };
  const fallback = {
    text: card.text,
    entities: card.entities,
    reply_markup: card.reply_markup
  };
  const editOrSend = (rich, payload) => call(env, messageId ? 'editMessageText' :
    rich ? 'sendRichMessage' : 'sendMessage', { ...base, ...payload });
  if (!plain && env.TELEGRAM_RICH_MESSAGES !== '0') {
    try {
      return await editOrSend(true, {
        rich_message: richCard(card),
        reply_markup: alternative ? { inline_keyboard: [[alternative]] } : card.reply_markup
      });
    } catch (error) {
      if (messageId && error.notModified) return null;
      if (![400, 404, 405, 422].includes(error.code)) throw error;
      console.warn('Telegram rejected a rich learning card', { code: error.code, edit: Boolean(messageId) });
    }
  }
  try {
    return await editOrSend(false, fallback);
  } catch (error) {
    if (messageId && error.notModified) return null;
    if (!messageId || error.code !== 400) throw error;
    return call(env, 'sendMessage', { chat_id: chatId, ...fallback });
  }
}
