"use client";

import { ArrowRight, ArrowUpRight, CircleDot, Code2, Layers3, MoveUpRight, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { benefits, processSteps, services, technologies } from "./content";
import { metrics, siteConfig } from "./site";
import { portfolioHighlights, projectFacets, projects } from "./projects";
import { ContactForm, Reveal, SectionHeading } from "./components";
import { MagneticButton } from "./magnetic-button";
import { projectRussian, useLanguage } from "./i18n";
import { NeboBotFlowVisual, NeboMiniAppVisual, PortfolioHighlightVisual, ProjectVisual } from "./visuals";
import { ServiceVisual } from "./service-visual";
import { ShinyText } from "./react-bits";
import { featuredProjectEvent, type FeaturedProjectId } from "./featured-project";
import "./styles/services.css";
import "./styles/selected-work.css";

export function ProjectsSection() {
  const { language, t } = useLanguage();
  const project = projects[0];
  const localized = projectRussian[project.slug];
  const facetVisuals = [<NeboMiniAppVisual key="mini-app" />, <NeboBotFlowVisual key="bot-flow" />];
  const [selectedProject, setSelectedProject] = useState<FeaturedProjectId>("nebo");
  const selectedHighlight = selectedProject === "nebo" ? undefined : portfolioHighlights.find((item) => item.visual === selectedProject);
  const detail = selectedHighlight
    ? {
        id: selectedHighlight.id,
        slug: selectedHighlight.slug,
        title: selectedHighlight.title,
        category: selectedHighlight.category[language],
        description: selectedHighlight.description[language],
        highlights: selectedHighlight.highlights[language],
        status: selectedHighlight.status[language],
        technologies: selectedHighlight.technologies,
        accent: selectedHighlight.accent,
        liveUrl: selectedHighlight.liveUrl,
      }
    : {
        id: project.id,
        slug: project.slug,
        title: project.title,
        category: language === "ru" ? localized.category : project.category,
        description: language === "ru" ? localized.description : project.description,
        highlights: [],
        status: t.projects.real,
        technologies: project.technologies,
        accent: project.accent,
        liveUrl: project.liveUrl,
      };

  useEffect(() => {
    const onProjectChange = (event: Event) => {
      const projectId = (event as CustomEvent<FeaturedProjectId>).detail;
      if (projectId === "nebo" || projectId === "drop" || projectId === "tehnotek" || projectId === "simka") setSelectedProject(projectId);
    };
    window.addEventListener(featuredProjectEvent, onProjectChange);
    return () => window.removeEventListener(featuredProjectEvent, onProjectChange);
  }, []);

  return (
    <section id="work" className="projects section-pad">
      <div className="container">
        <SectionHeading eyebrow={t.projects.eyebrow} title={<>{t.projects.titleTop}<br /><span className="soft">{t.projects.titleBottom}</span></>} copy={t.projects.copy} />
        <div className="project-list project-list-single">
          <Reveal className="project-reveal">
            <article className={`project-card project-${selectedHighlight ? "website" : project.kind} project-flagship project-detail-${selectedProject}`} style={{ "--project-accent": detail.accent } as React.CSSProperties} aria-live="polite">
              <div className="project-meta">
                <div className="project-index"><span>{detail.id}</span><i /></div>
                <div>
                  <p>{detail.category.toUpperCase()}</p>
                  <h3>{detail.title}</h3>
                  <span className={`demo-label ${selectedHighlight ? "project-status-label" : "live-label"}`}><i />{detail.status}</span>
                  <p className="project-description">{detail.description}</p>
                  {detail.highlights.length > 0 && <ul className="project-highlights" aria-label={language === "ru" ? "Ключевые элементы проекта" : "Project highlights"}>{detail.highlights.map((highlight) => <li key={highlight}><i />{highlight}</li>)}</ul>}
                  <div className="tech-list">{detail.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
                  <div className="project-actions">
                    {selectedHighlight ? (
                      <>
                        <a className="case-link" href={`${language === "en" ? "/en" : ""}/projects/${detail.slug}`}>{language === "ru" ? "Разобрать кейс" : "View case"} <ArrowUpRight size={17} /></a>
                        <a className="case-link case-link-live" href={detail.liveUrl} target="_blank" rel="noreferrer">{language === "ru" ? "Открыть проект" : "Open project"} <ArrowUpRight size={17} /></a>
                      </>
                    ) : (
                      <>
                        <a className="case-link" href={`${language === "en" ? "/en" : ""}/projects/${detail.slug}`}>{t.projects.view} <ArrowUpRight size={17} /></a>
                        <a className="case-link case-link-live" href={detail.liveUrl} target="_blank" rel="noreferrer">{t.projects.openTelegram} <ArrowUpRight size={17} /></a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Reveal className={`project-visual-shell project-visual-reveal${selectedHighlight ? " project-highlight-shell" : ""}`}>
                {selectedHighlight ? <PortfolioHighlightVisual project={selectedHighlight} context="case" /> : <ProjectVisual project={project} />}
              </Reveal>
            </article>
          </Reveal>
          {selectedProject === "nebo" && <div className="project-layers">
            {projectFacets.map((facet, index) => (
              <Reveal key={facet.key} delay={index * 0.06} className="project-layer-reveal">
                <article className="project-layer-card" id={facet.key}>
                  <div className="project-layer-heading"><span>{facet.id}</span><p>{facet.label}</p></div>
                  <div className="project-layer-copy"><h3>{t.projects.layers[index][0]}</h3><p>{t.projects.layers[index][1]}</p></div>
                  <div className="project-layer-visual">{facetVisuals[index]}</div>
                </article>
              </Reveal>
            ))}
          </div>}
          <div className="selected-work-head" id="more-work">
            <p className="eyebrow"><span />{language === "ru" ? "ДРУГИЕ РАБОТЫ" : "OTHER SELECTED WORK"}</p>
            <p>{language === "ru" ? "Рабочие продукты, публичные демо и проекты в разработке — без выдуманных результатов и скрытых статусов." : "Working products, public demos, and in-progress builds, with real scope and every status shown clearly."}</p>
          </div>
          <div className="selected-work-grid">
            {portfolioHighlights.map((item, index) => {
              const projectExists = projects.some((projectItem) => projectItem.slug === item.slug);
              const content = (
                <article id={`project-${item.visual}-case`} className={`selected-work-card selected-work-${item.visual}`} style={{ "--project-accent": item.accent } as React.CSSProperties}>
                  <div className="selected-work-topline"><span>{item.id}</span><i /><span>{item.status[language]}</span></div>
                  <PortfolioHighlightVisual project={item} />
                  <div className="selected-work-copy">
                    <p>{item.category[language].toUpperCase()}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description[language]}</p>
                    <div className="tech-list">{item.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
                    <span className="selected-work-link">
                      {projectExists ? (language === "ru" ? "Разобрать кейс" : "View case") : (language === "ru" ? "Проектируется" : "In design")}
                      {projectExists && <ArrowUpRight aria-hidden="true" size={17} />}
                    </span>
                  </div>
                </article>
              );
              const caseHref = `${language === "en" ? "/en" : ""}/projects/${item.slug}`;
              return <Reveal key={item.slug} delay={index * 0.08} className="selected-work-reveal">{projectExists ? <a className="selected-work-anchor" href={caseHref} aria-label={`${language === "ru" ? "Разобрать кейс" : "View case"}: ${item.title}`}>{content}</a> : content}</Reveal>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  const { language, t } = useLanguage();
  return (
    <section id="services" className="services section-pad">
      <div className="container">
        <SectionHeading eyebrow={t.services.eyebrow} title={<>{t.services.titleTop}<br /><span className="soft">{t.services.titleBottom}</span></>} copy={t.services.copy} />
        <div className="services-grid">
          {services.map((service, index) => <Reveal key={service.id} delay={index * 0.04} className={`service-item service-${index + 1}`}><article><div className="service-number"><span>{service.id}</span><i /></div><div className="service-text"><h3>{t.services.items[index][0]}</h3><p>{t.services.items[index][1]}</p><a className="service-more" href={language === "ru" ? service.href : "#contact"}>{t.services.explore} <ArrowRight aria-hidden="true" size={14} /></a></div><div className="service-visual"><ServiceVisual type={service.visual} /></div></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

const benefitIcons = [<Sparkles key="sparkles" />, <CircleDot key="circle" />, <MoveUpRight key="move" />, <Layers3 key="layers" />, <Code2 key="code" />];

export function BenefitsSection() {
  const { t } = useLanguage();
  return (
    <section className="benefits section-pad-sm">
      <div className="container benefits-layout">
        <div className="benefits-intro"><p className="eyebrow"><span />{t.benefits.eyebrow}</p><h2>{t.benefits.title} <em>{t.benefits.titleAccent}</em></h2><p>{t.benefits.copy}</p></div>
        <div className="benefit-list">{benefits.map((benefit, index) => <Reveal key={benefit.id} delay={index * 0.035}><article><span className="benefit-icon">{benefitIcons[index]}</span><span className="benefit-number">0{index + 1}</span><div><h3>{t.benefits.items[index][0]}</h3><p>{t.benefits.items[index][1]}</p></div></article></Reveal>)}</div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timeline = ref.current;
    if (!timeline) return;
    const line = timeline.querySelector<HTMLElement>(".timeline-line i");
    const steps = [...timeline.querySelectorAll<HTMLElement>(".timeline-step")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const paint = () => {
      if (line) {
        const bounds = timeline.getBoundingClientRect();
        const progress = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.5 - bounds.top) / Math.max(bounds.height, 1)));
        line.style.transform = `scaleY(${progress})`;
      }
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }
    }, { threshold: 0.55 });

    if (reducedMotion.matches) steps.forEach((step) => step.classList.add("is-visible"));
    else steps.forEach((step) => observer.observe(step));
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section id="process" className="process section-pad">
      <div className="container">
        <SectionHeading eyebrow={t.process.eyebrow} title={<>{t.process.titleTop}<br /><span className="soft">{t.process.titleBottom}</span></>} copy={t.process.copy} />
        <div className="timeline" ref={ref}><div className="timeline-line"><i /></div>{processSteps.map((step, index) => <article key={step.id} className="timeline-step"><span className="timeline-index">{step.id}</span><span className="timeline-dot"><i /></span><div><h3>{t.process.items[index][0]}</h3><p>{t.process.items[index][1]}</p></div><span className="timeline-phase">{t.process.phase} {index + 1}</span></article>)}</div>
      </div>
    </section>
  );
}

export function TechnologiesSection() {
  const { t } = useLanguage();
  const first = technologies.slice(0, 6);
  const second = technologies.slice(6);
  return (
    <section className="technologies section-pad-sm"><div className="container"><div className="tech-heading"><p className="eyebrow"><span />{t.technologies.eyebrow}</p><p>{t.technologies.copyTop}<br /><ShinyText text={t.technologies.copyBottom} /></p></div><div className="tech-rows"><div>{first.map((tech) => <span key={tech}>{tech}</span>)}</div><div>{second.map((tech) => <span key={tech}>{tech}</span>)}</div></div></div></section>
  );
}

export function Marquee() {
  const { language } = useLanguage();
  const text = language === "ru" ? "ВЕБ-РАЗРАБОТКА • TELEGRAM-БОТЫ • ВЕБ-ПРИЛОЖЕНИЯ • АВТОМАТИЗАЦИЯ • API • ДИЗАЙН • РАЗРАБОТКА • " : "WEB DEVELOPMENT • TELEGRAM BOTS • WEB APPS • AUTOMATION • API • DESIGN • DEVELOPMENT • ";
  return <div className="marquee" aria-hidden="true"><div><span>{text}</span><span>{text}</span></div></div>;
}

export function AboutSection() {
  const { t } = useLanguage();
  return (
    <section id="about" className="about section-pad"><div className="container"><div className="about-top"><p className="eyebrow"><span />{t.about.eyebrow}</p><span className="about-side">{t.about.sideTop}<br />{t.about.sideBottom}</span></div><Reveal><p className="about-statement">{t.about.intro} <em>{t.about.accent}</em> {t.about.tail}</p></Reveal><div className="metrics">{metrics.map((metric, index) => <Reveal key={metric.value} delay={index * 0.07}><div><strong>{metric.value}</strong><span>{t.about.metrics[index]}</span></div></Reveal>)}</div></div></section>
  );
}

export function ContactSection() {
  const { t } = useLanguage();
  const telegramUrl = `https://t.me/${siteConfig.telegram.replace(/^@/, "")}`;
  return (
    <section id="contact" className="contact section-pad"><div className="contact-orb" /><div className="container"><div className="contact-heading"><p className="eyebrow"><span />{t.contact.eyebrow}</p><Reveal><h2>{t.contact.question}</h2></Reveal><Reveal delay={0.06}><h2 className="outline-line">{t.contact.titleTop}<br /><em>{t.contact.titleAccent}</em></h2></Reveal><p>{t.contact.copy}</p></div><div className="contact-layout"><div className="contact-direct"><span>{t.contact.ready}</span><MagneticButton href={telegramUrl} external className="telegram-button">{t.contact.telegram} <Send size={18} /></MagneticButton><a href={`mailto:${siteConfig.email}`}>{siteConfig.email} <ArrowUpRight size={16} /></a><div className="availability"><i /> {t.contact.available}</div></div><ContactForm /></div></div></section>
  );
}

export function Footer() {
  const { t } = useLanguage();
  return <footer><div className="container footer-main"><a className="footer-brand" href="#top"><span />{siteConfig.name}</a><nav aria-label={t.footer.navigation}>{siteConfig.nav.filter((item) => item.href !== "#about").map((item) => <a key={item.href} href={item.href}>{t.nav[siteConfig.nav.findIndex((navItem) => navItem.href === item.href)]}</a>)}</nav><div><a className="footer-social-link" href={`https://t.me/${siteConfig.telegram}`} target="_blank" rel="noreferrer"><span>Telegram</span><i><ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} /></i></a><a className="footer-social-link" href={`mailto:${siteConfig.email}`}><span>Email</span><i><ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} /></i></a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><span>{t.footer.crafted}</span><a href="#top">{t.footer.back} ↑</a></div></footer>;
}
