import { expect, test, type Page } from "@playwright/test";

const languages = [
  {
    code: "ru",
    path: "/",
    heading: /Сайты и Telegram-боты для реальных задач/,
    carousel: "Избранные проекты",
    menu: "Открыть меню",
    themeLabel: { light: "Включить тёмную тему", dark: "Включить светлую тему" },
  },
  {
    code: "en",
    path: "/en",
    heading: /Websites and Telegram bots for real work/,
    carousel: "Selected projects",
    menu: "Open menu",
    themeLabel: { light: "Switch to dark theme", dark: "Switch to light theme" },
  },
] as const;

const themes = ["light", "dark"] as const;
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

async function primeTheme(page: Page, theme: (typeof themes)[number]) {
  await page.addInitScript((value) => localStorage.setItem("andrian-dev-theme", value), theme);
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
}

for (const language of languages) {
  for (const theme of themes) {
    for (const viewport of viewports) {
      test(`${language.code} / ${theme} / ${viewport.name}: home is usable`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await primeTheme(page, theme);
        await page.goto(language.path, { waitUntil: "networkidle" });

        await expect(page.locator("html")).toHaveAttribute("lang", language.code);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.getByRole("heading", { level: 1, name: language.heading })).toBeVisible();
        await expect(page.getByRole("region", { name: language.carousel })).toBeVisible();
        await expect(page.locator(".service-item")).toHaveCount(4);
        await expect(page.getByRole("button", { name: language.themeLabel[theme] })).toBeVisible();
        await expectNoHorizontalOverflow(page);

        if (viewport.name === "mobile") {
          const heroLines = await page.locator(".hero-line").evaluateAll((elements) =>
            elements.map((element) => ({ visible: element.clientWidth, content: element.scrollWidth })),
          );
          for (const line of heroLines) expect(line.content).toBeLessThanOrEqual(line.visible + 1);
          await expect(page.locator(".hero-copy")).toHaveCSS("opacity", "1");
          await page.getByRole("button", { name: language.menu }).click();
          const menu = page.locator("#mobile-navigation");
          await expect(menu).toBeVisible();
          await expect(menu.locator("a")).toHaveCount(6);
          await expectNoHorizontalOverflow(page);
        }

        await page.locator(".theme-toggle").first().click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme === "light" ? "dark" : "light");
      });
    }
  }
}

test("language and theme choices survive real navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.locator(".theme-toggle").first().click();
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.getByRole("button", { name: "EN" }).click();
  await page.waitForURL("**/en#top");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(2);

  await page.goto("/en/projects/drop-3d-store", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "RU" }).click();
  await page.waitForURL("**/projects/drop-3d-store#top");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("heading", { level: 1, name: "DROP / AIR FORCE 1" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("budget ranges are localized and a custom amount is sent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let submittedBudget = "";
  await page.route("https://formsubmit.co/**", async (route) => {
    submittedBudget = (route.request().postDataJSON() as Record<string, string>)["Примерный бюджет"];
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto("/#contact", { waitUntil: "networkidle" });

  const budget = page.locator('select[name="budget"]');
  await expect(budget.locator("option")).toHaveText([
    "Выберите диапазон (необязательно)",
    "5 000–10 000 ₽",
    "10 000–20 000 ₽",
    "20 000–50 000 ₽",
    "Свой вариант",
  ]);
  await budget.selectOption("custom");
  const customBudget = page.locator('input[name="customBudget"]');
  await expect(customBudget).toBeVisible();
  await expect(customBudget).toHaveAttribute("required", "");

  await page.locator('input[name="name"]').fill("Тест");
  await page.locator('input[name="contact"]').fill("@test");
  await page.locator('textarea[name="projectDescription"]').fill("Тестовая заявка");
  await customBudget.fill("35 000 ₽");
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.getByText("Заявка отправлена")).toBeVisible();
  expect(submittedBudget).toBe("35 000 ₽");

  await page.goto("/en#contact", { waitUntil: "networkidle" });
  await expect(page.locator('select[name="budget"] option')).toHaveText([
    "Select a range (optional)",
    "₽5,000–10,000",
    "₽10,000–20,000",
    "₽20,000–50,000",
    "Custom amount",
  ]);
});

const cases = [
  { slug: "nebo-bistro", title: "NEBO BISTRO" },
  { slug: "drop-3d-store", title: "DROP / AIR FORCE 1" },
  { slug: "tehnotek-prototype", title: "ТЕХНОТЭК" },
] as const;

for (const language of languages) {
  for (const theme of themes) {
    for (const viewport of viewports) {
      test(`${language.code} / ${theme} / ${viewport.name}: all case pages render`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await primeTheme(page, theme);

        for (const project of cases) {
          const prefix = language.code === "en" ? "/en" : "";
          await page.goto(`${prefix}/projects/${project.slug}`, { waitUntil: "networkidle" });
          await expect(page.locator("html")).toHaveAttribute("lang", language.code);
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
          await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
          await expect(page.locator(".case-story article")).toHaveCount(3);
          await expect(page.locator(".case-project-actions a").first()).toBeVisible();
          await expectNoHorizontalOverflow(page);
        }
      });
    }
  }
}
