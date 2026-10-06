"use client";

import { ArrowRight, ArrowUpRight, Check, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { estimateTelegramUrl, siteConfig } from "./site";
import { absoluteSiteUrl, getServiceBySlug, seoServices, serviceRoutePath } from "./site-registry";
import { ThemeToggle } from "./theme";

export type SeoServicePage = (typeof seoServices)[number];

export default function ServicePageApp({ slug }: { slug: string }) {
  const service = getServiceBySlug(slug);

  useEffect(() => {
    if (!service) return;
    document.title = service.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", service.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", absoluteSiteUrl(serviceRoutePath(service.slug)));
  }, [service]);

  if (!service) {
    return (
      <main className="route-error">
        <p>404</p>
        <h1>Страница не найдена</h1>
        <a href="/">Вернуться на Andrian.Dev</a>
      </main>
    );
  }

  const telegramUrl = `https://t.me/${siteConfig.telegram}`;
  const estimateUrl = estimateTelegramUrl(service.h1);

  return (
    <div className="seo-page">
      <header className="seo-header">
        <nav className="seo-nav container" aria-label="Навигация по услугам">
          <a className="brand" href="/" aria-label="Andrian.Dev — главная">
            <span className="brand-mark"><i /></span>
            <span className="brand-word">{siteConfig.name}</span>
          </a>
          <div className="seo-nav-links">
            <a href="/#work">Кейс</a>
            <a href="/#services">Услуги</a>
            <a href="/#process">Процесс</a>
            <a href="/#contact">Контакты</a>
          </div>
          <div className="seo-nav-actions">
            <a className="seo-language-link" href="/en#services" aria-label="Open English version">EN</a>
            <span className="seo-language-current" aria-label="Текущий язык — русский">RU</span>
            <ThemeToggle />
            <a className="nav-cta" href="/#contact">Обсудить проект <ArrowUpRight aria-hidden="true" size={16} /></a>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className="seo-hero">
          <div className="container seo-hero-layout">
            <div className="seo-hero-copy">
              <nav className="seo-breadcrumbs" aria-label="Хлебные крошки">
                <a href="/">Главная</a><span aria-hidden="true">/</span><span>Услуги</span>
              </nav>
              <p className="eyebrow"><span />{service.eyebrow}</p>
              <h1>{service.h1}</h1>
              <p className="seo-lead">{service.lead}</p>
              <div className="seo-hero-actions">
                <a className="button button-primary" href="/#contact">Обсудить задачу <ArrowRight aria-hidden="true" size={18} /></a>
                <a className="button button-ghost" href={telegramUrl} target="_blank" rel="noreferrer">Написать в Telegram <ExternalLink aria-hidden="true" size={16} /></a>
              </div>
            </div>
            <aside className="seo-hero-panel" aria-label="Состав разработки">
              <span>ANDRIAN.DEV / SERVICE</span>
              <strong>ЗАДАЧА<br />→ ПРОДУКТ</strong>
              <div><span>01 Анализ</span><span>02 Интерфейс</span><span>03 Разработка</span><span>04 Запуск</span></div>
            </aside>
          </div>
        </section>

        <section className="seo-section seo-overview" aria-labelledby="seo-overview-title">
          <div className="container">
            <div className="seo-section-heading">
              <p className="eyebrow"><span />ВОЗМОЖНОСТИ</p>
              <h2 id="seo-overview-title">{service.overviewTitle}</h2>
            </div>
            <div className="seo-feature-grid">
              {service.features.map((feature, index) => (
                <article key={feature.title}>
                  <span>0{index + 1}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-section seo-includes" aria-labelledby="seo-includes-title">
          <div className="container seo-includes-layout">
            <div>
              <p className="eyebrow"><span />СОСТАВ РАБОТ</p>
              <h2 id="seo-includes-title">{service.includesTitle}</h2>
            </div>
            <ul>
              {service.includes.map((item) => <li key={item}><Check aria-hidden="true" size={17} /><span>{item}</span></li>)}
            </ul>
          </div>
        </section>

        <section className="seo-section seo-process" aria-labelledby="seo-process-title">
          <div className="container">
            <div className="seo-section-heading">
              <p className="eyebrow"><span />ПРОЦЕСС</p>
              <h2 id="seo-process-title">{service.processTitle}</h2>
            </div>
            <ol className="seo-process-grid">
              {service.process.map((step, index) => (
                <li key={step.title}>
                  <span>ЭТАП 0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="seo-section seo-pricing" aria-labelledby="seo-pricing-title">
          <div className="container seo-pricing-card">
            <div><p className="eyebrow"><span />ОЦЕНКА ПРОЕКТА</p><h2 id="seo-pricing-title">{service.pricingTitle}</h2></div>
            <p>{service.pricingText}</p>
            <a href={estimateUrl} target="_blank" rel="noreferrer">Получить оценку <ArrowUpRight aria-hidden="true" size={17} /></a>
          </div>
        </section>

        {service.slug === "telegram-boty" ? (
          <section className="seo-section seo-case-callout" aria-labelledby="seo-case-title">
            <div className="container seo-case-card">
              <div><p className="eyebrow"><span />РЕАЛЬНЫЙ КЕЙС</p><h2 id="seo-case-title">Telegram-бот и Mini App для Nebo Bistro</h2></div>
              <p>Работающий ресторанный сценарий: персональное приветствие, колесо призов внутри Telegram и защищённая панель управления.</p>
              <a href="/projects/nebo-bistro">Посмотреть кейс <ArrowRight aria-hidden="true" size={17} /></a>
            </div>
          </section>
        ) : null}

        <section className="seo-section seo-faq" aria-labelledby="seo-faq-title">
          <div className="container seo-faq-layout">
            <div>
              <p className="eyebrow"><span />FAQ</p>
              <h2 id="seo-faq-title">Частые вопросы</h2>
              <p>Короткие ответы о составе, оценке и запуске проекта.</p>
            </div>
            <div className="seo-faq-list">
              {service.faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-related" aria-labelledby="seo-related-title">
          <div className="container">
            <span>СЛЕДУЮЩАЯ УСЛУГА</span>
            <a href={`/${service.relatedSlug}`}><h2 id="seo-related-title">{service.relatedLabel}</h2><ArrowUpRight aria-hidden="true" /></a>
          </div>
        </section>

        <section className="seo-cta" aria-labelledby="seo-cta-title">
          <div className="container">
            <p className="eyebrow"><span />ОБСУДИТЬ ПРОЕКТ</p>
            <h2 id="seo-cta-title">Расскажите, что нужно сделать.</h2>
            <p>Предложу подходящий формат реализации и понятный следующий шаг.</p>
            <a className="button button-primary" href="/#contact">Перейти к заявке <ArrowRight aria-hidden="true" size={18} /></a>
          </div>
        </section>
      </main>

      <footer className="seo-footer">
        <div className="container">
          <a className="footer-brand" href="/"><span />{siteConfig.name}</a>
          <div className="seo-footer-links">
            {seoServices.map((item) => <a key={item.slug} href={serviceRoutePath(item.slug)}>{item.h1}</a>)}
          </div>
          <div><a href={telegramUrl} target="_blank" rel="noreferrer">Telegram <ArrowUpRight aria-hidden="true" size={14} /></a><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
        </div>
      </footer>
    </div>
  );
}
