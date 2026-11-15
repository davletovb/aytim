import { TelegramApiError } from './telegram-rich.mjs';

const leaseDuration = 60_000;
const receiptRetention = 7 * 86_400_000;

export async function receiveTelegramUpdate(db, updateId, processUpdate) {
  const now = Date.now(), lease = crypto.randomUUID();
  const claimed = await db.prepare(`
    INSERT INTO telegram_update_receipts (update_id,lease_id,lease_until) VALUES (?,?,?)
    ON CONFLICT(update_id) DO UPDATE SET lease_id=excluded.lease_id, lease_until=excluded.lease_until
    WHERE completed_at IS NULL AND lease_until<=?
    RETURNING lease_id
  `).bind(updateId, lease, now+leaseDuration, now).first();
  if (!claimed) {
    const receipt = await db.prepare('SELECT completed_at FROM telegram_update_receipts WHERE update_id=?')
      .bind(updateId).first();
    return receipt?.completed_at ? new Response('OK') : new Response('Retry later', { status: 503 });
  }

  try {
    if (updateId % 128 === 0) {
      await db.prepare(`
        DELETE FROM telegram_update_receipts WHERE update_id IN (
          SELECT update_id FROM telegram_update_receipts WHERE lease_until<? LIMIT 256
        )
      `).bind(now-receiptRetention).run();
    }
    const response = await processUpdate();
    await db.prepare('UPDATE telegram_update_receipts SET completed_at=? WHERE update_id=? AND lease_id=?')
      .bind(Date.now(), updateId, lease).run();
    return response;
  } catch (error) {
    console.warn('Telegram update needs retry', {
      updateId, ...(error instanceof TelegramApiError ? { api: error.message } : {})
    });
    await db.prepare('UPDATE telegram_update_receipts SET lease_until=? WHERE update_id=? AND lease_id=?')
      .bind(Date.now(), updateId, lease).run();
    return new Response('Retry later', { status: 503 });
  }
}
