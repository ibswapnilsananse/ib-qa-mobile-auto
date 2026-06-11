import { Browser, Element } from "webdriverio";
import { Locator } from "../helpers/base";
import { MobileCommonPage } from "./MobileCommonPage";
import logger from "../helpers/loggerUtils";

export class HotelsBookingPage extends MobileCommonPage {
  static readonly LOC_HOTEL_LOCATION: Locator = [
    "id",
    "com.hopper.mountainview.play:id/locationSearchEditText",
  ];
  static readonly LOC_PRICE_RANGE: Locator = [
    "xpath",
    '(//android.widget.TextView[@text="Nightly Price"]/following-sibling::android.widget.TextView)[1]',
  ];
  static readonly MAX_SLIDER: Locator = [
    "xpath",
    '//android.widget.ImageView[@resource-id="com.hopper.mountainview.play:id/max_slider_thumb"]',
  ];
  static readonly MIN_SLIDER: Locator = [
    "xpath",
    '//android.widget.ImageView[@resource-id="com.hopper.mountainview.play:id/min_slider_thumb"]',
  ];
  static readonly LOC_SELECT_FILTER_BTN: Locator = [
    "id",
    "com.hopper.mountainview.play:id/select_filters",
  ];
  static readonly LOC_HOTEL_SEARCH_PAGE_TITLE: Locator = [
    "xpath",
    '//android.widget.TextView[@text="All Hotels"]',
  ];
  static readonly LOC_HOTEL_LOCATION_ON_RESULT: Locator = [
    "id",
    "com.hopper.mountainview.play:id/locationSelector",
  ];
  static readonly LOC_DISPLAYED_DATE_RANGE: Locator = [
    "id",
    "com.hopper.mountainview.play:id/datesSelector",
  ];
  static readonly FILTER_LINK: Locator = [
    "id",
    "com.hopper.mountainview.play:id/filters_link",
  ];

  static readonly LOC_DISPLAYED_HOTEL_DATA =
    '//android.widget.FrameLayout[@resource-id="com.hopper.mountainview.play:id/lodging_count"]//android.widget.TextView';

  constructor(driver: Browser) {
    super(driver);
    logger.info("HotelsBookingPage initialized");
  }

  getLocationSuggestion(cityLocation: string): Locator {
    return [
      "xpath",
      `(//android.widget.FrameLayout[@resource-id="com.hopper.mountainview.play:id/icon_frame"]/following-sibling::android.widget.TextView[contains(@text,"${cityLocation}")])[1]`,
    ];
  }

  getSliderWidget(sliderRatingLabel: string): Locator {
    const index = sliderRatingLabel === "Star" ? 1 : 2;
    return [
      "xpath",
      `(//android.view.ViewGroup[@resource-id="com.hopper.mountainview.play:id/slider_widget"])[${index}]`,
    ];
  }

  getSliderPointer(sliderRatingLabel: string): Locator {
    const index = sliderRatingLabel === "Star" ? 1 : 2;
    return [
      "xpath",
      `(//android.view.ViewGroup[@resource-id="com.hopper.mountainview.play:id/slider_widget"])[${index}]/android.widget.ImageView`,
    ];
  }

  async enterCityForHotelSearch(
    cityLocation: string,
    startDate: string,
    toDate: string
  ): Promise<void> {
    logger.info(
      `Starting hotel search for city: ${cityLocation} from ${startDate} to ${toDate}`
    );
    await this.base.sendText(HotelsBookingPage.LOC_HOTEL_LOCATION, cityLocation);
    await this.base.waitUntilDisplayed(
      this.getLocationSuggestion(cityLocation)
    );
    await this.base.clickOn(this.getLocationSuggestion(cityLocation));

    const dateSelected = await this.selectCalendarDateRange(
      startDate,
      toDate,
      false
    );
    if (!dateSelected) throw new Error("Failed to select date range");

    await this.base.waitUntilDisplayed(
      HotelsBookingPage.LOC_HOTEL_SEARCH_PAGE_TITLE,
      30000
    );
    await this.base.isDisplayed(HotelsBookingPage.LOC_HOTEL_SEARCH_PAGE_TITLE);
    await this.verifyDateOnHotelDetailsPage(startDate, toDate);
    logger.info("Hotel search parameters entered successfully");
  }

  async verifyDateOnHotelDetailsPage(
    startDate: string,
    toDate: string
  ): Promise<void> {
    const [startDay, startMonth] = startDate.split(" ");
    const [toDay, toMonth] = toDate.split(" ");
    const expectedDateRange =
      startMonth !== toMonth
        ? `${startMonth} ${startDay} - ${toMonth} ${toDay}`
        : `${startMonth} ${startDay} - ${toDay}`;

    const displayedDateRange = await this.base.getText(
      HotelsBookingPage.LOC_DISPLAYED_DATE_RANGE
    );
    logger.info(
      `Verifying date range - Expected: ${expectedDateRange}, Displayed: ${displayedDateRange}`
    );
    if (expectedDateRange.toLowerCase() !== displayedDateRange.toLowerCase()) {
      throw new Error(
        `Date range mismatch. Expected: ${expectedDateRange}, Got: ${displayedDateRange}`
      );
    }
    logger.info("Date range verification successful");
  }

  async getPropertiesCountOnDetailsPage(): Promise<number> {
    const propertiesCountText = await this.base.getText([
      "xpath",
      `${HotelsBookingPage.LOC_DISPLAYED_HOTEL_DATA}[2]`,
    ]);
    let count = 0;
    for (const word of propertiesCountText.split(/\s+/)) {
      const cleaned = word.replace(/,/g, "");
      if (/^\d+$/.test(cleaned)) {
        count = parseInt(cleaned, 10);
        break;
      }
    }
    logger.info(`Got properties count as: ${count}`);
    return count;
  }

  async applyFilters(
    minRange: number,
    maxRange: number,
    sortBy: string,
    starRating: string,
    userRating: string,
    paymentType: string,
    isFreeCancellation: boolean
  ): Promise<void> {
    logger.info(
      `Applying filters - Price: ${minRange}-${maxRange}, Sort: ${sortBy}, Rating: ${starRating}, User Rating: ${userRating}`
    );
    await this.base.isDisplayed(HotelsBookingPage.LOC_HOTEL_SEARCH_PAGE_TITLE);
    await this.base.clickOn(HotelsBookingPage.FILTER_LINK);
    await this.sortHotelsSearchResult(sortBy);
    await this.setMinAndMaxRange(minRange, maxRange);
    await this.selectStarRating(starRating);
    await this.selectUserRating(userRating);
    await this.selectCheckbox(paymentType);
    if (isFreeCancellation) {
      await this.selectCheckbox("Free cancellation");
    }
    await this.base.clickOn(HotelsBookingPage.LOC_SELECT_FILTER_BTN);
    await this.driver.pause(2000);
    logger.info("All filters applied successfully");
  }

  async setMinAndMaxRange(
    minRange: number,
    maxRange: number
  ): Promise<void> {
    await this.base.scrollUntilElementFound("Nightly Price");
    await this.adjustSlider(HotelsBookingPage.MAX_SLIDER, maxRange, "left");
    await this.adjustSlider(HotelsBookingPage.MIN_SLIDER, minRange, "right");
  }

  async sortHotelsSearchResult(sortBy: string): Promise<void> {
    const sortOptionsDict: Record<string, number> = {
      "Most Recommended": 1,
      "Star Rating (highest first)": 2,
      "User Rating (highest first)": 3,
      "Price (lowest first)": 4,
    };
    const sortOption = sortOptionsDict[sortBy] ?? 3;

    await this.base.scrollUntilElementFound(
      "android.widget.RadioButton",
      "class",
      sortOption
    );

    const radioButtonXpath = `(//android.widget.RadioButton)[${sortOption}]`;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.base.clickOn(["xpath", radioButtonXpath]);
        await this.driver.pause(1000);
        const radioButton = await this.base.element([
          "xpath",
          radioButtonXpath,
        ]);
        const isSelected = await radioButton.getAttribute("selected");
        if (isSelected === "true") {
          logger.info(
            `Sort selected for ${sortBy} with index ${sortOption}`
          );
          return;
        }
        logger.info(
          `Attempt ${attempt + 1}: Radio button not selected, retrying...`
        );
      } catch (e) {
        logger.warn(
          `Attempt ${attempt + 1}: Error selecting sort option, retrying... ${e}`
        );
        await this.driver.pause(1000);
      }
    }
    logger.error(
      `Failed to select sort option ${sortBy} after ${maxRetries} attempts`
    );
  }

  async adjustSlider(
    sliderLocator: Locator,
    expectedValue: number,
    direction: "left" | "right"
  ): Promise<void> {
    const slider = await this.base.element(sliderLocator);
    let currentValue = await this.getSliderValue(direction);

    if (direction === "right") {
      while (currentValue < expectedValue) {
        await this.moveSlider(slider, direction);
        currentValue = await this.getSliderValue(direction);
      }
    } else {
      while (currentValue > expectedValue) {
        await this.moveSlider(slider, direction);
        currentValue = await this.getSliderValue(direction);
      }
    }
    await this.driver.pause(2000);
  }

  async selectStarRating(rating: string): Promise<void> {
    await this.base.scrollUntilElementFound(
      "com.hopper.mountainview.play:id/slider_widget",
      "resource-id",
      1
    );
    const sliderWidget = await this.base.element(
      this.getSliderWidget("Star")
    );
    const sortOptions: Record<string, number> = {
      Any: 1,
      "+2": 2,
      "+3": 3,
      "+4": 4,
      "+5": 5,
    };
    const starRatingValue = sortOptions[rating] ?? 4;
    const sliderPoint = await this.base.element(
      this.getSliderPointer("Star")
    );
    await this.moveSliderToRating(
      sliderWidget,
      sliderPoint,
      1,
      starRatingValue,
      5
    );
  }

  async selectUserRating(rating: string): Promise<void> {
    await this.base.scrollUntilElementFound(
      "com.hopper.mountainview.play:id/slider_widget",
      "resource-id",
      2
    );
    const sliderWidget = await this.base.element(
      this.getSliderWidget("User")
    );
    const sortOptions: Record<string, number> = {
      Any: 1,
      "Very Good": 2,
      Excellent: 3,
    };
    const userRatingValue = sortOptions[rating] ?? 3;
    const sliderPoint = await this.base.element(
      this.getSliderPointer("User")
    );
    await this.moveSliderToRating(
      sliderWidget,
      sliderPoint,
      1,
      userRatingValue,
      3
    );
  }

  async getSliderValue(minOrMax: "left" | "right"): Promise<number> {
    const res = await this.base.getText(HotelsBookingPage.LOC_PRICE_RANGE);
    const cleaned = res.replace(/,/g, "");
    const numbers = cleaned.match(/\d+/g)?.map(Number) ?? [];
    return minOrMax === "right" ? numbers[0] : numbers[1];
  }

  async moveSlider(
    slider: Element,
    direction: "left" | "right",
    step = 30
  ): Promise<void> {
    const sliderSize = await slider.getSize();
    const sliderLocation = await slider.getLocation();
    const startX = sliderLocation.x + sliderSize.width / 2;
    const startY = sliderLocation.y + sliderSize.height / 2;
    const endX = direction === "right" ? startX + step : startX - step;

    await this.base.touchAndMove(startX, startY, endX, startY);
  }

  async moveSliderToRating(
    sliderBar: Element,
    sliderPoint: Element,
    currentRating: number,
    targetRating: number,
    totalRatings: number
  ): Promise<void> {
    const sliderWidth = (await sliderBar.getSize()).width;
    const pointSize = await sliderPoint.getSize();
    const pointLocation = await sliderPoint.getLocation();
    const pointX = pointLocation.x + pointSize.width / 2;
    const pointY = pointLocation.y + pointSize.height / 2;
    const stepSize = sliderWidth / (totalRatings - 1);
    const steps = targetRating - currentRating;
    const moveX = steps * stepSize;
    const finalX = pointX + moveX;

    await this.base.touchAndMove(pointX, pointY, finalX, pointY);
  }

  async verifyHotelSearchDetailsForResults(
    location: string,
    minPrice: number,
    maxPrice: number,
    fromDate: string,
    toDate: string,
    starRating: string,
    isFreeCancellation: boolean
  ): Promise<void> {
    logger.info(
      `Verifying hotel search results for ${location} with price range ${minPrice}-${maxPrice}`
    );

    const hotelLocation = await this.base.getText(
      HotelsBookingPage.LOC_HOTEL_LOCATION_ON_RESULT
    );

    const locHotelResultCard: Locator = [
      "xpath",
      '(//androidx.recyclerview.widget.RecyclerView[@resource-id="com.hopper.mountainview.play:id/lodgingsRecycler"]/android.widget.FrameLayout//android.view.ViewGroup[@resource-id="com.hopper.mountainview.play:id/item_info"])[1]',
    ];
    const resultCard = await this.base.element(locHotelResultCard);

    const priceEl = await resultCard.$(
      './/android.widget.LinearLayout[@resource-id="com.hopper.mountainview.play:id/priceView"]/android.widget.TextView'
    );
    const priceText = await priceEl.getText();
    const priceMatch = priceText.match(/[\d,]+/);
    if (!priceMatch) throw new Error("Price not found in the provided text.");
    const priceInt = parseInt(priceMatch[0].replace(/,/g, ""), 10);
    logger.info(`First hotel price: ${priceInt}`);

    const starRatingEl = await resultCard.$(
      './/android.widget.TextView[@resource-id="com.hopper.mountainview.play:id/starRatingIcon"]'
    );
    const starRatingText = await starRatingEl.getText();
    const starMatch = starRatingText.match(/\b\d\b/);
    const starRatingDisplayed = starMatch ? parseInt(starMatch[0], 10) : 0;
    logger.info(`First hotel rating: ${starRatingText}`);

    if (!hotelLocation.toLowerCase().includes(location.toLowerCase())) {
      throw new Error("Location not found in hotel details");
    }
    logger.info("Location verified successfully");

    if (priceInt < minPrice || priceInt > maxPrice) {
      throw new Error("Price not in the expected range");
    }
    logger.info("Price range verified successfully");

    const expectedStarRating = parseInt(starRating.replace("+", ""), 10);
    if (expectedStarRating > starRatingDisplayed) {
      throw new Error(
        `Star rating mismatch. Expected at least: ${expectedStarRating}, Got: ${starRatingDisplayed}`
      );
    }
    logger.info("Star rating verified successfully");

    if (isFreeCancellation) {
      const freeCancEl = await resultCard.$(
        './/android.widget.LinearLayout[@resource-id="com.hopper.mountainview.play:id/highlights"]/android.widget.TextView[@text="Free cancellation"]'
      );
      const freeCancText = await freeCancEl.getText();
      if (freeCancText.toLowerCase() !== "free cancellation") {
        throw new Error("free_cancellation not displayed");
      }
      logger.info(
        `Result card found with free Cancellation: ${freeCancText}`
      );
    }
    await this.verifyDateOnHotelDetailsPage(fromDate, toDate);
    logger.info("Hotel search results verification successful");
  }
}
