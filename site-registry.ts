import seoContent from "./seo-pages.json" with { type: "json" };
import { projects } from "./projects";
import { siteConfig } from "./site";

export type SiteLanguage = "ru" | "en";
export type RouteKind = "home" | "service" | "project";

export type RouteMetadata = {
  title: string;
  description: string;
  h1: string;
  locale: "ru_RU" | "en_US";
  useSocialImage?: boolean;
};

export type AlternatePaths = {
  ru: string;
  en: string;
  xDefault?: string;
};

export type IndexableRoute = {
  path: string;
  kind: RouteKind;
  language: SiteLanguage;
  metadata: RouteMetadata;
  alternates?: AlternatePaths;
  serviceSlug?: string;
  projectSlug?: string;
};

const configuredOrigin = new URL(siteConfig.url);
if (configuredOrigin.pathname !== "/" || configuredOrigin.search || configuredOrigin.hash) {
  throw new Error("siteConfig.url must be a production origin without a path, query, or hash");
}

/** The only production origin used by canonical URLs, structured data, robots and sitemaps. */
export const productionOrigin = configuredOrigin.origin;
export const seoServices = seoContent.services;

export function normalizeRoutePath(pathname: string) {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : "/";
}

export function absoluteSiteUrl(pathname: string) {
  const path = normalizeRoutePath(pathname);
  return path === "/" ? `${productionOrigin}/` : `${productionOrigin}${path}/`;
}

export function serviceRoutePath(slug: string) {
  return `/${slug}`;
}

export function projectRoutePath(slug: string, language: SiteLanguage) {
  return `${language === "en" ? "/en" : ""}/projects/${slug}`;
}

const homeAlternates: AlternatePaths = { ru: "/", en: "/en", xDefault: "/" };

const homeRoutes: IndexableRoute[] = [
  {
    path: "/",
    kind: "home",
    language: "ru",
    metadata: {
      title: siteConfig.title,
      description: siteConfig.description,
      h1: "Сайты и Telegram-боты для реальных задач.",
      locale: "ru_RU",
    },
    alternates: homeAlternates,
  },
  {
    path: "/en",
    kind: "home",
    language: "en",
    metadata: {
      title: "Websites, Telegram Bots & Automation — Andrian.Dev",
      description: "Modern websites, Telegram bots, web apps and automation — from structure and interface to integrations, testing and launch.",
      h1: "Websites and Telegram bots for real work.",
      locale: "en_US",
    },
    alternates: homeAlternates,
  },
];

const serviceRoutes: IndexableRoute[] = seoServices.map((service) => ({
  path: serviceRoutePath(service.slug),
  kind: "service",
  language: "ru",
  serviceSlug: service.slug,
  metadata: {
    title: service.title,
    description: service.description,
    h1: service.h1,
    locale: "ru_RU",
  },
}));

type LocalizedProjectMetadata = Record<SiteLanguage, RouteMetadata>;

const projectMetadata: Record<string, LocalizedProjectMetadata> = {
  "nebo-bistro": {
    ru: {
      title: "Telegram-бот и Mini App Nebo Bistro — кейс | Andrian.Dev",
      description: "Telegram-кейс Nebo Bistro для привлечения новых гостей и рекламы партнёров: бот, Mini App с призами и защищённая панель.",
      h1: "Telegram-бот и Mini App для Nebo Bistro",
      locale: "ru_RU",
      useSocialImage: false,
    },
    en: {
      title: "Nebo Bistro Telegram Bot & Mini App Case — Andrian.Dev",
      description: "A live Nebo Bistro acquisition and sponsor campaign built as a Telegram bot, prize-wheel Mini App, and protected control panel.",
      h1: "Telegram bot and Mini App for Nebo Bistro",
      locale: "en_US",
      useSocialImage: false,
    },
  },
  "drop-3d-store": {
    ru: {
      title: "DROP: интерактивный 3D-магазин — кейс | Andrian.Dev",
      description: "Разбор рабочего 3D-концепта магазина DROP: сцена Air Force 1 на Three.js, сценарная прокрутка, версии товара и адаптивный путь к покупке.",
      h1: "Интерактивный 3D-магазин DROP",
      locale: "ru_RU",
      useSocialImage: false,
    },
    en: {
      title: "DROP Interactive 3D Store Case — Andrian.Dev",
      description: "A working DROP commerce concept built around a real-time Air Force 1 scene, scroll choreography, product editions, and a responsive purchase path.",
      h1: "DROP interactive 3D store",
      locale: "en_US",
      useSocialImage: false,
    },
  },
  "tehnotek-prototype": {
    ru: {
      title: "ТЕХНОТЭК: прототип B2B-страницы — кейс | Andrian.Dev",
      description: "Разбор прототипа ТЕХНОТЭК: техническое позиционирование, производственный кейс, понятная заявка и передача ТЗ или чертежа.",
      h1: "Продуктовая B2B-страница ТЕХНОТЭК",
      locale: "ru_RU",
      useSocialImage: false,
    },
    en: {
      title: "TEHNOTEK B2B Product Page Case — Andrian.Dev",
      description: "A working industrial product-page prototype with technical positioning, manufacturing proof, and a request flow with specification upload.",
      h1: "TEHNOTEK B2B product page",
      locale: "en_US",
      useSocialImage: false,
    },
  },
  "simka-store": {
    ru: {
      title: "SIMKA Store: магазин SIM и eSIM — кейс | Andrian.Dev",
      description: "Разбор SIMKA Store: каталог тарифов, оформление заказов, доставка SIM, выдача eSIM, аналитика и Telegram-админка.",
      h1: "Магазин SIM и eSIM SIMKA Store",
      locale: "ru_RU",
      useSocialImage: false,
    },
    en: {
      title: "SIMKA Store SIM & eSIM Commerce Case — Andrian.Dev",
      description: "SIMKA Store case study: tariff discovery, checkout, physical SIM delivery, eSIM fulfilment, analytics, and Telegram operations.",
      h1: "SIMKA Store SIM and eSIM platform",
      locale: "en_US",
      useSocialImage: false,
    },
  },
};

const projectRoutes: IndexableRoute[] = projects.flatMap((project) => {
  const metadata = projectMetadata[project.slug];
  if (!metadata) throw new Error(`Missing SEO metadata for project: ${project.slug}`);

  const alternates: AlternatePaths = {
    ru: projectRoutePath(project.slug, "ru"),
    en: projectRoutePath(project.slug, "en"),
    xDefault: projectRoutePath(project.slug, "ru"),
  };

  return (["ru", "en"] as const).map((language) => ({
    path: projectRoutePath(project.slug, language),
    kind: "project" as const,
    language,
    projectSlug: project.slug,
    metadata: metadata[language],
    alternates,
  }));
});

/** All and only pages that are built, canonicalized and included in the sitemap. */
export const indexableRoutes: readonly IndexableRoute[] = [
  ...homeRoutes,
  ...serviceRoutes,
  ...projectRoutes,
];

const routeByPath = new Map(indexableRoutes.map((route) => [route.path, route]));
if (routeByPath.size !== indexableRoutes.length) throw new Error("Duplicate indexable route path");

export const cleanRoutePaths = indexableRoutes
  .map((route) => route.path)
  .filter((route) => route !== "/");

export function findIndexableRoute(pathname: string) {
  return routeByPath.get(normalizeRoutePath(pathname));
}

export function getServiceBySlug(slug: string) {
  return seoServices.find((service) => service.slug === slug);
}

export function absoluteAlternates(alternates?: AlternatePaths) {
  if (!alternates) return undefined;
  return {
    ru: absoluteSiteUrl(alternates.ru),
    en: absoluteSiteUrl(alternates.en),
    xDefault: absoluteSiteUrl(alternates.xDefault ?? alternates.ru),
  };
}

export const notFoundMetadata = {
  language: "ru",
  title: "Страница не найдена — Andrian.Dev",
  description: "Запрошенная страница не найдена.",
  locale: "ru_RU",
} as const;
