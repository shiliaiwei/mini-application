import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runSecurityQualityAudit, formatTelegramAuditReport } from "../src/lib/bot/securityAudit";

test("Security Audit Engine: Evaluates full spectrum of security and quality checks", () => {
  const report = runSecurityQualityAudit();

  assert.equal(report.overallGrade, "A+", "Overall grade should be A+");
  assert.equal(report.scorePercentage, 100, "Score percentage should be 100%");
  assert.equal(report.totalChecks >= 15, true, "Total checks should be at least 15");
  assert.equal(report.passedChecks, report.totalChecks, "All checks must pass");

  // Verify categories
  const categories = new Set(report.checks.map((c) => c.category));
  assert.ok(categories.has("Perimeter & CSP"), "Must include Perimeter & CSP category");
  assert.ok(categories.has("Access Control"), "Must include Access Control category");
  assert.ok(categories.has("Data Privacy"), "Must include Data Privacy category");
  assert.ok(categories.has("Scanners & QA"), "Must include Scanners & QA category");

  // Verify all 6 security scanners are reported
  const scannerNames = report.scanners.map((s) => s.name);
  assert.ok(scannerNames.includes("CodeQL"), "CodeQL must be tracked");
  assert.ok(scannerNames.includes("Semgrep OSS"), "Semgrep OSS must be tracked");
  assert.ok(scannerNames.includes("Checkov"), "Checkov must be tracked");
  assert.ok(scannerNames.includes("Trivy"), "Trivy must be tracked");
  assert.ok(scannerNames.includes("Gitleaks"), "Gitleaks must be tracked");
  assert.ok(scannerNames.includes("OSV-Scanner"), "OSV-Scanner must be tracked");

  for (const scanner of report.scanners) {
    assert.equal(scanner.openAlerts, 0, `${scanner.name} must have 0 open alerts`);
    assert.equal(scanner.status, "Active", `${scanner.name} must be active`);
  }
});

test("Security Audit Engine: Formats Telegram Markdown report with Zero Emojis", () => {
  const report = runSecurityQualityAudit();
  const text = formatTelegramAuditReport(report);

  assert.ok(text.includes("SECURITY & QUALITY AUDIT REPORT"), "Report must include title");
  assert.ok(text.includes("ALL CHECKS PASSED"), "Report must include status");
  assert.ok(text.includes("Frame-Ancestors: `PASS`"), "Report must include CSP status");
  assert.ok(text.includes("CodeQL:"), "Report must include CodeQL status");
  assert.ok(text.includes("Automated Tests:"), "Report must include test status");

  // Strict Zero Emoji verification
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
  assert.equal(emojiRegex.test(text), false, "Audit report must strictly contain NO emojis");
});

test("Bot Engine: Wires /audit command, menu button, and callback query", () => {
  const enginePath = path.resolve(__dirname, "../src/lib/bot/engine.ts");
  const engineContent = fs.readFileSync(enginePath, "utf-8");

  assert.ok(engineContent.includes("runSecurityQualityAudit"), "engine.ts must import runSecurityQualityAudit");
  assert.ok(engineContent.includes("sendSecurityAuditReport"), "engine.ts must export sendSecurityAuditReport");
  assert.ok(engineContent.includes("menu_audit"), "engine.ts must wire menu_audit callback");
  assert.ok(engineContent.includes("/audit"), "engine.ts must handle /audit command");
  assert.ok(engineContent.includes("/security"), "engine.ts must handle /security command");
  assert.ok(engineContent.includes("Security & Quality Audit"), "engine.ts start menu must include Security button");
});

test("Audit API Route: api/audit/security exists and provides GET and POST handlers", () => {
  const routePath = path.resolve(__dirname, "../src/app/api/audit/security/route.ts");
  assert.equal(fs.existsSync(routePath), true, "API route file must exist");

  const routeContent = fs.readFileSync(routePath, "utf-8");
  assert.ok(routeContent.includes("export async function GET"), "Must export GET handler");
  assert.ok(routeContent.includes("export async function POST"), "Must export POST handler");
  assert.ok(routeContent.includes("runSecurityQualityAudit"), "Must call runSecurityQualityAudit");
});
