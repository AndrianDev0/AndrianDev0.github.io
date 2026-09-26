import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getProject, type Project } from "../projects";
import { projectRussian } from "../i18n";
import { estimateTelegramUrl } from "../site";
import {
  absoluteAlternates,
  absoluteSiteUrl,
  getServiceBySlug,
  indexableRoutes,
  notFoundMetadata,
  productionOrigin,
  seoServices,
  type RouteMetadata,
  type SiteLanguage,
} from "../site-registry";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const ORIGIN = productionOrigin;
type Service = (typeof seoServices)[number];

type PageMeta = {
  lang: "ru" | "en";
  title: string;
  description: string;
  canonical?: string;
  locale: string;
  schema?: unknown;
  alternates?: { ru: string; en: string; xDefault: string };
  useSocialImage?: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function schemaJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function replaceMeta(html: string, attribute: "name" | "property", key: string, content: string) {
  const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+${attribute}="${safeKey}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function replaceCanonical(html: string, canonical: string) {
  return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
}

function replaceAlternates(html: string, alternates?: PageMeta["alternates"]) {
  const withoutAlternates = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*\/?>/gi, "");
  if (!alternates) return withoutAlternates;
  const tags = [
    `<link rel="alternate" hreflang="ru" href="${alternates.ru}" />`,
    `<link rel="alternate" hreflang="en" href="${alternates.en}" />`,
    `<link rel="alternate" hreflang="x-default" href="${alternates.xDefault}" />`,
  ].join("\n    ");
  return withoutAlternates.replace("</head>", `    ${tags}\n  </head>`);
}

function replaceStructuredData(html: string, schema: unknown) {
  const block = `<!-- seo:structured-data:start -->\n    <script type="application/ld+json">${schemaJson(schema)}</script>\n    <!-- seo:structured-data:end -->`;
  return html.replace(/<!-- seo:structured-data:start -->[\s\S]*?<!-- seo:structured-data:end -->/i, block);
}

function applyMeta(template: string, meta: PageMeta) {
  let html = template.replace(/<html\s+lang="[^"]+">/i, `<html lang="${meta.lang}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceMeta(html, "name", "description", meta.description);
  html = replaceMeta(html, "property", "og:title", meta.title);
  html = replaceMeta(html, "property", "og:description", meta.description);
  if (meta.canonical) html = replaceMeta(html, "property", "og:url", meta.canonical);
  else html = html.replace(/\s*<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, "");
  html = replaceMeta(html, "property", "og:locale", meta.locale);
  html = replaceMeta(
    html,
    "property",
    "og:image:alt",
    meta.lang === "ru"
      ? "Andrian.Dev — разработка сайтов и Telegram-ботов"
      : "Andrian.Dev — websites and Telegram bots",
  );
  html = replaceMeta(html, "name", "twitter:title", meta.title);
  html = replaceMeta(html, "name", "twitter:description", meta.description);
  if (meta.canonical) html = replaceCanonical(html, meta.canonical);
  else html = html.replace(/\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, "");
  html = replaceAlternates(html, meta.alternates);
  if (meta.schema) html = replaceStructuredData(html, meta.schema);
  else html = html.replace(/\s*<!-- seo:structured-data:start -->[\s\S]*?<!-- seo:structured-data:end -->/i, "");
  if (meta.useSocialImage === false) {
    html = html.replace(/\s*<meta\s+property="og:image(?::[^"]+)?"\s+content="[^"]*"\s*\/?>/gi, "");
    html = html.replace(/\s*<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/gi, "");
    html = html.replace(/<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, '<meta name="twitter:card" content="summary" />');
  } else {
    const socialImage = absoluteSiteUrl("/og-v2.jpg");
    html = replaceMeta(html, "property", "og:image", socialImage);
    html = replaceMeta(html, "name", "twitter:image", socialImage);
  }
  return html;
}

function wrapRoot(content: string) {
  return `<div id="root">${content}</div>`;
}

function injectRoot(template: string, content: string) {
  return template.replace('<div id="root"></div>', wrapRoot(content));
}

const serviceCards = seoServices.map((service) => `
  <article>
    <h3>${escapeHtml(service.h1)}</h3>
    <p>${escapeHtml(service.description)}</p>
    <a href="/${service.slug}">Подробнее об услуге →</a>
  </article>`).join("");

function homeFallback(language: "ru" | "en") {
  const ru = language === "ru";
  const prefix = ru ? "" : "/en";
  return `<div class="seo-static-home">
    <header class="seo-static-nav">
      <a class="brand" href="${prefix || "/"}"><span class="brand-mark"><i></i></span><span class="brand-word">Andrian.Dev</span></a>
      <nav aria-label="${ru ? "Основная навигация" : "Primary navigation"}"><a href="#work">${ru ? "Проекты" : "Work"}</a><a href="#services">${ru ? "Услуги" : "Services"}</a><a href="#process">${ru ? "Процесс" : "Process"}</a><a href="#contact">${ru ? "Контакты" : "Contact"}</a></nav>
      <a href="${ru ? "/en" : "/"}">${ru ? "EN" : "RU"}</a>
    </header>
    <main>
      <section class="seo-static-hero">
        <span>${ru ? "ВЕБ-РАЗРАБОТКА / TELEGRAM-БОТЫ / АВТОМАТИЗАЦИЯ" : "WEB DEVELOPMENT / TELEGRAM BOTS / AUTOMATION"}</span>
        <h1>${ru ? "Сайты и <em>Telegram-боты</em> для реальных задач." : "Websites and <em>Telegram bots</em> for real work."}</h1>
        <p>${ru ? "Создаю сайты, Telegram-ботов, веб-приложения и автоматизацию для бизнеса — от структуры и интерфейса до интеграций, тестирования и запуска." : "I build modern websites, Telegram bots, web apps, and automations — from structure and interface to integrations, testing, and launch."}</p>
        <div class="seo-static-actions"><a href="#contact">${ru ? "Обсудить проект" : "Start a project"}</a><a href="#work">${ru ? "Смотреть работы" : "View my work"}</a></div>
      </section>
      <section class="seo-static-case" id="work"><h2>${ru ? "Избранные работы: продукты, 3D и Telegram" : "Selected work: products, 3D and Telegram"}</h2><p>${ru ? "Nebo Bistro — запущенный бот и Mini App. DROP — рабочий интерактивный 3D-концепт магазина. ТЕХНОТЭК — прототип продуктовой B2B-страницы. AI Support / 30 — клиентский Telegram MVP на этапе проектирования." : "Nebo Bistro is a live bot and Mini App. DROP is a working interactive 3D commerce concept. TEHNOTEK is a B2B product page prototype. AI Support / 30 is a client Telegram MVP currently in design."}</p><div class="seo-static-actions"><a href="${prefix}/projects/nebo-bistro">${ru ? "Разобрать Nebo Bistro" : "Explore Nebo Bistro"} →</a><a href="https://tehnotek-prototype.vercel.app/">${ru ? "Открыть прототип ТЕХНОТЭК" : "Open TEHNOTEK prototype"} →</a></div></section>
      <section class="seo-static-section" id="services"><h2>${ru ? "Услуги разработки для бизнеса" : "Development services for business"}</h2><div class="seo-static-grid">${ru ? serviceCards : `<article><h3>Web development</h3><p>Landing pages, corporate websites and custom builds.</p><a href="#contact">Discuss a website →</a></article><article><h3>Telegram bots</h3><p>Lead capture, sales, support, catalogs and integrations.</p><a href="#contact">Discuss a bot →</a></article><article><h3>Web apps</h3><p>Dashboards, accounts and internal tools.</p><a href="#contact">Discuss a web app →</a></article><article><h3>Automation</h3><p>API, CRM, Telegram and notification workflows.</p><a href="#contact">Discuss automation →</a></article>`}</div></section>
      <section class="seo-static-case" id="process"><h2>${ru ? "От идеи до запуска" : "From idea to launch"}</h2><p>${ru ? "Знакомство, анализ, дизайн, разработка, тестирование и запуск остаются частью одного понятного процесса." : "Discovery, analysis, design, development, testing and launch stay connected in one clear process."}</p></section>
      <section class="seo-static-section" id="contact"><h2>${ru ? "Обсудить проект" : "Start a project"}</h2><p>${ru ? "Расскажите, что вам нужно — предложу подходящий способ реализации." : "Tell me what you need and I will suggest the right way to build it."}</p><div class="seo-static-actions"><a href="https://t.me/qweJSq">Telegram</a><a href="mailto:maa190186@gmail.com">maa190186@gmail.com</a></div></section>
    </main>
    <footer class="seo-static-footer"><span>© ${new Date().getFullYear()} Andrian.Dev</span><a href="https://t.me/qweJSq">Telegram</a></footer>
  </div>`;
}

function serviceFallback(service: Service) {
  const features = service.features.map((feature, index) => `<article><span>0${index + 1}</span><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.text)}</p></article>`).join("");
  const process = service.process.map((step, index) => `<li><span>ЭТАП 0${index + 1}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join("");
  const includes = service.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const faq = service.faq.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("");
  const caseSection = service.slug === "telegram-boty" ? `<section class="seo-section seo-case-callout"><div class="container seo-case-card"><div><p class="eyebrow">РЕАЛЬНЫЙ КЕЙС</p><h2>Telegram-бот и Mini App для Nebo Bistro</h2></div><p>Рабочая промокампания для привлечения гостей и рекламы партнёров ресторана.</p><a href="/projects/nebo-bistro">Посмотреть кейс →</a></div></section>` : "";
  const estimateUrl = escapeHtml(estimateTelegramUrl(service.h1));
  return `<div class="seo-page">
    <header class="seo-header"><nav class="seo-nav container"><a class="brand" href="/"><span class="brand-mark"><i></i></span><span class="brand-word">Andrian.Dev</span></a><div class="seo-nav-links"><a href="/#work">Кейс</a><a href="/#services">Услуги</a><a href="/#process">Процесс</a><a href="/#contact">Контакты</a></div><div class="seo-nav-actions"><a class="nav-cta" href="/#contact">Обсудить проект</a></div></nav></header>
    <main>
      <section class="seo-hero"><div class="container seo-hero-layout"><div class="seo-hero-copy"><nav class="seo-breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><span>Услуги</span></nav><p class="eyebrow">${escapeHtml(service.eyebrow)}</p><h1>${escapeHtml(service.h1)}</h1><p class="seo-lead">${escapeHtml(service.lead)}</p><div class="seo-hero-actions"><a class="button button-primary" href="/#contact">Обсудить задачу →</a><a class="button button-ghost" href="https://t.me/qweJSq">Написать в Telegram</a></div></div><aside class="seo-hero-panel"><span>ANDRIAN.DEV / SERVICE</span><strong>ЗАДАЧА<br>→ ПРОДУКТ</strong><div><span>01 Анализ</span><span>02 Интерфейс</span><span>03 Разработка</span><span>04 Запуск</span></div></aside></div></section>
      <section class="seo-section seo-overview"><div class="container"><div class="seo-section-heading"><p class="eyebrow">ВОЗМОЖНОСТИ</p><h2>${escapeHtml(service.overviewTitle)}</h2></div><div class="seo-feature-grid">${features}</div></div></section>
      <section class="seo-section seo-includes"><div class="container seo-includes-layout"><div><p class="eyebrow">СОСТАВ РАБОТ</p><h2>${escapeHtml(service.includesTitle)}</h2></div><ul>${includes}</ul></div></section>
      <section class="seo-section seo-process"><div class="container"><div class="seo-section-heading"><p class="eyebrow">ПРОЦЕСС</p><h2>${escapeHtml(service.processTitle)}</h2></div><ol class="seo-process-grid">${process}</ol></div></section>
      <section class="seo-section seo-pricing"><div class="container seo-pricing-card"><div><p class="eyebrow">ОЦЕНКА ПРОЕКТА</p><h2>${escapeHtml(service.pricingTitle)}</h2></div><p>${escapeHtml(service.pricingText)}</p><a href="${estimateUrl}" target="_blank" rel="noreferrer">Получить оценку →</a></div></section>
      ${caseSection}
      <section class="seo-section seo-faq"><div class="container seo-faq-layout"><div><p class="eyebrow">FAQ</p><h2>Частые вопросы</h2><p>Короткие ответы о составе, оценке и запуске проекта.</p></div><div class="seo-faq-list">${faq}</div></div></section>
      <section class="seo-related"><div class="container"><span>СЛЕДУЮЩАЯ УСЛУГА</span><a href="/${service.relatedSlug}"><h2>${escapeHtml(service.relatedLabel)}</h2><span>↗</span></a></div></section>
      <section class="seo-cta"><div class="container"><p class="eyebrow">ОБСУДИТЬ ПРОЕКТ</p><h2>Расскажите, что нужно сделать.</h2><p>Предложу подходящий формат реализации и понятный следующий шаг.</p><a class="button button-primary" href="/#contact">Перейти к заявке →</a></div></section>
    </main>
    <footer class="seo-footer"><div class="container"><a class="footer-brand" href="/">Andrian.Dev</a><div class="seo-footer-links">${seoServices.map((item) => `<a href="/${item.slug}">${escapeHtml(item.h1)}</a>`).join("")}</div><div><a href="https://t.me/qweJSq">Telegram</a><a href="mailto:maa190186@gmail.com">maa190186@gmail.com</a></div></div></footer>
  </div>`;
}

function caseFallback(project: Project, language: SiteLanguage, metadata: RouteMetadata) {
  const ru = language === "ru";
  const home = ru ? "/" : "/en";
  const titleLines = project.title.split(/\s+/).map(escapeHtml).join("<br>");
  const localized = projectRussian[project.slug];
  const category = ru ? localized.category : project.category;
  const description = ru ? localized.description : project.description;
  const challenge = ru ? localized.challenge : project.challenge;
  const solution = ru ? localized.solution : project.solution;
  const result = ru ? localized.result : project.result;
  const technologies = project.technologies.map((technology) => `<span>${escapeHtml(technology)}</span>`).join("");
  return `<div class="seo-page"><header class="seo-header"><nav class="seo-nav container"><a class="brand" href="${home}"><span class="brand-mark"><i></i></span><span class="brand-word">Andrian.Dev</span></a><div class="seo-nav-actions"><a class="nav-cta" href="${home}#contact">${ru ? "Обсудить проект" : "Start a project"}</a></div></nav></header><main><section class="seo-hero"><div class="container seo-hero-layout"><div class="seo-hero-copy"><nav class="seo-breadcrumbs"><a href="${home}">${ru ? "Главная" : "Home"}</a><span>/</span><span>${ru ? "Кейс" : "Case study"}</span></nav><p class="eyebrow">${escapeHtml(category.toUpperCase())}</p><h1>${escapeHtml(metadata.h1)}</h1><p class="seo-lead">${escapeHtml(description)}</p><div class="seo-hero-actions"><a class="button button-primary" href="${escapeHtml(project.liveUrl)}">${ru ? "Открыть проект" : "Open project"}</a><a class="button button-ghost" href="${home}#contact">${ru ? "Обсудить похожий проект" : "Discuss a similar project"}</a></div></div><aside class="seo-hero-panel"><span>CASE STUDY / ${escapeHtml(project.id)}</span><strong>${titleLines}</strong><div>${technologies}</div></aside></div></section><section class="seo-section seo-overview"><div class="container"><div class="seo-section-heading"><p class="eyebrow">01 / ${ru ? "РАЗБОР" : "BREAKDOWN"}</p><h2>${ru ? "Задача, решение и результат" : "Challenge, solution, and result"}</h2></div><div class="seo-feature-grid"><article><h3>${ru ? "Задача" : "Challenge"}</h3><p>${escapeHtml(challenge)}</p></article><article><h3>${ru ? "Решение" : "Solution"}</h3><p>${escapeHtml(solution)}</p></article><article><h3>${ru ? "Результат" : "Result"}</h3><p>${escapeHtml(result)}</p></article><article><h3>${ru ? "Технологии" : "Technology"}</h3><p>${escapeHtml(project.technologies.join(", "))}.</p></article></div></div></section><section class="seo-cta"><div class="container"><h2>${ru ? "Нужен похожий продукт?" : "Need something similar?"}</h2><a class="button button-primary" href="${home}#contact">${ru ? "Обсудить проект" : "Start a project"}</a><a class="button button-ghost" href="${home}#work">${ru ? "Все работы" : "All work"}</a></div></section></main></div>`;
}

function homeSchema(language: "ru" | "en") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: "Andrian.Dev", inLanguage: ["ru", "en"] },
      { "@type": "Person", "@id": `${ORIGIN}/#person`, name: "Andrian", alternateName: "Andrian.Dev", url: `${ORIGIN}/`, email: "mailto:maa190186@gmail.com", jobTitle: language === "ru" ? "Веб-разработчик" : "Web developer", sameAs: ["https://t.me/qweJSq"], knowsAbout: ["Web development", "Telegram bots", "Web applications", "Business automation"] },
      { "@type": "Service", "@id": `${ORIGIN}/#services`, name: language === "ru" ? "Разработка сайтов, Telegram-ботов и веб-приложений" : "Websites, Telegram bots and web application development", provider: { "@id": `${ORIGIN}/#person` }, areaServed: "Worldwide", url: `${ORIGIN}/#services` },
    ],
  };
}

function serviceSchema(service: Service) {
  const url = `${ORIGIN}/${service.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", "@id": `${url}#service`, name: service.h1, description: service.description, url, provider: { "@type": "Person", "@id": `${ORIGIN}/#person`, name: "Andrian", alternateName: "Andrian.Dev", url: `${ORIGIN}/`, sameAs: ["https://t.me/qweJSq"] }, areaServed: "Worldwide", inLanguage: "ru" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: `${ORIGIN}/` }, { "@type": "ListItem", position: 2, name: service.h1, item: url }] },
      { "@type": "FAQPage", mainEntity: service.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ],
  };
}

function caseSchema(pathname: string, project: Project, language: SiteLanguage, metadata: RouteMetadata) {
  const english = language === "en";
  const url = absoluteSiteUrl(pathname);
  const home = absoluteSiteUrl(english ? "/en" : "/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CreativeWork", "@id": `${url}#project`, name: metadata.h1, description: metadata.description, url, inLanguage: language, creator: { "@id": `${ORIGIN}/#person` } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: english ? "Home" : "Главная", item: home }, { "@type": "ListItem", position: 2, name: project.title, item: url }] },
    ],
  };
}

async function writePage(outDir: string, route: string, html: string) {
  const filePath = path.join(outDir, ...`${route}.html`.split("/").filter(Boolean));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
  const directoryIndex = path.join(outDir, ...route.split("/").filter(Boolean), "index.html");
  await mkdir(path.dirname(directoryIndex), { recursive: true });
  await writeFile(directoryIndex, html, "utf8");
}

export async function generateSeoPages(outDir: string) {
  const indexPath = path.join(outDir, "index.html");
  const template = await readFile(indexPath, "utf8");

  for (const route of indexableRoutes) {
    let fallback: string;
    let schema: unknown;

    if (route.kind === "home") {
      fallback = homeFallback(route.language);
      schema = homeSchema(route.language);
    } else if (route.kind === "service") {
      const service = getServiceBySlug(route.serviceSlug!);
      if (!service) throw new Error(`Missing content for service route: ${route.path}`);
      fallback = serviceFallback(service);
      schema = serviceSchema(service);
    } else {
      const project = getProject(route.projectSlug!);
      if (!project) throw new Error(`Missing project for route: ${route.path}`);
      fallback = caseFallback(project, route.language, route.metadata);
      schema = caseSchema(route.path, project, route.language, route.metadata);
    }

    const html = injectRoot(applyMeta(template, {
      lang: route.language,
      title: route.metadata.title,
      description: route.metadata.description,
      canonical: absoluteSiteUrl(route.path),
      locale: route.metadata.locale,
      schema,
      alternates: absoluteAlternates(route.alternates),
      useSocialImage: route.metadata.useSocialImage,
    }), fallback);

    if (route.path === "/") await writeFile(indexPath, html, "utf8");
    else await writePage(outDir, route.path, html);
  }

  const notFound = replaceMeta(applyMeta(template, {
    lang: notFoundMetadata.language,
    title: notFoundMetadata.title,
    description: notFoundMetadata.description,
    locale: notFoundMetadata.locale,
    useSocialImage: false,
  }), "name", "robots", "noindex, follow")
    .replace('<div id="root"></div>', '<div id="root"><main class="route-error"><p>404</p><h1>Страница не найдена</h1><a href="/">Вернуться на Andrian.Dev</a></main></div>')
    .replace(/\s*<script\s+type="module"[^>]*><\/script>/i, "");
  await writeFile(path.join(outDir, "404.html"), notFound, "utf8");
  await writeFile(path.join(outDir, "sitemap.xml"), createSitemap(), "utf8");
  await writeFile(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`, "utf8");
}

function normalizeLastModified(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== trimmed ? undefined : trimmed;
}

/**
 * Prefer an explicit release date, then the latest content commit. If neither is
 * trustworthy, omit lastmod instead of publishing a made-up build date.
 */
export function resolveLastModified() {
  const configuredDate = process.env.SITE_LAST_MODIFIED;
  if (configuredDate) {
    const normalized = normalizeLastModified(configuredDate);
    if (!normalized) throw new Error("SITE_LAST_MODIFIED must use the YYYY-MM-DD format");
    return normalized;
  }

  try {
    const gitDate = execFileSync("git", [
      "log",
      "-1",
      "--format=%cs",
      "--",
      "site-registry.ts",
      "site.ts",
      "seo-pages.json",
      "projects.ts",
      "scripts/prerender-seo.ts",
    ], { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return normalizeLastModified(gitDate);
  } catch {
    return undefined;
  }
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

export function createSitemap(lastModified = resolveLastModified()) {
  const entries = indexableRoutes.map((route) => {
    const alternates = absoluteAlternates(route.alternates);
    const alternateLinks = alternates
      ? [
          ["ru", alternates.ru],
          ["en", alternates.en],
          ["x-default", alternates.xDefault],
        ].map(([language, href]) => `<xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(href)}"/>`).join("")
      : "";
    const lastModifiedTag = lastModified ? `<lastmod>${lastModified}</lastmod>` : "";
    return `  <url><loc>${escapeXml(absoluteSiteUrl(route.path))}</loc>${lastModifiedTag}${alternateLinks}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
}
