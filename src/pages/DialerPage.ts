import { Browser } from "webdriverio";
import { Base, Locator } from "../helpers/base";

export class DialerPage {
  protected driver: Browser;
  protected base: Base;

  // Landing page locators
  static readonly LOC_SEARCH_BAR: Locator = [
    "id",
    "com.google.android.dialer:id/search_bar",
  ];
  static readonly LOC_HAMBURGER_MENU: Locator = [
    "xpath",
    '//android.widget.ImageButton[@content-desc="Open navigation drawer"]',
  ];
  static readonly LOC_VIEW_CONTACTS_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="View contacts"]',
  ];
  static readonly LOC_ADD_CONTACT_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Add"]',
  ];

  // Navigation tabs
  static readonly LOC_HOME_TAB: Locator = [
    "id",
    "com.google.android.dialer:id/tab_call_history",
  ];
  static readonly LOC_KEYPAD_TAB: Locator = [
    "id",
    "com.google.android.dialer:id/tab_dialpad",
  ];
  static readonly LOC_VOICEMAIL_TAB: Locator = [
    "id",
    "com.google.android.dialer:id/tab_voicemail",
  ];

  // Hamburger menu items
  static readonly LOC_MENU_CONTACTS: Locator = [
    "xpath",
    '//android.widget.CheckedTextView[@text="Contacts"]',
  ];
  static readonly LOC_MENU_SETTINGS: Locator = [
    "xpath",
    '//android.widget.CheckedTextView[@text="Settings"]',
  ];
  static readonly LOC_MENU_CALL_HISTORY: Locator = [
    "xpath",
    '//android.widget.CheckedTextView[@text="Call history"]',
  ];
  static readonly LOC_MENU_HELP_FEEDBACK: Locator = [
    "xpath",
    '//android.widget.CheckedTextView[@text="Help & feedback"]',
  ];

  // Keypad page locators
  static readonly LOC_DIALPAD_INPUT: Locator = [
    "id",
    "com.google.android.dialer:id/digits",
  ];
  static readonly LOC_CREATE_NEW_CONTACT_ACTION: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Create new contact"]',
  ];
  static readonly LOC_ADD_TO_CONTACT_ACTION: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Add to a contact"]',
  ];
  static readonly LOC_SEND_MESSAGE_ACTION: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Send a message"]',
  ];

  constructor(driver: Browser) {
    this.driver = driver;
    this.base = new Base(driver);
  }

  async openHamburgerMenu(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_HAMBURGER_MENU);
    await element.click();
  }

  async navigateToContacts(): Promise<void> {
    await this.openHamburgerMenu();
    await this.driver.pause(300);
    const element = await this.base.element(DialerPage.LOC_MENU_CONTACTS);
    await element.click();
  }

  async navigateToSettings(): Promise<void> {
    await this.openHamburgerMenu();
    await this.driver.pause(300);
    const element = await this.base.element(DialerPage.LOC_MENU_SETTINGS);
    await element.click();
  }

  async navigateToCallHistory(): Promise<void> {
    await this.openHamburgerMenu();
    await this.driver.pause(300);
    const element = await this.base.element(DialerPage.LOC_MENU_CALL_HISTORY);
    await element.click();
  }

  async navigateToHelpFeedback(): Promise<void> {
    await this.openHamburgerMenu();
    await this.driver.pause(300);
    const element = await this.base.element(DialerPage.LOC_MENU_HELP_FEEDBACK);
    await element.click();
  }

  async clickHomeTab(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_HOME_TAB);
    await element.click();
  }

  async clickKeypadTab(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_KEYPAD_TAB);
    await element.click();
  }

  async clickVoicemailTab(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_VOICEMAIL_TAB);
    await element.click();
  }

  async enterPhoneNumber(phoneNumber: string): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_DIALPAD_INPUT);
    await element.click();
    for (const digit of phoneNumber) {
      if (digit === "-" || digit === " " || digit === "(" || digit === ")") {
        continue; // Skip formatting characters
      }
      await this.driver.pause(50);
    }
  }

  async clickCreateNewContact(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_CREATE_NEW_CONTACT_ACTION);
    await element.click();
  }

  async clickAddToContact(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_ADD_TO_CONTACT_ACTION);
    await element.click();
  }

  async clickSendMessage(): Promise<void> {
    const element = await this.base.element(DialerPage.LOC_SEND_MESSAGE_ACTION);
    await element.click();
  }

  async isKeypadDisplayed(): Promise<boolean> {
    try {
      const element = await this.base.element(DialerPage.LOC_DIALPAD_INPUT, 5000);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async isMenuItemDisplayed(text: string): Promise<boolean> {
    const locator: Locator = [
      "xpath",
      `//android.widget.CheckedTextView[@text="${text}"]`,
    ];
    try {
      const element = await this.base.element(locator, 5000);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }
}
