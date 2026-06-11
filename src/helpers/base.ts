import { Browser, Element } from "webdriverio";
import logger from "./loggerUtils";

export type Locator = [strategy: string, value: string];

export class Base {
  protected driver: Browser;

  constructor(driver: Browser) {
    this.driver = driver;
  }

  private getElementName(locator: Locator, elementName?: string): string {
    if (elementName) return elementName;

    const [strategy, value] = locator;
    if (strategy === "xpath") {
      const textMatch = value.match(/@text=["']([^"']+)["']/);
      if (textMatch) return `Element - ${textMatch[1]}`;

      const containsMatch = value.match(
        /contains\(text\(\),\s*["']([^"']+)["']/
      );
      if (containsMatch) return `Element - ${containsMatch[1]}`;

      const idMatch = value.match(/@resource-id=["']([^"']+)["']/);
      if (idMatch) return `Element - ${idMatch[1]}`;
    }
    return `Element - ${value}`;
  }

  private buildSelector(locator: Locator): string {
    const [strategy, value] = locator;
    switch (strategy) {
      case "xpath":
        return value;
      case "id":
        return `android=new UiSelector().resourceId("${value}")`;
      case "accessibility id":
        return `~${value}`;
      case "android":
        return `android=${value}`;
      default:
        return value;
    }
  }

  async element(locator: Locator, timeout = 30000): Promise<Element> {
    const selector = this.buildSelector(locator);
    try {
      const el = await this.driver.$(selector);
      await el.waitForExist({ timeout });
      logger.info(`Found element: [${locator[0]}, ${locator[1]}]`);
      return el;
    } catch (e) {
      logger.error(
        `Element not found: [${locator[0]}, ${locator[1]}], Error: ${e}`
      );
      throw e;
    }
  }

  async elements(locator: Locator, timeout = 10000): Promise<Element[]> {
    const selector = this.buildSelector(locator);
    try {
      await this.driver
        .$(selector)
        .waitForExist({ timeout })
        .catch(() => {
          /* may not exist */
        });
      const elems = await this.driver.$$(selector);
      const result: Element[] = [];
      for (const el of elems) {
        result.push(el);
      }
      logger.debug(`Found ${result.length} elements: [${locator[0]}, ${locator[1]}]`);
      return result;
    } catch {
      logger.error(`No elements found: [${locator[0]}, ${locator[1]}]`);
      return [];
    }
  }

  async sendText(
    locator: Locator,
    text: string,
    timeout = 10000,
    elementName?: string
  ): Promise<boolean> {
    const name = this.getElementName(locator, elementName);
    try {
      logger.info(`Preparing to send text '${text}' to element [${name}]`);
      const el = await this.element(locator, timeout);
      logger.info(`Clearing existing text in element [${name}]`);
      await el.clearValue();
      logger.info(`Sending text '${text}' to element [${name}]`);
      await el.setValue(text);
      logger.info(`Successfully sent text to element [${name}]`);
      return true;
    } catch (e) {
      logger.error(`Failed to send text to element [${name}]: ${e}`);
      throw e;
    }
  }

  async clickOn(
    locator: Locator,
    timeout = 10000,
    elementName?: string
  ): Promise<boolean> {
    const name = this.getElementName(locator, elementName);
    try {
      logger.info(`Attempting to click on element [${name}]`);
      const el = await this.element(locator, timeout);
      await el.click();
      logger.info(`Successfully clicked on element [${name}]`);
      return true;
    } catch (e) {
      logger.error(`Failed to click on element [${name}]: ${e}`);
      throw e;
    }
  }

  async waitUntilDisplayed(
    locator: Locator,
    timeout = 10000,
    elementName?: string
  ): Promise<boolean> {
    const name = this.getElementName(locator, elementName);
    try {
      logger.info(
        `Waiting for element [${name}] to be displayed (timeout: ${timeout}ms)`
      );
      const el = await this.element(locator, timeout);
      await el.waitForDisplayed({ timeout });
      logger.info(`Element [${name}] is now displayed`);
      return true;
    } catch (e) {
      logger.error(
        `Error waiting for element [${name}] to be displayed: ${e}`
      );
      throw e;
    }
  }

  async isDisplayed(
    locator: Locator,
    timeout = 10000,
    elementName?: string
  ): Promise<boolean> {
    const name = this.getElementName(locator, elementName);
    try {
      logger.info(`Checking if element [${name}] is displayed`);
      const el = await this.element(locator, timeout);
      const visible = await el.isDisplayed();
      logger.info(`Element [${name}] displayed: ${visible}`);
      return visible;
    } catch {
      logger.error(`Error checking if element [${name}] is displayed`);
      return false;
    }
  }

  async isPresent(
    locator: Locator,
    timeout = 10000,
    elementName?: string
  ): Promise<boolean> {
    const name = this.getElementName(locator, elementName);
    try {
      logger.info(`Checking if element [${name}] is present`);
      const el = await this.element(locator, timeout);
      const exists = await el.isExisting();
      logger.info(`Element [${name}] presence: ${exists}`);
      return exists;
    } catch {
      logger.error(`Failed to check presence of element [${name}]`);
      return false;
    }
  }

  async isEnabled(
    locator: Locator,
    timeout = 10000,
    elementName?: string
  ): Promise<boolean> {
    const name = this.getElementName(locator, elementName);
    try {
      logger.info(`Checking if element [${name}] is enabled`);
      const el = await this.element(locator, timeout);
      const enabled = await el.isEnabled();
      logger.info(`Element [${name}] enabled: ${enabled}`);
      return enabled;
    } catch {
      logger.error(`Failed to check enabled status of element [${name}]`);
      return false;
    }
  }

  async getText(locator: Locator, timeout = 10000): Promise<string> {
    try {
      const el = await this.element(locator, timeout);
      const text = await el.getText();
      logger.info(`Got text from element: '${text}'`);
      return text;
    } catch (e) {
      logger.error(`Failed to get text: ${e}`);
      throw e;
    }
  }

  async waitUntilElementDisappears(
    strategy: string,
    value: string,
    disappearTimeout = 25000
  ): Promise<void> {
    const locator: Locator = [strategy === "text" ? "xpath" : strategy,
      strategy === "text"
        ? `//android.widget.TextView[@text="${value}"]`
        : value];
    const selector = this.buildSelector(locator);
    try {
      const el = await this.driver.$(selector);
      await el.waitForDisplayed({ timeout: disappearTimeout, reverse: true });
      logger.info(`Element with ${strategy}='${value}' has disappeared`);
    } catch {
      logger.warn(
        `Element with ${strategy}='${value}' did not disappear within ${disappearTimeout}ms`
      );
    }
  }

  async scrollUntilElementFound(
    locValue: string,
    locatorType = "text",
    index?: number,
    maxScrolls = 5
  ): Promise<Element | null> {
    const locatorMapping: Record<string, string> = {
      id: `new UiSelector().resourceId("${locValue}")`,
      "resource-id": `new UiSelector().resourceId("${locValue}")`,
      class: `new UiSelector().className("${locValue}")`,
      text: `new UiSelector().text("${locValue}")`,
      "content-desc": `new UiSelector().descriptionMatches("${locValue}")`,
      "text-contains": `new UiSelector().textContains("${locValue}")`,
    };

    if (!locatorMapping[locatorType]) {
      throw new Error(`Invalid locatorType '${locatorType}'`);
    }

    let expression = locatorMapping[locatorType];
    if (index !== undefined) {
      expression += `.instance(${index - 1})`;
    }

    for (let attempt = 0; attempt < maxScrolls; attempt++) {
      try {
        const el = await this.driver.$(
          `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${expression})`
        );
        logger.info(
          `Element found after ${attempt + 1} attempts: ${locatorType}=${locValue}`
        );
        return el;
      } catch {
        logger.debug(
          `Element not found, scrolling further (attempt ${attempt + 1})`
        );
        try {
          await this.driver.$(
            `android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()`
          );
        } catch {
          // ignore scroll error
        }
        await this.driver.pause(1000);
      }
    }
    logger.warn(
      `Element not found after ${maxScrolls} scroll attempts: ${locatorType}=${locValue}`
    );
    return null;
  }

  async touchAndMove(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): Promise<void> {
    await this.driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: Math.round(startX), y: Math.round(startY) },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 100 },
          { type: "pointerMove", duration: 300, x: Math.round(endX), y: Math.round(endY) },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
    await this.driver.releaseActions();
  }

  async flingToTop(): Promise<void> {
    try {
      await this.driver.$(
        `android=new UiScrollable(new UiSelector().scrollable(true)).flingToBeginning(10)`
      );
      logger.info("Flung to top of scrollable content");
    } catch {
      logger.warn("Failed to fling to top");
    }
  }
}
