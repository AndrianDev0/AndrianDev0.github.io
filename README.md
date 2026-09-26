# Andrian.Dev Portfolio

A responsive portfolio and conversion landing page for a freelance developer building websites, Telegram bots, web apps, automation, and integrations.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by the development server.

## Production build and hosting

```bash
pnpm typecheck
pnpm vercel-build
```

The canonical site is published at https://andriandev0.github.io/ from the
`AndrianDev0.github.io` repository. The GitHub Pages workflow builds the
static pages, including the localized case studies, service pages, sitemap,
and robots.txt. Publish the same `main` commit to both repositories. This
checkout configures `origin` with both push URLs, so `git push origin main`
updates the source and the Pages site together; other clones need the same
push configuration or two explicit pushes.

## Content and settings

- Contact details, brand name, budgets, navigation, and metrics: `site.ts`
- Project data: `projects.ts`
- Service-page content: `seo-pages.json`
- Home-page service visuals, benefits, process, and technologies: `content.ts`
- Production origin, route registry, localized SEO metadata, and canonical helpers: `site-registry.ts`
- Contact form email adapter: `submit.ts`

The portfolio currently features the real Nebo Bistro Telegram Bot + Mini App case.

## Add a project

Add a new object to the `projects` array in `projects.ts` and its localized search metadata to `projectMetadata` in `site-registry.ts`. Each project needs a unique `slug`; Russian and English detail routes, prerender output, preview routing, and sitemap entries are then generated from the registry.

Project fields:

- `id`, `slug`, `title`, `category`
- `description`, `technologies`, `kind`, `accent`
- `challenge`, `solution`, `result`
- `liveUrl` and `previewUrl`

## Screenshots and assets

Place future screenshots in `public/projects/` and supporting imagery in `public/images/`. Use Next/Image for raster assets added to the interface.

## Change text

Section copy lives in `i18n.tsx`, `content.ts`, and the corresponding components. Primary site metadata is in `site.ts`.

## Contact form

The form prepares a prefilled email to the address in `submit.ts`. Replace it with a server endpoint when direct background delivery is needed.

```ts
{
  name,
  contact,
  projectDescription,
  budget
}
```

Keep secrets on the server and out of client-side code.

## Sitemap dates

The production build derives `<lastmod>` from the latest Git commit that changed SEO content. A release pipeline can override it with `SITE_LAST_MODIFIED=YYYY-MM-DD`. Invalid explicit dates fail the build; when neither a valid override nor Git history is available, `<lastmod>` is omitted instead of publishing an inaccurate date.
