import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/mockApi";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const { profile } = useApp();
  const [matchCount, setMatchCount] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    // Two independent fetches - deliberately not chained - so one being slow
    // (e.g. the ML service under load) doesn't block the other card.
    api.getMatches().then((m) => setMatchCount(m.length));
    api.getIncomingRequests().then((r) =>
      setPendingCount(r.filter((req) => req.status === "pending").length)
    );
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Hey {profile?.name?.split(" ")[0] || "there"} 👋
      </h1>
      <p className="mt-2 text-muted">Here's where things stand today.</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
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

function DashboardCard({ to, title, value, description, highlight }) {
  return (
    <Link
      to={to}
      className={`block p-6 rounded-2xl border bg-card transition-colors ${
        highlight ? "border-accent" : "border-border hover:border-primary"
      }`}
    >
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="mt-2 font-display text-4xl font-semibold text-ink">
        {value === null ? "–" : value}
      </p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </Link>
  );
}
