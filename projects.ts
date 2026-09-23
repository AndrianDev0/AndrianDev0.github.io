export type ProjectKind = "website" | "bot" | "app";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  kind: ProjectKind;
  accent: string;
  liveUrl: string;
  previewUrl: string;
  challenge: string;
  solution: string;
  result: string;
};

export type PortfolioHighlight = {
  id: string;
  slug: string;
  title: string;
  category: { en: string; ru: string };
  description: { en: string; ru: string };
  highlights: { en: string[]; ru: string[] };
  status: { en: string; ru: string };
  technologies: string[];
  accent: string;
  visual: "drop" | "tehnotek" | "trainer";
  liveUrl?: string;
};

export const projects: Project[] = [
  {
    id: "01",
    slug: "nebo-bistro",
    title: "NEBO BISTRO",
    category: "Telegram Bot + Mini App",
    description: "A live customer-acquisition campaign that connects Telegram onboarding, restaurant and sponsor rewards, and a clear in-venue handoff.",
    technologies: ["TypeScript", "Telegram WebApp", "Cloudflare D1"],
    kind: "bot",
    accent: "#6f8cff",
    liveUrl: "https://t.me/NeboBistroBot",
    previewUrl: "https://t.me/NeboBistroBot",
    challenge: "Attract new guests and give sponsors a visible but natural role inside a short Telegram promotion. During rollout, the initial Vercel deployment also hit load limits, so the product had to become more resilient without complicating the guest experience.",
    solution: "The bot greets each guest and opens a mobile-first Mini App whose prize wheel combines restaurant and sponsor rewards. The data layer uses Cloudflare D1, while a protected control panel manages content and team access.",
    result: "A deployed acquisition and sponsor-advertising channel: Telegram onboarding, prize interaction, partner result, and a clear in-venue handoff to the waiter.",
  },
  {
    id: "02",
    slug: "drop-3d-store",
    title: "DROP / AIR FORCE 1",
    category: "Interactive 3D Commerce Concept",
    description: "An art-directed sneaker storefront built around a real-time 3D product, scroll choreography, three editions, and a responsive purchase path.",
    technologies: ["React", "Three.js", "WebGL"],
    kind: "website",
    accent: "#7445ed",
    liveUrl: "https://sole-motion-public.vercel.app",
    previewUrl: "https://sole-motion-public.vercel.app",
    challenge: "Turn a familiar sneaker product into a memorable digital presentation without losing the clarity of selection and purchase. The experience also had to remain understandable when the 3D scene was reduced for smaller screens.",
    solution: "The interface makes the product the main character: a real-time Three.js scene, controlled scroll choreography, three visual editions, and a direct path from exploration to selection. Responsive states preserve the story while reducing graphical pressure on mobile devices.",
    result: "A working commerce concept that demonstrates the complete presentation logic across desktop and mobile: product discovery, edition switching, interaction, and a clear purchase decision.",
  },
  {
    id: "03",
    slug: "tehnotek-prototype",
    title: "ТЕХНОТЭК",
    category: "B2B Product Page Prototype",
    description: "A working industrial product-page prototype with technical positioning, manufacturing proof, a clear request path, and specification upload.",
    technologies: ["React", "Product UX", "Responsive"],
    kind: "website",
    accent: "#49b7ff",
    liveUrl: "https://tehnotek-prototype.vercel.app/",
    previewUrl: "https://tehnotek-prototype.vercel.app/",
    challenge: "Explain a technical manufacturing offer to decision-makers without turning the page into a dense specification sheet. The request path had to support both an early enquiry and a client who already has a drawing or technical brief.",
    solution: "The prototype separates positioning, capabilities, production proof, and the request flow into a clear reading sequence. Technical files can be attached at the point where the visitor is ready to discuss manufacturing.",
    result: "A responsive working prototype that shows how an industrial company can present expertise, build trust through a concrete case, and collect a more informed project request.",
  },
];

export const portfolioHighlights: PortfolioHighlight[] = [
  {
    id: "02",
    slug: "drop-3d-store",
    title: "DROP / AIR FORCE 1",
    category: {
      en: "Interactive 3D commerce concept",
      ru: "Интерактивный 3D-концепт магазина",
    },
    description: {
      en: "An art-directed sneaker storefront with a real-time 3D product, scroll choreography, three editions, and a responsive purchase flow.",
      ru: "Иммерсивная витрина кроссовок с 3D-моделью в реальном времени, сценарной прокруткой, тремя версиями товара и адаптивным выбором покупки.",
    },
    highlights: {
      en: ["Real-time Air Force 1 presentation", "Three editions with visual switching", "Scroll-led route from discovery to purchase"],
      ru: ["3D-презентация Air Force 1 в реальном времени", "Три версии товара с переключением образа", "Сценарий от знакомства до выбора покупки"],
    },
    status: { en: "LIVE CONCEPT", ru: "РАБОЧИЙ КОНЦЕПТ" },
    technologies: ["React", "Three.js", "WebGL"],
    accent: "#7445ed",
    visual: "drop",
    liveUrl: "https://sole-motion-public.vercel.app",
  },
  {
    id: "03",
    slug: "tehnotek-prototype",
    title: "ТЕХНОТЭК",
    category: {
      en: "B2B product page prototype",
      ru: "Прототип продуктовой B2B-страницы",
    },
    description: {
      en: "A working industrial product-page prototype: technical positioning, a manufacturing case, a clear request path, and a specification upload flow.",
      ru: "Рабочий прототип продуктовой страницы для инженерного производства: техническое позиционирование, производственный кейс, понятный путь к заявке и передача ТЗ или чертежа.",
    },
    highlights: {
      en: ["Technical offer explained without jargon", "Manufacturing proof placed near the decision", "Specification upload and request flow"],
      ru: ["Техническое предложение без перегруза терминами", "Производственный кейс рядом с точкой решения", "Передача ТЗ или чертежа вместе с заявкой"],
    },
    status: { en: "PROTOTYPE", ru: "ПРОТОТИП" },
    technologies: ["React", "Product UX", "Responsive"],
    accent: "#49b7ff",
    visual: "tehnotek",
    liveUrl: "https://tehnotek-prototype.vercel.app/",
  },
  {
    id: "04",
    slug: "ai-support-trainer",
    title: "AI SUPPORT / 30",
    category: {
      en: "Telegram product architecture",
      ru: "Проектирование Telegram-продукта",
    },
    description: {
      en: "An MVP structure for a guided 30-day program: interactive diagnosis, paid access, daily scenarios, progress tracking, and an instant-support mode.",
      ru: "Архитектура MVP для 30-дневной программы: интерактивная диагностика, оплата и доступ, ежедневные сценарии, сохранение прогресса и режим быстрой поддержки.",
    },
    highlights: { en: [], ru: [] },
    status: { en: "MVP IN DESIGN", ru: "MVP В ПРОЕКТИРОВАНИИ" },
    technologies: ["Telegram Bot", "AI", "Product Flow"],
    accent: "#61d6b3",
    visual: "trainer",
  },
];

export const projectFacets = [
  { id: "01A", key: "mini-app", label: "NEBO BISTRO / MINI APP" },
  { id: "01B", key: "bot-flow", label: "NEBO BISTRO / BOT FLOW" },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
