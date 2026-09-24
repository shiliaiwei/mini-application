export interface ManagedBot {
  id: number;
  user_id: number;
  token: string;
  name: string;
  username: string;
  description: string;
  about_text: string;
  photo_url: string;
  commands: Array<{ command: string; description: string }>;
  inline_enabled: boolean;
  inline_geo: boolean;
  inline_feedback: string;
  join_groups: boolean;
  privacy_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManagedWebApp {
  id: number;
  bot_id: number;
  short_name: string;
  title: string;
  description: string;
  url: string;
  created_at: string;
}

export interface ManagedGame {
  id: number;
  bot_id: number;
  short_name: string;
  title: string;
  description: string;
  photo_url: string;
  animation_url: string;
  created_at: string;
}

export interface ConversationState {
  user_id: number;
  current_command: string;
  step: number;
  context_data: Record<string, unknown>;
  updated_at: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      chat: { id: number };
      message_id: number;
    };
    data?: string;
  };
  inline_query?: {
    id: string;
    from: { id: number; first_name: string };
    query: string;
    offset: string;
  };
}
