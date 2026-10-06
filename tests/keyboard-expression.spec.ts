import { expect, test } from "@playwright/test";

for (const theme of ["dark", "light"]) {
  test(`keyboard facial reaction respects playback ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: theme === "dark" ? 1440 : 390, height: 1100 });
    await page.addInitScript(value => localStorage.setItem("andrian-dev-theme", value), theme);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/", { waitUntil: "networkidle" });
    const studio = page.locator(".typing-studio");
    const face = studio.locator(".sticker-backdrop-keyboard");
    await studio.scrollIntoViewIfNeeded();
    await expect(face).toHaveAttribute("data-state", "ready");
    await expect(face).toHaveAttribute("data-active", "true", { timeout: 6000 });
    const first = await face.locator("svg").innerHTML();
    await page.waitForTimeout(330);
    expect(await face.locator("svg").innerHTML()).not.toBe(first);
    await face.screenshot({ path: `output/playwright/keyboard-expression-${theme}.png` });
    await studio.getByRole("button", { name: "Остановить анимацию клавиатуры" }).click();
    await expect(face).toHaveAttribute("data-active", "false");
    const paused = await face.locator("svg").innerHTML();
    await page.waitForTimeout(350);
    expect(await face.locator("svg").innerHTML()).toBe(paused);
    await studio.getByRole("button", { name: "Продолжить анимацию клавиатуры" }).click();
    await expect(face).toHaveAttribute("data-active", "true");
    await page.waitForTimeout(300);
    expect(await face.locator("svg").innerHTML()).not.toBe(paused);
    await expect(face).toHaveAttribute("data-active", "false", { timeout: 4000 });
    await expect(face).toHaveAttribute("data-active", "true", { timeout: 6000 });
    await page.locator(".hero").scrollIntoViewIfNeeded();
    await expect(face).toHaveAttribute("data-active", "false");
    const offscreen = await face.locator("svg").innerHTML();
    await page.waitForTimeout(300);
    expect(await face.locator("svg").innerHTML()).toBe(offscreen);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await studio.scrollIntoViewIfNeeded();
    await expect(face).toHaveAttribute("data-active", "false");
    const still = await face.locator("svg").innerHTML();
    await page.waitForTimeout(300);
    expect(await face.locator("svg").innerHTML()).toBe(still);
    expect(errors).toEqual([]);
  });
}
