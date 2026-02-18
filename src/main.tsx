/**
 * Точка входа приложения.
 * Подключает глобальные стили и i18n до рендера, монтирует React в #root.
 */
import { createRoot } from "react-dom/client";
import i18n from "./app/i18n";
import { App } from "./app/App";
import "./app/styles/index.scss";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(i18n.t("errors.rootNotFound"));
}

createRoot(rootElement).render(<App />);
