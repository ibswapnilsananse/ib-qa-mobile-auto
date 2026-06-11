import winston from "winston";
import path from "path";
import fs from "fs";

const reportDir = path.resolve(__dirname, "../../report");
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] + "_" + new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
const logFilename = `execution-${timestamp}.log`;

const logger = winston.createLogger({
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

export default logger;
