import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/mockApi";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const { profile } = useApp();

  const [matchCount, setMatchCount] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setError("");

    try {
      const [matches, requests] = await Promise.all([
        api.getMatches(),
        api.getIncomingRequests(),
      ]);

      setMatchCount(matches.length);

      setPendingCount(
        requests.filter((request) => request.status === "pending").length
      );
    } catch (err) {
      setError(
        err.message ||
          "We couldn't load your dashboard. Please try again."
      );
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Hey {profile?.name?.split(" ")[0] || "there"} 👋
      </h1>

      <p className="mt-2 text-muted">
        Here's where things stand today.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-card px-4 py-3">
          <p className="text-sm text-accent">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <DashboardCard
          to="/matches"
          title="Your matches"
          value={matchCount}
          description="People scoring 80% or higher with you"
        />

        <DashboardCard
          to="/requests"
          title="Pending requests"
          value={pendingCount}
          description="Waiting on your response"
          highlight={pendingCount > 0}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  to,
  title,
  value,
  description,
  highlight,
}) {
  return (
    <Link
      to={to}
      className={`block rounded-2xl border bg-card p-6 transition-all hover:shadow-sm ${
        highlight
          ? "border-accent"
          : "border-border hover:border-primary"
      }`}
    >
      <p className="text-sm font-medium text-muted">
        {title}
      </p>

      {value === null ? (
        <div className="mt-3 h-12 w-16 animate-pulse rounded bg-border" />
      ) : (
        <p className="mt-2 font-display text-4xl font-semibold text-ink">
          {value}
        </p>
      )}

      <p className="mt-2 text-sm text-muted">
        {description}
      </p>
    </Link>
  );
}