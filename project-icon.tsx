export const technologyIcons = {
  React: "react",
  "Telegram WebApp": "telegram",
  "Telegram Bot": "telegram",
  "Cloudflare D1": "cloudflare",
  "Three.js": "threedotjs",
  WebGL: "webgl",
  TypeScript: "typescript",
  "Tailwind CSS": "tailwindcss",
  "Next.js": "nextdotjs",
  PostgreSQL: "postgresql",
} as const;

export type TechnologyName = keyof typeof technologyIcons;
export const technologyLinks: Record<TechnologyName, string> = {
  React: "https://react.dev/",
  "Telegram WebApp": "https://core.telegram.org/bots/webapps",
  "Telegram Bot": "https://core.telegram.org/bots",
  "Cloudflare D1": "https://developers.cloudflare.com/d1/",
  "Three.js": "https://threejs.org/",
  WebGL: "https://www.khronos.org/webgl/",
  TypeScript: "https://www.typescriptlang.org/",
  "Tailwind CSS": "https://tailwindcss.com/",
  "Next.js": "https://nextjs.org/",
  PostgreSQL: "https://www.postgresql.org/",
};
export type ProjectIconName = "tools-kitchen-2" | "shoe" | "settings" | "world" | "tools";

export function ProjectIcon({ name, category = "projects" }: {
  name: ProjectIconName | (typeof technologyIcons)[TechnologyName];
  category?: "projects" | "stack";
}) {
  const source = `url("/icons/${category}/${name}.svg")`;
  return <span aria-hidden="true" className={`project-svg-icon project-svg-icon-${name}`}
    style={{ maskImage: source, WebkitMaskImage: source }} />;
}
