import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const BROWSER_TO_APP_LANGUAGE: Record<string, string> = { uk: "ua", ja: "jp" };

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ua", "jp"],
    detection: {
      // Browsers report en-US, uk-UA, ja-JP; the translation folders are en, ua, jp.
      convertDetectedLanguage: (lng: string) => {
        const base = lng.split("-")[0] as string;
        return BROWSER_TO_APP_LANGUAGE[base] ?? base;
      },
    },
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
