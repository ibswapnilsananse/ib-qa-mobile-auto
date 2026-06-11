import { Browser } from "webdriverio";
import { HotelsBookingPage } from "../pages/HotelsBookingPage";
import logger from "./loggerUtils";

export class HotelsBookingFlow extends HotelsBookingPage {
  constructor(driver: Browser) {
    super(driver);
    logger.info("HotelsBookingFlow initialized");
  }

  async hotelSearch(
    location: string,
    minPrice: number,
    maxPrice: number,
    sortBy: string,
    fromDate: string,
    toDate: string,
    starRating: string,
    userRating: string,
    paymentType: string,
    isFreeCancellation: boolean
  ): Promise<void> {
    await this.enterCityForHotelSearch(location, fromDate, toDate);
    await this.applyFilters(
      minPrice,
      maxPrice,
      sortBy,
      starRating,
      userRating,
      paymentType,
      isFreeCancellation
    );
  }

  async verifyHotelResults(
    location: string,
    minPrice: number,
    maxPrice: number,
    fromDate: string,
    toDate: string,
    starRating: string,
    isFreeCancellation: boolean
  ): Promise<void> {
    await this.verifyHotelSearchDetailsForResults(
      location,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      starRating,
      isFreeCancellation
    );
  }
}
