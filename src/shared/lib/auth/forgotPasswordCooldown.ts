const COOLDOWN_STORAGE_KEY = "office_lib_forgot_password_cooldown";
export const FORGOT_PASSWORD_COOLDOWN_MS = 15 * 60 * 1000;

type CooldownMap = Record<string, number>;

const isBrowser = () => typeof window !== "undefined";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readCooldownMap = (): CooldownMap => {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as CooldownMap;
  } catch {
    return {};
  }
};

const writeCooldownMap = (value: CooldownMap) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(value));
};

const cleanupExpired = (map: CooldownMap): CooldownMap => {
  const now = Date.now();
  const next: CooldownMap = {};

  Object.entries(map).forEach(([email, expiresAt]) => {
    if (typeof expiresAt === "number" && expiresAt > now) {
      next[email] = expiresAt;
    }
  });

  return next;
};

export const getForgotPasswordCooldownMs = (email: string): number => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return 0;

  const map = cleanupExpired(readCooldownMap());
  const expiresAt = map[normalizedEmail];
  writeCooldownMap(map);

  if (!expiresAt) return 0;

  return Math.max(0, expiresAt - Date.now());
};

export const setForgotPasswordCooldown = (
  email: string,
  cooldownMs = FORGOT_PASSWORD_COOLDOWN_MS,
) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const map = cleanupExpired(readCooldownMap());
  map[normalizedEmail] = Date.now() + cooldownMs;
  writeCooldownMap(map);
};
