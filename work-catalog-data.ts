type Localized = { ru: string; en: string };
export type WorkItem = {
  id: string;
  kind: "website" | "bot";
  name: string;
  type: Localized;
  summary: Localized;
  status: Localized;
  note: Localized;
  features: [Localized, Localized, Localized];
  flow?: [Localized, Localized, Localized];
  image?: string;
  imageKind?: "artwork";
  href?: string;
  slug?: string;
  stack: string[];
};
const l = (ru: string, en: string): Localized => ({ ru, en });

// Project chats reviewed on 7 October 2026; NEBO website updated on 11 October.
export const workItems: WorkItem[] = [
  {
    id: "nebo-restaurant", kind: "website", name: "Ресторан NEBO",
    type: l("Меню, залы и бронирование", "Menu, spaces and booking"),
    summary: l("Сайт ресторана с тем самым мишкой: знакомство с атмосферой, выбор зала, просмотр меню и переход к бронированию.", "A restaurant website featuring its signature bear: explore the atmosphere, choose a space, browse the menu and proceed to booking."),
    status: l("Опубликован", "Published"),
    note: l("Адаптивный сайт с фотографиями ресторана, переключением меню, каруселью залов, картой и анимацией мишки. Отдельный проект от Telegram-бота NEBO BISTRO.", "A responsive website with restaurant photography, menu switching, a spaces carousel, a map and bear animation. A separate project from the NEBO BISTRO Telegram bot."),
    features: [l("Меню и фотографии ресторана", "Menu and restaurant photography"), l("Выбор зала и бронирование", "Space selection and booking"), l("Анимация персонажа и навигация", "Character animation and navigation")],
    image: "/projects/nebo-restaurant.webp", href: "https://andriandev0.github.io/nebo/", stack: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: "magia", kind: "website", name: "Магия прикосновений",
    type: l("Онлайн-курс · Разработка по Figma", "Online course · Figma implementation"),
    summary: l("От знакомства с автором до личного кабинета и доступа к урокам. Сайт курса с тарифами и управлением заявками.", "From meeting the author to an account and lesson access. A course website with pricing and application management."),
    status: l("Опубликован · Оплата дорабатывается", "Published · Payments in progress"),
    note: l("Доступ подтверждает администратор. Платёжные QR требуют замены; автоматическая оплата не заявляется.", "Access is approved by an administrator. Payment QR codes need replacing; automated payments are not claimed."),
    features: [l("Адаптивная вёрстка по макету", "Responsive Figma implementation"), l("Кабинет и закрытые уроки", "Account and restricted lessons"), l("Тарифы, заявки и админка", "Pricing, applications and admin tools")],
    image: "/projects/magia-course.jpg", href: "https://emilpsyteleska.ru/", stack: ["Figma", "HTML", "CSS", "JavaScript"],
  },
  {
    id: "simka", kind: "website", name: "SIMKA Store",
    type: l("Интернет-магазин · SIM и eSIM", "E-commerce · SIM and eSIM"),
    summary: l("Подбор связи для поездки: страны, тарифы, корзина и заказы. Управление магазином вынесено в Telegram.", "Travel connectivity with countries, plans, a cart and orders. Store operations are managed through Telegram."),
    status: l("Публичное демо", "Public demo"),
    note: l("Заказы обрабатывает сервер. Оплату подтверждает менеджер; витрина и серверная часть размещаются отдельно.", "Orders are handled by the server. A manager confirms payments; the storefront and backend are hosted separately."),
    features: [l("Каталог стран и тарифов", "Country and plan catalogue"), l("Оформление и обработка заказов", "Checkout and order processing"), l("Telegram-админка и аналитика", "Telegram admin tools and analytics")],
    image: "/projects/simka-store.png", href: "https://andriandev0.github.io/simka-store/", slug: "simka-store", stack: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: "money", kind: "bot", name: "Money Bot",
    type: l("Игровой бот · Mini App", "Game bot · Mini App"),
    summary: l("Игровая экономика внутри Telegram: профиль, бонусы, переводы, промокоды и покерный Mini App для нескольких игроков.", "A Telegram game economy with profiles, bonuses, transfers, promo codes and a multiplayer poker Mini App."),
    status: l("Развивается", "In active development"),
    note: l("Основная версия запускалась на VPS. Последние отдельные изменения подготовлены локально и требуют обновления сервера.", "The main version has run on a VPS. Some recent changes remain local and need a server update."),
    features: [l("Баланс и история операций", "Balance and transaction history"), l("Игры и покерный Mini App", "Games and poker Mini App"), l("Рефералы, промокоды и админка", "Referrals, promo codes and admin tools")],
    flow: [l("Профиль и игровой баланс", "Profile and game balance"), l("Игра в боте или Mini App", "Play in the bot or Mini App"), l("Результат и история", "Result and history")],
    href: "https://t.me/moneyfarmbotsbot", stack: ["Python", "aiogram", "SQLite", "Mini App"],
  },
  {
    id: "nebo", kind: "bot", name: "NEBO BISTRO",
    type: l("Ресторан · Telegram Mini App", "Restaurant · Telegram Mini App"),
    summary: l("Гость сканирует QR, открывает бота и вращает колесо в Mini App. Результат связывает гостя, ресторан и партнёров акции.", "Guests scan a QR, open the bot and spin a Mini App wheel connecting them with restaurant and partner rewards."),
    status: l("Реальный проект", "Real project"),
    note: l("Призы ресторана и партнёров, управление контентом и передача результата сотруднику заведения.", "Restaurant and partner rewards, content management and an in-venue handoff to staff."),
    features: [l("Вход через Telegram", "Telegram onboarding"), l("Колесо призов в Mini App", "Mini App prize wheel"), l("Контент и партнёрские награды", "Content and partner rewards")],
    flow: [l("Гость сканирует QR", "Guest scans a QR"), l("Открывает колесо призов", "Opens the reward wheel"), l("Показывает результат официанту", "Shows the result to staff")],
    href: "https://t.me/NeboBistroBot", slug: "nebo-bistro", stack: ["TypeScript", "Telegram WebApp", "Cloudflare D1"],
  },
  {
    id: "drop", kind: "website", name: "DROP / Air Force 1",
    type: l("3D-витрина · Интерактивный концепт", "3D storefront · Interactive concept"),
    summary: l("Кроссовок становится центром страницы: объёмная модель, смена расцветок и анимация по мере прокрутки.", "A sneaker takes centre stage with a real-time 3D model, edition switching and scroll-led animation."),
    status: l("Рабочий концепт", "Working concept"),
    note: l("Демонстрация интерфейса магазина и 3D-презентации. Не действующий магазин с реальными продажами.", "A storefront and 3D presentation concept, not a live retail operation."),
    features: [l("Интерактивная 3D-модель", "Interactive 3D model"), l("Три варианта оформления", "Three visual editions"), l("Адаптивный сценарий просмотра", "Responsive product journey")],
    image: "/projects/drop-air-force-1.webp", href: "https://sole-motion-public.vercel.app/", slug: "drop-3d-store", stack: ["React", "Three.js", "WebGL"],
  },
  {
    id: "garant", kind: "bot", name: "Гарант сделок",
    type: l("Сделки · Чат · Администрирование", "Deals · Chat · Administration"),
    summary: l("Сценарий сделки между двумя участниками: приглашение, обсуждение условий, подтверждение и разбор спора с администратором.", "A two-party deal workflow with invitations, discussion, confirmation and administrator-led dispute handling."),
    status: l("Демо · Платежи отключены", "Demo · Payments disabled"),
    note: l("Реальные платежи отключены. Проект показывается как демонстрация логики сделок и управления, не как действующий финансовый сервис.", "Real payments are disabled. This demonstrates deal workflows and administration, not an operating financial service."),
    features: [l("Приглашение конкретного участника", "Invitation tied to a participant"), l("Чат, история и вложения", "Chat, history and attachments"), l("Споры и управление статусами", "Disputes and status management")],
    flow: [l("Создание и приглашение", "Create and invite"), l("Обсуждение в чате сделки", "Discuss in the deal chat"), l("Завершение или спор", "Complete or open a dispute")],
    href: "https://t.me/garantbottgbot", stack: ["Python", "Telegram Bot API", "SQLite"],
  },
  {
    id: "tehnotek", kind: "website", name: "ТЕХНОТЭК",
    type: l("B2B · Инженерное производство", "B2B · Engineering"),
    summary: l("Продуктовая страница, которая объясняет возможности производства и помогает отправить техническую задачу с чертежом.", "A product page explaining manufacturing capabilities and helping buyers submit a technical brief and drawing."),
    status: l("Прототип", "Prototype"),
    note: l("Публичный прототип структуры и интерфейса B2B-страницы, без заявлений о коммерческих результатах.", "A public B2B page prototype with no claimed commercial results."),
    features: [l("Инженерные решения", "Engineering capabilities"), l("Пример производственного узла", "Manufacturing example"), l("Сценарий заявки с техническим файлом", "Enquiry flow with a technical file")],
    image: "/projects/tehnotek-prototype.webp", href: "https://tehnotek-prototype.vercel.app/", slug: "tehnotek-prototype", stack: ["React", "TypeScript", "CSS"],
  },
  {
    id: "fart", kind: "bot", name: "Фарт Казино",
    type: l("Игровая платформа · Telegram Mini App", "Gaming platform · Telegram Mini App"),
    summary: l("Бот и Mini App с игровыми режимами, покером и историей операций. Расчёт раундов вынесен на сервер.", "A bot and Mini App with game modes, poker and transaction history. Rounds are calculated on the server."),
    status: l("Основная версия опубликована", "Main version published"),
    note: l("Новый режим «Шахта» дорабатывался локально; его публикация не подтверждена. Кейс описывает разработку, не предлагает участие в игре.", "The new Mine mode was developed locally; its deployment is unconfirmed. This case describes engineering, not an invitation to play."),
    features: [l("Бот и веб-интерфейс", "Bot and web interface"), l("Серверные раунды и история", "Server-side rounds and history"), l("Восстановление после потери связи", "Recovery after connection loss")],
    flow: [l("Вход в Mini App", "Enter the Mini App"), l("Обработка раунда сервером", "Server processes a round"), l("Результат сохраняется в истории", "Result saved to history")],
    stack: ["Python", "aiogram", "FastAPI", "SQLite"],
  },
  {
    id: "metro", kind: "bot", name: "Metro Shop",
    type: l("Telegram-магазин · PUBG Metro", "Telegram store · PUBG Metro"),
    summary: l("Заказ из бота сразу попадает в группу работников. Сотрудник берёт его в работу, а клиент получает уведомление.", "Bot orders go straight to the staff group. A worker accepts an order and the customer gets a notification."),
    status: l("Рабочий MVP", "Working MVP"),
    note: l("Оплата согласовывается вручную. Одновременное принятие одного заказа двумя сотрудниками исключено в логике бота.", "Payment is arranged manually. The bot prevents two workers from accepting the same order."),
    features: [l("Каталог и ID игрока", "Catalogue and player ID"), l("Очередь и статусы заказов", "Order queue and statuses"), l("Уведомления и статистика", "Notifications and statistics")],
    flow: [l("Клиент оформляет заказ", "Customer places an order"), l("Сотрудник нажимает «Беру»", "Worker accepts it"), l("Бот уведомляет клиента", "Bot notifies the customer")],
    href: "https://t.me/arabmetroshopbot", stack: ["Python", "Telegram Bot API", "SQLite"],
  },
];
