import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import HomeApp from "./home-app";
import { LanguageProvider } from "./i18n";
import "./app/globals.css";
import "./styles/editorial-refresh.css";
import "./styles/stickers.css";
import { findIndexableRoute } from "./site-registry";
import { ThemeProvider } from "./theme";

const CaseApp = lazy(() => import("./case-app"));
const ServicePageApp = lazy(() => import("./service-page-app"));

function VercelApp() {
  const route = findIndexableRoute(window.location.pathname);
  let page;

  if (!route) {
    page = <main className="route-error"><p>404</p><h1>Страница не найдена</h1><a href="/">Вернуться на Andrian.Dev</a></main>;
  } else if (route.kind === "home") {
    page = <HomeApp />;
  } else if (route.kind === "project") {
    page = <CaseApp slug={route.projectSlug!} />;
  } else {
    page = <ServicePageApp slug={route.serviceSlug!} />;
  }

  return (
    <Suspense fallback={<div className="route-loader" aria-label="Loading" />}>
      {page}
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider initialLanguage={/^\/en(?:\/|$)/.test(window.location.pathname) ? "en" : "ru"}>
        <VercelApp />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);
