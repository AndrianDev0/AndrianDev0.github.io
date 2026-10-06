"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useLanguage } from "./i18n";
import { selectFeaturedProject } from "./featured-project";
import { heroProjectDetails } from "./hero-project-details";
import { ProjectIcon, technologyIcons, technologyLinks } from "./project-icon";
import "./styles/hero-studio.css";

const heroProjects = [
  { id: "nebo", title: "NEBO BISTRO", href: "/projects/nebo-bistro", external: false },
  { id: "drop", title: "DROP / AIR FORCE 1", href: "/projects/drop-3d-store", external: false },
  { id: "tehnotek", title: "ТЕХНОТЭК", href: "/projects/tehnotek-prototype", external: false },
  { id: "simka", title: "SIMKA STORE", href: "/projects/simka-store", external: false },
] as const;

function ProjectMedia({ id, ru, active }: { id: (typeof heroProjects)[number]["id"]; ru: boolean; active: boolean }) {
  if (id === "nebo") {
    return (
      <div className="hero-project-media hero-project-media-nebo">
        <figure className="nebo-proof-bot">
          <img src="/nebo/case/bot-welcome.webp" alt={ru ? "Реальный экран приветствия бота Nebo Bistro" : "Real Nebo Bistro bot welcome screen"} width="900" height="1956" loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} decoding="async" />
          <figcaption>01 / TELEGRAM BOT</figcaption>
        </figure>
        <figure className="nebo-proof-app">
          <img src="/nebo/case/prize-wheel.webp" alt={ru ? "Реальный экран Mini App с колесом призов" : "Real prize-wheel Mini App screen"} width="900" height="1956" loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} decoding="async" />
          <figcaption>02 / MINI APP</figcaption>
        </figure>
        <span className="nebo-proof-direction" aria-hidden="true"><ArrowRight size={16} /></span>
      </div>
    );
  }

  if (id === "drop") {
    return <div className="hero-project-media hero-project-image"><img src="/projects/drop-air-force-1.webp" alt={ru ? "Первый экран интерактивного 3D-концепта магазина DROP" : "First screen of the DROP interactive 3D store concept"} width="1440" height="900" loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} decoding="async" /></div>;
  }

  if (id === "tehnotek") {
    return <div className="hero-project-media hero-project-image hero-project-image-tehnotek"><img src="/projects/tehnotek-prototype.webp" alt={ru ? "Первый экран прототипа продуктовой страницы ТЕХНОТЭК" : "First screen of the TEHNOTEK product page prototype"} width="1280" height="720" loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} decoding="async" /></div>;
  }

  return <div className="hero-project-media hero-project-image hero-project-image-simka"><img src="/projects/simka-store.png" alt={ru ? "Витрина тарифов SIM и eSIM магазина SIMKA" : "SIMKA physical SIM and eSIM tariff storefront"} width="1280" height="720" loading={active ? "eager" : "lazy"} fetchPriority={active ? "high" : "auto"} decoding="async" /></div>;
}

export function HeroVisual() {
  const { language } = useLanguage();
  const ru = language === "ru";
  const [active, setActive] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const total = heroProjects.length;
  const move = (direction: number) => setActive((current) => (current + direction + total) % total);

  useEffect(() => {
    selectFeaturedProject(heroProjects[active].id);
  }, [active]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick.current = true;
      move(dx < 0 ? 1 : -1);
    }
  };

  return (
    <section
      className="hero-project-carousel"
      aria-roledescription="carousel"
      aria-label={ru ? "Избранные проекты" : "Selected projects"}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.preventDefault();
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
    >
      <div className="hero-project-viewport"
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            suppressClick.current = false;
          }
        }}
      >
        {heroProjects.map((project, index) => {
          const isActive = index === active;
          const projectHref = !project.external && language === "en" ? `/en${project.href}` : project.href;
          const status = project.id === "tehnotek" ? (ru ? "ПРОТОТИП" : "PROTOTYPE") : project.id === "nebo" ? (ru ? "РЕАЛЬНЫЙ ПРОЕКТ" : "REAL PROJECT") : project.id === "simka" ? (ru ? "ПУБЛИЧНОЕ ДЕМО" : "PUBLIC DEMO") : (ru ? "РАБОЧИЙ КОНЦЕПТ" : "LIVE CONCEPT");
          return (
            <article className={`hero-project-slide hero-project-slide-${project.id}${isActive ? " is-active" : ""}`} aria-hidden={!isActive} key={project.id}>
              <a className="hero-project-frame" href={projectHref} target={project.external ? "_blank" : undefined} rel={project.external ? "noreferrer" : undefined} tabIndex={isActive ? 0 : -1}>
                <div className="hero-project-top">
                  <span><i />{status}</span>
                  <span>{project.id === "nebo" ? <>BOT <ArrowRight aria-hidden="true" size={12} /> MINI APP</> : project.id === "drop" ? "THREE.JS / WEBGL" : project.id === "tehnotek" ? "B2B / PRODUCT PAGE" : "ECOMMERCE / FULL STACK"}</span>
                </div>
                <ProjectMedia id={project.id} ru={ru} active={isActive} />
                <div className="hero-project-footer">
                  <div><strong>{project.title}</strong><span>{project.id === "nebo" ? (ru ? "Привлечение гостей · реклама партнёров" : "Customer acquisition · partner promotion") : project.id === "drop" ? (ru ? "3D-витрина продукта" : "3D product storefront") : project.id === "tehnotek" ? (ru ? "Инженерная продуктовая страница" : "Industrial product page") : (ru ? "Магазин SIM и eSIM для поездок" : "Travel SIM and eSIM storefront")}</span></div>
                  <span className="hero-project-open">{ru ? "Смотреть кейс" : "View case"}<ArrowUpRight aria-hidden="true" size={16} /></span>
                </div>
              </a>
            </article>
          );
        })}
      </div>
      <div className="hero-project-controls">
        <span className="hero-project-count">{String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <div className="hero-project-dots" aria-label={ru ? "Выбрать проект" : "Choose a project"}>
          {heroProjects.map((project, index) => <button type="button" key={project.id} aria-label={`${ru ? "Показать" : "Show"} ${project.title}`} aria-pressed={index === active} onClick={() => setActive(index)} />)}
        </div>
        <div className="hero-project-arrows">
          <button type="button" onClick={() => move(-1)} aria-label={ru ? "Предыдущий проект" : "Previous project"}><ArrowLeft aria-hidden="true" size={17} /></button>
          <button type="button" onClick={() => move(1)} aria-label={ru ? "Следующий проект" : "Next project"}><ArrowRight aria-hidden="true" size={17} /></button>
        </div>
      </div>
      <div className="hero-project-details" aria-live="polite" aria-atomic="true">
        {heroProjects.map((project, index) => {
          const details = heroProjectDetails[project.id];
          const copy = details[ru ? "ru" : "en"];
          return (
            <div key={project.id} className={`hero-project-detail${index === active ? " is-active" : ""}`} aria-hidden={index !== active} data-project={project.id}>
              <span className="sr-only">{project.title}. </span>
              <dl>
                <div className="hero-project-brief">
                  <dt><span className="hero-detail-icon"><ProjectIcon name={details.icon} /></span>{ru ? "Задача проекта" : "The brief"}</dt>
                  <dd>{copy.task}</dd>
                </div>
                <div className="hero-project-delivered">
                  <dt><ProjectIcon name="tools" />{ru ? "Что сделано" : "The work"}</dt>
                  <dd>{copy.delivered}</dd>
                </div>
              </dl>
              <div className="hero-project-stack">
                <span>{ru ? "Технологии" : "Technologies"}</span>
                <ul aria-label={ru ? "Технологии проекта" : "Project technologies"}>
                  {details.tech.map((technology) => <li key={technology}>
                    <a className={`stack-key stack-key-${technologyIcons[technology]}`} href={technologyLinks[technology]}
                      target="_blank" rel="noopener noreferrer" tabIndex={index === active ? 0 : -1}
                      aria-label={`${technology}: ${ru ? "официальный сайт, новая вкладка" : "official website, new tab"}`}>
                      <ProjectIcon name={technologyIcons[technology]} category="stack" />
                      <span className="stack-key-label">{technology}</span>
                    </a>
                  </li>)}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
