import type { Metadata } from "next";
import HomeApp from "../../home-app";
import { LanguageProvider } from "../../i18n";
import { absoluteAlternates, findIndexableRoute } from "../../site-registry";

const route = findIndexableRoute("/en")!;
const alternates = absoluteAlternates(route.alternates)!;

export const metadata: Metadata = {
  title: { absolute: route.metadata.title },
  description: route.metadata.description,
  alternates: {
    canonical: route.path,
    languages: { ru: alternates.ru, en: alternates.en, "x-default": alternates.xDefault },
  },
};

export default function EnglishHome() {
  return <LanguageProvider initialLanguage="en"><HomeApp /></LanguageProvider>;
}
