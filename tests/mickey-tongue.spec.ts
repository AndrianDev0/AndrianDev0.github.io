import { expect, test } from "@playwright/test";

test("hero plays the tongue animation, rests, replays and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem("andrian-dev-theme", "dark"));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.locator(".sticker-backdrop-hero");
  await expect(hero).toHaveAttribute("data-emoji", "tongue");
  await expect(hero).toHaveAttribute("data-state", "ready");
  await expect(hero).toHaveAttribute("data-active", "true");
  const first = await hero.locator("svg").innerHTML();
  await page.waitForTimeout(200);
  expect(await hero.locator("svg").innerHTML()).not.toBe(first);
  await hero.screenshot({ path: "output/playwright/mickey-tongue-closeup.png" });
  await page.screenshot({ path: "output/playwright/mickey-tongue-hero.png" });
  await expect(hero).toHaveAttribute("data-active", "false");
  await expect(hero).toHaveAttribute("data-active", "true", { timeout: 6000 });
  await page.locator(".sticker-backdrop-work").scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-active", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await hero.scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-active", "false");
  const still = await hero.locator("svg").innerHTML();
  await page.waitForTimeout(250);
  expect(await hero.locator("svg").innerHTML()).toBe(still);
  expect(errors).toEqual([]);
});
