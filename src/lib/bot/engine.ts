import { TelegramUpdate, ManagedBot } from "./types";
import * as db from "./db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramApi(method: string, payload: Record<string, unknown>) {
  if (!BOT_TOKEN) return { ok: false, description: "TELEGRAM_BOT_TOKEN missing" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, description: msg };
  }
}

export async function sendMessage(chatId: number, text: string, replyMarkup?: unknown) {
  return sendTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: replyMarkup,
  });
}

export async function answerInlineQuery(inlineQueryId: string, results: unknown[]) {
  return sendTelegramApi("answerInlineQuery", {
    inline_query_id: inlineQueryId,
    results,
    cache_time: 10,
  });
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://app.kesararamwithdigital.tech";
}

// Interactive Welcome & App Description Menu
export async function sendStartMenu(chatId: number, firstName?: string) {
  const appUrl = getAppUrl();
  const greeting = firstName ? `Hello, ${firstName}!` : "Welcome!";

  const welcomeText = `*${greeting} Welcome to SHILIAIWEI (សិលាអាយវ៉ី)*

*What this app is used for:*
SHILIAIWEI is an all-in-one Web3 Mini App and Tap-to-Earn gaming vault built natively inside Telegram.

*Core Features:*
- *Tap Vault & Multi-Currency:* Earn PTS points and manage live balances across USD, KHR (Riel), TON, and SHI tokens.
- *6 Interactive Mini-Games:* Play Lucky Wheel, Word Flash, Guess Faster, Row 5 Gomoku, Number Match, and Flip Cards to win daily point rewards.
- *33 Verified Institutional Partners:* Explore official Cambodian ministries and institutions, access public digital services, and claim rewards.
- *Live Leaderboard & Claims:* Compete nationwide with real-time player claims and earn hourly bonuses.

Tap the button below to open the app:`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Open App / បើកកម្មវិធី",
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: "About App",
          callback_data: "menu_about",
        },
        {
          text: "How to Earn PTS",
          callback_data: "menu_earn",
        },
      ],
      [
        {
          text: "Institutional Partners",
          callback_data: "menu_partners",
        },
        {
          text: "Bot Commands",
          callback_data: "menu_help",
        },
      ],
    ],
  };

  // Configure chat menu button
  try {
    await sendTelegramApi("setChatMenuButton", {
      chat_id: chatId,
      menu_button: {
        type: "web_app",
        text: "Open App",
        web_app: { url: appUrl },
      },
    });
  } catch {}

  return sendMessage(chatId, welcomeText, replyMarkup);
}

export async function sendAboutDetails(chatId: number) {
  const appUrl = getAppUrl();
  const text = `*About SHILIAIWEI Mini App*

SHILIAIWEI is a high-performance Web3 Mini App and Tap-to-Earn gaming ecosystem on Telegram.

*Technology:*
- Built with Next.js 16, React 19, and Tailwind CSS.
- Real-time data persistence with Neon PostgreSQL and Telegram WebApp integration.
- Liquid glass aesthetic with responsive auto-fitting and dual-language support (Khmer and English).

*Mission:*
To provide a smooth, engaging platform combining digital multi-currency asset tracking, casual mini-games, and access to verified Cambodian public sector services.

Direct WebApp Link: ${appUrl}`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Launch App Now",
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: "How to Earn",
          callback_data: "menu_earn",
        },
        {
          text: "Back to Menu",
          callback_data: "menu_start",
        },
      ],
    ],
  };

  return sendMessage(chatId, text, replyMarkup);
}

export async function sendEarnDetails(chatId: number) {
  const appUrl = getAppUrl();
  const text = `*How to Earn PTS & Rewards in SHILIAIWEI:*

1. *Tap Vault:*
   Tap the central vault on the home screen to harvest PTS continuously. Upgrade your tier to increase tap capacity.

2. *Interactive Mini-Games:*
   - *Daily Spin Wheel:* Test your luck to win high-multiplier PTS payouts.
   - *Word Flash:* Fast reflex word recognition game.
   - *Guess Faster:* Rapid quiz game testing speed and knowledge.
   - *Row 5 Gomoku:* Classic tactical 5-in-a-row board challenge.
   - *Number Match:* Pattern matching logic game.
   - *Flip Card:* Memory matching challenge with bonus rounds.

3. *Institutional Services:*
   Explore any of the 33 verified Cambodian ministry pages in the app and claim +100 to +300 PTS per verified public service.

4. *Daily Check-ins & Streaks:*
   Log in daily to claim escalating streak multipliers.`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Start Earning (Open App)",
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: "Institutional Partners",
          callback_data: "menu_partners",
        },
        {
          text: "Back to Menu",
          callback_data: "menu_start",
        },
      ],
    ],
  };

  return sendMessage(chatId, text, replyMarkup);
}

export async function sendPartnersDetails(chatId: number) {
  const appUrl = getAppUrl();
  const text = `*Verified Institutional Partners:*

SHILIAIWEI features 33 official Cambodian ministries, government bodies, and public institutions, including:
- Ministry of Public Works and Transport
- Ministry of Economy and Finance
- National Bank of Cambodia
- Ministry of Interior
- Ministry of Education, Youth and Sport
- Ministry of Health
- ...and 27 additional verified national institutions.

Each partner card displays the official emblem, full titles in Khmer and English, and links to official public e-services where users earn PTS rewards for exploring national digital infrastructure.`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Explore Partners in App",
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: "Back to Menu",
          callback_data: "menu_start",
        },
      ],
    ],
  };

  return sendMessage(chatId, text, replyMarkup);
}

export async function sendHelpMenu(chatId: number) {
  const appUrl = getAppUrl();
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Open App / បើកកម្មវិធី",
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: "Back to Menu",
          callback_data: "menu_start",
        },
      ],
    ],
  };

  return sendMessage(chatId, HELP_TEXT, replyMarkup);
}

// Help Menu
export const HELP_TEXT = `*SHILIAIWEI Bot Manager (Official BotFather-Standard)*

*Bot Management:*
/newbot - Create a new bot
/mybots - Edit your existing bots
/deletebot - Delete a bot

*Edit Bot Profile:*
/setname - Change a bot's display name
/setdescription - Change bot description text
/setabouttext - Change bot about information
/setuserpic - Change bot profile photo
/setcommands - Change the list of bot commands

*Bot Security & Settings:*
/token - View authorization token
/revoke - Revoke and generate a new token
/setinline - Toggle inline mode
/setinlinegeo - Toggle inline location requests
/setinlinefeedback - Change inline feedback probability
/setjoingroups - Allow or disallow adding bot to groups
/setprivacy - Toggle group privacy mode

*Web Apps Management:*
/newapp - Create a new Web App
/myapps - View and manage your Web Apps
/listapps - List all active Web Apps
/editapp - Edit a Web App URL or title
/deleteapp - Delete a Web App

*Games Management:*
/newgame - Create a new HTML5 game
/mygames - View and manage your games
/listgames - List all active games
/editgame - Edit game information
/deletegame - Delete a game

/cancel - Cancel current active command`;

// Main Update Processing Engine
export async function processTelegramUpdate(update: TelegramUpdate) {
  // Handle Inline Queries
  if (update.inline_query) {
    const iq = update.inline_query;
    return answerInlineQuery(iq.id, [
      {
        type: "article",
        id: "shi_vault",
        title: "SHILIAIWEI Crypto & Dollar Vault",
        description: "Open the SHILIAIWEI Multi-Currency Wallet & Tap-to-Earn Vault",
        input_message_content: {
          message_text: `*SHILIAIWEI Crypto & Dollar Vault*\nLaunch WebApp: ${process.env.NEXT_PUBLIC_APP_URL || "https://app.kesararamwithdigital.tech"}`,
          parse_mode: "Markdown",
        },
      },
    ]);
  }

  // Handle Callback Queries (from inline buttons)
  if (update.callback_query) {
    const cq = update.callback_query;
    const data = cq.data || "";
    const userId = cq.from.id;
    const chatId = cq.message?.chat.id || userId;

    await sendTelegramApi("answerCallbackQuery", { callback_query_id: cq.id });

    if (data === "menu_start") {
      return sendStartMenu(chatId, cq.from.first_name);
    }
    if (data === "menu_about") {
      return sendAboutDetails(chatId);
    }
    if (data === "menu_earn") {
      return sendEarnDetails(chatId);
    }
    if (data === "menu_partners") {
      return sendPartnersDetails(chatId);
    }
    if (data === "menu_help") {
      return sendHelpMenu(chatId);
    }

    if (data.startsWith("bot_select:")) {
      const parts = data.split(":");
      const targetAction = parts[1];
      const botId = parseInt(parts[2], 10);
      const bot = await db.getBotById(botId);

      if (!bot) {
        return sendMessage(chatId, "Bot not found.");
      }

      if (targetAction === "info") {
        return sendBotDetails(chatId, bot);
      } else if (targetAction === "token") {
        return sendMessage(chatId, `*Token for @${bot.username}:*\n\`${bot.token}\`\n\nKeep this token secure!`);
      } else if (targetAction === "revoke") {
        const newToken = await db.revokeBotToken(bot.id);
        return sendMessage(chatId, `Token revoked! New token for @${bot.username}:\n\`${newToken}\``);
      } else if (targetAction === "delete") {
        await db.deleteManagedBot(bot.id);
        return sendMessage(chatId, `Bot @${bot.username} has been deleted successfully.`);
      } else if (targetAction === "toggle_inline") {
        const nextVal = !bot.inline_enabled;
        await db.updateBotField(bot.id, "inline_enabled", nextVal);
        return sendMessage(chatId, `Inline mode for @${bot.username} is now *${nextVal ? "ENABLED" : "DISABLED"}*.`);
      } else if (targetAction === "toggle_privacy") {
        const nextVal = !bot.privacy_mode;
        await db.updateBotField(bot.id, "privacy_mode", nextVal);
        return sendMessage(chatId, `Group privacy mode for @${bot.username} is now *${nextVal ? "ENABLED" : "DISABLED"}*.`);
      } else if (targetAction === "toggle_groups") {
        const nextVal = !bot.join_groups;
        await db.updateBotField(bot.id, "join_groups", nextVal);
        return sendMessage(chatId, `Group joining for @${bot.username} is now *${nextVal ? "ENABLED" : "DISABLED"}*.`);
      } else {
        await db.setConversationState(userId, targetAction, 2, { bot_id: bot.id, bot_name: bot.name, username: bot.username });
        return sendPromptForAction(chatId, targetAction, bot.name);
      }
    }
  }

  // Handle Standard Messages
  const msg = update.message;
  if (!msg || typeof msg.text !== "string") {
    return { ok: true };
  }

  const chatId = msg.chat.id;
  const userId = msg.from?.id || chatId;
  const rawText = msg.text.trim();
  const lowerText = rawText.toLowerCase();

  // Cancel Command
  if (lowerText === "/cancel") {
    await db.clearConversationState(userId);
    return sendMessage(chatId, "Current action cancelled.\n\nType /menu to view the main menu or /help for commands.");
  }

  // Start & Main Menu (replies with launch button and short description of app)
  if (
    lowerText === "/start" ||
    lowerText === "/menu" ||
    lowerText === "menu" ||
    lowerText === "start" ||
    lowerText === "main menu"
  ) {
    await db.clearConversationState(userId);
    return sendStartMenu(chatId, msg.from?.first_name);
  }

  // About App
  if (lowerText === "/about" || lowerText === "about") {
    await db.clearConversationState(userId);
    return sendAboutDetails(chatId);
  }

  // How to Earn
  if (lowerText === "/earn" || lowerText === "earn" || lowerText === "how to earn") {
    await db.clearConversationState(userId);
    return sendEarnDetails(chatId);
  }

  // Institutional Partners
  if (lowerText === "/partners" || lowerText === "partners") {
    await db.clearConversationState(userId);
    return sendPartnersDetails(chatId);
  }

  // Help
  if (lowerText === "/help" || lowerText === "help") {
    await db.clearConversationState(userId);
    return sendHelpMenu(chatId);
  }

  // Check Active State Machine
  const activeState = await db.getConversationState(userId);
  if (activeState) {
    return handleStateStep(chatId, userId, rawText, activeState);
  }

  // Command Routing
  if (lowerText === "/newbot") {
    await db.setConversationState(userId, "newbot", 1);
    return sendMessage(chatId, "Alright, a new bot. How are we going to call it? Please choose a name for your bot.");
  }

  if (lowerText === "/mybots") {
    return listUserBots(chatId, userId, "info");
  }

  if (lowerText === "/deletebot") {
    return listUserBots(chatId, userId, "delete", "Choose a bot to delete:");
  }

  if (lowerText === "/token") {
    return listUserBots(chatId, userId, "token", "Choose a bot to view its authorization token:");
  }

  if (lowerText === "/revoke") {
    return listUserBots(chatId, userId, "revoke", "Choose a bot to revoke and generate a new token:");
  }

  if (lowerText === "/setname") {
    return listUserBots(chatId, userId, "setname", "Choose a bot to change its display name:");
  }

  if (lowerText === "/setdescription") {
    return listUserBots(chatId, userId, "setdescription", "Choose a bot to change its description:");
  }

  if (lowerText === "/setabouttext") {
    return listUserBots(chatId, userId, "setabouttext", "Choose a bot to change its about text:");
  }

  if (lowerText === "/setuserpic") {
    return listUserBots(chatId, userId, "setuserpic", "Choose a bot to change its profile photo:");
  }

  if (lowerText === "/setcommands") {
    return listUserBots(chatId, userId, "setcommands", "Choose a bot to change its list of commands:");
  }

  if (lowerText === "/setinline") {
    return listUserBots(chatId, userId, "toggle_inline", "Choose a bot to toggle inline mode:");
  }

  if (lowerText === "/setinlinegeo") {
    return listUserBots(chatId, userId, "setinlinegeo", "Choose a bot to toggle inline location requests:");
  }

  if (lowerText === "/setinlinefeedback") {
    return listUserBots(chatId, userId, "setinlinefeedback", "Choose a bot to change inline feedback settings:");
  }

  if (lowerText === "/setjoingroups") {
    return listUserBots(chatId, userId, "toggle_groups", "Choose a bot to toggle group permissions:");
  }

  if (lowerText === "/setprivacy") {
    return listUserBots(chatId, userId, "toggle_privacy", "Choose a bot to toggle group privacy mode:");
  }

  // Web Apps
  if (lowerText === "/newapp") {
    return listUserBots(chatId, userId, "newapp", "Choose a bot to attach the new Web App to:");
  }

  if (lowerText === "/myapps" || lowerText === "/listapps") {
    const apps = await db.getAllWebApps();
    if (apps.length === 0) {
      return sendMessage(chatId, "No Web Apps registered yet. Use /newapp to create one.");
    }
    const appList = apps.map((a, i) => `${i + 1}. *${a.title}* (@${a.short_name})\nURL: ${a.url}`).join("\n\n");
    return sendMessage(chatId, `*Active Web Apps:*\n\n${appList}`);
  }

  if (lowerText === "/deleteapp") {
    const apps = await db.getAllWebApps();
    if (apps.length === 0) {
      return sendMessage(chatId, "No Web Apps to delete.");
    }
    const keyboard = {
      inline_keyboard: apps.map((a) => [
        { text: `${a.title} (@${a.short_name})`, callback_data: `delete_app:${a.id}` },
      ]),
    };
    return sendMessage(chatId, "Choose a Web App to delete:", keyboard);
  }

  // Games
  if (lowerText === "/newgame") {
    return listUserBots(chatId, userId, "newgame", "Choose a bot to host the new game:");
  }

  if (lowerText === "/mygames" || lowerText === "/listgames") {
    const games = await db.getAllGames();
    if (games.length === 0) {
      return sendMessage(chatId, "No Games registered yet. Use /newgame to create one.");
    }
    const gameList = games.map((g, i) => `${i + 1}. *${g.title}* (${g.short_name})\nDesc: ${g.description}`).join("\n\n");
    return sendMessage(chatId, `*Active Games:*\n\n${gameList}`);
  }

  // Default Fallback
  return sendMessage(
    chatId,
    `Unrecognized command: \`${rawText}\`\n\nUse /help to view all available BotFather-standard commands or /newbot to create a new bot.`
  );
}

// Conversation State Machine
async function handleStateStep(
  chatId: number,
  userId: number,
  input: string,
  state: { current_command: string; step: number; context_data: Record<string, unknown> }
) {
  const cmd = state.current_command;
  const step = state.step;
  const ctx = state.context_data || {};

  // /newbot flow
  if (cmd === "newbot") {
    if (step === 1) {
      // Input is Bot Name
      const botName = input.trim();
      if (botName.length < 1) {
        return sendMessage(chatId, "Please provide a valid bot name.");
      }
      await db.setConversationState(userId, "newbot", 2, { bot_name: botName });
      return sendMessage(
        chatId,
        `Good. Now let's choose a username for your bot. It must end in \`bot\`. Like this, for example: TetrisBot or tetris_bot.`
      );
    } else if (step === 2) {
      // Input is Username
      const username = input.trim().replace(/^@/, "");
      if (!username.toLowerCase().endsWith("bot")) {
        return sendMessage(chatId, "Sorry, the username must end in 'bot'. Try again (or /cancel).");
      }

      // Check uniqueness
      const existing = await db.getBotByUsername(username);
      if (existing) {
        return sendMessage(chatId, `Sorry, the username @${username} is already taken. Please choose another username (or /cancel).`);
      }

      const botName = String(ctx.bot_name || "My Bot");
      const created = await db.createManagedBot(userId, botName, username);
      await db.clearConversationState(userId);

      return sendMessage(
        chatId,
        `*Done! Congratulations on your new bot.*\n\nYou will find it at t.me/${created.username}. You can now add a description, about section and profile picture for your bot, see /help for a list of commands.\n\nUse this token to access the HTTP API:\n\`${created.token}\`\n\nKeep your token secure and store it safely!`
      );
    }
  }

  // Edit Bot Property Flow
  const botId = Number(ctx.bot_id);
  if (!botId) {
    await db.clearConversationState(userId);
    return sendMessage(chatId, "Session expired. Please try the command again.");
  }

  if (cmd === "setname") {
    await db.updateBotField(botId, "name", input);
    await db.clearConversationState(userId);
    return sendMessage(chatId, `Success! Name updated to: *${input}*`);
  }

  if (cmd === "setdescription") {
    await db.updateBotField(botId, "description", input);
    await db.clearConversationState(userId);
    return sendMessage(chatId, `Success! Description updated.`);
  }

  if (cmd === "setabouttext") {
    await db.updateBotField(botId, "about_text", input);
    await db.clearConversationState(userId);
    return sendMessage(chatId, `Success! About text updated.`);
  }

  if (cmd === "setuserpic") {
    await db.updateBotField(botId, "photo_url", input);
    await db.clearConversationState(userId);
    return sendMessage(chatId, `Success! Profile picture URL saved.`);
  }

  if (cmd === "setcommands") {
    const lines = input.split("\n").filter(Boolean);
    const parsedCommands = lines.map((line) => {
      const [c, ...d] = line.split("-");
      return {
        command: c.trim().replace(/^\//, ""),
        description: d.join("-").trim() || "command",
      };
    });
    await db.updateBotField(botId, "commands", parsedCommands);
    await db.clearConversationState(userId);
    return sendMessage(chatId, `Success! ${parsedCommands.length} commands configured.`);
  }

  // New WebApp Wizard
  if (cmd === "newapp") {
    if (step === 2) {
      // Short name
      const shortName = input.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      await db.setConversationState(userId, "newapp", 3, { ...ctx, short_name: shortName });
      return sendMessage(chatId, `Great! Now send a title for Web App @${shortName}:`);
    } else if (step === 3) {
      // Title
      const title = input.trim();
      await db.setConversationState(userId, "newapp", 4, { ...ctx, title });
      return sendMessage(chatId, `Now send the HTTPS URL for your Web App (e.g. \`https://app.kesararamwithdigital.tech\`):`);
    } else if (step === 4) {
      // URL
      const url = input.trim();
      if (!url.startsWith("https://")) {
        return sendMessage(chatId, "Web App URL must start with https://. Please send a valid URL (or /cancel):");
      }
      const shortName = String(ctx.short_name || "app");
      const title = String(ctx.title || "My Web App");
      await db.createManagedWebApp(botId, shortName, title, url);
      await db.clearConversationState(userId);
      return sendMessage(
        chatId,
        `*Success! Web App Created.*\n\nTitle: *${title}*\nShort name: \`${shortName}\`\nURL: ${url}\nDirect link: \`https://t.me/${ctx.username}/${shortName}\``
      );
    }
  }

  // New Game Wizard
  if (cmd === "newgame") {
    if (step === 2) {
      const shortName = input.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      await db.setConversationState(userId, "newgame", 3, { ...ctx, short_name: shortName });
      return sendMessage(chatId, `Send a title for game \`${shortName}\`:`);
    } else if (step === 3) {
      const title = input.trim();
      await db.setConversationState(userId, "newgame", 4, { ...ctx, title });
      return sendMessage(chatId, `Now send a description for *${title}*:`);
    } else if (step === 4) {
      const description = input.trim();
      const shortName = String(ctx.short_name || "game");
      const title = String(ctx.title || "Game");
      await db.createManagedGame(botId, shortName, title, description);
      await db.clearConversationState(userId);
      return sendMessage(chatId, `*Success! HTML5 Game Registered.*\n\nTitle: *${title}*\nShort name: \`${shortName}\`\nDescription: ${description}`);
    }
  }

  await db.clearConversationState(userId);
  return sendMessage(chatId, "Command completed. Type /help to see more.");
}

// Helpers
async function listUserBots(
  chatId: number,
  userId: number,
  action: string,
  promptText: string = "Choose a bot from the list below:"
) {
  const bots = await db.getBotsByUser(userId);
  if (bots.length === 0) {
    return sendMessage(chatId, "You have no bots yet. Use /newbot to create a new bot.");
  }

  const keyboard = {
    inline_keyboard: bots.map((b) => [
      { text: `${b.name} (@${b.username})`, callback_data: `bot_select:${action}:${b.id}` },
    ]),
  };

  return sendMessage(chatId, promptText, keyboard);
}

function sendBotDetails(chatId: number, bot: ManagedBot) {
  const details = `*Bot Information:*
Name: *${bot.name}*
Username: @${bot.username}
Inline Mode: ${bot.inline_enabled ? "Enabled" : "Disabled"}
Group Privacy: ${bot.privacy_mode ? "Enabled" : "Disabled"}
Group Joining: ${bot.join_groups ? "Allowed" : "Blocked"}

*Edit Bot Options:*
/setname - Edit name
/setdescription - Edit description
/setabouttext - Edit about text
/setcommands - Edit command list
/token - View token
/revoke - Revoke token
/deletebot - Delete bot`;

  return sendMessage(chatId, details);
}

function sendPromptForAction(chatId: number, action: string, botName: string) {
  if (action === "setname") return sendMessage(chatId, `Send the new name for *${botName}*:`);
  if (action === "setdescription") return sendMessage(chatId, `Send the new description for *${botName}*:`);
  if (action === "setabouttext") return sendMessage(chatId, `Send the new about text for *${botName}*:`);
  if (action === "setuserpic") return sendMessage(chatId, `Send the photo URL for *${botName}*:`);
  if (action === "setcommands") return sendMessage(chatId, `Send command list for *${botName}* (format: \`command - description\` per line):`);
  return sendMessage(chatId, `Please send the required parameter:`);
}
