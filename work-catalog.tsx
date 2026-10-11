"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./i18n";
import { StickerBackdrop } from "./studio-stickers";
import { featuredProjectEvent } from "./featured-project";
import { workItems, type WorkItem } from "./work-catalog-data";
import "./styles/work-catalog.css";

type Filter = "all" | WorkItem["kind"];

function Preview({ project }: { project: WorkItem }) {
  const { language } = useLanguage();
  const [failed, setFailed] = useState(false);
  const artwork = project.imageKind === "artwork";
  if (project.image && !failed) return <figure className={`catalog-preview${artwork ? " catalog-preview-artwork" : ""}`}>
    <div className="catalog-browser-bar" aria-hidden="true"><span /><span /><span /><i>{project.name}</i></div>
    <img src={project.image} alt={`${artwork ? (language === "ru" ? "Персонаж сайта" : "Website character") : (language === "ru" ? "Сохранённое превью сайта" : "Saved website preview")}: ${project.name}`} width="1920" height="1080" loading="lazy" decoding="async" onError={() => setFailed(true)} />
    <figcaption>{artwork ? (language === "ru" ? "Персонаж сайта" : "Website character") : (language === "ru" ? "Превью проекта" : "Project preview")}</figcaption>
  </figure>;
  return <figure className={`catalog-scenario catalog-scenario-${project.id}`}>
    <figcaption>{failed ? (language === "ru" ? "Превью не загрузилось. Описание проекта доступно ниже." : "Preview unavailable. Project details are below.") : (language === "ru" ? "Схема работы · Не скриншот интерфейса" : "Workflow illustration · Not an interface screenshot")}</figcaption>
    <div className="catalog-scenario-title"><span>{project.kind === "bot" ? "Telegram" : "Web"}</span><strong>{project.name}</strong></div>
    <ol>{(project.flow ?? project.features).map((step, index) => <li key={step.en}><span>0{index + 1}</span><p>{step[language]}</p>{index < 2 && <i aria-hidden="true">↓</i>}</li>)}</ol>
  </figure>;
}

export function WorkCatalog() {
  const { language } = useLanguage();
  const ru = language === "ru";
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState("magia");
  const [expanded, setExpanded] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const shown = workItems.filter(item => filter === "all" || item.kind === filter);
  const selected = shown.find(item => item.id === selectedId) ?? shown[0];
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: ru ? "Все работы" : "All work" },
    { id: "website", label: ru ? "Сайты" : "Websites" },
    { id: "bot", label: ru ? "Telegram-боты" : "Telegram bots" },
  ];

  function pick(id: string) {
    setSelectedId(id);
    setExpanded(false);
    if (window.matchMedia("(max-width: 760px)").matches) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => {
        detailRef.current?.focus({ preventScroll: true });
        detailRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "instant" : "smooth" });
      });
    }
  }

  useEffect(() => {
    const onFeatured = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (workItems.some(item => item.id === id)) {
        setSelectedId(id);
        setFilter("all");
        setExpanded(false);
      }
    };
    window.addEventListener(featuredProjectEvent, onFeatured);
    return () => window.removeEventListener(featuredProjectEvent, onFeatured);
  }, []);

  return <section id="work" className="work-catalog section-pad">
    <div className="container">
      <header className="catalog-heading">
        <div><p className="catalog-kicker">{ru ? "Выбранные проекты" : "Selected projects"}</p><h2>{ru ? "Разные задачи." : "Different challenges."}<br /><span>{ru ? "Моя работа." : "My work."}</span></h2></div>
        <div className="catalog-heading-aside"><StickerBackdrop scene="work" /><p>{ru ? "От сайта курса до бота, который распределяет заказы. Выбери направление и посмотри, что сделано внутри." : "From a course website to a bot that assigns orders. Choose a category to see the work behind each project."}</p></div>
      </header>
      <div className="catalog-toolbar">
        <div className="catalog-filters" role="group" aria-label={ru ? "Направление проектов" : "Project category"}>
          {filters.map(item => <button type="button" key={item.id} aria-pressed={filter === item.id} aria-controls="catalog-project-list" onClick={() => { setFilter(item.id); setExpanded(false); }}>
            {item.label}<span>{workItems.filter(project => item.id === "all" || project.kind === item.id).length.toString().padStart(2, "0")}</span>
          </button>)}
        </div>
        <p role="status" aria-live="polite" aria-atomic="true">{ru ? `В подборке: ${shown.length} проектов` : `${shown.length} projects in this selection`}<span className="catalog-sr-only">. {ru ? "Выбран проект" : "Selected project"}: {selected.name}</span></p>
      </div>
      <div className="catalog-layout">
        <nav className="catalog-projects" id="catalog-project-list" aria-label={ru ? "Выбрать проект" : "Choose a project"}>
          {shown.map((project, index) => <button type="button" key={project.id} aria-pressed={selected.id === project.id} aria-controls="catalog-detail" onClick={() => pick(project.id)}>
            <span className="catalog-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="catalog-project-name"><strong>{project.name}</strong><small>{project.type[language]}</small></span>
            <span className="catalog-selection-mark" aria-hidden="true">↗</span>
          </button>)}
        </nav>
        <div ref={detailRef} id="catalog-detail" className="catalog-detail" tabIndex={-1} aria-label={`${ru ? "Описание проекта" : "Project details"}: ${selected.name}`}>
          <button className="catalog-back" type="button" onClick={() => {
            const button = document.querySelector<HTMLButtonElement>('.catalog-projects button[aria-pressed="true"]');
            button?.focus({ preventScroll: true });
            document.querySelector('.catalog-toolbar')?.scrollIntoView({ block: "start", behavior: "instant" });
          }}>{ru ? "↑ К списку проектов" : "↑ Back to projects"}</button>
          <article key={selected.id} className="catalog-case">
            <Preview project={selected} />
            <div className="catalog-case-body">
              <div className="catalog-case-type"><p>{selected.type[language]}</p><span>{selected.status[language]}</span></div>
              <h3>{selected.name}</h3>
              <p className="catalog-summary">{selected.summary[language]}</p>
              <ul className="catalog-features">{selected.features.map(feature => <li key={feature.en}>{feature[language]}</li>)}</ul>
              <div className="catalog-case-actions">
                <button type="button" aria-expanded={expanded} aria-controls="catalog-scope" onClick={() => setExpanded(current => !current)}>{expanded ? (ru ? "Свернуть детали" : "Hide details") : (ru ? "Что сделано" : "Scope of work")}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
                {selected.slug ? <a href={`${language === "en" ? "/en" : ""}/projects/${selected.slug}`}>{ru ? "Полный кейс" : "Full case"}<span aria-hidden="true">↗</span></a> : selected.href && <a href={selected.href} target="_blank" rel="noreferrer">{selected.kind === "bot" ? (ru ? "Открыть бота" : "Open bot") : (ru ? "Открыть сайт" : "Open website")}<span aria-hidden="true">↗</span></a>}
              </div>
              <div className="catalog-scope" id="catalog-scope" hidden={!expanded}>
                <p>{selected.note[language]}</p>
                <div className="catalog-stack" aria-label={ru ? "Технологии и компоненты" : "Technologies and components"}>{selected.stack.map(tech => <span key={tech}>{tech}</span>)}</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>;
}
