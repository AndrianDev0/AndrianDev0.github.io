import { expect, test } from "@playwright/test";

test("capture current English mobile portfolio", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({ path: "output/playwright/en-mobile-hero.png" });

  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(page.locator("#work .project-flagship")).toBeVisible();
  await page.screenshot({ path: "output/playwright/en-mobile-work.png" });

  await page.locator("#more-work").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "SIMKA STORE" })).toBeVisible();
  await page.screenshot({ path: "output/playwright/en-mobile-projects.png" });

  const measurements = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    smallText: [...document.querySelectorAll<HTMLElement>("main *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return element.childElementCount === 0 && element.textContent?.trim() && Number.parseFloat(style.fontSize) < 12;
      })
      .slice(0, 30)
      .map((element) => ({ text: element.textContent?.trim(), size: getComputedStyle(element).fontSize })),
    clipped: [...document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p, main a")]
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({ tag: element.tagName, text: element.textContent?.trim(), client: element.clientWidth, scroll: element.scrollWidth })),
  }));

  console.log(JSON.stringify(measurements, null, 2));
  expect(measurements.document).toBeLessThanOrEqual(measurements.viewport + 1);
  for (const selector of [".hero-subtitle", ".project-description", ".selected-work-copy>p:nth-of-type(2)"]) {
    const fontSizes = await page.locator(selector).evaluateAll((elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)));
    for (const fontSize of fontSizes) expect(fontSize).toBeGreaterThanOrEqual(14);
  }
});

test("capture SIMKA case on English mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/projects/simka-store", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.getByRole("heading", { name: "SIMKA STORE" })).toBeVisible();
  await page.screenshot({ path: "output/playwright/en-mobile-simka-case.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
