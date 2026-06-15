const fs = require("fs");
const https = require("https");
const http = require("http");
require("dotenv").config();

// Configuration - these should be set as environment variables
const XRAY_BASE_URL =
  process.env.XRAY_API_BASE_URL || process.env.XRAY_BASE_URL || "https://xray.cloud.xpand-it.com";
const XRAY_CLIENT_ID = process.env.XRAY_CLIENT_ID || "your-client-id";
const XRAY_CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET || "your-client-secret";
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "YOUR_PROJECT_KEY";
const TEST_EXECUTION_KEY = process.env.JIRA_TEST_EXECUTION_KEY || null;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || null;

const XRAY_REPORT_FILE = process.env.XRAY_REPORT_FILE || "./xray-report.json";

// OAuth2 token cache
let authToken = null;
let tokenExpiry = null;

async function getAuthToken() {
  // Return cached token if still valid
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("✓ Using cached authentication token");
    return authToken;
  }

  return new Promise((resolve, reject) => {
    const isHttps = XRAY_BASE_URL.startsWith("https://");
    const protocol = isHttps ? https : http;

    const authData = {
      client_id: XRAY_CLIENT_ID,
      client_secret: XRAY_CLIENT_SECRET,
    };

    const options = {
      hostname: new URL(XRAY_BASE_URL).hostname,
      port: isHttps ? 443 : 80,
      path: "/api/v2/authenticate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
      },
    };

    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          authToken = data.trim().replace(/"/g, "");
          // Cache token for 50 minutes (tokens expire after 60 minutes)
          tokenExpiry = Date.now() + 50 * 60 * 1000;
          console.log("✓ Successfully obtained authentication token");
          resolve(authToken);
        } else {
          console.error("✗ Failed to obtain authentication token");
          console.error("Status:", res.statusCode);
          console.error("Response:", data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("✗ Error obtaining authentication token:", error.message);
      reject(error);
    });

    req.write(JSON.stringify(authData));
    req.end();
  });
}

function uploadToXray(reportData, token) {
  return new Promise((resolve, reject) => {
    const isHttps = XRAY_BASE_URL.startsWith("https://");
    const protocol = isHttps ? https : http;

    // Use the entire report data as payload (Xray JSON format)
    const payload = reportData;

    const options = {
      hostname: new URL(XRAY_BASE_URL).hostname,
      port: isHttps ? 443 : 80,
      path: "/api/v2/import/execution",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("📡 Response Headers:", JSON.stringify(res.headers, null, 2));

        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✓ Successfully uploaded test results to Xray");
          console.log("Response Body:", data);

          // Check headers for execution ID
          const executionKeyFromHeader =
            res.headers["x-ray-test-execution-key"] || res.headers["x-test-execution-key"];

          try {
            const response = data ? JSON.parse(data) : {};

            // Extract and display test execution key from various sources
            let executionKey =
              response.testExecutionKey || response.key || response.id || executionKeyFromHeader;

            if (executionKey) {
              console.log("📋 Test Execution Key:", executionKey);
              const jiraBaseUrl = JIRA_BASE_URL || "https://your-jira-instance.atlassian.net";
              const jiraUrl = `${jiraBaseUrl}/browse/${executionKey}`;
              console.log("🔗 Jira URL:", jiraUrl);
            } else {
              console.log("⚠ No test execution key found in response");
              console.log(
                "💡 You may need to check your Xray project to find the newly created Test Execution"
              );
            }

            // Save execution info to file for reference
            const executionInfo = {
              timestamp: new Date().toISOString(),
              testExecutionKey: executionKey || null,
              url: executionKey
                ? `${JIRA_BASE_URL || "https://your-jira-instance.atlassian.net"}/browse/${executionKey}`
                : null,
              testsUploaded: payload.tests ? payload.tests.length : 0,
              response: response,
              headers: res.headers,
            };
            fs.writeFileSync("./xray-execution-info.json", JSON.stringify(executionInfo, null, 2));
            console.log("💾 Execution info saved to: xray-execution-info.json");

            resolve(response);
          } catch (error) {
            console.log("Response (raw):", data);
            console.log("⚠ Could not parse response as JSON");

            // Still save what we have
            const executionInfo = {
              timestamp: new Date().toISOString(),
              testExecutionKey: executionKeyFromHeader || null,
              url: executionKeyFromHeader
                ? `${JIRA_BASE_URL || "https://your-jira-instance.atlassian.net"}/browse/${executionKeyFromHeader}`
                : null,
              testsUploaded: payload.tests ? payload.tests.length : 0,
              rawResponse: data,
              headers: res.headers,
            };
            fs.writeFileSync("./xray-execution-info.json", JSON.stringify(executionInfo, null, 2));
            console.log("💾 Execution info saved to: xray-execution-info.json");

            resolve(data);
          }
        } else {
          console.error("✗ Failed to upload test results to Xray");
          console.error("Status:", res.statusCode);
          console.error("Response:", data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("✗ Error uploading to Xray:", error.message);
      reject(error);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  console.log("📤 Uploading test results to Xray...");
  console.log(`🌐 Using Xray API endpoint: ${XRAY_BASE_URL}`);

  // Check if report file exists
  if (!fs.existsSync(XRAY_REPORT_FILE)) {
    console.error(`✗ Xray report file not found: ${XRAY_REPORT_FILE}`);
    process.exit(1);
  }

  // Read the Xray report
  const reportData = JSON.parse(fs.readFileSync(XRAY_REPORT_FILE, "utf8"));
  console.log(`📄 Found ${reportData.tests?.length || 0} test results`);

  // Validate configuration
  if (!XRAY_CLIENT_ID || XRAY_CLIENT_ID === "your-client-id") {
    console.error("✗ XRAY_CLIENT_ID environment variable not set");
    process.exit(1);
  }

  if (!XRAY_CLIENT_SECRET || XRAY_CLIENT_SECRET === "your-client-secret") {
    console.error("✗ XRAY_CLIENT_SECRET environment variable not set");
    process.exit(1);
  }

  if (!PROJECT_KEY || PROJECT_KEY === "YOUR_PROJECT_KEY") {
    console.error("✗ JIRA_PROJECT_KEY environment variable not set");
    process.exit(1);
  }

  try {
    // Get OAuth2 authentication token
    const token = await getAuthToken();

    // Upload test results using the token
    await uploadToXray(reportData, token);

    console.log("✅ Xray upload completed successfully");
  } catch (error) {
    console.error("❌ Xray upload failed:", error.message);
    process.exit(1);
  }
}

main();
