"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ru";

const copy = {
  en: {
    nav: ["Work", "Services", "Process", "About", "Contact"],
    startProject: "Start a Project",
    navigation: "Primary navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    hero: {
      label: "ANDRIAN.DEV / WEB DEVELOPMENT",
      subtitle: "I design and build websites, Telegram bots and web apps — with clear scope, working features and a launch-ready result.",
      viewWork: "View My Work",
      trust: ["Websites", "Telegram Bots", "Web Apps", "Automation"],
      scroll: "SCROLL TO EXPLORE",
    },
    projects: {
      eyebrow: "FEATURED CASE",
      titleTop: "Selected work.",
      titleBottom: "Built with intent.",
      copy: "Live products, interactive prototypes, and new client work — shown honestly at their current stage.",
      real: "REAL PROJECT",
      view: "Explore the case",
      openTelegram: "Open @NeboBistroBot",
      openMiniApp: "Open Mini App",
      layers: [
        ["Mini App interface", "A mobile prize experience embedded directly inside Telegram — no separate app required."],
        ["Bot flow", "The conversational entry point that welcomes the guest and connects them to the Mini App."],
      ],
    },
    services: {
      eyebrow: "WHAT I DO",
      titleTop: "Development built around",
      titleBottom: "business needs.",
      copy: "The interface is only one layer. I connect design, product logic, and the systems that make the result useful.",
      explore: "EXPLORE",
      items: [
        ["Web Development", "Landing pages, corporate websites, and custom builds with a clear conversion path."],
        ["Telegram Bots", "Lead capture, sales flows, support, subscriptions, catalogs, alerts, and CRM workflows."],
        ["Web Apps", "Dashboards, client accounts, internal systems, and focused web services."],
        ["Automation", "APIs, CRM, Telegram, notifications, and integrations that remove repetitive work."],
      ],
    },
    benefits: {
      eyebrow: "WHY WORK WITH ME",
      title: "Strong products begin with",
      titleAccent: "the right decisions.",
      copy: "I keep every phase connected to the outcome — so visual polish, technical choices, and business goals reinforce each other.",
      items: [
        ["More Than Code", "I start with the problem the product needs to solve — then choose the right interface and technology."],
        ["User-Focused", "Structure and interaction should feel clear without instructions, even when the system behind them is complex."],
        ["Mobile First", "Every key flow is shaped for small screens, real touch targets, and changing contexts."],
        ["End-to-End", "Design direction, development, integrations, testing, and launch stay connected from the first decision."],
        ["Built to Scale", "Clean data and component structures make the next feature easier to add, not harder."],
      ],
    },
    process: {
      eyebrow: "PROCESS",
      titleTop: "From idea",
      titleBottom: "to launch.",
      copy: "A clear path keeps the important decisions visible and prevents surprises late in the project.",
      phase: "PHASE",
      items: [
        ["Discovery", "We discuss the idea, goals, constraints, and the result the product needs to create."],
        ["Analysis", "I define the structure, functionality, priorities, and key user flows."],
        ["Design", "We shape a visual direction that fits the business and makes the product easy to understand."],
        ["Development", "I build the interface, integrations, and core functionality as one coherent system."],
        ["Testing", "Desktop, mobile, edge states, and the scenarios that matter most are checked before release."],
        ["Launch", "The finished product goes live with a clean handoff and a path for future iteration."],
      ],
    },
    technologies: { eyebrow: "TECHNOLOGIES", copyTop: "Reliable tools, chosen for the product —", copyBottom: "not for the trend." },
    about: {
      eyebrow: "ABOUT",
      sideTop: "BASED ONLINE",
      sideBottom: "AVAILABLE WORLDWIDE",
      intro: "I build digital products for businesses. My goal is not just to write code, but to create",
      accent: "clear, fast, visually strong products",
      tail: "that solve real problems.",
      metrics: ["selected works", "product formats", "responsive interface"],
    },
    contact: {
      eyebrow: "START A PROJECT",
      question: "Have a project idea?",
      titleTop: "Let’s turn it into a",
      titleAccent: "working product.",
      copy: "Tell me what you need — I’ll suggest the right way to build it.",
      ready: "READY WHEN YOU ARE",
      telegram: "Message on Telegram",
      available: "AVAILABLE FOR NEW PROJECTS",
    },
    form: {
      name: "Name",
      namePlaceholder: "Your name",
      contact: "Telegram / Email",
      contactPlaceholder: "@username or email",
      need: "What do you need built?",
      needPlaceholder: "A short description of the product, goal, or problem…",
      budget: "Approximate budget",
      budgetPlaceholder: "Select a range (optional)",
      customBudget: "Your budget",
      customBudgetPlaceholder: "For example, ₽35,000",
      send: "Send Request",
      sending: "Sending…",
      sent: "Request sent",
      followUp: "I’ll contact you using the details above.",
      incomplete: "Please complete the required fields.",
      error: "Something went wrong. Please try again.",
    },
    footer: { navigation: "Footer navigation", crafted: "DESIGNED & BUILT WITH INTENT", back: "BACK TO TOP" },
    case: {
      allWork: "All work",
      featured: "FEATURED CASE",
      real: "REAL PROJECT",
      label: "CASE STUDY",
      note: "A live Telegram acquisition campaign where the bot, Mini App, restaurant, and sponsors form one connected guest journey.",
      openTelegram: "Open @NeboBistroBot",
      openMiniApp: "Open live Mini App",
      challengeLabel: "CHALLENGE",
      challengeTitle: "New guests, sponsor visibility, and campaign traffic.",
      solutionLabel: "SOLUTION",
      solutionTitle: "Bot, Mini App, and data as one flow.",
      resultLabel: "RESULT",
      resultTitle: "A live acquisition and sponsor channel.",
      points: ["Personalized Telegram onboarding", "Restaurant and sponsor rewards", "Protected control panel"],
      galleryEyebrow: "REAL PRODUCT SCREENS",
      galleryTitle: "The complete guest journey.",
      galleryCopy: "These are production screens from the Telegram bot and Mini App — from the first touchpoint to the sponsor reward handoff.",
      galleryCaptions: ["Bot start screen", "Telegram welcome flow", "Restaurant and sponsor prize wheel", "Prize result and redemption"],
      similar: "NEED SOMETHING SIMILAR?",
      nextTop: "Let’s build a product",
      nextBottom: "that earns attention.",
      talk: "Let’s Talk",
    },
  },
  ru: {
    nav: ["Проекты", "Услуги", "Процесс", "Обо мне", "Контакты"],
    startProject: "Обсудить проект",
    navigation: "Основная навигация",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    hero: {
      label: "ANDRIAN.DEV / РАЗРАБОТКА",
      subtitle: "Делаю сайты, Telegram-ботов и веб-приложения: от понятной задачи до работающего продукта.",
      viewWork: "Смотреть работы",
      trust: ["Сайты", "Telegram-боты", "Веб-приложения", "Автоматизация"],
      scroll: "ЛИСТАЙТЕ ДАЛЬШЕ",
    },
    projects: {
      eyebrow: "РЕАЛЬНЫЙ КЕЙС",
      titleTop: "Избранные работы.",
      titleBottom: "Без выдуманных цифр.",
      copy: "Запущенные продукты, интерактивные прототипы и новые клиентские задачи — с честным обозначением текущего этапа.",
      real: "РЕАЛЬНЫЙ ПРОЕКТ",
      view: "Разобрать кейс",
      openTelegram: "Открыть @NeboBistroBot",
      openMiniApp: "Открыть Mini App",
      layers: [
        ["Интерфейс Mini App", "Мобильная механика с призами прямо внутри Telegram — без отдельного приложения."],
        ["Сценарий бота", "Диалоговый вход, который приветствует гостя и связывает его с Mini App."],
      ],
    },
    services: {
      eyebrow: "ЧТО Я ДЕЛАЮ",
      titleTop: "Разработка вокруг",
      titleBottom: "задач бизнеса.",
      copy: "Интерфейс — только один слой. Я соединяю дизайн, продуктовую логику и системы, которые делают результат полезным.",
      explore: "ПОДРОБНЕЕ",
      items: [
        ["Веб-разработка", "Лендинги, корпоративные сайты и нестандартные проекты с понятным путём к целевому действию."],
        ["Telegram-боты", "Сбор заявок, продажи, поддержка, подписки, каталоги, уведомления и работа с CRM."],
        ["Веб-приложения", "Дашборды, личные кабинеты, внутренние системы и специализированные веб-сервисы."],
        ["Автоматизация", "API, CRM, Telegram, уведомления и интеграции, которые убирают рутинную работу."],
      ],
    },
    benefits: {
      eyebrow: "ПОЧЕМУ СО МНОЙ РАБОТАЮТ",
      title: "Сильный продукт начинается с",
      titleAccent: "верных решений.",
      copy: "Связываю каждый этап с результатом, чтобы визуальный уровень, технологии и цели бизнеса усиливали друг друга.",
      items: [
        ["Больше, чем код", "Сначала разбираюсь, какую задачу должен решить продукт, а затем выбираю подходящий интерфейс и технологии."],
        ["Фокус на пользователе", "Структура и взаимодействие должны быть понятны без инструкций, даже если внутри работает сложная система."],
        ["Сначала мобильные", "Ключевые сценарии проектируются для небольших экранов, реальных касаний и разных условий использования."],
        ["От идеи до запуска", "Дизайн, разработка, интеграции, тестирование и запуск остаются связаны с первого решения."],
        ["Готово к развитию", "Чистая структура данных и компонентов упрощает добавление новых функций в будущем."],
      ],
    },
    process: {
      eyebrow: "ПРОЦЕСС",
      titleTop: "От идеи",
      titleBottom: "до запуска.",
      copy: "Понятный процесс сохраняет важные решения на виду и исключает неприятные сюрпризы ближе к релизу.",
      phase: "ЭТАП",
      items: [
        ["Знакомство", "Обсуждаем идею, цели, ограничения и результат, который должен дать продукт."],
        ["Анализ", "Определяю структуру, функциональность, приоритеты и основные пользовательские сценарии."],
        ["Дизайн", "Создаём визуальное направление, которое подходит бизнесу и делает продукт понятным."],
        ["Разработка", "Собираю интерфейс, интеграции и основную функциональность в единую систему."],
        ["Тестирование", "Проверяю десктоп, мобильные устройства, пограничные состояния и ключевые сценарии."],
        ["Запуск", "Готовый продукт выходит в работу с понятной передачей и возможностью дальнейшего развития."],
      ],
    },
    technologies: { eyebrow: "ТЕХНОЛОГИИ", copyTop: "Надёжные инструменты под задачу —", copyBottom: "а не ради тренда." },
    about: {
      eyebrow: "ОБО МНЕ",
      sideTop: "РАБОТАЮ ОНЛАЙН",
      sideBottom: "ПО ВСЕМУ МИРУ",
      intro: "Создаю цифровые продукты для бизнеса. Моя цель — не просто написать код, а сделать",
      accent: "понятный, быстрый и визуально сильный продукт",
      tail: "который решает реальную задачу.",
      metrics: ["избранные работы", "формата продукта", "адаптивный интерфейс"],
    },
    contact: {
      eyebrow: "ОБСУДИТЬ ПРОЕКТ",
      question: "Есть идея проекта?",
      titleTop: "Давайте превратим её в",
      titleAccent: "работающий продукт.",
      copy: "Расскажите, что вам нужно — предложу подходящий способ реализации.",
      ready: "МОЖНО НАЧИНАТЬ",
      telegram: "Написать в Telegram",
      available: "ОТКРЫТ ДЛЯ НОВЫХ ПРОЕКТОВ",
    },
    form: {
      name: "Имя",
      namePlaceholder: "Как к вам обращаться",
      contact: "Telegram / Email",
      contactPlaceholder: "@username или email",
      need: "Что нужно разработать?",
      needPlaceholder: "Коротко опишите продукт, цель или задачу…",
      budget: "Примерный бюджет",
      budgetPlaceholder: "Выберите диапазон (необязательно)",
      customBudget: "Ваш бюджет",
      customBudgetPlaceholder: "Например, 35 000 ₽",
      send: "Отправить заявку",
      sending: "Отправляем…",
      sent: "Заявка отправлена",
      followUp: "Я свяжусь с вами по указанному контакту.",
      incomplete: "Заполните обязательные поля.",
      error: "Не удалось отправить заявку. Попробуйте ещё раз.",
    },
    footer: { navigation: "Навигация в подвале", crafted: "ПРОДУМАНО И РАЗРАБОТАНО", back: "НАВЕРХ" },
    case: {
      allWork: "Все проекты",
      featured: "ФЛАГМАНСКИЙ КЕЙС",
      real: "РЕАЛЬНЫЙ ПРОЕКТ",
      label: "КЕЙС",
      note: "Рабочая Telegram-промомеханика для привлечения новых гостей и рекламы партнёров ресторана.",
      openTelegram: "Открыть @NeboBistroBot",
      openMiniApp: "Открыть Mini App",
      challengeLabel: "ЗАДАЧА",
      challengeTitle: "Новые гости, реклама партнёров и нагрузка кампании.",
      solutionLabel: "РЕШЕНИЕ",
      solutionTitle: "Бот, Mini App и данные как единый сценарий.",
      resultLabel: "РЕЗУЛЬТАТ",
      resultTitle: "Рабочий канал привлечения и рекламы партнёров.",
      points: ["Персональное приветствие в Telegram", "Призы ресторана и рекламных партнёров", "Защищённая панель управления"],
      galleryEyebrow: "РЕАЛЬНЫЕ ЭКРАНЫ ПРОДУКТА",
      galleryTitle: "Полный путь гостя.",
      galleryCopy: "Рабочие экраны Telegram-бота и Mini App — от первого запуска до выдачи подарка рекламного партнёра.",
      galleryCaptions: ["Старт бота", "Приветствие в Telegram", "Колесо призов ресторана и партнёров", "Результат и получение подарка"],
      similar: "НУЖЕН ПОХОЖИЙ ПРОЕКТ?",
      nextTop: "Давайте создадим продукт,",
      nextBottom: "который заслужит внимание.",
      talk: "Обсудить проект",
    },
  },
} as const;

type Copy = (typeof copy)[Language];

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Copy;
} | null>(null);

export function LanguageProvider({ children, initialLanguage = "ru" }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // The root provider also wraps English routes. Keep the document language
    // tied to the URL while nested English providers render their own copy.
    const documentLanguage = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/") ? "en" : language;
    document.documentElement.lang = documentLanguage;
    document.documentElement.dataset.language = documentLanguage;
  }, [language]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try { window.localStorage.setItem("portfolio-language", next); } catch { /* Storage may be unavailable. */ }
    const path = window.location.pathname;
    const hash = window.location.hash;
    const isProject = path.replace(/^\/en(?=\/|$)/, "").startsWith("/projects/");
    const target = next === "en"
      ? (isProject ? `/en${path.replace(/^\/en/, "")}` : "/en")
      : (isProject ? path.replace(/^\/en/, "") : "/");
    if (target !== path) window.location.assign(`${target}${hash || "#top"}`);
  };

  const value = useMemo(() => ({ language, setLanguage, t: copy[language] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export const projectRussian: Record<string, { category: string; description: string; challenge: string; solution: string; result: string }> = {
  "nebo-bistro": {
    category: "Telegram-бот + Mini App",
    description: "Рабочая кампания для привлечения новых гостей: знакомство в Telegram, призы ресторана и рекламных партнёров, понятная выдача выигрыша в заведении.",
    challenge: "Привлечь новых гостей и органично встроить рекламу спонсоров в короткий Telegram-сценарий. Во время запуска первоначальное размещение на Vercel упёрлось в ограничения под нагрузкой, поэтому продукт пришлось сделать устойчивее без усложнения пути гостя.",
    solution: "Бот персонально приветствует гостя и открывает мобильный Mini App, где колесо объединяет призы ресторана и партнёров. Данные работают через Cloudflare D1, а защищённая панель управляет контентом и доступом команды.",
    result: "Запущенный канал привлечения и рекламы партнёров: знакомство в Telegram, розыгрыш, экран подарка спонсора и понятная выдача приза в заведении.",
  },
  "drop-3d-store": {
    category: "Интерактивный 3D-концепт магазина",
    description: "Иммерсивная витрина кроссовок с 3D-моделью в реальном времени, сценарной прокруткой, тремя версиями товара и адаптивным выбором покупки.",
    challenge: "Превратить знакомый товар в запоминающуюся цифровую презентацию, сохранив понятный выбор и путь к покупке. На небольших экранах история должна работать даже при упрощённой 3D-сцене.",
    solution: "Продукт становится главным героем интерфейса: сцена на Three.js, управляемая прокруткой композиция, три визуальные версии и прямой переход от знакомства к выбору. Адаптивные состояния сохраняют сценарий и снижают графическую нагрузку на мобильных устройствах.",
    result: "Рабочий e-commerce-концепт показывает полный сценарий на компьютере и телефоне: знакомство с продуктом, переключение версий, взаимодействие и понятное решение о покупке.",
  },
  "tehnotek-prototype": {
    category: "Прототип продуктовой B2B-страницы",
    description: "Рабочий прототип страницы для инженерного производства: техническое позиционирование, производственный кейс, понятный путь к заявке и передача ТЗ или чертежа.",
    challenge: "Объяснить сложное производственное предложение лицу, принимающему решение, не превращая страницу в перегруженный каталог характеристик. Путь к заявке должен подходить и для первого обращения, и для клиента с готовым ТЗ.",
    solution: "Прототип последовательно разделяет позиционирование, возможности производства, подтверждающий кейс и форму обращения. Технические файлы можно передать именно в момент, когда посетитель готов обсуждать изготовление.",
    result: "Адаптивный рабочий прототип показывает, как промышленная компания может понятно представить компетенции, подтвердить доверие реальным процессом и получить более содержательную заявку.",
  },
  "simka-store": {
    category: "Платформа для продажи SIM и eSIM",
    description: "Полноценный магазин связи для путешествий: подбор тарифов по странам и операторам, оформление, доставка физических SIM, выдача eSIM и управление заказами через Telegram.",
    challenge: "Сделать большой каталог тарифов понятным и одновременно поддержать два разных сценария: мгновенную выдачу eSIM и доставку физических SIM-карт с отслеживанием.",
    solution: "Платформа объединяет каталог по странам и операторам, проверяемое сервером оформление, оплату криптовалютой или через менеджера, выдачу товара и Telegram-бота с ролевым доступом для команды.",
    result: "Подготовлена production-архитектура магазина и публичная витрина: заказы, доставка, выдача eSIM, аналитика, партнёрская атрибуция, резервные копии и поддержка работают как единая система.",
  },
};
