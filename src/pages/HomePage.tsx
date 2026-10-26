import { useEffect, useState } from "react";
import { focusForDate } from "../content/focus";
import { useAppState } from "../state/AppState";
import {
  MAX_DAILY_TARGET,
  MIN_DAILY_TARGET,
  SUGGESTED_PLAN_MINUTES,
  completedMinutes,
  formatDateKey,
  parseDailyTarget,
  statusLabel,
  type PlanItem,
  type WeekSummary,
} from "../storage/plan";

export function HomePage() {
  const {
    dailyTargetMinutes,
    setDailyTarget,
    todayKey,
    todayPlan,
    setItemStatus,
    unfinished,
    firstRun,
    week,
  } = useAppState();
  const [draft, setDraft] = useState(String(dailyTargetMinutes));
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const focus = focusForDate(new Date());
  const doneMinutes = completedMinutes(todayPlan);
  const highlightId = nextSessionId(todayPlan, unfinished?.date === todayKey ? unfinished.item.id : null);

  useEffect(() => {
    setDraft(String(dailyTargetMinutes));
  }, [dailyTargetMinutes]);

  function saveTarget() {
    const result = parseDailyTarget(draft);
    if (!result.ok) {
      setFormError(result.message);
      setSavedNote(null);
      return;
    }
    setFormError(null);
    if (result.minutes !== dailyTargetMinutes) {
      setDailyTarget(result.minutes);
    }
    setSavedNote("Daily target saved on this device.");
  }

  function focusPlanItem(id: string) {
    const row = document.getElementById(`plan-${id}`);
    if (!row) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    row.querySelector<HTMLButtonElement>("button.primary, button")?.focus();
  }

  function continueUnfinished() {
    if (!unfinished) return;
    if (unfinished.date !== todayKey) {
      setItemStatus(unfinished.item.id, "in_progress");
      setActionNote(`Started ${unfinished.item.title} again for today.`);
    }
    window.setTimeout(() => focusPlanItem(unfinished.item.id), 0);
  }

  function setStatus(item: PlanItem, status: PlanItem["status"], note: string) {
    setItemStatus(item.id, status);
    setActionNote(note);
  }

  return (
    <div className="page">
      <p className="eyebrow">Today</p>
      <h1>Ready for today’s practice?</h1>
      <p className="lede">Pick one session. The list is a suggestion, not a timer.</p>
      <p className="focus-line">
        <strong>Today’s focus.</strong> {focus}
      </p>

      {firstRun ? (
        <p className="first-run">Press Start on the first session. Your result is saved on this device.</p>
      ) : null}

      {unfinished ? (
        <section className="callout next-step" aria-labelledby="next-heading">
          <p className="eyebrow">Continue</p>
          <h2 id="next-heading">{unfinished.item.title}</h2>
          <p>
            {unfinished.date === todayKey
              ? "This session is in progress today."
              : `You left this unfinished on ${formatDateKey(unfinished.date)}.`}
          </p>
          <button type="button" className="primary" onClick={continueUnfinished}>
            Continue
          </button>
        </section>
      ) : null}

      <section className="block" aria-labelledby="plan-heading">
        <div className="block-heading">
          <h2 id="plan-heading">Today’s plan</h2>
          <p>{planSummary(doneMinutes, dailyTargetMinutes)}</p>
        </div>
        <form
          className="target-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveTarget();
          }}
        >
          <label htmlFor="daily-target">Daily target in minutes</label>
          <div className="target-row">
            <input
              id="daily-target"
              inputMode="numeric"
              min={MIN_DAILY_TARGET}
              max={MAX_DAILY_TARGET}
              aria-describedby="daily-target-hint"
              aria-invalid={formError ? true : undefined}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setSavedNote(null);
                setFormError(null);
              }}
            />
            <button type="submit">Save target</button>
          </div>
          <p id="daily-target-hint" className="field-hint">
            Use {MIN_DAILY_TARGET} to {MAX_DAILY_TARGET} minutes. 90 is a full suggested day. A shorter target is fine.
          </p>
          {formError ? (
            <p className="field-error" role="alert">
              {formError}
            </p>
          ) : null}
          {savedNote ? (
            <p className="field-ok" role="status">
              {savedNote}
            </p>
          ) : null}
        </form>

        <p className="live-note" role="status">
          {actionNote}
        </p>
        <ol className="plan-list" aria-label="Today's suggested sessions">
          {todayPlan.map((item, index) => (
            <li key={item.id} id={`plan-${item.id}`} className={`plan-item status-${item.status}`}>
              <div>
                <p className="plan-index">Session {index + 1}</p>
                <h3>{item.title}</h3>
                <p className="plan-meta">
                  {item.minutes} minutes · <span className="status-text">{statusLabel(item.status)}</span>
                </p>
              </div>
              <div className="plan-actions">
                <SessionActions
                  item={item}
                  highlighted={item.id === highlightId}
                  onStart={() => setStatus(item, "in_progress", `${item.title} is in progress.`)}
                  onSkip={() =>
                    setStatus(item, "skipped", `${item.title} was skipped. It is not counted as practice.`)
                  }
                  onComplete={() => setStatus(item, "completed", `${item.title} marked complete.`)}
                  onClear={() => setStatus(item, "not_started", `${item.title} set back to not started.`)}
                />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="quiet-section" aria-labelledby="place-heading">
        <h2 id="place-heading">Where you are</h2>
        <p>
          <strong>Current stage.</strong> Not started yet.
        </p>
        <p>
          <strong>Due for review.</strong> No saved words yet.
        </p>
        <p>
          <strong>This week, {week.rangeLabel}.</strong> {weekDetail(week)}
        </p>
      </section>
    </div>
  );
}

function SessionActions({
  item,
  highlighted,
  onStart,
  onSkip,
  onComplete,
  onClear,
}: {
  item: PlanItem;
  highlighted: boolean;
  onStart: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onClear: () => void;
}) {
  if (item.status === "completed") {
    return (
      <button type="button" className="quiet" aria-label={`Clear ${item.title}`} onClick={onClear}>
        Clear
      </button>
    );
  }

  if (item.status === "in_progress") {
    return (
      <>
        <button type="button" className="primary" aria-label={`Mark ${item.title} complete`} onClick={onComplete}>
          Mark complete
        </button>
        <button type="button" className="quiet" aria-label={`Skip ${item.title}`} onClick={onSkip}>
          Skip
        </button>
      </>
    );
  }

  const startClass = highlighted ? "primary" : undefined;
  return (
    <>
      <button type="button" className={startClass} aria-label={`Start ${item.title}`} onClick={onStart}>
        Start
      </button>
      {item.status === "skipped" ? (
        <button type="button" className="quiet" aria-label={`Mark ${item.title} complete`} onClick={onComplete}>
          Mark complete
        </button>
      ) : (
        <button type="button" className="quiet" aria-label={`Skip ${item.title}`} onClick={onSkip}>
          Skip
        </button>
      )}
    </>
  );
}

function nextSessionId(items: PlanItem[], inProgressId: string | null): string | null {
  if (inProgressId) return inProgressId;
  return items.find((item) => item.status === "not_started")?.id ?? items.find((item) => item.status === "skipped")?.id ?? null;
}

function planSummary(doneMinutes: number, target: number): string {
  const done = doneMinutes > 0 ? `You have marked ${doneMinutes} minutes complete. ` : "";
  return `${done}The suggested list is ${SUGGESTED_PLAN_MINUTES} minutes and your target is ${target}. Skip what does not fit.`;
}

function weekDetail(week: WeekSummary): string {
  if (week.practiceSessions === 0) return "No sessions recorded yet.";
  const label =
    week.practiceSessions === 1 ? "1 session marked complete" : `${week.practiceSessions} sessions marked complete`;
  const bits: string[] = [];
  if (week.speakingAttempts > 0) bits.push(`${week.speakingAttempts} speaking`);
  if (week.listeningSessions > 0) bits.push(`${week.listeningSessions} listening`);
  if (bits.length === 0) return `${label}.`;
  return `${label}: ${bits.join(", ")}.`;
}
