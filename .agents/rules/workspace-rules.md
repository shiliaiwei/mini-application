# Workspace Rules

## Temporary Scripts Cleanup Rule - MANDATORY
- Do not store temporary or test scripts in the workspace.
- If a script is created and used for a task/test/migration, it MUST be deleted immediately after execution.

## Never Write README Rule - MANDATORY
- Strictly NEVER create, write, generate, or restore `README.md` or any README documentation files in this repository.
- Keep the repository clean of README files under all circumstances.

## Git Remote Push & Pre-Push Checkpoint Rule - MANDATORY
- **Strict Command Gate**: Never run `git push` or execute any remote push actions under any circumstances unless explicitly commanded by the user.
- **Mandatory Pre-Push Checkpoint Verification**: Prior to executing any `git push` to GitHub or remote repositories, the system and developers MUST execute and pass all local checkpoints first:
  1. **Checkpoint 1 (Unit & Regression Tests)**: Run `pnpm test` (or `npm test`) — all tests must pass 100% with zero failures.
  2. **Checkpoint 2 (Production Build)**: Run `pnpm build` (or `npm run build`) — Next.js production build must compile cleanly without errors.
  3. **Checkpoint 3 (Heavy Media Exclusion)**: Verify `.gitignore` excludes heavy media files (`.mov`, `.mp4`, `.zip`, `.pdf`, `.wav`, `.db`).
  4. **Checkpoint 4 (Zero Emojis Standard)**: Verify zero emojis exist in commits, codebase, or UI messages.
  5. **Checkpoint 5 (Push Buffer Setup)**: Ensure `git config http.postBuffer 524288000` is configured.
- **Strict Abort on Failure**: If any checkpoint fails, the push MUST be aborted immediately and the failure fixed before attempting to push again.

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

## WEI Coin Terminology Rule & Supported Currencies - MANDATORY
- **Strict Supported Currencies (3 Only)**: The platform strictly supports **WEI COIN** (in-game asset), **US Dollar** (`USD` / `$`), and **Cambodian Riel** (`KHR` / `៛`).
- **Complete Exclusion of TON, PTS, and SAR**: All references to `TON`, `PTS` (generic points), and `SAR` are completely prohibited and excluded from the codebase, UI, and exchange engines.
- **Strict In-Game Currency Terminology**: All in-game points, currency balances, mission rewards, and exchange rates MUST strictly use the term **WEI COIN** (or **WEI** / **$WEI**).
- **Prohibition of "PTS"**: Generic abbreviations such as "PTS" or bare "points" are strictly prohibited in user-facing views, badges, headers, modals, and notifications.
- **Conversion Standard**: 100 WEI COIN = $1.00 USD = 4,100 KHR.
- **Economy Terms & Logic**: Users earn WEI Coin every day by claiming daily rewards, tapping to harvest, playing mini-games, and completing verified missions. Users exchange their collected WEI Coin directly into virtual currencies: Cambodian Riel (KHR ៛) and US Dollar (USD $).
- **Balance Privacy Interaction**: Total balance visibility is toggled by tapping directly on the balance numbers without context guide or separate eye icon.

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
  - Database Persistence & Isolation:
    - Persist real-time player data in `game_players` and append audit trails to `player_audit_logs`.
    - Strictly isolate mock ID `88888888` (`SHILIAIWEI Holder`) to local development previews; never overwrite or substitute live Telegram users with mock data.

## Mandatory Official Keyline Icons Standard - MANDATORY
- **Single Source of Truth**: Sourced exclusively from `https://keylineicons.com/icons` (`@keyline-icons/react/two-tone`).
- **Export Gateway**: All icons across the entire codebase MUST be imported from `@/components/icons/KeylineIcons` (`src/components/icons/KeylineIcons.tsx`).
- **Zero Outside Icon Libraries**: Strictly NO `lucide-react`, `@heroicons`, `react-icons`, or `fontawesome`.
- **Zero Emojis**: Strictly NO EMOJIS in UI, code, responses, or metadata under any circumstances.

## Mandatory Skeuomorphic Brand Shape Design Rule - MANDATORY
- **Universal Application**: All agent skills, workflows, and UI views MUST ALWAYS apply the `skeuomorphic-purple-leather-wallet-design/` and Skeuomorphic Card Style across all brand shapes, card containers, dialogs, and settings modules.
- **Card Pocket Tokens**: Every container must feature the multi-stop gradient (`#5c1c99` via `#48127f` to `#320a59` or designated pocket accent), `LeatherGrain` overlay, `GuillocheBackground` (`/backgrounds/cardbanknote.svg`), perimeter `ThreadStitching` (`stroke-dasharray="4 4"`, drop shadow), and `SpecularRim` top highlight.
- **Modals & Dialogs**: Never use flat white or plain gray backgrounds. Modals must be physical stitched leather cardholder pockets with frosted glass inputs and tactile 3D buttons.

## Mandatory Delivery Map & Address Pinning System Standard - MANDATORY
- **Skill Reference**: Governed by `.agents/skills/shiliaiwei-delivery-map-address-system/SKILL.md`.
- **Physical Pinpoint Standard**: All address collection (Home, Work, Other) MUST support interactive map pinpointing (`DeliveryMapPickerModal.tsx`) with 3D bouncing pin drop and reverse geocoding via OpenStreetMap Nominatim (`/api/geocode/locate`) using device GPS and local network IP fallback.
- **Incomplete Placeholder Alert**: Empty addresses and profile fields MUST render prominent amber Action Required alert containers (`[ ACTION REQUIRED: Incomplete Address ]`) with direct `[ Pin on Delivery Map (GPS & IP) ]` CTA.
- **Zero Redundant Navigation**: Never render `(Exit to Home View)` buttons; rely exclusively on top header Back navigation (`ChevronLeft`).
- **Official Gate Screen Phrasing**: Gate screen Khmer copy strictly uses `តើមានអ្វីកើតឡើង?` and `តើខ្ញុំត្រូវធ្វើដូចម្តេច?` with verified session explanations.

