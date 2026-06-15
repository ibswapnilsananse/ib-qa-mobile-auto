import { expect } from "chai";
import { Browser } from "webdriverio";
import { createDriver, stopAppiumServer } from "../helpers/appiumDriver";
import { DialerHelper } from "../helpers/DialerHelper";
import logger from "../helpers/loggerUtils";

describe("Google Dialer App - Workflow Test Suite", function () {
  this.timeout(300000);

  let driver: Browser;
  let dialerHelper: DialerHelper;

  // afterEach(async function () {
  //   await quitDriver(driver);
  // });

  after(async function () {
    await stopAppiumServer();
  });

  it("Workflow 01: Verify Hamburger Menu Navigation [MYY-36]", async function () {
    logger.info("Starting hamburger menu navigation workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.verifyHamburgerMenuOpens();
    expect(result).to.be.true;
  });

  it("Workflow 02: Navigate to Contacts via Menu [MYY-37]", async function () {
    logger.info("Starting navigate to contacts workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.navigateToMenuPage("contacts");
    expect(result).to.be.true;
  });

  it("Workflow 03: Navigate to Settings via Menu [MYY-38]", async function () {
    logger.info("Starting navigate to settings workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.navigateToMenuPage("settings");
    expect(result).to.be.true;
  });

  it("Workflow 04: Navigate to Call History via Menu [MYY-39]", async function () {
    logger.info("Starting navigate to call history workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.navigateToMenuPage("call history");
    expect(result).to.be.true;
  });

  it("Workflow 05: Navigate to Help & Feedback via Menu [MYY-40]", async function () {
    logger.info("Starting navigate to help & feedback workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.navigateToMenuPage("help & feedback");
    expect(result).to.be.true;
  });

  it("Workflow 06: Test Bottom Navigation - Home Tab [MYY-41]", async function () {
    logger.info("Starting home tab navigation workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.verifyTabNavigation("home");
    expect(result).to.be.true;
  });

  it("Workflow 07: Test Bottom Navigation - Keypad Tab [MYY-42]", async function () {
    logger.info("Starting keypad tab navigation workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.verifyTabNavigation("keypad");
    expect(result).to.be.true;
  });

  it("Workflow 08: Test Bottom Navigation - Voicemail Tab [MYY-43]", async function () {
    logger.info("Starting voicemail tab navigation workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.verifyTabNavigation("voicemail");
    expect(result).to.be.true;
  });

  it("Workflow 09: Verify Keypad Page Display [MYY-44]", async function () {
    logger.info("Starting keypad page verification workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    // Navigate to Keypad tab
    await dialerHelper.verifyTabNavigation("keypad");

    // Verify keypad is displayed
    const result = await dialerHelper.verifyKeypadPage();
    expect(result).to.be.true;
  });

  it("Workflow 10: Test Keypad Actions - Enter Phone Number [MYY-45]", async function () {
    logger.info("Starting keypad phone number entry workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.testKeypadActions();
    expect(result).to.be.true;
  });

  it("Workflow 11: Complete Navigation Flow [MYY-46]", async function () {
    logger.info("Starting complete navigation flow workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    // Test full flow: Home -> Keypad -> Voicemail -> Menu -> Contacts
    const result = await dialerHelper.testFullNavigationFlow();
    expect(result).to.be.true;
  });

  it("Workflow 12: Multiple Menu Navigation [MYY-47]", async function () {
    logger.info("Starting multiple menu navigation workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    // Navigate through all menu items sequentially
    const result = await dialerHelper.testMultipleMenuNavigation();
    expect(result).to.be.true;
  });

  it("Workflow 13: Tab Navigation Loop [MYY-48]", async function () {
    logger.info("Starting tab navigation loop workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const tabs = ["home", "keypad", "voicemail", "home"];
    let allPassed = true;

    for (const tab of tabs) {
      const result = await dialerHelper.verifyTabNavigation(tab);
      if (!result) {
        allPassed = false;
      }
      await driver.pause(300);
    }

    expect(allPassed).to.be.true;
  });

  it("Workflow 14: Menu Open and Close (Multiple Toggles) [MYY-49]", async function () {
    logger.info("Starting menu toggle workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    // Open menu multiple times
    for (let i = 0; i < 3; i++) {
      const result = await dialerHelper.verifyHamburgerMenuOpens();
      if (!result) {
        expect(result).to.be.true;
        return;
      }
      await driver.pause(200);
      // Close menu by navigating to a page
      await dialerHelper.navigateToMenuPage("contacts");
      await driver.pause(300);
    }

    expect(true).to.be.true;
  });

  it("Workflow 15: Mixed Navigation - Menus and Tabs [MYY-50]", async function () {
    logger.info("Starting mixed navigation workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    // Navigate using tabs
    let result = await dialerHelper.verifyTabNavigation("keypad");
    expect(result).to.be.true;
    await driver.pause(300);

    // Navigate using menu
    result = await dialerHelper.navigateToMenuPage("contacts");
    expect(result).to.be.true;
    await driver.pause(300);

    // Navigate using tabs again
    result = await dialerHelper.verifyTabNavigation("home");
    expect(result).to.be.true;
    await driver.pause(300);

    // Navigate using menu again
    result = await dialerHelper.navigateToMenuPage("settings");
    expect(result).to.be.true;
  });

  it("Workflow 16: Contact Saving Flow [MYY-29]", async function () {
    logger.info("Starting contact saving flow workflow");
    driver = await createDriver(false);
    dialerHelper = new DialerHelper(driver);

    const result = await dialerHelper.testContactSavingFlow("1234567890", "Test Contact");
    expect(result).to.be.true;
  });
});
