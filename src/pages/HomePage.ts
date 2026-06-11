import { Browser } from "webdriverio";
import { Locator } from "../helpers/base";
import { MobileCommonPage } from "./MobileCommonPage";
import logger from "../helpers/loggerUtils";

function getTabLocator(tabText: string): Locator {
  return [
    "xpath",
    `//android.widget.TextView[@text="${tabText}" and @resource-id="com.hopper.mountainview.play:id/text"]/preceding-sibling::android.widget.FrameLayout`,
  ];
}

export class HomePage extends MobileCommonPage {
  // Locators
  static readonly LOC_PROFILE: Locator = [
    "id",
    "com.hopper.mountainview.play:id/headerSettingsIcon",
  ];
  static readonly LOC_HELP_CENTER_LINK: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Help Center"]',
  ];
  static readonly CURRENCY_DROP_DOWN: Locator = [
    "xpath",
    '//android.widget.TextView[@text="Currency"]/following-sibling::android.view.View/android.view.View[@content-desc="Open"]',
  ];
  static readonly LOC_WALLET_CURRENCY: Locator = [
    "xpath",
    '//android.view.View[@content-desc="Wallet"]/following-sibling::android.widget.TextView',
  ];
  static readonly LOC_WALLET_LINK: Locator = [
    "xpath",
    '//android.widget.ImageView[@resource-id="com.hopper.mountainview.play:id/headerSettingsIcon"]/following-sibling::androidx.compose.ui.platform.ComposeView',
  ];
  static readonly LOC_WALLET_PAGE_HISTORY: Locator = [
    "xpath",
    '//android.widget.TextView[normalize-space(@text) = "Hopper Wallet"] | //android.widget.TextView[contains(@text, "Hopper Wallet")]',
  ];

  static readonly LOC_FLIGHTS_TAB: Locator = getTabLocator("Flights");
  static readonly LOC_HOTELS_TAB: Locator = getTabLocator("Hotels");
  static readonly LOC_DEALS_TAB: Locator = [
    "id",
    "com.hopper.mountainview.play:id/dealsTab",
  ];
  static readonly LOC_PROFILE_TAB: Locator = [
    "id",
    "com.hopper.mountainview.play:id/profileTab",
  ];
  static readonly LOC_WATCHES_TAB: Locator = getTabLocator("Watches");
  static readonly LOC_TREES_TAB: Locator = getTabLocator("Trees");

  constructor(driver: Browser) {
    super(driver);
    logger.info("HomePage initialized");
  }

  async navigateToMenu(menuName: string): Promise<void> {
    logger.info(`Navigating to ${menuName} menu`);
    const menuMap: Record<string, () => Promise<void>> = {
      Flights: () => this.navigateToFlights(),
      Hotels: () => this.navigateToHotels(),
      Deals: () => this.navigateToDeals(),
      Profile: () => this.navigateToProfile(),
      Watches: () => this.navigateToWatches(),
      Trees: () => this.navigateToTrees(),
    };
    const handler = menuMap[menuName];
    if (!handler) throw new Error(`Menu ${menuName} not found`);
    await handler();
    logger.info(`Successfully navigated to ${menuName} menu`);
  }

  async navigateToFlights(): Promise<void> {
    logger.info("Navigating to flights tab");
    await this.base.clickOn(HomePage.LOC_FLIGHTS_TAB, undefined, "Flights Tab");
    logger.info("Successfully navigated to flights tab");
  }

  async navigateToHotels(): Promise<void> {
    logger.info("Navigating to hotels tab");
    await this.base.clickOn(HomePage.LOC_HOTELS_TAB, undefined, "Hotels Tab");
    logger.info("Successfully navigated to hotels tab");
  }

  async navigateToDeals(): Promise<void> {
    logger.info("Navigating to deals tab");
    await this.base.clickOn(HomePage.LOC_DEALS_TAB, undefined, "Deals Tab");
    logger.info("Successfully navigated to deals tab");
  }

  async navigateToProfile(): Promise<void> {
    logger.info("Navigating to profile tab");
    await this.base.clickOn(
      HomePage.LOC_PROFILE_TAB,
      undefined,
      "Profile Tab"
    );
    logger.info("Successfully navigated to profile tab");
  }

  async navigateToWatches(): Promise<void> {
    logger.info("Navigating to watches tab");
    await this.base.clickOn(
      HomePage.LOC_WATCHES_TAB,
      undefined,
      "Watches Tab"
    );
    logger.info("Successfully navigated to watches tab");
  }

  async navigateToTrees(): Promise<void> {
    logger.info("Navigating to trees tab");
    await this.base.clickOn(HomePage.LOC_TREES_TAB, undefined, "Trees Tab");
    logger.info("Successfully navigated to trees tab");
  }

  async skipAds(): Promise<void> {
    logger.info("Attempting to skip initial ads");
    try {
      // await this.base.waitUntilDisplayed(
      //   ["xpath", '//android.widget.TextView[@text="Start saving money"]'],
      //   10000
      // );
      // await this.base.clickOn([
      //   "xpath",
      //   '//android.widget.TextView[@text="Start saving money"]',
      // ]);

      // await this.base.waitUntilDisplayed(
      //   ["xpath", '//android.widget.TextView[@text="Not now"]'],
      //   10000
      // );
      // await this.base.clickOn([
      //   "xpath",
      //   '//android.widget.TextView[@text="Not now"]',
      // ]);
      logger.info("Initial ads skipped successfully");
      try {
        await this.base.waitUntilDisplayed(
          ["xpath", '//android.widget.TextView[@text="Not now"]'],
          5000
        );
        await this.base.clickOn([
          "xpath",
          '//android.widget.TextView[@text="Not now"]',
        ]);
        logger.info("Additional ad skipped successfully");
      } catch {
        logger.info("No additional ad to skip");
      }
    } catch (e) {
      logger.warn(`Could not skip ads: ${e}`);
    }
  }

  async navigateToProfileSettings(): Promise<void> {
    logger.info("Navigating to profile settings");
    await this.base.clickOn(HomePage.LOC_PROFILE);
    await this.base.waitUntilDisplayed(HomePage.LOC_HELP_CENTER_LINK);
    const displayed = await this.base.isDisplayed(
      HomePage.LOC_HELP_CENTER_LINK
    );
    if (!displayed)
      throw new Error("Help Center link not displayed in profile settings");
    logger.info("Successfully navigated to profile settings");
  }

  async selectAndVerifyWalletCurrency(currencyList: string[]): Promise<void> {
    const failedCurrencies: Array<{ currency: string; error: string }> = [];

    for (const currency of currencyList) {
      try {
        logger.info(`Processing currency: ${currency}`);
        await this.base.clickOn(
          HomePage.CURRENCY_DROP_DOWN,
          undefined,
          "Currency Dropdown"
        );
        await this.base.scrollUntilElementFound(currency);

        const currencyElement: Locator = [
          "xpath",
          `//android.widget.TextView[@text="${currency}"]`,
        ];
        const currencyCode: Locator = [
          "xpath",
          `//android.widget.TextView[@text="${currency}"]/following-sibling::android.widget.TextView`,
        ];

        let currencyCodeText = await this.base.getText(currencyCode);
        const match = currencyCodeText.match(/\(([^)]+)\)/);
        if (match) {
          currencyCodeText = currencyCodeText.substring(0, 1);
        } else {
          currencyCodeText = currencyCodeText.trim();
        }

        await this.base.clickOn(
          currencyElement,
          undefined,
          `Currency Option - ${currency}`
        );
        logger.info(
          `Selected currency: ${currency} with code: ${currencyCodeText}`
        );

        await this.verifyWalletCurrency(currency, currencyCodeText);
        logger.info(`Successfully verified currency: ${currency}`);
      } catch (e) {
        const errorMsg = `Failed to process currency ${currency}: ${e}`;
        logger.error(errorMsg);
        failedCurrencies.push({ currency, error: String(e) });
      }
    }

    if (failedCurrencies.length > 0) {
      let errorMsg = "Failed to process the following currencies:\n";
      for (const { currency, error } of failedCurrencies) {
        errorMsg += `- ${currency}: ${error}\n`;
      }
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async verifyWalletCurrency(
    currency: string,
    currencyCode: string
  ): Promise<boolean> {
    try {
      await this.driver.pause(1000);
      const displayedCurrency = await this.base.getText(
        HomePage.LOC_WALLET_CURRENCY
      );

      if (displayedCurrency.includes(currencyCode)) {
        logger.info(
          `Wallet currency is correctly displayed as: ${currencyCode} for currency ${currency}`
        );
        return true;
      }
      const errorMsg = `Wallet currency mismatch. Expected: ${currencyCode}, Found: ${displayedCurrency}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    } catch (e) {
      const errorMsg = `Failed to verify wallet currency for ${currency}: ${e}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async verifyTextOnTreesPage(textList: string[]): Promise<void> {
    for (const text of textList) {
      const locator: Locator = [
        "xpath",
        `//android.widget.TextView[contains(@text, '${text}')]`,
      ];
      try {
        await this.base.waitUntilDisplayed(locator, 5000);
        logger.info(`Text '${text}' found on page`);
      } catch {
        await this.base.scrollUntilElementFound(text);
      }
      try {
        await this.base.waitUntilDisplayed(locator, 5000);
      } catch (e) {
        const errorMsg = `Failed to verify text '${text}' is displayed: ${e}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  }

  async navigateWallet(textList: string[]): Promise<void> {
    logger.info("Navigating to wallet section");
    await this.base.clickOn(HomePage.LOC_WALLET_LINK);
    await this.driver.pause(3000);

    const walletDisplayed = await this.base.waitUntilDisplayed(
      HomePage.LOC_WALLET_PAGE_HISTORY,
      10000
    );
    if (!walletDisplayed)
      throw new Error(
        "Failed to navigate to wallet page - wallet history not displayed"
      );

    const viewHistoryLocator: Locator = [
      "xpath",
      "//android.widget.TextView[contains(@text, 'View your history')]",
    ];
    await this.base.waitUntilDisplayed(viewHistoryLocator, 10000);
    await this.base.clickOn(
      viewHistoryLocator,
      undefined,
      "View History Button"
    );

    for (const text of textList) {
      try {
        const textLocator: Locator = [
          "xpath",
          `//android.widget.TextView[contains(@text, '${text}')]`,
        ];
        const found = await this.base
          .waitUntilDisplayed(textLocator, 10000)
          .catch(() => false);
        if (!found) {
          await this.base.scrollUntilElementFound(text);
          const foundAfterScroll = await this.base
            .waitUntilDisplayed(textLocator, 10000)
            .catch(() => false);
          if (!foundAfterScroll) {
            throw new Error(
              `Text '${text}' not found even after scrolling`
            );
          }
        }
        logger.info(`Successfully verified text: ${text}`);
      } catch (e) {
        const errorMsg = `Failed to verify text '${text}' in wallet section: ${e}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
    logger.info("Successfully navigated through wallet section");
  }
}
