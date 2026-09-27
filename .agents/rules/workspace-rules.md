# Workspace Rules

## Temporary Scripts Cleanup Rule - MANDATORY
- Do not store temporary or test scripts in the workspace.
- If a script is created and used for a task/test/migration, it MUST be deleted immediately after execution.

## Git Remote Push Rule - MANDATORY
- Never run `git push` or execute any remote push actions under any circumstances unless explicitly commanded by the user.

## Brand Rule - MANDATORY
- The application brand is strictly the specific word **SHILIAIWEI** only.
- Do not append suffixes or extra words to the brand name.
- Keep the official Telegram bot URL and handle as `@srievibot` (`https://t.me/srievibot`).

## Brand Asset Mutual Exclusivity Rule - MANDATORY
- **Logo Only Mode**: If using the logo mark, icon, or badge emblem, strictly **DO NOT** display the brand name text alongside it.
- **Brand Name Only Mode**: If using the brand name text or wordmark, strictly **DO NOT** display the logo icon, avatar, or emblem beside it.
- **Strict Separation**: The logo mark and brand name text are strictly mutually exclusive and must NEVER appear simultaneously side-by-side in any header, banner, badge, or UI card.

## Design Color Rule - MANDATORY
- Never use gradient colors (`bg-gradient-to-...` or CSS gradients).
- Use solid, clean colors only (e.g. solid `#0d1217`, `#182026`, `#0098ea`, `#22c55e`).

## No Emojis Rule - MANDATORY
- Strictly NO EMOJIS in any responses or generated code.

## WEI Coin Terminology Rule - MANDATORY
- **Strict In-Game Currency Terminology**: All in-game points, currency balances, mission rewards, and exchange rates MUST strictly use the term **WEI COIN** (or **WEI** / **$WEI**).
- **Prohibition of "PTS"**: Generic abbreviations such as "PTS" or bare "points" are strictly prohibited in user-facing views, badges, headers, modals, and notifications.
- **Conversion Standard**: 100 WEI COIN = $1.00 USD = 4,100 KHR. Dual currency strictly supports US Dollar ($) and Cambodian Riel (៛); SAR is strictly excluded.

## 3D Skeuomorphic Purple Leather Design Standard - MANDATORY
- **Wallet Container**: Rich purple textured leather pocket container (`#4a154b` / `#6420a7`) with simulated perimeter stitching lines (`stroke-dasharray="4 4"`).
- **Interactive Stacked Card**: Peeking credit card with authenticated Telegram owner `@username`, official Telegram Verified Badge, and encrypted address (`0x...••••••••...`) with tap-to-copy (zero icons).
- **Single Currency Display (Zero Duplicate Currency Symbols)**:
  - Balance amount displays strictly as numbers without prepended currency symbols (e.g. `1,071,986` or `1,250.00`).
  - Currency indicator pill (`$` / `៛`) sits solely on the right of the total balance.
- **Zero Animation on Currency Switch**: Switching currency must toggle instantly with zero text translation, zero card hanging/tilting animation, and zero layout shift.
- **Universal Application**: Apply 3D purple leather texture, perimeter stitching, and tactile pill buttons across cards, banners, and docks.

## Background Architecture & Texture Standards - MANDATORY
- **App Background on Mobile**: Strictly use `background.svg` (`/backgrounds/background.svg`) across the mobile app canvas.
- **Zero Banknote Background Behind App**: Never display `cardbanknote.svg` behind the entire app or settings views.
- **Card Wallet Texture**: Strictly use `cardbanknote.svg` (`/backgrounds/cardbanknote.svg`) for the card wallet (front card, back card edge, and 3D banknote pocket).

## Brand Mascot (Weibot) Standard - MANDATORY
- **Official Character**: Weibot, the electric cyan/royal blue companion with feline ear tufts, large specular anime eyes, and `[WEI]` gold collar crest.
- **Supported Poses**: `idle`, `wave`, `announce` (with megaphone), `cheer` (with victory sparks).
- **Accessibility**: Pure vector SVG with `role="img"` and descriptive `aria-label`.
- **Mascot Placement Rule**: Never put the mascot in the wallet card or wallet container. The mascot belongs exclusively in companion widgets, game activities, onboarding, and dedicated companion viewports.

## Telegram User Profile & Telemetry Data Collection Standard - MANDATORY
- **Direct Telegram Bot API Data Source**: Extract live user properties via `@srievibot` Telegram Bot API (`getChat`, `getUserProfilePhotos`, webhook updates):
  - Permanent Telegram User ID (`id`).
  - Username (`username`), First Name (`first_name`), Last Name (`last_name`).
  - Public User Bio (`bio`).
  - Interface Language Code (`language_code`).
  - Telegram Premium status (`is_premium`).
  - Linked Personal Channel / Chat (`personal_chat`).
  - Profile Photos (`small_file_id`, `big_file_id`).
  - Real-time bot interaction history & commands (`message`, `command`, `chat_id`).
- **Telegram Mini App SDK Data Source (`window.Telegram.WebApp`)**:
  - Cryptographically signed authentication payload (`initData` / `hash`).
  - Direct message permission (`allows_write_to_pm`).
  - Operating system / client runtime (`platform`: `ios`, `android`, `tdesktop`, `macos`, `weba`).
  - WebApp API client version (`version`).
  - Client color and theme tokens (`themeParams`).
  - Viewport display boundaries (`viewportHeight`, `viewportStableHeight`).
  - Native biometric hardware capability (`BiometricManager`).
- **Server & Network Telemetry Source (`/api/player/sync`)**:
  - Client IP address (`ip_address`).
  - Geographic location (`city_country` / `cf-ipcountry`).
  - Browser and hardware user-agent (`user_agent`).
  - Bound Web3 wallet address (`wei_0x...`).
  - Real-time gaming metrics (`score`, `spend_seconds`, `missions_claimed`).
- **Database Persistence & Isolation**:
  - Persist real-time player data in `game_players` and append audit trails to `player_audit_logs`.
  - Strictly isolate mock ID `88888888` (`SHILIAIWEI Holder`) to local development previews; never overwrite or substitute live Telegram users with mock data.

