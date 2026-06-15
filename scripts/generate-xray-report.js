const fs = require('fs');
require('dotenv').config();

const MOCHAWESOME_REPORT_FILE = './mochawesome-report/report.json';
const XRAY_REPORT_FILE = './xray-report.json';

function extractTestKey(title) {
  // Extract Xray test key from title like "Test 01: Create Single Contact [MYY-42]"
  const match = title.match(/\[([A-Z]+-\d+)\]/);
  if (match) {
    return match[1];
  }
  return null;
}

function generateXrayReport() {
  console.log('📄 Generating Xray report from Mochawesome report...');

  // Check if mochawesome report exists
  if (!fs.existsSync(MOCHAWESOME_REPORT_FILE)) {
    console.error(`✗ Mochawesome report not found: ${MOCHAWESOME_REPORT_FILE}`);
    process.exit(1);
  }

  // Read mochawesome report
  const mochawesomeData = JSON.parse(fs.readFileSync(MOCHAWESOME_REPORT_FILE, 'utf8'));
  console.log(`📊 Found ${mochawesomeData.stats.tests} tests in Mochawesome report`);

  // Convert to Xray format
  const xrayTests = [];

  function extractTestsFromSuite(suite) {
    if (suite.tests && suite.tests.length > 0) {
      suite.tests.forEach(test => {
        const testKey = extractTestKey(test.title);
        if (testKey) {
          xrayTests.push({
            testKey: testKey,
            status: test.pass ? 'PASSED' : 'FAILED',
            comment: test.err ? test.err.message : 'Test executed successfully'
          });
        } else {
          console.warn(`⚠ No Xray test key found in: ${test.title}`);
        }
      });
    }
    if (suite.suites && suite.suites.length > 0) {
      suite.suites.forEach(nestedSuite => extractTestsFromSuite(nestedSuite));
    }
  }

  // Extract tests from all suites
  if (mochawesomeData.results && mochawesomeData.results.length > 0) {
    mochawesomeData.results.forEach(result => {
      if (result.suites && result.suites.length > 0) {
        result.suites.forEach(suite => extractTestsFromSuite(suite));
      }
    });
  }

  // Read project key from environment
  const projectKey = process.env.JIRA_PROJECT_KEY || 'MYY';

  // Create Xray report in the correct format for Xray Cloud API
  const xrayReport = {
    testExecutionKey: process.env.JIRA_TEST_EXECUTION_KEY || null,
    info: {
      summary: `Test Execution - ${new Date().toISOString()}`,
      description: 'Automated test execution results',
      project: projectKey
    },
    tests: xrayTests
  };

  // Write Xray report
  fs.writeFileSync(XRAY_REPORT_FILE, JSON.stringify(xrayReport, null, 2));
  console.log(`✅ Xray report generated: ${XRAY_REPORT_FILE}`);
  console.log(`📝 ${xrayTests.length} tests with Xray IDs found`);
  console.log(`✓ Passed: ${xrayTests.filter(t => t.status === 'PASS').length}`);
  console.log(`✗ Failed: ${xrayTests.filter(t => t.status === 'FAIL').length}`);
}

generateXrayReport();
