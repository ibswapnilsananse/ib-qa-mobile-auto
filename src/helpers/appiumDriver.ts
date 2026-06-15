import { remote, Browser } from "webdriverio";
import { ChildProcess, spawn } from "child_process";
import net from "net";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import logger from "./loggerUtils";
import winston from "winston";
import fs from "fs";

// ── Appium-only logger (separate file, never goes to console or reports) ──
const appiumLogDir = path.resolve(__dirname, "../../report/appium_server_logs");
if (!fs.existsSync(appiumLogDir)) {
  fs.mkdirSync(appiumLogDir, { recursive: true });
}
const appiumTimestamp =
  new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
  "_" +
  new Date().toTimeString().split(" ")[0].replace(/:/g, "-");

const appiumLogger = winston.createLogger({
  level: "debug",
  format: winston.format.printf(({ message }) => message as string),
  transports: [
    new winston.transports.File({
      filename: path.join(appiumLogDir, `appium_server_${appiumTimestamp}.log`),
      options: { flags: "w" },
    }),
  ],
  // NO Console transport — appium logs never appear in stdout
});

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface AppiumConfig {
  platformName: string;
  platformVersion: string;
  deviceName: string;
  udid: string;
  appPackage: string;
  appActivity: string;
  apkFilePath: string;
  fullReset: boolean;
  autoLaunchAppiumServer: boolean;
  implicitlyWait: number;
}

function readEnvConfig(): AppiumConfig {
  return {
    platformName: process.env.PLATFORM_NAME || "android",
    platformVersion: process.env.PLATFORM_VERSION || "12",
    deviceName: process.env.DEVICE_NAME || "Nexus 5",
    udid: process.env.UDID || "emulator-5554",
    appPackage: process.env.APP_PACKAGE || "com.hopper.mountainview.play",
    appActivity:
      process.env.APP_ACTIVITY ||
      "com.hopper.mountainview.activities.LaunchPage",
    apkFilePath: process.env.APK_FILE_PATH ?? "",
    fullReset: (process.env.FULL_RESET ?? "false").toLowerCase() === "true",
    autoLaunchAppiumServer:
      (process.env.AUTO_LAUNCH_APPIUM_SERVER || "true").toLowerCase() ===
      "true",
    implicitlyWait: parseInt(process.env.IMPLICITLY_WAIT || "2000", 10),
  };
}

let appiumProcess: ChildProcess | null = null;
let assignedPort: number | null = null;

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function checkAppiumServer(
  host: string,
  port: number
): Promise<{ running: boolean; url: string }> {
  const urls = [`${host}:${port}/wd/hub`, `${host}:${port}`];
  for (const url of urls) {
    try {
      const result = await new Promise<boolean>((resolve) => {
        http
          .get(`${url}/status`, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                const json = JSON.parse(data);
                resolve(
                  res.statusCode === 200 ||
                    json?.value?.ready === true
                );
              } catch {
                resolve(res.statusCode === 200);
              }
            });
          })
          .on("error", () => resolve(false));
      });
      if (result) {
        logger.info(`Appium server is running at ${url}`);
        return { running: true, url };
      }
    } catch {
      // continue to next url
    }
  }
  return { running: false, url: "" };
}

export async function startAppiumServer(): Promise<string> {
  const config = readEnvConfig();
  const host = "http://localhost";

  if (config.autoLaunchAppiumServer) {
    const port = await findFreePort();
    assignedPort = port;
    logger.info(`Starting Appium server on port ${port}`);

    appiumProcess = spawn("appium", ["-p", String(port), "-pa", "/wd/hub/"], {
      stdio: "pipe",
      shell: true,
    });

    appiumProcess.stdout?.on("data", (data) =>
      appiumLogger.debug(data.toString().trim())
    );
    appiumProcess.stderr?.on("data", (data) =>
      appiumLogger.debug(data.toString().trim())
    );

    // Wait for Appium to be ready
    const maxRetries = 30;
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const status = await checkAppiumServer(host, port);
      if (status.running) {
        logger.info(`Appium server started successfully at ${status.url}`);
        return status.url;
      }
    }
    throw new Error("Appium server failed to start within timeout");
  } else {
    const port = 4723;
    logger.info("Checking for manually started Appium server");
    const status = await checkAppiumServer(host, port);
    if (!status.running) {
      throw new Error(
        "Appium server is not started manually. Halting execution."
      );
    }
    logger.info(`Appium server already running at ${status.url}`);
    return status.url;
  }
}

export async function stopAppiumServer(): Promise<void> {
  if (appiumProcess) {
    logger.info("Stopping Appium server");
    appiumProcess.kill("SIGTERM");
    appiumProcess = null;
    assignedPort = null;
  }
}

export async function createDriver(appReset = false): Promise<Browser> {
  const config = readEnvConfig();
  const serverUrl = await startAppiumServer();

  const hasApk = config.apkFilePath && config.apkFilePath.trim() !== "";

  const capabilities: Record<string, unknown> = {
    platformName: config.platformName,
    "appium:platformVersion": config.platformVersion,
    "appium:deviceName": config.deviceName,
    "appium:udid": config.udid,
    "appium:automationName": "UiAutomator2",
    "appium:appPackage": config.appPackage,
    "appium:appActivity": config.appActivity,
    "appium:adbExecTimeout": 120000,
    "appium:uiautomator2ServerInstallTimeout": 180000,
    "appium:newCommandTimeout": 300000,
    "appium:forceAppLaunch": true,
    "appium:autoGrantPermissions": true,
    "appium:enforceXPath1": true,
    "appium:dontStopAppOnReset": !config.fullReset,
    "appium:skipDeviceInitialization": true,
  };

  if (hasApk) {
    capabilities["appium:app"] = path.resolve(__dirname, "../..", config.apkFilePath);
    logger.info(`APK provided — launching from file: ${config.apkFilePath}`);
  } else {
    logger.info(`No APK path — launching via appPackage: ${config.appPackage} / appActivity: ${config.appActivity}`);
  }

  if (config.fullReset || appReset) {
    capabilities["appium:fullReset"] = true;
    logger.info("Full reset enabled");
  }

  logger.info(`Connecting to Appium at ${serverUrl}`);
  const driver = await remote({
    path: serverUrl.includes("/wd/hub") ? "/wd/hub" : "/",
    hostname: "localhost",
    port: assignedPort ?? 4723,
    capabilities,
    logLevel: "warn",
  });
  (global as any).currentDriver = driver;

  // Note: setImplicitTimeout is not yet implemented in AndroidUiautomator2Driver
  // Use explicit waits (waitForDisplayed, waitForEnabled) in your tests instead
  logger.info("Appium driver created successfully");
  return driver;
}

export async function quitDriver(driver: Browser | null): Promise<void> {
  if (driver) {
    try {
      await driver.deleteSession();
      logger.info("Appium session closed successfully");
    } catch (e) {
      logger.error(`Error closing Appium session: ${e}`);
    } finally {
      (global as any).currentDriver = null;
    }
  }
}
