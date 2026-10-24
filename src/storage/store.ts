import { MAX_DAILY_TARGET, MIN_DAILY_TARGET, type PlanItem } from "./plan";

export const STORAGE_KEY = "english-lab";

export type Store = {
  version: 1;
  settings: {
    dailyTargetMinutes: number;
  };
  days: Record<string, PlanItem[]>;
};

export function defaultStore(): Store {
  return {
    version: 1,
    settings: { dailyTargetMinutes: 90 },
    days: {},
  };
}

function sanitizeDays(value: unknown): Record<string, PlanItem[]> {
  if (!value || typeof value !== "object") return {};
  const days: Record<string, PlanItem[]> = {};
  for (const [key, items] of Object.entries(value)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(items)) {
      days[key] = items as PlanItem[];
    }
  }
  return days;
}

export function loadStore(): Store {
  const fallback = defaultStore();
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Store>;
    if (parsed.version !== 1) return fallback;
    const minutes = parsed.settings?.dailyTargetMinutes;
    const dailyTargetMinutes =
      typeof minutes === "number" &&
      Number.isInteger(minutes) &&
      minutes >= MIN_DAILY_TARGET &&
      minutes <= MAX_DAILY_TARGET
        ? minutes
        : 90;
    return {
      version: 1,
      settings: { dailyTargetMinutes },
      days: sanitizeDays(parsed.days),
    };
  } catch {
    return fallback;
  }
}

export function saveStore(store: Store): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
