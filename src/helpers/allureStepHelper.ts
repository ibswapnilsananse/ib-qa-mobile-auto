import { Status } from "allure-js-commons";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { allure } = require("allure-mocha/runtime") as {
  allure: {
    step: <T>(name: string, body: (step: { name: (n: string) => void }) => T) => T;
    logStep: (name: string, status?: Status) => void;
    currentTest: unknown;
  };
};

function isAllureActive(): boolean {
  try {
    return typeof allure?.currentTest !== "undefined" && allure.currentTest !== null;
  } catch {
    return false;
  }
}

/**
 * Wraps an async action as an Allure step.
 * If Allure is not active, the action runs normally without step decoration.
 */
export async function allureStep<T>(name: string, action: () => Promise<T>): Promise<T> {
  if (!isAllureActive()) {
    return action();
  }
  return allure.step(name, async () => {
    return action();
  });
}

/**
 * Logs a simple step (no body) in the Allure report.
 */
export function allureLogStep(name: string, status: Status = Status.PASSED): void {
  if (!isAllureActive()) return;
  try {
    allure.logStep(name, status);
  } catch {
    /* skip */
  }
}
