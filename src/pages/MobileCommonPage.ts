import { Browser } from "webdriverio";
import { Base, Locator } from "../helpers/base";
import logger from "../helpers/loggerUtils";

export class MobileCommonPage {
  protected driver: Browser;
  protected base: Base;

  // Locators
  static readonly LOC_SELECT_CALENDAR_DATES_INPUT: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Departure Date - Return Date"]',
  ];
  static readonly LOC_SEARCH_THESE_DATES_BTN: Locator = [
    "id",
    "com.hopper.mountainview.play:id/selectTheseDatesButton",
  ];
  static readonly LOC_CHOOSE_DATE_FOR_HOTELS: Locator = [
    "xpath",
    '//android.widget.Button[@text="Choose Dates"]',
  ];
  static readonly LOC_NAV_UP: Locator = ["accessibility id", "Navigate up"];
  static readonly LOC_CANCEL_BUTTON: Locator = ["accessibility id", "Cancel"];
  static readonly LOC_NAV_BACK_BTN: Locator = [
    "xpath",
    '//android.view.View[@content-desc="Back button"]',
  ];

  constructor(driver: Browser) {
    this.driver = driver;
    this.base = new Base(driver);
  }

  getCalendarDay(dateToSet: string): Locator {
    const parts = dateToSet.split(" ");
    const day = parts[0];
    const month = parts[1];
    return [
      "xpath",
      `//android.widget.LinearLayout[@content-desc="${month}"]/android.widget.GridView/android.widget.RelativeLayout/android.widget.TextView[@text="${day}"]`,
    ];
  }

  getCheckboxFor(checkboxLabel: string): Locator {
    return [
      "xpath",
      `//android.widget.TextView[@text="${checkboxLabel}"]/preceding-sibling::android.widget.CheckBox`,
    ];
  }

  async selectCalendarDateRange(
    fromDate: string,
    toDate: string,
    forFlights = true
  ): Promise<boolean> {
    try {
      logger.info(
        `Selecting date range from ${fromDate} to ${toDate} for ${forFlights ? "flights" : "hotels"}`
      );
      const from = fromDate.replace(/^0+/, "");
      const to = toDate.replace(/^0+/, "");

      if (forFlights) {
        logger.info("Clicking calendar date input field");
        await this.base.clickOn(MobileCommonPage.LOC_SELECT_CALENDAR_DATES_INPUT);
      }

      logger.info(`Scrolling to find and select departure date: ${from}`);
      await this.scrollAndFindDate(this.getCalendarDay(from));
      if (!forFlights) {
        await this.base.clickOn(this.getCalendarDay(from));
      }
      await this.base.clickOn(this.getCalendarDay(from));

      logger.info(`Scrolling to find and select return date: ${to}`);
      await this.scrollAndFindDate(this.getCalendarDay(to));
      await this.base.clickOn(this.getCalendarDay(to));

      await this.driver.pause(2000);

      if (forFlights) {
        logger.info("Clicking search these dates button");
        await this.base.clickOn(MobileCommonPage.LOC_SEARCH_THESE_DATES_BTN);
      } else {
        logger.info("Clicking choose dates button");
        await this.base.clickOn(MobileCommonPage.LOC_CHOOSE_DATE_FOR_HOTELS);
      }
      logger.info("Date range selection completed successfully");
      return true;
    } catch (e) {
      logger.error(`Failed to select date range: ${e}`);
      return false;
    }
  }

  async scrollAndFindDate(targetDateLocator: Locator, maxSwipes = 10): Promise<void> {
    logger.info(`Starting to scroll and find date with max ${maxSwipes} swipes`);
    const scrollerLocator: Locator = [
      "xpath",
      "//android.widget.LinearLayout[@content-desc]/android.widget.GridView",
    ];
    const scroller = await this.base.element(scrollerLocator);
    const rect = await scroller.getLocation();
    const size = await scroller.getSize();

    const startX = rect.x + size.width / 2;
    const startY = rect.y + size.height - 10;
    const endY = rect.y + 10;

    for (let i = 0; i < maxSwipes; i++) {
      const dateElements = await this.base.elements(targetDateLocator);
      if (dateElements.length > 0) {
        logger.info(`Date found after ${i + 1} swipes`);
        return;
      }

      logger.debug(`Scrolling up... (attempt ${i + 1}/${maxSwipes})`);
      await this.base.touchAndMove(startX, startY, startX, endY);
      await this.driver.pause(1000);
    }
    logger.warn("Max swipes reached. Date not found.");
  }

  async selectCheckbox(checkboxLabel: string): Promise<void> {
    logger.info(`Selecting checkbox for: ${checkboxLabel}`);
    await this.base.scrollUntilElementFound(checkboxLabel);
    await this.base.clickOn(this.getCheckboxFor(checkboxLabel));
    logger.info(`Checkbox selected successfully: ${checkboxLabel}`);
  }

  async navigateUp(): Promise<void> {
    logger.info("Navigating up");
    await this.driver.pause(2000);
    await this.base.clickOn(MobileCommonPage.LOC_NAV_UP);
    logger.info("Navigation up completed");
  }

  async goToPreviousScreen(): Promise<void> {
    logger.info("Going to previous screen");
    await this.driver.pause(2000);
    await this.base.clickOn(MobileCommonPage.LOC_CANCEL_BUTTON);
    logger.info("Navigation to previous screen completed");
  }

  async navigateBack(): Promise<void> {
    logger.info("Navigating back");
    await this.base.clickOn(MobileCommonPage.LOC_NAV_BACK_BTN);
    logger.info("Navigation back completed");
  }
}
