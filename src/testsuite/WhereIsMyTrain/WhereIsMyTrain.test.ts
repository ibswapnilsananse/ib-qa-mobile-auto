import { expect } from "chai";
import { Browser } from "webdriverio";
import { createDriver, stopAppiumServer } from "../../helpers/appiumDriver";
import { WhereIsMyTrainHelper } from "../../helpers/WhereIsMyTrainHelper";
import { whereIsMyTrainTestData } from "../../../TestData/WhereIsMyTrainTestData";

describe("Where Is My Train - Test Suite", function () {
  this.timeout(300000);

  let driver: Browser;
  let trainHelper: WhereIsMyTrainHelper;

  after(async () => {
    await stopAppiumServer();
  });

  beforeEach(async function () {
    driver = await createDriver(true);
    trainHelper = new WhereIsMyTrainHelper(driver);
    await trainHelper.verifyHomePageDisplayed();
  });

  it("TC01: Verify Home Page is displayed [MYY-2]", async function () {
    const elements = await trainHelper.verifyHomePageElements();
    expect(elements.home).to.be.true;
    expect(elements.from).to.be.true;
    expect(elements.to).to.be.true;
    expect(elements.findTrains).to.be.true;
  });

  it("TC02: Search trains From New Delhi To Mumbai CSMT and verify results [MYY-3]", async function () {
    const { fromStation, toStation } = whereIsMyTrainTestData;
    await trainHelper.searchTrainsByFromTo(fromStation.name, fromStation.code, toStation.name, toStation.code);
    const { trainNumbers, sourceStations } = await trainHelper.getFromToSearchResults();
    expect(trainNumbers.length).to.be.greaterThan(0);
    expect(sourceStations.length).to.be.greaterThan(0);
  });

  it("TC03: Search train by number 22308 and verify results on SearchByTrainNoTrainName page [MYY-4]", async function () {
    const { trainSearch } = whereIsMyTrainTestData;
    await trainHelper.searchByTrainNumber(trainSearch.number);
    const trainNumbers = await trainHelper.getTrainChooserResults();
    expect(trainNumbers.length).to.be.greaterThan(0);
    expect(trainNumbers.some((n) => n.includes(trainSearch.number))).to.be.true;
  });

  it("TC04: Search trains by station New Delhi and verify results on SearchResultsForTrains page [MYY-5]", async function () {
    const { stationSearch } = whereIsMyTrainTestData;
    await trainHelper.searchByStation(stationSearch.name, stationSearch.code);
    const trainNumbers = await trainHelper.getStationSearchResults();
    expect(trainNumbers.length).to.be.greaterThan(0);
  });

  it("TC05: Select a train from SearchResultsForTrains and verify TrainStatusView page [MYY-6]", async function () {
    const { stationSearch } = whereIsMyTrainTestData;
    await trainHelper.searchByStation(stationSearch.name, stationSearch.code);
    const selectedTrainNumber = await trainHelper.selectFirstTrainFromResults();
    const headingText = await trainHelper.getTrainStatusHeading();
    expect(headingText).to.include(selectedTrainNumber);
    expect(headingText).to.include("-");
  });

  it("TC06: Verify recent search appears on the Home screen after searching by train number [MYY-7]", async function () {
    const { trainSearch } = whereIsMyTrainTestData;
    await trainHelper.searchByTrainNumber(trainSearch.number);
    await trainHelper.selectFirstTrainInChooserAndGoBack();
    const historyEntries = await trainHelper.getSearchHistoryEntries();
    expect(historyEntries.length).to.be.greaterThan(0);
    expect(historyEntries.some((n) => n.includes(trainSearch.number))).to.be.true;
  });
});
