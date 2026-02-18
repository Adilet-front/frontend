/**
 * Формирование URL обложки книги.
 * - Относительные пути склеиваются с coverBaseUrl (или дефолт localhost:9000).
 * - Абсолютные URL с minio:9000 переписываются на localhost для браузера; legacy Minio browser URL — на /book-covers/.
 */
import { getEnv } from "../../config/env";

const DEFAULT_COVER_BASE_URL = "http://localhost:9000/book-covers/";

const normalizeLegacyMinioUrl = (value: string) => {
  if (!value.startsWith("http://localhost:9001/browser/book-covers/")) return value;
  return value.replace(
    "http://localhost:9001/browser/book-covers/",
    "http://localhost:9000/book-covers/"
  );
};

const normalizeMinioHost = (value: string) => {
  if (value.startsWith("http://minio:9000/")) return value.replace("http://minio:9000/", "http://localhost:9000/");
  if (value.startsWith("https://minio:9000/")) return value.replace("https://minio:9000/", "http://localhost:9000/");
  if (value.startsWith("//minio:9000/")) return value.replace("//minio:9000/", "http://localhost:9000/");
  if (value.startsWith("minio:9000/")) return value.replace("minio:9000/", "http://localhost:9000/");
  return value;
};

const isAbsoluteUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

export const resolveCoverUrl = (coverUrl?: string | null) => {
  if (!coverUrl) return null;
  const normalized = normalizeMinioHost(coverUrl);
  if (isAbsoluteUrl(normalized)) return normalizeLegacyMinioUrl(normalized);
  const base = getEnv().coverBaseUrl || DEFAULT_COVER_BASE_URL;
  return `${ensureTrailingSlash(base)}${normalized}`;
};
