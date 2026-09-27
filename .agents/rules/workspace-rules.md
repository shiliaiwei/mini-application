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
- **Conversion Standard**: 100 WEI COIN = $1.00 USD = 4,100 KHR (~3.75 SAR / ~0.20 TON).

## 3D Skeuomorphic Purple Leather Design Standard - MANDATORY
- **Wallet Container**: Rich purple textured leather pocket container (`#4a154b` / `#6420a7`) with simulated perimeter stitching lines (`stroke-dasharray="4 4"`).
- **Interactive Stacked Card**: Peeking credit card with dynamic currency switcher (`$ USD` / `៛ KHR`) and Telegram owner `@username` with verified badge.
- **Universal Application**: Apply 3D purple leather texture, perimeter stitching, and tactile pill buttons across cards, banners, and docks.

## Brand Mascot (Weibot) Standard - MANDATORY
- **Official Character**: Weibot, the electric cyan/royal blue companion with feline ear tufts, large specular anime eyes, and `[WEI]` gold collar crest.
- **Supported Poses**: `idle`, `wave`, `announce` (with megaphone), `cheer` (with victory sparks).
- **Accessibility**: Pure vector SVG with `role="img"` and descriptive `aria-label`.
