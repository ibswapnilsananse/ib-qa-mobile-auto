import { getLogBuffer, clearLogBuffer } from "./loggerUtils";
import addContext from "mochawesome/addContext";
import { ContentType } from "allure-js-commons";
import * as fs from "fs";
import * as path from "path";
const { allure } = require("allure-mocha/runtime");

const screenshotDir = path.resolve(__dirname, "../../report/failure_screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function isAllureActive(): boolean {
  try {
    return typeof allure?.currentTest !== "undefined" && allure.currentTest !== null;
  } catch {
    return false;
  }
}

function allureAttachment(name: string, content: Buffer, opts: { contentType: string; fileExtension: string }): void {
  if (!isAllureActive()) return;
  try {
    allure.attachment(name, content, opts);
  } catch { /* skip */ }
}

export const mochaHooks = {
  async afterEach(this: Mocha.Context) {
    const testFailed = this.currentTest?.state === "failed";
    const testName = this.currentTest?.title ?? "unknown";
    const driver = (global as any).currentDriver;

    // ── 1. Screenshot FIRST (before driver is quit) ───────────────────
    if (testFailed && driver) {
      try {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .replace("T", "_")
          .split("Z")[0];
        const safeTestName = testName.replace(/[^a-zA-Z0-9]/g, "_");
        const filePath = path.join(screenshotDir, `${safeTestName}_${timestamp}.png`);

        await driver.saveScreenshot(filePath);

        allureAttachment("Failure Screenshot", fs.readFileSync(filePath), { contentType: ContentType.PNG, fileExtension: "png" });

        try {
          addContext(this, { title: "Failure Screenshot", value: filePath });
        } catch { /* skip */ }

      } catch { /* session already dead, skip */ }
    }

    // ── 2. Quit driver ────────────────────────────────────────────────
    if (driver) {
      try {
        await driver.deleteSession();
      } catch { /* skip */ }
      (global as any).currentDriver = null;
    }

    // ── 3. Flush logs AFTER driver quit ───────────────────────────────
    const logs = getLogBuffer();
    if (logs.length > 0) {
      const logText = logs.join("\n");

      allureAttachment("Test Logs", Buffer.from(logText), { contentType: ContentType.TEXT, fileExtension: "txt" });

      try {
        addContext(this, { title: "Test Logs", value: logText });
      } catch { /* skip */ }

      clearLogBuffer(); // ← MUST be last
    }
  }
};