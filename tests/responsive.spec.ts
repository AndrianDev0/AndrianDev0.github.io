import { expect, test } from "@playwright/test";

const viewports = [
  { name: "narrow-mobile", width: 320, height: 700 },
  { name: "small-mobile", width: 375, height: 667 },
  { name: "mobile", width: 390, height: 844 },
  { name: "large-mobile", width: 430, height: 932 },
  { name: "mobile-landscape", width: 844, height: 390 },
  { name: "compact-desktop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
] as const;

for (const viewport of viewports) {
  test(`${viewport.name}: home stays aligned without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".service-item")).toHaveCount(4);

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      gridDisplay: getComputedStyle(document.querySelector<HTMLElement>(".services-grid")!).display,
      cards: [...document.querySelectorAll<HTMLElement>(".service-item")].map((card) => {
        const rect = card.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, width: rect.width, height: rect.height };
      }),
    }));

    expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.gridDisplay).toBe("grid");
    for (const card of layout.cards) {
      expect(card.left).toBeGreaterThanOrEqual(-1);
      expect(card.right).toBeLessThanOrEqual(layout.viewport + 1);
      expect(card.height).toBeGreaterThan(300);
    }
    if (viewport.width > 900) {
      expect(Math.abs(layout.cards[0].top - layout.cards[1].top)).toBeLessThan(1);
      expect(Math.abs(layout.cards[2].top - layout.cards[3].top)).toBeLessThan(1);
      expect(layout.cards[0].width).toBeGreaterThan(layout.cards[1].width);
    } else {
      expect(layout.cards[1].top).toBeGreaterThan(layout.cards[0].top);
    }

    await page.getByRole("button", { name: "RU" }).click();
    const heroLines = await page.locator(".hero-line").evaluateAll((elements) =>
      elements.map((element) => ({
        visibleWidth: element.clientWidth,
        contentWidth: element.scrollWidth,
      })),
    );
    for (const line of heroLines) {
      expect(line.contentWidth).toBeLessThanOrEqual(line.visibleWidth + 1);
    }
  });
}

test("Telegram emoji stay decorative and respect reduced motion", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator(".sticker-backdrop")).toHaveCount(4);
  await expect(page.locator(".floating-sticker")).toHaveCount(4);
  await expect(page.locator(".sticker-backdrop button")).toHaveCount(0);

  const sticker = page.locator(".sticker-backdrop-hero");
  await expect(sticker).toHaveAttribute("data-state", "ready");
  await expect(sticker.locator("svg")).toBeVisible();
  const workEmoji = page.locator(".sticker-backdrop-work");
  await workEmoji.scrollIntoViewIfNeeded();
  await expect(workEmoji).toHaveAttribute("data-active", "true");
  await expect(sticker).toHaveAttribute("data-active", "false");
  await expect(workEmoji.locator("svg")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(workEmoji).toHaveAttribute("data-active", "false");
  const stillFrame = await workEmoji.locator("svg").innerHTML();
  await page.waitForTimeout(150);
  expect(await workEmoji.locator("svg").innerHTML()).toBe(stillFrame);
  await page.setViewportSize({ width: 320, height: 700 });
  for (const scene of ["hero", "work", "contact"]) {
    const artwork = page.locator(`.sticker-backdrop-${scene} .floating-sticker`);
    await artwork.scrollIntoViewIfNeeded();
    await expect(artwork.locator("svg")).toBeVisible();
    const placement = await artwork.evaluate((element) => {
      const section = element.closest("section")!;
      const image = element.querySelector("svg")!.getBoundingClientRect();
      const labelElement = section.querySelector(".hero-label, .eyebrow")!;
      const text = [...labelElement.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())!;
      const range = document.createRange();
      range.selectNode(text);
      const label = range.getBoundingClientRect();
      return { overlap: Math.min(image.right, label.right) > Math.max(image.left, label.left) && Math.min(image.bottom, label.bottom) > Math.max(image.top, label.top) };
    });
    expect(placement.overlap, `${scene} artwork must not cover its section label`).toBe(false);
  }
});

test("selected work contains only published cases and fills the final desktop row", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator(".selected-work-card")).toHaveCount(3);
  await expect(page.getByText("AI SUPPORT / 30")).toHaveCount(0);
  const finalCard = page.locator(".selected-work-card").last();
  const firstCard = page.locator(".selected-work-card").first();
  const finalWidth = await finalCard.evaluate((element) => element.getBoundingClientRect().width);
  const firstWidth = await firstCard.evaluate((element) => element.getBoundingClientRect().width);
  expect(finalWidth).toBeGreaterThan(firstWidth * 1.8);
});

test("service photography loads responsively on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#services").scrollIntoViewIfNeeded();
  const images = page.locator(".service-photo img");
  await expect(images).toHaveCount(3);
  await expect.poll(async () => images.evaluateAll((elements) => elements.every((element) => (element as HTMLImageElement).naturalWidth > 0))).toBe(true);
  const sources = await images.evaluateAll((elements) => elements.map((element) => (element as HTMLImageElement).currentSrc));
  expect(sources[0]).toContain("tehnotek-prototype.webp");
  expect(sources[1]).toContain("bot-welcome.webp");
  expect(sources[2]).toContain("simka-store.png");
  await expect(page.locator(".service-flow")).toHaveCount(1);
  const layouts = await page.locator(".services .service-item").evaluateAll((elements) => elements.map((element) => {
    const visual = element.querySelector(".service-visual")!.getBoundingClientRect();
    const text = element.querySelector(".service-text")!.getBoundingClientRect();
    return { gap: text.top - visual.bottom };
  }));
  for (const layout of layouts) {
    expect(layout.gap).toBeGreaterThanOrEqual(0);
  }
});

test("hero project carousel supports buttons and keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const carousel = page.getByRole("region", { name: "Избранные проекты" });
  await expect(carousel.getByText("NEBO BISTRO", { exact: true })).toBeVisible();
  const neboImages = await carousel.locator(".hero-project-slide.is-active img").evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).currentSrc),
  );
  expect(neboImages).toHaveLength(2);
  expect(neboImages[0]).toContain("bot-welcome.webp");
  expect(neboImages[1]).toContain("prize-wheel.webp");

  await carousel.getByRole("button", { name: "Следующий проект" }).click();
  await expect(carousel.getByText("DROP / AIR FORCE 1", { exact: true })).toBeVisible();
  const dropImage = await carousel.locator(".hero-project-slide.is-active img").evaluate((image) => ({
    src: (image as HTMLImageElement).currentSrc,
    fit: getComputedStyle(image).objectFit,
  }));
  expect(dropImage.src).toContain("drop-air-force-1.webp");
  expect(dropImage.fit).toBe("contain");
  const openControl = await carousel.locator(".hero-project-slide.is-active .hero-project-open").evaluate((control) => {
    const icon = control.querySelector("svg") as SVGElement;
    const controlRect = control.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    return {
      x: Math.abs(controlRect.x + controlRect.width / 2 - (iconRect.x + iconRect.width / 2)),
      y: Math.abs(controlRect.y + controlRect.height / 2 - (iconRect.y + iconRect.height / 2)),
    };
  });
  expect(openControl.x).toBeLessThan(1);
  expect(openControl.y).toBeLessThan(1);
  await expect(page.locator(".project-flagship").getByRole("heading", { name: "DROP / AIR FORCE 1" })).toBeVisible();
  await expect(page.locator(".project-flagship").getByText("РАБОЧИЙ КОНЦЕПТ", { exact: true })).toBeVisible();
  await expect(page.locator(".project-layers")).toHaveCount(0);
  const dropFeature = await page.locator(".project-highlight-shell .selected-work-visual").evaluate((visual) => {
    const image = visual.querySelector("img") as HTMLImageElement;
    const rect = visual.getBoundingClientRect();
    return { src: image.currentSrc, ratio: rect.height / rect.width };
  });
  expect(dropFeature.src).toContain("drop-air-force-1.webp");
  expect(dropFeature.ratio).toBeLessThan(0.65);

  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(carousel.getByText("ТЕХНОТЭК", { exact: true })).toBeVisible();
  await expect(carousel.getByText("ПРОТОТИП", { exact: true })).toBeVisible();
  const tehnotekImage = await carousel.locator(".hero-project-slide.is-active img").evaluate((image) => ({
    src: (image as HTMLImageElement).currentSrc,
    fit: getComputedStyle(image).objectFit,
  }));
  expect(tehnotekImage.src).toContain("tehnotek-prototype.webp");
  expect(tehnotekImage.fit).toBe("contain");
  await expect(page.locator(".project-flagship").getByRole("heading", { name: "ТЕХНОТЭК" })).toBeVisible();
  await expect(page.locator(".project-flagship").getByText("ПРОТОТИП", { exact: true })).toBeVisible();

  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(carousel.getByText("SIMKA STORE", { exact: true })).toBeVisible();
  await expect(carousel.getByText("ПУБЛИЧНОЕ ДЕМО", { exact: true })).toBeVisible();
  const simkaImage = await carousel.locator(".hero-project-slide.is-active img").evaluate((image) => ({
    src: (image as HTMLImageElement).currentSrc,
    fit: getComputedStyle(image).objectFit,
  }));
  expect(simkaImage.src).toContain("simka-store.png");
  expect(simkaImage.fit).toBe("contain");
  await expect(page.locator(".project-flagship").getByRole("heading", { name: "SIMKA STORE" })).toBeVisible();

  await carousel.getByRole("button", { name: "Показать NEBO BISTRO" }).click();
  await expect(page.locator(".project-flagship").getByRole("heading", { name: "NEBO BISTRO" })).toBeVisible();
  await expect(page.locator(".project-layers")).toBeVisible();
});

test("project case is reachable and has its own content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/nebo-bistro", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "NEBO BISTRO" })).toBeVisible();
  await expect(page.locator(".case-visual")).toBeVisible();
  await expect(page.locator(".case-gallery-card")).toHaveCount(4);
  await expect(page.locator(".case-gallery-card img").first()).toHaveAttribute("loading", "lazy");

  const gallery = await page.locator(".case-gallery-grid").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(gallery.scrollWidth).toBeGreaterThan(gallery.clientWidth);
  expect(gallery.documentWidth).toBeLessThanOrEqual(gallery.viewportWidth + 1);
  await expect(page).toHaveTitle(/Nebo Bistro/i);
});

for (const projectCase of [
  { slug: "drop-3d-store", title: "DROP / AIR FORCE 1", liveLabel: /Открыть рабочий концепт/, image: "drop-air-force-1.webp" },
  { slug: "tehnotek-prototype", title: "ТЕХНОТЭК", liveLabel: /Открыть прототип/, image: "tehnotek-prototype.webp" },
  { slug: "simka-store", title: "SIMKA STORE", liveLabel: /Открыть публичное демо/, image: "simka-store.png" },
] as const) {
  test(`mobile: ${projectCase.slug} has a complete case study`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/projects/${projectCase.slug}`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: projectCase.title })).toBeVisible();
    await expect(page.locator(".case-story article")).toHaveCount(3);
    await expect(page.getByRole("link", { name: projectCase.liveLabel })).toBeVisible();
    const caseVisual = await page.locator(".case-highlight-visual .selected-work-visual").evaluate((visual) => {
      const image = visual.querySelector("img") as HTMLImageElement;
      const rect = visual.getBoundingClientRect();
      return { image: image.currentSrc, width: rect.width, height: rect.height };
    });
    expect(caseVisual.image).toContain(projectCase.image);
    expect(caseVisual.width).toBeGreaterThan(330);
    expect(caseVisual.height / caseVisual.width).toBeGreaterThan(0.5);
    expect(caseVisual.height / caseVisual.width).toBeLessThan(0.7);
    const titleToken = projectCase.slug === "drop-3d-store" ? "DROP" : projectCase.slug === "tehnotek-prototype" ? "ТЕХНОТЭК" : "SIMKA";
    await expect(page).toHaveTitle(new RegExp(titleToken, "i"));
  });
}

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const) {
  test(`${viewport.name}: SEO service pages stay readable and aligned`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/razrabotka-sajtov", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { level: 1, name: /Разработка сайтов под ключ/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Обсудить задачу/ }).first()).toBeVisible();
    await expect(page.locator(".seo-feature-grid article")).toHaveCount(4);
    const estimateLink = page.getByRole("link", { name: /Получить оценку/ });
    await expect(estimateLink).toHaveAttribute("target", "_blank");
    const estimateHref = await estimateLink.getAttribute("href");
    const estimateUrl = new URL(estimateHref!);
    expect(estimateUrl.origin + estimateUrl.pathname).toBe("https://t.me/qweJSq");
    expect(estimateUrl.searchParams.get("text")).toContain("Что нужно: Разработка сайтов под ключ для бизнеса");
    expect(estimateUrl.searchParams.get("text")).toContain("Примерный бюджет: [укажите сумму]");

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      sections: [...document.querySelectorAll<HTMLElement>(".seo-feature-grid article")].map((section) => {
        const rect = section.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      }),
    }));

    expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1);
    for (const section of layout.sections) {
      expect(section.left).toBeGreaterThanOrEqual(-1);
      expect(section.right).toBeLessThanOrEqual(layout.viewport + 1);
    }
  });
}
