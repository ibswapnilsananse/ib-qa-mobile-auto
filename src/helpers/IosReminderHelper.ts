import { Browser } from "webdriverio";
import { IosReminderPage } from "../pages/IosReminderPage";
import logger from "./loggerUtils";

export class IosReminderHelper {
  private driver: Browser;
  private page: IosReminderPage;

  constructor(driver: Browser) {
    this.driver = driver;
    this.page = new IosReminderPage(driver);
  }

  // ── TC01: Verify Welcome Screen (Main Lists View) ─────────────────────────

  async verifyWelcomeScreenDisplayed(): Promise<boolean> {
    logger.info("Verifying Reminders main lists view is displayed");
    return this.page.isWelcomePageDisplayed();
  }

  async dismissWelcomeScreen(): Promise<void> {
    // Dismiss the iCloud sync tip if present
    logger.info("Dismissing iCloud sync tip if visible");
    await this.page.dismissSyncTip();
  }

  async navigateToTodayList(): Promise<void> {
    logger.info("Clicking 'Today' to navigate to Today reminders list");
    await this.page.clickToday();
  }

  async clickMorningToAddReminder(): Promise<void> {
    logger.info("Clicking 'Morning' section to get the input field");
    await this.page.clickMorningSection();
  }

  // ── TC02: Verify Home Screen Elements ─────────────────────────────────────

  async verifyHomeScreenElements(): Promise<{
    title: boolean;
    doneButton: boolean;
    backButton: boolean;
    ellipsesButton: boolean;
  }> {
    logger.info("Verifying Today screen elements");
    const title = await this.page.isTodayTitleDisplayed();
    const doneButton = await this.page.isDoneNavButtonDisplayed();
    const backButton = await this.page.isBackButtonDisplayed();
    const ellipsesButton = await this.page.isMoreButtonDisplayed();
    logger.info(
      `Today Screen elements — title: ${title}, doneButton: ${doneButton}, backButton: ${backButton}, ellipsesButton: ${ellipsesButton}`
    );
    return { title, doneButton, backButton, ellipsesButton };
  }

  // ── TC03: Add Reminder with Name and Modified Time ────────────────────────

  async addReminderWithTime(
    reminderName: string
  ): Promise<void> {
    logger.info(`Adding reminder: "${reminderName}"`);

    // Click Morning section to get the input field for adding text
    logger.info("Clicking Morning section to reveal input field");
    await this.page.clickMorningSection();

    logger.info(`Entering reminder title: "${reminderName}"`);
    await this.page.enterReminderTitle(reminderName);

    logger.info("Clicking Done on Navigation bar to save reminder");
    await this.page.clickDone();
  }

  // ── TC04: Verify Reminder Count on Welcome Screen ────────────────────────

  async navigateBackToWelcomeScreen(): Promise<void> {
    logger.info("Navigating back to Welcome/Main Lists screen");
    await this.page.clickBackButton();
  }

  async verifyReminderCountOnWelcomeScreen(): Promise<boolean> {
    logger.info("Verifying reminder count on Welcome screen Today button");
    const label = await this.page.getTodayButtonLabel();
    logger.info(`Today button label: "${label}"`);

    // Parse count from label like "Today, 1 reminder, June 16" or "Today, 0 reminders, June 15"
    const match = label.match(/Today,\s*(\d+)\s*reminder/);
    if (match) {
      const count = parseInt(match[1], 10);
      logger.info(`Reminder count on Today button: ${count}`);
      return count > 0;
    }
    logger.warn("Could not parse reminder count from Today button label");
    return false;
  }
}
