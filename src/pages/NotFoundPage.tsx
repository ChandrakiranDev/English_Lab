import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page">
      <h1>This page is not in English Lab</h1>
      <p className="lede">The address does not match a section.</p>
      <p>
        <Link to="/">Go to Home</Link>
      </p>
    </div>
  );
}
