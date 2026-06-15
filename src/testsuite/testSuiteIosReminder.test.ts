import { expect } from "chai";
import { Browser } from "webdriverio";
import { createDriver, stopAppiumServer } from "../helpers/appiumDriver";
import { IosReminderHelper } from "../helpers/IosReminderHelper";
import logger from "../helpers/loggerUtils";

describe("iOS Reminder App Test Suite", function () {
  this.timeout(300000);

  let driver: Browser;
  let reminderHelper: IosReminderHelper;

  after(async function () {
    await stopAppiumServer();
  });

  it("Test 01: Verify the welcome screen displayed for reminder page", async function () {
    logger.info("Starting: Verify welcome screen (main lists view) is displayed");
    driver = await createDriver();
    reminderHelper = new IosReminderHelper(driver);

    const isWelcomeDisplayed = await reminderHelper.verifyWelcomeScreenDisplayed();
    expect(isWelcomeDisplayed, "Welcome screen (main lists view) should be displayed").to.be.true;

    await reminderHelper.dismissWelcomeScreen();
  });

  it("Test 02: Verify the Reminder title, add button, back button, and ellipses button are visible on Home screen", async function () {
    logger.info("Starting: Verify Home screen elements");
    driver = await createDriver();
    reminderHelper = new IosReminderHelper(driver);

    const isWelcomeDisplayed = await reminderHelper.verifyWelcomeScreenDisplayed();
    if (isWelcomeDisplayed) {
      await reminderHelper.dismissWelcomeScreen();
    }

    await reminderHelper.navigateToTodayList();

    const elements = await reminderHelper.verifyHomeScreenElements();
    expect(elements.title, "Today title should be visible").to.be.true;
    expect(elements.doneButton, "Done button should be visible").to.be.true;
    expect(elements.backButton, "Back button should be visible").to.be.true;
    expect(elements.ellipsesButton, "More (ellipses) button should be visible").to.be.true;
  });

  it("Test 03: Verify the reminder can be added with name and modified time (02:40 AM)", async function () {
    logger.info("Starting: Add reminder with name and modified time");
    driver = await createDriver();
    reminderHelper = new IosReminderHelper(driver);

    const isWelcomeDisplayed = await reminderHelper.verifyWelcomeScreenDisplayed();
    if (isWelcomeDisplayed) {
      await reminderHelper.dismissWelcomeScreen();
    }

    await reminderHelper.navigateToTodayList();
    await reminderHelper.addReminderWithTime("Reminder One");
  });

  it("Test 04: Verify the reminder count on the welcome screen", async function () {
    logger.info("Starting: Verify reminder count on welcome screen");
    driver = await createDriver();
    reminderHelper = new IosReminderHelper(driver);

    const isWelcomeDisplayed = await reminderHelper.verifyWelcomeScreenDisplayed();
    if (isWelcomeDisplayed) {
      await reminderHelper.dismissWelcomeScreen();
    }

    const hasReminder = await reminderHelper.verifyReminderCountOnWelcomeScreen();
    expect(hasReminder, "Today button should show reminder count on the welcome screen").to.be.true;
  });
});
