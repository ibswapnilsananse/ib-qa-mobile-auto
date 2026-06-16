const fs = require("fs");
require("dotenv").config();

const MOCHAWESOME_REPORT_FILE = "./mochawesome-report/mochawesome.json";
const XRAY_REPORT_FILE = "./xray-report.json";

function extractTestKey(title) {
  // Extract Xray test key from title like "Test 01: Create Single Contact [MYY-42]"
  const match = title.match(/\[([A-Z]+-\d+)\]/);
  if (match) {
    return match[1];
  }
  return null;
}

function generateXrayReport() {
  console.log("📄 Generating Xray report from Mochawesome report...");

  // Check if mochawesome report exists
  if (!fs.existsSync(MOCHAWESOME_REPORT_FILE)) {
    console.error(`✗ Mochawesome report not found: ${MOCHAWESOME_REPORT_FILE}`);
    process.exit(1);
  }

  // Read mochawesome report
  const mochawesomeData = JSON.parse(fs.readFileSync(MOCHAWESOME_REPORT_FILE, "utf8"));
  console.log(`📊 Found ${mochawesomeData.stats.tests} tests in Mochawesome report`);

  // Convert to Xray format
  const xrayTests = [];

  // totalSeen tracks all tests (with or without Xray key) so we stop
  // traversal once we've consumed exactly stats.tests entries — preventing
  // ghost tests from prior merged runs embedded deeper in the results tree.
  let totalSeen = 0;
  const totalExecuted = mochawesomeData.stats.tests || 0;

  function extractTestsFromSuite(suite) {
    if (totalSeen >= totalExecuted) return;
    if (suite.tests && suite.tests.length > 0) {
      for (const test of suite.tests) {
        if (totalSeen >= totalExecuted) break;
        totalSeen++;
        const testKey = extractTestKey(test.title);
        if (testKey) {
          xrayTests.push({
            testKey: testKey,
            status: test.pass ? "PASSED" : "FAILED",
            comment: test.err ? test.err.message : "Test executed successfully",
          });
        } else {
          console.warn(`⚠ No Xray test key found in: ${test.title}`);
        }
      }
    }
    if (suite.suites && suite.suites.length > 0) {
      for (const nestedSuite of suite.suites) {
        if (totalSeen >= totalExecuted) break;
        extractTestsFromSuite(nestedSuite);
      }
    }
  }

  // Extract tests from all suites
  if (mochawesomeData.results && mochawesomeData.results.length > 0) {
    mochawesomeData.results.forEach((result) => {
      if (result.suites && result.suites.length > 0) {
        result.suites.forEach((suite) => extractTestsFromSuite(suite));
      }
    });
  }

  // Read project key from environment
  const projectKey = process.env.JIRA_PROJECT_KEY || "MYY";

  // Create Xray report in the correct format for Xray Cloud API
  const xrayReport = {
    testExecutionKey: process.env.JIRA_TEST_EXECUTION_KEY || null,
    info: {
      summary: `Test Execution - ${new Date().toISOString()}`,
      description: "Automated test execution results",
      project: projectKey,
    },
    tests: xrayTests,
  };

  // Write Xray report
  fs.writeFileSync(XRAY_REPORT_FILE, JSON.stringify(xrayReport, null, 2));
  console.log(`✅ Xray report generated: ${XRAY_REPORT_FILE}`);
  console.log(`📝 ${xrayTests.length} tests with Xray IDs found`);
  console.log(`✓ Passed: ${xrayTests.filter((t) => t.status === "PASS").length}`);
  console.log(`✗ Failed: ${xrayTests.filter((t) => t.status === "FAIL").length}`);
}

generateXrayReport();
