import { Browser } from "webdriverio";
import { Base, Locator } from "../helpers/base";

export class WhereIsMyTrainPage {
  protected driver: Browser;
  protected base: Base;

  // ── Home Page ────────────────────────────────────────────────────────────
  static readonly LOC_APP_TITLE: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Where is My Train"]',
  ];

  static readonly LOC_FROM_STATION_INPUT: Locator = [
    "xpath",
    '//android.view.View[@content-desc="From Station"]//android.widget.EditText',
  ];

  static readonly LOC_TO_STATION_INPUT: Locator = [
    "xpath",
    '//android.view.View[@content-desc="To Station"]//android.widget.EditText',
  ];

  static readonly LOC_FIND_TRAINS_BTN: Locator = ["xpath", '//*[@content-desc="Find trains"]'];

  static readonly LOC_TRAIN_NO_SEARCH_INPUT: Locator = [
    "xpath",
    '//android.widget.TextView[@content-desc="Train No. / Train Name"]/ancestor::android.widget.EditText',
  ];

  static readonly LOC_STATION_DEPARTURE_INPUT: Locator = [
    "xpath",
    '//android.widget.TextView[@content-desc="Station departure board"]/ancestor::android.widget.EditText',
  ];

  static readonly LOC_STATION_TOOLBAR_INPUT: Locator = [
    "id",
    "com.whereismytrain.android:id/stationTxt",
  ];

  static readonly LOC_SEARCH_HISTORY_HEADER: Locator = [
    "xpath",
    '//android.widget.TextView[@text="SEARCH HISTORY"]',
  ];

  // ── Station Autocomplete Suggestion ──────────────────────────────────────
  static readonly LOC_AUTOCOMPLETE_LIST: Locator = [
    "xpath",
    "//android.widget.ListView | //android.support.v7.widget.RecyclerView",
  ];

  // ── SearchByTrainNoTrainName Page ─────────────────────────────────────────
  static readonly LOC_TRAIN_CHOOSER_SEARCH_INPUT: Locator = [
    "id",
    "com.whereismytrain.android:id/trainText",
  ];

  static readonly LOC_TRAIN_CHOOSER_RV: Locator = [
    "id",
    "com.whereismytrain.android:id/train_chooser_rv",
  ];

  static readonly LOC_TRAIN_NO_IN_LIST: Locator = ["id", "com.whereismytrain.android:id/train_no"];

  static readonly LOC_TRAIN_NAME_IN_LIST: Locator = [
    "id",
    "com.whereismytrain.android:id/train_name",
  ];

  static readonly LOC_TRAIN_CHOOSER_ITEM: Locator = [
    "id",
    "com.whereismytrain.android:id/train_chooser_fl",
  ];

  // ── SearchResultsForTrains Page ───────────────────────────────────────────
  static readonly LOC_STATION_TEXT_FIELD: Locator = [
    "id",
    "com.whereismytrain.android:id/stationTxt",
  ];

  static readonly LOC_RESULT_TRAIN_NUMBER: Locator = [
    "id",
    "com.whereismytrain.android:id/train_number",
  ];

  static readonly LOC_RESULT_TRAIN_NAME: Locator = [
    "id",
    "com.whereismytrain.android:id/train_name",
  ];

  static readonly LOC_SOURCE_STATION: Locator = [
    "id",
    "com.whereismytrain.android:id/source_station",
  ];

  static readonly LOC_LIVE_STATION_RV: Locator = [
    "id",
    "com.whereismytrain.android:id/live_station_rl",
  ];

  static readonly LOC_RESULT_CARD: Locator = [
    "id",
    "com.whereismytrain.android:id/live_station_detail_card",
  ];

  // ── TrainStatusView Page ──────────────────────────────────────────────────
  static readonly LOC_TRACK_TOOLBAR_HEADING: Locator = [
    "id",
    "com.whereismytrain.android:id/track_toolbar_heading_text",
  ];

  static readonly LOC_TRACK_RECYCLER_VIEW: Locator = [
    "id",
    "com.whereismytrain.android:id/trackRecyclerView",
  ];

  static readonly LOC_BACK_BUTTON: Locator = [
    "xpath",
    '//android.widget.ImageView[@content-desc="back"]',
  ];

  constructor(driver: Browser) {
    this.driver = driver;
    this.base = new Base(driver);
  }

  // ── Home Page Methods ─────────────────────────────────────────────────────

  async isHomePageDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_APP_TITLE, 20000);
  }

  async isFromStationInputDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_FROM_STATION_INPUT, 10000);
  }

  async isToStationInputDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_TO_STATION_INPUT, 10000);
  }

  async isFindTrainsButtonDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_FIND_TRAINS_BTN, 10000);
  }

  async enterFromStation(stationName: string): Promise<void> {
    await this.base.clickOn(WhereIsMyTrainPage.LOC_FROM_STATION_INPUT);
    await this.driver.pause(800);
    const el = await this.base.element(WhereIsMyTrainPage.LOC_FROM_STATION_INPUT, 10000);
    await el.clearValue();
    await el.setValue(stationName);
    await this.driver.pause(1500);
  }

  private async selectSuggestionByLocator(
    searchTerm: string,
    fieldLocator: Locator
  ): Promise<void> {
    await this.driver.pause(2000);
    const uiAutomatorLocator: Locator = [
      "android",
      `new UiSelector().textContains("${searchTerm}").clickable(true)`,
    ];
    try {
      await this.base.clickOn(uiAutomatorLocator, 10000);
    } catch {
      // Dropdown items are Compose Views not reachable by UiSelector/XPath.
      // Tap the first suggestion row by coordinate derived from the input field bounds.
      let tapX = 530;
      let tapY = 500;
      try {
        const el = await this.base.element(fieldLocator, 5000);
        const rect = await el.getLocation();
        const size = await el.getSize();
        tapX = rect.x + Math.round(size.width / 2);
        tapY = rect.y + size.height + 100;
      } catch {
        // use defaults
      }
      await this.driver.action("pointer").move({ x: tapX, y: tapY }).down().up().perform();
    }
    await this.driver.pause(1000);
  }

  async selectFromSuggestion(acronym: string): Promise<void> {
    await this.selectSuggestionByLocator(acronym, WhereIsMyTrainPage.LOC_FROM_STATION_INPUT);
  }

  async selectToSuggestion(acronym: string): Promise<void> {
    await this.selectSuggestionByLocator(acronym, WhereIsMyTrainPage.LOC_TO_STATION_INPUT);
  }

  async selectStationSuggestion(acronym: string): Promise<void> {
    await this.selectSuggestionByLocator(acronym, WhereIsMyTrainPage.LOC_STATION_TOOLBAR_INPUT);
  }

  async enterToStation(stationName: string): Promise<void> {
    await this.base.clickOn(WhereIsMyTrainPage.LOC_TO_STATION_INPUT);
    await this.driver.pause(800);
    const el = await this.base.element(WhereIsMyTrainPage.LOC_TO_STATION_INPUT, 10000);
    await el.clearValue();
    await el.setValue(stationName);
    await this.driver.pause(1500);
  }

  async clickFindTrains(): Promise<void> {
    try {
      await this.driver.hideKeyboard();
    } catch {
      // keyboard may already be hidden
    }
    await this.driver.pause(500);
    await this.base.clickOn(WhereIsMyTrainPage.LOC_FIND_TRAINS_BTN);
    await this.driver.pause(3000);
  }

  async enterTrainNoOrName(trainNoOrName: string): Promise<void> {
    await this.base.clickOn(WhereIsMyTrainPage.LOC_TRAIN_NO_SEARCH_INPUT);
    await this.driver.pause(1000);
    const el = await this.base.element(WhereIsMyTrainPage.LOC_TRAIN_CHOOSER_SEARCH_INPUT, 10000);
    await el.clearValue();
    await el.addValue(trainNoOrName);
    await this.driver.pause(1500);
  }

  async enterStationForDeparture(stationName: string): Promise<void> {
    await this.base.clickOn(WhereIsMyTrainPage.LOC_STATION_DEPARTURE_INPUT);
    await this.driver.pause(1000);
    const el = await this.base.element(WhereIsMyTrainPage.LOC_STATION_TOOLBAR_INPUT, 10000);
    await el.clearValue();
    await el.addValue(stationName);
    await this.driver.pause(1500);
  }

  async isSearchHistoryDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_SEARCH_HISTORY_HEADER, 10000);
  }

  async getSearchHistoryTrainNumbers(): Promise<string[]> {
    const locator: Locator = [
      "xpath",
      '//*[@content-desc="SEARCH HISTORY"]/following-sibling::*//android.widget.TextView[string-length(@text) >= 4 and string-length(@text) <= 6]',
    ];
    const els = await this.base.elements(locator, 10000);
    const numbers: string[] = [];
    for (const el of els) {
      numbers.push(await el.getText());
    }
    return numbers;
  }

  // ── SearchByTrainNoTrainName Page Methods ─────────────────────────────────

  async isSearchByTrainNoPageDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_TRAIN_CHOOSER_RV, 15000);
  }

  async getTrainChooserSearchText(): Promise<string> {
    return this.base.getText(WhereIsMyTrainPage.LOC_TRAIN_CHOOSER_SEARCH_INPUT);
  }

  async getFirstTrainNumberInChooser(): Promise<string> {
    const els = await this.base.elements(WhereIsMyTrainPage.LOC_TRAIN_NO_IN_LIST, 15000);
    if (els.length === 0) throw new Error("No train numbers found in chooser list");
    return els[0].getText();
  }

  async getAllTrainNumbersInChooser(): Promise<string[]> {
    const els = await this.base.elements(WhereIsMyTrainPage.LOC_TRAIN_NO_IN_LIST, 15000);
    const numbers: string[] = [];
    for (const el of els) {
      numbers.push(await el.getText());
    }
    return numbers;
  }

  async clickFirstTrainInChooser(): Promise<void> {
    const el = await this.base.element(WhereIsMyTrainPage.LOC_TRAIN_CHOOSER_ITEM, 15000);
    await el.click();
    await this.driver.pause(2000);
  }

  // ── SearchResultsForTrains Page Methods ───────────────────────────────────

  async isSearchResultsPageDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_LIVE_STATION_RV, 15000);
  }

  async getResultTrainNumbers(): Promise<string[]> {
    const els = await this.base.elements(WhereIsMyTrainPage.LOC_RESULT_TRAIN_NUMBER, 15000);
    const numbers: string[] = [];
    for (const el of els) {
      numbers.push(await el.getText());
    }
    return numbers;
  }

  async getResultSourceStations(): Promise<string[]> {
    const els = await this.base.elements(WhereIsMyTrainPage.LOC_SOURCE_STATION, 15000);
    const stations: string[] = [];
    for (const el of els) {
      stations.push(await el.getText());
    }
    return stations;
  }

  async clickFirstTrainInResults(): Promise<void> {
    const el = await this.base.element(WhereIsMyTrainPage.LOC_RESULT_CARD, 15000);
    await el.click();
    await this.driver.pause(2000);
  }

  async clickTrainByNumber(trainNumber: string): Promise<void> {
    const locator: Locator = [
      "xpath",
      `//android.widget.TextView[@resource-id="com.whereismytrain.android:id/train_number" and @text="${trainNumber}"]/ancestor::android.widget.FrameLayout[@clickable="true"]`,
    ];
    await this.base.clickOn(locator, 10000);
    await this.driver.pause(2000);
  }

  // ── TrainStatusView Page Methods ──────────────────────────────────────────

  async isTrainStatusViewDisplayed(): Promise<boolean> {
    return this.base.isDisplayed(WhereIsMyTrainPage.LOC_TRACK_TOOLBAR_HEADING, 15000);
  }

  async getTrainStatusHeadingText(): Promise<string> {
    return this.base.getText(WhereIsMyTrainPage.LOC_TRACK_TOOLBAR_HEADING);
  }

  async navigateBack(): Promise<void> {
    try {
      await this.base.clickOn(WhereIsMyTrainPage.LOC_BACK_BUTTON);
    } catch {
      await this.driver.back();
    }
    await this.driver.pause(1500);
  }
}
