import { Link } from "react-router-dom";

type PlannedPageProps = {
  step: number;
  heading: string;
  summary: string;
  points: string[];
};

export function PlannedPage({ step, heading, summary, points }: PlannedPageProps) {
  return (
    <div className="page">
      <p className="eyebrow">Step {step} of 6 · not built yet</p>
      <h1>{heading}</h1>
      <p className="lede">{summary}</p>
      <ul className="plain-list">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}
