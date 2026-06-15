import { Browser } from "webdriverio";
import { WhereIsMyTrainPage } from "../pages/WhereIsMyTrainPage";
import logger from "./loggerUtils";

export class WhereIsMyTrainHelper {
  private driver: Browser;
  private page: WhereIsMyTrainPage;

  constructor(driver: Browser) {
    this.driver = driver;
    this.page = new WhereIsMyTrainPage(driver);
  }

  // ── Home Page ─────────────────────────────────────────────────────────────

  async verifyHomePageDisplayed(): Promise<boolean> {
    return this.page.isHomePageDisplayed();
  }

  async verifyHomePageElements(): Promise<{
    home: boolean;
    from: boolean;
    to: boolean;
    findTrains: boolean;
  }> {
    const home = await this.page.isHomePageDisplayed();
    const from = await this.page.isFromStationInputDisplayed();
    const to = await this.page.isToStationInputDisplayed();
    const findTrains = await this.page.isFindTrainsButtonDisplayed();
    return { home, from, to, findTrains };
  }

  // ── TC02: Search trains From/To ───────────────────────────────────────────

  async searchTrainsByFromTo(
    fromStation: string,
    fromAcronym: string,
    toStation: string,
    toAcronym: string
  ): Promise<void> {
    logger.info(`Entering From station: ${fromStation}`);
    await this.page.enterFromStation(fromStation);
    await this.page.selectFromSuggestion(fromAcronym);

    logger.info(`Entering To station: ${toStation}`);
    await this.page.enterToStation(toStation);
    await this.page.selectToSuggestion(toAcronym);

    logger.info("Clicking Find trains");
    await this.page.clickFindTrains();
  }

  async getFromToSearchResults(): Promise<{ trainNumbers: string[]; sourceStations: string[] }> {
    const isDisplayed = await this.page.isSearchResultsPageDisplayed();
    if (!isDisplayed) throw new Error("Search results page (live_station_rl) not displayed");
    const trainNumbers = await this.page.getResultTrainNumbers();
    const sourceStations = await this.page.getResultSourceStations();
    return { trainNumbers, sourceStations };
  }

  // ── TC03: Search by Train No / Name ───────────────────────────────────────

  async searchByTrainNumber(trainNoOrName: string): Promise<void> {
    logger.info(`Searching by train number/name: ${trainNoOrName}`);
    await this.page.enterTrainNoOrName(trainNoOrName);
  }

  async getTrainChooserResults(): Promise<string[]> {
    const isDisplayed = await this.page.isSearchByTrainNoPageDisplayed();
    if (!isDisplayed) throw new Error("SearchByTrainNoTrainName page not displayed");
    return this.page.getAllTrainNumbersInChooser();
  }

  // ── TC04: Search by Station ───────────────────────────────────────────────

  async searchByStation(stationName: string, acronym: string): Promise<void> {
    logger.info(`Searching by station: ${stationName}`);
    await this.page.enterStationForDeparture(stationName);
    await this.page.selectStationSuggestion(acronym);
  }

  async getStationSearchResults(): Promise<string[]> {
    const isDisplayed = await this.page.isSearchResultsPageDisplayed();
    if (!isDisplayed) throw new Error("SearchResultsForTrains page not displayed");
    return this.page.getResultTrainNumbers();
  }

  // ── TC05: Select train and verify status view ─────────────────────────────

  async selectFirstTrainFromResults(): Promise<string> {
    const trainNumbers = await this.page.getResultTrainNumbers();
    if (trainNumbers.length === 0) throw new Error("No trains in results to select");
    const selectedTrainNumber = trainNumbers[0];
    logger.info(`Selecting train number: ${selectedTrainNumber}`);
    await this.page.clickFirstTrainInResults();
    return selectedTrainNumber;
  }

  async getTrainStatusHeading(): Promise<string> {
    const isDisplayed = await this.page.isTrainStatusViewDisplayed();
    if (!isDisplayed) throw new Error("TrainStatusView toolbar heading not displayed");
    return this.page.getTrainStatusHeadingText();
  }

  // ── TC06: Search history ──────────────────────────────────────────────────

  async selectFirstTrainInChooserAndGoBack(): Promise<void> {
    await this.page.clickFirstTrainInChooser();
    logger.info("Navigating back to Home screen");
    await this.page.navigateBack();
    await this.driver.pause(1000);
    await this.page.navigateBack();
  }

  async getSearchHistoryEntries(): Promise<string[]> {
    const isDisplayed = await this.page.isSearchHistoryDisplayed();
    if (!isDisplayed) throw new Error("SEARCH HISTORY section not visible on Home screen");
    return this.page.getSearchHistoryTrainNumbers();
  }
}
