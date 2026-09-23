import { ArrowRight, Gift, Send, ShieldCheck, Sparkles } from "lucide-react";
import type { PortfolioHighlight, Project, ProjectKind } from "./projects";

export function ProjectVisual({ project }: { project: Project }) {
  if (project.kind === "bot") return <NeboProjectVisual />;
  if (project.kind === "app") return <NeboMiniAppVisual />;
  return <NeboBotFlowVisual />;
}

export function PortfolioHighlightVisual({ project, context: _context = "card" }: { project: PortfolioHighlight; context?: "card" | "case" }) {
  if (project.visual === "drop") {
    return (
      <figure className="selected-work-visual drop-project-visual">
        <img src="/projects/drop-air-force-1.webp" width="1440" height="900" alt="Главный экран интерактивного 3D-концепта DROP с моделью Air Force 1" loading="lazy" decoding="async" />
        <figcaption><span>REAL-TIME 3D</span><b>SCROLL / INTERACTION</b></figcaption>
      </figure>
    );
  }

  if (project.visual === "tehnotek") {
    return (
      <figure className="selected-work-visual tehnotek-project-visual">
        <img src="/projects/tehnotek-prototype.webp" width="1280" height="720" alt="Прототип продуктовой страницы ТЕХНОТЭК для инженерного производства" loading="lazy" decoding="async" />
        <figcaption><span>INDUSTRIAL B2B</span><b>WORKING PROTOTYPE</b></figcaption>
      </figure>
    );
  }

  if (project.visual === "simka") {
    return (
      <figure className="selected-work-visual simka-project-visual">
        <img src="/projects/simka-store.png" width="1280" height="720" alt="Публичная витрина тарифов SIM и eSIM магазина SIMKA" loading="lazy" decoding="async" />
        <figcaption><span>TRAVEL CONNECTIVITY</span><b>CATALOGUE / CHECKOUT</b></figcaption>
      </figure>
    );
  }

  return (
    <div className="selected-work-visual trainer-project-visual" role="img" aria-label="Схема Telegram MVP: диагностика, 30-дневная программа, прогресс и быстрая поддержка">
      <div className="trainer-rail"><span>DIAGNOSIS</span><i /><span>ACCESS</span><i /><span>DAY 01—30</span></div>
      <div className="trainer-phone">
        <div className="trainer-phone-head"><span>07 / 30</span><i /><b>AI SUPPORT</b></div>
        <div className="trainer-progress"><i /></div>
        <div className="trainer-message"><small>ВЕЧЕРНЯЯ РЕФЛЕКСИЯ</small><strong>Что сегодня помогло<br />вернуть опору?</strong></div>
        <div className="trainer-actions"><span>Записать ответ</span><span><ShieldCheck size={14} /> ОПОРА СЕЙЧАС</span></div>
      </div>
      <span className="trainer-note">PERSONAL FLOW / SAVED PROGRESS</span>
    </div>
  );
}

function WindowBar({ address = "preview.dev" }: { address?: string }) {
  return <div className="mock-window-bar"><span className="traffic"><i /><i /><i /></span><span className="address">{address}</span><span className="window-more">•••</span></div>;
}

function NeboWheel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`nebo-wheel${compact ? " is-compact" : ""}`} aria-label="Колесо призов Nebo Bistro">
      <span className="nebo-wheel-pointer" />
      <div className="nebo-wheel-face">
        <span className="nebo-sector-label sector-one">5%</span>
        <span className="nebo-sector-label sector-two">10%</span>
        <span className="nebo-sector-label sector-three">15%</span>
        <span className="nebo-sector-label sector-four">20%</span>
        <span className="nebo-sector-label sector-five">25%</span>
        <span className="nebo-sector-label sector-six">10%</span>
        <span className="nebo-sector-label sector-seven">15%</span>
        <span className="nebo-sector-label sector-eight">20%</span>
        <span className="nebo-wheel-hub"><Sparkles size={compact ? 12 : 15} /><b>NEBO</b></span>
      </div>
    </div>
  );
}

function BotDevice() {
  return (
    <div className="nebo-device nebo-device-bot">
      <span className="nebo-device-speaker" />
      <div className="nebo-telegram-head">
        <ArrowRight className="nebo-phone-back" size={15} />
        <span className="nebo-telegram-avatar">N</span>
        <span><b>Nebo Bistro</b><small>бот</small></span>
        <i>•••</i>
      </div>
      <div className="nebo-bot-chat">
        <span className="nebo-chat-date">СЕГОДНЯ</span>
        <div className="nebo-welcome-art" role="img" aria-label="Приветственный экран Nebo Bistro" />
        <div className="nebo-bot-message">
          <b>Добро пожаловать!</b>
          <span>Ваш подарок уже ждёт — откройте Mini App и испытайте удачу.</span>
        </div>
        <div className="nebo-bot-action"><Gift size={12} /> Забрать свой приз</div>
        <span className="nebo-bot-handle">@NeboBistroBot</span>
      </div>
      <div className="nebo-phone-input"><span>Сообщение</span><Send size={12} /></div>
    </div>
  );
}

function MiniAppDevice() {
  return (
    <div className="nebo-device nebo-device-app">
      <span className="nebo-device-speaker" />
      <div className="nebo-miniapp-head"><span>MINI APP</span><b>NEBO BISTRO</b><i>×</i></div>
      <div className="nebo-miniapp-body">
        <span className="nebo-miniapp-kicker">ВАШ ПОДАРОК</span>
        <strong>Испытайте<br />удачу</strong>
        <NeboWheel compact />
        <span className="nebo-spin-button">КРУТИТЬ</span>
      </div>
    </div>
  );
}

export function NeboProjectVisual() {
  return (
    <div className="bot-showcase nebo-showcase nebo-showcase-main" aria-hidden="true">
      <div className="nebo-stage-grid" />
      <div className="nebo-showcase-head">
        <span><i /> LIVE PRODUCT</span>
        <b>TELEGRAM EXPERIENCE / 2026</b>
      </div>
      <div className="nebo-route" aria-hidden="true">
        <span>/START</span><i /><span>BOT</span><i /><span>MINI APP</span><i /><span>PRIZE</span>
      </div>
      <BotDevice />
      <MiniAppDevice />
      <div className="nebo-prize-card">
        <span><Gift size={12} /> ПРИЗ ПОЛУЧЕН</span>
        <strong>Покажите экран<br />официанту</strong>
        <i>REDEEM IN VENUE</i>
      </div>
      <span className="nebo-detail-label detail-one">START → BOT</span>
      <span className="nebo-detail-label detail-two">WHEEL → PRIZE</span>
    </div>
  );
}

export function NeboMiniAppVisual() {
  return (
    <div className="project-browser nebo-layer-browser" aria-hidden="true">
      <WindowBar address="nebo-bistro-wheel.app" />
      <div className="nebo-layer nebo-miniapp-layer">
        <div className="nebo-layer-copy">
          <span>MINI APP / PRODUCT LAYER</span>
          <h3>Один спин.<br /><em>Один подарок.</em></h3>
          <p>Mobile reward experience inside Telegram.</p>
          <div className="nebo-layer-tags"><span>TELEGRAM WEBAPP</span><span>ПРИЗЫ / СКИДКИ</span></div>
        </div>
        <div className="nebo-wheel-plinth">
          <span className="nebo-plinth-glow" />
          <NeboWheel />
          <span className="nebo-layer-spin">КРУТИТЬ <ArrowRight size={12} /></span>
        </div>
      </div>
    </div>
  );
}

export function NeboBotFlowVisual() {
  return (
    <div className="project-browser nebo-layer-browser" aria-hidden="true">
      <WindowBar address="t.me/NeboBistroBot" />
      <div className="nebo-layer nebo-flow-layer">
        <div className="nebo-flow-top">
          <span><i /> TELEGRAM BOT / GUEST ENTRY</span>
          <b>@NeboBistroBot</b>
        </div>
        <div className="nebo-flow-canvas">
          <div className="nebo-welcome-tile" role="img" aria-label="Приветственный креатив Nebo Bistro"><span>PERSONAL WELCOME</span></div>
          <div className="nebo-flow-line"><i /><i /><i /></div>
          <div className="nebo-flow-message">
            <span className="nebo-telegram-avatar">N</span>
            <div><small>NEBO BISTRO</small><strong>Ваш подарок<br />уже ждёт</strong><span><Gift size={11} /> Забрать свой приз</span></div>
          </div>
        </div>
        <div className="nebo-flow-steps">
          <span><b>01</b> Telegram /start</span><i />
          <span><b>02</b> Приветствие</span><i />
          <span><b>03</b> Mini App</span><i />
          <span><b>04</b> Экран приза</span>
        </div>
      </div>
    </div>
  );
}

export function CaseStudyVisual({ kind }: { kind: ProjectKind }) {
  if (kind === "bot") return <NeboProjectVisual />;
  if (kind === "app") return <NeboMiniAppVisual />;
  return <NeboBotFlowVisual />;
}
