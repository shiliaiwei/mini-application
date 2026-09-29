---
name: ephemeral-script-cleanup
description: Mandatory protocol for ephemeral test and temporary scripts. Mandates that any temporary script, scratch file, benchmark tool, database migration helper, or test script created during debugging or verification must be deleted immediately after execution, never left in the workspace, never staged or committed, and never exposed in production or user-facing code. Trigger on: "temporary script", "scratch script", "test script cleanup", "delete script after use", "never expose script", "ephemeral script".
---

# EPHEMERAL SCRIPT CLEANUP & ZERO EXPOSURE PROTOCOL

This specification defines the mandatory lifecycle for temporary, scratch, and one-off test scripts created during development, debugging, data migration, and verification.

---

## 1. Core Principles

1. **Immediate Post-Execution Deletion**:
   - Any script file (`.ts`, `.js`, `.mjs`, `.py`, `.sh`, etc.) created for ad-hoc testing, data querying, manual API testing, or verification must be deleted immediately after execution.
   - Never leave temporary test scripts in the workspace root, `src/`, or `scripts/`.

2. **Zero Code Exposure**:
   - Temporary scripts and test harnesses must **NEVER** be committed to version control (`git`).
   - Temporary scripts must **NEVER** be exposed in public assets, bundle outputs, API endpoints, or user-facing documentation.
   - All permanent unit and regression tests must strictly reside in [`tests/`](file:///Users/Apple16/Desktop/mini-app/tests/) following standard test runner conventions (`tests/*.test.ts`).

3. **Inline & In-Memory Execution Preference**:
   - Whenever feasible, execute one-off checks using inline evaluation rather than writing files to disk:
     ```bash
     node -e "..."
     npx tsx -e "..."
     ```
   - If a multi-line script must be written to disk, delete it immediately in the same or next step:
     ```bash
     rm -f temp_test_script.ts
     ```

---

## 2. Workspace Sanitation Gate

Prior to concluding any development task or executing `pnpm checkpoint`, verify that no stray script files exist:

```bash
git status --porcelain
```

- Any untracked `.js`, `.ts`, `.py`, or `.sh` script file that is not part of the official project architecture must be removed immediately before reporting completion to the user.
- Official permanent tests are strictly confined to [`tests/*.test.ts`](file:///Users/Apple16/Desktop/mini-app/tests/).

---

## 3. Checklist for Ephemeral Scripts

- [ ] Was the script strictly needed for a transient test/migration?
- [ ] Did the script execute successfully and deliver the needed result?
- [ ] Was the script file deleted immediately after execution?
- [ ] Is `git status` clean of any temporary or scratch scripts?
- [ ] Has zero temporary or debug code been exposed in production builds?
