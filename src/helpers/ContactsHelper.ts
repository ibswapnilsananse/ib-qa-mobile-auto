import { Browser } from "webdriverio";
import { ContactsPage } from "../pages/ContactsPage";
import { DialerPage } from "../pages/DialerPage";
import logger from "./loggerUtils";

export interface ContactDetails {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export class ContactsHelper {
  private driver: Browser;
  private contactsPage: ContactsPage;
  private dialerPage: DialerPage;

  constructor(driver: Browser) {
    this.driver = driver;
    this.contactsPage = new ContactsPage(driver);
    this.dialerPage = new DialerPage(driver);
  }

  async navigateToViewContacts(): Promise<void> {
    logger.info("Navigating to View Contacts");
    await this.contactsPage.clickViewContacts();
    await this.driver.pause(800);
  }

  async navigateToAddContact(): Promise<void> {
    logger.info("Navigating to Add Contact");
    await this.contactsPage.clickAddContact();
    await this.driver.pause(800);
  }

  async createContact(contact: ContactDetails): Promise<void> {
    logger.info(`Creating contact: ${contact.firstName} ${contact.lastName}`);

    await this.navigateToAddContact();

    await this.contactsPage.enterFirstName(contact.firstName);
    await this.driver.pause(200);

    await this.contactsPage.enterLastName(contact.lastName);
    await this.driver.pause(200);

    if (contact.phone) {
      await this.contactsPage.enterPhone(contact.phone);
      await this.driver.pause(200);
    }

    if (contact.email) {
      await this.contactsPage.enterEmail(contact.email);
      await this.driver.pause(200);
    }

    await this.contactsPage.clickSave();
    await this.driver.pause(800);

    logger.info(`Contact created successfully: ${contact.firstName} ${contact.lastName}`);
  }

  async createContactViaKeypad(contact: ContactDetails): Promise<void> {
    logger.info(`Creating contact via keypad: ${contact.firstName} ${contact.lastName}`);

    // Navigate to Keypad tab
    logger.info("Navigating to keypad");
    await this.dialerPage.clickKeypadTab();
    await this.driver.pause(500);

    // Enter phone number
    if (contact.phone) {
      logger.info(`Entering phone number: ${contact.phone}`);
      await this.dialerPage.enterPhoneNumber(contact.phone);
      await this.driver.pause(500);
    } else {
      logger.error("Phone number is required for keypad-based contact creation");
      throw new Error("Phone number is required for keypad-based contact creation");
    }

    // Click 'Create new contact'
    logger.info("Clicking 'Create new contact'");
    await this.dialerPage.clickCreateNewContact();
    await this.driver.pause(1000);

    // Verify contact save page is displayed
    const contactPageDisplayed = await this.dialerPage.isContactSavePageDisplayed();
    if (!contactPageDisplayed) {
      logger.error("Contact save page not displayed");
      throw new Error("Contact save page not displayed");
    }
    logger.info("Contact save page displayed");

    // Enter contact name (separate first and last name fields)
    logger.info(`Entering first name: ${contact.firstName}`);
    await this.dialerPage.enterContactFirstName(contact.firstName);
    await this.driver.pause(300);

    logger.info(`Entering last name: ${contact.lastName}`);
    await this.dialerPage.enterContactLastName(contact.lastName);
    await this.driver.pause(300);

    // Click save button
    logger.info("Clicking save button");
    await this.dialerPage.clickSaveContact();
    await this.driver.pause(1000);

    logger.info(`Contact created successfully via keypad: ${contact.firstName} ${contact.lastName}`);
  }

  async verifyContactCreated(contact: ContactDetails): Promise<boolean> {
    logger.info(`Verifying contact: ${contact.firstName} ${contact.lastName}`);

    await this.navigateToViewContacts();
    await this.driver.pause(500);

    const contactName = `${contact.firstName} ${contact.lastName}`;
    const isDisplayed = await this.contactsPage.isContactDisplayed(contactName);

    if (isDisplayed) {
      logger.info(`✓ Contact verified: ${contactName}`);
    } else {
      logger.error(`✗ Contact not found: ${contactName}`);
    }

    return isDisplayed;
  }

  async searchAndVerifyContact(searchTerm: string): Promise<boolean> {
    logger.info(`Searching for contact: ${searchTerm}`);

    await this.contactsPage.searchContact(searchTerm);
    await this.driver.pause(500);

    const isFound = await this.contactsPage.isContactDisplayed(searchTerm);

    if (isFound) {
      logger.info(`✓ Contact found: ${searchTerm}`);
    } else {
      logger.error(`✗ Contact not found: ${searchTerm}`);
    }

    return isFound;
  }

  async openContactAndVerify(contactName: string): Promise<boolean> {
    logger.info(`Opening contact: ${contactName}`);

    try {
      await this.contactsPage.selectContact(contactName);
      await this.driver.pause(500);
      logger.info(`✓ Contact opened: ${contactName}`);
      return true;
    } catch (e) {
      logger.error(`✗ Failed to open contact: ${contactName}`);
      return false;
    }
  }

  async createMultipleContacts(contacts: ContactDetails[]): Promise<boolean> {
    logger.info(`Creating ${contacts.length} contacts`);

    for (const contact of contacts) {
      try {
        await this.createContact(contact);
        await this.driver.pause(500);
      } catch (e) {
        logger.error(`Failed to create contact: ${contact.firstName} ${contact.lastName}`);
        return false;
      }
    }

    logger.info(`All ${contacts.length} contacts created successfully`);
    return true;
  }

  async verifyMultipleContactsCreated(contacts: ContactDetails[]): Promise<boolean> {
    logger.info(`Verifying ${contacts.length} contacts`);

    await this.navigateToViewContacts();
    await this.driver.pause(500);

    let allVerified = true;
    for (const contact of contacts) {
      const contactName = `${contact.firstName} ${contact.lastName}`;
      const verified = await this.contactsPage.isContactDisplayed(contactName);
      
      if (verified) {
        logger.info(`✓ Contact verified: ${contactName}`);
      } else {
        logger.error(`✗ Contact not found: ${contactName}`);
        allVerified = false;
      }
      
      await this.driver.pause(300);
    }

    return allVerified;
  }
}
