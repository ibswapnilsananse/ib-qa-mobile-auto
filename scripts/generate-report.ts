#!/usr/bin/env ts-node
/**
 * Generate an HTML summary report from a mochawesome JSON result file.
 * Equivalent of generate_pytest_report.py but for the Mocha/TypeScript framework.
 *
 * Usage:
 *   ts-node scripts/generate-report.ts [--detailed] [--report-title "My Title"]
 *   node -r ts-node/register scripts/generate-report.ts
 */

import fs from "fs";
import path from "path";

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const detailed = args.includes("--detailed");
const titleIdx = args.indexOf("--report-title");
const reportTitle =
  titleIdx !== -1 && args[titleIdx + 1] ? args[titleIdx + 1] : "IB-QA Mobile Automation — Test Execution Summary";

// ── Paths ───────────────────────────────────────────────────────────────────
const MOCHAWESOME_FILE = path.resolve(process.cwd(), "mochawesome-report/mochawesome.json");
const OUTPUT_FILE = path.resolve(process.cwd(), "mochawesome-report/ib-qa-test-summary.html");

// ── Types ───────────────────────────────────────────────────────────────────
interface MochawesomeStat {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  duration: number;
  start: string;
  end: string;
  passPercent: number;
  pendingPercent: number;
}

interface MochaTest {
  title: string;
  fullTitle: string;
  duration: number;
  pass: boolean;
  fail: boolean;
  pending: boolean;
  err?: { message?: string };
}

interface MochaSuite {
  title: string;
  suites: MochaSuite[];
  tests: MochaTest[];
}

interface MochawesomeReport {
  stats: MochawesomeStat;
  results: Array<{ suites: MochaSuite[] }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function pct(n: number, total: number): string {
  if (total === 0) return "0.0";
  return ((n / total) * 100).toFixed(1);
}

function durationLabel(ms: number): string {
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(2)} min`;
}

function flattenTests(suite: MochaSuite): MochaTest[] {
  const tests: MochaTest[] = [...(suite.tests || [])];
  for (const sub of suite.suites || []) {
    tests.push(...flattenTests(sub));
  }
  return tests;
}

// ── Status badge ─────────────────────────────────────────────────────────────
function badge(test: MochaTest): string {
  if (test.pass) return `<span class="badge pass">PASSED</span>`;
  if (test.fail) return `<span class="badge fail">FAILED</span>`;
  return `<span class="badge skip">SKIPPED</span>`;
}

// ── Detailed rows ─────────────────────────────────────────────────────────────
function buildDetailedRows(suites: MochaSuite[]): string {
  const rows: string[] = [];
  for (const suite of suites) {
    const tests = flattenTests(suite);
    for (const t of tests) {
      const err = t.err?.message ? `<br><span class="err">${t.err.message.slice(0, 200)}</span>` : "";
      rows.push(`
        <tr>
          <td>${suite.title}</td>
          <td>${t.title}${err}</td>
          <td>${badge(t)}</td>
          <td>${durationLabel(t.duration ?? 0)}</td>
        </tr>`);
    }
  }
  return rows.join("\n");
}

// ── Suite summary rows ────────────────────────────────────────────────────────
function buildSuiteRows(suites: MochaSuite[]): string {
  const rows: string[] = [];
  for (const suite of suites) {
    const tests = flattenTests(suite);
    const passed = tests.filter((t) => t.pass).length;
    const failed = tests.filter((t) => t.fail).length;
    const skipped = tests.filter((t) => t.pending).length;
    const total = tests.length;
    const dur = tests.reduce((a, t) => a + (t.duration ?? 0), 0);
    const rate = pct(passed, total);
    rows.push(`
      <tr>
        <td>${suite.title}</td>
        <td>${total}</td>
        <td class="pass-col">${passed}</td>
        <td class="fail-col">${failed}</td>
        <td class="skip-col">${skipped}</td>
        <td>${durationLabel(dur)}</td>
        <td>${rate}%</td>
      </tr>`);
  }
  return rows.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main(): void {
  console.log("📄 Generating HTML report from mochawesome results...");

  if (!fs.existsSync(MOCHAWESOME_FILE)) {
    console.error(`✗ Mochawesome report not found: ${MOCHAWESOME_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(MOCHAWESOME_FILE, "utf8");
  const report: MochawesomeReport = JSON.parse(raw);
  const { stats } = report;

  const total = stats.tests;
  const passed = stats.passes;
  const failed = stats.failures;
  const skipped = stats.pending;
  const duration = durationLabel(stats.duration);
  const startTime = stats.start ? new Date(stats.start).toUTCString() : "N/A";
  const passRate = pct(passed, total);

  const overallStatus = failed > 0 ? "FAILED" : "PASSED";
  const statusColor = failed > 0 ? "#d32f2f" : "#2e7d32";

  const allSuites = report.results.flatMap((r) => r.suites);

  const suiteRows = buildSuiteRows(allSuites);
  const detailedSection = detailed
    ? `
    <h2>Detailed Test Results</h2>
    <table>
      <thead>
        <tr><th>Suite</th><th>Test Case</th><th>Status</th><th>Duration</th></tr>
      </thead>
      <tbody>
        ${buildDetailedRows(allSuites)}
      </tbody>
    </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${reportTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #F2F2F2; padding: 30px; color: #333; }
    .container { max-width: 900px; margin: auto; background: #fff; border-radius: 12px;
                 padding: 30px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
    h1 { text-align: center; color: #222; font-size: 22px; margin-bottom: 6px; }
    .status-banner { text-align: center; font-size: 18px; font-weight: bold;
                     color: ${statusColor}; margin-bottom: 24px; }
    .meta { font-size: 13px; color: #555; text-align: center; margin-bottom: 28px; }
    .summary-grid { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .card { flex: 1; min-width: 140px; border-radius: 8px; padding: 16px 12px;
            text-align: center; border: 1px solid #E0E0E0; }
    .card .num { font-size: 28px; font-weight: bold; }
    .card .lbl { font-size: 12px; color: #666; margin-top: 4px; }
    .card.total  { background: #E3F2FD; }
    .card.pass   { background: #E8F5E9; }
    .card.fail   { background: #FFEBEE; }
    .card.skip   { background: #FFFDE7; }
    .card.rate   { background: #F3E5F5; }
    h2 { font-size: 16px; color: #222; margin: 24px 0 10px; border-bottom: 1px solid #E0E0E0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 28px; }
    th { background: #333; color: #fff; padding: 10px 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #E0E0E0; vertical-align: top; }
    tr:nth-child(even) td { background: #F9F9F9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px;
             font-size: 11px; font-weight: bold; }
    .badge.pass { background: #C8E6C9; color: #1B5E20; }
    .badge.fail { background: #FFCDD2; color: #B71C1C; }
    .badge.skip { background: #FFF9C4; color: #827717; }
    .pass-col { color: #2e7d32; font-weight: bold; }
    .fail-col { color: #d32f2f; font-weight: bold; }
    .skip-col { color: #616161; }
    .err { color: #b71c1c; font-size: 11px; font-family: monospace; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 24px;
              border-top: 1px solid #E0E0E0; padding-top: 14px; }
  </style>
</head>
<body>
<div class="container">
  <h1>📱 ${reportTitle}</h1>
  <div class="status-banner">Overall Status: ${overallStatus}</div>
  <div class="meta">Started: ${startTime} &nbsp;|&nbsp; Duration: ${duration} &nbsp;|&nbsp; Pass Rate: ${passRate}%</div>

  <div class="summary-grid">
    <div class="card total"><div class="num">${total}</div><div class="lbl">Total Tests</div></div>
    <div class="card pass"><div class="num" style="color:#2e7d32">${passed}</div><div class="lbl">✅ Passed</div></div>
    <div class="card fail"><div class="num" style="color:#d32f2f">${failed}</div><div class="lbl">🔴 Failed</div></div>
    <div class="card skip"><div class="num" style="color:#616161">${skipped}</div><div class="lbl">⚪ Skipped</div></div>
    <div class="card rate"><div class="num" style="color:#6a1b9a">${passRate}%</div><div class="lbl">Pass Rate</div></div>
  </div>

  <h2>Suite Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Test Suite</th><th>Total</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Duration</th><th>Pass Rate</th>
      </tr>
    </thead>
    <tbody>
      ${suiteRows}
    </tbody>
  </table>

  ${detailedSection}

  <div class="footer">
    Generated by IB-QA Mobile Automation Framework &nbsp;|&nbsp; ${new Date().toUTCString()}
  </div>
</div>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_FILE, html, "utf8");
  console.log(`✅ HTML report saved: ${OUTPUT_FILE}`);
  console.log(`📊 Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log(`🔍 Report type: ${detailed ? "Detailed" : "Summary"}`);
}

main();
