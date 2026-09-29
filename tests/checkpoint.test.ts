import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Checkpoint Rules: workspace-rules.md includes mandatory pre-push checkpoint verification", () => {
  const rulesPath = path.resolve(__dirname, "../.agents/rules/workspace-rules.md");
  assert.equal(fs.existsSync(rulesPath), true, "workspace-rules.md should exist");

  const content = fs.readFileSync(rulesPath, "utf-8");
  assert.ok(
    content.includes("Pre-Push Checkpoint Rule"),
    "Rules must contain Pre-Push Checkpoint Rule"
  );
  assert.ok(
    content.includes("Mandatory Pre-Push Checkpoint Verification"),
    "Rules must mandate Pre-Push Checkpoint Verification"
  );
  assert.ok(
    content.includes("Checkpoint 1 (Unit & Regression Tests)"),
    "Rules must specify Checkpoint 1 for Unit & Regression Tests"
  );
  assert.ok(
    content.includes("Checkpoint 2 (Production Build)"),
    "Rules must specify Checkpoint 2 for Production Build"
  );
});

test("GitHub Workflows: deploy-checkpoint.yml exists and defines verification gates", () => {
  const workflowPath = path.resolve(__dirname, "../.github/workflows/deploy-checkpoint.yml");
  assert.equal(fs.existsSync(workflowPath), true, "deploy-checkpoint.yml should exist");

  const content = fs.readFileSync(workflowPath, "utf-8");
  assert.ok(content.includes("name: Deploy Checkpoint"), "Workflow must be named Deploy Checkpoint");
  assert.ok(content.includes("pre-deploy-checkpoint:"), "Must have pre-deploy-checkpoint job");
  assert.ok(content.includes("pnpm test"), "Must run test checkpoint");
  assert.ok(content.includes("pnpm build"), "Must run build checkpoint");
  assert.ok(content.includes("deploy-gate:"), "Must have deploy gate job");
});

test("Package Scripts: package.json includes checkpoint command", () => {
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  assert.ok(pkg.scripts.checkpoint, "package.json must contain checkpoint script");
  assert.ok(
    pkg.scripts.checkpoint.includes("test") && pkg.scripts.checkpoint.includes("build"),
    "checkpoint script must run test and build"
  );
});

test("Git Hooks: pre-push hook exists and is executable", () => {
  const hookPath = path.resolve(__dirname, "../.git/hooks/pre-push");
  if (!fs.existsSync(hookPath) && process.env.CI) {
    // In CI environments (e.g. GitHub Actions runner), client-side git hooks are not checked out
    return;
  }
  assert.equal(fs.existsSync(hookPath), true, "pre-push hook should exist in local development");
  const stats = fs.statSync(hookPath);
  // Check executable permission bit
  assert.ok((stats.mode & 0o111) !== 0, "pre-push hook must be executable");
});

test("Repository Standards: README.md does not exist and Never Write README rule is enforced", () => {
  const readmePath = path.resolve(__dirname, "../README.md");
  assert.equal(fs.existsSync(readmePath), false, "README.md must not exist in repository");

  const rulesPath = path.resolve(__dirname, "../.agents/rules/workspace-rules.md");
  const content = fs.readFileSync(rulesPath, "utf-8");
  assert.ok(
    content.includes("Never Write README Rule"),
    "Rules must contain Never Write README Rule"
  );
});

test("Ephemeral Scripts Protocol: workspace-rules.md and ephemeral-script-cleanup skill mandate zero script exposure", () => {
  const skillPath = path.resolve(
    __dirname,
    "../.agents/skills/ephemeral-script-cleanup/SKILL.md"
  );
  assert.equal(fs.existsSync(skillPath), true, "ephemeral-script-cleanup SKILL.md must exist");

  const skillContent = fs.readFileSync(skillPath, "utf-8");
  assert.ok(
    skillContent.includes("name: ephemeral-script-cleanup"),
    "Skill must define name: ephemeral-script-cleanup"
  );
  assert.ok(
    skillContent.includes("Immediate Post-Execution Deletion"),
    "Skill must mandate Immediate Post-Execution Deletion"
  );
  assert.ok(
    skillContent.includes("Zero Code Exposure"),
    "Skill must mandate Zero Code Exposure"
  );

  const rulesPath = path.resolve(__dirname, "../.agents/rules/workspace-rules.md");
  const rulesContent = fs.readFileSync(rulesPath, "utf-8");
  assert.ok(
    rulesContent.includes("Temporary Scripts Cleanup & Zero Exposure Rule"),
    "Rules must include Temporary Scripts Cleanup & Zero Exposure Rule"
  );
});

