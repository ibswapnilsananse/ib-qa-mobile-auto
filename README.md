# Hopper App Automation – TypeScript + Appium + Mocha

A UI Test Automation framework for the Hopper native Android application, built with **TypeScript**, **Appium**, and **Mocha**. Allure is supported for rich reporting.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Appium](https://appium.io/) 2.0+
- [Android SDK](https://developer.android.com/studio) with platform-tools
- Android device or emulator
- Java JDK 11+

## Project Structure

```
HopperClientDemo-ts/
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
│       └── testSuiteHopper.test.ts
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
   cd HopperClientDemo-ts
   npm install
   ```

2. **Set up environment variables:**
   Edit `.env` to match your device/emulator:
   ```
   PLATFORM_NAME=android
   PLATFORM_VERSION=12
   DEVICE_NAME=Nexus 5
   UDID=emulator-5554
   APP_PACKAGE=com.hopper.mountainview.play
   APP_ACTIVITY=com.hopper.mountainview.activities.LaunchPage
   APK_FILE_PATH=app/hopper.apk
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

## Architecture Notes

| Python (original)         | TypeScript (this framework)            |
| ------------------------- | -------------------------------------- |
| pytest fixtures           | Mocha `before`/`after` hooks           |
| `conftest.py`             | Mocha root hooks + `appiumDriver.ts`   |
| `AppiumBy` locators       | `[strategy, value]` tuple (`Locator`)  |
| `Base` class              | `Base` class                           |
| Page Object classes       | Page Object classes (same hierarchy)   |
| Helper/Flow classes       | Helper/Flow classes (same hierarchy)   |
| `test_suite_hopper.py`    | `testSuiteHopper.test.ts`             |
| `allure-pytest`           | `allure-mocha`                         |
| `python-dotenv`           | `dotenv`                               |
| `logging`                 | `winston`                              |

## Troubleshooting

- Ensure `adb devices` lists your emulator/device before running tests.
- If Appium doesn't start, install it globally: `npm install -g appium`.
- Install the UiAutomator2 driver: `appium driver install uiautomator2`.
