import { expect, test } from "@playwright/test";

for (const width of [320, 390, 844, 1440]) {
  for (const theme of ["dark", "light"]) {
    test(`project details stay in sync at ${width}px / ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((value) => localStorage.setItem("andrian-dev-theme", value), theme);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/", { waitUntil: "networkidle" });
      const carousel = page.locator(".hero-project-carousel");
      const detail = carousel.locator(".hero-project-detail.is-active");
      const height = (await carousel.boundingBox())!.height;
      const projects = [
        ["nebo", "NEBO BISTRO", "Колесо призов", "nebo-bistro"],
        ["drop", "DROP / AIR FORCE 1", "три расцветки", "drop-3d-store"],
        ["tehnotek", "ТЕХНОТЭК", "Прототип B2B-страницы", "tehnotek-prototype"],
        ["simka", "SIMKA STORE", "оплату подтверждает менеджер", "simka-store"],
      ];
      for (const [id, name, text, slug] of projects) {
        await carousel.getByRole("button", { name: `Показать ${name}`, exact: true }).click();
        await expect(detail).toHaveAttribute("data-project", id);
        await expect(detail).toContainText(text);
        await expect(detail).toHaveCSS("opacity", "1");
        await expect(detail.locator('.project-svg-icon[aria-hidden="true"]')).toHaveCount(5);
        await expect(detail.locator(".hero-project-stack li")).toHaveCount(3);
        await expect(carousel.locator('.hero-project-detail[aria-hidden="false"]')).toHaveCount(1);
        expect(Math.abs((await carousel.boundingBox())!.height - height)).toBeLessThan(1);
        const boxes = await carousel.evaluate((element) => {
          const frame = element.querySelector(".hero-project-slide.is-active")!.getBoundingClientRect();
          const controls = element.querySelector(".hero-project-controls")!.getBoundingClientRect();
          const details = element.querySelector(".hero-project-details")!.getBoundingClientRect();
          return { firstGap: controls.top - frame.bottom, secondGap: details.top - controls.bottom,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        expect(boxes.firstGap).toBeGreaterThanOrEqual(0);
        expect(boxes.secondGap).toBeGreaterThanOrEqual(0);
        expect(boxes.overflow).toBeLessThanOrEqual(1);
        await expect(carousel.locator(".hero-project-slide.is-active a")).toHaveAttribute("href", `/projects/${slug}`);
      }
      await carousel.getByRole("button", { name: "Следующий проект" }).click();
      await expect(detail).toHaveAttribute("data-project", "nebo");
      await carousel.getByRole("button", { name: "Предыдущий проект" }).click();
      await expect(detail).toHaveAttribute("data-project", "simka");
      await carousel.press("ArrowLeft");
      await expect(detail).toHaveAttribute("data-project", "tehnotek");
      await detail.scrollIntoViewIfNeeded();
      await expect(page.locator(".hero-visual-wrap")).toHaveCSS("opacity", "1");
      if (width === 1440 || width === 390) {
        await carousel.screenshot({ path: `output/playwright/carousel-details-${width}-${theme}.png` });
        await page.locator(".hero-project-details").screenshot({ path: `output/playwright/stack-keys-${width}-${theme}.png` });
      }
      expect(errors).toEqual([]);
    });
  }
}

test("English details, reduced motion and case navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en", { waitUntil: "networkidle" });
  const carousel = page.getByRole("region", { name: "Selected projects" });
  for (const [name, slug] of [["NEBO BISTRO", "nebo-bistro"], ["DROP / AIR FORCE 1", "drop-3d-store"], ["ТЕХНОТЭК", "tehnotek-prototype"], ["SIMKA STORE", "simka-store"]]) {
    await carousel.getByRole("button", { name: `Show ${name}`, exact: true }).click();
    await expect(carousel.locator(".hero-project-detail.is-active")).toContainText("The brief");
    const transition = await carousel.locator(".hero-project-detail.is-active").evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration));
    expect(transition).toBeLessThanOrEqual(0.001);
    await carousel.locator(".hero-project-slide.is-active a").click();
    await expect(page).toHaveURL(`/en/projects/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goBack({ waitUntil: "networkidle" });
  }
});

test("stack keys open their official destinations and support keyboard focus", async ({ page, context }) => {
  await context.route("https://**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Destination test</title>" }));
  await page.goto("/", { waitUntil: "networkidle" });
  const names = ["NEBO BISTRO", "DROP / AIR FORCE 1", "ТЕХНОТЭК", "SIMKA STORE"];
  const visited = new Set<string>();
  for (const name of names) {
    await page.getByRole("button", { name: `Показать ${name}`, exact: true }).click();
    const keys = page.locator(".hero-project-detail.is-active .stack-key");
    for (const key of await keys.all()) {
      const href = (await key.getAttribute("href"))!;
      expect(href).toMatch(/^https:\/\//);
      const size = (await key.boundingBox())!;
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
      await key.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(key).toBeFocused();
      await expect(key).toHaveCSS("outline-style", "solid");
      const popupPromise = page.waitForEvent("popup");
      await key.press("Enter");
      const popup = await popupPromise;
      await popup.waitForURL(href);
      visited.add(href);
      await popup.close();
    }
    await expect(page.locator('.hero-project-detail[aria-hidden="true"] .stack-key').first()).toHaveAttribute("tabindex", "-1");
  }
  expect(visited.size).toBe(10);
});

test("project and stack SVGs are local, valid assets with a readable text fallback", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const paths = await page.locator(".hero-project-details .project-svg-icon").evaluateAll((icons) =>
    [...new Set(icons.map((icon) => getComputedStyle(icon).maskImage.match(/url\(["']?(.*?)["']?\)/)![1]))],
  );
  expect(paths).toHaveLength(14);
  for (const path of paths) {
    expect(new URL(path).origin).toBe("http://127.0.0.1:4173");
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const svg = await response.text();
    expect(svg).toContain("<svg");
    expect(svg).not.toMatch(/<script|<foreignObject|\sonload=/i);
  }
  await page.route("**/icons/**/*.svg", (route) => route.abort());
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".hero-project-detail.is-active")).toContainText("Задача проекта");
  await expect(page.locator(".hero-project-detail.is-active .hero-project-stack")).toContainText("React");
});

test("dragging the preview changes the description without opening the case", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const preview = page.locator(".hero-project-viewport");
  await preview.scrollIntoViewIfNeeded();
  const box = (await preview.boundingBox())!;
  await page.mouse.move(box.x + box.width - 25, box.y + 90);
  await page.mouse.down();
  await page.mouse.move(box.x + 25, box.y + 95, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(".hero-project-detail.is-active")).toHaveAttribute("data-project", "drop");
  await expect(page).toHaveURL("/");
});
