import winston from "winston";
import path from "path";
import fs from "fs";

const reportDir = path.resolve(__dirname, "../../report");
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp =
  new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
  "_" +
  new Date().toTimeString().split("")[0].replace(/:/g, "-");
const logFilename = `execution-${timestamp}.log`;

// In-memory log buffer — flushed to Allure after each test via afterEach
const logBuffer: string[] = [];

export const getLogBuffer = (): string[] => logBuffer;
export const clearLogBuffer = (): void => { logBuffer.length = 0; };

const winstonLogger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "MM/DD/YYYY hh:mm:ss A" }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} - ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(reportDir, logFilename),
      options: { flags: "w" },
    }),
  ],
});

const logger = {
  info: (message: string) => {
    winstonLogger.info(message);
    logBuffer.push(`[INFO]  ${message}`);
  },
  warn: (message: string) => {
    winstonLogger.warn(message);
    logBuffer.push(`[WARN]  ${message}`);
  },
  error: (message: string) => {
    winstonLogger.error(message);
    logBuffer.push(`[ERROR] ${message}`);
  },
  debug: (message: string) => {
    winstonLogger.debug(message);
    logBuffer.push(`[DEBUG] ${message}`);
  },
};

export default logger;