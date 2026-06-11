import { Browser } from "webdriverio";
import { Locator } from "../helpers/base";
import { MobileCommonPage } from "./MobileCommonPage";
import logger from "../helpers/loggerUtils";

export class FlightsBookingPage extends MobileCommonPage {
  static readonly LOC_CLOSE_BTN_ON_EMAIL_AD: Locator = [
    "xpath",
    '(//android.view.View[@content-desc="Close sheet"]/following-sibling::android.view.View/android.view.View/android.view.View/android.view.View)[1]',
  ];
  static readonly LOC_SEARCH_FLIGHTS_BTN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Search"]',
  ];
  static readonly LOC_LOADING_SCREEN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="LOADING"]',
  ];

  constructor(driver: Browser) {
    super(driver);
  }

  cityInputField(isSource: boolean): Locator {
    const placeholder = isSource ? "Where from?" : "Where to?";
    return [
      "xpath",
      `//android.widget.TextView[@text="${placeholder}"]/ancestor::android.widget.EditText`,
    ];
  }

  populatedSuggestionsForCity(cityName: string): Locator {
    return [
      "xpath",
      `//android.widget.TextView[@text="Airports"]/following-sibling::android.widget.TextView[contains(@text,"${cityName}")]`,
    ];
  }

  async selectCity(isSource: boolean, cityName: string): Promise<void> {
    logger.info(
      `Selecting ${isSource ? "source" : "destination"} city: ${cityName}`
    );
    await this.base.sendText(this.cityInputField(isSource), cityName);
    await this.base.waitUntilDisplayed(
      this.populatedSuggestionsForCity(cityName),
      30000
    );
    await this.base.clickOn(this.populatedSuggestionsForCity(cityName));
  }

  async searchFlights(
    fromCity: string,
    toCity: string,
    fromDate: string,
    toDate: string
  ): Promise<void> {
    logger.info(
      `Starting flight search from ${fromCity} to ${toCity} for dates ${fromDate} to ${toDate}`
    );
    await this.selectCity(true, fromCity);
    await this.selectCity(false, toCity);
    await this.selectCalendarDateRange(fromDate, toDate);
    logger.info("Clicking search flights button");
    await this.base.clickOn(FlightsBookingPage.LOC_SEARCH_FLIGHTS_BTN);
    logger.info("Flight search initiated successfully");
  }

  async addToWatchButton(): Promise<void> {
    logger.info("Waiting for loading screen to disappear");
    await this.base.waitUntilElementDisappears("text", "LOADING", 25000);

    const notWatchingId =
      "com.hopper.mountainview.play:id/not_watching_button";
    logger.info("Clicking add to watch button");
    await this.base.clickOn(["id", notWatchingId]);
    await this.driver.pause(5000);

    logger.info("Verifying watch button state changed");
    await this.base.isDisplayed([
      "id",
      notWatchingId.replace("not_watching_button", "watching_button"),
    ]);
    logger.info("Successfully added flight to watch list");
  }

  async handleEmailAd(): Promise<void> {
    logger.info("Checking for email ad popup");
    try {
      const elements = await this.base.elements(
        FlightsBookingPage.LOC_CLOSE_BTN_ON_EMAIL_AD
      );
      if (elements.length > 0) {
        logger.info("Email ad popup found, attempting to close");
        await this.base.clickOn(
          FlightsBookingPage.LOC_CLOSE_BTN_ON_EMAIL_AD,
          undefined,
          "Close Email Ad Button"
        );
        logger.info("Email ad popup closed successfully");
      }
    } catch (e) {
      logger.warn(`First attempt to close email ad failed: ${e}`);
      try {
        await this.base.clickOn(
          FlightsBookingPage.LOC_CLOSE_BTN_ON_EMAIL_AD,
          undefined,
          "Close Email Ad Button"
        );
        logger.info("Email ad popup closed on second attempt");
      } catch (e2) {
        logger.info(
          `No email ad popup found or unable to close: ${e2}`
        );
      }
    }
  }

  async verifyFlightIsAddedUnderWatches(
    fromCity: string,
    toCity: string
  ): Promise<void> {
    logger.info(
      `Starting verification of flight from ${fromCity} to ${toCity} in watch list`
    );
    const locCityRoute: Locator = [
      "xpath",
      `//android.widget.TextView[contains(@text,"${fromCity} to ${toCity}")]`,
    ];
    logger.info("Waiting for city route text to be displayed");
    await this.base.waitUntilDisplayed(
      locCityRoute,
      undefined,
      "City Route Text"
    );
    logger.info("Verifying city route text is visible");
    await this.base.isDisplayed(locCityRoute, undefined, "City Route Text");
    logger.info("Navigating back");
    await this.navigateBack();
  }
}
