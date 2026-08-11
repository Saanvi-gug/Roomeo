import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../api/mockApi";
import CompatibilityRing from "../components/CompatibilityRing";
import { SCORED_FIELDS } from "../data/mockData";

export default function MatchDetail() {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestStatus, setRequestStatus] = useState("idle");
  // idle | sending | sent

  useEffect(() => {
    setError("");
    setMatch(null);

    api
      .getMatchById(matchId)
      .then(setMatch)
      .catch((err) => {
        setError(err.message || "This match could not be found.");
      });
  }, [matchId]);

  const handleSendRequest = async () => {
    if (requestStatus === "sending" || requestStatus === "sent") {
      return;
    }

    setRequestError("");
    setRequestStatus("sending");

    try {
      await api.sendRequest(matchId);
      setRequestStatus("sent");
    } catch (err) {
      setRequestStatus("idle");

      if (err.code === "REQUEST_ALREADY_SENT") {
        setRequestStatus("sent");
        return;
      }

      setRequestError(
        err.message || "We couldn't send your request. Please try again."
      );
    }
  };

  if (error) {
    return <MatchErrorState message={error} />;
  }

  if (!match) {
    return <MatchDetailLoading />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/matches"
        className="text-sm font-medium text-muted transition-colors hover:text-primary"
      >
        ← Back to matches
      </Link>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
          <CompatibilityRing
            score={match.score}
            size={100}
            strokeWidth={8}
          />

          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold text-ink">
              {match.user.name}
            </h1>

            <p className="mt-2 text-muted">
              {match.user.locality}, {match.user.city}
            </p>

            <p className="mt-1 text-muted">
              ₹{match.user.budget.toLocaleString("en-IN")}/month
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {match.user.jobStatus}
              </span>

              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {match.user.schedule}
              </span>

              {match.user.workMode && (
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                  {match.user.workMode}
                </span>
              )}
            </div>

            {/* Contact information intentionally stays hidden until
                both users accept the request. */}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold text-ink">
          Compatibility breakdown
        </h2>

        <p className="mt-2 text-sm text-muted">
          Priority preferences receive extra weight in the overall score.
        </p>

        <div className="mt-6 space-y-4">
          {SCORED_FIELDS.map((field) => {
            const rawValue = match.breakdown?.[field.key];
            const value =
              typeof rawValue === "number"
                ? Math.min(Math.max(rawValue, 0), 100)
                : 0;

            const isPriority =
              match.priorityFields?.includes(field.key) ?? false;

            return (
              <div key={field.key}>
                <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                  <span className="font-medium text-ink">
                    {field.label}

                    {isPriority && (
                      <span className="ml-2 whitespace-nowrap font-mono text-xs uppercase text-accent">
                        Priority
                      </span>
                    )}
                  </span>

                  <span className="font-mono text-muted">
                    {value}%
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-label={`${field.label}: ${value}%`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={value}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPriority ? "bg-accent" : "bg-primary"
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        {requestError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-accent/30 bg-card px-4 py-3 text-sm text-accent"
          >
            {requestError}
          </div>
        )}

        {requestStatus === "sent" ? (
          <div className="rounded-2xl border border-primary/30 bg-primary-light p-5">
            <h2 className="font-display text-lg font-semibold text-primary-dark">
              Request sent
            </h2>

            <p className="mt-1 text-sm text-primary-dark">
              You'll be notified if {match.user.name} accepts. Contact
              information will remain hidden until then.
            </p>

            <Link
              to="/requests"
              className="mt-4 inline-flex text-sm font-medium text-primary-dark underline underline-offset-4"
            >
              View your requests
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={requestStatus === "sending"}
            className="w-full rounded-full bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {requestStatus === "sending"
              ? "Sending…"
              : "Send connection request"}
          </button>
        )}
      </section>
    </div>
  );
}

function MatchDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="h-4 w-32 animate-pulse rounded bg-border" />

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex animate-pulse flex-col items-center gap-5 sm:flex-row">
          <div className="h-24 w-24 rounded-full bg-border" />

          <div className="w-full flex-1">
            <div className="mx-auto h-8 w-44 rounded bg-border sm:mx-0" />
            <div className="mx-auto mt-3 h-4 w-56 max-w-full rounded bg-border sm:mx-0" />
            <div className="mx-auto mt-2 h-4 w-36 rounded bg-border sm:mx-0" />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="h-6 w-56 animate-pulse rounded bg-border" />

        <div className="mt-6 space-y-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-36 rounded bg-border" />
                <div className="h-4 w-10 rounded bg-border" />
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchErrorState({ message }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="rounded-2xl border border-accent/30 bg-card p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Match unavailable
        </h1>

        <p className="mt-2 text-sm text-accent">
          {message}
        </p>

        <Link
          to="/matches"
          className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Back to matches
        </Link>
      </div>
    </div>
  );
}