# IB QA Mobile Automation – TypeScript + Appium + Mocha

A cross-platform UI Test Automation framework for **Android** and **iOS** applications, built with **TypeScript**, **Appium**, and **Mocha**. Supports local devices/emulators/simulators, HeadSpin, and BrowserStack cloud providers. Allure, Mochawesome, and Xray reporting are built in.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Android Setup (Emulator / Real Device)](#android-setup-emulator--real-device)
- [iOS Setup (Xcode / Simulator / Real Device)](#ios-setup-xcode--simulator--real-device)
- [Environment Variables Reference](#environment-variables-reference)
- [Running Tests](#running-tests)
- [Reporting](#reporting)
- [Xray Integration](#xray-integration)
- [GitHub Actions CI/CD Pipeline](#github-actions-cicd-pipeline)
- [Architecture Notes](#architecture-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool                   | Min Version | Purpose                              |
| ---------------------- | ----------- | ------------------------------------ |
| Node.js                | 18+         | Runtime                              |
| npm                    | 9+          | Package manager                      |
| Appium                 | 2.0+        | Mobile automation server             |
| Java JDK               | 11+         | Android tooling                      |
| Android SDK            | —           | Android automation (emulator/device) |
| Xcode                  | 15+         | iOS automation (simulator/device)    |
| Xcode Command Line Tools | —        | `xcodebuild`, `simctl`               |

## Project Structure

```
ib-qa-mobile-auto/
├── src/
│   ├── helpers/                    # Driver management, base utilities, flow helpers
│   │   ├── appiumDriver.ts         # Appium server + driver lifecycle (Android & iOS)
│   │   ├── base.ts                 # Element interaction utilities (find, click, scroll, swipe)
│   │   ├── hooks.ts                # Mocha root hooks (screenshot-on-failure, log flush)
│   │   ├── loggerUtils.ts          # Winston-based singleton logger
│   │   ├── ContactsHelper.ts       # Contacts test orchestrator
│   │   ├── DialerHelper.ts         # Dialer test orchestrator
│   │   ├── IosReminderHelper.ts    # iOS Reminders test orchestrator
│   │   └── WhereIsMyTrainHelper.ts # Train app test orchestrator
│   ├── pages/                      # Page Object Model classes
│   │   ├── MobileCommonPage.ts
│   │   ├── ContactsPage.ts
│   │   ├── DialerPage.ts
│   │   ├── IosReminderPage.ts
│   │   ├── WhereIsMyTrainPage.ts
│   │   ├── HomePage.ts
│   │   ├── FlightsBookingPage.ts
│   │   └── HotelsBookingPage.ts
│   └── testsuite/                  # Mocha test specs
│       ├── testSuiteContacts.test.ts
│       ├── testSuiteDialerWorkflow.test.ts
│       ├── testSuiteIosReminder.test.ts
│       └── WhereIsMyTrain/
├── TestData/
│   └── testData.ts                 # Typed static test data
├── PageSource/                     # Captured XML page sources for reference
│   └── IosReminderApp/
├── scripts/
│   ├── generate-xray-report.js     # Generate Xray-compatible JSON from Mochawesome
│   └── upload-xray-results.js      # Upload results to Xray Cloud via OAuth2
├── report/                         # Generated reports & logs (gitignored)
│   ├── appium_server_logs/
│   ├── failure_screenshots/
│   └── execution-*.log
├── .env                            # Active device capabilities & config (not committed)
├── .env.example                    # Template with all supported variables
├── reporter-config.json            # Multi-reporter config (Allure + Mochawesome + Xray)
├── tsconfig.json
├── .eslintrc.json
├── package.json
└── README.md
```

---

## Android Setup (Emulator / Real Device)

### 1. Install System Dependencies

```bash
# Install Appium globally
npm install -g appium

# Install the UiAutomator2 driver
appium driver install uiautomator2

# Verify installation
appium driver list --installed
```

### 2. Set Up Android SDK

1. Install [Android Studio](https://developer.android.com/studio).
2. Open **SDK Manager** → install the SDK Platform for your target Android version.
3. Install **SDK Build-Tools**, **Platform-Tools**, and **Emulator** from the SDK Tools tab.
4. Set environment variables (add to `~/.zshrc` or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
# export ANDROID_HOME=$HOME/Android/Sdk              # Linux
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
export JAVA_HOME=$(/usr/libexec/java_home)           # macOS
# export JAVA_HOME=/usr/lib/jvm/java-11-openjdk      # Linux
```

5. Reload your shell: `source ~/.zshrc`

### 3a. Emulator Setup

1. Open Android Studio → **Device Manager** → **Create Virtual Device**.
2. Select a device profile (e.g., Pixel 7) and a system image (e.g., API 34).
3. Launch the emulator.
4. Get the emulator UDID:

```bash
adb devices
# Output example:
# emulator-5554   device
```

5. Update `.env`:

```bash
PLATFORM_NAME=android
PLATFORM_VERSION=14
DEVICE_NAME=Pixel 7
UDID=emulator-5554
APP_PACKAGE=com.google.android.dialer
APP_ACTIVITY=com.google.android.dialer.extensions.GoogleDialtactsActivity
APK_FILE_PATH=
FULL_RESET=false
```

### 3b. Real Device Setup

1. Enable **Developer Options** on the device (tap Build Number 7 times in Settings → About Phone).
2. Enable **USB Debugging** in Developer Options.
3. Connect via USB and authorize the computer on the device.
4. Get the device UDID:

```bash
adb devices
# Output example:
# R5CR1234567   device
```

5. Update `.env` with your device's UDID and Android version:

```bash
PLATFORM_NAME=android
PLATFORM_VERSION=14
DEVICE_NAME=Galaxy S24
UDID=R5CR1234567
```

**Wireless debugging (optional):**

```bash
adb tcpip 5555
adb connect <DEVICE_IP>:5555
# UDID becomes: <DEVICE_IP>:5555
```

### 4. Install Project & Run

```bash
npm install
npm test
```

---

## iOS Setup (Xcode / Simulator / Real Device)

### 1. Install System Dependencies

```bash
# Install Xcode from the Mac App Store, then:
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept

# Install Appium globally (if not already)
npm install -g appium

# Install the XCUITest driver
appium driver install xcuitest

# Verify
appium driver list --installed
```

### 2a. Simulator Setup

1. Open Xcode → **Settings** → **Platforms** → download the iOS Simulator runtime you need (e.g., iOS 18.x, 26.x).
2. Create or boot a simulator:

```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 17"
# Or open via Xcode: Window → Devices and Simulators → Simulators
```

3. Get the Simulator UDID:

```bash
xcrun simctl list devices | grep "iPhone 17"
# Output example:
#   iPhone 17 (480AB671-5136-4BB4-A11E-E1EEFA72C6AF) (Booted)
```

4. Update `.env`:

```bash
PLATFORM_NAME=iOS
AUTOMATION_NAME=XCUITest
DEVICE_NAME=iPhone 17
PLATFORM_VERSION=26.5
UDID=480AB671-5136-4BB4-A11E-E1EEFA72C6AF
BUNDLE_ID=com.apple.reminders
SHOW_XCODE_LOG=true
```

### 2b. Real Device Setup

1. Connect the iOS device via USB.
2. Trust the computer on the device.
3. Get the device UDID:

```bash
# Via Xcode: Window → Devices and Simulators → select device → copy Identifier
# Or via command line:
xcrun xctrace list devices
```

4. **Provisioning (required for real devices):**
   - Open Xcode → select any project → **Signing & Capabilities**.
   - Set your Apple Developer Team.
   - Appium's WebDriverAgent must be signed with a valid provisioning profile.
   - See [Appium XCUITest Real Device Setup](https://appium.github.io/appium-xcuitest-driver/latest/preparation/real-device-config/) for details.

5. Update `.env` with the real device UDID and iOS version.

### 3. Install Project & Run

```bash
npm install
npm test
```

---

## Environment Variables Reference

All variables are read from the **`.env`** file at the project root (loaded by `dotenv` in `src/helpers/appiumDriver.ts`). Copy `.env.example` to `.env` and update values.

### Device & Platform

| Variable                    | Where to Update | Where It's Used                        | Description                                                                 |
| --------------------------- | --------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `PLATFORM_NAME`             | `.env`          | `appiumDriver.ts → readEnvConfig()`    | `android` or `iOS`. Determines which driver is created.                     |
| `PLATFORM_VERSION`          | `.env`          | `appiumDriver.ts → capabilities`       | OS version of the device/emulator/simulator (e.g., `14`, `26.5`).           |
| `DEVICE_NAME`               | `.env`          | `appiumDriver.ts → capabilities`       | Device name (e.g., `Pixel 7`, `iPhone 17`).                                 |
| `UDID`                      | `.env`          | `appiumDriver.ts → capabilities`       | Device/emulator/simulator unique ID. Get via `adb devices` or `xcrun simctl list devices`. |
| `AUTOMATION_NAME`           | `.env`          | `appiumDriver.ts → buildBaseIosCapabilities()` | iOS only. Set to `XCUITest`.                                        |

### Android-Specific

| Variable                    | Where to Update | Where It's Used                        | Description                                                                 |
| --------------------------- | --------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `APP_PACKAGE`               | `.env`          | `appiumDriver.ts → capabilities`       | Android app package (e.g., `com.google.android.dialer`).                    |
| `APP_ACTIVITY`              | `.env`          | `appiumDriver.ts → capabilities`       | Android launch activity (e.g., `com.google.android.dialer.extensions.GoogleDialtactsActivity`). |
| `APK_FILE_PATH`             | `.env`          | `appiumDriver.ts → capabilities`       | Path to `.apk` file (relative to project root). Leave empty to launch installed app. |
| `FULL_RESET`                | `.env`          | `appiumDriver.ts → capabilities`       | `true` to uninstall/reinstall app before test. Default: `false`.            |

### iOS-Specific

| Variable                    | Where to Update | Where It's Used                        | Description                                                                 |
| --------------------------- | --------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `BUNDLE_ID`                 | `.env`          | `appiumDriver.ts → buildBaseIosCapabilities()` | iOS app bundle ID (e.g., `com.apple.reminders`).                    |
| `SHOW_XCODE_LOG`            | `.env`          | `appiumDriver.ts → capabilities`       | `true` to show Xcode logs during test execution.                            |

### Appium Server

| Variable                    | Where to Update | Where It's Used                        | Description                                                                 |
| --------------------------- | --------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `AUTO_LAUNCH_APPIUM_SERVER` | `.env`          | `appiumDriver.ts → startAppiumServer()`| `true` to auto-start Appium on a random free port. `false` to use a manually started server on port 4723. |
| `IMPLICITLY_WAIT`           | `.env`          | `appiumDriver.ts → readEnvConfig()`    | Implicit wait timeout in ms. Default: `2000`.                               |

### Test Provider (Cloud Providers)

| Variable                    | Where to Update | Where It's Used                        | Description                                                                 |
| --------------------------- | --------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `TEST_PROVIDER`             | `.env`          | `appiumDriver.ts → createDriver()`     | `local`, `headspin`, or `browserstack`. Default: `local`.                   |
| `HEADSPIN_API_TOKEN`        | `.env` / Secret | `appiumDriver.ts → createHeadSpinDriver()` | HeadSpin API token. Required when `TEST_PROVIDER=headspin`.            |
| `HEADSPIN_HOST`             | `.env` / Secret | `appiumDriver.ts → createHeadSpinDriver()` | HeadSpin host. Default: `appium-dev.headspin.io`.                      |
| `BROWSERSTACK_USER`         | `.env` / Secret | `appiumDriver.ts → createBrowserStackDriver()` | BrowserStack username. Required when `TEST_PROVIDER=browserstack`. |
| `BROWSERSTACK_KEY`          | `.env` / Secret | `appiumDriver.ts → createBrowserStackDriver()` | BrowserStack access key. Required when `TEST_PROVIDER=browserstack`. |
| `BROWSERSTACK_APP_URL`      | `.env` / Secret | `appiumDriver.ts → createBrowserStackDriver()` | BrowserStack uploaded app URL (e.g., `bs://abc123`).               |

### Xray / Jira Integration

| Variable                    | Where to Update | Where It's Used                                      | Description                                                    |
| --------------------------- | --------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `XRAY_BASE_URL`             | `.env` / Secret | `scripts/upload-xray-results.js`                     | Xray Cloud API base URL.                                       |
| `XRAY_CLIENT_ID`            | `.env` / Secret | `scripts/upload-xray-results.js → getAuthToken()`    | Xray Cloud OAuth2 client ID.                                   |
| `XRAY_CLIENT_SECRET`        | `.env` / Secret | `scripts/upload-xray-results.js → getAuthToken()`    | Xray Cloud OAuth2 client secret.                               |
| `JIRA_PROJECT_KEY`          | `.env` / Secret | `scripts/upload-xray-results.js`                     | Jira project key (e.g., `MYY`).                                |
| `JIRA_TEST_EXECUTION_KEY`   | `.env`          | `scripts/upload-xray-results.js`                     | Optional. Existing Test Execution key to update.                |
| `XRAY_REPORT_FILE`          | `.env`          | `scripts/upload-xray-results.js`                     | Path to generated Xray JSON report. Default: `./xray-report.json`. |

### Other

| Variable                    | Where to Update | Where It's Used          | Description                                           |
| --------------------------- | --------------- | ------------------------ | ----------------------------------------------------- |
| `TEST_DATA_PATH`            | `.env`          | Test data loaders        | Path to test data directory. Default: `./TestData`.    |
| `SKIP_TEST`                 | `.env`          | Test hooks               | Comma-separated test names to skip.                   |

---

## Running Tests

```bash
# Install dependencies
npm install

# Run all test suites
npm test

# Run a single test by name (grep)
npm run test:single -- "Test 01"

# Run with all reporters (Allure + Mochawesome + Xray)
npm run test:multi

# Run a single test with all reporters
npm run test:singleWithMulti -- "Test 01"

# Type-check (no emit)
npm run build

# Lint
npm run lint

# Format check / fix
npm run prettier:check
npm run prettier:fix
```

---

## Reporting

### Allure Reports

```bash
npm run test:allure
npm run allure:serve
```

### Mochawesome Reports

```bash
npm run test:report
# Open mochawesome-report/report.html in a browser
```

### Multi-Reporter

Configured in `reporter-config.json` — outputs Allure, Mochawesome, and Xray reports simultaneously:

```bash
npm run test:multi
```

---

## Xray Integration

This framework integrates with **Xray Cloud** to upload test results to Jira.

### Configuration

Set the following environment variables in `.env` (or as GitHub Secrets for CI):

```bash
XRAY_BASE_URL=https://eu.xray.cloud.getxray.app
XRAY_CLIENT_ID=your-client-id
XRAY_CLIENT_SECRET=your-client-secret
JIRA_PROJECT_KEY=MYY
JIRA_TEST_EXECUTION_KEY=MYY-59   # Optional: update existing execution
XRAY_REPORT_FILE=./xray-report.json
```

> **Note:** For EU Xray Cloud instances, use `https://eu.xray.cloud.getxray.app`. For global instances, use `https://xray.cloud.getxray.app`.

### Adding Xray Test IDs

Add Xray test IDs to test titles using the format `[MYY-XX]`:

```typescript
it("Test 01: Create Single Contact [MYY-30]", async function () {
  // test code
});
```

### Workflow

```bash
# 1. Run tests with multi-reporter to generate Mochawesome + Xray JSON
npm run test:multi

# 2. Generate Xray report from Mochawesome results
npm run xray:generate

# 3. Upload results to Xray Cloud
npm run xray:upload
```

### Implementation Details

- **Authentication:** OAuth2 client credentials flow with `Accept: text/plain` header
- **Status Format:** Uses `PASSED`/`FAILED` (not `PASS`/`FAIL`) for Xray Cloud API
- **JSON Format:** Xray Cloud JSON format with `info` section containing `project` field
- **Test Keys:** Must match existing test keys in your Xray project

---

## GitHub Actions CI/CD Pipeline

There is no workflow file yet. Below is a ready-to-use pipeline you can add to `.github/workflows/mobile-tests.yml`.

### 1. Create the Workflow File

Create `.github/workflows/mobile-tests.yml` with the content below (adjust as needed):

```yaml
name: Mobile Automation Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      platform:
        description: "Platform to test (android / iOS)"
        required: true
        default: "android"
        type: choice
        options:
          - android
          - iOS
      test_grep:
        description: "Test name filter (grep), leave empty to run all"
        required: false
        default: ""

env:
  NODE_VERSION: "20"

jobs:
  test-android:
    if: >
      github.event_name != 'workflow_dispatch' ||
      github.event.inputs.platform == 'android'
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: "temurin"
          java-version: "17"

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Appium & drivers
        run: |
          npm install -g appium
          appium driver install uiautomator2

      - name: Install dependencies
        run: npm ci

      - name: Create .env file
        run: |
          cat <<EOF > .env
          PLATFORM_NAME=android
          PLATFORM_VERSION=${{ vars.ANDROID_PLATFORM_VERSION || '14' }}
          DEVICE_NAME=${{ vars.ANDROID_DEVICE_NAME || 'Pixel_7' }}
          UDID=${{ vars.ANDROID_UDID || 'emulator-5554' }}
          APP_PACKAGE=${{ vars.APP_PACKAGE || 'com.google.android.dialer' }}
          APP_ACTIVITY=${{ vars.APP_ACTIVITY || 'com.google.android.dialer.extensions.GoogleDialtactsActivity' }}
          APK_FILE_PATH=${{ vars.APK_FILE_PATH || '' }}
          FULL_RESET=false
          AUTO_LAUNCH_APPIUM_SERVER=true
          IMPLICITLY_WAIT=5000
          TEST_PROVIDER=${{ vars.TEST_PROVIDER || 'local' }}
          HEADSPIN_API_TOKEN=${{ secrets.HEADSPIN_API_TOKEN }}
          HEADSPIN_HOST=${{ vars.HEADSPIN_HOST || 'appium-dev.headspin.io' }}
          BROWSERSTACK_USER=${{ secrets.BROWSERSTACK_USER }}
          BROWSERSTACK_KEY=${{ secrets.BROWSERSTACK_KEY }}
          BROWSERSTACK_APP_URL=${{ secrets.BROWSERSTACK_APP_URL }}
          XRAY_BASE_URL=${{ vars.XRAY_BASE_URL || 'https://xray.cloud.xpand-it.com' }}
          XRAY_CLIENT_ID=${{ secrets.XRAY_CLIENT_ID }}
          XRAY_CLIENT_SECRET=${{ secrets.XRAY_CLIENT_SECRET }}
          JIRA_PROJECT_KEY=${{ vars.JIRA_PROJECT_KEY || 'MYY' }}
          EOF

      - name: Start Android Emulator
        if: vars.TEST_PROVIDER == 'local' || vars.TEST_PROVIDER == ''
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          arch: x86_64
          profile: pixel_7
          force-avd-creation: true
          emulator-options: -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect
          script: npm run test:multi

      - name: Run tests (cloud provider)
        if: vars.TEST_PROVIDER == 'headspin' || vars.TEST_PROVIDER == 'browserstack'
        run: |
          if [ -n "${{ github.event.inputs.test_grep }}" ]; then
            npm run test:singleWithMulti -- "${{ github.event.inputs.test_grep }}"
          else
            npm run test:multi
          fi

      - name: Upload Xray results
        if: always()
        continue-on-error: true
        run: npm run xray:upload

      - name: Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports-android
          path: |
            report/
            mochawesome-report/
            allure-results/
            xray-report.json
          retention-days: 14

  test-ios:
    if: >
      github.event_name == 'workflow_dispatch' &&
      github.event.inputs.platform == 'iOS'
    runs-on: macos-latest
    timeout-minutes: 45

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Select Xcode version
        run: sudo xcode-select -s /Applications/Xcode_16.0.app/Contents/Developer

      - name: Install Appium & drivers
        run: |
          npm install -g appium
          appium driver install xcuitest

      - name: Install dependencies
        run: npm ci

      - name: Boot iOS Simulator
        run: |
          DEVICE_UDID=$(xcrun simctl create "TestiPhone" "iPhone 16" "iOS18.0" 2>/dev/null || \
                        xcrun simctl list devices | grep "TestiPhone" | head -1 | grep -oE '[A-F0-9-]{36}')
          xcrun simctl boot "$DEVICE_UDID" || true
          echo "SIMULATOR_UDID=$DEVICE_UDID" >> "$GITHUB_ENV"

      - name: Create .env file
        run: |
          cat <<EOF > .env
          PLATFORM_NAME=iOS
          AUTOMATION_NAME=XCUITest
          DEVICE_NAME=TestiPhone
          PLATFORM_VERSION=18.0
          UDID=${{ env.SIMULATOR_UDID }}
          BUNDLE_ID=${{ vars.IOS_BUNDLE_ID || 'com.apple.reminders' }}
          SHOW_XCODE_LOG=true
          AUTO_LAUNCH_APPIUM_SERVER=true
          IMPLICITLY_WAIT=5000
          TEST_PROVIDER=local
          XRAY_BASE_URL=${{ vars.XRAY_BASE_URL || 'https://xray.cloud.xpand-it.com' }}
          XRAY_CLIENT_ID=${{ secrets.XRAY_CLIENT_ID }}
          XRAY_CLIENT_SECRET=${{ secrets.XRAY_CLIENT_SECRET }}
          JIRA_PROJECT_KEY=${{ vars.JIRA_PROJECT_KEY || 'MYY' }}
          EOF

      - name: Run tests
        run: |
          if [ -n "${{ github.event.inputs.test_grep }}" ]; then
            npm run test:singleWithMulti -- "${{ github.event.inputs.test_grep }}"
          else
            npm run test:multi
          fi

      - name: Upload Xray results
        if: always()
        continue-on-error: true
        run: npm run xray:upload

      - name: Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports-ios
          path: |
            report/
            mochawesome-report/
            allure-results/
            xray-report.json
          retention-days: 14
```

### 2. Configure GitHub Secrets

Go to **GitHub Repo → Settings → Secrets and variables → Actions**.

#### Secrets (sensitive — never commit these)

| Secret Name              | Value                                   | Required When                       |
| ------------------------ | --------------------------------------- | ----------------------------------- |
| `HEADSPIN_API_TOKEN`     | Your HeadSpin API token                 | `TEST_PROVIDER=headspin`            |
| `BROWSERSTACK_USER`      | BrowserStack username                   | `TEST_PROVIDER=browserstack`        |
| `BROWSERSTACK_KEY`       | BrowserStack access key                 | `TEST_PROVIDER=browserstack`        |
| `BROWSERSTACK_APP_URL`   | BrowserStack app URL (e.g., `bs://...`) | `TEST_PROVIDER=browserstack`        |
| `XRAY_CLIENT_ID`         | Xray Cloud OAuth2 client ID            | Xray upload step                    |
| `XRAY_CLIENT_SECRET`     | Xray Cloud OAuth2 client secret        | Xray upload step                    |

**How to get these values:**

- **HeadSpin:** Log in → API Tokens → create a new token.
- **BrowserStack:** Account → Settings → Automate section → Username & Access Key.
- **Xray Cloud:** Xray Settings → API Keys → create new client credentials.

#### Variables (non-sensitive — visible in logs)

| Variable Name                | Default Value          | Description                               |
| ---------------------------- | ---------------------- | ----------------------------------------- |
| `TEST_PROVIDER`              | `local`                | `local`, `headspin`, or `browserstack`    |
| `ANDROID_PLATFORM_VERSION`   | `14`                   | Android OS version                        |
| `ANDROID_DEVICE_NAME`        | `Pixel_7`              | Android device/emulator name              |
| `ANDROID_UDID`               | `emulator-5554`        | Android device UDID                       |
| `APP_PACKAGE`                | (from `.env.example`)  | Android app package                       |
| `APP_ACTIVITY`               | (from `.env.example`)  | Android launch activity                   |
| `APK_FILE_PATH`              | (empty)                | Path to APK, if applicable                |
| `IOS_BUNDLE_ID`              | `com.apple.reminders`  | iOS app bundle ID                         |
| `XRAY_BASE_URL`              | `https://xray.cloud.xpand-it.com` | Xray Cloud API base URL       |
| `JIRA_PROJECT_KEY`           | `MYY`                  | Jira project key for Xray                 |
| `HEADSPIN_HOST`              | `appium-dev.headspin.io` | HeadSpin Appium host                    |

### 3. Triggering the Pipeline

- **Automatic:** Pushes to `main`/`develop` or PRs to `main` trigger Android tests.
- **Manual:** Go to **Actions** → **Mobile Automation Tests** → **Run workflow** → select platform (`android` or `iOS`) and optionally filter tests by name.

---

## Architecture Notes

| Concept                   | Implementation                                 |
| ------------------------- | ---------------------------------------------- |
| Test Framework            | Mocha + Chai assertions                        |
| Language                  | TypeScript (compiled via `ts-node`)             |
| Mobile Driver             | WebDriverIO + Appium                           |
| Locator Strategy          | `[strategy, value]` tuple (`Locator` type)     |
| Page Object Model         | `src/pages/*.ts` — locators + element methods  |
| Helper / Flow Classes     | `src/helpers/*Helper.ts` — test orchestration  |
| Driver Lifecycle          | `appiumDriver.ts` — auto-start/stop server     |
| Root Hooks                | `hooks.ts` — screenshot on failure, log flush  |
| Reporting                 | Allure, Mochawesome, Xray (multi-reporter)     |
| Config                    | `dotenv` → `.env` file                         |
| Logging                   | Winston (console + file + buffer for reports)  |

---

## Troubleshooting

### Android

- **`adb devices` shows no device:** Ensure USB debugging is enabled, or the emulator is running.
- **Appium can't find UiAutomator2:** Run `appium driver install uiautomator2`.
- **App not launching:** Verify `APP_PACKAGE` and `APP_ACTIVITY` are correct. Use `adb shell dumpsys activity activities | grep mFocusedActivity` to find the current activity.
- **Emulator timeout in CI:** Increase the emulator boot wait time or use a lighter system image (`x86_64`).

### iOS

- **Simulator not found:** Run `xcrun simctl list devices` and verify the device name and UDID match `.env`.
- **WebDriverAgent build failure:** Open `~/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj` in Xcode, set signing team, and build manually once.
- **Appium can't find XCUITest:** Run `appium driver install xcuitest`.
- **Real device provisioning error:** Ensure WebDriverAgent is signed with a valid Apple Developer Team. See [Appium XCUITest docs](https://appium.github.io/appium-xcuitest-driver/latest/preparation/real-device-config/).

### General

- **Appium server won't start:** Install globally with `npm install -g appium`. Check port conflicts.
- **Tests timeout:** Increase `IMPLICITLY_WAIT` in `.env` or the Mocha `--timeout` value in `package.json`.
- **Old `.env` values:** Ensure `.env` matches the target platform. Comment/uncomment the Android or iOS sections in `.env.example` as a guide.
