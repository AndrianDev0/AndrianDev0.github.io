"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Check, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useLanguage } from "./i18n";
import { siteConfig } from "./site";
import { submitProjectRequest } from "./submit";
import { ThemeToggle } from "./theme";
import { HeroVisual } from "./hero-visual";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      node.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: 0.14 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()} style={{ "--reveal-delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: React.ReactNode; copy?: string }) {
  return (
    <div className="section-heading">
      <Reveal><p className="eyebrow"><span />{eyebrow}</p></Reveal>
      <Reveal delay={0.05}><h2>{title}</h2></Reveal>
      {copy ? <Reveal delay={0.1}><p className="section-copy">{copy}</p></Reveal> : null}
    </div>
  );
}

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let frame = 0;
    let current = window.scrollY > 30;
    setScrolled(current);
    const paint = () => {
      const next = window.scrollY > 30;
      if (next !== current) {
        current = next;
        setScrolled(next);
      }
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="skip-link" href="#main-content">{language === "ru" ? "Перейти к содержимому" : "Skip to content"}</a>
      <nav className="nav-shell" aria-label={t.navigation}>
        <a className="brand" href="#top" aria-label={`${siteConfig.name} home`}><span className="brand-mark"><i /></span><span className="brand-word">{siteConfig.name}</span></a>
        <div className="nav-links">{siteConfig.nav.map((item, index) => <a key={item.href} href={item.href}>{t.nav[index]}</a>)}</div>
        <div className="nav-actions">
          <div className="language-switcher" role="group" aria-label="Language / Язык">
            <button type="button" className={language === "en" ? "is-active" : ""} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
            <button type="button" className={language === "ru" ? "is-active" : ""} aria-pressed={language === "ru"} onClick={() => setLanguage("ru")}>RU</button>
          </div>
          <ThemeToggle language={language} />
          <a className="nav-cta" href="#contact">{t.startProject} <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.9} /></a>
        </div>
        <button type="button" className="menu-button" aria-label={open ? t.closeMenu : t.openMenu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>
      {open ? (
          <div id="mobile-navigation" className="mobile-menu">
            {siteConfig.nav.map((item, index) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{t.nav[index]}</a>)}
            <a className="mobile-menu-cta" href="#contact" onClick={() => setOpen(false)}>{t.startProject} <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.9} /></a>
          </div>
        ) : null}
    </header>
  );
}

export { HeroVisual } from "./hero-visual";

export function Hero() {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const section = ref.current;
    const visual = visualRef.current;
    const cue = cueRef.current;
    if (!section || !visual || !cue) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(bounds.height - window.innerHeight * 0.25, 1);
      const progress = Math.min(1, Math.max(0, -bounds.top / travel));
      if (window.innerWidth > 900 && !reducedMotion.matches) {
        const opacity = progress <= 0.15 ? 1 : Math.max(0, 1 - (progress - 0.15) / 0.7);
        visual.style.transform = `translate3d(0, ${progress * 24}px, 0)`;
        visual.style.opacity = String(opacity);
        cue.style.opacity = String(Math.max(0, 1 - progress / 0.25));
      } else {
        visual.style.removeProperty("transform");
        visual.style.removeProperty("opacity");
        cue.style.removeProperty("opacity");
      }
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero-noise" />
      <div className="container hero-layout">
        <div className="hero-copy">
          <p className="hero-label hero-enter hero-enter-label"><span className="hero-label-dot" />{t.hero.label}</p>
          <h1>
            <span className="hero-line-mask"><span className="hero-line hero-line-one">{language === "ru" ? "Сайты и" : "Websites and"}</span></span>
            <span className="hero-line-mask"><span className="hero-line hero-line-two">{language === "ru" ? <><em>Telegram-боты</em></> : <><em>Telegram bots</em></>}</span></span>
            <span className="hero-line-mask"><span className="hero-line hero-line-three">{language === "ru" ? "для реальных задач." : "for real work."}</span></span>
          </h1>
          <p className="hero-subtitle hero-enter hero-enter-subtitle">{t.hero.subtitle}</p>
          <div className="hero-actions hero-enter hero-enter-actions"><a className="button button-primary" href="#contact">{t.startProject} <ArrowRight size={18} /></a><a className="button button-ghost" href="#work">{t.hero.viewWork} <span>↓</span></a></div>
          <div className="hero-trust hero-enter hero-enter-trust"><span>{t.hero.trust[0]}</span><i /><span>{t.hero.trust[1]}</span><i /><span>{t.hero.trust[2]}</span><i /><span>{t.hero.trust[3]}</span></div>
        </div>
        <div className="hero-visual-wrap" ref={visualRef}><HeroVisual /></div>
      </div>
      <a className="scroll-cue" href="#work" ref={cueRef}><span>{t.hero.scroll}</span><ArrowDown aria-hidden="true" size={15} /></a>
    </section>
  );
}

export function ContactForm() {
  const { language, t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [hasCustomBudget, setHasCustomBudget] = useState(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage("");
    const form = new FormData(formElement);
    const selectedBudget = String(form.get("budget") ?? "");
    const customBudget = String(form.get("customBudget") ?? "").trim();
    try {
      const result = await submitProjectRequest({
        name: String(form.get("name") ?? ""),
        contact: String(form.get("contact") ?? ""),
        projectDescription: String(form.get("projectDescription") ?? ""),
        budget: selectedBudget === "custom" ? customBudget : selectedBudget,
        website: String(form.get("website") ?? ""),
      });
      if (!result.ok) throw new Error("SUBMISSION_FAILED");
      formElement.reset();
      setHasCustomBudget(false);
      setStatus("success");
    } catch (error) {
      setMessage(error instanceof Error && error.message === "MISSING_FIELDS" ? t.form.incomplete : t.form.error);
      setStatus("error");
    }
  };
  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-busy={status === "loading"}>
      <label className="form-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      <div className="field-row"><label><span>{t.form.name} *</span><input name="name" autoComplete="name" required maxLength={100} placeholder={t.form.namePlaceholder} /></label><label><span>{t.form.contact} *</span><input name="contact" autoComplete="email" required maxLength={150} placeholder={t.form.contactPlaceholder} /></label></div>
      <label><span>{t.form.need} *</span><textarea name="projectDescription" required maxLength={3000} rows={5} placeholder={t.form.needPlaceholder} /></label>
      <label>
        <span>{t.form.budget}</span>
        <select
          name="budget"
          defaultValue=""
          onChange={(event) => setHasCustomBudget(event.currentTarget.value === "custom")}
          aria-controls={hasCustomBudget ? "custom-budget" : undefined}
        >
          <option value="">{t.form.budgetPlaceholder}</option>
          {siteConfig.budgets.map((budget) => <option key={budget.value} value={budget.value}>{budget[language]}</option>)}
        </select>
      </label>
      {hasCustomBudget ? (
        <label id="custom-budget">
          <span>{t.form.customBudget} *</span>
          <input name="customBudget" inputMode="text" required maxLength={80} placeholder={t.form.customBudgetPlaceholder} />
        </label>
      ) : null}
      <button className="submit-button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? <><span className="spinner" /> {t.form.sending}</> : <>{t.form.send} <ArrowUpRight size={19} /></>}
      </button>
      <div className="form-feedback" aria-live="polite">{status === "success" ? <span className="success-message"><i><Check aria-hidden="true" size={16} /></i><span><b>{t.form.sent}</b>{t.form.followUp}</span></span> : status === "error" ? <span className="error-message">{message}</span> : null}</div>
    </form>
  );
}
