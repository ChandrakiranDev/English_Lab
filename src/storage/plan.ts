export type ItemStatus = "not_started" | "in_progress" | "skipped" | "completed";

export type PlanSkill = "vocabulary" | "listening" | "speaking" | "sentences" | "professional";

export type PlanItem = {
  id: string;
  title: string;
  minutes: number;
  skill: PlanSkill;
  status: ItemStatus;
};

export const SUGGESTED_PLAN_MINUTES = 90;
export const MIN_DAILY_TARGET = 15;
export const MAX_DAILY_TARGET = 240;

const STATUSES: ItemStatus[] = ["not_started", "in_progress", "skipped", "completed"];

export const PLAN_TEMPLATE: Array<Omit<PlanItem, "status">> = [
  {
    id: "review",
    title: "Review vocabulary and expressions",
    minutes: 15,
    skill: "vocabulary",
  },
  {
    id: "listening",
    title: "Listening and shadowing",
    minutes: 25,
    skill: "listening",
  },
  {
    id: "speaking",
    title: "Speaking practice",
    minutes: 25,
    skill: "speaking",
  },
  {
    id: "sentences",
    title: "Sentence improvement",
    minutes: 15,
    skill: "sentences",
  },
  {
    id: "professional",
    title: "Professional communication",
    minutes: 10,
    skill: "professional",
  },
];

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const weekday = copy.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  copy.setDate(copy.getDate() + mondayOffset);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isStatus(value: unknown): value is ItemStatus {
  return typeof value === "string" && STATUSES.includes(value as ItemStatus);
}

export function normalizeDay(stored: PlanItem[] | undefined): PlanItem[] {
  const byId = new Map<string, ItemStatus>();
  if (Array.isArray(stored)) {
    for (const item of stored) {
      if (item && typeof item.id === "string" && isStatus(item.status)) {
        byId.set(item.id, item.status);
      }
    }
  }
  return PLAN_TEMPLATE.map((item) => ({
    ...item,
    status: byId.get(item.id) ?? "not_started",
  }));
}

export function withStatus(items: PlanItem[], id: string, status: ItemStatus): PlanItem[] {
  return items.map((item) => {
    if (item.id === id) return { ...item, status };
    if (status === "in_progress" && item.status === "in_progress") {
      return { ...item, status: "not_started" };
    }
    return item;
  });
}

export type Unfinished = {
  date: string;
  item: PlanItem;
};

export function findUnfinished(days: Record<string, PlanItem[]>, todayKey: string): Unfinished | null {
  const todayItem = normalizeDay(days[todayKey]).find((item) => item.status === "in_progress");
  if (todayItem) return { date: todayKey, item: todayItem };

  const olderDates = Object.keys(days)
    .filter((date) => date < todayKey)
    .sort()
    .reverse();

  for (const date of olderDates) {
    const item = normalizeDay(days[date]).find((entry) => entry.status === "in_progress");
    if (item) return { date, item };
  }
  return null;
}

export function hasRecordedActivity(days: Record<string, PlanItem[]>): boolean {
  return Object.values(days).some((items) =>
    normalizeDay(items).some((item) => item.status !== "not_started"),
  );
}

export type WeekSummary = {
  practiceSessions: number;
  speakingAttempts: number;
  listeningSessions: number;
  rangeLabel: string;
};

export function summarizeWeek(days: Record<string, PlanItem[]>, now: Date): WeekSummary {
  const start = startOfWeek(now);
  const end = addDays(start, 6);
  let practiceSessions = 0;
  let speakingAttempts = 0;
  let listeningSessions = 0;

  for (let index = 0; index < 7; index += 1) {
    const key = toDateKey(addDays(start, index));
    if (!days[key]) continue;
    for (const item of normalizeDay(days[key])) {
      if (item.status !== "completed") continue;
      practiceSessions += 1;
      if (item.skill === "speaking") speakingAttempts += 1;
      if (item.skill === "listening") listeningSessions += 1;
    }
  }

  const format = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
  return {
    practiceSessions,
    speakingAttempts,
    listeningSessions,
    rangeLabel: `${format.format(start)} – ${format.format(end)}`,
  };
}

export function parseDailyTarget(
  value: string,
): { ok: true; minutes: number } | { ok: false; message: string } {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, message: "Enter a whole number of minutes." };
  }
  const minutes = Number(trimmed);
  if (minutes < MIN_DAILY_TARGET || minutes > MAX_DAILY_TARGET) {
    return {
      ok: false,
      message: `Choose a target from ${MIN_DAILY_TARGET} to ${MAX_DAILY_TARGET} minutes.`,
    };
  }
  return { ok: true, minutes };
}

export function statusLabel(status: ItemStatus): string {
  switch (status) {
    case "not_started":
      return "Not started";
    case "in_progress":
      return "In progress";
    case "skipped":
      return "Skipped";
    case "completed":
      return "Completed";
  }
}
