# English Lab

A personal English practice workspace. This is step 1 of 6: the app shell and Home. The other sections are real pages that explain what comes next. They do not pretend to be finished.

## How to run

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually `http://localhost:5173`.

To check the production build:

```bash
npm run build
npm run preview
```

## Why this stack

The folder had no app yet, only the build spec. This version uses Vite, React, and TypeScript. That is a small local web app: one command to run it, no server, no account, and no API key.

## Build steps

1. **Home** — navigation, a daily target, and today’s plan. You can start, skip, or mark a session complete. This step is in the app now.
2. **Learning Path** — stages, chapters, search, filters, and a chapter page.
3. **Practice Room** — one task at a time, a model answer after you try, and a result you record.
4. **My Library** — save a phrase from a lesson, then search, edit, delete, and review it.
5. **Progress & Review** — history, review dates, a weekly reflection, export, and import.
6. **AI Learning Assistant** — prompts you can copy. No live model unless one is added later.

## How data is saved

Home saves to `localStorage` in this browser, under the key `english-lab`.

- Daily target, from 15 to 240 minutes. The default is 90.
- Today’s five sessions and their status: Not started, In progress, Skipped, or Completed.
- Older days stay in the same store so the week summary can count them.

Visiting Home does not write a result. A session is stored when you start it, skip it, mark it complete, or clear it. Refresh the page and the same status is still there.

The week runs Monday to Sunday on your computer’s clock. A skipped session is not counted. “Items successfully recalled” stays blank until review exists.

Only one session can be in progress at a time. Starting another one sets the previous in-progress session back to Not started.

## What works now

- Sidebar on a wide screen, and a Menu dialog on a narrow screen.
- Home greeting, daily target, today’s plan, continue, week counts, and a suggested focus.
- Keyboard use: skip link, visible focus, labelled target field, and buttons with names.
- The other five sections open and say they are later steps.

## Known limits

- There are no lessons, practice tasks, saved phrases, review dates, or AI answers yet.
- Search, “Save a phrase”, and weekly reflection are not buttons yet, because they would not do anything.
- Nothing is marked mastered. Opening a page does not complete a session.
- The app does not send notifications and does not record your voice.
- Data stays in this browser. Clearing site data removes it. Export arrives in a later step.
- There is no sign-in.
