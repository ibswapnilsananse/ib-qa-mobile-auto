import { Browser } from "webdriverio";
import { DialerPage } from "../pages/DialerPage";
import logger from "./loggerUtils";

export class DialerHelper {
  private driver: Browser;
  private dialerPage: DialerPage;

  constructor(driver: Browser) {
    this.driver = driver;
    this.dialerPage = new DialerPage(driver);
  }

  async navigateToMenuPage(menuItem: string): Promise<boolean> {
    logger.info(`Navigating to: ${menuItem}`);

    try {
      switch (menuItem.toLowerCase()) {
        case "contacts":
          await this.dialerPage.navigateToContacts();
          break;
        case "settings":
          await this.dialerPage.navigateToSettings();
          break;
        case "call history":
          await this.dialerPage.navigateToCallHistory();
          break;
        case "help & feedback":
          await this.dialerPage.navigateToHelpFeedback();
          break;
        default:
          logger.error(`Unknown menu item: ${menuItem}`);
          return false;
      }

      await this.driver.pause(500);
      logger.info(`✓ Successfully navigated to: ${menuItem}`);
      return true;
    } catch (e) {
      logger.error(`✗ Failed to navigate to: ${menuItem}, Error: ${e}`);
      return false;
    }
  }

  async verifyHamburgerMenuOpens(): Promise<boolean> {
    logger.info("Verifying hamburger menu opens");

    try {
      await this.dialerPage.openHamburgerMenu();
      await this.driver.pause(300);

      // Check if any menu items are visible
      const contactsVisible = await this.dialerPage.isMenuItemDisplayed("Contacts");
      const settingsVisible = await this.dialerPage.isMenuItemDisplayed("Settings");

      if (contactsVisible && settingsVisible) {
        logger.info("✓ Hamburger menu opened successfully");
        return true;
      } else {
        logger.error("✗ Hamburger menu items not visible");
        return false;
      }
    } catch (e) {
      logger.error(`✗ Failed to open hamburger menu: ${e}`);
      return false;
    }
  }

  async verifyTabNavigation(tabName: string): Promise<boolean> {
    logger.info(`Verifying navigation to ${tabName} tab`);

    try {
      switch (tabName.toLowerCase()) {
        case "home":
          await this.dialerPage.clickHomeTab();
          break;
        case "keypad":
          await this.dialerPage.clickKeypadTab();
          break;
        case "voicemail":
          await this.dialerPage.clickVoicemailTab();
          break;
        default:
          logger.error(`Unknown tab: ${tabName}`);
          return false;
      }

      await this.driver.pause(500);
      logger.info(`✓ Successfully navigated to ${tabName} tab`);
      return true;
    } catch (e) {
      logger.error(`✗ Failed to navigate to ${tabName} tab: ${e}`);
      return false;
    }
  }

  async verifyKeypadPage(): Promise<boolean> {
    logger.info("Verifying Keypad page");

    try {
      const isDisplayed = await this.dialerPage.isKeypadDisplayed();
      if (isDisplayed) {
        logger.info("✓ Keypad page is displayed");
        return true;
      } else {
        logger.error("✗ Keypad page is not displayed");
        return false;
      }
    } catch (e) {
      logger.error(`✗ Failed to verify Keypad page: ${e}`);
      return false;
    }
  }

  async testFullNavigationFlow(): Promise<boolean> {
    logger.info("Starting full navigation flow test");

    try {
      // Test Home tab
      await this.dialerPage.clickHomeTab();
      await this.driver.pause(500);
      logger.info("✓ Navigated to Home tab");

      // Test Keypad tab
      const keypadOk = await this.verifyTabNavigation("keypad");
      if (!keypadOk) return false;

      // Test Voicemail tab
      await this.dialerPage.clickVoicemailTab();
      await this.driver.pause(500);
      logger.info("✓ Navigated to Voicemail tab");

      // Test Hamburger menu
      const menuOk = await this.verifyHamburgerMenuOpens();
      if (!menuOk) return false;

      // Navigate to Contacts
      const contactsOk = await this.navigateToMenuPage("contacts");
      if (!contactsOk) return false;

      logger.info("✓ Full navigation flow completed successfully");
      return true;
    } catch (e) {
      logger.error(`✗ Full navigation flow failed: ${e}`);
      return false;
    }
  }

  async testMultipleMenuNavigation(): Promise<boolean> {
    logger.info("Starting multiple menu navigation test");

    const menuItems = ["contacts", "settings", "call history", "help & feedback"];
    let allPassed = true;

    for (const item of menuItems) {
      const result = await this.navigateToMenuPage(item);
      if (!result) {
        allPassed = false;
      }
      await this.driver.pause(300);
    }

    return allPassed;
  }

  async testKeypadActions(): Promise<boolean> {
    logger.info("Starting Keypad actions test");

    try {
      // Navigate to Keypad
      await this.dialerPage.clickKeypadTab();
      await this.driver.pause(500);

      // Verify keypad is displayed
      const keypadOk = await this.verifyKeypadPage();
      if (!keypadOk) return false;

      // Test entering phone number
      await this.dialerPage.enterPhoneNumber("1234567890");
      await this.driver.pause(300);
      logger.info("✓ Phone number entered successfully");

      // Test create new contact action
      try {
        await this.dialerPage.clickCreateNewContact();
        await this.driver.pause(500);
        logger.info("✓ Create new contact action triggered");
      } catch {
        logger.warn("Create new contact action not available or failed");
      }

      return true;
    } catch (e) {
      logger.error(`✗ Keypad actions test failed: ${e}`);
      return false;
    }
  }

  async testContactSavingFlow(phoneNumber: string, contactName: string): Promise<boolean> {
    logger.info("Starting contact saving flow test");

    try {
      // Navigate to Keypad
      await this.dialerPage.clickKeypadTab();
      await this.driver.pause(500);

      // Verify keypad is displayed
      const keypadOk = await this.verifyKeypadPage();
      if (!keypadOk) return false;

      // Type phone number
      await this.dialerPage.enterPhoneNumber(phoneNumber);
      await this.driver.pause(300);
      logger.info("✓ Phone number entered successfully");

      // Click 'Create new contact'
      await this.dialerPage.clickCreateNewContact();
      await this.driver.pause(1000);
      logger.info("✓ Clicked Create new contact");

      // Verify contact save page is displayed
      const contactPageOk = await this.dialerPage.isContactSavePageDisplayed();
      if (!contactPageOk) {
        logger.error("✗ Contact save page not displayed");
        return false;
      }
      logger.info("✓ Contact save page displayed");

      // Enter contact name
      await this.dialerPage.enterContactName(contactName);
      await this.driver.pause(300);
      logger.info("✓ Contact name entered");

      // Click save button
      await this.dialerPage.clickSaveContact();
      await this.driver.pause(1000);
      logger.info("✓ Contact saved successfully");

      return true;
    } catch (e) {
      logger.error(`✗ Contact saving flow failed: ${e}`);
      return false;
    }
  }
}
