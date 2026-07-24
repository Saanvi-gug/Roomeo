import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/mockApi";
import CompatibilityRing from "../components/CompatibilityRing";

export default function Matches() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMatches()
      .then(setMatches)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (matches === null) return <LoadingState />;
  if (matches.length === 0) return <EmptyState />;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Your matches</h1>
      <p className="mt-2 text-muted">
        Only people scoring 80% or higher show up here. No contact info until you both accept.
      </p>

      <div className="mt-8 space-y-3">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            to={`/matches/${match.matchId}`}
            className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
          >
            <CompatibilityRing score={match.score} size={64} strokeWidth={6} />
            <div className="flex-1">
              <p className="font-display text-lg font-medium text-ink">{match.user.name}</p>
              <p className="text-sm text-muted">
                {match.user.locality}, {match.user.city} · ₹{match.user.budget.toLocaleString("en-IN")}/mo
              </p>
            </div>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-muted">Finding your matches…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-accent">Couldn't load matches: {message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Your matches</h1>
      <p className="mt-4 text-muted">
        No matches at 80% or higher yet. Check back as more people join, or revisit your
        questionnaire answers.
      </p>
    </div>
  );
}
