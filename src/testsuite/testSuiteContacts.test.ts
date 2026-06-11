import { expect } from "chai";
import { Browser } from "webdriverio";
import { createDriver, quitDriver, stopAppiumServer } from "../helpers/appiumDriver";
import { ContactsHelper } from "../helpers/ContactsHelper";
import { testData } from "../../TestData/testData";
import logger from "../helpers/loggerUtils";

describe("Contacts App Test Suite", function () {
  this.timeout(300000);

  let driver: Browser;
  let contactsHelper: ContactsHelper;

  afterEach(async function () {
    await quitDriver(driver);
  });

  after(async function () {
    await stopAppiumServer();
  });

  it("Test 01: Create Single Contact", async function () {
    logger.info("Starting create single contact test");
    driver = await createDriver(false);
    contactsHelper = new ContactsHelper(driver);

    await contactsHelper.createContact(testData.contactDetails[0]);
    const result = await contactsHelper.verifyContactCreated(testData.contactDetails[0]);
    expect(result).to.be.true;
  });

  it("Test 02: Create Contact and Verify", async function () {
    logger.info("Starting create and verify contact test");
    driver = await createDriver();
    contactsHelper = new ContactsHelper(driver);

    await contactsHelper.createContact(testData.contactDetails[1]);
    const result = await contactsHelper.verifyContactCreated(testData.contactDetails[1]);
    expect(result).to.be.true;
  });

  it("Test 03: Search Contact", async function () {
    logger.info("Starting search contact test");
    driver = await createDriver();
    contactsHelper = new ContactsHelper(driver);

    // First create a contact
    await contactsHelper.createContact(testData.contactDetails[0]);
    await driver.pause(1000);

    // Then search for it
    const searchTerm = testData.contactDetails[0].firstName;
    const result = await contactsHelper.searchAndVerifyContact(searchTerm);
    expect(result).to.be.true;
  });

  it("Test 04: Open Contact", async function () {
    logger.info("Starting open contact test");
    driver = await createDriver();
    contactsHelper = new ContactsHelper(driver);

    // Create a contact first
    await contactsHelper.createContact(testData.contactDetails[0]);
    await driver.pause(1000);

    // Open the contact
    const contactName = `${testData.contactDetails[0].firstName} ${testData.contactDetails[0].lastName}`;
    const result = await contactsHelper.openContactAndVerify(contactName);
    expect(result).to.be.true;
  });

  it("Test 05: Create Multiple Contacts", async function () {
    logger.info("Starting create multiple contacts test");
    driver = await createDriver();
    contactsHelper = new ContactsHelper(driver);

    const result = await contactsHelper.createMultipleContacts(testData.contactDetails);
    expect(result).to.be.true;
  });

  it("Test 06: Verify Multiple Contacts", async function () {
    logger.info("Starting verify multiple contacts test");
    driver = await createDriver();
    contactsHelper = new ContactsHelper(driver);

    // Create contacts first
    await contactsHelper.createMultipleContacts(testData.contactDetails);
    await driver.pause(1000);

    // Verify all contacts
    const result = await contactsHelper.verifyMultipleContactsCreated(testData.contactDetails);
    expect(result).to.be.true;
  });
});
