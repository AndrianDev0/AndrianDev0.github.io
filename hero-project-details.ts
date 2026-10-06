import type { FeaturedProjectId } from "./featured-project";
import type { ProjectIconName, TechnologyName } from "./project-icon";

type ProjectDetails = {
  icon: ProjectIconName;
  ru: { task: string; delivered: string };
  en: { task: string; delivered: string };
  tech: TechnologyName[];
};

export const heroProjectDetails: Record<FeaturedProjectId, ProjectDetails> = {
  nebo: {
    icon: "tools-kitchen-2",
    ru: {
      task: "Привести гостей в ресторан через Telegram и познакомить их с предложениями партнёров.",
      delivered: "Путь от QR-кода к боту и Mini App. Колесо призов, персональное приветствие и экран награды, который гость показывает официанту.",
    },
    en: {
      task: "Bring guests to the restaurant through Telegram and introduce partner offers.",
      delivered: "A QR-to-bot-to-Mini-App flow, a prize wheel, a personal greeting and a reward screen guests show to their waiter.",
    },
    tech: ["React", "Telegram WebApp", "Cloudflare D1"],
  },
  drop: {
    icon: "shoe",
    ru: {
      task: "Показать кроссовки в движении и связать 3D-презентацию с выбором товара.",
      delivered: "Интерактивная 3D-модель, три расцветки, выбор размера и корзина. Рабочий концепт магазина, без заявлений о реальных продажах.",
    },
    en: {
      task: "Show the sneakers in motion and connect the 3D presentation to product selection.",
      delivered: "An interactive 3D model, three colourways, size selection and a cart. A working store concept, not a claim of real sales.",
    },
    tech: ["React", "Three.js", "WebGL"],
  },
  tehnotek: {
    icon: "settings",
    ru: {
      task: "Объяснить возможности производства и привести заказчика с технической задачей к заявке.",
      delivered: "Прототип B2B-страницы: инженерные решения, реализованный узел, этапы работы и форма с приложением ТЗ или чертежа.",
    },
    en: {
      task: "Explain the manufacturing capabilities and guide buyers from a technical problem to an enquiry.",
      delivered: "A B2B page prototype with engineering solutions, a completed assembly, work stages and a form for a brief or drawing.",
    },
    tech: ["React", "TypeScript", "Tailwind CSS"],
  },
  simka: {
    icon: "world",
    ru: {
      task: "Помочь путешественнику подобрать SIM или eSIM по стране и оформить заказ.",
      delivered: "Каталог и фильтры, корзина, личный кабинет и Telegram-бот. Заказы обрабатывает сервер; оплату подтверждает менеджер.",
    },
    en: {
      task: "Help travellers choose a SIM or eSIM for their destination and place an order.",
      delivered: "A catalogue, filters, cart, customer account and Telegram bot. Orders are handled by the server; a manager confirms payment.",
    },
    tech: ["Next.js", "PostgreSQL", "Telegram Bot"],
  },
};
