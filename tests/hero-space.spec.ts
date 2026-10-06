import { expect, test } from "@playwright/test";

for (const width of [320, 390, 1024, 1440, 1920]) {
  for (const theme of ["dark", "light"]) {
    test(`hero gives Mickey his own space at ${width}px / ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1080 });
      await page.addInitScript((value) => localStorage.setItem("andrian-dev-theme", value), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "networkidle" });
      await expect(page.locator('.sticker-backdrop-hero')).toHaveAttribute("data-state", "ready");
      const geometry = await page.evaluate(() => {
        const bounds = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
        const mascot = bounds(".sticker-backdrop-hero");
        const heading = bounds(".hero h1");
        const label = bounds(".hero-label");
        const preview = bounds(".hero-visual-wrap");
        const container = bounds(".hero-layout");
        const overlaps = (a: DOMRect, b: DOMRect) => Math.min(a.right,b.right)>Math.max(a.left,b.left) && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top);
        return { overlap: [heading,label,preview].some((other) => overlaps(mascot,other)),
          mascotWidth: mascot.width, width: container.width, left: mascot.left, right: mascot.right,
          overflow: document.documentElement.scrollWidth-document.documentElement.clientWidth,
          toHeading: heading.top-mascot.bottom, toPreview: preview.left-mascot.right };
      });
      expect(geometry.overlap).toBe(false);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width);
      if (width >= 1400) {
        expect(geometry.mascotWidth).toBe(160);
        expect(geometry.width).toBeGreaterThan(1240);
        expect(geometry.toHeading).toBeGreaterThanOrEqual(30);
        expect(geometry.toPreview).toBeGreaterThan(200);
      }
      if (width === 1920 || width === 390) {
        await page.screenshot({ path: `output/playwright/hero-space-${width}-${theme}.png` });
      }
    });
  }
}
