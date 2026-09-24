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
