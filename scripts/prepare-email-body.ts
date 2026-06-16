#!/usr/bin/env ts-node
/**
 * Prepare the HTML email body by substituting placeholders in email-template.html
 * with live values from the mochawesome report and GitHub Actions env vars.
 * Equivalent of prepare_email_body.py but for the Mocha/TypeScript framework.
 *
 * Usage:
 *   ts-node scripts/prepare-email-body.ts
 *   node -r ts-node/register scripts/prepare-email-body.ts
 *
 * Reads:  .github/gh_utils/email-template.html
 * Writes: email-body.html  (in CWD, picked up by the send-mail action)
 */

import fs from "fs";
import path from "path";

// ── Paths ────────────────────────────────────────────────────────────────────
const TEMPLATE_PATH = path.resolve(
  __dirname,
  "../.github/gh_utils/email-template.html"
);
const MOCHAWESOME_FILE = path.resolve(
  process.cwd(),
  "mochawesome-report/mochawesome.json"
);
const OUTPUT_PATH = path.resolve(process.cwd(), "email-body.html");

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeInt(value: string | undefined, def = 0): number {
  if (!value || value.trim() === "") return def;
  const n = parseInt(value, 10);
  return isNaN(n) ? def : n;
}

function pct(n: number, total: number): string {
  if (total === 0) return "0.0";
  return ((n / total) * 100).toFixed(1);
}

// ── Read stats: prefer mochawesome.json, fall back to env vars ───────────────
interface Stats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

function readStats(): Stats {
  if (fs.existsSync(MOCHAWESOME_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(MOCHAWESOME_FILE, "utf8"));
      const s = raw.stats;
      return {
        total: s.tests ?? 0,
        passed: s.passes ?? 0,
        failed: s.failures ?? 0,
        skipped: s.pending ?? 0,
      };
    } catch {
      console.warn("⚠ Could not parse mochawesome.json — falling back to env vars");
    }
  }
  return {
    total: safeInt(process.env.TOTAL_TESTS),
    passed: safeInt(process.env.PASSED_TESTS),
    failed: safeInt(process.env.FAILED_TESTS),
    skipped: safeInt(process.env.SKIPPED_TESTS),
  };
}

// ── Xray execution link row (injected if upload succeeded) ───────────────────
function xrayElementTag(status: string, id: string, url: string): string {
  if (status === "Uploaded" && id && id !== "unknown") {
    return `
        <tr style='background:#F9F9F9;'>
          <td style='padding:8px 12px; font-weight:bold; color:#666;'>Xray Execution Details:</td>
          <td style='padding:8px 12px;'>
            <a href='${url}' style='color:#0056b3; text-decoration:none; font-weight:bold;'>🔗 ${id}</a>
          </td>
        </tr>`;
  }
  return "";
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main(): void {
  console.log("📧 Preparing email HTML body...");

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`✗ Email template not found: ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  const stats = readStats();
  const { total, passed, failed, skipped } = stats;

  const passedPct = pct(passed, total);
  const failedPct = pct(failed, total);
  const skippedPct = pct(skipped, total);
  const successRate = passedPct;

  const testResult = failed > 0 ? "FAILED" : "PASSED";

  // GitHub Actions environment
  const githubActor = process.env.GITHUB_ACTOR ?? "Unknown";
  const githubRef = process.env.GITHUB_REF ?? process.env.GITHUB_HEAD_REF ?? "Unknown";
  const githubRepository = process.env.GITHUB_REPOSITORY ?? "Unknown";
  const githubWorkflow = process.env.GITHUB_WORKFLOW ?? "Unknown";
  const runNumber = process.env.GITHUB_RUN_NUMBER ?? "Unknown";
  const runId = process.env.GITHUB_RUN_ID ?? "Unknown";
  const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
  const buildUrl = `${serverUrl}/${githubRepository}/actions/runs/${runId}`;

  // Optional Xray details (set by xray:upload step if successful)
  const xrayStatus = process.env.XRAY_STATUS ?? "";
  const xrayExecutionId = process.env.XRAY_EXECUTION_ID ?? "";
  const xrayExecutionUrl = process.env.XRAY_EXECUTION_URL ?? "";

  const replacements: Record<string, string> = {
    GITHUB_ACTOR: githubActor,
    TEST_RESULT: testResult,
    GITHUB_REF: githubRef,
    TOTAL_TESTS: String(total),
    PASSED_TESTS: String(passed),
    FAILED_TESTS: String(failed),
    SKIPPED_TESTS: String(skipped),
    PASSED_PERCENT: passedPct,
    FAILED_PERCENT: failedPct,
    SKIPPED_PERCENT: skippedPct,
    SUCCESS_RATE: successRate,
    GITHUB_REPOSITORY: githubRepository,
    GITHUB_WORKFLOW: githubWorkflow,
    GITHUB_RUN_NUMBER: runNumber,
    GITHUB_RUN_ID: runId,
    BUILD_URL_LINK: buildUrl,
    BUILD_URL_LINK_TEXT: "GitHub Actions Run",
    XRAY_ELEMENT_REPLACEMENT: xrayElementTag(xrayStatus, xrayExecutionId, xrayExecutionUrl),
  };

  let content = fs.readFileSync(TEMPLATE_PATH, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(`{{${key}}}`).join(value);
  }

  fs.writeFileSync(OUTPUT_PATH, content, "utf8");
  console.log(`✅ Email body saved: ${OUTPUT_PATH}`);
  console.log(`📊 Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log(`📬 Status: ${testResult}`);
}

main();
