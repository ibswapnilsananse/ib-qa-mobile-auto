import { Browser } from "webdriverio";
import { HomePage } from "../pages/HomePage";
import { FlightBookingFlow } from "./FlightBookingFlow";
import { HotelsBookingFlow } from "./HotelsBookingFlow";
import { FlightDetails, HotelsBookingDetails } from "../../TestData/testData";
import logger from "./loggerUtils";

export class HomePageHelper extends HomePage {
  private flightBookingFlow: FlightBookingFlow;
  private hotelBookingFlow: HotelsBookingFlow;

  constructor(driver: Browser) {
    super(driver);
    this.flightBookingFlow = new FlightBookingFlow(driver);
    this.hotelBookingFlow = new HotelsBookingFlow(driver);
    logger.info("HomePageHelper initialized");
  }

  async bookFlight(flightDetails: FlightDetails): Promise<void> {
    logger.info("Starting flight booking flow");
    const { fromCity, toCity, fromDate, toDate } = flightDetails;
    await this.skipAds();
    await this.navigateToMenu("Flights");
    await this.flightBookingFlow.searchFlightAndAddToWatches(
      fromCity,
      toCity,
      fromDate,
      toDate
    );
    await this.navigateUp();
    await this.goToPreviousScreen();
    await this.navigateToMenu("Watches");
    await this.flightBookingFlow.verifyFlightUnderWatches(fromCity, toCity);
    logger.info("Flight booking flow completed");
  }

  async searchAndVerifyHotelResults(
    hotelsBookingDetails: HotelsBookingDetails
  ): Promise<void> {
    logger.info("Starting hotel search and verify flow");
    const {
      location,
      minPrice,
      maxPrice,
      sortBy,
      fromDate,
      toDate,
      starRating,
      userRating,
      paymentType,
      isFreeCancellation,
    } = hotelsBookingDetails;

    await this.skipAds();
    await this.navigateToMenu("Hotels");
    await this.hotelBookingFlow.hotelSearch(
      location,
      minPrice,
      maxPrice,
      sortBy,
      fromDate,
      toDate,
      starRating,
      userRating,
      paymentType,
      isFreeCancellation
    );
    await this.hotelBookingFlow.verifyHotelResults(
      location,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      starRating,
      isFreeCancellation
    );
    logger.info("Hotel search and verify flow completed");
  }

  async changeAndVerifyCurrencyForUser(
    currencyList: string[]
  ): Promise<void> {
    logger.info("Starting currency verification flow");
    await this.navigateToProfileSettings();
    await this.selectAndVerifyWalletCurrency(currencyList);
    logger.info("Currency verification flow completed");
  }

  async navigateAndVerifyTreePage(textList: string[]): Promise<void> {
    logger.info("Starting tree page verification flow");
    await this.skipAds();
    await this.navigateToMenu("Trees");
    await this.verifyTextOnTreesPage(textList);
    logger.info("Tree page verification flow completed");
  }

  async navigateAndVerifyWalletContents(textList: string[]): Promise<void> {
    logger.info("Starting wallet contents verification flow");
    await this.skipAds();
    await this.navigateWallet(textList);
    logger.info("Wallet contents verification flow completed");
  }
}
