import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../api/mockApi";
import CompatibilityRing from "../components/CompatibilityRing";
import { SCORED_FIELDS } from "../data/mockData";

export default function MatchDetail() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState("idle"); // idle | sending | sent

  useEffect(() => {
    api
      .getMatchById(matchId)
      .then(setMatch)
      .catch((err) => setError(err.message));
  }, [matchId]);

  const handleSendRequest = async () => {
    setRequestStatus("sending");
    await api.sendRequest(matchId);
    setRequestStatus("sent");
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-accent">{error}</p>
        <Link to="/matches" className="text-primary text-sm font-medium">
          ← Back to matches
        </Link>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-muted">Loading match…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/matches" className="text-sm text-muted hover:text-primary">
        ← Back to matches
      </Link>

      <div className="mt-6 flex items-center gap-6">
        <CompatibilityRing score={match.score} size={100} />
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{match.user.name}</h1>
          <p className="mt-1 text-muted">
            {match.user.locality}, {match.user.city} · ₹{match.user.budget.toLocaleString("en-IN")}/mo
          </p>
          {/* Deliberately no email/phone anywhere on this page - contact info
              only exists on the Requests page, and only after acceptance. */}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Compatibility breakdown</h2>
        <div className="mt-4 space-y-3">
          {SCORED_FIELDS.map((field) => {
            const value = match.breakdown[field.key];
            const isPriority = match.priorityFields.includes(field.key);
            return (
              <div key={field.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-ink">
                    {field.label}
                    {isPriority && (
                      <span className="ml-2 text-xs font-mono text-accent uppercase">
                        priority
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-muted">{value}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPriority ? "bg-accent" : "bg-primary"}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        {requestStatus === "sent" ? (
          <p className="px-5 py-3 rounded-full bg-primary-light text-primary-dark font-medium inline-block">
            Request sent — you'll be notified if they accept.
          </p>
        ) : (
          <button
            onClick={handleSendRequest}
            disabled={requestStatus === "sending"}
            className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {requestStatus === "sending" ? "Sending…" : "Send connection request"}
          </button>
        )}
      </div>
    </div>
  );
}
