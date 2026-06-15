# IB QA Mobile Automation – TypeScript + Appium + Mocha

A UI Test Automation framework for Android applications, built with **TypeScript**, **Appium**, and **Mocha**. Allure is supported for rich reporting.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Appium](https://appium.io/) 2.0+
- [Android SDK](https://developer.android.com/studio) with platform-tools
- Android device or emulator
- Java JDK 11+

## Project Structure

```
ib-qa-mobile-auto/
├── src/
│   ├── helpers/              # Driver management, base utilities, flow helpers
│   │   ├── appiumDriver.ts   # Appium server + driver lifecycle
│   │   ├── base.ts           # Element interaction utilities (find, click, scroll, swipe)
│   │   ├── loggerUtils.ts    # Winston-based singleton logger
│   │   ├── FlightBookingFlow.ts
│   │   ├── HotelsBookingFlow.ts
│   │   └── HomePageHelper.ts # Top-level test orchestrator
│   ├── pages/                # Page Object Model classes
│   │   ├── MobileCommonPage.ts
│   │   ├── HomePage.ts
│   │   ├── FlightsBookingPage.ts
│   │   └── HotelsBookingPage.ts
│   └── testsuite/            # Mocha test specs
│       └── testSuiteContacts.test.ts
├── TestData/
│   └── testData.ts           # Typed static test data
├── .env                      # Device capabilities & config
├── .mocharc.yml              # Mocha configuration
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json            # ESLint configuration
├── package.json
└── README.md
```

## Setup

1. **Install dependencies:**
   ```bash
   cd ib-qa-mobile-auto
   npm install
   ```

2. **Set up environment variables:**
   Edit `.env` to match your device/emulator:
   ```
   PLATFORM_NAME=android
   PLATFORM_VERSION=12
   DEVICE_NAME=Nexus 5
   UDID=emulator-5554
   APP_PACKAGE=com.example.app
   APP_ACTIVITY=com.example.app.MainActivity
   APK_FILE_PATH=app/app.apk
   ```

3. **Set up Android environment:**
   ```bash
   export ANDROID_HOME=<PATH_OF_ANDROID_SDK>
   export JAVA_HOME=<PATH_OF_JAVA_HOME>
   ```

## Running Tests

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run a single test by name:**
  ```bash
  npm run test:single -- "Test 01"
  ```

- **Type-check without emitting:**
  ```bash
  npm run build
  ```

- **Lint:**
  ```bash
  npm run lint
  ```

## Allure Reports

```bash
npm run test:allure
npx allure serve allure-results
```

## Xray Integration

This framework integrates with Xray Cloud to upload test results to Jira.

### Configuration

Set the following environment variables in `.env`:

```bash
# Xray Report Configuration
XRAY_REPORT_FILE=./xray-report.json
XRAY_CLIENT_ID=your-client-id
XRAY_CLIENT_SECRET=your-client-secret
XRAY_BASE_URL=https://eu.xray.cloud.getxray.app

# Project Configuration
JIRA_PROJECT_KEY=MYY
JIRA_TEST_EXECUTION_KEY=MYY-59  # Optional: Update existing execution instead of creating new one
```

**Note:** For EU Xray Cloud instances, use `https://eu.xray.cloud.getxray.app`. For global instances, use `https://xray.cloud.getxray.app`.

### Adding Xray Test IDs

Add Xray test IDs to your test cases using the format `[MYY-XX]` in the test title:

```typescript
it("Test 01: Create Single Contact [MYY-30]", async function () {
  // test code
});
```

### Workflow

1. **Run tests** to generate the Mochawesome report:
   ```bash
   npm test
   ```

2. **Generate Xray report** from Mochawesome results:
   ```bash
   npm run generate-xray-report
   ```

3. **Upload results to Xray**:
   ```bash
   npm run upload-xray-results
   ```

### Important Implementation Details

- **Authentication:** Uses OAuth2 client credentials flow with `Accept: text/plain` header and token quote stripping for EU region compatibility
- **Status Format:** Uses `PASSED`/`FAILED` (not `PASS`/`FAIL`) for Xray Cloud API compatibility
- **JSON Format:** Uses Xray Cloud JSON format with `info` section containing `project` field
- **Test Keys:** Must match existing test keys in your Xray project (e.g., MYY-30 to MYY-50)

## Architecture Notes

| Python (original)         | TypeScript (this framework)            |
| ------------------------- | -------------------------------------- |
| pytest fixtures           | Mocha `before`/`after` hooks           |
| `conftest.py`             | Mocha root hooks + `appiumDriver.ts`   |
| `AppiumBy` locators       | `[strategy, value]` tuple (`Locator`)  |
| `Base` class              | `Base` class                           |
| Page Object classes       | Page Object classes (same hierarchy)   |
| Helper/Flow classes       | Helper/Flow classes (same hierarchy)   |
| `test_suite_hopper.py`    | `testSuiteContacts.test.ts`           |
| `allure-pytest`           | `allure-mocha`                         |
| `python-dotenv`           | `dotenv`                               |
| `logging`                 | `winston`                              |

## Troubleshooting

- Ensure `adb devices` lists your emulator/device before running tests.
- If Appium doesn't start, install it globally: `npm install -g appium`.
- Install the UiAutomator2 driver: `appium driver install uiautomator2`.
