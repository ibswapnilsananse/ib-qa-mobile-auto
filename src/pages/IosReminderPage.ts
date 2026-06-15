import { Browser } from "webdriverio";
import { Base, Locator } from "../helpers/base";

export class IosReminderPage {
  protected driver: Browser;
  protected base: Base;

  // ── Welcome / Main Lists View ─────────────────────────────────────────────
  static readonly LOC_ACCOUNTS_LIST_NAV: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeNavigationBar' AND name CONTAINS 'AccountsListsView'",
  ];

  // "Sync Reminders with iCloud" tip card
  static readonly LOC_SYNC_TIP_TEXT: Locator = [
    "accessibility id",
    "Sync Reminders with iCloud",
  ];

  // Close button (xmark.circle.fill) on the iCloud sync tip
  static readonly LOC_CLOSE_TIP_BUTTON: Locator = [
    "accessibility id",
    "xmark.circle.fill",
  ];

  // "Today" button — label is dynamic e.g. "Today, 0 reminders, June 15"
  static readonly LOC_TODAY_BUTTON: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeButton' AND name BEGINSWITH 'Today'",
  ];

  // Search button on the nav bar
  static readonly LOC_SEARCH_BUTTON: Locator = [
    "accessibility id",
    "Search",
  ];

  // Add List button on the nav bar
  static readonly LOC_ADD_LIST_BUTTON: Locator = [
    "accessibility id",
    "Add List",
  ];

  // Edit button on the nav bar
  static readonly LOC_EDIT_BUTTON: Locator = [
    "accessibility id",
    "Edit",
  ];

  // Today button with reminder count — e.g. "Today, 1 reminder, June 16"
  static readonly LOC_TODAY_WITH_REMINDER: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeButton' AND name BEGINSWITH 'Today' AND name CONTAINS 'reminder'",
  ];

  // ── Home Screen (Today list view) ─────────────────────────────────────────
  static readonly LOC_REMINDERS_TITLE: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeStaticText' AND value == 'Reminders' AND label == 'Reminders'",
  ];

  static readonly LOC_TODAY_TITLE: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeNavigationBar' AND name == 'Today'",
  ];

  static readonly LOC_BACK_BUTTON: Locator = [
    "accessibility id",
    "BackButton",
  ];

  static readonly LOC_MORE_BUTTON: Locator = [
    "accessibility id",
    "More",
  ];

  // "Morning" section header on Today screen — click to get the input field
  static readonly LOC_MORNING_SECTION: Locator = [
    "accessibility id",
    "Morning",
  ];

  // Title text field that appears after clicking Morning section
  static readonly LOC_REMINDER_TITLE_FIELD_ON_TODAY: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeTextField' AND name == 'Title'",
  ];

  static readonly LOC_DONE_NAV_BUTTON: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeButton' AND name == 'Done' AND label == 'Done'",
  ];

  // ── Add Reminder Form ─────────────────────────────────────────────────────
  static readonly LOC_REMINDER_TITLE_FIELD: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeTextField' AND name == 'Title'",
  ];

  static readonly LOC_EDIT_DETAILS_BUTTON: Locator = [
    "accessibility id",
    "Edit Details",
  ];

  static readonly LOC_DONE_BUTTON: Locator = [
    "accessibility id",
    "Done",
  ];

  // ── Info Icon Popup (Details Page) ────────────────────────────────────────
  static readonly LOC_DETAILS_TITLE: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeStaticText' AND value == 'Details'",
  ];

  static readonly LOC_DETAILS_CANCEL_BUTTON: Locator = [
    "accessibility id",
    "Cancel",
  ];

  static readonly LOC_DETAILS_DONE_BUTTON: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeButton' AND name == 'Done' AND label == 'Done'",
  ];

  static readonly LOC_DETAIL_VIEW_TITLE_FIELD: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeTextField' AND name == 'Detail View Title Field'",
  ];

  static readonly LOC_TIME_SWITCH: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeSwitch' AND name == 'Time'",
  ];

  static readonly LOC_DATE_SWITCH: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeSwitch' AND name == 'Date'",
  ];

  // ── Time Picker (after Time toggle is ON) ─────────────────────────────────
  static readonly LOC_HOUR_PICKER: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypePickerWheel' AND value CONTAINS 'o\\'clock'",
  ];

  static readonly LOC_MINUTE_PICKER: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypePickerWheel' AND value CONTAINS 'minutes'",
  ];

  static readonly LOC_AM_PM_PICKER: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypePickerWheel' AND (value == 'AM' OR value == 'PM')",
  ];

  // ── Home Screen With Reminder Added ───────────────────────────────────────
  static readonly LOC_REMINDER_CELL_TITLE: Locator = [
    "-ios predicate string",
    "type == 'XCUIElementTypeTextField' AND name == 'Title' AND value != ''",
  ];

  constructor(driver: Browser) {
    this.driver = driver;
    this.base = new Base(driver);
  }

  // ── Welcome / Main Lists View Methods ─────────────────────────────────────

  async isWelcomePageDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_ACCOUNTS_LIST_NAV, 20000);
  }

  async isSyncTipDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_SYNC_TIP_TEXT, 10000);
  }

  async dismissSyncTip(): Promise<void> {
    const tipVisible = await this.isSyncTipDisplayed();
    if (tipVisible) {
      await this.base.clickOn(IosReminderPage.LOC_CLOSE_TIP_BUTTON, 5000, "Close tip");
      await this.driver.pause(1500);
    }
  }

  async isTodayButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_TODAY_BUTTON, 15000);
  }

  async clickToday(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_TODAY_BUTTON, 10000, "Today");
    await this.driver.pause(2000);
  }

  async isSearchButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_SEARCH_BUTTON, 10000);
  }

  async isAddListButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_ADD_LIST_BUTTON, 10000);
  }

  async isEditButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_EDIT_BUTTON, 10000);
  }

  async getTodayButtonLabel(): Promise<string> {
    return this.base.getText(IosReminderPage.LOC_TODAY_BUTTON, 15000);
  }

  async clickBackButton(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_BACK_BUTTON, 10000, "Back");
    await this.driver.pause(2000);
  }

  async isTodayWithReminderDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_TODAY_WITH_REMINDER, 15000);
  }

  // ── Home Screen Methods (Today list view) ─────────────────────────────────

  async isTodayTitleDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_TODAY_TITLE, 15000);
  }

  async isRemindersTitleDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_REMINDERS_TITLE, 15000);
  }

  async isBackButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_BACK_BUTTON, 10000);
  }

  async isMoreButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_MORE_BUTTON, 10000);
  }

  async clickMorningSection(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_MORNING_SECTION, 10000, "Morning");
    await this.driver.pause(2000);
  }

  async isTitleFieldDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_REMINDER_TITLE_FIELD_ON_TODAY, 10000);
  }

  async isDoneNavButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_DONE_NAV_BUTTON, 10000);
  }

  // ── Add Reminder Form Methods ─────────────────────────────────────────────

  async enterReminderTitle(title: string): Promise<void> {
    await this.base.sendText(IosReminderPage.LOC_REMINDER_TITLE_FIELD, title, 10000, "Title");
    await this.driver.pause(500);
  }

  async clickEditDetails(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_EDIT_DETAILS_BUTTON, 10000, "Edit Details");
    await this.driver.pause(2000);
  }

  async clickDone(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_DONE_BUTTON, 10000, "Done");
    await this.driver.pause(2000);
  }

  // ── Details Page Methods ──────────────────────────────────────────────────

  async isDetailsPageDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(IosReminderPage.LOC_DETAILS_TITLE, 15000);
  }

  async toggleTimeSwitch(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_TIME_SWITCH, 10000, "Time Switch");
    await this.driver.pause(1500);
  }

  async toggleDateSwitch(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_DATE_SWITCH, 10000, "Date Switch");
    await this.driver.pause(1500);
  }

  async setTime(hour: string, minute: string, amPm: string): Promise<void> {
    // Scroll hour picker wheel — value format: "2 o'clock"
    const hourEl = await this.base.element(IosReminderPage.LOC_HOUR_PICKER, 10000);
    await hourEl.setValue(`${hour} o'clock`);
    await this.driver.pause(1000);

    // Scroll minute picker wheel — value format: "40 minutes"
    const minuteEl = await this.base.element(IosReminderPage.LOC_MINUTE_PICKER, 10000);
    await minuteEl.setValue(`${minute} minutes`);
    await this.driver.pause(1000);

    // Scroll AM/PM picker wheel — value format: "AM" or "PM"
    const amPmEl = await this.base.element(IosReminderPage.LOC_AM_PM_PICKER, 10000);
    await amPmEl.setValue(amPm);
    await this.driver.pause(1000);
  }

  async clickDetailsDone(): Promise<void> {
    await this.base.clickOn(IosReminderPage.LOC_DETAILS_DONE_BUTTON, 10000, "Details Done");
    await this.driver.pause(2000);
  }

  // ── Home Screen With Reminder Methods ─────────────────────────────────────

  async getReminderTitleText(): Promise<string> {
    return this.base.getText(IosReminderPage.LOC_REMINDER_CELL_TITLE, 15000);
  }

  async isReminderDisplayedWithTitle(title: string): Promise<boolean> {
    const locator: Locator = [
      "-ios predicate string",
      `type == 'XCUIElementTypeTextField' AND name == 'Title' AND value == '${title}'`,
    ];
    return this.base.isDisplayed(locator, 15000);
  }
}
