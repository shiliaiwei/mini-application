import { neon } from "@neondatabase/serverless";
import { ManagedBot, ManagedWebApp, ManagedGame, ConversationState } from "./types";

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set");
  return neon(dbUrl);
}

// State Management
export async function getConversationState(userId: number): Promise<ConversationState | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT user_id, current_command, step, context_data, updated_at
    FROM bot_conversation_states
    WHERE user_id = ${userId};
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as ConversationState;
}

export async function setConversationState(
  userId: number,
  command: string,
  step: number,
  contextData: Record<string, unknown> = {}
) {
  const sql = getSql();
  await sql`
    INSERT INTO bot_conversation_states (user_id, current_command, step, context_data, updated_at)
    VALUES (${userId}, ${command}, ${step}, ${JSON.stringify(contextData)}::jsonb, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_command = EXCLUDED.current_command,
      step = EXCLUDED.step,
      context_data = EXCLUDED.context_data,
      updated_at = NOW();
  `;
}

export async function clearConversationState(userId: number) {
  const sql = getSql();
  await sql`DELETE FROM bot_conversation_states WHERE user_id = ${userId};`;
}

// Bot CRUD
export async function createManagedBot(
  userId: number,
  name: string,
  username: string
): Promise<ManagedBot> {
  const sql = getSql();
  const rawToken = `${Math.floor(1000000000 + Math.random() * 9000000000)}:AA${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  const rows = await sql`
    INSERT INTO managed_bots (user_id, token, name, username, created_at, updated_at)
    VALUES (${userId}, ${rawToken}, ${name}, ${username}, NOW(), NOW())
    RETURNING *;
  `;
  return rows[0] as unknown as ManagedBot;
}

export async function getBotsByUser(userId: number): Promise<ManagedBot[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM managed_bots WHERE user_id = ${userId} ORDER BY id ASC;
  `;
  return rows as unknown as ManagedBot[];
}

export async function getBotByUsername(username: string): Promise<ManagedBot | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM managed_bots WHERE LOWER(username) = LOWER(${username});
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as ManagedBot;
}

export async function getBotById(botId: number): Promise<ManagedBot | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM managed_bots WHERE id = ${botId};
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as ManagedBot;
}

export async function updateBotField(
  botId: number,
  field: "name" | "description" | "about_text" | "photo_url" | "commands" | "inline_enabled" | "inline_geo" | "inline_feedback" | "join_groups" | "privacy_mode",
  value: unknown
) {
  const sql = getSql();
  if (field === "name") {
    await sql`UPDATE managed_bots SET name = ${String(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "description") {
    await sql`UPDATE managed_bots SET description = ${String(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "about_text") {
    await sql`UPDATE managed_bots SET about_text = ${String(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "photo_url") {
    await sql`UPDATE managed_bots SET photo_url = ${String(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "commands") {
    await sql`UPDATE managed_bots SET commands = ${JSON.stringify(value)}::jsonb, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "inline_enabled") {
    await sql`UPDATE managed_bots SET inline_enabled = ${Boolean(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "inline_geo") {
    await sql`UPDATE managed_bots SET inline_geo = ${Boolean(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "inline_feedback") {
    await sql`UPDATE managed_bots SET inline_feedback = ${String(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "join_groups") {
    await sql`UPDATE managed_bots SET join_groups = ${Boolean(value)}, updated_at = NOW() WHERE id = ${botId};`;
  } else if (field === "privacy_mode") {
    await sql`UPDATE managed_bots SET privacy_mode = ${Boolean(value)}, updated_at = NOW() WHERE id = ${botId};`;
  }
}

export async function revokeBotToken(botId: number): Promise<string> {
  const sql = getSql();
  const newToken = `${Math.floor(1000000000 + Math.random() * 9000000000)}:AA${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  await sql`UPDATE managed_bots SET token = ${newToken}, updated_at = NOW() WHERE id = ${botId};`;
  return newToken;
}

export async function deleteManagedBot(botId: number) {
  const sql = getSql();
  await sql`DELETE FROM managed_bots WHERE id = ${botId};`;
}

// WebApps CRUD
export async function createManagedWebApp(
  botId: number,
  shortName: string,
  title: string,
  url: string,
  description: string = ""
): Promise<ManagedWebApp> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO managed_webapps (bot_id, short_name, title, url, description, created_at)
    VALUES (${botId}, ${shortName}, ${title}, ${url}, ${description}, NOW())
    RETURNING *;
  `;
  return rows[0] as unknown as ManagedWebApp;
}

export async function getWebAppsByBot(botId: number): Promise<ManagedWebApp[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM managed_webapps WHERE bot_id = ${botId} ORDER BY id ASC;
  `;
  return rows as unknown as ManagedWebApp[];
}

export async function getAllWebApps(): Promise<ManagedWebApp[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM managed_webapps ORDER BY id ASC;`;
  return rows as unknown as ManagedWebApp[];
}

export async function deleteManagedWebApp(appId: number) {
  const sql = getSql();
  await sql`DELETE FROM managed_webapps WHERE id = ${appId};`;
}

// Games CRUD
export async function createManagedGame(
  botId: number,
  shortName: string,
  title: string,
  description: string = "",
  photoUrl: string = "",
  animationUrl: string = ""
): Promise<ManagedGame> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO managed_games (bot_id, short_name, title, description, photo_url, animation_url, created_at)
    VALUES (${botId}, ${shortName}, ${title}, ${description}, ${photoUrl}, ${animationUrl}, NOW())
    RETURNING *;
  `;
  return rows[0] as unknown as ManagedGame;
}

export async function getGamesByBot(botId: number): Promise<ManagedGame[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM managed_games WHERE bot_id = ${botId} ORDER BY id ASC;
  `;
  return rows as unknown as ManagedGame[];
}

export async function getAllGames(): Promise<ManagedGame[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM managed_games ORDER BY id ASC;`;
  return rows as unknown as ManagedGame[];
}

export async function deleteManagedGame(gameId: number) {
  const sql = getSql();
  await sql`DELETE FROM managed_games WHERE id = ${gameId};`;
}
