import { Browser } from "webdriverio";
import { Base, Locator } from "../helpers/base";

export class ContactsPage {
  protected driver: Browser;
  protected base: Base;

  // Google Dialer main page locators
  static readonly LOC_SEARCH_BAR: Locator = [
    "id",
    "com.google.android.dialer:id/search_bar",
  ];
  static readonly LOC_VIEW_CONTACTS_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="View contacts"]',
  ];
  static readonly LOC_VIEW_CONTACTS_BUTTON: Locator = [
    "xpath",
    '//android.widget.Button[contains(@bounds, "703,407")]',
  ];
  static readonly LOC_ADD_CONTACT_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Add"]',
  ];
  static readonly LOC_CONTACTS_TAB: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Contacts"]',
  ];
  static readonly LOC_FAVORITES_SECTION: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Favorites"]',
  ];

  // Contact creation/edit locators
  static readonly LOC_FIRST_NAME_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[@text="First name" or @hint="First name"]',
  ];
  static readonly LOC_LAST_NAME_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[@text="Last name" or @hint="Last name"]',
  ];
  static readonly LOC_PHONE_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[@hint="Phone" or @hint="Mobile" or @text="Phone"]',
  ];
  static readonly LOC_EMAIL_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[@hint="Email" or @text="Email"]',
  ];
  static readonly LOC_SAVE_BTN: Locator = [
    "accessibility id",
    "Save",
  ];
  static readonly LOC_SAVE_CONTACT_BTN: Locator = [
    "xpath",
    '//android.widget.Button[@text="Save"]',
  ];
  static readonly LOC_DELETE_BTN: Locator = [
    "accessibility id",
    "Delete",
  ];
  static readonly LOC_EDIT_BTN: Locator = [
    "accessibility id",
    "Edit",
  ];

  constructor(driver: Browser) {
    this.driver = driver;
    this.base = new Base(driver);
  }

  getContactByName(name: string): Locator {
    return [
      "xpath",
      `//android.widget.TextView[@text="${name}"]`,
    ];
  }

  async clickViewContacts(): Promise<void> {
    try {
      const element = await this.base.element(ContactsPage.LOC_VIEW_CONTACTS_BTN, 5000);
      await element.click();
    } catch {
      const element = await this.base.element(ContactsPage.LOC_VIEW_CONTACTS_BUTTON);
      await element.click();
    }
  }

  async clickAddContact(): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_ADD_CONTACT_BTN);
    await element.click();
  }

  async clickContactsTab(): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_CONTACTS_TAB);
    await element.click();
  }

  async searchContact(searchTerm: string): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_SEARCH_BAR);
    await element.click();
    await element.setValue(searchTerm);
  }

  async enterFirstName(firstName: string): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_FIRST_NAME_INPUT);
    await element.click();
    await element.clearValue();
    await element.setValue(firstName);
  }

  async enterLastName(lastName: string): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_LAST_NAME_INPUT);
    await element.click();
    await element.clearValue();
    await element.setValue(lastName);
  }

  async enterPhone(phone: string): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_PHONE_INPUT);
    await element.click();
    await element.clearValue();
    await element.setValue(phone);
  }

  async enterEmail(email: string): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_EMAIL_INPUT);
    await element.click();
    await element.clearValue();
    await element.setValue(email);
  }

  async clickSave(): Promise<void> {
    try {
      const element = await this.base.element(ContactsPage.LOC_SAVE_CONTACT_BTN, 5000);
      await element.click();
    } catch {
      const element = await this.base.element(ContactsPage.LOC_SAVE_BTN);
      await element.click();
    }
  }

  async clickDelete(): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_DELETE_BTN);
    await element.click();
  }

  async clickEdit(): Promise<void> {
    const element = await this.base.element(ContactsPage.LOC_EDIT_BTN);
    await element.click();
  }

  async selectContact(contactName: string): Promise<void> {
    const contactLocator = this.getContactByName(contactName);
    const element = await this.base.element(contactLocator);
    await element.click();
  }

  async isContactDisplayed(contactName: string): Promise<boolean> {
    try {
      const contactLocator = this.getContactByName(contactName);
      const element = await this.base.element(contactLocator, 5000);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }
}
