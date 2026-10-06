import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { projects } from "../projects";
import { siteConfig } from "../site";
import { absoluteAlternates, absoluteSiteUrl, indexableRoutes, productionOrigin, seoServices } from "../site-registry";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function textContent(value: string) {
  return value.replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").replaceAll("&#39;", "'").trim();
}

test("every indexable route returns unique crawlable HTML", async ({ request }) => {
  const titles = new Set<string>();
  const canonicals = new Set<string>();

  for (const route of indexableRoutes) {
    const response = await request.get(route.path);
    expect(response.status(), route.path).toBe(200);
    expect(response.headers()["content-type"], route.path).toContain("text/html");
    const html = await response.text();
    expect(html, `${route.path} build placeholders`).not.toMatch(/SEO_(?:TITLE|DESCRIPTION)_PLACEHOLDER|seo\.invalid/);
    expect(html, `${route.path} title`).toContain(`<title>${escapeHtml(route.metadata.title)}`);
    const renderedH1 = html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "";
    expect(textContent(renderedH1), `${route.path} h1`).toBe(route.metadata.h1);
    const canonical = absoluteSiteUrl(route.path);
    expect(html, `${route.path} canonical`).toContain(`<link rel="canonical" href="${canonical}"`);
    titles.add(html.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
    canonicals.add(canonical);

    const alternates = absoluteAlternates(route.alternates);
    if (alternates) {
      expect(html, `${route.path} Russian alternate`).toContain(`hreflang="ru" href="${alternates.ru}"`);
      expect(html, `${route.path} English alternate`).toContain(`hreflang="en" href="${alternates.en}"`);
      expect(html, `${route.path} default alternate`).toContain(`hreflang="x-default" href="${alternates.xDefault}"`);
    }

    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    expect(jsonLd.length, `${route.path} structured data`).toBeGreaterThan(0);
    for (const match of jsonLd) expect(() => JSON.parse(match[1])).not.toThrow();
  }

  expect(titles.size).toBe(indexableRoutes.length);
  expect(canonicals.size).toBe(indexableRoutes.length);
});

test("sitemap contains only the published canonical routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const sitemap = await response.text();
  const expectedCanonicals = indexableRoutes.map((route) => absoluteSiteUrl(route.path));
  for (const route of indexableRoutes) {
    const canonical = absoluteSiteUrl(route.path);
    expect(sitemap).toContain(`<loc>${canonical}</loc>`);
  }
  const actualCanonicals = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(actualCanonicals.sort()).toEqual(expectedCanonicals.sort());
});

test("unknown pages and missing assets return real 404 responses", async ({ request }) => {
  const page = await request.get("/not-a-real-page");
  expect(page.status()).toBe(404);
  const html = readFileSync(new URL("../dist-vercel/404.html", import.meta.url), "utf8");
  expect(html).toContain('<meta name="robots" content="noindex, follow"');
  expect(html).not.toContain('rel="canonical"');
  expect(html).not.toContain('type="application/ld+json"');
  expect((await request.get("/assets/does-not-exist.js")).status()).toBe(404);
});

test("critical NEBO visuals are published from their stable asset path", async ({ request }) => {
  const assets = [
    "/projects/nebo-assets/welcome-premium.webp",
    "/projects/nebo-assets/welcome-premium.jpg",
    "/projects/nebo-assets/case/bot-start.webp",
    "/projects/nebo-assets/case/bot-welcome.webp",
    "/projects/nebo-assets/case/bot-welcome-hd.webp",
    "/projects/nebo-assets/case/prize-wheel.webp",
    "/projects/nebo-assets/case/prize-wheel-hd.webp",
    "/projects/nebo-assets/case/prize-result.webp",
  ];

  for (const asset of assets) {
    const response = await request.get(asset);
    expect(response.status(), asset).toBe(200);
    expect(response.headers()["content-type"], asset).toMatch(/^image\/(?:webp|jpeg)/);
    expect((await response.body()).byteLength, asset).toBeGreaterThan(1_000);
  }
});

test("search engine ownership files stay published", async ({ request }) => {
  const home = await request.get("/");
  expect(await home.text()).toContain('<meta name="google-site-verification" content="BnAG3PijlF1RMPKWmJuEJmdRd4BQuqG9kUcDcfj6Ds0"');

  const yandex = await request.get("/yandex_5372d8cf48efc93e.html");
  expect(yandex.status()).toBe(200);
  expect(await yandex.text()).toContain("Verification: 5372d8cf48efc93e");
});

test("production origin has one normalized registry value", () => {
  expect(productionOrigin).toBe(new URL(siteConfig.url).origin);
  expect(new Set(indexableRoutes.map((route) => route.path)).size).toBe(indexableRoutes.length);
  expect(indexableRoutes.filter((route) => route.kind === "service")).toHaveLength(seoServices.length);
  expect(indexableRoutes.filter((route) => route.kind === "project")).toHaveLength(projects.length * 2);
});
