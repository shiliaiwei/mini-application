import { processTelegramUpdate } from "../src/lib/bot/engine";
import { TelegramUpdate } from "../src/lib/bot/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function pollUpdates() {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing in environment variables.");
    process.exit(1);
  }

  console.log("SHILIAIWEI Telegram Bot Poller active. Listening for updates from @shiliaiweibot...");
  let offset = 0;

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result as TelegramUpdate[]) {
          offset = update.update_id + 1;
          console.log(`Processing update ID: ${update.update_id}...`);
          await processTelegramUpdate(update);
        }
      }
    } catch (err) {
      console.error("Poller error:", err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

pollUpdates();
