import type { Metadata } from "next";
import { siteConfig } from "../site";
import { LanguageProvider } from "../i18n";
import { ThemeProvider } from "../theme";
import "./globals.css";
import "../styles/editorial-refresh.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: { canonical: "/", languages: { ru: "/", en: "/en", "x-default": "/" } },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "Andrian.Dev — websites, Telegram bots and Mini Apps" }],
  },
  twitter: { card: "summary_large_image", title: siteConfig.title, description: siteConfig.description, images: ["/og-v2.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem("andrian-dev-theme")||"dark";const p=location.pathname.replace(/\\/+$/,"")||"/";const l=p==="/en"||p.startsWith("/en/")?"en":"ru";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;document.documentElement.dataset.language=l;document.documentElement.lang=l}catch{document.documentElement.dataset.theme="dark";document.documentElement.dataset.language="ru"}` }} /></head>
      <body><ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider></body>
    </html>
  );
}
