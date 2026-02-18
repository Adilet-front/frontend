/**
 * Инициализация i18next: языки ru/en/kg, автоопределение из localStorage и браузера.
 * Тексты берутся из resources.ts; в компонентах — useTranslation() и t("key").
 */
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ru",
    supportedLngs: ["ru", "en", "kg"],
    interpolation: {
      escapeValue: false, // React уже экранирует
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
