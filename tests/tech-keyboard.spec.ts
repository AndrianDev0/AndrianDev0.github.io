import { expect, test } from "@playwright/test";

for (const width of [320, 390, 1440]) for (const theme of ["dark", "light"]) {
  test(`Mickey keyboard fits and responds ${width} ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.addInitScript(value => localStorage.setItem("andrian-dev-theme", value), theme);
    await page.goto("/", { waitUntil: "networkidle" });
    const studio = page.locator(".typing-studio");
    await studio.scrollIntoViewIfNeeded();
    await expect(studio.locator('.sticker-backdrop')).toHaveAttribute("data-state", "ready");
    await expect(studio.locator(".typing-scene")).toHaveAttribute("data-running", "true");
    await studio.getByRole("button", { name: "Остановить анимацию клавиатуры" }).click();
    await expect(studio.locator(".typing-scene")).toHaveAttribute("data-running", "false");
    for (const key of await studio.locator(".typing-key").all()) {
      await key.click();
      await expect(key).toHaveAttribute("aria-pressed", "true");
    }
    await studio.locator(".typing-key").nth(4).click();
    await expect(studio.locator(".typing-caption strong")).toHaveText("React");
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await studio.screenshot({ path: `output/playwright/typing-keyboard-${width}-${theme}.png` });
    await studio.getByRole("button", { name: "Продолжить анимацию клавиатуры" }).click();
    await expect(studio.locator(".typing-scene")).toHaveAttribute("data-pressed", "true");
    await expect(studio.locator(".typing-key.is-down")).toHaveCount(1);
    await page.locator(".hero").scrollIntoViewIfNeeded();
    await expect(studio.locator(".typing-scene")).toHaveAttribute("data-running", "false");
    await studio.scrollIntoViewIfNeeded();
    await expect(studio.locator(".typing-scene")).toHaveAttribute("data-running", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(studio.locator(".typing-scene")).toHaveAttribute("data-running", "false");
    await expect(studio.locator(".typing-key.is-down")).toHaveCount(0);
    await expect(studio.locator(".typing-toolbar button")).toBeDisabled();
    const htmlKey = studio.getByRole("button", { name: "HTML", exact: true });
    await htmlKey.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(htmlKey).toHaveCSS("outline-style", "solid");
    await htmlKey.press("Enter");
    await expect(studio.locator(".typing-caption strong")).toHaveText("HTML");
  });
}
