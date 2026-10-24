import { useEffect, useState } from "react";
import {
  MAX_DAILY_TARGET,
  MIN_DAILY_TARGET,
  SUGGESTED_PLAN_MINUTES,
  formatDateKey,
  parseDailyTarget,
  statusLabel,
} from "../storage/plan";
import { useAppState } from "../state/AppState";
import { focusForDate } from "../content/focus";

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
    row.querySelector("button")?.focus();
  }

  function continueUnfinished() {
    if (!unfinished) return;
    if (unfinished.date !== todayKey) {
      setItemStatus(unfinished.item.id, "in_progress");
      setActionNote(`Started ${unfinished.item.title.toLowerCase()} again for today.`);
    }
    window.setTimeout(() => focusPlanItem(unfinished.item.id), 0);
  }

  return (
    <div className="page">
      <p className="eyebrow">Today</p>
      <h1>Ready for today’s practice?</h1>
      <p className="lede">
        Pick one session. The list is a suggestion, not a timer. Your target is {dailyTargetMinutes}{" "}
        minutes, and you can change it.
      </p>

      {firstRun ? (
        <aside className="callout">
          <h2>Start with one session</h2>
          <p>
            Nothing is recorded yet. Press Start on the first session when you are ready. Lessons,
            saved phrases, and review scores are later steps, so this page will not pretend you have
            finished a chapter.
          </p>
        </aside>
      ) : null}

      <section className="block" aria-labelledby="plan-heading">
        <div className="block-heading">
          <h2 id="plan-heading">Today’s plan</h2>
          <p>Suggested sessions add up to {SUGGESTED_PLAN_MINUTES} minutes. Skip any that do not fit your day.</p>
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
                {item.status !== "completed" && item.status !== "in_progress" ? (
                  <button type="button" className="primary" onClick={() => {
                    setItemStatus(item.id, "in_progress");
                    setActionNote(`${item.title} is in progress.`);
                  }}>
                    Start
                  </button>
                ) : null}
                {item.status !== "completed" && item.status !== "skipped" ? (
                  <button type="button" onClick={() => {
                    setItemStatus(item.id, "skipped");
                    setActionNote(`${item.title} was skipped. It is not counted as practice.`);
                  }}>
                    Skip
                  </button>
                ) : null}
                {item.status !== "completed" ? (
                  <button type="button" onClick={() => {
                    setItemStatus(item.id, "completed");
                    setActionNote(`${item.title} marked complete.`);
                  }}>
                    Mark complete
                  </button>
                ) : (
                  <button type="button" onClick={() => {
                    setItemStatus(item.id, "not_started");
                    setActionNote(`${item.title} set back to not started.`);
                  }}>
                    Clear
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="block" aria-labelledby="continue-heading">
        <h2 id="continue-heading">Continue where you left off</h2>
        {unfinished ? (
          <>
            <p>
              <strong>{unfinished.item.title}</strong> is in progress
              {unfinished.date === todayKey ? " today" : ` from ${formatDateKey(unfinished.date)}`}.
            </p>
            <button type="button" className="primary" onClick={continueUnfinished}>
              Continue
            </button>
          </>
        ) : (
          <p>No session is unfinished. Start one in today’s plan when you want to continue later.</p>
        )}
      </section>

      <section className="block" aria-labelledby="place-heading">
        <h2 id="place-heading">Where you are</h2>
        <dl className="facts">
          <div>
            <dt>Current stage</dt>
            <dd>Not started. Chapters are the next build step, so no stage is assigned yet.</dd>
          </div>
          <div>
            <dt>Due for review</dt>
            <dd>No saved words yet. Nothing is due.</dd>
          </div>
          <div>
            <dt>Suggested focus</dt>
            <dd>{focus}</dd>
          </div>
        </dl>
      </section>

      <section className="block" aria-labelledby="week-heading">
        <div className="block-heading">
          <h2 id="week-heading">This week</h2>
          <p>{week.rangeLabel}. These numbers count only what you marked complete.</p>
        </div>
        <div className="stats">
          <article>
            <h3>Practice sessions recorded</h3>
            <p className="stat-value">{week.practiceSessions}</p>
            <p>Sessions you marked complete. Skipping does not count. Time alone is not treated as skill.</p>
          </article>
          <article>
            <h3>Speaking attempts</h3>
            <p className="stat-value">{week.speakingAttempts}</p>
            <p>Speaking sessions you marked complete. This is not a score for fluency.</p>
          </article>
          <article>
            <h3>Listening sessions</h3>
            <p className="stat-value">{week.listeningSessions}</p>
            <p>Listening sessions you marked complete.</p>
          </article>
          <article>
            <h3>Items successfully recalled</h3>
            <p className="stat-value">—</p>
            <p>Review attempts are not recorded yet. This stays blank until that step exists.</p>
          </article>
        </div>
      </section>

      <section className="block" aria-labelledby="later-heading">
        <h2 id="later-heading">Not in this step</h2>
        <ul className="plain-list">
          <li>Review vocabulary opens when My Library exists.</li>
          <li>Save a phrase opens when a lesson can attach a source chapter.</li>
          <li>Record a reflection opens on Progress & Review.</li>
        </ul>
      </section>
    </div>
  );
}
