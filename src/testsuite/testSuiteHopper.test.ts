import { Browser } from "webdriverio";
import { createDriver, quitDriver, stopAppiumServer } from "../helpers/appiumDriver";
import { HomePageHelper } from "../helpers/HomePageHelper";
import { testData } from "../../TestData/testData";
import logger from "../helpers/loggerUtils";

describe("Hopper App Test Suite", function () {
  this.timeout(300000);

  let driver: Browser;
  let homePageHelper: HomePageHelper;

  afterEach(async function () {
    await quitDriver(driver);
  });

  after(async function () {
    await stopAppiumServer();
  });

  it("Test 01: Flight Search and add to watch", async function () {
    logger.info("Starting flight booking test");
    driver = await createDriver(true);
    homePageHelper = new HomePageHelper(driver);
    await homePageHelper.bookFlight(testData.flightDetails);
    logger.info("Flight booking test completed");
  });

  it("Test 02: Hotel Search with filter and verify results", async function () {
    logger.info("Starting hotel search test");
    driver = await createDriver();
    homePageHelper = new HomePageHelper(driver);
    await homePageHelper.searchAndVerifyHotelResults(
      testData.hotelsBookingDetails
    );
    logger.info("Hotel search test completed");
  });

  it("Test 03: Currency conversion", async function () {
    logger.info("Starting currency conversion test");
    driver = await createDriver();
    homePageHelper = new HomePageHelper(driver);
    await homePageHelper.changeAndVerifyCurrencyForUser(
      testData.currencyList
    );
    logger.info("Currency conversion test completed");
  });

  it("Test 04: Verify wallet page", async function () {
    logger.info("Starting wallet page verification test");
    driver = await createDriver();
    homePageHelper = new HomePageHelper(driver);
    await homePageHelper.navigateAndVerifyWalletContents(
      testData.tabsOnWalletPage
    );
    logger.info("Wallet page verification test completed");
  });

  it("Test 05: Verify tree page", async function () {
    logger.info("Starting tree verification test");
    driver = await createDriver();
    homePageHelper = new HomePageHelper(driver);
    await homePageHelper.navigateAndVerifyTreePage(
      testData.textOnTreesPage
    );
    logger.info("Tree verification test completed");
  });
});
