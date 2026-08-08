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
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    setMatch(null);
    setAiAnalysis(null);
    setAiLoading(true);
    setError("");

    api
      .getMatchById(matchId)
      .then((data) => {
        setMatch(data);
        api.getMatchAiAnalysis(matchId)
          .then((aiData) => {
            setAiAnalysis(aiData);
            setAiLoading(false);
          })
          .catch((err) => {
            console.error("AI Analysis failed:", err);
            setAiLoading(false);
          });
      })
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

      {aiLoading ? (
        <div className="mt-8 p-6 rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/20 via-purple-50/10 to-pink-50/20 shadow-sm animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8.5 h-8 rounded-lg bg-indigo-200/50"></div>
            <div className="w-36 h-5 rounded bg-indigo-200/50"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-indigo-100/60 rounded w-full"></div>
            <div className="h-4 bg-indigo-100/60 rounded w-5/6"></div>
            <div className="h-4 bg-indigo-100/60 rounded w-2/3 mt-6"></div>
            <div className="h-4 bg-indigo-100/60 rounded w-4/5"></div>
          </div>
        </div>
      ) : (
        <div className="mt-8 p-6 rounded-2xl border border-indigo-100/60 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 shadow-sm backdrop-blur-sm transition-all duration-500 ease-in-out hover:shadow-md hover:border-indigo-200/60">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">
              AI Roommate Insights
            </h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-mono text-indigo-500 font-bold uppercase tracking-wider mb-1.5">
                About {match.user.name}
              </h4>
              <p className="text-slate-700 leading-relaxed text-sm">
                {aiAnalysis?.custom_description}
              </p>
            </div>
            
            <div className="pt-4 border-t border-indigo-100/30">
              <h4 className="text-xs font-mono text-purple-500 font-bold uppercase tracking-wider mb-1.5">
                Why they are a perfect fit
              </h4>
              <p className="text-slate-700 leading-relaxed text-sm">
                {aiAnalysis?.match_reason}
              </p>
            </div>
          </div>
        </div>
      )}

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
