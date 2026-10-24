import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  findUnfinished,
  hasRecordedActivity,
  normalizeDay,
  summarizeWeek,
  toDateKey,
  withStatus,
  type ItemStatus,
  type PlanItem,
  type Unfinished,
  type WeekSummary,
} from "../storage/plan";
import { loadStore, saveStore, type Store } from "../storage/store";

type AppStateValue = {
  dailyTargetMinutes: number;
  setDailyTarget: (minutes: number) => void;
  todayKey: string;
  todayPlan: PlanItem[];
  setItemStatus: (id: string, status: ItemStatus) => void;
  unfinished: Unfinished | null;
  firstRun: boolean;
  week: WeekSummary;
  persistError: string | null;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadStore());
  const [persistError, setPersistError] = useState<string | null>(null);
  const todayKey = toDateKey(new Date());

  function commit(next: Store) {
    const saved = saveStore(next);
    setPersistError(
      saved ? null : "This browser could not save your changes. They may disappear after a refresh.",
    );
    setStore(next);
  }

  const value = useMemo<AppStateValue>(() => {
    const todayPlan = normalizeDay(store.days[todayKey]);
    return {
      dailyTargetMinutes: store.settings.dailyTargetMinutes,
      setDailyTarget: (minutes: number) => {
        commit({
          ...store,
          settings: { dailyTargetMinutes: minutes },
        });
      },
      todayKey,
      todayPlan,
      setItemStatus: (id: string, status: ItemStatus) => {
        commit({
          ...store,
          days: {
            ...store.days,
            [todayKey]: withStatus(todayPlan, id, status),
          },
        });
      },
      unfinished: findUnfinished(store.days, todayKey),
      firstRun: !hasRecordedActivity(store.days),
      week: summarizeWeek(store.days, new Date()),
      persistError,
    };
  }, [persistError, store, todayKey]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
