const DAILY_FOCUS = [
  "Review one expression and use it in a new sentence of your own.",
  "Practise clarifying a requirement without sounding abrupt.",
  "Give a short project status: what moved, what is at risk, and the next step.",
  "Explain a blocker and propose a recovery step.",
  "Disagree with an idea while staying respectful.",
  "Ask a clear follow-up question so the conversation keeps going.",
  "Paraphrase a sentence when you do not know the exact word.",
];

export function focusForDate(date: Date): string {
  return DAILY_FOCUS[date.getDay()] ?? DAILY_FOCUS[0];
}
