import { Browser } from "webdriverio";
import { FlightsBookingPage } from "../pages/FlightsBookingPage";
import logger from "./loggerUtils";

export class FlightBookingFlow extends FlightsBookingPage {
  constructor(driver: Browser) {
    super(driver);
    logger.info("FlightBookingFlow initialized");
  }

  async searchFlightAndAddToWatches(
    fromCity: string,
    toCity: string,
    fromDate: string,
    toDate: string
  ): Promise<void> {
    logger.info(
      `Starting flight search flow from ${fromCity} to ${toCity}`
    );
    await this.searchFlights(fromCity, toCity, fromDate, toDate);
    await this.addToWatchButton();
    logger.info("Flight search and watch list addition completed");
  }

  async verifyFlightUnderWatches(
    fromCity: string,
    toCity: string
  ): Promise<void> {
    await this.verifyFlightIsAddedUnderWatches(fromCity, toCity);
  }
}
