const visualContent = {
  browser: {
    src: "/projects/tehnotek-prototype.webp",
    small: "/projects/tehnotek-prototype.webp",
    label: { ru: "ТЕХНОТЭК / ПРОТОТИП", en: "TEHNOTEK / PROTOTYPE" },
    index: "01",
  },
  chat: {
    src: "/projects/nebo-assets/case/bot-welcome.webp",
    small: "/projects/nebo-assets/case/bot-welcome.webp",
    label: { ru: "NEBO BISTRO / БОТ", en: "NEBO BISTRO / BOT" },
    index: "02",
  },
  dashboard: {
    src: "/projects/simka-store.png",
    small: "/projects/simka-store.png",
    label: { ru: "SIMKA STORE / ВЕБ-ПРОДУКТ", en: "SIMKA STORE / WEB PRODUCT" },
    index: "03",
  },
} as const;

export function ServiceVisual({ type, language }: { type: string; language: "ru" | "en" }) {
  if (type === "nodes") {
    return (
      <div className="service-flow" aria-hidden="true">
        <span className="service-flow-kicker">{language === "ru" ? "ЛОГИКА / ИНТЕГРАЦИЯ" : "LOGIC / INTEGRATION"}</span>
        <div className="service-flow-track">
          <span>{language === "ru" ? "Заявка" : "Lead"}</span><i /><span>{language === "ru" ? "Бот" : "Bot"}</span><i /><span>CRM</span>
        </div>
        <span className="service-flow-caption">{language === "ru" ? "От первого действия до результата" : "From first action to outcome"}</span>
      </div>
    );
  }
  const content = visualContent[type as keyof typeof visualContent] ?? visualContent.browser;

  return (
    <div className={`service-photo service-photo-${type}`} aria-hidden="true">
      <img
        src={content.src}
        srcSet={content.small === content.src ? undefined : `${content.small} 640w, ${content.src} 1200w`}
        sizes="(max-width: 600px) calc(100vw - 80px), (max-width: 900px) 42vw, 360px"
        alt=""
        width="1200"
        height="800"
        loading="lazy"
        decoding="async"
      />
      <span className="service-photo-label">{content.label[language]}</span>
      <span className="service-photo-index">{content.index}</span>
    </div>
  );
}
