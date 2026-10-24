import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlannedPage } from "./pages/PlannedPage";
import { AppStateProvider } from "./state/AppState";

export function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route
              path="learning-path"
              element={
                <PlannedPage
                  step={2}
                  heading="Learning Path"
                  summary="This is where chapters will live. Opening a page will not mark a chapter complete."
                  points={[
                    "Four stages, from natural conversation to client meetings.",
                    "Search and filters by stage, status, skill, and difficulty.",
                    "A chapter page with expressions, a speaking prompt, and a result you record yourself.",
                  ]}
                />
              }
            />
            <Route
              path="practice"
              element={
                <PlannedPage
                  step={3}
                  heading="Practice Room"
                  summary="This is where you will attempt one task, then reveal a model answer and record how it felt."
                  points={[
                    "Listening, speaking, vocabulary recall, sentence rewrites, and work scenarios.",
                    "Your own rating: Easy, Manageable, or Difficult.",
                    "No claim that the browser is listening or grading your speech.",
                  ]}
                />
              }
            />
            <Route
              path="library"
              element={
                <PlannedPage
                  step={4}
                  heading="My Library"
                  summary="This is where phrases you save from a lesson will be kept, with the chapter they came from."
                  points={[
                    "Save a phrase with just the words, and fill the meaning later.",
                    "Search, edit, delete, and mark an item as recalled.",
                    "Optional Telugu meanings when you want them.",
                  ]}
                />
              }
            />
            <Route
              path="progress"
              element={
                <PlannedPage
                  step={5}
                  heading="Progress & Review"
                  summary="This is where recorded attempts, review dates, and a weekly reflection will appear."
                  points={[
                    "Counts come only from results you save.",
                    "A simple review schedule you can change by hand.",
                    "Export, import, and a reset that asks you to confirm.",
                  ]}
                />
              }
            />
            <Route
              path="assistant"
              element={
                <PlannedPage
                  step={6}
                  heading="AI Learning Assistant"
                  summary="This will offer prompts you can copy into your own AI chat. It will not pretend a model is connected."
                  points={[
                    "Explain a phrase, improve a sentence, or practise a status update.",
                    "A Copy prompt button, and no fake answer.",
                    "Your notes stay on this device unless you paste them somewhere yourself.",
                  ]}
                />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}
