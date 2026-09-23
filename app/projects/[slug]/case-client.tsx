"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { MagneticButton } from "../../../magnetic-button";
import { projectRussian, useLanguage } from "../../../i18n";
import { portfolioHighlights, type Project } from "../../../projects";
import { siteConfig } from "../../../site";
import { CaseStudyVisual, PortfolioHighlightVisual } from "../../../visuals";
import { ThemeToggle } from "../../../theme";

const neboScreenshots = [
  {
    src: "/nebo/case/bot-start.webp",
    alt: {
      ru: "Стартовый экран Telegram-бота Nebo Bistro с описанием механики и кнопкой запуска",
      en: "Nebo Bistro Telegram bot start screen with the promotion summary and launch button",
    },
  },
  {
    src: "/nebo/case/bot-welcome.webp",
    alt: {
      ru: "Приветственное сообщение Nebo Bistro в Telegram с переходом к получению приза",
      en: "Nebo Bistro welcome message in Telegram with a button leading to the prize flow",
    },
  },
  {
    src: "/nebo/case/prize-wheel.webp",
    alt: {
      ru: "Mini App Nebo Bistro с колесом призов ресторана и партнёров",
      en: "Nebo Bistro Mini App showing the restaurant and sponsor prize wheel",
    },
  },
  {
    src: "/nebo/case/prize-result.webp",
    alt: {
      ru: "Экран полученного приза от партнёра с инструкцией для гостя",
      en: "Sponsor prize result screen with redemption instructions for the guest",
    },
  },
] as const;

const projectCaseDetails = {
  "drop-3d-store": {
    en: {
      status: "LIVE CONCEPT",
      note: "A working 3D commerce concept focused on product presence, controlled interaction, and a clear route to selection.",
      challengeTitle: "Make the product memorable without hiding the purchase path.",
      solutionTitle: "A real-time 3D scene directed by the interface.",
      resultTitle: "A complete, responsive commerce concept.",
      points: ["Real-time Three.js product scene", "Three visual product editions", "Responsive interaction and purchase path"],
      openLabel: "Open live concept",
    },
    ru: {
      status: "РАБОЧИЙ КОНЦЕПТ",
      note: "Рабочий 3D-концепт магазина, где выразительная подача товара связана с понятным выбором и переходом к покупке.",
      challengeTitle: "Запомниться подачей и не спрятать путь к покупке.",
      solutionTitle: "3D-сцена в реальном времени под управлением интерфейса.",
      resultTitle: "Цельный адаптивный e-commerce-концепт.",
      points: ["3D-сцена товара на Three.js", "Три визуальные версии продукта", "Адаптивное взаимодействие и путь к покупке"],
      openLabel: "Открыть рабочий концепт",
    },
  },
  "tehnotek-prototype": {
    en: {
      status: "PROTOTYPE",
      note: "A working B2B page prototype that translates an industrial offer into a clear path from expertise to a qualified request.",
      challengeTitle: "Explain engineering value without a wall of specifications.",
      solutionTitle: "Positioning, proof, and enquiry in one reading sequence.",
      resultTitle: "A working prototype ready for validation.",
      points: ["Clear technical positioning", "Manufacturing case placed near the decision", "Brief or drawing upload with the enquiry"],
      openLabel: "Open prototype",
    },
    ru: {
      status: "ПРОТОТИП",
      note: "Рабочий прототип B2B-страницы, который переводит сложное производственное предложение в понятный путь от компетенций к заявке.",
      challengeTitle: "Объяснить инженерную ценность без стены характеристик.",
      solutionTitle: "Позиционирование, доказательства и заявка в одном сценарии.",
      resultTitle: "Рабочий прототип, готовый к проверке на аудитории.",
      points: ["Понятное техническое позиционирование", "Производственный кейс рядом с точкой решения", "Передача ТЗ или чертежа вместе с заявкой"],
      openLabel: "Открыть прототип",
    },
  },
  "simka-store": {
    en: {
      status: "PUBLIC DEMO",
      note: "A production-oriented telecom commerce platform with a public catalogue demo and complete operational flows behind the storefront.",
      challengeTitle: "Sell two different fulfilment models through one clear catalogue.",
      solutionTitle: "Discovery, checkout, fulfilment, and operations in one system.",
      resultTitle: "A scalable foundation for a real connectivity store.",
      points: ["Catalogue by country, operator, and product type", "Physical SIM delivery and eSIM fulfilment", "Role-based Telegram operations and analytics"],
      openLabel: "Open public demo",
    },
    ru: {
      status: "ПУБЛИЧНОЕ ДЕМО",
      note: "Production-ориентированная e-commerce-платформа для связи с публичной витриной и полноценными операционными сценариями за интерфейсом.",
      challengeTitle: "Объединить два способа выдачи товара в одном понятном каталоге.",
      solutionTitle: "Подбор, оформление, выдача и управление в одной системе.",
      resultTitle: "Масштабируемая основа реального магазина связи.",
      points: ["Каталог по странам, операторам и типу продукта", "Доставка SIM и выдача eSIM", "Ролевая Telegram-админка и аналитика"],
      openLabel: "Открыть публичное демо",
    },
  },
} as const;

export function ProjectCaseClient({ project }: { project: Project }) {
  const { language, setLanguage, t } = useLanguage();
  const homePath = language === "en" ? "/en" : "/";
  const localized = projectRussian[project.slug];
  const category = language === "ru" ? localized.category : project.category;
  const description = language === "ru" ? localized.description : project.description;
  const challenge = language === "ru" ? localized.challenge : project.challenge;
  const solution = language === "ru" ? localized.solution : project.solution;
  const result = language === "ru" ? localized.result : project.result;
  const portfolioProject = portfolioHighlights.find((item) => item.slug === project.slug);
  const customDetails = projectCaseDetails[project.slug as keyof typeof projectCaseDetails]?.[language];
  const status = customDetails?.status ?? t.case.real;
  const note = customDetails?.note ?? t.case.note;
  const challengeTitle = customDetails?.challengeTitle ?? t.case.challengeTitle;
  const solutionTitle = customDetails?.solutionTitle ?? t.case.solutionTitle;
  const resultTitle = customDetails?.resultTitle ?? t.case.resultTitle;
  const points = customDetails?.points ?? t.case.points;

  return (
    <main id="top" className={`case-page case-${project.slug}`} style={{ "--project-accent": project.accent } as React.CSSProperties}>
      <nav className="case-nav"><a className="brand" href={homePath}><span className="brand-mark"><i /></span><span className="brand-word">{siteConfig.name}</span></a><div className="case-nav-actions"><div className="language-switcher" role="group" aria-label="Language / Язык"><button type="button" className={language === "en" ? "is-active" : ""} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button><button type="button" className={language === "ru" ? "is-active" : ""} aria-pressed={language === "ru"} onClick={() => setLanguage("ru")}>RU</button></div><ThemeToggle className="theme-toggle-case" language={language} /><a href={`${homePath}#work`}><ArrowLeft size={16} /> {t.case.allWork}</a></div></nav>
      <section className="case-hero container">
        <div className="case-head-meta"><span>{project.id} / {t.case.featured}</span><span>{category.toUpperCase()}</span><span className={`demo-label ${portfolioProject ? "project-status-label" : "live-label"}`}><i />{status}</span></div>
        <h1>{project.title}</h1>
        <div className="case-summary"><p>{description}</p><div>{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
        <div className="case-project-actions"><a href={project.liveUrl} target="_blank" rel="noreferrer">{customDetails?.openLabel ?? t.case.openTelegram} <ArrowUpRight size={16} /></a>{project.slug === "nebo-bistro" && <a href={project.previewUrl} target="_blank" rel="noreferrer">{t.case.openMiniApp} <ArrowUpRight size={16} /></a>}</div>
        <div className={`case-visual${portfolioProject ? " case-highlight-visual" : ""}`}>{portfolioProject ? <PortfolioHighlightVisual project={portfolioProject} context="case" /> : <CaseStudyVisual kind={project.kind} />}</div>
      </section>
      <section className="case-body container">
        <aside><span>{t.case.label}</span><p>{note}</p></aside>
        <div className="case-story">
          <article><span>01 / {t.case.challengeLabel}</span><h2>{challengeTitle}</h2><p>{challenge}</p></article>
          <article><span>02 / {t.case.solutionLabel}</span><h2>{solutionTitle}</h2><p>{solution}</p><ul>{points.map((point) => <li key={point}><Check size={15} /> {point}</li>)}</ul></article>
          <article><span>03 / {t.case.resultLabel}</span><h2>{resultTitle}</h2><p>{result}</p></article>
        </div>
      </section>
      {project.slug === "nebo-bistro" ? (
        <section className="case-gallery container" aria-labelledby="case-gallery-title">
          <div className="case-gallery-heading">
            <span>{t.case.galleryEyebrow}</span>
            <h2 id="case-gallery-title">{t.case.galleryTitle}</h2>
            <p>{t.case.galleryCopy}</p>
          </div>
          <div className="case-gallery-grid">
            {neboScreenshots.map((screenshot, index) => (
              <figure className="case-gallery-card" key={screenshot.src}>
                <img
                  src={screenshot.src}
                  width="900"
                  height="1956"
                  loading="lazy"
                  decoding="async"
                  alt={screenshot.alt[language]}
                />
                <figcaption><span>0{index + 1}</span>{t.case.galleryCaptions[index]}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
      <section className="case-next"><div className="container"><span>{t.case.similar}</span><h2>{t.case.nextTop}<br />{t.case.nextBottom}</h2><MagneticButton href={`${homePath}#contact`}>{t.case.talk} <ArrowRight size={17} /></MagneticButton></div></section>
      <footer className="case-footer"><div className="container"><span>© {new Date().getFullYear()} {siteConfig.name}</span><a href={language === "ru" ? "/telegram-boty" : `${homePath}#services`}>{language === "ru" ? "Разработка Telegram-ботов" : "Telegram bot development"}</a><a href={`https://t.me/${siteConfig.telegram}`} target="_blank" rel="noreferrer">Telegram <ArrowUpRight size={14} /></a></div></footer>
    </main>
  );
}
