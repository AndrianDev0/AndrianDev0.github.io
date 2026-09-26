export const siteConfig = {
  name: "Andrian.Dev",
  fullName: "ANDRIAN.DEV",
  url: "https://andriandev0.github.io",
  title: "Разработка сайтов и Telegram-ботов — Andrian.Dev",
  description: "Создаю сайты, Telegram-ботов, веб-приложения и автоматизацию для бизнеса: от структуры и интерфейса до интеграций, тестирования и запуска.",
  telegram: "qweJSq",
  email: "maa190186@gmail.com",
  budgets: [
    { value: "5 000–10 000 ₽", en: "₽5,000–10,000", ru: "5 000–10 000 ₽" },
    { value: "10 000–20 000 ₽", en: "₽10,000–20,000", ru: "10 000–20 000 ₽" },
    { value: "20 000–50 000 ₽", en: "₽20,000–50,000", ru: "20 000–50 000 ₽" },
    { value: "custom", en: "Custom amount", ru: "Свой вариант" },
  ],
  nav: [
    { href: "#work" },
    { href: "#services" },
    { href: "#process" },
    { href: "#about" },
    { href: "#contact" },
  ],
} as const;

export function estimateTelegramUrl(projectType: string) {
  const message = [
    "Здравствуйте!",
    "",
    "Хочу получить оценку проекта.",
    `Что нужно: ${projectType}`,
    "Кратко о задаче: [опишите идею или цель]",
    "Примерный бюджет: [укажите сумму]",
    "Желаемый срок: [укажите срок]",
  ].join("\n");

  return `https://t.me/${siteConfig.telegram}?text=${encodeURIComponent(message)}`;
}

export const metrics = [
  { value: "04" },
  { value: "02" },
  { value: "100%" },
];
