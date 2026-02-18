/**
 * Конфиг Vite: сборка и dev-сервер.
 * Плагин react включает Fast Refresh и поддержку JSX.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
