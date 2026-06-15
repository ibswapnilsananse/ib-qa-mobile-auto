import { Browser } from "webdriverio";
import { Base, Locator } from "../helpers/base";

export class AddToContactPage {
  protected driver: Browser;
  protected base: Base;

  // Form field locators
  static readonly LOC_FIRST_NAME_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[@hint="First name"]',
  ];
  static readonly LOC_LAST_NAME_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[@hint="Last name"]',
  ];
  static readonly LOC_PHONE_INPUT: Locator = [
    "xpath",
    '//android.widget.EditText[contains(@text, "1 (")]',
  ];

  // Action buttons
  static readonly LOC_SAVE_BTN: Locator = [
    "xpath",
    '//android.widget.View[@bounds="[818,1028][1036,1160]"]//android.widget.TextView[@text="Save"]',
  ];
  static readonly LOC_ADD_TO_FAVORITES_BTN: Locator = [
    "xpath",
    '//android.view.View[@content-desc="Add to Favorites"]',
  ];
  static readonly LOC_MORE_DETAILS_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="More details"]',
  ];
  static readonly LOC_ADD_TO_EXISTING_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Add to existing"]',
  ];

  // Title and form elements
  static readonly LOC_FORM_TITLE: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Add to contacts"]',
  ];

  constructor(driver: Browser) {
    this.driver = driver;
    this.base = new Base(driver);
  }

  async isFormDisplayed(): Promise<boolean> {
    try {
      const element = await this.base.element(AddToContactPage.LOC_FORM_TITLE, 5000);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async enterFirstName(firstName: string): Promise<void> {
    const element = await this.base.element(AddToContactPage.LOC_FIRST_NAME_INPUT);
    await element.click();
    await this.driver.pause(200);
    await element.clearValue();
    await this.driver.pause(100);
    await element.setValue(firstName);
  }

  async enterLastName(lastName: string): Promise<void> {
    const element = await this.base.element(AddToContactPage.LOC_LAST_NAME_INPUT);
    await element.click();
    await this.driver.pause(200);
    await element.clearValue();
    await this.driver.pause(100);
    await element.setValue(lastName);
  }

  async getPhoneNumber(): Promise<string> {
    try {
      const element = await this.base.element(AddToContactPage.LOC_PHONE_INPUT);
      const text = await element.getText();
      return text;
    } catch {
      return "";
    }
  }

  async clickSave(): Promise<void> {
    // Try multiple approaches to find and click save button
    try {
      // Approach 1: Direct XPath
      const saveBtn = await this.base.element(AddToContactPage.LOC_SAVE_BTN);
      await saveBtn.click();
    } catch {
      // Approach 2: Find by text "Save"
      try {
        const saveBtnAlt = await this.base.element([
          "xpath",
          '//android.widget.TextView[@text="Save"]',
        ]);
        await saveBtnAlt.click();
      } catch {
        // Approach 3: Find parent button containing "Save"
        const parentBtn = await this.base.element([
          "xpath",
          '//android.widget.Button[contains(@content-desc, "Save")]',
        ]);
        await parentBtn.click();
      }
    }
  }

  async clickAddToFavorites(): Promise<void> {
    const element = await this.base.element(AddToContactPage.LOC_ADD_TO_FAVORITES_BTN);
    await element.click();
  }

  async clickMoreDetails(): Promise<void> {
    const element = await this.base.element(AddToContactPage.LOC_MORE_DETAILS_BTN);
    await element.click();
  }

  async clickAddToExisting(): Promise<void> {
    const element = await this.base.element(AddToContactPage.LOC_ADD_TO_EXISTING_BTN);
    await element.click();
  }

  async saveContact(firstName: string, lastName: string): Promise<void> {
    await this.enterFirstName(firstName);
    await this.driver.pause(300);
    await this.enterLastName(lastName);
    await this.driver.pause(300);
    await this.clickSave();
  }
}
