import { expect, test } from "@playwright/test";

test("work Mickey winks, rests and repeats only while visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem("andrian-dev-theme", "dark"));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  const work = page.locator(".sticker-backdrop-work");
  await work.scrollIntoViewIfNeeded();
  await expect(work).toHaveAttribute("data-emoji", "wink");
  await expect(work).toHaveAttribute("data-active", "true");
  const first = await work.locator("svg").innerHTML();
  await page.waitForTimeout(500);
  expect(await work.locator("svg").innerHTML()).not.toBe(first);
  await page.screenshot({ path: "output/playwright/mickey-wink-work.png" });
  await work.screenshot({ path: "output/playwright/mickey-wink-closeup.png" });
  await expect(work).toHaveAttribute("data-active", "false");
  await expect(work).toHaveAttribute("data-active", "true", { timeout: 6000 });
  await page.locator(".sticker-backdrop-hero").scrollIntoViewIfNeeded();
  await expect(work).toHaveAttribute("data-active", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await work.scrollIntoViewIfNeeded();
  await expect(work).toHaveAttribute("data-active", "false");
  const still = await work.locator("svg").innerHTML();
  await page.waitForTimeout(250);
  expect(await work.locator("svg").innerHTML()).toBe(still);
  expect(errors).toEqual([]);
});
